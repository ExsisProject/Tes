define("models/base_model",function(){var e=require("backbone");return e.Model.extend({initialize:function(){this.deferred=$.Deferred(),this.isFetched=!1},fetch:function(t){t=t||{};if(this.isFetched&&t.useCache)return this.deferred;var n=t.success;return t.success=$.proxy(function(e){this.isFetched=!0,this.deferred.resolve(e),n&&n(this,e)},this),e.Model.prototype.fetch.call(this,t)},save:function(t,n){return this.isSaving||(this.isSaving=!0,this.promise=e.Model.prototype.save.apply(this,arguments).done($.proxy(function(){this.isSaving=!1},this))),this.promise}},{instanceMap:{},getInstance:function(e){var t=new this(e),n=t.url();return this.instanceMap[n]||(this.instanceMap[n]=t),this.instanceMap[n]},setInstance:function(e){var t=e.url();this.instanceMap[t]=e}})});