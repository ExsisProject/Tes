(function(){define(["jquery","underscore","backbone","app","helpers/form","system/collections/simple_companies","i18n!survey/nls/survey","i18n!nls/commons","i18n!approval/nls/approval","i18n!admin/nls/admin","i18n!board/nls/board","go-nametags","libraries/go-classcodepicker"],function(e,t,n,r,i,s,o,u,a,f,l,c,h){var p={user:u["\uc0ac\uc6a9\uc790"],subdepartment:a["\ubd80\uc11c"],department:a["\ubd80\uc11c"],position:a["\uc9c1\uc704"],duty:f["\uc9c1\ucc45"],grade:f["\uc9c1\uae09"],company:f["\uc0ac\uc774\ud2b8\uba85"],usergroup:f["\uc0ac\uc6a9\uc790\uadf8\ub8f9"],position_select:f["\uc9c1\uc704 \uc120\ud0dd"],duty_select:f["\uc9c1\ucc45 \uc120\ud0dd"],grade_select:f["\uc9c1\uae09 \uc120\ud0dd"],usergroup_select:f["\uc0ac\uc6a9\uc790\uadf8\ub8f9 \uc120\ud0dd"],including_sub_dept:l["\ud558\uc704 \ubd80\uc11c \ud3ec\ud568"],include_child_dept:o["\ud558\uc704 \ubd80\uc11c \ud3ec\ud568\ud558\uae30"],select_department:o["\ubd80\uc11c \uc120\ud0dd"],select_user:o["\uc0ac\uc6a9\uc790 \uc120\ud0dd"],add:u["\ucd94\uac00"],remove:u["\uc0ad\uc81c"],add_dept:o["\ubd80\uc11c\ucd94\uac00"],dept_name:o["\ubd80\uc11c\uba85"],target_whole:o["\uc804\uc0ac"],target_part:o["\uc77c\ubd80"],select_dept:o["\ubd80\uc11c \uc120\ud0dd"],select_class:o["\ud074\ub798\uc2a4 \uc120\ud0dd"],child_dept:o["\ud558\uc704 \ubd80\uc11c"],site_select:f["\uc0ac\uc774\ud2b8 \uc120\ud0dd"],writable:f["\uc4f0\uae30\uac00\ub2a5"],notUseApprReception:"\ubb38\uc11c \uc218\uc2e0 \uae30\ub2a5\uc744 \uc0ac\uc6a9\ud558\uc9c0 \uc54a\ub294 \ubd80\uc11c\uc785\ub2c8\ub2e4. \ud574\ub2f9 \ubd80\uc11c\ub97c \ucd94\uac00\ud558\ub824\uba74 [\uc804\uc790\uacb0\uc7ac > \ubd80\uc11c \ubb38\uc11c\ud568 \uad00\ub9ac > \ubd80\uc11c \ubb38\uc11c\ud568 \uc0ac\uc6a9 \uc124\uc815]\uc5d0\uc11c \uc218\uc2e0\ud568\uc744 \uccb4\ud06c\ud574\uc8fc\uc138\uc694.",notUseApprReference:"\ubd80\uc11c\ubb38\uc11c\ud568 \uae30\ub2a5\uc744 \uc0ac\uc6a9\ud558\uc9c0 \uc54a\ub294 \ubd80\uc11c\uc785\ub2c8\ub2e4. \ud574\ub2f9 \ubd80\uc11c\ub97c \ucd94\uac00\ud558\ub824\uba74 [\uc804\uc790\uacb0\uc7ac > \ubd80\uc11c \ubb38\uc11c\ud568 \uad00\ub9ac > \ubd80\uc11c \ubb38\uc11c\ud568 \uc0ac\uc6a9 \uc124\uc815]\uc5d0\uc11c \ubd80\uc11c\ud568\uc744 \uccb4\ud06c\ud574\uc8fc\uc138\uc694."},d={READABLE:"read",WRITABLE:"write",REMOVABLE:"remove",MANAGABLE:"manage"},v=n.Model.extend({defaults:{nodeId:0,nodeDeptId:"",nodeCompanyId:null,nodeCompanyName:null,nodeType:"user",nodeValue:"",actions:"",members:null},initialize:function(){t.isArray(this.get("members"))||this.set("members",[])},isUserType:function(){return this.get("nodeType")=="user"},isUserWithDeptType:function(){return this.isUserType()&&!this.get("nodeDeptId")},isDeptType:function(e){var t=this.get("nodeType")=="department";return e&&(t=t||this.isSubDeptType()),t},isSubDeptType:function(){return this.get("nodeType")=="subdepartment"},isPositionType:function(){return this.get("nodeType")=="position"},isGradeType:function(){return this.get("nodeType")=="grade"},isDutyType:function(){return this.get("nodeType")=="duty"},isUserGroupType:function(){return this.get("nodeType")=="usergroup"},isCompanyType:function(){return this.get("nodeType")=="company"}}),m=n.Collection.extend({model:v,addNode:function(e){var n=this.getByNodeIdAndType(e.get("nodeId"),e.get("nodeType"),e.get("nodeDeptId"));return t.isUndefined(n)?(this.add(e),!0):!1},getByNodeIdAndType:function(e,n,r){return this.find(function(i){var s=e==i.get("nodeId"),o=n==i.get("nodeType");return t.contains(["department","subdepartment"],n)&&i.isDeptType(!0)&&(o=!0),i.isUserWithDeptType()&&(o=s&&i.get("nodeDeptId")==r),s&&o})},removeByNodeIdAndType:function(e,t,n){var r=this.getByNodeIdAndType(e,t,n);return r?(this.remove(r),!0):!1}}),g=n.Model.extend({defaults:{discription:"",nodes:null},initialize:function(){t.isArray(this.get("nodes"))?this.set("nodes",this.get("nodes").slice()):this.set("nodes",[])},getNodeCollection:function(){return new m(this.get("nodes"))}}),y=n.View.extend({tagName:"span",className:"vertical_wrap",events:{"change #circle_company_select":"_onCompanySelected",'click span[data-type="add"]':"_onClickAdd"},initialize:function(e){this.collection=new s,this.observer=e.observer,this.useAction=t.isBoolean(e.useAction)?e.useAction:!1,this.callback=t.isFunction(e.callback)?e.callback:function(){return},t.isArray(e.ids)&&(this.ids=t.map(e.ids,function(e){return""+e}))},render:function(){var e=this;this.collection.fetch({success:function(t){e.$el.append(e._renderTemplate(t.toJSON(),e.useAction)),e._notifyCompanySelected()}})},_renderTemplate:function(e,n){t.isArray(this.ids)&&(e=t.filter(e,function(e){return t.contains(this.ids,""+e.id)},this));var r=['<span class="option_wrap">','    <label class="tit" title="">{{labelTitle}}</label>',"</span>",'<select id="circle_company_select">',"    {{#companies}}",'    <option value="{{name}}" data-id="{{id}}" data-name="{{name}}">{{name}}</option>',"    {{/companies}}","    {{^companies}}","    <option>{{labelNoCompanies}}</option>","    {{/companies}}","</select>","{{#useAction}}",'<span class="option_wrap" id="publicWritableAuthWrap">','    <input type="checkbox" value="" class="writePossible" id="publicWritableAuth">','    <label for="publicWritableAuth">{{lang.writable}}</label>',"</span>","{{/useAction}}",'<span class="btn_wrap">','    <span class="btn_s select_org_node" data-type="add">{{add}}</span>',"</span>"];return Hogan.compile(r.join("\n")).render({labelTitle:p.site_select,labelNoCompanies:f["\uc120\ud0dd\ub41c \uc0ac\uc774\ud2b8\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."],companies:e,add:p.add,type:"add",useAction:n,lang:p})},_onClickAdd:function(e){var t=new v,n=this.$el.find("#circle_company_select > option:selected"),r=[];this.useAction&&(r.push(d.READABLE),this.$el.find("#publicWritableAuth").prop("checked")&&r.push(d.WRITABLE)),t.set("nodeCompanyId",n.attr("data-id")),t.set("nodeId",n.attr("data-id")),t.set("nodeCompanyName",n.attr("data-name")),t.set("actions",r),t.set("nodeType","company"),this.callback(t)},_onCompanySelected:function(e){this._notifyCompanySelected()},_notifyCompanySelected:function(){var e=this.$el.find("#circle_company_select > option:selected");this.observer.trigger("companySelected",e.attr("data-id"),e.attr("data-name"))}}),b=n.View.extend({initialize:function(e){this.isAdmin=t.isBoolean(e.isAdmin)?e.isAdmin:!0,this.visibleCompanyName=t.isBoolean(e.visibleCompanyName)?e.visibleCompanyName:!1,this.collection=t.isArray(e.collection.models)?new m(e.collection.models):new m,this.withoutSubDept=t.isBoolean(e.withoutSubDept)?e.withoutSubDept:!1,this.addCallback=t.isFunction(e.addCallback)?e.addCallback:null,this.removeCallback=t.isFunction(e.removeCallback)?e.removeCallback:null,this.useAction=t.isBoolean(e.useAction)?e.useAction:!1},render:function(){this._renderNodeList(),this.$el.off(),this.$el.on("click","span.ic_delete",e.proxy(this._deleteNodeFromList,this)),this.$el.on("click","input[name=include_sub_dept]",e.proxy(this._toggleSubDeptIncluding,this))},addNodeToList:function(e){this.collection.addNode(e),t.isFunction(this.addCallback)&&this.addCallback()},_renderNodeList:function(){this.$el.html(this._makeTemplate({nodes:this._makeTemplateData(this.collection),withoutSubDept:this.withoutSubDept,visibleCompanyName:this.visibleCompanyName,delete_label:p.remove,including_sub_dept_label:p.including_sub_dept,useAction:this.useAction}))},_makeTemplate:function(e){var t=['<div class="option_display" style="height: 170px;overflow-y: auto;overflow-x: hidden;">','    <div class="vertical_wrap_s">','        <ul class="list_option">',"            {{#nodes}}",'            <li {{#isFirst?}}class="first"{{/isFirst?}} data-nodeId="{{nodeId}}" data-nodeType="{{nodeType}}" data-nodeDeptId="{{nodeDeptId}}" data-actions="{{actions}}">','                <span class="minor">',"                    {{nodeTypeLabel}} : {{nodeValue}}{{#visibleCompanyName}}{{#nodeCompanyName}} {{^isCompanyType}}-{{/isCompanyType}} {{nodeCompanyName}}{{/nodeCompanyName}}{{/visibleCompanyName}}","                    {{^withoutSubDept}}{{#isDeptOrSubDeptType?}}",'                        <span class="sub_depart"> ( <input type="checkbox" name="include_sub_dept" {{#isSubDeptType?}}checked{{/isSubDeptType?}}><label for="">{{including_sub_dept_label}}</label> )</span>',"                    {{/isDeptOrSubDeptType?}}{{/withoutSubDept}}","                </span>","                {{#useAction}}",'                <span class="minor">',"                    [{{actionName}}]","                </span>","                {{/useAction}}",'                <span class="btn_border"><span class="ic ic_delete" title="{{delete_label}}"></span></span>',"            </li>","            {{/nodes}}","        </ul>","    </div>","</div>"];return Hogan.compile(t.join("\n")).render(e)},_makeTemplateData:function(e){return t.map(e.models,function(e,t){return{"isFirst?":t==0,"isDeptOrSubDeptType?":e.isDeptType(!0),"isSubDeptType?":e.isSubDeptType(),nodeId:e.get("nodeId"),nodeType:e.get("nodeType"),nodeDeptId:e.get("nodeDeptId"),nodeCompanyName:e.get("nodeCompanyName"),nodeValue:e.get("nodeValue"),nodeTypeLabel:p[e.get("nodeType")],actions:e.get("actions"),isCompanyType:e.isCompanyType(),actionName:function(){var t=e.get("actions"),n=[];return t.indexOf(d.READABLE)>=0&&n.push(f["\uc77d\uae30"]),t.indexOf(d.WRITABLE)>=0&&n.push(f["\uc4f0\uae30"]),n.join("/")}()}})},_deleteNodeFromList:function(n){var r=e(n.currentTarget).parent().parent();this.collection.removeByNodeIdAndType(r.attr("data-nodeId"),r.attr("data-nodeType"),r.attr("data-nodeDeptId")),this._renderNodeList(),t.isFunction(this.removeCallback)&&this.removeCallback()},deleteAllNodeFromList:function(){t.each(this.getDataAsJSON(),function(e){this.collection.removeByNodeIdAndType(e.nodeId,e.nodeType,e.nodeDeptId)},this),this._renderNodeList()},deleteNodeOfCompany:function(e){var n=this.collection.filter(function(n){return!t.isUndefined(n.get("nodeCompanyId"))&&!t.isUndefined(e)&&String(n.get("nodeCompanyId"))==String(e)?!0:!1});this.collection.remove(n)},_toggleSubDeptIncluding:function(t){var n=e(t.currentTarget).parent().parent().parent(),r=e(t.currentTarget).is(":checked"),i=this.collection.getByNodeIdAndType(n.attr("data-nodeId"),n.attr("data-nodeType"),n.attr("data-nodeDeptId"));i.set("nodeType",r?"subdepartment":"department"),this._renderNodeList()},getDataAsJSON:function(){return this.collection.toJSON()}}),w=n.View.extend({tagName:"span",className:"vertical_wrap",initialize:function(e){this.isAdmin=t.isBoolean(e.isAdmin)?e.isAdmin:!0,this.nodeTypes=t.isArray(e.nodeTypes)?e.nodeTypes:w.NODE_TYPES,this.callback=t.isFunction(e.callback)?e.callback:function(){return},this.labelVisible=t.isBoolean(e.labelVisible)?e.labelVisible:!1,this.useAction=t.isBoolean(e.useAction)?e.useAction:!1,this.useApprReception=t.isBoolean(e.useApprReception)?e.useApprReception:!1,this.useApprReference=t.isBoolean(e.useApprReference)?e.useApprReference:!1,this.observer=e.observer},render:function(n,r){this.$el.html(this._prepareTemplate({labelVisible:this.labelVisible,labelClassSelect:p.select_class,nodeTypes:t.map(this.nodeTypes,function(e){return{value:e,label:p[e]}})})),this._renderSelectableList(null,n,r),this.$el.off().on("change","select.node_type_select",e.proxy(function(t){this._renderSelectableList(e(t.target).val(),n,r)},this)),this.observer.bind("companySelected",function(){var e=arguments[0],t=arguments[1];this.render(e,t)},this)},_prepareTemplate:function(e){var t=["{{#labelVisible}}",'<span class="option_wrap">','    <label class="tit" title="">{{labelClassSelect}}</label>',"</span>","{{/labelVisible}}",'<select class="node_type_select">',"{{#nodeTypes}}",'    <option value="{{value}}">{{label}}</option>',"{{/nodeTypes}}","</select>"],n=Hogan.compile(t.join("\n"));return n.render(e)},_renderSelectableList:function(n,r,i){t.isEmpty(n)&&(n=e("select.node_type_select > option:first",this.$el).val()),e("select.node_type_select",this.$el).nextAll().remove(),this.nodePickerView&&this.nodePickerView.close();var s=t.contains(["user","department","subdepartment"],n)?E:S;this.nodePickerView=new s({type:n,companyId:r,isAdmin:this.isAdmin,useApprReception:this.useApprReception,useApprReference:this.useApprReference,callback:e.proxy(function(e){r&&(e.set("nodeCompanyId",r),e.set("nodeCompanyName",i)),this.callback(e)},this),useAction:this.useAction}),this.nodePickerView.render(),e("select.node_type_select",this.$el).after(this.nodePickerView.$el)}},{NODE_TYPES:["position","grade","duty","usergroup","department","user"]}),E=n.View.extend({tagName:"span",className:"orgNodePicker",orgSlide:null,isAdmin:null,callback:null,useApprReception:null,useApprReference:null,type:null,useAction:null,initialize:function(e){this.type=e.type,this.callback=e.callback,this.isAdmin=t.isBoolean(e.isAdmin)?e.isAdmin:!0,this.companyId=t.isEmpty(e.companyId)?null:e.companyId,this.useAction=t.isBoolean(e.useAction)?e.useAction:!1,this.useApprReception=t.isBoolean(e.useApprReception)?e.useApprReception:!1,this.useApprReference=t.isBoolean(e.useApprReference)?e.useApprReference:!1},render:function(){var n=function(n,r,i){var s=t.contains(["MASTER","MODERATOR","MEMBER"],i.type);if(n=="user"&&!s)return;if(n!="user"&&s)return;if(t.contains(["department","department-nosub"],n)&&i.type!="root"&&this.useApprReception&&!i.useReception){e.goAlert(p.notUseApprReception);return}if(t.contains(["department","department-nosub"],n)&&i.type!="root"&&this.useApprReference&&!i.useReference){e.goAlert(p.notUseApprReference);return}var o=[];this.useAction&&(o.push(d.READABLE),this.$el.find("#wAuth").prop("checked")&&o.push(d.WRITABLE)),r(new v({nodeValue:n=="user"?i.name+" "+i.position:i.name,nodeType:n,nodeId:i.id,nodeDeptId:i.deptId,actions:o.join(",")}))},i=["{{#useAction}}",'<span class="option_wrap">','    <input type="checkbox" value="" class="writePossible" id="wAuth">','    <label for="wAuth">{{lang.writable}}</label>',"</span>","{{/useAction}}",'<span class="btn_wrap">','    <span class="btn_s select_org_node" data-type={{type}}>{{add}}</span>',"</span>"];this.$el.html(Hogan.compile(i.join("\n")).render({type:this.type,add:p.add,useAction:this.useAction,lang:p})),this.$el.off().on("click","span.select_org_node",e.proxy(function(t){var i=e(t.target).data("type");this.orgSlide=e.goOrgSlide({header:p["select_"+i],type:i=="user"?"list":"department",isAdmin:this.isAdmin,companyIds:[this.companyId],contextRoot:r.config("contextRoot"),callback:e.proxy(n,this,this.type,this.callback)})},this))},close:function(){this.orgSlide&&this.orgSlide.close()}}),S=n.View.extend({tagName:"span",className:"classNodePicker",isAdmin:null,callback:null,type:null,useAction:null,initialize:function(e){this.type=e.type,this.companyId=e.companyId,this.callback=e.callback,this.isAdmin=t.isBoolean(e.isAdmin)?e.isAdmin:!0,this.useAction=t.isBoolean(e.useAction)?e.useAction:!1},render:function(){this._fetchClassNodeList(this.type,e.proxy(this._renderClassNodeList,this))},close:function(){return!1},_fetchClassNodeList:function(t,n){var i=r.config("contextRoot")+(this.isAdmin?"ad/":"")+"api/"+t+"/list";this.companyId&&(i+="?companyId="+this.companyId),e.ajax(i).done(function(e){n(e.data,t)})},_renderClassNodeList:function(t,n){var r=["&nbsp;",'<select class="class_selector_option">',"    {{#nodes}}",'    <option value="{{id}}" data-code="{{code}}" data-codeType="{{codeType}}">{{name}}</option>',"    {{/nodes}}","    {{^nodes}}","    <option selected disabled>{{select_name}}</option>","    {{/nodes}}","</select>","{{#useAction}}",'<span class="option_wrap">','    <input type="checkbox" value="" class="writePossible" id="wAuth">','    <label for="wAuth">{{lang.writable}}</label>',"</span>","{{/useAction}}",'<span class="btn_wrap class_selector_button"><span class="btn_s">{{lang.add}}</span></span>'],i=Hogan.compile(r.join("\n"));this.$el.append(i.render({select_name:p[n+"_select"],nodes:t,lang:p,useAction:this.useAction})),this.$el.off(),this.$el.on("click","span.class_selector_button",e.proxy(function(t){var n=e("select.class_selector_option option:selected",this.$el),r=[];this.useAction&&(r.push(d.READABLE),this.$el.find("#wAuth").prop("checked")&&r.push(d.WRITABLE)),this.callback(new v({nodeType:n.attr("data-codetype").toLowerCase(),nodeValue:n.text(),nodeId:n.val(),actions:r.join(",")}))},this))}}),x=n.View.extend({view:null,nodePickerView:null,nodeListView:null,companyListView:null,useApprReception:null,useApprReference:null,initialize:function(r){this.$el=e(r.selector),this.isAdmin=t.isBoolean(r.isAdmin)?r.isAdmin:!0,this.withCompanies=t.isBoolean(r.withCompanies)?r.withCompanies:!1,this.companyIds=t.isArray(r.companyIds)?r.companyIds:[],this.nodeTypes=t.isArray(r.nodeTypes)?r.nodeTypes:w.NODE_TYPES,this.addCallback=t.isFunction(r.addCallback)?r.addCallback:null,this.removeCallback=t.isFunction(r.removeCallback)?r.removeCallback:null,this.useAction=t.isBoolean(r.useAction)?r.useAction:!1,this.useApprReception=t.isBoolean(r.useApprReception)?r.useApprReception:!1,this.useApprReference=t.isBoolean(r.useApprReference)?r.useApprReference:!1,this.noSubDept=t.isBoolean(r.noSubDept)?r.noSubDept:!1;var i=t.isObject(r.circleJSON)?r.circleJSON:{};t.isEmpty(i.nodes)&&(i.nodes=[]),this.model=new g(i);var s=t.extend({},n.Events);this.nodeListView=new b({collection:this.model.getNodeCollection(),visibleCompanyName:this.withCompanies,withoutSubDept:t.contains(this.nodeTypes,"department-nosub")||this.noSubDept,isAdmin:this.isAdmin,addCallback:e.proxy(function(){t.isFunction(this.addCallback)&&this.addCallback(this.getData())},this),removeCallback:e.proxy(function(){t.isFunction(this.removeCallback)&&this.removeCallback(this.getData())},this),useAction:this.useAction}),this.nodePickerView=new w({isAdmin:this.isAdmin,useApprReception:this.useApprReception,useApprReference:this.useApprReference,observer:s,nodeTypes:t.map(this.nodeTypes,function(e){return"department-nosub"==e?"department":e}),labelVisible:this.withCompanies,callback:e.proxy(function(e){this.nodeListView.addNodeToList(e),this.nodeListView.render()},this),useAction:this.useAction}),this.withCompanies&&(this.companyListView=new y({observer:s,useAction:this.useAction,callback:e.proxy(function(e){this.nodeListView.addNodeToList(e),this.nodeListView.render()},this),ids:this.companyIds}))},render:function(){return this.nodePickerView.render(),this.nodeListView.render(),this.withCompanies&&(this.companyListView.render(),this.$el.append(this.companyListView.$el)),this.$el.append(this.nodePickerView.$el),this.$el.append(this.nodeListView.$el),this},getData:function(){return{nodes:this.nodeListView.getDataAsJSON()}},show:function(){this.$el.show()},hide:function(){this.$el.hide()},deleteAllData:function(){this.nodeListView.deleteAllNodeFromList()},deleteDataOfCompany:function(e){this.nodeListView.deleteNodeOfCompany(e)},hideOrgSlide:function(){this.nodePickerView.nodePickerView&&this.nodePickerView.nodePickerView.orgSlide&&this.nodePickerView.nodePickerView.orgSlide.close()}});return x})})();