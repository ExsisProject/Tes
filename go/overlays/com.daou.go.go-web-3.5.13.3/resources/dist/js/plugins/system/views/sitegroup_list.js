(function(){define(["jquery","backbone","app","hgn!system/templates/sitegroup_list","hgn!system/templates/list_empty","i18n!nls/commons","i18n!admin/nls/admin","jquery.go-grid","jquery.go-sdk","GO.util","jquery.go-validation"],function(e,t,n,r,i,s,o){var u={label_add:s["\ucd94\uac00"],label_delete:s["\uc0ad\uc81c"],label_company_group_name:o["\uc0ac\uc774\ud2b8 \uadf8\ub8f9\uba85"],label_domain_name:o["\ub3c4\uba54\uc778\uba85"],label_company_name:o["\uc0ac\uc774\ud2b8\uba85"],label_user_count:o["\ucd1d \uacc4\uc815\uc218"],label_search:s["\uac80\uc0c9"],label_search_company_group:o["\uc0ac\uc774\ud2b8 \uadf8\ub8f9 \uac80\uc0c9"],label_confirm_delete:o["\uc0ad\uc81c\ud558\uc2dc\uac8c\uc2b5\ub2c8\uae4c?"],label_check_delete_item:o["\uc0ad\uc81c\ud560 \ud56d\ubaa9\uc744 \uc120\ud0dd\ud558\uc138\uc694."]},a=t.View.extend({el:"#layoutContent",initialize:function(){this.unbindEvent(),this.bindEvent()},unbindEvent:function(){this.$el.off("click","span#btn_add"),this.$el.off("click","span#btn_delete"),this.$el.off("click","span#btn_search"),this.$el.off("keydown","input#search")},bindEvent:function(){this.$el.on("click","span#btn_add",e.proxy(this._onAddClicked,this)),this.$el.on("click","span#btn_delete",e.proxy(this._onDeleteClicked,this)),this.$el.on("click","span#btn_search",e.proxy(this._onSearchClicked,this)),this.$el.on("keydown","input#search",e.proxy(this._onSearchInputKeydown,this))},render:function(t){e("#site").addClass("on"),e(".breadcrumb .path").html(o["\uc0ac\uc774\ud2b8 \uad00\ub9ac > \uc0ac\uc774\ud2b8 \uadf8\ub8f9 \ubaa9\ub85d"]),this.$el.empty(),this.$el.html(r({lang:u})),this._renderSiteGroupList(t),e("#search").attr("value",t)},_renderSiteGroupList:function(t){var r=this;this.$tableEl=this.$el.find("#site_group_list"),this.dataTable=e.goGrid({el:"#site_group_list",method:"GET",url:GO.contextRoot+"ad/api/system/companygroup",params:{keyword:t},emptyMessage:i({label_desc:o["\ud45c\uc2dc\ud560 \ub370\uc774\ud130 \uc5c6\uc74c"]}),pageUse:!0,sDomUse:!0,checkbox:!0,sDomType:"admin",checkboxData:"id",defaultSorting:[[1,"asc"]],displayLength:n.session("adminPageBase"),columns:[{mData:"name",sWidth:"250px",bSortable:!0,fnRender:function(e){return"<div id='name"+e.aData.id+"'>"+e.aData.name+"</div>"}},{mData:null,sWidth:"250px",bSortable:!1,fnRender:function(e){var t=[];return _.each(e.aData.companies,function(e){t.push(e.domainName)}),t.join("<br/>")}},{mData:null,sWidth:"200px",bSortable:!1,fnRender:function(e){var t=[];return _.each(e.aData.companies,function(e){t.push(e.name)}),t.join("<br/>")}},{mData:null,sWidth:"200px",bSortable:!1,fnRender:function(e){var t=0;return _.each(e.aData.companies,function(e){t+=e.onlineUserCount}),t}}],fnDrawCallback:function(t){r.$el.find(".toolbar_top .custom_header").append(r.$el.find("#controllButtons").show()),r.$el.find(this.el+" tr>td:nth-child(2)").css("cursor","pointer").click(function(t){var r=e(t.currentTarget).parent().find("input").val();n.router.navigate("system/sitegroup/"+r+"/modify",{trigger:!0})})}})},_onAddClicked:function(e){n.router.navigate("system/sitegroup/create",{trigger:!0})},_onDeleteClicked:function(t){var n=[],r=this;_.each(e('input[name="id"]:checked'),function(t){n.push(e(t).val())});if(_.isEmpty(n))return e.goAlert("",o["\uc0ad\uc81c\ud560 \ud56d\ubaa9\uc744 \uc120\ud0dd\ud558\uc138\uc694."]);e.goConfirm(o["\uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],"",function(){e.go(GO.contextRoot+"ad/api/system/companygroup/",JSON.stringify({ids:n}),{qryType:"DELETE",contentType:"application/json",responseFn:function(t){e.goMessage(s["\uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),r.render()},error:function(t){e.goMessage(s["\uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."]),r.render()}})})},_onSearchClicked:function(e){this._search()},_onSearchInputKeydown:function(e){e.keyCode==13&&this._search()},_search:function(){var t=e("#search").val();if(t=="")return e.goMessage(s["\uac80\uc0c9\uc5b4\ub97c \uc785\ub825\ud558\uc138\uc694."]),!1;if(!e.goValidation.isCheckLength(2,255,t))return e.goMessage(n.i18n(s["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"2",arg2:"255"})),!1;if(!e.goValidation.charValidation("/\\/",t))return e.goMessage(o["\uc785\ub825\ud560 \uc218 \uc5c6\ub294 \ubb38\uc790"]),!1;this.render(t)}},{__instance__:null});return a})}).call(this);