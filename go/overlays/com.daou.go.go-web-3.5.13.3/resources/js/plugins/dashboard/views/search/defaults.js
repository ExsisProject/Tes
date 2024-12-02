(function() {
    define([
        "views/layouts/default", 
        "dashboard/views/search/side"
    ], 

    function(
    	DefaultLayout, 
        SideView
    ) {
    	
        var __super__ = DefaultLayout.prototype, 
            _slice = Array.prototype.slice, 
            DashboardDefaultLayout;

        DashboardDefaultLayout = DefaultLayout.extend({
            contentTopView: null,
            sideView : null,
            initialize: function() {
                var args = _slice.call(arguments);
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
                self.appName = 'dashboard';
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
        
        return DashboardDefaultLayout;
    });
}).call(this);