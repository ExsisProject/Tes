define(function(require){var e=require("backbone"),t=require("app"),n=require("hgn!components/comment/templates/comment_form"),r=require("components/comment/collections/comment"),i=require("i18n!nls/commons"),s=require("i18n!board/nls/board"),o=require("file_upload");require("jquery.go-validation");var u={comment:i["\ub313\uae00"],save:i["\uc800\uc7a5"],cancel:i["\ucde8\uc18c"],write:i["\ub313\uae00 \uc791\uc131"],alert_length:i["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],public_writer:s["\uc791\uc131\uc790 \uacf5\uac1c"],remove:i["\uc0ad\uc81c"],upload:i["\ub4f1\ub85d"],emoticonDelete:i["\uc774\ubaa8\ud2f0\ucf58 \uc0ad\uc81c"],commentPlaceholder:i["\ub313\uae00\uc744 \ub0a8\uaca8\ubcf4\uc138\uc694"]},a=!1,f={};return e.View.extend({attributes:{"data-comment-form":""},events:{"mouseover #uploadBtn":"initUploader","click span.ic_del":"deleteAttach","click [data-emoticon-delete-btn]":"deleteEmoticon","click [data-upload-btn]":"_validClickAttaches","click #emoticonBtn":"toggleEmoticonGroup","click #create":"submit","click #update":"submit","keyup textarea":"keyCheck","keyup textarea":"expandTextArea"},initialize:function(e){this.typeUrl=e.typeUrl,this.typeId=e.typeId,this.commentId=e.commentId||null,this.uid=e.uid,this.isSaaS=GO.session().brandName=="DO_SAAS",this.totalAttachSize=0,this.totalAttachCount=0,this.anonymFlag=e.anonymFlag,this.availableAnonymousWriterOptionInPostComment=e.availableAnonymousWriterOptionInPostComment||!1,this.isPublicWriter=e.isPublicWriter||!1,this.model||this.commentModelInit(),e.emoticonView&&(f=e.emoticonView)},render:function(){var e="",t="",r="";return GO.util.isIE8()&&(e="position:absolute;right:0px;bottom:1px;background:#fff;height:20px;",t="position:absolute;right:80px;bottom:2px;padding:0;width:36px;height:26px;",r=this.model.isNew()?"margin-right: 123px !important;":""),this.$el.html(n({typeId:this.typeId,lang:u,data:this.model.toJSON(),isCreate:this.model.isNew(),createdAt:this.model.createdAtStr(),user:GO.session(),hasAttach:this.model.hasAttach(),hasEmoticon:this.model.hasEmoticon(),emoticonPath:this.model.get("emoticonPath"),emoticonPathSrc:this.model.getEmoticonPath(),files:this.model.getFiles(),images:this.model.getImages(),cid:this.cid,anonymFlag:this.anonymFlag,isPublicWriter:this.isPublicWriter,availableAnonymousWriterOptionInPostComment:this.availableAnonymousWriterOptionInPostComment,style1:e,style2:t,style3:r})),this},keyCheck:function(e){e.shiftKey&&e.keyCode==13&&this.submit()},expandTextArea:function(e){this._updateStyleCreateBtn($(e.currentTarget).parents(".form_wrap")),GO.util.textAreaExpand(e)},commentModelInit:function(){this.model=new r,this.model.set({typeUrl:this.typeUrl,typeId:this.typeId,attaches:[]})},deleteAttach:function(e){var t=$(e.currentTarget).parents("li[data-name]"),n=t.parents("#commentAttachPart");t.remove(),n.find("li").length||(n.hide(),this._updateStyleCreateBtn(n))},deleteEmoticon:function(e){var t=$(e.currentTarget).parent();t.empty(),t.removeClass(),this._updateStyleCreateBtn(t)},toggleEmoticonGroup:function(e){console.info("toggleEmoticonGroup"),e.preventDefault(),e.stopPropagation();if(f.hasAttaches($(e.currentTarget)))return!1;f.renderEmoticonGroup($(e.currentTarget))},submit:function(e){if(!this.validate())return;f.moveToMainEmoticonView($(e.currentTarget));var t=this.model.get("attaches").length,n=this;this.model.isCalendar()&&this.commentId&&this.model.set({thread:this.commentId});if(a)return;var r=this.$el.find("#isOpenWriter").is(":checked");this.model.save({commentId:this.commentId,message:this.$("textarea").val(),attaches:this.getAttaches(),emoticonPath:this.$el.find("#commentEmoticonImg").attr("data-item-path"),publicWriter:r},{beforeSend:function(){a=!0},success:function(e,r){n.$el.trigger("change:attach",e.get("attaches").length-t),n.$el.trigger("change:log"),n.$el.trigger("comment:reset"),n.$("#create").removeClass("on"),n.$("textarea").val("").removeAttr("style"),n.$("#commentAttachPart").removeClass("option_display").find("li").remove(),n.$("[data-emoticon-edit-part]").removeClass("thumb_append").empty(),n.commentModelInit()},complete:function(){a=!1},error:function(e,t){$.goError(t.responseJSON.message)}})},validate:function(){var e=!0,n=this.$("textarea").val();if(!n||!$.goValidation.isCheckLength(2,1e3,$.trim(n)))$.goMessage(t.i18n(u.alert_length,{arg1:"2",arg2:"1000"})),e=!1;return e},_validClickAttaches:function(e){if(!_.isUndefined(f)&&f.hasSelectedEmoticon($(e.currentTarget)))return!1},_updateStyleCreateBtn:function(e){var t=e.parents(".msg_wrap").find("[data-func-wrapper]").find("#create"),n=e.parents(".msg_wrap").find("#commentAttachPart"),r=e.parents(".msg_wrap").find("[data-emoticon-edit-part]"),i=e.parents(".msg_wrap").find(".form_wrap").find("textarea");n.find("li").length<1&&r.find("img").length<1&&i.val().length<1?t.removeClass("on"):t.addClass("on")},getAttaches:function(){var e=this.$("#commentAttachPart").find("li:not(.attachError)");return _.map(e,function(e){var t=$(e);return{id:t.attr("data-id"),path:t.attr("data-path"),name:t.attr("data-name"),hostId:t.attr("host-id"),size:t.attr("data-size")}})},initUploader:function(e){$(e.currentTarget).attr("id","");var t=this.initFileUpload(this.$("#fileControl"),this);t.done(function(){if(GO.util.msie()){var t=$(e.currentTarget).find("object");t.hide(),setTimeout(function(){t.show()},200)}})},initFileUpload:function(e,t){var n=this,r={el:e,context_root:GO.contextRoot,button_text:"",url:"api/file?GOSSOcookie="+$.cookie("GOSSOcookie"),mode:"COMMENT",button_width:36,progressEl:"#progressBarWriteWrap"+this.cid},s=GO.config("attachSizeLimit")?parseInt(GO.config("maxAttachSize")):parseInt(GO.config("commonAttachConfig").maxAttachSize),u=s*1024*1024,a=GO.config("attachNumberLimit")?parseInt(GO.config("maxAttachNumber")):parseInt(GO.config("commonAttachConfig").maxAttachNumber),l=(new o(r)).queue(function(e,t){}).start(function(e,t){if(!_.isUndefined(f)&&f.hasSelectedEmoticon($(e.currentTarget)))return!1;if(!GO.config("attachFileUpload"))return $.goAlert(i["\ud30c\uc77c\ucca8\ubd80\uc6a9\ub7c9\ucd08\uacfc"]),!1;if(n.isSaaS||GO.config("attachSizeLimit")){if(u<t.size)return $.goMessage(GO.i18n(i["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],"arg1",s)),!1;n.totalAttachSize+=t.size}if(n.isSaaS||GO.config("attachNumberLimit")){var r=$("#commentAttachPart").find("li").length+n.totalAttachCount+1;if(a<r)return $.goMessage(GO.i18n(i["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],"arg1",a)),!1;n.totalAttachCount++}}).progress(function(e,t){n.$("#commentAttachPart").show(),n.$("#progressArea").show()}).success(function(e,t,r){var i=GO.util.isImage(t.data.fileExt),s=n.$("#commentAttachPart");s.addClass("wrap_attach");if(GO.util.fileUploadErrorCheck(t))r.find(".item_file").append("<strong class='caution'>"+GO.util.serverMessage(t)+"</strong>"),r.addClass("attachError");else if(GO.util.isFileSizeZero(t))return s.find("li").length==0&&s.css("display","none"),$.goAlert(GO.util.serverMessage(t)),!1;r.attr("data-size",t.data.fileSize),i?s.find("ul.img_wrap").append(r):s.find("ul.file_wrap").append(r),n._updateStyleCreateBtn(s),n.resetAttachSizeAndCount()}).complete(function(e,t){}).error(function(e,t){t.jqXHR&&(t.jqXHR.statusText=="abort"?$.goAlert(i["\ucde8\uc18c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]):$.goAlert(i["\uc5c5\ub85c\ub4dc\uc5d0 \uc2e4\ud328\ud558\uc600\uc2b5\ub2c8\ub2e4."]),n.resetAttachSizeAndCount())});return l.deferred},getViewedTotalAttachSize:function(e){var t=0;return $(e).find("li").each(function(){t+=parseInt(this.getAttribute("data-size"),0)}),t},resetAttachSizeAndCount:function(){this.isSaaS&&(this.totalAttachSize=0,this.totalAttachCount=0)}})});