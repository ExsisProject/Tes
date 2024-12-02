define("todo/views/extensions/burnup_chart/column_store", [
    "app",
    "libs/go-utils"
],

function(
    GO,
    CommonUtil
) {
    var StoreUtil = CommonUtil.store,
        STORE_KEY = 'go.todo.burnup.selectedcols.' + GO.session('id');

    function Klass() {
    }

    Klass.prototype.get = function(todoId) {
        var storeData = getStoredColumns();
        return storeData[todoId] || [];
    };

    Klass.prototype.set = function(todoId, ids) {
        var storedData = getStoredColumns();
        storedData[todoId] = _.isArray(ids) ? ids : [ids];
        StoreUtil.set(STORE_KEY, storedData);
    };

    Klass.prototype.add = function(todoId, id/*...*/) {
        var ids = [].slice.call(arguments, 1);

        if(ids.length < 1) {
            return;
        }

        this.set(todoId, _.union(this.get(todoId), ids));
    };

    Klass.prototype.remove = function(todoId, id/*...*/) {
        var ids = [].slice.call(arguments, 1);

        if(ids.length < 1) {
            return;
        }

        this.set(todoId, _.difference(this.get(todoId), ids));
    };

    Klass.prototype.hasTodoId = function(todoId) {
        return _.has(getStoredColumns(), todoId);
    };

    function getStoredColumns() {
        return StoreUtil.get(STORE_KEY) || {};
    }

    return new Klass();
});
