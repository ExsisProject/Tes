;(function($, undefined) {
    
    function GOIgnoreDuplicateMethod(delay) {
        this.isIgnore = false;
        this.resizeUID = 0;
        this.delay = delay || 200;
    }
    
    GOIgnoreDuplicateMethod.prototype = {
        setDelay: function(delay) {
            this.delay = delay;
        }, 
        
        bind: function(callback) {
            var self = this,
                args = Array.prototype.slice.call( arguments, 1 );
            
            if(!this.isIgnore) {
                var uid = ++this.resizeUID; 
                setTimeout(function() {
                    if(uid == self.resizeUID && !self.isIgnore) {
                        self.isIgnore = true;
                        callback.apply(undefined, args);
                        self.isIgnore = false;
                    }
                }, this.delay);
            }
        }
    };
    
    window.GOIgnoreDuplicateMethod = GOIgnoreDuplicateMethod;
    return GOIgnoreDuplicateMethod;
    
})(jQuery);