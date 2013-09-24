// HLAVNI OBJEKT

var wips = {
    new_client_id: undefined,
    otherExt: [],
    delayId: [],
    tempContextPage: false,
    uuidGenerator: function(){
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },
    getPref: function(name){
        var value = localStorage[name];
        if(value == 'false')
            return false;
        else
            return value;
    },
    setPref: function(name,value){
        localStorage[name] = value;
    },
    openUrl: function(url){
        chrome.tabs.create({
            url: url
        });
    },
    init: function(){
        if(!this.getPref('extension_id')){
            this.setPref('stats',true);
            wips.setPref('update_notify_first_set',true);
            wips.setPref('update_notify_active',true);
        }
    }
}
