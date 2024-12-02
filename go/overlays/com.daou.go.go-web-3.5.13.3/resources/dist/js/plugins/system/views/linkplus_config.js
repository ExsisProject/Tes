define('system/views/linkplus_config', function (require) {
    var Backbone = require('backbone');
    var $ = require('jquery');
    var LinkTmpl = require('hgn!system/templates/linkplus_config');
    var LinkplusConfig = require('system/models/linkplus_config');

    return Backbone.View.extend({
        events : {
            "click #btn_ok" : "saveConfig",
            "click #btn_cancel" : "cancel",
        },
        initialize: function () {
            this.config = LinkplusConfig.get(true);
        },
        render: function () {
            var self = this;
            $('.breadcrumb .path').html("링크플러스 설정");
            this.$el.html(LinkTmpl({
                serverUrl : self.config.getServerHost(),
                clientUrl : self.config.getClientHost(),
            }));
            return this;
        },
        saveConfig() {
            var serverHost = $('#serverUrl').val();
            var clientHost = $('#clientUrl').val();
            if (!$.goValidation.validateURL(serverHost) || !$.goValidation.validateURL(clientHost)) {
                $.goAlert('잘못된 URL 형식입니다.');
                return;
            }
            this.config.set({
                serverHost: serverHost,
                clientHost: clientHost
            });
            this.config.save(null, {
                success:function(){
                    $.goAlert('저장되었습니다.');
                },
                error:function(model, error){
                    var responseData = JSON.parse(error.responseText);
                    var message = responseData.message;
                    if (message) {
                        $.goError(message);
                    } else {
                        $.goError(commonLang["실패했습니다."]);
                    }
                }
            })
        },
        cancel() {
            $('#serverUrl').val(this.config.getServerHost());
            $('#clientUrl').val(this.config.getClientHost());
        },

    })


})