define([
    'underscore',
    'backbone',
    "amplify",
    "app"
], function(
    _,
    Backbone,
    Amplify,
    GO
) {
	return Backbone.Collection.extend({
		initialize: function(models, options) {
			this.options = options || {};
			this.pageNo = 0;
			this.total = 0;
			this.extData = null;
			this.pageSize = this.options.offset ? this.options.offset : amplify.store( GO.session("loginId") + '-' + this._storeKey() + '-pagesize');
			this.deferred = $.Deferred();
			this.isFetching = false;
			typeof(this.pageSize) != 'undefined' || (this.setPageSize(20));
			
			this.setAttributes(options); // options 로 받은 속성들을 collection 의 속성으로 set 한다.
			if (this.options.restoreParam !== false) this.restoreParam(); // store 에 있는 param 복원시켜주는 역할.
		},
		fetch: function(options) {
			if (this.isFetching) return this.deferred;
			typeof(options) != 'undefined' || (options = {});
			this.trigger("fetching");
			this.isFetching = true;
			var self = this;
			var success = options.success;
			options.success = function(resp) {
				self.trigger("fetched");
				self.isFetching = false;
				if(success) {
					success(self, resp); 
				}
			};
			options.reset = true;
			Backbone.Collection.prototype.fetch.call(this, options).done(_.bind(function() {
				this.deferred.resolve();
			}, this));
			return this.deferred;
		},
		parse: function(resp) {
			this.pageNo = resp.page.page;
		    this.pageSize = resp.page.offset;
		    this.total = resp.page.total;
		    this.extData = resp.extParameter;
		    return resp.data;
		},
		pageInfo: function() {
			var lastPageNo = Math.ceil(this.total / this.pageSize);
			var info = {
				total: this.total,
				pageNo: this.pageNo,
				pageSize: this.pageSize,
				lastPageNo: lastPageNo ? lastPageNo - 1 : 0,
				pages: [],
				prev: false,
				next: false
		    };
			
			var navigationSize = this.navigationSize ? this.navigationSize : 10;
			
			var minPage = (Math.floor(info.pageNo / navigationSize) * navigationSize);
			var maxPage = (Math.ceil((info.pageNo+1) / navigationSize) * navigationSize);
			
			for (var i = minPage; i < maxPage; i++) {
				if (i > info.lastPageNo) {
					break;
				}
				info.pages.push(i);
			}
			
			if (this.pageNo > 0) {
				info.prev = true;
		    }
		    
		    if (this.pageNo < info.lastPageNo) {
		    	info.next = true;
		    }
		    
		    return info;
		},
		goPage: function(pageNo) {
			this.pageNo = pageNo;
			return this.fetch();
		},
		nextPage: function() {
			if (!this.pageInfo().next) {
				return false;
			}
			this.pageNo = this.pageNo + 1;
			return this.fetch();
		},
		prevPage: function() {
			if (!this.pageInfo().prev) {
				return false;
			}
			this.pageNo = this.pageNo - 1;
			return this.fetch();
		},

		/**
		 * 키가 페이지 주소 기반이므로 한 페이지에 여러 목록이 있는 경우 키를 만들어 주입하는 형태로 사용하자.
		 * 페이지 사이즈가 고정되어 있는 경우 저장하지 않아도 된다.
		 * @param pageSize
		 * @param useStore
		 */
		setPageSize: function(pageSize, useStore) {
			useStore = useStore !== false;
			this.pageSize = pageSize;
			if (useStore) amplify.store( GO.session("loginId") + '-' + this._storeKey() + '-pagesize', pageSize );
		},
		setPageNo: function(pageNo) {
			this.pageNo = pageNo;
		},
		setSearchType : function(searchType) {
			this.searchType = searchType;
		},
		setKeyword : function(keyword) {
			this.keyword = keyword;
		},
		getKeyword : function() {
			return this.keyword;
		},
		/**
		 * queryString 용 param.
		 * offset(pageSize) 과 page(pageNo) 에 주의.
		 */
		makeParam : function() {
			var param = {};
			var queryString = $.param({
				page: this.pageNo,
				offset: this.pageSize
			});
			
			if (this.keyword) queryString += "&keyword=" + encodeURIComponent(this.keyword);
			if (this.property) param["property"] = this.property;
			if (this.direction) param["direction"] = this.direction;
			if (this.searchType) param["searchType"] = this.searchType;
			
        	if (!_.isEmpty(param)) queryString += "&" + $.param(param);
        	
        	return queryString;
        },
        
        /**
         * 상속받는 콜렉션에서 구현.
         */
        setDuration : function() {
        	
        },
        
        /**
         * routing 2회까지 param 을 유지한다. 
         */
        storeParam : function() {
			GO.util.setRouterStorage('param', this._getParam());
        },
        
        restoreParam : function() {
        	var object = GO.util.getRouterStorage();
        	if (object && object.path == location.pathname) {
    			_.each(object.param, function(value, key) {
    				this[key] = value;
    			}, this);
        	}
        },
        
        /**
         * param 을 object 로 반환
         */
        _getParam : function() {
        	return {
                pageNo : this.pageNo,
                pageSize : this.pageSize,
                keyword : this.keyword,
            	property : this.property,
				direction : this.direction,
				searchType : this.searchType
            };
        },
		
		setAttributes : function(attributes) {
			_.each(attributes, function(value, key) {
				this[key] = value;
			}, this);
		},
		
		/**
		 * URL 에서 숫자(ID)를 제외한 부분을 pageSize store key 로 사용한다.
		 */
		_storeKey : function() {
			return location.pathname.replace(/[0-9]/g, "");
		},

		isEmpty : function(){
			return this.size() == 0;
		},

		mobilePageInfo: function () {
			var pageInfo = this.pageInfo();
			var page = pageInfo.pageNo;
			var total = pageInfo.total;
			var offset = pageInfo.pageSize;
			var isLastPage = pageInfo.pageNo === pageInfo.lastPageNo;
			var firstIndex = (page * offset) + 1;
			var lastIndex = isLastPage ? total : (page + 1) * offset;

			return {
				lastIndex: lastIndex,
				firstIndex: firstIndex
			};
		}
	});
});