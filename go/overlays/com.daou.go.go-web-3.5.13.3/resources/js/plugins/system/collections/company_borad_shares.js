define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");

    var CompanyBoardShareModel = require("system/models/board_share_model");

    require("GO.util");

    var CompanyBoardShareCollection = Backbone.Collection.extend({
        model: CompanyBoardShareModel,

        initialize: function (id) {
            this.companyGroupId = id;
        },

        url: function () {
            // return GO.contextRoot + 'ad/api/board/company/shares?companyGroupId=' + this.companyGroupId
            return GO.contextRoot + 'ad/api/system/companygroup/' + this.companyGroupId + '/board/shares';
        },

        setCompanyGroupId: function (id) {
            this.companyGroupId = !_.isUndefined(id) ? id : 0;
            return this;
        }
    }, {
        getList: function (id) {
            var instance = new CompanyBoardShareCollection(id);
            instance.fetch({async: false});
            return instance;
        }
    });

    return CompanyBoardShareCollection;
});