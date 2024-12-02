define('store/views/sso_form', function (require) {

    var Backbone = require('backbone');
    var $ = require('jquery');
    var FormTmpl = require('hgn!store/templates/sso_form');


    var StoreSSOFormView = Backbone.View.extend({

        initialize: function () {

        },

        render: function () {
          return this.$el.html(FormTmpl({}));
        },

        postSSOForm : function (product, data) {

            var ssoForm = document.ssoForm;
            ssoForm.target= product['code'] + "SSONewTab";
            ssoForm.action = product['ssoUrl'];
            ssoForm.method="post";

            $('input[name="companyName"]').val(data.companyName);
            $('input[name="email"]').val(data.email);
            $('input[name="name"]').val(data.name);
            $('input[name="siteUrl"]').val(data.siteUrl);
            $('input[name="userKey"]').val(data.userKey);
            $('input[name="serviceKey"]').val(data.serviceKey);
            $('input[name="apiToken"]').val(data.apiToken);
            $('input[name="partnerInfo"]').val(data.partnerInfo);

            ssoForm.submit();
        }

    });

    return StoreSSOFormView;

})




