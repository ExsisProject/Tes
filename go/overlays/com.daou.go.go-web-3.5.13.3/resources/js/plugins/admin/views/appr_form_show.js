define([
    "jquery",
    "backbone",
    "app",
    "admin/models/appr_form",
    "admin/views/appr_form",
    "jquery.go-sdk"
],
function (
    $,
    Backbone,
    App,
    ApprFormModel,
    ApprFormView
) {
    /**
     *
     * 결재 양식 상세/수정 뷰
     *
     */
    return Backbone.View.extend({

        model: null,
        apprFormView: null,

        initialize: function () {
            this.model = new ApprFormModel({
                'id': this._getFormId()
            });

            this.apprFormView = new ApprFormView({
                model: this.model
            });
        },

        render: function () {
            this.model.fetch();
        },

        _getFormId: function () {
            var pathSplit = GO.router.getUrl().split('/');
            return pathSplit[_.indexOf(pathSplit, 'apprform') + 1];
        }
    });
});