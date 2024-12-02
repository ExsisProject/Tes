define("todo/models/todo_burnup_list", [
    "backbone",
    "moment",
    "when",
    "app"
],

function(
    Backbone,
    moment,
    when,
    GO
) {

    var TodoBurnupList,
        DATE_FORMAT = 'YYYY-MM-DDT';

    TodoBurnupList = Backbone.Collection.extend({
        fetchLock: false,

        url: function() {
            return GO.config("contextRoot") + 'api/todo/' + this.todoId + '/burnup';
        },

        initialize: function(options) {
            options = options || {};
            this.todoId = options.todoId;
        },

        getFilteredData: function(startDate, endDate, columnIds) {
            var defer = when.defer();
            var self = this;
            var startDate = GO.util.toISO8601(GO.util.toMoment(startDate).startOf('day'));
            var endDate = GO.util.toISO8601(GO.util.toMoment(endDate).endOf('day'));
            var reqData = {
                    "startDate": startDate,
                    "endDate": endDate,
                    "ids": columnIds || []
                };

            if(this.fetchLock) {
                return defer.promise;
            }

            this.fetch({
                type: 'POST',
                contentType: "application/json",
                data: JSON.stringify(reqData),
                beforeSend: function() {
                    self.fetchLock = true;
                },
                success: defer.resolve,
                error: function(model, err, options) {
                    defer.reject(err);
                },
                complete: function() {
                    self.fetchLock = false;
                }
            });

            return defer.promise;
        }
    });

    return TodoBurnupList;

});
