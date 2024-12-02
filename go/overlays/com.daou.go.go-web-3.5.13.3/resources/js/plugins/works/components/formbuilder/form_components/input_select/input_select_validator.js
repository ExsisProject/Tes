define('works/components/formbuilder/form_components/input_select/input_select_validator', function(require) {

    require("jquery.go-validation");

    var worksLang = require("i18n!works/nls/works");

    var CONSTANTS = require('works/constants/works');
    var REQUIRED_VAL = CONSTANTS.WORKS_COMPONENTS.WORKS_REQUIRED_VAL;
    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputSelectValidator = function() {
        ComponentValidator.apply(this, arguments);
    };
    InputSelectValidator.prototype = Object.create(ComponentValidator.prototype);

    InputSelectValidator.prototype.validate = function (data, properties) {
        var value = data.value;
        if (properties['required'] && (_.isEmpty(value) || value == REQUIRED_VAL)) {
            return this.createResult(false, "required", worksLang['필수 항목입니다.']);
        }

        return this.createResult(true);
    };

    return InputSelectValidator;
});