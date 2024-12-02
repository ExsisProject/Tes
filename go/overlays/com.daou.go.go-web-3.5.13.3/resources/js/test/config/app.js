(function() {
    "use strict";
	
	if(!window.GO) { window.GO = {}; }
	
	define([
        "jquery", 
        "underscore", 
        "backbone", 
        "hogan", 
        "models/session", 
        "constants",
        "jquery.go-popup",
        "GO.util"
    ],

    function(
    	$, 
    	_, 
    	Backbone, 
        hogan, 
        Session,
        Constants
    ) {	
	    
        var 
            contextRoot = GO.contextRoot || "/",
            mailRoot = contextRoot,
            instanceType = GO.instanceType || 'app', 
            deviceType = GO.deviceType || 'pc', 
            _slice = Array.prototype.slice;
        
        /*
         * 전역 관리 코드 getter/setter
         * GO.constant(category) => get all codes in category
         * GO.constant(category, key) => get specific code in category
         * - 존해하지 않으면 null 값 반환
         */        
        GO.constant = function(category, key) {
            if(!Constants[category]) throw new Error("[T.const] Invalide category");
            return (typeof key === 'undefined' ? Constants[category] : (Constants[category][key] || null));
        };
        
        /*
         * 환경 변수 getter/setter
         * GO.config(key) => getter
         * GO.config(key, value) => setter
         */
        GO.config = (function() {
            var constructor = function() {
                
            	this.__config__ = {
                    contextRoot: contextRoot,
                    mailRoot: mailRoot,
                    mailAccountStatus: 'enabled', 
                    instanceType: instanceType, 
                    revision: GO.revision,
                    deviceType: deviceType, 
                    root: [contextRoot + instanceType + "/"].join(""), 
                    baseUrl: GO.baseUrl || "/resources/js", 
                    locale: GO.locale, 
                    useHashbang: false,
                    trustCertification: false, 
                    hasMobilePack: false, 
                    attachFileUpload: false, 
                    pcLinkUrl: '', 
                    usePcMessenger: false, 
                    useMobility: false,
                    // 세션 파기 시간 (초단위, 기본 : 30분)
                    sessionDestroyTime: GO.constant("cache", "DESTROY_TIME"), 
                    packages: [] //사용중인 appName
                };
            };
            
            constructor.prototype = {
                config: function(key, newVal) {
                    return (typeof newVal === 'undefined' ? this._getConfig(key) : this._setConfig(key, newVal));
                }, 
                           
                _getConfig: function(key) {
                    // if(!(key in this.__config__)) throw new Error("Invalied configuration key : " + key);
                    return this.__config__[key];
                }, 
                
                _setConfig: function(key, value) {
                	if(key === '__source__') return;
                    if(!(key in this.__config__)) this.__config__[key] = {};
                    this.__config__[key] = value;
                    return this.__config__[key];
                }
            };

            return function(key, newVal) {
                if(!window["GO_config"]) {
                    window["GO_config"] = new constructor();
                }
                return window["GO_config"].config(key, newVal);
            };
        })();

        /*
         * 세션 변수 getter
         * GO.session(key) => getter
         * - 로그인 후 세션 정보를 서버에서 받아서 저장
         * - 기본 캐시 파기 시간(30분)이 존재하며, 캐시 파기 시간이 파기 시간 후 처음 호출되는 순간 서버에 다시 요청
         * - 브라우저 리로드 되면 다시 서버에 요청
         * - setter는 없음
         */        
        GO.session = function(key) {
            return {
                "id" : 889,
                "name" : "박상오",
                "email" : "sopark@daou.co.kr",
                "employeeNumber" : "2445",
                "position" : "주임연구원",
                "thumbnail" : "/thumb/user/small/910-29120",
                "companyId" : 4,
                "companyName" : "(주)다우기술",
                "domainName" : "daou.co.kr",
                "loginId" : "sopark",
                "lastLoginedAt" : "2014-12-08T08:29:17",
                "locale" : "ko",
                "siteAdmin" : true,
                "dashboardAdmin" : false,
                "surveyAdmin" : false,
                "useOrg" : true,
                "useOrgAccess" : true,
                "useChat" : true,
                "useMailAccess" : false,
                "useWebfolderAccess" : false,
                "adminPageBase" : 20,
                "timeZone" : {
                  "location" : "Asia/Seoul",
                  "gmt" : "32400000",
                  "offset" : "+09:00",
                  "displayName" : "한국 표준시"
                }
            };
        };

        /*
         * GO.EventEmitter
         * 이벤트 중개인(발행인)
         */
        GO.EventEmitter = {
            __category__: {}, 

            create: function(category) {
                if(!(category in this.__category__)) {
                    this.__category__[category] = {};
                    _.extend(this.__category__[category], Backbone.Events);
                }
                return this.__category__[category];
            }, 

            on: function(category, event, callback, context) {
                var emitter = this.create(category);
                return emitter.on.apply(emitter, _slice.call(arguments, 1));
            }, 
            
            bind: function(category, event, callback, context) {
                return this.on(category, event, callback, context);
            }, 

            off: function(category, event, callback, context) {
                var emitter = this.create(category);
                return emitter.off.apply(emitter, _slice.call(arguments, 1));
            }, 
            
            unbind: function(category, event, callback, context) {
                return this.off(category, event, callback, context);
            }, 

            trigger: function(category, event, args) {
                var emitter = this.create(category);
                return emitter.trigger.apply(emitter, _slice.call(arguments, 1));
            }
        };

        /**
        i18n관련 
            - require.js의 plugin인 i18n을 이용하여 불러온 문자열을 Hogan을 이용하여 문자열내 변수를 사용할 수 있도록 보강한 함수

        @method i18n
        @param {String} str require i18n으로 불러온 문자열
        @param {Object} keyOrVars 치환할 변수 키 값 혹은 JSON 객체
        @param {String} keyOfVars가 키값일 경우 키에 대한 value
        @return {String} 파싱된 문자열
        */ 
        GO.i18n = function(str, keyOrVars, value) {
            var compiled = Hogan.compile(str), 
                tvars = {};

            if(typeof keyOrVars === 'object') {
                tvars = keyOrVars;
            } else {
                tvars[keyOrVars] = value;
            }
            
            return compiled.render(tvars);
        };
        
        /**
         * GO.isAvailableApp 
         * 해당 앱의 라이센스 여부를 판단 
         * @param {String} appName 사용가능 여부를 판별할 appName
         * @return {boolean} 사용가능 여부
         */
        
        GO.isAvailableApp = function(appName) {
        	var packages = this.config('packages') || [];
        	return $.inArray(appName, packages) >=0;
        };
        
        return GO;
    });
})();
