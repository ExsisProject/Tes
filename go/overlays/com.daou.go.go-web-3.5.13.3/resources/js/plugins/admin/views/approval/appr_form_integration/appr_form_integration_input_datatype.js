define([
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	
	"admin/views/approval/appr_form_integration/appr_form_parameter_layer",
	"admin/views/approval/appr_form_integration/appr_form_integration_input_requiredparams",
	
	'admin/constants/integration_config',
	
	"admin/models/approval/integration_query",
	
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_input_datatype",
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_input_datatype_item"
], 
function(
    commonLang,
    adminLang,
    approvalLang,
    
    ParameterLayerView,
    RequiredParamsView,
    
    IntegrationConfig,
    
    IntegrationQueryModel,
    
    DataTypeTpl,
    DataTypeItemTpl
    
) {	
	var lang = {
			"Query를 입력해 주세요" : approvalLang["Query를 입력해 주세요"],
			"Query/Parameter 설정이 잘못되었습니다" : approvalLang["Query/Parameter 설정이 잘못되었습니다"],
			"데이터 유형 멀티의 설정 값을 입력해 주세요" : approvalLang["데이터 유형 멀티의 설정 값을 입력해 주세요"],
			"중복된 멀티 값이 있습니다" : approvalLang["중복된 멀티 값이 있습니다"],
			"DirectAccess" : "DirectAccess",
			"String" : "String",
			"Html" : "Html",
			"공용" : commonLang["공용"],
			"개인 (employeeNumber)" : commonLang["개인"] + " (employeeNumber)",
			"key value 구분자" : approvalLang["key value 구분자"],
			"Data 구분자" : approvalLang["Data 구분자"],
			"편집가능" : commonLang["편집가능"],
			"편집불가" : commonLang["편집불가"],
			"추가" : commonLang["추가"],
			"삭제" : commonLang["삭제"],
			"Query" : "Query",
			"Parameters" : "Parameters",
			"데이터 유형" : commonLang["데이터 유형"],
			"단일" : commonLang["단일"],
			"멀티" : commonLang["멀티"],
			"Validator Name" : "사용자 정의 클래스",
			"bean" : "bean",
			"외부 시스템에서 호출될 때, 아래 값을 입력하세요" : approvalLang["외부 시스템에서 호출될 때, 아래 값을 입력하세요."],
			"필수값 아님" : approvalLang["필수값 아님"],
			"외부 시스템 호출 URL name" : approvalLang["외부 시스템 호출 URL"],
			"외부 시스템 호출 URL value" : "/app/approval/integration/createdocument?form_code=sample&params=etc"
	}
	
	var RowView = Backbone.View.extend({
		tagName : 'tr',
		initialize : function(options) {
			this.options = options || {};
			this.model = this.options.model;
			this.observer = this.options.observer;
			this.$el.data('instance', this);
		},
		events : {
			'click [name="dataTypeParamDel"]' : 'deleteParameter',
			'click [name=dataTypeRowAdd]' : 'popupAddParameterLayer',
			'keyup [name=inputDataAccessQuery]' : '_saveQuery',
			'keyup [name=returnMethod]' : '_saveReturnMethod',
			'click .multiRow' : '_clickMultiRow'
		},
		
		deleteParameter : function(e){
			$(e.currentTarget).closest('li').remove();
		},
		
		addParameter : function(data){
			var tpl = ['<li name="param"><span data-id="paramWrap">',
			            '<span class="name" name="input_parameters" data-dataType="{{dataType}}" data-paramName = "{{paramName}}" data-paramType = "{{paramType}}">{{paramName}} ({{dataType}})</span>',
			       		'<span name="dataTypeParamDel" class="btn_wrap"><span class="ic ic_del" title="'+commonLang["삭제"]+'"></span></span></li>'].join('');
			
			this.$('li.creat').before(Hogan.compile(tpl).render(data));
		},
		
		_saveQuery: function(e){
			var $target = $(e.currentTarget);
			this.model.set('query', $target.val());
		},
		
		_saveReturnMethod: function(e){
			var $target = $(e.currentTarget);
			this.model.set('returnMethod', $target.val());
		},
		
		_clickMultiRow: function(e){
			var $target = $(e.currentTarget);
			this.model.set('multiRow', $target.val());
			
			if(toBooleanUnifyCheck($target.val())){
				this.$('[name=returnMethod]').css('display','block');
			}else{
				this.$('[name=returnMethod]').css('display','none');
			}
		},
		
		popupAddParameterLayer : function(){
            var parameterLayer = $.goPopup({
                "pclass" : "layer_normal parameter_popup",
                "header" : 'Parameter Config',
                "modal" : true,
                "width" : 600,
                "allowPrevPopup" : true,
                "contents" :  "",
                "buttons" : [
                    {
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                    }
                ]
            });
            
            //var layerParameters = [];
            /*var modelParam = this.model.get('parameters');
            if(modelParam){
            	//"DOCUMENT" 만 필터링
            	var modelParam = _.filter(modelParam, function(param){
    				return param.paramType == 'DOCUMENT'
    			});
            	_.each(modelParam, function(param){
            		parameters.push({
            			dataType: param.dataType,
            			isDocument: true,
            			paramName: param.paramName,
            			paramType: "DOCUMENT"
            		});
            	});
            }*/
            
            /*var tempDocumentData = [{
				dataType: "NUMBER",
				isDocument: true,
				paramName: "getId",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getEmployeeNumber",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getTitle",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getDocNum",
				paramType: "DOCUMENT"
			},{
				dataType: "NUMBER",
				isDocument: true,
				paramName: "getDrafterId",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getDrafterName",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getDrafterDeptName",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getStatus",
				paramType: "DOCUMENT"
			},{
				dataType: "NUMBER",
				isDocument: true,
				paramName: "getFormId",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getFormName",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getFormCode",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getBody",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getCurrEmpNo",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getCurrEmpName",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getCurrEmpDeptName",
				paramType: "DOCUMENT"
			}];
            
            _.each(tempDocumentData, function(param){
            	layerParameters.push({
        			dataType: param.dataType,
        			isDocument: param.isDocument,
        			paramName: param.paramName,
        			paramType: param.paramType
        		});
        	});
            
            var nodeParameters = this.$('[name=input_parameters]');
            $.each(nodeParameters, function(idx, param){
        		if($(param).attr('data-paramtype') != 'DOCUMENT'){
        			layerParameters.push({
            			dataType: $(param).attr('data-datatype'),
            			isDocument: false,
            			paramName: $(param).attr('data-paramname'),
            			paramType: $(param).attr('data-paramtype')
            		});
            	}
            });*/
            
            var parameterLayerView = new ParameterLayerView({
            	model : this.model,
            	observer : this.observer
            	//parameters : layerParameters
            });
            parameterLayerView.render();
            parameterLayer.reoffset();
            parameterLayerView.on('addParameter', _.bind(this.addParameter, this));
		},
		
		render : function(){
			var self = this;
			/*var parameters = _.filter(self.model.get("parameters"), function(param){
				return param.paramType == 'VARIABLE'
			});*/
			var parameters = self.model.get("parameters");
			this.$el.append(DataTypeItemTpl({
				lang: lang,
				model: self.model.toJSON(),
				parameters: parameters,
				cid : self.model.cid,
				multiRow: toBooleanUnifyCheck(this.model.get("multiRow"))
			}));
			return this;
		},
		
		getData : function(){
			var parameters = $.map(this.$('span[name="input_parameters"]'), function(element, i){
				return {
					dataType : $(element).attr('data-dataType'),
					paramName : $(element).attr('data-paramName'),
					paramType : $(element).attr('data-paramType'),
				};
			});
			return {
				id : this.$('textarea[name="inputDataAccessQuery"]').attr('row-id'),
				query : this.$('textarea[name="inputDataAccessQuery"]').val(),
				parameters : parameters,
				multiRow : this.model.get("multiRow"),
				returnMethod : this.$('input[name="returnMethod"]').val()
			}
		},
		
	})
	
	var InputDataTypeView = Backbone.View.extend({
		el : "#inputDataType",
		initialize : function(options) {
			this.options = options || {};
			this.model = this.options.model;
			this.observer = this.options.observer;
		},
		
		events : {
			"change #selectInputDataType" : "_selectDataType",
			'click .btnRowAdd' : '_clickBtnRowAdd',
			'click .btnRowDelete' : '_queryItemDelete',
			'click .ic_addlist' : 'popupAddParameterLayer',
			'click [name=usePublic]' : '_clickUsePublic',
			'keyup [name=inputKeyValueSeparator]' : '_saveInputKeyValueSeparator',
			'keyup [name=inputElementSeparator]' : '_saveInputElementSeparator',
			'click [name=htmlEditable]' : '_clickHtmlEditable',
			'click #inputDataTypeAllCheck' : '_inputDataTypeAllCheck'
		},
		
		render : function() {
			this.$el.html(DataTypeTpl({
				lang: lang,
				isStringType: (this.model.get("inputDataType") == IntegrationConfig.DATA_TYPE.STRING),
				isHtmlType: (this.model.get("inputDataType") == IntegrationConfig.DATA_TYPE.HTML),
				isDirectAccessType: (this.model.get("inputDataType") == IntegrationConfig.DATA_TYPE.DIRECT_ACCESS),
				usePublic: toBooleanUnifyCheck(this.model.get("usePublic")),
				inputKeyValueSeparator: this.model.get("inputKeyValueSeparator"),
				inputElementSeparator: this.model.get("inputElementSeparator"),
				htmlEditable: toBooleanUnifyCheck(this.model.get("htmlEditable")),
				validatorBeanName: this.model.get("validatorBeanName")
			}));
			this._renderRequiredParamsView();
			this.model.get("inputQueries").each(function(model){
				this._queryItemAdd(model);
			}, this);
			this.toggleSubView(this.model.get("inputDataType"));
			this._itemsSortable();
		},
		_itemsSortable : function() {
			this.$el.find('#inputDirectAccessTypeList>tr ul.name_tag').sortable({
				opacity : "1",
				delay: 100,
				cursor : "move",
				items : "li:not('.creat')",
				//containment : ".name_tag",
				hoverClass: "ui-state-hover",
				forceHelperSize : "true",
				helper : "clone",
				placeholder : "ui-sortable-placeholder",
			    start : function (event, ui) {
			    	ui.placeholder.html(ui.helper.html());
			    	//ui.placeholder.html('<li name="param" style="display: block;"></li>');
			    }
			}).sortable('enable');
		},
		
		_renderRequiredParamsView: function(){
			this.requiredParamsView = new RequiredParamsView({
				model : this.model,
				observer : this.observer
			});
			this.requiredParamsView.render();
		},
		
		_inputDataTypeAllCheck: function(e){
			if($(e.currentTarget).is(':checked')){
				_.each(this.$('#inputDirectAccessTypeList input[type=checkbox]'),function(checkbox){
					$(checkbox).attr("checked", true);
				});
			}else{
				_.each(this.$('#inputDirectAccessTypeList input[type=checkbox]'),function(checkbox){
					$(checkbox).attr("checked", false);
				});
			}
		},
		
		_selectDataType: function(e){
			var $dataType = $(e.currentTarget);
			this.toggleSubView($dataType.val());
		},
		
		_clickUsePublic: function(e){
			var $target = $(e.currentTarget);
			this.model.set('usePublic', $target.val());
		},
		
		_saveInputKeyValueSeparator: function(e){
			var $target = $(e.currentTarget);
			this.model.set('inputKeyValueSeparator', $target.val());
		},
		
		_saveInputElementSeparator: function(e){
			var $target = $(e.currentTarget);
			this.model.set('inputElementSeparator', $target.val());
		},
		
		_clickHtmlEditable: function(e){
			var $target = $(e.currentTarget);
			this.model.set('htmlEditable', $target.val());
		},
		
		toggleSubView : function(data){
			var type = data || IntegrationConfig.DATA_TYPE.DIRECT_ACCESS;
			this.$('#inputStringDataTypeArea').toggle(type == IntegrationConfig.DATA_TYPE.STRING);
			this.$('#inputHtmlDataTypeArea').toggle(type == IntegrationConfig.DATA_TYPE.HTML);
			this.$('#inputDirectAccessDataTypeArea').toggle(type == IntegrationConfig.DATA_TYPE.DIRECT_ACCESS);
			this.$('#publicArea').toggle(type != IntegrationConfig.DATA_TYPE.DIRECT_ACCESS);
		},
		
		_clickBtnRowAdd: function(e){
			var addQueryModel = new IntegrationQueryModel();
			this._queryItemAdd(addQueryModel);
			this.model.get("inputQueries").add(addQueryModel);
		},
		
		_queryItemAdd: function(model){
			var self = this;
			var rowView = new RowView({model : model, observer : self.observer});
			this.$('#inputDirectAccessTypeList').append(rowView.render().$el);
		},
		
		_queryItemDelete: function(e){
			_.each(this.$('#inputDirectAccessTypeList').find('[type=checkbox]'), function(obj){
				if($(obj)[0].checked){
					var itemView = $(obj).closest('tr').data('instance');
					this.model.get("inputQueries").remove(itemView.model);
					itemView.$el.remove();
				}
			}, this);
			
			$('#inputDataTypeAllCheck').attr("checked", false);
		},
		
		getData : function(){
			var inputKeyValueSeparator = this.$('input[name="inputKeyValueSeparator"]').val();
			var inputElementSeparator = this.$('input[name="inputElementSeparator"]').val();
			var inputDataType = this.$('#selectInputDataType').val();
			var usePublic = this.$('[name=usePublic]:checked').val();
			var htmlEditable = this.$('[name=htmlEditable]:checked').val();
			var validatorBeanName = this.$('input[name="validatorBeanName"]').val();
			
			var rowViewData = [];
			this.$('#inputDirectAccessTypeList tr').each(function(idx, rowView){
				var instance = $(rowView).data('instance');
				rowViewData.push(instance.getData());
			});
			
			var data = _.extend({inputQueries : rowViewData}, {
				inputKeyValueSeparator : inputKeyValueSeparator,
				inputElementSeparator : inputElementSeparator,
				inputDataType : inputDataType,
				usePublic: usePublic,
				htmlEditable: htmlEditable,
				validatorBeanName: validatorBeanName
			},
			this.requiredParamsView.getData()
			);
			
			return data;
		},
		
		validate : function(){
			var result = true;
			this.$('#inputDirectAccessTypeList tr').each(function(idx, rowView){
				var re = new RegExp(/\?/g);
			    var resultArray = $(rowView).find('[name=inputDataAccessQuery]').val().match(re);
			    var quetionMarkCount = (resultArray && resultArray.length) || 0;
				
				if (_.isEmpty($(rowView).find('[name=inputDataAccessQuery]').val())) {
					$.goMessage(lang['Query를 입력해 주세요']);
					$(rowView).find('[name=inputDataAccessQuery]').focus();
					result = false;
	            }else if($(rowView).find('.name_tag [name=param]').length != quetionMarkCount){
					$.goMessage(lang['Query/Parameter 설정이 잘못되었습니다']);
					$(rowView).find('[name=inputDataAccessQuery]').focus();
					result = false;
				}else if($(rowView).find('.multiRow:checked').val() == "true" && _.isEmpty($(rowView).find('[name=returnMethod]').val())){
					$.goMessage(lang["데이터 유형 멀티의 설정 값을 입력해 주세요"]);
					$(rowView).find('[name=returnMethod]').focus();
					result = false;
				}
				if(!result) return false;
			});
			if(!result) return result;
			
			//validation : 데이터 유형/멀티의 값 unique 여부 체크
			var returnMethods = [];
			this.$('#inputDirectAccessTypeList tr [name=returnMethod]').each(function(idx, returnMethod){
				if(!_.isEmpty($(returnMethod).val())){
					returnMethods.push($(returnMethod).val());
				}
			});
			var filteredResult = _.uniq(returnMethods);
			if(returnMethods.length != filteredResult.length){
				$.goMessage(lang["중복된 멀티 값이 있습니다"]);
				result = false;
			}
			
			return result;
		}
	});
	
	function toBooleanUnifyCheck(data){
		return (data === 'true' || data === true)
	}
			
	return InputDataTypeView;
});