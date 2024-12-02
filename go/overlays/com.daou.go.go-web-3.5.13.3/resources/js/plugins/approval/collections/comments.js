define([
    "backbone",
    "approval/models/comment" 
],

function(
		Backbone, 
		Model
) {	
	var Comment = Backbone.Collection.extend({
		model : Model,
		url: function() {
			return ["/api/approval/document", this.docId, 'comment'].join('/');
		},
		setIds : function(options) {
			this.docId = options.docId;
		},
        removeById: function(commentId) {
            var target = this.find(function(m) {
                return commentId == m.get('id');
            });
            this.remove(target);
        }
	}); 
	
	return {
		getCollection: function(options) {
			var comment = new Comment();
			comment.setIds(options);
			comment.fetch({ async : false, reset: true });
			return comment;
		}		
	};
});