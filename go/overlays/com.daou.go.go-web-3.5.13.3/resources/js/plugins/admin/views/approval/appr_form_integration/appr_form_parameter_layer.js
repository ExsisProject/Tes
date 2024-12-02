define([
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	'admin/constants/integration_config',
    "hgn!admin/templates/approval/appr_form_integration/appr_form_parameter_layer"
], 
function(
    commonLang,
    adminLang,
    approvalLang,
    IntegrationConfig,
    ParameterLayerTpl
) {	
	
	var lang = {
			"값을 입력해 주세요" : commonLang["값을 입력해 주세요"],
			"동일한 variable이 존재 합니다" : approvalLang["동일한 variable이 존재 합니다"],
			"Document" : "Document",
			"STRING" : "STRING",
			"NUMBER" : "NUMBER",
			"BOOLEAN" : "BOOLEAN",
			"추가" : commonLang["추가"],
			"Variables" : "Variables"
	}
	
	var ItemTpl = ['<td class="name" data-name="{{paramName}}" data-type="{{dataType}}"><a>{{paramName}}({{dataType}})</a></td>',
					'{{^isDocument}}',
						'<td class="func"><span class="btn_bdr" title="{{label_remove}}"><span class="ic_classic ic_basket"></span></span></td>',
					'{{/isDocument}}'].join('');
	
	var ParameterItemView = Backbone.View.extend({
		tagName : 'tr',
		initialize : function(options) {
			this.data = options.data;
			this.observer = options.observer;
		},
		events : {
			'click span.btn_bdr' : 'removeParam',
			'click td.name' : 'addParameter'
		},
		
		addParameter : function(){
			this.trigger('addParameter', this.data);
		},
		
		removeParam : function(e){
			e.stopPropagation();
			$(e.currentTarget).closest('tr').remove();
		},
		
		render : function(){
			this.$el.html(Hogan.compile(ItemTpl).render(this.data));
			return this;
		}
	});
	
	var ParameterLayerView = Backbone.View.extend({
		el : '.layer_normal.parameter_popup > .content',
		initialize : function(options) {
			this.model = options.model;
			this.observer = options.observer;
			this.parameters = this._setParameters();
			
		},
		
		_setParameters: function(){
			var layerParameters = [];
			
			var tempDocumentData = [{
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
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getDraftedAt",
				paramType: "DOCUMENT"
			},{
				dataType: "STRING",
				isDocument: true,
				paramName: "getCompletedAt",
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
            
            //inputDataType Parameters Set
            var inputDataTypeNodeParameters = $('[name=input_parameters]');
            $.each(inputDataTypeNodeParameters, function(idx, param){
        		if($(param).attr('data-paramtype') != 'DOCUMENT'){
        			layerParameters.push({
            			dataType: $(param).attr('data-datatype'),
            			isDocument: false,
            			paramName: $(param).attr('data-paramname'),
            			paramType: $(param).attr('data-paramtype')
            		});
            	}
            });
            
            //outputDataType Parameters Set
            var outputDataTypeNodeParameters = $('[name=output_parameters]');
            $.each(outputDataTypeNodeParameters, function(idx, param){
        		if($(param).attr('data-paramtype') != 'DOCUMENT'){
        			layerParameters.push({
            			dataType: $(param).attr('data-datatype'),
            			isDocument: false,
            			paramName: $(param).attr('data-paramname'),
            			paramType: $(param).attr('data-paramtype')
            		});
            	}
            });
            return this._getUniqueParam(layerParameters);
		},
		
		_getUniqueParam: function(params){
			var arr = {};
			for ( var i=0, len=params.length; i < len; i++ )
			    arr[params[i]['paramName']] = params[i];
			params = new Array();
			for ( var key in arr )
				params.push(arr[key]);
			return params;
		},
		
		events : {
			'click .btn_s' : 'addVariables'
		},
		
		addVariables : function(){
			var dataType = this.$('select').val();
			var paramName = this.$('input:text').val();
			var paramType = IntegrationConfig.PARAM_TYPE.VARIABLE;
			
			if(_.isEmpty(paramName)){
				$.goMessage(lang['값을 입력해 주세요']);
				return false;
			}
			
			var result = true;
			_.each(this.$('#parameter_variablesList .name'), function(variable){
				if($(variable).attr('data-name') == paramName){
					result = false;
					return false;
				}
			});
			if(!result){
				$.goMessage(lang['동일한 variable이 존재 합니다']);
				return false;
			}
			
			this.addItemView({
				dataType : dataType,
				paramName : paramName,
				paramType : paramType
			})
			this.$('input:text').val('');
		},
		
		addItemView : function(data){
			var self = this;
			var isDocument = data['paramType'] == IntegrationConfig.PARAM_TYPE.DOCUMENT;
			data['isDocument'] = isDocument; 
			var itemView = new ParameterItemView({
				data : data,
				observer : this.observer
				
			});
			if(isDocument){
				this.$('#parameter_documentList').append(itemView.render().$el);
			}else{
				this.$('#parameter_variablesList').append(itemView.render().$el);					
			}
			
			itemView.on('addParameter', function(data){
				self.trigger('addParameter', data);
			});
		},
		
		render : function() {
			this.$el.html(ParameterLayerTpl({
				lang : lang
			}));
			_.each(this.parameters, function(data){
				this.addItemView(data);
			}, this);
		}
	});
			
	return ParameterLayerView;
});