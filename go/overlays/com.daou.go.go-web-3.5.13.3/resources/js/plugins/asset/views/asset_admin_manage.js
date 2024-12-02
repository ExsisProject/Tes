define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!asset/templates/asset_admin_manage",
    "hgn!asset/templates/asset_admin_manage_list",
    "asset/collections/asset_admin",
    "asset/collections/asset_item_list_manage",
    "i18n!nls/commons",
    "i18n!asset/nls/asset",
    "jquery.go-grid"
], 

function(
	$, 
	Backbone,
	App, 
	TplGuidance,
	TplGuidanceList,
	assetAdminCol,
	assetListCol,
	commonLang,
	assetLang
) {
	var lang = {
		'asset_add' : assetLang['자산추가'],
		'code' : assetLang['코드'],
		'name' : assetLang['이름'],
		'recurrence' : assetLang['반복예약'],
		'setting' : assetLang['설정'],
		'asset_name' : assetLang['자산이름'],
		'search' : commonLang['검색'],
		'alert_keyword' : commonLang['검색어를 입력하세요.'],
		'no_asset' : assetLang['이용가능한 자산이 없습니다.'],
		'asset_reorder' : commonLang['순서 바꾸기'],
		'asset_reorder_save' : commonLang['순서바꾸기 완료'],
		'use' : commonLang['사용'],
		'not_use' : commonLang['사용하지 않음']
	};
	var instance = null;
	var manageList = Backbone.View.extend({
		el:'#assetAdminPart',
		unbindEvent: function() {
			this.$el.off("click", "a[data-btntype='assetItemAdd']");
			this.$el.off("click", "span[data-btntype='settingItem']");
			this.$el.off("click", "a.btnAssetSortable");
		}, 
		bindEvent : function() {
			this.$el.on("click", "a[data-btntype='assetItemAdd']", $.proxy(this.assetItemAdd, this));
			this.$el.on("click", "span[data-btntype='settingItem']", $.proxy(this.settingItem, this));
			this.$el.on("click", "a.btnAssetSortable", $.proxy(this.bindListSortableToggle, this));
			
		},
		initialize: function() {			
			
		},
		render : function(opt) {
			
			this.unbindEvent();
			this.bindEvent();
			
			var _this = this;
			this.assetId = opt.assetId; 
			this.attributesLen;
			this.assetRecurrence;
						
			var itemCol = assetAdminCol.getCollection({assetId : this.assetId, type : 'info'});
			itemCol.on("reset",function(collection,response){				
				_this.attributesLen = collection.models[0].get('attributes').length;
				_this.assetRecurrence = collection.models[0].get('useRecurrence');
				var tmpl = _this.makeTemplete({
					collection : collection.toJSON()
				});
				_this.$el.html(tmpl);	
				_this.renderAssetList();
			});
		},
		renderAssetList : function(){
			var _this = this;
			var opt = {
        			offset : 999,
        			page : 0,
        			assetId : this.assetId,
        	};
        	
        	var col = assetListCol.getCollection(opt);
        	col.on("reset",function(collection,response){	
				var tmpl = TplGuidanceList({
					dataset : collection.toJSON(),
					attributesLen : this.attributesLen + 3,
					assetRecurrence : _this.assetRecurrence,
					lang : lang
				});
				
				_this.$el.find("#assetList").html(tmpl);
			});
        	
		},
		bindListSortableToggle : function(e) {
			var self = this;
			$(e.currentTarget).toggle(function(){
				self.bindListSortable(e);
			}, function() {
				self.actionListSortPut(e);
			}).click();
		},
		bindListSortable : function(e) {
			this.$el.find('.btnAssetSortable').addClass('btn_save').find('span.txt').html(lang['asset_reorder_save']);
			this.$el.find('a[data-btntype="assetItemAdd"]').hide();
			this.$el.find('tbody').removeClass().sortable({
				opacity : '1',
				delay: 100,
				cursor : "move",
				items : "tr",
				containment : '.content_page',
				hoverClass: "ui-state-hover",
				placeholder : 'ui-sortable-placeholder',
			    start : function (event, ui) {
			    	ui.placeholder.html(ui.helper.html());
			        ui.placeholder.find('td').css('padding','5px 10px');
			    }
			});	
		},
		actionListSortPut : function(e) {
			var self = this,
				sortableBody = this.$el.find('tbody'),
				sortIds = sortableBody.find('tr').map(function(k,v) {
					return $(v).attr('data-id');
				}).get();
			
				this.$el.find('tbody').sortable("destroy");
				this.$el.find('.btnAssetSortable').removeClass('btn_save').find('span.txt').html(lang['asset_reorder']);
				this.$el.find('a[data-btntype="assetItemAdd"]').show();
				$.ajax({
					type: 'PUT',
					async: true,
					data : JSON.stringify({ids:sortIds}),
					dataType: 'json',
					contentType : "application/json",
					url: GO.config("contextRoot") + 'api/asset/'+ self.assetId + '/item',
					success : function(response) {
						$.goMessage(commonLang["저장되었습니다."]);
						self.renderAssetList();
					},
					error : function(response){
						$.goMessage(commonLang["저장에 실패 하였습니다."]);
					}
				});
	        
		},
		makeTemplete : function(opt){
			var collection = opt.collection;
			var tpl = TplGuidance({
				dataset:collection,
				lang : lang
			});
			return tpl;
		},
		assetItemAdd :function(){			
			App.router.navigate('asset/'+ this.assetId+'/create',true);
		},
		settingItem : function(e){
			var target = $(e.currentTarget);
			App.router.navigate('asset/'+ this.assetId+'/modify/'+target.attr('data-id'),true);
		}
	},{
		create: function(opt) {
			/*if(instance === null)*/ instance = new manageList();
			return instance.render(opt);
		}
	});
	
	return {
		render: function(opt) {
			var layout = manageList.create(opt);
			return layout;
		}		
	};
});