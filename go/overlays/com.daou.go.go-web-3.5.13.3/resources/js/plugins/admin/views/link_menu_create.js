(function(){
	define([
	    "jquery",
	    "backbone",
	    "app",
	    "admin/models/install_info",
	    "admin/models/link_menu",	    
	    "attach_file",
	    "hgn!admin/templates/link_menu_create",
	    "hgn!admin/templates/link_menu_update",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "file_upload",
	    "jquery.go-validation",
	    "jquery.go-popup"
	],
	function(
		$,
		Backbone,
		App,
		InstallInfoModel,
		LinkMenuModel,
		AttachView,
		LinkMenuCreateTmpl,
		LinkMenuUpdateTmpl,
		commonLang,
		adminLang,
		FileUpload
	){
		var tmplVal = {
			label_quick_link_setting : adminLang['바로가기 버튼 설정'],
			label_quick_link_tip : adminLang['PC 메신저 바로가기 버튼 설명'],
			label_button : adminLang['버튼명'],
			label_url : adminLang['바로가기 URL'],
			label_confirm: commonLang["확인"],
			label_sucess: commonLang["저장되었습니다."],
			label_fail: commonLang["실패"],
			label_failDesc: commonLang["실패했습니다."],
			label_edit: commonLang["수정"],
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_use: adminLang["사용함"],
			label_notuse: commonLang["사용하지 않음"],
			label_delete: commonLang["삭제"],
			label_order: adminLang["순서 바꾸기"],
			label_setting: commonLang["설정"],
			label_able : adminLang["사용여부"],
			label_icon : adminLang["아이콘"],
			label_btn_name : adminLang["버튼명"],
			label_add_btn_name : adminLang["버튼명 언어항목 추가"],
			label_location : adminLang["바로가기 이동 방식"],
			label_new : adminLang["새 브라우저 사용"],
			label_popup : adminLang["팝업창 사용"],
			label_exe : adminLang["실행파일 사용"],
			label_exe_name : adminLang["실행파일명"],
			label_ko: adminLang["KO"],
			label_en: adminLang["EN"],
			label_jp: adminLang["JP"],
			label_zhcn : adminLang["ZH-CN"],
			label_zhtw : adminLang["ZH-TW"],
			label_vi : adminLang["VI"],
			label_img_size_info : adminLang["이미지 리사이즈 설명"],
			label_info_add_select : adminLang["추가할 항목을 선택하세요."],
			label_popup_size_exam : adminLang["※ 크기는 최소 100x100 부터, 최대 1024x768 까지 가능합니다."],
			label_locaion_exam : adminLang["페이지가 나타나지 않을 때 http:// 포함 설명"],
			label_status : adminLang["활성화 여부"]
		};
		
		var LinkMenuCreate = App.BaseView.extend({
			el:'.layer_normal .content',
			/*tagName: 'div',
			className: 'linkMenuCreate',*/
			events: {
				'change #more_link_name' : 'addMoreLinkName',
				'click span.btn_box[data-btntype="changepopupname"]' : 'changeModifyName',
				'click span.btn_box[data-btntype="changepopupurl"]' : 'changeModifyUrl',
				'click #delete_icon' : 'deleteIcon',
				'click input:radio' : 'toggleRadio',
				'keyup input:text' : 'countAlphabet'
			},
			initialize : function(options) {
				this.options = options || {};
				this.linkMenuId = this.options.linkMenuId;
				this.release();
				this.model = LinkMenuModel.create();
				GO.EventEmitter.off('admin');
				GO.EventEmitter.on('admin', 'changed:saveLinkMenu', function(){this.saveLinkMenu(arguments[0]);}, this);
			},
			render : function() {
				var contents;
				var companyLocale,
				installLocale = InstallInfoModel.read().toJSON().language;
				if(installLocale == 'ja'){ 
					companyLocale = 'jp'; 
				}else if(installLocale == 'zh_CN'){ 
					companyLocale = 'zhcn';
				}else if(installLocale == 'zh_TW'){ 
					companyLocale = 'zhtw'; 
				}else {
					companyLocale = installLocale;
				}
				
				if(this.linkMenuId){
					var self = this;
					if(this.model != null) {
						this.model.clear();
					}
					this.model = LinkMenuModel.read(this.linkMenuId);
					
					contents = LinkMenuUpdateTmpl({
						lang : tmplVal,
						popupmodel : this.model.toJSON(),
						isKoLocale : function() {
							return self.getCompanyLocale(companyLocale, 'ko');
						},
						isEnLocale : function(){
							return self.getCompanyLocale(companyLocale, 'en');
						},
						isJpLocale : function(){
							return self.getCompanyLocale(companyLocale, 'jp');
						},
						isZhcnLocale : function(){
							return self.getCompanyLocale(companyLocale, 'zhcn');
						},
						isZhtwLocale : function(){
							return self.getCompanyLocale(companyLocale, 'zhtw');
						},
						isViLocale : function(){
							return self.getCompanyLocale(companyLocale, 'vi');
						},
						icon : function(){
							if(self.model.get('attach')){
								return self.model.get('attach').thumbLarge;
							}
						},
						id : function(){
							if(self.model.get('attach')){
								return self.model.get('attach').id;
							}
						},
						isSystemLink : function(){
							return self.model.get('systemLink');
						}
					});
					this.$el.html(contents);
					var location = this.model.get('location');
					$('input[name="location"][value="'+location.toLowerCase()+'"]').attr('checked', true);
					if(this.model.get('location') == 'new'){
						$('#popupSize').hide();
					}
					if(this.model.get('location') == 'exe') {
						$('#popupSize').hide();
						$('#exeLabel').show();
						$('#urlLabel').hide();
						$('#urlDesc').hide();
					}
					var useQuickLink = this.model.get('useQuickLink');
					$('input[name="useQuickLink"][value="'+useQuickLink+'"]').attr('checked', true);
					this.setModifyMenuData(this.model.toJSON());
				}
				else {
					var self = this;
					contents = LinkMenuCreateTmpl({
						lang : tmplVal,
						isKoLocale : function() {
							return self.getCompanyLocale(companyLocale, 'ko');
						},
						isEnLocale : function(){
							return self.getCompanyLocale(companyLocale, 'en');
						},
						isJpLocale : function(){
							return self.getCompanyLocale(companyLocale, 'jp');
						},
						isZhcnLocale : function(){
							return self.getCompanyLocale(companyLocale, 'zhcn');
						},
						isZhtwLocale : function(){
							return self.getCompanyLocale(companyLocale, 'zhtw');
						},
						icon : function(){
							return GO.contextRoot + "/resources/images/pc_msg/icon_rink.png";
						},
					});
					this.$el.html(contents);
				}
				this.initProfileUpload();
			},
			getCompanyLocale : function(companyLocale, param){
				if(companyLocale == param) return true;
				return false;
			},
			setModifyMenuData : function(data) {
				if(data.koname){
					$('tr[data-id="konameInput"]').show();
					$('#more_link_name > option[value="koname"]').remove();
				}
				if(data.enname){
					$('tr[data-id="ennameInput"]').show();
					$('#more_link_name > option[value="enname"]').remove();
				}
				if(data.jpname){
					$('tr[data-id="jpnameInput"]').show();
					$('#more_link_name > option[value="jpname"]').remove();
				}
				if(data.zhcnname){
					$('tr[data-id="zhcnnameInput"]').show();
					$('#more_link_name > option[value="zhcnname"]').remove();
				}
				if(data.zhtwname){
					$('tr[data-id="zhtwnameInput"]').show();
					$('#more_link_name > option[value="zhtwname"]').remove();
				}
				if(data.viname){
					$('tr[data-id="vinameInput"]').show();
					$('#more_link_name > option[value="viname"]').remove();
				}
				if($('#more_link_name option').size() == 1){
	            	$('tr[data-id="addMenuName"]').hide();
	            }
			},
			addMoreLinkName : function(e) {
	        	$("[data-id=\""+e.target.value + "Input\"]").show();
	            $(e.target).find(":selected").remove();
	            if($('#more_link_name option').size() == 1){
	            	$('[data-id="addMenuName"]').hide();
	            }
	        },
	        saveLinkMenu : function(arg) {
	        	var self = this,
	        		type = 'POST',
	        		validate = true,
	        		companyLocale = InstallInfoModel.read().toJSON().language,
	        		isPopup = $('input[name="location"][value="popup"]').is(":checked"),
	        		isExe = $('input[name="location"][value="exe"]').is(":checked");;
	        	var form = $('form[name=formCreateLinkMenu]');
	        	if(this.linkMenuId){
	        		form = $('form[name=formUpdateLinkMenu]');
	        		type = 'PUT';
	        	}
	        	//this.validation(form);
	        	$.each(form.serializeArray(), function(k,v){
	        		var nameValidateEl = $('#'+companyLocale+'nameValidate');
					if(v.name == companyLocale+'name' && (!$.goValidation.isCheckLength(1,16,v.value))){
						validate = false;
						nameValidateEl.html(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"16"}));
						$('#' + v.name).focus();
						return false;
					}else if((v.name).indexOf("name") > -1 && v.value.length > 0 && (!$.goValidation.isCheckLength(1,16,v.value))){
						validate = false;
						var etcNameValidateEl = $('#'+v.name+'Validate');
						etcNameValidateEl.html(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"16"}));
						$('#' + v.name).focus();
						return false;
					}else{
						nameValidateEl.empty();
					}
					
					if(v.name == 'url' && v.value == ""){
						validate = false;
						if(isExe) {
							$('#exeValidate').html(adminLang['실행파일명을 입력하세요.']);
						} else {
							$('#urlValidate').html(adminLang['url을 입력해주세요.']);
						}
						$('#' + v.name).focus();
						return false;
					}else{
						$('#urlValidate').empty();
					}
					
					if(v.name == 'popupWidth' && isPopup && (!$.goValidation.isNumber(v.value))){
						validate = false;
						$('#' + v.name + 'Validate').html(adminLang['숫자만 입력하세요.']);
						$('#' + v.name).focus();
						return false;
					}else if(v.name == 'popupWidth' && isPopup && v.value == ""){
						validate = false;
						$('#' + v.name + 'Validate').html(adminLang['크기를 변경해주세요.']);
						$('#' + v.name).focus();
						return false;
					}else if(v.name == 'popupWidth' && isPopup && (v.value < 100 || v.value > 1024)){
						validate = false;
						$('#' + v.name + 'Validate').html(adminLang['크기를 변경해주세요.']);
						$('#' + v.name).focus();
						return false;
					}else{
						$('#' + v.name + 'Validate').empty();
					}
					
					if(v.name == 'popupHeight' && isPopup && (!$.goValidation.isNumber(v.value))){
						validate = false;
						$('#' + v.name + 'Validate').html(adminLang['숫자만 입력하세요.']);
						$('#' + v.name).focus();
						return false;
					}else if(v.name == 'popupHeight' && isPopup && v.value == ""){
						validate = false;
						$('#' + v.name + 'Validate').html(adminLang['크기를 변경해주세요.']);
						$('#' + v.name).focus();
						return false;
					}else if(v.name == 'popupHeight' && isPopup && (v.value < 100 || v.value > 1024)){
						validate = false;
						$('#' + v.name + 'Validate').html(adminLang['크기를 변경해주세요.']);
						$('#' + v.name).focus();
						return false;
					}else{
						$('#' + v.name + 'Validate').empty();
					}
					
	        		self.model.set(v.name, v.value, {silent: true});
	        	});
	        	
	        	if(!validate){
					return false;
				}
	        	this.model.set("attach", this.getAttach());
	        	this.model.save({}, {
					type : type,
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							arg.close();
							GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						}
					},
					error : function(model, response) {
						var responseData = JSON.parse(response.responseText);
						$.goMessage(responseData.message);
						arg.close();
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					}
				});
	        },
	        deleteIcon : function(e) {
	        	var attachEl = $(e.currentTarget).parents("td").find('span.img_appicon img');
	        	console.log(this.model.toJSON());
	        	console.log(this.model.toJSON().defaultIcon);
	        	attachEl.attr("src", this.model.toJSON().defaultIcon);
	        	attachEl.attr("data-id","");
	        },
	        getAttach : function() {
	        	var attachEl = $('.img_appicon img');
				var attach = {
						id : attachEl.attr("data-id") || null,
						path : attachEl.attr("data-filepath"),
						name : attachEl.attr("data-filename"),
						hostId : attachEl.attr("data-hostId")
					};
				return attach;
			},
			changeModifyName : function(e){
	        	var targetEl = $(e.currentTarget).parent(),
	        		targetValue = targetEl.val(),
	        		essential = $(e.currentTarget).attr('data-locale'),
					essentialName = essential != undefined ? essential + 'Name' : '';
	        	
				if(targetEl && targetEl.attr('data-formname')) {
					$(e.currentTarget).hide();
					targetEl.html(['<input type="text" name="', targetEl.attr('data-formname'), '" class="input w_space_r " value="', targetEl.attr('data-value'), '" /> <span class="alphabetCount">' ,targetEl.attr('data-value').length, ' / 16</span>'].join(''))
						.find('input').focusin();
					
					var validateEl = targetEl.parent().find('#'+targetEl.attr('data-formname')+ 'Validate');
					targetEl.find('input').keyup(function(e) {
					
						if(targetEl.attr('data-formname') == essentialName && !$.goValidation.isCheckLength(1,16,$(e.currentTarget).val())){
							validateEl.html(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"16"}));
						}else if(targetEl.attr('data-formname') != essentialName && $(e.currentTarget).val().length > 0 && (!$.goValidation.isCheckLength(1,16,$(e.currentTarget).val()))){
							validateEl.html(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"16"}));
						}else{
							validateEl.empty();
						}
					});
				}
	        },
	        changeModifyUrl : function(e) {
	        	var targetEl = $(e.currentTarget).parent();
				if(targetEl && targetEl.attr('data-formname')) {
					$(e.currentTarget).hide();
					targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_full" value="', targetEl.attr('data-value'), '" />'].join(''))
						.find('input').focusin();
					
					var validateEl = targetEl.parent().find('#'+targetEl.attr('data-formname')+ 'Validate');
					targetEl.find('input').keyup(function(e) {
						if(!$.goValidation.isCheckLength(1,128,$(e.currentTarget).val())){
						validateEl.html(App.i18n(tmplVal['label_validate'], {"arg1":"1","arg2":"128"}));
						} else{
							validateEl.empty();
						}
					});
				}
	        },
	        toggleRadio : function(e){
	        	if($(e.currentTarget).attr('value') == "new"){
	        		$('#popupSize').hide();
	        		$('#exeLabel').hide();
	        		$('#urlLabel').show();
	        		$('#urlDesc').show();
				}else if($(e.currentTarget).attr('value') == "popup"){
					$('#popupSize').show();
					$('#exeLabel').hide();
					$('#urlLabel').show();
					$('#urlDesc').show();
				} else if($(e.currentTarget).attr('value') == "exe") {
					$('#popupSize').hide();
					$('#exeLabel').show();
					$('#urlLabel').hide();
					$('#urlDesc').hide();
				}
	        },
	        countAlphabet : function(e){
	        	var count = $(e.currentTarget).attr('value').length;
	        	$(e.currentTarget).parents('td').find('.alphabetCount').html(count+" / 16");
	        	if(count > 15){
	        		$(e.currentTarget).parents('td').find('.alphabetCount').addClass('go_alert');
	        	}else{
	        		$(e.currentTarget).parents('td').find('.alphabetCount').removeClass('go_alert');
	        	}
	        },
			initProfileUpload : function(){
                var _this = this,
                    options = {
                        el : "#swfupload-control",
                        context_root : GO.contextRoot ,
                        button_text : "<span class='buttonText'>찾아보기</span>",
                        button_style : "text-align:center; color:#9f9f9f; font-weight:bold; font-size:12px; display:inline-block; background:#fff; border:1px solid #cfcfcf; cursor:pointer; font-family:gulim;",
                        button_height : '22px',
                        button_width : '60px',
						top_padding : 2,
                        progressBarUse : false,
                        url : "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
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
                        hostId = data.hostId,
                        thumbnail = data.thumbnail,
                        fileExt = data.fileExt.toLowerCase(),
                        re =  new RegExp("(jpeg|jpg|gif|png|bmp)","gi");
                    var test = re.test(fileExt);
                    if(test){
                        $("#thumbnail_image")
                            .attr("src",thumbnail)
                            .attr("data-filepath",filePath)
                            .attr("data-filename",fileName)
                            .attr("host-id", hostId)
                            .attr("data-id", null)
                    }else{
                        $.goMessage(commonLang["포멧 경고"]);
                    }
                })
                .complete(function(e, data){
                    console.info(data);
                })
                .error(function(e, data){
                    console.info(data);
                });
            },
            release: function() {
    			this.$el.off();
    			this.$el.empty();
    		}
		},{
			__instance__:null,
			
			create: function(opt) {
				var instance = new LinkMenuCreate({linkMenuId:opt ? opt.linkMenuId : ''});
				instance.linkMenuId = opt ? opt.linkMenuId : '';
				return instance.render();
			}
		});
		
		return {
			render: function(opt) {
				var layout = LinkMenuCreate.create(opt);
				return layout;
			}		
		};
	});
}).call(this);