(function(){var e=this,t=Array.prototype.slice,n,r="data-fspy-source",i="changed:attribute",s="restored:attribute",o="restored:all";n=function(){var e=function(e){if(!$(e).is("form"))throw new Error("Invaild Form Object");this.el=e,this.$el=$(e),this._prepareForm(),this.__changedAttributes__={}};return e.prototype={form:null,events:{"input[type=text]:not([data-fspy-bypass])":"change","input[type=text]:not([data-fspy-bypass][readonly])":"keyup paste","input[type=hidden]:not([data-fspy-bypass])":"change","textarea:not([data-fspy-bypass])":"keyup paste","select:not([data-fspy-bypass])":"change","input[type=checkbox]":"change","input[type=radio]":"click"},registry:function(e,t){var n=$(e),i=this._getSourceData(e),s=t||i;n.attr(r,s),i!==s&&this.registChangedAttr(n.attr("name"),i)},unregistry:function(e){var t=$(e);this.unregistChangedAttr(t.attr("name")),$(e).removeAttr(r)},registChangedAttr:function(e,t){return this.__changedAttributes__[e]=t,this.$el.trigger(i,[e,t,this]),this},unregistChangedAttr:function(e){return delete this.__changedAttributes__[e],this.$el.trigger(s,[e]),this.hasChangedAttrs()||this.$el.trigger(o,[e]),this},getChangedAttrs:function(e){return e?this.__changedAttributes__[e]:this.__changedAttributes__},hasChanged:function(e){return _.has(this.__changedAttributes__,e)},hasChangedAttrs:function(){return _.keys(this.__changedAttributes__).length>0},on:function(e,t,n){return this.$el.on(e,$.proxy(t,n||this))},off:function(e){var t;return typeof e=="undefined"?t=this.$el.off():t=this.$el.off(e,$.proxy(callback,context||this)),t},_prepareForm:function(){var e=this;this._findSpyElements().attr(r,function(){return e._getSourceData(this)}),this._unbindEvent()._bindEvent()},_bindEvent:function(){return _.each(this.events,function(e,t){var n=e+".formspy";this.$el.on(n,t,$.proxy(this._changeAttribute,this))},this),this},_unbindEvent:function(){return this.$el.off(".formspy"),this},_findSpyElements:function(){return this.$el.find("*:not([data-fspy-bypass])").filter(function(e){var t=$(this);return t.is("input")||t.is("textarea")||t.is("select")})},_getSourceData:function(e){var t="",n=$(e);return n.is("select")?t=n.find("option:selected").val():n.is("input[type=checkbox]")||n.is("input[type=radio]")?t=""+n.is(":checked"):t=n.val(),t},_changeAttribute:function(e){console.log("[FormSpy#_changeAttribute]");var t=$(e.currentTarget),n=t.attr("name"),r=this._getSourceData(e.currentTarget),i=t.attr("data-fspy-source")!==r||e.type=="paste";return t.is(":not([data-fspy-source])")?this:(i?this.registChangedAttr(n,r):this.unregistChangedAttr(n,r),this)}},e}(),e.FormSpy=n}).call(this);