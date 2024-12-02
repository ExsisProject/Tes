define([
    "approval/models/appr_form",
    "backbone"
],
function(
    ApprFormModel,
    Backbone
) {

    /**
     * 사용자가 운영자로 지정된 결재 양식 컬렉션입니다.
     */
    var ApprFormCollection = Backbone.Collection.extend({
        model: ApprFormModel,

        initialize: function (isAdmin) {
            this.isAdmin = isAdmin;
        },

        url: function () {
            if (this.isAdmin) {
                return GO.contextRoot + 'ad/api/approval/apprform/admin/normal';
            }
            return GO.contextRoot + 'api/approval/apprform/admin';
        }
    });

    return ApprFormCollection;
});