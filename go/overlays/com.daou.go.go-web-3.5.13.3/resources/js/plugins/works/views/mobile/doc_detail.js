define('works/views/mobile/doc_detail', function (require) {
    var GO = require('app');
    var Backbone = require('backbone');
    var when = require('when');
    // models
    var AppletDocModel = require('works/models/applet_doc');
    var AppletFormModel = require('works/models/applet_form');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var Masking = require('works/components/masking_manager/models/masking');
    var Fields = require('works/collections/fields');
    var Integration = require('works/models/integration');
    var ActionModel = require('works/models/action');
    var DocActivityCountModel = require('works/models/doc_activity_count');


    // collection
    var ActionCollection = Backbone.Collection.extend({ // 액션 collection
        model: ActionModel,
        initialize: function (options) {
            this.options = options || {};
            this.appletId = options.appletId;
            this.docId = options.docId;
        },
        url: function () {
            return GO.config('contextRoot') + 'api/works/applets/' + this.appletId + '/docs/' + this.docId + '/actions';
        }
    });

    // views
    var HeaderToolbarView = require("views/mobile/header_toolbar");

    var DocActionView = require('works/views/mobile/doc_detail/doc_action');
    var ConsumerView = require('works/views/mobile/doc_detail/consumer');

    // etc
    var FormBuilder = require('works/components/formbuilder/formbuilder');

    // templates
    var renderTemplate = require('hgn!works/templates/mobile/doc_detail');

    // languages
    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var lang = {
        "loading": commonLang['잠시만 기다려주세요'],
        "noSubject": commonLang['제목없음'],
        "statusText": worksLang['{{arg1}} 상태입니다.'],
        "needToSetProcess": worksLang["모바일 프로세스 사용하기 선택 문구"]
    };

    return Backbone.View.extend({
        appletId: null,
        baseConfigModel: null,
        canvasView: null,
        el: '#content',

        initialize: function (options) {
            options = options || {};
            this.useNavigate = options.useNavigate;
            if (options.hasOwnProperty('appletId')) {
                this.appletId = options.appletId;
                this.baseConfigModel = new AppletBaseConfigModel({"id": options.appletId});
            }

            this.fieldsOfIntegrationApplet = {};
            this.subFormId = options.subFormId;

            this.fields = new Fields([], {
                appletId: options.appletId,
                subFormId: options.subFormId,
                includeProperty: true
            });

            this.appletFormModel = new AppletFormModel({
                "appletId": options.appletId,
                "subFormId": options.subFormId ? options.subFormId : 0
            });
            this.masking = new Masking({appletId: this.appletId});
            this.masking.fetch();

            var appletDocOptions = {appletId: this.appletId, subFormId: this.subFormId};
            if (options.hasOwnProperty('docId')) {
                this.docId = options.docId;
                appletDocOptions.id = this.docId;
            }
            this.model = new AppletDocModel(appletDocOptions);
            this.activityCountModel = new DocActivityCountModel(this.appletId, this.docId);

            this.$el.off('navigate:integrationDoc');
            this.$el.on('navigate:integrationDoc', $.proxy(function (e, data) {
                var auth = _.findWhere(this.model.get('integratedAppsAccessable'), {appletId: data.integrationAppletId});
                if (auth.accessable) {
                    GO.router.navigate("works/applet/" + data.integrationAppletId + '/doc/' + data.integrationDocId, true);
                } else {
                    GO.router.navigate("works/applet/" + data.appletId + '/refer/' + data.integrationAppletId + '/doc/' + data.integrationDocId, true);
                }
            }, this));

            this.Template = renderTemplate;
        },

        render: function () {
            var self = this;
            $.when(
                this.baseConfigModel.fetch(),
                this.appletFormModel.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.linkToCustomError({
                                code: 403,
                                message: worksLang['폼 접근권한이 없습니다.'] + ' ' + worksLang['폼 접근권한 없음 설명']
                            });
                        }
                    }
                }),
                this.model.fetch(),
                this.masking.deferred,
                this.fields.fetch(),
                this.activityCountModel.fetch({
                    success: function (model, resp) {
                        self.activityCount = resp.data;
                    }
                })
            ).then($.proxy(function () {
                    this._initRender();
                    var deferred = $.Deferred();
                    this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                        this.fieldsOfIntegrationApplet = fields;
                        deferred.resolve();
                    }, this));
                    return deferred;
                }, this)
            ).then($.proxy(function () {
                    var deferred = $.Deferred();
                    this.actions = new ActionCollection({appletId: this.model.get('appletId'), docId: this.model.id});
                    this.actions.fetch({
                        success: function () {
                            deferred.resolve();
                        }
                    });
                    return deferred;
                }, this)
            ).then(function () {
                if (!self.model.isCreator(GO.session('id'))) {
                    self.appletFormModel.mergeMaskingValue(self.masking.get('fieldCids'));
                }

                HeaderToolbarView.render({
                    isPrev: true,
                    actionMenu: self._renderAction(),
                    isWriteBtn: false
                });

                self._renderContent();

                if (_.contains(self.masking.get('fieldCids'), self.model.get('titleCid')) && !self.model.isCreator(GO.session('id'))) {
                    self._renderMaskedTitle();
                }
                self._renderConsumer();
            });

            return this;
        },

        _renderMaskedTitle: function () {
            this.$('#subject').parent().html(
                '<div class="hidden_data">' +
                '<span class="help" title="' + worksLang['관리자에 의해 마스킹 처리 된 항목입니다'] + '"></span>' +
                '</div>'
            );
        },

        _initRender: function () {
            this.$el.html(this.Template({
                lang: lang,
                formName: this.appletFormModel.get('name'),
                mainForm: this.appletFormModel.get('mainForm')
            }));
        },

        _printSubjectAndWorkflowText: function () {
            this._printSubject();
            this._printWorkflowText();
            this._printDocNoText();
        },

        _printSubject: function () {
            var subject = FormBuilder.getDocumentTitle(this.model);
            this.$('#subject').text(subject || lang.noSubject);
        },

        _printWorkflowText: function () {
            var text = '';
            var useProcess = this.baseConfigModel.get('useProcess');
            var docStatus = this.model.get('status');
            var docStatusColor = docStatus || 0;

            if (useProcess && docStatus) {
                text = docStatus.name;
                docStatusColor = docStatus.color;
            } else if (useProcess && !docStatus) {
                text = '-';
                this.$("#needToSetProcess").show();
            } else {
                this.$('#stateArea').closest('span').hide();
            }

            this.$('#stateArea').removeClass(function (index, className) {
                return (className.match(/bgcolor\S+/g) || []).join(' ');
            });
            this.$('#stateArea').addClass("bgcolor" + docStatusColor);
            this.$('#stateArea').text(GO.util.unescapeHtml(text));
        },

        _printDocNoText: function () {
            var useDocNo = this.baseConfigModel.get('useDocNo');
            var docNo = this.model.get('docNo');

            if (useDocNo && docNo) {
                this.$('#docNo').text(worksLang['문서번호'] + ': ' + GO.util.unescapeHtml(docNo));
            } else {
                this.$('#docNo').hide();
            }
        },

        _renderContent: function () {
            var component = FormBuilder.createUserComponent(
                this.appletFormModel.toJSON(),
                this.model,
                {type: 'detail'},
                (new Integration(_.extend(this.fieldsOfIntegrationApplet, {fields: this.fields.toJSON()})))
            );
            this.canvasView = component.getDetailView();
            this.canvasView.setElement(this.$('#fb-canvas').empty());
            this.canvasView.renderNode();
            component.trigger();

            this._printSubjectAndWorkflowText();

            this.listenTo(this.model, 'sync', this._onSyncAppletDoc); // listen 하는 시점 중요함.
        },

        _renderAction: function () {
            this.actionView = new DocActionView({
                actions: this.actions,
                activityCount: this.activityCount,
                model: this.model,
                isAdmin: this.baseConfigModel.isAdmin(GO.session('id')),
                useNavigate: this.useNavigate,
                subFormId: this.subFormId
            });
            return this.actionView.render();
        },

        _renderConsumer: function () {
            var view = new ConsumerView({
                appletId: this.appletId,
                docId: this.docId
            });
            this.$('#consumerArea').html(view.render().el);
        },

        _onSyncAppletDoc: function () {
            this.canvasView.renderNode();
            this._printSubjectAndWorkflowText();
        }
    });
});
