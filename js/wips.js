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
    setThisExt: function(){
        this.setPref('active',true);
        //zadna dalsi ext + neni id -> registrace, nast. aktivni
        if(!this.getPref('client_id')){
            this.setPref('delay_id',1);
            this.new_client_id = this.uuidGenerator();
            wipstats.register();
        }
        //ostatni
        if(!this.getPref('extension_id') || this.getPref('version')!=chrome.app.getDetails().version){
            this.setPref('version',chrome.app.getDetails().version);
            setTimeout(function(){
                wipstats.registerExt();
            },5000);
        }
        if(this.getPref('active')){
            setTimeout(function(){
                wipstats.checkId();
            },10000);
        }
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
        setTimeout(function(){
            wips.setThisExt();
            wips.setContext();
            wips.updateNotify();
            facebook.init();
        },1000);
    },

    updateNotify: function(){
        if(!wips.getPref('update_notify_first_set')){
            wips.setPref('update_notify_first_set',true);
            wips.setPref('update_notify_active',true);
        }
        if(wips.getPref('update_notify_active')){
            if(wips.getPref('update_notify_id') != '2'){
                wips.setPref('update_notify_id','2');
                chrome.notifications.create(
                    'update_notify',{   
                        type: 'image', 
                        iconUrl: 'images/icon128.png', 
                        title: 'Time Stats New Features', 
                        message: 'Get read for Reports, Alerts and improved sharing experience. Read more here.',
                        imageUrl: 'images/update_notify_1.png',
                        priority: 2
                    },function(){} 
                );
            }
        }
    }
}
