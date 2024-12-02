(function() {
    define([
        "views/layouts/default", 
        "community/views/side",
        "community/views/side2"
    ], 

    function(
        DefaultLayout, 
        SideView,
        SideView2
    ) {
        var instance = null,
        	__super__ = DefaultLayout.prototype, 
            _slice = Array.prototype.slice, 
            CommunityDefaultLayout;

        CommunityDefaultLayout = DefaultLayout.extend({
            contentTopView: null,
            sideView : null,
            sideView2 : null,
            communityId: -1, 
            type: 'home', 
            initialize: function() {
                var args = _slice.call(arguments);
              //  this.contentTopView = new ContentTopView();
                this.contentTopView = {};
                __super__.initialize.apply(this, args);
                
            }, 
            
            setTitle: function(html) {
                /*this.contentTopView.setTitle(html);
                return this;*/
            }, 
            
            setSideType: function(type) {
            	this.type = type;
            	return this;
            }, 
            
            setCommunityId: function(id) {
            	this.communityId = id;
            	return this;
            },
            
            setBoardId: function(id) {
            	this.boardId = id;
            	return this;
            }, 

            // Override
            render: function() {
                var self = this;
                self.appName = 'community';
                return __super__.render.apply(this).done(function() {
                    self.renderSide();
                    // 타이틀 렌더링
                    self.renderContentTop(); 
                });
            }, 

            renderContentTop: function() {
              /*  this.contentTopView.render();
                this.getContentElement().empty().append(this.contentTopView.el);*/
            }, 

            renderSide: function() {
            	
            	if(this.type == 'list') {
            		//if(this.sideView === null) this.sideView = new SideView();
            		this.sideView = new SideView();
            		this.sideView.render();
            	} else {
                	//if(this.sideView2 === null) this.sideView2 = new SideView2();
            		this.sideView2 = new SideView2();
                	this.sideView2.render(this.communityId, this.boardId);
                	
            	}            	            	
            }, 

            getContentElement: function() {
                return this.$el.find('.go_content');
            }, 

            getSideElement: function() {
               return this.$el.find('#side'); 
            }
        }, {
            __instance__: null, 

            create: function() {
                if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                return this.__instance__;
            }
        });
        
        return CommunityDefaultLayout;
    });
}).call(this);