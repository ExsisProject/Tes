define([
    "backbone"
],
function(Backbone) {

    /**
    *
    * 사용자가 운영자로 지정된 결재 양식 모델입니다.
    *
    */
    var ApprFormModel = Backbone.Model.extend({

        defaults: {
            name: ''
        }
    });

    return ApprFormModel;
});