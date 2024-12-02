(function() {
    define([
        "underscore", 
        "backbone", 
        "app",
        "i18n!nls/commons",
        "i18n!../../../calendar/nls/calendar",
        "../../../calendar/collections/events",
        "hgn!templates/side/daily_events_item",
        "hgn!templates/side/event_regist",
        "hgn!templates/side/daily_events_list"
    ],

    function(
        _,
        Backbone,
        GO,
        commonLang,
        calendarLang,
        CalendarEvents,
        dailyEventsItemTmpl,
        registTmpl,
        dailyEventsListTmpl
    ) {
        
        var DailyEventsItemView,
            DailyEventsListView,
            EventItemView;
        
        EventItemView = Backbone.View.extend({
            
            tagName: 'li',
            data: {},
            events: {
                'click .event' : 'moveToEventShowPage'
            },
            
            initialize: function(options) {
            	this.options = options || {};
            }, 

            render: function() {
                if (this.model.get('timeType') == 'allday') {
                    this.$el.addClass('day');
                }
                
                var html = [];
                html.push("<a class='event'>");
                if (this.model.get('timeType') == 'timed') {
                    html.push("<span class='time'>");
                    html.push(  this._rephraseDateTime(this.model.get('startTime')));
                    html.push(  " ~ ");
                    html.push(  this._rephraseDateTime(this.model.get('endTime')));
                    html.push("</span>");
                }
                
                html.push(  "<span class='subject'>" + this.model.get('summary') + "</span>");
                html.push('</a>');
                this.$el.html(html.join(""));
                return this;
            },
            
            moveToEventShowPage: function() {
                GO.router.navigate("calendar/" + this.model.get('calendarId') + '/event/' + this.model.get('id'), true);
                return false;
            },
            
            _rephraseDateTime: function(datetime) {
                if (GO.util.isSameDate(datetime, this.options.date)) {
                    return GO.util.hourMinute(datetime);
                } else {
                    return calendarLang["계속"];
                }
            }
        });

        DailyEventsItemView = Backbone.View.extend({
            tagName: 'li',
            events: {
                'click #newEvent': 'moveToEventRegist'
            },

            initialize: function(options) {
            	this.options = options;
            	if(GO.util.isToday(this.options.date)) {
                    this.$el.addClass('today');
                }
            },

            moveToEventRegist: function() {
                GO.router.navigate("calendar/regist?" + $.param({
                    "sd": GO.util.shortDate(this.options.date)
                }), true);
                return false;
            },

            render: function() {
                this._renderTemplate();
                if (this.collection.size() == 0) {
                    this._renderRegistView();
                } else {
                    this._renderEventsView();
                }
            },

            _renderTemplate: function() {
                this.$el.html(dailyEventsItemTmpl({
                    lang: { today: calendarLang["오늘"] },
                    model: {
                        date: GO.util.monthDateDay(this.options.date),
                        isToday: GO.util.isToday(this.options.date)
                    }
                }));
            },

            _renderRegistView: function() {
                this._addSubTemplate(registTmpl({
                    lang: { newEvent: calendarLang["새 일정"] }
                }));
            },

            _renderEventsView: function() {
                this.collection.models = _.sortBy(this.collection.models, function(m) {
                    return m.get('timeType') == 'timed';
                });

                _.each(this.collection.models, function(m) {
                    var eventView = new EventItemView({ date: this.options.date, model: m });
                    this._addSubTemplate(eventView.render().$el);
                }, this);
            },

            _addSubTemplate: function(subTmplElement) {
                var parent = this.$el.find('ul.item', this.$el);
                parent.append(subTmplElement);
            }
        });

        DailyEventsListView = Backbone.View.extend({

            tagName: 'section',
            className: 'side_calendar',
            datePattern: 'YYYY-MM-DD',
            startOfToday: null,

            events: {
                'click #newEvent': 'moveToEventRegist',
                'click #go_calendar_app': 'moveToEventList'
            },

            initialize: function() {
                this.startOfToday = moment().startOf('days');
            },

            render: function() {
                this._initTemplate();
                return this.$el;
            },

            moveToEventRegist: function() {
                GO.router.navigate("calendar/regist", true);
                return false;
            },

            moveToEventList: function() {
                GO.router.navigate("calendar", true);
                return false;
            },

            _initTemplate: function() {
                this.$el.html(dailyEventsListTmpl({
                    model: {
                        isToday: GO.util.isToday(this.startOfToday)
                    },
                    lang: {
                        today: calendarLang["오늘"],
                        title: calendarLang["내 일정"],
                        more_button: commonLang["자세히 보기"],
                        new_button: commonLang["추가"],
                        new_label: calendarLang["새 일정"]
                    }
                }));
            },
            
            render3DaysEvents: function(threeDaysEvents) {
                
                var listView = this.$el.find('.briefing_list');
                listView.empty();
                _.each(threeDaysEvents, function(model) {
                    var dailyEventsView = new DailyEventsItemView({
                        collection: new CalendarEvents(model.get('eventList')),
                        date: model.get('datetime')
                    });
                    dailyEventsView.render();
                    listView.append(dailyEventsView.el);
                }, this);
                return this.$el;
            }
        });

        return DailyEventsListView;

    });

}).call(this);