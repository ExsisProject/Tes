(function(){define(["backbone","hogan","app","i18n!nls/commons","i18n!task/nls/task","hgn!task/templates/task_activity_item","comment","views/profile_card","attach_file","file_upload","content_viewer","go-webeditor/jquery.go-webeditor","go-fancybox"],function(e,t,n,r,i,s,o,u,a,f,l){var c={commentWrite:i["\ub313\uae00\uc4f0\uae30"],edit:r["\uc218\uc815"],attach:r["\ud30c\uc77c \ucca8\ubd80"],save:r["\uc800\uc7a5"],cancel:r["\ucde8\uc18c"],count:i["\uac1c"],comment:r["\ub313\uae00"],showAll:i["\ubaa8\ub450 \ubcf4\uae30"],fold:r["\uc811\uae30"]},h=e.View.extend({tagName:"li",events:{"click span.ic_del":"attachDelete","click #editActivity":"showEditForm","click #closeEditorBnt":"closeEditForm","click #deleteActivity":"confirmDelete","click #editActivityBtn":"submitActivity","click #showAllComment":"showAllComment","click #foldComment":"foldComment","click a[data-tag=profile]":"showProfileCard","click span[data-tag=profile]":"showProfileCard"},initialize:function(e){this.activity=e.model,this.taskId=e.taskId,this.dept=e.dept,this.isPrint=e.isPrint,this.editorId="activityEditor"+this.activity.get("id")},render:function(){this.$el.html(s({lang:c,data:this.activity.toJSON(),snsDate:{date:GO.util.snsDate(this.activity.modifyTime()),modifyFlag:this.activity.isModify()},dept:this.dept,commentCount:this.activity.get("commentCount"),commentPresent:this.activity.commentPresent(),isDisplayComment:!this.isPrint||this.activity.commentPresent(),hasMoreComment:!this.isPrint&&this.activity.hasMoreComment(),isPrint:this.isPrint,content:this.activity.get("content")})),this.isPrint?(this.contentEl=this.$el.find("#activityContent").find("span"),this.contentEl.html(this.activity.get("content"))):this.renderContentViewer(),this.renderAttaches(!0),this.commentView=o.init({el:this.$el.find("#taskReply"),typeUrl:"task/activity",typeId:this.activity.get("id"),isPrintMode:this.isPrint,rootId:this.typeId,rootUrl:"task/activity",isReply:!1,isWritable:!this.dept.deletedDept}),this.commentView.render(),this.commentView.setComments(this.model.get("comments")),this.commentView.renderList(),this.isPrint&&this.commentView.fetchComments();var e=this;return this.$el.on("comment:change",function(t,n,r){var i=r>3;e.$("#foldComment").toggle(i),e.$("#showAllComment").hide(),e.$("span.num").text(r)}),this.$("#activityContent").css("overflow-x","auto"),this},renderContentViewer:function(){this.contentViewer=l.init({$el:this.$("#activityContent"),content:this.activity.get("content")})},showAllComment:function(){if(this.commentView.isAll)this.$("#taskReply").find("li").show(),this.$("#foldComment").show(),this.$("#showAllComment").hide();else{var e=this;this.commentView.fetchComments(!0).done(function(t){t.data.length>3&&e.$("#foldComment").show(),e.$el.find("#showAllComment").hide(),e.commentView.isAll=!0})}},foldComment:function(){var e=this.commentView.collection.length-3;this.$("#taskReply").find("li:lt("+e+")").hide(),this.$("#foldComment").hide(),this.$("#showAllComment").show()},attachExtetionFilter:function(e){return GO.util.fileExtentionCheck(e)?e:"def"},attachDelete:function(e){$(e.target).parents("li[data-name]").hide()},renderAttaches:function(e){var t=this,n=(e?"viewModeAttachArea":"editModeAttachArea")+this.activity.id,r=null;e?r=a.create(n,this.activity.get("attaches"),function(e){return GO.contextRoot+"api/task/activity/"+t.activity.id+"/download/"+e.id}):r=a.create(n,this.activity.get("attaches"),null,"edit"),r.done(function(r){t.$("#"+n).replaceWith(r.el),r.$el.addClass(e?"feed origin":""),r.$el.attr({id:n,"data-type":e?"view":""})})},showEditForm:function(){var e=this.contentViewer.getContent();this.editor?this.editor.getInstance(this.editorId).setContent(e):(this.initSmartEditor(e),this.initFileUpload()),this.$el.find("div[data-type=edit]").show(),this.$el.find("div[data-type=view]").hide(),this.renderAttaches(!1),this.contentViewer.hide()},closeEditForm:function(){this.$el.find("div[data-type=edit]").hide(),this.$el.find("div[data-type=view]").show(),this.$el.find("div.tool_bar").css("display",""),this.contentViewer.show(),this.editor.getInstance(this.editorId).setContent(" "),this.$el.find("#editModeFileWrap").find("li:hidden").show(),this.renderAttaches(!0)},submitActivity:function(){if(!GO.Editor.getInstance(this.editorId).validate())return $.goError(r["\ub9c8\uc784 \uc0ac\uc774\uc988 \ucd08\uacfc"]),!1;var e=this,t=this.activity.get("attaches").length,n=this.getContent();this.activity.set({content:n,attaches:this.getAttaches()}),this.activity.setTaskId(this.taskId),this.activity.save({},{success:function(n){e.$el.trigger("change:log"),e.trigger("change:attach",n.get("attaches").length-t),e.contentViewer.setContent(n.get("content")),e.contentViewer.render(),e.closeEditForm(),e.renderAttaches(!0)},error:function(e,t){$.goError(t.responseJSON.message)}})},getContent:function(){var e=this.editor.getInstance(this.editorId).getContent();return e==""||$.trim(e)=="<br>"?"":e},getAttaches:function(){var e=[];return _.each(this.$el.find("#editModeAttachArea"+ +this.activity.id).find("li:not(.attachError)"),function(t){if($(t).is(":hidden")){$(t).remove();return}e.push({id:$(t).attr("data-id")||null,path:$(t).attr("data-path"),name:$(t).attr("data-name"),hostId:$(t).attr("data-hostId")})},this),e},confirmDelete:function(){var e=this;$.goPopup({title:i["\ud65c\ub3d9\uae30\ub85d \uc0ad\uc81c"],message:i["\ud65c\ub3d9\uae30\ub85d \uc0ad\uc81c \uc124\uba85"],buttons:[{btype:"confirm",btext:r["\ud655\uc778"],callback:function(){e.destroyActivity()}},{btext:r["\ucde8\uc18c"],callback:function(){}}]})},destroyActivity:function(){var e=this,t=this.activity.get("attaches").length;this.activity.destroy({success:function(){e.$el.trigger("change:log"),e.trigger("change:attach",0-t),e.trigger("change:activity",!0),e.$el.remove()},error:function(e,t){$.goError(t.responseJSON.message)}})},showProfileCard:function(e){var t=$(e.currentTarget).attr("data-userid");u.render(t,e.currentTarget)},initSmartEditor:function(e){$("#"+this.editorId).goWebEditor({contextRoot:GO.config("contextRoot"),lang:GO.session("locale"),editorValue:e}),this.editor=GO.Editor},initFileUpload:function(e){var t=this,e={el:"#file-control-activity-"+this.activity.id,context_root:GO.contextRoot,button_text:"<span class='buttonText'>"+c.attach+"</span>",url:"api/file?GOSSOcookie="+$.cookie("GOSSOcookie")};(new f(e)).queue(function(e,t){}).start(function(e,t){if(!GO.config("attachFileUpload"))return $.goAlert(r["\ud30c\uc77c\ucca8\ubd80\uc6a9\ub7c9\ucd08\uacfc"]),!1;if(GO.config("excludeExtension")!=""){var i=$.inArray(t.type.substr(1).toLowerCase(),GO.config("excludeExtension").split(","));if(i>=0)return $.goMessage(n.i18n(r["\ud655\uc7a5\uc790\uac00 \ub561\ub561\uc778 \uac83\ub4e4\uc740 \ucca8\ubd80 \ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],"arg1",GO.config("excludeExtension"))),!1}if(GO.config("attachSizeLimit")){var s=t.size/1024/1024,o=GO.config("maxAttachSize");if(o<s)return $.goMessage(n.i18n(r["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],"arg1",o)),!1}if(GO.config("attachNumberLimit")){var u=$("#editModeFileWrap").children().size(),a=GO.config("maxAttachNumber");if(a<=u)return $.goMessage(n.i18n(r["\ucd5c\ub300 \ucca8\ubd80 \uac2f\uc218\ub294 0\uac1c \uc785\ub2c8\ub2e4."],"arg1",a)),!1}}).progress(function(e,t){}).success(function(e,n,r){var i=GO.util.isImage(n.data.fileExt),s=t.$("#editModeAttachArea"+t.activity.id),o=i?"ul.img_wrap":"ul.file_wrap";if(GO.util.fileUploadErrorCheck(n))r.find(".item_file").append("<strong class='caution'>"+GO.util.serverMessage(n)+"</strong>"),r.addClass("attachError");else if(GO.util.isFileSizeZero(n))return $.goAlert(GO.util.serverMessage(n)),!1;r.attr("data-hostId",n.data.hostId),s.find(o).show().append(r)}).complete(function(e,t){console.info(t)}).error(function(e,t){console.info(t)})}});return h})}).call(this);