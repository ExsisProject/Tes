define('store/views/iframe_view', function (require) {
    var Backbone = require('backbone');
    var GO = require('app');
    var $ = require('jquery');
    var StoreAdmin = require('store/models/store_admin');
    var LinkplusConfig = require('system/models/linkplus_config');
    var iframeTmpl = require('hgn!store/templates/iframe');

    return Backbone.View.extend({
        events: {
            "click #storeHome" : "render",
        },
        initialize: function () {
            this.isAdmin = StoreAdmin.getInstance().isAdmin();
            this.siteUrl = _.find(GO.session().companies, function(company) {
                return company.userId === GO.session().id;
            }).siteUrl;
            this.serviceConfig = LinkplusConfig.get(false);
        },
        render: function () {
            var self = this;
            $.when(this.getLinkplusOauthConfig(this.serviceConfig.getServerHost()))
                .done(function (res) {
                    var urlParameters = self.makeUrlParam(res.data);
                    var remoteUrl = 'https://' + self.siteUrl + '/oauth-authorize?' + urlParameters;
                    self.$el.html(iframeTmpl({
                        remoteUrl  :  remoteUrl
                    }));
                    var iframe = $('#storeIframe');
                    iframe.load(function() {
                        self.sendMessageIframe(this, res.data.state);
                    })
                    self.resizeIframe(iframe);
                    $(window).resize(function() {
                        self.resizeWindow(self.resizeIframe, iframe);
                    });
                })
                .fail(function() {
                    $.goMessage("요청 처리 중 오류가 발생하였습니다.");
                });
            //클래식 테마 조직도 숨김 처리
            if(!$("body").hasClass("go_skin_advanced")) {
                $('#organogram').hide();
            }

            return self;
        },
        sendMessageIframe: function (iframe, state) {
            iframe.contentWindow.postMessage({
                state : state,
                siteUrl : this.siteUrl || null,
                isAppAdmin : this.isAdmin,
            }, this.serviceConfig.getClientHost());
        },
        getLinkplusOauthConfig: function (url) {
            return $.ajax({
                type: "GET",
                url: url + '/oauth/config',
                async: false,
            });
        },
        makeUrlParam: function(config) {
            var param = {
                client_id: config.clientId,
                redirect_uri: config.redirectUri,
                state: config.state,
                response_type: 'code',
            };
            return Object.keys(param)
                .map(function(key) {
                    return key + '=' + encodeURIComponent(param[key])
                })
                .join('&');
        },
        resizeIframe: function(iframe) {
            var winHeight = $(window).innerHeight(),
                height = winHeight;
            var headerHeight = $('.content_top').innerHeight();
            $('.go_body').css("min-height","inherit");
            //클래식 테마 처리
            if(!$("body").hasClass("go_skin_advanced")) {
                headerHeight += $('#menu-container').innerHeight();
            }
            iframe.height(height - headerHeight - 5);
        },
        resizeWindow: function(callback) {
            var ignoreWindowResize = 0,
                resizeUID = 0;
            var args = Array.prototype.slice.call( arguments, 1 );
            if(!ignoreWindowResize) {
                var uid = ++resizeUID;
                setTimeout(function() {
                    if(uid === resizeUID && !ignoreWindowResize) {
                        ignoreWindowResize++;
                        callback.apply(undefined, args);
                        ignoreWindowResize--;
                    }
                }, 200);
            }
        }
    })


})