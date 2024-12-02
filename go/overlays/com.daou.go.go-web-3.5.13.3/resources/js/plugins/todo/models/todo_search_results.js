define("todo/models/todo_search_results", [
    "when",
    "app",
    "todo/models/base",
    "todo/libs/util"
], function(
    when,
    GO,
    TodoBaseModel,
    TodoUtil
) {
    var TodoSearchResultList;

    TodoSearchResultList = TodoBaseModel.Collection.extend({
        url: function() {
            return GO.config('contextRoot') + 'api/search/todo?' + GO.util.jsonToQueryString(this.filterCondition || {});
        },

        filterCondition: {},

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
            var defer = when.defer();

            this.setFilter(condition);
            return TodoUtil.promiseFetch(this);
        },
    });

    return TodoSearchResultList;
});
