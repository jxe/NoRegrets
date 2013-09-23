var options;

function write(){//write today stats in localstorage
    var date = getDateToday();
    var visits = getVisits();
    visits[date] = getVisits(date);
    setVisits(visits);
}

function fnGetDomain(url){
    return (url.match(/:\/\/(.[^/]+)/)[1]).replace('www.','');
}

checkHistoryLength();

////////////   N E W   S Y S T E M   ///////////

var control = {
    savePrefActive: true,
    focusActive: true,
    tempVisits: {},
    iconCounter: 0,
    iconLastDomain: '',
    init: function(){
        wips.init();
        options = getOptions();
        chrome.browserAction.setBadgeBackgroundColor({color:[0, 100, 0, 210]});
    },
    checkActualUrl: function(url,tabId){
        var domain = get_hostname_from_url(url);
        if(this.tempVisits[domain]){
            this.tempVisits[domain] ++;
        }else{
            this.tempVisits[domain] = 1;
        }
        this.iconCounter++;
        if(this.iconCounter > 10 || this.iconLastDomain != domain){
            this.changeIconTime(domain,tabId);
            this.iconCounter = 0;
            this.iconLastDomain = domain;
        }
    },
    saveTempProfiles: function(){
        if(this.savePrefActive){
            var visits = this.getPrefObject('visits');
            var date = getDateToday();
            if(!visits[date]){
                visits[date] = {};
            }
            for(var domain in this.tempVisits){
                var time = this.tempVisits[domain];
                if(visits[date][domain]){
                    visits[date][domain] += time;
                }else{
                    visits[date][domain] = time;
                }
                this.tempVisits[domain] = 0;
                if(!checkSiteInCategories(domain)){
                    addSiteToCategory(domain);
                }
            }
            this.setPrefObject('visits',visits);
            this.savePrefActive = false;
        }
    },
    changeIconTime: function(domain,tabId){
        var visits = this.getPrefObject('visits');
        var date = getDateToday();
        if(visits[date] && visits[date][domain]){
            var time = visits[date][domain];
            var minutes = time/60 - ((time/60)%1);
            if (minutes<60)
            {
                chrome.browserAction.setBadgeText({"text": minutes.toString()+ chrome.i18n.getMessage("m"), "tabId": tabId});
            } else {
                if (minutes<60*24)
                {
                    var hours=time/3600 - ((time/3600)%1);
                    chrome.browserAction.setBadgeText({"text": hours.toString()+ chrome.i18n.getMessage("h"), "tabId": tabId});
                } else {
                        var days=time/(24*3600) - ((time/(24*3600))%1);
                        chrome.browserAction.setBadgeText({"text": days.toString()+ chrome.i18n.getMessage("d"), "tabId": tabId});
                }
            }
            chrome.browserAction.setTitle( {title:  chrome.i18n.getMessage("siteTitle")+" "+secondsToHourMin(time), tabId: tabId });
        }
    },
    getPrefObject: function(name){
        var visitsStr = wips.getPref(name);
        if(!visitsStr){
            visitsStr = '{}';
        }
        return JSON.parse(visitsStr);
    },
    setPrefObject: function(name,data){
        wips.setPref(name,JSON.stringify(data));
    }
}

// POSLUCHACE / INTERVALY

window.setInterval(function(){
    if(control.focusActive){
        chrome.tabs.getSelected(null, function(tab){
            if(tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1){
                var options = getOptions();
                chrome.idle.queryState(options.idle_time,function(newState){
                    if(newState == 'active'){
                        control.savePrefActive = true;
                        control.checkActualUrl(tab.url,tab.id);
                    }
                });
            }
        });
    }
    //console.log(JSON.stringify(control.tempVisits));
},1000);

window.setInterval(function(){
    control.saveTempProfiles();
},10000);

chrome.windows.onFocusChanged.addListener(function(windowId) {
    if(windowId != chrome.windows.WINDOW_ID_NONE){
        setTimeout(function(){
            control.focusActive = true;
        },100);
    }else{
        control.focusActive = false;
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo){
    control.focusActive = true;
});

// load
window.addEventListener("load",function(){  
    control.init();  
},false);