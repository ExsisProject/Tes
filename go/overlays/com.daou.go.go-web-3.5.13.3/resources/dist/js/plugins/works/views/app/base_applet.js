define("works/views/app/base_applet",function(require){var e=require("backbone"),t=require("when"),n=require("works/views/app/layout"),r=require("works/views/app/layout/app_content_top"),i=require("works/components/app_home/views/app_home_side"),s=require("works/components/guide_layer/views/guide_layer"),o=require("works/components/filter/models/filter_manager"),u=require("works/models/applet_share"),a=require("works/collections/applet_simples"),f=require("works/models/applet_baseconfig"),l=require("i18n!works/nls/works"),c=Hogan.compile(['<div class="error_page"><hgroup><span class="ic_data_type ic_error_page"></span><h2>{{title}}</h2></hgroup>','{{#message}}<p class="desc">{{&.}}</p>{{/message}}'].join("")),h=function(){return t.promise.apply(this,arguments)};return e.View.extend({className:"content_page",appletId:null,baseConfigModel:null,pageName:null,sideView:null,initialize:function(e){e=e||{},this.layoutView=new n,this.appletId=e.appletId,this.baseConfigModel=new f({id:e.appletId,access:!0}),this.applets=new a,this.filters=new o({appletId:this.appletId}),this.share=new u({id:this.appletId}),this.useSearch=e.useSearch,this.subFormId=e.subFormId,this.getAccessibleForms()},render:function(){return $.when(this.baseConfigModel.fetch(),this.share.fetch(),this.layoutView.render()).then($.proxy(function(){this._renderSide(this.layoutView)},this)).then($.proxy(function(){var e=new r({baseConfigModel:this.baseConfigModel,pageName:this.pageName,useSearch:this.useSearch}),t=this.layoutView.getContentElement();t.html(e.el),e.render(),this.layoutView.setContent(this),$(t.next()).hasClass("go_content")&&t.next().remove()},this))},_renderSide:function(e){return new h($.proxy(function(t){this.sideView=new i({appletId:this.appletId,accessibleForms:this.accessibleForms,filters:this.filters,isAdmin:this.baseConfigModel.isAdmin(GO.session("id")),applets:this.applets,share:this.share,baseConfigModel:this.baseConfigModel,subFormId:this.subFormId}),e.getSideElement().html(this.sideView.render().el),this._renderGuide(),t()},this))},_renderGuide:function(){if(GO.locale=="ko"){var e=new s({isSetting:!1});$(".go_side #guide_area").html(e.render().el),$("#guideBadge").draggable({containment:"body"});var t=this.baseConfigModel.get("createdAt");e.displayNewAppGuide(t)}},asyncFetch:function(e){return new h(function(t,n){e.fetch({success:t,error:n,statusCode:{400:function(){GO.util.error("400",{msgCode:"400-works"})},403:function(){GO.util.error("403",{msgCode:"400-works"})},404:function(){GO.util.error("404",{msgCode:"400-works"})},500:function(){GO.util.error("500")}}})})},renderContent:function(){this.$el.append('<p class="data_null"><span class="ic_data_type ic_no_comm"></span><span class="txt">\uc544\uc9c1 \ubdf0\uac00 \uad6c\ud604\ub418\uc9c0 \uc54a\uc558\ub124\uc694. \ubdf0\ub97c \uad6c\ud604\ud574\uc8fc\uc138\uc694!</span><br></p>')},_renderNoExistForm:function(e){e.html(c.render({title:l["\ud3fc \uc811\uadfc\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],message:[l["\ud3fc \uc811\uadfc\uad8c\ud55c \uc5c6\uc74c \uc124\uba85"]]}));return},_renderNoExistReport:function(e){e.html(c.render({title:l["\ub9ac\ud3ec\ud2b8 \uc811\uadfc\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],message:[l["\ud3fc \uc811\uadfc\uad8c\ud55c \uc5c6\uc74c \uc124\uba85"]]}));return},getAccessibleForms:function(){var e=GO.util.store.get(GO.session("id")+"-"+this.appletId+"-searchObject")||{},t=this;$.ajax({type:"GET",dataType:"json",async:!1,url:GO.config("contextRoot")+"api/works/applets/"+this.appletId+"/accessible/form/list",success:function(n){t.accessibleForms=n.data;if(e.subFormId)t.subFormId=e.subFormId;else{var r=t.accessibleForms[0];_.isUndefined(r)||(r.mainForm?t.subFormId=null:t.subFormId=r.id)}},error:function(e){e.responseJSON&&e.responseJSON.code==="403"?GO.util.error("403",{msgCode:"400-works"}):GO.util.error("500",{msgCode:"500"})}})}})});