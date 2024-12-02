(function() {
    define([
    "backbone", 
    "app",
    "views/pagination",
    "views/pagesize",
    "attendance/collections/monthly_user_records",
    "attendance/views/monthly_attnd_item",
    "hgn!attendance/templates/monthly_attnd_list",
    "hgn!attendance/templates/empty_data",
    "i18n!nls/commons",
    "i18n!attendance/nls/attendance",
	"models/dept_profile",
    "jquery.go-preloader"
    
    ],

    function(
    Backbone,
    GO,
    PaginationView,
    PageSizeView,
    MonthlyUserRercords,
    MonthlyItemView,
    Tmpl,
    EmptyTmpl,
    commonLang,
    attndLang,
    DeptModel
    ) {
        
        var GroupCollection = Backbone.Collection.extend({
            url : GO.contextRoot + "api/ehr/attnd/groups"
        });
        
        var MonthlyAttndList = Backbone.View.extend({
            events : {
                "click #attndCalBtn" : "attndCalBtn",
                "click ul.tab_nav li.daily" : "changeTab",
                "click #preMonth" : "movePreMonth",
                "click #nextMonth" : "moveNextMonth",
                "click #todayMonth" : "moveTodayMonth",
                'click .sorting' : 'sort',
                'click .sorting_desc' : 'sort',
                'click .sorting_asc' : 'sort',
                'click .btn_search2' : 'search',
                'keypress input#keyword': 'searchByEnter',
                'change #search_group_filter' : 'search',
                'change #searchtype' : 'changeSearchType',
                'click td.month_dep' : 'popup',
                "click #monthly_download" : 'download',
                "change #attnd_descendant_dept" : 'changeDept'
            },

            initialize : function() {
            	this.$el.off();
                var month = GO.util.formatDatetime(GO.util.toISO8601(GO.util.now()), null, "YYYY-MM");
                this.collection = new MonthlyUserRercords({"month" : month, deptId: this.options.deptid});
                this.isDept = _.isUndefined(this.options.deptid) ? false : true;
                this.initProperty = "name";
                this.initDirection = "asc";
                this.groups = new GroupCollection();
                this.groups.fetch({async: false});
                this.descendantDept = this.options.descendantDept;
                this.collection.setSort(this.initProperty, this.initDirection);
                
                this.collection.bind('reset', this.resetList, this);
                
                if(this.options.deptid == undefined || this.descendantDept.length == 0){
                	this.dept = new Backbone.Model();
                	this.hasDescendantSelect  = false;
                }else{
                	this.dept = DeptModel.read(this.options.deptid);
                	this.hasDescendantSelect  = true;
                }
            },

            render : function() {
                var lang = {
                    '일간' : attndLang['일간'],
                    '월간' : attndLang['월간'],
                    '부서원' : commonLang['부서원'],
                    '정상' : attndLang['정상'],
                    '지각' : attndLang['지각'],
                    '수정' : attndLang['수정'],
                    '목록 다운로드' : attndLang['목록 다운로드'],
                    '부서명' : commonLang['부서명'],
                    '그룹' : attndLang['그룹'],
                    '선택' : commonLang['선택'],
                    '지각' : attndLang['지각'],
                    '오늘' : commonLang['오늘'],
                    '이전' : commonLang['이전'],
                    '다음' : commonLang['다음'],
                    '하위부서선택' : commonLang['하위 부서 선택']
                }
                
                var month = this.collection.getMonth();
                
                this.$el.html(Tmpl({
                    lang : lang,
                    data : {
                        logMonth : month,
                        days : this.getDays(month),
                        groups : this.groups.toJSON()
                    },
                    isDept : this.isDept,
                    descendantDept : this.descendantDept.toJSON(),
                    hasDescendantSelect : this.hasDescendantSelect,
                    dept : this.dept.toJSON()
                }));
                
                var self = this;
                
                this.collection.fetch({
                    statusCode: {
                        403: function() { GO.util.error('403'); }, 
                        404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                        500: function() { GO.util.error('500'); }
                    },
                    success : function(){
                        self.setInitSort(self.initProperty,self.initDirection);
                        self.renderPageSize();
                    },
                    beforeSend: function() {
                        self.preloader = $.goPreloader();
                    },
                });
                
                this.initDatePicker();

                $("body").trigger("ehr.attndListRender");
                
                return this;
            },
            
            initDatePicker : function(){
                var self = this;
                var calendar = self.$el.find("#list_cal");
                $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                calendar.datepicker({
                        dateFormat : "yy-mm",
                        changeMonth: true,
                        changeYear : true,
                        yearSuffix: "",
                        onSelect: function( selectedDate ) {
                            self.collection.setMonth(selectedDate);
                            self.render();
                        }
                  });
            },
            
            changeDept : function(e){
				var currentEl = $(e.currentTarget);
				var deptid = currentEl.val();
				this.collection.setDept(deptid);
				this.preloader = $.goPreloader();
				this.collection.fetch();
            },
            changeTab : function(){
                this.trigger("click:dailytab");
            },
            
            attndCalBtn : function(){
                $("#list_cal").trigger('focus');
            },
            
            moveTodayMonth : function(){
                var logMonth = moment().format("YYYY-MM");
                this.collection.setMonth(logMonth);
                this.render();
            },
            
            movePreMonth : function(){
                this.changeMonth(-1);
            },
            
            moveNextMonth : function(){
                this.changeMonth(1);
            },
            
            changeMonth : function(addMonth){
                var month = this.collection.getMonth();
                var logMonth = moment(month).add(addMonth, "months").format("YYYY-MM");
                this.collection.setMonth(logMonth);
                this.render();
            },
            
            getDays : function(month){
                var month = moment(month);
                var startDate = moment(month.format('YYYY-MM-DD')).startOf('month');
                var endDate = moment(month.format('YYYY-MM-DD')).endOf('month');
                var days = [];
                var holidays = this.getHolidays(month.format('YYYY'));
                while (startDate < endDate) {
                	var isHoliday = false;
            		for(var day in holidays) {
            			var holiday = new moment(holidays[day].startTime);
            			if(holiday.format('MM-DD') == startDate.format('MM-DD')) {
            				isHoliday = true;
            			}
            		}
            		
                    var day = startDate.format('YYYY-MM-DD');
                    days.push({
                        day : startDate.format('DD'),
                        isSaturday : moment(day).day() === 6,
                        isSunday : moment(day).day() === 0,
                        isHoliday : isHoliday
                    })
                    startDate.add(1, 'days');
                }
                return days;
            },
            
            resetList : function(list){
                var sDate = new Date().getTime(); 
                if (this.preloader) this.preloader.release();
                
                window.scrollTo(0,0);
                
                if (list.length == 0) {
                    $('#monthly_records').html(EmptyTmpl({
                        lang: { 'empty_data': attndLang['근태현황이 존재하지 않습니다.'] },
                        colspanCount : this.$el.find("th").length + 1
                    }));
                    
                    return;
                }
                
                var listBody = this.$el.find("#monthly_records");
                listBody.html("");
                list.each(function(model){
                    var monthlyItemView = new MonthlyItemView({model : model});
                    listBody.append(monthlyItemView.render().$el);
                });

				//GO-21755 - [유비쿼스] 전사 근태현황 표 깨짐 현상 으로 주석처리함.
                // GO-20587 월간 현황 상태이름이 길어지면 높이 맞지 않는 부분 처리
               /* this.$el.find("div.month_line").each(function(){
                    var $targetEl = $(this);
                    var $userEl = $targetEl.find("div.month_title table");
                    var $dataEl = $(this).find("div.tb_month_line_wrap");

                    $userEl.css({"height" : $dataEl.height() + "px"});

                });*/
                
                var eDate = new Date().getTime();  
                var resDate = (eDate - sDate) / 1000 ;
                console.info("==========================");
                console.info(resDate + " 초");
                console.info("==========================");
                this.renderPages();
            },
            
            //  초기sort 표기
            setInitSort: function(property,direction){
                var dataId = null;
                var sortPart = this.$el.find('th.department');
                sortPart.each(function(){
                    if ( $(this).attr('sort-id') == property ) {
                        dataId = $(this).attr('id');
                    } 
                    if( !$(this).hasClass('sorting_disabled') ) {
                        $(this).removeClass('sorting').addClass('sorting');
                        $(this).removeClass('sorting_desc').addClass('sorting');
                        $(this).removeClass('sorting_asc').addClass('sorting');
                    } 
                });
                $("#"+dataId).removeClass('sorting').addClass('sorting_'+direction);
                $('#keyword').val(this.ckeyword);
            },
            
            // 정렬
            sort: function(e){
                var id = '#'+$(e.currentTarget).attr('id');
                var property = $(id).attr('sort-id');
                var direction= 'desc';
                var removeClassName = "";
                var addClassName = "";
                if ( $(id).hasClass('sorting')) {
                    removeClassName = 'sorting';
                    addClassName = 'sorting_desc';
                }
                if ( $(id).hasClass('sorting_desc')) {
                    removeClassName = 'sorting_desc';
                    addClassName = 'sorting_asc';
                    direction= 'asc';
                }
                if ( $(id).hasClass('sorting_asc')) {
                    removeClassName = 'sorting_asc';
                    addClassName = 'sorting_desc';
                }
                $(id).removeClass(removeClassName).addClass(addClassName);
                var sortPart = this.$el.find('th.department');
                sortPart.each(function(){
                    if( !$(this).hasClass('sorting_disabled') && ( '#'+$(this).attr('id') != id )) {
                        $(this).removeClass('sorting').addClass('sorting');
                        $(this).removeClass('sorting_desc').addClass('sorting');
                        $(this).removeClass('sorting_asc').addClass('sorting');
                    } 
                });
                this.collection.setSort(property,direction);
                this.preloader = $.goPreloader();
                this.collection.fetch();
            },
            
            renderPages: function() {
                this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
                this.pageView.bind('paging', this.selectPage, this);
                //this.$el.find('div.tool_absolute > div.dataTables_paginate').remove();
                this.$el.find('div.page_navivation').html(this.pageView.render().el);
            },
            
            renderPageSize: function() {
                this.pageSizeView = new PageSizeView({pageSize: this.collection.pageSize});
                this.pageSizeView.render();
                this.pageSizeView.bind('changePageSize', this.selectPageSize, this);
            },
            
            selectPageSize: function(pageSize) {
                this.collection.setPageSize(pageSize);
                this.preloader = $.goPreloader();
                this.collection.fetch();
            },
            
            // 페이지 이동
            selectPage: function(pageNo) {
                this.collection.setPageNo(pageNo);
                this.preloader = $.goPreloader();
                this.collection.fetch();
            },
            
            // 검색
            search: function() {
                var searchtype = $('#searchtype').val();
                var keyword = "";
                if(searchtype=="group"){
                    keyword = this.$el.find("#search_group_filter").val();
                }else{
                    keyword =  $.trim($('#keyword').val());
                    if($('input#keyword').attr('placeholder') === this.$el.find('input#keyword').val()){
                        keyword = '';
                    }
                    
                    if( !keyword ){
                        $.goMessage(commonLang["검색어를 입력하세요."]);
                        $('#keyword').focus();
                        return false;
                    }
                    if (!$.goValidation.isCheckLength(2, 64, keyword)) {
                        $.goMessage(GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'],{"arg1" : "2","arg2" : "64"}));
                        $('#keyword').focus();
                        return false;
                    }
                }
                
                this.collection.setSearch(searchtype,keyword);
                this.preloader = $.goPreloader();
                this.collection.fetch();
            },
            // 엔터 검색
            searchByEnter: function(e) {
                if ( e.keyCode != 13 ) { return; }
                if ( e ) { e.preventDefault(); }
                $(e.currentTarget).focusout().blur();       
                this.search();
            },
            
            changeSearchType : function(e){
                var currentEl = $(e.currentTarget);
                
                this.$el.find("#keyword").val("");
                this.$el.find("#search_group_filter").val("").attr("selected", "selected");
                
                if(currentEl.val() == "group"){
                    this.$el.find("#search_group_filter").show();
                    this.$el.find("#keyword_section").hide();
                }else{
                    this.$el.find("#search_group_filter").hide();
                    this.$el.find("#keyword_section").show();
                }
            },
            
            download : function(){
            	var options = this.collection.getParam();
            	options.offset = 99999;
            	options.page = 0;
            	
                window.location.href = GO.contextRoot + "api/ehr/attnd/record/month/"+ this.collection.getMonth()+"/download?" + $.param(options);
            },
            
            getHolidays : function(year) {
    			var holidayEvents = {};
                $.ajax({
                    type: 'GET',
                    async: false,
                    dataType: 'json',
                    url: GO.config("contextRoot") + 'api/calendar/event/holiday/' + year,
                    success: function(resp) {
                        holidayEvents = resp.data;
                    }
                });
                return holidayEvents;
    		}
        });
        return MonthlyAttndList;

    });

})();