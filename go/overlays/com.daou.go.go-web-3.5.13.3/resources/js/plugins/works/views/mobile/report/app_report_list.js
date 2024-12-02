define("works/views/mobile/report/app_report_list", function (require) {
    var ContentTemplate = require('hgn!works/components/report/mobile/report_list');
    var HeaderToolbarView = require('views/mobile/header_toolbar');

    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var ReportList = require('works/components/report/models/report_list');
    var ReportListItem = require('works/views/mobile/report/app_report_list_item');

    var worksLang = require('i18n!works/nls/works');
    var lang = {
        '리포트 목록': worksLang['리포트 목록'],
        '즐겨찾는 리포트': worksLang['즐겨찾는 리포트']
    }

    var EmptyConetntTemplate = Hogan.compile([
        '<div id="report_empty_wrap" class="content_page" style="height:847px;">\n' +
        '<div class="report_nulldata" style="margin-top: 200px;text-align: center;">\n' +
        '<span class="img_nulldata"></span>\n' +
        '<p class="desc">' + worksLang['리포트 공백 문구'] + '</p>\n' +
        '</div>\n' +
        '</div>\n'].join(""));

    return Backbone.View.extend({
        events: {
            "refresh a[el-favorite]":"_reportLoad"
        },

        initialize: function (options) {
            this.appletId = options.appletId;
            this.reports = new ReportList({appletId: this.appletId});
            this.baseConfigModel = new AppletBaseConfigModel({"id": this.appletId});
        },

        render: function () {
            this.$el.html(ContentTemplate({lang: lang}));
            this.$el.append(EmptyConetntTemplate.render());

            $.when(
                this.baseConfigModel.fetch()
            ).then($.proxy(function () {
                this.isAdmin = this.baseConfigModel.isAdmin(GO.session('id'));
                if (!this.isAdmin) {
                    $('a[el-create]').hide();
                }
                var toolbarData = {
                    title: this.baseConfigModel.get('name'),
                    isList: true,
                    isSideMenu: true,
                    isHome: true,
                    isSearch: true
                };
                HeaderToolbarView.render(toolbarData);
                this._reportLoad();
            }, this));
            return this;
        },

        _reportLoad: function () {
            this.reports.clear();

            $.when(
                this.reports.fetch()
            ).then($.proxy(function () {
                if (this.reports.isEmpty()) {
                    this.$('#reports_wrap').hide();
                    this.$('#report_empty_wrap').show();
                    return;
                }

                this.$('#reports_wrap').show();
                this.$('#report_empty_wrap').hide();

                this.$('.all_wrap').empty();
                this.$('.favorite_wrap').empty();

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
                    this.$('.favorite_wrap').closest('.wrap_report').hide();
                    return;
                } else {
                    this.$('.favorite_wrap').closest('.wrap_report').show();
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
    });
})
