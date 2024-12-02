define(function(require) {

    var Backbone = require('backbone');
    var GO = require('app');
    
    require('axisj');
    
    var Scroller; 
    var BaseScroller; 
    var BrowserScroller;
    var AxisJScroller;
    
    BaseScroller = Backbone.View.extend({
        initialize: function(options) {
            var opts = options || {};
            this.scrollContent = this.$el.find('*[data-scrollcontent]') || opts.scrollContent;
            this.scrollAxis = this.$el.data('scroll-axis') || opts.axis || 'xy';
        }, 
        
        render: function() {
            this.$el.data('go-scroller', this);
        },

        /**
         * resizeScroll
         * @abstract
         * @description resize 이벤트 발생시 스크롤 영역 리사이징. 하위뷰에서 구현해야 함.
         */
        resizeScroll: function() {}
    }, {
        /**
         * attachTo
         * @description 하위뷰에서 이 함수를 구현해야 함(IE8에서 this.prototype 을 인식못하는 문제 발생)
         * @abstract
         * @param el
         * @param options
         */
        attachTo: function(el, options) {
        }
    });

    BrowserScroller = BaseScroller.extend({
        initialize: function(options) {
            BaseScroller.prototype.initialize.call(this, options);
            var axisOptions = {
                "x": {"overflow-x" :'auto', "overflow-y" : 'hidden'},
                "y": {"overflow-x" :'hidden', "overflow-y" : 'auto'},
                "xy": {"overflow" :'auto'}
            }[this.scrollAxis];

            this.$el.css(axisOptions);
        }, 
        resizeScroll: function() {
            // 아무것도 하지 않는다.
        }
    }, {
        attachTo: function(el, options) {
            try {
                // IE8에서 lodash의 _.isFunction 함수가 el 객체에 대해 true로 결과를 반환하기 때문에 오류가 발생함
                var instance = new BrowserScroller(_.extend({}, options || {}, {"el": function() { return el; }}));
                instance.render();
                return instance;
            } catch(e) {
                console.log(e.message);
            }
        }
    });
    
    AxisJScroller = BaseScroller.extend({
        initialize: function(options) {
            BaseScroller.prototype.initialize.call(this, options);
            
            var axisOptions = {
                "x": {"xscroll": true, "yscroll": false}, 
                "y": {"xscroll": false, "yscroll": true}, 
                "xy": {"xscroll": true, "yscroll": true}, 
            }[this.scrollAxis], 
            scrollObj;
            
            if(this.scrollContent.length > 0) {
                var $fscroll = $(this.scrollContent[0]);
    
                scrollObj = new AXScroll();
    
                if(!this.$el.attr('id')) {
                    this.$el.attr('id', _.uniqueId('scroll_container_'));
                }
    
                if(!$fscroll.attr('id')) {
                    $fscroll.attr('id', _.uniqueId('scoll_content_'));
                }
    
                scrollObj.setConfig(_.extend({
                    "targetID": this.$el.attr('id'), 
                    "scrollID": $fscroll.attr('id'), 
                    "bounces" : options.bounces || false, 
                }, axisOptions || {}));
    
                this.$el.data('go-scroller', this);
            }
            
            this.scrollObj = scrollObj;
        },
        
        // @Override
        resizeScroll: function() {
            if(this.scrollObj) this.scrollObj.resizeScroll();
        }
        
    }, {
        attachTo: function(el, options) {
            var instance = new AxisJScroller(_.extend(options || {}, {"el": el}));
            instance.render();
            return instance;
        }
    });

    Scroller = {
        attachTo: function($target, options) {
            options = options || {};

            $target.each(function(i, el) {
                var ScrollKlass = getScrollerClass(options);
                ScrollKlass.attachTo(el, options);
            });
            
            function getScrollerClass(options) {
                return {"browser": BrowserScroller, "axisj": AxisJScroller}[options.type || 'axisj'];
            }
        },

        detectScrollWidth: function(){
            var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
                widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
            $outer.remove();
            return 100 - widthWithScroll;
        }
    }

    return Scroller;
});