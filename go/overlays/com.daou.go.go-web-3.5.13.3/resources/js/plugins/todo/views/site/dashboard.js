define([
        "backbone",
        "app",

        "todo/views/menus/main",
        "todo/libs/util",

        "hgn!todo/templates/board_card",
        "hgn!todo/templates/partials/_card_add_button",
        "text!todo/templates/partials/_user_thumbnail.html",

        "i18n!todo/nls/todo",
        "i18n!nls/commons",
        "i18n!board/nls/board",

        "jquery.ui",
        "jquery.go-validation",
        "jquery.go-popup"
    ],

    function (
        Backbone,
        App,
        TodoMenus,
        TodoUtil,
        renderBoardCard,
        renderCardAddButton,
        userThumnailTpl,
        TodoLang,
        CommonLang
    ) {

        var lang = { 'copy_url': CommonLang['URL 복사'] };

        var TodoDashboardView,
            CreateTodoMenuView = TodoMenus.CreateTodoMenuView,
            TodoCardView, TodoFavoriteCardView,
            CreateTodoBoxView;

        CreateTodoBoxView = CreateTodoMenuView.extend({

            tagName: 'span',
            className: 'todo_board',

            initialize: function (options) {
                this.myTodoList = options.myTodoList;
                CreateTodoMenuView.prototype.initialize.call(this, options);
                this.render();
            },

            // @Override
            _confirm: function (e) {
                var self = this,
                    title = this.$el.find('input[name=title]').val();

                if (!$.goValidation.isCheckLength(1, 1000, title)) {
                    $.goMessage(App.i18n(CommonLang["0자이상 0이하 입력해야합니다."], {arg1: 1, arg2: 1000}));
                    this.$el.find('input[name=title]').focus();
                    return false;
                }

                e.preventDefault();

                TodoUtil.promiseModelSave(this.model, {"title": title}).then(function (newModel) {
                    self.$el.closest('li').remove();
                    self.remove();
                    self.myTodoList.add(newModel);
                    GO.router.navigate('todo/' + newModel.id, {"trigger": true, "pushState": true});
                }).otherwise(function (err) {
                    console.log(err.stack);
                });
            },

            // @Override
            _cancel: function (e) {
                e.preventDefault();
                this.$el.replaceWith(createAddBtnHtml());
                this.remove();
            }

        });


        TodoCardView = Backbone.View.extend({
            tagName: 'li',
            className: 'ui-todo-card',

            template: renderBoardCard,

            favoriteTodoList: null,

            events: {
                "click .btn-star": "_toggleFavorite",
                "click .btn-board": "_navigate",
                'click .btn-go-url-copy': "copyUrl"
            },

            initialize: function (options) {
                this.favoriteTodoList = options.favoriteTodoList;

                this.$el.data('view', this);
                this.$el.addClass('ui-todo-' + this.model.id);
                this.render();

                this.listenTo(this.model, 'change:favoriteFlag', this.changeFavorite);
            },

            render: function () {
                this.$el.empty().append(this.template({
                    "favorite?": this.model.isFavorite(),
                    "private?": this.model.isPrivate(),
                    "title": GO.util.escapeHtml(this.model.get("title")),
                    "members": this.model.get('members'),
                    "directUrl": this.directUrl(),
                    "attr_title_favorite": this.model.isFavorite() ? TodoLang["즐겨찾기 해제"] : TodoLang["즐겨찾기 추가"],
                    "attr_title_public": this.model.isPublic() ? CommonLang["공개"] : CommonLang["비공개"],
                    "lang": lang
                }, {
                    "_user_thumbnail": userThumnailTpl
                }));
            },

            changeFavorite: function (model) {
                this.render();
            },

            getTodoId: function () {
                return this.model.id;
            },

            _toggleFavorite: function (e) {
                var targetFunc = this.model.isFavorite() ? 'removeFavorite' : 'addFavorite',
                    self = this;

                e.preventDefault();

                this.model[targetFunc].call(this.model).then(function (updatedModel) {
                    if (updatedModel.isFavorite()) {
                        self.favoriteTodoList.add(updatedModel);
                    } else {
                        self.favoriteTodoList.remove(updatedModel.id);
                    }
                });
            },

            _navigate: function (e) {
                e.preventDefault();

                if ($(e.target).is('.btn-star') || $(e.target).parents('.btn-star').length > 0) {
                    return false;
                }

                GO.router.navigate('todo/' + this.model.id, {"pushState": true, "trigger": true});
            },

            directUrl: function () {
                var url = GO.router.getRootUrl();
                url += "todo/" + this.model.id;
                return url;
            },

            copyUrl: function (e) {
                e.preventDefault();
                e.stopPropagation();
                var tempElement = document.createElement('textarea');
                document.body.appendChild(tempElement);
                tempElement.value = getUrl(this.model.id);
                tempElement.select();
                document.execCommand('copy');
                document.body.removeChild(tempElement);

                function getUrl(id) {
                    var url = [GO.router.getRootUrl(), GO.router.getUrl(), "/", id].join("");
                    console.log(url);
                    return url;
                }

                try {
                    if (GO.util.checkOS() == "android") {
                            window.GOMobile.copyUrl(tempElement.value);
                        } else {
                            window.location = "gomobile://copyUrl?" + tempElement.value;
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            });

        TodoFavoriteCardView = TodoCardView.extend({
            changeFavorite: function (model) {
                if (!model.isFavorite()) {
                    this.remove();
                }
            }
        });

        TodoDashboardView = Backbone.View.extend({
            className: 'content_page',
            myTodoList: null,
            favoriteTodoList: null,

            events: {
                "click .btn-add-board": "_callNewBoardDialog"
            },

            initialize: function (options) {
                this.myTodoList = options.myTodoList;
                this.favoriteTodoList = options.favoriteTodoList;

                this.listenTo(this.myTodoList, 'add', this.addBoard);
                this.listenTo(this.favoriteTodoList, 'add', this.addFavorite);
                this.listenTo(this.favoriteTodoList, 'remove', this.removeFavorite);
                this.listenTo(this.favoriteTodoList, 'resort', this.resortFavorite);
            },

            render: function () {
                var $wrap = $('<div class="wrap_todo"></div>');

                if (this.favoriteTodoList.length > 0) {
                    renderFavoriteSection.call(this, $wrap);
                }
                $wrap.append(renderSection.call(this, 'my', TodoLang["내 보드"], this.myTodoList).addClass('ui-my-board my_board'));

                this.$el.empty().append($wrap);
                initSortable.call(this);
                if (GO.util.pageDone) GO.util.pageDone();
                GO.util.appLoading(false);
            },

            remove: function () {
                if (GO.util.isMobile()) {
                    // 모바일웹은 content_page가 템플릿내에 고정되어 있는 방식이기 때문에 remove해서는 안된다.
                    this.stopListening();
                    this.$el.empty();
                } else {
                    Backbone.View.prototype.remove.apply(this, arguments);
                }
            },

            resortFavorite: function () {
                this.$el.find('.ui-favorite-board .ui-board-list')
                    .replaceWith(renderTodoList.call(this, 'favorite', this.favoriteTodoList));

                initSortable.call(this);
            },

            addBoard: function (model) {
                var newCardView = new TodoCardView({"model": model, "favoriteTodoList": this.favoriteTodoList});
                this.$el.find('.ui-my-board .ui-board-list').append(newCardView.el, decorateListItem(createAddBtnHtml()));
            },

            addFavorite: function (model) {
                if (this.$el.find('.ui-favorite-board').length > 0) {
                    var newFavoriteView = new TodoFavoriteCardView({
                        "model": model,
                        "favoriteTodoList": this.favoriteTodoList
                    });
                    this.$el.find('.ui-favorite-board .ui-board-list').append(newFavoriteView.el);
                } else {
                    renderFavoriteSection.call(this, this.$el.find('.wrap_todo'));
                }
                initSortable.call(this);
            },

            removeFavorite: function (model) {
                if (this.favoriteTodoList.length > 0) {
                    ;
                } else {
                    this.$el.find('.ui-favorite-board').remove();
                }
            },

            _callNewBoardDialog: function (e) {
                var $target = $(e.currentTarget),
                    // TODO: 디자인팀 공유(span -> div 으로 통일 예정)
                    createTodoBoxView = new CreateTodoBoxView({"myTodoList": this.myTodoList});

                e.preventDefault();
                $target.replaceWith(createTodoBoxView.el);
            }
        }, {
            create: function (myTodoList, favoriteTodoList) {
                return new TodoDashboardView({"myTodoList": myTodoList, "favoriteTodoList": favoriteTodoList});
            }
        });

        function initSortable() {
            var self = this;

            this.$el.find('.ui-favorite-board .ui-board-list').sortable({
                "items": '.ui-todo-card',
                "containment": 'document',

                stop: function (event, ui) {
                    var $parent = ui.item.parent(),
                        sortedIds = [];

                    $parent.find('li.ui-todo-card').each(function (i, li) {
                        var curView = $(li).data('view');
                        sortedIds.push(curView.getTodoId());
                    });

                    self.favoriteTodoList.reorder(sortedIds).then(function (updated) {
                        self.favoriteTodoList.trigger('resort');
                    }).otherwise(function (err) {
                        console.log(err);
                    });
                }
            });
        }

        function renderFavoriteSection($parent) {
            $parent.prepend(renderSection.call(this, 'favorite', TodoLang["즐겨찾는 보드"], this.favoriteTodoList).addClass('ui-favorite-board'));
        }

        function renderSection(type, title, collection) {
            var $section = $('<div class="wrap_todo_board"></div>'),
                buffer = [];

            buffer.push('<h1 class="s_title"><span class="txt">' + title + '</span></h1>');

            $section.append(buffer.join("\n"));
            $section.append(renderTodoList.call(this, type, collection));

            if (type === 'my') {
                $section.find('.ui-board-list').append(decorateListItem(createAddBtnHtml()));
            }

            return $section;
        }

        function decorateListItem(body, className) {
            var buffer = [];

            buffer.push('<li' + (className ? ' class="' + className + '"' : '') + '>');
            buffer.push(body);
            buffer.push('</li>');

            return buffer.join("\n");
        }

        function createAddBtnHtml() {
            return renderCardAddButton({"buttonTitle": TodoLang["보드 추가"]});
        }

        function renderTodoList(type, collection) {
            var $ul = $('<ul class="ui-board-list list_todo_board"></ul>'),
                CardViewKlass = {"my": TodoCardView, "favorite": TodoFavoriteCardView}[type],
                buffer = [];

            collection.each(function (model) {
                var cardView = new CardViewKlass({"model": model, "favoriteTodoList": this.favoriteTodoList});
                buffer.push(cardView.el);
            }, this);

            $ul.append.apply($ul, buffer);

            return $ul;
        }

        return TodoDashboardView;

    });
