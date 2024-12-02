define(
    [
        "backbone",
        "sms/models/sms_info",
        "collections/paginated_collection"
    ],

    function(
            Backbone,
            SmsInfo,
            PaginatedCollection
    ) { 
    	
        var SmsInfos = PaginatedCollection.extend({
            model : SmsInfo,
            
            url: function() {
            	var url = GO.contextRoot;
            	if(this.type == "company"){
            		url += "ad/"
            	}
            	url += "api/sms/" + this.type + "/stat";
    			url += "?" + this.makeParam();
    			
    			return url;
            },
            
            
            isEmpty : function() {
            	return this.models.length == 0;
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
					page: this.pageNo,
					offset: this.pageSize
				});
				
				if (this.keyword) queryString += "&keyword=" + encodeURIComponent(this.keyword);
				if (this.property) param["property"] = this.property;
				if (this.direction) param["direction"] = this.direction;
				if (this.searchType) param["searchType"] = this.searchType;
				
				if (this.fromDate) param["fromDate"] = this.fromDate;
				if (this.toDate) param["toDate"] = this.toDate;
				
	        	if (!_.isEmpty(param)) queryString += "&" + $.param(param);
	        	
	        	return queryString;
	        },
	        
	        _getParam : function() {
	        	var param = {
	                pageNo: this.pageNo,
	                pageSize: this.pageSize,
	                keyword : this.keyword,
                	property : this.property,
					direction : this.direction,
					searchType : this.searchType,
					fromDate : this.fromDate,
					toDate : this.toDate,
					duration : this.duration
	            };
				
				return param;
	        }
        });
    
        return SmsInfos;
    }
);