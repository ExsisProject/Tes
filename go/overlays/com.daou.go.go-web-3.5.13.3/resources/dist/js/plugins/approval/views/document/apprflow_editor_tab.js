(function(){define(["jquery","backbone","app","approval/models/appr_line","approval/collections/appr_lines","approval/views/document/appr_tree","hgn!approval/templates/document/apprflow_my_lines","i18n!nls/commons","i18n!approval/nls/approval","jquery.go-sdk","jquery.jstree","jquery.go-popup","jquery.go-grid","jquery.go-orgtab","jquery.go-validation"],function(e,t,n,r,i,s,o,u,a){var f={header:a["\uacb0\uc7ac \uc815\ubcf4"],save_as_my_line:a["\uac1c\uc778 \uacb0\uc7ac\uc120\uc73c\ub85c \uc800\uc7a5"],delete_as_my_line:a["\uac1c\uc778 \uacb0\uc7ac\uc120 \uc0ad\uc81c"],my_line_name:a["\uacb0\uc7ac\uc120 \uc774\ub984"],normal:a["\uc77c\ubc18"],my_lines:a["\ub098\uc758\uacb0\uc7ac\uc120"],draft:a["\uae30\uc548"],name:u["\uc774\ub984"],dept:a["\ubd80\uc11c"],line:a["\ub77c\uc778"],status:a["\uc0c1\ud0dc"],approval:a["\uacb0\uc7ac"],agreement:a["\ud569\uc758"],agreement_type:a["\ud569\uc758\ubc29\uc2dd"],agreement_linear:a["\uc21c\ucc28\ud569\uc758"],agreement_parallel:a["\ubcd1\ub82c\ud569\uc758"],activityType:a["\ud0c0\uc785"],add:u["\ucd94\uac00"],apply:a["\uc801\uc6a9"],"delete":u["\uc0ad\uc81c"],confirm:u["\ud655\uc778"],cancel:u["\ucde8\uc18c"],group_count_title:a["{{count}}\uac1c\uc758 \uacb0\uc7ac\uc120\uc774 \uc788\uc2b5\ub2c8\ub2e4."],add_activity:a["\uacb0\uc7ac\uc120\uc744 \ucd94\uac00\ud574\uc8fc\uc138\uc694."],msg_empty_my_lines:a["\uac1c\uc778 \uacb0\uc7ac\uc120\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_duplicate_activity:a["\uc911\ubcf5\ub41c \ub300\uc0c1\uc785\ub2c8\ub2e4."],msg_max_approval_count_exceed:a["\uacb0\uc7ac\uc790 \uc218\uac00 \ucd5c\ub300 \uacb0\uc7ac\uc790 \uc218\ub97c \ub118\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_not_selected:a["\uc120\ud0dd\ub41c \ub300\uc0c1\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_not_deletable_status_activity:a["\uc0ad\uc81c\ud560 \uc218 \uc5c6\ub294 \uc0c1\ud0dc\uc758 \uacb0\uc7ac\uc790 \uc785\ub2c8\ub2e4."],msg_not_deletable_assigned_activity:a["\uc9c0\uc815 \uacb0\uc7ac\uc790\ub294 \uc0ad\uc81c\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_save_success:u["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."],msg_duplicated_my_line_title:a["\uc911\ubcf5\ub41c \uc774\ub984\uc744 \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_my_line_set_error_maxCount:a["\uacb0\uc7ac\uc790\ub97c \ucd5c\ub300\uce58\ubcf4\ub2e4 \ub118\uac8c \ud560\ub2f9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],msg_my_line_set_error_assigned_deleted:a["\uc9c0\uc815 \uacb0\uc7ac\uc790\ub294 \uaf2d \ud3ec\ud568\ub418\uc5b4\uc57c \ud569\ub2c8\ub2e4."],msg_my_line_set_error_exceed_group_count:a["\uadf8\ub8f9 \uac2f\uc218\uac00 \ud5c8\uc6a9\uce58\ubcf4\ub2e4 \ub9ce\uc2b5\ub2c8\ub2e4."],msg_parallel_agreement_should_has_2_more_agreement:a["\ubcd1\ub82c\ud569\uc758\ub294 \uc5f0\uc18d\ub41c \ub458 \uc774\uc0c1\uc758 \ud569\uc758\uac00 \ud544\uc694\ud569\ub2c8\ub2e4."]},l=t.View.extend({el:"#my_line_tab_content",docStatus:null,observer:null,initialize:function(t){this.collection=new i,this.observer=t.observer,this.docStatus=t.docStatus,this.$el.off("click","p.title"),this.$el.on("click","p.title",e.proxy(this._onItemSelected,this)),this.$el.off("click","a.ic_del"),this.$el.on("click","a.ic_del",e.proxy(this._onItemDeleted,this))},render:function(){this.$el.empty(),this.$el.css({"min-height":"339px","max-height":"339px"}),this.collection.fetch({success:e.proxy(this._renderMyLineList,this)})},show:function(){this.$el.show()},hide:function(){this.$el.hide()},isShowing:function(){return!0},isHiding:function(){return!0},_renderMyLineList:function(e,t,n){var r=this.docStatus=="CREATE"||this.docStatus=="TEMPSAVE";this.$el.html(o({lang:f,hasMyLines:!e.isEmpty(),myLines:e.map(function(e){return{id:e.get("id"),title:e.get("title"),groupCount:e.get("activityGroups").length,groupCountTitle:GO.i18n(f.group_count_title,"count",e.get("activityGroups").length),isSelected:e.get("isSelected")||!1,isEnabled:r,"delete":f["delete"],apply:f.apply}})}))},_onItemSelected:function(t){var n=this,r=e(t.target),i=e("div#my_line_tab_content").find("ul.side_depth");e.each(i.find("li"),function(){var t=e(this).children().children("a.my_line_a").attr("data-id"),r=n.collection.get(t);r.set("isSelected",!1)});var s=r.parents("li.feed");if(s.hasClass("inactive"))return!1;var o=s.find("a.my_line_a").data("id"),u=this.collection.get(o);u.set("isSelected",!0),this.observer.trigger("myLineSelected",u.get("activityGroups")),this.render()},_onItemDeleted:function(t){var n=e(t.target).parent().find("a.my_line_a"),r=e.proxy(this._deleteAsPeronalApprLineOkButtonCallback,this,n.attr("data-id"),targetEl);e.goConfirm(f.delete_as_my_line,a["\uc120\ud0dd\ud55c \ud56d\ubaa9\uc744 \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],r),t.stopPropagation()},_deleteAsPeronalApprLineOkButtonCallback:function(t,n,i,s){var o=new r;o.save({id:t},{type:"DELETE",success:e.proxy(function(t,r,o){e.goMessage(u["\uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),this.render(),e(n).closest("li").remove(),i.close("",s)},this),error:function(t,n,r){e.goMessage(u["\uad00\ub9ac \uc11c\ubc84\uc5d0 \uc624\ub958\uac00 \ubc1c\uc0dd\ud558\uc600\uc2b5\ub2c8\ub2e4"])}})}}),c=t.View.extend({el:"#tab_container",docStatus:null,observer:null,isAdmin:!1,orgTreeTabView:null,myLinesTabView:null,initialize:function(t){this.docStatus=t.docStatus,this.observer=t.observer,this.isDndActive=t.isDndActive,this.dndDropTarget=t.dndDropTarget,this.isAdmin=t.isAdmin,this.multiCompanySupporting=!1,_.isBoolean(t.multiCompanySupporting)&&(this.multiCompanySupporting=t.multiCompanySupporting),this.$el.off("click","#org_tab"),this.$el.off("click","#my_line_tab"),this.$el.on("click","#org_tab",e.proxy(this._openOrgTab,this)),this.$el.on("click","#my_line_tab",e.proxy(this._openMyLinesTab,this)),this.observer.bind("addActivity",function(){var e=arguments[0];e(this.getSelected())},this)},render:function(){this._renderOrgTabView(),this.isAdmin||this._renderMyLinesTabView()},renderMyLines:function(){this.myLinesTabView.render()},renderContactTree:function(){var e=this._getTreeViewOptions();e.type="contact";var t=new s(e);t.render()},_renderOrgTabView:function(){this.orgTreeTabView=new s(this._getTreeViewOptions()),this.orgTreeTabView.render()},_renderMyLinesTabView:function(){this.myLinesTabView=new l({docStatus:this.docStatus,observer:this.observer}),this.myLinesTabView.render()},getSelected:function(){return this.orgTreeTabView.isShowing()?this.orgTreeTabView.getSelected():{}},_openOrgTab:function(t){this.orgTreeTabView.show(),this.myLinesTabView.hide(),e(t.currentTarget).removeClass("selected").addClass("selected"),e(t.currentTarget).parent().find("#my_line_tab").removeClass("selected")},_openMyLinesTab:function(t){this.myLinesTabView.show(),this.orgTreeTabView.hide(),e(t.currentTarget).removeClass("selected").addClass("selected"),e(t.currentTarget).parent().find("#org_tab").removeClass("selected")},_getTreeViewOptions:function(){return{elementId:"org_tab_content",observer:this.observer,isDndActive:this.isDndActive,dndDropTarget:this.dndDropTarget,multiCompanySupporting:this.multiCompanySupporting,isAdmin:this.isAdmin}}});return c})}).call(this);