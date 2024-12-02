define('works/components/formbuilder/form_components/input_timepicker/input_timepicker_validator', function(require) {

    require("jquery.go-validation");

    var worksLang = require("i18n!works/nls/works");

    var WorksUtil = require('works/libs/util');

    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputTimepickerValidator = function() {
        ComponentValidator.apply(this, arguments);
    };
    InputTimepickerValidator.prototype = Object.create(ComponentValidator.prototype);

    InputTimepickerValidator.prototype.validate = function (data, properties) {
        var value = data.value;

        if(properties['required'] && _.isEmpty(value)){
            return this.createResult(false, "required", worksLang['필수 항목입니다.']);
        }

        if(!WorksUtil.isTimeFormat(value)){
            return this.createResult(false, "format", worksLang['시간 형식이 올바르지 않습니다.']);
        }

        return this.createResult(true);
    };

    return InputTimepickerValidator;
});