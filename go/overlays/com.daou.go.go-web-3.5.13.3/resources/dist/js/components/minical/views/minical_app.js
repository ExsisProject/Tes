define("components/minical/views/minical_app",function(require){var e=require("backbone"),t=require("app"),n=require("hogan"),r=require("i18n!calendar/nls/calendar"),i=require("calendar/collections/calendars"),s=require("calendar/collections/events_pool"),o=require("hgn!components/minical/templates/minical_app"),u=require("models/user_profile");require("GO.util");var a={today:r["\uc624\ub298"],year:r["\ub144"],month:r["\ub2ec"],list:r["\ubaa9\ub85d"],sun:r["\uc77c"],mon:r["\uc6d4"],tue:r["\ud654"],wed:r["\uc218"],thu:r["\ubaa9"],fri:r["\uae08"],sat:r["\ud1a0"],"continue":r["\uacc4\uc18d"]},f=e.View.extend({tagName:"div",id:"mini_calendar",events:{"vclick .wrap_updown":"clickArrow"},initialize:function(t){this.renderTarget=t.renderTarget,this.renderDate=t.renderDate,this.buttonLeft=t.buttonLeft,this.dateDataEmptyMessage=t.dateDataEmptyMessage,this.dataManager=new p({loadData:t.loadDataOnDateSet}),this.observer=_.extend({},e.Events),this.holidayManager=new v,this._setCurrent(m.now()),this._bindDateSelected(),this._bindLeftButtonClicked(),this._bindMonthChanged(),this._bindDataListExpanded()},clickArrow:function(e){e.stopPropagation(),e.stopImmediatePropagation(),e.preventDefault();var t=$(e.currentTarget);this.observer.trigger("DataListArrowClicked",t)},_setCurrent:function(e){this.renderDate?(this.curYear=this.renderDate.split(".")[0],this.curMonth=this.renderDate.split(".")[1],this.renderDate=""):(this.curYear=m.getYear(e),this.curMonth=m.getMonth(e))},_bindDateSelected:function(){this.observer.on("dateSelected",function(){var e=arguments[0],t=arguments[1];this._onDateSelected(e,t)},this)},_bindLeftButtonClicked:function(){this.observer.on("leftButtonClicked",function(){this._onLeftButtonClicked()},this)},_bindMonthChanged:function(){this.observer.on("nextMonthClicked prevMonthClicked todayClicked nextDayClicked prevDayClicked",function(e,t){console.log("minical month changed event. "+e);var n=m.startOfMonth(this.curYear,this.curMonth),r,i;switch(e){case"nextMonthClicked":this._setCurrent(m.addMonth(n,1)),i=this._fetchSideMonth();break;case"prevMonthClicked":this._setCurrent(m.subtractMonth(n,1)),i=this._fetchSideMonth();break;case"nextDayClicked":var s=$("#curMonthPart").text().replace(/\./gi,"-");this.curMonth=$("#curMonthPart").text().split(".")[1],r=moment(s).add(1,"days");if(r.format("MM")!==this.curMonth||$("#curMonthPart").attr("data-date").split(".")[1]!==this.curMonth)$("#curMonthPart").attr("data-date").split(".")[1]!==this.curMonth&&(this.curMonth-=1),this.observer.trigger("nextMonthClicked","nextMonthClicked"),$("#curMonthPart").attr("data-date",r.format("YYYY.MM"));break;case"prevDayClicked":var s=$("#curMonthPart").text().replace(/\./gi,"-");this.curMonth=$("#curMonthPart").text().split(".")[1],r=moment(s).subtract(1,"days");if(r.format("MM")!==this.curMonth||$("#curMonthPart").attr("data-date").split(".")[1]!==this.curMonth)$("#curMonthPart").attr("data-date").split(".")[1]!==this.curMonth&&(this.curMonth+=1),this.observer.trigger("prevMonthClicked","prevMonthClicked"),$("#curMonthPart").attr("data-date",r.format("YYYY.MM"));break;default:r=m.now(),this._setCurrent(r),this._fetchNowMonth().done($.proxy(this._onFetched,this)),$("#curMonthPart").attr("data-date",r.format("YYYY.MM"))}e==="prevDayClicked"||e==="nextDayClicked"||e==="todayClicked"?($("#curMonthPart").text(r.format(this._isCalendarFolded()?"YYYY.MM.DD":"YYYY.MM")),this.calTableView._markSelected(r.format("YYYY-MM-DD"))):($("#curMonthPart").attr("data-date",this.toolbarView._generateTitle(this.curYear,this.curMonth)),this.toolbarView.changeTitle(this.curYear,this.curMonth),i.done($.proxy(this._onFetched,this)))},this)},_isCalendarFolded:function(){return $(".wrap_tb_calendar").css("display")==="none"},_bindDataListExpanded:function(){var e=this;this.observer.on("DataListArrowClicked",function(t){t.find("span").hasClass("btn_list_up")?t.find("span").removeClass("btn_list_up").addClass("btn btn_list_down"):t.find("span").removeClass("btn_list_down").addClass("btn_list_up"),e._isCalendarFolded()?($("#curMonthPart").text($("#curMonthPart").attr("data-date")),$(".wrap_tb_calendar").css("display","")):($("#curMonthPart").attr("data-date",$("#curMonthPart").text().trim()),$("#curMonthPart").text("".concat(e.curYear,".",$("#minicalendar_datalist dt").text().split(" (")[0].trim())),$(".wrap_tb_calendar").css("display","none"))})},getSelectedDate:function(){return this.calTableView.getSelectedDate()},render:function(){return console.log("render minical"),this._renderContainer(),this._renderToolbar(),this._fetchNowMonth().done($.proxy(this._onFetched,this)),GO.util.appLoading(!0),this},_renderContainer:function(){this.renderTarget.html(this.$el),this.$el.html(o({lang:a}))},_renderToolbar:function(){this.toolbarView=new l({el:"#minicalendar_toolbar",buttonLeft:this.buttonLeft,observer:this.observer}),this.toolbarView.render(this.curYear,this.curMonth)},_onFetched:function(e){this.calTableView=new c({holidayManager:this.holidayManager,observer:this.observer,dataList:e,year:this.curYear,month:this.curMonth}),this.$("#minicalendar_table").replaceWith(this.calTableView.render().el)},_fetchNowMonth:function(){return this.dataManager.fetchMonth(this.curYear,this.curMonth)},_fetchSideMonth:function(){return this.dataManager.fetchSideMonth(this.curYear,this.curMonth)},_onDateSelected:function(e,t){var n=new h({date:e,dataList:t,dateDataEmptyMessage:this.dateDataEmptyMessage});this.$("#minicalendar_datalist").replaceWith(n.render().el)},_onLeftButtonClicked:function(){var e=this.buttonLeft.url({selectedDate:this.calTableView.getSelectedDate()});_.isString(e)&&e.length>0&&(console.log("minical left button clicked: "+e),t.router.navigate(e,{trigger:!0,pushState:!0}))}}),l=e.View.extend({events:{"vclick #nextMonthPart":"_onNextClicked","vclick #prevMonthPart":"_onPrevClicked","vclick #goToday":"_onGoTodayClicked","vclick #leftButton":"_onLeftButtonClicked"},initialize:function(e){this.buttonLeft=e.buttonLeft,this.observer=e.observer},changeTitle:function(e,t){this.$el.find("#curMonthPart").html(this._generateTitle(e,t))},render:function(e,t){this.$el.html(this._renderTemplate().render(this._makeTemplateData(e,t)))},_renderTemplate:function(){var e=[];return e.push('<div class="current_date">'),e.push('     <a data-bypass id="prevMonthPart" href="javascript:;">'),e.push('         <span class="btn btn_prev_type2"></span>'),e.push("    </a>"),e.push('    <span class="date" id="curMonthPart" data-date="{{currentDateBasic}}">'),e.push("        {{yearAndMonth}}"),e.push("    </span>"),e.push('    <a data-bypass id="nextMonthPart" href="javascript:;">'),e.push('        <span class="btn btn_next_type2"></span>'),e.push("    </a>"),e.push("</div>"),e.push('<div class="critical">'),e.push('    <a class="btn_tool" id="leftButton" data-role="button" data-bypass href="javascript:;">'),e.push('        <span class="txt">{{buttonLeftLabel}}</span>'),e.push("    </a>"),e.push("</div>"),e.push('<div class="optional">'),e.push('    <a class="btn_tool" id="goToday" data-role="button" data-bypass href="javascript:;">'),e.push('        <span class="txt">{{lang.today}}</span>'),e.push("    </a>"),e.push("</div>"),n.compile(e.join(""))},_makeTemplateData:function(e,t){return{currentDateBasic:[e,t].join("."),buttonLeftLabel:this.buttonLeft.label,yearAndMonth:this._generateTitle(e,t),lang:a}},_generateTitle:function(e,t){return"".concat(e,".",GO.util.leftPad(t,2,"0"))},_onNextClicked:function(e){e.preventDefault(),e.stopPropagation(),$(".wrap_updown span").hasClass("btn_list_down")?this.observer.trigger("nextDayClicked","nextDayClicked"):(GO.util.appLoading(!1),this.observer.trigger("nextMonthClicked","nextMonthClicked"))},_onPrevClicked:function(e){e.preventDefault(),e.stopPropagation(),$(".wrap_updown span").hasClass("btn_list_down")?this.observer.trigger("prevDayClicked","prevDayClicked"):(GO.util.appLoading(!1),this.observer.trigger("prevMonthClicked","prevMonthClicked"))},_onGoTodayClicked:function(e){e.preventDefault(),e.stopPropagation(),this.observer.trigger("todayClicked","todayClicked")},_onLeftButtonClicked:function(e){e.preventDefault(),e.stopPropagation(),this.observer.trigger("leftButtonClicked")}}),c=e.View.extend({tagName:"div",className:"month_body",attributes:{id:"minicalendar_table"},events:{'vclick td[data-btntype="day"]':"_onDateClicked"},initialize:function(e){this.holidayManager=e.holidayManager,this.observer=e.observer,this.dataList=e.dataList,this.year=e.year,this.month=e.month,this.selectedDate=this._decideSelected(this.year,this.month),this.otherCompanyReservation=!!e.otherCompanyReservation,GO.router.getUrl().indexOf("asset")===-1&&c.sortEvents(this.dataList),this.dataGroupedByDate=c.groupByDate(this.dataList)},render:function(){return this._renderTable(),this._markSelectedOnInit(),this._fetchHolidays().done($.proxy(this._markHolidays,this)),this},getSelectedDate:function(){var e=this.$el.find(".bg_row td").filter(".on");return e.length>0?e.attr("data-date"):""},_decideSelected:function(e,t){var n=m.now();return this.year==m.getYear(n)&&this.month==m.getMonth(n)?n:m.startOfMonth(e,t)},_renderTable:function(){var e=this._makeTemplate(),t=this._makeTemplateData(this.year,this.month);this.$el.html(e.render(t))},_markSelectedOnInit:function(){this.$el.find(".bg_row td").hasClass("on")||this._markSelected(this.selectedDate.format("YYYY-MM-DD"))},_fetchHolidays:function(){var e=m.startOfMonth(this.year,this.month),t=c.getStart(e),n=c.getLast(e);return this.holidayManager.fetch(t,n)},_markHolidays:function(e){_.each(e,function(e){var t=m.formatInYYYYMMDD(e.get("startTime")),n=this.$el.find('th[data-date="'+t+'"]');if(!n||n.hasClass("sun"))return;e.get("type")=="holiday"&&n.addClass("sun")},this)},_makePieceScheduleTmpl:function(e){return e.push("{{^alreadyRender}}"),e.push('<td class="{{dateClass}} {{#isHoliday}}sun{{/isHoliday}}" colspan="{{period}}">'),e.push("    {{#isAllDayScheduleOfCalenderMenu}}"),e.push('    <div class="schedule_day {{#isHoliday}}holiday_off{{/isHoliday}} bgcolor{{color}}">'),e.push("    {{/isAllDayScheduleOfCalenderMenu}}"),e.push("    {{^isAllDayScheduleOfCalenderMenu}}"),e.push('    <div class="schedule_time">'),e.push('    <span class="chip bgcolor{{color}}"></span>'),e.push("    {{/isAllDayScheduleOfCalenderMenu}}"),e.push("    {{#isSecret}}"),e.push('    <span class="btn btn_secret_s"></span>'),e.push("    {{/isSecret}}"),e.push("        <span>{{name}}</span>"),e.push("    </div>"),e.push("</td>"),e.push("{{/alreadyRender}}"),e},_makeTemplate:function(){var e=[];return e.push("{{#weeks}}"),e.push('<div class="week_schedule" data-week-id="{{weekId}}">'),e.push('    <table class="tb_calendar schedule_row tb_fix">'),e.push("        <tbody>"),e.push("            <tr>"),e.push("                {{#weekDays}}"),e.push('                <th class="{{dateClass}} {{isWeekend}}" data-date="{{dateInYYYY-MM-DD}}">'),e.push("                    <div>"),e.push("                        <span>{{dateInD}}</span>"),e.push("                    </div>"),e.push("                </th>"),e.push("                {{/weekDays}}"),e.push("            </tr>"),e.push("            <tr>"),e.push("                {{#weekDays}}"),e.push("                {{#firstSchedule}}"),e.push(this._makePieceScheduleTmpl(e)),e.push("                {{/firstSchedule}}"),e.push("                {{^firstSchedule}}"),e.push('                <td class="{{dateClass}} {{#isHoliday}}sun{{/isHoliday}}" colspan="{{period}}">'),e.push("                </td>"),e.push("                {{/firstSchedule}}"),e.push("                {{/weekDays}}"),e.push("            </tr>"),e.push("            <tr>"),e.push("                {{#weekDays}}"),e.push("                {{#secondSchedule}}"),e.push(this._makePieceScheduleTmpl(e)),e.push("                {{/secondSchedule}}"),e.push("                {{^secondSchedule}}"),e.push('                <td class="{{dateClass}} {{#isHoliday}}sun{{/isHoliday}}" colspan="{{period}}">'),e.push("                </td>"),e.push("                {{/secondSchedule}}"),e.push("                {{/weekDays}}"),e.push("            </tr>"),e.push("            <tr>"),e.push("                {{#weekDays}}"),e.push('                <td class="{{dateClass}}">'),e.push("                    {{#hasScheduleMoreThanTwo}}"),e.push('                    <div class="schedule_more">'),e.push("                        <span>+{{exceededScheduleNum}}</span>"),e.push("                    </div>"),e.push("                    {{/hasScheduleMoreThanTwo}}"),e.push("                </td>"),e.push("                {{/weekDays}}"),e.push("            </tr>"),e.push("        </tbody>"),e.push("    </table>"),e.push('    <table class="bg_row tb_fix">'),e.push("        <tbody>"),e.push("            <tr>"),e.push("                {{#weekDays}}"),e.push('                <td data-date="{{dateInYYYY-MM-DD}}" data-btntype="day"></td>'),e.push("                {{/weekDays}}"),e.push("            </tr>"),e.push("        </tbody>"),e.push("    </table>"),e.push("</div>"),e.push("{{/weeks}}"),n.compile(e.join(""))},filterSameSchedule:function(e,t){var n=[],r=_.filter(e,function(e){if(n.indexOf(e.id)>-1)return!1;var r=moment(t).isSame(e.endTime)&&moment(e.endTime).format("HH:mm")==="00:00"&&e.timeType==="timed";if(!r)return n.push(e.id),!0});return r},_makeTemplateData:function(e,t){var n=this,r=m.startOfMonth(e,t),i=c.getStart(r),s=c.getLast(r),o={lang:a,weeks:[]},u=function(e){var r=m.formatInYYYYMMDD(e),i=n.dataGroupedByDate[r],s=!1,o=!1,u=!1;if(!_.isUndefined(i)){var a=n.filterSameSchedule(i,e),h=f(a,e);u=a.length>=3,h.length>=1&&(_.isNull(h[0])||(s=l(h[0],e)),_.isNull(h[1])||(o=l(h[1],e)))}var p=function(e){return e.day()===6?"sat":e.day()===0?"sun":""};return{dateClass:c.generateTbClass(e,t),isWeekend:p(e),"dateInYYYY-MM-DD":r,dateInD:e.format("D"),firstSchedule:s,secondSchedule:o,hasScheduleMoreThanTwo:u,exceededScheduleNum:u?a.length-2:!1}},f=function(e,t){var r=[],i=0,s=null,o=null,u=function(e){i++,e.alreadyRender=!1,_.isNull(s)?(e.positionForRender="first",s=e):(e.positionForRender="second",o=e)},a=function(e,t){e.positionForRender==="first"?(t.alreadyRender=!0,i++,s=t):e.positionForRender==="second"&&(t.alreadyRender=!0,i++,o=t)};for(var f=0;f<e.length;f++){if(i===2)break;var l=e[f],c=GO.util.dateWithoutTimeZone(l.endTime),h=GO.util.dateWithoutTimeZone(l.startTime),p=c.diff(h,"days")>=1&&h.isBefore(t),d=t.format("d")==="0"&&moment(l.startTime).week()!==t.week();if(p){var v=n.dataGroupedByDate[m.formatInYYYYMMDD(l.startTime)];v=n.filterSameSchedule(v,t),_.each(v,function(e){e.id===l.id&&(d?u(l):a(e,l))})}else u(l)}return r.push(s,o),r},l=function(e,t){var n=moment(e.startTime),r=moment(e.endTime),i=moment(GO.util.basicDate3(t.clone().add(1,"days"))),s=function(){return e.isRedColor?"":e.calendarColor},o=function(){if(e.alreadyRender)return;r.format("HH:mm")==="00:00"&&e.timeType==="timed"&&r.subtract("seconds",1);var i=r.diff(n,"days")+1;return r.week()!==n.week()&&(t.week()===n.week()?i=6-parseInt(n.format("d"))+1:t.week()===r.week()?i=parseInt(r.format("d"))+1:i=7),i};return{period:o(),alreadyRender:_.isUndefined(e.alreadyRender)?!1:e.alreadyRender,isAllDayScheduleOfCalenderMenu:GO.router.getUrl().indexOf("asset")===-1&&(!n.isAfter(t)||!i.isAfter(r)),color:s,name:e.name,isHoliday:e.isRedColor,isSecret:e.visibility==="private"}},h=i.clone();for(var p=0;p<c.getWeekCount(i,s);p++){var d=[];for(var v=0;v<7;v++)d.push(u(h)),h.add(1,"days");o.weeks.push({weekId:p+"_week",weekDays:d})}return o},_onDateClicked:function(e){var t=$(e.currentTarget),n=t.attr("data-date");this._markSelected(n)},_markSelected:function(e){var t=this.filterSameSchedule(this.dataGroupedByDate[e],e);this.$el.find(".bg_row td").removeClass("on").filter('[data-date="'+e+'"]').addClass("on"),this.observer.trigger("dateSelected",moment(e),t)}},{getStart:function(e){var t=e.clone().startOf("month");return t.subtract(t.day(),"days")},getLast:function(e){var t=e.clone().endOf("month");return t.add(6-t.day(),"days")},getWeekCount:function(e,t){var n=t.diff(e,"days")+1;return n/7},sortEvents:function(e){function t(e,t){var i={allday:1,timed:2};return(new r(e,t)).pipe(function(t,r){return n(t.startTime,r.startTime)}).pipe(function(t,r){return n(r.endTime,t.endTime)}).pipe(function(t,n){return i[t.timeType]-i[n.timeType]}).pipe(function(t,n){return moment(t.startTime).valueOf()-moment(n.startTime).valueOf()}).pipe(function(t,n){return moment(t.createdAt).valueOf()-moment(n.createdAt).valueOf()}).run()}function n(e,t){var n=e.split("T")[0],r=t.split("T")[0],i=-1;return n>r?i=1:n===r&&(i=0),i}function r(e,t){this.a=e,this.b=t,this.__result__=0,this.pipe=function(e){return this.__result__===0&&(this.__result__=e(this.a,this.b)),this},this.run=function(){return this.__result__}}e.sort(t)},groupByDate:function(e){var t={};return _.each(e,function(e){var n=[],r=e.startTime,i=e.endTime;e.alldayType?(r=GO.util.dateWithoutTimeZone(r),i=GO.util.dateWithoutTimeZone(i)):(r=moment(r),i=moment(i));for(var s=0;s<=i.diff(r,"days");s++){var o=r.clone().add(s,"days");n.push(m.formatInYYYYMMDD(o))}_.each(n,function(n){_.isArray(t[n])||(t[n]=[]),t[n].push(e)})}),t},generateTbClass:function(e,t){var n=[];return m.getMonth(e)!=t&&n.push("other_month"),GO.util.isToday(e)&&n.push("today"),n.join(" ")}}),h=e.View.extend({tagName:"dl",attributes:{id:"minicalendar_datalist"},className:"list_type3 list_today",events:{'vclick a[data-btntype="eventWrap"]':"_onDataInDataListClicked"},initialize:function(e){this.date=e.date,this.dataList=e.dataList,_.isArray(this.dataList)||(this.dataList=[]),this.dateDataEmptyMessage=e.dateDataEmptyMessage},render:function(){return this.$el.html(this._makeTemplate().render(this._makeTemplateData())),this},_makeTemplate:function(){var e=[];return e.push("<dt>"),e.push('    <span class="txt {{#isHoliday}}holiday_off{{/isHoliday}} {{^isHoliday}}{{isWeekend}}{{/isHoliday}}">{{todayLabel}}</span>'),e.push("    {{#isHoliday}}"),e.push('    <span class="txt {{#isHoliday}}holiday_off{{/isHoliday}}">{{holidayName}}</span>'),e.push("    {{/isHoliday}}"),e.push("</dt>"),e.push("{{^dataList}}"),e.push('<dd class="data_null_s">'),e.push('    <span class="txt">{{empty_data_list_message}}</span>'),e.push("</dd>"),e.push("{{/dataList}}"),e.push("{{#dataList}}"),e.push("<dd>"),e.push('    <a data-bypass data-btntype="eventWrap" data-id="{{dataId}}" data-calendarId="{{calendarId}}" data-url="{{dataURL}}" data-visibility="{{visibility}}" href="javascript:;">'),e.push("        {{#thumbnail}}"),e.push('        <div class="wrap_photo">'),e.push('            <span class="photo">'),e.push('            <img src="{{thumbnail}}">'),e.push("            </span>"),e.push("        </div>"),e.push("        {{/thumbnail}}"),e.push('        <div class="info">'),e.push('            {{^isAllDay}}<span class="time">{{dataDuration}}</span>{{/isAllDay}}'),e.push('            <span class="subject {{#otherCompanyReservation}}multi_user{{/otherCompanyReservation}}">'),e.push("                {{#isSecret}}"),e.push('                <span class="btn btn_secret_s"></span>'),e.push("                {{/isSecret}}"),e.push('                <span class="txt_ellipsis">{{name}}</span>'),e.push("                </span>"),e.push('            <span class="ic ic_arrow_type2"></span>'),e.push("        </div>"),e.push('        <span class="chip bgcolor{{calendarColor}}"></span>'),e.push("    </a>"),e.push("</dd>"),e.push("{{/dataList}}"),n.compile(e.join(""))},_makeTemplateData:function(){var e=!1,t=null,n=_.map(this.dataList,function(e){var t=this._formatDuration(this.date,e.startTime,e.endTime,e.alldayType),n=function(e){var t=_.isNull(sessionStorage.getItem("calendar-thumbnail-list"))?[]:JSON.parse(sessionStorage.getItem("calendar-thumbnail-list")),n=e.calendarOwnerId;if(_.isUndefined(n)||e.hasMultipleAttendees)return GO.contextRoot+"resources/images/mobile/photo_profile_group.jpg";var r=null;_.any(t,function(e){if(e.id===n)return r=e.thumbnail,!0});if(!_.isNull(r))return r;var i=u.read(n).get("thumbSmall"),s={id:n,thumbnail:i};return t.push(s),sessionStorage.setItem("calendar-thumbnail-list",JSON.stringify(t)),i},r=function(e){return _.isUndefined(e.companyName)?e.name:[e.companyName,e.name].join(" ")};return{dataId:e.id,calendarId:e.calendarId,name:e.otherCompanyReservation?r(e):e.name,dataURL:e.moveURL,dataDuration:t,isRedColor:e.isRedColor,isAllDay:e.isAllDay,otherCompanyReservation:e.otherCompanyReservation,visibility:e.visibility,calendarColor:e.calendarColor,thumbnail:n(e),isSecret:e.visibility==="private"}},this).filter(function(n){return n.isRedColor?(e=!0,t=n.name,!1):!0}),r=$.proxy(function(){var e=this.date.format("dd");return e.indexOf("\ud1a0")>-1?"sat":e.indexOf("\uc77c")>-1?"sun":""},this);return{todayLabel:this._formatListTitle(this.date),empty_data_list_message:this.dateDataEmptyMessage,dataList:n,isHoliday:e,holidayName:t,isWeekend:r}},_formatListTitle:function(e){return GO.util.formatDatetime(e,null,"MM.DD (dd)")},_formatDuration:function(e,t,n,i){if(i)return r["\uc885\uc77c"];var s="";e.isSame(t,"days")?s+=GO.util.formatDatetime(t,null,"MM.DD(ddd) HH:mm"):s+=a["continue"],s+=" ~ ";var o=moment(n).format("HH:mm")==="00:00"&&moment(n).clone().subtract("days",1).isSame(e,"days");return e.isSame(n,"days")||o?s+=GO.util.formatDatetime(n,null,"MM.DD(ddd) HH:mm"):s+=a["continue"],s},_onDataInDataListClicked:function(e){e.preventDefault(),e.stopPropagation(),GO.EventEmitter.trigger("calendar","calendar-day-click",moment(this.date._d).format("YYYY-MM-DD"));var n=$(e.currentTarget),r=n.attr("data-url");$("body").data("sideApp")=="asset"?t.router.navigate(r,{trigger:!0,pushState:!0}):$.ajax({type:"GET",url:GO.contextRoot+"api/calendar/"+n.attr("data-calendarId")+"/event/"+n.attr("data-id")}).done(function(e){var n=e.data,i=_.where(n.attendees,{id:GO.session("id")}).length>0;n&&(n.visibility!=="private"||i)&&t.router.navigate(r,{trigger:!0,pushState:!0})}).fail(function(){return})}}),p=function(e){function r(e,t,n){return _.filter(e,function(e){return GO.util.toISO8601(e.startTime)<=GO.util.toISO8601(n)&&GO.util.toISO8601(e.endTime)>=GO.util.toISO8601(t)})}var t=new d,n=e.loadData;return{fetchMonth:function(e,t){var i=$.Deferred(),s=m.startOfMonth(e,t),o=c.getStart(s),u=c.getLast(s);return n(o,u).done(function(e){var t=c.getStart(s),n=c.getLast(s),o=r(e,t,n);i.resolve(o)}),i.promise()},fetchSideMonth:function(e,t){GO.util.appLoading(!0);var r=$.Deferred(),i=m.startOfMonth(e,t),s=c.getStart(i),o=c.getLast(i);return n(s,o).done(function(e){r.resolve(e)}),r.promise()}}},d=function(){var e={};return{set:function(t,n,r){e[t]||(e[t]={}),e[t][n]=r},get:function(t,n){return e[t]?e[t][n]||[]:[]},clear:function(t,n){if(!e[t]){e[t]={};return}delete e[t][n]},reset:function(){e={}}}},v=function(){function e(e){return _.find(e,function(e){return e["type"]=="holiday"})}function t(e,t,n){var r=new s;return r.setBoundaryTime(t,n),r.add(e),r}function n(){var e=new i;return e.setUserId(GO.session().id),e}function r(e,t,n){return _.filter(e,function(e){return e.get("startTime")<=GO.util.toISO8601(n)&&e.get("endTime")>=GO.util.toISO8601(t)})}var o={};return{holidayList:[],fetch:function(i,s){var u=this,a=$.Deferred(),f=n(),l=i.clone().add(Math.abs(i.diff(s))/2),c=m.getYear(l);return o[c]?(a.resolve(r(o[c],i,s)),a.promise()):(f.fetch().done(function(n){var f=e(n.data),l=m.startOfYear(c),h=m.endOfYear(c),p=t(f.id,l,h);p.fetch().done(function(e){u.holidayList=e.__collections__[f.id].models,o[c]=u.holidayList,a.resolve(r(o[c],i,s))})}),a.promise())},isHoliday:function(e){var t=_.find(this.holidayList,function(t){return moment(t.get("startTime")).format("YYYYMMDD")==e.format("YYYYMMDD")});return _.isObject(t)}}},m={formatInYYYYMMDD:function(e){return GO.util.formatDatetime(e,null,"YYYY-MM-DD")},now:function(){return GO.util.now()},getYear:function(e){return parseInt(e.format("YYYY"))},getMonth:function(e){return parseInt(e.format("M"))},startOfYear:function(e){return GO.util.now().year(e).startOf("year")},endOfYear:function(e){return GO.util.now().year(e).endOf("year")},startOfMonth:function(e,t){return GO.util.now().year(e).month(t-1).startOf("month")},addMonth:function(e,t){return e.add(t,"months")},subtractMonth:function(e,t){return e.subtract(t,"months")}};return f});