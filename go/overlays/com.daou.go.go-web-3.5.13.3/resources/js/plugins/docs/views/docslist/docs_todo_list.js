define("docs/views/docslist/docs_todo_list", function(require){

    var Backbone = require("backbone");
    var DocListCardItemView = require("docs/views/docslist/doclist_card_item");
    var DocListItemModel = require("docs/models/docs_doc_item");
    var HomeListCardTpl = require("hgn!approval/templates/home_card_list");
    var docsLang = require("i18n!docs/nls/docs");

    var HomeToDodocList = Backbone.Collection.extend({
        model: DocListItemModel,
        initialize: function(options){
            this.folderType = options.folderType;
        },
        url: function() {
            return "/api/docs/folder/approvewaiting?offset=5";
        }
    });

    var HomeToDodocListView = Backbone.View.extend({
        initialize: function(options) {
            this.options = options || {};
            this.collection = new HomeToDodocList({folderType : options.folderType});
            this.collection.bind('reset', this.generateList, this);
            this.collection.fetch({reset:true});
        },
        events: {
            // 이벤트가 있으면 추가
        },
        render: function() {
            var lang = {};
            this.$el.html(HomeListCardTpl({
                lang: lang
            }));
            return this;
        },

        generateList: function() {
            var viewEl = this.$el;
            viewEl.find('div.card_item_wrapper').empty();
            var listType = "docs";
            var self = this;
            this.collection.each(function(doc){
                doc.folderType = self.collection.folderType;
                var docListCardItemView = new DocListCardItemView({
                    listType : listType,
                    model: doc
                });
                viewEl.find('div.card_item_wrapper').append(docListCardItemView.render().el);
            }, this);
            if (this.collection.length == 0) {
                $('div.dashboard_box').html("<p class='desc'>" + docsLang['문서없음']  + "</p>");
            }
        }

    });

    return HomeToDodocListView;

});