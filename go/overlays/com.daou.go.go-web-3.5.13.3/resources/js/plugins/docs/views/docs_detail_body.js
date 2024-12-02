define('docs/views/docs_detail_body', function(require) {
	require('go-fancybox');

	var GO = require("app");
	var Hogan = require("hogan");
    var Backbone = require('backbone');

    var bodyTmpl = require("hgn!docs/templates/docs_detail_body");
    
    var docsModel = require("docs/models/docs_doc_item");

    var DocsAttachesView = require('docs/views/docs_attaches');
    
    var approvalLang = require("i18n!approval/nls/approval");
    var commonLang = require('i18n!nls/commons');
    var docsLang = require("i18n!docs/nls/docs");

    var VesionsCollection = Backbone.Collection.extend({

        model : docsModel,

        initialize : function(options){
            this.docsId = options.docsId;
        },

        url: function () {
            return GO.contextRoot + "api/docs/"+this.docsId+"/versions";
        }

    });

    var VersionItemTmpl = Hogan.compile(
        '<li>' +
            '<span class="bar"></span>' +
            '<span class="ic ic_ver"></span>' +
            '<span class="bar_ver {{#current}}current{{/current}}">{{version}}</span>' +
            '<a class="txt" data-id="{{docsId}}" id="docsReason">&nbsp;{{reason}}</a>' +
            '<div class="sub_info">' +
                '<span class="member">' +
                    '<img src="{{thumbnail}}" alt="{{creatorName}} {{creatorPosition}}" title="{{creatorName}} {{creatorPosition}}">' +
                    '<span class="txt">&nbsp;{{creatorName}} {{creatorPosition}}</span>' +
                '</span>' +
                '<span class="date">&nbsp;{{completeDate}}</span>' +
            '</div>' +
        '</li>'
    );
    
    var lang = {
    		"자세히" : commonLang["자세히"],
    		"닫기" : commonLang["닫기"],
    		"열기" : commonLang["열기"],
    		"등록자" : docsLang["등록자"],
    		"보존연한" : docsLang["보존연한"],
    		"등록일" : commonLang["등록일"],
    		"문서상태" : docsLang["문서상태"],
    		"승인대기" : docsLang["승인대기"],
    		"변경사유" : docsLang["변경 사유"],
    		"반려" : docsLang["반려"],
    		"문서버전" : docsLang["문서버전"],
    		"문서번호" : docsLang["문서번호"],
    		"상세내용" : docsLang["상세내용"],
    		"첨부파일" : commonLang["첨부파일"],
    		"버전" : docsLang["버전"]
    	};

    var DocsDetailBodyView =  Backbone.View.extend({

        events: {

            "click [data-action='docsInfoArrow']" : "toggleDocsInfo",
            "click [data-action='docsContentArrow']" : "toggleDocsContent",
            "click [data-action='docsReasonArrow']" : "toggleDocsReason",
            "click [data-action='docsAttachArrow']" : "toggleDocsAttach",
            "click [data-action='docsVersionArrow']" : "toggleDocsVersion"

        },

        initialize: function (options) {
            this.options = options;
            this.docsModel = this.options.docsModel;
            this.useDocNum = this.options.useDocNum;
            this.isPrint = this.options.isPrint;
            this.changeDocsContent = this.options.changeDocsContent;
            this.isNeedState = this.docsModel.isNeedState();
            this.isAppendVersion = false;
        },

        render: function () {
            this.$el.html(bodyTmpl({
            	lang: lang,
                docsModel : this.docsModel.toJSON(),
                preserveYear : this.makePreserveYear(),
                completeDate : this.docsModel.getCompleteDate(),
                needState : this.docsModel.isNeedState(),
                wait : this.docsModel.getDocsStatus() == "APPROVEWAITING",
                reject : this.docsModel.getDocsStatus() == "REJECT",
                version : this.makeVersion(),
                attachSize : this.docsModel.getAttaches().length,
                versionSize : this.docsModel.getDocsCount(),
                useDocNum : this.useDocNum,
                isPrint : this.isPrint,
                files : this.isPrint ? this.docsModel.getFiles() : null,
                images : this.isPrint ? this.docsModel.getImages() : null,
        		isChangeDocsContent : this.changeDocsContent
            }));
            if(!this.docsModel.isNeedState() && !this.isPrint && this.changeDocsContent){
                this._renderVersions();
            }
            return this;
        },

        _renderVersions : function(){

            var self = this;
            this.versions = new VesionsCollection({docsId : this.docsModel.id});
            this.versions.fetch({
                statusCode: {
                    400 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    403 : function() { GO.util.error('403', { "msgCode": "400-common"}); },
                    404 : function() { GO.util.error('404', { "msgCode": "400-common"}); },
                    500 : function() { GO.util.error('500'); }
                },

                success : function(collection){
                    collection.each(function(docsModel) {
                        var versionItem = VersionItemTmpl.render({
                            current : self.docsModel.id == docsModel.id,
                            version : self.makeVersion(docsModel.getVersion()),
                            docsId : docsModel.id,
                            reason : docsModel.getReason(),
                            thumbnail : docsModel.getThumbnail(),
                            creatorName : docsModel.getCreatorName(),
                            creatorPosition : docsModel.getCreatorPosition(),
                            completeDate : docsModel.getCompleteDate()
                        });
                        this.$('#versionWrap').append(versionItem);
                    });
                    self.isAppendVersion = true;
                }
            });
        },

        renderAttachView : function(){

            if(this.docsModel.getAttaches().length > 0) {
                DocsAttachesView.render({
                    el : '#attaches'+this.docsModel.id,
                    attaches : this.docsModel.getAttaches(),
                    docsId : this.docsModel.id
                });
                DocsAttachesView.resize(this.$el);

                $('.fancybox-thumbs').goFancybox();
            }

        },

        makePreserveYear : function(){
            return (this.docsModel.getDocsYear() == 0) ? approvalLang['영구'] : this.docsModel.getDocsYear() + approvalLang['년'];
        },

        makeVersion : function(version){
            if(!version){
                version = this.docsModel.getVersion();
            }
            return "VER " + version;
        },

        toggleEl : function(e, el){
            var target = $(e.currentTarget);
            var state = "";
            if(!target.hasClass("ic")){
            	target = target.siblings(".ic");
            }
            var state = target.attr('class');
        	if(state.indexOf("close") != -1){
        		//현재 열려있음
        		target.removeClass("ic_arrow_close").addClass("ic_arrow_open");
        		target.attr("title", commonLang["열기"]);
        		el.hide();
        	}else{
        		target.removeClass("ic_arrow_open").addClass("ic_arrow_close");
        		target.attr("title", commonLang["닫기"]);
        		el.show();
                if(!this.isAppendVersion){
                	if(!this.docsModel.isNeedState() && !this.isPrint){
                		this._renderVersions();
                	}
                }
        	}
        },

        toggleDocsInfo : function(e){
            this.toggleEl(e,$('#docsInfoLayout'));
        },

        toggleDocsContent : function(e){
            this.toggleEl(e,$('#docsContentLayout'));
        },

        toggleDocsReason : function(e){
            this.toggleEl(e,$('#docsReasonLayout'));
        },

        toggleDocsAttach : function(e){
            this.toggleEl(e,$('#docsAttachLayout'));
        },

        toggleDocsVersion : function(e){
            this.toggleEl(e,$('#docsVersionLayout'));
        }

    });

    return DocsDetailBodyView;
});