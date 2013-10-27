// var DB = {
//     add_bout: function(url, json_obj) { localStorage[url] = JSON.stringify(DB.bouts(url).concat([json_obj])); },
//     bouts: function(url) { return JSON.parse(localStorage[url] || "[]"); },
//     set_opinion: function(url, opinion) { localStorage["opinion:" + url] = opinion; },
//     opinion: function(url) { return localStorage["opinion:" + url]; }
// };


// // TODO: this should be over a 1 week window, not all time
// function total_time_spent(bouts){
//     var sum = 0;
//     for (var i = bouts.length - 1; i >= 0; i--) {
//         sum += (bouts[i].end_time - bouts[i].start_time)
//     }
//     return sum;
// }

// // bouts totaling > 1h and at least 5d ago and within 1wk of one another
// function contains_week_of_pain(bouts){
//     // FIXME: i'm going to cheat for the moment and just add all the bouts
//     var sum = total_time_spent(bouts);
//     if (sum > 1*60*60*1000) return true;
//     else return false;
// }




// content load

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




    // var height = "100px";
    // var iframe = document.createElement('iframe');
    // iframe.src = chrome.extension.getURL('review_bar.html');
    // iframe.style.height = height;
    // iframe.style.width = '100%';
    // iframe.style.position = 'fixed';
    // iframe.style.top = '0';
    // iframe.style.left = '0';
    // iframe.style.zIndex = '938089'; // Some high value
    // document.documentElement.appendChild(iframe);

    // var bodyStyle = document.body.style;
    // var cssTransform = 'transform' in bodyStyle ? 'transform' : 'webkitTransform';
    // bodyStyle[cssTransform] = 'translateY(' + height + ')';
