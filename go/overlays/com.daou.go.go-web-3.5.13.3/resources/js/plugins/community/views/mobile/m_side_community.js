(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app", 
		"hgn!community/templates/mobile/m_side",
		"i18n!community/nls/community", 
		"i18n!nls/commons",
        "community/collections/community_list",
	],
	function(
		$, 
		Backbone, 
		GO, 
		sideMenuTpl, 
		communityLang,
		commonLang,
		communityCollection
	) {
		var lang = {
			'join_community': communityLang['가입 커뮤니티'],
			'join_community_null' : communityLang['가입된 커뮤니티가 없습니다.'],
		}
		
		var SideView = Backbone.View.extend({
			events : {
				"vclick a[data-id]" : "goCommunity"
			},
			
			initialize : function(options) {
				this.options = options || {};
				var self = this;
				this.collection = new communityCollection();
			},
			render : function(options) {
				var self = this;
				
				this.packageName = this.options.packageName;
				var deferred = $.Deferred();
				
				this.collection.type = 'joined';
				this.collection.fetch({
					"async" : true,
					success : function(collection){
						var sideHtml = sideMenuTpl({
							title : lang.join_community,
							dataSet : collection.toJSON(),
							hasNewPost : function() {
								if(this.newPostCount > 0){
									return true;
								}else{
									return false;
								}
							}
						});
						
						self.$el.html(sideHtml);
						
						deferred.resolveWith(self, [self]);
					}
				});
				
	            return deferred;
			},
			
			goCommunity : function(e){
				var currentEl = $(e.currentTarget),
					communityId = currentEl.attr("data-id");
				
				GO.router.navigate('community/'+communityId, true);
			},

			setSideApp : function() {
				$('body').data('sideApp', this.packageName);
			}
		}, {
            __instance__: null, 
            create: function(packageName) {
               this.__instance__ = new this.prototype.constructor({'packageName':packageName});// if(this.__instance__ === null) 
                return this.__instance__;
            }
        });
		
		return SideView;
	});
}).call(this);