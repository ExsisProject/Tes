(function(){define(["views/mobile/m_more_list","jquery","backbone","hogan","app","when","approval/models/doclist_item","collections/paginated_collection","approval/views/mobile/m_pagination","approval/views/mobile/m_doclist_item","views/mobile/header_toolbar","approval/views/mobile/document/m_appr_form_select","hgn!approval/templates/mobile/m_doclist_empty","hgn!approval/templates/mobile/m_doclist_item","i18n!nls/commons","i18n!approval/nls/approval","jquery.go-validation","GO.util"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v){var m={approval:v["\uc804\uc790\uacb0\uc7ac"],move_to_home:d["\ud648\uc73c\ub85c \uc774\ub3d9"],"\uacf5\ubb38 \ubb38\uc11c\ud568":v["\uacf5\ubb38 \ubb38\uc11c\ud568"],"\uc0c8\uacb0\uc7ac":v["\uc0c8\uacb0\uc7ac"],"\uc591\uc2dd\uc120\ud0dd":v["\uacb0\uc7ac\uc591\uc2dd \uc120\ud0dd"]},g=n.Model.extend({url:"/api/approval/apprconfig"}),y=u.extend({model:o.extend({idAttribute:"_id"}),url:function(){return"/api/"+this.getBaseURL()},getBaseURL:function(){return"approval/doclist/userofficial/all"}}),b=e.extend({el:"#content",initialize:function(e){i.util.appLoading(!0);var n=this;this.options=e||{},_.bindAll(this,"render","renderPages"),this.collection=new y;var r=this.collection.url().replace("/api/",""),s=i.router.getUrl();s.indexOf("?")<0?i.router.navigate(r,{replace:!0}):s!=r&&i.router.navigate(r,{trigger:!1,pushState:!0}),this.headerToolbarView=l,this.toolBarData={title:m["\uacf5\ubb38 \ubb38\uc11c\ud568"],isList:!0,isSideMenu:!0,isHome:!0,isSearch:!0,isWriteBtn:!0,writeBtnCallback:function(){var e={title:m["\uc591\uc2dd\uc120\ud0dd"],isClose:!0,closeCallback:function(){n.headerToolbarView.render(n.toolBarData),n.documentAction.release(),n.onScrollEvent(),n.$el.find("#document_action").hide(),n.$el.find("#document_todo").show()}};n.documentAction=new c({toolBarData:e}),n.documentAction.release(),n.offScrollEvent(),n.$el.find("#document_todo").hide(),n.$el.find("#document_action").show(),n.assign(n.documentAction,"#document_action")}};var o={listFunc:t.proxy(function(e){this.renderList(e)},this),emptyListFunc:t.proxy(function(){this.$el.find("ul.list_box").append(h({lang:{doclist_empty:v["\ubb38\uc11c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."]}}))},this)};this.setRenderListFunc(o);var u={};this.setFetchInfo(u,this.collection)},assign:function(e,t){e.setElement(this.$(t)).render()},renderPages:function(){this.$el.find("div.paging br_no").remove()},render:function(){s(this.fetchConfig.call(this)).then(_.bind(function(){this.$el.html(p({ulWrapperId:"document_todo",documentAction:!0})),this.headerToolbarView.render(this.toolBarData),this.dataFetch().done(t.proxy(function(e){e.length===0?this.renderListFunc.emptyListFunc():(this.renderListFunc.listFunc(e),this.scrollToEl())},this)),i.util.appLoading(!1)},this)).then(_.bind(this.fetchCollection,this)).otherwise(function(t){console.log(t.stack)}),setTimeout(function(){i.util.pageDone()},500)},fetchConfig:function(){var e=this,t=s.defer();return this.configModel=new g,this.useOfficialConfirm=!0,this.configModel.fetch({success:function(n){e.useOfficialConfirm=n.get("useOfficialConfirm"),t.resolve()},error:t.reject}),t.promise},fetchCollection:function(){var e=s.defer();return this.collection.fetch({success:function(){e.resolve()},error:e.reject}),e.promise},renderList:function(e){var t=this,n="officialDoc",r=this.useOfficialConfirm;e.each(function(e){var i=new f({model:e,listType:n,useDocStatus:!1,useOfficialConfirm:r});t.$el.find("ul.list_box").append(i.render().el)})}},{__instance__:null,create:function(){return this.__instance__=new this.prototype.constructor({el:t("#content")}),this.__instance__},render:function(){var e=this.create(),t=arguments.length>0?Array.prototype.slice.call(arguments):[];return this.prototype.render.apply(e,t)}});return b})}).call(this);