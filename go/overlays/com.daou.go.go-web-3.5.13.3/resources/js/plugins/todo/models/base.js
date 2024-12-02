define("todo/models/base", [
    "backbone",
    "moment",
    "app",
    "libs/go-utils"
],

function(Backbone, moment, GO, CommonUtil) {

    var TodoBaseModel,
        TodoBaseCollection,
        STORE_KEY = GO.session('id') + '-todo-lastupdated';

    function saveLastUpdated() {
        CommonUtil.store.set(STORE_KEY, GO.util.toISO8601(new Date()), {"type": 'session'});
    }

    function overrideFetchOptions(options) {
        options = options || {};

        if(options.success) {
            var callback = options.success;
            options.success = function(model) {
                saveLastUpdated();
                callback.apply(this, arguments);
            };
        }

        return options;
    }

    TodoBaseModel = Backbone.Model.extend({
        lockFlag: false,

        //@Override
        fetch: function(options) {
            return Backbone.Model.prototype.fetch.call(this, overrideFetchOptions(options));
        },

        save: function() {
            var args = [].slice.call(arguments),
                options = args.length > 1 ? args[1] : {},
                ajaxBeforeSend, ajaxComplete;

            if(TodoBaseModel.__lockFlag__) {
                this.trigger('locking');
                return;
            }

            ajaxBeforeSend = options.hasOwnProperty('beforeSend') ? options.beforeSend : function() {};
            ajaxComplete = options.hasOwnProperty('complete') ? options.complete : function() {};

            options.beforeSend = function() {
                ajaxBeforeSend.apply(undefined, arguments);
                TodoBaseModel.__lockFlag__ = true;
            };

            options.complete = function() {
                ajaxComplete.apply(undefined, arguments);
                TodoBaseModel.__lockFlag__ = false;
            }

            return Backbone.Model.prototype.save.call(this, args[0], options);
        }
    }, {
        __lockFlag__ : false
    });

    TodoBaseCollection = Backbone.Collection.extend({
        //@Override
        fetch: function(options) {
            return Backbone.Collection.prototype.fetch.call(this, overrideFetchOptions(options));
        },

        // set이 의도대로 잘 update가 되지 않아 별도의 함수로 만듬
        updateModel: function(updatedModel) {
            _.map(this.models, function(model) {
                if(model.id === updatedModel.id) {
                    model = updatedModel;
                }
            });

            return this;
        }
    });

    return {
        Model: TodoBaseModel,
        Collection: TodoBaseCollection
    };

});
