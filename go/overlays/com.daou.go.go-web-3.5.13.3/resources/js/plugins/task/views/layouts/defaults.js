(function() {
    define([
        "views/layouts/default", 
        "task/views/side",
        "views/content_top"
    ], 

    function(
    	DefaultLayout, 
        SideView,
        ContentTopView
    ) {
    	
        var __super__ = DefaultLayout.prototype, 
            _slice = Array.prototype.slice, 
            ReportDefaultLayout;

        ReportDefaultLayout = DefaultLayout.extend({
            contentTopView: null,
            sideView : null,
            initialize: function() {
                var args = _slice.call(arguments);
               // this.contentTopView = new ContentTopView();                
                __super__.initialize.apply(this, args);
                
                this.sideView = null;
                this.contentTopView = null;
            }, 
            setTitle: function(html) {
               this.contentTopView.setTitle(html);
                return this;
            },
            
            sideInit: function() {
                this.sideView = null;
            }, 

            // Override
            render: function() {
            	var self = this;
                self.appName = 'task';
                return __super__.render.apply(this).done(function() {
                    self.renderSide();
                });
            }, 

            renderContentTop: function() {
            	this.contentTopView.render();
                this.getContentElement().empty().append(this.contentTopView.el);
            }, 

            renderSide: function() {   
            	if(this.sideView == null) this.sideView = new SideView();            	
            	this.sideView.render();
            }
            
        }, {
            __instance__: null, 

            create: function() {
                if(this.__instance__ === null) {
                	this.__instance__ = new this.prototype.constructor();
                } 
                return this.__instance__;
            }
        });
        
        return ReportDefaultLayout;
    });
}).call(this);