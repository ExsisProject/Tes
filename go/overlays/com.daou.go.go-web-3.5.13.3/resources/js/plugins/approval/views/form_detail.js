// 시행문 전환 Layer
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "hgn!approval/templates/form_detail",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	FormDetailTpl,
    commonLang,
    approvalLang
) {
	var formDetailModel = Backbone.Model.extend({
		getDetail: function(formId){
			this.formId = formId;
		},
		
		url: function() {
			return '/api/approval/apprform/'+ this.formId;
		}
	});
	
	var lang = {
			'제목': commonLang['제목'],
			'전사문서함': approvalLang['전사문서함'],
			'부서문서함': approvalLang['부서문서함'],
			'보존연한': approvalLang['보존연한'],
			"년" : approvalLang["년"],			
			"설명" : approvalLang["설명"],
			"기안부서" : approvalLang["기안부서"],
			"소속된 부서가 없습니다" : approvalLang["소속된 부서가 없습니다"]
		};
	
	var FormDetailView = Backbone.View.extend({
		el : "#form_detail",
		
		initialize: function() {
			this.deptFolderInfos = this.options.deptFolderInfos;
			this.drafterDeptFolderInfos = this.options.drafterDeptFolderInfos;
			this.model = new formDetailModel();
		},
		
		events: {
			"change #draftDeptId" : "changeDept"
		},
		
		formDetail: function(formId){
			this.formId = formId;
			this.model.getDetail(this.formId, {silent : true });
			this.model.fetch({ async : false });
			var dData = this.model.toJSON();
			var preserveYear = this.model.get('preserveDurationInYear');
			if (preserveYear == '0') {
				preserveYear = approvalLang["영구"];
			} else {
				preserveYear += approvalLang["년"];
			}
			this.$el.html(FormDetailTpl({
					dData : dData,
					deptFolderInfos : this.deptFolderInfos,
					drafterDeptFolderInfos : this.drafterDeptFolderInfos,
					emptyDept: $.isEmptyObject(this.drafterDeptFolderInfos),
					preserveYear : preserveYear,
					lang: lang
				})
			);
			this.changeDept();
		},
		
		emptyDetail: function(formId){
			this.$el.html(FormDetailTpl({lang: lang}));
		},
		
		changeDept: function() {
			var self = this;
			var selectedDeptId = $('#draftDeptId').val();
			$.each(this.drafterDeptFolderInfos, function(idx, drafterDeptFolderInfo){
				if (drafterDeptFolderInfo.deptId == selectedDeptId) {
					self.resetDeptDocFolders(drafterDeptFolderInfo);
				}
			});
		},
		
		resetDeptDocFolders: function(deptFolderInfo) {
			$('#deptFolderId').find('option').remove();
			$('#deptFolderId').append('<option>' + approvalLang['미지정'] + '</option>');
			$.each(deptFolderInfo.deptFolders, function(idx, deptFolder){
				$('#deptFolderId').append('<option value="' + deptFolder.folderId+ '">' + deptFolder.folderName + '</option>');
			});
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return FormDetailView;
});