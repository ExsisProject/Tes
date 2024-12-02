// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "when",
    "app",
    "hgn!admin/templates/approval/appr_dept_setting_list_layout",
    "hgn!admin/templates/approval/appr_dept_setting_list_item",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval"
],
function(
	$,
	_,
	Backbone,
	when,
	GO,
	ListLayoutTpl,
	RowTpl,
    commonLang,
    adminLang,
    approvalLang
) {
	var lang = {

            'save' : commonLang['저장'],
            'cancel' : commonLang['취소'],
            '부서명' : adminLang['부서명'],
            '문서함' : adminLang['문서함'],
            '수신함' : adminLang['수신함'],
            "공문 발송함" : adminLang['공문 발송함']
        };
	
	var DeptSettingModel = Backbone.Model.extend({
		initialize: function(options) {
		    this.options = options || {};
		}
	});
	
	var DeptSettingCollection = Backbone.Collection.extend({
		model : DeptSettingModel,
		initialize: function(options) {
		    this.options = options || {};
		},
		url : function(){
			return GO.config('contextRoot') + 'ad/api/approval/deptsetting';
		}
	});

	var RowView = Backbone.View.extend({
		tagName : 'tr',
		initialize: function(options) {
		    this.options = options || {};
		    this.model = this.options.model;
		},
		
		events : {
			'change input[name="useDocFolder"]' : 'changeUseDocFolder',
			'change input[name="useOfficialDocSend"]' : 'changeUseOfficialDocSend',
			'change input[name="useReception"]' : 'changeUseReception'
		},
		
		changeUseDocFolder : function(e){
			this.model.set('useDocFolder', $(e.currentTarget).is(':checked'));
			if(!$(e.currentTarget).is(':checked')){
				$(e.currentTarget).parents('tr').find('[type=checkbox]').prop("checked", false);
				this.model.set('useOfficialDocSend', false);
				this.model.set('useReception', false);
			}
		},
		changeUseOfficialDocSend : function(e){
			this.model.set('useOfficialDocSend', $(e.currentTarget).is(':checked'));
		},
		changeUseReception : function(e){
			this.model.set('useReception', $(e.currentTarget).is(':checked'));
		},
		
		render : function(){
			if(this.model.get('depth') == 0){
				this.model.set('root', true);
			}
			if(this.model.get('depth') > 0){				
				this.$el.attr('class', 'dep' + this.model.get('depth'));
			}
			this.$el.html(RowTpl(this.model.toJSON()));
			return this;
		}
		
	})
	
	var ListLayoutView = Backbone.View.extend({

		el : ".layer_use_set .content",
		rowViews : null,
		events: {
        },

		initialize: function(options) {
		    this.options = options || {};
		    this.rowViews = [];
		    this.collection = new DeptSettingCollection();
		},
		
		render: function() {
			var self = this;
			var deffered = when.defer();
			this.collection.fetch({
				success : function(){
					self.$el.html(ListLayoutTpl({
						lang : lang
					}));
					self.collection.each(function(model){
						var rowView = new RowView({model : model});
						self.rowViews.push(rowView);
						self.$el.find('#deptApprTbody').append(rowView.render().$el);
						deffered.resolve();
					});
				},
				error : function(){
					console.log('error');
					deffered.reject();
				}
			});
			return deffered.promise;
		},
		
		getData : function(){
			var datas = [];
			_.each(this.rowViews, function(rowView){
				datas.push(rowView.model.toJSON());
			});
			return datas;
		}

	});

	return ListLayoutView;
});