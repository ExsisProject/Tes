(function(){define(["backbone","app","hgn!attendance/templates/monthly_attnd_item","i18n!attendance/nls/attendance"],function(e,t,n,r){function s(e,n){var r=[],i=["<td class='status'>"+n["\ucd9c\uadfc"]+"</td>"],s=["<td class='status'>"+n["\ud1f4\uadfc"]+"</td>"],o=["<td class='status'>"+n["\uadfc\ubb34"]+"</td>"],u=["<td class='status'>"+n["\uc0c1\ud0dc"]+"</td>"],a=e.getRecords(),f=t.util.customDate(moment(),"YYYY-MM-DD");return a.each(function(e){var t=e.isLate()?"late":"",r=e.isClockInTimeEdited()?"modify":"",a=e.isClockOutTimeEdited()?"modify":"",f=e.isToday()?"today":"";i.push("<td class='go "+f+" "+t+" "+r+"'>"+e.getUserClockInTimeHHMM()+"</td>"),s.push("<td class='leave "+f+" "+a+"'>"+e.getUserClockOutTimeHHMM()+"</td>"),o.push("<td class='time "+f+"'>"+e.getUserWorkingTimeHHMM()+"</td>"),u.push("<td class='detail "+f+"'>"),_.each(e.getStatuses(),function(t){var r=e.convertStatausTime(t);t.companyStatus.type=="allNight"?u.push("<span class='tool_tip' title='"+r+"'>"+n["\ucca0\uc57c"]+"</span>"):u.push("<span class='tool_tip' title='"+r+"'>"+t.companyStatus.name+"</span>")}),u.push("</td>")}),r.push("<tr class='go clock_in_time'>"),r.push(i.join("")),r.push("</tr>"),r.push("<tr class='clock_out_time'>"),r.push(s.join("")),r.push("</tr>"),r.push("<tr class='working_time'>"),r.push(o.join("")),r.push("</tr>"),r.push("<tr class='last record_stataus'>"),r.push(u.join("")),r.push("</tr>"),r.join("")}var i=e.View.extend({className:"month_line",events:{"click a.detail":"showDetail","click a.popup":"showPopup"},initialize:function(){this.model=this.options.model},render:function(){var e={"\ucd9c\uadfc":r["\ucd9c\uadfc"],"\ud1f4\uadfc":r["\ud1f4\uadfc"],"\uadfc\ubb34":r["\uadfc\ubb34"],"\uc0c1\ud0dc":r["\uc0c1\ud0dc"],"\uc9c0\uac01":r["\uc9c0\uac01"],"\ucca0\uc57c":r["\ucca0\uc57c"]},t=this.model.getLateCount(),i=n({lang:e,deptNames:this.model.getDeptNames(),userId:this.model.getUserId(),userName:this.model.getUserName(),lateCount:this.model.getLateCount(),hasLateCount:t==0?!1:!0});this.$el.html(i);var o=s(this.model,e);return this.$el.find("table.record_data tbody").html(o),this},showDetail:function(e){var n=$(e.currentTarget),r=n.closest("div").attr("data-id");t.router.navigate("ehr/attendance/"+r+"/my?",{trigger:!0})},showPopup:function(e){var n=$(e.currentTarget),r=n.closest("div").attr("data-id"),i=t.router.getSearch(),s=window.location.protocol+"//"+window.location.host+t.contextRoot+"app/ehr/attendance/"+r+"/my/popup";window.open(s,"","location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes")}});return i})})();