define('works/views/mobile/user_form', function (require) {
    // dependency
    var BaseAppletView = require('works/views/app/base_applet');
    var when = require('when');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var AppletFormModel = require('works/models/applet_form');
    var AppletDocModel = require('works/models/applet_doc');
    var Masking = require('works/components/masking_manager/models/masking');
    var Fields = require('works/collections/fields');
    var Integration = require('works/models/integration');

    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var FormBuilder = require('works/components/formbuilder/formbuilder');
    var renderUserForm = require('hgn!works/templates/mobile/user_form');
    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var VALUE_TYPE = require('works/constants/value_type');
    var CONSTANTS = require('works/constants/works');

    require('jquery.go-preloader');

    var lang = {
        confirm: commonLang['확인'],
        cancel: commonLang['취소'],
        waitingMsg: worksLang['저장중 메세지'],
        privateOptionTitle: worksLang['비공개로 등록합니다.']
    };

    var _savingFlag = false;
    /**
     * 사용자 입력 폼 메인뷰
     *
     * TODO: 우선 Backbone.View 상속받아서 하고, 나중에 BaseAppletView를 개선하여 상속받도록 한다.
     */
    return BaseAppletView.extend({
        el: '#content',
        appletFormModel: null,
        appletDocModel: null,
        canvasView: null,

        appletId: null,
        docId: null,
        subFormId: null,

        /**
         * @Override
         */
        initialize: function (options) {
            options = options || {};
            this.appletId = null;
            this.baseConfigModel = null;
            this.pageName = null;
            this.appletFormModel = null;
            this.appletDocModel = null;
            this.canvasView = null;
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
                this.baseConfigModel = new AppletBaseConfigModel({"id": options.appletId});
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
            this.appletDocModel = new AppletDocModel(appletDocOptions);

            GO.EventEmitter.off("trigger-action");
            GO.EventEmitter.on('trigger-action', 'works-save', this._worksSave, this);
        },


        /**
         * @Override
         */
        render: function () {
            var self = this;
            var appletFormModel = this.appletFormModel;
            var preloader = null;
            if (_savingFlag) {
                alert(lang['waitingMsg']);
                return;
            }
            preloader = $.goPreloader();
            _savingFlag = true;

            HeaderToolbarView.render({
                title: !this.docId ? commonLang['등록'] : commonLang['수정'],
                isClose: true,
                actionMenu: [{
                    id: "works-save",
                    text: commonLang["저장"],
                    triggerFunc: "works-save"
                }]
            });
            $.when(
                self.baseConfigModel.fetch(),
                self.masking.deferred,
                self.docId ? self.appletDocModel.fetch() : ($.Deferred()).resolve(),
                self.fields.fetch()
            ).then($.proxy(function () {
                var deferred = $.Deferred();
                this.fields.getFieldsOfIntegrationApplet().done(_.bind(function (fields) {
                    this.fieldsOfIntegrationApplet = fields;
                    deferred.resolve();
                }, this));
                return deferred;
            }, this)).then(function () {
                return self.appletFormModel.fetch({
                    statusCode: {
                        403: function () {
                            GO.util.linkToCustomError({
                                code: 403,
                                message: worksLang['폼 접근권한이 없습니다.'] + ' ' + worksLang['폼 접근권한 없음 설명']
                            });
                        }
                    }
                });
            }).then(function () {
                self._initRender();
                var deferred = $.Deferred();
                if (!self.appletDocModel.isCreator(GO.session('id')) && self.docId) {
                    self.appletFormModel.mergeMaskingValue(self.masking.get('fieldCids'));
                }
                deferred.resolve();
                return deferred;
            }).then(function () {
                if (!self.appletDocModel.isNew()) {
                    if (self.appletDocModel.isPrivate()) {
                        self.$("#privateFlag").prop("checked", true);
                    } else {
                        self.$("#privateFlag").prop("checked", false);
                    }
                }

                var component = FormBuilder.createUserComponent(
                    appletFormModel.toJSON(),
                    self.appletDocModel,
                    {type: 'form'},
                    (new Integration(_.extend(self.fieldsOfIntegrationApplet, {fields: self.fields.toJSON()})))
                );
                self.canvasView = component.getFormView();
                self.canvasView.setElement(self.$('#fb-canvas'));
                self.canvasView.renderNode();
                component.trigger();
                //self._onSyncAppletDoc();
                preloader.release();
                _savingFlag = false;
            });
        },

        remove: function () {
            if (this.canvasView) {
                this.canvasView.remove();
            }
        },

        _initRender: function () {
            this.$el.html(renderUserForm({
                lang: lang,
                canUsePrivateOption: this.baseConfigModel.canUsePrivateOption(),
                isPrivateOptionClosed: this.baseConfigModel.isPrivateOptionClosed(),
                formName: this.appletFormModel.get('name'),
                mainForm: this.appletFormModel.get('mainForm')
            }));
        },
        _worksSave: function () {
            var self = this;
            $(document.activeElement).blur(); // 모바일 브라우저는 포커스 해제가 PC 웹 브라우저와 상이하므로 직접 해주자. 포커스 해제가 되야 모델에 반영됨.
            setTimeout(function () {
                self._saveAndMove();
            }, 100);
        },
        _saveAndMove: function () {
            var self = this;
            var preloader = null;

            if (_savingFlag) {
                alert(lang['waitingMsg']);
                return;
            }

            var inputData = FormBuilder.getFormData();
            var privateFlag = getPrivateFlag.call(this);

            if (typeof inputData == 'object' && _.isEmpty(inputData)) {
                alert(worksLang["등록할 내용이 없습니다. 목록으로 이동합니다."]);
                GO.router.navigate('works/applet/' + this.appletDocModel.get('appletId') + '/home', {
                    trigger: true,
                    replace: true
                });
            }

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
            this._goToDetailPage();
        },

        _goToDetailPage: function () {
            if (!_.isNull(this.subFormId)) {
                GO.router.navigate('works/applet/' + this.appletDocModel.get('appletId') + '/doc/'
                    + this.appletDocModel.get('id') + '/' + this.subFormId, {
                    trigger: true,
                    replace: true
                });
            } else {
                GO.router.navigate('works/applet/' + this.appletDocModel.get('appletId') + '/doc/'
                    + this.appletDocModel.get('id'), {
                    trigger: true,
                    replace: true
                });
            }
        },

        _onSyncAppletDoc: function () {
            this.canvasView.renderNode();
        }
    });
});
