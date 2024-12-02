define(function(require) {
    var Backbone = require('backbone');

    var Query = Backbone.Model.extend({
    	defaults : {
    		companyId : "",
    		companyName : "",
    		jdbcId : "",
    		jdbcName : "",
    		keyColumns : "",
    		queryType : "",
    		query : ""
    	},
    	url : "/ad/api/sync/query"
    });

    return Query;
});
