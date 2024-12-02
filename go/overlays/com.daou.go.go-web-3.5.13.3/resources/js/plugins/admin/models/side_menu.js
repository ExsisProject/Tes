define('admin/models/side_menu', function(require) {

	var Backbone = require('backbone');
	var GO = require('app');
	var _ = require('underscore');
	
	var SiteConfigModel = require("models/site_config");

	var sideMenu = require("json!admin/sidemenu.json");
	var sideMenuCustom = require("json!admin/sidemenu.custom.json");

	var adminLang = require("i18n!admin/nls/admin"); 
	var commonLang = require("i18n!nls/commons");
	var approvalLang = require("i18n!approval/nls/approval");

	var LangMapper = {
			"adminLang" : adminLang,
			"commonLang" : commonLang,
			"approvalLang" : approvalLang
	}

	var SideMenuModel = Backbone.Model.extend({
		initialize : function(options) {
			this.menuGroup = options.menuGroup;
			this.menuList = sideMenu[this.menuGroup].concat(sideMenuCustom[this.menuGroup] || []);

			//company
			this.certConfig = null;
			this.isOtpServiceOn = false;
		},

		getAccessMenu : function() {
			//권한 설정
			var deferred = $.Deferred();
			
			this.menuList = _.filter(this.menuList, function(menu) {
				var isSite = GO.session().serviceAdminMode == false && menu.level.indexOf('site') >= 0;
				var isSerivce = GO.session().serviceAdminMode == true && menu.level.indexOf('service') >= 0;
				return isSite || isSerivce;
			});

			//정렬
			_.sortBy(this.menuList, 'order');

			//다국어 설정
			_.each(this.menuList, function(menu) {
				menu.name = LangMapper[menu.lang][menu.key];
			});

			//설정에 의해 변경되는 항목들
			this.getDomainAdminAuthFilter(deferred);

			if(this.menuGroup == 'company') {
				this.getComapnyFilter(deferred);
			} else if(this.menuGroup == 'board') {
				this.getBoardFilter(deferred);
			} else if(this.menuGroup == 'mobile') {
				this.getMobileFilter(deferred);
			} else if(this.menuGroup == 'works') {
				this.getWorksFilter(deferred);
			} else if(this.menuGroup == 'approval') {
				this.getApprovalFilter(deferred);
			} else if(this.menuGroup == 'mail/stat') {
				this.getMailFilter(deferred);
			} else {
				deferred.resolve(this.menuList);
			}

			return deferred;
		},

		getDomainAdminAuthFilter : function(deferred) {
            var self = this;
            $.when(this.getInaccessibleMenus()).then($.proxy(function() {
                var sideList =_.filter(this.menuList, function(menu) {
					if (_.contains(self.inaccssibleMenus, self.menuGroup + '.' + menu.leftName)) {
                		return false;
					}

					return true;
                }, this);
                self.menuList = sideList;
                deferred.resolve(self.menuList);
            }, this));
            return deferred;
		},

		getInaccessibleMenus : function() {
            var self = this;
            var deferred = $.Deferred();
            $.ajax({
                type : "GET",
                url : GO.contextRoot + "ad/api/domainadmin/auth/menus",
                async : false,
                success : function(resp) {
                    self.inaccssibleMenus = resp.data;
                    deferred.resolve();
                }
            });
            return deferred;
		},

		
		getWorksFilter : function(deferred) {
			var self = this;
			this.siteConfigModel = SiteConfigModel.read({isAdmin : true});
			var siteConfigs = this.siteConfigModel.toJSON();
			var sideList =_.filter(this.menuList, function(menu) {
				if(menu.href == "works" && siteConfigs.worksService != "on") {
					return false;
				}
				return true;				
			}, this);
			self.menuList = sideList;
			deferred.resolve(self.menuList);
			return deferred;
		},
		
		getApprovalFilter : function(deferred) {
			var self = this;
			var sideList =_.filter(this.menuList, function(menu) {
				if(menu.href == "approval/deptstatistics" && !GO.util.isUseOrgService(true)) {
					return false;
				}
				return true;
			}, this);
			self.menuList = sideList;
			deferred.resolve(self.menuList);
			return deferred;
		},
		
		getMailFilter : function(deferred) {
			var companyMailService = new Backbone.Model();
	        companyMailService.url = GO.contextRoot + "ad/api/company/mailservice";
	        companyMailService.fetch({async : false});
	        
			var self = this;
			var sideList =_.filter(this.menuList, function(menu) {
				if(menu.href == "mail/stat/pop" && !companyMailService.get('pop')) {
					return false;
				}
				if(menu.href == "mail/stat/imap" && !companyMailService.get('imap')) {
					return false;
				}
				return true;
			}, this);
			self.menuList = sideList;
			deferred.resolve(self.menuList);
			return deferred;
		},

		getBoardFilter : function(deferred) {
			var self = this;
			var sideList =_.filter(this.menuList, function(menu) {
				if(menu.href == "board/statistics/dept" && !GO.util.isUseOrgService(true)) {
					return false;
				}
				return true;
			}, this);
			self.menuList = sideList;
			deferred.resolve(self.menuList);
			return deferred;
		},
		
		getMobileFilter : function(deferred) {
			var self = this;
			
			this.siteConfigModel = SiteConfigModel.read({isAdmin : true});
			var siteConfigs = this.siteConfigModel.toJSON();
			
			var sideList =_.filter(this.menuList, function(menu) {
				if(menu.href == "mobile" && siteConfigs.mobileAppService != "on") {
					return false;
				}
				return true;
			}, this);
			self.menuList = sideList;
			deferred.resolve(self.menuList);
			return deferred;
		},

		getComapnyFilter : function(deferred) {
			var self = this;
			$.when(this._getCertConfig(), this._getOTPConfig()).then($.proxy(function() {
				var sideList =_.filter(this.menuList, function(menu) {
					if(menu.href == "company/cert" && self.certConfig.str != "on") {
						return false;
					}
					if(menu.href == "company/otp" && !self.isOtpServiceOn) {
						return false
					}
					return true;
				}, this);
				self.menuList = sideList;
				deferred.resolve(self.menuList);
			}, this));
			return deferred;
		},

		_getCertConfig : function() { //company
			var self = this;
			var deferred = $.Deferred();
			$.ajax({
				type : "GET",
				url : GO.contextRoot + "ad/api/system-certconfig",
				success : function(resp) {
					self.certConfig = resp.data;
					deferred.resolve();
				}
			});
			return deferred;
		},

		_getOTPConfig: function() { //company
			var self = this;
			var deferred = $.Deferred();
			$.ajax({
				type : "GET",
				url : GO.contextRoot + "ad/api/company/" + GO.session('companyId'),
				success : function(resp) {
					self.isOtpServiceOn = resp.data.config['otpService'] == 'on';
					deferred.resolve();
				}
			});
			return deferred;
		}
	});
	return SideMenuModel;
});