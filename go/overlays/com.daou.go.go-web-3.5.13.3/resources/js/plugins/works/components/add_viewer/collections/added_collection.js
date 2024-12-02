define(
    ["backbone"], function(Backbone) {
        var AddCollections = Backbone.Collection.extend({
            getById: function(id) {
                return this.filter(function (model) {
                    return parseInt(model.get('id')) === parseInt(id);
                });
            }
        });
        return AddCollections;
    }
);