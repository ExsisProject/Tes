define([
    "jquery",
    "backbone",     
    "app",
    "hgn!admin/templates/attnd_group_create",
    "hgn!admin/templates/attnd_group_modify",
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
    AttndCreateTmpl,
    AttndModifyTmpl,
    CircleView,
    commonLang,
    adminLang
    
) {
    var tmplVal = {
    		//TODO 다국어처리
		label_ok : commonLang['저장'],
		label_cancel : commonLang['취소'],
		label_edit : commonLang['수정'],
		label_defaultSetting : adminLang['기본 설정'],
		label_groupName : adminLang['그룹명'],
		label_groupDesc : adminLang['설명'],
		
		label_use : adminLang['사용'],
	    label_unuse : adminLang['사용안함'],
	    label_mobileapp : adminLang['모바일 앱'],
	    label_allow_mobile : adminLang['근태체크 허용 여부'],
	    label_mobile_app_ehr : adminLang['모바일 앱 근태'],
	    label_record_gps : adminLang['GPS 기록'],
	    label_webservice : adminLang["웹 서비스"],
	    label_gps_desc : adminLang['GPS 기록 설명'],
		
		
		label_clockInOutTime : adminLang['출퇴근 시간'],
	    label_clockInTime : adminLang['출근 시간'],
	    label_clockOutTime : adminLang['퇴근 시간'],
	    label_attendanceStatus : adminLang['근태 상태'],
	    label_addAttendanceStatus : adminLang['추가'],
	    
	    label_useFreeInOut : adminLang['자율 출퇴근제 이용'],
	    label_applyPeriod : adminLang['적용 기간'],
	    label_settingPeriod : adminLang['기간 설정'],
	    	
	    label_attendanceSetting : adminLang['근태자 설정'],
	    label_excludeClass : adminLang['근태 클래스 추가'],
	    label_selectClass : adminLang['클래스 선택'],
	    label_addExceptionClass : adminLang['예외 클래스 추가'],
		label_flexibleTime_desc : adminLang['*시간 설정 없이 자유롭게 체크할 수 있습니다.'],
		label_day_after : adminLang['익일'],
		label_until : adminLang['까지'],
		label_all_night_time : adminLang['철야퇴근 시간'],
		label_all_night_desc : adminLang['*철야 퇴근시간 설명']
    };
    var AttndGroup = Backbone.View.extend({
    	accessUserView: null,
		exceptionUserView: null,
		el : '#layoutContent',
        initialize : function(options) {
            var pathSplit = GO.router.getUrl().split('/');
            var id = pathSplit[_.indexOf(pathSplit, 'group') + 1];
            this.groupId = id == 'create' ? '' : id;
        	this.$el.off();
        },
        
        events : {
        	"click #submit" : "submit",
			"click #cancel" : "cancel",
			"change #useFlexibleTime" : "useFlexibleTime",
			"click input[name='allowMobile']" : "changeAllowMobile"
        },
        render : function() {
            if(this.groupId && this.groupId != 'create') {
            	this.model = new Backbone.Model({});
            	this.model.fetch({
            		url : GO.contextRoot + "ad/api/ehr/attnd/group/" + this.groupId,
                	async : false
                });
            	this.$el.html(AttndModifyTmpl({
            		lang : tmplVal,
            		data : this.model.toJSON()
                }));
            	this.renderInOutAllNightTime();
            }
            else {
            	this.model = new Backbone.Model();
            	this.$el.html(AttndCreateTmpl({
                    lang : tmplVal
                }));
            }
            if($("#allowMobile").is(":checked")) {	//모바일 앱 사용이면
            	$("#mobileAppEhr").show();
            } else {
            	$("#mobileAppEhr").hide();
            	$('input#recordGps_unuse').attr("checked", true);
            }
            this.renderPeriod();
            this.renderAccessUserView();
			this.renderExceptionUserView();
			if (this.model.get('useFlexibleTime')) {
        		this.$el.find('#clockInOutContainer').hide();
				this.$el.find('#clockAllNightContainer').hide();
        	}
        },
		
        renderPeriod: function() {
        	$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] ); 
        	
        	if (this.groupId) {
        		$("#startDate").val(this.model.get('startDate'));
        		$("#endDate").val(this.model.get('endDate'));
        	} else {
        		$("#startDate").val(GO.util.now().format("YYYY-MM-DD"));
        		$("#endDate").val(GO.util.now().format("YYYY-MM-DD"));
        	}
        	
        	
			$('#startDate').datepicker({ 
	            dateFormat: "yy-mm-dd",
	            changeMonth: true,
	            changeYear: true,
	            yearSuffix: "",
	            onSelect : function(selectedDate){
	            	$('#startDate').val(selectedDate);
	            }
	        });

			this.$el.find('#endDate').datepicker({
	            dateFormat: "yy-mm-dd", 
	            changeMonth: true,
	            changeYear: true,
	            yearSuffix: "",
	            onSelect : function(selectedDate){
	            	$('#endDate').val(selectedDate);
	            }
	        });
        },
		renderInOutAllNightTime: function() {
        	var inTime = this.model.get('clockInTime'); 
        	var outTime = this.model.get('clockOutTime');
			var allNightTime = this.model.get('clockAllNightTime');
        	
        	this.$el.find('#inTimeHour').val(inTime.split(':')[0]);
        	this.$el.find('#inTimeMin').val(inTime.split(':')[1]);
        	this.$el.find('#inTimeSec').val(inTime.split(':')[2]);
        	
        	this.$el.find('#outTimeHour').val(outTime.split(':')[0]);
        	this.$el.find('#outTimeMin').val(outTime.split(':')[1]);
        	this.$el.find('#outTimeSec').val(outTime.split(':')[2]);

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
                circleJSON: this.model.get('accessTarget'),
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
                circleJSON: this.model.get('exceptionTarget'),
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
		
		submit : function(e) {
			var self = this;
			var sec = 60;
			
			$('span.go_alert').text("");
			if (!$.goValidation.isCheckLength(2, 64, $('#groupName').val())){
				$('#groupNameValidate').text(GO.i18n(adminLang['제목은 0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
				return;
			}
			
			if (!$.goValidation.isCheckLength(0, 255, $('#groupDesc').val())){
				$('#groupDescValidate').text(GO.i18n(adminLang['설명은 255자 이하 입력 가능합니다.'], {"arg1":"255"}));
				return;
			}
			
			var inTimeForSec = parseInt($('#inTimeHour').val()) * sec * sec + parseInt($('#inTimeMin').val()) * sec + parseInt($('#inTimeSec').val());
			var outTimeForSec = parseInt($('#outTimeHour').val()) * sec * sec + parseInt($('#outTimeMin').val()) * sec + parseInt($('#outTimeSec').val());
			var allNightTimeForSec = parseInt($('#allNightTimeHour').val()) * sec * sec + parseInt($('#allNightTimeMin').val()) * sec + parseInt($('#allNightTimeSec').val());

			if( inTimeForSec < allNightTimeForSec ) {
				$.goAlert(adminLang["철야퇴근 시간은 익일 출근시간을 넘길수 없습니다."]);
				// $('#inOutValidate').text(adminLang["철야퇴근 시간은 출근시간 이전일 수 없습니다."]);
				return;
			}

			if(!$('#useFlexibleTime').is(":checked") && inTimeForSec >= outTimeForSec){
				$('#inOutValidate').text(adminLang["퇴근 시간이 출근 시간보다 이전일 수 없습니다."]);
				return; 
			}
			
			if($('#usePeriodSetting').is(":checked") && !GO.util.isAfterOrSameDate($('#startDate').val(), $('#endDate').val())){
				$('#periodValidate').text(adminLang["시작일이 종료일보다 이전일 수 없습니다."]);
				return;
			}
			
			var clockInTime = $('#inTimeHour').val() + ':' + $('#inTimeMin').val() + ':' + $('#inTimeSec').val();
			var clockOutTime = $('#outTimeHour').val() + ':' + $('#outTimeMin').val() + ':' + $('#outTimeSec').val();
			var clockAllNightTime = $('#allNightTimeHour').val() + ':' + $('#allNightTimeMin').val() + ':' + $('#allNightTimeSec').val();
			var startDate = $('#startDate').val();
			var endDate = $('#endDate').val();
				
//			self.model.set("workDay", JSON.stringify({'Mon' : $('#labelMon').is(':checked'), 'Tue' : $('#labelTue').is(':checked'), 'Wed' : $('#labelWed').is(':checked'), 'Thu' : $('#labelThu').is(':checked'), 'Fri' : $('#labelFri').is(':checked'), 'Sat' : $('#labelSat').is(':checked'), 'Sun' : $('#labelSun').is(':checked')}), {silent: true});
//			self.model.set("group", {useFlexibleTime : $('#useFlexibleTime').is(':checked'), accessSetting : $('#selectAccessPolicy input[type=radio]:checked').val(), clockInTime : clockInTime, clockOutTime : clockOutTime, accessTarget : this.accessUserView.getData(), exceptionTarget : this.exceptionUserView.getData()}, {silent: true});
//			self.model.set("status" , status, {silent: true});
			self.model.set({"id" : $('#attndGroupSetting').attr('data-id'),"name" : $('#groupName').val(),"description" : $('#groupDesc').val(), "useFlexibleTime" : $('#useFlexibleTime').is(':checked'), "usePeriodSetting" : $('#usePeriodSetting').is(':checked'), "startDate" : startDate, "endDate" : endDate, "accessTarget" : this.accessUserView.getData(), "exceptionTarget" : this.exceptionUserView.getData(), "clockInTime" : clockInTime, "clockOutTime" : clockOutTime, "clockAllNightTime" : clockAllNightTime, "sortOrder" : ""}, {silent: true});

			self.model.set("allowMobile", $('input#allowMobile').is(":checked"), {silent : true});
			self.model.set("recordGps", $('input#recordGps_use').is(":checked"), {silent : true});
			
			GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
			var params = self.groupId ? '/' + self.groupId : '';
			self.model.url = GO.contextRoot + "ad/api/ehr/attnd/group" + params; 
			self.model.save({}, {
				type : self.groupId ? 'PUT' : 'POST',
				success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						
//						self.render();
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						GO.router.navigate('ehr/group/list', true);
					}
				},
				error : function(model, response) {
					$.goMessage(commonLang["저장에 실패 하였습니다."]);
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
				}
			});
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
		
		cancel : function() {
			this.render();
		}
	});
	
	return AttndGroup;
});