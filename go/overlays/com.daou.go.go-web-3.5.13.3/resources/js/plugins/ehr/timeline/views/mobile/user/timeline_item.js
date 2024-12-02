define("timeline/views/mobile/user/timeline_item", function(require){
    var Backbone = require("backbone");
    var GO = require("app");

    var AuthModel = require("timeline/models/auth");
    var HistoryModel = require("timeline/models/history");
    var Tmpl = require("hgn!timeline/templates/mobile/user/timeline_item");
    
    var TimelineHitoryCollection = Backbone.Collection.extend({
        model : HistoryModel,
        initialize : function(data, dayInfo) {
            this.dayInfo = dayInfo;
        },
        getData : function(){
        	return _.chain(this.models)
                .map(function (model) {
                    return {
                        id : model.get("id"),
                        name : model.getStatusName(),
                        time : model.checkTimeHourMinuteSecond(),
                        timeZone : model.get('timezoneInfo'),
                        content : model.getContent(),
                        checkType : model.get("checkType")
                    }
                }).value();
        }
    });

    var TimelineItemView = Backbone.View.extend({
        events : {
        	"click div[name=timelineItem]" : "viewDetail"
        },
        
        initialize : function(){
            this.authModel = new AuthModel(GO.util.store.get("timeline.auth"));
            this.targetUserId = this.options.targetUserId;
            this.dayInfo = this.options.dayInfo;
            this.collection = new TimelineHitoryCollection(this.options.data);
        },

        render : function(){
            var self = this;
            this.$el.html(Tmpl({
                data : this.collection.getData()
            }));
        },
        
        viewDetail : function(e) {
        	if(!this.authModel.isReadable()){
                return;
            }

            var $target = $(e.currentTarget);
            var id = $target.data("id");
            var historyData = [id, this.targetUserId, this.dayInfo.day];
            GO.router.navigate('ehr/timeline/history/' + historyData.join("/") , {trigger: true});
        }
    });

    return TimelineItemView;
});