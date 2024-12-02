// 주소록 필드 설정 View
define([
    "jquery",
    "underscore",
    "backbone",
    "when",
    "app",

    "contact/models/contact_list_field",
    "hgn!contact/templates/contact_field_setting_list_layout",
    "i18n!nls/commons"
],
function(
	$,
	_,
	Backbone,
	when,
	GO,

	ContactListFieldModel,
	ListLayoutTpl,
    commonLang
) {
	var lang = {

            'save' : commonLang['저장'],
            'cancel' : commonLang['취소']
        };

	var ListLayoutView = Backbone.View.extend({

		initialize: function(options) {

		    this.options = options || {};
		    this.model = new ContactListFieldModel({
				isGetFieldList : this.options.isGetFieldList
		    });
		},

		render: function() {
			var self = this;
			var deffered = when.defer();
			this.model.fetch({
    			dataType : "json",
				contentType:'application/json',
				success : function(model){

					var datas = model.getContactListFields();
					self.$el.html(ListLayoutTpl({
						lang : lang,
						data : datas
					}));
					deffered.resolve();
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
			this.$('#fieldSettingTbody').find('input:checkbox:checked').each(function(i, v){
				datas.push({
					fieldCode : $(this).attr('fieldCode')
				})
			});
			return datas;
		}

	});

	return ListLayoutView;
});