define("works/models/field", function (require) {

    var GO = require("app");
    var FIELD_TYPE = require("works/constants/field_type");
    var VALUE_TYPE = require("works/constants/value_type");
    var CONDITION_TYPE = require("works/constants/condition_type");

    var BaseModel = require('works/components/filter/models/base_type');
    var FormulaUtil = require('works/components/formbuilder/form_components/formula/formula_util');

    return BaseModel.extend({
        initialize: function () {
            this.modelName = "filter_field";
        },

        defaults: {
            cid: "",
            label: ""
        },

        /**
         * field 를 condition 형태로 반환한다.
         */
        fieldToCondition: function () {
            var condition = {
                fieldCid: this.get("cid"),
                label: this.get("label"),
                conditionType: this._convertValueTypeToConditionType(),
                valueType: this.get('valueType')
            };

            if (this.isSelectValueType()) {
                condition["options"] = this.get("options");
            }

            return condition;
        },

        fieldToColumn: function () {
            var clone = this.toJSON();
            return {
                fieldCid: clone.cid,
                fieldLabel: clone.label
            };
        },

        isNumberValueType: function () {
            return VALUE_TYPE.NUMBER == this.get("valueType");
        },

        isDateValueType: function () {
            return VALUE_TYPE.DATE == this.get("valueType");
        },

        isDateTimeValueType: function () {
            return VALUE_TYPE.DATETIME == this.get("valueType");
        },

        isTimeValueType: function () {
            return VALUE_TYPE.TIME == this.get("valueType");
        },

        isFormulaTargetType: function () {
            return this.isNumberValueType() || this.isDateValueType() || this.isDateTimeValueType() || this.isTimeValueType();
        },

        isFieldMappingFieldType: function () {
            return FIELD_TYPE.FIELD_MAPPING === this.get('fieldType');
        },

        // valueType 으로 대체 불가한 필드.
        isStatusFieldType: function () {
            return FIELD_TYPE.STATUS == this.get("fieldType");
        },

        // valueType 으로 대체 불가한 필드.
        isDocNoType: function () {
            return FIELD_TYPE.DOCNO == this.get("fieldType");
        },

        isFormulaType: function () {
            return FIELD_TYPE.FORMULA == this.get("fieldType");
        },

        isAppletDocsValueType: function () {
            return VALUE_TYPE.APPLETDOCS == this.get("valueType");
        },

        // 날짜와시간/날짜 ro 시간 자동계산 컴포넌트(일계산, 시간계산)
        isDayTimeFormulaFieldType: function () {
            var prop = this.get('properties') || {};
            return (this.isFormulaType() &&
                (_.contains(["time", "day"], prop.expressionType) || _.contains(["TIME", "DATE", "DATETIME"], prop.dateValueType)));
        },

        // 날짜와시간/날짜 자동계산 컴포넌트(일계산) 타입
        isDateTimeToDayFormulaFieldType: function () {
            var prop = this.get('properties') || {};
            return (this.isFormulaType() &&
                (_.contains("day", prop.expressionType) && _.contains(["DATE", "DATETIME"], prop.dateValueType)));
        },

        // 날짜와시간/날짜 자동계산 컴포넌트(시간계산) 타입
        isDateTimeToTimeFormulaFieldType: function () {
            var prop = this.get('properties') || {};
            return (this.isFormulaType() &&
                (_.contains("time", prop.expressionType) && _.contains(["DATE", "DATETIME"], prop.dateValueType)));
        },

        // 시간 자동계산 컴포넌트(시간계산) 타입
        isTimeToTimeFormulaFieldType: function () {
            var prop = this.get('properties') || {};
            return (this.isFormulaType() &&
                (_.contains("time", prop.expressionType) && _.contains("TIME", prop.dateValueType)));
        },
        /**
         * 각 뷰에서 wrapper 를 씌우는 케이스가 있어서 배열인 경우 배열 그대로 리턴하도록 하자.
         * @param model
         * @param properties
         * @returns {*} String or Array
         */
        getDisplayValue: function (model, properties) {
            properties = properties || {};
            var values = model.get("values")[this.get("cid")];

            if (this.isStatusFieldType()) {
                return model.get("status") ? GO.util.escapeHtml(model.get("status").name) : "-";
            }

            if (this.isDocNoType()) {
                return model.get("docNo") ? GO.util.escapeHtml(model.get("docNo")) : "-";
            }

            if (_.isUndefined(values) || _.isNull(values)) return "-";

            if (this.isSelectValueType()) {
                var fieldOptions = this.get("options");

                values = _.isArray(values) ? values : [values];
                var label = _.map(values, function (fieldValue) {
                    var fieldOption = _.findWhere(fieldOptions, {value: fieldValue});
                    return fieldOption ? fieldOption.displayText : "";
                });

                return _.compact(label);
            }

            if (this.isOrgType()) {
                values = _.isArray(values) ? values : [values];
                return _.map(values, function (user) {
                    return user.name + ' ' + (user.position || '');
                }, this);
            }

            if (this.isDateValueType()) {
                return [values.substr(0, 4), values.substr(4, 2), values.substr(6, 2)].join("-");
            }

            if (this.isDateTimeValueType()) {
                return moment(values).format("YYYY-MM-DD HH:mm");
            }

            if (this.isNumberValueType()) {
                if (!properties) {
                    return values;
                } else if (properties.expressionType == "time") {
                    if (properties.dateValueType == VALUE_TYPE.TIME) {
                        return FormulaUtil.timeToTimeDisplayText(values);
                    } else if (properties.dateValueType == VALUE_TYPE.DATE || properties.dateValueType == VALUE_TYPE.DATETIME) {
                        return FormulaUtil.dateTimeToTimeDisplayText(values);
                    }
                } else if (properties.expressionType == "day") {
                    if (properties.dateValueType == VALUE_TYPE.DATE || properties.dateValueType == VALUE_TYPE.DATETIME) {
                        return FormulaUtil.dateTimeToDayDisplayText(values);
                    } else {
                        return values;
                    }
                } else {
                    var dataType = properties.dataType ? properties.dataType : "NUMBER";
                    if (dataType == "PERCENT") {
                        return values + ' ' + '%';
                    } else if (dataType == "POINT") {
                        return values;
                    } else {
                        if (properties.thousandComma) {
                            values = GO.util.numberWithCommas(values);
                        }
                        if (properties.fixType == 'prefix') return properties.unitText + ' ' + values;
                        if (properties.fixType == 'postfix') return values + ' ' + properties.unitText;
                        return values;
                    }
                }
            }

            /**
             * 숫자 컴포넌트와 연동을 한 경우 양쪽 컴포넌트의 타입을 모두 봐야하는 첫번째 케이스가 발생하였다.
             * 기존까지는 서버에서 내려준 데이터를 그대로 뿌려주었으나, 앞으로는 디스플레이를 클라이언트에서 처리하기로 하였다.
             * 매핑컴포넌트의 등장으로 연동컴포넌트의 연동 항목이라는 기능 자체가 무의미해서 모순적인 부분들이 있는데,, 어떻게 해야 할까
             * 일단은 숫자 뿐이므로 컴포넌트 타입을 보지 말고 처리하자. 이부분은 추후에 문제가 될 수 있다.
             */
            if (this.isAppletDocsValueType()) {
                var returnValue = _.compact(_.map(values, function (value) {
                    var values = value.text;
                    var dataType = properties.dataType ? properties.dataType : "NUMBER";

                    if (dataType == "PERCENT") {
                        return values + ' ' + '%';
                    } else if (dataType == "POINT") {
                        return values;
                    } else {
                        if (properties.thousandComma) {
                            values = GO.util.numberWithCommas(values);
                        }
                        if (properties.fixType == 'prefix') return properties.unitText + ' ' + values;
                        if (properties.fixType == 'postfix') return values + ' ' + properties.unitText;
                        return values;
                    }
                }));
                return returnValue.length ? returnValue : '-';
            }

            if (this.isTextValueType()) {
                var text = _.isArray(values) ? _.compact(values).join(", ") : values;
                return GO.util.textToHtml(text ? text : '-');
            }

            return GO.util.textToHtml(_.isString(values) ? values : '-');
        },

        convertDateTimeValue: function (value) {
            if (_.isString(value) && value.length > 0) {
                if (this.isDateValueType()) {
                    return value.split("-").join("");
                } else if (this.isDateTimeValueType()) {
                    return moment(value, "YYYY-MM-DD HH:mm").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                }
            }
            return value;
        },

        convertDateTimeAndNumberFormat: function (value, properties) {
            if (!value) {
                return value;
            }

            if (this.isDateValueType()) {
                return [value.substr(0, 4), value.substr(4, 2), value.substr(6, 2)].join("-");
            }

            if (this.isDateTimeValueType()) {
                return moment(value).format("YYYY-MM-DD HH:mm");
            }

            if (this.isNumberValueType()) {
                if (!properties || !value) {
                    return value;
                } else if (properties.expressionType == "time") {
                    if (properties.dateValueType == VALUE_TYPE.TIME) {
                        return FormulaUtil.timeToTimeDisplayText(value);
                    } else if (properties.dateValueType == VALUE_TYPE.DATE || properties.dateValueType == VALUE_TYPE.DATETIME) {
                        return FormulaUtil.dateTimeToTimeDisplayText(value);
                    }
                } else if (properties.expressionType == "day") {
                    if (properties.dateValueType == VALUE_TYPE.DATE || properties.dateValueType == VALUE_TYPE.DATETIME) {
                        return FormulaUtil.dateTimeToDayDisplayText(value);
                    } else {
                        return value;
                    }
                } else {
                    return value;
                }
            }
            return null;
        },

        getDisplayValueContainsTemplate: function (model, properties) {
            properties = properties || {};
            var values = model.get("values")[this.get("cid")];
            if (this.isNumberValueType()) {
                var isDateOrTime = properties.expressionType == "time" || properties.expressionType == "day";
                if (!properties || (isDateOrTime && !values)) {
                    return values;
                } else if (properties.expressionType == "time") {
                    if (properties.dateValueType == VALUE_TYPE.TIME) {
                        return FormulaUtil.timeToTimeDisplayText(values);
                    } else if (properties.dateValueType == VALUE_TYPE.DATE || properties.dateValueType == VALUE_TYPE.DATETIME) {
                        return FormulaUtil.dateTimeToTimeDisplayText(values);
                    }
                } else if (properties.expressionType == "day") {
                    if (properties.dateValueType == VALUE_TYPE.DATE || properties.dateValueType == VALUE_TYPE.DATETIME) {
                        return FormulaUtil.dateTimeToDayDisplayText(values);
                    } else {
                        return values;
                    }
                } else {
                    var dataType = properties.dataType ? properties.dataType : "NUMBER";
                    if (dataType != "NUMBER" && (_.isUndefined(values) || _.isNull(values))) {
                        values = "";
                    }

                    if (dataType == "PERCENT") {
                        return this.getPercentTemplate(values);
                    } else if (dataType == "POINT") {
                        return this.getPointTemplate(values, properties);
                    } else {
                        if (properties.thousandComma) {
                            values = GO.util.numberWithCommas(values);
                        }
                        if (properties.fixType == 'prefix') return properties.unitText + ' ' + values;
                        if (properties.fixType == 'postfix') return values + ' ' + properties.unitText;
                        return values;
                    }
                }
            }

            /**
             * 숫자 컴포넌트와 연동을 한 경우 양쪽 컴포넌트의 타입을 모두 봐야하는 첫번째 케이스가 발생하였다.
             * 기존까지는 서버에서 내려준 데이터를 그대로 뿌려주었으나, 앞으로는 디스플레이를 클라이언트에서 처리하기로 하였다.
             * 매핑컴포넌트의 등장으로 연동컴포넌트의 연동 항목이라는 기능 자체가 무의미해서 모순적인 부분들이 있는데,, 어떻게 해야 할까
             * 일단은 숫자 뿐이므로 컴포넌트 타입을 보지 말고 처리하자. 이부분은 추후에 문제가 될 수 있다.
             */
            if (this.isAppletDocsValueType()) {
                var self = this;
                var returnValue = _.compact(_.map(values, function (value) {
                    var values = value.text;
                    var dataType = properties.dataType ? properties.dataType : "NUMBER";
                    if (dataType != "NUMBER" && (_.isUndefined(values) || _.isNull(values))) {
                        values = "";
                    }

                    if (dataType == "PERCENT") {
                        return self.getPercentTemplate(values);
                    } else if (dataType == "POINT") {
                        return self.getPointTemplate(values, properties);
                    } else {
                        if (properties.thousandComma) {
                            values = GO.util.numberWithCommas(values);
                        }
                        if (properties.fixType == 'prefix') return properties.unitText + ' ' + values;
                        if (properties.fixType == 'postfix') return values + ' ' + properties.unitText;
                        return values;
                    }
                }));
                return returnValue.length ? returnValue : '-';
            }

            return this.getDisplayValue(model, properties);
        },

        getOrgTemplateValue: function (values, useProfile) {
            if (this.isOrgType()) {
                var classes = [];
                var isMultiValued = _.contains(VALUE_TYPE.MULTI_VALUED_TYPES, this.get('valueType'));
                if (isMultiValued) classes.push('item');
                if (_.isUndefined(values) || _.isNull(values)) return '';
                values = _.isArray(values) ? values : [values];
                return _.map(values, function (user) {
                    var position = user.position ? " " + user.position : "";
                    var profileAttribute = (useProfile === false ? false : this.isUserType()) ? "data-profile" : "";
                    return '<span class="' + classes.join(' ') + '" ' + profileAttribute + ' data-id="' + user.id + '">' + user.name + position + '</span>';
                }, this);
            } else {
                return values;
            }
        },

        getValue: function (model, properties) {
            properties = properties || {};
            var values = model.get("values")[this.get("cid")];

            if (this.isStatusFieldType()) {
                return model.get("status") ? GO.util.escapeHtml(model.get("status").name) : "";
            }

            if (this.isDocNoType()) {
                return model.get("docNo") ? model.get("docNo") : "";
            }

            if (_.isUndefined(values) || _.isNull(values)) return "";

            if (this.isSelectValueType()) {
                return _.isArray(values) ? values : [values];
            }

            if (this.isOrgType()) {
                values = _.isArray(values) ? values : [values];
                return _.map(values, function (user) {
                    return user.name + ' ' + (user.position || '');
                }, this);
            }

            var formatValue = this.convertDateTimeAndNumberFormat(values, properties);
            if (formatValue) {
                return formatValue;
            }

            if (this.isAppletDocsValueType()) {
                var returnValue = _.compact(_.map(values, function (value) {
                    var values = value.text;
                    if (properties.thousandComma) {
                        values = GO.util.numberWithCommas(values);
                    }
                    if (properties.fixType === 'prefix') return properties.unitText + ' ' + values;
                    if (properties.fixType === 'postfix') return values + ' ' + properties.unitText;
                    return values;
                }));
                return returnValue.length ? returnValue : '';
            }

            if (this.isTextValueType()) {
                var text = _.isArray(values) ? _.compact(values).join(", ") : values;
                return GO.util.htmlToText(text);
            }

            return values;
        },

        _convertValueTypeToConditionType: function () {
            switch (this.get('valueType')) {
                case VALUE_TYPE.NUMBER:
                case VALUE_TYPE.FORMULA:
                    return CONDITION_TYPE.NUMBER;
                    break;
                case VALUE_TYPE.DATE:
                    return CONDITION_TYPE.DATE;
                    break;
                case VALUE_TYPE.TIME:
                    return CONDITION_TYPE.TIME;
                    break;
                case VALUE_TYPE.DATETIME:
                    return CONDITION_TYPE.DATETIME;
                    break;
                case VALUE_TYPE.SELECT:
                case VALUE_TYPE.SELECTS:
                case VALUE_TYPE.USER:
                case VALUE_TYPE.USERS:
                case VALUE_TYPE.DEPTS:
                    return CONDITION_TYPE.SELECT;
                    break;
                case VALUE_TYPE.STEXT:
                case VALUE_TYPE.STEXTS:
                case VALUE_TYPE.TEXT:
                case VALUE_TYPE.FILES:
                case VALUE_TYPE.APPLETDOCS:
                    return CONDITION_TYPE.TEXT;
                    break;
                default:
                    this.get('valueType');
                    break;
            }
        },

        getPercentTemplate: function (value) {
            value = (!value) ? 0 : value;
            return '<span class="com_gage">' +
                '<span class="wrap_gage">' +
                '<span class="gage" id="percentGage" style="width:' + value + '%"></span>' +
                '</span>' +
                '<span class="txt">' + value + '%</span>' +
                '</span>';
        },
        getPointTemplate: function (value, properties) {
            var pointEl = '<span class="com_rate"><span class="wrap_rate">';
            for (var i = 0; i < properties.maxLength; i++) {
                var customClass = i < parseFloat(value) ? "" : "ic_star_off"
                pointEl = pointEl + '<ins style="cursor: default;" class="ic_star ' + customClass + '"></ins>';
            }
            return pointEl + '</span></span>';
        }
    });
});
