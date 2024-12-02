define('app', function (require) {

    if (!window.GO) {
        window.GO = {};
    }

    // dependency
    var Backbone = require('backbone');
    var Hogan = require('go-hogan');
    var Session = require('models/session');
    var Constants = require('constants');

    // load module
    require('jquery.go-popup');

    var contextRoot = GO.contextRoot || "/";
    var mailRoot = contextRoot;
    var instanceType = GO.instanceType || 'app';
    var deviceType = GO.deviceType || 'pc';
    var _slice = Array.prototype.slice;

    var prefix = GO.instanceType === 'admin' ? 'ad/' : '';
    /**
     * instance Types: ['app', 'admin', 'install']
     */
    var urlMap = {
        baseConfig: {
            url: contextRoot + prefix + 'api/userside/baseconfig',
            supportedInstanceTypes: ['app']
        },
        siteConfig: {
            url: contextRoot + prefix + 'api/siteconfig',
            supportedInstanceTypes: ['app', 'admin']
        },
        session: {
            url: contextRoot + prefix + 'api/user/session',
            supportedInstanceTypes: ['app', 'admin']
        },
        emoticonGroups: {
            url: contextRoot + 'api/emoticons/groups',
            supportedInstanceTypes: ['app']
        }
    };
    var senderMap = {};
    var Sender = function (key, initCallback) {
        var api = urlMap[key];
        this.promise = $.Deferred();
        if (!api) {
            console.warn('지원하지 않는 API 입니다.');
            this.promise.reject();
            return this;
        }
        var isSupport = _.contains(api.supportedInstanceTypes, instanceType);
        if (!isSupport) {
            this.promise.resolve();
        } else {
            // baseconfig store 코드. 개발 환경에서만 동작한다.
            //if ($('meta[name="profile"]').attr('content') === 'development' && GO.util.store.get(key)) {
            //	//console.log(GO.util.store.get(key));
            //	this.resp = GO.util.store.get(key);
            //	initCallback.call(this, this.resp);
            //	this.promise.resolve(this.resp);
            //	return this;
            //}
            $.ajax({
                url: api.url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('GO-Agent', $('meta[name="goAgent"]').attr('content'));
                },
                success: $.proxy(function (resp) {
                    //console.log('done ' + api.url);
                    //if ($('meta[name="profile"]').attr('content') === 'development') GO.util.store.set(key, resp, {type : 'session'});
                    this.resp = resp;
                    initCallback.call(this, resp);
                    this.promise.resolve(resp);
                }, this)
            });
        }

        return this;
    };

    /**
     * registry 는 한번만 허용한다.
     */
    GO.registry = function (key, initCallback) {
        var sender = senderMap[key];
        if (sender) {
            console.warn('already exist key');
            return;
        }
        sender = new Sender(key, initCallback);
        senderMap[key] = sender;

        return sender.promise;
    };

    /**
     * registry 가 선행되야한다.
     */
    GO.fetch = function (key) {
        var sender = senderMap[key];
        if (!sender) {
            console.warn('key does not exist');
            return;
        }

        return sender.promise;
    };

    /*
     * 전역 관리 코드 getter/setter
     * GO.constant(category) => get all codes in category
     * GO.constant(category, key) => get specific code in category
     * - 존해하지 않으면 null 값 반환
     */
    GO.constant = function (category, key) {
        if (!Constants[category]) throw new Error("[T.const] Invalide category");
        return (typeof key === 'undefined' ? Constants[category] : (Constants[category][key] || null));
    };

    var Config = function () {

        this.__config__ = {
            contextRoot: contextRoot,
            mailRoot: mailRoot,
            mailAccountStatus: 'enabled',
            instanceType: instanceType,
            revision: GO.revision,
            deviceType: deviceType,
            root: [contextRoot + instanceType + "/"].join(""),
            baseUrl: GO.baseUrl || "/resources/js",
            emoticonBaseUrl: '/resources/images/emoticon',
            locale: GO.locale,
            editorName: GO.editorName,
            brandName: GO.brandName,
            useHashbang: false,
            trustCertification: false,
            hasMobilePack: false,
            attachFileUpload: false,
            pcLinkUrl: '',
            usePcMessenger: false,
            useMobility: false,
            // 세션 파기 시간 (초단위, 기본 : 30분)
            sessionDestroyTime: GO.constant("cache", "DESTROY_TIME"),
            packages: [],  //사용중인 appName
            editorConfig: {
                editorName: 'SmartEditor',
                options: {}
            },
            passwordSearchFeature: false,
            useOtp: false,   // otp 설정
            useCert: false,  //공인인증서 로그인 설정
            googleAnalyticsOption: GO.googleAnalyticsOption || undefined, 	// 구글 분석기 UA 값,
            fileUploadType: 'JQUERY'
        };
    };

    Config.prototype = {
        config: function (key, newVal) {
            return (typeof newVal === 'undefined' ? this._getConfig(key) : this._setConfig(key, newVal));
        },

        _getConfig: function (key) {
            return this.__config__[key];
        },

        _setConfig: function (key, value) {
            if (key === '__source__') return;
            if (!(key in this.__config__)) this.__config__[key] = {};
            this.__config__[key] = value;
            return this.__config__[key];
        }
    };

    window["GO_config"] = new Config();

    GO.registry('baseConfig', function (resp) {
        if (resp.code !== '200') {
            throw new Error("어플리케이션 실행시 오류가 발생하였습니다.(baseconfig 로드 에러)");
        }

        var model = resp.data;

        $.extend(true, window.GO_config.__config__, {
                "menuList": model.menuConfigModel,
                "trustCertification": model.trustCertification,
                "hasMobilePack": model.hasMobilePack,
                "attachFileUpload": model.attachFileUpload,
                "pcLinkUrl": model.pcLinkUrl,
                "usePcMessenger": model.usePcMessenger || false,
                "useMobileApp": model.useMobileApp || false,
                "editorConfig": model.editorConfig,
                "passwordSearchFeature": model.passwordSearchFeature || false,
                "mobileConfig": model.mobileConfig,
                "useOtp": model.useOtp,
                "useCert": model.useCert,
                "mailExposure": model.mailExposure,
                "useSiteNameConfig": model.useSiteNameConfig,
                "useOrgUnfoldConfig": model.useOrgUnfoldConfig,
                "allowedFileUploadSize": model.allowedFileUploadSize,
                "commonAttachConfig": model.commonAttachConfig,
                "isWebFolderAvailable": model.webFolderAvailable
            },

            model.displayConfigModel,
            model.notiConfigModel
        );

        // 원본도 남긴다.
        window.GO_config.__config__['__source__'] = model;
        _.each(window.GO_config.__config__.menuList, function (prop, pkg) {
            if (prop.status == 'online' && !prop.subMenuType) window.GO_config.__config__.packages.push(prop.appName);
        }, this);
    });

    GO.registry('siteConfig', function (resp) {
        var model = resp.data;

        if (resp.code !== '200') {
            throw new Error("어플리케이션 실행시 오류가 발생하였습니다.(siteConfig 로드 에러)");
        }

        $.extend(true, window.GO_config.__config__, {
            "editorConfig": model.editorConfig,
            "mobileService": model.mobileService,
            "orgSyncWaitMin": model.orgSyncWaitMin
        });
    });

    /*
     * 환경 변수 getter/setter
     * GO.config(key) => getter
     * GO.config(key, value) => setter
     *
     * @TODO: userside와 admin에서 모두 사용할 수 있는 형태로 리팩토링 필요
     */
    GO.config = (function () {
        return function (key, newVal) {
            //console.log(key + ' : ' + window["GO_config"].config(key, newVal));
            return window["GO_config"].config(key, newVal);
        };
    })();

    window["GO_Session"] = new Session(null, {instanceType: GO.instanceType});
    GO.registry('session', function (resp) {
        window.GO_Session.updateSession(resp.data);
    });

    var emoticonGroups = {};
    GO.registry('emoticonGroups', function (resp) {
        if (resp.code !== '200') {
            throw new Error("어플리케이션 실행시 오류가 발생하였습니다. (emoticonGroups 로드 에러)");
        }
        emoticonGroups = resp.data;
    });

    GO.emoticonGroups = (function () {
        return emoticonGroups;
    });

    /*
     * 세션 변수 getter
     * GO.session(key) => getter
     * - 로그인 후 세션 정보를 서버에서 받아서 저장
     * - 기본 캐시 파기 시간(30분)이 존재하며, 캐시 파기 시간이 파기 시간 후 처음 호출되는 순간 서버에 다시 요청
     * - 브라우저 리로드 되면 다시 서버에 요청
     * - setter는 없음
     */
    GO.session = function (key) {
        //console.log(key + ' : ' + window["GO_Session"].get(key));
        return (typeof key === 'undefined' ? window["GO_Session"].toJSON() : window["GO_Session"].get(key));
    };

    GO.isAdvancedTheme = function () {
        return this.session()['theme'] == 'THEME_ADVANCED';
    };

    /*
     * GO.EventEmitter
     * 이벤트 중개인(발행인)
     */
    GO.EventEmitter = {
        __category__: {},

        create: function (category) {
            if (!(category in this.__category__)) {
                this.__category__[category] = {};
                _.extend(this.__category__[category], Backbone.Events);
            }
            return this.__category__[category];
        },

        on: function (category, event, callback, context) {
            var emitter = this.create(category);
            return emitter.on.apply(emitter, _slice.call(arguments, 1));
        },

        bind: function (category, event, callback, context) {
            return this.on(category, event, callback, context);
        },

        off: function (category, event, callback, context) {
            var emitter = this.create(category);
            return emitter.off.apply(emitter, _slice.call(arguments, 1));
        },

        unbind: function (category, event, callback, context) {
            return this.off(category, event, callback, context);
        },

        trigger: function (category, event, args) {
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
    GO.i18n = function (str, keyOrVars, value) {
        var compiled = Hogan.compile(str),
            tvars = {};

        if (typeof keyOrVars === 'object') {
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

    GO.isAvailableApp = function (appName) {
        var packages = this.config('packages') || [];
        return $.inArray(appName, packages) >= 0 || isEhrApp(appName);

        function isEhrApp(appName) {
            var ehrSubMenu = ["timeline", "vacation", "welfare", "hr"];
            if (_.indexOf(ehrSubMenu, appName) > -1) {
                var ehrMenuModel = new (Backbone.Model.extend({url: "/api/ehr/menu/active"}));
                ehrMenuModel.fetch({async: false});
                return ehrMenuModel.get(appName + "MenuActive");
            }

            return false;
        }
    };

    //메일 통합검색용.....
    window.POPUPDATA = {};
    window.USE_WEBFOLDER = {};
    window.USE_CALENDAR = {};
    window.USE_CONTACT = {};
    window.MAIL_EXPOSURE = {};
    window.getPopupData = function () {
        var menus = GO.config("menuList");
        if (menus && menus.length > 0) {
            for (var i = 0; i < menus.length; i++) {
                if (menus[i].appName == "webfolder" && menus[i].status == "online") {
                    USE_WEBFOLDER = true;
                }
                if (menus[i].appName == "contact" && menus[i].status == "online") {
                    USE_CONTACT = true;
                }
                if (menus[i].appName == "calendar" && menus[i].status == "online") {
                    USE_CALENDAR = true;
                }
            }
        }

        // GO-41077
        USE_WEBFOLDER = GO.config('isWebFolderAvailable');
        MAIL_EXPOSURE = GO.config("mailExposure");

        return POPUPDATA;
    };
    window.getUseWebfolder = function () {
        return USE_WEBFOLDER;
    };
    window.getUseCalendar = function () {
        return USE_CALENDAR;
    };
    window.getUseContact = function () {
        return USE_CONTACT;
    };
    window.getMailExposure = function () {
        return MAIL_EXPOSURE;
    };
    window.mailControl = {};
    window.mailControl.getCurrentFolder = function () {
        return POPUPDATA.folder;
    };

    return GO;
});
