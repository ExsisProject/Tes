define(function(require){var e=require("matrix/constants/matrix_event"),t=require("i18n!nls/commons"),n=require("i18n!asset/nls/asset"),r=require("backbone"),i=require("matrix"),s=require("asset/collections/reservations"),o=require("asset/collections/reservation_assets"),u=require("asset/collections/asset_item_list"),a=require("asset/views/rental_reserv_create");return r.View.extend({events:{"change #assets":"_onChangeAsset"},initialize:function(e){e=e||{},this.injectedAssetId=e.assetId,this.assetId=this.injectedAssetId||GO.util.store.get(GO.session("id")+"-last-asset"),this.assets=new o,this.assets.on("sync",this._onSyncAssets,this),this.assets.fetch(),this.assetItems=u.init(),this.assetItems.on("sync",this._onSyncAssetItems,this),this.reservations=new s},_onChangeAsset:function(){var e=this.$("#assets").val();this.asset=this.assets.get(e),this.assetId=e,GO.util.store.set(GO.session("id")+"-last-asset",e),this._getAssetItems()},_onSyncAssets:function(){var e=this.assetId;this.asset=e?this.assets.get(e)||this.assets.at(0):this.assets.at(0),this.asset&&(this._getAssetItems(),this.assetId=this.asset.id)},_getAssetItems:function(){this.assetItems.setAssetId(this.asset.id),this.assetItems.fetch({data:{page:"0",offset:"100"}})},_onSyncAssetItems:function(){this.reservations.setRows(this.assetItems.getItems()),this.reservations.setAssetId(this.asset.id),this.reservations.setFromDate(this.asset.getStartTime()),this._renderMatrix()},_renderMatrix:function(){var e=this._leftToolbarTemplate(),t=this.injectedAssetId?"":this._rightToolbarTemplate(),r=function(){var e=this.model,t=e.get("user")?e.get("user").name||"":"",n=!!e.get("useAnonym"),r=moment(e.get("startTime")).format("HH:mm"),i=moment(e.get("endTime")).format("HH:mm"),s=n?"":t,o=s+" "+r+" ~ "+i,u=this.model.get("otherCompanyReservation")?this.model.get("user").companyName+" "||"":"",a=_.map(e.get("properties"),function(e){return e.content}).join(", ");return{content:o,title:u+o+" "+a,otherCompanyReservation:!!this.model.get("otherCompanyReservation")}};this.matrixView=new i({matrix:{type:"day",gridUnit:"minutes",gridValue:"30",startTime:this.asset.getStartTime(),endTime:this.asset.getEndTime(),useGrid:!1,navigationInterval:"day",contentRenderer:r,useDrag:!0},leftToolbar:e,rightToolbar:t,emptyMessage:n["\uc774\uc6a9\uac00\ub2a5\ud55c \uc790\uc0b0\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],collection:this.reservations}),this._bindMatrixEvents(),this.$el.html(this.matrixView.el),this.$("#assets").val(this.asset.id)},_bindMatrixEvents:function(){this.matrixView.$el.on(e.ROW_MOUSE_DOWN,$.proxy(function(e,t){var r=moment(this.reservations.fromDate).day();this.asset.isAvailableDay(r)||($.goError(n["\uc608\uc57d\ud560 \uc218 \uc5c6\ub294 \uc694\uc77c\uc785\ub2c8\ub2e4."]),t.item.remove()),moment(t.column.attr("data-column-key")).isBefore(moment().startOf("day"))&&($.goError(n["\uc9c0\ub09c \uc2dc\uac04\uc740 \uc608\uc57d\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4."]),t.item.remove())},this)),this.matrixView.$el.on(e.ROW_MOUSE_UP,$.proxy(function(e,t){if(!t.item.$el.parents("body").length)return;if(!t.item.isValid())return;this._popupLayer(t)},this)),this.matrixView.$el.on(e.ITEM_CLICK,$.proxy(function(e,t){var n=t.target.data("model");if(!n.get("itemId")||!n.id)return;var r="asset/"+this.assetId+"/item/"+n.get("itemId")+"/status/reservation/"+n.id;GO.router.navigate(r,!0)},this)),this.matrixView.$el.on(e.ROW_HEAD_CLICK,$.proxy(function(e,t){var n=moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),r="asset/"+this.assetId+"/item/"+t.rowId+"/weekly/reserve/"+n;GO.router.navigate(r,!0)},this))},_isTurnOnRecurrenceOption:function(e){var t=!1,n=e.row.data().rowKey;for(var r in this.assetItems.models)if(this.assetItems.models[r].id==n){t=this.assetItems.models[r].attributes.useRecurrence;break}return this.asset.attributes.allowLoopReservation&&t},_popupLayer:function(e){var r=[];this._isTurnOnRecurrenceOption(e)&&r.push({btext:n["\uc608\uc57d\uc0c1\uc138 \ub4f1\ub85d"],btype:"confirm",autoclose:!1,callback:$.proxy(function(){var t=GO.util.toISO8601(GO.util.toMoment($("#startDate").val())),n=[];n.push("?useAnonym="+$("#useAnonym").is(":checked")),n.push("allDay="+$("#allday").is(":checked")),n.push("userId="+$("#userId").attr("data-userid")),n.push("userName="+$("#userName").text()),n=n.join("&"),GO.router.navigate("asset/"+this.assetId+"/item/"+e.row.attr("data-row-key")+"/create/reservation/"+t+"/"+$("#startTime").val()+"/"+$("#endTime").val()+n,!0)},this)}),r.push({btext:t["\ud655\uc778"],btype:"confirm",autoclose:!1,callback:$.proxy(function(){l.reservCreate(!0).done($.proxy(function(){this.matrixView.collection.fetch(),i.close()},this))},this)}),r.push({btext:t["\ucde8\uc18c"],btype:"normal",callback:$.proxy(function(){e.item.remove()},this)});var i=$.goPopup({header:n["\uc608\uc57d"],width:685,top:"40%",pclass:"layer_normal layer_temporary_save",modal:!0,buttons:r,closeCallback:function(){e.item.remove()}}),s=e.column.attr("data-column-key"),o=e.item.model,u=e.row.attr("data-row-key"),f=moment(o.get("endTime")).format("HH:mm"),l=new a({assetId:this.assetId,itemId:u,type:"reservation",selectDate:s,selectTime:moment(o.get("startTime")).format("HH:mm"),endTime:f=="00:00"?"23:59":f,status:"create",isPopup:!0});i.find("div.content").html(l.el),l.render().then(function(){i.reoffset()})},_leftToolbarTemplate:function(){return'<h1 class="s_title">'+n["\uc2dc\uac04\ub300\ubcc4 \uc608\uc57d \ud604\ud669"]+"</h1>"},_rightToolbarTemplate:function(){var e=this.assetId||(this.assets.length?this.assets.at(0).id:""),t=this.assets.map(function(t){var n=t.id==e?"selected":"";return'<option value="'+t.id+'" '+n+">"+t.get("name")+"</option>"},this),n=Hogan.compile(['<select id="assets">',t,"</select>"].join(""));return n.render()}})});