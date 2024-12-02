(function($) {
    var G = $.go = function(url, data, arguments){
        $.go.loadApi(this, url, data, arguments);
    };
    
    $.extend(G, {
        version: '0.0.1',
        isDebug: false,
        defaults : {        				 
             qryType                     : 'POST',
             cache                        : true,
             dataType                     : 'json',
             async                        : true,
             contentType                 : 'application/x-www-form-urlencoded',             
             preFn                        : function(){},        
             preArgs                    : {},
             responseFn                    : function(r){ return r; },
             responseArgs                : {}
        },    
        loadApi : function(what, url, data, options){
            // $(what.selector)
            G.api(url, data, options);
        },
        api : function(url, data, options){
            var opts = $.extend({}, G.defaults, options);
            var __successFn = function(returnData){
                try {                    
                    opts.responseFn(returnData, opts.responseArgs);                    
                } 
                catch (err) {
                    if (G.defaults.isDebug) {
                        G._log(err);
                        G._error(returnData.result);
                    }
                }                        
            };
            
            var __failFn = function(returnData){
            	try {                    
            		opts.error(returnData, opts.responseArgs);                  
                } 
                catch (err) {
//                    if (G.defaults.isDebug) {
                    G._log(err);
                    G._error(returnData.result);
//                    }
                }
               // G._error();
            };
            
            try{
                opts.preFn(opts.preArgs);
            }catch(preE){
                // pass
            }
            
            $.ajax({
                url: url,
                data: data,
                type: opts.qryType,                
                dataType: opts.dataType,                
                async: opts.async,
                contentType: opts.contentType,
                timeout : opts.timeout != undefined ? options.timeout : GO.constant("system", "AJAX_TIMEOUT"),
                cache: opts.cache,
                success: __successFn,
                error: __failFn
            });
        },        
        _log : function(log){
            console.log(log);
        },
        _error : function(error){
        	console.log(error);
        }
    });
    
    $.fn.go = function(url, data, options){            
        G.loadApi(this, url, data, options);
        options = options || {};
        index = options.index || 0;
        return this;
    };
  })(jQuery);