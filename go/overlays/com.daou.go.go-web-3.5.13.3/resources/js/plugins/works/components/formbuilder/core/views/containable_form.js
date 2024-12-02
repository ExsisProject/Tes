define('works/components/formbuilder/core/views/containable_form', function (require) {

    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var constants = require('works/components/formbuilder/constants');

    var SELECTOR_CONTAINABLE = '.' + constants.CN_CONTAINABLE;

    require('jquery.ui');
    require('jquery.go-popup');

    return BaseFormView.extend({
        initialize: function () {
            BaseFormView.prototype.initialize.apply(this, arguments);

            if (this.isEditable() && this.observer) {
                this.listenTo(this.observer, constants.REQ_REMOVE_COMPONENT, this.afterRemoveComponent);
                this.listenTo(this.observer, constants.EVENT_CLEAR_COMPONENT_SELECTED, this.afterClearComponentSelected);
            }
        },

        afterRender: function () {
            BaseFormView.prototype.afterRender.apply(this, arguments);

            if (this.isEditable()) {
                this.bindDnDEvents(this.getContainerEl());
            }
        },

        getContainerEl: function () {
            return this.$el;
        },

        /**
         * @Override
         */
        appendChildView: function (childView) {
            this.getContainerEl().append(childView.el);
        },

        /**
         * 컴포넌트 DnD(Drag&Drap + Sortable) 이벤트 바인딩
         * 필요에 따라 이 함수를 오버라이드해서 각 컴포넌트의 DnD 이벤트 처리할 수 있음
         * 기본은 sortable만 적용됨
         */
        bindDnDEvents: function (target) {
            $(target).sortable({
                items: _.result(this, 'sortItems'),
                placeholder: _.result(this, 'sortPlaceholder'),
                connectWith: _.result(this, 'sortConnectWith'),
                appendTo: _.result(this, 'sortAppendTo'),
                forceHelperSize: _.result(this, 'sortForceHelperSize'),
                tolerance: _.result(this, 'sortTolerance'),
                cursorAt: _.result(this, 'sortCursorAt'),

                helper: _.bind(this.sortHelper, this),
                start: _.bind(this.sortStart, this),
                stop: _.bind(this.sortStop, this),
                receive: _.bind(this.sortReceive, this),
                remove: _.bind(this.sortRemove, this),
                change: _.bind(this.sortChange, this),
                sort: _.bind(this.sortSort, this),
                out: _.bind(this.sortOut, this),
                activate: _.bind(this.sortActivate, this),
                deactivate: _.bind(this.sortDeactivate, this)
            });
        },

        isComponentTypeElement: function ($target) {
            return $target.is('.' + constants.CN_COMPONENT_TYPE);
        },

        getChildElements: function () {
            return this.getContainerEl().find('> .' + constants.CN_COMPONENT);
        },

        getComponentElementPosition: function (component) {
            var position = -1;
            var $moving = this.getComponentView(component).$el;

            this.getChildElements().each(function (i, el) {
                if ($(el).data('cid') === $moving.data('cid')) {
                    position = i;
                }
            });

            return position;
        },

        getOriginalPosition: function (component) {
            var position = -1;
            _.each(this.getComponents(), function (childNode, i) {
                if (childNode.cid === component.getCid()) {
                    position = i
                }
            });

            return position;
        },

        orderComponent: function (component) {
            var position = this.getComponentElementPosition(component);

            this.removeComponentItem(component);

            // 다른 connected list로 전달된 경우는 처리하지 않는다.
            if (position > -1) {
                this.addComponentItem(component, position);
                component.setParentCid(this.getCid());
                this.observer.trigger(constants.REQ_ORDER_COMPOMENT, component, position);
            }
        },

        /**
         * 뷰가 가지고 있는 components 배열에서 해당 컴포넌트를 삭제
         *
         * [comments]
         * removeComponentItem, addComponentItem, isChildComponentItem는 좀 이상한 구조. 리팩토링이 필요함.
         * 최종 저장시에는 AppletFormModel의 데이터를 서버로 전송하므로 문제없지만,
         * 각 컴포넌트 뷰도 하위노드를 가지고 있는지를 보기 위해 components를 가지고 있어서
         * 데이터의 일관성을 위해서 동기화하기 위해 수행함.
         */
        removeComponentItem: function (component) {
            if (this.getComponents().length > 0 && this.isChildComponentItem(component)) {
                this.components.splice(this.getOriginalPosition(component), 1);
            }
        },

        /**
         * 뷰가 가지고 있는 components 배열에 해당 컴포넌트를 추가
         */
        addComponentItem: function (component, position) {
            this.components.splice(position, 0, component.toJSON());
        },

        isChildComponentItem: function (component) {
            var _comp;
            if (_.isString(component)) {
                _comp = ComponentManager.getComponent(component);
            } else if (_.isObject(component)) {
                _comp = component
            } else {
                throw new Error('Illegal Usage');
            }

            return _.filter(this.getComponents(), function (child) {
                return child.cid === _comp.getCid();
            }).length > 0;
        },

        afterRemoveComponent: function (component) {
            var _comp;
            if (_.isString(component)) {
                _comp = ComponentManager.getComponent(component);
            } else if (_.isObject(component)) {
                _comp = component
            } else {
                throw new Error('Illegal Usage');
            }

            this.removeComponentItem(_comp);

            return _comp;
        },

        afterClearComponentSelected: function () {
            resetComponentCondition.call(this);

            function resetComponentCondition() {
                _.each(this.getComponents(), function (component) {
                    var com = ComponentManager.getComponent(component.cid);
                    var optionView = com.getOptionView();
                    optionView._initConditions();
                });
            }
        },


        /**
         * 아래는 sortable의 각종 옵션을 재사용하기 위한 프로퍼티들이다.
         * [주의] 이벤트함수 내에서 this는 ContainableFormView 객체를 가리킨다.
         */
        sortItems: '> .' + constants.CN_COMPONENT + ':not(.unsortable)',
        sortPlaceholder: constants.CN_PLACEHOLDER,
        sortConnectWith: SELECTOR_CONTAINABLE,
        sortAppendTo: document.body,
        sortForceHelperSize: true,
        sortTolerance: 'pointer',
        //sortTolerance: 'intersect',
        sortCursorAt: {left: 20},
        sortHelper: function (event, $el) {
            var component = ComponentManager.getComponent($el.data('cid'));
            var propsModel = component.getComponentPropertyModel();
            return ComponentManager.createDragHelper(propsModel.get('name') || component.getComponentName());
        },
        sortActivate: function (event, ui) {
            // 여기서는 아무것도 하지 않는다.
        },
        sortDeactivate: function (event, ui) {
            // 여기서는 아무것도 하지 않는다.
        },
        sortStart: function (event, ui) {
            // 헬퍼 사이즈 강제해 주지 않으면 난리난다...
            ui.helper.outerWidth(ui.helper.data('width'));
            ui.helper.outerHeight(ui.helper.data('height'));

            if (this.isComponentTypeElement(ui.item)) {
                return;
            }

            var cid = ui.item.data('cid');
            var component = ComponentManager.getComponent(cid);
            this.observer.trigger(constants.EVENT_START_SORTING, component.getType());
            return component;
        },
        /**
         * sorting이 완료되었을 때 실행된다.
         * 주의할 건, 다른 connected list에 엘리먼트가 전달되었을 경우, 대상 리스트에는 receive가,
         * 원본 리스트에선 stop 이벤트가 실행된다.
         */
        sortStop: function (event, ui) {
            var component;
            var item = ui.item;
            var itemCid = item.data('cid');

            if (this.isComponentTypeElement(item)) {
                var componentType = item.data('component-type');
                if (itemCid) {
                    var sourceComponent = ComponentManager.getMainFormComponent(itemCid);
                    component = ComponentManager.addComponent(sourceComponent, true);
                    this.initChildComponent(component);
                } else {
                    component = this.createComponent(componentType, this.getCid());
                }
                if (!component) {
                    return;
                }

                var componentView = this.getComponentView(component);
                this.$('.' + constants.CN_COMPONENT_TYPE).replaceWith(componentView.el);
                componentView.renderNode();
            } else {
                component = ComponentManager.getComponent(itemCid);
            }

            this.orderComponent(component);
            this.observer.trigger(constants.EVENT_STOP_SORTING);
            return component;
        },
        /**
         * 다른 connected list(draggable 포함)에서 엘리먼트가 전달되엇을 경우 이 이벤트가 실행된다.
         */
        sortReceive: function (event, ui) {
            var component;

            // 받아들일 수 없는 컴포넌트이면 처리 안함
            if (!this.sortCheckAcceptComponent(event, ui)) {
                this.revertUnacceptableComponent(event, ui);
                return;
            }

            // 새로 추가되는 컴포넌트는 stop 이벤트에서 처리
            if (this.isComponentTypeElement(ui.item)) {
                return;
            }

            component = ComponentManager.getComponent(ui.item.data('cid'));
            this.orderComponent(component);
            return component;
        },
        sortRemove: function (event, ui) {
            var component = ComponentManager.getComponent(ui.item.data('cid'));
            this.observer.trigger(constants.REQ_REMOVE_COMPONENT, component, true);
            return component;
        },
        /**
         * sort와 change는 받아들일 수 없는 컴포넌트에 대한 helper의 스타일을 변경하기 위해 사용한다.
         * 대부분은 chanage 이벤트로 해결이 되나 sortable 아이템이 드래그가 시작되고 받아들일수 없는 컴포넌트 내에
         * 위치해있으나 change 이벤트를 일으키지 않는 경우가 있어서 sort이벤트를 이용한다.
         */
        sortChange: function (event, ui) {
            this.sortChangeHelperAndPlaceholderStyle(event, ui);
        },

        sortSort: function (event, ui) {
            this.sortChangeHelperAndPlaceholderStyle(event, ui);
        },

        sortOut: function (event, ui) {
            if (ui && ui.helper) {
                ui.helper.removeClass('err_type');
                ui.helper.find('.icon-helper').removeClass('ic_err');
            }
            if (ui && ui.placeholder) {
                ui.placeholder.show();
            }
        },

        /**
         * sortable의 옵션은 아니지만, 이벤트내에서 공통으로 처리해야 하는 함수들.
         *
         * containable 컴포넌트인 경우 포함할 수 있는 컴포넌트가 들어오는지 체크
         */
        sortCheckAcceptComponent: function (event, ui) {
            var component = ComponentManager.getComponent(this.getCid());
            var componentType, acceptComponent, acceptable;
            var sourceComponentId = ui.item.data('cid'); // 팔레트에서 꺼낸 컴포넌트는 폼에 내려놓기 전까지 cid 가 없다.
            var sourceComponent = ComponentManager.getComponent(sourceComponentId);
            if (this.isComponentTypeElement(ui.item)) {
                componentType = ui.item.data('component-type');
            } else {
                componentType = sourceComponent.getType();
            }

            /**
             * (이미 저장된 컴포넌트 && table <-> canvas 간 이동) 을 못하도록 막아야 한다.
             * 팔레트에서 폼에 내려 놓기 전까지 아이디는 부여되지 않는다.
             * isNew 메소드로 체크 안됨. 아이디가 없으면 isNew true 라고 봐야함.
             *
             * Case
             * 1. 새 컴포넌트 : pass
             * 2, 기존 컴포넌트 && table <-> table : pass
             * 3. 기존 컴포넌트 && canvas <-> canvas : pass
             * 4. 기존 컴포넌트 && canvas <-> table : fail
             * # 2, 3, 4 를 정리하면 source 와 target 이 서로 다르고 둘 중 하나가 테이블이면 fail. 이경우가 아니라면 pass
             *
             * Test Case
             * 팔레트 -> 캔버스 -> 테이블 -> 캔버스 : 가능
             * 팔레트 -> 테이블 -> 캔버스 : 가능
             * 테이블 -> 테이블 : 가능
             * (이미 저장된 컴포넌트)캔버스 -> 테이블 : 불가능
             * (이미 저장된 컴포넌트)테이블 -> 캔버스 : 불가능
             *
             * # containable : 다른 컴포넌트를 담을 수 있음
             * sourceComponentParentType : 해당 컴포넌트의 이동하기 전 containable 컴포넌트의 parent type
             * targetComponent : 해당 컴포넌트가 이동하려는 곳의 containable 컴포넌트
             */
            var $currentEl = $('[data-cid=' + sourceComponentId + ']');
            var targetComponentCid = ui.placeholder.closest('[data-cid]').attr('data-cid') || ui.item.parent().closest('[data-cid]').attr('data-cid') || $currentEl.parent().closest('[data-cid]').attr('data-cid');
            var targetComponent = ComponentManager.getComponent(targetComponentCid);
            var sourceComponentParentType = sourceComponent ? ComponentManager.getComponent(sourceComponent.parentCid).type : null; // 팔레트에서 꺼낸 컴포넌트는 폼에 내려놓기 전까지 매니저가 관리 하지 않는다.
            var targetComponentType = targetComponent ? targetComponent.type : null; // placeholder 가 사라진 후엔 targetComponent 가 어디인지 찾을 수 없다.
            var isNew = sourceComponentId ? ComponentManager.isNew(sourceComponentId) : true; // 컴포넌트매니저가 관리하지 않는 컴포넌트(팔레트에서 꺼내 폼에 내려지지 않은) 는 새로운 컴포넌트이다.
            //console.log('componentType: ' + component.type + ' / sourceComponentParentType: ' + sourceComponentParentType + ' / targetComponentType: ' + targetComponentType);
            var isMoveBetweenTablesAndCanvasOfExistComponent = function () {
                if (isNew) return false; // 새 컴포넌트는 무조건 pass
                var eitherTable = sourceComponentParentType === 'table' || targetComponentType === 'table';
                var differentEachOther = sourceComponentParentType != targetComponentType;
                return differentEachOther && eitherTable;
            };
            if (isMoveBetweenTablesAndCanvasOfExistComponent()) return false;
            var bothTableOrColumn = sourceComponent && targetComponent
                && (sourceComponent.type === 'table' || sourceComponent.type === 'columns') // source 일땐 columns
                && (targetComponent.type === 'table' || targetComponent.type === 'column'); // target 일땐 column
            if (bothTableOrColumn) return false;

            // acceptComponent 가 정의되지 않거나 null 이면 모든 컴포넌트 허용
            if (component.acceptComponent) {
                acceptComponent = _.isArray(component.acceptComponent) ? component.acceptComponent : [component.acceptComponent];
            } else {
                return true;
            }

            // acceptComponent 가 정의가 되어 있으면 해당 규칙을 통과하였는지 여부를 체크한다.
            // 기본 값은 통과시키지 않음(false)
            acceptable = _.filter(acceptComponent, function (expression) {
                if (expression[0] === '!' && expression !== '!' + componentType) {
                    return true;
                }

                return expression === componentType;
            });

            return acceptable.length > 0;
        },
        /**
         * containable 컴포넌트인 경우 포함할 수 없는 컴포넌트가 들어왔을때 원위치 시킴(sortable 객체만 해당)
         */
        revertUnacceptableComponent: function (event, ui) {
            this.$('.' + constants.CN_COMPONENT_TYPE).remove();

            if (!this.isComponentTypeElement(ui.item)) {
                var target = ui.sender || event.target;
                $(target).sortable('cancel');
            }
        },
        sortChangeHelperAndPlaceholderStyle: function (event, ui) {
            var accept = this.sortCheckAcceptComponent(event, ui);
            ui.helper.toggleClass('err_type', !accept);
            ui.helper.find('.icon-helper').toggleClass('ic_err', !accept);
            ui.placeholder.toggle(accept);
        }
    });
});
