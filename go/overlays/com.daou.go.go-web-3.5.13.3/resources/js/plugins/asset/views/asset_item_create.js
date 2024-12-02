;(function() {
	define([ 
	        "jquery", 
			"backbone", 
			"app", 
			"i18n!nls/commons",
			"i18n!asset/nls/asset",
			"hgn!asset/templates/asset_item_create",
			"hgn!asset/templates/asset_item_modify",
			"asset/collections/asset_admin",
			"asset/models/asset_admin",
			"asset/models/asset_item",
			"jquery.go-validation"
		],
		function(
			$, 
			Backbone, 
			App, 
			commonLang,
			assetLang,
			TplItemCreate,
			TplItemModify,
			assetAdminCol,
			assetAdminModel,
			assetItemModel
			
		) {
		var DEFAULT_LIMIT_DATE = 2;
		var DEFAULT_LIMIT_COUNT = 30;
		var session = GO.session(),
			lang = {
				'asset_add' : assetLang['자산추가'],
				'asset_modify' : assetLang['자산수정'],
				'code' : assetLang['코드'],
				'name' : assetLang['이름'],
				'recurrence' : assetLang['반복예약'],
				'ok' : commonLang['확인'],
				'cancel' : commonLang['취소'],
				'alert_delete' : assetLang['항목 삭제'],
				'alert_delete_info' : assetLang['해당 항목이 삭제됩니다.<br>삭제하시겠습니까?'],
				'delete' : commonLang['삭제'],
				'alert_code_name' : assetLang['코드와 이름은 필수입니다.'],
				'alert_code' : assetLang['코드는 영어와 숫자만 가능합니다.'],
				'use' : commonLang['사용함'],
				'not_use' : commonLang['사용하지 않음'],
				'asset_limit' : assetLang['예약 제한 사항 설정'],
				'asset_limit_description' : assetLang['반복 예약을 할 수 있는 최대 기간 및 횟수를 설정할 수 있습니다.'],
				'not_use_limit' : assetLang['사용안함'],
				'recurence_count' : assetLang['회 반복'],
				'recurence_yearly' : assetLang['년 반복']
			};
		
		var BoardCreate = Backbone.View.extend({
			el : '#content',
			initialize : function() {
				
			},
			unbindEvent : function() {
				this.$el.off("focus", "input.w_max");
				this.$el.off("blur", "input.enter");
				this.$el.off("click", "a[data-btntype='itemSubmit']");
				this.$el.off("click", "a[data-btntype='itemCancel']");
				this.$el.off("click", "a[data-btntype='itemUpdate']");
				this.$el.off("click", "a[data-btntype='itemDelete']");
				this.$el.off("click", "input[name=use_recurrence]");
			},
			bindEvent : function() {
				this.$el.on("focus", "input.w_max", $.proxy(this.inputFocus, this));
				this.$el.on("blur", "input.enter", $.proxy(this.inputBlur, this));
				this.$el.on("click", "a[data-btntype='itemSubmit']", $.proxy(this.createItem, this));
				this.$el.on("click", "a[data-btntype='itemCancel']", $.proxy(this.itemCancel, this));
				this.$el.on("click", "a[data-btntype='itemUpdate']", $.proxy(this.updateItem, this));
				this.$el.on("click", "a[data-btntype='itemDelete']", $.proxy(this.updateDelete, this));
				this.$el.on("click", "a[data-btntype='itemDelete']", $.proxy(this.updateDelete, this));
				this.$el.on("click", "input[name=use_recurrence]", $.proxy(this._onClickRecurrenceOption, this));
				this.$el.on("click", "input[type=radio][name=use]", $.proxy(this._onChangeRadio, this));
				this.$el.on("keyup", "input[type=text][name^=radio-use]", $.proxy(this._validateCount, this));
			},
			_validateCount: function (value) {
				var target = $(value.currentTarget).val();
				if (!(target.length > 0 && (!/^(\d)+$/.test(target))))
					return;

				if (value.target.name === 'radio-use-d')
					$(value.currentTarget).val(DEFAULT_LIMIT_DATE);
				if (value.target.name === 'radio-use-c')
					$(value.currentTarget).val(DEFAULT_LIMIT_COUNT);
			},
			itemCancel : function(){
				App.router.navigate('asset/'+ this.assetId+'/admin/manage',true);
			},
			render : function(opt) {
				var _this = this;
				this.unbindEvent();
				this.bindEvent();
				this.assetId = opt.assetId; 
				this.itemId = opt.itemId;
				
				var itemCol = assetAdminCol.getCollection({assetId : this.assetId, type : 'info'});
				itemCol.on("reset",function(collection,response){
					var tmpl = _this.makeTemplete({
						collection : collection.toJSON()
					});
					_this.$el.html(tmpl);		
					
					if(_this.itemId){
						_this.model = new assetItemModel();
						_this.model.clear();
						_this.model.set({assetId : _this.assetId,itemId : _this.itemId},{silent:true});
						_this.model.fetch({async : false});
						_this.setData(_this.model);		
					}
					
				});
				
			},
			setData : function(model){
				$('#code').val(model.get('code'));
				$('#name').val(model.get('name'));
				if (model.get('useRecurrence')) {
					$('#radio-use-recurrence-y').prop('checked', true);
					$('input[type=radio][value=' + model.get('limitRecurrence') +']').prop('checked', true);
					var selectedId = $("input[name=use]:checked").attr("id");
					$("input[name=" + selectedId + "]").val(model.get('limitRecurrenceCount'));
					$("input[name=" + selectedId + "]").attr("disabled", false);

				} else {
					$('#radio-use-recurrence-n').prop('checked', true);
					$('#recurrence-limit').hide();
				}
				$.each(model.get('properties'),function(k,v){
					$('tr[data-id="'+v.attributeId+'"]').find('input').val(v.content);
				});
			},
			makeTemplete : function(opt){
				var collection = opt.collection;
				var tpl;
				if(this.itemId){
					tpl = TplItemModify({
						dataset:collection,
						lang : lang
					});
				}else{
					tpl = TplItemCreate({
						dataset:collection,
						lang : lang
					});
				}
				return tpl;
			},
			inputFocus : function(e){
				$(e.currentTarget).removeClass().addClass('txt w_max enter');
			},
			inputBlur : function(e){
				$(e.currentTarget).removeClass().addClass('txt w_max');
			},
			getData : function(){
				var data = {
						name : $.trim($("#name").val()),
						code : $("#code").val(),
					    useRecurrence : $("#radio-use-recurrence-y").is(':checked')
				};
				
				var properties = [];
				var targetTr = $('#createPart').find('tr.attribute');
				targetTr.each(function(){
					var attr = {};
					attr.attributeId = $(this).attr('data-id');
					attr.content = $(this).find('input.txt').val();
					properties.push(attr);
				});
				data.properties = properties;
				if (data.useRecurrence === true) {
					data.limitRecurrence = $("input[name=use]:checked").val();
					var selectedId = $("input[name=use]:checked").attr("id");
					data.limitRecurrenceCount = $("input[name=" + selectedId + "]").val();
				}
				return data;
			},
			createItem : function(){
				var _this = this;
				var data = this.getData();
				
				// 이미 서버에 요청중이면 중복 시도 하지 않는다.
				if(getRequestStatus()) {
					return;
				}
				
				if($('#code').val() == "" || $('#name').val() == ""){
					$.goMessage(lang.alert_code_name);
					return;
				}
				
				if(!$.goValidation.validateNumericAlpha($('#code').val())){
					$.goMessage(lang.alert_code);
					return;
				}
				
				this.assetModel = new assetItemModel();
				this.assetModel.clear();
				this.assetModel.set({
					assetId : this.assetId					
					});
				
				// 요청 시작했음을 마킹
				setRequestStatus(true);
				this.assetModel.save(data,{
					success : function(model,response){
						setRequestStatus(false);
						$('#side').trigger('changeAssetItem'); // layout 구조 개선 필요
						App.router.navigate('asset/'+ _this.assetId+'/admin/manage',true);
					}
				});
			},
			updateItem : function(){
				var _this = this;
				var data = this.getData();
				data.id = this.assetId;
				
				if($('#code').val() == "" || $('#name').val() == ""){
					$.goMessage(lang.alert_code_name);
					return;
				}
				
				if(!$.goValidation.validateNumericAlpha($('#code').val())){
					$.goMessage(lang.alert_code);
					return;
				}
				
				this.assetModel = new assetItemModel();
				this.assetModel.clear();
				this.assetModel.set({
					assetId : this.assetId,
					itemId : this.itemId
					});
				this.assetModel.save(data,{
					success : function(model,response){
						$('#side').trigger('changeAssetItem'); // layout 구조 개선 필요
						App.router.navigate('asset/'+ _this.assetId+'/admin/manage',true);
					}
				});
			},
			updateDelete : function(){
				var _this = this;
				$.goConfirm( lang.alert_delete, lang.alert_delete_info, function() {
					
					var url = GO.contextRoot + "api/asset/"+_this.assetId+"/item/"+_this.itemId;		
					
					$.go(url,{}, {
						qryType : 'DELETE',		
						contentType : 'application/json',
						responseFn : function(rs) {
							$('#side').trigger('changeAssetItem'); // layout 구조 개선 필요
							App.router.navigate('asset/'+ _this.assetId+'/admin/manage',true);
						}
					});
				});
				
				
			},
			_onClickRecurrenceOption: function(e) {
				var $target = $(e.currentTarget);

				if($target.val() === 'true') {
					$('#recurrence-limit').show();
				} else {
					$('#recurrence-limit').hide();
				}
			},
			_onChangeRadio: function(e) {
				var targetId = e.target.id;
				var targetInput = $("input[name=" + targetId + "]");

				$("input[type=text][name^=radio-use]").attr("disabled", true);
				$("input[type=text][name^=radio-use]").attr("value", "");

				targetInput.attr("disabled", false);
				if (targetId === 'radio-use-d')
					targetInput.attr("value", DEFAULT_LIMIT_DATE);
				if (targetId === 'radio-use-c')
					targetInput.attr("value", DEFAULT_LIMIT_COUNT);
			},
		},
		{
			__instance__ : null,
			create : function(opt) {
				this.__instance__ = new this.prototype.constructor(
						{
							assetId : opt.assetId,
							itemId : opt.itemId
						});

				return this.__instance__;
			},
			render : function(opt) {
				var instance = this.create(opt), args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
				return this.prototype.render.apply(instance, args);
			}
		});
		
		// save시 요청이 시작되었음을 체크하기 위한 플래그
		var __startRequest__ = false;
		function setRequestStatus(bool) {
			__startRequest__ = bool;
		}
		function getRequestStatus() {
			return __startRequest__;
		}
	
		return BoardCreate;
	});
}).call(this);