define(function(require){var e=require("jquery"),t=require("backbone"),n=require("app"),r=require("hgn!community/templates/master_home"),i=require("hgn!community/templates/add_org_manager"),s=require("hgn!community/templates/change_org_master"),o=require("community/views/master_update"),u=require("community/views/master_members"),a=require("community/views/master_delete"),f=require("community/models/delete"),l=require("community/models/member_remove"),c=require("community/models/member_online"),h=require("community/models/info"),p=require("community/views/side_members"),d=require("board/views/board_title"),v=require("i18n!nls/commons"),m=require("i18n!community/nls/community"),g=require("community/views/community_board");require("jquery.go-popup"),require("jquery.go-orgslide"),require("jquery.go-validation");var y={community_info:m["\uc815\ubcf4"],community_board:m["\uac8c\uc2dc\ud310"],community_member:m["\uba64\ubc84"],community_delete:m["\ud328\uc1c4"]},b=t.View.extend({listEl:null,el:"#content",manage:!1,initialize:function(){this.unbindEvent(),this.bindEvent()},unbindEvent:function(){this.$el.off("click","#communityUpdate"),this.$el.off("click","#communityBoard"),this.$el.off("click","#communityMember"),this.$el.off("click","#communityDelete"),this.$el.off("click","input[type=radio][name=member]"),this.$el.off("click","input[type=radio][name=board"),this.$el.off("click","#communityRemove"),this.$el.off("click","#btnOnline"),this.$el.off("click","#btnRemove"),this.$el.off("click","#communityMaster"),this.$el.off("click","#communityManager"),this.$el.off("click","ul.name_tag li span.ic_del")},bindEvent:function(){this.$el.on("click","#communityUpdate",e.proxy(this.getUpdate,this)),this.$el.on("click","#communityBoard",e.proxy(this.getBoard,this)),this.$el.on("click","#communityMember",e.proxy(this.getMember,this)),this.$el.on("click","#communityDelete",e.proxy(this.getDelete,this)),this.$el.on("click","input[type=radio][name=member]",e.proxy(this.getMemberByRadio,this)),this.$el.on("click","input[type=radio][name=board]",e.proxy(this.getBoardByRadio,this)),this.$el.on("click","#communityRemove",e.proxy(this.communityRemove,this)),this.$el.on("click","#btnOnline",e.proxy(this.memberOnline,this)),this.$el.on("click","#btnRemove",e.proxy(this.memberRemove,this)),this.$el.on("click","#communityMaster",e.proxy(this.changeMaster,this)),this.$el.on("click","#communityManager",e.proxy(this.addManager,this)),this.$el.on("click","ul.name_tag li span.ic_del",e.proxy(this.deleteMember,this))},render:function(t,i,s){var f=h.read({communityId:t}).toJSON();f.memberType!="MASTER"&&f.memberType!="MODERATOR"&&(n.router.navigate("community/"+t,{trigger:!0,pushState:!0}),e.goAlert(m["\uc811\uadfc \ud560 \uc218 \uc5c6\ub294 \uba54\ub274\uc785\ub2c8\ub2e4."],m["\ub9c8\uc2a4\ud130, \ubd80\ub9c8\uc2a4\ud130 \uad8c\ud55c\uc774 \ud544\uc694\ud569\ub2c8\ub2e4."])),this.$el.html(r({lang:y,communityId:t})),this.$el.find(".active").removeClass("active");if(i=="board")this.$el.find("#communityBoard").addClass("active"),g.render({communityId:t,status:"ACTIVE"});else if(i=="member"){var l=s==undefined?"online":s;this.$el.find("#communityMember").addClass("active"),this.listEl=u.render(t,l)}else i=="delete"?(this.$el.find("#communityDelete").addClass("active"),a.render(t)):(this.$el.find("#communityUpdate").addClass("active"),o.render(t),f.memberType=="MODERATOR"&&(e("#communityDelete").remove(),e("#communityMaster").remove()));d.render({el:".content_top",dataset:{name:f.name}})},modifyDesc:function(t){e("#modifyDesc").hide(),e("#inputModifyDesc").show()},deleteMember:function(t){e(t.currentTarget).parents("li").remove()},masterData:function(t){var n=e("#changeMaster"),r=e("#addManagers");t&&!n.find('li[data-id="'+t.id+'"]').length&&t&&!r.find('li[data-id="'+t.id+'"]').length?(n.find("li").first().remove(),n.prepend(s(e.extend(t,{lang:y})))):e.goMessage(m["\uc774\ubbf8 \uc120\ud0dd\ub418\uc5c8\uc2b5\ub2c8\ub2e4."])},managerData:function(t){var n=e("#addManagers"),r=e("#changeMaster");t&&!n.find('li[data-id="'+t.id+'"]').length&&t&&!r.find('li[data-id="'+t.id+'"]').length?n.find("li.creat").before(i(e.extend(t,{lang:y}))):e.goMessage(m["\uc774\ubbf8 \uc120\ud0dd\ub418\uc5c8\uc2b5\ub2c8\ub2e4."])},changeMaster:function(t){var n=this.$el.find(".tab_menu").attr("data-id");e.goOrgSlide({header:m["\ub9c8\uc2a4\ud130 \ubcc0\uacbd"],type:"community",desc:m["\uba64\ubc84\ub97c \ud074\ub9ad\ud558\uba74 \ub9c8\uc2a4\ud130\ub85c \ubcc0\uacbd\ub429\ub2c8\ub2e4."],contextRoot:GO.contextRoot,callback:this.masterData,loadId:n,accessOrg:!0})},addManager:function(t){var n=this.$el.find(".tab_menu").attr("data-id");e.goOrgSlide({header:m["\ubd80\ub9c8\uc2a4\ud130 \ucd94\uac00"],type:"community",desc:m["\uba64\ubc84\ub97c \ud074\ub9ad\ud558\uba74 \ubd80\ub9c8\uc2a4\ud130\ub85c \ucd94\uac00\ub429\ub2c8\ub2e4."],contextRoot:GO.contextRoot,callback:this.managerData,loadId:n,accessOrg:!0})},getUpdate:function(t){var n=e(t.currentTarget);this.$el.find(".active").removeClass("active"),n.addClass("active");var r=this.$el.find(".tab_menu").attr("data-id");o.render(r);var i=h.read({communityId:r}).toJSON();i.memberType=="MODERATOR"&&e("#communityMaster").remove()},getBoard:function(t){var n=e(t.currentTarget);this.$el.find(".active").removeClass("active"),n.addClass("active");var r=this.$el.find(".tab_menu").attr("data-id");g.render({communityId:r,status:"ACTIVE"})},getMember:function(t){var n=e(t.currentTarget);this.$el.find(".active").removeClass("active"),n.addClass("active");var r=this.$el.find(".tab_menu").attr("data-id");this.listEl=u.render(r,"online")},getMemberByRadio:function(t){var n=this.$el.find(".tab_menu").attr("data-id"),r=e("input:radio[name='member']:checked").val();this.listEl=u.render(n,r)},getBoardByRadio:function(t){var n=this.$el.find(".tab_menu").attr("data-id"),r=e(":checked").val();this.listEl=g.render({communityId:n,status:r})},memberOnline:function(t){var r=this,i=this.$el.find(".tab_menu").attr("data-id"),s=[];form=this.$el.find("form[name=formCommunityMembers]"),memberEl=form.find('tbody input[type="checkbox"]:checked');if(memberEl.size()==0){e.goMessage(m["\uc120\ud0dd\ub41c \uba64\ubc84\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"]);return}e.goConfirm(m["\uc120\ud0dd\ud558\uc2e0 \ud68c\uc6d0\uc758 \uac00\uc785\uc744 \uc2b9\uc778\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],n.i18n(m["\ucd1d 0\uba85 \uc120\ud0dd\ub418\uc5c8\uc2b5\ub2c8\ub2e4."],"count",memberEl.size()),function(){e(form.serializeArray()).each(function(e,t){t.name=="userId"&&s.push(t.value)}),this.model=new c,this.model.set({id:i,userIds:s},{silent:!0}),this.model.save({},{success:function(e,t){t.code=="200"&&(r._reloadTables(),p.render(i))},error:function(t,n){n.msg?e.goAlert(n.msg):n.responseJSON&&n.responseJSON.message&&e.goAlert(n.responseJSON.message),n.focus&&form.find('input[name="'+n.focus+'"]').focus()}})})},memberRemove:function(t){var r=this,i=this.$el.find(".tab_menu").attr("data-id"),s=[];form=this.$el.find("form[name=formCommunityMembers]"),memberEl=form.find('tbody input[type="checkbox"]:checked');if(memberEl.size()==0){e.goMessage(m["\uc120\ud0dd\ub41c \uba64\ubc84\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"]);return}var o;e(t.currentTarget).attr("data-status")=="online"?o=m["\uc120\ud0dd\ud558\uc2e0 \uba64\ubc84\ub97c \ud0c8\ud1f4\uc2dc\ud0a4\uaca0\uc2b5\ub2c8\uae4c?"]:o=m["\uc120\ud0dd\ud558\uc2e0 \ud68c\uc6d0\uc758 \uac00\uc785\uc744 \uac70\ubd80\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],e.goConfirm(o,n.i18n(m["\ucd1d 0\uba85 \uc120\ud0dd\ub418\uc5c8\uc2b5\ub2c8\ub2e4."],"count",memberEl.size()),function(){e(form.serializeArray()).each(function(e,t){t.name=="userId"&&s.push(t.value)}),this.model=new l,this.model.set({id:i},{silent:!0}),this.model.save({userIds:s},{type:"DELETE",success:function(e,t){t.code=="200"&&(r._reloadTables(),p.render(i))},error:function(t,n){n.msg&&e.goAlert(n.msg),n.focus&&form.find('input[name="'+n.focus+'"]').focus()}})})},_reloadTables:function(){this.listEl.tables.fnClearTable()},renderToolbar:function(e){this.$el.find("#toolBar #memberTotalElements").html(e),this.$el.find(".tool_bar .custom_header").html(this.$el.find("#toolBar").html()),this.$el.find("#toolBar").remove()},getDelete:function(t){var n=e(t.currentTarget);this.$el.find(".active").removeClass("active"),n.addClass("active");var r=this.$el.find(".tab_menu").attr("data-id");a.render(r)},communityRemove:function(t){var r=this.$el.find(".tab_menu").attr("data-id"),i=this.$el.find("form[name=formCommunityDelete]"),s=i.find("textarea"),o=function(t,n){return e.goMessage(t),n&&n.focus().addClass("error"),!1};!e.goValidation.isCheckLength(1,255,s.val())||s.val()==m["\ucee4\ubba4\ub2c8\ud2f0 \ud3d0\uc1c4 \uacf5\uc9c0\ub97c \uc774\uacf3\uc5d0 \uc791\uc131\ud558\uc138\uc694"]?o(n.i18n(v["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:"1",arg2:"255"}),s):e.goCaution(m["\ucee4\ubba4\ub2c8\ud2f0\ub97c \ud328\uc1c4\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],"",function(){this.model=new f,this.model.setCommunityId(r),this.model.save({description:s.val()},{type:"DELETE",success:function(e,t){t.code=="200"&&n.router.navigate("community",!0)},error:function(t,n){n.msg&&e.goAlert(n.msg),n.focus&&i.find('input[name="'+n.focus+'"]').focus()}})})}});return{render:function(e,t,n){var r=new b;return r.render(e,t,n)}}});