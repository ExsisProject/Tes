define(function(require){var e=require("app"),t=require("i18n!nls/commons"),n=require("i18n!admin/nls/admin"),r=require("hgn!admin/templates/mobile_access_block_config"),i=require("models/mobile_config"),s=require("admin/views/mobile_contact_list_exposure"),o={label_ok:t["\uc800\uc7a5"],label_cancel:t["\ucde8\uc18c"],label_not_use:n["\uc0ac\uc6a9\uc548\ud568"],label_use:t["\uc0ac\uc6a9"],label_attachment_download:n["\ucca8\ubd80\ud30c\uc77c \ub2e4\uc6b4\ub85c\ub4dc"],label_mam_title:n["\ubaa8\ubc14\uc77c \uc571 \uc811\uc18d\ucc28\ub2e8 \uc124\uc815"],label_app_access:n["\ubaa8\ubc14\uc77c \uc571 \uc811\uc18d\uae30\uae30 \uad00\ub9ac"],mam_desc:n["mam\uc124\uba85"],label_device:t["\uae30\uae30\uba85"],label_last_connect_time:t["\ub9c8\uc9c0\ub9c9 \uc811\uc18d\uc2dc\uac04"],label_deviceid:n.DeviceId,label_access_setting:t["\uc811\uc18d\uc124\uc815"],label_empty:n["\ub4f1\ub85d\ub41c \ubaa8\ubc14\uc77c \uae30\uae30 \uc815\ubcf4\uac00 \uc5c6\uc2b5\ub2c8\ub2e4."],label_search:t["\uac80\uc0c9"],label_delete:t["\uc0ad\uc81c"],label_email:t["\uc774\uba54\uc77c"],label_name:t["\uc774\ub984"],label_tooltip:n["mam\ud234\ud301"],alert_error:t["500 \uc624\ub958\ud398\uc774\uc9c0 \ud0c0\uc774\ud2c0"],noti_block:t["\uc811\uc18d\ucc28\ub2e8\uc54c\ub9bc"],noti_block_sub:t["\ucc28\ub2e8\uc54c\ub9bc\ubd80\uc81c"],noti_access:t["\uc811\uc18d\ud5c8\uc6a9\uc54c\ub9bc"],noti_access_sub:t["\ud5c8\uc6a9\uc54c\ub9bc\ubd80\uc81c"],noti_delete:t["\ub4f1\ub85d\uae30\uae30\uc0ad\uc81c"]},u=Backbone.Model.extend({initialize:function(e){this.id=e.id},url:function(){return GO.contextRoot+"ad/api/mobile/device/"+this.id}}),a=Backbone.Collection.extend({initialize:function(e){this.searchType=e.searchType||"",this.keyword=e.keyword||""},url:function(){return GO.contextRoot+"ad/api/mobile/device?searchType="+this.searchType+"&keyword="+this.keyword},model:u}),f=Backbone.View.extend({CLASS:{BLOCKED:"ic_off",ALLOWED:"ic_on"},initialize:function(){this.model=new i({adminContext:!0}),this.model.fetch({async:!1});var e={searchType:"user.name",keyword:"initialize"};this.deviceListCollection=new a(e)},events:{"click span#btn_ok":"_mamSave","click span#btn_cancel":"_mamCancel","click span.btn_search":"_search","keydown span.search_wrap input":"_searchKeyboardEvent"},render:function(){var e=this,t=this.model.toJSON();this.$el.html(r({lang:o,model:t})),this._showMobileDeviceRenderList(),this.mobileContactListExposureView=new s,this.mobileContactListExposureView.render()},_showMobileDeviceRenderList:function(e){var t=this;this.deviceListCollection.fetch(e).done($.proxy(this._deviceRenderList,this)).fail(function(e){$.goAlert(o.alert_error)}),this._bindDeviceListEvents()},_deviceRenderList:function(){this.$el.find("#device_list").html(this._deviceListTmp().render(this._makeListData()))},_deviceListTmp:function(){var e=[];return e.push("{{^deviceList}}"),e.push('<tr class="topMenu">'),e.push('		<td colspan="5">'),e.push('			<p class="data_null">'),e.push('				<span class="ic_data_type ic_no_data"></span>'),e.push('				<span class="txt">{{noAccessDevice}}</span>'),e.push("			</p>"),e.push("		</td>"),e.push("</tr>"),e.push("{{/deviceList}}"),e.push("{{#deviceList}}"),e.push('<tr class="topMenu" data-device-id={{id}}>'),e.push('		<td class="align_c" name="device">{{deviceName}}</td>'),e.push('		<td class="align_c" name="email">{{email}}</td>'),e.push('		<td class="align_c" name="contact">{{lastAccessTime}}</td>'),e.push('		<td class="align_c" name="address">{{deviceId}}</td>'),e.push('		<td class="align_c mam_toggle" name="toggle">'),e.push('			<span class="device_access_setting ic ic_on {{deviceAccessOnOff}}"></span>'),e.push("		</td>"),e.push('		<td class="align_c mam_delete" name="delete">'),e.push('			<span class="device_access_delete ic ic_delete" title="{{lang.delete}}"></span>'),e.push("		</td>"),e.push("</tr>"),e.push("{{/deviceList}}"),Hogan.compile(e.join("\n"))},_noticeTmp:function(e,t){var n=[];return n.push('<div class="content">'),n.push('			<p class="q">'+e+"</p>"),t&&n.push('		<p class="add">'+t+"</p>"),n.push("</div>"),Hogan.compile(n.join("\n"))},_makeListData:function(){var e={noAccessDevice:o.label_empty,deviceList:[]};return e.deviceList=this.deviceListCollection.map(function(e){return{id:e.get("id"),email:e.get("email"),deviceName:e.get("deviceLabel"),lastAccessTime:GO.util.basicDate3(e.get("lastConnected")),deviceId:e.get("deviceId"),deviceAccessOnOff:e.get("blocked")?this.CLASS.BLOCKED:this.CLASS.ALLOWED}},this),e},_bindDeviceListEvents:function(){this.$el.off("click","span.device_access_setting"),this.$el.off("click","span.device_access_delete"),this.$el.on("click","span.device_access_setting",$.proxy(this._onAccessSettingClicked,this)),this.$el.on("click","span.device_access_delete",$.proxy(this._onAccessDeleteClicked,this))},_onAccessSettingClicked:function(e){e.stopPropagation();var n=this,r=$(e.currentTarget),i=r.parents("tr").attr("data-device-id"),s=r.hasClass(this.CLASS.BLOCKED),u,a;s?(u=o.noti_access,a=o.noti_access_sub):(u=o.noti_block,a=o.noti_block_sub),this.notiPopup=$.goPopup({pclass:"layer_confim layer_colleage",modal:!0,width:"460px",closeIconVisible:!1,contents:this._noticeTmp(u,a).render(),buttons:[{btext:t["\ud655\uc778"],btype:"confirm",autoclose:!1,callback:function(){n._accessSettingProc(i,s)}},{btext:t["\ucde8\uc18c"],btype:"cancel"}]})},_accessSettingProc:function(e,t){var n=this,r=this.deviceListCollection.get(e);r.set("blocked",!t),r.save().done($.proxy(function(e){this.notiPopup.close(),this._deviceRenderList()},this))},_onAccessDeleteClicked:function(e){e.stopPropagation();var n=this,r=$(e.currentTarget).parents("tr").attr("data-device-id"),i=o.noti_delete;this.delPopup=$.goPopup({pclass:"layer_confim layer_colleage",modal:!0,width:"460px",closeIconVisible:!1,contents:this._noticeTmp(i).render(),buttons:[{btext:t["\ud655\uc778"],btype:"confirm",autoclose:!1,callback:function(){n._onAccessDeleteProc(r)}},{btext:t["\ucde8\uc18c"],btype:"cancel"}]})},_onAccessDeleteProc:function(e){var t=this.deviceListCollection.get(e);t.destroy().done($.proxy(function(e){this.delPopup.close(),this._deviceRenderList()},this))},_search:function(e){var t=this.$el.find('.search_wrap input[type="text"]'),n=t.val(),r={searchType:this.$el.find(".device_search select").val(),keyword:encodeURIComponent(n)};this.deviceListCollection=new a(r),this._showMobileDeviceRenderList()},_searchKeyboardEvent:function(e){e.keyCode==13&&this._search()},_mamSave:function(e){e.stopPropagation();var n=this,r={useAppManagement:$('form[name=formMAMConfig] input[type="radio"]:checked').val()};n.model.save(r,{success:function(e,r){r.code=="200"&&($.goMessage(t["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),n.render())},error:function(e,n){var r=JSON.parse(n.responseText);r.message!=null?$.goMessage(r.message):$.goMessage(t["\uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4."])}})},_mamCancel:function(e){e.stopPropagation();var n=this;$.goCaution(t["\ucde8\uc18c"],t["\ubcc0\uacbd\ud55c \ub0b4\uc6a9\uc744 \ucde8\uc18c\ud569\ub2c8\ub2e4."],function(){n.render(),$.goMessage(t["\ucde8\uc18c\ub418\uc5c8\uc2b5\ub2c8\ub2e4."])},t["\ud655\uc778"])}});return f});