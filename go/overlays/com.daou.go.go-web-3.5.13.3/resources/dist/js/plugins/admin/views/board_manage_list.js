define(["jquery","backbone","app","hgn!admin/templates/board_manage_list"],function(e,t,n,r){var i=null,s=t.View.extend({unbindEvent:function(){this.$el.off("click","span[data-btntype='bbsCreate']")},bindEvent:function(){this.$el.on("click","span[data-btntype='bbsCreate']",e.proxy(this.bbsCreate,this))},initialize:function(){this.unbindEvent(),this.bindEvent()},render:function(e){var t=r();this.$el.html(t)},bbsCreate:function(){n.router.navigate("/admin/board/create",!0)}},{create:function(){return i===null&&(i=new s({el:".admin_content"})),i.render()}});return{render:function(){var e=s.create();return e}}});