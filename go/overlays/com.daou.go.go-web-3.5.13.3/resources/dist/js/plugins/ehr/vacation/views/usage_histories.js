define(function(require){var e=require("backbone"),t=require("app"),n=require("hgn!vacation/templates/usage_histories"),r=require("i18n!vacation/nls/vacation"),i=require("i18n!nls/commons"),s=require("i18n!admin/nls/admin"),o=require("vacation/views/title"),u=require("models/dept_profile");require("jquery.go-grid");var a={"\uc774\ub984":i["\uc774\ub984"],"\ubd80\uc11c\uba85":i["\ubd80\uc11c\uba85"],"\uae30\uac04":i["\uae30\uac04"],"\uc0ac\uc6a9\uc77c\uc218":r["\uc0ac\uc6a9\uc77c\uc218"],"\ubd84\ub958":r["\ubd84\ub958"],"\uc5f0\ucc28 \ub370\uc774\ud130 \uc5c6\uc74c":r["\uc5f0\ucc28 \ub370\uc774\ud130 \uc5c6\uc74c"],"\ubaa9\ub85d \ub2e4\uc6b4\ub85c\ub4dc":i["\ubaa9\ub85d \ub2e4\uc6b4\ub85c\ub4dc"],"\uc804\uc0ac \uc5f0\ucc28\uc0ac\uc6a9\ub0b4\uc5ed":r["\uc804\uc0ac \uc5f0\ucc28\uc0ac\uc6a9\ub0b4\uc5ed"],"\ubd80\uc11c \uc5f0\ucc28\uc0ac\uc6a9\ub0b4\uc5ed":r["\ubd80\uc11c \uc5f0\ucc28\uc0ac\uc6a9\ub0b4\uc5ed"],"\ucd08\uae30\ud654":s["\ucd08\uae30\ud654"],"\uac80\uc0c9 \uc870\uac74":i["\uac80\uc0c9 \uc870\uac74"],"\uc870\uac74\ubcc4 \uc0c1\uc138\uac80\uc0c9":r["\uc870\uac74\ubcc4 \uc0c1\uc138\uac80\uc0c9"]},f=e.Collection.extend({initialize:function(e){this.deptId=e.deptId},url:function(){return t.contextRoot+"api/department/descendant/"+this.deptId}}),l=e.View.extend({events:{"click #preDate":"preDate","click #nextDate":"nextDate","click #searchDate":"showCalendar","keyup #userName, #deptName":"enterSearch","click #searchBtn":"clickSearch","change #descendant_select":"changeDept","click #xlsxDownBtn":"xlsxDownload","click #searchReset":"reset"},initialize:function(){this.deptId=this.options.deptId,this.$el.off(),this.isCompany=!1,this.deptId=="company"?(this.isCompany=!0,this.descendantDept=new e.Collection,this.dept=new e.Model,this.deptId=null):(this.hasDescendantSelect=!0,this.descendantDept=new f({deptId:this.deptId}),this.descendantDept.fetch({async:!1}),this.dept=u.read(this.deptId))},render:function(){var e=t.util.toMoment(),i=t.util.shortDateMonth(e),s=t.util.calDate(i,"months",-1),u=t.util.calDate(i,"months",1);this.$el.html(n({lang:a,searchDate:i,displaySearchDate:moment(i).format("YYYY.MM"),preDate:t.util.customDate(s,"YYYY-MM"),nextDate:t.util.customDate(u,"YYYY-MM"),descendantDept:this.descendantDept.toJSON(),hasDescendantSelect:this.hasDescendantSelect,dept:this.dept.toJSON(),isCompany:this.isCompany}));var f=r["\ubd80\uc11c \uc5f0\ucc28 \uc0ac\uc6a9\ub0b4\uc5ed"];return this.isCompany&&(f=r["\uc804\uc0ac \uc5f0\ucc28 \uc0ac\uc6a9\ub0b4\uc5ed"]),this.$el.find("header.content_top").html((new o).render(f).el),this.renderList(),this.initDatePicker(),this.initSearchDatePicker(),this},renderList:function(){var e=t.contextRoot+"api/ehr/vacation/histories",n=this;this.list=$.goGrid({el:this.$el.find("#vacation_list"),method:"GET",destroy:!0,url:e,params:this.getParam(),emptyMessage:"<p class='data_null'> <span class='ic_data_type ic_no_data'></span><span class='txt'>"+a["\uc5f0\ucc28 \ub370\uc774\ud130 \uc5c6\uc74c"]+"</span>"+"</p>",checkbox:!0,defaultSorting:[[2,"desc"]],columns:[{mData:"userName",sWidth:"130px",sClass:"",bSortable:!1,fnRender:function(e){var t=e.aData;return t.userName}},{mData:"deptName",sWidth:"130px",sClass:"",bSortable:!1},{mData:"startDate",sWidth:"130px",sClass:"",bSortable:!1,fnRender:function(e){var t=e.aData;return t.startDate+" ~ "+t.endDate}},{mData:"usedPoint",sWidth:"130px",sClass:"",bSortable:!1},{mData:"title",sWidth:"130px",sClass:"",bSortable:!1}],fnDrawCallback:function(e,t,r){$(window).scrollTop(0);var i=$($("#table_area div.tool_bar")[0]);i.find("div.custom_header").hide(),n.isCompany?i.prepend($("#excel_download_area").show()):i.append($("#descendant_area").show()),i.append($("#dateBtns").show()),$("div.custom_bottom").css({height:"1px"}),$(".odd").css({cursor:"default"}),$(".even").css({cursor:"default"})}})},reset:function(){var e=this.getMonthOfStartAndEnd(moment());this.$el.find("#searchStartDate").val(e.startDate),this.$el.find("#searchEndDate").val(e.endDate),this.$el.find("#userName").val(""),this.$el.find("#deptName").val("")},xlsxDownload:function(){var e=t.contextRoot+"api/ehr/vacation/histories/download",n={offset:9999999,page:0,property:"startDate",direction:"desc",startDate:this.$el.find("#searchStartDate").val(),endDate:this.$el.find("#searchEndDate").val(),userName:this.$el.find("#userName").val(),deptName:this.$el.find("#deptName").val()};window.location.href=e+"?"+$.param(n)},enterSearch:function(e){if(e.keyCode!="13")return;this.search()},clickSearch:function(){this.search()},search:function(){var e=this.$el.find("#searchStartDate").val(),t=this.$el.find("#searchEndDate").val(),n=this.$el.find("#userName").val(),r=this.$el.find("#deptName").val();this.reloadList(e,t,n,r)},getParam:function(){var e=this.isCompany?moment():this.$el.find("#searchDate").data("date"),t={};return t.deptId=this.deptId,$.extend(t,this.getMonthOfStartAndEnd(e)),t},getMonthOfStartAndEnd:function(e){var n=t.util.toMoment(e);return{startDate:t.util.customDate(n.startOf("months"),"YYYY-MM-DD"),endDate:t.util.customDate(n.endOf("months"),"YYYY-MM-DD")}},preDate:function(e){var t=$(e.currentTarget);this.changeMonth(t.attr("data-date"))},nextDate:function(e){var t=$(e.currentTarget);this.changeMonth(t.attr("data-date"))},changeDept:function(e){this.deptId=$(e.currentTarget).val();var t=this.getMonthOfStartAndEnd(this.$el.find("#searchDate").attr("data-date"));this.reloadList(t.startDate,t.endDate)},reloadList:function(e,t,n,r){this.list.tables.customParams={userName:n,deptName:r,startDate:e,endDate:t,deptId:this.deptId},this.list.tables.fnClearTable()},showCalendar:function(){this.$el.find("#calBtn").focus()},initDatePicker:function(){var e=this.$el.find("#calBtn");$.datepicker.setDefaults($.datepicker.regional[t.config("locale")]),e.datepicker({dateFormat:"yy-mm",changeMonth:!0,changeYear:!0,yearSuffix:"",onSelect:$.proxy(function(e){this.changeMonth(e+"")},this)})},changeMonth:function(e){$("#preDate").attr("data-date",t.util.formatDatetime(t.util.calDate(e,"months",-1),null,"YYYY-MM")),$("#searchDate").attr("data-date",t.util.formatDatetime(e,null,"YYYY-MM")),$("#searchDate").text(t.util.formatDatetime(e,null,"YYYY.MM")),$("#nextDate").attr("data-date",t.util.formatDatetime(t.util.calDate(e,"months",1),null,"YYYY-MM"));var n=t.util.toMoment(e),r=t.util.customDate(n.startOf("months"),"YYYY-MM-DD"),i=t.util.customDate(n.endOf("months"),"YYYY-MM-DD");this.reloadList(r,i)},initSearchDatePicker:function(){var e=this.$el.find("#searchStartDate"),n=t.util.now(),r=n.startOf("months").format("YYYY-MM-DD"),i=n.endOf("months").format("YYYY-MM-DD");e.val(r),$.datepicker.setDefaults($.datepicker.regional[t.config("locale")]),e.datepicker({dateFormat:"yy-mm-dd",changeMonth:!0,changeYear:!0,yearSuffix:"",onSelect:function(e){s.datepicker("option","minDate",e)}});var s=this.$el.find("#searchEndDate");s.val(i),s.datepicker({dateFormat:"yy-mm-dd",changeMonth:!0,changeYear:!0,yearSuffix:"",minDate:r})}});return l});