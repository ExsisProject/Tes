define("admin/views/ehr/common/ehr_basic_config", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");

    var Tmpl = require("hgn!admin/templates/ehr/common/ehr_basic_config");
    var EhrBasicConfigModel = require("admin/models/ehr_basic_config_model");
    var AddMemberTmpl = require("hgn!approval/templates/add_org_member");
    var CircleView = require("views/circle");

    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var TimelineLang = require("i18n!timeline/nls/timeline");

    require("GO.util");
    require("jquery.go-orgslide");

    var lang = {
        label_ok: CommonLang['저장'],
        label_cancel: CommonLang['취소'],
        label_defaultSetting: AdminLang['기본 설정'],
        label_timeline: AdminLang["근태관리"],
        label_vacation: AdminLang["연차관리"],
        label_welfare: AdminLang["복지포인트"],
        label_hrCard: AdminLang["인사카드"],
        label_setting: AdminLang["근태관리 설정"],
        label_manager: AdminLang["운영자"],
        label_menuActive: AdminLang['메뉴 활성화 여부'],
        label_add_manager: AdminLang["운영자 추가"],
        label_attendance_fix_permissions: AdminLang["근태 수정 권한"],
        label_item: AdminLang["항목"],
        label_fix_permissions: AdminLang["등록/수정 권한"],
        label_time: AdminLang["시간"],
        label_status: AdminLang["타임라인 상태"],
        label_timeline_status_tooltip: AdminLang["타임라인 상태 툴팁"],
        label_chief: AdminLang["부서장"],
        label_vice_chief: AdminLang["부부서장"],
        label_member: AdminLang["부서원(본인)"],
        label_open_state: TimelineLang["부서 근태 현황통계"],
        label_open_state_stats: AdminLang["부서 현황 및 통계 공개"],
        label_open_state_caption: TimelineLang["부서 근태 현황통계 설명"],
        label_actionLogs: CommonLang['변경이력'],
        label_use_charge_history_tooltip: AdminLang["변경이력 사용여부 툴팁"],
        label_use: AdminLang["사용"],
        label_no_use: AdminLang["사용안함"],
        label_modify: AdminLang["수정"],
        label_sync_noti: AdminLang["근태동기화 경고"],
        label_restrict_setting: AdminLang["동기화 데이터 수정제한 설정"],
        label_restrict_desc: AdminLang["근태관리 동기화 설명"],
        label_timeline_sync: AdminLang["근태관리 연동"],
        label_restrict_guide: AdminLang["가이드"],
        label_sync_data: AdminLang["동기화 데이터"],
        label_modify_restrict: AdminLang["수정 제한"],
        label_working_status_setting: TimelineLang["근태정보 노출 설정"],
        label_working_status_setting_tooltip: TimelineLang["근태정보 노출 설정 툴팁"],
        label_display_working_status: TimelineLang["근태정보 노출 기능 사용"],
        label_display_working_status_range: TimelineLang["근태정보 노출 기능"],
        label_display_vacation_range: TimelineLang["연차정보 노출 기능"],
        label_all: AdminLang["전체 허용"],
        label_partial: AdminLang["일부만 허용"]
    };

    var AttndDefault = Backbone.View.extend({
        events: {
            "click .onOffToggle": "onOffToggle",
            "click .onOffChange": "onOffChange",
            "click .addAdmin": "showOrgSlide",
            "click .ic_del": "removeManager",
            "click #saveBasicSetting": "saveBasicSetting",
            "click #cancelBasicSetting": "cancelBasicSetting",
            "click span#restrictGuide": "showPopupGuideLayer",
            "click #activeSync": "inactiveTimePermission",
            "click #deactivateSync": "activeTimePermission",
            "click input[name='workingStatus']": "toggleDisplayTimeline",
            "click input[name='statusRange']": "changeRangeOfDisplayWorkingStatus",
            "click input[name='vacationRange']": "changeRangeOfDisplayVacation"
        },

        initialize: function () {
            this.model = new EhrBasicConfigModel();
        },

        render: function () {
            this.model.fetch({async: false});
            this.$el.html(Tmpl({
                lang: lang,
                data: this.model.toJSON(),
                timeEditAuthData: $.parseJSON(this.model.get('timeEditAuth')),
                statusEditAuthData: this.model.get('statusEditAuth'),
                serviceAdminMode: this.isServiceMode,
                isSaaS: GO.session().brandName == "DO_SAAS",
                timelineDisplaySettingModel: this.model.get('timelineDisplaySettingModel')
            }));
            this.createCircleView();

            return this;
        },
        createCircleView: function () {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if (GO.util.isUseOrgService(true)) {
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            this.statusClassSelectorView = new CircleView({
                selector: '#statusDisplaySettingModel',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('timelineDisplaySettingModel').statusCircle,
                nodeTypes: nodeTypes
            });
            this.vacationClassSelectorView = new CircleView({
                selector: '#vacationDisplaySettingModel',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('timelineDisplaySettingModel').vacationCircle,
                nodeTypes: nodeTypes
            });

            this.statusClassSelectorView.render();
            this.vacationClassSelectorView.render();
            this.toggleDisplayTimeline();
            this.changeRangeOfDisplayWorkingStatus();
            this.changeRangeOfDisplayVacation();
        },
        toggleDisplayTimeline: function () {
            var displayWorkingStatus = this.$el.find('input[name="workingStatus"]:checked').val();
            if (displayWorkingStatus == "true") {
                this.$el.find('#timelineDisplayOption').show();
            } else {
                this.$el.find('#timelineDisplayOption').hide();
            }
            this.toggleDisplayWorkingStatus();
            this.toggleDisplayVacation();
        },
        toggleDisplayWorkingStatus: function () {
            var displayWorkingStatus = this.$el.find('input[name="workingStatus"]:checked').val();
            var $ranges = this.$el.find('input[name="statusRange"]');
            if (displayWorkingStatus == "true") {
                _.forEach($ranges, function (el) {
                    $(el).removeAttr('disabled');
                });
                this.changeRangeOfDisplayWorkingStatus();
            } else {
                _.forEach($ranges, function (el) {
                    $(el).attr('disabled', 'true');
                });
                this.statusClassSelectorView.hide();
            }
        },
        toggleDisplayVacation: function () {
            var displayWorkingStatus = this.$el.find('input[name="workingStatus"]:checked').val();
            var $ranges = this.$el.find('input[name="vacationRange"]');
            if (displayWorkingStatus == "true") {
                _.forEach($ranges, function (el) {
                    $(el).removeAttr('disabled');
                });
                this.changeRangeOfDisplayVacation();
            } else {
                _.forEach($ranges, function (el) {
                    $(el).attr('disabled', 'true');
                });
                this.vacationClassSelectorView.hide();
            }
        },
        changeRangeOfDisplayWorkingStatus: function () {
            var rangeOfDisplay = this.$el.find('input[name="statusRange"]:checked').val();
            if (rangeOfDisplay == "true") {
                this.statusClassSelectorView.hide();
            } else {
                this.statusClassSelectorView.show();
            }
        },
        changeRangeOfDisplayVacation: function () {
            var rangeOfDisplay = this.$el.find('input[name="vacationRange"]:checked').val();
            if (rangeOfDisplay == "true") {
                this.vacationClassSelectorView.hide();
            } else {
                this.vacationClassSelectorView.show();
            }
        },
        onOffToggle: function (e) {
            var target = $(e.currentTarget);
            if (!target.hasClass('on')) {
                target.closest(".wrap_btn_toggle").find('.on').removeClass('on');
                target.addClass('on');
            }
        },

        onOffChange: function (e) {
            var target = $(e.currentTarget);
            if (!target.hasClass('on')) {
                target.addClass('on');
            } else {
                target.removeClass('on');
            }
        },

        showOrgSlide: function (e) {
            $.goOrgSlide({
                header: AdminLang["운영자 추가"],
                desc: '',
                callback: $.proxy(function (data) {
                    this.addAdmin(data, e);
                }, this),
                target: e,
                isAdmin: true,
                contextRoot: GO.contextRoot
            });
        },

        addAdmin: function (data, e) {
            var targetEl = $(e.currentTarget).closest("ul");
            if (data && !targetEl.find('li[data-id="' + data.id + '"]').length) {
                targetEl.find('li.addAdmin').before(AddMemberTmpl(data));
            } else {
                $.goMessage(commonLang['이미 선택되었습니다.']);
            }
        },
        createTimelineDisplaySettingModel: function () {
            var timelineDisplaySettingModel = {};
            timelineDisplaySettingModel.enable = this.$el.find('input[name="workingStatus"]:checked').val() === "true";
            timelineDisplaySettingModel.permitAllStatus = this.$el.find('input[name="statusRange"]:checked').val() === "true";
            timelineDisplaySettingModel.permitAllVacation = this.$el.find('input[name="vacationRange"]:checked').val() === "true";
            timelineDisplaySettingModel.statusCircle = timelineDisplaySettingModel.permitAllStatus ? {} : this.statusClassSelectorView.getData();
            timelineDisplaySettingModel.vacationCircle = timelineDisplaySettingModel.permitAllVacation ? {} : this.vacationClassSelectorView.getData();
            if (!this.isValidStatusDisplaySetting(timelineDisplaySettingModel)) {
                timelineDisplaySettingModel.permitAllStatus = true;
            }
            if (!this.isValidVacationDisplaySetting(timelineDisplaySettingModel)) {
                timelineDisplaySettingModel.permitAllVacation = true;
            }
            return timelineDisplaySettingModel;
        },
        /**
         * 근태 정보 노출 기능을 사용하면서 일부에게만 노출 허용하는 경우, 일부인 대상을 지정하지 않은 경우 유효한 것이 아니기에 그것을 검증하는 함수
         */
        isValidStatusDisplaySetting: function (timelineDisplaySettingModel) {
            if (timelineDisplaySettingModel.enable == 'false') {
                return true;
            }
            return timelineDisplaySettingModel.permitAllStatus || !(timelineDisplaySettingModel.statusCircle == {} || timelineDisplaySettingModel.statusCircle.nodes.length == 0);
        },
        isValidVacationDisplaySetting: function (timelineDisplaySettingModel) {
            if (timelineDisplaySettingModel.enable == 'false') {
                return true;
            }
            return timelineDisplaySettingModel.permitAllVacation || !(timelineDisplaySettingModel.vacationCircle == {} || timelineDisplaySettingModel.vacationCircle.nodes.length == 0);
        },
        saveBasicSetting: function () {
            var timelineAdministrators = this.getAdministrators($("#timelineAdministrators li"));
            var vacationAdministrators = this.getAdministrators($("#vacationAdministrators li"));
            var hrAdministrators = this.getAdministrators($("#hrAdministrators li"));
            var welfareAdministrators = this.getAdministrators($("#welfareAdministrators li"));

            this.model.set("timelineAdministrators", timelineAdministrators, {silent: true});
            this.model.set("vacationAdministrators", vacationAdministrators, {silent: true});
            this.model.set("hrAdministrators", hrAdministrators, {silent: true});
            this.model.set("welfareAdministrators", welfareAdministrators, {silent: true});

            this.model.set("timelineMenuActive", $('#timelineMenuActive').is(".on"), {silent: true});
            this.model.set("vacationMenuActive", $('#vacationMenuActive').is(".on"), {silent: true});
            this.model.set("hrMenuActive", $('#hrMenuActive').is(".on"), {silent: true});
            this.model.set("welfareMenuActive", $('#welfareMenuActive').is(".on"), {silent: true});

            this.model.set("statusEditAuth", {
                manager: $('#statusManager').is(".on"),
                master: $('#statusMaster').is(".on"),
                moderator: $('#statusModerator').is(".on"),
                member: $('#statusMember').is(".on")
            }, {silent: true});

            this.model.set("useTimelineActivityLogs", $('#useTimelineActivityLogs').is(".on"), {silent: true});
            this.model.set("useDeptSituationAndStats", $('#useDeptSituationAndStats').is(".on"), {silent: true});
            this.model.set("syncActive", $('#activeSync').is(".on"), {silent: true});

            var timelineDisplaySettingModel = this.createTimelineDisplaySettingModel();
            this.model.set("timelineDisplaySettingModel", timelineDisplaySettingModel, {silent: true});

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            this.model.save({}, {
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                success: function (response) {
                    if (response.code == '200') {
                        $.goMessage(CommonLang["저장되었습니다."]);
                        GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        self.render();
                    }
                },
                error: function (model, response) {
                    if (response && response.responseJSON && response.responseJSON.message) {
                        $.goMessage(response.responseJSON.message);
                    } else {
                        $.goMessage(CommonLang["저장에 실패 하였습니다."]);
                    }
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                }
            });

        },

        getAdministrators: function (target) {
            var admins = [];
            $.each(target, function (i, item) {
                var itemId = $(item).attr("data-id");
                if (itemId != undefined) {
                    admins.push({userId: $(item).attr("data-id")});
                }
            });
            return admins;
        },

        cancelBasicSetting: function () {
            this.render();
        },

        removeManager: function (e) {
            $(e.currentTarget).closest('li').remove();
        },

        showPopupGuideLayer: function () {
            var url = GO.contextRoot + "resources/guide/attnd/start.htm";
            window.open(url, "attndGuide", "resizable=yes,scrollbars=yes,width=820,height=700");
        },

        inactiveTimePermission: function () {

            _.chain(this.$el.find("#statusEditAuth button"))
                .forEach(_.bind(function (el) {
                    $(el).attr("disabled", 'disabled');
                    $(el).removeClass("on");
                }, this)).value();

            this.$el.find("#statusManager").addClass("on");

            $("#alertMessage").show();

        },
        activeTimePermission: function () {
            $("#statusManager").removeAttr('disabled');
            $("#statusMaster").removeAttr('disabled');
            $("#statusModerator").removeAttr('disabled');
            $("#statusMember").removeAttr('disabled');

            $("#alertMessage").hide();
        }

    });

    return AttndDefault;
});