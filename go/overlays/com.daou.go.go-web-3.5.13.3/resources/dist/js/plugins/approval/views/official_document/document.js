define(["jquery","underscore","backbone","when","i18n!nls/commons","i18n!approval/nls/approval","file_upload","content_viewer","approval/views/document/attach_file","hgn!approval/templates/official_document/document","formutil","jquery.fancybox","jquery.go-popup","jquery.ui","json","json2","jquery.go-validation","jquery.placeholder","jquery.progressbar","go-fancybox"],function(e,t,n,r,i,s,o,u,a,f){var l={img_attach:i["\uc774\ubbf8\uc9c0 \ucca8\ubd80"],file_attach:i["\ud30c\uc77c \ucca8\ubd80"],del:i["\uc0ad\uc81c"],confirm:i["\ud655\uc778"],cancel:i["\ucde8\uc18c"],save:i["\uc800\uc7a5"],noti:i["\uc54c\ub9bc"],doc_search:s["\ubb38\uc11c \uac80\uc0c9"],attach_file:s["\ucca8\ubd80\ud30c\uc77c"],ref_doc:s["\uad00\ub828\ubb38\uc11c"],view:s["\ubcf4\uae30"],preview:s["\ubbf8\ub9ac\ubcf4\uae30"],amt:s["\uac1c"],msg_no_approval_document:s["\uacb0\uc7ac \ubb38\uc11c\ub97c \uc120\ud0dd\ud574 \uc8fc\uc138\uc694"],msg_duplicate_approval_document:s["\uc911\ubcf5\ub41c \uad00\ub828\ubb38\uc11c\uac00 \uc788\uc2b5\ub2c8\ub2e4"],"\ub313\uae00":s["\ub313\uae00"]},c="body {margin: 0px;}",h=n.View.extend({events:{},initialize:function(e){this.options=e||{},this.model=e.model,t.bindAll(this,"render")},render:function(){this.$el.html(f({lang:l,model:this.model})),this.docContents=e("#document_content");var n=this.model.get("officialBody");this.docContents.html(n);var r=t.map(this.docContents.find("style"),function(t){return e(t).html()}).join("");return t.each(this.docContents.find("span[data-dsl*='editor']"),function(t){var n=e(t);u.init({$el:n,content:GO.util.escapeXssFromHtml(n.html()),style:r+c})}),this}});return h});