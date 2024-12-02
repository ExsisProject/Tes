define('docs/controllers/mobile', function() {
    
	// mobile router object
	var r = {};
	var self = this;
	var appName = 'docs';
	var LayoutView = null;
	
    function toggleSearchBtn(flag){
    	LayoutView.$('#btnHeaderSearch').toggle(flag);
    }
	
    function renderSide(){
	    require(["docs/views/mobile/side"], function(SideView) {
	    	var View = SideView.create(appName);
			if($('body').data('sideApp') != appName) {
				View.render().done(function(sideView) {
					var sideEl = LayoutView.getSideContentElement().append(sideView.el);
					GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
					sideEl.parent().hide();
				});
			} else {
				View.refreshWaitingCount();
			}
	    });
    }

    r.docsHome = function(){
	    require(["views/layouts/mobile_default", "docs/views/mobile/docslist/base_docs_list"], function(MobileLayout, HomeView) {
	    	LayoutView = MobileLayout.create();
	    	LayoutView.render(appName).done(function(){
	    		toggleSearchBtn(true);
				renderSide.call(self);
				var view = new HomeView({
					folderType : "approvewaiting",
					isHome : true
				});
				view.render();
            });
	    });
    };
    
    r.renderFolderList = function(folderId) {
    	require(["views/layouts/mobile_default", "docs/views/mobile/docslist/base_docs_list"], function(MobileLayout, ForlderView) {
	    	LayoutView = MobileLayout.create();
	    	LayoutView.render(appName).done(function(){
	    		toggleSearchBtn(true);
				renderSide.call(self);
				var view = new ForlderView({
					folderId : folderId
				});
				view.render();
			});
	    });
    };
    
    r.renderLatestRead = function() {
    	require(["views/layouts/mobile_default", "docs/views/mobile/docslist/base_docs_list"], function(MobileLayout, LatestReadView) {
	    	LayoutView = MobileLayout.create();
	    	LayoutView.render(appName).done(function(){
	    		toggleSearchBtn(true);
				renderSide.call(self);
				var view = new LatestReadView({
					folderType : "latestread"
				});
				view.render();
			});
	    });
    };
    
    r.renderLatestUpdate = function() {
    	require(["views/layouts/mobile_default", "docs/views/mobile/docslist/base_docs_list"], function(MobileLayout, LatestUpdateView) {
	    	LayoutView = MobileLayout.create();
	    	LayoutView.render(appName).done(function(){
	    		toggleSearchBtn(true);
				renderSide.call(self);
				var view = new LatestUpdateView({
					folderType : "latestupdate"
				});
				view.render();
			});
	    });
    };
    
    r.renderApproveWaiting = function() {
    	require(["views/layouts/mobile_default", "docs/views/mobile/docslist/base_docs_list"], function(MobileLayout, ApproveWaitingView) {
	    	LayoutView = MobileLayout.create();
	    	LayoutView.render(appName).done(function(){
	    		toggleSearchBtn(true);
				renderSide.call(self);
				var view = new ApproveWaitingView({
					folderType : "approvewaiting"
				});
				view.render();
			});
	    });
    };
    
    r.renderRegistWaiting = function() {
    	require(["views/layouts/mobile_default", "docs/views/mobile/docslist/base_docs_list"], function(MobileLayout, RegistWaitingView) {
	    	LayoutView = MobileLayout.create();
	    	LayoutView.render(appName).done(function(){
	    		toggleSearchBtn(true);
				renderSide.call(self);
				var view = new RegistWaitingView({
					folderType : "registwaiting"
				});
				view.render();
			});
	    });
    };
    
    r.search = function() {
		require(["views/layouts/mobile_default", "docs/search/views/mobile/search"], function(MobileLayout, View) {
			LayoutView = MobileLayout.create();
			LayoutView.render(appName).done(function(){
				toggleSearchBtn(true);
				var view = new View();
				view.setElement(this.$('.go_content'));
				view.render();
			});
		});
	};

    r.detail = function(docsId) {
		require(["views/layouts/mobile_default", "docs/views/mobile/detail"], function(MobileLayout, DetailView) {
			LayoutView = MobileLayout.create();
			LayoutView.render(appName).done(function(){
				toggleSearchBtn(true);
				var view = new DetailView({
                    docsId : docsId
                });
                view.dataFetch().then(function() {
                    view.render();
                });
			});
		});
	};

	r.renderDocsAttaches = function(docsId) {
		require(["views/layouts/mobile_default", "docs/views/mobile/docs_attaches"], function(MobileLayout, DocsAttachesView) {
			LayoutView = MobileLayout.create();
			LayoutView.render(appName).done(function(){
				var view = new DocsAttachesView({
					docsId : docsId
				});
				view.dataFetch().then(function() {
					view.render();
				});
			});
		});
	};

	r.renderDocsVersion = function(docsId) {
		require(["views/layouts/mobile_default", "docs/views/mobile/docs_version"], function(MobileLayout, DocsVersionView) {
			LayoutView = MobileLayout.create();
			LayoutView.render(appName).done(function(){
				var view = new DocsVersionView({
					docsId : docsId
				});
				view.dataFetch().then(function() {
					view.render();
				});
			});
		});
	};

    r.reply = function(docsInfoId) {
		require(["views/layouts/mobile_default", "docs/views/mobile/docs_reply"], function(MobileLayout, ReplyView) {
			LayoutView = MobileLayout.create();
			LayoutView.render(appName).done(function(){
				toggleSearchBtn(true);
				var view = new ReplyView({
                    docsInfoId : docsInfoId
                });
                view.render();
			});
		});
	};

    r.reject = function(docsId) {
		require(["views/layouts/mobile_default", "docs/views/mobile/docs_reject"], function(MobileLayout, RejectView) {
			LayoutView = MobileLayout.create();
			LayoutView.render(appName).done(function(){
				toggleSearchBtn(true);
				var view = new RejectView({
                    docsId : docsId
                });
                view.render();
			});
		});
	};

	return r;
});
