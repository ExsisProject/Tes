;(function() {
    define([
            "app",
            "report/collections/report_todos",
            "views/default_card",
            "i18n!nls/commons",
            "i18n!report/nls/report",
            "i18n!nls/user",
            "GO.util"
            ], 
    function(
            App,
            ReportTodos,
            DefaultCardView,
            CommonLang,
            ReportLang,
            UserLang
    ) {
        
        var instance = null;
        
        var lang = {
            complete : ReportLang["보고자"],
            incomplete : ReportLang["미보고자"],
            department : ReportLang["부서"],
            report_title : ReportLang["보고현황"],
            write_report : ReportLang["보고하기"],
            empty_data : ReportLang["작성할 보고가 없습니다."]
        };
        
        var ReportTodoHomeView = Backbone.View.extend({
            el : '#todo_list',
            listEl : null,
            manage : false,
            initialize: function() {
                this.$el.off();
            },
            
            bindEvent: function() {
            },
            
            unbindEvent: function() {
                this.$el.off();
            },
            
            render : function() {
                var self = this;
                
                ReportTodos
                  .fetch({
                      "success" : function(data){
                          self._renderTodo.call(self, data);
                      }
                   })
                  .done()
                  .always(function(){

                  });
                
            },
            _renderTodo : function(collections){
                var cardTpls = [],
                    self = this,
                    template = "";
                
                if(collections.models.length != 0){
                    $.each(collections.models, function(index, model){
                        var sessionUser = GO.session(),
                            reportId = model.findReporterByUserId(sessionUser.id, "undones").user.reportId,
                            year = model.get("closedAt").substring(0, 4), 
                            subjectTitle = _.escape(model.get("folder").name),
                            subjectUrl = GO.contextRoot+ "app/report/series/" + model.get("id"),
                            contentParam = [{
                                                "label" : lang.department,
                                                "data" :  model.get("department").name
                                            },{
                                                "label" : lang.report_title,
                                                "data" :  GO.i18n(ReportLang['보고자 {{arg1}}명'], {"arg1": model.getCompleteCount()}) + " (" + GO.i18n(ReportLang['미보고자 {{arg1}}명'], {"arg1": model.getIncompleteCount()}) +")",
                                                "title" : lang.complete +" : " + model.getCompleteUserName() +"&#13;"+ lang.incomplete + " : " + model.getIncompleteUserName()
                                            }],
                                            
                            cardTpl = (new DefaultCardView).makeTemplate({
                            "header" : "",
                            "subject" : "<a href='" + subjectUrl +"'><time class='year'>"+year+"</time>" +
                                              "<time class='date'>"+GO.util.customDate(model.get("closedAt"), "MM/DD(ddd)")+"</time>" +
                                              "<p class='folder_type' title='"+subjectTitle+"'>"+
                                                  subjectTitle+"<span class='times'>(" + model.getSeriesStr() + ")</span>" + 
                                              "</p> " +
                                        "</a>",
                            "customTag" : function(){
                                if(GO.util.isSameDate(model.get("closedAt"), model.get("currentDate"))){
                                    return "<span class='btn_custom'>" + ReportLang["오늘 마감"] + "</span>";
                                }else{
                                    return "";
                                }
                            },
                            "content" : self.makeContent(contentParam),
                            "buttons" : [{
                                "label" : lang.write_report,
                                "callback" : function(){
                                    App.router.navigate("report/series/" + model.get("id") + "/report/"+ reportId, {trigger: true});
                                }
                            }]
                        });
                        
                        
                        
                        cardTpls.push(cardTpl);
                    });
                    template= cardTpls.join("");
                    self.$el.append(template);
                }else{
                    template = "<p class='desc'>"+ lang.empty_data +"</p>";
                    self.$el.replaceWith(template);
                }
            },
            makeContent : function(options){
                var tmp = [];
                tmp.push("<table class='form_s'>");
                tmp.push("<tbody>");
                $.each(options,function(index, rowData){
                    var label = rowData.label || "",
                        title = rowData.title || "",
                        data = rowData.data || "";
                    
                    tmp.push("<tr>");
                    tmp.push("<th>"+label+"</th>");
                    tmp.push("<td title='"+data+"'>"+data+"</td>");
                    tmp.push("</tr>");
                });
                tmp.push("</tbody>");
                tmp.push("</table>")
                return tmp.join("");
            }
        });
        
        return {
            render: function(groupId, type) {
                instance = new ReportTodoHomeView();
                return instance.render();              
            }
        };
    });
}).call(this);