define('works/views/mobile/doc_detail/doc_activity_form', function(require) {
	var Backbone = require('backbone');
	var Hogan = require('hogan');
	var App = require('app');
	
	var WorksActivity = require('works/models/applet_activity');
	var HeaderToolbarView = require('views/mobile/header_toolbar');
	
	var WorksActivityFormTpl = require('hgn!works/templates/mobile/doc_detail/doc_activity_form');
	
	var commonLang = require('i18n!nls/commons');
	var worksLang = require("i18n!works/nls/works");

	var FileUploader = require("components/go-fileuploader/mobile");
	require('jquery.go-preloader');

	var _savingFlag = false;
	var ImgTpl = Hogan.compile(
        '<li data-path="{{path}}" data-name="{{name}}" data-id="{{id}}">' +
            '<span class="item_image">' +
                '<span class="thumb">' +
                '<img src="{{thumbSmall}}" alt="{{name}}">' +
            '</span>' +
            '<span class="img_tit">{{name}}</span>' +
            '<span class="txt"> ({{fileSizeStr}})</span>' +
            '<a class="iscroll-tap-highlight">' +
                '<span class="btn_wrap" data-btntype="attachDelete">' +
                '<span class="ic ic_del"></span>' +
                '</span>' +
            '</a>' +
            '</span>' +
        '</li>'
	);

    var FileTpl = Hogan.compile(
		'<li data-path="{{attach.path}}" data-name="{{attach.name}}" data-id="{{attach.id}}">' +
    		'<span class="item_file">' +
    			'<span class="ic_file {{style}}"></span>' +
    			'<span class="name">{{attach.name}}</span>' +
                '<span class="size"> ({{attach.fileSizeStr}})</span>' +
    			'<span class="optional" data-btntype="attachDelete">' +
					'<a class="wrap_ic_file"><span class="txt ic ic_file_del"></span></a>' +
    			'</span>' +
			'</span>' +
		'</li>'
    );
	
	
	var WorksActivityForm = Backbone.View.extend({
		el : "#content",

		events : {
			"keyup textarea" : "_expandTextarea",
            "vclick span[data-btntype='attachDelete']" : "deleteAttach"
        },

		initialize: function (options) {
			this.activity = new WorksActivity(this.options);
			if (this.activity.id) this.activity.fetch({async: false});

			this.$el.off();
			GO.EventEmitter.off("trigger-action");
			GO.EventEmitter.on('trigger-action','activity-save', this.submit, this);
		},
		
		
		render : function() {
			/*var self = this;
			this.titleToolbarView = TitleToolbarView;
            this.titleToolbarView.render({
                name : this.activity.get("id") ? worksLang["활동기록 수정"] : worksLang["활동기록 등록"], 
                isPrev : true,
                isIscroll : false,
                isLeftCancelBtn : {
                    text : commonLang["취소"]
                },
                rightButton : {
                    callback : function(e){
                    	self.submit();
                    },
                    text : commonLang["등록"]
                }
            });*/

			//ToDo 등록버튼 구현해야함.
			HeaderToolbarView.render({
				isClose : true,
				title : this.activity.get("id") ? worksLang["활동기록 수정"] : worksLang["활동기록 등록"],
				actionMenu : [{
					id : "activity-save",
					text :  commonLang["등록"],
					triggerFunc : "activity-save"
				}]
			});

            this.$el.html(WorksActivityFormTpl({
            	activity : this.activity.toJSON(),
            	hasAttach : this.activity.hasAttach(),
            	content : GO.util.br2nl(GO.util.unescapeHtml(this.activity.get("content"))),
            	isMobileApp : GO.config('isMobileApp'),
            	"isAndroidApp?" : GO.util.isAndroidApp(),
            	"isOsAndroid?" : GO.util.checkOS() == "android" ? true : false
            }));

            this.renderAttach();
			this.attachFileUploader();
		},

		attachFileUploader: function(){
			var attachOption = {};
			attachOption.success = $.proxy(function(resp) {
			    var errorMessage = "";
				var	errorClass="";
				if(GO.util.fileUploadErrorCheck(resp)){
					errorMessage = "<strong class='caution'>" + GO.util.serverMessage(resp) + "</strong>";
					errorClass = "attachError";
				}

				var attach = (typeof resp === "string") ? JSON.parse(resp) : resp.data;
				this.$("#attachWrap").show();
                if($("div.option_display").data("attachable") === "false"){
                    return;
                }
                try{
                    this.attachValidate(attach)
                }catch(e){
                    if(e.message === "overMaxAttachNumber"){
                        $("div.option_display").data("attachable","false");
                    }
                    return;
                }
				this.addAttachEl(this.attachParser(attach), errorMessage, errorClass);
                $("span[data-btntype=attachDelete]").on("vclick", $.proxy(this.deleteAttach, this));
            }, this);

			attachOption.error = function() {
				alert(commonLang['업로드에 실패하였습니다.']);
			};

			attachOption.androidCallFile = $.proxy(function() {
				this.callFile();
			},this);

			FileUploader.bind(this.$el.find('#go-fileuploader'), attachOption);
		},

        deleteAttach: function(e){
            this.$el.find("div.option_display").data("attachable", "true");
            $(e.currentTarget).closest('li').remove();
            return false;
        },

        attachValidate: function(file){
            var maxAttachSize = null;
            var data = GO.util.getFileNameAndTypeData(file);
            if(GO.config('allowedFileUploadSize')){
                maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
            }
            try{
                $.goValidation.attachValidate("#attachPart ul li", data, maxAttachSize);
                if(GO.session().brandName == "DO_SAAS"){
                    FileUploader.attachFileValidateBySaaS(data.size);
                }
            }catch(e){
                var message = e.message;

                if (message == "AttachSizeException"){
                    GO.util.delayAlert(App.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                }else if(message == "AttachNumberExceptionBySaaS"){
                    GO.util.delayAlert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", GO.config('commonAttachConfig').maxAttachNumber));
                    throw new Error("overMaxAttachNumber");
                }else if(message == "NotFoundExtException"){
                    GO.util.delayAlert(commonLang['첨부할 수 없는 파일 입니다.']);
                }
                throw new Error("Attach Validation Error");
            }
        },

		submit : function() {
			var content = GO.util.escapeHtml(this.$el.find("textarea").val());
			if (_.isEmpty(content)) {
				alert(GO.i18n(commonLang['{{portlet_title}}이 없습니다.'], 'portlet_title', commonLang['내용']));
				return;
			}

			if (_savingFlag) {
				alert(worksLang['저장중 메세지']);
				return;
			}
			_savingFlag = true;
			preloader = $.goPreloader();

			this.activity.set({
				writer : _.pick(GO.session(), "id", "name", "email", "position", "thumbnail"),
				content : content,
				attaches : FileUploader.getAttachInfo("#attachWrap")
			});

			this.activity.save({}, {
				success: function (resp) {
					_savingFlag = false;
					history.back();
				},
				complete: function () {
					preloader.release();
				}
			});
		},

		renderAttach: function () {
			_.each(this.activity.get("attaches"), function (attach) {
				this.addAttachEl(attach, "", "");
			}, this);
		},

		addAttachEl: function (attach, errorMessage, errorClass) {
			var extention = attach.extention;
            attach.fileSizeStr = GO.util.getHumanizedFileSize(attach.size);
            if (GO.util.isImage(extention)) {
				$("#imageWrap").append(ImgTpl.render(attach));
			} else {
				$("#fileWrap").append(FileTpl.render({
					attach: attach,
					style: GO.util.getFileIconStyle(attach)
				}));
			}
		},

        attachParser : function(attach) {
        	return {
        		extention : attach.fileExt,
        		name : attach.fileName,
        		path : attach.filePath,
        		size : attach.fileSize,
        		thumbSmall : attach.thumbnail
        	};
        },

		callFile: function () {
			var maxAttachSize = GO.config('commonAttachConfig').maxAttachSize;
			var maxAttachNumber = GO.config('commonAttachConfig').maxAttachNumber;
			var excludeExtension = "";

			if (!this.fileUploadCountValidate()) {
				return false;
			}

			maxAttachNumber = maxAttachNumber - this.$("#attachWrap li").size();
			GO.util.callFile(maxAttachSize, maxAttachNumber, excludeExtension);
		},

		fileUploadCountValidate: function () {
			var attachCount = $("#attachWrap li").size();
			var configAttachCount = GO.config('commonAttachConfig').maxAttachNumber;

			if (attachCount >= configAttachCount) {
				alert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", configAttachCount));
				return false;
			}

			return true;
		},

		_expandTextarea : function(e) {
			GO.util.textAreaExpand(e);
		}
	});
	return WorksActivityForm;
});

