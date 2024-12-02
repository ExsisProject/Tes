define('works/components/formbuilder/form_components/input_number/input_number_validator', function (require) {

    require("jquery.go-validation");

    var GO = require('app');
    var worksLang = require("i18n!works/nls/works");

    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputNumberValidator = function () {
        ComponentValidator.apply(this, arguments);

        haveGotComma = function (num) {
            var result = false;
            if (num.indexOf(".") != -1) {
                result = true;
            }
            return result;
        };
    };
    InputNumberValidator.prototype = Object.create(ComponentValidator.prototype);

    InputNumberValidator.prototype.validate = function (data, properties) {
        var numberValue = data.value;
        numberValue = numberValue + "";
        if (properties['required'] && (!numberValue || numberValue.length < 1)) {
            return this.createResult(false, "required", worksLang['필수 항목입니다.']);
        }

        var minLength = properties['minLength'];
        var maxLength = properties['maxLength'];
        if (haveGotComma(numberValue)) {
            minLength = parseFloat(properties['minLength']).toFixed(properties['decimalPoints']);
            maxLength = parseFloat(properties['maxLength']).toFixed(properties['decimalPoints']);
        }

        if (parseFloat(numberValue.replace(/,/gi, "")) < parseFloat(minLength)) {
            return this.createResult(false, "minLength", GO.i18n(worksLang['최소 입력 수는 {{arg1}}입니다.'], {arg1: properties['minLength']}));
        }

        if (parseFloat(numberValue.replace(/,/gi, "")) > parseFloat(maxLength)) {
            return this.createResult(false, "maxLength", GO.i18n(worksLang['최대 입력 수는 {{arg1}}입니다.'], {arg1: properties['maxLength']}));
        }

        var decimalPoints = properties['decimalPoints'];
        var clonedAsStr = '' + numberValue;
        var parts = clonedAsStr.split(".");
        var hasDecimalPoint = parts.length == 2;

        if (hasDecimalPoint && parts[1].length > decimalPoints) {
            var message = decimalPoints > 0 ? GO.i18n(worksLang['소수점 {{arg0}} 자리까지 입력하세요.'], {arg0: decimalPoints}) : worksLang['소수점을 사용할 수 없습니다.'];
            return this.createResult(false, "decimalPoints", message);
        }

        var dataType = properties['dataType'] ? properties['dataType'] : 'NUMBER';
        var isNumber = dataType == 'NUMBER';
        if (!isNumber && hasDecimalPoint && parts[1].length > 0) {
            return this.createResult(false, "decimalPoints", worksLang['소수점을 사용할 수 없습니다.']);
        }

        return this.createResult(true);
    };

    return InputNumberValidator;
});
