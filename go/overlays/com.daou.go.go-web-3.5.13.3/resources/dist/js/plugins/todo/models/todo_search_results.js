define("todo/models/todo_search_results",["when","app","todo/models/base","todo/libs/util"],function(e,t,n,r){var i;return i=n.Collection.extend({url:function(){return t.config("contextRoot")+"api/search/todo?"+t.util.jsonToQueryString(this.filterCondition||{})},filterCondition:{},initialize:function(e,t){n.Collection.prototype.initialize.apply(this,arguments),this.filterCondition={}},setFilter:function(e){var t=[].slice.call(arguments);return _.isString(e)?this.filterCondition[e]=t[1]:_.isObject(e)&&_.extend(this.filterCondition,e),this},getFilteredList:function(t){var n=e.defer();return this.setFilter(t),r.promiseFetch(this)}}),i});