define('works/components/formbuilder/form_components/input_datetimepicker/input_datetimepicker_validator', function(require) {

    require("jquery.go-validation");

    var worksLang = require("i18n!works/nls/works");

    var WorksUtil = require('works/libs/util');

    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputDatepickerValidator = function() {
        ComponentValidator.apply(this, arguments);
    };
    InputDatepickerValidator.prototype = Object.create(ComponentValidator.prototype);

    InputDatepickerValidator.prototype.validate = function (data, properties) {
        var dateValue = data.dateValue;
        var timeValue = data.timeValue;

        if (properties['required']) {
            if (_.isEmpty(dateValue) && _.isEmpty(timeValue)) {
                return this.createResult(false, "required_date", worksLang['필수 항목입니다.']);
            } else if (_.isEmpty(dateValue)) {
                return this.createResult(false, "required_date", worksLang['날짜를 입력해 주세요.']);
            } else if (_.isEmpty(timeValue)) {
                return this.createResult(false, "required_time", worksLang['시간을 입력해 주세요.']);
            }
        } else {
            if (_.isEmpty(dateValue) && _.isEmpty(timeValue)) { // 필수값이 아닐때 date와 time은 완전히 값이 없거나 둘다 값이 있어야 한다. date와 time중에 한개만 값이 있는것은 데이터 구조상 저장할수 없다.
                return this.createResult(true);
            } else if (_.isEmpty(dateValue)) {
                return this.createResult(false, "required_date", worksLang['날짜를 입력해 주세요.']);
            } else if (_.isEmpty(timeValue)) {
                return this.createResult(false, "required_time", worksLang['시간을 입력해 주세요.']);
            }
        }

        if(!WorksUtil.isTimeFormat(timeValue)){
            return this.createResult(false, "format_time", worksLang['시간 형식이 올바르지 않습니다.']);
        }

        return this.createResult(true);
    };

    return InputDatepickerValidator;
});