;(function() {
    define(["app"], function( GO ) {
        var CalendarConfig = GO.BaseModel.extend({
            url: function() {
                return GO.config("contextRoot") + "api/calendarconfig";
            }, 
            
            /**
            캘린더 강제 열람여부

            @method isForceOpen
            @return {Boolean} 강제공개 여부
            */ 
            isForceOpen: function() {
                return this.get("openAuthority") === false;
            }
        }, {
            __instance__: null, 
            
            /**
            싱글톤 인스턴스 생성

            @method create
            @static
            @override
            */ 
            create: function() {
                if(this.__instance__ === null) {
                    this.__instance__ = new this.prototype.constructor();
                    this.getData({async: false});
                }
                return this.__instance__;
            }
        });
        
        return CalendarConfig;
    })
})();