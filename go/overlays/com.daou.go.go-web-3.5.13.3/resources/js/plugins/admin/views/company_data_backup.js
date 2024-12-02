define("admin/views/company_data_backup", function (require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");

    var DataBackupModel = require("admin/models/company_data_backup");

    var DataBackupTmpl = require("hgn!admin/templates/company_data_backup");

    var adminLang = require("i18n!admin/nls/admin");

    var CompanyDataBackupView = App.BaseView.extend({

        initialize: function () {
        },

        events: {
            "click #goEcdService": "goEcdService"
        },

        render: function () {

            this.$el.html(DataBackupTmpl({
                lang: adminLang
            }));

            return this;
        },

        goEcdService: function (e) {

            this.model = new DataBackupModel();
            this.model.fetch({async: false});
            this.data = this.model.toJSON();

            var ecdHost = this.data.ecdHost;
            var token = this.data.token;
            if (_.isEmpty(ecdHost) || _.isUndefined(ecdHost)) {
                $.goAlert(adminLang['데이터 백업 서비스에 연결되어있지 않습니다.']);
            } else {
                window.open(ecdHost + "/sso?token=" + token, "_blank");
            }
        }
    });

    return CompanyDataBackupView;
});
