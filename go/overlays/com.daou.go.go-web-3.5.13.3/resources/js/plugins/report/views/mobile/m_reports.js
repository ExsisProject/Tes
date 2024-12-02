;(function () {
    define([
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "app",
            "hogan",
            "i18n!report/nls/report",
            "i18n!nls/commons",
            "views/mobile/header_toolbar",
            "hgn!report/templates/mobile/m_home_undone_item",
            "hgn!report/templates/mobile/m_home_recent_item",
            "report/models/report_folder",
            "report/collections/series",
            "report/collections/reports",
            "GO.util",
            "GO.m.util"

        ],
        function (
            MoreView,
            $,
            Backbone,
            GO,
            Hogan,
            ReportLang,
            CommonLang,
            HeaderToolbarView,
            SeriesItemTmpl,
            ReportItemTmpl,
            ReportFolderModel,
            SeriesCollection,
            ReportCollection
        ) {
            var lang = {
                series_null: ReportLang["등록된 보고서가 없습니다."],
                reports_null: ReportLang["등록된 보고서가 없습니다."],
                write: ReportLang["보고 작성"]
            };

            var ReportsView = MoreView.extend({
                el: '#content',
                events: {
                    "vclick li a[data-type]": "goDetail",
                    "vclick li.undone a.btn_report_write": "goSeriesWrite"
                },

                initialize: function (options) {
                    GO.util.appLoading(true);
                    this.options = options || {};
                    this.folderModel = ReportFolderModel.get(this.options.folderId);
                    this.$el.off();
                    GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                    var renderListFunc = {
                        listFunc: $.proxy(function (collection) {
                            if (this.folderModel.isPeriodic()) {
                                this.renderSeries(collection);
                            } else {
                                this.renderReports(collection);
                            }
                        }, this),
                        emptyListFunc: $.proxy(function () {
                            var nullTpl = ['<li class="creat data_null"><span class="subject"><span class="txt_ellipsis"></span>' + lang.reports_null + '</li>'];
                            this.$el.find('ul.list_normal').append(nullTpl);
                        }, this)
                    };
                    this.setRenderListFunc(renderListFunc);
                    var dataSet = {direction: "desc"};
                    if (this.folderModel.isPeriodic()) {
                        this.setFetchInfo(dataSet, new SeriesCollection([], {folderId: this.folderModel.get("id")}));
                    } else {
                        this.setFetchInfo(dataSet, new ReportCollection([], {folderId: this.folderModel.get("id")}));
                    }
                },
                render: function () {
                    var self = this;
                    this.$el.html('<div class="content"><ul class="list_normal list_report" data-type="list"></ul></div>');

                    var options = {
                        title: this.folderModel.get("name"),
                        isList: true,
                        isSideMenu: true,
                        isHome: true,
                        isSearch: true
                    };
                    if (this.folderModel.isOccasional() && this.folderModel.isActive() && this.folderModel.get("actions").writable) {
                        options.isWriteBtn = true;
                        options.writeBtnCallback = function () {
                            var url = "report/folder/" + self.folderModel.get("id") + "/write";
                            GO.router.navigate(url, {trigger: true});
                        }
                    }

                    HeaderToolbarView.render(options);
                    this.dataFetch()
                        .done($.proxy(function (collection) {
                            if (collection.length === 0) {
                                this.renderListFunc.emptyListFunc();
                            } else {
                                this.renderListFunc.listFunc(collection);
                                this.scrollToEl();
                            }
                        }, this));
                    GO.util.appLoading(false);
                },
                renderReports: function (collection) {
                    var self = this;
                    var reportListHtml = [];
                    collection.each(function (model, index) {
                        var reportHtml = ReportItemTmpl({
                            data: $.extend({}, model.toJSON(), {
                                title: function () {
                                    return this.name;
                                },
                                isCommentCountZero: model.get("commentCount") == 0,
                                createdAtBasicDate: GO.util.basicDate(model.get("submittedAt")),
                                isReadable: model.get("actions").readable
                            }),
                            lang: lang
                        });
                        reportListHtml.push(reportHtml);
                    });
                    self.$el.find('ul.list_normal').append(reportListHtml.join(""));
                },

                renderSeries: function (collection) {
                    var self = this;
                    var seriesListHtml = [];
                    collection.each(function (model, index) {
                        var sessionUser = GO.session(),
                            myReportId = model.findReporterByUserId(sessionUser.id).user.reportId,
                            seriesHtml = SeriesItemTmpl({
                                data: $.extend({}, model.toJSON(), {
                                    closedAtBasicDate: GO.util.customDate(model.get("closedAt"), "YYYY-MM-DD(ddd)"),
                                    seriesText: model.getSeriesStr(),
                                    donesText: GO.i18n(ReportLang['보고자 {{arg1}}명'], {"arg1": model.get("dones").length}),
                                    undonesText: GO.i18n(ReportLang['미보고자 {{arg1}}명'], {"arg1": model.get("undones").length}),
                                    isCommentCountZero: model.get("commentCount") == 0 ? true : false,
                                    reportId: myReportId
                                })
                            });

                        seriesListHtml.push(seriesHtml);
                    });
                    self.$el.find('ul.list_normal').append(seriesListHtml.join(""));
                },

                goDetail: function (e) {
                    this.setSessionInfo(e);
                    var targetEl = $(e.currentTarget),
                        url = "";
                    if (this.folderModel.isPeriodic()) {
                        url = "report/series/" + targetEl.attr('data-series-id');
                    } else {
                        url = "report/folder/" + this.folderModel.get("id") + "/report/" + targetEl.attr('data-report-id');
                    }
                    url += '/?page=' + this.collection.page.page;
                    GO.router.navigate(url, true);
                    return false;
                },

                goSeriesWrite: function (e) {
                    var targetEl = $(e.currentTarget),
                        parentEl = targetEl.parents("li.undone").find("a[data-report-id]"),
                        reportId = parentEl.attr("data-report-id"),
                        seriesId = parentEl.attr("data-series-id"),
                        url = "report/series/" + seriesId + "/report/" + reportId + "/form";
                    GO.router.navigate(url, {trigger: true});
                }
            }, {
                __instance__: null,
                create: function (packageName) {
                    this.__instance__ = new this.prototype.constructor({'packageName': packageName});
                    return this.__instance__;
                }
            });

            return ReportsView;
        });
}).call(this);