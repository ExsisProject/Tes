define("timeline/models/integration_appr_link",function(require){var e=require("backbone"),t=e.Model.extend({initialize:function(e){this.userId=e.userId},url:function(){return GO.contextRoot+"api/ehr/timeline/integration/appr/link?"+$.param({userId:this.userId})},getDeptId:function(){return this.get("deptId")},getFormId:function(){return this.get("formId")},getWriteMode:function(){return this.get("writeMode")},canApplyOvertimeAppr:function(){return this.getDeptId()!=undefined&&this.getFormId()!=undefined?!0:!1}});return t});