(function(win, $, _) {

    var global = win;
    var GO = ( global.GO || {} );

    var kakaoMap = (function() {
        // //dapi.kakao.com/v2/maps/sdk.js?appkey=3a6bd28fe2d524c5415fd592daac2758&libraries=services&autoload=false
        var jsUrl = "dapi.kakao.com/v2/maps/sdk.js";
        var urlParam = "&libraries=services&autoload=false";
        var appkey = "";
        var getKeyURL = "/go/ad/api/system/kakaojavascriptappkey";
        var getKeyURLForSiteAdmin = "/go/ad/api/kakaojavascriptappkey";

        function initAppkey() {
            $.ajax({
                url: getKeyURLForSiteAdmin,
                async: false,
                type : 'GET',
            }).done(function(res){
                appkey = res.data.str;
            }).fail(function() {
                appkey = "";
            })
        }
        return {
            scriptLoad: function(callback, errorCallback) {
                initAppkey();
                $.ajax({
                    type: 'GET',
                    url: '//' + jsUrl + '?appkey=' + appkey + urlParam,
                    dataType: 'script'
                }).done(callback).fail(errorCallback);
            },
            getURL: function() {
                return getKeyURL;
            }
        }
    })();

    GO.util = _.extend(GO.util, {
        kakaoMap: kakaoMap
    });
    
})(window, ($ || jQuery), _);