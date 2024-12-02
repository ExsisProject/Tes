define('works/components/formbuilder/form_components/input_datepicker/input_datepicker_validator', function(require) {

    require("jquery.go-validation");

    var worksLang = require("i18n!works/nls/works");

    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputDatepickerValidator = function() {
        ComponentValidator.apply(this, arguments);
    };
    InputDatepickerValidator.prototype = Object.create(ComponentValidator.prototype);

    InputDatepickerValidator.prototype.validate = function (data, properties) {
        var value = data.value;

        if (properties['required'] && _.isEmpty(value)) {
            return this.createResult(false, "required", worksLang['필수 항목입니다.']);
        }

        return this.createResult(true);
    };

    return InputDatepickerValidator;
});