define("calendar/helpers/regist_form", function (require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var GO = require("app");
    var Hogan = require("hogan");
    var moment = require("moment");

    var RecurrenceLayerHelper = require("calendar/helpers/recurrence_layer");
    var CalUtil = require("calendar/libs/util");
    var Asset = require("calendar/views/asset");
    var formTpl = require("text!calendar/templates/form.html");
    var selectDateTpl = require("text!calendar/templates/_select_date.html");

    var commonLang = require("i18n!nls/commons");
    var calLang = require("i18n!calendar/nls/calendar");
    var assetLang = require("i18n!asset/nls/asset");
    var NameTagView = require("go-nametags");

    var GOCalendar = require("go-calendar");

    require("jquery.go-popup");
    require("jquery.cookie");

    var STEP_MINUTES = 30,
        _slice = Array.prototype.slice,
        tvars = {
            "start_time": "00:00",
            "end_time": "00:00",
            "recurrence_code": "",
            "regist?": true,
            "editable?": false,
            "private?": false,
            "recurrence?": false,
            "show_visibility?": true,
            "show_inner_attendees?": true,
            "show_location?": true,
            "show_description?": true,
            "show_reminder?": true,
            "allday_event?": false,
            "calendar_manager?": false,
            "use_asset?": false,
            "use_org?": GO.session("useOrg"),
            "show_calendar_select?": true,
            "repeatable": true,     // 새로운 일정 등록시 반복설정 등록 가능

            "label": {
                "title": calLang["일정명"],
                "privacy": commonLang["비공개"],
                "datetime": calLang["일시"],
                "allday": calLang["종일"],
                "recurrence": calLang["반복"],
                "remove": commonLang["삭제"],
                "public_event": calLang["전사일정"],
                "attendees": calLang["참석자"],
                "select_attendees": calLang["참석자 선택"],
                "location": calLang["장소"],
                "desc": commonLang["내용"],
                "reminder": calLang["알람"],
                "modify": commonLang["수정"],
                "add_reminder": calLang["알람 추가"],
                "confirm": commonLang["확인"],
                "cancel": commonLang["취소"],
                "remove": commonLang["삭제"],
                "goto_list": calLang["캘린더로 돌아가기"], 
                "leave_attendee": calLang["참석자에서 빠지기"], 
                "remove_event": calLang["일정 삭제하기"],
                "copy_event" : calLang["일정 복사"],
                "reserving_asset": calLang["예약하기"], 
                "my_calendar": calLang["내 캘린더"],
                "comment" : commonLang["댓글"],
                "history" : commonLang["변경이력"],
                "external_participants" : calLang["외부참석자"],
                "add" : commonLang["추가"],
                "delete_all" : commonLang["전체 삭제"],
                "more" : commonLang["더보기"],
                'copy_url': commonLang['URL 복사']
            },
            "msg": {
                "private_event_info": calLang["비공개 일정은 참석자만 확인 가능합니다."],
                "public_event_info": calLang["전사일정은 사용자 전체에게 보여집니다."],
                "atendee_alarm_msg": calLang["참석자 알람 안내 메시지"],
                "asset_reservation_msg": calLang["설정한 시간대에 예약 가능한 회의실만 보여집니다."]
            }
        };

    var RegistFormHelper = (function () {

        var reservedIds = [];

        var constructor = function (element, formType, editable) {
            this.el = element;
            this.$el = $(element);
            this.type = (formType || 'regist');
            this.editable = typeof editable === 'undefined' ? true : editable;

            if (!this._isValidType(this.type)) throw new Error('Invaild form type.(regist or detail)');

            this.compiledForm = Hogan.compile(formTpl);
            this.variables = {};

            this.variables = $.extend(true, {}, tvars, {
                "regist?": this.type === 'regist' ? true : false,
                "detail?": this.isDetailType(),
                "editable?": this.editable,
                "use_asset?": GO.isAvailableApp("asset")
            });

            this.partials = {
                "select_date": Hogan.compile(selectDateTpl)
            };

        };

        constructor.prototype = {
            /**
             폼 HTML 렌더링

             @method render
             */
            render: function () {
                var tplVars = arguments[0] || {};
                var form = this.compiledForm;
                var args = _slice.call(arguments, 2);

                // GO-18844 : 캘린더 상세화면에서 겹따옴표 사용시 따옴표 안의 내용이 나타나지 않는 현상
                var summary = tplVars.summary;
                if(summary && summary.length > 0) {
                    tplVars.summary = summary.replace(/"/gi, '&quot;');
                }
                var location = tplVars.location;
                if(location && location.length > 0) {
                    tplVars.location = location.replace(/"/gi, '&quot;');
                }

                // underscore의 _.extend는 deep 기능이 없다. 따라서, $.extend를 대신 사용
                args.unshift($.extend(true, this.variables, tplVars, {"show_recurrence_wrap" : tplVars["recurrence?"] && tplVars["repeatable"]}), $.extend(this.partials, arguments[1]));
                this.el.empty().html(Hogan.Template.prototype.render.apply(form, args));

                this.undelegateEvents();
                this.delegateEvents();

                this.datepickerHelper = GOCalendar.init({
                    el: this.$el.find("#selectDate"),
                    startDate: this.variables.start_date || this.$el.find("#startDate").val(),
                    startTime: this.variables.start_time || this.$el.find("#startTime").val(),
                    endDate: this.variables.end_date || this.$el.find("#endDate").val(),
                    endTime: this.variables.end_time || this.$el.find("#endTime").val(),
                    "lang": {
                        "내 캘린더": calLang["내 캘린더"],
                        "일정 등록": calLang["일정 등록"],
                        "일정명": calLang["일정명"],
                        "일시": calLang["일시"],
                        "시간": calLang["시간"],
                        "종일": calLang["종일"],
                        "확인": commonLang["확인"],
                        "취소": commonLang["취소"],
                        "일정상세 입력": calLang["일정상세 입력"],
                        "기본 캘린더 이름": calLang["캘린더 기본이름"],
                        "기본 캘린더 표시": calLang["기본 캘린더 표시"],
                        "분": calLang["분"],
                        "전사일정": calLang["전사일정"],
                        "알림메일 확인": calLang["알림메일 확인"],
                        "일정등록에 대한 알림메일을 보내시겠습니까?": calLang["일정등록에 대한 알림메일을 보내시겠습니까?"],
                        "보내기": commonLang["보내기"],
                        "보내지 않음": calLang["보내지 않음"]
                    }
                });

                this._afterDateChanged();
                this._showHideAssetViews();

                return this;
            },

            _afterDateChanged: function () {
                var self = this;
                if (!GO.isAvailableApp("asset")) return false;

                this.datepickerHelper.afterChanged($.proxy(function () {
                    if ($('.reserved-asset-item').length > 0) {
                        this._removeReservedAssetItems({
                            confirm: function () {
                                self._showHideAssetViews();
                            },
                            cancel: function () {
                                // TODO : 취소 버튼 비정상 처리로 인하여 1차적으로 주석처리
                                // datepickerHelper가 datepicker -> GOCalendar로 변경된 히스토리 파악 후 적용 필요함
                                self.datepickerHelper.reset(this.datepickerHelper.options);
                            }
                        });

                    } else {
                        this._showHideAssetViews();
                    }
                }, this));
            },

            /**
             * TODO: 리팩토링...(뭔가 복잡하게 되어 있음... 정리 필요)
             */
            loadMyCalendarOptions: function (calendars, selectedId) {
                var buff = [];
                var $select = this.$el.find('select[name=calendar_id]');
                var defaultCalendar = calendars[0];

                _.each(calendars, function (calendar, i) {
                    if (calendar.get('defaultCalendar') === true) {
                        defaultCalendar = calendar;
                    }
                    buff.push(
                        '<option value="', calendar.id, '">',
                        calendar.get('defaultCalendar') ? calLang["기본 캘린더 표시"] : '',
                        GO.util.escapeHtml(calendar.get('name')) || GO.i18n(calLang["기본 캘린더 이름"], {"username": calendar.get('owner').name}),
                        '</option>'
                    );
                }, this);

                $select.empty().append(buff.join(""));

                if (!!selectedId) {
                    $select.val(selectedId);
                } else {
                    $select.val(defaultCalendar.id);
                }
            },

            /**
             자산예약 연동(리팩토링 필요)

             @method loadAsset
             */
            loadAsset: function (eventId) {
                if (GO.isAvailableApp("asset")) {

                    console.log("loadAsset() Call!!!");

                    var timeInfo = this.datepickerHelper.getCurrentTimeInfo();
                    Asset.load('#asset-wrapper', timeInfo.startTime, timeInfo.endTime, eventId, $('#all_day').is(":checked"), $("#check-recurrence").is(":checked"));
                }
            },

            getForReserveAssetItems: function () {
                return Asset.getForReserveAssetItems();
            },

            // 캘린더 확인버튼 클릭시 - AssetItems 저장 처리
            saveReservationAssets: function () {

                // 기 등록 예약 자산 삭제 후 재 등록
                var self = this,
                    assetItems = Asset.getForReserveAssetItems(),
                    deferred = $.Deferred(),
                    startDate = this.$el.find('#startDate').val(),
                    startTime = this.$el.find('#startTime').val(),
                    endDate = this.$el.find('#endDate').val(),
                    endTime = this.$el.find('#endTime').val(),
                    summary = this.$el.find('input[name="summary"]').val();

                // 일정 등록시 Validate Check - summary Length 확인
                if (summary == "") {
                    return;
                }

                if (!$.isArray(assetItems)) {
                    assetItems = [assetItems];
                }

                var format = "YYYY-MM-DD HH:mm";
                var startDateTime = GO.util.toISO8601(GO.util.toMoment(startDate + " " + startTime, format));
                var endDateTime = GO.util.toISO8601(GO.util.toMoment(endDate + " " + endTime, format));
                var allday = $('#all_day').is(':checked');

                _.each(assetItems, function (assetItem, i) {
                    if (assetItem.get("startTime") != startDateTime && !allday) {
                        assetItem.set("startTime", startDateTime);
                    }
                    if (assetItem.get("endTime") != endDateTime && !allday) {
                        assetItem.set("endTime", endDateTime);
                    }
                });

                var len = assetItems.length;
                for (var i = 0; i < len; i++) {
                    var newModel = assetItems[i];
                    var itemId  = newModel.get("itemId");
                    var itemIsMine = $("li.reserved-asset-item[data-id=" + itemId + "]").data("mine");

                    if(itemIsMine) {
                        continue;
                    }

                    deferred = $.ajax({
                        url: GO.contextRoot + "api/asset/" + newModel.get('assetId') + "/item/" + newModel.get('itemId') + "/reserve",
                        type: "POST",
                        async: false,
                        data: JSON.stringify(newModel),
                        dataType: "json",
                        contentType: "application/json;",
                        success: function (response) {
                            reservedIds.push(response.data.id);
                        },
                        error: function (response) {
                            $.goMessage(assetLang['예약하려는 시간대에 이미 예약된 건이 포함되어있습니다.']);
                        }
                    });
                }

                // 1. 일정등록시 동시에 등록한 자산정보 초기화 처리함
                Asset.resetAssetItemList();

                return deferred;
            },

            /**
             이벤트 바인딩

             @method delegateEvents
             */
            delegateEvents: function () {
                this.el.on("click.calendar-regist", "#all_day", $.proxy(this._toggleAlldayCallback, this));
                this.el.on("click.calendar-regist", "#check-recurrence", $.proxy(this._showHideRecurrenceSetupLayer, this));
                this.el.on("click.calendar-regist", "#recurrence-wrap .recur_delete", $.proxy(this._removeRecurrence, this));
                this.el.on("click.calendar-regist", "#recurrence-wrap .recur_edit", $.proxy(this._editRecurrence, this));
                this.el.on("click.calendar-regist", "#check-company-event", $.proxy(this._checkCompanyEvent, this));
                this.el.on("keyup.calendar-regist", "textarea", $.proxy(this._textAreaExpand, this));
                this.el.on("click.calendar-regist", "#addExternal", $.proxy(this._addExternal, this));

                CalUtil.bindDatepickerIcon(this.el, 'calendar-regist');
                return this;
            },

            /**
             이벤트 언바인딩

             @method delegateEvents
             */
            undelegateEvents: function () {
                this.el.off(".calendar-regist");
                return this;
            },

            _textAreaExpand: function (e) {
                GO.util.textAreaExpand(e);
            },

            _showHideAssetViews: function () {
                var timeInfo = this.datepickerHelper.getCurrentTimeInfo();

                if (!GO.isAvailableApp("asset")) return;
                if ($('#asset-wrapper').is(":empty")) return;

                if (this.isReservableAsset.call(this, timeInfo)) {
                    assetViewChangeTime(timeInfo);
                    $('#asset-list-row').show();
                } else {
                    $('#asset-list-row').hide();
                }


            },

            isReservableAsset: function (timeInfo) {
                var timeInterval = timeInfo || this.datepickerHelper.getCurrentTimeInfo();

                if (this.el.find('#check-recurrence').is(":checked")) return false;

                return true;
            },

            // 캘린더 취소버튼 클릭시 - 자산 등록 전체 취소
            // 확인 필요 이슈 : 이미 등록되어 있는 자산일 경우 Skip
            initReservedAssetItems: function (callbacks) {
                var self = this;

                if ($('.reserved-asset-item').length > 0) {
                    this._removeReservedAssetItems(callbacks)
                } else {
                    callbacks.confirm();
                }
            },

            _removeReservedAssetItems: function (callbacks) {
                var self = this;

                if (typeof callbacks.confirm !== 'function') {
                    callbacks.confirm = function () {
                    };
                }

                if (typeof callbacks.cancel !== 'function') {
                    callbacks.cancel = function () {
                    };
                }

                $.goPopup({
                    "title": calLang["예약 취소"],
                    "message": calLang["일정 변경시 자산 예약 취소 메시지"],
                    "modal": true,
                    "buttons": [{
                        "btext": commonLang["확인"],
                        "btype": "confirm",
                        "callback": function () {
                            Asset.resetAssetItemList();
                            Asset.cancelReservationAll().done(function () {
                                console.log("_removeReservedAssetItems complete!!!");
//                                	self.loadAsset();
                                callbacks.confirm.call(self);
                            });
                        }
                    }, {
                        "btext": commonLang["취소"],
                        "btype": "cancel",
                        "callback": function () {
                            self.loadAsset();
                            $("input:checkbox[id='check-recurrence']").removeAttr('checked');
                            $.proxy(callbacks.cancel, self);
                        }
                    }]
                });
            },

            /**
             입력된 폼을 API 구조에 맞게 변경 후 반환

             @method _serializeFormData
             @return {Object} JSON 데이터
             */
            serializeFormData: function () {
                var data = {},
                    $form = this.el.find("form"),
                    pickedData = {},
                    formData = GO.util.serializeForm($form),
                    visibility = ("visibility" in formData ? formData["visibility"] : "public"),
                    timeType = ("timeType" in formData ? formData["timeType"] : "timed"),
                    reservedAssets = {};

                _.each(["summary", "location", "description", "recurrence"], function (fieldname) {
                    var $field = $form.find("input[name=" + fieldname + "]:not(.edit), textarea[name=" + fieldname + "]:not(.edit)");
                    if ($field.length > 0) {
                        pickedData[fieldname] = $field.val();
                    }
                });

                var format = "YYYY-MM-DD HH:mm";
                var startTime = GO.util.toISO8601(GO.util.toMoment(formData.start_date + " " + formData.start_time, format));
                var endTime = GO.util.toISO8601(GO.util.toMoment(formData.end_date + " " + formData.end_time, format));

                if (timeType === 'allday') {
                    format = "YYYY-MM-DDTHH:mm:ss.SSS" + GO.session().timeZone.serverTZOffset;
                    startTime = moment(formData.start_date, "YYYY-MM-DD").clone().startOf("day").format(format);
                    endTime = moment(formData.end_date, "YYYY-MM-DD").clone().endOf("day").format(format);
                }

                // XSS 보안취약점 대응
                if (pickedData['summary']) {
                    pickedData.summary = this._xssFilter(pickedData.summary);
                }
                if (pickedData['location']) {
                    pickedData.location = this._xssFilter(pickedData.location);
                }
                if (pickedData['description']) {
                    pickedData.description = this._xssFilter(pickedData.description);
                }

                // 자산예약 연동
                if (GO.isAvailableApp("asset")) {
                    reservedAssets.assetReservationIds = reservedIds;
                    reservedIds = [];
                }

                data = _.extend({
                    "type": formData.is_company_event ? "company" : "normal",
                    "visibility": visibility,
                    "startTime": startTime,
                    "endTime": endTime,
                    "timeType": timeType,
                    "recurrence": "",
                    "reminders": this._convertRemindersHash(formData),
                    "timeZoneOffset": GO.util.timeZoneOffset(),
                    "calendarId": formData.is_company_event ? parseInt(formData.company_calendar_id) : parseInt(formData.calendar_id)
                }, pickedData, reservedAssets);

                return data;
            },

            /**
             목록으로 이동(Deprecated)

             @method goToList
             @chainable
             */
            goToList: function () {
                CalUtil.goToCalendar();
            },

            /**
             Detail 타입인가?

             @method isDetailType
             @private
             */
            isDetailType: function () {
                return !!(this.type === "detail");
            },

            raiseError: function (model, code, msg) {
                var option = Array.prototype.slice.call(arguments, 3);

                switch (code) {
                    case "numeric:reminder_time":
                    case "min:reminder_time":
                    case "max:reminder_time":
                        var elem = this.el.find('input[name^="reminder_value_"]')[option[0]];
                        $(elem).val('30');
                        break;
                    case "required:summary":
                    case "max:summary":
                        showErrorMsg(this.$el.find('input[name="summary"]'), msg);
                        break;
                    case "max:location":
                        showErrorMsg(this.$el.find('input[name="location"]'), msg);
                        break;

                    case "max:description":
                        showErrorMsg(this.$el.find('textarea[name="description"]'), msg);
                        break;

                    case "required:attendees":
                        showErrorMsg(this.$el.find('#attendee-list'), msg);
                        break;
                    default:
                        $.goSlideMessage(msg, 'caution');
                        break;
                }
            },

            _xssFilter: function (str) {
                return GO.util.XSSFilter(str);
            },

            /**
             전사일정 체크박스 클릭 콜백

             @method _checkCompanyEvent
             @param {jQuery.Event} jQuery Event 객체
             @chainable
             */
            _checkCompanyEvent: function (e) {
                var $target = $(e.currentTarget),
                    attendeeLow = this.el.find("#attendee-list-row"),
                    userCalendarSelectRow = this.el.find("#calendar-list-row"),
                    companyCalendarSelectRow = this.el.find("#company-calendar-list"),
                    checkVisibility = this.el.find("#check-visibility"),
                    visibilityOptWrap = checkVisibility.parent();

                if ($target.is(":checked")) {
                    attendeeLow.hide();
                    userCalendarSelectRow.hide();
                    companyCalendarSelectRow.show();
                    checkVisibility.attr("checked", false);
                    checkVisibility.attr("disabled", true);
                    visibilityOptWrap.addClass("disabled");
                } else {
                    checkVisibility.attr("disabled", false);
                    visibilityOptWrap.removeClass("disabled");
                    attendeeLow.show();
                    userCalendarSelectRow.show();
                    companyCalendarSelectRow.hide();
                }

                return this;
            },

            /**
             외부참석자 추가

             @method _addExternal
             */
            _addExternal: function () {
                var email = this.$el.find("#externalForm").val();
                if (!email) return;

                /*var item = new ExternalView({
                    email : email
                });*/

                //this.$el.find("#externals").append(item.render().el);
                this.$el.find("#externalForm").val("");
                this.$el.find("#externalArea").show();
                this.$el.trigger("externalAttendee:regist", email);
            },

            /**
             입력된 일자와 시간을 ISO8601 포맷으로 변환

             @method _toISO8601
             @param {String} date 일자(문자열)
             @param {String} time 시간(문자열)
             @return {String} ISO8601 형태의 문자열
             @private
             */
            _toISO8601: function (date, time) {
                return GO.util.toISO8601(GO.util.toMoment(date + " " + time, "YYYY-MM-DD HH:mm"));
            },

            /**
             입력 미리알림 정보를 전송 포맷으로 변환

             @method _toISO8601
             @param {Object} formData serialized form data(JSON)
             @return {Array} 미리알림 전송 포맷(배열)
             @private
             */
            _convertRemindersHash: function () {
                var self = this,
                    reminders = [],
                    reminderValEl = this.$el.find('input[name^="reminder_value_"]');

                if (reminderValEl.length > 0) {
                    reminderValEl.each(function (i, el) {
                        var index = $(el).parent().data("index");
                        reminders.push({
                            "time": parseInt($(el).val()),
                            "type": self.$el.find("select[name=reminder_type_" + index + "] > option:selected").val(),
                            "method": self.$el.find("select[name=reminder_method_" + index + "] > option:selected").val()
                        });
                    });
                }
                return reminders;
            },

            /**
             종일 체크박스 체크 콜백

             @method _toggleAlldayCallback
             @private
             */
            _toggleAlldayCallback: function (e) {
                console.log("CalendarRegistView#_toggleAlldayCallback");
                var self = this,
                    $target = $(e.target);
                $selectDate = this.el.find("span.wrap_select_list");

                if ($('.reserved-asset-item').length > 0) {
                    this._removeReservedAssetItems({
                        confirm: function () {
                            toggleCheckbox.call(self);
                            self._showHideAssetViews();
                        },
                        cancel: function () {
                            $target.prop("checked", false);
                        }
                    });
                } else {
                    toggleCheckbox.call(this);
                    self._showHideAssetViews();
                }

                function toggleCheckbox() {
                    if ($target.is(":checked")) {
                        $selectDate.hide();
                    } else {
                        this.datepickerHelper.updateSelectedTime(GO.util.now());
                        $selectDate.show();
                    }
                }
            },
            /**
             허용되는 폼 타입인지 검증

             @method _isValidType
             @return {Boolean} 허용하는 폼 타입인지 여부
             @private
             */
            _isValidType: function (type) {
                return _.contains(['regist', 'detail'], type);
            },

            /**
             반복일정 레이어 호출

             @method _showHideRecurrenceSetupLayer
             @return {Object} 조직도 슬라이드 엘리먼트
             @private
             */
            _showHideRecurrenceSetupLayer: function (e, day) {
                var self = this,
                    recurrenceChk = $("input:checkbox[id='check-recurrence']");

                console.log("CalendarRegistView#_showHideRecurrenceSetupLayer");

                // DOM에 Asset Layer 존재여부 확인
                if ($('.reserved-asset-item').length > 0) {
                    var self = this;
                    this._removeReservedAssetItems({
                        confirm: function () {
                            self._showHideAssetViews();
                            showLayer.call(self, day);
                        },
                        cancel: function () {
                            $(e.currentTarget).prop("checked", false);
                        }
                    })
                } else {
                    showLayer.call(this, day);
                    this._showHideAssetViews();
                    if (!recurrenceChk.prop('checked')) {
                        self.loadAsset();
                    }
                }

                // Recurrence Setting Pop-Up
                function showLayer(day) {
                    if (this._getRecurrenceCheckbox().is(":checked")) {
                        var startDate = this.el.find("#startDate").val(),
                            recurHelper = new RecurrenceLayerHelper(startDate, true, this._getRecurrenceField().val(), day),
                            offset = this._getRecurrenceCheckbox().offset();

                        offset["top"] = parseInt(offset["top"]) + 30;

                        var recurHelperWidth = parseInt(window.width);
                        var windowWidth = parseInt(jQuery(window).width());

                        if ((parseInt(offset["left"]) + recurHelperWidth) > windowWidth) {
                            offset["left"] = parseInt(offset["left"]) + jQuery(window).scrollLeft() - ((parseInt(offset["left"]) + recurHelperWidth) - windowWidth);
                        }

                        recurHelper.setConfirmCallback(this._updateRecurrenceText, this);
                        recurHelper.setCancelCallback(this._cancelUpdateRecurrence, this);
                        recurHelper.setCloseCallback(this._cancelUpdateRecurrence, this);
                        recurHelper.render(offset);
                    } else {
                        this._removeRecurrence();
                    }
                }
            },

            /**
             반복일정 설정 텍스트

             @method _updateRecurrenceText
             @param {String} code Recurrence 코드값
             @param {String} text Recurrence 출력 텍스트
             @return {Object} RegistFormHelper 객체
             @private
             */
            _updateRecurrenceText: function (code, text) {
                this._getRecurrenceWrap().show();
                this._getRecurrenceTextWrap().text(text);
                this._updateRecurrenceField(code);
                return this;
            },

            /**
             반복일정 hidden 필드 업데이트

             @method _updateRecurrenceField
             @param {String} code Recurrence 코드값
             @return {Object} RegistFormHelper 객체
             @private
             */
            _updateRecurrenceField: function (code) {
                this._getRecurrenceField().val(code);
                // hidden 필드의 경우 change 이벤트를 강제로 일으킨다.
                if (this.isDetailType()) this._getRecurrenceField().trigger("change");
                return this;
            },

            /**
             반복일정 수정 취소 콜백

             @method _updateRecurrenceText
             @param {Object} $.Event 객체
             @return {Object} RegistFormHelper 객체
             @private
             */
            _cancelUpdateRecurrence: function () {
                var self = this;
                if (!this._getRecurrenceField().val()) {
                    this._uncheckRecurrence();
                    self.loadAsset();
                }

                return this;
            },

            /**
             반복일정 삭제

             @method _removeRecurrence
             @param {Object} $.Event 객체
             @return {Object} CalendarRegistView 객체
             @private
             @chainable
             */
            _removeRecurrence: function (e) {
                var self = this,
                    recurrenceChk = $("input:checkbox[id='check-recurrence']");

                this._getRecurrenceTextWrap().text("");
                this._updateRecurrenceField("");
                this._getRecurrenceWrap().hide();
                this._uncheckRecurrence();

                if ($('.reserved-asset-item').length == 0) {
                    this._showHideAssetViews();
                    if (!recurrenceChk.prop('checked')) {
                        self.loadAsset();
                    }
                }

                return this;
            },

            _editRecurrence: function (e) {
                this._showHideRecurrenceSetupLayer();
            },

            _uncheckRecurrence: function () {
                var elem = this._getRecurrenceCheckbox();

                if (elem.is(":checked")) {
                    elem.attr("checked", false);
                    elem.trigger('change');
                }

                this._showHideAssetViews();
            },

            _getRecurrenceCheckbox: function () {
                return this.$el.find("#check-recurrence");
            },

            _getRecurrenceWrap: function () {
                return this.$el.find("#recurrence-wrap");
            },

            _getRecurrenceField: function () {
                return this.$el.find("#recurrence-wrap input[name=recurrence]");
            },

            _getRecurrenceTextWrap: function () {
                return this.$el.find("#recurrence-text");
            }
        };

        return constructor;
    })();

    function assetViewChangeTime(timeInfo) {
        // 자산 예약 변경
        $('.asset-reservation').each(function (i, el) {
            var assetView = $(el).data('asset-view');
            assetView.changeTime(timeInfo.startTime, timeInfo.endTime, $('#all_day').is(":checked"));
        });
    }

    function showErrorMsg(target, msg) {
        $.goError(msg, target);
        target.addClass('enter error').focus();
    }

    return RegistFormHelper;
});
