define('works/home/views/applet_item', function (require) {

    var worksLang = require('i18n!works/nls/works');
    var commonLang = require('i18n!nls/commons');
    var lang = {
        "설정": commonLang["설정"],
        "즐겨찾기": commonLang["즐겨찾기"],
        "새로 등록된 앱": worksLang["새로 등록된 앱"],
        "유저 등록 아이콘": worksLang["유저 등록 아이콘"],
        "앱간 데이터 연동": worksLang['앱간 데이터 연동'],
        "앱간연동설명": worksLang['앱간연동설명'],
        waitingMsg: worksLang['저장중 메세지']
    };

    var WorksUtil = require('works/libs/util');

    var AppItemTemplate = require('hgn!works/home/templates/applet_item');

    return Backbone.View.extend({
        className: 'app_item',
        template: AppItemTemplate,
        favoriteList: null,
        _savingFlag: false,

        events: {
            "click [data-btn-favorite]": "_toggleFavorite",
            "click .wrap_works_info": "_navigate",
            "click [data-btn-setting]": "goSettingHome",
        },

        initialize: function () {
            this.$el.data('view', this);
            this.render();

            this.listenTo(this.model, 'change:favoriteFlag', this.changeFavorite);
        },

        render: function () {
            this.isVisibleSettingButton = this.model.isAdmin() && !GO.util.isMobile();
            this.$el.empty().append(this.template({
                lang: lang,
                "favorite?": this.model.isFavorite(),
                "id": this.model.get('id'),
                "name": _.escape(this.model.get('name')),
                "isRecent?": this.model.isRecent(this.model.get('createdAt')),
                "thumbSmall": this.model.get('thumbSmall'),
                isVisibleSettingButton: this.isVisibleSettingButton
            }));
            return this;
        },

        changeFavorite: function () {
            this.render();
        },

        getAppletId: function () {
            return this.model.id;
        },

        _toggleFavorite: function (e) {
            var self = this;
            var targetFunc = this.model.isFavorite() ? 'removeFavorite' : 'addFavorite';
            if (this._savingFlag) {
                if (GO.util.isMobile()) {
                    alert(lang['waitingMsg']);
                } else {
                    $.goSlideMessage(lang['waitingMsg']);
                }
                return;
            }
            e.preventDefault();
            this._savingFlag = true;

            this.model[targetFunc].call(this.model).done($.proxy(function () {
                if (this.model.isFavorite()) {
                    $.goMessage(worksLang['즐겨찾기 앱으로 등록되었습니다.']);
                } else {
                    $.goMessage(worksLang['즐겨찾기 앱이 해제되었습니다.']);
                }
                this._savingFlag = false;
            }, this)).fail(function (err) {
                console.log(err.stack);
                self._savingFlag = false;
            });
        },

        _navigate: function (e) {
            e.preventDefault();

            if ($(e.target).is('.btn_star') || $(e.target).parents('.btn_star').length > 0) { //즐겨찾기는 제외..
                return false;
            } else if ($(e.target).is('.btn_set') || $(e.target).parents('.btn_set').length > 0) {
                return false;
            }

            GO.router.navigate('works/applet/' + this.model.get('id') + '/home', {"pushState": true, "trigger": true});
        },

        goSettingHome: function (e) {
            e.preventDefault();
            WorksUtil.goSettingHome(this.model.get('id'));
        },
    });
});
