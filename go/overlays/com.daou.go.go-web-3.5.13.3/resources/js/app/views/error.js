;(function () {
    define([
            "backbone",
            "app",
            "hgn!templates/error",
            "i18n!nls/commons",
            "i18n!works/nls/works"
        ],

        function (
            Backbone,
            GO,
            Template,
            Lang,
            worksLang
        ) {
            var title, message;

            function makeErrorMsgWrapper(title, messages) {
                return Template({
                    "title": title,
                    "messages": messages,
                    "label_prev": Lang["확인"],
                    "hasPrev": history.length > 1 ? true : false
                });
            }

            function make400ErrorMsg(pkgname) {

                var resource = {
                        'board': Lang["게시물"],
                        'calendar': Lang["일정"],
                        'community': Lang["게시물"],
                        'contact': Lang['주소록'],
                        'survey': Lang['설문'],
                        'report': Lang['보고서'],
                        'works': Lang['앱 또는 데이터'],
                        'asset': Lang['예약']
                    }[pkgname] || Lang["자료"],
                    target = {
                        'board': Lang['게시판'],
                        'calendar': Lang["비공개 일정"],
                        'community': Lang["커뮤니티"],
                        'contact': Lang['주소록'],
                        'survey': Lang['설문'],
                        'report': Lang['보고서'],
                        'works': Lang['앱 또는 데이터'],
                        'asset': Lang['예약']
                    }[pkgname] || Lang["자료"],
                    title = [
                        GO.i18n(Lang["{{resource}}이(가) 존재하지 않습니다."], {"resource": resource})
                    ],
                    messages = [
                        GO.i18n(Lang["해당 {{resource}}은(는) 삭제되었거나,"], {"resource": resource}),
                        GO.i18n(Lang["{{target}}에 대한 접근 권한이 없어 확인할 수 없습니다."], {"target": target})
                    ];

                return makeErrorMsgWrapper(title, messages);
            }

            function make500ErrorMsg() {
                return makeErrorMsgWrapper(Lang["서비스 이용에 불편을 드려 죄송합니다"], [Lang["관리 서버에 오류가 발생하였습니다"] + ' ' + Lang["시스템 운영자에게 문의해 주시기 바랍니다"]]);
            }

            title = {
                "common": Lang["공통 오류페이지 타이틀"],
                "403": Lang["403 오류페이지 타이틀"],
                "404": Lang["404 오류페이지 타이틀"],
                "500": Lang["500 오류페이지 타이틀"]
            };

            message = {
                "403": make400ErrorMsg(), // 기존 호환성 유지
                "404": make400ErrorMsg(), // 기존 호환성 유지
                "500": make500ErrorMsg(),
                "400-common": make400ErrorMsg(),
                "400-board": make400ErrorMsg('board'),
                "400-calendar": make400ErrorMsg('calendar'),
                "400-community": make400ErrorMsg('community'),
                "400-contact": make400ErrorMsg('contact'),
                "400-survey": make400ErrorMsg('survey'),
                "400-report": make400ErrorMsg('report'),
                "400-works": make400ErrorMsg('works'),
                "400-asset": make400ErrorMsg('asset'),
                "403-works-accessibleform": makeErrorMsgWrapper(worksLang['폼 접근권한이 없습니다.'], [worksLang['폼 접근권한 없음 설명']])
            };

            var ErrorPageView = Backbone.View.extend({
                className: "view_content",

                events: {
                    "click .btn_major_s": "_historyBack"
                },

                initialize: function (options) {
                    this.options = options || {};
                    this.errorCode = this.options.code;
                },

                getMessage: function () {
                    var qsMsgCode = GO.router.getSearch('msgcode'),
                        msgKey = qsMsgCode || this.errorCode;

                    return message[msgKey];
                },

                render: function () {
                    this.$el.append(this.getMessage());
                },

                _historyBack: function () {
                    var retUrl = GO.router.getSearch('url');

                    if (retUrl) {
                        window.location.href = retUrl;
                    } else {
                        history.back();
                    }
                }
            });

            return ErrorPageView;
        });
})();
