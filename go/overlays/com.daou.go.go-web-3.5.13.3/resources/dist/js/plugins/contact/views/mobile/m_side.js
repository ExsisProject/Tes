define(function(require){function E(e){var t="";return window.sessionStorage?t=l.store.sessionStorage(e):t=l.store(e),t==undefined&&(t=!0),t}function S(e,t){return l.store(e,t,{type:window.sessionStorage?"sessionStorage":null})}var e=require("jquery"),t=require("backbone"),n=require("app"),r=require("contact/models/contact_side"),i=require("hgn!contact/templates/mobile/m_side_user"),s=require("hgn!contact/templates/mobile/m_side_dept"),o=require("hgn!contact/templates/mobile/m_side_company"),u=require("hgn!contact/templates/mobile/m_tree_menu"),a=require("contact/views/tree_menu"),f=require("contact/collections/company_group"),l=require("amplify"),c=require("app"),h=require("i18n!contact/nls/contact"),p=require("underscore"),d={USER:h["\uac1c\uc778 \uc8fc\uc18c\ub85d"],COMPANY:h["\uc804\uc0ac \uc8fc\uc18c\ub85d"],DEPARTMENT:h["\ubd80\uc11c \uc8fc\uc18c\ub85d"],contact:h["\uc8fc\uc18c\ub85d"],contact_all:h["\uc804\uccb4 \uc8fc\uc18c\ub85d"]},v={isCompany:function(e){return e=="COMPANY"},isUser:function(e){return e=="USER"},isDept:function(e){return e=="DEPARTMENT"}},m={USER:"personal",COMPANY:"company",DEPARTMENT:"dept"},g=t.View.extend({tagName:"section",className:"lnb",type:"USER",events:{"click span.contactTag":"moveLink"},initialize:function(e){this.collection=e.collection},render:function(){this.$el.html(i({lang:d,data:this.collection,hasContactCount:function(){return this.contactCount>0}}))},moveLink:function(t){var n=e(t.currentTarget),r=["contact",m[this.type]],i=n.closest("li.group").data("group-id");i&&r.push(i),c.router.navigate(r.join("/"),{trigger:!0,pushState:!0})}}),y=t.View.extend({tagName:"section",className:"lnb",type:"DEPARTMENT",events:{"click span.contactTag":"moveLink"},initialize:function(e){this.collection=e.collection},render:function(){this.$el.html(s({lang:d,data:this.collection.toJSON(),hasContactCount:function(){return this.contactCount>0}}))},moveLink:function(t){var n=e(t.currentTarget),r=n.closest("li.group").data("group-id"),i=["contact",m[this.type]];i.push(n.closest("li.org").data("dept-id")),r&&(i.push("group"),i.push(r)),c.router.navigate(i.join("/"),{trigger:!0,pushState:!0})}}),b=t.View.extend({tagName:"section",className:"lnb",type:"COMPANY",LOCAL_STORAGE_KEY:"-contact-folder-toggle",events:{"click a.btn_close":"toggleFolder","click a.subject":"moveLink"},initialize:function(e){this.collection=f.init(),this.collection.set(e.collection.toJSON())},render:function(){function i(t,r){var i,s=E(n.session("loginId")+t.id+t.getName()+this.LOCAL_STORAGE_KEY),o=p.isUndefined(s)?!1:!0;return i=e(this.renderBoardTreeMenuNode({nodeId:t.id,nodeType:"FOLDER",nodeValue:t.getName(),isAccessible:t.isReadable()?t.isReadable():!1,hasChild:t.hasChild(),close:!o,iconType:"folder",managable:!1,isWritable:!0})),i}this.$el.html(o({lang:d}));var t=this.collection.convertNodeTree(),r=this.$el.find("#company_side");t.each(e.proxy(function(e){var t=i.call(this,e,e.getChildren());r.append(t)},this))},renderChildrens:function(e){var t=e.attr("data-id"),n=f.getCollectionByParent(t),r=this._renderMenuTree(Number(t),n.toJSON(),undefined);e.parent().after(r.el)},toggleFolder:function(t){var r=e(t.currentTarget),i=r.parent().find("a.subject"),s=i.attr("data-id"),o=i.attr("title"),u=r.find("span.ic");r.hasClass("opened")||(this.renderChildrens(r.parent().find(".subject")),r.addClass("opened"));var a=u.hasClass("open");return S(n.session("loginId")+s+o+this.LOCAL_STORAGE_KEY,!a),a?(u.removeClass("open").addClass("close"),r.parent().next("ul").hide()):(u.removeClass("close").addClass("open"),r.parent().next("ul").show()),n.EventEmitter.trigger("common","layout:refreshSideScroll"),!1},renderBoardTreeMenuNode:function(){return u.apply(undefined,arguments)},_renderMenuTree:function(e,t,n){var r=new a({nodes:t,menuId:n,parentId:e,localStorageKey:this.LOCAL_STORAGE_KEY,isMobile:!0});return r.render(),r},moveLink:function(t){t.preventDefault();var r=e(t.currentTarget).closest("li").attr("data-id");if(r&&e(t.currentTarget).data("readable")){var i="contact/company/"+r;n.router.navigate(i,!0)}return!1}}),w=t.View.extend({STORE_KEY:{DEPARTMENT:n.session("loginId")+"-contact-department-toggle",COMPANY:n.session("loginId")+"-contact-company-toggle",USER:n.session("loginId")+"-contact-personal-toggle"},tagName:"article",events:{},initialize:function(){this.$el.off(),this.$el.css("min-height","100%")},render:function(){return this.packageName=this.options.packageName,this.setSideApp(),this._renderGroups(),this},_renderGroups:function(){function n(){var e=new g({collection:this.contactSide.get("personalGroups")});this.$el.append(e.el),e.render()}function r(){var e=this.contactSide.getDeptGroups();if(e.isEmpty())return;var t=new y({collection:e});this.$el.append(t.el),t.render()}function i(){var e=this.contactSide.getCompanyGroups();if(e.isEmpty())return;var t=new b({collection:e});this.$el.append(t.el),t.render()}var t={USER:e.proxy(n,this),DEPARTMENT:e.proxy(r,this),COMPANY:e.proxy(i,this)};this.contactSide.get("priority").priorityTypes.forEach(function(e){t[e]()})},moveContactGroup:function(t){var n=e(t.currentTarget),r=n.closest("section"),i=r.data("type"),s=n.closest("li.group").data("group-id"),o=["contact",m[i]];v.isDept(i)&&(o.push(n.closest("li.org").data("dept-id")),s&&o.push("group")),s&&o.push(s),c.router.navigate(o.join("/"),{trigger:!0,pushState:!0})},dataFetch:function(){var t=e.Deferred();return this.contactSide=r.read(),e.when(this.contactSide).done(function(){t.resolve()}),t},setSideApp:function(){e("body").data("sideApp",this.packageName)},getInitParam:function(){return this.contactSide.getInitMenu()},getContactListExposure:function(){return this.contactSide.getContactListExposure()}},{__instance__:null,create:function(e){return this.__instance__=new this.prototype.constructor({packageName:e}),this.__instance__}});return w});