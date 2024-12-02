(function () {

    define([
            "app",
            "views/layouts/default",
            "i18n!nls/notification",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
        ],

        function (
            GO,
            Layout,
            notiLang,
            commonLang,
            adminLang
        ) {

            var NotificationController = (function () {

                var Controller = function () {
                    // Constructor
                };

                Controller.prototype = {

                    renderer: function (config) {
                        require(["views/notification/side", "views/notification/app"], function (SideView, NotiAppView) {
                            Layout.render().done(function (layout) {
                                var content = new NotiAppView({
                                    config: _.extend({pageOffset: 20}, config)
                                });
                                var side = new SideView({
                                    category: config.category
                                });

                                $('#side').empty().html(side.render());
                                $('#content').attr('class', 'go_content go_alarm');
                                $('#content').empty().append(content.render());

                            });
                        });
                    },

                    all: function () {
                        this.renderer({
                            category: "all",
                            icontype: "ic_alarm_off_h",
                            title: notiLang["전체 알림"],
                            useDeleteAllButton: true
                        });
                    },

                    unread: function () {
                        this.renderer({
                            category: "unread",
                            icontype: "ic_alarm_h",
                            title: notiLang["안읽은 알림"],
                            isRequiredUnreadCount: true,
                            useReadAllNotieButton: true,
                            useDeleteAllButton: true
                        });
                    },

                    mail: function () {
                        this.renderer({
                            category: "mail",
                            icontype: "ic_mail_h",
                            title: notiLang["메일"]
                        });
                    },

                    bbs: function () {
                        this.renderer({
                            category: "bbs",
                            icontype: "ic_bbs_h",
                            title: notiLang["게시판"]
                        });
                    },

                    community: function () {
                        this.renderer({
                            category: "community",
                            icontype: "ic_comm_h",
                            title: notiLang["커뮤니티"]
                        });
                    },

                    calendar: function () {
                        this.renderer({
                            category: "calendar",
                            icontype: "ic_cal_h",
                            title: notiLang["캘린더"]
                        });
                    },
                    task: function () {
                        this.renderer({
                            category: "task",
                            icontype: "ic_task_h",
                            title: commonLang["업무"]
                        });
                    },
                    works: function () {
                        this.renderer({
                            category: "works",
                            icontype: "ic_works_h",
                            title: commonLang["Works"]
                        });
                    },
                    todo: function () {
                        this.renderer({
                            category: "todo",
                            icontype: "ic_todo_h",
                            title: commonLang["ToDO+"]
                        });
                    },
                    report: function () {
                        this.renderer({
                            category: "report",
                            icontype: "ic_report_h",
                            title: commonLang["보고서"]
                        });
                    },
                    survey: function () {
                        this.renderer({
                            category: "survey",
                            icontype: "ic_survey_h",
                            title: commonLang["설문"]
                        });
                    },
                    approval: function () {
                        this.renderer({
                            category: "approval",
                            icontype: "ic_approval_h",
                            title: commonLang["전자결재"]
                        });
                    },
                    docs: function () {
                        this.renderer({
                            category: "docs",
                            icontype: "ic_docs_h",
                            title: commonLang["문서관리"]
                        });
                    },
                    asset: function () {
                        this.renderer({
                            category: "asset",
                            icontype: "ic_asset_h",
                            title: commonLang["예약"]
                        });
                    },
                    webfolder: function () {
                        this.renderer({
                            category: "webfolder",
                            icontype: "ic_file_h",
                            title: commonLang["자료실"]
                        });
                    },
                    ehr: function () {
                        this.renderer({
                            category: "ehr",
                            icontype: "ic_ehr_h",
                            title: commonLang["근태관리"]
                        });
                    },
                    channel: function () {
                        this.renderer({
                            category: "channel",
                            icontype: "ic_type2_alarm",
                            title: commonLang["외부 시스템"]
                        });
                    },
                    manager: function () {
                        this.renderer({
                            category: "manager",
                            icontype: "ic_task_h",
                            title: adminLang["운영자"]
                        });
                    },
                    openapi: function () {
                        this.renderer({
                            category: "openapi",
                            icontype: "ic_task_h",
                            title: "OpenAPI"
                        });
                    },
                };
                return Controller;

            })();

            return new NotificationController;
        });
}).call(this);


