define("approval/components/apprflow_editor/views/base_tab",["backbone","hogan"],function(e,t){function f(){var e=t.compile(this.itemTemplate),n=this.$el.find(this.tabEl);n.empty(),_.each(this.getItemViews(),function(t,r){if(t.isEnabled()){var i=$(e.render({tabId:r,tabName:t.tabName}));i.attr("data-role","tab"),i.attr("data-tabid",r),n.append(i)}},this)}function l(){_.each(this.getItemViews(),function(e){var t=e.getTabId();e.remove(),delete this.__tabItemViews__[t]},this)}function c(e){_.isUndefined(e)&&(e=h.call(this)),e&&this.$el.find(i+e.getTabId()).length<1&&(this.$el.find(this.tabItemEl).append(e.el),e.render())}function h(){var e;return _.each(this.getItemViews(),function(t){t.isActivated()&&(e=t)},this),e||(e=this.getItemViewAt(0),e.activate()),e}function p(){_.each(this.getItemViews(),function(e){if(!e.isEnabled())return;var t=this.getTabElement(e.getTabId());e.isActivated()?t.addClass(this.activeTabClassName):t.removeClass(this.activeTabClassName)},this)}function d(){this.$el.on("click"+u,s,_.bind(v,this))}function v(e){var t=$(e.currentTarget);e.preventDefault(),this.activateTab(t.data("tabid")),e.stopPropagation()}function m(){this.$el.off(u)}var n="activated",r="deactivated",i=".tabview-",s="[data-role=tab]",o=".tab-item-container",u=".apprFlowEditor.tab",a=e.View.extend({__tabItemViews__:{},__rendered__:!1,tabEl:".apprflow-editor-tab",tabItemEl:o,itemTemplate:'<li><span class="txt">{{tabName}}</span></li>',activeTabClassName:"active",initialize:function(e){e=e||{},this.__tabItemViews__={},this.__rendered__=!1,e.tabEl&&(this.tabEl=e.tabEl),e.itemTemplate&&(this.itemTemplate=e.itemTemplate),d.call(this)},remove:function(){this.__tabItemViews__={},this.__rendered__=!1,m.call(this),l.call(this),e.View.prototype.remove.apply(this,arguments)},render:function(){f.call(this),this.activateTab()},addItemView:function(e){if(!e.usable())return;this.__tabItemViews__[e.getTabId()]=e},getItemViews:function(){return this.__tabItemViews__},getItemView:function(e){var t;return _.each(this.__tabItemViews__,function(n){n.getTabId()===e&&(t=n)},this),t},getItemViewAt:function(e){return _.values(this.__tabItemViews__)[e]},getTabElement:function(e){return this.$(s+"[data-tabid="+e+"]")},getTabElements:function(){return this.$(s)},disableTab:function(e){var t=this.getTabElement(e),n=this.getItemView(e);n.disable();if(n.isActivated()){var r=_.first(_.values(this.__tabItemViews__));this.activateTab(r.getTabId())}this.render()},enableTab:function(e){var t=this.getItemView(e);t.enable(),this.render()},activateTab:function(e){if(_.isUndefined(e)){var t=h.call(this);e=t.getTabId()}_.each(this.__tabItemViews__,function(t){t.getTabId()===e?(t.toggle(!0),c.call(this,t)):t.toggle(!1)},this),p.call(this)},getActiveTabItemView:function(){return h.call(this)}},{TAB_STATUS_ACTIVATED:n,TAB_STATUS_DEACTIVATED:r});return a});