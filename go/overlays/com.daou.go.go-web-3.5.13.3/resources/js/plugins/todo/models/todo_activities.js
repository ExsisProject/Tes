define("todo/models/todo_activities", [
    "when", 
    "app", 
    "todo/models/base",
    "todo/models/todo_activity",
    "todo/libs/util"
], 

function(
    when, 
    GO, 
    TodoBaseModel, 
    TodoActivity, 
    TodoUtil
) {
    
    var DEFAULT_PAGE = 1, 
        DEFAULT_PAGE_SIZE = 20,
        DEFAULT_ACTIVITY_TYPE = 'comments',
        TodoItemActivityModel = TodoActivity.TodoItemActivityModel, 
        TodoItemCommentModel = TodoActivity.TodoItemCommentModel, 
        BaseActivities, 
        TodoActivities, 
        TodoItemActivities;

    BaseActivities = TodoBaseModel.Collection.extend({
        targetModel: null, 
        page: DEFAULT_PAGE, 
        offset: DEFAULT_PAGE_SIZE, 

        initialize: function(models, options) {
            var tpage, tpagesize;

            tpage = options.page || DEFAULT_PAGE;
            tpagesize = options.pageSize || DEFAULT_PAGE_SIZE;

            this.setPageOption(tpage, tpagesize);
        },

        setPageOption: function(page, size) {
            var tpage = 0;

            page = page || DEFAULT_PAGE;
            pageSize = size || DEFAULT_PAGE_SIZE;
            // 파라미터는 가독성을 위해 1 페이지부터 받지만, 전송시에는 0페이지부터 시작하도록 한다.
            if(page > 0) {
                this.page = page - 1;
                this.offset = pageSize;
            }

            return this;
        }, 

        getPageList: function(page, size) {
            var defer = when.defer();

            try {
                this.setPageOption(page, size)
                    .fetch({
                        success: defer.resolve, 
                        error: function(model, resp, options) {
                            defer.reject(resp);
                        }
                    });

            } catch(err) {
                defer.reject(err);
            }

            return defer.promise;
        }
    });

    TodoActivities = BaseActivities.extend({
        url: function() {
            return [
                GO.config('contextRoot') + 'api/todo', 
                this.targetModel.id, 
                'activity?page=' + this.page + '&offset=' + this.offset
            ].join('/');
        }
    });

    TodoItemActivities = BaseActivities.extend({
        activityType: DEFAULT_ACTIVITY_TYPE,

        initialize: function(options) {
            options = options || {};

            BaseActivities.prototype.initialize.apply(this, arguments);
            this.activityType = options.activityType || DEFAULT_ACTIVITY_TYPE;
        },

        model: function(attrs, options) {
            var klass = {"comment": TodoItemCommentModel, "action": TodoItemActivityModel}[attrs.activityType];
            return klass.newForTodoItem(options.collection.targetModel, attrs, options);
        }, 

        url: function() {
            return [
                GO.config('contextRoot') + 'api/todo', 
                this.targetModel.get('todoId'), 
                'item', 
                this.targetModel.id,
                this.activityType + '?page=' + this.page + '&offset=' + this.offset
            ].join('/');   
        },

        setActivityType: function(newType) {
            this.activityType = newType;
            return this;
        },

        isActivated: function(type) {
            return this.activityType === type;
        },

        createComment: function(content) {
            var self = this;
            return TodoActivity.createComment(this.targetModel, content).then(function(activityModel) {
                self.add(activityModel);
                return when.resolve(self);
            }, when.reject);
        }, 

        updateComment: function(activityId, content) {
            var activity = this.get(activityId), 
                self = this, 
                promise;

            if(activity) {
                promise = activity.updateContent(content).then(function(updated) {
                    self.set([updated]);
                    return when.resolve(updated);
                }, when.resolve);
            } else {
                promise = when.reject(TodoUtil.createResponseError(404, "Not Fount"));
            }

            return promise;
        }, 

        removeComment: function(activityId) {
            var activity = this.get(activityId), 
                self = this, 
                promise;

            if(activity) {
                promise = activity.remove().then(function() {
                    self.remove(activityId);
                    return when.resolve();
                }, when.resolve);
            } else {
                promise = when.reject(TodoUtil.createResponseError(404, "Not Fount"));
            }

            return promise;
        }
    });
    
    function newInstance(type, targetModel, models, options) {
        var klass = {'todo': TodoActivities, "todoItem": TodoItemActivities}[type], 
            instance;

        if(klass) {
            instance = new klass(models, options);
            instance.targetModel = targetModel;
        } else {
            return new Error("Invalid Model Type");
        }

        return instance;
    }

    // Factory
    return {
        TodoActivities: TodoActivities, 
        TodoItemActivities: TodoItemActivities, 
        newForTodo: function(todoModel, models, options) {
            return newInstance('todo', todoModel, models, options);
        }, 

        newForTodoItem: function(todoItemModel, models, options) {
            return newInstance('todoItem', todoItemModel, models, options);
        }
    };
    
});