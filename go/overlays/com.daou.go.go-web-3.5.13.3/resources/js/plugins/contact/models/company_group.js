define(function(require){
    var Backbone = require("backbone");
    var CompanyGroup = Backbone.Model.extend({
        isRoot: function() {
            return (this._getParentPathName() == this.getName()) || !this._getParentId() && !this._getParentName();
        },

        getDepth: function(){
            return this._getParentPathName() ? this._getParentPathName().split('>').length - 1 : 0;
        },

        getParent: function(){
            return this.get('parent');
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

        getName: function (){
            return this.get('name');
        },

        hasChild: function() {
            return this.get("hasChildren");
        },

        getChildren : function (){
            return this.get("children");
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
    });
    return CompanyGroup;
});