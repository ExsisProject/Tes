(function() {
	var global = this;

	define([
	    "backbone", 
	    "app", 
	    "json!configs/routes.json", 
	    "json!configs/routes.custom.json",
	    "admin/collections/side_menu_collection",
	    "backbone.routefilter", 
	    "../libs/go-google-analytics",
	    
	    "jquery.cookie"
	], 

	function(
	    Backbone, 
	    GO, 
	    routes,
	    customRoutes,
		SideMenuCollection
	) {
		/*
		 * Backbone.Router의 routes를 이용할 때 url 패턴으로 정규표현식을 이용할 수 없다.
		 * 따라서, route 함수를 이용해서 모두 정규표현식으로 바꾸어서 직접 등록해주어야 한다.
		 */

  		var __packages;
		var __currentPkg = null; 
		var __directivePattern = new RegExp("^([a-zA-Z0-9\/=_-]*:)+(.*)$");  
		var __slice = Array.prototype.slice; 
		var __searchPkgPattern;
		var __instanceType;

		GO.fetch('baseConfig').done(function() {
			__packages = GO.config('packages');
			__searchPkgPattern = "("+ ["my", 'sitelink',__packages.join("|")].join("|") +")";
			__instanceType = getInstanceType();
		});
		
		function getInstanceType() {
			var __instanceType = GO.config("instanceType");
			var metaTags = document.getElementsByTagName('meta');             
			var device;
			
			for(var _i in metaTags) {
				if(metaTags[_i].name === 'device') device = metaTags[_i].content;
			}
			
			if(GO.config("instanceType") !== 'app') {
				__instanceType = GO.config("instanceType");
			} else if(device && device === "mobile" && $.cookie("pcVersion") === 'true') {
				__instanceType = 'app';
			} else if(device === 'pc'){
				__instanceType = 'app';
			} else if(device === 'tablet'){
				if($.cookie("pcVersion") === 'true') {
					__instanceType = 'app';
				}else{
					__instanceType = 'mobile';
				}
			} else if(device === 'mobile'){
				__instanceType = device;
			}
			
			return __instanceType;
		}
		
		var Klass = Backbone.Router.extend({
			initialize: function() {
			    this._generateFromRoutes();
			}, 
			
			/**
			 * @Override
			 */
			navigate: function(fragment, options) {
				GO.util.purgeMailAndWebFolder();
				// backbone.js v 1.1에서 navigate 동작 조건이 더 엄격해진 것 같음(쿼리스트링이 달라도 같은 fragment로 간주하도록 변경됨)
				// GO에서는 같은 메뉴를 두번 클릭하더라도 페이지가 갱신이 되어야 하기 때문에(리프레시 효과) 이전 fragment를 null 값으로 만들어 항상 통과하도록 함
				if(this.getPackageName() !== 'home') {
					Backbone.history.fragment = null;
				}
				
				// 구글 분석기가 설정되어 있으면 동작시킴
				excuteGoogleAnalyze(fragment);
				return Backbone.Router.prototype.navigate.call(this, fragment, options);
			}, 
			
			/**
			 * @Override
			 * backbone.routefilter에서 제공하는 함수
			 * before filter는 :id 와 같은 파라미터 값이 있을 때만 route로 들어온다.
			 */
			before: function(router) {
				this._clearContentViewer();
				this._clearDatepikcer();
				this._clearEditor();
				this._parseFragment();
				this._clearDocumentEvent();
				this._renewalPaginatedParam();
				this.trigger('beforeNavigate');
			},

			after: function() {
				if (GO.util.pageDone) GO.util.pageDone(location.href);
			},
			
			getPackageName: function() {
				return __currentPkg;
			},
			
			setPackageName: function(name) {
				if(__currentPkg !== name) {
					__currentPkg = name;
					this.trigger("change:package", __currentPkg);
				} else {
					this.trigger("change:page", __currentPkg);
				}
			}, 

			getRootUrl: function() {
				var root = null;
				if(global.location) root = global.location.protocol + "//" + global.location.host + GO.config('root');
				return root;
			}, 
			
			getSendMailUrl : function(data) {
				var root = null,
					email = null;
				
				if(typeof data == 'object') {
					email = $.grep([data.name, data.position , data.department], function(value, i){
					  return value !== "" && value !== undefined;
					});

					if(email.length) email = email.join('/');
					else email = '';
					
					email += ' <'+data.email+'>';
				} else {
					email = data;
				}
			
				var param = {"to": email};
				if(global.location) root = this.getRootUrl() + "mail/popup/process?data=" + encodeURIComponent(JSON.stringify(param));
				return root;
			},

			getUrl: function(url) {
				var root = this.getRootUrl(), 
					url = (url || location.href);
				return (this.isEqualToRootUrl(url) ? url.slice(root.length) : url);
			}, 

			getSearch: function(key) {
				var regexp = /[\?](.*)?/; 
				var search = global.location.search || global.location.hash; 
				var matched = regexp.exec(search);
				var hash = {};

				// url 에 param 은 없지만 ? 가 붙은 경우에 대한 처리.
				if(regexp.test(search) && matched[1] != null) {
					_.each(matched[1].split("&"), function(token, i) {
						var isArray = (token.indexOf("%5B%5D") || token.indexOf("[]")) > 0;
						var matched2 = token.split('=');
						if (isArray) {
							var key = decodeURIComponent(token).split("[]")[0];
							var temp = hash[key] || [];
							hash[key] = _.union(temp, [decodeURIComponent(matched2[1])]);
						} else {
							hash[matched2[0]] = decodeURIComponent(matched2[1]);
						}
					}, this);					
				}

				return (typeof key !== "undefined" ? hash[key] : hash);
			}, 

			isEqualToRootUrl: function(url) {
				var root = this.getRootUrl();
				return (url.slice(0, root.length) === root);
			}, 
			
			// privates...
			
			_clearDatepikcer : function() {
				$("div.ui-datepicker").hide();
			},
			
			_clearEditor : function() {
				if (GO.Editor) GO.Editor.destroyAll();
			},
			
			_parseFragment: function() {
				var fragment = Backbone.history.getFragment(),
			    	pkgRegExp = this._generateRegExpFromStr("[!\/]*" + __searchPkgPattern), 
		        	matched = fragment.match(pkgRegExp);
			    if(matched && matched[1]) {
			        this.setPackageName(matched[1]);
			    } else {
			        this.setPackageName(null);
			    }
			}, 
			
			_generateFromRoutes: function() {
				console.log("========== generateFromRoutes ==========");
				this._filterUnauthorizedAdminRoutes();

			    var extendRoutes = $.extend(true, {}, routes, customRoutes);
			    _.each(extendRoutes[__instanceType], function(action, pattern) {
			        var expPattern = /^exp:/, 
			        	newPat = expPattern.test(pattern) ? this._generateRegExpFromStr(pattern) : pattern + "*search";
			        this._processAction(action, newPat);
			    }, this);

			    GO.routes = routes;
			    GO.routes.hasRouteAuth = function (categoryName, url) {
			        return _.any(routes, function(category, name) {
			            if (categoryName != name) {
			                return false;
                        }

                        return _.any(category, function(v, k) {
                            if (v == "admin.error.page403") {
                                return false;
                            }
                            return url == k;
                        });
                    });
                }
			},

			_filterUnauthorizedAdminRoutes : function() {
                if (GO.instanceType != 'admin') {
                    delete routes.admin;
                    delete customRoutes.admin;
                    return;
                }

                var sideMenus = new SideMenuCollection();

                _.forEach(routes.admin, function(routePath, routeUrl) {
                	if (routePath == 'admin.main.renderCompanyInfo') {
                		return;
					}
                	if (!sideMenus.isAuthorizedRoutingPath(routePath)) {
                		routes.admin[routeUrl] = "admin.error.page403";
					}
				});

                _.forEach(customRoutes.admin, function(routePath, routeUrl) {
                    if (!sideMenus.isAuthorizedRoutingPath(routePath)) {
                        customRoutes.admin[routeUrl] = "admin.error.page403";
                    }
                });
			},
			
			_processAction: function(action, pattern) {
		        if(!this._processDirectiveAction(action, pattern)) {
		        	var actionToken = action.split('.');
		        	if(actionToken.length != 3) throw new Error("Illegal action name");
		        	this.route(pattern, action, function() {
		        		var args = __slice.call(arguments), 
		        			pkgName = actionToken[0], 
		        			controllerName = actionToken[1], 
		        			methodName = actionToken[2], 
		        			pkgPath = (pkgName === "core" ? "": pkgName + "/") + "controllers" + "/" + controllerName;

		        		require([pkgPath], function(controller) {
		        			if(controller[methodName]) {
		        				controller[methodName].apply(controller, args);
		        			} else {
		        				throw new Error("Action: " + methodName + " is not exists!!");
		        			}
		        		});
		        	});
		        }
			},
			
			_processDirectiveAction: function(action, pattern) {
				var matched = action.match(__directivePattern);
				if(!matched || matched.length < 2) return false;
				this.route(pattern, action, function() {
					if(matched[1] === 'redirect:') {
						if (matched[2] == 'mail/' || matched[2] == 'webfolder/') {
							window.location = this.getRootUrl() + matched[2];
							return true;
						}
						if(matched[2] == 'home/') {
							var initMenu = GO.util.getInitMenu();
							matched[2] = (initMenu) ? initMenu.appName : matched[2];
						}
						return this.navigate(matched[2], {trigger: true, replace: true});
					}
				});
				return true;
			}, 
			
			_generateRegExpFromStr: function(str) {
			    var newRegExp = null, 
			        flagPattern = /\/?([g|i|m]*)$/, 
			        expFlags = str.match(flagPattern)[1],
			        // RegExp를 이용하기 위해 특정 패턴의 문자들을 제거해준다.
			        exp = str.replace(/^exp:/, '').replace(/^\//, '').replace(/^\^/, '').replace(flagPattern, ''), 
			        hbPattern = "!\/", 
			        hbRegExp = new RegExp("^" + hbPattern);
			    
		        if(GO.config('useHashbang') && !hbRegExp.test(exp)) {
	                exp = hbPattern + exp;
	            }
	            // backbone.queryparams를 지원하도록 정규표현식을 넣는다.
		        exp = "^" + exp + "([\?]{1}.*)?";

			    if(expFlags) {
			        newRegExp = new RegExp(exp, expFlags);
			    } else {
			        newRegExp = new RegExp(exp);
			    }
		        return newRegExp;
			},
			
			/**
			 * 전역이벤트 관리.
			 */
			_clearDocumentEvent : function() {
				$(document).off("click.backdrop");
				$(document).off("backdrop");

				$(document).on("click.backdrop", $.proxy(function(event) {
					$(document).trigger($.Event("backdrop", {relatedTarget : event.target}));
				}, this));
			},

			/**
			 * 기존 queryString 방식 제거 하고 local storage 사용.
			 * 하지만 queryString 과는 달리 storage 에 담을경우
			 * storage에 있는 데이터를 어느 시점에 써야 하는지 알 수 없다.
			 * 항상 복원 시켜줄 경우, 아래와 같이 원하지 않는 상황에서도 복원이 되는 케이스가 발생한다.
			 * ex ) 목록 > 상세 > 다른 task > 원래 task의 목록
			 *
			 * 해결 방법으로, router 에서 두번까지만 유지시켜주도록 한다.
			 * 통상적인 케이스인 목록 > 상세 > 목록 의 순서로 이동하는 경우 목록 결과가 복원된다.
			 */
			_renewalPaginatedParam : function() {
				GO.fetch('session').done(function() {
					var object2 = GO.util.store.get(GO.session("id") + "-storedParam-cycle2") || null;
					var object3 = GO.util.store.get(GO.session("id") + "-storedParam-cycle3") || null;
					GO.util.store.set(GO.session("id") + "-storedParam-cycle1", object2, {type : "session"});
					GO.util.store.set(GO.session("id") + "-storedParam-cycle2", object3, {type : "session"});
					GO.util.store.set(GO.session("id") + "-storedParam-cycle3", null, {type : "session"});
				});
			},

			// GO-21760 IE 버그로 인하여 동영상이 남아있음.
			_clearContentViewer: function() {
				var $embed = $('iframe[el-content-viewer]').contents().find('embed');
				if (GO.util.msie() && $embed.length) {
					$embed.hide().remove();
					if (GO.util.isIE8()) window.location.reload(); // IE8 브라우저 버그. 잔상(black screen) 이 남음.
				}
			}
		}, {
			__instance__: null, 
			getInstance: function() {
				if(!this.__instance__) {
					this.__instance__ = new Klass();
				}
				
				return this.__instance__;
			}, 
			
			route: function(route, callback) {
				var instance = this.getInstance();
				instance.route(route, route, callback);
			}, 
			
			group: function(instanceType, fn) {
				if(getInstanceType() !== instanceType) {
					return;
				}
				fn.call(this);
			}
		});
		
		function excuteGoogleAnalyze(fragment){
	    	var config = GO.config('googleAnalyticsOption');
	    	var page = fragment;
	    	var firstChar = fragment.substr(0, 1);
	    	if (firstChar != '/') {
	    		page = '/' + page;
	    	}
	    	if(_.isObject(config) && config.trackerId) {
	    		GO.Analytics.excute(config, page);
	    	} else {
	    		// uid는 필수이므로 존재하지 않으면 적용하지 않는다.
	    		return;
	    	}
        }

		// 1.0 라우터 호환

		GO.fetch('baseConfig').done(function() {
			GO.router = Klass.getInstance();
		});

		return Klass;
	});
}).call(this);