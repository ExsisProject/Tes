define("admin/views/ehr/timeline/group/detail", function(require){

    var Backbone = require("backbone");
    var RestTimeRangeView = require("admin/views/ehr/timeline/group/rest_time_range");
    var NotiSettingsView = require("admin/views/ehr/timeline/group/noti/noti_settings");
    var Tmpl = require("hgn!admin/templates/ehr/timeline/group/detail");
    var CircleView = require("views/circle");
    var GroupModel = require("admin/models/ehr/timeline/group");
    var AdminLang = require("i18n!admin/nls/admin");
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var GO = require("app");
    var _ = require("underscore");
    require("jquery.go-popup");
    var InfoLayer= require("admin/views/info_layer");
    var WorkPlaceView = require("admin/views/ehr/timeline/group/work_place");

    var MAX_HOUR = 24;
    var MAX_MINUTE = 60;
    var MAX_SECOND = 60;

    var HOUR = _.range(0,MAX_HOUR).map(function(num){ return num < 10 ? "0"+num : num });
    var MINUTE = _.range(0,MAX_MINUTE).map(function(num){return num < 10 ? "0"+num : num });
    var SECOND = _.range(0,MAX_SECOND).map(function(num){return num < 10 ? "0"+num : num });

    var NOTI_LIST = {
        "FIXED_WORKING_TIME" : [
            "CLOCKIN", "CLOCKOUT",
            "OVER_TIME_40_BEFORE", "OVER_TIME_52_BEFORE", "REST_TIME"],

        "FLEXIBLE_WORKING_TIME" : ["OVER_TIME_40_BEFORE", "OVER_TIME_52_BEFORE", "REST_TIME"],

        "SELECTIVE_WORKING_TIME" : [
            "CLOCKIN", "CLOCKOUT", "REST_TIME",
            "OVER_TIME_MONTH_MINIMUM_BEFORE",
            "OVER_TIME_MONTH_MINIMUM_AFTER",
            "OVER_TIME_MONTH_EXTENSION_MAXIMUM_BEFORE",
            "OVER_TIME_MONTH_EXTENSION_MAXIMUM_AFTER"
        ]
    };

    var DetailView = Backbone.View.extend({
        events : {
            "change input:radio[name='workingTime']" : "changeWorkingType",
            "click #working_days button.btn_toggle" : "toggleWorkingDay",
            "click #device_check button.btn_toggle" : "toggleDeviceCheck",
            "click #save" : "save",
            "click .btn_wrap #remove" : "remove",
            "click .page_action #remove" : "removeGroup",
            "click #cancel" : "cancel",
            "click .onOffToggle": "onOffToggle",
        },

        initialize : function() {
            if(this.options.model){
                this.model = this.options.model;
            }else {
                this.model = new GroupModel();
            }

            this.extModel = this.options.extModel;
            this.restTimeRangeViews = this.makeRestPeriodViews(this.model);
            this.notiSettinsView = new NotiSettingsView({collection : this.model.get("notiSettings"), hideNotis : NOTI_LIST[this.model.getWorkingType()] });
            this.workPlaceView = new WorkPlaceView({group : this.model});
        },

        render : function () {
            var self = this;

            this.$el.html(Tmpl({
                AdminLang : AdminLang,
                CommonLang : CommonLang,
                TimeLineLang : TimelineLang,
                syncActive : this.extModel.get("syncActive"),
                HOUR : HOUR,
                MINUTE : MINUTE,
                SECOND : SECOND,
                isNew : this.model.isNew(),
                data : this.model.toJSON(),
                workDay : this.model.getWorkDay(),
                isFixedWorkingType : this.model.isFixedWorkingTimeType(),
                isFlexibleWorkingTimeType : this.model.isFlexibleWorkingTimeType(),
                isSelectiveWorkingTimeType : this.model.isSelectiveWorkingTimeType(),
                isWorkStartHour : function(){return self.model.isWorkStartHour(this);},
                isWorkStartMinute : function(){return self.model.isWorkStartMinute(this);},
                isWorkStartSecond : function(){return self.model.isWorkStartSecond(this);},
                isWorkEndHour : function(){return self.model.isWorkEndHour(this);},
                isWorkEndMinute : function(){return self.model.isWorkEndMinute(this);},
                isWorkEndSecond : function(){return self.model.isWorkEndSecond(this);},
                enableDutyTime : this.model.enableDutyTime(),
                isDutyStartHour : function(){return self.model.isDutyStartHour(this);},
                isDutyStartMinute : function(){return self.model.isDutyStartMinute(this);},
                isDutyStartSecond : function(){return self.model.isDutyStartSecond(this);},
                isDutyEndHour : function(){return self.model.isDutyEndHour(this);},
                isDutyEndMinute : function(){return self.model.isDutyEndMinute(this);},
                isDutyEndSecond : function(){return self.model.isDutyEndSecond(this);},
                isIgnoreBeforeStart : function(){return self.model.isIgnoreBeforeStart();},
                isIgnoreAfterStart : function(){return self.model.isIgnoreAfterStart();},
                isIgnoreAfterEnd : function(){return self.model.isIgnoreAfterEnd();},
                isAutoClockOutDisable : function () {return self.model.isAutoClockOutDisable()},
                isAutoClockOutFixedTime : function () {return self.model.isAutoClockOutFixedTime()},
                isAutoClockOutFixedTimeHour : function () {return self.model.isAutoClockOutFixedTimeHour(this)},
                isAutoClockOutFixedTimeMinute : function () {return self.model.isAutoClockOutFixedTimeMinute(this)},
                isAutoClockOutFixedTimeSecond : function () {return self.model.isAutoClockOutFixedTimeSecond(this)},
                isAutoClockOutRelativeTime : function () {return self.model.isAutoClockOutRelativeTime()},
                isAutoClockOutRelativeTimeHour : function () {return self.model.isAutoClockOutRelativeTimeHour(this)},
                isAutoClockOutRelativeTimeSecond : function () {return self.model.isAutoClockOutRelativeTimeSecond(this)},
                isNightStartHour : function(){return self.model.isNightStartHour(this);},
                isNightStartMinute : function(){return self.model.isNightStartMinute(this);},
                isNightStartSecond : function(){return self.model.isNightStartSecond(this);},
                isNightEndHour : function(){return self.model.isNightEndHour(this);},
                isNightEndMinute : function(){return self.model.isNightEndMinute(this);},
                isNightEndSecond : function(){return self.model.isNightEndSecond(this);},
                isMobileAllow : function(){return self.model.isMobileAllow()},
                useMobileGps : function () {return self.model.useMobileGps()},
                usePeriodSetting : function() {return self.model.usePeriodSetting()},
                isAccessBlack : function() {return self.model.isAccessBlack()},
                isAccessWhite : function() {return self.model.isAccessWhite()},
                isConsensusHoursPerDay : function() {return self.model.isConsensusHoursPerDay(this)},
                useWarningCheck : self.model.useWarningCheck(),
                privateIpAutoSave : self.model.usePrivateIpAutoSave(),
            }));

            this.renderRestTimeRange();
            this.renderPeriod();
            this.renderAccessUserView();
            this.renderExceptionUserView();
            this.renderNotiSettings();
            this.appendInfoLayer();
            this.renderWorkPlaceView();
        },

        renderWorkPlaceView : function() {
            this.$el.find("#workPlaceSetting").html(this.workPlaceView.$el);
            this.workPlaceView.render();
        },

        appendInfoLayer:function(){
            this.infoLayer = new InfoLayer(
                {
                    target:this.$el.closest('.admin_content').find('header.content_top > div'),
                    title:TimelineLang['근무 그룹 설명 타이틀'],
                    title_desc:TimelineLang['근무 그룹 설명 서브 타이틀'],
                    contents: [
                        {title:TimelineLang['근무 그룹 설정'],
                            sub_titles:[
                                {info:TimelineLang['근무 그룹 설정 설명 타이틀']}   ,
                                {info:TimelineLang['근무 그룹 설정 설명 타이틀B']}
                            ],
                            description:[
                                { info:TimelineLang['근무 그룹 설정 설명A']}, {info:TimelineLang['근무 그룹 설정 설명B']}
                            ]
                        },
                        {
                            title: TimelineLang['근무 일정'],
                            sub_titles: [
                                {info: TimelineLang['근무일정 타이틀']},
                            ],
                            description: [
                                {info: TimelineLang['근무일정 설명A']}, {info: TimelineLang['근무일정 설명B']}, {info: TimelineLang['근무일정 설명C']},
                            ]
                        },
                        {
                            title: TimelineLang['근무시간 산정'],
                            sub_titles: [
                                {info: TimelineLang['근무시간 산정 타이틀A']}, {info: TimelineLang['근무시간 산정 타이틀B']},
                            ],
                            description: [
                                {info: TimelineLang['근무시간 설명A']}, {info: TimelineLang['근무시간 설명B']},
                            ]
                        },
                        {
                            title: TimelineLang['추가 관리기능'],
                            sub_titles: [
                            ],
                            description: [
                                {info: TimelineLang['추가 관리기능 설명A']}, {info: TimelineLang['추가 관리기능 설명B']},
                                {info: TimelineLang['추가 관리기능 설명C']}, {info: TimelineLang['추가 관리기능 설명D']},
                            ]
                        }

                    ]
                }
            );
            this.infoLayer.render();
        },

        makeRestPeriodViews : function(model){
            return _.chain(model.get("restperiods"))
                .map(function (restPeriod) {
                    return new RestTimeRangeView({data : restPeriod});
                }).value()
        },

        save : function() {
            var self = this;
            this.model.save(this.getVariable(),{
                success : function(model, response) {
                    if(response.code == '200') {
                        $.goMessage(CommonLang["저장되었습니다."]);

                        GO.EventEmitter.trigger('timeline', 'changed:groups', "");
                        GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        self.trigger("change", model.get("originGroupId"))
                    }
                },
                error : function(model, response) {
                    $.goMessage(CommonLang["저장에 실패 하였습니다."]);
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                }
            });
        },

        removeGroup : function() {
            var self = this;
            $.goConfirm(CommonLang['삭제하시겠습니까?'],"",
                _.bind(function() {
                    this.model.destroy({
                        success: function() {
                            GO.EventEmitter.trigger('timeline', 'changed:groups', "");
                            $.goMessage(CommonLang["삭제되었습니다."]);
                            self.trigger("deleted");
                        }
                    });
                }, this));
        },

        cancel : function() {
            $.goMessage(CommonLang["취소되었습니다."]);
            this.restTimeRangeViews = this.makeRestPeriodViews(this.model);
            this.render();
        },

        renderNotiSettings : function() {
            this.$el.find("#noti_setting").html(this.notiSettinsView.$el);
            this.notiSettinsView.render();
        },

        renderRestTimeRange : function() {
            var $restTimeRange = this.$el.find("#restTimeRange");

            $restTimeRange.empty();

            _.chain(this.restTimeRangeViews)
                .map(function(restTimeRangeView, index) {
                    $restTimeRange.append(restTimeRangeView.$el);
                    var deletable = index > 0;
                    restTimeRangeView.render(deletable);

                    attachListenerEvent.call(this, restTimeRangeView);

                    function attachListenerEvent(restTimeRangeView){
                        // TODO : 추가는 최대 5개 까지 가능
                        restTimeRangeView.on("add", function(item){
                            var addedTimeRageView = new RestTimeRangeView();
                            $(item.$el).after(addedTimeRageView.$el);
                            addedTimeRageView.render(true);
                            this.restTimeRangeViews.splice(this.restTimeRangeViews.indexOf(item) + 1, 0, addedTimeRageView);

                            attachListenerEvent.call(this, addedTimeRageView);
                        }, this);
                        restTimeRangeView.on("remove", function(item){
                            if(this.restTimeRangeViews.length < 2){
                                $.goError(AdminLang["최소 1개는 존재해야 합니다."]);
                                throw new Error(AdminLang["최소 1개는 존재해야 합니다."]);
                            }
                            this.restTimeRangeViews = _.without(this.restTimeRangeViews, item);
                        }, this);
                    };
                }, this)
                .value();
        },

        renderPeriod: function() {
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
            var startDate = this.$el.find('#startDate');
            var endDate = this.$el.find('#endDate');

            if (this.model.isNew()) {
                startDate.val(GO.util.now().format("YYYY-MM-DD"));
                endDate.val(GO.util.now().format("YYYY-MM-DD"));
            } else {
                startDate.val(this.model.getPeriodStartDate());
                endDate.val(this.model.getPeriodEndDate());
            }

            startDate.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect : function(selectedDate){
                    endDate.datepicker( "option", "minDate", selectedDate );
                }
            });

            endDate.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onSelect : function(selectedDate){
                    startDate.datepicker( "option", "maxDate", selectedDate );
                }
            });
        },

        renderAccessUserView: function() {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if(GO.util.isUseOrgService(true)){
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            this.accessTarget = new CircleView({
                selector: '#groupAccessUser',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("circleSetting")['accessTarget'],
                nodeTypes: nodeTypes
            });
            this.accessTarget.render();
        },

        renderExceptionUserView: function() {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if(GO.util.isUseOrgService(true)){
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            this.exceptionTarget = new CircleView({
                selector: '#groupExceptionUser',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("circleSetting")['exceptionTarget'],
                nodeTypes: nodeTypes
            });
            this.exceptionTarget.render();
        },

        changeWorkingType : function(e){
            var workingType = $(e.currentTarget).val();
            var $timeFixedOption = this.$el.find("[data-option='timeFixed']");
            var $selectiveType = this.$el.find('[data-option="selectiveOption"]');
            if (workingType == "FLEXIBLE_WORKING_TIME"){
                $timeFixedOption.hide();
                $selectiveType.hide();
            } else if (workingType == "SELECTIVE_WORKING_TIME") {
                $timeFixedOption.show();
                $selectiveType.show();
            } else {
                $timeFixedOption.show();
                $selectiveType.hide();
            }
            this.notiSettinsView.renderNotiList(NOTI_LIST[workingType]);
        },

        toggleWorkingDay : function(e) {
            $(e.currentTarget).toggleClass("on");
        },

        toggleDeviceCheck : function(e){
            var $currentTarget = $(e.currentTarget);
            var type = $currentTarget.data("type");

            if(type == "PC_WEB"){
                return;
            }

            $currentTarget.toggleClass("on");
            if(!$currentTarget.hasClass("on")) {
                this.$el.find("#useMobileGps").removeAttr('checked');
            }
            this.$el.find("#useGpsArea").toggle();
        },
        getVariable : function(){
            var $el = this.$el;
            var variable = {};
            variable["oldGroupId"] = "";
            variable["name"] = $el.find("#group_name").val();
            variable["description"] = $el.find("#groupDesc").val();
            variable["workingType"] = $el.find("input[name='workingTime']:checked").val();
            variable["consensusHoursPerDay"] = $el.find("#consensusHoursPerDay").val();
            setFixedOptionIfFixedWorkingTimeType(variable);

            variable["usagePeriod"] = {
                usePeriodSetting : $el.find("#usePeriodSetting").is(":checked"),
                startDate : this.model.isDefaultGroup() ? null : GO.util.toISO8601(GO.util.toMoment($el.find("#startDate").val())),
                endDate : this.model.isDefaultGroup() ? null : GO.util.toISO8601(GO.util.toMoment($el.find("#endDate").val()).add(1, 'days').add(-1, 'seconds'))
            };
            variable["restperiods"] = _.chain(this.restTimeRangeViews).map(function(view){return view.getVariable()}).value();
            variable["circleSetting"] = {
                "accessSetting" : $el.find("input[name='accessSetting']:checked").val(),
                "accessTarget" : this.accessTarget.getData(),
                "exceptionTarget" : this.exceptionTarget.getData()
            };
            variable["deviceSetting"] = {
                "allowDevice" : _.chain($el.find("#device_check button.on"))
                    .map(function(el){
                        return $(el).data("type");
                    }).value(),
                "useMobileGps" : $el.find("#useMobileGps").is(":checked"),
                "privateIpAutoSave" : $el.find("#privateIpAutoSave").is(".on")
            };
            variable["notiSettings"] = this.notiSettinsView.getData(getExcludeNoti());
            variable["workPlaces"] = this.workPlaceView.getSelectedWorkPlaces();
            variable["warningCheck"] = $el.find('#useWarningCheck').is(".on");

            return variable;
            function getExcludeNoti() {
                var workingType = variable["workingType"];
                if(workingType  == "FLEXIBLE_WORKING_TIME") {
                    return ["CLOCKIN", "CLOCKOUT",
                        "OVER_TIME_MONTH_MINIMUM_BEFORE", "OVER_TIME_MONTH_MINIMUM_AFTER",
                        "OVER_TIME_MONTH_EXTENSION_MAXIMUM_BEFORE", "OVER_TIME_MONTH_EXTENSION_MAXIMUM_AFTER"];

                } else if (workingType  == "SELECTIVE_WORKING_TIME") {
                    return ["OVER_TIME_40_BEFORE", "OVER_TIME_52_BEFORE"];

                } else if (workingType  == "FIXED_WORKING_TIME") {
                    return ["OVER_TIME_MONTH_MINIMUM_BEFORE", "OVER_TIME_MONTH_MINIMUM_AFTER",
                        "OVER_TIME_MONTH_EXTENSION_MAXIMUM_BEFORE", "OVER_TIME_MONTH_EXTENSION_MAXIMUM_AFTER"];

                } else {
                    return [];
                }
            }

            function setFixedOptionIfFixedWorkingTimeType(variable) {
                if (variable["workingType"] == "FLEXIBLE_WORKING_TIME") {
                    variable["fixedOption"] = {
                        "workDay": JSON.stringify(_.chain(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
                            .map(function(day){
                                var result = {};
                                result[day] = $el.find("#working_days button[name="+day+"]").hasClass('on');
                                return result;
                            }).reduce(function(value1, value2){
                                return _.extend(value1, value2);
                            }).value())
                    }
                    return;
                }
                var isSelectiveType = variable["workingType"] == "SELECTIVE_WORKING_TIME";

                variable["fixedOption"] = {
                    "workDay": JSON.stringify(_.chain(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
                        .map(function(day){
                            var result = {};
                            result[day] = $el.find("#working_days button[name="+day+"]").hasClass('on');
                            return result;
                        }).reduce(function(value1, value2){
                            return _.extend(value1, value2);
                        }).value()),
                    "autoSetWorkTime": {
                        "ignoreBeforeStart": $el.find("#ignoreBeforeStart").is(":checked"),
                        "ignoreAfterStart": $el.find("#ignoreAfterStart").is(":checked"),
                        "ignoreAfterEnd": $el.find("#ignoreAfterEnd").is(":checked")
                    },
                    "workTimeRange": {
                        "workStartTime": $el.find("#workStartHour").val() + ":" + $el.find("#workStartMinute").val()+ ":" + $el.find("#workStartSecond").val(),
                        "workEndTime": $el.find("#workEndHour").val() + ":" + $el.find("#workEndMinute").val() + ":" + $el.find("#workEndSecond").val(),
                        "enableDutyTime" : !isSelectiveType ? null : $el.find('#enableDutyTime').is(":checked"),
                        "dutyStartTime": !isSelectiveType ? null : $el.find("#dutyStartHour").val() + ":" + $el.find("#dutyStartMinute").val()+ ":" + $el.find("#dutyStartSecond").val(),
                        "dutyEndTime": !isSelectiveType ? null : $el.find("#dutyEndHour").val() + ":" + $el.find("#dutyEndMinute").val()+ ":" + $el.find("#dutyEndSecond").val(),
                        "nightStartTime": $el.find("#nightStartHour").val() + ":" + $el.find("#nightStartMinute").val()+ ":" + $el.find("#nightStartSecond").val(),
                        "nightEndTime": $el.find("#nightEndHour").val() + ":" + $el.find("#nightEndMinute").val()+ ":" + $el.find("#nightEndSecond").val()
                    },
                    "autoClockOut": {
                        "type": $el.find("input:radio[name='timelineAutoClockOut']:checked").val(),
                        "fixedTime" : $el.find("#autoClockOutfixedTimeHour").val() + ":" + $el.find("#autoClockOutfixedTimeMinute").val()+ ":" + $el.find("#autoClockOutfixedTimeSecond").val(),
                        "relativeHour" : $el.find("#autoClockOutRelativeTimeHour").val()
                    }
                };
            }
        },

        onOffToggle : function(e) {
            var target = $(e.currentTarget);
            if(!target.hasClass('on')) {
                target.closest(".wrap_btn_toggle").find('.on').removeClass('on');
                target.addClass('on');
            }
        },

    });

    return DetailView;
});
