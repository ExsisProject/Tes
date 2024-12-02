define('works/components/formbuilder/core/views/base_option', function (require) {
    var Hogan = require('hogan');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var BaseComponentView = require('works/components/formbuilder/core/views/base_component');
    var ColorPicker = require('calendar/views/color_picker');

    var Fields = require('works/collections/fields');
    var Conditions = require('works/components/filter/collections/filter_conditions');
    var Condition = require('works/components/filter/models/filter_condition');
    var FilterView = require('works/components/filter/views/filter');
    var FilterTemplate = require('hgn!works/templates/app/_filter_manager');

    var ComponentType = require('works/constants/component_type');
    var DesignComponentType = require('works/constants/design_component_type');

    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var taskLang = require('i18n!task/nls/task');
    var lang = {
        "코드": worksLang['코드'],
        "코드 설명": worksLang['코드 설명'],
        "코드 검증오류 메시지": worksLang['코드 검증오류 메시지'],
        "코드 검증오류 자동생성 알림": worksLang['코드 검증오류 자동생성 알림'],
        "날짜수식 연산자 검증오류 메시지": worksLang['날짜수식 연산자 검증오류 메시지'],
        '이름': commonLang['이름'],
        '강조': taskLang['강조']
    };
    var codeTemplate = Hogan.compile([
        '<li>',
        '<div><label for="">{{lang.코드}}</label></div>',
        '<div><input type="text" name="code" value="{{code}}" class="txt_mini tool_txt" title="{{lang.코드}}" {{#disabled}}disabled="disabled"{{/disabled}}></div>',
        '<p> * {{lang.코드 설명}}</p>',
        '</li>'
    ].join(''));
    var ruleTemplate = Hogan.compile([
        '<li>',
        '<div>',
        '<span class="txt">', '노출 조건 설정', '</span>',
        //'<span class="ic_works ic_help_type1"></span>',
        '<span class="edit_title_sub" id="addRule">',
        '<i class="ic_works ic_add"></i>',
        '설정',
        '</span>',
        '</div>',
        '<div class="wrap_name_tag link_exposure">',
        '<ul class="name_tag" data-el-conditions></ul>',
        '</div>',
        '<div class="wrap_input_sub" data-el-not style="display: none;">',
        '<input type="checkbox" class="tool_chk" name="" id="not">',
        '<label for="not">', 'NOT(위 조건이 아닌 경우 노출)', '</label>',
        '</div>',
        '</li>'
    ].join('\n'));

    var subFormOptionTmpl = Hogan.compile(['<li>{{lang.subformOptionDesc}}</li>'].join('\n'));

    var DEFAULT_COLOR_CODE = '0';

    return BaseComponentView.extend({

        clientId: null,
        tagName: 'ul',

        events: function () {
            return _.extend({}, {
                'blur input[name=label]': '_checkLabel',
                'blur input[name=code]': '_checkCode',
                "keyup input[type=text]:not(.has-custom-event)": '_updateText',
                "focusout input[type=text]:not(.has-custom-event)": '_updateText',
                "click input[type=checkbox]:not(.has-custom-event)": '_updateCheckbox',
                "click input[type=radio]:not(.has-custom-event)": '_updateRadio',
                'click #addRule': '_onClickAddRule',
                'click #not': '_onClickNot',
                "change select:not(.has-custom-event)": '_updateSelect',
                'click [data-color-picker]': '_onClickColorPicker'
            }, _.result(this, 'customEvents') || {});
        },

        initialize: function (options) {
            options = options || {};
            this.clientId = options.clientId;
            this.subFormId = options.subFormId;
            this.$el.addClass('form-component-option');
        },

        render: function () {
            this._getListenableFields();
            this._getUserFields();
            this._initConditions();

            var isDesignType = _.contains(DesignComponentType.DESIGN_TYPE, this.options.type);
            var mainForm = GO.util.isInvalidValue(this.subFormId);

            if (mainForm) {
                this.renderBody();
                this._renderNameColorPallet();
                this._selectOptions();
                this._renderRules();
                if (this._isUsingCodeTypes()) this._renderCode();
            } else {
                if (isDesignType) {
                    this.renderBody();
                } else {
                    this.$el.empty();
                    this.$el.append(subFormOptionTmpl.render({
                        lang: {
                            "subformOptionDesc": worksLang['하위폼 속성변경 불가 경고']
                        }
                    }));
                }
            }
        },

        _renderNameColorPallet: function () {
            var $labels = this.$('label:contains(' + lang['이름'] + ')');
            var label = _.find($labels, function (el) {
                return $(el).text() === lang['이름'];
            });
            var color = this.model.get('color') || DEFAULT_COLOR_CODE;
            $(label).after(
                '<span class="optional">' +
                '<span class="on normalmode chip bgcolor' + color + '" data-color-picker>' +
                '</span>'
            );
        },

        _onClickColorPicker: function (e) {
            if (!this.colorPicker) {
                this.colorPicker = new ColorPicker({
                    useAddition: true,
                    useAdditionInput: true,
                    additionText: lang['강조']
                });
                this.colorPicker.on('changed:chip-color', _.bind(this._onChangeChipColor, this));
                this.colorPicker.on('changed:addition-checkbox', _.bind(this._onChangeBold, this));
            }
            this.colorPicker.show(e, 'works');
        },

        _onChangeBold: function (isChecked) {
            this.model.set('bold', isChecked);
        },

        _onChangeChipColor: function (code) {
            this.model.set('color', code);
            this.$('[data-color-picker]').removeClass(function (index, className) {
                return (className.match(/(^|\s)bgcolor\S+/g) || []).join(' ');
            }).addClass('bgcolor' + code);
        },

        _getFields: function () {
            return new Fields(ComponentManager.getFields(), {appletId: this.options.appletId});
        },

        _getListenableFields: function () {
            var fields = this._getFields();
            this.listenableFields = this._getFields();
            this.listenableFields.reset(fields.getListenableFields().toJSON());
            this.listenableFields.deferred.resolve();
            return this.listenableFields;
        },

        _getUserFields: function () {
            var fields = this._getFields();
            this.userFields = fields.getUserFields();
            this.userFields.deferred.resolve();
            return this.userFields;
        },

        /**
         * @abstract
         */
        renderBody: function () {
        },

        /**
         * @abstract
         */
        validate: function () {
        },

        _updateText: function (e) {
            var $target = $(e.currentTarget);
            var targetName = $target.attr('name');
            var newValue = $target.val();
            var oldValue = this.model.get(targetName);
            this.model.set(targetName, newValue);

            // 자동계산 수식타입일 경우 연산자 체크
            if (targetName == 'expression') {
                if (_.contains(["day", "time"], this.model.get("expressionType")) && _.contains(["*", "/", "%"], e.key)) {
                    this._initInputText($target, targetName, oldValue);
                    $.goSlideMessage(lang['날짜수식 연산자 검증오류 메시지']);
                } else {
                    if ($target.val() != "") { // 날짜자동계산 수식
                        this._onFormulaPropertiesUpdate();
                    }
                }
            }
            /* GO-28214 GO-32285 입력항목 컴포넌트 공통으로 이름, 설명, 기본값, 접사 표기 에 입력된 문자열이
             * json-lib에서 json <-> model converting 될 때 특정포맷형식의 string 을 배열로 인식하는 이슈가 발생
             * 특정포맷: 대괄호로 묶여 있고 대괄호 안에 공백 포함 '.', '-', '+', '숫자' 로 시작하는 string 는 배열로 인식하는 문제
             * ex) [ 1인당 평균 임금 ], [ 4. a팀 지출 ], [ +금일항목+ ] 등등
             */
            else if (_.contains(["label", "guide", "defaultValue", "unitText"], targetName)) {
                this._bracketValidation($target, targetName, oldValue);
            }

        },

        _initInputText: function ($target, targetName, oldValue) {
            $target.val(oldValue);
            this.model.set(targetName, oldValue);
        },

        _bracketValidation: function ($target, targetName, oldValue) {
            var pattern = /^\[([\s]*[\d\.\+\-]+)+(.)*\]$/g;
            if (pattern.test($.trim($target.val()))) {
                this._initInputText($target, targetName, oldValue);
                $.goSlideMessage(worksLang['대괄호 입력포맷 오류 설명']);
            }
        },

        _updateRadio: function (e) {
            var $target = $(e.currentTarget);
            if ($target.is(':checked')) {
                this.model.set($target.attr('name'), $target.val());
            }
        },

        _updateSelect: function (e) {
            var $target = $(e.currentTarget);
            this.model.set($target.attr('name'), $target.val());
        },

        _updateCheckbox: function (e) {
            var $target = $(e.currentTarget);
            var key = $target.attr('name');
            var savedValue = this.model.get(key);
            /**
             * 폼빌더 구조 결함 대응.
             * 템플릿의 경우 디폴트 값을 무시 하고 서버 값을 그대로 사용함.
             */
            if (_.isUndefined(savedValue)) { // true or false or undefined
                if ($target.attr('data-default') === 'true') savedValue = true;
                if ($target.attr('data-default') === 'false') savedValue = false;
            }

            if (_.isBoolean(savedValue)) {
                this.model.set(key, $target.is(':checked'));
            } else if (_.isArray(savedValue)) {
                this.model.set(key, savedValue.push($target.val()));
            } else {
                this.model.set(key, [$target.val()]);
            }
        },

        _onFormulaPropertiesUpdate: function () {
            var expression = this.model.get('expression');
            var dateTypesAndFormulaComponents = this._getComponentsByDateTypesAndFormulaType();
            var dateValueTypes = [];
            _.each(dateTypesAndFormulaComponents, function (component) {
                var propModel = component.getComponentPropertyModel();
                var code = propModel.get('code') || "";
                if (code.length > 0 && expression.indexOf(code) != -1) {
                    if (component.getType() == ComponentType.Formula) {
                        dateValueTypes.push(propModel.get('dateValueType'));
                    } else {
                        dateValueTypes.push(component.getValueType());
                    }
                }
            }, this);

            var dateValueType;

            if (_.contains(dateValueTypes, "DATE") && _.contains(dateValueTypes, "DATETIME")) {
                _.each(dateValueTypes, function (type) {
                    if (!_.contains(["DATE", "DATETIME"], type)) {
                        dateValueType = NaN;
                        return false;
                    } else {
                        dateValueType = "DATETIME";
                    }
                });
            } else {
                _.each(dateValueTypes, function (type, index) {
                    if (index > 0 && dateValueTypes[index - 1] != type) {
                        dateValueType = NaN;
                        return false;
                    } else {
                        dateValueType = type;
                    }
                });
            }

            this.model.set('dateValueType', dateValueType);
        },

        _selectOptions: function () {
            var self = this;
            this.$('select').each(function () {
                var key = $(this).attr('name');
                var prop = self.model.get(key);
                if (prop) {
                    $(this).val(prop);
                }
            });
        },

        _onClickNot: function () {
            var rule = this.model.get('rule');
            rule.isInverse = this.$('#not').is(':checked');
            this.model.set('rule', rule);
        },

        _onClickAddRule: function () {
            var backupConditions = this.conditions.clone();
            var $popup = $.goPopup({
                header: worksLang['노출 조건 설정'],
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    callback: $.proxy(function () {
                        this._setRules();
                        this._renderRuleItems();
                        this._toggleNotCondition();
                    }, this)
                }, {
                    btext: commonLang["취소"],
                    btype: "normal",
                    callback: $.proxy(function () {
                        this.conditions = backupConditions;
                    }, this)
                }]
            });

            var filterView = new FilterView({
                useCheckbox: false,
                template: FilterTemplate,
                buttonText: worksLang['조건설정'],
                fields: this.listenableFields,
                conditions: this.conditions,
                store: false
            });
            $popup.find('.content').html(filterView.render().el);
            $popup.on('clickOption', $.proxy(function (e, data) {
                var field = this.listenableFields.findWhere({cid: data.value});
                if (!field) return;
                var condition = new Condition(field.fieldToCondition());
                if (_.isEmpty(condition)) return;
                this.conditions.each(function (model) {
                    model.trigger('unusedItem');
                });
                this.conditions.push(condition);
                filterView.addConditionButton({
                    valueType: field.get('valueType'),
                    model: condition
                })
            }, this));

            $popup.on('onClickListItem', function () {
                $.goMessage(commonLang['추가되었습니다.']);
            });
        },

        _renderRuleItems: function () {
            var condition = this.conditions.at(0);
            var $conditions = this.$('[data-el-conditions]');
            $conditions.empty();
            if (!condition) return;
            var label = condition.get('label') + ':' + condition.getLabelText();
            $conditions.append('<li>' + label + '</li>');
        },

        _renderRules: function () {
            this.$el.append(ruleTemplate.render({
                lang: lang
            }));
            this._renderRuleItems();
            this._toggleNotCondition();
            this._setNotCondition();
        },

        _toggleNotCondition: function () {
            this.$('[data-el-not]').toggle(!!this.conditions.length);
        },

        _setNotCondition: function () {
            var rule = this.model.get('rule');
            var isInverse = rule ? rule.isInverse : false;
            this.$('#not').prop('checked', isInverse);
        },

        _setRules: function () {
            var rule = {};
            var condition = this.conditions.at(0);
            if (condition) {
                var $not = this.$('#not');
                var values = condition.get('values').values;
                rule = {
                    listenComponentId: condition.get('fieldCid'),
                    isInverse: $not.is(':visible') ? this.$('#not').is(':checked') : false,
                    values: values ? values : condition.get('values')
                };
            }

            this.model.set('rule', rule);
        },

        _getConditionByCid: function (cid) {
            // GO-24326 [works] 노출 조건에 사용된 항목을 삭제한 경우 항목이 나오지 않는 현상
            // 처음 한번만 셋 하는게 아니라 호출 시점에 filed 값을 가져오도록 수정
            this.listenableFields = this._getListenableFields();
            var field = this.listenableFields.findWhere({cid: cid});
            if (!field) return {};
            return new Condition(field.fieldToCondition());
        },

        _initConditions: function () {
            var rule = this.model.get('rule');
            var condition = {};
            this.conditions = new Conditions();
            if (rule) {
                condition = this._getConditionByCid(rule.listenComponentId);
                if (!_.isEmpty(condition)) {
                    condition.set('values', _.isArray(rule.values) ? {values: rule.values} : rule.values);
                    this.conditions.push(condition);
                } else {
                    this.model.set('rule', {});
                }
            }
        },

        _renderCode: function () {
            var code = this._createOrGetCode();
            this.$el.append(codeTemplate.render({
                lang: lang,
                code: code,
                disabled: this._isPredefinedTypes()
            }));
        },

        _checkCode: function () {
            var newCode = this.$('input[name=code]').val();
            if (!this._isValidCode(newCode, this.clientId)) {
                var msg = lang['코드 검증오류 메시지'];

                var oldCode = this._getOldCode();
                if (oldCode && this._isValidCode(oldCode, this.clientId)) {// 기존 code가 유효할 경우, 기존 code로 복구
                    newCode = oldCode;
                } else {
                    newCode = this._generateCode();
                    msg.concat(lang['코드 검증오류 자동생성 알림']);
                }

                $.goSlideMessage(msg);
                this.model.set('code', newCode);
                this.$('input[name=code]').val(newCode);
            }
        },

        _getOldCode: function () {
            if (_.isUndefined(this.component) || _.isUndefined(this.component.properties)) {
                return undefined;
            }
            return this.component.properties.code;
        },

        _checkLabel: function () {
            var $label = this.$('input[name="label"]');
            if ($label.val() === '') {
                var component = ComponentManager.getComponent(this.clientId);
                $label.val(component.name);
                this.model.set('label', component.name);
            }
        },

        _isUsingCodeTypes: function () {
            var component = ComponentManager.getComponent(this.clientId);
            return !!component.valueType;
        },

        _getComponentsByDateTypesAndFormulaType: function () {
            var dateComponents = ComponentManager.getComponentsByType(ComponentType.Date);
            var timeComponents = ComponentManager.getComponentsByType(ComponentType.Time);
            var dateTimeComponents = ComponentManager.getComponentsByType(ComponentType.Datetime);
            var formulaComponents = ComponentManager.getComponentsByType(ComponentType.Formula);
            return _.union(dateComponents, timeComponents, dateTimeComponents, formulaComponents);
        }
    });
});
