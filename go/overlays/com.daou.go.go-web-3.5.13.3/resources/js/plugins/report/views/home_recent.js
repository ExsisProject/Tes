;(function() {
    define([
            "app",
            "report/collections/report_recent_list",
            "hgn!report/templates/home_recent",
            "i18n!nls/commons",
            "i18n!report/nls/report",
            "i18n!nls/user",
            "jquery.go-grid"
            ], 
    function(
            App,
            ReportRecentList,
            ReportRecentHomeTmpl,
            commonLang,
            reportLang,
            userLang
    ) {
        
        var instance = null;
        
        var lang = {
            empty_data : reportLang["최근 생성된 보고서가 없습니다."],
            submittedAt : reportLang["보고일"],
            department : reportLang["부서"],
            report : reportLang["보고서"],
            report_name : reportLang["보고서 제목"],
            reporter : reportLang["보고자"],
            title : commonLang["제목"]
        };
        
        var ReportRecentHome = Backbone.View.extend({
            el : '#recent_list',
            listEl : null,
            manage : false,
            initialize: function() {
                this.$el.off();
            },
            
            bindEvent: function() {
                this.$el.on("click", "#contactAdd", $.proxy(this.contactCreate, this));
            },
            
            unbindEvent: function() {
                this.$el.off();
            },
            
            render : function() {
                var self = this;
                
                
                this.$el.append(self.makeTemplate());
                
                this.seriesReportList = $.goGrid({
                    el : '#recentList',
                    method : 'GET',
                    url : GO.contextRoot + "api/report/done" ,
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>"+ lang.empty_data +"</span>" +
                                   "</p>",
                    defaultSorting : [[ 0, "desc" ]],
                    pageUse : false,
                    sDomUse : false,
                    displayLength : 20,
                    columns : [
                               /*{ mData : "id", sWidth: '100px', bSortable: true, fnRender : function(obj) {
                                   inputIds.push(obj.aData.id);
                                   if(obj.aData.openType == 'behind') behindIds.push(obj.aData.id);
                                   return obj.aData.id;
                               }},*/
                               { mData: "submittedAt", sClass: "date", "sWidth": "180px",bSortable: false, fnRender : function(obj) {
                                   return GO.util.basicDate(obj.aData.submittedAt);
                               }},
                               { mData: "department", sClass: "part", bSortable: false, fnRender : function(obj) {
                                   return obj.aData.department.name;
                               }},
                               { mData: null, sClass: "folder_type",bSortable: false , fnRender : function(obj) {
                                   var data = obj.aData;
                                   
                                   return "<span data-id='"+ data.folder.id +"'> " + _.escape(data.folder.name) + "</span>";
                               }},
                               { mData: null, sClass: "subject",bSortable: false , fnRender : function(obj) {
                                   var report = obj.aData,
                                       subjectTag = [],
                                       sClass = "",
                                       privateTag = "<span class='ic_side ic_private'></span>";
                                   
                                   if(report.actions.readable){
                                       sClass = "detail";
                                   }
                                   
                                   if(report.folder.type == "PERIODIC"){
                                       var seriesStr = GO.util.parseOrdinaryNumber(report.series.series, GO.config("locale"));
                                       subjectTag.push("<span class='"+ sClass +"' data-id = '" + report.id + "' data-series-id='" + report.series.id + "' data-type='"+ report.folder.type+"'> ");
                                       
                                       if(!report.actions.readable){subjectTag.push(privateTag)};
                                       
                                       subjectTag.push(GO.i18n(reportLang["제 {{arg1}}회차"],{arg1 : seriesStr}) + " ");
                                       subjectTag.push(_.escape(report.folder.name));
                                       subjectTag.push("</span>");
                                       return subjectTag.join("");
                                   }else{
                                       subjectTag.push("<span class='"+sClass+"' data-id = '" + report.id + "' data-folder-id='" + report.folder.id + "' data-type='"+ report.folder.type+"'> ");
                                       if(!report.actions.readable){subjectTag.push(privateTag)};
                                       subjectTag.push(_.escape(report.name));
                                       subjectTag.push("</span>")
                                       return  subjectTag.join("");
                                   }
                               }},
                               { mData: "reporter", sClass: "name",bSortable: false , fnRender : function(obj) {
                                   var reporter = obj.aData.reporter;
                                   return reporter.name + " " + reporter.position;
                               }}
                    ],
                    fnDrawCallback : function(obj, oSettings, listParams) {
                        self.$el.find(this.el + ' tr>td:nth-child(3) span').css('cursor', 'pointer').click(function(e) {
                            var $el = $(e.currentTarget);
                                folderId = $el.attr("data-id"),
                                url = "report/folder/" + folderId + "/reports";
                                
                            GO.router.navigate(url, {trigger: true});
                        });
                        
                        self.$el.find(this.el + ' tr>td:nth-child(4) span.detail').css('cursor', 'pointer').click(function(e) {
                            var $el = $(e.currentTarget),
                                id = $el.attr("data-id"),
                                type = $el.attr("data-type"),
                                url = "";
                            
                            if(type == "PERIODIC"){
                                url = "report/series/" + $el.attr("data-series-id") + "/report/" + id;
                            }else{
                                url = "report/folder/"+ $el.attr("data-folder-id") +"/report/" + id;
                            }
                            
                            GO.router.navigate(url, {trigger: true});
                        });
                    }
                });
            },
            makeTemplate : function() {
                return ReportRecentHomeTmpl({
                    lang : lang
                });
            }
        });
        
        return {
            render: function(groupId, type) {
                instance = new ReportRecentHome();
                return instance.render();              
            }
        };
    });
}).call(this);