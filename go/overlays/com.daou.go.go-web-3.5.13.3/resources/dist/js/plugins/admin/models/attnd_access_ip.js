define(["backbone"],function(e){var t=e.Model.extend({urlRoot:GO.contextRoot+"ad/api/ehr/attnd/ip"},{get:function(e){var n=new t;return n.set("id",e,{silent:!0}),n.fetch({async:!1}),n},create:function(){return new t}});return{read:function(e){return attndAccessIp=t.get(e)},create:function(){return t.create()}}});