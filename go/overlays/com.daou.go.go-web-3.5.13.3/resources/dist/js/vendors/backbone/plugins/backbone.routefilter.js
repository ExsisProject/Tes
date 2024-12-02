/*! backbone.routefilter - v0.1.0 - 2012-09-10
* https://github.com/boazsender/backbone.routefilter
* Copyright (c) 2012 Boaz Sender; Licensed MIT */

/*! backbone.routefilter - v0.1.0 - 2012-08-29
* https://github.com/boazsender/backbone.routefilter
* Copyright (c) 2012 Boaz Sender; Licensed MIT */

(function(e,t){var n=e.Router.prototype.route,r=function(){};t.extend(e.Router.prototype,{before:r,after:r,route:function(e,r,i){i||(i=this[r]);var s=t.bind(function(){if(this.before.apply(this,arguments)===!1)return;i&&i.apply(this,arguments),this.after.apply(this,arguments)},this);return n.call(this,e,r,s)}})})(Backbone,_);