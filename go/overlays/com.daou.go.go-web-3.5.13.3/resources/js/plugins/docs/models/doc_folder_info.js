define('docs/models/doc_folder_info', function(require) {

    var Backbone = require("backbone");

    return Backbone.Model.extend({

        initialize: function (data) {
            this.id = data ? data.id : null;
        },
        urlRoot : function() {
            return "/api/docs/folder";
        },
        getName: function (){
            return this.get('name');
        },

        getSeq: function (){
            return this.get('seq');
        },

        getState: function (){
            return this.get('state');
        },

        getDocYear: function (){
            return this.get('docYear');
        },

        getDocYearIndex: function(){

            var docYear = this.get("docYear");

            if (docYear == 1) {
                return 0;
            } else if (docYear == 3) {
                return 1;
            } else if (docYear == 5) {
                return 2;
            } else if (docYear == 10) {
                return 3;
            } else if (docYear == 0) {
                return 4;
            }

            return 2;
        },

        useDocNum: function (){
            return this.get('useDocNum');
        },

        useApproved: function (){
            return this.get('useApproved');
        },

        isReadable: function (){
            return this.get('readable');
        },

        isWritable: function (){
            return this.get('writable');
        },

        isManagable: function (){
            return this.get('managable');
        },

        isRemovable: function (){
            return this.get('removable');
        },

        _getParentPathName: function (){
            return this.get('parentPathName');
        },

        _getParentId: function (){
            return this.get('parentId');
        },

        _getParentName: function (){
            return this.get('parentName');
        },

        isFavorite: function(){
            return this.get('favorite');
        },

        isRoot: function() {
            return (this._getParentPathName() == this.getName()) || !this._getParentId() && !this._getParentName();
        },

        getDepth: function(){
            return this._getParentPathName() ? this._getParentPathName().split('>').length - 1 : 0;
        },

        getParent: function(){
            return this.get('parent');
        }
    });
});