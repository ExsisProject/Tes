(function () {
    define([
            "backbone",
            "app",
            "hgn!welfare/templates/company_manage_tab",
            "i18n!welfare/nls/welfare"
        ],

        function (
            Backbone,
            GO,
            Tmpl,
            WelfareLang
        ) {
            var lang = {
                "기본 설정" : WelfareLang["기본 설정"],
                "복지포인트 관리" : WelfareLang["복지포인트 관리"]
            }

            var CompanyTabView = Backbone.View.extend({
                events: {
                    "click #home_tab li" : "clickTab"
                },

                initialize: function () {
                    this.$el.off();
                },

                render: function () {
                    this.$el.html(Tmpl({
                        lang : lang
                    }));
                    return this;
                },

                clickTab : function(e){
                    var $target = $(e.currentTarget);
                    $target.closest("ul").find("li").removeClass("active");
                    $target.addClass("active");
                    this.trigger("company_config.tabclick", {type : $target.data("type")});
                }

            });

            function privateFunc(view, param1, param2) {

            }

            return CompanyTabView;

        });
    
})();