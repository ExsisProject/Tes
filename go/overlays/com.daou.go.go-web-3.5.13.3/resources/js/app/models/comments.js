define([
    "backbone"
],
function(Backbone) {
    var Form = Backbone.Model.extend({
        url: function(){
            //return this.url;
        	var url = [];
        	this.typeUrl = this.get('typeUrl');
			this.typeId = this.get('typeId');
			url = ["/api", this.typeUrl , this.typeId ,'comment'];
			if(this.id) url.push(this.id);
			
			return url.join('/');
        },
		setUrl : function(options) {
			this.url = options.url;
		}
    }); 
    return Form;
});
