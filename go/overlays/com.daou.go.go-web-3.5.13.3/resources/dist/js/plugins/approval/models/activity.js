(function(){define(["jquery","backbone","app"],function(e,t,n){var r=t.Model.extend({defaults:{seq:0,status:null,type:"AGREEMENT",name:"",deptId:null,deptName:null,userId:null,userName:null,userDuty:null,userPosition:null,displayName:"",thumbnail:GO.contextRoot+"resources/images/photo_profile_small.jpg",assigned:!1,arbitrary:!1},initialize:function(){(this.get("userId")==""||_.isUndefined(this.get("userId")))&&this.set("userId",null),(this.get("deptId")==""||_.isUndefined(this.get("deptId")))&&this.set("deptId",null)},isApproval:function(){return this.get("type")=="APPROVAL"},isInspection:function(){return this.get("type")=="INSPECTION"},isAgreement:function(){return this.get("type")=="AGREEMENT"},isCheck:function(){return this.get("type")=="CHECK"},isDraft:function(){return this.get("type")=="DRAFT"},isArbitraryChecked:function(){return this.get("arbitrary")},isDrafted:function(){return this.get("logCondition")=="drafted"},isApprovalWaiting:function(){return this.get("logCondition")=="approvalWaiting"},isAgreementWaiting:function(){return this.get("logCondition")=="agreementWaiting"},isCheckWaiting:function(){return this.get("logCondition")=="checkWaiting"},isApproved:function(){return this.get("logCondition")=="approved"},isReturned:function(){return this.get("logCondition")=="returned"},isAgreemented:function(){return this.get("logCondition")=="agreemented"},isOpposed:function(){return this.get("logCondition")=="opposed"},isArbitraryDecided:function(){return this.get("logCondition")=="arbitraryDecided"},isArbitrarySkipped:function(){return this.get("logCondition")=="arbitrarySkipped"},isPostCheckWaiting:function(){return this.get("logCondition")=="postCheckWaiting"},isPostChecked:function(){return this.get("logCondition")=="postChecked"},isPostApprovalWaiting:function(){return this.get("logCondition")=="postApprovalWaiting"},isPostApproved:function(){return this.get("logCondition")=="postApproved"},isAdvApproved:function(){return this.get("logCondition")=="advApproved"},isPreviousReturn:function(){return this.get("action")=="PREVIOUSRETURN"},setType:function(e,t){this.set("type",e),this.set("name",t),e!="APPROVAL"&&this.set("arbitrary",!1)},setArbitrarilyDecidable:function(e){_.isBoolean(e)&&this.set("arbitrary",e)},hasDeputyLog:function(){return!_.isEmpty(this.get("deputyActivity"))},isAssigned:function(){return this.get("assigned")},isDeletable:function(){return!this.isDraft()&&this.isDeletableStatus()},isDeletableStatus:function(){return _.isNull(this.get("status"))},validate:function(){return this.isUser()?!_.isNull(this.get("deptId")):this.isDept()?!0:!1},isUser:function(){return!_.isNull(this.get("userId"))},isDept:function(){return!_.isNull(this.get("deptId"))&&!this.isUser()},equals:function(e){return!_.isNull(this.get("userId"))&&!_.isNull(e.get("userId"))?this.get("userId")==e.get("userId"):_.isNull(this.get("userId"))&&_.isNull(e.get("userId"))?this.get("deptId")==e.get("deptId"):!1}},{validate:function(e){var t=new r(e);return t.validate()}});return r})}).call(this);