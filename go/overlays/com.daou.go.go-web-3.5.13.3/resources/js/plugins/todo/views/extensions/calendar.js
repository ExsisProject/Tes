define("todo/views/extensions/calendar", [
    "backbone",
    "todo/views/extensions/base",
    "hgn!todo/templates/extensions/extension_calendar",
    "todo/views/site/card_detail",
    "i18n!nls/commons",
    
    "jquery.ui",
    "jquery.calbean"
],

function(
    Backbone,
    TodoExtensionBaseView,
    renderExtensionCalendar,
    CardDetailView,
    CommonLang
) {

    var TodoCalendarView;

    // this.collection = TodoItemModel
    TodoCalendarView = TodoExtensionBaseView.extend({
        name: 'todo-calendar-view',
        className: 'view_type todo_calendar',

        todoModel: null,
        todoItemList: null,
        baseDate: null,

        template: renderExtensionCalendar,

        calbean: null,

        events: function() {
            var superEvents = TodoExtensionBaseView.prototype.events || {};

            return _.extend({}, superEvents, {
                "click .prev-btn": '_goToPrevMonth',
                "click .next-btn": '_goToNextMonth',
                "click .today-btn": '_goToToday',
                "click .datepicker-btn": '_showDatepicker'
            });
        },

        initialize: function(options) {
            var opts = options || {};
            TodoExtensionBaseView.prototype.initialize.call(this, opts);

            this.todoModel = opts.todoModel;
            this.todoItemList = opts.todoItemList;
            this.baseDate = new Date();
        },

        render: function() {
            this.setContent(this.template({
                "currentMonth": moment().format('YYYY.MM'),
                "label": {
                    "prev": CommonLang["이전"],
                    "next": CommonLang["다음"],
                    "today": CommonLang["오늘"]
                }
            }));

            initCalbean.call(this);
            this.calbean.render(covertToCalendarData.call(this));
            this._initDatepicker();
        },

        reloadEvents: function() {
            var self = this;
            // 곧바로 reset 하게 되면 jQuery.ui의 draggable 객체가 초기화되지 않아 undefined 오류가 난다.
            setTimeout(function() {
                self.calbean.resetEvents(covertToCalendarData.call(self));
            }, 50);
        },

        resize: function(height) {
            // width는 무시한다.
            TodoExtensionBaseView.prototype.resize.call(this, height);
            this.calbean.resize(getCalendarHeight.call(this));
        },

        _goToPrevMonth: function(e) {
            e.preventDefault();
            changeMonth.call(this, -1);
        },

        _goToNextMonth: function(e) {
            e.preventDefault();
            changeMonth.call(this, 1);
        },

        _goToToday: function(e) {
            e.preventDefault();
            changeMonth.call(this);
        },
        
        _showDatepicker: function(e) {
        	this.$el.find("#todoDatepicker").trigger("focus");
        },
        
        _initDatepicker : function() {
            var self = this;
        	var datepicker = this.$el.find("#todoDatepicker").datepicker({
        		changeMonth: true,
	            changeYear : true, 
	            yearSuffix: "",
        		onSelect : function(selected) {
        			changeDate.call(self, selected);
        		}
        	});
        	
        	this.$el.find("#todoDatepicker").datepicker("setDate", this.baseDate);
        }
    });

    function initCalbean(options) {
        var opts = _.extend({
            "date": new Date(),
            "startday": 0,
            "type": 'monthly',
            "lang": GO.config('locale'),
            "lazy": true
        });

        this.calbean = this.$el.find('.calbean-viewport').calbean(opts);
        delegateCalbeanEvents.call(this);
    }

    function changeDate(date) {
        var baseDate = moment(date);
        this.calbean.changeDate(baseDate.toDate(), covertToCalendarData.call(this));
        $('#date-indicator').text(baseDate.format('YYYY.MM'));
    }

    function changeMonth(offset) {
        if(typeof offset === 'undefined') {
            this.baseDate = new Date();
        } else {
            this.baseDate = moment(this.baseDate).clone().add('month', offset).toDate();
        }

        changeDate.call(this, this.baseDate);
    }

    function delegateCalbeanEvents() {
        this.calbean.on('request:show-event', _.bind(showTodoCardDetail, this));
        this.calbean.on('changed:date', _.bind(changeDueDate, this));
    }

    function showTodoCardDetail(e, todoCategoryId, todoItemId) {
        var todoItemModel = this.todoItemList.get(todoItemId),
            todoModel = todoItemModel.todoModel;

        CardDetailView.create(todoModel, todoItemModel);
    }

    function changeDueDate(e, todoItemId, todoCategoryId, updatedDate) {
        var todoItem = this.todoItemList.get(todoItemId),
            dueDate = moment(todoItem.get('dueDate')),
            self = this;

        this.todoItemList.updateTodoItem(todoItemId, {"dueDate": GO.util.toISO8601(updatedDate + 'T' + dueDate.format('HH:mm:ss'))});
    }

    function getCalendarHeight() {
        var eh = this.$el.height(),
            th = this.$el.find('.tool_bar').outerHeight();

        return eh - th - 30;
    }

    function covertToCalendarData(todoItemList) {
        var result = [],
            target = todoItemList || this.todoItemList,
            self = this;

        this.stopListening();

        target.each(function(todoItem) {
            if(todoItem.get('dueDate')) {
                var dueDate = moment(todoItem.get('dueDate'));
                var startTime = GO.util.toISO8601(dueDate.clone().startOf('day'));
                var endTime = GO.util.toISO8601(dueDate.clone().endOf('day'));

                result.push({
                    "id": todoItem.id,
                    "calendarId": todoItem.get('todoCategoryId'),
                    "type": 'normal',
                    "attendees": todoItem.get('members'),
                    "summary": todoItem.get('title'),
                    "visibility": 'public',
                    "timeType": 'allday',
                    "phase": 'solar',
                    "startTime": startTime,
                    "endTime": endTime,
                    "createdAt": todoItem.get('createdAt'),
                    "updatedAt": todoItem.get('updatedAt'),
                    "commentCount": todoItem.get('commentCount'),
                    "private": false,
                    "public": true,
                    "auth": self.todoModel.isMember(GO.session('id'))
                });

                self.listenToOnce(todoItem, 'change:title', self.reloadEvents);
                self.listenToOnce(todoItem, 'change:dueDate', self.reloadEvents);
                self.listenToOnce(todoItem, 'remove', self.reloadEvents);
            }
        });

        return result;
    }

    return TodoCalendarView;

});
