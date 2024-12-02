;(function () {
    define([
            // libraries...
            "jquery",
            "backbone",
            "hogan",
            "app",

            "approval/models/doclist_item",
            "approval/models/appr_flow",
            "approval/models/document",
            "approval/models/user_appr_config",
            "approval/collections/appr_flows",


            "approval/views/mobile/document/m_apprflow",
            "approval/views/mobile/document/m_apprflow_line",
            "views/mobile/header_toolbar",
            "views/mobile/m_font_resize",
            "approval/views/mobile/document/m_toolbar",

            "approval/components/appr_form_integrator",

            "approval/views/mobile/document/m_create_docinfo",
            "approval/views/mobile/document/m_document",
            "approval/views/mobile/document/m_appr_attach_file",
            "approval/views/mobile/document/m_docinfo",
            "approval/views/mobile/document/m_action_document",
            "approval/views/mobile/document/m_doc_receive",
            "approval/views/mobile/document/m_apprflow_edit",
            "approval/views/mobile/document/m_appr_receiver_popup",

            "approval/views/mobile/document/m_preview",
            "hgn!approval/templates/mobile/document/m_main",
            "hgn!approval/templates/mobile/document/m_create_draft",
            "i18n!nls/commons",
            "i18n!approval/nls/approval",
            "jquery.go-validation",
            "GO.util",
            "iscroll"
        ],
        function (
            $,
            Backbone,
            Hogan,
            GO,

            DocListItemModel,
            ApprFlowModel,
            ApprDocumentModel,
            UserApprConfigModel,
            ApprFlowCollection,

            ApprFlowView,
            ApprFlowLineView,
            HeaderToolbarView,
            FontResize,
            ToolbarView,

            FormIntegrator,

            CreateDocInfoView,
            DocumentView,
            ApprAttachFileView,
            DocInfoView,
            DocumentActionView,
            DocReceiveView,
            DocumentApprFlowEditView,
            ApprReceiverPopupView,

            PreView,
            MainTpl,
            CreateDraftTpl,
            commonLang,
            approvalLang
        ) {

            var lang = {
                'approval': approvalLang['전자결재'],
                'move_to_home': commonLang['홈으로 이동']
            };

            var ApprActionModel = Backbone.Model.extend({
                initialize: function (docId) {
                    this.docId = docId;
                },

                url: function () {
                    var url = ['/api/approval/document', this.docId, 'approval'].join('/');
                    return url;
                }
            });

            var DocumentModel = ApprDocumentModel.extend({
                initialize: function (options) {
                    this.options = options || {};
                    if (!_.isEmpty(this.options.docId)) {
                        this.docId = this.options.docId;
                    }
                    ApprDocumentModel.prototype.initialize.apply(this, arguments);
                },

                url: function () {
                    return (this.docId) ? "/api/approval/document/" + this.docId : "/api/approval/document/";
                },

                setId: function (docId) {
                    this.docId = docId;
                }
            });


            var DocReceiveModel = Backbone.Model.extend({
                initialize: function (docId, deptId) {
                    this.docId = docId;
                    this.deptId = deptId;
                },

                url: function () {
                    var url = ['/api/approval/document', this.docId, 'receptionreader', this.deptId].join('/');
                    return url;
                }
            });

            /**
             * 수신 처리 모델
             */
            var ReceptionSaveModel = Backbone.Model.extend({
                // 접수, 접수취소, 반송, 재접수, 접수취소및 반려
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
                    var lastPath = "reception"; // 수신 URL path
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

            var MobileDraftableFormCollection = Backbone.Collection.extend({
                url: function () {
                    return '/api/approval/apprform/tree/mobile';
                },
                isInclude: function (formId) {
                    var self = this;
                    self.isIncludeForm = false;
                    this.toJSON().forEach(function (form) {
                        if (form.metadata.id == formId) {
                            self.isIncludeForm = true;
                        }
                    });
                    return self.isIncludeForm;
                }
            });

            var MainView = Backbone.View.extend({
                    el: '#content',
                    initialize: function (options) {
                        var self = this;
                        this.allowAction = true;
                        GO.util.appLoading(true);
                        this.options = options || {};
                        this.formId = this.options.formId;
                        this.deptId = this.options.deptId;
                        this.deptFolderId = GO.util.getQueryParam('deptFolderId');
                        this.docId = this.options.docId;
                        this.refDocId = this.options.refDocId;
                        this.docType = this.options.docType;
                        this.type = _.isUndefined(this.options.type) ? "DOCUMENT" : this.options.type;

                        this.formIntegrator = new FormIntegrator();
                        this.mobileDraftableFormCollection = new MobileDraftableFormCollection();
                        this.mobileDraftableFormCollection.fetch({async: false});

                        //새결재 기안
                        if (this.type == "CREATE") {
                            this.model = DocumentCreateModel.create(this.formId, this.deptId, null);
                        } else if (this.type == "REAPPLY") {
                            this.model = DocumentReapplyModel.create(this.docId);
                        } else {
                            this.model = new DocumentModel({docId: this.options.docId});
                        }
                        this.documentModelFetch();
                    },
                    documentModelFetch: function () {
                        var self = this;
                        this.model.fetch({
                            async: false,
                            success: function (model, result) {
                                self.initDocument();
                            },
                            error: function (model, error) {
                                GO.util.linkToErrorPage(error);
                            },
                            reset: true
                        });

                    },

                    initDocument: function () {
                        this.docId = this.model.get('document').documentId;
                        this.isPublic = this.model.get('docInfo').isPublic;
                        this.isPassword = this.model.get('actionCheck').usePassword;

                        // 양식연동 관련 데이타 저장
                        this.formIntegrator.setDocVariables(this.model.get('document').variables);
                        this.formIntegrator.setStatus(this.type == "REAPPLY" ? this.type : this.model.get('document').docStatus);

                        var docStatus = this.model.get('document').docStatus;

                        // 결재선변경시 문서의 결재방에 적용
                        this.listenTo(this.model, "add", this.changeApprFlowAndDocInfo, this);

                        this.headerToolbarView = HeaderToolbarView;
                        this.toolBarData = {
                            //title : (docStatus == "CREATE" || docStatus =="TEMPSAVE") ? approvalLang['결재 작성'] : approvalLang['상세 내용 조회'],
                            actionMenu: this.getActionMenu()
                        };
                        if (docStatus == "CREATE" || docStatus == "TEMPSAVE") {
                            this.toolBarData.isClose = true;
                            this.toolBarData.closeCallback = $.proxy(this.tempSaveDocument, this);
                        } else {
                            this.toolBarData.isPrev = true;
                        }

                        this.initWindowEvent();
                        this.toolbarBindEvent();

                        //문서본문view
                        this.documentView = new DocumentView({
                            type: this.type,
                            title: this.title,
                            docId: this.model.get('document').documentId,
                            model: this.model.get('document'),
                            infoData: this.model.get("docInfo"),
                            actionModel: this.model.get('actionCheck'),
                            formIntegrator: this.formIntegrator
                        });

                        this.documentView.bind('docPreview', this.docPreview, this);

                        //결재선view
                        this.createApprFlowView();

                        //문서정보view
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
                        // 첨부파일 업로드
                        this.apprAttachFileView = new ApprAttachFileView({
                            docModel: this.model.get('document'),
                            toolBarData: this.toolBarData,
                            mode: this.isTempsaveOrReapply() ? "edit" : "read"
                        });

                    },
                    render: function () {

                        if (this.type == "CREATE" || this.type == "INTEGRATION") {
                            //새결재
                            this.renderDraft();
                        } else {
                            //기존결재뷰
                            this.renderView();
                        }

                        if (this.useAutoApprFlow()) {
                            this.bindAutoFlowComponentEvent();
                            this.reSetApprFlowView();
                        }

                    },
                    /*
		 * 이 결재그룹이 자동결재선을 사용하는지에 대한 여부
		 */
                    useAutoApprFlow: function () {
                        return this.model.get('useAutoApprFlow') && (this.isTempsaveOrReapply() || this.type == 'CREATE' || this.type == 'INTEGRATION' || (this.type == 'DOCUMENT' && this.model.get('document').docStatus == 'CREATE')); // 기안 or 임시저장  이면서 자동결재를 사용할 경우
                    },
                    hasAutoFlowOptionComponent: function () {
                        return this.documentView.$el.find('[name="apprLineRuleOption"]').length > 0;
                    },
                    hasAutoFlowAmountComponent: function () {
                        return this.documentView.$el.find('[name="apprLineRuleAmount"]').length > 0;
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
		 * activity에 기안자가 중복으로 들어가있는지 확인한다.(api에러 상황은 아님, 자동결재 셋팅에 따라 중복으로 내려올수 있음.)
		 */
                    hasDupleDraftActivities: function (apprActivityGroup) {
                        var draftedUserId = _.first(apprActivityGroup.activities)['userId'];
                        return _.where(apprActivityGroup.activities, {userId: draftedUserId}).length > 1;
                    },
                    /*
		 * 자동결재선 컴포넌트에 이벤트를 걸어줌. 단일이나 복수 선택에는 항상 change이벤트를 걸고 결재금액 컴포넌트는 금액을 사용할 경우에만 이벤트를 걸어준다.
		 */
                    bindAutoFlowComponentEvent: function () {
                        if (this.hasAutoFlowOptionComponent()) {
                            this.documentView.$el.find('[name="apprLineRuleOption"]').off('change');
                            this.documentView.$el.find('[name="apprLineRuleOption"]').on('change', _.bind(this.reSetApprFlowView, this));
                        }

                        var autoApprFlowModel = this.getTargetAutoApprFlowModel();
                        var autoApprActivityGroup = _.first(autoApprFlowModel.get('activityGroups')); //자동결재선은 항상 한개의 그룹으로만 내려옴.
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
                    removeDupleActivityGroup: function(apprActivityGroup) {
                        var draftedUserId = _.first(apprActivityGroup.activities)['userId'];
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
                    reSetApprFlowView: function () {

                        var autoApprFlowModel = this.getTargetAutoApprFlowModel();
                        var firstAutoApprActivityGroup = _.first(autoApprFlowModel.get('activityGroups')); //자동결재선은 항상 한개의 그룹으로만 내려옴.
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
                        this.syncApprFlowLine();
                        this.syncApprFlowView();
                    },
                    renderDraft: function () {
                        //결재기안시 상단 정보 view
                        this.createDocInfo = new CreateDocInfoView({
                            isCreate: true,
                            documentModel: this.model.get('document'),
                            drafterDeptFolderInfos: this.drafterDeptFolderInfos,
                            mobileDraftableFormCollection: this.mobileDraftableFormCollection,
                            formId: this.formId,
                            deptId: this.deptId,
                            docInfo: this.model.get('docInfo'),
                            apprLineModel: this.model.get('apprFlow')
                        });
                        this.$el.html(CreateDraftTpl());
                        this.headerToolbarView.render(this.toolBarData);
                        this.assign(this.toolbarView, 'div.tool_bar');
                        this.documentView.setElement(this.$('#document_view')).render().then().otherwise(function() {
                            alert(approvalLang["연동 양식 스크립트 경로가 유효하지 않습니다."]);
                        });
                        this.append(this.docInfoView, '#docinfo_section');
                        this.assign(this.createDocInfo, '#doc_header');
                        this.append(this.apprAttachFileView, '#draft_appr_attach_body');
                        this.apprAttachFileView.attachFileUploader();
                        if (this.formId) {
                            $("#formSelect").val(this.formId);
                        }

                        this.docInfoView.$el.hide();
                        this.documentView.$el.parent().show();
                        this.contentViewEvent();
                        GO.util.appLoading(false);
                    },
                    renderView: function () {
                        var self = this;
                        this.allowAction = true;
                        if ($('div[data-role="layer"]').length) {
                            $('div[data-role="layer"]').remove();
                        }

                        //결재 상단 정보 view
                        this.createDocInfo = new CreateDocInfoView({
                            isCreate: false,
                            mobileDraftableFormCollection: this.mobileDraftableFormCollection,
                            documentModel: this.model.get('document'),
                            docInfo: this.model.get('docInfo'),
                            formId: this.formId,
                            apprLineModel: this.model.get('apprFlow')
                        });
                        this.$el.html(MainTpl());

                        this.headerToolbarView.render(this.toolBarData);
                        $("#headerToolbar").removeClass('check_nav');

                        this.assign(this.toolbarView, 'div.tool_bar');
                        this.append(this.docInfoView, '#docinfo_section');
                        this.assign(this.createDocInfo, '#doc_header');
    
                        this.documentView.setElement(this.$('#document_view')).render().then(function() {
                            if (!self.isTempsaveOrReapply()) {
                                self.fontResizeLayerAdd();
                            }
                        }).otherwise(function() {
                            alert(approvalLang["연동 양식 스크립트 경로가 유효하지 않습니다."]);
                        });
                        
                        if (this.isTempsaveOrReapply()) {
                            this.append(this.apprAttachFileView, '#draft_appr_attach_body');
                            if (!this.mobileDraftableFormCollection.isInclude(this.model.get("docInfo").formId)) {
                                alert(approvalLang["모바일 기안 허용 문서가 아닙니다"]);
                            }
                        }
                        this.apprAttachFileView.attachFileUploader();
                        this.contentViewEvent();
                        this.show_document();
                        this.$el.find('#activityCommentCount').text(this.getActivityCommentCount(this.model.get('apprFlow').activityGroups));
                        GO.util.appLoading(false);

                        if (this.model.get('document').isDeletedDeptRcvDoc && this.model.get('document').docStatus == 'RECEIVED') {
                            alert(approvalLang['문서 수신 부서가 삭제 안내']);
                        }
                    },
                    fontResizeLayerAdd: function () {
                         FontResize.render({
                            el: "#fontResizeWrap",
                            targetContentEl: "#document_content"
                        });
                    },
                    getActionMenu: function () {
                        // 결재선변경시 문서의 결재방에 적용
                        var checkIsDeputyActivity = this.checkIsDeputyActivity();
                        this.toolbarView = new ToolbarView({
                            type: this.type,
                            toolbarModel: this.model.get('actionCheck'),
                            docStatus: this.model.get('document').docStatus,
                            userId: GO.session().id,
                            drafterId: this.model.get('document').drafterId,
                            isDraftable: this.mobileDraftableFormCollection.isInclude(this.model.get("docInfo").formId) || this.type == 'INTEGRATION',
                            isAgreement: this.checkIsAgreement(),
                            isReceptionDocument: this.model.get('document').isReceptionDocument,
                            isDeletedDeptRcvDoc: this.model.get('document').isDeletedDeptRcvDoc,
                            isPublic: this.isPublic,
                            checkIsDeputyActivity: checkIsDeputyActivity,
                            commentsCount: this.model.get('document').commentCount
                        });

                        return this.toolbarView.render();

                    },
                    changeApprFlowAndDocInfo: function () {
                        var apprFlow = this.model.get('apprFlow');
                        if (this.model.availableUpdateDocMetaInfo(this.type)) {
                            //결재선을 변경할때 동시에!! 다른 사용자가 결재선을 변경했을 경우 대비코드
                            if (!_.isUndefined(this.model.get('document').apprFlowVersionId)) {
                                apprFlow['apprFlowVersionId'] = this.model.get('document').apprFlowVersionId;
                            }
                            this.model.Request.updateDocMetainfo(null, {
                                success: function (model) {
                                },
                                error: function (model, error) {
                                    var responseData = JSON.parse(error.responseText);
                                    var message = responseData.message;
                                    if (message) {
                                        alert(message);
                                    } else {
                                        alert(commonLang["실패했습니다."]);
                                    }
                                }
                            });
                        }
                        this.docInfoView.updateDocInfo(this.model.get('docInfo'));
                    },

                    contentViewEvent: function () {
                        var _this = this;
                        $("div").on("click", "#contentViewBtn", function () {
                            _this.show_document();
                            var $showDocOption = $("#selectDocInfo").find("option[value='show_document']");
                            var docText = $showDocOption.text();
                            $("#selectDocInfo").closest('a').find('span.txt').text(docText);
                            $showDocOption.prop('selected', true);
                        });
                    },

                    getActivityCommentCount: function (activityGroups) {
                        var count = 0;
                        activityGroups.forEach(function (activityGroup) {
                            var activities = activityGroup.activities;
                            activities.forEach(function (ac) {
                                if (ac.comment) {
                                    count++;
                                }
                            });
                        });
                        return count;
                    },

                    initWindowEvent: function () {
                        // window에 걸려있는 scroll 이벤트로 인해 iscroll이
                        // 커버하지 못하는 영역에서 scroll 이벤트가 발생함.
                        $(window).off('scroll');

                        this.orientationWindowEvent = {
                            name: 'orientation',
                            event: function () {
                                if (this.type == "CREATE" || this.type == "DOCUMENT") {
                                    return;
                                }
                                this.$el.empty();
                                this.render();
                            }
                        };

                        this.setTimeoutToWindowEventHandler(this.orientationWindowEvent);
                    },

                    setTimeoutToWindowEventHandler: function (eventHandler) {
                        var self = this;
                        $(window).on(eventHandler.name, function () {
                            if (this.timeout) clearTimeout(this.timeout);
                            this.timeout = setTimeout($.proxy(eventHandler.event, self), 200);
                        });
                    },

                    unbindWindowEvent: function (ev) {
                        $(window).off(ev);
                    },

                    toolbarBindEvent: function () {
                        GO.EventEmitter.off("approval");
                        GO.EventEmitter.on('approval', 'act_draft', this.draftDocument, this);
                        GO.EventEmitter.on('approval', 'act_tempsave', this.tempSaveDocument, this);
                        GO.EventEmitter.on('approval', 'act_reapply', this.reapplyDocument, this);
                        GO.EventEmitter.on('approval', 'show_apprflow_list', this.showApprFlowList, this);
                        GO.EventEmitter.on('approval', 'approval_preview', this.doPreview, this);
                        GO.EventEmitter.on('approval', 'draftCanceled', this.cancelDraft, this);
                        GO.EventEmitter.on('approval', 'approved', this.doApprove, this);
                        GO.EventEmitter.on('approval', 'returned', this.doReturn, this);
                        GO.EventEmitter.on('approval', 'holded', this.doHold, this);
                        GO.EventEmitter.on('approval', 'agreed', this.doAgree, this);
                        GO.EventEmitter.on('approval', 'disagreed', this.doDisagree, this);
                        GO.EventEmitter.on('approval', 'checked', this.doCheck, this);
                        GO.EventEmitter.on('approval', 'inspected', this.doInspection, this);
                        GO.EventEmitter.on('approval', 'actAdvAppr', this.doAdvAppr, this);
                        GO.EventEmitter.on('approval', 'actWithdrawal', this.actWithdrawal, this);
                        GO.EventEmitter.on('approval', 'actDraftWithdrawal', this.actDraftWithdrawal, this);
                        GO.EventEmitter.on('approval', 'actReceive', this.actReceive, this);
                        GO.EventEmitter.on('approval', 'actRereceive', this.actRereceive, this);
                        GO.EventEmitter.on('approval', 'cancelReception', this.cancelReception, this);
                        GO.EventEmitter.on('approval', 'returnReception', this.returnReception, this);
                        GO.EventEmitter.on('approval', 'deptFolderCopy', this.deptFolderCopy, this);
                        GO.EventEmitter.on('approval', 'actPostCheck', this.actPostCheck, this);
                        GO.EventEmitter.on('approval', 'actPostApproval', this.actPostApproval, this);
                        GO.EventEmitter.on('approval', 'actAddReader', this.actAddReader, this);
                        GO.EventEmitter.on('approval', 'actAddFolder', this.actAddFolder, this);
                        GO.EventEmitter.on('approval', 'actAddReceive', this.actAddReceive, this);
                        GO.EventEmitter.on('approval', 'generateActCopy', this.generateActCopy, this);
                        GO.EventEmitter.on('approval', 'show_apprflow_list', this.show_apprflow_list, this);
                        GO.EventEmitter.on('approval', 'show_doc_info', this.show_doc_info, this);
                        GO.EventEmitter.on('approval', 'show_comment_list', this.show_comment_list, this);
                        GO.EventEmitter.on('approval', 'show_document', this.show_document, this);
                        GO.EventEmitter.on('approval', 'actList', this.actList, this);
                        GO.EventEmitter.on('approval', 'deleted', this.deleteDocument, this);
                        GO.EventEmitter.on('approval', 'cancelAndReturnReception', this.cancelAndReturnReception, this);
                        GO.EventEmitter.on('approval', 'reassignReceiver', this.reassignReceiver, this);
                    },

                    assign: function (view, selector) {
                        view.setElement(this.$(selector)).render();
                    },

                    append: function (view, selector) {
                        this.$(selector).append(view.render().el);
                    },

                    show_apprflow_list: function () {
                        this.apprFlowView.$el.show();
                        this.docInfoView.$el.hide();
                        $("#contentViewBtn").show();
                        $('#goBody').css('minHeight', $("#document_iscroll").height());
                    },


                    show_doc_info: function () {
                        console.log("show_doc_info");
                        this.documentView.$el.closest('#document_iscroll').hide();
                        this.docInfoView.$el.show();
                        $("#contentViewBtn").show();
                        $('#goBody').css('minHeight', $("#document_iscroll").height());
                    },


                    show_comment_list: function () {
                        var url = "/approval/reply/" + this.model.get('document').documentId;
                        GO.router.navigate(url, true);
                    },

                    resizeBody: function () {
                        $('#goBody').css('minHeight', $("#document_iscroll").height());
                    },

                    show_document: function () {
                        this.docInfoView.$el.hide();
                        this.documentView.$el.closest('#document_iscroll').show();
                        if (this.docInfoView.docStatus != "TEMPSAVE") {
                            this.decideIscrollInit();
                        }
                        this.resizeBody();
                        $("#contentViewBtn").hide();
                    },
                    decideIscrollInit: function () {
                        if ($(document).width() < this.documentView.$el.width()) {
                            $("#document_view").css('visibility', 'hidden');
                            GO.util.initDetailiScroll('document_iscroll', 'document_hscroll', 'document_view');
                        }
                    },
                    isTempsaveOrReapply: function () {
                        return this.model.get('document').docStatus == "TEMPSAVE" || this.type === "REAPPLY";
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
                    tempSaveDocument: function () {
                        if (!this.allowAction) {
                            return;
                        }
                        var self = this;
                        if (confirm(approvalLang['임시저장 하시겠습니까?'])) {
                            var tempSaveApiUrl = [GO.config('contextRoot') + 'api/approval/document', self.docId, 'tempsave'].join('/');
                            var docId = this.model.get('document').documentId;
                            var apprFlow = this.model.get('apprFlow');

                            var ajaxOpt = {
                                type: 'PUT',
                                contentType: 'application/json',
                                beforeSend: function () {
                                    self.allowAction = false;
                                },
                                dataType: 'json',
                                data: JSON.stringify({
                                    'document': this.getDocumentData(docId),
                                    'docInfo': this.getDocInfoDataByDraft(docId),
                                    'apprFlow': apprFlow
                                })
                            };

                            var ajaxCallback = function (data) {
                                console.log("ajaxCallback");
                                GO.util.toastMessage(approvalLang["임시저장되었습니다."]);
                                self.allowAction = true;
                                GO.router.navigate("/approval/todo/all", {trigger: true});
                            };

                            $.ajax(tempSaveApiUrl, ajaxOpt)
                                .done($.proxy(ajaxCallback, this))
                                .fail(function (rs) {
                                    var result = JSON.parse(rs.responseText);
                                    GO.util.toastMessage(result.message);
                                    self.allowAction = true;
                                });
                        } else {
                            if (window.history.length == 1) {
                                GO.util.goHome();
                            } else {
                                GO.router.navigate("/approval/todo/all", {trigger: true});
                            }
                        }
                    },
                    reapplyDocument: function () {
                        var self = this;
                        if (this.model.docInfoModel.attributes.integrationActive) {
                            alert(approvalLang['시스템과 연동된 문서는 재기안이 불가능합니다.'] + "\n" + approvalLang['결재문서를 새로 작성해 주세요.']);
                            return;
                        }

                        var apprConfigModel = new UserApprConfigModel();
                        apprConfigModel.fetch({
                            success: function (model, result) {
                                GO.router.navigate("/approval/document/" + self.docId + "/reapply", {trigger: true});
                            },
                            error: function (model, rs) {
                                var msg = commonLang['500 오류페이지 내용'];
                                if ($.parseJSON(rs.responseText).message) {
                                    msg = $.parseJSON(rs.responseText).message;
                                }
                                alert(msg);
                            }
                        });
                    },
                    draftDocument: function () {
                        //결재요청
                        var self = this;
                        if (this.model.get('docInfo').requiredReceiver &&
                            this.model.get('docInfo').docReceptionReaders.length == 0 &&
                            this.model.get('document').docType != 'RECEIVE') {
                            GO.util.toastMessage(approvalLang['수신처 지정 필수 메세지']);
                            return;
                        }
                        this.checkSelfApproval().then(function () {
                            self.popDraft()
                        });
                    },
                    checkSelfApproval: function () {
                        var defer = $.Deferred();

                        if (!this.model.get('actionCheck').useSelfApproval && !this.checkActivity()) {
                            defer.reject();
                        } else { //1인 결재를 사용하더라도 1인 결재를 시도헀을시에 경고성 팝업창을 띄운다. GO-18952
                            var apprFlowModel = new ApprFlowModel(this.model.get('apprFlow'));
                            if (apprFlowModel.getAllActivities().length < 2) {
                                var selfApproval = confirm(approvalLang['1인 결재 안내문구'].replace(/<br>/gi, "\n"));
                                if (selfApproval) {
                                    defer.resolve();
                                } else {
                                    defer.reject();
                                }
                            } else {
                                defer.resolve();
                            }
                        }
                        return defer;
                    },
                    checkActivity: function () {
                        var apprFlowModel = new ApprFlowModel(this.model.get('apprFlow'));
                        if (apprFlowModel.getAllActivities().length < 2) {
                            GO.util.toastMessage(approvalLang["결재선을 지정해 주세요."]);
                            return false;
                        } else {
                            return true;
                        }
                    },
                    popDraft: function () {

                        if (!this.formIntegrator.validate()) {
                            return false;
                        }
                        if (!this.checkCompleteForm()) {
                            return false;
                        }

                        var toolBarData = {
                            title: approvalLang['결재요청'],
                            rightButton: {
                                text: approvalLang['확인'],
                                callback: $.proxy(function (rs) {
                                    //결재요청
                                    this.saveDraftDocument(rs);
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        this.documentAction = new DocumentActionView({
                            isDraft: true,
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            isEmergency: $('#emergency').is(':checked')
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    checkCompleteForm: function () {
                        if (!this.documentView.isCompleteRequiredForm()) {
                            GO.util.toastMessage(commonLang["필수항목을 입력하지 않았습니다."]);
                            return false;
                        }

                        var maxLengthCheck = this.documentView.getMaxLengthCheck();

                        if (!maxLengthCheck.result) {
                            GO.util.toastMessage(GO.i18n(approvalLang['선택된 항목은 0자 이하로 입력해야합니다.'], {"arg1": maxLengthCheck.maxlength}));
                            this.documentView.setDocFocus(maxLengthCheck.errorId);
                            return false;
                        }
                        if (this.documentView.getTitle().length > 255) {
                            GO.util.toastMessage(GO.i18n(approvalLang['선택된 항목은 0자 이하로 입력해야합니다.'], {"arg1": 255}));
                            this.documentView.setDocFocus("subject");
                            return false;
                        }
                        return true;
                    },
                    saveDraftDocument: function (rs) {
                        //결재요청
                        if (!this.allowAction) {
                            return;
                        }
                        var self = this;
                        var apprPassword = $('#apprPassword').val();
                        var comment = $("#textarea-desc").val();

                        if (!this.actionApprValidate('#apprPassword', '#textarea-desc', 'DRAFT')) {
                            return false;
                        }

                        if ($('#isEmergency').is(':checked')) {
                            $("#emergency").attr("checked", true);
                        } else {
                            $("#emergency").attr("checked", false);
                        }

                        this.formIntegrator.beforeSave();

                        var docId = this.model.get('document').documentId;
                        var apprFlow = this.model.get('apprFlow');

                        // 수신문서 재접수 후 기안시 필요.
                        if (!_.isUndefined(this.model.get('document').apprFlowVersionId)) {
                            apprFlow['apprFlowVersionId'] = this.model.get('document').apprFlowVersionId;
                        }
                        ;

                        var activityId = apprFlow.activityGroups[0].activities[0].id;
                        var apprAction = {
                            'activityId': activityId,
                            'apprAction': 'DRAFT',
                            'comment': comment,
                            'apprPassword': apprPassword
                        };
                        var model = new DraftModel(docId);
                        this.allowAction = false;

                        model.set({
                            'apprAction': apprAction,
                            'document': this.getDocumentData(docId),
                            'docInfo': this.getDocInfoDataByDraft(docId),
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
                                    self.formIntegrator.afterSave();
                                    GO.util.toastMessage(approvalLang["결재 요청을 완료하였습니다."]);
                                    GO.router.navigate("/approval/document/" + result['data']['document']['id'], {trigger: true});
                                }
                            },
                            error: function (model, rs) {
                                self.allowAction = true;
                                var responseObj = JSON.parse(rs.responseText);
                                if (!_.isUndefined(responseObj) && responseObj.message) {
                                    if (self.usePassword) {
                                        GO.util.toastMessage(responseObj.message, $('#apprPassword'));
                                        $('#apprPassword').addClass('enter error').focus();
                                    } else {
                                        GO.util.toastMessage(responseObj.message);
                                    }
                                    return false;
                                } else {
                                    GO.util.toastMessage(approvalLang['기안에 실패 하였습니다.']);
                                    return false;
                                }
                            },
                            complete: function () {
                                preloader.release();
                            }
                        });
                    },
                    doPreview: function () {
                        var _this = this;
                        this.preView = new PreView({
                            title: commonLang["미리보기"],
                            docBody: this.getDocBodyContentData(),
                            attaches: "",
                            references: "",
                            callback: function (e) {
                                this.$el.remove();
                                if (e) {
                                    e.stopPropagation();
                                }
                                _this.$el.find(".approval_header").hide();
                                return false;
                            }
                        });
                        this.preView.render();
                        $('html').scrollTop(0);
                    },
                    showApprFlowList: function () {
                        //결재선 변경
                        var toolBarData = {
                            name: approvalLang['결재 정보'],
                            isIscroll: false,
                            isPrev: true,
                            rightButton: {
                                text: approvalLang["확인"],
                                callback: $.proxy(function () {
                                    this.documentAction.saveApprFlow();
                                    this.syncApprFlowLine();
                                    this.docActionRelease();
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        this.documentAction = new DocumentApprFlowEditView({
                            type: this.type,
                            docId: this.model.get('document').documentId,
                            toolBarData: toolBarData,
                            model: this.model
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    syncApprFlowLine: function () {
                        var lineWrap = ApprFlowLineView.render({
                            apprLineModel: this.model.get('apprFlow')
                        });
                        this.$el.find("#apprflowline").html(lineWrap.$el.html());
                    },
                    syncApprFlowView: function() {
                        this.apprFlowView.remove();
                        this.createApprFlowView();
                        this.changeActivityGroups(this.model.get('apprFlow').activityGroups)
                    },
                    createApprFlowView: function() {
                        this.apprFlowView = new ApprFlowView({
                            type: this.type,
                            docId: this.model.get('document').documentId,
                            model: new ApprFlowModel(this.model.get('apprFlow'))
                        });
                    },
                    doApprove: function () {
                        var toolBarData;
                        if (this.model.get('actionCheck').isArbitraryDecisionabled) {
                            toolBarData = {
                                title: approvalLang['결재하기'],
                                isArbitraryDecisionabled: true,
                                rightButton: {
                                    text: approvalLang['결재'],
                                    callback: $.proxy(function () {
                                        if (confirm(GO.i18n(commonLang["{{arg1}} 진행하시겠습니까?"], {"arg1": approvalLang['결재']}))) {
                                            if ($("table.form_type").find("#arbitrary").is(":checked")) {
                                                this.saveApprAction("ARBITRARY");
                                            } else {
                                                this.saveApprAction("APPROVAL");
                                            }
                                        }
                                    }, this)
                                },

                                cancelButton: {
                                    callback: $.proxy(function () {
                                        this.docActionRelease();
                                    }, this)
                                }
                            };
                        } else {
                            toolBarData = {
                                title: approvalLang['결재하기'],
                                rightButton: {
                                    text: approvalLang['결재'],
                                    callback: $.proxy(function () {
                                        this.saveApprAction("APPROVAL");
                                    }, this)
                                },
                                cancelButton: {
                                    callback: $.proxy(function () {
                                        this.docActionRelease();
                                    }, this)
                                }
                            };
                        }
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                        if (toolBarData.isArbitraryDecisionabled) {
                            var currentActivity = this.apprFlowView.getCurrentActivity();
                            var defaultCheckArbitrary = false;
                            if (typeof currentActivity != 'undefined') {
                                defaultCheckArbitrary = currentActivity.arbitrary;
                            }
                            var arbtDecisionTypeDesc = this.model.get('docInfo').arbtDecisionType == 'DOCUMENT' ? approvalLang['전결설명'] : GO.i18n(approvalLang['{{arg1}}전결설명'], {"arg1": this.model.get('docInfo').currentApprGroupName});
                            if (defaultCheckArbitrary) {
                                $("#tblFormType").append('<tr><td><div class="ipt_wrap"><span class="option_wrap">' +
                                    '<input id="arbitrary" type="checkbox" checked><label for="arbitrary" class="txt">' +
                                    approvalLang['전결'] + '(' + arbtDecisionTypeDesc + ')</label></span></div></td></tr>');
                            } else {
                                $("#tblFormType").append('<tr><td><div class="ipt_wrap"><span class="option_wrap">' +
                                    '<input id="arbitrary" type="checkbox" ><label for="arbitrary" class="txt">' +
                                    approvalLang['전결'] + '(' + arbtDecisionTypeDesc + ')</label></span></div></td></tr>');
                            }

                            $("#tblFormType").append('<tr style="display:none;" id="arbtAddReferrerDetail"><td><div class="ipt_wrap"><span class="option_wrap">' +
                                '<input type="checkbox" id="arbtAddReferrer"><label for="arbtAddReferrer" class="txt">' + approvalLang['전결참조자추가'] + '</label></span></div></td></tr>');

                            $('#arbitrary').off('click');
                            $('#arbitrary').on('click', function (e) {
                                $("#arbtAddReferrerDetail").toggle($("#arbitrary").is(':checked'));
                            });
                        }
                    },
                    doHold: function () {
                        var toolBarData = {
                            title: approvalLang['보류하기'],
                            rightButton: {
                                text: approvalLang['보류'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("HOLD");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },

                    actDraftWithdrawal: function () {
                        var toolBarData = {
                            title: approvalLang['상신취소'],
                            rightButton: {
                                text: commonLang['확인'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("CANCELDRAFT");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isCancel: true,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: false,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    doReturn: function () {
                        var toolBarData = {
                            title: approvalLang['반려하기'],
                            rightButton: {
                                text: approvalLang['반려'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("RETURN");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        var latestCompletedActionisDraft = this.model.get('actionCheck').latestCompleteAction == 'DRAFT' ? true : false;
                        var usePreviousReturn = this.model.get('actionCheck').usePreviousReturn;

                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval,
                            showPreviousReturn: !latestCompletedActionisDraft && usePreviousReturn
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    doAgree: function () {
                        var toolBarData = {
                            title: approvalLang['합의하기'],
                            rightButton: {
                                text: approvalLang['합의'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("AGREEMENT");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    doDisagree: function () {
                        var toolBarData = {
                            title: approvalLang['반대하기'],
                            rightButton: {
                                text: approvalLang['반대'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("OPPOSITION");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    doCheck: function () {
                        var toolBarData = {
                            title: approvalLang['확인하기'],
                            rightButton: {
                                text: approvalLang['확인'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("APPROVAL");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    doInspection: function () {
                        var toolBarData = {
                            title: approvalLang['결재하기'],
                            rightButton: {
                                text: approvalLang['결재'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("APPROVAL");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    doAdvAppr: function () {
                        var toolBarData = {
                            title: approvalLang['결재하기'],
                            rightButton: {
                                text: approvalLang['결재'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("ADVAPPROVAL");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    docPreview: function () {
                        var toolBarData = {
                            title: approvalLang['미리보기'],
                            rightButton: {
                                text: approvalLang['반대'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("OPPOSITION");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },


                    deleteDocument: function () {
                        var self = this;
                        if (confirm(approvalLang['선택한 항목을 삭제하시겠습니까?'])) {
                            var deleteApiUrl = [GO.config('contextRoot') + 'api/approval/document', self.docId, 'delete'].join('/');
                            $.ajax(deleteApiUrl, {
                                type: 'PUT',
                                contentType: 'application/json',
                                dataType: 'json'
                            }).done(function (data) {
                                alert(approvalLang["선택한 항목이 삭제되었습니다"]);
                                self.actList();
                                //GO.router.navigate("/approval/doclist/draft/temp", {trigger: true});
                            });
                        } else {
                            _.delay(function () {
                                self.toolbarView.$('#selectAction').val('');
                            }, 100);
                        }
                    },

                    actPostCheck: function () {
                        var toolBarData = {
                            title: approvalLang['후열하기'],
                            rightButton: {
                                text: approvalLang['후열'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("POSTCHECK");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    actPostApproval: function () {
                        var toolBarData = {
                            title: approvalLang['후결하기'],
                            rightButton: {
                                text: approvalLang['후결'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("POSTAPPROVAL");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },
                    actAddReceive: function (e) {
                        var self = this;
                        GO.router.navigate(GO.router.getUrl() + '#org', {trigger: false, pushState: true});
                        this.docReceiveView = new DocReceiveView({
                            receptAddDeptId: self.model.get('actionCheck').receptAddDeptId,
                            title: approvalLang['수신자 추가'],
                            docId: self.docId,
                            callback: function (data) {
                                self.saveDocReceive(data);
                            }
                        });
                        this.docReceiveView.render();
                    },

                    actWithdrawal: function () {
                        var toolBarData = {
                            title: approvalLang['결재취소'],
                            rightButton: {
                                text: commonLang['확인'],
                                callback: $.proxy(function () {
                                    this.saveApprAction("WITHDRAW");
                                }, this)
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };
                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isCancel: true,
                            isPassword: this.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },

                    actList: function (e) {
                        var baseUrl = sessionStorage.getItem('list-history-baseUrl');
                        if (baseUrl) {
                            if (baseUrl.indexOf("search") > -1) {
                                window.history.back();
                            } else {
                                GO.router.navigate(baseUrl, {trigger: true});
                            }
                        } else {
                            GO.router.navigate('approval', {trigger: true});
                        }
                    },

                    actReceive: function () {
                        var self = this;
                        if (confirm(approvalLang['접수 하시겠습니까?'])) {
                            var docId = self.model.get('document').documentId;
                            var model = new ReceptionSaveModel(docId, "receive");
                            model.save({}, {
                                type: 'PUT',
                                success: function (model, result) {
                                    if (result.code == 200) {
                                        GO.router.navigate("/approval/document/" + docId, {trigger: true});
                                    }
                                },
                                error: function (model, rs) {
                                    var responseObj = JSON.parse(rs.responseText);
                                    if (responseObj.message) {
                                        alert(responseObj.message);
                                        return false;
                                    } else {
                                        alert(approvalLang['접수가 실패 하였습니다.']);
                                        return false;
                                    }
                                }
                            });
                        } else {
                            _.delay(function () {
                                self.toolbarView.$('#selectAction').val('');
                            }, 100);
                        }
                    },

                    actRereceive: function () {
                        var self = this;
                        if (confirm(approvalLang['재접수 하시겠습니까?'])) {
                            var docId = self.model.get('document').documentId;
                            var model = new ReceptionSaveModel(docId, "rereceive");
                            model.save({}, {
                                type: 'PUT',
                                success: function (model, result) {
                                    if (result.code == 200) {
                                        GO.router.navigate("/approval/document/" + docId, {trigger: true});
                                    }
                                },
                                error: function (model, rs) {
                                    var responseObj = JSON.parse(rs.responseText);
                                    if (responseObj.message) {
                                        alert(responseObj.message);
                                        return false;
                                    } else {
                                        alert(approvalLang['재접수가 실패 하였습니다.']);
                                        return false;
                                    }
                                }
                            });
                        } else {
                            _.delay(function () {
                                self.toolbarView.$('#selectAction').val('');
                            }, 100);
                        }
                    },

                    cancelReception: function () {
                        var self = this;
                        if (confirm(approvalLang['접수를 취소하시겠습니까?'])) {
                            var docId = self.model.get('document').documentId;
                            var model = new ReceptionSaveModel(docId, "cancel");
                            model.save({}, {
                                type: 'PUT',
                                success: function (model, result) {
                                    if (result.code == 200) {
                                        GO.router.navigate("/approval/document/" + docId, {trigger: true});
                                    }
                                },
                                error: function (model, rs) {
                                    var responseObj = JSON.parse(rs.responseText);
                                    if (responseObj.message) {
                                        alert(responseObj.message);
                                        return false;
                                    } else {
                                        alert(approvalLang['접수취소가 실패 하였습니다.']);
                                        return false;
                                    }
                                }
                            });
                        } else {
                            _.delay(function () {
                                self.toolbarView.$('#selectAction').val('');
                            }, 100);
                        }
                    },

                    returnReception: function () {
                        var self = this;
                        var toolBarData = {
                            title: approvalLang['반송'],
                            rightButton: {
                                text: approvalLang['반송'],
                                callback: function () {
                                    var docId = self.model.get('document').documentId;
                                    var model = new ReceptionSaveModel(docId, "return");

                                    var comment = $("#textarea-desc").val();
                                    if ($.trim(comment) == '') {
                                        alert(approvalLang['의견을 작성해 주세요'], $("#textarea-desc"));
                                        $("#textarea-desc").addClass('enter error').select();
                                        return false;
                                    }

                                    var promise = model.save({'str': $("#textarea-desc").val()}, {type: 'PUT'});
                                    promise.done(function (model, result) {
                                        self.actList();
                                    });
                                    promise.fail(function (model, rs) {
                                        alert(approvalLang['반송이 실패 하였습니다.']);
                                        return false;
                                    });
                                }
                            },
                            cancelButton: {
                                callback: $.proxy(function () {
                                    this.docActionRelease();
                                }, this)
                            }
                        };

                        var useNextApproval = this.model.get('userApprSetting').useNextApproval;

                        this.documentAction = new DocumentActionView({
                            toolBarData: toolBarData,
                            isPassword: self.isPassword,
                            headerModel: this.makeHeaderModel(),
                            nextApproval: true,
                            useNextApproval: useNextApproval
                        });
                        this.$el.find('#document_main').hide();
                        this.$el.find('#document_action').show();
                        this.assign(this.documentAction, '#document_action');
                    },

                    cancelAndReturnReception: function () {
                        var self = this;
                        if (confirm(approvalLang['반송하시겠습니까?'])) {
                            var docId = self.model.get('document').documentId;
                            var model = new ReceptionSaveModel(docId, "receptioncancelandreturn");
                            model.save({}, {
                                type: 'PUT',
                                success: function (model, result) {
                                    if (result.code == 200) {
                                        self.actList();
                                    }
                                },
                                error: function (model, rs) {
                                    var responseObj = JSON.parse(rs.responseText);
                                    if (responseObj.message) {
                                        alert(responseObj.message);
                                        return false;
                                    } else {
                                        alert(approvalLang['반송이 실패 하였습니다.']);
                                        return false;
                                    }
                                }
                            });
                        } else {
                            _.delay(function () {
                                self.toolbarView.$('#selectAction').val('');
                            }, 100);
                        }
                    },

                    reassignReceiver: function () {
                        var document = this.model.get('document');
                        this.apprReceiverPopup = new ApprReceiverPopupView({
                            docId: this.docId,
                            receivedDocOwnerDeptId: document['receivedDocOwnerDeptId'],
                            receiverDeptId: document['receiverDeptId'],
                            receiverDeptName: document['receiverDeptName'],
                            receiverUserId: document['receiverUserId'],
                            receiverUserName: document['receiverUserName'],
                            receiverUserPositionName: document['receiverUserPositionName']
                        });

                        $('div.go_body').next('div.overlay_scroll').remove();
                        $('div.go_body').after(this.apprReceiverPopup.$el);
                        this.apprReceiverPopup.render();
                        this.apprReceiverPopup.$el.find('.layer_type_bottom').animate({
                            bottom: 0
                        }, 150);
                    },

                    makeHeaderModel: function () {
                        var documentModel = this.model.get('document');
                        var title = documentModel.title || "";
                        var drafterName = documentModel.drafterName || "";
                        var draftedAt = GO.util.basicDate(documentModel.draftedAt) || "";
                        var drafterPositionName = documentModel.drafterPosionName || "";
                        return {
                            title: title,
                            drafterName: drafterName,
                            drafterPositionName: drafterPositionName,
                            draftedAt: draftedAt
                        }
                    },

                    saveDocReceive: function (data) {
                        var docId = this.model.get('document').documentId;
                        var deptId = this.model.get('actionCheck').receptAddDeptId;
                        var model = new DocReceiveModel(docId, deptId.join(','));
                        var docReadingReaders = [];
                        $(data).each(function (k, v) {
                            docReadingReaders.push({id: "", reader: {id: v.userid, deptId: deptId[0], deptType: false}});
                        });
                        var docInfoData = {
                            "id": docId,
                            "docReadingReaders": docReadingReaders,
                        };
                        model.set(docInfoData, {silent: true});
                        model.save({}, {
                            type: 'PUT',
                            success: function (model, result) {
                                if (result.code == 200) {
                                    alert(commonLang['저장되었습니다.']);
                                }
                            },
                            error: function (model, rs) {
                                var responseObj = JSON.parse(rs.responseText);
                                if (responseObj.message) {
                                    alert(responseObj.message);
                                    return false;
                                } else {
                                    alert(approvalLang['수신자추가에 실패 하였습니다.']);
                                    return false;
                                }
                            }
                        });
                    },

                    docActionRelease: function () {
                        this.toolBarData = {
                            isPrev: true,
                            actionMenu: this.getActionMenu()
                        };
                        this.toolbarBindEvent();
                        this.headerToolbarView.render(this.toolBarData)
                        this.$el.find('#document_main').show();
                        this.$el.find('#document_action').hide();
                        this.$el.find('#selectAction').val("");
                        this.documentAction.release();
                    },

                    changeApprFlow: function () {
                        var self = this;
                        var apprFlow = this.model.get('apprFlow');
                        if (this.type == 'DOCUMENT') {
                            var apprFlowApiUrl = [GO.config('contextRoot') + 'api/approval/document', self.docId, 'apprflow'].join('/');
                            $.ajax(apprFlowApiUrl, {
                                type: 'PUT',
                                contentType: 'application/json',
                                dataType: 'json',
                                data: JSON.stringify({'document': self.getDocumentData(self.docId), 'apprFlow': apprFlow})
                            }).done(function (data) {
                                onApprFlowUpdated(self, data.data);
                            });
                        } else {
                            var isReception = this.model.get('document')['isReceptionDocument'];
                            self.changeActivityGroups(apprFlow.activityGroups, isReception);
                        }
                    },
                    changeActivityGroups: function (activityGroups, isReception) {
                        this.documentView.changeActivityGroups(activityGroups, isReception);
                        if (this.type != 'DOCUMENT') {
                            this.apprFlowView.makeApprFlow(activityGroups);
                        }
                    },
                    setDocNum: function (docNum) {
                        this.documentView.setDocNum(docNum);
                    },

                    getDocumentData: function (docId, docStatus) {
                        var subject = this.documentView.getTitle();
                        var title = (!subject || 0 === subject.length) ? this.model.get('document').formName : subject;
                        var variables = this.getDocVariables();
                        if (this.model.isStatusReceived()) {
                            FontResize.restore();
                        }
                        var docBodyContent = this.getDocBodyContentData();

                        return {
                            "id": docId,
                            "documentId": docId,
                            "docStatus": docStatus,
                            "attachCount": 0,
                            "attaches": this.getAttachData(),
                            "references": this.getReferencesData(),
                            "docBodyContent": docBodyContent,
                            "title": title,
                            "variables": variables
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
                        var attachesData = [];
                        var attachPart = $("#attachPart").find('li[data-name]:not(.attachError):not(.refDoc)');
                        if (this.model.isStatusReceived()) {
                            attachPart = $("#attachView").find('li[data-name]:not(.attachError):not(.refDoc)');
                        }
                        var addDataFn = function () {
                            var attachOpt = {};
                            if ($(this).attr("data-path")) {
                                attachOpt.path = $(this).attr("data-path");
                            }
                            if ($(this).attr("data-name")) {
                                attachOpt.name = $(this).attr("data-name");
                            }
                            if ($(this).attr("data-id")) {
                                attachOpt.id = $(this).attr("data-id");
                            }
                            attachesData.push(attachOpt);
                        };
                        attachPart.each(addDataFn);
                        return attachesData;
                    },
                    getReferencesData: function () {
                        var referencesData = [];

                        var referencesPart = $('li[data-id].refDoc');
                        referencesPart.each(function () {
                            referencesData.push({id: $(this).attr("data-id")});
                        });

                        var receptionOriginPart = $('li[data-id].receptionOriginDoc');
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
                            "isPublic": $('#openType:checked').val()
                        };
                    },
                    getDocInfoDataByDraft: function (docId) {
                        var docInfoAttr = this.model.get('docInfo');
                        return {
                            "id": docId,
                            "securityLevelId": $('#infoSecurityLevel').val(),
                            "docYear": $('#docYear').val(),
                            "docFolders": this.getDocFolderData(),
                            "docReceptionReaders": docInfoAttr.docReceptionReaders || [],
                            "docReferenceReaders": docInfoAttr.docReferenceReaders || [],
                            "docReadingReaders": docInfoAttr.docReadingReaders || [],
                            "officialVersions": docInfoAttr.officialVersions || [],
                            "isPublic": $('input:radio[name="openType"]:checked').val(),
                            "isEmergency": $('#emergency').is(':checked'),
                            "drafterDeptFolderId": $("#deptFolderId").val(),
                            "drafterDeptId": $("#draftDeptId").val()
                        };
                    },
                    //문서분류 추가
                    getDocFolderData: function () {
                        var openType = $('#openType:checked').val();
                        var docFolder = [];
                        var docFolderPart = $("#addFolder").find('li[data-id]');
                        if (openType == 'true') {
                            docFolderPart.each(function () {
                                if ($(this).attr("data-Type") == 'true') {
                                    docFolder.push({id: $(this).attr("data-id")});
                                }
                            });
                        }
                        return docFolder;
                    },
                    //수신자 추가
                    getDocReceptionReadersData: function () {
                        var docReceptionReaders = [];
                        var docReceptionReadersPart = $("#addReceive").find('li[data-id]');
                        docReceptionReadersPart.each(function () {
                            docReceptionReaders.push({
                                id: $(this).attr("data-sid"),
                                reader: {
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

                    actionApprValidate: function (pwdEl, descEl, apprAction) {
                        var apprPassword = $(pwdEl).val();
                        var description = $(descEl).val();
                        if (this.isPassword) {
                            if (!apprPassword) {
                                setTimeout(function () {
                                    alert(approvalLang["결재 비밀번호를 입력하세요."]);
                                }, 10);
                                return false;
                            }
                        }
                        if ((apprAction == 'RETURN' || apprAction == 'RECV_RETURNED') && $.trim(description) == '') {
                            setTimeout(function () {
                                alert(approvalLang['의견을 작성해 주세요']);
                            }, 10);
                            return false;
                        }
                        if (description && description.length > 1000) {
                            setTimeout(function () {
                                alert(GO.i18n(approvalLang["{{max}}자 이하로 입력해 주십시오"], {'max': 1000}));
                            }, 10);
                            return false;
                        }

                        return true;
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

                    saveApprAction: function (apprAction) {
                        if (!this.allowAction) {
                            return;
                        }
                        
                        this.allowAction = false;
                        var self = this;
                        var apprPassword = $('#apprPassword').val();
    
                        if (!this.actionApprValidate('#apprPassword', '#textarea-desc', apprAction)) {
                            this.allowAction = true;
                            return false;
                        }
    
                        var isReception = self.model.get('document').isReception;
                        var currentActivityId = getActivityId({ apprAction: apprAction });;
                        if (apprAction == 'ARBITRARY' && self.model.get('docInfo').arbtDecisionType == 'APPRGROUP') {
                            apprAction = 'GROUPARBITRARY';
                        }
    
                        var arbtAddReferrer = false;
                        if ($('table.form_type').find('#arbtAddReferrer').is(':checked')) {
                            arbtAddReferrer = true;
                        }
    
                        var docId = self.model.get('document').documentId;
                        var model = new ApprActionModel(docId);
                        var docVersionId = self.model.get('document').docVersionId;
                        var apprFlowVersionId = self.model.get('document').apprFlowVersionId;
                        var property = 'document.draftedAt';
                        var direction = 'desc';
                        var searchtype = sessionStorage.getItem('list-history-searchtype');
                        var keyword = sessionStorage.getItem('list-history-keyword')
                            && sessionStorage.getItem('list-history-keyword').replace(/\+/gi, ' ');
                        var duration = 'all';
                        var fromDate = '';
                        var toDate = '';
    
                        if (apprAction == 'RECV_RETURNED') {
                            model = new ReceptionSaveModel(docId, 'return');
                            property = 'createdAt';
                        }
    
                        if (sessionStorage.getItem('list-history-duration')
                            && sessionStorage.getItem('list-history-duration') != '') {
                            duration = sessionStorage.getItem('list-history-duration');
                        }
                        if (duration == 'period' && sessionStorage.getItem(
                            'list-history-fromDate') && sessionStorage.getItem('list-history-fromDate') != '') {
                            fromDate = sessionStorage.getItem('list-history-fromDate');
                            toDate = sessionStorage.getItem('list-history-toDate');
                        }
    
                        var useNextApproval = false;
                        var nextView = true;
                        if ($('#nextApproval')) {
                            if ($('#nextApproval').is(':checked')) {
                                useNextApproval = true;
                            }
                        } else {
                            nextView = false;
                            useNextApproval = this.model.get('userApprSetting').useNextApproval;
                        }
    
                        if ($('#isPreviousReturn').is(':checked')) {
                            apprAction = 'PREVIOUSRETURN';
                        }
    
                        model.set({
                            'activityId': currentActivityId,
                            'apprAction': apprAction,
                            'comment': $('#textarea-desc').val(),
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
                                'toDate': toDate,
                            },
                        }, {silent: true});
    
                        var promise = model.save({}, {
                            type: 'PUT',
                            success: function(model, result) {
                                self.allowAction = true;
                                if (result.code == 200) {
                                    onActivityCompleted(self, result.data, isReception);
                
                                    var todoAll = '/approval/todo/all';
                                    var todoReceptionAll = '/approval/todoreception/all';
                                    var nextDocumentId = '/approval/document/' + result.data.document.id;
                                    var uri;
                
                                    if (apprAction == 'APPROVAL' || apprAction == 'RETURN'
                                        || apprAction == 'ARBITRARY' || apprAction == 'GROUPARBITRARY'
                                        || apprAction == 'AGREEMENT' || apprAction == 'OPPOSITION'
                                        || apprAction == 'POSTCHECK' || apprAction == 'HOLD' || apprAction == 'PREVIOUSRETURN') {
                                        sessionStorage.setItem('list-history-pageNo', self.getPageNo());
                    
                                        if (useNextApproval && nextView) {
                                            uri = (docId == result.data.document.id) ? todoAll : nextDocumentId;
                                            GO.router.navigate(uri, {trigger: true});
                                        } else {
                                            GO.router.navigate(todoAll, {trigger: true});
                                        }
                                    } else if (apprAction == 'WITHDRAW' || apprAction == 'CANCELDRAFT') {
                                        GO.router.navigate(nextDocumentId, {trigger: true});
                                    } else if (apprAction == 'RECV_RETURNED') {
                                        if (useNextApproval && nextView) {
                                            uri = (docId == result.data.document.id) ? todoReceptionAll : nextDocumentId;
                                            GO.router.navigate(uri, {trigger: true});
                                        } else {
                                            GO.router.navigate(todoReceptionAll, {trigger: true});
                                        }
                                    } else {
                                        GO.router.navigate('/approval/doclist/draft/all', {trigger: true});
                                    }
                                }
                            },
                            error: function(model, rs) {
                                self.allowAction = true;
                                var responseObj = JSON.parse(rs.responseText);
                                if (responseObj.message) {
                                    var errorMsg = responseObj.message.replace(/<br\/\>/gi, '\n');
                                    alert(errorMsg);
                                    if (responseObj.name == 'not.authorized.canceldraft.read'
                                        || responseObj.name == 'invalid.activity.status') {
                                        GO.router.navigate('/approval', {trigger: true});
                                    } else if (responseObj.name == 'pwd.not.match') {
                                        $('#apprPassword').focus();
                                    }
                                    return false;
                                } else {
                                    alert(approvalLang['저장에 실패 하였습니다.']);
                                    return false;
                                }
                            },
                        });
    
                        GO.util.preloader(promise);
    
                        function getActivityId(params) {
                            if (params.apprAction == 'ADVAPPROVAL') {
                                return self.model.get('apprFlow').advActivityId;
                            } else if (params.apprAction == 'APPROVAL' || params.apprAction == 'RETURN') {
                                // 결재와 선결재 둘다 가능한 액션 상태일때 결재를 하는 케이스
                                var isApprovalUser = self.model.get('actionCheck').isPostApprovalUser || self.model.get('actionCheck').isPostCheckUser;
                                var currentActivityId = self.model.get('apprFlow').currentActivityId;
                                var approvalActivityId = self.model.get('apprFlow').approvalActivityId;
                                return isApprovalUser && approvalActivityId ? approvalActivityId : currentActivityId;

                            } else {
                                return self.model.get('apprFlow').currentActivityId;
                            }
                        }
                    }
                },
                {
                    __instance__: null,
                    create: function () {
                        this.__instance__ = new this.prototype.constructor({el: $('#content')});
                        return this.__instance__;
                    },
                    render: function () {
                        var instance = this.create(),
                            args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
                        return this.prototype.render.apply(instance, args);
                    }
                });
            return MainView;

            function onActivityCompleted(view, result, isReception) {
                view.changeActivityGroups(result.apprFlow.activityGroups, isReception);
            };
        });
}).call(this);
