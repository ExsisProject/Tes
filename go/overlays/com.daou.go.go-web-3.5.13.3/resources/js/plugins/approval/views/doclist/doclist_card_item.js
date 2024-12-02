// 문서목록에서 개별 문서에 대한 View
define([
        "jquery",
        "underscore",
        "backbone",
        "when",
        "app",
        "approval/models/doclist_item",
        "views/profile_card",
        "approval/views/document/apprflow",
        "approval/views/document_attach",
        "hgn!approval/templates/doclist_card_item",
        "i18n!nls/commons",
        "i18n!approval/nls/approval"
    ],
    function (
        $,
        _,
        Backbone,
        when,
        GO,
        DocListItemModel,
        ProfileCardView,
        ApprovalFlowView,
        DocumentAttachFileView,
        DocListItemTpl,
        commonLang,
        approvalLang
    ) {
        var lang = {
            '팝업보기': commonLang['팝업보기'],
            '기안일': approvalLang['기안일'],
            '기안자': approvalLang['기안자'],
            '결재양식': approvalLang['결재양식'],
            '첨부': approvalLang['첨부'],
            '결재하기': approvalLang['결재하기'],
            '수신': approvalLang['수신'],
            '긴급': approvalLang['긴급'],
            '댓글': approvalLang['댓글'],
            '의견': approvalLang['의견'],
            '첨부': approvalLang['첨부'],
            '지연': approvalLang['지연']
        };

        var DocListCardView = Backbone.View.extend({

            tagName: 'section',
            className: 'card_item approval_home_card',

            events: {
                'click span.title': 'showUrl',
                'click a.btn_lead': 'showUrl',
                'click span.popup': 'showPopup'
            },

            initialize: function (options) {
                this.options = options || {};
                this.useHold = this.options.useHold || false;
                _.bindAll(this, 'render');
            },

            render: function () {
                var columns = {
                    '첨부': approvalLang['첨부']
                };
                var doc = {
                    id: this.model.getDocumentId(),
                    draftedAt: this.model.getDraftedAt(),
                    formName: this.model.get('formName'),
                    title: this.model.get('title'),
                    hasAttach: this.model.hasAttach(),
                    isReceive: this.model.isReceive(),
                    attachCount: this.model.get('attachCount'),
                    commentCount: this.model.get('commentCount'),
                    replyCount: this.model.get('replyCount'),
                    drafterId: this.model.get('drafterId'),
                    drafterName: this.model.get('drafterName'),
                    drafterPositionName: this.model.get('drafterPositionName'),
                    docStatus: this.model.getDocStatusName(),
                    statusClass: this.model.getDocStatusClass(),
                    completedAt: this.model.getCompletedAt(),
                    docNum: this.model.get('docNum'),
                    showUrl: this.model.getShowUrl(),
                    isEmergency: this.model.get('isEmergency'),
                    holdStatusName: this.model.getHoldStatusName(),
                    holdStatusClass: this.model.getHoldStatusClass(),
                    hasAdditionalInfo: this.model.get('commentCount') || this.model.get('replyCount') || this.model.get('attachCount'),
                    isDelay: this.model.get('isDelay')
                };
                this.$el.html(DocListItemTpl({
                    doc: doc,
                    lang: lang,
                    columns: columns,
                    useOngoingState: (!this.useHold || this.model.getHoldStatusClass() != 'defer') ? true : false
                }));
                if (doc.isDelay) {
                    this.$el.addClass("caution");
                }
                return this;
            },

            showUrl: function (e) {
                var url = this.model.getShowUrl();
                GO.router.navigate(url, true);
            },

            showPopup: function (e) {
                var url = this.model.getFullShowUrl() + "/popup";

                window.open(url, '', 'locationno, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
            }
        });

        return DocListCardView;
    });