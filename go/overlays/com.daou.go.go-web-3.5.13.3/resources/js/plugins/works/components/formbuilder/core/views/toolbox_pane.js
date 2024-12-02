define('works/components/formbuilder/core/views/toolbox_pane', function (require) {

    var Backbone = require('backbone');
    var renderTemplate = require('hgn!works/components/formbuilder/core/templates/toolbox');
    var Scroller = require('go-scroller');

    var FBToolboxPaneView = Backbone.View.extend({

        /**
         * 툴박스 제목
         */
        title: '',
        /**
         * 리사이져 표시 사용 유무
         */
        useResizer: false,

        /**
         * 타이틀 부분 CSS 클래스명 지정
         */
        titleWrapClassname: '',

        /**
         * 툴 컨텐츠 부분 CSS 클래스명 지정
         */
        contentWrapClassname: '',

        observer: null,

        events: {
            "click .toggle-arrow": '_toggleContent',
            "click .ic_help_type1": '_toggleHelper'
        },

        initialize: function (options) {
            options = options || {};

            this.observer = null;
            if (options.hasOwnProperty('observer')) {
                this.observer = options.observer;
            }

            initRender.call(this);
            this._initScroller();
        },

        toggleContent: function (bool) {
            var speed = 50;
            if (bool || false) {
                this.$('.scroll-container').show();
                this.$('.toggle-arrow').removeClass('on');
            } else {
                this.$('.scroll-container').hide();
                this.$('.toggle-arrow').addClass('on');
            }
        },

        toggleArrow: function (bool) {
            if (bool || false) {
                this.$('.toggle-arrow').removeClass('on');
            } else {
                this.$('.toggle-arrow').addClass('on');
            }
        },

        isFolded: function () {
            return this.$('.toggle-arrow').hasClass('on');
        },

        getMarginHeight: function () {
            return 0;
        },

        resize: function (newSize) {
            var contentHeight = newSize - this.getMarginHeight();

            if (contentHeight > 0) {
                this.$('.scroll-container').outerHeight(contentHeight);
            }

            if (this.$('.scroll-container').data('go-scroller')) {
                this.$('.scroll-container').data('go-scroller').resizeScroll();
            }
        },


        /**
         * 툴 컨텐츠 영역 토글
         */
        _toggleContent: function (e) {
            this.toggleContent(this.isFolded());
            // 반드시 실행해줘야 한다. 아니면 화살표 토글안됨
            e.stopPropagation();
        },

        _toggleHelper: function (e) {
            this.$(".attr_tooltip").toggle();
            e.stopPropagation();
        },

        /**
         * 커스텀 스크롤 오류 발생시 화면이 그려지지 않는 것을 방지하기 위해 async로 실행한다.
         */
        _initScroller: function () {
            setTimeout(_.bind(function () {
                Scroller.attachTo(this.$('.scroll-container'));
            }, this), 500);
        }
    });

    function initRender() {
        this.$el.empty()
            .append(renderTemplate({
                "useResizer": this.useResizer,
                "toolTitle": this.title
            }));

        if (this.titleWrapClassname) {
            this.$('.toolbox-title').addClass(this.titleWrapClassname);
        }

        if (this.contentWrapClassname) {
            this.$('.scroll-container').addClass(this.contentWrapClassname);
        }
    }

    return FBToolboxPaneView;
});
