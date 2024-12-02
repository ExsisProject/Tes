(function() {
define([ 
		"jquery", 
		"backbone", 
		"app",
		"i18n!nls/commons",
		"i18n!calendar/nls/calendar",
		"views/mobile/header_toolbar",
		"hgn!calendar/templates/mobile/m_search_result",
		"hgn!calendar/templates/mobile/m_search_result_unit",
		"calendar/collections/mobile/search_result",
		"jquery.go-validation",
		"GO.util"
	],
	function(
		$, 
		Backbone, 
		App,
		commonLang,
		calendarLang,
		HeaderToolbarView,
		LayoutTpl,
		LayoutUnitTpl,
		SearchListCollection
	) {
	var lang = {
			"no_result" : commonLang['검색결과없음'],
			"pull_down" : commonLang['업데이트하시려면 아래로 당기세요.'],
			"pull_up" : commonLang['더 보려면 위로 당기세요'],
			"keyword" : commonLang['검색어']
	};
	var layoutView = Backbone.View.extend({
		
		unbindEvent: function() {
			this.$el.off('vclick', 'a[data-btntype="resultEventWrap"]');
			this.$el.off("vclick", "a[data-btn='paging']");
		}, 
		
		bindEvent: function() {				
			this.$el.on('vclick', 'a[data-btntype="resultEventWrap"]', $.proxy(this.moveEvent, this));
			this.$el.on("vclick", "a[data-btn='paging']", $.proxy(this.goPaging, this));
		}, 
		initialize: function() {
			this.headerToolbarView = HeaderToolbarView;
			this.offset = 10;
		},
		moveEvent : function(e){
			e.preventDefault();
			var target = $(e.currentTarget);
			var calendarId = target.attr("data-calendarid");
			var eventId = target.attr("data-eventid");
			App.router.navigate('calendar/'+calendarId+"/event/"+eventId +"/" + decodeURIComponent(calendarLang['내 일정']),{trigger: true, pushState: true});
		},
		goPaging : function(e) {
			GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
			e.stopPropagation();
			
			var direction = $(e.currentTarget).attr('data-direction'),
				cPage = this.collection.page.page || 0;
			
			if(direction == 'prev' && cPage > 0) cPage--;
			else if(direction == 'next') cPage++;

			$(e.currentTarget).parents('.paging').remove();
			this.renderList(cPage);
			return false;
		},
		makeTemplete : function(opt){
			var collection = opt.collection;
			
			var parseTimeType = function(){
				
				if(this.timeType == "allday"){
					if(GO.util.isSameDate(this.startTime, this.endTime)){
						return GO.util.basicDate2(this.startTime);
					}
					return GO.util.basicDate2(this.startTime) + " ~ " + GO.util.basicDate2(this.endTime);  
					
				}else{
					var start,end;
					if(GO.util.isSameDate(this.startTime, this.endTime)){
						start = GO.util.basicDate(this.startTime);
						end = GO.util.hourMinute(this.endTime);
					}else{
						start = GO.util.basicDate(this.startTime);
						end = GO.util.basicDate(this.endTime);
					}					
				}
				
				return start + " ~ " + end;
			};
			
			
			var searchlistTpl;
						
			searchlistTpl = LayoutUnitTpl({
				dataSet:collection.toJSON(),
				lang:lang,
				parseTimeType:parseTimeType
			});
			return searchlistTpl;
			
		},
        renderList : function(page){
        	GO.util.appLoading(true);
        	var _this = this;
        	//var searchParams = App.router.getSearch();
        	var searchParams = GO.util.getSearchParam(window.MsearchParam);
        	
			var data = { 
					page: page || 0, 
        			offset: this.offset,
					stype : searchParams.stype,
					keyword : searchParams.keyword					
				};
			
			this.collection  = SearchListCollection.getCollection(data);
			this.collection.on("reset",function(collection,response){
				var searchlistUnitTpl = _this.makeTemplete({
					collection : _this.collection				
				});
				var searchlistTpl = LayoutTpl({
					keyword : searchParams.keyword,
					searchlistUnit : searchlistUnitTpl,
					lang:lang
				});
				
				_this.$el.html(searchlistTpl);
				//모바일 페이징 추가
				var pagingTpl = GO.util.mPaging(collection);
				_this.$el.find('dl').after(pagingTpl);
				
				GO.util.appLoading(false);
			});
        },
		render : function() {
			this.unbindEvent();
			this.bindEvent();
			this.renderList(GO.router.getSearch('page') || 0);

			this.headerToolbarView.render({
				isClose : true,
				title : commonLang['검색결과'],
				isWriteBtn : true,
				writeBtnCallback : function(){
					App.router.navigate('calendar/write/'+ GO.util.shortDate(new Date()),	{trigger: true, pushState: true});
				}
			});
		}
	},
	{
        __instance__: null,
        create: function() {
            /*if(this.__instance__ === null)*/ this.__instance__ = new this.prototype.constructor({el: $('#content')});
            return this.__instance__;
        },
        render: function() {
            var instance = this.create(),
                args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];                    
            return this.prototype.render.apply(instance, args);
        }            
	});	
	return layoutView;
});
}).call(this);