define("system/views/password_config",["jquery","backbone","app","hgn!system/templates/password_config","system/models/password_config","i18n!nls/commons","i18n!admin/nls/admin","jquery.go-grid","jquery.go-sdk","GO.util"],function(e,t,n,r,i,s,o){var u={label_set_password_config:o["\ube44\ubc00\ubc88\ud638 \ucc3e\uae30 \uc124\uc815"],label_password_finding_config:o["\ube44\ubc00\ubc88\ud638 \ucc3e\uae30"],label_password_finding_config_tooltip:o["\uc0ac\uc6a9\uc790\uac00 \uacc4\uc815 \ube44\ubc00\ubc88\ud638\ub97c \uc78a\uc5b4\ubc84\ub9b0 \uacbd\uc6b0, \uc784\uc2dc \ube44\ubc00\ubc88\ud638\ub97c \ubc1c\uae09\ubc1b\uc744 \uc218 \uc788\uc2b5\ub2c8\ub2e4."],label_use:o["\uc0ac\uc6a9"],label_notuse:o["\uc0ac\uc6a9\ud558\uc9c0 \uc54a\uc74c"],label_ok:s["\uc800\uc7a5"],label_cancel:s["\ucde8\uc18c"]},a=t.View.extend({initialize:function(e){this.render(),this.passwordSearchFeatureTrue=this.$("#passwordSearchFeature_true"),this.passwordSearchFeatureFalse=this.$("#passwordSearchFeature_false"),this.model=new i,this.model.on("sync",this.refresh,this),this.model.fetch()},events:{"click span#btn_ok":"save","click span#btn_cancel":"cancel","change input":"onChanged"},render:function(){e("#etcConfig").addClass("on"),e(".breadcrumb .path").html(o["\uae30\ud0c0 \uc124\uc815"]+" > "+u.label_set_password_config),this.$el.html(r({lang:u}))},onChanged:function(e){this.model.set("passwordSearchFeature",this.passwordSearchFeatureTrue.attr("checked")?!0:!1)},refresh:function(){this.model.get("passwordSearchFeature")?this.passwordSearchFeatureTrue.attr("checked",!0):this.passwordSearchFeatureFalse.attr("checked",!0)},save:function(){var t=this;t.model.save({},{type:"PUT",success:function(n,r){r.code=="200"&&(e.goMessage(s["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),t.initialize())}})},cancel:function(){this.render()}});return a});