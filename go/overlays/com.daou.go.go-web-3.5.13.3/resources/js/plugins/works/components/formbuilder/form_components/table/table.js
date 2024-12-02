define('works/components/formbuilder/form_components/table/table', function (require) {

    var _ = require('underscore');
    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');

    var ContainableFormView = require('works/components/formbuilder/core/views/containable_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var detailTpl = require('hgn!works/components/formbuilder/form_components/table/detail');
    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/table/table_form');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/table/table_option');
    var renderButtonsTpl = require('hgn!works/components/formbuilder/form_components/table/table_buttons');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var constants = require('works/components/formbuilder/constants');
    var COMPONENT_TYPE = require('works/constants/component_type');

    require('browser');

    var lang = {
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "이름숨기기": worksLang["이름숨기기"],
        "tableName": worksLang['테이블 이름'],
        "옵션": worksLang['옵션'],
        "추가": commonLang['추가'],
        "삭제": commonLang['삭제']
    };


    function addChildViews(childView, callback) {
        var views = [];
        var $table = this.$('table.type_normal');
        var components = this.getComponents();

        if (_.isArray(childView)) {
            views = childView;
        } else {
            views = [childView];
        }

        var rowCount = Math.max($table.find('tr').length, views.length);

        for (var i = 0; i < rowCount; i++) {
            var currentView = views[i];
            var nthTr = 'tr:nth-child(' + (i + 1) + ')';

            if (!currentView) {
                continue;
            }

            if (!this.$(nthTr).length) {
                $table.append(createTableRowEl(components));
            } else {
                this.$(nthTr).attr('data-cloneable', 'Y');
            }

            if (this.$(nthTr).find('td').length < 1) {
                createTableRowDataEl(this.$(nthTr), components);
            }

            appendComponentViewToTable.call(this, this.$(nthTr), currentView);

            if (_.isFunction(callback)) {
                callback(this.$(nthTr), currentView);
            }
        }

        this.$('tr:first').find('a.btn-remove-row').remove();
    }

    function createTableRowEl(components) {
        var $newTr = $('<tr data-cloneable="Y"></tr>');
        createTableRowDataEl($newTr, components);

        return $newTr;
    }

    function createTableRowDataEl($tr, nodes) {
        _.each(nodes, function (node) {
            $tr.append('<td data-cid="' + node.cid + '"></td>');
        });
    }

    function appendComponentViewToTable($tr, componentView) {
        if (_.isUndefined($tr.attr('data-cloneable'))) {
            $tr.attr('data-cloneable', 'Y');
        }
        // 폼 뷰이면서 복제불가능한 필드가 현재 행에 하나이상 있을 경우 복사/삭제 버튼을 보이지 않는다.
        if (!isCloneableFormView(componentView) && isTableRowAddable($tr)) {
            $tr.attr('data-cloneable', 'N');
        }

        var componentManager = ComponentManager.getInstance(this.viewType);
        var component = componentManager.getComponentByCid(componentView.getCid());
        if ($tr.find(componentView.el).length) return; // 렌더를 재사용 할 수 없는 구조로 만들어져 있다. 두번 렌더 하면 컴포넌트가 중첩된다. 두번째 호출은 막도록 하자.
        $tr.find('td[data-cid=' + componentView.getCid() + ']').toggle(component.visible).html(componentView.el);
    }

    function isCloneableFormView(componentView) {
        if (componentView.getViewType() !== 'form') {
            return false;
        }

        return componentView.isCloneable();
    }


    function wrapTableData($componentEl) {
        $componentEl.wrap('<td data-cid="' + $componentEl.data('cid') + '"></td>');
    }

    function isIE8() {
        if (_.isUndefined(navigator)) {
            return false;
        }

        var ua = navigator.userAgent;
        var isIE = /msie|trident/i.test(ua);
        var ieVer = ua.match(/(?:msie |rv:)(\d+(\.\d+)?)/i);

        if (isIE && ieVer && ieVer.length > 0) {
            return ieVer[1] === '8.0';
        }

        return false;
    }

    function isTableRowAddable($tr) {
        return $tr.attr('data-cloneable') === 'Y';
    }

    var FormView = ContainableFormView.extend({

        events: {
            'click .table-buttons .btn-add-row': '_addTableRow',
            'click .table-buttons .btn-remove-row': '_removeTableRow'
        },

        initialize: function (options) {
            ContainableFormView.prototype.initialize.apply(this, arguments);
            this.$el.addClass('table');
            this.listenTo(this.observer, 'changeDisplay', this._onChangeDisplay);
            this.listenTo(this.model, 'change:label', this._onChangeLabel);
            this.listenTo(this.model, 'change:hideLabel', this._onChangeHideLabel);
            this.listenTo(this.model, 'change:guideAsTooltip', this._onChangeGuideAsTooltip);
            this.listenTo(this.model, 'change:guide', this._onChangeGuide);
            this.isRendered = false;
        },

        render: function () {
            if (!this.isRendered) {
                this.isRendered = true;
                this.$body.addClass('table_box');
                this.$body.html(renderFormTpl({
                    model: this.model.toJSON(),
                    label: GO.util.escapeHtml(this.model.get('label')),
                    clientId: this.getCid()
                }));
                this._onChangeHideLabel();
                this._onChangeGuide();

                if (this.isEditable()) {
                    this.getContainerEl().addClass(constants.CN_CONTAINABLE);
                    // IE8에서만 drop placeholder 추가
                    this._addDropPlaceholder();
                }
            }
        },

        _onChangeLabel: function () {
            this.$('[data-model-label]').html(GO.util.escapeHtml(this.model.get('label')));
        },

        _onChangeHideLabel: function () {
            this.$('[data-selector="!hideLabel"]').toggle(!this.model.get('hideLabel'));
            this._toggleGuideArea();
        },

        _onChangeGuideAsTooltip: function () {
            this._toggleGuideArea();
        },

        _onChangeGuide: function () {
            this._toggleGuideArea();
            this.$('[data-model="guide"]').text(this.model.get('guide'));
        },

        _toggleGuideArea: function () {
            var guideAsTooltip = this.model.get('guideAsTooltip');
            var hasGuide = !!this.model.get('guide');
            this.$('[data-selector="guideAsTooltip"]').css("display",
                (!!guideAsTooltip && hasGuide && !this.model.get('hideLabel')) ? "inline-block" : "none");
            this.$('[data-selector="!guideAsTooltip"]').css("display", (!guideAsTooltip && hasGuide) ? "inline-block" : "none");
        },

        /**
         * @Override
         */
        getContainerEl: function () {
            return this.$('.table-container');
        },

        /**
         * @Override
         */
        getChildElements: function () {
            return this.getContainerEl().find('.' + constants.CN_COMPONENT);
        },

        /**
         * @Override
         */
        initChildComponent: function (component) {
            ContainableFormView.prototype.initChildComponent.apply(this, arguments);

            if (this.isEditable()) {
                component.setMultiple(true);
            }

            return component;
        },

        /**
         * @Override
         */
        appendChildView: function (childView) {
            addChildViews.call(this, childView, _.bind(this._appendButtons, this));
        },

        /**
         * @Override
         */
        sortItems: 'td:not(.unsortable)',
        /**
         * @Override
         */
        sortPlaceholder: {
            /**
             * currentItem: 현재 sortable 대상
             */
            element: function () {
                return $('<div class="' + constants.CN_PLACEHOLDER + '"></div>')[0];
            },
            /**
             * container: tr
             * p: placeholder
             */
            update: function () {
            }
        },
        /**
         * @Override
         * 테이블 외부에서 sortable에 의해 컴포넌트를 받을 때는 stop이 작동하지 않고 receive만 작동한다.
         */
        sortStop: function (event, ui) {
            // 받아들일 수 없는 컴포넌트이면 처리 안함
            if (!this.sortCheckAcceptComponent(event, ui)) {
                return;
            }

            if (this.isComponentTypeElement(ui.item)) {
                return;
            }

            /**
             * 테이블 내에서 이동할 경우에만 실행한다.
             */
            if (ui.item.parent('td')) {
                var component = ComponentManager.getComponent(ui.item.data('cid'));
                this.orderComponent(component);
                this.observer.trigger(constants.EVENT_STOP_SORTING);
            }
        },
        /**
         * @Override
         * 외부 connected list에서 엘리먼트를 받았을 때 작동
         */
        sortReceive: function (event, ui) {
            var component, $componentEl;
            // 받아들일 수 없는 컴포넌트이면 처리 안함
            if (!this.sortCheckAcceptComponent(event, ui)) {
                this.revertUnacceptableComponent(event, ui);
                return;
            }

            if (this.isComponentTypeElement(ui.item)) {
                var componentType = ui.item.data('component-type');
                component = this.createComponent(componentType, this.getCid());

                if (!component) {
                    return;
                }

                var componentView = this.getComponentView(component);
                this.$('.' + constants.CN_COMPONENT_TYPE).replaceWith(componentView.el);
                componentView.renderNode();
                $componentEl = componentView.$el;
            } else {
                component = ComponentManager.getComponent(ui.item.data('cid'));
                $componentEl = ui.item;
            }

            // multiple 체크
            component.setMultiple(true);

            // 외부에서 들어왔을 대만 <td>를 씌워준다.
            wrapTableData($componentEl);
            this._removeDropPlaceholder();
            this.orderComponent(component);
        },

        /**
         * @Override
         */
        sortRemove: function (event, ui) {
            if (!this.sortCheckAcceptComponent(event, ui)) {
                this.revertUnacceptableComponent(event, ui);
            } else {
                var component = ContainableFormView.prototype.sortRemove.apply(this, arguments);
                component.setMultiple(false);
                ui.item.replaceWith(this.getComponentView(component).el);
            }
        },

        /**
         * @Override
         */
        afterRemoveComponent: function (component) {
            var _comp = ContainableFormView.prototype.afterRemoveComponent.apply(this, arguments);

            if (this.$('td[data-cid=' + _comp.getCid() + ']:empty').length > 0) {
                this.$('td[data-cid=' + _comp.getCid() + ']:empty').remove();
            }

            this._addDropPlaceholder();
        },

        /**
         * [IE8]DropPlaceholder 추가
         * IE8에서 <tr>이 영역이 잡히지 않기 때문에 임의의 영역을 잡아주기 위한 <td> 추가
         */
        _addDropPlaceholder: function () {
            if (!isIE8()) {
                return;
            }

            if (this.getComponents().length > 0) {
                return;
            }

            if (this.$('.drop-placeholder').length > 0) {
                return;
            }

            var $placeholder = $('<td class="drop-placeholder"></td>');
            this.getContainerEl().append($placeholder);
        },

        /**
         * [IE8]DropPlaceholder 삭제
         */
        _removeDropPlaceholder: function () {
            this.$('.drop-placeholder').remove();
        },

        _appendButtons: function ($container) {
            if (this.isEditable()) {
                return;
            }

            var $buttons = $container.find('.table-buttons');
            if (isTableRowAddable($container)) {
                if (!$buttons.length) {
                    $container.find('td[data-blank]').remove();
                    $buttons = $(renderButtonsTpl({
                        lang: lang
                    }));
                }
            } else {
                var $blankEls = $container.find('td[data-blank]');
                if (!$blankEls.length && !$buttons.length) $buttons = '<td data-blank>&nbsp;</td>';
            }

            $container.append($buttons);
        },

        _addTableRow: function (e) {
            e.preventDefault();

            var $target = $(e.currentTarget);
            var $currTr = $target.closest('tr');
            var index = $currTr.index();
            var components = this.getComponents();
            var $newTr = createTableRowEl(components);

            _.each(components, function (childNode) {
                var childComponent = ComponentManager.getComponent(childNode.cid);
                var childView = childComponent.getView();
                var cloneView = childView.createMultipleView({}, index);

                if (cloneView) {
                    appendComponentViewToTable.call(this, $newTr, cloneView);
                }
            }, this);
            this._appendButtons($newTr);

            $currTr.after($newTr);
            $newTr.find('[data-el-masking]').toggle();

            return false;
        },

        _removeTableRow: function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            var $tr = $target.closest('tr');
            var $table = $target.closest('table[data-cid=' + this.getCid() + ']');
            var components = this.getComponents();
            var childViewIds = _.map($tr.find('[data-id]'), function (el) {
                return $(el).attr('data-id');
            });

            _.each(components, function (childNode, index) {
                var childComponent = ComponentManager.getComponent(childNode.cid);
                var childView = childComponent.getView();
                childView.removeMultipleView(childViewIds[index]);
            });

            if ($table.find('tr').length > 1) {
                $tr.remove();
            } else {
                $.goAlert(commonLang['삭제할 수 없습니다.']);
            }

            return false;
        },

        /**
         * extended method
         * @param data
         * @private
         */
        _onChangeDisplay: function (data) {
            this.$('td[data-cid=' + data.cid + ']').toggle(data.flag);
            var $tr = this.$('tr[data-cloneable="N"]');
            var flag = false;
            _.each($tr.find('td:has(div)'), function (element) {
                if ($(element).css('display') !== 'none') {
                    flag = true;
                    return false;
                }
            });
            $tr.toggle(flag);
        }
    });

    var DetailView = BaseDetailView.extend({
        initialize: function (options) {
            BaseDetailView.prototype.initialize.apply(this, arguments);
            this.$el.addClass('table');
        },
        render: function () {
            this.$body.addClass('table_box');
            this.$body.html(detailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                clientId: this.getCid()
            }));
        },

        getContainerEl: function () {
            return this.$('.table-container');
        },

        appendChildView: function (childView) {
            addChildViews.call(this, childView);
        }
    });

    function getMaxRow(components, appletDocModel) {
        var maxRow = 1;
        _.each(components, function (component) {
            if (this.clientId == component.cid) {
                return;
            }
            var values = appletDocModel.get(component.cid);
            if (values && _.isArray(values) && (maxRow < values.length)) {
                maxRow = values.length;
            }
        }, this);
        return maxRow;
    }

    var OptionView = BaseOptionView.extend({
        renderBody: function () {
            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON()
            }));
        }
    });

    var TableComponent = FormComponent.define(ComponentType.Table, {
        name: worksLang['테이블 영역'],
        group: 'basic',
        acceptComponent: [ComponentType.Text, ComponentType.Number, ComponentType.Date, ComponentType.Time, ComponentType.Datetime, ComponentType.Select],

        properties: {
            "label": {defaultValue: lang.tableName},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView,
        initialize: function () {
            this.getMaxRow = function () {
                if (this.maxRow > 1) {
                    return this.maxRow;
                }
                this.maxRow = getMaxRow(this.components, this.getAppletDocModel());
                return this.maxRow;
            }
        }
    });

    Registry.addComponent(TableComponent);
});
