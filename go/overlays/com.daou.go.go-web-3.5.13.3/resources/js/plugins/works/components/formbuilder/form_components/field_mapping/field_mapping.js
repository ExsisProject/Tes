define('works/components/formbuilder/form_components/field_mapping/field_mapping', function (require) {

    var _ = require('underscore');
    var Backbone = require('backbone');
    var moment = require('moment');
    var GO = require('app');
    var ComponentType = require('works/constants/component_type');
    var FieldType = require("works/constants/field_type");

    var ValueType = require('works/constants/value_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var Masking = require('works/components/masking_manager/models/masking');
    var AppletDocModel = require('works/models/applet_doc');
    var Fields = require('works/collections/fields');

    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/field_mapping/option');
    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/field_mapping/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/field_mapping/detail');

    var NameTagView = require("go-nametags");

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    require('jquery.go-preloader');

    var lang = {
        "연동컴포넌트 매핑": worksLang["연동컴포넌트 매핑"],
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "이름숨기기": worksLang["이름숨기기"],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "자동입력": worksLang["자동입력"],
        "연동 컴포넌트": worksLang["연동 컴포넌트"],
        "컴포넌트 매핑": worksLang["컴포넌트 매핑"],
        "선택하세요": commonLang["선택하세요."],
        '관리자에 의해 마스킹 처리 된 항목입니다': worksLang['관리자에 의해 마스킹 처리 된 항목입니다']
    };

    var KEY_TARGET_COMPONENT = 'targetComponentCid';
    var KEY_TARGET_FIELD = 'targetFieldCid';

    var DisplayContentView = Backbone.View.extend({
        tagName: 'span',

        initialize: function (options) {
            var opts = options || {};

            this.setSource(opts.source);
            this.setValueType(opts.valueType);
            this.setFieldInfo(opts.fieldInfo || {});
        },

        render: function () {
            return this.convert();
        },

        setSource: function (source) {
            this.source = source;
            return this;
        },

        getSource: function () {
            return this.source;
        },

        setValueType: function (valueType) {
            this.valueType = valueType;
            return this;
        },

        getValueType: function () {
            return this.valueType;
        },

        setFieldInfo: function (fieldInfo) {
            this.fieldInfo = fieldInfo;
            return this;
        },

        convert: function () {
            switch (this.valueType) {
                case ValueType.NUMBER:
                    this._fromNumber();
                    break;
                case ValueType.SELECT:
                case ValueType.SELECTS:
                    this._fromSelectType();
                    break;
                case ValueType.DATE:
                    this._fromDate();
                    break;
                case ValueType.DATETIME:
                    this._fromDatetime();
                    break;
                case ValueType.USERS:
                case ValueType.USER:
                    this._fromUsersType();
                    break;
                case ValueType.DEPTS:
                    this._fromDept();
                    break;
                case ValueType.STEXT:
                case ValueType.STEXTS:
                default:
                    this._fromText();
                    break;
            }

            return this;
        },

        _fromText: function () {
            var result = this.source;
            if (_.isArray(this.source)) {
                result = _.compact(this.source).join(', ');
            }

            if (!_.isString(result)) {
                result = '-';
            }

            this.$el.html(GO.util.escapeHtml(result));
        },

        _fromNumber: function () {
            var values = this.source;

            var dataType = this.fieldInfo.dataType ? this.fieldInfo.dataType : "NUMBER";
            if (dataType == "PERCENT") {
                if (GO.util.isInvalidValue(values)) {
                    values = "-";
                } else {
                    values = '<span class="com_gage"><span class="wrap_gage"><span class="gage" id="percentGage" style="width:'
                        + values + '%"></span></span><span class="txt">' + values + '%</span></span>';
                }
            } else if (dataType == "POINT") {
                if (GO.util.isInvalidValue(values)) {
                    values = "-";
                } else {
                    var pointEl = '<span class="com_rate"><span class="wrap_rate">';
                    for (i = 0; i < this.fieldInfo.maxLength; i++) {
                        var customClass = i < parseFloat(values) ? "" : "ic_star_off"
                        pointEl = pointEl + '<ins style="cursor: default;" class="ic_star ' + customClass + '"></ins>';
                    }
                    pointEl = pointEl + '</span></span>';

                    values = pointEl;
                }
            } else {
                if (this.fieldInfo.thousandComma) {
                    values = GO.util.numberWithCommas(values);
                }
                if (this.fieldInfo.fixType === 'prefix') values = this.fieldInfo.unitText + ' ' + values;
                if (this.fieldInfo.fixType === 'postfix') values = values + ' ' + this.fieldInfo.unitText;
            }

            this.$el.html(values);
        },

        _fromSelectType: function () {
            var source = this.source;
            var result = '-';

            if (this._hasSource()) {
                var fieldInfo = this.fieldInfo;
                var sources = _.isArray(source) ? source : [source];
                var label = _.map(sources, function (needle) {
                    var fieldOption = _.findWhere(fieldInfo.options || [], {value: needle});
                    return fieldOption ? GO.util.escapeHtml(fieldOption.displayText) : "";
                });
                label = _.compact(label);
                result = label.join(", ");

                if (this.getValueType() === 'SELECTS') {
                    // SELECTS 일경우 STEXTS로 올라가야 하기 때문에 source를 배열형태로 바꾼다.
                    this.setSource(label);
                } else {
                    this.setSource(result);
                }
            }

            this.$el.html(result);
        },

        _fromDate: function () {
            var source = this.source;
            var formatDate = '-';
            if (this._hasSource()) {
                formatDate = [source.substr(0, 4), source.substr(4, 2), source.substr(6, 2)].join("-");
            }
            this.$el.html(formatDate);
        },

        _fromDatetime: function () {
            var source = this.source;
            var formatDate = '-';
            if (this._hasSource()) {
                formatDate = moment(source).format("YYYY-MM-DD HH:mm");
            }
            this.$el.html(formatDate);
        },

        _fromUsersType: function () {
            var source = this.source;
            var formatText = '-';

            if (this._hasSource()) {
                var sources = _.isArray(source) ? source : [source];
                var isMobile = GO.util.isMobile();
                var userLabel = _.map(sources, function (user) {
                    var html = '';
                    var displayName = getDisplayText(user);

                    if (isMobile) {
                        html += '<li><span class="name">' + displayName + '</span></li>';
                    } else {
                        html += '<span class="member">';
                        if (user && user.thumbnail) {
                            html += '<img src="' + user.thumbnail + '" alt="' + displayName + '" title="' + displayName + '">' + "\n";
                        }
                        html += '<span class="txt">' + displayName + '</span>';
                        html += '</span>';
                    }

                    return html;
                }, this);

                formatText = userLabel.join("");

                if (isMobile) {
                    this.setElement('<ul class="name_tag"></ul>');
                }
            }

            function getDisplayText(user) {
                var displayText = '';

                if (user) {
                    var position = user && user.position ? user.position : '';
                    var displayName = user && user.displayName ? user.displayName : '';
                    if (displayName) {
                        displayText = displayName;
                    } else {
                        displayText = user.name + (position ? ' ' + position : '');
                    }
                }

                return displayText;
            }

            this.$el.html(formatText);
        },

        _fromDept: function () {
            var source = this.source;

            if (this._hasSource()) {
                var sources = _.isArray(source) ? source : [source];
                var nameTag = NameTagView.create({}, {useAddButton: false});

                _.each(sources, function (dept) {
                    nameTag.addTag(dept.id, dept.name, {"attrs": dept, removable: false});
                });

                this.$el.html(nameTag.el);
            } else {
                this.$el.html('-');
            }
        },

        toHtml: function () {
            return this.$el.html();
        },

        toText: function () {
            var result = '-';
            if (this._isTypeOfUser() || this._isTypeOfDept()) {
                var $tags = this.$el.find(this._hasNameTagElement() ? 'span.name' : 'span.txt');
                var names = [];
                $tags.each(function () {
                    names.push($(this).text());
                });
                result = (_.compact(names) || []).join(', ');
            } else {
                result = this.$el.text();
            }

            return result;
        },

        _hasNameTagElement: function () {
            return this.$el.hasClass('name_tag') || this.$el.find('ul.name_tag').length > 0;
        },

        _isTypeOfUser: function () {
            return _.contains([ValueType.USER, ValueType.USERS], this.getValueType());
        },

        _isTypeOfDept: function () {
            return ValueType.DEPTS === this.getValueType();
        },

        _hasSource: function () {
            return !_.isUndefined(this.source) && this.source !== null;
        }
    }, {
        create: function (source, valueType, fieldInfo) {
            return new DisplayContentView({source: source, valueType: valueType, fieldInfo: fieldInfo});
        }
    });

    var OptionView = BaseOptionView.extend({
        customEvents: function () {
            var eventMap = {};

            eventMap['change select[name=' + KEY_TARGET_COMPONENT + ']'] = '_loadIntegratedFieldOptions';
            eventMap['change select[name=' + KEY_TARGET_FIELD + ']'] = '_onChangeMappingProp';

            return eventMap;
        },

        renderBody: function () {
            var appletChangeable = this._changeable('targetAppletId');
            var fieldChangeable = this._changeable('targetFieldCid');
            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON(),
                appletChangeable: appletChangeable,
                fieldChangeable: fieldChangeable,
                targetComponentCid: KEY_TARGET_COMPONENT,
                targetFieldCid: KEY_TARGET_FIELD
            }));

            if (appletChangeable) {
                this._loadIntegratedComponentOptions();
            }
            if (fieldChangeable) {
                this._loadIntegratedFieldOptions();
            }
        },

        _changeable: function (key) {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var component = componentManager.getComponent(this.clientId);
            return componentManager.isNew(this.clientId) ? true :
                !this.model.get(key) || (this.model.get(key) != component.properties[key]);
        },

        _loadIntegratedComponentOptions: function () {
            var html = [];
            var $targetComponent;

            $targetComponent = this.$el.find('select[name=' + KEY_TARGET_COMPONENT + ']');
            _.each(this._getAppletDocComponent(), function (component) {
                var propModel = component.getComponentPropertyModel();
                html.push('<option value="' + component.getCid() + '">' + propModel.get('label') + '</option>');
            });
            $targetComponent.append(html.join("\n"));

            var targetComponentCid = this.model.get(KEY_TARGET_COMPONENT);
            if (targetComponentCid && targetComponentCid.length > 0) {
                $targetComponent.val(targetComponentCid);
                this._fetchAndUpdateIntegratedFieldOptions(targetComponentCid);
            }
        },

        _loadIntegratedFieldOptions: function () {
            var cid, myComponent, propModel, targetComponent, targetPropModel;
            var componentManager = ComponentManager.getInstance(this.viewType);

            this.$('select[name=' + KEY_TARGET_FIELD + ']').html('<option value="">' + lang["선택하세요"] + '</option>');
            cid = this.$('select[name=' + KEY_TARGET_COMPONENT + ']').val() || this.model.get('targetComponentCid');
            if (cid) {
                myComponent = componentManager.getComponent(this.clientId);
                propModel = myComponent.getComponentPropertyModel();
                targetComponent = componentManager.getComponent(cid);
                targetPropModel = targetComponent.getComponentPropertyModel();

                // 매핑 대상 연동앱의 appletId과 라벨 저장
                propModel.set('targetAppletId', targetComponent.getAppletId());
                propModel.set('targetAppletName', targetPropModel.get('appletName'));
                propModel.set('targetComponentLabel', targetPropModel.get('label'));
                this._fetchAndUpdateIntegratedFieldOptions(cid);
            }
        },

        /**
         * 항목 매핑 옵션을 그리기 위해 연동된 앱의 field 목록을 fetch하고 option을 그림
         * @param targetComponent
         * @private
         */
        _fetchAndUpdateIntegratedFieldOptions: function (targetComponent) {
            var component = targetComponent;
            var self = this;
            if (_.isString(targetComponent)) {
                var componentManager = ComponentManager.getInstance(this.viewType);
                component = componentManager.getComponent(targetComponent);
            }

            if (component) {
                var propModel = component.getComponentPropertyModel();
                var $targetField = this.$el.find('select[name=' + KEY_TARGET_FIELD + ']');
                var propOptions = [];

                this.fields = new Fields([], {
                    appletId: propModel.get('integrationAppletId'),
                    type: 'consumers'
                });

                this.fields.fetch({
                    success: function (fields) {
                        var mappableFields = fields.getMappableFields();
                        mappableFields.each(function (field) {
                            var label = field.get('label');
                            propOptions.push('<option value="' + field.get('cid') + '" data-valuetype="' + field.get('valueType') + '">' + label + '</option>');
                        });

                        $targetField.append(propOptions.join("\n"));

                        // 폼 저장 전 다른 컴포넌트 이동 후 다시 옵션뷰 그릴 때 항목매핑이 중복되어 나오는것을 방지
                        var optionMap = {};
                        $targetField.children().each(function () {
                            if (optionMap[this.value]) {
                                $(this).remove();
                            }
                            optionMap[this.value] = true;
                        });

                        var targetFieldCid = self.model.get(KEY_TARGET_FIELD);
                        if (targetFieldCid && targetFieldCid.length > 0) {
                            $targetField.val(targetFieldCid);
                        }
                    }
                });
            }
        },

        _onChangeMappingProp: function (e) {
            var $target = $(e.currentTarget);
            var cid = $target.val();
            var $sOpt = $target.find('option:selected');
            var valueType = $sOpt.data('valuetype');
            var label = $sOpt.text();

            if (cid && cid.length > 0) {
                this._setValueType(valueType);
                this._setTargetFieldLabel(label);
            }
        },

        _setValueType: function (valueType) {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var myComponent = componentManager.getComponent(this.clientId);
            switch (valueType) {
                case ValueType.SELECT:
                    myComponent.setValueType(ValueType.STEXT);
                    break;
                case ValueType.SELECTS:
                    myComponent.setValueType(ValueType.STEXTS);
                    break;
                default:
                    myComponent.setValueType(valueType);
                    break;
            }
        },

        _setTargetFieldLabel: function (label) {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var myComponent = componentManager.getComponent(this.clientId);
            var propModel = myComponent.getComponentPropertyModel();
            propModel.set('targetFieldLabel', label);
        },

        /**
         * 캔버스에 올려진 데이터연동 컴포넌트들을 반환
         * @returns {Array}
         * @private
         */
        _getAppletDocComponent: function () {
            var componentManager = ComponentManager.getInstance(this.viewType);
            return _.filter(componentManager.getComponents(), function (component) {
                return component.getType() === FieldType.APPLETDOCS;
            });
        }
    });

    var FormView = BaseFormView.extend({

        initialize: function () {
            BaseFormView.prototype.initialize.apply(this, arguments);

            this.sourceData = null;
            if (!this.isEditable() && this.observer) {
                this.listenTo(this.observer, 'applet_doc:add', this._onAppletDocAdded);
                this.listenTo(this.observer, 'applet_doc:removed', this._onAppletDocRemoved);
            }

            var appletDocComponentCid = this.model.get('targetComponentCid');
            var componentManager = ComponentManager.getInstance(this.viewType);
            var appletDocComponent = componentManager.getComponent(appletDocComponentCid);
            var propModel = appletDocComponent ? appletDocComponent.getComponentPropertyModel() : null;
            this.masking = new Masking({appletId: propModel ? propModel.get('integrationAppletId') : null});
            if (propModel && propModel.get('integrationAppletId') && this.appletDocModel.id) {
                this.masking.fetch();
            } else {
                this.masking.deferred.resolve();
            }
        },

        render: function () {
            this.masking.deferred.done(_.bind(function () {
                var isMasking = _.contains(this.masking.get('fieldCids'), this.model.get('targetFieldCid'));
                this.$body.html(renderFormTpl({
                    clientId: this.getCid(),
                    displayTextId: this._getDisplayTextId(),
                    model: this.model.toJSON(),
                    label: GO.util.escapeHtml(this.model.get('label')),
                    "editable?": this.isEditable(),
                    lang: lang,
                    isMasking: isMasking
                }));

                this._setClassname();
                this._initDisplayContent();
            }, this));
        },

        //getFormData: function() {
        //    return this.appletDocModel.toJSON();
        //},

        _initDisplayContent: function () {
            var sourceData = this.appletDocModel.get(this.getCid());
            var displayContent = lang['자동입력'];
            var displayContentView;

            if (sourceData) {
                displayContentView = this._createOrGetDisplayView(sourceData);
                displayContent = displayContentView.convert().toHtml();

                this._getInputElement().data('source', sourceData);
            }

            this._getContentEl().html(displayContent);
        },

        _setClassname: function () {
            var classnames = ['wrap_txt'];

            this._getContentEl().attr('class', '');
            if (this.isEditable()) {
                classnames.push('disabled');
            }
            this._getContentEl().addClass(classnames.join(' '));
        },

        _gerSourceData: function () {
            return this.appletDocModel.get(this.getCid());
        },

        /**
         * 원본 소스데이터는 배열 및 객체가 될 수도 있으므로, 엘리먼트의 data에 저장해야 한다.
         * @param sourceData
         * @private
         */
        _setSourceData: function (sourceData) {
            var source;

            if (this.displayContentView) {
                // 필드매핑 컴포넌트의 ValueType을 참고하면 안됨.
                // 이유는 Select 타입의 컴포넌트가 매핑이 되면 ValueType이 STEXT | STEXTS가 되므로
                // 텍스트와 구분이 힘들기 때문이다.
                switch (this.displayContentView.getValueType()) {
                    case ValueType.SELECT:
                    case ValueType.SELECTS:
                        source = this.displayContentView.getSource();
                        break;
                    default:
                        source = sourceData;
                        break;
                }
            }

            this.appletDocModel.set(this.getCid(), source);
        },

        _onAppletDocAdded: function (clientId, appletDoc, fieldList) {
            // 연결된 컴포넌트일 경우에만 반응한다.
            if (this.model.get(KEY_TARGET_COMPONENT) != clientId) {
                return;
            }

            // 이미 설정되어 있으면 하지 않음
            //if(this._hasMappedData()) {
            //    return;
            //}

            if (!this._getVisible()) return;

            this._fetchAndInputContent(appletDoc, fieldList);
        },

        _fetchAndInputContent: function (appletDoc, fieldList) {
            var appletDocModel = new AppletDocModel(appletDoc);
            var fieldInfo = this._getFieldInfo(fieldList);

            this._setContent(appletDocModel, fieldInfo);
        },

        _getFieldInfo: function (fieldList) {
            var fieldInfo = _.findWhere(fieldList || [], {cid: this.model.get(KEY_TARGET_FIELD)});
            var componentManager = ComponentManager.getInstance(this.viewType);
            var component = componentManager.getComponent(this.getCid());
            var integrationModel = component.getIntegrationModel();
            return _.extend(fieldInfo, integrationModel.getPropertiesByMappingComponentId(this.clientId));
        },

        /**
         * 데이터 연동앱에서 연동된 문서가 삭제되었을 경우 핸들러
         *
         * - 삭제되면 mapping 여부 상관없이 clear 시킨다. 어짜피 첫번째 appletDocModel을 넘겨주기 때문에
         *   다시 그리면 된다.
         *
         * @param clientId
         * @param removedDocId
         * @param firstAppletDoc
         * @param fieldList
         * @private
         */
        _onAppletDocRemoved: function (clientId, removedDocId, firstAppletDoc, fieldList) {
            // 연결된 컴포넌트일 경우에만 반응한다.
            if (this.model.get(KEY_TARGET_COMPONENT) != clientId) {
                return;
            }

            this._clearContent();
            if (firstAppletDoc && _.keys(firstAppletDoc).length > 0) {
                this._fetchAndInputContent(firstAppletDoc, fieldList);
            }
        },

        _hasMappedData: function () {
            return !!this._gerSourceData();
        },

        _getInputElement: function () {
            return this.$el.find('input[name="' + this.getCid() + '"]');
        },

        _clearMappedData: function () {
            this.appletDocModel.set(this.getCid(), null);
        },

        /**
         * 컨텐츠 세팅
         *
         * 데이터 연동 컴포넌트에서 문서가 추가될때는 대상 컴포넌트의 valuetype을 알아야 하는 문제가 있음
         * @param appletDocModel
         * @param fieldInfo
         * @private
         */
        _setContent: function (appletDocModel, fieldInfo) {
            var cid = this.model.get(KEY_TARGET_FIELD);
            var sourceData = appletDocModel.getValue(cid);
            var componentManager = ComponentManager.getInstance(this.viewType);
            var myComponent = componentManager.getComponent(this.getCid());
            var valueType = myComponent.getValueType();
            var displayContentView = this._createOrGetDisplayView(sourceData);

            if (fieldInfo) {
                valueType = fieldInfo.valueType;
                displayContentView.setFieldInfo(fieldInfo);
            }

            displayContentView.setValueType(valueType);

            this._getContentEl().html(displayContentView.convert().toHtml());
            this._setSourceData(sourceData);
        },

        _createOrGetDisplayView: function (sourceData, valueType) {
            var componentManager = ComponentManager.getInstance(this.viewType);
            var myComponent = componentManager.getComponent(this.getCid());
            if (_.isUndefined(valueType)) {
                valueType = myComponent.getValueType();
            }

            if (this.displayContentView) {
                this.displayContentView
                    .setSource(sourceData)
                    .setValueType(valueType);
            } else {
                var integrationModel = myComponent.getIntegrationModel();
                var properties = integrationModel.getPropertiesByMappingComponentId(this.clientId);
                this.displayContentView = DisplayContentView.create(sourceData, valueType, properties);
            }

            return this.displayContentView;
        },

        _clearContent: function () {
            var $input = this._getInputElement();
            $input.val('');
            $input.data('source', null);
            this._clearMappedData();
            this._getContentEl().html(lang['자동입력']);
        },

        _getDisplayTextId: function () {
            return this.getCid() + '-displayText';
        },

        _getContentEl: function () {
            return this.$body.find('#' + this._getDisplayTextId());
        }
    });

    var DetailView = BaseDetailView.extend({

        initialize: function () {
            BaseDetailView.prototype.initialize.apply(this, arguments);

            var appletDocComponentCid = this.model.get('targetComponentCid');
            var componentManager = ComponentManager.getInstance(this.viewType);
            var appletDocComponent = componentManager.getComponent(appletDocComponentCid);
            var propModel = appletDocComponent ? appletDocComponent.getComponentPropertyModel() : null;
            this.masking = new Masking({appletId: propModel ? propModel.get('integrationAppletId') : null});
            if (propModel && propModel.get('integrationAppletId') && this.appletDocModel.id) {
                this.masking.fetch();
            } else {
                this.masking.deferred.resolve();
            }
        },

        render: function () {
            this.masking.deferred.done(_.bind(function () {
                var isMasking = _.contains(this.masking.get('fieldCids'), this.model.get('targetFieldCid'));
                this.$body.html(renderDetailTpl({
                    model: this.model.toJSON(),
                    label: GO.util.escapeHtml(this.model.get('label')),
                    userData: this._getDisplayHtml(),
                    isMasking: isMasking,
                    lang: lang
                }));
            }, this));
        },

        getTitle: function () {
            var displayContentView = this._getDisplayContentView();
            return displayContentView.convert().toText();
        },

        _getDisplayContentView: function () {
            var sourceData = this.appletDocModel.get(this.clientId);
            var componentManager = ComponentManager.getInstance(this.viewType);
            var myComponent = componentManager.getComponent(this.clientId);

            if (this.displayContentView) {
                this.displayContentView
                    .setSource(sourceData)
                    .setValueType(myComponent.getValueType());
            } else {
                var integrationModel = myComponent.getIntegrationModel();
                var properties = integrationModel.getPropertiesByMappingComponentId(this.clientId);
                this.displayContentView = DisplayContentView.create(sourceData, myComponent.getValueType(), properties);
            }

            return this.displayContentView;
        },

        _getDisplayHtml: function () {
            var displayContentView = this._getDisplayContentView();
            return displayContentView.convert().toHtml();
        }
    });

    var FieldMappingComponent = FormComponent.define(ComponentType.FieldMapping, {
        name: lang['연동컴포넌트 매핑'],
        valueType: ValueType.STEXT,
        group: 'extra',

        properties: {
            "label": {defaultValue: lang['연동컴포넌트 매핑']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            // 매핑 대상 앱 ID
            "targetAppletId": {defaultValue: null},
            // 매핑 대상 앱 이름
            "targetAppletName": {defaultValue: ''},
            // 매핑할 대상 데이터연동 앱 ID
            "targetComponentCid": {defaultValue: ''},
            // 매핑할 대상 데이터연동 컴포넌트의 라벨(삭제될 경우 표시를 위해 남김)
            "targetComponentLabel": {defaultValue: ''},
            // 대상앱의 필드 CID
            "targetFieldCid": {defaultValue: ''},
            // 대상앱의 필드 라벨(삭제될 경우 표시를 위해 남김
            "targetFieldLabel": {defaultValue: ''}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(FieldMappingComponent);
});
