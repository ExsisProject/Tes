(function(){define(["jquery","backbone","app","when","board/models/board_config","board/models/post_mail","i18n!nls/commons","i18n!board/nls/board","board/views/post_attaches","hgn!board/templates/post_stream_unit","board/collections/post_recommend","hgn!board/templates/stream_recommend_list","hgn!board/templates/post_recommend_list","views/profile_card","board/models/post_more_content","board/models/post","hgn!board/templates/board_youtube_video","file_upload","comment","email_send_layer","lottie","swfupload","swfupload.plugin","jquery.fancybox-buttons","jquery.fancybox-thumbs","jquery.fancybox","jquery.go-validation","jquery.placeholder","GO.util","go-fancybox","jquery.go-grid"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b,w){var E={ok:o["\ud655\uc778"],portrait:u["\ucd08\uc0c1\ud654"],meta_img:u["\uba54\ud0c0\uc815\ubcf4 \uc774\ubbf8\uc9c0"],link_meta:u["\ub9c1\ud06c \uba54\ud0c0\uc815\ubcf4 \ud0c0\uc774\ud2c0"],save:o["\uc800\uc7a5"],preview:o["\ubbf8\ub9ac\ubcf4\uae30"],cancel:o["\ucde8\uc18c"],sample_img:u["\uc0d8\ud50c\uc774\ubbf8\uc9c0"],modify:o["\uc218\uc815"],del:o["\uc0ad\uc81c"],copy_url:o["URL \ubcf5\uc0ac"],comment:u["\uac1c\uc758 \ub367\uae00"],all_view:u["\ubaa8\ub450 \ubcf4\uae30"],comment_modify:u["\ub367\uae00 \uc218\uc815"],comment_delete:u["\ub367\uae00 \uc0ad\uc81c"],comment_save:u["\ub313\uae00 \uc791\uc131"],close:o["\ub2eb\uae30"],plus_list:u["Plus 1 \ud55c \uc0ac\ub78c\ub4e4"],more_view:u["\ub354 \ubcf4\uae30"],more_content:u["\ub354\ubcf4\uae30"],content_fold:o["\uc811\uae30"],no_content:u["\uc544\uc9c1 \ub4f1\ub85d\ub41c \uae00\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uae00\uc744 \ub4f1\ub85d\ud574 \uc8fc\uc138\uc694."],alert_exclude_extension:u["\ud655\uc7a5\uc790\uac00 \ub561\ub561\uc778 \uac83\ub4e4\uc740 \ucca8\ubd80 \ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],alert_max_attach_cnt:u["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],alert_max_attach_size:u["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],confirm_delete:u["\uac8c\uc2dc\uae00\uc744 \uc0ad\uc81c \ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],confirm_delete_message:u["\uc0ad\uc81c\ud655\uc778\uba54\uc138\uc9c0"],comment_placeholder:u["\ub313\uae00\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694."],alert_length:u["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],title_recommend:o["\uc88b\uc544\uc694 \ud558\uae30"],title_recommend_cancel:o["\uc88b\uc544\uc694 \ucde8\uc18c"],title_open:o["\ud3bc\uce58\uae30"],title_close:o["\uc811\uae30"],post_comment:u["\ub313\uae00"],count:u["\uac1c"],download:o["\ub2e4\uc6b4\ub85c\ub4dc"],send_mail:o["\uba54\uc77c\ubc1c\uc1a1"],user_count:o["\uba85"],plus_user:o["\uc88b\uc544\uc694 \ub204\ub978 \uc0ac\ub78c"],reomment_list_tab:u["\uc88b\uc544\uc694"],public_writer:u["\uc791\uc131\uc790 \uacf5\uac1c"]},S=function(){return r.promise.apply(this,arguments)},x=t.View.extend({tagName:"li",initialize:function(e){this.options=e||{},this.boardModel=e.boardModel||i.get(this.model.get("boardId"),!0),this.boardMaster=this.model.get("boardMasterOwner"),this.isDetail=e.isDetail||!1,this.commentFlag=this.boardModel.get("commentFlag"),this.recommendFlag=!1,this.isMoreComment=!1,this.commentViewFlag=!1,this.sendMailFlag=e.sendMailFlag||this.boardModel.get("sendMailFlag"),this.isCommunity=e.isCommunity,this.isSaaS=GO.session().brandName=="DO_SAAS",this.totalAttachSize=0,this.totalAttachCount=0,this.anonymFlag=this.boardModel.get("anonymFlag"),this.availableAnonymousWriterOptionInPostComment=this.boardModel.get("availableAnonymousWriterOptionInPostComment")},events:{"click div.article_wrap span.photo a":"showProfileCard","click span.recommendPrifile a":"showProfileCard",'click span[data-btntype="recommend"]':"postRecommend",'click span[data-btntype="recommendlist"]':"postRecommendListToggle",'click span[data-btntype="postmodify"]':"postModify",'click span[data-btntype="postdelete"]':"postDelete",'click span[data-btntype="postsendmail"]':"postSendMail",'click span[data-btntype="stream_postUpdateCancel"]':"postUpdateCancel",'click span[data-btntype="stream_postUpdate"]':"postUpdate","click span.btn_set_next":"moveRecommendList","click span.btn_set_prev":"moveRecommendList","click div.postFileModifyPart span.ic_del":"attachDeleteByModify","click a.btn_viewAll":"moreComment",'click span[data-btntype="closeBtn"]':"contentCloseAction","click li a.preview":"preview",'click span[data-btntype="moreBtn"]':"contentMoreAction","keyup textarea.edit":"expandTextarea","click span.metaInfoDelete":"metaInfoDelete","click a#listPostRecommend":"showPostRecommend"},_dragOver:function(e){e.preventDefault(),e.stopPropagation(),e.originalEvent.dataTransfer.dropEffect="move"},_dragLeave:function(e){e.preventDefault(),e.stopPropagation()},_drop:function(e){this._dragLeave(e)},expandTextarea:function(e){GO.util.textAreaExpand(e)},youtubeBack:function(t){var n=e(t.currentTarget);n.parents("div.meta_info_wrap").first().find("ul").show(),n.parents("div.meta_info_wrap").first().find("a.youtube_thum").show(),n.parents("div.meta_info_wrap").first().find("div.youtube").remove()},playVideo:function(t){t.preventDefault();var n=e(t.currentTarget),r=n.attr("data-videourl");console.log(r);var i=m({videoUrl:r});n.parent().append(i),n.parent().find("ul").hide(),n.hide()},contentMoreAction:function(t){var n=e(t.currentTarget);this.model.moreContent||this.model.getMoreContent(),n.parent().find("span.expander").hide(),n.parent().find('span[data-btntype="moreBtn"]').hide(),n.before('<span class="contentMore">'+GO.util.escapeHtml(this.model.moreContent)+"</span>"),n.parent().find('span[data-btntype="closeBtn"]').show()},preview:function(t){var n=e(t.currentTarget);return GO.util.preview(n.attr("data-id")),!1},contentCloseAction:function(t){var n=e(t.currentTarget);n.parent().find("span.expander").show(),n.parent().find("span.contentMore").remove(),n.parent().find('span[data-btntype="moreBtn"]').show(),n.parent().find('span[data-btntype="closeBtn"]').hide()},commentToggle:function(t){var n=this.$("ul.reply").children(),r=n.length>3?n.length-4:-1,i=e(t.currentTarget).find("span.commentFold");i.attr("data-comment")=="part"?(n.show(),i.text(E.content_fold).attr("data-comment","all")):(_.each(n,function(t,n){if(n>r)return!1;e(t).hide()}),i.text(E.all_view).attr("data-comment","part"))},moreComment:function(t){var n=e(t.currentTarget).find("span.commentFold");n.attr("data-loading")=="true"?this.commentToggle(t):(n.text(E.content_fold).attr({"data-comment":"all","data-loading":"true"}),this.moreCommentDraw(t,this.model.get("boardId"),this.model.id))},moreCommentDraw:function(e,t,n){this.commentView.fetchComments()},attachDeleteByModify:function(t){var n=e(t.target);n.parents("div.option_display").first().find("li").length==1&&n.parents("div.option_display").removeClass("option_display"),n.parents("li").first().remove(),this.setViewedTotalAttachSize(this.model.id)},moveRecommendList:function(t){var n=e(t.currentTarget).attr("data-page");this.postRecommendListDraw({boardId:this.model.get("boardId"),postId:this.model.id,page:n})},showProfileCard:function(t){var n=e(t.currentTarget).attr("data-userid");n!=""&&p.render(n,t.currentTarget)},postDelete:function(t){var n=this;e.goCaution(E.confirm_delete,E.confirm_delete_message,function(){n.postDeleteAction(t)})},postDeleteAction:function(t){var n=GO.contextRoot+"api/board/"+this.model.get("boardId")+"/post/"+this.model.id;e.go(n,{},{qryType:"DELETE",contentType:"application/json",responseFn:function(n){e(t.currentTarget).parents("li").first().remove()}})},postSendMail:function(e){var t=this.model.get("boardId"),n=this.model.id;this.postMailModel=new s({boardId:t,postId:n}),this.asyncFetch(this.postMailModel).then(_.bind(function(){var e=this.postMailModel.toJSON(),t=e.body,n=_.map(e.attachList,function(e){var t=e.path+":"+e.name+":"+e.size+":"+e.id+"\n";return t});this.openEmailPopup(t,n)},this)).otherwise(function(t){console.log(t.stack)})},openEmailPopup:function(e,t){var n=Math.floor(Math.random()*1e4),r="scrollbars=yes,resizable=yes,width=1280,height=760";window.open("",n,r);var i=document.createElement("form"),s=document.createElement("input");s.type="hidden",s.name="data";var o={};o.content=e;var u=[];_.each(t,function(e){u.push(e)}),o.attachFiles=u,s.value=JSON.stringify(o),i.appendChild(s),i.action=GO.contextRoot+"app/mail/popup/process",i.method="post",i.target=n,document.body.appendChild(i),i.submit(),document.body.removeChild(i)},asyncFetch:function(e){return new S(function(t,n,r){e.fetch({success:t,error:n,statusCode:{400:function(){GO.util.error("400",{msgCode:"400-works"})},403:function(){GO.util.error("403",{msgCode:"400-works"})},404:function(){GO.util.error("404",{msgCode:"400-works"})},500:function(){GO.util.error("500")}}})})},metaInfoDelete:function(t){var n=e(t.currentTarget);n.parents("div.meta_info_wrap").hide().find("span.metaInfoDelete").hide()},setModifyPart:function(t,n){var r=this.model.get("boardId"),i=this.model.id,s=e(t.target).parent().parent(),u=s.siblings("p");u.find('span[data-btntype="moreBtn"]').hide(),u.find('span[data-btntype="closeBtn"]').hide(),u.find("span.contentMore").remove(),u.append('<span class="textarea_edit"><textarea class="edit w_max">'+n+"</textarea></span>"),u.find("span").first().hide(),GO.util.textAreaExpandByNode(u.find("textarea.w_max")[0]);var a=s.parent().find("ul.file_wrap li").length,f=s.parent().find("ul.feed_img li").length,l="";if(a>0||f>0)l="option_display";var c;c="<div class='"+l+" temp postFileModifyPart' id='postFileModifyWrap_"+i+"'>",c+="<ul class='file_wrap'>",s.parent().find("ul.file_wrap li").each(function(){c+="<li data-name='"+e(this).attr("data-name")+"' data-id='"+e(this).attr("data-id")+"' data-size='"+e(this).attr("data-size")+"'>"+"<span class='item_file'>"+"<span class='btn_wrap'><span class='ic_classic ic_del' data-postid='"+i+"'></span></span>"+e(this).find("span.item_file").html()+"</span>"+"</li>"}),c+="</ul>",c+="<ul class='img_wrap'>",s.parent().find("ul.feed_img li").each(function(){c+="<li data-name='"+e(this).attr("data-name")+"' data-id='"+e(this).attr("data-id")+"' data-size='"+e(this).attr("data-size")+"'>"+"<span class='item_file'>"+"<span class='item_image'>"+"<span class='thumb'>"+"<img src='"+e(this).find("img").attr("src")+"' alt='"+e(this).attr("data-name")+"'>"+"</span>"+"<span class='btn_wrap'>"+"<span class='ic_classic ic_del' data-postid='"+i+"'></span>"+"</span>"+"<span class='name'>"+e(this).attr("data-name")+"</span>"+"<span class='size'>"+GO.util.getHumanizedFileSize(e(this).attr("data-size"))+"</span>"+"</span>"+"</span>"+"</li>"}),c+="</ul>",c+="</div>",u.after(c);var h="";this.model.get("publicWriter")&&(h='checked="checked"');var p="";this.anonymFlag&&(p='<span class="btn_action action_off"><label><input type="checkbox" data-name="modifyOpenWriter" disabled="disabled" '+h+">"+E.public_writer+"</label>"+"</span>"),s.parent().find("div.origin").hide(),s.parent().append('<div class="article_edit" data-boardId="'+r+'" data-postId="'+i+'">'+p+'<span class="optional">'+'<span class="file_progressive_warp" id="postFileModifyProgress_'+i+'_file" style="display:none"></span>'+'<span class="size total_size"></span>'+'<span class="btn_ic24">'+'<span class="wrap_btn wrap_file_upload">'+'<span class="fileinput-button postFileModifyWrap_'+i+'" id="postFileModifyWrap_'+i+'" data-initattach="false">'+'<span class="ic ic_file_s" id="postFileModifyWrap_'+i+'_file" title="'+o["\ud30c\uc77c \ucca8\ubd80"]+'"></span>'+"</span>"+"</span>"+"</span>"+"</span>"+'<span class="btn_major_s" data-btntype="stream_postUpdate">'+E.save+"</span>&nbsp;"+'<span class="btn_minor_s" data-btntype="stream_postUpdateCancel">'+E.cancel+"</span>"+"</div>"),s.hide(),e(t.currentTarget).parents("div.article_wrap").first().find("div.meta_info_wrap span.metaInfoDelete").show(),this.initPostUpload(i,"file")},initPostUpload:function(t,r){var i=this,s={el:"#postFileModifyWrap_"+t+"_"+r,context_root:GO.contextRoot,button_text:"",button_width:36,button_height:26,url:"api/file?GOSSOcookie="+e.cookie("GOSSOcookie"),mode:"COMMENT",progressBarUse:!0,progressEl:"#postFileModifyProgress_"+t+"_"+r,commentTmpl:['<span class="ic ic_file_s" id="postFileModifyWrap_'+t+'_file" title="{title}"></span>','<input type="file" name="file" title="{title}" style="height:inherit;" multiple=""/>'].join("")},u=GO.config("attachSizeLimit")?parseInt(GO.config("maxAttachSize")):parseInt(GO.config("commonAttachConfig").maxAttachSize),a=u*1024*1024,f=GO.config("attachNumberLimit")?parseInt(GO.config("maxAttachNumber")):parseInt(GO.config("commonAttachConfig").maxAttachNumber);(new g(s)).queue(function(e,t){}).start(function(r,s){if(!GO.config("attachFileUpload"))return e.goAlert(o["\ud30c\uc77c\ucca8\ubd80\uc6a9\ub7c9\ucd08\uacfc"]),e("#postFileModifyWrap_"+t).closest(".dropZone").removeClass("drag_file"),!1;e("input[name=disabled]:checked",this).length&&r.preventDefault();if(GO.config("excludeExtension")!=""){var l=e.inArray(s.type.substr(1).toLowerCase(),GO.config("excludeExtension").split(","));if(l>=0)return e.goMessage(n.i18n(E.alert_exclude_extension,"arg1",GO.config("excludeExtension"))),e("#postFileModifyWrap_"+t).closest(".dropZone").removeClass("drag_file"),!1}if(i.isSaaS||GO.config("attachSizeLimit")){if(a<s.size)return e.goMessage(n.i18n(E.alert_max_attach_size,"arg1",u)),e("#postFileModifyWrap_"+t).closest(".dropZone").removeClass("drag_file"),!1;i.totalAttachSize+=s.size}if(i.isSaaS||GO.config("attachNumberLimit")){var c=e("#postFileModifyWrap_"+t).find("li").length+i.totalAttachCount+1;if(f<c)return e.goMessage(n.i18n(E.alert_max_attach_cnt,"arg1",f)),e("#postFileModifyWrap_"+t).closest(".dropZone").removeClass("drag_file"),!1;i.totalAttachCount++}}).progress(function(e,t){}).success(function(n,r,s){var u="",a="";if(GO.util.fileUploadErrorCheck(r))u="<strong class='caution'>"+GO.util.serverMessage(r)+"</strong>",a="attachError";else if(GO.util.isFileSizeZero(r))return e.goAlert(GO.util.serverMessage(r)),!1;e("#postFileModifyWrap_"+t).hasClass("option_display")||e("#postFileModifyWrap_"+t).addClass("option_display");var f=r.data,l=f.filePath,c=f.fileName,h=f.fileExt,p=f.fileSize,d=GO.util.getHumanizedFileSize(p),v=f.thumbnail,m=f.hostId,g="";if(GO.util.isImage(h))g='<li class="'+a+'" data-tmpname="'+l+'" data-name="'+c+'" data-hostid="'+m+'" data-size="'+p+'">'+'<span class="item_image">'+'<span class="thumb">'+'<img src="'+v+'" alt="'+c+'" />'+"</span>"+'<span class="btn_wrap">'+'<span class="ic_classic ic_del" title="'+o["\uc0ad\uc81c"]+'" data-postid='+t+"></span>"+"</span>"+'<span class="name">'+c+"</span>"+'<span class="size">('+d+")</span>"+"</span>"+"</li>",e("#postFileModifyWrap_"+t).find("ul.img_wrap").length==0&&e("#postFileModifyWrap_"+t).append('<ul class="img_wrap"></ul>'),e("#postFileModifyWrap_"+t).find("ul.img_wrap").append(g);else{var y=GO.util.fileExtentionCheck(h)?h:"def";g='<li class="'+a+'" data-tmpname="'+l+'" data-name="'+c+'" data-hostid="'+m+'" data-size="'+p+'">'+'<span class="item_file">'+'<span class="btn_wrap" title="'+o["\uc0ad\uc81c"]+'">'+'<span class="ic_classic ic_del" data-postid='+t+"></span>"+"</span>"+'<span class="ic_file ic_'+y+'"></span>'+'<span class="name">'+c+"</span>"+'<span class="size">('+d+")</span>"+u+"</span>"+"</li>",e("#postFileModifyWrap_"+t).find("ul.file_wrap").length==0&&e("#postFileModifyWrap_"+t).append('<ul class="file_wrap"></ul>'),e("#postFileModifyWrap_"+t).find("ul.file_wrap").append(g)}i.setViewedTotalAttachSize(t),i.resetAttachSizeAndCount()}).complete(function(e,t){}).error(function(t,n){n.jqXHR&&(n.jqXHR.statusText=="abort"?e.goAlert(o["\ucde8\uc18c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]):e.goAlert(o["\uc5c5\ub85c\ub4dc\uc5d0 \uc2e4\ud328\ud558\uc600\uc2b5\ub2c8\ub2e4."]),i.resetAttachSizeAndCount())})},postModify:function(e){var t=this,n=this.model.summarizedFlag(),r="";n?(this.moreContentModel=new d,this.moreContentModel.clear(),this.moreContentModel.set({boardId:this.model.get("boardId"),postId:this.model.id},{silent:!0}),this.moreContentModel.fetch({success:function(n){r=n.toJSON().content,t.setModifyPart(e,r)},error:function(e,t){console.log(t)}})):(r=this.contentToEscape(this.model.get("summary")),this.setModifyPart(e,r)),t.setViewedTotalAttachSize(this.model.id)},postUpdate:function(t){var n=this,r=this.model.get("boardId"),i=this.model.id,s=e(t.target).parent().siblings("p").find("textarea.edit").val(),o={content:s},u=e("#postFileModifyWrap_"+i).find("li:not(.attachError)"),f=[],l,c=e(t.target).siblings("span").find('input[data-name="modifyOpenWriter"]').is(":checked");o.publicWriter=c,u.each(function(){l={},e(this).attr("data-tmpname")&&(l.path=e(this).attr("data-tmpname")),e(this).attr("data-name")&&(l.name=e(this).attr("data-name")),e(this).attr("data-id")&&(l.id=e(this).attr("data-id")),e(this).attr("data-hostid")&&(l.hostId=e(this).attr("data-hostid")),e(this).attr("data-size")&&(l.size=e(this).attr("data-size")),f.push(l)}),f.length>0&&(o.attaches=f);var h=e(t.currentTarget).parents("div.article_wrap").first().find("div.meta_info_wrap");if(!h.is(":visible"))o.links=[];else{var p=[],d=h.find("a.url_type").html(),m=h.find("a.url_type").attr("data-video"),g=h.find(".thumb img").attr("src"),y=h.find(".title").html(),b=h.find(".meta_contents").html(),w=h.attr("data-linkid");p.push({id:w,url:d,title:y,description:b,imageSrc:g,videoSrc:m}),o.links=p}this.post=new v,this.post.set({boardId:r,postId:i,writeType:"edit"},{silent:!0}),this.post.save(o,{type:"PUT",success:function(o,u){var f=e(t.target).parent().siblings("p");f.find("span.expander").html(GO.util.escapeHtml(s)).show(),f.find("span.textarea_edit").remove(),e("#toolbar_"+r+"_"+i).css("display","");var l=e(t.currentTarget).parents("div.article_wrap").find("div.meta_info_wrap");u.data.links.length>0?l.show().find("span.metaInfoDelete").hide():l.remove(),e(t.target).parent().parent().find("div.option_display").remove(),e(t.target).parent().parent().find("div.origin").remove(),e(t.target).parent().parent().find("span.btn_fn7").remove(),u.data.attaches&&e(t.target).parent().parent().append(a.render({attaches:u.data.attaches,postId:u.data.id,boardId:r})),e(t.target).parent().remove(),e(".fancybox-thumbs").goFancybox(),n.model.set("summary",o.get("summary"))},error:function(e,t){console.log("update fail.")}})},postUpdateCancel:function(t){var n=e(t.target).parent().siblings("p");n.find("span.expander").show(),n.find("span.textarea_edit").remove();var r=e(t.target).parent().attr("data-boardId"),i=e(t.target).parent().attr("data-postId");e("#toolbar_"+r+"_"+i).css("display",""),e(t.target).parent().parent().find("div.option_display").remove(),e(t.target).parent().parent().find("span.btn_fn7").remove(),e(t.target).parent().parent().find("div.origin").show(),e(t.currentTarget).parents("div.article_wrap").find("div.meta_info_wrap").show().find("span.metaInfoDelete").hide(),e("#postFileModifyWrap_"+i).remove(),e(t.target).parent().remove(),e(t.currentTarget).parents("div.article_wrap").find("div.meta_info_wrap").show()},contentToEscape:function(e){if(!e)return;return e=e.replace(/<br\>/gi,"\n"),e=e.replace(/&nbsp;/gi," "),e},postRecommend:function(t){this.recommendFlag=!0;var n=e(t.currentTarget).hasClass("on"),r=n?"DELETE":"POST",i=GO.contextRoot+"api/board/"+this.model.get("boardId")+"/post/"+this.model.id+"/recommend",s=this;e.go(i,"",{qryType:r,contentType:"application/json",responseFn:function(r){if(r.code==200){var i=s.$el.find("#listPostRecommend"),o=r.data.recommendCount||0;i.html(o),n?(e(t.currentTarget).removeClass("on").attr("title",E.title_recommend),e(t.currentTarget).find("span.txt").html(o)):(e(t.currentTarget).addClass("on").attr("title",E.title_recommend_cancel),e(t.currentTarget).find("span.txt").html(o))}}})},postRecommendListToggle:function(t){var n=e(t.target).hasClass("ic_close_s");if(n){e("#recommendList_"+this.model.id).hide(),e(t.target).removeClass("ic_close_s").addClass("ic_open_s").attr("title",E.title_open);return}e("#recommendList_"+this.model.id).show(),this.postRecommendListDraw({boardId:this.model.get("boardId"),postId:this.model.id,page:"0"}),e(t.target).removeClass("ic_open_s").addClass("ic_close_s").attr("title",E.title_close)},postRecommendListDraw:function(t){var n={page:t.page,offset:"10"},r=l.getCollection({boardId:t.boardId,postId:t.postId,data:n}),i=c({dataset:r.toJSON(),isNext:r.isNext(),isPrev:r.isPrev(),prePage:r.prePage(),nextPage:r.nextPage()});e("#recommendList_"+t.postId).html(i)},getAttachView:function(){return a.render({attaches:this.model.get("attaches"),postId:this.model.get("id"),boardId:this.model.get("boardId")})},streamDetailMakeTemplete:function(e){_.each(e.links,function(e){e.url&&(e.url=e.url.replace(/&amp;/gi,"&"))});var t=f({lang:E,dataset:e,postAttachFiles:this.model.hasAttach()?this.getAttachView():"",boardId:this.model.get("boardId"),isZero:this.model.isZero(),commentCheck:this.model.commentCheck(),isRecommend:this.model.isRecommend(),directUrl:this.directUrl(),dateParse:this.model.dateParse(),contentParse:this.isDetail?this.model.detailContent():this.model.simpleContent(),isSummarized:this.isDetail?!1:this.model.summarizedFlag(),hasComment:this.commentFlag||this.model.hasComment(),isActiveDept:this.boardModel.get("status")=="ACTIVE",isCommunity:this.isCommunity,sendMailFlag:this.sendMailFlag,anonymFlag:this.boardModel.get("anonymFlag"),isAlimPost:function(){return this.notiMailFlag||this.notiPushFlag?!0:!1}});return t},showPostRecommend:function(t){var n=['<ul class="tab_nav tab_nav2"><li class="last on"><span>',E.reomment_list_tab,"</span></li></ul>"],r=e.goPopup({pclass:"layer_normal layer_reader",headerHtml:n.join(""),contents:h(),buttons:[{btype:"confirm",btext:E.ok}]});e.goGrid({el:"#recommendList",url:GO.contextRoot+"api/board/"+this.model.get("boardId")+"/post/"+this.model.id+"/recommend",displayLength:5,displayLengthSelect:!1,emptyMessage:u["\uc88b\uc544\uc694 \ubaa9\ub85d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],numbersShowPages:5,method:"GET",defaultSorting:[],sDom:'rt<"tool_bar"<"critical custom_bottom">p>',bProcessing:!1,columns:[{mData:null,sWidth:"150px",bSortable:!1,sClass:"align_l",fnRender:function(e){var t=e.aData,n=[t.recommender.name," ",t.recommender.positionName].join("");return t.recommender.otherCompanyUser&&(n='<span class="multi_user">'+n+"</span>"),returnArr=[n,'&nbsp;<span class="date">',GO.util.basicDate(t.updatedAt),"</span>"],returnArr.join("")}}],fnDrawCallback:function(t,n,i){var s=r.find(".tool_bar");n._iRecordsTotal<n._iDisplayLength?(e(this.el).find("tr:last-child>td").css("border-bottom",0),s.hide()):(s.show(),s.find("div.dataTables_paginate").css("margin-top",0)),r.find(".dataTables_wrapper").css("margin-bottom",0),r.reoffset()}})},render:function(){var t=this.model.toJSON();return this.$el.html(this.streamDetailMakeTemplete(t)),a.resize(this.$el),e("input[placeholder], textarea[placeholder]").placeholder(),e("#content").addClass("go_renew"),this.initCommentView(),this.$el.attr({"data-boardId":this.model.get("boardId"),"data-postId":this.model.id}),e(".fancybox-thumbs").goFancybox(),this.setHeartbeatAnimation(this.$el.find(".heartbeat")),this},setHeartbeatAnimation:function(t){var n=w.loadAnimation({container:t[0],render:"svg",loop:!1,autoplay:!1,path:window.location.protocol+"//"+window.location.host+GO.contextRoot+"resources/js/vendors/lottie/heartbeat.json"});t.hasClass("on")?n.play():n.stop(),t.on("click",function(){e(this).hasClass("on")?n.stop():n.play()})},initCommentView:function(){this.commentView=y.init({el:this.$("#replyArea"),typeUrl:"board/"+this.model.get("boardId")+"/post",typeId:this.model.id,isWritable:this.commentFlag,anonymFlag:this.anonymFlag,availableAnonymousWriterOptionInPostComment:this.availableAnonymousWriterOptionInPostComment,isReply:!1}),this.commentView.render(),this.commentView.setComments(this.model.get("comments")),this.commentView.renderList();var e=this;this.commentView.$el.on("comment:change",function(t,n,r){var i=e.$("#commentCount");i.html(r),i.find("span.commentFold").text(E.content_fold).attr("data-comment","all"),e.commentCount=r})},getViewedTotalAttachSize:function(t){var n=0;return e("#postFileModifyWrap_"+t).find("li").each(function(){n+=parseInt(this.getAttribute("data-size"),0)}),n},directUrl:function(){var e=this.boardMaster.ownerId,t=this.model.get("boardId"),r=this.model.id,i=n.router.getRootUrl();return this.isCommunity?i+="community/"+e+"/board/"+t+"/post/"+r+"/stream":i+="board/"+t+"/post/"+r+"/stream",i},setViewedTotalAttachSize:function(t){if(this.isSaaS||GO.config("attachSizeLimit")){var n=this.getViewedTotalAttachSize(t);e("#postFileModifyWrap_"+t).closest(".dropZone").find(".total_size").html(GO.util.displayHumanizedAttachSizeStatus(n))}},resetAttachSizeAndCount:function(){if(this.isSaaS||GO.config("attachSizeLimit"))this.totalAttachSize=0,this.totalAttachCount=0}});return x})}).call(this);