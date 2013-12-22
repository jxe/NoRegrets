var review_data;

$('#bg h1').click(function(){
  if( !window.regret_open ) return
  chrome.runtime.sendMessage({ just_hide: true  }, function(response) {});
})

$('#close').click(function(){
    chrome.runtime.sendMessage({ just_close: true  }, function(response) {});
});

function review_as(rating, followup_action){
    chrome.runtime.sendMessage({
      rating: rating,
      followup_action: followup_action,
      urls: [review_data.url],
      dt: review_data.dt,
      it: review_data.it,
      titles: review_data.titles,
    }, function(response) {});  
}

$('#tws input').on('focus', function(){ $('#suboptimal input').hide(); }).on('blur', function(){ $('#suboptimal input').show(); });
$('#suboptimal input').on('focus', function(){ $('#tws input').hide(); }).on('blur', function(){ $('#tws input').show(); });

$('#tws input').typeahead({
  local: ['creative projects', 'learning', 'porn']
}).on('typeahead:selected change', function(ev, chosen){
  review_as('tws:' + chosen.value);
});

$('#suboptimal input').typeahead({
  local: ['with girlfriend', 'jogging', 'reading a goddamn book']
}).on('typeahead:selected change', function(ev, chosen){
  var val = chosen ? chose.value : this.value;
  review_as('suboptimal:' + val, 'stay_open');
  $('.more').hide();
  $('#followup').show();
  $('#followup textarea').val("Anyone want to go "+val+"? #noregrets");
});

$('#followup button').on('click', function(){
  var msg = $('#followup textarea').val();
  // launch twitter intent
  window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(msg), '_blank', "height=420,width=550,centerscreen,scrollbars=yes,resizable=yes,toolbar=no,location=yes");
  chrome.runtime.sendMessage({ just_close: true  }, function(response) {});
});

function summarize_user_count_and_hours(subtree, what){
  return subtree.ct + " users who've spent a collective " + moment.duration(subtree.dt).humanize() + " found it " + what;
}

function cute_summary_of_ratings(data){
  var findings = [];
  if (!data) return "";
  if (data["tws:*"]) findings.push(summarize_user_count_and_hours(data["tws:*"], "time well spent"));
  if (data["suboptimal:*"]) findings.push(summarize_user_count_and_hours(data["suboptimal:*"], "suboptimal"));
  var str = findings.join(' and ') + "<br>";
  if (data.top_wishes) str += "<br>Those that found it suboptimal wish they'd been: " + data.top_wishes.join(', ');
  return str;
}

$('body').click(function(){
  if( window.regret_open ) return
  chrome.runtime.sendMessage({open_shelf:true})
  window.regret_open = true;
  $('#bg h1').transition({opacity: 0})
  $('.more')
    .transition({
      left: '25%'
    })
  $('#bg .more').fadeIn()
  $('#bg').css('cursor', 'default');
})

console.log('asking for review data');
chrome.runtime.sendMessage({gimme_url_data: "please"}, function(response) {
    review_data = response.url_data;
    console.log("got review_data: ", review_data);
    $('.url').html(response.url_data.url);
    $('#total_direct_time').html(moment.duration(response.url_data.dt, 'ms').humanize());
    $('#title').html(response.url_data.titles[0]);
    $('#others_rated').html(cute_summary_of_ratings(response.url_data.common_ratings));
    var clock = $('.clock').FlipClock(response.url_data.dt/1000);
});
