define("calendar/views/regist", function (require) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var GO = require("app");
    var Hogan = require("hogan");

    var CalendarFormView = require("calendar/views/form");
    var Calendars = require("calendar/collections/calendars");
    var CalendarEvent = require("calendar/models/event");
    var CalendarEvents = require("calendar/collections/events");
    var AlarmPopupLayer = require("calendar/views/alarm_popup_layer");
    var AttendeesScheduleLayerView = require("calendar/views/attendees_schedule_layer");

    var RegistFormHelper = require("calendar/helpers/regist_form");
    var FormAttendeesHelper = require("calendar/helpers/form_attendees");
    var FormReminderHelper = require("calendar/helpers/form_reminder");
    var ExternalView = require("calendar/views/external_attendee");
    var CalUtil = require("calendar/libs/util");

    var registTopTpl = require("text!calendar/templates/_regist_top.html");
    var commonLang = require("i18n!nls/commons");
    var calLang = require("i18n!calendar/nls/calendar");

    require("jquery.autocomplete");
    require("jquery.ui");
    require("jquery.go-popup");
    require("jquery.go-orgslide");
    require("jquery.cookie");

    // 변수 정의
    var now = GO.util.now();

    /**
     * TODO: 전반적인 리팩토링 필요
     * 1. 각종 helper 제거 - 이 구조는 기존에 상세 페이지가 폼의 형태를 띄면서 클릭 후
     *    폼으로 바뀌는 등의 다른 형태가 있었기 때문에 mixin의 형태로 꾸민 것인데,
     *    현재는 상세페이지 또한 일반 폼형태로 바뀌었기 때문에 더이상 필요가 없음.
     *    오히려 소스 복잡도만 증가시키고 있음.
     * 2. 상위 FormView를 두고 공통적인 요소를 정의한 후 등록/수정 별로 하위뷰를 정의하는
     *    전형적인 상속 형태로 변형시켜 소스를 단순화 시켜야 함.
     *
     * 리팩토링의 사전작업으로 우선 단순히 Backbone.View 를 상속한 CalendarFormView를 만들고,
     * 이를 상속하게 변경. 각 helper들이 하던 역할들을 CalendarFormView로 이전할 계획
     */
    var CalendarRegistView = CalendarFormView.extend({
        className: "content_page schedule_form go_renew",

        events: {
            "click #attendee-list #btn-add-attendees": "_showOrgSlider",
            "click #btn-confirm": "_submit",
            "click #btn-cancel": "_cancel",
            "click #btn-add-reminder": "_addReminder",
            "click #delete_all_attendees": "_deleteAll",
            "click #moreAttendee": "_toggleAttendee",
            "change [data-time-picker]": "_onChangeTime",
        },

        initialize: function (options) {
            this.options = options || {};

            this._initSearchParam();
            this.formHelper = new RegistFormHelper(this.$el, 'regist');

            this.submitFlag = false;
        },

        render: function () {
            console.log("[CalendarRegistView#render] rendering...");
            if (this.options.isCopied) {
                this._prepareModel().done($.proxy(function () {
                    this._initCopiedParam();
                    this._renderRegistForm();
                    this._renderExternalAttendees();
                    this._renderAttendeesSchedules();
                    $.goSlideMessage(calLang["복사된 일정입니다."]);
                }, this));
            } else {
                this._renderRegistForm();
                this._renderAttendeesSchedules();
            }
        },

        _renderExternalAttendees: function () {
            var externalAttendees = this.options.externalAttendees;
            if (externalAttendees.length) this.$("#externalArea").show();
            _.each(externalAttendees, function (attendee) {
                var externalView = new ExternalView(attendee);
                this.$("#externals").append(externalView.render().el);
            }, this);
        },

        _renderRegistForm: function () {
            var companyCalendar = Calendars.getWritableCompanyCalendars();

            this.formHelper.render({
                "start_date": this.options.startDate,
                "start_time": this.options.startTime,
                "end_date": this.options.endDate,
                "end_time": this.options.endTime,
                "summary": this.options.summary,
                "location": this.options.location,
                "allday_event?": this.options.timeType === 'allday',
                "private?": this.options.private,
                "description": this.options.description,
                "isCopiedNotAlone": this.options.isCopied && !this.options.isAlone,
                "calendar_manager?": Calendars.isCalendarManager(),
                "company_calendar": (new Backbone.Collection(companyCalendar)).toJSON(),
                "attendees": this.options.attendees
            }, this._buildPartials());

            this.reminderHelper = new FormReminderHelper(this.$el.find("ul#reminder-list"), this.options.reminders);
            this.attendeesHelper = new FormAttendeesHelper(this.$el.find("ul#attendee-list"), this.options.attendees);
            this.attendeesHelper.addRemoveCallback($.proxy(this._removeEventFromAttendees, this));
            this.attendeesHelper.addAttendeeCallback($.proxy(this._addEventFromAttendees, this));

            var myCalendars = Calendars.getMyCalendars();
            if (companyCalendar.length > 0 && this.options.calendarType == 'company') {
                this.$el.find('input[name=is_company_event]').click();
                this.$el.find('select[name=company_calendar_id]').val(this.options.calendarId);
                this.formHelper.loadMyCalendarOptions(myCalendars);
            } else {
                this.formHelper.loadMyCalendarOptions(myCalendars, this.options.calendarId);
            }

            this.formHelper.loadAsset();   // 자산예약 연동

            this.initAutoComplete();
            var self = this;
            this.$el.on("externalAttendee:regist", function (e, param) {
                self.makeFormatUnit($("#externalForm"), param);
            });

            return this.el;
        },

        _renderAttendeesSchedules: function () {
            var _this = this;
            this.attendeesScheduleLayerView = new AttendeesScheduleLayerView({
                attendees: this.options.attendees,
                startDate: this.options.startDate
            });
            this.$el.find('[data-attendees-schedule-wrapper]').append(this.attendeesScheduleLayerView.render().el);

            this.$el.off("calendarDate:change");
            this.$el.on("calendarDate:change", function (e) {
                _this.attendeesScheduleLayerView.onChangeDate();
            });
        },

        _onChangeTime: function (e) {
            this.attendeesScheduleLayerView.onChangeTime();
        },

        /**
         파라미터 초기화

         @method _initOptionDate
         @private
         */
        _initSearchParam: function () {
            var search = GO.router.getSearch();
            this.options.startDate = search["sd"] || now.format("YYYY-MM-DD");
            this.options.startTime = search["st"] || GO.util.getIntervalTime(now).format("HH:mm");
            this.options.endDate = search["ed"] || this.options.startDate;
            this.options.endTime = search["et"] || GO.util.getIntervalTime(now.clone().add("hours", 1)).format("HH:mm");
            this.options.timeType = search["tt"] || "timed";
            this.options.calendarType = search["ct"] || 'public';
            this.options.summary = decodeURIComponent(search["summary"] || "");
            this.options.location = search["location"] || "";
            this.options.attendees = _.pick(GO.session(), "id", "name", "email", "position");
            if (!this.options.calendarId) {
                this.options.calendarId = search["calendar"] || Calendars.getDefaultCalendar().id;
            }
        },

        _initCopiedParam: function () {
            this.options.summary = this.model.get("summary");
            this.options.private = this.model.isPrivate();
            this.options.calendarType = this.model.get('type');
            this.options.attendees = this.model.get("attendees");
            this.options.location = this.model.get("location");
            this.options.description = this.model.get('description');
            this.options.reminders = this.model.get("reminders");
            this.options.isAlone = this.model.isAlone();
            this.options.externalAttendees = this.model.getExternalAttendees();
        },

        /**
         복사된 모델 초기화 및 패치
         **/
        _prepareModel: function () {
            var deferred = $.Deferred();

            this.model = new CalendarEvent({"id": this.options.eventId, "calendarId": this.options.calendarId});
            this.model.fetch({
                success: deferred.resolve,
                error: deferred.reject,
                statusCode: {
					403: function() { GO.util.error('403', { "msgCode": '400-calendar'} ); },
					404: function() { GO.util.error('404', { "msgCode": '400-calendar'} ); },
					500: function() { GO.util.error('500'); }
                }
            });

            return deferred;
        },

        _buildPartials: function () {
            return {
                "title_and_date": Hogan.compile(registTopTpl)
            };
        },

        /**
         Form submit

         @method _submit
         @private
         */
        _submit: function (e) {
            var self = this;
            var newModel = new CalendarEvent();

            // 중복 submit이 동작하지 않도록 한다.
            if (this.submitFlag) {
                $.goMessage(calLang["일정 등록 중 메시지"]);
                return false;
            }

            e.preventDefault();

            newModel.on("error:validate", $.proxy(this._validateErrorCallback, this));
            newModel.set(self._setAttendantsFormData(eventType()));  // 참석자 정보

            if (newModel.isAlone()) {
                saveModel();
            } else {
                confirmNoti().done(function () {
                    saveModel();
                }).fail(function () {
                    self.submitFlag = false;
                });
            }

            function saveModel() {
                var itemToReserve = self.formHelper.getForReserveAssetItems();
                if (itemToReserve.length > 0) {       // 예약할 자산이 잇을 경우, 자산 예약 후 캘린더 등록
                    saveAssets().always(function () {
                        saveCalendarEvent();
                    });
                } else {
                    saveCalendarEvent();
                }
            }

            function eventType() {
                return this.$("#check-company-event").is(":checked") ? "company" : "normal";
            }

            function confirmNoti() {
                var deferred = $.Deferred();

                // 일정 알림 팝업 Layer
                this.alarmPopup = new AlarmPopupLayer();
                this.alarmPopup.setConfirmCallback(confirm, this);
                this.alarmPopup.setCancelCallback(cancel, this);
                this.alarmPopup.setCloseCallback(close, this);
                this.alarmPopup.render({"type": "web"});

                function confirm() {
                    var el = this;
                    var popupEl = $(el.alarmPopup.popupEl);
                    var isPushNoti = popupEl.find("input:checkbox[id='chkbox_push']").is(":checked");
                    var isMailNoti = popupEl.find("input:checkbox[id='chkbox_mail']").is(":checked");

                    newModel.set("pushNoti", isPushNoti);
                    newModel.set("mailNoti", isMailNoti);
                    deferred.resolve();
                }

                function cancel() {
                    newModel.set("pushNoti", false);
                    newModel.set("mailNoti", false);
                    deferred.resolve();
                }

                function close() {
                    deferred.reject();
                }

                return deferred;
            }

            function saveAssets() {
                return self.formHelper.saveReservationAssets();
            }

            function saveCalendarEvent() {
                newModel.set(self._serializeFormData());
                newModel.save({}, {
                    beforeSend: function () {
                        self.submitFlag = true;
                    },
                    success: function (model) {
                        console.log("[CalendarRegistView#_submit] Success regist event!!!");
                        var collection = CalendarEvents.getInstance();
                        collection.add(model);
                        setCalendarInfo(model.get('calendarId'));
                        CalUtil.goToCalendar();
                    },
                    error: function () {
                        $.goSlideMessage(calLang["일정 등록시 오류가 발생하였습니다"], 'caution');
                    },
                    complete: function () {
                        self.submitFlag = false;
                    }
                });
            }

            function setCalendarInfo(calendarId) {
                var checkedCals = CalUtil.getSavedSelectedCalendar(),
                    newCalendarIds = [];
                if (checkedCals) {
                    newCalendarIds = checkedCals.split(',');
                    newCalendarIds.push(calendarId.toString());
                }

                CalUtil.saveCheckedCalendar(newCalendarIds);
            }

            return false;
        },

        /**
         데이터 검증시 에러 콜백 함수
         - 리팩토링 필요(regist.js에서 copy & paste 됨)
         @method _validateErrorCallback
         @private
         */
        _validateErrorCallback: function (model, code, msg) {
            RegistFormHelper.prototype.raiseError.apply(this.formHelper, arguments);
            this.submitFlag = false;
            return this;
        },

        /**
         입력된 폼을 API 구조에 맞게 변경 후 반환

         @method _serializeFormData
         @return {Object} JSON 데이터
         @private
         */
        _serializeFormData: function () {
            var mycal = Calendars.getDefaultCalendar().toJSON(),
                formData = this.formHelper.serializeFormData();

            return _.extend({
                "creator": mycal.owner
            }, formData);
        },

        _setAttendantsFormData: function (type) {
            return {"attendees": type === 'normal' ? _.union(this.attendeesHelper.getAttendees(), this.getExternalAttendees()) : this.getExternalAttendees()};
        },

        /**
         Form submit

         @method _cancel
         @private
         */
        _cancel: function (e) {
            e.preventDefault();
            CalUtil.goToCalendar();
            return this;
        },

        /**
         조직도 슬라이드 호출

         @method _showOrgSlider
         @return {Object} 조직도 슬라이드 엘리먼트
         @private
         */
        _showOrgSlider: function (e) {
            return $.goOrgSlide({
                header: calLang["참석자 추가"],
                type: 'node',
                desc: calLang["일정의 참석자로 추가할 사용자를 아래에서 선택하세요"],
                contextRoot: GO.config("contextRoot"),
                callback: $.proxy(this._addAttendees, this),
                memberTypeLabel: calLang["참석자"],
                externalLang: commonLang,
                isBatchAdd: true
            });
        },

        /**
         조직도 클릭 이벤트 콜백

         @method _showOrgSlider
         @return {Object} 조직도 슬라이드 엘리먼트
         @private
         */
        _addAttendees: function (info) {
            this.attendeesHelper.addAttendee(info);
            return this;
        },

        /**
         알람 추가

         @method _addReminder
         @private
         */
        _addReminder: function () {
            this.reminderHelper.addReminder();
        },

        /**
         참석자 삭제

         @method _removeEventFromAttendees
         @private
         */
        _removeEventFromAttendees: function (userid, li) {
            $(li).remove();
            this.attendeesScheduleLayerView.removeEventListener(userid);
        },

        /**
         참석자 선택

         @method _addEventFromAttendees
         @private
         */
        _addEventFromAttendees: function (users) {
            this.attendeesScheduleLayerView.addEventListener(users);
        },

        getExternalAttendees: function () {
            return _.map(this.$("#externalArea").find("span.name"), function (wrap) {
                return {
                    id: "",
                    email: $(wrap).data("email"),
                    name: $(wrap).data("label") || "",
                    position: ""
                };
            });
        },


        initAutoComplete: function () {
            var options = {
                "autoResizeWidth": true,
                "makeFormat": true,
                "makeFormatFunc": $.proxy(this.makeFormatUnit, this),
                "multiple": false,
                "width": "400px",
                "matchCase": true,
                "notContact": "F",
                excSearchOption: "RIPD",
                isDomainSearch: "F",
                customLeft: true
            };

            this.$("#externalForm").autocomplete(GO.contextRoot + "api/mail/address/search/name", options);
        },


        makeFormatUnit: function (inputObj, value) {
            var self = this;

            if ($.trim(value) == "") return;

            addressArray = new Array();

            addressSplit = value.split(">,");
            for (var i = 0; i < addressSplit.length; i++) {
                tempAddressArray = addressSplit[i].split(",");

                for (var j = 0; j < tempAddressArray.length; j++) {
                    tempAddressArray[j] = $.trim(tempAddressArray[j]);
                }

                addressArray = addressArray.concat(GO.util.makeFormatEmail(tempAddressArray));
            }

            for (var i = 0; i < addressArray.length; i++) {
                value = addressArray[i];

                var isValid = GO.util.checkEmailFormat(value);
                var data = null;

                var displayName = (isValid) ? GO.util.get_name(value) : value;
                var displayText = (isValid) ? (displayName || GO.util.get_email(value)) : value;
                var nameField = $('<span class="name" id="nameField" evt-rol="select-field" onselectstart="return false"></span>')
                    .attr("title", displayText)
                    .data("email", isValid ? GO.util.get_email(value) : "")
                    .data("label", displayName)
                    .data("select", false)
                    .text(displayText);
                var modWrap = "";
                var delField = $('<span class="ic_classic ic_del"></span>');
                delField.attr("title", "삭제").click(function () {
                    var emailWrap = $(this).closest('li');
                    emailWrap.find("input.edit").unautocomplete();
                    emailWrap.remove();
                    inputObj.focus();
                });
                var delWrap = $('<span class="btn_wrap"></span>').append(delField);
                var addrWrap = $('<li></li>');
                addrWrap.append(nameField).append(modWrap).append(delWrap);
                this.$("#externalArea").show();
                this.$("#externals").append(addrWrap);
                inputObj.val("");
            }

            function getEmailByName(keyword) {
                var name = null;
                var email = null;

                $.ajax({
                    url: GO.contextRoot + "api/user/sort/list",
                    data: {
                        keyword: keyword
                    },
                    type: "GET",
                    async: false,
                    success: function (resp) {
                        hasName = resp.data.length > 0;
                        if (hasName) {
                            name = resp.data[0].name;
                            email = resp.data[0].email;
                        }
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });

                return {
                    hasName: hasName,
                    name: name,
                    email: email
                };
            }
        },

        _deleteAll: function () {
            this.$el.find("#attendee-list li").not(".default_option").not(".creat").remove();
        },

        _toggleAttendee: function (e) {
            var target = $(e.currentTarget);
            var arrow = target.find("span.ic");
            var isVisible = arrow.hasClass("ic_arrow_up");
            this.$("#attendee-list").find("li[data-more]").toggle(!isVisible);
            arrow.toggleClass("ic_arrow_up");
            arrow.toggleClass("ic_arrow_down");
        }
    });

    return CalendarRegistView;
});