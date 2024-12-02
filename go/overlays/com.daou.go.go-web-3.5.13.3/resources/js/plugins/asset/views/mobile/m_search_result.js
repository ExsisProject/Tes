(function() {
define([ 
		"jquery", 
		"backbone", 
		"app",
		"i18n!nls/commons",
		"i18n!asset/nls/asset",
		"views/mobile/header_toolbar",
		"hgn!asset/templates/mobile/m_search_result",
		"hgn!asset/templates/mobile/m_search_result_unit",
		"asset/collections/search_result",
		"asset/collections/asset_admin",
		"jquery.go-validation",
		"GO.util"
	],
	function(
		$, 
		Backbone, 
		App,
		commonLang,
		assetLang,
		HeaderToolbarView,
		LayoutTpl,
		LayoutUnitTpl,
		SearchListCollection,
		assetAdminCol
	) {
	var lang = {
			"non_result" : commonLang['검색결과없음'],
			"pull_down" : commonLang['업데이트하시려면 아래로 당기세요.'],
			"pull_up" : commonLang['더 보려면 위로 당기세요'],
			"keyword" : commonLang['검색어']
	};
	var layoutView = Backbone.View.extend({
		
		unbindEvent: function() {
			this.$el.off('vclick', 'li[data-btntype="resultEventWrap"]');
			this.$el.off("vclick", "a[data-btn='paging']");
		}, 
		
		bindEvent: function() {
			this.$el.on('vclick', 'li[data-btntype="resultEventWrap"]', $.proxy(this.moveEvent, this));
			this.$el.on("vclick", "a[data-btn='paging']", $.proxy(this.goPaging, this));
		}, 
		initialize: function() {
			this.headerToolbarView = HeaderToolbarView;
			this.offset = 10;
		},
		moveEvent : function(e){
			e.preventDefault();
			e.stopPropagation();
			var target = $(e.currentTarget);
			var assetId = target.attr('data-assetid');
			var itemId = target.attr('data-itemid');
			var isRental = target.attr('data-isrental');
			var url;
			if(isRental == "true"){
				//대여
				var status = target.attr('data-rentstatus');
				if(status == "RENTABLE"){
					//대여하기 페이지
					url = ['asset',assetId,'item',itemId,'create','rental'];						
				}else if(status == "RETURN" || status == "NORENTABLE"){
					// 대여 상세보기
					url = ['asset',assetId,'item',itemId,'status','rental'];
				}
				
			}else{
				// 예약 - 월간뷰로 이동
				var assetName = target.attr('data-assetname');
				url = ['asset/monthly',assetId,itemId,assetName, GO.util.shortDate(GO.util.now())];
			}				
			GO.router.navigate(url.join('/'),true);
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
		getAttribute : function(){
        	var itemCol = assetAdminCol.getCollection({assetId : GO.util.getSearchParam(window.MsearchParam).assetId, type : 'info'});
        	return itemCol;
        },
		makeTemplete : function(opt){
			
			var collection = opt.collection;
			var attrCol = opt.attrCol;
			
			if(collection){
				$.each(collection,function(k,v){
	        		$.each(v.properties,function(m,n){
	        			$.each(attrCol.attributes,function(o,p){
	        				if(n.attributeId == p.id){
		        				n.attrName = p.name;
		        			}
	        			});
	        		});
	        	});
			}
			
			var parseAttr = function(){
        		var attrArray = [];
        		if(this.properties){
	        		$.each(this.properties,function(k,v){
	        			attrArray.push('<span class="txt">'+v.attrName+' : '+v.content+'</span>');
	        		});
        		}
        		return attrArray.join('<span class="part">|</span>');
        	};
        	var data = {
        			dataset:collection,
        			parseAttr : parseAttr,
        			lang : lang
        	};
			
			return LayoutUnitTpl(data);
			
		},
        renderList : function(page){
        	GO.util.appLoading(true);
        	var _this = this;
        	//var searchParams = App.router.getSearch();
        	var searchParams = GO.util.getSearchParam(window.MsearchParam);
        	
			var data = { 
					page: page || 0, 
        			offset: this.offset,
        			nameKeyword : searchParams.nameKeyword,		
					assetId : searchParams.assetId
				};
			
			this.attrCol = this.getAttribute();
			this.collection  = SearchListCollection.getCollection(data);
			this.collection.on("reset",function(collection,response){
				var searchlistUnitTpl = _this.makeTemplete({
					collection : _this.collection.toJSON(),
					attrCol : _this.attrCol.toJSON()[0],
				});
				var searchlistTpl = LayoutTpl({
					keyword : searchParams.nameKeyword,
					searchlistUnit : searchlistUnitTpl,
					lang:lang
				});
				
				//모바일 페이징 추가
				var pagingTpl = GO.util.mPaging(collection);
				_this.$el.html(searchlistTpl).find('ul.list_normal').append(pagingTpl);
				GO.util.appLoading(false);
			});
        },
		render : function() {
			this.unbindEvent();
			this.bindEvent();
			this.$listEl = this.$el.find('ul.list_normal');
			this.renderList(GO.router.getSearch('page') || 0);
			this.headerToolbarView.render({
				isClose : true,
				title : commonLang['검색결과']
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