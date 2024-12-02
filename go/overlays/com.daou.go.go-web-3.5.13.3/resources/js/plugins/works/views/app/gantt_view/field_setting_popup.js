define('works/views/app/gantt_view/field_setting_popup', function (require) {
    var Backbone = require('backbone');

    var ListSetting = require("works/components/list_manager/models/list_setting");

    var FieldSettingPopupTpl = require("hgn!works/templates/app/gantt_view/field_setting_popup");

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        "제목": commonLang["제목"],
        "시작날짜": worksLang["시작 날짜"],
        "종료날짜": worksLang["종료 날짜"],
        "담당자": worksLang["담당자"],
        "진행률": worksLang["진행률"],
        "진행률설명": worksLang["간트뷰 진행률 설명"],
        "제목선택": worksLang["제목 선택"],
        "시작날짜선택": worksLang["시작날짜 선택"],
        "종료날짜선택": worksLang["종료날짜 선택"],
        "담당자선택": worksLang["담당자 선택"],
        "진행률선택": worksLang["진행률 선택"]
    };

    return Backbone.View.extend({
        tagName: "form",
        initialize: function (options) {
            this.options = options || {};
            this.appletId = this.options.appletId;
            this.fields = this.options.fields || [];
            this.ganttViewModel = this.options.ganttViewModel || {};

            this.setting = new ListSetting({}, {appletId: this.appletId});
        },

        render: function () {
            this.titleFieldCid = this.ganttViewModel.get('titleFieldCid');
            this.startFieldCid = this.ganttViewModel.get('startFieldCid');
            this.endFieldCid = this.ganttViewModel.get('endFieldCid');
            this.userFieldCid = this.ganttViewModel.get('userFieldCid');
            this.progressFieldCid = this.ganttViewModel.get('progressFieldCid');
            if (!this.fetchedSetting && _.isUndefined(this.titleFieldCid) && !this.ganttViewModel.hasStartEndField()) {
                this.setting.fetch({async: false});
                this.fetchedSetting = this.setting.toJSON();
                var currentTitleField = this.fetchedSetting.columns[this.fetchedSetting.titleColumnIndex];
                this.titleFieldCid = currentTitleField ? currentTitleField.fieldCid : undefined;
            }
            var titleFields = this.getTitleFields(this.fields);
            var progressFields = this.getProgressFields(this.fields);
            this.$el.html(FieldSettingPopupTpl({
                lang: lang,
                titleFields: titleFields,
                dateFields: this.getDateFields(this.fields),
                userFields: this.getUserFields(this.fields),
                progressFields: progressFields,
                isTitleFieldEmpty: titleFields.length == 0,
                isProgressFieldEmpty: progressFields.length == 0
            }));
            this.$el.find("#title_setting option[value=" + this.titleFieldCid + "]").prop('selected', true);
            this.$el.find("#startdate_setting option[value=" + this.startFieldCid + "]").prop('selected', true);
            this.$el.find("#enddate_setting option[value=" + this.endFieldCid + "]").prop('selected', true);
            this.$el.find("#user_setting option[value=" + this.userFieldCid + "]").prop('selected', true);
            this.$el.find("#progress_setting option[value=" + this.progressFieldCid + "]").prop('selected', true);
        },

        getDateFields: function (fields) {
            return _.filter(fields, function (field) {
                return field.valueType == 'DATE' || field.valueType == 'DATETIME';
            });
        },
        getTitleFields: function (fields) {
            return _.filter(fields, function (field) {
                return field.valueType == "STEXT";
            });
        },
        getUserFields: function (fields) {
            return _.filter(fields, function (field) {
                return field.valueType == 'USERS' || field.valueType == 'USER';
            });
        },
        getProgressFields: function (fields) {
            return _.filter(fields, function (field) {
                return field.valueType == 'NUMBER' && field.properties.dataType == 'PERCENT';
            });
        },
    });
});