define(["backbone"],function(e){var t=null,n=e.Model.extend({url:function(){return this.get("admin")?"/ad/api/task/config":"/api/task/config"}},{get:function(e){return t==null&&(t=new n),t.set({admin:e.admin?e.admin:!1}),t.fetch({async:!1}),t}});return{read:function(e){return TaskConfigModel=n.get(e)}}});