define([
    "jquery",
    "backbone",     
    "app",
    "admin/models/sms_config_model",
    "hgn!admin/templates/sms_config",
    "views/circle",
    
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    
    "jquery.go-popup",
    "jquery.go-sdk",
    "jquery.go-orgslide",
    "GO.util"
], 

function(
    $, 
    Backbone,
    App,
    SmsConfigModel,
    SmsConfigTmpl,
    CircleView,
    commonLang,
    adminLang
    
) {
    var tmplVal = {
		label_ok : commonLang['저장'],
		label_cancel : commonLang['취소'],
		label_remove : commonLang['삭제'],
	    label_use : adminLang['사용'],
	    label_unuse : adminLang['사용안함'],
		label_lmsSetting : adminLang['장문 발송자 설정'],
		label_mmsSetting : adminLang['포토 발송자 설정'],
		label_policySetting : adminLang['정책 설정'],
	    label_blackDesc : adminLang['공개'],
	    label_whiteDesc : adminLang['비공개'],
	    label_selectClass : adminLang['클래스 선택'],
	    label_addExceptionClass : adminLang['예외 클래스 추가'],
	    label_desc1 : adminLang['단문발송조건설명'],
	    label_desc2 : adminLang['장문포토발송조건설명'],
		label_config : adminLang['설정'],
		차단할클래스선택 : adminLang['차단할 클래스 선택'],
		허용할클래스선택 : adminLang['허용할 클래스 선택'],
		예외허용클래스선택 : adminLang['예외 허용 클래스 선택'],
		예외차단클래스선택 : adminLang['예외 차단 클래스 선택'],
		예외허용클래스툴팁 : adminLang['예외허용 클래스 선택 툴팁'],
		예외차단클래스툴팁 : adminLang['예외차단 클래스 선택 툴팁'],
    };
    var SmsConfig = Backbone.View.extend({
    	accessUserView: null,
		exceptionUserView: null,
		el : '#layoutContent',
        initialize : function() {
        	this.$el.off();
        	this.model = SmsConfigModel.read({admin:true});
        },
        
        events : {
        	"click #smsConfigSubmit" : "submit",
			"click #smsConfigCancel" : "cancel",
			"click #selectLmsAccessPolicy input:radio" : "confirmDeleteTarget",
			"click #selectMmsAccessPolicy input:radio" : "confirmDeleteTarget",
        },
        render : function() {
        	var self = this;
            this.$el.empty();
            this.$el.html( SmsConfigTmpl({
                lang : tmplVal,
                data : this.model.toJSON(),
            }));
            
            if(this.model.id){
				var lmsAccessSetting = this.model.get("lmsAccessSetting");
				var mmsAccessSetting = this.model.get("mmsAccessSetting");
				
				this.$('input[name="lmsAccessSetting"][value="' + lmsAccessSetting + '"]').attr('checked', true);
				this.$('input[name="mmsAccessSetting"][value="' + mmsAccessSetting + '"]').attr('checked', true);
				
				
				if ("BLACK" == lmsAccessSetting){
                    $('#lmsContainer .selectedClass').text(adminLang['차단할 클래스 선택']);
                    $('#lmsContainer .exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                    $('#lmsContainer .tool_tip').text(adminLang['예외허용 클래스 선택 툴팁']);
				} else {
                    $('#lmsContainer .selectedClass').text(adminLang['허용할 클래스 선택']);
                    $('#lmsContainer .exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                    $('#lmsContainer .tool_tip').text(adminLang['예외차단 클래스 선택 툴팁']);
				}
				if ("BLACK" == mmsAccessSetting){
                    $('#mmsContainer .selectedClass').text(adminLang['차단할 클래스 선택']);
                    $('#mmsContainer .exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                    $('#mmsContainer .tool_tip').text(adminLang['예외허용 클래스 선택 툴팁']);
				} else {
                    $('#mmsContainer .selectedClass').text(adminLang['허용할 클래스 선택']);
                    $('#mmsContainer .exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                    $('#mmsContainer .tool_tip').text(adminLang['예외차단 클래스 선택 툴팁']);
				}
			}
            
            this.renderAccessUserView();
			this.renderExceptionUserView();
        },
        
        renderAccessUserView: function(type) {
        	var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
        	if(GO.util.isUseOrgService(true)){
        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
        	}

        	this.lmsAccessUserView = new CircleView({
                selector: "#lmsAccessUser",
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("lmsAccessTarget"),
                nodeTypes: nodeTypes
            });
            this.lmsAccessUserView.render();
            
            this.mmsAccessUserView = new CircleView({
                selector: "#mmsAccessUser",
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("mmsAccessTarget"),
                nodeTypes: nodeTypes
            });
            this.mmsAccessUserView.render();
        },
        
		renderExceptionUserView: function(type) {
        	var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
        	if(GO.util.isUseOrgService(true)){
        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
        	}
        	
            this.lmsExceptionUserView = new CircleView({
                selector: "#lmsExceptionUser",
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("lmsExceptionTarget"),
                nodeTypes: nodeTypes
            });
            this.lmsExceptionUserView.render();
            
            this.mmsExceptionUserView = new CircleView({
                selector: "#mmsExceptionUser",
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("mmsExceptionTarget"),
                nodeTypes: nodeTypes
            });
            this.mmsExceptionUserView.render();
		},
		
		confirmDeleteTarget : function(e){
			var self = this,
				currentPolicy = $(e.target).val();
			var currentTarget = $(e.currentTarget),
				type = currentTarget.attr("data-type");

			var cancelCallback = function(){
				if(type == "lms"){
					$('input[name="lmsAccessSetting"][value="'+currentPolicy+'"]').attr('checked', true);
				}else{
					$('input[name="mmsAccessSetting"][value="'+currentPolicy+'"]').attr('checked', true);
				}
			};
			var confirmCallback = function(){
				if(type == "lms"){
					self.lmsAccessUserView.deleteAllData();
					self.lmsExceptionUserView.deleteAllData();
					if(currentPolicy == "BLACK"){
                        $('#lmsContainer .selectedClass').text(adminLang['차단할 클래스 선택']);
                        $('#lmsContainer .exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                        $('#lmsContainer .tool_tip').text(adminLang['예외허용 클래스 선택 툴팁']);
				    }else{
                        $('#lmsContainer .selectedClass').text(adminLang['허용할 클래스 선택']);
                        $('#lmsContainer .exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                        $('#lmsContainer .tool_tip').text(adminLang['예외차단 클래스 선택 툴팁']);
				    }
					popup.close();
				}else{
					self.mmsAccessUserView.deleteAllData();
					self.mmsExceptionUserView.deleteAllData();
					if(currentPolicy == "BLACK"){
                        $('#mmsContainer .selectedClass').text(adminLang['차단할 클래스 선택']);
                        $('#mmsContainer .exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                        $('#mmsContainer .tool_tip').text(adminLang['예외허용 클래스 선택 툴팁']);
				    }else{
                        $('#mmsContainer .selectedClass').text(adminLang['허용할 클래스 선택']);
                        $('#mmsContainer .exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                        $('#mmsContainer .tool_tip').text(adminLang['예외차단 클래스 선택 툴팁']);
				    }
					popup.close();
				}
			};
				
			var popup = $.goPopup({
				title : adminLang['정책 설정 변경 확인'], 
				message : "", 
				buttons : [{
					btext : commonLang["확인"],
					btype : "confirm",
					callback : confirmCallback,
					autoclose : false
				}, {
					btext : commonLang["취소"],
					btype : "normal",
					callback : cancelCallback
				}]
				,
				closeCallback : cancelCallback
			});
		},
		
		submit : function(){
			var self = this;
			var lmsAccessSetting = $('#selectLmsAccessPolicy input[type=radio]:checked').val(),
				mmsAccessSetting = $('#selectMmsAccessPolicy input[type=radio]:checked').val(),
				lmsAccessTarget = self.lmsAccessUserView.getData(),
				mmsAccessTarget = self.mmsAccessUserView.getData(),
				lmsExceptionTarget = self.lmsExceptionUserView.getData(),
				mmsExceptionTarget = self.mmsExceptionUserView.getData();
			
			self.model.set("lmsAccessSetting", lmsAccessSetting, {silent: true});
			self.model.set("mmsAccessSetting", mmsAccessSetting, {silent: true});
			self.model.set("lmsAccessTarget", lmsAccessTarget, {silent: true});
			self.model.set("mmsAccessTarget", mmsAccessTarget, {silent: true});
			self.model.set("lmsExceptionTarget", lmsExceptionTarget, {silent: true});
			self.model.set("mmsExceptionTarget", mmsExceptionTarget, {silent: true});
			
			GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
			self.model.save({}, {
				type : 'PUT',
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						GO.router.navigate("sms/config", {trigger: true});
						
					}
				},
				error : function(model, response) {
					$.goMessage(commonLang["저장에 실패 하였습니다."]);
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
				}
			});
		},
		
		cancel : function() {
			this.render();
		}
		
	});
	
	return SmsConfig;
});