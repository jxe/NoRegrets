var dataAll, dataDomains, dataTime, dataDays, dataMonths, dataMonthsAvg, dataDaysAvg,
    daysAvg, weeksAvg, monthsAvg;

function updateData()
{
    updateDateRange();
    diapazonStats = getDiapazonStats(startDate, endDate);
    sortedHash = sortAssoc(diapazonStats);
    visitedDomains = getSortedSites(diapazonStats);

    dataAll = updateDataAll();
    dataDomains = updateDataDomains();
    dataTime = updateDataTime();
    dataDays = updateDataDays();
    dataMonths = updateDataMonths();
    dataDaysAvg = updateDataDaysAverage();
    dataMonthsAvg = updateDataMonthsAverage();
    daysAvg = updateDataDaysAvg();
    weeksAvg = updateDataWeeksAvg();
    monthsAvg = updateDataMonthsAvg();
}

function updateDataDaysAvg() {
    var start = getDateObject(startDate);
    var end = getDateObject(endDate);

    var len = getDifferenceDays(start, end);
    var visits = getVisits();

    var dayTime = 0, days = [], dateObject = start, data = [];
    var date, domain, i, value;

    for (i = 0; i <= len; i++)
    {
        date = getFormatedDate(dateObject);
        dateObject.setTime(dateObject.getTime() + 24 * 60 * 60 * 1000);

        if (visits[date] != undefined)
        {
            for (domain in visits[date])
            {
                dayTime += Number(visits[date][domain]);
            }
        }
    }

    return (len != 0  ? (dayTime / len) : dayTime);
}

function updateDataWeeksAvg() {
    var startDateA = $.datepicker.parseDate('yy-mm-dd', startDate);
    var endDateA = $.datepicker.parseDate('yy-mm-dd', endDate);
    var numOfWeek = (endDateA.getTime() - startDateA.getTime()) /  (1000 * 60 * 60 * 24 * 7);
    var totalTime = 0;
    var visits = getVisits();
    for (var date in visits){
        for (var domain in visits[date]){
            totalTime += parseInt(visits[date][domain]);
        }
    }
    return Math.ceil(totalTime/numOfWeek);
    /*var amountOfWeeks = getWeeksBetween(startDateA, endDateA);
    amountOfWeeks = (amountOfWeeks != 0 ? amountOfWeeks : 1);
    return updateDataDaysAvg() / amountOfWeeks;*/
}

function updateDataMonthsAvg() {
    var startDateA = $.datepicker.parseDate('yy-mm-dd', startDate);
    var endDateA = $.datepicker.parseDate('yy-mm-dd', endDate);
    var numOfWeek = (endDateA.getTime() - startDateA.getTime()) /  (1000 * 60 * 60 * 24 * 30.5);
    var totalTime = 0;
    var visits = getVisits();
    for (var date in visits){
        for (var domain in visits[date]){
            totalTime += parseInt(visits[date][domain]);
        }
    }
    return Math.ceil(totalTime/numOfWeek);
    /*var amountOfMonths = getMonthsBetween(startDateA, endDateA);
    amountOfMonths = (amountOfMonths != 0 ? amountOfMonths : 1);
    return updateDataDaysAvg() / amountOfMonths;*/
}

function getMonthsBetween(date1, date2) {
    var negPos = 1;

    if(date1.getFullYear() == date2.getFullYear()){
        return negPos * (date2.getMonth() - date1.getMonth());
    }
    else{
        var mT = 11 - date1.getMonth();
        mT += date2.getMonth() + 1;
        mT += (date2.getFullYear() - date1.getFullYear() - 1) * 12;
        return negPos * mT;
    }
}

function getWeeksBetween(date1, date2){
    // The number of milliseconds in one week
    var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);
    // Convert back to weeks and return hole weeks
    return Math.ceil(difference_ms / ONE_WEEK);
}

function getSortedSites(sites)
{
    var sorted = Object.keys(sites);
    sorted.sort();

	return sorted;
}

function updateDataAll()
{
    var stats = sortObj(diapazonStats);
    return getPieData(stats);
}

function updateDataDomains()
{
    var zones = {};
    var domain, domainNameParts, firstLevelDomain;

    for (domain in diapazonStats)
    {
        domainNameParts = domain.split('.');
        firstLevelDomain = domainNameParts[domainNameParts.length-1];

        if (isNaN(zones[firstLevelDomain]))
        {
            zones[firstLevelDomain] = 0;
        }

        zones[firstLevelDomain] += diapazonStats[domain];
    }
    zones = sortObj(zones);

    return getPieData(zones);
}

function updateDataTime()
{
    var start = getDateObject(startDate);
    var end = getDateObject(endDate);
    var len = getDifferenceDays(start, end);
    var visits = getVisits();
    
    var dayTime = 0, days = [], dateObject = start, data = [];
    var date, domain, i, value;

    for (i = 0; i <= len; i++)
    {
        date = getFormatedDate(dateObject);
        dateObject.setTime(dateObject.getTime() + 24 * 60 * 60 * 1000);

        if (visits[date] != undefined)
        {
            for (domain in visits[date])
            {
                dayTime += Number(visits[date][domain]);
            }
        }

        days.push([date, dayTime, dateObject.getTime()]);
        dayTime = 0;
    }

    for (i in days)
    {
        value = days[i];
        time = formatTime(value[1]);
        data.push([value[2], value[1], value[0], time]);
    }

    return data;
}

function updateDataDate()
{
    var options = getOptions();
    var dateObject = getDateObject($(".dateSelectId")[0].value, options.date_format);
    var date = getFormatedDate(dateObject);
    var visits = getVisits(date);
    
    if (isEmpty(visits))
    {
        return [];
    }

    return getPieData(sortObj(visits));
}

function updateDataDate2(date)
{
    var visits = getVisits(date);
    
    if (isEmpty(visits))
    {
        return [];
    }

    return getPieData(sortObj(visits));
}

function updateDataDays()
{
    var options = getOptions();
    var start = getDateObject(startDate);
    var end = getDateObject(endDate);
    var len = getDifferenceDays(start, end);
    var visits = getVisits();
    
    var dayTime = 0, days = [0,0,0,0,0,0,0], dateObject = start, data = [];
    var day, i, domain, value, time;

    for (i = 0; i <= len; i++)
    {
        date = getFormatedDate(dateObject);
        day = absoluteModulo(dateObject.getDay() - parseInt(options.week_start, 10), 7);
        dateObject.setTime(dateObject.getTime() + 24 * 60 * 60 * 1000);

        if (visits[date] == undefined)
        {
            continue;
        }

        for (domain in visits[date])
        {
            dayTime += Number(visits[date][domain]);
        }

        days[day] += dayTime;
        dayTime = 0;
    }

    var xAxis = [];
    for (day in days)
    {
        value = days[day];
        time = formatTime(value);
        data.push([day, value]);
        xAxis.push([day, getShortDayName(day)]);
    }

    var dataFinalized = {
        data: data,
        xAxis: xAxis
    }

    return dataFinalized;
}

function updateDataDaysAverage() {
    var options = getOptions();
    var start = getDateObject(startDate);
    var end = getDateObject(endDate);
    var len = getDifferenceDays(start, end);
    var visits = getVisits();

    var dayTime = 0, days = [0,0,0,0,0,0,0], dateObject = start, data = [], daysAmount=[0,0,0,0,0,0,0];
    var day, i, domain, value, time;


    for (i = 0; i <= len; i++)
    {
        date = getFormatedDate(dateObject);
        day = absoluteModulo(dateObject.getDay() - parseInt(options.week_start, 10), 7);
        dateObject.setTime(dateObject.getTime() + 24 * 60 * 60 * 1000);

        if (visits[date] == undefined)
        {
            continue;
        }

        for (domain in visits[date])
        {
            dayTime += Number(visits[date][domain]);
        }

        days[day] += dayTime;
        daysAmount[day]++;
        dayTime = 0;
    }

    var xAxis = [];
    for (day in days)
    {
        value = days[day] / (daysAmount[day] == 0 ? 1 : daysAmount[day]);
        time = formatTime(value);
        data.push([day, value]);
        xAxis.push([day, getShortDayName(day)]);
    }

    var dataFinalized = {
        data: data,
        xAxis: xAxis
    }

    return dataFinalized;
}

function updateDataMonths()
{
    var i, m, dateObject, domain, days, value;
    var dayTime = 0, months = [0,0,0,0,0,0,0,0,0,0,0,0], data = [];
    var visits = getVisits();
    
    for (i in dateStrings)
    {
        date = dateStrings[i];
        dateObject = getDateObject(date);

        for (domain in visits[date])
        {
            dayTime += Number(visits[date][domain]);
        }

        m = dateObject.getMonth();
        months[m] += dayTime;

        dayTime = 0;
    }

    var xAxis = [];
    for (m in months)
    {
        value = months[m];
        time = formatTime(value);
        data.push([m, value]);
        xAxis.push([m, getShortMonthName(m)]);
    }

    var dataFinalized = {
        data: data,
        xAxis: xAxis
    }

    return dataFinalized;
}

function updateDataMonthsAverage(){
    var i, m, dateObject, domain, days, value;
    var dayTime = 0, months = [0,0,0,0,0,0,0,0,0,0,0,0], data = [], monthsCount = [0,0,0,0,0,0,0,0,0,0,0,0];
    var visits = getVisits();

    for (i in dateStrings)
    {
        date = dateStrings[i];
        dateObject = getDateObject(date);

        for (domain in visits[date])
        {
            dayTime += Number(visits[date][domain]);
        }

        m = dateObject.getMonth();
        months[m] += dayTime;
        monthsCount[m]++;

        dayTime = 0;
    }

    var xAxis = [];
    for (m in months)
    {
        value = months[m] / (monthsCount[m] == 0 ? 1 : monthsCount[m]);
        time = formatTime(value);
        data.push([m, value]);
        xAxis.push([m, getShortMonthName(m)]);
    }

    var dataFinalized = {
        data: data,
        xAxis: xAxis
    }

    return dataFinalized;
}

function drawActive()
{
    var options = getOptions();
    // dashboard
    var selector = '#dashboard_category';
    if ($(selector + ':visible').length != 0)
    {
        $(selector + ' [class^=chart_]').each(function(i) {
            handleDraw($(this).attr('class'));
        });

        var data;
        if ($(selector + ' .category_wrapper.category_busiest').length > 0)
        {
            data = busiestDays();
            $(selector + ' .category_wrapper.category_busiest table').html(data);
        }

        if ($(selector + ' .category_wrapper.category_most_visited').length > 0)
        {
            data = makeTable(getMostVisited());
            $(selector + ' .category_wrapper.category_most_visited table').html(data);
        }

        $(selector + ' .category_wrapper table').each(function() {
            if ($(this).parents('.scrollable').length == 0)
            {
                $(this).wrap('<div class="scrollable" />');
            }
        })

        if ($(selector + ' .category_wrapper .hide').length == 0)
        {
            $(selector + ' .category_wrapper').append('<a href="#" class="hide" title="' + chrome.i18n.getMessage('dashboard_hide') + '"></a>');
        }
        $(selector + ' .category_wrapper .hide').on('click', function(e) {
            e.preventDefault();
            var block = $(this).parent('.category_wrapper');
            var index = getBlockIndex($(selector + ' .category_wrapper').index(block));
            $(block).fadeOut(function() { $(this).remove(); });
            options.dashboard_items[index] = false;
            saveOptions(options);
        });

        $(selector + ' .category_wrapper h3').on('click', function(e) {
            e.preventDefault();
            var block = $(this).parent('.category_wrapper');
            var index = getBlockIndex($(selector + ' .category_wrapper').index(block)) + 1;

            var categoryName, fillFunction;
            if ($(block).hasClass('category_daily'))
            {
                categoryName = 'date';
            }
            else if ($(block).hasClass('category_sites'))
            {
                categoryName = 'site';
            }
            else if ($(block).hasClass('category_categories'))
            {
                categoryName = 'category';
                fillFunction = 'fillSelectCategoryWithAll';
            }
            if (categoryName != undefined)
            {
                var el = $('#' + categoryName + 'SelectId');
                if ($(el).val() == null)
                {
                    window[fillFunction == undefined ? ('fillSelect' + ucfirst(categoryName)) : fillFunction](el[0]);
                }
                $(el).val($(block).children('.' + categoryName + 'SelectId:first').val());
            }

            $('#left ul li a:eq(' + index + ')').trigger('click');
        });

        if ($(selector).children('.info').length == 0)
        {
            $(selector).prepend('<div style="clear:both;"></div>');
            $(selector).append('<div class="info"><p>' + chrome.i18n.getMessage('dashboard_info') + '</p><button id="restoreDashboard">' + chrome.i18n.getMessage('dashboard_restore') + '</button></div>');
        }

        printTotalTime($(selector).children('p:first'));
    }
    // single graph
    else
    {
        var i = $('#right .category').index($('#right .category:visible')) - 1;
        $('#right .enable input').attr('checked', options.dashboard_items[i] ? true : false);
        var css = $('.category:visible div[class^=chart_]').attr('class');
        if (css != undefined)
        {
            handleDraw(css);
        }
    }
}

function printTotalTime(selector)
{
    var total = arguments.length > 1 ? arguments[1] : getTotalTimeRange();
    $(selector).html(chrome.i18n.getMessage('totalBrowsingTime') + ' <strong>' + secondsToHourMinSec(total) + '</strong>');
}

function getBlockIndex(index)
{
    var options = getOptions();
    var dashboard = options.dashboard_items;
    var i;

    for (i = 0; i <= index; i++)
    {
        if (dashboard[i] == false)
        {
            index++;
        }
    }

    return index;
}

function handleDraw(css)
{
    var i;
    var expression = /^chart_/gi;

    var classes = css.split(' ');
    for (i in classes)
    {
        css = classes[i];
        if (css.match(expression))
        {
            break;
        }
    }

    $('.' + css).html('').addClass('loading');

    var name = css.replace(expression, '');
    window['drawChart' + ucfirst(name)]();
}

function drawChartAll()
{
    var selector = '.chart_all';
    removeChartClasses(selector);
    drawPieChart(selector, dataAll);
}

function drawChartDomains()
{
    var selector = '.chart_domains';
    removeChartClasses(selector);
    drawPieChart(selector, dataDomains);
}

function drawChartCategory()
{
    fillSelectCategoryWithAll();

    var selector = '.chart_category';
    var category = $(".categorySelectId")[0].value;
    var options = getOptions();
    var categories = options.categories;
    var colors = getColorList();

    var c, s, sites, data;

    if (category == 'all')
    {
        sites = getAllCategories(diapazonStats);
        if (sites.length == 0)
        {
            if ($(selector).siblings('.warning').length == 0)
            {
                $(selector).before('<p class="info warning" />');
                $(selector).siblings('.warning').text(chrome.i18n.getMessage('not_categorized'));
            }
        }
        else
        {
            $(selector).siblings('.warning').remove();
        }
    }
    else
    {
        var categoryData;

        $(selector).siblings('.warning').remove();

        for (c in categories)
        {
            if (c == category)
            {
                categoryData = getCategoryData(diapazonStats, c);
                sites = categoryData[0];
                break;
            }
        }
    }

    sites = sortObj(sites, true);
    data = getPieData(sites);

    removeChartClasses(selector);
    drawPieChart(selector, data);

    var totalTime = 0;
    for (s in sites)
    {
        totalTime += sites[s][1];
    }
    printTotalTime($('#categorySelectId').siblings('p:first'), totalTime);
}

function drawChartSite()
{
    fillSelectSite();

    var selector = '.chart_site';

    var domain = $(".siteSelectId")[0].value;

    var start = getDateObject(startDate);
    var end = getDateObject(endDate);
    var len = getDifferenceDays(start, end);
    var visits = getVisits();
    
    var sites = [], data = [], dateObject = start, dateStats = [];
    var time, i;

    for (i = 0; i <= len; i++)
    {
        date = getFormatedDate(dateObject);
        dateObject.setTime(dateObject.getTime() + 24 * 60 * 60 * 1000);

        if (visits[date] == undefined)
        {
            dateStats[domain] = 0;
        }
        else
        {
            dateStats = visits[date];

            if (isNaN(dateStats[domain]))
            {
                dateStats[domain] = 0;
            }
        }

        sites.push([date, dateStats[domain], dateObject.getTime()]);
    }

    for (i in sites)
    {
        time = formatTime(sites[i][1]);
        data.push([sites[i][2], sites[i][1], sites[i][0], time]);
    }

    removeChartClasses(selector);
    drawLineChart(selector, data);
    
    //new
    if(getPref('fb_share_ok')){
        var mostElm = $('#top_chart_site');
        mostElm.css('display','block');
        mostElm.empty().append('<strong>Most visited websites</strong><span class="clear"></span>');
        var mostUrls = getMostVisited();
        for(var i in mostUrls){
            if(i<10){
                var blokElm = $('<span rel="'+mostUrls[i][0]+'" class="blok"></span>');
                blokElm.append('<span>'+mostUrls[i][1]+'</span>'+mostUrls[i][0]);
                mostElm.append(blokElm);
                blokElm.click(function(){
                    $('#siteSelectId').val($(this).attr('rel'));
                    drawChartSite();
                });
            }
        }
    }
}

function drawChartTime()
{
    var selector = '.chart_time';
    printTotalTime($(selector).siblings('p:first'));
    removeChartClasses(selector);
    drawLineChart(selector, dataTime);
}

function drawChartDate()
{
    var selector = '.chart_date';
    var dataDate = updateDataDate();

    removeChartClasses(selector);
    drawPieChart(selector, dataDate);
}

function drawChartWeekdays()
{
    var selector = '.chart_weekdays';
    removeChartClasses(selector);
    var data = [];
    data[0] = {
        data: dataDays.data,
        xAxis: dataDays.xAxis,
        label: "Total"
    }
    data[1] = {
        data: dataDaysAvg.data,
        xAxis: dataDaysAvg.xAxis,
        label: "Average"
    }
    drawLineTwoAxisChart(selector, data);
}

function drawChartMonths()
{
    var selector = '.chart_months';
    removeChartClasses(selector);
    var data = [];
    data[0] = {
        data: dataMonths.data,
        xAxis: dataMonths.xAxis,
        label: "Total"
    }
    data[1] = {
        data: dataMonthsAvg.data,
        xAxis: dataMonthsAvg.xAxis,
        label: "Average"
    }
    drawLineTwoAxisChart(selector, data);
}

function getDayName(day)
{
    var shortSuffix = arguments.length > 1 && arguments[1] == true ? '_short' : '';
    var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var options = getOptions();
    day = absoluteModulo(parseInt(day, 10) + parseInt(options.week_start, 10), 7);

    return chrome.i18n.getMessage(names[day] + shortSuffix);
}

function getShortDayName(day)
{
    return getDayName(day, true);
}

function getMonthName(month)
{
    var shortSuffix = arguments.length > 1 && arguments[1] == true ? '_short' : '';
    var names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    month = parseInt(month, 10);
    return chrome.i18n.getMessage(names[month] + shortSuffix);
}

function getShortMonthName(month)
{
    return getMonthName(month, true);
}

function getDatepickerOptions()
{
    var options = getOptions();
    var months = [], monthsShort = [], i, name;

    for (i = 0; i < 12; i++)
    {
        name = getMonthName(i);
        months.push(name);
        monthsShort.push(name.substring(0,3));
    }
    
    var start = getDateObject(dateStrings[0]);
    var minDate = getFormatedDate(start, options.date_format);
    var end = getDateObject(dateStrings[dateStrings.length - 1]);
    var maxDate = getFormatedDate(end, options.date_format);

    var datepickerOptions = {
        firstDay: options.week_start,
        monthNames: months,
        monthNamesShort: monthsShort,
        prevText: chrome.i18n.getMessage('prev'),
        nextText: chrome.i18n.getMessage('next'),
        dateFormat: options.date_format,
        minDate: minDate,
        maxDate: maxDate
    };

    return datepickerOptions;
}

function removeDatepicker()
{
    $('.datepicker, #dateStartSelect, #dateEndSelect, .dateSelectId, dashboard_category .datepicker').datepicker("destroy");
}

function fillSelectDate()
{
    var options = getOptions();

    var startObject = getDateObject(dateStrings[0]);
    var start = getFormatedDate(startObject, options.date_format);
    var endObject = getDateObject(dateStrings[dateStrings.length - 1]);
    var end = getFormatedDate(endObject, options.date_format);
    
    $('.datepicker').datepicker(getDatepickerOptions());
    $('#dateStartSelect').datepicker('setDate', start);
    $('#dateEndSelect, .dateSelectId').datepicker('setDate', end);
}

function fillSelectSite()
{
    var show_only_uncategorized = arguments.length > 1 && arguments[1] == true;

    var select = arguments.length == 0 ? $(".siteSelectId")[0]
                                       : arguments[0];

    var options = getOptions(), domains = [];
    var c, s, category;

    for (c in options.categories)
    {
        if (c != 'other' &&
            show_only_uncategorized == true)
        {
            continue;
        }

        category = options.categories[c];
        for (s in category)
        {
            domains.push(category[s]);
        }
    }

    if (show_only_uncategorized == false)
    {
        if (select == document.getElementById('siteSelectIdOptions'))
        {
            $('#categoriesWrapper:hidden').show();
            $('#sitesAllCategorized:visible').hide();
        }
    }
    else if (domains.length == 0)
    {
        $('#categoriesWrapper:visible').hide();
        $('#sitesAllCategorized:hidden').show();
    }
    else
    {
        $('#categoriesWrapper:hidden').show();
        $('#sitesAllCategorized:visible').hide();
    }

    domains.sort();

    if (domains == undefined)
    {
        return;
    }

    var domainsLength = Object.keys(domains).length;

    if (select.options.length != domainsLength)
    {
        $(select).html('');

        var domain, d;
        for (d in domains)
        {
            domain = domains[d];
            select.options[select.options.length] = new Option(domain, domain);
        }
    }
}

function fillSelectSiteManagement()
{
    fillSelectSite(document.getElementById('siteSelectIdOptions'), $('#categoryUncategorizedOnly:checked').length > 0);
    updateSiteCategory();
}

function updateSiteCategory()
{
    var c, s, category;
    var options = getOptions();
    var site = $('#siteSelectIdOptions').val();

    for (c in options.categories)
    {
        category = options.categories[c];
        for (s in category)
        {
            if (category[s] == site)
            {
                $('#siteCategory').val(c);
                return;
            }
        }
    }
}

function saveSiteCategory()
{
    var c, s, cat, catNew;
    var options = getOptions();
    var site = $('#siteSelectIdOptions').val();
    var category = $('#siteCategory').val();

    for (c in options.categories)
    {
        cat = options.categories[c];
        catNew = [];
        for (s in cat)
        {
            if (cat[s] != site)
            {
                catNew.push(cat[s]);
            }
        }
        if (category == c)
        {
            catNew.push(site);
        }
        options.categories[c] = catNew;
    }

    saveOptions(options);
}

function fillSelectCategoryWithAll()
{
    var el = arguments.length == 0 ? $(".categorySelectId")[0] : arguments[0];
    fillSelectCategory(el, true, true);
}

function fillSelectCategory()
{
    var dont_show_other = arguments.length > 1 && arguments[1] == false;
    var show_all_categories = arguments.length > 2 && arguments[2] == true;

    var options = getOptions();
    var categories = Object.keys(options.categories);
    var select = arguments.length == 0 ? $(".categorySelectId")[0]
                                       : arguments[0];
    var categoryLength = categories.length - (dont_show_other ? 1 : 0) + (show_all_categories ? 1 : 0);

    if (select.options.length != categoryLength)
    {
        $(select).html('');

        var key, c;
        var translated = [];
        var keys = {};
        for (c in categories)
        {
            key = categories[c];
            if (key == 'other' &&
                dont_show_other == true)
            {
                continue;
            }
            value = getCategoryName(key);
            keys[value] = key;
            translated.push(value);
        }
        translated.sort(caseInsensitiveSort);

        if (show_all_categories == true)
        {
            key = 'all';
            value = chrome.i18n.getMessage('category_translation_' + key);
            keys[value] = key;
            translated.unshift(value);
        }

        for (c in translated)
        {
            category = translated[c];
            select.options[select.options.length] = new Option(category, keys[category]);
        }
    }
}

function fillSelectCategoryManagement()
{
    fillSelectCategory(document.getElementById('categorySelectIdOptions'), false);
    toggleRenameButton();
    fillSelectCategory(document.getElementById('siteCategory'));
}

function startSelectUpdate()
{
    updateDateRange();
    if (getDateObject(startDate) > getDateObject(endDate))
    {
        startDate = endDate;
        var options = getOptions();
        $("#dateStartSelect").val(getFormatedDate(startDate, options.date_format));
    }
}

function endSelectUpdate()
{
    updateDateRange();
    if (getDateObject(startDate) > getDateObject(endDate))
    {
        endDate = startDate;
        var options = getOptions();
        $("#dateEndSelect").val(getFormatedDate(endDate, options.date_format));
    }
}

function updateDateRange()
{
    var options = getOptions();
    
    var start = $("#dateStartSelect").val();
    start = checkDateBounds(start);
    $("#dateStartSelect").val(start);
    
    var startDateObject = getDateObject(start, options.date_format);
    startDate = getFormatedDate(startDateObject);

    var end = document.getElementById("dateEndSelect").value;
    end = checkDateBounds(end);
    $("#dateEndSelect").val(end);
    
    var endDateObject = getDateObject(end, options.date_format);
    endDate = getFormatedDate(endDateObject);
}

function checkDateBounds(text)
{
    var minDate = dateStrings[0];
    var minDateObj = getDateObject(minDate);
    var maxDate = dateStrings[dateStrings.length - 1];
    var maxDateObj = getDateObject(maxDate);
    
    var options = getOptions();
    var date = getDateObject(text, options.date_format);

    if (date > maxDateObj)
    {
        text = getFormatedDate(maxDateObj, options.date_format);
    }
    else if (date < minDateObj)
    {
        text = getFormatedDate(minDateObj, options.date_format);
    }
    else
    {
        text = getFormatedDate(date, options.date_format);
    }

    return text;
}

function busiestDays()
{
    var dayTotal, date, dateStats, domain, i;
    var total = 0;
    var output = '';
    var days = {};
    var visits = getVisits();

    for (i in dateStrings)
    {
        dayTotal = 0;

        date = dateStrings[i];
        dateStats = visits[date];
        for (domain in dateStats)
        {
            dayTotal += dateStats[domain];
        }

        days[date] = dayTotal;
        total += dayTotal;
    }

    days = sortObj(days);

    for (i in days)
    {
        date = getDateObject(days[i][0]);
        output += '<tr rel="' + days[i][0] + '" class="busiest_days_hover"><td><a href="#" data-date="' + days[i][0] + '">' + date.toLocaleDateString() + '</a></td><td>' + getShortDayName(date.getDay()) + '</td><td class="right">' + secondsToHourMinSec(days[i][1]) + '</td></tr>';
    }

    return output;
}

function getSessionValue(key)
{
    return sessionStorage.getItem(key);
}

function setSessionValue(key, data)
{
    sessionStorage.setItem(key, data);
}

function updateFormElements(selector)
{
    var id, newId, el, newVal;
    var elements = ["select", "input"];

    for (i in elements)
    {
        el = elements[i];
        $(selector).find(el).each(function() {

            id = $(this).attr('id');
            newId = id + '1';
            $(this).attr('id', newId);
            $('label[for="' + id + '"]').attr('for', newId);

            if (el == 'input')
            {
                if (getSessionValue(newId) == null)
                {
                    newVal = dateStrings[dateStrings.length - 1];
                }
                else
                {
                    newVal = getSessionValue(newId);
                }
                $('#' + newId).val(newVal);
                $('#' + newId).trigger('change');
            }
        });
    }
}

function setDimensions()
{
    $('#right').width(.95 * ($(window).innerWidth() - $('#left').width() - parseInt($('#right').css('paddingLeft'), 10) - parseInt($('#right').css('paddingRight'), 10)));
}

var backPage = chrome.extension.getBackgroundPage();
backPage.write();

var dateStrings = getDateStrings();

var startDate = dateStrings[0];
var endDate = dateStrings[dateStrings.length-1];

var diapazonStats = {};
var sortedHash, visitedDomains, forceReload;

// real-time refresh
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.getCurrent(function(tab) {
        if (tab.id == activeInfo.tabId &&
            tab.windowId == activeInfo.windowId)
        {
            updateView();
        }
    });
});

function updateView()
{
    updateData();
    drawActive();
    refreshOptionsTab();
    fillSelectSiteManagement();
}

function removeChartClasses(selector)
{
    $(selector).removeClass('loading');
    $(selector).children('span').remove();
}

function toggleRenameButton()
{
    var c = $('#categorySelectIdOptions').val();
    if (isDefaultCategory(c) == true)
    {
        $('#categoryRenameButton').hide();
    }
    else
    {
        $('#categoryRenameButton').show();
    }
}

function refreshCategoryList()
{
    var clear = arguments.length == 1 && arguments[0] == true;
    
    if (clear)
    {
        $('.categorySelectId, #categorySelectIdOptions, #siteCategory, #category_to_delete').html('');
    }
    
    fillSelectCategory();
    fillSelectCategoryManagement();
    updateSiteCategory();
    fillSelectCategoryDelete();
}


function saveAlerts(){
    var alerts = {};
    $(".row:not(.first)").each(function(idx, elm){
        var domain = $(elm).find(".domain").text();
        var time = $(elm).find(".time").text();

        alerts[domain] = time;
    });
    var repeats = $("#timer_repeats option:selected").val();
    var alertType = $("#alert_type option:selected").val();
    var showDesktopFor = $("#show_desktop_for option:selected").val();
    localStorage["isDesktop"] = (alertType == 2);
    localStorage["timeNotification"] = showDesktopFor;
    localStorage["repeats"] = JSON.stringify(repeats);
    localStorage["alerts"] = JSON.stringify(alerts);
}

$(function() {
    
    fillSelectDate();
    updateData();

    window.onresize = function() { setDimensions() };
    setDimensions();

    $(".categorySelectId").live('change', function() { drawChartCategory(); });
    $(".siteSelectId").live('change', function() { drawChartSite(); });
    $("#dashboard_category .dateSelectId").live('change', function() { setSessionValue($(this).attr('id'), $(this).val()); });
    $(".dateSelectId").live('change', function() { drawChartDate(); });
    document.getElementById("dateStartSelect").onchange = function() { endSelectUpdate(); updateData(); drawActive(); };
    document.getElementById("dateEndSelect").onchange = function() { startSelectUpdate(); updateData(); drawActive(); };

    var options = getOptions();

    $('#right .enable [type="checkbox"]').change(function() {
        var options = getOptions();
        var expression = /^enable/gi;
        var index = $(this).attr('id').replace(expression, '');
        options.dashboard_items[index] = !options.dashboard_items[index];
        saveOptions(options);
    });

    $('#left ul li a').click(function(e) {
        e.preventDefault();
        
        $('.special_label_days_months').remove();
        
        if($(this).attr('id') == 'alerts_tab'){
            alert('We are currently working on this feature and it will be ready in the next version. Thank you for understanding.');
            return;
        }
        
        var i = $('#left ul li a').index(this);

        if ($('#left ul li a').index($('#left ul li a.active')) == i &&
            forceReload == false)
        {
            return;
        }

        $('#left ul li a.active').removeClass('active');
        $(this).addClass('active');

        if ($('#dashboard_category:visible').length != 0)
        {
            $('#dashboard_category').html('');
        }

        location.hash = '#_' + $(this).attr('id');

        $('#right h2').html($(this).html());
        $('#right .category:visible, #right .options:visible, #right .about:visible, #right .categories:visible, #right .alerts_tab:visible, #badges_list, #badges_detail').hide();

        if ($(this).attr('data-range') == 'true')
        {
            $('#right form').show();
        }
        else
        {
            $('#right form').hide();
        }

        var category = '#right .category:eq(' + i + ')';
        if ($(category).length != 0)
        {
            var enableCheckbox = true;
            if ($(this).attr('id') == 'category_busiest')
            {
                var data = busiestDays();
                $(category + ' table').html(data);
                $('.category.busiest .tooltip').empty();
            }
            else if ($(this).attr('id') == 'category_most_visited')
            {
                var data = makeTable(getMostVisited());
                if (data != '')
                {
                    $(category).siblings('p:first').remove();
                    $(category + ' table').html(data);
                }
                else
                {
                    $(category).prepend('<p>' + chrome.i18n.getMessage('no_visited_domains') + '</p>');
                }
            }
            else if ($(this).attr('id') == 'category_weekdays')
            {
                $(".buttons_chart").removeClass("none");
            }
            else if ($(this).attr('id') == 'category_months')
            {
                $(".buttons_chart").removeClass("none");
            }
            else if ($(this).attr('id') == 'dashboard')
            {
                $(".buttons_chart").addClass("none");
                var chart, heading, linkIndex, link, id = '';

                var options = getOptions();
                $('#right .category:not(:eq(' + i + '))').each(function(j) {
                    if (options.dashboard_items[j])
                    {
                        linkIndex = $('#right .category').index(this);
                        link = $('#left ul li a:eq(' + linkIndex + ')');
                        id = ($(link).attr('id') != undefined) ? (' ' + $(link).attr('id')) : '';
                        heading = $(link).html();
                        chart = $(this).html();
                        $(category).append('<div class="category_wrapper' + id + '"><h3>' + heading + '</h3>' + chart + '</div>');
                    }
                });

                updateFormElements($('#dashboard_category'));
                $('#dashboard_category .datepicker').removeClass('hasDatepicker').datepicker(getDatepickerOptions());

                enableCheckbox = false;

                $("#dashboard_category .category_wrapper").each(function(idx, elm){
                    $(elm).css("clear","none");
                    if(idx % 2 == 0) {
                        $(elm).css("clear", "left");
                    }
                });
            }

            $(category).show();
            drawActive();
        }
        else
        {
            $('#right .' + $(this).attr('id')).show();
            enableCheckbox = false;

            if ($(this).attr('id') == 'categories')
            {
                fillSelectCategoryManagement();
                fillSelectSiteManagement();
            }
        }

        if (enableCheckbox == true)
        {
            var newId = 'enable' + (i - 1);
            $('#right .enable').show().children('input[type="checkbox"]').attr('id', newId);
            $('#right .enable').children('label').attr('for', newId);
        }
        else
        {
            $('#right .enable').hide();
        }

        forceReload = false;
        window.scrollTo(0,0);
    });

    $('#right .busiest table a, #right .category_busiest table a').live('click', function(e) {
        e.preventDefault();
        
        var options = getOptions();        
        var dateObject = getDateObject($(this).attr('data-date'));
        var date = getFormatedDate(dateObject, options.date_format);
        
        $("#dateSelectId").val(date);
        $('#category_daily').trigger('click');
    });

    $('#restoreDashboard').live('click', function(e) {
        e.preventDefault();

        var options = getOptions();
        var optionsDefault = getDefaultOptions();
        options.dashboard_items = optionsDefault.dashboard_items;
        saveOptions(options);

        forceReload = true;
        $('#dashboard').trigger('click');
    });

    $('#categoryRemoveButton').click(function(e) {
        e.preventDefault();

        if (confirm(chrome.i18n.getMessage('remove_confirm')) == true)
        {
            var categoryId = $('#categorySelectIdOptions').val();
            var options = getOptions();
            var domains = options.categories[categoryId], d;

            for (d in domains)
            {
                options.categories.other.push(domains[d]);
            }

            delete options.categories[categoryId];
            saveOptions(options)

            fillSelectCategory();
            fillSelectCategoryManagement();
            updateSiteCategory();
            fillSelectSiteManagement();
        }
    });
    
    $('#categoryRenameButton').click(function(e) {
        var oldTitle = $('#categorySelectIdOptions').val();

        var title;
        do
        {
            title = window.prompt(chrome.i18n.getMessage('rename_prompt'), oldTitle);
        }
        while (title != null && $.trim(title) == '');
        
        if (title == null)
        {
            return;
        }
        
        var options = getOptions();
        options.categories[title] = options.categories[oldTitle];
        delete options.categories[oldTitle];
        saveOptions(options);

        refreshCategoryList(true);
    });
    
    $('#categorySelectIdOptions').change(function() {
        toggleRenameButton();
    });

    $('#categoryAddButton').click(function(e) {
        var options = getOptions();
        var text = $.trim($('#categoryAdd').val());

        e.preventDefault();

        if (text == '')
        {
            return false;
        }

        var c;
        for (c in options.categories)
        {
            if (c == text ||
                chrome.i18n.getMessage('category_translation_' + c) == text)
            {
                alert(chrome.i18n.getMessage('category_exists'));
                return false;
            }
        }

        $('#categoryAdd').val('');
        options.categories[text] = [];
        saveOptions(options);

        refreshCategoryList();
    });

    $('#siteSelectIdOptions').change(function() {
        updateSiteCategory();
    });

    $('#siteCategory').change(function() {
        saveSiteCategory();
        fillSelectSiteManagement();
    });

    $('#categoryAdd').attr('placeholder', chrome.i18n.getMessage('category_add_placeholder'))
                     .keypress(function(e) { if (e.which == 13) { $('#categoryAddButton').trigger('click'); } });

    $('#categoryUncategorizedOnly').change(function() {
        fillSelectSiteManagement();
    });

    $('.most_visited table a').live('click', function(e) {
        e.preventDefault();
        var domain = get_hostname_from_url(this.href);
        if ($('#siteSelectId').val() == null)
        {
            fillSelectSite();
        }
        $('#siteSelectId').val(domain);
        $('#category_sites').trigger('click');
    });

    // jQuery UI fix for chrome extensions manifest v2
    $('select.ui-datepicker-month[data-dpuuid], select.ui-datepicker-year[data-dpuuid]').live('change', function() {
        var dpuuid = $(this).attr('data-dpuuid');
        var id = $(this).attr('data-input');
        var obj = 'DP_jQuery_' + dpuuid;
        var type = $(this).hasClass('ui-datepicker-month') ? 'M' : 'Y';
        window[obj].datepicker._selectMonthYear('#' + id, this, type);
    });

    $('a.ui-datepicker-prev[data-dpuuid],a.ui-datepicker-next[data-dpuuid]').live('click', function() {
        var dpuuid = $(this).attr('data-dpuuid');
        var id = $(this).attr('data-input');
        var i = Number($(this).attr('data-i'));
        var obj = 'DP_jQuery_' + dpuuid;
        window[obj].datepicker._adjustDate('#' + id, i, 'M');
    });

    $('table.ui-datepicker-calendar td[data-dpuuid]').live('click', function() {
        var dpuuid = $(this).attr('data-dpuuid');
        var id = $(this).attr('data-input');
        var month = $(this).attr('data-month');
        var year = $(this).attr('data-year');
        var obj = 'DP_jQuery_' + dpuuid;
        window[obj].datepicker._selectDay('#' + id, month, year, this);
        return false;
    });

    // this is never gonna happen
    $('button.ui-datepicker-close[data-dpuuid]').live('click', function() {
        var dpuuid = $(this).attr('data-dpuuid');
        var obj = 'DP_jQuery_' + dpuuid;
        window[obj].datepicker._hideDatepicker();
    });

    // this is never gonna happen
    $('button.ui-datepicker-current[data-dpuuid]').live('click', function() {
        var dpuuid = $(this).attr('data-dpuuid');
        var id = $(this).attr('data-input');
        var obj = 'DP_jQuery_' + dpuuid;
        window[obj].datepicker._gotoToday('#' + id);
    });

    // Average time spent every dayy.
    $(".daily_average_browsing").html(secondsToHourMinSec(daysAvg));
    // Time spend this week browsing
    $(".weekly_browsing_time").html(secondsToHourMinSec(weeksAvg));
    // Time spend this month browsing
    $(".monthly_browsing_time").html(secondsToHourMinSec(monthsAvg));
    $(".total_browsing_time").html(secondsToHourMinSec(getTotalTimeRange()));

    function stripPage(page){
        var pageToTest = page.toLowerCase().replace(/^((http(s)?:\/\/)?(w){0,3}(\.){0,1})/g,"").
            replace(/\/$/, "");
        return pageToTest
    }

    function removeDialog(){
        $(".dialog").remove();
        $(".dialog_overlay").remove();
    }

    $(".addDomain").bind('click',function(){
        $("#right").append("<div class='dialog_overlay'></div>" +
            "<div class='dialog'>" +
                "<div class='dialog_header'>"+chrome.i18n.getMessage("add_domain")+"</div>" +
                "<div class='dialog_content'>" +
                    "<table>" +
                        "<tr>" +
                            "<td><label id='dialog_label_add' class='dialog_label' for='addDomainDialog'>"+chrome.i18n.getMessage("add_domain_dialog")+"</label></td>" +
                            "<td><input type='text' id='addDomainDialog' title='"+chrome.i18n.getMessage("add_domain_dialog_tip")+"'/></td>" +
                        "</tr>" +
                        "<tr>" +
                            "<td><label id='dialog_label_add_time' class='dialog_label' for='addDomainTimeDialog'>"+chrome.i18n.getMessage("add_domain_time_dialog")+"</label></td>" +
                            "<td><input type='text' id='addDomainTimeDialog' value='10' title='"+chrome.i18n.getMessage("add_domain_dialog_time_tip")+"'/></td>" +
                        "</tr>" +
                    "</table>" +
                "</div>" +
                "<div class='dialog_buttons'><div class='centered'>" +
                    "<div class='button ok first'>"+chrome.i18n.getMessage("add")+"</div>" +
                    "<div class='button cancel'>"+chrome.i18n.getMessage("cancel")+"</div> " +
                "</div></div>" +
            "</div>");

        $(".dialog .ok").bind('click', function(){
            var newDomain = stripPage($("#addDomainDialog").val());
            var newTime = $("#addDomainTimeDialog").val();

            var exists = false;
            $(".row .domain").each(function(idx, elm){
                var data = $(elm).text();
                if(data == newDomain){
                    exists = true;
                }
            });

            if(!exists){
                var inserted = $(".alerts .table").append('<div class="alert row">' +
                    '<div class="cell domain">'+newDomain+'</div>' +
                    '<div class="cell time">'+newTime+'</div>' +
                '</div>');
                $(".row").unbind("click");
                $(".row").bind('click', function(){
                    if(!$(this).hasClass("selected")){
                        $(".row").removeClass("selected");
                        $(this).addClass("selected");
                    }
                });

                removeDialog();

                saveAlerts();
                notifySaved();
            } else {

                removeDialog();

                notify(chrome.i18n.getMessage("domain_inserted"));
            }
        });
        $(".dialog .cancel").bind('click', function(){
            removeDialog();
        });
    });

    $(".changeTime").bind('click',function(){
        if($('.selected').length == 0){
            return;
        }

        var domainName = $(".selected .domain").text();
        var domainTime = $(".selected .time").text();
        $("#right").append("<div class='dialog_overlay'></div>" +
            "<div class='dialog'>" +
                "<div class='dialog_header'>"+chrome.i18n.getMessage("change_time", domainName)+"</div>" +
                "<div class='dialog_content'>" +
                    "<table>" +
                        "<tr>" +
                            "<td><label id='dialog_label_change_time' class='dialog_label' for='changeTimeDialog'>"+chrome.i18n.getMessage("change_time_dialog")+"</label></td>" +
                            "<td><input type='text' id='changeTimeDialog' value='"+domainTime+"' title='"+chrome.i18n.getMessage("change_time_tip")+"'/></td>" +
                        "</tr>" +
                    "</table>" +
                "</div>" +
                "<div class='dialog_buttons'><div class='centered'>" +
                    "<div class='button ok first'>"+chrome.i18n.getMessage("change")+"</div>" +
                    "<div class='button cancel'>"+chrome.i18n.getMessage("cancel")+"</div> " +
                "</div></div>" +
            "</div>");

        $(".dialog .ok").bind('click', function(){
            $(".selected .time").text($("#changeTimeDialog").val());

            removeDialog();

            saveAlerts();
            notifySaved();
        });
        $(".dialog .cancel").bind('click', function(){
            removeDialog();
        });
    });

    $(".removeDomain").bind('click',function(){
        if($(".alerts .selected").length > 0){
            $(".alerts .selected").remove();

            saveAlerts();
            notifySaved();
        }
    });

    var selector = '#left ul li a:eq(0)';
    if (location.hash != undefined &&
        location.hash != '')
    {
        selector = location.hash.replace(/^#_/, '#');
    }

    $(selector).trigger('click');

    $(".alerts .table .row:not(.first)").remove();
    if(localStorage["alerts"] != "undefined" && localStorage["alerts"] != undefined){
        var alerts =JSON.parse(localStorage["alerts"]);
        for(var domain in alerts){
            $(".alerts .table").append('<div class="alert row">' +
                '<div class="cell domain">'+domain+'</div>' +
                '<div class="cell time">'+alerts[domain]+'</div>' +
            '</div>');
        }

        $(".row").bind('click',function(){
            if(!$(this).hasClass("selected")){
                $(".row").removeClass("selected");
                $(this).addClass("selected");
            }
        });
    }

    if(localStorage["repeats"] != "undefined" && localStorage["repeats"] != undefined){
        var repeats = JSON.parse(localStorage["repeats"]);
        $('#timer_repeats option[value="'+repeats+'"]').prop("selected", true);
    }

    if(localStorage["isDesktop"] != "undefined" && localStorage["isDesktop"] != undefined){
        var isDesktop = JSON.parse(localStorage["isDesktop"]);
        if(isDesktop){
            $(".show_desktop_for_div").removeClass("none");
        }
        isDesktop = (isDesktop) ? 2 : 1;
        $('#alert_type option[value="'+isDesktop+'"]').prop("selected", true);
    }

    if(localStorage["timeNotification"] != "undefined" && localStorage["timeNotification"] != undefined){
        var timeNotification = JSON.parse(localStorage["timeNotification"]);
        $('#show_desktop_for option[value="'+timeNotification+'"]').prop("selected", true);
    }

    $('#timer_repeats').bind('change', function(){
        saveAlerts();
        notifySaved();
    });

    $('#alert_type').bind('change', function(){
        var alertType = $("#alert_type option:selected").val();
        if(alertType == 1) {
            $(".show_desktop_for_div").addClass("none");
        } else {
            $(".show_desktop_for_div").removeClass("none");
        }

        saveAlerts();
        notifySaved();
    });

    $('#show_desktop_for').bind('change', function(){
        saveAlerts();
        notifySaved();
    });
    
    //new
    if(getPref('fb_share_ok')){
        $('.busiest_days_hover').live('mouseover',function(){
            var selector = $('.category.busiest .tooltip');
            selector.empty().show();
            var dataDate = updateDataDate2($(this).attr('rel'));
            drawPieChart(selector, dataDate);
        }).live('mouseout',function(){
            $('.category.busiest .tooltip').empty();
        });
    }else{
        $('.display_only_fb_share').css('display','none');
    }
    
    //new
    if(getPref('fb_share_ok')){
        $('#fast_select_date').show();
        $('#fast_select_date span').click(function(){
            $('#fast_select_date .loader').css('display','inline');
            _this = this;
            setTimeout(function(){
                var rel = $(_this).attr('rel');
                var actDate = new Date();
                var endDate = specialNormalDate(actDate);
                var startDate = specialNormalDate(new Date(actDate.getTime()-(rel*1000*3600*24)));
                $('#dateStartSelect').val(startDate).trigger('change');
                $('#dateEndSelect').val(endDate).trigger('change');
                $('#fast_select_date .loader').css('display','none');
            },100);
        });
    }
    
    if(bgPage.wips.tempContextPage){
        var domain = get_hostname_from_url(bgPage.wips.tempContextPage);
        if ($('#siteSelectId').val() == null)
        {
            fillSelectSite();
        }
        $('#siteSelectId').val(domain);
        bgPage.wips.tempContextPage = false;
        $('#category_sites').trigger('click');
    }
    
    //SEARCH
    if(getPref('fb_share_ok')){
        var srchTable = $('.category.search table');
        var srchInput = $('.category.search input[type=text]');
        var data_srch = getMostVisited();
        function renderSearch(search){
            srchTable.empty();
            for(var i in data_srch){
                var item = data_srch[i];
                if(!search || item[0].indexOf(search) != -1){
                    var tr = $('<tr></tr>');
                    srchTable.append(tr);
                    var td = $('<td></td>');
                    tr.append(td);
                    tr.append($('<td style="text-align:right;">'+item[1]+'</td>'));
                    var link = $('<a href="#">'+item[0]+'</a>');
                    td.append(link);
                    link.click(function(e){
                        e.preventDefault();
                        var domain = $(this).text();
                        if ($('#siteSelectId').val() == null)
                        {
                            fillSelectSite();
                        }
                        $('#siteSelectId').val(domain);
                        $('#category_sites').trigger('click');
                    });
                }
            }
        }
        srchInput.keyup(function(){
            if($(this).val().length > 1){
                renderSearch($(this).val());
            }
        });
    }
    
});

function specialNormalDate(date){//out: dd.mm.yyyy
    return ('0'+date.getDate()).substr(-2,2) + '.' + ('0'+(date.getMonth()+1)).substr(-2,2) +'.'+ date.getFullYear();
}