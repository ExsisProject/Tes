define(
    function (require) {

        var $ = require("jquery");
        var Backbone = require("backbone");
        var App = require("app");
        var layoutTpl = require("hgn!ehr/common/templates/side");
        var Side = require("ehr/common/models/side");
        var StatusPopup = require("attendance/views/statusPopup");
        var commonLang = require("i18n!nls/commons");
        var timelineLang = require("i18n!timeline/nls/timeline");
        var adminLang = require("i18n!admin/nls/admin");
        var attendanceLang = require("i18n!attendance/nls/attendance");
        var VacationLang = require("i18n!vacation/nls/vacation");
        var WelfareLang = require("i18n!welfare/nls/welfare");
        var Amplify = require("amplify");
        var GuideView = require("timeline/components/views/guide_layer");
        var BackdropView = require('components/backdrop/backdrop');

        var instance = null;
        var Status = Backbone.Model.extend({
            url: function () {
                return GO.contextRoot + "api/ehr/timeline/status";
            }
        });
        var lang = {
            label_clockIn: timelineLang['출근시간'],
            label_clockOut: timelineLang['퇴근시간'],
            label_unregistered: timelineLang['미등록'],
            label_weekSum: timelineLang['주간 누적 근무시간'],
            label_confirm: commonLang['확인'],
            label_cancel: commonLang['취소'],
            label_status: commonLang['상태'],
            label_select: commonLang['선택'],
            label_contents: commonLang['내용'],
            label_collapse: commonLang['접기'],
            label_expand: commonLang['펼치기'],
            label_manage: commonLang['관리'],
            label_clockInTime: timelineLang['출근하기'],
            label_clockOutTime: timelineLang['퇴근하기'],
            label_status_change: timelineLang['근무상태변경'],
            label_night_work_check: timelineLang['늦은 퇴근 체크'],
            label_night_work_description: timelineLang['늦은 퇴근 설명'],
            label_unconfirm: attendanceLang['미확인'],
            label_completeInTime: attendanceLang['출근완료'],
            label_completeOutTime: attendanceLang['퇴근완료'],
            label_deptManage: timelineLang['부서 근태관리'],
            label_compManage: attendanceLang['전사 근태관리'],
            label_attndStatus: attendanceLang['근태현황'],
            label_attndStatistics: attendanceLang['근태통계'],
            label_myAttendance: attendanceLang['내 근태'],
            label_myAttendanceStatus: attendanceLang['내 근태 현황'],
            label_manageAttendance: attendanceLang['근태관리'],
            label_date: attendanceLang['날짜'],
            label_time: attendanceLang['시간'],
            label_statusDesc: attendanceLang['상태에 대한 간단한 설명을 입력하세요.'],
            label_register: attendanceLang['등록'],

            label_myHrInfo: attendanceLang['내 인사정보'],
            label_deptAttndStatus: attendanceLang['부서 근태현황'],
            label_deptAttndStatistics: attendanceLang['부서 근태통계'],
            label_deptHrInfo: attendanceLang['부서 인사정보'],
            label_compAttndStatus: attendanceLang['전사 근태현황'],
            label_compAttndStatistics: attendanceLang['전사 근태통계'],
            label_compHrInfo: attendanceLang['전사 인사정보'],
            label_compVacationHistory: VacationLang["전사 연차현황"],
            label_deptVacationHistory: VacationLang["부서 연차현황"],
            label_myVacationInfo: VacationLang['내 연차 내역'],
            label_companyWelfare: WelfareLang["전사 복지포인트"],
            label_myWelfareInfo: WelfareLang["내 복지포인트"],
            label_compVacationUsageHistory: VacationLang["전사 연차 사용내역"],
            label_deptVacationUsageHistory: VacationLang["부서 연차 사용내역"],
        };

        var ATTENDANCE_STORE_KEY = GO.session("loginId") + '-attendance-timer';
        var EHR_MINE_STORE_KEY = GO.session("loginId") + '-ehr-mine-toggle';
        var EHR_DEPT_STORE_KEY = GO.session("loginId") + '-ehr-dept-toggle';
        var EHR_COMPANY_STORE_KEY = GO.session("loginId") + '-ehr-company-toggle';

        var SideView = Backbone.View.extend({
            el: "#side",
            events: {
                "click .lnb span.ic_side": "slideToggle",
                "click .lnb span.txt": "slideToggle",
                "click #workIn": "clickWorkIn",
                "click #workOut": "clickWorkOut",
                "click #changeStatus": "showStatuslist",
                "click span#myTimelineStatus": "moveMyTimelineStatus",
                "click li.timelineStatus": "changeStatus",
                "click .dept_record": "moveTimelineDeptStats",
                "click .dept_dashboard": "moveTimelineDeptDashboard",
                "click .company_record": "moveTimelineCompanyStats",
                "click #myHrcardInfo": "moveMyHrcardInfo",
                "click #myVacationInfo": "moveMyVacationInfo",
                "click #hrCardMngBtn": "moveHrCardMng",
                "click #vacationMngBtn": "moveVacationMng",
                "click #welfareMngBtn": "moveWelfareMng",
                "click #myWelfareInfo": "moveMyWelfare",
                "click .dashboard": "moveTimelineDashboard",
                "click .analysis": "moveAttndRecord"
            },
            initialize: function () {
                this.$el.off();
                this.status = new Status;
                this.side = new Side();
                GO.EventEmitter.on("timeline", "change:data", _.bind(this.render, this));

            },
            getRequestInfo: function () {
                return this.requestInfo;
            },

            dataFetch: function () {
                this.side.fetch({async: false});
                this.time = this.side.moment();
                this.requestInfo = {
                    userId: GO.session("id"),
                    baseDate: this.time.format("YYYY-MM-DD")
                }
            },

            showStatuslist: function () {
                if(!this.backdropView) {
                    this.backdropView = new BackdropView();
                    this.backdropView.backdropToggleEl = $("div[el-backdrop]");
                    this.backdropView.linkBackdrop($("#changeStatus"));
                }
            },

            getVariable: function (data) {
                var workInTime = this.getCurrentTime();
                return {
                    "checkTime": workInTime.toISOString(),
                    "timelineStatus": {id: data},
                    "isNightWork": this.isNightWork,
                    "workingDay": this.isNightWork ? this.time.subtract(1, 'days').format("YYYY-MM-DD") : this.time.format("YYYY-MM-DD")
                }
            },

            clickWorkIn: function (e) {
                if ($(e.currentTarget).hasClass("off")) return;
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: GO.contextRoot + "api/ehr/timeline/status/clockIn?" + $.param(this.getRequestInfo()),
                    contentType: "application/json",
                    data: JSON.stringify(this.getVariable()),
                    success: function (resp) {
                        GO.EventEmitter.trigger("timeline", "change:data");
                    },
                    error: function (resp) {
                        var errorMessage = resp.responseJSON.message;
                        if (errorMessage != null) {
                            $.goSlideMessage(errorMessage, 'caution');
                        } else {
                            $.goSlideMessage(adminLang['요청 처리 중 오류가 발생하였습니다.'], 'caution');
                        }

                    },

                });

            },

            clickWorkOut: function (e) {
                var self = this;
                if ($(e.currentTarget).hasClass("off")) return;
                this.side.fetch({async: false});
                this.isNightWork = this.side.getTimeline().nightWork;
                if (this.isNightWork) {
                    var tmpl = '<p class="q">' + lang.label_night_work_check + '</p>' +
                        '<p class="add">' + lang.label_night_work_description + '</p>';
                    $.goPopup({
                        width: 400,
                        title: "",
                        pclass: "layer_confim layer_colleage layer_confim_attend",
                        contents: tmpl,
                        buttons: [{
                            btext: lang.label_clockOutTime,
                            btype: "confirm",
                            autoclose: true,
                            callback: function (popup) {
                                self.workOut(e);
                            }
                        },
                            {
                                btext: lang.label_clockInTime,
                                btype: "normal",
                                autoclose: true,
                                callback: function (popup) {
                                    self.isNightWork = false;
                                    self.clickWorkIn(e);
                                }
                            }]
                    });
                } else {
                    this.workOut(e)
                }
            },

            workOut: function (e) {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: GO.contextRoot + "api/ehr/timeline/status/clockOut?" + $.param(this.getRequestInfo()),
                    contentType: "application/json",
                    data: JSON.stringify(this.getVariable()),
                    success: function (resp) {
                        GO.EventEmitter.trigger("timeline", "change:data");
                    },
                    error: function (resp) {
                        var errorMessage = resp.responseJSON.message;
                        if (errorMessage != null) {
                            $.goSlideMessage(errorMessage, 'caution');
                        } else {
                            $.goSlideMessage(adminLang['요청 처리 중 오류가 발생하였습니다.'], 'caution');
                        }

                    },

                });

            },
            changeStatus: function (e) {
                var statusCode = $(e.currentTarget).find('span').attr('data-code');
                this.backdropView = null;
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    async: false,
                    url: GO.contextRoot + "api/ehr/timeline/status?" + $.param(this.getRequestInfo()),
                    contentType: "application/json",
                    data: JSON.stringify(this.getVariable(statusCode)),
                    success: function (resp) {
                        GO.EventEmitter.trigger("timeline", "change:data");
                    },
                    error: function (resp) {
                        var errorMessage = resp.responseJSON.message;
                        if (errorMessage != null) {
                            $.goSlideMessage(errorMessage, 'caution');
                        } else {
                            $.goSlideMessage(adminLang['요청 처리 중 오류가 발생하였습니다.'], 'caution');
                        }

                    },

                });
            },

            getCurrentTime: function () {
                var currentTimeStr = this.$el.find("#timer").text();
                var timeArr = currentTimeStr.split(":");
                var currentTime = moment().hour(timeArr[0]).minute(timeArr[1]).second(timeArr[2]);
                return currentTime;
            },

            selectSideMenu: function () {
                var selectedEl;
                this.$el.find('p.on').removeClass('on');
                var loadMenuArr = App.router.getUrl().split('/');

                if (loadMenuArr[2] == 'my' || (loadMenuArr[1] == 'hrcard' && loadMenuArr[3] == GO.session("id"))) { //내 근태 메뉴
                    selectedEl = this.$el.find('ul.side_depth p[data-folder-type="' + loadMenuArr[1] + '"]');
                } else if (loadMenuArr[2] == 'company' || !loadMenuArr[3]) { //전사 근태 메뉴
                    var title = loadMenuArr[3] ? loadMenuArr[3] : loadMenuArr[2];
                    selectedEl = this.$el.find('ul.side_depth li.company p[data-navi="' + title + '"]');
                } else if (loadMenuArr[1] == 'vacation') {//부서 근태 메뉴
                    selectedEl = this.$el.find('ul.side_depth li[data-deptid="' + loadMenuArr[2] + '"] li[data-folder-type="' + loadMenuArr[1] + '"] p[data-navi="' + loadMenuArr[3] + '"]');
                } else {
                    selectedEl = this.$el.find('ul.side_depth li[data-deptid=  "' + loadMenuArr[3] + '"] li[data-folder-type="' + loadMenuArr[1] + '"] p[data-navi="' + loadMenuArr[2] + '"]');
                }
                if (selectedEl.length) {
                    selectedEl.addClass('on');
                }
            },

            setGadgetBtnVisibility: function () {
                if (this.side.isTimelineActive() && (this.side.isTimelineSyncActive() || !this.side.isTimelineHasGroup())) {
                    $('div.function_btn_wrap').hide();
                    $('div.works_state').hide();
                }
            },

            renderTimer: function () {
                var timer = this.time.format('HH:mm:ss');
                this.$el.find('#timer').text(timer);
            },

            setTimerInterval: function () {
                var self = this;
                var storedValue = this.getStoredData(ATTENDANCE_STORE_KEY);
                if (storedValue) {
                    clearInterval(storedValue);
                }
                var timerId = setInterval(function () {
                    self.time = self.time.add(1, 'seconds');
                    self.renderTimer();
                }, 1000);
                this.storeData(ATTENDANCE_STORE_KEY, timerId);
            },

            setDateTime: function () {
                var date = this.time.format('YYYY[-]MM[-]DD[(]ddd[)]');
                this.$el.find('#date').text(date);

            },

            render: function () {
                this.dataFetch();
                this.renderTimer();

                var isMineOpen = this.getStoredData(EHR_MINE_STORE_KEY);
                var isDeptOpen = this.getStoredData(EHR_DEPT_STORE_KEY);
                var isCompanyOpen = this.getStoredData(EHR_COMPANY_STORE_KEY);
                var tpl = layoutTpl({
                    contextRoot: GO.contextRoot,
                    lang: lang,
                    TimelineLang:timelineLang,
                    data: this.side.toJSON(),
                    timeline: this.side.getTimeline(),
                    isMineOpen: _.isUndefined(isMineOpen) ? true: isMineOpen,
                    isDeptOpen: _.isUndefined(isDeptOpen) ? true: isDeptOpen,
                    isCompanyOpen: _.isUndefined(isCompanyOpen) ? true: isCompanyOpen,
                    hrcard: this.side.getHrcard(),
                    vacation: this.side.getVacation(),
                    welfare: this.side.getWelfare(),
                    isEhrActive: this.side.isEhrActive(),
                    isEhrManager: this.side.isEhrManager(), //근태,인사 둘중하나라도 관리자면.
                    hasDepts: this.side.hasDepts(),
                    useDeptSituationAndStats: this.side.useDeptSituationAndStats(), //부서장 정보공개권한이 근태,인사,연차 셋중하나라도 있으면
                    appName: GO.util.getAppName("ehr"),
                    email: GO.session("email"),
                    hasActiveDeptEhr: function () {
                        var isActiveTimeline = this.timeline.active,
                            isActiveHrcard = this.hrcard.active,
                            isActiveVacation = this.vacation.active;
                        return isActiveTimeline || isActiveHrcard || isActiveVacation;
                    }
                });

                this.$el.html(tpl);

                if (this.side.isTimelineActive()) {
                    this.renderTimer();
                    this.setTimerInterval();
                    this.setDateTime();
                    this.renderStatusList();
                    this.setCheckInOutTime();
                    this.setMyStatus();
                    this.setTotalTime();
                    this.setGuide();
                    this.isNightWork = this.side.getTimeline().nightWork;
                }

                this.selectSideMenu();
                this.setGadgetBtnVisibility();

                $("body").trigger("ehr.sideRender");
            },

            renderStatusList: function () {
                var timelineStatusModels = this.side.getTimeline().timelineStatusList;
                $(timelineStatusModels).each(function (index, item) {
                    $("#statusList").append("<li class='timelineStatus'><span class=\"txt \" data-code=" + item.id + ">" + item.name + "</span></li>");
                })
            },

            setMyStatus: function () {
                var myStatus = this.side.getTimeline().myStatus;
                if (myStatus && myStatus.id && myStatus.timelineCode != "CLOCK_IN" && myStatus.timelineCode != "CLOCK_OUT") {
                    $("#changeStatus").find("span.txt").text(this.side.getTimeline().myStatus.name + "\u00A0\u00A0");
                    $("#changeStatus").find("span.txt").append('<span class="ic_side ic_show_down"></span>');
                }
            },

            setCheckInOutTime: function () {
                if (this.side.getTimeline().workInTime) {
                    $("#workIn").removeClass("on");
                    $("#workIn").addClass("off");
                    $("#workInTime").text(this.side.getTimeline().workInTime);
                }
                if (this.side.getTimeline().workOutTime) {
                    $("#workOut").removeClass("on");
                    $("#workOut").addClass("off");
                    $("#workOutTime").text(this.side.getTimeline().workOutTime);
                }
            },
            setTotalTime: function () {
                if (this.side.getTimeline().totalTime) {
                    var totalTime = this.side.getTimeline().totalTime;
                    $("#weeklyTotalTime").text(totalTime);
                }
            },

            setGuide: function () {
                var guideView = new GuideView();
                this.$el.find("#guide").html(guideView.$el);
                guideView.render();
                $("#guideBadge").draggable({containment: "body"});
            },

            getTimeString: function (totalTime) {
                var hour = totalTime / (1000 * 60 * 60);
                var min = (totalTime % (1000 * 60 * 60)) / (1000 * 60);
                return this.padDigits(parseInt(hour), 2) + "h " + this.padDigits(parseInt(min), 2) + "m"
            },

            padDigits: function (number, digits) {
                return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
            },

            slideToggle: function (e) {
                var currentTarget = $(e.currentTarget),
                    parentTarget = currentTarget.parents('h1'),
                    toggleBtn = parentTarget.find('.ic_hide_up'),
                    self = this;

                parentTarget.next('ul').slideToggle("fast",
                    function () {
                        if ($(this).css('display') == 'block') {
                            parentTarget.removeClass("folded");
                            toggleBtn.attr("title", lang['label_collapse']);
                        } else {
                            parentTarget.addClass("folded");
                            toggleBtn.attr("title", lang['label_expand']);
                        }
                        var isMine = parentTarget.hasClass("mine");
                        var isDept = parentTarget.hasClass("org");
                        var isCompany = parentTarget.hasClass("company");

                        var isOpen = !parentTarget.hasClass("folded");

                        if (isMine) {
                            self.storeData(EHR_MINE_STORE_KEY, isOpen);
                        } else if (isDept) {
                            self.storeData(EHR_DEPT_STORE_KEY, isOpen);
                        } else if (isCompany) {
                            self.storeData(EHR_COMPANY_STORE_KEY, isOpen);
                        }
                    });
            },
            addAttndStatus: function (e) {
                var self = this;
                this.popupEl = $.goPopup({
                    header: lang.label_status_change,
                    lang: lang,
                    width: 810,
                    modal: true,
                    pclass: 'layer_normal layer_go_status',
                    contents: "",
                    buttons: [{
                        btype: 'confirm',
                        btext: lang.label_register,
                        autoclose: false,
                        callback: function () {
                            statusPopup.addStatus();
                            self.popupEl.close();
                        }
                    }, {
                        btype: 'close',
                        btext: lang.label_cancel,
                        autoclose: true,
                        callback: function () {
                        }

                    }]
                });

                var option = {record: this.record, action: 'create', type: 'status', userid: GO_Session.id};
                var statusPopup = new StatusPopup(option);

                this.popupEl.find('div.content').html(statusPopup.render().el);
            },

            storeData: function (store_key, store_value) {
                return Amplify.store(store_key, store_value, {type: !window.sessionStorage ? null : 'sessionStorage'});
            },
            getStoredData: function (store_key) {
                if (!window.sessionStorage) {
                    return Amplify.store(store_key);
                } else {
                    return Amplify.store.sessionStorage(store_key);
                }
            },
            moveMyTimelineStatus: function (e) {
                GO.router.navigate('ehr/timeline/my', {trigger: true});
            },

            moveAttndRecord: function (e) {
                if ($(e.currentTarget).hasClass('prev_company_attnd')) {
                    GO.router.navigate('ehr/attendance/companylist', {trigger: true});
                } else if ($(e.currentTarget).hasClass('prev_org_attnd')) {
                    GO.router.navigate('ehr/attendance/deptlist/' + $(e.currentTarget).closest('li.org').attr('data-deptid'), {trigger: true});
                }
            },
            moveTimelineDeptDashboard: function (e) {
                var deptId = $(e.currentTarget).closest('li.org').attr('data-deptid');
                if( !deptId){ return; }
                GO.router.navigate('ehr/timeline/dept/dashboard/' + deptId, {trigger: true});
            },
            moveTimelineDeptStats: function (e) {
                var deptId = $(e.currentTarget).closest('li.org').attr('data-deptid');
                if (!deptId) {
                    GO.router.navigate('ehr/attendance/alldepstats/', {trigger: true});
                } else {
                    GO.router.navigate('ehr/timeline/deptstats/' + deptId, {trigger: true});
                }
            },
            moveTimelineCompanyStats: function () {
                GO.router.navigate('ehr/timeline/companystats/', {trigger: true});
            },
            moveTimelineDashboard: function () {
                GO.router.navigate('ehr/timeline/dashboard', {trigger: true});
            },


            /*내 인사카드*/
            moveMyHrcardInfo: function (e) {
                GO.router.navigate('ehr/hrcard/detail/' + GO.session("id"), {trigger: true});
            },

            /*인사카드 관리자 페이지*/
            moveHrCardMng: function () {
                GO.router.navigate('ehr/hrcard/hrcardmanage', {trigger: true});
            },


            moveMyVacationInfo: function () {
                GO.router.navigate('ehr/vacation/my', {trigger: true});
            },

            moveMyWelfare: function () {
                GO.router.navigate('ehr/welfare/my', {trigger: true});
            },

            moveVacationMng: function () {
                GO.router.navigate('ehr/vacation/config', {trigger: true});
            },

            moveWelfareMng: function () {
                GO.router.navigate('ehr/welfare/config', {trigger: true});
            },

            getAccountUseEhrOption : function () {
                var hrCardSideOption = this.side.getHrcard();
                if(_.isEmpty(hrCardSideOption)) {
                    return false;
                }

                return hrCardSideOption.accountUseEhr;
            }
        }, {
            render: function () {
                if (instance == null) {
                    instance = new SideView();
                    instance.render();
                }
                return instance;
            }
        });

        // 상단 메뉴가 변경되면 side를 다시 그리기 위해서 instance를 초기화 함.
        GO.router.on("route", function () {
            instance = null;
        }, this);

        return SideView;
    }
);
