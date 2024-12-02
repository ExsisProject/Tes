// 결재문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval",
    "jquery.cookie"
], 
function(
    $, 
    _, 
    Backbone, 
    GO,
    commonLang,
    adminLang,
    approvalLang
) {
    
    return Backbone.View.extend({
        
        initialize: function(options) {
            this.$appendTarget = options.appendTarget;
            /**
             * 현재 view가 그려진 이후에도, 콜렉션 fetch URL은 계속 바뀔 수 있다. <br>
             * 이를 동적으로 반영하기 위해 값이 아닌 메소드를 캐시함
             */
            this.getDownloadURL = options.getDownloadURL;
        },
        
        render: function() {
            var tmpl = [];
            tmpl.push('<a id="downloadListCsv" class="btn_tool" data-role="button">');
            tmpl.push('  <span class="ic_toolbar download"></span>  <span class="txt">{{lang.목록 다운로드}}</span>')
            tmpl.push('</a>');
            tmpl.push('<a id="hiddenDownloadListCsv" type="text/csv" data-role="button" href="" style="display:none"></a>');
            tmpl.push('<form id="download_csv_form" method="POST"><input type="hidden" value="" name="downloadTokenId" id="downloadTokenId"/></form>');
            tmpl.push('<iframe name="ifm_download_csv_form" id="ifm_download_csv_form" style="border:0px;width:0px;height:0px;"></iframe>');
            
            this.$appendTarget.append(Hogan.compile(tmpl.join('')).render({
                lang: {
                    '목록 다운로드' : adminLang['목록 다운로드']
                }
            }));
            
            this.$appendTarget.find('a#downloadListCsv').bind('click', $.proxy(this.download, this));
        },
        
        remove: function() {
            this.$appendTarget.find('#downloadListCsv').remove();
        },
        
        download: function(e) {
        	var self = this;
            e.preventDefault();
            $('#download_csv_form').attr('action', location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + this.getDownloadURL());
            var token = new Date().getTime(); //use the current timestamp as the token value
            $('#downloadTokenId').val(token);
            this.preloader = $.goPreloader();
            this.fileDownloadCheckTimer = window.setInterval(function () {
              var cookieValue = $.cookie('downloadTokenId');
              if (cookieValue == token)
            	  self.finishDownload();
            }, 1000);
            $('#download_csv_form').attr('target','ifm_download_csv_form');
            $('#download_csv_form').submit();
            return false;
        },
        
        finishDownload : function(){
        	window.clearInterval(this.fileDownloadCheckTimer);
            this.preloader.release();
        }
    });
});
