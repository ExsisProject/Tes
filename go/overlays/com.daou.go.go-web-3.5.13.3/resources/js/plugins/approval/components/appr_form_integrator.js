(function() {
    define(["jquery", "app"], function($, GO) {
        
        var FormIntegrator = function() {
            console.log("FormIntegrator initialized");
            this.integrationView = null;
            if ($.goIntegrationForm != undefined) {
                $.goIntegrationForm = undefined;
            }
        };
        
        FormIntegrator.prototype.setIntegrationView = function(integrationView){
            console.log("FormIntegrator.setIntegrationView");
        	this.integrationView = integrationView ? integrationView : null;
        };
        
        FormIntegrator.prototype.hasIntegrationView = function(){
        	var hasIntegrationView = this.integrationView ? true : false; 
            console.log("FormIntegrator.hasIntegrationView : " + hasIntegrationView);
        	return hasIntegrationView;
        };        
        
        FormIntegrator.prototype.setStatus = function(status) {
            console.log("FormIntegrator.setStatus : " + status);
        	GO.util.store.set('document.docStatus', status, {type : 'session'});
        };
        
        FormIntegrator.prototype.setDocVariables = function(docVariables) {
            console.log("FormIntegrator.setDocVariables");
        	GO.util.store.set('document.variables', docVariables, {type : 'session'});
        };
        
        // 연동데이타(DocVariables) 획득
        FormIntegrator.prototype.getDocVariables = function() {
            console.log("FormIntegrator.getDocVariables");
            if(this.hasIntegrationView() && typeof this.integrationView.getDocVariables === 'function'){
            	console.log('call Integration getDocVariables Function');
            	return this.integrationView.getDocVariables();
            }
            
            if ($.goIntegrationForm && typeof $.goIntegrationForm.getData === 'function') {
                return $.goIntegrationForm.getData();
            }
            if ($.goIntegrationForm && typeof $.goIntegrationForm.getIntegrationData === 'function') {
                return $.goIntegrationForm.getIntegrationData();
            }
            return false;
        };
        
        // 기안, 결재시 연동양식의 Validation 확인
        FormIntegrator.prototype.validate = function() {
            console.log("FormIntegrator.validate");
            if(this.hasIntegrationView() && typeof this.integrationView.validate === 'function'){
            	console.log('call Integration validate Function');
            	return this.integrationView.validate();
            }
            
            if ($.goIntegrationForm && typeof $.goIntegrationForm.validate === 'function') {
                return $.goIntegrationForm.validate();
            }
            if ($.goIntegrationForm && typeof $.goIntegrationForm.validateIntegrationData === 'function') {
                return $.goIntegrationForm.validateIntegrationData();
            }
            if ($.goIntegrationForm && typeof $.goIntegrationForm.beforeConfirm === 'function') {
                return $.goIntegrationForm.beforeConfirm();
            }
            return true;
        };
        
        // 결재문서 저장 전처리
        FormIntegrator.prototype.beforeSave = function() {
            console.log("FormIntegrator.beforeSave");
            
            if(this.hasIntegrationView() && typeof this.integrationView.beforeSave === 'function'){
            	console.log('call Integration beforeSave Function');
            	this.integrationView.beforeSave();
            }
            if ($.goIntegrationForm && typeof $.goIntegrationForm.beforeSave === 'function') {
                $.goIntegrationForm.beforeSave();
            }
            if ($.goIntegrationForm && typeof $.goIntegrationForm.clearEmptyIntegrationData === 'function') {
                $.goIntegrationForm.clearEmptyIntegrationData();
            }
        };
        
        // 결재문서 저장 후처리
        FormIntegrator.prototype.afterSave = function() {
            console.log("FormIntegrator.afterSave");
            
            if(this.hasIntegrationView() && typeof this.integrationView.afterSave === 'function'){
            	console.log('call Integration afterSave Function');
            	this.integrationView.afterSave();
            }
            
            if ($.goIntegrationForm && typeof $.goIntegrationForm.afterSave === 'function') {
                $.goIntegrationForm.afterSave();
            }
        };
        
        // 문서 '수정'버튼시 연결된 양식스크립트가 있으면 실행. GO-21704
        FormIntegrator.prototype.onEditDocument = function(){
        	console.log("FormIntegrator.onEditDocument");
            if(this.hasIntegrationView() && typeof this.integrationView.onEditDocument === 'function'){
            	console.log('call Integration onEditDocument Function');
            	this.integrationView.onEditDocument();
            }
        };
    
        FormIntegrator.prototype.getDeleteMessageKey = function() {
            console.log("FormIntegrator.getDeleteMessageKey");
            if(this.hasIntegrationView() && typeof this.integrationView.getDeleteMessageKey === 'function'){
                console.log('call Integration getDeleteMessageKey Function');
                return this.integrationView.getDeleteMessageKey();
            }
            
            return "문서삭제경고";
        };
        
        return FormIntegrator;
    });
})();
