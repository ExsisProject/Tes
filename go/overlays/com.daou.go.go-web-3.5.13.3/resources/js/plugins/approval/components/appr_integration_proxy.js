/*
 * GO-16116 전자결재 연동 client 인터페이스 추가
 * DO -> 외부 시스템 연동시 사용. (선택)
 * render 호출시 상태와 모드에 따라 처리 하는 방식이 달라 invokeRender를 통해 메소드 단순화.
 */
(function() {
    define([
    "backbone", 
    "app"
    ],

    function(
    Backbone,
    GO
    ) {
        var INVOKE_TYPE = {
            "EDIT" : "EDIT",
            "EDIT_TEMPSAVE" : "EDIT_TEMPSAVE",
            "EDIT_REAPPLY" : "EDIT_REAPPLY",
            "EDIT_INPROGRESS" : "EDIT_INPROGRESS",
            "VIEW" : "VIEW"
        };
        
        var Integration = Backbone.View.extend({
            initialize : function(url) {
                this.docMode = GO.util.store.get('document.docMode');
                this.docStatus = GO.util.store.get('document.docStatus');
                this.url = url;
                this.main = null;
            },

            invokeRender : function(data) {
                var self = this;
                require([this.url],function(Main){
                    self.main = new Main();
                    
                    var invoker_method = {};
                    var type = getType(self.docMode, self.docStatus);
                    
                    invoker_method[INVOKE_TYPE.EDIT] = self.main.render;
                    invoker_method[INVOKE_TYPE.EDIT_TEMPSAVE] = self.main.renderForTempSave;
                    invoker_method[INVOKE_TYPE.EDIT_REAPPLY] = self.main.renderForReapply;
                    invoker_method[INVOKE_TYPE.EDIT_INPROGRESS] = self.main.renderForInprogressEditMode;
                    invoker_method[INVOKE_TYPE.VIEW] = self.main.renderForViewMode;
                    
                    invoker_method[type].call(self.main, data);
                });
            },
            
            getVairablesData : function(){
                return this.main.getVariablesData();
            },
            
            validate : function(){
                this.main.validate();
            },
            
            beforeSave : function(){
                this.main.beforeSave();
            }
        });

        function getType(docMode, status){
            if(docMode == "EDIT"){
                if(status == "INPROGRESS"){
                    return INVOKE_TYPE.EDIT_INPROGRESS;
                }else if(status == "COPY_CREATE"){
                    return INVOKE_TYPE.EDIT_REAPPLY;
                }else if(status == "TEMPSAVE"){
                    return INVOKE_TYPE.EDIT_TEMPSAVE;
                }else{
                    return INVOKE_TYPE.EDIT;
                }
            }else if(status == "INPROGRESS"){
                return INVOKE_TYPE.VIEW;
            }
        }

        return Integration;

    });

})();