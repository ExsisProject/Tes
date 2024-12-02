//(function() {
//
//	define([
//        "backbone",
//        "hogan",
//        "constants"
//    ],
//
//    function(
//    	Backbone,
//        Hogan,
//        Constants
//    ) {
//
//        var _slice = Array.prototype.slice;
//
//        /*
//         * 전역 관리 코드 getter/setter
//         * GO.constant(category) => get all codes in category
//         * GO.constant(category, key) => get specific code in category
//         * - 존해하지 않으면 null 값 반환
//         */
//        GO.constant = function(category, key) {
//            if(!Constants[category]) throw new Error("[T.const] Invalide category");
//            return (typeof key === 'undefined' ? Constants[category] : (Constants[category][key] || null));
//        };
//
//        /*
//         * 환경 변수 getter/setter
//         * GO.config(key) => getter
//         * GO.config(key, value) => setter
//         */
//        GO.config = (function() {
//            function getConfig(key) {
//                return GO.__config__[key];
//            };
//
//            function setConfig(key, value) {
//            	if(key === '__source__') return;
//                if(!(key in GO.__config__)) GO.__config__[key] = {};
//                GO.__config__[key] = value;
//                return GO.__config__[key];
//            }
//
//            function config(key, newVal) {
//            	return (typeof newVal === 'undefined' ? getConfig(key) : setConfig(key, newVal));
//            }
//
//            return config;
//        })();
//
//        /*
//         * 세션 변수 getter
//         * GO.session(key) => getter
//         * - 로그인 후 세션 정보를 서버에서 받아서 저장
//         * - 기본 캐시 파기 시간(30분)이 존재하며, 캐시 파기 시간이 파기 시간 후 처음 호출되는 순간 서버에 다시 요청
//         * - 브라우저 리로드 되면 다시 서버에 요청
//         * - setter는 없음
//         */
//        GO.session = function(key) {
//        	var session = GO.__session__;
//            return (typeof key === 'undefined' ? session.toJSON() : session.get(key));
//        };
//
//        /*
//         * GO.EventEmitter
//         * 이벤트 중개인(발행인)
//         */
//        GO.EventEmitter = {
//            __category__: {},
//
//            create: function(category) {
//                if(!(category in this.__category__)) {
//                    this.__category__[category] = {};
//                    _.extend(this.__category__[category], Backbone.Events);
//                }
//                return this.__category__[category];
//            },
//
//            on: function(category, event, callback, context) {
//                var emitter = this.create(category);
//                return emitter.on.apply(emitter, _slice.call(arguments, 1));
//            },
//
//            bind: function(category, event, callback, context) {
//                return this.on(category, event, callback, context);
//            },
//
//            off: function(category, event, callback, context) {
//                var emitter = this.create(category);
//                return emitter.off.apply(emitter, _slice.call(arguments, 1));
//            },
//
//            unbind: function(category, event, callback, context) {
//                return this.off(category, event, callback, context);
//            },
//
//            trigger: function(category, event, args) {
//                var emitter = this.create(category);
//                return emitter.trigger.apply(emitter, _slice.call(arguments, 1));
//            }
//        };
//
//        /**
//        i18n관련
//            - require.js의 plugin인 i18n을 이용하여 불러온 문자열을 Hogan을 이용하여 문자열내 변수를 사용할 수 있도록 보강한 함수
//
//        @method i18n
//        @param {String} str require i18n으로 불러온 문자열
//        @param {Object} keyOrVars 치환할 변수 키 값 혹은 JSON 객체
//        @param {String} keyOfVars가 키값일 경우 키에 대한 value
//        @return {String} 파싱된 문자열
//        */
//        GO.i18n = function(str, keyOrVars, value) {
//            var compiled = Hogan.compile(str),
//                tvars = {};
//
//            if(typeof keyOrVars === 'object') {
//                tvars = keyOrVars;
//            } else {
//                tvars[keyOrVars] = value;
//            }
//
//            return compiled.render(tvars);
//        };
//
//        /**
//         * GO.isAvailableApp
//         * 해당 앱의 라이센스 여부를 판단
//         * @param {String} appName 사용가능 여부를 판별할 appName
//         * @return {boolean} 사용가능 여부
//         */
//
//        GO.isAvailableApp = function(appName) {
//        	var packages = this.config('packages') || [];
//        	return $.inArray(appName, packages) >=0;
//        };
//
//        return GO;
//    });
//
//})();