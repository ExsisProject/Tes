define("works/views/app/download_manager_btn",function(require){var e=require("i18n!works/nls/works"),t=require("i18n!nls/commons"),n=require("components/backdrop/backdrop"),r=Hogan.compile(['<ul class="array_type">','<li id="currentDownload"><span>'+e["\ud604\uc7ac \ud398\uc774\uc9c0 \ub2e4\uc6b4\ub85c\ub4dc"]+"</span></li>",'<li id="totalDownload"><span>'+e["\uc804\uccb4 \ud398\uc774\uc9c0 \ub2e4\uc6b4\ub85c\ub4dc"]+"</span></li>","</ul>"].join(""));return n.extend({className:"array_option list_download",events:{"click #currentDownload":"_onClickCurrentDownload","click #totalDownload":"_onClickTotalDownload"},initialize:function(e){this.appletId=e.appletId,this.conditions=e.conditions,this.backdropToggleEl=this.$el,this.bindBackdrop()},render:function(){return this.$el.html(r.render()),this},_onClickCurrentDownload:function(){window.location.href=this.collection.csvUrl()},_onClickTotalDownload:function(){$.ajax({type:"POST",contentType:"application/json",url:GO.contextRoot+"api/works/applets/"+this.appletId+"/docs/export",data:JSON.stringify({query:this.collection.queryString,conditionText:this.conditions.getLabelTexts()}),success:_.bind(function(){this._renderPopup()},this),error:function(){$.goError(t["\uad00\ub9ac \uc11c\ubc84\uc5d0 \uc624\ub958\uac00 \ubc1c\uc0dd\ud558\uc600\uc2b5\ub2c8\ub2e4"])}})},_renderPopup:function(){$.goPopup({pclass:"layer_normal new_layer layer_works_new new_wide",header:e["\uc804\uccb4 \ud398\uc774\uc9c0 \ub2e4\uc6b4\ub85c\ub4dc"],modal:!0,width:450,contents:'<p class="desc">'+e["\uc804\uccb4 \ud398\uc774\uc9c0 \ub2e4\uc6b4\ub85c\ub4dc \uc124\uba85"]+"</p>",buttons:[{btext:e["\uad00\ub9ac \ud398\uc774\uc9c0 \uc774\ub3d9"],autoclose:!1,btype:"confirm",callback:_.bind(function(){GO.router.navigate("works/applet/"+this.appletId+"/settings/download",!0)},this)},{btext:t["\ub2eb\uae30"],btype:"cancel"}]})}})});