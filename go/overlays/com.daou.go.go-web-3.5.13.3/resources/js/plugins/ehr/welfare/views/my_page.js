(function () {
    define([
            "backbone",
            "app",
            "hgn!welfare/templates/my_page",
            "i18n!welfare/nls/welfare",
            "i18n!nls/commons",
            "welfare/views/title",
            "welfare/models/user_welfare",
            "welfare/collections/user_histories"
        ],

        function (
            Backbone,
            GO,
            Tmpl,
            WelfareLang,
            CommonLang,
            TitleView,
            WelfareModel,
            HistoryCollection
        ) {

            var lang = {
                "년간 Point" : WelfareLang["년간 Point"],
                "사용 Point" : WelfareLang["사용 Point"],
                "조정 Point" : WelfareLang["조정 Point"],
                "남은 Point" : WelfareLang["남은 Point"],
                "사용일" : WelfareLang["사용일"],
                "사용 Point" : WelfareLang["사용 Point"],
                "거래처" : WelfareLang["거래처"],
                "분류" : WelfareLang["분류"],
                "이전" : CommonLang["이전"],
                "다음" : CommonLang["다음"],
                "날짜 이동" : WelfareLang["날짜 이동"],
                "복지포인트 데이터 없음" : WelfareLang["복지포인트 데이터 없음"]
            }

            var MyPage = Backbone.View.extend({
                events: {
                    "click #preDate" : "preDate",
                    "click #nextDate" : "nextDate",
                    "click #calArea" : "showCalendar"
                },

                initialize: function () {
                    var year = GO.util.toMoment().year();
                    this.welfare = new WelfareModel();
                    this.welfare.setYear(year);
                    this.welfare.fetch({async : false});

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
                        welfare : this.welfare.toJSON(),
                        histories : this.histories.toJSON(),
                        lang : lang,
                        isEmpty : this.histories.size() == 0 ? true : false,
                        convertNumber : function(){
                            return function(value){
                                return GO.util.numberWithCommas(this[value]);
                            }
                        }

                    }));
                    this.$el.find('header.content_top').html(new TitleView().render("내 복지포인트").el);
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
                    this.welfare.setYear(intSearchDate);
                    this.welfare.fetch({async : false});
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