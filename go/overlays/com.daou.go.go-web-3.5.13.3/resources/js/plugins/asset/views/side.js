(function() {
	define([ 
	        "jquery", 
	        "backbone", 
	        "app",
			'when',
	        "hgn!asset/templates/side",
	        "hgn!asset/templates/side_share_item",
	        "i18n!nls/commons",
	        "i18n!asset/nls/asset",
	        "asset/collections/side",
			"asset/collections/asset_item_list",
			"asset/models/asset_item",
		    "amplify",
			"asset/components/asset_tree/asset_tree"
	],
	function(
			$, 
			Backbone, 
			App,
			When,
			layoutTpl,
			sideShareItemTpl,
			commonLang,
			assetLang,
			sideCollection,
			assetItemsCollection,
			AssetItemModel,
			Amplify,
			AssetTreeMenu
	) {
		var tplVar = {
				'confirm' : commonLang['확인'],
				'cancel' : commonLang['취소'],
				'collapse' : commonLang['접기'],
				'expand' : commonLang['펼치기'],
				'asset_company' : assetLang['전사자산'],
				'asset_title' : commonLang['예약대여'],
				'rental' : assetLang['대여'],
			};
		
		var ASSET_STORE_KEY = GO.session("loginId") + '-asset-toggle';

		var TreeMenuView = AssetTreeMenu.AssetTreeMenuView;

		var SideView = Backbone.View.extend({
			el : '#side',
			assetTreeViews : null,
			unBindEvent : function() {
				this.$el.off("click", "section.lnb span.ic_side[data-slide]");
				this.$el.off("click", "section.lnb a.txt");
				this.$el.off('changeAssetItem');
			},
			bindEvent : function() {
				this.$el.on("click", "section.lnb span.ic_side[data-slide]", $.proxy(this.slideToggle, this));
				this.$el.on("click", "section.lnb a.txt", $.proxy(this.slideToggle, this));
				this.$el.on('changeAssetItem', $.proxy(this.loadAssetMenu, this));
			},
			initialize : function() {
				this.assetTreeViews = [];
				this.loadAssetMenu();
			},
			loadAssetMenu: function() {

				var sideCol = sideCollection.getCollection();
				sideCol.on("reset", _.bind(function(collection){
					var assetTreeViewsIndex = 0;
					var tmpl = layoutTpl({
						contextRoot : GO.contextRoot,
						dataset : collection.toJSON(),
						lang : tplVar,
						companyId : GO.session('companyId'),
						isOpen : this.getStoredCategoryIsOpen(GO.session('companyId') + '-' + ASSET_STORE_KEY),
						appName : GO.util.getAppName("asset")
					});
					this.$el.html(tmpl);

					var $section = this.$el.find('#assetSide');
					var $container = $section.find('ul');
					var elBuff = [];

					var assetList = collection.toJSON();
					var assetTreeNodes = this._getAssetNodes(assetList);

					if(assetTreeNodes.length > 0) {
						this.assetTreeViews[assetTreeViewsIndex] = this._renderMenuTree(assetTreeNodes);
						elBuff.push(this.assetTreeViews[assetTreeViewsIndex].el);
					}
					$container.append.apply($container, elBuff);
					var unfoldAssetList = GO.util.store.get("asset.unfold.list") || [];
					for (var index = 0; index < unfoldAssetList.length; index++) {
						var unfoldAssetId = unfoldAssetList[index];
						this._openDefaultAsset(assetTreeViewsIndex, unfoldAssetId, assetTreeNodes);
					}
					this.loadAssetShareMenu();
				}, this));
			},
			
			loadAssetShareMenu : function(){
				var sideShareCol = sideCollection.getShareCollection();
				sideShareCol.each(function(sideShareItem, idx){
					var sideShares = sideCollection.createCollectionByList(sideShareItem.get('assets'));
						var assetTreeViewsIndex = idx + 1;
						this.$el.append(sideShareItemTpl({
							idx : idx,
							contextRoot : GO.contextRoot,
							companyName : sideShareItem.get('companyName'),
							lang : tplVar,
							companyId : sideShareItem.get('companyId'),
							isOpen : this.getStoredCategoryIsOpen(sideShareItem.get('companyId') + '-' + ASSET_STORE_KEY)
							}));
						var $section = this.$el.find('#assetShareSide_'+idx);
						var $container = $section.find('ul');
						var elBuff = [];
						
						var assetList = sideShares.toJSON();
						var assetTreeNodes = this._getAssetNodes(assetList);
						if(assetTreeNodes.length > 0) {
							this.assetTreeViews[assetTreeViewsIndex] = this._renderMenuTree(assetTreeNodes);
							elBuff.push(this.assetTreeViews[assetTreeViewsIndex].el);
						}
						$container.append.apply($container, elBuff);
						
						var unfoldAssetList = GO.util.store.get("asset.unfold.list") || [];
						for (var index = 0; index < unfoldAssetList.length; index++) {
							var unfoldAssetId = unfoldAssetList[index];
							this._openDefaultAsset(assetTreeViewsIndex, unfoldAssetId, assetTreeNodes);
						}
				}, this);
			},
			
			isRentalItemType: function() {
				var loadMenuArr = App.router.getUrl().split('/');
				if (loadMenuArr.length == 6 && _.last(loadMenuArr) == 'rental') {
					return true;
				}
				return false;
			},
			selectSideMenu : function() {
				var selectedEl = null;
				var loadMenuArr = App.router.getUrl().split('/');
				this.$el.find('.on').removeClass('on');
				if (this.isRentalItemType() || isNaN(loadMenuArr[3])) { // 대여 자산 or ((대여 or 예약) parent node)
					selectedEl = this.$el.find('ul.side_depth li a[data-id="' + loadMenuArr[1] + '"][data-parent=""]');
				} else { // 예약 자산
					selectedEl = this.$el.find('ul.side_depth li a[data-id="'+loadMenuArr[3]+'"][data-parent="' + loadMenuArr[1] + '"]');
				}
				if (selectedEl.length) {
					selectedEl.parents('p:eq(0)').addClass('on');
				}
			},
			render : function(args) {
				this.unBindEvent();
				this.bindEvent();

				this.selectSideMenu();
			},

			_renderMenuTree: function(assetTreeNodes) {

				var _this = this;
				var treeMenuView = new TreeMenuView({
					"nodes": assetTreeNodes,
					"parentId": ""
				});

				treeMenuView.$el.on("toggle", _.bind(function(event, element, isOpened, nodeId) {

					var unfoldAssetList = GO.util.store.get("asset.unfold.list") || [];

					if (isOpened) {
						var selectedNode = [];
						selectedNode.push(nodeId);
						unfoldAssetList = _.union(unfoldAssetList, selectedNode);
						_this._loadAssetItems(element, isOpened, nodeId);
					} else {
						unfoldAssetList = unfoldAssetList.filter(function(unfoldNodeId) {
							return nodeId != unfoldNodeId;
						});
					}
					GO.util.store.set("asset.unfold.list", unfoldAssetList);
				}, true));

				treeMenuView.$el.on("itemClicked", _.bind(function(event, element, parentId, nodeId) {

					var isRentalType = element.attr("data-type") == 'true';

					if (isRentalType) {
						App.router.navigate('asset/'+ nodeId +'/list/rental', {trigger: true, pushState: true});
					} else {
						if (_.isEmpty(parentId)) {
							App.router.navigate('asset/'+ nodeId +'/list/reservation', {trigger: true, pushState: true});
						} else {
							App.router.navigate('asset/'+ parentId+'/item/' + nodeId + "/weekly/reserve/" + GO.util.toISO8601(new Date()), {trigger: true, pushState: true});
						}
					}
				}, this));

				treeMenuView.$el.on("configClicked", function(event, nodeId) {
					var type = "default";
					App.router.navigate('asset/' + nodeId + '/admin/' + type, {trigger: true, pushState: true});
				});

				treeMenuView.render();
				return treeMenuView;
			},

			_loadAssetItems: function(element, isOpened, nodeId) {

				var assetItems = assetItemsCollection.init();
				assetItems.on('sync', _.bind(function() {

					var items = assetItems.getItems();
					var childNodes = this._getChildAssetItemNodes(items);

					var elBuff = [];
					if(childNodes.length > 0) {

						var childMenuView = new TreeMenuView({
							"nodes": childNodes,
							"parentId": nodeId
						});
						childMenuView.render();
						elBuff.push(childMenuView.el);
					}

					element.append.apply(element, elBuff);
					this.selectSideMenu();

				}, this), this);

				assetItems.setAssetId(nodeId);
				assetItems.fetch({data : { 'page' : '0' , 'offset' : '100' }});
			},

			_getAssetNodes: function(assetList) {
				var assetTreeNodes = _.map(assetList, function(node) {
					return {
						"parentId": "",
						"id": node.id,
						"nodeValue": node.name,
						"isFolderNode": node.hasItems,
						"hasChildren": node.useRental == true ? false : node.hasItems,
						"managable": node.managable,
						"useRental": node.useRental,
						"isCompanyShared" : !!node.isCompanyShared
					}
				});

				return assetTreeNodes;
			},

			_getChildAssetItemNodes: function(items) {

				var childNodes = _.map(items, function (item) {
					return {
						"parentId": item.assetId.toString(),
						"id": item.key,
						"nodeValue": item.label,
						"isFolderNode": false,
						"hasChildren": false,
						"managable": false,
						"useRental": item.useRental
					}
				});

				return childNodes;
			},

			slideToggle : function(e) {
				var currentTarget = $(e.currentTarget), 
					parentTarget = currentTarget.parents('h1'),
                    toggleBtn = parentTarget.find('.ic_side'),
					self = this;
				parentTarget.next('ul').slideToggle("fast",
					function() {
						if ($(this).css('display') == 'block') {
                            parentTarget.removeClass("folded");
                            toggleBtn.attr("title", tplVar['collapse']);
                        } else {
                            parentTarget.addClass("folded");
                            toggleBtn.attr("title", tplVar['expand']);
                        }

						var isOpen = !parentTarget.hasClass("folded");
						var companyId = parentTarget.data('id');
						self.storeCategoryIsOpen(companyId + '-' + ASSET_STORE_KEY, isOpen);
					});
			},
			
	        getStoredCategoryIsOpen: function(store_key) {
	            var savedCate = '';
	            if(!window.sessionStorage) {
	                savedCate = Amplify.store(store_key);
	            } else {
	                savedCate = Amplify.store.sessionStorage(store_key);
	            }
	            
	            if(savedCate == undefined){
	                savedCate = true;
	            }
	            
	            return savedCate;
	        },
	        
	        storeCategoryIsOpen: function(store_key, category) {
	            return Amplify.store( store_key, category, { type: !window.sessionStorage ? null : 'sessionStorage' } );
	        },

			_openDefaultAsset: function(assetTreeViewsIndex, nodeId, assetTreeNodes) {

				if (nodeId < 0) {
					return;
				}

				var index = -1;
				for (var i = 0; i < assetTreeNodes.length; i++) {
					var node = assetTreeNodes[i];
					if (node.id == nodeId) {
						index = i;
					}
				};
				if(this.assetTreeViews[assetTreeViewsIndex]){
					this.assetTreeViews[assetTreeViewsIndex].open(index);
				}
			}
		});
		return SideView;
	});
}).call(this);