define("works/views/mobile/doc_detail",function(require){var e=require("app"),t=require("backbone"),n=require("when"),r=require("works/models/applet_doc"),i=require("works/models/applet_form"),s=require("works/models/applet_baseconfig"),o=require("works/components/masking_manager/models/masking"),u=require("works/collections/fields"),a=require("works/models/integration"),f=require("works/models/action"),l=require("works/models/doc_activity_count"),c=t.Collection.extend({model:f,initialize:function(e){this.options=e||{},this.appletId=e.appletId,this.docId=e.docId},url:function(){return e.config("contextRoot")+"api/works/applets/"+this.appletId+"/docs/"+this.docId+"/actions"}}),h=require("views/mobile/header_toolbar"),p=require("works/views/mobile/doc_detail/doc_action"),d=require("works/views/mobile/doc_detail/consumer"),v=require("works/components/formbuilder/formbuilder"),m=require("hgn!works/templates/mobile/doc_detail"),g=require("i18n!works/nls/works"),y=require("i18n!nls/commons"),b={loading:y["\uc7a0\uc2dc\ub9cc \uae30\ub2e4\ub824\uc8fc\uc138\uc694"],noSubject:y["\uc81c\ubaa9\uc5c6\uc74c"],statusText:g["{{arg1}} \uc0c1\ud0dc\uc785\ub2c8\ub2e4."],needToSetProcess:g["\ubaa8\ubc14\uc77c \ud504\ub85c\uc138\uc2a4 \uc0ac\uc6a9\ud558\uae30 \uc120\ud0dd \ubb38\uad6c"]};return t.View.extend({appletId:null,baseConfigModel:null,canvasView:null,el:"#content",initialize:function(t){t=t||{},this.useNavigate=t.useNavigate,t.hasOwnProperty("appletId")&&(this.appletId=t.appletId,this.baseConfigModel=new s({id:t.appletId})),this.fieldsOfIntegrationApplet={},this.subFormId=t.subFormId,this.fields=new u([],{appletId:t.appletId,subFormId:t.subFormId,includeProperty:!0}),this.appletFormModel=new i({appletId:t.appletId,subFormId:t.subFormId?t.subFormId:0}),this.masking=new o({appletId:this.appletId}),this.masking.fetch();var n={appletId:this.appletId,subFormId:this.subFormId};t.hasOwnProperty("docId")&&(this.docId=t.docId,n.id=this.docId),this.model=new r(n),this.activityCountModel=new l(this.appletId,this.docId),this.$el.off("navigate:integrationDoc"),this.$el.on("navigate:integrationDoc",$.proxy(function(t,n){var r=_.findWhere(this.model.get("integratedAppsAccessable"),{appletId:n.integrationAppletId});r.accessable?e.router.navigate("works/applet/"+n.integrationAppletId+"/doc/"+n.integrationDocId,!0):e.router.navigate("works/applet/"+n.appletId+"/refer/"+n.integrationAppletId+"/doc/"+n.integrationDocId,!0)},this)),this.Template=m},render:function(){var t=this;return $.when(this.baseConfigModel.fetch(),this.appletFormModel.fetch({statusCode:{403:function(){e.util.linkToCustomError({code:403,message:g["\ud3fc \uc811\uadfc\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]+" "+g["\ud3fc \uc811\uadfc\uad8c\ud55c \uc5c6\uc74c \uc124\uba85"]})}}}),this.model.fetch(),this.masking.deferred,this.fields.fetch(),this.activityCountModel.fetch({success:function(e,n){t.activityCount=n.data}})).then($.proxy(function(){this._initRender();var e=$.Deferred();return this.fields.getFieldsOfIntegrationApplet().done(_.bind(function(t){this.fieldsOfIntegrationApplet=t,e.resolve()},this)),e},this)).then($.proxy(function(){var e=$.Deferred();return this.actions=new c({appletId:this.model.get("appletId"),docId:this.model.id}),this.actions.fetch({success:function(){e.resolve()}}),e},this)).then(function(){t.model.isCreator(e.session("id"))||t.appletFormModel.mergeMaskingValue(t.masking.get("fieldCids")),h.render({isPrev:!0,actionMenu:t._renderAction(),isWriteBtn:!1}),t._renderContent(),_.contains(t.masking.get("fieldCids"),t.model.get("titleCid"))&&!t.model.isCreator(e.session("id"))&&t._renderMaskedTitle(),t._renderConsumer()}),this},_renderMaskedTitle:function(){this.$("#subject").parent().html('<div class="hidden_data"><span class="help" title="'+g["\uad00\ub9ac\uc790\uc5d0 \uc758\ud574 \ub9c8\uc2a4\ud0b9 \ucc98\ub9ac \ub41c \ud56d\ubaa9\uc785\ub2c8\ub2e4"]+'"></span>'+"</div>")},_initRender:function(){this.$el.html(this.Template({lang:b,formName:this.appletFormModel.get("name"),mainForm:this.appletFormModel.get("mainForm")}))},_printSubjectAndWorkflowText:function(){this._printSubject(),this._printWorkflowText(),this._printDocNoText()},_printSubject:function(){var e=v.getDocumentTitle(this.model);this.$("#subject").text(e||b.noSubject)},_printWorkflowText:function(){var t="",n=this.baseConfigModel.get("useProcess"),r=this.model.get("status"),i=r||0;n&&r?(t=r.name,i=r.color):n&&!r?(t="-",this.$("#needToSetProcess").show()):this.$("#stateArea").closest("span").hide(),this.$("#stateArea").removeClass(function(e,t){return(t.match(/bgcolor\S+/g)||[]).join(" ")}),this.$("#stateArea").addClass("bgcolor"+i),this.$("#stateArea").text(e.util.unescapeHtml(t))},_printDocNoText:function(){var t=this.baseConfigModel.get("useDocNo"),n=this.model.get("docNo");t&&n?this.$("#docNo").text(g["\ubb38\uc11c\ubc88\ud638"]+": "+e.util.unescapeHtml(n)):this.$("#docNo").hide()},_renderContent:function(){var e=v.createUserComponent(this.appletFormModel.toJSON(),this.model,{type:"detail"},new a(_.extend(this.fieldsOfIntegrationApplet,{fields:this.fields.toJSON()})));this.canvasView=e.getDetailView(),this.canvasView.setElement(this.$("#fb-canvas").empty()),this.canvasView.renderNode(),e.trigger(),this._printSubjectAndWorkflowText(),this.listenTo(this.model,"sync",this._onSyncAppletDoc)},_renderAction:function(){return this.actionView=new p({actions:this.actions,activityCount:this.activityCount,model:this.model,isAdmin:this.baseConfigModel.isAdmin(e.session("id")),useNavigate:this.useNavigate,subFormId:this.subFormId}),this.actionView.render()},_renderConsumer:function(){var e=new d({appletId:this.appletId,docId:this.docId});this.$("#consumerArea").html(e.render().el)},_onSyncAppletDoc:function(){this.canvasView.renderNode(),this._printSubjectAndWorkflowText()}})});