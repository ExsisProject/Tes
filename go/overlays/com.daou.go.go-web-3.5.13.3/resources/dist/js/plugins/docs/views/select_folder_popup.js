define("docs/views/select_folder_popup",function(require){var e=require("jquery"),t=require("backbone"),n=require("app"),r=require("docs/collections/doc_folder_infos"),i=require("docs/views/docs_tree_menu"),s=require("hgn!docs/templates/docs_tree_menu"),o=require("hogan"),u=require("i18n!nls/commons"),a=require("i18n!docs/nls/docs"),f=o.compile('<section id="selectDocFolders" class="lnb"><ul class="side_depth"></ul></section>'),l=t.View.extend({events:{"click a.node-value":"folderSelect","click #toggleFolder":"toggleFolder"},initialize:function(e){this.docFolderList=new r,this.options=e||{},this.popupType=this.options.popupType?this.options.popupType:""},render:function(){this.$el.html(f.render())},renderList:function(){return this.render(),e.when(this.docFoldersRender()).done(e.proxy(function(){e(".list_wrap").append(this.$el)},this))},docFoldersRender:function(){function f(r,i){var s,o=["company",n.session("companyId"),"selectDocs"].join("."),u=t._renderMenuTree(r.id,i,o);return s=e(t.renderBoardTreeMenuNode({nodeId:r.id,nodeType:"FOLDER",nodeValue:r.getName(),isDeleted:r.attributes.state?r.attributes.state!="NORMAL":!1,hasChild:i.length>0,close:!0,isNew:!1,iconType:"folder",isMovePopup:this.popupType=="move"?!0:!1,managable:!1})),s.append(u.el),s}var t=this,i=this.$el.find("#selectDocFolders"),s=i.find("ul:first"),o=[];return s.empty(),this.docFolderList.comparator="seq",this.docFolderList.fetch({success:function(t){if(t.length==0){e(".list_wrap").remove();var n='<p class="add" style="color: #999;text-align: center;">'+a["\ub4f1\ub85d \uac00\ub2a5\ud55c \ubb38\uc11c\ud568\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]+"</p>";e(".content").append(n),e(".btn_layer_wrap .btn_minor_s").text(u["\ub2eb\uae30"])}else{var i=new r;t.each(function(e){i.get(e)?i.get(e).attributes=e.attributes:i.push(e),e.attributes.parent=_.sortBy(e.attributes.parent,"depth");var t=0;for(var n=0;n<e.getParent().length;n++)n>0&&(e.getParent()[n].parentId=t),i.push(i.getExistModel(e.getParent()[n])),t=e.getParent()[n].id}),_.each(i.getRootFolders(),function(e){var t=f(e,i.getEveryChildrenFolder(e.id));t&&o.push(t)}),s.append.apply(s,o)}}})},getStoredCategoryIsOpen:function(e){var t=n.util.store.get(e);return _.isUndefined(t)&&(t=!0),t},toggleFolder:function(t){var n=e(t.currentTarget),r=n.parent().find("a").attr("data-id"),i=n.parent().find("a").attr("title"),s=n.hasClass("close");s?(n.removeClass("close").addClass("open"),n.parent().next("ul").hide()):(n.removeClass("open").addClass("close"),n.parent().next("ul").show())},_renderMenuTree:function(e,t,n){var r=new i({nodes:t,menuId:n,parentId:e,useNew:!1,useOpen:!1});return r.render(),r},renderBoardTreeMenuNode:function(){return s.apply(undefined,arguments)},folderSelect:function(t){var r=e(t.currentTarget);if(!this.docFolderList.isAccessFolder(r.attr("data-id"))){e.goMessage(u["\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]);return}var i=this.docFolderList.findFolderModel(r.attr("data-id"));e("#docsPath").trigger("docsFolder:select",i);if(this.popupType=="move"){var s=r.attr("data-id"),o=this;e.ajax({type:"GET",dataType:"json",url:n.config("contextRoot")+"api/docs/folder/"+s+"/move/available",success:function(n){if(n.code!=200){e.goMessage(a["\uc2b9\uc778\ubb38\uc11c\ud568\uc774\ub3d9\uc124\uba85"]);return}var r=e(t.currentTarget).parents("p.folder");o.$el.find(".on").removeClass("on"),r.addClass("on")}})}}});return l});