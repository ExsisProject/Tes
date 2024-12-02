define("timeline/views/mobile/user/main", function (require) {

    var Backbone = require("backbone");

    var AuthModel = require("timeline/models/auth");
    var Amplify = require("amplify");
    var HeaderToolbarView = require('views/mobile/header_toolbar');
    var SummaryView = require("timeline/views/mobile/user/summary");
    var MonthView = require("timeline/views/mobile/user/month");
    var Side = require("ehr/common/models/side");
    var Tmpl = require("hgn!timeline/templates/mobile/user/main");

    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    var lang = {
        label_clockIn: TimelineLang['출근하기'],
        label_clockOut: TimelineLang['퇴근하기'],
        label_clockInTime: TimelineLang['출근시간'],
        label_clockOutTime: TimelineLang['퇴근시간'],
        label_status_change: TimelineLang['근무'] + TimelineLang['상태'],
        label_record_gps_warning: TimelineLang['위치정보 미동의 경고']
    };
    var MainView = Backbone.View.extend({
        bindEvent: function () {
            var self = this;
            $("#currentMonth").click(function (e) {
                self.moveToday(e);
            });
            $("#prevMonth").click(function (e) {
                self.prevMonth(e);
            });
            $("#nextMonth").click(function (e) {
                self.nextMonth(e);
            });
            $("#workIn").click(function (e) {
                self.clickWorkIn(e);
            });
            $("#workOut").click(function (e) {
                self.clickWorkOut(e);
            });
            $("#statusList").change(function (e) {
                self.changeStatus(e);
            });
        },
        unbindEvent: function () {
            $("#currentMonth").unbind("click");
            $("#prevMonth").unbind("click");
            $("#nextMonth").unbind("click");
            $("#workIn").unbind("click");
            $("#workOut").unbind("click");
            $("#statusList").unbind("change");
        },
        initialize: function (options) {
            this.options = options;
            this.date = new Date();
            this.baseDate = GO.util.customDate(this.date, 'YYYY-MM-DD');
            this.options.baseDate = this.baseDate;

            this.authModel = new AuthModel(GO.util.store.get("timeline.auth"));

            this.summaryView = new SummaryView(this.options);
            this.monthView = new MonthView(this.options);

            this.time = moment();
            this.side = new Side();
            this.requestInfo = {
                userId: this.options.userId,
                baseDate: moment().format("YYYY-MM-DD")
            };
            this.setLocation();
            GO.EventEmitter.on("timeline", "change:data", function () {
                this.render();
            }, this);
        },

        render: function () {
            this.dataFetch();

            this.$el.empty();
            var authDeferred = this.authModel.fetch({
                data: this.requestInfo
            });

            $.when(authDeferred)
                .done(_.bind(function () {

                    GO.util.store.set("timeline.auth", this.authModel.toJSON());
                    this.isCreatable = this.authModel.isCreatable();

                    this.renderTitleToolbar();
                }, this));

            $(".content_page").html(Tmpl({
                TimelineLang: TimelineLang,
                CommonLang: CommonLang,
                baseDate: moment(this.baseDate).format("YYYY.MM"),
                timeline: this.side.getTimeline(),
                lang: lang
            }));
            if (this.side.isTimelineActive()) {
                this.setDateTime();
                this.renderStatusList();
                this.setCheckInOutTime();
                this.isNightWork = this.side.getTimeline().nightWork;
            }
            $("#summary").html(this.summaryView.$el);
            this.summaryView.render();
            this.hideStateChangeableBtns();

            $("#month").html(this.monthView.$el);
            this.monthView.render(this.convertServerFormat(this.baseDate));
            this.unbindEvent();
            this.bindEvent();
        },
        renderTitleToolbar: function () {

            var title = GO.session().id == this.options.userId ? TimelineLang["내 근태 현황"] : "";
            var titleToolbarOption = {
                title: title,
                isList: true,
                isSideMenu: true,
                isHome: true
            };
            if (this.isCreatable) {
                titleToolbarOption.isWriteBtn = false;
                titleToolbarOption.writeBtnCallback = function () {
                    GO.router.navigate("ehr/timeline/history/create", {trigger: true, pushState: true});
                }
            }
            this.headerToolbarView = HeaderToolbarView;
            this.headerToolbarView.render(titleToolbarOption);

        },
        hideStateChangeableBtns: function () {
            if (this.side.isTimelineActive() && (this.side.isTimelineSyncActive() || !this.side.isTimelineHasGroup()
                || !this.summaryView.model.group.isMobileAllow())) {
                $('select#statusList').hide();
                $('div.btn_attend').hide();
            }
        },
        changeStatus: function (e) {
            var self = this;
            var statusCode = $("#statusList option:selected").val();
            $.ajax({
                type: "POST",
                dataType: "json",
                async: false,
                url: GO.contextRoot + "api/ehr/timeline/status?" + $.param(this.getRequestInfo()),
                contentType: "application/json",
                data: JSON.stringify(_.extend(this.getVariable(statusCode), this.location)),
                success: function (resp) {
                    self.dataFetch();
                    GO.EventEmitter.trigger("timeline", "change:data", function () {
                        console.log("상태변경")
                    });
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
        getRequestInfo: function () {
            return this.requestInfo;
        },
        getVariable: function (data) {
            return {
                "checkTime": this.time.toISOString(),
                "timelineStatus": {id: data},
                "isNightWork": this.isNightWork,
                "workingDay": this.isNightWork ? this.time.subtract(1, 'days').format("YYYY-MM-DD") : this.time.format("YYYY-MM-DD")
            }
        },
        dataFetch: function () {
            this.side.fetch({async: false});
        },

        clickWorkIn: function (e) {
            var self = this;

            if(!this.isRecordClock()) {
                GO.util.delayAlert(TimelineLang["위치정보 미동의 경고"]);
                return;
            }

            if ($(e.currentTarget).hasClass("off") || this.isEmptyLocation()) {
                return;
            }

            $.ajax({
                type: "POST",
                dataType: "json",
                async: false,
                url: GO.contextRoot + "api/ehr/timeline/status/clockIn?" + $.param(this.getRequestInfo()),
                contentType: "application/json",
                data: JSON.stringify(_.extend(this.getVariable(), this.location)),
                success: function (resp) {
                    $(e.currentTarget).addClass("off");
                    self.dataFetch();
                    GO.EventEmitter.trigger("timeline", "change:data", function () {
                    }, this);

                },
                error: function (resp) {
                    var errorMessage = resp.responseJSON.message;
                    if (errorMessage != null) {
                        alert(errorMessage);
                    } else {
                        alert(adminLang['요청 처리 중 오류가 발생하였습니다.']);
                    }

                },

            });

        },

        workOut: function (e) {
            var self = this;
            $.ajax({
                type: "POST",
                dataType: "json",
                async: false,
                url: GO.contextRoot + "api/ehr/timeline/status/clockOut?" + $.param(this.getRequestInfo()),
                contentType: "application/json",
                data: JSON.stringify(_.extend(this.getVariable(), this.location)),
                success: function (resp) {
                    $(e.currentTarget).addClass("off");
                    self.dataFetch();
                    GO.EventEmitter.trigger("timeline", "change:data", function () {
                        console.log("퇴근")
                    }, this);
                },
                error: function (resp) {
                    var errorMessage = resp.responseJSON.message;
                    if (errorMessage != null) {
                        alert(errorMessage);
                    } else {
                        alert(adminLang['요청 처리 중 오류가 발생하였습니다.']);
                    }

                },

            });

        },
        clickWorkOut: function (e) {
            var self = this;

            if(!this.isRecordClock()) {
                GO.util.delayAlert(TimelineLang["위치정보 미동의 경고"]);
                return;
            }

            if ($(e.currentTarget).hasClass("off") || this.isEmptyLocation()) {
                return;
            }

            if (self.isNightWork) {
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
        setDateTime: function () {
            var date = this.time.format('YYYY[-]MM[-]DD[(]ddd[)]');
            $("#date").text(date);
        },
        renderStatusList: function () {
            var timelineStatusModels = this.side.getTimeline().timelineStatusList;
            $(timelineStatusModels).each(function (index, item) {
                $("#statusList").append("<option class='timelineStatus' value=" + item.id + ">" + item.name + "</option>");
            });
            var myStatus = this.side.getTimeline().myStatus;
            if (myStatus && myStatus.id && myStatus.timelineCode != "CLOCK_IN" && myStatus.timelineCode != "CLOCK_OUT") {
                $("#statusList").val(myStatus.id).prop("selected", true);
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
        moveToday: function (e) {
            this.baseDate = moment();
            this.changeBaseDate();
        },
        prevMonth: function () {
            this.baseDate = moment(this.baseDate).add('month', -1).format("YYYY-MM");
            this.changeBaseDate();
        },
        nextMonth: function () {
            this.baseDate = moment(this.baseDate).add('month', 1).format("YYYY-MM");
            this.changeBaseDate();
        },
        changeBaseDate: function (type) {
            $("#baseDate").html(moment(this.baseDate).format("YYYY.MM"));
            if (type === "refresh") {
                this.summaryView.render(this.convertServerFormat(this.baseDate));
            } else {
                this.summaryView.changeBaseDate(moment(this.baseDate));
            }
            this.monthView.render(this.convertServerFormat(this.baseDate), this.options.userId);
        },
        convertServerFormat: function (baseDate) {
            return moment(baseDate).format("YYYY-MM-DD");
        },
        setLocation: function () {
            var self = this;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    self.location = {checkLatitude: position.coords.latitude, checkLongitude: position.coords.longitude};
                }, function (error) {
                    self.positionErrorMsg = error.code === 1 ? TimelineLang["http에서의 gps실패 메시지"] : TimelineLang["위치 정보를 가져오지 못했습니다."];
                    self.location = null;
                }, {
                    timeout: 5000
                });
            }
        },
        isEmptyLocation: function () {
            if (!this.location) {
                if(_.isUndefined(this.positionErrorMsg)){
                    this.positionErrorMsg = TimelineLang["위치 정보를 가져오지 못했습니다."];
                }
                alert(this.positionErrorMsg);
                return true;
            }
            return false;
        },

        isRecordClock : function() {
            var useGpsRecord, agreementGps;
            $.ajax({
                type: "GET",
                async: false,
                url: GO.contextRoot + "api/ehr/timeline/record/gps",
                success: function (resp) {
                    useGpsRecord = resp.data.data;
                },
                error: function (resp) {
                    var errorMessage = resp.responseJSON.message;
                    if (errorMessage != null) {
                        alert(errorMessage);
                    } else {
                        alert(adminLang['요청 처리 중 오류가 발생하였습니다.']);
                    }
                },
            });

            if(useGpsRecord == false) {
                return true;
            }

            $.ajax({
                type: "GET",
                async: false,
                url: GO.contextRoot + "api/agreement/gps",
                success: function (resp) {
                    agreementGps = resp.data.agreement;
                },
                error: function (resp) {
                    var errorMessage = resp.responseJSON.message;
                    if (errorMessage != null) {
                        alert(errorMessage);
                    } else {
                        alert(adminLang['요청 처리 중 오류가 발생하였습니다.']);
                    }
                },
            });
            return agreementGps;
        }

    });

    return MainView;
});