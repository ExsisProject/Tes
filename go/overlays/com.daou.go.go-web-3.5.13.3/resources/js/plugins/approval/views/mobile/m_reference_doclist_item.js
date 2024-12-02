// 문서목록에서 개별 문서에 대한 View
define([
        "jquery",
        "backbone",
        "app",
        "hgn!approval/templates/mobile/m_reference_doclist_item",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",

        "approval/models/ref_document",

        "approval/views/mobile/document/m_preview"
    ],
    function (
        $,
        Backbone,
        GO,
        ReferenceDocListItemTpl,
        commonLang,
        approvalLang,
        RefDocumentModel,
        PreView
    ) {
        return Backbone.View.extend({
            initialize: function (options) {
                this.options = options || {};
                this.total = this.options.total;
                this.listType = this.options.listType;
                this.isCheckboxVisible = _.isBoolean(this.options.isCheckboxVisible) ? this.options.isCheckboxVisible : false;
                _.bindAll(this, 'render');
            },
            tagName: 'li',
            events: {
                'vclick .tit': 'refDocPreview'
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
                    attachCount: this.model.get('attachCount'),
                    hasAdditionalInfo: this.model.get('attachCount') || this.model.get('commentCount') || this.model.get('replyCount'),
                };
                this.$el.html(ReferenceDocListItemTpl({
                    doc: doc,
                    deptId: this.deptId,
                    lang: approvalLang,
                    isCheckboxVisible: this.isCheckboxVisible
                }));
                this.$el.find('span.subject span').addClass(doc.isNew ? 'read_no' : '');
                return this;
            },
            refDocPreview: function (e) {
                e.preventDefault();
                e.stopPropagation();
                var refDocModel = RefDocumentModel.create(this.model.getDocumentId());
                refDocModel.fetch({
                        async: false,
                        success: $.proxy(function (data) {
                            var docBody = data.get('document').docBodyContent;
                            var docAttaches = data.get('document').attaches;
                            var docReferences = data.get('document').references;

                            this.preView = new PreView({
                                title: commonLang["미리보기"],
                                docId: this.docId,
                                docBody: docBody,
                                attaches: docAttaches,
                                references: docReferences,
                                callback: function (e) {
                                    this.$el.remove();
                                    if (e) {
                                        e.stopPropagation();
                                    }
                                    return false;
                                }
                            });
                            this.preView.render();
                            $('html').scrollTop(0);
                        }, this),
                        error: function (collection, response, options) {
                            alert(response.responseJSON.message);
                        }
                    }
                );
            }
        });
    });