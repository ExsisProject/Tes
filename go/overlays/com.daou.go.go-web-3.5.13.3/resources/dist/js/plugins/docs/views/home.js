define("docs/views/home",function(require){var e=require("backbone"),t=require("docs/models/docs_doc_item"),n=require("hgn!docs/templates/home"),r=require("docs/views/side"),i=require("docs/views/base_docs"),s=require("docs/views/docslist/docs_todo_list"),o=require("docs/views/docslist/base_docs_list"),u=require("components/backdrop/backdrop"),a=require("i18n!nls/commons"),f=require("i18n!docs/nls/docs"),l={"\uc2b9\uc778\ub300\uae30\ubb38\uc11c":f["\uc2b9\uc778 \ub300\uae30 \ubb38\uc11c"],"\ub4f1\ub85d\ub300\uae30\ubb38\uc11c":f["\ub4f1\ub85d \ub300\uae30 \ubb38\uc11c"],"\ucd5c\uadfc\uc5f4\ub78c\ubb38\uc11c":f["\ucd5c\uadfc \uc5f4\ub78c \ubb38\uc11c"],"\uc2b9\uc778\ub300\uae30\ubb38\uc11c\uc124\uba85":f["\uc2b9\uc778\ub300\uae30 \ubb38\uc11c \ud648"],"\ub4f1\ub85d\ub300\uae30\ubb38\uc11c\uc124\uba85":f["\ub4f1\ub85d\ub300\uae30 \ubb38\uc11c \ud648"],"\ucd5c\uadfc\uc5f4\ub78c\ubb38\uc11c\uc124\uba85":f["\ucd5c\uadfc\uc5f4\ub78c \ubb38\uc11c \ud648"]};return i.extend({events:{"click #home_register_waiting_doclist .btn-toggle-desc":"_toggleRegisterWaitingDesc","click #home_recent_viewed_doclist .btn-toggle-desc":"_toggleRecentViewedDesc"},initialize:function(e){i.prototype.initialize.apply(this,arguments)},render:function(){return i.prototype.render.apply(this,arguments),this.$el.html(n({lang:l})),this._renderTodoList(),this._renderWaitingList(),this._renderRecentList(),this},_renderTodoList:function(){var e=new s({folderType:"approvewaiting"});this.$el.find("#home_approval_waiting_doclist").find(".dashboard_box").append(e.render().el)},_renderWaitingList:function(){var n={"\ub4f1\ub85d\uc694\uccad\uc77c":f["\ub4f1\ub85d \uc694\uccad\uc77c"],"\uc81c\ubaa9":f["\uc81c\ubaa9"],"\ub4f1\ub85d\uc790":f["\ub4f1\ub85d\uc790"],"\uc0c1\ud0dc":f["\uc0c1\ud0dc"],"\ubb38\uc11c\uc704\uce58":f["\uc704\uce58"],"\ubb38\uc11c\ubc88\ud638":f["\ubb38\uc11c\ubc88\ud638"],count:6},r=e.Collection.extend({model:t,initialize:function(e){this.folderType=e.folderType},url:function(){return"/api/docs/folder/registwaiting?offset=5"}}),i=new o({collection:new r({folderType:"registwaiting"}),columns:n});this.$el.find("#home_register_waiting_doclist").find("div.dataTables_wrapper").append(i.render().el)},_renderRecentList:function(){var n={"\ub4f1\ub85d\uc77c":a["\ub4f1\ub85d\uc77c"],"\uc81c\ubaa9":f["\uc81c\ubaa9"],"\ub4f1\ub85d\uc790":f["\ub4f1\ub85d\uc790"],"\ubb38\uc11c\uc704\uce58":f["\uc704\uce58"],"\ubb38\uc11c\ubc88\ud638":f["\ubb38\uc11c\ubc88\ud638"],count:5},r=e.Collection.extend({model:t,initialize:function(e){this.folderType=e.folderType},url:function(){return"/api/docs/folder/latestread?offset=10"}}),i=new o({collection:new r({folderType:"latestread"}),columns:n});this.$el.find("#home_recent_viewed_doclist").find("div.dataTables_wrapper").append(i.render().el)},_renderSide:function(e){this.sideView=new r({}),e.getSideElement().empty().append(this.sideView.el),this.sideView.render()},_toggleRegisterWaitingDesc:function(e){this.registerWaitingDescBackdropView||(this.registerWaitingDescBackdropView=this._bindBackdrop($(e.currentTarget)))},_toggleRecentViewedDesc:function(e){this.recentViewedDescBackdropView||(this.recentViewedDescBackdropView=this._bindBackdrop($(e.currentTarget)))},_bindBackdrop:function(e){var t=new u;return t.backdropToggleEl=e.find(".tooltip-desc"),t.linkBackdrop(e),t}})});