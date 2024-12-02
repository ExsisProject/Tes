define("timeline/views/dashboard/list/list_row", function (require) {

    var Backbone = require("backbone");

    var Tmpl = require("hgn!timeline/templates/dashboard/list/list_row");

    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var _ = require("underscore");
    var ProfileView = require("views/profile_card");

    var DashboardCollection = require("timeline/collections/dashboard_stats");

    var TimelineDashboard = Backbone.View.extend({

        tagName: 'tbody',
        events: {
            "click .member": "showProfile",
            "click #sync_btn": "sync",
            "click tr": "popupUserStat",
        },
        initialize: function (opt) {
            this.baseDate = opt.baseDate;
            this.renderCb = opt.renderCb;
            this.parent = opt.self;
            this.viewList = opt.viewList;
            this.deptId = opt.deptId;
            this.lists = new DashboardCollection(this.baseDate);

            this.lists.changeParam(opt.opt, this.viewList);

            this.colCnt = 5
                + (_.contains(this.viewList, 'absence') ? 1 : 0 )
                + (_.contains(this.viewList, 'vacation') ? 1 : 0 )
                + (_.contains(this.viewList, 'unAuthDevice') ? 1 : 0 )
                + (_.contains(this.viewList, 'extensionWorkingTime') ? 1 : 0 )
                + (_.contains(this.viewList, 'nightWorkingTime') ? 1 : 0 )
                + (_.contains(this.viewList, 'holyDayWorkingTime') ? 1 : 0 )
                + (_.contains(this.viewList, 'etcStatus') ? 1 : 0 );


        },
        popupUserStat: function (e) {
            var target = e.currentTarget;
            var userId = $(target).find('.member').attr('data-id');
            if (!userId) return;
            window.open("/app/ehr/timeline/userstat/" + userId, userId, "scrollbars=yes,resizable=yes,width=1280,height=640");
        },
        showProfile: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var target = e.currentTarget;
            var userId = $(target).attr("data-id");

            if (!userId) return;
            var popupTarget = $(target).find('img');
            ProfileView.render(userId, popupTarget);
        },
        render: function () {

            this.lists.fetch({async: false});

            this.$el.html(Tmpl({
                TimelineLang: TimelineLang,
                CommonLang: CommonLang,
                models: this.lists.models,
                isEmpty: this.lists.total < 1,
                colCnt:this.colCnt,
                viewClockIn: _.contains(this.viewList, 'clockIn'),
                viewClockOut: _.contains(this.viewList, 'clockOut'),
                viewAbsence: _.contains(this.viewList, 'absence'),
                viewTardy: _.contains(this.viewList, 'tardy'),
                viewEarly: _.contains(this.viewList, 'early'),
                viewVacation: _.contains(this.viewList, 'vacation'),
                viewUnAuthDevice: _.contains(this.viewList, 'unAuthDevice'),
                viewAutoClockOut: _.contains(this.viewList, 'autoClockOut'),
                viewExtensionWorkingTime: _.contains(this.viewList, 'extensionWorkingTime'),
                viewNightWorkingTime: _.contains(this.viewList, 'nightWorkingTime'),
                viewHolyDayWorkingTime: _.contains(this.viewList, 'holyDayWorkingTime'),
                viewEtcStatus: _.contains(this.viewList, 'etcStatus')
            }));

            this.renderCb(this.lists, this.parent);
            return this;
        },
        changeParam: function (param) {
            this.lists.changeParam(param, this.viewList);
            this.render();
        }

    });

    return TimelineDashboard;

});