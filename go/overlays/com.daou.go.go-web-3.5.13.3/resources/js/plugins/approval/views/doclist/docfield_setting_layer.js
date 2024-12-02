// 문서목록에서 개별 문서에 대한 View
define([
    "jquery",
    "underscore",
    "backbone",
    "when",
    "app",
    "approval/collections/doc_list_field",
    "approval/models/doc_list_field",
    "hgn!approval/templates/docfield_setting_list_layout",
    "hgn!approval/templates/docfield_setting_list_item",
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
	DocListFieldCollection,
	DocListFieldModel,
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
	
	var ListLayoutView = Backbone.View.extend({

		el : ".layer_fieldName .content",
		events: {
        },

		initialize: function(options) {
		    this.options = options || {};
		    this.toRemoveColumns = this.options.toRemoveColumns || [];
		    this.model = new DocListFieldModel({
		    	docFolderType : this.options.docFolderType
		    });
		},
		
		render: function() {
			var self = this;
			var deffered = when.defer();
			this.model.fetch({
    			dataType : "json",
				contentType:'application/json',
				success : function(model){
					var collection = model.getCollection();
					collection.addLangField();
					if(self.toRemoveColumns.length > 0){
						self.removeColumn(collection);
					}
					var datas = collection.toJSON();
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
					columnType : $(this).attr('columnType'),
					docFolderType : $(this).attr('docFolderType')
					
				})
			});
			return datas;
		},
		
		removeColumn : function(collection){
			_.each(this.toRemoveColumns, function(m){
				var toRemoveColumnModel = collection.findWhere({columnMsgKey : m});
				collection.remove(toRemoveColumnModel);
			}, this); 
		}

	});

	return ListLayoutView;
});