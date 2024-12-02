;(function() {
	define([
			"backbone",
			"hogan",
			"app",

            "admin/models/task_config",
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "hgn!task/templates/mobile/task_activity_form",
	        "task/models/task_activity",
	        "views/mobile/header_toolbar",
			"components/go-fileuploader/mobile"
	], 
	function(
			Backbone,
			Hogan,
			App,

			TaskBaseConfigModel,
			commonLang,
			taskLang,
			TaskActivityFormTpl,
			TaskActivity,
			HeaderToolbarView,
			FileUploader
	) {
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
						'<a class="ic_classic ic ic_del"></a>' +
        			'</span>' +
    			'</span>' +
			'</li>'
        );
		
		
		var TaskActivityForm = Backbone.View.extend({
			el : "#content",
			
			
			events : {
				"keyup textarea" : "_expandTextarea",
                "vclick span[data-btntype='attachDelete']" : "deleteAttach"
			},
			
			
			initialize : function() {
				this.activity = new TaskActivity(this.options);
				if (this.activity.id) this.activity.fetch({async :false});
				
				this.$el.off();
				this.headerBindEvent();
			},

			headerBindEvent : function() {
				GO.EventEmitter.off("trigger-action");
				GO.EventEmitter.on('trigger-action','task-save', this.submit, this);
			},
			render : function() {

				HeaderToolbarView.render({
					title : this.activity.get("id") ? taskLang["활동기록 수정"] : taskLang["활동기록 등록"],
					isClose : true,
					actionMenu : [{
						id : "task-save",
						text :  commonLang["등록"],
						triggerFunc : "task-save"
					}]
				});
                
                this.$el.html(TaskActivityFormTpl({
                	activity : this.activity.toJSON(),
                	hasAttach : this.activity.hasAttach(),
                	content : GO.util.unescapeHtml(this.activity.get("content")),
                	isMobileApp : GO.config('isMobileApp')
                }));
                
                this.renderAttach();

                this.configModel = TaskBaseConfigModel.read({admin : false});
				this.attachFileUploader();
			},

			attachFileUploader: function(){
				var attachOption = {};

				attachOption.success = $.proxy(function (r) {
                    var attach = (typeof r === "string") ? JSON.parse(r) : r.data;
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
                    this.addAttachEl(this.attachParser(attach));
                    $("span[data-btntype=attachDelete]").on("vclick", $.proxy(this.deleteAttach, this));
				}, this);

				attachOption.error = function() {
					alert(commonLang['업로드에 실패하였습니다.']);
				};

                attachOption.androidCallFile = $.proxy(function(){
                    this.callFile();
                },this);

				FileUploader.bind(this.$el.find('#go-fileuploader'), attachOption);
			},

            deleteAttach: function(e){
                this.$el.find("div.option_display").data("attachable", "true");
                $(e.currentTarget).closest('li').remove();
                return false;
            },

			submit : function() {
				if(_savingFlag) {
					return;
				}

				this.activity.set({
					writer : _.pick(GO.session(), "id", "name", "email", "position", "thumbnail"),
					content : GO.util.escapeHtml(this.$el.find("textarea").val()),
					attaches : FileUploader.getAttachInfo("#attachWrap")
				});
				this.activity.save({}, {
					success : function(resp) {
						console.log(resp.id);
						_savingFlag = true;
						App.router.navigate("task/" + resp.taskId + "/detail", true);
					},
					complete: function() {
						_savingFlag = false;
					}
				});
			},
			
			
			renderAttach : function() {
				_.each(this.activity.get("attaches"), function(attach) {
					 this.addAttachEl(attach);
				}, this);
			},
			
			
			addAttachEl : function(attach) {
				var extention = attach.extention;
				attach.fileSizeStr = GO.util.getHumanizedFileSize(attach.size);
				if (GO.util.isImage(extention)) {
                	$("#imageWrap").append(ImgTpl.render(attach));
                } else {
                	$("#fileWrap").append(FileTpl.render({
                		attach : attach,
                		style : GO.util.getFileIconStyle(attach)
                	}));
                };
			},
            attachValidate : function(file){
                var data = GO.util.getFileNameAndTypeData(file);
                var maxAttachSize = this.configModel.get("attachSizeLimit") ? this.configModel.get("maxAttachSize") : -1,
                    maxAttachNumber = this.configModel.get("attachNumberLimit") ? this.configModel.get("maxAttachNumber") : -1,
                    excludeExtension = this.configModel.get("excludeExtension") == undefined ? "" : this.configModel.get("excludeExtension");
                if(this.configModel.get("attachSizeLimit")){
                    maxAttachSize = this.configModel.get("maxAttachSize");
                } else if(GO.config('allowedFileUploadSize')){
                    maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
                }
                try{
                    $.goValidation.attachValidate("#attachWrap ul li", data, maxAttachSize, maxAttachNumber, excludeExtension);
                }catch(e){
                    var message = e.message;

                    if(message == "ExtentionException"){
                        GO.util.delayAlert(App.i18n(commonLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'], "arg1", excludeExtension));
                    }else if (message == "AttachSizeException"){
                        GO.util.delayAlert(App.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                    }else if (message == "AttachNumberException"){
                        GO.util.delayAlert(App.i18n(commonLang['첨부 파일 개수를 초과하였습니다.'], "arg1", maxAttachNumber));
                        throw new Error("overMaxAttachNumber");
                    }else if(message == "AttachNumberExceptionBySaaS"){
                        GO.util.delayAlert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                        throw new Error("overMaxAttachNumber");
                    }else if(message = "NotFoundExtException"){
                        GO.util.delayAlert(commonLang['첨부할 수 없는 파일 입니다.']);
                    }

                    throw new Error("Attach Validation Error");
                }
            },

            callFile : function(){
                var maxAttachSize = -1;
                if(this.configModel.get("attachSizeLimit")){
                    maxAttachSize = this.configModel.get("maxAttachSize");
                } else if(GO.config('allowedFileUploadSize')){
                    maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
                }
                var	maxAttachNumber = this.configModel.get("attachNumberLimit") ? this.configModel.get("maxAttachNumber") : -1,
                    excludeExtension = this.configModel.get("excludeExtension");
                if(!this.fileUploadCountValidate()){
                    return false;
                }
                if(this.configModel.get("attachNumberLimit")){
                    maxAttachNumber = maxAttachNumber - $("#attachWrap li").size();
                }

                GO.util.callFile(maxAttachSize, maxAttachNumber, excludeExtension);
            },
            fileUploadCountValidate : function(){

                if(this.configModel.get("attachNumberLimit")){
                    var attachCount = $("#attachWrap li").size(),
                        configAttachCount = this.configModel.get("maxAttachNumber");

                    if(attachCount >= configAttachCount){
                        GO.util.delayAlert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", configAttachCount));
                        return false;
                    }
                }

                return true;
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
            
            

			_expandTextarea : function(e) {
				GO.util.textAreaExpand(e);
			}
		});
		return TaskActivityForm;
	});
}).call(this);