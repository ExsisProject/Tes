define("approval/components/apprflow_editor/views/apprline/apprline",["backbone","app","approval/components/apprflow_editor/views/base_tab_item","approval/components/apprflow_editor/views/side","hgn!approval/components/apprflow_editor/templates/tab/layout","text!approval/components/apprflow_editor/templates/tab/header_apprline.html","text!approval/components/apprflow_editor/templates/tab/footer_apprline.html","approval/components/apprflow_editor/views/side/org_tree","approval/components/apprflow_editor/views/side/my_appr_line","approval/components/apprflow_editor/views/apprline/activity_groups","approval/models/appr_line","i18n!nls/commons","i18n!approval/nls/approval"],function(e,t,n,r,i,s,o,u,a,f,l,c,h){function v(){var e=!this.editable();this.$el.html(i({isArbitraryCheckVisible:this.model.getActionCheck("isArbitraryCheckVisible"),useParallelAgreement:this.model.apprFlowModel.get("useParallelAgreement"),isPermissibleArbitraryDecision:this.model.getActionCheck("isPermissibleArbitraryDecision"),useAgreementType:this.model.getActionCheck("useAgreement"),disabled:e,disableParallelAgreementModify:this.model.isStatusProgress()||e,lang:p},{activityHeader:s,activityFooter:o}))}function m(e,n){var r=$("input#my_line_title_input").val();if(_.isEmpty(r)||r.length>this._MAX_LENGTH_OF_MY_LINE_TITLE)return $.goMessage(t.i18n(h["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"1",arg2:"20"})),!1;var i=0;_.each(this.activityGroupsView.getActivityGroupsWithoutDraftActivity(),function(e){i+=e.activities.length});if(i<1)return $.goMessage(h["\uc120\ud0dd\ub41c \ud56d\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]),!1;var s=new l({activityGroups:this.activityGroupsView.getActivityGroupsWithoutDraftActivity(),title:r,useParallelAgreement:this.model.apprFlowModel.get("useParallelAgreement")});s.save({},{success:$.proxy(function(t,r,i){$.goMessage(p.msg_save_success),this.observer.trigger("reloadMyLine"),e.close("",n)},this),error:function(e,t,n){$.goMessage(p.msg_duplicated_my_line_title)}})}function g(){return['<table class="table_form_mini"><form>',"<tbody><tr>","</tr><tr>",'    <th><span class="txt">'+h["\uacb0\uc7ac\uc120 \uc774\ub984"]+"</span></th>",'    <td><input id="my_line_title_input" class="txt_mini w_max" type="text"></td>',"</tr>","</tbody></form></table>"].join("\n")}var p={activityType:h["\ud0c0\uc785"],name:c["\uc774\ub984"],dept:h["\ubd80\uc11c"],state:h["\uc0c1\ud0dc"],remove:c["\uc0ad\uc81c"],all_remove:c["\uc804\uccb4 \uc0ad\uc81c"],arbitrary:h["\uc804\uacb0"],agreementType:h["\ud569\uc758\ubc29\uc2dd"],agreementLinear:h["\uc21c\ucc28\ud569\uc758"],agreementParallel:h["\ubcd1\ub82c\ud569\uc758"],saveMyApprLine:h["\uac1c\uc778 \uacb0\uc7ac\uc120\uc73c\ub85c \uc800\uc7a5"],msg_duplicated_my_line_title:h["\uc911\ubcf5\ub41c \uc774\ub984\uc744 \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_save_success:c["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]},d=n.extend({tabId:"apprline",tabName:h["\uacb0\uc7ac \ub77c\uc778"],className:"set_data wrap_approvalLine_set",sideView:null,activityGroupsView:null,masterAuthModel:null,observer:null,_MAX_LENGTH_OF_MY_LINE_TITLE:20,viewerType:"",events:{"click .save-myapprline-btn":"_saveAsPeronalApprLine","click input[name=useParallelAgreement]":"_onChangeAgreementType","click #allActivityDelete":"_allActivityDelete"},initialize:function(t){n.prototype.initialize.apply(this,arguments),t=t||{},t.observer&&t.observer.hasOwnProperty("bind")?this.observer=t.observer:this.observer=_.extend({},e.Events),t.hasOwnProperty("isAdmin")&&(this.isAdmin=t.isAdmin),this.viewerType="",t.hasOwnProperty("viewerType")&&(this.viewerType=t.viewerType),t.hasOwnProperty("masterAuthModel")&&(this.masterAuthModel=t.masterAuthModel),v.call(this),this.activityGroupsView=new f({el:this.$el.find(".list_approval_line_wrap"),model:this.model,disable:!this.editable(),observer:this.observer})},render:function(){this.activityGroupsView.render()},remove:function(){this.sideView.remove(),this.activityGroupsView.remove(),n.prototype.remove.apply(this,arguments)},editable:function(){if(this.model.isStatusComplete()||this.model.isStatusReturned())return!1;var e=this.viewerType==="docmaster"||this.viewerType==="formadmin",t=this.masterAuthModel&&this.masterAuthModel.authWrite(),n=e&&t;return n||this.model.Permission.canEditApprLine()},usable:function(){return this.viewerType!="official_document"},activate:function(){n.prototype.activate.apply(this,arguments),this.activityGroupsView.activate()},deactivate:function(){n.prototype.deactivate.apply(this,arguments),this.activityGroupsView.deactivate()},_saveAsPeronalApprLine:function(e){var t="gopopup-personalapprline";e.preventDefault();if($("#"+t).length>0)return;if(!this.editable())return;var n=0;_.each(this.activityGroupsView.getActivityGroupsWithoutDraftActivity(),function(e){n+=e.activities.length});if(n<1){$.goMessage(h["\uc120\ud0dd\ub41c \ud56d\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]);return}var r=$.goPopup({id:t,allowPrevPopup:!0,pclass:"layer_normal",header:h["\uac1c\uc778 \uacb0\uc7ac\uc120\uc73c\ub85c \uc800\uc7a5"],modal:!0,width:300,contents:g(),buttons:[{btext:c["\ud655\uc778"],btype:"confirm",autoclose:!1,callback:_.bind(m,this)},{btext:c["\ucde8\uc18c"],btype:"cancel"}]});$("input#my_line_title_input").keypress(_.bind(function(e){if(e.which==13)return m.call(this,r,e),!1},this))},_onChangeAgreementType:function(e){var t=$(e.currentTarget).val()=="true"||$(e.currentTarget).val()==1;this.model.apprFlowModel.set("useParallelAgreement",t),this.model.set("apprFlowChanged",!0),this.observer.trigger("changedTabItem",this.getTabId())},_allActivityDelete:function(e){this.activityGroupsView._allActivityDelete()}});return d});