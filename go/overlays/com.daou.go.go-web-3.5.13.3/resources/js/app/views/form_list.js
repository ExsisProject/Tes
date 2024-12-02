;(function(){
define(
    [
        "backbone", 
        "app", 
        "jquery",
        "hgn!templates/app_form_list",
        "i18n!nls/commons",
        "i18n!report/nls/report",
        "models/form",
        "views/form_editor",
        "jquery.go-popup",
        "jquery.go-grid"

    ],
    function(
        Backbone,
        GO,
        $,
        AppFormListTmpl,
        CommonLang,
        ReportLang,
        FormModel,
        FormEditorView
    ){
        var tpl = {
                "button" : "<a class='{pClass}' id={targetId} data-role='button'><span class='txt'>{label}</span></a>"
            },
            form_default = {
                editerId : "editArea",
                lang : "ko",
                top : "30%"
            },
            lang = {
                department : ReportLang["부서"],
                report_name : ReportLang["보고서 제목"],
                selection : CommonLang["선택"],
                createdAt : CommonLang["등록일"],
                form_name : ReportLang["양식 제목"],
                search : CommonLang["검색"],
                form_title : ReportLang["양식 불러오기"],
                empty_form : ReportLang["양식이 없습니다."],
                preview : ReportLang["미리보기"],
                dept_form : ReportLang["부서 보고서"],
                company_form : ReportLang["전사 공용 양식"]
        }
        
        var FormListView = Backbone.View.extend({
            el : "#form_popup",
            events : {
                "a.btn_layer_x" : "close"
            },
            initialize: function(options) {
            	this.options = options || {};
            	this.oldContent = this.options.oldContent;
                this.type = "department";
            },
            render : function(){

            },
            close : function(){
                $("#content").trigger("insert:deptForm", [this.oldContent]);
                this.popupEl.remove();
            },
            popupRender : function(){
                this.popupEl = $.goPopup({
                    pclass : "layer_recep_list layer_normal",
                    header : lang.form_title,
                    width : 750,
                    top : form_default.top,
                    id : "form_popup",
                    title : "",
                    modal : true,
                    wrapTpl :  ['<div class="go_department_form_table {pclass}" id="{pid}" data-id="{generateUUID}" data-close="false" style="display:none">' , 
                                '<header><h1>{header}</h1>{headerHtml}<a class="btn_layer_x" data-bypass title="{closeText}"><span class="ic"></span><span class="txt">' ,
                                '</span></a></header>' ,
                                '<div class="content">{pTitle}{message}{contents}</div>{buttonwrap}</div>'],
                    contents : AppFormListTmpl({
                        lang : lang
                    })
                });
                
                this.popupEl.css("height", "600px");
                this.unbindEvent();
                this.bindEvent();
                this.popupEl.reoffset();
                
                return this;
            },
            bindEvent : function(){
                this.popupEl.on("click.popup", "a.btn_layer_x", $.proxy(this.close, this));
                this.popupEl.on("click.popup", "#formSelect input:radio", $.proxy(this.swapFormType, this));
                this.popupEl.on("keydown.popup", "div.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
                this.popupEl.on("click.popup", "div.search_wrap span.btn_search2", $.proxy(this.search, this));
            },
            unbindEvent : function(){
                this.popupEl.off(".popup");
            },
            swapFormType : function(e){
                var targetEl = $(e.currentTarget);
                
                this.type = targetEl.val();
                
                this.popupEl.find("div.search_wrap input").val("");
                
                if(this.type == "department"){
                    this.appFormRender();
                }else{
                    this.companyFormRender();
                }
                
            },
            appFormRender : function(url){
                var self = this;
                
                    this.deptTableId = "#department_form_table";
                
                $("#company_form").hide();
                
                if(this.deptFormList){
                    this.deptFormList.tables.reload();
                }else{
                    this.deptFormList = $.goGrid({
                        el : this.deptTableId,
                        method : 'GET',
                        url : GO.contextRoot + 'api/report/form/department',
                        lengthMenu : [10],
                        dstroy : true,
                        defaultSorting : [[ 0, "asc" ]],
                        params : this.searchParams,
                        emptyMessage : "<p class='data_null'> " +
                                            "<span class='ic_data_type ic_no_data'></span>" +
                                            "<span class='txt'>"+ lang.empty_form +"</span>" +
                                       "</p>",
                        columns : [
                               { mData: "department", sWidth: '100px', sClass: "align_l", bSortable: true, fnRender : function(obj) {
                                   var data = obj.aData;
                                   return data.department.name;
                               }},
                               { mData: "folder", sWidth: '100px', sClass: "align_l", bSortable: true, fnRender : function(obj){
                                   var data = obj.aData;
                                   return data.folder.name;
                               }},
                               { mData: null, sWidth : "100px", sClass: "", bSortable: false , fnRender : function(obj){
                                   var data = obj.aData;
                                   return '<span class="form_preview" data-id="'+ data.id +'"><a class="btn_fn7">' + lang.preview + '</a></span>&nbsp;&nbsp;' +
                                       '<span class="form_select" data-id="'+ data.id +'"><a class="btn_fn11">' +lang.selection+ '</a></span>';
                               }},
                        ],
                        fnDrawCallback : function(obj, oSettings, listParams) {
                            var customHeaderEl = $("#department_form").find("div.tool_bar div.custom_header"),
                                formSelectEl = customHeaderEl.find("#formSelect");
                            
                            if(formSelectEl.length == 0){
                                customHeaderEl.html($("#formSelect").show());
                            }
                            
                            $("#form_popup").find(self.deptTableId + ' tr>td:nth-child(3) span.form_preview').css('cursor', 'pointer').click(function(e) {
                                var $el = $(e.currentTarget),
                                    formModel = new FormModel({url : "/api/report/form"});
                                    formModel.set({id : $el.attr("data-id")});
                                    formModel.fetch({async : false});
                                    self.popupEl.css("z-index", 90);
                                    FormEditorView.preview(formModel.get("content"), formModel.get("department").name);
                                    
                                    $("#formPreview .btn_layer_x").unbind("click") ;
                                    $("#formPreview").find('.btn_layer_x').bind('click.gopop' , function(){ 
                                        self.popupEl.css("z-index", 99);
                                        $("#formPreview").remove();
                                    });
                                    
                                    
                            });
                            
                            $("#form_popup").find(self.deptTableId + ' tr>td:nth-child(3) span.form_select').css('cursor', 'pointer').click(function(e) {
                                
                                var $el = $(e.currentTarget),
                                formModel = new FormModel({url : "/api/report/form"});
                                formModel.set({id : $el.attr("data-id")});
                                formModel.fetch({async : false});
                                
                                $("#content").trigger("insert:deptForm", [formModel.get("content")]);
                                
                                self.popupEl.remove();
                                
                            });
                        }
                    });
                    
                }
                $("#department_form").show();
            },
            companyFormRender : function(){
                var self = this;
                
                    this.companyTableId = "#company_form_table";
                    
                $("#department_form").hide();
                
                if(this.companyFormList){
                    this.companyFormList.tables.reload();
                }else{
                    this.companyFormList = $.goGrid({
                        el : this.companyTableId,
                        method : 'GET',
                        url : GO.contextRoot + "api/report/form/company",
                        lengthMenu : [10],
                        defaultSorting : [[ 1, "asc" ]],
                        dstroy : true,
                        params : this.searchParams,
                        sDomUse : true,
                        emptyMessage : "<p class='data_null'> " +
                                            "<span class='ic_data_type ic_no_data'></span>" +
                                            "<span class='txt'>"+ lang.empty_form +"</span>" +
                                       "</p>",
                        columns : [
                               { mData: "createdAt", sWidth: '100px', sClass: "align_l", bSortable: true, fnRender : function(obj) {
                                   var data = obj.aData;
                                   return GO.util.basicDate3(obj.aData.createdAt);
                               }},
                               { mData: "name", sWidth: '100px', sClass: "align_l", bSortable: true},
                               { mData: null, sWidth : "100px", sClass: "", bSortable: false , fnRender : function(obj){
                                   var data = obj.aData;
                                   return '<span class="form_preview" data-id="'+ data.id +'"><a class="btn_fn7">' + lang.preview + '</a></span>&nbsp;&nbsp;' +
                                       '<span class="form_select" data-id="'+ data.id +'"><a class="btn_fn11">' + lang.selection + '</a></span>';
                               }},
                        ],
                        fnDrawCallback : function(obj, oSettings, listParams) {
                            var customHeaderEl = $("#company_form").find("div.tool_bar div.custom_header"),
                            formSelectEl = customHeaderEl.find("#formSelect");
                        
                            if(formSelectEl.length == 0){
                                customHeaderEl.html($("#formSelect").show());
                            }
                            
                            $("#form_popup").find(self.companyTableId + ' tr>td:nth-child(3) span.form_preview').css('cursor', 'pointer').click(function(e) {
                                var $el = $(e.currentTarget),
                                    formModel = new FormModel({url : "/api/report/form"});
                                    
                                    formModel.set({id : $el.attr("data-id")});
                                    formModel.fetch({async : false});
                                    self.popupEl.css("z-index", 90);
                                    FormEditorView.preview(formModel.get("content"), "");
                                    
                                    $("#formPreview .btn_layer_x").unbind("click") ;
                                    $("#formPreview").find('.btn_layer_x').bind('click.gopop' , function(){ 
                                        self.popupEl.css("z-index", 99);
                                        $("#formPreview").remove();
                                    });
                            });
                            
                            $("#form_popup").find(self.companyTableId + ' tr>td:nth-child(3) span.form_select').css('cursor', 'pointer').click(function(e) {
                                
                                var $el = $(e.currentTarget),
                                formModel = new FormModel({url : "/api/report/form"});
                                formModel.set({id : $el.attr("data-id")});
                                formModel.fetch({async : false});
                                
                                $("#content").trigger("insert:deptForm", [formModel.get("content")]);
                                
                                self.popupEl.remove();
                                
                            });
                        }
                    });
                }
                
                $("#company_form").show();
                
            },
            search : function() {
                var tableId = "",
                    gridTable = "";
                    
                if(this.type == "department"){
                    tableId = "#department_form";
                    gridTable = this.deptFormList.tables;
                }else{
                    tableId = "#company_form";
                    gridTable = this.companyFormList.tables;
                }
                
                var searchForm = $(tableId + ' .table_search input[type="text"]'),
                    keyword = searchForm.val();
                
                if(keyword.length < 2 || keyword.length > 64){
                    $.goMessage(GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."],{arg1 : 2, arg2 : 64}));
                    searchForm.focus();
                    return;
                }
                
                gridTable.search($(tableId + ' .table_search select').val(), keyword, searchForm, function(){
                    if(keyword && $.isFunction(keyword.focus)) {
                        keyword.trigger('focus');
                    }
                    $("body").append("<div id='popOverlay' class='overlay'></div>");
                    return true;
                });
            },
            searchKeyboardEvent : function(e) {
                if(e.keyCode == 13) {
                    this.search();
                }
            }
        });
        
        return FormListView;
    });
})();
    
