define("components/history_menu/main", [
    "backbone", 
    "when", 
    "app", 
    "components/history_menu/views/historiable_menu", 
    "hgn!components/history_menu/templates/main", 
    "i18n!nls/commons"
], 

function(
    Backbone, 
    when, 
    GO, 
    HistoriableMenuView, 
    mainTemplate, 
    CommonLang
) {

    var HistoryMenuView,
        MenuCaller,
        SELECTORS= {
            "title": 'header > h1', 
            "container": '.ui-menu-container', 
            "content": '.ui-menu-content', 
            "back_btn": '.btn-history-back'
        };

    function MenuCallerDimensionHelper($caller) {
        this.offset = $caller.offset();
        this.width = $caller.width();
        this.height = $caller.height();
        this.outerWidth = $caller.outerWidth();
        this.outerHeight = $caller.outerHeight();
    }

    HistoryMenuView = Backbone.View.extend({
        className: 'history-menu layer_transition', 
        attributes: {"data-target": 'historymenu'}, 

        __historyQueue__: [], 
        template: mainTemplate, 
        connectWith: null,
        dimensionHelper: null,
        $caller: null,

        events: {
            "click .btn-history-back": "back", 
            "click .btn-close": "close"
        }, 

        initialize: function(options) {
            var opts = options || {};

            this.zIndex = options.zIndex || 100;
            this.__historyQueue__ = [];
            // TODO: 임시... 디자인팀에서 position을 비롯한 기타 스타일링을 잡아줄때까지만 유지
            this.$el.css({"z-index": this.zIndex});
            this.$el.attr('data-cid', this.cid);
            this.$el.data('go.historymenu', this);
            this.$caller = opts.$caller || $(document);
            // $caller가 hidden 상태에서는 offset() 등의 결과가 0이 되므로 처음 호출때 $caller의 각 수치값을 저장해 놓는다.
            this.dimensionHelper = new MenuCallerDimensionHelper(this.$caller);
            GO.EventEmitter.on("todo", "close:cardColumnMenu", this.close, this);
        },

        render: function() {
            var cid = this.cid, self = this;

            this.$el.append(this.template({
                "back": CommonLang["이전"], 
                "close": CommonLang["닫기"]
            }));

            if(GO.util.isMobile()) {
                renderBackdrop(this.$el);
            } else {
                bindClearMenuEvent.call(this);
            }
        }, 

        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);
            $(document).off('go.todo.clearmenu');
        }, 

        add: function(nextView) {
            this.__historyQueue__.push(nextView);
            nextView.__historyMenu__ = this;
        }, 

        forward: function(nextView) {
            clearMenu.call(this);
            this.add(nextView);
            activateMenu.call(this, nextView);
        }, 

        back: function() {
            if(this.__historyQueue__.length > 1) {
                removeMenu.call(this);
                activateMenu.call(this, getCurrentMenu.call(this)); 
            } else {
                this.close();
            }
        }, 

        close: function() {
            // 큐 정리
            clearQueue.call(this);
            $('.ui-backdrop').remove();
            $(document).off(".go.todo.backdrop");
            this.remove();
        }, 

        setTitle: function(newTitle) {
            this.$el.find(SELECTORS.title)
                .empty()
                .html(newTitle);

            return this;
        }, 

        // helpers for element 
        getContainerEl: function() {
            return this.$el.find(SELECTORS.container);
        }, 

        getTitleEl: function() {
            return this.$el.find(SELECTORS.title);
        }, 

        addClass: function(classnames) {
            this.$el.addClass(classnames);
        }
    });

    function bindClearMenuEvent() {
        setTimeout(_.bind(function() {
            var self = this;
            $(document).on('go.todo.clearmenu', function(e) {
                var $relatedTarget = $(e.relatedTarget), 
                    curView = getCurrentMenu.call(self);

                if($relatedTarget.closest(self.$el).length > 0) return;
                if(curView.connectWith && $relatedTarget.closest(curView.connectWith).length > 0) return;

                if(self.$el.is(':visible')) {
                    self.close();
                }
            });
        }, this), 300);
    }

    function renderBackdrop($body) {
        var self = this, 
            $backdrop = $('<div class="ui-backdrop"></div>');

        $backdrop
            .css({"position": 'absolute', "left":0, "top":0, "width": $(window).width(), "height": $(window).height(), "z-index": (self.zIndex - 1), "overflow-y":'auto'})
            .append($body)
            .appendTo('body')
            .show();

        return $backdrop;
    }

    function clearQueue() {
        _.each(this.__historyQueue__, function(menuView) {
            removeMenu.call(this);
        }, this);
    }

    function getCurrentMenu() {
        return _.last(this.__historyQueue__);
    }

    function activateMenu(view) {
        var $container = this.$el.find(SELECTORS.container);

        resetClassnames.call(this);
        this.setTitle(view.title);
        $container.append(view.el);
        view.activate();

        if(view.__menuClasses__) {
            this.addClass(view.__menuClasses__);
        }

        if(this.__historyQueue__.length > 1) {
            this.$el.find(SELECTORS.back_btn).show();
        } else {
            this.$el.find(SELECTORS.back_btn).hide();
        }

        setMenuPosition.call(this);
    }

    function resetClassnames() {
        this.$el.removeClass(function() {
            return $(this).attr("class");
        }).addClass(this.className);
    }

    function clearMenu() {
        var currentMenu = getCurrentMenu.call(this);

        if(currentMenu) {
            currentMenu.deactivate();
            currentMenu.remove();
        }
        
        return currentMenu;
    }

    function removeMenu() {
        if(clearMenu.call(this)) {
            var removedMenu = this.__historyQueue__.pop();
            delete removedMenu;
        }
    }

    function setMenuPosition() {
        if(GO.util.isMobile()) {
            setMenuPositionForMobile.call(this);
        } else {
            setMenuPositionForPc.call(this);
        }
    }

    function setMenuPositionForPc() {
        var // IE8에서 $target.offset()로 변수 저장후 obj.left 로 접근하면 0을 반환하는 현상이 있음.
            offsetLeft = this.dimensionHelper.offset.left,
            offsetTop = this.dimensionHelper.offset.top,
            rightTopLeft = offsetLeft + this.$el.outerWidth(),
            leftBottomLeft = offsetTop + this.$el.outerHeight() + this.dimensionHelper.outerHeight,
            winW = $(window).width(),
            winH = $(window).height(),
            result = {};
        var isAdvanced = GO.session('theme') === 'THEME_ADVANCED';

        if(rightTopLeft > winW) {
            result.left = winW - this.$el.outerWidth();
        } else {
            var correctPx = 0;
            if(isAdvanced) {
                correctPx = $('header.go_header_advanced').width();
            }
            result.left = offsetLeft - correctPx;
        }

        if(winH > this.$el.outerHeight() && leftBottomLeft > winH) {
            // 아래에 너무 붙는 경향이 있으므로 마진 10px을 준다.
            result.top = winH - this.$el.outerHeight() - 10;
        } else {
            var correctPx = -12;
            if(isAdvanced) {
                correctPx = 31;
            }
            result.top = offsetTop + correctPx;// + this.dimensionHelper.outerHeight;
        }

        this.$el.css(result);
    }

    function setMenuPositionForMobile() {
        var menuWidth = 0,
            left = 0,
            top = 0;

        menuWidth = this.$el.outerWidth();
        left = ($(window).width() - menuWidth) / 2;
        this.$el.css({"left": left, "top": top});
    }


    // factory
    return {
        HistoryMenuView: HistoryMenuView, 
        HistoriableMenuView: HistoriableMenuView, 

        // for test
        SELECTORS: SELECTORS, 

        // Public API
        // @deprecated
        create: function(firstMenuView) {
            var instance = new HistoryMenuView();
            instance.render();
            instance.forward(firstMenuView);

            return instance;
        },

        attachTo: function($caller, firstMenuView) {
            var instance,
                // PC는 나눔웹글꼴 적용을 위해 go_body에 붙인다.
                selector = GO.util.isMobile() ? 'body' : '.go_body';

            $(document).trigger('go.todo.clearmenu');

            instance = new HistoryMenuView({"$caller": $caller});
            $(selector).append(instance.el);
            instance.render();
            instance.forward(firstMenuView);

            return instance;
        }
    };

});