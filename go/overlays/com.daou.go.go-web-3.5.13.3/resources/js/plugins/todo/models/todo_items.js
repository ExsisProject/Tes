define("todo/models/todo_items", [
    "when",
    "app",
    "todo/models/base",
    "todo/models/todo_item",
    "todo/libs/util"
],

function(
    when,
    GO,
    TodoBaseModel,
    TodoItemModel,
    TodoUtil
) {

    var TodoItemList;

    TodoItemList = TodoBaseModel.Collection.extend({
        todoModel: null,
        filterCondition: {},

        model: function(attrs, options) {
            var self = options.collection;
            return TodoItemModel.newFromTodo(self.todoModel, attrs, options);
        },

        url: function() {
            return [GO.config('contextRoot') + 'api/todo', this.todoModel.id, 'item/list'].join('/');
        },

        initialize: function(models, options) {
            TodoBaseModel.Collection.prototype.initialize.apply(this, arguments);
            this.filterCondition = {};
        },

        setFilter: function(condition) {
            var args = [].slice.call(arguments);

            if(_.isString(condition)) {
                this.filterCondition[condition] = args[1];
            } else if(_.isObject(condition)) {
                _.extend(this.filterCondition, condition);
            }

            return this;
        },

        getFilteredList: function(condition) {
            this.setFilter(condition);

            return TodoUtil.promiseAsync(_.result(this, 'url'), {
                type: 'POST',
                data: this.filterCondition || {}
            }).then(_.bind(this.reset, this));
        },

        updateTodoItem: function(itemId, attrs) {
            var targetModel = this.get(itemId),
                self = this;

            return targetModel.updateAttributes(attrs).then(function(updatedModel) {
                self.updateModel(updatedModel);

                return self;
            });
        }
    }, {
        newFromTodo: function(todoModel, models, options) {
            var instance = new this.prototype.constructor(models, options);
            instance.todoModel = todoModel;

            return instance;
        }
    });

    return TodoItemList;

});
