define(["jquery","underscore","backbone","app","approval/models/ref_document","hgn!approval/templates/document/document_print","hgn!approval/templates/document/reference_doc_view","attach_file","i18n!nls/commons","i18n!approval/nls/approval","jquery.fancybox","formutil"],function(e,t,n,r,i,s,o,u,a,f){var l=n.Model.extend({url:function(){return"/api/approval/document/"+this.docId},setId:function(e){this.docId=e}}),c={confirm:a["\ud655\uc778"],cancel:a["\ucde8\uc18c"],save:a["\uc800\uc7a5"],view:f["\ubcf4\uae30"],attach_file:f["\ucca8\ubd80\ud30c\uc77c"],ref_doc:f["\uad00\ub828\ubb38\uc11c"],preview:f["\ubbf8\ub9ac\ubcf4\uae30"],amt:f["\uac1c"],"\uc6d0\ubcf8\ubb38\uc11c":f["\uc6d0\ubcf8\ubb38\uc11c"]},h=n.View.extend({el:".layer_normal .content",events:{"click #btnRefDocPreview":"showReferencePreview"},initialize:function(t){this.prevPopup=t.popup,this.docId=t.docId,this.docBody=e.goFormUtil.convertViewMode(t.docBody),this.attaches=t.attaches,this.references=t.references},render:function(){var n=!1;if(!e.isEmptyObject(this.attaches)||!e.isEmptyObject(this.references))n=!0;this.$el.html(s({data:this.docBody,hasAttach:n})),this.$el.find("span[data-type=editor]").css("font-size","12px").css("line-height","1.5").css("font-family","\ub3cb\uc6c0,dotum,AppleGothic,arial,Helvetica,sans-serif");if(n){var r=this.docId;e.each(this.attaches,function(e,t){t.docId=r}),u.create("div#attachePrintView",this.attaches,function(e){return GO.config("contextRoot")+"api/approval/document/"+e.attributes.docId+"/download/"+e.id}),this.$el.find("div#referencePrintView").append(o({lang:c,data:function(){if(!self.docModel)return{};var e=self.docModel.receptionOrigin;return!e||0?{references:self.docModel.references}:{references:t.filter(self.docModel.references,function(t){return t.id!=e.id}),receptionOriginInReferences:t.find(self.docModel.references,function(t){return t.id==e.id})}}}))}},showReferencePreview:function(t){var n=e(t.currentTarget).attr("data-id"),r=i.create(this.docId,n);r.fetch({async:!1});var s={allowPrevPopup:!0,pclass:"layer_normal layer_approval_preview preview_child_"+n,header:f["\ubcf4\uae30"],modal:!0,width:900,contents:"",buttons:[{btext:a["\ud655\uc778"],btype:"confirm"},{btext:a["\ucde8\uc18c"],btype:"cancel"}]};if(this.prevPopup){var o=this.prevPopup.offset();s.offset={top:o.top+20,left:o.left+20}}var u=e.goPopup(s),l=new h({el:".preview_child_"+n+" .content",popup:u,docId:n,docBody:r.get("document").docBodyContent,attaches:r.get("document").attaches,references:r.get("document").references});l.render()},release:function(){this.$el.off(),this.$el.empty()}});return h});