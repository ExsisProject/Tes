(function(){define(["app","views/layouts/admin_default","admin/views/side_admin","i18n!admin/nls/admin"],function(e,t,n,r){var i=function(){var e=function(){};return e.prototype={renderContent:function(e,r,i,s,o){require([i],function(i){t.setTitle(s).render().done(function(s){var u=new n({menuGroup:e,leftMenu:r}),a=new i(o);t.getSideElement().html(u.el),t.getContentElement().html(a.el),u.render(),a.render()})})}},e}();return new i})}).call(this);