define([
    "backbone"
],
function(Backbone) {

    /**
     * 전자결재 열람자 상세 모델입니다.
     * 
     * 기존에 중구난방으로 모델을 작성되어 있는 상태이며, 
     * 이 곳으로 모든 로직이나 URL 정보 및 접근 가능한 데이터 키들을 모으려 합니다.
     * 결재 관련된 작업이 있을 때마다 리팩토링하여 모델을 키워나갑니다.
     * (컬렉션 같은데, 왜 모델로 작성되어 있는지도 의문!)
     */
    var DocReaderModel = Backbone.Model.extend({
        
        initialize: function(docId) {
            this.docId = docId;
        },
        
        url: function() {
            return ['/api/approval/document', this.docId, 'reader'].join('/');
        }
    });

    return DocReaderModel;
});