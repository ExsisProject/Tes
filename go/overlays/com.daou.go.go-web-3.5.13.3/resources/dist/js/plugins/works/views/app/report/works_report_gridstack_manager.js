define("works/views/app/report/works_report_gridstack_manager",function(require){function g(e){return e.target.cloneNode(!0)}function y(e,t){grids[t].float(!grids[t].getFloat()),e.innerHTML="float: "+grids[t].getFloat()}function b(e){grids[e].compact()}var e=require("backbone"),t=require("gridstack"),n=require("when");require("gridstack.grid-jquery-ui");var r=require("works/components/formbuilder/core/cid_generator"),i=require("works/views/app/report/report_item_chart"),s=require("works/views/app/report/report_item_table"),o=require("works/views/app/report/report_item_card"),u=require("works/views/app/report/report_item_text"),a=require("works/views/app/report/report_item_image"),f=require("hgn!works/components/report/template/report_item"),l=Hogan.compile(['<div class="edit_tool" style="z-index:10;"><ul class="tool_btn">\n<li btn-setting-wrap><a btn-setting><span class="icx2 ic_edit_set"></span></a></li>\n<li btn-filter-wrap><a btn-filter><span class="icx2 ic_edit_filter"></span></a></li>\n<li btn-copy-wrap><a btn-copy><span class="icx2 ic_edit_copy"></span></a></li>\n<li btn-delete-wrap><a btn-delete><span class="icx2 ic_edit_del"></span></a></li>\n</ul></div>'].join("")),c=require("works/components/report/constants"),h=require("i18n!nls/commons"),p=require("i18n!admin/nls/admin"),d=!1,v={save:h["\uc800\uc7a5"],cancel:h["\ucde8\uc18c"],confirm:h["\ud655\uc778"],copy:h["\ubcf5\uc0ac"]},m=function(){return n.promise.apply(this,arguments)};return e.View.extend({events:{"click a[btn-setting]":"_settingItem","click a[btn-filter]":"_filterItem","click a[btn-copy]":"_copyItem","click a[btn-delete]":"_deleteItem"},initialize:function(e){d=!1,this.$el=$(".works-report-content"),this.appletId=e.appletId,this.reportId=e.reportId,this.fields=e.fields,this.report=e.report,this.chartFields=this.fields.getChartFields(),this.numberFields=this.fields.getNumberFields(),this.chartOption=this.chartFields.length?{fieldCid:this.chartFields.at(0).get("cid")}:{},this.reportItemViews=[],this.grid=t.init({resizable:{handles:"se, sw, ne, nw"},"float":!0,minRow:20,removable:"#trash",removeTimeout:100,acceptWidgets:".newWidget",disableOneColumnMode:!0}),this.saveDisabled()},render:function(){this.createEvent(this.grid),_.forEach(this.report.getTemplate(),function(e){this.grid.addWidget(f({type:e.type,rid:e.rid,height:e.height,width:e.width,minWidth:c.ITEM_SIZE.minWidth[e.type],minHeight:c.ITEM_SIZE.minHeight[e.type]}),e.x,e.y,e.width,e.height,!1,c.ITEM_SIZE.minWidth[e.type],c.ITEM_SIZE.maxWidth[e.type],c.ITEM_SIZE.minHeight[e.type],c.ITEM_SIZE.maxHeight[e.type],e.rid)},this),_.forEach(this.report.getReportItems(),function(e){var t=this.getReportItem(e.rid);t.toObject(e),t.render()},this)},disable:function(){d=!0,$("#works-report-content").addClass("shared_report"),this.grid.disable()},enable:function(){d=!1,this.grid.enable()},save:function(){var e=this,t=_.map(this.reportItemViews,function(t){return{reportId:e.reportId,rid:t.rid,data:JSON.stringify(t.toJSON())}}),n=[];return _.each(this.grid.getAll(),function(t){if(!e.getReportItem(t.rid))return;n.push({rid:t.rid,type:t.type,width:t.width,height:t.height,x:t.x,y:t.y})}),this.report.set("reportItems",t),this.report.set("template",JSON.stringify(n)),this.report.save().done(function(t){return $.goSlideMessage(h["\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),e.saveDisabled(),new m(function(e,n){e(t.data)})}).fail(function(e){e.responseJSON&&e.responseJSON.message?$.goMessage(e.responseJSON.message):$.goMessage(p["\uc694\uccad \ucc98\ub9ac \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud558\uc600\uc2b5\ub2c8\ub2e4."])})},getReportItem:function(e){return _.find(this.reportItemViews,function(t){return e==t.getRid()})},_deleteReportItem:function(e){this.reportItemViews=_.filter(this.reportItemViews,function(t){return e!=t.getRid()})},isCurrentLayer:function(e){return $(e.currentTarget).hasClass("on")},_createChartItemView:function(e,t){return new i({rid:t,appletId:this.appletId,fields:this.fields,contentWrap:e})},_createCardItemView:function(e,t){return new o({appletId:this.appletId,rid:t,fields:this.fields,contentWrap:e})},_createTextItemView:function(e,t){return new u({rid:t,appletId:this.appletId,contentWrap:e})},_createTableItemView:function(e,t){return new s({rid:t,appletId:this.appletId,fields:this.fields,contentWrap:e})},_createImageItemView:function(e,t){return new a({rid:t,appletId:this.appletId,reportId:this.reportId,contentWrap:e})},_settingItem:function(e){e.stopPropagation();var t=$(e.target).closest(".report_card").attr("item-rid"),n=this.getReportItem(t);$.goPopup({pclass:"layer_normal layer_report_card go_renew",headerHtml:"",width:c.TYPE_TEXT==n.type?700:380,contents:n.getSettingTmpl(),buttons:this.generatePopupButtons(n),openCallback:function(){"text"==n.type&&n.renderAfter()}}),c.TYPE_CARD==n.type&&$("#gpopupLayer").css("width","")},_filterItem:function(e){e.stopPropagation();var t=$(e.target).closest(".report_card").attr("item-rid"),n=this.getReportItem(t),r=this;$.goPopup({pclass:"layer_normal layer_reader go_renew",headerHtml:"",buttons:[{btype:"confirm",btext:v.save,autoclose:!1,callback:function(e){n.reload_filter()&&(r.saveEnabled(),e.close())}}]}),$("#popupContent").append(n.getFilterTmpl())},_copyItem:function(e){var t=$(e.target).closest(".report_card").attr("item-rid"),n=this.getReportItem(t),i=$("div[item-rid="+n.rid+"]"),s=r.generate(),o=n.type,u=i.attr("data-gs-width"),a=i.attr("data-gs-height");this.grid.addWidget(f({rid:s,type:o,minWidth:c.ITEM_SIZE.minWidth[o],minHeight:c.ITEM_SIZE.minHeight[o],width:u,height:a}),null,null,u,a,c.ITEM_SIZE.minWidth[o],c.ITEM_SIZE.maxWidth[o],c.ITEM_SIZE.minWidth[o],c.ITEM_SIZE.minHeight[o],c.ITEM_SIZE.maxHeight[o],null);var l=this.getReportItem(s);l.toObject({data:n.toJSON()}),l.render(),this.saveEnabled()},_deleteItem:function(){var e=$(event.target).closest(".report_card").attr("item-rid"),t=this;$.goConfirm(h["\uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?"],"",function(){t.grid.removeNode(e),t._deleteReportItem(e),t.grid._triggerEvent("change"),t.reportItemViews.length<1&&t.$("#wrap_report_null").show()})},createItemView:function(e,t){var n=$(e.el).children().get(1),r=$(e.el).attr("item-rid");if(c.TYPE_CHART==t)return this._createChartItemView(n,r);if(c.TYPE_CARD==t)return this._createCardItemView(n,r);if(c.TYPE_TEXT==t)return $(e.el).find("[btn-filter-wrap]").hide(),this._createTextItemView(n,r);if(c.TYPE_IMAGE==t)return $(e.el).find("[btn-filter-wrap]").hide(),this._createImageItemView(n,r);if(c.TYPE_DATA==t)return this._createTableItemView(n,r)},createEvent:function(e){var t=this;e.on("change",function(e,n,r){t.saveEnabled(),_.forEach(n,function(e){if(c.TYPE_CARD===e.type){var n=t.getReportItem(e.rid);n.autoResize()}})},t),e.on("added",function(e,n,r){this.$("#wrap_report_null").hide(),_.forEach(n,function(e){var n=$(e.el);n.addClass("report_card"),n.prepend(l.render());var r=n.attr("grid-type"),i=t.createItemView(e,r);if(!i)return;$(e.el).attr("item-rid")||i.render(),e.rid=i.getRid(),e.type=r,n.attr("item-rid",i.getRid()),n.children(".edit_tool").hide(),n.css("position",""),t.addWidgetClickEvent(e.el),t.reportItemViews.push(i)},t)}),$(".newWidget").draggable({revert:"invalid",scroll:!1,appendTo:"body",helper:"clone"})},_initBackdrop:function(e){this.backdropToggleEl=$(e.target).closest(".newWidget"),$(this.backdropToggleEl).find(".edit_tool").show(),$(this.backdropToggleEl).addClass("card_edit"),$(document).on("backdrop."+this.cid,$.proxy(function(e){if($(e.relatedTarget).closest(this.backdropToggleEl).length>0)return;this._clearBackdrop()},this))},_clearBackdrop:function(){$(this.backdropToggleEl).find(".edit_tool").hide(),$(this.backdropToggleEl).removeClass("card_edit"),$(document).off("backdrop."+this.cid)},addWidgetClickEvent:function(e){var t=this;e.onclick=function(e,n,r){if(d)return;if($(this).find(".edit_tool").is(":visible"))return;t._clearBackdrop(),t._initBackdrop(e)}},generatePopupButtons:function(e){var t=this,n=[{btype:"confirm",btext:v.save,autoclose:!1,callback:function(n){e.reload_setting()&&(t.saveEnabled(),n.close())}}];if("text"==e.type){var r={btype:"cancel",btext:v.cancel,callback:function(e){t.saveEnabled(),e.close()}};n.push(r)}return n},addItem:function(e){var t=r.generate(),n=c.ITEM_SIZE.width[e],i=c.ITEM_SIZE.height[e],s=this._getDocBottomHeight(n);this.grid.addWidget(f({type:e,rid:t,height:i,width:n,minWidth:c.ITEM_SIZE.minWidth[e],minHeight:c.ITEM_SIZE.minHeight[e]}),0,s,n,i,!1,c.ITEM_SIZE.minWidth[e],c.ITEM_SIZE.maxWidth[e],c.ITEM_SIZE.minHeight[e],c.ITEM_SIZE.maxHeight[e],t);var o=this.getReportItem(t);o.render(),$(window).scrollTop(70+s*50),this.saveEnabled()},_getDocBottomHeight:function(e){var t=this,n=_.max(this.grid.getAll(),function(n){return t.getReportItem(n.rid)?!e||e<=n.x?0:n.y+n.height:0});return n.height+n.y},saveDisabled:function(){this.isChanged=!1,$("a[el-save]").css("background","#ddd")},saveEnabled:function(){this.isChanged=!0,$("a[el-save]").css("background","")},isSaveDisabled:function(){return!this.isChanged}})});