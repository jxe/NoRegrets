    var height = "100px";
    var iframe = document.createElement('iframe');
    iframe.src = chrome.extension.getURL('review_bar.html');
    iframe.style.height = "200px";
    iframe.style.width = '100%';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.zIndex = '938089'; // Some high value
    document.documentElement.appendChild(iframe);

    var bodyStyle = document.body.style;
    var cssTransform = 'transform' in bodyStyle ? 'transform' : 'webkitTransform';
    bodyStyle[cssTransform] = 'translateY(' + height + ')';
