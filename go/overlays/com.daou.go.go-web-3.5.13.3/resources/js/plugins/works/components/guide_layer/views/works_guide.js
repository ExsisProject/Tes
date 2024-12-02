define('works/components/guide_layer/views/works_guide', function (require) {
    var Template = require('hgn!works/components/guide_layer/templates/works_guide');

    var WORKS_INTRO_GUIDE_KEY = 'WORKS_INTRO_GUIDE_';

    return Backbone.View.extend({
        id: 'worksIntroGuideMain',
        initialize: function () {
            this.storageKey = WORKS_INTRO_GUIDE_KEY + GO.session().id;
        },
        init: function (options) {
            this.startPage = 0;
            this.currentPage = 0;
            this.endPage = 4;
            this.isFirst = options.isFirst;
            this.createdAt = options.createdAt;
            this.sizeCheck();
        },
        render: function () {
            this.popup = $.goPopup({
                closeIconVisible: false,
                modal: true,
                draggable: false,
                contents: this.$el,
            });
            this.renderContent();
            this.resize();
            return this;
        },
        registerEvent: function () {
            var self = this;
            $('.works_guide_close').on('click', function () {
                self.close();
            });
            $('.works_guide_previous').on('click', function (e) {
                self.movePage(e);
            });
            $('.works_guide_next').on('click', function (e) {
                self.movePage(e);
            });
            $('.slide_status').on('click', function (e) {
                var val = e.target.accessKey;
                if (!val) {
                    return;
                }
                self.currentPage = Number(val);
                self.renderContent();
            });
        },
        sizeCheck: function () {
            var self = this;
            this.intervalId = setInterval(function () {
                var windowHeight = $(window).height();
                if (self.windowHeight !== windowHeight) {
                    self.resize();
                }
                self.windowHeight = windowHeight;
            }, 100);
        },
        resize: function () {
            var wSize = $(window).height();
            var pSize = $('#gpopupLayer').height();
            var top = (wSize - pSize) / 2;
            $('#gpopupLayer').css('top', top + 'px');
        },
        renderContent: function () {
            var page0 = this.currentPage == 0;
            var page1 = this.currentPage == 1;
            var page2 = this.currentPage == 2;
            var page3 = this.currentPage == 3;
            var page4 = this.currentPage == 4;

            var isFirst = this.isFirstGuide() && this.isFirst;
            this.$el.html(Template({
                isFirst: isFirst,
                page0: page0,
                page1: page1,
                page2: page2,
                page3: page3,
                page4: page4
            }));
            $('.go_popup').addClass('layer_org');
            this.registerEvent();
        },
        movePage: function (event) {
            if (!event || !event.target) {
                return;
            }
            var accessKey = event.target.accessKey;
            if (!accessKey) {
                return;
            }
            var addValue = accessKey == 'next' ? 1 : -1;
            var updatedPage = this.currentPage + addValue;

            if (updatedPage < this.startPage || updatedPage > this.endPage) {
                return;
            }
            this.currentPage = updatedPage;
            this.renderContent();
        },
        isFirstGuide: function () {
            var data = GO.util.getLocalStorage(this.storageKey);
            return !data || !data.data;
        },
        close: function () {
            if (!this.popup) {
                return;
            }
            var visible = this.$el.find('input:checkbox[id="guideVisible"]').is(":checked");
            if (visible && visible == true) {
                var data = {
                    data: visible,
                    expires: null
                }
                GO.util.setLocalStorage(this.storageKey, data);
            }
            this.popup.close();
        }
    });
});
