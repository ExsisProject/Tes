(function(){define(["backbone","community/models/communities"],function(e,t){var n=e.Collection.extend({model:t,url:function(){var e="/api/community/list";return this.type&&(e+="/"+this.type),e}});return n})}).call(this);