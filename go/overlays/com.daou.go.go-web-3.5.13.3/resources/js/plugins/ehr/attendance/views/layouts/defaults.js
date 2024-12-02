(function() {
    define([
        "views/layouts/default", 
        "ehr/common/views/side",
        "views/content_top"
    ], 

    function(
    	DefaultLayout, 
        SideView,
        ContentTopView
    ) {
    	
        var __super__ = DefaultLayout.prototype, 
            _slice = Array.prototype.slice, 
            AttendanceDefaultLayout;

        AttendanceDefaultLayout = DefaultLayout.extend({
            contentTopView: null,
            sideView : null,
            initialize: function() {
                var args = _slice.call(arguments);
                this.sideView = null;
               // this.contentTopView = new ContentTopView();
                
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
                self.appName = 'ehr';
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
            },
            
            initPopupMarkup: function() {
                $("body").append("<div class='go_renew'><div id='content'></div></div>");
            },
            renderPopupViewer : function(el){
                return $("#content").append(el);
            }
            
        }, {
            create: function() {
                var instance = new this.prototype.constructor();
                return instance;
            }
        });
        
        return AttendanceDefaultLayout;
    });
}).call(this);