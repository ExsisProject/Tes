(function(){define(["jquery","backbone","app","hgn!approval/templates/document/comment_reply","i18n!nls/commons","i18n!approval/nls/approval","file_upload","GO.util"],function(e,t,n,r,i,s,o){var u={"0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4.":s["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],"\ub313\uae00 \uc791\uc131":s["\ub313\uae00 \uc791\uc131"],"\ub4f1\ub85d":i["\ub4f1\ub85d"],commentPlaceholder:i["\ub313\uae00\uc744 \ub0a8\uaca8\ubcf4\uc138\uc694"]},a=null,f={},l=t.View.extend({initialize:function(e){this.options=e||{},this.el=this.options.el,this.docId=this.options.docId,this.commentId=this.options.commentId,this.collection=this.options.collection,this.totalAttachSize=0,this.totalAttachCount=0,e.emoticonView&&(f=e.emoticonView)},events:{"click .comment_reply_save":"saveReply","click div.wrap_attach span.ic_del":"commentAttachDelete","click #emoticonBtn":"toggleEmoticonGroup","click [data-emoticon-delete-btn]":"deleteEmoticon"},render:function(){var e=GO.session();this.$el.html(r({writer:e,"\ub313\uae00 \uc791\uc131":s["\ub313\uae00 \uc791\uc131"],docId:this.docId,commentId:this.commentId,lang:u})),this.$el.find("input").focus(),this.initCommentReplyUpload(this.docId,this.commentId)},saveReply:function(t){var r=this,i=this.$el.find("textarea");if(!e.goValidation.isCheckLength(2,1e3,e.trim(i.val()))||!i.val()){i.focus(),e.goMessage(n.i18n(u["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"2",arg2:"1000"}));return}if(i.val()){var s=[],o=e("#commentAttachPart_"+this.docId+"_"+this.commentId).find("li:not(.attachError)");o.each(function(){s.push({path:e(this).attr("data-tmpname"),name:e(this).attr("data-name")})});var a=f.getSelectedEmoticonImgSrc(e(t.currentTarget)),l=[GO.contextRoot+"api/approval/document",this.docId,"replycomment"].join("/");e.go(l,JSON.stringify({thread:this.commentId,docId:this.docId,message:GO.util.unescapeHtml(i.val()),attaches:s,emoticonPath:a}),{contentType:"application/json",responseFn:function(e){e.code=="200"&&r.collection.fetch({async:!1,reset:!0})}})}else i.focus()},commentAttachDelete:function(t){e(t.target).parents("li").first().remove()},toggleEmoticonGroup:function(t){console.info("toggleEmoticonGroup"),t.preventDefault(),t.stopPropagation();if(f.hasAttaches(e(t.currentTarget)))return!1;f.renderEmoticonGroup(e(t.currentTarget))},deleteEmoticon:function(t){var n=e(t.currentTarget).parent();n.empty(),n.removeClass()},initCommentReplyUpload:function(t,n){var r=this,s={el:"#commentReplyAttach_"+t+"_"+n,context_root:GO.contextRoot,button_text:"",button_width:36,button_height:26,url:"api/file?GOSSOcookie="+e.cookie("GOSSOcookie"),mode:"COMMENT",progressBarUse:!0,progressEl:"#progress_"+t+"_"+n},u=parseInt(GO.config("commonAttachConfig").maxAttachSize),a=u*1024*1024,f=parseInt(GO.config("commonAttachConfig").maxAttachNumber),l=GO.session().brandName=="DO_SAAS";(new o(s)).queue(function(e,t){}).start(function(s,o){if(e(s.currentTarget).parents("[data-func-wrapper]").siblings("[data-emoticon-edit-part]").find("img").length>0)return e.goMessage(i["\uc120\ud0dd\ud55c \uc774\ubaa8\ud2f0\ucf58 \uc0ad\uc81c \ud6c4 \ud30c\uc77c\uc744 \ucca8\ubd80\ud574\uc8fc\uc138\uc694."]),!1;if(l){if(a<o.size)return e.goMessage(GO.i18n(i["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],"arg1",u)),!1;r.totalAttachSize+=o.size;var c=e("#commentAttachPart_"+t+"_"+n).find("li").length+r.totalAttachCount+1;if(f<c)return e.goMessage(GO.i18n(i["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],"arg1",f)),!1;r.totalAttachCount++}}).progress(function(e,t){}).success(function(i,s,o){var u="",a="";if(GO.util.fileUploadErrorCheck(s))u="<strong class='caution'>"+GO.util.serverMessage(s)+"</strong>",a="attachError";else if(GO.util.isFileSizeZero(s))return e.goAlert(GO.util.serverMessage(s)),!1;var f=s.data,l=f.filePath,c=f.fileName,h=f.fileExt,p=f.fileSize,d=GO.util.getHumanizedFileSize(p),v=f.thumbnail,m="",g=f.hostId;if(GO.util.isImage(h))m='<li class="'+a+'" data-tmpname="'+l+'" data-name="'+c+'" data-hostid="'+g+'" data-size="'+p+'">'+'<span class="item_image">'+'<span class="thumb">'+'<img src="'+v+'" alt="'+c+'" />'+"</span>"+'<span class="btn_wrap">'+'<span class="ic_classic ic_del" title="\uc0ad\uc81c" data-docId='+t+"></span>"+"</span>"+"</span>"+"</li>",e("#commentAttachPart_"+t+"_"+n).find("ul.img_wrap").length==0&&e("#commentAttachPart_"+t+"_"+n).append('<ul class="img_wrap"></ul>'),e("#commentAttachPart_"+t+"_"+n).find("ul.img_wrap").append(m);else{var y="def";GO.util.fileExtentionCheck(h)&&(y=h),m='<li class="'+a+'" data-tmpname="'+l+'" data-name="'+c+'" data-hostid="'+g+'" data-size="'+p+'">'+'<span class="item_file">'+'<span class="ic_file ic_'+y+'"></span>'+'<span class="name">'+c+"</span>"+'<span class="size">('+d+")</span>"+'<span class="btn_wrap" title="\uc0ad\uc81c">'+'<span class="ic_classic ic_del" data-docId='+t+"></span>"+"</span>"+u+"</span>"+"</li>",e("#commentAttachPart_"+t+"_"+n).find("ul.file_wrap").length==0&&e("#commentAttachPart_"+t+"_"+n).append('<ul class="file_wrap"></ul>'),e("#commentAttachPart_"+t+"_"+n).find("ul.file_wrap").append(m)}r.resetAttachSizeAndCount()}).complete(function(e,t){}).error(function(t,n){n.jqXHR&&(n.jqXHR.statusText=="abort"?e.goAlert(i["\ucde8\uc18c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]):e.goAlert(i["\uc5c5\ub85c\ub4dc\uc5d0 \uc2e4\ud328\ud558\uc600\uc2b5\ub2c8\ub2e4."]),r.resetAttachSizeAndCount())})},getViewedTotalAttachSize:function(t){var n=0;return e(t).find("li").each(function(){n+=parseInt(this.getAttribute("data-size"),0)}),n},resetAttachSizeAndCount:function(){this.isSaaS&&(this.totalAttachSize=0,this.totalAttachCount=0)}});return{render:function(e){return a=new l(e),a.render()},close:function(t){e(t).remove()}}})}).call(this);