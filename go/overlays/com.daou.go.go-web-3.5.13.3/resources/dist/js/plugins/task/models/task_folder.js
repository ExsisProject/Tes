define(["backbone","jquery.go-sdk"],function(e){var t=e.Model.extend({initialize:function(e){this.id=e?e.id:null},urlRoot:function(){return"/api/task/folder"},defaults:{id:null,name:"",types:[],fields:[],createdAt:null,updatedAt:null,description:"",share:{departmentShares:[],domainCodeShares:[]}},getDepartment:function(){return $.ajax({url:GO.contextRoot+"api/department/profile/"+this.get("deptId")})},adminLabel:function(){return this.get("admins")?$.map(this.get("admins"),function(e){return e.name+" "+e.position||""}).join(", "):""},minAdminLabel:function(e,t){var n=this.get("admins");if(n.length==0)return;var r=n[0].name+" "+n[0].position||"";return n.length>1&&(r=r+" "+e+" "+(n.length-1)+t),r},hasAdmin:function(){return this.get("admins")&&this.get("admins").length>0},findIssueType:function(e){var t=this.get("types");return t.length==1||!e?t[0]:_.find(t,function(t){return e==t.id})},getCurrentTypeFields:function(e){return e?this.findIssueType(e)?this.findIssueType(e).fields:[]:null},getMovableFolders:function(){var e=this,t=$.Deferred();return $.ajax({type:"GET",url:GO.contextRoot+"api/task/folder/dept/"+this.get("deptId"),success:function(n){var r=_.filter(n.data.folders,function(t){return e.get("id")!=t.id});t.resolve(r)}}),t},getDepartmentShareIds:function(){var e=_.map(this.getDepartmentShares(),function(e){return e.nodeId});return _.reject(e,function(e){return e==this.get("deptId")},this)},getDomainCodeShareIds:function(){return $.map(this.getDomainCodeShares(),function(e){return e.nodeId})},getDepartmentShares:function(){return _.filter(this.get("share").nodes,function(e){return _.contains(["department","subdepartment"],e.nodeType)})},getSubDepartmentShares:function(){return _.filter(this.get("share").nodes,function(e){return _.contains(["subdepartment"],e.nodeType)})},getDomainCodeShares:function(){return _.filter(this.get("share").nodes,function(e){return _.contains(["position","grade","duty","usergroup"],e.nodeType)})},getCompanyShare:function(){return _.filter(this.get("share").nodes,function(e){return e.nodeType=="company"})},isNews:function(){return this.get("taskCreatedAt")?GO.util.isCurrentDate(this.get("taskCreatedAt"),1):!1},isPrivate:function(){var e=this.getDepartmentShares(),t=this.getDomainCodeShares();if(t.length)return!0;var n=_.find(e,function(e){return e.nodeId==this.get("deptId")},this);return n?n.members.length?!0:!1:!1},isShare:function(){var e=this.getDepartmentShares(),t=this.isSubDepartmentShare(),n=_.reject(e,function(e){return e.nodeId==this.get("deptId")},this);return n.length||t?!0:!1},isSubDepartmentShare:function(){return this.getSubDepartmentShares().length>0},isDepartmentShare:function(){return this.getDepartmentShares().length>0},isCompanyShare:function(){return this.getCompanyShare().length>0||this.getDomainCodeShares().length>0},isDomainCodeShare:function(){return this.getDomainCodeShares().length>0},isMultiType:function(){return this.get("types").length>1?!0:!1},getIssueTypes:function(){return this.get("types")||[]},defaultType:function(){return this.id?this.get("types")[0]:{}},getPredefinedField:function(){var e=this,t=$.Deferred();return $.ajax({type:"GET",url:GO.contextRoot+"api/task/field/predefined",success:function(n){var r=[];$(n.data).map(function(e,t){r.push(t)}),t.resolve(e.fieldParser(r))}}),t},getTaskType:function(){var e=$.Deferred();return $.ajax({type:"GET",url:GO.contextRoot+"api/task/type",success:function(t){var n=[];$(t.data).map(function(e,t){n.push({id:t.id,name:t.name,description:t.description,isApprover:t.approver,checked:e==0?!0:!1})}),e.resolve(n)}}),e},getRequiredFields:function(){return _.filter(this.get("fields"),function(e){return e.required})},getRequiredSelectFields:function(){return _.filter(this.getRequiredFields(),function(e){return e.type=="SELECT"})},getRequiredTextFields:function(){return _.filter(this.getRequiredFields(),function(e){return e.type=="TEXT"})},getTextFields:function(){return _.filter(this.get("fields"),function(e){return e.type=="TEXT"})},fieldParser:function(e){return _.each(e,function(e){e.type=="BOOLEAN"&&(e.defaultValue=GO.util.toBoolean(e.defaultValue))})},parsedFields:function(){return this.fieldParser(this.get("fields"))}});return t});