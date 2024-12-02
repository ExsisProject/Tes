define("calendar/views/event_detail", function (require) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var moment = require("moment");
    var Hogan = require("hogan");
    var GO = require("app");
    var FormSpy = require("formspy");

    var RecurrenceParser = require("calendar/libs/recurrence_parser");
    var CalUtil = require("calendar/libs/util");
    var CalendarEvent = require("calendar/models/event");
    var Calendars = require("calendar/collections/calendars");
    var RegistFormHelper = require("calendar/helpers/regist_form");
    var AlarmPopupLayer = require("calendar/views/alarm_popup_layer");

    var FormAttendeesHelper = require("calendar/helpers/form_attendees");
    var FormReminderHelper = require("calendar/helpers/form_reminder");
    var FormFieldHelper = require("calendar/helpers/form_field");
    var EventRemoveConfirmLayer = require("calendar/helpers/event_remove_confirm_layer");
    var detailTopTpl = require("text!calendar/templates/_detail_top.html");

    var ExternalView = require("calendar/views/external_attendee");
    var LogView = require("calendar/views/calendar_log");
    var CommentView = require("comment");
    var AttendeesScheduleLayerView = require("calendar/views/attendees_schedule_layer");
    var calLang = require("i18n!calendar/nls/calendar");
    var commonLang = require("i18n!nls/commons");

    require("jquery.autocomplete");
    require("jquery.ui");
    require("jquery.go-popup");
    require("jquery.go-orgslide");

    // 상수 정의
    var SUMMARY_MAX_LENGTH = 500,
        EVENT_VISIBILITY = {"public": "public", "private": "private"},
        EVENT_TIMETYPE = {"allday": "allday", "timed": "timed"};

    var EventDetailView = Backbone.View.extend({
        className: "content_page schedule_form go_renew",

        editable: false,
        editableFields: {},

        events: {
            "click #attendee-list > li.creat": "_showOrgSlider",
            "click #btn-add-reminder": "_addReminder",
            "click #btn-confirm": "_confirm",
            "click #btn-goto-list": "_goToList",
            "click #btn-cancel": "_cancel",
            "click #btn-leave-attendee": "_leaveAttendee",
            "click #btn-remove-event": "_removeEvent",
            "click #btn-copy-event": "_copyEvent",
            "click #bottom-btn-confirm": "_confirm",
            "click #bottom-btn-goto-list": "_goToList",
            "click #bottom-btn-cancel": "_cancel",
            "click #bottom-btn-leave-attendee": "_leaveAttendee",
            "click #bottom-btn-remove-event": "_removeEvent",
            "click #bottom-btn-copy-event": "_copyEvent",
            "click li[data-tag=tab]": "_toggleTabView",
            "click #moreAttendee": "_toggleAttendee",
            "change [data-time-picker]": "_onChangeTime",
        },

        initialize: function (options) {
            this.options = options || {};
            this.formHelper = new RegistFormHelper(this.$el, 'detail');
            this.editable = false;
            this.submitFlag = false;
        },

        /**
         render

         @method render
         @return {Object} this.el 객체
         **/
        render: function () {
            this._prepareModel().done($.proxy(function () {
                this._setEditable();        // 수정권한 검사
                this._setDeletable();        // 삭제권한 검사
                this._prepareTemplate();    // 템플릿 준비
                this._initFormSpy();        // FormSpy 초기화
                this._initExtraHelpers();   // 기타 헬퍼 준비
                this._initButtons();        // 버튼 활성화

                this._renderCommentView();
                this._renderLogView();
                this._renderExternalAttendees();

                this._renderAttendeesSchedules();   // 참석자 일정 조회

                if (this.formHelper.isReservableAsset() && this.editable) {
                    this.formHelper.loadAsset(this.model.id);   // 자산예약 연동                    
                    this._bindAssetEvent();
                }

                var self = this;
                this.$el.on("externalAttendee:destroy", function (e, param) {
                    self.formspy.unregistChangedAttr(param);
                    var confirmBtns = self.$(".btn_group_confirm");
                    var actionBtns = self.$(".btn_group_action");
                    confirmBtns.css("display", "inline-block");
                    actionBtns.hide();
                });

                this.$el.off("externalAttendee:regist");
                this.$el.on("externalAttendee:regist", function (e, param) {
                    self.makeFormatUnit($("#externalForm"), param);
                    self.formspy.registChangedAttr(param);
                    var confirmBtns = self.$(".btn_group_confirm");
                    var actionBtns = self.$(".btn_group_action");
                    confirmBtns.css("display", "inline-block");
                    actionBtns.hide();
                });

            }, this));

            return this.el;
        },


        _bindAssetEvent: function () {
            var self = this;

            this.$el.on("asset-item:reserved", function (e, model) {
                var id = model.id;
                var attrName = "asset-" + id;

                if (self.formspy.getChangedAttrs(attrName) && self.model.isIncludedAttendee(id)) {
                    ;
                } else {
                    self.formspy.registChangedAttr(attrName, id);
                }
            });

            this.$el.on("asset-item:destroy", function (e, id) {
                var attrName = "asset-" + id;

                if (self.formspy.getChangedAttrs(attrName)) {
                    self.formspy.unregistChangedAttr(attrName);
                } else {
                    self.formspy.registChangedAttr(attrName, id);
                }
            });
        },


        /**
         일정 상세 수정 가능 여부 판단

         @method _isEditable
         @return {Boolean} 일정 상세 수정 가능 여부
         @private
         **/
        _setEditable: function () {
            this.editable = !!(this.model.get('permission').update === true && !this.isEhrInfo(this.model));
        },


        _setDeletable: function () {
            this.deletable = !!(this.model.get('permission').delete === true && !this.isEhrInfo(this.model));
        },


        /**
         확인 버튼 콜백
         - 반복일정이면 수정 확인 레이어 호출
         - 일반 일정이면 바로 수정
         @method _confirm
         @private
         @chainable
         **/
        _confirm: function (isNoti) {
            var self = this,
                // 취소할 경우 원래 상태로 돌려야 하므로 모델을 복사하여 사용한다. 
                colOnModel = this.model.clone(),
                isRecur = this.model.isRecurrence();

            // 중복 submit이 동작하지 않도록 한다.
            if (this.submitFlag) {
                $.goMessage(calLang["일정 수정 중 메시지"]);
                return false;
            }

            this.submitFlag = true;

            try {
                // 예약 자산 등록
                this.formHelper.saveReservationAssets();
                colOnModel.on("error:validate", $.proxy(this._validateErrorCallback, this));
                colOnModel.set(_.extend(this._getChangedData(), {type: colOnModel.get('type')}));

                if (colOnModel.isCompanyEvent() || colOnModel.isAlone()) {
                    checkRecur();
                } else {
                    confirmNoti().done(function () {
                        checkRecur();
                    }).fail(function () {
                        self.submitFlag = false;
                    });
                }
            } catch (e) {
                this.submitFlag = false;
            }

            // 반복이 해제 된 경우 => 전체 반복일정 수정으로 강제설정한 후 수정요청
            // 반복일정이며 반복조건이 유지될 경우 => 반복일정 삭제 레이어 호출
            // 반복일정 아닌 경우 => 단순 수정
            function checkRecur() {
                if (isRecur && !colOnModel.isRecurrence()) {
                    colOnModel.setRecurChangeType('all');
                    saveModel();
                } else if (isRecur && colOnModel.isRecurrence()) {
                    self._showConfirmLayer(colOnModel, 'update', true);
                } else {
                    saveModel();
                }
            }

            function confirmNoti() {
                var self = this,
                    deferred = $.Deferred();

                // 일정 알림 팝업 Layer
                this.alarmPopup = new AlarmPopupLayer();
                this.alarmPopup.setConfirmCallback(confirm, this);
                this.alarmPopup.setCancelCallback(cancel, this);
                this.alarmPopup.setCloseCallback(close, this);
                this.alarmPopup.render({"type": "web"});

                function confirm() {
                    var self = this;
                    var popupEl = $(self.alarmPopup.popupEl);
                    isPushNoti = popupEl.find("input:checkbox[id='chkbox_push']").is(":checked"),
                        isMailNoti = popupEl.find("input:checkbox[id='chkbox_mail']").is(":checked");

                    colOnModel.set("pushNoti", isPushNoti);
                    colOnModel.set("mailNoti", isMailNoti);
                    deferred.resolve();
                }

                function cancel() {
                    colOnModel.set("pushNoti", false);
                    colOnModel.set("mailNoti", false);
                    deferred.resolve();
                }

                function close() {
                    deferred.reject();
                }

                return deferred;
            }

            function saveModel() {
                colOnModel.save({}, {
                    success: function (model) {
                        self._goToList();
                    },
                    complete: function () {
                        self.submitFlag = false;
                    }
                });
            }

            return this;
        },

        /**
         데이터 검증시 에러 콜백 함수

         @method _validateErrorCallback
         @private
         */
        _validateErrorCallback: function (model, code, msg) {
            RegistFormHelper.prototype.raiseError.apply(this.formHelper, arguments);
            this.submitFlag = false;

            return this;
        },

        /**
         변경된 데이터 추출
         - input 요소는 Form 요소에서 바로 추출
         - 타이틀과 같이 수정모드/뷰모드가 바뀌는 대상은 FormSpy로 부터 추출
         - 참석자는 attendeeHelper로 부터 추철
         @method _getChangedData
         @return {Object} Event 모델 구조를 가진 해시객체
         @private
         **/
        _getChangedData: function () {
            // input 요소는 Form 요소에서 바로 추출하고, 타이틀과 같이 수정모드/뷰모드가 바뀌는 대상은 FormSpy로 부터 추출한다.
            var attrsFromSpy = _.pick(this.formspy.getChangedAttrs(), "summary", "location", "description"),
                attrsFromForm = this.formHelper.serializeFormData(),
                attrAttendees = {'attendees': _.union(this.attendeesHelper.getAttendees(), this.getExternalAttendees())};

            return _.extend({}, attrsFromForm, attrsFromSpy, attrAttendees);
        },

        /**
         취소 버튼 콜백

         @method _cancel
         @private
         @chainable
         **/
        _cancel: function () {
            this.$el.empty();
            this.render();
            return this;
        },

        /**
         모델 초기화 및 패치

         @method _prepareModel
         @private
         @chainable
         **/
        _prepareModel: function () {
            var self = this,
                deferred = $.Deferred();

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

            this.model.on("error:validate", function (model, code, msg) {
                $.goAlert(msg, '', function () {
                    self._cancel();
                });
            });

            return deferred;
        },

        /**
         템플릿 준비

         @method _prepareTemplate
         @private
         @chainable
         **/
        _prepareTemplate: function () {
            var startDt = GO.util.toMoment(this.model.get("startTime")),
                endDt = GO.util.toMoment(this.model.get("endTime")),
                recurrenceCode = this.model.get("recurrence"),
                parentId = this.model.get("parentId"),
                summary = this.model.get("summary"),
                recruHelper = new RecurrenceParser();

            // GO-16825 [캘린더] 타임존> 종일 일정 등록시 월간 캘린더와 상세 페이지의 날짜가 다른 현상 > 이슈 처리
            var startDateFormat = (this.model.get("timeType") === EVENT_TIMETYPE["allday"]) ? GO.util.dateFormatWithoutTimeZone(this.model.get("startTime")) : startDt.format("YYYY-MM-DD");
            var endDateFormat = (this.model.get("timeType") === EVENT_TIMETYPE["allday"]) ? GO.util.dateFormatWithoutTimeZone(this.model.get("endTime")) : endDt.format("YYYY-MM-DD");
            var timeZoneOffset = this.model.get("timeZoneOffset") || "";
            GO.util.store.set("timeZoneOffset", timeZoneOffset);
            var serverTZOffset = this.model.get("serverTZOffset") || GO.session().timeZone.serverTZOffset;
            var basicDateOfRecurrence = GO.util.toMoment(this.model.get("basicDateOfRecurrence")).format("YYYY-MM-DD");

            var self = this;
            this.formHelper.render({
                "summary": self.isEhrInfo(this.model) ? summary + "(" + this.model.get("creator").name + ")" : summary,
                "start_date": startDateFormat,
                "start_time": startDt.format("HH:mm"),
                "end_date": endDateFormat,
                "end_time": endDt.format("HH:mm"),
                "location": this.model.get("location"),
                "description": this.model.get("description"),
                "recurrence_code": recurrenceCode,
                "current_recurrence": recurrenceCode ? recruHelper.parse(recurrenceCode).humanize(timeZoneOffset, serverTZOffset) : "",
                "basic_date_recurrence": basicDateOfRecurrence,
                "editable?": this.editable,
                "removable?": this.deletable,
                "private?": (this.model.get("visibility") === EVENT_VISIBILITY["private"]),
                "allday_event?": (this.model.get("timeType") === EVENT_TIMETYPE["allday"]),
                "recurrence?": !!recurrenceCode,
                "show_visibility?": this.model.isNormalEvent(),
                "show_inner_attendees?": this.model.isNormalEvent(),
                "show_location?": (this.editable || !!this.model.get("location")),
                "show_description?": (this.editable || !!this.model.get("description")),
                "show_reminder?": this.editable,
                "show_calendar_select?": this.editable && this.model.isNormalEvent(),
                "is_company_event?": this.model.isCompanyEvent(),
                "company_calendar": (new Backbone.Collection(Calendars.getWritableCompanyCalendars())).toJSON(),
                "repeatable": !parentId,
                "is_select_company_calendar?": function () {
                    return self.model.get("calendarId") == this.id;
                },
                "unusual_repeat_msg": calLang["반복일정 중 수정된 일정 설명"]
            }, this._buildPartials());

            this.formHelper.loadMyCalendarOptions(Calendars.getMyCalendars(), this.model.get('calendarId'));

            return this;
        },

        /**
         Formspy 초기화

         @method _initFormSpy
         @private
         @chainable
         **/
        _initFormSpy: function () {
            // formspy
            this.formspy = new FormSpy(this.$el.find("#form-event"));

            // 이벤트 바인드
            this.formspy.on("changed:attribute", $.proxy(function (e, attrName, val) {
                this._showNotiRecurrenceRestrict(attrName, val);
                this._showHideConfirmButton();
            }, this));

            this.formspy.on("restored:all", $.proxy(function () {
                this._showHideConfirmButton();
            }, this));
        },

        /**
         기타 폼 헬퍼들 초기화

         @method _initFormHelpers
         @private
         @chainable
         **/
        _initExtraHelpers: function () {
            var reminders = this.model.get("reminders"),
                attendees = _.sortBy(this.model.get("attendees"), function (attendee) {
                    return attendee.id === GO.session("id") ? 1 : 2;
                });

            this.reminderHelper = new FormReminderHelper(this.$el.find("ul#reminder-list"), reminders, this.editable);
            _.each(reminders, function (reminder, i) {
                this.formspy.registry(this.$el.find("input[name=reminder_value_" + i + "]"));
                this.formspy.registry(this.$el.find("select[name=reminder_type_" + i + "]"));
                this.formspy.registry(this.$el.find("select[name=reminder_method_" + i + "]"));
            }, this);

            this.reminderHelper.on("removed:reminder", $.proxy(this._removeReminderCallback, this));
            this.attendeesHelper = new FormAttendeesHelper(this.$el.find("ul#attendee-list"), attendees, this.editable);
            this.attendeesHelper.addRemoveCallback($.proxy(this._removeEventFromAttendees, this));
            this.attendeesHelper.addAttendeeCallback($.proxy(this._addEventFromAttendees, this));
            return this;
        },

        /**
         버튼 초기화

         @method _initButtons
         @private
         @chainable
         **/
        _initButtons: function () {
            // jQuery.show()를 사용하면 display:inline으로 설정해서 문제가 됨. css() 함수를 이용해 직접 inline-block으로 지정(IE에서만 문제됨)
            if (this.attendeesHelper.includeMe(GO.session("id")) && !this.model.isAlone()) {
                this.$el.find("#btn-leave-attendee").css("display", "inline-block");
            }
            return this;
        },

        /**
         템플릿 partial 설정

         @method _buildPartials
         @return {Object} JSON 객체
         @private
         **/
        _buildPartials: function () {
            return {
                "title_and_date": Hogan.compile(detailTopTpl)
            };
        },

        /**
         조직도 슬라이드 호출

         @method _showOrgSlider
         @return {Object} 조직도 슬라이드 엘리먼트
         @private
         */
        // TODO: 등록 화면과 동일한 코드로 리팩토링 필요
        _showOrgSlider: function (e) {
            return $.goOrgSlide({
                header: calLang["참석자 추가"],
                type: 'node',
                desc: calLang["일정의 참석자로 추가할 사용자를 아래에서 선택하세요"],
                contextRoot: GO.config("contextRoot"),
                callback: $.proxy(this._addAttendees, this)
            });
        },

        /**
         조직도 클릭 이벤트 콜백

         @method _addAttendees
         @return {Object} 조직도 슬라이드 엘리먼트
         @private
         */
        _addAttendees: function (info) {
            this.attendeesHelper.addAttendee(info).done(_.bind(function (members) {
                _.each(members, function (memberInfo) {
                    var userid = memberInfo.id,
                        attrName = "attendee-" + userid;

                    if (this.formspy.getChangedAttrs(attrName) && this.model.isIncludedAttendee(userid)) {
                        ;
                    } else {
                        this.formspy.registChangedAttr(attrName, userid);
                    }
                }, this);
            }, this));

            return this;
        },

        /**
         알람추가 콜백

         @method _addReminder
         @private
         @chainable
         **/
        _addReminder: function () {
            var element = this.reminderHelper.addReminder();

            this.formspy.registry(element.find("input[name^=reminder_value]"), "-1");
            this.formspy.registry(element.find("select[name^=reminder_type]"));
            this.formspy.registry(element.find("select[name^=reminder_method]"));

            return this;
        },

        /**
         알람삭제 콜백

         @method _removeReminderCallback
         @private
         @chainable
         **/
        _removeReminderCallback: function (e, li, index) {
            var rvalue = li.find("input[name=reminder_value_" + index + "]"),
                rtype = li.find("select[name=reminder_type_" + index + "]"),
                rmethod = li.find("select[name=reminder_method_" + index + "]"),
                fn = (!!this.formspy.getChangedAttrs(rvalue.attr("name")) ? "unregistry" : "registry");

            this.formspy[fn].call(this.formspy, rvalue, -1);
            this.formspy[fn].call(this.formspy, rtype, -1);
            this.formspy[fn].call(this.formspy, rmethod, -1);

            return this;
        },

        /**
         목록 이동

         @method _goToList
         @private
         @chainable
         **/
        _goToList: function () {
            CalUtil.goToCalendar();
            return this;
        },


        /**
         수정/삭제 확인 레이어 호출

         @method _showConfirmLayer
         @param {Backbone.Model} model 모델
         @param {String} type 레이어 타입(remove, update, leave)
         @param  {Boolean} forceRecur 강제 반복일정으로 설정
         @return {Object} EventRemoveConfirmLayer 인스턴스
         @private
         **/
        _showConfirmLayer: function (model, type, forceRecur) {
            var self = this,
                layer = new EventRemoveConfirmLayer(model, type, forceRecur);

            layer.setCallbacks({
                complete: function () {
                    self.submitFlag = false;
                }
            });
            layer.render();
            return layer;
        },

        /**
         참석자에서 빠지기 버튼 콜백

         @method _leaveAttendee
         @return {Object} EventRemoveConfirmLayer 인스턴스
         @private
         **/
        _leaveAttendee: function () {
            this.model.set("attendees", this.attendeesHelper.getAttendees(GO.session("id")), {silent: true});
            return this._showConfirmLayer(this.model, 'leave');
        },

        /**
         참석자 항목을 삭제할 경우 일정삭제 콜백

         @method _removeEventFromAttendees
         @return {Object} EventRemoveConfirmLayer 인스턴스
         @private
         **/
        _removeEventFromAttendees: function (userid, li) {
            var attrName = "attendee-" + userid;
            if (this.attendeesHelper.isExistedAttendee(userid)) {
                var alength = this.attendeesHelper.getAttendees().length;
                if (GO.session("id") === userid || alength < 2) {
                    var attendees = this.attendeesHelper.getAttendees(userid);
                    var externalAttendees = this.getExternalAttendees();
                    var unionAttenddes = _.union(attendees, externalAttendees);
                    this.model.set("attendees", unionAttenddes, {silent: true});
                    if (alength == 1) {
                        this._showConfirmLayer(this.model, 'remove');
                    } else {
                        this._showConfirmLayer(this.model, 'leave');
                    }
                } else {
                    if (this.formspy.getChangedAttrs(attrName)) {
                        this.formspy.unregistChangedAttr(attrName);
                    } else {
                        this.formspy.registChangedAttr(attrName, userid);
                    }
                    $(li).remove();
                }
            } else {
                this.formspy.unregistChangedAttr(attrName);
                $(li).remove();
            }
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

        /**
         일정 삭제하기 버튼 콜백

         @method _removeEvent
         @return {Object} EventRemoveConfirmLayer 인스턴스
         @private
         **/
        _removeEvent: function (e) {
            return this._showConfirmLayer(this.model, 'remove');
        },

        /**
         * 일정 복사
         */
        _copyEvent: function () {
            var self = this;
            $.goPopup({
                title: calLang["일정을 복사하시겠습니까?"],
                contents: calLang["종일, 반복 설정과 예약하기는 복사 대상에서 제외됩니다."],
                buttons: [{
                    'btext': commonLang['확인'],
                    'btype': 'confirm',
                    'callback': function () {
                        GO.router.navigate('calendar/regist/copied/' + self.options.calendarId + '/' + self.options.eventId, true);
                    }
                }, {
                    'btext': commonLang['취소'],
                    'btype': 'normal'
                }]
            });
        },

        /**
         * 반복일정 일자 수정시 기준일자가 아닐 경우 Alert 처리
         */
        _showNotiRecurrenceRestrict: function (attrName, val) {
            var self = this,
                startDt = GO.util.toMoment(this.model.get("startTime")).format("YYYY-MM-DD"),
                endDt = GO.util.toMoment(this.model.get("endTime")).format("YYYY-MM-DD"),
                basicDateOfRecurrence = GO.util.toMoment(this.model.get("basicDateOfRecurrence")).format("YYYY-MM-DD");

            if (this.model.isRecurrence() && attrName == 'start_date') {

                $.goConfirm(calLang['반복 일정 수정'], calLang['반복일정을 수정하기 위해서는 반복 설정을 변경하셔야 합니다.'],
                    function (popupEl) {
                        self._showRecurLayer($('input#startDate').val());
                    }, function () {
                        if (attrName == 'start_date') {
                            $('input#startDate').val(startDt);
                            self._rejectEditStartDate(attrName);
                        }
                    }
                );
            }
        },

        _showRecurLayer: function (startDate) {
            this.formHelper._showHideRecurrenceSetupLayer(undefined, GO.util.getDay(startDate));
        },

        _rejectEditStartDate: function (attrName) {
            this.formspy.unregistChangedAttr(attrName);
        },

        /**
         확인/취소 보이기 토글

         @method _showHideConfirmButton
         @private
         @chainable
         **/
        _showHideConfirmButton: function () {
            if (this.editable) {
                var confirmBtns = this.$el.find(".btn_group_confirm"),
                    actionBtns = this.$el.find(".btn_group_action"),
                    checkTarget = confirmBtns.first();

                if (!checkTarget.is(":visible") && this.formspy.hasChangedAttrs()) {
                    confirmBtns.css("display", "inline-block");
                    actionBtns.hide();
                } else if (checkTarget.is(":visible") && !this.formspy.hasChangedAttrs()) {
                    confirmBtns.hide();
                    actionBtns.css("display", "inline-block");
                    if (this.model.isCompanyEvent() || this.model.isAlone()) {
                        $("#btn-leave-attendee").hide();
                    }
                }
            }

            return this;
        },


        _renderCommentView: function () {
            var self = this;

            this.commentView = CommentView.init({
                el: this.$("#commentArea"),
                typeUrl: "calendar/" + this.model.get("calendarId") + "/event",
                typeId: this.model.id
            });
            this.commentView.$el.on("comment:change", function (e, type, count) {
                self._setCommentCount(count);
                self.logView.render();
            });
            this.commentView.render();
            this.commentView.fetchComments(true).done(function () {
                self._setCommentCount(self.commentView.collection.length);
            });
        },


        _setCommentCount: function (count) {
            this.$("#commentCount").text(count);
        },


        _renderLogView: function () {
            this.logView = new LogView({
                calendarId: this.model.get("calendarId"),
                eventId: this.model.id
            });
            this.$("#logArea").html(this.logView.el);
            this.logView.render();
        },

        _renderAttendeesSchedules: function () {
            var _this = this;
            this.attendeesScheduleLayerView = new AttendeesScheduleLayerView({
                model: this.model
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

        _toggleTabView: function (e) {
            var target = $(e.currentTarget);
            var isVisible = target.hasClass("on");

            if (isVisible) return;

            var type = target.attr("data-type");
            var otherType = type == "comment" ? "log" : "comment";

            this.$("#" + type + "Area").toggle(!isVisible);
            this.$("#" + type + "Tab").toggleClass("on");
            this.$("#" + otherType + "Area").toggle(isVisible);
            this.$("#" + otherType + "Tab").toggleClass("on");
        },


        _toggleAttendee: function (e) {
            var target = $(e.currentTarget);
            var arrow = target.find("span.ic");
            var isVisible = arrow.hasClass("ic_arrow_up");
            this.$("#attendee-list").find("li[data-more]").toggle(!isVisible);
            arrow.toggleClass("ic_arrow_up");
            arrow.toggleClass("ic_arrow_down");
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


        _renderExternalAttendees: function () {
            this.formspy.unregistry(this.$("#externalForm"));
            this.initAutoComplete();

            var externalAttendees = this.model.getExternalAttendees();

            if (externalAttendees.length) this.$("#externalArea").show();

            _.each(externalAttendees, function (attendee) {
                var externalView = new ExternalView(attendee);
                this.$("#externals").append(externalView.render().el);
                this.formspy.__changedAttributes__[attendee.email] = attendee.email;
            }, this);
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
                    self.formspy.unregistChangedAttr(emailWrap.find("span.name").text());
                });
                var delWrap = $('<span class="btn_wrap"></span>').append(delField);
                var addrWrap = $('<li></li>');
                addrWrap.append(nameField).append(modWrap).append(delWrap);
                this.$("#externalArea").show();
                this.$("#externals").append(addrWrap);
                this.formspy.registChangedAttr(displayText, displayText);
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

        isEhrInfo: function (model) {
            return model.get('referenceId') ? true : false;
        }
    });

    return EventDetailView;
});