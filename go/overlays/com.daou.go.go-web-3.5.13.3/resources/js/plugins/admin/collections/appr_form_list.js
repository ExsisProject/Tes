define([
    "admin/models/appr_form",
    "backbone"
],
function(
    ApprFormModel,
    Backbone
) {

    /**
    *
    * 결재 양식 모델
    *
    */
    var ApprFormCollection = Backbone.Collection.extend({

        model: ApprFormModel,
        url: GO.contextRoot + 'ad/api/approval/apprform',
        initialize: function() {
            //
        }
    });

    return ApprFormCollection;
});