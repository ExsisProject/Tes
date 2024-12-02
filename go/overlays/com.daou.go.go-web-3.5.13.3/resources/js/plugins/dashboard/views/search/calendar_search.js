;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			"hgn!dashboard/templates/search/calendar_search",
			"i18n!calendar/nls/calendar",
			"collections/paginated_collection",
			"dashboard/views/search/search_form",
			"dashboard/views/search/no_search_result",
			"i18n!nls/commons",
			"i18n!calendar/nls/calendar",
			"GO.util"
	], 
	function(
			Backbone,
			Hogan,
			App,
			CalendarSearchTmpl,
			calLang,
			PaginatedCollection,
			SearchForm,
			NosearchResult,
			commonLang,
			calLang
	) {
		var lang = {
				empty_search_results : commonLang["검색결과없음"],
				more : commonLang['더보기'],
				calendar : commonLang['캘린더'],
				attendee : calLang['참석자']
		};
		
		var SearchList = PaginatedCollection.extend({
			//model: DocListItemModel,
			url: function() {
				var uri = '/api/search/calendar';
				
				var searchParam = $.param({
											stype: this.stype,
											type: this.type,
											keyword : this.keyword,
											fromDate: this.fromDate,
											toDate: this.toDate,
											page: this.pageNo, 
											offset: this.pageSize
										});
				if (this.stype == "detail") {
					searchParam =  $.param({
						stype: this.stype,
						keyword : this.keyword,
						fromDate: this.fromDate,
						toDate: this.toDate,
						page: this.pageNo, 
						offset: this.pageSize,
						summary : this.summary,
						attendees : this.attendees
					});
				}
				return uri + "?" + searchParam;
			},
			setListParam: function() {
				var searchParams = GO.router.getSearch();
				this.stype = searchParams.stype;
				this.keyword = searchParams.keyword ? searchParams.keyword.replace(/\+/gi, " ") : '' ;
				this.fromDate = searchParams.fromDate;
				this.toDate = searchParams.toDate;
				this.summary = this.keyword;
				this.attendees = this.keyword;
				this.pageNo = searchParams.page ? searchParams.page : 0;
				this.pageSize = searchParams.offset ? searchParams.offset : 20;
				sessionStorage.clear();
			}
		});
		
		var CalendarSerach = SearchForm.extend({
			
			events : {
				"click #btn_more" : "showMore",
				"click #calendarSummary" : "moveCalendarDetail"
			},
			
			initialize : function() {
				this.$el.off();
				this.param = GO.router.getSearch();
				if(this.param.stype != "simple"){
					this.param = {
							stype : this.param.stype,
							name : this.param.keyword,
							summary : this.param.keyword,
							attendees: this.param.keyword,
							fromDate : this.param.fromDate,
							toDate : this.param.toDate,
							page : this.param.page || 0,
							offset : this.param.offset || 5,
							appName : this.param.appName
					};
				}
				this.collection = new SearchList();
				this.collection.setListParam();
				this.collection.bind('reset', this.resetList, this);
				this.collection.fetch({
					statusCode: {
	                    403: function() { GO.util.error('403'); }, 
	                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
	                    500: function() { GO.util.error('500'); }
	                }
				});
			},
			
			render : function() {
				if(this.param.appName != undefined){
					var searchList = '<div class="cs_calendar_wrap">'+	
								'</div>'+
								'<div class="tool_bar tool_absolute">'+
								'<div class="dataTables_length"></div>'+
							'</div>';
					this.$el.append(searchList);
				}
				return this;
			},
			moveCalendarDetail : function(e) {
				var calendarId = $(e.currentTarget).attr("data-calendarId");
				var id = $(e.currentTarget).attr("data-id");
				
				window.open("/app/calendar/"+calendarId+"/event/"+id,"_blank","scrollbars=yes,resizable=yes,width=1280,height=760");
			},
			showMore : function(e) {
				this.param.appName = "calendar";
				this.showAppSearchMore(this.param);
			},
			getSearchTotalCount : function(){
				return 0//this.collection.page.total;
			},
			resetList: function(doclist) {
				if(this.param.appName != undefined){
					if(this.collection.pageInfo().total == 0){
						var nosearchResult = new NosearchResult({appName : commonLang["캘린더"]});
						this.$el.find("div.cs_calendar_wrap").html(nosearchResult.render().el);
						return;
					}
					this.$el.find('div.cs_calendar_wrap').html(CalendarSearchTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						convertStartTime : function() {
							return this.startTime == null ? "" : GO.util.shortDate2(this.startTime);
						},
						timeTerm : function() {
							if(this.timeType == 'allday'){
								return calLang["종일일정"];
							}else {
								return GO.util.hourMinute(this.startTime) + "~" + GO.util.hourMinute(this.endTime);
							}
						}
					}));
					this.renderPages();
				}else{
					if(this.collection.pageInfo().total == 0){
						$('#calendarEmptyMessage').show();
						return;
					}
					this.$el.html(CalendarSearchTmpl({
						lang : lang,
						dataset : this.collection.toJSON(),
						convertStartTime : function() {
							return this.startTime == null ? "" : GO.util.shortDate2(this.startTime);
						},
						timeTerm : function() {
							if(this.timeType == 'allday'){
								return calLang["종일일정"];
							}else {
								return GO.util.hourMinute(this.startTime) + "~" + GO.util.hourMinute(this.endTime);
							}
						}
					}));
				}
				this.removeMoreBtn();
			},
		});
		return CalendarSerach;
	});
}).call(this);