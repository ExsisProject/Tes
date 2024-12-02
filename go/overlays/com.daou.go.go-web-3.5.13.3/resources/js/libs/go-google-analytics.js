(function(document){
    var global = this,
        GO = global.GO = (global.GO || {}), 
        _slice = Array.prototype.slice;
    
    GO.Analytics = {    	
        init : function(i, s, o, g, r, a, m){
            create.call(this, i, s, o, g, r, a, m);
        },
        
        excute : function(options, page){
        	var opts = options || {};
        	
        	if(!opts.trackerId) {
        		return;
        	}
        	
            ga('create', opts.trackerId, {'userId':opts.userId});
            ga('send', 'pageview', page);
        },
        
        sendEvent : function(category, action, label, value){
        	if(value != undefined){
        		ga('send', 'event', category, action, label, value);
        	}else{
        		ga('send', 'event', category, action, label);
        	}
        }
    };
    
    function create(i, s, o, g, r, a, m){
        i['GoogleAnalyticsObject'] = r; // Acts as a pointer to support renaming.

        // Creates an initial ga() function.  The queued commands will be executed once analytics.js loads.
        i[r] = i[r] || function() {
          (i[r].q = i[r].q || []).push(arguments)
        },

        // Sets the time (as an integer) this tag was executed.  Used for timing hits.
        i[r].l = 1 * new Date();

        // Insert the script tag asynchronously.  Inserts above current tag to prevent blocking in
        // addition to using the async attribute.
        a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    }
    
    //function init() {
        GO.Analytics.init(global, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    //};
}).call(this, document);
