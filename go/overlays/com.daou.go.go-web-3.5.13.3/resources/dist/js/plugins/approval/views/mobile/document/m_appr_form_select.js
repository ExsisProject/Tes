define(["jquery","backbone","app","views/mobile/header_toolbar","hgn!approval/templates/mobile/document/m_appr_form_select","i18n!nls/commons","i18n!approval/nls/approval"],function(e,t,n,r,i,s,o){var u=t.Collection.extend({url:function(){return"/api/approval/drafterdeptfolder"}}),a=t.Collection.extend({url:function(){return"/api/approval/apprform/tree/mobile"}}),f=t.View.extend({events:{"click #apprFormUl a":"_selectForm"},initialize:function(e){this.options=e||{},this.toolBarData=this.options.toolBarData,this.release(),this.formModel=new a,this.drafterDeptFolderCol=new u,this.formModel.bind("reset",this._renderFormList,this)},render:function(){var t=this;this.headerToolbarView=r,this.headerToolbarView.render(this.toolBarData);var i=e.Deferred();return n.util.preloader(i),e.when(this.formModel.fetch({reset:!0}),this.drafterDeptFolderCol.fetch({async:!1,success:function(e){if(e.length<1)return;t.drafterDeptFolderInfos=e.toJSON(),t.deptId=t.drafterDeptFolderInfos[0].deptId}})).done(e.proxy(function(){i.resolve(this)},this)),this},_renderFormList:function(e){this.$el.html(i({data:e.toJSON(),empty_msg:o["\ub4f1\ub85d\ub41c \uc591\uc2dd\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."]}))},_selectForm:function(t){if(!this.deptId){GO.util.toastMessage(o["\uc18c\uc18d\ub41c \ubd80\uc11c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"]);return}var n=e(t.currentTarget).attr("data-formid");GO.router.navigate("/approval/document/new/"+this.deptId+"/"+n,{trigger:!0})},release:function(){this.$el.off(),this.$el.empty()}});return f});