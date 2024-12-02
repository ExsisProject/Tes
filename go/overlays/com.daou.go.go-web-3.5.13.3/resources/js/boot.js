define('boot', ['jquery', 'backbone', 'moment'], function ($, Backbone, moment) {

    var DEFAULT_INSTANCE_TYPE = "app";

    if (!window.GO) {
        window.GO = {};
    }

    function parseUrl(path) {
        var location = window.location,
            _ta = document.createElement('a'),
            parsedHash = {};

        _ta.setAttribute('href', path);

        parsedHash = {
            protocol: /^(http|https)/.test(_ta.protocol) ? _ta.protocol : location.protocol,
            host: _ta.host ? _ta.host : location.host,
            hostname: _ta.hostname ? _ta.hostname : location.hostname,
            port: _ta.port ? _ta.port : location.port,
            pathname: _ta.pathname[0] === '/' ? _ta.pathname : '/' + _ta.pathname,
            search: _ta.search ? _ta.search : '',
            href: _ta.href,
            hash: _ta.hash ? _ta.hash : location.hash
        };

        return parsedHash;
    }

    // Context URL이 포함되지 않은 URL을 Context URL을 포함하도록 변경
    function fixUrlPathname(url) {
        var parsedUrl = parseUrl(url),
            contextRoot = (GO.contextRoot || getContextRoot()),
            pn = parsedUrl.pathname,
            pns = pn[0] === '/' ? pn.slice(1) : pn;

        if (contextRoot && pn.indexOf(contextRoot) !== 0) {
            pn = contextRoot + pns;
        }
        return [pn, parsedUrl.search, parsedUrl.hash].join('');
    }

    function getMetaValue(key, defaults) {
        var metaTags = document.getElementsByTagName('meta'),
            result = defaults || '';

        for (var i = 0, len = metaTags.length; i < len; i++) {
            if (metaTags[i].name === key) {
                result = metaTags[i].content;
            }
        }

        return result;
    }

    function getContextRoot() {
        return getMetaValue('base', '/');
    }

    function getLocale() {
        return getMetaValue('locale', 'ko');
    }

    function getDeviceType() {
        return getMetaValue('device', 'pc');
    }

    function getRevision() {
        return getMetaValue('revision', (new Date()).getTime());
    }

    function getInstanceType() {
        var pn = location.pathname;
        var matched = /\/(app|admin|install)\/+/.exec(pn);
        var instanceType = matched[1] || DEFAULT_INSTANCE_TYPE;

        return instanceType;
    }

    function getProfile() {
        return getMetaValue('profile', 'production');
    }

    function getEditorName() {
        return getMetaValue('webeditor', 'SmartEditor');
    }

    function getBrandName() {
        return getMetaValue('brandName', 'DaouOffice');
    }

    function getGoogleTrackerId() {
        return getMetaValue('gaTrackerId');
    }

    function getUseOauthLogin() {
        return getMetaValue('useOauthLogin');
    }

    function getUseMiniGnb() {
        return getMetaValue('useMiniGnb');
    }

    function getUseLabFeedback() {
        return getMetaValue('useLabFeedback') === 'true' || false;
    }

    function getHasLabFeedbackConfig() {
        return getMetaValue('hasLabFeedbackConfig') === 'true' || false;
    }

    function getDOServiceType() {
        return getMetaValue('serviceType');
    }

    function findPath() {
        return getContextRoot() + "resources/js/";
    }

    function initJQuery() {
        var isDev = GO.profile === 'development';

        jQuery.migrateMute = !isDev;
        jQuery.migrateTrace = false;
    }

    function overrideBackbone() {
        // 전역 객체에 Backbone.Events를 확장한다.(Deprecated)
        // GO.EventEmitter 이용 할 것!!!
        _.extend(GO, Backbone.Events);

        // Backbone.Model과 Collection의 parse 함수 Override
        function newParse(resp, xhr) {
            // __go_checksum__ 이 있는 데이터만 파싱한다.
            if (!("__go_checksum__" in resp)) return resp;

            delete resp["__go_checksum__"];
            _.each(resp, function (obj, key) {
                if (key !== "data") this[key] = obj;
            }, this);
            return resp.data;
        };
        // Backbone.Model, Backbone.Collection의 parse 함수
        _.extend(Backbone.Model.prototype, {parse: newParse});
        _.extend(Backbone.Collection.prototype, {parse: newParse});

        // Backbone.sync override(컨텍스트 경로 반영)
        Backbone.sync = (function () {
            var newSync,
                orgSync = Backbone.sync;

            newSync = function (method, model, options) {
                options = (options || {});
                if (!options.url && _.result(model, 'url')) {
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

                create: function () {
                    if (this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                    return this.__instance__;
                },

                // Alias of create method...(for readable and semantic code)
                getInstance: function () {
                    return this.create();
                }
            },
            commonModelStaticProps = _.extend({}, commonStaticProps, {
                getData: function (options) {
                    options = _.defaults(options || {}, {async: false});
                    var instance = this.getInstance(),
                        deferred = $.Deferred();
                    $.when(instance.fetch(options)).done(function () {
                        deferred.resolveWith(instance);
                    });

                    deferred.promise(instance);
                    return instance;
                }
            }),
            commonViewStaticProps = _.extend({}, commonStaticProps, {
                render: function (option) {
                    var instance = this.getInstance();
                    return instance.render(option);
                }
            });

        GO.BaseModel = Backbone.Model.extend({}, commonModelStaticProps);
        GO.BaseCollection = Backbone.Collection.extend({}, commonModelStaticProps);
        GO.BaseView = Backbone.View.extend({}, commonViewStaticProps);
    }

    function setMockConsole() {
        if (!window.console) {
            window.console = {};
        }

        _.each(["log", "info", "warn", "error", "assert", "dir", "profile", "profileEnd", "debug", 'clear', 'count',
            'debug', 'dirxml', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'timeStamp', 'trace'
        ], function (name) {
            if (!window.console[name]) {
    			window.console[name] = function() {};
            }
        });
    }

    function registCommonAPI() {
        GO.contextRoot = getContextRoot();
        GO.locale = getLocale();
        GO.instanceType = getInstanceType();
        GO.deviceType = getDeviceType();
        GO.revision = getRevision();
        GO.profile = getProfile();
        GO.baseUrl = findPath();
        GO.editorName = getEditorName();
        GO.brandName = getBrandName();
        GO.useOauthLogin = getUseOauthLogin();
        GO.useMiniGnb = getUseMiniGnb();
        GO.DOServiceType = getDOServiceType();
        GO.useLabFeedback = getUseLabFeedback();
        GO.hasLabFeedbackConfig = getHasLabFeedbackConfig();
        GO.util = _.extend(GO.util || {}, {
            parseUrl: parseUrl,
            findPath: findPath,
            fixUrlPathname: fixUrlPathname
        });
        moment.lang((getLocale() || 'ko').toLowerCase().replace('_', '-'));

        // 구글 분석기 UA값이 있을 경우 저장
        var gaTrackerId = getGoogleTrackerId();
        if (gaTrackerId && gaTrackerId.length > 0) {
            GO.googleAnalyticsOption = {
                "trackerId": gaTrackerId
            };
        }
    }

    // main script
    function main() {
        registCommonAPI();
        initJQuery();
        overrideBackbone();
        createBaseModelAndView();
        setMockConsole();
    }

    // execute main script
    main();
});
