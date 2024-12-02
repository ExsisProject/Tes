define("vacation/views/company_manage_vacation_popup", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");
    var Tmpl = require("hgn!vacation/templates/company_manage_vacation_popup");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require('i18n!nls/commons');
    var _= require("underscore");
    require("jquery.inputmask");

    var lang = {
        "이름" : VacationLang["이름"],
        "입사일" : VacationLang["입사일"],
        "잔여 연차" : VacationLang["잔여 연차"],
        "발생 연차" : VacationLang["발생 연차"],
        "조정 연차" : VacationLang["조정 연차"],
        "조정연차" : VacationLang["조정연차"],
        "월차" : VacationLang["월차"],
        "선택" : VacationLang["선택"],
        "근속연차" : VacationLang["근속연차"],
        "1년 미만자 월차" : VacationLang["1년 미만자 월차"],
        "연차 수" : VacationLang["연차 수"],
        "추가" : VacationLang["추가"],
        "제외" : VacationLang["제외"],
        "사용기한" : VacationLang["사용기한"],
        "회계연도 또는 입사일 기준에 따라 적용됩니다" : VacationLang["회계연도 또는 입사일 기준에 따라 적용됩니다."],
        "내용" : VacationLang["내용"],
        "연차는 0.25 단위로 등록할 수 있습니다." : VacationLang["연차는 0.25 단위로 등록할 수 있습니다."],
        "재직1년이상 월차 에러메시지": VacationLang["재직1년이상 월차 에러메시지"],
        "연차 자동 생성" : VacationLang["연차 자동 생성"],
        "설정일" : VacationLang["설정일"],
        "단일 자동 생성 설명" : VacationLang["단일 자동 생성 설명"],
        "입사일 미입력" : VacationLang["입사일 미입력"],
        "다중 자동 생성 설명" : VacationLang["다중 자동 생성 설명"]
    };

    var TYPE = {
        "ALL" : "ALL",
        "SINGLE_SELECTED" : "SINGLE_SELECTED",
        "MULTI_SELECTED" : "MULTI_SELECTED"
    };


    var VacationQueryModel = Backbone.Model.extend({
        url : function(){
            return GO.contextRoot + "api/ehr/vacation/manage/" + this.id;
        },

        initialize : function(attr, option) {
            this.id = option.id;
        }
    });

    var AllModel = Backbone.Model.extend({
        url : GO.contextRoot + "api/ehr/vacation/company/points/all",
    });

    var SingleSelectedModel = Backbone.Model.extend({
        url : function(){
            return GO.contextRoot + "api/ehr/vacation/company/point/" + this.id;
        },

        initialize : function(attr, option) {
            this.id = option.id;
        }
    });

    var MultiSelectedModel = Backbone.Model.extend({
        url : GO.contextRoot + "api/ehr/vacation/company/points",

        initialize : function(attr, option) {
            this.ids = option.ids;
        }
    });

    var ModelFactory = {
        "ALL" : AllModel,
        "SINGLE_SELECTED" : SingleSelectedModel,
        "MULTI_SELECTED" : MultiSelectedModel,
        newInstance : function (type, option) {
            var model = this[type];
            if(_.isUndefined(model)){
                throw new Error("no found model type")
            }

            return new this[type](null, option);
        },
    };

    var CompanyManageVacationPopup = Backbone.View.extend({
        events: {
            "change [name='vacation_type']" : "changeVacationType",
            "change #operation" : "togglePeriod",
            "change #hire_date" : "onChangeHireDate",
            "click #autoCreateConfig" : "changeAutoCreateConfig"
        },

        initialize: function (type, options) {
            this.$el.off();
            this.type = TYPE[type];
            this.accountUseEhr = _.isUndefined(options) ? false : options.accountUseEhr;
            this.createHireDateTrial = false;

            if(_.isUndefined(this.type)){
                throw new Error("not found view type");
            }
            this.options = options;
            this.model = ModelFactory.newInstance(this.type, options);
            this.vacationType = "YEAR";

            if(this.isSingleSelected()){
                this.queryModel = new VacationQueryModel(null, options);
                this.queryModel.fetch({async: false});
            }
        },

        render: function () {
            var templateParam = {
                lang : lang,
                isUsePeriod : $.proxy(function(){
                    return !this.isYearType();
                }, this),
                isSingleSelected : this.isSingleSelected(),
                accountUseEhr : this.accountUseEhr
            };

            if(this.isSingleSelected()){
                templateParam["data"] = this.queryModel.toJSON();
                templateParam["data"]["autoCreateActivateInfo"]
                    = (templateParam["data"] && templateParam["data"]["autoCreateActivate"]) ? templateParam["data"]["autoCreateActivate"].toUpperCase() : "";
                templateParam["email"] = GO.session("email");
            }

            this.$el.html(Tmpl(templateParam));

            this.$el.find("#point").inputmask("numeric", {
                groupSeparator: ",",
                digits: 2,
                allowMinus: false,
                integerDigits: 2,
            });

            var now = GO.util.customDate(GO.util.now(), 'YYYY-MM-DD');

            if(this.isSingleSelected()) {
                var hireDate = this.queryModel.get("hireDate"); // 입사일 받아오는 부분으로 수정
                if(!this.accountUseEhr) {
                    this.initDatePicker(hireDate, this.$el.find("#hire_date"), false);
                }
            }
            var $expiredDate = this.$el.find("#expired_date");
            this.initDatePicker(now, $expiredDate, true);
            return this;
        },

        onChangeHireDate: function (e) {
            var previousHiredate = this.queryModel.get("hireDate");
            var updatedHireDate = this.$el.find("#hire_date").val() ? this.$el.find("#hire_date").val() : this.$el.find("#hire_date").text();
            if(!this.createHireDateTrial && !previousHiredate && updatedHireDate) {
                $("#autoCreateConfig").attr("class", "ic_control ic_ctrl_on");
                $("#autoCreateConfig").data("value", "on");
                this.createHireDateTrial = true;
            }
            this.setMaxDate();
        },

        toggle : function() {
            var operation = this.$el.find("#operation").val();
            var $period = this.$el.find("#vacation_period");
            var $yearDesc = this.$el.find("#vacation_year_desc");

            if(operation == "MINUS") {
                $yearDesc.hide();
                $period.hide();
                return;
            }

            if(this.isYearType()){
                $period.hide();
                $yearDesc.show();
            }else {
                $period.show();
                $yearDesc.hide();
            }

            if (this.isSingleSelected() && this.vacationType == 'YEAR') {
                this.$el.find('#restYearPoint').show();
                this.$el.find('#restMonthPoint').hide();
                this.$el.find('#restAdditionPoint').hide();
            } else if (this.isSingleSelected() && this.vacationType == 'MONTH') {
                this.$el.find('#restYearPoint').hide();
                this.$el.find('#restMonthPoint').show();
                this.$el.find('#restAdditionPoint').hide();
            } else if (this.isSingleSelected() && this.vacationType == 'ETC') {
                this.$el.find('#restYearPoint').hide();
                this.$el.find('#restMonthPoint').hide();
                this.$el.find('#restAdditionPoint').show();
            }
        },

        setMaxDate : function() {
            var $expiredDate = this.$el.find("#expired_date");
            var hireDate = this.$el.find('#hire_date').val() || GO.util.customDate(GO.util.now(), 'YYYY-MM-DD');
            var maxDate;
            if(this.isMonthType()){
                maxDate = moment(hireDate).add("years", 1).subtract("days", 1);
            }else if(this.isEtcType()){
                maxDate = GO.util.now().add("years", 1);
            }
            $expiredDate.datepicker("option", "maxDate", GO.util.customDate(maxDate, 'YYYY-MM-DD'));
        },

        togglePeriod : function() {
            this.toggle();
            this.setMaxDate();
        },

        isSingleSelected : function(){
            return this.type == TYPE.SINGLE_SELECTED;
        },

        isMultiSelected : function() {
            return this.type == TYPE.MULTI_SELECTED;
        },

        isYearType : function(){
            return this.vacationType == "YEAR";
        },

        isMonthType : function(){
            return this.vacationType == "MONTH";
        },

        isEtcType : function(){
            return this.vacationType == "ETC";
        },

        isNotYearType : function() {
            return !this.isYearType();
        },

        changeVacationType : function(e) {
            var $target = $(e.currentTarget);
            this.vacationType = $target.val();
            this.togglePeriod();
        },

        getData : function(){
            var data = {},
                $el = this.$el;

            if(this.isSingleSelected()){
                data.hireDate = $el.find("#hire_date").val() ? $el.find("#hire_date").val() : $el.find("#hire_date").text();
            }

            data.point = $el.find("#point").val();
            data.operation = $el.find("#operation").val();

            if(data.operation == "MINUS"){
                data.point *= -1;
            }

            data.type = $el.find("[name='vacation_type']:checked").val();

            if(this.isNotYearType()) {
                data.expiredDate = $el.find("#expired_date").val();
            }

            data.reason = $el.find("#reason").val();

            data.autoCreateActivate = $el.find("#autoCreateConfig").data("value") == "on" ? true : false;

            if(this.isMultiSelected()){
                return {
                    model : data,
                    ids : this.options.ids
                };
            }

            return data;
        },

        save : function(){
            var data = this.getData();
            this.validate(data);

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "로딩중");
            this.model.save(data, {method : "PUT"})
                .done($.proxy(function(){
                        this.trigger("save.success");
                    }, this)
                )
                .fail(function(response) {
                    if (response && response.responseJSON && response.responseJSON.message) {
                        $.goMessage(response.responseJSON.message);
                    } else {
                        $.goMessage(CommonLang['관리 서버에 오류가 발생하였습니다']);
                    }
                })
                .always(function(){
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                });
        },

        validate : function(data) {
            var message, point;

            if(this.isMultiSelected()){
                point = data.model.point;
            }else {
                point = data.point;
            }
            var max = moment(data.hireDate).add("years", 1).subtract("days", 1);
            var isAfter = GO.util.isAfter(GO.util.now(), max);

            if(this.isSingleSelected()) {
                if(data.autoCreateActivate && !data.hireDate) {
                    message = lang["입사일 미입력"];
                };
            }

            if (data.type === "MONTH" && !isAfter) {
               message = lang["재직1년이상 월차 에러메시지"]
            }

            if(point % 0.25 != 0){
                message = lang["연차는 0.25 단위로 등록할 수 있습니다."]
            }

            if(message) {
                $.goError(message);
                throw new Error(message);
            }
        },

        initDatePicker : function(initValue, $el, useMinDateFromNow, onSelect){
            $("#ui-datepicker-div").remove();

            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
            var params = {
                dateFormat : "yy-mm-dd",
                changeMonth: true,
                changeYear : true,
                yearSuffix: ""
            };

            if (useMinDateFromNow) {
                params["minDate"] = GO.util.customDate(GO.util.now(), 'YYYY-MM-DD');
            }

            $el.datepicker(params);
            $el.val(initValue);
        },

        changeAutoCreateConfig : function(e) {
            var target = $(e.currentTarget);
            var autoCreateConfig = target.data("value");
            if(autoCreateConfig == "on") {
                target.attr("class", "ic_control ic_ctrl_off");
                target.data("value", "off");
            } else {
                target.attr("class", "ic_control ic_ctrl_on");
                target.data("value", "on");
            }
        }

    });

    return CompanyManageVacationPopup;
});