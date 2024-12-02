(function() {
    define([
            "welfare/views/layouts/defaults",
            "ehr/common/components/layoutEventListener"
        ],

        function(
            DefaultLayout
        ) {
            var WelfareController = (function() {
                var Controller = function() {

                };

                Controller.prototype = {
                    renderMyWelfare : function(){
                        require(["welfare/views/my_page"], function(MyPageView) {
                            DefaultLayout.render().done(function(layout) {
                                var content = layout.getContentElement();
                                var myPageView = new MyPageView();
                                $('body').addClass("go_skin_ehr");
                                content.html(myPageView.render().el).addClass("go_renew ehr_hr_set");
                            });
                        });
                    },

                    renderConfig : function() {
                        require(["welfare/views/company_manage"], function(ManageView) {
                            DefaultLayout.render().done(function(layout) {
                                var content = layout.getContentElement();
                                var manageView = new ManageView();
                                $("div.go_body").removeClass("go_renew");
                                content.html(manageView.render().el).addClass("ehr_hr_set go_attend_situation");
                            });
                        });
                    },

                    renderHistory : function(deptId){
                        require(["welfare/views/histories"], function(HistoryView) {
                            DefaultLayout.render().done(function(layout) {
                                var content = layout.getContentElement();
                                var historyView = new HistoryView();
                                content.html(historyView.render().el).addClass("go_renew ehr_hr_set go_attend_situation");
                            });
                        });
                    }
                };

                return Controller;
            })();

            return new WelfareController();
        });

}).call(this);