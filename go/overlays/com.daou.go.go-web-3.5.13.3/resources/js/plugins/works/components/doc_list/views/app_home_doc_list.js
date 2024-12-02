define('works/components/doc_list/views/app_home_doc_list', function (require) {

    var DocListView = require('works/components/doc_list/views/doc_list');

    return DocListView.extend({

        initialize: function (options) {
            this.setting = options.setting;
            this.adminSetting = options.adminSetting;
            DocListView.prototype.initialize.apply(this, arguments);

            this.settingId = options.settingId;
            this.settings = options.settings;
        },

        render: function () {
            DocListView.prototype.render.call(this);

            this.settings.deferred.done($.proxy(function () {
                this._renderSettingList();
            }, this));

            return this;
        },

        dataFetch: function () {
            return $.when(
                this.fields.deferred,
                this.setting.deferred,
                this.settings.deferred,
                this.masking.deferred
            ).then($.proxy(function () {
                return this.fetchIntegrationDatas();
            }, this)).then($.proxy(function () {
                this._setColumns();
            }, this)).fail($.proxy(function (e) {
                this.trigger('ajaxFail', e);
            }, this));
        },

        _setSettingId: function (settingId) {
            this.settingId = settingId;
        },

        _setSetting: function (setting) {
            this.setting = setting;
        },

        _setSettings: function (settings) {
            this.settings = settings;
        },

        _renderSettingList: function () {
            var $select = this.$('#settingList');
            var settingId = $select.find('[value="' + this.settingId + '"]').length ? this.settingId : '0';
            this.$('#settingList').val(settingId);
        },

        _setPropertyAndDirection: function () {
            /**
             * 목록 개인화가 들어가면서 마지막값(property, direction) 저장에 대한 스펙 정리가 필요할 것으로 보인다.
             */
            var fieldCid = this.setting.getSortColumnFieldCid();
            this.collection.property = this.fields.getPropertyByFieldCid(fieldCid);
            this.collection.direction = this.setting.getSortDirection();
        }
    });
});
