define("works/views/app/calendar_view/period_editor_popup", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");
    var PopupTmpl = require("hgn!works/templates/app/calendar_view/period_editor_popup");
    var ItemTmpl = require("hgn!works/templates/app/calendar_view/period_editor_item");

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        종료일: worksLang["종료일"],
        시작날짜선택: worksLang["시작날짜 선택"],
        종료날짜선택: worksLang["종료날짜 선택"],
        날짜항목추가: worksLang["날짜항목 추가"]
    };

    var MAX_PERIOD_LENGTH = 10;

    var PeriodItemView = Backbone.View.extend({
        tagName: 'li',
        className: 'period_item',
        events: {
            'click [data-delete]': '_onClickDelete',
            'click .wrap_toggle_btn label': '_onToggleSwitch',
            'change .startField select': "_onChangeStartSelect",
            'change .endField select': "_onChangeEndSelect"
        },
        initialize: function (options) {
            this.dateFields = options.dateFields;
        },
        render: function () {
            this.$el.html(ItemTmpl({
                lang: lang,
                dateFields: this.dateFields
            }));
            return this;
        },
        _onChangeStartSelect: function (e) {
            var $currentTarget = $(e.currentTarget);
            var $selectedStartOption = $currentTarget.find('option:selected');
            var $endFieldSelect = $currentTarget.closest('.period_item').find('.endField select');
            var $selectedEndOption = $endFieldSelect.find('option:selected');
            if ($selectedEndOption.attr('data-value-type') !== 'none') {
                this.validateStartEndOption($selectedStartOption, $selectedEndOption);
            }
        },
        _onChangeEndSelect: function (e) {
            var $currentTarget = $(e.currentTarget);
            var $selectedEndOption = $currentTarget.find('option:selected');
            var $startFieldSelect = $currentTarget.closest('.period_item').find('.startField select');
            var $selectedStartOption = $startFieldSelect.find('option:selected');

            this.validateStartEndOption($selectedStartOption, $selectedEndOption);
        },
        validateStartEndOption: function ($selectedStartOption, $selectedEndOption) {
            var $noneOption = $selectedEndOption.parent().find("option[data-value-type='none']");
            if ($selectedStartOption.attr('data-value-type') !== $selectedEndOption.attr('data-value-type')) {
                $.goSlideMessage(GO.i18n(worksLang["'{{arg1}}'와 '{{arg2}}'은 데이터 표기방식이 달라 데이터를 표시할 수 없습니다.(ex. 날짜 vs 날짜와 시간)"],
                    {arg1: $selectedStartOption.text(), arg2: $selectedEndOption.text()}));
                $noneOption.prop("selected", true);
            } else if ($selectedStartOption.val() === $selectedEndOption.val()) {
                $.goSlideMessage(worksLang["시작날짜와 종료날짜가 동일하여 데이터를 표시할 수 없습니다."]);
                $noneOption.prop("selected", true);
            }
        },
        _onClickDelete: function (e) {
            if ($('#period_items .period_item').length == 1) {
                return $.goSlideMessage(worksLang["하나 이상의 날짜 항목이 필요합니다."]);
            }
            $(e.currentTarget).closest('.period_item').remove();
        },
        _onToggleSwitch: function (e) {
            var $currentTarget = $(e.currentTarget);
            var $li = $currentTarget.closest(".period_item");
            var $input = $li.find('input');
            var $wave = $li.find(".date_wave");
            var $endField = $li.find(".endField");
            var isOn = $input.prop('checked');
            $input.prop('checked', isOn ? false : true);
            $wave.css('display', isOn ? 'none' : 'inline-block');
            $endField.css('display', isOn ? 'none' : 'inline-block');
        }
    });

    return Backbone.View.extend({ // PeriodEditorPopup
        events: {
            "click #addRow": "addRow"
        },
        initialize: function (options) {
            this.options = options || {};
            this.periods = options.periods || [];
            this.dateFields = options.dateFields || [];
        },

        render: function () {
            this.$el.html(PopupTmpl({lang: lang}));

            var self = this;
            this.periods.forEach(function (period) {
                var periodItemViewEl = self.addRow();
                periodItemViewEl.attr("period_id", period.id);
                periodItemViewEl.find(".startField select").val(period.startCid);
                if (period.endCid) {
                    periodItemViewEl.find(".endField select").val(period.endCid);
                    periodItemViewEl.find("input[type='checkbox']").prop("checked", true);
                    periodItemViewEl.find(".date_wave, .endField").css("display", "inline-block");
                } else {
                    periodItemViewEl.find("input[type='checkbox']").prop("checked", false);
                }
            });
        },
        addRow: function (e) {
            var rowLength = this.$el.find("#period_items div").length;
            if (rowLength == MAX_PERIOD_LENGTH) {
                $.goSlideMessage(GO.i18n(worksLang['최대 선택 갯수는 {{arg1}}개 입니다.'], {arg1: MAX_PERIOD_LENGTH}));
                return;
            }
            var periodItemView = new PeriodItemView({dateFields: this.dateFields});
            var periodItemViewEl = periodItemView.render().$el;
            this.$el.find("#period_items").append(periodItemViewEl);
            if (_.isUndefined(e)) {
                this.$el.find(".showEndField").show();
            }
            return periodItemViewEl;
        },
        savePeriods: function (appletId) {
            var data = this._getData();
            var isValid = this._validateData(data);
            if (!isValid) return;
            $.ajax({
                url: GO.contextRoot + "api/works/applet/" + appletId + "/calendarview/periods",
                type: 'PUT',
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(data)
            }).done(function () {
                $.goMessage(commonLang["저장되었습니다."]);
                GO.router.navigate('works/applet/' + appletId + '/calendar', true);
            }).fail(function () {
                $.goMessage(commonLang['실패했습니다.']);
            });
        },
        _getData: function () {
            var data = [];
            var rows = this.$el.find("#period_items .period_item");
            _.each(rows, function (row) {
                var period_id = $(row).attr('period_id');
                var selectedStartField = $(row).find('.startField option:selected');
                var selectedEndField = $(row).find('.endField option:selected');
                var isShowEndFieldOn = $(row).find('.wrap_toggle_btn input:checkbox').prop("checked");
                data.push({
                    id: period_id,
                    startCid: selectedStartField.val(),
                    endCid: isShowEndFieldOn ? selectedEndField.val() : undefined
                })
            });
            return data;
        },
        _validateData: function (periods) {
            if (periods.length == 0) {
                $.goMessage(worksLang["하나 이상의 날짜 항목이 필요합니다."]);
                return false;
            }

            var originalData = _.collect(periods, function (p) {
                return JSON.stringify(_.omit(p, "id"));
            });
            var uniqueData = _.uniq(originalData);
            if (originalData.length != uniqueData.length) {
                $.goMessage(worksLang["중복된 날짜 항목이 있습니다."]);
                return false;
            }
            return true;
        }
    });

});