define("works/components/doc_list/views/status_column",function(require){var e=require("i18n!nls/commons"),t=require("i18n!works/nls/works"),n=require("works/collections/actions"),r=require("works/models/action"),i=require("components/backdrop/backdrop"),s=Hogan.compile(['<div class="btn_submenu" data-stop-propagation>','<span class="state bgcolor{{statusColor}}" data-el-status backdrop-toggle="true">','<span class="txt" data-el-status-label>{{{statusLabel}}}</span> ','<span class="ic ic_drop_d"></span>',"</span>",'<div class="array_option opt_state" data-el-backdrop style="display: none;">','<ul data-el-actions class="array_type"></ul>',"</div>","</div>"].join(" "));return Backbone.View.extend({tagName:"div",initialize:function(){this.backdrop=new i,this.actions=new n([],{appletId:this.options.appletId,docId:this.options.docId}),this.listenTo(this.actions,"sync",this._onSyncActions),this.action=new r({},{appletId:this.options.appletId,docId:this.options.docId})},render:function(){return this.$el.html(s.render({statusColor:this.options.color,statusLabel:this.options.statusLabel})),this.backdrop.setBackdropElement(this.$("[data-el-backdrop]")),this.backdrop.linkBackdrop(this.$("[data-el-status]")),this.unbindEvent(),this.bindEvent(),this},unbindEvent:function(){this.$el.off("click","[data-el-status]"),this.$el.off("click","[data-action-id]")},bindEvent:function(){this.$el.on("click","[data-el-status]",$.proxy(this._onClickStatus,this)),this.$el.on("click","[data-action-id]",$.proxy(this._onClickAction,this))},_onClickStatus:function(){this.actions.fetch()},_onSyncActions:function(){this._renderActions()},_renderActions:function(){this.$("[data-el-actions]").empty(),this.actions.each(function(e){this.$("[data-el-actions]").append('<li data-action-id="'+e.get("id")+'"><span>'+e.get("name")+"</span></li>")},this),this.actions.length||this.$("[data-el-actions]").append("<li data-action-id><span>"+t["\ubcc0\uacbd \uac00\ub2a5\ud55c \uc0c1\ud0dc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"]+"</span></li>")},_onClickAction:function(t){var n=$(t.currentTarget),r=n.attr("data-action-id");if(!r){this.backdrop.toggle(!1),t.stopPropagation();return}this.action.setActionId(r),this.action.save({},{type:"PUT",success:_.bind(function(t){this._renderStatusLabel(t.get("status")),this.actions.fetch(),$.goMessage(e["\ubcc0\uacbd\ub418\uc5c8\uc2b5\ub2c8\ub2e4."]),this.backdrop.toggle(!1)},this)})},_renderStatusLabel:function(e){this.options.statusLabel=e.name,this.options.color=e.color,this.$("[data-el-status-label]").text(e.name),this.$("[data-el-status]").attr("class","state"),this.$("[data-el-status]").addClass("bgcolor"+e.color)}})});