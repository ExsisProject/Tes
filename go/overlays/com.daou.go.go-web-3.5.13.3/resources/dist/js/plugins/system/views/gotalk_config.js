(function(){define(["jquery","backbone","app","hgn!system/templates/gotalk_config","i18n!admin/nls/admin","jquery.go-popup"],function(e,t,n,r,i){var s={"Gotalk \uc124\uc815":i["Gotalk \uc124\uc815"],"\ubb34\ub8cc\ubc29 \uc0dd\uc131":i["\ubb34\ub8cc\ubc29 \uc0dd\uc131"],"\uc0dd\uc131":i["\uc0dd\uc131"]},o=t.View.extend({events:{"click span#btn_ok":"createFreeRoomByAll"},initialize:function(){this.gotalkConfigModel=new t.Model,this.gotalkConfigModel.url="/ad/api/gotalkconfig"},createFreeRoomByAll:function(){this.gotalkConfigModel.save({},{success:function(){e.goMessage("SUCCESS")},error:function(t){e.goMessage("FAIL: "+t.message)}})},render:function(){return this.$el.html(r({lang:s})),e(".breadcrumb .path").html(i["Gotalk \uc124\uc815"]),this.$el}});return o})}).call(this);