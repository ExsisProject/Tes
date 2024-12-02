define('works/views/app/user_form', function (require) {
    // dependency
    var when = require('when');

    var AppletFormModel = require('works/models/applet_form');
    var AppletDocModel = require('works/models/applet_doc');
    var Masking = require('works/components/masking_manager/models/masking');
    var Fields = require('works/collections/fields');
    var Integration = require('works/models/integration');

    var BaseAppletView = require('works/views/app/base_applet');
    var FormBuilder = require('works/components/formbuilder/formbuilder');
    var FormView = require('works/views/app/doc_content_edit');

    var renderUserForm = require('hgn!works/templates/app/user_form');

    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var VALUE_TYPE = require('works/constants/value_type');
    var CONSTANTS = require('works/constants/works');
    require('jquery.go-popup');
    require('jquery.go-preloader');

    var lang = {
        confirm: commonLang['확인'],
        cancel: commonLang['취소'],
        waitingMsg: worksLang['저장중 메세지'],
        privateOptionTitle: worksLang['비공개로 등록합니다.'],
        privateOptionDesc: worksLang['비공개 옵션 설명']
    };

    var _savingFlag = false;
    /**
     * 사용자 입력 폼 메인뷰
     *
     * TODO: 우선 Backbone.View 상속받아서 하고, 나중에 BaseAppletView를 개선하여 상속받도록 한다.
     */
    return BaseAppletView.extend({
        appletFormModel: null,
        appletDocModel: null,
        canvasView: null,

        appletId: null,
        docId: null,

        events: {
            "click .btn-confirm": "_saveAndMove",
            "click .btn-cancel": "_cancel",
            "click .btn-golist": "_goToList"
        },

        /**
         * @Override
         */
        initialize: function (options) {
            options = options || {};
            BaseAppletView.prototype.initialize.apply(this, arguments);

            this.appletFormModel = null;
            this.appletDocModel = null;
            this.canvasView = null;
            this.appletId = null;
            this.docId = null;
            this.subFormId = null;

            this.fieldsOfIntegrationApplet = {};
            this.fields = new Fields([], {
                appletId: options.appletId,
                subFormId: options.subFormId,
                includeProperty: true
            });
            if (options.hasOwnProperty('appletId')) {
                this.appletId = options.appletId;
                this.subFormId = options.subFormId;
                this.appletFormModel = new AppletFormModel({
                    "appletId": options.appletId,
                    "subFormId": options.subFormId ? options.subFormId : 0
                });
                this.masking = new Masking({appletId: this.appletId});
                this.masking.fetch();

            }
            // 수정 모드일 경우...
            var appletDocOptions = {appletId: this.appletId};
            if (options.hasOwnProperty('docId')) {
                this.docId = options.docId;
                appletDocOptions.id = this.docId;
                appletDocOptions.subFormId = this.subFormId;
            }
            this.appletDocModel = new AppletDocModel(appletDocOptions, {reset: true});
            this.filters.on("changeFilter.filters", this._onChangeFilter, this);
        },

        render: function () {
            return $.when(
                BaseAppletView.prototype.render.apply(this, arguments),
                this.appletFormModel.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.error("403", {"msgCode": "403-works-accessibleform"});
                        }
                    }
                }),
                this.masking.deferred,
                this.docId ? this.appletDocModel.fetch() : ($.Deferred()).resolve(),
                this.fields.fetch()
            ).then($.proxy(function () {
                var deferred = $.Deferred();
                this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                    this.fieldsOfIntegrationApplet = fields;
                    deferred.resolve();
                }, this));
                return deferred;
            }, this)).then($.proxy(function () {
                if (!this.appletDocModel.isCreator(GO.session('id')) && this.docId) {
                    this.appletFormModel.mergeMaskingValue(this.masking.get('fieldCids'));
                }
                var formView = new FormView({
                    baseConfigModel: this.baseConfigModel,
                    appletFormModel: this.appletFormModel,
                    appletDocModel: this.appletDocModel,
                    integrationModel: new Integration(_.extend(this.fieldsOfIntegrationApplet, {fields: this.fields.toJSON()}))
                });
                this.$el.html(formView.render().el);

                if (this.docId) {
                    if (!this.appletDocModel.isNew()) {
                        var isPrivate = this.baseConfigModel.isPrivateOptionClosed() || !!this.appletDocModel.isPrivate();
                        this.$("#cbx-privateflag").prop("checked", isPrivate);
                    }
                }

                this.canvasView = formView;
            }, this));
        },

        remove: function () {
            BaseAppletView.prototype.remove.apply(this, arguments);

            if (this.canvasView) {
                this.canvasView.remove();
            }
        },

        _initRender: function () {
            this.$el.html(renderUserForm({
                canUsePrivateOption: this.baseConfigModel.canUsePrivateOption(),
                isPrivateOptionClosed: this.baseConfigModel.isPrivateOptionClosed(),
                lang: lang
            }));
        },

        _saveAndMove: function (e) {
            var self = this;
            var preloader = null;

            if (_savingFlag) {
                $.goSlideMessage(lang['waitingMsg']);
                return;
            }
            e.preventDefault();

            var inputData = FormBuilder.getFormData();
            var privateFlag = getPrivateFlag.call(this);

            if (inputData && !_.isEmpty(inputData)) {
                this.appletDocModel.setValue(inputData);

                if (!_.isNull(this.subFormId)) {
                    this.appletDocModel.setSubFormId(this.subFormId);
                }

                this.appletDocModel.save({'privateFlag': privateFlag}, {
                    beforeSend: function () {
                        preloader = $.goPreloader();
                        _savingFlag = true;
                    },
                    success: function () {
                        self._goToDetailPage();
                    },
                    error: function (e, resp) {
                        if (resp.responseJSON && resp.responseJSON.code === '403') {
                            $.goError(resp.responseJSON.message);
                        } else {
                            $.goSlideMessage(commonLang['저장에 실패 하였습니다.']);
                        }
                    },
                    complete: function () {
                        preloader.release();
                        _savingFlag = false;
                    }
                });
            }

            function getPrivateFlag() {
                var flag;
                var $privateFlag = this.$('input[name=privateFlag]');

                if ($privateFlag.length > 0) {
                    flag = $privateFlag.is(':checked');
                } else {
                    flag = false;
                }

                return flag;
            }
        },

        _cancel: function (e) {
            e.preventDefault();

            $.goConfirm(
                commonLang['취소하시겠습니까?'],
                worksLang['편집 취소'],
                _.bind(function () {
                    GO.router.navigate('works/applet/' + this.appletId + '/home/search', {
                        trigger: true,
                        pushState: true
                    });
                }, this)
            );
        },

        _goToList: function (e) {
            GO.router.navigate('works/applet/' + this.appletId + '/home/search', {
                trigger: true,
                pushState: true
            });
        },

        _goToDetailPage: function () {
            if (!_.isNull(this.subFormId)) {
                GO.router.navigate('works/applet/' + this.appletDocModel.get('appletId') + '/doc/'
                    + this.appletDocModel.get('id') + '/navigate/' + this.subFormId, {trigger: true});
            } else {
                GO.router.navigate('works/applet/' + this.appletDocModel.get('appletId') + '/doc/'
                    + this.appletDocModel.get('id') + '/navigate', {trigger: true});
            }
        },

        _onChangeFilter: function () {
            GO.router.navigate("works/applet/" + this.appletId + "/home", true);
        }
    });
});
