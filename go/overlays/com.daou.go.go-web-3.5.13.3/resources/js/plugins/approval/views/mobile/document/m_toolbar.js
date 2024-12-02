define([
        "jquery",
        "backbone",
        "hgn!approval/templates/mobile/document/m_toolbar",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "views/layouts/m_action_bar_default",
        "jquery.go-preloader"
    ],
    function (
        $,
        Backbone,
        ToolbarTpl,
        commonLang,
        approvalLang,
        actionBar
    ) {
        var menus = {
            "삭제": {
                id: "deleted",
                name: "document_action",
                text: approvalLang['삭제']
            },
            "결재_Approved": {
                id: "approved",
                name: "document_action",
                text: approvalLang['결재']
            },
            "상신취소": {
                id: "actDraftWithdrawal",
                name: "document_action",
                text: approvalLang['상신취소']
            },
            "후결": {
                id: "actPostApproval",
                name: "document_action",
                text: approvalLang['후결']
            },
            "후열": {
                id: "actPostCheck",
                name: "document_action",
                text: approvalLang['후열']
            },
            "결재취소": {
                id: "actWithdrawal",
                name: "document_action",
                text: approvalLang['결재취소']
            },
            "합의": {
                id: "agreed",
                name: "document_action",
                text: approvalLang['합의']
            },
            "반대": {
                id: "disagreed",
                name: "document_action",
                text: approvalLang['반대']
            },
            "확인": {
                id: "checked",
                name: "document_action",
                text: approvalLang['확인']
            },
            "결재_Inspected": {
                id: "inspected",
                name: "document_action",
                text: approvalLang['결재모바일']
            },
            "반려": {
                id: "returned",
                name: "document_action",
                text: approvalLang['반려']
            },
            "보류": {
                id: "holded",
                name: "document_action",
                text: approvalLang['보류'],
                inMoreBtn: true
            },
            "선결재": {
                id: "actAdvAppr",
                name: "document_action",
                text: approvalLang['선결재']
            },
            "접수": {
                id: "actReceive",
                name: "document_action",
                text: approvalLang['접수']
            },
            "반송": {
                id: "returnReception",
                name: "document_action",
                text: approvalLang['반송'],
                inMoreBtn: true
            },
            "재접수": {
                id: "actRereceive",
                name: "document_action",
                text: approvalLang['재접수']
            },
            "접수취소": {
                id: "cancelReception",
                name: "document_action",
                text: approvalLang['접수취소']
            },
            "접수취소후반송": {
                id: "cancelAndReturnReception",
                name: "document_action",
                text: approvalLang['접수 취소 후 반송']
            },
            "수신자추가": {
                id: "actAddReceive",
                name: "document_action",
                text: approvalLang['수신자 추가']
            },
            "의견": {
                id: "show_activity_comment_list",
                name: "show_activity_comment_list",
                text: approvalLang['의견']
            },
            "댓글": {
                id: "show_comment_list",
                name: "document_action",
                text: approvalLang['댓글']
            },
            "본문": {
                id: "show_document",
                name: "document_action",
                text: approvalLang['본문'],
                inMoreBtn: true
            },
            "결재선": {
                //selectId : "selectDocInfo",
                id: "show_apprflow_list",
                name: "document_action",
                text: approvalLang['결재선']
            },
            "문서정보": {
                id: "show_doc_info",
                name: "document_action",
                text: approvalLang['문서정보'],
                inMoreBtn: true
            },
            "결재요청": {
                id: "act_draft",
                name: "document_action",
                text: approvalLang['결재요청']
            },
            "임시저장": {
                id: "act_tempsave",
                name: "document_action",
                text: approvalLang['임시저장']
            },
            "결재정보": {
                id: "show_apprflow_list",
                name: "document_action",
                text: commonLang['결재정보']
            },
            "담당자지정": {
                id: "reassignReceiver",
                name: "document_action",
                text: approvalLang['담당자 지정']

            },
            "미리보기": {
                id: "approval_preview",
                name: "document_action",
                text: approvalLang['미리보기']
            },
            "재기안": {
                id: "act_reapply",
                name: "document_action",
                text: approvalLang['재기안']
            }
        };
        var ToolbarView = Backbone.View.extend({
            initialize: function (options) {
                this.options = options || {};
                _.bindAll(this, 'render');
                this.type = this.options.type;
                this.toolbarModel = this.options.toolbarModel;
                this.docStatus = this.options.docStatus;
                this.userId = this.options.userId;
                this.drafterId = this.options.drafterId;
                this.isReceptionDocument = this.options.isReceptionDocument;
                this.isDeletedDeptRcvDoc = this.options.isDeletedDeptRcvDoc;
                this.isAgreement = this.options.isAgreement;
                this.isPublic = this.options.isPublic;
                this.isDraftable = this.options.isDraftable;
                this.checkIsDeputyActivity = this.options.checkIsDeputyActivity;
                this.commentsCount = this.options.commentsCount;
                $(document).off("backdrop");
                $(document).on("backdrop", $.proxy(function (e) {
                    this.closeMoreLayout(e);
                }, this));
            },
            events: {},
            unbindEvent: function () {
                this.$el.off('change', '#selectDocInfo');
                this.$el.off('click', '#show_document');
                this.$el.off('click', '#show_apprflow_list');
                this.$el.off('click', '#show_doc_info');

                this.$el.off('click', '[name=show_comment_list]');
                this.$el.off('click', '[name=show_activity_comment_list]');
                this.$el.off('vclick', '[name=document_action]');

                this.$el.off('vclick', '#act_list');
                this.$el.off('vclick', '#more_btn');
                this.$el.off('click', '#act_draft');

                this.$el.off('click', '#reassignReceiver');
                this.$el.off('click', '#act_tempsave');
                this.$el.off('click', '#act_reapply');
            },
            bindEvent: function () {
                this.$el.on('change', '#selectDocInfo', $.proxy(this.selectDocInfo, this));
                this.$el.on('vclick', '#show_document', $.proxy(this.changeViewType, this));
                this.$el.on('vclick', '#show_apprflow_list', $.proxy(this.changeViewType, this));
                this.$el.on('vclick', '#show_doc_info', $.proxy(this.changeViewType, this));

                this.$el.on('click', '[name=show_comment_list]', $.proxy(this.show_comment_list, this));
                this.$el.on('click', '[name=show_activity_comment_list]', $.proxy(this.show_activity_comment_list, this));
                this.$el.on('vclick', '[name=document_action]', $.proxy(this.actApprAction, this));

                this.$el.on('vclick', '#act_list', $.proxy(this.actList, this));
                this.$el.on('vclick', '#more_btn', $.proxy(this.moreLayout, this));
                this.$el.on('click', '#act_draft', $.proxy(this.actDraft, this));

                this.$el.on('click', '#reassignReceiver', $.proxy(this.reassignReceiver, this));
                this.$el.on('click', '#act_tempsave', $.proxy(this.actTempSave, this));
                this.$el.on('click', '#act_reapply', $.proxy(this.actReapply, this));
            },

            render: function () {
                /*this.actionBar = new actionBar({useMenuList : this.getUseMenus()});
                this.$el.html(this.actionBar.render().el);
                this.actionBar.renderToolbar();*/
                this.unbindEvent();
                this.bindEvent();
                return this.getUseMenus();
            },

            getUseMenus: function () {
                var useActData = this.makeActionControll();

                var useMenuList = [];

                if (useActData.isCreate || useActData.tempSave) {
                    useMenuList.push(menus.미리보기);
                    useMenuList.push(menus.결재정보);
                    if (this.isDraftable) useMenuList.push(menus.결재요청);
                    useMenuList.push(menus.본문);
                    useMenuList.push(menus.문서정보);
                    return useMenuList;
                }

                useMenuList.push($.extend(menus.댓글,{commentsCount: this.commentsCount}));
                useMenuList.push(menus.결재정보);
                if (!useActData.complete) {
                    if (useActData.isActivityUser) {
                        if (useActData.tempSave) {
                            if (!useActData.isReceptionDocument) {
                                useMenuList.push(menus.삭제);
                            }
                        }
                        if (useActData.inApproval) {
                            useMenuList.push(menus.반려);
                            useMenuList.push(menus.결재_Approved);
                            pushHoldAndResetApprInfo();
                        }
                        if (useActData.inDraft) {
                            useMenuList.push(menus.상신취소);
                        }
                        if (useActData.inPostApproval) {
                            useMenuList.push(menus.후결);
                        }
                        if (useActData.inPostCheck) {
                            useMenuList.push(menus.후열);
                        }
                        if (useActData.inRecovery) {
                            if (useActData.latestCompletedActionisApproval) {
                                useMenuList.push(menus.결재취소);
                            } else {
                                useMenuList.push({
                                    id: "actWithdrawal",
                                    name: "document_action",
                                    text: useActData.latestCompletedActionName + commonLang["취소"]
                                });
                            }
                        }
                        if (useActData.inAgree) {
                            useMenuList.push(menus.반대);
                            useMenuList.push(menus.합의);
                            pushHoldAndResetApprInfo();
                        }
                        if (useActData.inCheck) {
                            useMenuList.push(menus.반려);
                            useMenuList.push(menus.확인);
                            pushHoldAndResetApprInfo();
                        }
                        if (useActData.inInspection) {
                            if (useActData.inInspectionReturn) {
                                useMenuList.push(menus.반려);
                            }
                            useMenuList.push(menus.결재_Inspected);
                            pushHoldAndResetApprInfo();
                        }
                        if (useActData.inAdvApproval) {
                            useMenuList.push(menus.선결재);
                        }

                    }

                    if (useActData.isReceivable) {
                        useMenuList.push(menus.담당자지정);
                        useMenuList.push(menus.접수);
                        removeAndPushMenuInMoreBtn(menus.결재정보);
                        useMenuList.push(menus.반송);
                    }

                    if (useActData.isRereceivable) {
                        useMenuList.push(menus.재접수);
                        useMenuList.push(menus.반송);
                    }

                    if (useActData.isReceived && useActData.isAllowCancelReceive) {
                        if (!useActData.isDeletedDeptRcvDoc) {
                            useMenuList.push(menus.접수취소);
                        } else {
                            useMenuList.push(menus.접수취소후반송);
                        }
                        useMenuList.push(menus.결재요청);
                        removeAndPushMenuInMoreBtn(menus.결재정보);
                    }

                    if (useActData.completeAddReceive) {
                        if (!useActData.isReceptionDocument) {
                            useMenuList.push(menus.수신자추가);
                        }
                    }
                }

                if (useActData.isActivityUser && !useActData.isReceptionDocument &&
                    this.isDraftable && (useActData.completeDraft || useActData.returnDraft)) {
                    useMenuList.push(menus.재기안);
                }
                useMenuList.push(menus.본문);
                useMenuList.push(menus.문서정보);
                return useMenuList;

                function pushHoldAndResetApprInfo() {
                    if (!useActData.inHold) {
                        useMenuList.push(menus.보류);
                    }
                    removeAndPushMenuInMoreBtn(menus.결재정보);
                }
                function removeAndPushMenuInMoreBtn(menu) {
                    useMenuList = _.without(useMenuList, menu);
                    useMenuList.push($.extend(_.clone(menu), {inMoreBtn: true}));
                }
            },

            actApprAction: function (e) {
                $(e.currentTarget).parents().find("#more_layout").hide();
                this.trigger($(e.currentTarget).attr('id'));
            },

            makeActionControll: function () {
                return {
                    isCreate: this.getCreate(), //기안
                    tempSave: this.getTempSave(), //임시저장
                    isActivityUser: this.toolbarModel.isActivityUser,
                    //신규
                    // 진행중-기안자,결재자,합의자,확인자
                    inApproval: this.getInApproval(),
                    inHold: this.getInHold(),
                    inDraft: this.getInApproval() ? false : this.getInDraft(),
                    inAgree: this.getInAgree(),
                    inCheck: this.getInCheck(),
                    inInspection: this.getInInspection(),
                    inInspectionReturn: this.getInInspectionReturn(),
                    inRecovery: this.getInRecovery(),
                    inAdvApproval: this.getInAdvApproval(),
                    //완료-기안자,결재선존재(결재자,합의자),수신자,참조자,열람자,,후열자,후결자
                    inPostCheck: this.getInPostCheck(),
                    inPostApproval: this.getInPostApproval(),
                    completeEtc: this.getCompleteEtc(),
                    completeDraft: this.getCompleteDraft(),
                    returnDraft: this.getReturnDraft(),
                    isReceived: this.toolbarModel.isReceived,
                    isReceivable: this.toolbarModel.isReceivable,
                    isAllowCancelReceive: this.toolbarModel.isAllowCancelReceive,
                    isReceptionDocument: this.isReceptionDocument,
                    isDeletedDeptRcvDoc: this.isDeletedDeptRcvDoc,
                    isRereceivable: this.toolbarModel.isRereceivable,
                    completeAddReceive: this.getCompleteAddReceive(), // 수신자이면서 수신자추가는 가능하다.
                    completeRefer: false,
                    completeRead: false,
                    // 기타상세 권한
                    arbitraryDecision: this.toolbarModel.isArbitraryDecisionabled,// 전결 가능 여부
                    arbitraryDecisionDocument: this.toolbarModel.isArbitraryDecisionDocument,// 후열 가능 여부
                    inArbitraryDecisionDocument: this.getInArbitraryDecisionDocument(),// (진행중) 후열 가능 여부
                    lastActivityUser: this.toolbarModel.isLastActivityUser,
                    isDocumentEditable: this.toolbarModel.isDocumentEditable,
                    complete: this.getCheckComplete(),
                    latestCompletedActionisApproval: this.toolbarModel.latestCompleteAction == 'APPROVAL' ? true : false,
                    latestCompletedActionName: this.toolbarModel.latestCompleteActionName
                };

            },

            selectDocInfo: function (e) {
                var selectedVal = $(e.currentTarget).find('option:selected').val();
                this.changeDocLayer(selectedVal);
            },

            changeDocLayer: function (menu) {

                var selectedText = $("#selectDocInfo").find("option[value='" + menu + "']").text();
                $("#selectDocInfo").closest('a').find('span.txt').text(selectedText);
                $("#selectDocInfo").find('option[value="' + menu + '"]').prop('selected', true);

                switch (menu) {
                    case 'show_apprflow_list' :
                        this.trigger('show_apprflow_list');
                        break;
                    case 'show_doc_info' :
                        this.trigger('show_doc_info');
                        break;
                    default :
                        this.trigger('show_document');
                }
            },

            changeViewType: function (e) {
                this.toggleMoreLayout($(e.currentTarget).parents().find("div.array_option"));
                var elementId = $(e.currentTarget).attr('id');
                this.trigger(elementId);
            },

            show_comment_list: function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.trigger('show_comment_list');
            },

            show_activity_comment_list: function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.changeDocLayer('show_apprflow_list');
            },
            getCreate: function () {
                if (this.docStatus == "CREATE") {
                    return true;
                }
                return false;
            },

            getTempSave: function () {
                if ((this.docStatus == "TEMPSAVE") && (this.userId == this.drafterId)) {
                    return true;
                } else {
                    return false;
                }
            },
            getInApproval: function () {
                if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isApprovalWaitingUser)) { // 현재결재자이다.
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
            // 결재예정자
            getInAdvApproval: function () {
                if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isApprovalUpcommingUser) && (this.toolbarModel.useAdvApproval)) {
                    return true;
                } else {
                    return false;
                }
            },

            getInAgree: function () {
                if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isAgreementWaitingUser)) { // 현재합의자이다.
                    return true;
                } else {
                    return false;
                }
            },

            getInCheck: function () {
                if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isCheckWaitingUser)) {
                    return true;
                } else {
                    return false;
                }
            },

            getInInspection: function () {
                if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isInspectionWaitingUser)) {
                    return true;
                } else {
                    return false;
                }
            },

            getInInspectionReturn: function () {
                if ((this.docStatus == "INPROGRESS") && (this.toolbarModel.isInspectionWaitingUser) && (this.toolbarModel.useInspectionReturn)) {
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

            getCompleteDraft: function () {
                if ((this.docStatus == "COMPLETE") && (this.userId == this.drafterId)) {
                    return true;
                } else {
                    return false;
                }
            },
            getReturnDraft: function () {
                if ((this.docStatus == "RETURN") && (this.userId == this.drafterId)) {
                    return true;
                } else {
                    return false;
                }
            },
            getReturnAfterReception: function () {
                if ((this.docStatus == "RETURN") && (this.isReceptionDocument)) {
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

            getInDraft: function () {
                if ((this.docStatus == "INPROGRESS") && (this.userId == this.drafterId) && (this.toolbarModel.isJustBeforeApprovalUser)) {
                    return true;
                } else {
                    return false;
                }
            },

            getInRecovery: function () { // 이전결재가 상신이 아니고, 회수가능여부 , (*합의자가 아닌경우), 마지막결재자아닌경우(-).
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

            actList: function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.trigger('actList', e);
            },
            actDraft: function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.trigger('actDraft', e);
            },
            reassignReceiver: function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.trigger('reassignReceiver', e);
            },
            actTempSave: function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.trigger('actTempSave', e);
            },
            actReapply: function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.trigger('actReapply', e);
            },
            moreLayout: function (e) {
                e.preventDefault();
                e.stopPropagation();
                var moreLayout = $(e.currentTarget).parent().find("div.array_option");
                this.toggleMoreLayout(moreLayout);
            },

            toggleMoreLayout: function (moreLayout) {
                if (moreLayout.is(':visible')) {
                    moreLayout.hide();
                } else {
                    moreLayout.show();
                }
            },

            closeMoreLayout: function (e) {
                var moreLayout = $(e.currentTarget).find("#more_layout");
                if (moreLayout.is(':visible')) {
                    moreLayout.hide();
                }
            },

            getCheckComplete: function () {
                if (this.docStatus == "COMPLETE" && !(this.toolbarModel.isPostCheckUser || this.toolbarModel.isPostApprovalUser)) {
                    return true;
                } else {
                    return false;
                }
            },

        });

        return ToolbarView;
    });