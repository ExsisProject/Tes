define('works/components/formbuilder/form_components/input_datetimepicker/input_datetimepicker', function(require) {

    var GO = require('app');
    var NameTagView = require("go-nametags");
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');
    var AlarmSettingView = require('works/components/alarm_setting/views/alarm_setting');

    var TimeSelectView = require('works/components/formbuilder/core/views/time_select');

    var Validator = require('works/components/formbuilder/form_components/input_datetimepicker/input_datetimepicker_validator');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_datetimepicker/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_datetimepicker/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_datetimepicker/option');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');

    var WorksUtil = require('works/libs/util');

    var lang = _.extend(commonLang, {
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        MINUTE: commonLang['분 전'],
        HOUR: commonLang['시간 전'],
        DAY: commonLang['일 전']
    });

    var OptionView = BaseOptionView.extend({

        customEvents: {
            'click .ic_reset': "dateClear",
            "click input[name=defaultAsNow]": '_updateUseBackdrop',
            "click ul[el-time-list] li": "_onSelect",
            'click [data-alarm-setting]': '_onClickAlarmSetting',
            "keydown input[data-time]": "_onKeydown",
            "change input[data-time]": "_onChange",
            'change input[data-date]': 'toggleClearIcon'
        },

        renderBody: function() {

            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON(),
                isMultiple: this.options.multiple
            }));

            this.$("input[data-date='start']").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                beforeShow: function(elplaceholder, object) {
                },
                onClose: _.bind(function(selectedDate) {
                    this.model.set('defaultDate', selectedDate);
                }, this)
            });

            this.timeSelectView = new TimeSelectView({
                useBackdrop: true
            });
            this.$(".wrap_select").html(this.timeSelectView.render().el);
            this.timeSelectView.linkBackdrop(this.$("input[data-time='start']"));

            this._changeSettingByDefaultAsNow(this.model.get('defaultAsNow'));

            if(!this.options.multiple) {
            	this._initAlarmView();
            }
        },

        _changeSettingByDefaultAsNow: function(isChecked) {
            if (isChecked) {
                this.timeSelectView.unBindBackdrop();
                this.timeSelectView.$("input[data-time='start']").val("").prop("disabled", true);
                this.$("input[data-date='start']").val("").
                    prop("disabled", true).trigger('change');
                this.model.set({'defaultDate': "", 'defaultTime': '', 'defaultAsNow': true});
            } else {
                this.timeSelectView.bindBackdrop();
                this.timeSelectView.$("input[data-time='start']").val(this.model.get('defaultTime')).prop("disabled", false);
                this.$("input[data-date='start']").val(this.model.get('defaultDate'))
                    .prop("disabled", false).trigger('change');
                this.model.set('defaultAsNow', false);
            }
        },

        _updateUseBackdrop: function(e) {
            var $target = $(e.currentTarget);
            var isChecked = $target.is(":checked");
            this._changeSettingByDefaultAsNow(isChecked);
            this.model.trigger('change');
        },

        _onSelect: function(e) {
            e.stopPropagation();
            var target = $(e.currentTarget);
            var time = target.find("span.txt").text();
            this.$("input[data-time='start']").val(time);
            this.timeSelectView.toggle(false);
            this._selectOption();
        },

        _onKeydown: function(e) {
            if (e.keyCode && e.keyCode != 13) return;
            e.preventDefault();

            var target = $(e.currentTarget);
            var time = target.val();

            this.timeSelectView.toggle(false);
            this.$("input[data-time='start']").val(WorksUtil.parseTime(time));
            this._selectOption();
        },

        _onChange: function(e) {
            var target = $(e.currentTarget);
            var time = target.val();
            this.$("input[data-time='start']").val(WorksUtil.parseTime(time));
            this._selectOption();
        },

        _selectOption: function() {
            var $targetValue = this.timeSelectView.$("input[data-time='start']").val();
            this.model.set('defaultTime', $targetValue);
        },

        dateClear: function() {
            this.$("input[data-date='start']").val('').trigger('change');
            this.model.set({'defaultDate': ""});
        },

        toggleClearIcon: function() {
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
        render: function() {
            var value = this.appletDocModel.get(this.getCid());

            if ((!value)
                && (this.model.get('defaultAsNow') || (this.model.get('defaultDate') || this.model.get('defaultTime')))) { // 데이터가 없는 경우 세팅해주면 된다.
                var defaultVal = {};
                var val = this._getDefaultValue();
                defaultVal[this.getCid()] = val;
                this.appletDocModel.set(defaultVal);
            }

            if (!GO.util.isMobile()) {
                this.initRender();
            } else {
                this.initRenderMobile();
            }
        },

        events: function() {
            return this.isEditable() ? BaseFormView.prototype.events : _.extend({}, BaseFormView.prototype.events, {
                'click .ic_reset': "dateClear",
                "click ul[el-time-list] li": "_onSelect",
                "keydown input[data-time]": "_onKeydown",
                "change input[data-time]": "_onChange",
                'change input[data-date]': '_onChangeDate'
            });
        },

        initRender: function() {
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
            this.$("input[data-date='start']").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                onSelect: _.bind(function() {
                    this._onChangeDate();
                }, this)
            });

            this.$("input[data-date='start']").val(this._getDate())/*.trigger('change')*/;
            this.toggleClearIcon();

            this.timeSelectView = new TimeSelectView({
                useBackdrop: !this.isEditable()
            });
            this.$body.find('span.wrap_select').html(this.timeSelectView.render().el);
            this.timeSelectView.linkBackdrop(this.$("input[data-time='start']"));
            this.timeSelectView.$("input[data-time='start']").val(this._getTime());
            
            if (this.isEditable()) {
                this.$("input[data-date='start'], input[data-time='start']").prop('disabled', true);
            }
        },

        initRenderMobile: function() {
            this.$body.html(renderFormTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label')),
                inputValue: this._getTime(),
                "isEditable?": this.isEditable(),
                "isMobile?": GO.util.isMobile()
            }));
            this.$("input[data-date='start']").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true
            });
            if (this.isEditable()) {
                this.$("input[data-date='start']").prop('disabled', true);
            }
            this.$("input[data-date='start']").val(this._getDate())/*.trigger('change')*/;
        },

        dateClear: function() {
            this.$("input[data-date='start']").val('').trigger('change');
        },

        _onChangeDate: function() {
            this.toggleClearIcon();
            this.appletDocModel.set(this.getDataFromView());
        },

        /**
         * setTimeout 제거. 꼼수 넣지 말고 근본 원인을 찾아서 없애라.
         */
        toggleClearIcon: function() {
            this.$('.ic_reset').toggle(!_.isEmpty(this.$("input[data-date='start']").val()));
        },

        remove: function() {
            BaseFormView.prototype.remove.apply(this, arguments);
        },

        _getDate: function() {
            var val = this.appletDocModel.get(this.clientId) || {};
            var defaultDate;

            if (this.appletDocModel.id) {
                defaultDate = '';
            } else { //등록모드일때 TODO 공통함수로 바뀌면 갈아끼자!
                defaultDate = this.model.get('defaultDate') || "";
                if (this.model.get('defaultAsNow')) { //기본값 설정(생성시간)이 true이면
                    defaultDate = moment().format("YYYY-MM-DD");
                }
            }

            var result = defaultDate;
            var hasValue = _.isArray(val) ? _.compact(val).length : val && val.length > 0;
            if (hasValue) {
                result = GO.util.toMoment(val).format('YYYY-MM-DD');
            }
            return result;
        },

        _getTime: function() {
            var val = this.appletDocModel.get(this.clientId);
            var defaultTime;

            if (this.appletDocModel.id) {
                defaultTime = '';
            } else { //등록모드일때 TODO 공통함수로 바뀌면 갈아끼자!
                defaultTime = this.model.get('defaultTime') || "";
                if (this.model.get('defaultAsNow')) { //기본값 설정(생성시간)이 true이면
                    defaultTime = moment().format("HH:mm");
                }
            }

            var result = defaultTime;
            var hasValue = _.isArray(val) ? _.compact(val).length : val && val.length > 0;
            if (hasValue) {
                result = GO.util.toMoment(val).format('HH:mm');
            }
            return result;
        },

        _onSelect: function(e) {
            e.stopPropagation();
            var target = $(e.currentTarget);
            var time = target.find("span.txt").text();
            this.$body.find("input[data-time='start']").val(time);
            this.appletDocModel.set(this.getDataFromView());
            this.timeSelectView.toggle(false);
        },

        _onKeydown: function(e) {
            if (e.keyCode && e.keyCode != 13) return;
            e.preventDefault();

            var target = $(e.currentTarget);
            var time = target.val();

            this.timeSelectView.toggle(false);
            this.$body.find("input[data-time='start']").val(WorksUtil.parseTime(time));
            this.appletDocModel.set(this.getDataFromView());
        },

        _onChange: function(e) {
            var target = $(e.currentTarget);
            var time = target.val();
            this.$body.find("input[data-time='start']").val(WorksUtil.parseTime(time));
            this.appletDocModel.set(this.getDataFromView());
        },

        getFormData: function() {
            if (this.isMultiple()) {
                this.appletDocModel.set(this.clientId, this._getMultipleData());
            }
            return this.appletDocModel.toJSON();
        },

        getDataFromView: function() {
            var values = [], returnData = {};
            if (this.isMultiple()) {
                values.push(this.getSubmitValue());
                _.each(this.getMultipleViews(), function(multiView) {
                    values.push(multiView.getSubmitValue());
                });

            } else {
                values = this.getSubmitValue();
            }
            returnData[this.getCid()] = values;
            return returnData;
        },

        getSubmitValue: function() {
            var timeValue, dateValue;

            dateValue = this.$body.find('input[data-date="start"]').val();
            if (!GO.util.isMobile()) {
                timeValue = this.timeSelectView ? this.timeSelectView.$('input[data-time="start"]').val() : '';
            } else {
                timeValue = this.$body.find('input[type="time"]').val();
            }

            var isEmpty = _.isEmpty(dateValue) || _.isEmpty(timeValue);

            return !isEmpty ? moment(dateValue + 'T' + timeValue) : null;
        },

        validate: function() {
            var $dateEl = this.$body.find('input[data-date="start"]');
            var $timeEl = GO.util.isMobile() ? this.$body.find('input[type="time"]') : this.timeSelectView.$('input[data-time="start"]');

            var result = this.validator.validate({dateValue:$dateEl.val(), timeValue:$timeEl.val()}, this.model.toJSON());
            if (!result.isValid) {
                if (result.type == "required_date") {
                    this.printErrorTo($dateEl, result.message);
                } else if (result.type == "required_time") {
                    this.printErrorTo($timeEl, result.message);
                }
            }
            return result.isValid;
        },

        _getDefaultValue: function() {
            /*
            defaultDate, defaultTime 있으면 설정, defaultAsNow가 있으면 현재시점
             */
            var defaultDate = this.model.get('defaultDate');
            var defaultTime = this.model.get('defaultTime');

            if (this.model.get('defaultAsNow')) {
                defaultDate = GO.util.now().format('YYYY-MM-DD');
                defaultTime = GO.util.now().format('HH:mm');
            }

            var isEmpty = _.isEmpty(defaultDate) && _.isEmpty(defaultTime);
            return !isEmpty ? moment(defaultDate + 'T' + defaultTime) : null;
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function() {
            var userData;
            var val = this.appletDocModel.get(this.clientId) || "";
            if (val) {
                userData = GO.util.toMoment(this.appletDocModel.get(this.clientId)).format('YYYY-MM-DD(ddd) HH:mm');
            }
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
                userData: userData,
                timersLabel: timersLabel
            }));
        },
        getTitle: function() {
            return GO.util.toMoment(this.appletDocModel.get(this.clientId)).format('YYYY-MM-DD(ddd) HH:mm');
        }
    });

    var InputDateTimepickerComponent = FormComponent.define(ComponentType.Datetime, {
        name: worksLang['날짜와 시간'],
        valueType: 'DATETIME',
        group: 'basic',

        properties: {
            "label": {defaultValue: worksLang['날짜와 시간']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false},
            //공통속성

            "defaultAsNow": {defaultValue: false},
            "defaultDate": {defaultValue: ''},
            "defaultTime": {defaultValue: ''}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputDateTimepickerComponent);
});