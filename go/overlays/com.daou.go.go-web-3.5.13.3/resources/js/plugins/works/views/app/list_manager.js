define("works/views/app/list_manager", function (require) {

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "저장": commonLang["저장"],
        "취소": commonLang["취소"],
        "제목으로 지정된 항목이 없습니다.": worksLang["제목으로 지정된 항목이 없습니다."],
        "관리": worksLang["관리"],
        "페이지 제목": worksLang["목록 화면 관리"],
        "목록 화면 관리": worksLang["목록 화면 관리"],
        "페이지 설명": worksLang["목록 화면 관리 설명"],
        "목록 화면 관리 설명2": worksLang["목록 화면 관리 설명2"],
        "차트": worksLang["차트"],
        "차트 설명": worksLang["차트 설명"],
        "차트 추가": worksLang["차트 추가"],
        "차트 설정 설명1": worksLang["차트 설정 설명1"],
        "차트 설정 설명2": worksLang["차트 설정 설명2"],
        "관리 홈으로 이동": worksLang["관리 홈으로 이동"],
        "해당 앱으로 이동": worksLang["해당 앱으로 이동"]
    };

    var ListSetting = require("works/components/list_manager/models/list_setting");
    var ChartSetting = require("works/components/chart/models/chart_setting");

    var Columns = require("works/components/list_manager/collections/list_columns");
    var ChartSettings = require("works/components/chart/collections/chart_settings");
    var Fields = require("works/collections/fields");

    var BaseSettingView = require('works/views/app/base_setting');
    var ChartView = require("works/components/chart/views/chart_setting");
    var ListSettingView = require('works/components/list_manager/views/list_setting');

    var Template = require("hgn!works/components/list_manager/templates/list_manager");

    return BaseSettingView.extend({

        className: "go_content go_renew go_works_home app_temp",

        events: _.extend(BaseSettingView.prototype.events, {
            "click [el-add-chart]": "_onClickAddChart",
            "change #notUseDocNo": "toggleByNotUseDocNoFlag",
            "change input[name=docNoType]": "toggleDocNoType"
        }),

        initialize: function (options) {
            this.lang = lang;
            BaseSettingView.prototype.initialize.call(this, options);

            this.setting = new ListSetting({}, {appletId: this.appletId});
            this.fields = new Fields([], {appletId: this.appletId, includeProperty: true});
            this.columns = new Columns();
            this.charts = new ChartSettings();
        },

        render: function () {
            BaseSettingView.prototype.render.call(this);
            this.$('[el-content]').prepend(Template({lang: lang}));
            this._fetchData();

            return this;
        },

        _initChartSortable: function () {
            this.$("ul[el-charts]").sortable({
                items: "> li:not(#addChartButton)",
                tolerance: "pointer",
                cursor: "move",
                placeholder: {
                    element: function () {
                        return "<li><div class='column_create'><div class='wrap_works_info'></div></div></li>";
                    },
                    update: function () {
                        return;
                    }
                },
                stop: $.proxy(function (event, ui) {
                    var afterIndex = ui.item.index();
                    var chartCid = ui.item.attr("data-chart-cid");
                    this.charts.reorder(chartCid, afterIndex);
                }, this)
            });
            this.$("ul[el-charts]").find("li:not(#addChartButton)").css("cursor", "move");
        },

        _fetchData: function () {
            $.when(this.fields.fetch(), this.setting.fetch()).done($.proxy(function () {
                this._renderContent();
            }, this));
        },

        _renderContent: function () {
            this._initData();
            this._renderColumns();
            this._renderCharts();
            this._initChartSortable();
            this._initDocNoConfig(this.setting.get('docNoConfig'));
        },

        _initData: function () {
            this.charts.reset([]);
            this.charts.setChartsWithSeq(this.setting.get("charts"));
            this.charts.mergeFromFields(this.fields);

            this.chartFields = this.fields.getChartFields();
            this.numberFields = this.fields.getNumberFields();
        },

        _initDocNoConfig: function (docNoConfig) {
            var notUseDocNo = !docNoConfig.useDocNo;
            if (notUseDocNo) {
                this.$("#notUseDocNo").attr("checked", notUseDocNo);
            }
            this._renderDocNoConfig(notUseDocNo);
        },

        /**
         * fields 필요
         */
        _renderCharts: function () {
            this.$("[el-charts]").find("li").not("#addChartButton").remove();
            this.charts.each(function (chart) {
                this._renderChart(chart);
            }, this);
        },

        _renderChart: function (chartModel) {
            var view = new ChartView({
                chartFields: this.chartFields,
                numberFields: this.numberFields,
                model: chartModel,
                appletId: this.appletId
            });
            this.$("#addChartButton").before(view.render().el);
        },

        _renderColumns: function () {
            var view = new ListSettingView({
                columns: this.columns,
                fields: this.fields,
                setting: this.setting
            });
            this.$('[data-el-list-setting]').html(view.render().el);
        },

        _renderDocNoConfig: function (checked) {
            if (checked) { // 문서번호(채번)을 사용하지 않음.
                this.$('input[name=docNoType]').prop('disabled', true).addClass('disabled');
                this.$('#customInputView_1').find('input').prop('disabled', true).addClass('disabled');
                this.$('#customSelectView_1').find('select').prop('disabled', true).addClass('disabled');
            } else {
                this.$('input[name=docNoType]').prop('disabled', false).removeClass('disabled');
                this._reRenderDocNoType(this.$('input[name=docNoType]:checked').val());
            }
        },

        _reRenderDocNoType: function (val) {
            if (val == "custom") {
                this.$('#customInputView_1').find('input').prop('disabled', false).removeClass('disabled');
                this.$('#customSelectView_1').find('select').prop('disabled', false).removeClass('disabled');
            } else {
                this.$('#customInputView_1').find('input').prop('disabled', true).addClass('disabled');
                this.$('#customSelectView_1').find('select').prop('disabled', true).addClass('disabled');
            }
        },

        _onClickSave: function () {
            var titleColumnIndex = this.columns.getTitleColumnIndex();
            if (titleColumnIndex < 0) {
                $.goError(lang["제목으로 지정된 항목이 없습니다."]);
                return;
            }

            var invalids = _.compact(this.charts.map(function (chart) {
                var isInvalidTitle = chart.isInvalidTitle();
                var isInvalidGoal = chart.isInvalidGoal();

                if (isInvalidTitle) chart.trigger("change:title");
                if (isInvalidGoal) chart.trigger("change:goal");

                return isInvalidTitle || isInvalidGoal;
            }));
            if (invalids.length) return;

            // 문서번호 설정
            var docNoConfig = {
                useDocNo: !this.$('#notUseDocNo').is(':checked') || false,
                docNoType: this.$('input[name=docNoType]:checked').val() || "simple",
                customPrefix: this.$('#customPrefix').val() == "" ? null : this.$('#customPrefix').val(),
                customDigit: this.$('#customDigit').val() || 2
            };
            if (docNoConfig.useDocNo && docNoConfig.docNoType == "custom" && docNoConfig.customPrefix == null) {
                $.goError(worksLang["필수 항목입니다."]);
                this.$('#customPrefix').focus();
                return;
            }

            this.setting.set("docNoConfig", docNoConfig);
            this.setting.set("titleColumnIndex", titleColumnIndex);
            this.setting.set("sortColumnIndex", this.columns.getSortColumnIndex());
            this.setting.set("sortDirection", this.columns.getSortDirection());

            this.setting.set("columns", this.columns.toJSON());
            this.setting.set("charts", this.charts.toJSON());

            this.setting.save({}, {
                success: $.proxy(function () {
                    $.goMessage(commonLang["저장되었습니다."]);
                    this._fetchData();
                }, this),
                error: function () {
                    $.goMessage(commonLang["관리 서버에 오류가 발생하였습니다"]);
                }
            });
        },

        _onClickCancel: function (e) {
            e.preventDefault();
            var self = this;
            $.goConfirm(
                commonLang['취소하시겠습니까?'],
                worksLang['편집 취소'],
                _.bind(function () {
                    self._fetchData();
                }, this)
            );
        },

        _onClickAddChart: function () {
            var chartOption = this.chartFields.length ? {fieldCid: this.chartFields.at(0).get("cid")} : {};
            var chartModel = new ChartSetting(chartOption);
            this.charts.push(chartModel);
            this._renderChart(chartModel);
        },

        toggleByNotUseDocNoFlag: function (e) {
            this._renderDocNoConfig($(e.target).is(':checked'));
        },

        toggleDocNoType: function (e) {
            this._reRenderDocNoType($(e.target).val());
        }
    });
});
