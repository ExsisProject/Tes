(function(require, window, undefined) {
    var metaTag = {}
    getMetaValues();

    function getMetaValue( key, defaults ) {
        return metaTag[key] || defaults || '';
    }

    function getMetaValues() {
        var metaTags = document.getElementsByTagName('meta');
        for(var i=0, len=metaTags.length; i < len; i++) {
            metaTag[metaTags[i].name] = metaTags[i].content;
        }
    }

    function getLocale() {
        return getMetaValue( 'locale', 'ko' );
    }

    function getRevision() {
        return getMetaValue( 'revision', (new Date()).getTime() );
    }

    function getContextRoot() {
        return getMetaValue( 'base', '/' );
    }

    function findPath() {
        //return getContextRoot() + "resources/dist/js/";
        return getContextRoot() + "resources/js/";
    }

    function getProfile() {
        //return 'production';
        return getMetaValue( 'profile', 'production' );
    }

    function getDeviceType() {
        return getMetaValue( 'device', 'pc' );
    }

    var baseUrl = findPath();
    var locale = getLocale();
    var revision = getRevision();
    var profile = getProfile();

    var reqConfig = {
        config : {
            i18n : {
                locale: locale
            },
            // moment 2.x 부터 amd 패턴과 같이 사용될 경우 글로벌 객체로 등록하는 것은 deprecated 되었다....
            // 따라서 아래의 옵션을 설정해야 함...
            moment: {
                noGlobal: false
            }
        },
        deps: ["main"],
        baseUrl: baseUrl + "app",
        urlArgs: "rev=" + revision,
        waitSeconds: 20,
        paths: {},
        shim: {}
    };

    if(profile === 'development') {
        define("jquery.jqplugin");
    } else {
        reqConfig.shim["boot"] = ["vendors"];
        //reqConfig.paths["axisj"] = "../../../vendors/axisj/lib/AXJ"; // 개발용
        reqConfig.paths["axisj"] = "../../vendors/axisj/lib/AXJ";

        if(getDeviceType() === 'mobile') {
            //reqConfig.paths["vendors"] = '../mobile-vendors';
            reqConfig.shim["vendors"] = {
                init: function() {
                    initCommonVendors();
                    define("jquery.mobile.autocomplete");
                    define("jquery.mobile");
                }
            };
        } else {
            reqConfig.shim["vendors"] = {
                init: function() {
                    initCommonVendors();
                    define("jquery.autocomplete");
                    define("jquery.dotdotdot");
                    define("jquery.maskMoney");
                    define("jquery.inputmask");
                    define("jquery.printElement");
                    define("jquery.jqplugin");
                    define("jquery.nanoscroller");
                    define("jquery.tooltipster");
                    define("jquery.jstree");
                    define("jquery.fancybox");
                }
            };
        }

        function initCommonVendors() {
            define("jquery", [], function() {
                return jQuery;
            });

            define("json2");

            define("underscore", [], function() {
                return _;
            });

            define("backbone", [], function() {
                return Backbone;
            });

            define("moment", [], function() {
                return moment;
            });

            define("amplify", [], function() {
                return amplify;
            });

            define("backbone.routerfilter");
            define("jquery.cookie");
            define("jquery.placeholder");
            define("browser");
            define("text");
            define("json");
            define("i18n");
        }


        reqConfig.shim["app"] = {
            deps: ["boot"],
            init: function() {
                define("GO.util");
                define('jquery.go-validation');
                define('jquery.go-sdk');
            }
        };

        reqConfig.shim["jquery.jstree"] = {
            deps: ["jquery"],
            init: function($) {
                define("jquery.jstree.hotkeys");
            }
        };

        reqConfig.shim["jquery.fancybox"] = {
            deps: ["jquery", "jquery.cookie"],
            init: function($) {
                define("jquery.fancybox-thumbs");
                define("jquery.fancybox-buttons");
            }
        };

        reqConfig.shim["go-charts"] = {
            deps: ["jquery"],
            init: function() {
                define("jquery.flot");
                define("jquery.flot/jquery.flot.pie");
                define("jquery.flot/jquery.flot.stack");
                define("jquery.flot/jquery.flot.orderBars");
                define("jquery.flot/jquery.flot.tooltip");
                define("jquery.flot/jquery.flot.selection");
                define("raphael");
                define("justgage");
            }
        };
    }

    require.config( reqConfig );
})(require, window);