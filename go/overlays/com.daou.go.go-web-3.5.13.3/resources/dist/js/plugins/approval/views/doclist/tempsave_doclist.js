define(["jquery","underscore","backbone","app","when","approval/views/content_top","views/pagination","views/pagesize","approval/views/doclist/doclist_item","approval/views/doclist/base_doclist","approval/views/doclist/doclist_csv_download","approval/models/doclist_item","approval/collections/tempsave_doclist","hgn!approval/templates/doclist_empty","hgn!approval/templates/tempsave_doclist","i18n!nls/commons","i18n!approval/nls/approval","jquery.placeholder"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m){var g=f.extend({el:"#content",columns:{"\uc0dd\uc131\uc77c":m["\uc0dd\uc131\uc77c"],"\uacb0\uc7ac\uc591\uc2dd":m["\uacb0\uc7ac\uc591\uc2dd"],"\uae34\uae09":m["\uae34\uae09"],"\uc81c\ubaa9":v["\uc81c\ubaa9"],"\ucca8\ubd80":m["\ucca8\ubd80"],"\uacb0\uc7ac\uc0c1\ud0dc":m["\uacb0\uc7ac\uc0c1\ud0dc"],count:6},docFieldModel:null,docFolderType:"user_temp",initialize:function(e){this.options=e||{},t.bindAll(this,"render","renderPageSize","renderPages"),this.contentTop=s.getInstance(),this.type=this.options.type,this.options.type.indexOf("?")>=0&&(this.type=this.options.type.substr(0,this.options.type.indexOf("?"))),this.collection=new h,this.collection.setType(this.type),this.initProperty="updatedAt",this.initDirection="desc",this.ckeyword="";var n=sessionStorage.getItem("list-history-baseUrl"),r=new RegExp("(#)?approval/doclist/tempsave/"+this.type+"$");n&&r.test(n)?(this.initProperty=sessionStorage.getItem("list-history-property"),this.initDirection=sessionStorage.getItem("list-history-direction"),this.initSearchtype=sessionStorage.getItem("list-history-searchtype"),this.ckeyword=sessionStorage.getItem("list-history-keyword").replace(/\+/gi," "),this.collection.setListParam()):this.collection.setSort(this.initProperty,this.initDirection),sessionStorage.clear(),this.checkboxColumn={id:"checkedAllDeptDoc",name:"checkedAllDeptDoc"},this.collection.bind("reset",this.resetList,this),f.prototype.initialize.call(this,e)},events:{"click a#deletedoc":"remove","click input:checkbox":"renderPages","click .sorting":"sort","click .sorting_desc":"sort","click .sorting_asc":"sort","click .btn_search2":"search","keypress input#keyword":"searchByEnter","click input:checkbox":"toggleCheckbox"},renderLayout:function(){var t={"\ubb38\uc11c \uc0ad\uc81c":m["\ubb38\uc11c \uc0ad\uc81c"],"\uc120\ud0dd":v["\uc120\ud0dd"],"\uc804\uccb4":m["\uc804\uccb4"],"\uc9c4\ud589":m["\uc9c4\ud589"],"\uc644\ub8cc":m["\uc644\ub8cc"],"\ubc18\ub824":m["\ubc18\ub824"],"\uc784\uc2dc\uc800\uc7a5":m["\uc784\uc2dc\uc800\uc7a5"],"\uc81c\ubaa9":v["\uc81c\ubaa9"],"\uc0dd\uc131\uc77c":m["\uc0dd\uc131\uc77c"],"\uae30\uc548\uc790":m["\uae30\uc548\uc790"],"\uacb0\uc7ac\uc120":m["\uacb0\uc7ac\uc120"],"\ubb38\uc11c\ubc88\ud638":m["\ubb38\uc11c\ubc88\ud638"],"\uac80\uc0c9":v["\uac80\uc0c9"],"\uacb0\uc7ac\uc591\uc2dd":m["\uacb0\uc7ac\uc591\uc2dd"],"\uae30\uc548\ubd80\uc11c":m["\uae30\uc548\ubd80\uc11c"],placeholder_search:v["\ud50c\ub808\uc774\uc2a4\ud640\ub354\uac80\uc0c9"]};this.$el.html(d({lang:t})),this.type.indexOf("?")>=0&&(this.type=this.type.substr(0,this.type.indexOf("?"))),e("#tab_"+this.type).addClass("on"),this.contentTop.setTitle(m["\uc784\uc2dc \uc800\uc7a5\ud568"]),this.contentTop.render(),this.$el.find("header.content_top").replaceWith(this.contentTop.el),this.$el.find("input[placeholder]").placeholder(),this.renderPageSize(),(new l({getDownloadURL:e.proxy(this.collection.getCsvURL,this.collection),appendTarget:this.$el.find("#docToolbar > div.critical#csvDownLoad")})).render()},remove:function(){var t=e("input.doclist_item_checkbox:checked"),n=this,i=[];t.each(function(){i.push(e(this).attr("data-id"))});if(t.length<1){e.goAlert(m["\uc120\ud0dd\ub41c \ud56d\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]);return}var n=this;e.goCaution(m["\ubb38\uc11c\ud568 \uc0ad\uc81c \uacbd\uace0 \ub0b4\uc6a9"],"",function(){var t=[r.config("contextRoot")+"api/approval/document/delete"];e.ajax({url:t,data:JSON.stringify({ids:i}),type:"delete",async:!0,dataType:"json",contentType:"application/json",success:function(){n.collection.fetch(),e.goMessage(m["\uc120\ud0dd\ud55c \ud56d\ubaa9\uc774 \uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4"])}})})},toggleCheckbox:function(t){var n=e(t.currentTarget),r=e("input#checkedAllDeptDoc"),i=n.is(":checked");n.attr("id")==r.attr("id")&&e('input[type="checkbox"][name="checkbox"]').attr("checked",i),n.hasClass("doclist_item_checkbox")&&(i||r.attr("checked",i))},renderPageSize:function(){this.pageSizeView=new u({pageSize:this.collection.pageSize}),this.pageSizeView.render(),this.pageSizeView.bind("changePageSize",this.selectPageSize,this)},renderPages:function(){this.pageView=new o({pageInfo:this.collection.pageInfo()}),this.pageView.bind("paging",this.selectPage,this),this.$el.find("div.tool_absolute > div.dataTables_paginate").remove(),this.$el.find("div.tool_absolute").append(this.pageView.render().el)},resetList:function(t){var n=this.collection.url().replace("/api/",""),i=r.router.getUrl().replace("#","");i.indexOf("?")<0?r.router.navigate(n,{replace:!0}):i!=n&&r.router.navigate(n,{trigger:!1,pushState:!0}),e(".list_approval > tbody").empty();var s=this.columns,o="approval";t.each(function(t){var n=new a({model:t,isCheckboxVisible:!0,listType:o,columns:s});e(".list_approval > tbody").append(n.render().el)}),t.length==0&&e(".list_approval > tbody").html(p({columns:this.columns,lang:{doclist_empty:m["\ubb38\uc11c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."]}})),this.renderPages()},selectPage:function(e){this.collection.setPageNo(e),this.collection.fetch()},selectPageSize:function(e){this.collection.setPageSize(e),this.collection.fetch()},sort:function(t){var n="#"+e(t.currentTarget).attr("id"),r=e(n).attr("sort-id"),i="desc",s="",o="";e(n).hasClass("sorting")&&(s="sorting",o="sorting_desc"),e(n).hasClass("sorting_desc")&&(s="sorting_desc",o="sorting_asc",i="asc"),e(n).hasClass("sorting_asc")&&(s="sorting_asc",o="sorting_desc"),e(n).removeClass(s).addClass(o);var u=this.$el.find("th");u.each(function(){!e(this).hasClass("sorting_disabled")&&"#"+e(this).attr("id")!=n&&(e(this).removeClass("sorting").addClass("sorting"),e(this).removeClass("sorting_desc").addClass("sorting"),e(this).removeClass("sorting_asc").addClass("sorting"))}),this.collection.setSort(r,i),this.collection.fetch()},search:function(){var t=e("#searchtype").val(),n=e.trim(e("#keyword").val());e("input#keyword").attr("placeholder")===this.$el.find("input#keyword").val()&&(n="");if(!n)return e.goMessage(m["\uac80\uc0c9\uc5b4\ub97c \uc785\ub825\ud558\uc138\uc694."]),e("#keyword").focus(),!1;if(!e.goValidation.isCheckLength(2,64,n))return e.goMessage(r.i18n(m["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"2",arg2:"64"})),e("#keyword").focus(),!1;this.collection.setSearch(t,n),this.collection.fetch()},searchByEnter:function(t){if(t.keyCode!=13)return;t&&t.preventDefault(),e(t.currentTarget).focusout().blur(),this.search()},release:function(){this.$el.off(),this.$el.empty()}});return g});