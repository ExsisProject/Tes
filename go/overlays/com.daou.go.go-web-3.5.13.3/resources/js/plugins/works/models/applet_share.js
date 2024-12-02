define(function(require) {
	var Share = Backbone.Model.extend({
    	url : function(){
    		return GO.config('contextRoot') + 'api/works/applets/' + this.get('id') + '/share';
    	}
    });
	
	return Share;
});