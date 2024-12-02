(function() {
	define([
		"jquery",
		"backbone",
		"app",
		"admin/collections/etc_config",
	    "hgn!admin/templates/etc_config",
	    "hgn!admin/templates/ci_upload",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "file_upload",
	    "jquery.go-validation",
	    "jquery.go-popup",
	    "jquery.go-sdk"
	],

	function(
		$,
		Backbone,
		App,
		EtcConfigCollection,
		configTmpl,
		UploadTmpl,
		commonLang,
		adminLang,
		FileUpload
	) {
		var tmplVal = {
			label_save: commonLang["확인"],
			label_sucess: commonLang["저장되었습니다."],
			label_fail: commonLang["실패"],
			label_failDesc: commonLang["실패했습니다."],
			label_edit: commonLang["수정"],
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_config: adminLang["기본 설정"],
			label_use: adminLang["사용함"],
			label_notuse: commonLang["사용하지 않음"],
			label_month: adminLang["개월"],
			label_menu_url: adminLang["메뉴 URL 주소"],
			label_location: adminLang["페이지 이동"],
			label_setting: commonLang["설정"],
			label_display: adminLang["화면 꾸미기"],
			label_logo: adminLang["로고 설정"],
			label_upload: commonLang["사진 올리기"],
			label_desc_img: adminLang["로고 도움말"],
			label_skin: adminLang["스킨 선택"],
			label_user: adminLang["사용자가 직접 선택"],
			label_admin: adminLang["관리자가 선택 (사용자 변경 불가능)"],
			label_web_title: adminLang["웹 타이틀"],
			label_web_copy: adminLang["웹 저작권"],
			label_mobile_title: adminLang["모바일 타이틀"],
			label_mobile_copy: adminLang["모바일 저작권"],
			label_noti_config: adminLang["알림 설정"],
			label_noti_base: adminLang["알림 기본 설정"],
			label_perior: adminLang["알림 저장 기간"],
			label_button : adminLang["파일 찾기"],
			label_validate: adminLang['0자이상 0이하 입력해야합니다.'],
			label_close: commonLang["닫기"],
			label_block_pwd_change : adminLang['사용자 비밀번호 변경 감추기'],
			label_confirm: commonLang['허용'],
			label_unconfirm: commonLang['허용하지 않음'],
			label_style : adminLang['기본 스킨 선택'],
			label_login : adminLang['로그인 이미지'],
			label_mobile : adminLang['모바일웹 로그인 이미지'],
			label_favicon : adminLang['파비콘'],
			label_login_desc : App.i18n(adminLang['0 파일로 0x0 사이즈로 등록하세요.'], {"arg1" : "png","arg2" : 300, "arg3" : 150}),
			label_mobile_desc : App.i18n(adminLang['0 파일로 0x0 사이즈로 등록하세요.'], {"arg1" : "png","arg2" : 80, "arg3" : 80}),
			label_favicon_desc : App.i18n(adminLang['0 파일로 0x0 사이즈로 등록하세요.'], {"arg1" : "ico","arg2" : 16, "arg3" : 16}),
			label_classic_desc : App.i18n(adminLang['0x0 사이즈'], {"arg1" : 200,"arg2" : 40}),
			label_advanced_desc : App.i18n(adminLang['0x(0~0) 사이즈'], {"arg1" : 150,"arg2" : 36, "arg3" : 100}),
			label_favicon_preview : adminLang['파비콘미리보기설명'],
			"회색 로고 권장": adminLang["회색 로고 권장"],
			"흰색 로고 권장": adminLang["흰색 로고 권장"],
			"설정된 테마에 따라, 위의 로고를 표시합니다": adminLang["설정된 테마에 따라, 위의 로고를 표시합니다."],
			"메뉴 테마 설정" : commonLang["메뉴 테마 설정"],
			"삭제" : commonLang["삭제"]
		};

		var EtcConfig = App.BaseView.extend({
			el : '#layoutContent',
			initialize : function() {
				this.collection = EtcConfigCollection.getCollection();
				this.unbindEvent();
				this.bindEvent();
			},
			unbindEvent : function() {
				this.$el.off("click", "span#btn_ok");
				this.$el.off("click", "span#btn_cancel");
				this.$el.off("click", "span.btn_edit_logo");
				this.$el.off("click", "span#delete_logo");
				this.$el.off("click", "span.btn_box[data-btntype='changeform']");
				this.$el.off("click", "span#data");
				this.$el.off("click", "span.ic_classic");
				this.$el.off("submit", "form");
			},
			bindEvent : function() {
				this.$el.on("click", "span#btn_ok", $.proxy(this.etcConfigSave, this));
				this.$el.on("click", "span#btn_cancel", $.proxy(this.etcConfigCancel, this));
				this.$el.on("click", "span.btn_edit_logo", $.proxy(this.uploadCI, this));
				this.$el.on("click", "span#delete_logo", $.proxy(this.deleteCI, this));
				this.$el.on("click", "span.btn_box[data-btntype='changeform']", $.proxy(this.changeModifyForm, this));
				this.$el.on("click", "span#data", $.proxy(this.changeModifyForm, this));
				this.$el.on("click", "span.ic_classic", $.proxy(this.deleteFile, this));
				this.$el.on("submit", "form", $.proxy(this.formSubmit, this));
			},
			formSubmit : function(e) {
				e.preventDefault();
				return;
			},
			deleteFile : function(){
                $("#fileComplete").html("<input type='hidden' value='true' id='favicon-data-delete'/>");
            },
			initFileUpload : function(fileId, btnText, isReload, uploadType) {
			    var _this = this,
                options = {
                    el : fileId,
                    context_root : GO.contextRoot ,
                    button_text : "<span class='buttonText'>"+btnText+"</span>",
                    button_style : "text-align:center;font-weight:bold",
                    button_width : 75,
                    button_height : 20,
                    progressBarUse : false,
					multiple : false,
					accept : "image/*",
                    url : "ad/api/file/logo?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
                };

                (new FileUpload(options))
                .queue(function(e, data){

                })
                .start(function(e, data){
                })
                .progress(function(e, data){

                })
                .success(function(e, serverData, fileItemEl){

                    if(GO.util.fileUploadErrorCheck(serverData)){
                        $.goMessage(GO.util.serverMessage(serverData));
                        return false;
                    }

                    var data = serverData.data,
                        fileName = data.fileName,
                        filePath = data.filePath,
                        thumbnail = data.thumbnail,
                        fileExt = data.fileExt.toLowerCase(),
                        hostId = data.hostId,
                        re =  (uploadType == 'favicon_thumnail_image') ? new RegExp("(ico)","gi") : new RegExp("(jpeg|jpg|gif|png|bmp)","gi");
                    var test = re.test(fileExt),
                    	prewidth = 80,
                    	preheight = 80;
                    if(uploadType == 'login_thumnail_image'){
                    	prewidth = 300,
                    	preheight = 150;
                    }else if(uploadType == 'favicon_thumnail_image') {
                    	prewidth = 16,
                    	preheight = 16;
                    }else if(uploadType == 'thumnail_image') {
                    	prewidth = 190,
                    	preheight = 40;
                    }
                    if(test){
                    	if(!isReload){
                    		templete = ['<p>',adminLang["미리보기"],'</p>',
                    		            '<form name="formCI">',
                    		            '<div class="content"> <div class="upload_action logo_img">',
                    		            '<img src="',thumbnail,'"/>',
                    		            '</div></div>',
    				        			'<div class="btn_file btn_minor_s" id="swfupload-control2"></div>',
    				        			'</form>'].join('');

							$("#pre_upload").remove();
							$("#upload").append(templete);
							$('.logo_img').find('img').attr('data-tempname',filePath);
							$('.logo_img').find('img').attr('data-name', fileName);
							$('.logo_img').find('img').attr('data-hostid',hostId);
							$('.logo_img').find('img').attr('data-delete',false);

						    _this.initFileUpload("#swfupload-control2", commonLang["파일 첨부"], true, uploadType);
                    	}else{
                    		$('.logo_img').find('img').attr('src',thumbnail);
							$('.logo_img').find('img').attr('data-tempname',filePath);
							$('.logo_img').find('img').attr('data-name', fileName);
							$('.logo_img').find('img').attr('data-hostid',hostId);
							$('.logo_img').find('img').attr('data-delete',false);
                    	}
                    }else{
                    	if(uploadType == 'favicon_thumnail_image'){
                    		$.goMessage(adminLang["ico포맷경고"]);
                    	}else{
                    		$.goMessage(commonLang["포멧 경고"]);
                    	}
                    }
                })
                .complete(function(e, data){
                    console.info(data);
                })
                .error(function(e, data){
                    console.info(data);
                });
			},
			initFileUploadForFavicon : function(fileId, btnText, isReload) {
				var fileAttachLang = adminLang["파일 찾기"],
                options = {
                    el : "#swfupload-control_favicon",
                    context_root : GO.contextRoot ,
                    button_text : "<span class='buttonText'>"+fileAttachLang+"</span>",
                    //button_style : "text-align:center",
                    progressBarUse : true,
					multiple : false,
					accept : '.ico',
                    url : "ad/api/file/logo?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
                };

	            (new FileUpload(options))
	            .queue(function(e, data){

	            })
	            .start(function(e, data){
	                var reExt = new RegExp("(.ico)","gi"),
	                    fileExt = data.type.toLowerCase();

	                if(!reExt.test(fileExt)){
	                	$.goMessage(adminLang["ico포맷경고"]);
	                    $("#progressbar").hide();
	                    return false;
	                }
	            })
	            .progress(function(e, data){

	            })
	            .success(function(e, serverData, fileItemEl){
	            	$("#fileComplete").children().remove();

	                if(GO.util.fileUploadErrorCheck(serverData)){
	                    $.goAlert(GO.util.serverMessage(serverData));
	                    return false;
	                }

	                var data = serverData.data,
	                    fileName = data.fileName,
	                    filePath = data.filePath,
	                    hostId = data.hostId,
	                    fileSize = GO.util.getHumanizedFileSize(data.fileSize),
	                    fileTmpl = "<li id='item_file'>"+
	                                    "<span class='item_file'>"+
	                                        "<span class='ic_file ic_def'></span>"+
	                                        "<span class='name'>"+fileName+"</span>"+
	                                        "<span class='size'>("+fileSize+")</span>"+
	                                        "<span class='btn_wrap' title='삭제'>"+
	                                            "<span class='ic_classic ic_del'></span>"+
	                                       "</span>"+
	                                   "</span>"+
	                                   "<input type='hidden' value='"+filePath+"' id='file_path'/>"+
	                                   "<input type='hidden' value='"+fileName+"' id='file_name'/>"+
	                                   "<input type='hidden' value='"+hostId+"' id='host_id'/>"+
	                                "</li>";
	                $("#fileComplete").html(fileTmpl);
	            })
	            .complete(function(e, data){
	                console.info(data);
	            })
	            .error(function(e, data){
	                console.info(data);
	            });
			},
			deleteCI: function(e){
				var deleteType = $(e.currentTarget).attr("data-target-id"),
					basicSrc = $(e.currentTarget).attr("data-basic-src"),
					deleteTarget = $("#" + deleteType);
				
				deleteTarget.attr("src",basicSrc).removeAttr("data-tempname").removeAttr("data-name").attr("data-delete", true);
			},
			uploadCI: function(e){
				var uploadType = $(e.currentTarget).siblings().attr('id');
				var labelDesc = uploadType == 'favicon_thumnail_image' ? adminLang['파비콘 포맷'] : adminLang["이미지포멧"];


				var uploadTmplVal = {
						label_text : adminLang["이미지 파일 선택"],
						label_desc : labelDesc,
						label_button : adminLang["파일 찾기"]
				};
				var tmpl = UploadTmpl({
						lang : uploadTmplVal
				});

				var popupEl = $.goPopup({
					targetEl : '.admin_body',
					header: adminLang["이미지 등록"],
					modal : true,
					buttons: [{
						btext : tmplVal['label_save'],
						btype : "confirm",
						autoclose : true,
						callback : function() {
							var popup = popupEl,
								thumbnail = popup.find('.logo_img').find('img').attr('src'),
								tempname = popup.find('.logo_img').find('img').attr('data-tempname'),
								name = popup.find('.logo_img').find('img').attr('data-name');
								hostId = popup.find('.logo_img').find('img').attr('data-hostid');
							var updateEl = $("#" + uploadType);
							updateEl.attr("src",thumbnail).attr("data-tempname",tempname).attr("data-name",name).attr("data-hostid", hostId).attr("data-delete", false);
						}
					}, {
						btext : tmplVal['label_cancel']
					}]
				});
				popupEl.find('.content').append(tmpl);
				this.initFileUpload("#swfupload-control", adminLang["파일 찾기"], false, uploadType);
			},
			changeModifyForm : function(e){
				var targetEl = $(e.currentTarget).parent();
				if(targetEl && targetEl.attr('data-formname')) {
					$(e.currentTarget).hide();
					targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_medium" value="', targetEl.attr('data-value'), '" />'].join(''))
						.find('input').focusin();

					var validateEl = targetEl.parent().find('#webTitleValidate');
					targetEl.find('input').keyup(function(e) {
						if(!$.goValidation.isCheckLength(1,32,$(e.currentTarget).val())){
						validateEl.html(App.i18n(tmplVal['label_validate'], {"arg1":"1","arg2":"32"}));
						}else{
							validateEl.empty();
						}
					});
				}
			},
			render : function() {
				var self = this;

				this.$el.empty();
				var dataset = this.collection.toJSON(),
					displayConfigModel = dataset[0].displayConfigModel,
					notiConfigModel = dataset[0].notiConfigModel;
				
				var tmpl = configTmpl({
					lang : tmplVal,
					selectTime: [
						{"value": "1"}, {"value": "2"}, {"value": "3"},
						{"value": "4"}, {"value": "5"}, {"value": "6"}
					],
					selectStyle: [
		              {"value" : "basic", "name" : adminLang['기본']}, {"value" : "blue", "name" : "BLUE"}, {"value" : "orange", "name" : "ORANGE"},
		              {"value" : "red", "name" : "RED"}, {"value" : "yellow", "name" : "YELLOW"}, {"value" : "green", "name" : "GREEN"}
					],
					dataset : dataset
				});
				this.$el.html(tmpl);
				self.$el.find('#storagePerior').val(notiConfigModel.storagePerior);
				self.$el.find('#style').val(displayConfigModel.style);
				$('input[name="skin"][value="'+displayConfigModel.skin+'"]').attr('checked', true);
				$('input[name="theme"][value="'+displayConfigModel.theme+'"]').attr('checked', true);
				$('input[name="welcomeScreen"][value="'+displayConfigModel.welcomeScreen+'"]').attr('checked', true);
				$('input[name="blockPasswordChange"][value="'+displayConfigModel.blockPasswordChange+'"]').attr('checked', true);

				this.initFileUploadForFavicon("#swfupload-control_favicon", adminLang["파일 찾기"], false);

				return this.$el;
			},
			etcConfigSave : function(){
				var self = this,
					form = this.$el.find('form[name="formBaseConfig"]'),
					$loginThumbail = $("#login_thumnail_image"),
					$mobileThumbail = $("#mobile_thumnail_image"),
					$thumbnail = $("#thumnail_image"),
					$thumbnailAdvanced = $("#thumnail_image_advanced"),
					validate = true;

				self.model = new Backbone.Model();
				self.model.url = GO.contextRoot + "ad/api/etcconfig";
				self.model.set('webTitle', self.collection.models[0].get('displayConfigModel').webTitle, {silent: true});
				$.each(form.serializeArray(), function(k,v) {
					if(v.name == 'webTitle' && (!$.goValidation.isCheckLength(1,32,v.value))){
						validate = false;
						$('#webTitle').focus();
						this.$el.find('#webTitleValidate').html(App.i18n(tmplVal['label_validate'], {"arg1":"1","arg2":"32"}));
						return false;
					}
					self.model.set(v.name, v.value, {silent: true});
				});
				self.model.set('useNoti', true, {silent: true});	// 알림기본설정을 사용함으로 간주한다.(기획서 변경)
				self.model.set({
					loginTmpName: $loginThumbail.attr("data-tempname"), 
					loginOriginalName:$loginThumbail.attr("data-name"), 
					loginHostId: $loginThumbail.attr("data-hostid"), 
					loginDeleteFlag: $loginThumbail.attr("data-delete")
				});
				self.model.set({
					mobileTmpName: $mobileThumbail.attr("data-tempname"), 
					mobileOriginalName:$mobileThumbail.attr("data-name"), 
					mobileHostId: $mobileThumbail.attr("data-hostid"), 
					mobileDeleteFlag: $mobileThumbail.attr("data-delete")
				});
				self.model.set({
					tmpName: $thumbnail.attr("data-tempname"), 
					originalName:$thumbnail.attr("data-name"), 
					hostId: $thumbnail.attr("data-hostid"), 
					deleteFlag: $thumbnail.attr("data-delete")
					});
                self.model.set({
                	advancedTmpName: $thumbnailAdvanced.attr("data-tempname"), 
                	advancedOriginalName:$thumbnailAdvanced.attr("data-name"), 
                	advancedHostId: $thumbnailAdvanced.attr("data-hostid"), 
                	advancedDeleteFlag: $thumbnailAdvanced.attr("data-delete")
            	});
				self.model.set({
					faviconTmpName: $("#file_path").val(), 
					faviconOriginalName:$("#file_name").val(), 
					faviconHostId: $("#host_id").val(), 
					faviconDeleteFlag: $("#favicon-data-delete").val()
				});

				if(!validate){
					return false;
				}

				self.model.save({}, {
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(tmplVal['label_sucess']);
							self.collection = EtcConfigCollection.getCollection();
							self.render();
						}
					},
					error : function(model, response) {
						self._errorFunction(response);
					}
				});
			},
			_errorFunction : function(response) {
				var self = this;
				var responseData = JSON.parse(response.responseText),
					message = responseData.message,
					name = responseData.name,
					errorName = name.split("."),
					formName = errorName[errorName.length-1];
				if(responseData != null){
					if(formName == 'webtitle'){
						self._errorMessage('webTitle', message);
					}else{
						$.goAlert(tmplVal['label_fail'],responseData.message);
					}
				}else{
					$.goMessage(tmplVal['label_failDesc']);
				}
			},
			_errorMessage : function(id, message){
				$('#'+id).focus();
				$.goAlert(tmplVal['label_fail'],message);
			},
			etcConfigCancel: function(){
				var self = this;
				$.goCaution(tmplVal['label_cancel'], commonLang["변경한 내용을 취소합니다."], function(){
					self.render();
					$.goMessage(commonLang["취소되었습니다."]);
				}, tmplVal['label_save']);
			},
		},{
			__instance__: null
		});
		return EtcConfig;
	});

}).call(this);