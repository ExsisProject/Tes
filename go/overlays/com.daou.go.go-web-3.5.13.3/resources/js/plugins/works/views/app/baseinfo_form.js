/**
 * 애플릿 기본 설정 화면(등록/수정 공통)
 */

define('works/views/app/baseinfo_form', function (require) {
    // dependency
    var $ = require("jquery");
    var Backbone = require('backbone');
    var when = require('when');
    var WorksUtil = require('works/libs/util');
    var ManageContentTopView = require('works/views/app/layout/manage_content_top');
    var WorksHomeLayout = require('works/views/app/home/works_home_layout');
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var AppletAdminModel = require('works/models/applet_admin');

    var BaseinfoTpl = require('hgn!works/templates/app/baseinfo_form');
    var NameTagView = require("go-nametags");
    require("jquery.go-orgslide");
    require('jquery.go-popup');
    require('jquery.go-preloader');

    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        'admin': adminLang['운영자'],
        'name': worksLang['앱 이름'],
        'desc': worksLang['앱 설명'],
        'icon': worksLang['앱 아이콘'],
        'alarm_msg': worksLang['기본설정 운영자 툴팁'],
        'regist': worksLang['앱만들기'],
        'save': commonLang['저장'],
        'goback': worksLang['돌아가기'],
        'add': commonLang['추가'],
        'cancel': commonLang['취소'],
        'gosettinghome': worksLang['관리 홈으로 이동'],
        'goapphome': worksLang['해당 앱으로 이동'],
        '앱 기본 설정': worksLang['앱 기본 설정'],
        '만들려는 앱에 대한 기본 설정을 할 수 있습니다': worksLang['만들려는 앱에 대한 기본 설정을 할 수 있습니다'],
        '회사에서 운영할 유용한 앱을 직접 디자인해서 만들어보세요': worksLang['회사에서 운영할 유용한 앱을 직접 디자인해서 만들어보세요'],
        '필수 입력 컴포넌트': worksLang['필수 입력 컴포넌트'],
        '기본설정 앱 설명 툴팁': worksLang['기본설정 앱 설명 툴팁'],
        '데이터 목록에서 설명이 기본으로 보이도록 설정합니다': worksLang['데이터 목록에서 설명이 기본으로 보이도록 설정합니다'],
        '유저 등록 아이콘': worksLang['유저 등록 아이콘'],
        'infoDesc': worksLang['이름, 설명, 아이콘 등의 앱의 기초 정보를 설정할 수 있습니다.'],
        waitingMsg: worksLang['저장중 메세지']
    };

    var MAX_TITLE_LENGTH = 64;
    var MAX_DESC_LENGTH = 4999;

    var _savingFlag = false;

    var BaseFormModel = AppletBaseConfigModel.extend({
        validate: function (attrs) {
            var result = [];
            if (_.isEmpty(attrs.name)) {
                result.push('name_required');
            }
            if (attrs.name && attrs.name.length > MAX_TITLE_LENGTH) {
                result.push('name_invalid_length');
            }
            if (attrs.desc && attrs.desc.length > MAX_DESC_LENGTH) {
                result.push('desc_invalid_length');
            }

            if (result.length > 0) {
                return result;
            } else {
                return;
            }
        },
        isEmptyAdmins: function () {
            return this.get('admins') && this.get('admins').length < 1 ? true : false;
        }
    });

    var WorksBaseInfoFormView = Backbone.View.extend({
        className: 'go_content go_renew go_works_home app_temp',
        initialize: function (options) {
            this.options = options || {};
            this.folderId = GO.router.getSearch().folderId || '';
            this.asDefault = GO.router.getSearch().asDefault || '';
            this.layoutView = WorksHomeLayout.create();
            this.refType = options.refType || "applets";
            // appletId가 있으면 수정 모드, templateId가 있으면 Create 모드이다
            this.model = new BaseFormModel(options.hasOwnProperty('appletId') ? {"id": options.appletId} : null);
        },

        events: {
            "click #btn-confirm": "_onConfirm",
            "click #btn-goback": "_goBack",
            "click #btn-cancel": "_cancel",
            "click #btn-gosettinghome": "gosettinghome",
            "click #btn-goapphome": "goapphome",
            "click .choiceIcon": "_choiceIcon",
            'click #goAppHomeNav': "goapphome",
            'click #goSettingHomeNav': "gosettinghome",
            'keydown input': '_preventFormSubmit'
        },

        /**
         조직도 클릭 이벤트 콜백

         @method _addManagers
         @return {Object} 조직도 슬라이드 엘리먼트
         @private
         */
        onAddManagers: function (data) {
            var members = _.isArray(data) ? data : [data];
            _.each(members, function (member) {
                var position = member.position || "";
                this.nameTag.addTag(member.id, member.name + " " + position, {removable: true});
            }, this);

        },
        _onConfirm: function (e) {
            e.preventDefault();
            this.model.set('admins', this.nameTag.getNameTagList());
            this.model.set('name', $(this.el).find('#name').val());
            this.model.set('desc', $('#textarea-desc').val());
            this.model.set('showDescription', $("input:checkbox[id='showDescription']").is(":checked"));
            if (!this.validateForm()) {
                return false;
            }

            this.updateApplet();
        },

        updateApplet: function () {
            var preloader = null;
            if (_savingFlag) {
                $.goSlideMessage(lang['waitingMsg']);
                return;
            }
            this.model.setUrl(GO.config('contextRoot') + 'api/works/applets/' + this.model.get('id') + '/base');
            this.model.save({}, {
                type: "PUT",
                beforeSend: function () {
                    preloader = $.goPreloader();
                    _savingFlag = true;
                },
                success: function () {
                    $.goMessage(worksLang['저장 되었습니다']);
                },
                error: function () {
                    GO.router.navigate('works', {"pushState": true, "trigger": true});
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
                    preloader.release();
                    _savingFlag = false;
                }
            });
        },

        _cancel: function (e) {
            var self = this;
            e.preventDefault();
            $.goConfirm(worksLang['편집 취소'],
                commonLang['입력하신 정보가 초기화됩니다.'],
                function () {
                    renderMain.call(self);
                });
        },

        validateForm: function () {
            WorksUtil.errorDescRemover({targets: [this.$('#name'), this.$('#textarea-desc')]}, this);

            var form = this.$el.find('form[name=baseinfoForm]'),
                baseinfoNameEl = form.find('#name'),
                baseinfoAdminsEl = form.find('#wrap_name_tag ul'),
                baseinfoDescEl = form.find('#textarea-desc'),
                focusEl = null,
                validateResult = true;

            if (!this.model.isValid()) {
                if (_.contains(this.model.validationError, 'name_invalid_length')) {
                    $.goError(worksLang['길이가 초과하였습니다'], $(baseinfoNameEl).parent());
                    if (baseinfoNameEl) baseinfoNameEl.addClass('error');
                    if (!focusEl) focusEl = baseinfoNameEl;
                    validateResult = false;
                }
                if (_.contains(this.model.validationError, 'name_required')) {
                    $.goError(worksLang['제목을 입력해 주세요'], $(baseinfoNameEl).parent());
                    if (baseinfoNameEl) baseinfoNameEl.addClass('error');
                    if (!focusEl) focusEl = baseinfoNameEl;
                    validateResult = false;
                }
                if (_.contains(this.model.validationError, 'desc_invalid_length')) {
                    $.goError(worksLang['앱 설명 길이 초과'], $(baseinfoDescEl).parent());
                    if (baseinfoDescEl) baseinfoDescEl.addClass('error');
                    if (!focusEl) focusEl = baseinfoDescEl;
                    validateResult = false;
                }
            }
            if (this.model.isEmptyAdmins()) {
                $.goError(worksLang['운영자를 추가해 주세요'], $(baseinfoAdminsEl));
                if (baseinfoAdminsEl) baseinfoAdminsEl.addClass('enter error');
                if (!focusEl) focusEl = baseinfoAdminsEl;
                validateResult = false;
            }

            if (focusEl) focusEl.focus();
            return validateResult;
        },

        _goBack: function (e) {
            e.preventDefault();
            window.history.back();
        },

        gosettinghome: function () {
            WorksUtil.goSettingHome(this.model.get('id'));
        },

        goapphome: function () {
            WorksUtil.goAppHome(this.model.get('id'));
        },

        _choiceIcon: function (e) {
            var src = $(e.currentTarget).attr('src');
            $('#thumbSmall').attr('src', src);
            this.model.set('iconUrl', src);
        },

        render: function () {
            return when(renderLayout.call(this))
                .then(_.bind(checkAdmin, this))
                .then(_.bind(renderMain, this))
                .otherwise(function printError(err) {
                    console.log(err.stack);
                });
        },

        _preventFormSubmit: function (e) {
            if (e.keyCode === 13) e.preventDefault();
        }
    });


    function renderLayout() {
        return when(this.layoutView.render())
            .then(this.layoutView.setContent(this));
    }


    function renderMain() {
        var self = this;
        var icons = [];
        var IconsCollection = Backbone.Collection.extend({
            comparator: function (model) {
                return -model.get('seq');
            },
            parse: function (urls) {
                var models = _.map(urls, function (url) {
                    var model = {};
                    model.src = url;
                    model.seq = parseInt(url.replace(/[a-z\/._]/gi, ''));
                    return model;

                });
                return models;
            }
        });
        when($.ajax({
            type: "GET",
            dataType: "json",
            url: GO.config('contextRoot') + 'api/works/applets/icons',
            success: function (resp) {
                icons = resp.data;
            }
        }))
            .then(_.bind(fetchBaseConfigModel, this))
            .then(function renderMe() {
                var contentTopTitle = '';
                WorksUtil.checkAppManager(self.model.get('admins')); // 권한부터 체크.
                contentTopTitle = worksLang['기본 정보'];

                self.$el.html(BaseinfoTpl({
                    lang: lang,
                    model: self.model.toJSON(),
                    'isRegist?': self.isRegist,
                    'isSiteAdmin?': self.isSiteAdmin
                }));

                var $appList = $(".app_list");
                var iconsCollection = new IconsCollection();
                iconsCollection.set(icons, {parse: true});
                iconsCollection.sort(); // 디자인팀 요청에 의하여, 최신 아이콘이 가장 먼저 보이게 정렬한다.
                iconsCollection.each(function (icon) {
                    $appList.append('<img class="choiceIcon" src="' + icon.get('src') + '" alt="' + worksLang['유저 등록 아이콘'] + '" >');
                });

                var contentTopView = new ManageContentTopView({
                    baseConfigModel: self.model,
                    pageName: contentTopTitle,
                    isAppNamePrefixed: !self.isRegist,
                    useActionButton: true,
                    infoDesc: lang.infoDesc
                });
                contentTopView.setElement(this.$('#worksContentTop'));
                contentTopView.render();
                renderNameTag.call(self);
            });
    }

    function renderNameTag() {
        var self = this;
        this.nameTag = NameTagView.create({}, {useAddButton: true});
        this.$el.find("div.wrap_name_tag").html(this.nameTag.el);

        _.each(this.model.get('admins'), function (member) {
            var position = member.position || "";
            self.nameTag.addTag(member.id, member.name + " " + position || "", {removable: true});
        }, this);

        this.nameTag.$el.on('nametag:clicked-add', function () {
            $.goOrgSlide({
                header: adminLang["운영자 추가"],
                type: 'node',
                isBatchAdd: true,
                externalLang: commonLang,
                memberTypeLabel: adminLang["운영자"],
                desc: '',
                contextRoot: GO.config("contextRoot"),
                callback: $.proxy(self.onAddManagers, self)
            });
        });
    }

    /**
     * model fetch
     * 등록일 때는 단순 리턴해준다.
     * @return Promise
     */
    function fetchBaseConfigModel() {
        var self = this;
        var deffered = when.defer();
        when(this.model.fetch({
            success: function () {
                deffered.resolve();
            },
            error: function () {
                deffered.reject();
            }
        }))
            .otherwise(function printError(err) {
                console.log(err.stack);
            });
        return deffered.promise;
    }

    function checkAdmin() {
        var self = this;
        var admin = new AppletAdminModel();
        var defer = when.defer();
        admin.fetch({
            success: function (model) {
                self.isSiteAdmin = !!model.get('true');
                defer.resolve();
            },
            error: function () {
                defer.reject();
            }
        });
        return defer.promise;
    }

    return WorksBaseInfoFormView;
});
