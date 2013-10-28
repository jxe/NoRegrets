var initial_height = "35px";
var expanded_height = "400px";

var iframe = document.createElement('iframe');
iframe.src = chrome.extension.getURL('inject/review_bar.html?param=foo#fragment');
iframe.style.height = initial_height;
iframe.style.width = '100%';
iframe.style.position = 'fixed';
iframe.style.top = '0';
iframe.style.left = '0';
iframe.style.zIndex = '938089'; // Some high value
document.documentElement.appendChild(iframe);

var bodyStyle = document.body.style;
var cssTransform = 'transform' in bodyStyle ? 'transform' : 'webkitTransform';
var cssTransition = 'transition' in bodyStyle ? 'transition' : 'webkitTransition';
bodyStyle[cssTransform] = 'translateY(' + initial_height + ')';

iframe.addEventListener('mouseover', function() {
	iframe.style[cssTransition] = 'height 1s';
	bodyStyle[cssTransition] = 'all 1s';
	iframe.style.height = expanded_height;
	bodyStyle[cssTransform] = 'translateY(' + expanded_height + ')';
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("got something");
  	if (request.close_iframe){
  		console.log("closing iframe");
  		iframe.parentNode.removeChild(iframe);
  		bodyStyle[cssTransform] = "translateY(0)";
  		sendResponse({done: true});
  	}
});

