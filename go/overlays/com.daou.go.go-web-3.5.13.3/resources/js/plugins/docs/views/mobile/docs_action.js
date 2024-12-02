define('docs/views/mobile/docs_action', function(require) {

    var Backbone = require('backbone');
    var docsLang = require("i18n!docs/nls/docs");
    var approvalLang = require("i18n!approval/nls/approval");
    var commonLang = require('i18n!nls/commons');
    var HeaderToolbarView = require("views/mobile/header_toolbar");

	var lang = {
	    "버전" : docsLang["버전"],
        "승인" : docsLang["승인"],
        "반려" : docsLang["반려"],
        "승인선택" : approvalLang["승인선택"],
        "첨부파일" : commonLang["첨부파일"],
        "댓글" : commonLang["댓글"],
        "목록" : commonLang["목록"]
	};
	
	var DocActionView = Backbone.View.extend({
		initialize: function(options) {
			this.options = options || {};
			this.docsModel = this.options.model;
			this.folderModel = this.options.folderModel;
			this.folderInfo = this.options.folderInfo;
			this.docsId = this.docsModel.id;
			this.headerBindEvent();
		},

        headerBindEvent : function() {
            GO.EventEmitter.off("trigger-action");
            GO.EventEmitter.on('trigger-action','docs-attach', this.goAttaches, this);
            GO.EventEmitter.on('trigger-action','docs-version', this.goVersion, this);
            GO.EventEmitter.on('trigger-action','docs-permit', this.doPermit, this);
            GO.EventEmitter.on('trigger-action','docs-reject', this.doReject, this);
            GO.EventEmitter.on('trigger-action','docs-reply', this.replyView, this);
        },
		render : function() {
            var toolBarData = {
                isPrev : true,
                actionMenu : this.getUseMenus()
            };
            HeaderToolbarView.render(toolBarData);

			return this;
		},
        getUseMenus : function(){
            var menus = {
                "첨부파일": {
                    id: "docs-attach",
                    text: lang.첨부파일,
                    triggerFunc: "docs-attach",
                    cls : 'btn_comments',
                    commentsCount : this.docsModel.getAttaches().length
                },
                "버전": {
                    id: "docs-version",
                    text: lang.버전,
                    triggerFunc: "docs-version",
                    cls : 'btn_comments',
                    commentsCount : this.docsModel.getDocsCount()
                },
                "승인": {
                    id: "docs-permit",
                    text: lang.승인,
                    triggerFunc: "docs-permit"
                },
                "반려": {
                    id: "docs-reject",
                    text: lang.반려,
                    triggerFunc: "docs-reject"
                },
                "댓글": {
                    id: "docs-reply",
                    text: lang.댓글,
                    triggerFunc: "docs-reply",
                    cls : 'btn_comments',
                    commentsCount : this.docsModel.getCommentCount()
                }
            };
            var useMenuList = [];
            if(this.docsModel.getAttaches().length > 0) {
                useMenuList.push(menus.첨부파일);
            }
            if(this.isComplete()) {
                useMenuList.push(menus.버전);
            }
            if(this.isApproveWaiting() && this.folderModel.isManagable()){
                useMenuList.push(menus.승인);
                useMenuList.push(menus.반려);
            }
            if(!this.isApproveWaiting() && !this.isNeedState()){
                useMenuList.push(menus.댓글);
            }
            return useMenuList;
        },
        isComplete : function() {
            return this.docsModel.getDocsStatus() == "COMPLETE";
        },
        isApproveWaiting : function() {
            return this.docsModel.getDocsStatus() == "APPROVEWAITING";
        },
        isNeedState : function(){
            return this.docsModel.isNeedState() || this.docsModel.getDocsStatus() == "TEMPSAVE";
        },
        goAttaches : function() {
            GO.router.navigate("/docs/attaches/" + this.docsModel.id, true);
        },
        goVersion : function() {
            GO.router.navigate("/docs/version/" + this.docsModel.id, true);
        },
        doPermit : function() {
            var self = this;
            if(confirm(docsLang["승인확인"])){
                var model = new Backbone.Model();
                model.id = self.docsId;
                model.url = GO.config('contextRoot') + 'api/docs/' + self.docsId + '/approved';
                model.save(null, {
                    type : 'PUT',
                    contentType: 'application/json',
                    success : function() {
                        GO.router.navigate("docs/detail/"+self.docsId, true);
                    }
                });
            }else{
                $("#selectAction").val('none');
            }
        },
        doReject : function() {
            var url = "/docs/reject/" + this.docsModel.id;
            GO.router.navigate(url, true);
        },
		doAction : function(e){
            var target = $(e.currentTarget);
            var action = target.attr("data-trigger");
			if(action == "docs-reject"){
                var url = "/docs/reject/" + this.docsModel.id;
                GO.router.navigate(url, true);
            }else if(action == "docs-permit"){
                var self = this;
                if(confirm(docsLang["승인확인"])){
                    var model = new Backbone.Model();
                    model.id = self.docsId;
                    model.url = GO.config('contextRoot') + 'api/docs/' + self.docsId + '/approved';
                    model.save(null, {
                        type : 'PUT',
                        contentType: 'application/json',
                        success : function() {
                            GO.router.navigate("docs/detail/"+self.docsId, true);
                        }
                    });
                }else{
                    $("#selectAction").val('none');
                }
            }
		},

        goToList: function(){
            var url = "/docs/folder/";
            if(this.folderInfo){
                 url += this.folderInfo;
            }else{
                 url += this.docsModel.getFolderId();
            }
            GO.router.navigate(url, true);
        },

        replyView : function(e){
            var url = "/docs/reply/" + this.docsModel.getDocsInfoId();
            GO.router.navigate(url, true);
        }
	});
	
	return DocActionView;
});