(function(){define(["backbone"],function(e){var t=null,n=e.Model.extend({isCompany:function(){return this.get("ownerType")=="Company"}}),r=e.Collection.extend({model:n,initialize:function(e){this.options=e||{},this.apiUrl=this.options.apiUrl},url:function(){return this.apiUrl},setType:function(e){if(e.retry){this.apiUrl="/api/task/folder/dept";return}e.isCommunity?this.apiUrl="/api/board/menu/communities":this.apiUrl="/api/board/menu/target/owners"},getDept:function(e){return _.find(this.models,function(t){return t.get("ownerId")==e})},isCompany:function(){}},{setFetch:function(e){return t=new r(e),t.setType(e),t.fetch({async:!1}),t}});return{getDeptList:function(e){var t=r.setFetch(e);return t.size()==0&&(e.retry=!0,t=r.setFetch(e)),t},init:function(e){return new r(e)}}})}).call(this);