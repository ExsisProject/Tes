//사용자환경설정(사인/패스워드)
// 기안문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "when",
    "app",
    "hgn!approval/templates/create_rule",
    "hgn!approval/templates/update_rule",
    
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
], 
function(
	$, 
	_, 
	Backbone, 
	when,
	GO,
	CreateRuleTmpl,
	UpdateRuleTmpl,
	
	commonLang,
	approvalLang
) {
	
	var ApprClassificationRuleModel = Backbone.Model.extend({
		url: function() {
			var url = '/api/approval/classify/user/rule';
			if(this.deptId){
				url = '/api/approval/classify/dept/'  + this.deptId + '/rule';
			}
			if(this.ruleId != undefined){
				url = url + '/' + this.ruleId;
			}
			return url;
		},
		setRuleId: function(ruleId){
			this.ruleId = ruleId;
		},
		setDeptId : function(deptId){
			this.deptId = deptId;
		}
	}); 

	var FolderTree = Backbone.Collection.extend({
		model : Backbone.Model.extend(),
		url : function(){
			if(this.deptId){
				return '/api/approval/deptfolder/' + this.deptId;
			}
			return '/api/approval/userfolder/' + this.userId;
		},
		setUserId: function(userId){
			this.userId = userId;
		},
		setDeptId : function(deptId){
			this.deptId = deptId;
		}
	});
	
	var ApprClassificationRuleOwnerModel = Backbone.Model.extend({
		url: function(){
			if(this.deptId){
				return '/api/approval/classify/dept/owner/' + this.deptId;
			}
			return '/api/approval/classify/owner';
		},
		setDeptId : function(deptId) {
			this.deptId = deptId;
		}
	});
    
    var lang = {
    		"draftFolder" : approvalLang["기안 문서함"],
    		"approvalFolder" : approvalLang["결재 문서함"],
    		"refferenceReadFolder" : approvalLang["참조/열람 문서함"],
    		"receiveFolder" : approvalLang["수신 문서함"],
    		"deptDraftFolder" : approvalLang["기안 완료함"],
    		"deptRefferenceReadFolder" : approvalLang["부서 참조함"],
    		"deptReceiveFolder" : approvalLang["부서 수신함"],
    		"document" : approvalLang["의 문서에"],
    		"title" : approvalLang["제목이"],
    		"formName" : approvalLang["양식명이"],
    		"drafter" : approvalLang["기안자가"],
    		"draftDept" : approvalLang["기안부서가"],
    		"include" : approvalLang["을(를) 포함 할 때"],
    		"allCondition" : approvalLang["모두 만족"],
    		"matchAllCondition" : approvalLang["위의 조건을 모두 만족할 때 분류합니다"],
    		"oneCondition" : approvalLang["하나만 만족"],
    		"matchOneCondition" : approvalLang["위의 조건 중 하나만 만족해도 분류합니다"],
    		"classifyDocument" : approvalLang["해당 문서를 다음 문서함에 분류"],
    		"completeDocumentOnly" : approvalLang["문서의 진행 상태가 완료된 것만 분류됩니다"],
    		"notClassifyDocumentOnly" : approvalLang["이미 수동으로 분류된 문서는 자동분류에 포함되지 않습니다"],
    		"docFolderIsEmpty" : approvalLang["문서함이 없습니다"]
    };
	
	var CreateRuleView = Backbone.View.extend({
		
		initialize: function(options) {
			this.options = options || {};
			this.userId = GO.session("id");
			this.deptId = this.options.deptId;
			this.docId =this.options.docId;
			this.docInfo = this.options.docInfo;

			this.collection = new FolderTree();
			this.ownerModel = new ApprClassificationRuleOwnerModel();
			if(this.deptId){
				this.collection.setDeptId(this.deptId);
				this.ownerModel.setDeptId(this.deptId);
			}else{
				this.collection.setUserId(this.userId);
			}
			this.collection.fetch({async:false});
			this.ownerModel.fetch({async:false});
			
			this.ruleId = this.options.ruleId;
			if(this.ruleId != undefined){
				this.model = new ApprClassificationRuleModel();
				if(this.deptId){
					this.model.setDeptId(this.deptId);
				}
				this.model.setRuleId(this.ruleId);
				this.model.fetch({async:false});
			}
		},
		
		events: {
			'click input:checkbox' : 'toggleCheckbox'
    	},
		
		render: function() {
			var docFolders = this.collection.toJSON();
			if(this.ruleId){
				this.renderUpdateView(docFolders);
			}else if(this.docId){
				this.renderCreateFromList(docFolders);
			}else{
				this.renderCreateView(docFolders);
			}
			return this;
		},
		
		renderCreateView : function(docFolders) {
			this.$el.html(CreateRuleTmpl({
				lang:lang,
				docFolders : docFolders,
				isDept : this.deptId ? true : false
			}));
		},
		
		renderUpdateView : function(docFolders) {
			var useTitle = false;
			var useForm = false;
			var useDrafter = false;
			var useDraftDept = false;
			var title;
			var form;
			var drafter;
			var draftDept;
			var model = this.model.toJSON();
			$.each(model.ruleSetModel.rules, function(i, item){
				if(item.type == "TITLE"){
					title = item.target;
					useTitle = true;
				} else if (item.type == "FORM") {
					form  = item.target;
					useForm = true;
				} else if (item.type == "DRAFTER") {
					drafter  = item.target;
					useDrafter = true;
				} else if (item.type == "DRAFT_DEPT") {
					draftDept  = item.target;
					useDraftDept = true;
				}
			});
			this.$el.html(UpdateRuleTmpl({
				lang:lang,
				docFolders : docFolders,
				title : title,
				useTitle : useTitle,
				form : form,
				useForm : useForm,
				drafter : drafter,
				useDrafter : useDrafter,
				draftDept : draftDept,
				useDraftDept : useDraftDept,
				condition : model.ruleSetModel.condition == "AND" ? true : false,
				destinationFolder : function(){
					if(model.ruleSetModel.postActionList[0].destinationDocFolderId == this.folderId){
						return "selected";
					}
				},
				isDept : this.deptId ? true : false
			}));
			var selectedDocFolderType = model.ruleSetModel.targetDocfolder.docFolderType;
			this.$el.find("#folderType option[value='"+selectedDocFolderType+"']").attr("selected", "selected");
			this.toggleCheckbox();
		},
		renderCreateFromList : function(docFolders) {
			this.$el.html(UpdateRuleTmpl({
				lang:lang,
				docFolders : docFolders,
				title : this.docInfo.title,
				useTitle : true,
				form : this.docInfo.form,
				useForm : true,
				drafter : this.docInfo.drafter,
				useDrafter : true,
				draftDept : this.docInfo.draftDeptName,
				useDraftDept : true,
				isDept : this.deptId ? true : false
			}));
			this.$el.find("#folderType option[value='"+this.docInfo.docFolderType+"']").attr("selected", "selected");
			this.toggleCheckbox();
		},
		
		createRule : function() {
			var defer = when.defer();
			var model = new ApprClassificationRuleModel();
			if(this.deptId){
				model.setDeptId(this.deptId);
			}
			var type = "POST";
			if(this.ruleId){
				model = this.model;
				type = "PUT";
			}
			var ruleSetModel = {};
			var rules = [];
			
			if ($('#titleCheck').is(':checked')) {
				rules.push({"type":"TITLE", "target":$('#titleText').val()});
			} 
			if ($('#formNameCheck').is(':checked')) {
				rules.push({"type":"FORM", "target":$('#formNameText').val()});
			} 
			if ($('#drafterCheck').is(':checked')) {
				rules.push({"type":"DRAFTER", "target":$('#drafterText').val()});
			} 
			if ($('#draftDeptCheck').is(':checked')) {
				rules.push({"type":"DRAFT_DEPT", "target":$('#draftDeptText').val()});
			}
			
			ruleSetModel.rules = rules;
			ruleSetModel.condition = $('#allCondition').is(':checked') ? "AND" : "OR";
			ruleSetModel.targetDocfolder = {"type":this.deptId ? "DEPT" : "USER", 
											"docFolderType": $('#folderType option:selected').val()};
			ruleSetModel.postActionList = [{"actionType" : "CLASSIFY", 
											"docFolderType" : this.deptId ? "DEPT" : "USER", 
											"destinationDocFolderId":$('#destinationFolder option:selected').val()}];
			
			model.set({'ruleSetModel' : ruleSetModel}, { silent : true });
			model.set({'ownerId' : this.ownerModel.get('id')}, { silent : true });
			model.save({}, {
				type : type,
				success: function() {
                    $.goMessage(commonLang['저장되었습니다.']);
                    return defer.resolve();
	            },
	            error : function(model,rs){
					var result = JSON.parse(rs.responseText);
	            	$.goError(result.message);
	            	defer.reject();
	            }});
			return defer.promise;
		},
		
		validate : function() {
			var valid = true,
				focusEl;
			if($('#destinationFolder option:checked').val() == "" || $('#destinationFolder option:checked').val() == undefined) {
				valid = false;
				$.goError(approvalLang["분류할 문서함 없음"]);
				return valid;
			}
			
			var isTitleCheck = $('#titleCheck').is(":checked"),
				isFormNameCheck = $('#formNameCheck').is(":checked"),
				isDrafterCheck = $('#drafterCheck').is(":checked"),
				isDraftDeptCheck = $('#draftDeptCheck').is(":checked");
			
			
			if(!isTitleCheck && !isFormNameCheck && !isDrafterCheck && !isDraftDeptCheck){
				valid = false;
				$.goError(approvalLang["선택된 항목이 없습니다."]);
				return valid;
			}
			if(isTitleCheck && $('#titleText').val() == ""){
				valid = false;
				focusEl = $('#titleText');
			}
			if(isFormNameCheck && $('#formNameText').val() == ""){
				valid = false;
				focusEl = $('#formNameText');
			}
			if(isDrafterCheck && $('#drafterText').val() == ""){
				valid = false;
				focusEl = $('#drafterText');
			}
			if(isDraftDeptCheck && $('#draftDeptText').val() == ""){
				valid = false;
				focusEl = $('#draftDeptText');
			}
			if(!valid){
				$.goError(approvalLang["규칙설정 항목을 입력하세요."]);
				focusEl.focus();
			}
			return valid;
		},
		
		toggleCheckbox : function() {
			var target = this.$('input:checkbox:checked');
			if (target.length > 1) {
				this.$('.condition_view').show();
			}else{
				this.$('.condition_view').hide();
			}
		}
		
	});
	
	return CreateRuleView;
});