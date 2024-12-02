define(function (require) {
    var CompanyManageView = require("admin/views/contact/company_manage");
    var Template = require("hgn!admin/templates/contact/site_manage");
    var AdminLang = require("i18n!admin/nls/admin");

    var lang = {
        "공용주소록 상세" : AdminLang["공용주소록 상세"]
    };

    var ContactCompany = Backbone.View.extend({

        events: {},

        initialize: function () {
            this.companyManageView = new CompanyManageView({isAdmin : true});
        },

        render: function () {
            this.$el.html(Template({
                lang : lang,
                isNotSelected : true
            }));
            this.$el.find("#company_manage").html(this.companyManageView.el);
            this.companyManageView.render();
        }
    });

    return ContactCompany;
});