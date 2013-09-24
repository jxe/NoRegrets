var options;

var DB = {
    add_bout: function(url, json_obj) { localStorage[url] = JSON.stringify(DB.bouts(url).concat([json_obj])); },
    bouts: function(url) { return JSON.parse(localStorage[url] || "[]"); },
    set_opinion: function(url, opinion) { localStorage["opinion:" + url] = opinion; },
    opinion: function(url) { return localStorage["opinion:" + url]; }
};


// TODO: this should be over a 1 week window, not all time
function total_time_spent(bouts){
    var sum = 0;
    for (var i = bouts.length - 1; i >= 0; i--) {
        sum += (bouts[i].end_time - bouts[i].start_time)
    }
    return sum;
}

function fnGetDomain(url){
    if (!url) return;
    var match = url.match(/:\/\/(.[^/]+)/);
    if (!match) return url;
    return (match[1]).replace('www.','');
}

// bouts totaling > 1h and at least 5d ago and within 1wk of one another
function contains_week_of_pain(bouts){
    // FIXME: i'm going to cheat for the moment and just add all the bouts
    var sum = total_time_spent(bouts);
    if (sum > 1*60*60*1000) return true;
    else return false;
}


var NoRegrets = {
    currentURL: "",
    start_time: 0,

    user_focused_on_url: function(url) {
        url = fnGetDomain(url);
        if (!url) return;
        if (NoRegrets.currentURL && NoRegrets.currentURL != url) NoRegrets.user_blurred_on_url();
        console.log('focusing: ' + url);
        NoRegrets.currentURL = url;
        NoRegrets.start_time = new Date();

        if (NoRegrets.should_display_review_for_URL(url)){
            chrome.tabs.executeScript(null, {file: "js/show_review_bar.js"});
        } else if (NoRegrets.should_display_past_regret_for_URL(url)) {
            chrome.tabs.executeScript(null, {file: "js/show_regret_bar.js"});
        }
    }, 

    user_blurred_on_url: function(url) {
        url = url || NoRegrets.currentURL;
        url = fnGetDomain(url);
        if (!url) return;
        console.log('blurring: ' + url);
        DB.add_bout(url, {
            start_time: NoRegrets.start_time.getTime(),
            end_time: (new Date()).getTime()
        })
    },

    should_display_others_regret_for_URL: function(url) {
        url = fnGetDomain(url);
        if (!url) return;
        return false;
    },

    should_display_past_regret_for_URL: function(url) {
        url = fnGetDomain(url);
        if (!url) return;
        var opinion = DB.opinion(url);
        if (opinion && opinion.would_rather_be) return true;
        // if (tab.url.indexOf("facebook") != -1) return true;
    },

    should_display_review_for_URL: function(url) {
        url = fnGetDomain(url);
        if (!url) return;
        var opinion = DB.opinion(url);
        if (opinion) return false;
        if (contains_week_of_pain(DB.bouts(url))) return true;
        // if (tab.url.indexOf("buzzfeed") != -1) return true;
        return false;
    },

    info_for_URL: function(url) {
        url = fnGetDomain(url);
        if (!url) return;
        var result = { url: url };
        result.opinion = DB.opinion(url);
        result.bouts = DB.bouts(url);
        result.total_time_spent = total_time_spent(result.bouts)
        return result;
    }

    // returns array of URL info
    // last_week_URLs: function() {},

    // returns array of URL info
    // most_regretted_URLs: function() {},

    // returns array of URL info
    // least_regretted_URLs: function() {},
};



// tabs created/loaded/removed

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if(tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1){
        if(changeInfo.status == 'complete'){
            NoRegrets.user_focused_on_url(tab.url);
        }
    }
});

chrome.tabs.onCreated.addListener(function(tab){
    if((tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1)){
        NoRegrets.user_focused_on_url(tab.url);
    }
});

chrome.tabs.onRemoved.addListener(function(tabId,removeInfo){
    console.log("tab removed");
    NoRegrets.user_blurred_on_url();
});



// window and page focused/blurred

// ....






// content load
// chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
//     if(request.akce == 'content_load'){
//         wipstats.everyUrlStopLoadTime(sender.tab.id);
//     }
// });

// chrome.windows.onFocusChanged.addListener(function(windowId) {
//     if(windowId != chrome.windows.WINDOW_ID_NONE){
//         setTimeout(function(){
//             control.focusActive = true;
//         },100);
//     }else{
//         control.focusActive = false;
//     }
// });

// chrome.tabs.onActivated.addListener(function(activeInfo){
//     control.focusActive = true;
// });



// URL info
// var example_url_info_obj = {
//     blamed_url: "",
//     titles: [],
//     total_time_spent: 3,
//     bouts: [{
//         start_time:3,
//         end_time:3,
//         titles: []
//     }],
//     your_opinion: {
//         was_well_spent: false,
//         well_spent_because: "",
//         rather_be: ""
//     },
//     popular_opinions: [{
//         was_well_spent: false,
//         well_spent_because: "",
//         rather_be: ""
//     }]
// };


////////////   N E W   S Y S T E M   ///////////


// window.setInterval(function(){
//     if(control.focusActive){
//         chrome.tabs.getSelected(null, function(tab){
//             if(tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1){

//                 // var options = getOptions();
//                 // chrome.idle.queryState(options.idle_time,function(newState){
//                 //     if(newState == 'active'){
//                 //         control.savePrefActive = true;
//                 //         control.checkActualUrl(tab.url,tab.id);
//                 //     }
//                 // });
//             }
//         });
//     }
//     //console.log(JSON.stringify(control.tempVisits));
// },1000);

// window.setInterval(function(){
//     control.saveTempProfiles();
// },10000);
