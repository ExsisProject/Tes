define('docs/views/home', function(require) {
	var Backbone = require("backbone");

	var DocListItemModel = require("docs/models/docs_doc_item");

	var homeTmpl = require("hgn!docs/templates/home");

    var HomeSide = require("docs/views/side");
	var BaseDocsView = require("docs/views/base_docs");
    var TodoListView = require("docs/views/docslist/docs_todo_list");
    var BaseDocsListView = require("docs/views/docslist/base_docs_list");
    var BackdropView = require('components/backdrop/backdrop');
    
    var commonLang = require("i18n!nls/commons");
    var docsLang = require('i18n!docs/nls/docs');

    var lang = {
    		'승인대기문서' : docsLang['승인 대기 문서'],
    		'등록대기문서' : docsLang['등록 대기 문서'],
    		'최근열람문서' : docsLang['최근 열람 문서'],
    		'승인대기문서설명' : docsLang['승인대기 문서 홈'],
    		'등록대기문서설명' : docsLang['등록대기 문서 홈'],
    		'최근열람문서설명' : docsLang['최근열람 문서 홈']
    };

    return BaseDocsView.extend({

        events: {
            "click #home_register_waiting_doclist .btn-toggle-desc" : "_toggleRegisterWaitingDesc",
            "click #home_recent_viewed_doclist .btn-toggle-desc" : "_toggleRecentViewedDesc"
        },

        initialize: function (options) {
            BaseDocsView.prototype.initialize.apply(this, arguments);

        },

        render: function () {
            BaseDocsView.prototype.render.apply(this, arguments);
            
            this.$el.html(homeTmpl({
                lang : lang
            }));
            this._renderTodoList();
            this._renderWaitingList();
            this._renderRecentList();
            return this;
        },

        _renderTodoList: function(){
            var todoListView = new TodoListView({folderType : "approvewaiting"});
            this.$el.find('#home_approval_waiting_doclist').find('.dashboard_box').append(todoListView.render().el);
        },

        _renderWaitingList: function(){
            var columns =  {
                    '등록요청일' : docsLang['등록 요청일'],
                    '제목': docsLang['제목'],
                    '등록자' : docsLang['등록자'],
                    '상태' : docsLang['상태'],
                    '문서위치' : docsLang['위치'],
                    '문서번호': docsLang['문서번호'],
                    'count': 6
            };
            var HomeWaitingDocList = Backbone.Collection.extend({
                model: DocListItemModel,
                initialize: function(options){
                    this.folderType = options.folderType;
                },
                url: function() {
                    return "/api/docs/folder/registwaiting?offset=5";
                }
            });

            var listView = new BaseDocsListView({
                collection : new HomeWaitingDocList({folderType : "registwaiting"}),
                columns : columns
            });
            this.$el.find('#home_register_waiting_doclist').find('div.dataTables_wrapper').append(listView.render().el);
        },

        _renderRecentList: function(){
            var columns =  {
        		'등록일' : commonLang['등록일'],
                '제목': docsLang['제목'],
                '등록자' : docsLang['등록자'],
                '문서위치' : docsLang['위치'],
                '문서번호': docsLang['문서번호'],
                'count': 5
            };

            var HomeRecentDocList = Backbone.Collection.extend({
                model: DocListItemModel,
                initialize: function(options){
                    this.folderType = options.folderType;
                },
                url: function() {
                    return "/api/docs/folder/latestread?offset=10";
                }
            });

            var listView = new BaseDocsListView({
                collection : new HomeRecentDocList({folderType : "latestread"}),
                columns : columns
            });
            this.$el.find('#home_recent_viewed_doclist').find('div.dataTables_wrapper').append(listView.render().el);
        },

        _renderSide: function (layoutView) {
            this.sideView = new HomeSide({});
            layoutView.getSideElement().empty().append(this.sideView.el);
            this.sideView.render();
        },

        _toggleRegisterWaitingDesc : function(e) {
            if (!this.registerWaitingDescBackdropView) {
                this.registerWaitingDescBackdropView = this._bindBackdrop($(e.currentTarget));
            }
        },

        _toggleRecentViewedDesc : function(e) {
            if (!this.recentViewedDescBackdropView) {
                this.recentViewedDescBackdropView = this._bindBackdrop($(e.currentTarget));
            }
        },

        _bindBackdrop: function ($currentTarget) {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = $currentTarget.find(".tooltip-desc");
            backdropView.linkBackdrop($currentTarget);
            return backdropView;
        },
    });
});
