;(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hogan",
            "i18n!report/nls/report",
            "i18n!nls/commons",
            "views/mobile/header_toolbar",
            "hgn!report/templates/mobile/m_report_detail",
            "report/models/report",
            "report/models/report_folder",
            "attach_file",
            "views/mobile/m_font_resize",
            "iscroll",
            "GO.util",
            "GO.m.util",
            "formutil"
        ],
        function (
            $,
            Backbone,
            GO,
            Hogan,
            ReportLang,
            CommonLang,
            HeaderToolbarView,
            ReportDetailTmpl,
            ReportModel,
            ReportFolderModel,
            AttachFilesView,
            FontResize
        ) {

            var lang = {
                list: CommonLang["목록"],
                commentCount: ReportLang["이 보고의 댓글"],
                modify: CommonLang["수정"],
                remove: CommonLang["삭제"],
                removeDesc: ReportLang["해당 보고서를 삭제 하시겠습니까?"],
                modifyAlert: ReportLang["PC 에서 작성한 보고서는 모바일에서 수정할 수 없습니다."]
            };

            var ReportDetailView = Backbone.View.extend({
                el: '#content',

                events: {
                    "vclick div.tool_bar a.list": "list",
                    "vclick #copyUrl": "copyUrl"
                    //"vclick div.tool_bar a.comment" : "comment",
                    //"vclick div.tool_bar a.modify" : "modify",
                    //"vclick div.tool_bar a.remove" : "remove",
                },

                initialize: function (options) {
                    this.options = options || {};
                    var reportId = this.options.reportId;
                    this.model = ReportModel.get(reportId);
                    this.folder = (new ReportFolderModel()).set(this.model.get("folder"));
                    this.headerBindEvent();
                    this.$el.off();
                },
                headerBindEvent: function () {
                    GO.EventEmitter.off("trigger-action");
                    GO.EventEmitter.on('trigger-action', 'report-comment', this.comment, this);
                    GO.EventEmitter.on('trigger-action', 'report-modify', this.modify, this);
                    GO.EventEmitter.on('trigger-action', 'report-delete', this.remove, this);
                },
                render: function () {
                    var self = this;
                    /*this.titleToolbarView = TitleToolbarView;
                    this.titleToolbarView.render({
                        name : this.makeTitle(),
                        isIscroll : false,
                        isPrev : true,
                        refreshButton : {
                            callback : $.proxy(self.reload, self)
                        }
                    });*/
                    this.headerToolbarView = HeaderToolbarView;
                    this.headerToolbarView.render({
                        isPrev: true,
                        title: this.makeViewTitle(),
                        actionMenu: this.getUseMenus()
                    });

                    this.makeContent();
                    GO.util.imagesLoaded("#report_detail", this.initIScroll);
                    this.$el.addClass("report");
                    this.initWindowEvent();
                    return this.$el;
                },
                getUseMenus: function () {
                    var data = this.model.toJSON();
                    var useMenuList = [];
                    var menus = {
                        "댓글": {
                            id: 'report-comment',
                            text: CommonLang['댓글'],
                            cls: "btn_comments",
                            triggerFunc: 'report-comment',
                            commentsCount: data.commentCount
                        },
                        "수정": {
                            id: 'report-modify',
                            text: CommonLang["수정"],
                            triggerFunc: 'report-modify',
                            inMoreBtn: true
                        },
                        "삭제": {
                            id: 'report-delete',
                            text: CommonLang["삭제"],
                            triggerFunc: 'report-delete',
                            inMoreBtn: true
                        }
                    };
                    useMenuList.push(menus.댓글);
                    if (data.actions.updatable) {
                        useMenuList.push(menus.수정);
                    }
                    if (data.actions.removable) {
                        useMenuList.push(menus.삭제);
                    }

                    return useMenuList;
                },
                initWindowEvent: function () {
                    this.orientationWindowEvent = {
                        name: 'orientation',
                        event: function () {
                            this.$el.find("#report_detail").width($(window).width());
                            this.initIScroll();
                        }
                    };
                    this.setTimeoutToWindowEventHandler(this.orientationWindowEvent);
                },
                setTimeoutToWindowEventHandler: function (eventHandler) {
                    var self = this;
                    $(window).on(eventHandler.name, function () {
                        if (this.timeout) clearTimeout(this.timeout);
                        this.timeout = setTimeout($.proxy(eventHandler.event, self), 200);
                    });
                },
                initIScroll: function () {
                    if($(document).width() < $("#report_detail").width()) {
                        GO.util.initDetailiScroll("articleViewWrap", "iScrollContentWrap", "report_detail");
                    }
                },
                reload: function () {
                    this.model.fetch({async: false});
                    this.folder = (new ReportFolderModel()).set(this.model.get("folder"));
                    this.render();
                },
                makeContent: function () {
                    var self = this;
                    this.$el.html(ReportDetailTmpl({
                        data: $.extend({}, this.model.toJSON(), {
                            createdAtBasicDate: GO.util.basicDate(this.model.get("submittedAt")),
                            content: function () {
                                var content = GO.util.convertMSWordTag(GO.util.escapeXssFromHtml(self.model.get("content"))); //ms word 태그를 공백으로 치환

                                if (self.model.get("contentType") == 'TEXT') {
                                    content = GO.util.convertRichText(content);
                                }

                                content = $.goFormUtil.convertViewMode(content);

                                return content;
                            }
                        }),
                        lang: lang
                    }));

                    this.attachView = AttachFilesView.create('#report-attach-placeholder', this.model.get("attaches"), function (item) {
                        return GO.config("contextRoot") + "api/report/" + self.options.reportId + "/download/" + item.id;
                    });
                    this.fontResizeLayerAdd();

                },
                fontResizeLayerAdd: function () {
                    FontResize.render({
                        el: "#fontResizeWrap",
                        targetContentEl: "#report_detail"
                    });
                },
                list: function () {
                    var url = "";

                    if (this.folder.isPeriodic()) {
                        url = "report/series/" + this.model.get("series").id;
                    } else {
                        url = "report/folder/" + this.folder.get("id") + "/reports";
                    }
                    url = GO.router.getSearch('page') ? url += '/?page=' + GO.router.getSearch('page') : url;
                    GO.router.navigate(url, true);

                    return false;
                },

                comment: function () {
                    var url = "";

                    if (this.folder.isPeriodic()) {
                        url = "/report/series/" + this.model.get("series").id + "/report/" + this.model.get("id") + "/comments";
                    } else {
                        url = "/report/folder/" + this.folder.get("id") + "/report/" + this.model.get("id") + "/comments";
                    }

                    GO.router.navigate(url, {trigger: true});
                },

                modify: function () {
                    var url = "";

                    if (this.folder.isPeriodic()) {
                        url = "report/series/" + this.model.get("series").id + "/report/" + this.model.get("id") + "/form";
                    } else {
                        url = "/report/folder/" + this.folder.get("id") + "/report/" + this.model.get("id") + "/edit";
                    }

                    GO.router.navigate(url, {trigger: true});
                },

                remove: function () {
                    var self = this;
                    if (confirm(lang['removeDesc'])) {
                        if (this.folder.isPeriodic()) {
                            var id = this.model.get("id");
                            var model = new ReportModel();
                            model.set({id: id, status: "UNDONE"});
                            model.save(null, {
                                success: function () {
                                    self.list();
                                }
                            })
                        } else {
                            this.model.destroy({
                                success: function () {
                                    self.list();
                                }
                            });
                        }
                    }
                },
                makeViewTitle: function () {
                    var title = "";

                    if (this.folder.isPeriodic()) {
                        title = this.model.getSeriesStr();
                    } else {
                        title = this.folder.get("name");
                    }
                    return title;
                },
                makeTitle: function () {
                    var title = "";

                    if (this.folder.isPeriodic()) {
                        title = this.folder.get("name") + " > " + this.model.getSeriesStr();
                    } else {
                        title = this.folder.get("name") + " > " + this.model.get("name");
                    }
                    return title;
                },
                copyUrl: function (e) {
                    GO.util.copyUrl(e);
                }
            }, {
                __instance__: null,
                create: function (packageName) {
                    this.__instance__ = new this.prototype.constructor({'packageName': packageName});
                    return this.__instance__;
                }
            });

            return ReportDetailView;
        });
}).call(this);