define("timeline/controllers/main", function (require) {
    var DefaultLayout = require("timeline/views/layouts/defaults");
    var GO = require("app");
    require("ehr/common/components/layoutEventListener");

    var TimelineController = (function () {
        var Controller = function () {

        };

        Controller.prototype = {

            renderUser : function(userId) {
                require(["timeline/views/user/main"], function (MainView) {
                    if(userId) {
                        var mainView = new MainView({"userId": userId});
                        mainView.$el.addClass("go_ehr_attend_personal go_renew");
                        $('body').html(mainView.$el);
                        $('body').addClass("go_skin_ehr");
                        mainView.render();
                    } else {
                        DefaultLayout.render().done(function (layout) {
                            var content = layout.getContentElement();
                            var mainView = new MainView({"userId": GO.session().id});
                            content.html(mainView.$el);
                            content.addClass("go_ehr_attend_personal go_renew");
                            mainView.render();
                        });
                    }
                });
            },

            renderCompany: function () {
                require(["timeline/views/company_stat/company_stats"], function (CompanyStats) {
                    DefaultLayout.render().done(function (layout) {
                        var content = layout.getContentElement();
                        var companyStats = new CompanyStats({ "range":"COMPANY"});
                        content.html(companyStats.render().el);
                    });
                });
            },

            renderDept: function (deptId) {
                require(["timeline/views/company_stat/company_stats"], function (DeptStats) {
                    DefaultLayout.render().done(function (layout) {
                        var content = layout.getContentElement();
                        var companyStats = new DeptStats({ "range":"DEPARTMENT", "deptId": deptId });
                        content.html(companyStats.render().el);
                    });
                });
            },

            renderDashboard: function () {
                require(["timeline/views/dashboard/timeline_dashboard"], function (Dashboard) {
                    DefaultLayout.render().done(function (layout) {
                        var content = layout.getContentElement();
                        var dashboard= new Dashboard();
                        content.html(dashboard.render().el);
                    });
                });
            },
            renderDeptDashboard: function (deptId) {
                var dId = deptId ? deptId : -1;
                require(["timeline/views/dashboard/timeline_dashboard"], function (Dashboard) {
                    DefaultLayout.render().done(function (layout) {
                        var content = layout.getContentElement();
                        var dashboard= new Dashboard({"deptId": dId});
                        content.html(dashboard.render().el);
                    });
                });
            },
        };

        return Controller;
    })();

    return new TimelineController();
});
