define([
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	
	"admin/views/approval/appr_form_integration/appr_form_integration_output_datatype",
	"admin/views/approval/appr_form_integration/appr_form_integration_output_appointeditem",
	
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_output"
], 
function(
    commonLang,
    adminLang,
    approvalLang,
    
    OutputDataTypeView,
    OutputAppointedItemView,
    
    OutputTpl
) {
	var lang = {
		"Output": "Output",
		"Output 데이터 사용여부": approvalLang["Output 데이터 사용여부"],
		"사용": commonLang["사용"],
		"미사용": approvalLang["미사용"],
		"데이터 소스": commonLang["데이터 소스"],
		"데이터 유형": commonLang["데이터 유형"],
		"데이터": commonLang["데이터"],
		"전체": commonLang["전체"],
		"지정항목": commonLang["지정항목"],
		"그룹웨어 데이터 내보내기": approvalLang["그룹웨어 데이터 내보내기"],
		"연결 정보": approvalLang["연결 정보"],
		"연결 방식": approvalLang["연결 방식"]
	}

	var OutputView = Backbone.View.extend({
		el: '#integration_output',
		initialize: function (options) {
			this.options = options || {};
			this.model = this.options.model;
			this.observer = options.observer;
			this.dataSource = this.options.dataSource;
		},

		events: {
			'click #outputUseBtn': '_outputUse',
			'click #outputNotUseBtn': '_outputNotUse',
			'click [name=returnAllVariables]': '_clickAppointedItem'
		},

		render: function () {
			var dataSourceName = this.model.get('outputDataSourceName');
			var dataSource = _.map(this.dataSource, function (m) {
				return {
					isSelected: dataSourceName == m,
					name: m
				};
			});

			this.$el.html(OutputTpl({
				lang: lang,
				data: this.model.toJSON(),
				dataSource: dataSource,
				returnAllVariables: this.model.get("returnAllVariables"),
			}));

			this.outputDataTypeView = new OutputDataTypeView({
				model: this.model,
				observer: this.observer
			});
			this.outputDataTypeView.render();
			this._renderOutputAppointedItemView();
		},

		_renderOutputAppointedItemView: function () {
			this.outputAppointedItemView = new OutputAppointedItemView({
				model: this.model,
				observer: this.observer
			});
			this.outputAppointedItemView.render();
		},

		_outputUse: function (e) {
			this.$('table.sub_form > tbody tr:eq(0)').show();
			this.$('table.sub_form > tbody tr:eq(1)').show();
			if (this.$('#selectOutputDataType').val() == "STRING") {
				this.$('table.sub_form > tbody #outputDataSection').show();
			}

			this.$('#outputUseBtn').addClass('on');
			this.$('#outputNotUseBtn').removeClass('on');
		},

		_outputNotUse: function (e) {
			this.$('table.sub_form > tbody tr:eq(0)').hide();
			this.$('table.sub_form > tbody tr:eq(1)').hide();
			this.$('table.sub_form > tbody #outputDataSection').hide();

			this.$('#outputUseBtn').removeClass('on');
			this.$('#outputNotUseBtn').addClass('on');
		},

		_clickAppointedItem: function (e) {
			var $target = $(e.currentTarget);
			if ($target.val() === 'true') {
				$('#outputDataAppointedItem').hide();
			} else {
				$('#outputDataAppointedItem').show();
			}
		},

		getData: function () {
			var useOutput = this.$('#outputUseBtn').hasClass('on');
			var outputDataSourceName = this.$('select[name="dataSource"]').val();
			var radioVal = this.$('input[name="returnAllVariables"]:checked').val();
			var returnAllVariables = radioVal === 'true' ? true : false;
			var outputAppointedItemViewData = this.outputAppointedItemView.getData();
			var outputDataTypeViewData = this.outputDataTypeView.getData();
			this.model.set({
				useOutput: useOutput,
				outputDataSourceName: outputDataSourceName,
				returnAllVariables: returnAllVariables
			});
			this.model.set(outputDataTypeViewData);
			this.model.set(outputAppointedItemViewData);
			return this.model;
		},

		validate: function () {
			if (!this.$('#outputUseBtn').hasClass('on')) {
				return true;
			}

			return this.outputDataTypeView.validate();
		}
	});
			
	return OutputView;
});