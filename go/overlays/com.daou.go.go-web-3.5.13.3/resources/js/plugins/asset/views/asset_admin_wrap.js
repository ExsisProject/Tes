;(function() {
	define([ 
	        "jquery", 
			"backbone", 
			"app",
			"hgn!asset/templates/asset_admin_wrap",
			"asset/views/asset_admin_guidance",
			"asset/views/asset_admin_info",
			"asset/views/asset_admin_manage",
			"asset/views/asset_admin_purpose",
			"i18n!asset/nls/asset",
			"asset/models/asset_admin"
		],
		function(
			$, 
			Backbone, 
			App,
			TplWrapLayout,
			adminGuidance,
			adminInfo,
			adminManage,
			adminPurpose,
			assetLang,
			AssetInfoModel
		) {
			
		var session = GO.session(), 
			apiRootUrl = GO.contextRoot+ 'api/', 
			lang = {
				'guidance' : assetLang['이용안내'],
				'info' : assetLang['자산정보관리'],
				'manage' : assetLang['자산관리'],
				'purpose' : assetLang['이용정보']
			};

		var BoardCreate = Backbone.View.extend({
			el : '#content',
			manage : false,
			initialize : function(options) {
				this.options = options || {};
				this.unbindEvent();
				this.bindEvent();
			},
			unbindEvent : function() {
				this.$el.off("click", ".tab_menu li");
			},
			bindEvent : function() {
				this.$el.on("click", ".tab_menu li", $.proxy(this.moveCompanyBoardTab, this));
			},
			render : function() {
				
				this.assetId = this.options.assetId;
				this.type = this.options.type;
				
				this.assetInfoModel = new AssetInfoModel();
				this.assetInfoModel.set({
					assetId : this.assetId
					});
				this.assetInfoModel.fetch({async : false});
				
				var tmpl = TplWrapLayout({
					lang : lang
				});
				this.$el.html(tmpl);
				if(this.type == "default"){
					adminGuidance.render({assetId : this.assetId});
				}else{
					this.$el.find('ul.tab_menu li').removeClass('active');
					this.$el.find('ul.tab_menu li[data-type="assetManage"]').addClass('active');
					adminManage.render({assetId : this.assetId});
				}
				
				$('#assetName').text(this.assetInfoModel.get('name'));
				
			},
			moveCompanyBoardTab : function(e){
				var targetEl = $(e.currentTarget);
				var dataType = targetEl.attr('data-type');
				if(targetEl.hasClass('active')){
					return;
				}else{
					targetEl.siblings('li').removeClass('active');
					targetEl.addClass('active');
					if(dataType == 'assetGuidance'){
						adminGuidance.render({assetId : this.assetId});
					}else if(dataType == 'assetInfo'){
						adminInfo.render({assetId : this.assetId});
					}else if(dataType == 'assetManage'){
						adminManage.render({assetId : this.assetId});
					}else {
						adminPurpose.render({assetId : this.assetId});
					}
				}
			}
		},
		{
			__instance__ : null,
			create : function(opt) {
				this.__instance__ = new this.prototype.constructor(
						{
							assetId : opt.assetId,
							type : opt.type
						});

				return this.__instance__;
			},
			render : function(opt) {
				var instance = this.create(opt), args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
				return this.prototype.render.apply(instance, args);
			}
		});
	
		return BoardCreate;
	});
}).call(this);