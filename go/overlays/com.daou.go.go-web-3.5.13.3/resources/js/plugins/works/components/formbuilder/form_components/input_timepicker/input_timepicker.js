define('works/components/formbuilder/form_components/input_timepicker/input_timepicker', function (require) {

    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

	var Validator = require('works/components/formbuilder/form_components/input_timepicker/input_timepicker_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_timepicker/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_timepicker/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_timepicker/option');
    var TimeSelectView = require('works/components/formbuilder/core/views/time_select');

    var WorksUtil = require('works/libs/util');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var lang = {
        "이름": commonLang["이름"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "필수 입력 컴포넌트": worksLang["필수 입력 컴포넌트"],
        "기본값": worksLang["기본값"],
        "생성시간으로 기본값 지정": worksLang["생성시간으로 기본값 지정"],
        "이름숨기기": worksLang["이름숨기기"]
    };

    var OptionView = BaseOptionView.extend({

        customEvents: {
            "click input[name=defaultAsNow]": '_updateUseBackdrop',
            "click ul[el-time-list] li": "_onSelect",
            "keydown input[data-time]": "_onKeydown",
            "change input[data-time]": "_onChange"
        },

        renderBody: function () {

            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON()
            }));

            this.timeSelectView = new TimeSelectView({
                useBackdrop: true
            });
            this.$(".wrap_select").html(this.timeSelectView.render().el);
            this.timeSelectView.linkBackdrop(this.$("input[data-time='start']"));
            this._changeSettingByDefaultAsNow(this.model.get('defaultAsNow'));
        },

        _onSelect: function (e) {
            e.stopPropagation();
            var target = $(e.currentTarget);
            var time = target.find("span.txt").text();
            this.$("input[data-time='start']").val(time);
            this.timeSelectView.toggle(false);
            this._selectOption();
        },

        _onKeydown: function (e) {
            if (e.keyCode && e.keyCode != 13) return;
            e.preventDefault();

            var target = $(e.currentTarget);
            var time = target.val();

            this.timeSelectView.toggle(false);
            this.$("input[data-time='start']").val(WorksUtil.parseTime(time));
            this._selectOption();
        },

        _onChange: function (e) {
            var target = $(e.currentTarget);
            var time = target.val();
            this.$("input[data-time='start']").val(WorksUtil.parseTime(time));
            this._selectOption();
        },

        _updateUseBackdrop: function (e) {
            var $target = $(e.currentTarget);
            var isChecked = $target.is(":checked");
            this._changeSettingByDefaultAsNow(isChecked);
        },

        _selectOption: function () {
            var $targetValue = this.timeSelectView.$("input[data-time='start']").val();
            this.model.set('defaultTime', $targetValue);
        },

        _changeSettingByDefaultAsNow: function (isChecked) {
            if (isChecked) {
                this.model.set({'defaultAsNow': true, 'defaultTime': ""});
                this.timeSelectView.$('input').val("").prop('disabled', true);
                this.timeSelectView.unBindBackdrop();
            } else {
                this.timeSelectView.bindBackdrop();
                this.timeSelectView.$('input').val(this.model.get('defaultTime')).prop('disabled', false);
                this.model.set({'defaultAsNow': false, 'defaultTime': this.model.get('defaultTime')});
            }
        }
    });

    var FormView = BaseFormView.extend({
		initialize: function() {
			BaseFormView.prototype.initialize.apply(this, arguments);
			this.validator = new Validator();
		},

        render: function () {
            var value = this.appletDocModel.get(this.getCid());

            if ((!value)
                && (this.model.get('defaultAsNow') || (this.model.get('defaultDate') || this.model.get('defaultTime')))) { // 데이터가 없는 경우 세팅해주면 된다.
                var defaultVal = {};
                var val = this._getDefaultValue();
                defaultVal[this.getCid()] = val;
                this.appletDocModel.set(defaultVal);
            }

            if (GO.util.isMobile()) {
                this.initRenderMobile();
            } else {
                this.initRender();
            }
        },

        events: {
            "click ul[el-time-list] li": "_onSelect",
            "keydown input[data-time]": "_onKeydown",
            "change input[data-time]": "_onChange"
        },

        initRender: function () {
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label'))
            }));
            this.timeSelectView = new TimeSelectView({
                useBackdrop: !this.isEditable()
            });
            this.$body.find('span.wrap_select').html(this.timeSelectView.render().el);
            this.timeSelectView.linkBackdrop(this.$("input[data-time='start']"));

            this.$("input[data-time='start']").val(this._getTime());
        },

        _getTime: function() {
            var val = this.appletDocModel.get(this.clientId);

            if (!val) {
                if (this.appletDocModel.id) {
                    val = '';
                } else { //등록모드일때 TODO 공통함수로 바뀌면 갈아끼자!
                    val = this.model.get('defaultTime') || "";
                    if (this.model.get('defaultAsNow')) { //기본값 설정(생성시간)이 true이면
                        val = moment().format("HH:mm");
                    }
                }
            }


            return val;
        },

        initRenderMobile: function () {
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                "isMobile?": true,
                label: GO.util.escapeHtml(this.model.get('label')),
                inputValue: this._getInputValue()
            }));
        },

        _makeTimeOption: function () {
            var options = [];
            var INTERVAL = 30;
            var timeOption = moment().startOf("days");
            var timeSlotLength = 60 * 24 / INTERVAL;

            for (var index = 0; index < timeSlotLength; index++) {
                var label = "";
                options.push("<li><span class='txt'>" + timeOption.format("HH:mm") + label + "</span></li>");
                timeOption.add("minutes", INTERVAL);
            }
            return options;
        },

        _onSelect: function (e) {
            e.stopPropagation();
            var target = $(e.currentTarget);
            var time = target.find("span.txt").text();
            this.$body.find("input[data-time='start']").val(time);
            this.appletDocModel.set(this.getDataFromView());
            this.timeSelectView.toggle(false);
        },

        _onKeydown: function (e) {
            if (e.keyCode && e.keyCode != 13) return;
            e.preventDefault();

            var target = $(e.currentTarget);
            var time = target.val();

            this.timeSelectView.toggle(false);
            this.$body.find("input[data-time='start']").val(WorksUtil.parseTime(time));
            this.appletDocModel.set(this.getDataFromView());
        },

        _onChange: function (e) {
            var target = $(e.currentTarget);
            var time = target.val();
            this.$body.find("input[data-time='start']").val(WorksUtil.parseTime(time));
            this.appletDocModel.set(this.getDataFromView());
        },

        getFormData: function () {
            if (this.isMultiple()) {
                this.appletDocModel.set(this.clientId, this._getMultipleData());
            }
            return this.appletDocModel.toJSON();
        },

        getDataFromView: function () {
            var values = [], returnData = {};
            if (this.isMultiple()) {
                values.push(this.getSubmitValue());
                _.each(this.getMultipleViews(), function (multiView) {
                    values.push(multiView.getSubmitValue());
                });

            } else {
                values = this.getSubmitValue();
            }

            returnData[this.getCid()] = values;
            return returnData;
        },

        getSubmitValue: function () {
            if (this.isEditable()) {
                return this.$('input[data-time="start"]').val();
            } else {
                if (_.isEmpty(this.$('input[data-time="start"]').val())) {
                    return null;
                } else {
                    return this.$('input[data-time="start"]').val();
                }
            }

        },

        remove: function () {
            BaseFormView.prototype.remove.apply(this, arguments);
        },

        validate: function () {
            var $element = this.$body.find("input[data-time='start']");

			var result = this.validator.validate({value:$element.val()}, this.model.toJSON());
			if (!result.isValid) {
				this.printErrorTo($element, result.message);
			}

			return result.isValid;
        },

        _getDefaultValue: function () {
            var defaultTime = this.model.get('defaultTime') || null;
            if (this.appletDocModel.id) {
                defaultTime = '';
            } else { //등록모드일때 TODO 공통함수로 바뀌면 갈아끼자!
                if (this.model.get('defaultAsNow')) { //기본값설정이 true이면
                    defaultTime = GO.util.now().format("HH:mm");
                }
            }
            return defaultTime;
        },

        _getInputValue: function () {
            var defaultTime = "";
            var val = this.appletDocModel.get(this.clientId);

            if ((!val) && this.model.get('defaultAsNow')) {
                defaultTime = GO.util.now().format("HH:mm");
            } else if ((!val) && this.model.get('defaultDate')) {
                defaultTime = this.model.get('defaultDate');
            } else if (val) {
                defaultTime = val;
            } else {
                defaultTime = "";
            }

            return defaultTime;
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            var userData = this.appletDocModel.get(this.clientId) || "";
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: userData
            }));
        },
        getTitle: function () {
            return this.appletDocModel.get(this.clientId);
        }
    });

    var InputTimepickerComponent = FormComponent.define(ComponentType.Time, {
        name: worksLang['시간'],
        valueType: 'TIME',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['시간']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            //공통속성

            "defaultAsNow": {defaultValue: false},
            "defaultTime": {defaultValue: ''}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputTimepickerComponent);
});
