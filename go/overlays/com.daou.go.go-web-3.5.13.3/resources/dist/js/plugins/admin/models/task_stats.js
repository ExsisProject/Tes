define(["backbone"],function(e){var t=e.Model.extend({initialize:function(){},url:function(){return"/ad/api/task/present"},totalCount:function(){return parseInt(this.get("aliveFolders"))+parseInt(this.get("stoppedFolders"))},typeLabel:function(){return _.map(this.get("types"),function(e){return e.name}).join(", ")}});return t});