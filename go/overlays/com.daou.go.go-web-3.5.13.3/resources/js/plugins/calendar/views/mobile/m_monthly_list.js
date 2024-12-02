define("calendar/views/mobile/m_monthly_list", function (require) {
    var _ = require("underscore");
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var calendarLang = require("i18n!calendar/nls/calendar");
    var HeaderToolbarView = require("views/mobile/header_toolbar");
    var MiniCalendarView = require("components/minical/views/minical_app");
    var EventPools = require("calendar/collections/events_pool");
    var CalUtil =  require("calendar/libs/util");
    var UserProfileModel =  require("models/user_profile");

    require("jquery.go-popup");
    require("GO.util");
    require("jquery.go-validation");
    require("jquery.placeholder");

    var MobileMonthlyListView = Backbone.View.extend({

        el: '#content',
        initialize: function (options) {
            var self= this;
            GO.util.appLoading(true);
            this.checkedCalIds = _.isUndefined(CalUtil.getSavedSelectedCalendar()) || CalUtil.getSavedSelectedCalendar() === "" ? [] : CalUtil.getSavedSelectedCalendar().split(',');
            this.calLocalStorage = {type: "monthly"};
            $.bind(this.setSelectedCalendarOwnerIdList(), this);
            this.eventPools = new EventPools();
            _.each(this.checkedCalIds, function(calId){
                self.eventPools.add(calId)
            });
            this.miniCalendar = new MiniCalendarView(this._makeMiniCalendarOption(this.eventPools));
            this.toolbarOption = this._makeToolbarOption(this.miniCalendar);
            GO.EventEmitter.off('calendar','calendar-day-click');
            GO.EventEmitter.on('calendar','calendar-day-click', this.saveDateInLocalStorage, this);
            GO.EventEmitter.on('calendar','checkFeedBox', this.changeCheckbox, this);
        },

        changeCheckbox: function(){
            GO.util.appLoading(false);
            var self = this;
            this.eventPools = new EventPools();
            this.checkedCalIds = _.isUndefined(CalUtil.getSavedSelectedCalendar()) || CalUtil.getSavedSelectedCalendar() === "" ? [] : CalUtil.getSavedSelectedCalendar().split(',');
            this.calLocalStorage = {type: "monthly"};
            $.bind(this.setSelectedCalendarOwnerIdList(), this);

            _.each(this.checkedCalIds, function(calId){
                self.eventPools.add(calId)
            });
            this.miniCalendar = new MiniCalendarView(this._makeMiniCalendarOption(this.eventPools));
            this.miniCalendar.render();
        },

        setSelectedCalendarOwnerIdList : function(){
            var self = this;
            this.selectedCalendarOwnerIds = CalUtil.getSavedSelectedCalendarOwnerId();
            if(_.isUndefined(this.selectedCalendarOwnerIds) || this.selectedCalendarOwnerIds === ""){
                this.selectedCalendarOwnerIds = [];
                $('input:checkbox:checked[data-type!=all]').each(function(i,el){
                    if(!_.isUndefined($(el).data('calendar-owner-id'))){
                        self.selectedCalendarOwnerIds.push($(el).data('calendar-owner-id').toString());
                    }
                });
                CalUtil.saveCheckedCalendarOwnerId(this.selectedCalendarOwnerIds);
            }
        },

        saveDateInLocalStorage:function(date){
            this.calLocalStorage.date = date;
            GO.util.setLocalStorage("calLocalStorage", this.calLocalStorage);
        },
        _makeToolbarOption: function (miniCalendar) {
            var _this = this;
            return {
                title: calendarLang['일정목록'],
                isList : true,
                isSideMenu: true,
                isHome: true,
                isSearch : true,
                isWriteBtn : true,
                writeBtnCallback : function(){
                    _this.saveDateInLocalStorage(miniCalendar.getSelectedDate());
                    App.router.navigate('calendar/write/' + miniCalendar.getSelectedDate(), {
                        trigger: true,
                        pushState: true
                    });
                }
            };
        },

        _makeMiniCalendarOption: function (eventPools) {
            var ctx = this;
            return {
                renderTarget: ctx.$el,
                renderDate: ctx.$el.find("#curMonthPart").text(),
                dateDataEmptyMessage: calendarLang['등록된 일정이 없습니다'],
                buttonLeft: {
                    label: calendarLang['주간'],
                    url: function (data) {
                        return 'calendar/daily/'+ data['selectedDate'];
                    }
                },

                loadDataOnDateSet: function (start, end) {
                    var parseData = function (pool) {
                        var event = [];
                        var isGroupSchedule = function (event) {
                            if (event.get("attendees").length > 1) {
                                var isGroupSchedule = false;
                                var feedAttendeeNum = 0;
                                _.any(event.get("attendees"), function (attendee) {
                                    if (ctx.selectedCalendarOwnerIds.indexOf(attendee.id) > -1) {
                                        feedAttendeeNum++;
                                    }
                                    if (feedAttendeeNum === 2) {
                                        isGroupSchedule = true;
                                        return true;
                                    }
                                });
                                if (isGroupSchedule) {
                                    event.set("color", "_group");
                                    return true;
                                }
                            }
                            return false;
                        };

                        _.each(pool.getCollections(), function (collection) {
                            return collection.map(function (model) {
                                event.push({
                                    'id': model.get('id'),
                                    'calendarId': model.get('calendarId'),
                                    'calendarOwnerId' : model.get("calendarOwnerId"),
                                    'creatorId' : !_.isUndefined(model.get("creator")) ? model.get("creator").id : false,
                                    'name': model.get('summary').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
                                    'startTime': model.get('startTime'),
                                    'endTime': model.get('endTime'),
                                    'alldayType': model.get('timeType') == 'allday',
                                    'moveURL': 'calendar/' + model.get('calendarId') + "/event/" + model.get('id'),
                                    'isRedColor': model.get('type') == 'holiday' ? true : false,
                                    'isAllDay': model.get('type') == 'anniversary' || model.get('type') == 'holiday' ? true : false,
                                    'isMarking': model.get('type') != 'holiday' ? true : false,
                                    'visibility' : model.get('visibility'),
                                    'hasMultipleAttendees' : isGroupSchedule(model),
                                    'calendarColor' : model.get('color'),
                                    'timeType' : model.get('timeType'),
                                    'createdAt': model.get('createdAt')
                                });
                            });
                        });
                        return event;
                    };
                    var deferred = $.Deferred();
                    eventPools.setBoundaryTime(start, end);
                    eventPools.fetch().done(function (pool) {
                        deferred.resolve(parseData(pool));
                        GO.util.appLoading(false);
                    }).fail(function () {
                        deferred.reject();
                        GO.util.appLoading(false);
                    });

                    return deferred.promise();
                }
            }
        },

        render: function () {
            HeaderToolbarView.render(this.toolbarOption);
            this.miniCalendar.render();
        }
    });

    return {
        render: function (opt) {
            var view = new MobileMonthlyListView(opt);
            view.render();
        }
    };

});