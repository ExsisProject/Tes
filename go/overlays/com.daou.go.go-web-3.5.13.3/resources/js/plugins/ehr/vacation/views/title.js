define([
        "backbone",
        "app",
        "hgn!vacation/templates/title",
        "i18n!vacation/nls/vacation"
    ],

    function(
        Backbone,
        GO,
        TitleTpl,
        VacationLang
    ) {
        var lang = {
            "내 연차 내역" : VacationLang["내 연차 내역"],
            "전사 연차현황 관리" : VacationLang["전사 연차현황 관리"],
            "부서 연차현황" : VacationLang["부서 연차현황"],
            "전사 연차현황" : VacationLang["전사 연차현황"]
        };

        var Title = Backbone.View.extend({
            events: {

            },

            initialize: function() {},

            render: function(title) {

                $.extend(lang, {"label_title" : title});

                this.$el.html(TitleTpl({
                    lang: lang
                }));
                return this;
            }

        });

        function privateFunc(view, param1, param2) {

        }

        return Title;

    });