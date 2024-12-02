;(function() {
	define([
			"backbone",
			"app",
			"i18n!nls/commons",
			
			"file_upload",
			"jquery.go-validation"
	], 
	function(
			Backbone,
			App,
			commonLang,
			
			FileUpload
	) {
		var lang = {
				upload : commonLang["사진 올리기"],
				select_file : commonLang["파일 선택"],
				alert_max_attach_size : commonLang["첨부할 수 있는 최대 사이즈는 0MB 입니다."],
				alert_format : commonLang["포멧 경고"]
		};
				
		var UploadView = Backbone.View.extend({
			events : {},
			initialize : function(options) {
				this.options = options || {};
				this.elPlaceHolder = this.options.elPlaceHolder;
			},
			render : function() {
				var popupContents = $.goPopup({
					 header : lang.upload,
					 width : "250px",
					 pclass : "layer_normal layer_date_set",
					 contents : '<div style="text-align:center"><span class="btn_minor_s" id="imgUpload" style="padding:0 !important;"></span></div>',
					 modal : true,
					 allowPrevPopup : true
				  });
	        	this.initFileUpload(this.elPlaceHolder,popupContents);				
				return this;
			},
			initFileUpload : function(elPlaceHolder,popupContents){
	            var self = this;
	            var fileAttachLang = lang.select_file;
	            var options = {
					el : "#imgUpload",
					context_root : GO.contextRoot ,
					button_text : "<span class='buttonText'>"+fileAttachLang+"</span>",
					url : ((GO.instanceType == "admin") ? "ad/" : "") + "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
					file_type : "*.jpeg;*.jpg;*.gif;*.png;*.bmp",
					file_types_description : "",
					accept: 'image/*'
				};
	            var queueFileCount = 0;
	            
	            (new FileUpload(options))
	            .queue(function(){
	            	queueFileCount++;
	            })
	            .start(function(e, data){
	            	var size = data.size / 1024 / 1024;  //(MB)
	            	if(10 < size){
                        $.goSlideMessage(App.i18n(lang['alert_max_attach_size'], "arg1", "10"),'caution');
                        return false;
                    }
	            	var format = data.type.toLowerCase().substring(1);
	            	var re =  new RegExp("(jpeg|jpg|gif|png|bmp)","gi");
	            	var test = re.test(format);
	            	if(!test){
	            		$.goSlideMessage(lang['alert_format'],'caution');
                        return false;
	            	}
	            })
	            .progress(function(e, data){})
	            .success(function(e, data){
	            	var data = data.data;
	            	var imgUrl = GO.contextRoot + "thumb/temp/" + data.hostId + "/original" + data.filePath;
					var image = '<img data-filename="' + data.fileName + '" data-filepath="' + data.filePath+'" data-hostid="' + data.hostId + '" data-inline="true" src="' + imgUrl + '">';
					var editor = GO.Editor.getInstance(self.elPlaceHolder);
					editor.setContent(image, true);
	            })
	            .complete(function(e) {
	            	queueFileCount--;
	            	if(queueFileCount == 0) {
	            		popupContents.close('', e);
	            	}
	            })
	            .error(function(e, data){});
			}
		});
		return UploadView;
	});
}).call(this);