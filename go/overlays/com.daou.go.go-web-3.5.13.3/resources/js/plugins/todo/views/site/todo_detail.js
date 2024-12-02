define("todo/views/site/todo_detail", [
    "backbone",
    "app",
    "when",
    
    "todo/constants",
    "todo/models/todo",
    "todo/models/todo_category",
    "todo/models/todo_item",
    "todo/models/todo_items",
    
    "todo/views/site/todo_column",
    "todo/views/site/board_timeline",
    "todo/views/extensions/burnup_chart/main",
    "todo/views/extensions/calendar",
    "todo/views/menus/main",
    
    "hgn!todo/templates/todo_detail",
    
    "todo/libs/util",
    "todo/libs/scroll",
    
    "i18n!nls/commons",
    "i18n!todo/nls/todo",

    "jquery.go-validation",
    "jquery.go-popup"
],

function(
    Backbone,
    App,
    when,
    
    Constants,
    TodoModel,
    TodoCategoryModel,
    TodoItemModel,
    TodoItemList,
    
    TodoColumnView,
    BoardTimelineView,
    BurnupChartView,
    TodoCalendarView,
    TodoMenus,
    
    renderTodoDetail, 
    
    TodoUtil,
    Scroller,
    
    CommonLang,
    TodoLang
) {

    var SELECTORS = Constants.SELECTORS,
        TodoDetailView;

    TodoDetailView = Backbone.View.extend({
        className: 'content_page',

        __layout__: null,
        template: renderTodoDetail,
        subViews: [],
        options: {},
        timelineView: null,

        extensionView: null,

        events: {
            "click .btn-add-column": "_toggleAddButton",
            "click .btn-favorite": "_toggleFavorite",
            "click .btn-public-status": "_callPublicOptionMenu",
            "click .btn-board-menu": "_callBoardMenu",
            "click .ui-column-add-form .btn-save": "_reqAddColumn",
            "submit form[name=form_column_add]": "_reqAddColumn",
            "click .ui-column-add-form .btn-cancel": "_toggleAddButton",
            "click .ui-todo-title": "_callBoardTitleMenu",
            "click .btn-open-calendar": "_openCalendar",
            "click .btn-open-stat": "_openStatistic",
            "click .btn-open-timeline": "_openTimeline"
        },

        initialize: function(options) {
            // _.default는 options를 변경시키므로 쓰지 않는다.
            this.options = _.extend({}, {
                "useToolbar": true,
                "useCustomScroll": true,
                "columnWidth": null
            }, options|| {});

            this.__layout__ = this.options.layout;
            this.todoItemList = TodoItemList.newFromTodo(this.model);

            this.scrollWidth = Scroller.detectScrollWidth();

            resizeContentPage.call(this);
        },

        render: function() {
            var todoItemList = this.todoItemList,
                self = this;

			self.subViews = [];
				
            this.setTheme();
            this.$el.empty().append(this.template({
                "title": GO.util.unescapeHtml(this.model.get('title')),
                "public?": this.model.isPublic(),
                "favorite?": this.model.isFavorite(),
                "useToolbar?": this.options.useToolbar,
                "editable?": this.model.isMember(GO.session('id')),
                "owner?": this.model.isOwner(GO.session('id')),
                "attr_title_public": this.model.isPublic() ? CommonLang["공개"] : CommonLang["비공개"],
                "attr_title_favorite": this.model.isFavorite() ? TodoLang["즐겨찾기 해제"] : TodoLang["즐겨찾기 추가"],
                "label": {
                    "public": CommonLang["공개"],
                    "private": CommonLang["비공개"],
                    "timeline": TodoLang["타임라인"],
                    "columnAdd": TodoLang["칼럼 추가"],
                    "save": CommonLang["저장"],
                    "cancel": CommonLang["취소"],
                    "stat": TodoLang["통계"],
                    "calendar": CommonLang["캘린더"]
                }
            }));

            return todoItemList.getFilteredList().then(function(collection) {
                initContainers.call(self);
                initColumns.call(self);
                initScrollers.call(self);
                initSortable.call(self);

                return self;
            }).otherwise(function(e) {
                console.log(e.hasOwnProperty('stack') ? e.stack : e.message);
            });
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            GO.EventEmitter.on('todo', 'go.todo.detail.clearlayers', this.clearLayers, this);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            GO.EventEmitter.off('todo', 'go.todo.detail.clearlayers');
        },

        clearLayers: function() {
            if(this.timelineView) {
                this.timelineView.remove();
            }

            $(document).trigger('go.todo.clearmenu');
        },

        remove: function() {

            if(GO.util.isMobile()) {
                // 모바일웹은 content_page가 템플릿내에 고정되어 있는 방식이기 때문에 remove해서는 안된다.
                this.stopListening();
                this.$el.empty();
                // 높이값 계산등으로 인해 붙은 인라인 스타일을 제거한다.
                this.$el.removeAttr("style");
            } else {
                Backbone.View.prototype.remove.apply(this, arguments);
            }

            _.each(this.subViews, function(subview) {
                if(subview && subview.remove) {
                    subview.remove();
                }
            });
        },

        setTheme: function() {
            var themeNo = this.model.get("themeNo");

            if(themeNo < 1) {
                themeNo = 1;
            }

            this.__layout__.setTheme(themeNo);
            return this;
        },

        changeTheme: function() {
            // 먼저 기존 classname을 지우고...
            // todoModel의 themeNo 를 업데이트 한 후
            // this.setTheme를 실행해야 한다.
        },

        getTodoModel: function() {
            return this.model;
        },

        getTodoItemModel: function(todoItemId) {
            return this.todoItemList.get(todoItemId);
        },

        _toggleAddButton: function(e) {
            var $container = this.$el.find(SELECTORS.detail.addCloumnContainer),
                self = this;

            e.preventDefault();

            callActionForMember.call(this, this.model, e, function(e) {
                toggleAddForm.call(self, $container);
            });
        },

        _reqAddColumn: function(e) {
            var newTitle,
                $container = this.$el.find(SELECTORS.detail.addCloumnContainer),
                self = this;

            e.preventDefault();
            callActionForMember.call(this, this.model, e, function(e) {
                newTitle = self.$el.find(SELECTORS.detail.columnAddForm + ' input[name=title]').val();

                if(!$.goValidation.isCheckLength(1, 1000, newTitle)){
                    $.goMessage( App.i18n(CommonLang["0자이상 0이하 입력해야합니다."],{arg1 : 1, arg2 : 1000}));
                    $(SELECTORS.detail.columnAddForm + ' input[name=title]').focus();
                    return false;
                }

                self.model.addCategory(newTitle).then(function(newCateModel) {
                    var newCoulmnView = renderColumnView.call(self, newCateModel);
                    $container.before(newCoulmnView.el);
                    toggleAddForm.call(self, $container);
                    Scroller.attachTo(newCoulmnView.$el.find(SELECTORS.common.scrollContainer));
                    initSortable.call(self);
                    resetBoardContainerWidth();
                });
            });
        },

        // TODO: 리팩토링?(dashboard 코드와 유사하긴 한데...)
        _toggleFavorite: function(e) {
            var $target = $(e.currentTarget),
                targetFunc = this.model.isFavorite() ? 'removeFavorite' : 'addFavorite',
                self = this;

            e.preventDefault();

            this.model[targetFunc].call(this.model).then(function(updatedModel) {
                var favoriteTodoList = self.__layout__.collections.favoriteTodoList;

                if(updatedModel.isFavorite()) {
                    favoriteTodoList.add(updatedModel);
                    $target.find('ins').prop('title', TodoLang["즐겨찾기 해제"]);
                } else {
                    favoriteTodoList.remove(updatedModel);
                    $target.find('ins').prop('title', TodoLang["즐겨찾기 추가"]);
                }

                toggleFavoriteStatus(updatedModel, $target.find('ins'));
            });
        },

        _callPublicOptionMenu: function(e) {
            var $target = $(e.currentTarget),
                $icon = $target.find('.ic_board'),
                self = this;

            e.preventDefault();

            callActionForOwner.call(this, this.model, e, function(e) {
                TodoMenus.attachTo($target, new TodoMenus.PublicOptionMenuView({
                    "model": self.model,
                    afterSave: function(updatedModel) {
                        togglePublicStatus(updatedModel, $icon);
                    }
                }));
            });
        },

        _callBoardTitleMenu: function(e) {
            var $target = $(e.currentTarget),
                self = this;

            e.preventDefault();

            callActionForOwner.call(this, this.model, e, function(e) {
                TodoMenus.attachTo($target, new TodoMenus.BoardTitleMenuView({
                    "model": self.model,
                    afterSave: function(updatedModel) {
                        $target.html(updatedModel.get('title'));
                    }
                }));
            });
        },

        _callBoardMenu: function(e) {
            var $target = $(e.currentTarget);

            e.preventDefault();

            TodoMenus.attachTo($target, new TodoMenus.BoardActionMenuView({
                "model": this.model
            }));
        },

        _openTimeline: function(e) {
            e.preventDefault();
            toggleTimeline.call(this);
        },

        _openStatistic: function(e) {
            var self = this;
            e.preventDefault();

            toggleExtensionView.call(this, BurnupChartView, {
                todoModel: this.model,
                height: getBoardContentHeight.call(this),
                onClose: function(){
                    releaseExtensionView.call(self);
                }
            });
        },

        _openCalendar: function(e) {
            var self = this;
            e.preventDefault();

            toggleExtensionView.call(this, TodoCalendarView, {
                todoModel: this.model,
                todoItemList: this.todoItemList,
                height: getBoardContentHeight.call(this),
                onClose: function(){
                    releaseExtensionView.call(self);
                }
            });
        }
    }, {
        attachToLayout: function(layout, todoId, options) {
            var defer = when.defer();

            TodoModel.getBoard(todoId).then(function(todoModel) {
                var detailView,
                    viewOpts = _.extend({"model": todoModel, "layout": layout}, options || {});

                // 모바일 레이아웃 일 경우...
                // TODO: 리팩토링(하나의 패턴으로 가도록 레이아웃을 변경)
                if(layout.buildContentView) {
                    detailView = layout.buildContentView(TodoDetailView, viewOpts);
                } else {
                    detailView = new TodoDetailView(viewOpts);
                    layout.setContent(detailView);
                }

                detailView.render().then(defer.resolve, defer.reject);

            }, defer.reject);

            return defer.promise;
        }
    });

    // 확장(통계, 캘린더)뷰 토글 : 확장뷰는 한번에 하나만 열 수 있음
    function toggleExtensionView(viewKlass, options) {
        if(this.extensionView) {
            var viewName = this.extensionView.name;
            this.extensionView.close();

            if(viewName === viewKlass.prototype.name) {
                return;
            }
        }

        this.$el.find(SELECTORS.detail.boardContainer).hide();
        this.extensionView = viewKlass.attachTo(this.$el, options || {});
        this.extensionView.resize(getBoardContentHeight.call(this));
        this.subViews.push(this.extensionView);
    }

    function closeStatistic() {
        this.extensionView = null;
        this.$el.find(SELECTORS.detail.boardContainer).show();
    }

    function releaseExtensionView() {
        this.extensionView = null;
        this.$el.find(SELECTORS.detail.boardContainer).show();
        triggerResizeColumns();
    }

    function callActionForOwner(todoModel, event, bodyFunc) {
        return TodoUtil.callActionForOwner(todoModel, event, bodyFunc);
    }

    function callActionForMember(todoModel, event, bodyFunc) {
        return TodoUtil.callActionForMember(todoModel, event, bodyFunc);
    }

    function toggleTimeline() {
        var self = this;

        if(this.timelineView) {
            this.timelineView.close();
        } else {
            this.timelineView = new BoardTimelineView({
                "todoModel": this.model,
                "onClose": function() {
                    self.timelineView = null;
                }
            });
            $('.go_body').append(this.timelineView.el);
            this.timelineView.resize(this.__layout__.getContentPageHeight());
            this.timelineView.render();
            this.subViews.push(this.timelineView);
        }
    }

    function initColumns() {
        var categories = this.model.getCategories(),
            buffer = [];

        _.each(categories, function(category) {
            var categoryView = renderColumnView.call(this, new TodoCategoryModel(category));
            buffer.push(categoryView.el);
        }, this);

        $.fn.prepend.apply($(SELECTORS.detail.boardContent), buffer);
        resetBoardContainerWidth();
        triggerResizeColumns();
    }

    function initContainers() {
        var self = this;

        resizeBoardContent.call(this);

        this.listenTo(this.__layout__, 'resize:content', function(size) {
            resizeContentPage.call(self, size);
            resizeBoardContent.call(self);
            resizeScrollers.call(self);
            resizeExtensionView.call(self);
            triggerResizeColumns(size);
        });
    }

    function triggerResizeColumns(size) {
        GO.EventEmitter.trigger('todo', 'resize:column', size);
    }

    function initScrollers() {
        Scroller.attachTo(this.$el.find(SELECTORS.common.scrollContainer), {
            "bounces": GO.util.isMobile()
        });
    }

    function resizeScrollers() {
        this.$el.find(SELECTORS.common.scrollContainer).each(function(i, scroller) {
            if($(scroller).data('go.todo.scroller')) {
                $(scroller).data('go.todo.scroller').resizeScroll();
            }
        });
    }

    function resizeContentPage(newSize) {
        var size = newSize ? newSize : this.__layout__.getContentPageHeight();
        this.$el.height(size);
    }

    function getBoardContentHeight() {
        var cph = this.$el.height(),
            ch = this.$el.find('.content-header').outerHeight();

        return cph - ch - this.scrollWidth;
    }

    function resizeBoardContent() {
        $(SELECTORS.detail.boardContent).height(getBoardContentHeight.call(this));
    }

    function resizeExtensionView() {
        if(!this.extensionView) {
            return;
        }

        this.extensionView.resize(getBoardContentHeight.call(this));
    }

    function toggleFavoriteStatus(model, $star) {
        if(model.isFavorite()) {
            $star.removeClass('ic_star_off').addClass('ic_star');
        } else {
            $star.removeClass('ic_star').addClass('ic_star_off');
        }
    }

    function togglePublicStatus(model, $icon) {
        if(model.isPublic()) {
            $icon.removeClass('ic_private').addClass('ic_public').attr('title', CommonLang["공개"]);
        } else {
            $icon.removeClass('ic_public').addClass('ic_private').attr('title', CommonLang["비공개"]);
        }
    }

    function renderColumnView(categoryModel) {
        var columnView = new TodoColumnView({
            "model": categoryModel,
            "todoModel": this.model,
            "todoItemList": this.todoItemList,
            "width": this.options.columnWidth
        });

        this.subViews.push(columnView);
        return columnView;
    }

    function resetBoardContainerWidth() {
        var contentWidth = 0;
        $(SELECTORS.detail.boardContent).find(SELECTORS.detail.columnContainer).each(function(i, column) {
            var columnWidth = $(column).outerWidth(true);
            contentWidth += columnWidth;
        });

        $(SELECTORS.detail.boardContent).width(contentWidth);
    }

    function initSortable() {
        var todoModel = this.model,
            self = this;

        if(!this.model.isMember(GO.session('id'))) {
            return void 0;
        }

        initColumnSortable.call(this);
        initCardSortable.call(this);
    }

    var cloneFlag = false;
    function sortableHelper(event, el) {
        var $cloned = $(el).clone();
        // $cloned.addClass('card_move');

        $(SELECTORS.detail.boardContainer).append($cloned);
        $cloned.hide();

        setTimeout(function () {
            // 빠르게 클릭하면서 D&D 시도할 경우(특히 태블릿 사용자),
            // $cloned 객체는 사라졌지만 가비지 처리가 되지 않아 객체가 남아 있는경우
            // 복사한 객체가 남아서 body에 붙는 것으로 추정. 따라서 플래그를 두어 이를 체크하는 방식으로 수정함.
            // (GO-14079)
            if(cloneFlag) {
                $cloned.appendTo('body');
                $cloned.show();
            }
        }, 1);

        cloneFlag = true;
        return $cloned;
    }

    function initColumnSortable() {
        var todoModel = this.model;

        $(SELECTORS.detail.boardContent).sortable({
            "items": SELECTORS.detail.todoColumn,
            "handle": 'header',
            "helper": sortableHelper,
            "stop": function(event, ui) {
                var $parent = ui.item.parent(),
                    sortedIds = [];

                $parent.find(SELECTORS.detail.todoColumn).each(function(i, column) {
                    var categoryId = $(column).data('categoryid');
                    sortedIds.push(categoryId);
                });

                todoModel.reorderCategories(sortedIds).then(function(updatedModel) {
                });

                cloneFlag = false;
            }
        });
    }

    function initCardSortable() {
        $(SELECTORS.detail.cardContainer)
            .sortable({
                "items": SELECTORS.detail.todoCard,
                "connectWith": SELECTORS.detail.cardContainer,
                "helper": sortableHelper,

                start: function (event, ui) {
                    $('body').scrollParent();
                },

                "over": function(event, ui) {
                    triggerResizeColumns();
                },

                "stop": function(event, ui) {
                    var $card = ui.item,
                        $scrollContent= $card.closest(SELECTORS.detail.cardContainer),
                        newCategoryId = $card.closest(SELECTORS.detail.columnContainer).data('categoryid'),
                        cardView = $card.data('view'),
                        newSeq = 0;

                    if(cardView) {
                        newSeq = searchNewCardSeq($scrollContent.find(SELECTORS.detail.todoCard), cardView.getItemId());
                        cardView.updatePosition(newCategoryId, newSeq).then(function() {
                            syncCardSeqs($scrollContent.find(SELECTORS.detail.todoCard));
                            triggerResizeColumns();
                        });
                    }

                    cloneFlag = false;
                }, 
                
                "remove": function(event, ui) {
                	var $card = ui.item;
                	var columnView = $(this).closest(SELECTORS.detail.columnContainer).data('view');
                	
                	takeOutCardView(ui.item, columnView);
                }
            });
    }
    
    //[GO-18440] ToDO+ > 카드를 A컬럼에서 B컬럼으로 옮긴 후, A 컬럼을 삭제하면 이동한 카드가 없어짐
    // 컬럼뷰에서 관리하는 서브뷰 배열에서 카드뷰를 삭제함
    function takeOutCardView($card, columnView) {
    	if(columnView instanceof Backbone.View) {
    		columnView.takeOutCardView($card.data('view'));
    	}
    }

    function searchNewCardSeq($cards, targetId) {
        return TodoUtil.searchCardSeq($cards, targetId);
    }

    function syncCardSeqs($cards) {
        return TodoUtil.syncCardSeqs($cards);
    }

    function toggleAddForm($container) {
        var type = $container.attr('data-type');

        if(type === 'button') {
            $container.removeClass('column_create_wrap');
            $container.find(SELECTORS.detail.columnAddButton).hide();
            $container.find(SELECTORS.detail.columnAddForm + " input:text").val("");
            $container.find(SELECTORS.detail.columnAddForm).show();
            $container.attr('data-type', 'form');
        } else {
            $container.addClass('column_create_wrap');
            $container.find(SELECTORS.detail.columnAddButton).show();
            $container.find(SELECTORS.detail.columnAddForm).hide();
            // jQuery.data()를 이용하면 html 속성값이 변경되지 않아 혼란스러울 수 있다.
            $container.attr('data-type', 'button');
        }
    }

    return TodoDetailView;

});
