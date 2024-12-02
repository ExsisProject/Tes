define(function(require){
    var Backbone = require("backbone");
    var Model = require("contact/models/company_group");

    var CompanyGroup = Backbone.Collection.extend({
        comparator : "seq",

        model : Model,

        url: function() {
            return "/api/contact/company/group?property=seq&direction=asc";
        },

        getNodes: function(parentId) {
            return this.filter(function(boardTreeNode) {
                var curPid = boardTreeNode.get('parentId');

                if(!parentId) {
                    return !curPid;
                } else {
                    return curPid === parentId;
                }
            });
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

        isReadableFolder : function(id) {
            var returnVal = false;
            _.each(this.models, function (model) {
                if (model.id == id) {
                    returnVal = model.isReadable() ? model.isReadable() : false;
                }
            });
            return returnVal;
        },

        convertNodeTree : function() {
            var nodeList = new CompanyGroup();
            this.each(function(model) {
               nodeList.push(model);
            });
            return nodeList;
        }
    }); 
    
    return {
        // 호환성을 위해 유지.
        getCollection: function(type) {
            if(type == 'true') {
                async = true;
            } else {
                async = false;
            }
            var CompanyGroupCollection = new CompanyGroup();
            CompanyGroupCollection.fetch({ async : async, reset : true});
            return CompanyGroupCollection;
        },
        
        init : function() {
            return new CompanyGroup();
        },

        getCollectionByParent : function(parentId) {
            var CompanyGroupCollection = new CompanyGroup();
            CompanyGroup.prototype.url = function() {
                var url = ['/api/contact/side', parentId];
                return url.join('/');
            }
            CompanyGroupCollection.fetch({async:false});
            return CompanyGroupCollection;
        }
    };    
});