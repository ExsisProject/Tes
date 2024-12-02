define(function(require) {

    var Backbone = require("backbone");
    var LoginoutConfigView = require("admin/views/loginout_config");
    var IpAccessConfigView = require("admin/views/ip_access_config");
    var CertConfigView = require("admin/views/cert_config");
    var Template = require("hgn!admin/templates/user_login_config");

    return Backbone.View.extend({

		el : '#layoutContent',

		render : function() {
            this.$el.html(Template());

            this.loginoutConfigView = new LoginoutConfigView();
            this.ipAccessConfigView = new IpAccessConfigView();
            this.certConfigView = new CertConfigView({ el : '#certConfig' });

            this.loginoutConfigView.render();

            var self = this;
            this.isWebAccessSiteConfigOn()
                .done(function (response) {
                    if (response.data == true) {
                        self.ipAccessConfigView.render();
                    }
                });

            this.certConfigView.render();
		},

        isWebAccessSiteConfigOn : function() {
		    return $.ajax({
                url : GO.contextRoot + 'ad/api/access/site/config/on',
                type : 'GET'
            });
        }
    });
});