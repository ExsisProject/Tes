define(["backbone"],function(e){var t=e.Model.extend({initialize:function(e){this.appletId=e.appletId},url:function(){return"/ad/api/works/applets/"+this.get("appletId")},displayShareValue:function(){return this.get("appletShareModel")},getShareNodes:function(){return this.get("appletShareModel").circle.nodes},isUserType:function(e){return e=="user"},isDeptType:function(e,t){var n=e=="department";return t&&(n=n||this.isSubDeptType(e)),n},isSubDeptType:function(e){return e=="subdepartment"},isUserWithDeptType:function(e,t){return this.isUserType(e)&&!t}});return t});