(function(){define(["components/favorite/views/favorite"],function(e){var t=Backbone.View.extend({initialize:function(t){this.favoriteView=new e(t)},render:function(e){return this.favoriteView.render()}},{create:function(e){var n=new t(e);return n.render()}});return t})}).call(this);