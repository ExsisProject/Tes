define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/document/dept_folder",
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
	var sideDeptFolderModel = Backbone.Model.extend();
	var SideDeptFolderCollection = Backbone.Collection.extend({
		model: sideDeptFolderModel,
		url: '/api/approval/deptfolder'
	});
	
	var lang = {
		'문서 이동' : approvalLang['문서 이동'],
		'문서함이 없습니다' : approvalLang['문서함이 없습니다'],
		'부서 문서함이 존재하지 않습니다' : approvalLang['부서 문서함이 존재하지 않습니다.'],
	};
	
	var DeptDocFolderView = Backbone.View.extend({
		
		el : ".layer_doc_type_select .content",
		
		initialize: function(options) {
//			this.deptId = this.options.deptId;
//			this.deptName = this.options.deptName;
			
		    this.options = options || {};
			this.sideDeptFolderCollection = new SideDeptFolderCollection();
			this.sideDeptFolderCollection.fetch({ async : false });
		},
		events: {
			'click span.txt' : 'selectFolder'
		},
		render: function() {
			var dataset = this.sideDeptFolderCollection.toJSON(),
			containsSubDept = false;
			
			if (!dataset.length || !GO.session('useOrg')) {
			} else {
				$.each(dataset, function(k,v) {
					if(v.managable && v.containsSubDept) {
						containsSubDept = true;
					}
				});
			}
			
			var tpl = 
				DeptDocFolderTpl({
					contextRoot : GO.contextRoot,
					dataset : dataset,
					containsSubDept : containsSubDept,
					lang : lang,
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
		}
		
	});
	
	return DeptDocFolderView;
});