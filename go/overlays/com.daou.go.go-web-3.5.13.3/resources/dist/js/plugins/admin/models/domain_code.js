define(["backbone"],function(e){var t=e.Model.extend({url:function(){return"/ad/api/domaincode/"+this.get("type")}});return t});