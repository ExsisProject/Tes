define(["backbone"],function(e){var t=e.Model.extend({initialize:function(e){this.type=e.type?e.type:""},urlRoot:function(){var e=GO.contextRoot;return this.type=="company"&&(e+="ad/"),e+="api/sms/repnumber",e},getRepNumber:function(){return this.get("repNumber")},getName:function(){return this.get("name")},isNormal:function(){return this.get("status")=="NORMAL"},setInitData:function(){this.set({name:"",number:"",status:"NORMAL"})}});return t});