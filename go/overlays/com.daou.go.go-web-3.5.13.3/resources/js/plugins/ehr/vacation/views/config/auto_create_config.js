define("vacation/views/config/auto_create_config", function(require){

    var Backbone = require("backbone");
    var GO = require("app");
    var Tmpl = require("hgn!vacation/templates/config/auto_create_config");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require("i18n!nls/commons");
    require("GO.util");

    var AutoConfigModel = Backbone.Model.extend({
        url : GO.contextRoot + "api/ehr/vacation/company/autocreate",

        isYearBase : function(){
            return this.get("basePolicy") == "YEAR_BASE";
        },
        isHireDateBase : function () {
            return this.get("basePolicy") == "HIRE_DATE_BASE";
        },
        isUseAutoCreate : function(){
            return this.get("useAutoCreate");
        }
    });

    var lang = {
        "연차생성 기준" : VacationLang["연차생성 기준"],
        "회계연도 기준" : VacationLang["회계연도 기준"],
        "입사일자 기준" : VacationLang["입사일자 기준"],
        "기준일" : VacationLang["기준일"],
        "내년휴가 사용" : VacationLang["내년휴가 사용"],
        "연차시작하기" : VacationLang["연차시작하기"],
        "수정불가" : VacationLang["수정불가"],
        "해당 버튼을 클릭하면 연차 자동 생성이 시작되며,<br> 휴가 부여기준은 수정할 수 없습니다. 진행하시겠습니까?" : VacationLang["해당 버튼을 클릭하면 연차 자동 생성이 시작되며,<br> 휴가 부여기준은 수정할 수 없습니다. 진행하시겠습니까?"],
        "설정한 기준으로 연차를 시작하시겠습니까?" : VacationLang["설정한 기준으로 연차를 시작하시겠습니까?"],
        "연차생성기준타이틀" : VacationLang["연차생성기준타이틀"],
        "연차시작후설명" : VacationLang["연차시작후설명"],
        "연차시작설명" : VacationLang["연차시작설명"]
    };

    var AutoCreateConfig = Backbone.View.extend({
        events: {
            "change #base_policy_select": "toggle_base_policy",
            "click #btn_auto_create_config": "autoCreateConfig"
        },


        initialize: function () {
            this.$el.off();
            this.model = new AutoConfigModel();
            this.model.fetch();
            this.model.on("sync", $.proxy(function(){
                this.render();
            }, this));
        },

        render: function () {
            var self = this;
            this.$el.html(Tmpl({
                lang: lang,
                model: this.model.toJSON(),
                isYearBase: function () {
                    return self.model.isYearBase();
                },
                isHireDateBase: function () {
                    return self.model.isHireDateBase();
                }
            }));

            if (!_.isUndefined(this.model.get("useAutoCreate")) && !this.model.isUseAutoCreate()) {
                this.initDatePicker();
            }

            return this;
        },

        autoCreateConfig: function () {
            $.goConfirm(lang["설정한 기준으로 연차를 시작하시겠습니까?"], lang["해당 버튼을 클릭하면 연차 자동 생성이 시작되며,<br> 휴가 부여기준은 수정할 수 없습니다. 진행하시겠습니까?"], $.proxy(confirmOk, this));

            function confirmOk() {
                var basePolicy = this.$el.find("#base_policy_select").val();
                var baseYearDate = this.$el.find("#baseYearDate").val();

                this.model
                    .save({
                        basePolicy: basePolicy,
                        baseYearDate: baseYearDate
                    })
                    .done($.proxy(function () {
                        $.goMessage(CommonLang["저장되었습니다."]);
                        this.model.fetch();
                    }, this));
            }
        },

        initDatePicker: function () {
            // 아이콘으로만 구성된 캘린더에서 텍스트 입력창의 캘린더 있는 화면으로 이동시 캘린더 노출 안되는 현상 처리
            $("#ui-datepicker-div").remove();

            var $calendar = this.$el.find("#baseYearDate");
            $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
            $calendar.datepicker({
                dateFormat: "mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect: $.proxy(function (selectedDate) {

                }, this)
            });
        },

        toggle_base_policy: function () {
            this.$el.find("#baseYearDateArea").toggle();
        }
    });

    return AutoCreateConfig;
});