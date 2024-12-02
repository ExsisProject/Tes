define("docs/views/docs_attach" ,function(require){
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
    var GO = require("app");
    
	var commonLang = require("i18n!nls/commons");
	var docsLang = require("i18n!docs/nls/docs");
	var approvalLang = require("i18n!approval/nls/approval");
	
	var AttachTpl = require("hgn!docs/templates/docs_attach");
    
    var lang = {
    		'save' : commonLang['저장'],
			'no_attach_file' : approvalLang['첨부 파일이 없습니다.']
    };
    
    var DocsAttachCollection = Backbone.Collection.extend({
	    
		model: Backbone.Model.extend(),
		url: function() {
			return ['/api/docs', this.docId , 'attach'].join('/');
		},
		
		initialize: function(options) {
			this.docId = options.docId;
		}
	});

    return Backbone.View.extend({

    	initialize: function(options) {
			this.docId = options.docId;		
			this.collection = new DocsAttachCollection({docId: this.docId});
		},

		render : function(docId){
    	    this.collection.fetch({
    	        success: this._onFetchSuccess,
    	        error: this._onFetchFail
    	    });
    	    
			return this;
		},
		_onFetchSuccess: function(collection, response, option) {
		    var self = this,
                files = [],
                html;
            
            $.each(collection.toJSON(), function(k,v) {
                var reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)","gi");
                var ext = v.extention.toLowerCase();
                v.size = GO.util.getHumanizedFileSize(v.size);
                v.extention = reExt.test(ext) ? ext : 'def';
                v.docId = self.docId;
                files.push(v);
            });
            
            html = AttachTpl({
                contextRoot: GO.config("contextRoot"),
				docId : collection.docId,
                dataset : files,
                lang : lang
            })
            
		    $.goPopup({
                'pclass' : 'layer_normal layer_list_attach',
                'header' : approvalLang['첨부 파일 목록'],
                'modal' : true,
                'width' : "400px",
                'contents' : html,
                'buttons' : [
                    {
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm',
                        'callback' : function() {}
                    }
                 ]
            });
		},
		
		_onFetchFail: function(collection, response, option) {
		    $.goMessage(commonLang['권한이 없습니다.']);
		}
    });

    //return AttachFileShowView;
});