define(function(require){function d(e,t){if(e.find("tr.added_tr").length!=0)return;var n=e.closest("table").find("th").length,r='<tr><td colspan="'+n+'" class="null_data">'+t+"</td></tr>";e.append(Hogan.compile(r).render())}function y(e){var t="";for(var n=1;n<=e.find('[name="usePartDeptContainer"]').length;n++)t+="<option value="+n+">"+n+"</option>";$.each(e.find('[name="usePartDeptContainer"]'),function(e,n){var r=$(n).find("select[name=priorityType]");r.html(t),r.val(e+1)})}function b(e){return{duty:"duties",position:"positions",grade:"grades"}[e]}function w(e){return e.apprLineRuleItems&&e.hasOwnProperty("isUserType")?e.isUserType:_.first(e.apprLineRuleItems)&&_.first(e.apprLineRuleItems).hasOwnProperty("userId")?!0:!1}function E(e){var t=_.filter(e,function(e){return e.apprLineRuleItems&&e.hasOwnProperty("isUserType")});if(t.length>0)return _.first(t).isUserType;t=_.filter(e,function(e){return e.apprLineRuleItems&&e.apprLineRuleItems.length>0});if(t.length<1)return!1;var n=_.first(t);return _.first(n.apprLineRuleItems).hasOwnProperty("userId")?!0:!1}var e=require("backbone"),t=require("go-nametags"),n=require("hgn!admin/templates/appr_line_rule_detail_item"),r=require("hgn!admin/templates/appr_line_rule_detail_item_row"),i=require("hgn!admin/templates/appr_line_rule_item_area"),s=require("i18n!approval/nls/approval"),o=require("i18n!nls/commons"),u=require("i18n!admin/nls/admin");require("jquery.inputmask"),require("jquery.go-orgslide");var a={"\uc774\ub984":o["\uc774\ub984"],"\uc801\uc6a9\ub41c \uc591\uc2dd\uc218":u["\uc801\uc6a9\ub41c \uc591\uc2dd\uc218"],"\uacb0\uc7ac\uc120":s["\uacb0\uc7ac\uc120"],"\uc790\ub3d9\uacb0\uc7ac\uc120 \uc124\uc815":u["\uc790\ub3d9\uacb0\uc7ac\uc120 \uc124\uc815"],"\uc21c\uc11c\ubc14\uafb8\uae30":o["\uc21c\uc11c\ubc14\uafb8\uae30"],"\uc21c\uc11c\ubc14\uafb8\uae30 \uc644\ub8cc":o["\uc21c\uc11c\ubc14\uafb8\uae30 \uc644\ub8cc"],"\ucd94\uac00":o["\ucd94\uac00"],"\uc0ad\uc81c":o["\uc0ad\uc81c"],"\uc800\uc7a5":o["\uc800\uc7a5"],"\ucde8\uc18c":o["\ucde8\uc18c"],empty_msg:s["\uc790\ub8cc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"],"\uacb0\uc7ac\uc120 \uc124\uc815":s["\uacb0\uc7ac\uc120 \uc124\uc815"],"\uc9c1\ucc45":u["\uc9c1\ucc45"],"\uc9c1\uae09":u["\uc9c1\uae09"],"\uc9c1\uc704":u["\uc9c1\uc704"],"\uae08\uc561":o["\uae08\uc561"],"\ucc28\uc0c1\uc704\uc790\ub97c \ucd5c\uc885 \uacb0\uc7ac\uc790\ub85c \uc9c0\uc815":s["\ucc28\uc0c1\uc704\uc790\ub97c \ucd5c\uc885 \uacb0\uc7ac\uc790\ub85c \uc9c0\uc815"],"\uae08\uc561\uc5d0 \ub300\ud574 \uae30\uc548\uc790\uac00 \uc804\uacb0\uad8c\uc790\uc778 \uacbd\uc6b0, \ucc28\uc0c1\uc704\uc790\uc758 \uacb0\uc7ac\ub97c \ubc1b\uc74c":s["\uae08\uc561\uc5d0 \ub300\ud574 \uae30\uc548\uc790\uac00 \uc804\uacb0\uad8c\uc790\uc778 \uacbd\uc6b0, \ucc28\uc0c1\uc704\uc790\uc758 \uacb0\uc7ac\ub97c \ubc1b\uc74c"],"\uacb0\uc7ac\uc21c\uc11c":s["\uacb0\uc7ac\uc21c\uc11c"],"\ucd94\uac00":o["\ucd94\uac00"],"\uc21c\uc11c":o["\uc21c\uc11c"],"\ud0c0\uc785":s["\ud0c0\uc785"],"\uadf8\ub8f9\uba85":u["\uadf8\ub8f9\uba85"],"\ud56d\ubaa9":u["\ud56d\ubaa9"],"\uc9c0\uc815\uacb0\uc7ac\uc790":s["\uc9c0\uc815\uacb0\uc7ac\uc790"],"\ucd5c\uc18c \ud558\ub098 \uc774\uc0c1\uc758 \uacb0\uc7ac\uc120\uc774 \uc788\uc5b4\uc57c \ud569\ub2c8\ub2e4":s["\ucd5c\uc18c \ud558\ub098 \uc774\uc0c1\uc758 \uacb0\uc7ac\uc120\uc774 \uc788\uc5b4\uc57c \ud569\ub2c8\ub2e4"],"\uadf8\ub8f9\uba85\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694":s["\uadf8\ub8f9\uba85\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694"],"\ud56d\ubaa9\uc5d0 \ud558\ub098 \uc774\uc0c1\uc758 \uc120\ud0dd\uac12\uc774 \ud544\uc694\ud569\ub2c8\ub2e4":s["\ud56d\ubaa9\uc5d0 \ud558\ub098 \uc774\uc0c1\uc758 \uc120\ud0dd\uac12\uc774 \ud544\uc694\ud569\ub2c8\ub2e4"],"\uae08\uc561\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694":s["\uae08\uc561\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694"],"\uae08\uc561 \uad6c\uac04 \uc124\uc815 \uc624\ub958":s["\uae08\uc561 \uad6c\uac04 \uc124\uc815 \uc624\ub958"],"\ub3c4\uba54\uc778 \ucf54\ub4dc\uac00 \uc11c\ub85c \ub2e4\ub985\ub2c8\ub2e4":s["\ub3c4\uba54\uc778 \ucf54\ub4dc\uac00 \uc11c\ub85c \ub2e4\ub985\ub2c8\ub2e4"],"\uc911\ubcf5\ub41c \uae08\uc561\uc774 \uc788\uc2b5\ub2c8\ub2e4":s["\uc911\ubcf5\ub41c \uae08\uc561\uc774 \uc788\uc2b5\ub2c8\ub2e4"],"\ucc28\uc0c1\uc704\uc790 \ubcf4\ub2e4 \uc124\uc815 \uac12\uc774 \ub192\uc740 \uacb0\uc7ac\uc790\uac00 \uc788\uc2b5\ub2c8\ub2e4":s["\ucc28\uc0c1\uc704\uc790 \ubcf4\ub2e4 \uc124\uc815 \uac12\uc774 \ub192\uc740 \uacb0\uc7ac\uc790\uac00 \uc788\uc2b5\ub2c8\ub2e4"],"\uc774\uc0c1":o["\uc774\uc0c1"],"\ubbf8\ub9cc":u["\ubbf8\ub9cc"],"\ub3d9\uc77c\ud55c \ud56d\ubaa9\uc774 \uc788\uc2b5\ub2c8\ub2e4":s["\ub3d9\uc77c\ud55c \ud56d\ubaa9\uc774 \uc788\uc2b5\ub2c8\ub2e4"],"\uc0ac\uc6a9\uc790 \ucd94\uac00":u["\uc0ac\uc6a9\uc790 \ucd94\uac00"],"\uacb0\uc7ac\uc790 \ucd94\uac00":s["\uacb0\uc7ac\uc790 \ucd94\uac00"],"\uc9c0\uc815\uacb0\uc7ac\uc790 \ucd94\uac00":s["\uc9c0\uc815\uacb0\uc7ac\uc790 \ucd94\uac00"],"\uc804\uccb4 \ubd80\uc11c":u["\uc804\uccb4 \ubd80\uc11c"],"\uc77c\ubd80 \ubd80\uc11c":u["\uc77c\ubd80 \ubd80\uc11c"],"\ucd94\uac00":o["\ucd94\uac00"],"\ubd80\uc11c \uc124\uc815 \ucd94\uac00":u["\ubd80\uc11c \uc124\uc815 \ucd94\uac00"],"\ubd80\uc11c\uba85":u["\ubd80\uc11c\uba85"],"\ud558\uc704\ubd80\uc11c\ud3ec\ud568":o["\ud558\uc704\ubd80\uc11c\ud3ec\ud568"],"\ubd80\uc11c\ub97c \ucd94\uac00\ud558\uc138\uc694":u["\ubd80\uc11c\ub97c \ucd94\uac00\ud558\uc138\uc694"],"\uacb0\uc7ac\uc790\ub97c \ucd94\uac00\ud558\uc138\uc694":u["\uacb0\uc7ac\uc790\ub97c \ucd94\uac00\ud558\uc138\uc694"],"\uc6b0\uc120\uc21c\uc704":u["\uc6b0\uc120\uc21c\uc704"],"\ucd5c\uc18c \ud558\ub098 \uc774\uc0c1\uc758 \ubd80\uc11c\uac00 \uc788\uc5b4\uc57c \ud569\ub2c8\ub2e4.":u["\ucd5c\uc18c \ud558\ub098 \uc774\uc0c1\uc758 \ubd80\uc11c\uac00 \uc788\uc5b4\uc57c \ud569\ub2c8\ub2e4."],"\uc801\uc6a9 \ubd80\uc11c":s["\uc801\uc6a9 \ubd80\uc11c"],"\uacb0\uc7ac \uae30\uc900":s["\uacb0\uc7ac \uae30\uc900"],"\uacb0\uc7ac\uc120 \uc0dd\uc131\uc2dc \uae08\uc561\ubcc4\ub85c \uacb0\uc7ac\uc120\uc744 \ub2e4\ub974\uac8c \uc0dd\uc131\ud574\uc57c\ud560 \ub54c \uc0ac\uc6a9\ud569\ub2c8\ub2e4":u["\uacb0\uc7ac\uc120 \uc0dd\uc131\uc2dc \uae08\uc561\ubcc4\ub85c \uacb0\uc7ac\uc120\uc744 \ub2e4\ub974\uac8c \uc0dd\uc131\ud574\uc57c\ud560 \ub54c \uc0ac\uc6a9\ud569\ub2c8\ub2e4."],"\ubd80\uc11c\ubcc4\ub85c \ub2e4\ub978 \uacb0\uc7ac\uc120\uc744 \uc124\uc815\ud574\uc57c \ud560 \ub54c, '\uc77c\ubd80 \ubd80\uc11c'\ub97c \uc120\ud0dd\ud558\uc5ec \ubd80\uc11c\ub97c \uc9c0\uc815\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4":u["\ubd80\uc11c\ubcc4\ub85c \ub2e4\ub978 \uacb0\uc7ac\uc120\uc744 \uc124\uc815\ud574\uc57c \ud560 \ub54c, '\uc77c\ubd80 \ubd80\uc11c'\ub97c \uc120\ud0dd\ud558\uc5ec \ubd80\uc11c\ub97c \uc9c0\uc815\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."],"\uae30\uc548\uc790\uac00 \uc785\ub825\ud55c \uae08\uc561\uc5d0 \ub300\ud574 \uad8c\ud55c\uc774 \uc788\uc5b4\ub3c4, \ud55c\ub2e8\uacc4 \ucc28\uc0c1\uc704\uc790\uc758 \uacb0\uc7ac\uac00 \ud544\uc694\ud55c \uacbd\uc6b0 \uc0ac\uc6a9\ud569\ub2c8\ub2e4":u["\uae30\uc548\uc790\uac00 \uc785\ub825\ud55c \uae08\uc561\uc5d0 \ub300\ud574 \uad8c\ud55c\uc774 \uc788\uc5b4\ub3c4, \ud55c\ub2e8\uacc4 \ucc28\uc0c1\uc704\uc790\uc758 \uacb0\uc7ac\uac00 \ud544\uc694\ud55c \uacbd\uc6b0 \uc0ac\uc6a9\ud569\ub2c8\ub2e4."],"\uae30\uc548\uc790\uc758 \ubc14\ub85c \ub2e4\uc74c \uc0ac\ub78c\uae4c\uc9c0\ub9cc \uacb0\uc7ac\uc120\uc73c\ub85c \uc9c0\uc815\ud569\ub2c8\ub2e4":u["\uae30\uc548\uc790\uc758 \ubc14\ub85c \ub2e4\uc74c \uc0ac\ub78c\uae4c\uc9c0\ub9cc \uacb0\uc7ac\uc120\uc73c\ub85c \uc9c0\uc815\ud569\ub2c8\ub2e4."]},f=e.Model.extend({}),l=e.Collection.extend({model:f}),c=e.Model.extend({defaults:{useAccountRule:!1,ruleTypeName:"duty",apprLineRuleItemGroups:[],useAllDept:!1}}),h=e.View.extend({tagName:"tr",className:"disabled added_tr",initialize:function(e){this.options=e||{},this.rowModel=this.options.rowModel,this.companyIds=this.options.companyIds,this.codeTypeName=this.rowModel.get("codeTypeName"),this.nameTag=t.create({},{useAddButton:!1}),this.$el.data("instance",this)},events:{'click span[name="addDomain"]':"addDomain",'click span[name="removeRow"]':"removeRow"},render:function(){var e=this;return this.$el.html(r({lang:a,data:this.rowModel.toJSON(),cid:this.cid})),this.renderNameTag(),this},toggleAmount:function(e){this.$('td[name="useAccountRuleTd"]').toggle(e)},addDomain:function(){var e=this;if(this.rowModel.get("isUserType")){var t={header:a["\uc0ac\uc6a9\uc790 \ucd94\uac00"],contextRoot:GO.config("contextRoot"),type:"node",isAdmin:!0,desc:"",callback:function(t){if(t.type=="org")return!1;var n=t.position?t.name+" "+t.position:t.name,r=!0;_.each(e.$el.parent().find("tr .name_tag .name"),function(e){if($(e).text()==n)return $.goMessage(a["\ub3d9\uc77c\ud55c \ud56d\ubaa9\uc774 \uc788\uc2b5\ub2c8\ub2e4"]),r=!1,!1});if(!r)return!1;_.each(e.nameTag.getNameTagList(),function(t){e.nameTag.removeTag(t.userId)},e),e.nameTag.addTag(t.id,n,{attrs:_.extend(t,{userId:t.id}),removable:!0})}};_.isArray(e.companyIds)&&(t.companyIds=e.companyIds),$.goOrgSlide(t)}else{var n=this.$('select[name="domainCodeId"]').val(),r=this.$('select[name="domainCodeId"] option:selected').text(),i=!0;_.each(e.$el.parent().find("tr .name_tag .name"),function(e){if($(e).text()==r)return $.goMessage(a["\ub3d9\uc77c\ud55c \ud56d\ubaa9\uc774 \uc788\uc2b5\ub2c8\ub2e4"]),i=!1,!1});if(!i)return!1;this.nameTag.addTag(n,r,{removable:!0})}},renderNameTag:function(){this.$("div.name_tag_add").before(this.nameTag.el),_.each(this.rowModel.get("apprLineRuleItems"),function(e){e.userId?this.nameTag.addTag(e.userId,e.displayName,{attrs:e,removable:!0}):e.domainCodeId&&this.nameTag.addTag(e.domainCodeId,e.domainCodeName,{removable:!0})},this),this.$('input[name="moreAmount"]').inputmask({alias:"decimal",groupSeparator:",",autoGroup:!0,digits:"0",allowMinus:!1}),this.$('input[name="underAmount"]').inputmask({alias:"decimal",groupSeparator:",",autoGroup:!0,digits:"0",allowMinus:!1})},removeRow:function(){var e=this.$el.closest("tbody");this.remove(),this.trigger("reSetSeq"),this.trigger("reSetAcoountState"),this.trigger("ruleTypeReopen"),d(e,a["\uacb0\uc7ac\uc790\ub97c \ucd94\uac00\ud558\uc138\uc694"])},getData:function(){var e={seq:this.rowModel.get("seq"),activityTypeName:this.$('select[name="activityTypeName"]').val(),name:this.$('input[name="groupName"]').val(),moreAmount:this.$('input[name="moreAmount"]').inputmask("unmaskedvalue")||"0",underAmount:this.$('input[name="underAmount"]').inputmask("unmaskedvalue"),apprLineRuleItems:this.getLineRuleItems(),isUserType:this.rowModel.get("isUserType")};return e},validate:function(){var e="true";return _.isEmpty(this.$("[name=groupName]").val())?(e=a["\uadf8\ub8f9\uba85\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694"],e):this.$(".name_tag li").length==0?(e=a["\ud56d\ubaa9\uc5d0 \ud558\ub098 \uc774\uc0c1\uc758 \uc120\ud0dd\uac12\uc774 \ud544\uc694\ud569\ub2c8\ub2e4"],e):e},getLineRuleItems:function(){var e=[],t={};return _.each(this.nameTag.getNameTagList(),function(n,r){this.rowModel.get("isUserType")?t={seq:r+1,userId:n.userId,displayName:n.displayName,deptId:n.deptId,approvalAssigned:n.approvalAssigned}:t={seq:r+1,domainCodeId:n.id,domainCodeName:n.name},e.push(t)},this),e}}),p=['<tr class="added_tr" data-nodeid={{data.nodeId}}>','<td class="name">','<span class="txt">{{data.name}}</span>',"</td>",'<td class="opt_check">','<span class="wrap_single_form">','<input type="checkbox" {{#data.cascade}}checked{{/data.cascade}}>',"</span>","</td>",'<td class="opt">','<span class="wrapBtn" name="removeDeptRow"><span class="ic ic_delete" title="\uc0ad\uc81c"></span></span>',"</td>","</tr>"].join(""),v=e.View.extend({tagName:"div",className:"approvalLineConfig",initialize:function(e){this.options=e||{},this.apprConfig=this.options.apprConfig,this.domain=this.options.domain,this.companyIds=this.options.companyIds,this.model=this.options.model,this.maxLength=this.options.maxLength,this.unbindEvent(),this.bindEvent(),this.$el.data("instance",this),this.id="approvalLineConfig_"+this.cid,this.$el.attr("id",this.id)},bindEvent:function(){this.$el.on("change",'input[name="useAccountRule"]',$.proxy(this.toggleView,this)),this.$el.on("click",'span[name="addGroup"]',$.proxy(this.addGroup,this)),this.$el.on("click",'span[name="addApprover"]',$.proxy(this.addApprover,this)),this.$el.on("click",'span[name="reorder"]',$.proxy(this.reorder,this)),this.$el.on("click",'span[name="reorderComplete"]',$.proxy(this._sortableComplete,this)),this.$el.on("click",'span[name="showDeptTree"]',$.proxy(this.showDeptTree,this)),this.$el.on("click",'span[name="removeDeptRow"]',$.proxy(this.removeDeptRow,this)),this.$el.on("click",'span[name="approvalLineConfigDelete"]',$.proxy(this.approvalLineConfigDelete,this)),this.$el.on("change",'select[name="priorityType"]',$.proxy(this.changePriorityType,this)),this.$el.on("focus",'select[name="priorityType"]',$.proxy(this.focusPriorityType,this))},unbindEvent:function(){this.$el.off("change",'input[name="useAccountRule"]'),this.$el.off("click",'span[name="addRow"]'),this.$el.off("click",'span[name="addApprover"]'),this.$el.off("click",'span[name="reorder"]'),this.$el.off("click",'span[name="reorderComplete"]'),this.$el.off("click",'span[name="showDeptTree"]'),this.$el.off("click",'span[name="removeDeptRow"]'),this.$el.off("click",'span[name="approvalLineConfigDelete"]'),this.$el.off("change",'select[name="priorityType"]'),this.$el.off("focus",'select[name="priorityType"]')},render:function(){return this.$el.html(i({cid:this.cid,lang:a,data:this.model.toJSON(),isDutyType:this.model.get("ruleTypeName")=="duty",isGradeType:this.model.get("ruleTypeName")=="grade",isPositionType:this.model.get("ruleTypeName")=="position",isSubDepartment:function(){return function(e){var t=Hogan.compile(e).render(this);return t=="subdepartment"?"checked":""}}})),this.model.get("apprLineRuleItemGroups").length>0&&this.renderRows(),this.maxLength!=undefined&&this.setInitPriorityOption(),d(this.$el.find("tbody[name=deptListTbody]"),a["\ubd80\uc11c\ub97c \ucd94\uac00\ud558\uc138\uc694"]),d(this.$el.find("tbody[id=appr_line_tbody]"),a["\uacb0\uc7ac\uc790\ub97c \ucd94\uac00\ud558\uc138\uc694"]),this.deptConfigBindEvent(this.cid),this},setInitPriorityOption:function(){var e="";for(var t=1;t<this.maxLength;t++)e+="<option value="+t+">"+t+"</option>";this.$el.find("select[name=priorityType]").html(e),this.$el.find("select[name=priorityType]").val(this.model.toJSON().subSeq)},focusPriorityType:function(e){this.previousPriorityValue=e.currentTarget.value},changePriorityType:function(e){var t=this,n=e.currentTarget.value,r="priorityType_"+this.cid,i=$("#approvalLineConfig_"+this.cid).closest("div.tool_bar"),s=i.find("select[name=priorityType]");$.each(s,function(e,i){if(r==i.id)return!0;var s=$(this).find("option:selected");if(s.val()==n)return s.closest("select").val(t.previousPriorityValue).prop("selected",!0),!1}),s.blur().trigger("focusout")},approvalLineConfigDelete:function(e){var t=$("#approvalLineConfig_"+this.cid).closest("div.tool_bar");this.$el.remove();var n=t.find("div.approvalLineConfig").length;n<=1&&(t.find('span[name="approvalLineConfigDelete"]').hide(),t.find('span[name="priorityTypeSpan"]').hide()),y(t)},deptConfigBindEvent:function(e){this.$el.off("click","input[name=deptTypeName_"+this.cid+"]"),this.$el.on("click","input[name=deptTypeName_"+this.cid+"]",$.proxy(this.changeDeptConfig,this))},changeDeptConfig:function(e){var t=this,n=this.$el.parent(),r=e.currentTarget.value,i=null,s=new c;if(r=="all_depts"){if(n.find('div[name="useAllDeptContainer"]').length>=1){$.goError("\uc804\uccb4\ubd80\uc11c \uc124\uc815\uc740 \ud558\ub098 \uc774\uc0c1 \uc124\uc815\uc774 \ubd88\uac00\ub2a5\ud569\ub2c8\ub2e4."),e.preventDefault();return}s.attributes.useAllDept=!0,i=new v({apprConfig:t.apprConfig,domain:t.domain,companyIds:t.companyIds,model:s}),n.find(".approvalLineConfig").length>1?(this.$el.remove(),n.find(".approvalLineConfig").last().after(i.render().$el)):this.$el.replaceWith(i.render().$el),n.find(".approvalLineConfig").last().find("#applyDeptTypes input:checked").focus()}else i=new v({apprConfig:t.apprConfig,domain:t.domain,companyIds:t.companyIds,model:s}),this.$el.replaceWith(i.render().$el);var o=n.find(".approvalLineConfig").length;o==1&&(n.find('.approvalLineConfig span[name="approvalLineConfigDelete"]').hide(),n.find('.approvalLineConfig span[name="priorityTypeSpan"]').hide()),y(n)},showDeptTree:function(){$.goOrgSlide({header:o["\ubd80\uc11c \ucd94\uac00"],type:"department",isAdmin:!0,contextRoot:GO.contextRoot,callback:$.proxy(function(e){if(e.type=="root")return;this.addDept({id:null,nodeId:e.id,name:e.name})},this)})},addDept:function(e){var t=this.$el.find("tbody[name=deptListTbody]"),n=e.nodeId,r=!1;$.each(t.find("tr.added_tr"),function(e,t){if($(t).data("nodeid")==n){r=!0;return}});if(r)return;t.find(".null_data").length!=0&&t.empty(),t.append(Hogan.compile(p).render({data:e}))},removeDeptRow:function(e){var t=$(e.currentTarget).closest("tbody");$(e.currentTarget).closest("tr").remove(),d(t,a["\ubd80\uc11c\ub97c \ucd94\uac00\ud558\uc138\uc694"])},initSortable:function(){var e=this;this.$el.find("#detailTableItem").sortable({items:"tbody tr",tolerance:"pointer",cursor:"move",opacity:"1",delay:100,placeholder:"ui-sortable-placeholder",start:function(e,t){t.item.disableSelection()},cancel:"select, input"}).filter("input").disableSelection()},reSetSeq:function(){this.$el.find("#detailTableItem tbody tr.added_tr").each(function(e,t){$(t).find("td").eq(0).text(e+1)})},reSetAcoountState:function(){var e=this.$el.find("#detailTableItem tbody tr.added_tr").length;this.$el.find("#detailTableItem tbody tr.added_tr [name=useAccountRuleTd] [name=operatorName]").each(function(t,n){t+1==e?$(n).text(a["\uc774\uc0c1"]):$(n).text(a["\ubbf8\ub9cc"])})},ruleTypeReopen:function(){var e=this,t=!0;$.each(this.$("#appr_line_tbody tr.added_tr"),function(e,n){if($(n).find("select[name=domainCodeId]").length!="0")return t=!1,!1}),t&&e.$("[name*=ruleTypeName_view]").attr("disabled",!1)},renderRows:function(){var e=this,t=this.model.get("ruleTypeName"),n=b.call(this,t),r=e.domain.get(n),i=this.model.get("useAccountRule"),s=this.model.get("apprLineRuleItemGroups").length,o=1;_.each(this.model.get("apprLineRuleItemGroups"),function(n){var s={seq:e.$("#appr_line_tbody tr.added_tr").length+1,types:_.map(e.apprConfig.getTypes(),function(e){return{type:e.type,name:e.name,isSelected:e.type==n["activityTypeName"]}}),codeTypeName:t,domains:r,useAccountRule:i,isUserType:w.call(e,n),name:n.name,moreAmount:n.moreAmount,underAmount:n.underAmount,apprLineRuleItems:n.apprLineRuleItems};e.addRow(new f(s)),w.call(e,n)||e.$("[name*=ruleTypeName_view]").attr("disabled",!0),o++},this)},addGroup:function(){if(this.$("#appr_line_tbody tr.added_tr").length==m)return $.goMessage(GO.i18n(s["{{number}}\uac1c \uae4c\uc9c0 \ucd94\uac00 \uac00\ub2a5 \ud569\ub2c8\ub2e4"],"number",m)),!1;if(!this.validateGroup())return!1;var e=this.$el.find("tbody[id=appr_line_tbody]");e.find(".null_data").length!=0&&e.empty();var t=this.$('input[name*="ruleTypeName"]:checked').val(),n=b.call(this,t),r=this.domain.get(n),i=this.$("#appr_line_tbody tr.added_tr").length+1,o=new f({seq:i,types:this.apprConfig.getTypes(),codeTypeName:t,domains:r,useAccountRule:this.$('input[name*="useAccountRule"]').is(":checked"),isUserType:!1,isMore:!0,isUnder:!1});this.addRow(o),this.$("[name*=ruleTypeName_view]").attr("disabled",!0)},addApprover:function(){if(this.$("#appr_line_tbody tr.added_tr").length==m)return $.goMessage(GO.i18n(s["{{number}}\uac1c \uae4c\uc9c0 \ucd94\uac00 \uac00\ub2a5 \ud569\ub2c8\ub2e4"],"number",m)),!1;var e=this.$el.find("tbody[id=appr_line_tbody]");e.find(".null_data").length!=0&&e.empty();var t=this.$('input[name="groupName"]').val(),n=this.$("#appr_line_tbody tr.added_tr").length+1,r=new f({seq:n,name:s["\uc9c0\uc815 \uacb0\uc7ac\uc790"],types:this.apprConfig.getTypes(),codeTypeName:"USER",useAccountRule:this.$('input[name*="useAccountRule"]').is(":checked"),isUserType:!0,isMore:!0,isUnder:!1});this.addRow(r)},validateGroup:function(){var e=this.$('input[name*="ruleTypeName"]:checked').val(),t=b.call(this,e),n=this.domain.get(t),r;switch(e){case"grade":r=u["\uc9c1\uae09"];break;case"position":r=u["\uc9c1\uc704"];break;default:r=u["\uc9c1\ucc45"]}if(n.length==0)return $.goMessage(GO.i18n(s["{{name}}\uc5d0 \ub300\ud55c \ub3c4\uba54\uc778 \ucf54\ub4dc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"],"name",r)),!1;if(this.$("#appr_line_tbody tr.added_tr").length==1)return!0;var i=this.$('input[name*="ruleTypeName"]:checked').val(),o=!0;return $.each(this.$("#appr_line_tbody tr.added_tr"),function(e,t){var n=$(t).data("instance").codeTypeName;if(n!="USER"&&i!=n)return $.goError(a["\ub3c4\uba54\uc778 \ucf54\ub4dc\uac00 \uc11c\ub85c \ub2e4\ub985\ub2c8\ub2e4"]),o=!1,!1}),o},getData:function(e){var t=[];$.each(this.$("#appr_line_tbody tr.added_tr"),function(e,n){var r=$(n).data("instance");t.push(_.extend(r.getData(),{seq:e+1}))});var n=this.$("input[name=deptTypeName_"+this.cid+"]:checked").val(),r=[],i=!0;n=="part_depts"&&(i=!1,$.each(this.$("tbody[name=deptListTbody] tr.added_tr"),function(e,t){r.push({id:$(t).data("nodeid"),nodeId:$(t).data("nodeid"),nodeType:$(t).find("input[type=checkbox]").is(":checked")?"subdepartment":"department",nodeValue:$(t).find("span.txt:first").text()})}));var s=this.$("select[name=priorityType]").val(),o=this.$('input[name*="useAccountRule"]').is(":checked"),u={useAccountRule:o,assignArbitraryDecision:!o&&this.$('[name="assignArbitraryDecision"]').is(":checked"),requireArbitaryDesision:o&&this.$('[name="requireArbitaryDesision"]').is(":checked"),ruleTypeName:this.$('input[name*="ruleTypeName"]:checked').val(),apprLineRuleItemGroups:t,deptCircle:{nodes:r},subSeq:s,useAllDept:i};return e&&(o||_.each(t,function(e){delete e.moreAmount,delete e.underAmount})),u},addRow:function(e){var t=new h({rowModel:e,companyIds:this.companyIds});t.on("reSetSeq",$.proxy(this.reSetSeq,this)),t.on("reSetAcoountState",$.proxy(this.reSetAcoountState,this)),t.on("ruleTypeReopen",$.proxy(this.ruleTypeReopen,this)),this.$("#appr_line_tbody [name=useAccountRuleTd] [name=operatorName]").text(a["\ubbf8\ub9cc"]),this.$("#appr_line_tbody").append(t.render().$el)},reorder:function(){var e=this._renderForReorderView();e&&(this.$("[name=reorder]").hide(),this.$("[name=reorderComplete]").show())},_sortableComplete:function(){this.$("[name=reorder]").show(),this.$("[name=reorderComplete]").hide(),this._sortableSwitch("off"),this.reSetSeq(),this.reSetAcoountState()},_renderForReorderView:function(){return this.$("#detailTableItem tbody tr.added_tr").length==0?($.goMessage(a.empty_msg),!1):(this.$("#detailTableItem tbody").sortable({opacity:"1",delay:100,cursor:"move",items:"tr",containment:".content_page",hoverClass:"ui-state-hover",helper:"clone",placeholder:"ui-sortable-placeholder",cancel:".disabled",start:function(e,t){t.placeholder.html(t.helper.html()),t.placeholder.find("td").css("padding","5px 10px")}}),this._sortableSwitch("on"),!0)},_sortableSwitch:function(e){e=="on"?(this.$("#detailTableItem tbody").addClass("ui-sortable"),this.$("#detailTableItem tbody tr").removeClass("disabled")):e=="off"&&(this.$("#detailTableItem tbody").removeClass("ui-sortable"),this.$("#detailTableItem tbody tr").addClass("disabled"))},toggleView:function(e){var t=$(e.currentTarget).is(":checked"),n=[];$.each(this.$("#appr_line_tbody tr.added_tr"),function(e,n){var r=$(n).data("instance");r.toggleAmount(t)}),this.$("th.pay").toggle(t),this.$("col.pay").toggle(t),this.$('[name="assignArbitraryDecisionArea"]').toggle(!t),this.$('[name="requireArbitaryDesisionArea"]').toggle(t),this.$('[name="arbitaryDesisionAreaToolTip"]').text(t?a["\uae30\uc548\uc790\uac00 \uc785\ub825\ud55c \uae08\uc561\uc5d0 \ub300\ud574 \uad8c\ud55c\uc774 \uc788\uc5b4\ub3c4, \ud55c\ub2e8\uacc4 \ucc28\uc0c1\uc704\uc790\uc758 \uacb0\uc7ac\uac00 \ud544\uc694\ud55c \uacbd\uc6b0 \uc0ac\uc6a9\ud569\ub2c8\ub2e4"]:a["\uae30\uc548\uc790\uc758 \ubc14\ub85c \ub2e4\uc74c \uc0ac\ub78c\uae4c\uc9c0\ub9cc \uacb0\uc7ac\uc120\uc73c\ub85c \uc9c0\uc815\ud569\ub2c8\ub2e4"])},validate:function(){var e=this,t="true",n=this.$("#appr_line_tbody tr .pay"),r=this.$el.find("input[name=deptTypeName_"+this.cid+"]:checked").val(),i=this.$el.find("tbody[name=deptListTbody] tr.added_tr");if(r=="part_depts"&&i.length==0)return t=a["\ucd5c\uc18c \ud558\ub098 \uc774\uc0c1\uc758 \ubd80\uc11c\uac00 \uc788\uc5b4\uc57c \ud569\ub2c8\ub2e4."],t;if(this.$("#appr_line_tbody tr.added_tr").length==0)return t=a["\ucd5c\uc18c \ud558\ub098 \uc774\uc0c1\uc758 \uacb0\uc7ac\uc120\uc774 \uc788\uc5b4\uc57c \ud569\ub2c8\ub2e4"],t;$.each(this.$("#appr_line_tbody tr.added_tr"),function(e,n){var r=$(n).data("instance");t=r.validate();if(t!="true")return!1});if(t!="true")return t;$("input[name='useAccountRule']").is(":checked")&&$.each(this.$("[name=useAccountRuleTd]"),function(e,n){var r=$(n).find("[name=moreAmount]").inputmask("unmaskedvalue"),i=$(n).find("[name=underAmount]").inputmask("unmaskedvalue");return r=r==null?0:parseFloat(r),i!=null&&r>i?t=a["\uae08\uc561 \uad6c\uac04 \uc124\uc815 \uc624\ub958"]:r==0&&i==null&&(t=a["\uae08\uc561\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694"]),t});var s=[];$.each(this.$("#appr_line_tbody tr .name_tag .name"),function(e,t){s.push($(t).text())});var o=_.uniq(s);return s.length!=o.length?(t=a["\ub3d9\uc77c\ud55c \ud56d\ubaa9\uc774 \uc788\uc2b5\ub2c8\ub2e4"],t):t}}),m=9,g=e.View.extend({tagName:"div",className:"container",attributes:{name:"lineRuleItemArea"},lineTableView:null,initialize:function(e){this.options=e||{},this.apprConfig=this.options.apprConfig,this.domain=this.options.domain,this.companyIds=this.options.companyIds,this.model=this.options.model,this.unbindEvent(),this.bindEvent(),this.$el.data("instance",this)},bindEvent:function(){this.$el.on("click",".btn_delete_option",$.proxy(this.deleteOption,this)),this.$el.on("click","#btn_add_dept_config",$.proxy(this.addDeptConfig,this))},unbindEvent:function(){this.$el.off("click",".btn_delete_option"),this.$el.off("click","#btn_add_dept_config")},render:function(){var e=this;this.$el.html(n({lang:a}));var t=new v(this.options);return this.$("#appr_line_dept_config_wrap").append(t.render().$el),this},deleteOption:function(){$("[name=lineRuleItemArea]").length<=2?$(".btn_delete_option").hide():$(".btn_delete_option").show(),this.remove()},addDeptConfig:function(){var e=new v({apprConfig:this.apprConfig,domain:this.domain,companyIds:this.companyIds,model:new c}),t=e.render().$el,n=this.$el.find(".approvalLineConfig").last();n.find("#applyDeptTypes input:checked").val()=="all_depts"?n.before(t):n.after(t),this.$el.find('.approvalLineConfig span[name="priorityTypeSpan"]').show(),this.$el.find('.approvalLineConfig span[name="approvalLineConfigDelete"]').show(),y(this.$el),t.find("#applyDeptTypes input:checked").focus()},addLineRuleItemAreaView:function(e){var e=e||{},t=new v({apprConfig:e.apprConfig,domain:e.domain,companyIds:e.companyIds,model:e.model,maxLength:e.maxLength}),n=e.firstLineItemView.$el.find(".approvalLineConfig").closest("div.tool_bar");n.append(t.render().$el),y(n)}});return g});