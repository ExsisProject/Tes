define('works/views/app/doc_detail', function (require) {
    // models
    var AppletDocModel = require('works/models/applet_doc');
    var AppletFormModel = require('works/models/applet_form');
    var Masking = require('works/components/masking_manager/models/masking');
    var Fields = require('works/collections/fields');
    var Integration = require('works/models/integration');

    // views
    var BaseAppletView = require('works/views/app/base_applet');
    var DocActivityView = require('works/views/app/doc_detail/doc_activity');
    var DocActionView = require('works/views/app/doc_detail/doc_action');
    var DocLogView = require('works/views/app/doc_detail/doc_log');
    var ConsumerView = require('works/components/consumer/views/consumer');
    var DocContentView = require('works/views/app/doc_content');

    // templates
    var Template = require('hgn!works/templates/app/doc_detail');

    // languages
    var worksLang = require("i18n!works/nls/works");
    var taskLang = require("i18n!task/nls/task");
    var commonLang = require('i18n!nls/commons');

    // etc
    var when = require('when');
    var VALUE_TYPE = require('works/constants/value_type');

    var lang = {
        "activity": taskLang["활동기록"],
        "attach": commonLang["첨부파일"],
        "writeActivity": taskLang['활동기록 쓰기'],
        "fold": worksLang['접기'],
        "loading": commonLang['잠시만 기다려주세요'],
        "history": taskLang["변경이력"]
    };

    var Actions = Backbone.Collection.extend({
        model: Backbone.Model,
        initialize: function (options) {
            this.options = options || {};
            this.appletId = options.appletId;
            this.docId = options.docId;
        },
        url: function () {
            return GO.config('contextRoot') + 'api/works/applets/' + this.appletId + '/docs/' + this.docId + '/actions';
        }
    });

    return BaseAppletView.extend({
        appletFormModel: null,
        canvasView: null,

        initialize: function (options) {
            options = options || {};
            this.useSearch = true;
            this.useNavigate = options.useNavigate;
            BaseAppletView.prototype.initialize.apply(this, arguments);

            if (options.hasOwnProperty('isPrint')) {
                this.isPrint = options.isPrint;
            }

            this.fieldsOfIntegrationApplet = {};
            this.subFormId = options.subFormId ? options.subFormId : 0;
            this.fields = new Fields([], {
                appletId: options.appletId,
                subFormId: options.subFormId,
                includeProperty: true
            });
            this.appletFormModel = new AppletFormModel({
                "appletId": options.appletId,
                "subFormId": this.subFormId
            });
            this.masking = new Masking({appletId: this.appletId});
            this.masking.fetch();
            this.docId = options.docId;
            this.model = new AppletDocModel({
                id: this.docId,
                appletId: this.appletId,
                subFormId: this.subFormId
            });
            this.actions = new Actions({appletId: this.appletId, docId: this.docId});
            this.filters.on("changeFilter.filters", this._onChangeFilter, this);

            this._initRender();

            this.$el.on('navigate:integrationDoc', $.proxy(function (e, data) {
                var auth = _.findWhere(this.model.get('integratedAppsAccessable'), {appletId: data.integrationAppletId});
                var commonURL = GO.contextRoot + 'app/works/applet/';
                var popupOption = 'width=1280,height=600,status=yes,scrollbars=no,resizable=no';
                if (auth.accessable) {
                    window.open(commonURL + data.integrationAppletId + '/doc/' + data.integrationDocId, "_blank");
                } else {
                    window.open(commonURL + data.appletId + '/refer/' + data.integrationAppletId + '/doc/' + data.integrationDocId, "help", popupOption);
                }
            }, this));
            this.$el.on('doAction', $.proxy(function () {
                $.when(this.model.fetch(), this.actions.fetch()).done($.proxy(function () {
                    this._removeNeedToSetProcess();
                    this._renderAction();
                    this._renderDocLog();
                    $.goMessage(commonLang['변경되었습니다.']);
                }, this));
            }, this));
        },

        render: function () {
            $.when(
                BaseAppletView.prototype.render.apply(this, arguments),
                this.appletFormModel.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.error("403", {"msgCode": "403-works-accessibleform"});
                        }
                    }
                }),
                this.masking.deferred,
                this.actions.fetch(),
                this.model.fetch(),
                this.fields.fetch()
            ).then($.proxy(function () {
                var deferred = $.Deferred();
                this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                    this.fieldsOfIntegrationApplet = fields;
                    deferred.resolve();
                }, this));
                return deferred;
            }, this)).then($.proxy(function () {
                if (!this.model.isCreator(GO.session('id'))) {
                    this.appletFormModel.mergeMaskingValue(this.masking.get('fieldCids'));
                }
                this._renderContent();
                this._renderActivity(); // 파일첨부 컴포넌트가 ghost init 을 지원하지 않으므로 나중에 그려주자.
                this._renderAction(); // dependency on model.actions
                this._renderDocLog();
            }, this)).then($.proxy(function () {
                this._renderConsumer();
            }, this));
            this.model.deferred.done($.proxy(function () {
                if (_.contains(this.masking.get('fieldCids'), this.model.get('titleCid')) && !this.model.isCreator(GO.session('id'))) {
                    this._renderMaskedTitle();
                }
            }, this));
            //this._renderDocLog();
        },

        renderForPrint: function () {
            return $.when(
                this.baseConfigModel.fetch(),
                this.appletFormModel.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.error("403", {"msgCode": "403-works-accessibleform"});
                        }
                    }
                }),
                this.model.fetch(),
                this.fields.fetch(),
                this.masking.deferred
            ).then($.proxy(function () {
                var deferred = $.Deferred();
                this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                    this.fieldsOfIntegrationApplet = fields;
                    deferred.resolve();
                }, this));
                return deferred;
            }, this)).done($.proxy(function () {
                if (!this.model.isCreator(GO.session('id'))) {
                    this.appletFormModel.mergeMaskingValue(this.masking.get('fieldCids'));
                }
                this._renderContent();
            }, this));
        },

        _renderMaskedTitle: function () {
            this.$('#subject').parent().html(
                '<div class="hidden_data">' +
                '<span class="help" title="' + worksLang['관리자에 의해 마스킹 처리 된 항목입니다'] + '"></span>' +
                '</div>'
            );
        },

        _renderConsumer: function () {
            var view = new ConsumerView({
                appletId: this.appletId,
                docId: this.docId,
                docText: this.subject
            });
            this.$('#consumerArea').html(view.render().el);
        },

        _initRender: function () {
            this.$el.html(Template({
                lang: lang,
                isPrint: this.isPrint
            }));
        },

        _renderContent: function () {
            this.$('[el-doc-content]').remove();
            var docContentView = new DocContentView({
                isPrint: this.isPrint,
                docId: this.docId,
                model: this.model,
                baseConfigModel: this.baseConfigModel,
                appletFormModel: this.appletFormModel,
                integrationModel: new Integration(_.extend(this.fieldsOfIntegrationApplet, {fields: this.fields.toJSON()})),
                formName: this.appletFormModel.get('name'),
                mainForm: this.appletFormModel.get('mainForm')
            });
            this.$('.build_prev_wrap').prepend(docContentView.render().el);
            this.subject = docContentView._getSubject();
            docContentView.printSubjectAndWorkflowText();
        },

        _renderAction: function () {
            this.accessibleMainForm = false;
            var self = this;
            $.ajax({
                type: "GET",
                dataType: "json",
                url: GO.contextRoot + "api/works/applets/" + self.appletId + "/accessible/mainform",
                success: function (resp) {
                    self.accessibleMainForm = resp.data;
                    self.actionView = new DocActionView({
                        model: self.model,
                        isAdmin: self.baseConfigModel.isAdmin(GO.session('id')),
                        subFormId: self.subFormId,
                        actions: self.actions,
                        useNavigate: self.useNavigate,
                        isOrgDocPopup: self.isOrgDocPopup,
                        accessibleMainForm: self.accessibleMainForm
                    });
                    self.$('#actionArea').html(self.actionView.render().el);
                }
            });
        },

        _renderActivity: function () {
            var self = this;
            var activityView = new DocActivityView({
                appletId: this.appletId,
                docId: this.docId
            });
            activityView.dataFetch().done(function () {
                activityView.setElement(self.$("#activitySection"));
                activityView.render();
            });
            this.$el.on("change:log", function () {
                self.logView.logs.setPage(0);
                self.logView.render();
            });
        },

        _renderDocLog: function () {
            this.logView = new DocLogView({
                appletId: this.appletId,
                docId: this.docId,
                mainForm: this.appletFormModel.get('mainForm')
            });
            this.logView.setElement(this.$("#logSection"));
            this.logView.render();
        },

        _onChangeFilter: function () {
            GO.router.navigate("works/applet/" + this.appletId + "/home", true);
        },
        _removeNeedToSetProcess: function () {
            $("#stateArea").siblings(".build_box_data").remove();
        }
    });
});
