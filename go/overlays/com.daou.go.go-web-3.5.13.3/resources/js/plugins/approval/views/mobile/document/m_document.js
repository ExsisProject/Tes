define([
        "jquery",
        "backbone",
        "when",
        
        "hogan",
        "approval/models/ref_document",
        "approval/views/mobile/document/m_attach_file",
        "approval/views/mobile/document/m_appr_attach_file",
        "approval/views/mobile/document/m_preview",
        "content_viewer",
        "hgn!approval/templates/mobile/document/m_document",
        "hgn!approval/templates/mobile/document/m_reference_doc_view",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        'formutil',
        "jquery.go-popup",
        "jquery.ui",
        "iscroll"
    ],
    function ($,
              Backbone,
              when,
              
              Hogan,
              RefDocumentModel,
              AttachFileView,
              ApprAttachFileView,
              PreView,
              ContentViewer,
              DocumentTpl,
              ReferenceDocumentTpl,
              commonLang,
              approvalLang) {
        var lang = {
            'confirm': commonLang['확인'],
            'cancel': commonLang['취소'],
            'save': commonLang['저장'],
            'noti': commonLang['알림'],
            'ref_doc': approvalLang['관련문서'],
            'view': approvalLang['보기'],
            'preview': approvalLang['미리보기'],
            'amt': approvalLang['개'],
            '원본문서': approvalLang['원본문서']
        };

        var APPROVAL_EDITOR_CONTENT_MARGIN = "body {margin: 0px;}";

        var DocumentView = Backbone.View.extend({
            initialize: function (options) {
                this.options = options || {};
                _.bindAll(this, 'render');

                this.title = this.options.title;
                this.docType = this.options.type;
                this.docId = this.options.docId;
                this.docModel = this.options.model;
                this.actionModel = this.options.actionModel;
                this.infoModel = this.options.infoData;
                this.formIntegrator = this.options.formIntegrator || {};
            },
            events: {
                'vclick a#btnRefDocPreview': 'refDocPreview'
            },

            render: function () {
                var self = this;
                var defer = when.defer();
                var rendering = false;
                var formScriptType = this.infoModel['formScriptType'];
                var moduleName = this.infoModel['externalScript'];
                var scriptBody = this.infoModel['scriptBody'];

                this.setDocVariables();
                this.$el.html(DocumentTpl({
                    lang: lang
                }));

                this.docContents = $('#document_content');
                var totSize = 0;
                this.setAttachTemplate();

                this.formOpts = {
                    data : this.docModel.docBodyContent,
                    contextRoot : '/',
                    userId : this.docModel.drafterId,
                    userProfileApi : 'api/user/profile',
                    docType: this.docModel.docType,
                    draftDate:  this.docModel.draftedAt ? GO.util.formatDatetime(this.docModel.draftedAt,null,"YYYY-MM-DD(ddd)") : GO.util.formatDatetime(GO.util.toISO8601(new Date()), null, "YYYY-MM-DD(ddd)")
                };

                if (this.docModel.docStatus == "CREATE" || this.docModel.docStatus == "TEMPSAVE") {
                    this.setDocumentTemplate(_.clone(this.formOpts));
                    if(formScriptType == 'SRC' && !_.isEmpty(moduleName)){
                        this.renderIntegrationByExternalScript({mode : 'create', moduleName : moduleName})
                            .then(defer.resolve, defer.reject);
                        rendering = true;
                    }else if(formScriptType == 'EDIT' && !_.isEmpty(scriptBody)){
                        this.renderIntegrationByScriptText({mode : 'create', scriptBody : scriptBody});
                    }else{
                        this.onNewFormMode();
                    }
                } else {
                    if (formScriptType == 'SRC' && !_.isEmpty(moduleName)) {
                        this.renderIntegrationByExternalScript({mode: 'view', moduleName: moduleName})
                            .then(defer.resolve, defer.reject);
                        rendering = true;
                    } else if (formScriptType == 'EDIT' && !_.isEmpty(scriptBody)) {
                        this.renderIntegrationByScriptText({mode: 'view', scriptBody: scriptBody});
                    } else {
                        this.setViewMode();
                    }
                }
                this.hideApprovalLineWrap();
                
                if (rendering) {
                    return defer.promise;
                }
                
                return defer.resolve();
            },
            hideApprovalLineWrap : function(){
                this.docContents.find(".approval_header").hide();
            },
            setAttachTemplate : function() {
                var self = this;
                if(this.docModel.docStatus == "TEMPSAVE"){
                    return;
                } else {
                    if (this.docModel.attachCount > 0) {
                        AttachFileView.render({
                            el: '#attachView',
                            docId: this.docId,
                            attaches: this.docModel.attaches
                        });
                        AttachFileView.resize(this.$el);
                    }
                    this.$el.find('div#refDocPart').append(ReferenceDocumentTpl({
                        lang: lang,
                        data: function () {
                            var receptionOrigin = self.docModel.receptionOrigin;
                            if (!receptionOrigin || 0) { // 원본문서가 존재하지 않을 경우(기안문서)
                                return {references: self.docModel.references};
                            }
                            //관련문서는 원본문서도 포함할수 있다.
                            //실제 수신문서의 entity에는 원본문서(receptionOrigin)가 존재하지만 관련문서(references)에 추가하여 보여주고 있음
                            return {
                                references: _.filter(self.docModel.references, function (referenceDocument) {
                                    return referenceDocument.id != receptionOrigin.id;
                                }),
                                receptionOriginInReferences: _.find(self.docModel.references, function (referenceDocument) {
                                    return referenceDocument.id == receptionOrigin.id;
                                })
                            };
                        }
                    }));
                }
            },
            setDocumentTemplate : function(formOpts){
                GO.util.store.set('document.docMode',"EDIT",{type : 'session'});
                var editModeTemplateOpt = formOpts;
                editModeTemplateOpt['angleBracketReplace'] = false;
                this.docContents.setTemplate(editModeTemplateOpt);
            },

            setViewMode: function () {
                GO.util.store.set('document.docMode', "VIEW", {type: 'session'});
                var content = $.goFormUtil.convertViewMode(this.docModel.docBodyContent);
                this.docContents.html(content);
            },

            renderIntegrationByExternalScript: function (option) {
                var self = this;
                var defer = when.defer();
                var moduleName = option.moduleName;
                var mode = option.mode;
                var integrationView = null;

                if (!_.isEmpty(moduleName)) {
                    require([moduleName], function (Integration) {
                        if (!_.isUndefined(Integration)) {
                            integrationView = new Integration({
                                variables: _.clone(self.docModel.variables),
                                docModel: self.docModel,
                                infoData: self.infoModel
                            });
                            if(mode == 'create'){
                                if(_.isFunction(integrationView.render)){
                                    integrationView.render();
                                }
                                self.formIntegrator.setIntegrationView(integrationView);
                                self.onNewFormMode();
                            }else{
                                self.setViewMode();
                                if (_.isFunction(integrationView.renderViewMode)) {
                                    integrationView.renderViewMode();
                                }
                                self.formIntegrator.setIntegrationView(integrationView);
                                self.hideApprovalLineWrap();
                            }
                            self.decideIscrollInit();
                        }
                        defer.resolve();
                    }, defer.reject);
                } else {
                    defer.reject()
                    console.log('module name Empty!!');
                }
                
                return defer.promise;
            },

            renderIntegrationByScriptText: function (option) {
                var self = this;
                var mode = option.mode;
                var scriptBody = option.scriptBody;
                var integrationView;
                var integrationFn = new Function(scriptBody);
                if (integrationFn) {
                    var returnView = new integrationFn();
                    integrationView = new returnView({
                        variables: _.clone(self.docModel.variables),
                        docModel: self.docModel,
                        infoData: self.infoModel
                    });
                    this.formIntegrator.setIntegrationView(integrationView);
                    if (mode == 'create') {
                        if (_.isFunction(integrationView.render)) {
                            integrationView.render();
                        }
                        this.onNewFormMode();
                    } else if (mode == 'view') {
                        this.setViewMode();
                        if (_.isFunction(integrationView.renderViewMode)) {
                            integrationView.renderViewMode();
                        }
                    }
                } else {
                    console.log('scriptBody is Empty');
                }
                this.decideIscrollInit();
            },

            decideIscrollInit : function () {
                if($(document).width() < this.$el.width()) {
                    GO.util.initDetailiScroll('document_iscroll', 'document_hscroll', 'document_view');
                }
            },

            onNewFormMode : function(){
                if (this.docModel.docStatus == "CREATE") {
                    this.docContents.setDocVariables(this.docModel.variables); //임시 저장문서에서는 다시 docVariable를 셋팅하지 않음
                }
                this.setNewFormMode();
                //this.setAttaches();
                //$('.fancybox-thumbs').goFancybox();
            },

            setNewFormMode: function() {
                this.mode = 'NEW';

                $(this.el).find('div#editView').show();
                $(this.el).find('div#attachView').hide();
            },

            refDocPreview: function (e) {
                var refDocId = $(e.currentTarget).attr('data-id');
                var refDocModel = RefDocumentModel.create(this.docId, refDocId);
                refDocModel.fetch({async: false});

                var docBody = refDocModel.get('document').docBodyContent;
                var docAttaches = refDocModel.get('document').attaches;
                var docReferences = refDocModel.get('document').references;
                var isDocReadAuthority = refDocModel.actionCheckModel.attributes.isDocReadAuthority;

                GO.router.navigate(GO.router.getUrl() + '#preview');
                this.preView = new PreView({
                    title: lang['view'],
                    docId: refDocId,
                    docBody: docBody,
                    attaches: docAttaches,
                    references: docReferences,
                    isDocReadAuthority: isDocReadAuthority
                });
                this.preView.render();
                this.$el.hide();
            },

            getTitle: function () {
                return this.docContents.getApprovalSubject();
            },
            getDocBodyContents: function () {
                this.docContents.find(".approval_header").show();
                if (this.mode == 'NEW' || this.mode == 'EDIT') {
                    return this.docContents.getFormData();
                }
                return this.docContents.html();
            },
            getDocVariables: function () {
                if (this.actionModel.useIntegration && $.goIntegrationForm) {
                    return $.goIntegrationForm.getIntegrationData();
                } else {
                    return null;
                }
            },
            setDocVariables: function () {
                GO.util.store.set('document.variables', this.docModel.variables, {type: 'session'});
            },
            changeActivityGroups: function (activityGroups, isReception) {
                $.fn.changeActivityGroups({
                    groups: activityGroups,
                    config: {
                        activityBox: {
                            headerType: this.actionModel.activityBoxHeaderType,
                            bodyElement: {
                                sign: this.actionModel.activityBoxContentSign,
                                name: this.actionModel.activityBoxContentName,
                                position: this.actionModel.activityBoxContentPosition,
                                duty: this.actionModel.activityBoxContentDuty,
                                dept: this.actionModel.activityBoxContentDept
                            }
                        },
                        isReception: isReception,
                        displayDrafter: this.infoModel.displayDrafter,
                        includeAgreement: this.infoModel.includeAgreement
                    }
                });
            },
            changeActivity: function (activity) {
                $.fn.changeActivity(activity);
            },
            setDocNum: function (data) {
                return this.docContents.setDocNo(data);
            },
            setApprovalData: function (data) {
                return this.docContents.setApprovalData(data);
            },
            setRecipient: function (data) {
                return this.docContents.setRecipient(data);
            },
            setPreserveDuration: function (data) {
                return this.docContents.setPreserveDuration(data);
            },
            setSecurityLevel: function (data) {
                return this.docContents.setSecurityLevel(data);
            },
            setDocClassification: function (data) {
                return this.docContents.setDocClassification(data);
            },
            setDocReference: function (data) {
                return this.docContents.setDocReference(data);
            },
            isCompleteRequiredForm: function () {
                return this.docContents.isCompleteRequiredForm();
            },
            getMaxLengthCheck: function () {
                return this.docContents.getMaxLengthCheck();
            },
            setDocFocus: function (focusId) {
                $('#' + focusId).focus();
            }
        });

        return DocumentView;
    });
