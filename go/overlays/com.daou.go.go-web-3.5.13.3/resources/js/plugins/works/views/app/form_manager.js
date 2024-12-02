define('works/views/app/form_manager', function (require) {
    // dependency
    var Backbone = require('backbone');
    var when = require('when');
    var DefaultLayout = require('views/layouts/default');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var AppletFormModel = require('works/models/applet_form');
    var FormBuilder = require('works/components/formbuilder/formbuilder');
    var Resizer = require('go-ignoreduplicatemethod');
    var AppContentTopView = require('works/views/app/layout/app_content_top');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var WorksUtil = require('works/libs/util');
    var constants = require('works/components/formbuilder/constants');

    var FormTabTemplate = require("hgn!works/templates/app/app_home_form_tab");

    var worksLang = require('i18n!works/nls/works');
    var commonLang = require("i18n!nls/commons");

    require('jquery.go-popup');
    require('jquery.go-preloader');

    /**
     * 레이아웃
     * 간단한 레이아웃이고 다른 곳에서 재사용되지 않으므로 여기에 위치시킨다.
     */
    var FMLayout = DefaultLayout.extend({
        name: 'form_manager',
        className: 'go_skin_default go_skin_edit go_skin_works go_renew',
        _init: function () {
            this.setUseSide(false);
            this.setUseContentWrapper(false);
        }
    }, {
        __instance__: null
    });

    /**
     * Promise 객체 Wrapper
     */
    var Promise = function () {
        return when.promise.apply(this, arguments);
    };

    /**
     * WorksFormManagerView
     * WorksFormManagerView는 Backbone.View 일 필요가 없다.
     * 실제로는 FormBuilder가 View로 붙기 때문에 일반 자바스크립트 클래스로 구성하고 구조만 동일하게 맞춰준다.
     */
    var WorksFormManagerView = function (options) {
        options = options || {};

        this.appletId = null;
        this.contentTopView = null;
        this.formBuilder = null;
        this.layoutView = FMLayout.create();

        if (GO.session()['theme'] !== 'THEME_ADVANCED') this.layoutView.setUseOrganogram(false);

        if (options.hasOwnProperty('appletId')) {
            this.appletId = options.appletId;
            this.baseConfigModel = new AppletBaseConfigModel({"id": this.appletId});
            this.appletFormModel = new AppletFormModel({"appletId": this.appletId});
        } else {
            throw new Error('앱 ID가 필요합니다.');
        }

    };

    // 중복 서버 전송을 막기 위한 플래그
    var _savingFlag = false;

    _.extend(WorksFormManagerView.prototype, Backbone.Events, {
        render: function () {
            var self = this;
            var layoutView = this.layoutView;
            var formBuilder = this.formBuilder;

            return when(layoutView.render())
                .then(function () {
                    return self._fetchAccessibleForms()
                })
                .then(function () {
                    return asyncFetch(self.baseConfigModel)
                })
                .then(function () {
                    return asyncFetch(self.appletFormModel)
                })
                .then(_.bind(this.renderMe, this))
                .otherwise(function printError(err) {
                    console.log(err.stack);
                });
        },

        renderMe: function () {
            WorksUtil.checkAppManager(this.baseConfigModel.get('admins'));

            if (this.appletFormModel.get('mainForm')) {
                this.mainFormModel = GO.util.clone(this.appletFormModel, true);
            }

            this.formBuilder = FormBuilder.createBuilder(this.appletFormModel.toJSON());

            this.layoutView.setContent(this.formBuilder);

            this.formBuilder.render();
            this._renderContentTopView();
            // 처음 한번 resize를 실행해준다.
            this.formBuilder.resize(getContentHeight(this.layoutView));

            // window resize 이벤트 바인딩
            this._bindWindowResizeEvent();

            this.listenTo(this.formBuilder, constants.REQ_CHANGE_FORM, this._changeForm);
            this.listenTo(this.formBuilder, constants.REQ_CREATE_FORM, this._createForm);

            this.listenTo(this.formBuilder, constants.REQ_FORM_SAVE, this._saveForm);
            this.listenTo(this.formBuilder, constants.REQ_DELETE_SUBFORM, this._deleteSubForm);
            this.listenTo(this.formBuilder, constants.REQ_GOTO_SETTINGS_HOME, this._goToSettingsHome);
            this.listenTo(this.formBuilder, constants.REQ_GOTO_APP_HOME, this._goToAppHome);

        },

        remove: function () {
            this.stopListening();
            this.formBuilder.remove();
            $(window).off('.formmanager');
        },

        _renderContentTopView: function () {
            this.contentTopView = new AppContentTopView({
                appletId: this.appletId,
                accessibleForms: this.accessibleForms,
                subFormId: this.appletFormModel.get('subFormId'),
                isFormManager: true,
                baseConfigModel: this.baseConfigModel,
                pageName: worksLang['입력화면 관리'],
                useActionButton: false,
                isSetting: true,
                description: worksLang['입력화면 관리 설명']
            });

            this.formBuilder.setContenTopElement(this.contentTopView.el);
            this.contentTopView.render();

            var self = this;
            if (this.accessibleForms.length > 0) {
                $(this.contentTopView.el).after(FormTabTemplate({
                    forms: this.accessibleForms,
                    isSelect: function () {
                        if (this.mainForm) {
                            return GO.util.isInvalidValue(self.appletFormModel.get('subFormId'));
                        }
                        return this.id == self.appletFormModel.get('subFormId');
                    },
                    isFormManager: true
                }));

                $(".tab_menu_wrap").scroll(function (e) {
                    self._onScrollMoveTab(e);
                });

                $("span[el-arrow-tab]").click(function (e) {
                    self._onClickMoveTab(e);
                });

                $(".tab_menu_wrap").animate({
                    scrollLeft: $("li.active").attr('data-id') == 'tab_main' ? 0 : $("#tabMenu").scrollLeft() - $("#tabMenu").offset().left + $("li.active").offset().left - 45
                }, 200);

                this.__onScrollMoveTab($(".tab_menu_wrap"));
            }
        },

        _onScrollMoveTab: function (e) {
            this.__onScrollMoveTab($(e.currentTarget));
        },

        __onScrollMoveTab: function (el) {
            var scrollLeft = el.scrollLeft();

            if (scrollLeft + el.innerWidth() + 80 >= el[0].scrollWidth) {
                $(".tab_arrow.right").hide();
            } else {
                $(".tab_arrow.right").show();
            }

            if (scrollLeft == 0) {
                $(".tab_arrow.left").hide();
            } else {
                $(".tab_arrow.left").show();
            }
        },

        _onClickMoveTab: function (e) {
            var next = $(e.currentTarget).hasClass('ic_arrow_next');
            if (next) {
                $(".tab_menu_wrap").animate({scrollLeft: '+=460'}, 200);
            } else {
                $(".tab_menu_wrap").animate({scrollLeft: '-=460'}, 200);
            }
        },

        _fetchAccessibleForms: function () {
            var self = this;
            $.ajax({
                type: "GET",
                dataType: "json",
                async: false,
                url: GO.config('contextRoot') + "api/works/applets/" + this.appletId + "/accessible/form/list",
                success: function (resp) {
                    self.accessibleForms = resp.data;
                    var firstForm = self.accessibleForms[0];
                    if (firstForm.mainForm) {
                        self.subFormId = null;
                    } else {
                        self.subFormId = firstForm.id;
                    }
                }
            });
        },
        _changeForm: function (selectFormId) {
            this.appletFormModel = new AppletFormModel({
                "appletId": this.appletId,
            });
            if (selectFormId != 'tab_main') {
                this.appletFormModel.set("type", "subform_setting");
                this.appletFormModel.set("subFormId", selectFormId);
            }

            return when(asyncFetch(this.appletFormModel))
                .then(_.bind(this.renderMe, this))
                .otherwise(function printError(err) {
                    console.log(err.stack);
                });
        },
        _createForm: function () {
            var model = new AppletFormModel({appletId: this.appletId, type: 'subform_setting'});

            if (this.accessibleForms.length > 30) {
                $.goAlert(GO.i18n(worksLang['하위폼 추가 개수제한 안내'], {"arg1": "30"}));
                return;
            }

            var lastSubForm = this.accessibleForms.length == 1 ? null : _.filter(this.accessibleForms, function (form) {
                return !form.mainForm
            }).last();
            var name = _.isNull(lastSubForm) ? worksLang['하위폼'] + 1 : worksLang['하위폼'] + this.accessibleForms.length;
            var seq = _.isNull(lastSubForm) ? 0 : lastSubForm.seq + 1;

            var self = this;
            this.popupView = $.goPopup({
                pclass: 'layer_normal',
                header: worksLang['하위폼 추가'],
                contents:
                    '<p class="desc">' +
                    worksLang['메인 폼의 컴포넌트를 모두 가져오시겠습니까?'] + '</br>' +
                    worksLang['메인 폼 가져오기 설명'] +
                    '</p>',
                buttons: [{
                    btext: worksLang['가져오기'],
                    btype: 'normal',
                    callback: $.proxy(function () {
                        model.set('name', name);
                        model.set('seq', seq);
                        model.set('data', self.mainFormModel.get('data'));
                        model.save({}, {
                            success: function (response) {
                                $.goMessage(commonLang["저장되었습니다."]);
                                self._fetchAccessibleForms();
                                self.appletFormModel = response;
                                self.appletFormModel.set('subFormId', response.id);
                                self.renderMe();
                            },
                            error: function (model, resp) {
                                $.goError(resp.responseJSON.message);
                            }
                        });
                    }, this)
                },
                    {
                        btext: worksLang['폼만 추가'],
                        callback: $.proxy(function () {
                            var canvasData = GO.util.clone(self.mainFormModel.get('data'), true);
                            canvasData.components = [];

                            model.set('name', name);
                            model.set('seq', seq);
                            model.set('data', canvasData);
                            model.save({}, {
                                success: function (response) {
                                    $.goMessage(commonLang["저장되었습니다."]);
                                    self._fetchAccessibleForms();
                                    self.appletFormModel = response;
                                    self.appletFormModel.set('subFormId', response.id);
                                    self.renderMe();
                                },
                                error: function (model, resp) {
                                    $.goError(resp.responseJSON.message);
                                }
                            });
                        }, this)
                    }]
            });
        },

        _saveForm: function (appletFormModel, resolve, reject) {
            if (_savingFlag) {
                $.goSlideMessage(worksLang['저장중 메세지']);
                return;
            }
            var preloader = $.goPreloader();
            var self = this;
            this.appletFormModel.save({
                "data": appletFormModel.data,
                "name": appletFormModel.name,
                "accessSetting": appletFormModel.accessSetting,
                "accessTarget": appletFormModel.accessTarget,
                "exceptionTarget": appletFormModel.exceptionTarget
            }, {
                beforeSend: function () {
                    preloader.render();
                    _savingFlag = true;
                },
                success: function (model) {
                    $.goSlideMessage(worksLang['저장 되었습니다']);
                    ComponentManager.clearNewComponent();

                    self._fetchAccessibleForms();
                    this.appletFormModel = model;
                    if (!this.appletFormModel.get('mainForm')) {
                        this.appletFormModel.set('subFormId', model.get('id'))
                    }
                    self.renderMe();

                    if (_.isFunction(resolve)) {
                        resolve(model);
                    }
                },
                error: function (resp) {
                    if (_.isFunction(reject)) {
                        reject(resp);
                    }
                },
                complete: function () {
                    preloader.release();
                    _savingFlag = false;
                }
            });
        },

        _deleteSubForm: function (formInfoModel, resolve, reject) {
            var appletId = formInfoModel.appletId;
            var subFormId = formInfoModel.subFormId;
            var self = this;
            $.goConfirm(
                commonLang['삭제하시겠습니까?'],
                worksLang['하위폼을 삭제해도 데이터는 유지됩니다.'],
                _.bind(function () {
                    var model = new Backbone.Model();
                    model.url = GO.config('contextRoot') + 'api/works/applets/' + appletId + '/subform/' + subFormId;
                    model.save(null, {
                        type: 'DELETE',
                        contentType: 'application/json',
                        success: function () {
                            $.goSlideMessage(commonLang['삭제되었습니다.']);
                            self._fetchAccessibleForms();
                            self._changeForm('tab_main');
                        },
                        error: function (response, options) {
                            $.goError(response.message);
                        }
                    });
                }, this)
            );
        },

        _bindWindowResizeEvent: function () {
            var self = this;
            var resizer = new Resizer();

            $(window).on('resize.formmanager', function (e) {
                if (!$.isWindow(e.target)) return;
                resizer.bind(function () {
                    self.formBuilder.resize(getContentHeight(self.layoutView));
                });
            });
        },

        _goToSettingsHome: function () {
            this.remove();
            GO.router.navigate('works/applet/' + this.appletId + '/settings/home', {trigger: true});
        },

        _goToAppHome: function () {
            this.remove();
            GO.router.navigate('works/applet/' + this.appletId + '/home', {trigger: true});
        }
    });

    function asyncFetch(model) {
        return new Promise(function (resolve, reject, notify) {
            model.fetch({
                success: resolve,
                error: reject
            });
        });
    }

    function getContentHeight(layoutView) {
        var wH = $(window).height();
        var isAdvanced = GO.session('theme') === 'THEME_ADVANCED';
        var hOH = isAdvanced ? 0 : layoutView.getHeaderElement().outerHeight();

        return wH - hOH;
    }

    return WorksFormManagerView;
});
