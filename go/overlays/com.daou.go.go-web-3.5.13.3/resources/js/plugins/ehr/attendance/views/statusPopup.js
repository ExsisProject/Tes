define([
        "backbone",
        "hgn!attendance/templates/popup",
        "hgn!attendance/templates/popup_content",
        "attendance/collections/companyStatuses",
        "i18n!nls/commons",
        "i18n!attendance/nls/attendance",
        "app"
    ],

    function(
        Backbone,
        PopupTpl,
        PopupContentTpl,
        CompanyStatuses,
        commonLang,
        attendanceLang,
        GO
    ) {
        var lang = {
            label_confirm: commonLang['확인'],
            label_cancel: commonLang['취소'],
            label_status: commonLang['상태'],
            label_select: commonLang['선택'],
            label_contents: commonLang['내용'],
            label_date: attendanceLang['날짜'],
            label_time: attendanceLang['시간'],
            label_statusDesc: attendanceLang['상태에 대한 간단한 설명을 입력하세요.'],
            label_clockInTime: attendanceLang['출근'],
            label_clockOutTime: attendanceLang['퇴근'],
            label_useAllNight: attendanceLang['철야']
        };

        var PopupView = GO.BaseView.extend({
            tagName: 'table',
            className: 'form_type go_form_basic',
            events: {
                "change #AttendStatusSelect": "changeStatus",
                "change #useAllNight": "changeUseAllNight"
            },
            initialize: function(params) {
                if (params || 0) {
                    this.record = params.record; //
                    this.action = params.action; // 'create', 'modify'
                    this.type = params.type; // 'status', 'inout'
                    this.option = params.option; // ex: statusId 값, in, out 
                    this.userid = params.userid;
                    this.useFlexibleTime = true;
                    if(params.recordGroup != null){
                        this.useFlexibleTime = params.recordGroup.useFlexibleTime();
                    }
                }
                this.companyStatuses = new CompanyStatuses();
                this.companyStatuses.fetch({
                    async: false
                });
            },
            render: function() {
                var tpl = PopupTpl({
                    id: this.option,
                    date: moment(this.record.getLogDate()).format('YYYY-MM-DD[(]dd[)]'),
                    logDate : moment(this.record.getLogDate()).format('YYYY-MM-DD'),
                    status: this.companyStatuses.toJSON(),
                    isStatusType: this.type == 'status',
                    isIn: this.option == 'in',
                    isOut: this.option == 'out',
                    isAllNight: this.record.isUseAllNight(),
                    useFlexibleTime : this.useFlexibleTime,
                    lang: lang
                });
                this.$el.html(tpl);
                this.changeUseAllNight(null);
                if (this.action == 'modify') {
                    this.databind(); // 데이터 선택
                }
                return this;
            },
            databind: function() {
                if (this.type == 'status') {
                    var statusType = this.record.getStatusById(this.option).companyStatus.type;
                    var statusId = this.record.getStatusById(this.option).companyStatus.id;
                    var selected = this.$el.find('#AttendStatusSelect option[data-id=' + statusId + ']').attr('selected', true);
                    this.renderOption(statusType);
                    this.$el.find('#statusContent').text(this.record.getStatusById(this.option).memo);
                } else if (this.type == 'inout') {
                    if (this.option == 'in') {
                        var time = moment(this.record.getUserClockInTime(), 'HH:mm:ss');
                        this.$el.find('#InOutSelectHour option[value=' + time.format('HH') + ']').attr('selected', true);
                        this.$el.find('#InOutSelectMin option[value=' + time.format('mm') + ']').attr('selected', true);
                        this.$el.find('#InOutSelectSec option[value=' + time.format('ss') + ']').attr('selected', true);
                    } else {
                        var time = moment(this.record.getUserClockOutTime(), 'HH:mm:ss');
                        this.$el.find('#InOutSelectHour option[value=' + time.format('HH') + ']').attr('selected', true);
                        this.$el.find('#InOutSelectMin option[value=' + time.format('mm') + ']').attr('selected', true);
                        this.$el.find('#InOutSelectSec option[value=' + time.format('ss') + ']').attr('selected', true);
                    }
                }
            },
            renderOption: function(statusType) {
                var self = this;
                var tpl = PopupContentTpl({
                    lang: lang,
                    isCreate: this.action == 'create',
                    isModify: this.action == 'modify',
                    isDateType: function() {
                        return statusType == 'date';
                    },
                    isTimeType: function() {
                        return statusType == 'time';
                    }
                });
                this.$el.find('#StatusOptionBox').html(tpl);
                if (this.action == 'modify') {
                    if (statusType == 'date') {
                        this.$el.find("#startDate").val(moment(this.record.getLogDate()).format('YYYY-MM-DD'));
                    } else {
                        var startDate = this.record.getStatusById(this.option).startDate;
                        var endDate = this.record.getStatusById(this.option).endDate;
                        var startTimeHour = moment(startDate).zone(startDate).format('HH');
                        var startTimeMin = moment(startDate).zone(startDate).format('mm');
                        var endTimeHour = moment(endDate).zone(endDate).format('HH');
                        var endTimeMin = moment(endDate).zone(endDate).format('mm');

                        this.$el.find('#startTimeHour option[value=' + startTimeHour + ']').attr('selected', true);
                        this.$el.find('#startTimeMin option[value=' + startTimeMin + ']').attr('selected', true);
                        this.$el.find('#endTimeHour option[value=' + endTimeHour + ']').attr('selected', true);
                        this.$el.find('#endTimeMin option[value=' + endTimeMin + ']').attr('selected', true);
                    }
                } else if (this.action == 'create') {
                    $("#startDate").val(moment(this.record.getLogDate()).format('YYYY-MM-DD'));
                    $("#endDate").val(moment(this.record.getLogDate()).format('YYYY-MM-DD'));
                    $("#startTimeHour").val(GO.util.now().format("HH"));
                    $("#endTimeHour").val(GO.util.now().add(1, 'hours').format('HH'));
                }

                this.$el.find('#startDate').datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    yearSuffix: "",
                    onSelect: function(selectedDate) {
                        $('#startDate').val(selectedDate);
                    }
                });

                this.$el.find('#endDate').datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    yearSuffix: "",
                    onSelect: function(selectedDate) {
                        $('#endDate').val(selectedDate);
                    }
                });
            },
            changeStatus: function(e) {
                var self = this;
                var type = $(e.currentTarget).find('option:selected').attr('data-type');


                this.renderOption(type);
            },

            changeUseAllNight: function(e) {
                var self = this;
                var date = moment(this.$el.find('#popupTitle').attr("data-log-date"));
                if(this.$el.find('#useAllNight').is(":checked")){
                    date.add(1, 'day');
                }
                this.$el.find('#popupTitle').html(date.format('YYYY-MM-DD[(]dd[)]'));
            },

            addInOut: function() {
                var record = this.record; //
                var action = this.action; // 'create', 'modify'
                var type = this.type; // 'status', 'inout'
                var option = this.option; // ex: statusId 값, in, out


                if (option == 'in') {
                    record.setClockInTime(this.$el.find('#InOutSelectHour').val(), this.$el.find('#InOutSelectMin').val(), this.$el.find('#InOutSelectSec').val());
                } else if (option == 'out') {
                    record.setClockOutTime(this.$el.find('#InOutSelectHour').val(), this.$el.find('#InOutSelectMin').val(), this.$el.find('#InOutSelectSec').val(), this.$el.find('#useAllNight').is(":checked"));
                }
                record.url = GO.contextRoot + 'api/ehr/attnd/user/' + this.userid + '/record/' + record.id;
                record.save({}, {
                    type: 'PUT',
                    async: false,
                    success: function(model, response) {
                        if (response.code == '200') {
                            $.goMessage(commonLang["저장되었습니다."]);
                            GO.EventEmitter.trigger("attnd", "change:clockInOutStatus");
                            GO.EventEmitter.trigger("attnd", "change:clockInOutStatusSide");
                        }
                    },
                    error: function(model, response) {
                    	if(response.status == 403){
                            $.goMessage(commonLang['권한이 없습니다.']);
                    	} else {
                    		$.goMessage(response.responseJSON.message);
                    		if(option == 'in'){
                    		    record.set('clockInTime', undefined);
                    		}else if(option == 'out'){
                    		    record.set('clockOutTime', undefined);
                    		}
                    	}
                    }
                });
            },

            modifyInOut: function() {
                var record = this.record; //
                var action = this.action; // 'create', 'modify'
                var type = this.type; // 'status', 'inout'
                var option = this.option; // ex: statusId 값, in, out
                var time = moment(this.record.getLogDate()).set('hour',this.$el.find('#InOutSelectHour').val()).set('minute', this.$el.find('#InOutSelectMin').val()).set('seconds', this.$el.find('#InOutSelectSec').val());

                if (option == 'in') {
                	if (time.isAfter(moment(record.get('clockOutTime')))) {
                		$.goMessage(attendanceLang["출근시간은 퇴근시간보다 늦을 수 없습니다."]);
                		return;
                	}
                    record.setClockInTime(this.$el.find('#InOutSelectHour').val(), this.$el.find('#InOutSelectMin').val(), this.$el.find('#InOutSelectSec').val());
                } else if (option == 'out') {
                	if (time.isBefore(moment(record.get('clockInTime'))) && !this.$el.find('#useAllNight').is(":checked")) {
                		$.goMessage(attendanceLang["퇴근시간은 출근시간보다 빠를 수 없습니다."]);
                		return;
                	}
                    record.setClockOutTime(this.$el.find('#InOutSelectHour').val(), this.$el.find('#InOutSelectMin').val(), this.$el.find('#InOutSelectSec').val(), this.$el.find('#useAllNight').is(":checked"));
                }
                record.url = GO.contextRoot + 'api/ehr/attnd/user/' + this.userid + '/record/' + record.id;
                record.save({}, {
                    type: 'PUT',
                    async: false,
                    success: function(model, response) {
                        if (response.code == '200') {
                            $.goMessage(commonLang["저장되었습니다."]);
                            GO.EventEmitter.trigger("attnd", "change:clockInOutStatus");
                            GO.EventEmitter.trigger("attnd", "change:clockInOutStatusSide");
                        }
                    },
                    error: function(model, response) {
                    	if(response.status == 403){
                            $.goMessage(commonLang['권한이 없습니다.']);
                    	} else {
                    		$.goMessage(response.responseJSON.message);	
                    	}
                    }
                });
            },
            deleteInOut: function() {
            	var record = this.record; //
                var action = this.action; // 'create', 'modify'
                var type = this.type; // 'status', 'inout'
                var option = this.option; // ex: statusId 값, in, out
                if (option == 'in') {
                    record.set('clockInTime', null);
                } else if (option == 'out') {
                	record.set('clockOutTime', null);
                    record.set('useAllNight', false);
                }
                record.url = GO.contextRoot + 'api/ehr/attnd/user/' + this.userid + '/record/' + record.id;
                record.save({}, 
	            {
	                type : 'PUT',
	                async: false,
	                success : function(model, resp) {
						if(resp.code == '200') {
							$.goMessage(commonLang['삭제되었습니다.']);
							GO.EventEmitter.trigger("attnd", "change:clockInOutStatus");
							GO.EventEmitter.trigger("attnd", "change:clockInOutStatusSide");
						}
	                },
	                error: function(model, response) {
	                	if(response.status == 403){
                            $.goMessage(commonLang['권한이 없습니다.']);
                    	} else {
                    		$.goMessage(response.responseJSON.message);	
                    	}
	                }
	            });
            },
            
            addStatus : function() {
            	var model = new Backbone.Model();
				var status = this.$el.find('#AttendStatusSelect option:selected')
				var statusType = status.attr('data-type'); //DATE, TIME, ''
				var statusId = status.attr('data-id'); //1 , 2 , ''
				var statusName = status.val(); //휴가, 외근, ''
				if (!statusType || 0) {
					$.goMessage('상태를 선택해주세요.');
					return;
				}
				
				if (statusType == 'date') {
					model.set('startDate', GO.util.toISO8601(moment(this.$el.find('#startDate').val(), 'YYYY-MM-DD')), {silent:true});
					model.set('endDate', GO.util.toISO8601(moment(this.$el.find('#endDate').val(), 'YYYY-MM-DD')), {silent:true});
					
				} else { //'TIME'
					var date = moment(this.$el.find('#popupTitle').attr("data-log-date")); //TODO 팝업타이틀의 LOGDATE 값 가져와서 MOMENT 객체로 만들기
					model.set('startDate', GO.util.toISO8601(date.hour(this.$el.find('#startTimeHour option:selected').val()).minute(this.$el.find('#startTimeMin option:selected').val())), {silent:true});
					model.set('endDate', GO.util.toISO8601(date.hour(this.$el.find('#endTimeHour option:selected').val()).minute(this.$el.find('#endTimeMin option:selected').val())), {silent:true});
				}
				model.set('companyStatus', {'name' : statusName , 'type' : statusType, 'id' : statusId }, {silent:true});
				model.set('memo', this.$el.find('#statusContent').val(), {silent:true});
				
				if(model.get("memo").length > 255){
				    $.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."],{arg1 : 255}));
				    return;
				}
				
				model.url = GO.contextRoot + 'api/ehr/attnd/user/'+ this.userid + '/status';
				model.save({}, {
					type : 'POST',
					async: false,
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							GO.EventEmitter.trigger("attnd", "change:clockInOutStatus");
						}
					},
					error : function(model, response) {
						if(response.status == 403){
                            $.goMessage(commonLang['권한이 없습니다.']);
                    	} else {
                    		$.goMessage(response.responseJSON.message);	
                    	}
					}
				});            	
            },
            
            modifyStatus : function(listView) {
            	var self = this;
            	var listView = listView;
            	var record = this.record; //
                var action = this.action; // 'create', 'modify'
                var type = this.type; // 'status', 'inout'
                var option = this.option; // ex: statusId 값, in, out
                
            	var model = new Backbone.Model();
            	var status = this.$el.find('#AttendStatusSelect option:selected')
				var statusType = status.attr('data-type'); //DATE, TIME, ''
				var statusId = status.attr('data-id'); //1 , 2 , ''
				var statusName = status.val(); //휴가, 외근, ''
				if (!statusType || 0) {
					$.goMessage('상태를 선택해주세요.');
					return;
				}
				
				if (statusType == 'date') {
					model.set('startDate', GO.util.toISO8601(moment(this.$el.find('#startDate').val(), 'YYYY-MM-DD')), {silent:true});
					model.set('endDate', GO.util.toISO8601(moment(this.$el.find('#startDate').val(), 'YYYY-MM-DD')), {silent:true});
				} else { //'TIME'
					var date = moment(this.$el.find('#popupTitle').attr("data-log-date")); //TODO 팝업타이틀의 LOGDATE 값 가져와서 MOMENT 객체로 만들기
					model.set('startDate', GO.util.toISO8601(date.hour(this.$el.find('#startTimeHour option:selected').val()).minute(this.$el.find('#startTimeMin option:selected').val())), {silent:true});
					model.set('endDate', GO.util.toISO8601(date.hour(this.$el.find('#endTimeHour option:selected').val()).minute(this.$el.find('#endTimeMin option:selected').val())), {silent:true});
				}
				model.set('companyStatus', {'name' : statusName , 'type' : statusType, 'id' : statusId }, {silent:true});
				model.set('memo', this.$el.find('#statusContent').val(), {silent:true});
				
                if(model.get("memo").length > 255){
                    $.goError(GO.i18n(commonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."],{arg1 : 255}));
                    return;
                }
				
				model.url = GO.contextRoot + 'api/ehr/attnd/user/' + this.userid +'/status/'+ option;
				model.save({}, {
					type : 'PUT',
					async: false,
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							GO.EventEmitter.trigger("attnd", "change:clockInOutStatus");
						}
					},
					error : function(model, response) {
						if(response.status == 403){
                            $.goMessage(commonLang['권한이 없습니다.']);
                    	} else {
                    		$.goMessage(response.responseJSON.message);	
                    	}
					}
				});
            },
            
            deleteStatus : function() {
            	var record = this.record; //
                var action = this.action; // 'create', 'modify'
                var type = this.type; // 'status', 'inout'
                var option = this.option; // ex: statusId 값, in, out
            	var model = new Backbone.Model();
				model.url = GO.contextRoot + 'api/ehr/attnd/user/' + this.userid +'/status/' + option;
				model.save({}, 
	            {
	                type : 'DELETE',
	                async: false,
	                success : function(model, resp) {
						if(resp.code == '200') {
							$.goMessage(commonLang['삭제되었습니다.']);
							GO.EventEmitter.trigger("attnd", "change:clockInOutStatus");
						}
	                },
	                error : function(model, response) {
	                	if(response.status == 403){
                            $.goMessage(commonLang['권한이 없습니다.']);
                    	} else {
                    		$.goMessage(response.responseJSON.message);	
                    	}
	                }
	            });
            }
        });

        return PopupView;
    });