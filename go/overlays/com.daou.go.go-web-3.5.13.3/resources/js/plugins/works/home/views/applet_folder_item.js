define('works/home/views/applet_folder_item', function (require) {

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        '이름 바꾸기': worksLang['이름 바꾸기'],
        '삭제': commonLang['삭제']
    };

    var BackdropView = require('components/backdrop/backdrop');

    var Template = require('hgn!works/home/templates/applet_folder_item');
    var SideTypeTemplate = require('hgn!works/home/templates/applet_folder_item_side');

    return Backbone.View.extend({

        className: 'group',

        events: {
            'click [data-el-setting]': '_onClickSetting',
            'click [data-el-rename]': '_onClickRename',
            'click [data-el-delete]': '_onClickDelete'
        },

        initialize: function (options) {
            this.$el.attr('data-folder-id', this.model.id);
            options = options || {};
            this.type = options.type;
            this.template = this.type === 'side' ? SideTypeTemplate : Template;
        },

        render: function () {
            this.$el.html(this.template({
                lang: lang,
                model: this.model.toJSON(),
                isMobile: GO.util.isMobile()
            }));
            this.$('a:first').attr('data-folder-id', this.model.id);
            return this;
        },

        _onClickSetting: function() {
            if (!this.settingLayer) {
                this.settingLayer = new BackdropView({el: this.$('[el-backdrop]')});
                this.settingLayer.linkBackdrop(this.$('[data-el-setting]'));
            }
        },

        _onClickRename: function() {
            this.$el.trigger('popupFolderLayer', this.model);
        },

        _onClickDelete: function() {
            var message = GO.i18n(worksLang['선택한 {{folder}}을(를) 삭제합니다.<br/>폴더 내에 있는 앱은 삭제되지 않습니다.'], {folder : this.model.get('name')});
            $.goConfirm(commonLang['삭제하시겠습니까?'], message, $.proxy(this._deleteFolder, this));
        },

        _deleteFolder: function() {
            this.model.destroy({
                wait: true,
                success: $.proxy(function() {
                    $.goMessage(commonLang['삭제되었습니다.']);
                    this.$el.remove();
                }, this)
            });
        }
    });
});