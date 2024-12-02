define('works/components/formbuilder/form_components/input_checkbox/input_checkbox_validator', function(require) {

    require("jquery.go-validation");

    var worksLang = require("i18n!works/nls/works");

    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputCheckboxValidator = function() {
        ComponentValidator.apply(this, arguments);
    };
    InputCheckboxValidator.prototype = Object.create(ComponentValidator.prototype);

    InputCheckboxValidator.prototype.validate = function (data, properties) {
        var value = data.value;
        var checkedCount = data.count;

        if (properties['required'] && (checkedCount < 1)) {
            return this.createResult(false, "required", worksLang['필수 항목입니다.']);
        }

        if (checkedCount < properties['minCheckedCount']) {
            return this.createResult(false, "minCheckedCount", GO.i18n(worksLang['최소 선택 갯수는 {{arg1}}개 입니다.'], {arg1: properties['minCheckedCount']}));
        }

        if (checkedCount > properties['maxCheckedCount']) {
            return this.createResult(false, "maxCheckedCount", GO.i18n(worksLang['최대 선택 갯수는 {{arg1}}개 입니다.'], {arg1: properties['maxCheckedCount']}));
        }

        return this.createResult(true);
    };

    return InputCheckboxValidator;
});