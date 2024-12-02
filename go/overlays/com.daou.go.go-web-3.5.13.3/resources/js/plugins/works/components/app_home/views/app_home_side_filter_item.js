define("works/components/app_home/views/app_home_side_filter_item", function (require) {

    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");

    var BackdropView = require("components/backdrop/backdrop");

    var SettingTemplate = require("hgn!works/components/app_home/templates/app_home_side_filter_setting");
    var Template = require("hgn!works/components/app_home/templates/app_home_side_filter_item");

    var lang = {
        "필터 이름 변경": worksLang["필터 이름 변경"],
        "변경할 필터 이름을 입력하세요.": worksLang["필터명변경설명"],
        "이름 변경": worksLang["이름 변경"],
        "삭제": commonLang["삭제"]
    };

    var View = BackdropView.extend({

        tagName: "li",
        className: "folder",

        initialize: function (options) {
            this.appletId = options.appletId;
            this.auth = options.auth;
        },

        events: {
            "click span[el-setting]": "_onClickSetting",
            "click li[el-rename]": "_onClickRename",
            "click li[el-delete]": "_onClickDelete",
            "click [el-filter]": "_onClickFilter"
        },

        render: function () {
            this.$el.html(Template({
                model: this.model.toJSON(),
                auth: this.auth
            }));
            this.$el.attr('data-id', this.model.id);

            return this;
        },

        _onClickFilter: function (event) {
            var $target = $(event.currentTarget);
            var selectedFilterId = $target.attr("data-id");
            var type = $target.attr('data-type');
            GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-last-filter-id', selectedFilterId);
            var viewtype = GO.util.store.get('applet-viewtype');
            if (viewtype == 'calendar' || viewtype == 'gantt') {
                GO.router.navigate('works/applet/' + this.appletId + '/' + viewtype, true);
            } else {
                GO.router.navigate('works/applet/' + this.appletId + '/home', {replace: true});
                this.collection.trigger('changeFilter.filters', selectedFilterId, type);
            }
        },

        _onClickSetting: function (event) {
            if (!this.settingLayer) {
                this._initBackdrop(event);
            }
        },

        _onClickRename: function (event) {
            event.stopPropagation();
            this.settingLayer.toggle(false);

            var contentTmpl = [
                '<div class="content">',
                '<p class="desc">',
                lang["변경할 필터 이름을 입력하세요."],
                '</p>',
                '<div class="form_type">',
                '<input el-new-name class="txt_mini w_max" type="text" value="' + this.model.get("name") + '">',
                '</div>',
                '</div>'
            ].join("");
            this.popup = $.goPopup({
                modal: true,
                pclass: "layer_normal layer_public_list",
                header: lang["필터 이름 변경"],
                width: 500,
                contents: contentTmpl,
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    callback: $.proxy(function () {
                        var newName = this.popup.find("input[el-new-name]").val();
                        this._saveAsFilter(newName);
                        this.settingLayer.toggle(false);
                    }, this)
                }, {
                    btext: commonLang["취소"],
                    btype: "normal",
                    callback: $.proxy(function () {
                        this.settingLayer.toggle(false);
                    }, this)
                }]
            });
        },

        _saveAsFilter: function (newName) {
            // filters 로 한번에 받아온 filter 는 condition 이 없기 때문에 GET을 한번 한 후 PUT 해야한다.
            this.model.fetch().done($.proxy(function () {
                this.model.save({
                    name: newName
                }, {
                    success: $.proxy(function (model) {
                        $.goMessage(commonLang["저장되었습니다."]);
                        this.collection.trigger("change:name", model);
                    }, this)
                });
            }, this));
        },

        _onClickDelete: function (event) {
            event.stopPropagation();
            this.settingLayer.toggle(false);

            $.goConfirm(commonLang["삭제하시겠습니까?"], "", $.proxy(this._deleteFilter, this));
        },

        _deleteFilter: function () {
            this.model.destroy({
                success: $.proxy(function (model) {
                    var filterId = GO.util.store.get(GO.session('id') + '-' + this.appletId + '-works-last-filter-id');
                    if (parseInt(filterId) === model.id) {
                        GO.util.store.set(GO.session('id') + '-' + this.appletId + '-works-last-filter-id', null);
                        GO.router.navigate('works/applet/' + this.appletId + '/home', {replace: true});
                        this.collection.trigger('changeFilter.filters', 'all');
                    }
                    $.goMessage(commonLang["삭제되었습니다."]);
                }, this)
            });
        },

        _initBackdrop: function (event) {
            this.settingLayer = $(SettingTemplate({
                lang: lang
            }));
            this.$el.append(this.settingLayer);
            this.backdropToggleEl = this.settingLayer;
            this.bindBackdrop();
            this.linkBackdrop(this.$("[el-setting]"));
        }
    });

    return View;
});