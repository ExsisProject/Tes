define('works/views/mobile/report/app_report_detail', function (require) {
    var AppletBaseConfigModel = require('works/models/applet_baseconfig');
    var GridManger = require("works/views/app/report/works_report_gridstack_manager");
    var HeaderTemplate = require("hgn!works/components/report/mobile/editor_header");
    var HeaderToolbarView = require('views/mobile/header_toolbar');
    var BackdropView = require('components/backdrop/backdrop');

    var Report = require('works/models/report');
    var Fields = require("works/collections/fields");

    return Backbone.View.extend({
        events: {
            "click span[el-output]": "_onClickOutput",
        },

        initialize: function (options) {
            this.appletId = options.appletId;
            this.reportId = options.reportId;
            this.isCrete = false;

            this.fields = new Fields([], {
                appletId: this.appletId,
                includeProperty: true,
            });

            this.report = new Report({
                appletId: this.appletId,
                reportId: this.reportId
            });

            this.baseConfigModel = new AppletBaseConfigModel({"id": this.appletId});
        },

        render: function () {
            $.when(
                this.report.fetch(),
                this.fields.fetch(),
                this.baseConfigModel.fetch()
            ).then($.proxy(function () {
                this.unBindEvent();

                this.$el.append(HeaderTemplate({
                    title: this.report.get('title'),
                    writer: this.report.get('writerName'),
                    createdAt: this.report.get('createdAt')
                }));
                this.gridManger = new GridManger({
                    appletId: this.appletId,
                    reportId: this.reportId,
                    fields: this.fields,
                    report: this.report
                });

                this.gridManger.render();

                $('ul.report_btn_list').hide();
                $('span[el-output]').hide();
                $('a[el-save]').hide();
                $('a[el-setting]').hide();
                $('a[el-pdf-export]').show();
                $('a[el-email-export]').show();

                var toolbarData = {
                    isPrev: true
                };
                this.gridManger.disable();
                HeaderToolbarView.render(toolbarData);
                this.resizeContent();

                this.bindEvent();
            }, this));
            return this;
        },

        _onClickOutput: function (event) {
            this.backdropView = new BackdropView();
            this.backdropView.backdropToggleEl = $('#output_selector');
            if(this.backdropView.backdropToggleEl.is(":visible")) {
                this.backdropView.backdropToggleEl.hide();
                return;
            }
            this.backdropView.linkBackdrop($(event.currentTarget));
        },

        _setTitle: function (title) {
            $('span.tit').empty();
            $('span.tit').append(title);
        },

        resizeContent: function () {
            var self = this;
            setTimeout(function(){
                self.iscroll = GO.util.initDetailiScroll("reportDetailWrapper", "iScrollContentWrap", "reportContentWrapper");
                self.originalScale = self.iscroll.options.zoomMin;
            },500);
        },

        copyUrl: function (e) {
            GO.util.copyUrl(e)
        },

        bindEvent: function () {
            this.$el.on('vclick', '#copyUrl', $.proxy(this.copyUrl, this));
        },

        unBindEvent: function () {
            this.$el.off('vclick', '#copyUrl');
        }
    });
});
