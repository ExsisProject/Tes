define([
    "jquery",
    "backbone",     
    "app",
    "admin/models/attnd_default_model",
    "admin/models/attnd_status",
    "hgn!admin/templates/attnd_default",
    "views/circle",
    
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    
    "jquery.go-popup",
    "jquery.go-sdk",
    "jquery.go-grid",
    "jquery.go-orgslide",
    "jquery.go-validation",
    "GO.util"
], 

function(
    $, 
    Backbone,
    App,
    AttndDefaultModel,
    AttndStatus,
    AttndDefaultTmpl,
    CircleView,
    commonLang,
    adminLang
) {
    var tmplVal = {
		label_ok : commonLang['저장'],
		label_cancel : commonLang['취소'],
		label_remove : commonLang['삭제'],
	    label_defaultSetting : adminLang['기본 설정'],
	    label_attendanceSetting : adminLang['근태자 설정'],
	    label_workingDay : adminLang['근무일'],
	    label_excludeClass : adminLang['근태 클래스 추가'],
	    label_selectClass : adminLang['클래스 선택'],
	    label_addExceptionClass : adminLang['예외 클래스 추가'],
	    label_workingDaySun : adminLang['SU'],
	    label_workingDayMon : adminLang['MO'],
	    label_workingDayTue : adminLang['TU'],
	    label_workingDayWed : adminLang['WE'],
	    label_workingDayThu : adminLang['TH'],
	    label_workingDayFri : adminLang['FR'],
	    label_workingDaySat : adminLang['SA'],
	    label_clockInOutTime : adminLang['출퇴근 시간'],
	    label_clockInTime : adminLang['출근 시간'],
	    label_clockOutTime : adminLang['퇴근 시간'],
	    label_attendanceStatus : adminLang['근태 상태'],
	    label_addAttendanceStatus : adminLang['추가'],
	    label_statusName : adminLang['항목명'],
	    label_statusType : adminLang['편집 유형'],
	    label_policySetting : adminLang['정책 설정'],
	    label_attendanceActive : adminLang['근태관리 활성화 여부'],
	    label_menuActive : adminLang['메뉴 활성화 여부'],
	    label_menuActiveDesc : adminLang['해당 메뉴를 활성화 합니다.'],
	    label_menuDectiveDesc : adminLang['해당 메뉴를 비활성화 합니다.'],
	    label_30_status_alert : adminLang['최대 30개까지만 추가할 수 있습니다.'],
	    label_date : adminLang['날짜'],
	    label_time : adminLang['시간'],
	    label_useFlexibleTime : adminLang['자율 출퇴근제 이용'],
	    label_blackDesc : adminLang['차단 정책 설명'],
	    label_whiteDesc : adminLang['허용 정책 설명'],
	    label_use : adminLang['사용'],
	    label_unuse : adminLang['사용안함'],
	    label_mobileapp : adminLang['모바일 앱'],
	    label_allow_mobile : adminLang['근태체크 허용 여부'],
	    label_mobile_app_ehr : adminLang['모바일 앱 근태'],
	    label_record_gps : adminLang['GPS 기록'],
	    label_webservice : adminLang["웹 서비스"],
	    label_gps_desc : adminLang['GPS 기록 설명'],
		label_flexibleTime_desc : adminLang['*시간 설정 없이 자유롭게 체크할 수 있습니다.'],
		label_day_after : adminLang['익일'],
		label_until : adminLang['까지'],
		label_all_night_time : adminLang['철야퇴근 시간'],
		label_all_night_desc : adminLang['*철야 퇴근시간 설명'],
		label_restrict_active : adminLang["근태 데이터 수정 제한 설정"],
		label_restrict_txt : adminLang["근태 데이터 수정 제한"],
		label_restrict_desc : adminLang["근태동기화 설명"],
		label_restrict_tooltip : adminLang["근태동기화 설명 툴팁"],
        label_restrict_guide : adminLang["가이드"],
    };
    var AttndDefault = Backbone.View.extend({
    	accessUserView: null,
		exceptionUserView: null,
		el : '#layoutContent',
        initialize : function() {
        	this.$el.off();
        	this.model = AttndDefaultModel.get();
        	this.workDay = JSON.parse(this.model.get('workDay')); 
        },
        
        events : {
        	"click #attndDefaultSubmit" : "submit",
			"click #attndDefaultCancel" : "cancel",
			"change #useFlexibleTime" : "useFlexibleTime",
			"click input[name='allowMobile']" : "changeAllowMobile",
			"click input#activeSync" : "_deActiveMobileCheck",
			"click input#deactivateSync" : "_activeMobileCheck",
			"click span#restrictGuide" : "_onClickPopupGuideLayer"
        },
        render : function() {
        	var self = this;
			var time_hour = [{text: "00", value: "00"}, {text: "01", value: "01"}, {text: "02", value: "02"}, {text: "03", value: "03"}, {text: "04", value: "04"}, {text: "05", value: "05"}, {text: "06", value: "06"}, {text: "07", value: "07"}, {text: "08", value: "08"}, {text: "09", value: "09"}, {text: "10", value: "10"}, {text: "11", value: "11"}, {text: "12", value: "12"}, {text: "13", value: "13"}, {text: "14", value: "14"}, {text: "15", value: "15"}, {text: "16", value: "16"}, {text: "17", value: "17"}, {text: "18", value: "18"}, {text: "19", value: "19"}, {text: "20", value: "20"}, {text: "21", value: "21"}, {text: "22", value: "22"}, {text: "23", value: "23"}];
			var time_second = [{text: "00", value: "00"}, {text: "01", value: "01"}, {text: "02", value: "02"}, {text: "03", value: "03"}, {text: "04", value: "04"}, {text: "05", value: "05"}, {text: "06", value: "06"}, {text: "07", value: "07"}, {text: "08", value: "08"}, {text: "09", value: "09"}, {text: "10", value: "10"}, {text: "11", value: "11"}, {text: "12", value: "12"}, {text: "13", value: "13"}, {text: "14", value: "14"}, {text: "15", value: "15"}, {text: "16", value: "16"}, {text: "17", value: "17"}, {text: "18", value: "18"}, {text: "19", value: "19"}, {text: "20", value: "20"}, {text: "21", value: "21"}, {text: "22", value: "22"}, {text: "23", value: "23"}, {text: "24", value: "24"}, {text: "25", value: "25"}, {text: "26", value: "26"}, {text: "27", value: "27"}, {text: "28", value: "28"}, {text: "29", value: "29"}, {text: "30", value: "30"}, {text: "31", value: "31"}, {text: "32", value: "32"}, {text: "33", value: "33"}, {text: "34", value: "34"}, {text: "35", value: "35"}, {text: "36", value: "36"}, {text: "37", value: "37"}, {text: "38", value: "38"}, {text: "39", value: "39"}, {text: "40", value: "40"}, {text: "41", value: "41"}, {text: "42", value: "42"}, {text: "43", value: "43"}, {text: "44", value: "44"}, {text: "45", value: "45"}, {text: "46", value: "46"}, {text: "47", value: "47"}, {text: "48", value: "48"}, {text: "49", value: "49"}, {text: "50", value: "50"}, {text: "51", value: "51"}, {text: "52", value: "52"}, {text: "53", value: "53"}, {text: "54", value: "54"}, {text: "55", value: "55"}, {text: "56", value: "56"}, {text: "57", value: "57"}, {text: "58", value: "58"}, {text: "59", value: "59"}];
            this.$el.empty();
            this.$el.html( AttndDefaultTmpl({
                lang : tmplVal,
                data : this.model.toJSON(),
                group: this.model.get('group'),
                workDay : this.workDay,
				time_hour : time_hour,
				time_second : time_second,
                isBlackGroup : this.model.get('group').accessSetting == 'BLACK' ? true : false,
                isServiceAdminMode : GO.session().serviceAdminMode
            }));
            
            if($("#allowMobile").is(":checked")) {	//모바일 앱 사용이면
				$("#mobileAppEhr").show();
			} else {
				$("#mobileAppEhr").hide();
				$('input#recordGps_unuse').attr("checked", true);
			}

            // GO-29061-근태동기화-DO동기화-OnOff-UX-수정건-보완
            // 2.5.5.0에서는 해당 기능 비노출 처리 : 이후 버전 반영 예정
            if(!GO.session().serviceAdminMode) {
				$("div#syncActiveMode").hide();
        	}
            
             if(this.model.get('syncActive')) {
             	self._deActiveMobileCheck();
             } else {
             	self._activeMobileCheck();
             }
            
            this.renderInOutAllNightTime();
            this.renderAccessUserView();
			this.renderExceptionUserView();
        },
		renderInOutAllNightTime: function() {
        	var inTime = this.model.get('group').clockInTime; 
        	var outTime = this.model.get('group').clockOutTime;
			var allNightTime = this.model.get('group').clockAllNightTime;
        	
        	this.$el.find('#inTimeHour').val(inTime.split(':')[0]);
        	this.$el.find('#inTimeMin').val(inTime.split(':')[1]);
        	this.$el.find('#inTimeSec').val(inTime.split(':')[2]);
        	
        	this.$el.find('#outTimeHour').val(outTime.split(':')[0]);
        	this.$el.find('#outTimeMin').val(outTime.split(':')[1]);
        	this.$el.find('#outTimeSec').val(outTime.split(':')[2]);
        	if (this.model.get('group').useFlexibleTime) {
        		this.$el.find('#clockInOutContainer').hide();
				this.$el.find('#clockAllNightContainer').hide();
        	}

			this.$el.find('#allNightTimeHour').val(allNightTime.split(':')[0]);
			this.$el.find('#allNightTimeMin').val(allNightTime.split(':')[1]);
			this.$el.find('#allNightTimeSec').val(allNightTime.split(':')[2]);
        },
        
        renderAccessUserView: function() {
        	var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
        	if(GO.util.isUseOrgService(true)){
        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
        	}
            this.accessUserView = new CircleView({
                selector: '#accessUser',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('group').accessTarget,
                nodeTypes: nodeTypes
            });
            this.accessUserView.render();
        },
        
		renderExceptionUserView: function() {
        	var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
        	if(GO.util.isUseOrgService(true)){
        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
        	}
            this.exceptionUserView = new CircleView({
                selector: '#exceptionUser',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('group').exceptionTarget,
                nodeTypes: nodeTypes
            });
            this.exceptionUserView.render();
		},
		useFlexibleTime : function(e) {
			var useFlexibleTime = $(e.currentTarget).is(':checked');
			if (useFlexibleTime) {
				$('#clockInOutContainer').hide();
				$('#clockAllNightContainer').hide();
			} else {
				$('#clockInOutContainer').show();
				$('#clockAllNightContainer').show();
			}
		},
		
		changeAllowMobile : function(e) {
			var currentTarget = $(e.currentTarget),
    			selectVal = currentTarget.is(":checked");
			
			if(selectVal) {	//모바일 앱 사용이면
				$("#mobileAppEhr").show();
			} else {
				$("#mobileAppEhr").hide();
				$('input#recordGps_unuse').attr("checked", true);
			}
		},
		
		submit : function(){
			var self = this;
			var status = [];
			var isValidate = true;
			var sec = 60;

			$('span.go_alert').text("");

			
			var inTimeForSec = parseInt($('#inTimeHour').val()) * sec * sec + parseInt($('#inTimeMin').val()) * sec + parseInt($('#inTimeSec').val());
			var outTimeForSec = parseInt($('#outTimeHour').val()) * sec * sec + parseInt($('#outTimeMin').val()) * sec + parseInt($('#outTimeSec').val());
			var allNightTimeForSec = parseInt($('#allNightTimeHour').val()) * sec * sec + parseInt($('#allNightTimeMin').val()) * sec + parseInt($('#allNightTimeSec').val());

			if( inTimeForSec < allNightTimeForSec ) {
				$.goAlert(adminLang["철야퇴근 시간은 익일 출근시간을 넘길수 없습니다."]);
				return;
			}
			if(!$('#useFlexibleTime').is(":checked") && inTimeForSec >= outTimeForSec){
				$('#inOutValidate').text(adminLang["퇴근 시간이 출근 시간보다 이전일 수 없습니다."]);
				return;
			}
						
			if(!isValidate){
				return;
			}
			
			var clockInTime = $('#inTimeHour').val() + ':' + $('#inTimeMin').val() + ':' + $('#inTimeSec').val();
			var clockOutTime = $('#outTimeHour').val() + ':' + $('#outTimeMin').val() + ':' + $('#outTimeSec').val();
			var clockAllNightTime = $('#allNightTimeHour').val() + ':' + $('#allNightTimeMin').val() + ':' + $('#allNightTimeSec').val();
			self.model.set("workDay", JSON.stringify({'Mon' : $('#labelMon').is(':checked'), 'Tue' : $('#labelTue').is(':checked'), 'Wed' : $('#labelWed').is(':checked'), 'Thu' : $('#labelThu').is(':checked'), 'Fri' : $('#labelFri').is(':checked'), 'Sat' : $('#labelSat').is(':checked'), 'Sun' : $('#labelSun').is(':checked')}), {silent: true});
			self.model.set("group", {
					id : $('#attndDefaultSetting').attr('data-id'), 
					useFlexibleTime : $('#useFlexibleTime').is(':checked'), 
					accessSetting : $('#selectAccessPolicy input[type=radio]:checked').val(), 
					clockInTime : clockInTime, 
					clockOutTime : clockOutTime,
					clockAllNightTime : clockAllNightTime,
					accessTarget : this.accessUserView.getData(), 
					exceptionTarget : this.exceptionUserView.getData(), 
					name : 'default', 
					allowMobile : $('input#allowMobile').is(":checked"),
					recordGps : $('input#recordGps_use').is(":checked")
				}, {silent: true}
			);
			self.model.set("status" , status, {silent: true});
			self.model.set("menuActive", $('input#activeMenu').is(":checked"), {silent : true});
			self.model.set("allowMobile", $('input#allowMobile').is(":checked"), {silent : true});
			self.model.set("recordGps", $('input#recordGps_use').is(":checked"), {silent : true});
			self.model.set("syncActive", $('input#activeSync').is(":checked"), {silent : true});
			
			GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
			self.model.save({}, {
				type : 'PUT',
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						GO.router.navigate("ehr/attnd", {trigger: true});
						
					}
				},
				error : function(model, response) {
					$.goMessage(commonLang["저장에 실패 하였습니다."]);
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
				},
			});
		},
		
		cancel : function() {
			this.render();
		},
		
		_activeMobileCheck : function(e) {
			var self = this;
			
			$("input#allowMobile").prop("disabled", false);
			
			// 자율출퇴근제 이용 처리 체크해제
			if(e){
				$("input#useFlexibleTime").prop("checked", false);
			}
			$('#clockInOutContainer').show();
			$('#clockAllNightContainer').show();
		},
		
		_deActiveMobileCheck : function(e) {
			var self = this;
			
			// 모바일 앱 근태 체크 허용 여부 비활성화
			$("input#allowMobile").prop("disabled", true);
			$("input#allowMobile").prop("checked", false);		
			$("#mobileAppEhr").hide();
			$('input#recordGps_unuse').prop("checked", true);
			
			// 자율출퇴근제 이용 처리 체크
			if(e){
				$("input#useFlexibleTime").prop("checked", true);
				$('#clockInOutContainer').hide();
				$('#clockAllNightContainer').hide();
			}
			
		},
		
		_onClickPopupGuideLayer : function(){
			var url = GO.contextRoot + "resources/guide/attnd/start.htm";
			window.open(url,"attndGuide","resizable=yes,scrollbars=yes,width=820,height=700");
		}

	});
	
	return AttndDefault;
});