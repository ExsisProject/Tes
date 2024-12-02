/**
 * 컴포넌트 뷰(최상위 컴포넌트 뷰)
 *
 * [ Notice ]
 * - 이 뷰는 base_component와 canvas 뷰를 통합하고 테이블 컴포넌트를 수용하기 위한 뷰이다.
 * - 리팩토링 기간 동안은 모듈 ID를 붙이지 않는다.
 */
define('works/components/formbuilder/core/views/base_component', function (require) {
    var Backbone = require('backbone');
    var GO = require('app');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var ComponentPropModel = require('works/components/formbuilder/core/models/component_prop');
    var AppletDocModel = require('works/components/formbuilder/core/models/user_doc');
    var Integration = require('works/models/integration');
    var renderComponent = require('hgn!works/components/formbuilder/core/templates/component');
    var constants = require('works/components/formbuilder/constants');
    var VALUE_TYPE = require('works/constants/value_type');
    var FIELD_TYPE = require('works/constants/field_type');
    var COMPONENT_TYPE = require('works/constants/component_type');
    var worksLang = require('i18n!works/nls/works');

    /**
     * 상수 정의
     */
    var COMPONENT_TAG = 'component';

    return Backbone.View.extend({

        /**
         * 컴포넌트 타입
         * @immutable
         * @type {String}
         */
        type: null,

        /**
         * 애플릿 ID
         * @type {Number}
         */
        appletId: null,

        /**
         * 컴포넌트 클라이언트 ID
         * @immutable
         * @type {String}
         *
         * [주의] Backbone.View 내부에서 cid를 사용하고 있으므로 혼동하지 않도록 주의
         */
        clientId: null,

        /**
         * 컴포넌트의 뷰 타입(하위 컴포넌트에서 결정되어야 한다)
         *  - form
         *  - detail
         *
         * @type {String}
         */
        viewType: null,

        /**
         * 컴포넌트의 부모노드 CID
         * @type {String}
         */
        parentCid: null,

        /**
         * 컴포넌트 프로퍼티 모델
         * 폼빌더에서 옵션창과 폼빌더 컴포넌트간의 동기화를 위해 모델 형태로 받는다.
         * @type {ComponentPropertyModel}
         */
        properties: null,

        /**
         * 자식 컴포넌트(노드) 리스트
         * @type {Array<ComponentModel>}
         */
        components: [],

        /**
         * 사용자 입력 데이터 모델
         * @type AppletDocModel의 객체
         */
        appletDocModel: null,

        /**
         * 컴포넌트 수정 여부 설정
         * @attributes
         * @type {Boolean}
         * @immutable
         */
        editable: false,

        /**
         * 외부 옵저버
         * @attribute
         */
        observer: null,

        /**
         * 리스트형(테이블) 컴포넌트에 들어갔는지의 여부 표시
         * @attribute
         * @type {Boolean}
         */
        multiple: false,

        template: renderComponent,
        componentBodySelector: '.component-body',
        $body: null,

        initialize: function (options) {
            options = options || {};

            this.type = options.type || null;
            this.appletId = options.appletId || null;
            this.subFormId = options.subFormId || null;
            this.clientId = null;
            this.parentCid = null;
            this.properties = null;
            this.components = [];
            this.appletDocModel = null;
            this.integrationModel = null;
            this.editable = false;
            this.multiple = false;
            this.observer = null;
            this.backupData = {};
            this.isBackuped = false;
            this.isMultipleRendered = true;

            /**
             * 리스트형(테이블) 컴포넌트에 들어간 복사뷰 관리
             */
            this.__multipleViews__ = [];

            if (options.appletDocModel) {
                this.docId = options.appletDocModel.id || null;
            }

            if (options.clientId) {
                this.clientId = options.clientId;
            }

            if (options.parentCid) {
                this.setParentCid(options.parentCid);
            }

            if (options.properties && options.properties instanceof ComponentPropModel) {
                this.properties = options.properties;
            } else {
                this.properties = new ComponentPropModel();
            }

            if (options.components) {
                this.components = options.components;
            }

            if (options.appletDocModel) {
                this.appletDocModel = options.appletDocModel;
            } else {
                this.appletDocModel = new AppletDocModel(null, {appletId: this.appletId});
            }

            if (options.integrationModel) {
                this.integrationModel = options.integrationModel;
            } else {
                this.integrationModel = new Integration(null, {appletId: this.appletId});
            }

            if (options.hasOwnProperty('editable')) {
                this.editable = options.editable;
            }

            if (options.hasOwnProperty('multiple')) {
                this.setMultiple(options.multiple);
            }


            if (options.observer) {
                this.observer = options.observer;
            }

            this.$el.addClass(constants.CN_COMPONENT);
            this.$el.attr('data-is', COMPONENT_TAG);
            this.$el.attr('data-type', this.getType());
            this.$el.attr('data-cid', this.getCid());
            this.$el.attr('data-id', this.cid);

            if (this.template != null) {
                this.$el.addClass('build_box');
                this.$el.html(this.template({
                    editable: this.isEditable(),
                    mainForm: GO.util.isInvalidValue(this.subFormId)
                }));
                this.$body = this.$(this.componentBodySelector);
            } else {
                this.$body = this.$el;
            }

            if (this.viewType !== 'option' && !this.editable) { // 옵션뷰 제외. 폼빌더 화면에서 제외.
                if (this.appletDocModel.id && this.observer) {
                    //this.listenTo(this.observer, 'sync:AppletDoc', this._onSyncAppletDoc);
                    this.listenTo(this.appletDocModel, 'sync', this._onSyncAppletDoc);
                }

                if (this._hasRule()) {
                    this.listenTo(this.observer, 'changeValue', this._onChangeValue);
                    if (!this.isMultiple()) this.listenTo(this.observer, 'setInitDisplay', this._setInitDisplay);
                }
            }

            /* GO-24072 자동계산 컴포넌트가 숫자컴포넌트보다 상위에 존재할 경우 계산되지 않는 문제, 이름이 아닌 코드가 보이는 문제 해결을 위해
             * 컴포넌트를 모두 그린 다음 listening 할 컴포넌트를 재탐색 */
            if (this.viewType == 'form' && this.type == FIELD_TYPE.FORMULA) {
                this.listenTo(this.observer, 'setInitDisplay', this._detectFieldForFormula);
            }
        },

        /**
         * @Override
         * setElement를 사용하면 $body를 갱신해줘야 한다.
         */
        setElement: function (element, delegate) {
            Backbone.View.prototype.setElement.apply(this, arguments);

            if (this.template != null) {
                this.$body = this.$(this.componentBodySelector);
            } else {
                this.$body = this.$el;
            }
        },

        /**
         * Works 내에서는 실제로 이 함수를 이용해 렌더링한다.
         * render 함수는 학습곡선을 낮추기 위해 보존한다.
         *
         * @return {Array|View} 뷰 혹은 뷰배열 반환. isMultiple = true인 경우 배열로 반환한다.
         */
        renderNode: function () {
            this._createOrGetCode();

            var returnViews;
            var userValues = this.appletDocModel.get(this.getCid()); // appletDocModel 은 appletDocModel 이 아니고 user_doc 이다. 매우 이상함

            if (this.isMultiple() && _.isArray(userValues) && userValues.length > 0) {
                // multiple values를 자식노드에게 전달할 준비를 마치고 자신것만 가지도록 만든다. // 이거 좀 이상한데..
                this.appletDocModel.set(this.getCid(), userValues[0], {silent: true});
            }

            this.beforeRender();
            // TODO. IE 에서 View 에 엘리먼트가 사라져 버리는 케이스 대응.
            if (!this.$body.parent().length && this.template != null) {
                this.$el.addClass('build_box');
                this.$el.html(this.template({editable: this.isEditable()}));
                this.$body = this.$(this.componentBodySelector);
            }
            this.render();
            this.afterRender();

            if (this.type === COMPONENT_TYPE.Table) {
                this.tableDataCorrection();
            }

            _.each(this.components, function (childNode) {
                var component, componentView;
                var componentManager = ComponentManager.getInstance(this.viewType);
                if (componentManager.isCreated(childNode)) {
                    component = componentManager.getComponent(childNode.cid);
                } else {
                    component = componentManager.addComponent(childNode);
                }

                // 컬럼 컴포넌트 때문에 반드시 수행해야 한다.
                this.initChildComponent(component);
                componentView = component.getView();
                this.appendChildView(componentView.renderNode());

            }, this);

            if (this.isMultiple() && !this.isEditable()) {
                returnViews = this._renderMultiple(userValues);
            } else {
                returnViews = this;
            }

            return returnViews;
        },

        /**
         * 테이블 데이터가 유실된 경우에 대한 보정 코드. row 수만큼 데이터가 있지 않는 경우 formView 가 렌더링 되지 않는다.
         */
        tableDataCorrection: function () {
            var cids = _.map(this.components, function (childNode) {
                return childNode.cid;
            }, this);
            var values = this.appletDocModel.get('values') || {};
            var dataLengths = _.map(cids, function (cid) {
                var data = values[cid] || [];
                if (!_.isArray(data)) data = [data];
                return data.length;
            }, this);
            var maxLength = _.max(dataLengths) || 1;
            _.each(cids, function (cid) {
                var componentData = values[cid] || [];
                if (!_.isArray(componentData)) componentData = [componentData];
                var dataLength = componentData.length;
                for (var i = 0; i < maxLength - dataLength; i++) {
                    componentData.push(null);
                }
                var newData = {};
                values[cid] = componentData;
                newData['values'] = values;
                newData[cid] = componentData;
                this.appletDocModel.set(newData, {silent: true});
            }, this);
        },

        initChildComponent: function (component) {
            component.setViewType(this.viewType);
            component.setAppletId(this.getAppletId());
            component.setSubFormId(this.subFormId);
            component.setEditable(this.isEditable());
            component.attachObserver(this.observer);
            component.setAppletDocModel(this.appletDocModel);
            component.setIntegrationModel(this.integrationModel);
            return component;
        },

        beforeRender: function () {
        },

        /**
         * 각 컴포넌트의 FormView와 DetailView에서 구현하는 부분
         */
        render: function () {
        },

        afterRender: function () {
        },

        /**
         * 각 컴포넌트에서 구현한다.(기본 구현은 나 자신에게 append 하는 것이다.)
         */
        appendChildView: function (childView) {
            var views = [];

            if (_.isArray(childView)) {
                views = childView;
            } else {
                views = [childView];
            }

            var els = _.map(views, function (view) {
                return view.el;
            });

            this.$body.append.apply(this.$body, els);
        },

        getComponentView: function (component) {
            return getComponentView(component, this.viewType);
        },

        getAppletId: function () {
            return this.appletId;
        },

        getViewType: function () {
            return this.viewType;
        },

        getType: function () {
            return this.type;
        },

        getCid: function () {
            return this.clientId;
        },

        getParentCid: function () {
            return this.parentCid;
        },

        setParentCid: function (newCid) {
            this.parentCid = newCid;
        },

        getProperty: function (key) {
            return this.properties.get(key);
        },

        getComponents: function () {
            return this.components;
        },

        getParentComponent: function () {
            var componentManager = ComponentManager.getInstance(this.viewType);
            return componentManager.getComponent(this.getParentCid());
        },

        /**
         * 컴포넌트가 수정가능한 상황인지 여부 반환
         */
        isEditable: function () {
            return this.editable;
        },

        setEditable: function (bool) {
            this.editable = bool;
        },

        isMultiple: function () {
            return this.multiple;
        },

        setMultiple: function (bool) {
            this.multiple = bool;
        },

        setAppletDocModel: function (appletDocModel) {
            this.appletDocModel = appletDocModel;
        },

        setIntegrationModel: function (integrationModel) {
            this.integrationModel = integrationModel;
        },

        /**
         * 컴포넌트 너비 조절
         * @param {int} width 너비
         * @param {string} unit 단위
         */
        resizeWidth: function (width, unit) {
            this.$el.outerWidth((width || 100) + (unit || '%'));
        },

        targetResizeHeight: function (obj, height) {
            $(obj).css('height', height + 'px');
        },

        /**
         * 멀티플 속성을 가진 컴포넌트(multiple = true)에서 자신을 복사할 때 사용.
         */
        createMultipleView: function (attrs, index, replace) {

            if (!this.isMultiple()) {
                return;
            }

            var componentManager = ComponentManager.getInstance(this.viewType);
            var component = componentManager.getComponent(this.getCid());
            var originalView = component.getView();
            var cloneView = component.getView(true);
            var docModelOption = {appletId: this.getAppletId()};
            if (this.appletDocModel.id) _.extend(docModelOption, {id: this.appletDocModel.id});
            var newAppletDocModel = new AppletDocModel(attrs || {}, docModelOption);
            originalView.listenTo(newAppletDocModel, 'change', originalView._onChangeCloneModel);
            // multiple view는 multiple이 되어서는 안된다. // 매우 이상하다.
            cloneView.setMultiple(false);
            cloneView.setAppletDocModel(newAppletDocModel);
            cloneView.renderNode();

            if (!_.isUndefined(index)) {
                this.__multipleViews__.splice(index, 0, cloneView);
            } else {
                this.__multipleViews__.push(cloneView);
            }

            return cloneView;
        },

        /**
         * originalView only. model 기반으로 전향. view는 clone 해서 사용하는데 model 은 새로 만들고 값을 덮어쓰고 난리도 아니다. 임시 대응.
         */
        _onChangeCloneModel: function () {
            if (!this.isMultipleRendered) return;
            var values = this._getMultipleData();
            this.appletDocModel.set(this.clientId, values);
        },

        _getMultipleData: function () {
            if (!this.isMultipleRendered) return;
            var values = [];
            var value = this.appletDocModel.get(this.clientId);
            values.push(_.isArray(value) ? value[0] : value);
            _.each(this.getMultipleViews(), function (view) {
                values.push(view.appletDocModel.get(view.clientId));
            });
            return values;
        },

        /**
         * @deprecated
         *
         * Use createMultipleView
         */
        addMultipleView: function (attrs) {
            return this.createMultipleView.apply(this, arguments);
        },

        /**
         * multiview 배열의 복사본을 반환
         */
        getMultipleViews: function () {
            return _.union([], this.__multipleViews__);
        },
        /**
         * 기존 index 로 찾던 방식 제거.
         * 생성되는 순서대로 array 에 들어가기 때문에 index 로는 찾을 수 없다
         * 인자로 받는 cid 는 backbone cid 이다. component id 를 cid 라는 이름으로 쓰고 있어서 오해의 소지가 있음.
         */
        removeMultipleView: function (cid) {
            var targetView = _.findWhere(this.__multipleViews__, {cid: cid});
            var index = _.indexOf(this.__multipleViews__, targetView);
            if (targetView && targetView instanceof Backbone.View) {
                targetView.remove();
            }
            this.__multipleViews__.splice(index, 1);
        },

        addClass: function (className) {
            this.$el.addClass(className);
        },

        removeClass: function (className) {
            this.$el.removeClass(className);
        },

        validate: function () {
            if (!this._getVisible()) return true;
        },

        _renderMultiple: function (userValues) {

            var returnViews = [];

            // 방어 코드
            if (!this.isMultiple()) {
                return;
            }

            // GO-25165 [cloud] works 테이블 컴포넌트삭제/ 새컴포넌트 삽입 후 데이터입력칸 사라짐
            // input_text, input_datepicker, input_number, input_timepicker
            if (_.isUndefined(userValues) && this.appletDocModel.id) {
                userValues = [];
                setDefaultValues.call(this, userValues, 0, null);
            }

            // input_select
            if (this.type == "select" && _.isArray(userValues) && userValues.length == 1) {
                setDefaultValues.call(this, userValues, -1, userValues[0]);
            }

            // 사용자 입력값이 없으면 나를 그대로 리턴
            if (!userValues) {
                return this;
            }

            userValues = _.isArray(userValues) ? userValues : [userValues];
            //if (userValues.length - 1 === this.__multipleViews__.length) { // childView 가 이미 만들어져 있는 경우
            //    returnViews.push(this);
            //    _.each(this.__multipleViews__, function (child) {
            //        returnViews.push(child);
            //    });
            //    return returnViews;
            //}
            this.__multipleViews__ = [];
            this.isMultipleRendered = false;
            _.each(userValues, function (value, i) {
                var attrs = {};
                attrs[this.getCid()] = value;

                // 첫번째 row는 원본이다.
                if (i === 0) {
                    returnViews.push(this);
                } else {
                    returnViews.push(this.createMultipleView(attrs/*, i, true*/));
                }
            }, this);
            this.isMultipleRendered = true;

            return returnViews;

            function setDefaultValues(userValues, addRow, defaultValue) {
                var parentComponent = this.getParentComponent();
                if (!_.isUndefined(parentComponent) && parentComponent.type == COMPONENT_TYPE.Table) {
                    _.times(parentComponent.getMaxRow() + addRow, function () {
                        userValues.push(defaultValue);
                    });
                }
            }
        },

        _createOrGetCode: function () {
            var code = this.model.get('code');

            if (!code && this._isDefaultGenerateTypes()) {
                code = this._generateCode();
            }

            return code;
        },

        _generateCode: function () {
            var code = this._generate();
            this.model.set('code', code);
            return code;
        },

        _generate: function () {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var component = componentManager.getComponent(this.clientId);
            var result;
            if (this._isPredefinedTypes()) {
                result = component.type;
            } else {
                result = _.uniqueId(component.type + '_');
                if (!this._isValidCode(result)) result = this._generate();
            }

            return result;
        },

        _isValidCode: function (code, cid) {
            if (!this._isDefaultGenerateTypes() && code === "") return true;

            var result = true;
            result = result && !this._checkSpace(code); // GO-29538 자동계산 수식 이슈로 코드값 입력 시 공백 입력 못하게
            result = result && !this._checkSpecialCode(code);
            result = result && !this._checkInvalidCodeFormat(code);
            result = result && !this._checkSpecialCharacter(code);
            result = result && !this._checkDupCode(code, cid);

            return result;
        },

        _checkSpace: function (needle) {
            return (needle.search(/\s/) != -1) ? true : false;
        },

        _checkSpecialCode: function (needle) {
            var pattern = /applet_id|doc_id|status|creator|updater|create_date|update_date|score|textContent|__/i;
            return pattern.test(needle);
        },

        _checkInvalidCodeFormat: function (needle) {
            var pattern = /^[a-z]+[a-zA-Z0-9_]*/g;
            return !pattern.test(needle);
        },

        _checkSpecialCharacter: function (needle) {
            var pattern = /[~`!@#$%^&*()\-+={\[}\]|\\:;"'<,>.?/]/ig;
            return pattern.test(needle);
        },

        _checkDupCode: function (needle, cid) {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var components = componentManager.getComponents();
            var filtered = _.filter(components, function (component) {
                if (cid === component.getCid()) {
                    return false;
                } else {
                    var propModel = component.getComponentPropertyModel();
                    var haystack = propModel.get('code');
                    return needle && needle === haystack;
                }
            });

            return filtered.length > 0;
        },

        _isDefaultGenerateTypes: function () {
            return this.isFormulableTypes() || this._isPredefinedTypes();
        },

        isFormulableTypes: function () {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var component = componentManager.getComponent(this.clientId);
            if (!component) return false;
            return _.contains(FIELD_TYPE.FORMULABLE_TYPES, component.type);
        },

        _isPredefinedTypes: function () {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var component = componentManager.getComponent(this.clientId);
            if (!component) return false;
            return _.contains(FIELD_TYPE.PREDEFINED_TYPES, component.type);
        },

        /**
         * 노출 조건에 의한 초기 디스플레이 설정
         * 렌더 이후 이벤트 트리거에 의해 동작한다.
         * @private
         */
        _setInitDisplay: function () {
            var property = this._getPropertyModel();
            var rule = property.rule;
            var parentComponent = this.getParentComponent();
            var isNeedCheckParentDisplay = parentComponent && parentComponent.type !== COMPONENT_TYPE.Canvas && !parentComponent.visible;
            if ((rule && !_.isEmpty(rule)) || isNeedCheckParentDisplay) {
                var value = this.appletDocModel.get(rule.listenComponentId);
                this._toggleComponent(this._valueCheck({value: value}));
            }
        },

        setDefaultValue: function () {
            var defaultValue = this._getDefaultValue();
            this.appletDocModel.set(this.clientId, defaultValue);
            this.renderNode();
            this.backupData[this.clientId] = defaultValue;
            if (!this._getVisible()) {
                this.appletDocModel.set(this.clientId, null);
            }
        },

        _onSyncAppletDoc: function (model) {
            this.backupData[this.clientId] = model.get(this.clientId);
            if (!this._getVisible()) {
                this.appletDocModel.set(this.clientId, null);
            }
        },

        _changeValue: function (value) {
            this.observer.trigger('changeValue', {cid: this.clientId, value: value});
        },

        _onChangeValue: function (data) {
            if (!this._ruleCheck(data)) {
                return;
            }
            if (!this._displayCheck(data)) {
                this._toggleComponent(false);
                return;
            }
            this._toggleComponent(this._valueCheck(data));
        },

        _hasRule: function () {
            return !!this._getRule();
        },

        _ruleCheck: function (data) {
            data = data || {cid: this.clientId};
            var rule = this._getRule();
            return rule ? data.cid == rule.listenComponentId : false;
        },

        _displayCheck: function (data) {
            return _.isUndefined(data.visible) ? this._getComponent(data.cid).visible : data.visible;
        },

        _valueCheck: function (data) {
            function getResult(rule, value) {
                var values = _.map(rule.values, function (value) {
                    return _.isObject(value) ? value.id : parseInt(value);
                });
                var comparisonValue = _.isObject(value) ? value.id : parseInt(value);
                return _.contains(values, comparisonValue);
            }

            var rule = this._getRule();
            var result;
            if (_.isArray(data.value)) {
                _.each(data.value, function (value) {
                    result = getResult(rule, value);
                    if (result) return false;
                });
            } else {
                result = getResult(rule, data.value);
            }
            return !!(rule.isInverse ? !result : result);
        },

        _detectFieldForFormula: function () {
            this._listenToFormulaSource();
            this._setContent();
        },

        isMasking: function () {
            var component = this._getComponent();
            return component ? component.isMasking() : false;
        },

        setMasking: function (masking) {
            var component = this._getComponent();
            component.setMasking(masking);
        },

        _getVisible: function () {
            var component = this._getComponent();
            return component.getVisible();
        },

        isHide: function () {
            if (!this._getVisible()) return true;

            var parentComponent = this.getParentComponent();
            if (!parentComponent) return false;
            var formView = parentComponent.getFormView();

            return formView.isHide();
        },

        isShow: function () {
            return !this.isHide();
        },

        _getComponent: function (cid) {
            cid = cid || this.clientId;
            var componentManager = ComponentManager.getInstance(this.viewType);
            return componentManager.getComponent(cid);
        },

        _getPropertyModel: function (cid) {
            cid = cid || this.clientId;
            var component = this._getComponent(cid);
            return component ? component.properties : undefined;
        },

        /**
         * 기본값의 key 가 defaultValue 가 아니면 각 컴포넌트에서 구현해야함.
         */
        _getDefaultValue: function () {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var component = componentManager.getComponent(this.clientId);
            var isSelectable = _.contains(FIELD_TYPE.SELETABLE_TYPES, this.type);
            if (isSelectable) {
                var defaultValue = [];
                _.each(this.model.get('items'), function (item) {
                    var isSelectsType = component.valueType === VALUE_TYPE.SELECTS;
                    if (item.selected) {
                        if (isSelectsType) {
                            defaultValue.push(parseInt(item.value));
                        } else {
                            defaultValue = item.value;
                            return false;
                        }
                    }
                });
                return _.isEmpty(defaultValue) ? null : defaultValue;
            } else {
                var property = this._getPropertyModel();
                var defaultValueOfValueType = '';
                if (_.contains(VALUE_TYPE.MULTI_VALUED_TYPES, component.valueType)) defaultValueOfValueType = [];
                if (_.contains([VALUE_TYPE.DATE, VALUE_TYPE.TIME, VALUE_TYPE.DATETIME, VALUE_TYPE.NUMBER], component.valueType)) defaultValueOfValueType = null;
                return property.defaultValue || defaultValueOfValueType;
            }
        },

        _targetIsChild: function (currentComponent, targetCid) {
            var hasComponent = false;

            function hasTargetComponentInChildes(component) {
                if (component.cid === targetCid) {
                    hasComponent = true;
                } else {
                    _.each(component.components, function (childComponent) {
                        if (childComponent.cid === targetCid) {
                            hasComponent = true;
                            return false;
                        }
                        hasTargetComponentInChildes(childComponent);
                    });
                }
            }

            hasTargetComponentInChildes(currentComponent);

            return hasComponent;
        },

        _getRule: function (cid) {
            cid = cid || this.clientId;
            var property = this._getPropertyModel(cid);
            var rule = property.rule || {};
            var targetIsChild = this._targetIsChild(this._getComponent(this.clientId), rule.listenComponentId);
            if (targetIsChild) $.goError(worksLang['잘못된 노출 조건이 있습니다. 노출 조건을 수정해 주세요.']);

            return property && !targetIsChild ? property.rule : undefined;
        },
        _toggleComponent: function (flag) { // view & value toggle
            var component = this._getComponent();
            var visible = component.getVisible();

            var parentComponent = this.getParentComponent();
            var invalidDisplay = parentComponent && parentComponent.type !== COMPONENT_TYPE.Canvas && !parentComponent.visible && flag;
            //console.log('invalidDisplay: ' + invalidDisplay);
            if (visible === flag || invalidDisplay) return;
            component.setVisible(flag);
            this._componentElementToggle(flag);
            flag ? this._restore() : this._backup();

            this.observer.trigger('changeValue', {
                cid: this.clientId,
                value: this.appletDocModel.get(this.clientId)
            });
            this.observer.trigger('changeDisplay', {cid: this.clientId, flag: flag});

            /**
             * 하위 컴포넌트들에 대하여 view toggle 은 하지 않지만 value toggle 은 이뤄져야 한다.
             * 상위 컴포넌트가 invisible 이면 하위 컴포넌트는 visible 이라도 값은 사용할 수 없다.
             */

            _.each(this.components, function (componentObject) {
                var component = this._getComponent(componentObject.cid);
                if (component) {
                    component.getView()._valueToggle(flag);
                }
            }, this);

            _.each(this.__multipleViews__, function (childView) {
                childView._componentElementToggle(flag);
            });
            if (this.__aggrView__) {
                this.__aggrView__._componentElementToggle(flag);
            }
        },

        _valueToggle: function (flag) {
            flag ? this._restore() : this._backup();
            this.observer.trigger('changeValue', {
                cid: this.clientId,
                value: this.appletDocModel.get(this.clientId)
            });
            _.each(this.components, function (componentObject) {
                var component = this._getComponent(componentObject.cid);
                if (component) component.getView()._valueToggle(flag);
            }, this);
        },

        _componentElementToggle: function (flag) {
            var $parent = this.$el.parent();
            var isTable = $parent.is('td');
            if (isTable) $parent.toggle(flag);
            this.$el.toggle(flag);
        },

        _restore: function () {
            if (this.getViewType() !== 'form' || !this.isBackuped) return;
            this.appletDocModel.set(this.clientId, this.backupData[this.clientId]);
            console.log('_show(' + this.clientId + ', ' + this.type + '): ' + this.appletDocModel.get(this.clientId) + ' / ' + this.backupData[this.clientId]);
        },

        _backup: function () {
            if (this.getViewType() !== 'form') return;
            var formData = this.getFormData();
            this.backupData = formData || {};
            this.appletDocModel.set(this.clientId, null);
            this.isBackuped = true;
            console.log('_hide(' + this.clientId + ', ' + this.type + '): ' + this.appletDocModel.get(this.clientId) + ' / ' + this.backupData[this.clientId]);
        }
    });

    function capitalize(str) {
        return GO.util.initCap(str);
    }

    function getComponentView(component, viewType) {
        return component['get' + capitalize(viewType) + 'View']();
    }
});
