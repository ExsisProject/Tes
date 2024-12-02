define("todo/models/todo_checklist_item", [
    "when", 
    "todo/models/base", 
    "todo/libs/util"
], 

function(
    when, 
    TodoBaseModel, 
    TodoUtil
) {

    var TodoChecklistItemModel;

    TodoChecklistItemModel = TodoBaseModel.Model.extend({
        todoChecklistModel: null, 

        defaults: {
            "seq": 0
        }, 

        urlRoot: function() {
            return [_.result(this.todoChecklistModel, 'urlRoot'), this.todoChecklistModel.id, 'item'].join('/');
        }, 

        updateTitle: function(title) {
            return TodoUtil.promiseModelSave(this, {"title": title});
        }, 

        toggle: function() {
            var nextFlag = this.isChecked() ? 'N' : 'Y';
            return TodoUtil.promiseModelSave(this, {"checkFlag": nextFlag});
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

        // TODO: 좀 더 단순하게 리팩토링....
        move: function(checklistId, seq) {
            return TodoUtil.promiseAsync([_.result(this, 'urlRoot'), this.id, 'move'].join('/'), {
                "type": 'PUT', 
                "data": {"checklistId": checklistId, "seq": seq}
            });
        }, 

        // TODO: 테스트 코드 작성
        isChecked: function() {
            return this.get('checkFlag') === 'Y';
        }
    }, {
        newFromChecklist: function(todoChecklistModel, attrs) {
            var instance;

            instance = new TodoChecklistItemModel(_.extend(attrs, {
                "checklistId": todoChecklistModel.id
            })); 

            instance.todoChecklistModel = todoChecklistModel;

            return instance;
        }, 

        createFromChecklist: function(todoChecklistModel, title) {
            var instance = this.newFromChecklist(todoChecklistModel, {
                    "title": title, 
                    "seq": todoChecklistModel.getNextItemSeq()
                }), 
                defer = when.defer();

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

    return TodoChecklistItemModel;

});