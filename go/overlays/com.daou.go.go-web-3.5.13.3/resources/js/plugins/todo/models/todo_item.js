define("todo/models/todo_item", [
    "when",
    "moment",
    "app",
    "todo/models/base",
    "todo/models/todo_checklist",
    "todo/models/todo_activities",
    "todo/libs/util",
    "libs/go-utils"
],

function(
    when,
    moment,
    GO,
    TodoBaseModel,
    TodoChecklistModel,
    TodoActivityList,
    TodoUtil,
    CommonUtil
) {

    var TodoItemModel,
        MAX_TITLE_LENGTH = 1000;

    TodoItemModel = TodoBaseModel.Model.extend({
        todoModel: null,
        activities: null,

        defaults: {
            "seq": 0,
            "deleteFlag": 'N'
        },

        initialize: function(attrs, options) {
            options = options || {};

            TodoBaseModel.Model.prototype.initialize.apply(this, arguments);
            this.activities = TodoActivityList.newForTodoItem(this);

            if(options.todoModel) {
                this.todoModel = options.todoModel;
                this.listenTo(this.todoModel, 'change:labels', this._syncLabels);
            }
        },

        validate: function(attrs, options) {
            if(attrs.title && attrs.title.length > MAX_TITLE_LENGTH) {
                return TodoUtil.createResponseError(400, "Bad Request", "Invalid Title");
            }
        },

        urlRoot: function() {
            return GO.config('contextRoot') + 'api/todo/' + this.get('todoId') + '/item';
        },

        updateAttributes: function(attrs, url) {
        	var self = this;
            var defer = when.defer(),
                opt = {
                    success: defer.resolve,
                    error: function(model, resp, options) {
                    	if(resp.responseJSON.name == "DuplicateRequestException"){
                    		var errorMessage = resp.responseJSON.message.split(".");
                    		$.goAlert(errorMessage[0], errorMessage[1], function() {
                    			GO.router.navigate('todo/' + self.todoModel.get('id'), {"trigger": true, "pushState": true});
    						});
                    	}
                    	if(resp.responseJSON.code == 404 && resp.responseJSON.name == "todo.not.found.element"){
                            $.goSlideMessage(resp.responseJSON.message, 'caution');
                    	}
                        defer.reject(resp);
                    }
                },
                self = this;

            if(url) {
                opt.url = url;
            }

            this.save(attrs, opt);
            return defer.promise;
        },

        move: function(categoryId, seq) {
            var reqUrl = [_.result(this, 'urlRoot'), this.id, 'move'].join('/'),
                self = this;

            if(this.get('todoCategoryId') === parseInt(categoryId) && this.get('seq') === parseInt(seq)) {
                return when.resolve(this);
            }

            return this.updateAttributes({"todoCategoryId": categoryId, "seq": seq}, reqUrl).then(function(updated) {
                self.todoModel.trigger('reorder:item');
                return when.resolve(updated)
            });
        },

        updateTitle: function(title) {
            return this.updateAttributes({"title": title});
        },

        updateContent: function(desc) {
            return this.updateAttributes({"content": desc});
        },

        updateDueDate: function(dueDate) {
            return this.updateAttributes({"dueDate": GO.util.toISO8601(dueDate)}, [_.result(this, 'urlRoot'), this.id, 'duedate'].join('/'));
        },

        // TODO: 테스트코드 추가
        removeDueDate: function() {
            return this.updateAttributes({"dueDate": null}, [_.result(this, 'urlRoot'), this.id, 'duedate'].join('/'));
        },

        remove: function() {
            var defer = when.defer();
            var self = this;
            this.destroy({
                // categoryId 정보 때문에 보내야 한다.
                data: JSON.stringify(this.toJSON()),
                dataType: 'json',
                contentType: "application/json",
                success: defer.resolve,
                error: function(model, resp, options) {
                	if(resp.responseJSON.name == "DuplicateRequestException"){
                		var errorMessage = resp.responseJSON.message.split(".");
                		$.goAlert(errorMessage[0], errorMessage[1], function() {
                			GO.router.navigate('todo/' + self.todoModel.get('id'), {"trigger": true, "pushState": true});
						});
                	}
                    defer.reject(resp);
                }
            });

            return defer.promise;
        },

        addLabel: function(labelId) {
            var curLabels = this.get('labels') || [],
                self = this;

            if(this.hasLabel(labelId)) {
                // 단순 리턴한다.
                return when.resolve(this);
            }

            return TodoUtil.promiseAsync(getUrlForLabel.call(this, labelId), {
                type: 'POST'
            }).then(function(respData) {
                curLabels.push(respData);
                self.set('labels', curLabels);
                self.trigger('change:labels', self);
                return when.resolve(self);
            });
        },

        removeLabel: function(labelId) {
            var curLabels = this.get('labels') || [],
                self = this;

            if(!this.hasLabel(labelId)) {
                return when.reject(TodoUtil.createResponseError(404, "Not Found"));
            }

            return TodoUtil.promiseAsync(getUrlForLabel.call(this, labelId), {
                type: 'DELETE'
            }).then(function(respData) {
                // _.reject 오류 있다. 필터링이 안됨.(lodash 오류일수도...);
                var filteredList = _.reject(curLabels, function(label) {
                    return (label.id === labelId);
                });
                self.set('labels', filteredList);
                return when.resolve(self);
            });
        },

        addMember: function(userId) {
            var curMembers = this.getMembers(),
                self = this;

            if(this.hasMember(userId)) {
                // 단순 리턴한다.
                return when.resolve(this);
            }

            return TodoUtil.promiseAsync(getUrlForMember.call(this, userId), {
                type: 'POST'
            }).then(function(respData) {
                curMembers.push(respData);
                self.set('members', curMembers);
                self.trigger('change:members', self);
                return when.resolve(self);
            });
        },

        removeMember: function(userId) {
            var curMembers = this.getMembers(),
                self = this;

            return TodoUtil.promiseAsync(getUrlForMember.call(this, userId), {
                type: 'DELETE'
            }).then(function(respData) {
                var filteredList = _.reject(curMembers, function(member) {
                    return (member.id === userId);
                });
                self.set('members', filteredList);
                self.trigger('change:members', self);
                return when.resolve(self);
            });
        },

        hasLabel: function(labelId) {
            return _.where(this.get('labels') || [], {"id": labelId}).length > 0;
        },

        // TODO: 테스트코드 작성
        hasLabels: function() {
            return (this.get('labels') || []).length > 0;
        },

        getMembers: function() {
            return this.get('members') || [];
        },

        hasMember: function(userId) {
            return _.where(this.getMembers(), {"id": userId}).length > 0;
        },

        // TODO: 테스트코드 작성
        hasMembers: function() {
            return this.getMembers().length > 0;
        },

        // TODO: 테스트코드 작성
        getFiles: function() {
            return this.get('attaches') || [];
        },

        hasFile: function(attachId) {
            return _.where(this.getFiles(), {"id": attachId}).length > 0;
        },

        // TODO: 테스트코드 작성
        hasFiles: function() {
            return this.getFileCount() > 0;
        },

        // TODO: 테스트코드 작성
        hasDuedate: function() {
        	return !!this.get('dueDate');
        },

        // TODO: 테스트코드 작성
        getFileCount: function() {
            return this.getFiles().length;
        },

        // TODO: 테스트코드 작성
        getFile: function(attachId) {
            return _.findWhere(this.getFiles(), {"id": attachId});
        },

        // TODO: 테스트코드 작성
        getImages: function() {
            return _.filter(this.getFiles(), function(attach) {
                return CommonUtil.isImage(attach.name);
            });
        },

        // TODO: 테스트코드 작성
        getFeatureImage: function() {
            return _.last(this.getImages());
        },

        // TODO: 테스트코드 작성
        hasImages: function() {
            return this.getImages().length > 0;
        },

        // TODO: 테스트코드 작성
        hasComments: function() {
            return this.get("commentCount") > 0;
        },

        getCommentCount : function() {
        	return this.get("commentCount");
        },

        hasChecklists: function() {
            return this.getChecklists().length > 0;
        },

        // TODO: 테스트 코드 작성
        isDelayed: function() {
            var dueDate = this.get('dueDate'),
                baseDate = moment().
                result = false;

            if(dueDate) {
                result = moment(dueDate).isBefore(moment().startOf('m'));
            }

            return result;
        },

        getChecklists: function() {
            return this.get('checklists') || [];
        },

        getChecklistItemCount: function() {
            var checklists = this.getChecklists(),
                result = 0;

            _.each(checklists, function(checklist) {
                result += checklist.checklistItems.length;
            });

            return result;
        },

        getChecklistCheckedItemCount: function() {
            var checklists = TodoUtil.convertArrayToCollection(this.getChecklists(), TodoChecklistModel),
                result = 0;

            checklists.each(function(checklist) {
                result += checklist.getCheckedItemCount();
            });

            return result;
        },

        getChecklist: function(checklistId) {
            return _.findWhere(this.get('checklists'), {"id": checklistId});
        },

        // TODO: 테스트 코드 작성
        getChecklistItem: function(checklistId, checklistItemId) {
            var checklist = this.getChecklist(checklistId);
            return _.findWhere(checklist.checklistItems || [], {"id": checklistItemId});
        },

        getNextChecklistSeq: function() {
        	if(this.getChecklists().length == 0) {
        		return 0;
        	} else {
        		return this.getChecklists().last().seq + 1;
        	}
        },

        createChecklist: function(title) {
            var self = this,
                checklists = this.getChecklists();

            return TodoChecklistModel.createFromTodoItem(this, title).then(function(newChecklistModel) {
                checklists.push(newChecklistModel.toJSON());
                self.set('checklists', checklists);
                self.trigger('change:checklists');
                return when.resolve(newChecklistModel);
            }, when.reject);
        },

        updateChecklistTitle: function(checklistId, newTitle) {
            var checklist = getChecklistModel.call(this, checklistId),
                self = this;

            return checklist.updateTitle(newTitle).then(function(updated) {
                updateChecklists.call(self, updated);
                return when.resolve(updated);
            }, when.reject);
        },

        removeChecklist: function(checklistId) {
            var checklists = TodoUtil.convertArrayToCollection(this.getChecklists(), TodoChecklistModel),
                checklist = getChecklistModel.call(this, checklistId),
                self = this;

            return checklist.remove().then(function() {
                checklists.remove(checklist);
                self.set('checklists', checklists.toJSON());
                self.trigger('change:checklists');
                return when.resolve();
            }, when.reject);
        },

        addChecklistItem: function(checklistId, title) {
            var checklist = getChecklistModel.call(this, checklistId),
                self = this;

            return checklist.createItem(title).then(function(newItemModel) {
                updateChecklists.call(self, checklist);
                return when.resolve(newItemModel);
            }, when.reject);
        },

        updateChecklistItemTitle: function(checklistId, checklistItemId, title) {
            var checklist = getChecklistModel.call(this, checklistId),
                self = this;

            return checklist.updateItemTitle(checklistItemId, title).then(function(checklistModel) {
                updateChecklists.call(self, checklistModel);
                return when.resolve(checklistModel);
            }, when.reject);
        },

        // TODO: 테스트 케이스 추가
        toggleChecklistItem: function(checklistId, checklistItemId) {
            var checklist = getChecklistModel.call(this, checklistId),
                self = this;

            return checklist.toggleItem(checklistItemId).then(function(checklistModel) {
                updateChecklists.call(self, checklistModel);
                return when.resolve(checklistModel);
            }, when.reject);
        },

        removeChecklistItem: function(checklistId, checklistItemId) {
            var checklist = getChecklistModel.call(this, checklistId),
                self = this;

            return checklist.removeItem(checklistItemId).then(function() {
                updateChecklists.call(self, checklist);
                return when.resolve();
            }, when.reject);
        },

        moveChecklistItem: function(checklistId, itemId, newChecklistId, newSeq) {
            var checklist = getChecklistModel.call(this, checklistId),
                self = this;

            // TODO: 좀 더 단순하게 리팩토링....
            return checklist.moveItem(itemId, newChecklistId, newSeq).then(function(newChecklistItems) {
                var newChecklist = getChecklistModel.call(self, newChecklistId);
                // 기존 checklist에서는 지운다.
                checklist.set('checklistItems', _.reject(checklist.getChecklistItems(), function(checklistItem) {
                    return checklistItem.id === itemId;
                }));
                updateChecklists.call(self, checklist, false);

                // 새로운 위치에 갱신한다.
                newChecklist.set('checklistItems', newChecklistItems);
                updateChecklists.call(self, newChecklist);

                return when.resolve(self);
            }, when.reject);
        },

        addFile: function(attachData) {
            var current = this.get('attaches') || [];
            current.push(attachData);
            this.set('attaches', current);
            this.trigger('change:attaches');

            return this;
        },

        updateFile: function(attachModel) {
            var url = [_.result(this, 'urlRoot'), this.id, 'files'].join('/'),
                self = this;

            return TodoUtil.promiseAsync(url, {
                type: 'POST',
                data: attachModel
            }).then(function(attachData) {
                self.addFile(attachData);

                return when.resolve(self);
            }, when.reject);
        },

        removeFile: function(attachId) {
            var url = [_.result(this, 'urlRoot'), this.id, 'file', attachId].join('/'),
                currentFiles = this.get('attaches') || [],
                self = this;

            if(!this.hasFile(attachId)) {
                return when.reject(TodoUtil.createResponseError(404, "Not Found"));
            }

            return TodoUtil.promiseAsync(url, {type: 'DELETE'}).then(function() {
                var filteredList = _.filter(currentFiles, function(attachData) {
                    return attachData.id !== attachId;
                });
                self.set('attaches', filteredList);
                self.trigger('change:attaches');

                return when.resolve(self);
            }, when.reject);
        },

        _syncLabels: function() {
            var labels = [];

            _.each(this.get("labels"), function(item) {
                var label = _.findWhere(this.todoModel.get("labels"), { "id" : item.id });
                labels.push(label);
            }, this);

            this.set("labels", labels);
        },

        hasContent: function() {
            var content = this.get('content');
            return !!content && content.length > 0;
        }
    }, {
        newFromTodo: function(todoModel, attrs) {
            var instance;

            instance = new TodoItemModel(_.extend(attrs, {
                "todoId": todoModel.id
            }), {
                "todoModel": todoModel
            });

            return instance;
        },

        createFromTodo: function(todoModel, categoryId, title) {
            var defer = when.defer(),
                instance;

            instance = this.newFromTodo(todoModel, {
                "todoCategoryId": categoryId,
                "title": title
            });
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

    function getUrlForLabel(labelId) {
        return [_.result(this, 'urlRoot'), this.id , 'label',labelId].join('/');
    }

    function getUrlForMember(userId) {
        return [_.result(this, 'urlRoot'), this.id , 'member', userId].join('/');
    }

    function getChecklistModel(checklistId) {
        return TodoChecklistModel.newFromTodoItem(this, this.getChecklist(checklistId));
    }

    function updateChecklists(updated, isTrigger) {
        var result = [];

        if(typeof isTrigger === 'undefined') {
            isTrigger = true;
        }

        _.each(this.getChecklists(), function(checklist) {
            result.push(checklist.id === updated.id ? updated.toJSON() : checklist);
        });

        this.set('checklists', result);

        if(isTrigger) {
            this.trigger('change:checklists');
        }

        return result;
    }

    function updateChecklistItems(checklistItemModel) {
        var checklists = this.getChecklists(),
            updatedId = checklistItemModel.id;

        // 먼저 지우고...
        _.map(checklists, function(checklist) {
            checklist.checklistItems = _.reject(checklist.checklistItems, function(checklistItem) {
                return checklistItem.id === updatedId;
            });
        });

        // 다시 갱신..
        _.map(checklists, function(checklist) {
            if(checklist.id === checklistItemModel.checklistId) {
                var checklistItems = checklist.checklistItems;

                _.map(checklistItems, function(checklistItem, seq) {
                    if(checklistItem.seq >= checklistItemModel.seq) {
                        ++checklistItem.seq;
                    }
                });
                checklistItems.push(checklistItemModel);
                checklistItems = _.sortBy(checklistItems, function(checklistItem) {
                    return checklistItem.seq;
                });
            }
        });

        this.set('checklists', checklists);
        this.trigger('change:checklists');

        return checklists;
    }

    return TodoItemModel;

});
