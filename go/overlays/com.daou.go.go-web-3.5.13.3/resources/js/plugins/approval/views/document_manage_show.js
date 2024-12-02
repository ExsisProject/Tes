define([
    "jquery",
    "underscore",
    "backbone",
    "app",

    "hgn!approval/templates/document/main",
    "hgn!approval/templates/document/action_document",
    "hgn!approval/templates/document/force_return_document",
    "hgn!approval/templates/document/actcopy",
    "hgn!approval/templates/add_org_member",

    "approval/models/appr_flow",
    "approval/models/document",
    "approval/models/document_reader",
    "approval/models/document_manage",
    "approval/models/appr_master_auth",

    "approval/views/content_top",
    "approval/views/document_manage_toolbar",
    "approval/views/document/document",
    "approval/views/document/apprflow_editor",
    "approval/views/document/apprflow",

    "approval/views/document/doc_receive",
    "approval/views/document/doc_receiver_assign",
    "approval/views/document/doc_foldertype",
    "approval/views/document/docinfo",
    "approval/views/document/dochistory",
    "approval/views/document/reader_history_list",
    "approval/views/document/reception_document_list",
    "approval/views/document/official_doc_receiver_list",

    "approval/views/document/doc_type_select",
    "approval/views/document/dept_folder",
    "approval/views/document/document_print",
    "approval/views/side",

    "approval/components/appr_form_integrator",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
],
function (
    $,
    _,
    Backbone,
    App,

    MainTpl,
    ActDocumentTpl,
    ForceReturnTpl,
    ActCopyTpl,
    tplAddMember,

    ApprFlowModel,
    DocumentModel,
    DocReaderModel,
    DocumentManageModel,
    ApprMasterAuthModel,

    ContentTopView,
    ToolbarView,
    DocumentView,
    ApprFlowEditor,
    ApprFlowView,

    DocReceiveView,
    DocReceiverAssignView,
    DocFolderTypeView,
    DocInfoView,
    DocHistoryView,
    ReaderHistoryListView,
    ReceptionDocumentListView,
    OfficialDocReceiverListView,

    DocTypeSelectView,
    DeptDocFolderView,
    DocumentPrintView,
    SideView,

    FormIntegrator,
    commonLang,
    approvalLang
) {
    var lang = {
        "결재문서명": approvalLang['결재문서명'],
        "기안자": approvalLang['기안자'],
        "기안부서": approvalLang['기안부서'],
        "결재자": approvalLang['결재자'],
        "반려자": approvalLang['반려자'],
        "기안의견": approvalLang['기안의견'],
        "결재의견": approvalLang['결재의견'],
        "반려댓글": approvalLang['반려댓글'],
        "결재비밀번호": approvalLang['결재비밀번호'],
        "결재옵션": approvalLang['결재옵션'],
        "결재선": approvalLang['결재선'],
        "문서정보": approvalLang['문서정보'],
        "변경이력": approvalLang['변경이력'],
        "공문발송": approvalLang['공문발송'],
        "반려하기": approvalLang['반려하기'],
        "열람자 추가": approvalLang['열람자 추가'],
        "의견을 작성해 주세요": approvalLang['의견을 작성해 주세요'],
        "입력한 내용은 해당 결재문서의 댓글에 기록됩니다": approvalLang['입력한 내용은 해당 결재문서의 댓글에 기록됩니다'],
        '다음문서로이동': approvalLang['다음문서로이동'],
        '다음문서로이동설명': approvalLang['다음문서로이동설명'],
        '열람기록': approvalLang['열람기록'],
        '수신': approvalLang['수신'],
        '반송하기': approvalLang['반송하기'],
        '반송자': approvalLang['반송자'],
        '반송댓글': approvalLang['반송댓글'],
        '강제 반송 시 댓글을 필수로 입력해야 하며 해당 수신문서의 댓글에 기록됩니다': approvalLang['강제 반송 시 댓글을 필수로 입력해야 하며 해당 수신문서의 댓글에 기록됩니다'],
        '강제 반려 시 댓글을 필수로 입력해야 하며 해당 결재문서의 댓글에 기록됩니다': approvalLang['강제 반려 시 댓글을 필수로 입력해야 하며 해당 결재문서의 댓글에 기록됩니다'],
    };

    var __ajaxSending__ = false;
    var MainView = Backbone.View.extend({
        viewerTypes: ['docmaster', 'formadmin', 'officialdocmaster'],
        el: '#content',
        masterAuthModel: null,
        events: {
            'click .tab_nav > li': 'selectTab',
            'click #addReading span.ic_del': 'readingDeleteItem',
            'click #prev': '_agoSlide',
            'click #next': '_nxtSlide'
        },

        initialize: function (options) {
            this.options = options || {};
            this.docId = this.options.docId;
            this.type = "DOCUMENT";
            this.viewerType = this.options.viewerType;
            if (!_.contains(this.viewerTypes, this.viewerType)) {
                throw new Error('지원하지 않는 타입입니다.');
            }

            this.documentInit();
        },

        documentInit: function () {
            this.formIntegrator = new FormIntegrator();
            this.model = DocumentManageModel.create(this.docId, this.viewerType);
            this.model.fetch({
                async: false,
                statusCode: {
                    403: function () {
                        GO.util.error('403');
                    },
                    404: function () {
                        GO.util.error('404', {"msgCode": "400-common"});
                    },
                    500: function () {
                        GO.util.error('500');
                    }
                },
                reset: true
            });
            this.masterAuthModel = new ApprMasterAuthModel({docId: this.docId});
            this.masterAuthModel.fetch({
                async: false,
                statusCode: {
                    403: function () {
                        GO.util.error('403');
                    },
                    404: function () {
                        GO.util.error('404', {"msgCode": "400-common"});
                    },
                    500: function () {
                        GO.util.error('500');
                    }
                }
            });

            this.title = '<span class="txt single_tit" title="' + this.model.get('document').title + '">' + this.model.get('document').title + '</span>';

            this.docId = this.model.get('document').documentId;


            // 양식연동 관련 데이타 저장
            this.formIntegrator.setDocVariables(this.model.get('document').variables);
            this.formIntegrator.setStatus(this.type == "REAPPLY" ? this.type : this.model.get('document').docStatus);

            /**
             * [GO-17079] 전자결재> 전사 공문 발송함> 결재 정보> 열람자 추가해도 열람 권한이 생기지 않는 현상
             * - 결재 정보 UI에서 수정할 수 있으면 서버로 전송하도록 변경
             */
            this.listenTo(this.model, "change", this.changeApprFlowAndDocInfo, this);

            this.isPassword = this.model.get('actionCheck').usePassword;
            this.isManageable = (this.viewerType == 'docmaster' || this.viewerType == 'formadmin');
            this.toolbarView = new ToolbarView({
                isManageable: this.isManageable,
                docStatus: this.model.get('document').docStatus,
                actionCheck: this.model.get('actionCheck'),
                masterAuthModel: this.masterAuthModel
            });

            if (this.isManageable) {
                if (this.masterAuthModel.authRead()) {
                    this.toolbarView.bind('editApprFlow', this.editApprFlow, this);
                }

                if (this.masterAuthModel.authWrite()) {
                    this.toolbarView.bind('saved', this.saveDocument, this);
                    this.toolbarView.bind('canceled', this.cancelEdit, this);
                    this.toolbarView.bind('edit', this.editDocument, this);
                    this.toolbarView.bind('forceReturn', this.actForceReturn, this);
                    this.toolbarView.bind('forceRecvReturned', this.actForceRecvReturned, this);
                    this.toolbarView.bind('cancelReception', this.actCancelReception, this);
                    this.toolbarView.bind('reassignReceiver', this.actReassignReceiver, this);
                }

                if (this.masterAuthModel.authRemove()) {
                    this.toolbarView.bind('deleted', this.deleteDocument, this);
                }
            } else {
                this.toolbarView.bind('editApprFlow', this.editApprFlow, this);
            }

            this.toolbarView.bind('docPrint', this.docPrint, this);
            this.toolbarView.bind('actList', this.actList, this);

            this.documentView = new DocumentView({
                type: this.type,
                docId: this.model.get('document').documentId,
                model: this.model.get('document'),
                infoData: this.model.get("docInfo"),
                actionModel: this.model.get('actionCheck'),
                formIntegrator: this.formIntegrator
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
                isReceptionDocument: this.model.get('document')['isReceptionDocument']
            });

            this.docInfoView.bind('docTypeSelect', this.docTypeSelect, this);
            this.docInfoView.bind('docFolderSelect', this.docFolderSelect, this);
            this.docInfoView.bind('securityLevelSelect', this.securityLevelSelect, this);
            this.docInfoView.bind('docYearSelect', this.docYearSelect, this);
            this.docInfoView.bind('docReferenceSelect', this.docReferenceSelect, this);
            this.docInfoView.bind('docReceiveSelect', this.docReceiveSelect, this);
            this.docInfoView.bind('showOrgSlider', this.showOrgSlider, this);

            if (this.isManageable) {
                this.docInfoView.bind('saveDocReader', this.saveDocReader, this);
            }

            this.docHistoryView = new DocHistoryView({model: this.model});
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
            this.contentTop.setTitle(this.title);
            SideView.apprSelectSideMenu(sessionStorage.getItem('list-history-baseUrl'));

            // 전사 문서함 관련 설정 처리
            var action = this.model.get("actionCheck");
            if (!action.companyDocFolderUseFlag) {
                $("#refDocPart").hide();
                $("#companyDocFolderUse").hide();
                $("#act_addFolder").hide();
            }
        },
        //docustom-7788
        showPreserveYears: function (year) {
            return (year == 0) ? approvalLang['영구'] : year + approvalLang['년']
        },
        //docustom-7788
        showOrgSlider: function (e) {
            var self = this;
            return $.goOrgSlide({
                header: approvalLang["열람자 선택"],
                type: 'list',
                contextRoot: GO.contextRoot,
                callback: self.addReading
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

        // 시행문인 경우 사용되는 것으로 파악
        readingDeleteItem: function (e) {
            $(e.currentTarget).parents('li').remove();
        },

        render: function () {
            this.setSlideConfig();
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

            this.showApprFlow();
//docustom-7788
            var setData = {
                preserveDuration: $("#docYear option:selected").text() || this.showPreserveYears(this.model.get('docInfo').docYear)
            };
            this.documentView.setApprovalData(setData);
            //docustom-7788

            $('.tab_nav > li').removeClass('on');
            $('.tab_nav > li > span').removeClass('txt_b');
            $('#tab_apprflow').addClass('on');

            this.contentTop.render();
            this.$el.find('header.content_top').replaceWith(this.contentTop.el);
        },

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

        changeApprFlowAndDocInfo: function () {
            var self = this,
                apprFlow = this.model.get('apprFlow'),
                isReception = this.model.get('document')['isReceptionDocument'],
                apprFlowVersionId = this.model.get('document')['apprFlowVersionId'];

            // 요청 중이면 중복 실행하지 않는다.
            if (__ajaxSending__) return;

            if (!_.isUndefined(this.model.get('document').apprFlowVersionId)) {
                apprFlow['apprFlowVersionId'] = this.model.get('document').apprFlowVersionId;
            };

            this.model.Request.updateDocMetainfo({masterChange: true}, {
                beforeSend: function () {
                    __ajaxSending__ = true;
                    GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
                },
                success: function (model) {
                    onApprFlowUpdated(self);
                },
                error: function (model, error) {
                    var responseData = JSON.parse(error.responseText);
                    var message = responseData.message;
                    $.goError(message);
                },
                complete: function () {
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    __ajaxSending__ = false;
                }
            });
        },

        changeActivityGroups: function (activityGroups, isReception) {
            this.documentView.changeActivityGroups(activityGroups, isReception);
            this.apprFlowView.makeApprFlow(activityGroups);
        },

        getActDocument: function (isDraft, isCancel) {
            var formName = this.model.get('document').formName;
            var subject = this.documentView.getTitle();
            var documentTitle = this.model.get('document').title ? subject ? subject : this.model.get('document').title : subject ? subject : formName;
            var userInfo = $("#apprflow").find('div[data-userId=' + GO.session().id + ']');
            var userName = $(userInfo).attr('data-userName') + " " + $(userInfo).attr('data-userPosition');
            var userDept = $(userInfo).attr('data-userDeptName');
            var isEmergency = $('#emergency').is(':checked');

            if (!$(userInfo).attr('data-userName')) {
                userInfo = this.model.get('apprFlow').currentUserId;
                userName = this.model.get('apprFlow').currentUserName + " " + this.model.get('apprFlow').currentUserPositionName;
                userDept = this.model.get('apprFlow').currentUserDeptName;
            }

            return contents = ActDocumentTpl({
                isPassword: this.isPassword,
                lang: lang,
                isDraft: isDraft,
                documentTitle: documentTitle,
                userName: userName,
                userDept: userDept,
                isEmergency: isEmergency,
                isCancel: isCancel ? true : false
            });
        },

        getForceReturnContents: function (data) {
            var subject = this.documentView.getTitle();
            //우선순위 : 1. documentView의 title 2. document의 title, 3. document의 formname
            var title = this.model.get('document').title ? (subject ? subject : this.model.get('document').title) : (subject ? subject : this.model.get('document').formName);
            var userName = GO.session().name + " " + GO.session().position;
            var userDept = '';

            return ForceReturnTpl({
                lang: lang,
                documentTitle: title,
                userName: userName,
                userDept: userDept,
                useForceReturn: data.useForceReturn,
                useForceRecvReturned: data.useForceRecvReturned,
            });
        },

        saveDocument: function () {
            var self = this;
            if (!self.checkActivity()) {
                return false;
            }
            if (!self.checkCompleteForm()) {
                return false;
            }
            if (!this.formIntegrator.validate()) {
                return false;
            }

            $.goConfirm(approvalLang['저장하시겠습니까?'], '', function () {
                var docId = self.model.get('document').documentId;
                var apprFlow = self.model.get('apprFlow');
                var model = DocumentModel.create(docId);
                var docVersionId = self.model.get('document').docVersionId;

                self.formIntegrator.beforeSave();

                model.set({
                    'document': self.getDocumentData(docId),
                    'docInfo': self.getDocInfoData(docId),
                    'apprFlow': apprFlow,
                    'docVersionId': docVersionId,
                    'masterChange': true
                }, {
                    silent: true
                });

                model.save({}, {
                    type: 'PUT',
                    success: function (model, result) {
                        if (result.code == 200) {
                            self.documentInit();
                            self.render();
                            $.goMessage(approvalLang["저장이 완료되었습니다."]);
                            self.formIntegrator.afterSave();
                        }
                    },
                    error: function (model, rs) {
                        var responseObj = JSON.parse(rs.responseText);
                        if (responseObj.message) {
                            $.goError(responseObj.message);
                            return false;
                        } else {
                            $.goError(commonLang['저장에 실패 하였습니다.']);
                            return false;
                        }
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
                });
        },

        getDocumentData: function (docId, docStatus) {
            var subject = this.documentView.getTitle();
            //우선순위 : 1. documentView의 title 2. document의 title, 3. document의 formname
            var title = this.model.get('document').title ? (subject ? subject : this.model.get('document').title) : (subject ? subject : this.model.get('document').formName);
            var variables = this.formIntegrator.getDocVariables() || this.documentView.getDocVariables();
            return documentData = {
                "id": docId,
                "documentId": docId,
                "docStatus": docStatus,
                "attachCount": 0,
                "attaches": this.getAttachData(),
                "comments": this.getCommentsData(),
                "references": this.getReferencesData(),
                "docBodyContent": this.getDocBodyContentData(),
                "title": title,
                "variables": variables,
                "updatedAt": this.model.get("document").updatedAt
            };
        },

        getAttachData: function () {
            var attachesData = [];
            var attachPart = $("#attachPart").find('li[data-tmpname]:not(.attachError)');

            attachPart.each(function () {
                attachOpt = {};
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
            return docInfoData = {
                "id": docId,
                "securityLevelId": $('#infoSecurityLevel').val(),
                "docYear": $('#docYear').val(),
                "docFolders": self.getDocFolderData(),
                "docReceptionReaders": self.getDocReceptionReadersData(),
                "docReferenceReaders": self.getDocReferenceReadersData(),
                "docReadingReaders": self.getDocReadingReadersData(),
                "isPublic": $(':radio[name="openType"]:checked').val(),
                "isEmergency": $('#emergency').is(':checked')
            };
        },

        //문서분류 추가
        getDocFolderData: function () {
            var docFolder = [];
            var docFolderPart = $("#addFolder").find('li[data-id]');
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
                    id: $(this).attr("data-sid"), reader: {
                        id: $(this).attr("data-userId"),
                        name: $(this).attr("data-userName"),
                        position: $(this).attr("data-userPosition"),
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

        getDocReadingReadersData: function () {
            var docReadingReaders = [];
            var docReadingReadersPart = $("#addReading").find('li[data-id]');
            docReadingReadersPart.each(function () {
                docReadingReaders.push({
                    id: $(this).attr("data-sid"),
                    reader: {
                        id: $(this).attr("data-userId"),
                        name: $(this).attr("data-userName"),
                        position: $(this).attr("data-userPosition"),
                        deptType: $(this).attr("data-deptType")
                    }
                });
            });
            return docReadingReaders;
        },
        getTitle: function () {
            var formName = this.model.get('document').formName;
            var subject = this.documentView.getTitle();
            var documentTitle = this.model.get('document').title ? subject ? subject : this.model.get('document').title : subject ? subject : formName;
            return documentTitle;
        },
        editApprFlow: function () {
            var currentDocBodyContent = this.documentView.getDocBodyContents();
            var title = this.getTitle();
            this.model.set({
                'currentDocBodyContent': currentDocBodyContent,
                'currentTitle': title
            }, {
                silent: true
            });

            var apprFlowEditor = new ApprFlowEditor({
                apprDocumentModel: this.model,
                viewerType: this.viewerType,
                masterAuthModel: this.masterAuthModel,
                saveCallback: $.proxy(function (apprDocModel) {
                    var prevWaitActivityIds = this.model.getWaitActivites();
                    this.model.set({
                        "apprFlow": _.extend(apprDocModel.get('apprFlow'), {"prevWaitActivityIds" : prevWaitActivityIds}),
                        "docInfo": apprDocModel.get('docInfo')
                    });
                    // ApprDocumentModel내의 하위 모델과 sync하라고 전달한다.
                    this.model.trigger('sync');
                }, this)
            });
            apprFlowEditor.render();
        },

        /**
         * 결재선 UI에서 문서정보들(참조자/수신자/열람자/공문서 수신처)가 변경되었을 경우 사이드의 문서 정보탭을 업데이트.
         * @param Object docInfoAttrs ApprDocumentModel의 docInfo 속성
         * @since 1.6.5
         * @author Bongsu Kang(kbsbroad@daou.co.kr)
         */
        changeDocInfo: function (docInfoAttrs) {
            // 다시 그린다
            this.docInfoView.updateDocInfo(docInfoAttrs);
        },

        actForceReturn: function () {
            var self = this;
            var header = approvalLang['반려하기'];
            var btext = approvalLang['반려'];
            var action = {
                useForceReturn: true,
                useForceRecvReturned: false
            };
            var contents = self.getForceReturnContents(action);
            var callback = function (rs) {
                self.forceReturn(rs, action);
            }
            self.actForce(header, btext, contents, callback);
        },

        actForceRecvReturned: function () {
            var self = this;
            var header = approvalLang['반송하기'];
            var btext = approvalLang['반송'];
            var action = {
                useForceReturn: false,
                useForceRecvReturned: true
            };
            var contents = self.getForceReturnContents(action);
            var callback = function (rs) {
                self.forceReturn(rs, action);
            }
            self.actForce(header, btext, contents, callback);
        },

        actForce: function (header, btext, contents, callback) {
            $.goPopup({
                "pclass": "layer_normal",
                "header": header,
                "modal": true,
                "width": 500,
                "contents": contents,
                "buttons": [{
                    'btext': btext,
                    'btype': 'confirm',
                    'autoclose': false,
                    'callback': callback
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
            });
        },

        actCancelReception: function () {
            var self = this;
            var docId = self.model.get('document').documentId;
            var url = [GO.config('contextRoot') + 'api/approval/document', docId, 'receptioncancel'].join('/');

            $.goConfirm(approvalLang['접수를 취소하시겠습니까?'], '', function() {
                $.ajax(url, {type: 'PUT', contentType: 'application/json', dataType: 'json'})
                .done(function (data) {
                    self.documentInit();
                    self.render();
                })
                .fail(function (data) {
                    var responseObj = JSON.parse(data.responseText);
                    if (!_.isUndefined(responseObj) && responseObj.message) {
                        $.goError(responseObj.message);
                        return false;
                    } else {
                        $.goError(commonLang["500 오류페이지 타이틀"]);
                        return false;
                    }
                });
            });
        },

        actReassignReceiver: function () {
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
                "buttons": [{
                    'btext': approvalLang['담당자 지정'],
                    'btype': 'confirm',
                    'autoclose': false,
                    'callback': function (rs) {
                        docReceiverAssignView.assignReceiver(function () {
                            rs.close();
                            self.navigateToBackList();
                            $.goMessage(approvalLang["담당자가 지정되었습니다"]);
                        }, function () {
                            $.goMessage(approvalLang["담당자를 지정할 수 없습니다"]);
                        });
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel',
                    'callback': function () {
                        if (docReceiverAssignView.slide) {
                            docReceiverAssignView.slide.close()
                        }
                    }
                }]
            });

            docReceiverAssignView.render(popup, "div.content");
        },

        _editDocument: function () {
            var isApprDocManager = true; //결재문서 관리자일경우 docInfo에 기안부서는 수정할수 없다
            this.toolbarView.showEditType();
            this.documentView.setEditMode();
            this.$('.aside_wrapper .reply_wrap .tb_doc_info').remove();
            this.$('section.aside_wrapper').append(this.docInfoView.edit(isApprDocManager).el);
            // GO-24585 전자결재 관리자 양식별 문서조회 메뉴에서 문서수정시 스크립트 오동작 수정
            this.formIntegrator.onEditDocument();
        },

        editDocument: function(){
            var self = this;
            var needToRenderPopup = _.includes(this.model.get("docInfo").externalScript,"vacation-sample");

            if(!needToRenderPopup) {
                this._editDocument();
                return;
            }

            var popupContents = approvalLang["연차연동문서 수정 경고 메세지"];

            var editButton = {
                btext: commonLang['수정'],
                btype: "confirm",
                callback: function () {
                    self._editDocument();
                }
            };

            var cancelButton = {
                btext: commonLang['취소'],
                btype: 'normal'
            };

            var popupButtons = [editButton, cancelButton];

            $.goPopup({
                width: 400,
                closeIconVisible: false,
                pclass: "layer_normal",
                contents: popupContents,
                buttons: popupButtons
            });
        },

        // 결재 정보 유무
        checkActivity: function () {
            if ($("#apprflow").find('div[data-userid]').length < 1) {
                $.goMessage(approvalLang["결재선을 지정해 주세요."]);
                return false;
            } else {
                return true;
            }
        },

        // 필수항목 체크
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
            return true;
        },

        forceReturn: function (rs, action) {
            var self = this;
            var docId = self.model.get('document').documentId;
            var comment = $("#textarea-desc").val();
            if ($.trim(comment) == '') {
                $.goError(approvalLang['의견을 작성해 주세요'], $('#textarea-desc'));
                $('#textarea-desc').addClass('enter error').select();
                return false;
            }

            var type = "forcereturn";
            var content = {'comment' : '[' + approvalLang['강제반려'] + '] ' + comment};

            if(action.useForceRecvReturned) {
                type = "forcereturnreception";
                content = {'comment' : '[' + approvalLang['강제반송'] + '] ' + comment};
            }

            var forceReturnUrl = [GO.config('contextRoot') + 'api/approval/document', docId, type].join('/');

            $.ajax(forceReturnUrl, {
                type: 'PUT',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(content)
            }).done(function (data) {
                rs.close();
                self.documentInit();
                self.render();
            }).fail(function (data) {
                var responseObj = JSON.parse(data.responseText);
                if (!_.isUndefined(responseObj) && responseObj.message) {
                    $.goError(responseObj.message);
                    return false;
                } else {
                    $.goError(commonLang["500 오류페이지 타이틀"]);
                    return false;
                }
            });
        },

        saveDocReader: function () {
            var self = this;
            var docId = self.model.get('document').documentId;
            var model = new DocReaderModel(docId);
            var docReadingReaders = [];
            var docReadingReadersPart = $("#addReading").find('li[data-id]');
            if (!self.isReaderExist && docReadingReadersPart.length == 0) {
                $.goMessage(approvalLang["선택된 대상이 없습니다."]);
                return false;
            }

            docReadingReadersPart.each(function () {
                docReadingReaders.push({
                    id: $(this).attr("data-sid"),
                    reader: {
                        id: $(this).attr("data-userId"),
                        name: $(this).attr("data-userName"),
                        position: $(this).attr("data-userPosition"),
                        deptId: $(this).attr("data-userDeptId"),
                        deptType: false
                    }
                });
            });

            var docReaderData = {
                "id": docId,
                "docReadingReaders": docReadingReaders
            };

            model.set(docReaderData, {silent: true});
            model.save({}, {
                type: 'PUT',
                success: function (model, result) {
                    if (result.code == 200) {
                        if (self.isReaderExist && docReadingReadersPart.length == 0) {
                            self.isReaderExist = false;
                            $.goMessage(approvalLang["열람자가 삭제 되었습니다."]);
                        } else {
                            self.isReaderExist = true;
                            $.goMessage(approvalLang["열람자가 추가 되었습니다."]);
                        }
                    }
                },
                error: function (model, rs) {
                    var responseObj = JSON.parse(rs.responseText);
                    if (responseObj.message) {
                        $.goError(responseObj.message);
                        return false;
                    } else {
                        $.goError(approvalLang['열람자추가에 실패 하였습니다.']);
                        return false;
                    }
                }
            });
        },

        showApprChangeLog: function (model) {
            var docBody = model.docBody;
            var docAttaches = model.attaches;
            var docReferences = model.references;
            var printLayer = $.goPopup({
                "pclass": "layer_normal layer_approval_preview",
                "header": approvalLang['결재문서 보기'],
                "modal": true,
                "width": 900,
                "contents": "",
                "buttons": [{
                    'btext': commonLang['인쇄'],
                    'btype': 'confirm',
                    'callback': function () {
                        GO.util.print($("#printArea"));
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
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

        actList: function () {
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            if (baseUrl) {
                GO.router.navigate(baseUrl + "?" + $.param(GO.router.getSearch()), {trigger: true});
            } else {
                GO.router.navigate('approval', {trigger: true});
            }
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

        docPrint: function () {
            var url = this.model.getFullShowUrl() + "/popup/print";
            window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
        },

        docTypeSelect: function () {
            var self = this;
            var docTypeSelectViewLayer = $.goPopup({
                "pclass": "layer_normal layer_doc_type_select",
                "header": approvalLang['문서 분류 선택'],
                "modal": true,
                "width": 300,
                "contents": "",
                "buttons": [{
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
                }, {
                    'btext': commonLang["닫기"],
                    'btype': 'cancel'
                }]
            });

            var docTypeSelectView = new DocTypeSelectView();
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
                docFolder.push($(this).attr("data-folderName"));
            });
            this.documentView.setDocClassification(docFolder);
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

        deleteDocument: function () {
            var self = this;
            var document = self.model.get('document');
            var docStatus = document.docStatus;
            var receptionOriginId = document.receptionOrigin != undefined ? document.receptionOrigin.id : undefined;
            var popupContents = approvalLang[self.formIntegrator.getDeleteMessageKey()];
            
            var deleteAndMoveButton = {
                btext: approvalLang['삭제 후 원문서로 이동'],
                btype: "confirm",
                autoclose: false,
                callback: function () {
                    self._deleteDocument(docStatus, receptionOriginId);
                }
            };

            var deleteButton = {
                btext: commonLang['삭제'],
                btype: "confirm",
                autoclose: false,
                callback: function () {
                    self._deleteDocument();
                }
            };

            var cancelButton = {
                btext: commonLang['취소'],
                btype: 'normal'
            };

            var popupButtons = [deleteButton, cancelButton];

            if (docStatus == 'RECV_RETURNED') {
                popupContents = approvalLang["반송문서삭제경고"];
                popupButtons = [deleteAndMoveButton, deleteButton, cancelButton];
            }

            $.goPopup({
                width: 400,
                closeIconVisible: false,
                pclass: "layer_normal",
                contents: popupContents,
                buttons: popupButtons
            });
        },

        _deleteDocument: function (docStatus, receptionOriginId) {
            var self = this;
            var deleteApiUrl = [GO.config('contextRoot') + 'api/approval/manage/document', self.docId].join('/');
            $.ajax(deleteApiUrl, {
                type: 'DELETE',
                contentType: 'application/json',
                dataType: 'json'
            }).done(function (data) {
                if (!self.options.isPopup) {
                    self.navigateToBackList(docStatus, receptionOriginId);
                    $.goMessage(approvalLang["선택한 항목이 삭제되었습니다"]);
                } else {
                    $.goAlert("", approvalLang["선택한 항목이 삭제되었습니다"], function () {
                        window.close();
                    });
                }
            }).fail(function (data) {
                var responseObj = JSON.parse(data.responseText);
                if (!_.isUndefined(responseObj) && responseObj.message) {
                    $.goError(responseObj.message);
                    return false;
                } else {
                    $.goError(commonLang["500 오류페이지 타이틀"]);
                    return false;
                }
            });
        },

        navigateToBackList: function (docStatus, receptionOriginId) {
            var fullUrl;
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');

            if (baseUrl) {
                if(docStatus == 'RECV_RETURNED') {
                    if(receptionOriginId) {
                        baseUrl = baseUrl + '/' + receptionOriginId;
                    } else {
                        $.goMessage(approvalLang["선택한 항목이 삭제되었습니다"] + " " + approvalLang["원문서가 존재하지 않아 목록으로 이동"]);
                    }
                }
                var search = $.param(GO.router.getSearch());
                var url = search ? "?" + search : "";
                fullUrl = baseUrl + url;
            } else {
                fullUrl = 'approval';
            }
            GO.router.navigate(fullUrl, {trigger: true});
        },

        release: function () {
            this.$el.off();
            this.$el.empty();
        },

        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        },

        append: function (view, selector) {
            this.$(selector).append(view.render().el);
        }
    });

    return MainView;

    function onApprFlowUpdated(view) {
        view.documentInit();
        view.render();
    };
});
