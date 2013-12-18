function openRegret(){
  // $('#page')
  //   .transition({scale: .5, boxShadow:"3px 3px 20px rgba(0,0,0,.5)"})

  $('#bg h1')
    .transition({
      fontSize: 30,
      paddingTop: 20,
      left: '25%',
      paddingLeft: 0
    })
    .text( $('#bg h1').text().slice(0,-3))
  
  $('.more')
    .transition({
      left: '25%'
    })

  $('#bg .more').fadeIn()

  console.log($('#bg').css('cursor'))
  $('#bg').css('cursor', 'default')
}

function closeRegret(){
  // $('#page').transition({top: 35})
}


// $('#bg').click(function(){
//   var top = $('#page').offset().top
//   if( top == 35 )
//     openRegret()
//   else
//     closeRegret()
// })

function revealRegret(){
  // $('#page').transition({top: 35})
}

// setTimeout( revealRegret, 700 )

//setTimeout( openRegret, 800)

var review_data;


// Page.add_rating(urls, dt, it, titles, rating)
      // urls: urls,
      // dt: dt, 
      // it: it,
      // titles: titles,
      // rating: rating

$('#close').click(function(){
    chrome.runtime.sendMessage({ just_close: true  }, function(response) {});
});

function review_as(rating){
    chrome.runtime.sendMessage({
      rating: rating,
      urls: [review_data.url],
      dt: review_data.dt,
      it: review_data.it,
      titles: review_data.titles,
    }, function(response) {});  
}

$('#tws').submit(function(){
    var category = prompt("What for?");
    if (category) review_as('tws:' + category);
});

$('#suboptimal').submit(function(){
    var wish = prompt("What do you wish you'd been doing?");
    if (wish) review_as('suboptimal:' + wish);
});

$('#tws input').on('focus', function(){ $('#suboptimal input').hide(); }).on('blur', function(){ $('#suboptimal input').show(); });
$('#suboptimal input').on('focus', function(){ $('#tws input').hide(); }).on('blur', function(){ $('#tws input').show(); });

$('#tws input').typeahead({
  local: ['creative projects', 'learning', 'porn']
}).on('typeahead:selected', function(ev, chosen){
  review_as('tws:' + chosen.value);
});

$('#suboptimal input').typeahead({
  local: ['with girlfriend', 'jogging', 'reading a goddamn book']
}).on('typeahead:selected', function(ev, chosen){
  review_as('suboptimal:' + chosen.value);
});

function summarize_user_count_and_hours(subtree, what){
  return subtree.ct + " users who've spent a collective " + moment.duration(subtree.dt).humanize() + " found it " + what;
}

function cute_summary_of_ratings(data){
  var findings = [];
  if (data["tws:*"]) findings.push(summarize_user_count_and_hours(data["tws:*"], "time well spent"));
  if (data["suboptimal:*"]) findings.push(summarize_user_count_and_hours(data["tws:*"], "suboptimal"));
  var str = findings.join(' and ') + "<br>";
  if (data.top_wishes) str += "<br>Those that found it suboptimal wish they'd been: " + data.top_wishes.join(', ');
  return str;
  // return "Others have rated it: " + JSON.stringify(Object.keys(data));
}

$('body').click(function(){
  chrome.runtime.sendMessage({open_shelf:true})
  window.regret_open = true;
  openRegret();    
})

chrome.runtime.sendMessage({gimme_url_data: "please"}, function(response) {
    console.log("got response to gimme_url_data: " + JSON.stringify(response));
    review_data = response.url_data;
    $('#url').html(response.url_data.url);
    $('#total_direct_time').html(moment.duration(response.url_data.dt, 'ms').humanize());
    $('#title').html(response.url_data.titles[0]);
    $('#others_rated').html(cute_summary_of_ratings(response.url_data.common_ratings));
});
