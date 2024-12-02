define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");

    require("GO.util");

    var CompanyAssetShareModel = Backbone.Model.extend({
        idAttribute: "_id",
        initialize: function (id) {
            this.companyGroupId = id;
        },
        url: function () {
            return GO.contextRoot + 'ad/api/system/companygroup/' + this.companyGroupId + '/asset/shares'
        }
    });

    return CompanyAssetShareModel;
});