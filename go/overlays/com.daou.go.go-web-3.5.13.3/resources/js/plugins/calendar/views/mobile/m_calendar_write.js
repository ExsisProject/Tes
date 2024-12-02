define("calendar/views/mobile/m_calendar_write", function (require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");

    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var layoutTpl = require("hgn!calendar/templates/mobile/m_calendar_write");
    var reminderTpl = require("hgn!calendar/templates/mobile/m_reminder");
    var attendeeTpl = require("hgn!calendar/templates/mobile/m_attendee");
    var assetTpl = require("hgn!calendar/templates/mobile/m_asset");

    var Calendars = require("calendar/collections/calendars");
    var CalendarEvent = require("calendar/models/event");
    var AssetCalCollection = require("asset/collections/asset_calendar");
    var assetItemModel = require("asset/models/asset_user_create");
    var OrgView = require("views/mobile/m_org");
    var ExternalView = require("calendar/views/external_attendee");
    var AlarmPopupLayer = require("calendar/views/alarm_popup_layer");

    var commonLang = require("i18n!nls/commons");
    var calendarLang = require("i18n!calendar/nls/calendar");
    var assetLang = require("i18n!asset/nls/asset");
    var CalUtil = require("calendar/libs/util");

    require("jquery.mobile.autocomplete");
    require("GO.util");
    require("jquery.ui");
    require("jquery.go-sdk");

    var lang = {
        'minute': calendarLang['분전'],
        'hour': calendarLang['시간전'],
        'week': calendarLang['주전'],
        'day': calendarLang['일전'],
        'subject': calendarLang['일정명'],
        'add': commonLang['추가'],
        'allday': calendarLang['종일'],
        'attendees': calendarLang['참석자'],
        'location': calendarLang['장소'],
        'reminder': calendarLang['알람'],
        'my_cal': calendarLang['내 캘린더'],
        'placeholder_subject': calendarLang['제목을 입려하려면 누르세요'],
        'placeholder_location': calendarLang['장소를 입려하려면 누르세요'],
        'placeholder_content': calendarLang['내용을 입력하세요'],
        'start': calendarLang['시작'],
        'end': calendarLang['종료'],
        'private': commonLang['비공개'],
        'reservation': calendarLang['예약'],
        'alert_no_reservation': commonLang['예약할 수 없습니다.'],
        'alert_oneday': commonLang['예약은 하루만 가능합니다.'],
        'alert_cancel_asset': calendarLang['예약한 자산이 취소됩니다.'],
        'cal_default': calendarLang["기본 캘린더 표시"],
        "external_participants": calendarLang["외부참석자"],
        "companyType": calendarLang["전사일정"],
        "pushNoti": calendarLang["푸시알림"],
        "mailNoti": calendarLang["메일알림"]
    };

    var now = GO.util.now();

    var CalendarWrite = Backbone.View.extend({

        initialize: function (options) {
            this.headerToolbarView = HeaderToolbarView;
            this.isSaving = false;
            this.eventDate = options.eventDate;
            this.calendarId = options.calendarId || '';
            this.eventId = options.eventId || '';
            this.isCopied = options.isCopied;
            this.startTime = options.startTime; // 예약후 다시 일정등록 페이지로 올때
            this.endTime = options.endTime; // 시작시간,끝난시간

            if (!this.key) {
                this.key = options.queryString || "empty";
            }
            this.mcalendarAsset = GO.util.store.get(this.key);

            if (this.mcalendarAsset) {
                this.calendarId = this.mcalendarAsset.calendarId ? this.mcalendarAsset.calendarId : this.calendarId;
                this.eventId = this.mcalendarAsset.eventId ? this.mcalendarAsset.eventId : this.eventId;
                this.isCopied = this.mcalendarAsset.isCopied ? this.mcalendarAsset.isCopied : this.isCopied;
            }

            this.eventModel = new CalendarEvent(_.extend({
                id: this.eventId,
                calendarId: this.calendarId
            }, this.mcalendarAsset));

            this.assetList = new AssetCalCollection({
                type: "assetList"
            });

            this.reservations = new AssetCalCollection({
                type: "current",
                eventId: this.eventId
            });

            this.headerBindEvent();
        },

        headerBindEvent: function () {
            GO.EventEmitter.off("trigger-action");
            GO.EventEmitter.on('trigger-action', 'calendar-save', this.calendarSaveAction, this);
        },
        events: {
            "vclick a[data-btntype='userAddBtn']": "callUserAddBtn",
            "vclick a[data-btntype='remindersAdd']": "addReminderTemplete",
            "vclick a[data-btntype='reminderDelete']": "reminderDelete",
            "vclick a[data-btntype='asset']": "moveAssetList",
            "vclick span[data-btntype='assetDelete']": "_onClickDeleteAssetItem",
            "vclick #addExternal": "addExternal",
            "vclick #delete_all_attendees": "_deleteAll",
            "vclick span[data-btntype='attendeeDelete']": "deleteAttendee",
            "keyup #description": "expandTextarea",
            "change #allDay": "_onChangeAllDay",
            "change #startTime": "changeStartTime",
            "change #startTime, #endTime, #startDate, #endDate": "changeTime",
            "change #startDate": "_onChangeStartDate",
            "change #companyType": "_onCompanyCheckboxClicked",
            "change #visibility": "_onPrivateCheckboxClicked"
        },

        render: function () {
            if ($('div[data-role="layer"]').length) {
                $('div[data-role="layer"]').remove();
                return false;
            }

            if (GO.isAvailableApp("asset") == true) {
                this.assetList.on("sync", $.proxy(function (collection, response) {
                    this.renderWrite(collection.toJSON());
                }, this));
                this.assetList.fetch();
            } else {
                this.renderWrite([]);
            }

            return this;
        },

        setTimeList: function (targetEl) {
            var html = [];
            var startTimeOfDay = moment().startOf('days');
            var interval = 30;
            var timeListNum = 24 / 0.5;

            for (var i = 0; i < timeListNum; i++) {
                var value = startTimeOfDay.add("minutes", interval).format("HH:mm");
                html.push(["<option value=", value, ">", value, "</option>"].join(""));
            }
            targetEl.append(html.join("\n"));
        },

        renderWrite: function (assetCollection) {
            var intervalTime = GO.util.toMoment(new Date());
            var prevDate = (this.eventDate) ? this.eventDate : intervalTime.format("YYYY-MM-DD");
            var prevTime = GO.util.getIntervalTime(now).format("HH:mm");
            var position = GO.session('position') ? GO.session('position') : '';
            var myCalList = _.map(Calendars.getMyCalendar(), function (model) {
                return model.toJSON();
            });
            var comCalList = [];

            _.each(Calendars.getCompanyCalendar(), function (model) {
                if (model.get('permission')) {
                    comCalList.push(model.toJSON());
                }
            });

            var tmpl = layoutTpl({
                lang: lang,
                me: GO.session('name') + " " + position,
                userid: GO.session('id'),
                username: GO.session('name'),
                position: GO.session('position'),
                prevDate: prevDate,
                prevTime: prevTime,
                dataset: assetCollection,
                useAsset: GO.isAvailableApp("asset"),
                myCalList: myCalList,
                comCalList: comCalList,
                comCalListEmpty: comCalList.length == 0
            });

            this.$el.html(tmpl);
            $('th.assetTH:first').html('<span class="title">' + lang.reservation + '</span>');
            if (!this.isCopied) this._setAllDayView();
            this.renderTitleToolbar();
            this._initDatepicker();
            this.setAppCallBack();
            this.initAutoComplete();
            this.setTimeList($("#startTime"));
            this.setTimeList($("#endTime"));
            this.setData();
            $("#calId").find('option:first').attr('selected', true);
            if (!this.mcalendarAsset && this.isCopied) GO.util.toastMessage(calendarLang["복사된 일정입니다."]);
        },

        expandTextarea: function (e) {
            GO.util.textAreaExpand(e);
        },

        changeTime: function (e) {
            console.log("on change time");
            if (!this._confirmDeleteAsset()) {
                this.$('#startDate').val(this.selectStartDate);
                this.$('#endDate').val(this.selectEndDate);
                this.$('#startTime').val(this.selectStartTime);
                this.$('#endTime').val(this.selectEndTime);
                this.$('#startTime').attr("data-prev", this.selectStartTime);
                this.$('#endTime').attr("data-prev", this.selectEndTime);
            }
        },

        // 자산 예약 리스트 View 이동
        moveAssetList: function (e) {
            var assetId = $(e.currentTarget).attr('data-assetid');
            var startDate = this.$('#startDate').val();
            var endDate = this.$('#endDate').val();
            var startTime = this.$('#startTime').val();
            var endTime = this.$('#endTime').val();
            var allday = this.$('#allDay').is(':checked');

            if (GO.util.isBeforeToday(startDate)) {
                alert(lang.alert_no_reservation);
                return;
            }

            var start = GO.util.toISO8601(GO.util.toMoment(startDate + " " + startTime, "YYYY-MM-DD HH:mm"));
            var end = GO.util.toISO8601(GO.util.toMoment(endDate + " " + endTime, "YYYY-MM-DD HH:mm"));

            var mcalendarAsset = {
                summary: this.$('#summary').val(),
                attendees: this.getAttendees(),
                externalAttendees: this.getExternalAttendees(),
                location: $('#location').val(),
                reminders: this.getReminders(),
                asset: this.getAsset(),
                description: $('#description').val(),
                calendarId: this.calendarId || '',
                eventId: this.eventId || '',
                allday: allday,
                isCopied: this.isCopied,
                visibility: this.$("#visibility").is(":checked"),
                companyType: this.$("#companyType").is(":checked"),
            };

            if (this.key != "empty") {
                GO.util.store.set(this.key, null);
            } else {
                this.key = this._generateUUID();
            }
            GO.util.store.set(this.key, mcalendarAsset, {type: "session"});

            var url = ['asset', assetId, 'list', 'calendar', start, end, this.key];
            App.router.navigate(url.join('/'), {trigger: true, pushState: true});

        },

        getAsset: function () {
            var asset = [];
            var properties = [];
            $('tr.assetList li').each(function () {
                properties.push({
                    attributeId: $(this).attr('data-attributeId'),
                    content: $(this).attr('data-content')
                });
                asset.push({
                    reservationId: $(this).attr('data-reservationid'),
                    assetId: $(this).attr('data-assetid'),
                    assetName: $(this).attr('data-assetname'),
                    itemId: $(this).attr('data-itemId'),
                    properties: properties
                });
            });
            return asset;
        },

        getReminders: function () {
            var reminders = [];
            $('#remindersPart span.remindersPart').each(function () {
                reminders.push({
                    time: $(this).find('input').val(),
                    type: $(this).find('select#reminder_type').val(),
                    method: $(this).find('select#reminder_method').val()
                });
            });
            return reminders;
        },

        getAttendees: function () {
            var attend = [];
            $('#attendeesUL li').each(function () {
                attend.push({
                    id: $(this).attr('data-userid'),
                    name: $(this).attr('data-username'),
                    position: $(this).attr('data-userposition')
                });
            });
            return attend;
        },

        getExternalAttendees: function () {
            var externalAttendees = [];
            _.each(this.$("#externals").find("span.name"), function (wrap) {
                externalAttendees.push({
                    email: $(wrap).data().email,
                    name: $(wrap).text()
                });
            });
            return externalAttendees;
        },

        _deleteAll: function () {
            this.$el.find("#attendeesUL li").not(":first").remove();
        },

        deleteAttendee: function (e) {
            var target = $(e.currentTarget);
            target.parents('li').first().remove();
        },

        reminderDelete: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var target = $(e.currentTarget);
            target.parents('span.remindersPart').first().remove();
        },

        addReminderTemplete: function (e) {
            e.preventDefault();
            e.stopPropagation();
            if ($("#remindersPart td input").length == 5) {
                alert(App.i18n(calendarLang["알람은 최대 {{max}}개까지만 설정이 가능합니다."], "max", "5"));
                return;
            }
            $("#remindersPart td").prepend(reminderTpl({lang: lang, time: "30"}));
        },

        callUserAddBtn: function (e) {
            e.preventDefault();
            e.stopPropagation();
            var attendees = [];
            $.each($('#attendeesUL li'), function () {
                attendees.push({
                    id: $(this).attr('data-userid'),
                    username: $(this).attr('data-username'),
                    position: $(this).attr('data-userposition')
                });
            });
            if (GO.config('isMobileApp')) {
                GO.util.callOrg(attendees);
            } else {
                App.router.navigate(App.router.getUrl() + '#org', {trigger: false, pushState: true});
                this.orgView = new OrgView({});
                this.orgView.render({
                    title: calendarLang['참석자 추가'],
                    checkedUser: attendees,
                    callback: function (data) {
                        var tpl = attendeeTpl({
                            data: data
                        });
                        $("#attendeesUL").html(tpl);
                        return false;
                    }
                });
            }
        },

        getData: function () {
            var summary = $('#summary').val();
            var allDay = this.$("#allDay").is(':checked');
            var visibility = $("#visibility").is(':checked');
            var visibilityVal = "public";
            var sTime = "00:00";
            var eTime = "00:00";
            var timeType = "allday";

            if (!allDay) {
                sTime = this.$("#startTime").val();
                eTime = this.$("#endTime").val();
                timeType = "timed";
            } else if (allDay && this.mcalendarAsset != undefined && this.mcalendarAsset.asset.length > 0) {
                sTime = this.mcalendarAsset.asset[0].assetStartTime;
                eTime = this.mcalendarAsset.asset[0].assetEndTime == "24:00" ? "23:59" : this.mcalendarAsset.asset[0].assetEndTime;
            }

            if (visibility) {
                visibilityVal = "private";
            }

            var startTime = GO.util.toISO8601(GO.util.toMoment($("#startDate").val() + " " + sTime, "YYYY-MM-DD HH:mm"));
            var endTime = GO.util.toISO8601(GO.util.toMoment($("#endDate").val() + " " + eTime, "YYYY-MM-DD HH:mm"));
            var location = $("#location").val();
            var description = $("#description").val();

            var type;
            if (this.eventId) {
                type = this.eventModel.get("type");
            } else {
                if (this.$('#companyCalIdWrap').is(':visible')) {
                    type = "company";
                } else {
                    type = "normal";
                }
            }

            var calId = this.$('#calId').val();
            if (type == "company") {
                calId = this.$('select[name=companyCalId]').val();
            }

            var attendees = [];
            if (type != "company") {
                $.each($('#attendeesUL').find('li'), function () {
                    attendees.push({"id": $(this).attr('data-userid')});
                });
            }

            _.each(this.$("#externals").find("span.name"), function (wrap) {
                attendees.push({
                    email: $(wrap).data().email,
                    name: $(wrap).text()
                });
            });

            var data = {
                calendarId: calId,
                type: type,
                summary: summary,
                startTime: startTime,
                endTime: endTime,
                location: location,
                description: description,
                attendees: attendees,
                visibility: visibilityVal,
                timeType: timeType,
                allday: allDay
            };

            var reminders = [];
            $.each($(".remindersPart"), function () {
                reminders.push({
                    "time": parseInt($(this).find('input').val()),
                    "type": $(this).find('select#reminder_type').val(),
                    "method": $(this).find('select#reminder_method').val()
                });
            });

            if ($(".remindersPart").length > 0) {
                data.reminders = reminders;
            }

            // TODO - GO-15500 : 자산을 먼저 등록하지 않으므로 해당 로직 제외 처리
            var assets = [];
            if (this.eventId) {
                $.each($("li[data-type='assetItemList']"), function () {
                    var reservationId = $(this).attr('data-reservationid');
                    if (reservationId) assets.push(reservationId);
                });
                if ($("li[data-type='assetItemList']").length > 0) {
                    data.assetReservationIds = assets;
                }
            } else {
                data.assetReservationIds = assets;
            }

            return data;
        },

        isInvalidTime: function () {
            var startDate = $("#startDate").val();
            var endDate = $("#endDate").val() || startDate;
            var startTime = $("#startTime").val();
            var endTime = $("#endTime").val();
            var momentStartTime = moment(startDate + "T" + startTime + ":00");
            var momentEndTime = moment(endDate + "T" + endTime + ":00");

            return momentStartTime > momentEndTime;
        },

        submit: function () {
            var _this = this;
            if (this.isSaving) {
                return;
            }
            this.isSaving = true;
            var data = this.getData();

            // data validation!
            if (this.isInvalidTime()) {
                this.$("#startTime").focus();
                alert(calendarLang["끝시간은 시작시간보다 이전으로 등록할 수 없습니다."]);
                this.isSaving = false;
                return;
            }
            if (data.summary == '') {
                alert(calendarLang['제목을 입력해 주십시오']);
                $('#summary').focus();
                this.isSaving = false;
                return;
            }
            if ($('#attendeesUL li').length == 0 && data.type != "company") {
                alert(calendarLang['참석자를 지정해 주십시오']);
                this.isSaving = false;
                return;
            }

            this.loc = GO.util.getLocalStorage("calLocalStorage");
            this._saveReservationAssets(data);

            if (this.eventId && !this.isCopied) {
                if (this.eventModel.toJSON().recurrence) {
                    this.eventModel.setRecurChangeType('instance');
                }
                this.eventModel.off("error:validate");
                this.eventModel.on("error:validate", $.proxy(this._validateErrorCallback, this));
                this.eventModel.set(data);
                if (this.eventModel.isAlone() || data.type == "company") {
                    saveModel(this.eventModel);
                } else {
                    confirmNoti(this.eventModel).done(function () {
                    }).fail(function () {
                        _this.isSaving = false;
                    });
                }
            } else {
                var newModel = new CalendarEvent();
                newModel.on("error:validate", $.proxy(this._validateErrorCallback, this));
                newModel.set(data);
                if (newModel.isAlone()) {
                    saveModel(newModel);
                } else {
                    confirmNoti(newModel).done(function () {
                    }).fail(function () {
                        _this.isSaving = false;
                    });
                }
            }

            function confirmNoti(eventModel) {
                var self = this,
                    deferred = $.Deferred();

                // 2.4.7.1 이후 버전 반영 예정
                this.alarmPopup = new AlarmPopupLayer();
                this.alarmPopup.setConfirmCallback(confirm, this);
                this.alarmPopup.setCancelCallback(cancel, this);
                this.alarmPopup.setCloseCallback(close, this);
                this.alarmPopup.render({"type": "mobile"});

                function confirm() {
                    var self = this;
                    var popupEl = $(self.alarmPopup.popupEl);
                    isPushNoti = popupEl.find("input:checkbox[id='chkbox_push']").is(":checked"),
                        isMailNoti = popupEl.find("input:checkbox[id='chkbox_mail']").is(":checked");
                    eventModel.set("pushNoti", isPushNoti);
                    eventModel.set("mailNoti", isMailNoti);
                    deferred.resolve();

                    saveModel(eventModel);
                }

                function cancel() {
                    eventModel.set("pushNoti", false);
                    eventModel.set("mailNoti", false);
                    deferred.resolve();

                    saveModel(eventModel);
                }

                function close() {
                    deferred.reject();
                }

                return deferred;
            }

            function saveModel(eventModel) {
                if (_.isNull(_this.loc)) {
                    _this.loc = {};
                    _this.loc.type = "monthly";
                    _this.loc.date = _this.eventDate;
                }
                GO.util.preloader(eventModel.save({}, {
                    success: function (model) {
                        _this.isSaving = false;
                        App.router.navigate('calendar/' + _this.loc.type + '/' + _this.loc.date, {
                            trigger: true,
                            pushState: true
                        });
                    },
                    error: function () {
                        _this.isSaving = false;
                        alert(calendarLang["일정 등록시 오류가 발생하였습니다"]);
                    }
                }));
            }
        },

        redirectUrl: function () {
            var loc = GO.util.getLocalStorage("calLocalStorage");
            if (_.isNull(loc) || _.isUndefined(loc)) {
                GO.util.goHome();
            } else {
                App.router.navigate('calendar/' + loc.type + '/' + loc.date, {trigger: true, pushState: true});
            }
        },

        renderTitleToolbar: function () {
            var _this = this;
            var writeTitle = this.eventId && !this.isCopied ? calendarLang['일정 수정'] : calendarLang['일정 등록'];

            var toolbarOpt = {
                isClose: true,
                title: writeTitle,
                closeCallback: $.proxy(function () {
                    this.$('#startDate').datepicker('hide');
                    this.$('#endDate').datepicker('hide');
                    if (GO.util.disagreeContentLoss()) return;
                    this.redirectUrl();
                }, this),
                actionMenu: [{
                    id: "calendar-save",
                    text: commonLang['확인'],
                    triggerFunc: 'calendar-save'
                }]
            };
            this.headerToolbarView.render(toolbarOpt);

            /*this.titleToolbarView.render({
                isPrev : true,
                isLeftCancelBtn : {
                    text : commonLang['취소'],
                    callback : function(){
                        _this.$('#startDate').datepicker('hide');
                        _this.$('#endDate').datepicker('hide');

                        if (GO.util.disagreeContentLoss()) return;

                        _this.redirectUrl();
                    }
                },
                name : writeTitle,
                rightButton : {
                    text : commonLang['확인'],
                    callback : function() {
                        setTimeout(function(){
                            _this.$('#startDate').datepicker('hide');
                            _this.$('#endDate').datepicker('hide');
                            _this.submit();
                        },200);

                    }
                }
            });*/
        },
        calendarSaveAction: function () {
            var _this = this;
            setTimeout(function () {
                _this.$('#startDate').datepicker('hide');
                _this.$('#endDate').datepicker('hide');
                _this.submit();
            }, 200);
        },
        setAssetData: function () {
            this.reservations.on("sync", function (collection, response) {
                $("tr.assetList ul.name_tag li").remove();
                $.each(collection.toJSON(), function (k, v) {
                    $("tr.assetList ul[data-assetid='" + v.assetId + "']").append(assetTpl({
                        reservationId: v.id,
                        assetId: v.assetId,
                        itemName: v.itemName,
                        itemId: v.itemId
                    }));
                });
            });
            this.reservations.fetch();
        },

        setMcalendarAsset: function () {
            var _this = this;
            this.me1 = [];
            this.attendee1 = [];

            var summary = this.mcalendarAsset.summary;
            var location = this.mcalendarAsset.location;
            var description = this.mcalendarAsset.description;

            this.calendarId = this.mcalendarAsset.calendarId || this.calendarId;
            this.eventId = this.mcalendarAsset.eventId || this.eventId;

            this.$('#visibility').prop("checked", this.mcalendarAsset.visibility);
            this.$('#companyType').prop("checked", this.mcalendarAsset.companyType);
            this.$('#summary').val(summary);
            this.$('#location').val(location);
            this.$('#description').val(description);

            // 참석자
            if (this.mcalendarAsset.attendees.length > 0) {
                $("#attendeesUL").html('');
                $.each(this.mcalendarAsset.attendees, function (k, v) {
                    if (v.id == GO.session('id')) {
                        _this.me1.push(attendeeTpl({data: v}));
                    } else {
                        _this.attendee1.push(attendeeTpl({data: v}));
                    }
                });
                $("#attendeesUL").html(_this.me1.join('') + _this.attendee1.join(''));
            }
            // 외부참석자
            this.renderExternal(this.mcalendarAsset.externalAttendees);
            // 알람
            if (this.mcalendarAsset.reminders.length > 0) {
                this.$el.find("#remindersPart span.remindersPart").remove();
                $.each(this.mcalendarAsset.reminders, function (m, k) {
                    $("#remindersPart td").prepend(reminderTpl({
                        lang: lang,
                        time: k.time
                    })).find('select:first').val(k.type);
                });
            }
            // 예약
            if (this.mcalendarAsset.asset.length > 0) {
                this.$el.find("tr.assetList ul.name_tag li").remove();
                $.each(this.mcalendarAsset.asset, function (m, k) {
                    var attributeId = "",
                        content = "";
                    if (k.properties.length > 0) {
                        attributeId = k.properties[0].attributeId;
                        content = k.properties[0].content;
                    }
                    $("tr.assetList ul[data-assetid='" + k.assetId + "']").append(assetTpl({
                        reservationId: k.reservationId,
                        assetId: k.assetId,
                        itemName: k.assetName,
                        itemId: k.itemId,
                        attributeId: attributeId,
                        content: content
                    }));
                });
            }
        },

        setData: function () {

            if (this.eventId) { // 일정 수정, 생성
                this.setEventData(this.calendarId, this.eventId);
                if (!this.isCopied && !this.mcalendarAsset) this.setAssetData(); //복사됐거나 예약에서 넘어올 때 이벤트의 예약 리스트를 가져오지 않는다.

            } else {
                var defaultDate = this.eventDate ? this.eventDate : this.getDefaultDate();
                var defaultStartTime = this.getDefaultStartTime();
                var defaultEndTime = this.getDefaultEndTime();
                this.$el.find("#startDate").val(defaultDate);
                this.$el.find("#endDate").val(defaultDate);
                this.$("#startTime").val(defaultStartTime);
                this.$("#endTime").val(defaultEndTime);
                this.$("#startTime").attr("data-prev", defaultStartTime);
                this.$("#endTime").attr("data-prev", defaultEndTime);
            }

            if (this.mcalendarAsset) { // 예약페에지에서 넘어올 때
                this.setMcalendarAsset();

                if (this._hasAsset()) {
                    this.$("#startDate").attr("disabled", "disabled");
                    this.$("#endDate").attr("disabled", "disabled");
                }

                var startDate = GO.util.formatDatetime(this.startTime, null, "YYYY-MM-DD");
                var endDate = GO.util.formatDatetime(this.endTime, null, "YYYY-MM-DD");
                var startTime = GO.util.formatDatetime(this.startTime, null, "HH:mm");
                var endTime = GO.util.formatDatetime(this.endTime, null, "HH:mm");
                this.$('#startDate').val(startDate);
                this.$('#endDate').val(endDate);
                this.$('#startTime').val(startTime);
                this.$('#endTime').val(endTime);

                this._setAllDayView(this.mcalendarAsset.allday);
            }

            // 기존 시간날짜 기억
            this.selectStartDate = $('#startDate').val();
            this.selectEndDate = $('#endDate').val();
            this.selectStartTime = $('#startTime').val();
            this.selectEndTime = $('#endTime').val();
        },

        setAppCallBack: function () {
            window.addSuccess = function (r) {
                var obj = JSON.parse(r);
                var tpl = attendeeTpl({
                    data: obj
                });
                $("#attendeesUL").html(tpl);
            };
        },

        getDefaultDate: function () {
            return now.clone().format("YYYY-MM-DD");
        },
        getDefaultStartTime: function () {
            return GO.util.getIntervalTime(now.clone()).format("HH:mm");
        },

        getDefaultEndTime: function () {
            return GO.util.getIntervalTime(now.clone().add("hours", 1)).format("HH:mm");
        },

        setEventData: function (calendarId, eventId) {
            this.me1 = [];
            this.attendee1 = [];
            this.eventModel.fetch({async: false});

            var _this = this;
            var data = this.eventModel;
            var modifyData = data.toJSON();
            var summary = modifyData.summary;
            var startDate = GO.util.shortDate(modifyData.startTime);
            var endDate = GO.util.shortDate(modifyData.endTime);
            var startTime = GO.util.hourMinute(modifyData.startTime);
            var endTime = GO.util.hourMinute(modifyData.endTime);
            var location = modifyData.location;
            var description = modifyData.description;
            var calendarId = modifyData.calendarId;
            var type = modifyData.type;

            if (this.isCopied) {
                startDate = this.getDefaultDate();
                endDate = this.getDefaultDate();
                startTime = this.getDefaultStartTime();
                endTime = this.getDefaultEndTime();
            } else {
                this._setAllDayView(modifyData.timeType == "allday");
            }
            this.$("#startTime").val(startTime);
            this.$("#endTime").val(endTime);
            this.$("#startTime").attr("data-prev", startTime);
            this.$("#endTime").attr("data-prev", endTime);
            this.$("#summary").val(GO.util.calendarStrParse(summary));
            this.$("#startDate").val(startDate).attr({"value": startDate});
            this.$("#endDate").val(endDate).attr({"value": endDate});
            this.$("#location").val(GO.util.calendarStrParse(location));
            this.$("#description").val(GO.util.calendarStrParse(description));

            if (type == "company") {
                this._setCompanyCalCheckboxVisible(false);
                this._setCompanyCalSelectVisible(true);
                this._setMyCalendarsVisible(false);
                this._setInnerAttendeeVisible(false);
                this.$("select[name=companyCalId]").val(calendarId);
            } else {
                this._setCompanyCalendarsVisible(false);
                this.$("#calId").val(calendarId);
            }

            if (modifyData.reminders && modifyData.reminders.length > 0) {
                this.$el.find("#remindersPart span.remindersPart").remove();
                $.each(modifyData.reminders, function (idx, reminder) {
                    var reminderTmpl = $("#remindersPart td").prepend(reminderTpl({
                        lang: lang,
                        time: reminder.time,
                        index: idx
                    }));
                    reminderTmpl.find('select[name=reminder_type_' + idx + ']').val(reminder.type);
                    reminderTmpl.find('select[name=reminder_method_' + idx + ']').val(reminder.method);
                });
            }

            if (modifyData.visibility == "private") {
                $("#visibility").attr("checked", true);
            }

            if (modifyData.attendees != undefined && modifyData.attendees.length > 0) {
                $("#attendeesUL li").remove();

                $.each(modifyData.attendees, function (k, v) {
                    if (v.id == GO.session('id')) {
                        _this.me1.push(attendeeTpl({data: v}));
                    } else if (_.isUndefined(v.id)) {
                        // skip
                    } else {
                        _this.attendee1.push(attendeeTpl({data: v}));
                    }
                });
                $("#attendeesUL").prepend(_this.me1.join('') + _this.attendee1.join(''));
                if (this.attendee1.length > 0) this.$el.find("#delete_all_attendees").show();

            }

            this.renderExternal(this.eventModel.getExternalAttendees());
        },

        renderExternal: function (externalAttendees) {
            if (externalAttendees.length) {
                this.$("#externalArea").show();
                this.$el.find("#externals li").remove();
            }
            _.each(externalAttendees, function (attendee) {
                var externalView = new ExternalView(attendee);
                this.$("#externals").append(externalView.render().el);
            }, this);
        },

        addExternal: function () {
            var email = this.$el.find("#externalForm").val();
            if (!email) return;
            this.makeFormatUnit(this.$el.find("#externalForm"), email);
            this.$el.find("#externalForm").val("");
            this.$el.find("#externalArea").show();
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
                offKeyPress: GO.util.msie() ? true : false,
                width: 300,
                customStyle: {"z-index": "10"},
                customList: this.$("#externals")
            };

            this.$("#externalForm").autocomplete(GO.contextRoot + "api/mail/address/search/name", options);
        },


        makeFormatUnit: function (inputObj, value) {
            var self = this;

            if ($.trim(value) == "") return;

            var addressArray = new Array();
            var addressSplit = value.split(">,");

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
                    .data("email", GO.util.get_email(value))
                    .data("label", displayName)
                    .data("select", false)
                    .text(displayText);
                var modWrap = "";
                var delField = $('<span class="ic ic_del"></span>');
                delField.attr("title", "삭제").click(function () {
                    var emailWrap = $(this).closest('li');
                    emailWrap.find("input.edit").unautocomplete();
                    emailWrap.remove();
                    inputObj.focus();
                    if (!self.$("#externalArea").find("li").length) self.$("#externalArea").hide();
                });
                var delWrap = $('<span class="btn_wrap"></span>').append(delField);
                var addrWrap = $('<li></li>');
                addrWrap.addClass((!isValid) ? "invalid" : "");
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

        changeStartTime: function () {
            var startDate = this.$("#startDate").val();
            var startTime = this.$("#startTime").attr("data-prev");
            var startAt = moment(startDate + "T" + startTime + ":00");

            var endDate = this.$("#endDate").val();
            var endTime = this.$("#endTime").val();
            var endAt = moment(endDate + "T" + endTime + ":00");

            var diff = Math.floor(endAt.diff(startAt, "minutes", true) * 10) / 10;

            var newStartTime = this.$("#startTime").val();
            var newStartAt = moment(startDate + "T" + newStartTime + ":00");

            var newEndAt = newStartAt.add("minutes", diff);
            var newEndDate = newEndAt.format("YYYY-MM-DD");
            var newEndTime = newEndAt.format("HH:mm");

            this.$("#endDate").val(newEndDate);
            this.$("#endTime").val(newEndTime);
            this.$("#endDate").attr("data-prev", newEndDate);
            this.$("#endTime").attr("data-prev", newEndTime);
            this.$("#startTime").attr("data-prev", newStartTime);
        },

        _initDatepicker: function () {
            this.$("#startDate").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true
            });

            this.$("#endDate").datepicker({
                yearSuffix: "",
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                minDate: this.eventDate || this.$("#startDate").val()
            });
        },

        _hasAsset: function () {
            return this.mcalendarAsset.asset.length > 0;
        },

        // 캘린더 확인버튼 클릭시 - AssetItems 저장 처리
        _saveReservationAssets: function (data) {
            var deferred = $.Deferred();
            var _this = this;

            if ($('tr.assetList li').length > 0) {
                // data-reservationid가 존재하지 않으면 신규 등록
                // 있으면 Skip
                $('tr.assetList li').each(function () {
                    var properties = [];
                    if ($(this).attr('data-attributeId')) {
                        properties.push({
                            "attributeId": $(this).attr('data-attributeId'),
                            "content": $(this).attr('data-content')
                        });
                    }

                    var assetModel = new assetItemModel({
                        "assetId": $(this).attr('data-assetid'),
                        "itemId": $(this).attr('data-itemid'),
                        "itemName": $(this).attr('data-assetname'),
                        "type": "reserve",
                        "startTime": data.startTime,
                        "endTime": data.endTime,
                        "allday": data.allday,
                        "properties": properties
                    });

                    deferred = $.ajax({
                        url: GO.contextRoot + "api/asset/" + assetModel.get('assetId') + "/item/" + assetModel.get('itemId') + "/reserve",
                        type: "POST",
                        async: false,
                        data: JSON.stringify(assetModel),
                        dataType: "json",
                        contentType: "application/json;",
                        success: function (response) {
                            $('tr.assetList li').attr('data-reservationid', response.data.id);
                            data.assetReservationIds.push(response.data.id);
                        },
                        error: function (response) {
                            var errorName = response.responseJSON.name;
                            if (errorName == "DuplicateRequestException") {
                                alert(assetLang['예약하려는 시간대에 이미 예약된 건이 포함되어있습니다.']);
                                _this.isSaving = false;
                                throw new Error();
                            }
                        }
                    });
                });
            }

            return deferred;
        },

        _validateErrorCallback: function (model, code, msg) {
            this.isSaving = false;
            var option = Array.prototype.slice.call(arguments, 3);
            alert(msg, '', $.proxy(function () {
                switch (code) {
                    case "numeric:reminder_time":
                    case "min:reminder_time":
                    case "max:reminder_time":
                        var elem = this.$el.find('input[name^="reminder_value_"]')[option[0]];
                        $(elem).val(FormReminderHelper.DEFAULT_VALUE);
                        break;
                }
            }, this));

            return this;
        },

        _generateUUID: function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        },

        _onChangeStartDate: function () {
            this.$("#endDate").datepicker("option", "minDate", this.$("#startDate").val());
        },

        _onCompanyCheckboxClicked: function (e) {
            if (this._isCompanyTypeChecked()) {
                this._setCompanyCalSelectVisible(true);
                this._setInnerAttendeeVisible(false);
                this._setMyCalendarsVisible(false);
                this._setPrivateCheckboxVisible(false);
            } else {
                this._setCompanyCalSelectVisible(false);
                this._setInnerAttendeeVisible(true);
                this._setMyCalendarsVisible(true);
                this._setPrivateCheckboxVisible(true);
            }
        },

        _onPrivateCheckboxClicked: function (e) {
            var $privateCheckbox = $(e.currentTarget);
            this._setVisible(this.$('#company_cal_list'), !$privateCheckbox.is(':checked'));
        },

        _isCompanyTypeChecked: function () {
            return this.$('#companyType').is(':checked');
        },

        _setPrivateCheckboxVisible: function (visible) {
            this._setVisible(this.$('#visibility').parent(), visible);
        },

        _setMyCalendarsVisible: function (visible) {
            this._setVisible(this.$('#my_cal_list'), visible);
        },

        _setCompanyCalendarsVisible: function (visible) {
            this._setVisible(this.$('#company_cal_list'), visible);
        },

        _setCompanyCalCheckboxVisible: function (visible) {
            this._setVisible(this.$('#checkbox-company-wrap'), visible);
        },

        _setCompanyCalSelectVisible: function (visible) {
            this._setVisible(this.$('#companyCalIdWrap'), visible);
        },

        _setInnerAttendeeVisible: function (visible) {
            this._setVisible(this.$('#inner_attendees'), visible);
        },

        _setVisible: function ($el, visible) {
            if (visible) {
                $el.show();
            } else {
                $el.hide();
            }
        },

        _setAllDayView: function (isAllDay) {
            var _isAllDay = isAllDay === undefined ? false : isAllDay;
            this.$('#allDay').prop('checked', _isAllDay);
            this.$("#startTime").toggle(!_isAllDay);
            this.$("#endTime").toggle(!_isAllDay);
        },

        _activateDateForm: function () {
            this.$("#startDate").attr("disabled", false);
            this.$("#endDate").attr("disabled", false);
        },

        _onChangeAllDay: function () {
            var target = this.$("#allDay");
            var isChecked = target.is(':checked');

            if (!this.mcalendarAsset && !this._confirmDeleteAsset()) {
                target.prop('checked', !isChecked);

                return false;
            }
            if (isChecked) {
                this.$("#startTime").val("09:00");
                this.$("#endTime").val("18:00");
            } else {
                this.$("#startTime").val(this.getDefaultStartTime());
                this.$("#endTime").val(this.getDefaultEndTime());
            }
            this.$("#startTime").toggle(!isChecked);
            this.$("#endTime").toggle(!isChecked);
        },

        _onClickDeleteAssetItem: function (e) {
            this._confirmDeleteAsset();
        },

        _confirmDeleteAsset: function () {
            if (this.$('tr.assetList li').length < 1) return true;
            if (confirm(lang.alert_cancel_asset)) {
                this._deleteReservation().done($.proxy(function () {
                    this.$('tr.assetList li').remove();
                    if (!this.$("tr.assetList").find("li").length) this._activateDateForm();
                }, this));

                return true;
            }

            return false;
        },

        _deleteReservation: function () {
            var reservationIds = [];
            var deleteReservation = $.Deferred();

            $.each(this.$('tr.assetList li'), function () {
                var reservationId = $(this).attr('data-reservationid');
                if (reservationId) reservationIds.push(reservationId);
            });

            if (!reservationIds.length) {
                deleteReservation.resolve();
            } else {
                var url = GO.contextRoot + "api/asset/item/reservation";
                $.ajax({
                    type: "DELETE",
                    url: url,
                    contentType: 'application/json',
                    data: JSON.stringify({'ids': reservationIds}),
                    success: function () {
                        deleteReservation.resolve();
                    }
                });
            }

            return deleteReservation;
        }
    });

    return CalendarWrite;
});
