define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!asset/templates/asset_admin_purpose",
    "asset/models/asset_admin",
    "asset/collections/asset_admin",
    "i18n!nls/commons",
    "i18n!asset/nls/asset",
], 

function(
	$, 
	Backbone,
	App, 
	TplPurpose,
	assetAdminModel,
	assetAdminCol,
	commonLang,
	assetLang
) {
	var lang = {
		'info' : assetLang['이용자가 자산을 예약 또는 대여시 입력 받을 정보를 설정합니다.'],
		'asset_add' : assetLang['추가하기'],
		'input_info' : assetLang['이용자 입력 정보'],
		'del' : commonLang['삭제'],
		'ok' : commonLang['확인'],
		'cancel' : commonLang['취소'],
		'success' : assetLang['성공했습니다.'],
		'alert_purpose' : assetLang['이용자 입력정보를 입력하세요.'],
		'save_ok' : commonLang['저장되었습니다.']
	};
	var instance = null;
	var manageList = Backbone.View.extend({
		el:'#assetAdminPart',
		unbindEvent: function() {
			this.$el.off("click", "a[data-btntype='purposeAdd']");
			this.$el.off("focus", "input.comp");
			this.$el.off("blur", "input.enter");
			this.$el.off("click", "span[data-btntype='purposeDel']");
			this.$el.off("click", "span[data-btnype='purposeSubmit']");
			this.$el.off("click", "span[data-btnype='purposeCancel']");
		}, 
		bindEvent : function() {
			this.$el.on("click", "a[data-btntype='purposeAdd']", $.proxy(this.purposeAdd, this));
			this.$el.on("focus", "input.comp", $.proxy(this.inputFocus, this));
			this.$el.on("blur", "input.enter", $.proxy(this.inputBlur, this));
			this.$el.on("click", "span[data-btntype='purposeDel']", $.proxy(this.purposeDel, this));
			this.$el.on("click", "span[data-btnype='purposeSubmit']", $.proxy(this.savePurpose, this));
			this.$el.on("click", "span[data-btnype='purposeCancel']", $.proxy(this.cancelPurpose, this));
			
			
		},
		initialize: function() {			
			this.unbindEvent();
			this.bindEvent();
		},
		render : function(opt) {
			
			this.assetId = opt.assetId; 
			var _this = this;
			this.unbindEvent();
			this.bindEvent();
			
			var itemCol = assetAdminCol.getCollection({assetId : this.assetId, type : 'reservation'});
			itemCol.on("reset",function(collection,response){
				var tmpl = _this.makeTemplete({
					collection : collection.toJSON()
				});
				_this.$el.html(tmpl);					
			});
			
		},
		makeTemplete : function(opt){
			var collection = opt.collection;
			var tpl = TplPurpose({
				dataset:collection,
				lang : lang
			});
			return tpl;
		},
		purposeAdd : function(){
			var purposeText = $('#purposeText').val();
			
			if($.trim(purposeText) == ""){
				$.goMessage(lang.alert_purpose);
				return;
			}
			
			var tpl = '<tr class="attribute">'+
						'<td>'+
								'<span class="txt_edit">'+
										'<span class="wrap_txt"><label></label><input class="txt comp" type="text" value="'+purposeText+'" /></span>'+
								'</span>'+
							'</td>'+						
							'<td class="align_c"><span class="btn"><span class="ic_side ic_basket_bx" title="삭제" data-btntype="purposeDel"></span></span></td>'+
						'</tr>';
			$('#purposePart').append(tpl);	
			$('#purposeText').val('');
		},
		purposeDel : function(e){
			var target = $(e.currentTarget);
			target.parents('tr').first().remove();
		},
		inputFocus : function(e){
			$(e.currentTarget).removeClass().addClass('txt enter');
		},
		inputBlur : function(e){
			$(e.currentTarget).removeClass().addClass('txt comp');
		},
		savePurpose : function(){
			var _this = this;
			var data = {};
				
			var attributes = [];
			var targetTr = $('#purposePart').find('tr.attribute');
			targetTr.each(function(){
				var attr = {};
				attr.id = $(this).attr('data-attrid');
				attr.name = $.trim($(this).find('input.txt').val());
				attr.visibility = true;
				attributes.push(attr);
			});
			data.attributes = attributes;
			
			this.assetModel = new assetAdminModel();
			this.assetModel.set({
				id:this.assetId,
				assetId : this.assetId,	
				urlPart : 'attribute/reservation'
				});
			this.assetModel.save(data,{
				success : function(model,response){
					$.goMessage(lang.save_ok);
					_this.render({assetId : _this.assetId});
				}
			});
		},
		cancelPurpose : function(){
			this.render({assetId : this.assetId});
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