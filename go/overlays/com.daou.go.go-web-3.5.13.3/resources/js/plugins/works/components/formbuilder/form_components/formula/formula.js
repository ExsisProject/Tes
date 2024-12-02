define('works/components/formbuilder/form_components/formula/formula', function (require) {
    var GO = require('app');

    var ComponentType = require('works/constants/component_type');
    var ValueType = require('works/constants/value_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var FormulaUtil = require('works/components/formbuilder/form_components/formula/formula_util');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/formula/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/formula/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/formula/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    require("jquery.go-popup");

    var lang = {
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "자동 계산": worksLang['자동 계산'],
        "자동입력": worksLang["자동입력"],
        "수식": worksLang["수식"],
        "입력 너비 조절": worksLang["입력 너비 조절"],
        "접사 표기": worksLang["접사 표기"],
        "접두사": worksLang["접두사"],
        "접미사": worksLang["접미사"],
        "소수점 자리 수": worksLang["소수점 자리 수"],
        "1,000 단위 쉼표 표시": worksLang["1,000 단위 쉼표 표시"],
        "이름숨기기": worksLang["이름숨기기"],
        "수식 타입": worksLang["수식 타입"],
        "수식 타입을 선택하세요": worksLang["수식 타입을 선택하세요"],
        "숫자 계산": worksLang["숫자 계산"],
        "일 계산": worksLang["일 계산"],
        "시간 계산": worksLang["시간 계산"],
        "일": worksLang["일"],
        "시간": worksLang["시간"],
        "분": worksLang["분"],
        "수식 검증오류 메시지": worksLang['수식 검증오류 메시지']
    };

    var defaultValues = {
        thousandComma: true,
        width: 250,
        widthUnit: 'px',
        fixType: 'postfix',
        decimalPoints: 2,
        expressionType: 'number',	// number, day, time 만 가능(number 이 기본값)
        expression: ''
    };

    // 자바스크립트 생성자에 apply를 적용시키는 방법
    // http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
    function applyToConstructor(Constructor) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            var Temp = function () {
                }, // temporary constructor
                inst, ret; // other vars

            // Give the Temp constructor the Constructor's prototype
            Temp.prototype = Constructor.prototype;

            // Create a new instance
            inst = new Temp;

            // Call the original Constructor with the temp
            // instance as its context (i.e. its 'this' value)
            ret = Constructor.apply(inst, args);

            // If an object has been returned then return it otherwise
            // return the original instance.
            // (consistent with behaviour of the new operator)
            return Object(ret) === ret ? ret : inst;
        }
    }

    function convertDisplayText(sourceData, options) {
        var result = sourceData;
        var opts = _.extend({}, defaultValues, options || {});

        if (!_.isNumber(sourceData) || _.isNaN(sourceData)) {
            return sourceData;
        }

        if (opts.dateValueType != NaN) {
            if (opts.expressionType == "time") {
                if (opts.dateValueType == ValueType.TIME) {
                    result = FormulaUtil.timeToTimeDisplayText(result);
                } else if (opts.dateValueType == ValueType.DATE || opts.dateValueType == ValueType.DATETIME) {
                    result = FormulaUtil.dateTimeToTimeDisplayText(result);
                }
            } else if (opts.expressionType == "day") {
                if (opts.dateValueType == ValueType.DATE || opts.dateValueType == ValueType.DATETIME) {
                    result = FormulaUtil.dateTimeToDayDisplayText(result);
                }
            } else {
                if (opts.thousandComma && _.isNumber(sourceData) && !_.isNaN(sourceData)) {
                    result = addThousandCommas(result);
                }
            }
        } else {
            result = NaN;
        }

        function addThousandCommas(data) {
            return GO.util.numberWithCommas(data);
        }

        return result;
    }

    var DisplayViewTrait = {
        _isPrefix: function () {
            return this.model.get('fixType') === 'prefix';
        },

        _isDayOrTimeExpType: function () {
            return this.model.get('expressionType') == 'day' || this.model.get('expressionType') == 'time';
        },

        _convertDisplayText: function (sourceData) {
            return convertDisplayText(sourceData, this.model.toJSON());
        }
    };

    var OptionView = BaseOptionView.extend(_.extend({}, {
        customEvents: {
            "blur input[name=expression]": "_validateExpression",
            "change select[name=expressionType]": '_updateSelectExpressionType'
        },

        renderBody: function () {


            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON(),
                isPrefix: this._isPrefix(),
                isDayOrTime: this._isDayOrTimeExpType()	// 날짜/시간/날짜와시간 자동계산 일 경우 소수점, 1,000 표시 하지 않음
            }));
        },

        _updateSelectExpressionType: function (e) {
            var $target = $(e.currentTarget);
            if ("day" == $target.val() || "time" == $target.val()) {
                this.$el.find('li[name=decimalPoints]').hide();
                this.$el.find('li[name=thousandComma]').hide();
            } else {
                this.$el.find('li[name=decimalPoints]').show();
                this.$el.find('li[name=thousandComma]').show();
            }
        },

        _validateExpression: function (e) {
            var $input = $(e.currentTarget);
            var expression = $input.val();

            // 수식포맷이 맞거나, 금지된 스크립트 함수 형태가 사용되었는지 체크
            if (this._testInvalidPattern(expression) || this._testBanPettern(expression)) {
                $.goSlideMessage(lang['수식 검증오류 메시지']);
                this.model.set('expression', defaultValues.expression);
                $input.val(defaultValues.expression);
            }
        },

        /**
         * 수식에 허용된 문자외의 문자가 포함되었는지 검사
         * @param str
         * @returns {boolean}
         * @private
         */
        _testInvalidPattern: function (str) {
            var pattern = /[^a-zA-Z0-9_\s\.\+\*\-\%\/\(\)]/gi;
            return pattern.test(str);
        },

        /**
         * 수식에 금지해야할 자바스크립트 함수들이 포함되어 있는지 검사
         *
         * _testValidPattern이 영문및 숫자, -,_,(,) 등을 허용하고 있으므로, 자바스크립트 함수를
         * 입력할 수있어서, 별도로 방어할 필요가 있음.
         *
         * 함수는 항상 `func(`로 시작하므로 이런 패턴을 잡아내는 방식으로 처리.
         * 그러나, 블랙리스트를 관리하는 방식이기 때문에 구멍이 있을수 있기 때문에 추후 개선 필요(다른 방안 모색 필요)
         *
         * [ 방어대상 함수 ]
         * - alert
         * - setInterval
         * - setTimeout
         * - $. 로 시작하는 jQuery 함수들.
         * - GO. 으로 시작하는 함수들
         * - _. 으로 시작하는 함수들
         *
         * @param str
         * @returns {boolean}
         * @private
         */
        _testBanPettern: function (str) {
            var pattern = /alert\(|setInterval\(|setTimeout\(|\$\.|_\.|GO\./gi;
            return pattern.test(str);
        },

        _isPrefix: function () {
        },
        _convertDisplayText: function () {
        }
    }, DisplayViewTrait));

    var FormView = BaseFormView.extend(_.extend({}, {
        __listening__: {},

        initialize: function () {
            BaseFormView.prototype.initialize.apply(this, arguments);
            this.__listening__ = {};
        },

        render: function () {
            var sourceData = this.appletDocModel.get(this.getCid());
            var expressionLabel = this._getExpressionLabel();
            var placeholder = lang['자동입력'] + (expressionLabel ? '(' + expressionLabel + ')' : '');
            this.$body.html(renderFormTpl({
                clientId: this.clientId,
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                sourceData: sourceData,
                displayText: this._convertDisplayText(sourceData),
                isPrefix: this._isPrefix(),
                title: placeholder,
                placeholder: placeholder
            }));

            this._listenToFormulaSource();

            if (this.appletDocModel.isNew()) {
                this._setContent();
            }

            this.resizeWidth(this.model.get('width'), this.model.get('widthUnit'));
        },

        remove: function () {
            BaseFormView.prototype.remove.apply(this, arguments);
        },

        getFormData: function () {
            var returnData = {};
            returnData[this.getCid()] = this._gerSourceData();
            return returnData;
        },

        /**
         * @Override
         */
        resizeWidth: function (width, unit) {
            this._getInputElement().outerWidth(width + unit);
        },

        _getExpressionLabel: function () {
            var components = this._getFormulaSourceAndFormulaComponents();
            var expressionLabel = this.model.get('expression');
            var expressionUnits = FormulaUtil.getExpressionCodes(expressionLabel);

            _.each(components, function (component) {
                var properties = component.properties;
                // GO-29538 자동계산 수식 이슈로 이슈 처리전 공백포함한 코드가 있을 수 있으므로 공백 제거
                var code = properties.code ? (properties.code.replace(/ /gi, "")) : properties.code;
                if (code != "" && _.indexOf(expressionUnits, code) > -1) {
                    expressionLabel = expressionLabel.replace(code, properties.label);
                }
            });
            return expressionLabel;
        },

        _getInputElement: function () {
            return this.$el.find('input[name="' + this.clientId + '"]');
        },

        _listenToFormulaSource: function () {
            _.each(this._getFormulaSourceAndFormulaComponentCids(), function (cid) {
                this.appletDocModel.on('change:' + cid, $.proxy(function () {
                    this._setContent();
                }, this));
                this.__listening__[cid] = cid;
            }, this);
        },

        _getFormulaSourceAndFormulaComponents: function () {
            var formulaComponents = ComponentManager.getComponentsByType(ComponentType.Formula);
            var dateComponents = ComponentManager.getComponentsByType(ComponentType.Date);
            var timeComponents = ComponentManager.getComponentsByType(ComponentType.Time);
            var dateTimeComponents = ComponentManager.getComponentsByType(ComponentType.Datetime);
            var numberComponents = ComponentManager.getComponentsByType(ComponentType.Number);
            return _.union(numberComponents, dateComponents, timeComponents, dateTimeComponents, formulaComponents);
        },

        _getFormulaSourceAndFormulaComponentCids: function () {
            var targetCids = [];
            _.each(this._getFormulaSourceAndFormulaComponents(), function (component) {
                targetCids.push(component.getCid())
            });
            return targetCids;
        },

        _setPlaceholderText: function () {
            var expressionLabel = this._getExpressionLabel();
            var placeholder = lang['자동입력'] + (expressionLabel ? '(' + expressionLabel + ')' : '');
            this._getInputElement().attr('placeholder', placeholder);
            this._getInputElement().attr('title', placeholder);
        },

        _setContent: function () {
            try {
                var formulaFunc = this._getNumberFormulaFunc();
                var $input = this._getInputElement();
                var result;

                var expressionType = this.model.get('expressionType');
                if (this.model.get('dateValueType') == ValueType.TIME) {
                    formulaFunc = this._getNumberFormulaFunc();
                    result = formulaFunc.apply(null, this._convertNumberValueList()), this.model.get('decimalPoints');
                } else if ("day" == expressionType || "time" == expressionType) {
                    formulaFunc = this._getDateTypesFormulaFunc();
                    result = formulaFunc.apply(null, this._convertNumberValueList()), this.model.get('decimalPoints');
                } else {
                    formulaFunc = this._getNumberFormulaFunc();
                    result = GO.util.fixFloatingPoint(formulaFunc.apply(null, this._convertNumberValueList()), this.model.get('decimalPoints'));
                }

                var displayText = '';

                this.appletDocModel.set(this.clientId, result);

                if (_.isNumber(result) && !_.isNaN(result)) {
                    displayText = this._convertDisplayText(result);
                    if (displayText === "") {
                        this._setPlaceholderText();
                    }
                } else {
                    result = null;
                    this._setPlaceholderText();
                }

                $input.val(displayText);
                $input.attr('data-source', result);
            } catch (e) {
                // 아무 처리 하지 않는다.
            }
        },

        _gerSourceData: function () {
            var $input = this._getInputElement();
            return parseFloat($input.attr('data-source'));
        },

        _getNumberFormulaFunc: function () {
            var params = this._convertNumberVarList();
            var expression = this.model.get('expression');
            var funcBody = 'return ' + (expression ? expression : 'void(0)') + ';';
            var formulaFunc;

            params.unshift(Function);
            params.push(funcBody);

            try {
                formulaFunc = applyToConstructor.apply(undefined, params);
                return formulaFunc();
            } catch (e) {
                return function () {
                };
            }
        },

        _getDateTypesFormulaFunc: function () {
            var params = this._convertNumberVarList();
            // 추후 날짜 디테일한 수식 계산이 필요함(Date, Datetime는 unix time로 계산하므로 수식계산 식으로 converting 작업이 필요)
//            var expression = this._converDateToNumberExpression(this.model.get('expression'));
            var expression = this.model.get('expression');
            var funcBody = 'return ' + (expression ? expression : 'void(0)') + ';';
            var formulaFunc;

            params.unshift(Function);
            params.push(funcBody);

            try {
                formulaFunc = applyToConstructor.apply(undefined, params);
                return formulaFunc();
            } catch (e) {
                return function () {
                };
            }
        },

        _converDateToNumberExpression: function (expression) {
            expression = expression.replace(/ /gi, '');	// 공백 제거
            var tmpArr = expression.split(/\-|\+|\(|\)|\{|\}|\[|\]/g);
            _.each(tmpArr, function (str) {
                var parseIntVal = parseInt(str);
                if (_.isNumber(parseIntVal) && !_.isNaN(parseIntVal)) {
                    var num = parseIntVal * 1000 * 60;
                    expression = expression.replace(str, num);
                }
            });
            return expression;
        },

        _convertNumberVarList: function () {
            var params = [];
            _.each(this.__listening__, function ($target, cid) {
                var component = ComponentManager.getComponent(cid);

                if (component) {
                    var propModel = component.getComponentPropertyModel();
                    var code = propModel.get('code');
                    if (code && code.length > 0) {
                        params.push(code)
                    }
                }
            });

            return params;
        },

        _convertNumberValueList: function () {
            var values = [];
            _.each(this.__listening__, function (cid) {
                var componentManager = ComponentManager.getInstance(this.viewType);
                var component = componentManager.getComponent(cid);
                var formulaCom = componentManager.getComponent(this.clientId);
                var cidValue = this.appletDocModel.get(cid);

                var val;

                if (ValueType.DATE == component.getValueType()) {
                    if (_.isString(cidValue) && cidValue.length > 0) {
                        var date = new Date(cidValue.substring(0, 4), cidValue.substring(4, 6) - 1, cidValue.substring(6, 8));
                        val = parseInt(date.getTime());
                    } else {
                        val = NaN;
                    }
                } else if (ValueType.TIME == component.getValueType()) {
                    if (cidValue && cidValue.length > 0) {
                        val = this._strTimeToNumMinute(cidValue);
                    } else {
                        val = parseInt(cidValue);
                    }
                } else if (ValueType.DATETIME == component.getValueType()) {
                    if (_.isString(cidValue) && cidValue.length > 0) {
                        var date = new Date(cidValue);
                        val = parseInt(date.getTime());
                    } else if (moment.isMoment(cidValue)) {
                        val = parseInt(cidValue.toDate().getTime());
                    } else {
                        val = NaN;
                    }
                } else {
                    var view = component.getView();
                    var inputVal = parseFloat(this.appletDocModel.get(cid));
                    val = view.isMultiple() ? view.getAggrValue() : component.properties.dataType == "PERCENT" ? inputVal / 100 : inputVal;
                }

                if (!_.isNumber(val)) {
                    val = null;
                }

                values.push(val);
            }, this);

            return values;
        },

        _strTimeToNumMinute: function (strTime) {
            try {
                var str = strTime.split(':');
                var minute = (parseInt(str[0]) * 60) + parseInt(str[1]);
                return minute;
            } catch (e) {
                return NaN;
            }
        },

        _removeComma: function (str) {
            return parseFloat((str || '').replace(/,/gi, ""));
        },

        _isPrefix: function () {
        },
        _convertDisplayText: function () {
        }
    }, DisplayViewTrait));

    var DetailView = BaseDetailView.extend(_.extend({}, {
        render: function () {
            var userData = this._convertDisplayText(this.appletDocModel.get(this.getCid()));
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                isPrefix: this._isPrefix(),
                userData: userData
            }));
        },

        getTitle: function () {
            return this._convertDisplayText(this.appletDocModel.get(this.getCid()));
        },

        _isPrefix: function () {
        },
        _convertDisplayText: function () {
        }
    }, DisplayViewTrait));

    var FormulaComponent = FormComponent.define(ComponentType.Formula, {
        name: lang['자동 계산'],
        valueType: ValueType.NUMBER,
        group: 'extra',
        properties: {
            "label": {defaultValue: lang['자동 계산']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "expressionType": {defaultValue: defaultValues.expressionType},
            "expression": {defaultValue: defaultValues.expression},
            "dateValueType": {defaultValue: ''},

            "width": {defaultValue: defaultValues.width},
            "widthUnit": {defaultValue: defaultValues.widthUnit},
            "unitText": {defaultValue: ''},
            "fixType": {defaultValue: defaultValues.fixType},
            "decimalPoints": {defaultValue: defaultValues.decimalPoints},
            "thousandComma": {defaultValue: defaultValues.thousandComma}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(FormulaComponent);
});
