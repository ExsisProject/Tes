define("vacation/views/dept_vacation_histories", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var ProfileView = require("views/profile_card");
    var Tmpl = require("hgn!vacation/templates/dept_vacation_histories");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var TitleView = require("vacation/views/title");
    require("GO.util");
    require("jquery.go-grid");

    var lang = {
        "부서 연차현황": VacationLang["부서 연차현황"],
        "이름": CommonLang["이름"],
        "부서명": CommonLang["부서명"],
        "입사일": VacationLang["입사일"],
        "퇴사일": VacationLang["퇴사일"],
        "근속연수": VacationLang["근속연수"],
        "발생 연차": VacationLang["발생 연차"],
        "1년 미만 발생 월차": VacationLang["1년 미만 발생 월차"],
        "1년 미만 이월 월차": VacationLang["1년 미만 이월 월차"],
        "조정 연차": VacationLang["조정 연차"],
        "총연차": VacationLang["총연차"],
        "사용 연차": VacationLang["사용 연차"],
        "잔여 연차": VacationLang["잔여 연차"],
        "상태": CommonLang["상태"],

        "목록 다운로드": CommonLang["목록 다운로드"],
        "목록없음": AdminLang["목록없음"],
        "발생 월차" : VacationLang["발생 월차"],
        "이월 월차" : VacationLang["이월 월차"]
    };

    var MyPage = Backbone.View.extend({
        events: {
            "click #downloadList": "downloadList",
            "click [data-profile]": "showProfile",
            "click #preDate": "preDate",
            "click #nextDate": "nextDate",
            "click #baseDate": "showCalendar"
        },

        initialize: function (options) {
            this.deptId = options.deptId;
            this.baseDate = GO.util.customDate(GO.util.toMoment(), 'YYYY-MM-DD');
        },

        getDisplayBaseDate : function(){
            return moment(this.baseDate).format("YYYY.MM.DD");
        },

        render: function () {

            this.$el.html(Tmpl({
                displayBaseDate : this.getDisplayBaseDate(),
                baseDate: this.baseDate,
                lang: lang

            }));
            this.$el.find('header.content_top').html(new TitleView().render(lang["부서 연차현황"]).el);

            this.renderList();

            this.initDatePicker();
            return this;
        },

        renderList: function () {
            var url = GO.contextRoot + "api/ehr/vacation/stat/dept/" + this.deptId;
            var self = this;
            this.list = $.goGrid({
                el: this.$el.find('#vacation_list'),
                method: 'GET',
                pageUse: false,
                sDomUse: false,
                destroy: true,
                displayLength: 999,
                url: url,
                params: {
                    'baseDate': moment(this.baseDate).format("YYYY-MM-DD")
                },
                emptyMessage: "<p class='data_null'> " +
                "<span class='ic_data_type ic_no_data'></span>" +
                "<span class='txt'>" + lang["목록없음"] + "</span>" +
                "</p>",
                checkbox: false,
                columns: [
                    {
                        mData: null, sWidth: '', sClass: "userName", bSortable: true, fnRender: function (obj) {
                            if (obj.aData.userName) {
                                return '<a data-profile data-id=' + obj.aData.userId + '>' + obj.aData.userName + " " + (obj.aData.positionName ? obj.aData.positionName : '') + '</a>';
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.hireDate) {
                                return obj.aData.hireDate;
                            }
                            return '-';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.workingYear != null && obj.aData.workingYear != undefined) {
                                return obj.aData.workingYear;
                            }
                            return '';
                        }
                    },

                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.workingYearPoint != null && obj.aData.workingYearPoint != undefined) {
                                return obj.aData.workingYearPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.publishedMonthPoint != null && obj.aData.publishedMonthPoint != undefined) {
                                return obj.aData.publishedMonthPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.carriedMonthPoint != null && obj.aData.carriedMonthPoint != undefined) {
                                return obj.aData.carriedMonthPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.modifiedPoint != null && obj.aData.modifiedPoint != undefined) {
                                return obj.aData.modifiedPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.sumPoint != null && obj.aData.sumPoint != undefined) {
                                return obj.aData.sumPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.usedPoint != null && obj.aData.usedPoint != undefined) {
                                return obj.aData.usedPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.restPoint != null && obj.aData.restPoint != undefined) {
                                return obj.aData.restPoint;
                            }
                            return '';
                        }
                    },
                    {
                        mData: null, sWidth: '', sClass: "", bSortable: false, fnRender: function (obj) {
                            if (obj.aData.userStatus && obj.aData.userStatus != undefined) {
                                return obj.aData.userStatus;
                            }
                            return '';
                        }
                    },
                ],
                fnDrawCallback: function (obj, oSettings, listParams) {
                    $(window).scrollTop(0);
                    self.$el.find('#vacation_list tbody tr').click(function (e) {
                        var $el = $(e.target);
                        if ($el.is('a')||$el.is("span.ic_no_data")) return;
                        var userId = $el.closest("tr").find('a').attr('data-id');
                        window.open("/app/ehr/vacation/"+userId, userId,"scrollbars=yes,resizable=yes,width=1280,height=640");
                    });

                }
            })
        },

        downloadList: function () {
            window.location.href = GO.contextRoot + "api/ehr/vacation/stat/dept/csv/"+this.deptId+"?baseDate="+this.baseDate;
        },

        preDate: function () {
            this.changeDate(-1)
        },

        changeDate : function(date){
            var $baseDate = this.$el.find("#baseDate");
            this.baseDate = moment($baseDate.data("date")).add("days", date).format("YYYY-MM-DD");
            $baseDate.data("date", this.baseDate);
            $baseDate.text(this.getDisplayBaseDate());

            this.refresh();
        },

        nextDate: function (e) {
            this.changeDate(1);
        },

        refresh: function () {
            this.list.tables.customParams = {baseDate: this.baseDate};
            this.list.tables.fnClearTable();
        },

        showCalendar: function () {
            this.$el.find("#baseDatePicker").focus();
        },

        initDatePicker: function () {
            var baseDatePicker = this.$el.find("#baseDatePicker");
            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            baseDatePicker.datepicker({
                dateFormat: "yy.mm.dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect: $.proxy(function (selectedDate) {
                    this.baseDate = moment(selectedDate, "YYYY-MM-DD").format("YYYY-MM-DD");
                    this.$el.find("#baseDate").data("date", this.baseDate);
                    this.$el.find("#baseDate").text(this.getDisplayBaseDate());
                    this.refresh();
                }, this)
            });
        },
        showProfile: function (e) {
            e.stopPropagation();
            var target = e.currentTarget;
            var userId = $(target).attr("data-id");
            if (!userId) return;
            ProfileView.render(userId, target);
        }
    });


    return MyPage;

});

