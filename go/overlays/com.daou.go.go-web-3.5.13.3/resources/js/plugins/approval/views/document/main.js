define([
        "backbone",
        "app",

        "hgn!approval/templates/document/main",
        "hgn!approval/templates/document/action_document",
        "hgn!approval/templates/document/actcopy",
        "hgn!approval/templates/add_org_member",

        "approval/models/document",
        "approval/models/appr_flow",
        "approval/collections/appr_flows",

        "approval/views/content_top",
        "approval/views/doc_file_download",
        "approval/views/document/toolbar",
        "approval/views/document/document",
        "approval/views/document/apprflow_editor",
        "approval/views/document/apprflow",

        "approval/views/document/doc_receive",
        "approval/views/document/doc_receiver_assign",
        "approval/views/document/doc_reception_dept_assign",
        "approval/views/document/doc_foldertype",
        "approval/views/document/docinfo",
        "approval/views/document/dochistory",
        "approval/views/document/reader_history_list",
        "approval/views/document/reception_document_list",
        "approval/views/document/official_doc_receiver_list",

        "approval/views/document/doc_type_select",
        "approval/views/document/dept_folder",
        "approval/views/document/document_print",
        "approval/views/document/post_regist",
        "approval/views/side",
        "approval/models/document_mail",
        "approval/models/user_appr_config",

        "approval/components/appr_form_integrator",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "email_send_layer",
        "when",

        "formeditor",
        "jquery.inputmask"
    ],
    function (
        Backbone,
        App,

        MainTpl,
        ActDocumentTpl,
        ActCopyTpl,
        tplAddMember,

        ApprDocumentModel,
        ApprFlowModel,
        ApprFlowCollection,

        ContentTopView,
        DocDownloadView,
        ToolbarView,
        DocumentView,
        ApprFlowEditor,
        ApprFlowView,

        DocReceiveView,
        DocReceiverAssignView,
        DocReceptionDeptAssignView,
        DocFolderTypeView,
        DocInfoView,
        DocHistoryView,
        ReaderHistoryListView,
        ReceptionDocumentListView,
        OfficialDocReceiverListView,

        DocTypeSelectView,
        DeptDocFolderView,
        DocumentPrintView,
        PostRegist,
        SideView,
        ApprDocumentMailModel,
        UserApprConfigModel,

        FormIntegrator,
        commonLang,
        approvalLang,
        EmailSendLayer,
        when
    ) {

        //메일 발송 팝업창 사이즈 상수값
        var MAIL_POPUP_WIDTH = 1280;
        var MAIL_POPUP_HEIGHT = 760;

        var DraftModel = Backbone.Model.extend({
            initialize: function (docId) {
                this.docId = docId;
            },
            url: function () {
                var url = ['/api/approval/document', this.docId, 'draft'].join('/');
                return url;
            }
        });

        var DocumentCreateModel = ApprDocumentModel.extend({
            initialize: function (attrs, options) {
                this.options = options || {};

                if (options.formId) {
                    this.formId = options.formId;
                }

                if (options.deptId) {
                    this.deptId = options.deptId;
                }

                if (options.deptFolderId) {
                    this.deptFolderId = options.deptFolderId;
                }

                ApprDocumentModel.prototype.initialize.apply(this, arguments);
            },
            url: function () {
                var param = {formId: this.formId, deptId: this.deptId};
                if ($.isNumeric(this.deptFolderId)) {
                    param.deptFolderId = this.deptFolderId;
                }
                var url = '/api/approval/document/new?' + $.param(param);
                return url;
            },
            getShowUrl: function () {
                var deptId = this.deptId.split("?")[0],
                    formId = this.formId.split("?")[0];

                return "/approval/document/new/" + deptId + "/" + formId;
            },

            getFullShowUrl: function () {
                return window.location.protocol + "//" + window.location.host + GO.contextRoot + "app" + this.getShowUrl();
            }
        }, {
            create: function (formId, deptId, deptFolderId) {
                return new DocumentCreateModel({}, {
                    "formId": formId,
                    "deptId": deptId,
                    "deptFolderId": deptFolderId
                });
            }
        });

        var DocumentReapplyModel = ApprDocumentModel.extend({
            initialize: function (attrs, options) {
                this.options = options || {};
                this.docId = this.options.docId;

                ApprDocumentModel.prototype.initialize.apply(this, arguments);
            },

            url: function () {
                var url = '/api/approval/document/' + this.docId + '/reapply';
                return url;
            },

            getShowUrl: function () {
                var docId = this.docId.split("?")[0];

                return "/approval/document/" + docId + "/reapply";
            },

            getFullShowUrl: function () {
                return window.location.protocol + "//" + window.location.host + GO.contextRoot + "app" + this.getShowUrl();
            }
        }, {
            create: function (docId) {
                return new DocumentReapplyModel({}, {"docId": docId});
            }
        });

        var RefDocumentModel = ApprDocumentModel.extend({
            initialize: function (attrs, options) {
                this.options = options || {};
                this.docId = this.options.docId;
                this.refDocId = this.options.refDocId;

                ApprDocumentModel.prototype.initialize.apply(this, arguments);
            },
            url: function () {
                return ['/api/approval/document', this.docId, 'reference', this.refDocId].join('/');
            },
            getShowUrl: function () {
                return "/approval/document/" + this.refDocId;
            },

            getFullShowUrl: function () {
                return window.location.protocol + "//" + window.location.host + GO.contextRoot + "app" + this.getShowUrl();
            }
        }, {
            create: function (docId, refDocId) {
                return new RefDocumentModel({}, {"docId": docId, "refDocId": refDocId});
            }
        });

        var DocumentViewModel = ApprDocumentModel.extend({
            initialize: function (attrs, options) {
                this.options = options || {};
                this.docId = this.options.docId;
                ApprDocumentModel.prototype.initialize.apply(this, arguments);
            },

            url: function () {
                var url = '/api/approval/document/' + this.docId;
                return url;
            },

            getShowUrl: function () {
                var docId = typeof this.docId === "string" ? this.docId.split("?")[0] : this.docId;

                return "/approval/document/" + docId;
            },

            getFullShowUrl: function () {
                return window.location.protocol + "//" + window.location.host + GO.contextRoot + "app" + this.getShowUrl();
            }
        }, {
            create: function (docId) {
                return new DocumentViewModel({}, {"docId": docId});
            }
        });

        var DeptFolderCopyModel = Backbone.Model.extend({
            url: function () {
                var url = ['/api/approval/deptfolder/' + this.folderId + '/document' + '/add'].join('/');
                return url;
            },
            setFolderId: function (folderId) {
                this.folderId = folderId;
            }
        });

        var DocumentSaveModel = Backbone.Model.extend({
            initialize: function (docId) {
                this.docId = docId;
            },
            url: function () {
                var url = ['/api/approval/document', this.docId].join('/');
                return url;
            }
        });

        var ApprActionModel = Backbone.Model.extend({
            initialize: function (docId) {
                this.docId = docId;
            },
            url: function () {
                var url = ['/api/approval/document', this.docId, 'approval'].join('/');
                return url;
            }
        });

        var DocViewerModel = Backbone.Model.extend({
            initialize: function (docId) {
                this.docId = docId;
            },
            url: function () {
                var url = ['/api/approval/document', this.docId, 'viewer'].join('/');
                return url;
            }
        });

        var DocReceiveModel = Backbone.Model.extend({
            initialize: function (docId, deptId) {
                this.docId = docId;
                this.deptId = deptId;
            },

            /**
             * TODO: chogh1211 - 제거되거나 수정되야 합니다. 문서 완료후 수신자추가할 수 있는 UI를 만들 때 처리하도록 합니다.
             */
            url: function () {
                var url = ['/api/approval/document', this.docId, 'receptionreader', this.deptId].join('/');
                return url;
            }
        });

        var DocFolderTypeModel = Backbone.Model.extend({
            initialize: function (docId) {
                this.docId = docId;
            },
            url: function () {
                var url = ['/api/approval/document', this.docId, 'folder'].join('/');
                return url;
            }
        });

        /**
         * 수신 처리 모델
         */
        var ReceptionSaveModel = Backbone.Model.extend({
            // 접수, 접수취소, 반송, 재접수, 접수취소와반송
            validTypes: ["receive", "cancel", "return", "rereceive", "receptioncancelandreturn"],

            initialize: function (docId, type) {
                if (_.contains(this.validTypes, type)) {
                    this.type = type;
                } else {
                    this.type = "receive";
                }

                this.docId = docId;
            },

            url: function () {
                // 수신 URL path
                var lastPath = "reception";

                switch (this.type) {
                    case "cancel":
                        // 접수취소
                        lastPath = "receptioncancel";
                        break;
                    case "return":
                        // 반송
                        lastPath = "receptionreturn";
                        break;
                    case "rereceive":
                        // 재접수
                        lastPath = "rereception";
                        break;
                    case "receptioncancelandreturn":
                        lastPath = "receptioncancelandreturn";
                        break;
                    default:
                    // reception
                }

                return ['/api/approval/document', this.docId, lastPath].join('/');
            }
        });

        var lang = {
            "결재문서명": approvalLang['결재문서명'],
            "기안자": approvalLang['기안자'],
            "결재자": approvalLang['결재자'],
            "기안의견": approvalLang['기안의견'],
            "결재의견": approvalLang['결재의견'],
            "결재비밀번호": approvalLang['결재비밀번호'],
            "전결": approvalLang['전결'],
            "전결설명": approvalLang['전결설명'],
            "결재옵션": approvalLang['결재옵션'],
            "결재선": approvalLang['결재선'],
            "문서정보": approvalLang['문서정보'],
            "변경이력": approvalLang['변경이력'],
            "공문발송": approvalLang['공문발송'],
            "열람자 추가": approvalLang['열람자 추가'],
            "의견을 작성해 주세요": approvalLang['의견을 작성해 주세요'],
            '목록으로 이동합니다': approvalLang['목록으로 이동합니다'],
            '담당자를 지정해주세요': approvalLang['담당자를 지정해주세요'],
            '담당자가 지정되었습니다': approvalLang['담당자가 지정되었습니다'],
            '담당자를 지정할 수 없습니다': approvalLang['담당자를 지정할 수 없습니다'],
            '다음문서로이동': approvalLang['다음문서로이동'],
            '다음문서로이동설명': approvalLang['다음문서로이동설명'],
            '반려옵션': approvalLang['반려옵션'],
            '반려옵션설명': approvalLang['반려옵션설명'],
            "긴급": approvalLang['긴급'],
            "긴급문서": approvalLang['긴급문서'],
            "긴급문서설명": approvalLang['긴급문서설명'],
            "1인 결재 안내문구": approvalLang['1인 결재 안내문구'],
            "기결재자통과": approvalLang['기결재자통과'],
            "기결재자통과설명": approvalLang['기결재자통과설명'],
            '열람기록': approvalLang['열람기록'],
            '수신': approvalLang['수신'],
            '수신처 지정 필수 메세지': approvalLang['수신처 지정 필수 메세지'],
            '수신처 지정하기': approvalLang['수신처 지정하기'],
            '이전': commonLang['이전'],
            '다음': commonLang['다음'],
            "결재방전결설명": approvalLang['결재방전결설명'],
            "전결참조자추가": approvalLang['전결참조자추가'],
            "반려 결재 의견 입력은 필수입니다": approvalLang['반려 결재 의견 입력은 필수입니다'],
            "반송 결재 의견 입력은 필수입니다": approvalLang['반송 결재 의견 입력은 필수입니다'],
            "반려결재의견": approvalLang['반려결재의견'],
            "반송결재의견": approvalLang['반송결재의견']
        };

        // ajax 중복 실행을 막기위한 플래그
        var __ajaxSending__ = false;
        var MainView = Backbone.View.extend({
            el: '#content',
            initialize: function (options) {
                this.options = options || {};
                this.formId = this.options.formId;
                this.deptId = this.options.deptId;
                this.deptFolderId = GO.util.getQueryParam('deptFolderId');
                this.docId = this.options.docId;
                this.refDocId = this.options.refDocId;
                this.docType = this.options.docType;
                this.type = _.isUndefined(this.options.type) ? "DOCUMENT" : this.options.type;
                this.allowAction = true;
                this.documentInit();
            },

            docInitError: function (msg, title) {
                var self = this;
                var callbackFunc = function () {
                    if (self.options.isPopup) {
                        window.close();
                    } else {
                        self.navigateToBackList();
                    }
                };
                $.goAlert(approvalLang['결재문서를 열람할 수 없습니다.'], msg, null, commonLang['닫기'], callbackFunc);
            },

            showErrorAlert: function (title, msg, callbackFunc) {
                var self = this;
                var defaultCallbackFunc = function () {
                    if (self.options.isPopup) {
                        window.close();
                    } else {
                        self.navigateToBackList();
                    }
                };

                $.goAlert(title, msg, null, commonLang['닫기'],
                    _.isFunction(callbackFunc) ? callbackFunc : defaultCallbackFunc);
            },

            documentInit: function () {
                var self = this;

                this.formIntegrator = new FormIntegrator();

                //메일발송 model 세팅
                this.apprDocumentMailModel = new ApprDocumentMailModel({"docId": this.docId});

                if (this.type == "CREATE") {
                    this.model = DocumentCreateModel.create(this.formId, this.deptId, this.deptFolderId);
                } else if (this.type == "REAPPLY") {
                    this.model = DocumentReapplyModel.create(this.docId);
                } else {
                    if (this.refDocId) {
                        this.model = RefDocumentModel.create(this.docId, this.refDocId);
                    } else {
                        this.model = DocumentViewModel.create(this.docId);
                    }
                }
                this.model.fetch({
                    async: false,
                    success: function (model, result) {
                        self.title = _.escape(_.isUndefined(model.get('document').title)
                            ? model.get('document').formName : model.get('document').title);
                        self.initDocument();
                    },
                    error: function (model, rs) {
                        var msg = commonLang['500 오류페이지 내용'];
                        if ($.parseJSON(rs.responseText).message) {
                            msg = $.parseJSON(rs.responseText).message;
                        }
                        if (rs.status == 400) {
                            self.docInitError(msg);
                        }
                        if (rs.status == 403) {
                            self.docInitError(approvalLang['조회권한없음']);
                        }
                        if (rs.status == 404) {
                            self.docInitError(msg);
                        }
                        if (rs.status == 500) {
                            self.docInitError(msg);
                        }
                        if (rs.status != 400 && rs.status != 403 && rs.status != 404 && rs.status != 500) {
                            self.docInitError(msg);
                        }
                    },
                    reset: true
                });
            },

            initDocument: function () {
                this.docId = this.model.get('document').documentId;
                this.isPublic = this.model.get('docInfo').isPublic;
                this.useHelp = this.model.get('docInfo').useHelp;
                this.formId = this.model.get('docInfo').formId;
                this.docType = this.model.get('document').docType;


                // 양식연동 관련 데이타 저장
                this.formIntegrator.setDocVariables(this.model.get('document').variables);
                this.formIntegrator.setStatus(this.type == "REAPPLY" ? this.type : this.model.get('document').docStatus);

                // 결재선변경시 문서의 결재방에 적용
                var checkIsDeputyActivity = this.checkIsDeputyActivity();

                // 1.6.5 결재 정보 UI가 통합되면서 들어감(강봉수, kbsbroad@daou.co.kr)
                this.listenTo(this.model, "change", this.changeApprFlowAndDocInfo, this);

                this.usePassword = this.model.get('actionCheck').usePassword;

                this.autoSaveTime = this.model.get('userApprSetting').autoSaveTime;
                this.toolbarView = new ToolbarView({
                    type: this.type,
                    toolbarModel: this.model.get('actionCheck'),
                    docStatus: this.model.get('document').docStatus,
                    userId: GO.session().id,
                    drafterId: this.model.get('document').drafterId,
                    isAgreement: this.checkIsAgreement(),
                    isReceptionDocument: this.model.get('document').isReceptionDocument,
                    isDeletedDeptRcvDoc: this.model.get('document').isDeletedDeptRcvDoc,
                    isPublic: this.isPublic,
                    checkIsDeputyActivity: checkIsDeputyActivity,
                    isPopup: this.options.isPopup,
                    useHelp: this.useHelp,
                    formId: this.formId,
                    docId: this.model.get('document').documentId,
                    autoSaveTime: this.autoSaveTime
                });

                this.toolbarView.bind('saved', this.saveDocument, this);
                this.toolbarView.bind('canceled', this.cancelEdit, this);
                this.toolbarView.bind('drafted', this.draftDocument, this);
                this.toolbarView.bind('deleted', this.deleteDocument, this);
                this.toolbarView.bind('tempSaved', this.tempSaveDocument, this);
                this.toolbarView.bind('tempAutoSaved', this.tempAutoSaveDocument, this);
                this.toolbarView.bind('storeAutoSaveTime', this.storeAutoSaveTime, this);
                this.toolbarView.bind('draftCanceled', this.cancelDraft, this);
                this.toolbarView.bind('approved', this.doApprove, this);
                this.toolbarView.bind('holded', this.doHold, this);
                this.toolbarView.bind('returned', this.doReturn, this);
                this.toolbarView.bind('agreed', this.doAgree, this);
                this.toolbarView.bind('disagreed', this.doDisagree, this);
                this.toolbarView.bind('checked', this.doCheck, this);
                this.toolbarView.bind('inspected', this.doInspection, this);
                this.toolbarView.bind('actAdvAppr', this.doAdvAppr, this);
                this.toolbarView.bind('actWithdrawal', this.actWithdrawal, this);
                this.toolbarView.bind('actDraftWithdrawal', this.actDraftWithdrawal, this);
                this.toolbarView.bind('actDraftWithdrawalInprogress', this.actDraftWithdrawalInprogress, this);
                this.toolbarView.bind('actDraftWithdrawalDraft', this.actDraftWithdrawalDraft, this);
                this.toolbarView.bind('actDraftWithdrawalCancelDraft', this.actDraftWithdrawalCancelDraft, this);
                this.toolbarView.bind('actReceive', this.actReceive, this);
                this.toolbarView.bind('actRereceive', this.actRereceive, this);
                this.toolbarView.bind('reassignReceiver', this.reassignReceiver, this);
                this.toolbarView.bind('cancelReception', this.cancelReception, this);
                this.toolbarView.bind('returnReception', this.returnReception, this);
                this.toolbarView.bind('deptFolderCopy', this.deptFolderCopy, this);
                this.toolbarView.bind('editApprFlow', this.editApprFlow, this);
                this.toolbarView.bind('edit', this.editDocument, this);
                this.toolbarView.bind('actPostCheck', this.actPostCheck, this);
                this.toolbarView.bind('actPostApproval', this.actPostApproval, this);
                this.toolbarView.bind('actAddFolder', this.actAddFolder, this);
                this.toolbarView.bind('generateActCopy', this.generateActCopy, this);
                this.toolbarView.bind('docPrint', this.docPrint, this);
                this.toolbarView.bind('downloadDocument', this.downloadDocument, this);
                this.toolbarView.bind('actReapply', this.reapplyDocument, this);
                this.toolbarView.bind('actList', this.navigateToBackList, this);
                this.toolbarView.bind('showSendMailLayer', this.showSendMailLayer, this);
                this.toolbarView.bind('showPostRegistLayer', this.showPostRegistLayer, this);
                this.toolbarView.bind('showPopup', this.showPopup, this);
                this.toolbarView.bind('documentPreview', this.documentPreview, this);
                this.toolbarView.bind('cancelAndReturnReception', this.cancelAndReturnReception, this);
                this.toolbarView.bind('reassignDept', this.reassignDept, this);

                this.documentView = new DocumentView({
                    type: this.type,
                    docId: this.model.get('document').documentId,
                    model: this.model.get('document'),
                    infoData: this.model.get("docInfo"),
                    actionModel: this.model.get('actionCheck'),
                    formIntegrator: this.formIntegrator,
                    userApprSettingModel: this.model.get('userApprSetting'),
                    isPopup: this.options.isPopup,
                    isPreview: this.options.isPreview,
                    originalDocId: this.model.docId,
                    refDocId: this.model.refDocId
                });

                this.apprFlowView = new ApprFlowView({
                    type: this.type,
                    docId: this.model.get('document').documentId,
                    model: new ApprFlowModel(this.model.get('apprFlow'))
                });

                this.isReaderExist = this.model.get("docInfo").docReadingReaders.length > 0 ? true : false;
                this.docInfoView = new DocInfoView({
                    type: this.type,
                    docId: this.model.get('document').documentId,
                    docStatus: this.model.get('document').docStatus,
                    docInfoModel: this.model.get('docInfo'),
                    actionModel: this.model.get('actionCheck'),
                    isComplete: this.model.get('document').docStatus == "COMPLETE" ? true : false,
                    isActivityUser: this.model.get('actionCheck').isActivityUser,
                    isReader: this.model.get('actionCheck').isReader,
                    isReceptionDocument: this.model.get('document')['isReceptionDocument'],
                    isPopup: this.options.isPopup
                });
                this.docInfoView.bind('docTypeSelect', this.docTypeSelect, this);
                this.docInfoView.bind('docFolderSelect', this.docFolderSelect, this);
                this.docInfoView.bind('securityLevelSelect', this.securityLevelSelect, this);
                this.docInfoView.bind('docYearSelect', this.docYearSelect, this);
                this.docInfoView.bind('docReferenceSelect', this.docReferenceSelect, this);
                this.docInfoView.bind('docReceiveSelect', this.docReceiveSelect, this);
                this.docInfoView.bind('readingDeleteItem', this.readingDeleteItem, this);
                this.docInfoView.bind('showReadingOrgSlider', this.showReadingOrgSlider, this);
                this.docInfoView.bind('showReceptionOrgSlider', this.showReceptionOrgSlider, this);
                this.docInfoView.bind('saveDocReaderAndReception', this.saveDocReaderAndReception, this);
                this.docInfoView.bind('tempsavechangedept', this.tempSaveChangeDept, this);

                this.docHistoryView = new DocHistoryView({
                    type: this.type,
                    model: this.model
                });
                this.docHistoryView.bind('showApprChangeLog', this.showApprChangeLog, this);

                // 열람 목록
                this.readHistoryView = new ReaderHistoryListView({
                    docId: this.model.get('document').documentId,
                    collection: this.model.get('readingHistory')
                });

                // 수신 목록
                this.receptionView = new ReceptionDocumentListView({
                    docId: this.model.get('document').documentId,
                    collection: this.model.get('receptionList')
                });

                this.officialDocReceiverView = new OfficialDocReceiverListView({
                    dataList: this.model.get('docInfo').officialVersions,
                    docStatus: this.model.get('document').docStatus,
                    isAdmin: false
                });

                this.contentTop = ContentTopView.getInstance();

                var pageTitle = ['<span class="txt single_tit" title="', this.title, '">', this.title, '</span>'];
                if (this.type == "DOCUMENT") {
                    pageTitle.push('<span class="meta">');
                    pageTitle.push('<span class="from">&nbsp;in ' + this.model.get('document').formName + '</span>');
                    pageTitle.push('</span>');
                }

                //if(this.model.get('document').docStatus == "CREATE" || this.model.get('document').docStatus == "TEMPSAVE"){
                if (this.model.get('document').docStatus == "CREATE" || this.model.get('document').docStatus == "TEMPSAVE" || this.model.get('document').docStatus == "POPUP") {
                    pageTitle.push('<span class="meta">');
                    pageTitle.push('<span id="processMessageWrap" class="num" style="display:none;">');
                    pageTitle.push('<strong id="processMessageContent"></strong>');
                    pageTitle.push('</span>');
                    pageTitle.push('</span>');
                }

                this.contentTop.setTitle(pageTitle.join(''));

                // 임시조치: 패키지명이 docfolder(전사문서함)일 경우는 아래 조건을 실행하면 안됨
                // 아래 조건은 전자결재의 사이드를 그리는 부분...(강봉수)
                if (GO.router.getPackageName() === 'approval' && this.docId !== sessionStorage.getItem('list-history-doc-id')) {

                    // 참조/열람 문서함의 경우 문서 열람시 사이드의 열람 수를 갱신
                    if (sessionStorage.getItem('list-history-baseUrl') == "approval/todoviewer/all") {
                        SideView.reload();
                    }
                    SideView.apprSelectSideMenu(sessionStorage.getItem('list-history-baseUrl'));
                }
            },

            checkIsAgreement: function () {
                var userActivitytype = null;
                var activityGroups = this.model.get('apprFlow').activityGroups;
                for (var i = 0; i < activityGroups.length; i++) {
                    var activities = activityGroups[i].activities;
                    for (var j = 0; j < activities.length; j++) {
                        if (activities[j].actorId == GO.session().id) {
                            userActivitytype = activities[j].type;
                        }
                    }
                }
                if (userActivitytype == "AGREEMENT") {
                    return true;
                } else {
                    return false;
                }
            },

            checkIsDeputyActivity: function () {
                var activityGroups = this.model.get('apprFlow').activityGroups;
                for (var i = 0; i < activityGroups.length; i++) {
                    var activities = activityGroups[i].activities;
                    for (var j = 0; j < activities.length; j++) {
                        if (activities[j].actorId == GO.session().id && activities[j].deputyActivity) {
                            return false;
                        }
                    }
                }
                return true;
            },

            events: {
                'click .tab_nav > li': 'selectTab',
                'click #prev': '_agoSlide',
                'click #next': '_nxtSlide'
            },

            render: function () {
                this.setSlideConfig();
                this.allowAction = true;
                var documentModel = this.model.get('document');
                if (documentModel == null) {
                    return;
                }

                var action = this.model.get("actionCheck");

                if ((!action.isMatchDeptment) && (documentModel.docStatus == "TEMPSAVE")) {
                    this.showErrorAlert(approvalLang['기안자와 해당 문서의 기안 부서 정보가 일치하지 않아 기안(접수)이 불가능합니다'],
                        approvalLang['결재문서를 새로 작성해 주세요.'], (function () {
                        }));
                }

                if (action.isActCopy) {
                    var ActCopyDocument = ActCopyTpl({
                        lang: {
                            '발송': approvalLang['발송'],
                            '접수': approvalLang['접수'],
                            '취소': commonLang['취소'],
                            '수신자 추가': approvalLang['수신자 추가'],
                            '목록': commonLang['목록'],
                            '인쇄': commonLang['인쇄'],
                            '수신처': approvalLang['수신처'],
                            '수신처 추가': approvalLang['수신처 추가'],
                            '문서정보': approvalLang['문서정보'],
                            '시행문 발송': approvalLang['시행문 발송'],
                            '발신자': approvalLang['발신자'],
                            '시행문 제목': approvalLang['시행문 제목'],
                            '수신처를 지정해주세요': approvalLang['수신처를 지정해주세요'],
                            '문서열람': approvalLang['문서열람'],
                            '열람자 추가': approvalLang['열람자 추가'],
                            '문서열람 저장': approvalLang['문서열람 저장'],
                            '문서정보 저장': approvalLang['문서정보 저장']
                        },
                        dataset: documentModel,
                        infoData: this.model.get("docInfo"),
                        action: action,
                        isCompleteAddReceive: this.toolbarView.getCompleteAddReceive(),
                        isActivityUser: this.model.get('actionCheck').isActivityUser,
                        sender: this.getSender(this.model.get("apprFlow").activityGroups)
                    });

                    this.$el.html(ActCopyDocument);
                    this.$el.on("click", "#act_receive", $.proxy(this.actReceive, this));
                    this.$el.on("click", "#reassign_receiver", $.proxy(this.reassignReceiver, this));
                    this.$el.on("click", "#cancelReception", $.proxy(this.cancelReception, this));
                    this.$el.on("click", "#returnReception", $.proxy(this.returnReception, this));

                    this.$el.on("click", "#reading", $.proxy(this.showReadingOrgSlider, this));
                    this.$el.on("click", "#reception", $.proxy(this.showReceptionOrgSlider, this));

                    this.$el.on("click", ".btnPrint", $.proxy(this.docPrint, this));
                    this.$el.on("click", ".btnList", $.proxy(this.navigateToBackList, this));

                    this.contentTop.setTitle(documentModel.title);
                } else {
                    this.$el.html(MainTpl({
                        lang: lang
                    }));

                    this.assign(this.toolbarView, 'div.tool_bar');
                    this.assign(this.documentView, 'div.approval_type');
                    this.append(this.apprFlowView, 'div.doc-meta-container');
                    this.append(this.docInfoView, 'div.doc-meta-container');
                    this.append(this.docHistoryView, 'div.doc-meta-container');
                    this.append(this.readHistoryView, 'div.doc-meta-container');
                    this.append(this.receptionView, 'div.doc-meta-container');
                    this.append(this.officialDocReceiverView, 'div.doc-meta-container');

                    if (this.type == 'CREATE' || this.type == 'REAPPLY' || this.type == 'INTEGRATION') {
                        $('.tab_nav > li').removeClass('on');
                        $(this.el).find('li#tab_apprflow').addClass('on');
                        $(this.el).find('li#tab_docinfo').addClass('last');
                        $(this.el).find('li#tab_dochistory').hide();
                        $(this.el).find('li#tab_readerhistory').hide();
                        $(this.el).find('li#tab_receptiondocument').hide();
                        $(this.el).find('li#tab_officialdocreceiver').hide();
                        this.displaySlideNavStyle();

                        this.showApprFlow();
                        this.documentView.setNewFormMode();
                        this.apprFlowView.makeApprFlow(this.model.get('apprFlow').activityGroups);
                        this.setDocNum('');
                        this.docReceiveSelect();
                        this.docReferenceSelect();
                        this.docFolderSelect(this.isPublic);
                    } else {
                        this.showApprFlow();
                        $('.tab_nav > li').removeClass('on');
                        $('#tab_apprflow').addClass('on');
                    }
                    //자동결재선을 사용할경우
                    if (this.useAutoApprFlow()) {
                        this.bindAutoFlowComponentEvent();
                        if (this.type == 'CREATE' || this.type == 'INTEGRATION' || (this.type == 'DOCUMENT' && documentModel.docStatus == 'CREATE')) {
                            this.reSetApprFlowView();
                        } else if (documentModel.docStatus == 'TEMPSAVE' && documentModel.docType == 'DRAFT' && GO.util.store.get('autoSetAppr')) {
                            this.reSetApprFlowView();
                            GO.util.store.set("autoSetAppr", null, {type: "session"});
                            this.tempSaveReload();
                        }
                    }
                    var setData = {
                        preserveDuration: $("#docYear option:selected").text() || this.showPreserveYears(this.model.get('docInfo').docYear),
                        securityLevel: $("#infoSecurityLevel option:selected").text() || this.model.get('docInfo').securityLevelName
                    };
                    this.documentView.setApprovalData(setData);

                    if (documentModel.isDeletedDeptRcvDoc && documentModel.docStatus == 'RECEIVED') {
                        $.goAlert(approvalLang['문서 수신 부서가 삭제 안내'], "", "", commonLang['닫기'], "");
                    }
                }

                if (!this.options.isPopup) {
                    this.contentTop.render();
                    this.$el.find('header.content_top').replaceWith(this.contentTop.el);
                    // 전사 문서함 관련 설정 처리
                    if (!action.companyDocFolderUseFlag) {
                        $("#companyDocFolderUse").hide();
                        $("#act_addFolder").hide();
                    }
                    ;
                } else {
                    //미리보기
                    if (this.options.isPreview) {
                        var openerView = window.opener.$('#document_content').data('instance');
                        this.$el.find('header.content_top').remove();
                        var toolbarTemplete =
                            '<header id="toolbar" class="header_print">' +
                            '	<h1>' +
                            commonLang['미리보기'] +
                            '		<span class="btn_wrap">' +
                            '			<span class="btn_minor_s" id="printDoc" title="' + commonLang['인쇄'] + '">' +
                            '				<span class="ic_print"></span><span class="txt">' + commonLang['인쇄'] + '</span>' +
                            '			</span>' +
                            '		</span>' +
                            '	</h1>' +
                            '</header>';
                        this.$el.prepend(toolbarTemplete);
                        this.$('#printDoc').on('click', $.proxy(this.printDoc, this));
                        //작성중인 문서의 모델에서 본문을 가져온다.
                        var self = this;
                        $.ajax({
                            type: "POST",
                            url: "/api/approval/document/contentpreview/preview",
                            data: {'docBodyContent': openerView.getDocBodyContentData()},
                            success: function (result) {
                                self.documentView.setPreviewMode(result.data.docBodyContent);
                            }
                        });

                        //불필요 항목 제거.
                        this.$el.find('section.aside_wrapper').remove();
                        this.$el.find('#attachView').remove();
                        this.$el.find('#editView').remove();
                        //닫기 버튼 추가
                        var footerTemplate =
                            '<footer class="btn_layer_wrap">' +
                            '	<span class="btn_minor_s" data-role="button" onclick="window.close();">' +
                            '		<span class="txt">' + commonLang['닫기'] + '</span>' +
                            '	</span>' +
                            '</footer>';
                        this.$el.find('section.tool_bar').replaceWith(footerTemplate);

                    } else {
                        //this.$el.find('header.content_top').remove();

                        //결재 팝업 방식에서 상단에 자동 저장 표현
                        this.contentTop.render();
                        this.$el.find('header.content_top').replaceWith(this.contentTop.el);
                        this.$el.find('header.content_top .combine_search').remove();

                        if (GO.router.getUrl().indexOf('preview/reference') > 0) { // 관련 문서 popup 보기 일때
                            this.$el.find('div.tool_bar div.critical').remove();
                            //GO-26902 관련 문서에 대해 실제 열람 권한이 없을 경우, 인쇄가 불가능
                            if (!action.isDocReadAuthority) {
                                this.$el.find('.btn_print').remove();
                            }
                        }
                    }
                }
                GO.util.store.set("autoSetAppr", null, {type: "session"});

                // GO-26484 문서 다운로드 버튼 생성 및 이벤트 중복 생성 방지 처리
                new DocDownloadView({
                    getDownloadURL: "api/approval/document/" + this.docId + "/download",
                    appendTarget: this.$el.find('.tool_bar > div.critical'),
                    showDownloadBtn: this.toolbarView.getShowDownloadBtn() || false,
                    hideWhenDeletedDeptRcvDoc: this.toolbarView.getHideWhenDeletedDeptRcvDoc() || false
                }).render();
            },

            setSlideConfig: function () {
                this.slideConfig = {
                    slideStop: 77,
                    slidePage: 1,
                    shownBlockCount: 3,
                    HProc: true
                };
            },

            _agoSlide: function () {
                var self = this;
                if (self.slideConfig.HProc && !self.$('#prev').hasClass('tab_disabled')) {
                    if (self.slideConfig.slidePage > 1) {
                        self.slideConfig.slidePage = self.slideConfig.slidePage - 1;
                        HProc = false;
                        $("#slideLayer").animate({"left": "-" + String((self.slideConfig.slidePage - 1) * self.slideConfig.slideStop) + "px"}, 250, function () {
                            self.slideConfig.HProc = true;
                            self.displaySlideNavStyle();
                        });
                    }
                }
            },

            _nxtSlide: function () {
                var self = this;
                if (self.slideConfig.HProc && !self.$('#next').hasClass('tab_disabled')) {
                    if (self.slideConfig.slidePage < ($('#slideLayer li:visible').length - (self.slideConfig.shownBlockCount - 1))) {
                        self.slideConfig.slidePage = self.slideConfig.slidePage + 1;
                        HProc = false;
                        $("#slideLayer").animate({"left": "-" + String((self.slideConfig.slidePage - 1) * self.slideConfig.slideStop) + "px"}, 250, function () {
                            self.slideConfig.HProc = true;
                            self.displaySlideNavStyle();
                        });
                    }
                }
            },

            displaySlideNavStyle: function () {
                var self = this;
                if ($('#slideLayer li:visible').length > 3) {
                    this.$('#prev').removeClass('tab_disabled');
                    this.$('#next').removeClass('tab_disabled');
                    if (self.slideConfig.slidePage == 1) {
                        this.$('#prev').addClass('tab_disabled');
                    } else if (self.slideConfig.slidePage == ($('#slideLayer li:visible').length - (self.slideConfig.shownBlockCount - 1))) {
                        this.$('#next').addClass('tab_disabled');
                    }
                } else {
                    this.$('#prev').addClass('tab_disabled');
                    this.$('#next').addClass('tab_disabled');
                }
            },

            printDoc: function () {
                GO.util.print(this.$el);
            },

            /*
         * 이 결재그룹이 자동결재선을 사용하는지에 대한 여부
         */
            useAutoApprFlow: function () {
                return this.model.get('useAutoApprFlow') && (this.type == 'REAPPLY' || this.type == 'CREATE' || this.model.get('document').docStatus == "TEMPSAVE" || this.type == 'INTEGRATION' || (this.type == 'DOCUMENT' && this.model.get('document').docStatus == 'CREATE')); // 기안 or 임시저장  이면서 자동결재를 사용할 경우
            },

            /*
         * apprflow를 자동결재선에 따라 바꿔준다.
         */
            reSetApprFlowView: function () {
                if (this.options.isPreview) {
                    return;
                }
                var autoApprFlowModel = this.getTargetAutoApprFlowModel();
                if (!autoApprFlowModel) {
                    this.appliedAutoApprErrorMessage();
                    return;
                }
                var firstAutoApprActivityGroup = _.first(autoApprFlowModel.get('activityGroups')); //자동결재선은 항상 한개의 그룹으로만 내려옴.
                if (!firstAutoApprActivityGroup) {
                    this.appliedAutoApprErrorMessage();
                    return;
                }
                //activity에 underAmount나 moreAmount가 있으면 금액을 사용하는것으로 판단한다.
                var useApprLineRuleAmount = false;
                _.each(firstAutoApprActivityGroup.activities, function (activity) {
                    if (!_.isUndefined(activity.moreAmount) || !_.isUndefined(activity.underAmount)) {
                        useApprLineRuleAmount = activity.type == "DRAFT" ? false : true;
                    }
                }, this);
                
                if (firstAutoApprActivityGroup.activities.length > 0) {
                    var hasDupleDraftActivities = this.hasDupleDraftActivities(firstAutoApprActivityGroup);
                    firstAutoApprActivityGroup = this.getAvailableActivities(firstAutoApprActivityGroup, useApprLineRuleAmount);
                    var requireArbitaryDesision = firstAutoApprActivityGroup['requireArbitaryDesision']; //차상위 결재자 사용여부.
                    if (useApprLineRuleAmount) {
                        autoApprFlowModel.set('activityGroups', [this.removeDupleActivityGroup(this.getActivitiesByAmount(firstAutoApprActivityGroup, requireArbitaryDesision, hasDupleDraftActivities))]);
                    } else {
                        autoApprFlowModel.set('activityGroups', [this.removeDupleActivityGroup(firstAutoApprActivityGroup)]);
                    }
                }

                var originalApprFlow = this.model.get('apprFlow'); //원본 결재선
                var originalActivityGroups = originalApprFlow.activityGroups;

                var useApprLineRuleIndex = _.findIndex(originalActivityGroups, function (group) {
                    return group['useApprLineRule'];
                });

                originalActivityGroups[useApprLineRuleIndex] = _.first(autoApprFlowModel.get('activityGroups')); //자동결재선의 첫번째 activitiyGroups를 원본 결재선의 첫번째 activityGroup으로 셋팅해준다.

                this.model.set('apprFlow', originalApprFlow);
                this.apprFlowView.remove();
                this.apprFlowView = new ApprFlowView({
                    type: this.type,
                    docId: this.model.get('document').documentId,
                    model: new ApprFlowModel(this.model.get('apprFlow'))
                });
                this.append(this.apprFlowView, 'div.doc-meta-container');
                this.changeActivityGroups(this.model.get('apprFlow').activityGroups);
            },


            hasAutoFlowOptionComponent: function () {
                return this.documentView.$el.find('[name="apprLineRuleOption"]').length > 0;
            },

            hasAutoFlowAmountComponent: function () {
                return this.documentView.$el.find('[name="apprLineRuleAmount"]').length > 0;
            },
            /* 자동 결재선을 사용할때 기안자가 기안외에 상위 결재라인에도 중복으로 위치하고 있다면
       * 기안자 이후의 결재자를 activitiy의 대상으로 삼는다.(기안자가 결재 activity에 속해 있을때 본인보다 직급이 낮은 사람한테 결재를 받을 이유는 없다.)
       * 하지만 그러한 경우가 아니라면 모든 activity의 결재를 받아야 한다. 또한 중복체크를 하여 제거한다.
       * 중복은 2가지를 체크하는데 기안자가 중복인 경우(hasDupleDraftActivities)와 결재자가 중복(removeDupleActivityGroup)인 경우가 처리하는 방식이 틀리다.
       */
            getAvailableActivities: function (firstAutoApprActivityGroup, useApprLineRuleAmount) {
                var apprActivityGroup = _.clone(firstAutoApprActivityGroup);
                var draftedUserId = _.first(apprActivityGroup.activities)['userId'];
                var isAvailableActivities = [];
                var hasDupleDraftActivities = this.hasDupleDraftActivities(apprActivityGroup);
                if (hasDupleDraftActivities) { //기안자가 결재선에 중복으로 있는경우.
                    var startActivityIndex = 0;
                    _.each(apprActivityGroup.activities, function (activity, idx) {
                        if (activity.userId == draftedUserId) {
                            startActivityIndex = idx;
                        }
                    });
                    var firstActivity = apprActivityGroup.activities.slice(0, 1);
                    var availableActivities;
                    availableActivities = apprActivityGroup.activities.slice(startActivityIndex + 1);
                    if (useApprLineRuleAmount) {
                        availableActivities = apprActivityGroup.activities.slice(startActivityIndex); //금액을 사용할땐 본인을 포함.
                    } else {
                        availableActivities = apprActivityGroup.activities.slice(startActivityIndex + 1);
                    }
                    apprActivityGroup.activities = firstActivity.concat(availableActivities);
                }
                return apprActivityGroup;
            },
    
            /**
             * apprActivityGroup 를 인자로 받고 해당 activities 기안자를 지외한 에 중복 유저를 제거한다.
             */
            removeDupleActivityGroup: function (apprActivityGroup) {
                var draftedUserId = this.model.get('document').drafterId;
                var activities = apprActivityGroup.activities;
                var copiedActivities = [];

                _.each(activities, function (activity, index) {
                    if (activity.userId == draftedUserId) {
                        copiedActivities.push(activity);
                    } else if (!_.findWhere(activities.slice(index + 1), {userId: activity.userId})) { //중복이 없으면
                        copiedActivities.push(activity);
                    }
                }, this);
                apprActivityGroup.activities = copiedActivities;
                return apprActivityGroup;
            },

            /*
         * activity에 기안자가 중복으로 들어가있는지 확인한다.(api에러 상황은 아님, 자동결재 셋팅에 따라 중복으로 내려올수 있음.)
         */
            hasDupleDraftActivities: function (apprActivityGroup) {
                var draftedUserId = _.first(apprActivityGroup.activities)['userId'];
                return _.where(apprActivityGroup.activities, {userId: draftedUserId}).length > 1;
            },

            /*
         * 자동결재 폼 컴포넌트(현재  select(복수), radio(단일), input text(통화) 가 있음.)에서 값을 읽어 적용할 자동결재 그룹을 찾는다.(autoApprFlows중 하나)
         */
            getTargetAutoApprFlowModel: function () {
                var autoFlowModel = new ApprFlowModel(this.model.get('autoApprFlow'));
                var autoFlows = new ApprFlowCollection(autoFlowModel.get('autoApprFlows'));
                var apprLineRuleOptionEl = this.documentView.$el.find('[name="apprLineRuleOption"]');
                var toSelectGroup;
                var optionEl;
                var flow;
                var checkedIndex = 0;

                var selectedOption;
                if (!this.hasAutoFlowOptionComponent()) {
                    checkedIndex = 0;
                } else {
                    if ('select' == apprLineRuleOptionEl.prop("tagName").toLowerCase()) {
                        selectedOption = apprLineRuleOptionEl.find('option:selected');
                        checkedIndex = apprLineRuleOptionEl.find('option').index(selectedOption);
                    } else if ('radio' == apprLineRuleOptionEl.eq(0).prop("type").toLowerCase()) {
                        selectedOption = this.documentView.$el.find('[name="apprLineRuleOption"]:checked');
                        checkedIndex = apprLineRuleOptionEl.index(selectedOption);
                    }
                }

                return autoFlows.at(checkedIndex);
            },

            /*
         * 자동결재선 컴포넌트에 이벤트를 걸어줌. 단일이나 복수 선택에는 항상 change이벤트를 걸고 결재금액 컴포넌트는 금액을 사용할 경우에만 이벤트를 걸어준다.
         */
            bindAutoFlowComponentEvent: function () {
                if (this.options.isPreview) {
                    return;
                }
                if (this.hasAutoFlowOptionComponent()) {
                    // GO-40659 data-dsl*="cSel 의 경우 selectval 을 세팅해주는 이벤트가 go-formparse 에 등록이 되서
                    // 이벤트를 릴리즈해주면 안된다.
                    this.documentView.$el.find('[name="apprLineRuleOption"]').not('[data-dsl*="cSel"]').off('change');
                    this.documentView.$el.find('[name="apprLineRuleOption"]').on('change', _.bind(this.reSetApprFlowView, this));
                }

                var autoApprFlowModel = this.getTargetAutoApprFlowModel();
                var autoApprActivityGroup = _.first(autoApprFlowModel.get('activityGroups')); //자동결재선은 항상 한개의 그룹으로만 내려옴.
                if (!autoApprActivityGroup) {
                    this.appliedAutoApprErrorMessage();
                    return;
                }
                //activity에 totalAmount가 있으면 금액을 사용하는것으로 판단한다.
                var useApprLineRuleAmount = false;
                _.each(autoApprActivityGroup.activities, function (activity) {
                    if (!_.isUndefined(activity.moreAmount) || !_.isUndefined(activity.underAmount)) {
                        useApprLineRuleAmount = activity.type == "DRAFT" ? false : true;
                    }
                });

                if (useApprLineRuleAmount && this.hasAutoFlowAmountComponent()) {
                    this.documentView.$el.find('[name="apprLineRuleAmount"]').off('change');
                    this.documentView.$el.find('[name="apprLineRuleAmount"]').on('change', _.bind(this.reSetApprFlowView, this));
                }
            },

            /*
         * 금액에 따라 activities를 바꿔준다.
         *
         */
            getActivitiesByAmount: function (activityGroup, requireArbitaryDesision, hasDupleDraftActivities) {
                var self = this;

                var resultActivityGroup = _.clone(activityGroup);
                var resultActivities = [];
                var apprLineRuleAmountEl = this.documentView.$el.find('[name="apprLineRuleAmount"]');
                var isArbtDecision = true; //전결권
                var drafterNextActivity = null; //차상위 결재자

                if (self.hasAutoFlowAmountComponent()) {
                    var amount = parseFloat(apprLineRuleAmountEl.inputmask('unmaskedvalue')) || 0;

                    //activities의 순서는 이미 정렬되어 있으므로, 별도 정렬 필요 X
                    _.each(resultActivityGroup.activities, function (activity) {
                        var moreAmount = activity.moreAmount != null ? activity.moreAmount : null;
                        var underAmount = activity.underAmount != null ? activity.underAmount : null;

                        //차상위 결재자 설정
                        if (activity.type != "DRAFT" && !drafterNextActivity) {
                            drafterNextActivity = activity;
                        }

                        //금액 조건에 해당하고 기안자 일 경우 결재선에 추가, UNDER는 미만 MORE는 이상
                        if (amount >= moreAmount && amount < underAmount) {
                            resultActivities.push(activity);
                            isArbtDecision = false;
                        } else if (moreAmount != null && amount >= moreAmount && underAmount == null) {
                            resultActivities.push(activity);
                            isArbtDecision = false;
                        } else if (activity.type == "DRAFT") {
                            resultActivities.push(activity);
                        }
                    });
                }

                //금액 차상위 결재 옵션이 켜져있고 기안자가 전결권자인 경우, 차상위 결재자 지정
                if (resultActivityGroup.requireArbitaryDesision && isArbtDecision && drafterNextActivity != null) {
                    resultActivities.push(drafterNextActivity);
                }

                resultActivityGroup.activities = resultActivities;
                return resultActivityGroup;
            },

            showPreserveYears: function (year) {
                return (year == 0) ? approvalLang['영구'] : year + approvalLang['년']
            },

            showReadingOrgSlider: function (e) {
                var self = this;
                return $.goOrgSlide({
                    header: approvalLang["열람자 선택"],
                    type: 'list',
                    contextRoot: GO.contextRoot,
                    callback: self.addReading,
                    multiCompanyVisible: self.model.get('actionCheck').multiCompanySupporting
                });
            },

            showReceptionOrgSlider: function (e) {
                var self = this;
                return $.goOrgSlide({
                    header: approvalLang["수신자 선택"],
                    type: 'list',
                    contextRoot: GO.contextRoot,
                    callback: self.addReception
                });
            },

            addReading: function (data) {
                var targetEl = $('#addReading');
                if (data && !targetEl.find('li[data-id="' + data.id + '"]').length) {
                    targetEl.find('li.creat').before(tplAddMember($.extend(data, {lang: lang})));
                } else {
                    $.goMessage(approvalLang["이미 선택되었습니다."]);
                }
            },

            addReception: function (data) {
                var targetEl = $('#addReceive');
                if (data && !targetEl.find('li[data-id="' + data.id + '"]').length) {
                    targetEl.find('li.creat').before(tplAddMember($.extend(data, {lang: lang})));
                } else {
                    $.goMessage(approvalLang["이미 선택되었습니다."]);
                }
            },

            readingDeleteItem: function (e) {
                $(e.currentTarget).parents('li').remove();
            },

            getSender: function (model) {
                var sender = [];

                $.each(model, function (k, v) {
                    $.each(v.activities, function (k, v) {
                        if (v.type == "DRAFT") {
                            sender.push({
                                deptId: v.deptId,
                                deptName: v.deptName,
                                userId: v.userId,
                                userName: v.userName,
                                userPosition: v.userPosition
                            });
                        }
                    });
                });

                return sender;
            },

            generateActCopy: function () {
                this.documentView.actCopy();
            },

            // side의 탭 선택시
            selectTab: function (e) {
                $('.tab_nav > li').removeClass('on');
                $(e.currentTarget).addClass('on');

                switch ($(e.currentTarget).attr('id')) {
                    case 'tab_apprflow':
                        this.showApprFlow();
                        break;
                    case 'tab_docinfo':
                        this.showDocInfo();
                        break;
                    case 'tab_dochistory':
                        this.showDocHistory();
                        break;
                    case 'tab_readerhistory':
                        this.showReaderHistory();
                        break;
                    case 'tab_receptiondocument':
                        this.showReceptionDocument();
                        break;
                    case 'tab_officialdocreceiver':
                        this.showOfficialDocReceiver();
                        break;
                }
            },

            allTabHide: function () {
                $(this.apprFlowView.el).hide();
                $(this.docInfoView.el).hide();
                $(this.docHistoryView.el).hide();
                $(this.readHistoryView.el).hide();
                $(this.receptionView.el).hide();
                $(this.officialDocReceiverView.el).hide();
            },

            showApprFlow: function () {
                this.allTabHide();
                $(this.apprFlowView.el).show();
            },

            showDocInfo: function () {
                this.allTabHide();
                $(this.docInfoView.el).show();
            },

            showDocHistory: function () {
                this.allTabHide();
                $(this.docHistoryView.el).show();
            },
            showReaderHistory: function () {
                this.allTabHide();
                $(this.readHistoryView.el).show();
            },
            showReceptionDocument: function () {
                this.allTabHide();
                $(this.receptionView.el).show();
            },
            showOfficialDocReceiver: function () {
                this.allTabHide();
                $(this.officialDocReceiverView.el).show();
            },

            /**
             * 결재선지정 UI에서 결재선과 문서정보(참조자/수신자/열람자/공문서수신처)가 변경되었을 경우 호출되는 함수
             */
            changeApprFlowAndDocInfo: function () {
                /**
                 * TODO
                 * 상태를 관리하는 데이터들이 온통 view에 혼재해 있다.
                 * 일괄 정리해서 하나의 모델로 모두 모아라. 뭘 하나 변경하려 해도 살펴봐야 하는 곳들이 참 많다.
                 */
                var self = this,
                    apprFlow = this.model.get('apprFlow'),
                    isReception = this.model.isReceptionDocument();

                // 요청 중이면 중복 실행하지 않는다.
                if (__ajaxSending__) return;
                if (this.model.availableUpdateDocMetaInfo(this.type)) {
                    //결재선을 변경할때 동시에!! 다른 사용자가 결재선을 변경했을 경우 대비코드
                    if (!_.isUndefined(this.model.get('document').apprFlowVersionId)) {
                        apprFlow['apprFlowVersionId'] = this.model.get('document').apprFlowVersionId;
                    }

                    this.model.Request.updateDocMetainfo(null, {
                        beforeSend: function () {
                            __ajaxSending__ = true;
                            //GO-17463 임시저장 후 결재선 변경시 여러번 호출이 문제됨.
                            //GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                        },
                        success: function (model) {
                            // http://jira.daou.co.kr/browse/GO-16197
                            // http://jira.daou.co.kr/browse/GO-16354 둘다봐야함.
                            if (self.model.isStatusTempSaved()) {
                                self.changeActivityGroups(model.get('apprFlow').activityGroups, isReception);
                                self.changeReferrenceReaders(model.get('docInfo').docReferenceReaders);
                                self.changeDocInfo(model.get('docInfo'));
                            } else {
                                self.documentInit();
                                self.render();
                            }
                        },
                        error: function (model, error) {
                            var responseData = JSON.parse(error.responseText);
                            var message = responseData.message;
                            if (message) {
                                $.goError(message);
                            } else {
                                $.goError(commonLang["실패했습니다."]);
                            }
                        },
                        complete: function () {
                            //GO-17463 임시저장 후 결재선 변경시 여러번 호출이 문제됨.
                            //GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            __ajaxSending__ = false;
                        }
                    });
                } else {
                    self.changeActivityGroups(apprFlow.activityGroups, isReception);
                    self.changeReferrenceReaders(this.model.get('docInfo').docReferenceReaders);
                    self.changeDocInfo(this.model.get('docInfo'), isReception);
                }
            },

            changeReferrenceReaders: function (docReferenceReaders) {
                this.documentView.changeReferrenceReaders(docReferenceReaders);
            },

            /**
             * 결재선 변경이 일어날 경우 문서양식내 결재선과 사이드의 결재선 부분을 업데이트.
             */
            changeActivityGroups: function (activityGroups, isReception) {
                this.documentView.changeActivityGroups(activityGroups, isReception);
                this.apprFlowView.makeApprFlow(activityGroups);
            },

            /**
             * 결재선 UI에서 문서정보들(참조자/수신자/열람자/공문서 수신처)가 변경되었을 경우 사이드의 문서 정보탭을 업데이트.
             * @param Object docInfoAttrs ApprDocumentModel의 docInfo 속성
             * @since 1.6.5
             * @author Bongsu Kang(kbsbroad@daou.co.kr)
             */
            changeDocInfo: function (docInfoAttrs, isReception) {
                // 다시 그린다
                this.docInfoView.updateDocInfo(docInfoAttrs);

                var receptionData = [];
                var txt;
                if (isReception) {
                    return false;
                }
                $.each(docInfoAttrs.docReceptionReaders, function (k, v) {
                    txt = v.reader.name;
                    if (v.reader.position && v.reader.position != "") {
                        txt += " " + v.reader.position;
                    }
                    receptionData.push(txt);
                });

                var referenceData = [];
                $.each(docInfoAttrs.docReferenceReaders, function (k, v) {
                    txt = v.reader.name;
                    if (v.reader.position && v.reader.position != "") {
                        txt += " " + v.reader.position;
                    }
                    referenceData.push(txt);
                });

                var officialReceptionData = [];
                $.each(docInfoAttrs.officialVersions, function (k, v) {
                    if (v.receivers) {
                        $.each(v.receivers, function (i, value) {
                            var company = _.isEmpty(value.company) ? "" : value.company;
                            officialReceptionData.push(company + " " + value.name);
                        });
                    }
                });

                var setData = {
                    recipient: receptionData,
                    docReference: referenceData,
                    officialDocReceiver: officialReceptionData
                };
                this.documentView.setApprovalData(setData);
            },

            changeActivity: function (activity) {
                this.documentView.changeActivity(activity);
            },

            setDocNum: function (docNum) {
                this.documentView.setDocNum(docNum);
            },

            getActDocument: function (options) {
                options = $.extend({
                    inDraft: false,
                    inCancel: false,
                    useArbitrary: false,
                    arbtDecisionType: true,
                    defaulCheckArbitrary: false,
                    nextApproval: true,
                    isEmergency: false,
                    showPreviousReturn: false
                }, options);
                var documentTitle = this.getTitle();
                var userInfo = $("#apprflow").find('div[data-userId=' + GO.session().id + ']');
                var userName = $(userInfo).attr('data-userName') + " " + $(userInfo).attr('data-userPosition');
                var userDept = $(userInfo).attr('data-userDeptName');

                if (!$(userInfo).attr('data-userName')) {
                    userInfo = this.model.get('apprFlow').currentUserId;
                    userName = this.model.get('apprFlow').currentUserName + " " + this.model.get('apprFlow').currentUserPositionName;
                    userDept = this.model.get('apprFlow').currentUserDeptName;
                }
                if (options.inDraft && $("#apprflow").find('div[data-userid]').length < 2) {
                    var message = approvalLang['1인결재경고'];
                }
                var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                var isEmergency = $('#emergency').is(':checked');
                var isReceptionDocument = this.model.get('document').isReceptionDocument;
                var arbtDescLang = GO.i18n(approvalLang['{{arg1}}전결설명'], {"arg1": this.model.get('docInfo').currentApprGroupName});
                var placeholder = lang["의견을 작성해 주세요"];
                var comment = lang["결재의견"];

                if (options.isReturn) {
                    placeholder = lang["반려 결재 의견 입력은 필수입니다"];
                    comment = lang["반려결재의견"];
                } else if (options.isRecvReturned) {
                    placeholder = lang["반송 결재 의견 입력은 필수입니다"];
                    comment = lang["반송결재의견"];
                }

                var $tpl = $(ActDocumentTpl({
                    lang: lang,
                    arbtDescLang: arbtDescLang,
                    message: message,
                    documentTitle: documentTitle,
                    userName: userName,
                    userDept: userDept,
                    usePassword: options.usePassword != undefined ? options.usePassword : this.usePassword,
                    useArbitrary: options.useArbitrary,
                    arbtDecisionType: options.arbtDecisionType,
                    defaultCheckArbitrary: options.defaultCheckArbitrary,
                    showPreviousReturn: options.showPreviousReturn,
                    inDraft: options.inDraft,
                    inCancel: options.inCancel,
                    useNextApproval: useNextApproval,	// 사용자 설정
                    isEmergency: isEmergency,
                    isReceptionDocument: isReceptionDocument,
                    nextApproval: options.nextApproval,	// template 별 설정
                    placeholder: placeholder,
                    comment: comment
                }));

                if (this.usePassword) {
                    // password 입력 후 enter key event 처리
                    $tpl.delegate("#apprPassword", "keyup", function (e) {
                        if (e.keyCode != 13) return;

                        var $current = $(e.currentTarget);

                        // options.saveActionTarget 값을 통해 비밀번호 입력 후 action 버튼을 지정할 수 있음
                        // default : 창의 .btn_major_s
                        var saveActionEl = options.saveActionTarget ? $(options.saveActionTarget) : $current.closest("div.go_popup").find("footer a.btn_major_s");
                        saveActionEl.trigger("click");
                    });

                }

                return $tpl;
            },

            getTitle: function () {
                var formName = this.model.get('document').formName;
                var subject = this.documentView.getTitle();
                var documentTitle = this.model.get('document').title ? subject ? subject : this.model.get('document').title : subject ? subject : formName;
                return documentTitle;
            },

            saveDocument: function () {
                var self = this;
                
                if (!self.checkCompleteForm()) {
                    return false;
                }
                if (!this.formIntegrator.validate()) {
                    return false;
                }

                $.goConfirm(approvalLang['저장하시겠습니까?'], '', function () {
                    if (!self.allowAction) {
                        return;
                    }

                    self.formIntegrator.beforeSave();

                    self.allowAction = false;
                    var docId = self.model.get('document').documentId;
                    var apprFlow = self.model.get('apprFlow');
                    var model = new DocumentSaveModel(docId);
                    var docVersionId = self.model.get('document').docVersionId;

                    model.set({
                        'document': self.getDocumentData(docId),
                        'docInfo': self.getDocInfoData(docId),
                        'apprFlow': apprFlow,
                        'docVersionId': docVersionId
                    }, {
                        silent: true
                    });

                    var preloader = $.goPreloader();

                    model.save({}, {
                        type: 'PUT',
                        beforeSend: function () {
                            preloader.render();
                        },
                        success: function (model, result) {
                            self.allowAction = true;
                            if (result.code == 200) {
                                self.documentInit();
                                self.render();
                                $.goMessage(approvalLang["저장이 완료되었습니다."]);
                                self.formIntegrator.afterSave();
                            }
                        },
                        error: function (model, rs) {
                            self.allowAction = true;
                            var responseObj = rs.responseJSON;
                            if (!_.isUndefined(responseObj) && responseObj.message) {
                                $.goError(responseObj.message);
                                return false;
                            } else {
                                $.goError(commonLang['저장에 실패 하였습니다.']);
                                return false;
                            }
                        },
                        complete: function () {
                            preloader.release();
                        }
                    });
                });
            },

            cancelEdit: function () {
                var self = this;
                $.goConfirm(approvalLang['취소하시겠습니까?'],
                    '',
                    function () {
                        self.documentInit();
                        self.render();
                        $.goMessage(approvalLang["취소 되었습니다."]);
                    }
                );
            },

            draftDocument: function () {
                var self = this;

                if (this.model.get("isDeletedDraftDept")) {
                    this.showErrorAlert(approvalLang['삭제된 기안부서로 문서기안 불가 안내 메시지'],
                        approvalLang['결재문서를 새로 작성해 주세요.']);
                    return;
                }

                if (self.model.get('docInfo').requiredReceiver && self.model.get('docInfo').docReceptionReaders.length == 0 && this.model.get('document').docType != 'RECEIVE') {
                    var contents = ['<p class="q">' + lang['수신처 지정 필수 메세지'] + '</p>',
                        '<p class="q"><a id="callEditApprFlow">[' + lang['수신처 지정하기'] + ']</a></p>'
                    ].join('');

                    var popUp = $.goPopup({
                        "pclass": "layer_normal layer_approval",
                        "header": approvalLang['결재요청'],
                        "modal": true,
                        "draggable": true,
                        "width": 500,
                        "contents": contents,
                        "buttons": [
                            {
                                'btext': commonLang["닫기"],
                                'btype': 'cancel'
                            }
                        ]
                    });

                    $(popUp).find('#callEditApprFlow').off('click');
                    $(popUp).find('#callEditApprFlow').on('click', _.bind(self.editApprFlow, self, 'receiver'));

                    return false;
                }

                when(this.checkSelfApproval())
                    .then(function popDraft() {
                        if (!self.formIntegrator.validate()) {
                            return false;
                        }
                        if (!self.checkCompleteForm()) {
                            return false;
                        }

                        $.goPopup({
                            "pclass": "layer_normal layer_approval",
                            "header": approvalLang['결재요청'],
                            "modal": true,
                            "draggable": true,
                            "width": 500,
                            "contents": self.getActDocument({inDraft: true, nextApproval: false}),
                            "buttons": [
                                {
                                    'btext': approvalLang['결재요청'],
                                    'btype': 'confirm',
                                    'autoclose': false,
                                    'callback': function (rs) {
                                        self.saveDraftDocument(rs);
                                    }
                                },
                                {
                                    'btext': commonLang["취소"],
                                    'btype': 'cancel'
                                }
                            ]
                        });
                    })
                    .otherwise(function printError(err) {
                        console.log(err.stack);
                    });
            },

            /**
             * 기안 (결재 요청)
             */
            saveDraftDocument: function (rs) {
                if (!this.allowAction) {
                    return;
                }

                var self = this;
                var apprPassword = $('#apprPassword').val();
                var description = $("#textarea-desc").val();

                if (!this.actionApprValidate('#apprPassword', '#textarea-desc', rs)) {
                    return false;
                }

                if ($('#isEmergency').is(':checked')) {
                    $("#emergency").attr("checked", true);
                } else {
                    $("#emergency").attr("checked", false);
                }

                this.formIntegrator.beforeSave();

                var docId = self.model.get('document').documentId;
                var apprFlow = self.model.get('apprFlow');

                // 수신문서 재접수 후 기안시 필요.
                if (!_.isUndefined(self.model.get('document').apprFlowVersionId)) {
                    apprFlow['apprFlowVersionId'] = self.model.get('document').apprFlowVersionId;
                }

                var activityId = apprFlow.activityGroups[0].activities[0].id;
                var apprAction = {
                    'activityId': activityId,
                    'apprAction': 'DRAFT',
                    'comment': $("#textarea-desc").val(),
                    'apprPassword': apprPassword
                };
                var model = new DraftModel(docId);
                this.allowAction = false;

                model.set({
                    'apprAction': apprAction,
                    'document': self.getDocumentData(docId),
                    'docInfo': self.getDocInfoData(docId),
                    'apprFlow': apprFlow
                }, {
                    silent: true
                });

                var preloader = $.goPreloader();

                model.save({}, {
                    type: 'PUT',
                    beforeSend: function () {
                        preloader.render();
                    },
                    success: function (model, result) {
                        self.allowAction = true;
                        if (result.code == 200) {
                            rs.close();
                            self.formIntegrator.afterSave();
                            $.goMessage(approvalLang["결재 요청을 완료하였습니다."]);
                            self.navigateToDocShow(result['data']['document']['id']);
                        }
                    },
                    error: function (model, rs) {
                        self.allowAction = true;
                        var responseObj = JSON.parse(rs.responseText);
                        if (!_.isUndefined(responseObj) && responseObj.message) {
                            if (self.usePassword) {
                                $.goError(responseObj.message, $('#apprPassword'));
                                $('#apprPassword').addClass('enter error').focus();
                            } else {
                                $.goError(responseObj.message);
                            }
                            return false;
                        } else {
                            $.goError(approvalLang['기안에 실패 하였습니다.']);
                            return false;
                        }
                    },
                    complete: function () {
                        preloader.release();
                    }
                });
            },

            showSendMailLayer: function () {
                // popup mail writing window
                var subject = this.documentView.getTitle();
                //우선순위 : 1. documentView의 title 2. document의 title, 3. document의 formname
                var title = this.model.get('document').title ? (subject ? subject : this.model.get('document').title) : (subject ? subject : this.model.get('document').formName);

                //메일에 사용할 Subject
                this.mailTitle = title;

                when(this.apprDocumentMailModel.fetch({
                    async: false,
                    statusCode: {
                        400: function () {
                            $.goError(commonLang['500 오류페이지 타이틀']);
                        },
                        403: function () {
                            $.goError(commonLang['403 오류페이지 타이틀']);
                        },
                        500: function () {
                            $.goError(commonLang['500 오류페이지 타이틀']);
                        }
                    }
                }))
                    .then(_.bind(function () {
                        var data = this.apprDocumentMailModel.toJSON();

                        if (data.attlists.length < 1) {
                            //첨부 파일이 없는 경우 에러 표시후 팝업 미노출 및 에러 표시
                            //전자결제의 경우 문서가 변환된 html이 1개는 꼭 있기 때문에
                            // 파일이 1개도 없으시에는 팝업 미노출 처리 (기획과 상의처리)
                            $.goError(commonLang['500 오류페이지 타이틀']);
                        } else {
                            //첨부 파일이 존재하는 경우
                            //첨부파일 세팅
                            var attlists = _.map(data.attlists, function (attachFile) {
                                var attachString = attachFile.path + ":"
                                    + attachFile.name + ":"
                                    + attachFile.size + ":"
                                    + attachFile.id + "\n";
                                return attachString;
                            });


                            this.openEmailPopup(attlists, this.mailTitle);
                        }

                    }, this))
                    .otherwise(function printError(err) {
                        console.log(err.stack);
                    })
            },

            openEmailPopup: function (attlists, title) {

                var windowName = Math.floor(Math.random() * 10000);
                var windowFeatures = "scrollbars=yes,resizable=yes,width=" + MAIL_POPUP_WIDTH + ",height= " + MAIL_POPUP_HEIGHT;

                window.open("", windowName, windowFeatures);

                var form = document.createElement("form");
                var hiddenData = document.createElement("input");
                hiddenData.type = "hidden";
                hiddenData.name = "data";

                var param = {};
                param.subject = title;

                var attachFiles = [];
                _.each(attlists, function (attr) {
                    attachFiles.push(attr);
                });
                param.attachFiles = attachFiles;
                hiddenData.value = JSON.stringify(param);
                form.appendChild(hiddenData);

                form.action = GO.contextRoot + "app/mail/popup/process";
                form.method = "post";
                form.target = windowName;

                // IE 환경에서 Popup으로 Form submit을 못하는 현상 처리
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);
            },

            showPostRegistLayer: function () {
                var postRegistView = new PostRegist({
                    model: this.model
                });

                var postPopup = $.goPopup({
                    pclass: 'layer_normal send_mail',
                    header: approvalLang["결재문서 게시하기"],
                    modal: true,
                    allowPrevPopup: true,
                    contents: "",
                    buttons: [{
                        btype: 'confirm',
                        btext: approvalLang["게시하기"],
                        autoclose: false,
                        callback: function (rs, e) {
                            postRegistView.submit().done(function () {
                                rs.close();
                            }).fail();
                        }
                    }, {
                        btype: 'cancel',
                        btext: commonLang["취소"],
                        autoclose: false,
                        callback: function (rs, e) {
                            rs.close('', e);
                        }
                    }]
                });

                postPopup.find(".content").html(postRegistView.el);
                postRegistView.render();
                postPopup.reoffset();
            },

            showPopup: function () {
                var url = this.model.getFullShowUrl() + "/popup";
                window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
            },

            reapplyDocument: function () {
                var self = this;

                if (this.model.docInfoModel.attributes.integrationActive) {
                    this.showErrorAlert(approvalLang['시스템과 연동된 문서는 재기안이 불가능합니다.'], approvalLang['결재문서를 새로 작성해 주세요.']);
                    return;
                }

                var apprConfigModel = new UserApprConfigModel();
                apprConfigModel.fetch({
                    success: function (model, result) {
                        if (!self.options.isPopup) {
                            if (model.get('writeMode') == "POPUP") {
                                url = GO.contextRoot + "app" + "/approval/document/" + self.docId + "/reapply/popup"
                                window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
                            } else {
                                GO.router.navigate("/approval/document/" + self.docId + "/reapply", {trigger: true});
                            }
                        } else {
                            GO.router.navigate("/approval/document/" + self.docId + "/reapply/popup", {trigger: true});
                        }
                    },
                    error: function (model, rs) {
                        var msg = commonLang['500 오류페이지 내용'];
                        if ($.parseJSON(rs.responseText).message) {
                            msg = $.parseJSON(rs.responseText).message;
                        }
                        self.docInitError(msg);
                    }
                });
            },

            actionApprValidate: function (pwdEl, descEl, popEl, apprAction) {
                var checked = true;
                $(pwdEl).removeClass('enter error');
                $(descEl).removeClass('enter error');
                popEl.find('span.go_error').remove();
                var apprPassword = $(pwdEl).val();
                var description = $(descEl).val();
                if (this.usePassword) {
                    if (!apprPassword) {
                        $.goError(approvalLang["결재 비밀번호를 입력하세요."], $(pwdEl));
                        $(pwdEl).addClass('enter error').focus();
                        checked = false;
                    }
                }
                if ((apprAction == 'RETURN' || apprAction == 'RECV_RETURNED') && $.trim(description) == '') {
                    $.goError(approvalLang['의견을 작성해 주세요'], $(descEl));
                    $(descEl).addClass('enter error').select();
                    checked = false;
                }
                if (description && description.length > 1000) {
                    $.goError(GO.i18n(approvalLang["{{max}}자 이하로 입력해 주십시오"], {'max': 1000}), $(descEl));
                    $(descEl).addClass('enter error').select();
                    checked = false;
                }

                return checked;
            },

            getDocumentData: function (docId, docStatus) {
                return {
                    "id": docId,
                    "documentId": docId,
                    "docStatus": docStatus,
                    "attachCount": 0,
                    "attaches": this.getAttachData(),
                    "comments": this.getCommentsData(),
                    "references": this.getReferencesData(),
                    "docBodyContent": this.getDocBodyContentData(),
                    "title": this.getTitle(),
                    "variables": this.getDocVariables(),
                    "reDraft": this.documentView.docModel.reDraft,
                    "updatedAt": this.model.get("document").updatedAt
                };
            },

            getDocVariables: function () {
                var variables = {};
                var integrationActive = this.model.get("docInfo").integrationActive || false;
                var useExternalScript = !_.isEmpty(this.model.get("docInfo").externalScript);

                // 시스템 연동을 사용하거나 스크립트가 있을 경우 variables 설정
                if (integrationActive || useExternalScript) {
                    variables = this.formIntegrator.getDocVariables() || this.documentView.getDocVariables();
                }

                return variables
            },

            getAttachData: function () {
                var attachPart = $("#attachPart").find('li[data-tmpname]:not(.attachError)');
                var attachesData = [];

                attachPart.each(function () {
                    var attachOpt = {};
                    if ($(this).attr("data-tmpname")) {
                        attachOpt.path = $(this).attr("data-tmpname");
                    }
                    if ($(this).attr("data-name")) {
                        attachOpt.name = $(this).attr("data-name");
                    }
                    if ($(this).attr("data-id")) {
                        attachOpt.id = $(this).attr("data-id");
                    }
                    attachesData.push(attachOpt);
                });

                return attachesData;
            },

            getCommentsData: function () {
                var commentsData = [];
                return commentsData;
            },

            getReferencesData: function () {
                var referencesData = [];
                var referencesPart = $("#refDocPart").find('li[data-id]');
                var receptionOriginPart = $("#receptionOriginDocPart").find('li[data-id]');

                referencesPart.each(function () {
                    referencesData.push({id: $(this).data("id")});
                });
                receptionOriginPart.each(function () {
                    referencesData.push({id: $(this).data("id")});
                });
                return referencesData;
            },

            getDocBodyContentData: function () {
                return this.documentView.getDocBodyContents();
            },

            getDocInfoData: function (docId) {
                var self = this;
                var docInfoAttr = self.model.get('docInfo');
                var drafterDeptFolderId = _.isEmpty(docInfoAttr.deptDocFolders) ? "" : docInfoAttr.deptDocFolders[0].id;
                return {
                    "id": docId,
                    "securityLevelId": $('#infoSecurityLevel').val(),
                    "docYear": $('#docYear').val(),
                    "docFolders": self.getDocFolderData(),
                    "docReceptionReaders": docInfoAttr.docReceptionReaders || [],
                    "docReferenceReaders": docInfoAttr.docReferenceReaders || [],
                    "docReadingReaders": docInfoAttr.docReadingReaders || [],
                    "officialVersions": docInfoAttr.officialVersions || [],
                    "isPublic": $(':radio[name="openType"]:checked').val(),
                    "isEmergency": $('#emergency').is(':checked'),
                    "drafterDeptFolderId": _.isUndefined($("#drafter_deptFolderId").val()) ? drafterDeptFolderId : $("#drafter_deptFolderId").val()
                };
            },

            //문서분류 추가
            getDocFolderData: function () {
                var docFolderPart = $("#addFolder").find('li[data-id]');
                var docFolder = [];

                docFolderPart.each(function () {
                    if ($(this).attr("data-Type") == 'true') {
                        docFolder.push({id: $(this).attr("data-id")});
                    }
                });

                return docFolder;
            },

            //수신자 추가
            getDocReceptionReadersData: function () {
                var docReceptionReaders = [];
                var docReceptionReadersPart = $("#addReceive").find('li[data-id]');
                docReceptionReadersPart.each(function () {
                    docReceptionReaders.push({
                        id: $(this).attr("data-sid"),
                        assigned: $(this).attr("data-assigned") ? true : false,
                        reader: {
                            id: $(this).attr("data-userId"),
                            name: $(this).attr("data-userName"),
                            position: $(this).attr("data-userPosition"),
                            deptId: $(this).attr("data-userDeptId"), // 사용자인 경우에 소속 부서를 함께 넘긴다.
                            deptType: $(this).attr("data-deptType")
                        }
                    });
                });
                return docReceptionReaders;
            },

            getDocReferenceReadersData: function () {
                var docReferenceReaders = [];
                var docReferenceReadersPart = $("#addReference").find('li[data-id]');
                docReferenceReadersPart.each(function () {
                    docReferenceReaders.push({
                        id: $(this).attr("data-sid"),
                        reader: {
                            id: $(this).attr("data-userId"),
                            name: $(this).attr("data-userName"),
                            position: $(this).attr("data-userPosition"),
                            deptType: $(this).attr("data-deptType")
                        }
                    });
                });
                return docReferenceReaders;
            },

            deleteDocument: function () {
                var self = this;
                $.goConfirm(commonLang['삭제하시겠습니까?'], '', function () {
                    var deleteApiUrl = [GO.config('contextRoot') + 'api/approval/document', self.docId, 'delete'].join('/');
                    $.ajax(deleteApiUrl, {
                        type: 'PUT',
                        contentType: 'application/json',
                        dataType: 'json'
                    }).done(function (data) {

                        if (!self.options.isPopup) {
                            $.goMessage(approvalLang["선택한 항목이 삭제되었습니다"]);
                            self.navigateToBackList();
                        } else {
                            $.goAlert("", approvalLang["선택한 항목이 삭제되었습니다"], function () {
                                window.close();
                            });
                        }
                    });
                });
            },

            tempSaveReload: function () {
                if (!this.allowAction) {
                    return;
                }
                var self = this;
                var tempSaveApiUrl = [GO.config('contextRoot') + 'api/approval/document', self.docId, 'tempsave'].join('/'),
                    docId = self.model.get('document').documentId,
                    apprFlow = self.model.get('apprFlow');

                var ajaxOpt = {
                    type: 'PUT',
                    contentType: 'application/json',
                    dataType: 'json',
                    beforeSend: function () {
                        self.allowAction = false;
                    },
                    data: JSON.stringify({
                        'document': self.getDocumentData(docId),
                        'docInfo': self.getDocInfoData(docId),
                        'apprFlow': apprFlow
                    })
                };

                var ajaxCallback = function (data) {
                    self.allowAction = true;
                };

                $.ajax(tempSaveApiUrl, ajaxOpt).done($.proxy(ajaxCallback, this)).fail(function (rs) {
                    self.allowAction = true;
                    var result = JSON.parse(rs.responseText);
                });
            },
            tempSaveChangeDept: function (draftDeptId) {
                if (!this.allowAction) {
                    $.goError(approvalLang['수정요청 진행중 메세지']);
                    this.docInfoView.setDefaultDraterDeptId();
                    return;
                }
                var self = this;
                var tempSaveApiUrl = [GO.config('contextRoot') + 'api/approval/document', self.docId, 'tempsave', draftDeptId].join('/'),
                    docId = self.model.get('document').documentId,
                    apprFlow = self.model.get('apprFlow');

                var ajaxOpt = {
                    type: 'PUT',
                    contentType: 'application/json',
                    dataType: 'json',
                    beforeSend: function () {
                        self.allowAction = false;
                    },
                    data: JSON.stringify({
                        'document': self.getDocumentData(docId),
                        'docInfo': self.getDocInfoData(docId),
                        'apprFlow': apprFlow
                    })
                };

                var ajaxCallback = function (data) {
                    GO.util.store.set("autoSetAppr", true, {type: "session"});
                    self.allowAction = true;
                    self.navigateToDocShow(docId);
                };

                $.ajax(tempSaveApiUrl, ajaxOpt).done($.proxy(ajaxCallback, this)).fail(function (rs) {
                    var result = JSON.parse(rs.responseText);
                    self.allowAction = true;
                    $.goError(result.message);
                });
            },

            tempSaveDocument: function () {
                if (!this.allowAction) {
                    return;
                }
                var self = this;
                $.goConfirm(approvalLang['임시저장 하시겠습니까?'], '', function () {
                    var tempSaveApiUrl = [GO.config('contextRoot') + 'api/approval/document', self.docId, 'tempsave'].join('/'),
                        docId = self.model.get('document').documentId,
                        apprFlow = self.model.get('apprFlow');

                    var ajaxOpt = {
                        type: 'PUT',
                        contentType: 'application/json',
                        beforeSend: function () {
                            self.allowAction = false;
                        },
                        dataType: 'json',
                        data: JSON.stringify({
                            'document': self.getDocumentData(docId),
                            'docInfo': self.getDocInfoData(docId),
                            'apprFlow': apprFlow
                        })
                    };

                    var ajaxCallback = function (data) {
                        self.navigateToDocShow(docId);
                        self.allowAction = true;
                        $.goMessage(approvalLang["임시저장되었습니다."]);
                    };

                    $.ajax(tempSaveApiUrl, ajaxOpt).done($.proxy(ajaxCallback, this)).fail(function (rs) {
                        var result = JSON.parse(rs.responseText);
                        $.goError(result.message);
                        self.allowAction = true;
                    });
                });
            },

            tempAutoSaveDocument: function () {
                if (!this.allowAction) {
                    return;
                }
                var self = this;

                var tempSaveApiUrl = [GO.config('contextRoot') + 'api/approval/document', self.docId, 'tempsave'].join('/'),
                    docId = self.model.get('document').documentId,
                    apprFlow = self.model.get('apprFlow');

                var ajaxOpt = {
                    type: 'PUT',
                    contentType: 'application/json',
                    dataType: 'json',
                    beforeSend: function () {
                        self.allowAction = false;
                    },
                    data: JSON.stringify({
                        'document': self.getDocumentData(docId),
                        'docInfo': self.getDocInfoData(docId),
                        'apprFlow': apprFlow
                    })
                };

                var ajaxCallback = function (data) {
                    self.allowAction = true;
                    self.toolbarView.processAutoSaveMessage('saveTerm');
                    self.documentView._reloadAttachArea(data);
                    // 자동저장후 editor영역의 img의 src가 temp상태로 남아 있기 때문에 서버의 documentContent로 업데이트 해줘야 한다. ActiveDesigner일 경우에는 img replace를 안해도 되는것 같다.
                    var editors = $(data.data.document.docBodyContent).find('span[data-dsl*="editor"]');
                    var oldImgs = $(self.getDocBodyContentData()).find('img[data-inline]');
                    var imgSrcReplaceFlag = false;
                    $.each(oldImgs, function (i, oldImg) {
                        if (!$(oldImg).attr('data-id')) {
                            imgSrcReplaceFlag = true;
                        }
                    });
                    if (imgSrcReplaceFlag) {
                        $.each(editors, function (m, editor) {
                            $.goFormEditor.putContent($(editor).attr('data-id'), $(editor).html());
                        });
                    }
                    /**
                     * GO-25037
                     * api/approval/document/new api의 return model과
                     * api/approval/document/{docId}/tempsave 의 return model이 동일해야 함 (model converter도 동일해야 함)
                     * 그렇지 않다면 self.model.fetch();
                     */
                    self.model.set(data.data);

                };

                $.ajax(tempSaveApiUrl, ajaxOpt).done($.proxy(ajaxCallback, this)).fail(function (rs) {
                    self.allowAction = true;
                    var result;
                    if (rs.responseText) {
                        result = JSON.parse(rs.responseText);
                        $.goError(result.message);
                    } else {
                        $.goError(commonLang['관리 서버에 오류가 발생하였습니다']);
                    }
                });
            },

            storeAutoSaveTime: function () {
                var self = this;
                var tempSaveApiUrl = GO.config('contextRoot') + 'api/approval/usersetting/autosavetime';
                var ajaxOpt = {
                    type: 'PUT',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        autoSaveTime: this.toolbarView.$("#autoSaveSelect").val()
                    })
                };
                $.ajax(tempSaveApiUrl, ajaxOpt);
            },

            cancelDraft: function () {
                var self = this;
                $.goConfirm(commonLang['취소하시겠습니까?'], '', function () {
                    if (!self.options.isPopup) {
                        self.navigateToDraftList();
                    } else {
                        window.close();
                    }

                });
            },
            actDraftWithdrawalDraft: function () {
                var self = this;
                $.goConfirm(approvalLang["결재요청 안내 메세지"], '', function () {
                    $.goPopup({
                        "pclass": "layer_normal layer_approval",
                        "header": approvalLang["결재요청"],
                        "modal": true,
                        "draggable": true,
                        "width": 500,
                        "contents": self.getActDocument({inCancel: true, nextApproval: false}),
                        "buttons": [
                            {
                                'btext': commonLang["확인"],
                                'btype': 'confirm',
                                'autoclose': false,
                                'callback': function (rs) {
                                    self.saveApprAction(rs, "DRAFTWITHDRAWDRAFT");
                                }
                            },
                            {
                                'btext': commonLang["취소"],
                                'btype': 'cancel'
                            }
                        ]
                    });

                });
            },
            actDraftWithdrawalCancelDraft: function () {
                var self = this;
                $.goConfirm(approvalLang['상신취소 안내 메세지'], '', function () {
                    $.goPopup({
                        "pclass": "layer_normal layer_approval",
                        "header": approvalLang["결재취소"],
                        "modal": true,
                        "draggable": true,
                        "width": 500,
                        "contents": self.getActDocument({inCancel: true, nextApproval: false}),
                        "buttons": [
                            {
                                'btext': commonLang["확인"],
                                'btype': 'confirm',
                                'autoclose': false,
                                'callback': function (rs) {
                                    self.saveApprAction(rs, "DRAFTWITHDRAWCANCELDRAFT");
                                }
                            },
                            {
                                'btext': commonLang["취소"],
                                'btype': 'cancel'
                            }
                        ]
                    });
                });
            },

            doApprove: function () {
                var self = this;
                var buttons = [];

                buttons.push({
                    'btext': approvalLang['승인'],
                    'btype': 'confirm',
                    'autoclose': false,
                    'callback': function (rs) {
                        self.saveApprAction(rs, "APPROVAL");
                    }
                });

                buttons.push({
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                });

                var useArbitrary = this.model.get('actionCheck').isArbitraryDecisionabled;
                var arbtDecisionType = this.model.get('docInfo').arbtDecisionType == 'DOCUMENT' ? true : false;
                var currentActivity = this.apprFlowView.getCurrentActivity();
                var defaultCheckArbitrary = false;
                if (typeof currentActivity != 'undefined') {
                    defaultCheckArbitrary = currentActivity.arbitrary;
                }

                var popup = $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['결재하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument({
                        useArbitrary: useArbitrary,
                        arbtDecisionType: arbtDecisionType,
                        defaultCheckArbitrary: defaultCheckArbitrary
                    }),
                    "buttons": buttons
                });
                $(popup).find('#arbitrary').off('click');
                $(popup).find('#arbitrary').on('click', function (e) {
                    $("#arbtAddReferrerDetail").toggle($("#arbitrary").is(':checked'));
                });
            },

            getPageNo: function () {
                //기존 로직 대로라면 (total이 없을 경우) 무조건 0을 리턴
                //doclist_item에서 설정해준 total과 page당 개수를 확인하여 이동해야 하는지 판단.
                var page = sessionStorage.getItem('list-history-pageNo');
                var total = sessionStorage.getItem('list-total-count');
                if (!page || !total || page == 0) {
                    return 0;
                }
                var pageSize = sessionStorage.getItem('list-history-pageSize');
                if (total <= ((pageSize * page) + 1)) {
                    page = (page - 1 >= 0) ? page - 1 : 0;
                }
                return page;
            },
            /**
             * 각 결재 액션의 공통된 처리를 진행한다.
             */
            saveApprAction: function (rs, apprAction) {
                var self = this;

                if (!this.allowAction) {
                    return;
                }
                var property = "document.draftedAt";
                var direction = "desc";
                var searchtype = sessionStorage.getItem('list-history-searchtype');
                var keyword = sessionStorage.getItem('list-history-keyword') && sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
                var duration = "all";
                var fromDate = "";
                var toDate = "";

                var docId = self.model.get('document').documentId;
                var model = new ApprActionModel(docId);

                if (apprAction == 'RECV_RETURNED') {
                    model = new ReceptionSaveModel(docId, "return");
                    property = "createdAt";
                }

                if (sessionStorage.getItem('list-history-keyword') && sessionStorage.getItem('list-history-property') != "") {
                    property = sessionStorage.getItem('list-history-property');
                }
                if (sessionStorage.getItem('list-history-direction') && sessionStorage.getItem('list-history-direction') != "") {
                    direction = sessionStorage.getItem('list-history-direction');
                }
                if (sessionStorage.getItem('list-history-duration') && sessionStorage.getItem('list-history-duration') != "") {
                    duration = sessionStorage.getItem('list-history-duration');
                }
                if (duration == "period" && sessionStorage.getItem('list-history-fromDate') && sessionStorage.getItem('list-history-fromDate') != "") {
                    fromDate = sessionStorage.getItem('list-history-fromDate');
                    toDate = sessionStorage.getItem('list-history-toDate');
                }

                var apprPassword = $('#apprPassword').val();
                if (!this.actionApprValidate('#apprPassword', '#textarea-desc', rs, apprAction)) {
                    return false;
                }

                var currentActivityId = getActivityId({ apprAction: apprAction });
                var docVersionId = self.model.get('document').docVersionId;
                var apprFlowVersionId = self.model.get('document').apprFlowVersionId;
                this.allowAction = false;

                var arbtAddReferrer = false;
                if ($("#arbitrary").is(':checked')) {
                    apprAction = 'ARBITRARY';
                    if (self.model.get('docInfo').arbtDecisionType == 'APPRGROUP') {
                        apprAction = 'GROUPARBITRARY';
                    }
                    if ($("#arbtAddReferrer").is(':checked')) {
                        arbtAddReferrer = true;
                    }
                }
                var useNextApproval = false;
                var nextView = true;
                if ($("#nextApproval")) {
                    if ($("#nextApproval").is(':checked')) {
                        useNextApproval = true;
                    }
                } else {
                    nextView = false;
                    useNextApproval = this.model.get('userApprSetting').useNextApproval;
                }

                if ($("#isPreviousReturn").is(':checked')) {
                    apprAction = 'PREVIOUSRETURN';
                }

                model.set({
                    'activityId': currentActivityId,
                    'apprAction': apprAction,
                    'comment': $("#textarea-desc").val(),
                    'apprPassword': apprPassword,
                    'docVersionId': docVersionId,
                    'apprFlowVersionId': apprFlowVersionId,
                    'arbtAddReferrer': arbtAddReferrer,
                    'userApprSetting': {
                        'useNextApproval': useNextApproval,
                        'property': property,
                        'direction': direction,
                        'searchtype': searchtype,
                        'keyword': keyword,
                        'duration': duration,
                        'fromDate': fromDate,
                        'toDate': toDate
                    }
                }, {
                    silent: true
                });

                var preloader = $.goPreloader();

                model.save({}, {
                    type: 'PUT',
                    beforeSend: function () {
                        preloader.render();
                    },
                    success: function (model, result) {
                        self.allowAction = true;
                        if (result.code == 200) {
                            self.tempActivityGroups = result.data.apprFlow.activityGroups;
                            rs.close();

                            var actionsForwardingTodoPage = [];
                            actionsForwardingTodoPage.push("APPROVAL");
                            actionsForwardingTodoPage.push("RETURN");
                            actionsForwardingTodoPage.push("ARBITRARY");
                            actionsForwardingTodoPage.push("GROUPARBITRARY");
                            actionsForwardingTodoPage.push("AGREEMENT");
                            actionsForwardingTodoPage.push("OPPOSITION");
                            actionsForwardingTodoPage.push("CHECK");
                            actionsForwardingTodoPage.push("POSTCHECK");
                            actionsForwardingTodoPage.push("HOLD");
                            actionsForwardingTodoPage.push("PREVIOUSRETURN");
                            if (_.contains(actionsForwardingTodoPage, apprAction)) {
                                sessionStorage.setItem('list-history-pageNo', self.getPageNo());
                                if (useNextApproval && nextView) {
                                    if (docId == result['data']['document']['id']) {
                                        self.navigateToTodoList(model.get("document").id);
                                    } else {
                                        self.navigateToDocShow(result['data']['document']['id']);
                                    }
                                } else {
                                    self.navigateToTodoList(model.get("document").id);
                                }
                            } else { // WITHDRAW, CANCELDRAFT, ADVAPPROVAL(선결을 하면 예정 문서 목록으로로 가야 하나..?)
                                self.navigateToDocShow(result['data']['document']['id']);
                            }
                        }
                    },
                    error: function (model, rs) {
                        self.allowAction = true;
                        var responseObj = rs.responseJSON;
                        if (!_.isUndefined(responseObj) && responseObj.message) {
                            if (responseObj.name == "not.authorized.canceldraft.read" || responseObj.name == "invalid.activity.status") {
                                $.goAlert(approvalLang['결재할 문서가 없습니다.'], responseObj.message, null, commonLang['닫기'], function () {
                                    if (self.options.isPopup) {
                                        window.close();
                                    } else {
                                        self.navigateToBackList();
                                    }
                                });
                            } else {
                                if (self.usePassword) {
                                    $.goError(responseObj.message, $('#apprPassword'));
                                    $('#apprPassword').addClass('enter error').focus();
                                } else {
                                    $.goError(responseObj.message);
                                }
                            }

                            return false;
                        } else {
                            $.goError(approvalLang['저장에 실패 하였습니다.']);
                            return false;
                        }
                    },
                    complete: function () {
                        preloader.release();
                    }
                });
    
                function getActivityId(params) {
                    if (params.apprAction == 'ADVAPPROVAL') {
                        return self.model.get('apprFlow').advActivityId;
                    } else if (params.apprAction == 'APPROVAL' || params.apprAction == 'RETURN') {
                        // 결재와 후결 둘다 가능한 액션 상태일때 결재를 하는 케이스
                        var isApprovalUser = self.model.get('actionCheck').isPostApprovalUser || self.model.get('actionCheck').isPostCheckUser;
                        var currentActivityId = self.model.get('apprFlow').currentActivityId;
                        var approvalActivityId = self.model.get('apprFlow').approvalActivityId;
                        return isApprovalUser && approvalActivityId ? approvalActivityId : currentActivityId;
                    } else {
                        return self.model.get('apprFlow').currentActivityId;
                    }
                }
            },

            doHold: function () {
                var self = this;
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['보류하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument(),
                    "buttons": [
                        {
                            'btext': approvalLang['보류'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "HOLD");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            doReturn: function () {
                var self = this;
                var latestCompletedActionisDraft = self.model.get('actionCheck').latestCompleteAction == 'DRAFT' ? true : false;
                var usePreviousReturn = self.model.get('actionCheck').usePreviousReturn;
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['반려하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument({
                        showPreviousReturn: !latestCompletedActionisDraft && usePreviousReturn,
                        isReturn: true
                    }),
                    "buttons": [
                        {
                            'btext': approvalLang['반려'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "RETURN");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            doAgree: function () {
                var self = this;
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['합의하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument(),
                    "buttons": [
                        {
                            'btext': approvalLang['합의'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "AGREEMENT");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            doDisagree: function () {
                var self = this;
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['반대하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument(false),
                    "buttons": [
                        {
                            'btext': approvalLang['반대'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "OPPOSITION");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            doCheck: function () {
                var self = this;
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['확인하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument(),
                    "buttons": [
                        {
                            'btext': approvalLang['확인'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "APPROVAL");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            doInspection: function () {
                var self = this;
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['결재하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument(),
                    "buttons": [
                        {
                            'btext': approvalLang['승인'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "APPROVAL");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            doAdvAppr: function () {
                var self = this;
                var buttons = [
                    {
                        'btext': approvalLang['승인'],
                        'btype': 'confirm',
                        'autoclose': false,
                        'callback': function (rs) {
                            self.saveApprAction(rs, "ADVAPPROVAL");
                        }
                    },
                    {
                        'btext': commonLang["취소"],
                        'btype': 'cancel'
                    }
                ];

                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['결재하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument({nextApproval: false}),
                    "buttons": buttons
                });
            },

            actWithdrawal: function () {
                var self = this;
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang["결재취소"],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument({inCancel: true}),
                    "buttons": [
                        {
                            'btext': commonLang["확인"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "WITHDRAW");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            actDraftWithdrawal: function () {
                var self = this;
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang["상신취소"],
                    "modal": true,
                    "draggable": true,
                    "width": 300,
                    "contents": self.getActDocument({inCancel: true, nextApproval: false}),
                    "buttons": [
                        {
                            'btext': commonLang["확인"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "CANCELDRAFT");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            actDraftWithdrawalInprogress: function () {
                var self = this;
                //시스템 연동문서 회수 불가
                if (this.model.docInfoModel.attributes.integrationActive) {
                    this.showErrorAlert(approvalLang['시스템과 연동된 문서는 문서 회수가 불가능합니다.'], approvalLang['반려를 요청하시거나 문서 담당자에게 문의해 주세요.']);
                    return;
                }
                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang["상신취소"],
                    "modal": true,
                    "draggable": true,
                    "width": 300,
                    "contents": self.getActDocument({inCancel: true, nextApproval: false}),
                    "buttons": [
                        {
                            'btext': commonLang["확인"],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveApprAction(rs, "DRAFTWITHDRAW");
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });
            },

            actReceive: function () {
                var self = this,
                    docId = self.model.get('document').documentId,
                    model = new ReceptionSaveModel(docId, "receive");

                $.goConfirm(approvalLang['접수 하시겠습니까?'], '', function () {
                    var promise = model.save({}, {type: 'PUT'});
                    promise.done(function (model, result) {
                        self.navigateToDocShow(docId);
                    });

                    promise.fail(function (model, rs) {
                        $.goError(approvalLang['접수가 실패 하였습니다.']);
                        return false;
                    });
                });
            },

            actRereceive: function () {
                var self = this,
                    docId = self.model.get('document').documentId,
                    model = new ReceptionSaveModel(docId, "rereceive");

                $.goConfirm(approvalLang['재접수 하시겠습니까?'], '', function () {
                    var promise = model.save({}, {type: 'PUT'});
                    promise.done(function (model, result) {
                        self.navigateToDocShow(docId);
                    });

                    promise.fail(function (model, rs) {
                        $.goError(approvalLang['재접수가 실패 하였습니다.']);
                        return false;
                    });
                });
            },

            cancelReception: function () {
                var self = this,
                    docId = self.model.get('document').documentId,
                    model = new ReceptionSaveModel(docId, "cancel");

                $.goConfirm(approvalLang['접수를 취소하시겠습니까?'], '', function () {
                    var promise = model.save({}, {type: 'PUT'});
                    promise.done(function (model, result) {
                        self.navigateToDocShow(docId);
                    });

                    promise.fail(function (model, rs) {
                        $.goError(approvalLang['접수취소가 실패 하였습니다.']);
                        return false;
                    });
                });
            },

            returnReception: function () {
                var self = this,
                    docId = self.model.get('document').documentId,
                    model = new ReceptionSaveModel(docId, "return");

                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang["반송하기"],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument({
                        isRecvReturned: true
                    }),
                    "buttons": [{
                        'btext': approvalLang["반송"],
                        'btype': 'confirm',
                        'autoclose': false,
                        'callback': function (rs) {
                            self.saveApprAction(rs, "RECV_RETURNED");
                        }
                    }, {
                        'btext': commonLang["취소"],
                        'btype': 'cancel'
                    }]
                });
            },

            cancelAndReturnReception: function () {
                var self = this,
                    docId = self.model.get('document').documentId,
                    model = new ReceptionSaveModel(docId, "receptioncancelandreturn");

                $.goConfirm(approvalLang['반송하시겠습니까?'], '', function () {
                    var promise = model.save({}, {type: 'PUT'});
                    promise.done(function (model, result) {
                        self.navigateToBackList();
                    });

                    promise.fail(function (model, rs) {
                        $.goError(approvalLang['반송이 실패 하였습니다.']);
                        return false;
                    });
                });
            },

            reassignReceiver: function () {
                var self = this,
                    document = this.model.get('document'),
                    docReceiverAssignView = new DocReceiverAssignView({
                        docId: this.docId,
                        receivedDocOwnerDeptId: document['receivedDocOwnerDeptId'],
                        receiverDeptId: document['receiverDeptId'],
                        receiverDeptName: document['receiverDeptName'],
                        receiverUserId: document['receiverUserId'],
                        receiverUserName: document['receiverUserName'],
                        receiverUserPositionName: document['receiverUserPositionName']
                    });

                var popup = $.goPopup({
                    "pclass": "layer_normal layer_item_move",
                    "header": approvalLang['담당자 지정'],
                    "modal": true,
                    "width": 320,
                    "allowPrevPopup": true,
                    "contents": "",
                    "buttons": [
                        {
                            'btext': approvalLang['담당자 지정'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                docReceiverAssignView.assignReceiver(function () {
                                    rs.close();
                                    self.navigateToBackList();
                                    $.goMessage(lang["담당자가 지정되었습니다"]);
                                }, function () {
                                    $.goMessage(lang["담당자를 지정할 수 없습니다"]);
                                });
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel',
                            'callback': function () {
                                if (docReceiverAssignView.slide) {
                                    docReceiverAssignView.slide.close()
                                }
                            }
                        }
                    ]
                });

                docReceiverAssignView.render(popup, "div.content");
            },

            deptFolderCopy: function () {
                var self = this;
                var sDocId = this.docId;
                var deptFolderCopyModel = new DeptFolderCopyModel();

                if (sDocId != '') {
                    var deptDocMoveLayer = $.goPopup({
                        "pclass": "layer_normal layer_doc_type_select",
                        "header": approvalLang['문서 복사'],
                        "modal": true,
                        "width": 300,
                        "contents": "",
                        "buttons": [
                            {
                                'btext': commonLang['확인'],
                                'btype': 'confirm',
                                'autoclose': false,
                                'callback': function (rs) {
                                    var targetId = (rs.find('.on span[data-folderid]').attr('data-folderid'));
                                    if (!targetId) {
                                        $.goError(approvalLang["이동하실 문서함을 선택해주십시요."], $('.list_wrap '));
                                        return false;
                                    }

                                    if (sDocId) {
                                        deptFolderCopyModel.setFolderId(targetId);
                                        deptFolderCopyModel.save({'documentId': sDocId}, {
                                            silent: true,
                                            type: 'PUT',
                                            success: function (m, r) {
                                                $.goMessage(approvalLang["선택한 항목이 복사되었습니다"]);
                                                rs.close();
                                            },
                                            error: function (model, rs) {
                                                var responseObj = rs.responseJSON;
                                                if (!_.isUndefined(responseObj) && responseObj.message) {
                                                    $.goError(responseObj.message);
                                                    return false;
                                                } else {
                                                    $.goError(commonLang['저장에 실패 하였습니다.']);
                                                    return false;
                                                }
                                            }
                                        });
                                    }
                                }
                            },
                            {
                                'btext': commonLang["취소"],
                                'btype': 'cancel'
                            }
                        ]
                    });
                } else {
                    $.goError(approvalLang["선택된 항목이 없습니다."]);
                }

                var deptDocFolderView = new DeptDocFolderView({});
                deptDocFolderView.render();
                if (sDocId != '') {
                    deptDocMoveLayer.reoffset();
                }
            },

            editApprFlow: function (option) {
                /***
                 * model에 currentDocBody를 넣어준다. 공문서 수신탭에 미리보기 사용시 이 정보가 필요함.
                 */
                var currentDocBodyContent = this.documentView.getDocBodyContents();
                var title = this.getTitle();
                this.model.set({
                    'currentDocBodyContent': currentDocBodyContent,
                    'currentTitle': title
                }, {
                    silent: true
                });
                var defaultTabSetting = option || null
                var apprFlowEditor = new ApprFlowEditor({
                    // readonly
                    apprDocumentModel: this.model,
                    saveCallback: $.proxy(function (apprDocModel) {
                        this.model.set({
                            "apprFlow": apprDocModel.get('apprFlow'),
                            "docInfo": apprDocModel.get('docInfo')
                        });
                        // ApprDocumentModel내의 하위 모델과 sync하라고 전달한다.
                        this.model.trigger('sync');
                    }, this),
                    defaultActiveTab: defaultTabSetting
                });
                apprFlowEditor.render();

                if (defaultTabSetting) {
                    $(apprFlowEditor)[0].$el.find('.maintab li[data-tabid=' + defaultTabSetting + ']').click();
                }

            },

            editDocument: function () {
                this.toolbarView.showEditType();
                this.documentView.setEditMode();
                this.$('.aside_wrapper .reply_wrap .tb_doc_info').remove();
                this.$('section.aside_wrapper').append(this.docInfoView.edit().el);
                this.formIntegrator.onEditDocument();        // 문서 '수정'버튼시 연결된 양식스크립트가 있으면 실행. GO-21704
            },

            checkSelfApproval: function () {
                var defer = when.defer();
                if (!this.model.get('actionCheck').useSelfApproval && !this.checkActivity()) {
                    defer.reject();
                } else { //1인 결재를 사용하더라도 1인 결재를 시도헀을시에 경고성 팝업창을 띄운다. GO-18952
                    var apprFlowModel = new ApprFlowModel(this.model.get('apprFlow'));
                    if (apprFlowModel.getAllActivities().length < 2) {
                        $.goConfirm(approvalLang['1인 결재 안내문구'], '', function () {
                            defer.resolve();
                        }, function () {
                            defer.reject();
                        });
                    } else {
                        defer.resolve();
                    }
                }
                return defer.promise;
            },

            checkActivity: function () {
                var apprFlowModel = new ApprFlowModel(this.model.get('apprFlow'));
                if (apprFlowModel.getAllActivities().length < 2) {
                    $.goMessage(approvalLang["결재선을 지정해 주세요."]);
                    return false;
                } else {
                    return true;
                }
            },

            checkCompleteForm: function () {
                if (!this.documentView.isCompleteRequiredForm()) {
                    $.goMessage(commonLang["필수항목을 입력하지 않았습니다."]);
                    return false;
                }

                var maxLengthCheck = this.documentView.getMaxLengthCheck();
                if (!maxLengthCheck.result) {
                    $.goMessage(GO.i18n(approvalLang['선택된 항목은 0자 이하로 입력해야합니다.'], {"arg1": maxLengthCheck.maxlength}));
                    this.documentView.setDocFocus(maxLengthCheck.errorId);
                    return false;
                }
                if (this.documentView.getTitle().length > 255) {
                    $.goMessage(GO.i18n(approvalLang['선택된 항목은 0자 이하로 입력해야합니다.'], {"arg1": 255}));
                    this.documentView.setDocFocus("subject");
                    return false;
                }
                return true;
            },

            actPostCheck: function () {
                var self = this;
                var buttons = [
                    {
                        'btext': approvalLang['승인'],
                        'btype': 'confirm',
                        'autoclose': false,
                        'callback': function (rs) {
                            self.saveApprAction(rs, "POSTCHECK");
                        }
                    },
                    {
                        'btext': commonLang["취소"],
                        'btype': 'cancel'
                    }
                ];

                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['결재하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument(),
                    "buttons": buttons
                });
            },

            actPostApproval: function () {
                var self = this;
                var buttons = [
                    {
                        'btext': approvalLang['승인'],
                        'btype': 'confirm',
                        'autoclose': false,
                        'callback': function (rs) {
                            self.saveApprAction(rs, "POSTAPPROVAL");
                        }
                    },
                    {
                        'btext': commonLang["취소"],
                        'btype': 'cancel'
                    }
                ];

                $.goPopup({
                    "pclass": "layer_normal layer_approval",
                    "header": approvalLang['결재하기'],
                    "modal": true,
                    "draggable": true,
                    "width": 500,
                    "contents": self.getActDocument(),
                    "buttons": buttons
                });
            },

            saveDocReceive: function (rs) {
                var self = this;
                var docId = self.model.get('document').documentId;
                var deptId = self.model.get('actionCheck').receptAddDeptId;
                var model = new DocReceiveModel(docId, deptId.join(','));
                var readers = this.docReceiveView.getReaders();

                if (!self.isExist && readers.length == 0) {
                    $.goMessage(approvalLang["선택된 대상이 없습니다."]);
                    return false;
                }

                var docInfoData = {
                    "id": docId,
                    "docReadingReaders": readers
                };

                model.set(docInfoData, {silent: true});
                model.save({}, {
                    type: 'PUT',
                    success: function (model, result) {
                        if (result.code == 200) {
                            rs.close();
                            if (self.isExist && readers.length == 0) {
                                $.goMessage(approvalLang["수신자가 삭제 되었습니다."]);
                            } else {
                                $.goMessage(approvalLang["수신자가 추가 되었습니다."]);
                            }
                        }
                    },
                    error: function (model, rs) {
                        var responseObj = rs.responseJSON;
                        if (!_.isUndefined(responseObj) && responseObj.message) {
                            $.goError(responseObj.message);
                            return false;
                        } else {
                            $.goError(approvalLang['수신자추가에 실패 하였습니다.']);
                            return false;
                        }
                    }
                });
            },

            addReader: function (data) {
                var targetEl = $('#addReceive');
                if (data && !targetEl.find('li[data-id="' + data.id + '"]').length) {
                    targetEl.find('li.creat').before(tplAddMember($.extend(data, {lang: lang})));
                } else {
                    $.goMessage(approvalLang["이미 선택되었습니다."]);
                }
            },

            actAddFolder: function () {
                var self = this;
                var actAddFolderLayer = $.goPopup({
                    "pclass": "layer_normal detail_search_wrap layer_approval_reader",
                    "header": approvalLang['문서분류 추가'],
                    "modal": true,
                    "width": 300,
                    "contents": "",
                    "buttons": [
                        {
                            'btext': commonLang['확인'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                self.saveDocFolder(rs);
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel'
                        }
                    ]
                });

                this.docFolderTypeView = new DocFolderTypeView({
                    defaultFolder: this.model.get('docInfo')['defaultFolder'],
                    docId: this.docId
                });

                this.docFolderTypeView.render();
                actAddFolderLayer.reoffset();
            },

            saveDocFolder: function (rs) {
                var model = new DocFolderTypeModel(this.model.get('document').documentId),
                    ids = this.docFolderTypeView.getFolderIds();

                if (ids.length == 0) {
                    $.goMessage(approvalLang["선택된 대상이 없습니다."]);
                    return false;
                }

                model.set({'ids': ids}, {silent: true});
                model.save({}, {
                    type: 'PUT',
                    success: function (model, result) {
                        if (result.code == 200) {
                            rs.close();
                            $.goMessage(approvalLang['문서함이 추가되었습니다.']);
                        }
                    },
                    error: function (model, rs) {
                        var responseObj = rs.responseJSON;
                        if (!_.isUndefined(responseObj) && responseObj.message) {
                            $.goError(responseObj.message);
                            return false;
                        } else {
                            $.goError(approvalLang['문서함 추가에 실패하였습니다.']);
                            return false;
                        }
                    }
                });
            },

            showApprChangeLog: function (model) {
                var docBody = model.docBody;
                var docAttaches = model.attaches;
                var docReferences = model.references;

                // 전사 문서함 관련 설정 처리
                var action = this.model.get("actionCheck");
                if (!action.companyDocFolderUseFlag) {
                    docReferences = null;
                }

                var printStyleOption = 'font-size:12px; font-family:돋움,dotum,AppleGothic,arial,Helvetica,sans-serif; color:#3b3b3b; line-height:1.5';

                var buttons = [{
                    'btext': commonLang['인쇄'],
                    'btype': 'confirm',
                    'callback': function () {
                        GO.util.print($("#printArea"));
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }];

                //GO-26902 문서에 대해 실제 열람 권한이 없을 경우, 인쇄 불가능
                if (!action.isDocReadAuthority) {
                    buttons = [{
                        'btext': commonLang["취소"],
                        'btype': 'cancel'
                    }];
                }

                var printLayer = $.goPopup({
                    "pclass": "layer_normal layer_approval_preview",
                    "header": approvalLang['결재문서 보기'],
                    "modal": true,
                    "width": 900,
                    "contents": "",
                    "buttons": buttons
                });
                var documentPrintView = new DocumentPrintView({
                    docId: this.model.docId,
                    popup: printLayer,
                    docBody: docBody,
                    attaches: docAttaches,
                    references: docReferences
                });

                documentPrintView.render();
                printLayer.reoffset();
            },

            /*
         * 방어코드
         * 전자결재 양식에 select 컴포넌트가 없을때 select를 커스터마이징한 경우 인쇄할때 select 박스가 그대로 노출됨
         * 원인은 DB에 select tag가 저장되기때문임.
        */
            convertSelect: function (data) {

                $.each(data.find('select'), function (index, selectEl) {
                    var selectWrapSpan = $(selectEl).parent('span');
                    var selectValue = selectWrapSpan.attr('data-selecttext');
                    $(selectEl).remove();
                    selectWrapSpan.text(selectValue);
                });
            },
            /**/
            docPrint: function () {
                var url = this.model.getFullShowUrl() + "/popup/print";
                window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
            },
            downloadDocument: function () {
                window.location.href = GO.contextRoot + "api/approval/document/" + this.docId + "/download";
            },
            documentPreview: function () {
                this.$el.find('#document_content').data('instance', this);
                var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + "app/approval/document/" + this.docId + "/preview";
                window.open(url, 'docPreview', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
            },

            reassignDept: function () {
                var self = this,
                    document = this.model.get('document'),
                    docReceptionDeptAssignView = new DocReceptionDeptAssignView({
                        docId: this.docId,
                        receiverDeptId: document['receiverDeptId'],
                        receiverUserId: document['receiverUserId']
                    });

                var popup = $.goPopup({
                    "pclass": "layer_normal layer_item_move",
                    "header": approvalLang['담당자 부서 지정'],
                    "modal": true,
                    "width": 320,
                    "allowPrevPopup": true,
                    "contents": "",
                    "buttons": [
                        {
                            'btext': commonLang['확인'],
                            'btype': 'confirm',
                            'autoclose': false,
                            'callback': function (rs) {
                                docReceptionDeptAssignView.assignReceiver(function () {
                                    rs.close();
                                    self.navigateToBackList();
                                    $.goMessage(lang["담당자가 지정되었습니다"]);
                                }, function () {
                                    $.goMessage(lang["담당자를 지정할 수 없습니다"]);
                                });
                            }
                        },
                        {
                            'btext': commonLang["취소"],
                            'btype': 'cancel',
                            'callback': function () {
                            }
                        }
                    ]
                });

                docReceptionDeptAssignView.render(popup, "div.content");
            },

            docTypeSelect: function () {
                var self = this;
                var docTypeSelectViewLayer = $.goPopup({
                    "pclass": "layer_normal layer_doc_type_select layer_depth",
                    "header": approvalLang['전사문서함 선택'],
                    "modal": true,
                    "width": 300,
                    "contents": "",
                    "buttons": [
                        {
                            'btext': commonLang['추가'],
                            'autoclose': false,
                            'btype': 'confirm',
                            'callback': function (rs) {
                                var check = docTypeSelectView.doc_type_confirm();
                                if (check) {
                                    self.docFolderSelect(true);
                                } else {
                                    return false;
                                }
                            }
                        },
                        {
                            'btext': commonLang["닫기"],
                            'btype': 'cancel'
                        }
                    ]
                });

                var docTypeSelectView = new DocTypeSelectView({});
                docTypeSelectView.render();
                docTypeSelectViewLayer.reoffset();
            },

            docFolderSelect: function (isPublic) {
                var isReception = this.model.get('document')['isReceptionDocument'];
                if (isReception) {
                    return;
                }

                var docFolder = [];
                var docFolderPart = $("#addFolder").find('li[data-id]');
                docFolderPart.each(function () {
                    docFolder.push({
                            id: $(this).attr("data-id"),
                            parentName: $(this).attr("data-folderName")
                        }
                    );
                }, this);
                this.model.get('docInfo')['docFolders'] = docFolder;
                this.documentView.setDocClassification(_.pluck(docFolder, 'parentName'));
            },

            securityLevelSelect: function () {
                var isReception = this.model.get('document')['isReceptionDocument'];
                if (isReception) {
                    return;
                }

                this.documentView.setSecurityLevel($("#infoSecurityLevel option:selected").text());
            },

            docYearSelect: function () {
                var isReception = this.model.get('document')['isReceptionDocument'];
                if (isReception) {
                    return;
                }

                this.documentView.setPreserveDuration($("#docYear option:selected").text());
            },

            docReferenceSelect: function () {
                var isReception = this.model.get('document')['isReceptionDocument'];
                if (isReception) {
                    return;
                }

                var referencesData = [];
                var referencesPart = $("#addReference").find('li[data-id]');
                referencesPart.each(function () {
                    referencesData.push($(this).attr("data-username") + " " + $(this).attr("data-userposition"));
                });
                this.documentView.setDocReference(referencesData);
            },

            docReceiveSelect: function () {
                var isReception = this.model.get('document')['isReceptionDocument'];
                if (isReception) {
                    return;
                }

                var receiveData = [];
                var receivePart = $("#addReceive").find('li[data-id]');
                receivePart.each(function () {
                    receiveData.push($(this).attr("data-username") + " " + $(this).attr("data-userposition"));
                });
                this.documentView.setRecipient(receiveData);
            },

            // 제거
            release: function () {
                this.$el.off();
                this.$el.empty();
            },

            assign: function (view, selector) {
                view.setElement(this.$(selector)).render();
            },

            append: function (view, selector) {
                this.$(selector).append(view.render().el);
            },

            navigateToTodoList: function (id) {
                if (!this.options.isPopup) {
                    GO.router.navigate("/approval/todo/all", {trigger: true});
                } else {
                    GO.router.navigate("/approval/document/" + id + "/popup", {trigger: true});
                }
            },

            navigateToDraftList: function () {
                if (!this.options.isPopup) {
                    if (this.model.get('document').docStatus == "TEMPSAVE") {
                        GO.router.navigate("/approval/doclist/tempsave/all", {trigger: true});
                    } else {
                        GO.router.navigate("/approval/doclist/draft/all", {trigger: true});
                    }
                } else {
                    console.info("navigateToDraftList");
                }
            },

            navigateToDocShow: function (id) {
                if (!this.options.isPopup) {
                    GO.router.navigate("/approval/document/" + id, {trigger: true});
                } else {
                    GO.router.navigate("/approval/document/" + id + "/popup", {trigger: true});
                }
            },

            navigateToHome: function () {
                GO.router.navigate("/approval", {trigger: true});
            },

            navigateToBackList: function () {
                var baseUrl = sessionStorage.getItem('list-history-baseUrl');
                if (baseUrl) {
                    var search = $.param(GO.router.getSearch());
                    var url = search ? "?" + search : "";
                    GO.router.navigate(baseUrl + url, {trigger: true});
                } else {
                    GO.router.navigate('approval', {trigger: true});
                }
            },

            appliedAutoApprErrorMessage: function() {
                $.goMessage(approvalLang['자동결재선 적용부서 오류']);
            }
        });

        return MainView;

    });
