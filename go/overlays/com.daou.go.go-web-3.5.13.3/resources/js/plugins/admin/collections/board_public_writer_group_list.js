define([
        "backbone"
    ],

    function(
        Backbone
    ) {
        var GroupListCollection = Backbone.Collection.extend({
            model : Backbone.Model,
            url: function() {
                return "/ad/api/"+this.groupValue+"/list";
            },
            setGroupName : function(options){
                this.groupValue = options.groupValue;
            }

        });

        return {
            getGroupList: function(opt) {

                var groupListCollection = new GroupListCollection();
                groupListCollection.setGroupName(opt);

                groupListCollection.fetch({async:false,contentType:'application/json'});
                return groupListCollection;
            }
        };
    });