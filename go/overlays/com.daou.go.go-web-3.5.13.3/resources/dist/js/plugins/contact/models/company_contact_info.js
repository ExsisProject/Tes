define(["backbone"],function(e){var t=e.Model.extend({url:function(){return"/api/contact/company/group/"+this.get("groupId")+"/contact/"+this.get("contactId")}});return t});