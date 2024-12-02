define(function(require) {
	
	var DefaultLayout = require('views/layouts/default');
    var SideView = require('board/views/side');

    var BoardDefaultLayout = DefaultLayout.extend({
        contentTopView: null,
        sideView : null,
        contentView: null,
        
        name: 'board', 
        
        initialize: function() {
        	console.debug('[board] BoardDefaultLayout:initialize call');
            DefaultLayout.prototype.initialize.apply(this, arguments);
            
            this.contentTopView = null;
            this.sideView = null;
        }, 
        
        /**
         * @Override
         */
        render: function() {
        	console.debug('[board] BoardDefaultLayout:render call');
        	
        	var self = this;
            this.appName = 'board';
        	return DefaultLayout.prototype.render.apply(this, arguments).done(function() {
        		self.renderSide();
        	});
        }, 
        
        /**
         * @Override
         */
        remove: function() {
        	DefaultLayout.prototype.remove.apply(this, arguments);
        	
        	this.contentTopView.remove();
        }, 
        
        /**
         * @Override
         */
        clearSide: function() {
        	console.debug('[board] BoardDefaultLayout:clearSide call');
        	
        	// 지우면 안되고, 비우기만 해야 한다.
        	this.sideView.undelegateEvents();
        	this.sideView.$el.empty();
        	this.sideView = null;
        },
        
        setTitle: function(html) {
           this.contentTopView.setTitle(html);
           return this;
        }, 

        renderSide: function() {
        	console.debug('[board] BoardDefaultLayout:renderSide call');
        	
        	if(this.isMe() && this.sideView === null) {	// 사이드뷰가 그려지지 않았다면 그린다.
        		this.sideView = new SideView();
        		this.sideView.setElement(this.$('#side'));
        		this.sideView.render();
        	} else if(this.isMe() && this.sideView) {		// 사이드뷰가 이미 그려져있다면, 현재 게시판에 대한 선택만 수행
        		this.sideView.selectSideMenu();
        	}
        },
        initPrintPopMarkup: function() {
            $('body').empty().addClass('print wrap_fix_body').append("<div id='content' class='layer_normal layer_print popup'></div>");
        }
    }, {
        __instance__: null,

        create: function() {
            if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
            return this.__instance__;
        },

        render: function() {
            var instance = this.create(),
                args = arguments.length ? Array.prototype.slice.call(arguments) : [];

            return this.prototype.render.apply(instance, args);
        },
        
        getInstance: function(options) {
            var opt = _.isUndefined(options) ? {} : options;

            if(this.__instance__ === null) {
                this.__instance__ = new this.prototype.constructor({
                    isPopup : _.isUndefined(opt.isPopup) ? false : true
                });
            }
            return this.__instance__;
        }
    });
    
    return BoardDefaultLayout;
});
