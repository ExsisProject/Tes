define(["backbone"],function(e,t){var n=e.Collection.extend({url:function(){return this.url},setUrl:function(e){this.url=e.url},hasFavorite:function(){return this.length>0}});return{get:function(e){var t=new n;return t.setUrl(e),t.fetch({data:{offset:1e3},async:!1,reset:!0}),t},create:function(e){var t=new n;return t.setUrl(e),t}}});