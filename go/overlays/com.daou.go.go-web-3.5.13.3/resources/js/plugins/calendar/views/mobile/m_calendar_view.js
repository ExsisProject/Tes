;(function () {

    define([
            "jquery",
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!calendar/nls/calendar",
            "views/mobile/header_toolbar",
            "hgn!calendar/templates/mobile/m_calendar_view",
            "calendar/models/event",
            "asset/collections/asset_calendar",
            "calendar/libs/util",
            "hgn!calendar/templates/mobile/m_event_remove_confirm_layer",
            "GO.util",
            "jquery.ui"
        ],
        function (
            $,
            Backbone,
            App,
            commonLang,
            calendarLang,
            HeaderToolbarView,
            layoutTpl,
            CalendarEvent,
            AssetCalCollection,
            CalUtil,
            EventRemoveConfirmLayer
        ) {
            var lang = {
                'externalAttendees': calendarLang['외부참석자'],
                'attendees': calendarLang['참석자'],
                'location': calendarLang['장소'],
                'reminder': calendarLang['알람'],
                'content': commonLang['내용'],
                'leave': calendarLang['참석자에서 빠지기'],
                'copy': commonLang['복사'],
                'modify': commonLang['수정'],
                'delete': commonLang['삭제'],
                'comment': commonLang['댓글'],
                'layerInform': calendarLang['현재 \'반복일정\'으로 등록되어 있습니다.'],
                'removeInstance': calendarLang['이 일정만 삭제'],
                'removeAfter': calendarLang['이 일정부터 이후 일정 모두 삭제'],
                'removeAll':  calendarLang['전체 반복 일정 삭제'],
                'confirm' : commonLang['확인']
            };

            var CalendarView = Backbone.View.extend({
                events: {
                    "click #copyUrl": "copyUrl",
                },

                initialize: function (options) {
                    this.eventId = options.eventId;
                    this.calendarId = options.calendarId;

                    this.headerToolbarView = HeaderToolbarView;
                    this.assetList = new AssetCalCollection({
                        eventId: options.eventId,
                        type: "current"
                    });

                    this.headerBindEvent();
                },
                headerBindEvent: function () {
                    GO.EventEmitter.off("trigger-action");
                    GO.EventEmitter.on('trigger-action', 'calendar-comment', this.commentList, this);
                    GO.EventEmitter.on('trigger-action', 'calendar-modify', this.eventModify, this);
                    GO.EventEmitter.on('trigger-action', 'calendar-delete', this.eventDelete, this);

                    GO.EventEmitter.on('trigger-action', 'calendar-copy', this.eventCopy, this);
                    GO.EventEmitter.on('trigger-action', 'calendar-leave', this.eventLeave, this);
                },
                render: function () {
                    var _this = this;
                    this.eventModel = new CalendarEvent({"id": this.eventId, "calendarId": this.calendarId});
                    this.eventModel.fetch({
                        async: true,
                        error: function (model, response) {
                            var _error = JSON.parse(response.responseText);
                            if (GO.util.isMobileApp()) {
                                console.log(_error.code + commonLang[_error.code + " 오류페이지 타이틀"] + "->calendar");
                                if (GO.util.isAndroidApp()) {
                                    window.GOMobile.onError(_error.code, commonLang[_error.code + " 오류페이지 타이틀"]);
                                } else {
                                    window.location = "gomobile://onError?" + _error.code + "&" + encodeURIComponent(commonLang[_error.code + " 오류페이지 타이틀"]);
                                }
                            } else {
                                alert(commonLang[_error.code + " 오류페이지 타이틀"]);
                                App.router.navigate('calendar', {trigger: true});
                            }
                        }
                    });

                    this.calName = this.eventModel.get("calendarName") ? decodeURIComponent(this.eventModel.get("calendarName")) : decodeURIComponent(calendarLang['내 일정']);

                    this.eventModel.on("change", function (data) {
                        var attendeesParse = function () {
                            var attendeesStr = [];
                            var me = "";
                            $.each(this.attendees, function (k, v) {
                                if (!v.id) return true;

                                var label = v.id ? v.name + (v.position ? ' ' + v.position : '') : v.email;

                                if (v.id == GO.session('id')) {
                                    me = '<li><span class="name">' + label + '</span></li>';
                                } else {
                                    attendeesStr.push('<li><span class="name">' + label + '</span></li>');
                                }
                            });
                            if (me != "") {
                                attendeesStr.push(me);
                            }
                            return attendeesStr.reverse().join('');
                        };


                        var externalAttendees = function () {
                            var attendeesStr = [];
                            $.each(this.attendees, function (k, v) {
                                var label = v.name || v.email;

                                if (v.id) {
                                    return true;
                                } else {
                                    attendeesStr.push('<li><span class="name">' + label + '</span></li>');
                                }
                            });
                            return attendeesStr.reverse().join('');
                        };

                        var existReminders = function () {
                            if (this.reminders.length > 0) {
                                return true;
                            }
                            return false;
                        };

                        var eventDateParse = function () {

                            if (this.timeType == "allday") {
                                if (GO.util.isSameDate(this.startTime, this.endTime)) {
                                    return GO.util.shortDate2(this.startTime) + " " + calendarLang['종일'];
                                }
                                return GO.util.shortDate2(this.startTime) + " ~ " + GO.util.shortDate2(this.endTime) + "(" + calendarLang['종일'] + ")";

                            }

                            return GO.util.basicDate(this.startTime) + " ~ " + GO.util.basicDate(this.endTime);
                        };

                        var reminderParse = function () {

                            var alarm, type, method;

                            alarm = calendarLang['알람'];
                            method = (this.method == "email") ? calendarLang["메일알림"] : calendarLang["푸시알림"];

                            if (this.type == "day") {
                                type = calendarLang['일전'];
                            } else if (this.type == "week") {
                                type = calendarLang['주전'];
                            } else if (this.type == "hour") {
                                type = calendarLang['시간전'];
                            } else {
                                type = calendarLang['분전'];
                            }

                            return this.time + type + " " + alarm + " [" + method + "]";
                        };

                        var descriptionParse = function () {
                            return GO.util.escapeHtml(this.description);
                        };

                        var locationCheck = function () {
                            if ($.trim(this.location) == "") {
                                return false;
                            }
                            return true;
                        };
                        var descriptionCheck = function () {
                            if ($.trim(this.description) == "") {
                                return false;
                            }
                            return true;
                        };

                        var isPrivate = function () {
                            if (this.visibility == "private") {
                                return true;
                            }
                            return false;
                        };

                        var tmpl = layoutTpl({
                            lang: lang,
                            dataset: data.toJSON(),
                            hasExternal: data.hasExternalAttendees(),
                            "showAttendeesParse?": data.isNormalEvent(),
                            isAlone: data.isAlone(),
                            isRecurrence: data.isRecurrence(),
                            attendeesParse: attendeesParse,
                            externalAttendees: externalAttendees,
                            existReminders: existReminders,
                            reminderParse: reminderParse,
                            eventDateParse: eventDateParse,
                            descriptionParse: descriptionParse,
                            locationCheck: locationCheck,
                            descriptionCheck: descriptionCheck,
                            isPrivate: isPrivate,
                            commentLabel: data.get("commentCount") ? "(" + data.get("commentCount") + ")" : ""
                        });

                        _this.$el.html(tmpl);
                        if (GO.isAvailableApp("asset")) {
                            _this.setAssetList();
                        }

                        var toolBarData = {
                            isPrev: true,
                            actionMenu: _this.getUseMenus(data.get("permission"), data.get("commentCount"), data.isAlone(), data.isNormalEvent()),
                            isWriteBtn: true,
                            writeBtnCallback: function () {
                                App.router.navigate('calendar/write/' + GO.util.shortDate(new Date()), {
                                    trigger: true,
                                    pushState: true
                                });
                            }
                        };
                        _this.headerToolbarView.render(toolBarData);
                    });
                },
                eventLeave: function () {
                    $(".array_option").hide();
                    if (this._isRecurrenceSchedule(this.eventModel)) {
                        $("#commonWriteButton").hide();
                        var layerLabel = {'title': calendarLang['참석자에서 빠지기'],
                                          'subTitle': calendarLang['참석자에서 빠지면 내 일정에서 노출되지 않습니다. 하지만, 다른 참석자의 일정에서는 해당 일정이 계속 보여집니다.위 일정의 참석자에서 빠지시겠습니까?'].replace("<br />", "\n")};
                        this._renderConfirmLayer(layerLabel, this.saveEventModel);
                    } else {
                        if (confirm(calendarLang['참석자에서 빠지기'] + "\n"
                            + calendarLang['참석자에서 빠지면 내 일정에서 노출되지 않습니다. 하지만, 다른 참석자의 일정에서는 해당 일정이 계속 보여집니다.위 일정의 참석자에서 빠지시겠습니까?'].replace("<br />", "\n"))) {
                            this.eventModel.setRecurChangeType('instance');
                            this.saveEventModel(this.eventModel);
                        }
                    }
                },
                saveEventModel: function(eventModel){
                    eventModel.set("attendees", eventModel.get("attendees").filter(function (atd) {
                        return atd.id !== GO.session('id');
                    }), {silent: true});
                    eventModel.save({}, {
                        success: function () {
                            var loc = GO.util.getLocalStorage("calLocalStorage");
                            App.router.navigate('calendar/' + loc.type + '/' + loc.date, {
                                trigger: true,
                                pushState: true
                            });
                        },
                        error: function (response) {
                            alert(response.responseJSON.message);
                        }
                    });
                },
                eventDelete: function () {
                    $(".array_option").hide();
                    if (this._isRecurrenceSchedule(this.eventModel)) {
                        $("#commonWriteButton").hide();
                        var layerLabel = {'title': calendarLang['일정 삭제'],
                                            'subTitle': calendarLang['일정을 삭제하시면 모든 참석자의 일정에서 사라집니다. 참석자에서 빠지고 싶다면, 참석자 정보를 수정하세요'].replace("<br />", "\n")};
                        this._renderConfirmLayer(layerLabel, this.destroyEventModel);
                    } else {
                        if (confirm(commonLang['삭제하시겠습니까?'])) {
                            this.eventModel.setRecurChangeType('instance');
                            this.destroyEventModel(this.eventModel);
                        }
                    }
                },
                destroyEventModel: function(eventModel){
                    eventModel.destroy({
                        success: function () {
                            var loc = GO.util.getLocalStorage("calLocalStorage");
                            App.router.navigate('calendar/' + loc.type + '/' + loc.date, {
                                trigger: true,
                                pushState: true
                            });
                        }
                    });
                },
                eventCopy: function () {
                    if (confirm(calendarLang['일정을 복사하시겠습니까?'] + "\n"
                        + calendarLang['종일, 반복 설정과 예약하기는 복사 대상에서 제외됩니다.'])) {
                        App.router.navigate('calendar/write/copied/' + this.calendarId + '/' + this.eventId, {
                            trigger: true,
                            pushState: true
                        });
                    }
                },
                eventModify: function () {
                    App.router.navigate('calendar/modify/' + this.calendarId + "/" + this.eventId, {
                        trigger: true,
                        pushState: true
                    });
                    return false;
                },
                _isRecurrenceSchedule: function (model) {
                    return model.attributes.recurrence;
                },
                _renderConfirmLayer: function (layerLabel, eventCallback) {
                    var self = this;
                    $('.go_wrap').append(EventRemoveConfirmLayer({lang: lang, layerLabel: layerLabel}));
                    $("#confirmDeleteOption").on("click", function (e) {
                        var deleteType = $('input[name="deleteOption"]:checked').val();
                        $(".overlay_scroll").remove();
                        $("#commonWriteButton").show();
                        self.eventModel.setRecurChangeType(deleteType);
                        eventCallback(self.eventModel);
                        return false;
                    });
                    $("#closeOptionLayer").on("click", function (e) {
                        $(".overlay_scroll").remove();
                        $("#commonWriteButton").show();
                        return false;
                    });
                },
                getUseMenus: function (permission, commentCount, isAlone, isNormalEvent) {
                    var menus = {
                        "댓글": {
                            id: "calendar-comment",
                            text: lang.comment,
                            triggerFunc: "calendar-comment",
                            cls: 'btn_comments',
                            commentsCount: commentCount ? commentCount : "0"
                        },
                        "수정": {
                            id: "calendar-modify",
                            text: lang.modify,
                            triggerFunc: "calendar-modify",
                            inMoreBtn: true
                        },
                        "삭제": {
                            id: "calendar-delete",
                            text: lang.delete,
                            triggerFunc: "calendar-delete",
                            inMoreBtn: true
                        },
                        "복사": {
                            id: "calendar-copy",
                            text: lang.copy,
                            triggerFunc: "calendar-copy"
                        },
                        "참석자빠지기": {
                            id: "calendar-leave",
                            text: lang.leave,
                            triggerFunc: "calendar-leave",
                            inMoreBtn: true
                        }
                    };
                    var useMenuList = [];
                    useMenuList.push(menus.댓글);
                    if (permission.update) {
                        useMenuList.push(menus.복사);
                        useMenuList.push(menus.수정);
                    }
                    if (permission.delete) {
                        useMenuList.push(menus.삭제);
                    }
                    if (permission.update && !isAlone && isNormalEvent) {
                        useMenuList.push(menus.참석자빠지기);
                    }
                    return useMenuList;
                },
                setAssetList: function () {
                    //해당 일정에 연동된 예약 호출
                    var wrap = "";
                    this.assetList.on("sync", function (collection, response) {
                        if (collection.toJSON().length > 0) {
                            var tpl = [];
                            $.each(collection.toJSON(), function (k, v) {
                                tpl.push('<li><span class="txt">' + v.itemName + '</span></li>');
                            });

                            wrap = '<dl class="list_type4">' +
                                '<dt><span class="txt">' + calendarLang['예약'] + '</span></dt>' +
                                '<dd>' +
                                '<ul>' + tpl.join('') +
                                '</ul>' +
                                '</dd>' +
                                '</dl>';
                        }
                        $('section').append(wrap);
                    });
                    this.assetList.fetch();
                },

                commentList: function () {
                    App.router.navigate('calendar/' + this.calendarId + "/event/" + this.eventId + "/comment", true);
                },

                copyUrl: function (e) {
                    GO.util.copyUrl(e);
                },
            });

            return CalendarView;

        });
}).call(this);