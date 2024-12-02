define('works/components/formbuilder/form_components/columns/columns', function (require) {

    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');

    var ContainableFormView = require('works/components/formbuilder/core/views/containable_form');
    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/columns/form');
    var renderColumnTpl = require('hgn!works/components/formbuilder/form_components/columns/column');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/columns/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var lang = {
        "컬럼 단계 설정": worksLang["컬럼 단계 설정"],
        "2단계": worksLang["2단"],
        "3단계": worksLang["3단"]
    };

    var ColumnComponent = FormComponent.define(ComponentType.Column, {
        name: worksLang['컬럼'],
        group: 'ui',
        handlerable: false,
        // 컬럼이 컬럼 컴포넌트를 포함할 수 없음(GO-18821)
        acceptComponent: '!' + ComponentType.Columns,

        OptionView: BaseOptionView,

        FormView: ContainableFormView.extend({
            className: 'column_side',
            template: null,

            initialize: function () {
                ContainableFormView.prototype.initialize.apply(this, arguments);
                this.isRendered = false;
            },

            render: function (index) {
                if (!this.isRendered) {
                    this.isRendered = true;
                    this.$el.html(renderColumnTpl({
                        "cid": this.clientId,
                        "indicator": worksLang['컬럼'] + index
                    }));
                }
            },

            /**
             * @Override
             */
            getContainerEl: function () {
                return this.$('.component-container');
            }
        }),

        DetailView: BaseDetailView.extend({
            className: 'column_side',
            template: null,

            initialize: function () {
                BaseDetailView.prototype.initialize.apply(this, arguments);
                this.isRendered = false;
            },

            render: function () {
                if (!this.isRendered) {
                    this.isRendered = true;
                    this.$el.html(renderColumnTpl({
                        "cid": this.clientId
                    }));
                }
            },

            appendChildView: function (childView) {
                this.$('.component-container').append(childView.el);
            }
        })
    });

    /**
     * columns 컴포넌트는 containable 컴포넌트 중에서도 독특한 녀석이다.
     * column 컴포넌트만 포함시킬 수 있으며, column 컴포넌트는 사용자가 핸들링할 수 없는(handlerable: false)
     * 컴포넌트이기 때문에 containable 이면서 ContainableFormView를 상속하지 않는다.
     *
     * 대신 columns 컴포넌트가 새로 추가될 때마다 column 컴포넌트를 생성해서 자식 컴포넌트로 추가하는 작업을
     * 거쳐야 한다.
     */
    var ColumnsComponent = FormComponent.define(ComponentType.Columns, {
        name: worksLang['컬럼 (다단)'],
        group: 'design',
        acceptComponent: ComponentType.Column,

        properties: {
            "count": {defaultValue: 2}
        },

        initialize: function (node) {
            if (node && node.cid) {

            } else {
                // 폼빌더에서 DnD시에만 아래 로직을 수행하게 된다.
                var componentModel = this.getComponentModel();
                var columnCount = componentModel.get('count');
                if (!this.hasChildren()) {
                    for (var i = 0; i < columnCount; i++) {
                        var newComponent = ComponentManager.createComponent(ComponentType.Column, this.getCid());
                        this.addComponent(newComponent.toJSON());
                    }
                }
            }
        },

        OptionView: BaseOptionView.extend({
            renderBody: function () {
                this.$el.html(renderOptionTpl({
                    lang: lang,
                    model: this.model.toJSON()
                }));
            },
            _updateSelect: function (e) {
                var $target = $(e.currentTarget);
                var targetVal = $target.val();
                var targetName = $target.attr('name');
                var currentVal = this.model.toJSON().count;
                var lastColumnHasChild = $("[data-cid=" + this.clientId + "]").find("[data-type=column]").last().find(".form-component").length > 0
                if ((targetVal < currentVal) && lastColumnHasChild) {
                    var _this = this;
                    $.goConfirm(
                        worksLang["3단컴포넌트삭제경고"],
                        worksLang["3단컴포넌트삭제설명"],
                        _.bind(function () {
                            _this.model.set(targetName, targetVal);
                        }),
                        _.bind(function () {
                            e.preventDefault();
                            $(e.currentTarget).val(currentVal);
                        }), commonLang["삭제"]
                    );
                } else {
                    this.model.set(targetName, targetVal);
                }
            }
        }),

        FormView: BaseFormView.extend({
            initialize: function () {
                BaseFormView.prototype.initialize.apply(this, arguments);
                this.$el.addClass('column');
                this.isRendered = false;

                this.model.on('change:count', $.proxy(function () {
                    var currentCount = Number(this.$(".column_inner > .column_side").length);
                    var selectCount = Number(this.model.toJSON().count);

                    if (selectCount > currentCount) {
                        var columnsComponent = ComponentManager.getComponent(this.clientId);
                        var newComponent = ComponentManager.createComponent(ComponentType.Column, this.getCid());
                        var newComponentJSON = newComponent.toJSON();

                        columnsComponent.addComponent(newComponentJSON);
                        columnsComponent.getFormView().renderNode();
                        this.components.push(newComponentJSON);

                    } else if (selectCount < currentCount) {
                        var currnetComponent = ComponentManager.getComponent(this.components.last().cid);

                        ComponentManager.getComponent(this.clientId).removeComponent(currnetComponent);
                        this.removeChildView(currnetComponent);
                        this.components.pop();
                    }

                }, this));

            },
            render: function () {
                if (!this.isRendered) {
                    this.isRendered = true;
                    this.$body.addClass('column_box');
                    this.$body.html(renderFormTpl({
                        editable: this.editable,
                        componentTitle: worksLang['컬럼 영역']
                    }));
                }
            },

            appendChildView: function (childView) {
                this.$('.column-container').append(childView.el);
            },

            removeChildView: function (childView) {
                childView.remove();
            }
        }),

        DetailView: BaseDetailView.extend({
            initialize: function () {
                BaseDetailView.prototype.initialize.apply(this, arguments);
                this.$el.addClass('column');
                this.isRendered = false;
            },
            render: function () {
                if (!this.isRendered) {
                    this.isRendered = true;
                    this.$body.addClass('column_box');
                    this.$body.html(renderFormTpl({
                        editable: this.editable
                    }));
                }
            },

            appendChildView: function (childView) {
                this.$('.column-container').append(childView.el);
            }
        })
    });

    Registry.addComponent(ColumnComponent);
    Registry.addComponent(ColumnsComponent);
});
