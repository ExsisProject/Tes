define(["jquery","underscore","backbone","hgn!approval/templates/document/dept_folder","i18n!nls/commons","i18n!approval/nls/approval"],function(e,t,n,r,i,s){var o=n.Model.extend(),u=n.Collection.extend({model:o,url:"/api/approval/deptfolder"}),a={"\ubb38\uc11c \uc774\ub3d9":s["\ubb38\uc11c \uc774\ub3d9"],"\ubb38\uc11c\ud568\uc774 \uc5c6\uc2b5\ub2c8\ub2e4":s["\ubb38\uc11c\ud568\uc774 \uc5c6\uc2b5\ub2c8\ub2e4"],"\ubd80\uc11c \ubb38\uc11c\ud568\uc774 \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4":s["\ubd80\uc11c \ubb38\uc11c\ud568\uc774 \uc874\uc7ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."]},f=n.View.extend({el:".layer_doc_type_select .content",initialize:function(e){this.options=e||{},this.sideDeptFolderCollection=new u,this.sideDeptFolderCollection.fetch({async:!1})},events:{"click span.txt":"selectFolder"},render:function(){var t=this.sideDeptFolderCollection.toJSON(),n=!1;!!t.length&&!!GO.session("useOrg")&&e.each(t,function(e,t){t.managable&&t.containsSubDept&&(n=!0)});var i=r({contextRoot:GO.contextRoot,dataset:t,containsSubDept:n,lang:a});this.$el.html(i)},selectFolder:function(t){var n=e(t.currentTarget).parents("p.folder");this.$el.find(".on").removeClass("on"),n.addClass("on")},release:function(){this.$el.off(),this.$el.empty()}});return f});