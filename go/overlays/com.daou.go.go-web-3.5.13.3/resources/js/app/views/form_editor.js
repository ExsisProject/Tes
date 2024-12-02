;(function(){
define(
    [
        "backbone", 
        "app", 
        "jquery",
        "hgn!templates/form_editor",
        "hgn!admin/templates/form_editor",
        "i18n!nls/commons",
        "i18n!report/nls/report",
        "jquery.go-popup",
        "formeditor"
    ],
    function(
        Backbone,
        GO,
        $,
        FormEditTmpl,
        AdminFormEditTmpl,
        CommonLang,
        ReportLang
    ){
        var tpl = {
                "button" : "<a class='{pClass}' id='{targetId}' data-role='button'><span class='txt'>{label}</span></a>",
                "adminButton" : "<span class='{pClass}' id='{targetId}'>{label}</span>",
            },
            form_default = {
                editerId : "editArea",
                lang : GO.config("locale") || "ko",
                top : "20%"
            },
            lang = {
                form_title : ReportLang["양식 편집기"],
                preview : ReportLang["미리보기"],
                form_name : ReportLang["양식 제목"]
            };
        
        var FormEditView = Backbone.View.extend({
            
            initialize : function(){
                
            },
            getContent : function(){
                return $.goFormEditor.getContent(this.editerId);
            },
            getPopupContent : function(options){
                var self = this,
                    isAdmin = options.isAdmin || false,
                    templateData = {
                        id : options.id || "",
                        name : options.name,
                        lang : lang,
                        editerId : this.editerId,
                        actions : function(){
                            if(options.buttons){
                                var buttonWrap = [];
                                $.each(options.buttons, function(index, button){
                                    var label = button.label,
                                        callback = button.callback,
                                        buttonTpl = isAdmin ?  tpl.adminButton : tpl.button,
                                        targetId = (new Date).getTime()+ "" + parseInt(Math.random(8) * 1000);
                                        pClass = "";
                                        
                                    if(button.pClass){
                                        pClass = button.pClass;
                                    }else{
                                        if(isAdmin){
                                            pClass = "btn";
                                        }else{
                                            pClass = "btn_major";
                                        }
                                    }
                                    
                                    buttonTpl = self.template(buttonTpl,{
                                        "label" : label,
                                        "targetId" : targetId,
                                        "pClass" : pClass
                                    });
                                    
                                    buttonWrap.push(buttonTpl);
                                    
                                    if(callback){
                                        $("body").on('click', "#"+targetId, callback);
                                    }
                                });
                                return buttonWrap.join("");
                            }
                        }
                    };
                
                if(isAdmin){
                    return AdminFormEditTmpl(templateData);
                }else{
                    return FormEditTmpl(templateData);
                }
            },
            popupRender : function(options){
                this.editerId = options.editerId || form_default.editerId;
                var self = this,
                    popupEl = $.goPopup({
                    	pclass : "layer_normal layer_doc_editor",
                        header : options.title || lang.form_title,
                        width : 1000,
                        title : "",
                        modal : true,
                        contents : self.getPopupContent(options)
                    });
                
                var dslString = ""; 
                
                if(options.data){
                    dslString = $.goFormEditor.spanToDSL(options.data);
                }
                
                $("#"+this.editerId).goFormEditor({
                    lang: form_default.lang,
                    editorValue : dslString
                });
                
                if(options.isAdmin){
                    popupEl.css("height", "650px");
                }else{
                    popupEl.css("height", "600px");
                }
                
                popupEl.reoffset();
                
                return popupEl;
            
            },
            render : function(){
                
            },
            template : function(tpl,data){ 
                return tpl.replace(/{(\w*)}/g,function(m,key){return data.hasOwnProperty(key)?data[key]:"";}); 
            }
        },{
            preview : function(content, deptName, closeCallback){
                var contents = "<div class='doc_wrap' style='min-width:700px'>" + content + "</div>",
                    popupId = "formPreview";
                
                var popup = $.goPopup({
                    header : lang.preview,
                    width : 900,
                    title : "",
                    id : popupId,
                    top : form_default.top,
                    modal : true,
                    wrapTpl :  ['<div class="go_preview {pclass}" id="{pid}" data-id="{generateUUID}" data-close="false" style="display:none">' , 
                        '<header><h1>{header}</h1>{headerHtml}<a class="btn_layer_x" data-bypass title="{closeText}"><span class="ic"></span><span class="txt">' ,
                        '</span></a></header>' ,
                        '<div class="content">{pTitle}{message}{contents}</div>{buttonwrap}</div>'],
                    contents : "<form id='previewForm' class='form_doc_editor ie9-scroll-fix'></form>",
                    closeCallback : closeCallback || function(){
                        $("#" + popupId).remove();
                    }
                });
                
                popup.addClass("go_renew");
                popup.find("div.content").css({"max-height": "500px","overflow" : "auto" });
                
                 var opts = {
                        data : contents,
                        contextRoot : GO.contextRoot,
                        userId : GO.session().id,
                        userProfileApi : 'api/user/profile',
                        deptName : deptName
                };
                
                $("#previewForm").setTemplate(opts);
                
                popup.reoffset();
            }
        });
        
        return FormEditView;
    });
})();
    
