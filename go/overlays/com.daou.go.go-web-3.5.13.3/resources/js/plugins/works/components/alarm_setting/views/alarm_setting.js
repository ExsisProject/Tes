define('works/components/alarm_setting/views/alarm_setting', function(require) {
    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");

    var Template = require('hgn!works/components/alarm_setting/templates/alarm_setting');
    var TimeItemTemplate = Hogan.compile([
        '<li data-unit="{{unit}}" data-number="{{number}}">',
            '<span class="minor">{{lang.알람}}: {{number}} {{label}}</span>',
            '<span class="btn_border">',
                '<span class="ic ic_delete" data-delete></span>',
            '</span>',
        '</li>'
    ].join(''));

    var lang = _.extend(commonLang, worksLang, {
        MINUTE: commonLang['분 전'],
        HOUR: commonLang['시간 전'],
        DAY: commonLang['일 전']
    });

    return Backbone.View.extend({

        events: {
            'click [data-add-time]': '_onClickAddTimeItem',
            'click [data-delete]': '_onClickDeleteTimeItem'
        },

        initialize: function(options) {
            options = options || {};
            this.userFields = options.userFields;
            this.useMinute = options.useMinute !== false;
            this.useHour = options.useHour !== false;
            this.alarms = options.alarms || {};
        },

        render: function() {
            this.$el.html(Template({
                userFields: this.userFields.toJSON(),
                useMinute: this.useMinute,
                useHour: this.useHour,
                alarms: this.alarms,
                lang: lang
            }));
            this._setData();

            return this;
        },

        getData: function() {
            var items = this.$('li[data-unit][data-number]');
            var timers = _.map(items, function(item) {
                var $item = $(item);
                return {
                    type: $item.attr('data-unit'),
                    time: $item.attr('data-number')
                };
            });
            var methods = _.map(this.$('[data-method]').find('input:checked'), function(input) {
                return $(input).val();
            });
            var method = methods.length === 2 ? 'ALL' : methods[0];
            var targets = _.map(this.$('[data-targets]').find('input:checked'), function(input) {
                return $(input).val();
            });

            if (!timers.length || !methods.length || !targets.length) {
                $.goMessage(commonLang['필수항목을 입력하지 않았습니다.']);
                return;
            }

            return {
                timers: timers,
                method: method,
                targets: targets
            };
        },

        _setData: function() {
            _.each(this.alarms.timers, function(timer) {
                this._addTime(timer.time, timer.type);
            }, this);
            _.each(this.alarms.targets, function(target) {
                this.$('input[value="' + target + '"]').attr('checked', true);
            }, this);
            var methods = this.alarms.method === 'ALL' ? ['NOTIFICATION', 'MAIL'] : [this.alarms.method];
            _.each(methods, function(method) {
                this.$('input[value="' + method + '"]').attr('checked', true);
            }, this);
        },

        _onClickAddTimeItem: function () {
            var number = this.$('[data-number]').val();
            var unit = this.$('[data-unit]').val();
            if (!number || !unit) return;
            this._addTime(number, unit);
        },

        _addTime: function(number, unit) {
            var items = this.$('li[data-unit][data-number]');
            if (items.length >= 3) {
                $.goMessage(commonLang['최대 3개까지만 설정할 수 있습니다']);
                return;
            }
            var hasItem = !!this.$('li[data-unit="' + unit + '"][data-number="' + number + '"]').length;
            if (hasItem) {
                $.goMessage(commonLang['동일한 시간대는 사용할 수 없습니다']);
                return;
            }
            this.$('[data-time-list-wrapper]').show();
            this.$('[data-time-list]').append(TimeItemTemplate.render({
                number: number,
                unit: unit,
                label: lang[unit],
                lang: lang
            }));
        },

        _onClickDeleteTimeItem: function(e) {
            $(e.target).closest('li').remove();
            var $listWrapper = this.$('[data-time-list-wrapper]');
            if (!$listWrapper.find('li').length) $listWrapper.hide();
        }
    });
});