(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app",
		"hgn!asset/templates/mobile/m_side",
		"hgn!asset/templates/mobile/m_side_share_item",
		"asset/collections/side",
		"i18n!asset/nls/asset"
	],
	function(
		$, 
		Backbone, 
		GO,
		sideMenuTpl,
		sideShareItemTpl,
		sideCollection,
		assetLang
	) {
				
		var lang = {
				'company_asset' : assetLang['전사자산'],
			};
		
		var SideView = Backbone.View.extend({
			//id: 'assetSideMenu',
			unBindEvent : function() {
				this.$el.off("vclick", "li[btn-type='assetItemList']");
			},
			bindEvent : function() {
				this.$el.on("vclick", "li[btn-type='assetItemList']", $.proxy(this.moveAsset, this));
			},
			initialize : function(options) {
				this.options = options || {};
			},
			moveAsset : function(e){
				e.preventDefault();
				e.stopPropagation();
				var target = $(e.currentTarget);
				var assetId = target.attr('data-assetid');
				var url = ['asset',assetId,'list'];
				if(target.attr('data-type') == "true"){
					url.push('rental');
				}else{
					url.push('reservation');
				}
				GO.router.navigate(url.join('/'),true);
			},
			render : function() {
				this.packageName = this.options.packageName;
				var self = this, 
					deferred = $.Deferred();
				
				this.unBindEvent();
				this.bindEvent();
				
				var sideCol = sideCollection.getAsset();
				var tmpl = sideMenuTpl({
					contextRoot : GO.contextRoot,
					dataset : sideCol.toJSON(),
					lang :lang
				});
				this.$el.html(tmpl);	
				this.loadAssetShareMenu();
				this.setSideApp();
				deferred.resolveWith(this, [this]);
	            return deferred;
			},
			loadAssetShareMenu : function(){
				var sideShareCol = sideCollection.getShareCollection();
				sideShareCol.each(function(sideShareItem, idx){
					var sideShares = sideCollection.createCollectionByList(sideShareItem.get('assets'));
						this.$el.append(sideShareItemTpl({
							idx : idx,
							contextRoot : GO.contextRoot,
							companyName : sideShareItem.get('companyName'),
							dataset : sideShares.toJSON(),
							lang :lang
							}));
				}, this);
			},
			setSideApp : function() {
				$('body').data('sideApp', this.packageName);
			}
		}, {
            __instance__: null, 
            create: function(packageName) {
                /*if(this.__instance__ === null)*/ this.__instance__ = new this.prototype.constructor({'packageName':packageName});
                return this.__instance__;
            }
        });
		
		return SideView;
	});
}).call(this);