(function() {
    define([
        "jquery",
        "underscore", 
        "backbone", 
        "app",

        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        
        "hgn!admin/templates/report_forms",
        "views/form_editor",
        "admin/models/report_company_form",
        'components/form_component_manager/report_form_manager',

        "jquery.go-grid",
        "jquery.go-popup",
        "GO.util"
    ], 
    
    function(
        $, 
        _, 
        Backbone, 
        GO,

        CommonLang,
        AdminLang,

        ReportFormsTmpl,
        FormEditorView,
        ReportCompanyForm,
        FormComponentManager
    ) {
        
        var lang = {
            save : CommonLang["저장"],
            cancel : CommonLang["취소"],
            remove_msg : CommonLang["삭제되었습니다."],
            remove : CommonLang["삭제"],
            created_at : CommonLang["등록일"],
            selection : CommonLang["선택"],
            search : CommonLang["검색"],
            preview : AdminLang["미리보기"],
            form_manage : AdminLang["양식 관리"],
            remove_selection_alert : AdminLang["삭제할 양식을 선택해 주세요."],
            form_remove : AdminLang["공용 양식 삭제"],
            form_remove_alert : AdminLang["선택한 공용 양식을 삭제 하시겠습니까?"],
            new_form_add : AdminLang["새 양식 추가"],
            edit_form : AdminLang["양식 수정"],
            save_form_msg : AdminLang["양식이 추가되었습니다."],
            edit_form_msg : AdminLang["양식이 변경되었습니다."],
            form_copy_alert : AdminLang["사본을 만들 양식을 선택해 주세요."],
            form_copy_msg : AdminLang["양식이 복사 되었습니다."],
            form_empty_msg : AdminLang["공용 양식이 없습니다."],
            new_form : AdminLang["새 양식"],
            copy_form : AdminLang["사본 만들기"],
            form_name : AdminLang["양식 제목"]
        };
        
        var ReportFormsView = Backbone.View.extend({
            el : '#layoutContent',
            events: {
                "click #controlButtons span.remove": "remove",
                "click #controlButtons span.create": "create",
                "click #controlButtons span.copy": "copy",
                "click input:checkbox" : "toggleCheckbox",
                "keydown #reportSearch input" : "searchKeyboardEvent",
                "click #reportSearch span.btn_search" : "search"
            }, 
            
            initialize: function() {
                this.$el.off();
            }, 
            
            render: function() {
                var self = this;
                
                this.$el.html(ReportFormsTmpl({
                    lang : lang
                }));
                
                reportFormGrid = $.goGrid({
                    el : '#reportFormTable',
                    method : 'GET',
                    sDomType : 'admin',
                    checkbox : true,
                    dstroy : true,
                    checkboxData : 'id',
					params : {
						property : 'createdAt',
						direction : 'desc'
					},
                    url : GO.contextRoot + "ad/api/report/form/company" ,
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>"+ lang.form_empty_msg +"</span>" +
                                   "</p>",
                    defaultSorting : [[ 0, "asc" ]],
                    displayLength : GO.session('adminPageBase'),
                    columns : [
                               { mData: "createdAt", sWidth: '250px', sClass: "status", bSortable: false, fnRender : function(obj) {
                                   return GO.util.basicDate3(obj.aData.createdAt);
                               }},
                               { mData: "name", sClass: "title", bSortable: false, fnRender : function(obj) {
                                   var data = obj.aData;
                                   return '<span data-id="'+ data.id +'">'+data.name+'</span>';
                               }},
                               { mData: null, sWidth : "450px", sClass: "status",bSortable: false , fnRender : function(obj) {
                                   var data = obj.aData;
                                   return '<span class="form_preview" data-id="'+ data.id +'"><a class="btn_fn7">'+lang.preview+'</a></span>';
                               }}
                    ],
                    fnDrawCallback : function(obj, oSettings, listParams) {
                        self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                        
                        self.$el.find('tr>td:nth-child(3) span').css('cursor', 'pointer').click(function(e) {
                             var targetEl = $(e.currentTarget),
                                 reportCompanyForm = ReportCompanyForm.get(targetEl.attr("data-id"));
                             
                             self.renderFormEditView(reportCompanyForm.get("content"), reportCompanyForm.get("name"), reportCompanyForm.get("id"));
                        });
                        
                        self.$el.find('tr>td:nth-child(4) span').css('cursor', 'pointer').click(function(e) {
                            var targetEl = $(e.currentTarget),
                            reportCompanyForm = ReportCompanyForm.get(targetEl.attr("data-id"));
                            
                            FormEditorView.preview(reportCompanyForm.get("content"), "");
                        });
                    }
                });
                
                this.reportFormsTable = reportFormGrid.tables;
            }, 
            toggleCheckbox: function(e){
                if($(e.currentTarget).is(':checked')){
                    $(e.currentTarget).attr('checked', true);
                }else{
                    this.$el.find('#checkedAll').attr('checked', false);
                    $(e.currentTarget).attr('checked', false);
                }
            },
            remove : function(){
                var self = this;
                    ids = this.getCheckedIds();
                
                if(ids.length == 0){
                    $.goMessage(lang.remove_selection_alert);
                    return;
                }
                    
                $.goConfirm(
                        lang.form_remove,
                        lang.form_remove_alert,
                        function() {
                                var url = GO.contextRoot + "ad/api/report/form";

                                $.go(url,JSON.stringify({ids : ids}), {
                                    qryType : 'DELETE',
                                    contentType : 'application/json',
                                    responseFn : function(response) {
                                        self.reload.call(self);
                                        $.goMessage(lang.remove_msg);
                                    },
                                    error : function(error){
                                    }
                                });


                        });
            },
            getCheckedIds : function(){
                var ids = [];
                
                $.each($("#reportFormTable td input:checkbox:checked"), function(index, el){
                    ids.push($(el).val());
                });
                
                return ids;
            },
            renderFormEditView : function(content, name, id){
                //var self = this,
                //    isCreate = (id == undefined) ? true : false,
                //    title = isCreate ? lang.new_form_add : lang.edit_form,
                //    alertMessage = isCreate ? lang.save_form_msg : lang.edit_form_msg,
                //    formEditorView = new FormEditorView(),
                //    formEditPopup = formEditorView.popupRender({
                //        isAdmin : true,
                //        id : id || "",
                //        name : name || "",
                //        data : content,
                //        title : title,
                //        buttons : [
                //            {
                //                "pClass" : "btn",
                //                "label" : lang.save,
                //                "callback" : function(){
                //                    var params = {
                //                        name : formEditPopup.find("#name").val(),
                //                        content : formEditorView.getContent()
                //                    };
                //
                //                    if(!isCreate){
                //                        params.id = formEditPopup.find("#formId").val();
                //                    }
                //
                //                    reportCompanyFormModel = new ReportCompanyForm();
                //                    reportCompanyFormModel.set(params);
                //                    reportCompanyFormModel.save(null, {
                //                        success : function(){
                //                            $.goMessage(alertMessage);
                //                            self.reload.call(self);
                //                            formEditPopup.close();
                //                        }
                //                    });
                //                }
                //            },
                //            {
                //                "pClass" : "btn_nega",
                //                "label" : lang.cancel,
                //                "callback" : function(){
                //                    formEditPopup.close();
                //                }
                //            }
                //        ]
                //    });


                var self = this;
                var saveCallback = function(title, content) {
                    var params = {
                        name : title || '-',
                        content : content
                    };
                    if (id) params.id = id;
                    var reportCompanyFormModel = new ReportCompanyForm();
                    reportCompanyFormModel.save(params, {
                        success : function(){
                            $.goMessage(id ? lang.edit_form_msg : lang.save_form_msg );
                            self.reload.call(self);
                        }
                    });
                };

                var toggleEl = $('.tWrap');
                var view = new FormComponentManager(_.extend({lang: 'ko'}, {
                    title: name,
                    content: content,
                    saveCallback: saveCallback,
                    toggleEl: toggleEl,
                    useLoadForm: false
                }));
                toggleEl.hide();
                $('body').append(view.render().el);
            },
            create : function(){
                this.renderFormEditView("");
            },
            
            copy : function(){
                var url = GO.contextRoot + "ad/api/report/form/copy",
                    self = this,
                    ids = this.getCheckedIds();
                
                if(ids.length == 0){
                    $.goMessage(lang.form_copy_alert);
                    return;
                }
                
                $.go(url,JSON.stringify({ids : this.getCheckedIds()}), {
                    qryType : 'POST',
                    contentType : 'application/json',
                    responseFn : function(response) {
                        $.goMessage(lang.form_copy_msg);
                        self.reload.call(self);
                    },
                    error : function(error){
                    }
                });
            },
            
            release: function() {
                // 하위뷰 해제
                this.childView.release();
                
                this.$el.off();
                this.$el.empty();
                this.remove();
            },
            
            reload : function(){
                this.reportFormsTable.reload();
            },
            searchKeyboardEvent : function(e) {
                if(e.keyCode == 13) {
                    this.search();
                }
            },
            search : function() {
                var _this = this,
                    searchForm = this.$el.find('#reportSearch input[type="text"]'),
                    keyword = searchForm.val();
                
                this.reportFormsTable.search(this.$el.find('#searchSelect').val(), keyword, searchForm);
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
        
        return ReportFormsView;
    });
    
})();