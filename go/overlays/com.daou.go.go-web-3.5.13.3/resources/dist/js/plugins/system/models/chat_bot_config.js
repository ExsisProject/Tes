define(["backbone"],function(e){var t=e.Model.extend({url:function(){return"/ad/api/system/chatbotconfig"}},{get:function(){var e=new t;return e.fetch({async:!1}),e}});return{get:function(){return t.get()}}});