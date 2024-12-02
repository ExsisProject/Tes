define("timeline/views/user/history", function(require){

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/history");
    var TimelineLang= require("i18n!timeline/nls/timeline");

    var HistoryView = Backbone.View.extend({
        initialize : function(options){
            this.options = options;
        },

        render : function() {
            this.$el.html(Tmpl({
                TimelineLang : TimelineLang
            }));
        }
    });

    return HistoryView;
});