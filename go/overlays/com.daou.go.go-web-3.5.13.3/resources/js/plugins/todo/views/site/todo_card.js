define("todo/views/site/todo_card", [
    "backbone",
    "app", 
    
    "todo/views/menus/main",
    "todo/views/site/card_detail",
    "todo/models/todo_category",
    "todo/libs/util",
    
    "hgn!todo/templates/todo_card",
    "text!todo/templates/partials/_user_thumbnail.html",
    
    "libs/go-utils",
    
    "i18n!todo/nls/todo",
    "i18n!nls/commons"
],

function(
    Backbone,
    GO,
    
    TodoMenus,
    CardDetailView,
    TodoCategoryModel,
    TodoUtil,
    
    renderTodoCard, 
    userThumbnailTpl, 
    
    CommonUtil,
    
    TodoLang,
    CommonLang
) {

    var TodoCardView;

    TodoCardView = Backbone.View.extend({
        className: 'board_card',
        template: renderTodoCard,

        todoModel: null,
        onRemoved: function() {},

        events: {
            "click": "_callCardDetail",
            "click .btn-card-action": "_callCardActionMenu"
        },

        initialize: function(options) {
            options = options || {};

            this.todoModel = options.todoModel;

            if(options.hasOwnProperty('onRemoved') && _.isFunction(options.onRemoved)) {
                this.onRemoved = options.onRemoved;
            }

            this.$el.data('view', this);
            this.$el.addClass('ui-todocard ui-todocard-' + this.model.id);
            this.$el.attr("data-itemid", this.model.id);
            this.render();

            this.listenTo(this.todoModel, 'change:members', this.fetch);
            this.listenTo(this.model, 'change:title', this.reload);
            this.listenTo(this.model, 'change:labels', this.reload);
            this.listenTo(this.model, 'change:members', this.reload);
            this.listenTo(this.model, 'change:dueDate', this.reload);
            this.listenTo(this.model, 'change:attaches', this.reload);
            this.listenTo(this.model, 'change:checklists', this.reload);
            this.listenTo(this.model, 'change:content', this.reload);
            this.listenTo(this.model, 'change:commentCount', this.reload);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'moved', this.move);
        },

        render: function(e) {
            var duedate = this.model.get("dueDate"),
                checklistItemCount = this.model.getChecklistItemCount(),
                checklistCheckedItemCount = this.model.getChecklistCheckedItemCount();
            this.$el.empty().append(this.template({
                "title": GO.util.escapeHtml(this.model.get('title')),
                "model": this.model.toJSON(),
                "editable?": this.todoModel.isMember(GO.session('id')),
                "featureImage": this.model.getFeatureImage(),
                "attach_count": this.model.getFileCount(),
                "hasMembers?": this.model.hasMembers(),
                "hasMetadata?": hasMetadata.call(this),
                "hasLabels?": this.model.hasLabels(),
                "hasImages?": this.model.hasImages(),
                "hasComments?": this.model.hasComments(),
                "hasAttaches?": this.model.hasFiles(),
                "hasContent?": this.model.hasContent(),
                "hasChecklists?": this.model.hasChecklists(),
                "checklistItemCount": checklistItemCount,
                "checklistCheckedItemCount": checklistCheckedItemCount,
                "attachCountStatus": GO.i18n(TodoLang["파일개수 서술식 표현"], {"arg1" : this.model.getFileCount()}),
                "commentCountStatus": GO.i18n(TodoLang["댓글개수 서술식 표현"], {"arg1" : this.model.getCommentCount()}),
                "duedateStatus" : GO.i18n(TodoLang["기한일 서술식 표현"], {"arg1" : !!duedate ? moment(duedate).format(TodoLang["기한년월일시 포맷"]) : ""}),
                "checklistStatus": GO.i18n(TodoLang["체크리스트 서술식 표현"], {"arg1": checklistItemCount, "arg2": checklistCheckedItemCount}),
                "due_date": !!duedate ? moment(duedate).format(TodoLang["기한일 포맷"]) : false,
                "delayed?": this.model.isDelayed(),
                "label": {
                    "more": CommonLang["더보기"],
                    "showDesc": TodoLang["상세내용 보기"]
                },
                "useMobilePreview" : GO_config.__config__.mobileConfig.useMobilePreview,
                "isMobile" : GO.util.isMobile()
            }, {
                "_user_thumbnail": userThumbnailTpl
            }));
        },

        fetch : function() {
            var deferred = $.Deferred();
            var self = this;
            this.model.fetch({
              success : function() {
                self.reload();
                deferred.resolve();
              }
            });
            return deferred;
          },

        reload: function() {
            this.render();
            GO.EventEmitter.trigger('todo', 'resize:column');
        },

        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            this.onRemoved(this);
            GO.EventEmitter.trigger('todo', 'resize:column');
        },

        move: function(newCategoryId, newSeq) {
            var $newColumn = $('#column-content-' + newCategoryId),
                $cards = $newColumn.find('.ui-todocard'),
                $columnContainer = this.$el.closest('.ui-todocolumn'),
                columnView = $columnContainer.data('view'),
                curCategoryId = parseInt($columnContainer.data('categoryid')),
                curSeq = TodoUtil.searchCardSeq($cards, this.$el.data('itemid'));

            if(curCategoryId === newCategoryId) {
                var targetCard = $cards.get(newSeq);
                if (newSeq < curSeq) {
                    $(targetCard).before(this.$el);
                } else if(newSeq > curSeq) {
                    $(targetCard).after(this.$el);
                }
            } else {
                if($cards.length > 0) {
                    if ($cards.length === newSeq) {
                        var targetCard = $cards.last();
                        $(targetCard).after(this.$el);
                    } else {
                        var targetCard = $cards.get(newSeq);
                        $(targetCard).before(this.$el);
                    }
                } else {
                    $newColumn.append(this.$el);
                }
                
                //[GO-18440] ToDO+ > 카드를 A컬럼에서 B컬럼으로 옮긴 후, A 컬럼을 삭제하면 이동한 카드가 없어짐
                // 컬럼뷰에서 관리하는 서브뷰 배열에서 카드뷰를 삭제함
                if(columnView instanceof Backbone.View) {
            		columnView.takeOutCardView(this);
            	}
            }

            // 반드시 다시 find 해야 함.
            TodoUtil.syncCardSeqs($newColumn.find('.ui-todocard'));
            GO.EventEmitter.trigger('todo', 'resize:column');
        },

        updatePosition: function(categoryId, newSeq) {
            return this.model.move(categoryId, newSeq);
        },

        getItemId: function() {
            return this.model.id;
        },

        getSeq: function() {
            return this.model.get('seq');
        },

        setSequence: function(newSeq) {
            this.model.set('seq', parseInt(newSeq));
        },

        _callCardDetail: function(e) {
            var self = this;
            this.fetch().done(function() {
                CardDetailView.create(self.todoModel, self.model);
            });
        },

        _callCardActionMenu: function(e) {
            var $target = $(e.currentTarget),
                self = this;

            e.preventDefault();

            TodoUtil.callActionForMember(this.todoModel, e, function(e) {
                TodoMenus.attachTo($target, new TodoMenus.CardActionMenuView({
                    "model": self.model,
                    "todoModel": self.todoModel
                }));
            });

            e.stopPropagation();
        }
    });

    function hasMetadata() {
        return (this.model.hasContent() ||
            this.model.hasComments() ||
            this.model.hasFiles() ||
            this.model.hasChecklists() ||
            !!this.model.get("dueDate"));
    }

    return TodoCardView;

});
