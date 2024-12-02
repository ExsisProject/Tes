define('works/views/app/app_home', function (require) {

    require("jquery.nanoscroller");

    var when = require('when');

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "등록": commonLang["등록"],
        "삭제": commonLang["삭제"],
        "목록 다운로드": commonLang["목록 다운로드"],
        "선택된 항목이 없습니다.": commonLang["선택된 항목이 없습니다."],
    };

    var PresentationView = require('works/components/chart/views/presentation');
    var BaseAppletView = require('works/views/app/base_applet');
    var DocListView = require('works/components/doc_list/views/app_home_doc_list');
    var FilterView = require("works/components/filter/views/filter");
    var ChartView = require("works/components/chart/views/chart");

    var DownloadManagerBtnView = require('works/views/app/download_manager_btn');

    var Docs = require("works/collections/docs");
    var Fields = require("works/collections/fields");
    var ChartSettings = require("works/components/chart/collections/chart_settings");
    var ListSettings = require('works/personal_list_manager/collections/personal_list_settings');

    var ListSetting = require("works/components/list_manager/models/list_setting");

    var FormTabTemplate = require("hgn!works/templates/app/app_home_form_tab");

    var Tmpl = Hogan.compile([
        '<div class="dashboard_box {{layoutType}}" el-chart-wrapper>',
        '<ul class="type_chart_view">',
        '<li class="col_1" data-el-chart-layout="type_col_01" title="{{label.type1}}"><a class="chart_type"><span class="ic_works ic_chart_v1"></span></a></li>',
        '<li class="col_2" data-el-chart-layout="type_col_02" title="{{label.type2}}"><a class="chart_type"><span class="ic_works ic_chart_v2"></span></a></li>',
        '<li class="col_3 on" data-el-chart-layout="type_col_03" title="{{label.type3}}"><a class="chart_type"><span class="ic_works ic_chart_v3"></span></a></li>',
        '</ul>',
        '<div class="card_item_wrapper"></div>',
        '</div>'
    ].join(""));

    var NoExistAccessibleForm = Hogan.compile([
        '<div class="error_page"><hgroup><span class="ic_data_type ic_error_page"></span><h2>{{title}}</h2></hgroup>',
        '{{#message}}<p class="desc">{{&.}}</p>{{/message}}'
    ].join(""));

    /**
     * 업무 앱 홈 메인 뷰.
     *
     * 목록 화면 순위: 관리자 목록 설정 < 개인 목록 설정 < 사용자의 액션에 의한 마지막 목록 값
     */
    return BaseAppletView.extend({

        events: {
            'click #navigateToListSetting': '_onClickNavigateToListSetting',
            "click [data-action='chartArrow']": "toggleChart",
            'change #settingList': '_onChangeSettingList',
            'click [data-el-chart-layout]': '_onChangeChartLayout',
        },

        initialize: function (options) {
            GO.util.store.set('applet-viewtype', 'list', {type: 'session'});

            this.useCachedCondition = options.useCachedCondition;
            BaseAppletView.prototype.initialize.apply(this, arguments);

            this.filters.on("changeFilter.filters", this._onChangeFilter, this);

            var storedSearchObject = {};
            if (this.useCachedCondition) {
                storedSearchObject = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {};
            } else {
                GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', {}, {type: 'session'});
            }
            this._setSubFormId();
            this.settingId = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-works-list-setting', null) || '0';

            this.docs = new Docs([], {
                appletId: this.appletId,
                includeActivityCount: true,
                subFormId: this.subFormId,
                personalViewId: this.settingId
            });
            this._settingSynced = $.Deferred();

            this._fieldSynced = $.Deferred();
            this.docs.setPageNo(storedSearchObject.page || 0);
            this._setPropertyAndDirection();
            this.docs.on("sync", this._onSyncDocs, this);

            this.share.on('sync', this._onSyncShare, this);
            this._shareSynced = $.Deferred();

            this.charts = new ChartSettings();
            this.setting = new ListSetting({}, {appletId: this.appletId});
            this.settings = new ListSettings([], {appletId: this.appletId});//setting을 appletId로 하면

            this.fields = new Fields([], {
                appletId: this.appletId,
                includeProperty: true,
                subFormId: this.subFormId
            });
            this.fields.on("sync", this._onSyncFields, this);

            this.$el.on("searchByFilter", $.proxy(function (event, param) {
                this._search(param);
            }, this));

            this.layoutView.$el.on("storeParam", $.proxy(function () {
                this.docs.storeParam();
            }, this));

            var layoutType = GO.util.store.get(GO.session('id') + '-' + '-chart-view-layout') || 'type_col_03';
            this.$el.html(Tmpl.render({
                layoutType: layoutType,
                label: {
                    type1: worksLang["1단 보기"],
                    type2: worksLang["2단 보기"],
                    type3: worksLang["3단 보기"]
                }
            }));

            this.$el.on('storeConditions', _.bind(this._storeConditions, this));
            this.$el.on('selectPage', $.proxy(function (e, page) {
                this._storePage(page);
                GO.router.navigate('works/applet/' + this.appletId + '/home/search', {replace: true});
            }, this));
            this.$el.on('sorting:grid', _.bind(this._onSorting, this));
            this.$el.on('changeFilter', _.bind(function () {
                GO.router.navigate('works/applet/' + this.appletId + '/home/search', {replace: true});
            }, this));
            this.$el.on('showPresentationMode', _.bind(this._showPresentationMode, this));
            this.$el.on('update:grid', _.bind(this._reloadListView, this));
            this.$el.on('contextMenu:grid', _.bind(this._onSelectContextMenu, this));
            this.$el.on('headerSummary:grid', _.bind(this._onListHeaderSummary, this));
            this.$el.on('update:chart', _.bind(this._setChartsView, this));
        },

        render: function () {
            $.when(
                BaseAppletView.prototype.render.apply(this, arguments),
                this.accessibleForms.length > 0 ? this.fields.fetch() : this._renderNoExistForm(this.$el),
                this.setting.fetch(),
                this.settings.fetch()
            ).then($.proxy(function () {
                if (this.accessibleForms.length < 1) {
                    return;
                }
                this._initCurrentSettings();

                var self = this;
                var selectTab = false;

                if (this.accessibleForms.length > 0) {
                    this.$("div.content_tab").remove();
                    this.$el.before(FormTabTemplate({
                        forms: this.accessibleForms,
                        isSelect: function () {
                            if (this.mainForm) {
                                if (GO.util.isInvalidValue(self.subFormId)) {
                                    selectTab = true;
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                            if (this.id == self.subFormId) {
                                selectTab = true;
                                return true;
                            }
                            return false;
                        },
                        isFormManager: false
                    }));

                    $("[el-form-tab]").click(function (e) {
                        self._onChangeForm(e);
                    });

                    $(".tab_menu_wrap").scroll(function (e) {
                        self._onScrollMoveTab(e);
                    });

                    $("span[el-arrow-tab]").click(function (e) {
                        self._onClickMoveTab(e);
                    });

                    if (!selectTab) {
                        $(".tab_menu>li").first().addClass("active");
                    }

                    $(".tab_menu_wrap").animate({
                        scrollLeft: $("li.active") == undefined || $("li.active").attr('data-id') == 'tab_main' ? 0 : $("#tabMenu").scrollLeft() - $("#tabMenu").offset().left + $("li.active").offset().left - 45
                    }, 200);

                    this.__onScrollMoveTab($(".tab_menu_wrap"));
                }

                this._renderFilterView();

                // go_works_situation : apphome 특화 css
                var contentElement = this.layoutView.getContentElement();
                contentElement.removeClass("build_situation");
                contentElement.addClass("go_works_situation");

                // 디자인팀 요청 클래스 반영.
                this.layoutView.$el.removeClass('go_skin_works');

                //DocListView 세팅 리스트 렌더링
                this.settings.deferred.done($.proxy(function () {
                    this._renderSettingList();
                }, this));

                this._renderListView();
                this._chartViewDisplaySetting();
            }, this));
        },
        _chartViewDisplaySetting: function () {
            if (GO.util.store.get(GO.session('id') + '-' + this.appletId + '-is-chart-view-active') == false) {
                this.$("a.chart").removeClass('off');
                this.$("a.chart").find('.txt').text(worksLang["차트보기"]);
                this.$("div.dashboard_box").hide();
            } else {
                this.$("a.chart").addClass('off');
                this.$("a.chart").find('.txt').text(worksLang["차트접기"]);
                if (!this.charts.length) {
                    this.$("div[el-chart-wrapper]").hide();
                } else {
                    if (this.$('.card_item_wrapper').children().length < 1) {
                        this.$("div[el-chart-wrapper]").hide();
                    } else {
                        this.$("div.dashboard_box").show();
                    }
                }
            }
        },

        _reloadListView: function () {
            $.when(
                this.settings.fetch(),
                this.setting.fetch()
            ).then($.proxy(function () {
                this.adminSetting = this.setting.toJSON();
                this.listView._setSetting(this.setting);
                this.listView._setSettings(this.settings);
                this._renderSettingListView();
                this._chartViewDisplaySetting();
            }, this));
        },

        _onSelectContextMenu: function (e, contextMenu) {
            this.listView._onSelectContextMenu(contextMenu);
        },

        _onListHeaderSummary: function(e, headerSummary) {
            GO.util.store.set(this.appletId + '-gridview-headerSummary', headerSummary.visible);
        },

        _onChangeChartLayout: function (e) {
            var target = $(e.currentTarget);
            target.siblings().removeClass('on');
            target.addClass('on');
            var layoutType = $(e.currentTarget).attr('data-el-chart-layout');
            GO.util.store.set(GO.session('id') + '-' + '-chart-view-layout', layoutType, 'local');
            this.$('.dashboard_box').removeClass('type_col_01 type_col_02 type_col_03').addClass(layoutType);
            $(window).trigger('resize');
        },

        _showPresentationMode: function (event, targetChart) {
            var presentationView = new PresentationView({
                model: targetChart,
                charts: this.charts,
                appletId: this.appletId,
                chartFields: this.fields.getChartFields(),
                numberFields: this.fields.getNumberFields(),
                width: '100%',
                height: '100%'
            });
            $('.go_wrap').prepend(presentationView.render().el);
        },

        _onSyncShare: function () {
            this._shareSynced.resolve();
        },

        _onSyncFields: function () {
            this._settingSynced.done($.proxy(function () {
                this._renderChartsView();
            }, this));
            this._fieldSynced.resolve();
        },

        _onSyncDocs: function () {
            this.$("#docsLength").text(this.docs.total);
        },

        _initCurrentSettings: function () {
            this.adminSetting = this.setting.toJSON();
            var settingId = parseInt(this.settingId);
            var setting = settingId ? this.settings.get(settingId) : null;
            if (setting) {
                this.setting.set(_.extend(setting.get('view'), {id: settingId}));
                this.charts.reset(this.setting.get("charts"));
            } else {
                this.charts.reset(this.setting.get("charts"));
            }
            if (!this.useCachedCondition) this._setPropertyAndDirection();
            this._settingSynced.resolve();
        },

        _onSorting: function (e, sortData) {
            this._storeSort(sortData);
            GO.router.navigate('works/applet/' + this.appletId + '/home/search', {replace: true});
        },

        _onChangeFilter: function () {
            this.docs.setPageNo(0);
        },

        _renderChartsView: function () {
            this.charts.mergeFromFields(this.fields);
            this.$("div.card_item_wrapper").empty();

            this.charts.each(function (chartSetting) {
                if (chartSetting.get("hasDeletedField")) return;

                var chartView = new ChartView({
                    model: chartSetting,
                    appletId: this.appletId,
                    chartFields: this.fields.getChartFields(),
                    numberFields: this.fields.getNumberFields()
                });
                this.$("div.card_item_wrapper").append(chartView.el);
                chartView.render();
            }, this);

            if (!this.charts.length) {
                this.$("div[el-chart-wrapper]").hide();
            }
        },

        /**
         * fields 를 먼저 넣고 fetch 해야한다.
         */
        _renderFilterView: function () {
            var filterView = new FilterView({
                fields: this.fields,
                appletId: this.appletId,
                filters: this.filters,
                isAdmin: this.baseConfigModel.isAdmin(GO.session('id')),
                useDocNo: (this.adminSetting.docNoConfig ? this.adminSetting.docNoConfig.useDocNo : false),
                refLink: this.options.refLink,
                useCachedCondition: this.useCachedCondition,
                collection: this.settings.toJSON(),
                mainForm: GO.util.isInvalidValue(this.subFormId)
            });

            this.$el.prepend(filterView.el);
            filterView.render(); // filter 가 fetch 방식에서 storage 방식으로 바뀜으로 인해 엘리먼트를 먼저 붙인 후 렌더링 한다.
            this.conditions = filterView._getConditions();

            if (!this.charts.length) {
                this.$("a.chart").hide();
            } else {
                this.$("a.chart").show();
            }
        },

        _renderSettingList: function () {
            var $select = this.$('#settingList');
            var settingId = $select.find('[value="' + this.settingId + '"]').length ? this.settingId : '0';
            this.$('#settingList').val(settingId);
        },

        _renderListView: function () {
            var isAdmin = this.baseConfigModel.isAdmin(GO.session("id"));

            if (this.listView) {
                this.listView.remove();
            }

            this.listView = new DocListView({
                appletId: this.appletId,
                subFormId: this.subFormId,
                checkbox: !!isAdmin,
                settingId: this.settingId,
                settings: this.settings,
                setting: this.setting,
                adminSetting: this.adminSetting,
                collection: this.docs,
                fields: this.fields,
                buttons: this._getGridButtons(),
                conditions: this.conditions,
                usePopupView: true
            });

            this.listView.$el.on("navigate:grid", $.proxy(function (event, docId) {
                this._setDocIdsTable();
                if (GO.util.isValidValue(this.subFormId)) {
                    GO.router.navigate("works/applet/" + this.appletId + "/doc/" + docId + '/navigate/' + this.subFormId, true);
                } else {
                    GO.router.navigate("works/applet/" + this.appletId + "/doc/" + docId + '/navigate', true);
                }
            }, this));

            this.listView.dataFetch().done($.proxy(function () {
                this.$el.append(this.listView.render().el);
            }, this));
        },

        _getGridButtons: function () {
            var isAdmin = this.baseConfigModel.isAdmin(GO.session("id"));
            var btnTmpl = Hogan.compile([
                '<a class="btn_tool">',
                '<span class="ic_toolbar {{className}}"></span>',
                '<span class="txt">{{label}}</span>',
                '</a>'
            ].join(""));
            var downloadBtnTmpl = Hogan.compile([
                '<div class="btn_submenu">',
                '<a class="btn_tool btn_tool_multi" id="downloadBtn">',
                '<span class="ic_toolbar {{className}}"></span>',
                '<span class="txt">{{label}}</span>',
                '</a>',
                '<span class="btn_func_more" id="submenuBtn">',
                '<span class="ic ic_arrow_type3"></span>',
                '</span>',
                '</div>'
            ].join(""));
            var buttons = [];

            if (this._isDeletable()) {
                buttons.push({
                    render: function () {
                        return btnTmpl.render({
                            label: lang["삭제"],
                            className: "del"
                        });
                    },
                    onClick: $.proxy(function () {
                        this._deleteDocs();
                    }, this)
                });
            }

            if (isAdmin) {
                buttons.push({
                    render: function () {
                        return downloadBtnTmpl.render({
                            label: lang["목록 다운로드"],
                            className: "download"
                        });
                    },
                    onClick: $.proxy(function () {
                        window.location.href = this.docs.csvUrl();
                    }, this),
                    type: function () {
                        return "submenu";
                    },
                    getView: _.bind(function () {
                        return new DownloadManagerBtnView({
                            appletId: this.appletId,
                            collection: this.docs,
                            conditions: this.conditions
                        });
                    }, this)
                });
            }

            if (this.share.get('docAddible')) {
                buttons.unshift({
                    render: function () {
                        return btnTmpl.render({
                            label: lang["등록"],
                            className: "write"
                        });
                    },
                    onClick: $.proxy(function () {
                        if (GO.util.isValidValue(this.subFormId)) {
                            GO.router.navigate("works/applet/" + this.appletId + "/doc/new/" + this.subFormId, true);
                        } else {
                            GO.router.navigate("works/applet/" + this.appletId + "/doc/new", true);
                        }
                    }, this)
                });

                buttons.push({
                    render: function () {
                        return btnTmpl.render({
                            label: worksLang["일괄 등록"],
                            className: "upload"
                        });
                    },
                    onClick: $.proxy(function () {
                        GO.router.navigate("works/applet/" + this.appletId + "/settings/csv", true);
                    }, this)
                });
            }
            return buttons;
        },

        _search: function (param) {
            this.docs.queryString = param.queryString;
            if (!param.useStorePage) this.docs.pageNo = 0;
            this._storePage(this.docs.pageNo);

            when.all([this._settingSynced, this._fieldSynced, this.settings.deferred]).then($.proxy(function () {
                GO.util.preloader(this.docs.fetch());
                this.charts.setQueryString(param.queryString);
            }, this));
        },

        _deleteDocs: function () {
            var docIds = this.listView.getCheckedIds();
            if (!docIds.length) {
                $.goMessage(lang["선택된 항목이 없습니다."]);
                return;
            }

            $.goConfirm(commonLang["삭제하시겠습니까?"], "", $.proxy(function () {
                GO.util.preloader($.ajax({
                    type: "DELETE",
                    contentType: "application/json",
                    url: GO.contextRoot + "api/works/applets/" + this.appletId + "/docs",
                    data: JSON.stringify({ids: this.listView.getCheckedIds()}),
                    success: $.proxy(function () {
                        $.goMessage(commonLang["삭제되었습니다."]);
                        this.docs.fetch();
                        this.charts.triggerChangeDocs();
                    }, this),
                    error: function () {
                        $.goError(commonLang["관리 서버에 오류가 발생하였습니다"]);
                    }
                }));
            }, this));
        },

        _setDocIdsTable: function () {
            var idsTable = this.docs.map(function (doc) {
                return doc.id;
            });
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-docIdsTable', idsTable, {type: 'session'});
        },

        _isDeletable: function () {
            var isAdmin = this.baseConfigModel.isAdmin(GO.session('id'));
            var role = this.share.get('deleteDocRoles');
            var deletable = _.contains(role, 'ADMIN');
            return isAdmin && deletable;
        },

        _storeConditions: function (e, filter) {
            var data = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {};
            data.filter = filter;
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', data, {type: 'session'});
        },

        _storePage: function (page) {
            var data = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {};
            data.page = page;
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', data, {type: 'session'});
        },

        _storeSort: function (sortData) {
            var data = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {};
            data.property = sortData.property;
            data.direction = sortData.direction;
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', data, {type: 'session'});
        },
        _setSubFormId: function () {
            var storedSearchObject = this.useCachedCondition ?
                GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {} : {};
            if (!this.useCachedCondition) {
                storedSearchObject.subFormId = this.subFormId;
                GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', storedSearchObject, {type: 'session'});
            }
        },
        _onChangeForm: function (e) {
            var data = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {};

            var selectFormId = $(e.currentTarget).attr('data-id');
            if (selectFormId === 'tab_main') {
                delete data.subFormId;
            } else {
                data.subFormId = selectFormId;
                this.subFormId = selectFormId;
            }
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-searchObject', data, {type: 'session'});

            GO.router.navigate('works/applet/' + this.appletId + '/home', {
                trigger: true,
                pushState: false,
                replace: true
            });
        },
        /**
         * 사용자의 액션에 의한 마지막 목록 값이 목록 설정 보다 우선.
         * 최초 앱 진입시는 마지막 목록 값을 사용 하지 않는다.
         */
        _setPropertyAndDirection: function () {
            $.when(this._settingSynced, this._fieldSynced).done(_.bind(function () {
                var storedSearchObject = this.useCachedCondition ?
                    GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {} : {};

                var fieldCid = this.setting.getSortColumnFieldCid();
                this.docs.property = this.fields.getPropertyByFieldCid(fieldCid);
                this.docs.direction = this.setting.getSortDirection();

                if (this.useCachedCondition) {
                    if (storedSearchObject.property) this.docs.setAttributes({property: storedSearchObject.property});
                    if (storedSearchObject.direction) this.docs.setAttributes({direction: storedSearchObject.direction});
                }
            }, this));
        },

        toggleChart: function (e) {
            this.toggleEl(e, $("div.dashboard_box"));
        },

        toggleEl: function (e, el) {
            var target = $(e.currentTarget);
            if (target.hasClass('off')) {
                target.removeClass('off');
                target.find('.txt').text(worksLang["차트보기"]);
                el.hide();
                GO.util.store.set(GO.session('id') + '-' + this.appletId + '-is-chart-view-active', false, 'local');
            } else {
                target.addClass('off');
                target.find('.txt').text(worksLang["차트접기"]);
                el.show();
                $(window).trigger('resize');
                GO.util.store.set(GO.session('id') + '-' + this.appletId + '-is-chart-view-active', true, 'local');
            }
        },

        _onClickNavigateToListSetting: function () {
            var id = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-works-list-setting', null);
            var postFix = parseInt(id) ? '/' + id : '';
            GO.router.navigate('works/applet/' + this.appletId + '/settings/listview/personal' + postFix, true);
        },

        _onChangeSettingList: function (e) {
            this.settingId = $(e.currentTarget).val();
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-list-setting', this.settingId);
            this._renderSettingListView();
        },

        _renderSettingListView: function () {
            this._initSetting();
            this.listView._setPropertyAndDirection();
            this.listView._setColumns();
            this.listView._setSettingId(this.settingId);
            this._setChartsView();
            this.listView.render();
            this.docs._setPersonalViewId(this.settingId);
        },

        _initSetting: function () {
            var settingId = parseInt(this.settingId);
            var setting = settingId ? this.settings.get(settingId).get('view') : this.adminSetting;
            if (setting) {
                this.setting.set(_.extend(setting, {id: setting.id}));
            }
        },

        _setChartsView: function () {
            this.charts.reset(this.setting.get("charts"));
            this.charts.mergeFromFields(this.fields);

            this.$("div.card_item_wrapper").empty();

            if (!this.charts.length) {
                this.$("div[el-chart-wrapper]").hide();
                this.$("a.chart").hide();
            } else {
                this.$("div[el-chart-wrapper]").show();
                this.$("a.chart").show();
                this.$(".ic_chart").addClass('off');
                this.$("a.chart").find('.txt').text(worksLang["차트접기"]);
            }

            this.charts.each(function (chartSetting) {
                if (chartSetting.get("hasDeletedField")) return;

                var chartView = new ChartView({
                    model: chartSetting,
                    appletId: this.appletId,
                    chartFields: this.fields.getChartFields(),
                    numberFields: this.fields.getNumberFields()
                });
                this.$("div.card_item_wrapper").append(chartView.el);
                chartView.render();
                chartView.fetchChartDatas();
            }, this);

            this._chartViewDisplaySetting();
        },

        _onScrollMoveTab: function (e) {
            this.__onScrollMoveTab($(e.currentTarget));
        },

        __onScrollMoveTab: function (el) {
            var scrollLeft = el.scrollLeft();

            if (scrollLeft + el.innerWidth() + 80 >= el[0].scrollWidth) {
                $(".tab_arrow.right").hide();
            } else {
                $(".tab_arrow.right").show();
            }

            if (scrollLeft == 0) {
                $(".tab_arrow.left").hide();
            } else {
                $(".tab_arrow.left").show();
            }
        },

        _onClickMoveTab: function (e) {
            var next = $(e.currentTarget).hasClass('ic_arrow_next');
            if (next) {
                $(".tab_menu_wrap").animate({scrollLeft: '+=460'}, 200);
            } else {
                $(".tab_menu_wrap").animate({scrollLeft: '-=460'}, 200);
            }
        }
    });
});
