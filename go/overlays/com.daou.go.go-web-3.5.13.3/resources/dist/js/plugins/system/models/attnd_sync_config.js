define(["backbone"],function(e){var t=e.Model.extend({urlRoot:GO.contextRoot+"ad/api/attnd/sync/config"},{get:function(){var e=new t;return e.fetch({async:!1}),e}});return{get:function(){return t.get()}}});