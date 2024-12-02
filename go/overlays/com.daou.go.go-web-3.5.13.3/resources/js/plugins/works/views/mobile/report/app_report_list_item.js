define("works/views/mobile/report/app_report_list_item", function(require) {
    var BackdropView = require('components/backdrop/backdrop');
    var commonLang = require("i18n!nls/commons");
    var worksLang = require('i18n!works/nls/works');

    var lang = {
        "삭제": commonLang["삭제"],
        "공유됨": worksLang["공유됨"]
    };
    var ContentItemTemplate = require('hgn!works/components/report/mobile/report_list_item');
    var SettingTemplate = Hogan.compile([
        '<div class="array_option array_works" style="left:auto">',
        '<ul class="array_type">',
        '<li el-delete><span class="txt">{{삭제}}</span></li>',
        '</ul>',
        '</div>'
    ].join(""));

    return BackdropView.extend({
        initialize: function (options) {
            this.appletId = options.appletId;
            this.isAdmin = options.isAdmin;
            this.item = options.item;
            this.content = options.content;
        },

        render: function () {
            var self = this;
            this.item.lang = lang;
            this.content.append(ContentItemTemplate(this.item));
            this.$el = $(this.content).children(':last');

            this.$('[el-favorite]').on('click', function (event) {
                self._toggleFavorite(event);
            });

            this.$('[el-detail]').on('click', function (event) {
                self._onClickDetail(event);
            });

            if (!this.isAdmin || !this.item.writer) {
                this.$('[el-report-setting]').hide();
                return;
            }

            this.$('[el-report-setting]').on('click', function (event) {
                self._onClickSetting(event);
            });
        },

        _onClickSetting: function (event) {
            if (!this.settingLayer) {
                this._initBackdrop(event);
            }
        },

        _onClickDelete: function (event) {
            var url = GO.contextRoot + 'api/works/applet/' + this.appletId + '/report/' + this.item.id;
            var promise = $.ajax({
                contentType : "application/json",
                dataType: 'json',
                type: 'DELETE',
                url: url
            });

            promise.done(function(response) {
                $.goSlideMessage(worksLang['삭제에 성공했습니다']);
                $('a[el-favorite]').trigger("refresh");
            });

            promise.fail(function(xhr, status, err) {
                var responseObj = JSON.parse(xhr.responseText);
                if (!_.isUndefined(responseObj) && responseObj.message) {
                    $.goAlert(responseObj.message);
                } else {
                    $.goAlert(commonLang["500 오류페이지 타이틀"]);
                }
            });
        },

        _toggleFavorite: function (event) {
            var type = 'POST';
            var self = this;

            if (self.item.favorite) {
                type = 'DELETE';
            }

            var url = GO.contextRoot + 'api/works/applet/' + this.appletId + '/report/' + this.item.id + '/favorites';
            var context = this;
            var promise = $.ajax({
                contentType : "application/json",
                dataType: 'json',
                type: type,
                url: url
            });

            promise.done(function(response) {
                if (type == 'DELETE') {
                    //TODO : 다국어 처리
                    $.goSlideMessage(worksLang['즐겨찾기가 해제되었습니다']);
                } else {
                    $.goSlideMessage(worksLang['즐겨찾기으로 등록되었습니다']);
                }
                $('a[el-favorite]').trigger("refresh");
            });

            promise.fail(function(xhr, status, err) {
                var responseObj = JSON.parse(xhr.responseText);
                if (!_.isUndefined(responseObj) && responseObj.message) {
                    $.goAlert(responseObj.message);
                } else {
                    $.goAlert(commonLang["500 오류페이지 타이틀"]);
                }
            });
        },

        _onClickDetail: function (event) {
            GO.router.navigate('works/applet/' + this.appletId + '/report/' + this.item.id, true);
        },

        _initBackdrop: function (event) {
            this.settingLayer = $(SettingTemplate.render(lang));
            this.$(event.target).append(this.settingLayer);
            this.backdropToggleEl = this.settingLayer;
            this.bindBackdrop();
            this.linkBackdrop(this.$("[el-report-setting]"));

            var self = this;
            $('li[el-copy]').on('click', function (event) {
                self._onClickCopy(event);
            });

            if (!this.item.writer) {
                $('li[el-delete]').hide();
                return;
            }

            $('li[el-delete]').on('click', function (event) {
                if (confirm(commonLang['삭제하시겠습니까?'])) {
                    self._onClickDelete(event);
                }
            });
        },

        changeFavorite: function () {
            this.render();
        },
    });
});
