(function() {
    define([
        "views/layouts/default", 
        "asset/views/side",
        "views/content_top"
    ], 

    function(
    	DefaultLayout, 
        SideView,
        ContentTopView
    ) {
    	
        var __super__ = DefaultLayout.prototype, 
            _slice = Array.prototype.slice, 
            AssetDefaultLayout;

        AssetDefaultLayout = DefaultLayout.extend({
            contentTopView: null,
            sideView : null,
            initialize: function() {
                var args = _slice.call(arguments);
               // this.contentTopView = new ContentTopView();
                
                __super__.initialize.apply(this, args);
            }, 
            setTitle: function(html) {
               this.contentTopView.setTitle(html);
                return this;
            }, 

            // Override
            render: function() {
            	var self = this;
                this.appName = 'asset';
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

            initSide: function() {
                this.sideView = null;
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
        
        return AssetDefaultLayout;
    });
}).call(this);