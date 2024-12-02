(function() {
define([
    "backbone"
],

function(Backbone) {
	var commentReply = Backbone.Model.extend({
		url: function() {
			this.docId = this.get('docId');
			this.commentId = this.get('commentId');
			
			return ["/api/approval/document", this.docId ,'replycomment'].join('/');
		}
	}, {
		get : function(options) {
			return new commentReply(options);
		}
	}); 
	
	return commentReply;
});
}).call(this);