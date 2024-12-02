define("todo/libs/util", [
    "backbone",
    "when",
    "moment",
    "i18n!todo/nls/todo"
],

function(
    Backbone,
    when,
    moment,
    TodoLang
) {

    var TodoUtil;

    TodoUtil = {
        createResponseError: function(status, statusText, responseText) {
            return {
                "status": status,
                "statusText": statusText,
                "responseText": responseText || ''
            };
        },

        promiseAsync: function(url, options) {
            var topts = options || {};

            var defer = when.defer(),
                self = this,
                defaultOpts = {
                    type: "GET",
                    dataType: 'json',
                    contentType: "application/json",
                    success: function(resp) {
                        if(resp.hasOwnProperty('__go_checksum__')) {
                            defer.resolve(resp.data);
                        } else {
                        	if(resp.code == 404 && resp.name == "todo.not.found.element") {
                                $.goSlideMessage(resp.message, 'caution');
                            }
                            defer.reject(self.createResponseError(500, "Internal Server Error"));
                        }
                    },
                    error: function(xhr, statusText, error) {
                    	if(xhr.responseJSON.code == 404 && xhr.responseJSON.name == "todo.not.found.element") {
                            $.goSlideMessage(xhr.responseJSON.message, 'caution');
                        }
                        defer.reject(error);
                    }
                };

            if(topts.hasOwnProperty("data") && _.isObject(topts.data)) {
                topts.data = JSON.stringify(topts.data);
            }

            $.ajax(url, _.extend({}, defaultOpts, topts));

            return defer.promise;
        },

        promiseModelSave: function(model, attrs) {
            var defer = when.defer();

            model.save(attrs, {
                success: defer.resolve,
                error: function(model, resp, options) {
                    defer.reject(resp);
                    if(resp.responseJSON.code == 404 && resp.responseJSON.name == "todo.not.found.element") {
                        $.goSlideMessage(resp.responseJSON.message, 'caution');
                    }
                }
            });

            return defer.promise;
        },

        promiseFetch: function(obj, options) {
            var defer = when.defer();

            if(obj instanceof Backbone.Model || obj instanceof Backbone.Collection) {
                obj.fetch(_.extend({
                    success: defer.resolve,
                    error: function(model, resp, options) {
                        defer.reject(resp);
                    }
                }, options || {}));
            } else {
                defer.reject(this.createResponseError(400, "Bad Request"));
            }

            return defer.promise;
        },

        reqReorderList: function(url, ids) {
            return this.promiseAsync(url, {
                type: 'PUT',
                data: {"ids": ids}
            });
        },

        convertArrayToCollection: function(attrs, model) {
            var options;
            if(model) {
                options = {model: model};
            }

            return new Backbone.Collection(attrs, options);
        },

        reorderList: function(orderableList, oldSeq, newSeq) {
            // 차이가 양수이면 up, 음수이면 down
            var direction = oldSeq - newSeq,
                result = [];

            _.each(orderableList, function(item, i) {
                var curSeq = 0;

                if(!item.hasOwnProperty('seq')) {
                    return new Error('seq 속성을 가지고 있어야 합니다.');
                }

                curSeq = item.seq;

                if(item.seq === oldSeq) {
                    item.seq = newSeq;
                } else if(direction > 0 && newSeq <= curSeq && curSeq < oldSeq) {
                    item.seq = ++curSeq;
                } else if(direction < 0 && oldSeq <= curSeq && curSeq < newSeq) {
                    item.seq = --curSeq;
                }

                result.push(item);
            });

            return _.sortBy(result, function(item) {
                return item.seq;
            });
        },

        deepClone: function(obj) {
            return $.extend(true, {}, obj);
        },

        toStreamDate: function(datestr) {
            var cloned = '' + datestr,
                output;

            mDate = moment(cloned);

            if(mDate.isBefore(moment().startOf('y'))) {
                output = mDate.format('YYYY-MM-DD(dd) HH:mm');
            } else if(mDate.isBefore(moment().subtract('hour', 12))) {
                output = mDate.format('MM-DD(dd) HH:mm');
            } else if(mDate.isAfter(moment().subtract('second', 60)) || mDate.isAfter(new Date())){
            	output = TodoLang["방금 전"];
            } else {
                output = mDate.fromNow();
            }

            return output;
        },

        callActionForMember: function(todoModel, event, bodyFunc) {
            if(!todoModel.isMember(GO.session('id'))) {
                return false;
            }

            return bodyFunc.call(this, event);
        },

        callActionForOwner: function(todoModel, event, bodyFunc) {
            if(!todoModel.isOwner(GO.session('id'))) {
                return false;
            }

            return bodyFunc.call(this, event);
        },

        searchCardSeq: function($cards, targetId) {
            var result = 0;

            $cards.each(function(curSeq, cardEl) {
                if($(cardEl).data('itemid') === targetId) {
                    result = curSeq;
                    return;
                }
            });

            return result;
        },

        syncCardSeqs: function($cards) {
            $cards.each(function(curSeq, cardEl) {
                var curCardView = $(cardEl).data('view');
                curCardView.setSequence(curSeq);
            });
        },

        parseDuedate: function(dueDate) {
            var dueDate = moment(dueDate),
                output;

            if(dueDate.isSame(new Date, 'y')) {
                output = dueDate.format(TodoLang["기한일시 포맷"]);
            } else {
                output = dueDate.format(TodoLang["기한년월일시 포맷"]);
            }

            return output;
        }
    }

    return TodoUtil;
});
