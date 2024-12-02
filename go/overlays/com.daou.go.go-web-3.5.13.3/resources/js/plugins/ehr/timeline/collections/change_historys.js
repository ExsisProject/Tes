
define('timeline/collections/change_historys', function (require) {

    var Backbone = require("backbone");
    var ChangeHistory = require("timeline/models/change_history");

    return Backbone.Collection.extend({

        model: ChangeHistory,
        pageNum:0,
        offset:20,


        initialize: function (options) {
            this.userId = options.userId;
            this.updateBaseDate(options.baseDate)
        },

        url: function () {
            var url = GO.contextRoot + "api/ehr/timeline/logs?offset=" + this.offset +"&page=" + this.pageNum;
            if(this.userId){
                url += '&userId=' + this.userId;
            }
            if(this.baseDate){
                url += '&baseDate=' + this.baseDate;
            }
            return url;

        },
        updateBaseDate : function(baseDate){
            this.baseDate = moment(baseDate, "YYYY.MM").format("YYYY-MM-DD");
        },
        nextPage: function () {
            this.pageNum ++;
        },

        reset : function () {
            this.pageNum = 0;
            this.offset = 20;
        }
    });
});