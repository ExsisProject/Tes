var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  return path;
};

allTestFiles.push("/base/test/config/main.js");

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.\
    var path = pathToModule(file);
    allTestFiles.push(path);
  }
});

require.config({
//    baseUrl: GO.baseUrl + "app",
    baseUrl: "/base/app/",

    hgn: {
         templateExtension: ".html"
    },
    
    // dynamically load all test files
    deps: allTestFiles,
    
    config : {
        i18n : {
            locale: GO.locale
        },
        // moment 2.x 부터 amd 패턴과 같이 사용될 경우 글로벌 객체로 등록하는 것은 deprecated 되었다....
        // 따라서 아래의 옵션을 설정해야 함...
        moment: {
            noGlobal: false
        }
    },
    waitSeconds: 20,

    paths: {
        // folders..
        "app" : "../test/config/app",
        "router" : "../test/config/router",
        "conf": "../conf",
        "configs": "../conf", // 과거 호환(추후 삭제)
        "plugins": "../plugins",
        "lang": "../lang",
        "default-lang": "../lang/ko",
        "stylesheets": "../../css",
        // !! danger !!
        // go-nametags 와 같이 따로 path 가 지정된 lib 는
        // require 할때 libraries/go-nametags 의 형태로 사용하면 안된다.
        // ie10 에서 timeout error 발생함.
        "libraries": "../libs",
        "libs": "../libs",
        "components": "../components",
        "constants" : "../test/config/constants",

        // shortcut
        "hogan": "../vendors/hogan",
        "smarteditor": "../vendors/smartEditor/js/HuskyEZCreator",
        // 웹에디터 공통
        "webeditor": "../libs/go-webeditor",
        // 양식편집기 공통
        "formeditor": "../libs/go-formeditor",
        // 양식편집기 공통유틸
        "formutil" : "../libs/go-formutil",
        "formparse" : "../libs/go-formparse",
        "strophe": "../vendors/strophe/strophe",
        "bonegirl" : "../libs/bone-girl",
        "swfupload" : "../vendors/swfupload/swfupload",
        "swfupload.plugin" : "../vendors/swfupload/plugin/jquery.swfupload",
        "raphael": "../vendors/raphael.2.1.2",
        "justgage": "../vendors/justgage/justgage.1.0.1",
        "browser": "../vendors/browser",
        "axisj": "../vendors/axisj/lib/AXJ",
        "mousetrap": "../vendors/mousetrap",

        // plugins...
        // requirejs 플러그인들은 네임스페이스 없이, 그외 플러그인들은 {라이브러리명}.{플러그인명} 으로 이름을 부여한다.
        "text": "../vendors/requirejs/plugins/text",
        "json": "../vendors/requirejs/plugins/json",
        "registry": "../vendors/requirejs/plugins/registry/main",
        "i18n": "../vendors/requirejs/plugins/i18n",
        "hgn": "../vendors/requirejs/plugins/hgn",
        "css": "../vendors/requirejs/plugins/css/css",

        // jquery plugins
        "jquery.ui": "../vendors/jquery/jquery-ui/js/jquery-ui-1.10.3.custom",
        "jquery.datepicker": '../vendors/jquery/jquery-ui/js/jquery-ui-1.10.3.datepicker',
        "jquery.progressbar" : '../vendors/jquery/jquery-ui/js/jquery.progressbar',
        "jquery.bootstrap" : "../vendors/jquery/bootstrap/js/bootstrap",
        "jquery.dataTables" : "../vendors/jquery/plugins/dataTables/js/jquery.dataTables",
        "jquery.jstree" : "../vendors/jquery/plugins/jstree/jquery.jstree",
        "jquery.nanoscroller": "../vendors/jquery/plugins/nanoscroller/jquery.nanoscroller",
        "jquery.fancybox":"../vendors/jquery/plugins/fancybox/jquery.fancybox",
        "jquery.placeholder":"../vendors/jquery/plugins/placeholder/jquery.placeholder.min",
        "jquery.printElement":"../vendors/jquery/plugins/jquery.printElement",
        "jquery.autocomplete":"../vendors/jquery/plugins/jquery.autocomplete",
        "jquery.mobile.autocomplete":"../vendors/jquery/plugins/jquery.mobile.autocomplete",

        "jquery.fileupload":"../vendors/jquery/jquery-fileupload/jquery.fileupload",
        "jquery.jqplugin":"../vendors/jquery/plugins/jquery.jqplugin.1.0.2.min",
        "jquery.ui.widget":"../vendors/jquery/jquery-fileupload/vendor/jquery.ui.widget",
        "jquery.iframe-transport":"../vendors/jquery/jquery-fileupload/jquery.iframe-transport",

        "jquery.ajaxmock": "../vendors/jquery/plugins/jquery.ajaxmock",
        "jquery.mockjax": "../vendors/jquery/plugins/jquery.mockjax",
        "jquery.maskMoney": "../vendors/jquery/plugins/jquery.maskMoney",
        "jquery.dotdotdot" : "../vendors/jquery/plugins/jquery.dotdotdot",

        // 기타 플러그인들
        "backbone.routefilter": "../vendors/backbone/plugins/backbone.routefilter",
        "backbone.touch": "../vendors/backbone/plugins/backbone.touch",
        "swipe" : "../vendors/swipe/swipe",

        //mobile
        "iscroll" : "../vendors/iscroll/iscroll",
        "jquery.mobile" : "../vendors/jquery/jquery-mobile/jquery.mobile.custom", // touch & page

        //jQuery 자체 확장 모듈
        "jquery.go-sdk" : "../libs/go-jssdk",
        "jquery.go-popup" : "../libs/go-popup",
        "jquery.go-nodetree" : "../libs/node/go-nodetree",
        "jquery.go-nodelist" : "../libs/node/go-nodelist",
        "jquery.go-org" : "../libs/node/go-org",
        "jquery.go-orgslide" : "../libs/node/go-orgslide",
        "jquery.go-aliasorgslide" : "../libs/node/go-aliasorgslide",
        "jquery.go-aliasnodelist" : "../libs/node/go-aliasnodelist",
        "jquery.go-orgtab" : "../libs/node/go-orgtab",
        "jquery.go-grid" : "../libs/go-grid",
        "jquery.go-validation" : "../libs/go-validation",
        "jquery.calbean" : "../libs/calbean/calbean",
        "jquery.go-preloader" : "../libs/go-preloader",
        "jquery.go-recurrence" : "../libs/go-recurrence",
        "jquery.go-placeholder" : "../libs/go-placeholder",

        // 기타 바로가기
        "GO.util" : "../libs/go-util",
        "GO.m.util" : "../libs/go-mobile-util",
        "formspy": "../libs/go-formspy",
        "go-notification": "../test/mocks/go-notification",
        "go-ignoreduplicatemethod": "../libs/go-ignoreduplicatemethod",
        "go-gadget": "../libs/go-gadget",
        "go-nametags": "../libs/go-nametags",
        "go-datastore": "../libs/go-datastore",
        "go-notice" : "../libs/go-notice",
        "go-calendar": "../libs/go-calendar",
        "go-charts": "../libs/go-charts",
        "go-map": "../libs/go-map",

        // 플러그인
        "dashboard": "../plugins/dashboard",
        "calendar" : "../plugins/calendar",
        "board" : "../plugins/board",
        "community" : "../plugins/community",
        "admin" : "../plugins/admin",
        "contact" : "../plugins/contact",
        "asset" : "../plugins/asset",
        "survey" : "../plugins/survey",
        "approval" : "../plugins/approval",
        "system" : "../plugins/system",
        "report" : "../plugins/report",
        "task" : "../plugins/task",
        "todo" : "../plugins/todo",
        "note" : "../plugins/note",

        // only development
        "jquery" : "../vendors/jquery/jquery-1.10.2",
        "jquery-migrate" : "../vendors/jquery/jquery-migrate-1.2.1",
        "underscore" : "../vendors/lodash",
        "json2" : "../vendors/json2",
        "backbone" : "../vendors/backbone/backbone",
        "moment" : "../vendors/moment/moment-2.4.0",
        "amplify" : "../vendors/amplify",

        "jquery.ui.locale.ko" : "../vendors/jquery/jquery-ui/lang/jquery.ui.datepicker-ko",
        "jquery.ui.locale.ja" : "../vendors/jquery/jquery-ui/lang/jquery.ui.datepicker-ja",
        "jquery.ui.locale.en" : "../vendors/jquery/jquery-ui/lang/jquery.ui.datepicker-en-AU",
        "jquery.ui.locale.zh_CN" : "../vendors/jquery/jquery-ui/lang/jquery.ui.datepicker-zh_CN",
        "jquery.ui.locale.zh_TW" : "../vendors/jquery/jquery-ui/lang/jquery.ui.datepicker-zh_TW",

        "jquery.cookie" : "../vendors/jquery/plugins/jquery.cookie",

        "jquery.jstree.hotkeys" : "../vendors/jquery/plugins/jstree/_lib/jquery.hotkeys",

        "jquery.fancybox-thumbs" : "../vendors/jquery/plugins/fancybox/helpers/jquery.fancybox-thumbs",
        "jquery.fancybox-buttons" : "../vendors/jquery/plugins/fancybox/helpers/jquery.fancybox-buttons",

        // only production
        "vendors" : "../vendors",
        
        "mail-swfupload" : "../plugins/mail/swfupload/swfupload",
        "mail-jqueryupload" : "../plugins/mail/libs/jquery.swfupload"
    },

    packages: [
        {
            name : "comment",
            location : "../components/comment"
        },
        {
            name : "m_comment",
            location : "../components/m_comment"
        },
        {
            name : "editor_inlineImg_upload",
            location : "../components/inlineUpload"
        },
        {
            name : "email_send_layer",
            location : "../components/emailSend"
        },
    /**
     * @deprecated
     * go-charts 사용하세요...
     * go-charts 포함사항(jquery.flot 및 플러그인, raphael, justgage)
     */
        {
            name: "jquery.flot",
            main: "jquery.flot",
            location: "../vendors/jquery/plugins/flot"
        },
        {
            name: "when",
            main: "when",
            location: "../vendors/when"
        },
        {
            name : "file_upload",
            location : "../components/fileupload"
        },
        {
            name : "attach_file",
            location : "../components/attach_file"
        },
        {
            name : "favorite",
            location : "../components/favorite"
        },
        {
            name : "picker",
            location : "../components/picker"
        },
        {
            name : "print",
            location: "../components/print"
        }
        
    ],

    shim: {
        "backbone": {
            deps: ["underscore", "jquery", "json2"],
            exports: "Backbone"
        },
        "underscore": { exports: "_" },
        "hogan": { exports: "Hogan" },
        "amplify": {
            deps: ["jquery", "json2"],
            exports: "amplify"
        },
        "strophe": {
            deps: ["jquery"],
            exports: "Strophe"
        },
        "hgn": ["hogan"],
        "axisj": {
            deps: ["jquery"],
            exports: "AXJ",
            init: function($) {
                require(["css!../vendors/axisj/ui/arongi/AXJ.min"]);
            }
        },

        "jquery.dataTables": ["jquery"],
        "jquery.go-sdk" : ["jquery"],
        "jquery.go-popup" : ["jquery"],
        "jquery.go-org" : ["jquery", "jquery.ui","jquery.jstree", "jquery.placeholder", "jquery.go-nodetree", "jquery.go-nodelist" ],
        "jquery.go-orgslide" : ["jquery", "jquery.ui", "jquery.jstree", "jquery.placeholder", "jquery.go-nodetree", "jquery.go-nodelist"],
        "jquery.go-aliasorgslide" : ["jquery", "jquery.ui", "jquery.jstree", "jquery.placeholder", "jquery.go-aliasnodelist"],
        "jquery.go-orgtab" : ["jquery", "jquery.ui", "jquery.jstree", "jquery.placeholder", "jquery.go-nodetree", "jquery.go-nodelist"],
        "jquery.go-grid" : ["jquery", "jquery.dataTables", "jquery.go-sdk", "jquery.go-popup"],
        "jquery.go-validation" : ["jquery"],
        "go-notice" : ["jquery", "jquery.ui"],
        "jquery.go-preloader" : ["jquery"],
        "jquery.calbean" : ["jquery"],
        "jquery.bootstrap" : ["jquery"],
        "jquery.mobile" : {
            deps: ["jquery"],
            init: function($) {
                require(["css!../vendors/jquery/jquery-mobile/jquery.mobile.custom"]);
            }
        },
        "jquery.nanoscroller" : {
            deps: ["jquery"],
            init: function($) {
                require(["css!../vendors/jquery/plugins/nanoscroller/nanoscroller"]);
            }
        },
        "jquery.placeholder" : ["jquery"],
        "jquery.flot": {
            deps: ["jquery"],
            init: function() {
                require([
                    "jquery.flot/jquery.flot.pie",
                    "jquery.flot/jquery.flot.stack",
                    "jquery.flot/jquery.flot.orderBars",
                    "jquery.flot/jquery.flot.tooltip",
                    "jquery.flot/jquery.flot.selection"
                ]);
            }
        },
        "jquery.flot/jquery.flot.pie": ["jquery.flot"],
        "jquery.flot/jquery.flot.stack": ["jquery.flot"],
        "jquery.flot/jquery.flot.orderBars": ["jquery.flot"],
        "jquery.flot/jquery.flot.tooltip": ["jquery.flot"],
        "jquery.flot/jquery.flot.selection": ["jquery.flot"],
        "swipe" : ["jquery"],
        "backbone.routefilter": ["backbone"],
        "GO.util": ["underscore", "moment", 'amplify'],
        "formspy": {
            deps: ["jquery", "underscore"],
            exports: "FormSpy"
        },
        "go-notification": {
            deps: ["jquery", "strophe"],
            exports: "GONotification"
        },

        "go-ignoreduplicatemethod": {
            deps: ["jquery"],
            exports: "GOIgnoreDuplicateMethod"
        },

        "justgage": {
            deps: ["raphael"],
            exports: "JustGage"
        },

        "when/sequence": ["when"],

        // only development
        "jquery" : {
            exports: "$"
        },
        "jquery-migrate" : ["jquery"],
        "jquery.ui" : {
            deps: ["jquery"],
            init: function($) {
                if(GO.locale !== 'en') {
                    require(["jquery.ui.locale." + GO.locale]);
                }
            }
        },

        // for mobile
        "jquery.datepicker" : {
            deps: ["jquery"],
            init: function($) {
                if(GO.locale !== 'en') {
                    require(["jquery.ui.locale." + GO.locale]);
                }
            }
        },

        "jquery.ui.locale.ko": ["jquery", "jquery.ui"],
        "jquery.ui.locale.ja": ["jquery", "jquery.ui"],
        "jquery.ui.locale.en" :  ["jquery", "jquery.ui"],
        "jquery.ui.locale.zh_CN" :  ["jquery", "jquery.ui"],
        "jquery.ui.locale.zh_TW" :  ["jquery", "jquery.ui"],

        "jquery.cookie" : ["jquery"],
        "jquery.jstree.hotkeys" : ["jquery"],
        "jquery.jstree" : ["jquery", "jquery.cookie"],

        "jquery.fancybox" : ["jquery", "jquery-migrate"],
        "jquery.fancybox-thumbs" : ["jquery.fancybox"],
        "jquery.fancybox-buttons" : ["jquery.fancybox"],

        "jquery.fileupload": ["jquery", "jquery.ui", "jquery.iframe-transport"],

        "libs/go-utils": ["jquery", "amplify"],
        "jquery.mockjax" : ["jquery"],
        "jquery.ajaxmock" : ["jquery"]
    },

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start

});
