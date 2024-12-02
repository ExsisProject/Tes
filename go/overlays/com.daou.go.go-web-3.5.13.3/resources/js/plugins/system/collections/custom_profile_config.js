define(
[
"backbone"
],

function(
Backbone
) {
	var CustomProfileConfig = Backbone.Collection.extend({
		initialize : function(params){
			this.id = params.id;
		},
		url: function(){
			return GO.contextRoot+"ad/api/customprofile/configs/" + this.id
		}
	}, {
		getList : function(id){
			var instance = new CustomProfileConfig({id : id});
			instance.fetch({async:false});
			return instance;
		}
	});
	return {
		getList: function(id) {
			return CustomProfileConfig.getList(id);
		}
	};
});
