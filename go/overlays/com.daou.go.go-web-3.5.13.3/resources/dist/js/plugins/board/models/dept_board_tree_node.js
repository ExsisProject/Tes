define("board/models/dept_board_tree_node",function(require){var e=require("when"),t=require("board/models/board_tree_node"),n=require("board/constants"),r=t.Model.extend({deptId:null,urlRoot:function(){return GO.config("contextRoot")+"api/department/"+this.getDeptId()+"/board/"+this.get("nodeType")},initialize:function(e,n){var r=n||{};t.Collection.prototype.initialize.apply(this,arguments),this.deptId=null,r.hasOwnProperty("deptId")&&this.setDeptId(r.deptId)},move:function(t,n){var r=this;return e.promise(function(e,i){r.save({seq:t,parentId:n},{url:GO.config("contextRoot")+"api/department/"+r.getDeptId()+"/board/"+r.getNodeId()+"/move",success:e,error:i})})},getSharedFlag:function(){return this.get("deptSharedFlag")},getManagerNames:function(){return this.getBoardModel().getManagerNames()},setDeptId:function(e){this.deptId=e},getDeptId:function(){return this.deptId}}),i=t.Collection.extend({model:r,deptId:null,initialize:function(e,n){var r=n||{};t.Collection.prototype.initialize.apply(this,arguments),this.deptId=null,r.hasOwnProperty("deptId")&&this.setDeptId(r.deptId)},url:function(){var e=GO.config("contextRoot")+"api/department/"+this.getDeptId()+"/boards";if(!this.getDeptId()){console.error("\ubd80\uc11c \uc544\uc774\ub514\uac00 \ud544\uc694\ud569\ub2c8\ub2e4.");return}return this.getStatus()!=null&&(e+="/"+this.getStatus()),e},setDeptId:function(e){this.deptId=e},getDeptId:function(){return this.deptId},create:function(e,n){var r=_.extend({},n||{},{deptId:this.getDeptId()});t.Collection.prototype.create.call(this,e,r)},set:function(e,n){var r=_.extend({},n||{},{deptId:this.getDeptId()});t.Collection.prototype.set.call(this,e,r)}});return{STATUS_ACTIVE:t.STATUS_ACTIVE,STATUS_CLOSED:t.STATUS_CLOSED,Model:r,Collection:i}});