define("admin/models/ehr/vacation/status",function(require){var e=require("backbone"),t=require("app");return e.Model.extend({url:t.contextRoot+"ad/api/ehr/vacation/status",fetch:function(){var t={data:{id:this.get("id")}};return e.Model.prototype.fetch.call(this,t)}})});