(function(){define(["jquery","backbone","app","i18n!approval/nls/approval","approval/collections/doc_list_field"],function(e,t,n,r,i){var s=t.Model.extend({initialize:function(e){this.options=e||{},this.docFolderType=this.options.docFolderType},url:function(){return this.docFolderType?GO.config("contextRoot")+"api/approval/doclistField/"+this.docFolderType:GO.config("contextRoot")+"api/approval/doclistField/"},getCollection:function(){return new i(this.get("docListFields"))},isUserType:function(){return this.get("docFieldType")==="USER"}});return s})}).call(this);