define("community/views/mobile/m_admin",function(require){var e=require("backbone"),t=require("app"),n=require("hgn!board/templates/mobile/m_admin"),r=require("views/mobile/title_toolbar"),i=require("community/models/member_online"),s=require("community/models/member_remove"),o=require("i18n!community/nls/community"),u=require("i18n!nls/commons"),a=require("when"),f=require("community/models/community_member"),l=require("community/models/community_info"),c={"\uc2b9\uc778":o["\uc2b9\uc778"],"\uac70\uc808":o["\uac70\uc808"],"\uc815\uc0c1 \ucc98\ub9ac":u["\uc815\uc0c1 \ucc98\ub9ac\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]},h=e.View.extend({el:"#content",initialize:function(e){this.options=e,this.communityMemberModel||(this.communityMemberModel=new f({communityId:this.options.communityId,subType:this.options.subType,memberId:this.options.memberId})),this.noMoreApplicant=!1,this.unbindEvent(),this.bindEvent()},unbindEvent:function(){this.$el.off("click","#approval"),this.$el.off("click","#refusal")},bindEvent:function(){this.$el.on("click","#approval",$.proxy(this.communityApproval,this)),this.$el.on("click","#refusal",$.proxy(this.communityRefusal,this))},render:function(){this.communityMemberModel?this.communityMemberModel.toJSON().memberStatus!="WAIT"&&(this.noMoreApplicant=!0):this.noMoreApplicant=!0,this._initRender();var e={name:o["\uac00\uc785 \uc2b9\uc778 \ub300\uae30"],leftButton:!1,isIscroll:!1,isPrev:!1};return this.titleToolbarView=r,this.titleToolbarView.render(e),this},_initRender:function(){this.$el.html(n({lang:c,communityId:this.options.communityId,type:this.options.type,subType:this.options.subType,memberId:this.options.memberId,noMoreApplicant:this.noMoreApplicant,text:this.getCommunityApplyAllowText()}))},getCommunityApplyAllowText:function(){var e=this.communityMemberModel.toJSON(),n=this.communityInfoModel.toJSON();return t.i18n(o["{{arg1}} {{arg2}}\ub2d8\uc758<br><{{arg3}}><br>\ucee4\ubba4\ub2c8\ud2f0 \uac00\uc785 \uc2e0\uccad\uc744<br>\uc2b9\uc778\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],{arg1:e.name,arg2:e.position,arg3:n.name})},communityApproval:function(){if(confirm(o["\uc120\ud0dd\ud558\uc2e0 \ud68c\uc6d0\uc758 \uac00\uc785\uc744 \uc2b9\uc778\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"])){var e=this;this.model=new i,this.model.set({id:this.options.communityId,userIds:[this.options.memberId]},{silent:!0}),this.model.save({},{success:function(t,n){n.code=="200"&&(e.noMoreApplicant=!0,e.render())},error:function(e,t){t.msg&&$.goAlert(t.msg)}})}},communityRefusal:function(){if(confirm(o["\uc120\ud0dd\ud558\uc2e0 \ud68c\uc6d0\uc758 \uac00\uc785\uc744 \uac70\ubd80\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"])){var e=this;this.model=new s,this.model.set({id:this.options.communityId,userIds:[this.options.memberId]},{silent:!0}),this.model.save({},{type:"DELETE",success:function(t,n){n.code=="200"&&(e.noMoreApplicant=!0,e.render())},error:function(e,t){t.msg&&$.goAlert(t.msg)}})}},renderWithCommunityData:function(){$.when(this.communityInfoModel=l.read({communityId:this.communityId}),this.communityMemberModel.fetch()).done($.proxy(function(){this.render()},this))}});return h});