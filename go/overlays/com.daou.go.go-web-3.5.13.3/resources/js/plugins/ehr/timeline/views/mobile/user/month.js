define("timeline/views/mobile/user/month", function(require){
    var Backbone = require("backbone");
    var GO = require("app");

    var UserMonthModel = require("timeline/models/user_month");
    var AuthModel = require("timeline/models/auth");
    
    var WeekView = require("timeline/views/mobile/user/week");
    
    var TimelineLang= require("i18n!timeline/nls/timeline");

    var MonthView = Backbone.View.extend({
        initialize : function(options){
            this.options = options;
            this.model = new UserMonthModel();
            this.authModel = new AuthModel();
            GO.util.store.set("timeline.auth", null);
        },

        render : function(baseDate){
            this.$el.empty();

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            
            var monthDeferred = this.model.fetch({
                data : {
                    baseDate : baseDate,
                    userId : this.options.userId
                },
                error : function(model, response) {
                	GO.util.error(response.responseJSON.code, { "msgCode": "400-common"});
					return;
				}
            });

            var authDeferred = this.authModel.fetch({
                data : {
                    baseDate : baseDate,
                    userId : this.options.userId
                }
            });

            $.when(monthDeferred, authDeferred)
                .done(_.bind(function(){
                    GO.util.store.set("timeline.auth", this.authModel.toJSON());

                    var targetUserId = this.model.user.id;
                    var weeksLength = this.model.weeks.length;
                    _.each(this.model.weeks, function(week, index){
                    	var weekIndex = index + 1;
                    	var lastWeek = weeksLength === weekIndex;
                        var weekView = new WeekView({targetUserId: targetUserId, model: week, index : weekIndex, lastWeek : lastWeek});
                        this.$el.append(weekView.$el);
                        weekView.render();
                    }, this);
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                }, this)).
                fail(_.bind(function(){GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);}, this));
        }
    });

    return MonthView;
});