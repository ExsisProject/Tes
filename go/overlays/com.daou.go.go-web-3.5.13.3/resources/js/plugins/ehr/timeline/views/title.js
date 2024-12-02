
define("timeline/views/title", function (require) {

    var Backbone = require("backbone");
    var GO = require("app");
    var TitleTpl= require("hgn!timeline/templates/title");
    var timelineLang= require("i18n!timeline/nls/timeline");

        var Title = Backbone.View.extend({
            events: {

            },

            initialize: function() {},

            render: function(title) {
             
                this.$el.html(TitleTpl({
                    lang: timelineLang
                }));
                return this;
            }

        });

        function privateFunc(view, param1, param2) {

        }

        return Title;

    });