define("approval/models/document",["backbone","app"],function(e,t){function o(){u.call(this,"document"),u.call(this,"docInfo"),u.call(this,"apprFlow"),u.call(this,"actionCheck"),u.call(this,"approvalAction")}function u(t,n){var r=this.get(t),i=this,s=this[t+"Model"];if(s&&s instanceof e.Model)s.attributes=r;else{var o=e.Model.extend(_.extend(n||{},{set:function(n,s,o){e.Model.prototype.set.apply(this,arguments),_.isObject(n)?(o=s,_.each(n,function(e,t){r[t]=e})):r[n]=s,i.set(t,r,o)}}));this[t+"Model"]=new o(r)}}function a(){_.each(r,function(e,t){_.isFunction(e)&&(e=_.bind(e,this)),this.Permission[t]=e},this)}function f(){_.each(i,function(e,t){_.isFunction(e)&&(e=_.bind(e,this)),this.Request[t]=e},this)}function l(e,t){typeof t=="undefined"&&(t=!1);if(e.constructor===Array)return Array.prototype.slice.call(e);var n=new Object;for(var r in e)n[r]=typeof e[r]=="object"&&t?l(e[r]):e[r];return n}var n={create:"CREATE",tempsave:"TEMPSAVE",progress:"INPROGRESS",complete:"COMPLETE",returned:"RETURN",received:"RECEIVED"},r=function(){function e(){if(!this.isActivityUser())return!1;switch(this.getDocStatus()){case n.create:case n.tempsave:if(!this.isDrafter())return!1;break;case n.progress:if(!this.isWaitingUser()||!this.getActionCheck("isActivityEditable"))return!1;break;case n.complete:case n.returned:return!1}return!0}return{canUseApprLine:function(){return!0},canEditApprLine:function(){if(!this.isActivityUser())return!1;switch(this.getDocStatus()){case n.create:case n.tempsave:break;case n.progress:if(!this.isWaitingUser()||!this.getActionCheck("isActivityEditable"))return!1;break;case n.complete:case n.returned:return!1;case n.received:if(!this.isReceiver())return!1;break;default:return!1}return!0},canUseRefererList:function(){return this.getActionCheck("referenceActive")},canEditRefererList:function(){if(!this.isActivityUser())return!1;if(!this.getActionCheck("referrerEditable"))return!1;switch(this.getDocStatus()){case n.create:case n.tempsave:break;case n.progress:if(!this.isWaitingUser())return!1;break;case n.complete:case n.returned:return!1;case n.received:if(!this.isReceiver())return!1;break;default:return!1}return!0},canUseReceiverList:function(){return this.isReceptionDocument()?!1:this.getActionCheck("receptionActive")},canEditReceiverList:function(){if(!this.isActivityUser())return!1;if(this.isReceptionDocument())return!1;if(!this.getActionCheck("receiverEditable"))return!1;switch(this.getDocStatus()){case n.create:case n.tempsave:break;case n.progress:if(!this.isWaitingUser())return!1;break;case n.complete:break;case n.returned:return!1;case n.received:return!1;default:return!1}return!0},canUseReaderList:function(){if(this.getDocStatus()===n.returned)return!1;var e=this.type==="docmaster"||this.type==="formadmin",t=this.docInfoModel.get("docReadingReaders")==undefined?0:this.docInfoModel.get("docReadingReaders").length;return this.getActionCheck("readerActive")||e&&t>0},canEditReaderList:function(){if(!this.getActionCheck("readerActive"))return!1;switch(this.getDocStatus()){case n.progress:if(!this.isWaitingUser())return!1;break;case n.create:case n.tempsave:case n.received:case n.complete:if(!this.isReferrer()&&!this.isActivityUser())return!1;break;case n.returned:return!1;default:return!1}return!0},canUseOfficialDocList:function(){return this.isReceptionDocument()?!1:this.getActionCheck("officialDocumentSendable")},canEditOfficialDocList:function(){if(this.isReceptionDocument())return!1;if(!this.getActionCheck("officialDocumentSendable"))return!1;if(!this.isActivityUser())return!1;switch(this.getDocStatus()){case n.create:case n.tempsave:break;case n.progress:if(!this.isWaitingUser())return!1;break;case n.complete:break;case n.returned:return!1;case n.received:return!1;default:return!1}return!0}}}(),i=function(){return{updateDocMetainfo:function(e,n){var r=_.extend({},n||{},{url:[t.config("contextRoot")+"api/approval/document",this.docId,"metainfo"].join("/"),type:"PUT"});return this.save(e||{},r)}}}(),s=e.Model.extend({documentModel:null,docInfoModel:null,apprFlowModel:null,documentVersionList:[],dpprFlowVersionList:[],actionCheckModel:null,apprActionModel:null,Permission:{},Request:{},initialize:function(e,t){t=t||{},t.docId&&(this.docId=t.docId),_.isBoolean(t.isAdmin)&&(this.isAdmin=isAdmin),o.call(this),a.call(this),f.call(this),this.on("sync",function(){o.call(this)})},url:function(){return this.isAdmin?["/api/approval/manage/document",this.docId].join("/"):["/api/approval/document",this.docId].join("/")},clone:function(){return new this.constructor(l(this.attributes,!0),{docId:this.docId,isAdmin:this.isAdmin})},getDocStatus:function(){return this.documentModel.get("docStatus")},getActionCheck:function(e){return this.actionCheckModel.get(e)||!1},isDrafter:function(){return this.documentModel.get("drafterId")===t.session("id")},isReceiver:function(){return this.getActionCheck("isReceiver")},isReferrer:function(){return this.getActionCheck("isDocReferrer")},isReader:function(){return this.getActionCheck("isReadingReader")},isActivityUser:function(){return this.getActionCheck("isActivityUser")},isWaitingUser:function(){return this.getActionCheck("isApprovalWaitingUser")||this.getActionCheck("isCheckWaitingUser")||this.getActionCheck("isAgreementWaitingUser")||this.getActionCheck("isInspectionWaitingUser")},isReceptionDocument:function(){return this.get("document").isReceptionDocument||!1},isStatusComplete:function(){return this.getDocStatus()===n.complete},isStatusReturned:function(){return this.getDocStatus()===n.returned},isStatusCreated:function(){return this.getDocStatus()===n.create},isStatusTempSaved:function(){return this.getDocStatus()===n.tempsave},isStatusReceived:function(){return this.getDocStatus()===n.received},isStatusProgress:function(){return this.getDocStatus()===n.progress},getReceiveAllowType:function(){return this.getActionCheck("receiveAllowType")},isNotInprogressDoc:function(){var e=this.get("document").docType,t=this.isStatusCreated(),n=this.isStatusTempSaved();return e&&(t||n)},isReceivedReceptionDoc:function(){return this.isReceptionDocument()&&this.isStatusReceived()},availableUpdateDocMetaInfo:function(e){return e=="DOCUMENT"&&!this.isNotInprogressDoc()||this.isReceivedReceptionDoc()}},{DOC_STATUS:n,create:function(e){return new s(null,{docId:e})}});return s});