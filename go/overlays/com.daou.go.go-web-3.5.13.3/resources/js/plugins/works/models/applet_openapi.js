define(function(require) {
	var OpenApi = Backbone.Model.extend({
		initialize: function (options) {
			options = options || {};
			this.appletId = options.appletId;
		},
    	url : function(){
    		return GO.config('contextRoot') + 'api/works/applets/' + this.appletId + '/openapi';
    	},
		validate : function(attrs) {
			var paramNameRegExp = /^[a-zA-Z0-9-_]*$/;
			var fieldParam = attrs.fieldParamMap;
			if(attrs.useApi) {
				if (_.isEmpty(attrs.apiKey)) {
					return {"name":"apiKey","message":"validate.empty.token"};
				}
				if (_.size(fieldParam) == 0) {
					return {"name":"fieldParam","message":"validate.check.field"}
				}
			}

			var errors = [];
			_.each(fieldParam, function(value, key) {
				if (_.isEmpty(value)) {
					errors.push({"name":"fieldParam","item":true, "cid":key, "message":"validate.empty.field"});
					return true;
				}
				if (!paramNameRegExp.test(value)) {
					errors.push({"name":"fieldParam","item":true, "cid":key, "message":"validate.invalid.field"});
					return true;
				}
				if (value.length > 20) {
					errors.push({"name":"fieldParam","item":true, "cid":key, "message":"validate.field.length"});
					return true;
				}
			});

			if (!_.isEmpty(errors)) {
				return errors;
			}

			if (attrs.useUpdate) {
				if (_.isEmpty(attrs.updateFieidCid)) {
					return {"name":"updateFieidCid", "message":"validate.empty.update"};
				}

				var fieldMatch = false;
				_.each(fieldParam, function(value, key) {
					if (attrs.updateFieidCid == key) {
						fieldMatch = true;
						return false;
					}
				});

				if (!fieldMatch) {
					return {"name":"updateFieidCid", "message":"validate.notmatch.update"};
				}
			}
		}
    });
	
	return OpenApi;
});