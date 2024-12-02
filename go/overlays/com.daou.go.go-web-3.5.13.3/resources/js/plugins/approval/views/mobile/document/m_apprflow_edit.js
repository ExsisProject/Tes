// 결재이력
define([
        // 필수
        "jquery",
        "backbone",
        "app",

        "approval/models/activity",
        "approval/models/appr_flow",

        "approval/collections/activities",
        "approval/collections/appr_activity_groups",


        "approval/views/mobile/document/m_apprflow_activity_groups",
        "approval/views/mobile/document/m_apprflow_readers",
        "views/mobile/layer_toolbar",

        "hgn!approval/templates/mobile/document/m_apprflow_edit",
        "i18n!nls/commons",
        "i18n!approval/nls/approval"
    ],

    function (
        $,
        Backbone,
        App,
        ActivityModel,
        ApprFlowModel,
        ActivityCollection,
        ApprActivityGroupCollection,
        ActivityGroupsView,
        DocReadersView,
        LayerToolbarView,
        ApprflowTbl,
        commonLang,
        approvalLang
    ) {

        var lang = {
            '결재선': approvalLang['결재선'],
            '참조자': approvalLang['참조자'],
            '수신자': approvalLang['수신자'],
            '열람자': approvalLang['열람자']
        };

        var ApprFlowView = Backbone.View.extend({
            events: {
                "click #saveApprFlow": "saveApprFlow",
                "click li[data-tabid]": "changeTab"
            },
            initialize: function (options) {

                this.options = options || {};
                this.release();

                this.docId = this.options.docId;
                this.toolBarData = this.options.toolBarData;
                this.model = this.options.model;
                this.docStatus = this.model.get('document').docStatus;
                this.actionCheck = this.model.get('actionCheck');
                this.includeAgreement = this.model.get('docInfo').includeAgreement;
                this.isArbitraryCheckVisible = this.model.getActionCheck('isArbitraryCheckVisible');
                this.isPermissibleArbitraryDecision = this.model.getActionCheck('isPermissibleArbitraryDecision');
                this.apprAllowType = 'ALL' //@TODO 2.0.2에서 이 값을 서버에서 데이터를 받을수 있도록한다. 'ALL' 모든 부서 선택가능. 'USER' 유저만 선택가능.
                this.observer = _.extend({}, Backbone.Events);

                this.viewerType = '';
                if (options.hasOwnProperty('viewerType')) {
                    this.viewerType = options.viewerType;
                }

                if (options.hasOwnProperty('masterAuthModel')) {
                    this.masterAuthModel = options.masterAuthModel;
                }

                if (_.isNull(this.model)) {
                    this.isNullGroup = true;
                }
                this.__disabled__ = !this.editable();

            },

            render: function () {

                var _this = this;
                var isCurrent = function () {
                    return (typeof this.status != 'undefined' && this.status == "WAIT" && !this.postCheck) ? true : false;
                };

                var isActive = (this.status) ? true : false;

                this.layerToolbarView = LayerToolbarView;
                this.layerToolbarView.render(this.toolBarData);

                this.activityGroups = this.getActivityGroups();
                var tpl = ApprflowTbl({
                    lang: lang,
                    actionCheck: this.actionCheck
                });
                this.$el.html(tpl);

                var itemView = new ActivityGroupsView({
                    model: this.model,
                    activityGroups: this.activityGroups,
                    actionCheck: this.actionCheck,
                    isArbitraryCheckVisible: this.isArbitraryCheckVisible,
                    isPermissibleArbitraryDecision: this.isPermissibleArbitraryDecision,
                    disable: this.__disabled__,
                    includeAgreement: this.includeAgreement,
                    apprAllowType: this.apprAllowType,
                    isReceiveDoc: this.isReceiveDoc(),
                    docStatus: this.docStatus,
                    observer: this.observer
                });

                itemView.render();
                $("#apprline").append(itemView.$el);

                if (this.actionCheck.referenceActive) {
                    //참조자탭
                    var refererView = new DocReadersView({
                        readerCollection: "docReferenceReaders",
                        model: this.model,
                        observer: this.observer
                    });
                    $('#referer').append(refererView.render().$el);
                }

                if (this.actionCheck.receptionActive) {
                    //수신자탭
                    var receptionView = new DocReadersView({
                        readerCollection: "docReceptionReaders",
                        model: this.model,
                        observer: this.observer
                    });
                    $('#receiver').append(receptionView.render().$el);
                }

                if (this.actionCheck.readerActive) {
                    //열람자탭
                    var readingView = new DocReadersView({
                        readerCollection: "docReadingReaders",
                        model: this.model,
                        observer: this.observer
                    });
                    $('#reader').append(readingView.render().$el);
                }
                return this;
            },
            saveApprFlow: function () {
                //결재선 그룹 저장(m_apprflow_activity_groups.js 에 구현)
                this.observer.trigger('saveApprFlowActivityGroups');
                //참조자,수신자,열람자 저장(m_apprflow_readers.js 에 구현)
                this.observer.trigger('saveApprFlowReaders');
                this.model.trigger('sync');
                //결재중 결재선 변경시 저장
                this.model.trigger('add');
            },
            changeTab: function (e) {
                var target = $(e.currentTarget);
                var selectTabId = target.attr('data-tabid');
                target.closest('ul').find('li').removeClass('on');
                target.addClass('on');
                var targetTab = $('div.tab_content div.form_table');
                targetTab.hide();
                $("#" + selectTabId).show();
            },
            editable: function () {
                if (this.model.isStatusComplete() || this.model.isStatusReturned()) {
                    return false;
                }
                var canEditViewType = this.viewerType === 'docmaster' || this.viewerType === 'formadmin';
                var hasAuthWrite = this.masterAuthModel && this.masterAuthModel.authWrite();
                var canEditable = canEditViewType && hasAuthWrite;
                return canEditable || this.model.Permission.canEditApprLine();
            },
            isReceiveDoc: function () {
                var docData = this.model.get('document');
                return docData['apprStatus'] == 'TEMPSAVE' && docData['docStatus'] == 'RECEIVED' && docData['docType'] == 'RECEIVE';
            },

            getActivityGroups: function () {
                return new ApprActivityGroupCollection(this.model.apprFlowModel.get('activityGroups'));
                if (this.model.get('useAutoApprFlow')) { //자동결재를 사용할경우
                    var flows = new ApprFlowCollection(this.model.autoApprFlowModel.get('autoApprFlows'));
                    var flow = flows.at(0);

                    return new ApprActivityGroupCollection(flow.get('activityGroups'));
                } else {
                    return new ApprActivityGroupCollection(this.model.apprFlowModel.get('activityGroups'));
                }
            },
            getCurrentActivity: function () {
                return this.model.getCurrentActivity();
            },

            release: function () {
                this.$el.off();
                this.$el.empty();
            }
        });

        return ApprFlowView;
    });