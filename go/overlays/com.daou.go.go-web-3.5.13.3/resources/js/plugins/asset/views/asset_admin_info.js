define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!asset/templates/asset_admin_info",
    "asset/collections/asset_admin",
    "asset/models/asset_admin",
    "i18n!nls/commons",
    "i18n!asset/nls/asset",
], 

function(
	$, 
	Backbone,
	App, 
	TplInfo,
	assetAdminCol,
	assetAdminModel,
	commonLang,
	assetLang
) {
	var lang = {
		'info' : assetLang['자산에 대한 추가 정보란'],
		'field_name' : assetLang['필드명'],
		'show_user' : assetLang['이용자에게 보이기'],
		'delete' : commonLang['삭제'],
		'code' : assetLang['코드'],
		'no_delete' : assetLang['삭제불가'],
		'name' : assetLang['항목명'],
		'add' : assetLang['추가하기'],
		'ok' : commonLang['확인'],
		'cancel' : commonLang['취소'],
		'success' : assetLang['성공했습니다.'],
		'alert_input' : assetLang['필드명을 입력하세요.'],
		'save_ok' : commonLang['저장되었습니다.']
	};
	var instance = null;
	var manageList = Backbone.View.extend({
		el:'#assetAdminPart',
		unbindEvent: function() {
			this.$el.off("click", "a[data-btntype='attrAdd']");
			this.$el.off("click", "span[data-btntype='attrDel']");
			this.$el.off("click", "span[data-btntype='infoSubmit']");
			this.$el.off("click", "span[data-btntype='infoCancel']");
			
		}, 
		bindEvent : function() {
			this.$el.on("click", "a[data-btntype='attrAdd']", $.proxy(this.attrAdd, this));
			this.$el.on("click", "span[data-btntype='attrDel']", $.proxy(this.attrDel, this));
			this.$el.on("click", "span[data-btntype='infoSubmit']", $.proxy(this.saveAdminInfo, this));
			this.$el.on("click", "span[data-btntype='infoCancel']", $.proxy(this.infoCancel, this));
		},
		initialize: function() {			
			
		},
		attrDel : function(e){
			var target = $(e.currentTarget);
			target.parents('tr').first().remove();
		},
		attrAdd : function(){
			var tpl = '<tr class="attribute" data-assetid="">'+
							'<td><input type="text" class="txt"/></td>'+
							'<td><input type="checkbox" checked="checked" class="visibleCheck"></td>'+							
							'<td><span class="ic_side ic_basket_bx" title="삭제" data-btntype="attrDel"></span></td>'+
						'</tr>';
			this.$el.find('#infoTbody').append(tpl);
		},
		infoCancel : function(){
			this.render({assetId : this.assetId});
		},
		saveAdminInfo : function(){
			var _this = this;
			var data = {
				useCodeVisibility : $('#useCodeVisibility').is(':checked')				
			};
			
			var attributes = [];
			var targetTr = $('#infoTbody').find('tr.attribute');
			
			var blankCheck = false;
			targetTr.each(function(){
				var name = $(this).find('input.txt').val();
				if($.trim(name) == ""){
					blankCheck = true;
				}
			});
			
			if(blankCheck){
				$.goMessage(lang.alert_input);
				return;
			}
			
			targetTr.each(function(){
				var attr = {};
				attr.id = $(this).attr('data-attrid');
				attr.name = $.trim($(this).find('input.txt').val());
				attr.visibility = $(this).find('input.visibleCheck').is(':checked');
				attributes.push(attr);
			});
			data.attributes = attributes;
			
			this.assetModel = new assetAdminModel();
			this.assetModel.set({
				id:this.assetId,
				assetId : this.assetId,
				urlPart : 'attribute/item'
				});
			this.assetModel.save(data,{
				success : function(model,response){
					$.goMessage(lang.save_ok);
					_this.render({assetId : _this.assetId});
				}
			});
		},
		render : function(opt) {
			this.assetId = opt.assetId; 
			var _this = this;
			this.unbindEvent();
			this.bindEvent();
			
			var itemCol = assetAdminCol.getCollection({assetId : this.assetId, type : 'info'});
			itemCol.on("reset",function(collection,response){
				var tmpl = _this.makeTemplete({
					collection : collection.toJSON()
				});
				_this.$el.html(tmpl);					
			});
						
		},
		makeTemplete : function(opt){
			var collection = opt.collection;
			var tpl = TplInfo({
				dataset:collection,
				lang : lang
			});
			return tpl;
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