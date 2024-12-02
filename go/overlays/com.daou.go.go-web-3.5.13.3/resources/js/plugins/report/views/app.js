(function() {
    define([
        "backbone", 
        "app",
        "hgn!report/templates/home",
        "report/views/home_todo",
        "report/views/home_recent",
        "i18n!report/nls/report",
        "report/views/report_title",
        "components/backdrop/backdrop"
    ], 
    
    function(
        Backbone, 
        GO, 
        HomeTmpl,
        HomeTodo,
        HomeRecent,
        ReportLang,
        ReportTitleView,
        BackdropView
    ) {
        var lang = {
            report_home : ReportLang["보고 홈"],
            to_submit_title : ReportLang["작성할 보고서"],
            to_submit_desc : ReportLang["내가 보고자로 등록된 정기 보고서 중 아직 작성하지 않은 보고서를 보여드립니다."],
            recently_submitted_title : ReportLang["최근 생성된 보고서"],
            recently_submitted_desc : ReportLang["최근에 등록된 시간순서대로, 최대 20개의 목록을 표시합니다."]
        };
        
        var ReportAppView = GO.BaseView.extend({
            render: function() {
                var self = this;
                $("#content").html(HomeTmpl(lang));
                $(".btn-toggle-desc").on("click", function (e) {
                    if (!self.backdropView) {
                        self.backdropView = new BackdropView();
                        self.backdropView.backdropToggleEl = $(e.currentTarget).find(".tooltip-desc");
                        self.backdropView.linkBackdrop($(e.currentTarget));
                    }
                });
                HomeTodo.render();
                HomeRecent.render();
                ReportTitleView.create({
                    text : lang.report_home
                });
            },

            _bindBackdrop : function($currentTarget) {
                var backdropView = new BackdropView();
                backdropView.backdropToggleEl = $currentTarget.find(".tooltip-desc");
                backdropView.linkBackdrop($currentTarget);
                return backdropView;
            }
        }, {
            __instance__: null, 
            
            render: function() {
                var view = this.getInstance();
                view.render();
                return view;
            }
        });
        
        return ReportAppView;
    }); 
})();
