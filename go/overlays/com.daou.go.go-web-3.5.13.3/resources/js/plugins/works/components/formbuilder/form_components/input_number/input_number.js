define('works/components/formbuilder/form_components/input_number/input_number', function (require) {

    var _ = require('underscore');
    var GO = require('app');
    var ComponentManager = require('works/components/formbuilder/core/component_manager');
    var ComponentType = require('works/component_type');
    var constants = require('works/components/formbuilder/constants');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseComponentView = require('works/components/formbuilder/core/views/base_component');
    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var Validator = require('works/components/formbuilder/form_components/input_number/input_number_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_number/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_number/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_number/option');

    var renderAggrFormTpl = require('hgn!works/components/formbuilder/form_components/input_number/aggr_form');
    var renderAggrDetailTpl = require('hgn!works/components/formbuilder/form_components/input_number/aggr_detail');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var WorksUtil = require('works/libs/util');

    var lang = {
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "필수 입력 컴포넌트": worksLang["필수 입력 컴포넌트"],
        "기본값": worksLang["기본값"],
        "최소 입력 수": worksLang["최소 입력 수"],
        "최대 입력 수": worksLang["최대 입력 수"],
        "입력 너비 조절": worksLang["입력 너비 조절"],
        "퍼센트설명": worksLang["퍼센트설명"],
        "접사 표기": worksLang["접사 표기"],
        "접두사": worksLang["접두사"],
        "접미사": worksLang["접미사"],
        "소수점 자리 수": worksLang["소수점 자리 수"],
        "1,000 단위 쉼표 표시": worksLang["1,000 단위 쉼표 표시"],
        "이름숨기기": worksLang["이름숨기기"],
        "테이블 자동계산": worksLang['테이블 자동계산'],
        "테이블 자동계산 사용함": worksLang['테이블 자동계산 사용함'],
        "합계": worksLang['합계'],
        "평균": worksLang['평균'],
        "합계 계산": worksLang['합계 계산'],
        "평균 계산": worksLang['평균 계산'],
        "테이블 자동계산 설명": worksLang['테이블 자동계산 설명'],
        "선택하세요": commonLang["선택하세요."],
        '관리자에 의해 마스킹 처리 된 항목입니다': worksLang['관리자에 의해 마스킹 처리 된 항목입니다'],
        "숫자": worksLang['숫자'],
        "비율": worksLang['비율'],
        "등급": worksLang['등급'],
        "숫자유형설명": worksLang['숫자유형설명'],
        "유형": worksLang['유형']
    };

    var DataType = {
        "NUMBER": "NUMBER",
        "PERCENT": "PERCENT",
        "POINT": "POINT"
    };

    var defaultValues = {
        dataType: DataType.NUMBER,
        minLength: 1,
        maxLength: 100000000000,
        width: 250,
        widthUnit: 'px',
        fixType: 'postfix',
        decimalPoints: 2
    };

    // 테이블 자동합산 타입 코드
    var AggrType = {
        "SUM": 'SUM',
        "AVR": 'AVR'
    };

    var EXCEPTED_KEY_CODE = [
        16, // shift
        35, // end
        36, // home
        37, // left
        38, // up
        39, // right
        46 // delete
    ];

    require("jquery.maskMoney");
    require("jquery.go-popup");

    /**
     * 자동합계를 위한 뷰
     */
    var AggrFormView = BaseComponentView.extend({
        className: 'number-aggrview',

        render: function () {
            this.$body.html(renderAggrFormTpl({
                "placeholder": this.model.get('tableAggrType') === AggrType.AVR ? lang["평균 계산"] : lang["합계 계산"]
            }));

            var width = this.model.get('width');
            var dataType = this.model.get('dataType') ? this.model.get('dataType') : DataType.NUMBER;
            if (dataType == DataType.NUMBER) {
                this.resizeWidth(width, this.model.get('widthUnit'));
            }
        },

        setValue: function (newValue) {
            this.$el.find('input[type=text]').val(newValue);
        },

        /**
         * @Override
         */
        resizeWidth: function (width, unit) {
            this._getInputElement().outerWidth(width + unit);
        },
        _getInputElement: function () {
            return this.$('input[type=text]');
        }
    });

    /**
     * 자동합계를 위한 뷰
     */
    var AggrDetailView = BaseDetailView.extend({
        className: 'number-aggrview',
        __rendered__: false,

        initialize: function (options) {
            BaseDetailView.prototype.initialize.apply(this, arguments);

            this.__rendered__ = false;

            this.value = null;
            if ((options || {}).value) {
                this.value = options.value;
            }
        },

        setValue: function (newValue) {
            this.value = newValue;

            if (this.__rendered__) {
                //this.$body.empty();
                this.render();
            }
        },

        render: function () {
            var dataType = this.model.get('dataType') ? this.model.get('dataType') : DataType.NUMBER;
            this.$body.html(renderAggrDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: this.value,
                isPrefix: this.model.get('fixType') === 'prefix',
                aggrTypeText: this.model.get('tableAggrType') === AggrType.AVR ? lang['평균'] : lang['합계'],
                isNumber: dataType == DataType.NUMBER,
                isPercent: dataType == DataType.PERCENT,
                isPoint: dataType == DataType.POINT
            }));

            this.__rendered__ = true;
        }
    });


    var OptionView = BaseOptionView.extend(_.extend({}, {

            customEvents: {
                "blur input[name=minLength], input[name=maxLength], input[name=width], input[name=decimalPoints]": "_checkOptionValidate",
                "keypress input[name=minLength], input[name=maxLength]": "onlyNumberWithMinus",
                "keypress input[name=width], input[name=decimalPoints]": "onlyNumber",
                "keyup input[name=minLength], input[name=maxLength]": "replaceNumberWithMinus",
                "keyup input[name=width], input[name=decimalPoints]": "replaceNumber",
                "keypress input[name=defaultValue]": "_validateDefaultValue",
                "keyup input[name=defaultValue]": "_validateDefaultValueBanHan",
                "focusout input[name=defaultValue]": "_validateDefaultValueFocusOut",
                "focusout input[name=minLength], input[name=maxLength]": "_validateMinMaxValueFocusOut",
                "click input[name=useTableAutoAggr]": "_toggleAggrTypeSection",
                "click input[name=dataType]": "_changeDataType"
            },

            initialize: function (options) {
                BaseOptionView.prototype.initialize.call(this, options);
                this.component = ComponentManager.getComponent(this.options.clientId);
                this.observer = this.component.getObserver();
                this.listenTo(this.observer, constants.REQ_ORDER_COMPOMENT, this.renderBody);
            },

            renderBody: function () {
                var parentComponent = ComponentManager.getComponent(this.component.getParentCid());
                var dataType = this.model.get('dataType') ? this.model.get('dataType') : DataType.NUMBER;
                this.$el.html(renderOptionTpl({
                    lang: lang,
                    model: this.model.toJSON(),
                    isPrefix: this.model.get('fixType') === 'prefix',
                    AggrType: AggrType,
                    DataType: DataType,
                    isInTable: parentComponent ? parentComponent.type === 'table' : false,
                    isNumber: dataType == DataType.NUMBER,
                    isPercent: dataType == DataType.PERCENT,
                    isPoint: dataType == DataType.POINT
                }));

                this.__changeOptionByDataType(dataType);
                this.__changeDefaultValueByDataType(dataType);

                this.$el.find('select[name=aggrType]').val(this.model.get('aggrType') || '');
                if (!ComponentManager.isNew(this.clientId)) {
                    this.$('input[name="dataType"]').attr('disabled', true);
                }
            },

            _checkOptionValidate: function (e) {
                var $target = $(e.currentTarget),
                    $targetName = $target.attr('name'),
                    $targetValue = $target.val();

                if ($targetValue == '' && _.has(defaultValues, $targetName)) {
                    $target.val(defaultValues[$targetName]);
                    this.model.set($targetName, defaultValues[$targetName]);
                }

                if (parseInt(this.$("input[name=minLength]").val()) > parseInt(this.$("input[name=maxLength]").val())) {
                    if (parseInt(this.$("input[name=maxLength]").val()) == 0) {
                        this.$("input[name=minLength]").val(0);
                        this.model.set('minLength', 0);
                    } else {
                        var defaultMinLength = this.model.get('dataType') == DataType.NUMBER ? defaultValues['minLength'] : 0;
                        this.$("input[name=minLength]").val(defaultMinLength);
                        this.model.set('minLength', defaultMinLength);
                    }
                }
            },
            onlyNumberWithMinus: function (e) {
                var keyCode = e.keyCode ? e.keyCode : e.which;
                var char = '';
                if (e.which == null) {
                    char = String.fromCharCode(e.keyCode); // old IE
                } else if (e.which != 0 && e.charCode != 0) {
                    char = String.fromCharCode(e.which); // All others
                }
                if (!WorksUtil.isNumber(keyCode) && /[^0-9\-]/gi.test(char)) { //숫자와 -가 아니면
                    e.preventDefault();
                    return false;
                }

            },
            onlyNumber: function (e) {
                var keyCode = e.keyCode ? e.keyCode : e.which;
                if (!WorksUtil.isNumber(keyCode)) { //숫자가아니면
                    e.preventDefault();
                    return false;
                }
            },
            replaceNumberWithMinus: function (e) {
                var keyCode = e.keyCode ? e.keyCode : e.which;
                var $target = $(e.currentTarget);
                var value = $target.val();

                if (!WorksUtil.isNumber(keyCode) && /[^0-9\-]/gi.test(value)) {  //숫자와 -가 아니면
                    var replace = $(e.currentTarget).val().replace(/[^0-9]/gi, '');
                    $(e.currentTarget).val(replace);
                    e.preventDefault();
                    return false;
                }
            }

            ,
            replaceNumber: function (e) { //keypress가 한글에서는 이벤트가 동작하지 않는 버그때문에 keyup을 통해 막아야함. 근데 그것도 키보드 동시에 2개 누르면 못막는 버그가 있어서 replace해야함
                var keyCode = e.keyCode ? e.keyCode : e.which;
                if (!WorksUtil.isNumber(keyCode)) {  //숫자가 아니면
                    var replace = $(e.currentTarget).val().replace(/[^0-9]/gi, '');
                    $(e.currentTarget).val(replace);
                    e.preventDefault();
                    return false;
                }
            }
            ,
            _validateDefaultValue: function (e) {
                var keyCode = e.keyCode ? e.keyCode : e.which;
                if (!WorksUtil.isNumber(keyCode, [45, 46])) { //숫자또는 dot, - 이 아니면
                    e.preventDefault();
                    return false;
                }
            }
            ,
            _validateDefaultValueBanHan: function (e) {
                $(e.currentTarget).val($(e.currentTarget).val().replace(/[^0-9\.\,\-]/gi, ''));
                this._updateText(e);
            }
            ,
            _validateDefaultValueFocusOut: function (e) {
                var defaultValue = parseInt(this.$("input[name=defaultValue]").val());
                if (parseInt(this.$("input[name=minLength]").val()) > defaultValue) {
                    this.$("input[name=defaultValue]").val(0);
                    this.model.set('defaultValue', 0);
                }
                if (parseInt(this.$("input[name=maxLength]").val()) < defaultValue) {
                    this.$("input[name=defaultValue]").val(0);
                    this.model.set('defaultValue', 0);
                }
            },
            _validateMinMaxValueFocusOut: function (e) {
                var isPercent = this.model.get('dataType') == DataType.PERCENT;
                var minLength = parseInt(this.model.get('minLength'));
                var maxLength = parseInt(this.model.get('maxLength'));
                if ((isPercent && minLength < defaultValues['minLength']) || minLength > defaultValues['maxLength']) {
                    this.$('input[name="minLength"]').val(defaultValues.minLength);
                    this.model.set('minLength', this.$('input[name="minLength"]').val());
                }
                if (maxLength > defaultValues['maxLength'] || maxLength < defaultValues['minLength']) {
                    this.$('input[name="maxLength"]').val(defaultValues.maxLength);
                    this.model.set('maxLength', this.$('input[name="maxLength"]').val());
                }
            },

            _toggleAggrTypeSection: function (e) {
                var $checkbox = $(e.currentTarget);
                var checked = $checkbox.is(':checked');

                var $aggrTypeSection = this.$('#aggrTypeSection');
                $aggrTypeSection.toggle(checked);
                this.model.set('useTableAutoAggr', checked);
                if (!checked) this.model.set('tableAggrType', AggrType.SUM);
            }
            ,

            _changeDataType: function (e) {
                var $dataType = $(e.currentTarget);
                var dataTypeVal = $dataType.val();
                this.__changeOptionByDataType(dataTypeVal);
                this.__changeDefaultValueByDataType(dataTypeVal);
                this.__changeOptionValueByDataType();

                this.model.set('dataType', dataTypeVal);
            },

            __changeDefaultValueByDataType: function (dataType) {
                if (dataType == DataType.NUMBER) {
                    defaultValues.minLength = 1;
                    defaultValues.maxLength = 100000000000;
                    defaultValues.decimalPoints = 2;
                } else if (dataType == DataType.PERCENT) {
                    defaultValues.minLength = 0;
                    defaultValues.maxLength = 100;
                    defaultValues.decimalPoints = 0;
                } else if (dataType == DataType.POINT) {
                    defaultValues.minLength = 1;
                    defaultValues.maxLength = 10;
                    defaultValues.decimalPoints = 0;
                }
            },

            __changeOptionByDataType: function (dataType) {
                if (dataType == DataType.NUMBER) {
                    this.$('[disable-el-percent]').show();
                    this.$('[disable-el-point]').show();
                } else if (dataType == DataType.PERCENT) {
                    this.$('[disable-el-point]').show();
                    this.$('[disable-el-percent]').hide();
                } else {
                    this.$('[disable-el-percent]').show();
                    this.$('[disable-el-point]').hide();
                }
            },
            __changeOptionValueByDataType: function () {
                this.$('input[name="minLength"]').val(defaultValues.minLength);
                this.$('input[name="maxLength"]').val(defaultValues.maxLength);
                this.$('input[name="decimalPoints"]').val(defaultValues.decimalPoints);
                this.model.set('minLength', this.$('input[name="minLength"]').val());
                this.model.set('maxLength', this.$('input[name="maxLength"]').val());
                this.model.set('decimalPoints', this.$('input[name="decimalPoints"]').val());
            }
        })
    );

    var FormView = BaseFormView.extend({
        events: {
            "keyup input[type=text]": '_onInputNumber',
            "change input[type=text]": '_onInputNumber'
        },

        initialize: function () {
            BaseFormView.prototype.initialize.apply(this, arguments);

            this.__numberFomatter__options = {
                "decimalPoints": this._getDecimalPoints(),
                "thousandComma": this._isUseThousandComma(),
                "useTableAutoAggr": this._isUseTableAutoAggr(),
                "tableAggrType": this._getTableAggrType()
            };
            this.validator = new Validator();
        },

        render: function () {
            var value = parseFloat(this.appletDocModel.get(this.clientId));
            if (_.isNaN(value)) {
                var defaultValue = parseFloat(this.model.get('defaultValue'));
                if (!_.isNaN(defaultValue)) this.appletDocModel.set(this.clientId, defaultValue);
            }
            var dataType = this.model.get('dataType') ? this.model.get('dataType') : DataType.NUMBER;

            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                clientId: this.clientId,
                inputValue: this._validRenderNumber(this.model),
                isPrefix: this.model.get('fixType') === 'prefix',
                isReadonly: this.isEditable(),
                "editable?": this.isEditable(),
                useTableAutoAggr: this._isUseTableAutoAggr(),
                aggrPlaceholderText: this._getAggrTypeText(),
                isMasking: this.isMasking(),
                lang: lang,
                isNumber: dataType == DataType.NUMBER,
                isPercent: dataType == DataType.PERCENT,
                isPoint: dataType == DataType.POINT,
                points: function () {
                    var points = [];
                    var maxLength = parseInt(this.model.maxLength) > 10 ? 10 : parseInt(this.model.maxLength);
                    for (i = 0; i < maxLength; i++) {
                        points[i] = {"index": i, "customClass": i < this.inputValue ? "" : "ic_star_off"}
                    }
                    return points;
                }
            }));
            this.$('input').trigger('change');

            var width = this.model.get('width');
            if (dataType == DataType.NUMBER) {
                this.resizeWidth(width, this.model.get('widthUnit'));
            }
        },

        /**
         * Multiple 상태이고, 자동합산계산기능을 사용한다면 합계뷰를 추가로 넣어주기위해 오버라이드함.
         * @returns {*|Array|View}
         */
        renderNode: function () {
            var returnViews = BaseFormView.prototype.renderNode.apply(this, arguments);
            var component = this._getComponent();
            if (!component.visible && this.__aggrView__) {
                this.__aggrView__._toggleComponent(component.visible);
            }
            if (this.isMultiple() && this._isUseTableAutoAggr() && !this.isEditable() && component.visible) {
                if (!_.isArray(returnViews)) {
                    returnViews = [returnViews];
                }

                this._setAggrFormView(this._createAggrFormView());

                // 합계뷰를 마지막 뷰로 추가
                returnViews.push(this._getAggrFormView());

                // 자동 합산 기능 수행
                this._setAggrField();
            }

            return returnViews;
        },

        /**
         * 자동합산기능을 사용중이면, 리스트형으로 생성된 멀티뷰에 keyup 이벤트를 걸어준다.
         * 디자인이 좀 이상하긴 한데, 복제뷰의 events 설정을 통해서 처리하는 것이 최선이나,
         * 합산기능 동작을 원본이 받아서 처리하기 위해서 원본이 복제본의 이벤트를 바인딩하고,
         * 원본의 합산기능을 동작시키도록 하였다. 복제본에서는 합산함수는 동작하지 않는다.
         *
         * 주의) 복제된 뷰가 아닌 원본뷰는 events에서 keyup이벤트를 처리한다.
         * @Override
         */
        createMultipleView: function (attrs) {
            var mview = BaseFormView.prototype.createMultipleView.apply(this, arguments);

            if (this.isMultiple() && this._isUseTableAutoAggr() && !this.isEditable()) {
                mview.$el.on('keyup.inputnumber', 'input[type=text]', _.bind(this._setAggrField, this));
            }

            this._setAggrField();

            return mview;
        },

        /**
         * @Override
         * @param cid Backbone cid
         */
        removeMultipleView: function (cid) {
            BaseFormView.prototype.removeMultipleView.apply(this, arguments);
            this._setAggrField();
            this.appletDocModel.set(this.clientId, this._getMultipleData());
        },

        /**
         * @Override
         */
        resizeWidth: function (width, unit) {
            this._getInputElement().outerWidth(width + unit);
        },

        getFormData: function () {
            if (this.isMultiple()) {
                this.appletDocModel.set(this.clientId, this._getMultipleData());
            }
            return this.appletDocModel.toJSON();
        },

        getDataFromView: function () {
            var self = this;
            var values = [], returnData = {};

            if (this.isMultiple()) {
                values.push(self._removeComma(this.$('input[type=text]').val()));
                _.each(this.getMultipleViews(), function (multiView) {
                    values.push(self._removeComma(multiView.$('input[type=text]').val()));
                });
            } else {
                values = this._removeComma(this.$('input[type=text]').val());
            }

            returnData[this.getCid()] = values;
            return returnData;
        },

        validate: function () {
            var $number = this.$('input[type=text]');
            var numberValue = $number.val();

            var result = this.validator.validate({value: numberValue}, this.model.toJSON());
            if (!result.isValid) {
                this._printErrorTo(result.message);
            }

            return result.isValid;
        },

        _setAggrFormView: function (aggrFormView) {
            if (this.__aggrView__) return;
            aggrFormView.$el.attr('cid', aggrFormView.cid);
            //console.log(aggrFormView.cid);
            this.__aggrView__ = aggrFormView;
        },

        _getAggrFormView: function () {
            return this.__aggrView__;
        },

        /**
         * 자동 합산기능 뷰객체 생성 및 렌더링
         * AggrFormView 역시 숫자 컴포넌트 뷰의 부속뷰이므로 숫자컴포넌트 뷰가 가진 필수 속성들을
         * 전달한다. 단 사용자 입력값이나, 하위 컴포넌트는 가지지 않는 형태이므로 초기화한다.
         *
         * @returns {AggrFormView}
         * @private
         */
        _createAggrFormView: function () {
            var aggrFormView = new AggrFormView({
                type: this.getType(),
                appletId: this.getAppletId(),
                clientId: this.getCid(),
                parentCid: this.getParentCid(),
                components: [],
                model: this.model.clone(),
                appletDocModel: this.appletDocModel || null,    // this.appletDocModel이 undefined 일 경우 null 넘겨주면 상위 view인 base_component에서 인스턴스를 생성해줌
                editable: this.isEditable(),
                multiple: false,
                // 핵심: 복제와 삭제를 못하도록 막는다.
                cloneable: false,
                observer: this.observer
            });

            aggrFormView.render();
            return aggrFormView;
        },

        /**
         * 1000단위 표시(콤마)기능 사용여부 반환
         * @returns {boolean}
         * @private
         */
        _isUseThousandComma: function () {
            return this.model.get('thousandComma') === true;
        },

        /**
         * 소수점 절사 자리수 반환
         * @returns {Number}
         * @private
         */
        _getDecimalPoints: function () {
            return parseInt(this.model.get('decimalPoints') || defaultValues.decimalPoints);
        },

        /**
         * 자동합산 기능을 사용하는지 여부 반환
         * @returns {boolean}
         * @private
         */
        _isUseTableAutoAggr: function () {
            return this.model.get('useTableAutoAggr') === true;
        },

        /**
         * 자동합산 기능 사용시 합산함수 지정
         * @returns {*}
         * @private
         */
        _getTableAggrType: function () {
            return this.model.get('tableAggrType');
        },

        _printErrorTo: function (msg) {
            var $number = this.$('input[type=text]');
            $number.trigger('focus');
            this.printErrorTo($number, msg);
        },

        _onRestore: function () {
            //console.log(this.appletDocModel.previous(this.clientId));
            this.$('input[type=text]').val(this.appletDocModel.get(this.clientId)).trigger('change');
        },

        _onInputNumber: function (e) {
            if (_.contains(EXCEPTED_KEY_CODE, e.keyCode)) return; // 유틸성 키는 허용하자. 너무 융통성 없게 불편함.
            var value = this.getDataFromView()[this.clientId];
            this.appletDocModel.set(this.clientId, value);

            var currentTargetValue = this._validateNumber(e);
            if (this._isUseTableAutoAggr() && this.isMultiple()) {
                this._setAggrField(e);
            }

            var dataType = this.model.get('dataType') ? this.model.get('dataType') : DataType.NUMBER;
            if (dataType == DataType.PERCENT) {
                this.$("#percentGage").width(currentTargetValue + '%');
            } else if (dataType == DataType.POINT) {
                $(e.currentTarget).siblings('.com_rate').find('.ic_star').each(function (i, v) {
                    if (i < currentTargetValue) {
                        $(this).removeClass("ic_star_off");
                    } else {
                        $(this).addClass("ic_star_off");
                    }
                })
            }
        },

        _validateNumber: function (e) {
            var $target = $(e.currentTarget);
            var value = this._processNumberFormat($target.val());
            $target.val(value);
            return value;
        },

        _processNumberFormat: function (value, withoutDigit) {
            var options = this.__numberFomatter__options;
            if (withoutDigit) options = _.extend(_.clone(this.__numberFomatter__options), {decimalPoints: 12});
            return GO.util.formatNumber(value, options);
        },

        _removeComma: function (str) {
            return str ? parseFloat((str || '').replace(/,/gi, "")) : null;
        },

        _getInputElement: function () {
            return this.$('input[type=text]');
        },

        _validRenderNumber: function () {
            var value = this.appletDocModel.get(this.clientId);
            if (!this.appletDocModel.id) {
                var defaultValue = value || this.model.get('defaultValue');
                value = defaultValue != '' ? parseFloat(defaultValue) : '';
            }

            return this._processNumberFormat(value, true);
        },

        getAggrValue: function () {
            var result = 0;
            var multiViews = this.getMultipleViews(true);
            // 복사본으로 만들어야 한다. 그렇지 않으면 원본에 추가된다.
            var targetViews = _.union([this], multiViews);
            var aggrCount = 0;

            _.each(targetViews, function (view) {
                var inputValue = parseFloat(this._removeComma(view.$el.find('input[type=text]').val()));

                if (_.isNumber(inputValue) && !_.isNaN(inputValue)) {
                    result += inputValue;
                    aggrCount++;
                }
            }, this);

            if (this._getTableAggrType() === AggrType.AVR && aggrCount > 0) {
                result = result / aggrCount;
            }
            return aggrCount ? result : '';
        },

        /**
         * 리스트형일때 자동 합산 기능 수행
         * @private
         */
        _setAggrField: function () {
            if (this.isEditable()) {
                return;
            }

            var result = this.getAggrValue();

            // 실제 계산된 결과가 있을 때만 출력한다.
            if (this._getAggrFormView() && _.isNumber(result)) {
                this._getAggrFormView().setValue(this._processNumberFormat(result));
            }
        },

        /**
         * 테이블 자동계산 사용할 경우 placeholder에 출력할 계산타입 출력문자열 반환
         * @returns {String}
         * @private
         */
        _getAggrTypeText: function () {
            return this.model.get('tableAggrType') === AggrType.AVR ? lang['평균 계산'] : lang['합계 계산'];
        }
    });

    var DetailView = BaseDetailView.extend({
        initialize: function () {
            BaseDetailView.prototype.initialize.apply(this, arguments);

            this.__numberFomatter__options = {
                "decimalPoints": this._getDecimalPoints(),
                "thousandComma": this._isUseThousandComma(),
                "useTableAutoAggr": this._isUseTableAutoAggr(),
                "tableAggrType": this._getTableAggrType()
            };
        },

        render: function () {
            var dataType = this.model.get('dataType') ? this.model.get('dataType') : DataType.NUMBER;
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: this._getValidNumber(),
                isPrefix: this.model.get('fixType') === 'prefix',
                isMasking: this.isMasking(),
                lang: lang,
                isNumber: dataType == DataType.NUMBER,
                isPercent: dataType == DataType.PERCENT,
                isPoint: dataType == DataType.POINT,
                points: function () {
                    var points = [];
                    var maxLength = parseInt(this.model.maxLength) > 10 ? 10 : parseInt(this.model.maxLength);
                    for (i = 0; i < maxLength; i++) {
                        points[i] = {"index": i, "customClass": i < parseFloat(this.userData) ? "" : "ic_star_off"}
                    }
                    return points;
                }
            }));
            var width = this.model.get('width');
            if (dataType == DataType.NUMBER) {
                this.resizeWidth(width, this.model.get('widthUnit'));
            }
        },

        /**
         * Multiple 상태이고, 자동합산계산기능을 사용한다면 합계뷰를 추가로 넣어주기위해 오버라이드함.
         * @returns {*|Array|View}
         */
        renderNode: function () {
            var returnViews = BaseFormView.prototype.renderNode.apply(this, arguments);

            if (this.isMultiple() && this._isUseTableAutoAggr() && !this.isEditable()) {
                if (!_.isArray(returnViews)) {
                    returnViews = [returnViews];
                }

                this._setAggrDetailView(this._createAggrDetailView());

                // 합계뷰를 마지막 뷰로 추가
                returnViews.push(this._getAggrDetailView());
            }

            return returnViews;
        },

        /**
         * @Override
         */
        resizeWidth: function (width, unit) {
            this._getInputElement().outerWidth(width + unit);
        },

        getTitle: function () {
            return this._getValidNumber();
        },

        getAggrValue: function () {
            var result = 0;
            var targetViews = this.getMultipleViews(true);
            var aggrCount = 0;

            targetViews.unshift(this);

            _.each(targetViews, function (view) {
                var userData = view.appletDocModel.get(view.getCid());

                if (_.isNumber(userData) && !_.isNaN(userData)) {
                    result += userData;
                    aggrCount++;
                }
            }, this);

            if (this._getTableAggrType() === AggrType.AVR && aggrCount > 0) {
                result = result / aggrCount;
            }
            return result;
        },

        /**
         * 자동 합산기능 뷰객체 생성 및 렌더링
         * AggrFormView 역시 숫자 컴포넌트 뷰의 부속뷰이므로 숫자컴포넌트 뷰가 가진 필수 속성들을
         * 전달한다. 단 사용자 입력값이나, 하위 컴포넌트는 가지지 않는 형태이므로 초기화한다.
         *
         * @returns {AggrFormView}
         * @private
         */
        _createAggrDetailView: function () {

            var result = this.getAggrValue();
            // 아직 body에 붙기 전이므로 등록된 multiview를 모두 가져온다.

            var aggrDetailView = new AggrDetailView({
                value: this._processNumberFormat(result),
                type: this.getType(),
                appletId: this.getAppletId(),
                clientId: this.getCid(),
                parentCid: this.getParentCid(),
                components: [],
                model: this.model.clone(),
                appletDocModel: null,
                editable: this.isEditable(),
                multiple: false,
                observer: this.observer
            });

            aggrDetailView.render();
            return aggrDetailView;
        },

        _getInputElement: function () {
            return this.$('input[type=text]');
        },

        _setAggrDetailView: function (aggrDetailView) {
            this.__aggrView__ = aggrDetailView;
        },

        _getAggrDetailView: function () {
            return this.__aggrView__;
        },

        /**
         * 1000단위 표시(콤마)기능 사용여부 반환
         * @returns {boolean}
         * @private
         */
        _isUseThousandComma: function () {
            return this.model.get('thousandComma') === true;
        },

        /**
         * 소수점 절사 자리수 반환
         * @returns {Number}
         * @private
         */
        _getDecimalPoints: function () {
            return parseInt(this.model.get('decimalPoints') || defaultValues.decimalPoints);
        },

        /**
         * 자동합산 기능을 사용하는지 여부 반환
         * @returns {boolean}
         * @private
         */
        _isUseTableAutoAggr: function () {
            return this.model.get('useTableAutoAggr') === true;
        },

        /**
         * 자동합산 기능 사용시 합산함수 지정
         * @returns {*}
         * @private
         */
        _getTableAggrType: function () {
            return this.model.get('tableAggrType');
        },

        _getValidNumber: function () {
            var userData = this.appletDocModel.get(this.clientId);
            return this._processNumberFormat(userData);
        },

        _processNumberFormat: function (value) {
            return GO.util.formatNumber(value, this.__numberFomatter__options);
        }
    });

    var InputNumberComponent = FormComponent.define(ComponentType.Number, {
        name: worksLang['숫자'],
        valueType: 'NUMBER',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['숫자']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},

            "defaultValue": {defaultValue: null},

            "dataType": {defaultValue: defaultValues.dataType},

            "minLength": {defaultValue: defaultValues.minLength},
            "maxLength": {defaultValue: defaultValues.maxLength},

            "width": {defaultValue: defaultValues.width},
            "widthUnit": {defaultValue: defaultValues.widthUnit},

            "unitText": {defaultValue: ''},
            "fixType": {defaultValue: defaultValues.fixType},
            "decimalPoints": {defaultValue: defaultValues.decimalPoints},
            "thousandComma": {defaultValue: true},
            "useTableAutoAggr": {defaultValue: false},
            "tableAggrType": {defaultValue: ''}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputNumberComponent);
})
;
