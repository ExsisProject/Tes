define("timeline/views/user/main", function (require) {

    var Backbone = require("backbone");
    var Tmpl = require("hgn!timeline/templates/user/main");
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var SummaryView = require("timeline/views/user/summary");
    var HistoryView = require("timeline/views/user/change_history");
    var MonthView = require("timeline/views/user/month");
    var _ = require("underscore");
    var UserProfileModel = require("models/user_profile");
    var LocalStorage = require("timeline/helpers/user/local_storage");

    var MainView = Backbone.View.extend({
        events : {
            "click #prevMonth" : "prevMonth",
            "click #nextMonth" : "nextMonth",
            "click #currentMonth" : "currentMonth",
            "click #baseDate" : "showCal"
        },

        initialize: function (options) {
            this.options = options;
            this.date = new Date();
            this.baseDate = GO.util.customDate(this.date, 'YYYY-MM-DD');
            this.options.baseDate = this.baseDate;

            if( !!this.options.userId && !!this.getUrlParams().popup){
                this.popupUserStat(this.options.userId)
                window.history.go(-1);
                return;
            }

            this.summaryView = new SummaryView(this.options);
            this.historyView = new HistoryView(this.options);
            this.monthView = new MonthView(this.options);
            LocalStorage.setSelectedDay(GO.util.customDate(this.date, 'YYYY-MM-DD'));


            this.updateBaseDate();

            GO.EventEmitter.on("timeline", "change:data", function () {
                this.renderContent();
            }, this);
        },
        popupUserStat: function (userId) {
            if (!userId) return;
            window.open("/app/ehr/timeline/userstat/" + userId, userId, "scrollbars=yes,resizable=yes,width=1280,height=640");
        },
        getUrlParams:function() {
            var params = {};
            window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
                params[key] = value; });
            this.queryParams = params;

            return this.queryParams;
        },
        updateBaseDate: function () {
            this.baseDate = GO.util.customDate(this.date, 'YYYY-MM-DD');
            this.options.baseDate = this.baseDate;
            this.viewDate = GO.util.customDate(this.date, 'YYYY.MM');
            LocalStorage.setSelectedDay(GO.util.customDate(this.date, 'YYYY-MM-DD'));
            this.changeBaseDate();
        },
        render: function () {

            if( !!this.options.userId && !!this.getUrlParams().popup) { return ''; }

            this.$el.html(Tmpl({
                userNameAndDeptName: _.bind(function () {
                    var sessionId = GO.session().id;
                    if (this.options.userId == sessionId) {
                        return ""
                    }

                    var user = UserProfileModel.read(this.options.userId);
                    var userName = user.get("name");
                    var deptNames = _.chain(user.get("deptMembers")).map(function (deptMember) {
                        return deptMember.deptName
                    }).join(',').value();
                    return "(" + deptNames + " - " + userName + ")";

                }, this),
                TimelineLang: TimelineLang,
                CommonLang: CommonLang,
                baseDate: this.viewDate
            }));

            this.$el.find("#summary").html(this.summaryView.$el);
            this.$el.find("#month").html(this.monthView.$el);
            this.$el.find("#history").html(this.historyView.$el);
            this.renderContent();
            this.initDatePicker();
        },

        renderContent: function () {
            this.summaryView.render();
            this.monthView.render(this.baseDate);
            this.historyView.refresh();
        },

        prevMonth: function () {
            this.date = moment(this.date).subtract(1, 'months');
            this.updateBaseDate();
        },

        nextMonth: function () {
            this.date = moment(this.date).add(1, 'months');
            this.updateBaseDate();
        },

        showCal: function () {
            var calendarDatepickerEl = this.$el.find("#calendarDatepicker");
            calendarDatepickerEl.attr("autocomplete", "off");
            calendarDatepickerEl.trigger('focus');
        },

        initDatePicker: function () {
            this.$el.find("#calendarDatepicker").datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect: _.bind(function (selectedDate) {
                    this.date = selectedDate;
                    this.updateBaseDate();
                }, this)
            })
        },
        currentMonth: function () {
            this.date = new Date();
            this.updateBaseDate();
        },

        changeBaseDate: function () {
            GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
            LocalStorage.initWeeks();
            this.$el.find("#baseDate").html(this.viewDate);
            this.summaryView.changeBaseDate(moment(this.date));
            this.historyView.changeBaseInfo(this.viewDate, this.options.userId);
            this.monthView.render(this.baseDate, this.options.userId);
            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
        },
    });

    return MainView;
});
