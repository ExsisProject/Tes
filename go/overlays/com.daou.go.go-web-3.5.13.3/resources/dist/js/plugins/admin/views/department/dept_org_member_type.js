(function(){define(["jquery","backbone","app","i18n!admin/nls/admin","i18n!nls/commons","jquery.go-sdk"],function(e,t,n,r,i){var s=null,o={save:i["\uc800\uc7a5"],cancel:i["\ucde8\uc18c"],none:r["\ubbf8\uc9c0\uc815"],MASTER:r["\ubd80\uc11c\uc7a5"],MODERATOR:r["\ubd80\ubd80\uc11c\uc7a5"],MEMBER:r["\ubd80\uc11c\uc6d0"]},u=t.View.extend({events:{"click .ic_edit_done":"saveType","click .ic_edit_cancel":"cancelType"},initialize:function(e){this.options=e||{},this.typeData=["MASTER","MODERATOR","MEMBER"],this.baseTpl=['<span class="table_editable" style="margin-top:-4px;margin-bottom:-5px">',"<select><options></options></select>&nbsp;",'<span class="btn_wrap"><span class="ic ic_edit_done" title="',o.save,'"></span><span style="margin-left:2px" class="ic ic_edit_cancel" title="',o.cancel,'"></span></span></span>'],this.$el.html(this.baseTpl.join(""))},render:function(){var t=this;return this.typeSelect=this.$el.find("select"),e.each(this.typeData,function(e,n){t.typeSelect.append('<option value="'+n+'">'+o[n]+"</option>")}),this.typeSelect.val(this.options.type),this},getBaseTag:function(e){var t=['<span class="btn_wrap btn_member_type table_editable" id="memType',this.options.memberId,'" data-id="',this.options.memberId,'" data-type="',e.type,'"><span class="txt">',o[e.type],'</span><span class="ic ic_select"></span></span>'];return t.join("")},cancelType:function(){this.$el.html(this.getBaseTag({type:this.options.type||"MEMBER"}))},saveType:function(){var t=this,n=[GO.contextRoot+"ad/api/deptmember",this.options.memberId,"type"],r=this.$el.find("select").val();e.go(n.join("/"),JSON.stringify({type:r}),{qryType:"PUT",contentType:"application/json",responseFn:function(e){e.code==200&&(e.data.type=="MASTER"?GO.EventEmitter.trigger("department","changed:memberType","MASTER"):t.$el.html(t.getBaseTag(e.data)))}})}});return u})}).call(this);