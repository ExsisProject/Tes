(function() {
    define([
        "underscore", 
        "backbone", 
        "app",
        "hogan",
        "i18n!nls/commons",
        "i18n!../../../calendar/nls/calendar",
        "hgn!templates/side/calendar"
    ],
    function(
        _,
        Backbone,
        GO,
        Hogan,
        commonLang,
        calendarLang,
        appTmpl
    ) {

        var HomeSideCalendarModel,
            DailyEventCollection,
            CalendarItemView,
            CalendarAppView;

        DailyEventCollection = GO.BaseCollection.extend({

            apiUrl: GO.config("contextRoot") + "api/calendar/user/me/event/daily?",
            conditions: {
                year: 0,
                month: 0
            },

            url: function() {
                return this.apiUrl + $.param(this.conditions);
            },

            setCondition: function(conds) {
                this.conditions = conds;
                return this;
            },

            setConditionByDate: function(datetime) {
                this.setCondition({
                    year: datetime.year(),
                    month: datetime.month() + 1
                });
                return this;
            }
        });
        
        HomeSideCalendarModel = Backbone.Model.extend({
            
            apiUrl: GO.config("contextRoot") + "api/calendar/user/me/event/daily?",
            conditions: {
                year: 0,
                month: 0
            },

            url: function() {
                return this.apiUrl + $.param(this.conditions);
            },

            setCondition: function(conds) {
                this.conditions = conds;
                return this;
            },

            setConditionByDate: function(datetime) {
                this.setCondition({
                    year: datetime.year(),
                    month: datetime.month() + 1
                });
                return this;
            }
        });

        CalendarItemView = Backbone.View.extend({

            tagName: 'td',
            content: {},

            initialize: function(options) {
            	this.options = options;
            	this.datetime = moment(this.model.get("datetime"));
            },

            render: function() {
            	var html = [];
                html.push("<span id='" + GO.util.toISO8601(this.datetime) + "'>");
                html.push(this.datetime.date());
                if (this._calculateBadgeCount() > 0) {
                    html.push("<span class='badge'>" + this._calculateBadgeCount() + "</span>");
                }
                html.push("</span>");
                
                this.$el.html(html.join(""));
                this.$el.attr("class", this._makeTdClass());
                return this.$el;
            },

            _makeTdClass: function() {
                var css = "";
                
                if (GO.util.isToday(this.datetime)) {
                    css += "on ";
                };
                
                if (this.datetime.day() == 0) { 
                    css += "sun "; 
                };
                
                if (this.options.current.month() != this.datetime.month()) { 
                    css += "other_month "; 
                };
                
                if (GO.util.isBeforeToday(this.datetime)) { 
                    css += "past "; 
                };
                
                return css;
            },

            _calculateBadgeCount: function() {
                return this.model.get("eventList").length;
            }
        });

        CalendarAppView = Backbone.View.extend({

            tagName: 'div',
            className: 'layer_normal layer_calendar',
            current: null,
            isFirstRendering: true,
            WEEK_COUNT_FOR_CACHE: 2,
            WEEK_DAYS_COUNT: 7,
            
            myEventsViewCallback: function(threeDaysEvents) {
                console.log("Any callback didn't binded from MyEventsView!");
            },

            events: {
                "click td": "onItemClicked",
                "click #prev_month": "goToPrevMonth",
                "click #next_month": "goToNextMonth"
            },

            initialize: function(options) {
            	this.options = options || {};
                this.current = (this.options.current) ? this.options.current : moment(new Date());
//                this.collection = new DailyEventCollection();
                this.model = new HomeSideCalendarModel();
                if (this.options.callback) this.myEventsViewCallback = this.options.callback;
            },

            onItemClicked: function(e) {
                var tdEl = ($(e.target).get(0).tagName == 'TD') ? $(e.target) : $(e.target).parents('td'),
            	    clickedDate = tdEl.children('span:first-child').attr("id");
                if (clickedDate) {
                    this._handleCallback(moment(clickedDate));
                }
                this._addClassToCurrentSelected(tdEl);
            },

            _handleCallback: function(datetime) {
                if (this.model.get("licenseAllowed") == true) {
                    var threeDaysEvents = [];
                    for(var i=0; i<3; i++) {
                        var day = datetime.clone().startOf('days').add('days', i),
                            dayEvents = _.find(new Backbone.Collection(this.model.get("list")).models, function(model) {
                                return GO.util.isSameDate(model.get('datetime'), day);
                            });
                        threeDaysEvents.push(dayEvents);
                    }
                    this.myEventsViewCallback(threeDaysEvents);
                } else {
                    this.$el.next().hide();
                }
            },
            
            _addClassToCurrentSelected: function(selectedTD) {
                this.$el.find('tbody').find('td').removeClass('select_on');
                selectedTD.addClass('select_on');
            },

            goToPrevMonth: function() {
                this.current = this.current.subtract("months", 1);
                this.render();
            },

            goToNextMonth: function() {
                this.current = this.current.add("months", 1);
                this.render();
            },

            render: function() {
                this.$el.empty().html(appTmpl(this._makeAppLabels()));
                this.model.setConditionByDate(this.current).fetch().done($.proxy(function() {
                    this._renderItems(new Backbone.Collection(this.model.get("list")));
                    if (this.isFirstRendering) {
                        this.isFirstRendering = false;
                        this._handleCallback(this.current);
                    }
                }, this));

                return this.$el;
            },

            _makeAppLabels: function() {
                return {
                    title: GO.util.formatDatetime(this.current, null, "YYYY. MM"),
                    prev: commonLang["이전"],
                    next: commonLang["다음"],
                    sun: calendarLang["일"],
                    mon: calendarLang["월"],
                    tue: calendarLang["화"],
                    wed: calendarLang["수"],
                    thu: calendarLang["목"],
                    fri: calendarLang["금"],
                    sat: calendarLang["토"]
                };
            },

            _renderItems: function(collection) {
                var itemViews = this._makeItemViews(collection);
                var weekRows = this._drawWeekRows(itemViews.length);
                this._appendItems(itemViews, weekRows);
            },
            
            _makeItemViews: function(collection) {
            	var itemViews = [];
                collection.each(function(model, index) {
                    var calItemView = new CalendarItemView({
                        current: this.current,
                        model: model
                    });
                    itemViews.push(calItemView.render());
                }, this);
                return itemViews;
            },
            
            _drawWeekRows: function(monthDaysCount) {
            	var tbody = this.$el.find('tbody'),
            		rowCount = (monthDaysCount / this.WEEK_DAYS_COUNT),
            		rowCountWithoutCache = rowCount - this.WEEK_COUNT_FOR_CACHE;
                for (var i = 0; i < rowCountWithoutCache; i++) {
                    tbody.append('<tr></tr>');
                }
                return tbody.find("tr");
            },
            
            _appendItems: function(itemViews, weekRows) {
            	var removeItemsForCache = function(views, ctx) {
            		for (var i=0; i < ctx.WEEK_DAYS_COUNT; i++) {
            			views.pop();
            			views.shift();
                	}
            		return views;
            	};
            	_.each(removeItemsForCache(itemViews, this), function(item, idx) {
            		var weekSequenceOfDate = Math.floor(idx/this.WEEK_DAYS_COUNT);
            		weekRows.eq(weekSequenceOfDate).append(item);
                }, this);
            }
        });

        return CalendarAppView;

    });

}).call(this);