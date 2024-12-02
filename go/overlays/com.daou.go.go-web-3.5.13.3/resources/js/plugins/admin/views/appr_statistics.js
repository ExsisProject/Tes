//결재 통계
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "hgn!admin/templates/appr_statistics_list",
    "hgn!admin/templates/appr_statistics_listItem",    
    "hgn!approval/templates/doclist_empty",
    "i18n!approval/nls/approval",
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
    "jquery.ui"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	StatisticsListTpl,
	StatisticsListItemTpl,
	StatisticsListEmptyTpl,
	approvalLang,
    commonLang,
    adminLang
) {	
	
	var StatisticsModel = Backbone.Model.extend();
	var StatisticsList = Backbone.Collection.extend({
		model : StatisticsModel,
		url: function() {
			return GO.contextRoot + 'ad/api/approval/statistics'+'?'+$.param({startAt: this.startAt, endAt: this.endAt});
		},
		fetch: function(options) {
			typeof(options) != 'undefined' || (options = {});
			this.trigger("fetching");
			var self = this;
			var success = options.success;
			options.success = function(resp) {
				self.trigger("fetched");
				if(success) {
					success(self, resp); 
				}
			};
			options.reset = true;
			return Backbone.Collection.prototype.fetch.call(this, options);
		},
		setSearch : function(startAt, endAt){
			this.startAt = startAt;
			this.endAt = endAt;		
		}
	});
	
	
	
	var StatisticsListView = Backbone.View.extend({
		el: '#layoutContent',
		columns: {
			'날짜' : approvalLang.날짜,
			'진행': approvalLang.진행, 
			'완료': approvalLang.완료, 
			'반려': approvalLang.반려,
			'합계': approvalLang.합계, 
			'count': 5
		},
		initialize: function() {
			this.collection = new StatisticsList();
			this.collection.bind('reset', this.resetList, this);
			var startAt = GO.util.toISO8601(GO.util.toMoment(GO.util.now().format('YYYY-MM-DD')).add('days',-6));
			var endAt = GO.util.toISO8601(GO.util.toMoment(GO.util.now().format("YYYY-MM-DD")).add('days',1).subtract('seconds',1));
			this.collection.setSearch(startAt, endAt);
			this.collection.fetch({
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
			});
		},
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("change.statistics", "#selectDateOpt", $.proxy(this._changeSelectDateOpt, this));
            this.$el.on("click.statistics", "#btn_search_statistics", $.proxy(this._search, this));
            this.$el.on("click.statistics", "#apprStatisticsCvsDown", $.proxy(this._download, this));            
        }, 
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off();
            return this;
        },
        
        _changeSelectDateOpt : function(e){
            var endDate = this.$el.find("#endDate");
        	this._changeDateHandler(endDate.val());
        },
        
        _changeDateHandler : function(selectedDate){
            var startDate = this.$el.find("#startDate"), 
            endDate = this.$el.find("#endDate");
        	var selectDateOpt = $('#selectDateOpt > option:selected').val();
			switch(selectDateOpt) {
			case 'custom':
				startDate.datepicker('option', 'maxDate', selectedDate);
				break;
			case '7d':
				var day = GO.util.toMoment(endDate.val()).add('days',-6).format('YYYY-MM-DD');
				startDate.val(day);
				break;
			case '30d':
				var day = GO.util.toMoment(endDate.val()).add('days',-29).format('YYYY-MM-DD');
				startDate.val(day);
				break;
			case '60d':
				var day = GO.util.toMoment(endDate.val()).add('days',-59).format('YYYY-MM-DD');
				startDate.val(day);
				break;
			case '6m':
				var day = GO.util.toMoment(endDate.val()).add('months',-5).format('YYYY-MM-DD');
				startDate.val(day);
				break;
			}
			
			this._dateDisabledHandler();
        },
        
        _initDate : function(){
			var self = this;
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] ); 
           var startDate = this.$el.find("#startDate"), 
            endDate = this.$el.find("#endDate");
	            
           
			this.$el.find("#startDate").val(GO.util.now().format("YYYY-MM-DD"));
			this.$el.find("#endDate").val(GO.util.now().format("YYYY-MM-DD"));
           
	        startDate.datepicker({ 
	            dateFormat: "yy-mm-dd",
	            changeMonth: true,
	            changeYear: true,
	            yearSuffix: "",
	            maxDate : endDate.val()
	        });

	        endDate.datepicker({
	            dateFormat: "yy-mm-dd", 
	            changeMonth: true,
	            changeYear: true,
	            yearSuffix: "",
	            onClose : function(selectedDate){
	            	self._changeDateHandler(selectedDate);
	            }
	        });
	        $('#selectDateOpt > option[value="7d"]').attr('selected', 'selected').trigger('change');
        },
        
        _dateDisabledHandler : function(){
        	var selectDateOpt = $('#selectDateOpt > option:selected').val();
            var startDate = this.$el.find("#startDate");
        	if(selectDateOpt == 'custom'){
        		startDate.attr('disabled', false);
        	}else{
        		startDate.attr('disabled', true);        		
        	}
        },
        
		render: function() {
			var lang = {
					'날짜' : approvalLang.날짜,
					'진행': approvalLang.진행, 
					'완료': approvalLang.완료, 
					'반려': approvalLang.반려,
					'합계': approvalLang.합계, 
					'count': 5,
					"최근 24시간" : adminLang['최근 24시간'],
					"최근 7일간" : adminLang['최근 7일간'],
					"최근 30일간" : adminLang['최근 30일간'],
					"최근 60일간" : adminLang['최근 60일간'],
					"최근 6개월간" : adminLang['최근 6개월간'],
					"설치 이후" : adminLang['설치 이후'],
					"사용자 지정" : adminLang['사용자 지정'],
					"기안일 기준" : adminLang['기안일 기준'],
					"검색" : commonLang['검색'],
					"부서명" : adminLang['부서명'],
					"부서장" : adminLang['부서장'],
					"기간" : adminLang['기간'],
					"목록 다운로드" : adminLang['목록 다운로드']
			};
			
			
			
			this.$el.html(StatisticsListTpl({
				lang: lang				
			}));
			this._initDate();
		},		

		
		resetList: function(list) {
			
			var columns = this.columns;
			$('#appr_statistics_list_tb > tbody').empty();
			if (list.length == 0) {
				$('#appr_statistics_list_tb > tbody').append(StatisticsListEmptyTpl({
					columns : columns,
					lang: { 'doclist_empty': approvalLang['자료가 없습니다'] }
				}));
			}else{
				//var completeCntTot = 0;
				//var inprogressCntTot = 0;
				//var returnCntTot = 0;
				//var totalCntTot = 0;
				$(list.toJSON()).each(function(k, v){
					var data = {
							completeCnt : v.completeCnt,
							name : v.apprDate,
							inprogressCnt : v.inprogressCnt,
							returnCnt : v.returnCnt,
							totalCnt : v.totalCnt
					};
					
					$('#appr_statistics_list_tb > tbody').append(StatisticsListItemTpl({
						data : data
					}));

					//completeCntTot += data.completeCnt;
					//inprogressCntTot += data.inprogressCnt,
					//returnCntTot += data.returnCnt;
					//totalCntTot += data.totalCnt;
				});
				
				//var totalObj = {
				//		completeCnt : completeCntTot,
				//		inprogressCnt : inprogressCntTot,
				//		returnCnt : returnCntTot,
				//		totalCnt : totalCntTot
				//};
				
				//$('#appr_statistics_list_tb > tbody').append(StatisticsListItemTpl({
				//	isTotal : true,
				//	data : totalObj,
				//	name : approvalLang['합계']
				//}));
				this.$el.find('tr:last').addClass('total');
				this.$el.find('tr:last').addClass('last');
			}
		},

		
		
		// 검색
		_search: function() {
			this.collection.setSearch(GO.util.toISO8601(GO.util.toMoment($('#startDate').val())), GO.util.toISO8601(GO.util.toMoment($('#endDate').val()).add('days',1).subtract('seconds',1)));
			this.collection.fetch();
		},
		//CSV다운로드
		_download: function() {
			var url = "ad/api/approval/statistics/download?";
            var properties = {
            		"startAt" :GO.util.toISO8601(GO.util.toMoment($('#startDate').val())),
                	"endAt" : GO.util.toISO8601(GO.util.toMoment($('#endDate').val()).add('days',1).subtract('seconds',1))
            };
			GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
		},
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	return StatisticsListView;
});