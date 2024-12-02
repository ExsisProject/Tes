// 문서목록에서 개별 문서에 대한 View
define([
        "jquery",
        "underscore",
        "backbone",
        "app",
        "approval/models/doclist_item",
        "views/profile_card",
        "approval/views/doclist/doclist_item_info",
        "approval/views/document/apprflow",
        "approval/views/document_attach",
        "hgn!approval/templates/doclist_item",
        "hgn!approval/templates/doc_manager_list_item",
        "i18n!nls/commons",
        "i18n!approval/nls/approval"
    ],
    function (
        $,
        _,
        Backbone,
        GO,
        DocListItemModel,
        ProfileCardView,
        DocListItemInfoView,
        ApprovalFlowView,
        DocumentAttachFileView,
        DocListItemTpl,
        DocManagerItemTpl,
        commonLang,
        approvalLang
    ) {
        var DocListView = Backbone.View.extend({

            tagName: 'tr',
            events: {
                'click a#attach': 'showAttach',
                'click span.read': 'showDocInfo',
                'click span.notyet': 'showDocInfo',
                'click span.finish': 'showDocInfo',
                'click span.temp': 'showDocInfo',
                'click span.defer': 'showDocInfo',
                'click span.wait': 'showDocInfo',
                'click .writer span.txt': 'showUserProfile',
                'click .drafter span.txt': 'showOriginUserProfile',
                'click td.subject a:not([class])': 'showUrl',
                'click a.popup': 'showPopup'
            },

            initialize: function (options) {
                this.options = options || {};
                _.bindAll(this, 'render', 'showDocInfo', 'showAttach', 'showUserProfile');
                this.total = this.options.total;
                this.columns = this.options.columns;
                this.deptId = this.options.deptId;
                this.listType = this.options.listType;
                this.isManager = !!this.options.isManager;
                this.isCheckboxVisible = _.isBoolean(this.options.isCheckboxVisible) ? this.options.isCheckboxVisible : false;
                this.isShowUrl = _.isBoolean(this.options.isShowUrl) ? this.options.isShowUrl : true;
                this.isReception = _.isBoolean(this.options.isReception) ? this.options.isReception : false;
                //결재상태 레이어 사용여부
                this.useDocInfo = _.isBoolean(this.options.useDocInfo) ? this.options.useDocInfo : true;
            },

            render: function () {
                var tpl = '';
                var listType = this.listType;
                this.model.setListType(listType);
                var doc = {
                    id: this.model.getDocumentId(),
                    versionId: this.model.getVersionId(),
                    receptionOriginId: this.model.getReceptionOriginId(),
                    draftedAt: this.model.getDraftedAt(),
                    receptionOriginDraftedAt: this.model.getOriginDraftedAt(),
                    createdAt: this.model.getCreatedAt(),
                    sentAt: this.model.getSentAt(),
                    updatedAt: this.model.getUpdatedAt(),
                    arrivedAt: this.model.getArrivedAt(),
                    receivedAt: this.model.getReceivedAt(),
                    createdAt: this.model.getCreatedAt(),
                    formName: this.model.get('formName'),
                    title: this.model.get('title'),
                    hasAttach: this.model.hasAttach(),
                    isReceive: this.model.isReceive(),
                    isReadable: this.model.isReadable(),
                    attachCount: this.model.get('attachCount'),
                    commentCount: this.model.get('commentCount'),
                    replyCount: this.model.get('replyCount'),
                    drafterId: this.model.get('drafterId'),
                    drafterName: this.isReception ? this.model.get('receptionOriginDrafterName') : this.model.get('drafterName'),
                    receptionOriginDrafterId: this.model.get('receptionOriginDrafterId'),
                    docStatus: this.model.getDocStatusName(),
                    docTypeName: this.model.getDocType(),
                    statusClass: this.model.getDocStatusClass(),
                    completedAt: this.model.getCompletedAt(),
                    receptionOriginCompletedAt: this.model.getReceptionOriginCompletedAt(),
                    docNum: this.model.get('docNum'),
                    receptionOriginDocNum: this.model.get('receptionOriginDocNum'),
                    isNew: this.model.get('isNew'),
                    isCompleted: this.model.isCompleted(),
                    receiverUserId: this.model.get('receiverUserId'),
                    receiverUserName: this.model.getReceiverUserName(),
                    receiverDeptName: this.model.getReceiverDeptName(),
                    receivedDocOwnerDeptId: this.model.get('receivedDocOwnerDeptId'),
                    receptionOriginDrafterDeptName: this.model.getReceptionOriginDrafterDeptName(),
                    receivedDocOwnerDeptName: this.model.getReceivedDocOwnerDeptName(),
                    receiveStatusName: this.model.getReceiveStatusName(),
                    deptFolderName: this.model.get('deptFolderName'),
                    userFolderName: this.model.get('userFolderName'),
                    showUrl: this.model.getShowUrl(),
                    isEmergency: this.model.get('isEmergency'),
                    isReception: this.isReception,
                    isTempsave: this.model.isTempsave(),
                    holdStatusName: this.model.getHoldStatusName(),
                    holdStatusClass: this.model.getHoldStatusClass(),
                    currentActivityUsers: this.model.get('currentActivityUsers'),
                    finalActivityUsers: this.model.get('finalActivityUsers'),
                    officialApprovalName: this.model.get('approverName'),
                    officialStateName: this.model.getOfficialStateName(),
                    officialStateClass: this.model.getOfficialStateClass(),
                    drafterDeptName: this.isReception ? this.model.get('receptionOriginDrafterDeptName') : this.model.get('drafterDeptName'),
                    officialFormName: this.model.get('officialFormName'),
                    officialSenderName: this.model.get('officialSenderName'),
                    officialSignName: this.model.get('officialSignName'),
                    useSelfApproval: this.model.get('useSelfApproval'),
                    receptionOriginCompanyId: this.model.get('receptionOriginCompanyId'),
                    useIntegration: this.model.getIntegration(),
                    hasAdditionalInfo: this.model.get('commentCount') || this.model.get('replyCount'),
                    isDelay: this.model.get('isDelay')
                };

                var lang = $.extend(approvalLang, {"팝업보기": commonLang['팝업보기']});
                this.$el.addClass(doc.isNew ? 'read_no' : '');

                var isSendDoc = false;
                if (this.listType == 'sendDoc') {
                    isSendDoc = true;
                }

                if (this.isManager) {
                    tpl = DocManagerItemTpl({
                        lang: lang,
                        doc: doc,
                        isCheckboxVisible: this.isCheckboxVisible,
                        columns: this.columns,
                        deptId: this.deptId,
                        isSendDoc: isSendDoc,
                        useDocInfo: this.useDocInfo,
                        isActivePopup: this.isActivePopup()
                    });
                } else {
                    tpl = DocListItemTpl({
                        doc: doc,
                        isCheckboxVisible: this.isCheckboxVisible,
                        isShowUrl: this.isShowUrl,
                        columns: this.columns,
                        deptId: this.deptId,
                        isSendDoc: isSendDoc,
                        lang: lang,
                        useDocInfo: this.useDocInfo
                    });
                }

                this.$el.html(tpl);
                return this;
            },

            isActivePopup: function () {
                if(this.model.get('docStatus') == 'DRAFT_WAITING' ||
                    this.model.get('docStatus') == 'RECV_RETURNED' ||
                    this.model.get('docStatus') == 'RECV_WAITING' ||
                    (this.model.get('docStatus') == 'TEMPSAVE' && this.model.get('apprStatus') == 'CANCEL')) {
                    return false;
                }

                return true;
            },

            // 첨부파일 팝업레이어
            showAttach: function (e) {
                e.stopPropagation();
                if (!this.model.isReadable()) {
                    return;
                }
                var documentAttachFileView = new DocumentAttachFileView({
                    docId: this.listType == 'sendDoc' ? this.model.getReceptionOriginId() : this.model.getDocumentId(),
                });

                documentAttachFileView.render();
            },

            showDocInfo: function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (! this.model.isReadable() || ! this.useDocInfo || ! this.isActivePopup()) {
                    return;
                }
                var docListItemInfoView = new DocListItemInfoView({
                    docId: this.model.getDocumentId(),
                    // 발송 문서함에서 수신문서의 결재선을 보는것이 맞는건지..? docId : this.listType == 'sendDoc' ? this.model.getReceptionOriginId() : this.model.getDocumentId(),
                });

                docListItemInfoView.render();
            },

            // 사용자프로필 팝업레이어
            showUserProfile: function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (!this.model.isReadable()) {
                    return;
                }
                var userId = this.model.get('drafterId') ? this.model.get('drafterId') : this.model.get('receiverUserId');
                if (userId) {
                    ProfileCardView.render(userId, e.currentTarget);
                }
            },

            // 사용자프로필 팝업레이어
            showOriginUserProfile: function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (!this.model.isReadable()) {
                    return;
                }
                if (this.model.get('receptionOriginDrafterId')) {
                    ProfileCardView.render(this.model.get('receptionOriginDrafterId'), e.currentTarget);
                }
            },

            showUrl: function (e) {
                var url = this.model.getShowUrl();
                var listUrl = GO.router.getUrl();
                var baseUrl = listUrl.substring(0, listUrl.indexOf("?"));
                sessionStorage.setItem('list-history-baseUrl', baseUrl);
                sessionStorage.setItem('list-total-count', this.total);
                sessionStorage.setItem('list-history-doc-id', this.listType == 'sendDoc' ? this.model.getReceptionOriginId() : this.model.getDocumentId());
                sessionStorage.setItem('list-history-pageNo', GO.router.getSearch().page ? GO.router.getSearch().page : 0);
                sessionStorage.setItem('list-history-pageSize', GO.router.getSearch().offset ? GO.router.getSearch().offset : 20);
                sessionStorage.setItem('list-history-property', GO.router.getSearch().property ? GO.router.getSearch().property : '');
                sessionStorage.setItem('list-history-direction', GO.router.getSearch().direction ? GO.router.getSearch().direction : '');
                sessionStorage.setItem('list-history-searchtype', GO.router.getSearch().searchtype ? GO.router.getSearch().searchtype : '');
                sessionStorage.setItem('list-history-keyword', GO.router.getSearch().keyword ? GO.router.getSearch().keyword : '');
                sessionStorage.setItem('list-history-duration', GO.router.getSearch().duration ? GO.router.getSearch().duration : '');
                sessionStorage.setItem('list-history-fromDate', GO.router.getSearch().fromDate ? GO.router.getSearch().fromDate : '');
                sessionStorage.setItem('list-history-toDate', GO.router.getSearch().toDate ? GO.router.getSearch().toDate : '');

                var searchParam = $.param(GO.router.getSearch());
                var navigateUrl = url + (searchParam ? "?" + searchParam : "");
                GO.router.navigate(navigateUrl, true);
            },

            showPopup: function (e) {
                var url = this.model.getFullShowUrl() + "/popup";

                window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
            }
        });

        return DocListView;
    });