define("todo/models/todos", [
	"when", 
	"app", 
    "todo/models/base",
    "todo/models/todo",
    "todo/libs/util"
], 
	
function(
    when, 
    GO, 
    TodoBaseModel, 
    TodoModel, 
    TodoUtil
) {
	
	var BaseTodoList, 
        MyTodoList, FavoriteTodoList, 
        MODEL_TYPE = {"my": 'my', "favorite": 'favorite'};
	
    BaseTodoList = TodoBaseModel.Collection.extend({
        model: TodoModel, 
        modelType: MODEL_TYPE.my, 
        comparator: 'seq', 

        reorder: function() {}
	});

    MyTodoList = BaseTodoList.extend({
        url: function() {
            return getUrlByModelType(MODEL_TYPE.my)
        }
    });

    FavoriteTodoList = BaseTodoList.extend({
        url: function() {
            return getUrlByModelType(MODEL_TYPE.favorite);
        }, 

        reorder: function(todoIds) {
            var self = this, 
                defer = when.defer();

            TodoUtil.reqReorderList(GO.config('contextRoot') + 'api/todo/favorite/move', todoIds)
                    .then(function(data) {
                        _.map(todoIds, function(todoId, newSeq) {
                            var curTodo = self.get(todoId);
                            curTodo.set('seq', newSeq);
                        });

                        self.sort();
                        defer.resolve(self);
                    }, defer.reject);

            return defer.promise;
        }
    });
	
    function getUrlByModelType(type) {
        var urlRoot = GO.config('contextRoot') + 'api/todo', 
            modelType = MODEL_TYPE[type];

        return [urlRoot, modelType || MODEL_TYPE.my].join('/');
    }

    function getBoardsByModelType(type) {
        var instance = new TodoList(), 
                defer = when.defer();

        instance.url = getUrlByModelType(type);
        instance.fetch({
            success: defer.resolve, 
            error: defer.reject
        });

        return defer.promise;
    }

    function getInstanceByModelType(type, models, options) {
        var klass = {"my": MyTodoList, "favorite": FavoriteTodoList}[type], 
            instance;

        if(klass) {
            instance = new klass(models || [], options || {});
            instance.modelType = type;
        }

        return instance;
    }

    function promiseFetchByModelType(type) {
        var instance = getInstanceByModelType(type), 
            defer = when.defer();

        instance.fetch({
            success: defer.resolve, 
            error: function(collection, resp, options) {
                defer.reject(resp);
            }
        });

        return defer.promise;
    }

    // 같은 모델을 내보드와 즐겨찾기에서 같이 사용하므로 Model 객체를 직접 노출하지 않는다.
	return {
        MyTodoList: MyTodoList, 
        FavoriteTodoList: FavoriteTodoList, 
        
        createForMyBoard: function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(MODEL_TYPE.my);
            return getInstanceByModelType.apply(undefined, args);
        }, 

        createForFavorite: function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(MODEL_TYPE.favorite);
            return getInstanceByModelType.apply(undefined, args);
        }, 

        getMyBoards: function() {
            return promiseFetchByModelType(MODEL_TYPE.my);
        }, 

        getFavoriteBoards: function() {
            return promiseFetchByModelType(MODEL_TYPE.favorite); 
        }, 

        fetchCollections: function() {
            var collections = {};
            return promiseFetchByModelType(MODEL_TYPE.my).then(function(collection) {
                collections[MODEL_TYPE.my] = collection;
                // @deprecated : 기존 호환
                collections.myTodoList = collection;
                return promiseFetchByModelType(MODEL_TYPE.favorite);
            }).then(function(collection) {
                collections[MODEL_TYPE.favorite] = collection;
                // @deprecated : 기존 호환
                collections.favoriteTodoList = collection;
                return collections;
            });
        }
    };
});