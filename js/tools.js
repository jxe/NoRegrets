var urlPattern = /[a-z0-9]\.[a-z]+/i;

function get_hostname_from_url(url)
{
    //cut url to get domain name only
    var matches = url.match(/:\/\/(www\.)?(.[^/:]+)/);
    if (matches == null || matches.length < 3)
    {
        return null;
    }

    var domain = matches[2];

    //splitting domain by parts
    var domainNameParts = domain.split('.');

    //check is domain the IP address
    firstdomain = domainNameParts[domainNameParts.length-1];

    if (firstdomain.search(/\d/) != -1)//if there is nums in 1 level domain - there are IP adress
    {
        if ( !isDomainHidden(options, domain) ) return domain;
    }
    //if domain is one word - it is chrome internal page
    if (domainNameParts.length==1) return domain;

    secdomain = domainNameParts[domainNameParts.length-2];

    if (!isDomainHidden(options, secdomain+"."+firstdomain) )    //if domain not excluded from stats
    {
    if (isDomainMultilevel(options, secdomain+"."+firstdomain) ) //if not from list of domains with 3level domain as separated site
            return domain; //return all domain
                else {return secdomain+"."+domainNameParts[domainNameParts.length-1]; }//return 1 and 2 levels only
    } else return "none";
}

function getTotalTime()
{
    var globalTime = 0;
    var allDaysStats;

    if (arguments.length > 0)
    {
        allDaysStats = getDiapazonStats(arguments[0], arguments[1]);
    }
    else
    {
        allDaysStats = getStats('full');
    }

    for (domain in allDaysStats)
    {
        globalTime += parseInt(allDaysStats[domain]);
    }

    return globalTime;
}

function getTotalTimeRange()
{
    return getTotalTime(startDate, endDate);
}

function secondsToHourMinSec(seconds)
{
    var include_seconds = arguments.length <= 1 || arguments[1] == true;
    var space = arguments.length > 2 && arguments[2] == true ? " " : "";

    //getting days, hours, mins, seconds
    var days = seconds/(24*3600) - ((seconds/(24*3600))%1); //rounding
    seconds -= days*24*60*60; // - hours
    var hours = seconds/3600 - ((seconds/3600)%1); //rounding
    seconds -= hours*60*60; // - hours
    var minutes = seconds/60 - ((seconds/60)%1);
    seconds -= minutes*60;
    seconds = Math.ceil(seconds);

    var text = '';

    if (days > 0)
    {
        text = days + space + chrome.i18n.getMessage("d") + " ";
    }
    if (hours > 0)
    {
        text += hours + space + chrome.i18n.getMessage("h") + " ";
    }
    if (minutes > 0 || include_seconds == false)
    {
        text += minutes + space + chrome.i18n.getMessage("m") + " ";
    }
    if (include_seconds == true)
    {
        text += seconds + space + chrome.i18n.getMessage("s");
    }

    return text;
}

function secondsToHourMin(seconds)
{
    return secondsToHourMinSec(seconds, false);
}

//sorting associate array by descending
function sortAssoc(aInput)
{
    var aTemp = [];
    for (var sKey in aInput)
        aTemp.push([sKey, aInput[sKey]]);
    aTemp.sort(function () {return arguments[0][1] - arguments[1][1]});

    var aOutput = {};
    for (var nIndex = aTemp.length-1; nIndex >=0; nIndex--)
    aOutput[aTemp[nIndex][0]] = aTemp[nIndex][1];

    return aOutput;
}

function secs2mins(seconds)
{
    var minutes= seconds/60;
    //from 100 base system to 60
    minutes = minutes - (minutes%1) + (minutes%1)*60/100;
    //round for hungred
    minutes = roundNumber(minutes, 2);

    return minutes;
}

function secs2hours(seconds)
{
    var hours= seconds/3600;
    //from 100 base system to 60
    hours= hours- (hours%1) + (hours%1)*60/100;
    //round for hungred
    hours = roundNumber(hours, 2)

    return hours;
}

function secs2days(seconds)
{
    var days = roundNumber(seconds/(3600*24),2);
    return days;
}

function roundNumber(num, dec)
{
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

//stats for dates
function getDiapazonStats(startDate, endDate)
{
    var diapazonStats = {};

    var start = getDateObject(startDate);
    var end = getDateObject(endDate);
    var len = getDifferenceDays(start, end);
    var visits = getVisits();
    
    var i, dateObject = start, dateStats;

    for (i = 0; i <= len; i++)
    {
        date = getFormatedDate(dateObject);
        dateObject.setTime(dateObject.getTime() + 24 * 60 * 60 * 1000);

        if (visits[date] == undefined)
        {
            continue;
        }

        dateStats = visits[date];

        for (domain in dateStats)
        {
            if ( isNaN(diapazonStats[domain]) )
            {
                diapazonStats[domain] = dateStats[domain];
            }
            else
            {
                diapazonStats[domain] += dateStats[domain];
            }
        }
    }
    return diapazonStats;
}

function getExtensionId()
{
    // return chrome.i18n.getMessage('@@extension_id');
    return 'ejifodhjoeeenihgfpjijjmpomaphmah';
}

function getDefaultOptions()
{
    var options = {
        history_size:        0,    //0 means infinity
        idle_time:            60, //seconds
        show_icon_text: true,
        hidden_domains: ['t.co', 'goo.gl', 'youtu.be', 'bit.ly', '301.to', 'kl.am', 'tr.im', 'cli.gs', 'yau.sh', 'short.ie', 'twurl.nl', 'snipurl.com', 'dwarfurl.com', 'tinyurl.com'],
        // most_visitied_limit: 15,
        more_than_2_levels_domains: ['google.com', 'google.ru', 'org.ru', 'net.ru', 'com.ru', 'narod.ru', 'ńń.com', 'co.uk', 'co.au', 'co.ao', 'ed.ao', 'gv.ao', 'it.ao', 'og.ao', 'pb.ao', 'com.ar', 'gov.ar', 'int.ar', 'mil.ar', 'net.ar', 'org.ar', 'e164.arpa', 'in-addr.arpa', 'iris.arpa', 'ip6.arpa', 'uri.arpa', 'urn.arpa', 'com.bd', 'edu.bd', 'net.bd', 'gov.bd', 'org.bd', 'mil.bd', 'com.bn', 'edu.bn', 'org.bn', 'net.bn', 'agr.br', 'am.br', 'art.br', 'edu.br', 'com.br', 'coop.br', 'esp.br', 'far.br', 'fm.br', 'g12.br', 'gov.br', 'imb.br', 'ind.br', 'inf.br', 'mil.br', 'net.br', 'org.br', 'psi.br', 'rec.br', 'srv.br', 'tmp.br', 'tur.br', 'tv.br', 'etc.br', 'adm.br', 'adv.br', 'arq.br', 'ato.br', 'bio.br', 'bmd.br', 'cim.br', 'cng.br', 'cnt.br', 'ecn.br', 'eng.br', 'eti.br', 'fnd.br', 'fot.br', 'fst.br', 'ggf.br', 'jor.br', 'lel.br', 'mat.br', 'med.br', 'mus.br', 'not.br', 'ntr.br', 'odo.br', 'ppg.br', 'pro.br', 'psc.br', 'qsl.br', 'slg.br', 'trd.br', 'vet.br', 'zlg.br', 'dpn.br', 'nom.br', 'com.co', 'edu.co', 'org.co', 'gov.co', 'mil.co', 'net.co', 'nom.co', 'ac.cr', 'co.cr', 'ed.cr', 'fi.cr', 'go.cr', 'or.cr', 'sa.cr', 'com.cy', 'biz.cy', 'info.cy', 'ltd.cy', 'pro.cy', 'net.cy', 'org.cy', 'name.cy', 'tm.cy', 'ac.cy', 'ekloges.cy', 'press.cy', 'parliament.cy', 'edu.do', 'gov.do', 'gob.do', 'com.do', 'org.do', 'sld.do', 'web.do', 'net.do', 'mil.do', 'art.do', 'eun.eg', 'edu.eg', 'sci.eg', 'gov.eg', 'com.eg', 'org.eg', 'net.eg', 'mil.eg', 'com.et', 'gov.et', 'org.et', 'edu.et', 'net.et', 'biz.et', 'name.et', 'info.et', 'biz.fj', 'com.fj', 'info.fj', 'name.fj', 'net.fj', 'org.fj', 'pro.fj', 'ac.fj', 'gov.fj', 'mil.fj', 'school.fj', 'co.fk', 'org.fk', 'gov.fk', 'ac.fk', 'nom.fk', 'net.fk', 'com.gh', 'edu.gh', 'gov.gh', 'org.gh', 'mil.gh', 'com.gn', 'ac.gn', 'gov.gn', 'org.gn', 'net.gn', 'ac.id', 'co.id', 'or.id', 'go.id', 'ac.il', 'co.il', 'org.il', 'net.il', 'k12.il', 'gov.il', 'muni.il', 'idf.il', 'edu.jm', 'gov.jm', 'com.jm', 'net.jm', 'org.jm', 'com.kw', 'edu.kw', 'gov.kw', 'net.kw', 'org.kw', 'mil.kw', 'org.kz', 'edu.kz', 'net.kz', 'gov.kz', 'mil.kz', 'com.kz', 'net.lb', 'org.lb', 'gov.lb', 'edu.lb', 'com.lb', 'com.lc', 'org.lc', 'edu.lc', 'gov.lc', 'com.lr', 'edu.lr', 'gov.lr', 'org.lr', 'net.lr', 'org.ls', 'co.ls', 'aero.mv', 'biz.mv', 'com.mv', 'coop.mv', 'edu.mv', 'gov.mv', 'info.mv', 'int.mv', 'mil.mv', 'museum.mv', 'name.mv', 'net.mv', 'org.mv', 'pro.mv', 'ac.mw', 'co.mw', 'com.mw', 'coop.mw', 'edu.mw', 'gov.mw', 'int.mw', 'museum.mw', 'net.mw', 'org.mw', 'com.mx', 'net.mx', 'org.mx', 'edu.mx', 'gob.mx', 'com.my', 'net.my', 'org.my', 'gov.my', 'edu.my', 'mil.my', 'name.my', 'edu.ng', 'com.ng', 'gov.ng', 'org.ng', 'net.ng', 'gob.ni', 'com.ni', 'edu.ni', 'org.ni', 'nom.ni', 'net.ni', 'com.np', 'org.np', 'edu.np', 'net.np', 'gov.np', 'mil.np', 'ac.nz', 'co.nz', 'cri.nz', 'gen.nz', 'geek.nz', 'govt.nz', 'iwi.nz', 'maori.nz', 'mil.nz', 'net.nz', 'org.nz', 'school.nz', 'com.om', 'co.om', 'edu.om', 'ac.com', 'sch.om', 'gov.om', 'net.om', 'org.om', 'mil.om', 'museum.om', 'biz.om', 'pro.om', 'med.om', 'com.pa', 'ac.pa', 'sld.pa', 'gob.pa', 'edu.pa', 'org.pa', 'net.pa', 'abo.pa', 'ing.pa', 'med.pa', 'nom.pa', 'com.pe', 'org.pe', 'net.pe', 'edu.pe', 'mil.pe', 'gob.pe', 'nom.pe', 'com.pg', 'net.pg', 'net.py', 'org.py', 'gov.py', 'edu.py', 'com.py', 'com.sa', 'edu.sa', 'sch.sa', 'med.sa', 'gov.sa', 'net.sa', 'org.sa', 'pub.sa', 'com.sb', 'gov.sb', 'net.sb', 'edu.sb', 'gov.sy', 'com.sy', 'net.sy', 'ac.th', 'co.th', 'in.th', 'go.th', 'mi.th', 'or.th', 'net.th', 'com.tn', 'intl.tn', 'gov.tn', 'org.tn', 'ind.tn', 'nat.tn', 'tourism.tn', 'info.tn', 'ens.tn', 'fin.tn', 'net.tn', 'co.tz', 'ac.tz', 'go.tz', 'or.tz', 'ne.tz', 'ac.uk', 'co.uk', 'gov.uk', 'ltd.uk', 'me.uk', 'mil.uk', 'mod.uk', 'net.uk', 'nic.uk', 'nhs.uk', 'org.uk', 'plc.uk', 'police.uk', 'sch.uk', 'edu.uy', 'gub.uy', 'org.uy', 'com.uy', 'net.uy', 'mil.uy', '', 'vatican.va', '', 'com.ve', 'net.ve', 'org.ve', 'info.ve', 'co.ve', 'web.ve', 'com.ye', 'net.ye', 'ac.yu', 'co.yu', 'org.yu', 'edu.yu', 'ac.za', 'city.za', 'co.za', 'edu.za', 'gov.za', 'law.za', 'mil.za', 'nom.za', 'org.za', 'school.za', 'alt.za', 'net.za', 'ngo.za', 'tm.za', 'web.za', 'co.zm', 'org.zm', 'gov.zm', 'sch.zm', 'ac.zm', 'co.zw', 'org.zw', 'gov.zw', 'ac.zw', 'com.au', 'ne.jp', 'go.jp'],
        // new items since 0.6 beta
        week_start: 0,
        default_popup_action: "menu",
        dashboard_items: [true,true,true,true,true,true,true,true,true,true],
        categories: {"work": [], "fun": [], "other": []},
        show_uncategorized: false,
        // new items since 1.0.6
        date_format: "dd.mm.yy"
    }
    return options;
}

function isDomainHidden(options, domain)
{
    return $.inArray(domain, options.hidden_domains) != -1;
}

function isDomainMultilevel(options, domain)
{
    return $.inArray(domain, options.more_than_2_levels_domains) != -1;
}


function getAllDomains()
{
    var i, date, dateStats;
    var domains = [];
    var visits = getVisits();
    
    for (i in visits)
    {
        for (key in visits[i])
        {
            domains.push(key);
        }
    }

    domains = getUnique(domains);

    return domains;
}

function checkDomainCategories(options)
{
    var domains = getAllDomains();
    var i, j, k, domain, category, found;

    for (i in domains)
    {
        domain = domains[i];
        found = false;

        for (j in options.categories)
        {
            category = options.categories[j];
            for (k in category)
            {
                if (category[k] == domain)
                {
                    found = true;
                    break;
                }
            }
        }

        if (found == false)
        {
            options.categories.other.push(domain);
        }
    }
    options.categories.other = getUnique(options.categories.other);

    return options;
}

function getDateStrings()
{
    var dStrings = [];
    var visits = getVisits();
    var i;
    
    for (i in visits)
    {
        dStrings.push(i);
    }
    dStrings.sort();

    return dStrings;
}

function getMostVisited()
{
    var i, date;
    var domains = {};
    var visits = getVisits();
    
    for (date in visits)
    {
        for (i in visits[date])
        {
            if (domains[i] == undefined)
            {
                domains[i] = visits[date][i];
            }
            else
            {
                domains[i] += visits[date][i];
            }
        }
    }

    domains = sortObjDescAlphabet(domains);

    // var options = getOptions();
    // domains = domains.slice(0, options.most_visitied_limit);

    for (var i in domains)
    {
        domains[i] = [domains[i][0], secondsToHourMinSec(domains[i][1])];
    }

    return domains;
}

function makeTable(data)
{
    var table = '';
    var rowHTML, row, tag, css, text, text_short;

    for (var i in data)
    {
        var row = data[i];
        rowHTML = '';
        for (var j in row)
        {
            text = row[j];
            if (j == 0)
            {
                text_short = text.length > 35 ? (text.substring(0,33) + '&hellip;') : text;
                text = '<a href="http://' + text + '" title="' + (text_short != text ? text : '') + '" target="_blank">' + text_short + '</a>';
            }
            tag = j == 0 ? 'th' : 'td';
            css = j == row.length - 1 ? ' class="right"' : '';

            rowHTML += '<' + tag + css + '>' + text + '</' + tag + '>';
        }
        table += '<tr>' + rowHTML + '</tr>';
    }

    return table;
}

function sortObj(arr)
{
    var sorted;
    if (arguments.length > 1 &&
        arguments[1] == true)
    {
        sorted = arr;
    }
    else
    {
        var i;
        sorted = [];
        for (i in arr)
        {
            sorted.push([i,arr[i]]);
        }
    }

    sorted.sort(function(a,b){return b[1]-a[1]});

	return sorted;
}

function sortObjDescAlphabet(arr)
{
	var i;
	var sorted = [];

	for (i in arr)
    {
		sorted.push([i,arr[i]]);
	}

    sorted.sort(function(a,b) {
        if (b[1] > a[1])
        {
            return 1;
        }
        else if (b[1] < a[1])
        {
            return -1;
        }
        else
        {
            return b[0] > a[0] ? -1 : 1;
        }
    });

	return sorted;
}

function getOptions()
{
    return storage_get('options');
}

function storage_get(key)
{
    var json = localStorage.getItem(key);
    if (json == null)
    {
        return undefined;
    }

    try
    {
        return JSON.parse(json);
    }
    catch (e)
    {
        console.log("Couldn't parse json for " + key);
        return undefined;
    }
}

function storage_set(key, value)
{
    try
    {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (e)
    {
    }
}

function getCategoryData(historyStats, c)
{
    var domain, d, max = 0, sites = [];
    var options = getOptions();
    var categories = options.categories;
    var categoryDomains = categories[c];

    for (d in categoryDomains)
    {
        domain = categoryDomains[d];

        if (isNaN(historyStats[domain]) ||
            historyStats[domain] <= 0)
        {
            continue;
        }

        max = Math.max(max, historyStats[domain]);
        sites.push([domain, historyStats[domain]]  );
    }

    return [sites, max];
}

function getAllCategories(historyStats)
{
    var categorySites, total, categoryName;
    var options = getOptions();
    var categories = options.categories;
    var sites = [];

    for (c in categories)
    {
        if (c == 'other' &&
            options.show_uncategorized == false)
        {
            continue;
        }

        total = 0;
        categoryData = getCategoryData(historyStats, c);
        categorySites = categoryData[0];

        for (s in categorySites)
        {
            total += categorySites[s][1];
        }

        if (total == 0)
        {
            continue;
        }

        categoryName = getCategoryName(c);
        sites.push([categoryName, total]);
    }

    return sites;
}

function getCategoryName(c)
{
    var translation = chrome.i18n.getMessage('category_translation_' + c);
    var categoryName = translation != '' ? translation : c;

    return categoryName;
}

function isDefaultCategory(c)
{
    return chrome.i18n.getMessage('category_translation_' + c) != '';
}

function getStats(type)
{
    var d = new Date();
    var start, end;
    switch (type)
    {
        case 'yesterday':
            d.setDate(d.getDate() - 1);
            start = end = getFormatedDate(d);
            break;
        
        case 'last7':
            end = getFormatedDate(d);
            d.setDate(d.getDate() - 6);
            start = getFormatedDate(d);
            break;

        case 'full':
            var dateStrings = getDateStrings();
            start = dateStrings[0];
            end = dateStrings[dateStrings.length-1];
            break;

        case 'categories':
            var dateStrings = getDateStrings();
            start = dateStrings[0];
            end = dateStrings[dateStrings.length-1];

            var stats = getDiapazonStats(start, end);
            var sites = getAllCategories(stats);
            var i, visits, category, sitesObj = {}, noCategories = 0;

            for (i in sites)
            {
                category = sites[i][0];
                visits = sites[i][1];
                sitesObj[category] = visits;

                if (visits > 0 &&
                    chrome.i18n.getMessage('category_translation_other') != category)
                {
                    noCategories++;
                }
            }

            if (noCategories == 0)
            {
                sitesObj = {};
            }

            return sitesObj;

        default:
            start = end = getFormatedDate(d);
            break;
    }

    return getDiapazonStats(start, end);
}

function absoluteModulo(i, i_max)
{
   return ((i % i_max) + i_max) % i_max;
}

var timeCoefficient = 1;
function getTimeCategory(sec)
{
    if (sec >= 86400 * timeCoefficient)
    {
        return "days";
    }
    else if (sec >= 3600 * timeCoefficient)
    {
        return "hours";
    }
    else if (sec >= 60 * timeCoefficient)
    {
        return "minutes";
    }

    return "seconds";
}

function getReadableTime(sec, max)
{
    var category = getTimeCategory(max);

    switch (category)
    {
        case "minutes":
            return secs2mins(sec);

        case "hours":
            return secs2hours(sec);

        case "days":
            return secs2days(sec);

        default:
            return sec;
    }
}

function getReadableTimeCategory(sec)
{
    var category = getTimeCategory(sec);
    return secondsToHourMinSec(sec, category == "seconds", true);
}

function getDMY(date, d1, d2, m1, m2, y1, y2)
{
    var d = parseInt(date.substring(d1,d2), 10);
    var m = parseInt(date.substring(m1,m2), 10);
    var y = parseInt(date.substring(y1,y2), 10);

    return [d, m, y];
}

function getDateObject(date)
{
    var format = 'yy-mm-dd';
    var dmy;
    
    if (arguments.length > 1)
    {
        format = arguments[1];
    }

    switch (format)
    {
        case 'dd.mm.yy':
        case 'dd-mm-yy':
        case 'dd/mm/yy':
            dmy = getDMY(date, 0, 2, 3, 5, 6, 10);
            break;
        
        case 'mm/dd/yy':
            dmy = getDMY(date, 3, 5, 0, 2, 6, 10);
            break;
        
        case 'yy.mm.dd':
        case 'yy/mm/dd':
        // case 'yy-mm-dd':
        default:
            dmy = getDMY(date, 8, 10, 5, 7, 0, 4);
            break;
    }
    
    var object = new Date(dmy[2], dmy[1] - 1, dmy[0]);    
    return object;
}

function getDifferenceDays(start, end)
{
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = end.getTime() - start.getTime();
    var days = millisBetween / millisecondsPerDay;

    return Math.floor(days);
}

function formatTime(time)
{
    var max;
    if (arguments.length == 1)
    {
        max = time;
    }
    else
    {
        max = arguments[1];
    }

    var category = getTimeCategory(max);
    var text = getReadableTime(time, max).toString();
    var suffix = '';

    if (arguments.length <= 2 ||
        arguments[2] == true)
    {
        var c;

        if (arguments.length <= 3 ||
            arguments[3] == false)
        {
            c = category;
        }
        else
        {
            c = category.substring(0,1);
        }

        suffix = " " + chrome.i18n.getMessage(c);
    }

    // string cuts last zero from time
    var dotIndex = text.indexOf('.');
    if (dotIndex != -1 &&
        dotIndex + 3 > text.length)
    {
        text += '0';
    }

    switch (category)
    {
        case 'minutes':
        case 'hours':
            text = text.replace('.', ':');
            break;
    }

    return text + suffix;
}

function formatTimeNoSuffix(time, max)
{
    return formatTime(time, max, false);
}

function formatTimeShortSuffix(time, max)
{
    return formatTime(time, max, true, true);
}

function getUnique(t){
   var u = {}, a = [];
   for(var i = 0, l = t.length; i < l; ++i){
      if(u.hasOwnProperty(t[i])) {
         continue;
      }
      a.push(t[i]);
      u[t[i]] = 1;
   }
   return a;
}

function getFormatedDate()
{
    var now, format = 'yy-mm-dd';
    
    if (arguments.length == 0)
    {
        now = new Date();
    }
    else
    {
        now = arguments[0];
    }
    
    if (arguments.length > 1)
    {
        format = arguments[1];
    }
    
    var d = now.getDate();
    if (d < 10)
    {
        d = "0" + d;
    }
    var m = now.getMonth() + 1;
    if (m < 10)
    {
        m = "0" + m;
    }
    var y = now.getFullYear();

    var date;
    switch (format)
    {
        case 'yy.mm.dd':
            date = y + "." + m + "." + d;
            break;
        
        case 'yy/mm/dd':
            date = y + "/" + m + "/" + d;
            break;
        
        case 'yy-mm-dd':
            date = y + "-" + m + "-" + d;
            break;
        
        case 'mm/dd/yy':
            date = m + "/" + d + "/" + y;
            break;
        
        case 'dd-mm-yy':
            date = d + "-" + m + "-" + y;
            break;
        
        case 'dd/mm/yy':
            date = d + "/" + m + "/" + y;
            break;
        
        default:
            date = d + "." + m + "." + y;
            break;
    }
    
    return date;
}

function caseInsensitiveSort(a, b)
{
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a > b ? 1 : (a < b ? -1 : 0);
}

function ucfirst(text)
{
    return text.charAt(0).toUpperCase() + text.slice(1)
}

function getColorList()
{
    return [ '#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395', '#994499', '#22aa99', '#cccccc' ];
}

function isValidUrl(domain)
{
    var options = getOptions();
    return urlPattern.test(domain) == true && isDomainHidden(options, domain) == false;
}

function isEmpty(obj)
{
    for (var i in obj)
    {
        return false;
    }
    
    return true;
}

function getVisits()
{
    var visits = storage_get('visits');
    if (visits == undefined)
    {
        visits = {};
        setVisits(visits);
    }
    if (arguments.length > 0)
    {
        if (visits[arguments[0]] != undefined)
        {
            visits[arguments[0]];
            return visits[arguments[0]];
        }
        return {};
    }
    return visits;
}

function setVisits(visits)
{
    storage_set('visits', visits);
}

function getDateToday()
{
    var date = getFormatedDate(new Date());
    return date;
}


function openTabOnce(url)
{
    chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT},function(tab){
        var openTab = null;
        var expression = /#.+$/gi;
        var tabUrlNoHash;
        var updateObject = {active: true};
        $.each(tab, function(i) {
            tabUrlNoHash = tab[i].url.replace(expression, '');
            destUrlNoHash = url.replace(expression, '');
            if (tabUrlNoHash == destUrlNoHash)
            {
                openTab = tab[i];
                if (tabUrlNoHash != url)
                {
                    updateObject.url = url;
                }
            }
        });

        if (openTab == null)
        {
            chrome.tabs.create({url: url});
        }
        else
        {
            chrome.tabs.update(openTab.id, updateObject);
            chrome.tabs.reload(openTab.id);
        }
    });
}