define([
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	
	"admin/views/approval/appr_form_integration/appr_form_integration_input_datatype",
	"admin/views/approval/appr_form_integration/appr_form_integration_input_event",
	
	"admin/collections/approval/integration_query",	
    "admin/models/approval/integration_query",
	
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_input"
], 
function(
    commonLang,
    adminLang,
    approvalLang,
    
    InputDataTypeView,
    InputEventView,
    
    IntegrationQueryCollection,
    IntegrationQueryModel,
    
    InputTpl
    
) {
	var lang = {
		"Input": "Input",
		"Input 데이터 사용여부": approvalLang["Input 데이터 사용여부"],
		"사용": commonLang["사용"],
		"미사용": approvalLang["미사용"],
		"데이터 소스": commonLang["데이터 소스"],
		"데이터 유형": commonLang["데이터 유형"],
		"Input Event": "Input Event",
		"그룹웨어로 연동 데이터 가져오기": approvalLang["그룹웨어로 연동 데이터 가져오기"],
		"연결 정보": approvalLang["연결 정보"],
		"연결 방식": approvalLang["연결 방식"],
		"이벤트": approvalLang["이벤트"]
	}

	var InputView = Backbone.View.extend({
		el: '#integration_input',
		initialize: function (options) {
			this.options = options || {};
			this.model = this.options.model;
			this.observer = options.observer;
			this.dataSource = this.options.dataSource;
		},

		events: {
			'click #inputUseBtn': '_inputUse',
			'click #inputNotUseBtn': '_inputNotUse'
		},

		render: function () {
			var dataSourceName = this.model.get('inputDataSourceName');
			var dataSource = _.map(this.dataSource, function (m) {
				return {
					isSelected: dataSourceName == m,
					name: m
				};
			});

			this.$el.html(InputTpl({
				lang: lang,
				data: this.model.toJSON(),
				dataSource: dataSource
			}));
			this.inputDataTypeView = new InputDataTypeView({
				model: this.model,
				observer: this.observer
			});
			this.inputDataTypeView.render();

			this.inputEventView = new InputEventView({
				model: this.model
			});
			this.inputEventView.render();

		},

		_inputUse: function () {
			this.$('table.sub_form > tbody tr').show();
			this.$('#inputUseBtn').addClass('on');
			this.$('#inputNotUseBtn').removeClass('on');
		},

		_inputNotUse: function () {
			this.$('table.sub_form > tbody tr').hide();
			this.$('#inputUseBtn').removeClass('on');
			this.$('#inputNotUseBtn').addClass('on');
		},

		getData: function () {
			var useInput = this.$('#inputUseBtn').hasClass('on');
			var inputDataSourceName = this.$('select[name="dataSource"]').val();
			var inputDataTypeViewData = this.inputDataTypeView.getData();
			var inputEventViewData = this.inputEventView.getData();
			this.model.set({
				useInput: useInput,
				inputDataSourceName: inputDataSourceName,
			});
			this.model.set(inputDataTypeViewData);
			this.model.set(inputEventViewData);
			return this.model;
		},

		validate: function () {
			if (!this.$('#inputUseBtn').hasClass('on')) {
				return true;
			}

			var inputDataTypeResult = this.inputDataTypeView.validate();
			var inputEventResult = this.inputEventView.validate();
			return inputDataTypeResult && inputEventResult;
		}
	});
			
	return InputView;
});