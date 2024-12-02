define("timeline/views/mobile/company_stat/company_stats", function(require){

    var Backbone = require("backbone");
    
    var AuthModel = require("timeline/models/auth");
    var CompanyStat= require("timeline/models/company_stat");
    
    var HeaderToolbarView = require('views/mobile/header_toolbar');
    var CompanyWeekStatItemView = require("timeline/views/mobile/company_stat/week/company_week_stat_item");
    var CompanyMonthStatItemView = require("timeline/views/mobile/company_stat/month/company_month_stat_item");
    var FilterView= require("timeline/views/mobile/company_stat/stat_filter");
    
    var Tmpl = require("hgn!timeline/templates/mobile/company_stat/company_stats");
    var PageTmpl = require("hgn!timeline/templates/mobile/company_stat/stat_page");
    var EmptyTmpl = require("hgn!timeline/templates/mobile/company_stat/stat_empty");
    
    var TimelineLang= require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");

    var StatsView = Backbone.View.extend({
    	bindEvent : function(){
        	var self = this;
        	$("#todayBtn").click(function(e){ self.moveToday(e); });
        	$("#prevDate").click(function(e){ self.prevDate(e); });
        	$("#nextDate").click(function(e){ self.nextDate(e); });
        	$("#viewType").change(function(e){ self.changeViewType(e); });
        	$("#prevPage").click(function(e){ self.goPage(e); });
        	$("#nextPage").click(function(e){ self.goPage(e); });
        },
        unbindEvent : function(){
        	$("#todayBtn").unbind("click");
        	$("#prevDate").unbind("click");
        	$("#nextDate").unbind("click");
        	$("#viewType").unbind("change");
        	$("#prevPage").unbind("click");
        	$("#nextPage").unbind("click");
        },
        initialize : function(param){
        	this.param = param;
            this.companyStat = new CompanyStat(param);
            
            this.authModel = new AuthModel(GO.util.store.get("timeline.auth"));
            this.isCreatable = this.authModel.isCreatable();
        },
        render : function() {
        	$(".content_page").html(Tmpl({
        		TimelineLang : TimelineLang,
        		CommonLang : CommonLang,
        		weekType : this.companyStat.isWeekType(),
        		monthType : !this.companyStat.isWeekType(),
        		dateInfo : moment().format("YYYY-MM"),
                isCompany:this.param.range == 'COMPANY',
                isDept:this.param.range == 'DEPARTMENT'
        	}));
            
        	this.fetchAndRenderContent();
        	
			return this;
        },
        fetchAndRenderContent : function() {
        	this.unbindEvent();
        	this.$el.empty();
            this.renderTitleToolbar();
            
        	 GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
             this.companyStat.fetch({async : true})
                 .done(_.bind(function(){
                	 $(".date").html(this.companyStat.getDateInfo());
                	 this.companyStat.initData();
                     this.renderData();
                     this.renderFilter();
                     this.renderPageSize();
                     $(window).scrollTop(0);
                     this.bindEvent();
                     GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                 },this));
        },
        renderPageSize : function() {
        	this.refinePageInfo();
        	$(".paging").html(PageTmpl({
        		CommonLang : CommonLang,
        		hasData : this.companyStat.hasData(),
        		page : this.pageInfo
        	}));
        },
        renderData : function() {
        	$("#timeline_stat_content").empty();
        	if(this.companyStat.isWeekType()){
                this.renderWeekContent();
            }
            else{
                this.renderMonthContent();
            }
        },
        renderFilter:function(){
            this.filterView = new FilterView({range:this.companyStat.range , options : this.filterObj});
            this.$el.find("#filter_parent").append(this.filterView.$el);
            this.filterView.render();
            this.filterView.bind('statFiltering', this.searchFilter, this);
         },
        renderWeekContent:function() {
        	if(_.isEmpty(this.companyStat.weeks.models)){
        		$("#timeline_stat_content").append(EmptyTmpl({
            		empty : CommonLang["데이터가 없습니다."]
            	}));
        		return;
        	}
        	
            for( var i = 0, week; week = this.companyStat.weeks.models[i]; i ++){
                var timelineCompanyItem = new CompanyWeekStatItemView(week);
                $("#timeline_stat_content").append(timelineCompanyItem.$el);
                timelineCompanyItem.render();
            }
        },
        renderMonthContent:function() {
        	if(_.isEmpty(this.companyStat.months.models)){
        		$("#timeline_stat_content").append(EmptyTmpl({
            		empty : CommonLang["데이터가 없습니다."]
            	}));
        		return;
        	}
        	for( var i = 0, month; month =this.companyStat.months.models[i]; i++){
                var timelineCompanyMonthItem = new CompanyMonthStatItemView(month);
                $("#timeline_stat_content").append(timelineCompanyMonthItem.$el);
                timelineCompanyMonthItem.render();
            }
        },
        moveToday : function (e) {
        	this.companyStat.moveToday();
        	this.fetchAndRenderContent();
        },
        prevDate : function(e){
        	this.companyStat.prevDate();
        	this.fetchAndRenderContent();
		},
		nextDate : function(e){
        	this.companyStat.nextDate();
        	this.fetchAndRenderContent();
		},
		changeViewType : function(e) {
			var selectedValue = $(e.currentTarget).val();
			this.companyStat.updateType(selectedValue);
			this.fetchAndRenderContent();
		},
		goPage : function(e) {
			var target = $(e.currentTarget);
			var value = target.attr("data-value");
			
			this.companyStat.page = this.pageInfo.pageNo + parseInt(value);
            this.fetchAndRenderContent();
		},
		searchFilter:function(filterObj){
            this.filterObj = filterObj;
            this.companyStat.filterQuery= filterObj.query;
            this.companyStat.page = 0;
            this.fetchAndRenderContent();
        },
        refinePageInfo : function() {
        	this.pageInfo  = this.companyStat.isWeekType() ? this.companyStat.weeks.pageInfo() : this.companyStat.months.pageInfo();
            
            this.pageInfo.isLastPage = this.pageInfo.pageNo == this.pageInfo.lastPageNo;
            this.pageInfo.firstIndex = (this.pageInfo.pageNo * this.pageInfo.pageSize) + 1;
            this.pageInfo.lastIndex = this.pageInfo.isLastPage ? this.pageInfo.total : (this.pageInfo.pageNo + 1) * this.pageInfo.pageSize;
        },
        renderTitleToolbar : function() {
        	var self = this;
        	var title = self.options.range == "COMPANY" ? TimelineLang["전사 근태현황"] : TimelineLang["부서 근태현황"];
        	var headerToolbarOption = {
                title : title,
                isList : true,
                isSideMenu: true,
                isHome: true
        	};
            this.headerToolbarView = HeaderToolbarView;
            this.headerToolbarView.render(headerToolbarOption);
        }
    });

    return StatsView;
});