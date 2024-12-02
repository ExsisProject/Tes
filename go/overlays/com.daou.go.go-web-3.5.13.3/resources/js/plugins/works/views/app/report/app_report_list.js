define('works/views/app/report/app_report_list', function (require) {
    var BaseAppletView = require('works/views/app/base_applet');

    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var ReportList = require('works/components/report/models/report_list');
    var ReportListItem = require('works/components/report/view/app_report_list_item');

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require("i18n!nls/commons");
    var reportLang = require("i18n!report/nls/report");

    var lang = {
        "등록": commonLang["등록"],
        "삭제": commonLang["삭제"],
        "복사": commonLang["복사"],
        "보고서": reportLang["보고서"],
        "보고서 생성": reportLang["보고서 생성"],
        '리포트 목록': worksLang['리포트 목록'],
        '즐겨찾는 리포트': worksLang['즐겨찾는 리포트'],
        '리포트 공백 문구 PC': worksLang['리포트 공백 문구 PC'],
        '리포트 공백 문구 사용자 버전': worksLang['리포트 공백 문구 사용자 버전'],
        '리포트 만들기': worksLang['리포트 만들기']
    };

    var ContentTemplate = require('hgn!works/components/report/template/report_list');
    var EmptyConetntTemplate = Hogan.compile([
        '<div id="report_empty_wrap" class="content_page" style="height:847px;display:none;">\n' +
        '<div class="report_nulldata">\n' +
        '<span class="img_nulldata"></span>\n' +
        '<p class="desc go_admin_comment">{{{리포트 공백 문구 PC}}}</p>\n' +
        '<p class="desc go_user_comment">{{{리포트 공백 문구 사용자 버전}}}</p>\n' +
        '<a class="btn_major" data-role="button" el-create><span class="txt">{{리포트 만들기}}</span></a>\n' +
        '</div>\n' +
        '</div>\n'].join(""));

    return BaseAppletView.extend({
        events: {
            "click a[el-create]": "_reportCreate",
            "refresh a[el-create]": "_reportLoad"
        },

        initialize: function (options) {
            BaseAppletView.prototype.initialize.apply(this, arguments);
            this.appletId = options.appletId;
            this.reports = new ReportList({appletId: this.appletId});
            this.baseConfigModel = new AppletBaseConfigModel({"id": options.appletId, access: true});
        },

        render: function () {
            BaseAppletView.prototype.render.apply(this, arguments);
            if (this.accessibleForms.length < 1) {
                this._renderNoExistForm(this.$el);
                return;
            }

            this.$el.append(ContentTemplate({
                lang: lang
            }));

            $.when(
                this.baseConfigModel.fetch()
            ).then($.proxy(function () {
                this.isAdmin = this.baseConfigModel.isAdmin(GO.session('id'));
                if (!this.isAdmin) {
                    this.$el.find('a[el-create]').hide();
                }
                this._reportLoad();
            }, this));
        },

        _reportLoad: function () {
            this.reports.clear();

            $.when(
                this.reports.fetch()
            ).then($.proxy(function () {
                if (this.reports.isEmpty()) {
                    this.$el.append(EmptyConetntTemplate.render(lang));
                    this.$el.find('#reports_wrap').hide();
                    this.$el.find('#report_empty_wrap').show();

                    if (!this.isAdmin) {
                        this.$el.find('a[el-create]').hide();
                        this.$el.find('p.go_admin_comment').hide();
                    } else {
                        this.$el.find('p.go_user_comment').hide();
                    }

                    return;
                }

                this.$el.find('#reports_wrap').show();
                this.$el.find('#report_empty_wrap').hide();

                this.$el.find('.all_wrap').empty();
                this.$el.find('.favorite_wrap').empty();

                _.forEach(this.reports.getAll(), function (item) {
                    var reportListItem = new ReportListItem({
                        appletId: this.appletId,
                        isAdmin: this.isAdmin,
                        item: item,
                        content: this.$('.all_wrap')
                    });
                    reportListItem.render();
                }, this);

                var favorites = this.reports.getFavorites();
                if (favorites.length == 0) {
                    this.$el.find('.container_report_favor').hide();
                    return;
                } else {
                    this.$el.find('.container_report_favor').show();
                }

                _.forEach(favorites, function (item) {
                    var reportListItem = new ReportListItem({
                        appletId: this.appletId,
                        isAdmin: this.isAdmin,
                        item: item,
                        content: this.$('.favorite_wrap')
                    });
                    reportListItem.render();
                }, this);
            }, this));
        },

        _reportCreate: function () {
            GO.router.navigate('works/applet/' + this.appletId + '/report/create', true);
        }
    });
});
