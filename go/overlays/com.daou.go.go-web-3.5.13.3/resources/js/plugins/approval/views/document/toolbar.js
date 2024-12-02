define("approval/views/document/toolbar", function (require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var ToolbarTpl = require("hgn!approval/templates/document/toolbar");
    var commonLang = require("i18n!nls/commons");
    var approvalLang = require("i18n!approval/nls/approval");

    var lang = {
        "기안": approvalLang['기안'],
        "결재요청": approvalLang['결재요청'],
        "임시저장": approvalLang['임시저장'],
        "삭제": approvalLang['삭제'],
        "취소": commonLang['취소'],
        "저장": commonLang['저장'],
        "문서 수정": approvalLang['문서 수정'],
        "결재": approvalLang['결재'],
        "반려": approvalLang['반려'],
        "보류": approvalLang['보류'],
        "합의": approvalLang['합의'],
        "반대": approvalLang['반대'],
        "확인": approvalLang['확인'],
        "회수": approvalLang['회수'],
        "결재문서회수": approvalLang['결재문서회수'],
        "접수": approvalLang['접수'],
        "반송": approvalLang['반송'],
        "접수취소": approvalLang['접수취소'],
        "담당자 지정": approvalLang['담당자 지정'],
        "후열": approvalLang['후열'],
        "후결": approvalLang['후결'],
        "선결재": approvalLang['선결재'],
        "부서 문서함 복사": approvalLang['부서 문서함 복사'],
        "열람자 추가": approvalLang['열람자 추가'],
        "문서분류 추가": approvalLang['문서분류 추가'],
        "결재 정보": approvalLang['결재 정보'],
        "결재선 변경": approvalLang['결재선 변경'],
        "목록": commonLang['목록'],
        "복사": commonLang['URL 복사'],
        "인쇄": commonLang['인쇄'],
        "결재문서명": approvalLang['결재문서명'],
        "상신취소": approvalLang['상신취소'],
        "결재취소": approvalLang['결재취소'],
        "전결": approvalLang['전결'],
        "수신자 추가": approvalLang['수신자 추가'],
        "재기안": approvalLang['재기안'],
        "재접수": approvalLang['재접수'],
        "메일발송": commonLang['메일발송'],
        "게시판 게시": approvalLang['게시판 게시'],
        "팝업보기": commonLang['팝업보기'],
        "도움말": commonLang['도움말'],
        "다운로드": commonLang['다운로드'],
        "미리보기": commonLang['미리보기'],
        "자동저장안함": approvalLang['자동저장안함'],
        "자동저장": approvalLang['자동저장'],
        "자동저장 주기를 변경 하였습니다.": approvalLang['자동저장 주기를 변경 하였습니다.'],
        "자동 저장 하였습니다.": approvalLang['자동 저장 하였습니다.'],
        "자동저장 중 에러 발생": approvalLang['자동저장 중 에러 발생'],
        "초": approvalLang['초'],
        "분": approvalLang['분'],
        "접수 취소 후 반송": approvalLang['접수 취소 후 반송'],
        "부서 재지정": approvalLang['부서 재지정']
    };

    var autoSaveTimeTerm, autoSaveMessageTerm, writeAutoSave, checkSaveTimeTerm;
    var isAutoSaveStart = false;
    var isAutoSave = false;

    var ToolbarView = Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
            _.bindAll(this, 'render', 'showEditType', 'showNormalType');
            this.type = this.options.type;
            this.toolbarModel = this.options.toolbarModel;
            this.docStatus = this.options.docStatus;
            this.userId = this.options.userId;
            this.drafterId = this.options.drafterId;
            this.isAgreement = this.options.isAgreement;
            this.isReceptionDocument = this.options.isReceptionDocument;
            this.isDeletedDeptRcvDoc = this.options.isDeletedDeptRcvDoc;
            this.isPublic = this.options.isPublic;
            this.useHelp = this.options.useHelp;
            this.formId = this.options.formId;
            this.checkIsDeputyActivity = this.options.checkIsDeputyActivity;
            this.docId = this.options.docId;
            this.autoSaveTime = this.options.autoSaveTime;
        },
        events: {
            'click #act_save': 'actSave',
            'click #act_cancel': 'actCancel',
            'click #act_draft': 'actDraft',
            'click #act_delete': 'actDelete',
            'click #act_temp_save': 'actTempSave',
            'click #act_cancel_draft': 'actCancelDraft',
            'click #act_approve': 'actApprove',
            'click #act_hold': 'actHold',
            'click #act_return': 'actReturn',
            'click #act_agree': 'actAgree',
            'click #act_disagree': 'actDisagree',
            'click #act_check': 'actCheck',
            'click #act_inspection': 'actInspection',
            'click #act_advappr': 'actAdvAppr',
            'click #act_withdrawal': 'actWithdrawal',
            'click #act_draft_withdrawal': 'actDraftWithdrawal',
            'click #act_draft_withdrawal_inprogress': 'actDraftWithdrawalInprogress',
            'click #act_draft_withdrawal_draft': 'actDraftWithdrawalDraft',
            'click #act_draft_withdrawal_cancelDraft': 'actDraftWithdrawalCancelDraft',
            'click #reassign_receiver': 'reassignReceiver',
            'click #cancel_reception': 'cancelReception',
            'click #return_reception': 'returnReception',
            'click #act_deptFolderCopy': 'actDeptFolderCopy',
            'click #act_edit_apprflow': 'actEditApprFlow',
            'click #act_edit': 'actEdit',
            'click #act_postcheck': 'actPostCheck',
            'click #act_postapproval': 'actPostApproval',
            'click #act_addFolder': 'actAddFolder',
            'click #act_generate_actcopy': 'actGenerateActCopy',
            'click #act_reapply': 'actReapply',
            'click #act_list': 'actList',
            'click #show_help': 'showHelp',
            'click #act_doc_print': 'actDocPrint',
            'click #sendMail': 'showSendMailLayer',
            'click #post_regist': 'showPostRegistLayer',
            'click #show_popup': 'showPopup',
            'click #downloadDocument': 'downloadDocument',
            'click #act_document_preview': 'documentPreview',
            'change #autoSaveSelect': 'autoSave',
            'click #cancel_and_return_reception': 'cancelAndReturnReception',
            'click #reassign_dept': 'reassignDept'
        },
        autoSave: function (e) {
            var type = $(e.currentTarget).attr("evt-rol");
            if (!type) return;
            if (type == "auto-save") {
                var term = $(e.currentTarget).val();
                $("select[evt-rol=auto-save]").val(term);
                this.chgAutoSaveTerm(term);
            }
        },
        showSendMailLayer: function () {
            this.trigger('showSendMailLayer');
        },
        showPostRegistLayer: function () {
            this.trigger('showPostRegistLayer');
        },
        render: function () {
            var self = this;
            var actionControll = this.makeActionControll();
            this.$el.html(ToolbarTpl({
                lang: lang,
                useActData: actionControll,
                isPopup: this.options.isPopup,
                useHelp: this.options.useHelp,
                formId: this.options.formId,
                isPopupButtonVisible: !_.contains(['CREATE'], this.docStatus),
                isAutoSave: _.contains(['CREATE', 'TEMPSAVE'], this.docStatus),
                autoSaveOptions: {
                    options: [
                        {val: 0, txt: lang['자동저장안함'], selected: (self.autoSaveTime == 0) ? true : false},
                        {
                            val: 30,
                            txt: lang['자동저장'] + '(30' + lang['초'] + ')',
                            selected: (self.autoSaveTime == 30) ? true : false
                        },
                        {
                            val: 60,
                            txt: lang['자동저장'] + '(1' + lang['분'] + ')',
                            selected: (self.autoSaveTime == 60) ? true : false
                        },
                        {
                            val: 180,
                            txt: lang['자동저장'] + '(3' + lang['분'] + ')',
                            selected: (self.autoSaveTime == 180) ? true : false
                        }
                    ]
                }
            }));

            clearTimeout(autoSaveTimeTerm);

            if (writeAutoSave != undefined) {
                clearTimeout(writeAutoSave);
            }
            if (this.docStatus == 'CREATE' || this.docStatus == 'TEMPSAVE') {
                var initSetTime = $("#autoSaveSelect").val() * 1000 || 60 * 1000;
                if (this.docStatus == 'CREATE' || this.docStatus == 'TEMPSAVE') {
                    writeAutoSave = setTimeout(function () {
                        self.runAutoSaveProcess();
                    }, initSetTime);
                }
            }

            $(this.$el).find('#act_save').hide();
            $(this.$el).find('#act_cancel').hide();

            // events에 명시해둔 act_rereceive가 제대로 동작하지 않습니다. 버그로 판단됨. 해서 우회하여 아래와 같이 바인딩 선언
            $(this.$el).find('#act_rereceive').bind("click", $.proxy(function () {
                this.trigger('actRereceive');
            }, this));
            $(this.$el).find('#act_receive').bind("click", $.proxy(function () {
                this.trigger('actReceive');
            }, this));

            $("body").trigger("approval.toolbarRender");
        },

        makeActionControll: function () {
            return {
                isActivityUser: this.toolbarModel.isActivityUser,
                // 신규
                createDraft: this.getCreateDraft(),
                // 임시저장
                tempSave: this.getTempSave(),
                // 진행중-기안자,결재자,합의자,확인자
                inDraft: this.getInDraft(),
                inApproval: this.getInApproval(),
                inHold: this.getInHold(),
                inAgree: this.getInAgree(),
                inCheck: this.getInCheck(),
                inInspection: this.getInInspection(),
                inInspectionReturn: this.getInInspectionReturn(),
                inRecovery: this.getInRecovery(),
                inAdvApproval: this.getInAdvApproval(),
                inDraftWithdraw: this.getInDraftWithdraw(),
                // 완료-기안자,결재선존재(결재자,합의자),수신자,참조자,열람자,후열자,후결자
                inPostCheck: this.getInPostCheck(),
                inPostApproval: this.getInPostApproval(),
                completeDraft: this.getCompleteDraft(),
                completeEtc: this.getCompleteEtc(),
                isReceiver: this.toolbarModel.isReceiver,
                isReceivable: this.toolbarModel.isReceivable,
                isReceived: this.toolbarModel.isReceived,
                isAllowCancelReceive: this.toolbarModel.isAllowCancelReceive,
                completeAddReceive: this.getCompleteAddReceive(), // 수신자이면서 수신자추가는 가능하다.
                isPublic: this.isPublic,
                useHelp: this.useHelp,
                formId: this.formId,
                isPostRegistable: this.toolbarModel.isPostRegistable,
                completeRefer: false,
                completeRead: false,
                // 반려
                returnDraft: this.getReturnDraft(),
                // 반려된 수신문서
                isRereceivable: this.toolbarModel.isRereceivable,
                isReceptionDocument: this.isReceptionDocument,
                isDeletedDeptRcvDoc: this.isDeletedDeptRcvDoc,
                // 기타상세 권한
                arbitraryDecision: this.toolbarModel.isArbitraryDecisionabled,// 전결 가능 여부
                arbitraryDecisionDocument: this.toolbarModel.isArbitraryDecisionDocument,// (완료) 후열 가능 여부
                inArbitraryDecisionDocument: this.getInArbitraryDecisionDocument(),// (진행중) 후열 가능 여부
                actCopy: this.toolbarModel.actCopyAlterable, // 시행문 변경가능 여부
                isActCopyDocument: this.toolbarModel.isActCopyDocument, // 시행문 생성유무.
                lastActivityUser: this.toolbarModel.isLastActivityUser,
                isDocumentEditable: this.toolbarModel.isDocumentEditable,
                isApprovalInfoButtonVisible: this.toolbarModel.isActivityUser || this.toolbarModel.isReader,
                showUrlCopy: this.getShowUrlBtn(),
                showPrintBtn: (this.type == "CREATE" || this.type == "REAPPLY") ? false : true,
                showSendMailBtn: GO.session('mailAccountStatus') == "enabled" && this.toolbarModel.isUseSendMail && !this.getCreateDraft() && !this.getTempSave(),
                showDownloadBtn: this.getShowDownloadBtn(),
                latestCompletedActionisApproval: this.toolbarModel.latestCompleteAction == 'APPROVAL' ? true : false,
                latestCompletedActionName: this.toolbarModel.latestCompleteActionName,
                showDraftBtnByDraftWaiting: (this.docStatus == "DRAFT_WAITING" && this.userId == this.drafterId) ? true : false,
                hideWhenDeletedDeptRcvDoc: this.getHideWhenDeletedDeptRcvDoc()
            };
        },

        getCreateDraft: function () {
            if ((this.docStatus == "CREATE") && (this.userId == this.drafterId)) {
                return true;
            } else {
                return false;
            }
        },

        getTempSave: function () {
            if ((this.docStatus == "TEMPSAVE") && (this.userId == this.drafterId)) {
                return true;
            } else {
                return false;
            }
        },
        // 기안자
        getInDraft: function () {
            if ((this.docStatus == "INPROGRESS") && (this.userId == this.drafterId) && (this.toolbarModel.isAllowCancelDraftUser)) {
                return true;
            } else {
                return false;
            }
        },
        // 진행중인 문서 상신취소 가능 기안자
        getInDraftWithdraw: function () {
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isAllowInprogressCancelDraftUser)) {
                return true;
            } else {
                return false;
            }
        },
        // 결재대기자
        getInApproval: function () {
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isApprovalWaitingUser)) {
                return true;
            } else {
                return false;
            }
        },
        // 보류중
        getInHold: function () {
            if (!this.toolbarModel.useHold) {
                return true;
            }
            if (((this.docStatus == "INPROGRESS") && (this.toolbarModel.isActivityHoldingUser))
                || (this.toolbarModel.isApprovalDeputy || this.toolbarModel.isAgreementDeputy || this.toolbarModel.isCheckDeputy || this.toolbarModel.isInspectionDeputy)) {
                return true;
            } else {
                return false;
            }
        },
        // 선결재
        getInAdvApproval: function () {
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isApprovalUpcommingUser) && (this.toolbarModel.useAdvApproval)) {
                return true;
            } else {
                return false;
            }
        },
        // 합의대기자
        getInAgree: function () {
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isAgreementWaitingUser)) {
                return true;
            } else {
                return false;
            }
        },
        // 확인대기자
        getInCheck: function () {
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isCheckWaitingUser)) {
                return true;
            } else {
                return false;
            }
        },
        // 감사대기자
        getInInspection: function () {
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isInspectionWaitingUser)) {
                return true;
            } else {
                return false;
            }
        },
        // 감사 반려 대기자
        getInInspectionReturn: function () {
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isInspectionWaitingUser) && (this.toolbarModel.useInspectionReturn)) {
                return true;
            } else {
                return false;
            }
        },
        // 결재취소(이전 결재자)
        getInRecovery: function () { // 마지막 결재가 상신이 아닌경우 , 회수가능여부 , 마지막결재자아닌경우(-). 전단계 반려가 아닌경우.
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.latestCompleteAction != "DRAFT") && (this.toolbarModel.isJustBeforeApprovalUser) && (this.checkIsDeputyActivity)) {
                return true;
                // 병렬 합의일 경우 회수 가능 여부.
            } else if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.latestCompleteAction != "DRAFT") && (this.toolbarModel.isBeforeParallelAgreemntUser) && (this.checkIsDeputyActivity)) {
                return true;
            } else {
                return false;
            }
        },
        // 후결
        getInPostApproval: function () {
            if (this.toolbarModel.isPostApprovalUser) {
                return true;
            } else {
                false;
            }
        },
        // 후열
        getInPostCheck: function () {
            if (this.toolbarModel.isPostCheckUser) {
                return true;
            } else {
                false;
            }
        },
        getInArbitraryDecisionDocument: function () {
            if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isArbitraryDecisionDocument)) {
                return true;
            } else {
                return false;
            }
        },
        //상태에 따른 URL 복사 권한
        getShowUrlBtn: function () {
            if ((this.docStatus == "INPROGRESS") || (this.docStatus == "COMPLETE") || (this.docStatus == "RETURN")) {
                return true;
            } else {
                return false;
            }
        },
        getCompleteDraft: function () {
            if ((this.docStatus == "COMPLETE") && (this.userId == this.drafterId)) {
                return true;
            } else {
                return false;
            }
        },
        getReturnDraft: function () {
            if ((this.docStatus == "RETURN") && (this.userId == this.drafterId) && !this.isReceptionDocument) {
                return true;
            } else {
                return false;
            }
        },
        getCompleteEtc: function () {
            if ((this.docStatus == "COMPLETE") && (this.userId != this.drafterId) && (this.toolbarModel.isActivityUser)) { // 결재선에 존재한다.(후열은 별도로직.)
                return true;
            } else {
                return false;
            }
        },
        getCompleteAddReceive: function () {
            if ((this.docStatus == "COMPLETE") && (this.toolbarModel.isReceiptAddReader)) {
                return true;
            } else {
                return false;
            }
        },
        getShowDownloadBtn: function () {
            return (this.docStatus == "COMPLETE" || this.isReceptionDocument) ? true : false;
        },
        getHideWhenDeletedDeptRcvDoc: function () {
            return (this.isDeletedDeptRcvDoc && (this.docStatus == "RECEIVED" || this.docStatus == "RETURN")) ? true : false;
        },
        showEditType: function () {
            // 문서수정상태의 버튼 표시
            $(this.$el).find('#act_save').show();
            $(this.$el).find('#act_cancel').show();
            $(this.$el).find('#act_edit').hide();
            $(this.$el).find('#act_draft').hide();
            $(this.$el).find('#act_approve').hide();
            $(this.$el).find('#act_hold').hide();
            $(this.$el).find('#act_check').hide();
            $(this.$el).find('#act_return').hide();
            $(this.$el).find('#act_edit_apprflow').hide();
            $(this.$el).find('#act_draft_withdrawal').hide();
            $(this.$el).find('#act_withdrawal').hide();
            $(this.$el).find('#cancel_reception').hide();
            $(this.$el).find('#sendMail').hide();
            $(this.$el).find('#show_popup').hide();
            $(this.$el).find('#act_agree').hide();
            $(this.$el).find('#act_disagree').hide();
            $(this.$el).find('#act_inspection').hide();
        },
        showNormalType: function () {
            // 일반상태의 버튼 표시
            $(this.$el).find('#act_save').hide();
            $(this.$el).find('#act_cancel').hide();
            $(this.$el).find('#act_edit').show();
        },
        actSave: function () {
            this.trigger('saved');
        },
        actCancel: function () {
            this.trigger('canceled');
        },
        actDraft: function () {
            this.trigger('drafted');
        },
        actDelete: function () {
            this.trigger('deleted');
        },
        actTempSave: function () {
            this.trigger('tempSaved');
        },

        actTempAutoSave: function () {
            this.trigger('tempAutoSaved');
        },

        actCancelDraft: function () {
            this.trigger('draftCanceled');
        },
        actApprove: function () {
            this.trigger('approved');
        },
        actHold: function () {
            this.trigger('holded');
        },
        actReturn: function () {
            this.trigger('returned');
        },
        actAgree: function () {
            this.trigger('agreed');
        },
        actDisagree: function () {
            this.trigger('disagreed');
        },
        actCheck: function () {
            this.trigger('checked');
        },
        actInspection: function () {
            this.trigger('inspected');
        },
        actAdvAppr: function () {
            this.trigger('actAdvAppr');
        },
        actWithdrawal: function () {
            this.trigger('actWithdrawal');
        },
        actDraftWithdrawal: function () {
            this.trigger('actDraftWithdrawal');
        },
        actDraftWithdrawalInprogress: function () {
            this.trigger('actDraftWithdrawalInprogress');
        },
        actDraftWithdrawalDraft: function () {
            this.trigger('actDraftWithdrawalDraft');
        },
        actDraftWithdrawalCancelDraft: function () {
            this.trigger('actDraftWithdrawalCancelDraft');
        },
        actReceive: function () {
            this.trigger('actReceive');
        },
        reassignReceiver: function () {
            this.trigger('reassignReceiver');
        },
        actRereceive: function () {
            this.trigger('actRereceive');
        },
        cancelReception: function () {
            this.trigger('cancelReception');
        },
        returnReception: function () {
            this.trigger('returnReception');
        },
        actDeptFolderCopy: function () {
            this.trigger('deptFolderCopy');
        },
        actEditApprFlow: function () {
            this.trigger('editApprFlow');
        },
        actEdit: function () {
            this.showEditType();
            this.trigger('edit');
        },
        actPostCheck: function () {
            this.trigger('actPostCheck');
        },
        actPostApproval: function () {
            this.trigger('actPostApproval');
        },
        actAddFolder: function () {
            this.trigger('actAddFolder');
        },
        actGenerateActCopy: function () {
            this.trigger('generateActCopy');
        },
        actReapply: function () {
            this.trigger('actReapply');
        },
        actList: function () {
            this.trigger('actList');
        },
        showHelp: function (e) {
            var formId = $(e.currentTarget).attr('data-value');
            var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + "app/approval/help/" + formId;
            window.open(url, '', "scrollbars=1,width=400,height=600 top=" + ((screen.height / 2) - 200) + " left=" + ((screen.width / 2) - 180));
        },
        actDocPrint: function () {
            this.trigger('docPrint');
        },
        showPopup: function () {
            this.trigger('showPopup');
        },
        downloadDocument: function () {
            this.trigger('downloadDocument');
        },
        documentPreview: function () {
            this.trigger('documentPreview');
        },
        storeAutoSaveTime: function () {
            this.trigger('storeAutoSaveTime');
        },
        runAutoSaveProcess: function () {
            var self = this;
            clearTimeout(autoSaveTimeTerm);
            var selectedCheckTime = $("#autoSaveSelect").val();
            var checkTime = selectedCheckTime * 1000;
            if (checkTime > 0) {
                if (isAutoSaveStart) {
                    this.doAutoSave();
                }
                isAutoSaveStart = true;
                autoSaveTimeTerm = setTimeout(function () {
                    self.runAutoSaveProcess()
                }, checkTime);
            } else {
                isAutoSaveStart = false;
                clearTimeout(autoSaveTimeTerm);
            }
        },
        doAutoSave: function () {
            var isAccessible = true;
            _.each($('form span[data-dsl*="editor"]'), function (form) { // 양식 구조상 이런식으로 밖에 접근 할 수 없음.
                if (!GO.Editor.getInstance($(form).attr('id')).isAccessible()) {
                    isAccessible = false;
                    return false;
                }
            });
            if (!isAccessible) return; // 에디터 컨텐츠에 접근 불가능한 상태인경우 임시저장 하지 않음.
            var self = this;
            isAutoSave = true;
            this.actTempAutoSave();
            checkSaveTimeTerm = setTimeout(function () {
                if (isAutoSave) self.processAutoSaveMessage("saveErrMessage");
            }, 10000);
        },
        chgAutoSaveTerm: function (val) {
            clearTimeout(autoSaveTimeTerm);
            isAutoSaveStart = false;
            this.trigger('storeAutoSaveTime');
            this.runAutoSaveProcess();
            this.processMessageViewer(lang['자동저장 주기를 변경 하였습니다.'] + this.getSelectedTimeMsg());

        },
        processAutoSaveMessage: function (type, data) {
            clearTimeout(checkSaveTimeTerm);
            var tmpMessage = "";

            if (type == "saveTerm") {
                tmpMessage = lang['자동 저장 하였습니다.'] + this.getSelectedTimeMsg();
            } else if (type == "saveErrorTerm") {
                tmpMessage = lang['자동저장 중 에러 발생'];
            }
            this.processMessageViewer(tmpMessage);
            isAutoSave = false;
        },
        processMessageViewer: function (msg) {
            clearTimeout(autoSaveMessageTerm);
            $("#processMessageContent").text(msg);
            $("#processMessageWrap").fadeIn(500, function () {
                autoSaveMessageTerm = setTimeout(function () {
                    jQuery("#processMessageWrap").fadeOut(500);
                }, 3000);
            });
        },
        getSelectedTimeMsg: function () {
            var tmpMessage = "";
            var selectedValue = $("#autoSaveSelect").val();
            if (selectedValue > 0) {
                if (selectedValue < 60)
                    tmpMessage += "(" + selectedValue + lang['초'] + ")";
                else
                    tmpMessage += "(" + (selectedValue / 60) + lang['분'] + ")";
            } else {
                tmpMessage += "(" + lang['자동저장안함'] + ")";
            }
            return tmpMessage;
        },
        cancelAndReturnReception: function () {
            this.trigger('cancelAndReturnReception');
        },
        reassignDept: function () {
            this.trigger('reassignDept');
        }
    });

    return ToolbarView;
});
