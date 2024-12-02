define([
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	'admin/constants/integration_config',
    "admin/views/approval/appr_form_integration/appr_form_integration_output_tab",
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_output_datatype"
], 
function(
    commonLang,
    adminLang,
    approvalLang,
    IntegrationConfig,
    DirectAccessTabView,
    DataTypeTpl
    
) {	
	var lang = {
			"DirectAccess" : "DirectAccess",
			"String" : "String",
			"key value 구분자" : approvalLang["key value 구분자"],
			"Data 구분자" : approvalLang["Data 구분자"]
	}
	
	var deFaultDataType = "DIRECT_ACCESS";
	
	var OutputDataTypeView = Backbone.View.extend({
		el : "#outputDataType",
		directAccessTabView : null,
		
		initialize : function(options) {
			this.options = options || {};
			this.model = this.options.model;
			this.observer = options.observer;
		},
		
		events : {
			"change #selectOutputDataType" : "_selectDataType"
		},
		
		render : function() {
			this.$el.html(DataTypeTpl({
						lang: lang,
						model: this.model.toJSON()
					}));
			this.$('#selectOutputDataType').val(this.model.get('outputDataType') || deFaultDataType);
			this._renderDirectAccessTabView();
			this.toggleSubView(this.model.get('outputDataType'));
		},
		
		_selectDataType: function(e){
			var $dataType = $(e.currentTarget);
			this.toggleSubView($dataType.val());
		},
		
		getData : function(){
			var outputKeyValueSeparator = this.$('input[name="outputKeyValueSeparator"]').val();
			var outputElementSeparator = this.$('input[name="outputElementSeparator"]').val();
			var outputDataType = this.$('#selectOutputDataType').val();
			var tabViewData = this.directAccessTabView.getData();
			var data = _.extend(tabViewData, {
				outputKeyValueSeparator : outputKeyValueSeparator,
				outputElementSeparator : outputElementSeparator,
				outputDataType : outputDataType
			});
			
			return data;
		},
		
		validate : function(){
			var directAccessTabResult = this.directAccessTabView.validate();
			return directAccessTabResult;
		},
		
		toggleSubView: function(data){
			var self = this;
			var type = data || IntegrationConfig.DATA_TYPE.DIRECT_ACCESS;
			this.$('#outputStringDataTypeArea').toggle(type == IntegrationConfig.DATA_TYPE.STRING);
			this.directAccessTabView.$el.toggle(type == IntegrationConfig.DATA_TYPE.DIRECT_ACCESS);
			
			if(type == IntegrationConfig.DATA_TYPE.STRING){
				self.$el.parent().parent().next('tr').attr('style','display:table-row;');
			}else if(type == IntegrationConfig.DATA_TYPE.DIRECT_ACCESS){
				self.$el.parent().parent().next('tr').attr('style','display:none');
			}
		},
		
		_renderDirectAccessTabView : function(){
			this.directAccessTabView = new DirectAccessTabView({
				collection : this.model.get('outputQueries'),
				observer : this.observer
			});
			this.directAccessTabView.render();
		}
	});
			
	return OutputDataTypeView;
});