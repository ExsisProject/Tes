;(function(){
    define([
            "jquery",
            "components/fileupload/views/file_item",
            "swfupload",
            "swfupload.plugin",
            "jquery.progressbar",
            "GO.util"
            ], function($, FileItemView) {
        
        var defaults = {
                locale : $('meta[name="locale"]').attr('content'),
                context_root : "/",
                lang : {
                    'ko' : {
                        '삭제' : '삭제'
                    },
                    'ja' : {
                        "삭제" : "削除"
                    }, 
                    'en' : {
                        "삭제" : "Delete"
                    }, 
                    'zh_CN' : {
                        "삭제" : "删除"
                    }, 
                    'zh_TW' : {
                        "삭제" : "刪除"
                    },
                    'vi' : {
                    	"삭제" : "Xóa"
                    }
                },
                button_text : "",
                button_height : 20,
                button_width : 69,
                button_style : "border: 1px solid #D1D1D1;background-color:#efefef;display:inline-block;cursor:pointer;color:#6f6f6f;border-radius:2px; font-size:12px;font-weight:bold; text-align: center;vertical-align: middle;font-family:돋움,dotum,AppleGothic,arial,Helvetica,sans-serif;",
                progressBarUse : true,
                file_size_limit : 0,
                file_upload_limit : 0,
                file_type : "*.*",
                top_padding : 5,
                left_padding : 0,
                debug : false
                
        }, originDocTitle;
        
        var FlashFileUpload = Backbone.View.extend({
            initialize : function(options){
                validate(options);

                this.$el = typeof(options.el) == "string" ? $(options.el) : options.el;
                this.$el.append("<input type='hidden' class='button'/>");
                /**
                 * 잘못 개발된 사례. after 로 붙이는 element 는 backbone view instance 의 관리 범위를 벗어난다.
                 */
                if (!this.$el.siblings('div.progress').length) this.$el.after("<div class='progress' style='display:none;margin-top:5px'></div>");

                var opts = $.extend({}, defaults, options);
                
                this.lang = defaults.lang.hasOwnProperty[opts.locale] ? defaults.lang[opts.locale] : defaults.lang["ko"];
                this.flashFileUploder = initFileUpload.call(this, opts);
                this.progressBarUse = opts.progressBarUse;
                this.isMail = options.isMail || false;
                
                //progress setting
                if(this.progressBarUse){
                	var self = this;
                    this.progressEl = (opts.progressEl == undefined) ?  this.$el.parents(":first").find("div.progress") : $(opts.progressEl);
                    this.progressBarOpt = {
                            boxImage: opts.context_root + 'resources/images/progressbar.gif',
                            barImage: opts.context_root + 'resources/images/progressbg_green_100.gif',
                            width: 180,
                            max : 100
                    };
                    this.progressEl.hide();
                    this.progressEl.progressBar(0,this.progressBarOpt);
                    this.progressEl.find("span:first").css("vertical-align" , "top");
                    this.progressEl.append("<a><span class='ic_classic ic_del' title='"+ this.lang["삭제"] +"'></span></a>");
                    this.progressEl.find("span.ic_del").on("click", function(){
                    	self.$el.trigger("cancel:upload");
                    });
                };
                
                //cancel event
                this.$el.on("cancel:upload",function(){
                    $(this).swfupload('cancelUpload');
                });
                
                originDocTitle = document.title;

                this._bindEvents();
            },

            _fileQueued: function(e , file) {
                this.queueCallback(e, {
                    name : file.name,
                    size : file.size,
                    type : file.type
                });
                this.$el.swfupload('startUpload');
            },

            _uploadStart: function(e, file) {
                var result = this.startCallback(e, {
                    name : file.name,
                    size : file.size,
                    type : file.type,
                    id : file.id
                });
                if (result == false) this.$el.swfupload('cancelUpload');
            },

            _uploadProgress: function(e, file, bytesLoaded) {
                var data = {
                    name : file.name,
                    type : file.type,
                    loadedSize : bytesLoaded,
                    totalSize : file.size
                };
                if(this.progressBarUse){
                    this.progressEl.show();
                    var fileUploadPercent = Math.ceil( data.loadedSize / data.totalSize * 100);
                    if (fileUploadPercent > 99){
                    	fileUploadPercent = 100;
                    }
                    this.progressEl.progressBar(fileUploadPercent , this.progressBarOpt);
                }
                this.progressCallback(e, data);
            },

            _uploadSuccess: function(e, obj, serverData) {
                var resultData = $.parseJSON(serverData);
                var options = {};

                if (this.isMail) {
                    resultData["data"] = resultData;
                    resultData["data"].fileExt = obj.type;
                    options.uid = resultData.uid;
                }
                
                resultData.data.id = obj.id;

                var data = resultData.data;
                _.extend(options, {
                    fileName : data.fileName,
                    filePath : data.filePath,
                    hostId : data.hostId,
                    fileSize : GO.util.getHumanizedFileSize(data.fileSize),
                    fileClass : GO.util.getFileIconStyle({extention : data.fileExt}),
                    removeText : this.lang["삭제"],
                    thumbnail : data.thumbnail
                });

                var fileItem = null;
                if (GO.util.isImage(data.fileExt)) {
                    fileItem = FileItemView.createImageFile(options);
                } else {
                    fileItem = FileItemView.createFile(options);
                }

                this.successCallback(e, resultData, fileItem.$el);
            },

            _uploadComplete: function(e, data) {
                if(this.progressBarUse){
                    this.progressEl.hide();
                    this.progressEl.progressBar(0, this.progressBarOpt);
                }

                this.$el.swfupload('startUpload');
                this.completeCallback(e, data);
            },

            _uploadError: function(e, data) {
                this.errorCallback(e, data);
            },

            start : function(callback){
                this.startCallback = callback;
                return this;
            },
            queue : function(callback){
                this.queueCallback = callback;
                return this;
            },
            progress : function(callback){
                this.progressCallback = callback;
                return this;
            },
            success : function(callback){
                this.successCallback = callback;
                return this;
            },
            complete : function(callback){
                this.completeCallback = callback;
                return this;
            },
            error : function(callback){
                this.errorCallback = callback;
                return this;
            },

            _bindEvents: function() {
                this.flashFileUploder.unbind("fileQueued");
                this.flashFileUploder.unbind("uploadStart");
                this.flashFileUploder.unbind("uploadProgress");
                this.flashFileUploder.unbind("uploadSuccess");
                this.flashFileUploder.unbind("uploadComplete");
                this.flashFileUploder.unbind("uploadError");

                this.flashFileUploder.bind("fileQueued", $.proxy(function(e, file){
                    this._fileQueued(e, file);
                }, this));
                this.flashFileUploder.bind("uploadStart", $.proxy(function(e, file){
                    this._uploadStart(e, file);
                }, this));
                this.flashFileUploder.bind("uploadProgress", $.proxy(function(e, file, bytesLoaded){
                    this._uploadProgress(e, file, bytesLoaded);
                }, this));
                this.flashFileUploder.bind("uploadSuccess", $.proxy(function(e, obj, serverData){
                    this._uploadSuccess(e, obj, serverData);
                }, this));
                this.flashFileUploder.bind('uploadComplete', $.proxy(function (e, data){
                    this._uploadComplete(e, data);
                }, this));
                this.flashFileUploder.bind('uploadError', $.proxy(function (e, data){
                    this._uploadError(e, data);
                }, this));
            }
        });
        
        /*
         * bug fix override
         */
        
        //IE 8,9 업로드 파일 클릭시 title 변경되는 이슈 처리
        SWFUpload.prototype.fileDialogStart = function () {
        	
        	if(!window.history['pushState']) {
        		fixDocTitle();
        	}
            
        	this.queueEvent("file_dialog_start_handler");
        };
        
        //IE 8,9 업로드 파일 클릭시 title 변경되는 이슈 처리
        SWFUpload.prototype.flashReady = function(){
        	console.info("override after!!"); 
        	
        	var movieElement = this.getMovieElement(); 

        	if (!movieElement) {
        		this.debug("Flash called back ready but the flash movie can't be found.");
        		return;
        	}

        	this.cleanUp(movieElement);
        	
        	this.queueEvent("swfupload_loaded_handler");
        	
        	/* ie에서 브라우져 title에 url의 #뒤에 부분이 붙는현상 수정 */
        	if(!window.history['pushState']) {
        		setTimeout(function(){
        			var agt=navigator.userAgent.toLowerCase();
        			 if(agt.indexOf("msie") != -1){
        				 fixDocTitle();
        		     }
        		},200);
        	}
        };
        
        function fixDocTitle() {
        	var docTitle = document.title, 
		 		si = docTitle.indexOf('#');
		 
        	document.title = sessionStorage.getItem('browserTitle') || docTitle.substring(0, si);
        }
        
        function initFileUpload(opts){
        	var button_window_mode = opts.useButtonWindow ? SWFUpload.WINDOW_MODE.WINDOW : SWFUpload.WINDOW_MODE.TRANSPARENT;
        	var params = {
                //custom settting 
                upload_url: opts.context_root + opts.url,
                
                file_size_limit : opts.file_size_limit,
                file_types : opts.file_type,
                file_upload_limit : opts.file_upload_limit,
                flash_url : opts.context_root + "resources/js/vendors/swfupload/swfupload.swf",
                button_cursor :  SWFUpload.CURSOR.HAND,
                button_window_mode: button_window_mode,
                button_text_style : ".buttonText {"+opts.button_style+"}",
                button_text : opts.button_text,
                button_width : opts.button_width,
                button_height : opts.button_height,
                button_text_top_padding : opts.top_padding,
                button_text_left_padding : opts.left_padding,
                button_placeholder : this.$el.find('.button')[0],
                //button_placeholder_id : 'SWFUpload_0',
                //default setting
                file_types_description : "",
                debug: opts.debug,
                custom_settings : {something : "here"},
                file_post_name : opts.file_post_name || "file",
                post_params : opts.post_params || {}
            };
            return $(this.el).swfupload(params);
        }
        
        function validate(options){
            if(options.context_root == undefined || options.el == undefined || options.url == undefined){
                throw new Exception('require parameter[context_root, el, url]');
            }
        }
        
        return FlashFileUpload;
    });
})();