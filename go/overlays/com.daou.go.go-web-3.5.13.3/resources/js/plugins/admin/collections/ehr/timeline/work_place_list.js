define('admin/collections/ehr/timeline/work_place_list', function(require) {
    var WorkPlaceModel = require('admin/models/ehr/timeline/work_place');

    return Backbone.Collection.extend({
        model : WorkPlaceModel,

        initialize : function () {

        },

        url : function () {
            return GO.contextRoot + 'ad/api/timeline/workplaces';
        },

        getById : function (id) {
            return this.findWhere({id : Number(id)});
        },

        sortWorkPlaces : function (sortKey, desc) {
            this.sortKey = sortKey;
            this.desc = desc;
            this.models.sort(function (a, b) {
                var val = 0;
                if (!a.get(sortKey) && b.get(sortKey)) {
                    val = -1;
                } else if (a.get(sortKey) && !b.get(sortKey)) {
                    val = 1;
                } else if (a.get(sortKey) > b.get(sortKey)) {
                    val = 1;
                } else if (a.get(sortKey) < b.get(sortKey)) {
                    val = -1;
                }

                return desc ? -(val) : val;
            });
        }
    });
});