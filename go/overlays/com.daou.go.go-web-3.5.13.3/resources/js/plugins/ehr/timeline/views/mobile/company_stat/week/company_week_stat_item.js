define("timeline/views/mobile/company_stat/week/company_week_stat_item", function (require) {
    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/mobile/company_stat/week/company_week_stat_item");

    var WeekView = require("timeline/views/mobile/user/week");

    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

    var WeekStatItem = Backbone.View.extend({
        tagName: 'li',

        events: {
            "click": "toggleUserStat"
        },

        initialize: function (model) {
            this.isStat = true;
            this.stat = model;
        },

        render: function () {
            this.$el.html(Tmpl({
                TimelineLang: TimelineLang,
                CommonLang: CommonLang,
                stat: this.stat.attributes,
                name: this.stat.getName(),
                position: this.stat.getPosition(),
                deptName: this.stat.getDeptName(),
                totalWorkingTime: this.stat.getTotalWorkingTime(),
                isOverTotalWorkingTime: this.stat.isOverTotalWorkingTime()
            }));

            return this;
        },

        toggleUserStat: function (e) {
            var target = $(e.currentTarget);
            if (target.closest('li').hasClass('active')) {
                this.removeUserStat(target);
            } else {
                this.showUserStat(target);
            }
        },

        showUserStat: function (target) {
            target.closest('li').addClass('active');
            var userId = target.find('#userStat').attr("data-id");
            var weekView = new WeekView({targetUserId: userId, model: this.stat, index: 1, lastWeek: true});
            target.find("#userStat").append(weekView.$el);
            weekView.render(this.isStat);
            target.find(".tit_wrap").remove();
        },

        removeUserStat: function (target) {
            target.closest('li').removeClass('active');
            target.find('#week').remove();
        },


    });

    return WeekStatItem;

});
