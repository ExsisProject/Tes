define('works/components/formbuilder/core/views/form_design', function (require) {
    var Backbone = require('backbone');
    var when = require('when');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var renderTemplate = require('hgn!works/components/formbuilder/core/templates/form_design');
    var constants = require('works/components/formbuilder/constants');
    var GO = require('app');

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');

    require('jquery.go-popup');

    /**
     * Promise 객체 Wrapper
     */
    var Promise = function () {
        return when.promise.apply(this, arguments);
    };

    var lang = {
        "pageTitle": worksLang['입력화면 관리'],
        "save": commonLang['저장'],
        "cancel": commonLang['취소'],
        "goToSettingsHome": worksLang['관리 홈으로 이동'],
        "goToAppHome": worksLang['앱 홈으로 이동'],
        "formDelete": worksLang['폼 삭제']
    };

    return Backbone.View.extend({
        className: 'go_content build_situation build_multi_form',

        observer: null,
        contentTopView: null,
        canvasView: null,

        /**
         * @attribute
         * @Inject
         * 애플릿 ID
         */
        appletId: null,

        /**
         * @attribute
         * @Inject
         * AppletFormModel 객체
         */
        model: null,

        events: {
            "click [el-form-tab]": "_changeForm",
            "click [el-form-create-tab]": '_createForm',
            "click .btn-save": "_saveFormModel",
            "click .btn-cancel": "_cancelEditForm",
            "click .btn-goto-settings-home": "_goToSettingsHome",
            "click .btn-goto-app-home": "_goToAppHome",
            "click .btn-subform-delete": "_subformDelete"
        },

        initialize: function (options) {
            options = options || {};

            this.observer = null;
            if (options.hasOwnProperty('observer')) {
                this.observer = options.observer;
            }

            this.appletId = null;
            if (options.hasOwnProperty('appletId')) {
                this.appletId = options.appletId;
                this.mainForm = options.appletFormModel.mainForm;
                this.subFormId = options.appletFormModel.subFormId;
            }
            this.appletFormModel = options.appletFormModel;
            this.mainFormModel = options.mainFormModel;


            // 수정전 상황으로 돌아가야 하므로 따로 저장해둔다.
            this._freezingFormData();
            this._initRender();
            this._initCanvasView();

            this.listenTo(this.observer, constants.REQ_ORDER_COMPOMENT, this._orderComponent);
            this.listenTo(this.observer, constants.REQ_REMOVE_COMPONENT, this._removeComponent);
            this.listenTo(this.observer, constants.REQ_COPY_COMPONENT, this._copyComponent);
            this.listenTo(this.observer, constants.REQ_UPDATE_COMPONENT, this._updateComponent);
            this.listenTo(this.observer, constants.EVENT_UPDATE_FORM_ACCESS_SETTING, this._updateFormAccessModel)
        },

        render: function () {
            this.$('.canvas-container').prepend(this.canvasView.el);
            this.canvasView.renderNode();				// 폼빌더를 render
            this.observer.trigger('setInitDisplay');	// 폼빌더를 rendering 후 작업이 필요할 이런식으로 트리거 이용!!

            this._bindDocumentClickEvent();
        },

        /**
         * @Override
         */
        remove: function () {
            Backbone.View.prototype.remove.apply(this, arguments);
            this.canvasView.remove();
            $(document).off(constants.EVENT_SELECT_COMPONENT);
        },

        resize: function (newSize) {
            this.$el.outerHeight(newSize);
        },

        setContenTopElement: function (el) {
            this.$('.content_top').replaceWith(el);
        },

        /**
         * 현재 FormModel을 원본으로 동결시킴(취소시 복구용)
         */
        _freezingFormData: function () {
            this.originComponentData = GO.util.clone(this.model.toJSON(), true);
            this.originFormData = GO.util.clone(this.appletFormModel, true);
        },

        _initRender: function () {
            this.$el.empty();
            this.$el.append(renderTemplate({
                lang: lang,
                mainForm: this.mainForm
            }));
        },

        _initCanvasView: function () {
            // 컴포넌트 매니저 초기화
            ComponentManager.init(this.model.toJSON(), {type: 'form'});
            if (this.mainFormModel) {
                ComponentManager.initMainForm(this.mainFormModel.get('data'), true);
            }
            var rootComponent = ComponentManager.getComponent(this.model.get('cid'));
            rootComponent.setAppletId(this.appletId);
            if (GO.util.isValidValue(this.subFormId)) {
                rootComponent.setSubFormId(this.subFormId);
            }
            rootComponent.setEditable(true);
            rootComponent.attachObserver(this.observer);
            this.canvasView = rootComponent.getFormView();
        },

        _bindDocumentClickEvent: function () {
            var observer = this.observer;
            var SELECT_CLASS = 'on';

            $(document).on(constants.EVENT_SELECT_COMPONENT, function (event) {
                var $box, cid;
                var target = event.relatedTarget;
                if ($('#popOverlay').is(target) || $('.layer_pallete').find(target).length) return;
                if (
                    isSelectedBox(target) ||
                    isToolboxOptionView(target) ||
                    isPreventedSelected(target) ||
                    isOrg(target) ||
                    isDatepicker(target)
                ) {
                    ;
                } else {
                    $box = getParentBuildBox(target);
                    cid = $box.data('cid');

                    $('.canvas-container').find('.' + SELECT_CLASS).removeClass(SELECT_CLASS);
                    observer.trigger(constants.EVENT_CLEAR_COMPONENT_SELECTED, cid);
                    if ($box.length > 0) {
                        $box.addClass(SELECT_CLASS);
                        observer.trigger(constants.EVENT_COMPONENT_SELECTED, cid);
                    }
                }

                // 자식 노드가 많을수록 버블링 발생하니 반드시 걸어줘야 한다.
                event.stopImmediatePropagation();
            });

            function getParentBuildBox(target) {
                return $(target).closest('.build_box');
            }

            function isSelectedBox(target) {
                var $box = getParentBuildBox(target);
                return $box.length > 0 && $box.hasClass('select');
            }

            function isToolboxOptionView(target) {
                return $(target).closest('.component-option').length > 0;
            }

            function isPreventedSelected(target) {
                return $(target).hasClass('prevent-component-select');
            }

            function isOrg(target) {
                return $(target).closest('#gpopupLayer').length > 0
            }

            function isDatepicker(target) {
                return $(target).closest('div#ui-datepicker-div').length > 0
            }
        },

        _updateComponent: function (cid) {
            var component = ComponentManager.getComponent(cid);
            this.model.update(component.toJSON());
        },
        _updateFormAccessModel: function (accessModel) {
            var self = this;
            _.each(accessModel, function (value, key) {
                self.appletFormModel[key] = value;
            });
        },

        _orderComponent: function (component, position) {
            var _comp;
            if (_.isString(component)) {
                _comp = ComponentManager.getComponent(component);
            } else {
                _comp = component;
            }
            var comp = this.model.order(_comp.toJSON(), position);
            /**
             * 폼빌더 구조 문제.
             * 컬럼이나 테이블 안에 있는 컴포넌트의 순서를 바꾸고
             * 해당 컬럼이나 테이블 컴포넌트의 순서를 바꾸면 순서가 변경되지 않는다.
             * 모델의 순서를 바꾸더라도 ComponentManager 의 component 는 갱신되지 않기 때문.
             */
            if (comp) {
                var componentManagerComponent = ComponentManager.getComponent(comp.cid);
                componentManagerComponent.components = comp.components;
            }
        },

        _removeComponent: function (component, silent) {
            var _comp;
            if (_.isString(component)) {
                _comp = ComponentManager.getComponent(component);
            } else {
                _comp = component;
            }
            this.model.remove(_comp.toJSON(), silent || false);
        },

        _copyComponent: function (component) {

        },

        _reloadCanvasView: function () {
            this.canvasView.remove();
            this.canvasView = null;
            this._initCanvasView();
            this.render();
        },

        _saveFormModel: function (e) {
            var isAccessChanged = !_.isEqual(this.originFormData, this.appletFormModel);
            var isFormChanged = !_.isEqual(this.originComponentData, this.model.toJSON());

            if (isAccessChanged || isFormChanged) {
                e.preventDefault();
                this.__save();
                e.stopPropagation();
            } else {
                $.goSlideMessage(worksLang['변경된 내용이 없습니다.']);
            }
        },

        __save: function () {
            if (this._validateComponent()) {
                var self = this;
                if (self.subFormId) {
                    self._saveCallBack();
                } else if ($('[el-form-tab]').length > 1) {
                    $.goConfirm(worksLang['메인 폼에 변경사항이 있습니다.'],
                        worksLang['메인 폼 변경 안내'],
                        function () {
                            self._saveCallBack();
                        }
                        , function () {
                            return false;
                        }, commonLang['확인']);
                } else {
                    self._saveCallBack();
                }
            }

        },

        _saveCallBack: function () {
            var self = this;
            new Promise(_.bind(function (resolve, reject) {
                self.observer.trigger(constants.REQ_SAVE, self.model.toJSON(), resolve, reject);
            }, self)).then(_.bind(function () {
                self.observer.trigger(constants.EVENT_CLEAR_COMPONENT_SELECTED);

                _.map(ComponentManager.getComponents(), function (component) {
                    var node = self.model.search(component.getCid());
                    if (node && node.properties) component.setProperties(node.properties);
                }, self);

                // 저장이 성공하면 현재 모델을 원본모델로 동결시킨다.
                self._freezingFormData();
            }, self)).otherwise(function (error) {
                console.log(error.stack);
            });
        },

        _subformDelete: function (e) {
            e.preventDefault();
            var appletId = this.appletId;
            var subFormId = this.subFormId;
            this.observer.trigger(constants.REQ_DELETE_SUBFORM, {appletId: appletId, subFormId: subFormId});
        },

        /**
         * 폼 빌더 저장시 옵션 및 AppletFormModel 값 검증
         * 차례대로 검증하고, 실패하는 대로 중지하고 오류를 표시한다.
         *
         * 1. 각 컴포넌트의 옵션값에 대한 검증
         * 2. AppletFormModel 자체 검증(최소 컴포넌트 수 등...)
         * @private
         * @return {Boolean}
         */
        _validateComponent: function () {
            // 1. 각 컴포넌트의 옵션값에 대한 검증
            // 2. AppletFormModel 자체 검증(최소 컴포넌트 수 등...)
            var valResult = this.model.checkValidate();
            if (valResult) {
                $.goSlideMessage(valResult, 'caution');
                return false;
            }
            return true;
        },

        _cancelEditForm: function (e) {
            var isAccessChanged = !_.isEqual(this.originFormData, this.appletFormModel);
            var isFormChanged = !_.isEqual(this.originComponentData, this.model.toJSON());

            if (isAccessChanged || isFormChanged) {
                e.preventDefault();
                $.goConfirm(
                    commonLang['취소하시겠습니까?'],
                    worksLang['폼빌더 편집 취소'],
                    _.bind(function () {
                        // 반드시 deepCopy로 넘겨야 한다. 그렇지 않으면 원본이 변경된다(데이터가 트리구조라서 발생하는 문제)
                        this.model.set(GO.util.clone(this.originComponentData, true), {silent: true});
                        this._reloadCanvasView();
                    }, this)
                );
            } else {
                $.goSlideMessage(worksLang['변경된 내용이 없습니다.']);
            }
        },

        _goToSettingsHome: function (e) {
            e.preventDefault();
            this.observer.trigger(constants.REQ_GOTO_SETTINGS_HOME);
        },

        _goToAppHome: function (e) {
            e.preventDefault();
            this.observer.trigger(constants.REQ_GOTO_APP_HOME);
        },
        _changeForm: function (e) {
            var selectFormId = $(e.currentTarget).attr('data-id');

            var triggerOption = {
                "selectFormId": selectFormId,
                "message": worksLang['폼 이동 경고'],
                "eventType": constants.REQ_CHANGE_FORM
            }
            this.__confirmAndTriggerEvent(triggerOption);
        },
        _createForm: function () {
            var triggerOption = {
                "message": worksLang['폼 생성 경고'],
                "eventType": constants.REQ_CREATE_FORM
            }
            this.__confirmAndTriggerEvent(triggerOption);
        },
        __confirmAndTriggerEvent: function (triggerOption) {
            var isAccessChanged = !_.isEqual(this.originFormData, this.appletFormModel);
            var isFormChanged = !_.isEqual(this.originComponentData, this.model.toJSON());

            var selectFormId = triggerOption.selectFormId;
            var eventType = triggerOption.eventType;
            var title = this.mainForm ? worksLang['메인 폼에 변경사항이 있습니다.'] : "";
            var message = this.mainForm ? worksLang['메인 폼 변경'] + '<br/>' + triggerOption.message : triggerOption.message;
            var sameForm = false;

            if (eventType == constants.REQ_CHANGE_FORM) {
                sameForm = selectFormId == "tab_main" && this.mainForm ? true : this.subFormId == selectFormId;
            }

            if (sameForm) {
                return;
            }

            if (isAccessChanged || isFormChanged) {
                var self = this;
                this.popupView = $.goPopup({
                    pclass: 'layer_normal',
                    header: title,
                    contents: message,
                    buttons: [{
                        btext: commonLang['저장'],
                        btype: 'confirm',
                        callback: $.proxy(function () {
                            if (self._validateComponent()) {
                                self._saveCallBack();
                            }
                            if (selectFormId) {
                                this.observer.trigger(eventType, selectFormId);
                            } else {
                                this.observer.trigger(eventType);
                            }
                        }, this)
                    }, {
                        btext: worksLang['저장하지 않고 이동'],
                        callback: $.proxy(function () {
                            if (selectFormId) {
                                this.observer.trigger(eventType, selectFormId);
                            } else {
                                this.observer.trigger(eventType);
                            }
                        }, this)
                    }]
                });
            } else {
                if (selectFormId) {
                    this.observer.trigger(eventType, selectFormId);
                } else {
                    this.observer.trigger(eventType);
                }
            }
        }
    });
});
