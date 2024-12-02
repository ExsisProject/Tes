define([
    'when',
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
    "admin/views/approval/appr_form_integration/appr_form_integration_input",
    "admin/views/approval/appr_form_integration/appr_form_integration_output"
], 
function(
	when,
    commonLang,
    adminLang,
    approvalLang,
    InputView,
    OutputView
    
) {
	var lang = {}

	var MainTpl = ['<div>',
		'<div style="position: static; left: 0; top: 0;">',
		'<div id="integration_input"></div>',
		'<div id="integration_output"></div>',
		'</div>',
		'</div>'].join('');

	var MainView = Backbone.View.extend({
		el: '.layer_normal.layer_appr_link .content',
		dataSources: null,
		initialize: function (options) {
			this.model = options.model;
			this.model.makeSubModel();
			// 옵져버 초기화
			this.observer = _.extend({}, Backbone.Events);
		},

		events: {},

		fetchDataSource: function () {
			var self = this;
			var deffered = when.defer();
			when($.ajax({
				type: "GET",
				dataType: "json",
				url: GO.config('contextRoot') + 'ad/api/approval/integration/datasource',
				success: function (resp) {
					self.dataSource = resp.data;
					deffered.resolve();
				},
				error: function () {
					deffered.reject();
				}
			})).otherwise(function printError(err) {
				console.log(err.stack);
			});
			return deffered.promise;
		},

		getData: function () {
			var inputModel = this.inputView.getData();
			this.model.set(inputModel.toJSON());

			var outputModel = this.outputView.getData();
			this.model.set(outputModel.toJSON());

			return this.model;
		},

		validate: function () {
			var inputViewResult = this.inputView.validate();
			var outputViewtResult = this.outputView.validate();
			return inputViewResult && outputViewtResult;
		},

		render: function () {
			var compiled = Hogan.compile(MainTpl);
			this.$el.html(compiled.render({
				lang: lang
			}));
			this._renderInputView();
			this._renderOutputView();
		},

		_renderInputView: function () {
			this.inputView = new InputView({
				model: this.model.getInputModel(),
				dataSource: _.clone(this.dataSource),
				observer: this.observer
			});
			this.inputView.render();
		},

		_renderOutputView: function () {
			this.outputView = new OutputView({
				model: this.model.getOutputModel(),
				dataSource: _.clone(this.dataSource),
				observer: this.observer
			});
			this.outputView.render();
		}
	});
			
	return MainView;
});