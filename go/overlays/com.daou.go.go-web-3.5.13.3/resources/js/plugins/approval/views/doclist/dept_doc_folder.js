define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/dept_doc_folder",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	DeptDocFolderTpl,
    commonLang,
    approvalLang
) {
	var docIds;
	
	var DeptFolderTree = Backbone.Collection.extend({
		model : Backbone.Model.extend(),
		url : function(){
			// 문서 이동
			return '/api/approval/deptfolder/' + this.deptId;
			// 문서 복사 
			//return '/api/approval/deptfolder';
		},
		setDeptId: function(deptId){
			this.deptId = deptId;
		}
	});
	
	var DeptDocFolderView = Backbone.View.extend({
		
		el : ".layer_doc_type_select .content",
		
		initialize: function(options) {
		    this.options = options || {};
			this.deptId = this.options.deptId;
			this.deptName = this.options.deptName;
		},
		events: {
			'click span.txt' : 'selectFolder'
		},
		render: function() {
			this.collection = new DeptFolderTree();
			var deptId = this.deptId;
			var deptName = this.deptName;
			this.collection.setDeptId(deptId);
			this.collection.fetch({async:false});
			
			var lang = {
				'문서 이동' : approvalLang['문서 이동'],
				'문서함이 없습니다' : approvalLang['문서함이 없습니다']
			};
			
			var dataset = this.collection.toJSON();
			
			var tpl = DeptDocFolderTpl({
				lang: lang,
				dataset : dataset,
				deptName : deptName
			});
			
			this.$el.html(tpl);
		},
		
		selectFolder: function(e){
			var selectedEl = $(e.currentTarget).parents('p.folder');
			this.$el.find('.on').removeClass('on');
			selectedEl.addClass('on');
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		},
		
		isEmptyDocFolder: function(){
			this.collection = new DeptFolderTree();
			var deptId = this.deptId;
			this.collection.setDeptId(deptId);
			this.collection.fetch({async:false});
			return this.collection.length == 0 ? true : false;
		}
		
	});
	
	return DeptDocFolderView;
});