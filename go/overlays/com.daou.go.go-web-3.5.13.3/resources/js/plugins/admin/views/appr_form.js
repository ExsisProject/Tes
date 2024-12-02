define([
    "backbone",
    "app",

    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval",

    "views/circle",
    "models/site_config",
    "approval/views/security_level_list",
    "admin/views/approval/appr_form_integration/appr_form_integration_main",
    "admin/views/appr_form_activity_group_app",
    "admin/views/appr_form_template_editor",
    "admin/views/admin_doc_type_select",
    "admin/views/appr_line_rule_form",

    "admin/models/integration_detail",
    "admin/models/appr_form",
    "admin/collections/appr_form_list",
    "system/collections/companies",
    "approval/collections/activity_groups",

    "hgn!admin/templates/appr_form",
    "hgn!admin/templates/appr_form_template_editor",
    "hgn!admin/templates/appr_admin_owners",
    "hgn!admin/templates/appr_admin_owners_data",
    "hgn!admin/templates/appr_script_sample_data",

    "jquery.go-sdk",
    "jquery.jstree",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.go-orgslide",
    "jquery.go-validation"
],
function(
    Backbone,
    App,

    commonLang,
    adminLang,
    approvalLang,

    CircleView,
    SiteConfigModel,
    SecurityLevelListView,
    ApprFormIntegrationMainView,
    ActivityGroupAppView,
    TemplateEditorView,
    DocTypeSelectView,
    ApprLineRuleView,

    IntegrationDetailModel,
    ApprFormModel,
    ApprFormCollection,
    CompanyCollection,
    ActivityGroups,

    formTmpl,
    templateTmpl,
    tplApprAdminOwners,
    tplApprAdminOwnersData,
    scriptSampleTmpl
) {

    var ApprConfigModel, IntegrationModel, IntegrationCollection, IntegrationListView, ApprLineRuleCollection,
        ApprLineRuleFormModel, OfficialFormCollection, OfficialSenderCollection, OfficialSignCollection,
        apiBaseUrl = GO.contextRoot + 'ad/api/';
    var lang = {
        'head_title': adminLang['결재 양식'],
        'caption': adminLang['계정 추가 등록'],
        'title': commonLang['제목'],
        'form_name': approvalLang['양식제목'],
        'alias': adminLang['양식약어'],
        'code': adminLang['코드'],
        'description': approvalLang['양식 도움말'],
        'use_help': approvalLang['결재문서에서 도움말 버튼 제공'],
        'unuse_help': approvalLang['제공하지 않음'],
        'appr_line': approvalLang['결재라인'],
        'select_count': adminLang['갯수 선택'],
        'approver_name': adminLang['결재자 이름'],
        'agreer_name': adminLang['합의자 이름'],
        'guide_approver_deletable': adminLang['사용자가 지정 결재자를 삭제할 수 있음'],
        'reception': adminLang['문서 수신'],
        'use': commonLang['사용'],
        'possible': commonLang['가능'],
        'impossible': commonLang['불가능'],
        'year': approvalLang['년'],
        'dept': approvalLang['부서'],
        'user': adminLang['사용자'],
        'select_dept': adminLang['부서 검색'],
        'select_user': adminLang['사용자 검색'],
        'edit_template': adminLang['양식 편집'],
        'template_editor': commonLang['양식 편집기'],
        'template_preview': commonLang['미리보기'],
        'load_template_title': commonLang['양식 불러오기'],
        'load_another_template': commonLang['다른 양식 불러오기'],
        'system_integration': adminLang['시스템 연동'],
        'folder': adminLang['전사 문서함\n보관 폴더'],
        'unsigned': adminLang['미지정'],
        'folder_addable': adminLang['사용자가 저장 폴더를 추가할 수 있음'],
        'arbt_decision_active': adminLang['전결 옵션'],
        'use_right': adminLang['작성 권한'],
        'all_user': adminLang['전체 사용자'],
        'specific_user': adminLang['일부 사용자'],
        'preserve_in_year': approvalLang['보존연한'],
        'preserve_changeable': adminLang['사용자 변경 가능'],
        'securityLevel_changeable': adminLang['사용자 변경 가능'],
        'activity_editable': adminLang['결재선 수정'],
        'document_editable': adminLang['문서 수정'],
        'approver_allow': adminLang['결재자가 수정할 수 있음'],
        'approver_disallow': adminLang['결재자는 수정할 수 없음'],
        'official_document_send': approvalLang['공문 발송 기능'],
        'invalid_template_html_activity_groups': approvalLang['결재라인 정보가 양식에 반영되지 않았습니다. 양식을 수정해주세요.'],
        'invalid_template_html_receivers': approvalLang['양식에 수신자 정보가 제대로 반영되지 않았습니다. 양식을 수정해주세요.'],
        'is_over_max_approval_count': approvalLang['지정 결재자가 최대 결재자 인원수를 초과하였습니다.'],
        'is_nothing_checked_approval_type': approvalLang['결재 타입을 한개 이상 선택해주세요'],
        'is_appointmentof_notselectedtype': approvalLang['선택하지 않은 타입의 지정 결재자가 있습니다'],
        'security_level': adminLang['보안등급'],
        'state': adminLang['사용여부'],
        'hidden': adminLang['숨김'],
        'normal': adminLang['정상'],
        'allow': commonLang['허용'],
        'disallow': commonLang['비허용'],
        'empty_msg': adminLang['등록된 양식이 없습니다.'],
        'receiverEditable': adminLang['사용자가 수신처 수정 가능'],
        'referrerEditable': adminLang['기안자가 참조자 수정 가능'],
        'readerEditable' : approvalLang['사용자가 지정 열람자 삭제 가능'],
        'adminUser': adminLang['운영자'],
        'reader': adminLang['문서 열람자'],
        'reference': adminLang['문서 참조자'],
        'creation_success_msg': adminLang['저장되었습니다. 양식 목록으로 이동합니다.'],
        'creation_fail_msg': adminLang['저장할 수 없습니다.'],
        'duplicated_name': adminLang['제목이 중복되었습니다.'],
        'duplicated_code': adminLang['코드가 중복되었습니다.'],
        'form_changed' : approvalLang['최종버전양식이아닙니다.'],
        'name_required': adminLang['제목을 입력하세요.'],
        'alias_required': adminLang['양식약어를 입력하세요.'],
        'name_invalid_length': adminLang['제목은 100자까지 입력할 수 있습니다.'],
        'alias_invalid_length': adminLang['양식약어는 100자까지 입력할 수 있습니다.'],
        'description_invalid_length': adminLang['양식설명은 500자까지 입력할 수 있습니다.'],
        'state_required': adminLang['상태를 지정하세요.'],
        'integration_invalid': adminLang['연동 옵션을 선택해주세요.'],
        'documentOpenable': adminLang['공개여부'],
        'documentOpen': adminLang['공개'],
        'documentClose': adminLang['비공개'],
        'documentOpenEditable': adminLang['사용자가 공개여부 수정 가능'],
        'select': commonLang['선택'],
        'add': commonLang['추가'],
        'delete': commonLang['삭제'],
        'save': commonLang['저장'],
        'cancel': commonLang['취소'],
        'displayDrafter_desc': adminLang['기안자 표시 설명'],
        'includeAgreement_desc': adminLang['결재방 표시 설명'],
        "운영자 추가": adminLang['운영자 추가'],
        "수정권한": adminLang['수정권한'],
        "삭제권한": adminLang['삭제권한'],
        '메일 발송 기능': adminLang['메일 발송 기능'],
        '메일 발송 기능 설명': adminLang['메일 발송 기능 설명'],
        '1인결재 옵션': adminLang['1인결재 옵션'],
        '1인결재 옵션 설명': adminLang['1인결재 옵션 설명'],
        '게시판 등록 기능': adminLang['게시판 등록 기능'],
        '사용': commonLang['사용'],
        '사용하지 않음': commonLang['사용하지 않음'],
        '자동결재선': adminLang['자동결재선'],
        'code_required': approvalLang['코드를 입력하세요'],
        'apprlineruleid_required': approvalLang['자동 결재선을 선택해주세요'],
        'invalid_apprlinerule_form': approvalLang['자동결재선 정보가 양식에 반영되지 않았습니다 양식을 수정해주세요'],
        'script': approvalLang['스크립트'],
        '변경': commonLang['변경'],
        '수신처 지정 필수': approvalLang['수신처 지정 필수'],
        '수신문서 수정 허용': approvalLang['수신문서 수정 허용'],
        '파일경로': approvalLang['파일경로'],
        '스크립트편집': approvalLang['스크립트편집'],
        '스크립트 예시': approvalLang['스크립트 예시'],
        '수정': commonLang['수정'],
        '공문발송양식설명': approvalLang['공문발송양식설명'],
        '시행문': approvalLang['시행문'],
        '발신명의': approvalLang['발신명의'],
        '직인': approvalLang['직인'],
        '미리보기직인노출': approvalLang['미리보기 직인 노출'],
        '미리보기직인노출설명': approvalLang['미리보기직인노출설명'],
        'changeable': adminLang['사용자 변경 가능'],
		'전결완료유형문서' : approvalLang['전결완료유형문서'],
		'전결완료유형결재방' : approvalLang['전결완료유형결재방'],
		'연동코드설명' : approvalLang['결재 연동코드 설명'],
        '기본': commonLang['기본'],
        '결재정보': commonLang['결재정보'],
        '권한 보안': commonLang['권한 보안'],
        '기타': commonLang['기타'],
        '양식 약어 도움말': commonLang['양식 약어 도움말'],
        '전사 문서함 보관 폴더 도움말': commonLang['전사 문서함 보관 폴더 도움말'],
        "양식 편집 도움말": commonLang['양식 편집 도움말'],
        "사용 여부 도움말" : commonLang['사용 여부 도움말'],
        "문서 참조자 도움말" : commonLang['문서 참조자 도움말'],
        "문서 열람자 도움말" : commonLang['문서 열람자 도움말'],
        "문서 수신 도움말" : commonLang['문서 수신 도움말'],
        "공문 발송 기능 도움말" : commonLang['공문 발송 기능 도움말'],
        "전결 도움말" : commonLang['전결 도움말'],
        "1인 결재 도움말" : commonLang['1인 결재 도움말'],
        "작성 권한 도움말" : commonLang['작성 권한 도움말'],
        "문서 수정 도움말" : commonLang['문서 수정 도움말'],
        "결재선 수정 도움말" : commonLang['결재선 수정 도움말'],
        "운영자 도움말" : commonLang['운영자 도움말'],
        "보존연한 도움말" : commonLang['보존연한 도움말'],
        "보안등급 도움말": commonLang['보안등급 도움말'],
        "공개여부 도움말": commonLang['공개여부 도움말'],
        "양식 도움말": commonLang['양식 도움말'],
        "메일 발송 기능 도움말": commonLang['메일 발송 기능 도움말'],
        "게시판 등록 기능 도움말": commonLang['게시판 등록 기능 도움말'],
        "시스템 연동 도움말": commonLang['시스템 연동 도움말'],
        "결재선을 추가한 후 저장해 주세요" : commonLang["결재선을 추가한 후 저장해 주세요"],
        "모든 결재 권한 사용자": approvalLang['모든 결재 권한 사용자'],
        "일부 결재 권한 사용자": approvalLang['일부 결재 권한 사용자'],
        "결재": approvalLang['결재'],
        "합의": approvalLang['합의'],
        "감사": approvalLang['감사'],
        "확인": approvalLang['확인'],
        "결재양식저장안내" : adminLang['결재양식저장안내'],
        '모바일 기안 허용': approvalLang['모바일 기안 허용'],
        '모바일 기안 허용 도움말': approvalLang['모바일 기안 허용 도움말'],
    };

    ApprConfigModel = Backbone.Model.extend({
        url: apiBaseUrl + 'approval/admin/config'
    });

    OfficialFormCollection = Backbone.Collection.extend({
        url: apiBaseUrl + 'approval/official/form'
    });

    OfficialSenderCollection = Backbone.Collection.extend({
        url: apiBaseUrl + 'approval/official/sender'
    });

    OfficialSignCollection = Backbone.Collection.extend({
        url: apiBaseUrl + 'approval/official/sign'
    });

    /**
     * 연동 모델
     */
    IntegrationModel = Backbone.Model.extend({
        defaults: {
            name: '',
            beanName: '',
            description: '',
            isSelected: false
        }
    });

    /**
     * 연동 목록 컬렉션
     */
    IntegrationCollection = Backbone.Collection.extend({
        url: apiBaseUrl + 'approval/integration',
        model: IntegrationModel,

        getSelected: function() {
            return this.find(function(model) {
                return model.get('isSelected');
            });
        },

        setSelected: function(beanName) {
            var sameBeanName = this.find(function(model) {
                return model.get('beanName') == beanName;
            });

            if (sameBeanName) {
                sameBeanName.set('isSelected', true);
            }
        },

        selectFirstOneIfNothingSelected: function() {
            if (this.isEmpty() || this.getSelected()) {
                return;
            }
            this.at(0).set('isSelected', true);
        }
    });

    /**
     *
     * 자동 결재선 모델
     *
     */
    ApprLineRuleCollection = Backbone.Collection.extend({
        url: function() {
            return GO.contextRoot + 'ad/api/approval/apprlinerule';
        }
    });
    ApprLineRuleFormModel = Backbone.Model.extend();

    /**
     *
     * 연동 목록 화면
     *
     */
    IntegrationListView = Backbone.View.extend({

        tagName: 'select',
        className: 'integration_list',
        selected: null,
        optNameForIntegrationBtn: 'standardApprIntegration', //Standradard DB연동 옵션시에만 버튼을 보여준다.
        initialize: function(options) {
            this.collection = new IntegrationCollection();
            if (options.selected) {
                this.selected = options.selected;
            }
        },

        render: function() {
            this.$el.remove();
            this.$el.text(adminLang['연동 프로그램 선택']);
            this.$el.hide();

            this.collection.fetch({
                success: $.proxy(function(collection) {
                    if (!_.isNull(this.selected)) {
                        collection.setSelected(this.selected.beanName);
                    }
                    collection.selectFirstOneIfNothingSelected();
                    this.$el.append(this._renderTemplate({
                        'list': collection.toJSON()
                    }));
                    this.trigger('toggleConfigStandardButton', this.collection.findWhere({'isSelected': true}).get('beanName') == this.optNameForIntegrationBtn);
                }, this)
            });

            $('select.' + this.className).die().
                live('change', $.proxy(this._onSelected, this));
            $('#docInfo_txt_form').trigger('change');

            return this;
        },

        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        },

        getSelectedAsJSON: function() {
            var selected = _.find(this.collection.models, function(m) {
                return m.get('isSelected') == true;
            });
            return selected.toJSON();
        },

        _renderTemplate: function(data) {
            var htmls = [
                '{{#list}}',
                '    <option value="{{beanName}}" {{#isSelected}}selected{{/isSelected}}>{{name}}</option>',
                '{{/list}}'
            ];
            return Hogan.compile(htmls.join('')).render(data);
        },

        _onSelected: function(e) {
            var selectedName = $(e.target).val();
            _.map(this.collection.models, function(m) {
                if (m.get('beanName') == selectedName) {
                    m.set('isSelected', true);
                }
                else {
                    m.set('isSelected', false);
                }
            });
            this.trigger('toggleConfigStandardButton', selectedName == this.optNameForIntegrationBtn);

        }
    });


    /**
     * 결재 양식 상세 뷰이다. 생성과 수정에 사용된다.
     */
    return Backbone.View.extend({

        el: '#layoutContent',
        model: null,

        apprLineView: null,
        receiverView: null,
        formUserView: null,
        templateEditorView: null,
        initEditor: null,
        integrationListView: null,
        securityLevelListView: null,

        preserveYears: [],
        receiveAllowType: 'ALL',
        adminUserData: [],

        events: {
            'click div.tit': '_onClickFold',
            'change input[name="name"]': '_onChangeName'
        },

        initialize: function(options) {
            this.$el.off();
            options = _.extend({}, options);
            this.model = options.model;
            this.apprConfigModel = new ApprConfigModel({});
            this.companyCollection = new CompanyCollection({
                'type': 'companygroup'
            });
            this.apprLineRuleCollection = new ApprLineRuleCollection();
            this.isServiceMode = GO.session().serviceAdminMode;
            this.isSystemAdmin = GO.session().systemAdmin;
            this.siteConfigModel = new SiteConfigModel.read({isAdmin : true});
            this.isEditableIntegration = (!this.isServiceMode || this.isSystemAdmin || (this.siteConfigModel.get("allianceSystemService") == "on"));
            this.activityGroups = new ActivityGroups();
            this.bindEvents();

            this.listenTo(this.model, 'sync', this._onSyncModel);
            this.listenTo(this.activityGroups, 'change', this._onChangeActivityGroups);
            this.listenTo(this.activityGroups, 'remove', this._onRemoveActivityGroups);

            if (!this.model.id) this._initTemplateEditor();

            this.listenTo(this.model, 'change:name', _.bind(function(model) {
                this.$('input[name="name"]').val(model.get('name'));
            }, this));

            //this.listenTo(this.model, 'change', _.bind(function(a) {
            //    console.log(a.changed);
            //}, this));
        },

        bindEvents: function() {
            this.$el.off('change', 'input[name=useHelp]');
            this.$el.off('change', 'input[name=receptionActive]');
            this.$el.off('change', 'input[name=receiverEditable]');
            this.$el.off('change', 'input[name=integrationActive]');
            this.$el.off('click', 'input[name=formUserScope]');
            this.$el.off('click', '#load_template_editor');
            this.$el.off('click', '#preview_template');
            this.$el.off('click', '#save_btn');
            this.$el.off('click', '#cancel_btn');
            this.$el.off('click', '#btn_config_standard');
            this.$el.off('change', 'input[name=useApprLineRule]');
            this.$el.off('click', '#apprLineRule_add');
            this.$el.off('click', '#cancelSelectedLineRule');
            this.$el.off('change', '#input[name=scriptType]');
            this.$el.off('click', '#scriptInitData');
            this.$el.off('change', 'input[name=officialDocumentSendable]');
            this.$el.off('change', 'select[name=officialSender]');
            this.$el.off('change', 'input[name=arbtDecisionActive]');

            this.$el.on('change', 'input[name=useHelp]', $.proxy(this._changeUseHelpConfig, this));
            this.$el.on('change', 'input[name=receptionActive]', $.proxy(this._onReceptionActiveChecked, this));
            this.$el.on('change', 'input[name=receiverEditable]', $.proxy(this._offReceiverEditableChecked, this));
            this.$el.on('change', 'input[name=readerActive]', $.proxy(this._onReaderActiveChecked, this));
            this.$el.on('change', 'input[name=referenceActive]', $.proxy(this._onReferenceActiveChecked, this));
            this.$el.on('change', 'input[name=integrationActive]', $.proxy(this._onIntegrationActiveChanged, this));
            this.$el.on('click', 'input[name=formUserScope]', $.proxy(this._onFormUserScopeChanged, this));
            this.$el.on('click', '#load_template_editor', $.proxy(this._openTemplateEditor, this));
            this.$el.on('click', '#preview_template', $.proxy(this._previewTemplate, this));
            this.$el.on('click', '#save_btn', $.proxy(this._onSaveClicked, this));
            this.$el.on('click', '#cancel_btn', $.proxy(this._onCancelClicked, this));
            this.$el.on('click', '#docInfo_btn_edit', $.proxy(this._docTypeSelect, this));
            this.$el.on('click', '#docInfo_btn_delete', $.proxy(this._docTypeDelete, this));
            this.$el.on('click', '#admin', $.proxy(this._addAdmin, this));
            this.$el.on('click', '#adminTable span.ic_basket', $.proxy(this._deleteAdmin, this));
            this.$el.on('click', '#btn_config_standard', $.proxy(this._popupConfigStandardLayer, this));
            this.$el.on('change', 'input[name=useApprLineRule]', $.proxy(this._changeUseApprLineRule, this));
            this.$el.on("click", "#apprLineRule_add", $.proxy(this._addApprLineRule, this));
            this.$el.on('click', '#cancelSelectedLineRule', $.proxy(this.cancelSelectedLineRule, this));
            this.$el.on('change', 'input[name=scriptType]', $.proxy(this._onScriptTypeChecked, this));
            this.$el.on('click', '#scriptInitData', $.proxy(this._popupScriptSampleLayer, this));
            this.$el.on('change', 'input[name=officialDocumentSendable]', $.proxy(this._changeOfficialConfig, this));
            this.$el.on('change', 'input[name=arbtDecisionActive]', $.proxy(this._onArbtDecisionActiveChanged, this));
            this.$el.on('change', '#docInfo_txt_form', $.proxy(this._onChangeCompanyFolder, this));

            this.$el.off('click', '#load_old_template_editor').on('click', '#load_old_template_editor', $.proxy(this._openOldTemplateEditor, this));
            this.$el.on('change', 'input[name=documentEditable]', $.proxy(this._onDocumentEditableChanged, this));    
            this.$el.on('change', 'input[name=documentEditableType]', $.proxy(this._onDocumentEditableTypeChanged, this));    
            this.$el.on('change', 'input[name=activityEditable]', $.proxy(this._onActivityEditableChanged, this)); 
            this.$el.on('change', 'input[name=activityEditableType]', $.proxy(this._onActivityEditableTypeChanged, this));   
            // this.$el.on('change', 'input[name=allowMobileApproval]', $.proxy(this._onAllowMobileApprovalChanged, this));
        },
        // _onAllowMobileApprovalChanged: function(e){
        //     $("#allowMobileApproval").toggle($(e.target).is(':checked'));
        // },
        render: function() {
        	this.apprConfigModel.fetch({
                success: _.bind(function(property) {
                    this.receiveAllowType = property.get('receiveAllowType');
                    this.allowAgreement = property.get('useAgreement');
                    this.agreementAllowType = property.get('agreementAllowType');
                    this.allowCheck = property.get('useCheckActivity');
                    this.allowInspection = property.get('useInspectionActivity');
                    this.apprLineRuleFormModel = new ApprLineRuleFormModel(this.model.get('apprLineRuleModel'));
                    if (property.get('multiCompanySupporting') == true) {
                        this.companyCollection.fetch({
                            success: _.bind(function(companies) {
                            	this.companyIds = companies.map(function(company) {return company['id'];});
                            	this.templateEditorView.setCompanyIds(this.companyIds);
                                this._renderWithData(this.companyIds);
                            }, this)
                        });
                    } else {
                        this._renderWithData(null);
                    }
                }, this)
            });
        },

        _onClickFold: function(e) {
            var $el = $(e.currentTarget).parent('.module_drop_head').siblings('.module_drop_body').toggle();
            if ($el.is(':visible') && $el.find('#useHelp').is(':checked')) this._initDescriptionEditor();
        },

        _initDescriptionEditor: function() {
            if (this.initEditor) return;
            this.initEditor = $("#description_editor").goWebEditor({
                contextRoot: GO.config('contextRoot'),
                lang: GO.session('locale'),
                editorValue: this.model.get('description'),
                appLoadCallBack: function() {
                    if (!$("#useHelp").is(':checked')) {
                        $("#description").hide();
                    }
                }
            });
        },

        _renderWithData: function(companyIds) {
            // var templateData = this._makeTemplateData();
            var makeTemplateData = this._makeTemplateData();
            this.$el.html(formTmpl(makeTemplateData));

            this._renderReceptionView(companyIds);
            this._renderIntegrationListView();
            this._renderFormUserView();
            this._renderSecurityLevelView();
            this._renderAdminView();
            this._renderApprLineView(companyIds);
            this._renderOfficialForms();
            this._renderOfficialSenders();
            this._renderOfficialSigns();

            //if (templateData.useApprLineRule && templateData.apprLineRuleModel && templateData.apprLineRuleModel.id && templateData.apprLineRuleModel.name) {
            //    this._setSelectedLineRule(templateData.apprLineRuleModel.id, templateData.apprLineRuleModel.name);
            //    $('#useApprLineRule').click();
            //}
            this._renderReaderView(companyIds);
            this._renderReferenceView(companyIds);
            this._renderDocAndActivityEditable();
        },

        _makeTemplateData: function() {
        	var isCreate = this.model.id ? false : true;
            var preserveYears = _.map(ApprFormModel.PRESERVE_YEARS, function(num) {
                return {
                    'value': num,
                    'label': (num == 0) ? approvalLang['영구'] : App.i18n(commonLang["{{arg1}}년"], {arg1: num}),
                    'isSelected': (this.model.get('preserveDurationInYear') * 1 == num * 1)
                };
            }, this);

            var wrappedState = this.model.get('state') == "NORMAL";
            var wrappedAllowMobileApproval = this.model.get('allowMobileApproval') || false;
            var wrappedFormUserScope = this.model.get('formUserScope') == "ALL";
            var scriptTypeInput = this.model.get('formScriptType') == "SRC";
            var notUseOfficialSender = this.model.get('officialSenderId') == '';
            var arbtDecisionTypeValue = this.model.get('arbtDecisionType') == "DOCUMENT";
            var useCompanyAgreement = this.apprConfigModel.get('useAgreement') || false;
            var useCompanyCheckActivity = this.apprConfigModel.get('useCheckActivity') || false;
            var useCompanyInspectionActivity = this.apprConfigModel.get('useInspectionActivity') || false;
            var useCompanyApprovalOtherType = useCompanyAgreement || useCompanyCheckActivity || useCompanyInspectionActivity;

            var tmplData = {
                lang: lang,
                isCreate: isCreate,
                preserveYears: preserveYears,
                wrappedState: wrappedState,
                wrappedFormUserScope: wrappedFormUserScope,
                wrappedAllowMobileApproval: wrappedAllowMobileApproval,
                scriptTypeInput: scriptTypeInput,
                notUseOfficialSender: notUseOfficialSender,
                arbtDecisionTypeValue : arbtDecisionTypeValue,
                isEditableIntegration : this.isEditableIntegration,
                useCompanyApprovalOtherType : useCompanyApprovalOtherType,
                useCompanyAgreement : useCompanyAgreement,
                useCompanyCheckActivity : useCompanyCheckActivity,
                useCompanyInspectionActivity : useCompanyInspectionActivity,
            };
            return _.extend(tmplData, this.model.toJSON());
        },

        _renderDocAndActivityEditable: function() {
        	var useDocEditableTypeAll = false;
        	if(this.model.get('useDocEditableTypeAll') == undefined || !this._useDocEditableTypes()) {
        		useDocEditableTypeAll = true;
        	} else { 
        		useDocEditableTypeAll= this.model.get('useDocEditableTypeAll');
        	}
        	if(useDocEditableTypeAll) {
        		this.$('#documentEditableTypeAll').prop("checked", true);
        		this.$('#documentEditableTypes').hide();
        	} else {
        		this.$('#documentEditableTypes').show();
        	}
        	
        	if(this.model.get('useActivityEditableTypeAll') == undefined || !this._useActivityEditableTypes()) {
        		useActivityEditableTypeAll = true;
        	} else { 
        		useActivityEditableTypeAll= this.model.get('useActivityEditableTypeAll');
        	}
        	if(useActivityEditableTypeAll) {
        		this.$('#activityEditableTypeAll').prop("checked", true);
        		this.$('#activityEditableTypes').hide();
        	} else {
        		this.$('#activityEditableTypes').show();
        	}
        },
        
        _useDocEditableTypes: function() {
        	if(this.model.get('useDocEditableApproval') || this.model.get('useDocEditableAgreement') 
        			|| this.model.get('useDocEditableInspection') || this.model.get('useDocEditableCheck')) {
        		return true;
        	}
        	return false;
        },
        
        _useActivityEditableTypes: function() {
        	if(this.model.get('useActivityEditableApproval') || this.model.get('useActivityEditableAgreement') 
        			|| this.model.get('useActivityEditableInspection') || this.model.get('useActivityEditableCheck')) {
        		return true;
        	}
        	return false;
        },

        _renderApprLineView: function(companyIds) {
            this.apprLineView = new ActivityGroupAppView({
                groups: this.activityGroups,
                apprlinerule: this.model.get('apprLineRuleModel'),
                companyIds: companyIds,
                allowAgreement: this.allowAgreement,
                agreementAllowType: this.agreementAllowType,
                allowCheck: this.allowCheck,
                allowInspection: this.allowInspection,
                formid: this.model.id
            });
            this.$el.find('#appr_line_td').prepend(this.apprLineView.render());
        },

        _renderOfficialForms: function() {
            var self = this;
            this.officialFormCollection = new OfficialFormCollection();
            this.officialFormCollection.fetch({
                success: function(collection) {
                    self._markSelectedOfficialData(collection, self.model.get('officialFormId'));
                    self.$el.find('select[name=officialForm]').append(self._renderOfficalTmpl({
                        officialData: collection.toJSON()
                    }));
                }
            });
        },

        _renderOfficialSenders: function() {
            var self = this;
            this.officialSenderCollection = new OfficialSenderCollection();
            this.officialSenderCollection.fetch({
                success: function(collection) {
                    self._markSelectedOfficialData(collection, self.model.get('officialSenderId'));
                    self.$el.find('select[name=officialSender]').append(self._renderOfficalTmpl({
                        officialData: collection.toJSON()
                    }));
                }
            });
        },

        _renderOfficialSigns: function() {
            var self = this;
            this.officialSignCollection = new OfficialSignCollection();
            this.officialSignCollection.fetch({
                success: function(collection) {
                    self._markSelectedOfficialData(collection, self.model.get('officialSignId'));
                    self.$el.find('select[name=officialSign]').append(self._renderOfficalTmpl({
                        officialData: collection.toJSON()
                    }));
                }
            });
        },

        _renderOfficalTmpl: function(data) {
            var tmpl = [];
            _.extend(data, {});
            tmpl.push('{{#officialData}}');
            tmpl.push('    <option value="{{id}}" {{#isSelected}}selected{{/isSelected}}>{{name}}</option>');
            tmpl.push('{{/officialData}}');
            var compiled = Hogan.compile(tmpl.join('\n'));
            return compiled.render(data);
        },

        _markSelectedOfficialData: function(collection, selected) {
            if (selected) {
                collection.each(function(m) {
                    if (m.get('id') == selected) {
                        m.set('isSelected', true);
                    }
                });
            }
        },

        _renderReceptionView: function(companyIds) {
            var nodeTypes = [];
            if (this.receiveAllowType == 'ALL') {
                if (GO.util.isUseOrgService(true)) {
                    nodeTypes = ['user', 'department-nosub'];
                }
            } else if (this.receiveAllowType == 'DEPARTMENT') {
                if (GO.util.isUseOrgService(true)) {
                    nodeTypes = ['department-nosub'];
                }
            } else if (this.receiveAllowType == 'USER') {
                nodeTypes = ['user'];
            }

            this.receiverView = new CircleView({
                selector: '#form_receiver',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('receiver'),
                nodeTypes: nodeTypes,
                withCompanies: true,
                companyIds: companyIds,
                useApprReception: true,
                noSubDept: true,
                companyCollectionType : "companygroup"
            });
            this.receiverView.render();
        },

        _renderReaderView: function(companyIds) {
        	var nodeTypes = ['user'];
            this.readerView = new CircleView({
                selector: '#form_reader',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('reader'),
                nodeTypes: nodeTypes,
                withCompanies: true,
                companyIds: companyIds,
                companyCollectionType : "companygroup"
            });
            this.readerView.render();
        },        

        _renderReferenceView: function(companyIds) {
            var nodeTypes = ['user'];
            if (GO.util.isUseOrgService(true)) {
                nodeTypes = ['user', 'department'];
            }
            this.referrerView = new CircleView({
                selector: '#form_referrer',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('referrer'),
                nodeTypes: nodeTypes,
                withCompanies: true,
                companyIds: companyIds,
                useApprReference: true,
                companyCollectionType : "companygroup"
            });
            this.referrerView.render();
        },

        _renderIntegrationListView: function() {
            this.integrationListView = new IntegrationListView({
                selected: this.model.get('integration')
            });
            this.integrationListView.render();
            this.$('#integration_container span:eq(1)').after(this.integrationListView.$el);
            if (this.model.get('integrationActive') == true) {
                this.integrationListView.show();
            }
            this.listenTo(this.integrationListView, 'toggleConfigStandardButton', this.toggleConfigStandardButton);
            this.$('#integration_container .integration_list').after('<span class="btn_wrap"><span class="btn_s" id="btn_config_standard">' + commonLang['설정'] + '</span></span>');
        },

        toggleConfigStandardButton: function(visible) {
            this.$('#btn_config_standard').toggle(visible);
        },

        _renderFormUserView: function() {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if (GO.util.isUseOrgService(true)) {
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }

            this.formUserView = new CircleView({
                selector: '#formUser',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('formUser'),
                nodeTypes: nodeTypes
            });

            this.formUserView.render();
            if (this.model.get('formUserScope') == 'ALL') {
                this.formUserView.hide();
            } else {
                this.formUserView.show();
            }
        },

        _renderSecurityLevelView: function() {
            this.securityLevelListView = new SecurityLevelListView({
                el: this.$el.find('select[name=securityLevel]'),
                selectedData: this.model.get('securityLevel')
            });
            this.securityLevelListView.render();
        },

        _renderAdminView: function() {
            var self = this;
            var target = $('#adminTable .in_table');
            self.adminUserData = [];

            if (this.model.get('admin')) {
                _.each(this.model.get('admin').nodes, function(data) {
                    if (data && !target.find('tr[data-id="' + data.nodeId + '"]').length) {
                        if (!target.length) {
                            $('#adminTable').append(
                                tplApprAdminOwners({
                                    lang: lang
                                }));
                            target = $('#adminTable .in_table');
                        }
                        target.find('tbody').append(
                            tplApprAdminOwnersData(
                                $.extend({
                                    id: data.nodeId,
                                    name: data.nodeValue,
                                    writeChecked: (data.actions.indexOf("write") != -1),
                                    removeChecked: (data.actions.indexOf("remove") != -1)
                                }, {
                                    lang: lang
                                })));
                        self.adminUserData.push(data);
                    }
                });
            }
        },

        _addAdminEl: function(rs) {
            var self = this;
            var target = $('#adminTable .in_table');
            if (rs && !target.find('tr[data-id="' + rs.id + '"]').length) {
                if (!target.length) {
                    $('#adminTable').append(
                        tplApprAdminOwners({
                            lang: lang
                        }));
                    target = $('#adminTable .in_table');
                }
                target.find('tbody').append(
                    tplApprAdminOwnersData(
                        $.extend(rs, {
                            lang: lang
                        })));

                self.adminUserData.push({
                    nodeId: rs.id,
                    nodeDeptId: rs.deptId,
                    nodeCompanyId: null,
                    nodeCompanyName: null,
                    nodeType: 'user',
                    nodeValue: rs.name + " " + rs.position,
                    actions: '',
                    members: []
                });

            }
        },

        _addAdmin: function(e) {
            var self = this;
            $.goOrgSlide({
                target: e,
                header: '',
                type: 'list',
                isAdmin: true,
                contextRoot: GO.config("contextRoot"),
                callback: $.proxy(self._addAdminEl, self)
            });
        },

        _deleteAdmin: function(e) {
            var self = this;
            var tables = this.$el.find('#adminTable>table'),
                ownersTable = $(tables[0]),
                target = tables.find('tbody');
            target.find('tr[data-id="' + $(e.currentTarget).attr('data-id') + '"]').remove();

            self.adminUserData = _.reject(self.adminUserData, function(data) {
                return data.nodeId == $(e.currentTarget).attr('data-id');
            });

            if (!ownersTable.find('tbody>tr').length) {
                ownersTable.remove();
            }
        },

        _changeUseHelpConfig: function(e) {
            $("#description").toggle($(e.target).is(':checked'));
            this._initDescriptionEditor();
        },

        _changeOfficialConfig: function(e) {
            $("#official_detail").toggle($(e.target).is(':checked'));
        },

        _onReceptionActiveChecked: function(e) {
            this.$('#reception_detail').toggle($(e.target).is(':checked'));
        },

        _onScriptTypeChecked: function() {
            var isScriptType = this.$('input[name="scriptType"]:checked').val() == "SRC";
            this.$('input[name="externalScript"]').toggle(isScriptType);
            this.$('textarea[name="scriptBody"]').toggle(!isScriptType);
            $('#scriptInitData').toggle(!isScriptType);
        },

        _offReceiverEditableChecked: function(e) {
            if (!$(e.target).is(':checked')) {
                this.$('#useRequiredReceiver').attr('checked', false);
                this.$('#useRequiredReceiver').attr('disabled', true);
            } else {
                this.$('#useRequiredReceiver').attr('disabled', false);
            }
        },

        _onReaderActiveChecked: function(e) {
            this.$('#reader_detail').toggle($(e.target).is(':checked'));
        },
        
        _onReferenceActiveChecked: function(e) {
            this.$el.find('#reference_detail').toggle($(e.target).is(':checked'));
        },

        _onIntegrationActiveChanged: function(e) {
            var isChecked = $(e.target).is(':checked');
            var buttonToggleFlag = isChecked && (this.$('.integration_list').val() == "standardApprIntegration");
            this.$('#btn_config_standard').toggle(buttonToggleFlag);
            if (!isChecked) this.model.set('integration', {});
            this.integrationListView.$el.toggle(isChecked);
            this.$('#integrationLayer').toggle(isChecked);
        },

        _onArbtDecisionActiveChanged: function(e) {
        	this.$('#arbtDecision_detail').toggle($(e.target).is(':checked'));
        },

        _onDocumentEditableChanged: function(e) {
        	this.$('#documentEditable_detail').toggle($(e.target).is(':checked'));
        },
        
        _onActivityEditableChanged: function(e) {
        	this.$('#activityEditable_detail').toggle($(e.target).is(':checked'));
        },
        
        _onDocumentEditableTypeChanged: function(e) {
        	var isAllType = this.$('input[name="documentEditableType"]:checked').val() == "All";
        	if(isAllType) {
        		this.$('#documentEditableTypes').hide();
        	} else {
        		this.$('#documentEditableTypes input:checkbox').prop("checked", false);
        		this.$('#documentEditableTypes input[name="docEditableApproval"]').prop("checked", true);
        		this.$('#documentEditableTypes').show();
        	}
        },
        
        _onActivityEditableTypeChanged: function(e) {
        	var isAllType = this.$('input[name="activityEditableType"]:checked').val() == "All";
        	if(isAllType) {
        		this.$('#activityEditableTypes').hide();
        	} else {
        		this.$('#activityEditableTypes input:checkbox').prop("checked", false);
        		this.$('#activityEditableTypes input[name="activityEditableApproval"]').prop("checked", true);
        		this.$('#activityEditableTypes').show();
        	}
        },
        
        _onChangeCompanyFolder: function(e) {
            var flag = _.isEmpty($(e.currentTarget).attr('data-docTypeId'));
            if (flag) {
                this.$('#docInfo_txt_formAlert').text(adminLang['전사 문서함 폴더가 지정되지 않았습니다.']);
            } else {
                this.$('#docInfo_txt_formAlert').text('');
            }
            this.$("#docInfo_btn_delete").toggle(!flag);
        },
        
        _onFormUserScopeChanged: function(e) {
            var flag = $(e.target).is(':checked');
            if (flag) this.model.set('formUser', {});
            if(flag){
            	this.formUserView.hide();
            }else{
            	this.formUserView.show();
            }
        },

        _openOldTemplateEditor: function() {
            this.templateEditorView.setApprovalInfo(this.activityGroups);
            this.templateEditorView.setCompanyIds(this.companyIds);
            this.templateEditorView.renderOldFormEditor();
            //this.$('#load_old_template_editor').hide();
        },

        _openTemplateEditor: function() {
            this.templateEditorView.setApprovalInfo(this.activityGroups);
            this.templateEditorView.setTitle(this.model.get('name'));
            this.templateEditorView.setCompanyIds(this.companyIds);
            this.templateEditorView.render();
        },

        _previewTemplate: function() {
            this.templateEditorView.preview();
        },

        _docTypeSelect: function() {
            var self = this;
            var docTypeSelectViewLayer = $.goPopup({
                "pclass": "layer_normal layer_approval_line_state",
                "header": approvalLang['문서 분류 선택'],
                "modal": true,
                "width": 300,
                "contents": "",
                "buttons": [{
                    'btext': commonLang['확인'],
                    'autoclose': false,
                    'btype': 'confirm',
                    'callback': function(rs) {
                        if (docTypeSelectView.doc_type_confirm()) {
                            self.$el.find('#docInfo_txt_form').trigger('change');
                            rs.close();
                        } else {
                            return false;
                        }
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
            });

            var docTypeSelectView = new DocTypeSelectView({});
            docTypeSelectView.render();
            docTypeSelectViewLayer.reoffset();
        },

        _docTypeDelete: function() {
            $('#docInfo_txt_form').text('');
            $('#docInfo_txt_form').attr('data-docTypeId', '');
            $('#docInfo_txt_form').trigger('change');
        },

        _popupScriptSampleLayer: function() {
            var sampleLayer = $.goPopup({
                "pclass": "layer_normal system_link_popup",
                "header": approvalLang['스크립트 예시'],
                "modal": true,
                "width": 700,
                "contents": '',
                "buttons": [{
                    'btext': commonLang["닫기"],
                    'btype': 'cancel'
                }]
            });
            sampleLayer.find('.content').html(scriptSampleTmpl({lang: lang}));
            sampleLayer.reoffset();
        },
        _popupConfigStandardLayer: function() {
            var self = this;
            var apprFormIntegrationLayer = $.goPopup({
                "pclass": "layer_normal layer_appr_link",
                "header": approvalLang['결재 DB 연동 설정'],
                "modal": true,
                "width": 1000,
                "contents": "",
                "buttons": [{
                    'btext': commonLang['확인'],
                    'autoclose': false,
                    'btype': 'confirm',
                    'callback': function(rs) {
                        var result = self.apprFormIntegrationMainView.validate();
                        if (result) {
                            var data = self.apprFormIntegrationMainView.getData();
                            self.model.setIntegrationDetailModel(data.toJSON());
                            rs.close();
                        }
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
            });

            var detailData = this.model.getIntegrationDetailModel();
            this.apprFormIntegrationMainView = new ApprFormIntegrationMainView({
                model: new IntegrationDetailModel(detailData)
            });
            this.apprFormIntegrationMainView.fetchDataSource().done(function() {
                self.apprFormIntegrationMainView.render();
                apprFormIntegrationLayer.reoffset();
                apprFormIntegrationLayer.css('position', 'absolute');
            });

        },

        getIntegrationData: function() {
            var integrationDetailData;
            var integrationListData = this.integrationListView.getSelectedAsJSON();
            if (this.$el.find('#integrationActive').is(':checked')) {
                integrationDetailData = this.model.getIntegrationDetailModel();
                integrationDetailData['formCode'] = this.model.get('code');
                integrationListData['integrationDetailModel'] = integrationDetailData;
            }
            return integrationListData;
        },

        /**
         * 자동결재선 on > 자동결재선 추가
         * @private
         */
        _addApprLineRule: function() {
            var self = this;
            var apprLineRuleLayer = $.goPopup({
                "pclass": "layer_normal layer_pay_line",
                "header": lang['자동결재선'],
                "modal": true,
                "width": 504,
                "contents": "",
                "buttons": [{
                    'btext': commonLang['확인'],
                    'autoclose': false,
                    'btype': 'confirm',
                    'callback': function(rs) {
                        self.apprLineRuleFormModel = $(rs[0]).find('.content').data('instance').ApprLineRuleFormModel;
                        var selectedName = $(rs[0]).find('#apprLineRuleSelect option:selected').text();
                        var selectedId = $(rs[0]).find('#apprLineRuleSelect option:selected').val();
                        if (!_.isEmpty(selectedName) && !_.isEmpty(selectedId)) {
                            self._setSelectedLineRule(selectedId, selectedName);
                        }
                        rs.close();
                    }
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
            });

            this.apprLineRuleCollection.fetch({
                success: function() {
                    var apprLineRuleView = new ApprLineRuleView({
                        collection: self.apprLineRuleCollection
                    });
                    apprLineRuleView.render();
                    apprLineRuleLayer.reoffset();
                    if ($('#apprLineRule_add span.txt').attr('data-state') == 'selected') {
                        apprLineRuleView.trigger('_callApprLineRuleSelect');
                    }
                }
            });

        },

        /**
         * 자동결재선 사용 토글
         * @param e
         * @private
         */
        _changeUseApprLineRule: function(e) {
            var $selectApproverCount = $('#appr_line_tbl tr:eq(0) .approver_max #selectApproverCount');
            if ($(e.currentTarget).is(':checked')) {
                $('#appr_line_tbl tr:eq(0) .tb_approval_line .userAdd').hide();
                $('#appr_line_tbl tr:eq(0) .tb_approval_line .apprLineRule').show();
                if ($('#apprLineRule_add span.txt').attr('data-state') == 'selected') {
                    $('#appr_line_tbl tr:eq(0) .tb_approval_line .selectedLineRule').show();
                }
                $selectApproverCount.attr('disabled', true);
                $selectApproverCount.attr('tempVal', $('#appr_line_tbl tr:eq(0) .approver_max #selectApproverCount').val());
                $selectApproverCount.val("10").trigger('change');
            } else {
                $('#appr_line_tbl tr:eq(0) .tb_approval_line .userAdd').show();
                $('#appr_line_tbl tr:eq(0) .tb_approval_line .apprLineRule').hide();
                $('#appr_line_tbl tr:eq(0) .tb_approval_line .selectedLineRule').hide();
                $selectApproverCount.attr('disabled', false);
                var tempVal = $selectApproverCount.attr('tempVal') || 5;
                $selectApproverCount.val(tempVal).trigger('change');
            }
        },

        _setSelectedLineRule: function(selectedId, selectedName) {
            $('#selectedLineRule').text(selectedName);
            $('#selectedLineRule').attr('data-id', selectedId);
            $('#appr_line_tbl tr:eq(0) .tb_approval_line .selectedLineRule').show();
            $('#apprLineRule_add span.txt').text(lang['변경']);
            $('#apprLineRule_add span.txt').attr('data-state', 'selected');
        },

        /**
         * 자동 결재선이 지정되어 있는 경우 > nameTag delete
         */
        cancelSelectedLineRule: function() {
            $('#appr_line_tbl tr:eq(0) .tb_approval_line .selectedLineRule').hide();
            $('#appr_line_tbl tr:eq(0) .tb_approval_line #selectedLineRule').attr('data-id', '');
            $('#apprLineRule_add span.txt').text(lang['자동결재선']);
            $('#apprLineRule_add span.txt').attr('data-state', 'ready');
        },

        _onSaveClicked: function() {
            var descEditor = GO.Editor.getInstance("description_editor");
            var hasEditor = descEditor && descEditor.$el.parents('body').length;
            if (hasEditor && !descEditor.validate()) {
                $.goError(commonLang['마임 사이즈 초과']);
                return false;
            }

            /**
             * 구 편집기용 설정
             */
            //this.model.set('assignedActivityDeletable', this.$el.find('input[name=assignedActivityDeletable]').is(':checked'));
            //this.model.set('useDisplayDrafter', this.$el.find('input[name=displayDrafter]').is(':checked'));
            //this.model.set('useIncludeAgreement', this.$el.find('input[name=includeAgreement]').is(':checked'));
            //this.model.set('useApprLineRule', this.$el.find('input[name=useApprLineRule]').is(':checked'));
            //this.model.set('name', this.$el.find('input[name=name]').val());
            //this.model.set('templateHtml', this.templateEditorView.getContent());
            //this.model.set('apprLineRuleModel', new ApprLineRuleFormModel({
            //    id: this.$el.find('#selectedLineRule').attr('data-id')
            //}));
            //this.model.set('activityGroups', this.activityGroups.toJSON());
            //  여기까지 구 편집기용 설정

            this.model.set('alias', this.$el.find('input[name=alias]').val());
            if (hasEditor) this.model.set('description',  descEditor.getContent());
            this.model.set('useHelp', this.$el.find('input[name="useHelp"]').is(':checked'));
            this.model.set('receptionActive', this.$el.find('input[name=receptionActive]').is(':checked'));
            this.model.set('receiverEditable', this.$el.find('input[name=receiverEditable]').is(':checked'));
            this.model.set('useRequiredReceiver', this.$el.find('input[name=useRequiredReceiver]').is(':checked'));
            this.model.set('useReceptionDocModifiable', this.$el.find('input[name=useReceptionDocModifiable]').is(':checked'));
            this.model.set('readerActive', this.$el.find('input[name=readerActive]').is(':checked'));
            this.model.set('readerEditable', this.$el.find('input[name=readerEditable]').is(':checked'));
            this.model.set('securityLevelActive', this.$el.find('input[name=securityLevelActive]').is(':checked'));
            this.model.set('referenceActive', this.$el.find('input[name=referenceActive]').is(':checked'));
            this.model.set('referrerEditable', this.$el.find('input[name=referrerEditable]').is(':checked'));
            this.model.set('actCopyAlterable', this.$el.find('input[name=actCopyAlterable]:checked').val());
            this.model.set('externalScript', this.$el.find('input[name=externalScript]').val());

            this.model.set('folderChangeable', this.$el.find('input[name=folderChangeable]').is(':checked'));
            this.model.set('arbtDecisionActive', this.$el.find('input[name="arbtDecisionActive"]').is(':checked'));
            this.model.set('arbtDecisionType', this.$el.find('input[name="arbtDecisionType"]:checked').val());
            this.model.set('formUserScope', this.$el.find('input[name="formUserScope"]').is(':checked') ? "ALL" : "SPECIFIC");
            this.model.set('preserveDurationInYear', this.$el.find('[name=preserveDurationInYear]').val());
            this.model.set('preserveDurationEditable', this.$el.find('input[name=preserveDurationEditable]').is(':checked'));
            this.model.set('documentOpenable', this.$el.find('input[name=documentOpenable]').is(':checked'));
            this.model.set('documentOpenEditable', this.$el.find('input[name=documentOpenEditable]').is(':checked'));

            // 결재선 수정 권한 옵션화
            var activityEditable = this.$el.find('input[name=activityEditable]').is(':checked');
            this.model.set('activityEditable', activityEditable);
            var isActivityEditableAllType = this.$('input[name="activityEditableType"]:checked').val();    
            if (activityEditable && typeof isActivityEditableAllType == 'undefined') {
            	isActivityEditableAllType = true;
            } else {
            	isActivityEditableAllType = (isActivityEditableAllType == "All")? true : false ;    
            }
            this.model.set('useActivityEditableTypeAll', isActivityEditableAllType);
            if(isActivityEditableAllType) {
            	this.model.set('useActivityEditableApproval', false);
            } else {
            	this.model.set('useActivityEditableApproval', this.$el.find('input[name=activityEditableApproval]').is(':checked'));
            }
            this.model.set('useActivityEditableAgreement', this.$el.find('input[name=activityEditableAgreement]').is(':checked'));
            this.model.set('useActivityEditableInspection', this.$el.find('input[name=activityEditableInspection]').is(':checked'));
            this.model.set('useActivityEditableCheck', this.$el.find('input[name=activityEditableCheck]').is(':checked'));
            
            // 문서 수정 권한 옵션화
            var documentEditable = this.$el.find('input[name=documentEditable]').is(':checked');
            this.model.set('documentEditable', documentEditable);
            var isDocEditableAllType = this.$('input[name="documentEditableType"]:checked').val();    
            if (documentEditable && typeof isDocEditableAllType == 'undefined') {
            	isDocEditableAllType = true;
            } else {
            	isDocEditableAllType = (isDocEditableAllType == "All")? true : false ;    
            }
            this.model.set('useDocEditableTypeAll', isDocEditableAllType);
            if(isDocEditableAllType) {
            	this.model.set('useDocEditableApproval', false);
            } else {
            	this.model.set('useDocEditableApproval', this.$el.find('input[name=docEditableApproval]').is(':checked'));
            }
            this.model.set('useDocEditableAgreement', this.$el.find('input[name=docEditableAgreement]').is(':checked'));
            this.model.set('useDocEditableInspection', this.$el.find('input[name=docEditableInspection]').is(':checked'));
            this.model.set('useDocEditableCheck', this.$el.find('input[name=docEditableCheck]').is(':checked'));
            
            this.model.set('state', this.$el.find('input[name="state"]').is(':checked') ? "NORMAL" : "HIDDEN");
            this.model.set('allowMobileApproval', this.$el.find('input[name=allowMobileApproval]').is(':checked'));
            this.model.set('securityLevel', this.securityLevelListView.getSelectedData());
            this.model.set('securityLevelEditable', this.$el.find('input[name=securityLevelEditable]').is(':checked'));
            this.model.set('useSelfApproval', this.$el.find('input[name=useSelfApproval]').is(':checked'));
            this.model.set('useSendMail', this.$el.find('input[name=useSendMail]').is(':checked'));
            this.model.set('usePostRegistable', this.$el.find('input[name=usePostRegistable]').is(':checked'));
            this.model.set('apprLineRuleOptionVariable', this.$el.find('input[name=apprLineRuleOptionVariable]').val());
            this.model.set('apprLineRuleAmountVariable', this.$el.find('input[name=apprLineRuleAmountVariable]').val());

            var companyDocFolderId = $('#docInfo_txt_form').attr('data-docTypeId');
            this.model.set('companyDocFolder', ((companyDocFolderId) ? {id: companyDocFolderId} : null));

            this.model.set('formScriptType', this.$el.find('input[name="scriptType"]:checked').val());
            this.model.set('scriptBody', this.$el.find('textarea[name=scriptBody]').val());

            this.model.set('officialDocumentSendable', this.$el.find('input[name=officialDocumentSendable]').is(':checked'));

            this.model.set('officialFormId', '');
            this.model.set('officialSenderId', '');
            this.model.set('officialSignId', '');
            this.model.set('officialFormEditable', false);
            this.model.set('officialSenderEditable', false);
            this.model.set('officialSignEditable', false);
            this.model.set('officialSignPreviewEditable', false);
            if (this.$el.find('input[name=officialDocumentSendable]').is(':checked')) {
                this.model.set('officialFormId', this.$el.find('select[name=officialForm]').val());
                this.model.set('officialSenderId', this.$el.find('select[name=officialSender]').val());
                this.model.set('officialSignId', this.$el.find('select[name=officialSign]').val());

                this.model.set('officialFormEditable', this.$el.find('input[name=officialFormEditable]').is(':checked'));
                this.model.set('officialSenderEditable', this.$el.find('input[name=officialSenderEditable]').is(':checked'));
                this.model.set('officialSignEditable', this.$el.find('input[name=officialSignEditable]').is(':checked'));
                this.model.set('officialSignPreviewEditable', this.$el.find('input[name=officialSignPreviewEditable]').is(':checked'));
            }

            // GO-32810 serviceAdmin인 경우 해당 메뉴가 보이지 않기 때문에 값을 setting 하면 안됨
            if(this.isEditableIntegration) {
                this.model.set('code', this.$el.find('input[name=code]').val());
                this.model.set('integration', this.getIntegrationData());
                this.model.set('integrationActive', this.$el.find('input[name=integrationActive]').is(':checked'));
            }

            var adminUser = this.adminUserData;
            var $adminEl = $("#adminTable").find("tbody tr");
            _.each(adminUser, function(data) {
                _.each($adminEl, function(el) {
                    if (data.nodeId == $(el).attr('data-id')) {
                        data.actions = "read";
                        if ($(el).find('[name=writePermission]').is(':checked')) {
                            data.actions += ",write";
                        }
                        if ($(el).find('[name=removePermission]').is(':checked')) {
                            data.actions += ",remove";
                        }
                    }
                });
            });
            this.model.set('admin', {nodes: adminUser});

            this.model.set('receiver', {nodes: []});
            if (this.model.get('receptionActive')) {
                this.model.set('receiver', this.receiverView.getData());
            }

            this.model.set('referrer', {nodes: []});
            if (this.model.get('referenceActive')) {
                this.model.set('referrer', this.referrerView.getData());
            }
            
            this.model.set('reader', {nodes: []});
            if (this.model.get('readerActive')) {
            	this.model.set('reader', this.readerView.getData());
            }

            this.model.set('formUser', {nodes: []});
            if (this.model.get('formUserScope') == 'SPECIFIC') {
                this.model.set('formUser', this.formUserView.getData());
            }

            if (this.apprLineView.isOverMaxApprovalCount()) {
                $.goMessage(lang['is_over_max_approval_count']);
                return false;
            }

            if (this.apprLineView.isNothingCheckedApprType()) {
                $.goMessage(lang['is_nothing_checked_approval_type']);
                return false;
            }

            if (this.apprLineView.isAppointmentOfNotSelectedType()) {
                $.goMessage(lang['is_appointmentof_notselectedtype']);
                return false;
            }

            if (!this.model.isValid()) {
                if (this.model.validationError == 'name_invalid_length' || this.model.validationError == 'name_required') {
                    $.goMessage(lang[this.model.validationError]);
                    this.$el.find(':input[name=name]').select();
                } else if (this.model.validationError == 'alias_invalid_length' || this.model.validationError == 'alias_required') {
                    $.goMessage(lang[this.model.validationError]);
                    this.$el.find(':input[name=alias]').select();
                } else {
                    $.goMessage(lang[this.model.validationError]);
                }
                return false;
            }

            // GO-20893 시스템 연동 시 코드 필수값 해제
            /*if ((this.$('#integrationActive').is(":checked")) && _.isEmpty(this.$('[name=code]').val())) {
                $.goMessage(lang['code_required']);
                this.$el.find(':input[name=code]').focus();
                return false;
            }*/

            if (this.model.get('useApprLineRule') && _.isEmpty(this.model.get('apprLineRuleModel'))) {
                $.goMessage(lang['apprlineruleid_required']);
                return false;
            }

            if (!this.templateEditorView.validateActivityGroups(this.model.get('activityGroups'))) {
                $.goMessage(lang['invalid_template_html_activity_groups']);
                return false;
            }

            if (!this.templateEditorView.validateApprLineRuleForm(this.model.get('apprLineRuleModel'))) {
                $.goMessage(lang['invalid_apprlinerule_form']);
                return false;
            }

            if (this.requestProcessing) return;
            this.requestProcessing = true;
            this.model.save({}, {
                success: $.proxy(function(model) {
                    GO.util.store.set("appr_form_index:folderId", model.get("folderId"));
                    $.goAlert(lang['creation_success_msg'], "", $.proxy(this._goToFormListView, this));
                }, this),
                error: function(model, resp) {
                    if (_.contains(resp['responseJSON']['message'], 'duplication.name')) {
                    	$.goMessage(lang['duplicated_name']);
                    }else if (_.contains(resp['responseJSON']['message'], 'duplication.code')) {
                    	$.goMessage(lang['duplicated_code']);
                    }else if(_.contains(resp['responseJSON']['message'], 'form.changed')) {
                    	 GO.util.store.set("appr_form_index:folderId", model.get("folderId"));
                         $.goConfirm(lang['form_changed'], "", function(){
                        	 GO.router.navigate('approval', {trigger: true});
                         }, commonLang['이동'], function(){});
                    }else if(_.contains(resp['responseJSON']['name'], 'DuplicateRequestException')) {
                    	$.goMessage(resp['responseJSON']['message'].split("[")[0]);
                    }else{
                    	$.goMessage(lang['결재선을 추가한 후 저장해 주세요']);
                    }

                },
                complete: $.proxy(function() {
                    this.requestProcessing = false;
                }, this)
            });
        },

        _onCancelClicked: function() {
            $.goAlert(adminLang['취소하셨습니다. 이전 화면으로 이동합니다.'], "", $.proxy(this._goToFormListView, this));
            return false;
        },

        _goToFormListView: function() {
            GO.router.navigate('approval', {trigger: true});
            return false;
        },

        _onSyncModel: function() {
            this.activityGroups.set(this.model.get('activityGroups'));
            if (!this.templateEditorView) {
                this._initTemplateEditor();
            }
            this.render();
        },

        _onChangeActivityGroups: function(model) {
            this.templateEditorView.syncApprLineToHtmlContent(model);
        },

        _onRemoveActivityGroups: function(model) {
            this.templateEditorView.syncApprLineToHtmlContent(model, true); // isRemove: true
        },

        _initTemplateEditor: function() {
            this.templateEditorView = new TemplateEditorView({
                title: this.model.get('name'),
                model: this.model,
                config: this.apprConfigModel,
                approvalInfo: this.activityGroups,
                companyIds: this.companyIds
            });
        },

        _onChangeName: function(e) {
            this.model.set('name', $(e.currentTarget).val());
        }
    });
});
