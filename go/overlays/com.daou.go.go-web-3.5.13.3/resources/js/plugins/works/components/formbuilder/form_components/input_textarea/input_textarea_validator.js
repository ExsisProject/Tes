define('works/components/formbuilder/form_components/input_textarea/input_textarea_validator', function(require) {

    var worksLang = require("i18n!works/nls/works");

    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputTextAreaValidator = function() {
        ComponentValidator.apply(this, arguments);
    };
    InputTextAreaValidator.prototype = Object.create(ComponentValidator.prototype);

    InputTextAreaValidator.prototype.validate = function (data, properties) {
        var textValue = data.value;
        if(properties['required'] && (!textValue || textValue.length < 1)) {
            return this.createResult(false, "required", worksLang['필수 항목입니다.']);
        }

        /* GO-28214 GO-32285 입력항목 컴포넌트 공통으로 이름, 설명, 기본값, 접사 표기 에 입력된 문자열이
         * json-lib에서 json <-> model converting 될 때 특정포맷형식의 string 을 배열로 인식하는 이슈가 발생
         * 특정포맷: 대괄호로 묶여 있고 대괄호 안에 공백 포함 '.', '-', '+', '숫자' 로 시작하는 string 는 배열로 인식하는 문제
         * ex) [ 1인당 평균 임금 ], [ 4. a팀 지출 ], [ +금일항목+ ] 등등
         */
        var pattern = /^\[([\s]*[\d\.\+\-]+)+(.)*\]$/g;
        if(pattern.test($.trim(textValue))) {
            return this.createResult(false, "format", worksLang['대괄호 입력포맷 오류 설명']);
        }

        return this.createResult(true);
    };

    return InputTextAreaValidator;
});