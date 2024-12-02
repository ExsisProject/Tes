define([
	"backbone", 
	"fixtures/core/user"
], 

function(
	Backbone, 
	userFixture
) {
	var GO = {
		"contextRoot": "/"
	};
	
	GO.config = function(key) {
		return {
			"contextRoot": GO.contextRoot
		}[key];
	};
	
	GO.session = function(key) {
		var sessionUser = userFixture[0];

		return {
			"id": sessionUser.id
		}[key];
	};

	GO.router = new Backbone.Router();

	return GO;
});
