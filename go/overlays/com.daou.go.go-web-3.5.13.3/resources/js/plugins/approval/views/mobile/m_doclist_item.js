// 문서목록에서 개별 문서에 대한 View
define([
        "views/mobile/m_more_list",
        "jquery",
        "backbone",
        "app",
        "hgn!approval/templates/mobile/m_doclist_item_unit",
        "i18n!nls/commons",
        "i18n!approval/nls/approval"
    ],
    function (
        MoreView,
        $,
        Backbone,
        GO,
        DocListItemUnitTpl,
        commonLang,
        approvalLang
    ) {
        return MoreView.extend({
            initialize: function (options) {
                this.options = options || {};
                this.total = this.options.total;
                this.listType = this.options.listType;
                this.useHold = this.options.useHold;
                this.useDocStatus = _.isBoolean(this.options.useDocStatus) ? this.options.useDocStatus : false;
                this.useOfficialConfirm = _.isBoolean(this.options.useOfficialConfirm) ? this.options.useOfficialConfirm : false;
                this.isCheckboxVisible = _.isBoolean(this.options.isCheckboxVisible) ? this.options.isCheckboxVisible : false;
                _.bindAll(this, 'render');
            },
            tagName: 'li',
            events: {
                'vclick .tit': 'showUrl'
            },
            render: function () {
                this.model.setListType(this.listType);
                var doc = {
                    id: this.model.getDocumentId(),
                    isReceive: this.model.isReceive(),
                    draftedAt: this.model.getDraftedAt(),
                    receivedAt: this.model.getReceivedAt(),
                    formName: this.model.get('formName'),
                    title: this.model.get('title'),
                    drafterId: this.model.get('drafterId'),
                    drafterName: this.model.get('drafterName'),
                    docStatus: this.model.getDocStatusName(),
                    isNew: this.model.get('isNew'),
                    receiveStatusClass: this.model.getReceiveStatusClass(),
                    receiveStatusName: this.model.getReceiveStatusName(),
                    docTypeName: this.model.getDocType(),
                    statusClass: this.model.getDocStatusClass(),
                    drafterPositionName: this.model.get('drafterPositionName'),
                    receiverUserName: this.model.getReceiverNameWithPosition(),
                    receiverUserPositionName: this.model.get('receiverUserPositionName'),
                    deptFolderName: this.model.get('deptFolderName'),
                    userFolderName: this.model.get('userFolderName'),
                    completedAt: this.model.getCompletedAt(),
                    docNum: this.model.get('docNum'),
                    isEmergency: this.model.get('isEmergency'),
                    showUrl: this.model.getShowUrl(),
                    holdStatusName: this.model.getHoldStatusName(),
                    holdStatusClass: this.model.getHoldStatusClass(),
                    officialStateName: this.model.getOfficialStateName(),
                    officialStateClass: this.model.getOfficialStateClass(),
                    commentCount: this.model.get('commentCount'),
                    replyCount: this.model.get('replyCount'),
                    hasCommentReply: this.model.get('commentCount') || this.model.get('replyCount'),
                    isReceiveWait: this.model.isReceiveWating(),
                    isDelay: this.model.get('isDelay'),
                    attachCount: this.model.get('attachCount'),
                    hasAdditionalInfo: this.model.get('attachCount') || this.model.get('commentCount') || this.model.get('replyCount'),
                };
                this.$el.html(DocListItemUnitTpl({
                    id: this.model.getDocumentId(),
                    doc: doc,
                    deptId: this.deptId,
                    lang: approvalLang,
                    useDocStatus: this.useDocStatus,
                    useOfficialConfirm: this.useOfficialConfirm,
                    isCheckboxVisible: this.isCheckboxVisible,
                    useOngoingState: (!this.useHold || this.model.getHoldStatusClass() != 'defer') ? true : false
                }));
                this.$el.find('span.subject span').addClass(doc.isNew ? 'read_no' : '');

                return this;
            },

            showUrl: function (e) {
                this.offset = GO.config('mobileListOffset') || 20;
                this.setSessionInfo(e);
                e.preventDefault();
                e.stopPropagation();
                var value = $(e.currentTarget);
                if (_.isUndefined(value)) {
                    return;
                }
                var url = this.model.getShowUrl();
                var listUrl = GO.router.getUrl();
                sessionStorage.setItem(GO.constant("navigator", "BASE-URL"), listUrl);
                sessionStorage.setItem(GO.constant("navigator", 'KEYWORD'), '');
                sessionStorage.setItem(GO.constant("navigator", "TOTAL-COUNT"), this.total);
                GO.router.navigate(url, true);
            }
        });
    });
