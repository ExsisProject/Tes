define(["views/mobile/m_more_list","jquery","backbone","app","hgn!approval/templates/mobile/m_doclist_item_unit","i18n!nls/commons","i18n!approval/nls/approval"],function(e,t,n,r,i,s,o){return e.extend({initialize:function(e){this.options=e||{},this.total=this.options.total,this.listType=this.options.listType,this.useHold=this.options.useHold,this.useDocStatus=_.isBoolean(this.options.useDocStatus)?this.options.useDocStatus:!1,this.useOfficialConfirm=_.isBoolean(this.options.useOfficialConfirm)?this.options.useOfficialConfirm:!1,this.isCheckboxVisible=_.isBoolean(this.options.isCheckboxVisible)?this.options.isCheckboxVisible:!1,_.bindAll(this,"render")},tagName:"li",events:{"vclick .tit":"showUrl"},render:function(){this.model.setListType(this.listType);var e={id:this.model.getDocumentId(),isReceive:this.model.isReceive(),draftedAt:this.model.getDraftedAt(),receivedAt:this.model.getReceivedAt(),formName:this.model.get("formName"),title:this.model.get("title"),drafterId:this.model.get("drafterId"),drafterName:this.model.get("drafterName"),docStatus:this.model.getDocStatusName(),isNew:this.model.get("isNew"),receiveStatusClass:this.model.getReceiveStatusClass(),receiveStatusName:this.model.getReceiveStatusName(),docTypeName:this.model.getDocType(),statusClass:this.model.getDocStatusClass(),drafterPositionName:this.model.get("drafterPositionName"),receiverUserName:this.model.getReceiverNameWithPosition(),receiverUserPositionName:this.model.get("receiverUserPositionName"),deptFolderName:this.model.get("deptFolderName"),userFolderName:this.model.get("userFolderName"),completedAt:this.model.getCompletedAt(),docNum:this.model.get("docNum"),isEmergency:this.model.get("isEmergency"),showUrl:this.model.getShowUrl(),holdStatusName:this.model.getHoldStatusName(),holdStatusClass:this.model.getHoldStatusClass(),officialStateName:this.model.getOfficialStateName(),officialStateClass:this.model.getOfficialStateClass(),commentCount:this.model.get("commentCount"),replyCount:this.model.get("replyCount"),hasCommentReply:this.model.get("commentCount")||this.model.get("replyCount"),isReceiveWait:this.model.isReceiveWating(),isDelay:this.model.get("isDelay"),attachCount:this.model.get("attachCount"),hasAdditionalInfo:this.model.get("attachCount")||this.model.get("commentCount")||this.model.get("replyCount")};return this.$el.html(i({id:this.model.getDocumentId(),doc:e,deptId:this.deptId,lang:o,useDocStatus:this.useDocStatus,useOfficialConfirm:this.useOfficialConfirm,isCheckboxVisible:this.isCheckboxVisible,useOngoingState:!this.useHold||this.model.getHoldStatusClass()!="defer"?!0:!1})),this.$el.find("span.subject span").addClass(e.isNew?"read_no":""),this},showUrl:function(e){this.offset=r.config("mobileListOffset")||20,this.setSessionInfo(e),e.preventDefault(),e.stopPropagation();var n=t(e.currentTarget);if(_.isUndefined(n))return;var i=this.model.getShowUrl(),s=r.router.getUrl();sessionStorage.setItem(r.constant("navigator","BASE-URL"),s),sessionStorage.setItem(r.constant("navigator","KEYWORD"),""),sessionStorage.setItem(r.constant("navigator","TOTAL-COUNT"),this.total),r.router.navigate(i,!0)}})});