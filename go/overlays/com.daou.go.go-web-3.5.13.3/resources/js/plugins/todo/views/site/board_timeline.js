define("todo/views/site/board_timeline", [
    "backbone", 
    "app", 
    "hogan", 
    
    "todo/constants",
    "todo/models/todo_activities",
    "hgn!todo/templates/board_activity_list",
    "text!todo/templates/partials/_board_activity_item.html",
    "text!todo/templates/partials/_user_thumbnail.html",
    
    "todo/libs/util",
    "todo/libs/scroll",
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons", 
    
    "jquery.go-popup"
], 

function(
    Backbone, 
    GO, 
    hogan, 
    
    Constants, 
    TodoActivityList, 
    
    renderBoardActivityList,
    activityItemTpl,
    userThumbnailTpl, 
    
    TodoUtil, 
    Scroller, 
    
    TodoLang, 
    CommonLang
) {

    var SELECTORS = Constants.SELECTORS; 
    var EVENT_NS = '.go.todo.timeline';
    var renderActivityItem = function(data) {
    	return Hogan.compile(activityItemTpl).render(data, {
			_user_thumbnail: userThumbnailTpl
		});
    };

    var BoardTimelineView = Backbone.View.extend({
        tagName: 'aside', 
        className: 'board-timeline-container aside_timeline', 
        template: renderBoardActivityList, 

        __page__: 1, 
        __pageSize__: 20, 

        events: {
            "click .btn-load-more": "_loadMore", 
            "click .btn-close-timeline": "_close"
        }, 

        initialize: function(options) {
            var self = this;

            options = options || {};
            this.todoModel = options.todoModel;
            this.onClose = options.onClose || function() {};
            if(!this.collection) {
                this.collection = TodoActivityList.newForTodo(this.todoModel);
            }
        }, 

        render: function() {
            var self = this;

            this.collection.getPageList().then(function(collection) {
                self.$el.empty().append(self.template({
                    "activities": parseActivities(collection), 
                    "label": {
                        "timeline": TodoLang["타임라인"], 
                        "load_more": CommonLang["더보기"], 
                        "close_timeline": TodoLang["타임라인 닫기"]
                    }, 
                    "msg": {
                        "no_activities": TodoLang["타임라인 없음 메시지"]
                    }
                }, {
                    "_board_activity_item": activityItemTpl, 
                    "_user_thumbnail": userThumbnailTpl
                }));
                resizeContentHeight.call(self);
                initScroller.call(self);
                
                GO.EventEmitter.on('todo', 'resize:column', self.resize, self);
            }).otherwise(function(err) {
                console.warn(err.stack);
            });
        }, 

        reload: function() {
            this.render();
        }, 

        resize: function(newHeight) {
            this.$el.height(newHeight);
            resizeContentHeight.call(this);
            if(this.$el.find(SELECTORS.common.scrollContainer).length > 0) {
                this.$el.find(SELECTORS.common.scrollContainer).data('go.todo.scroller').resizeScroll();
            }
        }, 

        remove: function() {
            GO.EventEmitter.off('todo', 'resize:column', this.resize);
            Backbone.View.prototype.remove.apply(this, arguments);
        }, 

        _loadMore: function() {
            var nextPage = this.__page__ + 1, 
                self = this;

            this.collection.getPageList(nextPage, this.__pageSize__).then(function(collection) {
                if(collection.length > 0) {
                	_.each(parseActivities(collection), function(data) {
                		self.$el.find(SELECTORS.detail.timelineContents).append(renderActivityItem(data));
                	});
                    ++self.__page__;
                } else {
                    var msg = TodoLang["타임라인 없음 메시지"];
                    if(GO.util.isMobile()) {
                        window.alert(msg);
                    } else {
                        $.goSlideMessage(TodoLang["타임라인 없음 메시지"]);
                    }
                }
            });
        }, 

        close: function() {
            this.remove();
            this.onClose();
        }, 

        _close: function(e) {
            e.preventDefault();
            this.close();
        }
    });

    function resizeContentHeight() {
        var $header = this.$el.find('header'), 
            $bottom = this.$el.find(SELECTORS.detail.timelineBottomButtons), 
            maxHeight = this.$el.height() - $header.outerHeight() - $bottom.outerHeight() - 20, 
            contentHeight = this.$el.find(SELECTORS.detail.timelineContents).outerHeight();
        
            this.$el.find(SELECTORS.common.scrollContainer).height(Math.min(maxHeight, contentHeight));
    }

    function initScroller() {
        Scroller.attachTo(this.$el.find(SELECTORS.common.scrollContainer));
    }

    function parseActivities(collection) {
        var clonedList = collection.toJSON();

        _.map(clonedList, function(item) {
            if(item.updatedAt) {
                item.updatedAt = TodoUtil.toStreamDate(item.updatedAt);
            }
            item.editable = (item.activityType === 'comment' && item.actor.id === GO.session('id'));
        });

        return clonedList;
    }

    return BoardTimelineView;

});