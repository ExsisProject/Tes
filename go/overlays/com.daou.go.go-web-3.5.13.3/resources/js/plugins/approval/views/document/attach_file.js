/**
 * 전자결재 문서상세와 인쇄화면에서 사용하는 공통 첨부파일 뷰.
 *
 * AttachFile 컴포넌트를 현재 사용하지 않고 별도로 구현하고 있어서,
 * 추후 AttachFile 컴포넌트를 이용하도록 리팩토링 필요
 *
 * [ 참고사항 ]
 * - fancybox 연동은 호출하는 곳에서 바인딩되어 있다.(리팩토링 지점)
 * - 미리보기 클릭역시 호출하는 곳에서 이벤트 바인딩되어 있다.(이것 역시 리팩토링 지점)
 *
 * [ 관련 이슈 ]
 * GO-19592 [조인] 전자결재의 증빙자료 첨부(이미지)시 제공되는 이미지 썸네일 크기 확대
 */
define(function(require) {

    var Backbone = require('backbone');
    var when = require('when');
    var Hogan = require('hogan');
    var GO = require('app');
    var AttachFileTpl = require("hgn!approval/templates/document/attach_file_view");
    var GOIgnoreDuplicateMethod = require('go-ignoreduplicatemethod');

    var commonLang = require('i18n!nls/commons');
    var approvalLang = require('i18n!approval/nls/approval');

    var lang = {
        'img_attach' : commonLang['이미지 첨부'],
        'file_attach' : commonLang['파일 첨부'],
        'doc_search' : approvalLang['문서 검색'],
        'attach_file' : approvalLang['첨부파일'],
        'view' : approvalLang['보기'],
        'preview' : approvalLang['미리보기'],
        'amt' : approvalLang['개'],
        'no_authority' : approvalLang['열람 권한이 없습니다']
    };

    function renderImageElement(data) {
        var templete = '<li>'+
            '<span class="item_image">'+
            '<span class="{{classname}}">'+
            '{{^isBrowseByReference}}' +
            '<a href="{{contextRoot}}api/approval/document/{{docId}}/download/{{attachId}}" data-bypass '+
            'class="fancybox-thumbs fancybox-button" data-fancybox-group="attachImgThumb_" title="{{filename}}">'+
            '<img src="{{path}}" alt="{{filename}}" />' +
            '</a>' +
            '{{/isBrowseByReference}}' +
            '{{#isBrowseByReference}}' +
            '<a href="{{contextRoot}}api/approval/document/{{docId}}/reference/{{originalDocId}}/download/{{attachId}}" data-bypass '+
            'class="fancybox-thumbs fancybox-button" data-fancybox-group="attachImgThumb_" title="{{filename}}">'+
            '<img src="{{path}}" alt="{{filename}}" />' +
            '</a>' +
            '{{/isBrowseByReference}}' +
            '</span>'+
            '</span>'+
            '</li>';

        var compiled = Hogan.compile(templete);
        return compiled.render(data);
    }

    function renderFileElement(data) {
        var templete = '<li>'+
            '<span class="item_file">'+
            '<span class="ic_file ic_{{fileType}}"></span>'+
            '<span class="name btn_attach">' +
            '<a href="' +
            '{{contextRoot}}api/approval/document/{{docId}}{{^isBrowseByReference}}/download/{{attachId}}{{/isBrowseByReference}}{{#isBrowseByReference}}/reference/{{originalDocId}}/download/{{attachId}}{{/isBrowseByReference}}"' +
            'data-bypass>{{filename}}</a>' +
            '</span><span class="size">({{filesize}})</span>'+
            '{{#usePreview}}' +
            '<a href="#" data-func="preview" data-bypass data-id="{{encrypt}}">'+
            '<span class="btn_fn4"><span class="txt"> {{lang.preview}} </span></span></a>'+
            '{{/usePreview}}' +
            '{{^isBrowseByReference}}' +
            '<a href="{{contextRoot}}api/approval/document/{{docId}}/download/{{attachId}}" data-bypass>'+
            '<span class="btn_fn4"><span class="txt"> {{lang.download}} </span></span></a>' +
            '</span>'+
            '{{/isBrowseByReference}}' +
            '{{#isBrowseByReference}}' +
            '<a href="{{contextRoot}}api/approval/document/{{docId}}/reference/{{originalDocId}}/download/{{attachId}}" data-bypass>'+
            '<span class="btn_fn4"><span class="txt"> {{lang.download}} </span></span></a>' +
            '</span>'+
            '{{/isBrowseByReference}}' +
            '</li>';

        var compiled = Hogan.compile(templete);
        return compiled.render(data);
    }

    var ApprAttachFileView = Backbone.View.extend({
        events: {
        },
        initialize: function(options) {
            var opt = options || {};
            this.attaches = opt.attaches || [];
            this.userApprSetting = opt.userApprSetting || {};
            this.docId = opt.docId;
            this.originalDocId = opt.originalDocId;
            this.isBrowseByReference = opt.isBrowseByReference;

            // 편의상 미리 계산해 놓는다.
            this.totalSize = this.getTotalAttachSize();
            this._initRender();
        },

        render: function () {
            var attachImageMode = this.getAttachImageMode();

            if (this.getAttachCount() > 0) {
                _.each(this.attaches, function (cursor) {
                    if (attachImageMode !== 'FILENAME' && GO.util.isImage(cursor.extention)) {
                        this._renderImage(cursor);
                    } else {
                        this._renderFile(cursor);
                    }
                }, this);

                if (this.$el.find("#img_wrap").is(':empty')) {
                    this.$el.find("#img_wrap").remove();
                }

                if (this.$el.find("#file_wrap").is(':empty')) {
                    this.$el.find("#file_wrap").remove();
                }
            }
        },

        /**
         * @Override
         */
        remove: function() {
            Backbone.View.prototype.remove.apply(this, arguments);

            // el이 바깥에서 체결되므로 엘리먼트를 삭제하지 않고 Backbone#remove가 수행하는 로직을
            // 수행해준다.
            this.undelegateEvents();
            this.$el.empty();
        },

        /**
         * 첨부파일 모드 반환(THUMBNAME | ORIGINAL | FILENAME)
         *
         * See : UserApprSetting의 AttachImageMode enum 객체 참고
         * @returns {String}
         */
        getAttachImageMode: function() {
            return this.userApprSetting.attachImageMode;
        },

        /**
         * 첨부 파일 총갯수 반환
         * @returns {Number|number}
         */
        getAttachCount: function() {
            return this.attaches.length || 0;
        },

        /**
         * 첨부파일 총 크기 반환
         *
         * TODO: AttachFileModel관련 모델로 이동
         * @returns {number}
         */
        getTotalAttachSize: function() {
            var totalSize = 0;
            _.each(this.attaches, function(attach){
                totalSize += parseInt(attach.size);
            });

            return GO.util.getHumanizedFileSize(totalSize);
        },

        _initRender: function() {
            this.$el.html(AttachFileTpl({
                lang : lang,
                totSize : this.totalSize,
                total : this.getAttachCount()
            }));
        },

        _renderImage: function(cursor) {
            var imgSrc, classname;
            var $imageWrap = this.$el.find("#img_wrap");
            var attachImageMode = this.getAttachImageMode();
            var docId = this.docId;

            if(attachImageMode === 'ORIGINAL') {
                classname = 'original';
                $imageWrap.addClass(classname);
                imgSrc = cursor.thumbOriginal;
            } else {
                classname = 'thumb';
                imgSrc = cursor.thumbSmall;
            }

            $imageWrap.append(renderImageElement({
                "contextRoot": GO.config('contextRoot'),
                "classname": classname,
                "attachId": cursor.id,
                "filename": cursor.name,
                "docId": docId,
                "path": imgSrc,
                "originalDocId": this.originalDocId,
                'isBrowseByReference': this.isBrowseByReference,
            }));

            if(attachImageMode === 'ORIGINAL') {
                initAttachImages($imageWrap).then(function() {
                    resizeAttachImages($imageWrap);
                    bindWindowResize($imageWrap);
                });
            }

            function initAttachImages($container) {
                return when.promise(function(resolve, reject) {
                    setTimeout(function() {
                        $container.find('img').each(function() {
                            $(this).attr('data-orgwidth', $(this).outerWidth());
                            $(this).attr('data-orgheight', $(this).outerHeight());
                        });
                        resolve();
                    }, 200);
                });
            }

            function resizeAttachImages($container) {
                setTimeout(function() {
                    var maxWidth = $container.innerWidth();
                    $container.find('img').each(function() {
                        var imgWidth = parseInt($(this).data('orgwidth'));
                        var imgHeight = parseInt($(this).data('orgheight'));
                        if(imgWidth > maxWidth) {
                            $(this).outerWidth(maxWidth);
                            $(this).outerHeight(imgHeight * (maxWidth / imgWidth));
                        }
                    });
                }, 200);
            }

            function bindWindowResize($container) {
                var resizer = new GOIgnoreDuplicateMethod();

                $(window).on('resize.appr.document', function(e) {
                    if (!$.isWindow(e.target)) return;
                    resizer.bind(function() {
                        resizeAttachImages($container);
                    });
                });
            }
        },

        _renderFile: function(cursor) {
            var size = GO.util.getHumanizedFileSize(cursor.size);
            var fileType = "def";
            var docId = this.docId;
            var reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)","gi");

            if(reExt.test(cursor.extention)){
                fileType = cursor.extention.toLowerCase();
            }

            this.$el.find("#file_wrap").append(renderFileElement({
                "contextRoot": GO.config('contextRoot'),
                "fileType": fileType,
                "attachId": cursor.id,
                "filename": cursor.name,
                "filesize": size,
                "usePreview": !!cursor.preview,
                "encrypt": cursor.encrypt,
                "docId": docId,
                "originalDocId": this.originalDocId,
                'isBrowseByReference': this.isBrowseByReference,
                "lang": {
                    "preview": lang.preview,
                    "download": commonLang["다운로드"]
                }
            }));
        },
    }, {
        appendTo: function($container, attaches, userApprSetting, docId, options) {
            var opt = options || {};
            var instance = new ApprAttachFileView({
                el: $container,
                attaches: attaches || [],
                userApprSetting: userApprSetting,
                docId: docId,
                originalDocId: opt.originalDocId,
                isBrowseByReference: opt.isBrowseByReference,
            });
            instance.render();
            return instance;
        }
    });

    return ApprAttachFileView;
});
