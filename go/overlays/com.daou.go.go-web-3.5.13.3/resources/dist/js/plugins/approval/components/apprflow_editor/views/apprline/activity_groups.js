define("approval/components/apprflow_editor/views/apprline/activity_groups",["backbone","app","approval/components/apprflow_editor/views/apprline/activity_group","approval/models/activity","approval/models/appr_activity_group","approval/models/appr_line","approval/collections/appr_activity_groups","approval/collections/activities","approval/collections/appr_flows","i18n!nls/commons","i18n!approval/nls/approval","jquery.go-sdk","jquery.jstree","jquery.go-popup","jquery.go-grid","jquery.go-validation"],function(e,t,n,r,i,s,o,u,a,f,l){function d(){this.listenTo(this.observer,"myLineSelected",this.replaceActivityGroupsByMyLine),this.listenTo(this.observer,"dropCheck",this.drawDNDLine),this.listenTo(this.observer,"dropFinish",this.addActivityByDND),this.listenTo(this.observer,"dropOut",this.clearAllGroupsDragDropLineCss),this.listenTo(this.observer,"resize",this._resizeEmptyGroupView),this.listenTo(this.activityGroups,"change add remove",function(e){this.model.apprFlowModel.set("activityGroups",this.activityGroups.toJSON()),this.model.set("apprFlowChanged",!0),this.observer.trigger("changedTabItem","apprline")})}function v(){var e=this;setTimeout(function(){if(e.$el.parents("body").length>0){var t=parseInt(e.$el.css("height")),n=0,r=0,i=0;_.each(e.groupViewList,function(e){n+=parseInt(e.$el.outerHeight())}),r=t-n;if(r<i)return;e.emptyGroupView.$el.css({height:r-i})}else v.call(e)},100)}var c={header:l["\uacb0\uc7ac \uc815\ubcf4"],save_as_my_line:l["\uac1c\uc778 \uacb0\uc7ac\uc120\uc73c\ub85c \uc800\uc7a5"],delete_as_my_line:l["\uac1c\uc778 \uacb0\uc7ac\uc120 \uc0ad\uc81c"],my_line_name:l["\uacb0\uc7ac\uc120 \uc774\ub984"],normal:l["\uc77c\ubc18"],my_lines:l["\ub098\uc758\uacb0\uc7ac\uc120"],draft:l["\uae30\uc548"],name:f["\uc774\ub984"],dept:l["\ubd80\uc11c"],line:l["\ub77c\uc778"],status:l["\uc0c1\ud0dc"],approval:l["\uacb0\uc7ac"],agreement:l["\ud569\uc758"],check:l["\ud655\uc778"],agreement_type:l["\ud569\uc758\ubc29\uc2dd"],agreement_linear:l["\uc21c\ucc28\ud569\uc758"],agreement_parallel:l["\ubcd1\ub82c\ud569\uc758"],activityType:l["\ud0c0\uc785"],add:f["\ucd94\uac00"],"delete":f["\uc0ad\uc81c"],confirm:f["\ud655\uc778"],cancel:f["\ucde8\uc18c"],add_activity:l["\ub4dc\ub798\uadf8\ud558\uc5ec \uacb0\uc7ac\uc120\uc744 \ucd94\uac00\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."],msg_duplicate_activity:l["\uc911\ubcf5\ub41c \ub300\uc0c1\uc785\ub2c8\ub2e4."],msg_max_approval_count_exceed:l["\uacb0\uc7ac\uc790 \uc218\uac00 \ucd5c\ub300 \uacb0\uc7ac\uc790 \uc218\ub97c \ub118\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_not_selected:l["\uc120\ud0dd\ub41c \ub300\uc0c1\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_not_deletable_status_activity:l["\uc0ad\uc81c\ud560 \uc218 \uc5c6\ub294 \uc0c1\ud0dc\uc758 \uacb0\uc7ac\uc790 \uc785\ub2c8\ub2e4."],msg_not_deletable_assigned_activity:l["\uc9c0\uc815 \uacb0\uc7ac\uc790\ub294 \uc0ad\uc81c\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_save_success:f["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."],msg_not_addable_position:l["\uc644\ub8cc\ub41c \uacb0\uc7ac \uc55e\uc5d0 \uacb0\uc7ac\uc790\ub97c \ucd94\uac00\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_duplicated_my_line_title:l["\uc911\ubcf5\ub41c \uc774\ub984\uc744 \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_my_line_set_error_maxCount:l["\uacb0\uc7ac\uc790\ub97c \ucd5c\ub300\uce58\ubcf4\ub2e4 \ub118\uac8c \ud560\ub2f9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_my_line_set_error_assigned_deleted:l["\ub098\uc758 \uacb0\uc7ac\uc120 \uc801\uc6a9 \ubd88\uac00 \uba54\uc138\uc9c0"],msg_my_line_set_error_not_matching_group_count:l["\uacb0\uc7ac\uc120\uc758 \uac2f\uc218\uac00 \uc77c\uce58\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."],msg_parallel_agreement_should_has_2_more_agreement:l["\ubcd1\ub82c\ud569\uc758\ub294 \uc5f0\uc18d\ub41c \ub458 \uc774\uc0c1\uc758 \ud569\uc758\uac00 \ud544\uc694\ud569\ub2c8\ub2e4."],msg_not_belong_to_department_user:l["\ubd80\uc11c\uac00 \uc5c6\ub294 \uc0ac\uc6a9\uc790\ub294 \ucd94\uac00\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],notAddable:l["\uc774 \uacb0\uc7ac\uce78\uc5d0\ub294 \uacb0\uc7ac\uc790\ub97c \ucd94\uac00\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4"],not_allowed_apprline:l["\uc120\ud0dd\ud55c \ub300\uc0c1\uc740 \uc774 \uacb0\uc7ac\uadf8\ub8f9\uc5d0 \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4"]},h=e.Model.extend({originGroups:null,assignedActivityDeletable:!1,initialize:function(e,t){t=t||{},_.isBoolean(t.assignedActivityDeletable)&&(this.assignedActivityDeletable=t.assignedActivityDeletable),_.isArray(t.original)&&(this.originGroups=new o(t.original)),_.isNull(this.originGroups)&&this.throwError('No "original" was set - required.'),_.isBoolean(t.includeAgreement)&&(this.includeAgreement=t.includeAgreement),this.apprAllowType=t.apprAllowType,this.actionCheck=t.actionCheck},makeData:function(e){var t=new o(e);return this._validateGroupCountMatching(t)||this.throwError(c.msg_my_line_set_error_not_matching_group_count),this.originGroups.each(function(e,n){var r=t.at(n);this._preValidateForGroupMerge(e,r)||this.throwError(c.msg_my_line_set_error_maxCount),this._preValidateActivityForGroupMerge(e,r)||this.throwError(c.not_allowed_apprline);var i=this._mergeNewGroupToOldGroup(e,r);this._postValidateForGroupMerge(e,i)||this.throwError(c.msg_my_line_set_error_assigned_deleted),e.set("activities",i.get("activities"))},this),this.originGroups.toJSON()},_validateGroupCountMatching:function(e){return this.originGroups.length==e.length},_preValidateForGroupMerge:function(e,t){return t.getApprovalAndDraftActivities().length>e.get("maxApprovalCount")?!1:this.includeAgreement&&t.getApprovalAndAgreementAndDraftActivities().length>e.get("maxApprovalCount")?!1:!0},_preValidateActivityForGroupMerge:function(e,t){var n=!0,r=new u(t.get("activities")),i=e.getAvailableApprovalType(this.actionCheck);return _.isUndefined(i)?(n=!1,n):(r.each(function(t){var r=t.get("userId")==null;_.contains(_.pluck(i,"type"),t.get("type"))?this.apprAllowType=="USER"&&r&&(n=!1):n=!1,t.get("type")=="AGREEMENT"&&(e.agreementAllowTypeValidate(this.actionCheck.agreementAllowType,r)||(n=!1))},this),n)},_mergeNewGroupToOldGroup:function(e,t){var n=new i,r=new u(t.get("activities")),s=new u(e.get("activities")),o=s.selectOnlyAssigned();return n.set("activities",[]),s.each(function(e){e.isDraft()&&n.addActivity(e.clone().toJSON())}),r.each(function(e){var t=e.clone().toJSON();o.isExistActivity(e)&&(t.assigned=!0),n.addActivity(t)}),n},_postValidateForGroupMerge:function(e,t){if(this.assignedActivityDeletable)return!0;var n=!0,r=new u(e.get("activities")),i=new u(t.get("activities")),s=r.selectOnlyAssigned();return s.each(function(e){i.isExistActivity(e)||(n=!1)}),n},throwError:function(e){var t=function(e){this.name="ActivityGroupsSetter",this.message=e};throw new t(e)}}),p=e.View.extend({observer:null,activityGroups:null,actionCheck:null,groupViewList:null,isArbitraryCheckVisible:!1,__activated__:!1,__disabled__:!1,useParallelAgreement:!1,initialize:function(e){e=e||{},this.observer=e.observer,this.__activated__=!1,this.__disabled__=!1,e.disable&&this.disable(),this.activityGroups=this.getActivityGroups(),this.actionCheck=this.model.get("actionCheck"),this.includeAgreement=this.model.get("docInfo").includeAgreement,this.isArbitraryCheckVisible=this.model.getActionCheck("isArbitraryCheckVisible"),this.isPermissibleArbitraryDecision=this.model.getActionCheck("isPermissibleArbitraryDecision"),this.apprAllowType="ALL",d.call(this)},getActivityGroups:function(){return new o(this.model.apprFlowModel.get("activityGroups"))},isReceiveDoc:function(){var e=this.model.get("document");return e["apprStatus"]=="TEMPSAVE"&&e["docStatus"]=="RECEIVED"&&e["docType"]=="RECEIVE"},render:function(){return this.activate(),this.$el.empty(),this.groupViewList=[],this.activityGroups.each(function(e,t){var r=new n({model:e,observer:this.observer,actionCheck:this.actionCheck,isArbitraryCheckVisible:this.isArbitraryCheckVisible,isPermissibleArbitraryDecision:this.isPermissibleArbitraryDecision,index:t,disable:this.isDisabled(),includeAgreement:this.includeAgreement,apprAllowType:this.apprAllowType,isReceiveDoc:this.isReceiveDoc()});r.render(),r.on("moveActivityToOtherGroup",function(e){var t=this.groupViewList[e.fromGroupIndex],n=this.groupViewList[e.toGroupIndex],r=t.checkRemovableActivity(e.am),i=e.am.clone();i.set("isDept",i.isDept());var s=n.model.getValidApprovalType(this.actionCheck,i.toJSON());_.isUndefined(s)||i.set({type:s.type,name:s.name});var o=n.checkAddableActivity(i.toJSON(),e.targetIndex);r&&o&&(n.model.addActivity(i.toJSON(),e.targetIndex),t.model.removeActivityByUserIdAndDeptId(e.userId,e.deptId)),t.render(),n.render()},this),this.groupViewList.push(r),this.$el.append(r.$el)},this),this._makeEmptyGroupToSpareSpace(),this._resizeEmptyGroupView(),$(":input:radio[name=useParallelAgreement]").filter("input[value="+this.useParallelAgreement.toString()+"]").attr("checked","checked"),this.observer.trigger("activateDNDDroppable"),this.$el},activate:function(){this.__activated__=!0},deactivate:function(){this.__activated__=!1},isActivated:function(){return this.__activated__},_makeEmptyGroupToSpareSpace:function(){this.emptyGroupView=new n({model:null}),this.emptyGroupView.render(),this.$el.append(this.emptyGroupView.el)},_resizeEmptyGroupView:function(){v.call(this)},getCollectionJSON:function(){return this.activityGroups.toJSON()},getActivityGroupsWithoutDraftActivity:function(){var e=[];return this.activityGroups.each(function(t){var n=t.clone(),r=new u(n.get("activities"));r.removeDraftActivity(),n.set("activities",r.toJSON()),e.push(n.toJSON())}),e},validateMaxApprovalCount:function(){var e=!1;return this.activityGroups.each(function(t){t.isExceedMaxApprovalCount()&&(e=!0)}),!e},hasSerialParallelAgreement:function(){var e=!1;return this.activityGroups.each(function(t){var n=new u(t.get("activities")),r=!1;n.each(function(t){t.isAgreement()?r?e=!0:r=!0:r=!1})}),e},drawDNDLine:function(){var e=arguments[0],t=arguments[1];if(!this.isActivated())return;if(e=="last"&&t=="last"){var n=_.last(this.groupViewList);return n.drawDragDropLineCss("last"),!0}if(!this.activityGroups.validateAddPosition(e,t))return!1;this.clearAllGroupsDragDropLineCss();var n=this.groupViewList[e];return n.drawDragDropLineCss(t-1),!0},addActivityByDND:function(){var e=arguments[0],t=arguments[1],n=arguments[2];if(!this.isActivated())return;this.clearAllGroupsDragDropLineCss();if(e=="last"&&t=="last"){var r=_.last(this.groupViewList);r.addActivity(n,"last")}else if(this.activityGroups.validateAddPosition(e,t)){var r=this.groupViewList[e];r.addActivity(n,t)}},clearAllGroupsDragDropLineCss:function(){if(!this.isActivated())return;_.each(this.groupViewList,function(e){e.clearDragDropLineCss()})},replaceActivityGroupsByMyLine:function(e,t){if(!this.isActivated())return;var n=new h(null,{assignedActivityDeletable:this.actionCheck.assignedActivityDeletable,actionCheck:this.actionCheck,original:this.activityGroups.toJSON(),includeAgreement:this.includeAgreement,apprAllowType:this.apprAllowType});try{var r=n.makeData(e);this.model.apprFlowModel.set("activityGroups",r),this.model.apprFlowModel.set("useParallelAgreement",t),this.activityGroups.reset(r),this.useParallelAgreement=t,this.render()}catch(i){$.goMessage(i.message),this.observer.trigger("deselectMyLine")}},disable:function(){this.__disabled__=!0},isDisabled:function(){return this.__disabled__},_allActivityDelete:function(){_.each(this.groupViewList,function(e,t){var n=e.$(".appr-activity-table").find("tr:not(.inactive)");_.each(n,function(t){var n=$(t)[0].attributes["data-userid"],r=$(t)[0].attributes["data-deptid"],i=$(n)[0].value,s=$(r)[0].value;i!=undefined&&s!=undefined&&e._removeEachActivityGroup(i,s)})})}});return p});