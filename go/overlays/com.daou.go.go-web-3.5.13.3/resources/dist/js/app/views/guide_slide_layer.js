define("views/guide_slide_layer",function(require){var e=require("backbone"),t=require("when"),n=require("i18n!works/nls/works"),r=require("i18n!nls/commons");require("jquery.bxslider");var i={"\ub2eb\uae30":r["\ub2eb\uae30"]},s=Hogan.compile(['<div class="app_popup_cont">','<a class="app_popup_close" id="ic_close">{{lang.\ub2eb\uae30}}</a>',"</div>"].join("")),o=e.View.extend({el:".go_popup .content",externalLang:null,contentTpl:null,layer:null,initialize:function(e){this.options=e||{},this.externalLang=this.options.externalLang,this.contentTpl=this.options.contentTpl,this.layer=this.options.layer,this.initRender()},events:{"click #ic_close":"closePopup"},closePopup:function(){this.layer.close()},initRender:function(){this.$el.html(s.render({lang:i}))},render:function(){var e=this,t="";GO.session("locale")=="ja"?t="ja/":GO.session("locale")=="en"?t="en/":GO.session("locale")=="zh_CN"?t="cn/":GO.session("locale")=="zh_TW"?t="tw/":GO.session("locale")=="vi"&&(t="vi/"),this.$el.find("div.app_popup_cont").append(this.contentTpl({lang:_.extend(i,this.externalLang),contextRoot:GO.contextRoot,localeFolder:t})),this.$el.find(".bxslider").bxSlider({mode:"horizontal",captions:!1,useCSS:!1,onSliderLoad:function(){e.$el.find("a").removeAttr("href")}})}});return o});