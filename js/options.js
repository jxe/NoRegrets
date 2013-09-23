var bgPage = chrome.extension.getBackgroundPage();

function refreshOptionsTab()
{
    fillDateSelect();
    fillSelectSite($('#site_to_delete')[0]);
    loadOptions();
}

function loadOptions()    //showing loaded options on page elements
{
    var options = getOptions();
    document.getElementById("history_size").value = Number(options.history_size);
    document.getElementById("idle_time").value = Number(options.idle_time);
    document.getElementById("week_start").value = options.week_start;
    document.getElementById("default_popup_action").value = options.default_popup_action;
    document.getElementById("date_format").value = options.date_format;
    document.getElementById("show_icon_text").checked = options.show_icon_text;
    document.getElementById("show_uncategorized").checked = options.show_uncategorized;
    document.getElementById("hidden_domains").value = options.hidden_domains.join(', ');
    document.getElementById("more_than_2_levels_domains").value = options.more_than_2_levels_domains.join(', ');

    fillSelectCategoryDelete();
    setAllTextareasHeight();
    renderStats();
    renderUpdateNotify();
}

function fillSelectCategoryDelete()
{
    fillSelectCategory($('#category_to_delete')[0]);
}

function setTextareaHeight(id)
{
    $('#' + id).css('height', Math.ceil($('#' + id).val().length / 180 + 1)  + 'em');
}

function setAllTextareasHeight()
{
    var items = ["hidden_domains", "more_than_2_levels_domains"], i;
    for (i in items)
    {
        setTextareaHeight(items[i]);
    }
}

function saveOptions(options)
{
    storage_set('options', options);

    //getting backpage link to update their options
    var backPage = chrome.extension.getBackgroundPage();
    backPage.options = options;

    notifySaved();
}

function setChecked(input)
{
    var options = getOptions();
    options[input.id] = input.checked;

    saveOptions(options);
}

function setHistory()
{
    if(confirm('Are you sure you want to change you history range? All data outside of this range will be deleted.')){
        
        var options = getOptions();
    
        var h_size = Number( document.getElementById("history_size").value ).toFixed(0);
        h_size = Math.max(h_size, 0);
        if (!isNaN(h_size)) options.history_size = h_size;
    
        document.getElementById("history_size").value = h_size;
    
        saveOptions(options);
        
    }else{
        window.location.reload();
    }
}

function setValue(id)
{
    var options = getOptions();
    options[id] = document.getElementById(id).value;
    saveOptions(options);
}

function setValueArray(id)
{
    var options = getOptions();
    var items = document.getElementById(id).value.split(',');
    var i;

    for (i in items)
    {
        items[i] = $.trim(items[i]);
    }

    items = getUnique(items);
    options[id] = items;
    saveOptions(options);

    $('#' + id).val(items.join(', '));
    setTextareaHeight(id);
}

function setIdle()
{
    var options = getOptions();

    var idle_time = Number( document.getElementById("idle_time").value ).toFixed(0);
    idle_time = Math.max(idle_time, 15);
    if (!isNaN(idle_time)) options.idle_time = idle_time;

    document.getElementById("idle_time").value = idle_time;

    saveOptions(options);
}

function deleteDate()
{
    var date = document.getElementById("date_to_delete").value;
    var options = getOptions();
    var dateObject = getDateObject(date);
    var dateText = getFormatedDate(dateObject, options.date_format);
    
    if (confirm(chrome.i18n.getMessage("delete_date_confirm", dateText)))
    {
        var visits = getVisits();
        delete visits[date];
        setVisits(visits);
        
        fillDateSelect();

        // deleted date is today
        if (date == getFormatedDate())
        {
            var backPage = chrome.extension.getBackgroundPage();
            backPage.today = {}; //clean today statistics in backpage
        }

        notify(chrome.i18n.getMessage("date_removed", dateText));
    }
}

function deleteSite()
{
    var site = document.getElementById("site_to_delete").value;

    if ( confirm(chrome.i18n.getMessage("delete_site_confirm", site)) )
    {
        handleDeleteSite(site);
    }
}

function handleDeleteSite(site)
{
    deleteSiteStats(site);
    removeSiteFromCategories(site);

    notify(chrome.i18n.getMessage("site_removed", site));
    updateData();
    fillSelectSite($('#site_to_delete')[0]);
}

function deleteSiteStats(site)
{
    var visits = getVisits();
    var today = getDateToday();
    var updateToday = false;
    var date;

    for (date in visits)
    {
        if (visits[date][site])
        {
            delete visits[date][site];
            updateToday = updateToday || date == today;
        }
    }
    
    setVisits(visits);
    
    if (updateToday == true)
    {
        var backPage = chrome.extension.getBackgroundPage();
        backPage.today = visits[today];
    }
}

function removeSiteFromCategories(domain)
{
    var options = getOptions();
    var catNew, j, k, found = false;
    for (j in options.categories)
    {
        category = options.categories[j];
        catNew = [];
        for (k in category)
        {
            if (category[k] != domain)
            {
                catNew.push(category[k]);
            }
            else
            {
                found = true;
            }
        }

        if (found == true)
        {
            options.categories[j] = catNew;
            saveOptions(options);
            return;
        }
    }
}

function restoreDefaults()
{
    if (confirm(chrome.i18n.getMessage("restore_defaults_confirm")))
    {
        var options = getDefaultOptions();
        saveOptions(options);
        location.reload();
    }
}

function clearLocalStorage()
{
    if ( confirm(chrome.i18n.getMessage("clear_all_confirm")) )
    {
        storage_set('visits', {});

        var backPage = chrome.extension.getBackgroundPage();
        //clearing today options in backPage
        backPage.today={};
        backPage.write();

        refreshOptionsTab();

        notify(chrome.i18n.getMessage("clear_all_success"));
    }
}

function clearCategory()
{
    var category = document.getElementById('category_to_delete').value;
    var categoryName = getCategoryName(category);

    if ( confirm(chrome.i18n.getMessage("clear_category_confirm", categoryName)) )
    {
        var options = getOptions();
        var c, d;
        for (c in options.categories)
        {
            if (c == category)
            {
                for (d in options.categories[c])
                {
                    deleteSiteStats(options.categories[c][d]);
                }
            }
        }

        refreshOptionsTab();

        notify(chrome.i18n.getMessage("category_stats_removed", categoryName));
    }
}

function getNotification()
{
    var msg = arguments[0];
    var css = '';
    if (arguments.length > 1 && arguments[1] != undefined)
    {
        css = ' ' + arguments[1];
    }

    return '<div class="notification' + css + '" title="' + chrome.i18n.getMessage('click_to_dismiss') + '">' +  msg + '</div>';
}

var timeout;
function notify(msg)
{
    clearTimeout(timeout);

    $('#detail .notification').remove();
    $('#detail').append(getNotification(msg));
    var left = (window.innerWidth - $("#detail .notification").width()) / 2;
    
    $("#detail .notification").css('left', left + 'px');
    $("#detail .notification").fadeIn("normal", function() {
        timeout = setTimeout(function() { $("#detail .notification").fadeOut("normal", function() { $(this).remove(); }); }, 3000);
    });

    updateData();
}


function notifySaved()
{
    notify(chrome.i18n.getMessage("options_saved"));    
}

function fillDateSelect()
{
    //creating string array with dates
    var dateStrings = getDateStrings();

    var options = getOptions();
    var text, date, i;
    
    var dateSelector = document.getElementById("date_to_delete");
    dateSelector.length = 0;
    
    for (i in dateStrings)
    {
        date = getDateObject(dateStrings[i]);
        text = getFormatedDate(date, options.date_format);
        dateSelector.options[dateSelector.options.length] = new Option(text, dateStrings[i]);
    }
}

function getPref(name)
{
    var value = storage_get(name);
    if(value == 'false')
        return false;
    else
        return value;
}

function setPref(name,value)
{
    storage_set(name, value);
}

function setStats()
{
    if (getPref('stats'))
    {
        setPref('stats',false);
        document.getElementById('stats_check').removeAttribute('checked');
    }
    else
    {
        setPref('stats',true);
        document.getElementById('stats_check').setAttribute('checked');
    }

    notifySaved();
}

function renderStats()
{
    if (getPref('stats'))
    {
        document.getElementById('stats_check').setAttribute('checked','checked');
    }
}

function setUpdateNotify()
{
    if (getPref('update_notify_active'))
    {
        setPref('update_notify_active',false);
        document.getElementById('update_notify_check').removeAttribute('checked');
    }
    else
    {
        setPref('update_notify_active',true);
        document.getElementById('update_notify_check').setAttribute('checked');
    }

    notifySaved();
}

function renderUpdateNotify()
{
    if (getPref('update_notify_active'))
    {
        document.getElementById('update_notify_check').setAttribute('checked','checked');
    }
}


function exportStats()
{
    var i, len, date, dateStats, domain, time;
    var text = chrome.i18n.getMessage('Day') + ';' + chrome.i18n.getMessage('Domain') + ';' + chrome.i18n.getMessage('Time') + "\n";

    var dateStrings = getDateStrings();
    var visits = getVisits();
    
    for (i = 0, len = dateStrings.length; i < len; i++)
    {
        date = dateStrings[i];
        dateStats = visits[date];
        for (domain in dateStats)
        {
            time = dateStats[domain];
            text += date + ';' + domain + ';' + time + "\n";
        }
    }

    var bb = new BlobBuilder([text], { "type" : "text\/csv" });
    saveAs(bb, "export.csv");
}

// NEWS
function renderActualNews(){
    var actual_news = {
        n01:{text:'Discover all new features in latest TimeStats.',url:'http://www.wips.com/news/detail/66/what-s-new-in-timestats'},
        n02:{text:'Read how you can submit new ideas for this extension here.',url:'http://www.wips.com/news/detail/63/submit-new-idea-with-a-5-star-review'}
    }
    var news_showed = getPref('news_showed');
    if(!news_showed){
        news_showed = {};
        setPref('news_showed',{});
    }
    var newsElm = $('#info_news').html('');
    var titleAdded = false;
    for(var id in actual_news){
        if(!news_showed[id]){
            if(!titleAdded){
                newsElm.append('<strong class="title">News</strong>');
                titleAdded = true;
            }
            var item = $('<div class="item" rel="'+id+'"></div>');
            item.append(
                $('<span class="link">'+actual_news[id].text+'</span>').click(function(){
                    var rel = $(this).parent().attr('rel');
                    var temp_news_showed = getPref('news_showed');
                    temp_news_showed[rel] = true;
                    setPref('news_showed',temp_news_showed);
                    renderActualNews();
                    window.open(actual_news[rel].url,'_blank');
                })
            );
            item.append(
                $('<span class="close">X</span>').click(function(){
                    var rel = $(this).parent().attr('rel');
                    var temp_news_showed = getPref('news_showed');
                    temp_news_showed[rel] = true;
                    setPref('news_showed',temp_news_showed);
                    renderActualNews();
                })
            );
            newsElm.append(item);
        }
    }
}

/* BADGES */

/*var bagdesPref;

function renderBadgesList(){
    $('#badges_detail').css('display','none').html('');
    var badges_list = $('#badges_list');
    badges_list.css('display','block').html('');
    for(var id in badgesData){
        var bd = badgesData[id];
        var bp = bagdesPref[id];
        if(bd['public'] || bp){
            var item = $('<div class="item"></item>');
            badges_list.append(item);
            var src = 'default';
            if(bp){
                item.attr('id',id).addClass('active').click(function(){
                    renderBadgesDetail($(this).attr('id'));
                });
                src = id;
            }
            var image = $('<div class="image"></div>');
            item.append(image);
            image.append($('<img src="images/badges/' + src + '.png" alt="" />'));
            if(bp && bp.level){
                image.append($('<span class="level">' + bp.level + '</span>'));
            }
            var content = $('<div class="content"></div>');
            item.append(content);
            content.append($('<span class="title">' + bd.title + '</span>'));
            if(bp && bp.time){
                var timePom = new Date(bp.time);
                var time = timePom.getDate()+'.'+(timePom.getMonth()-(-1)).toString()+'.'+timePom.getFullYear()+' '+timePom.getHours()+':'+timePom.getMinutes();
                content.append($('<span class="time">' + time + '</span>'));
            }
        }
    }
    badges_list.append($('<div class="clear"></div>'));
}

function renderBadgesDetail(id){
    $('#badges_list').css('display','none').html('');
    var badges_detail = $('#badges_detail');
    badges_detail.css('display','block').html('');
    var badge = badgesData[id];
    var badgePref = bagdesPref[id];
    var left = $('<div class="left"></div>');
    left.attr('id',id);
    badges_detail.append(left);
    left.append($('<img src="images/badges/' + id + '.png" alt="" />'));
    if(badgePref.level){
        left.append($('<span class="level">' + badgePref.level + '</span>'));
    }
    var right = $('<div class="right"></div>');
    badges_detail.append(right);
    right.append($('<span class="title">' + badge.title + '</span>'));
    var timePom = new Date(badgePref.time);
    var time = timePom.getDate()+'.'+(timePom.getMonth()-(-1)).toString()+'.'+timePom.getFullYear()+' '+timePom.getHours()+':'+timePom.getMinutes();
    right.append($('<span class="time">' + time + '</span>'));
    right.append($('<span class="desc">' + badge.desc + '</span>'));
    badges_detail.append($('<div class="clear"></div>'));
    var back = $('<span class="back">&laquo; Back to badges list</span>');
    back.click(function(){
        renderBadgesList();
    });
    badges_detail.append(back);
}*/

function loader(show){
    var loader = $('.loader');
    if(show){
        loader.removeClass('none');
    }else{
        loader.addClass('none');
    }
}

$(function() {
    var backPage = chrome.extension.getBackgroundPage();
    backPage.write();//saving current state in localStorage

    refreshOptionsTab();

    $('#close').click(function(e) {
        window.close();
    });

    $('#deleteDate,#deleteSite,#clearCategory,#clearLocalStorage,#restoreDefaults,#exportStats').click(function(e) {
        e.preventDefault();
        window[$(this).attr('id')]();
    });

    $('a.credits').click(function() {
        return !window.open(this.href);
    });

    $('#history_size').on('change', function() {
        setHistory();
    });

    $('#idle_time').on('change', function() {
        setIdle();
    });

    $('#week_start,#default_popup_action').on('change', function() {
        setValue($(this).attr('id'));
    });
    
    $('#date_format').on('change', function() {
        setValue($(this).attr('id'));
        removeDatepicker();
        fillSelectDate();
        fillDateSelect();
        updateData();
    });

    $('#hidden_domains,#more_than_2_levels_domains').on('change', function() {
        setValueArray($(this).attr('id'));
    });

    $('#show_icon_text,#show_uncategorized').on('change', function() {
        setChecked(this);
    });

    $('#stats_check').on('change', function() {
        setStats();
    });
    
    $('#update_notify_check').on('change', function() {
        setUpdateNotify();
    });

    $('.notification').live('click', function(e) {
        e.preventDefault();
        $(this).fadeOut(function() { $(this).remove() });
    });
    
    // NEWS
    renderActualNews();
    
    // visitet stats - tooltip on legend
    $('.legend_hover').live('hover',function(){
        renderPieTooltip('.chart_all',$(this).attr('rel'));
    });
    
    // visitet stats - icon to detail graph
    $('.legend_stats').live('click',function(){
        var rel = $(this).attr('rel');
        if($('#siteSelectId').val() == null){
            fillSelectSite();
        }
        $('#siteSelectId').val(rel);
        $('#category_sites').trigger('click');
    });
    
    
});