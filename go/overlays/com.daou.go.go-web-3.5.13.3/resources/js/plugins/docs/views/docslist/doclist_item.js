// 문서목록에서 개별 문서에 대한 View

define("docs/views/docslist/doclist_item" ,function(require){
	var Backbone = require("backbone");

	var AttachFileView = require("docs/views/docs_attach");
	var ProfileCardView = require("views/profile_card");
	
    var DocListItemTpl = require("hgn!docs/templates/docslist/doclist_item");
    var docsLang = require('i18n!docs/nls/docs');
    var lang = {
    		
    };

    var DocListView = Backbone.View.extend({

        tagName: 'tr',
        events: {
            'click td[data-id]' : 'showUrl',
            'click a#attach' : 'showAttach',
            'click a#writer span.txt': 'showUserProfile'
        },

        initialize: function(options) {
            this.options = options || {};
            this.columns = this.options.columns;
            this.model = this.options.model;
            this.isCheckboxVisible = _.isBoolean(this.options.isCheckboxVisible) ? this.options.isCheckboxVisible : false;
        },

        render: function() {
            var doc = {
                id: this.model.getDocsId(),
                docsInfoId : this.model.getDocsInfoId(),
                docsId : this.model.getDocsId(),
                folderId : this.model.getFolderId(),
                title: this.model.getTitle(),
                writer: this.model.getCreatorName(),
                writerId: this.model.getCreatorId(),
                writerPositionName : this.model.getCreatorPositionName(),
                writeDate : this.model.getRequestDate(),
                state : this.model.getDocsStatus(),
                stateName : this.model.getDocsStatusName(),
                statusClass : this.model.getDocsStatusClass(),
                folderPath : this.model.getFolderPath(),
                readDate : this.model.getReadDate(),
                completDate : this.model.getCompleteDate(),
                hasAttach: this.model.hasAttach(),
                attachCount : this.model.getAttachCount(),
                folderName : this.model.getFolderName(),
                commentCount : this.model.getCommentCount(),
                hasComment : this.model.hasComment(),
                docNum : this.model.getDocNum()
            };
            var isNew = this.model.get("completDate") ? GO.util.isCurrentDate(this.model.get("completDate"), 1) : false;
            
            var folderType = this.model.folderType;
            
            if(folderType == "registwaiting" && doc.state == "APPROVEWAITING"){
            	this.isCheckboxVisible = false;
            }
            var tpl = DocListItemTpl({
                doc : doc,
                columns : this.columns,
                isCheckboxVisible : this.isCheckboxVisible,
                isNew : isNew
            });
            this.$el.html(tpl);
            this.$el.css("cursor", "pointer");
            return this;
        },

        showUrl: function(e){
            var docsId = $(e.currentTarget).attr('data-id');
            var state = $(e.currentTarget).parent().find(".state").text();

            sessionStorage.setItem('list-folderType', undefined);

            if(docsId && state == docsLang['임시저장']){
                var url = "docs/edit/" + docsId;
                GO.router.navigate(url, true);
            }else {

                var listUrl = GO.router.getUrl();
                var baseUrl = listUrl.substring(0,listUrl.indexOf("?"));
                sessionStorage.setItem('list-history-baseUrl',baseUrl);
                sessionStorage.setItem('list-history-pageNo',GO.router.getSearch().page ? GO.router.getSearch().page : 0 );
                sessionStorage.setItem('list-history-pageSize', GO.router.getSearch().offset ? GO.router.getSearch().offset : 20);
                sessionStorage.setItem('list-history-property', GO.router.getSearch().property ? GO.router.getSearch().property : '');
                sessionStorage.setItem('list-history-direction', GO.router.getSearch().direction ? GO.router.getSearch().direction : '');
                sessionStorage.setItem('list-history-searchtype', GO.router.getSearch().searchtype ? GO.router.getSearch().searchtype : '');
                sessionStorage.setItem('list-history-keyword', GO.router.getSearch().keyword ? GO.router.getSearch().keyword : '');
                sessionStorage.setItem('list-history-duration', GO.router.getSearch().duration ? GO.router.getSearch().duration : '');
                sessionStorage.setItem('list-history-fromDate', GO.router.getSearch().fromDate ? GO.router.getSearch().fromDate : '');
                sessionStorage.setItem('list-history-toDate', GO.router.getSearch().toDate ? GO.router.getSearch().toDate : '');
                sessionStorage.setItem('list-folderType', this.model.folderType);

                var searchParam = $.param(GO.router.getSearch());
                var navigateUrl = "docs/detail/" + docsId + (searchParam ? "?" + searchParam : "");

                GO.router.navigate(navigateUrl, true);
            }
            console.log(searchParam);
        },
        // 첨부파일 팝업레이어
		showAttach: function(e) {
			e.stopPropagation();
			var attachFileView = new AttachFileView({
				docId : this.model.getDocsId()
			});

			attachFileView.render();
		},
		// 사용자프로필 팝업레이어
		showUserProfile: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var userId = this.model.getCreatorId();
			if (userId) {
				ProfileCardView.render(userId, e.currentTarget);
			}
		},
    });

    return DocListView;
});