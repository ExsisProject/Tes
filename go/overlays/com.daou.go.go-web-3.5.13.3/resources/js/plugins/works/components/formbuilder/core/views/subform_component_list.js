define('works/components/formbuilder/core/views/subform_component_list', function (require) {
    var Backbone = require('backbone');
    var ComponentType = require('works/component_type');
    var Registry = require('works/components/formbuilder/core/component_registry');
    var constants = require('works/components/formbuilder/constants');
    var ModelApdaters = require('works/components/formbuilder/core/models/adapters');
    var DesignComponentType = require('works/constants/design_component_type');

    var FBToolboxPaneView = require('works/components/formbuilder/core/views/toolbox_pane');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var renderToolboxItem = require('hgn!works/components/formbuilder/core/templates/toolbox_form_component_item');
    var renderDesignItem = require('hgn!works/components/formbuilder/core/templates/toolbox_list_item');

    var worksLang = require('i18n!works/nls/works');
    var commonLang = require("i18n!nls/commons");

    require('jquery.ui');
    require('jquery.go-popup');

    var FBSubFormComponentListView = FBToolboxPaneView.extend({
        className: 'builder_side_box',

        title: worksLang['컴포넌트'],
        useResizer: false,
        titleWrapClassname: 'title_tool_edit',
        contentWrapClassname: 'tool_edit',

        initialize: function (options) {
            options = options || {};
            FBToolboxPaneView.prototype.initialize.apply(this, arguments);

            this.mainFormModel = options.mainFormModel.toJSON();
            this.mainFormComponents = [];
            this.tableComponentCids = [];
            this.canvasCid = this.mainFormModel.data.cid;

            this._renderListContainer('basic');
            this._renderListContainerTitle('basic');
        },

        render: function () {
            this._renderComponents(ModelApdaters.toAppletFormModel(this.mainFormModel).get('components'));

            this._renderListContainer('design');
            this._renderListContainerTitle('design');

            this._renderDesignComponents();

            this._initDraggable();
            this._initDesignComponentDraggable();

            this.toggleArrow(false);
        },

        _renderListContainerTitle: function (group) {
            var title = '';
            if (group == 'basic') title = worksLang["데이터 컴포넌트"];
            else if (group == 'design') title = worksLang["디자인 컴포넌트"];

            if (group == 'basic') {
                this.$('.component-group-' + group).append('<li class="tit"><div class="attr_title"><label>' + title + '</label>'
                    + '<span class="ic_works ic_help_type1" title="' + commonLang['도움말'] + '"></span>'
                    + '<div class="attr_tooltip" style="display: none;">' + worksLang['하위폼데이터컴포넌트 설명'] + '</div></div></li>');
            } else {
                this.$('.component-group-' + group).append('<li class="tit"><div class="attr_title"><label>' + title + '</label></div></li>');
            }
        },

        _renderComponents: function (components, depth) {
            var self = this;
            var depth = depth || 0;
            _.each(components, function (component) {
                if (!component.emptyChildrenComponent) {
                    self._renderComponentItem(component, depth);
                    self._renderComponents(component.components,
                        component.type == ComponentType.Column ? depth : depth + 1);
                } else {
                    self._renderComponentItem(component, depth);
                }
            });
        },

        _renderComponentItem: function (component, depth) {
            if (component.type == 'column') return;

            var notDraggable = false;
            var isChildComponent = false;
            this.mainFormComponents.push(component);

            if (component.type == 'table') {
                this.tableComponentCids.push(component.cid);
            }

            var className = constants.CN_COMPONENT + ' ' + constants.CN_COMPONENT_TYPE;

            if (_.contains(this.tableComponentCids, component.parentCid)) {
                className = constants.CN_COMPONENT;
                notDraggable = true;
            }

            if (component.parentCid != this.canvasCid) {
                className += ' child-component';
                isChildComponent = true;
            }

            var self = this;
            var liClassName = isChildComponent ? "sub_depth_" + depth : "";
            if (notDraggable) {
                liClassName += _.isEmpty(liClassName) ? "disabled" : " disabled";
            }

            this.$('.component-group-basic').append(renderToolboxItem({
                liClassName: liClassName,
                className: className,
                cid: component.cid,
                componentType: component.type,
                label: self._getComponentName(component),
                notDraggable: notDraggable,
                isChildComponent: isChildComponent,
            }));
        },

        _renderListContainer: function (group) {
            var searchClass = 'component-list';
            var $newEl = $('<ul class="' + searchClass + '"></ul>');
            var divider = null;

            $newEl.addClass('component-group-' + group);

            if (this.$('.' + searchClass).length > 0) {
                divider = '<i class="tool_edit_line"></i>';
            }

            this.$('.toolbox-content').append(divider, $newEl);
            return $newEl;
        },

        _renderDesignComponents: function () {
            _.each(DesignComponentType.DESIGN_TYPE, function (componentType) {
                var Component = Registry.findByType(componentType);

                if (!Component || Component.handlerable === false) {
                    return;
                }

                var group = Component.group;
                if (this.$('.component-group-design').length < 1) {
                    this._renderListContainer(group);
                }
                this.$('.component-group-design').append(renderDesignItem({
                    className: constants.CN_COMPONENT + ' ' + constants.CN_COMPONENT_TYPE,
                    componentType: Component.type,
                    // name이 안먹힌다...
                    label: Component.cname
                }));
            }, this);
        },

        _initDraggable: function () {
            var self = this;
            var $target = this.$('.component-group-basic .' + constants.CN_COMPONENT_TYPE);
            var conntectToSortable = '.' + constants.CN_CONTAINABLE;

            $target.draggable({
                appendTo: 'body',
                connectToSortable: conntectToSortable,
                helper: function (e, ui) {
                    var targetEl = $(e.currentTarget);
                    var cid = targetEl.attr('data-cid');
                    var name = targetEl.attr('data-name');
                    var Component = _.find(self.mainFormComponents, function (c) {
                        return c.cid == cid;
                    });
                    $helper = ComponentManager.createDragHelper(name);

                    if (isCreatedComponent(Component)) {
                        $helper.addClass('err_type');
                        $helper.find('.icon-helper').addClass('ic_err');
                    } else {
                        $helper.find('.icon-helper').addClass('ic_' + Component.type);
                    }

                    return $helper;
                },

                start: function (e) {
                    var targetEl = $(e.currentTarget);
                    var cid = targetEl.attr('data-cid');
                    var name = targetEl.attr('data-name');
                    var Component = _.find(self.mainFormComponents, function (c) {
                        return c.cid == cid;
                    });

                    // 드래그가 시작됨을 알린다.
                    self.observer.trigger(constants.EVENT_START_DRAGGING, Component.type);

                    $(this).closest('li').addClass('on');
                    if (isCreatedComponent(Component)) {
                        $.goSlideMessage(GO.i18n(worksLang['폼 컴포넌트 중복 에러메시지'], {"arg1": name}), 'caution');
                        $target.draggable('option', 'connectToSortable', false);
                    }
                },

                stop: function (e) {
                    self.observer.trigger(constants.EVENT_STOP_DRAGGING);

                    $(this).closest('li').removeClass('on');
                    $(this).removeClass(constants.CN_DUPLICATED);

                    if (!$target.draggable('option', 'connectToSortable')) {
                        $target.draggable('option', 'connectToSortable', conntectToSortable);
                    }
                }
            });

            function isCreatedComponent(Component) {
                return Component.cid && ComponentManager.isCreated(Component.cid);
            }
        },

        _initDesignComponentDraggable: function () {
            var self = this;
            var $target = this.$('.component-group-design .' + constants.CN_COMPONENT_TYPE);
            var conntectToSortable = '.' + constants.CN_CONTAINABLE;

            $target.draggable({
                appendTo: 'body',
                connectToSortable: conntectToSortable,
                helper: function (e, ui) {
                    var Component = getComponentKlass(e.currentTarget);
                    var $helper = ComponentManager.createDragHelper(Component.cname);

                    if (isCreatedComponent(Component)) {
                        $helper.addClass('err_type');
                        $helper.find('.icon-helper').addClass('ic_err');
                    } else {
                        $helper.find('.icon-helper').addClass('ic_' + Component.type);
                    }

                    return $helper;
                },

                start: function (e) {
                    var Component = getComponentKlass(e.currentTarget);

                    // 드래그가 시작됨을 알린다.
                    self.observer.trigger(constants.EVENT_START_DRAGGING, Component.type);

                    $(this).closest('li').addClass('on');
                    if (isCreatedComponent(Component)) {
                        $.goSlideMessage(GO.i18n(worksLang['폼 컴포넌트 중복 에러메시지'], {"arg1": Component.cname}), 'caution');
                        $target.draggable('option', 'connectToSortable', false);
                    }
                },

                stop: function (e) {
                    self.observer.trigger(constants.EVENT_STOP_DRAGGING);

                    $(this).closest('li').removeClass('on');
                    $(this).removeClass(constants.CN_DUPLICATED);

                    if (!$target.draggable('option', 'connectToSortable')) {
                        $target.draggable('option', 'connectToSortable', conntectToSortable);
                    }
                }
            });

            function isCreatedComponent(Component) {
                return Component.cid && ComponentManager.isCreated(Component.cid);
            }
        },

        _getComponentName: function (component) {
            if (_.contains(DesignComponentType.NAME_FIXED_TYPE, component.type)) {
                var Component = Registry.findByType(component.type);
                return Component.cname;
            } else {
                return component.properties.label;
            }
        },

        toggleArrow: function (bool) {
            FBToolboxPaneView.prototype.toggleArrow.apply(this, arguments);
        },
        /**
         * @Override
         */
        toggleContent: function (bool) {
            FBToolboxPaneView.prototype.toggleContent.apply(this, arguments);
            if (bool || false) {
                this.$('.' + this.titleWrapClassname).removeClass('off');
                this.observer.trigger(constants.EVENT_FOLD_COMPONENT_PANNEL);
            } else {
                this.$('.' + this.titleWrapClassname).addClass('off');
            }
        },

        /**
         * @Override
         */
        getMarginHeight: function () {
            var marginHeight = 30;
            return this.$('.toolbox-title').outerHeight() + marginHeight;
        }
    });

    function getComponentKlass(target) {
        var componentType = $(target).data('component-type');
        return ComponentManager.getComponentClass(componentType);
    }

    return FBSubFormComponentListView;
});
