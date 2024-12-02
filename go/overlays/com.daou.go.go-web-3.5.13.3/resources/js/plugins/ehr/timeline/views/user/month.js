define("timeline/views/user/month", function(require){
    var Backbone = require("backbone");
    var WeekView = require("timeline/views/user/week");
    var UserMonthModel = require("timeline/models/user_month");
    var AuthModel = require("timeline/models/auth");
    var GO = require("app");

    var MonthView = Backbone.View.extend({
        initialize : function(options){
            this.options = options;
            this.model = new UserMonthModel();
            this.authModel = new AuthModel();
            GO.util.store.set("timeline.auth", null);
        },

        render : function(baseDate){
            var self = this;

            var monthDeferred = this.model.fetch({
                data : {
                    baseDate : baseDate,
                    userId : this.options.userId
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
                    self.$el.empty();
                    GO.util.store.set("timeline.auth", this.authModel.toJSON());

                    var targetUserId = this.model.user.id;
                    _.each(this.model.weeks, function(week, index){
                        var weekView = new WeekView({targetUserId: targetUserId, model: week, index : index + 1});
                        this.$el.append(weekView.$el);
                        weekView.render();
                    }, this);
                }, this));
        }
    });

    return MonthView;
});