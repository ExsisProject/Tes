define('works/views/app/base_applet', function (require) {

    var Backbone = require('backbone');
    var when = require('when');

    var LayoutView = require('works/views/app/layout');
    var AppContentTopView = require('works/views/app/layout/app_content_top');
    var AppHomeSide = require("works/components/app_home/views/app_home_side");
    var GuideView = require('works/components/guide_layer/views/guide_layer');

    var FilterManager = require('works/components/filter/models/filter_manager');
    var Share = require('works/models/applet_share');
    var Applets = require("works/collections/applet_simples");
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');

    var worksLang = require("i18n!works/nls/works");

    var NoExistAccessibleForm = Hogan.compile([
        '<div class="error_page"><hgroup><span class="ic_data_type ic_error_page"></span><h2>{{title}}</h2></hgroup>',
        '{{#message}}<p class="desc">{{&.}}</p>{{/message}}'
    ].join(""));

    var Promise = function () {
        return when.promise.apply(this, arguments);
    };

    /**
     * 개별 애플릿뷰의 상위 뷰
     * - 모든 애플릿 뷰는 이 뷰를 상속받아야 한다.
     * - 모든 애플릿 뷰는 상단에 애플릿의 제목과 설명, 환경설정으로 갈 수 있는 버튼이 나타난다.
     * - 모든 애플릿 뷰의 사이드는 동일하게 다른 앱 가기, 필터 목록이 나타난다.
     */
    return Backbone.View.extend({
        className: 'content_page',

        appletId: null,
        baseConfigModel: null,
        pageName: null,
        sideView: null,

        initialize: function (options) {
            options = options || {};
            this.layoutView = new LayoutView();

            this.appletId = options.appletId;
            this.baseConfigModel = new AppletBaseConfigModel({"id": options.appletId, access: true});

            this.applets = new Applets();
            this.filters = new FilterManager({appletId: this.appletId});
            this.share = new Share({id: this.appletId});
            this.useSearch = options.useSearch;
            this.subFormId = options.subFormId;

            this.getAccessibleForms();
        },

        render: function () {
            return $.when(
                this.baseConfigModel.fetch(),
                this.share.fetch(),
                this.layoutView.render()
            ).then($.proxy(function () {
                this._renderSide(this.layoutView);
            }, this)).then($.proxy(function () {
                var contentTopView = new AppContentTopView({
                    baseConfigModel: this.baseConfigModel,
                    pageName: this.pageName,
                    useSearch: this.useSearch
                });
                var content = this.layoutView.getContentElement();
                content.html(contentTopView.el);
                contentTopView.render();
                this.layoutView.setContent(this);
                if ($(content.next()).hasClass('go_content')) {
                    content.next().remove();
                }
            }, this));
        },

        _renderSide: function (layoutView) {
            return new Promise($.proxy(function (resolve) {
                this.sideView = new AppHomeSide({
                    appletId: this.appletId,
                    accessibleForms: this.accessibleForms,
                    filters: this.filters,
                    isAdmin: this.baseConfigModel.isAdmin(GO.session('id')),
                    applets: this.applets,
                    share: this.share,
                    baseConfigModel: this.baseConfigModel,
                    subFormId: this.subFormId
                });
                layoutView.getSideElement().html(this.sideView.render().el);
                this._renderGuide();

                resolve();
            }, this));
        },
        _renderGuide: function () {
            if (GO.locale == 'ko') {
                var guideSideView = new GuideView({'isSetting': false});
                $(".go_side #guide_area").html(guideSideView.render().el);
                $("#guideBadge").draggable({containment: "body"});
                var createdAt = this.baseConfigModel.get('createdAt');
                guideSideView.displayNewAppGuide(createdAt);
            }
        },
        /**
         * 모델 패치(Promise 객체)
         */
        asyncFetch: function (model) {
            return new Promise(function (resolve, reject) {
                model.fetch({
                    success: resolve,
                    error: reject,
                    statusCode: {
                        400: function () {
                            GO.util.error('400', {"msgCode": "400-works"});
                        },
                        403: function () {
                            GO.util.error('403', {"msgCode": "400-works"});
                        },
                        404: function () {
                            GO.util.error('404', {"msgCode": "400-works"});
                        },
                        500: function () {
                            GO.util.error('500');
                        }
                    }
                });
            });
        },

        /**
         * 애플릿 컨텐츠 부분 렌더링(Abstract)
         */
        renderContent: function () {
            this.$el.append(
                '<p class="data_null">' +
                '<span class="ic_data_type ic_no_comm"></span>' +
                '<span class="txt">아직 뷰가 구현되지 않았네요. 뷰를 구현해주세요!</span>' +
                '<br>' +
                '</p>'
            );
        },

        _renderNoExistForm: function (el) {
            el.html(NoExistAccessibleForm.render({
                "title": worksLang['폼 접근권한이 없습니다.'],
                "message": [
                    worksLang['폼 접근권한 없음 설명']
                ]
            }));
            return;
        },

        _renderNoExistReport: function (el) {
            el.html(NoExistAccessibleForm.render({
                "title": worksLang['리포트 접근권한이 없습니다.'],
                "message": [
                    worksLang['폼 접근권한 없음 설명']
                ]
            }));
            return;
        },

        getAccessibleForms: function () {
            var data = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-searchObject') || {};
            var self = this;
            $.ajax({
                type: "GET",
                dataType: "json",
                async: false,
                url: GO.config('contextRoot') + "api/works/applets/" + this.appletId + "/accessible/form/list",
                success: function (resp) {
                    self.accessibleForms = resp.data;

                    if (data.subFormId) {
                        self.subFormId = data.subFormId;
                    } else {
                        var firstForm = self.accessibleForms[0];
                        if (!_.isUndefined(firstForm)) {
                            if (firstForm.mainForm) {
                                self.subFormId = null;
                            } else {
                                self.subFormId = firstForm.id;
                            }
                        }
                    }
                }, error: function (resp) {
                    if (resp.responseJSON && resp.responseJSON.code === '403') {
                        GO.util.error('403', {'msgCode': '400-works'});
                    } else {
                        GO.util.error('500', {'msgCode': '500'});
                    }
                }
            });
        }
    });
});
