define(function (require) {
    var Backbone = require("backbone");
    var commonLang = require("i18n!nls/commons");
    var BackdropView = require("components/backdrop/backdrop");
    var Template = require("hgn!components/emoticon/templates/emoticons");

    var lang = {
        next: commonLang["다음"]
    };

    var _groupIndex = 0;
    var _stateIndex = 0;
    var _visibleGroup = 7;

    return Backbone.View.extend({

        attributes: {'data-emoticons-wrapper': ''},

        initialize: function (options) {
            this.options = options || {};
            this._init();
        },

        render: function () {
            this.groups = GO.emoticonGroups();
            this.$el.html(Template({
                lang: lang,
                baseImgUrl: GO.contextRoot + GO.config('emoticonBaseUrl')
            }));
            this._backdrop();
            return this;
        },

        _init: function () {
            _groupIndex = 0;
            _stateIndex = 0;
        },

        renderEmoticonGroup: function ($target) {
            $('[data-emoticon-group-wrapper]').hide();

            var $emoticonGroupWrapper = $target.parents('[data-replies-wrapper]').find('[data-emoticon-group-wrapper]');
            $emoticonGroupWrapper.addClass('layer_normal layer_emoticon');
            $emoticonGroupWrapper.insertAfter($target);

            this._renderTab($emoticonGroupWrapper.find('[data-emoticon-tab-ul]'));
            this._renderLeftRightBtn($emoticonGroupWrapper);
            this._renderItem($emoticonGroupWrapper.find('[data-emoticon-item-ul]'), this.groups[_stateIndex].groupKey);

            $emoticonGroupWrapper.show();
        },

        _renderTab: function ($emoticonNaviList) {
            $emoticonNaviList.empty();
            for (var i = _groupIndex; i < (_visibleGroup + _groupIndex); i++) {
                if ($emoticonNaviList.find('[data-group-key=' + this.groups[i].groupKey + ']').length) {
                    continue;
                }
                var className = i === _stateIndex ? "btn_emoticon on" : "btn_emoticon";
                var emoticonTabPath = GO.config('emoticonBaseUrl') + '/' + this.groups[i].groupKey + '/' + this.groups[i].tabItemName;
                $emoticonNaviList.append('<li><button type="button" class="' + className + '" data-group-key="' + this.groups[i].groupKey + '">'
                    + '<img class="emoticon" src="' + emoticonTabPath + '" alt=""></button></li>');
            }

            $emoticonNaviList.find('[data-group-key]').on('click', $.proxy(this._onClickNavi, this));
        },

        _renderLeftRightBtn: function ($emoticonEl) {
            var $emoticonNavi = $emoticonEl.find('[data-emoticon-tab-wrapper]');
            if ($emoticonNavi.find('[data-route="previous"]').length < 1) {
                $emoticonNavi.prepend('<button class="btn_arrow" title="' + commonLang["다음"] + '" data-route="previous"><span class="ic ic_prev2"></span></button>');
            }
            if ($emoticonNavi.find('[data-route="next"]').length < 1) {
                $emoticonNavi.append('<button class="btn_arrow" title="' + commonLang["다음"] + '" data-route="next"><span class="ic ic_next2"></span></button>');
            }

            $emoticonEl.find('[data-route]').on('click', $.proxy(this._moveToGroup, this));
        },

        _renderItem: function ($itemList, targetGroupKey) {
            var group = _.find(this.groups, function (g) {
                return g.groupKey === targetGroupKey;
            }, this);

            var width = (group.itemCount + "").length;
            $itemList.empty();
            for (var index = 1; index < group.itemCount + 1; index++) {
                var num = GO.util.numberPad(index, width);
                var itemPath = '/' + group.groupKey + '/' + group.namePrefix + num + '.' + group.extension;
                var itemSrc = GO.config('emoticonBaseUrl') + itemPath;
                $itemList.append('<li><button type="button" class="btn_emoticon" data-item-path="' + itemPath + '" data-emoticon-item>' +
                    '<img class="emoticon" src="' + itemSrc + '" alt=""> </button></li>');
            }

            $itemList.find('[data-emoticon-item]').on('click', $.proxy(this._onClickItem, this));
        },

        _onClickNavi: function (e) {
            var $target = $(e.currentTarget);
            $target.parents('[data-emoticon-tab-ul]').find('[data-group-key]').removeClass('on')
            $target.addClass('on');
            var targetGroupKey = $target.attr("data-group-key");
            _.each(this.groups, function (group, idx) {
                if (group.groupKey === targetGroupKey) {
                    _stateIndex = idx;
                }
            });

            var itemList = $target.parents('[data-emoticon-tab-wrapper]').siblings('.scroll_y').find('[data-emoticon-item-ul]');
            this._renderItem(itemList, $target.attr('data-group-key'));
        },

        _onClickItem: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var $target = $(e.currentTarget);
            var itemSrc = GO.config('emoticonBaseUrl') + $target.attr('data-item-path');
            var $appendArea = $target.parents('[data-func-wrapper]').siblings('[data-emoticon-edit-part]');

            $appendArea.addClass('thumb_append');
            $appendArea.siblings('[data-func-wrapper]').find('#create').addClass("on");

            if ($appendArea.find('#commentEmoticonImg').length < 1) {
                $appendArea.append('<img class="emoticon" id="commentEmoticonImg" src="' + itemSrc + '" data-selected-emoticon data-item-path="' + $target.attr('data-item-path') + '" alt="" >' +
                    '<a data-bypass class="ic ic_del_circle" data-emoticon-delete-btn title="' + commonLang['이모티콘 삭제'] + '"></a>');
            } else {
                $appendArea.find("#commentEmoticonImg").attr("src", itemSrc);
                $appendArea.find("#commentEmoticonImg").attr("data-item-path", $target.attr('data-item-path'));
            }

            $('[data-emoticon-group-wrapper]').hide();
        },

        _moveToGroup: function (e) {
            var route = $(e.currentTarget).attr('data-route');
            var tmpGroupIndex = _groupIndex;
            if (route === 'previous') {
                tmpGroupIndex = _groupIndex > 0 ? _groupIndex - 1 : 0;
            } else if (route === 'next') {
                tmpGroupIndex = _groupIndex + _visibleGroup < this.groups.length ? _groupIndex + 1 : _groupIndex;
            }

            if (tmpGroupIndex !== _groupIndex) {
                _groupIndex = tmpGroupIndex;
                var $emoticonNaviList = $(e.currentTarget).siblings('.wrap_list_emoticon').find('[data-emoticon-tab-ul]');
                this._renderTab($emoticonNaviList);
            }
        },

        _backdrop: function () {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = this.$("[data-emoticon-group-wrapper]");
            backdropView.linkBackdrop(this.$("[el-backdrop-link]"));
            backdropView.bindBackdrop();
        },

        hasSelectedEmoticon: function ($target) {
            if ($target.parents('[data-func-wrapper]').siblings('[data-emoticon-edit-part]').find('img').length > 0) {
                $.goMessage(commonLang["선택한 이모티콘 삭제 후 파일을 첨부해주세요."]);
                return true;
            }
            return false;
        },

        hasAttaches: function ($target) {
            if ($target.parents('[data-func-wrapper]').siblings('[data-attaches-edit-part]').find("li:not(.attachError)").length > 0) {
                $.goMessage(commonLang["첨부 파일 삭제 후 이모티콘을 선택 해주세요."]);
                return true;
            }
            return false;
        },

        getSelectedEmoticonImgSrc: function ($uploadBtn) {
            var $img = $uploadBtn.parents('[data-func-wrapper]').siblings('[data-emoticon-edit-part]').find('img');
            if ($img.length > 0) {
                return $img.attr("data-item-path");
            }
        },

        moveToMainEmoticonView: function ($target) {
            var $repliesWrapper = $target.parents('[data-replies-wrapper]');
            var $emoticonsWrapper = $repliesWrapper.find('[data-emoticon-group-wrapper]');
            var $mainEmoticonsWrapper = $repliesWrapper.find('[data-comment-main-edit]').siblings('[data-emoticons-wrapper]');
            $emoticonsWrapper.insertAfter($mainEmoticonsWrapper);
        }

    });

});
