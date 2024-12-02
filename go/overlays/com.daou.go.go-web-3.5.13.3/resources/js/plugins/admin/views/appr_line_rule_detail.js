define(function(require) {
	var Backbone = require("backbone");
	var when = require("when");
	var CompanyCollection = require("system/collections/companies");
	var LineRuleDetailItemView = require("admin/views/appr_line_rule_detail_item");
	var LineRuleDetailTpl = require("hgn!admin/templates/appr_line_rule_detail");
	var approvalLang = require("i18n!approval/nls/approval");
	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	
	 var lang = {
         "자동결재선 명" : approvalLang['자동결재선 명'],
         "적용된 양식수" : adminLang['적용된 양식수'],
         "결재선" : approvalLang['결재선'],
         "자동결재선 설정" : adminLang['자동결재선 설정'],
         "순서바꾸기" : commonLang['순서바꾸기'],
         "순서바꾸기 완료" : commonLang['순서바꾸기 완료'],
         '추가' : commonLang['추가'],
         '삭제' : commonLang['삭제'],
         '저장' : commonLang['저장'],
         '취소' : commonLang['취소'],
         'empty_msg' : approvalLang['자료가 없습니다'],
         '최소 하나 이상의 결재선 설정이 있어야 합니다' : approvalLang['최소 하나 이상의 결재선 설정이 있어야 합니다'],
         'save_success_msg' : approvalLang['저장되었습니다 자동 결재선 설정 목록으로 이동합니다'],
         "이름" : commonLang["이름"],
         "옵션추가" : commonLang["옵션추가"]
     };
	
	 var ApprLineRuleModel = Backbone.Model.extend({
         defaults : {
             apprLineRuleGroups : []
         },
         url: function() {
             if(this.isNew()){
                 return "/ad/api/approval/apprlinerule";                 
             }else{
                 return "/ad/api/approval/apprlinerule/"+this.get('id');
             }
         }
     });
	 
	 var ApprLineRuleGroup = Backbone.Model.extend({
         defaults  :{
             useAccountRule : false,
             ruleTypeName : 'duty',
             apprLineRuleItemGroups : [],
             useAllDept : true
         }
     });
     
     var ApprLineRuleGroups = Backbone.Collection.extend({
         model : ApprLineRuleGroup
     });
     
     var ApprConfigModel = Backbone.Model.extend({
         url: function() {
             return "/ad/api/approval/admin/config";
         },
         
         getTypes : function(){
             var types = [{
                 type : 'APPROVAL',
                 name : approvalLang['결재']
             }];
             if(this.get('useAgreement')){
                 types.push({
                     type : 'AGREEMENT',
                     name : approvalLang['합의']
                 })
             }
             
             if(this.get('useCheckActivity')){
                 types.push({
                     type : 'CHECK',
                     name :  approvalLang['확인']
                 })
             }
             
             if(this.get('useInspectionActivity')){
                 types.push({
                     type : 'INSPECTION',
                     name :  approvalLang['감사']
                 })                  
             }
             return types;
         }
     });
     
     var DomainModel = Backbone.Model.extend({
         initialize : function(){
             this.set('companyId', GO.session('companyId'));
         },
         url: function() {
             return "/ad/api/positionall/list";
         }
     });
 
     var LineRuleDetailView = Backbone.View.extend({
         el: '#layoutContent',
         
         lineItemViews : null,
         
         initialize: function(options) {
             this.options = options || {};
             this.lineItemViews = null;
             this.model = new ApprLineRuleModel(this.options.hasOwnProperty('ruleId') ? {"id": this.options.ruleId} : null);
             this.apprConfig = new ApprConfigModel();
             this.domain = new DomainModel();
             this.unbindEvent();
             this.bindEvent();
         },
         bindEvent: function(events) {
             this.$el.on('click', '#btn_add_option', $.proxy(this._addApprLineOption, this));
             this.$el.on('click', '#btn_save', $.proxy(this._saveApprLineRule, this));
             this.$el.on('click', '#btn_cancel', $.proxy(this._goToApprLineRuleView, this));
             
         }, 
         unbindEvent: function() {
             this.$el.off('click', '#btn_add_option');
             this.$el.off('click', '#btn_save_apprLineRule');                
             this.$el.off('click', '#btn_cancel_appr_config');
         },

         
         render: function() {
             var self = this;
             when(this.fetchRuleModel())
             .then(_.bind(this.fetchConfig, this))
             .then(_.bind(this.fetchDomain, this))
             .then(_.bind(this.fetchCompanies, this))
             .then(function(){
                 self.$el.html(LineRuleDetailTpl({
                     data : self.model.toJSON(),
                     lang: lang
                 }));
                 
                 if(self.model.get('apprLineRuleGroups').length < 1){
                     var lineItemView = new LineRuleDetailItemView({
                         apprConfig : self.apprConfig,
                         domain : self.domain,
                         companyIds : self.companyIds,
                         model : new ApprLineRuleGroup()
                     });
                     self.$el.find('#appr_line_rule_item_area').append(lineItemView.render().$el);
                 }else{
                     var firstLineItemView ='';
                     _.each(_.groupBy(self.model.get('apprLineRuleGroups'),'seq'), function(m,i){
                         var  maxLength = m.length;
                         $.each(m,function(i,obj){
                             if(i==0){
                                 var lineItemView = new LineRuleDetailItemView({
                                     apprConfig : self.apprConfig,
                                     domain : self.domain,
                                     companyIds : self.companyIds,
                                     model : new ApprLineRuleGroup(obj),
                                     maxLength : maxLength
                                 });
                                 firstLineItemView = lineItemView;
                                 self.$el.find('#appr_line_rule_item_area').append(lineItemView.render().$el);
                             }else{
                                 firstLineItemView.addLineRuleItemAreaView({
                                     apprConfig : self.apprConfig,
                                     domain : self.domain,
                                     companyIds : self.companyIds,
                                     model : new ApprLineRuleGroup(obj),
                                     maxLength : maxLength, 
                                     firstLineItemView : firstLineItemView})
                             }
                         });           
                     });
                 }
                 self.hideUnnecessaryButtons();
                 
                 return self;                    
             })
             .otherwise(function printError(err) {
                 console.log(err.stack);
             });
         },
         
         _addApprLineOption : function(){
             var self = this;
             var lineItemView = new LineRuleDetailItemView({
                 apprConfig : self.apprConfig,
                 domain : self.domain,
                 companyIds : self.companyIds,
                 model : new ApprLineRuleGroup()
             });
             self.$el.find('#appr_line_rule_item_area').append(lineItemView.render().$el);
             
             $('.btn_delete_option').show();
             
             this.hideUnnecessaryButtons();
         },
         
         hideUnnecessaryButtons : function(){
        	 $.each($('div[name="lineRuleItemArea"]'), function(i, lineRuleItemArea){
            	 if($(lineRuleItemArea).find('.approvalLineConfig').length <= 1){
            		 $(lineRuleItemArea).find('.approvalLineConfig span[name="priorityTypeSpan"]').hide();
            		 $(lineRuleItemArea).find('.approvalLineConfig span[name="approvalLineConfigDelete"]').hide();
            	 }
             });
        	 
        	 if($('div[name="lineRuleItemArea"]').length <= 1) {
        		 $('.btn_delete_option').hide();
        	 }
         },
        
         _saveApprLineRule: function(){
             var self = this;
             var datas = [];
             var lineRuleItemEls = this.$('#appr_line_rule_item_area > div[name="lineRuleItemArea"]');
             
             /*
              * validation
              */
             if(this.$('input[name="name"]').val() == ''){
                 $.goMessage(adminLang['이름을 입력하세요.']);
                 return false;
             }
             
             $.each(lineRuleItemEls, function(i, view){
                 var lineItemSeq = i+1;
                 
                 var approvalLineConfigLength = $(view).find('div.approvalLineConfig').length;
                 
                 $.each($(view).find('div.approvalLineConfig'),function(i,item){//DOCUSTOM-8699
                     datas.push(_.extend($(item).data('instance').getData(true), {seq : lineItemSeq ,subSeqCount : approvalLineConfigLength }));
                 });
                 
             });
             var data = {
                     name : this.$('input[name="name"]').val(),
                     apprLineRuleGroups : datas
             };
             
             /*
              * validation
              */
             if(data.apprLineRuleGroups.length == 0){
                 $.goMessage(lang['최소 하나 이상의 결재선 설정이 있어야 합니다']);
                 return false;
             }
             
             var resultMessage = "";
             var isIncludeAllDeptLineConfig = false;
             $.each(lineRuleItemEls, function(i, view){
                 //var lineItemView = $(view).data('instance');
                 $.each($(view).find('div.approvalLineConfig'),function(i,item){//DOCUSTOM-8699
                     resultMessage = $(item).data('instance').validate();
                     if(resultMessage != "true") return false;
                     isIncludeAllDeptLineConfig = $(item).find('#applyDeptTypes input:checked').val() == 'all_depts' ? true : false;
                 });
                 if(resultMessage != "true"){
                     return false;
                 }
             });
             if(resultMessage != "true"){
                 $.goMessage(resultMessage);
                 return false;
             }
             
             if(!isIncludeAllDeptLineConfig) {
            	 $.goConfirm(adminLang["저장하시겠습니까?"], adminLang["자동결재선 전체부서 미 포함 경고"], function(){
            		 self._ApprLineRuleModelSave(data);
            	 },commonLang['확인'], function(){return false;});
             } else {
            	 this._ApprLineRuleModelSave(data);
             }
         },
         
         _ApprLineRuleModelSave : function(data){
        	 var self = this;
        	 this.model.set(data);
             this.model.save({},{
                 success : function(model, resp){
                     $.goAlert(lang['save_success_msg'], "", $.proxy(self._goToApprLineRuleView, this));
                 },
                 error : function(model, resp){
                 	if(resp.responseJSON){
                 		$.goMessage(resp.responseJSON.message);
                 	}else{
                 		$.goMessage(commonLang['저장에 실패 하였습니다.']);
                 	}
                 }
             });
         },
         
         _goToApprLineRuleView: function(){
             GO.router.navigate('approval/apprlinerule', {trigger: true});
         },
         
         
         fetchRuleModel : function(){
             var self = this;
             var deffered = when.defer();
             if(this.model.isNew()){
                 deffered.resolve();
             }else{
                 this.model.fetch({
                     success : deffered.resolve, 
                     error : deffered.reject
                 });                 
             }
             return deffered.promise;                
         },
         
         fetchConfig : function(){
             var self = this;
             var deffered = when.defer();
             this.apprConfig.fetch({
                 success : function(){
                     //console.log('config success')
                     deffered.resolve();
                 },
                 error : deffered.reject
             });
             return deffered.promise;
         },
         fetchDomain : function(){
             
             var self = this;
             var deffered = when.defer();
             this.domain.fetch({
                 data : {
                     companyId : self.domain.get('companyId')
                 },
                 success : function(){
                     deffered.resolve()
                 }, 
                 error : deffered.reject
             });
             return deffered.promise;
         },
         fetchCompanies : function() {
        	 var self = this;
             var deffered = when.defer();
             if (this.apprConfig.get('multiCompanySupporting') == true) {
         		this.companyCollection = new CompanyCollection({
                     'type': 'companygroup'
                 });
                 this.companyCollection.fetch({
                     success: _.bind(function(companies) {
                     	this.companyIds = companies.map(function(company) {return company['id'];});
                     	deffered.resolve();
                     }, this),
                     error : deffered.reject
                 });
             }else{
            	 deffered.resolve();
             }
             return deffered.promise;
         }
     });
     return LineRuleDetailView;
});