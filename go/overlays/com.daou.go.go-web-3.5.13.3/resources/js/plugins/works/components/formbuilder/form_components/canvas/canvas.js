define('works/components/formbuilder/form_components/canvas/canvas', function (require) {

    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var ContainableFormView = require('works/components/formbuilder/core/views/containable_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderEmptyTemplate = require('hgn!works/components/formbuilder/form_components/canvas/empty');

    var constants = require('works/components/formbuilder/constants');
    var worksLang = require('i18n!works/nls/works');

    var CanvasComponent = FormComponent.define(ComponentType.Canvas, {
        name: '캔버스',
        group: 'extra',
        handlerable: false,

        OptionView: BaseOptionView,
        FormView: ContainableFormView.extend({
            template: null,
            className: 'build_content_inner',

            initialize: function () {
                ContainableFormView.prototype.initialize.apply(this, arguments);
                if (this.isEditable()) {
                    this.$el.addClass(constants.CN_CONTAINABLE);
                }
            },

            afterRender: function () {
                ContainableFormView.prototype.afterRender.apply(this, arguments);
                this._renderEmptyMessage();
            },

            /**
             * @Override
             */
            appendChildView: function (childView) {
                ContainableFormView.prototype.appendChildView.apply(this, arguments);
                this._toggleEmptyMessage();
            },

            /**
             * @Override
             */
            sortActivate: function (event, ui) {
                ContainableFormView.prototype.sortActivate.apply(this, arguments);
                this._removeEmptyMessage();
            },
            /**
             * @Override
             */
            sortStop: function (event, ui) {
                ContainableFormView.prototype.sortStop.apply(this, arguments);
                this._toggleEmptyMessage();
            },

            /**
             * @Override
             */
            sortDeactivate: function (event, ui) {
                ContainableFormView.prototype.sortDeactivate.apply(this, arguments);
                if (this.isComponentTypeElement(ui.item)) {
                    this._toggleEmptyMessage();
                }
            },

            /**
             * @Override
             */
            afterRemoveComponent: function (component) {
                var _comp = ContainableFormView.prototype.afterRemoveComponent.apply(this, arguments);
                this._toggleEmptyMessage();
            },

            _toggleEmptyMessage: function () {
                if (this.getComponents().length > 0) {
                    this._removeEmptyMessage();
                } else {
                    this._renderEmptyMessage();
                }
            },

            _renderEmptyMessage: function () {
                var lang = {
                    messageHeader: worksLang['컴포넌트 없음 제목'],
                    messageBody: worksLang['컴포넌트 없음 내용']
                };

                if (!this.isEditable()) {
                    lang.messageBody = worksLang['입력화면 컴포넌트 구성 오류 메시지'];
                }
                this.getContainerEl().append(renderEmptyTemplate(lang));
            },

            _removeEmptyMessage: function () {
                this.$('.message-emtpy-components').remove();
            }
        }),

        DetailView: BaseDetailView.extend({
            template: null,
            className: 'build_prev_content',

            /**
             * 반드시 이렇게 해줘야 한다.
             * setElement() 엘리먼트를 변경하면 this.$body는 바뀌지 않기 때문에 DOM트리에 표현되지 않는다.
             */
            appendChildView: function (childView) {
                this.$el.append(childView.el);
            }
        })
    });

    Registry.addComponent(CanvasComponent);
});
