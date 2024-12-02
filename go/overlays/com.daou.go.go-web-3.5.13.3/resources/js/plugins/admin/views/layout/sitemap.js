define('admin/views/layout/sitemap', function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var App = require('app');
	var MailAdminBase = require('admin/models/layout/mail_admin_base');

	var Tmpl = require('hgn!admin/templates/layout/sitemap');

	var RecentlyMenuCollection= require("admin/collections/recently_menus");

	var AdminLang = require("i18n!admin/nls/admin");

		require("jquery.go-popup");

	return Backbone.View.extend({

		events: {
			'click ._favorite':'changeFavorite',
			'click ._menuitem':'movePage',
			'change #session_time_select' :'changedSessionTime',
			'change #graph_select' :'changedGraph',
			'change #lang_select' :'changedLang'
		},

		initialize: function (options) {
			this.sideMenuCollection = options;
			this.sideMenuCollection.initFavorite();
			this.session = GO.session();
			this.adminBase = new MailAdminBase();

			this.recentlyMenus = new RecentlyMenuCollection();
			this.recentlyMenus.fetch({async: false});
		},
		tpl:function(menu){
			var tpl = '';

			if (!menu.accessible || !menu.view) {
				return '';
			}

			if (menu.maxDepth - menu.depth === 0 ){
					tpl = '<li><span class="action _favorite" name="mykey"><ins class="ic_adm ic_star off"></ins></span>' +
						' <span class="txt _menuitem" name="mykey" title="labelKey"><a >labelKey</a></span></li>';
					if( menu.favorite){
						tpl = tpl.replace('off', '');
					}
					return tpl.replace('labelKey', menu.labelKey).replace('labelKey', menu.labelKey)
						.replace('mykey', menu.getMenuKey()).replace('mykey', menu.getMenuKey());
				}
				else if ( menu.depth ===1 ){
					tpl = '<h3><span class="menu_tit">labelKey</span><span class="num">childLength</span></h3><ul class="menu_list">'
					tpl = tpl.replace('labelKey', menu.labelKey);
					tpl = tpl.replace('childLength', menu.childs.length);
					for(var i =0 ;i < menu.childs.length; i ++){
						tpl += this.tpl(menu.childs[i]);
					}
					tpl += '</ul>';
					return tpl;
				}
				else if(menu.depth === 0 ){
					tpl += '<div class="menu_column"> <h2>' + menu.labelKey + '</h2> <div class="menu_group">';
					if( menu.maxDepth - menu.depth === 1 ){
						tpl += '<ul class="menu_list">'
						for ( var i =0 ;i <menu.childs.length; i ++){
							tpl += this.tpl(menu.childs[i]);
						}
						tpl += '</ul>'
					}
					else{
						var cnt =0 ;
						for ( var i =0 ;i < menu.childs.length; i ++){
							if( cnt + menu.childs[i].childs.length + 3 >  20  ){
								tpl += '</div><div class="menu_group">';
								cnt =0 ; ;
							}

							cnt += menu.childs[i].childs.length + 2;
							tpl += this.tpl(menu.childs[i]);
						}
					}

				}
				tpl +='</div></div>'
				return tpl;
		},
		render: function () {

			var companyName = this.session.companies[0].companyName;
			this.$el.html(Tmpl({
				AdminLang:AdminLang,
				contextRoot: GO.contextRoot,
				thumbnail: GO.contextRoot +this.adminBase.getThumbnail(),
				companyName:companyName,
				name:this.session.name,
				email:this.session.email,
                admLang:this.adminBase.getAdmLang(),
				graphType:this.adminBase.getGraphType(),
				adminTimeout:this.adminBase.getAdminTimeout(),
				lastLoginDate:GO.util.basicDate(this.session.lastLoginAt)
			}));
			this.popup = $.goPopup({
				pclass :'layer_megamenu',
				closeIconVisible : false,
				modal: true,
				contents: this.$el,
			});

			var basic = this.$el.find('.admin_basic');
			var menu = this.$el.find('.admin_menu');

			this.menus = this.sideMenuCollection.getMenus();
			for( var i =0 ;i < this.menus.length ; i ++){
				if(this.menus[i].getMenuKey() === 'D'){
					menu.append( this.tpl(this.menus[i]));
				}
				else{
					basic.append(this.tpl(this.menus[i]));
				}
			}
			this.initSelectedItems();
			this.initRecentlyMenu();

			this.popup.reoffset();
			return this;
		},
        initRecentlyMenu:function(){
			var root = $('#recently_menu_group');
			root.empty();

			for (var i = 0; i < this.recentlyMenus.length; i++) {
				var menu = this.sideMenuCollection.findMenu(this.recentlyMenus.models[i].getMenuKey());
				if(menu){
					var li = '<li name="key" class="_menuitem"><a>title</a></li>'.replace('key', menu.getMenuKey()).replace('title', menu.getTitle());
					root.append(li);
				}
			}
		},
		initSelectedItems:function(){
			var graphType = this.adminBase.getGraphType();
			var admLang = this.adminBase.getAdmLang();
			var admTimeout = this.adminBase.getAdminTimeout();

			$('#lang-'+ admLang ).attr('selected', 'selected');
			$('#graph-'+ graphType).attr('selected', 'selected');
			$('#session-time-'+ admTimeout).attr('selected', 'selected');;
		},
		changeFavorite:function(e){
			var target = $(e.currentTarget);
			var key = target.attr('name');
			var menu = this.sideMenuCollection.findMenu(key);
			menu.favorite = !menu.favorite;

			menu.updateFavorite(menu.favorite);

			target.find('.ic_star').toggleClass('off');
		},
		movePage: function (e) {
			var target = $(e.currentTarget);
			var key = target.attr('name');
			var menu = this.sideMenuCollection.findMenu(key);
			App.router.navigate(menu.href, {trigger: true, pushState: true});
			this.popup.close();
		},
		changedSessionTime:function(e){
			var target = $(e.currentTarget);
			var min = target.val();
			this.adminBase.setAdminTimeout(min);
			this.adminBase.save();
		},
		changedGraph:function(e){
			var target = $(e.currentTarget);
			var graph= target.val();
			this.adminBase.setGraphType(graph);
			this.adminBase.save( null, { success:function(){
					location.reload();
				}});
		},
		changedLang:function(e){
			var target = $(e.currentTarget);
			var lang= target.val();
			this.adminBase.setAdmLang(lang);
			this.adminBase.save( null, { success:function(){
			    location.reload();
			}});
		}
	});
});