define("admin/views/ehr/vacation/status/manage/status_list", function (require) {
    var Backbone = require("backbone");

    var adminLang = require("i18n!admin/nls/admin");
    var vacationLang = require("i18n!vacation/nls/vacation");

    var StatusListTpl = require("hgn!admin/templates/ehr/vacation/status/manage/status_list");
    var StatusView = require("admin/views/ehr/vacation/status/manage/status");

    var StatusCollection = require("admin/collections/ehr/vacation/status_list");
    var StatusModel = require("admin/models/ehr/vacation/status");
    var StatusPopupView = require("admin/views/ehr/vacation/status/manage/status_popup");

    var lang = {
        '코드' : adminLang['코드'],
        '사용여부' : adminLang['사용여부'],
        '휴가종류' : vacationLang['휴가종류'],
        '연차 수' : vacationLang['연차 수'],
        '공휴일 포함 여부' : vacationLang['공휴일 포함 여부'],
        '유/무급': vacationLang['유/무급'],
        '설정' : adminLang['설정'],
        '추가' : adminLang['추가'],
        '연차 유형 설정' : vacationLang['연차유형 설정'],
        '사용 가능일 수' : vacationLang['사용 가능일 수'],
        '시작/종료 시간' : vacationLang['시작/종료 시간']
    };

    return Backbone.View.extend({
        el: '#statusListLayout',

        initialize: function () {
            this.statusCollection = new StatusCollection();
        },

        events: {
            'click #statusAddBtn' : 'popupStatusAdd'
        },

        render: function () {
            this.$el.html(StatusListTpl({
                lang : lang
            }));
            this.statusListEl = this.$el.find('#statusList');

            this.statusCollection.fetch({
                success : $.proxy(this.renderStatusList, this)
            });

            return this;
        },

        renderStatusList : function() {
            var _self = this;
            _.each(this.statusCollection.models, function(status) {
                var statusView = new StatusView({
                    statusListEl : _self.statusListEl,
                    statusModel : status
                });
                statusView.render().append();
            });
        },

        popupStatusAdd : function() {
            new StatusPopupView({
                statusModel : new StatusModel(),
                refreshCallback : $.proxy(this.render, this)
            }).render();
        }
    });

});