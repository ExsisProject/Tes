define('works/components/formbuilder/form_components/input_text/input_text_validator', function(require) {

    require("jquery.go-validation");

    var GO = require('app');
    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var ComponentValidator = require('works/components/formbuilder/core/component_validator');

    var InputTextValidator = function() {
        ComponentValidator.apply(this, arguments);
    };
    InputTextValidator.prototype = Object.create(ComponentValidator.prototype);

    InputTextValidator.prototype.validate = function (data, properties) {
        var textValue = data.value;
        var textValueLength = textValue.length;
        if (properties['required'] && (!textValue || textValueLength < 1)) {
            return this.createResult(false, "required", worksLang['필수 항목입니다.']);
        }

        if (properties['required'] && textValueLength > 0 && $.trim(textValue).length == 0) {
            return this.createResult(false, "blank", commonLang['공백문자만 입력하였습니다.']);
        }

        if (properties['required'] || !properties['required'] && (textValue || textValueLength > 1)) {
            if (properties['minLength'] > textValueLength || properties['maxLength'] < textValueLength) {
                return this.createResult(false, "length",
                    GO.i18n(worksLang['최소 {{arg0}}자 ~ 최대 {{arg1}}자 이하로 입력해주세요.'], {
                        arg0: properties['minLength'],
                        arg1: properties['maxLength']
                    }));
            }
            if (properties['format'] == "alpahnumeric" && !(/^[a-zA-Z0-9]+$/.test(textValue))) {
                return this.createResult(false, "format",
                    GO.i18n(worksLang['{{arg0}}만 입력할 수 있습니다.'], {arg0: worksLang['영문, 숫자']}));
            }
            if (properties['format'] == "email" && !$.goValidation.isValidEmail(textValue)) {
                return this.createResult(false, "format",
                    GO.i18n(worksLang['{{arg0}}만 입력할 수 있습니다.'], {arg0: commonLang['이메일']}));
            }
            if (properties['format'] == "url" && !$.goValidation.simpleValidateURL(textValue)) {
                return this.createResult(false, "format", GO.i18n(worksLang['{{arg0}}만 입력할 수 있습니다.'], {arg0: 'URL'}));
            }
        }

        /* GO-28214 GO-32285 입력항목 컴포넌트 공통으로 이름, 설명, 기본값, 접사 표기 에 입력된 문자열이
         * json-lib에서 json <-> model converting 될 때 특정포맷형식의 string 을 배열로 인식하는 이슈가 발생
         * 특정포맷: 대괄호로 묶여 있고 대괄호 안에 공백 포함 '.', '-', '+', '숫자' 로 시작하는 string 는 배열로 인식하는 문제
         * ex) [ 1인당 평균 임금 ], [ 4. a팀 지출 ], [ +금일항목+ ] 등등
         */
        var pattern = /^\[([\s]*[\d\.\+\-]+)+(.)*\]$/g;
        if (pattern.test($.trim(textValue))) {
            return this.createResult(false, "format", worksLang['대괄호 입력포맷 오류 설명']);
        }

        return this.createResult(true);
    };

    return InputTextValidator;
});