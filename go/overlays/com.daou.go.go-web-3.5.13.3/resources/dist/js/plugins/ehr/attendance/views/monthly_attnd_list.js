(function(){define(["backbone","app","views/pagination","views/pagesize","attendance/collections/monthly_user_records","attendance/views/monthly_attnd_item","hgn!attendance/templates/monthly_attnd_list","hgn!attendance/templates/empty_data","i18n!nls/commons","i18n!attendance/nls/attendance","models/dept_profile","jquery.go-preloader"],function(e,t,n,r,i,s,o,u,a,f,l){var c=e.Collection.extend({url:t.contextRoot+"api/ehr/attnd/groups"}),h=e.View.extend({events:{"click #attndCalBtn":"attndCalBtn","click ul.tab_nav li.daily":"changeTab","click #preMonth":"movePreMonth","click #nextMonth":"moveNextMonth","click #todayMonth":"moveTodayMonth","click .sorting":"sort","click .sorting_desc":"sort","click .sorting_asc":"sort","click .btn_search2":"search","keypress input#keyword":"searchByEnter","change #search_group_filter":"search","change #searchtype":"changeSearchType","click td.month_dep":"popup","click #monthly_download":"download","change #attnd_descendant_dept":"changeDept"},initialize:function(){this.$el.off();var n=t.util.formatDatetime(t.util.toISO8601(t.util.now()),null,"YYYY-MM");this.collection=new i({month:n,deptId:this.options.deptid}),this.isDept=_.isUndefined(this.options.deptid)?!1:!0,this.initProperty="name",this.initDirection="asc",this.groups=new c,this.groups.fetch({async:!1}),this.descendantDept=this.options.descendantDept,this.collection.setSort(this.initProperty,this.initDirection),this.collection.bind("reset",this.resetList,this),this.options.deptid==undefined||this.descendantDept.length==0?(this.dept=new e.Model,this.hasDescendantSelect=!1):(this.dept=l.read(this.options.deptid),this.hasDescendantSelect=!0)},render:function(){var e={"\uc77c\uac04":f["\uc77c\uac04"],"\uc6d4\uac04":f["\uc6d4\uac04"],"\ubd80\uc11c\uc6d0":a["\ubd80\uc11c\uc6d0"],"\uc815\uc0c1":f["\uc815\uc0c1"],"\uc9c0\uac01":f["\uc9c0\uac01"],"\uc218\uc815":f["\uc218\uc815"],"\ubaa9\ub85d \ub2e4\uc6b4\ub85c\ub4dc":f["\ubaa9\ub85d \ub2e4\uc6b4\ub85c\ub4dc"],"\ubd80\uc11c\uba85":a["\ubd80\uc11c\uba85"],"\uadf8\ub8f9":f["\uadf8\ub8f9"],"\uc120\ud0dd":a["\uc120\ud0dd"],"\uc9c0\uac01":f["\uc9c0\uac01"],"\uc624\ub298":a["\uc624\ub298"],"\uc774\uc804":a["\uc774\uc804"],"\ub2e4\uc74c":a["\ub2e4\uc74c"],"\ud558\uc704\ubd80\uc11c\uc120\ud0dd":a["\ud558\uc704 \ubd80\uc11c \uc120\ud0dd"]},n=this.collection.getMonth();this.$el.html(o({lang:e,data:{logMonth:n,days:this.getDays(n),groups:this.groups.toJSON()},isDept:this.isDept,descendantDept:this.descendantDept.toJSON(),hasDescendantSelect:this.hasDescendantSelect,dept:this.dept.toJSON()}));var r=this;return this.collection.fetch({statusCode:{403:function(){t.util.error("403")},404:function(){t.util.error("404",{msgCode:"400-common"})},500:function(){t.util.error("500")}},success:function(){r.setInitSort(r.initProperty,r.initDirection),r.renderPageSize()},beforeSend:function(){r.preloader=$.goPreloader()}}),this.initDatePicker(),$("body").trigger("ehr.attndListRender"),this},initDatePicker:function(){var e=this,n=e.$el.find("#list_cal");$.datepicker.setDefaults($.datepicker.regional[t.config("locale")]),n.datepicker({dateFormat:"yy-mm",changeMonth:!0,changeYear:!0,yearSuffix:"",onSelect:function(t){e.collection.setMonth(t),e.render()}})},changeDept:function(e){var t=$(e.currentTarget),n=t.val();this.collection.setDept(n),this.preloader=$.goPreloader(),this.collection.fetch()},changeTab:function(){this.trigger("click:dailytab")},attndCalBtn:function(){$("#list_cal").trigger("focus")},moveTodayMonth:function(){var e=moment().format("YYYY-MM");this.collection.setMonth(e),this.render()},movePreMonth:function(){this.changeMonth(-1)},moveNextMonth:function(){this.changeMonth(1)},changeMonth:function(e){var t=this.collection.getMonth(),n=moment(t).add(e,"months").format("YYYY-MM");this.collection.setMonth(n),this.render()},getDays:function(e){var e=moment(e),t=moment(e.format("YYYY-MM-DD")).startOf("month"),n=moment(e.format("YYYY-MM-DD")).endOf("month"),r=[],i=this.getHolidays(e.format("YYYY"));while(t<n){var s=!1;for(var o in i){var u=new moment(i[o].startTime);u.format("MM-DD")==t.format("MM-DD")&&(s=!0)}var o=t.format("YYYY-MM-DD");r.push({day:t.format("DD"),isSaturday:moment(o).day()===6,isSunday:moment(o).day()===0,isHoliday:s}),t.add(1,"days")}return r},resetList:function(e){var t=(new Date).getTime();this.preloader&&this.preloader.release(),window.scrollTo(0,0);if(e.length==0){$("#monthly_records").html(u({lang:{empty_data:f["\uadfc\ud0dc\ud604\ud669\uc774 \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."]},colspanCount:this.$el.find("th").length+1}));return}var n=this.$el.find("#monthly_records");n.html(""),e.each(function(e){var t=new s({model:e});n.append(t.render().$el)});var r=(new Date).getTime(),i=(r-t)/1e3;console.info("=========================="),console.info(i+" \ucd08"),console.info("=========================="),this.renderPages()},setInitSort:function(e,t){var n=null,r=this.$el.find("th.department");r.each(function(){$(this).attr("sort-id")==e&&(n=$(this).attr("id")),$(this).hasClass("sorting_disabled")||($(this).removeClass("sorting").addClass("sorting"),$(this).removeClass("sorting_desc").addClass("sorting"),$(this).removeClass("sorting_asc").addClass("sorting"))}),$("#"+n).removeClass("sorting").addClass("sorting_"+t),$("#keyword").val(this.ckeyword)},sort:function(e){var t="#"+$(e.currentTarget).attr("id"),n=$(t).attr("sort-id"),r="desc",i="",s="";$(t).hasClass("sorting")&&(i="sorting",s="sorting_desc"),$(t).hasClass("sorting_desc")&&(i="sorting_desc",s="sorting_asc",r="asc"),$(t).hasClass("sorting_asc")&&(i="sorting_asc",s="sorting_desc"),$(t).removeClass(i).addClass(s);var o=this.$el.find("th.department");o.each(function(){!$(this).hasClass("sorting_disabled")&&"#"+$(this).attr("id")!=t&&($(this).removeClass("sorting").addClass("sorting"),$(this).removeClass("sorting_desc").addClass("sorting"),$(this).removeClass("sorting_asc").addClass("sorting"))}),this.collection.setSort(n,r),this.preloader=$.goPreloader(),this.collection.fetch()},renderPages:function(){this.pageView=new n({pageInfo:this.collection.pageInfo()}),this.pageView.bind("paging",this.selectPage,this),this.$el.find("div.page_navivation").html(this.pageView.render().el)},renderPageSize:function(){this.pageSizeView=new r({pageSize:this.collection.pageSize}),this.pageSizeView.render(),this.pageSizeView.bind("changePageSize",this.selectPageSize,this)},selectPageSize:function(e){this.collection.setPageSize(e),this.preloader=$.goPreloader(),this.collection.fetch()},selectPage:function(e){this.collection.setPageNo(e),this.preloader=$.goPreloader(),this.collection.fetch()},search:function(){var e=$("#searchtype").val(),n="";if(e=="group")n=this.$el.find("#search_group_filter").val();else{n=$.trim($("#keyword").val()),$("input#keyword").attr("placeholder")===this.$el.find("input#keyword").val()&&(n="");if(!n)return $.goMessage(a["\uac80\uc0c9\uc5b4\ub97c \uc785\ub825\ud558\uc138\uc694."]),$("#keyword").focus(),!1;if(!$.goValidation.isCheckLength(2,64,n))return $.goMessage(t.i18n(a["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"2",arg2:"64"})),$("#keyword").focus(),!1}this.collection.setSearch(e,n),this.preloader=$.goPreloader(),this.collection.fetch()},searchByEnter:function(e){if(e.keyCode!=13)return;e&&e.preventDefault(),$(e.currentTarget).focusout().blur(),this.search()},changeSearchType:function(e){var t=$(e.currentTarget);this.$el.find("#keyword").val(""),this.$el.find("#search_group_filter").val("").attr("selected","selected"),t.val()=="group"?(this.$el.find("#search_group_filter").show(),this.$el.find("#keyword_section").hide()):(this.$el.find("#search_group_filter").hide(),this.$el.find("#keyword_section").show())},download:function(){var e=this.collection.getParam();e.offset=99999,e.page=0,window.location.href=t.contextRoot+"api/ehr/attnd/record/month/"+this.collection.getMonth()+"/download?"+$.param(e)},getHolidays:function(e){var n={};return $.ajax({type:"GET",async:!1,dataType:"json",url:t.config("contextRoot")+"api/calendar/event/holiday/"+e,success:function(e){n=e.data}}),n}});return h})})();