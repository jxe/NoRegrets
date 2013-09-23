var bgPage = chrome.extension.getBackgroundPage();

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

function drawChart(stats)
{
    var selector = '#chart';
    stats = sortObj(stats);
    var data = getPieData(stats);
    $(selector).removeClass('loading');

    var originalHeight = $(selector).height();
    $(selector).height('200');
    drawPieChart(selector, data);
    $(selector).height(originalHeight);
}

function handleLink(e, obj)
{
    e.preventDefault();
    var url = 'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/' + $(obj).attr('href');
    openTabOnce(url);
    window.close();
}

var webstoreUrl = "https://chrome.google.com/webstore/detail/" + getExtensionId();

$(function() {

    // Menu
    var pageWidth = $('#pages-content li:first-child').innerWidth();
    $('#pages-content').hide();
    $('#pages').width($('#pages li').length * pageWidth);
    $('#pages li').width(pageWidth);

    $('#page-menu a[href="#"]').click(function(e){
        e.preventDefault();

        var pageName = $(this).attr('data-for');
        var pageIndex = 0;
        var callback = function() {};

        if (pageName == 'most-visited')
        {
            pageIndex = 1;

            var domains = getMostVisited();
            var table = makeTable(domains);

            $('#pages-content li:eq(' + pageIndex + ') table').html(table);
        }
        else
        {
            var stats = getStats(pageName);
            if (Object.keys(stats).length > 0)
            {
                callback = function() { drawChart(stats); };

                $('#chart').html('').addClass('loading');
            }
            else if (pageName == 'categories')
            {
                pageIndex = 3;
            }
            else
            {
                pageIndex = 2;
            }
        }
        
        setTimeout(function(){
            if(pageName == 'today'){
                $('#get_detail_stats').css('display','block').attr('href','options.html#_category_daily');
            }else if(pageName == 'yesterday' || pageName == 'last7' || pageName == 'full'){
                $('#get_detail_stats').css('display','block').attr('href','options.html#_category_visited');
            }else if(pageName == 'categories'){
                $('#get_detail_stats').css('display','block').attr('href','options.html#_category_categories');
            }else{
                $('#get_detail_stats').css('display','none');
            }
        },500);

        $('#pages li:eq(1)').html($('#pages-content li:eq(' + pageIndex + ')').html());
        $('#pages li:eq(1) h2').html($(this).html());

        if (e.isTrigger == undefined ||
            e.isTrigger == false)
        {
            $('#pages').animate({ left: -pageWidth + 'px' }, callback);
        }
        else
        {
            callback.call();
        }
    });

    $('#page-menu a[href!="#"], #share a').click(function(e) {
        handleLink(e, this);
    });

    $('.go_categories').live('click', function(e) {
        handleLink(e, this);
    });

    var options = getOptions();
    if (options.default_popup_action != 'menu')
    {
        $('#page-menu a[data-for="' + options.default_popup_action + '"]').trigger('click');
        $('#pages').css({ left: -pageWidth + 'px' });
    }

    $('.go-to-menu').live('click', function(e) {
        e.preventDefault();
        $('#get_detail_stats').css('display','none')
        $('#pages').animate({ left: '0px' });
    });

    $('.open_options_page').click(function(){
        window.open('options.html#_options','_blank');
    });
    $('.open_options_page_dash').click(function(){
        window.open('options.html#_dashboard','_blank');
    });
    $('.open_options_page_reports').click(function(){
        window.open('options.html#_category_reports','_blank');
    });
    $('.open_options_page_alarm').click(function(){
        window.open('options.html#_category_alarm','_blank');
    });
    $('.open_options_page_categ').live('click',function(){
        window.open('options.html#_categories','_blank');
    });
    
    if(!getPref('fb_share_ok') && !getPref('popup_fb_connect_noshow')){
        $('#foot_fb_connect').css('display','block');
        $('#foot_fb_connect .connect').click(function(){
            bgPage.wips.shareFbFromPopup();
        });
        $('#foot_fb_connect .close').click(function(){
            setPref('popup_fb_connect_noshow',true);
            $('#foot_fb_connect').fadeOut(300);
        });
    }
    
    $('#share .news').click(function(){
        window.open('http://www.wips.com/news/detail/66/what-s-new-in-timestats?utm_campaign=time-stats&utm_medium=whats-new&utm_source=pop-up','_blank');
    });
    
    // SHARE
    setTimeout(function(){
        socialStart();
    },1);
    
    if(!getPref('fb_share_ok') && !getPref('popup_first_connect')){
        setPref('popup_first_connect',true);
        $('#first_connect').css('display','block');
        $('#first_connect .connect').click(function(){
            bgPage.wips.shareFbFromPopup();
        });
        $('#first_connect .close').click(function(){
            $('#first_connect').slideUp(400);
        });
    }
    
    if(getPref('fb_share_ok')){
        $('.only_show_fb_share_ok').css('display','block');
    }
    
});