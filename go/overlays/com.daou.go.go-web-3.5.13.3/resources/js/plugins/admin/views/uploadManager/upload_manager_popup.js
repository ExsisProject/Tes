define('admin/views/uploadManager/upload_manager_popup', function (require) {
    var Backbone = require('backbone');
    var GO = require("app");

    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");
    var docsLang = require("i18n!docs/nls/docs");

    var MainTpl = require('hgn!admin/templates/uploadManager/main');
    var Step1View = require('admin/views/uploadManager/step1');
    var Step2View = require('admin/views/uploadManager/step2');
    var Step3View = require('admin/views/uploadManager/step3');
    var Step4View = require('admin/views/uploadManager/step4');

    require("GO.util");
    require("jquery.go-grid");


    var lang = {
        "uploadComplete": docsLang["등록 완료"],
        "user": adminLang["사용자"],
        "class": adminLang["클래스"],
        "dept": adminLang["부서"],
        "upload": commonLang["등록"],
        "한번에 끝내는": adminLang["한번에 끝내는"],
        "계정업로드 가이드보기" : adminLang["계정업로드 가이드보기"],
        "accountUploadManager": adminLang["계정 업로드 매니저"],
    };


    var PopupView = Backbone.View.extend({
        events: {
            "click .naviButton": "toggleNaviBar",
            "click #start": "moveRight",
            "click #rightButton": "moveRight",
            "click #leftButton": "moveLeft",
            "click #deptUpload": "moveDeptUpload",
            "click #classUpload": "moveClassUpload",
            "click #userUpload": "moveUserUpload",
            "click #showGuide": "showGuide",

        },
        initialize: function () {
            this.pageNum = 0;
        },

        render: function () {
            this.$el.html(MainTpl({
                contextRoot: GO.contextRoot,
                lang: lang
            }));
            this.renderPage(this.pageNum)

        },

        renderPage: function (step) {
            this.$el.find('.util_steps .on').removeClass("on");
            switch (step) {
                case 0:{
                    this.$el.find('#startPage').show();
                    this.$el.find('#mainPage').hide();
                    this.$el.find('#introDescription').html(adminLang["계정업로드매니저 시작 문구"]);
                    return;
                }
                case 1: {
                    this.$el.find('#startPage').hide();
                    this.$el.find('#mainPage').show();
                    this.$el.find('#deptUpload').css("color", "#20BEC6");
                    this.$el.find('#classUpload').css("color", "white");
                    this.$el.find('#userUpload').css("color", "white");
                    this.$el.find('#leftButton').hide();
                    this.$el.find('#rightButton').show();

                    this.Step = new Step1View();
                    break;
                }
                case 2: {
                    this.$el.find('#deptUpload').css("color", "white");
                    this.$el.find('#classUpload').css("color", "#20BEC6");
                    this.$el.find('#userUpload').css("color", "white");
                    $(this.$el.find('.util_steps li')[step-1]).addClass("on");
                    $(this.$el.find('.util_steps li')[step-2]).addClass("on");
                    this.$el.find('#leftButton').show();
                    this.$el.find('#rightButton').show();

                    this.Step = new Step2View();
                    break;
                }
                case 3: {
                    this.$el.find('#deptUpload').css("color", "white");
                    this.$el.find('#classUpload').css("color", "white");
                    this.$el.find('#userUpload').css("color", "#20BEC6");
                    this.$el.find('.util_steps li').addClass("on");
                    $(this.$el.find('.util_steps li')[step]).removeClass("on");
                    this.$el.find('#leftButton').show();
                    this.$el.find('#rightButton').show();

                    this.Step = new Step3View();
                    break;
                }
                case 4: {
                    this.$el.find('#deptUpload').css("color", "white");
                    this.$el.find('#classUpload').css("color", "white");
                    this.$el.find('#userUpload').css("color", "white");
                    this.$el.find('.util_steps li').addClass("on");
                    this.$el.find('#leftButton').show();
                    this.$el.find('#rightButton').hide();

                    this.Step = new Step4View();
                    break;
                }
                default: {
                    this.$el.find('#deptUpload').css("color", "#20BEC6");
                    this.$el.find('#classUpload').css("color", "white");
                    this.$el.find('#userUpload').css("color", "white");
                    this.$el.find('#leftButton').hide();
                    this.$el.find('#rightButton').show();

                    this.Step = new Step1View();
                }
            }
            this.$el.find('.inner').html(this.Step.$el);
            this.Step.render();
            $(this.$el.find('.util_steps li')[step-1]).addClass("on")
         },

        moveRight: function (e) {
            this.pageNum++;
            this.renderPage(this.pageNum)
        },

        moveLeft: function (e) {
            this.pageNum--;
            this.renderPage(this.pageNum)
        },

        toggleNaviBar: function (e) {
            this.$el.find('#naviButton').toggle();
            this.$el.find('#naviCloseButton').toggle();
            $("#naviBar").animate({
                width: "toggle"
            }, 300, "linear");
        },

        moveDeptUpload: function () {
            this.pageNum = 1;
            this.renderPage(this.pageNum);
            this.toggleNaviBar();
        },
        moveClassUpload: function () {
            this.pageNum = 2;
            this.renderPage(this.pageNum);
            this.toggleNaviBar();
        },
        moveUserUpload: function () {
            this.pageNum = 3;
            this.renderPage(this.pageNum);
            this.toggleNaviBar();
        },
        showGuide: function () {
            window.open(GO.contextRoot+"help/do/ko/site/pdf/upload_manager_guide.pdf");
        }
    });

    return PopupView;
});