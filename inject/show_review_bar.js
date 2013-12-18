if (!window.has_added_no_regrets_iframe){
  window.has_added_no_regrets_iframe = true;  

  var initial_height = "35px";
  var expanded_height = "400px";
  var iframe = document.createElement('iframe');
  iframe.src = chrome.extension.getURL('inject/review_bar.html?param=foo#fragment');
  iframe.style.height = 0;
  iframe.style.width = '100%';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.border = "none";
  iframe.style.zIndex = '938089'; // Some high value
  document.documentElement.appendChild(iframe);

  var bodyStyle = document.body.style;
  var cssTransform = 'transform' in bodyStyle ? 'transform' : 'webkitTransform';
  var cssTransition = 'transition' in bodyStyle ? 'transition' : 'webkitTransition';
  bodyStyle[cssTransform] = 'translateY(0px)';

  function setAnimationStyle( animationString ){
    bodyStyle[cssTransition] = iframe.style[cssTransition] = animationString
  }

  setAnimationStyle('all .4s ease-out')
  
  // Initial open animation
  setTimeout(function(){
    bodyStyle[cssTransform] = 'translateY(' + initial_height + ')';
    iframe.style.height = initial_height
  }, 20)

  // Little bounce on mouse over
  iframe.addEventListener('mouseenter', function() {
    wobble_height = parseInt(initial_height) + 5 + 'px'
  
    // If the shelf is already open, change nothing. Like an oligarch during a financial crisis. 
    if( parseInt(iframe.style.height) > parseInt(wobble_height) ) return;

    setAnimationStyle('all 100ms ease-in')
    iframe.style.height = wobble_height;
    bodyStyle[cssTransform] = 'translateY(' + wobble_height + ')';

    setTimeout(function(){
      iframe.style.height = initial_height;
      bodyStyle[cssTransform] = 'translateY(' + initial_height + ')';
    },100)
  })

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("got something");
    if (request.close_iframe){
      console.log("closing iframe");
      iframe.parentNode.removeChild(iframe);
      bodyStyle[cssTransform] = "translateY(0)";
      sendResponse({done: true});
    }

    if (request.hide_iframe){
      setAnimationStyle('all 350ms ease-in-out')
      iframe.style.height = initial_height;
      bodyStyle[cssTransform] = 'translateY(' + initial_height + ')';
    }

    if (request.open_shelf) {
      setAnimationStyle('all 350ms ease-in-out')
      iframe.style.height = expanded_height;
      bodyStyle[cssTransform] = 'translateY(' + expanded_height + ')';
    }

  });

}
