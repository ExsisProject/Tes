;(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app", 
		"hgn!report/templates/mobile/m_side",
		"i18n!nls/commons",
		"i18n!report/nls/report",
		"report/collections/left_menu",
	    "components/favorite/collections/favorite"
	],
	function(
		$, 
		Backbone, 
		GO, 
		sideMenuTpl, 
		commonLang,
		reportLang,
		LeftMenuCollection,
		FavoriteCollection
	) {
				
		var tplVar = {
				'deptReport' : reportLang["부서별 보고서"],
				'favorite' : commonLang['즐겨찾기'],
				'confirm' : commonLang['확인'],
				'cancel' : commonLang['취소']
			};
		
		var SideView = Backbone.View.extend({
		    id : 'reportSideMenu',
		    events : {
		        "vclick a[data-navigate]" : "goFolder"
		    },
			initialize : function(options) {
				this.options = options || {};
				this.leftMenuCollection = null;
	            this.favoriteCollection = null;
			},
			render : function() {
			    this.packageName = this.options.packageName;
			    this.setSideApp();
			    
			    var self = this;
			    var deferred = $.Deferred();
			    
			    $.when(this.getLeftMenuCollection(), this.getFavoriteCollection()).then(function(){
			    	self.$el.html(sideMenuTpl({
			    		data : self.leftMenuCollection.toJSON(),
			    		isPrivate : function(){
			    			return this.publicOption != "OPEN";
			    		},
			    		hasFavorite : self.favoriteCollection.length == 0 ? false : true,
	    				hasData : self.leftMenuCollection.length == 0 ? false : true,
						favorite : self.favoriteCollection.toJSON(),
						lang : tplVar
			    	}));
			    	
			    	deferred.resolveWith(self, [self]);
			    });
			    
	             return deferred;
			},
			
			getLeftMenuCollection : function(){
				var self = this;
				var deferred = $.Deferred();
				var leftMenuCollection = LeftMenuCollection.create();
				
				leftMenuCollection.fetch({
					async : true,
					success : function(collection){
						self.leftMenuCollection = collection;
						deferred.resolve();
					}
				})
				
				return deferred;
			},
			
			getFavoriteCollection : function(){
				var deferred = $.Deferred();
				var self = this;
				var favoriteColelction = FavoriteCollection.create({url : GO.config("contextRoot") + "api/report/folder/favorite"});
				
				favoriteColelction.fetch({
					data : { offset : 1000 }, 
					async : false, 
					reset: true,
					success : function(collection){
						self.favoriteCollection = collection;
						deferred.resolve();
					}
				})
				
				return deferred;
			},
			
			
			goFolder : function(e){
			    var targetEl = $(e.currentTarget),
			        folderId = targetEl.attr("data-navigate"),
			        url = "report/folder/" + folderId + "/reports";
			        
                GO.router.navigate(url, {trigger: true});
			},
			
            setSideApp : function() {
                $('body').data('sideApp', this.packageName);
            }
		}, {
            __instance__: null, 
            create: function(packageName) {
                this.__instance__ = new this.prototype.constructor({'packageName':packageName}); 
                return this.__instance__;
            }
        });
		
		return SideView;
	});
}).call(this);