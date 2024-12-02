(function() {
    define([
            "vacation/views/layouts/defaults",
            "ehr/common/components/layoutEventListener"
        ],

        function(
            DefaultLayout
        ) {

            function addCommonCss(layout){
                layout.addClass("go_renew annualvacation");
            }
            var VacationController = (function() {
                var Controller = function() {

                };

                Controller.prototype = {
                    renderMyVacation : function(){
                        require(["vacation/views/personal_vacation_histories"], function(MyPageView) {
                            DefaultLayout.render().done(function(layout) {
                                var content = layout.getContentElement();
                                addCommonCss(content);
                                var myPageView = new MyPageView();
                                content.html(myPageView.render().el);

                            });
                        });
                    },

                    renderUserVacation: function(userId){
                        if(userId=="my"){
                            this.renderMyVacation();
                        }else{
                            require(["vacation/views/personal_vacation_histories"], function(UserPageView) {
                                var userPage = new UserPageView({userId : userId});
                                userPage.render();
                            });
                        }
                    },

                    renderConfig : function() {
                        require(["vacation/views/config/main"], function(ManageView) {
                            DefaultLayout.render().done(function(layout) {
                                var content = layout.getContentElement();
                                addCommonCss(content);
                                var manageView = new ManageView();
                                content.html(manageView.render().$el).addClass("annualvacation_set");
                            });
                        });
                    },

                    renderCompanyHistory : function(){
                        require(["vacation/views/company_vacation_histories"], function(HistoryView) {
                            DefaultLayout.render().done(function(layout) {
                                var content = layout.getContentElement();
                                addCommonCss(content);
                                var historyView = new HistoryView();
                                content.html(historyView.render().$el);
                            });
                        });
                    },
                    renderDeptVacation : function(deptId){
                        if(deptId=="company"){
                            require(["vacation/views/company_vacation_histories"], function(HistoryView) {
                                DefaultLayout.render().done(function(layout) {
                                    var content = layout.getContentElement();
                                    addCommonCss(content);
                                    var accountUseEhrOption = layout.sideView.getAccountUseEhrOption();
                                    var historyView = new HistoryView(accountUseEhrOption);
                                    content.html(historyView.render().$el);
                                });
                            });
                        }else{
                            require(["vacation/views/dept_vacation_histories"], function(HistoryView) {
                                DefaultLayout.render().done(function(layout) {
                                    var content = layout.getContentElement();
                                    addCommonCss(content);
                                    var historyView = new HistoryView({deptId : deptId});
                                    content.html(historyView.render().$el);
                                });
                            });
                        }
                    },
                    renderUsageHistory : function(deptId){
                        require(["vacation/views/usage_histories"], function(HistoryView) {
                            DefaultLayout.render().done(function(layout) {
                                var content = layout.getContentElement();
                                addCommonCss(content);
                                var historyView = new HistoryView({deptId : deptId});
                                content.html(historyView.render().el);
                            });
                        });
                    }
                };

                return Controller;
            })();

            return new VacationController();
        });

}).call(this);