define("timeline/views/company_stat/company_stats",function(require){var e=require("backbone"),t=require("hgn!timeline/templates/company_stat/company_stats"),n=require("timeline/views/company_stat/week/company_week_stat_item"),r=require("timeline/views/company_stat/week/company_day_title_item"),i=require("timeline/views/company_stat/month/company_month_stat_item"),s=require("timeline/views/company_stat/month/company_week_title_item"),o=require("timeline/views/company_stat/stat_filter"),u=require("timeline/models/company_stat"),a=require("views/pagination"),f=require("views/pagesize"),l=require("timeline/views/download_loading"),c=require("i18n!timeline/nls/timeline"),h=require("i18n!nls/commons"),p=require("underscore"),d=e.View.extend({events:{"click [data-profile]":"showProfile","click #xlsxDownBtn":"downExcel","click #monthBtn":"changeMonth","click #weekBtn":"changeWeek","click #todayBtn":"moveToday","click #nextDate":"nextDate","click #prevDate":"prevDate","click #searchDate":"clickCalendar","click #timeSort":"toogleSort"},initialize:function(e){this.param=e,this.companyStat=new u(e)},initDatePicker:function(){var e=this;this.$el.find("#calendarDatepicker").datepicker({dateFormat:"yy-mm-dd",changeMonth:!0,changeYear:!0,yearSuffix:"",onSelect:function(t){e.companyStat.setDate(t),e.fetchAndRenderContent()}})},render:function(){return this.$el.html(t({TimelineLang:c,CommonLang:h,companyStat:this.companyStat,weekClass:this.companyStat.isWeekType()?"on":"first",monthClass:this.companyStat.isWeekType()?"last":"on",dateInfo:moment().format("YYYY-MM"),isCompany:this.param.range=="COMPANY",isDept:this.param.range=="DEPARTMENT"})),console.log("excel view make : "+this.companyStat.isWeekType()),this.downloadingView=new l({getDownloadURL:"api/ehr/timeline/company/stats/excel"+this.companyStat.getQueryParam(),appendTarget:this.$el.find("div#timeline_list_length"),week:this.companyStat.isWeekType()}),this.initDatePicker(),this.fetchAndRenderContent(),this.renderPageSize(),this.downloadingView.render(),this},fetchAndRenderContent:function(){this.downloadingView.updateGetDownloadUrl("api/ehr/timeline/company/stats/excel"+this.companyStat.getQueryParam(),this.companyStat.isWeekType()),GO.EventEmitter.trigger("common","layout:setOverlay",""),this.companyStat.fetch({async:!0}).done(p.bind(function(){this.$el.find("#searchDate").text(this.companyStat.getDateInfo()),this.renderData(),this.renderFilter(),$(window).scrollTop(0),GO.EventEmitter.trigger("common","layout:clearOverlay",!0)},this))},renderFilter:function(){this.$el.find("#filter_parent").empty(),this.filterView=new o({range:this.companyStat.range,options:this.filterObj}),this.$el.find("#filter_parent").append(this.filterView.$el),this.filterView.render(),this.filterView.bind("statFiltering",this.searchFilter,this)},renderData:function(){this.companyStat.isWeekType()?this.renderWeekContent():this.renderMonthContent(),this.renderPages()},renderInitHeader:function(){this.$el.find("#timeline_stat_title").empty();var e=['<th class="sorting_disabled name"><span class="title_sort">'+h["\uc774\ub984"]+"</span></th>",'<th class="sorting total_time"><span id="timeSort" class="title_sort">'+c["\ub204\uc801\uadfc\ubb34\uc2dc\uac04"]+'<ins class="ic"></span></th>'];p.each(e,p.bind(function(e){this.$el.find("#timeline_stat_title").append(e)},this))},renderMonthContent:function(){this.renderInitHeader();for(var e=0,t;t=this.companyStat.weekList[e];e++){var n=new s(t);this.$el.find("#timeline_stat_title").append(n.$el),n.render()}if(this.companyStat.months.isEmpty()){this.renderEmptyInfo();return}this.$el.find("#timeline_stat_content").empty();for(var e=0,r;r=this.companyStat.months.models[e];e++){var o=new i(r);this.$el.find("#timeline_stat_content").append(o.$el),o.render()}},renderEmptyInfo:function(){var e=this.$el.find("#timeline_stat_title th").length,t="<tr class='odd'>     <td valign='top' colspan='"+e+"' class='dataTables_empty'>"+"      <p class='data_null'> "+"       <span class='ic_data_type ic_no_data'></span>"+"       <span class='txt'>"+h["\ub370\uc774\ud130\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."]+"</span>"+"      </p>"+"     </td>"+"    </tr>";this.$el.find("#timeline_stat_content").html(t)},renderWeekContent:function(){this.renderInitHeader();for(var e=0,t;t=this.companyStat.days[e];e++){var i=new r(t);this.$el.find("#timeline_stat_title").append(i.$el),i.render()}if(this.companyStat.weeks.isEmpty()){this.renderEmptyInfo();return}this.$el.find("#timeline_stat_content").empty();for(var e=0,s;s=this.companyStat.weeks.models[e];e++){var o=new n(s);this.$el.find("#timeline_stat_content").append(o.$el),o.render()}},renderPageSize:function(){this.pageSizeView=new f({pageSize:this.companyStat.offSet,el:this.$el.find(".dataTables_length")}),this.pageSizeView.render(),this.pageSizeView.bind("changePageSize",this.selectPageSize,this),this.pageSizeView.$el.find("select").addClass("tb_paging select_box")},renderPages:function(){var e=this.companyStat.isWeekType()?this.companyStat.weeks.pageInfo():this.companyStat.months.pageInfo();this.pageView=new a({pageInfo:e,useBottomButton:!0}),this.$el.append(this.pageView.$el),this.pageView.render(),this.pageView.bind("paging",this.selectPage,this),this.$el.find("div.tool_absolute > div.dataTables_paginate").remove(),this.$el.find("div.tool_absolute").append(this.pageView.render().el)},selectPage:function(e){this.companyStat.page=e,this.fetchAndRenderContent()},clickCalendar:function(){$("#calendarDatepicker").trigger("focus")},selectPageSize:function(e){this.companyStat.offSet=e,this.fetchAndRenderContent()},downExcel:function(){window.location.href=GO.contextRoot+"api/ehr/timeline/company/stats/excel"+this.companyStat.getQueryParam()},changeMonth:function(e){this.$el.find("#statType li").removeClass("on"),$(e.currentTarget).addClass("on"),this.companyStat.updateType("MONTH"),this.fetchAndRenderContent()},changeWeek:function(e){this.$el.find("#statType li").removeClass("on"),$(e.currentTarget).addClass("on"),this.companyStat.updateType("WEEK"),this.fetchAndRenderContent()},prevDate:function(){this.companyStat.prevDate(),this.fetchAndRenderContent()},nextDate:function(){this.companyStat.nextDate(),this.fetchAndRenderContent()},moveToday:function(){this.companyStat.moveToday(),this.fetchAndRenderContent()},toogleSort:function(){this.companyStat.toogleSort(),this.fetchAndRenderContent()},searchFilter:function(e){this.filterObj=e,this.companyStat.filterQuery=e.query,this.companyStat.page=0,this.fetchAndRenderContent()}});return d});