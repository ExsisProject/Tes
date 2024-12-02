define("todo/models/todo_label", [
    "app", 
    "todo/models/base"
], 

function(
    GO, 
    TodoBaseModel
) {

    var TodoLabelModel;

    TodoLabelModel = TodoBaseModel.Model.extend({
        urlRoot: function() {
            return GO.config("contextRoot") + 'api/todo/' + this.get("todoId") + '/label';
        }
    });

    return TodoLabelModel;

});