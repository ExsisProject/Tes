define("todo/views/site/todo_column", [
    "backbone",
    "app",
    
    "todo/constants",
    "todo/models/todo_item",
    "todo/views/site/todo_card",
    "todo/views/menus/main",
    "todo/views/site/edit_text_form",
    
    "hgn!todo/templates/todo_column",
    
    "todo/libs/util",
    
    "i18n!nls/commons",
    "i18n!todo/nls/todo",

    "jquery.go-validation",
    "jquery.go-popup"
],

function(
    Backbone,
    GO,
    
    Constants,
    TodoItemModel,
    TodoCardView,
    TodoMenus,
    EditTextFormView,
    
    renderTodoColumn, 
    
    TodoUtil,
    
    CommonLang,
    TodoLang
) {

    var TodoColumnView,
        AddCardFormView,
        EditColumnTitleFormView,
        SELECTORS = Constants.SELECTORS;

    AddCardFormView = EditTextFormView.extend({
        todoModel: null,
        categoryModel: null,

        initialize: function(options) {
            this.todoModel = options.todoModel;
            this.categoryModel = options.categoryModel;
            this.name = 'add-card-form-' + this.todoModel.id;

            EditTextFormView.prototype.initialize.call(this, options);
        },

        _confirm: function(e) {
            var self = this,
                title = this.getValue(),
                categoryId = this.categoryModel.id;
            if(!$.goValidation.isCheckLength(1, 1000, title)){
                $.goMessage( GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."],{arg1 : 1, arg2 : 1000}));
                this.$el.find('textarea').focus();
                return false;
            }

            e.preventDefault();
            TodoItemModel.createFromTodo(this.todoModel, categoryId, title).then(function(newItemModel) {
                self.confirm(newItemModel);
            });
        }
    });

    EditColumnTitleFormView = EditTextFormView.extend({
        todoModel: null,
        categoryModel: null,

        initialize: function(options) {
            this.todoModel = options.todoModel;
            this.categoryModel = options.categoryModel;
            this.name = 'edit-column-title-form-' + this.todoModel.id;

            EditTextFormView.prototype.initialize.call(this, options);
        },

        _confirm: function(e) {
            var self = this,
                title = this.getValue(),
                categoryId = this.categoryModel.id;

            if(!$.goValidation.isCheckLength(1, 1000, title)){
                $.goMessage( GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."],{arg1 : 1, arg2 : 1000}));
                $('textarea[name=content]').focus();
                return false;
            }

            e.preventDefault();

            this.todoModel.updateCategoryTitle(categoryId, title).then(function(updatedModel) {
                self.confirm(updatedModel);
            });
        }
    });

    // this.model = todoCategoryModel
    TodoColumnView = Backbone.View.extend({
        className: 'ui-todocolumn ui-column-container board_column_wrap',

        template: renderTodoColumn,
        subViews: [],

        events: {
            "click .btn-add-card": '_callAddCardForm',
            "click .btn-action-menu": '_callActionMenu',
            "click .ui-column-title": '_callEditTitleForm'
        },

        initialize: function(options) {
            options = options || {};

            this.subViews = [];

            this.todoModel = options.todoModel;
            this.todoItemList = options.todoItemList;
            this.columnWidth = options.columnWidth;

            this.$el.addClass('ui-todocolumn-' + this.model.id);
            this.$el.attr('data-categoryid', this.model.id);
            this.$el.data('view', this);

            this.render();

            this.listenTo(this.todoModel, 'change:categories', syncModelFromTodoModel, this);
            GO.EventEmitter.on('todo', 'resize:column', this.resize, this);
        },

        remove: function() {
            _.each(this.subViews, function(subview) {
                subview.remove();
            });

            Backbone.View.prototype.remove.apply(this, arguments);
        },

        render: function() {
            this.$el.empty().append(this.template({
                "category": this.model.toJSON(),
                "title": GO.util.unescapeHtml(this.model.get('title')), 
                "editable?": this.todoModel.isMember(GO.session('id')),
                "label": {
                    "add_card": TodoLang["카드 추가"]
                }
            }));

            if(this.columnWidth) {
                this.$el.width(this.columnWidth);
            }

            renderCardViews.call(this);
        },

        resize: function() {

            var height = $(SELECTORS.detail.boardContent).height(),
                headerHeight = this.$el.find('header').outerHeight(),
                formHeight = this.$el.find(".create_form").outerHeight(),
                cardContainerHeight = this.$el.find(SELECTORS.detail.cardContainer).outerHeight(),
                addBtnHeight = this.$el.find(SELECTORS.detail.addCardButton).outerHeight(),
                // 각 마진 값들을 감안한 보정값
                extraHeight = 50,
                temp = headerHeight + cardContainerHeight + addBtnHeight + extraHeight + formHeight,
                $scrollContainer = this.$el.find(SELECTORS.common.scrollContainer);

            // [GO-16331] 협업> ToDO+> 보드> 칼럼을 추가했다가 삭제한 후 남아있는 칼럼에 카드를 추가하면 카드 UI가 깨지는 현상
            // 고스트뷰이면 실행하지 않는다.
            if(!this.$el.parents("body").length) {
            	return;
            }
            
            // 높이가 0이면 display:none 상태이므로 갱신하지 않는다.
            if(cardContainerHeight <= 0) {
                return;
            }

            if(temp < height) {
                $scrollContainer.height(cardContainerHeight);
            } else {
                $scrollContainer.height(height - headerHeight - addBtnHeight - extraHeight - formHeight);
            }

            toggleNoCardMsg.call(this);
            updateCardCount.call(this);
        },

        reorder: function(newSeq) {
            this.model.set('seq', newSeq);
        },
        
        /**
         * subViews에 들어있는 뷰 캐시에서 꺼낸다.
         */
        takeOutCardView: function(cardView) {
        	this.subViews = _.reject(this.subViews, function(subView, i) {
        		return cardView.getItemId() === subView.getItemId();
        	});
        }, 

        _callAddCardForm: function(e) {
            var $target = $(e.currentTarget),
                $parent = $target.parent(),
                $scrollContainer = this.$el.find(SELECTORS.common.scrollContainer), 
                self = this,
                addCardView;

            e.preventDefault();
            callActionForMember.call(this, this.todoModel, e, function(e) {
                addCardView = new AddCardFormView({
                    todoModel: self.todoModel,
                    categoryModel: self.model,
                    afterConfirm: function(newItemModel) {
                        removeNoCardMsg.call(self);
                        self.todoItemList.add(newItemModel);
                        renderCardView.call(self, newItemModel);
                        GO.EventEmitter.trigger('todo', 'resize:column');
                        $parent.show();
                    },

                    afterCancel: function() {
                        GO.EventEmitter.trigger('todo', 'resize:column');
                        $parent.show();
                    }
                });

                $parent.hide().after(addCardView.el);

                GO.EventEmitter.trigger('todo', 'resize:column');
                $scrollContainer.scrollTop($scrollContainer.get(0).scrollHeight);
                $parent.parent().find('textarea[name="content"]').focus();
            });

        },

        _callActionMenu: function(e) {
            var $target = $(e.currentTarget),
                self = this;

            e.preventDefault();
            callActionForMember.call(this, this.todoModel, e, function(e) {
                TodoMenus.attachTo($target, new TodoMenus.ColumnActionMenuView({
                    "columnView": self
                }));
            });
        },

        _callEditTitleForm: function(e) {
            var $target = $(e.currentTarget),
                $h1 = $target.closest('h1'),
                $title = $h1.find('.ui-column-title'),
                self = this,
                editTitleView;

            e.preventDefault();

            callActionForMember.call(this, this.todoModel, e, function(e) {
                editTitleView = new EditColumnTitleFormView({
                    todoModel: self.todoModel,
                    categoryModel: self.model,
                    content: $title.text(),
                    afterConfirm: function(todoModel) {
                        $title.text(GO.util.unescapeHtml(todoModel.get('title')));
                        $h1.show();
                    },

                    afterCancel: function() {
                        $h1.show();
                    }
                });

                $h1.hide().after(editTitleView.el);
            });
        }
    });

    // privates...
    function renderCardViews() {
        var todoItemModels = getColumnCards.call(this),
            countCount = todoItemModels.length;

        if(countCount > 0) {
            _.each(todoItemModels, _.bind(renderCardView, this));
            updateCardCount.call(this, countCount);
        } else {
            renderNoCardMsg.call(this);
        }
    }

    function getColumnCards() {
        return this.todoItemList.where({"todoCategoryId": this.model.id});
    }

    function renderCardView(todoItemModel) {
        var cardView = new TodoCardView({
            "model": todoItemModel,
            "todoModel": this.todoModel,
            onRemoved: _.bind(function(cardView) {
                this.todoItemList.remove(cardView.model);
            }, this)
        });
        this.$el.find(SELECTORS.detail.cardContainer).append(cardView.el);
        this.subViews.push(cardView);
    }

    function updateCardCount(count) {
        var $target = this.$el.find('.ui-card-count'),
            cardCount = count || (getColumnCards.call(this) || []).length,
            hasCard = cardCount > 0;

        if(hasCard) {
            $target.text(cardCount);
        }
        $target.toggle(hasCard);
    }

    function getNoCardMsgEl() {
        return this.$el.find('.null_data');
    }

    function renderNoCardMsg() {
        this.$el.find(SELECTORS.detail.cardContainer)
            .empty()
            .append('<p class="null_data">' + TodoLang["등록된 카드 없음"] + '</p>');
    }

    function removeNoCardMsg() {
        getNoCardMsgEl.call(this).remove();
    }

    function toggleNoCardMsg() {
        var cardCount = this.$el.find(SELECTORS.detail.todoCard).length,
            noCardMsg = getNoCardMsgEl.call(this).length;

        if(cardCount > 0 && noCardMsg > 0) {
            removeNoCardMsg.call(this);
        } else if(cardCount <= 0 && noCardMsg <=0 ){
            renderNoCardMsg.call(this);
        }
    }

    function syncModelFromTodoModel() {
        var me = _.findWhere(this.todoModel.getCategories(), {"id": this.model.id});
        if(me) {
            this.model.set(me);
        }
    }

    function callActionForMember(todoModel, event, bodyFunc) {
        return TodoUtil.callActionForMember(todoModel, event, bodyFunc);
    }

    return TodoColumnView;

});
