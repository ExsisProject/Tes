(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "hgn!admin/templates/list_empty",
	    "hgn!admin/templates/calendar_holiday_list",
	    "hgn!admin/templates/calendar_holiday_create",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "i18n!calendar/nls/calendar",
	    "jquery.go-validation",
	    "jquery.go-popup",
	    "jquery.go-sdk",
	    "jquery.go-grid",
	    "GO.util"
	], 
	
	function(
		$, 
		Backbone,
		App,
		emptyTmpl,
		calendarHolidayTmpl,
		holidayCreateTmpl,
		commonLang,
		adminLang,
		calendarLang
	) {
		var	tmplVal = {
				label_add: adminLang["신규 추가"],
				label_delete: commonLang["삭제"],
				label_download: adminLang["목록 다운로드"],
				label_calendar: adminLang["달력"],
				label_date: adminLang["날짜"],
				label_title: commonLang["제목"],
				label_status: adminLang["휴일여부"],
				selectMonth: [
				              {"value": "1"}, {"value": "2"}, {"value": "3"}, {"value": "4"},
				              {"value": "5"}, {"value": "6"}, {"value": "7"}, {"value": "8"},
				              {"value": "9"}, {"value": "10"}, {"value": "11"}, {"value": "12"}
				             ],
				selectDate_31: [
								{"value": "1"}, {"value": "2"}, {"value": "3"}, {"value": "4"},
								{"value": "5"}, {"value": "6"}, {"value": "7"}, {"value": "8"},
								{"value": "9"}, {"value": "10"}, {"value": "11"}, {"value": "12"},
								{"value": "13"}, {"value": "14"}, {"value": "15"}, {"value": "16"},
					            {"value": "17"}, {"value": "18"}, {"value": "19"}, {"value": "20"},
					            {"value": "21"}, {"value": "22"}, {"value": "23"}, {"value": "24"},
					            {"value": "25"}, {"value": "26"}, {"value": "27"}, {"value": "28"},
					            {"value": "29"}, {"value": "30"}, {"value": "31"}
				            ],
				selectDate_29: [
								{"value": "1"}, {"value": "2"}, {"value": "3"}, {"value": "4"},
								{"value": "5"}, {"value": "6"}, {"value": "7"}, {"value": "8"},
								{"value": "9"}, {"value": "10"}, {"value": "11"}, {"value": "12"},
								{"value": "13"}, {"value": "14"}, {"value": "15"}, {"value": "16"},
					            {"value": "17"}, {"value": "18"}, {"value": "19"}, {"value": "20"},
					            {"value": "21"}, {"value": "22"}, {"value": "23"}, {"value": "24"},
					            {"value": "25"}, {"value": "26"}, {"value": "27"}, {"value": "28"},
					            {"value": "29"}
				            ],
				selectDate_30: [
								{"value": "1"}, {"value": "2"}, {"value": "3"}, {"value": "4"},
								{"value": "5"}, {"value": "6"}, {"value": "7"}, {"value": "8"},
								{"value": "9"}, {"value": "10"}, {"value": "11"}, {"value": "12"},
								{"value": "13"}, {"value": "14"}, {"value": "15"}, {"value": "16"},
					            {"value": "17"}, {"value": "18"}, {"value": "19"}, {"value": "20"},
					            {"value": "21"}, {"value": "22"}, {"value": "23"}, {"value": "24"},
					            {"value": "25"}, {"value": "26"}, {"value": "27"}, {"value": "28"},
					            {"value": "29"}, {"value": "30"}
				            ],
				selectWeek: [
								{"value": "1"}, {"value": "2"}, {"value": "3"},
								{"value": "4"}, {"value": "5"}
							],
				selectDay: [
								{"text": calendarLang["월요일"], "value": "MO"}, {"text": calendarLang["화요일"], "value": "TU"}, {"text": calendarLang["수요일"], "value": "WE"},
								{"text": calendarLang["목요일"], "value": "TH"}, {"text": calendarLang["금요일"], "value": "FR"}, {"text": calendarLang["토요일"], "value": "SA"}, 
								{"text": calendarLang["일요일"], "value": "SU"}
							]
		};
		var CalendarHoliday = App.BaseView.extend({
			el : '#layoutContent',
			initialize : function() {
				this.listEl = '#holidayList';
				this.dataTable = null;
				this.unbindEvent();
				this.bindEvent();
			},
			unbindEvent : function() {
				this.$el.off("click", "span#btn_add");
				this.$el.off("click", "span#btn_delete");
				this.$el.off("click", "span#btn_down");
				this.$el.off("click", "form[name='formHolidayList'] input:checkbox");
			}, 
			bindEvent : function() {
				this.$el.on("click", "span#btn_add", $.proxy(this.addHoliday, this));
				this.$el.on("click", "span#btn_delete", $.proxy(this.deleteHoliday, this));
				this.$el.on("click", "span#btn_down", $.proxy(this.downHolidayList, this));
				this.$el.on("click", "form[name='formHolidayList'] input:checkbox", $.proxy(this.toggleCheckbox, this));
			},
			toggleCheckbox : function(e) {
				if($(e.currentTarget).is(':checked')){
					$(e.currentTarget).attr('checked', true);
				}else{
					this.$el.find('#checkedAll').attr('checked', false);
					$(e.currentTarget).attr('checked', false);
				}
			},
			downHolidayList : function() {
				var url = 'ad/api/calendar/holiday/download';
                var data = this.dataTable.listParams;
				GO.util.downloadCsvFile(url);
			},
			render : function() {
				this.$el.empty();
				this.$el.html(calendarHolidayTmpl({
					lang : tmplVal,
				}));	
				this.renderHolidayList();
			},
			renderHolidayList : function() {
				var self = this;
				
				if(this.dataTable != null) this.dataTable.tables.fnDestroy();
				
				this.dataTable  = $.goGrid({
					el : this.listEl,
					method : 'GET',
					url : GO.contextRoot + 'ad/api/calendar/holiday',
					emptyMessage : emptyTmpl({
							label_desc : adminLang["공휴일없음"]
					}),
					pageUse : false,
					sDomUse : false,
					checkbox : true,
					sDomType : 'admin',
					checkboxData : 'id',
					displayLength : 999,
					defaultSorting : [[2, "asc"]],
					columns : [
					           { mData : "phase", bSortable: false, sClass: "calendar", sWidth: '80px', fnRender: function(obj){
					        	   return obj.aData.phase == 'solar' ? adminLang["양력"] : adminLang["음력"];
					           }},
					           { mData: "recurrence", bSortable: true, sClass: "date",sWidth: '150px', fnRender: function(obj){
					        	   var arrayRecurrence = obj.aData.recurrence.split(";");
					        	   var arrayMonth = arrayRecurrence[1].split("=");
					        	   var arrayDay = arrayRecurrence[2].split("=");
					        	   var result = arrayMonth[1] + calendarLang["월"] + " ";
					        	   
					        	   if(arrayDay[0] == 'BYMONTHDAY'){
					        		   result += arrayDay[1] + calendarLang["일"];
					        	   }else{
					        		   var array = arrayDay[1];
					        		   var header = array[1] + array[2];
					        		   result += array[0] + adminLang["번째"] + " " + adminLang[header];
					        	   }
					        	   return result;
					           }},
					           { mData: "summary", bSortable: true, sClass: "subject" },
					           { mData : "type", bSortable: false, sClass: "align_c state", sWidth : "100px", fnRender: function(obj){
					        	   return obj.aData.type == 'holiday' ? adminLang["휴일"] : adminLang["기념일"];
					           }}
			        ],
			        fnDrawCallback : function(obj) {
			        	self.$el.find('#checkedAll').attr('checked', false);
			        	self.$el.find('.toolbar_top').append(self.$el.find('#controlButtons').show());
			        }
				});
			},
			modifyHoliday : function(e){
				this.popupUnbindEvents(popupEl);
				this.popupBindEvents(popupEl);
			},
			popupUnbindEvents : function(popupEl) {
				popupEl.off();
			},
			
			popupBindEvents : function(popupEl){
				popupEl.on("change", "select#selectMonth", $.proxy(this.changeDateSelector, this));
            },
            changeDateSelector : function(e) {
            	var monthValue = e.currentTarget.value;
            	$('select#selectDate').empty();
            	if(monthValue == '2'){
            		$.each(tmplVal['selectDate_29'], function(k,v) {
            			$('select#selectDate').append(['<option value="', v.value,'">', v.value, calendarLang["일"], '</option>'].join(''));
    				});
            	}else if(monthValue == '1' || monthValue == '3' || monthValue == '5' || monthValue == '7' || monthValue == '8' || monthValue == '10' || monthValue == '12'){
            		$.each(tmplVal['selectDate_31'], function(k,v) {
            			$('select#selectDate').append(['<option value="', v.value,'">', v.value, calendarLang["일"], '</option>'].join(''));
    				});
            	}else{
            		$.each(tmplVal['selectDate_30'], function(k,v) {
            			$('select#selectDate').append(['<option value="', v.value,'">', v.value, calendarLang["일"], '</option>'].join(''));
    				});
            	}
            },
			addHoliday : function(){
				this.model = new Backbone.Model();
				this.model.url = GO.contextRoot + "ad/api/calendar/holiday";
				
				var self = this,
					tmpl = holidayCreateTmpl({
						label_calendar: adminLang["달력"],
						label_solar: adminLang["양력"],
						label_lunar: adminLang["음력"],
						label_date: adminLang["날짜"],
						label_date_select: adminLang["날짜 지정"],
						label_day_select: adminLang["요일 지정"],
						label_title: commonLang["제목"],
						label_status: adminLang["휴일여부"],
						label_holiday: adminLang["휴일"],
						label_non_holiday: adminLang["기념일"],
						label_times : adminLang["번째"],
						label_month : calendarLang["월"],
						label_day : calendarLang["일"],
						selectMonth: tmplVal['selectMonth'],
						selectDate: tmplVal['selectDate_31'],
						selectWeek: tmplVal['selectWeek'],
						selectDay: tmplVal['selectDay']
					});
				var popupEl = $.goPopup({
					targetEl : '.admin_body',
					header : adminLang["기념일/공휴일 추가"],
					modal : true,
					width : '500px',
					buttons : [{
						btext : commonLang["저장"],
						btype : "confirm",
						autoclose : false,
						callback : function() {
							setAddHoliday(self);
							return;
						}
					}, {
						btext : commonLang["취소"]
					}]
				});
				popupEl.find('.content').append(tmpl);
				
				var setAddHoliday = function(self){
					var popup = popupEl,
						validate = true,
						form = popup.find('form#formCreateHoliday');
					
					$.each(form.serializeArray(), function(k,v) {
						if((!$.goValidation.isCheckLength(1,32,v.value))){
							if(v.name == 'summary'){
								validate = false;
								$('#'+v.name).focus();
								$('#'+v.name).after('<p class="go_alert">' + App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"32"}) + '</p>');
								$('#'+v.name).click(function(){
									$('.go_alert').remove();
								});
								$('#'+v.name).keydown(function(){
									$('.go_alert').remove();
								});
								return false;
							}
						}
						
						if(v.value == 'dateSelect'){
							// 날짜지정이면
							var BYMONTH = "BYMONTH=" + $('#selectMonth_date>option:selected').val();
							var BYMONTHDAY = "BYMONTHDAY=" + $('#selectDate_date>option:selected').val();
							var recurrence = "FREQ=YEARLY;" + BYMONTH + ";" + BYMONTHDAY;
							self.model.set("recurrence", recurrence, {silent: true});
						}else if(v.value == 'daySelect'){
							//요일 지정이면
							var BYMONTH = "BYMONTH=" + $('#selectMonth_day>option:selected').val();
							var BYDAY = "BYDAY=" + $('#selectWeek_day>option:selected').val() + $('#selectDay_day>option:selected').val();
							var recurrence = "FREQ=YEARLY;" + BYMONTH + ";" + BYDAY;
							self.model.set("recurrence", recurrence, {silent: true});

						}
						self.model.set("timeType","allday", {silent: true});
						self.model.set("visibility","public", {silent: true});
						self.model.set("startTime", new Date('2000', '0', '01'), {silent: true});
						self.model.set("endTime", new Date('2000', '0', '01'), {silent: true});
						if(v.name != 'dateOrDay'){
							self.model.set(v.name, v.value, {silent: true});
						}
					});
					if(!validate){
						return false;
					}
					self.model.save({},{
						success : function(model, response) {
							if(response.code == '200') {
								$.goMessage(commonLang["저장되었습니다."]);
								popup.close();
								self.renderHolidayList();
							}
						},
						error : function(model, response) {
							if(response.responseJSON.message == "UnsupportedLunarConversionException."){
								$.goAlert(commonLang["실패"], calendarLang["유효하지 않은 음력날짜 입니다."]);
							}else{
								$.goAlert(commonLang["실패"], commonLang["실패했습니다."]);
							}
						}
					});
				};
				
				this.popupUnbindEvents(popupEl);
				this.popupBindEvents(popupEl);
				
			},
			deleteHoliday : function(){
				var self = this,
					holidayIds = new Array(),
					form = this.$el.find('form[name=formHolidayList]'),
					holidayEl = form.find('input[type="checkbox"]:checked');
				if(holidayEl.size() == 0){
					$.goAlert(adminLang["삭제공휴일선택"]);
					return;
				}
				holidayEl.attr('value', function(i, val){
					if(val == 'on'){
					}else{
						if(val != null){
							holidayIds.push(val);
						}
					}
				});
				
				$.goCaution(adminLang["공휴일삭제질문"], adminLang["삭제경고"], function() {
					var url = GO.contextRoot + 'ad/api/calendar/holiday';
					$.go(url, JSON.stringify({ids: holidayIds}), {
						qryType : 'DELETE',					
						contentType : 'application/json',
						responseFn : function(response) {
							if(response.code == 200){
								$.goMessage(commonLang["삭제되었습니다."]);
								self.renderHolidayList();
							}
						},
						error : function(response) {
							var responseData = JSON.parse(response.responseText);
							if(responseData.message != null){
								$.goMessage(responseData.message);
							}else{
								$.goMessage(commonLang["실패했습니다."]);
							}
						}
					});
					
				});
			}
		},{
			__instance__: null
		});
		
		return CalendarHoliday;
	});
}).call(this);