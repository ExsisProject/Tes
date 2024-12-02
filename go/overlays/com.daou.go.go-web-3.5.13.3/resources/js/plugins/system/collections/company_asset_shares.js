define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");

    var CompanyAssetShareModel = require("system/models/asset_share_model");

    require("GO.util");

    var CompanyAssetShareCollection = Backbone.Collection.extend({
        model: CompanyAssetShareModel,

        initialize: function (id) {
            this.companyGroupId = id;
        },

        url: function () {
            return GO.contextRoot + 'ad/api/system/companygroup/' + this.companyGroupId + '/asset/shares';
        },

        setCompanyGroupId: function (id) {
            this.companyGroupId = !_.isUndefined(id) ? id : 0;
            return this;
        }
    }, {
        getList: function (id) {
            var instance = new CompanyAssetShareCollection(id);
            instance.fetch({async: false});
            return instance;
        }
    });

    return CompanyAssetShareCollection;
});