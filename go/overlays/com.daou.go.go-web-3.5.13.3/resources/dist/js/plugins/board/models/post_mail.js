define(["backbone","app"],function(e,t){var n=e.Model.extend({initialize:function(e){this.boardId=e.boardId,this.postId=e.postId},url:function(){return[GO.contextRoot+"api/board",this.boardId,"post",this.postId,"email"].join("/")}});return n});