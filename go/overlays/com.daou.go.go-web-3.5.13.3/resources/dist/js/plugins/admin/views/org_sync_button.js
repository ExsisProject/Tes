define("admin/views/org_sync_button",function(require){var e=require("jquery"),t=require("underscore"),n=require("backbone"),r=require("app"),i=require("i18n!admin/nls/admin"),s=require("i18n!nls/commons"),o=Hogan.compile(['<span class="ic_adm ic_syn"></span>','<span class="txt">',i["\ucc44\ub110 \uc989\uc2dc \ub3d9\uae30\ud654"],"</span>"].join(""));return n.View.extend({tagName:"span",className:"btn_tool",events:{"click span":"manualSync"},initialize:function(e){this.orgSyncable=r.config("orgSyncWaitMin")>0,this.fetchOrgSyncTask(),this.description=e.description},render:function(){return this.$el.html(o.render()),this},manualSync:function(){if(this.$el.hasClass("disabled"))return;var t=this;e.goPopup({title:i["\ucc44\ub110 \uc989\uc2dc \ub3d9\uae30\ud654"],message:this.description,buttons:[{btype:"confirm",btext:s["\ud655\uc778"],callback:function(){t.$el.addClass("disabled"),e.ajax({url:r.contextRoot+"ad/api/oauthsync/manually/"+r.session("companyId"),success:function(){e.goSlideMessage(i["\ub3d9\uae30\ud654 \uc694\uccad \uc644\ub8cc"])}})}},{btype:"cancel",btext:s["\ucde8\uc18c"]}]})},disable:function(){this.$el.removeClass("disabled"),console.log("disable")},fetchOrgSyncTask:function(){if(this.orgSyncable){var t=this;e.ajax({url:r.contextRoot+"ad/api/oauthsync/target/exist/"+r.session("companyId"),success:function(e){t.$el.toggleClass("disabled",!e.data)}})}}})});