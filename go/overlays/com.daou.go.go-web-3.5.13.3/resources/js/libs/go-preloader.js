;(function( $, window, document, undefined ) {
    
    var // 플러그인 이름
        pluginName = "goPreloader", 
        // 기본값 설정
        defaults = {
            classnames: "overlay",
            fadeoutTime: 500, 
            lazy: false
        };
    
    function Plugin( el, options ) {
        this.el = el;
        this.$el = $(this.el);
        this.options = $.extend( {}, defaults, options || {} );      
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    };
    
    Plugin.prototype = {
        init: function() {
      
        }, 
        
        render: function() {
            if( this.options.classnames ) {
                this.$el.addClass( this.options.classnames );
            }
            
            this.$el.show();
            $(document).trigger("showLayer.goLayer");
        }, 
        
        release: function() {
            //this.$el.fadeOut(this.options.fadeoutTime, $.proxy(function() {
                this.$el.remove();
                $(document).trigger("hideLayer.goLayer");
            //}, this));
            window["GO_Preloader"] = null;
        }, 
        
        option: function( key, value ) {
            if( $.isPlainObject( key ) ){
                this.options = $.extend( true, this.options, key );
            } else if ( key && typeof value === "undefined" ){
                return this.options[ key ];
            } else {
                this.options[ key ] = value;
            }
        }
    };
    
    $.fn[pluginName] = function( options ) {
        var opts = Array.prototype.slice( arguments, 1 );
        
        return this.each(function () {
            var instance;
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin( this, options || {} ));
            };
            
            instance = $.data(this, "plugin_" + pluginName);

            if( !instance.options.lazy && ($.isPlainObject( options ) || ($.type(options) === 'undefined')) ) {
                instance.render();
            } else if($.type(options) === 'string' && /*options[0] !== '_' &&*/ instance[options] ) {
                instance[options].apply( instance, opts );
            } else {
                throw new Error( "지원하지 않는 옵션입니다." );
            };
        });
        
    };
    
    // 전역 Overlay
    $[pluginName] = function() {

        //GO-22928 프로그래화면이 중복실행되면 화면이 안없어지는 경우가 있음
        $('#preloaderOverlay').remove();
        
        var el = $('<div id="preloaderOverlay" style="z-index: 100" data-layer><div class="processing"></div></div>').hide().appendTo('body');
        el[pluginName].call(el);
        
        return el.data("plugin_" + pluginName);
    };
    
})( jQuery, window, document );