define(["backbone"],function(e){var t=null,n=e.Collection.extend({model:e.Model,url:function(){return"/ad/api/position/list"}},{get:function(){return t==null&&(t=new n),t.fetch({async:!1,contentType:"application/json"}),t}});return{getCollection:function(){return n.get()}}});