define("todo/models/todo_burnup", [
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
        url: function() {
            return GO.config("contextRoot") + 'api/todo/' + this.todoId + '/burnup';
        }, 
        
        initialize: function(options) {
        	options = options || {};
        	this.todoId = options.todoId;
        }, 

        getFilteredData: function(startDate, endDate, columnIds) {
            var reqData = {
                    "startDate": moment(startDate).format(DATE_FORMAT + '00:00:00'), 
                    "endDate": moment(endDate).format(DATE_FORMAT + '23:59:59'), 
                    "ids": columnIds || []
                }, 
                defer = when.defer();

            this.fetch({
                type: 'POST', 
                contentType: "application/json", 
                data: JSON.stringify(reqData),
                success: defer.resolve, 
                error: function(model, err, options) {
                    defer.reject(err);
                }
            });

            return defer.promise;
        }
    });

    return TodoBurnupList;

});