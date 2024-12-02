define('admin/models/docs_folder', function(require) {

    var _ = require("underscore");

    /**
    *
    * 문서관리 폴더 모델
    *
    */
    var DocsFolderModel = Backbone.Model.extend({

        initialize: function() {

        },
        
        url: function() {
            var url = GO.contextRoot + 'ad/api/docs/companyfolder/';
            return _.isUndefined(this.get('id')) ? url : url + this.get('id');
        }
    });

    return DocsFolderModel;
});