define(["jquery","underscore","backbone","app","views/circle","admin/views/appr_activity_box_setting","hgn!admin/templates/appr_config","i18n!nls/commons","i18n!approval/nls/approval","i18n!admin/nls/admin","i18n!works/nls/works","jquery.go-orgslide"],function(e,t,n,r,i,s,o,u,a,f,l){var c=n.Model.extend({url:function(){return"/ad/api/approval/admin/config"}}),h={"\uc804\uc790\uacb0\uc7ac \uc124\uc815":f["\uc804\uc790\uacb0\uc7ac \uc124\uc815"],"\uc804\uc790\uacb0\uc7ac \uc11c\uba85 \uc124\uc815":f["\uc804\uc790\uacb0\uc7ac \uc11c\uba85 \uc124\uc815"],"\uacb0\uc7ac\uce78 \ud45c\uae30 \ubc29\ubc95":a["\uacb0\uc7ac\uce78 \ud45c\uae30 \ubc29\ubc95"],"\uacb0\uc7ac\uce78 \ud45c\uae30 \ubc29\ubc95 \uc124\uba85":a["\uacb0\uc7ac\uce78 \ud45c\uae30 \ubc29\ubc95 \uc124\uba85"],"\uc9c1\uc704 \ub178\ucd9c":a["\uc9c1\uc704 \ub178\ucd9c"],"\uc9c1\ucc45 \ub178\ucd9c":a["\uc9c1\ucc45 \ub178\ucd9c"],"\uc804\uc0ac \ubb38\uc11c\ud568 \uc0ac\uc6a9":f["\uc804\uc0ac \ubb38\uc11c\ud568 \uc0ac\uc6a9"],"\uc804\uc0ac \ubb38\uc11c\ud568 \uc124\uba85":f["\uc804\uc0ac \ubb38\uc11c\ud568 \uc124\uba85"],"\uc0ac\uc6a9":u["\uc0ac\uc6a9"],"\uc0ac\uc6a9\ud558\uc9c0 \uc54a\uc74c":u["\uc0ac\uc6a9\ud558\uc9c0 \uc54a\uc74c"],"\uc804\uc790\uacb0\uc7ac \ube44\ubc00\ubc88\ud638 \uc124\uc815":f["\uc804\uc790\uacb0\uc7ac \ube44\ubc00\ubc88\ud638 \uc124\uc815"],"\uacb0\uc7ac\uc804\uc6a9 \ube44\ubc00\ubc88\ud638 \uc0ac\uc6a9":f["\uacb0\uc7ac\uc804\uc6a9 \ube44\ubc00\ubc88\ud638 \uc0ac\uc6a9"],"\uacb0\uc7ac\uc804\uc6a9 \ube44\ubc00\ubc88\ud638 \uc124\uba85":f["\uacb0\uc7ac\uc804\uc6a9 \ube44\ubc00\ubc88\ud638 \uc124\uba85"],"\uc11c\uba85\uc635\uc158":a["\uc11c\uba85 \uc635\uc158"],"\uc11c\uba85\uc744\uc0ac\uc6a9\ud558\uc9c0\uc54a\uc74c":a["\uc11c\uba85\uc744 \uc0ac\uc6a9\ud558\uc9c0 \uc54a\uc74c"],"\uc11c\uba85\uc744\uc0ac\uc6a9\ud568":a["\uc11c\uba85\uc744 \uc0ac\uc6a9\ud568"],"\uc0ac\uc6a9\uc790\uac00\uc790\uc2e0\uc758\uc778\uc7a5\uc11c\uba85\uc744\ubcc0\uacbd\ud560\uc218\uc788\uc74c":a["\uc0ac\uc6a9\uc790\uac00 \uc790\uc2e0\uc758 \uc11c\uba85\uc744 \ubcc0\uacbd\ud560 \uc218 \uc788\uc74c"],"\ud655\uc778 \uacb0\uc7ac \ud0c0\uc785":f["\ud655\uc778 \uacb0\uc7ac \ud0c0\uc785"],"\ucc38\uc870\uc790 \uc5f4\ub78c \uc635\uc158":f["\ucc38\uc870\uc790 \uc5f4\ub78c \uc635\uc158"],"\uacb0\uc7ac \uc9c4\ud589\uc911\uc5d0\ub3c4 \uc5f4\ub78c":f["\uacb0\uc7ac \uc9c4\ud589\uc911\uc5d0\ub3c4 \uc5f4\ub78c"],"\uacb0\uc7ac \uc644\ub8cc\ud6c4\uc5d0\ub9cc \uc5f4\ub78c":f["\uacb0\uc7ac \uc644\ub8cc\ud6c4\uc5d0\ub9cc \uc5f4\ub78c"],"\ucc38\uc870\uc790 \uc5f4\ub78c \uc635\uc158 \uc124\uba85":f["\ucc38\uc870\uc790 \uc5f4\ub78c \uc635\uc158 \uc124\uba85"],"\ud569\uc758 \uacb0\uc7ac \uc635\uc158":f["\ud569\uc758 \uacb0\uc7ac \uc635\uc158"],"\ubc18\ub300\ud558\uc5ec\ub3c4 \uacb0\uc7ac \uc9c4\ud589":f["\ubc18\ub300\ud558\uc5ec\ub3c4 \uacb0\uc7ac \uc9c4\ud589"],"\ubc18\ub300\ud558\uba74 \uacb0\uc7ac \uc911\ub2e8":f["\ubc18\ub300\ud558\uba74 \uacb0\uc7ac \uc911\ub2e8"],"\ud569\uc758 \uacb0\uc7ac \uc635\uc158 \uc124\uba85":f["\ud569\uc758 \uacb0\uc7ac \uc635\uc158 \uc124\uba85"],"\uba54\uc77c \ubc1c\uc1a1 \uae30\ub2a5":f["\uba54\uc77c \ubc1c\uc1a1 \uae30\ub2a5"],"\uba54\uc77c \ubc1c\uc1a1 \uae30\ub2a5 \uc124\uba85":f["\uba54\uc77c \ubc1c\uc1a1 \uae30\ub2a5 \uc124\uba85"],"\ud655\uc778 \uacb0\uc7ac \uc124\uba85":f["\ud655\uc778 \uacb0\uc7ac \uc124\uba85"],"\uc120\uacb0\uc7ac \uae30\ub2a5 \uc0ac\uc6a9":f["\uc120\uacb0\uc7ac \uae30\ub2a5 \uc0ac\uc6a9"],"\uc120\uacb0\uc7ac \uae30\ub2a5 \uc124\uba85":f["\uc120\uacb0\uc7ac \uae30\ub2a5 \uc124\uba85"],"1\uc778\uacb0\uc7ac \uc635\uc158":f["1\uc778\uacb0\uc7ac \uc635\uc158"],"1\uc778\uacb0\uc7ac \uc635\uc158 \uc124\uba85":f["1\uc778\uacb0\uc7ac \uc635\uc158 \uc124\uba85"],"\ube44\uacf5\uac1c \ubb38\uc11c \uc81c\ubaa9 \ud45c\uc2dc":a["\ube44\uacf5\uac1c \ubb38\uc11c \uc81c\ubaa9 \ud45c\uc2dc"],"\ube44\uacf5\uac1c \ubb38\uc11c \uc81c\ubaa9 \ud45c\uc2dc \uc124\uba85":a["\ube44\uacf5\uac1c \ubb38\uc11c \uc81c\ubaa9 \ud45c\uc2dc \uc124\uba85"],"\uc81c\ubaa9\ub9cc \ud45c\uc2dc":a["\uc81c\ubaa9\ub9cc \ud45c\uc2dc"],"\ube44\uacf5\uac1c \ubb38\uc11c\ub85c \ud45c\uc2dc":a["\ube44\uacf5\uac1c \ubb38\uc11c\ub85c \ud45c\uc2dc"],"\uc800\uc7a5":u["\uc800\uc7a5"],"\ucde8\uc18c":u["\ucde8\uc18c"],"\uc218\uc2e0\ucc98 \uc124\uc815":f["\uc218\uc2e0\ucc98 \uc124\uc815"],"\ubaa8\ub450 \uc124\uc815 \uac00\ub2a5":f["\ubaa8\ub450 \uc124\uc815 \uac00\ub2a5"],"\ubd80\uc11c\ub9cc \uc124\uc815 \uac00\ub2a5":f["\ubd80\uc11c\ub9cc \uc124\uc815 \uac00\ub2a5"],"\uc0ac\uc6a9\uc790\ub9cc \uc124\uc815 \uac00\ub2a5":f["\uc0ac\uc6a9\uc790\ub9cc \uc124\uc815 \uac00\ub2a5"],"\uc218\uc2e0\ucc98 \uc124\uc815 \uc124\uba85":f["\uc218\uc2e0\ucc98 \uc124\uc815 \uc124\uba85"],"\ud569\uc758 \uacb0\uc7ac \uc124\uba85":f["\ud569\uc758 \uacb0\uc7ac \uc124\uba85"],"\ubcf4\ub958 \uc635\uc158":f["\ubcf4\ub958 \uc635\uc158"],"\ubcf4\ub958 \uc635\uc158 \uc124\uba85":f["\ubcf4\ub958 \uc635\uc158 \uc124\uba85"],"\uacb0\uc7ac\uce78 \uc124\uc815":f["\uacb0\uc7ac\uce78 \uc124\uc815"],"\uacb0\uc7ac\uce78 \uc124\uc815 \uc124\uba85":f["\uacb0\uc7ac\uce78 \uc124\uc815 \uc124\uba85"],"\uacb0\uc7ac\ubb38\uc11c\ud68c\uc218":a["\uacb0\uc7ac\ubb38\uc11c\ud68c\uc218"],"\uacb0\uc7ac\ubb38\uc11c\ud68c\uc218\uc124\uba85":a["\uacb0\uc7ac\ubb38\uc11c\ud68c\uc218\uc124\uba85"],"\uc7ac\uae30\uc548\uc2dc\uae30\uacb0\uc7ac\uc790\ud1b5\uacfc\ud558\uae30":a["\uc7ac\uae30\uc548\uc2dc\uae30\uacb0\uc7ac\uc790\ud1b5\uacfc\ud558\uae30"],"\uc7ac\uae30\uc548\uc2dc\uae30\uacb0\uc7ac\uc790\ud1b5\uacfc\ud558\uae30\uc124\uba85":a["\uc7ac\uae30\uc548\uc2dc\uae30\uacb0\uc7ac\uc790\ud1b5\uacfc\ud558\uae30\uc124\uba85"],"\uc804\ub2e8\uacc4\ubc18\ub824\uc635\uc158":a["\uc804\ub2e8\uacc4\ubc18\ub824\uc635\uc158"],"\uc804\ub2e8\uacc4\ubc18\ub824\uc635\uc158\uc124\uba85":a["\uc804\ub2e8\uacc4\ubc18\ub824\uc635\uc158\uc124\uba85"],"\uc77c\uad04 \uacb0\uc7ac \uc635\uc158":a["\uc77c\uad04 \uacb0\uc7ac \uc635\uc158"],"\uc77c\uad04 \uc218\uc2e0 \ucc98\ub9ac \uc635\uc158":a["\uc77c\uad04 \uc218\uc2e0 \ucc98\ub9ac \uc635\uc158"],"\uc77c\uad04 \uc218\uc2e0\ucc98\ub9ac \uc124\uba85":a["\uc77c\uad04 \uc218\uc2e0\ucc98\ub9ac \uc124\uba85"],"\uc804\uccb4 \uc0ac\uc6a9":a["\uc804\uccb4 \uc0ac\uc6a9"],"\uc77c\ubd80\ub9cc \uc0ac\uc6a9":a["\uc77c\ubd80\ub9cc \uc0ac\uc6a9"],"\uacf5\ubb38 \ubc1c\uc1a1 \uc2b9\uc778 \uc124\uc815":a["\uacf5\ubb38 \ubc1c\uc1a1 \uc2b9\uc778 \uc124\uc815"],"\uacf5\ubb38 \ubc1c\uc1a1 \uc124\uba85":a["\uacf5\ubb38 \ubc1c\uc1a1 \uc124\uba85"],"\uac10\uc0ac \uacb0\uc7ac \uc635\uc158":a["\uac10\uc0ac \uacb0\uc7ac \uc635\uc158"],"\ubc18\ub824 \uae30\ub2a5 \uc81c\uacf5":a["\ubc18\ub824 \uae30\ub2a5 \uc81c\uacf5"],"\uc21c\ucc28\ud569\uc758":a["\uc21c\ucc28\ud569\uc758"],"\ubcd1\ub82c\ud569\uc758":a["\ubcd1\ub82c\ud569\uc758"],"\ubd80\uc11c\uc7a5\ub9cc \ubd80\uc11c\ud569\uc758 \uac00\ub2a5":f["\ubd80\uc11c\uc7a5\ub9cc \ubd80\uc11c\ud569\uc758 \uac00\ub2a5"],"\ubd80\uc11c\uc7a5 \ubd80\ubd80\uc11c\uc7a5\ub9cc \ubd80\uc11c\ud569\uc758 \uac00\ub2a5":f["\ubd80\uc11c\uc7a5 \ubd80\ubd80\uc11c\uc7a5\ub9cc \ubd80\uc11c\ud569\uc758 \uac00\ub2a5"],"\ubd80\uc11c\uc6d0 \uc804\uccb4 \ubd80\uc11c\ud569\uc758 \uac00\ub2a5":f["\ubd80\uc11c\uc6d0 \uc804\uccb4 \ubd80\uc11c\ud569\uc758 \uac00\ub2a5"],"\ubd80\uc11c\ud569\uc758 \uc124\uba851":f["\ubd80\uc11c\ud569\uc758 \uc124\uba851"],"\ubd80\uc11c\ud569\uc758 \uc124\uba852":f["\ubd80\uc11c\ud569\uc758 \uc124\uba852"],"\ubd80\uc11c\ud569\uc758 \uc0c1\uc138 \uc124\uba85":f["\ubd80\uc11c\ud569\uc758 \uc0c1\uc138 \uc124\uba85"],"\uae30\ubcf8\ud569\uc758\uc124\uc815 \uc124\uba85":f["\uae30\ubcf8\ud569\uc758\uc124\uc815 \uc124\uba85"],"\uae30\ubcf8":f["\uae30\ubcf8"],"\ud504\ub85c\uc138\uc2a4":l["\ud504\ub85c\uc138\uc2a4"],"\uae30\ud0c0":u["\uae30\ud0c0"],"\ubb38\uc11c \ub0b4\ubcf4\ub0b4\uae30 \ud615\uc2dd":f["\ubb38\uc11c \ub0b4\ubcf4\ub0b4\uae30 \ud615\uc2dd"],"pdf\ud615\uc2dd \uc0ac\uc6a9":f["pdf\ud615\uc2dd \uc0ac\uc6a9"],"HTML\ud615\uc2dd \uc0ac\uc6a9":f["HTML\ud615\uc2dd \uc0ac\uc6a9"],"\ubb38\uc11c \ub0b4\ubcf4\ub0b4\uae30 \ud615\uc2dd \uc124\uba85":f["\ubb38\uc11c \ub0b4\ubcf4\ub0b4\uae30 \ud615\uc2dd \uc124\uba85"],"pdf\ud615\uc2dd \uc124\uba85":f["pdf\ud615\uc2dd \uc124\uba85"],"\uacb0\uc7ac \uc9c0\uc5f0 \uc124\uc815":f["\uacb0\uc7ac \uc9c0\uc5f0 \uc124\uc815"],"\uacb0\uc7ac\uc9c0\uc5f0\ubc29\uc9c0\uc124\uba85":f["\uacb0\uc7ac\uc9c0\uc5f0\ubc29\uc9c0\uc124\uba85"],"\uc77c":f["\uc77c"],"\uacb0\uc7ac\uc9c0\uc5f0\uae30\uac04\uc124\uc815\uc124\uba85":f["\uacb0\uc7ac\uc9c0\uc5f0\uae30\uac04\uc124\uc815\uc124\uba85"],"\uacb0\uc7ac \uc9c0\uc5f0 \uc548\ub0b4 \uba54\uc77c \ubc1c\uc1a1 \uc77c\uc790":f["\uacb0\uc7ac \uc9c0\uc5f0 \uc548\ub0b4 \uba54\uc77c \ubc1c\uc1a1 \uc77c\uc790"],"\uc5c5\ub85c\ub4dc \ubd88\uac00 \ud30c\uc77c":f["\uc5c5\ub85c\ub4dc \ubd88\uac00 \ud30c\uc77c"],"\uc218\uc815":f["\uc218\uc815"],"\uc5c5\ub85c\ub4dc \uc81c\ud55c":f["\uc5c5\ub85c\ub4dc \uc81c\ud55c"]};return n.View.extend({el:"#layoutContent",delegateEvents:function(t){this.undelegateEvents(),n.View.prototype.delegateEvents.call(this,t),this.$el.on("click.sign","span#btn_save_appr_config",e.proxy(this.save,this)),this.$el.on("click.sign","span#btn_cancel_appr_config",e.proxy(this.cancel,this)),this.$el.on("click.sign","input[name=radioAgreement]",e.proxy(this.drawAgreement,this)),this.$el.on("click.sign","input[name=agreementAllowType]",e.proxy(this.drawDeptAgreement,this)),this.$el.on("click","#activityBoxSettingButton",e.proxy(this.onActivityBoxSettingClicked,this)),this.$el.on("click.sign","input[name=radioUseDraftWithdraw]",e.proxy(this.checkUseSkipApproval,this)),this.$el.on("click.sign","input[name=radioUseInspection]",e.proxy(this.checkUseInspection,this)),this.$el.on("click.sign","input[name=bulklyApprovalType]",e.proxy(this.drawBulklyApprovalTypePart,this)),this.$el.on("click.sign","input[name=bulklyReceiveType]",e.proxy(this.drawBulklyReceiveTypePart,this)),this.$el.on("click.sign","input[name=radioUseDelayRemind]",e.proxy(this.checkUsedelayRemind,this)),this.$el.on("click","span.btn_box[data-btntype='changeForm']",e.proxy(this.changeModifyForm,this)),this.$el.on("keyup #useDelayRemindTerm","input[data-type='delayRemindTermType']",e.proxy(this.delayRemindTermKeyupValidator,this)),this.$el.on("focusout","input[data-type='delayRemindTermType']",e.proxy(this.delayRemindTermValidator,this)),this.$el.on("keyup","input[name='excludeExtension']",e.proxy(this.keyUPExtensionValidator,this))},undelegateEvents:function(){return n.View.prototype.undelegateEvents.call(this),this.$el.off(".sign"),this},events:{"click div.tit":"_onClickFold"},initialize:function(){this.$el.off(),this.model=new c,this.model.fetch({async:!1,statusCode:{403:function(){r.util.error("403")},404:function(){r.util.error("404",{msgCode:"400-common"})},500:function(){r.util.error("500")}}})},render:function(){var e=this.model.get("activityBoxHeaderType"),t=this.model.get("receiveAllowType"),n=this.model.get("docConvertType"),r=this.model.get("agreementAllowType"),i=this.model.get("deptAgreementType"),s=this.model.get("bulklyApprovalOption"),u=this.model.get("bulklyReceiveOption"),a={id:this.model.get("id"),usePassword:this.model.get("usePassword"),useCompanyDocFolder:this.model.get("useCompanyDocFolder"),useCheckActivity:this.model.get("useCheckActivity"),referrerVisibleInProgress:this.model.get("referrerVisibleInProgress"),returnOnOpposition:this.model.get("returnOnOpposition"),useAdvApproval:this.model.get("useAdvApproval"),usePrivateDocTitleVisible:this.model.get("usePrivateDocTitleVisible"),useAgreement:this.model.get("useAgreement"),receiveAllowType:{isAll:function(){return t=="ALL"},isDept:function(){return t=="DEPARTMENT"},isUser:function(){return t=="USER"}},docConvertType:{pdfType:function(){return n=="PDF"},htmlType:function(){return n=="HTML"}},useHold:this.model.get("useHold"),usePreviousReturn:this.model.get("usePreviousReturn"),agreementAllowType:{isAll:function(){return r=="ALL"},isDept:function(){return r=="DEPARTMENT"},isUser:function(){return r=="USER"}},deptAgreementType:{isAll:function(){return i=="ALL"},isManager:function(){return i=="MANAGER"},isMaster:function(){return i=="MASTER"}},useDraftWithdraw:this.model.get("useDraftWithdraw"),useSkipApproval:this.model.get("useSkipApproval"),bulklyApprovalOption:{isAll:function(){return s=="ALL"},isPart:function(){return s=="PART"},isNone:function(){return s=="NONE"}},bulklyReceiveOption:{isAll:function(){return u=="ALL"},isPart:function(){return u=="PART"},isNone:function(){return u=="NONE"}},useOfficialConfirm:this.model.get("useOfficialConfirm"),useInspectionActivity:this.model.get("useInspectionActivity"),useInspectionReturn:this.model.get("useInspectionReturn"),isSeriesAsDefaultAgreementType:this.model.get("defaultAgreementType")=="SERIES",useDelayRemind:this.model.get("useDelayRemind"),delayRemindMin:this.model.get("delayRemindMin"),delayRemindMax:this.model.get("delayRemindMax"),isEmptyExcludeExtension:this.model.get("excludeExtension")==null||this.model.get("excludeExtension")=="",excludeExtension:this.model.get("excludeExtension")};return this.$el.empty(),this.$el.html(o({config:a,lang:h})),this.drawAgreement(),this.drawDeptAgreement(),this.drawBulklyApprovalTypePart(),this.drawBulklyReceiveTypePart(),this._renderBulklyApprovalTypePartView(),this._renderBulklyReceiveTypePartView(),this._renderDelayRemindTermView(),this.$el},_onClickFold:function(t){e(t.currentTarget).parent(".module_drop_head").siblings(".module_drop_body").toggle()},_renderBulklyApprovalTypePartView:function(){var e=["user","department","position","grade","duty","usergroup"];this.bulklyApprovalTypePartView=new i({selector:"#bulklyApprovalPartArea",isAdmin:!0,isWriter:!0,circleJSON:this.model.get("bulklyApprovalTarget"),nodeTypes:e,noSubDept:!1}),this.bulklyApprovalTypePartView.render()},_renderBulklyReceiveTypePartView:function(){var e=["user","department","position","grade","duty","usergroup"];this.bulklyReceiveTypePartView=new i({selector:"#bulklyReceivePartArea",isAdmin:!0,isWriter:!0,circleJSON:this.model.get("bulklyReceiveTarget"),nodeTypes:e,noSubDept:!1}),this.bulklyReceiveTypePartView.render()},_renderDelayRemindTermView:function(){var e=this.$('input:radio[name="radioUseDelayRemind"]:checked').val()=="true";this.$("#useDelayRemindTerm").toggle(e)},save:function(){var n=this,r=e("input[name=excludeExtension]"),i=r.val();if(!t.isUndefined(i)){if(!i.match(new RegExp("^[a-zA-Z0-9,]*$")))return r.html(f["\uc601\uc5b4, \uc27c\ud45c, \uc22b\uc790\ub9cc \uc785\ub825\uac00\ub2a5"]),r.focus(),!1;i=i.toLowerCase()}else i=e('span[data-formname="excludeExtension"]').attr("data-value");this.model.set({usePassword:e("input#usePassword").is(":checked")?!0:!1,useCompanyDocFolder:e("input#useCompanyDocFolder").is(":checked")?!0:!1,useCheckActivity:e("input#useCheckActivity").is(":checked")?!0:!1,referrerVisibleInProgress:e("input#referrerVisibleInProgress").is(":checked")?!0:!1,returnOnOpposition:e("input#returnOnOpposition").is(":checked")?!0:!1,useAdvApproval:e("input#useAdvApproval").is(":checked")?!0:!1,usePrivateDocTitleVisible:e("input#usePrivateDocTitleVisible").is(":checked")?!0:!1,useAgreement:e("input#useAgreement").is(":checked")?!0:!1,receiveAllowType:e("input:radio:checked[name=receiveAllowType]").val(),docConvertType:e("input:radio:checked[name=docConvertType]").val(),useHold:e("input#useHold").is(":checked")?!0:!1,agreementAllowType:e("input:radio:checked[name=agreementAllowType]").val(),deptAgreementType:e("input:radio:checked[name=deptAgreementType]").val(),defaultAgreementType:e("input:radio:checked[name=defaultAgreementType]").val(),useDraftWithdraw:e("input#useDraftWithdraw").is(":checked")?!0:!1,useSkipApproval:e("input#useSkipApproval").is(":checked")?!0:!1,usePreviousReturn:e("input#usePreviousReturn").is(":checked")?!0:!1,bulklyApprovalOption:e('input:radio[name="bulklyApprovalType"]:checked').val(),bulklyReceiveOption:e('input:radio[name="bulklyReceiveType"]:checked').val(),useOfficialConfirm:e("input#useOfficial").is(":checked")?!0:!1,useInspectionActivity:e("input#useInspectionActivity").is(":checked")?!0:!1,useInspectionReturn:e("input#useInspectionReturn").is(":checked")?!0:!1,useDelayRemind:e("input#useDelayRemind").is(":checked")?!0:!1,excludeExtension:i},{silent:!0}),this.model.get("useDelayRemind")&&(this.model.set("delayRemindMin",e('span[data-formname="delayRemindMin"]').attr("data-value")),this.model.set("delayRemindMax",e('span[data-formname="delayRemindMax"]').attr("data-value"))),this.model.set("bulklyApprovalTarget",{nodes:[]}),this.model.get("bulklyApprovalOption")=="PART"&&this.model.set("bulklyApprovalTarget",this.bulklyApprovalTypePartView.getData()),this.model.set("bulklyReceiveTarget",{nodes:[]}),this.model.get("bulklyReceiveOption")=="PART"&&this.model.set("bulklyReceiveTarget",this.bulklyReceiveTypePartView.getData()),this.model.save({},{type:"PUT",success:function(t,r){r.code=="200"&&(n.render(),e.goMessage(u["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]))},error:function(){return e.goError(u["\uc800\uc7a5\uc5d0 \uc2e4\ud328 \ud558\uc600\uc2b5\ub2c8\ub2e4."]),!1}})},cancel:function(){var t=this;e.goCaution(u["\ucde8\uc18c"],u["\ubcc0\uacbd\ud55c \ub0b4\uc6a9\uc744 \ucde8\uc18c\ud569\ub2c8\ub2e4."],function(){t.model=new c,t.model.fetch({async:!1}),t.render(),e.goMessage(u["\ucde8\uc18c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."])},u["\ud655\uc778"])},drawAgreement:function(){var e=this.$('input:radio[name="radioAgreement"]:checked').val()=="true";this.$("#oppositionOpt").toggle(e),this.$("#agreementArea").toggle(e),this.$("#defaultAgreementOption").toggle(e);if(this.model.get("useSystemAgreementAllowOption"))if(e){var t=this.$('input:radio[name="agreementAllowType"]:checked').val()!="USER";this.$("#deptAgreementOption").toggle(t)}else this.$("#deptAgreementOption").toggle(e)},drawDeptAgreement:function(){if(this.model.get("useSystemAgreementAllowOption")){var e=this.$('input:radio[name="agreementAllowType"]:checked').val(),t=e=="ALL"||e=="DEPARTMENT";this.$("#deptAgreementOption").toggle(t)}else this.$("#deptAgreementOption").toggle(!1)},drawBulklyApprovalTypePart:function(){var e=this.$('input:radio[name="bulklyApprovalType"]:checked').val()=="PART";this.$("#bulklyApprovalPartArea").toggle(e)},drawBulklyReceiveTypePart:function(){var e=this.$('input:radio[name="bulklyReceiveType"]:checked').val()=="PART";this.$("#bulklyReceivePartArea").toggle(e)},checkUseInspection:function(){var e=this.$('input:radio[name="radioUseInspection"]:checked').val()=="true";e||this.$("#useInspectionReturn").attr("checked",!1),this.$("#useInspectionReturnArea").toggle(e)},checkUseSkipApproval:function(){var e=this.$('input:radio[name="radioUseDraftWithdraw"]:checked').val()=="true";e||this.$("#useSkipApproval").attr("checked",!1),this.$("#useSkipApprovalArea").toggle(e)},checkUsedelayRemind:function(){var e=this.$('input:radio[name="radioUseDelayRemind"]:checked').val()=="true";this.$("#useDelayRemindTerm").toggle(e)},onActivityBoxSettingClicked:function(n){var r=function(n){var r=o.validateData();if(!t.isEmpty(r))return e.goMessage(r),!1;this.model.set(o.getData()),n.close()},i=e.goPopup({header:h["\uacb0\uc7ac\uce78 \uc124\uc815"],modal:!0,offset:e(n.currentTarget).offset(),pclass:"layer_normal layer_payroom_set",contents:"",buttons:[{btext:u["\ud655\uc778"],autoclose:!1,btype:"confirm",callback:e.proxy(r,this)},{btext:u["\ucde8\uc18c"],btype:"cancel"}]}),o=new s({el:i.find(".content"),configModel:this.model});o.render()},release:function(){this.$el.off(),this.$el.empty()},changeModifyForm:function(t){t.stopPropagation();var n=e(t.currentTarget).parent();n&&n.attr("data-formname")=="excludeExtension"?n.html(['<input type="input" name="',n.attr("data-formname"),'"id="',n.attr("data-formname"),'" class="input w_large" value="',n.attr("data-value"),'" />'].join("")).find("input").focusin():(n.children().toggle(),n.find("input").focus())},delayRemindTermKeyupValidator:function(t){t.stopPropagation();var n=e(t.currentTarget).parent(),r=t.currentTarget.id,i=n.parent().parent().find(".go_alert");r=="minDelayRemindDay"?i=n.parent().parent().find("#delayRemindMinAlert"):r=="maxDelayRemindDay"&&(i=n.parent().parent().find("#delayRemindMaxAlert")),i.html("");if(!(t.keyCode>=96&&t.keyCode<=105||t.keyCode>=48&&t.keyCode<=57||t.keyCode==46||t.keyCode==13||t.keyCode==8))return i.html(f["\uc22b\uc790\ub9cc \uc785\ub825\ud558\uc138\uc694."]),t.currentTarget.value="",!1},delayRemindTermValidator:function(t){var n=t.currentTarget.value,i=t.currentTarget.id,s=e(t.currentTarget).parent();if(i=="minDelayRemindDay"){var o=e('span[data-formname="delayRemindMax"]').attr("data-value"),u=s.parent().parent().find("#delayRemindMinAlert");if(n<1||n>29)return u.html(r.i18n(f["\uc785\ub825\uac12\uc740 0~0\uc774\uc5b4\uc57c \ud569\ub2c8\ub2e4."],{arg1:"1",arg2:"29"})),t.currentTarget.focus(),t.currentTarget.value="",!1;if(parseInt(n)>=parseInt(o))return u.html(f["\uae30\uc900\uc77c \uc785\ub825 \uc2dc \uc785\ub825\uac12\ubcf4\ub2e4 \uc791\uc740 \uc218\ub97c \uc785\ub825\ud558\uc138\uc694."]),t.currentTarget.focus(),t.currentTarget.value="",!1;s.attr("data-value",n)}if(i=="maxDelayRemindDay"){var a=e('span[data-formname="delayRemindMin"]').attr("data-value"),u=s.parent().parent().find("#delayRemindMaxAlert");if(n<2||n>30)return u.html(r.i18n(f["\uc785\ub825\uac12\uc740 0~0\uc774\uc5b4\uc57c \ud569\ub2c8\ub2e4."],{arg1:"2",arg2:"30"})),t.currentTarget.focus(),t.currentTarget.value="",!1;if(parseInt(n)<=parseInt(a))return u.html(f["\uae30\uc900\uc77c \uc785\ub825 \uc2dc \uc785\ub825\uac12\ubcf4\ub2e4 \ud070 \uc218\ub97c \uc785\ub825\ud558\uc138\uc694."]),t.currentTarget.focus(),t.currentTarget.value="",!1;s.attr("data-value",n)}},keyUPExtensionValidator:function(t){var n=t.currentTarget.value,r=e(t.currentTarget).parent(),i=r.parent().parent().find(".go_alert");i.html("");if(!n.match(new RegExp("^[a-zA-Z0-9,]*$")))return i.html(f["\uc601\uc5b4, \uc27c\ud45c, \uc22b\uc790\ub9cc \uc785\ub825\uac00\ub2a5"]),t.currentTarget.focus(),t.currentTarget.value="",!1}})});