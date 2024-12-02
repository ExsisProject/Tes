define('works/personal_list_manager/views/personal_list_manager', function (require) {

    var commonLang = require("i18n!nls/commons");
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        '기본형': worksLang['기본형'],
        '목록 화면 관리': worksLang['목록 화면 관리'],
        '목록 저장': worksLang['목록 저장'],
        '새 목록 저장': worksLang['새 목록 저장'],
        '삭제': commonLang['삭제'],
        '목록으로 이동': worksLang['목록으로 이동'],
        '목록 저장 설명': worksLang['목록 저장 설명'],
        '새 목록': worksLang['새 목록'],
        '목록 삭제': worksLang['목록 삭제'],
        "차트": worksLang["차트"],
        "차트 설명": worksLang["차트 설명"],
        "차트 추가": worksLang["차트 추가"],
        "차트 설정 설명1": worksLang["차트 설정 설명1"],
        "차트 설정 설명2": worksLang["차트 설정 설명2"],
    };

    var ListSetting = require("works/components/list_manager/models/list_setting");
    var ChartSetting = require("works/components/chart/models/chart_setting");

    var ListSettings = require('works/personal_list_manager/collections/personal_list_settings');
    var ChartSettings = require("works/components/chart/collections/chart_settings");
    var Columns = require("works/components/list_manager/collections/list_columns");
    var Fields = require("works/collections/fields");

    var BaseAppletView = require('works/views/app/base_applet');
    var ListSettingView = require('works/components/list_manager/views/list_setting');
    var ChartView = require('works/components/chart/views/chart_setting');

    var Template = require('hgn!works/personal_list_manager/templates/personal_list_manager');

    return BaseAppletView.extend({

        events: {
            'click [data-el-type="save"]': '_onClickSave',
            'click [data-el-type="saveAs"]': '_onClickSaveAs',
            'click [data-el-type="delete"]': '_onClickDelete',
            'click [data-el-type="navigateList"]': '_onClickNavigateList',
            'change [data-setting-type]': '_onChangeSetting',
            'click [el-add-chart]': '_onClickAddChart'
        },

        initialize: function (options) {
            BaseAppletView.prototype.initialize.apply(this, arguments);

            this.settingId = options.settingId || 0;
            this.setting = new ListSetting({}, {appletId: this.appletId});
            this.settings = new ListSettings([], {appletId: this.appletId});
            this.settings.fetch();
            this.listenTo(this.settings, 'sync', this._onSyncSettings);

            this.baseSetting = new ListSetting({}, {appletId: this.appletId});
            this.baseSetting.fetch();

            this.charts = new ChartSettings();

            $.when(
                this.settings.deferred,
                this.baseSetting.deferred
            ).then($.proxy(function () {
                this._initSetting();
            }, this));

            this.fields = new Fields([], {
                appletId: this.appletId,
                includeProperty: true,
                type: 'accessible',
                includeDocNoAndProcess: true
            });
            this.fields.fetch();
            this.columns = new Columns();

            this.$el.addClass('set_works');

            this.filters.on("changeFilter.filters", this._onChangeFilter, this);
        },

        render: function () {
            $.when(
                BaseAppletView.prototype.render.apply(this, arguments),
                this.settings.deferred,
                this.baseSetting.deferred,
                this.fields.deferred,
                this.charts.deferred
            ).then($.proxy(function () {
                this.$el.html(Template({
                    lang: lang,
                    isPrivate: true
                }));
                this._renderContent();
            }, this));

            return this;
        },

        _renderContent: function () {
            this._initData();
            this._renderCharts();
            this._renderColumns();
            this._renderSelect();
            this._toggleButtons();
            this._initChartSortable();
        },

        _initData: function () {
            this.charts.reset([]);
            this.charts.setChartsWithSeq(this.setting.get("charts"));
            this.charts.mergeFromFields(this.fields);

            this.chartFields = this.fields.getChartFields();
            this.numberFields = this.fields.getNumberFields();
        },

        _renderCharts: function () {
            this.$("[el-charts]").find("li").not("#addChartButton").remove();
            this.charts.each(function (chart) {
                this._renderChart(chart);
            }, this);
        },

        _renderChart: function (chartModel) {
            var view = new ChartView({
                appletId: this.appletId,
                chartFields: this.chartFields,
                numberFields: this.numberFields,
                model: chartModel
            });
            this.$("#addChartButton").before(view.render().el);
        },

        _renderColumns: function () {
            this.listSettingView = new ListSettingView({
                className: 'app_list_sort',
                isPrivate: true,
                columns: this.columns,
                fields: this.fields,
                setting: this.setting
            });

            this.$('[data-el-private-list_setting]').html(this.listSettingView.render().el);
        },

        _renderSelect: function () {
            var $wrapper = this.$('[data-el-setting-list-wrapper]');
            $wrapper.empty();
            $wrapper.append('<select data-setting-type><option value="0">' + lang['기본형'] + '</option></select>');
            var $list = $wrapper.find('select');
            this.settings.each(function (setting) {
                $list.append('<option value="' + setting.get('id') + '">' + setting.get('name') + '</option>');
            }, this);
            $list.val(this.settingId);
        },

        _toggleButtons: function () {
            var hasId = !!parseInt(this.settingId);
            this.$('[data-el-type="save"]').toggle(hasId);
            this.$('[data-el-type="delete"]').toggle(hasId);
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

        _showPopup: function (callback, settingObject) {
            var $popup = $.goPopup({
                header: lang['목록 저장'],
                pclass: 'layer_normal new_layer layer_works_new new_wide',
                contents:
                    '<p class="desc">' + lang['목록 저장 설명'] + '</p>' +
                    '<div class="form_type">' +
                    '<input class="input w_max" type="text" value="' + settingObject.name + '">' +
                    '</div>',
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    autoclose: false,
                    callback: $.proxy(function () {
                        var $name = $popup.find('input');
                        var name = $name.val();
                        if (name.length > 64 || name.length < 1) {
                            $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {
                                arg1: 1,
                                arg2: 64
                            }), $name, false, true);
                            return false;
                        }
                        settingObject.name = name;
                        callback.call(this, settingObject);
                        $popup.close();
                    }, this)
                }, {
                    btext: commonLang["취소"],
                    btype: "normal"
                }]
            });
            $popup.css('width', '');
            $popup.find('.btn_layer_x').hide();
        },

        /**
         * 개인목록은 제목 컬럼을 사용자가 직접 지정 할 수 없다.
         * 기본세팅으로부터 제목컬럼의 cid 를 가져와서
         * 현재 세팅의 컬럼중 해당 컬럼의 index 를 찾아서 세팅한다.
         * @param settingObject
         * @private
         */
        _save: function (settingObject) {
            this.listSettingView.getSetting();
            var viewData = this.setting.toJSON();
            var baseSettingTitleColumn = this.baseSetting.get('columns')[this.baseSetting.get('titleColumnIndex')];
            var baseSettingTitleColumnCid = baseSettingTitleColumn ? baseSettingTitleColumn.fieldCid : null;
            var currentSettingColumnCIds = _.map(viewData.columns, function (column) {
                return column.fieldCid;
            });
            viewData.titleColumnIndex = _.indexOf(currentSettingColumnCIds, baseSettingTitleColumnCid);
            viewData.charts = this.charts.toJSON();
            var setting = new ListSetting(_.extend({
                appletId: this.appletId,
                view: viewData
            }, settingObject), {
                appletId: this.appletId,
                type: 'personal'
            });
            setting.save({}, {
                success: $.proxy(function (model) {
                    $.goMessage(commonLang["저장되었습니다."]);
                    this.settings.fetch({
                        success: $.proxy(function () {
                            this.settingId = model.id;
                            this._changeSetting();
                        }, this)
                    });
                }, this)
            });
        },

        _delete: function () {
            this.setting.destroy({
                success: $.proxy(function () {
                    $.goMessage(commonLang["삭제되었습니다."]);
                    this.settingId = '0';
                    this._changeSetting();
                    this.settings.fetch();
                }, this)
            });
        },

        _onClickSave: function () {
            var name = this.settings.get(this.settingId).get('name');
            var settingObject = {id: this.setting.id, name: name};
            this._save(settingObject);
        },

        _onClickSaveAs: function () {
            this._showPopup(this._save, {name: lang['새 목록']});
        },

        _onClickDelete: function () {
            $.goConfirm(commonLang['삭제하시겠습니까?'], '', $.proxy(this._delete, this));
        },

        _onClickNavigateList: function () {
            GO.router.navigate('works/applet/' + this.appletId + '/home', true);
        },

        _onChangeFilter: function () {
            GO.router.navigate("works/applet/" + this.appletId + "/home", true);
        },

        _onChangeSetting: function (e) {
            this.settingId = $(e.currentTarget).val();
            this._changeSetting();
        },

        _changeSetting: function () {
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-list-setting', this.settingId);
            this._initSetting();
            this._renderContent();
            var postFix = parseInt(this.settingId) ? '/' + this.settingId : '';
            GO.router.navigate('works/applet/' + this.appletId + '/settings/listview/personal' + postFix, {replace: true});
        },

        _onSyncSettings: function () {
            this._renderSelect();
        },

        _initSetting: function () {
            var settingId = parseInt(this.settingId);
            var setting = settingId ? this.settings.get(settingId) : null;
            if (setting) {
                this.setting.set(_.extend(setting.get('view'), {id: settingId}));
                this.setting.setType('personal');
            } else {
                this.setting.set(this.baseSetting.toJSON());
                this.setting.setType('base');
            }
        },
        _onClickAddChart: function () {
            var chartOption = this.chartFields.length ? {fieldCid: this.chartFields.at(0).get("cid")} : {};
            var chartModel = new ChartSetting(chartOption);
            this.charts.push(chartModel);
            this._renderChart(chartModel);
        }
    });
});
