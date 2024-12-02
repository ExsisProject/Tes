define([
    "backbone",
    "go-map"
],
function(Backbone) {

    return Backbone.Model.extend({


        initialize: function(target) {
            this.targetUrl = "";

            switch (target) {
                case 'kakao':
                    this.targetUrl = GO.util.kakaoMap.getURL();
                default :
                    this.targetUrl = GO.util.kakaoMap.getURL();
            }
        },

        url: function() {
            return this.targetUrl;
        }
    });
});