(function(){define(["jquery","backbone","app","hogan","i18n!report/nls/report","views/profile_card","report/views/report_title","report/collections/report_search","hgn!report/templates/search_result","hgn!report/templates/search_result_item","i18n!nls/commons","jquery.go-sdk"],function(e,t,n,r,i,s,o,u,a,f,l){var c={search_result:l["\uac80\uc0c9\uacb0\uacfc"],all:l["\uc804\uccb4"],location:l["\uc704\uce58"],content:l["\ubcf8\ubb38 \ub0b4\uc6a9"],comment:l["\ub313\uae00 \ub0b4\uc6a9"],attach_name:l["\ucca8\ubd80\ud30c\uc77c \uba85"],attach_content:l["\ucca8\ubd80\ud30c\uc77c \ub0b4\uc6a9"],writer:l["\uc791\uc131\uc790"],term:l["\uae30\uac04"],search:l["\uac80\uc0c9\uc5b4"],no_search_result:l["\ud574\ub2f9 \uac80\uc0c9 \uacb0\uacfc\uac00 \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."],more:l["\ub354\ubcf4\uae30"],detail_show:l["\uc790\uc138\ud788 \ubcf4\uae30"],all_term:l["\uc804\uccb4"]+l["\uae30\uac04"]},h=t.View.extend({el:"#content",events:{"click ul.article_list li.classic":"moveReport","click ul.article_list li.classic span.photo":"viewProfileCard","click ul.article_list li.classic div.info a.name":"viewProfileCard","click #searchMoreButton":"listMore"},initialize:function(){this.$el.off(),this.searchParams=""},render:function(){n.EventEmitter.trigger("common","layout:setOverlay",!0);var t=this;return this.searchParams=n.router.getSearch(),e(window).unbind("scroll.report"),e(window).bind("scroll.report",function(n){d_height=e(document).height(),w_height=e(window).height(),s_height=d_height-w_height,d_top=e(document).scrollTop(),s_height-d_top<2&&t.$el.find("div.bottom_action").is(":visible")&&t.listMore()}),this.searchParams.page="0",this.searchParamsoffset="15",this.collection=u.searchCollection(this.searchParams),this.$el.html(a({searchParam:e.extend({},this.searchParams,{isDetail:this.searchParams.stype=="detail"?!0:!1,keyword:this.searchParams.keyword==undefined?c.all:this.searchParams.keyword,folder:this.searchParams.folderNames==undefined?c.all:this.searchParams.folderNames.split("%2c").join(",&nbsp&nbsp"),content:this.searchParams.content==""?c.all:this.searchParams.content,comment:this.searchParams.comment==""?c.all:this.searchParams.comment,attachFileNames:this.searchParams.attachFileNames==""?c.all:this.searchParams.attachFileNames,attachFileContents:this.searchParams.attachFileContents==""?c.all:this.searchParams.attachFileContents,reporter:this.searchParams.reporterName==""?c.all:this.searchParams.reporterName,fromDate:n.util.shortDate(this.searchParams.fromDate),toDate:n.util.shortDate(this.searchParams.toDate),isAllTerm:n.util.shortDate(this.searchParams.fromDate)=="1970-01-01"}),data:this.collection.toJSON(),isEmpty:this.collection.length==0?!0:!1,lang:c})),this.listRender(),o.create({text:c.search_result,num_section:n.i18n(l["\ucd1d\uac74\uc218"],{num:this.collection.page?this.collection.page.total:0})}),e.goPopup.close(),this.moreBtnHide(),this},listRender:function(){var t=[];this.collection.each(function(r,i){var s=f({data:e.extend({},r.toJSON(),{submittedAt:n.util.basicDate3(r.get("submittedAt"))}),lang:c});t.push(s)}),e("#reportResult").append(t)},listMore:function(){this.searchParams.page=this.collection.page.page+1,this.collection=u.searchCollection(this.searchParams),this.listRender(),this.moreBtnHide()},viewProfileCard:function(t){var n=e(t.currentTarget),r=n.parents("li.classic"),i=r.data("user-id");s.render(i,t.currentTarget),t.stopPropagation()},moveReport:function(t){var r=e(t.target),i=r.parents("li.classic"),s=parseInt(i.attr("data-report-id")),o=parseInt(i.attr("data-series-id")),u=parseInt(i.attr("data-folder-id")),a=parseInt(i.attr("data-folder-type")),f="";a=="PERIODIC"?f="report/series/"+o+"/report/"+s:f="report/folder/"+u+"/report/"+s,n.router.navigate(f,{trigger:!0})},showProfileCard:function(t){var n=e(t.currentTarget).attr("data-userid");s.render(n,t.currentTarget),t.stopPropagation()},moreBtnHide:function(){if(this.collection.length==0){e("#searchMoreButton").hide();return}var t=this.collection.page.lastPage;t?e("#searchMoreButton").hide():e("#searchMoreButton").show()}});return h})}).call(this);