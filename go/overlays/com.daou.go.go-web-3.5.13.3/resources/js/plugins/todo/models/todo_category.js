define("todo/models/todo_category", [
    "when", 
    "app", 
    "todo/models/base"
], 

function(when, GO, TodoBaseModel) {

    var TodoCategoryModel;

    TodoCategoryModel = TodoBaseModel.Model.extend({
        urlRoot: function() {
            return GO.config('contextRoot') + 'api/todo/' + this.get('todoId') + '/category';
        }
    }, {
        createfromTodo: function(todoModel, title) {
            var todoId = todoModel.id, 
                nextSeq = todoModel.getCategories().length, 
                defer = when.defer(), 
                instance;

            instance = new TodoCategoryModel({"todoId": todoModel.id, "seq": nextSeq, "title": title});
            instance.save(null, {
                success: defer.resolve, 
                error: function(model, resp, options) {
                	if(resp.responseJSON.code == 404 && resp.responseJSON.name == "todo.not.found.element") {
                        $.goSlideMessage(resp.responseJSON.message, 'caution');
                    }
                    defer.reject(resp);
                }
            });

            return defer.promise;
        }   
    });

    return TodoCategoryModel;
});