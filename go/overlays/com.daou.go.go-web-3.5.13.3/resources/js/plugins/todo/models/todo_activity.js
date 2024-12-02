define("todo/models/todo_activity", [
    "when",
    "app",
    "todo/models/base",
    "todo/libs/util"
],

function(
    when,
    GO,
    TodoBaseModel,
    TodoUtil
) {

    var ACTIVITY_TYPE = {"comment": 'comment', "action": 'action'},
        BaseActivityModel,
        TodoItemActivityModel;


    BaseActivityModel = TodoBaseModel.Model.extend({
        targetModel: null,
        set: function(/*args*/) {
            var args = [].slice.call(arguments);

            // activityType 일 경우에는 무시하고 넘어간다.
            if(_.isString(args[0]) && args[0] === 'activityType') {
                return this;
            }

            if(_.isObject(args[0])) {
                args[0] = _.omit(args[0], 'activityType');
            }

            return TodoBaseModel.Model.prototype.set.apply(this, args);
        },

        _set: function() {
            return TodoBaseModel.Model.prototype.set.apply(this, arguments);
        },

        isCommentType: function() {
            return this.get("activityType") === ACTIVITY_TYPE.comment;
        },

        isActionType: function() {
            return this.get("activityType") === ACTIVITY_TYPE.action;
        }
    }, {
        newForTodoItem: function(todoItemModel, attrs, options) {
            var instance = new this.prototype.constructor(attrs, options);
            instance.targetModel = todoItemModel;

            return instance;
        }
    });

    TodoItemActivityModel = BaseActivityModel.extend({
        save: function() {
            // 동작 무효화 시킴
        },

        destory: function() {
            // 동작 무효화 시킴
        }
    });

    TodoItemCommentModel = BaseActivityModel.extend({
        urlRoot: function() {
            var url = [GO.config('contextRoot') + 'api/todo', this.targetModel.get('todoId'), 'item', this.targetModel.id, 'comment'].join('/');
            return url;
        },

        initialize: function(attrs, options) {
            BaseActivityModel.prototype.initialize.call(this, arguments);
            this._set('activityType', ACTIVITY_TYPE.comment);
        },

        updateContent: function(content) {
            return TodoUtil.promiseModelSave(this, {"content": content});
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
        }
    }, {
        createForTodoItem: function(todoItemModel, content) {
            var instance = this.newForTodoItem(todoItemModel);
            return instance.updateContent(content);
        }
    });

    // factory
    return {
        ACTIVITY_TYPE : ACTIVITY_TYPE,
        TodoItemActivityModel: TodoItemActivityModel,
        TodoItemCommentModel: TodoItemCommentModel,

        newComment: function(todoItemModel, attrs, options) {
            return TodoItemCommentModel.newForTodoItem(todoItemModel, attrs, options);
        },

        createComment: function(todoItemModel, content) {
            return TodoItemCommentModel.createForTodoItem(todoItemModel, content);
        }
    };

});
