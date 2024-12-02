(function () {
    define([
            "survey/views/base/detail",

            "app",
            "survey/views/mobile/detail/response",
            "survey/views/mobile/detail/result",
            "hgn!survey/templates/mobile/detail",
            "survey/helpers/html",
            "attach_file",
            "survey/libs/util",
            "i18n!nls/commons",
            "i18n!survey/nls/survey",
            "views/mobile/header_toolbar"
        ],

        function (
            SurveyDetailBaseView,
            GO,
            DetailResponseView,
            DetailResultView,
            DetailTemplate,
            SurveyHtmlHelper,
            AttachFilesView,
            SurveyUtil,
            CommonLang,
            SurveyLang,
            HeaderToolbarView
        ) {
            var __super__ = SurveyDetailBaseView.prototype,
                SurveyDetailMobileView;

            SurveyDetailMobileView = SurveyDetailBaseView.extend({
                tagName: 'section',
                id: 'survey-datail-container',
                className: 'classic_detail',

                filterName: 'all',
                events: {
                    "vclick #copyUrl": "copyUrl",
                    "vclick .btn-modify-resp": "modifyResponse"
                },
                initialize: function () {
                    __super__.initialize.apply(this, arguments);

                    this.ResponseView = DetailResponseView;
                    this.ResultView = DetailResultView;
                    this.headerToolBarView = HeaderToolbarView;

                    _.extend(this.lang, {
                        "start_survey": SurveyLang["시작"],
                        "stop_survey": SurveyLang["중지"],
                    });

                    this.$el.data('view', this);
                    this.headerBindEvent();
                },

                headerBindEvent: function () {
                    GO.EventEmitter.off("trigger-action");
                    GO.EventEmitter.on('trigger-action', 'survey-comment', this.moveComment, this);
                    GO.EventEmitter.on('trigger-action', 'survey-start', function () {
                        this._changeStatusForMobile('temp');
                    }, this);
                    GO.EventEmitter.on('trigger-action', 'survey-stop', function () {
                        this._changeStatusForMobile('progress');
                    }, this);
                    GO.EventEmitter.on('trigger-action', 'survey-delete', this._removeSurvey, this);
                },

                release: function () {
                    var $parent = this.$el.parent();
                    // 툴바의 이벤트도 해제해준다.
                    if (this.$toolbar) this.$toolbar.off();
                    this.remove();
                    $parent.empty();
                },
                moveComment: function () {
                    GO.router.navigate("/survey/" + this.surveId + '/comments', {trigger: true});
                },
                render: function () {
                    var self = this,
                        defer = $.Deferred();

                    GO.util.appLoading(true);

                    this.model.fetch({
                        success: function (model) {

                            self.surveId = model.id;
                            self.status = model.get('status');

                            if (model.isStopped() && !model.isCreator(GO.session("id"))) {
                                SurveyUtil.alert(SurveyLang['중지된 설문'], SurveyLang['중지된 설문 안내문']);
                                GO.router.navigate('survey', {trigger: true});
                            }
                            self.$el.append(DetailTemplate({
                                "context_root": GO.config('contextRoot'),
                                "survey_id": model.id,
                                "status": model.get('status'),
                                "creator?": model.isCreator(GO.session("id")),
                                "creator": {
                                    "display_name": model.getCreatorName(),
                                    "thumbnail": (model.hasDeptName() ? null : model.get('creator').thumbnail)
                                },
                                "period": SurveyHtmlHelper.getSurveyPeriod(model),
                                "guidance": model.getGuidance(),
                                "comment_count": model.getCommentCount(),
                                "public_flag": SurveyLang["설문 결과"] + ' ' + (model.isPrivate() ? SurveyLang["비공개"] : SurveyLang["공개"]),
                                "editable_flag": SurveyLang["참여 후 수정"] + ' ' + (model.editable() ? SurveyLang["허용"] : SurveyLang["허용안함"]),
                                "accessible?": self.accessible(),
                                "progressing?": model.isProgressing(),
                                "finished?": model.isFinished(),
                                "started?": model.isStarted(),
                                "responded?": model.isResponseDone(),
                                "editable?": model.editable(),
                                "use_comment?": model.commentable(),
                                "label": {
                                    "list": CommonLang["목록"],
                                    "comment": CommonLang["댓글"],
                                    "modify_response": SurveyLang["응답 수정"],
                                    "go_home": SurveyLang["설문 홈으로"],
                                    "start_survey": SurveyLang["시작"],
                                    "stop_survey": SurveyLang["중지"],
                                    "remove_survey": SurveyLang["삭제"]
                                },
                                "msg": {
                                    "responded": SurveyLang["설문 완료 메시지"],
                                    "not_accessible": SurveyLang["설문 상세 접근권한 없음 메시지"]
                                }
                            }));

                            if (model.hasDeptName()) {
                                self.$el.find('.article_header').css('padding-left', '10px');
                            }

                            //renderToolbar(self);
                            self.renderHeaderToolbar(model);

                            AttachFilesView.create('#survey-attach-placeholder', model.getAttaches(), function (item) {
                                return GO.config('contextRoot') + 'api/survey/' + model.id + '/download/' + item.id;
                            });

                            if (self.accessible()) {
                                self._renderDetailSubView(model);
                            }

                            defer.resolveWith(self, [self]);
//                    	GO.util.toolBarFixed();
                            GO.util.pageDone();
                            if (_.isEmpty($(".content")) && !_.isEmpty($("#tool_bar"))) {
                                //GO-23169 안드로이드에서 tool_bar영역이 로딩 되지 전에 wrap되는 현상때문에 추가
                                $("#survey-datail-container").wrap('<div class="content" />');
                            }
                        },
                        error: function (data, error) {
                            GO.util.linkToErrorPage(error);
                        }
                    });

                    return defer;
                },
                copyUrl: function (e) {
                    GO.util.copyUrl(e);
                },

                modifyResponse: function (e) {
                    GO.router.navigate('survey/' + this.model.id + '/response/edit', {trigger: true, pushState: true});
                },

                reload: function () {
                    this.$el.empty();
                    return this.render();
                },

                renderHeaderToolbar: function (model) {
                    var toolBarData = {
                        isPrev: true,
                        actionMenu: this.getUseMenus(model)
                    };
                    this.headerToolBarView.render(toolBarData);
                },

                getUseMenus: function (model) {
                    var useMenuList = [];
                    var menus = {
                        "댓글": {
                            id: 'survey-comment',
                            text: CommonLang["댓글"],
                            triggerFunc: 'survey-comment',
                            cls: 'btn_comments',
                            commentsCount: model.getCommentCount()
                        },
                        "시작": {
                            id: 'survey-start',
                            text: SurveyLang["시작"],
                            triggerFunc: 'survey-start',
                            inMoreBtn: true
                        },
                        "중지": {
                            id: 'survey-stop',
                            text: SurveyLang["중지"],
                            triggerFunc: 'survey-stop',
                            inMoreBtn: true
                        },
                        "삭제": {
                            id: 'survey-delete',
                            text: SurveyLang["삭제"],
                            triggerFunc: 'survey-delete',
                            inMoreBtn: true
                        }
                    };
                    if (model.commentable()) {
                        useMenuList.push(menus.댓글);
                    }
                    if (model.isCreator(GO.session("id")) && model.isProgressing()) {
                        if (model.isStarted()) {
                            useMenuList.push(menus.중지);
                        } else {
                            useMenuList.push(menus.시작);
                        }
                    }
                    if (model.isCreator(GO.session("id"))) {
                        useMenuList.push(menus.삭제);
                    }
                    return useMenuList;
                }
            });

            /**
             * TODO: 툴바 마크업 개선
             * 툴바는 현재 $el에서 벗어나기 때문에 별도로 이벤트를 걸어줘야 함
             */
            function renderToolbar(view) {
                if ($('#tool_bar').length > 0) {
                    view.$el.find('.tool_bar').remove();
                } else {
                    view.$toolbar = view.$el.find('.tool_bar');

                    view.$toolbar.on('vclick.toolbar', '.btn-change-status', _.bind(view._changeStatus, view));
                    view.$toolbar.on('vclick.toolbar', '.btn-remove-survey', _.bind(view._removeSurvey, view));
                    view.$toolbar.on('vclick.toolbar', '.btn-list', _.bind(view._goToList, view));

                    view.$toolbar.attr('id', 'tool_bar');
                    view.$el.before(view.$toolbar);
                }
            }

            return SurveyDetailMobileView;

        });
})();