(function(){define(["jquery","underscore","backbone","app","hgn!approval/templates/document_attach","i18n!nls/commons","i18n!approval/nls/approval"],function(e,t,n,r,i,s,o){var u={save:s["\uc800\uc7a5"],no_attach_file:o["\ucca8\ubd80 \ud30c\uc77c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]},a=n.Collection.extend({model:n.Model.extend(),url:function(){return["/api/approval/document",this.docId,"attach"].join("/")},initialize:function(e){this.docId=e.docId}}),f=n.View.extend({initialize:function(e){this.docId=e.docId,this.collection=new a({docId:this.docId})},render:function(e){return this.collection.fetch({success:this._onFetchSuccess,error:this._onFetchFail}),this},_onFetchSuccess:function(t,n,r){var a=this,f=[],l;e.each(t.toJSON(),function(e,t){var n=new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)","gi"),r=t.extention.toLowerCase();t.size=GO.util.getHumanizedFileSize(t.size),t.extention=n.test(r)?r:"def",t.docId=a.docId,f.push(t)}),l=i({contextRoot:GO.config("contextRoot"),docId:t.docId,dataset:f,lang:u}),e.goPopup({pclass:"layer_normal layer_list_attach",header:o["\ucca8\ubd80 \ud30c\uc77c \ubaa9\ub85d"],modal:!0,width:"400px",contents:l,buttons:[{btext:s["\ud655\uc778"],btype:"confirm",callback:function(){}}]})},_onFetchFail:function(t,n,r){e.goMessage(s["\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."])}});return f})}).call(this);