(function() {
	define([
        "backbone",
        "contact/models/contact" 
    ],

    function(
    		Backbone, 
    		Model
    ) {	
    	
		var searchContacts = Backbone.Collection.extend({
    		model : Model,

            default : {
                keyword : "",
                page : 0,
                offset : 20,
                property : 'nameInitialConsonant',
                direction : 'asc',
                ownerType : "" ,
                'searchType' : 'or'
            },

    		url: function() {
    			return "/api/contact/search";
    		},

            search : function(param){

                var options = $.extend({}, this.default, param);

                this.fetch({
                    data : options,
                    async : false,
                    reset : true
                });

                return this;
            },

            findById : function(id){
                var model = this.find(function(model){
                    console.log(model.get("id"));
                    return _.isEqual(model.get("id"), id);
                });

                return model;
            }
    	});
    	
    	return searchContacts;
    });
	
}).call(this);
