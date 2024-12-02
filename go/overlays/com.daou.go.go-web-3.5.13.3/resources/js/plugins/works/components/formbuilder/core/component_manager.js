define('works/components/formbuilder/core/component_manager', function (require) {
    //var GO = require('app');
    var Registry = require('works/components/formbuilder/core/component_registry');
    var renderDragHelper = require('hgn!works/components/formbuilder/core/templates/drag_helper');

    /**
     * 최초 singleton 으로 개발되어 사용중인데, (제발 싱글톤 좀 쓰지 마라...)
     * 모든 호출부를 수정하는 것은 비용이 너무 크므로 일단 호환이 가능하도록 아래 형태로 사용하도록 하자.
     * 이후엔 무조건 instance 를 통해 접근 해야한다. 이 아래 function 들은 앞으로 절대 직접 쓰지 말것!!!
     */
    var instanceMap = {};
    var getInstance = function (type) {
        type = type || 'instance';
        return instanceMap[type] || instanceMap['instance'];
    };
    var ComponentManager = function () {
    };
    ComponentManager.init = function (modelObject, options) {
        options = options || {};
        var instance = new ComponentManager();
        if (options.type) instanceMap[options.type] = instance;
        instanceMap['instance'] = instance;
        instance.init.call(instance, modelObject);
        return instance;
    };
    ComponentManager.initMainForm = function (modelObject, first) {
        var instance = getInstance();
        return instance.initMainForm.apply(instance, arguments);
    };
    ComponentManager.getInstance = function (type) {
        return getInstance(type);
    };
    ComponentManager.createDragHelper = function () {
        var instance = getInstance();
        return instance.createDragHelper.apply(instance, arguments);
    };
    ComponentManager.createComponent = function () {
        var instance = getInstance();
        return instance.createComponent.apply(instance, arguments);
    };
    ComponentManager.getComponentClass = function () {
        var instance = getInstance();
        return instance.getComponentClass.apply(instance, arguments);
    };
    ComponentManager.getComponentName = function () {
        var instance = getInstance();
        return instance.getComponentName.apply(instance, arguments);
    };
    ComponentManager.addComponent = function () {
        var instance = getInstance();
        return instance.addComponent.apply(instance, arguments);
    };
    ComponentManager.isCreated = function () {
        var instance = getInstance();
        return instance.isCreated.apply(instance, arguments);
    };
    ComponentManager.isNew = function () {
        var instance = getInstance();
        return instance.isNew.apply(instance, arguments);
    };
    ComponentManager.getComponent = function () {
        var instance = getInstance();
        return instance.getComponent.apply(instance, arguments);
    };
    ComponentManager.getComponentsByType = function () {
        var instance = getInstance();
        return instance.getComponentsByType.apply(instance, arguments);
    };
    ComponentManager.getComponents = function () {
        var instance = getInstance();
        return instance.getComponents.apply(instance, arguments);
    };
    ComponentManager.getComponentByCid = function () {
        var instance = getInstance();
        return instance.getComponentByCid.apply(instance, arguments);
    };
    ComponentManager.getFields = function () {
        var instance = getInstance();
        return instance.getFields.apply(instance, arguments);
    };
    ComponentManager.removeComponent = function () {
        var instance = getInstance();
        return instance.removeComponent.apply(instance, arguments);
    };
    ComponentManager.clear = function () {
        var instance = getInstance();
        return instance.clear.apply(instance, arguments);
    };
    ComponentManager.clearNewComponent = function () {
        var instance = getInstance();
        return instance.clearNewComponent.apply(instance, arguments);
    };
    ComponentManager.getMainFormComponent = function () {
        var instance = getInstance();
        return instance.getMainFormComponent.apply(instance, arguments);
    };

    _.extend(ComponentManager.prototype, {
        __created__: {},
        __isNew__: {},
        __mainForm__: {},

        init: function (component) {
            this.clear();

            if (component) {
                this.addComponent(component, true);
            }
        },

        initMainForm: function (mainFormComponent, first) {
            if (first) this.__mainForm__ = {};
            if (mainFormComponent) {

                this._addMainFormComponent(mainFormComponent);
            }
        },

        createDragHelper: function (label) {
            var width = 200;
            var height = 32;

            var $helper = $(renderDragHelper({"label": label, "width": width, "height": height}));
            $helper.outerWidth(width);
            $helper.outerHeight(height);

            return $helper;
        },
        createComponent: function (componentType, parentCid) {
            var Component = Registry.findByType(componentType);

            if (Component.cid && this.isCreated(Component.cid)) {
                return false;
            }

            var newComponent = new Component();

            if (parentCid != null) {
                newComponent.setParentCid(parentCid);
            }

            this.__created__[newComponent.getCid()] = newComponent;
            this.__isNew__[newComponent.getCid()] = newComponent;

            return newComponent;
        },

        getComponentClass: function (componentType) {
            return Registry.findByType(componentType);
        },

        getComponentName: function (componentType) {
            return this.getComponentClass(componentType).cname;
        },

        addComponent: function (node, isReset) {
            if (node && !node.cid) {
                throw new Error('Illegal node data');
            }

            if (this.isCreated(node) && !(isReset || false)) {
                return this.__created__[node.cid];
            }

            var Component = Registry.findByType(node.type);
            var newComponent = new Component(node);
            this.__created__[newComponent.getCid()] = newComponent;
            return newComponent;
        },

        isCreated: function (node) {
            if (_.isString(node)) {
                return this.__created__[node];
            }

            return node && node.cid && this.__created__[node.cid];
        },

        isNew: function (node) {
            var cid;
            if (_.isString(node)) {
                cid = node;
            } else if (node && node.cid) {
                cid = node.cid;
            } else {
                return false;
            }

            return _.contains(_.keys(this.__isNew__), cid);
        },

        getComponent: function (cid) {
            return this.__created__[cid];
        },

        getComponentsByType: function (componentType) {
            return _.filter(this.getComponents(), function (component) {
                return componentType === component.getType();
            }, this);
        },

        getComponents: function () {
            return _.values(this.__created__);
        },

        getComponentByCid: function (cid) {
            return _.findWhere(this.getComponents(), {cid: cid});
        },

        getFields: function () {
            var components = this.getComponents();
            return _.map(components, function (component) {
                return {
                    cid: component.cid,
                    fieldType: component.type,
                    label: component.properties.label,
                    multiple: component.multiple,
                    options: component.properties.items || [],
                    valueType: component.valueType,
                    properties: component.properties
                }
            });
        },

        removeComponent: function (component) {
            var target = this._parseComponentBy(component);
            target.remove();
            delete this.__created__[target.getCid()];
            delete this.__isNew__[target.getCid()];
        },

        clear: function () {
            _.each(this.__created__, function (component) {
                this.removeComponent(component);
            }, this);

            this.__created__ = {};
            this.__isNew__ = {};
        },

        clearNewComponent: function () {
            this.__isNew__ = {};
        },

        getMainFormComponent: function (cid) {
            return this.__mainForm__[cid];
        },

        _parseComponentBy: function (component) {
            var target;

            if (_.isString(component)) {
                target = this.getComponent(component);
            } else {
                target = component;
            }

            return target;
        },
        _addMainFormComponent: function (component) {
            var cid = component.cid;

            /*var Component = Registry.findByType(component.type);
            var newComponent = new Component(component);*/

            this.__mainForm__[cid] = component;

            if (!component.emptyChildrenComponent) {
                var self = this;
                _.each(component.components, function (childComponent) {
                    self._addMainFormComponent(childComponent);
                });
            }
        }
    });

    return ComponentManager;
});
