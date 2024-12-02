define('docs/views/detail', function(require) {

    var BaseDocsView = require("docs/views/base_docs");
    var ContentTopView = require('docs/views/content_top');
    var folderModel = require("docs/models/doc_folder_info");
    var docsModel = require("docs/models/docs_doc_item");
    var detailTmpl = require("hgn!docs/templates/detail");
    var DocsActionView = require("docs/views/docs_action");
    var DocsBodyView = require("docs/views/docs_detail_body");
    var DocsReplyView = require("docs/views/docs_reply");
    var DocsRejectView = require("docs/views/docs_reject");
    var docsLang = require("i18n!docs/nls/docs");
    var HomeSide = require("docs/views/side");

    return BaseDocsView.extend({

        events: {
            "click a#docsReason" : "setDocsContents"
        },

        initialize: function (options) {
            BaseDocsView.prototype.initialize.apply(this, arguments);
            this.options = options;
            this.docsId = this.options.docsId;
        },

        dataFetch : function() {
            var fetchFolder = $.Deferred();
            var fetchDocs = $.Deferred();
            var self = this;

            var folderType = sessionStorage.getItem('list-folderType');

            if(this.docsId){
                this.docsModel = new docsModel({id : this.docsId});
                if(folderType != "undefined" && folderType != null){
                    this.docsModel.folderType = folderType;
                    this.docsModel.type = "folderType";
                }
                this.docsModel.fetch({
                    statusCode: {
                        400 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                        403 : function() { GO.util.error('403', { "msgCode": "400-common"}); },
                        404 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                        500 : function() { GO.util.error('500'); }
                    }
                }).done($.proxy(function(){
                    fetchDocs.resolve();
                    this.folderId = this.docsModel.getFolderId();
                    this.folderModel = new folderModel({id: this.folderId});
                    this.folderModel.fetch({
                        statusCode: {
                            400: function () {
                                GO.util.error('404', {"msgCode": "400-common"});
                            },
                            403: function () {
                                GO.util.error('403', {"msgCode": "400-common"});
                            },
                            404: function () {
                                GO.util.error('404', {"msgCode": "400-common"});
                            },
                            500: function () {
                                GO.util.error('500');
                            }
                        }
                    }).done(function () {
                        fetchFolder.resolve();
                    });
                },this));
            }else{
                fetchDocs.resolve();
                fetchFolder.resolve();
            }

            var deferred = $.Deferred();
            $.when(fetchDocs,fetchFolder).done(function() {
                deferred.resolve(self);
            });

            return deferred;
        },

        render: function () {
            BaseDocsView.prototype.render.apply(this, arguments);
            GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
            $(document.body).addClass("do_docs");

            this.$el.html(detailTmpl({

            }));
            this._renderAction();
            this._renderBody();
            this.$('#rejectArea').hide();
            if(this.docsModel.isNeedState()){
                $('#bottomArea').hide();
                if(this.docsModel.getDocsStatus() == "REJECT"){
                    $('#rejectArea').show();
                    this._renderReject();
                }
            }else{
                $('#bottomArea').show();
                this._renderReply();
            }
            GO.EventEmitter.trigger('common','layout:clearOverlay',true);
            return this;
        },

        renderForPrint: function(){
            $(document.body).addClass("do_docs");
            this.$el.html(detailTmpl({
                isPrint : true
            }));
            this._renderBody(true);
            return this;
        },

        _renderReject: function() {
            var self = this;
            this.rejectView = new DocsRejectView({
                docsModel : this.docsModel
            });
            this.rejectView.rejectDataFetch().then(function() {
                self.$('#rejectArea').html(self.rejectView.render().el);
            });
        },

        _renderReply: function() {
            this.replyView = new DocsReplyView({
                docsModel : this.docsModel
            });
            this.$('#bottomArea').html(this.replyView.render().el);
        },

        _renderBody: function(isPrint, changeDocsContent) {
            this.bodyView = new DocsBodyView({
                docsModel : this.docsModel,
                useDocNum : this.folderModel.useDocNum(),
                isPrint : isPrint ? isPrint : false,
        		changeDocsContent : changeDocsContent ? changeDocsContent : false
            });
            this.$('#bodyArea').html(this.bodyView.render().el);
            if(!isPrint){
                this.bodyView.renderAttachView();
            }
        },

        _renderAction: function() {
        	var isRejectedAndCreator = (this.docsModel.get('creatorId') == GO.session("id")) && (this.docsModel.getDocsStatus() == "REJECT") ? true : false;
        	
            this.actionView = new DocsActionView({
                folderId : this.folderId,
                isManageable : this.folderModel.isManagable(),
                isEditable: this.folderModel.isWritable(),
                isDeletable: this.folderModel.isRemovable() || isRejectedAndCreator,
                docsModel : this.docsModel
            });
            this.$('#actionArea').html(this.actionView.render().el);
        },

        isNormalFolderType: function(){
            if(this.docsModel.folderType == undefined || this.docsModel.folderType == "undefined"){
                return true;
            }
            return false;
        },

        getFolderName: function () {
            if(this.docsModel.folderType == "approvewaiting"){
                return docsLang["승인 대기 문서"];
            }else if(this.docsModel.folderType == "registwaiting"){
                return docsLang["등록 대기 문서"];
            }else if(this.docsModel.folderType == "latestread"){
                return docsLang["최근 열람 문서"];
            }else if(this.docsModel.folderType == "latestupdate"){
                return docsLang["최근 업데이트 문서"];
            }else{
                return this.folderModel.getName();
            }
        },

        renderContentTop: function(layoutView){
            var self = this;
            var contentTopView = new ContentTopView({});

            layoutView.getContentElement().html(contentTopView.el);
            contentTopView.render();
            layoutView.setContent(self);
            var title = "<span class='txt'>"+GO.util.escapeHtml(this.getFolderName())+"</span>";
            contentTopView.setTitle(title);
            if(this.isNormalFolderType()){
                var isFavorite = this.folderModel.isFavorite();
                contentTopView.setFavoriteTmpl(isFavorite, self.folderModel.get("id"));
            }
        },

        setDocsContents : function(e){
        	GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
        	
            var docsId = $(e.currentTarget).attr('data-id');
            this.docsId = docsId;
            this.actionView.setPrintDocsId(this.docsId);
            var self = this;
            this.dataFetch().then(function(){
                self._renderBody(false, true);
                self.replyView.refreshReadCount(self.docsModel.getReadCount());
            });
            $(document).scrollTop(0);
            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
        },

        _renderSide: function (layoutView) {
            this.sideView = new HomeSide({});
            if(!layoutView.getSideElement().find(".docs_side").length){

                layoutView.getSideElement().empty().append(this.sideView.el);
                this.sideView.render();
            }else{
                this.sideView.refreshWaitingCount();
            }
        }
    });
});