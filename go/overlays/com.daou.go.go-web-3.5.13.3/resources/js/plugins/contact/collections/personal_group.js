define(function(require) {	
	
	var Backbone = require("backbone");
	var Model = require("contact/models/personal_group");	
	
	var PersonalGroup = Backbone.Collection.extend({
		model : Model,
		url: function() {
			return "/api/contact/personal/group";
		},
	}); 
	
	return {
		// 호환성을 위해 유지
		getCollection: function(type) {
			var async = false;
			if(type == 'true') {
				async = true;
			}
			var PersonalGroupCollection = new PersonalGroup();
			PersonalGroupCollection.fetch({ async : async, reset : true});
			return PersonalGroupCollection;
		},
		/*
		
		 */
		promiseAsync : function() {
			var deferred = $.Deferred();

			var PersonalGroupCollection = new PersonalGroup();
			PersonalGroupCollection
				.fetch({async: true, reset : true})
				.then(function(){
					deferred.resolve(PersonalGroupCollection)
				});

			return deferred;
		},
		
		init : function() {
			return new PersonalGroup();
		}
	};	
});