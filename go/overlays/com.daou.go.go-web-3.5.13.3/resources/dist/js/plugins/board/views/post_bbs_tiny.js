(function(){define(["jquery","backbone","app","hgn!board/templates/post_bbs_tiny","i18n!board/nls/board","i18n!nls/commons","jquery.go-popup","GO.util"],function(e,t,n,r,i,s){var o=null,u={num:i["\ubc88\ud638"],title:s["\uc81c\ubaa9"],writer:i["\uc791\uc131\uc790"],created_at:i["\uc791\uc131\uc77c"],read_count:i["\uc870\ud68c"],recommend_count:i["\uc88b\uc544\uc694"],post_reply:i["\ub2f5\uae00"],prev:s["\uc704"],next:s["\uc544\ub798"],new_post:i["\uc0c8\uae00"],post_status_close:s["\ube44\uacf5\uac1c"],post_hidden_msg:i["\uc5f4\ub78c\uad8c\ud55c\uc774 \uc5c6\ub294 \uac8c\uc2dc\ubb3c\uc785\ub2c8\ub2e4."],post_orphan_msg:i["\uc6d0\uae00\uc774 \uc0ad\uc81c\ub41c \ub2f5\uae00"],post_last_msg:i["\ub9c8\uc9c0\ub9c9 \uac8c\uc2dc\ubb3c\uc785\ub2c8\ub2e4."],post_move_impossible:i["\uc774\ub3d9\ud558\uc2e4 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."]},a=t.View.extend({el:"#content #postBbsList",manage:!1,initialize:function(e){this.options=e||{},this.boardId=this.options.boardId,this.postId=this.options.postId,this.listParams=this.options.listParams,this.masterOwner=this.options.masterOwner,this.data=this.getData(),this.stickable=this.options.stickable!=0?!0:!1},events:{"click a.boardTitle":"showPostDetail"},render:function(){var t=this;this.data&&this.data.length&&(this.$el.html(r({lang:u,dataset:this.data,boardId:this.boardId,postId:this.postId,postTitle:function(){return GO.util.textToHtml(this.title)},renderCreatedAt:function(){return GO.util.boardDate(this.createdAt)},isReply:function(){return!!this.depth},isClose:function(){return this.status==="CLOSE"},isHiddenPost:function(){return this.hiddenPost},isHiddenTitle:function(){return this.summary==" $$#HIDDEN_POST#$$ "},isActive:function(){return this.id==t.postId}})),this.stickable||e(".bbs_detail_tool","#postContents").prepend(this.$el.find(".tiny_tool").show()),e(".tiny_tool a",".bbs_detail_tool").click(function(n){if(t.$el.find("a[data-current=true]").length){var r=t.$el.find("a[data-current=true]").attr("data-id"),i=null,s=null,o=null,a=e(t.data).map(function(e,t){return t.id}).get();for(var f in a)if(a[f]==r){i=f;break}s=e(n.currentTarget).hasClass("prev")?--i:++i,o=t.data[s];if(o==undefined)return e.goAlert(u.post_last_msg,u.post_move_impossible),!1;if(o["status"]=="CLOSE"&&o["summary"]==" $$#HIDDEN_POST#$$ ")return e.goAlert(u.post_hidden_msg,u.post_move_impossible),!1;t.showPostDetail({currentTarget:t.$el.find('a.boardTitle[data-id="'+o.id+'"]')})}}))},getData:function(){if(this.listParams){var t=[],n=e.extend(this.listParams,{}),r=n.sortkey||"createdAt",i=n.sortdir||"desc";return n.sorts="sortCriteria desc,threadRootCode desc,threadCode asc",e.go(GO.contextRoot+"api/board/"+this.boardId+"/posts/"+this.postId+"/classic/tiny",n,{qryType:"GET",async:!1,contentType:"application/json",responseFn:function(e){e.code==200?t=e.data:t=!1}}),t}return},_serializeObj:function(e){var t=[];for(var n in e)t.push(encodeURIComponent(n)+"="+encodeURIComponent(e[n]));return t.join("&")},_isCommunity:function(){return this.masterOwner&&this.masterOwner.ownerType=="Community"?!0:!1},showPostDetail:function(t){var r="",s=e(t.currentTarget),o=s.attr("data-id");search=n.router.getSearch();if(e(t.currentTarget).data("hidden")){e.goMessage(i["\uac8c\uc2dc\uae00 \uc5f4\ub78c\ubd88\uac00 \uba54\uc138\uc9c0"]);return}this._isCommunity()?r+="community/"+this.masterOwner.ownerId+"/board/"+this.boardId+"/post/"+o:r+="board/"+this.boardId+"/post/"+o,r+="/?"+this._serializeObj(search),n.router.navigate(r,{trigger:!0})}});return{render:function(e){var t=new a(e);return t.render()}}})}).call(this);