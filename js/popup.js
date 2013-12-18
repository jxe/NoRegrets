function summarize_user_count_and_hours(subtree, what){
  return subtree.ct + " users who've spent a collective " + moment.duration(subtree.dt).humanize() + " found it " + what;
}

function cute_summary_of_ratings(data){
  var findings = [];
  var total_time = 0;
  if (data["tws:*"]) total_time += data["tws:*"].dt;
  if (data["suboptimal:*"]) total_time += data["suboptimal:*"].dt;

  var str = "No Regrets users have spent a total of " + moment.duration(total_time).humanize() +" here. ";

  if (data["tws:*"]) findings.push(summarize_user_count_and_hours(data["tws:*"], "time well spent"));
  if (data["suboptimal:*"]) findings.push(summarize_user_count_and_hours(data["tws:*"], "suboptimal"));

  str += findings.join(' and ') + "<br>";
  if (data.top_wishes) str += "<br>Those that found it suboptimal wish they'd been: " + data.top_wishes.join(', ');
  return str;
  // return "Others have rated it: " + JSON.stringify(Object.keys(data));
}


chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
    var tab = tabs[0];
    var url = tab.url;
    var domain = fnGetDomain(url);

	document.getElementById('foo').onclick = function() {
        Controller.show_review_prompt(tab.id, tab.url);
    };

	var summary = NRHistory.query(url);

	var your_review = Page.has_been_reviewed(domain);
	if (your_review) your_review = JSON.parse(your_review);
	console.log(your_review);
	console.log(your_review.rating);
	if (your_review && your_review.rating){
		var parts = your_review.rating.split(':');
		if (parts[0] == 'tws'){
			document.getElementById('you_summary').innerHTML = "You reviewed <b>" + domain + "</b> as Time Well Spent!";
		} else {			
			document.getElementById('you_summary').innerHTML = "When you reviewed <b>" + domain + "</b> you said you wish you'd: " + parts[1];
		}		
	} else {
		document.getElementById('you_summary').innerHTML = "You haven't reviewed this yet.";
	}

	console.log(domain);
	Page.common_ratings(domain, function(answer){
		console.log(answer);
		if (answer){
			document.getElementById('community_summary').innerHTML = cute_summary_of_ratings(answer);
		} else {
			document.getElementById('community_summary').innerHTML = "No Regret users are new to this site.";
		}
		
	});
});
