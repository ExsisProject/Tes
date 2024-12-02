/**
 * 사용법 .
 * 1. active scroll require 후, 해당 content영역 id 와 active될 메뉴영역 id를 key / value 형태로 object를 정의한다.
 * var set = {
 *              "content1El_Id": "menu1El_ID",
 *              "content2El_Id": "menu2El_ID",
 *              "content3El_Id": "menu3El_ID",
 *              "content4El_Id": "menu4El_ID",
 *           };
 * 2. initialize active-scroll
 * activeScroll = new ActiveScroll({
 *              scrollEl: view, //scroll영역 view El 정의
 *              activeClass : "active", //active될 클래스 명 정의
 *              menuArray :  set,
 *              first : "content1El_Id",
 *              last : "content4El_Id"
 *          });
 * 3. binding
 * activeScroll.bind();
 *
 */
define("components/active-scroll/active-scroll", function (require) {

    return Backbone.View.extend({
        events: {
        },
        initialize: function (options) {
            this.options = options || {};
            this.scrollEl = this.options.scrollEl || this.$el;
            this.activeClass = this.options.activeClass || "active";
            this.menuArray = this.options.menuArray || {};
            this.first = this.options.first || "";
            this.last = this.options.last || "";

            this._setBenchmark();
            this._setRecognizer();
            this._bindChangeMenuIndex();
        },
        bind: function () {
            this._bindScrollEvent();
            this._bindClickEvent();
        },
        unbind: function () {
            this.scrollEl.off("scroll");
            $(".menu_scroll_group").off("click");
        },
        setScrollEl: function ($el) {
            this.scrollEl = $el;
            this._setBenchmark();
        },
        setMenuElArray: function (arr) {
            this.menuArray = arr;
            this._setBenchmark();
        },
        menuActiveChange: function (id) {
            $(".menu_scroll_group").removeClass(this.activeClass);
            $("#" + id).addClass(this.activeClass);
        },
        _setBenchmark: function () {
            this.diffHeight = this.scrollEl.offset().top - $("#" + this._getAnyKey(this.menuArray)).offsetParent().offset().top;
            this.benchmark = this.scrollEl.height() * 0.5 + this.diffHeight;
        },
        _setRecognizer: function () {
            for (var keyEl in this.menuArray) {
                $("#" + this.menuArray[keyEl]).addClass("menu_scroll_group");
            }
        },
        _bindChangeMenuIndex:function () {
            this.menuIndex = {};
            this._indexInit();
            var self = this;
            Object.defineProperty(this.menuIndex, 'key', {
                get: function() {
                    return this._key || 0;
                },
                set: function(key) {
                    if(this._key == key ) return;
                    this._key = key;
                    self.menuActiveChange(key);
                },
            });
        },
        _indexInit:function(){
            if(this.first && this.scrollEl.scrollTop === 0) {
                this.menuActiveChange(this.menuArray[this.first]);
            }
            if (this.last && this.scrollEl.scrollTop() + this.scrollEl.innerHeight() >= this.scrollEl.prop('scrollHeight')){
                this.menuActiveChange(this.menuArray[this.last]);
            }
            for (var keyEl in this.menuArray) {
                if ((this.benchmark > $('#' + keyEl).position().top
                    && this.benchmark < $('#' + keyEl).position().top + $('#' + keyEl).height())) {
                    this.menuActiveChange(this.menuArray[keyEl]);
                }
            }
        },
        _bindScrollEvent: function () {
            var self = this;
            /* 이벤트 발생이 과하다고 생각되는 경우, GOIgnoreDuplicateMethod를 이용해서 스크롤 이벤트를 줄일 수 있다.
            * 대신 ui 상 반응이 느려 보임*/
            this.scrollEl.on( 'scroll', function (e) {
                    /*스크롤이 처음에 왔을때*/
                    if(self.first && self.scrollEl.scrollTop === 0) {
                        self.menuIndex.key = self.menuArray[self.first];
                        return;
                    }
                    /*스크롤이 마지막에 왔을때*/
                    if (self.last && self.scrollEl.scrollTop() + self.scrollEl.innerHeight() >= self.scrollEl.prop('scrollHeight')){
                        self.menuIndex.key = self.menuArray[self.last];
                        return;
                    }
                    for (var keyEl in self.menuArray) {
                        if ((self.benchmark > $('#' + keyEl).position().top
                            && self.benchmark < $('#' + keyEl).position().top + $('#' + keyEl).height())) {
                            self.menuIndex.key = self.menuArray[keyEl];
                            return;
                        }
                    }
            });
        },
        _bindClickEvent: function () {
            var self = this;
            $(".menu_scroll_group").click(function (e) {
                var menuElId = $(e.currentTarget).attr('id');
                for (var keyEl in self.menuArray) {
                    if (self.menuArray[keyEl] == menuElId) {
                        self.scrollEl.animate({
                            scrollTop: '+=' + ($("#" + keyEl).position().top - self.diffHeight)
                        }, 200);
                        break;
                    }
                }
            });
        },
        _getAnyKey: function (arr) {
            for (var key in arr) {
                return key;
            }
        },

    });
});