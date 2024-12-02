define('works/views/app/works_template_guide', function (require) {
    require("jquery.go-popup");
    require('jquery.bxslider');

    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');

    var Tmpl = require('hgn!works/templates/app/works_template_guide');

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");

    return Backbone.View.extend({
        id: "works_template_guide",
        events: {
            'click #cancel': 'close',
            'click #createApp': 'createApp'
        },
        observer: null,

        initialize: function (options) {
            this.options = options || {};

            this.refId = options.refId;
            this.refType = options.refType;
            this.asDefault = options.asDefault;
            this.model = options.model;
            this.observer = null;
            if (options.hasOwnProperty('observer')) {
                this.observer = options.observer;
            }

        },
        renderContent: function () {
            this.$el.html(Tmpl({
                contextRoot: App.contextRoot,
                data: this.model.toJSON(),
                lang: {
                    '취소': commonLang['취소'],
                    '적용하기': worksLang['적용하기']
                }
            }));

            var bxSliderOption = {
                pager: false,
                hideControlOnEnd: true,
                infiniteLoop: false,
                minSlides: 1,
                maxSlides: 1,
                slideWidth: 0,
                slideMargin: 0,
                onSliderLoad: function () {
                    $('div.bx-viewport').css('height', '');
                    $('div.bx-viewport').removeClass();
                    $('div.bx-controls').css({"background-color": "transparent"});
                    $('a.bx-prev').css({"margin-top": "-215px", "left": "-60px"});
                    $('a.bx-next').css({"margin-top": "-215px", "right": "-60px"});
                    $('a.bx-prev').attr('href', 'javascript:void(0);');
                    $('a.bx-next').attr('href', 'javascript:void(0);');
                }
            };

            if (!this.slider) {
                this.slider = this.$("div#guideImage").bxSlider(bxSliderOption);
            } else {
                this.slider.reloadSlider(bxSliderOption);
            }
        },
        render: function () {
            this.popup = $.goPopup({
                closeIconVisible: false,
                modal: true,
                draggable: false,
                contents: this.$el,
                width: 984,
                height: 661
            });
            this.renderContent();

            this.popup.reoffset();

            $("#works_template_guide").insertAfter('#popOverlay');
            $(".go_popup").empty();
            $("#works_template_guide").appendTo('.go_popup');

            return this;
        },
        createApp: function () {
            this.observer.trigger('createAppletFromGuide', {
                "refId": this.refId,
                "refType": this.refType,
                "asDefault": this.asDefault
            });
        },
        close: function () {
            this.popup.close();
        }
    });
});
