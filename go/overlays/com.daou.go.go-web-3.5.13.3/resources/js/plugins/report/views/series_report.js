(function () {
    define([
            "backbone",
            "app",
            "hogan",

            "hgn!report/templates/series_report",
            "hgn!report/templates/series_exclude_popup",
            "hgn!report/templates/series_reporter_card",
            "hgn!report/templates/series_report_create",

            "hgn!report/templates/series_report_info",
            "hgn!report/templates/series_report_info_preview",
            "hgn!report/templates/series_report_comment",
            "hgn!report/templates/report_attaches_file",
            "hgn!report/templates/report_attaches_image",

            "report/views/report_title",
            "report/views/activity_logs",
            "i18n!report/nls/report",
            "i18n!nls/commons",

            "report/collections/series_reports",
            "report/models/series_report",
            "report/models/report",

            "file_upload",
            "comment",
            "attach_file",
            "content_viewer",

            'formutil',
            "GO.util",
            "jquery.go-sdk",
            "jquery.go-grid",
            "jquery.go-popup"
        ],

        function (
            Backbone,
            GO,
            Hogan,
            SeriesReportTmpl,
            SeriesExcludePopup,
            SeriesReportCardTmpl,
            SeriesReportCreateTmpl,
            SeriesReportInfoTmpl,
            SeriesReportInfoPreviewTmpl,
            SeriesReportCommentTmpl,
            ReportAttachesFileTmpl,
            ReportAttachesImageTmpl,
            ReportTitleView,
            ActivityLogsView,
            ReportLang,
            CommonLang,
            SeriesReports,
            ReportSeriesModel,
            ReportModel,
            FileUpload,
            CommentListView,
            AttachFileView,
            ContentViewer
        ) {
            var lang = {
                detailSearch: CommonLang["상세검색"],
                search: CommonLang["검색"],
                reportWrite: ReportLang["보고 작성"],
                reporterExclude: ReportLang["보고자 제외"],
                prev: CommonLang["아래"],
                next: CommonLang["위"],
                list: CommonLang["목록"],
                excludedReporters: ReportLang["제외된 보고자"],
                undoneReporters: ReportLang["미보고자"],
                undoneReport: ReportLang["미보고"],
                doneReporters: ReportLang["보고자"],
                doneReport: ReportLang["보고"],
                confirm: CommonLang["확인"],
                cancel: CommonLang["취소"],
                tempSave: CommonLang["임시저장"],
                callPrevSeries: ReportLang["이전 회차 불러오기"],
                close: CommonLang["닫기"],
                submitReport: ReportLang["등록"],
                edit: CommonLang["수정"],
                popupView: ReportLang["팝업보기"],
                remove: CommonLang["삭제"],
                print: CommonLang["인쇄"],
                reportContent: ReportLang["보고내용"],
                attachFile: CommonLang["첨부파일"],
                파일첨부: CommonLang["파일첨부"],
                undoneDesc: ReportLang["미보고 중입니다"],
                series_comment: ReportLang["회차 댓글"],
                activityLog: ReportLang["변경이력"],
                report_status: ReportLang["보고현황"],
                series: ReportLang["보고 회차"],
                more: CommonLang["더보기"],
                save: CommonLang["저장"],
                lang: ReportLang["변경이력이 없습니다."],
                report_comment: ReportLang["이 보고의 댓글"],
                all: CommonLang["전체"],
                errorMessage: CommonLang["500 오류페이지 타이틀"],
                not_selected_reporter: ReportLang["보고자를 선택해 주세요."],
                current_report: ReportLang["현재 보고만"],
                all_report: ReportLang["전체 보고"],
                preview_desc: ReportLang["이전 회차를 불러오는 중입니다. 잠시 후에 다시 시도해 주세요."],
                preview: CommonLang['미리보기'],
                download: CommonLang["다운로드"],
                '이 곳에 파일을 드래그 하세요': CommonLang['이 곳에 파일을 드래그 하세요'],
                '이 곳에 파일을 드래그 하세요 또는': CommonLang['이 곳에 파일을 드래그 하세요 또는'],
                '파일선택': CommonLang['파일선택'],
                '첨부파일 1개의 최대 용량은 NNN MB 이며 최대 N개 까지 등록 가능합니다':
                    GO.i18n(CommonLang["첨부파일 1개의 최대 용량은 {{size}} MB 이며 최대 {{number}} 개 까지 등록 가능합니다"],
                        {
                            "size": GO.config('commonAttachConfig').maxAttachSize,
                            "number": GO.config('commonAttachConfig').maxAttachNumber
                        })
            };

            var REPORT_EDITOR_CONTENT_MARGIN = "body {margin: 22px;}";

            var SeriesReportView = GO.BaseView.extend({
                el: "#content",

                events: {
                    "click #excludeReporter": "excludeReporterPopup",
                    "click #undoneList section.clickable": "renderCreateForm",
                    "click #doneList section.clickable": "showReport",
                    "click #closeCreateForm": "closeCreateForm",
                    "click #callPrevSeries": "callPrevSeries",
                    "click #btnSave": "saveReport",
                    "click #btnTempSave": "saveTempReport",
                    "click #reportInfos section.clickable": "toggleSelectReport",
                    "click #writeReport": "renderCreateForm",

                    "click div.series_controll ul.optional li.prev": "prev",
                    "click div.series_controll ul.optional li.next": "next",
                    "click div.series_controll ul.optional a.list": "list",

                    "click #reportControll #popup": "showPopupReport",
                    "click #reportControll li.edit": "editReport",
                    "click #reportControll li.delete": "removeReport",
                    "click #reportControll #print": "printReport",
                    "click #reportControll a.btn_layer_x": "closeReport",
                    "click span.ic_del": "deleteFile",
                    "click #series_tap li": "toggleTap",
                    "click #activity_more": "activityMore",

                    "click span[data-tag=option]": "toggleOption",
                    "click #popupOption li[data-range]": "showPopupReport",
                    "click #printOption li[data-range]": "printReport",

                    'dragover #dropZone': '_dragOver',
                    'dragleave #dropZone': '_dragLeave',
                    'drop #dropZone': '_drop',
                },

                initialize: function (options) {
                    this.options = options || {};
                    this.$el.off();
                    this.$el.addClass("go_renew");
                    this.$el.on("change:url", this.writePageMovePopup);
                    this.isEditorComplete = true;
                    this.report = ReportModel.init();
                    this.isSaaS = GO.session().brandName == "DO_SAAS";
                    this.totalAttachSize = 0;
                    this.totalAttachCount = 0;
                },

                render: function () {
                    this.reportSeriesModel = ReportSeriesModel.get(this.options.id);

                    var reportId = this.options.reportId,
                        sessionUser = GO.session(),
                        myReport = this.reportSeriesModel.findReporterByUserId(sessionUser.id);

                    $("#content").append(SeriesReportTmpl({
                            data: $.extend({}, this.reportSeriesModel.toJSON(), {
                                closedAt: this.reportSeriesModel.closedAtBasicDate2(),
                                series: GO.i18n(ReportLang["제 {{arg1}} 회차"], {arg1: this.reportSeriesModel.get("series")}),
                                hasExcludeReport: this.reportSeriesModel.hasExcludeReport(),
                                excludeReportsStr: this.reportSeriesModel.excludeReportsStr(),
                                myReport: myReport,
                                isReportWritable: myReport.status == "undones" && myReport.user.actions.writable,
                                isEmptyUndones: _.isEmpty(this.reportSeriesModel.get("undones")) ? true : false,
                                isEmptyDones: _.isEmpty(this.reportSeriesModel.get("dones")) ? true : false,
                            }),
                            lang: lang,
                            undonesCardTmpl: this.makeUndonesCardTmpl(),
                            donesCardTmpl: this.makeDonesCardTmpl()
                        }
                    ));

                    if (reportId) {
                        this._fetchReport(reportId);
                        if (!this.reportSeriesModel.isExistReport(reportId)) {
                            GO.router.navigate("report", {trigger: true});
                            return;
                        }

                        if (myReport.user.reportId == reportId && myReport.status == "undones") {
                            this._viewCreateForm(reportId, "#reportWrite");
                            $("#writeReportBtn").hide();
                            $("#writeReportBtn").closest('section').removeClass("clickable").css("cursor", "")
                        } else {
                            this._renderDetailReport(sessionUser.id, reportId);
                        }
                    }

                    ReportTitleView.create({
                        text: this.reportSeriesModel.get("folder").name,
                        meta_data: this.reportSeriesModel.get("department").name,
                        meta_section: " " + GO.util.basicDate2(this.reportSeriesModel.get("closedAt")) + " " + this.reportSeriesModel.getSeriesStr()
                    }).$el.addClass("report_top");

                    this.renderGrid();

                    $("#side").trigger("set:leftMenu", this.reportSeriesModel.get("folder").id);

                    CommentListView.render({
                        el: this.$el.find('#series_comments'),
                        typeUrl: 'report/series',
                        typeId: this.reportSeriesModel.get("id"),
                        isWritable: !this.reportSeriesModel.get("department").deletedDept
                    });

                    this.commentCountUpate();
                    this.allowAction = true;
                },

                _dragOver: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.originalEvent.dataTransfer.dropEffect = 'move';
                    $("#dropZone").addClass('drag_file');
                },

                _dragLeave: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $("#dropZone").removeClass('drag_file');
                },

                _drop: function (e) {
                    this._dragLeave(e);
                },

                _fetchReport: function (reportId) {
                    this.report.set("id", reportId);
                    this.report.fetch({"async": false});
                    this.report.setAttacheUrl();
                },

                writePageMovePopup: function (e, callback) {
                    if (this.reportSeriesModel.get("folder").formUse) {

                    }

                    if (!GO.util.hasActiveEditor()) {
                        callback();
                        return;
                    } else {
                        if (!GO.util.isEditorWriting()) {
                            callback();
                            return;
                        }
                    }

                    $.goPopup({
                        title: '',
                        message: lang.alert_check_editor,
                        modal: true,
                        buttons: [{
                            'btext': lang.confirm,
                            'btype': 'confirm',
                            'callback': callback
                        }, {
                            'btext': lang.cancel,
                            'btype': 'normal',
                            'callback': function () {
                            }
                        }]
                    });
                },

                commentCountUpate: function () {
                    var self = this;

                    this.$el.on("comment:change", function (e, type, count) {
                        var commentCountEl = "";

                        if (type == "report") {
                            var cardCountEl = self.$el.find("#doneList section.on span.num");
                            cardCountEl.text(count);
                            commentCountEl = self.$el.find("#reportDetail li.view_option span.num");
                        } else {  //series
                            commentCountEl = self.$el.find("section.article_reply li[data-type='series_comments'] span.num");
                        }

                        commentCountEl.html(count);
                    });
                },

                loadActivityLog: function () {
                    var activityCountEl = this.$el.find("section.article_reply li[data-type='activity_logs'] span.num");

                    if (this.activityLogsView) {
                        this.activityLogsView.reload();
                    } else {
                        this.activityLogsView = new ActivityLogsView({seriesId: this.reportSeriesModel.get("id")});
                        this.$el.find("#activity_logs_content").html(this.activityLogsView.render().$el);
                    }

                    if (this.activityLogsView.collections.page.lastPage) {
                        $("#activity_logs_more").hide();
                    } else {
                        $("#activity_logs_more").show();
                    }

                    $("#series_tap li[data-type='activity_logs'] span.num").text(parseInt(this.activityLogsView.collections.page.total));
                },

                activityMore: function () {
                    var activeLogsEl = this.$el.find("#activity_logs_content");
                    activeLogsEl.html("");
                    activeLogsEl.html(this.activityLogsView.more().$el);
                    if (this.activityLogsView.collections.page.lastPage) {
                        $("#activity_logs_more").hide();
                    } else {
                        $("#activity_logs_more").show();
                    }
                },

                deleteFile: function (e) {
                    $(e.currentTarget).parents("li").remove();
                    this.setViewedTotalAttachSize();
                },

                renderGrid: function () {
                    var self = this;

                    this.dataTable = $.goGrid({
                        el: "#report_list",
                        method: 'GET',
                        url: GO.contextRoot + 'api/report/series/' + this.options.id + "/tiny",
                        emptyMessage: "<p class='data_null'> " +
                            "<span class='ic_data_type ic_no_data'></span>" +
                            "<span class='txt'>" + ReportLang["회차 정보가 없습니다."] + "</span>" +
                            "</p>",
                        defaultSorting: [[1, "asc"]],
                        sDomUse: false,
                        checkbox: false,
                        pageUse: false,
                        checkboxData: 'id',
                        columns: [
                            {
                                mData: "createdAt",
                                bSortable: false,
                                sClass: "time",
                                sWidth: '220px',
                                fnRender: function (obj) {
                                    var data = obj.aData,
                                        returnData = [];

                                    if (data.id == self.options.id) {
                                        returnData.push("<span class='ic_classic ic_now'></span>");
                                    }

                                    returnData.push("<span class='date'>" + GO.util.basicDate2(data.closedAt) + " " + GO.i18n(ReportLang["제 {{arg1}}회차"], {arg1: data.series}));

                                    return returnData.join("");
                                }
                            },
                            {
                                mData: null,
                                bSortable: false,
                                sClass: "status",
                                sWidth: '750px',
                                fnRender: function (obj) {
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

                                    returnTemplate.push("<span data-id='" + tableData.id + "'>");
                                    returnTemplate.push('<span class="reporter" data-series-id="' + tableData.id + '" title="' + ReportLang["보고자"] + ': ' + doneReportersNames.join(", ") + ' / ' + ReportLang["미보고자"] + ': ' + undoneReportersNames.join(", ") + '">');
                                    returnTemplate.push(GO.i18n(ReportLang['보고자 {{arg1}}명'], {"arg1": doneReporters.length}));
                                    if (undoneReporters.length == 0) {
                                        returnTemplate.push("<span class='ok'>" + ReportLang["전원보고"] + "</span>");
                                    } else {
                                        returnTemplate.push("<span class='not'>(" + GO.i18n(ReportLang['미보고자 {{arg1}}명'], {"arg1": undoneReporters.length}) + " )</span>");
                                    }
                                    returnTemplate.push("</span>");

                                    if (tableData.commentCount > 0) {
                                        returnTemplate.push("<span class='ic_classic ic_reply'></span><span class='num'>[<strong>" + tableData.commentCount + "</strong>]</span>");
                                    }

                                    return returnTemplate.join("");
                                }
                            }
                        ],
                        fnDrawCallback: function (obj) {
                            self.$el.find('tr>td:nth-child(2) span.reporter').css('cursor', 'pointer').click(function (e) {
                                var $el = $(e.currentTarget);
                                url = "report/series/" + $el.attr("data-series-id");

                                $("#side").trigger("change:url", [function () {
                                    GO.router.navigate(url, {trigger: true});
                                }]);
                            });

                            self.dataTable.find("tr span[data-id='" + self.options.id + "']").parents("tr").addClass("active");
                        }
                    }).tables;


                },
                toggleTap: function (e) {
                    var targetEl = $(e.currentTarget),
                        targetDataType = targetEl.attr("data-type"),
                        oldDataType = $(e.currentTarget).find("li.on").attr("data-type");

                    if (targetDataType == oldDataType) {
                        return;
                    }

                    $.each(targetEl.siblings(), function () {
                        $(this).removeClass("on");
                    });

                    var activityEl = this.$el.find("#activity_logs"),
                        commentEl = this.$el.find("#series_comments")

                    if (targetDataType == "activity_logs") {
                        if (this.activityLogsView == undefined) {
                            this.activityLogsView = new ActivityLogsView({seriesId: this.reportSeriesModel.get("id")});
                            this.$el.find("#activity_logs_content").html(this.activityLogsView.render().$el);
                        }

                        if (this.activityLogsView.collections.page.lastPage) {
                            $("#activity_logs_more").hide();
                        } else {
                            $("#activity_logs_more").show();
                        }

                        commentEl.hide();
                        activityEl.show();
                    } else {
                        commentEl.show();
                        activityEl.hide();
                    }

                    targetEl.addClass("on")

                },

                prev: function (e) {
                    var targetEl = $(e.currentTarget),
                        seriesId = targetEl.attr("data-id"),
                        url = "report/series/" + seriesId;

                    if (seriesId == 0) {
                        $.goMessage(ReportLang["이전 회차가 없습니다."]);
                        return;
                    }

                    $("#side").trigger("change:url", [function () {
                        GO.router.navigate(url, {trigger: true});
                    }]);
                },
                next: function (e) {
                    var targetEl = $(e.currentTarget),
                        seriesId = targetEl.attr("data-id"),
                        url = "report/series/" + seriesId;

                    if (seriesId == 0) {
                        $.goMessage(ReportLang["다음 회차가 없습니다."]);
                        return;
                    }

                    $("#side").trigger("change:url", [function () {
                        GO.router.navigate(url, {trigger: true});
                    }]);
                },
                list: function () {
                    var url = "report/folder/" + this.reportSeriesModel.get("folder").id + "/reports";
                    var page = sessionStorage.getItem('report-list-page') || 0;
                    var offset = sessionStorage.getItem('report-list-offset') || 20;
                    url += ("?page=" + page + "&offset=" + offset);
                    
                    $("#side").trigger("change:url", [function () {
                        GO.router.navigate(url, {trigger: true});
                    }]);
                },

                toggleSelectReport: function (event) {
                    var targetEl = $(event.target).parents("section.card_item");

                    this._toggleSelectReport(targetEl);
                },
                _toggleSelectReport: function (targetEl) {
                    parentEl = targetEl.parents("div.dashboard_box");

                    $.each(parentEl.find("section.card_item"), function (index, el) {
                        $(el).removeClass("on");
                    });

                    targetEl.addClass("on");
                },

                _getPopupUrl: function (isAll, target) {
                    this.$("#popupOption").hide();
                    var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + "app/report/series/";
                    if (isAll) {
                        url += this.reportSeriesModel.id + "/report/popup";
                    } else {
                        var reportId = target.parents("ul[data-id]").attr("data-id");
                        url += "report/" + reportId + "/popup";
                    }

                    return url;
                },

                showPopupReport: function (e) {
                    var target = $(e.currentTarget);
                    var isAll = target.attr("data-range") == "all";
                    var url = this._getPopupUrl(isAll, target);

                    this._openPopup(url);
                },

                _openPopup: function (url) {
                    return window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
                },

                printReport: function (e) {
                    this.$("#printOption").hide();
                    var target = $(e.currentTarget);
                    var isAll = target.attr("data-range") == "all";
                    var url = this._getPopupUrl(isAll, target);
                    this._openPopup(url + "/print");
                },

                editReport: function (e) {
                    var reportId = $(e.currentTarget).parents("ul").attr("data-id");
                    $("#reportDetail").hide().html("");
                    this._fetchReport(reportId);
                    this._viewCreateForm(reportId, "#reportUpdate");
                },

                removeReport: function (e) {
                    var self = this,
                        targetEl = $(e.currentTarget);

                    $.goConfirm(
                        ReportLang["보고서 삭제"],
                        ReportLang["해당 보고서를 삭제 하시겠습니까?"],
                        function () {
                            var reportId = targetEl.parents("ul").attr("data-id");
                            reportModel = new ReportModel(),

                                reportModel.set({id: reportId, status: "UNDONE"});

                            reportModel.save(null, {
                                success: function () {
                                    self.refreshReporters.call(self);
                                    self.dataTable.reload();

                                    $("#reportDetail").hide().html("");
                                    $("#reportUpdate").hide().html("");

                                    self.showWriteButton(self);

                                    self.loadActivityLog();
                                    self._fetchReport(reportId);
                                    self._viewCreateForm(reportId, "#reportWrite");
                                    $("#writeReportBtn").hide();
                                    $("#writeReportBtn").closest('section').removeClass("clickable").css("cursor", "");
                                }
                            });
                        });
                },
                hideWriteButton: function () {
                    $.each(this.$el.find("div.series_controll a.write"), function () {
                        $(this).hide();
                    });
                },
                showWriteButton: function () {
                    $.each(this.$el.find("div.series_controll a.write"), function () {
                        $(this).show();
                    });
                },
                closeReport: function () {
                    $("#reportDetail").slideUp().html("");
                },
                _initSmartEditor: function (targetId, content) {
                    var lang = GO.session('locale');
                    $("#" + targetId).goWebEditor({
                        contextRoot: GO.config("contextRoot"),
                        lang: lang,
                        editorValue: content || "",
                        onLoad: function () {
                            GO.Editor.getInstance(targetId).setContent(content || "");
                            $("#" + targetId).trigger("edit:complete");
                        }
                    });
                },
                _setContent: function (content) {
                    var editorContent = content || "";

                    if (this.reportSeriesModel.get("folder").formFlag) {
                        var representativeDeptName = this.reportSeriesModel.get("department").name;

                        $.go(GO.contextRoot + "api/user/representative/dept", "", {
                            qryType: 'GET',
                            async: true,
                            contentType: 'application/json',
                            responseFn: function (response) {
                                var depts = response.data;
                                var dept = response.data;
                                if (dept) {
                                    representativeDeptName = dept.name;
                                }
                                var opts = {
                                    data: editorContent,
                                    contextRoot: GO.contextRoot,
                                    userId: GO.session().id,
                                    userProfileApi: 'api/user/profile',
                                    deptName: representativeDeptName
                                };
                                $("#editor").setTemplate(opts);
                                this.isEditorComplete = false;
                            },
                            error: function (error) {
                                var opts = {
                                    data: editorContent,
                                    contextRoot: GO.contextRoot,
                                    userId: GO.session().id,
                                    userProfileApi: 'api/user/profile',
                                    deptName: representativeDeptName
                                };
                                $("#editor").setTemplate(opts);
                                this.isEditorComplete = false;
                            }
                        });
                    } else {
                        setTimeout(function () {
                            GO.Editor.getInstance("editor").setContent(GO.util.convertMSWordTag(editorContent));
                        }, 1000);
                    }
                },

                getReportDetails: function (options) {
                    if (options.isAll) {
                        if (!this.seriesReports) {
                            this.seriesReports = new SeriesReports({seriesId: options.seriesId});
                            this.seriesReports.fetch({async: false});
                        }
                        var template = $("<div></div>");
                        _.each(this.seriesReports.models, function (report) {
                            template.append(this.makeReportTemplate(_.extend(options, {report: report})));
                        }, this);
                        return template;
                    } else {
                        this.makeReportTemplate(options);
                    }
                },

                getReportDetail: function (options) {
                    return this.makeReportTemplate(options);
                },

                _parseContent: function (reportModel) {
                    var content = GO.util.convertMSWordTag(reportModel.get("content")); //ms word 태그를 공백으로 치환
                    if (reportModel.get("contentType") == 'TEXT') {
                        content = GO.util.convertRichText(content);
                    }
                    // 체크박스,라디오 버튼있을때 선택안한 항목은 비활성화 시키기 위해 추가함.
                    content = $.goFormUtil.convertViewMode(content);
                    return content;
                },

                makeReportTemplate: function (options) {
                    var reportModel = options.report || this.report;
                    if (!reportModel.id) {
                        reportModel.set("id", options.reportId);
                        reportModel.fetch({async: false});
                    }

                    var content = this._parseContent(reportModel);
                    var actions = reportModel.get("actions");
                    var reportId = reportModel.id || options.reportId;
                    var isPrintMode = (options.isPrintMode == undefined) ? false : options.isPrintMode;
                    var isActiveFolder = reportModel.get("folder").status == "ACTIVE" ? true : false;
                    var detailTmpl = SeriesReportInfoTmpl({
                        data: $.extend({}, reportModel.toJSON(), {
                            actions: actions,
                            submittedAtBasicDate: reportModel.submittedAtBasicDate(),
                            attachesCount: reportModel.attachesCount(),
                            attachesSize: GO.util.getHumanizedFileSize(reportModel.attachesSize()),
                            isActiveFolder: isActiveFolder,
                            isPrintMode: isPrintMode,
                            commentCount: reportModel.get('commentCount'),
                            content: content
                        }),
                        lang: lang
                    });

                    var detailTmplEl = $(detailTmpl);

                    if (!options.isPrintMode) {
                        var contentEl = detailTmplEl.find("div[id*='reportContentView']");

                        // 기존 go_style.css 의 width style 의 영향을 받아 만들어진 양식을을 위해 추가. 궁극적으로 제거 대상.
                        var style = "table {width: 100%;}";
                        style = style + REPORT_EDITOR_CONTENT_MARGIN;

                        ContentViewer.init({
                            $el: contentEl,
                            content: content,
                            style: style
                        });
                    }

                    // TODO 리팩토링
                    // 보고서 전체를 보는경우 댓글이나 첨부파일이 없으면 해당 영역을 보여주지 않음.
                    if (options.isAll && !reportModel.get("attaches").length) {
                        detailTmplEl.find("div.bar").hide();
                        detailTmplEl.find("div.add_file").hide();
                    } else {
                        AttachFileView.create(detailTmplEl.find('#report-attach-placeholder'), reportModel.get("attaches"), function (item) {
                            return GO.config('contextRoot') + 'api/report/' + reportModel.get("id") + '/download/' + item.id;
                        });
                    }

                    var commentView = CommentListView.init({
                        el: detailTmplEl.find('#reportReply'),
                        typeUrl: 'report',
                        typeId: reportId,
                        isPrintMode: isPrintMode,
                        isWritable: !reportModel.get("department").deletedDept
                    });
                    commentView.render().fetchComments();

                    // TODO 리팩토링
                    // 보고서 전체를 보는경우 댓글이나 첨부파일이 없으면 해당 영역을 보여주지 않음.
                    if (options.isAll && !commentView.collection.length) detailTmplEl.find("section.article_reply").hide();

                    return detailTmplEl;
                },

                _renderDetailReport: function (userId, reportId, model) {
                    var reportDetailEl = this.$el.find("#reportDetail");
                    var reportUpdateEl = this.$el.find("#reportUpdate");
                    var data = {reportId: reportId, isPrintMode: false};
                    if (model) data["report"] = model;
                    var detailTmpl = this.getReportDetail(data);

                    reportDetailEl.html("");
                    reportDetailEl.append(detailTmpl);

                    reportUpdateEl.hide().html("");
                    reportDetailEl.slideDown();

                    this.$el.find("#doneList section[data-reportid='" + reportId + "']").addClass("on");
                },

                showReport: function (event) {

                    var targetEl = $(event.currentTarget);
                    var userId = targetEl.attr("data-id");
                    var reportId = targetEl.attr("data-reportId");

                    this._fetchReport(reportId);
                    this._renderDetailReport(userId, reportId);
                },

                saveReport: function (e) {
                    var self = this;
                    GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
                    if (!self.reportSeriesModel.get("folder").formFlag && !GO.Editor.getInstance("editor").validate()) {
                        $.goError(CommonLang['마임 사이즈 초과']);
                        return false;
                    }

                    var reportModel = new ReportModel(),
                        oldStatus = $(e.currentTarget).parents("div.reportInputForm").find("#reportStatus").val();

                    reportModel.set(self.getReportData());
                    reportModel.set({status: "DONE", contentType: "HTML"});
                    reportModel.save(null, {
                        success: function (model, response, options) {
                            $.each(self.$el.find("div.series_controll a.write"), function () {
                                $(this).hide();
                            });
                            $("#reportWrite").hide().empty();
                            $("#reportUpdate").hide().empty();
                            self._renderDetailReport(model.get("reporter").id, model.get("id"), model);
                            self.refreshReporters.call(self);
                            self.dataTable.reload();
                            self.loadActivityLog();
                            self.$el.find("#doneList section[data-reportid='" + model.get("id") + "']").addClass("on");
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        }, error: function (model, response, options) {
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            $.goError(CommonLang["저장에 실패 하였습니다."]);
                        }
                    });
                },

                refreshReporters: function () {
                    var donesEl = this.$el.find("#doneList"),
                        undonesEl = this.$el.find("#undoneList");

                    this.reportSeriesModel = ReportSeriesModel.get(this.options.id);

                    var undones = this.reportSeriesModel.get("undones"),
                        dones = this.reportSeriesModel.get("dones");

                    if (_.isEmpty(undones)) {
                        this.$el.find("#undoneList").closest("div #undone").hide();
                    } else {
                        this.$el.find("#undoneList").closest("div #undone").show();
                        undonesEl.html(this.makeUndonesCardTmpl());
                    }
                    if (_.isEmpty(dones)) {
                        this.$el.find("#doneList").closest("div #done").hide();
                    } else {
                        this.$el.find("#doneList").closest("div #done").show();
                        donesEl.html(this.makeDonesCardTmpl());
                    }
                    $("#writeReportBtn").hide();
                    $("#writeReportBtn").closest('section').removeClass("clickable").addClass("on").css("cursor", "");
                },
                makeUndonesCardTmpl: function () {
                    var undonesEl = [],
                        self = this;

                    $.each(this.reportSeriesModel.get("undones"), function () {
                        var undoneEl = SeriesReportCardTmpl({
                            data: this,
                            lang: lang
                        });
                        undonesEl.push(undoneEl);
                    });

                    return undonesEl.join("");
                },

                makeDonesCardTmpl: function () {
                    var donesEl = [],
                        self = this;

                    $.each(this.reportSeriesModel.get("dones"), function () {
                        var doneEl = SeriesReportCardTmpl({
                            data: this,
                            lang: lang
                        });

                        donesEl.push(doneEl);

                    });

                    return donesEl.join("");
                },

                getReportData: function () {
                    var reportData = {},
                        attaches = [];

                    $.each($("#fileComplete li:not(.attachError)"), function (index, el) {
                        var targetEl = $(el),
                            attach = {
                                id: targetEl.attr("data-id"),
                                name: targetEl.attr("data-name"),
                                hostId: targetEl.attr("host-id"),
                                size: targetEl.attr("data-size"),
                            };

                        if ($.trim(targetEl.attr("data-path")) != "") {
                            attach["path"] = targetEl.attr("data-path");
                        }

                        attaches.push(attach);
                    });

                    if (this.reportSeriesModel.get("folder").formFlag) {
                        /* GO-25468
                         * 보고서를 수정하거나 이전회차불러오기 후 작성하면
                         * <div id="editor" style="width:100%;"> 가 등록 횟수만큼 감싸게됨.
                         * 기존 보고 데이터를 불러올때 필요없는 <div> 태그 제거하는 로직 추가함.
                         */
                        reportData.content = this.removeEditorWrap($("#editorForm").getFormData());
                        //reportData.content = $("#editorForm").getFormData();
                    } else {
                        reportData.content = GO.Editor.getInstance("editor").getContent();
                    }

                    reportData.attaches = attaches;
                    reportData.id = this.$el.find("#reportId").val();
                    return reportData;
                },

                removeEditorWrap: function (str) {
                    //필요없는 <div>태그 제거
                    var newStr = $(str);
                    for (var i = 0; i < $(str).find("div#editor").length; i++) {
                        if ($(str).wrap().attr("id") == "editor") {
                            newStr = $(newStr.html());
                        }
                    }
                    return $("<div>").append(newStr).html();
                },

                saveTempReport: function () {
                    var self = this;

                    if (!this.reportSeriesModel.get("folder").formFlag && !GO.Editor.getInstance("editor").validate()) {
                        $.goError(CommonLang['마임 사이즈 초과']);
                        return false;
                    }

                    var reportModel = new ReportModel();
                    reportModel.set(this.getReportData());
                    reportModel.set({status: "TEMP"});
                    reportModel.save(null, {
                        success: function (model) {
                            $.goMessage(ReportLang["임시저장 되었습니다."]);

                            self.refreshReporters.call(self);

                            $("#reportWrite").slideUp().html("");
                            $("#reportDetail").slideUp().html("");
                            $("#reportUpdate").slideUp().html("");

                            self.showWriteButton(self);
                            self.loadActivityLog();

                            $("#writeReportBtn").show();
                            $("#writeReportBtn").closest('section').addClass("clickable").addClass("on").css("cursor", "");
                        }
                    });

                    self.setViewedTotalAttachSize();
                },

                closeCreateForm: function () {
                    $("#reportWrite").slideUp().html("");
                    $("#reportUpdate").slideUp().html("");
                    $("#writeReportBtn").show();
                    $("#writeReportBtn").closest('section').addClass("clickable").css("cursor", "pointer");
                },

                _buildCreateForm: function (targetEl, content) {
                    var self = this;
                    var useButtonWindow = GO.util.useButtonWindow();//DOCUSTOM-5963 IE9 에서 button mode를 바꿔야함
                    var options = {
                        el: "#swfupload-control",
                        // el : targetEl + " span.fileUpload",
                        context_root: GO.contextRoot,
                        useButtonWindow: useButtonWindow,
                        button_title: lang["파일선택"],
                        button_text: "<span class='txt'>" + lang["파일선택"] + "</span>",
                        url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                        textTmpl: [
                            "<span class='btn_file''>",
                            "{text}",
                            "<input type='file' name='file' title='{title}' multiple='' accept={accept} />",
                            "</span>"
                        ].join(""),
                        dropZone: "#dropZone",
                        progressEl: "div.progress"
                    }

                    if (useButtonWindow) {
                        options['button_height'] = 26;
                    }

                    var maxAttachSize = parseInt(GO.config('commonAttachConfig').maxAttachSize);
                    var maxAttachByteSize = maxAttachSize * 1024 * 1024;
                    var maxAttachNumber = parseInt(GO.config('commonAttachConfig').maxAttachNumber);

                    (new FileUpload(options))
                        .queue(function (e, data) {

                        })
                        .start(function (e, data) {
                            if (!GO.config('attachFileUpload')) {
                                $.goAlert(CommonLang['파일첨부용량초과']);
                                self.$("#dropZone").removeClass('drag_file');
                                return false;
                            }

                            if (self.isSaaS) {
                                if (maxAttachByteSize < data.size) {
                                    $.goMessage(GO.i18n(CommonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                                    self.$("#dropZone").removeClass('drag_file');
                                    return false;
                                } else {
                                    self.totalAttachSize += data.size;
                                }

                                var currentTotalAttachCount = $('#fileWrap').children().size() + $("#imgWrap").children().size() + self.totalAttachCount + 1;
                                if (maxAttachNumber < currentTotalAttachCount) {
                                    $.goMessage(GO.i18n(CommonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                                    self.$("#dropZone").removeClass('drag_file');
                                    return false;
                                } else {
                                    self.totalAttachCount++;
                                }
                            }
                        })
                        .progress(function (e, data) {

                        })
                        .success(function (e, serverData, fileItemEl) {
                            if (GO.util.fileUploadErrorCheck(serverData)) {
                                fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(serverData) + "</strong>");
                                fileItemEl.addClass("attachError");
                            } else {
                                if (GO.util.isFileSizeZero(serverData)) {
                                    $.goAlert(GO.util.serverMessage(serverData));
                                    return false;
                                }
                            }

                            var size = serverData.data.fileSize;
                            var humanSize = GO.util.getHumanizedFileSize(size);
                            var extension = serverData.data.fileExt;
                            var fileName = serverData.data.fileName;

                            fileItemEl.attr("data-size", size);

                            if (GO.util.isImage(extension)) {
                                fileItemEl.find(".item_image").append("<span class='name'>" + fileName + "</span>" + "<span class='size'>(" + humanSize + ")</span>");
                                self.$("#imgWrap").append(fileItemEl);
                            } else {
                                self.$("#fileWrap").append(fileItemEl);
                            }

                            self.setViewedTotalAttachSize();
                            self.resetAttachSizeAndCount();
                        })
                        .complete(function (e, data) {

                        })
                        .error(function (e, data) {
                            if (data.jqXHR) {
                                if (data.jqXHR.statusText == "abort") {
                                    $.goAlert(CommonLang['취소되었습니다.']);
                                } else {
                                    $.goAlert(CommonLang['업로드에 실패하였습니다.']);
                                }
                                self.resetAttachSizeAndCount();
                            }
                        });

                    if (!this.reportSeriesModel.get("folder").formFlag) {
                        this._initSmartEditor("editor", content);
                    } else {
                        var representativeDeptName = this.reportSeriesModel.get("department").name;

                        $.go(GO.contextRoot + "api/user/representative/dept", "", {
                            qryType: 'GET',
                            async: true,
                            contentType: 'application/json',
                            responseFn: function (response) {
                                var dept = response.data;
                                if (dept) {
                                    representativeDeptName = dept.name;
                                }
                                var opts = {
                                    data: content || "",
                                    contextRoot: GO.contextRoot,
                                    userId: GO.session().id,
                                    userProfileApi: 'api/user/profile',
                                    deptName: representativeDeptName
                                };
                                $("#editor").setTemplate(opts);
                                this.isEditorComplete = false;
                            },
                            error: function (error) {
                                var opts = {
                                    data: content || "",
                                    contextRoot: GO.contextRoot,
                                    userId: GO.session().id,
                                    userProfileApi: 'api/user/profile',
                                    deptName: representativeDeptName
                                };
                                $("#editor").setTemplate(opts);
                                this.isEditorComplete = false;
                            }
                        });
                    }
                },

                _viewCreateForm: function (reportId, targetEl) {
                    // this.report -> _fetchReport, makeReportTemplate
                    var reportModel = this.report;
                    var createForm = $(targetEl);
                    var self = this;

                    this.$el.find("#undoneList section[data-reportid='" + reportId + "']").addClass("on");

                    if ($.trim(createForm.html()) == "") {
                        var data = reportModel.toJSON();
                        createForm.html(SeriesReportCreateTmpl({
                            data: data,
                            lang: lang,
                            isSaaS: this.isSaaS
                        }));

                        var content = "";
                        var attaches = [];

                        if (reportModel.get("tempExist") && reportModel.get("status") != "INVALID") {
                            content = reportModel.get("formContent");
                        } else {
                            if (reportModel.get("status") == "INVALID") {
                                $.goAlert("", ReportLang["양식이 변경되어 임시저장값을 불러올 수 없습니다."]);
                                content = reportModel.get("formContent");
                            } else {
                                content = reportModel.get("content");
                                attaches = data.attaches;
                            }

                            if (reportModel.get("contentType") == 'TEXT') {
                                content = GO.util.convertRichText(content);
                            } else {
                                content = GO.util.convertMSWordTag(content); //ms word 태그를 공백으로 치환
                            }
                        }

                        this._buildCreateForm(targetEl, content);
                        this._setAttaches(attaches);
                        this.setViewedTotalAttachSize();
                    } else if (createForm.css("display") == "block") {
                        createForm.slideUp().html("");
                        return;
                    }

                    $("#editor").on("edit:complete", function () {
                        $("#editor").off("edit:complete");

                        self.isEditorComplete = true;

                        if (reportModel.get("tempExist") && reportModel.get("status") != "INVALID") {
                            $.goConfirm(
                                ReportLang["임시저장 불러오기"],
                                ReportLang["작성중인 보고서가 있습니다. 불러오시겠습니까?"],
                                function () {
                                    self._setContent(reportModel.get("content"));
                                    self._setAttaches(data.attaches);
                                    self.setViewedTotalAttachSize();
                                }
                            );
                        }
                    });
                    createForm.slideDown();
                },

                _setAttaches: function (attaches) {
                    var files = [];
                    var images = [];
                    if (attaches) {
                        $.each(attaches, function () {
                            this.icon = GO.util.getFileIconStyle({extention: this.extention});
                            this.humanSize = GO.util.getHumanizedFileSize(this.size);

                            if (GO.util.isImage(this.extention)) {
                                images.push(this);
                            } else {
                                files.push(this);
                            }
                        });
                    }

                    if (images.length > 0) {
                        this.$el.find("#imgWrap").html(ReportAttachesImageTmpl({images: images}));
                    }
                    if (files.length > 0) {
                        this.$el.find("#fileWrap").html(ReportAttachesFileTmpl({files: files}));
                    }
                },

                renderCreateForm: function (e) {
                    var $el = $(e.currentTarget),
                        reportId = $el.attr("data-reportid");

                    this._fetchReport(reportId);
                    this._viewCreateForm(reportId, "#reportWrite");
                    $("#writeReportBtn").hide();
                    $("#writeReportBtn").closest('section').removeClass("clickable").css("cursor", "");
                },

                callPrevSeries: function (e) {
                    var reportId = $("#reportId").val(),
                        self = this,
                        url = GO.contextRoot + "api/report/" + reportId + "/prev";

                    if (!this.isEditorComplete) {
                        $.goAlert(lang.preview_desc);
                        return;
                    }

                    $.go(url, "", {
                        qryType: 'GET',
                        contentType: 'application/json',
                        responseFn: function (response) {
                            GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
                            self._setContent(response.data.content);
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        },
                        error: function (error) {
                            var data = JSON.parse(error.responseText)
                            $.goAlert(data.message);
                        }
                    });
                },

                popupBindEvents: function () {
                    this.popupEl.on("click.series", "#exculdeCheckList input:checkbox", $.proxy(this.exculdeCheck, this));
                },

                exculdeCheck: function (event) {
                    var val = $(event.target).val(),
                        isChecked = $(event.target).is(":checked");

                    if (val === "all") {
                        if (isChecked) {
                            $.each($("#exculdeCheckList input:checkbox"), function () {
                                $(this).attr("checked", "checked");
                            });
                        } else {
                            $.each($("#exculdeCheckList input:checkbox"), function () {
                                $(this).removeAttr("checked");
                            });
                        }
                    } else if (!isChecked) {
                        $("#excludeAll").removeAttr("checked");
                    }
                },

                excludeReporterPopup: function () {
                    var self = this;
                    this.popupEl = $.goPopup({
                        header: lang.reporterExclude,
                        width: 300,
                        title: "",
                        pclass: "layer_select_member layer_normal ui-draggable",
                        modal: true,
                        contents: SeriesExcludePopup({
                            lang: lang,
                            data: self.reportSeriesModel.get("undones"),
                            exclusion: self.reportSeriesModel.get("exclusion")
                        }),
                        buttons: [{
                            'btext': lang.confirm,
                            'btype': 'normal',
                            'callback': function () {
                                var excludeReportIds = [],
                                    undoneReportIds = [],
                                    excludeUserIds = [],
                                    undoneUserIds = [],
                                    checkedEl = $("#gpopupLayer input:checkbox:checked:not([value='all'])"),
                                    uncheckedEl = $("#gpopupLayer input:checkbox:not(:checked):not([value='all'])"),
                                    url = GO.contextRoot + "api/report/series/reporter/status";

                                $.each(checkedEl, function (index, el) {
                                    excludeReportIds.push($(el).val());
                                    excludeUserIds.push($(el).attr("data-id"));
                                });

                                $.each(uncheckedEl, function (i, el) {
                                    undoneReportIds.push($(el).val());
                                    undoneUserIds.push($(el).attr("data-id"));
                                });

                                $.ajax({
                                    url: url,
                                    data: JSON.stringify({excludeIds: excludeReportIds, undoneIds: undoneReportIds}),
                                    type: 'PUT',
                                    dataType: 'json',
                                    contentType: 'application/json'
                                })
                                    .done(function (response) {
                                        $.each(excludeUserIds, function (idx, userId) {
                                            self.reportSeriesModel.changeStatus(userId, "exclusion");
                                            if (userId == GO.session().id) {
                                                self.hideWriteButton(self);
                                            }
                                        });

                                        $.each(undoneUserIds, function (idx, userId) {
                                            self.reportSeriesModel.changeStatus(userId, "undones");
                                            if (userId == GO.session().id) {
                                                self.showWriteButton(self);
                                            }
                                        });

                                        var excludeReportsTextEl = self.$el.find("#excludeReporters"),
                                            excludeReportsEl = excludeReportsTextEl.parents("div:first");

                                        excludeReportsTextEl.text(self.reportSeriesModel.excludeReportsStr());
                                        excludeReportsEl.show();

                                        self.refreshReporters.call(self);
                                        self.loadActivityLog();
                                        self.closeCreateForm();
                                    })
                                    .fail(function (error) {
                                        $.goAlert(lang.errorMessage);
                                    });
                            }
                        }, {
                            'btext': lang.cancel,
                            'btype': 'cancle'
                        }]
                    });

                    this.popupBindEvents();
                },

                makeReporterLayout: function () {
                    return Hogan.compile(SeriesReportCardTmpl.text);
                },

                makeReportInfo: function () {
                    return Hogan.compile(SeriesReportInfoTmpl.text);
                },

                toggleOption: function (e) {
                    var optionArea = $(e.currentTarget).siblings("div");
                    var isShow = optionArea.is(":visible");
                    this.$("div[data-range]").not(optionArea).hide();
                    optionArea.toggle(!isShow);
                },

                getViewedTotalAttachSize: function () {
                    var viewedTotalAttachSize = 0;
                    $("#fileWrap, #imgWrap").find('li').each(function () {
                        viewedTotalAttachSize += parseInt(this.getAttribute('data-size'), 0);
                    });
                    return viewedTotalAttachSize;
                },

                setViewedTotalAttachSize: function () {
                    if (this.isSaaS) {
                        var current = this.getViewedTotalAttachSize();
                        this.$el.find("#total_size").html(GO.util.displayHumanizedAttachSizeStatus(current));
                    }
                },

                resetAttachSizeAndCount: function () {
                    if (this.isSaaS) {
                        this.totalAttachSize = 0;
                        this.totalAttachCount = 0;
                    }
                }
            }, {});

            return SeriesReportView;
        });
})();
