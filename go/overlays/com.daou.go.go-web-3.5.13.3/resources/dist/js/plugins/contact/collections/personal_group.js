define(function(require){var e=require("backbone"),t=require("contact/models/personal_group"),n=e.Collection.extend({model:t,url:function(){return"/api/contact/personal/group"}});return{getCollection:function(e){var t=!1;e=="true"&&(t=!0);var r=new n;return r.fetch({async:t,reset:!0}),r},promiseAsync:function(){var e=$.Deferred(),t=new n;return t.fetch({async:!0,reset:!0}).then(function(){e.resolve(t)}),e},init:function(){return new n}}});