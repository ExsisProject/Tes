define("timeline/views/download_loading", function(require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var GO = require("app");

    var commonLang = require("i18n!nls/commons");
    var timelineLang= require("i18n!timeline/nls/timeline");

    require("jquery.cookie");
    require("jquery.go-preloader");

    var subMenuActive = false;

    var FileDownloadLoadingView = Backbone.View.extend({

        initialize: function(options) {
            this.$appendTarget = options.appendTarget;
            /**
             * 현재 view가 그려진 이후에도, 콜렉션 fetch URL은 계속 바뀔 수 있다. <br>
             * 이를 동적으로 반영하기 위해 값이 아닌 메소드를 캐시함
             */

            this.getDownloadURL = options.getDownloadURL;
            this.week = options.week;
        },

        render: function() {

            var tmpl = [];

            tmpl.push('<div class="btn_submenu">');
            tmpl.push('<a class="btn_tool btn_tool_multi" id="downloadFile">');
            tmpl.push('    <span class="ic_toolbar download"></span>');
            tmpl.push('    <span class="txt">{{lang.다운로드}}</span>');
            tmpl.push('</a>');

            tmpl.push('<span class="btn_func_more" id="submenuBtn" backdrop-toggle="true"  el-backdrop-link>');

            tmpl.push('<span class="ic ic_arrow_type3"></span>');
            tmpl.push('</span>');
            tmpl.push('<div class="array_option list_download" id="downloadSubMenu" style="display: none">');
            tmpl.push('<ul class="array_type">');
            tmpl.push('<li id="downloadFile_sub"><span>{{lang.항목다운로드}}</span></li>');
            tmpl.push('<li id="downloadFile_sub2"><span>{{lang.출퇴근다운로드}}</span></li>');
            tmpl.push('<li id="downloadFile_sub3"><span>{{lang.선택적근무시간다운로드}}</span></li>');
            tmpl.push('</ul>');
            tmpl.push('</div>');

            tmpl.push('<a id="hiddenDownloadFile" data-role="button" href="" style="display:none"></a>');
            tmpl.push('<form id="download_file_form" method="GET" style="display: none">');
            tmpl.push('<div id="download_file_form_div"> </div>');
            tmpl.push('<input type="hidden" value="" name="downloadTokenId" id="downloadTokenId"/></form>');
            tmpl.push('<iframe name="ifm_download_file_form" id="ifm_download_file_form" style="border:0px;width:0px;height:0px;"></iframe>');

            this.$appendTarget.append(Hogan.compile(tmpl.join('')).render({
                lang: {
                    '다운로드' : commonLang['목록 다운로드'],
                    '항목다운로드' : timelineLang['전체 항목 모두 다운로드'],
                    '출퇴근다운로드' : timelineLang['전체 출퇴근 시간 다운로드'],
                    '선택적근무시간다운로드' : timelineLang['선택적 근무시간 다운로드']
                }
            }));

            this.$appendTarget.find('a#downloadFile').bind('click', $.proxy(this.download, this));
            this.$appendTarget.find('li#downloadFile_sub').bind('click', $.proxy(this.download, this));
            this.$appendTarget.find('li#downloadFile_sub2').bind('click', $.proxy(this.downloadSub, this));
            this.$appendTarget.find('li#downloadFile_sub3').bind('click', $.proxy(this.downloadSelective, this));
            this.$appendTarget.find('span#submenuBtn').bind('click', $.proxy(this.submenuToogle, this));

            this.subMenuBarToogle();

        },
        submenuToogle:function(){
            if( this.week){
                return;
            }
            var submenu = this.$appendTarget.find('#downloadSubMenu');
            if(this.subMenuActive){
                submenu.css('display', 'none')
            } else{
                submenu.css('display', 'inline-block')
            }
            this.subMenuActive = !this.subMenuActive;
        },
        subMenuBarToogle:function(){

            if(this.week){
                this.$appendTarget.find('span#submenuBtn').css('display', 'none');
                this.$appendTarget.find('#downloadSubMenu').css('display','none');
                this.subMenuActive = false;
            }
            else{
                this.$appendTarget.find('span#submenuBtn').css('display', 'inline-block');
            }
        },
        updateGetDownloadUrl:function(url, week){
            this.getDownloadURL = url;
            this.week = week;
            this.subMenuBarToogle();
        },
        remove: function() {
            this.$appendTarget.find('#downloadFile').remove();
        },

        download: function(e) {
            e.preventDefault();
            this.downloadFile({'key':'excelType' , 'value':'NORMAL'});
            return false;
        },
        downloadSub: function(e) {
            e.preventDefault();
            this.downloadFile({'key':'excelType' , 'value':'CLOCKIN_OUT'});
            return false;
        },
        downloadSelective: function(e) {
            e.preventDefault();
            this.downloadFile({'key':'excelType' , 'value':'SELECTIVE'});
            return false;
        },

        downloadFile:function(param){

            this.$appendTarget.find('#downloadSubMenu').css('display','none');
            this.subMenuActive = false;

            var self = this;
            var downloadUrl = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '') + GO.contextRoot + this.getDownloadURL.split('?')[0];

            $('#download_file_form').attr('action', downloadUrl);
            var token = new Date().getTime();
            $('#downloadTokenId').val(token);

            var params = this.parseParams( this.getDownloadURL.split('?')[1] || '' );

            $('#download_file_form_div').empty();
            _.each(params, function(value, key){
                $('#download_file_form_div').append('<input type="hidden" name="' + key +'" value="' +value+ '">');
            });

            if(param){
                $('#download_file_form_div').append('<input type="hidden" name="' + param.key +'" value="' +param.value+ '">');
            }

            preloader = $.goPreloader();
            this.fileDownloadCheckTimer = window.setInterval(function () {
                var cookieValue = $.cookie('downloadTokenId');
                if (cookieValue == token){
                    self.finishDownload();
                }
            }, 1000);
            $('#download_file_form').attr('target','ifm_download_file_form');
            $('#download_file_form').submit();

        },

        finishDownload : function(){
            window.clearInterval(this.fileDownloadCheckTimer);
            preloader.release();
        },

        parseParams : function(str) {
            return str.split('&').reduce(function (params, param) {
                var paramSplit = param.split('=').map(function (value) {
                    return decodeURIComponent(value.replace(/\+/g, ' '));
                });
                params[paramSplit[0]] = paramSplit[1];
                return params;
            }, {})
        }
    });

    return FileDownloadLoadingView;
});