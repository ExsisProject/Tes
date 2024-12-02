/**
 * 애플릿 생성 첫 페이지(템플릿 선택 혹은 복사)
 */

define('works/views/app/create_app_intro', function (require) {
    // dependency
    var $ = require("jquery");
    var Backbone = require('backbone');
    var when = require('when');

    var WorksTemplateGuide = require('works/views/app/works_template_guide');

    var WorksHomeLayout = require('works/views/app/home/works_home_layout');
    var SimpleAppletCollection = require('works/collections/applet_simples');

    var AppItemTemplate = require('hgn!works/templates/app/home/create_app_card');
    var AppItemSample = require('hgn!works/templates/app/home/create_app_card_sample');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require("i18n!nls/commons");
    var lang = {
        "유저 등록 아이콘": worksLang["유저 등록 아이콘"],
        "앱 추가하기": worksLang["앱 추가하기"],
        "새로 등록된 앱": worksLang["새로 등록된 앱"],
        "앱만들기샘플안내": worksLang["앱만들기샘플안내"],
        "앱만들기샘플안내상세": worksLang["앱만들기샘플안내상세"]
    };
    var _savingFlag = false;

    var AppletItemView = Backbone.View.extend({
        tagName: 'li',

        template: AppItemTemplate,

        favoriteList: null,

        observer: null,

        events: {
            "click .wrap_works_info": "moveCreateBaseInfo"
        },

        initialize: function (options) {
            this.observer = _.extend({}, Backbone.Events);

            this.folderId = GO.router.getSearch().folderId || '';
            this.model = options.model;
            this.render();

            this.listenTo(this.observer, 'createAppletFromGuide', this._createAppletFromGuide);
        },

        render: function () {
            var hasGuideContents = GO.util.isValidValue(this.model.get('guideContents')) && this.model.get('guideContents').length > 0;
            var hasGuideImages = GO.util.isValidValue(this.model.get('guideImageUrls')) && this.model.get('guideImageUrls').length > 0;
            this.$el.empty().append(this.template({
                lang: lang,
                "id": this.model.get('id'),
                "name": this.model.get('name'),
                "desc": this.model.get('desc'),
                "thumbSmall": this.model.get('thumbSmall'),
                "isFirstTmlApp?": this.model.get('isFirstTmlApp') || false,
                "isTemplate": this.model.get('isTemplate') || false,
                "asDefault": this.model.get('asDefault') || false,
                "isRecent": this.model.isRecent(this.model.get('createdAt')),
                "enabledGuidePopup": hasGuideContents && hasGuideImages
            }));
        },

        moveCreateBaseInfo: function (e) {
            e.preventDefault();

            var self = this;
            var target = $(e.currentTarget);
            var refType = target.attr("data-type");
            var asDefault = target.attr("default-template");
            var refId = asDefault ? refId = self.model.get('templateId') : self.model.get('id');

            if (target.attr('guide-popup')) {
                var options = {
                    refId: refId,
                    refType: refType,
                    asDefault: asDefault,
                    model: self.model,
                    observer: self.observer
                }
                console.log("가이드 팝업 연출: ", options);
                this.templateGuide = new WorksTemplateGuide(options);
                this.templateGuide.render();

            } else {
                $.goConfirm(worksLang['앱 만들기'], GO.i18n(worksLang['{{arg1}}로 앱을 만드시겠습니까?'], {arg1: self.model.get('name')}),
                    function () {
                        self._createApplet(refId, refType, asDefault);
                    }
                    , function () {
                        return false;
                    }, commonLang['확인']);
            }
        },
        _createAppletFromGuide: function (data) {
            this._createApplet(data.refId, data.refType, data.asDefault);
        },

        _createApplet: function (refId, refType, asDefault) {
            this.appletCreateModel = new Backbone.Model({
                "id": refId,
                "refType": refType ? refType : 'applets',
                "asDefault": asDefault
            });

            if (_savingFlag) {
                $.goSlideMessage(worksLang['저장중 메세지']);
                return;
            }
            this.appletCreateModel.url = GO.config('contextRoot') + 'api/works/applets';
            this.appletCreateModel.save({}, {
                type: "POST",
                beforeSend: function () {
                    _savingFlag = true;
                },
                success: $.proxy(function (model) {
                    if (this.folderId) {
                        $.ajax({
                            type: 'PUT',
                            contentType: "application/json",
                            url: GO.contextRoot + 'api/works/folders/move',
                            data: JSON.stringify({
                                oldFolderId: null,
                                appletId: model.id,
                                newFolderId: this.folderId
                            })
                        });
                    }
                    GO.router.navigate('works/applet/' + model.get('id') + '/home', {
                        "pushState": true,
                        "trigger": true
                    });
                }, this),
                error: function (model, resp) {
                    var responsJson = resp.responseJSON;
                    if (responsJson.name == "subform-validate") {
                        $.goSlideMessage(responsJson.message);
                    } else {
                        GO.router.navigate('works', {"pushState": true, "trigger": true});
                    }
                },
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
                },
                complete: function () {
                    _savingFlag = false;
                }
            });
        }

    });

    var AppItemSampleView = Backbone.View.extend({
        tagName: 'li',
        template: AppItemSample,
        favoriteList: null,
        events: {
            "click #worksSampleLink": "moveWorksSamplePage"
        },

        initialize: function (options) {
            this.render();
        },

        render: function () {
            this.$el.empty().append(this.template({
                lang: lang
            }));
        },

        moveWorksSamplePage: function (e) {
            e.preventDefault();
            window.open('https://bit.ly/3jZ1NlQ');
        }

    });

    var WorksCreateAppIntroView = Backbone.View.extend({
        className: 'go_content go_renew go_works_home app_temp',
        initialize: function () {
            this.layoutView = WorksHomeLayout.create();
            this.AppletTemplatesList = new SimpleAppletCollection([], {url: GO.config('contextRoot') + 'api/works/templates'});
            this.AppletManageList = new SimpleAppletCollection([], {url: GO.config('contextRoot') + 'api/works/applets/manage'});
        },

        render: function () {
            var self = this;

            return when(this.layoutView.render())
                .then(function fetchTemplatesList() {
                    var deffer = when.defer();
                    when(self.AppletTemplatesList.fetch()).then(function () {
                        self.AppletTemplatesList.each(function (m) {
                            m.set('isManageType', false); //기존 앱 목록 타입.
                        });
                        if (self.AppletTemplatesList.length > 0) {
                            self.AppletTemplatesList.at(0).set('isFirstTmlApp', true);
                        }
                        deffer.resolve();
                    });
                    return deffer.promise;
                })
                .then(function fetchManageList() {
                    var deffer = when.defer();
                    when(self.AppletManageList.fetch()).then(function () {
                        self.AppletManageList.each(function (m) {
                            m.set('isManageType', true); // 활동중인 앱 목록 타입.
                        });
                        deffer.resolve();
                    });
                    return deffer.promise;
                })
                .then(function renderMe() {
                    self.layoutView.setContent(self);

                    var tmpl = [
                        '<header class="content_top">',
                        '<h1>' + worksLang["템플릿 목록"] + '</h1>',
                        '</header>'
                    ].join("");
                    var tpl = Hogan.compile(tmpl);
                    self.$el.append(tpl.render());

                    var $wrap = $('<div class="content_page app_create_wrap" style="height:auto;"><div class="wrap_works"></div></div>');

                    self.DefaultAppletTemplateList = new Backbone.Collection(self.AppletTemplatesList.filter(function (template) {
                        return template.get('asDefault') == true;
                    }));
                    self.NonDefaultAppletTemplateList = new Backbone.Collection(self.AppletTemplatesList.filter(function (template) {
                        return template.get('asDefault') == false;
                    }));

                    $wrap.append(renderSection.call(self, $wrap, worksLang['샘플 앱으로 만들기'], worksLang['샘플 앱으로 만들기 설명'], self.DefaultAppletTemplateList, true, true));
                    $wrap.append(renderSection.call(self, $wrap, worksLang['공유된 템플릿으로 만들기'], worksLang['앱 가져오기 기능을 통해 사내에 공유된 템플릿으로 앱을 만들어보세요.'], self.NonDefaultAppletTemplateList, true, false));
                    $wrap.append(renderSection.call(self, $wrap, worksLang['사용중인 앱으로 만들기'], worksLang['사용중인 앱을 복사하여 만들기 설명'], self.AppletManageList, false, false));

                    self.$el.append($wrap);
                }).otherwise(function printError(err) {
                    console.log(err.stack);
                });
        }
    });

    function renderSection($wrap, title, desc, collection, isTemplate, appendSampleView) {
        var buffer = [];

        if (title != '' && collection.length > 0) {
            buffer.push('<div class="wrap_card_tit"><h5>' + title + '</h5><p class="desc">' + desc + '</p></div>');
            $wrap.find('.wrap_works').append(buffer.join("\n"));
        }
        $wrap.find('.wrap_works').append(renderAppletList.call(this, collection, isTemplate, appendSampleView));

        return $wrap;
    }

    function renderAppletList(collection, isTemplate, appendSampleView) {
        var $ul = $('<ul></ul>'),
            buffer = [];
        collection.each(function (model) {
            model.set("isTemplate", isTemplate);
            var appletMakeTplView = new AppletItemView({
                "model": model
            });
            buffer.push(appletMakeTplView.el);
        }, this);
        $ul.append.apply($ul, buffer);
        if (appendSampleView) {
            var appItemSampleTplView = new AppItemSampleView();
            $ul.append(appItemSampleTplView.el);
        }
        return $ul;
    }

    return WorksCreateAppIntroView;
});
