define(["jquery","backbone","app","hgn!system/templates/install_complete","i18n!nls/commons","i18n!admin/nls/admin","jquery.go-orgslide","jquery.go-sdk","jquery.go-validation","swfupload","swfupload.plugin"],function(e,t,n,r,i,s){var o={install_complete:s["\ub4f1\ub85d\uc774 \uc644\ub8cc \ub418\uc5c8\uc2b5\ub2c8\ub2e4"],install_complete_message:s["\uc124\uce58 \uc644\ub8cc \uba54\uc138\uc9c0"],move_login:s["\ub85c\uadf8\uc778 \ud654\uba74\uc73c\ub85c \uc774\ub3d9"]},u=null,a=n.BaseView.extend({initialize:function(){this.deleteInstallUser()},events:{},render:function(){var e=this,t=r({lang:o});this.$el.html(t)},deleteInstallUser:function(){var t=GO.contextRoot+"ad/api/user/delete/install/user";e.go(t,"",{qryType:"DELETE",responseFn:function(e){e.code==200&&e.data.duplicated},error:function(t){var n=JSON.parse(t.responseText);e.goMessage(n.message)}})}},{create:function(e){return u=new a({el:"#installLayout"}),u.render()}});return{render:function(e){var t=a.create(e);return t}}});