define("admin/views/layout/sitemap",function(require){var e=require("jquery"),t=require("backbone"),n=require("app"),r=require("admin/models/layout/mail_admin_base"),i=require("hgn!admin/templates/layout/sitemap"),s=require("admin/collections/recently_menus"),o=require("i18n!admin/nls/admin");return require("jquery.go-popup"),t.View.extend({events:{"click ._favorite":"changeFavorite","click ._menuitem":"movePage","change #session_time_select":"changedSessionTime","change #graph_select":"changedGraph","change #lang_select":"changedLang"},initialize:function(e){this.sideMenuCollection=e,this.sideMenuCollection.initFavorite(),this.session=GO.session(),this.adminBase=new r,this.recentlyMenus=new s,this.recentlyMenus.fetch({async:!1})},tpl:function(e){var t="";if(!e.accessible||!e.view)return"";if(e.maxDepth-e.depth===0)return t='<li><span class="action _favorite" name="mykey"><ins class="ic_adm ic_star off"></ins></span> <span class="txt _menuitem" name="mykey" title="labelKey"><a >labelKey</a></span></li>',e.favorite&&(t=t.replace("off","")),t.replace("labelKey",e.labelKey).replace("labelKey",e.labelKey).replace("mykey",e.getMenuKey()).replace("mykey",e.getMenuKey());if(e.depth===1){t='<h3><span class="menu_tit">labelKey</span><span class="num">childLength</span></h3><ul class="menu_list">',t=t.replace("labelKey",e.labelKey),t=t.replace("childLength",e.childs.length);for(var n=0;n<e.childs.length;n++)t+=this.tpl(e.childs[n]);return t+="</ul>",t}if(e.depth===0){t+='<div class="menu_column"> <h2>'+e.labelKey+'</h2> <div class="menu_group">';if(e.maxDepth-e.depth===1){t+='<ul class="menu_list">';for(var n=0;n<e.childs.length;n++)t+=this.tpl(e.childs[n]);t+="</ul>"}else{var r=0;for(var n=0;n<e.childs.length;n++)r+e.childs[n].childs.length+3>20&&(t+='</div><div class="menu_group">',r=0),r+=e.childs[n].childs.length+2,t+=this.tpl(e.childs[n])}}return t+="</div></div>",t},render:function(){var t=this.session.companies[0].companyName;this.$el.html(i({AdminLang:o,contextRoot:GO.contextRoot,thumbnail:GO.contextRoot+this.adminBase.getThumbnail(),companyName:t,name:this.session.name,email:this.session.email,admLang:this.adminBase.getAdmLang(),graphType:this.adminBase.getGraphType(),adminTimeout:this.adminBase.getAdminTimeout(),lastLoginDate:GO.util.basicDate(this.session.lastLoginAt)})),this.popup=e.goPopup({pclass:"layer_megamenu",closeIconVisible:!1,modal:!0,contents:this.$el});var n=this.$el.find(".admin_basic"),r=this.$el.find(".admin_menu");this.menus=this.sideMenuCollection.getMenus();for(var s=0;s<this.menus.length;s++)this.menus[s].getMenuKey()==="D"?r.append(this.tpl(this.menus[s])):n.append(this.tpl(this.menus[s]));return this.initSelectedItems(),this.initRecentlyMenu(),this.popup.reoffset(),this},initRecentlyMenu:function(){var t=e("#recently_menu_group");t.empty();for(var n=0;n<this.recentlyMenus.length;n++){var r=this.sideMenuCollection.findMenu(this.recentlyMenus.models[n].getMenuKey());if(r){var i='<li name="key" class="_menuitem"><a>title</a></li>'.replace("key",r.getMenuKey()).replace("title",r.getTitle());t.append(i)}}},initSelectedItems:function(){var t=this.adminBase.getGraphType(),n=this.adminBase.getAdmLang(),r=this.adminBase.getAdminTimeout();e("#lang-"+n).attr("selected","selected"),e("#graph-"+t).attr("selected","selected"),e("#session-time-"+r).attr("selected","selected")},changeFavorite:function(t){var n=e(t.currentTarget),r=n.attr("name"),i=this.sideMenuCollection.findMenu(r);i.favorite=!i.favorite,i.updateFavorite(i.favorite),n.find(".ic_star").toggleClass("off")},movePage:function(t){var r=e(t.currentTarget),i=r.attr("name"),s=this.sideMenuCollection.findMenu(i);n.router.navigate(s.href,{trigger:!0,pushState:!0}),this.popup.close()},changedSessionTime:function(t){var n=e(t.currentTarget),r=n.val();this.adminBase.setAdminTimeout(r),this.adminBase.save()},changedGraph:function(t){var n=e(t.currentTarget),r=n.val();this.adminBase.setGraphType(r),this.adminBase.save(null,{success:function(){location.reload()}})},changedLang:function(t){var n=e(t.currentTarget),r=n.val();this.adminBase.setAdmLang(r),this.adminBase.save(null,{success:function(){location.reload()}})}})});