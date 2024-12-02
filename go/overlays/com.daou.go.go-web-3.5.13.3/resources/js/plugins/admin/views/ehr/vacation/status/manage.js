define("admin/views/ehr/vacation/status/manage", function (require) {
    var Backbone = require("backbone");

    var VacationLang = require("i18n!vacation/nls/vacation");

    var ManageTpl = require("hgn!admin/templates/ehr/vacation/status/manage");

    var StatusListView = require("admin/views/ehr/vacation/status/manage/status_list");
    var BasicConfigView = require("admin/views/ehr/vacation/status/manage/basic_config");
    
    var lang = {
        '연차유형관리 설명' : VacationLang['연차유형관리 설명']
    };

    var VacationStatusManage = Backbone.View.extend({
        el: '#layoutContent',

        render: function () {
            this.$el.html(ManageTpl({
                lang : lang
            }));

            this.statusListView = new StatusListView();
            this.statusListView.render();

            this.basicConfigView = new BasicConfigView();
            this.basicConfigView.render();

            return this;
        },
    });

    return VacationStatusManage;
});