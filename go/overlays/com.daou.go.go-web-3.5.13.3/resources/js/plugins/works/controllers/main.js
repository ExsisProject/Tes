define('works/controllers/main', function (require) {
    var WorksUtil = require('works/libs/util');
    var r = {};

    r.worksHome = function () {
        require(['works/home/views/home'], function (HomeView) {
            (new HomeView()).render();
        });
    };

    r.worksHomeType = function (type) {
        require(['works/home/views/home'], function (HomeView) {
            (new HomeView({appletType: type})).render();
        });
    };

    r.worksHomeFolder = function (folderId) {
        require(['works/home/views/home'], function (HomeView) {
            (new HomeView({appletType: 'folder', folderId: folderId})).render();
        });
    };

    r.appHome = function (appletId) {
        require(['works/views/app/app_home'], function (AppHomeView) {
            (new AppHomeView({
                "appletId": appletId,
                "useSearch": true
            })).render();
        });
    };

    /**
     * 마지막 검색 조건을 유지하는 케이스
     * @param appletId
     */
    r.appHomeSearch = function (appletId) {
        require(['works/views/app/app_home'], function (AppHomeView) {
            (new AppHomeView({
                appletId: appletId,
                useCachedCondition: true
            })).render();
        });
    };

    r.linkFilterAppHome = function (appletId, filterType, refAppletId, refDocId) {
        require(['works/views/app/app_home'], function (AppHomeView) {
            var options = {"appletId": appletId};
            if (filterType) {
                options["refLink"] = {
                    isLinkFilter: true,
                    appletId: refAppletId,
                    docId: refDocId
                };
            }
            (new AppHomeView(options)).render();
        });
    };

    r.docPrint = function (appletId, docId, subFormId) {
        require(['works/views/app/doc_detail', 'works/views/app/print_body'], function (View, PrintView) {
            var printView = new PrintView();
            var view = new View({
                appletId: appletId,
                subFormId: subFormId,
                docId: docId,
                isPrint: true
            });
            view.renderForPrint().then(function () {
                printView.setContent(view.el);
                $("body").html(printView.render().el);
            });
        });
    };

    r.createDoc = function (appletId, subFormId) {
        require(['works/views/app/user_form'], function (UserFormView) {
            (new UserFormView({"appletId": appletId, "subFormId": subFormId})).render();
        });
    };

    r.editDoc = function (appletId, docId, subFormId) {
        require(['works/views/app/user_form'], function (UserFormView) {
            (new UserFormView({"appletId": appletId, "docId": docId, "subFormId": subFormId})).render();
        });
    };

    r.readDoc = function (appletId, docId, subFormId) {
        require(['works/views/app/doc_detail'], function (DocDetailView) {
            (new DocDetailView({
                "appletId": appletId,
                "docId": docId,
                "subFormId": subFormId,
                useSearch: true
            })).render();
        });
    };

    r.readDocFromList = function (appletId, docId, subFormId) {
        require(['works/views/app/doc_detail'], function (DocDetailView) {
            (new DocDetailView({
                "appletId": appletId,
                "docId": docId,
                "subFormId": subFormId,
                useNavigate: true,
                useSearch: true
            })).render();
        });
    };

    r.readDocPopup = function (appletId, docId, subFormId) {
        require(['works/views/app/doc_detail_popup'], function (DocDetailPopupView) {
            (new DocDetailPopupView({
                appletId: appletId,
                subFormId: subFormId,
                docId: docId,
                isOrgDocPopup: true
            })).renderOrgDoc();
        });
    };

    /**
     * 연동 문서 상세 페이지 (팝업)
     * @param reqAppletId  연동 "한"   앱 아이디
     * @param appletId       연동 "된"   앱 아이디
     * @param docId           연동 "된" 문서 아이디
     */
    r.referDoc = function (reqAppletId, appletId, docId) {
        require(['works/views/app/doc_detail_popup'], function (DocDetailPopupView) {
            (new DocDetailPopupView({
                reqAppletId: reqAppletId,
                appletId: appletId,
                subFormId: 0,
                docId: docId
            })).render();
        });
    };

    r.createAppIntro = function () {
        require(['works/views/app/create_app_intro'], function (CreateAppIntroView) {
            (new CreateAppIntroView).render();
        });
    };

    r.createBaseinfo = function (refType, templateId) {
        require(['works/views/app/baseinfo_form'], function (BaseInfoFormView) {
            (new BaseInfoFormView({
                "templateId": templateId,
                "refType": refType		// "templates"일 경우 template으로 applet 생성,
                // "applets" 일 경우 생성되어 있는 applet으로 applet 생성
            })).render();
        });
    };

    r.editBaseinfo = function (appletId) {
        require(['works/views/app/baseinfo_form'], function (BaseInfoFormView) {
            (new BaseInfoFormView({"appletId": appletId})).render();
        });
    };

    r.settingHome = function (appletId) {
        require(['works/views/app/setting_home'], function (SettingHomeView) {
            (new SettingHomeView({"appletId": appletId})).render();
        });
    };

    r.formManager = function (appletId) {
        require(['works/views/app/form_manager'], function (FormManagerView) {
            (new FormManagerView({"appletId": appletId})).render();
        });
    };

    r.settingShare = function (appletId) {
        require(['works/views/app/share_manager'], function (SettingShareView) {
            (new SettingShareView({"appletId": appletId})).render();
        });
    };

    r.settingList = function (appletId) {
        require(['works/views/app/list_manager'], function (ListManagerView) {
            (new ListManagerView({"appletId": appletId})).render();
        });
    };

    r.settingPersonalList = function (appletId) {
        require(['works/personal_list_manager/views/personal_list_manager'], function (View) {
            (new View({"appletId": appletId})).render();
        });
    };

    r.settingPersonalListById = function (appletId, settingId) {
        require(['works/personal_list_manager/views/personal_list_manager'], function (View) {
            (new View({"appletId": appletId, settingId: settingId})).render();
        });
    };

    r.settingIntegration = function (appletId) {
        require(['works/views/app/integration_manager'], function (IntegrationManagerView) {
            (new IntegrationManagerView({"appletId": appletId})).render();
        });
    };

    r.settingWorkflow = function (appletId) {
        require(['works/views/app/workflow_manager'], function (WorkflowManagerView) {
            (new WorkflowManagerView({"appletId": appletId})).render();
        });
    };

    r.csvManager = function (appletId) {
        require(['works/views/app/csv_manager'], function (CSVManagerView) {
            (new CSVManagerView({"appletId": appletId})).render();
        });
    };

    r.settingDownload = function (appletId) {
        require(['works/views/app/download_manager'], function (DownloadManagerView) {
            (new DownloadManagerView({"appletId": appletId})).render();
        });
    };

    r.settingOpenApi = function (appletId) {
        require(['works/views/app/openapi_manager'], function (OpenApiManagerView) {
            (new OpenApiManagerView({"appletId": appletId})).render();
        });
    };

    r.csvHelp = function () {
        require(['works/views/app/csv_help'], function (CSVHelpView) {
            (new CSVHelpView()).render();
        });
    };

    r.interAppHelp = function () {
        require(['works/views/app/inter_app_help'], function (InterAppHelpView) {
            $('body').addClass('go_skin_default').html((new InterAppHelpView()).render().el);
        });
    };

    r.copy = function (sourceAppletId, sourceDocId, targetAppletId) {
        require(['works/views/app/data_copy'], function (DataCopyView) {
            (new DataCopyView({
                sourceAppletId: sourceAppletId,
                sourceDocId: sourceDocId,
                targetAppletId: targetAppletId
            })).renderLayout();
        });
    };

    r.search = function () {
        require(['works/search/views/search'], function (View) {
            (new View()).render();
        });
    };

    r.blind = function (appletId) {
        require(['works/components/masking_manager/masking_manager'], function (View) {
            (new View({"appletId": appletId})).render();
        });
    };

    r.daily = function (appletId, year, month, day) {
        this.list('daily', appletId, year, month, day);
    };
    r.weekly = function (appletId, year, month, day) {
        this.list('weekly', appletId, year, month, day);
    };
    r.monthly = function (appletId, year, month) {
        var savedDate = WorksUtil.getSavedBasedate(appletId);
        var inputDate = GO.util.toMoment(new Date(+year, (+month) - 1, 1));

        var mdate = GO.util.toMoment(savedDate);
        var endMonth = inputDate.endOf('month');
        var day = '' + Math.min(mdate.date(), endMonth.date());

        this.list('monthly', appletId, year, month, day);
    };
    r.list = function (type, appletId, year, month, day) {
        return this.renderCalendarView({
            'type': type,
            'appletId': appletId,
            'date': new Date([month, day, year].join('/'))
        });
    };
    r.calendarView = function (appletId) {
        return this.renderCalendarView({'appletId': appletId, "useSearch": true});
    };
    r.renderCalendarView = function (options) {
        require([
                "works/views/app/calendar_view/fixed_size",
                "works/views/app/calendar_view/calendar_view"
            ],
            function (CalendarFixedSizeLayout, AppletCalendarView) {
                options = options || {};
                var fixedSizeLayout = CalendarFixedSizeLayout.create();
                fixedSizeLayout.render().then(function (layout) {
                    var calendarView = new AppletCalendarView(options);
                    calendarView.clearPeriods.apply(calendarView);

                    layout.setContent(calendarView);
                    layout.resizeContentHeight();

                    calendarView.addPeriods.apply(calendarView, calendarView.getCheckedPeriodIds());
                    calendarView.setHeight(layout.getContentPageHeight());
                    calendarView.render();
                    layout.on("resize:content", function (newHeight) {
                        calendarView.resize(newHeight);
                    });
                });
            });
    };

    r.reportDetail = function (appletId, reportId) {
        require(['works/views/app/report/app_report_detail'], function (reportDetailView) {
            (new reportDetailView({
                "appletId": appletId,
                "reportId": reportId
            })).render();
        });
    };

    r.reportCreate = function (appletId) {
        require(['works/views/app/report/app_report_detail'], function (reportDetailView) {
            (new reportDetailView({
                "appletId": appletId
            })).render();
        });
    };

    r.reportList = function (appletId) {
        require(['works/views/app/report/app_report_list'], function (reportListlView) {
            (new reportListlView({
                "appletId": appletId
            })).render();
        });
    };

    r.startGuide = function () {
        require(['works/views/app/start_guide'], function (StartGuideView) {
            (new StartGuideView).render();
        });
    };

    r.ganttView = function (appletId) {
        require(['works/views/app/gantt_view/gantt_view'], function (AppletGanttView) {
            (new AppletGanttView({
                "appletId": appletId,
                "useSearch": true
            })).render();
        });
    };
    return r;
});
