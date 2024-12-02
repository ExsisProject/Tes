define(function(require) {
    var Template = require("hgn!contact/templates/company_manage");
    var CompanyManageView = require("admin/views/contact/company_manage");
    var ContactLang = require("i18n!contact/nls/contact");

    var lang = {
        "공용 주소록 설정" : ContactLang["공용 주소록 설정"]
    }

    var ManageContentView = Backbone.View.extend({
        el: '#content',

        events : {

        },

        initialize : function(){
            this.companyManageView = new CompanyManageView({isAdmin : true, isSiteAdmin : false});
        },

        render : function(){
            this.$el.html(Template({lang : lang}));
            this.$el.find("#company_manage").html(this.companyManageView.el);
            this.companyManageView.render();
        }
    });

    return ManageContentView;
});