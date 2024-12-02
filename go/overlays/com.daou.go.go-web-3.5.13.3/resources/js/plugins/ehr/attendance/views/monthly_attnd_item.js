(function() {
    define([
    "backbone", 
    "app",
    "hgn!attendance/templates/monthly_attnd_item",
    "i18n!attendance/nls/attendance"
    ],

    function(
    Backbone,
    GO,
    Tmpl,
    attndLang
    ) {

        var MonthlyAttndItem = Backbone.View.extend({
            className : "month_line",
            events : {
                "click a.detail" : "showDetail",
                "click a.popup" : "showPopup"
            },

            initialize : function() {
                this.model = this.options.model;
            },

            render : function() {
                var lang = {
                    "출근" : attndLang["출근"],
                    "퇴근" : attndLang["퇴근"],
                    "근무" : attndLang["근무"],
                    "상태" : attndLang["상태"],
                    "지각" : attndLang["지각"],
                    "철야" : attndLang["철야"]
                }
                
                var lateCount = this.model.getLateCount();
                var layout = Tmpl({
                    lang : lang,
                    deptNames : this.model.getDeptNames(),
                    userId : this.model.getUserId(),
                    userName : this.model.getUserName(),
                    lateCount : this.model.getLateCount(),
                    hasLateCount : lateCount == 0 ? false : true
                });
                
                this.$el.html(layout);
                
                var recordInfo = makeRecordInfo(this.model, lang);
                this.$el.find("table.record_data tbody").html(recordInfo);
                
                return this;
            },
            
            showDetail : function(e){
                var currentEl = $(e.currentTarget);
                var userId = currentEl.closest("div").attr("data-id");
                //var params = GO.router.getSearch();
                
                GO.router.navigate("ehr/attendance/" + userId + "/my?", {trigger: true}); // + $.param(params), {trigger: true});
            },
            showPopup : function(e){
                var currentEl = $(e.currentTarget);
                var userId = currentEl.closest("div").attr("data-id");
                var params = GO.router.getSearch();
                var url = window.location.protocol + "//" +window.location.host + GO.contextRoot + "app/ehr/attendance/" + userId + "/my/popup";
                window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
            }
        });

        function makeRecordInfo(models, lang) {
            var html = [];
            var clockInCell = ["<td class='status'>" + lang["출근"] + "</td>"];
            var clockOutCell = ["<td class='status'>"+ lang["퇴근"] +"</td>"];
            var workingCell = ["<td class='status'>" + lang["근무"] +"</td>"];
            var statusCell = ["<td class='status'>" + lang["상태"]+ "</td>"];
            var recordCollection = models.getRecords();
            var today = GO.util.customDate(moment(), "YYYY-MM-DD")
            
            recordCollection.each(function(model){
                var lateCss = model.isLate() ? "late" : "";
                var clockInEditedCss = model.isClockInTimeEdited() ? "modify" : "";
                var clockOutEditedCss = model.isClockOutTimeEdited() ? "modify" : "";
                var todayCss = model.isToday() ? "today" : "";
                
                clockInCell.push("<td class='go "+ todayCss +" " + lateCss +" " +clockInEditedCss +"'>" + model.getUserClockInTimeHHMM() + "</td>");
                clockOutCell.push("<td class='leave "+ todayCss +" "+clockOutEditedCss+"'>" + model.getUserClockOutTimeHHMM() + "</td>");
                workingCell.push("<td class='time "+ todayCss +"'>" + model.getUserWorkingTimeHHMM() + "</td>");
                statusCell.push("<td class='detail "+ todayCss +"'>");
                _.each(model.getStatuses(), function(status){
                    var title = model.convertStatausTime(status);
                    if(status.companyStatus.type == 'allNight'){
                        statusCell.push("<span class='tool_tip' title='"+title+"'>" + lang["철야"] + "</span>")    
                    }else{
                        statusCell.push("<span class='tool_tip' title='"+title+"'>" + status.companyStatus.name + "</span>")    
                    }

                    
                });
                statusCell.push("</td>");
            });
            
            html.push("<tr class='go clock_in_time'>");
                html.push(clockInCell.join(""));
            html.push("</tr>")
            html.push("<tr class='clock_out_time'>");
                html.push(clockOutCell.join(""));
            html.push("</tr>");
            html.push("<tr class='working_time'>");
                html.push(workingCell.join(""));
            html.push("</tr>");
            html.push("<tr class='last record_stataus'>");
                html.push(statusCell.join(""));
            html.push("</tr>");
            
            return html.join("");
        }

        return MonthlyAttndItem;

    });

})();