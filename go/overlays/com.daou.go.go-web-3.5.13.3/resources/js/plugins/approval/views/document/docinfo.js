define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/document/docinfo",
    "hgn!approval/templates/document/docinfo_view",
    "hgn!approval/templates/add_org_member",
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.go-sdk",
    "jquery.jstree",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.go-orgtab",
    "jquery.go-orgslide",
    "jquery.go-validation"
],
function(
    $,
    _,
    Backbone,
    DocInfoTpl,
    DocInfoViewTpl,
    tplAddMember,
    commonLang,
    approvalLang
) {

    var lang = {
        "문서번호" : approvalLang['문서번호'],
        "보안등급" : approvalLang['보안등급'],
        "보존연한" : approvalLang['보존연한'],
        "전사문서함" : approvalLang['전사문서함'],
        "문서참조" : approvalLang['문서참조'],
        "문서수신" : approvalLang['문서수신'],
        "전사문서함 추가" : approvalLang['전사문서함 추가'],
        "참조자 추가" : approvalLang['참조자 추가'],
        "수신처 추가" : approvalLang['수신처 추가'],
        "수정하기" : approvalLang['수정하기'],
        "삭제하기" : approvalLang['삭제하기'],
        "영구" : approvalLang['영구'],
        "년" : approvalLang['년'],
        "등급" : approvalLang['등급'],
        "미지정" : approvalLang['미지정'],
        "공개여부" : approvalLang['공개여부'],
        "공개" : approvalLang['공개'],
        "비공개" : approvalLang['비공개'],
        "문서열람" : approvalLang['문서열람'],
        "열람자 추가" : approvalLang['열람자 추가'],
        "수신자 추가" : approvalLang['수신자 추가'],
        "문서열람 저장" : approvalLang['문서열람 저장'],
        '문서정보 저장' : approvalLang['문서정보 저장'], 
        "공문발송": approvalLang['공문발송'],
        "긴급": approvalLang['긴급'],
        "긴급문서": approvalLang['긴급문서'],
        "긴급문서설명": approvalLang['긴급문서설명'],
		"기안부서" : approvalLang["기안부서"],
		'부서문서함': approvalLang['부서문서함'],
		'미지정' :  approvalLang['미지정'],
		'작성중부서변경' : approvalLang['작성중부서변경']
    };
    
    var GradeList = Backbone.Collection.extend({
        model: Backbone.Model.extend(),
        initialize: function(options) {
            this.docId = null;
            if (options.docId) {
                this.docId = options.docId;
            }
            if (_.isBoolean(options.isAdmin)) {
			    this.isAdmin = options.isAdmin;
			}
        },
        url: function() {
            var value = "/api/approval/securitylevel";
            if(this.isAdmin){
            	value = "/ad/api/approval/securitylevel";
            }
            if (this.docId) {
                value += "?docId=" + this.docId;
            }
            return value;
        }
    });

    var ApprFormModel = Backbone.Model.extend({
        defaults: {
            preserveDurationInYear: 5 // 1,3,5,영구
        }
    },
    {
        PRESERVE_YEARS : [1, 3, 5, 10, 0]
    });

    var DocInfoView = Backbone.View.extend({
        tagName: 'div',
        className: 'aside_wrapper_body',
        initialize: function(options) {
            this.options = options || {};
            this.type = this.options.type;
            this.isPopup = this.options.isPopup;
            this.docStatus = this.options.docStatus;
            this.docInfoModel = this.options.docInfoModel;
            this.actionModel = this.options.actionModel;
            this.isComplete = this.options.isComplete;
            this.isActivityUser = this.options.isActivityUser;
            this.isReader = this.options.isReader;
            this.isReceptionDocument = this.options.isReceptionDocument;
            if (_.isBoolean(this.options.isAdmin)) {
			    this.isAdmin = this.options.isAdmin;
			}
            this.gradeList = new GradeList({
                docId : options.docId,
                isAdmin : (this.isAdmin) ? this.isAdmin : false
            });
            this.isReceivedDoc = false;
            this.isReceiveWating = false;
            this.gradeList.fetch({ async : false});
        },
        events: {
            'click input[name="openType"]' : 'docOpenSelect',
            'click #doctype' : 'docTypeSelect',
            'click #reference' : 'reference',
            'click #addFolder span.ic_del' : 'folderDeleteItem',
            'change #infoSecurityLevel' : 'securityLevelSelect',
            'change #docYear' : 'docYearSelect',
            'change #emergency' : 'emergencyChange',
			"change #drafter_draftDeptId" : "changeDept",
			"change #drafter_deptFolderId" : "changeDeptFolder"
        },
        render: function() {
            var self = this;
            var docInfoTpl = null;
            if ( this.docStatus == "CREATE" || this.docStatus == "TEMPSAVE") {
                docInfoTpl = DocInfoTpl;
            } else if (this.docStatus == "RECEIVED") {
                docInfoTpl = DocInfoTpl;
                self.isReceivedDoc = true;
            } else if (this.docStatus == "RECV_WAITING" ) {
                docInfoTpl = DocInfoTpl;
                self.isReceiveWating = true;
                self.isReceivedDoc = true;
            } else {
                docInfoTpl = DocInfoViewTpl;
            }
            return self.makeDocInfo(docInfoTpl);
        },
        edit: function(isApprDocManager){
            var self = this;
            return self.makeDocInfo(DocInfoTpl, isApprDocManager);
        },
        changeDept: function() {
			var self = this;
			var selectedDeptId = $('#drafter_draftDeptId').val();
			var url = "";
            $.goConfirm(approvalLang['작성중부서변경'], '',
                function() {

	                var draftDeptId = $('#drafter_draftDeptId').val(),
	                deptFolderId = $('#drafter_deptFolderId').val();
	                if (self.isReceivedDoc) {
		                url = "/approval/document/" + options.docId;
		                if(self.isPopup){
		                	url += '/popup'
		                }
	                	GO.router.navigate(url, {trigger: true});
	                } else {
	                	if (self.docStatus == 'TEMPSAVE') {
	                		self.trigger('tempsavechangedept', draftDeptId);
	                	} else {
			                url = "/approval/document/new/" + draftDeptId + "/" + self.docInfoModel.formId;
			                if(self.isPopup){
			                	url += '/popup'
			                }
				            if ($.isNumeric(deptFolderId)) {
				                url += "?deptFolderId=" + deptFolderId;
				            }
				            
				            GO.router.navigate(url, {trigger: true});
	                	} 
	                }
        	
                }
                , function(){
                	self.setDefaultDraterDeptId();
            });
		},
		
		setDefaultDraterDeptId : function(){
			this.$('#drafter_draftDeptId').val(this.docInfoModel.drafterDeptId);			
		},
		
		changeDeptFolder : function(e){
        	this.docInfoModel['drafterDeptFolderId'] = $(e.currentTarget).find('option:selected').val();
		},
		
        makeDocInfo: function(docInfoTpl, isApprDocManager){
            var securityLevel = this.docInfoModel.securityLevelId;
            var docYear =   this.docInfoModel.docYear;
            this.yearsModel = new ApprFormModel();
            var preserveYears = _.map(ApprFormModel.PRESERVE_YEARS, function(num) {
                 return {
                     'value' : num,
                     'label' : (num == 0) ? approvalLang['영구'] : num + approvalLang['년'],
                     'isSelected' : (this.yearsModel.get('preserveDurationInYear') * 1 == num * 1) ? true : false
                 };
            }, this);
            var draferDepts = _.map(this.docInfoModel.drafterDeptFolders, function(obj, idx) {
                return {
                    'value' : obj.deptId,
                    'label' : obj.deptName,
                    'isSelected' : obj.deptId == this.docInfoModel.drafterDeptId ? true : false
                };
           }, this);
            
            var targetDocFolders = _.findWhere(this.docInfoModel.drafterDeptFolders, {
            		deptId : this.docInfoModel.drafterDeptId
            });

            var deptDocFolders = [];
            if(targetDocFolders){
            	deptDocFolders = _.map(targetDocFolders.deptFolders, function(obj, idx) {
            		return {
            			'value' : obj.folderId,
            			'label' : obj.folderName,
            			'isSelected' : obj.folderId == this.docInfoModel.drafterDeptFolderId ? true : false
            		};
            	}, this);
            }
            

            
            var selectedGrade = function(){
                if ( securityLevel == this.id ) {
                    return true;
                } else {
                    return false;
                }
            };
            var selectedYear = function(){
                if ( docYear == this.value ) {
                    return true;
                } else {
                    return false;
                }
            };
            var defaultFolder = this.docInfoModel.defaultFolder;
            if (defaultFolder) {
                $.each(this.docInfoModel.docFolders, function(idx, folder) {
                    if (folder.id == defaultFolder.id) {
                        folder.isDefault = true;
                    }
                });
            }
            this.$el.html(docInfoTpl({
                lang : lang,
                docInfo : this.docInfoModel,
                action : this.actionModel,
                grade : this.gradeList.toJSON(),
                isSelectedGrade : selectedGrade,
                preserveYears: preserveYears,
                isSelecteYear : selectedYear,
                isComplete : this.isComplete,
                isReaderModifable : this.isReader || this.isActivityUser,
                isActivityUser : this.isActivityUser,
                isReceptionDocument : this.isReceptionDocument,
                isEmergency : this.docInfoModel.isEmergency,
                isReceivedDoc : this.isReceivedDoc,
                isReceiveWating : this.isReceiveWating,
                draferDepts : draferDepts,
                deptDocFolders : deptDocFolders,
                isApprDocManager : !!isApprDocManager,
                isInprogressDoc : this.docStatus == 'INPROGRESS'
            }));
            return this;
        },

        reference : function(e) {
            var self = this;
            var popup = $.goPopup({
                "pclass" : "layer_normal",
                "header" : approvalLang['참조자 추가'],
                "modal" : true,
                "width" : 310,
                "contents" : '<form></form><div id="orgtab"></div>',
                "buttons" : [{
                                'btext' : approvalLang['추가'],
                                'btype' : 'confirm',
                                'autoclose' : false,
                                'callback' : function(rs){
                                    self.addReference(rs);
                                }
                            },
                            {
                                'btext' : commonLang["닫기"],
                                'btype' : 'cancel'
                            }]
            });
            this.orgTab = $.goOrgTab({
                multiCompanyVisible : self.actionModel.multiCompanySupporting,
                elId : "orgtab",
                css : {
                    'minHeight' : 310,
                    'maxHeight' : 310
                }
            });
            
            // TODO: 리팩토링 필요
            // 관련이슈: [GO-16166] 전자결재 > 결재 정보 레이어가 아래로 늘어나는 현상 (UI 깨짐)
            // 같은 orgTab을 쓰더라도 결재 정보에서는 높이지정을 하지 않아도 위 이슈의 현상이 해결되나, 
            // 참조자와 수신처 지정에서 사용되는 orgTab에는 반드시 높이 지정을 해야 함 
            popup.find('#orgTree').css({height: '100%'});
            popup.reoffset();
        },
        /**
         * @deprecated
         * 1.6.5 결재선지정 UI로 통합되면서 삭제 예정
         */
        addReference : function(rs) {
            var data = this.orgTab.getSelectedData();
            if ( !data.id ) {
                $.goMessage(approvalLang["선택된 대상이 없습니다."]);
                return false;
            }
            var targetEl = $('#addReference');
            var deptType = ( data.type === 'org' ) ? 'true' : 'false';
            if(data && !targetEl.find('li[data-id="'+data.id+'"][data-deptType="'+deptType+'"]').length) {
                targetEl.find('li.creat').before(tplAddMember($.extend(data, { lang : lang  , deptType : deptType })));
                this.trigger('docReferenceSelect');
            } else {
                $.goMessage(approvalLang["이미 선택되었습니다."]);
            }
        },
        
        /**
         * @deprecated
         * 1.6.5 결재선지정 UI로 통합되어 삭제 예정
         */
        receive : function(e) {
            var self = this;
            var popup = $.goPopup({
                "pclass" : "layer_normal",
                "header" : approvalLang['수신처 추가'],
                "modal" : true,
                "width" : 310,
                "contents" : '<form></form><div id="orgtab" style="height:100%"></div>',
                "buttons" : [{
                                'btext' : approvalLang['추가'],
                                'btype' : 'confirm',
                                'autoclose' : false,
                                'callback' : function(rs){
                                    self.addReceive(rs);
                                }
                            },
                            {
                                'btext' : commonLang["닫기"],
                                'btype' : 'cancel'
                            }]
            });
            this.orgTab = $.goOrgTab({
                   elId : "orgtab",
                   css : {
                       'minHeight' : 310,
                       'maxHeight' : 310
                   }
             });
            // TODO: 리팩토링 필요(211행 주석 참조)
            popup.find('#orgTree').css({height: '100%'});
            popup.reoffset();
        },
        
        /**
         * @deprecated 
         * 1.6.5 결재선지정 UI로 통합되어 삭제 예정
         */
        addReceive : function(rs) {
            var data = this.orgTab.getSelectedData();
            if ( !data.id ) {
                $.goMessage(approvalLang["선택된 대상이 없습니다."]);
                return false;
            }
            var targetEl = $('#addReceive');
            var deptType = ( data.type === 'org' ) ? 'true' : 'false';
            if(data && !targetEl.find('li[data-id="'+data.id+'"][data-deptType="'+deptType+'"]').length) {
                targetEl.find('li.creat').before(tplAddMember($.extend(data, { lang : lang  , deptType : deptType })));
                this.trigger('docReceiveSelect');
            } else {
                $.goMessage(approvalLang["이미 선택되었습니다."]);
            }
        },
        
        docOpenSelect: function(e){
        	var flag = $(e.currentTarget).val();
        	this.docInfoModel['isPublic'] = flag == 'true' ? true : false;
            this.trigger('docFolderSelect',true);
            //var openType = $('#openType:checked').val();
            //var targetEl = $('#addFolder').closest('tr');
            //if ( openType == 'true' ) {
            //  targetEl.show();
            //  this.trigger('docFolderSelect',true);
            //} else {
            //  targetEl.hide();
            //  this.trigger('docFolderSelect',false);
            //}
        },
        
        emergencyChange : function(e){
        	var checked = $(e.currentTarget).is(':checked');
        	this.docInfoModel['isEmergency'] =  checked;
        },
        docTypeSelect: function(){
            this.trigger('docTypeSelect');
        },
        securityLevelSelect: function(){
            this.trigger('securityLevelSelect');
        },
        docYearSelect: function(e){
        	this.docInfoModel['docYear'] = $(e.currentTarget).find('option:selected').val();
            this.trigger('docYearSelect');
        },
        docInfoSave: function(){
            this.trigger('docInfoSave');
        },
        docInfoCancel: function(){
            this.trigger('docInfoCancel');
        },
        folderDeleteItem: function(e){
            $(e.currentTarget).parents('li').remove();
            this.trigger('docFolderSelect',true);
        },
        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        },
        /**
         * 문서정보를 업데이트하고 다시 그린다.
         * @param Object docInfoAttrs ApprDocumentModel의 docInfo 속성
         * @since 1.6.5
         * @author Bongsu Kang(kbsbroad@daou.co.kr)
         */
        updateDocInfo: function(docInfoAttrs) {
        	if(_.isObject(docInfoAttrs)) {
        		this.docInfoModel = docInfoAttrs;
        		this.render();
        	}
        }
    });

    return DocInfoView;
});
