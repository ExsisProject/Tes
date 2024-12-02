define([
    "backbone",
    "app",
    "attendance/collections/records",
    "attendance/models/record",
    "attendance/models/auth",
    "attendance/views/title",
    "attendance/views/statusPopup",
    "attendance/views/attndInfoPopup",
	"attendance/views/attndDeleteStatusTerm",
    "hgn!attendance/templates/list",
    "hgn!attendance/templates/item",
    "hgn!attendance/templates/toolbar",
    "hgn!attendance/templates/log_item",
    "i18n!nls/commons",
    "i18n!attendance/nls/attendance"
],
function(
    Backbone,
    GO,
    Records,
    Record,
    Auth,
    TitleView,
    StatusPopup,
    AttndInfoPopup,
	AttndDeleteStatusTerm,
    ListTpl,
    ItemTpl,
    ToolbarTpl,
    LogItemTpl,
    commonLang,
    attendanceLang
) {

	var lang = {
			label_confirm : commonLang['확인'],
			label_cancel : commonLang['취소'],
			label_delete : commonLang['삭제'],
			label_status : commonLang['상태'],
			label_select : commonLang['선택'],
			label_contents : commonLang['내용'],
			label_collapse : commonLang['접기'],
			label_expand : commonLang['펼치기'],
			label_manage : commonLang['관리'],
			label_prev : commonLang['이전'],
			label_next : commonLang['다음'],
			label_today : commonLang['오늘'],
			label_attendance : attendanceLang['출근부'],
			label_clockInTime : attendanceLang['출근'],
			label_clockOutTime : attendanceLang['퇴근'],
			label_status : attendanceLang['상태'],
			label_workingTime : attendanceLang['근무시간'],
			label_unconfirm : attendanceLang['미확인'],
			label_completeInTime : attendanceLang['출근완료'],
			label_completeOutTime : attendanceLang['퇴근완료'],
			label_deptManage : attendanceLang['부서별 근태관리'],
			label_compManage : attendanceLang['전사 근태관리'],
			label_attndStatus : attendanceLang['근태현황'],
			label_attndStatistics : attendanceLang['근태통계'],
			label_myAttendance : attendanceLang['내 근태'],
			label_myAttendanceStatus : attendanceLang['내 근태 현황'],
			label_manageAttendance : attendanceLang['근태 관리'],
			label_date : attendanceLang['날짜'],
			label_time : attendanceLang['시간'],
			label_statusDesc : attendanceLang['상태에 대한 간단한 설명을 입력하세요.'],
			label_listDownload : attendanceLang['목록 다운로드'],
			label_normal : attendanceLang['정상'],
			label_late : attendanceLang['지각'],
			label_modify : attendanceLang['수정'],
			label_actionLogs : commonLang['변경이력'],
			label_more : commonLang['더보기'],
            label_attndInfo : attendanceLang['위치 정보'],
			label_allNight : attendanceLang['철야'],
			label_delete_status_term : attendanceLang['상태일괄삭제']
		};
	
    var MyList = Backbone.View.extend({
        events: {
            "click #attndMyList td span.ic_gps": "showAttndInfo",

        	"click #attndMyList td.status" : "addStatus",
        	"click #attndMyList td.status li" : "modifyStatus",
        	
        	"click #attndMyList td.valid" : "addInOut",
        	"click #attndMyList td.go span.none" : "addInOut",
        	"click #attndMyList td.leave span.none" : "addInOut",
        	
        	"click #attndMyList td.go span.time" : "modifyInOut",
        	"click #attndMyList td.leave span.time" : "modifyInOut",
        	"click #prevMonth" : "movePrevMonth",
			"click #nextMonth" : "moveNextMonth",
			"click #todayMonth" : "moveTodayMonth",
			"click #attndCalBtn" : "clickCalendar",
			"click #moveBack" : "moveBack",
			"click #attndMyList th span" : "sortBy",
			"click #attndListDownload" : "listDownload",
			"click #attndStatusDeleteTerm" : "deleteStatusTerm",
			"click #moreLog" : "moreLog"

        },
        initialize: function(options) {
        	this.options = options || {};
        	if(this.options.userid) {
        		//근태그룹에서 넘어온것.
        		this.userid = this.options.userid; 
        	}
        	else {
        		//내근태 현황
        		this.userid = GO_Session.id;
        	}
        	this.month = moment();
        	this.auth = new Auth({userid : this.userid});
        	this.auth.fetch({async : false});
        	this.records = new Records({'month' : this.month, 'userid' : this.userid});
        	this.records.remove(0); //TODO 왜 model하나가 무조건 생길까?
        	this.records.fetch({async : false});
        	this.records.getRecords();
        	this.logs = new Backbone.Collection();
        	this.logs.url = GO.contextRoot + 'api/ehr/attnd/user/'+ this.userid + '/month/' + this.month.format('YYYY-MM') +'/actionlog';
        	this.logs.fetch({async:false});
        	this.userInfo = new Backbone.Model();
        	this.userInfo.url = GO.contextRoot + 'api/user/profile/'+ this.userid;
        	this.userInfo.fetch({async:false});
			this.recordGroup = new Record();
			this.recordGroup.fetch({url: GO.contextRoot + 'api/ehr/attnd/record', async: false});
        	var self = this;
        	GO.EventEmitter.off("attnd", "change:clockInOutStatus");
        	GO.EventEmitter.on("attnd", "change:clockInOutStatus", function(){
        		this.records = new Records({'month' : this.month, 'userid' : this.userid});
        		this.records.fetch({async : false});
            	this.records.getRecords();
            	this.sortRender();
            	this.$el.find("#attendActivityLogs ul.type_simple_list").empty();
            	this.logs.url = GO.contextRoot + 'api/ehr/attnd/user/'+ this.userid + '/month/' + this.month.format('YYYY-MM') +'/actionlog';
            	this.logs.fetch({async:false});
            	this.renderActivityLogs();
        	}, this);
        },
        listDownload : function() {
        	var params = { month : this.month.format('YYYY-MM'), userid : this.userid };
        	window.location.href = GO.contextRoot + "api/ehr/attnd/download/record?" + $.param(params);
        },
		deleteStatusTerm : function() {
			var self = this;
			this.popupEl = $.goPopup({
				header : lang.label_delete_status_term,
				lang : lang,
				modal : true,
				pclass: 'layer_normal layer_go_status',
				contents : "",
				buttons: [{
					btype : 'caution',
					btext : lang.label_delete,
					autoclose : false,
					callback : function() {
						var status = self.popupEl.find('#AttendStatusSelect option:selected');
		                var statusId = status.attr('data-id');
						if(_.isNull(statusId) || _.isUndefined(statusId)){
		                    $.goMessage(attendanceLang['상태를 선택해주세요.']);
		                }else{
		                	self.popupEl.close();
		                	attndDeleteStatusTerm.deleteStatusTermReqest();
		                }
					}
				}, {
					btype : 'close',
					btext : lang.label_cancel,
					autoclose : true,
					callback : function() {
					}
				}]
			});
			var firstDate = this.month.format('YYYY-MM-01');
			var option = {firstDate: this.records.getByLogDate(firstDate), userid: this.userid};
			var attndDeleteStatusTerm = new AttndDeleteStatusTerm(option);

			this.popupEl.find('div.content').html(attndDeleteStatusTerm.render().el);
		},
        moveBack : function() {
        	window.history.back();
        },
        clickCalendar : function() {
        	$("#calendarDatepicker").trigger('focus');
        },
        
        //TODO 개선필요
        sortBy : function(e) {
        	var target = $(e.currentTarget);
        	var property = target.attr('sort-data');
        	var collection = this.records.sortBy(function(model){
        		if(property == "clockInTime" || property == "clockOutTime"){
	        		if(model.get(property) != null){
	        			return model.get(property).split("T")[1];	
	        		}else{
	        			return "";
	        		}
	        	}else{
	        		return model.get(property);
	        	}
        	});
        	
        	if (target.attr('sort-direction') == 'asc') {
        		if (target.closest('th').hasClass('sorting_asc')) {
        			target.closest('th').removeClass('sorting_asc').addClass('sorting_desc');
        		}
        		target.attr('sort-direction', 'desc');
        	} else {
        		if (target.closest('th').hasClass('sorting_desc')) {
        			target.closest('th').removeClass('sorting_desc').addClass('sorting_asc');
        		}
        		target.attr('sort-direction', 'asc');
        	}
        	
        	if (property == 'logDate') { //날짜정렬은 데이터 유무와 관계없이 정렬

        		if (target.attr('sort-direction') == 'desc') {
        			collection.reverse();
        		}
        		this.records.reset(collection);
        	} else {
        		var idItems =[]; //RECORD ID로 정렬 후
            	var noidItems =[];
            	_.each(collection, function(item) {
            		if (item.get('id')) {
            			idItems.push(item);
            		} else {
            			noidItems.push(item);
            		}
            	}, this);
            	
            	var propItems = []; //PROPERTY로 정렬
            	var nopropItems = [];
            	_.each(idItems, function(item) {
            		if (item.get(property)) {
            			propItems.push(item);
            		} else {
            			nopropItems.push(item);
            		}
            	}, this);
            	
            	if (target.attr('sort-direction') == 'desc') {
            		propItems.reverse();
            	}
            	
            	var sortByProp = $.merge(propItems, nopropItems);
            	var sortById = $.merge(sortByProp, noidItems);
            	this.records.reset(sortById);
        	}
        	
        	this.$el.find("#attndMyList tbody").empty();
        	this.renderItems();
        },
        sortRender : function() {
        	var collection = this.records.sortBy(function(model){
      		  return model.get('logDate');
      		});
	      	var cids = _.map(collection, function(item) {
	      		return item.cid;
	      	});
	      	var reverse = [];
        	_.each(cids, function(cid) {
        		reverse.push(_.findWhere(this.records.models, {cid : cid}));
        	}, this);
        	
        	this.records.reset(reverse);
        	this.$el.find("#attndMyList tbody").empty();
        	this.renderItems();
        },
        
        
        initDatePicker : function(){
        	var self = this;
        	$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
        	this.$el.find("#calendarDatepicker").datepicker({
        		dateFormat : "yy-mm-dd",
        		changeMonth: true,
	            changeYear : true, 
	            yearSuffix: "",
        		onSelect : function(selected) {
        			self.month = moment(selected);
        			self.records = new Records({'month' : self.month, 'userid' : self.userid});
        			self.records.remove(0); //TODO 왜 model하나가 무조건 생길까?
        			self.records.fetch({async : false});
        			self.records.getRecords();
        			self.render();
        		}
        	});
			$("#moveBack").hide();
        },
        movePrevMonth : function() {
        	this.month.subtract(1, 'month');
        	this.records = new Records({'month' : this.month, 'userid' : this.userid});
        	this.records.remove(0); //TODO 왜 model하나가 무조건 생길까?
        	this.records.fetch({async : false});
        	this.records.getRecords();
        	this.render();
        	this.logs.url = GO.contextRoot + 'api/ehr/attnd/user/'+ this.userid + '/month/' + this.month.format('YYYY-MM') +'/actionlog';
        	this.logs.fetch({async:false});
        	this.$el.find("#attendActivityLogs ul.type_simple_list").empty();
        	this.renderActivityLogs();
			$("#moveBack").hide();
//        	alert('movePrevMonth');
        },
        moveNextMonth : function() {
        	this.month.add(1, 'month');
        	this.records = new Records({'month' : this.month, 'userid' : this.userid});
        	this.records.remove(0); //TODO 왜 model하나가 무조건 생길까?
        	this.records.fetch({async : false});
        	this.records.getRecords();
        	this.render();
        	this.logs.url = GO.contextRoot + 'api/ehr/attnd/user/'+ this.userid + '/month/' + this.month.format('YYYY-MM') +'/actionlog';
        	this.logs.fetch({async:false});
        	this.$el.find("#attendActivityLogs ul.type_simple_list").empty();
        	this.renderActivityLogs();
			$("#moveBack").hide();
        },
        moveTodayMonth : function() {
        	this.month = moment();
        	this.records = new Records({'month' : this.month, 'userid' : this.userid});
        	this.records.remove(0); //TODO 왜 model하나가 무조건 생길까?
        	this.records.fetch({async : false});
        	this.records.getRecords();
        	this.render();
        	this.logs.url = GO.contextRoot + 'api/ehr/attnd/user/'+ this.userid + '/month/' + this.month.format('YYYY-MM') +'/actionlog';
        	this.logs.fetch({async:false});
        	this.$el.find("#attendActivityLogs ul.type_simple_list").empty();
        	this.renderActivityLogs();
			$("#moveBack").hide();
        },
        
        addInOut : function(e) {
        	var self = this;
        	var target = $(e.currentTarget),
				logDate = target.closest('tr').attr('data-item-date'),
				typeValue = target.closest('td').attr('data-type');
        	if ((target.hasClass('none') || target.find('span').hasClass('none')) && !this.auth.hasTimeEditAuth()) { // 미확인인데 수정 권한이 없고, 오늘이 아닌경우
        		return;
        	}
        	var option = {record : this.records.getByLogDate(logDate), action : 'create', type : 'inout', option : typeValue, userid : this.userid};
        	
        	if (option.record.isAfter() && !option.record.isToday()) { // 미래의 출퇴근은 권한에 상관없이 입력 불가
        		return;
        	}
        	if (typeValue == 'in' && option.record.getUserClockInTime() || 0) { //출퇴근 시간이 있는 경우에는 추가하지 못함.
        		return;
        	}
        	if (typeValue == 'out' && option.record.getUserClockOutTime() || 0) { //출퇴근 시간이 있는 경우에는 추가하지 못함.
        		return;
        	}
        	var header = typeValue == 'in' ? lang.label_clockInTime : lang.label_clockOutTime;

			this.popupEl = $.goPopup({
				header : header,
				lang : lang,
				modal : true,
				pclass: 'layer_normal layer_go_status',
				contents : "",
				buttons: [{
					btype : 'confirm',
					btext : lang.label_confirm,
					autoclose : false,
					callback : function() {
						statusPopup.addInOut();
						self.popupEl.close();
					}
				}, {
					btype : 'close',
					btext : lang.label_cancel,
					autoclose : true,
					callback : function() {
					}
					
				}]
			});

			var statusPopup = new StatusPopup(option);
			this.popupEl.find('div.content').html(statusPopup.render().el);
        },
        modifyInOut : function(e) {
        	e.stopPropagation();
        	if (!this.auth.hasTimeEditAuth()) { //수정권한이 없는 경우 수정 불가
        		return;
        	}
        	var self = this;
        	var target = $(e.currentTarget),
				logDate = target.closest('tr').attr('data-item-date'),
				statusId = target.attr('status-id'),
				typeValue = target.closest('td').attr('data-type');
			if(target.attr('data-type') == 'allNight') {
				//철야 선택시 퇴근으로 설정
				typeValue = 'out';
			}

			var option = {record : this.records.getByLogDate(logDate), action : 'modify', type : 'inout', option : typeValue, userid : this.userid, recordGroup : this.recordGroup};
			var header = typeValue == 'in' ? lang.label_clockInTime : lang.label_clockOutTime;
			this.popupEl = $.goPopup({
				header : header,
				lang : lang,
				modal : true,
				pclass: 'layer_normal layer_go_status',
				contents : "",
				buttons: [{
					btype : 'confirm',
					btext : lang.label_confirm,
					autoclose : false,
					callback : function() {
						statusPopup.modifyInOut();
						self.popupEl.close();
					}
				}, {
					btype : 'caution',
					btext : lang.label_delete,
					autoclose : true,
					callback : function() {
						statusPopup.deleteInOut();
						self.popupEl.close();
					}
				}, {
					btype : 'close',
					btext : lang.label_cancel,
					autoclose : true,
					callback : function() {
					}
					
				}]
			});
			var statusPopup = new StatusPopup(option);
			this.popupEl.find('div.content').html(statusPopup.render().el);
			
        },
        addStatus : function(e) {
        	if (!this.auth.hasStatusEditAuth()) { //수정 권한이 없으면 입력불가
        		return;
        	}
        	var self = this;
			this.popupEl = $.goPopup({
				header : lang.label_status,
				lang : lang,
				modal : true,
				pclass: 'layer_normal layer_go_status',
				contents : "",
				buttons: [{
					btype : 'confirm',
					btext : lang.label_confirm,
					autoclose : false,
					callback : function() {
						statusPopup.addStatus();
						self.popupEl.close();
					}
				}, {
					btype : 'close',
					btext : lang.label_cancel,
					autoclose : true,
					callback : function() {
					}
					
				}]
			});
			var logDate = $(e.currentTarget).closest('tr').attr('data-item-date');
    		var option = {record : this.records.getByLogDate(logDate), action : 'create', type : 'status', userid : this.userid, recordGroup : this.recordGroup};
			var statusPopup = new StatusPopup(option);

			this.popupEl.find('div.content').html(statusPopup.render().el);
        },
        modifyStatus : function(e) {
        	e.stopPropagation();
        	if (!this.auth.hasStatusEditAuth()) { //수정 권한이 없으면 수정불가
        		return;
        	}
        	
			var self = this;
			var target = $(e.currentTarget),
				logDate = target.closest('tr').attr('data-item-date'),
				statusId = target.attr('status-id'),
				dataId = target.attr('data-id');
			if(target.attr('data-type') == 'allNight'){
				//철야일 경우 퇴근 수정을 뛰워 준다
				this.modifyInOut(e);
				return;
			}
						
			var option = {record : this.records.getByLogDate(logDate), action : 'modify', type : 'status', option : dataId, userid : this.userid, recordGroup : this.recordGroup};
			var statusPopup = new StatusPopup(option);
			
			this.popupEl = $.goPopup({
				header : lang.label_status,
				lang : lang,
				modal : true,
				pclass: 'layer_normal layer_go_status',
				contents : "",
				buttons: [{
					btype : 'confirm',
					btext : lang.label_confirm,
					autoclose : false,
					callback : function() {
						statusPopup.modifyStatus();
						self.popupEl.close();
					}
				}, {
					btype : 'caution',
					
					btext : lang.label_delete,
					autoclose : true,
					callback : function() {
						statusPopup.deleteStatus();
						self.popupEl.close();
					}
				}, {
					btype : 'close',
					btext : lang.label_cancel,
					autoclose : true,
					callback : function() {
					}
				}]
			});
			
			this.popupEl.find('div.content').html(statusPopup.render().el);
		},

        showAttndInfo : function(e) {
            e.stopPropagation();

            var target = $(e.currentTarget),
                logDate = target.closest('tr').attr('data-item-date'),
                statusType = target.closest('td').attr('data-type');

            var option = {record: this.records.getByLogDate(logDate) , action : 'attndinfo', option : statusType};
            var attndInfoPopup = new AttndInfoPopup(option);

            this.popupEl = $.goPopup({
                header : lang.label_attndInfo,
                lang : lang,
                modal : true,
                width: 304,
                pclass: 'layer_normal layer_attend_gps',
                contents : "",
                buttons: [{
                    btype : 'confirm',
                    btext : lang.label_confirm,
                    autoclose : true,
                    callback : function() {
                    }
                }]
            });

            this.popupEl.find('div.content').html(attndInfoPopup.render().el);
        },

        render: function() {
            this.$el.html(ListTpl({
            	lang : lang
            }));
            var titleView = new TitleView();
            this.$el.find('header.content_top').html(titleView.render("근태현황").el);
            this.renderHeader();
            this.initDatePicker();
            this.renderActivityLogs();
            this.sortRender();
			$("body").trigger("ehr.myListRender");
            return this;
        },
        renderHeader : function() {
        	var tpl = ToolbarTpl({
        		lang : lang,
            	month : this.month.format('YYYY.MM'),
				isDeleteStatus : this.auth.hasStatusEditAuth(),
            	isManage : this.options.userid ||0 ? true : false,
            	name : this.userInfo.get('name'),
            	info : this.userInfo.get('deptMembers')[0]
            });
        	this.$el.find('section#attndToolbar').html(tpl);
        },
        renderItems : function() {
        	var self = this;
        	this.records.each(function (record) {
        		self.$el.find('#attndMyList tbody').append(ItemTpl({
        			lang : lang,
        			record : record,
        			hasTimeEditAuth : self.auth.hasTimeEditAuth(),
        			hasStatusEditAuth : self.auth.hasStatusEditAuth(),
                	isHoliday : record.isHoliday(),
                	isClockInTimeEdited : record.isClockInTimeEdited(),
                	isClockOutTimeEdited : record.isClockOutTimeEdited(),
                	isLate : record.isLate(),
                	isBefore : record.isBefore(),
                	isAfter : record.isAfter(),
                	hasDateStatus : record.hasDateStatus(),
                	isToday : record.isToday(),
                	isSunday : record.isSunday(),
                	isSatday : record.isSatday(),
                	isDayOff : record.isDayOff(),
                	workingTime : record.getUserWorkingTime(),
                	formattedLogDate : record.getLogDateMMddDD(),
                	logDate : record.getLogDate(),
                	userClockInTime : record.getUserClockInTime(),
                	userClockOutTime : record.getUserClockOutTime(),
                	hasUserClockInTime : record.hasUserClockInTime(),
                	hasUserClockOutTime : record.hasUserClockOutTime(),
					isUseGPS : GO.config('mobileConfig').useAttndRecordGps,
                	hasId : record.hasId(),
                	statuses : function() {
                		var statuses = record.getStatuses();
                		_.each(statuses, function(status, index, list) {
                			if (status.companyStatus.type == "time") {
                				status.formattedTime = moment(status.startDate).zone(status.startDate).format('HH:mm') + '~' + moment(status.endDate).zone(status.startDate).format('HH:mm'); 
                			}
                			if (index == list.length-1) {
                				status.isLast = true;
                			}
                		}, this);
                		return statuses;
                	}
                }));
        	 });
        },
        
        renderActivityLogs : function() {
        	var self = this;
        	this.$el.find('header.single_title span.num').text(this.logs.page.total);
        	_.each(this.logs.models, function(log){
        		var tpl = LogItemTpl({
    				lang : lang,
    				log : log.toJSON(),
    				messages : log.get('message').split("\n"),
    				date : GO.util.basicDate(log.get('createdAt'))
    			});
        		this.$el.find('section#attendActivityLogs ul.type_simple_list').append(tpl);
        	}, this);
        	if (this.isEnd()) {
        		this.$el.find("#moreLog").hide();
        	} else {
        		this.$el.find("#moreLog").show();
        	}
			if(this.logs.models.length == 0){
				this.$el.find("#attendActivityLogs").hide();
			}else{
				this.$el.find("#attendActivityLogs").show();
			}
        },
        
        moreLog : function(e) {
        	var self = this;
			var page = this.logs.page.page + 1;
			this.logs.url = GO.contextRoot + 'api/ehr/attnd/user/'+ this.userid + '/month/' + this.month.format('YYYY-MM') +'/actionlog?' + $.param({page : page});
			this.logs.fetch({
				success : function(resp) {
					self.renderActivityLogs();
				} 
			});
        },
        isEnd : function() {
			return this.$el.find("#attendActivityLogs").find("li").length == this.logs.page.total;
		}
    });
    return MyList;

});