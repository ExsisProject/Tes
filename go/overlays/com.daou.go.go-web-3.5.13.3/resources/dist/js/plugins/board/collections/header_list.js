define(["backbone"],function(){var e=null,t=Backbone.Collection.extend({initialize:function(e){this.options=e||{},this.boardId=this.options.boardId},url:function(){return"/api/board/"+this.boardId+"/header"},setBoardId:function(e){this.boardId=e}},{setFetch:function(n){return e=new t,e.setBoardId(n.boardId),e.fetch({async:!1}),e}});return{getHeaderList:function(e){var n=t.setFetch(e);return n},init:function(e){return new t(e)}}});