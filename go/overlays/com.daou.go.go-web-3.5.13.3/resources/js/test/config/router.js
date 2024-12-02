(function() {
	var global = this;

	define([
	    "backbone", 
	    "app", 
	    "json!configs/routes.json", 
	    "json!configs/routes.custom.json", 
	    "backbone.routefilter"
	], 

	function(
	    Backbone, 
	    GO, 
	    routes,
	    customRoutes
	) {
		
		 var metaTags = document.getElementsByTagName('meta');             
		 var device;
          for(var _i in metaTags) {
              if(metaTags[_i].name === 'device') device = metaTags[_i].content;
          }
		
		/*
		 * Backbone.Router의 routes를 이용할 때 url 패턴으로 정규표현식을 이용할 수 없다.
		 * 따라서, route 함수를 이용해서 모두 정규표현식으로 바꾸어서 직접 등록해주어야 한다.
		 */
		var 
		    __instanceType = device ? device : GO.config("instanceType"),
		    __packages = GO.config('packages'),
			__currentPkg = null, 
		    __directivePattern = new RegExp("^([a-zA-Z0-9\/=_-]*:)+(.*)$"),  
			__slice = Array.prototype.slice, 
			__searchPkgPattern = "("+ ["my", 'sitelink',__packages.join("|")].join("|") +")";
//		var STATES = {
//			NORMAL : 0,
//			FORWARD : 1,
//			BACK : -1
//		};
//		var historyState = STATES.NORMAL;
		
		var Klass = Backbone.Router.extend({
			initialize: function() {
			    // 순서가 중요하다. 짧은 것이 항상 먼저 router에 등록되도록 해야 한다.
			    //this._generateFromRoutes();
			    // this._generateFromPackageInfo();
			}, 
			
			navigate: function(fragment, options) {
				// backbone.js v 1.1에서 navigate 동작 조건이 더 엄격해진 것 같음(쿼리스트링이 달라도 같은 fragment로 간주하도록 변경됨)
				// GO에서는 같은 메뉴를 두번 클릭하더라도 페이지가 갱신이 되어야 하기 때문에(리프레시 효과) 이전 fragment를 null 값으로 만들어 항상 통과하도록 함
				if(this.getPackageName() !== 'home') {
					Backbone.history.fragment = null;
				}

				return Backbone.Router.prototype.navigate.call(this, fragment, options);
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
					
					//ie8에서 filter 지원하지 않아 수정함.
					/*email = [data.name, data.position , data.department].filter(function(value) {
					    return value !== "" && value !== undefined;
					});*/
					
					email = $.grep([data.name, data.position , data.department], function(value, i){
						  return value !== "" && value !== undefined;
						});

					
					if(email.length) email = email.join('/');
					else email = '';
					
					email += ' <'+data.email+'>';
				} else {
					email = data;
				}
				var param = {"to":email};
				if(global.location) root = this.getRootUrl() + "app/mail/popup/process?data=to=" + encodeURIComponent(JSON.stringify(param));
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
			
			// before filter...
			// before filter는 :id 와 같은 파라미터 값이 있을 때만 route로 들어온다.
			// 파라미터 값이 없을 경우는 null 값이 들어옴.
			before: function(route) {
//				if (GO.util.isEditorWriting() && historyState == STATES.NORMAL) {
//					var deferred = $.Deferred();
//					var self = this;
//					GO.util.editorWritingPopup(deferred);
//					deferred.done(function() {
//						self._parseFragment();
//						historyState = STATES.FORWARD;
//						var url = $.browser.msie ? Backbone.history.fragment : GO.router.getUrl();
//						self.navigate(url, {trigger : true, replace : true});
//					});
//					deferred.fail(function() {
//						historyState = STATES.BACK;
//						var isBack = history[history.length - 1] == Backbone.history.fragment;
//						isBack = $.browser.msie ? !isBack : isBack;
//						if (isBack) {
//							Backbone.history.history.back(-1);
//						} else {
//							Backbone.history.history.forward();
//						}
//					});
//					return false;
//				} else if (historyState == STATES.BACK) {
//					historyState = STATES.NORMAL;
//					return false;
//				} else {
//					historyState = STATES.NORMAL;
//					this._parseFragment();
//				}
				
				this._parseFragment();
			}, 
			
			// privates...
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
			
			_generateFromPackageInfo: function() {
			    var pattern = __searchPkgPattern + "[\/]?$";
			    this.route(this._generateRegExpFromStr(pattern), "package.index");
			}, 
	        
			_generateFromRoutes: function() {
			    var extendRoutes = $.extend(true, {}, routes, customRoutes);
			    
			    _.each(extendRoutes[__instanceType], function(action, pattern) {
			        var expPattern = /^exp:/, 
			        	newPat = expPattern.test(pattern) ? this._generateRegExpFromStr(pattern) : pattern + "*search";
			        this._processAction(action, newPat);
			    }, this);
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
					if(matched[1] === 'redirect:') return this.navigate(matched[2], {trigger: true, replace: true});
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
			}
		});
		
		// 전역 객체 멤버로 등록(싱글톤)
		GO.router = new Klass();
		
//		var history = [];
//		GO.router.on("route", function(route) {
//			var isChanged = history[history.length - 1] != Backbone.history.fragment;
//			if (isChanged) {
//				history.push(Backbone.history.fragment);
//			}
//		});
		
		return GO.router;
	});
}).call(this);