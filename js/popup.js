function summarize_user_count_and_hours(subtree, what){
  return subtree.ct + " users who've spent a collective " + moment.duration(subtree.dt).humanize() + " found it " + what;
}

function total_time_string(data){
  var total_time = 0;
  if (data["tws:*"]) total_time += data["tws:*"].dt;
  if (data["suboptimal:*"]) total_time += data["suboptimal:*"].dt;
  return "No Regrets users have spent <b>" + moment.duration(total_time).humanize() +"</b> here. ";
}

function cute_summary_of_ratings(data){
  var findings = [];
  var str = '';

  if (data["tws:*"]) findings.push(summarize_user_count_and_hours(data["tws:*"], "time well spent"));
  if (data["suboptimal:*"]) findings.push(summarize_user_count_and_hours(data["suboptimal:*"], "suboptimal"));

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

	document.getElementById('domain').innerHTML = domain;

	if (your_review && your_review.rating){
		var parts = your_review.rating.split(':');
		if (parts[0] == 'tws'){
			document.getElementById('you_summary').innerHTML = "You said it was Time Well Spent!";
		} else {			
			document.getElementById('you_summary').innerHTML = "You said you wish you'd: <b>" + parts[1] + "</b>";
		}
	} else {
		document.getElementById('you_summary').innerHTML = "You haven't reviewed this yet.";
	}

	console.log(domain);
	Page.common_ratings(domain, function(answer){
		console.log(answer);
		if (answer){
			document.getElementById('community_summary').innerHTML = total_time_string(answer);
		} else {
			document.getElementById('community_summary').innerHTML = "No Regret users are new to this site.";
		}
		
	});
});
