define('works/components/formbuilder/core/views/component_list', function (require) {
    var Backbone = require('backbone');
    var FBToolboxPaneView = require('works/components/formbuilder/core/views/toolbox_pane');
    var ComponentType = require('works/component_type');
    var Registry = require('works/components/formbuilder/core/component_registry');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var renderToolboxItem = require('hgn!works/components/formbuilder/core/templates/toolbox_list_item');
    var constants = require('works/components/formbuilder/constants');

    var worksLang = require('i18n!works/nls/works');

    require('jquery.ui');
    require('jquery.go-popup');

    var FBComponentListView = FBToolboxPaneView.extend({
        className: 'builder_side_box',

        title: worksLang['컴포넌트'],
        useResizer: false,
        titleWrapClassname: 'title_tool_edit',
        contentWrapClassname: 'tool_edit',

        initialize: function (options) {
            options = options || {};
            FBToolboxPaneView.prototype.initialize.apply(this, arguments);
            this._renderListContainer('basic');
            this._renderListContainerTitle('basic');
        },

        render: function () {
            // 컴포넌트 순서를 유지하기 위해 ComponentType을 이용한다.
            _.each(ComponentType, function (componentType) {

                var Component = Registry.findByType(componentType);

                if (!Component || Component.handlerable === false) {
                    return;
                }

                var group = Component.group;
                if (this.$('.component-group-' + group).length < 1) {
                    this._renderListContainer(group);
                    this._renderListContainerTitle(group);
                }

                this.$('.component-group-' + group).append(renderToolboxItem({
                    className: constants.CN_COMPONENT + ' ' + constants.CN_COMPONENT_TYPE,
                    componentType: Component.type,
                    // name이 안먹힌다...
                    label: Component.cname
                }));
            }, this);

            this._initDraggable();
            this.toggleArrow(false);
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
            } else {
                this.$('.' + this.titleWrapClassname).addClass('off');
            }
            if (bool) {
                this.observer.trigger(constants.EVENT_FOLD_COMPONENT_PANNEL);
            }
        },

        /**
         * @Override
         */
        getMarginHeight: function () {
            var marginHeight = 30;
            return this.$('.toolbox-title').outerHeight() + marginHeight;
        },

        _renderListContainerTitle: function (group) {
            var title = '';
            if (group == 'basic') title = worksLang['데이터 컴포넌트'];
            else if (group == 'design') title = worksLang['디자인 컴포넌트'];
            else if (group == 'extra') title = worksLang['고급 컴포넌트'];

            this.$('.component-group-' + group).append('<li class="tit"><div class="attr_title"><label>' + title + '</label></div></li>');

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

        _initDraggable: function () {
            var self = this;
            var $target = this.$('.component-list .' + constants.CN_COMPONENT_TYPE);
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
        }
    });

    function getComponentKlass(target) {
        var componentType = $(target).data('component-type');
        return ComponentManager.getComponentClass(componentType);
    }

    return FBComponentListView;
});
