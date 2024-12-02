// 문서목록에서 개별 문서에 대한 View
define('docs/views/docslist/doclist_card_item' , function(require) {

    var DocListItemTpl = require("hgn!docs/templates/docslist/doclist_card_item");
    var Backbone = require("backbone");

    var docsLang = require('i18n!docs/nls/docs');
    
    var lang = {
    		'위치' : docsLang['위치'],
    		'등록자' : docsLang['등록자'],
    		'등록일' : docsLang['등록일'],
    		'승인하기' : docsLang['승인하기']
    };

    var DocListCardView = Backbone.View.extend({

        tagName : 'section',
        className : 'card_item survey_home_card approval_home_card',

        events: {
            'click div.card_subject' : 'showUrl',
            'click a.btn_lead' : 'showUrl'
        },

        initialize: function(options) {
            this.options = options || {};
        },

        render: function() {
            var doc = {
                id: this.model.getDocsId(),
                docsInfoId : this.model.getDocsInfoId(),
                title: this.model.getTitle(),
                writer: this.model.getCreatorName(),
                writerPositionName : this.model.getCreatorPositionName(),
                writeDate : this.model.getRequestDate(),
                folderPath : this.model.getFolderPath()
            };
            this.$el.html(DocListItemTpl({
                doc : doc,
                lang : lang
            }));
            return this;
        },

        showUrl: function(e){
            var docsId = $(e.currentTarget).attr('data-id');
            sessionStorage.setItem('list-folderType', this.model.folderType);
            GO.router.navigate("docs/detail/" + docsId, true);
        }
    });

    return DocListCardView;
});