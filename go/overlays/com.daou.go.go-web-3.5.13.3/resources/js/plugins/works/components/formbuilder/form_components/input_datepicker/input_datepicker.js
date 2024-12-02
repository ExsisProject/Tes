define('works/components/formbuilder/form_components/input_datepicker/input_datepicker', function (require) {

    var GO = require('app');
    var NameTagView = require("go-nametags");
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');
    var AlarmSettingView = require('works/components/alarm_setting/views/alarm_setting');

    var Validator = require('works/components/formbuilder/form_components/input_datepicker/input_datepicker_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_datepicker/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_datepicker/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_datepicker/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var lang = _.extend(commonLang, worksLang, {
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        MINUTE: commonLang['분 전'],
        HOUR: commonLang['시간 전'],
        DAY: commonLang['일 전']
    });

    var OptionView = BaseOptionView.extend({

        customEvents: {
            "click input[name=defaultAsNow]": '_updateUseBackdrop',
            'click .ic_reset': "dateClear",
            'click [data-alarm-setting]': '_onClickAlarmSetting',
            'change input[data-date]': 'toggleClearIcon'
        },

        renderBody: function () {
            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON(),
                isMultiple: this.options.multiple
            }));
            var isDefaultAsNow = this.model.get('defaultAsNow');

            this.$("input[data-date='start']").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                beforeShow: function (elplaceholder, object) {
                },
                onClose: _.bind(function (selectedDate) {
                    this.model.set('defaultDate', selectedDate);
                }, this)
            });
            this._changeSettingByDefaultAsNow(isDefaultAsNow);

            if(!this.options.multiple) {
            	this._initAlarmView();
            }
        },
        _updateUseBackdrop: function (e) {
            var $target = $(e.currentTarget);
            var isChecked = $target.is(":checked");
            this._changeSettingByDefaultAsNow(isChecked);
        },
        _changeSettingByDefaultAsNow: function (isChecked) {
            if (isChecked) {
                this.$("input[data-date='start']").attr("disabled", true);
                this.$("input[data-date='start']").val('').trigger('change');
                this.model.set({'defaultAsNow': true, 'defaultDate': ''});
            } else {
                this.model.set({'defaultAsNow': false, 'defaultDate': this.model.get('defaultDate')});
                this.$("input[data-date='start']").val(this.model.get('defaultDate')).attr("disabled", false).trigger('change');
            }
        },
        dateClear: function () {
            this.$("input[data-date='start']").val('').trigger('change');
            this.model.set({'defaultDate': ''});
        },
        toggleClearIcon: function () {
            this.$('.ic_reset').toggle(!_.isEmpty(this.$("input[data-date='start']").val()));
        },

        _onClickAlarmSetting: function() {
            this.popupView = $.goPopup({
                pclass: 'layer_normal layer_deadline_alarm',
                header: commonLang['알람 설정'],
                buttons : [{
                    autoclose: false,
                    btext: commonLang["확인"],
                    btype: "confirm",
                    callback: $.proxy(function() {
                        var data = alarmSettingView.getData();
                        if (!data) return false;
                        this.model.set('useAlarm', data && !!data.timers.length);
                        this.model.set('alarms', data);
                        this._renderAlarmItems();
                        if (data) this.popupView.close();
                    }, this)
                }, {
                    btext : commonLang["취소"],
                    btype : "cancel"
                }]
            });

            var alarmSettingView = new AlarmSettingView({
                userFields: this._getUserFields(),
                useMinute: false,
                useHour: false,
                alarms: this.model.get('alarms') || {}
            });
            this.popupView.find('.content').html(alarmSettingView.render().el);
            this.popupView.reoffset();
        },

        _initAlarmView: function() {
            this.alarmTagView = NameTagView.create([], {useAddButton: false});
            this.alarmTagView.$el.on('nametag:removed', $.proxy(function() {
                var nameTags = this.alarmTagView.getNameTagList();
                var timers = _.map(nameTags, function(alarm) {
                    return {
                        type: alarm.type,
                        time: alarm.time
                    }
                }, this);
                var alarms = this.model.get('alarms');
                this.model.unset('alarms');
                this.model.set('alarms', _.extend(alarms, {timers: timers})); // change event 발생 안함
                this.model.set('useAlarm', !!alarms.timers.length);
            }, this));
            this.$('#alarms').append(this.alarmTagView.el);
            this._renderAlarmItems();

        },

        _renderAlarmItems: function() {
            this.alarmTagView.removeAll();
            var alarms = this.model.get('alarms') || {};
            var timers = alarms.timers || [];
            _.each(timers, function(alarm) {
                var id = alarm.time + alarm.type;
                var label = alarm.time + lang[alarm.type];
                this.alarmTagView.addTag(id, label, {
                    attrs: {
                        type: alarm.type,
                        time: alarm.time
                    },
                    removable: true
                });
            }, this);
        }
    });

    var FormView = BaseFormView.extend({
        initialize: function() {
            BaseFormView.prototype.initialize.apply(this, arguments);
            this.validator = new Validator();
        },
        render: function () {
            var alarms = this.appletDocModel.get('alarms');
            var alarm = _.findWhere(alarms, {fieldCid: this.clientId}) || {};
            var timers = alarm.timers;
            var timersLabel = _.map(timers, function(timer) {
                var type = timer.type || '';
                return timer.time + lang[type.toUpperCase()];
            }).join(', ');
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                "isEditable?": this.isEditable(),
                timersLabel: timersLabel
            }));
            //현재 dateForm에서는 빈값을 넣으면 무조건 현재날짜로 맞춰지므로 value는 따로 셋팅하여야 한다
            this.$body.find("input[data-date='start']").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                onSelect: $.proxy(function () {
                    this.appletDocModel.set(this.getDataFromView());
                    this.toggleClearIcon();
                }, this)
            });
            if (this.isEditable()) {
                this.$("input[data-date='start']").prop('disabled', true);
            }

            var inputValue = this._getInputValue();
            if (!_.isEmpty(inputValue)) {
                this.$body.find("input[data-date='start']").val(inputValue).trigger('change');
            }
        },

        events: function () {
            return this.isEditable() ? BaseFormView.prototype.events : _.extend({}, BaseFormView.prototype.events, {
                'click .ic_reset': "dateClear",
                'change input[data-date]': 'toggleClearIcon'
            });
        },

        dateClear: function () {
            this.$("input[data-date='start']").val('').trigger('change');
            this.appletDocModel.set(this.getDataFromView());
        },

        validate: function () {
            var $element = this.$body.find("input[data-date='start']");

            var result = this.validator.validate({value:$element.val()}, this.model.toJSON());
            if (!result.isValid) {
                this.printErrorTo($element, result.message);
            }

            return result.isValid;
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

        remove: function () {
            BaseFormView.prototype.remove.apply(this, arguments);
        },

        getSubmitValue: function () {
            var submitValue = null;
            var val = this.$body.find("input[data-date='start']").val();
            if (!_.isEmpty(val)) {
                submitValue = GO.util.toMoment(val).format('YYYYMMDD');
            }
            return submitValue;
        },

        _getDefaultValue: function () {
            var defaultTime = this.model.get('defaultDate') || null;
            if (this.appletDocModel.id) {
                defaultTime = '';
            } else {
                if (this.model.get('defaultAsNow')) {
                    defaultTime = GO.util.now().format("YYYYMMDD");
                }
            }
            return defaultTime;
        },

        _getInputValue: function () {
            var defaultDate = "";
            var val = this.appletDocModel.get(this.clientId);

            if ((!val) && this.model.get('defaultAsNow')) {
                defaultDate = moment().format("YYYY-MM-DD");
            } else if ((typeof val === 'undefined' || val === "" || val === null)
                && this.model.get('defaultDate')){
                defaultDate = this.model.get('defaultDate');
            } else {
                defaultDate = "";
            }

            var result = defaultDate;
            if (val) { // 기존 값이 있으면(수정 모드이고 등록화면에서 날짜가 있으면)
                var match = val.match(/(\d{4})(\d{2})(\d{2})/);
                val = match ? match[1] + '-' + match[2] + '-' + match[3] : val;
                result = val;
            }
            return result;
        },

        /**
         * setTimeout 제거. 꼼수 넣지 말고 근본 원인을 찾아서 없애라.
         */
        toggleClearIcon: function () {
            this.$('.ic_reset').toggle(!_.isEmpty(this.$("input[data-date='start']").val()));
            this.appletDocModel.set(this.getDataFromView());
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            var alarms = this.appletDocModel.get('alarms');
            var alarm = _.findWhere(alarms, {fieldCid: this.clientId}) || {};
            var timers = alarm.timers;
            var timersLabel = _.map(timers, function(timer) {
                var type = timer.type || '';
                return timer.time + lang[type.toUpperCase()];
            }).join(', ');
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                userData: this._getUserData(),
                timersLabel: timersLabel
            }));
        },
        getTitle: function () {
            return this._getUserData();
        },

        _getUserData: function () {
            var data = this.appletDocModel.get(this.clientId);
            var userData;
            if (_.isEmpty(data)) { // 날짜 컴포넌트가 없는 상태로 문서 A를 생성한 후, 날짜 컴포넌트를 추가하고 문서 A를 조회 할 경우
                userData = '';
            } else {
                userData = moment(data, 'YYYYMMDD').format('YYYY-MM-DD');
            }
            return userData;
        }
    });

    var InputDatepickerComponent = FormComponent.define(ComponentType.Date, {
        name: worksLang['날짜'],
        valueType: 'DATE',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['날짜']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            //공통속성

            "defaultAsNow": {defaultValue: false},
            "defaultDate": {defaultValue: ''}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputDatepickerComponent);
});