function sendFocus(focus){
    chrome.extension.sendRequest({akce:'content', focus:focus},function(response){});
}

window.addEventListener('focus',function(){
    sendFocus('focus');
},false);

window.addEventListener('blur',function(){
    sendFocus('blur');
},false);