(function() {
    define([
        "views/layouts/default", 
        "report/views/side",
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
                __super__.initialize.apply(this, args);
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
                self.appName = 'report';
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
            create: function() {
                var instance = new this.prototype.constructor();
                return instance;
            }
        });
        
        return ReportDefaultLayout;
    });
}).call(this);