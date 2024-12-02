define([
        "backbone"
],

function(
    Backbone
) {
    var DateList = Backbone.Collection.extend({
        url: function() {
            return ['/api/asset/item', this.itemId, 'unreserved/dates'].join('/');
        },
        setItemId: function(id) {
            this.itemId = id;
        },
        parse: function(resp) {
            return _.map(resp.content, function(resp) {
                return resp.data;
            });

        }
    });

    return {
        getCollection: function(opt) {
            var dateList = new DateList();
            var data = {};
            dateList.setItemId(opt.data.assetItem);
            data.recurrence = opt.data.recurrence;
            data.startTime = opt.data.startTime;
            data.endTime = opt.data.endTime;

            return dateList.fetch({data : data, async:false}).responseJSON.data;
        }
    }

});