define(
    [
        "backbone",
        "board/models/post",
        "collections/paginated_collection"
    ],

    function(
            Backbone,
            PostModel,
            PaginatedCollection
    ) { 
        var Posts = PaginatedCollection.extend({
            model : PostModel,
            
            url: function() {
            	var url = GO.contextRoot + "api/board/" + this.boardId + "/posts/" + this.boardType;
            	
            	if (this.searchType) {
	    			url += "/search";
	    		} else if (this.isNoticeType) {
	    			url += "/notice";
	    		}
	    			
    			url += "?" + this.makeParam();
    			
    			return url;
            },
            
            setHeaderId : function(headerId) {
            	this.headerId = headerId;
            },
            
            setDuration : function(durationInput, params) {
                if (!params) { params = {}; }
            	var duration = durationInput || "";
            	
            	if (duration == "period") {
            		this.fromDate = GO.util.toISO8601(params.fromDate);
            		this.toDate = GO.util.searchEndDate(params.toDate);
            	}else if (duration != "" && duration != "all") {
            		var currentDate = GO.util.shortDate(new Date());
            		var startAt = GO.util.calDate(currentDate, "months", duration);
            		this.fromDate = GO.util.toISO8601(startAt);
            		this.toDate = GO.util.searchEndDate(currentDate);
            	} else {
            		this.fromDate = null;
            		this.toDate = null;
            	}
            	
            	this.duration = duration;
            },
            
            makeParam : function() {
				var param = {};
				var queryString = $.param({
					page: this.pageNo
				});
				if(this.pageSize && !this.isNoticeType) param["offset"] = this.pageSize;
				
				if (this.keyword) queryString += "&keyword=" + encodeURIComponent(this.keyword);
				if (this.property) param["property"] = this.property;
				if (this.direction) param["direction"] = this.direction;
				if (this.searchType) {
					param["searchType"] = this.searchType;
					param["sorts"] = 'createdAt desc';
				} else {
					param["sorts"] = 'sortCriteria desc,threadRootCode desc,threadCode asc';
				}
				
				if (this.headerId) param["headerId"] = this.headerId;
				if (this.fromDate) param["fromDate"] = this.fromDate;
				if (this.toDate) param["toDate"] = this.toDate;
				if (this.duration) param["duration"] = this.duration;
				
	        	if (!_.isEmpty(param)) queryString += "&" + $.param(param);
	        	
	        	return queryString;
	        },
	        
	        _getParam : function() {
	        	var param = {
	                pageNo: this.pageNo,
	                pageSize: this.pageSize,
	                keyword : this.keyword,
                	sorts : (this.searchType) ? 'createdAt desc'
						: 'sortCriteria desc,threadRootCode desc,threadCode asc',
                	property : this.property,
					direction : this.direction,
					searchType : this.searchType,
					headerId : this.headerId,
					fromDate : this.fromDate,
					toDate : this.toDate,
					duration : this.duration
	            };
				
				return param;
	        }
        });
    
        return Posts;
    }
);