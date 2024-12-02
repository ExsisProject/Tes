(function() {
    define([
            "ehr/attendance/views/layouts/defaults",
            "ehr/common/components/layoutEventListener"
    ], 
    
    function(
            DefaultLayout
    ) {
        var AttndController = (function() { 
            var Controller = function() {
                
            };

            Controller.prototype = {
                render : function(userid) {
                    require(["attendance/views/my_list"], function(AttndMyListView) {
                        DefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement();
                            var attndMyListView = new AttndMyListView({"userid" : userid});
                            content.html(attndMyListView.render().el).addClass("go_calendar_list go_attend_list go_renew");
                        });
                    });
                },
                
                popup : function(userid){
                    require(["attendance/views/my_list"], function(AttndMyListView) {
                        var layout = new DefaultLayout();
                        layout.initPopupMarkup();
                        var attndMyListView = new AttndMyListView({"userid" : userid});
                        layout.renderPopupViewer(attndMyListView.render().el).addClass("go_calendar_list go_attend_list go_renew");
                        
                        // 이전 버튼 제거
                        $("#moveBack").hide();
                    });
                },
                
                deptList : function(deptid) {
                    require(["attendance/views/main_attnd_list"], function(AttndListView) {
                        DefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement();
                            var attndListView = new AttndListView({"isCompanyAttnd":false, "deptId" : deptid});
                            content.html(attndListView.render().el).addClass("go_calendar_list go_attend_situation go_renew");
                        });
                    });
                },
                
                companyList : function() {
                    require(["attendance/views/main_attnd_list"], function(AttndListView) {
                        DefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement();
                            var attndListView = new AttndListView({"isCompanyAttnd":true});
                            content.html(attndListView.render().el).addClass("go_calendar_list go_attend_situation go_renew");
                        });
                    });
                },
                
                deptStats : function(deptid) {
                    require(["attendance/views/stats"], function(AttndDeptStatsView) {
                        DefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement();
                            var attndDeptStatsView = new AttndDeptStatsView({"deptid" : deptid});
                            content.append(attndDeptStatsView.render().el);
                        });
                    });
                },
                
                allDeptStats : function() {
                    require(["attendance/views/stats"], function(AttndAllDeptStatsView) {
                        DefaultLayout.render().done(function(layout) {
                            var content = layout.getContentElement();
                            var attndAllDeptStatsView = new AttndAllDeptStatsView();
                            content.append(attndAllDeptStatsView.render().el);
                        });
                    });
                }
            };
            
            return Controller;
        })();
        
        return new AttndController();
    });
    
}).call(this);