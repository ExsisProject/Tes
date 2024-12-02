(function() {
    define([
        "jquery",
        "backbone",
        "app"
    ], 
    function(
        $,
        Backbone,
        App
    ) {
        /**
        *
        * 시행문 미리보기 모델
        *
        */
        var OfficialPreviewModel = Backbone.Model.extend({
        	
            initialize: function(options) {
            },
            
            url : function() { //시행문은 api를 한번 거친후 response데이터를 토대로 content를 만들떄도 있는데 그런 경우의 url.
            	var docId = this.get('document').documentId;
                var url = GO.contextRoot + 'api/approval/document/'+docId+'/official/preview';
                return url;
            },
            
            getFullShowUrl : function(){ // 팝업창으로 이동하기 위한 url를 만든다
            	return window.location.protocol + "//" +window.location.host + GO.contextRoot +"app" + this.getShowUrl();
            },
            
            getShowUrl : function(){
            	var docId = this.get('document').documentId;
            	return "/approval/official/" + docId + "/popup/print/";
            }
        });

        return OfficialPreviewModel;
    });
}).call(this);