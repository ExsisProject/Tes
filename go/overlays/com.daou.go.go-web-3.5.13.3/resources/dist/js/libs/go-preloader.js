(function(e,t,n,r){function o(t,n){this.el=t,this.$el=e(this.el),this.options=e.extend({},s,n||{}),this._defaults=s,this._name=i,this.init()}var i="goPreloader",s={classnames:"overlay",fadeoutTime:500,lazy:!1};o.prototype={init:function(){},render:function(){this.options.classnames&&this.$el.addClass(this.options.classnames),this.$el.show(),e(n).trigger("showLayer.goLayer")},release:function(){this.$el.remove(),e(n).trigger("hideLayer.goLayer"),t.GO_Preloader=null},option:function(t,n){if(e.isPlainObject(t))this.options=e.extend(!0,this.options,t);else{if(t&&typeof n=="undefined")return this.options[t];this.options[t]=n}}},e.fn[i]=function(t){var n=Array.prototype.slice(arguments,1);return this.each(function(){var r;e.data(this,"plugin_"+i)||e.data(this,"plugin_"+i,new o(this,t||{})),r=e.data(this,"plugin_"+i);if(!r.options.lazy&&(e.isPlainObject(t)||e.type(t)==="undefined"))r.render();else{if(e.type(t)!=="string"||!r[t])throw new Error("\uc9c0\uc6d0\ud558\uc9c0 \uc54a\ub294 \uc635\uc158\uc785\ub2c8\ub2e4.");r[t].apply(r,n)}})},e[i]=function(){e("#preloaderOverlay").remove();var t=e('<div id="preloaderOverlay" style="z-index: 100" data-layer><div class="processing"></div></div>').hide().appendTo("body");return t[i].call(t),t.data("plugin_"+i)}})(jQuery,window,document);