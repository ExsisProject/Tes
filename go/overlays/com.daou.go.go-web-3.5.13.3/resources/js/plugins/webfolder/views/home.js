define("webfolder/views/home", function(require){
    var Backbone = require("backbone");
    var Session = require('models/session');

    var Home = Backbone.View.extend({
        initialize : function(){
            new Session(null, {instanceType: GO.instanceType}).fetch({
                async : false,
                error : function(){
                    window.location.href = "/app/webfolder";
                }
            });
        },
        render : function(){
            var url = "/app/webfolder/home";
            var params = GO.util.getQueryParam();

            if(!_.isEmpty(params)){
                url += "?" + GO.util.jsonToQueryString(params);
            }

            var iframe = $("<iframe id='webfolder-viewer' width='100%' marginHeight='0' marginWidth='0' frameBorder='0' src='" + url + "'></iframe>");
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

                $('.go_wrap').children().each(function(i, child) {
                    if($(child).is(":not(.go_body), aside.go_organogram")) {
                        height -= $(child).outerHeight();
                    }
                });

                $('.go_body').height(height);

                var MARGIN_HEIGHT = 4;
                iframe.height(height - MARGIN_HEIGHT);

                return;
            };

            return iframe;
        }
    });

    return Home;
});