define(["backbone"],function(e){var t=null,n=e.Collection.extend({initialize:function(e){e&&(this.userId=e)},url:function(){return this.userId?GO.contextRoot+"api/ehr/vacation/"+this.userId+"/terms":GO.contextRoot+"api/ehr/vacation/my/terms"},setUserId:function(e){this.userId=e}},{setFetch:function(e){return t=new n(e),t.fetch({async:!1}),t}});return{getVacationList:function(e){var t=n.setFetch(e);return t},init:function(e){return new n(e)}}});