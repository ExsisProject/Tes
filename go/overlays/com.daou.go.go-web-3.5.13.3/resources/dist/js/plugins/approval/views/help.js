(function(){define(["jquery","backbone","app","approval/models/help","hgn!approval/templates/help","i18n!nls/commons","jquery.go-popup","jquery.go-sdk"],function(e,t,n,r,i,s){var o=t.View.extend({el:"#content",type:{title:s["\ub3c4\uc6c0\ub9d0"],close:s["\ub2eb\uae30"]},initialize:function(){},render:function(t){e("#main").css("min-width","400px"),e("#main").css("background-image","none"),e("#main").attr("class","go_skin_default"),this.formId=this.options,this.modle=this.model=new r,this.model.set({id:this.formId}),this.model.fetch({async:!1});var n=this.model.toJSON();this.$el.html(i({type:this.type})),e("#help_content").html(n.description)}});return{render:function(e){var t=new o(e);return t.render(e)}}})}).call(this);