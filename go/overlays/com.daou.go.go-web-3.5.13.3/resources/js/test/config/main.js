;(function( window, document, require, undefined ) {
    "use strict";

    function isPCApp() {
        return GO.config('deviceType') === 'pc' && GO.config('instanceType') === 'app';
    }
    
    function isMobile() {
        return GO.config('deviceType') === 'mobile' && GO.config('instanceType') === 'app';
    }
    
    function isMobileApp() {
    	 return GO.util.isMobileApp();
    }

    function startHistory() {
        Backbone.history.start({pushState: true, root: GO.config('root')});
    }
	
	function canUseNoti() {
		return isPCApp() && !window.opener && !isNote();
	}
	
	function isNote() {
		return GO.util.isNote();
	}
    
    function bindAnchor() {
        $(document).on("click", "a:not([data-bypass])", function(e) {
            var href = {prop: $(this).prop("href"), attr: $(this).attr("href")};
            e.preventDefault();
            if(href.prop && GO.router.isEqualToRootUrl(href.prop)) {
                GO.router.navigate(GO.router.getUrl(href.prop), {trigger: true, pushState: true});
            } else if(href.attr) {
            	var selector = ["form.editor_view","div.editor_view","p.editor_view","article.editor_view","span.editor_view"];
            	var targetSelf = true;
            	$.each(selector,function(k,v){
            		if($(e.currentTarget).parents(v).first().length > 0){
            			window.open(href.attr,"_blank");
            			targetSelf = false;
            			return false;
            		}
            	});
            	if(targetSelf){
            		window.location.href = href.attr;
            	}
            }
        });
    }
    
    function ajaxGlobalSetup() {
        var statusCallback = {},
            resCode = GO.constant('response'), 
            callbackFn = {
                "401": function(jqXHR) {
                    if(isMobileApp()){
                    	GO.util.callSessionTimeout();
                    } else{
                        var url = GO.config("contextRoot") + "login?returnUrl=" + GO.config('root') + GO.router.getUrl();
                        var responseData = $.parseJSON(jqXHR.responseText);
                        if (responseData.name == "common.unauthenticated.concurrent") {
                            url += "&cause=concurrent";
                        }
                        window.location = url;
                    }
                    return false;
                },
                "404": function() {
                	if(isMobile()){
                		GO.util.goAppHome();
                	}
                },
                "403": function() {
                	if(isMobile()){
                		GO.util.goAppHome();
                	}
                }
            };
        
        for(var _key in resCode) {
            var stCode = resCode[_key];
            if(callbackFn[stCode]) statusCallback[stCode] = callbackFn[stCode];
        }
        
        var beforeSendCallback = function(){
        	if(isMobileApp()){
        		try{
    				if(GO.util.checkOS() == "android"){
    					window.GOMobile.isConnected();					
    				}else{
    					window.location = "gomobile://isConnected";
    				}
    			}catch(e){}
        	}
        };
        
        $.ajaxSetup({ 
            // 30초가 기본
            timeout: GO.constant("system", "AJAX_TIMEOUT"), 
            statusCode: statusCallback,
            beforeSend : beforeSendCallback
        });
    }
    
    function startNotification() {
        if( canUseNoti() ) {
            require(["go-notification", "collections/notifications"], function(GONotification, Notifications) {
                $.get( GO.config("contextRoot") + "api/bosh/user", function(resp) {                
                    var 
                        resourceName = ["go_web", GO.session("id"), Math.ceil(Math.random() * 100)].join("_"), 
                        JID = [resp.data.jid, resourceName].join("/"), 
                        protocol = location.protocol, 
                        boshPort = (protocol === 'https:' ? "443" : "80"), 
                        boshPathname = "http-bind/", 
                        boshUrl = [location.protocol, "//", location.hostname, ":", boshPort, "/", boshPathname ].join("");
                    
                    if(window["GO_Notification"]) {
                        window["GO_Notification"].release();
                    }
                    
                    var notification = new GONotification( boshUrl, { jid: JID, password: resp.data.subInfo }, {
                        onReceiveMessage: function( msg ) {
                            Notifications.getNewCount(function(count) {
                                $('#noti-count-badge').text(count);
                                $('#noti-count-badge').css("display", count == 0 ? "none" : "inline-block");
                            });
                        }
                    });
                    notification.run();
                    
                    window["GO_Notification"] = notification;
                });
            });
        }
    }
    
    function setMockConsole() {
        if(!window.console) {
            window.console = (function() {
                var methods = {};
                _.each(["log", "info", "warn", "error", "assert", "dir", "profile", "profileEnd"], function(name) {
                    methods[name] = function() {};
                });
                return methods;
            })();
        }
    }
    
    function setBrowserTitle(browser) {
    	GO.util.setBrowserTitle();
    	processBrowserTitle(browser, GO.util.setBrowserTitle);
        
        return;
    }
    
	function processBrowserTitle(browser, fn) {
		if(browser.msie && browser.version < 10) {
    		$(window).off(".browsertitle").on("hashchange.browsertitle", function() {
    			setTimeout(fn, 500);
    		});
    	} else {
    		GO.router.on("change:package", fn);
    	}
	}
    
    function overrideBackbone() {
        // 전역 객체에 Backbone.Events를 확장한다.(Deprecated)
        // GO.EventEmitter 이용 할 것!!!
        _.extend(GO, Backbone.Events);
        
        // Backbone.Model과 Collection의 parse 함수 Override 
        function newParse(resp, xhr) {
            // __go_checksum__ 이 있는 데이터만 파싱한다.
            if(!("__go_checksum__" in resp)) return resp;

            delete resp["__go_checksum__"];
            _.each(resp, function(obj, key) {
                if(key !== "data") this[key] = obj;
            }, this);
            return resp.data;
        };
        // Backbone.Model, Backbone.Collection의 parse 함수
        _.extend(Backbone.Model.prototype, {parse: newParse});
        _.extend(Backbone.Collection.prototype, {parse: newParse});
        
        // Backbone.sync override(컨텍스트 경로 반영)
        Backbone.sync = (function() {
            var newSync, 
                orgSync = Backbone.sync;

            newSync = function(method, model, options) {
                options = (options || {});
                if(!options.url && _.result(model, 'url')) {
                    options.url = GO.util.fixUrlPathname(_.result(model, 'url'));
                }
                return orgSync.call(Backbone, method, model, options);
            };

            return newSync;
        })();
    }
    
    function createBaseModelAndView() {
        var commonStaticProps = {
                __instance__: null, 

                create: function() {
                    if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                    return this.__instance__;
                }, 
                
                // Alias of create method...(for readable and semantic code)
                getInstance: function() {
                    return this.create();
                }
            }, 
            commonModelStaticProps = _.extend({}, commonStaticProps, {
                getData: function(options) {
                    options = _.defaults(options || {}, {async: false});
                    var instance = this.getInstance(), 
                        deferred = $.Deferred();
                    $.when(instance.fetch(options)).done(function() {
                        deferred.resolveWith(instance);
                    });
                    
                    deferred.promise(instance);
                    return instance;
                }
            }), 
            commonViewStaticProps = _.extend({}, commonStaticProps, {
                render: function(option) {
                    var instance = this.getInstance();
                    return instance.render(option);
                }
            });
            
        GO.BaseModel = Backbone.Model.extend({}, commonModelStaticProps);
        GO.BaseCollection = Backbone.Collection.extend({}, commonModelStaticProps);
        GO.BaseView = Backbone.View.extend({}, commonViewStaticProps);
    }
    
    function initMoment(moment, locale) {
        moment.lang((locale || 'ko').toLowerCase().replace('_', '-'));
        // moment 2.x 버전부터 amd 지원. 글로벌 객체는 명시적으로 만들어줘야 함
        if(!window['moment']) window.moment = moment;
    }
    
    function initJQuery() {
    	var isDev = GO.profile === 'development';
    	
    	jQuery.migrateMute = !isDev;
    	jQuery.migrateTrace = isDev;
    }
    
    require(["jquery", "backbone", "app", "moment", "browser", "router"], function( $, Backbone, GO, moment, browser) {
    	initJQuery();
        overrideBackbone();
        createBaseModelAndView();
        startHistory();
        bindAnchor();
        ajaxGlobalSetup();
//        startNotification();
        setMockConsole();
        setBrowserTitle(browser);
        initMoment(moment, GO.locale);
    });
    
})( window, document, require );
