define('works/components/formbuilder/core/views/builder', function (require) {

    var Backbone = require('backbone');
    var ModelApdaters = require('works/components/formbuilder/core/models/adapters');

    var AppletFormModel = require('works/models/applet_form');

    var FBToolboxView = require('works/components/formbuilder/core/views/form_toolbox');
    var FBDesignView = require('works/components/formbuilder/core/views/form_design');
    var constants = require('works/components/formbuilder/constants');

    return Backbone.View.extend({
        className: 'formbuilder build_body',

        toolboxView: null,
        designView: null,

        appletId: null,
        observer: null,

        /**
         * @Inject
         * AppletFormModel 모델
         */
        model: null,

        initialize: function (options) {
            options = options || {};

            this.$el.empty();

            // 옵저버 초기화
            this.observer = _.extend({}, Backbone.Events);

            this.appletId = null;
            if (options.hasOwnProperty('appletId')) {
                this.appletId = options.appletId;
            }

            var subViewOptions = {
                appletId: this.appletId,
                observer: this.observer,
                appletFormModel: options.model
            };

            if (subViewOptions.appletFormModel.subFormId) {
                this.mainFormModel = new AppletFormModel({"appletId": this.appletId});
                this.mainFormModel.fetch({async: false});
                subViewOptions.mainFormModel = this.mainFormModel;
            }
            this.toolboxView = new FBToolboxView(subViewOptions);

            subViewOptions.model = ModelApdaters.toAppletFormModel(this.model);
            this.designView = new FBDesignView(subViewOptions);

            this.listenTo(this.observer, constants.REQ_FORM_SAVE, this._requestFormSave);
            this.listenTo(this.observer, constants.REQ_DELETE_SUBFORM, this._requestDeleteSubForm);
            this.listenTo(this.observer, constants.REQ_GOTO_SETTINGS_HOME, this._requestGoToSettingsHome);
            this.listenTo(this.observer, constants.REQ_GOTO_APP_HOME, this._requestGoToAppHome);
            this.listenTo(this.observer, constants.REQ_CHANGE_FORM, this._requestChangeForm);
            this.listenTo(this.observer, constants.REQ_CREATE_FORM, this._requestCreateForm);

        },

        /**
         * @Override
         */
        render: function () {
            this.$el.append(this.toolboxView.el, this.designView.el);
            this.toolboxView.render();
            this.designView.render();

            this._bindDocumentClickEvent();
        },

        /**
         * @Override
         * destructor 역할 수행
         */
        remove: function () {
            Backbone.View.prototype.remove.apply(this, arguments);

            // 서브뷰 삭제(해제)
            this.toolboxView.remove();
            this.designView.remove();

            // 최상위뷰에서 모든 옵져버 이벤트 바인딩 해제
            this.observer.off();
            $(document).off('.canvas-container');
        },

        attachTo: function (target) {
            this.$el.appendTo(target);
            this.render();
        },

        resize: function (newSize) {
            this.toolboxView.resize(newSize);
            this.designView.resize(newSize);
        },

        setContenTopElement: function (contentTopEl) {
            this.designView.setContenTopElement(contentTopEl);
        },

        _bindDocumentClickEvent: function () {
            $(document)
                .on('click.canvas-container', selectComponent);

            function triggerEvent(event, eventName) {
                // 마우스 우클릭 이벤트는 무시한다.
                if (event && event.which === 3) return;
                // DOM에서 사라진 엘리먼트는 무시한다.
                if ($(event.target).closest(document).length < 1) return;
                // 이벤트명이 없으면 무시한다.
                if (!eventName) return;
                $(document).trigger($.Event(eventName, {relatedTarget: event.target}));
            }

            function selectComponent(e) {
                triggerEvent(e, constants.EVENT_SELECT_COMPONENT);
            }
        },

        _requestFormSave: function (appletFormModel, resolve, reject) {
            this.trigger(constants.REQ_FORM_SAVE, appletFormModel, resolve, reject);
        },

        _requestDeleteSubForm: function (formInfoModel, resolve, reject) {
            this.trigger(constants.REQ_DELETE_SUBFORM, formInfoModel, resolve, reject);
        },

        _requestGoToSettingsHome: function () {
            this.trigger(constants.REQ_GOTO_SETTINGS_HOME);
        },

        _requestGoToAppHome: function () {
            this.remove();
            this.trigger(constants.REQ_GOTO_APP_HOME);
        },
        _requestChangeForm: function (selectFormId) {
            // 입력항목 관리에서 폼 이동시 메인폼 변경하는 경우 메인폼 저장 후 폼 이동이 이루어 져야 하는데 현재 메인폼 저장 후 observer.trigger가 동작하지 않아 들어간 코드.
            var self = this;
            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            setTimeout(function () {
                self.trigger(constants.REQ_CHANGE_FORM, selectFormId);
                GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
            }, 600);
        },
        _requestCreateForm: function () {
            this.trigger(constants.REQ_CREATE_FORM);
        }
    });
});
