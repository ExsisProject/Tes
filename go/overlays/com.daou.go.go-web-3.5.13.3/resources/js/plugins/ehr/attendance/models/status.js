define([
	"backbone"
],

function(
	Backbone
) {
	var Status = Backbone.Model.extend({
		defaults : {
			
		},
		initialize : function() {
			
    	},
        getCompanyStatus : function() {
        	this.get('companyStatus');
        },
        getEndDate : function() {
        	this.get('endDate');
        },
        getStartDate : function() {
        	this.get('startDate');
        },
        getMemo : function() {
        	this.get('memo');
        },
        setCompanyStatus : function(companyStatus) {
        	this.set('companyStatus', companyStatus);
        },
        setEndDate : function(endDate) {
        	this.set('endDate', GO.util.toISO8601(moment(endDate)));
        },
        setStartDate : function(startDate) {
        	this.set('startDate', GO.util.toISO8601(moment(startDate)));
        },
        setMemo : function(memo) {
        	this.set('memo', memo);
        }
	});
	
	return Status;
});
