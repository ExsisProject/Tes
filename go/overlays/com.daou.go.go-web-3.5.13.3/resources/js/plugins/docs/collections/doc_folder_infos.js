define('docs/collections/doc_folder_infos', function(require) {

    var Backbone = require("backbone");
    var _ = require("underscore");
    var DocsFolderInfo = require("docs/models/doc_folder_info");
    var GO = require("app");

    return Backbone.Collection.extend({
        model: DocsFolderInfo,

        url: function () {
            return GO.contextRoot + "api/docs/folder/side";
        },

        _getChildrenFolder : function(parentId) {
            var children = [];
            _.each(this.models, function(model) {
                if(model.attributes.parentId == parentId){
                    children.push(model);
                }
            });
            return children;
        },

        getEveryChildrenFolder : function(parentId){
            var children = this._getChildrenFolder(parentId);
            var self = this;
            _.each(children, function(model) {
                children.push.apply(children, self.getEveryChildrenFolder(model.id));
            });
            return children;
        },
        
        getEveryChildrenFolderBySearchPopup : function(parentId){
        	var self = this;
            var children = _.sortBy(this._getChildrenFolder(parentId), function(childData){
            	return childData.attributes.seq;
            })
            var result = [];
            _.each(children, function(model) {
            	result.push(model);
            	result.push.apply(result, self.getEveryChildrenFolderBySearchPopup(model.id));
            });
            return result;
        },

        getRootFolders : function(){
            var roots = [];
            var sorted = _.sortBy(this.models, function(model){
            	return model.get("seq");
            });
            _.each(sorted, function(model){
                if(model.isRoot()){
                    roots.push(model);
                }
            });
            return roots;
        },

        getExistModel : function(model){
            _.find(this.models, function(existModel) {
                if(existModel.attributes.id == model.id){
                    if(model.depth != undefined && existModel.dept != undefined){
                        return existModel;
                    }
                }
            });
            return model;
        },

        isAccessFolder : function(id) {
            var returnVal = false;
            _.each(this.models, function (model) {
                if (model.id == id && model.getState() == "NORMAL" ) {
                    returnVal = model.isWritable() ? model.isWritable() : false;
                }
            });
            return returnVal;
        },

        isReadableFolder : function(id) {
            var returnVal = false;
            _.each(this.models, function (model) {
                if (model.id == id && model.getState() == "NORMAL" ) {
                    returnVal = model.isReadable() ? model.isReadable() : false;
                }
            });
            return returnVal;
        },

        findFolderModel : function(id){
            var returnModel = null;
            _.each(this.models, function (model) {
                if (model.id == id) {
                    returnModel = model;
                }
            });
            return returnModel == null ? new DocsFolderInfo({id : id}) : returnModel;
        }
    });
});