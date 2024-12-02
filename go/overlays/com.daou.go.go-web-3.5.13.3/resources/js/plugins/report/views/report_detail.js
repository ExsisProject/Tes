
(function() {
    
    define([
        "jquery",
        "underscore", 
        "backbone", 
        "app", 
        "hogan",
        
        "report/models/report",
        "hgn!report/templates/report_detail",
        "hgn!report/templates/report_detail_content",
        "hgn!report/templates/report_info_preview",
        "attach_file", 
        "report/views/report_title",
        "comment",
        "content_viewer",

        "i18n!nls/commons",
        "i18n!report/nls/report",
        
        "GO.util",
        "jquery.go-popup",
        "jquery.go-grid",
        'formutil'
    ],
    
    function(
        $, 
        _, 
        Backbone, 
        GO, 
        Hogan,
        
        ReportModel,
        ReportDetailTmpl,
        ReportDetailContentTmpl,
        ReportDetailPreviewTmpl,
        
        AttachFilesView,
        ReportTitleView,
        CommentListView,
        ContentViewer,

        CommonLang,
        ReportLang
    ) {

        var REPORT_EDITOR_CONTENT_MARGIN = "body {margin: 22px;}";

        var lang = {
            empty_msg: ReportLang["생성된 보고서가 없습니다."],
            print_preview: ReportLang["인쇄 미리보기"],
            empty_prev_report: ReportLang["이전 보고서가 없습니다."],
            empty_next_report: ReportLang["다음 보고서가 없습니다."],
            remove_desc: ReportLang["해당 보고서를 삭제 하시겠습니까?"],
            created_at: ReportLang["보고일"],
            report_title: ReportLang["보고 제목"],
            reporter: ReportLang["보고자"],
            print: CommonLang["인쇄"],
            remove: CommonLang["삭제"],
            edit: CommonLang["수정"],
            prev: CommonLang["아래"],
            next: CommonLang["위"],
            copy: CommonLang["URL 복사"],
            list: CommonLang["목록"],
            comment: CommonLang["댓글"],
            viewPopup: ReportLang["팝업보기"]
        };
        
        var ReportDetailView = Backbone.View.extend({
            el : "#content",

            events: {
                "click section.tool_bar a.remove": "remove",
                "click section.tool_bar a.update": "update",
                "click ul.controlButton li.list": "list",
                "click ul.controlButton li.print": "print",
                "click ul.controlButton li.next": "next",
                "click ul.controlButton li.prev": "prev",
                "click ul.controlButton li.viewPopup": "viewPopup",
            },

            initialize: function (options) {
                this.options = options || {};
                var reportId = this.options.id;
                this.$el.off();
                this.model = ReportModel.get(reportId);
                this.unreadableIds = [];
            },

            render: function () {
                var report_detail_content = this.getDetailContent();

                this.$el.html(ReportDetailTmpl({
                    data: $.extend({}, this.model.toJSON(), {}),
                    lang: lang
                }));

                this.$el.find("#report_detail_content").replaceWith(report_detail_content);

                // 기존 go_style.css 의 width style 의 영향을 받아 만들어진 양식을을 위해 추가. 궁극적으로 제거 대상.
                var style = "table {width: 100%;}";
                style = style + REPORT_EDITOR_CONTENT_MARGIN;

                if (!this.options.isPrintMode) {
                    var contentEl = this.$el.find("#reportContent");
                    ContentViewer.init({
                        $el: contentEl,
                        content: this._getReportContent(),
                        style: style
                    });
                }

                ReportTitleView.create({
                    text: this.model.get("folder").name,
                    meta_data: this.model.get("department").name
                });

                $("#side").trigger("set:leftMenu", this.options.folderId);

                if (!this.model.get("folder").actions.writable) {
                    this.$el.find("div.reply_wrap li.creat").html("");
                }

                this.renderGrid();
                this.commentCountUpdate();
            },

            viewPopup: function () {
                var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + "app/report/" + this.options.id + "/popup";
                window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
            },

            commentCountUpdate: function () {
                var self = this;

                this.$el.on("comment:change", function (e, type, count) {

                    var titleCountEl = self.$el.find("header.article_header span.reply_count"),
                        commentCountEl = self.$el.find("section.article_reply span.num");

                    titleCountEl.text(count);
                    commentCountEl.html(count);
                });
            },

            renderGrid: function () {
                var self = this;

                this.dataTable = $.goGrid({
                    el: "#report_list",
                    method: 'GET',
                    url: GO.contextRoot + 'api/report/' + this.options.id + "/tiny",
                    emptyMessage: "<p class='data_null'> " +
                        "<span class='ic_data_type ic_no_data'></span>" +
                        "<span class='txt'>" + lang.empty_msg + "</span>" +
                        "</p>",
                    defaultSorting: [[1, "asc"]],
                    sDomUse: false,
                    checkbox: false,
                    pageUse: false,
                    checkboxData: 'id',
                    columns: [{
                        mData: null, bSortable: false, sClass: "date", sWidth: '140px', fnRender: function (obj) {
                            var data = obj.aData,
                                returnData = [];

                            if (data.id == self.options.id) {
                                returnData.push("<span class='ic_classic ic_now'></span>");
                            }
                            returnData.push("<span class='date'>" + GO.util.customDate(data.submittedAt, "YYYY-MM-DD") + "</span>");
                            return returnData.join("");
                        }
                    }, {
                        mData: null,
                        bSortable: false,
                        sClass: "subject",
                        sWidth: '600px',
                        fnRender: function (obj) {
                            var data = obj.aData,
                                title = [],
                                privateTag = "<span class='ic_side ic_private'></span>";
                            if(!data.name){
                                var series = obj.aData.series.series;
                                var closedAt = GO.util.basicDate2(obj.aData.series.closedAt);
                                data.name = closedAt + " " + GO.i18n(ReportLang['제 {{arg1}}회차'], {"arg1": series});
                            }
                            if (!data.actions.readable) {
                                self.unreadableIds.push(data.id);
                                title.push(privateTag);
                            }
                            title.push("<span class='subject' data-readable='" + data.actions.readable + "' data-folder-id='" + self.options.folderId + "' data-report-id='" + data.id + "'>" + data.name + "</span>");

                            if (data.commentCount > 0) {
                                title.push("<span class='ic_classic ic_reply'></span><span class='num'>[<strong>" + data.commentCount + "</strong>]</span>");
                            }

                            return title.join("");
                        }
                    }, {
                        mData: null,
                        bSortable: false,
                        sClass: "reporter",
                        sWidth: '240px',
                        fnRender: function (obj) {
                            var data = obj.aData;
                            return data.reporter.name + " " + data.reporter.position;
                        }
                    }],

                    fnDrawCallback: function (obj) {
                        _.each(self.$el.find('tr>td:nth-child(2) span.subject'), function (subjectEl) {
                            if ($(subjectEl).attr("data-readable") == "true") {
                                $(subjectEl).css('cursor', 'pointer').click(function (e) {
                                    var $el = $(e.currentTarget);
                                    url = "report/folder/" + $el.attr("data-folder-id") + "/report/" + $el.attr("data-report-id");

                                    GO.router.navigate(url, {trigger: true});
                                });
                            }
                        });

                        self.dataTable.find("tr span[data-report-id='" + self.options.id + "']").parents("tr").addClass("active");
                    }
                }).tables;
            },

            getDetailContent: function (options) {
                var self = this;
                var isPrintMode = (options == undefined || options.isPrintMode == undefined) ? false : options.isPrintMode;
                var name = this.model.get("name");
                if(!name){
                    var series = this.model.get("series").series;
                    var closedAt = GO.util.basicDate2(this.model.get("series").closedAt);
                    name = closedAt  + " " + GO.i18n(ReportLang['제 {{arg1}}회차'], {"arg1": series});
                }

                var content = ReportDetailContentTmpl({
                    data : $.extend({},this.model.toJSON(),{
                        submittedAtBasicDate : GO.util.basicDate(this.model.get("submittedAt")),
                        content : self._getReportContent(),
                        name : name
                    }),
                    lang: lang
                });

                var contentEl = $(content);

                CommentListView.render({
                    el: contentEl.find('#reportReply'),
                    typeUrl: 'report',
                    typeId: this.model.get('id'),
                    isPrintMode: isPrintMode,
                    isWritable: !this.model.get("department").deletedDept
                });

                contentEl.off();

                AttachFilesView.create('#report-attach-placeholder', this.model.get("attaches"), function (item) {
                    return GO.config('contextRoot') + 'api/report/' + self.options.id + '/download/' + item.id;
                });

                return contentEl;
            },

            _getReportContent: function () {
                var content = GO.util.convertMSWordTag(GO.util.escapeXssFromHtml(this.model.get("content"))); //ms word 태그를 공백으로 치환
                if (this.model.get("contentType") == 'TEXT') {
                    content = GO.util.convertRichText(content);
                }
                // 체크박스,라디오 버튼있을때 선택안한 항목은 비활성화 시키기 위해 추가함.
                content = $.goFormUtil.convertViewMode(content);
                return content;
            },

            list: function () {
                var url = "report/folder/" + this.options.folderId + "/reports";
                    var page = sessionStorage.getItem('report-list-page') || 0;
                    var offset = sessionStorage.getItem('report-list-offset') || 20;
                    url += ("?page=" + page + "&offset=" + offset);
                GO.router.navigate(url, {trigger: true});
            },

            print: function () {
                var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + "app/report/" + this.options.id + "/print";
                window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');

            },

            makeReportInfo: function () {
                return Hogan.compile(ReportDetailContentTmpl.text);
            },

            prev: function (e) {
                var targetEl = $(e.currentTarget),
                    prevReportId = targetEl.attr("data-id"),
                    url = "";

                if (prevReportId == 0) {
                    $.goMessage(lang.empty_prev_report);
                    return;
                }
                if (this.unreadableIds.includes(parseInt(prevReportId))) {
                    $.goMessage(GO.i18n(CommonLang["{{target}}에 대한 접근 권한이 없어 확인할 수 없습니다."], {"target": ReportLang["보고서"]}));
                    return;
                }

                url = "report/folder/" + this.options.folderId + "/report/" + prevReportId;

                GO.router.navigate(url, {trigger: true});
            },

            next: function (e) {
                var targetEl = $(e.currentTarget),
                    prevReportId = targetEl.attr("data-id"),
                    url = "";

                if (prevReportId == 0) {
                    $.goMessage(lang.empty_next_report);
                    return;
                }
                if (this.unreadableIds.includes(parseInt(prevReportId))) {
                    $.goMessage(GO.i18n(CommonLang["{{target}}에 대한 접근 권한이 없어 확인할 수 없습니다."], {"target": ReportLang["보고서"]}));
                    return;
                }

                url = "report/folder/" + this.options.folderId + "/report/" + prevReportId;

                GO.router.navigate(url, {trigger: true});
            },

            remove: function () {
                var self = this;

                $.goConfirm('', lang.remove_desc, function () {
                    self.model.destroy({
                        success: function () {
                            var url = "report/folder/" + self.options.folderId + "/reports";
                            GO.router.navigate(url, {trigger: true});
                        }
                    })
                });
            },

            update: function () {
                var url = "report/folder/" + this.options.folderId + "/update/" + this.options.id;
                GO.router.navigate(url, {trigger: true});
            },
            
            release: function() {
                this.childView.release();
                this.$el.off();
                this.$el.empty();
                this.remove();
            } 
        }, {
            __instance__: null,

            create: function () {
                if (this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                return this.__instance__;
            }
        });

        function privateFunc(view, param1, param2) {

        }
        
        return ReportDetailView;
        
    });
    
})();