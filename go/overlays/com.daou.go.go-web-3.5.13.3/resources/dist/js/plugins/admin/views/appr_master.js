define(["jquery","underscore","backbone","app","approval/models/appr_master_list","hgn!admin/templates/appr_master","hgn!approval/templates/add_org_member","hgn!admin/templates/appr_admin_owners","hgn!admin/templates/appr_admin_owners_data","i18n!nls/commons","i18n!admin/nls/admin","i18n!approval/nls/approval","jquery.go-popup","jquery.go-orgslide","jquery.go-validation"],function(e,t,n,r,i,s,o,u,a,f,l,c){var h={"\uae30\ubcf8 \uc815\ubcf4":l["\uae30\ubcf8 \uc815\ubcf4"],"\uc6b4\uc601\uc790 \ucd94\uac00":l["\uc6b4\uc601\uc790 \ucd94\uac00"],"\uad00\ub9ac\uc790 \ucd94\uac00":l["\uad00\ub9ac\uc790 \ucd94\uac00"],"\uc800\uc7a5":f["\uc800\uc7a5"],"\uc804\uc0ac \ubb38\uc11c\ud568 \uc6b4\uc601\uc790 \uc124\uc815":l["\uc804\uc0ac \ubb38\uc11c\ud568 \uc6b4\uc601\uc790 \uc124\uc815"],"\uacb0\uc7ac\ubb38\uc11c \uad00\ub9ac\uc790 \uc124\uc815":l["\uacb0\uc7ac\ubb38\uc11c \uad00\ub9ac\uc790 \uc124\uc815"],"\uc804\uc0ac \uacf5\ubb38 \ubc1c\uc1a1 \uad00\ub9ac\uc790 \uc124\uc815":l["\uc804\uc0ac \uacf5\ubb38 \ubc1c\uc1a1 \uad00\ub9ac\uc790 \uc124\uc815"],"\uacb0\uc7ac\ubb38\uc11c \uc6b4\uc601\uc790":l["\uacb0\uc7ac\ubb38\uc11c \uc6b4\uc601\uc790"],"\uacb0\uc7ac\ubb38\uc11c \uad00\ub9ac\uc790":l["\uacb0\uc7ac\ubb38\uc11c \uad00\ub9ac\uc790"],"\uc804\uc0ac \uacf5\ubb38 \ubc1c\uc1a1 \uad00\ub9ac\uc790":l["\uc804\uc0ac \uacf5\ubb38 \ubc1c\uc1a1 \uad00\ub9ac\uc790"],"\uc804\uc0ac \ubb38\uc11c\ud568 \uc6b4\uc601\uc790":l["\uc804\uc0ac \ubb38\uc11c\ud568 \uc6b4\uc601\uc790"],"\ucde8\uc18c":f["\ucde8\uc18c"],"\uac10\uc0ac":l["\uac10\uc0ac"],user:l["\uc0ac\uc6a9\uc790"],"delete":f["\uc0ad\uc81c"],"\uc218\uc815\uad8c\ud55c":l["\uc218\uc815\uad8c\ud55c"],"\uc0ad\uc81c\uad8c\ud55c":l["\uc0ad\uc81c\uad8c\ud55c"],"\ucd94\uac00":l["\ucd94\uac00"]},p=n.View.extend({el:"#layoutContent",initialize:function(){t.bindAll(this,"render","saveMember"),this.model=new i({isAdmin:!0}),this.model.fetch({async:!1,statusCode:{403:function(){r.util.error("403")},404:function(){r.util.error("404",{msgCode:"400-common"})},500:function(){r.util.error("500")}}})},delegateEvents:function(t){this.undelegateEvents(),n.View.prototype.delegateEvents.call(this,t),this.$el.on("click.folderMaster","ul#addComDocMasterEl span.btn_wrap:has(span.ic_addlist)",e.proxy(this.showMember,this,"comdoc")),this.$el.on("click.folderMaster","#addDocMaster",e.proxy(this.showMember,this,"doc")),this.$el.on("click.folderMaster","ul#addOfficialDocMasterEl span.btn_wrap:has(span.ic_addlist)",e.proxy(this.showMember,this,"officialdoc")),this.$el.on("click.folderMaster","span.ic_del",e.proxy(this.deleteMember,this)),this.$el.on("click.folderMaster","#addDocMasterTable span.ic_basket",e.proxy(this._deleteDocMaster,this)),this.$el.on("click.folderMaster","span#btn_save_appr_master",e.proxy(this.saveMember,this)),this.$el.on("click.folderMaster","span#btn_cancel_appr_master",e.proxy(this.cancel,this))},undelegateEvents:function(){return n.View.prototype.undelegateEvents.call(this),this.$el.off(".folderMaster"),this},render:function(){var e=this;this.$el.html(s({lang:h,companyFolderMasterList:e.model.getCompanyFolderMasters().toJSON(),officialDocMasterList:e.model.getOfficialDocMasters().toJSON()})),this._renderDocMaster()},showMember:function(t,n){var i,s;t=="doc"?(i=h["\uad00\ub9ac\uc790 \ucd94\uac00"],s=e.proxy(function(e){this._addMasterTableType(e)},this)):t=="comdoc"?(i=h["\uc6b4\uc601\uc790 \ucd94\uac00"],s=e.proxy(function(t){this.addMaster(e("#addComDocMasterEl"),t)},this)):(i=h["\uc804\uc0ac \uacf5\ubb38 \ubc1c\uc1a1 \uad00\ub9ac\uc790"],s=e.proxy(function(t){this.addMaster(e("#addOfficialDocMasterEl"),t)},this)),e.goOrgSlide({header:i,desc:"",callback:s,target:n,isAdmin:!0,contextRoot:r.contextRoot})},_renderDocMaster:function(){var n=this,r=e("#addDocMasterTable .in_table");t.each(n.model.get("apprDocMasters"),function(t){t&&!r.find('tr[data-id="'+t.userId+'"]').length&&(r.length||(e("#addDocMasterTable").append(u({lang:h})),r=e("#addDocMasterTable .in_table")),r.find("tbody").append(a(e.extend({id:t.userId,name:t.userName,position:t.userPosition,writeChecked:t.actions.indexOf("write")!=-1?!0:!1,removeChecked:t.actions.indexOf("remove")!=-1?!0:!1},{lang:h}))))})},addMaster:function(t,n){n&&!t.find('li[data-id="'+n.id+'"]').length?t.find("li.creat").before(o(e.extend(n,{lang:h}))):e.goMessage(c["\uc774\ubbf8 \uc120\ud0dd\ub418\uc5c8\uc2b5\ub2c8\ub2e4."])},_addMasterTableType:function(t){var n=this,r=e("#addDocMasterTable .in_table");t&&!r.find('tr[data-id="'+t.id+'"]').length&&(r.length||(e("#addDocMasterTable").append(u({lang:h})),r=e("#addDocMasterTable .in_table")),r.find("tbody").append(a(e.extend(t,{lang:h}))))},deleteMember:function(t){e(t.currentTarget).parents("li").remove()},_deleteDocMaster:function(t){var n=this,r=this.$el.find("#addDocMasterTable>table"),i=e(r[0]),s=r.find("tbody");s.find('tr[data-id="'+e(t.currentTarget).attr("data-id")+'"]').remove(),i.find("tbody>tr").length||i.remove()},saveMember:function(){var n=this;if(n.ajaxLoading)return;n.ajaxLoading=!0,n.model.clearCompanyFolderMasters(),e("#addComDocMasterEl input[name=memberId]").each(function(e,t){n.model.addCompanyFolderMaster(t.value,"read")}),n.model.clearDocMasters();var s=e("#addDocMasterTable").find("tbody tr");t.each(s,function(t){var r="read";e(t).find("[name=writePermission]").is(":checked")&&(r+=",write"),e(t).find("[name=removePermission]").is(":checked")&&(r+=",remove");var i=e(t).attr("data-id");n.model.addDocMaster(i,r)}),n.model.clearOfficialDocMasters(),e("#addOfficialDocMasterEl input[name=memberId]").each(function(e,t){n.model.addOfficialDocMaster(t.value,"read")}),this.model.save({},{type:"POST",success:function(t,s){s.code=="200"&&(e.goMessage(f["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),n.model=new i({isAdmin:!0}),n.model.fetch({async:!1,statusCode:{403:function(){r.util.error("403")},404:function(){r.util.error("404",{msgCode:"400-common"})},500:function(){r.util.error("500")}}}),n.render())},error:function(t,n){var r=JSON.parse(n.responseText);return r.message?(e.goError(r.message),!1):(e.goError(f["\uc800\uc7a5\uc5d0 \uc2e4\ud328 \ud558\uc600\uc2b5\ub2c8\ub2e4."]),!1)},complete:function(){n.ajaxLoading=!1}})},cancel:function(){var t=this;e.goCaution(f["\ucde8\uc18c"],f["\ubcc0\uacbd\ud55c \ub0b4\uc6a9\uc744 \ucde8\uc18c\ud569\ub2c8\ub2e4."],function(){t.model.fetch({async:!1}),t.render(),e.goMessage(f["\ucde8\uc18c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."])},f["\ud655\uc778"])}});return p});