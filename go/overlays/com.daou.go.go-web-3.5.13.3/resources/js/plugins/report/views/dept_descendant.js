(function() {
    
    define([
        "jquery",
        "underscore", 
        "backbone", 
        "app", 
        "i18n!nls/commons",
        "i18n!report/nls/report",
        
        "hgn!report/templates/dept_descendant",
        "report/views/report_title",
        "collections/dept_descendants_managable",
        "jquery.go-grid",
        "GO.util"
    ], 
    
    function(
        $, 
        _, 
        Backbone, 
        GO, 
        CommonLang,
        ReportLang,
        DeptDescendantTmpl,
        ReportTitleView,
        DeptDescendantCollection
    ) {
        
        var lang = {
           descendant_reports : ReportLang["하위 부서 보고서 조회"],
           descendant_all : ReportLang["하위부서 전체"],
           descendant_reports_empty_msg : ReportLang["하위 부서 보고서가 없습니다."],
           report_config : ReportLang["보고서 설정"],
           normal : ReportLang["정상"],
           close : ReportLang["중지"],
           dept_name : ReportLang["부서명"],
           report_name : ReportLang["보고서 제목"],
           admin : ReportLang["운영자"],
           createAt : ReportLang["개설일"],
           config : ReportLang["설정"],
           empty : CommonLang["없음"]
        }
        
        var DeptDescendant = Backbone.View.extend({
            el : "#content" ,
            
            events: {
                "click #selectStatus li" : "changeTap",
                "change #deptList" : "changeDept",
            }, 
            
            initialize: function() {
                this.$el.off();
                this.descendant = DeptDescendantCollection.fetch();
                $("#side").trigger("set:leftMenu", "descendant_folder");
            }, 
            
            render: function() {
                this.$el.html(DeptDescendantTmpl(
                        {
                            data : this.descendant.toJSON(),
                            lang : lang
                        }));
                
                
                this.renderGrid();
                
                ReportTitleView.create({
                    text : lang.descendant_reports
                });
                
                return this;
            }, 
            reloadGrid : function(key, value){
                this.dataTable.tables.setParam(key,value);
            },
            renderGrid : function(){
                var params = this.getParam(),
                    self = this;
                
                this.dataTable  = $.goGrid({
                    el : "#dept_descendant_table",
                    method : 'GET',
                    url : GO.contextRoot + "api/report/folder/subdept",
                    emptyMessage : "<p class='data_null'> " +
                        "<span class='ic_data_type ic_no_data'></span>" +
                        "<span class='txt'>"+lang.descendant_reports_empty_msg+"</span>" +
                   "</p>",
                    params : $.extend(
                            {}, 
                            self.getParam(), 
                            {
                                "property" : "department", 
                                "direction" : "asc"}
                            ),
                    sDomUse : true,
                    destroy : true,
                    columns : [
                               { mData : "department", bSortable: true, sClass : "part", fnRender: function(obj){
                                   var data = obj.aData;
                                   return data.department.name;
                               }},
                               { mData: "name", bSortable: true, sClass : "subject",fnRender : function(obj){
                                   var data = obj.aData;
                                   return "<span data-id='"+data.id+"'>" + data.name + "</span>";
                               }},
                               { mData: null, bSortable: false, sClass : "name",  fnRender : function(obj){
                                   var admin = obj.aData.admin.nodes,
                                   adminsNames = [];
                                   if(admin.length != 0){
                                       $.each(admin, function(){
                                           adminsNames.push(this.nodeValue + "</br>");
                                       });
                                       return adminsNames.join("");
                                   }else{
                                       return lang.empty;
                                   }
                               }},
                               { mData: "createdAt", bSortable: true, sClass : "date", fnRender : function(obj){
                                   var data = obj.aData;
                                   return GO.util.basicDate3(obj.aData.createdAt);
                               }},
                               { mData: null, bSortable: false, sClass : "setting", fnRender : function(obj){
                                   var data = obj.aData;
                                   return "<a class='btn_bdr' data-id='"+data.id+"'><span class='ic_classic ic_setup' title='"+lang.report_config+"'></span></a>";
                               }}
                    ],
                    fnDrawCallback : function(obj) {
                        self.$el.find('.tool_bar .custom_header').append(self.$el.find('#controlButtons').show());
                        
                        self.$el.find('tr>td:nth-child(2) span').css('cursor', 'pointer').click(function(e) {
                            var $el = $(e.currentTarget);
                            url = "report/folder/" + $el.attr("data-id") + "/reports";
                            
                            GO.router.navigate(url , {trigger: true});
                        });
                        
                        self.$el.find('tr>td:nth-child(5) a').css('cursor', 'pointer').click(function(e) {
                            var $el = $(e.currentTarget);
                                url = "report/folder/" + $el.attr("data-id");
                                
                            GO.router.navigate(url , {trigger: true});
                        });
                    }
                });
            },
            changeDept : function(e){
                var targetEl = $(e.currentTarget);
                this.reloadGrid("deptId", targetEl.val());
            },
            changeTap : function(e){
                var targetEl = $(e.currentTarget);
                
                $.each($(targetEl).siblings(), function(){
                    $(this).removeClass("active");
                });
                
                targetEl.addClass("active");
                this.reloadGrid("status", targetEl.attr("data-value"));
            },
            getParam : function(){
                var params = {
                    status : this.$el.find("#selectStatus li.active").attr("data-value"),
                    deptId : this.$el.find("#deptList :selected").val()
                }
                
                return params;
            },
            
            release: function() {
                
            } 
        }, 
        
        {
            __instance__: null, 
            
            create: function() {
                if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                return this.__instance__;
            } 
        });
        
        function privateFunc(view, param1, param2) {
            
        }
        
        return DeptDescendant;
        
    });
    
})();