define("approval/views/doc_file_download", function(require) {
	var $ = require("jquery");
	var _ = require("underscore");
	var Backbone = require("backbone");
	var GO = require("app");

	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
	var approvalLang = require("i18n!approval/nls/approval");
    require("jquery.filedownload");
	require("jquery.cookie");
    
    var DocumentFileDownload = Backbone.View.extend({
        
        initialize: function(options) {
            this.$appendTarget = options.appendTarget;
            /**
             * 현재 view가 그려진 이후에도, 콜렉션 fetch URL은 계속 바뀔 수 있다. <br>
             * 이를 동적으로 반영하기 위해 값이 아닌 메소드를 캐시함
             */
            this.getDownloadURL = options.getDownloadURL;
            this.showDownloadBtn = options.showDownloadBtn;
            this.hideWhenDeletedDeptRcvDoc = options.hideWhenDeletedDeptRcvDoc;
        },
        
        render: function() {
            var tmpl = [];
            if (this.showDownloadBtn) {
            	if (!this.hideWhenDeletedDeptRcvDoc) {
            		tmpl.push('<a id="downloadDoc" class="btn_tool" data-role="button">');
            		tmpl.push('  <span class="ic_toolbar download"></span>  <span class="txt">{{lang.다운로드}}</span>')
            		tmpl.push('</a>');            		
            	}
            }
            tmpl.push('<a id="hiddenDownloadDoc" data-role="button" href="" style="display:none"></a>');
            tmpl.push('<form id="download_doc_form" method="POST"><input type="hidden" value="" name="downloadTokenId" id="downloadTokenId"/></form>');
            tmpl.push('<iframe name="ifm_download_doc_form" id="ifm_download_doc_form" style="border:0px;width:0px;height:0px;"></iframe>');
            
            this.$appendTarget.append(Hogan.compile(tmpl.join('')).render({
                lang: {
                    '다운로드' : commonLang['다운로드']
                }
            }));
            
            this.$appendTarget.find('a#downloadDoc').bind('click', $.proxy(this.download, this));
        },
        
        remove: function() {
            this.$appendTarget.find('#downloadDoc').remove();
        },
        
        download: function(e) {
        	var self = this;
            e.preventDefault();
            this.preloader = $.goPreloader();
            $.fileDownload(location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + GO.contextRoot + this.getDownloadURL, {
                    successCallback: function (url) {
                        self.preloader.release();
                    },
                    failCallback: function (html, url) {
                        $.goAlert(adminLang["파일 다운로드에 실패하였습니다."]);
                        self.preloader.release();
                    }
                }
            );
            $('#download_doc_form').attr('target','ifm_download_doc_form');
            return false;
        },

    });
    
    return DocumentFileDownload;
});