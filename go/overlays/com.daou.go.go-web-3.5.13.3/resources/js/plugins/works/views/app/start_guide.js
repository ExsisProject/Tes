define('works/views/app/start_guide', function (require) {
    var $ = require("jquery");
    var Backbone = require('backbone');
    var when = require('when');
    var WorksUtil = require('works/libs/util');

    var WorksHomeLayout = require('works/views/app/home/works_home_layout');

    var startGuideTpl = require('hgn!works/templates/app/start_guide');

    var AppletAdminModel = require('works/models/applet_admin');

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");

    var lang = {
        '업무에 필요한 기능을 쉽고 빠르게': worksLang['업무에 필요한 기능을 쉽고 빠르게'],
        '가이드타이틀': worksLang['Works 하나로 모든 데이터와 커뮤니케이션을 관리하세요.'],
        'Works 앱 만들기': worksLang['Works 앱 만들기'],
        '쉽게 이해하는 Works 가이드': worksLang['쉽게 이해하는 Works 가이드'],
        'Works 동영상 가이드': worksLang['Works 동영상 가이드'],
        'Works 활용사례 보기': worksLang['Works 활용사례 보기'],
        '바로가기': worksLang['바로가기']
    }

    var WorksStartGuideView = Backbone.View.extend({
        className: 'go_content go_works_home',

        events: {
            'click #createAppIntro': 'goToCreateAppIntro',
            'click ul.manual_btn>li>a': 'openLink'
        },

        initialize: function () {
            this.layoutView = WorksHomeLayout.create();
            this.checkAdmin = new AppletAdminModel();
            this.isWorksAdmin = false;
        },

        render: function () {
            var self = this;
            return when(this.layoutView.render())
                .then(function fetchWorksAdmin() {
                    var deffer = when.defer();
                    when(self.checkAdmin.fetch()).then(function () {
                        self.isWorksAdmin = self.checkAdmin.get('true') ? true : false;
                        deffer.resolve();
                    });
                    return deffer.promise;
                })
                .then(function renderMe() {
                    self.layoutView.setContent(self);
                    self.layoutView.setUseOrganogram(false);

                    var tmpl = [
                        '<header class="content_top">',
                        '<h1>' + 'Works' + '</h1>',
                        '</header>'
                    ].join("");
                    var tpl = Hogan.compile(tmpl);
                    self.$el.append(tpl.render());

                    self.$el.append(Hogan.compile(startGuideTpl({
                        lang: lang,
                        baseImgUrl: GO.contextRoot + 'resources/'
                    })).render());

                }).otherwise(function printError(err) {
                    console.log(err.stack);
                });
        },
        goToCreateAppIntro: function (e) {
            if (this.isWorksAdmin) {
                e.preventDefault();
                WorksUtil.goCreateAppIntro();
            } else {
                $.goAlert(commonLang['권한이 없습니다.'], worksLang['앱없음 전체 내용']);
            }
        },
        openLink: function (e) {
            e.preventDefault();
            var guideNumber = $(e.currentTarget).attr('data-guide')
            if (guideNumber == '01') {
                window.open('https://manual.daouoffice.co.kr/hc/ko/articles/115004712354-Works-%EA%B0%80%EC%9D%B4%EB%93%9C-Part1-%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0');
            } else if (guideNumber == '02') {
                window.open('https://www.youtube.com/playlist?list=PLOoYRE87uE3nDJ7dRQ7QdP4iI_ixBdZma');
            } else if (guideNumber == '03') {
                window.open('https://daouofficeworks.com/customers');
            } else {
                return;
            }
        }
    });

    return WorksStartGuideView;
});
