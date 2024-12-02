define("mail/views/home", function(require){
    var Backbone = require("backbone");
    var Session = require('models/session');

    require("jquery.go-preloader");

    var Home = Backbone.View.extend({

        initialize : function(){
            new Session(null, {instanceType: GO.instanceType}).fetch({
                async : false,
                error : function(){
                    window.location.href = "/app/mail";
                }
            });
        },
        render : function(){
            var url = "/app/mail/home";
            var params = GO.util.getQueryParam();

            if(!_.isEmpty(params)){
                url += "?" + GO.util.jsonToQueryString(params);
            }

            var iframe = $("<iframe id='mail-viewer' scrolling='no' width='100%' marginHeight='0' marginWidth='0' frameBorder='0' src='" + url + "'></iframe>");
            this.$el.html(iframe);
            resizeIFrame( iframe );
            $(window).resize(function() {
                windowResize( resizeIFrame, iframe );
            });

            var ignoreWindowResize = 0,
                resizeUID = 0;

            function windowResize( callback ) {
                var args = Array.prototype.slice.call( arguments, 1 );
                if(!ignoreWindowResize) {
                    var uid = ++resizeUID;
                    setTimeout(function() {
                        if(uid == resizeUID && !ignoreWindowResize) {
                            ignoreWindowResize++;
                            callback.apply(undefined, args);
                            ignoreWindowResize--;
                        }
                    }, 200);
                }
            };

            function resizeIFrame( iframe ) {
                var winHeight = $(window).height(),
                    height = winHeight;

                //advanced일때 주석 조직도 처리
                /*$('.go_wrap').children().each(function(i, child) {
                   if($(child).is(":not(.go_body), aside.go_organogram")) {
                        height -= $(child).outerHeight();
                    }
                });*/
                //$('.go_body').height(height);
                var headerHeight = 0;
                $('.go_body').css("min-height","inherit");

                //테마가 클래식일때 header만큼 높이값 더 빼줘야함.
                if(!$("body").hasClass("go_skin_advanced")) {
                    headerHeight = 50;
                    $('.go_body').height(height - headerHeight);
                }

                var MARGIN_HEIGHT = 4;
                iframe.height(height - MARGIN_HEIGHT - headerHeight);

                var fixedHeader = iframe.contents().find("#mailHeaderWrap").outerHeight(),
                    toolbar = iframe.contents().find("#write_toolbar_wrap").outerHeight();

                var writeArea = height - MARGIN_HEIGHT - headerHeight - fixedHeader - toolbar;
                iframe.contents().find("#mailWriteArea").css({"overflow-y":"auto","height": writeArea - 10 + "px"});
                iframe.contents().find("#mailSettingContent").css({"overflow-y":"auto","height":(height - 175) + "px"});
                return;
            };

            return iframe;
        }
    });

    return Home;
});