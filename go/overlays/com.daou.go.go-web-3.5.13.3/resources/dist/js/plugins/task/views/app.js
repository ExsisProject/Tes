(function(){define(["backbone","when","i18n!task/nls/task","task/views/home","task/views/task_calendar","task/models/task_dept_auth","models/dept_root"],function(e,t,n,r,i,s,o){var u=GO.BaseView.extend({render:function(e){if(e)this._renderHome();else{var t=new s;t.fetch({success:$.proxy(function(e){e.get("true")?this._renderCalendar():this._renderHome()},this)})}return this},_renderHome:function(){var e=new r;e.dataFetch().done(function(){$("#content").append(e.render().el).addClass("go_renew"),e.renderTodos()})},_renderCalendar:function(){this._getDeptId().then($.proxy(function(e){var t=new i({deptId:e});this.$el.html(t.render().el)},this))},_getDeptId:function(){return t.promise(function(e){var t=GO.util.store.get("deptTreeId");t?e(t):(this.deptRoot=new o,this.deptRoot.fetch({success:function(t){e(t.id)}}))})}});return u})})();