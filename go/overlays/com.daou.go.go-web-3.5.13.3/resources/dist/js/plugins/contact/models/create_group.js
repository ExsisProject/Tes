define(["backbone"],function(e){var t={DEPARTMENT:"dept",COMPANY:"company",USER:"personal"},n=e.Model.extend({initialize:function(e){this.type=t[e.type]},url:function(){return"/api/contact/"+this.type+"/group"},save:function(t,n,r){return this.beforeSave(t,n,r),e.Model.prototype.save.call(this,t,n,r)},beforeSave:function(e,t,n){this.isCompany()&&this.set("publicFlag",!0)},isCompany:function(){return this.type=="company"},isDept:function(){return this.type=="dept"}});return n});