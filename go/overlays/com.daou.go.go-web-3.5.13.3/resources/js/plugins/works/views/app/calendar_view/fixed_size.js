define("works/views/app/calendar_view/fixed_size", function (require) {
    var $ = require("jquery");
    var GO = require("app");

    var DefaultLayout = require("views/layouts/default");
    var GOIgnoreDuplicateMethod = require('go-ignoreduplicatemethod');

    require("jquery.go-popup");

    var __super__ = DefaultLayout.prototype;

    return DefaultLayout.extend({ //CalendarFixedSizeLayout

        initialize: function () {
            __super__.initialize.apply(this, arguments);
        },

        render: function () {
            var self = this;
            var deferred = $.Deferred();

            __super__.render.apply(this).done(function (parent) {
                // 임시... padding-bottom을 0px로 만든다.
                self.$el.find('#content')
                    .css('padding-bottom', '0px')
                    .addClass('go_calendar_list go_renew');

                // 반드시 여기서 바인딩 해야 한다. 고 한다.
                self._bindWindowResize();

                deferred.resolveWith(self, [self]);
            });
            return deferred;
        },

        resizeContentHeight: function () {
            var
                goBody = this.$el.find('.go_body'),
                goBodyHeight = $(window).height(),
                minHeight = parseInt(goBody.css('min-height'));

            if (!GO.isAdvancedTheme()) {
                this.$el.find('.go_wrap').children(':not(.go_body)').each(function (i, el) {
                    goBodyHeight -= $(el).outerHeight();
                });
            }

            goBodyHeight = Math.max(minHeight, goBodyHeight);

            this.$el.find('.go_body').height(goBodyHeight);
            this.$el.find('#content').height(goBodyHeight);
            this.$el.find('.content_page').height(goBodyHeight); // TODO contentTop height 빼야함
        },

        /**
         캘린더 UI 영역의 높이 계산

         @method getContentPageHeight
         @return {Integer} 캘린더 UI 영역의 높이
         */
        getContentPageHeight: function () {
            return this.$el.find('.content_page').height();
        },

        /**
         윈도우 resize 이벤트 바인딩

         @method _bindWindowResize
         @private
         */
        _bindWindowResize: function () {
            var self = this;
            var resizer = new GOIgnoreDuplicateMethod();
            $(window).on('resize.fixedsize-layout', function (e) {
                if (!$.isWindow(e.target)) return;
                resizer.bind(function () {
                    self.resizeContentHeight();
                    self.triggerResizeEvent();
                });
            });
        },

        triggerResizeEvent: function () {
            this.trigger("resize:content", this.getContentPageHeight(), this);
        }
    }, {
        __instance__: null
    });
});