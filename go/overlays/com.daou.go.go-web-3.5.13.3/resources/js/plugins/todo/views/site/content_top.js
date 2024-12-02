define([
    "app",
    "views/content_top",
    "todo/views/menus/main",
    "i18n!nls/commons"
],

function(
    GO,
    ContentTopView,
    TodoMenus,
    CommonLang
) {
    var TodoTopView;

    TodoTopView = ContentTopView.extend({
        collections: {},
        searchUrl: 'todo/search', 

        events: function() {
            var superEvents = _.result(ContentTopView.prototype, "events");
            return _.extend({}, superEvents, {
                "click .ui-btn-todolist a": "_openTodoListMenu",
                "change #searchType" : "toggleSelect"
            });
        },

        initialize: function(options) {
            options = options || {};

            if(options.myTodoList) {
                this.collections.myTodoList = options.myTodoList;
            }

            if(options.favoriteTodoList) {
                this.collections.favoriteTodoList = options.favoriteTodoList;
            }

            options.title = renderTodoListSelect();
            ContentTopView.prototype.initialize.call(this, options);
        },

        // @Override
        render: function() {
            ContentTopView.prototype.render.apply(this, arguments);
            this.toggleSelect();
        },

        // @Override
        renderTitle: function() {
            this.$el.find('h1').replaceWith(this.title);
        },

        setAppSearchTitle : function(){
            this.$el.find('#searchType option[value="appSearch"]').html(CommonLang['ToDO+'])
        },

        /**
         상세검색 레이어 호출
         - 어플리케이션별로 상속받아 구현

         @method showDetailSearch
         @param {$.Event} jQuery Event 객체
         @chainable
         */
        showDetailSearch: function(e) {
        	e.preventDefault();
            var $target = $(e.currentTarget), 
                toffset = $target.offset();
            var searchType = $('#searchType').val();
			if(searchType != "appSearch"){
				this.detailPopup(e);
			}
            return false;
        },

        _openTodoListMenu: function(e) {
            var $target = $(e.currentTarget),
                offset = $target.offset(),
                todoListMenu;

            e.preventDefault();

            TodoMenus.attachTo($target, new TodoMenus.TodoListMenuView({
                "myTodoList": this.collections.myTodoList,
                "favoriteTodoList": this.collections.favoriteTodoList
            }));

            // TodoMenus.attachTo($target, TodoMenus.createTodoListMenu(this.collections.myTodoList, this.collections.favoriteTodoList));
        },
        
        toggleSelect : function() {
	    	if($('#searchType').val() != "appSearch"){
	    		$('#btn_DetailSearch').show();
			} else {
				$('#btn_DetailSearch').hide();
			}
	    }
    });

    function renderTodoListSelect() {
        var buffer = [];
        buffer.push('<div class="ui-btn-todolist critical">');
        	buffer.push('<a href="#" class="btn_menu" data-bypass><span class="ic_board ic_menu"></span><span class="txt">Board</span><span class="ic_board ic_open2_w" title=""></span></a>');
        buffer.push('</div>');

        return buffer.join("\n");
    }

    return TodoTopView;
});
