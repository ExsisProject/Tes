(function() {
define([
    "backbone"
],

function(Backbone) {
	var commentReply = Backbone.Model.extend({
		url: function() {
			this.typeUrl = this.get('typeUrl');
			this.typeId = this.get('typeId');
			this.commentId = this.get('commentId');
			
			return ["/api", this.typeUrl , this.typeId ,'comment', this.commentId,'reply'].join('/');
		}
	}, {
		get : function(options) {
			return new commentReply(options);
		}
	}); 
	
	return commentReply;
});
}).call(this);