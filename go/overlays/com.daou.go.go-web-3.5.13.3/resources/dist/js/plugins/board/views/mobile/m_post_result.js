(function(){define(["jquery","backbone","app","i18n!board/nls/board","views/mobile/header_toolbar","board/collections/post_search","hgn!board/templates/mobile/m_post_more_result","hgn!board/templates/mobile/m_board_list_item","i18n!nls/commons","jquery.go-sdk","GO.util"],function(e,t,n,r,i,s,o,u,a){var f={search_result:a["\uac80\uc0c9\uacb0\uacfc"],post_write:r["\uae00\uc4f0\uae30"]},l=t.View.extend({initialize:function(){this.headerToolbarView=i,this.collection=null,this.offset=GO.config("mobileListOffset")||20,this.$listEl=null},unbindEvent:function(){this.$el.off("vclick")},bindEvent:function(){this.$el.on("vclick","ul.list_normal > li",e.proxy(this.viewDetailLi,this)),this.$el.on("vclick",'a[data-btn="paging"]',e.proxy(this.goPaging,this))},goPaging:function(t){GO.EventEmitter.trigger("common","layout:scrollToTop",this),t.stopPropagation();var n=e(t.currentTarget).attr("data-direction"),r=this.collection.page.page||0;n=="prev"&&r>0?r--:n=="next"&&r++,e(t.currentTarget).parents(".paging").remove(),this.$listEl.empty();var i={page:r,offset:this.offset,stype:this.stype,keyword:this.keyword,fromDate:this.fromDate,toDate:this.toDate};this.collection.fetch({async:!1,data:i,reset:!0});var s=this.makeTemplete({data:this.collection,searchData:i,type:"more"});this.$listEl.html(s);var o=GO.util.mPaging(this.collection);return this.$listEl.after(o),!1},viewDetailLi:function(t){var n=e(t.currentTarget);this.moveBoardAction(n)},moveBoard:function(t){var n=e(t.currentTarget).parents("li").first();this.moveBoardAction(n)},moveBoardAction:function(t){var i=t.attr("data-boardType"),s=t.attr("data-boardId"),o=t.attr("data-postId");if(!i||!s||!o)return;if(t.attr("data-hidden")=="true"){GO.util.delayAlert(r["\uc5f4\ub78c\uad8c\ud55c\uc774 \uc5c6\ub294 \uac8c\uc2dc\ubb3c\uc785\ub2c8\ub2e4."]);return}e.go(GO.contextRoot+"api/board/"+s+"/master","",{qryType:"GET",contentType:"application/json",responseFn:function(e){var t=0;e.data.ownerType=="Community"&&(t=e.data.ownerId);var r="board/"+s+"/post/"+o;t&&(r="community/"+t+"/"+r),i=="STREAM"&&(r+="/stream"),n.router.navigate(r,!0)}})},makeTemplete:function(e){var t=e.data,n=e.searchData,i=e.boardName,s=e.searchType,u=e.type,f=function(e){return GO.util.snsDate(this.createdAt)},l=function(){var e="def";return GO.util.fileExtentionCheck(this.fileExt)&&(e=this.fileExt),e},c=function(){return s=="detail"?!0:!1},h=function(){if(this.hiddenPost)return r["\uc5f4\ub78c\uad8c\ud55c\uc774 \uc5c6\ub294 \uac8c\uc2dc\ubb3c\uc785\ub2c8\ub2e4."];var e=this.content;return e=e.replace(/<br \/>/gi,""),e},p=function(){var e=this.boardType;return e=="STREAM"?!0:!1},d={keyword:a["\uac80\uc0c9\uc5b4"],non_result:a["\uac80\uc0c9\uacb0\uacfc\uc5c6\uc74c"]},v=o({dataset:t.toJSON(),dateParse:f,checkFileType:l,searchData:n,boardName:i,parseFromDate:GO.util.shortDate(n.fromDate),parseToDate:GO.util.shortDate(n.toDate),isDetaiSearch:c,resultContentParse:h,isStream:p,lang:d});return v},render:function(){this.unbindEvent(),this.bindEvent(),GO.util.appLoading(!0),this.headerToolbarView.render({isClose:!0,title:a["\uac80\uc0c9\uacb0\uacfc"],isWriteBtn:!0,writeBtnCallback:function(){GO.util.appLoading(!0),n.router.navigate("board/post/write",{trigger:!0})}});var e=this,t=n.router.getSearch();window.MsearchParam&&(t=GO.util.getSearchParam(window.MsearchParam));var r={stype:t.stype,keyword:t.keyword,fromDate:t.fromDate,toDate:t.toDate,page:GO.router.getSearch("page")||0,offset:this.offset};this.$el.html(u({otherClass:"list_search"})),this.$listEl=this.$el.find("ul.list_normal"),this.collection=s.searchCollection(r,t.isCommunity,!0);var i=this.collection,o=r,f=t.boardName,l=t.searchType,c=t.isCommunity=="true"?!0:!1;this.stype=t.stype,this.title=t.title||"",this.content=t.content||"",this.comments=t.comments||"",this.attachFileNames=t.attachFileNames||"",this.userName=t.userName||"",this.boardIds=t.boardIds||"",this.keyword=t.keyword||"",this.fromDate=t.fromDate,this.toDate=t.toDate,this.$listEl.html(this.makeTemplete({data:i,searchData:o,boardName:f,searchType:l,type:"end"}));var h=GO.util.mPaging(this.collection);this.$listEl.after(h),GO.util.appLoading(!1)}});return{render:function(e){var t=new l({el:"#content"});return t.render()}}})}).call(this);