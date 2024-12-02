(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app", 
		"community/models/community_info",
		"community/collections/community_boards",
		"hgn!board/templates/mobile/m_side",
		"i18n!board/nls/board", 
		"i18n!nls/commons"
	],
	function(
		$, 
		Backbone, 
		GO, 
		CommunityModel,
		BoardsCollection,
		sideMenuTpl, 
		boardLang,
		commonLang
	) {
				
		var SideView = Backbone.View.extend({
			id: 'communitySideMenu',
			/*events : {
				'vclick h3' : 'goCommunityHome',
				'vclick a[data-navigate]' : 'goBoard'
			},*/
			unBindEvent : function() {
				this.$el.off('vclick', 'h3');
				this.$el.off('vclick', 'a[data-navigate]');
			},
			bindEvent : function() {
				this.$el.on('vclick', 'h3', $.proxy(this.goCommunityHome, this));
				this.$el.on('vclick', 'a[data-navigate]', $.proxy(this.goBoard, this));
			},
			initialize : function(options) {
				this.options = options || {};
				var self = this;
				this.collection = new BoardsCollection();
				this.collection.status = 'active';
				this.collection.on('reset', function( response, collection ) {
					self.renderBoardsList();
				});
				/*
				this.unBindEvent();
				this.bindEvent();*/
			},
			render : function(options) {
				var self = this;
				
				this.packageName = this.options.packageName;
				var deferred = $.Deferred();

				if(this.communityId != options.communityId) {
					this.communityId = options.communityId;
					this.model = CommunityModel.read({ communityId : this.communityId });
					this.collection.communityId = this.communityId;
					this.collection.fetch({ data : { offset : 100, page : 0 }, reset:true}).done(function() {
						deferred.resolveWith(self, [self]);
					});
					this.setSideApp();
				} else {
					deferred.resolveWith(this, [this]);
				}
				
				this.unBindEvent();
				this.bindEvent();
				
	            return deferred;
			},
			renderBoardsList : function() {
				
				var menus = [];
				$(this.collection.toJSON()).each(function(i, v) {
					if(v.type == 'BOARD') {
						menus.push({
							iconCls : function() {
								return this.boardType == 'CLASSIC' ? 'ic_classic' : 'ic_feed';
							},
							name : v.board.name,
							publicFlag : v.board.publicFlag, 
							navigate : 'community/'+this.communityId+'/board/'+v.board.id,
							boardType : v.boardType
						});
					}
				});
				
				this.$el.html( sideMenuTpl({
					'title' : this.model.get('name'),
					'menus' : menus,
					'hasMenu?' : function() {
						return menus.length > 0;
					}
				}));
			},
			setSideApp : function() {
				$('body').data('sideApp', this.packageName);
			},
			goCommunityHome : function(e) {
				$(e).focusout().blur();
				GO.router.navigate('community/'+this.communityId, true);
				return false;
			},
			goBoard : function(e) {
				var eTarget = $(e.currentTarget),
					navigate = eTarget.attr('data-navigate');
				
				if(navigate) {
					GO.router.navigate(navigate, true);
				}
				return false;
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