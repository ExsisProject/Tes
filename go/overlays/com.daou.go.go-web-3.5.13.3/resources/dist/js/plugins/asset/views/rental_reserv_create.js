define(function(require){var e=require("jquery"),t=require("underscore"),n=require("backbone"),r=require("when"),i=require("app"),s=require("calendar/libs/recurrence_parser"),o=require("asset/models/asset_manage"),u=require("asset/models/asset_admin"),a=require("asset/models/asset_user_create"),f=require("asset/collections/asset_admin"),l=require("asset/models/asset_reserv_calendar"),c=require("go-calendar"),h=require("calendar/helpers/recurrence_layer"),p=require("asset/views/loop_event"),d=require("hgn!asset/templates/rental_reserv_create"),v=require("asset/models/asset_item"),m=require("i18n!nls/commons"),g=require("i18n!calendar/nls/calendar"),y=require("i18n!asset/nls/asset");require("jquery.ui"),require("jquery.go-orgslide");var b={rent_date:y["\ub300\uc5ec\uc77c"],rent_user:y["\ub300\uc5ec\uc790"],reserv_date:y["\uc608\uc57d\uc77c"],reserv_user:y["\uc608\uc57d\uc790"],rent_change:y["\ubcc0\uacbd"],return_list:y["\ubaa9\ub85d\uc73c\ub85c \ub3cc\uc544\uac00\uae30"],reservation_cancel:y["\uc608\uc57d \ucde8\uc18c\ud558\uae30"],asset_return:y["\ubc18\ub0a9\ud558\uae30"],confirm:m["\ud655\uc778"],cancel:m["\ucde8\uc18c"],modify:m["\uc218\uc815"],alert_input:y["\ud544\uc218\ub4f1\ub85d\uc815\ubcf4\ub97c \uc785\ub825\ud558\uc138\uc694."],no_reservation:y["\uc9c0\ub09c \uc2dc\uac04\uc740 \uc608\uc57d\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],alert_no_reservation:m["\uc608\uc57d\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],alert_no_oneday:m["\uc608\uc57d\uc740 \ud558\ub8e8\ub9cc \uac00\ub2a5\ud569\ub2c8\ub2e4."],reservation_modify:y["\uc608\uc57d \uc218\uc815\ud558\uae30"],allday:y["\uc885\uc77c"],alert_duplicate_reservation:y["\uc608\uc57d\ud558\ub824\ub294 \uc2dc\uac04\ub300\uc5d0 \uc774\ubbf8 \uc608\uc57d\ub41c \uac74\uc774 \ud3ec\ud568\ub418\uc5b4\uc788\uc2b5\ub2c8\ub2e4."],date_over:y["1\uc77c\uc744 \ucd08\uacfc\ud558\ub294 \uc608\uc57d\uc77c\uc815\uc740 \ubc18\ubcf5\uc608\uc57d\uc744 \ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."],reserve_anonym:y["\uc775\uba85\uc608\uc57d"],use_anonym:m["\uc0ac\uc6a9"],"\ubc18\ubcf5":g["\ubc18\ubcf5"],"\uc218\uc815":m["\uc218\uc815"],"\uc0ad\uc81c":m["\uc0ad\uc81c"]},w=n.View.extend({isSaving:!1,events:{"focus input.w_max":"inputFocus","click #reservConfirm":"reservConfirm","click #reservCancel":"reservCancel","click a[data-btntype='returnList']":"returnList","click #rentalCancel":"rentalCancel","click #reservationCancel":"reservationDelete","click #btnUserOrg":"reservUser","click #reserveModify":"reserveModify","click #allday":"toggleCheck","click #repeat":"showHideRecurrenceSetupLayer","click #repeat-option-wrap .recur_delete":"removeRecurrence","click #repeat-option-wrap .recur_edit":"editRecurrence"},initialize:function(e){this.$el.off(),this.options=e||{},this.params=i.router.getSearch(),this.assetId=this.options.assetId,this.itemId=this.options.itemId,this.type=this.options.type,this.status=this.options.status,this.reservationId=this.options.reservationId,this.selectDate=this.options.selectDate,this.selectTime=this.options.selectTime,this.endTime=this.options.endTime,this.assetModel=new u,this.assetCreateModel=new a,this.assetItemModel=new v,this.assetManagableModel=new o,this.isManagable=!1,this.isPopup=this.options.isPopup,this.isRecurrence=!1,this.hasUnreservedDate=!1},render:function(){return r.promise(t.bind(function(e,n){this._loadAssetModel().then(t.bind(this._loadManagableModel,this)).then(t.bind(this._loadReserveCalendarModel,this)).then(t.bind(this._loadAssetCreateModel,this)).then(t.bind(this._loadAssetItemModel,this)).then(t.bind(function(){var n=f.getCollection({assetId:this.assetId,type:"reservation"});n.on("reset",t.bind(function(t){var n=this.makeTemplete({collection:t.toJSON(),type:this.type,status:this.status,useAnonym:this.params.useAnonym,allDay:this.params.allDay});this.$el.html(n),this.setData(),e()},this))},this)).otherwise(n)},this))},_loadAssetModel:function(){return r.promise(t.bind(function(e,t){this.assetModel.clear(),this.assetModel.set({assetId:this.assetId},{silent:!0}),this.assetModel.fetch({success:e,error:t})},this))},_loadAssetItemModel:function(){return r.promise(t.bind(function(e,t){this.assetItemModel.clear(),this.assetItemModel.set({assetId:this.assetId,itemId:this.itemId},{silent:!0}),this.assetItemModel.fetch({success:e,error:t})},this))},_loadManagableModel:function(){return r.promise(t.bind(function(e,n){this.assetManagableModel.clear(),this.assetManagableModel.set({assetId:this.assetId},{silent:!0}),this.assetManagableModel.fetch({success:t.bind(function(t){this.isManagable=t.get("managable"),e(t)},this),error:n})},this))},_loadReserveCalendarModel:function(){return this.reservationId?this.useCalendar=l.get(this.reservationId).get("data"):this.useCalendar=!1,r.resolve()},_loadAssetCreateModel:function(){return r.promise(t.bind(function(e,t){var n={assetId:this.assetId,itemId:this.itemId};this.assetCreateModel.clear(),this.status=="create"?n.type="title":this.reservationId?(n.type="reservationStatus",n.reservationId=this.reservationId):n.type="current",this.assetCreateModel.set(n,{silent:!0}),this.assetCreateModel.fetch({statusCode:{400:function(){i.util.error("404",{msgCode:"400-asset"})},403:function(){i.util.error("403",{msgCode:"400-asset"})},404:function(){i.util.error("404",{msgCode:"400-asset"})},500:function(){i.util.error("500",{msgCode:"400-asset"})}},success:e,error:t})},this))},setData:function(){var e=function(){};this.status=="create"?e=this._setDataForCreate:e=this._setDataForModify,e.call(this)},_setDataForCreate:function(){e("#anonymRow").show(),e("#userName").text(this.params.userName?this.params.userName:i.session("name")+" "+i.session("position")),e("#userId").attr("data-userid",this.params.userId?this.params.userId:i.session("id")),e("#name").text(this.assetCreateModel.get("name"));if(this.type=="rental")e("#date").text(i.util.basicDate3(i.util.now()));else{var t=i.util.formatDatetime(this.selectDate,null,"YYYY-MM-DD");e("#startDate").val(t),e("#endDate").val(t),e("#startDate").attr("data-prev",t),e("#endDate").attr("data-prev",t),e("#startTime").attr("data-prev",this.selectTime),e("#endTime").attr("data-prev",this.endTime),this.datepickerHelper=c.init({el:this.$el.find("#selectDate"),startDate:t,startTime:this.selectTime,endDate:t,endTime:this.endTime,lang:this._makeDatePickerLang(),changeEvent:e.proxy(this._dateChangeCallback,this)})}},_dateChangeCallback:function(t){if(e("#repeat").is(":checked")&&t.isDateDiff){e("#startDate").val(t.prevStartDate),e("#endDate").val(t.prevEndDate),this.datepickerHelper.updatePrevDate(t),e.goMessage(b.date_over);return}return this.showHideRecurrenceSetupLayer()},_isDateDifference:function(){return e("#startDate").val()!==e("#endDate").val()},_setDataForModify:function(){var n=this._isEditable();n?(e("#anonymRow").show(),e("#userName").text(this.assetCreateModel.get("user").name+" "+this.assetCreateModel.get("user").positionName)):this.assetCreateModel.get("useAnonym")||(e("#anonymRow").show(),e("#userName").text(this.assetCreateModel.get("user").name+" "+this.assetCreateModel.get("user").positionName)),e("#name").text(this.assetCreateModel.get("itemName"));var r=this.assetCreateModel.get("recurrence");t.isEmpty(r)?e("#repeat-option-wrap").hide():(this.recurrenceParser=new s,this.recurrenceParser.parse(this.assetCreateModel.get("recurrence")),e("#recurrence-text").text(this.recurrenceParser.humanize()),e("#repeat-option-wrap input[name=recurrence]").val(this.assetCreateModel.get("recurrence"))),e.each(this.assetCreateModel.get("properties"),function(t,r){e('tr[data-id="'+r.attributeId+'"]').find("input").val(r.content),n||e('tr[data-id="'+r.attributeId+'"]').find("input").attr("readonly",!0)});if(this.type=="rental")e("#date").text(i.util.basicDate3(this.assetCreateModel.get("createdAt"))),n&&e("#rentalCancel").show();else{var o=i.util.formatDatetime(this.assetCreateModel.get("groupStartTime")!=undefined?this.assetCreateModel.get("groupStartTime"):this.assetCreateModel.get("startTime"),null,"YYYY-MM-DD"),u=i.util.formatDatetime(this.assetCreateModel.get("groupEndTime")!=undefined?this.assetCreateModel.get("groupEndTime"):this.assetCreateModel.get("endTime"),null,"YYYY-MM-DD"),a=i.util.formatDatetime(this.assetCreateModel.get("groupStartTime")!=undefined?this.assetCreateModel.get("groupStartTime"):this.assetCreateModel.get("startTime"),null,"HH:mm"),f=i.util.formatDatetime(this.assetCreateModel.get("groupEndTime")!=undefined?this.assetCreateModel.get("groupEndTime"):this.assetCreateModel.get("endTime"),null,"HH:mm");n?(e("#reserveModify").show(),e("#reservationCancel").show(),e("#startDate").val(o),e("#endDate").val(u),e("#startTime").val(a).attr("selected","selected"),e("#endTime").val(f).attr("selected","selected"),e("#startDate").attr("data-prev",o),e("#endDate").attr("data-prev",u),e("#startTime").attr("data-prev",a),e("#endTime").attr("data-prev",f),this.datepickerHelper=c.init({el:this.$el.find("#selectDate"),startDate:o,startTime:a,endDate:u,endTime:f,lang:this._makeDatePickerLang()})):(e("#startDate").attr("disabled",!0),e("#endDate").attr("disabled",!0),e("#startTime").attr("disabled",!0),e("#endTime").attr("disabled",!0),e("#startDate").val(o),e("#endDate").val(u),e("#startTime").val(a),e("#endTime").val(f)),this.assetCreateModel.get("allday")&&(e("#allday").attr("checked","checked"),e("#startTime").hide(),e("#endTime").hide()),this.assetCreateModel.get("useAnonym")&&e("#useAnonym").prop("checked",!0)}},_makeDatePickerLang:function(){return{"\ub0b4 \uce98\ub9b0\ub354":g["\ub0b4 \uce98\ub9b0\ub354"],"\uc77c\uc815 \ub4f1\ub85d":g["\uc77c\uc815 \ub4f1\ub85d"],"\uc77c\uc815\uba85":g["\uc77c\uc815\uba85"],"\uc77c\uc2dc":g["\uc77c\uc2dc"],"\uc2dc\uac04":g["\uc2dc\uac04"],"\uc885\uc77c":g["\uc885\uc77c"],"\ud655\uc778":m["\ud655\uc778"],"\ucde8\uc18c":m["\ucde8\uc18c"],"\uc77c\uc815\uc0c1\uc138 \uc785\ub825":g["\uc77c\uc815\uc0c1\uc138 \uc785\ub825"],"\uae30\ubcf8 \uce98\ub9b0\ub354 \uc774\ub984":g["\uce98\ub9b0\ub354 \uae30\ubcf8\uc774\ub984"],"\uae30\ubcf8 \uce98\ub9b0\ub354 \ud45c\uc2dc":g["\uae30\ubcf8 \uce98\ub9b0\ub354 \ud45c\uc2dc"],"\ubd84":g["\ubd84"],"\uc804\uc0ac\uc77c\uc815":g["\uc804\uc0ac\uc77c\uc815"],"\uc54c\ub9bc\uba54\uc77c \ud655\uc778":g["\uc54c\ub9bc\uba54\uc77c \ud655\uc778"],"\uc77c\uc815\ub4f1\ub85d\uc5d0 \ub300\ud55c \uc54c\ub9bc\uba54\uc77c\uc744 \ubcf4\ub0b4\uc2dc\uaca0\uc2b5\ub2c8\uae4c?":g["\uc77c\uc815\ub4f1\ub85d\uc5d0 \ub300\ud55c \uc54c\ub9bc\uba54\uc77c\uc744 \ubcf4\ub0b4\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],"\ubcf4\ub0b4\uae30":m["\ubcf4\ub0b4\uae30"],"\ubcf4\ub0b4\uc9c0 \uc54a\uc74c":g["\ubcf4\ub0b4\uc9c0 \uc54a\uc74c"]}},makeTemplete:function(e){var n=e.collection,r=e.type,s=e.status,o=r=="rental"?!0:!1,u=s=="create"?!0:!1,a=s=="modify"?!0:!1,f,l=i.util.toMoment(new Date),c=l.format("YYYY-MM-DD"),h=l.format("HH:00"),p=this._isEditable(),v=!!this.isManagable,m=this.isPopup,g=!!this.assetModel.get("allowAnonym"),y=!!this.assetModel.get("alwaysAnonym"),w=t.isUndefined(e.useAnonym)?!!this.assetCreateModel.get("useAnonym"):e.useAnonym=="true",E=this.assetCreateModel.get("recurrence"),S=!0,x=!1;return this.status=="create"?(w=t.isUndefined(w)?g&&y:w,x=g):(g=g&&p,S=p||!w,x=p&&g,w=g&&w),f=d({dataset:n,lang:b,isCreate:u,isModify:a,isRental:o,prevDate:c,prevTime:h,useAnonym:w,isManagable:v,isEditable:p,isAllowAnonym:g,isAlwaysAnonym:y,isShowUserRow:S,isShowAnonymRow:x,isRecurrence:E,isPopup:m,allDay:e.allDay==="true"}),f},_isEditable:function(){var e=!1;return this.status==="create"?!0:(this.assetCreateModel&&this.assetCreateModel.get("user")&&(e=this.assetCreateModel.get("user").id==i.session("id")||this.isManagable),e)},inputFocus:function(t){e(t.currentTarget).removeClass().addClass("txt w_max enter")},inputBlur:function(t){e(t.currentTarget).removeClass().addClass("txt w_max")},returnList:function(){this.type=="reservation"?i.router.navigate("asset/"+this.assetId+"/item/"+this.itemId+"/weekly/reserve/"+i.util.toISO8601(i.util.toMoment(e("#startDate").val())),!0):i.router.navigate("asset/"+this.assetId+"/list/"+this.type,!0)},getData:function(){var t={};if(this.type=="reservation"){if(e("#allday").is(":checked")){var n=this.assetModel.attributes.availabilityDate.startTime,r=this.assetModel.attributes.availabilityDate.endTime;r=="2400"&&(r="2359"),e("#startTime").val(n.substring(0,2)+":"+n.substring(2,4)),e("#endTime").val(r.substring(0,2)+":"+r.substring(2,4))}var s=e("#startTime").val(),o=e("#endTime").val(),n=i.util.toISO8601(i.util.toMoment(e("#startDate").val()+" "+s,"YYYY-MM-DD HH:mm")),r=i.util.toISO8601(i.util.toMoment(e("#endDate").val()+" "+o,"YYYY-MM-DD HH:mm"));t.recurrence=e("#repeat-option-wrap input[name=recurrence]").val(),t.startTime=n,t.endTime=r}t.useAnonym=e("#useAnonym").is(":checked"),t.user={id:e("#userId").attr("data-userid")==""?this.assetCreateModel.get("user").id:e("#userId").attr("data-userid")};var u=[],a=e('tr[data-type="attribute"]');return a.each(function(){var t={};t.attributeId=e(this).attr("data-id"),t.content=e(this).find("input.txt").val(),u.push(t)}),t.properties=u,t.allday=e("#allday").is(":checked"),t},reservUser:function(t){var n=this.assetModel.get("owners"),r=[],s="";e.each(n,function(e,t){t.ownerShip=="MODERATOR"&&t.ownerType=="DomainCode"&&(r.push(t.ownerId),s="domaincode")}),e.goOrgSlide({type:s,desc:"",includeLoadIds:r,contextRoot:i.contextRoot,callback:function(t){e("#userId").attr("data-userid",t.id),e("#userName").html(t.displayName),e.goOrgSlide("close")},target:t}),e("div.layer_organogram").css("z-index","100")},_isValidTime:function(e,t){var n=this.assetModel.get("availabilityDate");if(n.startTime!=="0000"||n.endTime!=="2400"){var r="YYYY-MM-DDT"+n.startTime.substr(0,2)+":"+n.startTime.substr(2,2)+":ss.SSSZ",i="YYYY-MM-DDT"+n.endTime.substr(0,2)+":"+n.endTime.substr(2,2)+":ss.SSSZ",s=moment(e).format(r),o=moment(t).format(i);if(moment(e).isBefore(s)||moment(t).isAfter(o))return!1}return n.ableDays.charAt(moment(e).format("d"))==="0"?!1:n.ableDays.charAt(moment(t).format("d"))==="0"?!1:!0},reservConfirm:function(){this.hasUnreservedDate===!0?(_this=this,e.goConfirm(y["\uc608\uc57d \ub4f1\ub85d"],y["\ubc18\ubcf5 \uc608\uc57d \uc77c\uc815 \uc911\uc5d0 \uc774\ubbf8 \uc608\uc57d \uac74\uc774 \ud3ec\ud568\ub41c \uc77c\uc790\uac00 \uc788\uc2b5\ub2c8\ub2e4"],function(){_this.reservCreate(!0).done(e.proxy(function(){i.router.navigate("asset/"+_this.assetId+"/list/reservation",!0)},this))})):this.reservCreate(!0).done(e.proxy(function(){i.router.navigate("asset/"+this.assetId+"/list/reservation",!0)},this))},reservCancel:function(){i.router.navigate("asset/"+this.assetId+"/list/reservation",!0)},reservCreate:function(t){var n=e.Deferred();if(this.isSaving)return t?n.reject():!1;this.isSaving=!0;try{var r=this.getData();if(this.type=="reservation"){var s=e("#startDate").val(),o=e("#startTime").val();if(moment(s+" "+o).isBefore(moment().startOf("day")))throw new Error(b.no_reservation);if(!this._isValidTime(r.startTime,r.endTime))throw new Error(b.alert_no_reservation);if(r.startTime==r.endTime)throw new Error(b.alert_no_reservation)}e.each(e('tr[data-type="attribute"]'),function(){if(e.trim(e(this).find("input").val())=="")throw new Error(b.alert_input);if(e.trim(e(this).find("input").val()).length>255)throw e(this).find("input").focus(),new Error(i.i18n(m["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:0,arg2:255}))}),this.assetReservModel=new a,this.assetReservModel.clear(),this.assetReservModel.set({assetId:this.assetId,itemId:this.itemId,type:"reserve"})}catch(u){return this.isSaving=!1,e.goMessage(u.message),t?n.reject():!1}var f=e.proxy(function(){return this.assetReservModel.save(r,{success:e.proxy(function(){return this.isSaving=!1,!0},this),error:e.proxy(function(){return this.isSaving=!1,e.goMessage(b.alert_duplicate_reservation),!1},this),complete:e.proxy(function(){this.isSaving=!1},this)})},this);return t?f.call(this):(f.call(this),!0)},reserveModify:function(t){var n=this,r=this.getData();if(this._isRecurrence()){var s=new p(this.assetCreateModel,"update",r);s.render();return}if(this.type=="reservation"){var o=e("#startDate").val(),u=e("#startTime").val();if(moment(o+" "+u).isBefore(moment().startOf("day")))return e.goMessage(b.no_reservation),!1;if(r.startTime==r.endTime)return e.goMessage(b.alert_no_reservation),!1}var a=!1;e.each(e('tr[data-type="attribute"]'),function(){if(e.trim(e(this).find("input").val())=="")return e.goMessage(b.alert_input),a=!0,!1;if(e.trim(e(this).find("input").val()).length>255)return e.goMessage(i.i18n(m["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:0,arg2:255})),e(this).find("input").focus(),a=!0,!1});if(a)return!1;!n.useCalendar||i.util.basicDate3(r.startTime)==i.util.basicDate3(this.assetCreateModel.get("startTime"))&&i.util.basicDate3(r.endTime)==i.util.basicDate3(this.assetCreateModel.get("endTime"))?(r.disconnectionCalendar=!1,e.ajax({type:"PUT",data:JSON.stringify(r),dataType:"json",contentType:"application/json",url:i.config("contextRoot")+"api/asset/"+n.assetId+"/item/"+n.itemId+"/reserve/"+n.reservationId,success:function(t){e.goMessage(m["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),n.returnList()},error:function(t){e.goMessage(b.alert_duplicate_reservation)}})):e.goConfirm(y["\uc608\uc57d \uc2dc\uac04 \ubcc0\uacbd"],y["\uc608\uc57d \uc2dc\uac04 \ubcc0\uacbd \uc0c1\uc138"],function(){r.disconnectionCalendar=!0,e.ajax({type:"PUT",data:JSON.stringify(r),dataType:"json",contentType:"application/json",url:i.config("contextRoot")+"api/asset/"+n.assetId+"/item/"+n.itemId+"/reserve/"+n.reservationId,success:function(t){e.goMessage(m["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),n.returnList()},error:function(t){e.goMessage(b.alert_duplicate_reservation)}})}),t.stopImmediatePropagation()},rentalCancelAction:function(){var e=this,t={};t.id=this.assetId;var n=new a({assetId:this.assetId,itemId:this.itemId,type:"return"});n.save(t,{success:function(t,n){e.returnList()}})},rentalCancel:function(){var t=this;e.goConfirm(y["\uc774\uc6a9 \ubc18\ub0a9"],y["\uc774\uc6a9\uc744 \ubc18\ub0a9\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],function(){t.rentalCancelAction()})},updateItem:function(){var e=this,t=this.getData();t.id=this.assetId;var n=new a({assetId:this.assetId,itemId:this.itemId});n.save(t,{success:function(t,n){i.router.navigate("asset/"+e.assetId+"/admin/manage",!0)}})},reservationDeleteAction:function(){var t=this,n=i.contextRoot+"api/asset/item/reservation",r=[];r.push(this.reservationId),e.ajax(n,{type:"DELETE",dataType:"json",contentType:"application/json",data:JSON.stringify({ids:r}),success:function(){t.returnList()}})},reservationDelete:function(){if(this._isRecurrence()){var t=new p(this.assetCreateModel,"remove");t.render()}else{var n=this;e.goConfirm(y["\uc608\uc57d \ucde8\uc18c"],y["\uc608\uc57d\uc744 \ucde8\uc18c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],function(){n.reservationDeleteAction()})}},_isRecurrence:function(){var e=this.assetCreateModel.get("exclude"),n=this.assetCreateModel.get("recurrence");return!t.isEmpty(n)&&!e},toggleCheck:function(t){e(t.currentTarget).is(":checked")?(e("#startTime").hide(),e("#endTime").hide()):(e("#startTime").show(),e("#endTime").show())},getOffset:function(){var t=e("#repeat").offset();t.top=parseInt(t.top)+30;var n=parseInt(window.width),r=parseInt(jQuery(window).width());return parseInt(t.left)+n>r&&(t.left=parseInt(t.left)+jQuery(window).scrollLeft()-(parseInt(t.left)+n-r)),t},showHideRecurrenceSetupLayer:function(){if(this._isDateDifference()&&e("#repeat").is(":checked")){e.goMessage(b.date_over),this.cancelUpdateRecurrence();return}if(!e("#repeat").is(":checked")){this.cancelUpdateRecurrence();return}this.hasUnreservedDate=!1;var t=this.getOffset(),n=e("#repeat-option-wrap input[name=recurrence]").val(),r=new h(e("#startDate").val(),!1,n,this.day,this.assetItemModel);r.setConfirmCallback(this.updateRecurrenceText,this),r.setCancelCallback(this.cancelUpdateRecurrence,this),r.setCloseCallback(this.cancelUpdateRecurrence,this),r.render(t)},updateRecurrenceText:function(t,n,r){return e("#repeat-option-wrap").show(),e("#recurrence-text").text(n),e("#repeat-option-wrap input[name=recurrence]").val(t),e("#repeat-option-wrap input[name=recurrence]").trigger("change"),this.hasUnreservedDate=r,this},cancelUpdateRecurrence:function(){var t=e("#repeat");t.attr("checked",!1),t.trigger("change"),e("#repeat-option-wrap").hide()},removeRecurrence:function(){e("#repeat-option-wrap").hide(),e("#recurrence-text").text(""),e("#repeat-option-wrap input[name=recurrence]").val(""),this.cancelUpdateRecurrence()},editRecurrence:function(){this.showHideRecurrenceSetupLayer()}});return w});