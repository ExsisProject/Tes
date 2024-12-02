define(
    [
        "backbone",
        "collections/paginated_collection",
        "i18n!nls/commons",
        "i18n!sms/nls/sms"
    ],

    function(
            Backbone,
            PaginatedCollection,
            commonLang,
            smsLang
    ) { 
    	
    	var SmsReceiver = Backbone.Model.extend({
        	isFail : function() {
        		return this.get("status") == "ERROR";
        	},
        	isSuccess : function() {
        		return this.get("status") == "DONE";
        	},
        	isProgress : function() {
        		return this.get("status") == "PROGRESS";
        	},
        	getReceiverName : function() {
        		if(this.get("receiverName")) {
        			return this.get("receiverName");
        		}else{
        			return smsLang["이름 없음"];
        		}
        	},
        	getReceiverNumber : function() {
        		return this.get("receiverNumber");
        	},
        	getStatusText : function() {
        		if(this.isFail()) {
        			return commonLang["실패"]
        		}else if(this.isSuccess()) {
        			return commonLang["성공"];
        		}else if(this.isProgress()) {
        			return smsLang["발송중"];
        		}else{
        			return smsLang["발송 대기"];
        		}
        	},
        	getResultMessage : function() {
        		if(this.get("resultMessage")) {
        			return this.get("resultMessage");
        		}else{
        			return this.getStatusText();
        		}
        	}
        });
        
        var SmsReceivers = PaginatedCollection.extend({
            model : SmsReceiver,
            
            url: function() {
            	var url = GO.contextRoot + "api/sms/" + this.smsMessageId + "/receivers";
    			url += "?" + this.makeParam();
    			
    			return url;
            },
            
            
            isEmpty : function() {
            	return this.models.length == 0;
            },
            
            /**
    		 * object 를 한번에 collection 속성으로 넣어줌.
    		 * @method setAttributes
    		 * @return {Object} 
    		 */
    		setAttributes : function(obj) {
    			_.each(obj, function(value, key) {
    				this[key] = value;
    			}, this);
    		},
    		
    		/**
    		 * paging collection 의 parameter 를 반환
    		 * @method _makeParam
    		 * @return {Object} page info
    		 */
    		_makeParam : function() {
    		    return $.param({
                    page: this.pageNo,
                    offset: this.pageSize,
                    property: this.property,
                    direction: this.direction
                });
    		}
        });
    
        return SmsReceivers;
    }
);