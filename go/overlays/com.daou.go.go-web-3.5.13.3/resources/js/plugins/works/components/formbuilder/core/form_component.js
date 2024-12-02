define('works/components/formbuilder/core/form_component', function (require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var GO = require('app');

    var constants = require('works/components/formbuilder/constants');
    var ValueType = require('works/constants/value_type');
    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var ClientIdGenerator = require('works/components/formbuilder/core/cid_generator');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');

    var extend = function (protoProps, staticProps) {
        var parent = this;
        var child;

        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                return parent.apply(this, arguments);
            };
        }

        _.extend(child, parent, staticProps);

        var Surrogate = function () {
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        if (protoProps) _.extend(child.prototype, protoProps);

        child.__super__ = parent.prototype;

        return child;
    };

    /**
     * 컴포넌트 프로퍼티 모델
     * 이 모델은 옵션창과 폼빌더내의 해당 컴포넌트 뷰간의 동기화를 위한 용도로만 사용하고 외부로 노출되지는 않는다.
     */
    var ComponentPropertyModel = Backbone.Model.extend({});

    var capitalize = function (str) {
        return GO.util.initCap(str);
    };

    var FormComponent = (function () {
        var Klass = function (appletId, node) {
            this.appletId = null;
            // components는 반드시 초기화를 해줘야 한다.
            this.components = [];

            this.__formView__ = null;
            this.__detailView__ = null;
            this.__optionView__ = null;
            this.__componentModel__ = null;
            this.__appletDocModel__ = null;
            this.__integrationModel__ = null;
            this.__editable__ = false;
            this.__observer__ = null;
            this.__viewType__ = 'form';
            this.visible = true;
            this.masking = false;

            // 생성자 인자 처리
            // 첫번째 인자가 객체이면 node 정보로 간주하고 처리한다.
            if (_.isObject(appletId)) {
                node = appletId;
            } else if (appletId != null) {
                this.setAppletId(appletId);
            }

            if (node && node.cid) {
                _.extend(this, node);
            } else if (this.cid === null) {
                this.cid = ClientIdGenerator.generate();
            }

            this.getKlass = function () {
                return this.__klass__;
            }

            this.initialize.apply(this, arguments);
        };

        /**
         * Instance Members
         * 인스턴스 멤버들은 컴포넌트가 인스턴스화 되었을 때 필요한 변수와 메소드들을 가지도록 한다.
         */
        _.extend(Klass.prototype, Backbone.Events, {
            type: null,
            name: null,

            cid: null,
            valueType: null,
            parentCid: null,
            visible: true,
            masking: false,
            multiple: false,

            /**
             * 클래스 멤버지만 인스턴스에서도 조회가 빈번한 속성들은 주입한다.
             */
            acceptComponent: null,

            initialize: function () {
            },

            setAppletId: function (appletId) {
                this.appletId = appletId;
            },

            getAppletId: function () {
                return this.appletId;
            },

            setSubFormId: function (subFormId) {
                this.subFormId = subFormId;
            },

            getSubFormId: function () {
                return this.subFormId;
            },

            setEditable: function (bool) {
                this.__editable__ = bool;
            },

            isEditable: function () {
                return this.__editable__;
            },

            attachObserver: function (observer) {
                this.__observer__ = observer;
            },

            getObserver: function () {
                return this.__observer__;
            },

            /**
             * 자식 컴포넌트 추가
             */
            addChildren: function (component) {
                if (this.components === null) {
                    this.components = [];
                }
                this.components.push(component);
            },

            removeChildren: function (component) {
                if (this.components === null) {
                    this.components = [];
                }
                var removeCid = component.cid;
                this.components = _.filter(this.components, function (currentComponent) {
                    return currentComponent.cid != removeCid;
                })
            },

            /**
             * addChildren의 alias
             */
            addComponent: function (component) {
                return this.addChildren(component);
            },

            removeComponent: function (component) {
                return this.removeChildren(component);
            },

            setIntegrationModel: function (integrationModel) {
                this.__integrationModel__ = integrationModel;

                if (this.__formView__ != null) {
                    this.__formView__.setIntegrationModel(this.__integrationModel__);
                }
                if (this.__detailView__ != null) {
                    this.__detailView__.setIntegrationModel(this.__integrationModel__);
                }
            },

            setAppletDocModel: function (appletDocModel) {
                this.__appletDocModel__ = appletDocModel;

                if (this.__formView__ != null) {
                    this.__formView__.setAppletDocModel(this.__appletDocModel__);
                }
                if (this.__detailView__ != null) {
                    this.__detailView__.setAppletDocModel(this.__appletDocModel__);
                }
            },

            hasChildren: function () {
                if (this.components == null) {
                    return false;
                }

                return _.isArray(this.components) && this.components.length > 0;
            },

            /**
             * 컴포넌트 삭제
             */
            remove: function () {
                if (this.__formView__) {
                    this.__formView__.remove();
                }
                if (this.__optionView__) {
                    this.__optionView__.remove();
                }
                if (this.__detailView__) {
                    this.__detailView__.remove();
                }
                this.__componentModel__ = null;
                this.__cid__ = null;
            },

            validateFormData: function () {
                var formView = this.getFormView();

                try {
                    if (_.isFunction(formView.validate)) {
                        if (formView.isHide()) return true;
                        return formView.validate();
                    }
                } catch (e) {
                    console.log(e.stack);
                    return false;
                }

                return true;
            },

            /**
             * 컴포넌트 타입 반환
             * @return {String}
             */
            getType: function () {
                return this.type;
            },

            /**
             * 컴포넌트 이름 반환
             * @return {String}
             */
            getComponentName: function () {
                return this.name;
            },

            /**
             * valueType 반환
             * @return {String}
             */
            getValueType: function () {
                return this.valueType;
            },

            /**
             * value type 설정
             *
             * @param valueType
             */
            setValueType: function (valueType) {
                var observer = this.getObserver();
                if (_.contains(_.values(ValueType), valueType)) {
                    this.valueType = valueType;
                    if (observer) {
                        observer.trigger(constants.REQ_UPDATE_COMPONENT, this.getCid());
                    }
                } else {
                    throw new Error('Invalid Value Type');
                }
            },

            /**
             * cid를 반환
             * @return {String} cid
             */
            getCid: function () {
                return this.cid;
            },

            getViewType: function () {
                return this.__viewType__;
            },

            setViewType: function (viewType) {
                this.__viewType__ = viewType;
            },

            getView: function (isNew) {
                return this['get' + capitalize(this.getViewType()) + 'View'](isNew);
            },


            /**
             * @deprecated
             * 부모 cid를 설정
             */
            setParentCid: function (parentCid) {
                this.parentCid = parentCid;
            },

            /**
             * 부모 Cid를 반환
             * @return {String} cid
             */
            getParentCid: function () {
                return this.parentCid;
            },

            getParentComponent: function () {
                return ComponentManager.getComponent(this.getParentCid());
            },

            /**
             * 하위 컴포넌트들을 반환
             * @return {Array}
             */
            getChildren: function () {
                return this.components;
            },

            /**
             * @deprecated
             *
             * FormView의 인스턴스를 반환(Lazy)
             * @returns {FormView}
             */
            getFormView: function (isNew) {
                isNew = isNew || false;

                if (isNew) {
                    return new this.__formViewKlass__(this._subViewOptions(isNew));
                }

                if (this.__formView__ === null) {
                    // 몇몇 옵션은 시스템에서 부여해야 하므로 설정하지 못하게 한다.
                    this.__formView__ = new this.__formViewKlass__(this._subViewOptions());
                }

                return this.__formView__;
            },

            /**
             * OptionView의 인스턴스를 반환(Lazy)
             * @returns {OptionView}
             */
            getOptionView: function (isNew) {
                isNew = isNew || false;

                if (isNew) {
                    return new this.__optionViewKlass__(this._subViewOptions(isNew));
                }

                if (this.__optionView__ === null) {
                    this.__optionView__ = new this.__optionViewKlass__(this._subViewOptions());
                }

                return this.__optionView__;
            },

            /**
             * DetailView의 인스턴스를 반환(Lazy)
             * @returns {DetailView}
             */
            getDetailView: function (isNew) {
                isNew = isNew || false;

                if (isNew) {
                    return new this.__detailViewKlass__(this._subViewOptions(isNew));
                }

                if (this.__detailView__ === null) {
                    this.__detailView__ = new this.__detailViewKlass__(this._subViewOptions());
                }

                return this.__detailView__;
            },

            /**
             * getComponentPropertyModel의 인스턴스를 반환(lazy)
             * @param attrs
             * @returns {ComponentModel}
             */
            getComponentPropertyModel: function (isNew) {
                // 강제로 새 객체를 요구할때 새로 복사해서 바로 반환
                // [GO-17679] 폼 컴포넌트 > 드롭박스 컴포넌트의 옵션이 다른 드롭박스 객체의 옵션에 영향을 미치는 현상
                if (isNew || false) {
                    return createComponentPropModel(this.properties);
                }

                if (!this.__componentModel__) {
                    this.__componentModel__ = createComponentPropModel(this.properties);
                    this.__componentModel__.on('remove', this.remove, this);
                }

                return this.__componentModel__;

                function createComponentPropModel(prop) {
                    // 컴포넌트 개별 인스턴스가 properties의 변경에 영향을 받지 않도록 deep copy후 모델을 생성해야한다.
                    return new ComponentPropertyModel(_clone(prop, true));
                }
            },

            /**
             * @deprecated
             * Use getComponentPropertyModel
             */
            getComponentModel: function () {
                return this.getComponentPropertyModel();
            },

            getAppletDocModel: function () {
                return this.__appletDocModel__;
            },

            getIntegrationModel: function () {
                return this.__integrationModel__;
            },

            getFormData: function () {
                var formView = this.getFormView();
                if (formView instanceof BaseFormView) {
                    ;
                } else {
                    return null;
                }

                var formData = formView.getFormData();
                if (formData) {
                    return _.pick(formData, this.getCid());
                }

                return null;
            },

            isMultiple: function () {
                return this.multiple;
            },

            setMultiple: function (bool) {
                this.multiple = bool;
                if (this.__formView__ != null) {
                    this.__formView__.setMultiple(this.multiple);
                }
                if (this.__detailView__ != null) {
                    this.__detailView__.setMultiple(this.multiple);
                }
            },

            /**
             * @deprecated(후보)
             */
            toJSON: function () {
                return {
                    type: this.getType(),
                    cid: this.getCid(),
                    valueType: this.getValueType(),
                    multiple: this.isMultiple(),
                    parentCid: this.getParentCid(),
                    properties: this.getComponentPropertyModel().toJSON(),
                    components: this.getChildren()
                }
            },

            setProperties: function (properties) {
                this.properties = properties;
            },

            setVisible: function (flag) {
                this.visible = flag;
            },

            getVisible: function () {
                return this.visible;
            },

            isMasking: function () {
                return this.masking;
            },

            setMasking: function (masking) {
                this.masking = masking;
            },

            isShow: function () {
                if (!this.getVisible()) {
                    return false;
                }

                var parentComponent = this.getParentComponent();
                if (!parentComponent) return true;

                return this.getParentComponent().isShow();
            },

            isHide: function () {
                return !this.isShow();
            },

            setDefaultValue: function () {
                var view = this.getView();
                view.setDefaultValue();
                //console.log(view);
            },

            trigger: function (type) {
                type = type || 'instance';
                var appletDocModel = this.getAppletDocModel();
                var observer = this.getObserver();
                var componentManager = ComponentManager.getInstance(type);
                //if (appletDocModel.id) observer.trigger('sync:AppletDoc', appletDocModel);
                var components = componentManager.getComponents();
                _.each(components, function (component) {
                    if (component.isShow()) {
                        var cid = component.getCid();
                        var value = component.getAppletDocModel().get(cid);
                        observer.trigger('changeValue', {cid: cid, value: value});
                    }
                });
            },

            _subViewOptions: function (isNew) {
                return {
                    type: this.getType(),
                    appletId: this.getAppletId(),
                    subFormId: this.getSubFormId(),
                    // Backbone.View 내부에서 cid를 사용하고 있음.
                    clientId: this.getCid(),
                    parentCid: this.getParentCid(),
                    // deepCopy본을 전달하여 원본에 영향을 미치지 않도록 한다.
                    components: GO.util.clone(this.getChildren(), true),
                    model: this.getComponentPropertyModel(isNew),
                    // 복사본을 사용하여 원본이 수정되는 일이 없도록 한다.
                    appletDocModel: this.getAppletDocModel(),
                    integrationModel: this.getIntegrationModel(),
                    editable: this.isEditable(),
                    multiple: this.isMultiple(),
                    // 폼뷰에서만 쓰는 것이긴 한데, 우선 공통으로 붙여놓자..
                    observer: this.__observer__
                };
            }
        });

        function _clone(obj, deep) {
            return GO.util.clone(obj, deep);
        };

        /**
         * Static Memebers
         * 클래스 멤버들은 컴포넌트 정의시 필요한 변수와 메소드들을 가지도록 한다.
         */
        Klass.type = null;
        Klass.group = 'basic';
        Klass.handlerable = true;
        Klass.acceptComponent = null;
        Klass.OptionView = null;
        Klass.FormView = null;
        Klass.DetailView = null;

        /**
         * 컴포넌트 정의
         * @param componentType string 컴포넌트 타입(필수)
         * @param definition {Object} 컴포넌트 정의 오브젝트
         * @returns {Error}
         */
        Klass.define = function (componentType, definition) {
            definition = definition || {};

            if (!componentType) {
                return new Error('컴포넌트 타입이 정의되어야 합니다.');
            }

            _.defaults(definition, {
                cid: null,
                type: componentType,
                group: 'basic',
                handlerable: true,
                acceptComponent: null
            });

            function makeComponentProp(defProps) {
                var compProp = {};

                _.each(defProps, function (prop, key) {
                    if (_.isObject(prop) && prop.hasOwnProperty('defaultValue')) {
                        compProp[key] = _clone(prop.defaultValue, true);
                    } else {
                        compProp[key] = prop;
                    }
                });

                return compProp;
            }

            return extend.call(this, {
                type: definition.type,
                name: definition.name,
                cid: definition.cid,
                valueType: definition.valueType,
                properties: makeComponentProp(definition.properties || {}),
                acceptComponent: definition.acceptComponent,
                rule: definition.rule,

                __optionViewKlass__: definition.OptionView,
                __formViewKlass__: definition.FormView,
                __detailViewKlass__: definition.DetailView,

                initialize: definition.initialize || function () {
                }
            }, {
                "type": definition.type,
                "cname": definition.name,
                "group": definition.group,
                "cid": definition.cid || null,
                "handlerable": definition.handlerable,
                "OptionView": definition.OptionView,
                "FormView": definition.FormView,
                "DetailView": definition.DetailView
            });
        };

        return Klass;
    })();


    return FormComponent;
});
