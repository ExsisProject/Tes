define([
        "backbone",
        "app",
        "hgn!attendance/templates/title",
        "i18n!attendance/nls/attendance"
    ],

    function(
        Backbone,
        GO,
        TitleTpl,
        attndLang
    ) {
        var lang = {
            "근태현황" : attndLang["근태현황"],
            "부서 근태현황" : attndLang["부서 근태현황"],
            "전사 근태현황" : attndLang["전사 근태현황"]
        };
        
        var Title = Backbone.View.extend({
            events: {

            },

            initialize: function() {},

            render: function(title) {
             
                $.extend(lang, {"label_title" : attndLang[title]});;
               
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