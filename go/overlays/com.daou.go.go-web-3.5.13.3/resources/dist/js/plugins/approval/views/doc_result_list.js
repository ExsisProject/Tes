define(["jquery","underscore","backbone","app","approval/views/content_top","views/pagination","views/pagesize","approval/views/doclist/doclist_result_item","approval/models/doclist_item","collections/paginated_collection","hgn!approval/templates/doclist_search_null","hgn!approval/templates/doc_result_list","i18n!nls/commons","i18n!approval/nls/approval","i18n!board/nls/board"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d){var v=null,m=f.extend({model:a,url:function(){var t="/api/search/approval";this.type=="docfolder"&&(t="/api/search/docfolder");var n=e.param({stype:this.stype,type:this.type,keyword:this.keyword,fromDate:this.fromDate,toDate:this.toDate,page:this.pageNo,offset:this.pageSize});return this.stype=="detail"&&(n=e.param({stype:this.stype,type:this.type,keyword:this.keyword,fromDate:this.fromDate,toDate:this.toDate,title:this.title,docBody:this.docBody,attachFileNames:this.attachFileNames,attachFileContents:this.attachFileContents,formName:this.formName,searchTerm:this.searchTerm,drafterName:this.drafterName,drafterDeptName:this.drafterDeptName,activityUserNames:this.activityUserNames,docNum:this.docNum,dateType:this.dateType,page:this.pageNo,offset:this.pageSize,searchOption:this.searchOption})),t+"?"+n},fetch:function(n){typeof n!="undefined"||(n={});var r=this,i=n.beforeSend;t.isFunction(i)||(v=e.goPreloader(),v.render());var s=n.complete;return n.complete=function(e){v!=null&&v.release(),t.isFunction(s)&&s(r,e)},f.prototype.fetch.call(this,n)},setListParam:function(){var e=r.router.getSearch();this.stype=e.stype,this.searchTerm=e.searchTerm,this.keyword=e.keyword?e.keyword.replace(/\+/gi," "):"",this.title=e.title,this.docBody=e.docBody,this.attachFileNames=e.attachFileNames,this.attachFileContents=e.attachFileContents,this.formName=e.formName,this.drafterName=e.drafterName,this.drafterDeptName=e.drafterDeptName,this.activityUserNames=e.activityUserNames,this.docNum=e.docNum,this.fromDate=e.fromDate,this.toDate=e.toDate,this.type=e.type,this.dateType=e.dateType,this.pageNo=e.page?e.page:0,this.pageSize=e.offset?e.offset:20,this.searchOption=e.searchOption?e.searchOption:"OR",sessionStorage.clear()}}),g=n.View.extend({columns:{"\uae30\uc548\uc77c":p.\uae30\uc548\uc77c,"\uac80\uc0c9\uacb0\uc7ac\uc591\uc2dd":p.\uacb0\uc7ac\uc591\uc2dd,"\uac80\uc0c9\uc81c\ubaa9":h.\uc81c\ubaa9,"\ucca8\ubd80":p.\ucca8\ubd80,"\uac80\uc0c9\uae30\uc548\uc790":p.\uae30\uc548\uc790,"\uac80\uc0c9\ubb38\uc11c\ubc88\ud638":p.\ubb38\uc11c\ubc88\ud638,"\uacb0\uc7ac\uc0c1\ud0dc":p.\uacb0\uc7ac\uc0c1\ud0dc,"\uacb0\uc7ac\uc77c":p.\uacb0\uc7ac\uc77c,count:8},el:"#content",initialize:function(e){this.options=e||{},t.bindAll(this,"render","renderPageSize","renderPages"),this.contentTop=i.getInstance(),this.collection=new m,this.collection.setListParam(),this.collection.bind("reset",this.resetList,this),this.collection.fetch({statusCode:{403:function(){r.util.error("403")},404:function(){r.util.error("404",{msgCode:"400-common"})},500:function(){r.util.error("500")}}})},events:{},render:function(){var e={"\uc804\uc790\uacb0\uc81c \uc0c1\uc138 \uac80\uc0c9":p["\uc804\uc790\uacb0\uc81c \uc0c1\uc138 \uac80\uc0c9"],"\uc804\uc0ac \ubb38\uc11c\ud568 \uc0c1\uc138 \uac80\uc0c9":p["\uc804\uc0ac \ubb38\uc11c\ud568 \uc0c1\uc138 \uac80\uc0c9"],"\ub300\uc0c1 \ubb38\uc11c\ud568":p["\ub300\uc0c1 \ubb38\uc11c\ud568"],"\uac80\uc0c9 \uae30\uac04":p["\uac80\uc0c9 \uae30\uac04"],"\uae30\uc548\uc77c":p["\uae30\uc548\uc77c"],"\uae30\uc548\uc790":p["\uae30\uc548\uc790"],"\uacb0\uc7ac\uc120":p["\uacb0\uc7ac\uc120"],"\uac80\uc0c9\ubb38\uc11c\ubc88\ud638":p["\ubb38\uc11c\ubc88\ud638"],"\uc644\ub8cc\uc77c":p["\uc644\ub8cc\uc77c"],"\uc624\ub298":h["\uc624\ub298"],"\uc77c":p["\uc77c"],"\uc8fc\uc77c":p["\uc8fc\uc77c"],"\uac1c\uc6d4":p["\uac1c\uc6d4"],"\ub144":p["\ub144"],"\uc9c1\uc811\uc120\ud0dd":p["\uc9c1\uc811\uc120\ud0dd"],"\uc591\uc2dd\uc744 \uc120\ud0dd\ud558\uc138\uc694":p["\uc591\uc2dd\uc744 \uc120\ud0dd\ud558\uc138\uc694"],"\uc791\uc131\uc790":h["\uc791\uc131\uc790"],"\uac80\uc0c9\uc5b4":h["\uac80\uc0c9\uc5b4"],"\uc591\uc2dd\uc81c\ubaa9":p["\uc591\uc2dd\uc81c\ubaa9"],"\uc81c\ubaa9":h["\uc81c\ubaa9"],"\ub0b4\uc6a9":h["\ub0b4\uc6a9"],"\ucca8\ubd80\ud30c\uc77c\uba85":p["\ucca8\ubd80\ud30c\uc77c\uba85"],"\ucca8\ubd80\ud30c\uc77c\ub0b4\uc6a9":h["\ucca8\ubd80\ud30c\uc77c \ub0b4\uc6a9"],"\uac80\uc0c9":h["\uac80\uc0c9"],"\uc804\uccb4\uae30\uac04":d["\uc804\uccb4\uae30\uac04"],"\ud574\ub2f9 \uac80\uc0c9 \uacb0\uacfc\uac00 \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.":h["\ud574\ub2f9 \uac80\uc0c9 \uacb0\uacfc\uac00 \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."]},t=null,n=null,i=this.collection.formName||h["\uc804\uccb4"],s=this.collection.drafterName||h["\uc804\uccb4"],o=this.collection.drafterDeptName||h["\uc804\uccb4"],u=this.collection.activityUserNames||h["\uc804\uccb4"],a=this.collection.docNum||h["\uc804\uccb4"],f=this.collection.searchTerm=="all"?!0:!1,l=this.collection.title||!1,v=this.collection.docBody||!1,m=this.collection.attachFileNames||!1,g=this.collection.attachFileContents||!1,y=!1;!l&&!v&&!m&&!g&&(y=h["\uc804\uccb4"]);var b=function(e){return e=="detail"?!0:!1};this.collection.dateType=="draftedAt"?n=p["\uae30\uc548\uc77c"]:this.collection.dateType=="completedAt"&&(n=p["\uc644\ub8cc\uc77c"]),this.collection.stype=="simple"?t={type:this.collection.type,keyword:this.collection.keyword,isDetailSearch:b(this.collection.stype)}:this.collection.stype=="detail"&&(t={type:this.collection.type,formName:i,drafterName:s,drafterDeptName:o,activityUserNames:u,docNum:a,typeName:n,title:l,isAllSearch:f,docBody:v,attachFileNames:m,attachFileContents:g,keyword:y,fromDate:r.util.shortDate(this.collection.fromDate),toDate:r.util.shortDate(this.collection.toDate),isDetailSearch:b(this.collection.stype),stype:this.collection.stype}),this.$el.html(c({lang:e,searchData:t,isDetailSearch:b(this.collection.stype),columns:this.columns}));var w=this.collection.total;this.setTitle(w),this.contentTop.render(),this.$el.find("header.content_top").replaceWith(this.contentTop.el),this.renderPageSize()},setTitle:function(e){this.contentTop.setTitle('<span class="txt">'+p["\uac80\uc0c9 \uacb0\uacfc"]+'</span><span class="num"> '+r.i18n(h["\ucd1d\uac74\uc218"],{num:e})+"</span>")},renderPageSize:function(){this.pageSizeView=new o({pageSize:this.collection.pageSize}),this.pageSizeView.render(),this.pageSizeView.bind("changePageSize",this.selectPageSize,this)},renderPages:function(){this.pageView=new s({pageInfo:this.collection.pageInfo()}),this.pageView.bind("paging",this.selectPage,this),this.$el.find("div.tool_absolute > div.dataTables_paginate").remove(),this.$el.find("div.tool_absolute").append(this.pageView.render().el)},resetList:function(t){var n=this.collection.type,i=this.collection.url().replace("/api/search/approval","approval/search");n=="docfolder"&&(i=this.collection.url().replace("/api/search/docfolder","docfolder/search"));var s=r.router.getUrl();s.indexOf("?")<0?r.router.navigate(i,{pushState:!0,replace:!0}):s!=i&&r.router.navigate(i,{trigger:!1,pushState:!0,replace:!0}),e(".list_approval > tbody").empty();var o=this.columns;t.each(function(t){var r=new u({model:t,listType:n,columns:o});e(".list_approval > tbody").append(r.render().el)}),t.length==0&&e(".list_approval > tbody").html(l({columns:this.columns,lang:{doclist_empty:h["\ud574\ub2f9 \uac80\uc0c9 \uacb0\uacfc\uac00 \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."]}}));var a=this.collection.total;this.setTitle(a),this.renderPages()},selectPage:function(e){this.collection.setPageNo(e),this.collection.fetch()},selectPageSize:function(e){this.collection.setPageSize(e),this.collection.fetch()},release:function(){this.$el.off(),this.$el.empty()}});return g});