define("timeline/models/auth", function(require){
    var Backbone = require("backbone");
    var GO = require("app");

    var AuthModel = Backbone.Model.extend({
        url : GO.contextRoot + "api/ehr/timeline/auth",

        isEditable : function(){
            return this.get("editable");
        },

        isCreatable : function () {
            return this.get("creatable");
        },

        isDeletable : function() {
            return this.get("deletable");
        },

        isReadable : function() {
            return this.get("readable");
        },

        isSuperUser : function() {
            return (this.get("editable") && this.get("creatable") && this.get("deletable") && this.get("readable"));
        }
    });

    return AuthModel;
});