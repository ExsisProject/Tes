(function () {
    define([
            "backbone",
            "app",
            "hgn!vacation/templates/my_page",
            "i18n!vacation/nls/vacation",
            "i18n!nls/commons",
            "vacation/views/title",
            "vacation/models/user_vacation",
            "vacation/collections/user_histories"
        ],

        function (
            Backbone,
            GO,
            Tmpl,
            VacationLang,
            CommonLang,
            TitleView,
            VacationModel,
            HistoryCollection
        ) {

            var lang = {
                "총연차" : VacationLang["총연차"],
                "사용 연차" : VacationLang["사용 연차"],
                "조정 연차" : VacationLang["조정 연차"],
                "잔여 연차" : VacationLang["잔여 연차"],
                "기간" : VacationLang["기간"],
                "사용일수" : VacationLang["사용일수"],
                "분류" : VacationLang["분류"],
                "이전" : CommonLang["이전"],
                "다음" : CommonLang["다음"],
                "날짜 이동" : VacationLang["날짜 이동"],
                "연차 없음 안내" : VacationLang["연차 없음 안내"],
                "내 연차 현황": VacationLang["내 연차 현황"],
            }

            var MyPage = Backbone.View.extend({
                events: {
                    "click #preDate" : "preDate",
                    "click #nextDate" : "nextDate",
                    "click #calArea" : "showCalendar"
                },

                initialize: function () {
                    var year = GO.util.toMoment().year();
                    this.vacation = new VacationModel();
                    this.vacation.setYear(year);
                    this.vacation.fetch({async : false});

                    this.histories = new HistoryCollection();
                    this.histories.setYear(year);
                    this.histories.fetch({async : false});
                },

                render: function (searchDate) {

                    if(_.isUndefined(searchDate)){
                        searchDate = GO.util.toMoment().year();
                    }

                    var intSearchDate = Number(searchDate);

                    this.$el.html(Tmpl({
                        preDate : intSearchDate -1,
                        nextDate : intSearchDate + 1,
                        searchDate : intSearchDate,
                        vacation : this.vacation.toJSON(),
                        histories : this.histories.toJSON(),
                        lang : lang,
                        isEmpty : this.histories.size() == 0 ? true : false,

                    }));
                    this.$el.find('header.content_top').html(new TitleView().render(VacationLang["내 연차 내역"]).el);
                    this.initDatePicker();
                    return this;
                },

                preDate : function(e){
                    var $el = $(e.currentTarget);
                    this.refresh($el.attr("data-date"));
                },

                nextDate : function(e){
                    var $el = $(e.currentTarget);
                    this.refresh($el.attr("data-date"));
                },

                refresh : function(searchDate){
                    var intSearchDate = Number(searchDate);
                    $("#preDate").attr("data-date", intSearchDate - 1);
                    $("#searchDate").attr("data-date", intSearchDate);
                    $("#searchDate").text(intSearchDate);
                    $("#nextDate").attr("data-date", intSearchDate + 1);
                    this.vacation.setYear(intSearchDate);
                    this.vacation.fetch({async : false});
                    this.histories.setYear(intSearchDate);
                    this.histories.fetch({async : false});
                    this.render(intSearchDate);
                },

                showCalendar : function(){
                    this.$el.find("#calBtn").focus();
                },

                initDatePicker : function(){
                    var $calendar = this.$el.find("#calBtn");
                    $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                    $calendar.datepicker({
                        dateFormat : "yy-mm-dd",
                        changeMonth: true,
                        changeYear : true,
                        yearSuffix: "",
                        onSelect: $.proxy(function( selectedDate ) {
                            var selectedYear = GO.util.toMoment(selectedDate).year();
                            this.refresh(selectedYear);
                        }, this)
                    });
                },

            });

            function privateFunc(view, param1, param2) {

            }

            return MyPage;

        });

})();