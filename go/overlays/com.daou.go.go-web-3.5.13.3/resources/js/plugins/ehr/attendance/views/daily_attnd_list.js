(function() {
	define([
	"backbone", 
	"app",
	"hgn!attendance/templates/daily_attnd_list",
	"i18n!nls/commons",
	"i18n!attendance/nls/attendance",
	"models/dept_profile", 
	"jquery.go-grid"
	],

	function(
	Backbone,
	GO,
	DeptAttndListTmpl,
	commonLang,
	attndLang,
	DeptModel
	) {
		
		var lang = {
				label_down_list : attndLang["목록 다운로드"],
				label_pre : commonLang["이전"],
				label_next : commonLang["다음"],
				label_today : commonLang["오늘"],
				label_move_date : attndLang["날짜 이동"],
				label_include_sub_dept : attndLang["하위부서 포함"],
				label_dept_name : commonLang["부서명"],
				label_dept_member : commonLang["부서원"],
				label_go_to_work : attndLang["출근"],
				label_IP : attndLang["IP"],
				label_GPS : attndLang["GPS"],
				label_go_home : attndLang["퇴근"],
				label_working_hour : attndLang["근무시간"],
				label_status : attndLang["상태"],
				label_memo : attndLang["메모"],
				label_normal : attndLang["정상"],
				label_late : attndLang["지각"],
				label_modify : attndLang["수정"],
				label_daily : attndLang["일간"],
				label_monthly : attndLang["월간"],
				label_group : attndLang["그룹"],
				label_select : commonLang['선택'],
				'하위부서선택' : commonLang['하위 부서 선택'],
		};
		
        var GroupCollection = Backbone.Collection.extend({
            url : GO.contextRoot + "api/ehr/attnd/groups"
        });
        
        var CompanyStatusCollection = Backbone.Collection.extend({
        	url : GO.contextRoot + "api/ehr/attnd/company/statuses"
        });
		
		var DeptAttndList = Backbone.View.extend({
			events : {
				"click #xlsxDownBtn" : "downExcel",
				"click #preDate" : "movePreDate",
				"click #nextDate" : "moveNextDate",
				"click #todayBtn" : "moveToday",
				"click #attndCalBtn" : "attndCalBtn",
				"click #subDeptCheck" : "includeSubDeptee",
				"keydown #searchKeyword" : "searchKeyboardEvent",
                "click #searchBtn" : "search",
                "click ul.tab_nav li.monthly" : "changeTab",
                "change #searchTypes" : "changeSearchType",
                'change #search_group_filter' : 'search',
                "change #attnd_descendant_dept" : 'changeDept',
                'change #search_status_filter' : 'search'
			},

			initialize : function(options) {
				this.$el.off();
				this.options = options || {};
				this.isCompanyAttnd = this.options.isCompanyAttnd;
				this.isUseGPS = GO.config('mobileConfig').useAttndRecordGps;
				this.deptid = this.options.deptid;
                this.groups = new GroupCollection();
                this.groups.fetch({async: false});
                this.descendantDept = this.options.descendantDept;
                if(_.isUndefined(this.deptid) || this.descendantDept.length == 0){
                	this.dept = new Backbone.Model();
                	this.hasDescendantSelect  = false;
                }else{
                	this.dept = DeptModel.read(this.deptid);
                	this.hasDescendantSelect  = true;
                }
                
                this.companyStatus = new CompanyStatusCollection();
                this.companyStatus.fetch({async : false});
			},

			render : function() {
				var today = GO.util.formatDatetime(GO.util.toISO8601(GO.util.now()), null, "YYYY-MM-DD");
				this.$el.html(DeptAttndListTmpl({
					lang : lang, 
					searchdate : today,
					preDate : GO.util.formatDatetime(GO.util.calDate(today,'days',-1), null, "YYYY-MM-DD"),
					nextDate : GO.util.formatDatetime(GO.util.calDate(today,'days',1), null, "YYYY-MM-DD"),
					isCompanyAttnd : this.isCompanyAttnd,
                    isUseGPS : this.isUseGPS,
					groups : this.groups.toJSON(),
					companyStatus : this.companyStatus.toJSON(),
					descendantDept : this.descendantDept.toJSON(),
					hasDescendantSelect : this.hasDescendantSelect,
					dept : this.dept.toJSON()
				}));
				var self = this;
				self.renderTable();
				self.initDatePicker();

				$("body").trigger("ehr.attndListRender");

				return this;
			},
			
			initDatePicker : function(){
				var self = this;
				var weekCalendarHiddenInput = self.$el.find("#deptAttndCalendar");
				$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
				weekCalendarHiddenInput.datepicker({
			            dateFormat : "yy-mm-dd",
			            changeMonth: true,
			            changeYear : true,
			            yearSuffix: "",
			            onSelect: function( selectedDate ) {
			            	self.gridTableReload(selectedDate);
			            }
			      });
			},

            getColumns: function (useGps) {
                var name = { mData: "userName", sClass: "name", sWidth: "100px", bSortable: true, fnRender : function(obj) {
                    var html = [];
                    html.push("<span data-id=" + obj.aData.userId + ">");
                    html.push("<a class='detail'>" + obj.aData.userName + "</a>");
                    html.push("<a class='popup' style='cursor: pointer;'><span class='ic_classic ic_blank' title='팝업보기'></span></a>");
                    html.push("</span>");

                    return html.join("");
                }};
                var department = { mData: "deptName", sClass: "department", sWidth: "180px",bSortable: false, fnRender : function(obj) {
                    return obj.aData.deptName;
                }};
                var clockInTime = { mData: "clockInTime",sClass: "go", sWidth: "100px",bSortable: true , fnRender : function(obj) {
                    var colorClass = "";
                    if(obj.aData.editedClockInTime){
                        colorClass = "modify";
                    } else if(obj.aData.late){
                        colorClass = "late";
                    }
                    if(obj.aData.clockInTime != null){
                        var clockInTime = moment(obj.aData.clockInTime).zone(obj.aData.clockInTime).format('HH:mm:ss');
                        return "<span class='time " + colorClass + "'>" + clockInTime + "</span>";
                    }

                    if(isAfter(obj.aData.logDate)){
                        return ""
                    }

                    return "<span class='time'>-</span>";
                }};
                var clockInIp = { mData: "clockInIp", sClass: "go_ip", sWidth: "100px", bSortable: false , fnRender : function(obj) {
                        return obj.aData.clockInIp;
                }};
                var clockInGPS = { mData: null, sClass: "go_gps", sWidth: "180px", bSortable: false , fnRender : function(obj) {
                    if(obj.aData.clockInLatitude != null && obj.aData.clockInLongitude != null){
                        return obj.aData.clockInLatitude + ',' + obj.aData.clockInLongitude;
                    }
                    return "-";
                }};
                var clockOutTime = { mData: "clockOutTime", sClass: "leave", sWidth: "100px",bSortable: true , fnRender : function(obj) {
                    var colorClass = "";
                    if(obj.aData.editedClockOutTime){
                        colorClass = "modify";
                    }
                    if(obj.aData.clockOutTime != null){
                        var clockOutTime = moment(obj.aData.clockOutTime).zone(obj.aData.clockOutTime).format('HH:mm:ss');
                        return "<span class='time " + colorClass + "'>" + clockOutTime + "</span>";
                    }

                    if(isAfter(obj.aData.logDate)){
                        return "";
                    }

                    return "<span class='time'>-</span>";
                }};
                var clockOutIp = { mData: "clockOutIp", sClass: "leave_ip", sWidth: "100px",bSortable: false , fnRender : function(obj) {
                    return obj.aData.clockOutIp;
                }};
                var clockOutGPS = { mData: null, sClass: "leave_gps", sWidth: "140px",bSortable: false , fnRender : function(obj) {
                    if(obj.aData.clockOutLatitude != null && obj.aData.clockOutLongitude != null){
                        return obj.aData.clockOutLatitude + ',' + obj.aData.clockOutLongitude;
                    }
                    return "-";
                }};
                var workingTime = { mData: "workingTime", sClass: "time", sWidth: "100px",bSortable: true , fnRender : function(obj) {
                    var workingTime = obj.aData.workingTime;
                    if (workingTime == null) {
                        return "";
                    }
                    var hour = parseInt(workingTime / 3600) + "";
                    var min = parseInt(workingTime % 3600 / 60) + "";
                    var sec = parseInt(workingTime % 60) + "";
                    return padLeft(hour) + ":" + padLeft(min) + ":" + padLeft(sec);
                }};
                var status = { mData: null, sClass: "status",bSortable: false , fnRender : function(obj) {
                    var tmpl = "<ul>";
                    if (obj.aData.statuses != null && obj.aData.statuses.length > 0) {
                        $.each(obj.aData.statuses, function(i, item){
                            tmpl += "<li class='last'>"+
                                "<p class='tit'>"+item.companyStatus.name + " ";
                            if(item.companyStatus.type == "time"){
                                tmpl += GO.util.customDate(item.startDate, "HH:mm:ss") + "~" + GO.util.customDate(item.endDate, "HH:mm:ss");
                            }
                            tmpl += "</p>"+
                                "<p class='con'>" + item.memo + "</p>"+
                                "</li> ";
                        });
                    }else{
                        tmpl += "<li class='last'>"+
                            "<p class='tit'>  </p>"+
                            "<p class='con'>  </p>"+
                            "</li> ";
                    }
                    return tmpl;
                }};

                var columns = [];
                columns[columns.length] = name;
                columns[columns.length] = department;
                columns[columns.length] = clockInTime;
                columns[columns.length] = clockInIp;
                if(useGps){
                    columns[columns.length] = clockInGPS;
                }
                columns[columns.length] = clockOutTime;
                columns[columns.length] = clockOutIp;
                if(useGps) {
                    columns[columns.length] = clockOutGPS;
                }
                columns[columns.length] = workingTime;
                columns[columns.length] = status;
                return columns;
            },
            renderTable : function(){
				var self = this;
				var url = "";
				var searchParams = GO.router.getSearch();
				var params = {searchdate : searchParams.searchdate != undefined ? searchParams.searchdate : GO.util.formatDatetime(GO.util.toISO8601(GO.util.now()), null, "YYYY-MM-DD"),
							page : searchParams.page != undefined ? searchParams.page : 0,
	        				offset : searchParams.offset != undefined ? searchParams.offset : 30,
	        				property : searchParams.peroperty != undefined ? searchParams.peroperty : "userName",
	        				direction : searchParams.direction != undefined ? searchParams.direction : "asc",
	        				searchtype : searchParams.searchtype != undefined ? searchParams.searchtype : "",
	        				keyword : searchParams.keyword != undefined ? searchParams.keyword : ""};
				if(this.isCompanyAttnd){
					url = GO.contextRoot + "api/ehr/attnd/company/record";
				}else{
					url = GO.contextRoot + "api/ehr/attnd/deptmember/record";
					$.extend(params, {deptid : self.deptid, includesubdept : false});
				}
                var deptAttndList = $.goGrid({
                    el : self.$el.find('#deptAttndListWapper'),
                    method : 'GET',
                    pageUse : true,
                    url : url ,
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>"+attndLang["근태현황이 존재하지 않습니다."]+"</span>" +
                                   "</p>",
                    defaultSorting : [[ 0, "asc" ]],
                    params : params,
                    lengthMenu : [30,50,70,100,200,300,400,500],
                    columns : this.getColumns(this.isUseGPS),
                    fnDrawCallback : function(obj, oSettings, listParams) {
                    	$(window).scrollTop(0);
                        $('div.tool_bar .custom_header').parent('div').addClass('calendar_tool_bar');
                		$('div.tool_bar .custom_header').after($('#attnd_tab').show());
                		$('#attnd_tab').after($('#dateBtns').show());
                		//$('#dateBtns').after($('#subDeptBtn').show()); 2.0에서 추가
                		$('div.tool_bar .custom_bottom').append($('#attndLabel').show()).css("width","30%");
                		self.changeUrl(listParams);
                		
                		self.$el.find("td a.detail").on("click" , function(e){
                		    var currentEl = $(e.currentTarget);
                		    var userId = currentEl.closest("span").attr("data-id");
                		    var params = GO.router.getSearch();
                		    
                		    GO.router.navigate("ehr/attendance/" + userId + "/my?" + $.param(params), {trigger: true});
                		});
                		
                        self.$el.find("td a.popup").on("click" , function(e){
                            var currentEl = $(e.currentTarget);
                            var userId = currentEl.closest("span").attr("data-id");
                            var params = GO.router.getSearch();
                            var url = window.location.protocol + "//" +window.location.host + GO.contextRoot + "app/ehr/attendance/" + userId + "/my/popup";
                            window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
                        });
                    }
                });
                
                this.deptAttndFormsTable = deptAttndList.tables;
			},
			
			changeTab : function(){
			    this.trigger("click:monthlytab");
			},
			
			downExcel : function() {
				var params = {
						searchdate : $("#searchDate").attr("data-date")
                };
				if(this.isCompanyAttnd){
					window.location.href = GO.contextRoot + "api/ehr/attnd/download/company/record?" + $.param(params);
				}else{
					$.extend(params, {deptid : this.deptid, includesubdept : $('#subDeptCheck').is(':checked')});
					window.location.href = GO.contextRoot + "api/ehr/attnd/download/deptmember/record?" + $.param(params);
				}
                
			},
			
			movePreDate : function() {
				this.gridTableReload($("#preDate").attr("data-date"));
			},
			
			moveNextDate : function() {
				this.gridTableReload($("#nextDate").attr("data-date"));
			},
			
			moveToday : function() {
				this.gridTableReload(GO.util.formatDatetime(GO.util.toISO8601(GO.util.now()), null, "YYYY-MM-DD"));
			},
			
			attndCalBtn : function(){
				$("#deptAttndCalendar").trigger('focus');
			},
			
			includeSubDeptee : function(){
				this.deptAttndFormsTable.setParam("includesubdept", $('#subDeptCheck').is(':checked'));
			},
			
			searchKeyboardEvent : function(e) {
                if(e.keyCode == 13) {
                    this.search();
                }
            },
            search : function() {
                var _this = this;
                var searchtype = $('#searchTypes').val();
                var searchForm = this.$el.find('#searchKeyword');
                var keyword = "";
                
                if(searchtype == "group"){
                    keyword = this.$el.find("#search_group_filter").val();
                } else if(searchtype == "status"){
                	keyword = this.$el.find("#search_status_filter").val();
                } else{
                    keyword = searchForm.val();
                }
                this.deptAttndFormsTable.customParams = { 
                	      'searchtype' : searchtype ,
                	      'keyword'  : keyword,
                	      'searchdate' : $("#searchDate").attr("data-date")};
                this.deptAttndFormsTable.fnClearTable();
            },
            
			changeDept : function(e){
				var currentEl = $(e.currentTarget);
				var deptid = currentEl.val();
				
				this.deptAttndFormsTable.customParams = {
					deptid : deptid
				}
				this.deptAttndFormsTable.fnClearTable();
			},
            
            gridTableReload : function(searchDate){
            	$("#preDate").attr("data-date", GO.util.formatDatetime(GO.util.calDate(searchDate,'days',-1), null, "YYYY-MM-DD"));
                $("#searchDate").attr("data-date", GO.util.formatDatetime(searchDate, null, "YYYY-MM-DD"));
                $("#searchDate").text(GO.util.formatDatetime(searchDate, null, "YYYY-MM-DD"));
                $("#nextDate").attr("data-date", GO.util.formatDatetime(GO.util.calDate(searchDate,'days',1), null, "YYYY-MM-DD"));
                this.deptAttndFormsTable.customParams = { 
              	      'searchtype' : null,
              	      'keyword'  : null,
              	      'searchdate' : searchDate};
                this.deptAttndFormsTable.fnClearTable();
            },
            
            changeUrl : function(params){
            	var url = GO.router.getUrl().split("?")[0] + "?" + $.param(params) ;
        		GO.router.navigate(url, {trigger : false, replace : true});
            },
            
            changeSearchType : function(e){
                var currentEl = $(e.currentTarget);
                this.$el.find("#searchKeyword").val("");
                this.$el.find("#search_status_filter").val("").attr("selected", "selected");
                this.$el.find("#search_group_filter").val("").attr("selected", "selected");
                
                if(currentEl.val() == "group"){
                    this.$el.find("#search_group_filter").show();
                    this.$el.find("#search_status_filter").hide();
                    this.$el.find("#keyword_section").hide();
                } else if(currentEl.val() == "status"){
                	this.$el.find("#search_status_filter").show();
                	this.$el.find("#search_group_filter").hide();
                    this.$el.find("#keyword_section").hide();
                } else{
                    this.$el.find("#keyword_section").show();
                    this.$el.find("#search_group_filter").hide();
                	this.$el.find("#search_status_filter").hide();
                }
            }
		});

	    function padLeft(str){
	        var pad = "00";
	        return pad.substring(0, pad.length - str.length) + str;
	    }
	    
        function isAfter(date){
            return moment().add(-1, 'days').isBefore(date, 'day');
        };

		return DeptAttndList;

	});

})();