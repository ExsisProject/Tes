define('todo/models/todo', [
	'when', 
	"app", 
    "todo/models/base",
	"todo/models/todo_activities",
    "todo/models/todo_category",
    "todo/models/todo_label",
    "todo/libs/util",
    "libs/go-utils"
], 

function(
    when, 
    GO, 
    TodoBaseModel, 
    TodoActivities, 
    TodoCategoryModel, 
    TodoLabelModel, 
    TodoUtil, 
    CommonUtil
) {
	
	var TodoModel, 
		FLAG_Y = 'Y', 
		FLAG_N = 'N';
	
	TodoModel = TodoBaseModel.Model.extend({
        __items__: [], 

        defaults: {
            "publicFlag": FLAG_N
        }, 

        initialize: function(attr, options) {
            this.__items__ = [];
            TodoBaseModel.Model.prototype.initialize.apply(this, arguments);
        }, 

		urlRoot: function() {
			return GO.config('contextRoot') + 'api/todo';
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
		
		getActivities: function(page, pageSize) {
			var instance = TodoActivities.newForTodo(this, page, pageSize), 
                defer = when.defer();

            instance.fetch({
                success: defer.resolve, 
                fail: function(collection, resp, options) {
                    defer.reject(resp);
                }
            });

            return defer.promise;
		}, 

        getCategories: function() {
            return this.get("categories") || [];
        }, 

        getCategory: function(categoryId) {
            return _.findWhere(this.get("categories"), {"id": categoryId});
        }, 

        getLabels: function() {
            return this.get("labels") || [];
        }, 

        getLabel: function(labelId) {
            return _.findWhere(this.get("labels"), {"id": labelId});
        }, 

        // TODO: 테스트 코드 작성
        getMember: function(userId) {
            return _.findWhere(this.get('members') || [], {"id": userId});
        }, 
		
		addFavorite: function() {
            return changeFavoriteFlag.call(this, 'add');
		}, 

        removeFavorite: function() {
            return changeFavoriteFlag.call(this, 'remove');
        }, 

        addMember: function(users) {
            var defer = when.defer(), 
                url = [_.result(this, 'urlRoot'), this.id, 'members'].join('/'), 
                currentMembers = this.get('members'), 
                self = this;

            var alreadyMemberCount = 0;
            _.each(users, function(user) {
            	if (this.isMember(user.id)) alreadyMemberCount++;
            }, this);
            
            // 단수 추가일땐 validation. 복수 추가일땐 중복되는 사용자를 제외하고 그냥 요청 하자..
            if(users.length == 1 && alreadyMemberCount) {
                return when.reject(TodoUtil.createResponseError(400, 'Already Exists', ''));
            }
            
            var userIds = _.map(users, function(user) {
            	return user.id;
            });
            var memberIds = _.map(this.get("members"), function(member) {
            	return member.id;
            });
            var filtedIds = _.uniq(_.difference(userIds, memberIds));

            return TodoUtil.promiseAsync(url, {
        		type: 'POST',
        		data : JSON.stringify({ids : filtedIds})
    		}).then(function(userDatas) {
    			_.each(userDatas, function(userData) {
    				currentMembers.push(userData);
    				self.set('members', currentMembers);
    			});
    			self.trigger('change:members');
                return when.resolve(self);
            });
        },

        leaveMember: function(userId) {
            return removeMember.call(this, userId);
        }, 

        removeMember: function(userId) {
            if(!this.isOwner(GO.session("id"))) {
                return when.reject(TodoUtil.createResponseError(403, 'Not Authorized', ''));
            } 

            return removeMember.call(this, userId);
        }, 

        setPublic: function() {
            this.set("publicFlag", FLAG_Y);
        }, 

        setPrivate: function() {
            this.set("publicFlag", FLAG_N);
        }, 

        updateTitle: function(newTitle) {
            return promiseSaveForOnwer.call(this, {"title": CommonUtil.escapeString(newTitle)});
        },

        updatePublic: function() {
            return promiseSaveForOnwer.call(this, {"publicFlag": FLAG_Y});
        }, 

        updatePrivate: function() {
            return promiseSaveForOnwer.call(this, {"publicFlag": FLAG_N});
        },

        addCategory: function(title) {
            var self = this, 
                curCategories = this.getCategories();

            return TodoCategoryModel.createfromTodo(this, title).then(function(newCateModel) {
                curCategories.push(newCateModel.toJSON());
                self.set("categories", curCategories);
                return when.resolve(newCateModel);
            }, when.reject);
        }, 

        updateCategory: function(categoryId, attrs) {
            var curCategories = this.getCategories(),
                defer = when.defer(), 
                self = this;

            if(this.getCategory(categoryId)) {
                var targetCategory = new TodoCategoryModel(this.getCategory(categoryId));

                targetCategory.save(attrs, {
                    success: function(updatedCategory) {
                        var tcate = [];

                        _.each(curCategories, function(category) {
                            if(updatedCategory.id === category.id) {
                                tcate.push(updatedCategory.toJSON());
                            } else {
                                tcate.push(category);
                            }
                        });

                        self.set("categories", tcate);
                        defer.resolve(updatedCategory);
                    }, 
                    error: function(model, resp, options) {
                    	if(resp.responseJSON.code == 404 && resp.responseJSON.name == "todo.not.found.element") {
                            $.goSlideMessage(resp.responseJSON.message, 'caution');
                        }
                        defer.reject(resp);
                    }
                });
            } else {
                return when.reject(TodoUtil.createResponseError(404, 'Not Found', ''));
            }

            return defer.promise;
        }, 

        updateCategoryTitle: function(categoryId, newTitle) {
            return this.updateCategory(categoryId, {"title": CommonUtil.escapeString(newTitle)});
        }, 

        reorderCategories: function(categoryIds) {
            var url = getUrlForCategory.call(this, 'move'), 
                curCategoryIds = _.pluck(this.getCategories(), 'id'), 
                self = this;

            if(_.isEqual(curCategoryIds, categoryIds)) {
                return when.resolve(this);
            }

            return TodoUtil.reqReorderList(url, categoryIds)
                .then(function(updatedList) {
                    self.set('categories', updatedList);
                    return when.resolve(self);
                });
        }, 

        removeCategory: function(categoryId) {
            var categories = convertArrayToCollection(this.getCategories(), TodoCategoryModel),
                category = categories.get(categoryId), 
                defer = when.defer(), 
                self = this;

            category.destroy({
                success: function(model) {
                    categories.remove(categoryId);
                    self.set("categories", categories.toJSON());
                    defer.resolve(self);
                }, 
                error: function(model, resp, options) {
                    defer.reject(resp);
                }
            }); 

            return defer.promise;
        }, 

        // @deprecated
        updateLabel: function(labelId, attrs) {
            var labels = convertArrayToCollection(this.getLabels(), TodoLabelModel), 
                label = labels.get(labelId), 
                defer = when.defer(), 
                self = this;

            if(label) {
                label.save(attrs, {
                    success: function(updated) {
                        labels.set([updated]);
                        self.set("labels", labels.toJSON());
                        self.trigger('change:labels');
                        defer.resolve(updated);
                    }, 
                    error: function(model, resp, options) {
                    	if(resp.responseJSON.code == 404 && resp.responseJSON.name == "todo.not.found.element") {
                            $.goSlideMessage(resp.responseJSON.message, 'caution');
                        }
                        defer.reject(resp);
                    }
                });
            } else {
                return when.reject(TodoUtil.createResponseError(404, 'Not Found', ''));
            }

            return defer.promise;
        }, 

        // @deprecated
        updateLabelTitle: function(labelId, newTitle) {
            return this.updateLabel(labelId, {"title": CommonUtil.escapeString(newTitle)});
        }, 

        // TODO: 테스트코드 작성
        updateLabels: function(labelModels) {
            var url = [GO.config('contextRoot') + 'api/todo', this.id, 'label'].join('/'), 
                self = this;

            return TodoUtil.promiseAsync(url, {
                "type": 'PUT', 
                "data": labelModels
            }).then(function(labelList) {
                self.set('labels', labelList);
                self.trigger('change:labels');
                return when.resolve(self);
            });
        }, 

        updateOwner: function(userId) {
            var defer = when.defer();

            if(this.isMember(userId)) {
                this.save(null, {
                    url: getUrlForOwner.call(this, userId), 
                    success: defer.resolve, 
                    error: function(model, resp, options) {
                        defer.reject(resp);
                    }
                });
            } else {
                defer.reject(TodoUtil.createResponseError(400, "Bad Request", "Only member can be owner."));
            }

            return defer.promise;
        }, 

        getNextItemSeq: function(categoryId) {
            return _.where(this.__items__, {"todoCategoryId": categoryId}).length;
        }, 

        addItem: function(categoryId, title) {
            var self = this;

            return TodoItemModel.createfromTodo(this, categoryId, CommonUtil.escapeString(title)).then(function(newItemModel) {
                self.__items__.push(newItemModel.toJSON());
                return when.resolve(newItemModel);
            }, when.reject);
        }, 

        isFavorite: function() {
            return this.get('favoriteFlag') === FLAG_Y;
        }, 

        isArchived: function() {
            return this.get('deleteFlag') === FLAG_Y;
        }, 

        isPublic: function() {
            return this.get('publicFlag') === FLAG_Y;
        }, 

        isPrivate: function() {
            return this.get('publicFlag') === FLAG_N;
        }, 

        isOwner: function(userId) {
            return this.get("owner").id === userId;
        }, 

        isMember: function(userId) {
            return _.where(this.get('members') || [], {"id": userId}).length > 0;
        }
	}, {
        newBoard: function(title, publicFlag) {
            return new TodoModel({"title": CommonUtil.escapeString(title), "publicFlag": publicFlag || FLAG_N});
        }, 

		createBoard: function(title, publicFlag) {
			var todo = this.newBoard(title, publicFlag);
            return promiseSave.call(todo);
		}, 
		
		getBoard: function(todoId) {
			var defer = when.defer(), 
				todo = new TodoModel({"id": todoId});
			
			todo.fetch({
				success: defer.resolve, 
				error: function(model, err, options) {
                    defer.reject(err);
                }
			}); 
			
			return defer.promise;
		}
	});

    function convertArrayToCollection(attrs, model) {
        return TodoUtil.convertArrayToCollection(attrs, model);
    }

    function getUrlForCategory(postfix) {
        if(postfix && postfix[0] === '/') {
            postfix = postfix.slice(1);
        }

        return [_.result(this, 'urlRoot'), this.id, 'category', postfix].join('/');
    }

    function getUrlForOwner(postfix) {
        if(postfix && postfix[0] === '/') {
            postfix = postfix.slice(1);
        }

        return [_.result(this, 'urlRoot'), this.id, 'owner', postfix].join('/');
    }

    function promiseSave(attrs) {
        var defer = when.defer();

        this.save(attrs, {
            success: defer.resolve, 
            error: function() {
                defer.reject(TodoUtil.createResponseError(500, 'Internal Server Error', ''));
            }
        });

        return defer.promise;
    }

    function promiseSaveForOnwer(attrs) {
        var defer = when.defer(); 

        if(!this.isNew() && !this.isOwner(GO.session("id"))) {
            return when.reject(TodoUtil.createResponseError(404, 'Not Found', ''));
        }

        return promiseSave.call(this, attrs);
    }

    function removeMember(userId) {
        var defer = when.defer(), 
            oldMembers = this.get('members'), 
            self = this;

        if(this.isOwner(userId)) {
            return when.reject("owner of board can't leave");
        }

        if(this.isMember(userId)) {
            this.save(null, {
                type: "DELETE", 
                url: [_.result(this, 'urlRoot'), this.id, 'member', userId].join('/'), 
                success: function(todoModel) {
                    self.set('members', _.filter(oldMembers, function(member) {
                        return member.id !== userId;
                    }));
//                    self.trigger('change:members');
                    defer.resolve(self);
                }, 
                error: function() {
                    defer.reject(TodoUtil.createResponseError(500, "Internal Server Error"));
                }
            });
        } else {
            defer.reject(TodoUtil.createResponseError(404, "Not Found", ''));
        }

        return defer.promise;
    }

    function changeFavoriteFlag(type) {
        var self = this,
            defer = when.defer(), 
            checkFlag = {"add": FLAG_Y, "remove": FLAG_N}[type];

        if(checkFlag) {
            this.save({}, {
                url: [_.result(this, 'urlRoot'), this.id, 'favorite', type].join('/'), 
                success: function(model) {
                    self.set("favoriteFlag", checkFlag);
                    defer.resolve.apply(defer, arguments);
                }, 
                error: function(model, resp, options) {
                	if(resp.responseJSON.code == 404 && resp.responseJSON.name == "todo.not.found.element") {
                        $.goSlideMessage(resp.responseJSON.message, 'caution');
                    }
                    defer.reject(resp);
                }
            });
        } else {
            defer.reject(TodoUtil.createResponseError(400, "Parse Error", ''));
        }

        return defer.promise;
    }
	
	return TodoModel;
	
});