define([
    "backbone",
    "admin/models/menu",
],

function(
		Backbone,
		Menu
) {	
	
	var MenuAdmin = Backbone.Model.extend({
		
		url: function() {
			return "/ad/api/menu/all";
		},
		
		
		getMenus : function() {
			return this.get("menuConfigModel");
		},
		
		
		getSystemMenus : function() {
			return _.filter(this.getAllMenus(), function(menu) {
				return menu.systemMenu;
			});
		},
		
		
		getActiveMenusTree : function() {
			return _.filter(this.get("menuConfigModel"), function(menu) {
				var activeSubMenu = _.filter(menu.subMenu, function(submenu) {
					return submenu.status == "online";
				});
				
				menu.activeSubMenu = _.sortBy(activeSubMenu, function(submenu) {
					return submenu.seq;
				});
				
				return menu.status == "online";
			});
		},
		
		
		getAllMenus : function() {
			var menus = this.getMenus();
			var subMenus = _.flatten(_.map(menus, function(menu) {
				return menu.subMenu;
			}));
			
			return _.union(subMenus, menus);
		},
		
		
		getActiveMenus : function() {
			var menus = [];
			
			_.each(this.get("menuConfigModel"), function(menu) {
				if (menu.status == "online") menus.push(menu);
				
				_.each(menu.subMenu, function(submenu) {
					if (submenu.status == "online") menus.push(submenu);
				});
			});
			
			return menus;
		},
		
		leaveParent : function(menuId) {
			var parentId = Number(menuId);
			return $.ajax({
				type : "PUT",
				url : GO.contextRoot + "ad/api/menu/leave/" + parentId,
				dataType : "json",
				contentType: "application/json",
				success : function(resp) {
					console.log(resp.data);
				}
			});
			
		},
		
		getMenu : function(id) {
			var allMenus = this.getAllMenus();
			var object = _.find(allMenus, function(menu) {
				return menu.id == id;
			});
			
			return object;
		},
		
		
		getMenuModel : function(id) {
			return new Menu(this.getMenu(id));
		},
		
		
		isActive : function(menuId) {
			var activeMenuIds = _.map(this.getActiveMenus(), function(menu) {
				return menu.id;
			});
			
			return _.contains(activeMenuIds, parseInt(menuId));
		},
		
		
		setInitialMenu : function(menuId) {
			var self = this;
			
			return $.ajax({
				type : "POST",
				url : GO.contextRoot + "ad/api/menu/initmenu/" + menuId,
				dataType : "json",
				contentType: "application/json; charset=utf-8",
				data : $.param({
					initial : true
				}),
				success : function(resp) {
					self.set("menuConfigModel", resp.data);
				}
			});
		},
		
		
		updateMenu : function(menuId, param) {
			var menu = this.getMenuModel(menuId);
			
			return $.ajax({
				type : "PUT",
				url : GO.contextRoot + "ad/api/menu/" + menuId,
				data : JSON.stringify(_.extend(menu.toJSON(), param)),
				dataType : "json",
				contentType: "application/json;", 
				success : function(resp) {
					console.log(resp);
				}
			});
		},
		
		
		deleteMenu : function(menuId) {
			return $.ajax({
				type : "DELETE",
				url : GO.contextRoot + "ad/api/menu",
				data : JSON.stringify({ids : [menuId]}),
				dataType : "json",
				contentType: "application/json;", 
				success : function(resp) {
					console.log(resp);
				}
			});
		},
		
		
		setOrder : function(ids) {
			var self = this;
			
			return $.ajax({
				type : "PUT",
				url : GO.contextRoot + "ad/api/menu/order",
				data : JSON.stringify({ids : ids}),
				dataType : "json",
				contentType: "application/json;", 
				success : function(resp) {
					self.set("menuConfigModel", resp.data);
				}
			});
		},
		
		
		hasOneActive : function() {
			return this.getActiveMenus().length == 1;
		},
		
		
		getInitMenu : function() {
			return _.find(this.getActiveMenus(), function(menus) {
				return menus.initial;
			});
		}
	});
	
	return MenuAdmin;
});