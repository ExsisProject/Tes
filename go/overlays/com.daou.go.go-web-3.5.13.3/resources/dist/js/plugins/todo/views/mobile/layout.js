define(["jquery","when","app","todo/models/todos","todo/views/mobile/side","views/layouts/mobile_default","views/mobile/header_toolbar","GO.m.util"],function(e,t,n,r,i,s,o){function f(e){e.headerToolbarView=o,e.headerToolbarView.render(e.toolbarOptions)}function l(){var r=t.defer(),s=this,o,u;return e("body").data("sideApp")===this.name?t.resolve(this):(o=new i({collections:this.collections,packageName:this.name}),u=this.getSideContentElement().append(o.el),o.render().then(function(){n.EventEmitter.trigger("common","layout:initSideScroll",this),u.parent().hide(),r.resolve(s)},r.reject),r.promise)}var u,a="skin_todo_type";return u=s.extend({name:"todo",className:"go_todo",title:"",collections:{},initialize:function(e){e=e||{},e.useSearch=!0,s.prototype.initialize.call(this,e),_.extend(this.options,e),this.headerToolbarView=null,this.toolbarOptions=this.options.toolbar,n.EventEmitter.on("common","layout:showSideMenu",this.clearLayers,this)},setToolbar:function(e){return this.toolbarOptions=e,this},render:function(){var e=this,n=this.name,i=t.defer();return this.clearContent(),s.prototype.render.call(this,n).done(function(t){f(this),r.fetchCollections().then(function(t){e.collections=t,l.call(e).then(i.resolve,i.reject)},i.reject)}),i.promise},remove:function(){n.EventEmitter.off("common","layout:showSideMenu",this.clearLayers),s.prototype.remove.apply(this,arguments)},clearLayers:function(){n.EventEmitter.trigger("todo","go.todo.detail.clearlayers")},buildContentView:function(e,t,n){t=t||{},n=n||!1;var r=this.getContentElement(),i;_.defaults(t,{append:!1});if(r.data("go-view-instance")){var s=r.data("go-view-instance"),o=_.isFunction(s.release)?s.release:s.remove;o.call(s)}return n?(i=new e(t),r.empty().append(i.el)):i=new e(_.extend(t,{el:this.getContentElement()})),r.data("go-view-instance",i),i},setTitle:function(e){return this.title=e,this},setTheme:function(e){this.$el.addClass(a+e)},getContentPageHeight:function(){var t=this.getBodyElement().height(),n=e("#titleToolbar").outerHeight();return t-n}},{__instance__:null}),u});