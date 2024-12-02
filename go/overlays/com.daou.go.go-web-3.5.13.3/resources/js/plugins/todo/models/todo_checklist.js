define("todo/models/todo_checklist", [
    "when", 
    "app", 
    "todo/models/base", 
    "todo/models/todo_checklist_item", 
    "todo/libs/util"
], 

function(
    when, 
    GO, 
    TodoBaseModel, 
    TodoChecklistItemModel, 
    TodoUtil
) {

    var TodoChecklistModel;

    TodoChecklistModel = TodoBaseModel.Model.extend({
        todoItemModel: null, 

        urlRoot: function() {
            return [GO.config('contextRoot') + 'api/todo', this.todoItemModel.get('todoId'), 'item', this.get("todoItemId"), 'checklist'].join('/');
        }, 

        updateTitle: function(newTitle) {
            var defer = when.defer();

            this.save({"title": newTitle}, {
                success: defer.resolve, 
                error: function(model, resp, options) {
                	if(resp.responseJSON.code == 404 && resp.responseJSON.name == "todo.not.found.element") {
                        $.goSlideMessage(resp.responseJSON.message, 'caution');
                    }
                    defer.reject(resp);
                }
            });

            return defer.promise;
        }, 

        remove: function() {
            var defer = when.defer();

            this.destroy({
                success: defer.resolve, 
                error: function(model, resp, options) {
                    defer.reject(resp);
                }
            });

            return defer.promise;
        }, 

        getChecklistItem: function(itemId) {
            return _.findWhere(this.getChecklistItems(), {"id": itemId});
        }, 

        getChecklistItems: function() {
            return this.get('checklistItems') || [];
        }, 

        getNextItemSeq: function() {
            return this.getChecklistItems().length;
        },

        getCheckedItems: function() {
            return _.filter(this.getChecklistItems(), function(items) {
                return items.checkFlag === 'Y';
            });
        },

        getCheckedItemCount: function() {
            return this.getCheckedItems().length;
        },

        addItem: function(itemModel) {
            var attr = {}, 
                curChecklistItems = this.getChecklistItems();

            if(itemModel instanceof TodoChecklistItemModel) {
                attr = itemModel.toJSON();
            } else {
                attr = itemModel;
            }

            curChecklistItems.push(attr);
            this.set('checklistItems', curChecklistItems);

            return this;
        }, 

        createItem: function(title) {
            var self = this, 
                curChecklistItems = this.getChecklistItems();

            return TodoChecklistItemModel.createFromChecklist(this, title).then(function(newItemModel) {
                self.addItem(newItemModel);
                return when.resolve(newItemModel);
            }, when.reject);
        }, 

        updateItemTitle: function(itemId, title) {
            var checklistItem = this.getChecklistItem(itemId), 
                checklistItems = this.getChecklistItems(), 
                checklistItemModel = TodoChecklistItemModel.newFromChecklist(this, checklistItem), 
                self = this;

            return checklistItemModel.updateTitle(title).then(function(checklistItemModel) {                
                self.set('checklistItems', updateChecklistItems(checklistItems, checklistItemModel));
                return when.resolve(self);
            }, when.reject);
        }, 

        toggleItem: function(itemId) {
            var checklistItem = this.getChecklistItem(itemId), 
                checklistItems = this.getChecklistItems(), 
                checklistItemModel = TodoChecklistItemModel.newFromChecklist(this, checklistItem), 
                self = this;

            return checklistItemModel.toggle().then(function(checklistItemModel) {
                self.set('checklistItems', updateChecklistItems(checklistItems, checklistItemModel));
                return when.resolve(self);
            }, when.reject);
        }, 

        removeItem: function(itemId) {
            var checklistItem = this.getChecklistItem(itemId), 
                checklistItems = TodoUtil.convertArrayToCollection(this.getChecklistItems(), TodoChecklistItemModel), 
                checklistItemModel = TodoChecklistItemModel.newFromChecklist(this, checklistItem), 
                self = this;

            return checklistItemModel.remove().then(function() {
                checklistItems.remove(checklistItemModel);
                self.set('checklistItems', checklistItems.toJSON());
                return when.resolve();
            }, when.reject);
        }, 

        // TODO: 좀 더 단순하게 리팩토링....
        moveItem: function(itemId, newChecklistId, newSeq) {
            var checklistItemModel = getChecklistItemModel.call(this, itemId),
                checklistItems = this.getChecklistItems(), 
                self = this;

            return checklistItemModel.move(newChecklistId, newSeq).then(function(/*TodoChecklistItemModel*/itemList) {
                return when.resolve(itemList);
            }, when.reject);
        }
    }, {
        newFromTodoItem: function(todoItemModel, attrs) {
            var instance;

            instance = new TodoChecklistModel(_.extend(attrs, {
                "todoItemId": todoItemModel.id
            })); 

            instance.todoItemModel = todoItemModel;

            return instance;
        }, 

        createFromTodoItem: function(todoItemModel, title) {
            var instance = this.newFromTodoItem(todoItemModel, {"title": title}), 
                defer = when.defer();

            instance.save({"seq": todoItemModel.getNextChecklistSeq()}, {
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

    function getChecklistItemModel(itemId) {
        return TodoChecklistItemModel.newFromChecklist(this, this.getChecklistItem(itemId))
    }

    function updateChecklistItems(checklistItems, checklistItemModel) {
        _.map(checklistItems, function(item) {
            if(item.id === checklistItemModel.id) {
                _.extend(item, checklistItemModel.toJSON());
            }
        });

        return checklistItems;
    }

    return TodoChecklistModel;
})