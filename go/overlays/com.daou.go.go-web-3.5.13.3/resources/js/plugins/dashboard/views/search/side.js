define([
        "jquery",
        "backbone",
        "app",
        "hgn!dashboard/templates/search/side",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!dashboard/nls/dashboard"
    ],

    function (
        $,
        Backbone,
        App,
        layoutTpl,
        commonLang,
        adminLang,
        dashboardLang
    ) {
        var tplVar = {
            home: adminLang["홈"],
            search: dashboardLang["통합검색"],
            all_period: dashboardLang["기간전체"],
            all: commonLang['전체'],
            aweek: dashboardLang['최근 1주일'],
            twoweeks: dashboardLang['최근 2주일'],
            amonth: dashboardLang['최근 1개월'],
            gnbTitle: commonLang['검색']
        };
        return Backbone.View.extend({
            el: '#side',
            initialize: function () {
                this.$el.off();
                this.param = GO.router.getSearch();
            },

            events: {
                "click ul.search_period_select li": "getSearchTerm",
                "click li.app a": "moveAppSearch"
            },

            render: function () {
                this.$el.html(layoutTpl({
                    lang: tplVar
                }));
                this.setAppSide();
                if (this.param.appName == undefined) {
                    $('#unifiedSearch').parent('li').addClass('on');
                } else {
                    $('#' + this.param.appName).parent('li').addClass('on');
                }
                this.compareSearchTerm();
            },
            getSearchTerm: function (e) {
                var term = $(e.currentTarget).attr("id");
                var currentDate = GO.util.shortDate(new Date());
                var fromDate = GO.util.toISO8601('1970/01/01');
                var toDate = GO.util.toISO8601(new Date());

                if (term == "aweek") {
                    fromDate = GO.util.calDate(currentDate, "weeks", -1);
                    this.param.searchTerm = "1w";
                } else if (term == "twoweeks") {
                    fromDate = GO.util.calDate(currentDate, "weeks", -2);
                    this.param.searchTerm = "2w";
                } else if (term == "amonth") {
                    fromDate = GO.util.calDate(currentDate, "months", -1);
                    this.param.searchTerm = "1m";
                } else {
                    this.param.searchTerm = "all";
                }

                this.param.fromDate = fromDate;
                this.param.toDate = toDate;
                this.param.stype = 'detail';
                if (this.param.appName == undefined) {
                    this.search();
                } else {
                    this.appSearch();
                }
            },
            search: function () {
                delete this.param.appName;
                this.param.offset = 5;
                App.router.navigate("unified/search?" + this.serializeObj(this.param), true);
            },
            appSearch: function () {
                this.param.offset = 10;
                App.router.navigate("unified/app/search?" + this.serializeObj(this.param), true);
            },
            serializeObj: function (obj) {
                var str = [];
                for (var p in obj) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
                return str.join("&");
            },
            moveAppSearch: function (e) {
                //앱 클릭 후 이동
                if ($(e.currentTarget).attr('id') == 'unifiedSearch') {
                    this.param.offset = 5;
                    this.param.page = 0;
                    delete this.param.appName;
                    App.router.navigate("unified/search?" + this.serializeObj(this.param), true);
                    return;
                }
                this.param.appName = $(e.currentTarget).attr('id');
                this.param.offset = 10;
                this.param.page = 0;
                App.router.navigate("unified/app/search?" + this.serializeObj(this.param), true);
            },
            setAppSide: function () {
                // 앱 순서대로 사이드에 그리기
                var availableMenus = [
                    {appName: "mail", appClass: "ic_type_mail"},
                    {appName: "webfolder", appClass: "ic_type_file"},
                    {appName: "contact", appClass: "ic_type_contact"},
                    {appName: "calendar", appClass: "ic_type_cal"},
                    {appName: "board", appClass: "ic_type_bbs"},
                    {appName: "community", appClass: "ic_type_comm"},
                    {appName: "approval", appClass: "ic_type_approval"},
                    {appName: "report", appClass: "ic_type_report"},
                    {appName: "task", appClass: "ic_type_task"},
                    {appName: "todo", appClass: "ic_type_todo"},
                    {appName: "works", appClass: "ic_type_works"},
                    {appName: "docs", appClass: "ic_type_docs"}
                ];
                _.each(GO.config("menuList"), function (menu) {
                    var temp = _.findWhere(availableMenus, {appName: menu.appName});
                    if (temp) {
                        this.$('nav.side_menu ul').append(
                            "<li class='app'>" +
                            "<a id='" + menu.appName + "'>" +
                            "<span class='ic_gnb " + temp.appClass + "'></span>" + menu.name +
                            "<span id='" + menu.appName + "TotalCnt'></span>" +
                            "</a>" +
                            "</li>"
                        );
                    }
                }, this);
            },
            compareSearchTerm: function () {
                var searchTerm = this.param.searchTerm;
                $('.search_period_select').removeClass('on');
                if (searchTerm == "1w") {
                    $('#aweek').addClass('on');
                } else if (searchTerm == "2w") {
                    $('#twoweeks').addClass('on');
                } else if (searchTerm == "1m") {
                    $('#amonth').addClass('on');
                } else if (searchTerm == "all") {
                    $('#all').addClass('on');
                }
            }
        });
    });
