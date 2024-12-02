define('works/components/formbuilder/form_components/input_radio/input_radio_validator', function(require) {

    require("jquery.go-validation");

    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");

    var CONSTANTS = require('works/constants/works');
    var REQUIRED_VAL = CONSTANTS.WORKS_COMPONENTS.WORKS_REQUIRED_VAL;
    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputRadioValidator = function() {
        ComponentValidator.apply(this, arguments);
    };
    InputRadioValidator.prototype = Object.create(ComponentValidator.prototype);

    InputRadioValidator.prototype.validate = function (data, properties) {
        var value = data.value;
        var checkedCount = data.count;

        if (properties['required'] && (checkedCount < 1 || value == REQUIRED_VAL)) {
            return this.createResult(false, "required", worksLang['필수 항목입니다.']);
        }

        return this.createResult(true);
    };

    return InputRadioValidator;
});