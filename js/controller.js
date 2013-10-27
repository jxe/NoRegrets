// controller.js

// TODO: 
// * check history in Page.is_ripe_for_review
// * show and hide review prompt
// * replace "Made Up Title" in blur handler
// * support blame url in blur handler
// * check more than direct time in is_ripe_for_review
// * do something with summary_data in show_review_prompt
// * hide_review_prompt
// * call on_rated_time_well_spent & on_rated_suboptimal in review_bar

// LATER
// * firebase version of review db


function fnGetDomain(url){
    if (!url) return;
    var match = url.match(/:\/\/(.[^/]+)/);
    if (!match) return url;
    return (match[1]).replace('www.','');
}


NoRegrets = { currentURL: "", start_time: 0, timer: null };


Controller = {
	on_page_up_for_a_bit: function (url, tab) {
		var summary_data = Page.is_ripe_for_review(url);
		if (summary_data){
			this.show_review_prompt(tab, summary_data);
		}
	},

	show_review_prompt: function(tab, summary_data){
		// TODO: do something with summary_data in show_review_prompt
        chrome.tabs.executeScript(tab, {file: "js/show_review_bar.js"});
	},

	hide_review_prompt: function(tab, page){
		// ??		
	},

	on_rated_time_well_spent: function(url, category){
		Page.store_review_data(url, {tws: category});
		this.hide_review_prompt();
	},

	on_rated_suboptimal: function(url, wish){
		Page.store_review_data(url, {wish: wish});
		this.hide_review_prompt();
	},


    on_user_focused_on_url: function(url, tab) {
        url = fnGetDomain(url);
        if (!url) return;
        if (NoRegrets.currentURL && NoRegrets.currentURL != url) NoRegrets.on_user_blurred_on_url();
        NoRegrets.currentURL = url;
        NoRegrets.start_time = new Date();
        if (!tab) return;
        if (NoRegrets.timer) clearTimeout(NoRegrets.timer);
        NoRegrets.timer = setTimeout(function(){
        	if (NoRegrets.currentURL == url){
        		this.on_page_up_for_a_bit(url, tab);
        	}
        }, 5*1000);
    }, 

    on_user_blurred_on_url: function(url) {
        url = url || NoRegrets.currentURL;
        url = fnGetDomain(url);
        if (!url) return;
        var blame_url = null;
        var t1 = (new Date()).getTime();
        var dt = t1 - NoRegrets.start_time.getTime();
        NRHistory.add(t1, dt, url, "Made Up Title", blame_url);
    },




	init: function(){

		chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
		    if(tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1){
		        if(changeInfo.status == 'complete'){
		            Controller.on_user_focused_on_url(tab.url, tab);
		        }
		    }
		});

		chrome.tabs.onCreated.addListener(function(tab){
		    if((tab.url.indexOf("http://") != -1 || tab.url.indexOf("https://") != -1)){
		        Controller.on_user_focused_on_url(tab.url, tab);
		    }
		});

		chrome.tabs.onRemoved.addListener(function(tabId,removeInfo){
		    console.log("tab removed");
		    Controller.on_user_blurred_on_url();
		});

		chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
		    if(request.akce == 'content'){
		        if (request.focus == 'focus') {
		            Controller.on_user_focused_on_url(request.url);
		        } else if (request.focus == 'blur') {
		            Controller.on_user_blurred_on_url(request.url);
		        }
		    }
		});

	}
};


Controller.init();
