define("views/base_view",function(require){return Backbone.View.extend({_isDetached:function(){return!this.$el.parents("body").length}},{instanceMap:{},getInstance:function(e,t){var n=this.instanceMap[e];if(!n||n._isDetached())n=new this(t),this.instanceMap[e]=n;return n}})});