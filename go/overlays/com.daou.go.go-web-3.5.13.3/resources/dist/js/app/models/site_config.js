(function(){define(["backbone"],function(e){var t=e.Model.extend({initialize:function(e){e!=undefined&&e.isAdmin?this.isAdmin=!0:this.isAdmin=!1},url:function(){return this.isAdmin?GO.contextRoot+"ad/api/siteconfig":GO.contextRoot+"api/siteconfig"},hasApproval:function(){return this.get("approvalService")=="on"?!0:!1}});return{read:function(e){var n=new t(e);return n.fetch({async:!1,contentType:"application/json"}),n}}})}).call(this);