define(["backbone"],function(e){var t=e.Model.extend({url:function(){return this.get("admin")?"/ad/api/displayconfig":"/api/displayconfig"}},{get:function(e){var n=new t;return n.set({admin:e.admin?e.admin:!1}),n.fetch({async:!1}),n}});return{read:function(e){return displayConfig=t.get(e)}}});