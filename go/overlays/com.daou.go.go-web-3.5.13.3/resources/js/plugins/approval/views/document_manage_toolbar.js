define("approval/views/document_manage_toolbar", function (require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var ToolbarTpl = require("hgn!approval/templates/document_manage_toolbar");
    var commonLang = require("i18n!nls/commons");
    var approvalLang = require("i18n!approval/nls/approval");

    var lang = {
        "취소": commonLang['취소'],
        "저장": commonLang['저장'],
        "강제반려": approvalLang['강제반려'],
        "문서 수정": approvalLang['문서 수정'],
        "결재선 변경": approvalLang['결재선 변경'],
        "결재 정보": approvalLang['결재 정보'],
        "목록": commonLang['목록'],
        "복사": commonLang['URL 복사'],
        "인쇄": commonLang['인쇄'],
        "문서 삭제": approvalLang['문서 삭제'],
        "담당자 지정": approvalLang['담당자 지정'],
        "강제반송": approvalLang['강제반송'],
        "접수취소": approvalLang['접수취소']
    };

    var ToolbarView = Backbone.View.extend({
        initialize: function (options) {
            this.options = options || {};
            this.isManageable = this.options.isManageable;
            this.masterAuthModel = this.options.masterAuthModel;
            _.bindAll(this, 'render', 'showEditType', 'showNormalType');
            this.docStatus = this.options.docStatus;
            this.actionCheck = this.options.actionCheck;
        },

        events: {
            'click #act_save': 'actSave',
            'click #act_cancel': 'actCancel',
            'click #act_edit_apprflow': 'actEditApprFlow',
            'click #act_edit': 'actEdit',
            'click #act_forcereturn': 'actForceReturn',
            'click #act_list': 'actList',
            'click #act_doc_print': 'actDocPrint',
            'click #act_delete': 'actDelete',
            'click #act_force_recv_returned': 'actForceRecvReturned',
            'click #act_reassign_receiver': 'actReassignReceiver',
            'click #act_cancel_reception': 'actCancelReception'
        },

        render: function () {
            var useForceReturn = true;

            if(this.docStatus == 'RETURN' || this.docStatus == 'TEMPSAVE' || this.docStatus == 'DRAFT_WAITING' ||
                this.docStatus == 'RECV_WAITING' || this.docStatus == 'RECV_RETURNED' || this.docStatus == 'RECEIVED') {
            	useForceReturn = false;
            }

            this.$el.html(ToolbarTpl({
                lang: lang,
                isComplete: this.docStatus == 'COMPLETE',
                useForceReturn: useForceReturn,
                isActCopy: this.actionCheck.isActCopy,
                isManageable: this.isManageable,
                authRead: this.masterAuthModel.authRead(),
                authWrite: this.masterAuthModel.authWrite(),
                authRemove: this.masterAuthModel.authRemove(),
                showUrlCopy: this.getShowUrlBtn(),
                isReturn: this.docStatus == 'RETURN',
                isRecvWaiting: this.docStatus == 'RECV_WAITING',
                isRecvReturned: this.docStatus == 'RECV_RETURNED',
                isReceived: this.docStatus == 'RECEIVED',
                isEditableDocument: this.docStatus != 'RETURN' &&
                    this.docStatus != 'RECV_WAITING' && this.docStatus != 'TEMPSAVE' &&
                    this.docStatus != 'RECV_RETURNED' && this.docStatus != 'DRAFT_WAITING',
            }));

            $(this.$el).find('#act_save').hide();
            $(this.$el).find('#act_cancel').hide();

            $("body").trigger("approval.manageToolbarRender");
        },

        showEditType: function () {
            // TODO 문서수정상태의 버튼 표시
            $(this.$el).find('#act_save').show();
            $(this.$el).find('#act_cancel').show();
            $(this.$el).find('#act_forcereturn').hide();
            $(this.$el).find('#act_edit').hide();
            $(this.$el).find('#act_edit_apprflow').hide();
        },

        showNormalType: function () {
            // TODO 일반상태의 버튼 표시
            $(this.$el).find('#act_save').hide();
            $(this.$el).find('#act_cancel').hide();
            $(this.$el).find('#act_forcereturn').show();
            $(this.$el).find('#act_edit').show();
            $(this.$el).find('#act_edit_apprflow').show();
        },

        getShowUrlBtn: function () {
            if ((this.docStatus == "INPROGRESS") || (this.docStatus == "COMPLETE") || (this.docStatus == "RETURN")) {
                return true;
            } else {
                return false;
            }
        },

        actSave: function () {
            this.trigger('saved');
        },

        actCancel: function () {
            this.trigger('canceled');
        },

        actEditApprFlow: function () {
            this.trigger('editApprFlow');
        },

        actForceReturn: function () {
            this.trigger('forceReturn');
        },

        actEdit: function () {
            this.trigger('edit');
        },

        actList: function () {
            this.trigger('actList');
        },

        actDocPrint: function () {
            this.trigger('docPrint');
        },

        actDelete: function () {
            this.trigger('deleted');
        },

        actForceRecvReturned: function () {
            this.trigger('forceRecvReturned');
        },

        actReassignReceiver: function () {
            this.trigger('reassignReceiver');
        },

        actCancelReception: function () {
            this.trigger('cancelReception');
        },
    });

    return ToolbarView;
});