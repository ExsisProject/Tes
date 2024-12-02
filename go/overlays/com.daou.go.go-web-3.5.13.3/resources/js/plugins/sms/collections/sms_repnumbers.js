define(
    [
        "backbone",
        "sms/models/sms_repnumber",
        "collections/paginated_collection"
    ],

    function(
            Backbone,
            SmsRepNumber,
            PaginatedCollection
    ) { 
    	
        var SmsRepNumbers = PaginatedCollection.extend({
            model : SmsRepNumber,
            
            url: function() {
            	var url = GO.contextRoot;
            	if(this.type == "company"){
            		url += "ad/"
            	}
            	url += "api/sms/repnumber";
    			url += "?" + this.makeParam();
    			
    			return url;
            },
            
            
            isEmpty : function() {
            	return this.models.length == 0;
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
					searchType : this.searchType
	            };
				
				return param;
	        }
        });
    
        return SmsRepNumbers;
    }
);