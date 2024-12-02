define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!admin/templates/asset_manage_list",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "admin/collections/asset_list",
	"board/components/layer/views/share_scope",
    "jquery.go-sdk",
    "GO.util",
],

function(
	$, 
	Backbone,
	App, 
	TplAssetList,
	commonLang,
	adminLang,
	AssetListCollection,
	ScopeLayerView
) {
	var lang = {
		'asset_add' : adminLang['자산 추가'],
		'asset_sort' : adminLang['순서 바꾸기'],
		'asset_sort_done' : adminLang['순서바꾸기 완료'],
		'asset_list' : adminLang['자산 목록'],
		'asset_cnt' : adminLang['보유 수'],
		'asset_admin' : adminLang['운영자'],
		'asset_setting' : adminLang['설정'],
		'asset_no_list' : adminLang['자산이 목록이 없습니다.'],
		'board_sort_done' : adminLang['순서바꾸기 완료'],
		'asset_public' : adminLang['전체 허용'],
		'asset_private' : adminLang['일부만 허용'],
		'asset_name' : adminLang['자산명'],
		'asset_auth' : adminLang['권한'],
		'asset_status' : adminLang['상태'],
		'asset_setting' : adminLang['설정'],
		'range' : adminLang['공개 범위']

	};
	var instance = null;
	var manageList = Backbone.View.extend({
		el:'#layoutContent',

		events: {
			'click [data-type="btnOwners"]' : "onClickBtnOwners"
		},

		unbindEvent: function() {
			this.$el.off("click", "span[data-btntype='assetCreate']");
			this.$el.off("click", "span[data-btntype='assetSettingBtn']");
			this.$el.off("click", "span.btnAssetSortable");
			this.$el.off("click", "span.btnBoardSortDone");
		},
		bindEvent : function() {
			this.$el.on("click", "span[data-btntype='assetCreate']", $.proxy(this.assetCreate, this));
			this.$el.on("click", "span[data-btntype='assetSettingBtn']", $.proxy(this.assetInfo, this));
			this.$el.on("click", "span.btnAssetSortable", $.proxy(this.bindListSortable, this));
			this.$el.on("click", "span.btnBoardSortDone", $.proxy(this.ListSortablePut, this));
		},
		initialize: function() {			
//			var sessionModel  = sessionUser.read().toJSON();
			this.companyId = GO.session().companyId;
			this.unbindEvent();
			this.bindEvent();
		},
		render : function() {
			var _this = this;
			this.collection = AssetListCollection.getCollection();
			var dataset = this.collection.toJSON();

			var parseManagers = function(){
				var managers = [];
				$.each(this.managers,function(i,val){
					managers.push(val.user.name + " " + val.user.positionName);
				});
				return managers.join(',');
			};
			var parseStatus = function(){
				if(this.status == "ACTIVE"){
					return adminLang['사용중'];
				}
				return adminLang['사용중지'];
			};
						
			var tmpl = TplAssetList({
				dataset:dataset,	
				parseManagers:parseManagers,
				parseStatus:parseStatus,
				lang:lang				
			});			
			this.$el.html(tmpl);
			this.listEl = this.$el.find('#tableBorderList');
			this.$el.find('#tableBorderList tr:last-child').addClass('last');
			
		},
		assetInfo : function(e){
			var target = $(e.currentTarget);
			if($(e.currentTarget).parents('tbody:eq(0)').hasClass('ui-sortable')) {
				$.goMessage(adminLang["순서 바꾸기 완료후 수정"]);
				return false;
			}
			App.router.navigate('/asset/'+target.attr('data-assetid')+"/modify", true);
		},
		bindListSortable : function(e) {
			if(this.collection.length == 0 ) {
				$.goMessage(adminLang['자산이 목록이 없습니다.']);
				return false;
			}
			this.$el.find('.btnAssetAdd').hide();
			this.$el.find('.btnAssetSortable').hide();
			this.$el.find('.btnBoardSortDone').show();
				
			this.listEl.find('tbody').removeClass().sortable({
				opacity : '1',
				delay: 100,
				cursor : "move",
				items : "tr",
				containment : '.admin_content',
				hoverClass: "ui-state-hover",
				placeholder : 'ui-sortable-placeholder',
				start : function (event, ui) {
			        ui.placeholder.html(ui.helper.html());
			        ui.placeholder.find('td').css('padding','5px 10px');
			    }
			});	
		},
		ListSortablePut : function(e) {
			var self = this;
			var sortableBody = this.$el.find('tbody');
			var sortIds = sortableBody.find('tr').map(function(k,v) {
				return $(v).attr('data-id');
			}).get();
			this.model = new Backbone.Model();
			this.model.url = GO.contextRoot + "ad/api/asset/list";
			this.model.set({ ids : sortIds }, { silent : true });
			this.model.save({}, {
				type:'PUT',
	            success: function() {	            	
	            	self.render();
	            }
			});
		},
		assetCreate : function(){
			App.router.navigate('/asset/create', true);			
		},
		assetModify : function(e){
			var assetId = $(e.currentTarget).attr('data-assetId');
			App.router.navigate('/asset/'+assetId+"/modify", true);
		},
		/***
		 * 공개범위 팝업
		 */
		onClickBtnOwners : function(e ){

			var target = $(e.currentTarget);
			var id = target.attr('data-id');
			var item= this.collection.get(id);

			var popup = $.goPopup({
				header : adminLang['공개 범위'],
				'pclass' : 'layer_normal layer_share_scope',
				width : 330,
				'modal' : true,
				'allowPrevPopup' : false,
				buttons : [{
					btext : commonLang["확인"],
					btype : "confirm",
					autoclose : true
				}],
				contents : ""
			});
			var scopeLayerView = new ScopeLayerView({
				shares : item
			});
			scopeLayerView.render();
		},

	});
	return manageList;
});