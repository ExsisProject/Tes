define('works/controllers/mobile', function () {

    // mobile router object
    var r = {};
    var self = this;
    var appName = 'works';
    var LayoutView = null;


    function renderSide(appletId) {
        require(["works/views/mobile/side"], function (SideView) {
            var View = SideView.create();
            View.appletId = appletId;
            View.render().done(function (sideView) {
                var sideEl = LayoutView.getSideContentElement().html(sideView.el);
                GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
                sideEl.parent().hide();
            });
        });
    }

    function toggleSearchBtn(flag) {
        LayoutView.$('#btnHeaderSearch').toggle(flag);
    }

    r.worksHome = function () {
        require(["views/layouts/mobile_default", "works/views/mobile/home"], function (MobileLayout, HomeView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(true);
                this.$el.addClass('go_skin_works');
                this.$('.go_content').html((new HomeView({type: 'all'})).render().el);
            });
        });
    };

    r.worksHomeType = function (type) {
        require(["views/layouts/mobile_default", "works/views/mobile/home"], function (MobileLayout, HomeView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(true);
                this.$el.addClass('go_skin_works');
                this.$('.go_content').html((new HomeView({type: type})).render().el);
            });
        });
    };

    r.worksHomeFolder = function (folderId) {
        require(["views/layouts/mobile_default", "works/views/mobile/home"], function (MobileLayout, HomeView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(true);
                this.$el.addClass('go_skin_works');
                this.$('.go_content').html((new HomeView({type: 'folder', folderId: folderId})).render().el);
            });
        });
    };

    r.appHome = function (appletId) {
        require(["views/layouts/mobile_default", "works/views/mobile/app_home"], function (MobileLayout, AppHomeView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(true);
                (new AppHomeView({"appletId": appletId})).dataFetch().then(function (view) {
                    renderSide.call(self, appletId);
                    view.render();
                });
            });
        });
    };

    /**
     * 문서 상세 페이지
     * @param appletId 앱 아이디
     * @param docId 문서 아이디
     */
    r.readDoc = function (appletId, docId, subFormId) {
        require(["views/layouts/mobile_default", "works/views/mobile/doc_detail"], function (MobileLayout, DocDetailView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function (layout) {
                toggleSearchBtn(false);
                (new DocDetailView({"appletId": appletId, "docId": docId, "subFormId": subFormId})).render();
                layout.getSearchWrapElement().hide();
            });
        });
    };

    r.readReportList = function (appletId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/report/app_report_list'], function (MobileLayout, ReportListView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                renderSide.call(self, appletId);
                toggleSearchBtn(false);
                this.$el.addClass('go_skin_works');
                this.$('#content').html((new ReportListView({'appletId': appletId})).render().el);
            });
        });
    };

    r.reportDetail = function (appletId, reportId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/report/app_report_detail'], function (MobileLayout, ReportDetailView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                renderSide.call(self, appletId);
                toggleSearchBtn(false);
                this.$el.addClass('go_skin_works');
                this.$('#content').html((new ReportDetailView({'appletId': appletId, "reportId": reportId})).render().el);
            });
        });
    };

    r.readDocFromList = function (appletId, docId, subFormId) {
        require(["views/layouts/mobile_default", "works/views/mobile/doc_detail"], function (MobileLayout, DocDetailView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(false);
                (new DocDetailView({
                    "appletId": appletId,
                    "docId": docId,
                    "subFormId": subFormId,
                    useNavigate: true
                })).render();
            });
        });
    };

    /**
     * 연동 문서 상세 페이지
     * @param reqAppletId   연동 "한"   앱 아이디
     * @param referAppletId 연동 "된"   앱 아이디
     * @param referDocId    연동 "된" 문서 아이디
     */
    r.referDoc = function (reqAppletId, referAppletId, referDocId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/doc_detail_refer'], function (MobileLayout, DocDetailReferView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(false);
                (new DocDetailReferView({
                    reqAppletId: reqAppletId,
                    referAppletId: referAppletId,
                    referDocId: referDocId,
                    subFormId: 0
                })).render();
            });
        });
    };

    /**
     * 사용자 입력폼 페이지
     * @param appletId 앱 아이디
     */
    r.createDoc = function (appletId, subFormId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/user_form'], function (MobileLayout, UserFormView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(false);
                (new UserFormView({"appletId": appletId, "subFormId": subFormId})).render();
            });
        });
    };

    /**
     * 문서 수정 페이지
     * @param appletId 앱 아이디
     * @param docId 문서 아이디
     */
    r.editDoc = function (appletId, docId, subFormId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/user_form'], function (MobileLayout, UserFormView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(false);
                (new UserFormView({"appletId": appletId, "docId": docId, "subFormId": subFormId})).render();
            });
        });
    };

    /**
     * 활동 기록 만들기
     * @param appletId 앱 아이디
     * @param docId 문서 아이디
     */
    r.createActivity = function (appletId, docId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/doc_detail/doc_activity_form'], function (MobileLayout, DocActivityView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(false);
                (new DocActivityView({"appletId": appletId, "docId": docId})).render();
            });
        });
    };

    /**
     * 활동 기록 보기
     * @param appletId
     * @param docId
     */
    r.readActivities = function (appletId, docId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/doc_detail/doc_activity'], function (MobileLayout, DocActivityView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(false);
                (new DocActivityView({"appletId": appletId, "docId": docId})).render();
            });
        });
    };

    /**
     * 활동 기록 수정
     * @param appletId 앱 아이디
     * @param docId 문서 아이디
     * @param activityId 활동기록 아이디
     */
    r.editActivity = function (appletId, docId, activityId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/doc_detail/doc_activity_form'], function (MobileLayout, DocActivityView) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(false);
                (new DocActivityView({"appletId": appletId, "docId": docId, "activityId": activityId})).render();
            });
        });
    };

    /**
     * 활동 기록 댓글
     * @param appletId 앱 아이디
     * @param docId 문서 아이디
     * @param activityId 활동기록 아이디
     */
    r.commentList = function (appletId, docId, activityId) {
        require(["views/layouts/mobile_default", 'works/views/mobile/doc_detail/comment_list'], function (MobileLayout, DocCommentList) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(false);
                var view = new DocCommentList({
                    appletId: appletId,
                    docId: docId,
                    activityId: activityId
                });
                view.dataFetch().done(function () {
                    view.render();
                });
            });
        });
    };

    r.search = function () {
        require(["views/layouts/mobile_default", "works/search/views/mobile/search"], function (MobileLayout, View) {
            LayoutView = MobileLayout.create();
            LayoutView.render(appName).done(function () {
                toggleSearchBtn(true);
                var view = new View();
                view.render();
            });
        });
    };

    return r;
});
