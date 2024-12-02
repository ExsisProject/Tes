define("todo/views/site/card_activity_list", [
    "backbone",
    "hogan", 
    
    "todo/models/todo_activity",
    "todo/models/todo_activities",
    "todo/views/site/edit_text_form",
    
    "hgn!todo/templates/card_activity_list",
    "text!todo/templates/partials/_card_activity_list.html",
    "text!todo/templates/partials/_user_thumbnail.html",
    
    "todo/views/menus/main",
    "todo/libs/util",
    
    "i18n!todo/nls/todo",
    "i18n!nls/commons"
],

function(
    Backbone,
    hogan, 
    
    TodoActivityModel,
    TodoActivityList,
    EditTextFormView,
    
    renderCardActivityList,
    cardActivityItemTpl,
    userThumbnailTpl, 
    
    TodoMenus,
    TodoUtil,
    
    TodoLang,
    CommonLang
) {

    var CardActivityListView,
        ReplyEditFormView,
        ACTIVITY_TYPE = {"comments": 'comments', "timelines": 'timelines'};
    
    var renderCardActivityItem = function() {
        var compiled = Hogan.compile(cardActivityItemTpl);
        return compiled.render.apply(compiled, arguments);
    };

    ReplyEditFormView = EditTextFormView.extend({
        initialize: function(options) {
            options = options || {};
            options.content = this.model.get('content');
            options.enterNewLine = true;
            options.autoExpand = true;
            
            EditTextFormView.prototype.initialize.call(this, options);
        },

        _confirm: function(e) {
            var self = this,
                content = this.getValue();

            e.preventDefault();
            this.model.updateContent(content).then(function(activityModel) {
                self.remove();
                self.afterConfirm.call(self, activityModel);
            });
        }
    });

    CardActivityListView = Backbone.View.extend({
        className: 'card-activity-container',
        template: renderCardActivityList,

        __page__: 1,
        __pageSize__: 20,

        events: {
            "click form[name=form_reply] .btn-submit": "_saveReply",
            "focus form[name=form_reply] textarea": "_activateReplyForm",
            "click form[name=form_reply] .btn-cancel": "_deactivateReplyForm",
            "click .btn-reply-modify": "_callReplyEditForm",
            "click .btn-reply-remove": "_callRemoveConfirmForm",
            "click .activity-tab > li" : "_changeTab",
            "keyup textarea" : "_expandTextarea",
            "click .btn_list_reload": "_loadMore"
        },

        initialize: function(options) {
            var self = this;
            this.contentModels = [];
            options = options || {};
            this.todoItemModel = options.todoItemModel;
            if(!this.collection) {
                this.collection = TodoActivityList.newForTodoItem(this.todoItemModel);
            }

            this.listenTo(this.todoItemModel, 'change:commentCount', this.reload);
        },

        delegateEvents: function() {
            var self = this;

            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            $(document).on('click.card-activity-list', function(e) {
                var $target = $(e.target);
                if(!$target.parents('form[name=form_reply]').length > 0) {
                    deactivateReplyForm.call(self, false);
                }
            });
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            $(document).off('.card-activity-list');
        },

        render: function() {
            this.$el.empty().append(this.template({
                "session": GO.session(),
                "commentCount": this.todoItemModel.get('commentCount'),
                "activatedComments": this.collection.isActivated(ACTIVITY_TYPE.comments),
                "label": {
                    "comment": CommonLang["댓글"],
                    "timeline": TodoLang["타임라인"],
                    "save": CommonLang["저장"],
                    "cancel": CommonLang["취소"],
                    "modify": CommonLang["수정"],
                    "remove": CommonLang["삭제"],
                    "load_more": CommonLang["더보기"]
                }
            }, {
                "_user_thumbnail": userThumbnailTpl
            }));

            loadActivityListByType.call(this);
        },
        
        _expandTextarea : function(e) {
            GO.util.textAreaExpand(e);
        },

        changeActivityType: function(newType) {
            this.collection.setActivityType(newType);
            loadActivityListByType.call(this);
        },

        reload: function() {
            this.render();
        },

        _changeTab: function(e) {
            var $target = $(e.currentTarget),
                newType = $target.data('actitytype');

            this.changeActivityType(newType);

            this.$el.find('.activity-tab > li.active').removeClass('active');
            $target.addClass('active');
        },

        _activateReplyForm: function(e) {
            var $textarea = $(e.currentTarget),
                $form = $textarea.closest('form[name=form_reply]'),
                $buttons = $form.find('footer');

            $form.removeClass('form_wrap');
            $buttons.show();
        },

        _deactivateReplyForm: function(e) {
            e.preventDefault();
            deactivateReplyForm.call(this, true);
        },

        _saveReply: function(e) {
            var todoItemModel = this.todoItemModel;
            var commentContent = this.$el.find('textarea[name=content]').val();

            e.preventDefault();
            if (commentContent == "") {
                var alertMsg = CommonLang["댓글을 입력하세요."];
                GO.util.isMobile() ? alert(alertMsg) : $.goSlideMessage(alertMsg);
                return;
            }
            TodoActivityModel.createComment(todoItemModel, commentContent)
                .then(function () {
                    todoItemModel.set('commentCount', todoItemModel.getCommentCount() + 1);
                });
        },

        _callReplyEditForm: function(e) {
            var $target = $(e.currentTarget),
                $container = $target.closest('.card-activity-container'),
                $content = $container.find('.card-activity-content'),
                activityId = $container.data('id'),
                self = this,
                formView;

            e.preventDefault();

            var targetModel = _.find(this.contentModels, function(model) {
                return activityId == model.get("id");
            });

            formView = new ReplyEditFormView({
                model: targetModel,
                textareaHeight: $content.height(), 
                afterConfirm: function(activityModel) {
                    self.reload();
                },
                afterCancel: function() {
                    $content.children().show();
                    self.$el.find('.comment-action-buttons').removeAttr('style');
                }
            });

            $content.children().hide();
            $content.append(formView.el);

            this.$el.find('.comment-action-buttons').hide();
        },

        _callRemoveConfirmForm: function(e) {
            var $target = $(e.currentTarget),
                $container = $target.closest('.card-activity-container'),
                $content = $container.find('.card-activity-content'),
                activityId = $container.data('id'),
                todoItemModel = this.todoItemModel,
                self = this,
                formView;

            var activityModel = _.find(this.contentModels, function(model) {
                return activityId == model.get("id");
            });

            e.preventDefault();

            TodoMenus.attachTo($target, new TodoMenus.RemoveConfirmMenuView({
                subject: TodoLang["댓글 삭제 타이틀"],
                description: TodoLang["댓글 삭제 확인 메시지"],
                afterClick: function() {
                    var menuView = this;
                    activityModel.remove().then(function() {
                        menuView.back();
                        todoItemModel.set('commentCount', todoItemModel.getCommentCount() - 1);
                    });
                }
            }));
        },

        _loadMore: function() {
            var nextPage = this.__page__ + 1;

            var newCollection = TodoActivityList.newForTodoItem(this.todoItemModel);
            newCollection.setActivityType(this.collection.activityType);
            newCollection.getPageList(nextPage, this.__pageSize__)
                .then(_.bind(function (collection) {
                    if(collection.length > 0) {
                        renderActivityList.call(this, collection);
                        ++this.__page__;
                    } else {
                        var msg = TodoLang["댓글 없음 메시지"];
                        if(newCollection.activityType === "timelines") {
                            msg = TodoLang["타임라인 없음 메시지"];
                        }

                        if(GO.util.isMobile()) {
                            window.alert(msg);
                        } else {
                            $.goSlideMessage(msg);
                        }
                    }
                }, this));
        }

    });

    function loadActivityListByType() {
        this.__page__ = 1;
        this.contentModels = [];

        toggleCommentWriteForm.call(this);
        clearActivityList.call(this);

        this.collection
            .getPageList()
            .then(_.bind(renderActivityList, this))
            .then(_.bind(toggleLoadMoreContentBtn, this))
            .otherwise(function(err) {
                console.warn(err.stack);
            });
    }

    function toggleLoadMoreContentBtn() {
        var moreBtn = this.collection.length < this.collection.page.total || false;
        if(!moreBtn) {
            this.$el.find('#moreBtn').hide();
        } else {
            this.$el.find('#moreBtn').show();
        }
    }

    function toggleCommentWriteForm() {
        this.$el.find('.comment-write-form').toggle(this.collection.isActivated(ACTIVITY_TYPE.comments));
    }

    function clearActivityList() {
        this.$el.find('.activity-list-container').empty();
    }

    function renderActivityList(collection) {
        var template = renderCardActivityItem;

        this.$el.find('.activity-list-container')
            .append(template({
                "activities": parseActivities(collection),
                "label": {
                    "save": CommonLang["저장"],
                    "cancel": CommonLang["취소"],
                    "modify": CommonLang["수정"],
                    "remove": CommonLang["삭제"]
                }
            }, {
                "_user_thumbnail": userThumbnailTpl
            }))

        _.each(collection.models, function(model) {
            this.contentModels.push(model);
        }, this);
    }

    function parseActivities(collection) {
        var clonedList = collection.toJSON();

        _.map(clonedList, function(item) {
            if(item.updatedAt) {
                item.updatedAt = TodoUtil.toStreamDate(item.updatedAt);
            }
            item.editable = (item.activityType === 'comment' && item.actor.id === GO.session('id'));
            item.content = GO.util.escapeHtml(item.content);
        });

        return clonedList;
    }

    function deactivateReplyForm(isCancel) {
        var $form = this.$el.find('form[name=form_reply]'),
            $buttons = $form.find('footer');

        if(!$form.hasClass('form_wrap')) {
            $form.addClass('form_wrap');
            if(isCancel){
            	$form.find('textarea').val('');
            }
            $buttons.hide();
        }
    }

    return CardActivityListView;

});
