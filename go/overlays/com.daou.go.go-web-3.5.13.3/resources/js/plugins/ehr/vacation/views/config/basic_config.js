define("vacation/views/config/basic_config", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");
    var Tmpl = require("hgn!vacation/templates/config/basic_config");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require("i18n!nls/commons");
    require("jquery.inputmask");

    var ManageConfig = Backbone.Model.extend({
        model: Backbone.Model,
        url: GO.contextRoot + "api/ehr/vacation/manage/config"
    });

    var lang = {
        "기본 설정" : VacationLang["기본 설정"],
        "내년휴가 사용" : VacationLang["내년휴가 사용"],
        "부서장 연차현황 공개" : VacationLang["부서장 연차현황 공개"],
        "부서장 연차현황 공개 설명" : VacationLang["부서장 연차현황 공개 설명"],
        "허용" : CommonLang["허용"],
        "허용하지 않음" : CommonLang["허용하지 않음"],
        "저장": CommonLang["저장"],
        "취소": CommonLang["취소"],
        "ID(계정)": VacationLang["ID(계정)"],
        "근속연수": VacationLang["근속연수"],
        "발생 연차": VacationLang["발생 연차"],
        "이름": CommonLang["이름"],
        "saveFail": CommonLang["저장에 실패 하였습니다."],
        "값을 입력해 주세요": CommonLang["값을 입력해 주세요"],
        "휴가일수는 0.5 단위로 입력해 주세요": VacationLang["휴가일수는 0.5 단위로 입력해 주세요"],
        "행추가": VacationLang["행추가"],
        "행삭제": VacationLang["행삭제"],
        "근속연수별 연차 설정" : VacationLang["근속연수별 연차 설정"],
        "년차" : VacationLang["년차"]
    };

    var Manage = Backbone.View.extend({
        events: {
            "click #btn_ok" : "save",
            "click #btn_cancel" : "cancel",
            "click #add_col": "addColumn",
            "click #remove_col": "removeColumn",
            "focusout input.points": "checkDecimal",
            "click #useNextVacation button, #deptManageOpen button" : "toggleButton"
        },

        initialize: function () {
            this.model = new ManageConfig();
        },

        render: function () {
            this.model.fetch({async : false});
            this.$el.html(Tmpl({
                lang : lang,
                model : this.model.toJSON()
            }));

            this.$el.find("input.points").inputmask("numeric", {
                groupSeparator: ",",
                digits: 1,
                allowMinus: false,
                integerDigits: 2
            });

            return this;
        },

        save : function(){
            this.model.set({
                "companyConfig" : {
                    "useNextVacation" : this.$el.find("#useNextVacation button.on").val(),
                    "deptManageOpen" : this.$el.find("#deptManageOpen button.on").val()
                },
                "yearPoints" :
                    _.chain(this.$el.find("#working_year_list input"))
                        .map(function(el){
                            var $el = $(el);
                            return { "workingYear" : $el.data("year"), "points" : $el.val() }
                        }).value()
            });

            try {
                this.validate();
            } catch (e) {
                $.goError(e.message);
                return;
            }

            var self = this;
            this.model.save({}, {
                success : function(){
                    $.goMessage(CommonLang["저장되었습니다."]);
                    self.render();
                },
                error : function(model, response){
                    if (response && response.responseJSON && response.responseJSON.message) {
                        $.goError(response.responseJSON.message);
                    } else {
                        $.goError(CommonLang["500 오류페이지 내용"]);
                    }
                }
            });
        },

        toggleButton : function(e) {
            var $currentTarget = $(e.currentTarget);
            $currentTarget.closest("span").find("button").removeClass("on");
            $currentTarget.addClass("on");
        },

        cancel : function(){
            $.goAlert(CommonLang["취소되었습니다."]);
            this.render();
        },

        addColumn: function () {
            var year = this.$el.find("#working_year_list div.tb_content").length + 1;

            var tmpl = ['<div class="tb_content">',
                        '    <span class="txt">'+ year +" "+ lang["년차"]+'</span>',
                        '    <span class="wrap_txt">',
                        '        <input class="txt wfix_small points" data-year="'+ year +'" name="" value="">',
                        '    </span>',
                        '</div>'];

            this.$el.find("#working_year_list").append(tmpl.join(""));

            $("input.points").inputmask("numeric", {
                groupSeparator: ",",
                digits: 1,
                allowMinus: false,
                integerDigits: 2
            });
        },

        removeColumn: function () {
            this.$el.find("#working_year_list").find("div.tb_content:last").remove();
        },

        validate: function () {
            this.model.get("yearPoints").forEach(function(yearPoint){
                if(!yearPoint.points){
                    throw new Error(lang["값을 입력해 주세요"]);
                }
            });
        },
        checkDecimal: function (e) {
            var target = $(e.target);
            if (target.val() % 0.5 != 0) {
                $.goError(lang["휴가일수는 0.5 단위로 입력해 주세요"]);
                target.val("");
                target.focus();
            }
        }
    });

    return Manage;

});