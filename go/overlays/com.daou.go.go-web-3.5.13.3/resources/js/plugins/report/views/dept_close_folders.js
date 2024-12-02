(function() {
    
    define([
        "jquery",
        "underscore", 
        "backbone", 
        "app",
        "i18n!nls/commons",
        "i18n!report/nls/report",
        "models/dept_profile",
        "report/views/report_title",
        "hgn!report/templates/dept_close_folders",
        "GO.util",
        "jquery.go-grid",
        "jquery.go-popup",
        "jquery.go-preloader"
    ], 
    
    function(
        $, 
        _, 
        Backbone, 
        GO, 
        CommonLang,
        ReportLang,
        DeptCardModel,
        ReportTitleView,
        DeptClosedFoldersTmpl
    ) {
        
        var lang = {
            remove : CommonLang["삭제"],
            change_status_normal : ReportLang["정상 상태로 변경"],
            report_term : ReportLang["보고 기간"],
            report_name : ReportLang["보고서 제목"],
            empty_data : ReportLang["중지된 보고서가 없습니다."],
            title : ReportLang["중지된 보고서 관리"],
            remove_report : ReportLang["보고서 삭제"],
            select_alert : ReportLang["선택된 보고서가 없습니다."],
            remove_desc : ReportLang["선택한 보고서를 삭제 하시겠습니까?"],
            remove_report : ReportLang["보고서 삭제"],
            normal_desc : ReportLang["선택한 보고서의 상태를 '정상'으로 변경합니다.변경 하시겠습니까?"],
            department_name : CommonLang["부서명"],
            remove_success : CommonLang["삭제되었습니다."]
        };
                      
        var DeptCloseFoldersView = Backbone.View.extend({
            el : "#content",
            
            events: {
                "click #controlButtons a.remove" : "remove",
                "click #controlButtons a.active" : "changeActive",
                "click #checkAll" : "toggleCheckbox"
            }, 
            
            initialize: function(options) {
            	this.options = options || {};
                this.$el.off();
                $("#side").trigger("set:leftMenu", "closed_folder");
            }, 
            
            render: function() {
                var self = this;
                
                this.$el.html(DeptClosedFoldersTmpl({
                    lang : lang
                }));
                
                this.dataTable  = $.goGrid({
                    el : "#folders_table",
                    method : 'GET',
                    url : GO.contextRoot + "api/report/folder/status/inactive",
                    emptyMessage : "<p class='data_null'> " +
                        "<span class='ic_data_type ic_no_data'></span>" +
                        "<span class='txt'>"+ lang.empty_data +"</span>" +
                   "</p>",
                    defaultSorting : [],
                    sDomUse : true,
                    params : {
						property : 'closedAt',
						direction : 'asc'
					},
                    columns : [
                               { mData: null, sWidth : "40px", bSortable: false, fnRender : function(obj) {
                                   var data = obj.aData,
                                       isManager = data.actions.managable;
                                   
                                   if(isManager){
                                       return "<input type='checkbox' value='"+ data.id +"' >";
                                   }else{
                                       return "<input type='checkbox' disabled='true'>";
                                   }
                               }},
                               { mData : null, bSortable: false, sClass : "period", sWidth: '180px', fnRender: function(obj){
                                   var data = obj.aData;
                                   return data.department.name; 
                               }},
                               { mData : "createdAt", bSortable: false, sClass : "period", sWidth: '220px', fnRender: function(obj){
                                   var data = obj.aData;
                                   return GO.util.customDate(data.createdAt, "YYYY-MM-DD") + " ~ " + GO.util.customDate(data.closedAt, "YYYY-MM-DD"); 
                               }},
                               { mData: "name", bSortable: false, sClass : "subject", sWidth : '1000px', fnRender : function(obj){
                                   var data = obj.aData;
                                   return "<span data-id='"+data.id+"'>" + data.name + "</span>";
                               }}
                    ],
                    fnDrawCallback : function(obj) {
                        self.$el.find('.tool_bar .custom_header').append(self.$el.find('#controlButtons').show());
                        
                        self.$el.find('tr>td.subject span').css('cursor', 'pointer').click(function(e) {
                            var $el = $(e.currentTarget);
                                url = "report/folder/" + $el.attr("data-id") + "/reports";
                                
                            GO.router.navigate(url , {trigger: true});
                        });
                    }
                }).tables;
                
                ReportTitleView.create({
                    text : lang.title
                });
                
                return this;
            },
            toggleCheckbox : function(e){
                if($(e.currentTarget).is(':checked')){
                    this.$el.find("#folders_table td input:checkbox").not(":disabled").attr("checked", true);
                }else{
                    this.$el.find("#folders_table td input:checkbox").attr("checked", false);
                }
            },
            getCheckedIds : function(){
                var ids = [];
                
                $.each($("#folders_table td input:checkbox:checked"), function(index, el){
                    ids.push($(el).val());
                });
                
                return ids;
            },
            remove : function(){
                var self = this;
                
                var form = this.$el.find("#folders_table"),
                folderEl = form.find('tbody input[type="checkbox"]:checked');
				if(folderEl.size() == 0){
					$.goMessage(lang.select_alert);
					return;
				}

                var deptId = this.options.deptId;
                $.goConfirm(
                    lang.remove_report, 
                    lang.remove_desc, 
                    function() {
                        var url = GO.contextRoot + "api/report/folder", options = {id : deptId, ids : self.getCheckedIds()};
                        self.preloader = $.goPreloader();
                        self.preloader.render();

                        $.go(url,JSON.stringify(options), {
                            async : true,
                            qryType : 'DELETE',
                            contentType : 'application/json',
                            responseFn : function(response) {
                                self.preloader.release();
                                $.goMessage(lang.remove_success);
                                self.reload.call(self);
                            },
                            error : function(error){
                                self.preloader.release();
                                $.goAlert(CommonLang["삭제에 실패하였습니다."]);
                            }
                        });
                });
            },
            changeActive : function(){
                var self = this,
                    form = this.$el.find("#folders_table"),
                    folderEl = form.find('tbody input[type="checkbox"]:checked');
                
                if(folderEl.size() == 0){
                    $.goMessage(lang.select_alert);
                    return;
                }
                
                $.goConfirm(
                    lang.change_status_normal, 
                    lang.normal_desc, 
                    function() {
                        var url = GO.contextRoot + "api/report/folder/status/active",
                            options = {
                                id : self.options.deptId,
                                ids : self.getCheckedIds()
                            };
                        
                        $.go(url,JSON.stringify(options), {
                            async : false,
                            qryType : 'PUT',
                            contentType : 'application/json',
                            responseFn : function(response) {
                                if(response.code === "200"){
                                    self.reload.call(self);
                                } else{
                                    
                                }
                            },
                            error : function(error){
                                $.goAlert(type.error);
                            }
                        });
                });
            },
            reload : function(){
                this.dataTable.reload();
            },
            release: function() {
                this.childView.release();
                
                this.$el.off();
                this.$el.empty();
                this.remove();
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
        
        return DeptCloseFoldersView;
        
    });
    
})();