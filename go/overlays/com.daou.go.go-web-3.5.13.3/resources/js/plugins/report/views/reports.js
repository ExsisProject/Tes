(function () {
    define([
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!report/nls/report",
            "report/models/report_folder",
            "report/models/series_report",
            "hgn!report/templates/reports",
            "report/views/report_title",
            "calendar/libs/recurrence_parser",
            "jquery.go-grid",
            "GO.util"
        ],

        function (
            Backbone,
            GO,
            CommonLang,
            ReportLang,
            ReportFolderModel,
            SeriesReportModel,
            ReportsTmpl,
            ReportTitleView,
            RecurrenceParser
        ) {
            var lang = {
                series: ReportLang["보고 회차"],
                seriesStatus: ReportLang["보고현황"],
                write: ReportLang["보고 작성"],
                submmitedAt: ReportLang["보고일"],
                name: ReportLang["보고서 제목"],
                reporter: ReportLang["보고자"],
                urltoclip_ie: ReportLang['보고서주소복사IE'],
                urltoclip_etc: ReportLang['보고서주소복사ETC'],
                series_empty_msg: ReportLang["회차 정보가 없습니다."],
                report_empty_msg: ReportLang["등록된 보고서가 없습니다."],
                report_address: ReportLang["보고서 주소"],
                close: CommonLang["닫기"],
                copy: CommonLang["복사"],
                recurrence: ReportLang["보고주기"],
                refferer: ReportLang["참조자"],
                admin: ReportLang["운영자"]
            };

            var SeriesReportListView = GO.BaseView.extend({
                el: "#content",
                events: {
                    "click #folderInfo": "folderInfoToggle",
                    "click #controlButtons a.createReport": "write",
                    'click header.content_top ins.ic_star': 'favorite',
                    'click span.series_wrap': '_clickSeriesReport',
                    'click tr>td.write span.writeBtn': '_clickWriteButton',
                    'click .occasional_popup': '_clickOcassionalPopup',
                    'click .occasional_detail': '_clickOcassionalReport'
                },
                initialize: function (options) {
                    this.options = options || {};
                    var self = this;

                    this.$el.off();
                    this.folderModel = ReportFolderModel.get(this.options.id);

                    $("#side_favorite").on("changeFavorite", function (e, models) {
                        var isFavoriteFolder = false;
                        $.each(models, function (index, model) {
                            if (model.get("id") == self.folderModel.get("id")) {
                                isFavoriteFolder = true;
                                return;
                            }
                        });

                        if (!isFavoriteFolder) {
                            self.$el.find("header.content_top ins").addClass("ic_star_off");
                        }
                    })
                },
                render: function () {
                    this.searchParams = this._getSearchParams();
                    var self = this,
                        tableHeader = {},
                        recurrenceCode = self.folderModel.get("recurrence"),
                        recruHelper = new RecurrenceParser();

                    if (this.folderModel.isPeriodic()) {
                        tableHeader = {
                            column1: lang.series,
                            column2: lang.seriesStatus,
                            column3: lang.write
                        };
                    } else {
                        tableHeader = {
                            column1: lang.submmitedAt,
                            column2: lang.name,
                            column3: lang.reporter
                        };
                    }

                    this.$el.html(
                        ReportsTmpl({
                            data: $.extend({}, this.folderModel.toJSON(),
                                {
                                    urlLink: (window.location.href).split("?")[0],
                                    reporterNames: this.folderModel.reporterNames(),
                                    referrerNames: this.folderModel.referrerNames(),
                                    adminNames: this.folderModel.adminNames(),
                                    isPeriodic: function () {
                                        return self.folderModel.isPeriodic();
                                    },
                                    recurrence: recurrenceCode ? recruHelper.parse(recurrenceCode).humanize() : "",
                                    description: function () {
                                        return GO.util.textToHtml(self.folderModel.get("description"));
                                    },
                                    isDescriptionExist: function () {
                                        return $.trim(self.folderModel.get("description")) != "" ? true : false
                                    }
                                }
                            ),
                            lang: lang,
                            tableHeader: tableHeader
                        })
                    );

                    var countStr = "";

                    if (this.folderModel.isPeriodic()) {
                        this._renderPeriodic.call(this);
                        countStr = GO.i18n(ReportLang["총 {{arg1}} 회차"], {arg1: this.folderModel.get("totalSeries")});
                    } else {  //OCCASIONAL
                        this._renderOccasional.call(this);
                        GO.i18n(ReportLang["총 {{arg1}} 건"], {arg1: this.folderModel.get("totalSeries")});
                    }

                    ReportTitleView.create({
                        text: this.folderModel.get("name"),
                        meta_data: this.folderModel.get("department").name,
                        meta_section: countStr,
                        favorite: {
                            isOn: this.folderModel.get("favorite"),
                            text: CommonLang["즐겨찾기 추가하기"]
                        }
                    });

                    $("#side").trigger("set:leftMenu", this.folderModel.get("id"));

                    var infoArea = $("#folderDetailInfo");
                    infoArea.toggle(!this.getFolderStatus());
                },
                favorite: function (e) {
                    var currentEl = $(e.currentTarget),
                        isAdd = currentEl.hasClass("ic_star_off"),
                        url = GO.contextRoot + "api/report/folder/" + this.folderModel.get("id") + "/favorite",
                        method = "";

                    if (isAdd) {
                        method = "POST";
                    } else {
                        method = "DELETE";
                    }

                    $.go(url, "", {
                        contentType: 'application/json',
                        qryType: method,
                        async: false,
                        responseFn: function (rs) {
                            if (isAdd) {
                                currentEl.removeClass("ic_star_off");
                            } else {
                                currentEl.addClass("ic_star_off");
                            }

                            $("#side_favorite").trigger("refresh");
                        }
                    });

                },
                write: function (e) {
                    var url = "report/folder/" + this.folderModel.get("id") + "/write";

                    GO.router.navigate(url, {trigger: true});
                },
                _renderPeriodic: function () {
                    var self = this,
                        seriesReportList = $.goGrid({
                            el: '#serise_report_list',
                            method: 'GET',
                            url: GO.contextRoot + "api/report/folder/" + this.options.id + "/series",
                            params: this.searchParams,
                            emptyMessage: "<p class='data_null'> " +
                                "<span class='ic_data_type ic_no_data'></span>" +
                                "<span class='txt'>" + lang.series_empty_msg + "</span>" +
                                "</p>",
                            defaultSorting: [[0, "desc"]],
                            columns: [
                                {
                                    mData: null, sClass: "times", bSortable: false, fnRender: function (obj) {
                                        var data = obj.aData,
                                            seriesStr = GO.util.parseOrdinaryNumber(data.series, GO.config("locale")),
                                            returnTmp = [];

                                        var seriesReportModel = new SeriesReportModel(),
                                            sessionUserId = GO.session().id;
                                        seriesReportModel.set(obj.aData);
                                        reporter = seriesReportModel.findReporterByUserId(sessionUserId);
                                        if (reporter.status == "undones" && reporter.user.actions.writable) {
                                            returnTmp.push('<span class="series_wrap" data-report-id="' + reporter.user.reportId + '"data-series-id="' + data.id + '">');
                                        } else {
                                            returnTmp.push('<span class="series_wrap" data-series-id="' + data.id + '">');
                                        }
                                        returnTmp.push(GO.util.basicDate2(obj.aData.closedAt) + " " + GO.i18n(ReportLang["제 {{arg1}}회차"], {arg1: seriesStr}));
                                        returnTmp.push('</span>');

                                        return returnTmp.join("\n");
                                    }
                                },
                                {
                                    mData: null, sClass: "status", bSortable: false, fnRender: function (obj) {
                                        var tableData = obj.aData,
                                            doneReporters = tableData.dones,
                                            undoneReporters = tableData.undones,
                                            doneReportersNames = [],
                                            undoneReportersNames = [],
                                            returnTemplate = [];

                                        $.each(doneReporters, function (index, data) {
                                            doneReportersNames.push(data.name + " " + data.position);
                                        });

                                        $.each(undoneReporters, function (index, data) {
                                            undoneReportersNames.push(data.name + " " + data.position);
                                        });

                                        var seriesReportModel = new SeriesReportModel(),
                                            sessionUserId = GO.session().id;
                                        seriesReportModel.set(obj.aData);
                                        reporter = seriesReportModel.findReporterByUserId(sessionUserId);

                                        if (reporter.status == "undones" && reporter.user.actions.writable) {
                                            returnTemplate.push('<span class="series_wrap" data-report-id="' + reporter.user.reportId + '"data-series-id="' + tableData.id + '" title="' + ReportLang["보고자"] + ': ' + doneReportersNames.join(", ") + ' / ' + ReportLang["미보고자"] + ': ' + undoneReportersNames.join(", ") + '">');
                                        } else {
                                            returnTemplate.push('<span class="series_wrap" data-series-id="' + tableData.id + '" title="' + ReportLang["보고자"] + ': ' + doneReportersNames.join(", ") + ' / ' + ReportLang["미보고자"] + ': ' + undoneReportersNames.join(", ") + '">');
                                        }
                                        returnTemplate.push(GO.i18n(ReportLang['보고자 {{arg1}}명'], {"arg1": doneReporters.length}));

                                        if (undoneReporters.length == 0) {
                                            returnTemplate.push('<span class="ok">(' + ReportLang['전원보고'] + ')</span>');
                                        } else {
                                            returnTemplate.push('<span class="not">(' + GO.i18n(ReportLang['미보고자 {{arg1}}명'], {"arg1": undoneReporters.length}) + ')</span>');
                                        }

                                        returnTemplate.push("</span>");

                                        if (tableData.commentCount > 0) {
                                            returnTemplate.push("<span class='ic_classic ic_reply'></span><span class='num'>[<strong>" + tableData.commentCount + "</strong>]</span>");
                                        }
                                        if (tableData.isNew) {
                                            returnTemplate.push('<span class="ic_classic ic_new2"></span>');
                                        }
                                        return returnTemplate.join("\n");
                                    }
                                },
                                {
                                    mData: null, sClass: "write", bSortable: false, fnRender: function (obj) {
                                        var seriesReportModel = new SeriesReportModel(),
                                            sessionUserId = GO.session().id;
                                        seriesReportModel.set(obj.aData);
                                        reporter = seriesReportModel.findReporterByUserId(sessionUserId);

                                        if (reporter.status == "undones" && reporter.user.actions.writable) {
                                            return '<span data-form-flag="' + seriesReportModel.get("folder").formFlag + '" data-report-id="' + reporter.user.reportId + '" data-series-id="' + seriesReportModel.get("id") + '"class="btn_fn7 writeBtn" data-role="button"><span class="txt">' + ReportLang["보고 작성"] + '</span></span>';
                                        } else {
                                            return "-";
                                        }
                                    }
                                }
                            ],
                            fnDrawCallback: function (obj, oSettings, listParams) {
                                self.$el.find('span.series_wrap').css('cursor', 'pointer')
                                self.$el.find('tr>td:nth-child(3) span.writeBtn').css('cursor', 'pointer')
                                $(window).scrollTop(0);
                                self._addSearchParam({'page': listParams.page, 'offset': listParams.offset});
                            }
                        });

                    this.reportsTable = seriesReportList.tables;
                },

                _clickSeriesReport: function (e) {
                    var $el = $(e.currentTarget),
                        seriesId = $el.attr("data-series-id"),
                        url = "report/series/" + seriesId;

                    if ($el.attr("data-report-id")) {
                        url = "report/series/" + seriesId + "/report/" + $el.attr("data-report-id");
                    }
                    GO.router.navigate(url, {trigger: true});
                },

                _clickWriteButton: function (e) {
                    var $el = $(e.currentTarget);
                    seriesId = $el.attr("data-series-id"),
                        reportId = $el.attr("data-report-id"),
                        url = "report/series/" + seriesId + "/report/" + reportId;

                    GO.router.navigate(url, {trigger: true});
                },

                _renderOccasional: function () {
                    var self = this,
                        occasionalReportList = $.goGrid({
                            el: '#serise_report_list',
                            method: 'GET',
                            url: GO.contextRoot + "api/report/folder/" + this.options.id + "/reports",
                            params: this.searchParams,
                            emptyMessage: "<p class='data_null'> " +
                                "<span class='ic_data_type ic_no_data'></span>" +
                                "<span class='txt'>" + lang.report_empty_msg + "</span>" +
                                "</p>",
                            defaultSorting: [[0, "desc"]],
                            columns: [
                                {
                                    mData: "submittedAt",
                                    sWidth: '140px',
                                    sClass: "date",
                                    bSortable: true,
                                    fnRender: function (obj) {
                                        return GO.util.basicDate3(obj.aData.submittedAt);
                                    }
                                },
                                {
                                    mData: "name",
                                    sWidth: '1280px',
                                    sClass: "subject",
                                    bSortable: true,
                                    fnRender: function (obj) {
                                        var report = obj.aData,
                                            readable = report.readable,
                                            nameTag = [],
                                            privateTag = "<span class='ic_side ic_private'></span>";
                                        nameTag.push("<span data-id='" + report.id + "'>");
                                        if (report.actions.readable) {
                                            nameTag.push("<a class='detail occasional_detail'>");
                                            nameTag.push("<span class='txt'>" + report.name + "</span>");
                                            if (report.commentCount > 0) {
                                                nameTag.push("<span class='ic_classic ic_reply'></span><span class='num'>[<strong>" + report.commentCount + "</strong>]</span>");
                                            }
                                            nameTag.push("</a>");
                                            nameTag.push("<a class='popup occasional_popup'>")
                                            nameTag.push("<span class='ic_gnb ic_popup' title='" + ReportLang["팝업보기"] + "'></span>");
                                            nameTag.push("</a>");
                                        } else {
                                            nameTag.push(privateTag);
                                            nameTag.push("<span class='txt'>" + report.name + "</span>");
                                            if (report.commentCount > 0) {
                                                nameTag.push("<span class='num'>[<strong>" + report.commentCount + "</strong>]</span>");
                                            }
                                            nameTag.push("<span class='ic_gnb ic_popup' title='" + ReportLang["팝업보기"] + "'></span>");
                                        }
                                        if (report.isNew)
                                            nameTag.push('<span class="ic_classic ic_new2"></span>');

                                        nameTag.push("</span>");

                                        return nameTag.join("");
                                    }
                                },
                                {
                                    mData: "reporter",
                                    sWidth: "240px",
                                    sClass: "reporter",
                                    bSortable: true,
                                    fnRender: function (obj) {
                                        var reporter = obj.aData.reporter;
                                        return reporter.name + " " + reporter.position;
                                    }
                                }
                            ],
                            fnDrawCallback: function (obj, oSettings, listParams) {
                                self.$el.find('div.tool_bar div.custom_header').append(self.$el.find('#controlButtons').show());
                                self.$el.find('.occasional_detail').css('cursor', 'pointer');
                                self.$el.find('.occasional_popup').css('cursor', 'pointer');

                                $(window).scrollTop(0);
                                self._addSearchParam({'page': listParams.page, 'offset': listParams.offset});
                            }
                        });

                    this.reportsTable = occasionalReportList.tables;

                    this.reportsTable.addClass("type_normal tb_lately_report_anytime")
                },
                _clickOcassionalPopup: function (e) {
                    var $el = $(e.currentTarget),
                        reportId = $el.parents("span").attr("data-id"),
                        url = window.location.protocol + "//" + window.location.host + GO.contextRoot + "app/report/" + reportId + "/popup";

                    window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
                },
                _clickOcassionalReport: function (e) {
                    var $el = $(e.currentTarget),
                        reportId = $el.parents("span").attr("data-id"),
                        url = "report/folder/" + this.folderModel.get("id") + "/report/" + reportId;

                    GO.router.navigate(url, {trigger: true});
                },
                folderInfoToggle: function (e) {
                    var $el = $(e.currentTarget),
                        template = "",
                        infoArea = $("#folderDetailInfo"),
                        isHide = infoArea.is(":visible"),
                        folderStatusKey = "reportInfo_" + GO.session('id') + "_" + this.id;

                    if ($el.find("span.ic_classic").hasClass("ic_close")) {
                        template = '<span class="ic_classic ic_open" title="' + CommonLang["열기"] + '"></span>';
                    } else {
                        template = '<span class="ic_classic ic_close" title="' + CommonLang["닫기"] + '"></span>';
                    }

                    infoArea.toggle(!isHide);
                    GO.util.store.set(folderStatusKey, isHide, {type: "local"});
                    $el.html(template);
                },

                getFolderStatus: function () {
                    var folderStatusKey = "reportInfo_" + GO.session('id') + "_" + this.id;
                    return GO.util.store.get(folderStatusKey) || false;
                },

                searchParamKeys: ['page', 'offset'],

                _addSearchParam: function (newParams) {
                    var getUrl = GO.router.getUrl();
                    var searchParams = this._getSearchParams();
                    var newParams = newParams || {};
                    sessionStorage.setItem('report-list-page', newParams['page']);
                    sessionStorage.setItem('report-list-offset', newParams['offset']);

                    $.each(this.searchParamKeys, function (k, v) {
                        if (newParams.hasOwnProperty(v)) searchParams[v] = newParams[v];
                    });
                    GO.router.navigate(getUrl.split('?')[0] + '?' + $.param(searchParams), {replace: true});
                },

                _getSearchParams: function () {
                    var search = GO.router.getSearch();
                    var returnParams = search || {};
                    returnParams['page'] = search['page'] || 0;
                    returnParams['offset'] = search['offset'] || 20;
                    return returnParams;
                },
            });

            return SeriesReportListView;
        });
})();
