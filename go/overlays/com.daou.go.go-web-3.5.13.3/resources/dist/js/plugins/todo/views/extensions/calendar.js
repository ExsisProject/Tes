define("todo/views/extensions/calendar",["backbone","todo/views/extensions/base","hgn!todo/templates/extensions/extension_calendar","todo/views/site/card_detail","i18n!nls/commons","jquery.ui","jquery.calbean"],function(e,t,n,r,i){function o(e){var t=_.extend({date:new Date,startday:0,type:"monthly",lang:GO.config("locale"),lazy:!0});this.calbean=this.$el.find(".calbean-viewport").calbean(t),f.call(this)}function u(e){var t=moment(e);this.calbean.changeDate(t.toDate(),p.call(this)),$("#date-indicator").text(t.format("YYYY.MM"))}function a(e){typeof e=="undefined"?this.baseDate=new Date:this.baseDate=moment(this.baseDate).clone().add("month",e).toDate(),u.call(this,this.baseDate)}function f(){this.calbean.on("request:show-event",_.bind(l,this)),this.calbean.on("changed:date",_.bind(c,this))}function l(e,t,n){var i=this.todoItemList.get(n),s=i.todoModel;r.create(s,i)}function c(e,t,n,r){var i=this.todoItemList.get(t),s=moment(i.get("dueDate")),o=this;this.todoItemList.updateTodoItem(t,{dueDate:GO.util.toISO8601(r+"T"+s.format("HH:mm:ss"))})}function h(){var e=this.$el.height(),t=this.$el.find(".tool_bar").outerHeight();return e-t-30}function p(e){var t=[],n=e||this.todoItemList,r=this;return this.stopListening(),n.each(function(e){if(e.get("dueDate")){var n=moment(e.get("dueDate")),i=GO.util.toISO8601(n.clone().startOf("day")),s=GO.util.toISO8601(n.clone().endOf("day"));t.push({id:e.id,calendarId:e.get("todoCategoryId"),type:"normal",attendees:e.get("members"),summary:e.get("title"),visibility:"public",timeType:"allday",phase:"solar",startTime:i,endTime:s,createdAt:e.get("createdAt"),updatedAt:e.get("updatedAt"),commentCount:e.get("commentCount"),"private":!1,"public":!0,auth:r.todoModel.isMember(GO.session("id"))}),r.listenToOnce(e,"change:title",r.reloadEvents),r.listenToOnce(e,"change:dueDate",r.reloadEvents),r.listenToOnce(e,"remove",r.reloadEvents)}}),t}var s;return s=t.extend({name:"todo-calendar-view",className:"view_type todo_calendar",todoModel:null,todoItemList:null,baseDate:null,template:n,calbean:null,events:function(){var e=t.prototype.events||{};return _.extend({},e,{"click .prev-btn":"_goToPrevMonth","click .next-btn":"_goToNextMonth","click .today-btn":"_goToToday","click .datepicker-btn":"_showDatepicker"})},initialize:function(e){var n=e||{};t.prototype.initialize.call(this,n),this.todoModel=n.todoModel,this.todoItemList=n.todoItemList,this.baseDate=new Date},render:function(){this.setContent(this.template({currentMonth:moment().format("YYYY.MM"),label:{prev:i["\uc774\uc804"],next:i["\ub2e4\uc74c"],today:i["\uc624\ub298"]}})),o.call(this),this.calbean.render(p.call(this)),this._initDatepicker()},reloadEvents:function(){var e=this;setTimeout(function(){e.calbean.resetEvents(p.call(e))},50)},resize:function(e){t.prototype.resize.call(this,e),this.calbean.resize(h.call(this))},_goToPrevMonth:function(e){e.preventDefault(),a.call(this,-1)},_goToNextMonth:function(e){e.preventDefault(),a.call(this,1)},_goToToday:function(e){e.preventDefault(),a.call(this)},_showDatepicker:function(e){this.$el.find("#todoDatepicker").trigger("focus")},_initDatepicker:function(){var e=this,t=this.$el.find("#todoDatepicker").datepicker({changeMonth:!0,changeYear:!0,yearSuffix:"",onSelect:function(t){u.call(e,t)}});this.$el.find("#todoDatepicker").datepicker("setDate",this.baseDate)}}),s});