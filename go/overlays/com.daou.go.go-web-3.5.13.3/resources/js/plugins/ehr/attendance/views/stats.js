(function() {
    define([
    "backbone", 
    "app",
    "attendance/views/title",
    "hgn!attendance/templates/stats",
    "hgn!attendance/templates/stats_list",
    "i18n!nls/commons",
    "i18n!attendance/nls/attendance",
	"models/dept_profile",
    "jquery.go-grid"
    ],

    function(
    Backbone,
    GO,
    StatsTitleView,
    StatsTmpl,
    StatsListTmpl,
    commonLang,
    attndLang,
    DeptModel
    ) {
        
    	var DescendantDept = Backbone.Collection.extend({
    		initialize : function(options){
    			this.deptId = options.deptId;
    		},
    		url : function() {
            	return GO.contextRoot + 'api/department/descendant/' + this.deptId;
            }
    	});

    	
        var statslang = {
                    label_stats_period : attndLang["검색기간"],
                    label_stats_day : attndLang["일"],
                    label_stats_week : attndLang["주"],
                    label_stats_month : attndLang["월"],
                    label_stats_state : attndLang["근태 상태"],
                    label_stats_late : attndLang["지각"],
                    label_stats_allnight : attndLang["철야"],
                    label_stats_search : attndLang["검색"],
                    label_down_list : attndLang["상세내역 다운로드"],
                    label_dept_name : commonLang["부서명"],
                    label_dept_member : commonLang["부서원"],
                    label_dept_group : attndLang["그룹"],
                    label_stats_all : attndLang["전체"],
                    label_stats_ave_go : attndLang["평균출근"],
                    label_stats_ave_leave : attndLang["평균퇴근"],
                    label_stats_ave_time : attndLang["평균근무"],
                    label_stats_target : attndLang["대상"],
                    label_stats_title : attndLang["부서 근태통계"],
                    label_all_stats_title : attndLang["전사 근태통계"],
                    label_stats_group_message : attndLang["그룹을 선택해주세요."],
                    label_stats_group_select : attndLang["선택"],
                    "하위부서선택" : commonLang['하위 부서 선택']
            
        };
        var DeptStatsList = Backbone.View.extend({
            events : {
                "click #statsDay" : "statsDayClick",
                "click #statsWeek" : "statsWeekClick",
                "click #statsMonth" : "statsMonthClick",
                "change #statsSearchTypes" : "statsSearchTypesChange", 
                "click #statsStateAll" : "statsStateAllClick",
                "click input[name=stateCheck]" : "stateCheckClick",
                "click #statsSearch" : "statsSearchClick",
                "click #attndCalBtn" : "attndCalBtn",
                "keyup #statsSearchInput" : "statsSearchInputEnter",
                "click #downloadxlsx" : "downloadxlsx"
            },

            initialize : function(option) {
                this.$el.off();
                this.selectedDate;
                
                this.deptid = _.isUndefined(option) ? undefined : option.deptid;
                
                if(_.isUndefined(this.deptid)){
                	this.dept = new Backbone.Model();
                    this.descendantDept = new Backbone.Collection();
                }else{
                	this.dept = DeptModel.read(this.deptid);
                    this.descendantDept = new DescendantDept({"deptId" : this.deptid});
                    this.descendantDept.fetch({async: false});
                }
                
                if(option == undefined || this.descendantDept.length == 0){
                	this.hasDescendantSelect  = false;
                }else{
                	this.hasDescendantSelect  = true;
                }
            },

            render : function() {
               
                var self = this;
                
                this.$el.html(StatsTmpl({
                    lang : statslang,
                    descendantDept : this.descendantDept.toJSON(),
                    hasDescendantSelect: this.hasDescendantSelect,
                    dept : this.dept.toJSON()
                }));
                
                var title = "";
                if(this.deptid == undefined){
                    title = attndLang["전사 근태통계"]
                }else{
                    title = attndLang["부서 근태통계"];
                    self.$el.find('#targetTr').hide();
                }
                
                
                var statsTitleView = new StatsTitleView();
                this.$el.find('header.content_top').html(statsTitleView.render(title).el);
              
                var date = moment().format("YYYY-MM-DD");
                var returnDate = setDay.call(this,date,1);
                 
               /* self.$el.find("#statsStartDate").text(moment().format("YYYY-MM-DD"));
                self.selectedDate = moment().format("YYYY-MM-DD");*/
                self.$el.find("#statsStartDate").text(returnDate);
                self.selectedDate = returnDate;
                self.initDatePicker();
                self.setTagetGroupInfo();
                self.setStateInfo();

                $("body").trigger("ehr.statListRender");
                
                return this;
            },

            
            initDatePicker : function(){
                
                
                var self = this;
                
                
                var calendarDatepicker = self.$el.find("#calendarDatepicker");
                
                $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                calendarDatepicker.datepicker({
                        dateFormat : "yy-mm-dd",
                        changeMonth: true,
                        changeYear : true,
                        yearSuffix: "",
                        onSelect: function( selectedDate ) {
                         
                            self.selectedDate = selectedDate;
                            $.each(self.$el.find("#statsDayWeekMonth").children(),function(i,item){
                               
                                if($(this).hasClass("select")){
                                    
                                    var id = $(this).attr('id');
                                    
                                    if(id == "statsDay"){
                                        self.$el.find("#statsStartDate").text(selectedDate);
                                        
                                    }else if(id == "statsWeek" ){
                                       
                                        var basedate = moment(selectedDate).clone();
                                        var from = basedate.clone().day(0).format("YYYY-MM-DD");
                                        var to = basedate.clone().day(6).format("YYYY-MM-DD");
                                        
                                        self.$el.find("#statsStartDate").text(from);
                                        self.$el.find("#statsEndDate").text(to);
                                        
                                    }else if(id == "statsMonth" ){
                                        var basedate = selectedDate;
                                        var basedateArray = basedate.split('-');
                                        var monthdate = basedateArray[0]+'-'+basedateArray[1];
                                        self.$el.find("#statsStartDate").text(monthdate);
                                        
                                    }
                                    
                              
                                }
                             
                                
                            });
                        }
                  });
                self.$el.find("#calendarDatepicker").trigger('focus');
            },
            
            //달력
            attndCalBtn : function(){
                $("#calendarDatepicker").trigger('focus');
            },
            
            
            
            //일 클릭 이벤트
            statsDayClick : function() {
                
                $("#statsEndDateSpan").hide();
                
                $("#statsWeek").removeClass("select");
                $("#statsMonth").removeClass("select");
                $("#statsDay").addClass("select");
              
                $("#statsStartDate").text(this.selectedDate);
                
            },
            //주 클릭 이벤트
            statsWeekClick : function() {
                      
                $("#statsEndDateSpan").show();
                
                $("#statsDay").removeClass("select");
                $("#statsMonth").removeClass("select");
                $("#statsWeek").addClass("select");
                
             
                var basedate = moment(this.selectedDate).clone();
                var from = basedate.clone().day(0).format("YYYY-MM-DD");
                var to = basedate.clone().day(6).format("YYYY-MM-DD");
                
                $("#statsStartDate").text(from);
                $("#statsEndDate").text(to);
             
              
                
                
            },
            //월 클릭 이벤트
            statsMonthClick : function() {
                
                $("#statsEndDateSpan").hide();
                
                $("#statsDay").removeClass("select");
                $("#statsWeek").removeClass("select");
                $("#statsMonth").addClass("select");
                
              
                
                var basedate = this.selectedDate;
                var basedateArray = basedate.split('-');
                var monthdate = basedateArray[0]+'-'+basedateArray[1];
                $("#statsStartDate").text(monthdate);
                
              
            },
            //type별 change 이벤트
            statsSearchTypesChange : function() {
                var selectVal = $("#statsSearchTypes").val();
                this.$el.find("#statsSearchInput").val("");
                this.$el.find("#statsGroupSelect").val("selectIng").attr("selected", "selected");
                
                if(selectVal == 'group'){
                    $("#statsSearchInput").hide();
                    $("#statsGroupSelect").show();
                }else{
                    
                    $("#statsGroupSelect").hide();
                    $("#statsSearchInput").show();
                }
              
            },
            
            //근태 상태 전체 체크
            statsStateAllClick : function() {
                
             
              var self = this;
              if(self.$el.find("#statsStateAll").is(":checked")) {
                  self.$el.find("input[name=stateCheck]").prop("checked", true);
              }else {
                  self.$el.find("input[name=stateCheck]").prop("checked", false);
              }
           
            
            },
            
            //근태 상태 체크
            stateCheckClick : function() {
                
                
                var self = this;
               
                $.each(self.$el.find("input[name=stateCheck]"),function(i, item){
                    if(!$(this).is(":checked")){
                        
                        self.$el.find("#statsStateAll").prop("checked", false);
                        
                    }
                    
                    
                });
          
            },
            
            //그룹정보 가져오기
            setTagetGroupInfo : function() {
                        
                var self = this;
               
                var url = GO.contextRoot + "api/ehr/attnd/groups";
     
                $.go(url, "", {
                    qryType : 'GET',    
                    contentType : 'application/json',
                    responseFn : function(response) {
                        if(response.code == 200){
                           var data = response.data;
                           
                           var html="";
                          
                               $.each(data,function(i,item){
                              
                                   html += "<option value='"+item.id+"'>"+item.name+"</option>";
                               
                               });
                           
                               $("#statsGroupSelect").append(html);
                           }
                        
                        
                    },
                    error: function(response){
                       
                    }
                });
               
          
            },
            
            //근태상태 가져오기
            setStateInfo : function() {
                        
                var self = this;
               
                var url = GO.contextRoot + "api/ehr/attnd/company/statuses";
     
                $.go(url, "", {
                    qryType : 'GET',    
                    contentType : 'application/json',
                    responseFn : function(response) {
                        if(response.code == 200){
                           var data = response.data;
                           
                           var dataLength = data.length;
                           var lineNum = Math.ceil((dataLength + 3)/5);
                           var html="";
                           for(var line=0; line<lineNum-1; line++){
                               html += " <tr></tr>";
                               $("#statsStateTbody").append(html);
                               html ="";
                           }
                         
                           
                           $.each(data,function(i,item){
                             
                              for(var k=0; k<lineNum; k++){
                                 
                                  trLength = $("#statsStateTbody tr:eq("+k+")").children().length;
                                  
                                  if(trLength<5 ){
                                  html += "<td class='statsTd'>"
                                      +"<input type='checkbox' name='stateCheck' value="+item.fieldName+" data-name="+item.name+">"
                                      +"<span>"+item.name+"</span></td>";
                                  $("#statsStateTbody tr:eq("+k+")").append(html);
                                  html="";
                                 
                                  break;
                                  }
                              }
                             
                           });
                        }
                        self.statsStateAllClick();
                    },
                    error: function(response){
                        
                    }
                });
               
          
            },
       
            //엔터키 적용하여 검색
            statsSearchInputEnter : function(event) {
                
                var self = this;
                event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                
                
                if(keyID == 13){
                    self.statsSearchClick();
                }
            },
            
            //그리드하기전 param 정보 담기
            statsSearchClick : function() {
                
                var self = this;
               
                var params = this.getParams();
                var url=this.getUrl();
                if(params.fail != "fail"){
                    self.renderTable(params,url);
                }
            },
            
            getUrl : function(){
                var url = {};
                url["statsDay"] = "api/ehr/attnd/stat/daily";
                url["statsWeek"] = "api/ehr/attnd/stat/weekly";
                url["statsMonth"] = "api/ehr/attnd/stat/monthly";
                
                var selectedId = $("#statsDayWeekMonth a.select").attr("id");
                
                return url[selectedId];
            },
            
            getParams : function(){
                var params = {};
                var selectedId = $("#statsDayWeekMonth a.select").attr("id");
             
                if(selectedId == "statsDay"){
                    params["basedate"] = $("#statsStartDate").text();
                }else if(selectedId == "statsWeek" ){
                    params["startdate"] = $("#statsStartDate").text();
                    params["enddate"] = $("#statsEndDate").text();
                }else if(selectedId == "statsMonth" ){
                    params["basedate"] = $("#statsStartDate").text();
                }
                
                if(this.deptid == undefined){
                    var searchType = $("#statsSearchTypes").val();
                    params["searchtype"] = searchType;
                
                    if(searchType=='user' || searchType=='dept'){
                        params["keyword"] = $("#statsSearchInput").val();
                    }else if(searchType=='group'){
                        
                        var groupSelect = $("#statsGroupSelect option:selected").val();
                        if(groupSelect=="selectIng"){
                            $.goMessage(attndLang["그룹을 선택해주세요."]);
                            params["fail"] = "fail";
                        }else{
                            params["keyword"] = $("#statsGroupSelect").val();
                        }
                    }
                    
                }else if(this.deptid != undefined){
                	if(this.hasDescendantSelect){
                		var deptId = $("#descendant").val();
                		params["deptid"] = deptId;
                	}else{
                		params["deptid"] = this.deptid;
                	}
                }
                
                return params;
            },
            
            //그리드
            renderTable : function(params,url){
           
                var self = this;
                
                
                this.$el.find("#statsListInfo").html(StatsListTmpl({
                	lang : statslang
                }));
                
                $("#downloadxlsx").show();
                $("#statsListInfoHeadTr .customField").remove();
            
//                if (typeof self.statsList != 'undefined') {
//                    self.statsList.tables.fnDestroy();
//                }
                
                var columns = function(){
                    var column = [
                                { mData: "user.name", sClass: "name align_c", bSortable: true, fnRender : function(obj) {
                                    return obj.aData.user.name;
                                }},
                                { mData: "depts", sClass: "department align_c", bSortable: false, fnRender : function(obj) {
                                    var deptNames="";
                                    if(obj.aData.depts!=null){
                                        $.each(obj.aData.depts,function(i, item){
                                            deptNames += item.name+","
                                         
                                        });
                                        deptNames = deptNames.substring(0,deptNames.length-1);
                                    }
                                    
                                    return deptNames;
                                }},                                  
                                { mData: "clockInTime", sClass: "go align_c",bSortable: true , fnRender : function(obj) {
                                    if(obj.aData.clockInTime != null){
                                        var date = secondToTime.call(this,obj.aData.clockInTime);
                                        return "<span class='time'>" + GO.util.customDate(date, "HH:mm:ss"); + "</span>";
                                    }
                                    return "<span class='time'>-</span>";
                                }},
                                { mData: "clockOutTime",sClass: "leave align_c",bSortable: true , fnRender : function(obj) {
                                    if(obj.aData.clockOutTime != null){
                                        var date = secondToTime.call(this,obj.aData.clockOutTime);
                                        return "<span class='time'>" + GO.util.customDate(date, "HH:mm:ss"); + "</span>";
                                    }
                                    return "<span class='time'>-</span>";
                                }},  
                                { mData: "workingTime",sClass: "time align_c",bSortable: true , fnRender : function(obj) {      
                                    if(obj.aData.workingTime != null){
                                        var date = secondToTime.call(this,obj.aData.workingTime);
                                        return "<span class='time'>" + GO.util.customDate(date, "HH:mm:ss"); + "</span>";
                                    }
                                    return "<span class='time'>-</span>";
                                }}
                            ];
                    
                    $.each(self.$el.find("input[name=stateCheck]"),function(i, item){
                        var html="";
                        
                        if($(this).is(":checked")){
                            
                           var value= item.value;
                      
                           var pushInfo =  {   mData: value, 
                                               sClass: 'customField align_c',
                                               bSortable: true
                                           };
                           
                           column.push(pushInfo);
                          
                   
                          html += "<th class='sorting customField' style='width:50px'>"
                                      +"<span class='title_sort'>"
                                      +$(this).attr("data-name")+"<ins class='ic'></ins>"
                                      +"</span></th>";
                               
                        }
                        $("#statsListInfoHeadTr").append(html);
                        
                        
                    });
                    
                    return column;
                }();
                
                
                
                self.statsList = $.goGrid({
                    el : self.$el.find('#stat_table'),
                    method : 'GET',
                    pageUse : true,
                    url : GO.contextRoot + url ,
                    lengthMenu : [30,50,70,100,200,300,400,500],
                    emptyMessage : "<p class='data_null'> " +
                                      /*  "<span class='ic_data_type ic_no_data'></span>" +*/
                                        "<span class='txt'>"+attndLang["검색결과가 없습니다."]+"</span>" +
                                   "</p>",
                    defaultSorting : [[ 0, "asc" ]],
                    params : params,
                    columns : columns,
                    fnDrawCallback : function(tables, oSettings, listParams) {
                        if(self.$el.has('#taskListScroll').length == 0){
                            self.statsList.tables.wrapAll('<div id="taskListScroll" style="overflow-x:scroll" />');
                        }
                        
                        $(window).scrollTop(0);
                    }
                });
                
               // this.statsFormsTable = statsList.tables;
                
            },
            
            //상세내역 다운로드
            downloadxlsx : function() {
                var params = this.statsList.listParams;
                params["offset"] = null;
                params["page"] = null;
                
                var selectedId = $("#statsDayWeekMonth a.select").attr("id");
                var url = {};
                url["statsDay"] = "api/ehr/attnd/stat/daily/download";
                url["statsWeek"] = "api/ehr/attnd/stat/weekly/download";
                url["statsMonth"] = "api/ehr/attnd/stat/monthly/download";
                
                window.location.href = GO.contextRoot + url[selectedId] + "?" + $.param(params);           
             }
        });

        
        function secondToTime(num) {
            
           
            var hours, minute, second;
            //시간공식
            hours = num / 3600;//시 공식
            minute = num % 3600 / 60;//분을 구하기위해서 입력되고 남은값에서 또 60을 나눈다.
            second = num % 3600 % 60;//마지막 남은 시간에서 분을 뺀 나머지 시간을 초로 계산함
            
            
            myDate = new Date();
            myDate.setHours(hours,minute,second);
           
            return myDate
        }
        
        function setDay(date,num) {
            var selectDate = date.split("-");
            var changeDate = new Date(selectDate[0], selectDate[1]-1, selectDate[2]);
           
            var day = new Date(changeDate.valueOf() - (24*60*60*1000)*num);
           
            return  GO.util.customDate(day, "YYYY-MM-DD");
         }
    

        return DeptStatsList;

    });

})();