define('works/components/formbuilder/form_components/input_text/input_text', function (require) {

    require("jquery.go-validation");

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');
    var SimilarLayerView = require('works/components/similar_layer/views/similar_layer');

    var Validator = require('works/components/formbuilder/form_components/input_text/input_text_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_text/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_text/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_text/option');

    var Docs = require('works/collections/docs');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var WorksUtil = require('works/libs/util');

    var lang = {
        "이름": commonLang["이름"],
        "중복 검사 중입니다.": commonLang["중복 검사 중입니다."],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "필수 입력 컴포넌트": worksLang["필수 입력 컴포넌트"],
        "기본값": worksLang["기본값"],
        "최소 입력 수": worksLang["최소 입력 수"],
        "최대 입력 수": worksLang["최대 입력 수"],
        "입력 너비 조절": worksLang["입력 너비 조절"],
        "퍼센트설명": worksLang["퍼센트설명"],
        "입력값 유효성 체크": worksLang["입력값 유효성 체크"],
        "모든 값 허용": worksLang["모든 값 허용"],
        "이메일": commonLang["이메일"],
        "영문과숫자": worksLang["영문+숫자"],
        "이름숨기기": worksLang["이름숨기기"],
        '중복 입력값 등록 불가': worksLang['중복 입력값 등록 불가'],
        '유사 입력값 자동 검색': worksLang['유사 입력값 자동 검색'],
        '이미 등록된 {{arg1}}이(가) 있습니다.': worksLang['이미 등록된 {{arg1}}이(가) 있습니다.'],
        '관리자에 의해 마스킹 처리 된 항목입니다': worksLang['관리자에 의해 마스킹 처리 된 항목입니다']
    };

    var defaultValues = {
        minLength: 0,
        maxLength: 100,
        width: 100,
        widthUnit: 'percent'
    };

    var OptionView = BaseOptionView.extend({
        customEvents: {
            "blur input[name=minLength], input[name=maxLength], input[name=width], input[type=text]": "_checkOptionValidate",
            "keypress input[name=minLength], input[name=maxLength], input[name=width]": "onlyNumber",
            "keyup input[name=minLength], input[name=maxLength], input[name=width]": "replaceNumber"
        },

        renderBody: function () {

            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON(),
                isWidthUnitPx: this.model.get('widthUnit') === 'px'
            }));
        },
        _checkOptionValidate: function (e) {
            var $target = $(e.currentTarget),
                $targetName = $target.attr('name'),
                $targetValue = $target.val();

            if ($targetValue == '' && _.has(defaultValues, $targetName)) {
                $target.val(defaultValues[$targetName]);
                this.model.set($targetName, defaultValues[$targetName]);
            }

            if (parseInt(this.$("input[name=minLength]").val()) > parseInt(this.$("input[name=maxLength]").val())) {
                this.$("input[name=minLength]").val(defaultValues['minLength']);
                this.model.set('minLength', defaultValues['minLength']);
            }

            if ($targetName == 'maxLength' && $targetValue > 2000) {
                $target.val(2000);
                this.model.set($targetName, 2000);
            }
        },

        onlyNumber: function (e) {
            var keyCode = e.keyCode ? e.keyCode : e.which;
            if (!WorksUtil.isNumber(keyCode)) { //숫자가 아니면
                e.preventDefault();
                return false;
            }
        },

        replaceNumber: function (e) { //keypress가 한글에서는 이벤트가 동작하지 않는 버그때문에 keyup을 통해 막아야함. 근데 그것도 키보드 동시에 2개 누르면 못막는 버그가 있어서 replace해야함
            var keyCode = e.keyCode ? e.keyCode : e.which;
            if (!WorksUtil.isNumber(keyCode)) { //숫자가 아니면
                var replace = $(e.currentTarget).val().replace(/[^0-9]/gi, '');
                $(e.currentTarget).val(replace);
                e.preventDefault();
                return false;
            }
        }

    });

    var FormView = BaseFormView.extend({

        keyLogs: [],
        events: {
            'change input': '_onKeyup',
            'click span[data-doc-id]': '_onClickDuplicateDoc'
        },

        initialize: function () {
            BaseFormView.prototype.initialize.apply(this, arguments);
            this.validator = new Validator();
            this.duplicateDocs = new Docs([], {
                appletId: this.appletId,
                fieldCid: this.clientId
            });
        },

        render: function () {
            var value = this.appletDocModel.get(this.clientId);
            if (!value) {
                var defaultValue = this.model.get('defaultValue');
                if (defaultValue) this.appletDocModel.set(this.clientId, defaultValue);
            }
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                clientId: this.clientId,
                inputValue: this._getInputValue(),
                isReadonly: this.isEditable(),
                "editable?": this.isEditable(),
                isMasking: this.isMasking(),
                lang: lang
            }));
            this.resizeWidth(this.model.get('width'), this.model.get('widthUnit') === 'percent' ? '%' : this.model.get('widthUnit'));
            if (this.model.get('similar') && !this.isEditable()) {
                this._renderSimilarLayer();
                if (!this.model.get('duplicate')) { // 기능적으로 상충되는 부분이기 때문에 옵션이 상반될 경우만 바인드하자.
                    this.$el.on('clickSimilarItem', $.proxy(function (e, data) {
                        this.$('input').val(data);
                        this.appletDocModel.set(this.getDataFromView());
                        this.similarLayer.timerToggle(false, 100, true);
                        this.similarLayer.docs.reset([]);
                    }, this));
                }
            }
            if (this.model.get('duplicate')) this._validateDuplicate();

            if ($.browser.mozilla || $.browser.opera) {
                GO.util.bindVirtualKeyEvent(this.$('input[type=text]'));
            }
        },

        getFormData: function () {
            if (this.isMultiple()) {
                this.appletDocModel.set(this.clientId, this._getMultipleData());
            }
            return this.appletDocModel.toJSON();
        },

        getDataFromView: function () {
            var values, returnData = {};
            if (this.isMultiple()) {
                values = [];
                values.push($.trim(this.$('input[type=text]').val()));
                _.each(this.getMultipleViews(), function (multiView) {
                    values.push($.trim(multiView.$('input[type=text]').val()));
                });

            } else {
                values = $.trim(this.$('input[type=text]').val());
            }

            returnData[this.getCid()] = values;
            return returnData;
        },

        /**
         * @Override
         */
        validate: function () {
            var invalidCount = 0;
            if (!this._validate()) invalidCount++;
            if (this.isMultiple()) {
                _.each(this.getMultipleViews(), function (view) {
                    if (!view._validate()) invalidCount++;
                }, this);
            }

            return invalidCount === 0;
        },

        _validate: function () {
            var $text = this.$('input[type=text]');
            var textValue = $text.val();

            var result = this.validator.validate({value:textValue}, this.model.toJSON());
            if (result.isValid) {
                if (this.model.get('duplicate') && this.duplicateDocs.length && textValue) {
                    this._showDuplicateMessage();
                    return false;
                }
            } else {
                this._printErrorTo(result.message);
            }
            return result.isValid;

            /*if (this.model.get('required') && (!textValue || textValueLength < 1)) {
                this._printErrorTo(worksLang['필수 항목입니다.']);
                return false;
            }

            if (this.model.get('required') && textValueLength > 0 && $.trim(textValue).length == 0) {
                this._printErrorTo(commonLang['공백문자만 입력하였습니다.']);
                return false;
            }

            if (this.model.get('required') || !this.model.get('required') && (textValue || textValueLength > 1)) {
                if (this.model.get('minLength') > textValueLength || this.model.get('maxLength') < textValueLength) {
                    this._printErrorTo(GO.i18n(worksLang['최소 {{arg0}}자 ~ 최대 {{arg1}}자 이하로 입력해주세요.'], {
                        arg0: this.model.get('minLength'),
                        arg1: this.model.get('maxLength')
                    }));
                    return false;
                }
                if (this.model.get('format') == "alpahnumeric" && !(/^[a-zA-Z0-9]+$/.test(textValue))) {
                    this._printErrorTo(GO.i18n(worksLang['{{arg0}}만 입력할 수 있습니다.'], {arg0: worksLang['영문, 숫자']}));
                    return false;
                }
                if (this.model.get('format') == "email" && !$.goValidation.isValidEmail(textValue)) {
                    this._printErrorTo(GO.i18n(worksLang['{{arg0}}만 입력할 수 있습니다.'], {arg0: commonLang['이메일']}));
                    return false;
                }
                if (this.model.get('format') == "url" && !$.goValidation.simpleValidateURL(textValue)) {
                    this._printErrorTo(GO.i18n(worksLang['{{arg0}}만 입력할 수 있습니다.'], {arg0: 'URL'}));
                    return false;
                }

            }

            if (this.model.get('duplicate') && this.duplicateDocs.length && textValue) {
                this._showDuplicateMessage();
                return false;
            }

            /!* GO-28214 GO-32285 입력항목 컴포넌트 공통으로 이름, 설명, 기본값, 접사 표기 에 입력된 문자열이
             * json-lib에서 json <-> model converting 될 때 특정포맷형식의 string 을 배열로 인식하는 이슈가 발생
             * 특정포맷: 대괄호로 묶여 있고 대괄호 안에 공백 포함 '.', '-', '+', '숫자' 로 시작하는 string 는 배열로 인식하는 문제
             * ex) [ 1인당 평균 임금 ], [ 4. a팀 지출 ], [ +금일항목+ ] 등등
             *!/
            var pattern = /^\[([\s]*[\d\.\+\-]+)+(.)*\]$/g;
            if (pattern.test($.trim(textValue))) {
                this._printErrorTo(worksLang['대괄호 입력포맷 오류 설명']);
                return false;
            }

            return true;*/
        },

        /**
         * @Override
         */
        resizeWidth: function (width, unit) {
            this._getInputElement().outerWidth(width + unit);
        },

        _printErrorTo: function (msg) {
            var $text = this.$('input[type=text]');
            $text.trigger('focus');
            this.printErrorTo($text, msg);
        },

        _getInputElement: function () {
            return this.$('input[type=text]');
        },

        _getInputValue: function () { // 복사할땐 아이디가 없지만 doc 모델의 값을 써야 한다.
            return this.appletDocModel.id ? this.appletDocModel.get(this.getCid()) : this.appletDocModel.get(this.getCid()) || this.model.get('defaultValue');
        },

        _renderSimilarLayer: function () {
            this.similarLayer = new SimilarLayerView({
                appletId: this.appletId,
                clientId: this.clientId,
                label: this.model.get('label'),
                linkEl: this.$('input')
            });
            this.$('input').after(this.similarLayer.render().el);
        },

        _onKeyup: function () {
            // 공백으로만 이루어진 텍스트는 중복값&유사값 체크하지 않음.
            this.appletDocModel.set(this.getDataFromView());
            if (this.model.get('duplicate')) {
                this._showDuplicateCheckMessage();
            }

            validateDuplicate.call(this);
            similarSearch.call(this);

            function validateDuplicate() {
                if (this.duplicateTypingTimeout) clearTimeout(this.duplicateTypingTimeout);
                this.duplicateTypingTimeout = setTimeout($.proxy(function () {
                    this._validateDuplicate();
                    this.appletDocModel.set(this.getDataFromView());
                }, this), 300);
            }

            function similarSearch() {
                if (!this.model.get('similar')) return;
                if (this.similarSearchTypingTimeout) clearTimeout(this.similarSearchTypingTimeout);
                var keyword = $.trim(this.$("input").val());
                this.similarSearchTypingTimeout = setTimeout($.proxy(function () {
                    this.similarLayer.search(keyword, this.clientId);
                }, this), 300);
            }
        },

        _validateDuplicate: function () {
            var keyword = $.trim(this.$("input").val());
            if (!keyword) {
                this.$('p.txt_error').remove();
                return;
            }

            if (!this.model.get('duplicate')) return;

            if (this.model.get('similar') && !this.isEditable()) this.similarLayer.timerToggle(false, 200);

            this.duplicateDocs.duplicateSearch(keyword, this.appletDocModel.id).done($.proxy(function () {
                setTimeout($.proxy(function () {
                    if (this.duplicateDocs.length) {
                        this._showDuplicateMessage();
                    } else {
                        this.$('p.txt_error').remove();
                    }
                }, this), 100);
            }, this));
        },
        _showDuplicateMessage: function () {
            var text = GO.i18n(lang['이미 등록된 {{arg1}}이(가) 있습니다.'], {arg1: this.model.get('label')});
            var markup = '<span class="btn_wrap"><span class="ic_classic ic_blank" data-doc-id="' + this.duplicateDocs.at(0).id + '" title="' + commonLang['팝업보기'] + '"></span></span>';
            this.printErrorTo(this.$('input'), text + markup);
        },

        _showDuplicateCheckMessage: function () {
            this.printErrorTo(this.$('input'), GO.i18n(lang['중복 검사 중입니다.']));
        },

        _onClickDuplicateDoc: function (e) {
            var docId = $(e.currentTarget).attr('data-doc-id');
            var popupOption = "width=1280,height=700,status=yes,scrollbars=yes,resizable=yes";
            window.open(GO.contextRoot + 'app/works/applet/' + this.appletId + '/doc/' + docId, "help", popupOption);
        }
    });

    var DetailView = BaseDetailView.extend({

        events: {
            'click a': '_onClickLink'
        },

        render: function () {
            var isURL = this.model.get('format') === 'url';
            var userData = isURL ? GO.util.escapeHtml(this.getTitle()) : GO.util.textToHtml(this.getTitle());
            this.$body.html(renderDetailTpl({
                isURL: isURL,
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: userData,
                url: isURL ? this._replaceToURL(userData) : '',
                isMasking: this.isMasking(),
                lang: lang
            }));
            this.resizeWidth(this.model.get('width'), this.model.get('widthUnit') === 'percent' ? '%' : this.model.get('widthUnit'));
        },

        getTitle: function () {
            return this.appletDocModel.get(this.clientId);
        },

        /**
         * @Override
         */
        resizeWidth: function (width, unit) {
            this._getInputElement().outerWidth(width + unit);
        },

        _onClickLink: function (e) {
            e.preventDefault();
            window.open($(e.currentTarget).attr('href'));
            return false;
        },

        _replaceToURL: function (url) {
            return /https?:\/\//i.test(url) ? url : 'http://' + url;
        },

        _getInputElement: function () {
            return this.$('input[type=text]');
        }
    });

    var InputTextComponent = FormComponent.define(ComponentType.Text, {
        name: worksLang['텍스트'],
        valueType: 'STEXT',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['텍스트']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            "duplicate": {defaultValue: false},
            "similar": {defaultValue: false},

            "defaultValue": {defaultValue: ''},

            "minLength": {defaultValue: defaultValues.minLength},
            "maxLength": {defaultValue: defaultValues.maxLength},

            "width": {defaultValue: defaultValues.width},
            "widthUnit": {defaultValue: defaultValues.widthUnit},

            "format": {defaultValue: 'all'}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputTextComponent);
});
