define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");

    require("GO.util");

    var CompanyBoardShareModel = Backbone.Model.extend({
        initialize: function (id) {
            this.companyGroupId = id;
        },

        idAttribute: "_id",
        // url : GO.contextRoot + 'ad/api/company/board/shares/add'
        url: function () {
            return GO.contextRoot + 'ad/api/system/companygroup/' + this.companyGroupId + '/board/shares'
        }

    });

    return CompanyBoardShareModel;
});