(function(){define(["jquery","backbone","app","when","hgn!approval/templates/mobile/m_side","hgn!approval/templates/mobile/m_side_dept_folder","i18n!approval/nls/approval","approval/views/mobile/base_approval"],function(e,t,n,r,i,s,o,u){var a={appr_wait_doc:o["\uacb0\uc7ac \ub300\uae30 \ubb38\uc11c"],appr_wait_reception_doc:o["\uacb0\uc7ac \uc218\uc2e0 \ubb38\uc11c"],approval:o["\uacb0\uc7ac\ud558\uae30"],base_docfolder:o["\uae30\ubcf8 \ubb38\uc11c\ud568"],added_docfolder:o["\ucd94\uac00\ub41c \ubb38\uc11c\ud568"],shared_docfolder:o["\uacf5\uc720\ub41c \ubb38\uc11c\ud568"],user_docfolder:o["\uac1c\uc778 \ubb38\uc11c\ud568"],appr_sched_doc:o["\uacb0\uc7ac \uc608\uc815 \ubb38\uc11c"],draft_docfolder:o["\uae30\uc548 \ubb38\uc11c\ud568"],appr_tempsave:o["\uc784\uc2dc \uc800\uc7a5\ud568"],appr_docfolder:o["\uacb0\uc7ac \ubb38\uc11c\ud568"],viewer_docfolder:o["\ucc38\uc870/\uc5f4\ub78c \ubb38\uc11c\ud568"],reception_docfolder:o["\uc218\uc2e0 \ubb38\uc11c\ud568"],send_docfolder:o["\ubc1c\uc1a1 \ubb38\uc11c\ud568"],dept_draft:o["\uae30\uc548 \uc644\ub8cc\ud568"],dept_ref:o["\ubd80\uc11c \ucc38\uc870\ud568"],dept_rcpt:o["\ubd80\uc11c \uc218\uc2e0\ud568"],dept_official:o["\uacf5\ubb38 \ubc1c\uc1a1\ud568"],dept_folder:o["\ubd80\uc11c \ubb38\uc11c\ud568"],sub_dept_folder:o["\ud558\uc704 \ubd80\uc11c \ubb38\uc11c\ud568"],user_official_docfolder:o["\uacf5\ubb38 \ubb38\uc11c\ud568"],official_todo_doc:o["\uacf5\ubb38 \ub300\uae30 \ubb38\uc11c"],appr_todoviewer_doc:o["\ucc38\uc870/\uc5f4\ub78c \ub300\uae30 \ubb38\uc11c"]},f=t.Model.extend({url:"/api/approval/side"}),l=t.Model.extend({initialize:function(e){this.options=e||{}},setType:function(e){_.isString(e)&&(this.type=e)},url:function(){if(_.isString(this.type))return"/api/approval/"+this.type+"/count"}}),c=t.Collection.extend({url:"/api/approval/deptfolder"}),h=u.extend({id:"approvalSideMenu",sideDeptFolderCollection:null,unBindEvent:function(){this.$el.off("vclick","a[data-navi]")},bindEvent:function(){this.$el.on("vclick","a[data-navi]",e.proxy(this.goDocList,this))},initialize:function(t){u.prototype.initialize.call(this),this.options=t||{},this.defer=e.Deferred(),this.model=new f,e.when(this.model.fetch(),this.config.fetch()).then(e.proxy(function(){this.defer.resolve()},this)),this.countModel=new l,this.sideDeptFolderCollection=new c},render:function(){var t=e.Deferred();return this.defer.done(e.proxy(function(){n.config("excludeExtension",this.config.get("excludeExtension")?this.config.get("excludeExtension"):""),this.packageName=this.options.packageName,this.sideDeptFolderCollection.set(this.model.get("deptFolders"));var r=!1;this.model.get("userFolders")&&(r=this.model.get("userFolders").length>0?!0:!1);var s=!1;this.model.get("sharedFoldersToUser")&&(s=this.model.get("sharedFoldersToUser").length>0?!0:!1);var o=_.extend(this.model.toJSON(),{isOfficialDocMaster:this.model.get("isOfficialMaster"),useOfficialConfirm:this.config.get("useOfficialConfirm"),addedFolder:r,sharedFolder:s});e.each(o.sharedFoldersToUser,function(e,t){t.folderType=="USER"?t.isfolderTypeUser=!0:t.isfolderTypeUser=!1}),this.$el.html(i({lang:a,data:o})),this.sideDeptFolderRender(),this.drawApprovalCount(),this.setSideApp(),this.unBindEvent(),this.bindEvent(),t.resolveWith(this,[this])},this)),t},drawApprovalCount:function(){var e=this,t=["todo","upcoming","todoreception","todoviewer"];t.forEach(function(t){e.setApprovalCount(t)})},setApprovalCount:function(e){var t=this;this.countModel.setType(e),this.countModel.fetch().done(function(n){var r=n.data.docCount,i=t.$el.find('a[data-navi="'+e+'"] .num');i.text(r?r:"")})},goDocList:function(t){var r=e(t.currentTarget);t.preventDefault(),this.$el.find(".on").removeClass("on"),r.parent().addClass("on");var i="/approval/";switch(r.attr("data-navi")){case"todo":i+=r.attr("data-navi")+"/all";break;case"todoreception":i+=r.attr("data-navi")+"/all";break;case"officialtodo":i+=r.attr("data-navi");break;case"todoviewer":i+=r.attr("data-navi")+"/all";break;case"upcoming":i+=r.attr("data-navi");break;case"userdoc":i+="userfolder/"+r.attr("data-id")+"/documents";break;case"deptdoc":i+="deptfolder/"+r.attr("data-id")+"/documents";break;case"shareuserdoc":r.attr("data-belong")=="indept"?i+="userfolder/"+r.attr("data-id")+"/share/"+r.attr("data-belong")+"/"+r.attr("data-deptid"):i+="userfolder/"+r.attr("data-id")+"/share/"+r.attr("data-belong");break;case"sharedeptdoc":i+="deptfolder/"+r.attr("data-id")+"/share/"+r.attr("data-belong")+"/"+r.attr("data-deptid");break;case"deptdraft":i+="deptfolder/draft/"+r.attr("data-deptid");break;case"deptreference":i+="deptfolder/reference/"+r.attr("data-deptid");break;case"deptreceive":i+="deptfolder/receive/"+r.attr("data-deptid")+"/all";break;case"deptofficial":i+="deptfolder/official/"+r.attr("data-deptid");break;case"reception":i+="doclist/reception/all";break;case"send":i+="doclist/send/all";break;default:i+="doclist/"+r.attr("data-navi")+"/all"}n.router.navigate(i,{trigger:!0})},sideDeptFolderRender:function(t){t&&(this.sideDeptFolderCollection=new c,this.sideDeptFolderCollection.fetch());var r=this.sideDeptFolderCollection.toJSON(),i=!1;!!r.length&&!!n.session("useOrg")&&e.each(r,function(t,n){n.deptFolders.length>0?n.addedFolder=!0:n.addedFolder=!1,n.sharedDocFolders&&n.sharedDocFolders.length>0?(n.sharedFolder=!0,e.each(n.sharedDocFolders,function(e,t){t.deptId=n.deptId,t.folderType=="USER"?t.isfolderTypeUser=!0:t.isfolderTypeUser=!1})):n.sharedFolder=!1,n.managable&&n.containsSubDept&&(i=!0)}),this.$el.append(s({contextRoot:n.contextRoot,dataset:r,lang:a}))},setSideApp:function(){e("body").data("sideApp",this.packageName)}},{__instance__:null,create:function(e){return this.__instance__=new this.prototype.constructor({packageName:e}),this.__instance__},getInstance:function(){return this.__instance__===null&&(this.__instance__=new this.prototype.constructor),this.__instance__}});return h})}).call(this);