define([
	"jquery",
	"backbone", 	
	"app",
	"admin/models/install_info",
    "hgn!system/templates/device_version_create",
    "hgn!system/templates/device_version_modify",
    "hgn!system/templates/attaches_file",
    "hgn!system/templates/attaches",
    "system/models/device_version",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "file_upload",
    "jquery.go-orgslide",
    "jquery.go-sdk",
    "jquery.go-validation"
], 

function(
	$, 
	Backbone,
	App,
	InstallInfoModel,
	deviceCreateTmpl,
	deviceModifyTmpl,
	attachesFileTpl,
	attachesTpl,
	deviceModel,
	commonLang,
	adminLang,
	FileUpload
) {
	var tmplVal = {
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_modify: commonLang["수정"],
			label_title_add: adminLang["버전 추가"],
			label_title_modify: adminLang["버전 상세"],
			label_list: adminLang["목록으로 돌아가기"],
			label_device: adminLang["디바이스"],
			label_pc: adminLang["PC"],
			label_pc_electron: "PC - Electron",
			label_pc_mac: "PC - MAC",
			label_pc_xp: adminLang["PC_XP"],
			label_iphone: adminLang["iPhone"],
			label_android: adminLang["Android"],
			label_importance: adminLang["중요도"],
			label_urgent: adminLang["긴급"],
			label_high: adminLang["상"],
			label_medium: adminLang["중"],
			label_low: adminLang["하"],
			label_version: adminLang["버전"],
			label_version_ex: adminLang["버전 설명"],
			label_ko_message: adminLang["한글 업데이트 메세지"],
			label_en_message: adminLang["영문 업데이트 메세지"],
			label_jp_message: adminLang["일문 업데이트 메세지"],
			label_zhcn_message: adminLang["중문 간체 업데이트 메세지"],
			label_zhtw_message: adminLang["중문 번체 업데이트 메세지"],
			label_vi_message: adminLang["베트남어 업데이트 메세지"],
			label_ko_contents: adminLang["한글 업데이트 내용"],
			label_en_contents: adminLang["영문 업데이트 내용"],
			label_jp_contents: adminLang["일문 업데이트 내용"],
			label_zhcn_contents: adminLang["중문 간체 업데이트 내용"],
			label_zhtw_contents: adminLang["중문 번체 업데이트 내용"],
			label_vi_contents: adminLang["베트남어 업데이트 내용"],
			label_message_desc: adminLang["업데이트 메세지 설명"],
			label_package_upload: adminLang["패키지 업로드"],
			label_file: adminLang["파일 찾기"],
			label_link_info: adminLang["링크정보"],
			label_note: adminLang["비고"],
			label_inhouse: adminLang["InHouse"],
			label_market: adminLang["Market"],
			label_info_add : adminLang["항목추가"],
			label_info_add_select : adminLang["추가할 항목을 선택하세요."],
			label_upload : adminLang["업로드"],
			label_link : adminLang["링크"],
			label_link_message : adminLang["링크안내메세지"],
			label_market_url_message : adminLang["마켓안내메세지"],
			label_note_message : adminLang["비고안내메세지"],
			label_market_url : adminLang["마켓 URL"],
			label_file_upload_validation : adminLang["파일 업로드 유효성체크"],
			label_market_url_validation : adminLang["마켓 링크 유효성체크"]

		};
	var instance = null;
	var contactCompanyCreate = App.BaseView.extend({
		initialize : function(options) {
			this.options = options || {};
			this.deviceId = this.options.deviceId;
			this.unbindEvent();
			this.bindEvent();
		},
		unbindEvent : function() {
			this.$el.off("click", "span#btn_device_version_ok");
			this.$el.off("click", "span#btn_device_version_modify");
			this.$el.off("click", "span#btn_device_version_cancel");
			this.$el.off("click", "span.ic_del");
			this.$el.off("keyup", "input#version");
			this.$el.off("click", "input:radio[name='deviceType']");
			this.$el.off("click", "input:radio[name='linkType']");
			this.$el.off("click", "input:radio[name='marketType']");
			this.$el.off("change", "#more_message");
			this.$el.off("change", "#more_contents");
		},
		bindEvent : function() {
			this.$el.on("click", "span#btn_device_version_ok", $.proxy(this.deviceVersionSave, this));
			this.$el.on("click", "span#btn_device_version_modify", $.proxy(this.deviceVersionModify, this));
			this.$el.on("click", "span#btn_device_version_cancel", $.proxy(this.deviceVersionCancel, this));
			this.$el.on("click", "span.ic_del", $.proxy(this.cancelUploadFile, this));
			this.$el.on("keyup", "input#version", $.proxy(this.validationVersion, this));
			this.$el.on("click", "input:radio[name='deviceType']", $.proxy(this.toggleDeviceType, this));
			this.$el.on("click", "input:radio[name='linkType']", $.proxy(this.toggleLinkType, this));
			this.$el.on("click", "input:radio[name='marketType']", $.proxy(this.toggleMarketType, this));
			this.$el.on("change", "#more_message", $.proxy(this.addMoreMessage, this));
			this.$el.on("change", "#more_contents", $.proxy(this.addMoreContents, this));
		},
		addMoreContents : function(e) {
			e.stopPropagation();
			$("#"+e.target.value).show();
            $(e.target).find(":selected").remove();
            if($('#more_contents option').size() == 1){
            	$('#addUpdateContents').hide();
            }
		},
		addMoreMessage : function(e) {
			e.stopPropagation();
			$("#"+e.target.value).show();
            $(e.target).find(":selected").remove();
            if($('#more_message option').size() == 1){
            	$('#addUpdateMessage').hide();
            }
		},
		toggleDeviceType : function(e) {
            e.stopPropagation();
            $('span#marketType').remove();
            $('#marketLink').hide();
            $('#packageUpload').show();

            var value = $(e.currentTarget).attr('value');
            if(value == "android" || value == "iphone"){
                this.appendMarketType(e);
            }
        },
        toggleMarketType : function(e) {
            e.stopPropagation();
            var value = $(e.currentTarget).attr('value');
            if(value == "market" ){
                $('#packageUpload').hide();
                $('#marketLink').show();
                //링크Url, 파일 업로드 초기화
                this.$el.find('#file_link').val('');
                $("span.ic_del").parents('li').remove();
            } else {
                $('#marketLink').hide();
                $('#packageUpload').show();
                //마켓Url 초기화
                $('#marketUrl').val('');
			}
        },
		appendMarketType : function(e) {
            var marketTypeHtml = [];
            marketTypeHtml.push('<span class="option_wrap" id="marketType">');
            marketTypeHtml.push('(');
            marketTypeHtml.push('<input type="radio" name="marketType" value="inhouse" id="inhouse" checked="checked"/> <label for="inhouse">' + tmplVal["label_inhouse"]+ '</label>');
            marketTypeHtml.push('<input type="radio" name="marketType" value="market" id="market"/> <label for="market">'+tmplVal["label_market"]+'</label>');
            marketTypeHtml.push(')');
            marketTypeHtml.push('</span>');
            $(e.currentTarget).parent().parent().append(marketTypeHtml.join(''));
		},
		toggleLinkType : function(e) {
			e.stopPropagation();
			if($(e.currentTarget).attr('value') == "upload"){
				$('span#file_upload_btn').show();
				$('span#file_layer').show();
				$('span#file_upload_link').hide();
                $('#marketUrl').val('');
                $('#file_link').val('');
			}else{
				$('span#file_upload_btn').hide();
				$('span#file_layer').hide();
				$('span#file_upload_link').show();
                $('#marketUrl').val('');
                $("span.ic_del").parents('li').remove();
			}
		},
		validationVersion : function(e) {
			e.stopPropagation();
			if(e.keyCode >= 96 && e.keyCode <= 105|| e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 13 || e.keyCode == 8 || e.keyCode == 190 || e.keyCode == 110){
			}
			else{
				$.goMessage(adminLang["버전 형식을 지켜주세요!! 예) 1.1.1.1"]);
				e.currentTarget.value = '';
				return false;
			}
		},
		getCompanyLocale : function(companyLocale, param){
				if(companyLocale == param) return true;
				return false;
			},
		render : function() {
			var tmpl;
			var self = this;
			var companyLocale;
				var installLocale = InstallInfoModel.read().toJSON().language;
				if(installLocale == 'ja'){ 
					companyLocale = 'jp'; 
				}else if(installLocale == 'zh_CN'){ 
					companyLocale = 'zhcn';
				}else if(installLocale == 'zh_TW'){ 
					companyLocale = 'zhtw'; 
				}else if(installLocale == 'vi'){
					companyLocale = 'vi';
				}else {
					companyLocale = installLocale;
				}
			$('.breadcrumb .path').html(adminLang["모빌리티 > 모바일 앱 버전 관리"]);
			this.$el.empty();
			$('#mobilty').addClass('on');
			if(this.deviceId){
				this.deviceModel = deviceModel.get(this.deviceId);
				this.deviceData = this.deviceModel.toJSON();
				tmpl = deviceModifyTmpl({
					dataset : this.deviceData,
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
					isViLocale : function(){
						return self.getCompanyLocale(companyLocale, 'vi');
					},
                    isAndroidType : function() {
                        return this.deviceType == 'android';
                    }
				});
				this.$el.html(tmpl);
				this.setDeviceModifyData(this.deviceData);
				this.initSWFUpload();
			}else{
				tmpl = deviceCreateTmpl({
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
					isViLocale : function(){
						return self.getCompanyLocale(companyLocale, 'vi');
					}
				});	
				this.$el.html(tmpl);
				this.initSWFUpload();
			}
			this.$el.find('#installLocale').val(companyLocale);
		},
		setDeviceModifyData: function(data) {
			this.$el.find("#deviceId").val(data.id);
			this.$el.find('input[name="deviceType"][value="'+data.deviceType+'"]').attr('checked', true);
			this.$el.find('input[name="importance"][value="'+data.importance+'"]').attr('checked', true);
			this.$el.find('input[name="linkType"][value="'+data.linkType+'"]').attr('checked', true);
			this.$el.find('#version').val(data.version);
			this.$el.find('#note').val(data.note);
            this.$el.find('#marketUrl').val(data.marketUrl);
			var locale = this.$el.find('#installLocale').val();
			
			this.$el.find('#more_message > option[value="'+locale+'UpdateMessage"]').remove();
			this.$el.find('#more_contents > option[value="'+locale+'UpdateContents"]').remove();

			if(data.koUpdateMessage){
				this.$el.find('#koUpdateMessage').show();
				this.$el.find('textarea#koUpdateMessage').val(data.koUpdateMessage);
				this.$el.find('#more_message > option[value="koUpdateMessage"]').remove();
			}
			if(data.enUpdateMessage){
				this.$el.find('#enUpdateMessage').show();
				this.$el.find('textarea#enUpdateMessage').val(data.enUpdateMessage);
				this.$el.find('#more_message > option[value="enUpdateMessage"]').remove();
			}
			if(data.jpUpdateMessage){
				this.$el.find('#jpUpdateMessage').show();
				this.$el.find('textarea#jpUpdateMessage').val(data.jpUpdateMessage);
				this.$el.find('#more_message > option[value="jpUpdateMessage"]').remove();
			}
			if(data.zhcnUpdateMessage){
				this.$el.find('#zhcnUpdateMessage').show();
				this.$el.find('textarea#zhcnUpdateMessage').val(data.zhcnUpdateMessage);
				this.$el.find('#more_message > option[value="zhcnUpdateMessage"]').remove();
			}
			if(data.zhtwUpdateMessage){
				this.$el.find('#zhtwUpdateMessage').show();
				this.$el.find('textarea#zhtwUpdateMessage').val(data.zhtwUpdateMessage);
				this.$el.find('#more_message > option[value="zhtwUpdateMessage"]').remove();
			}
			if(data.viUpdateMessage){
				this.$el.find('#viUpdateMessage').show();
				this.$el.find('textarea#viUpdateMessage').val(data.viUpdateMessage);
				this.$el.find('#more_message > option[value="viUpdateMessage"]').remove();
			}
			
			if(data.koUpdateContents){
				this.$el.find('#koUpdateContents').show();
				this.$el.find('textarea#koUpdateContents').val(data.koUpdateContents);
				this.$el.find('#more_contents > option[value="koUpdateContents"]').remove();
			}
			if(data.enUpdateContents){
				this.$el.find('#enUpdateContents').show();
				this.$el.find('textarea#enUpdateContents').val(data.enUpdateContents);
				this.$el.find('#more_contents > option[value="enUpdateContents"]').remove();
			}
			if(data.jpUpdateContents){
				this.$el.find('#jpUpdateContents').show();
				this.$el.find('textarea#jpUpdateContents').val(data.jpUpdateContents);
				this.$el.find('#more_contents > option[value="jpUpdateContents"]').remove();
			}
			if(data.zhcnUpdateContents){
				this.$el.find('#zhcnUpdateContents').show();
				this.$el.find('textarea#zhcnUpdateContents').val(data.zhcnUpdateContents);
				this.$el.find('#more_contents > option[value="zhcnUpdateContents"]').remove();
			}
			if(data.zhtwUpdateContents){
				this.$el.find('#zhtwUpdateContents').show();
				this.$el.find('textarea#zhtwUpdateContents').val(data.zhtwUpdateContents);
				this.$el.find('#more_contents > option[value="zhtwUpdateContents"]').remove();
			}
			if(data.viUpdateContents){
				this.$el.find('#viUpdateContents').show();
				this.$el.find('textarea#viUpdateContents').val(data.viUpdateContents);
				this.$el.find('#more_contents > option[value="viUpdateContents"]').remove();
			}
            if (data.marketType == 'market') {
                this.$el.find('#packageUpload').hide();
                this.$el.find('#marketLink').show();
            } else {
                this.$el.find('#packageUpload').show();
                this.$el.find('#marketLink').hide();
            }

            if (data.deviceType == 'android' || data.deviceType == 'iphone') {
                this.$el.find('#marketType').show();
            } else {
                this.$el.find('#marketType').hide();
			}

            $('input:radio[name="marketType"][value="'+data.marketType+'"]').attr("checked", "checked");

			this.$el.find("#linkType").val(data.linkType);
			if(data.linkType == 'upload'){
				$('span#file_upload_link').hide();
				$('span#file_upload_btn').show();
				if(data.deviceVersionAttach != null){
					this.$el.find('.file_wrap').html(attachesTpl({
						dataset : data.deviceVersionAttach,
						linkUrl : data.linkUrl,
						label_link_info : adminLang["링크정보"]
					}));
					$('#fileName').attr('data-name', data.deviceVersionAttach.name);
					$('#linkinfo').append('<span id="device_download" class="btn_wrap"><span class="btn_s" id="btn_down"><a href="' + GO.contextRoot + 'ad/api/system/device/download/'+ data.deviceVersionAttach.id +'">'+ adminLang["다운로드"] +'</a></span></span>');
				}
			}else{
				$('span#file_upload_link').show();
				$('span#file_upload_btn').hide();
				
				this.$el.find('#file_link').val(data.linkUrl);
			}
		},
		initSWFUpload : function() {
			var self = this,
				fileAttachLang = tmplVal.label_file;
				options = {
					el : "#swfupload-control",
                    context_root : GO.contextRoot ,
                    button_text : "<span class='buttonText'>"+fileAttachLang+"</span>",
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
					$.goAlert(GO.util.serverMessage(serverData));
					return false;
				}
				var data = serverData.data;
				var fileName = data.fileName;
				var filePath = data.filePath;
				var hostId = data.hostId;
				var fileExt = data.fileExt.toLowerCase();
				var re =  new RegExp("(ipa|zip|apk|exe|dmg)","gi");
				var test = re.test(fileExt);
				
				if(test){
					$('.file_wrap').html(attachesFileTpl({
						dataset : data,
						name : fileName,
						linkInfo : false,
					}));
					$('#fileName').attr('data-tempname', filePath);
					$('#fileName').attr('data-name', fileName);
					$('#fileName').attr('host-id', hostId);
					//$('#file_upload_btn').hide();
				}else{
					$.goMessage(adminLang["패키지 확장자경고"]);
				}
            })
            .complete(function(e, data){
                console.info(data);
            })
            .error(function(e, data){
                console.info(data);
            });
		},
		deviceVersionSave : function(e) {
			e.stopPropagation();
			
			var deviceType = $('input[name="deviceType"]:radio:checked').val(),
				importance = $('input[name="importance"]:radio:checked').val(),
				version = $('#version').val(),
				koUpdateMessage = $('textarea#koUpdateMessage').val(),
				enUpdateMessage = $('textarea#enUpdateMessage').val(),
				jpUpdateMessage = $('textarea#jpUpdateMessage').val(),
				zhcnUpdateMessage = $('textarea#zhcnUpdateMessage').val(),
				zhtwUpdateMessage = $('textarea#zhtwUpdateMessage').val(),
				viUpdateMessage = $('textarea#viUpdateMessage').val(),
				koUpdateContents = $('textarea#koUpdateContents').val(),
				enUpdateContents = $('textarea#enUpdateContents').val(),
				jpUpdateContents = $('textarea#jpUpdateContents').val(),
				zhcnUpdateContents = $('textarea#zhcnUpdateContents').val(),
				zhtwUpdateContents = $('textarea#zhtwUpdateContents').val(),
				viUpdateContents = $('textarea#viUpdateContents').val(),
				note = $('#note').val(),
                marketUrl = $('#marketUrl').val(),
				marketType = $('input[name="marketType"]:radio:checked').val(),
				linkType = $('input[name="linkType"]:radio:checked').val(),
				linkUrl = $('#file_link').val(),
				attach = {};
				
			if( $('#fileName').attr('data-name') != null){
				attach.name = $('#fileName').attr('data-name');
				attach.path = $('#fileName').attr('data-tempname');
				attach.hostId = $('#fileName').attr('host-id');
			}
			
			if(!$.goValidation.isCheckLength(0,32,version)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"32"}));
				$('#version').focus();
				return;
			}
			if(!$.goValidation.validateVersion(version)){
				$.goMessage(adminLang["버전입력값제한"]);
				$('#version').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,koUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#koUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,enUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#enUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,jpUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#jpUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,zhcnUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#zhcnUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,zhtwUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#zhtwUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,viUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#viUpdateMessage').focus();
				return;
			}
            if(marketType=='inhouse') {
                if (linkType == "link" && ( linkUrl == null || linkUrl === "")) {
                    $.goMessage(adminLang['파일다운로드 링크정보를 입력해야합니다.']);
                    return;
                }
                if (linkType == "upload" && ( attach.path == null || attach.path === "")) {
                    $.goMessage(adminLang['파일 업로드 유효성체크']);
                }
            }

            if(marketType == "market" && ( marketUrl == null || marketUrl === "") ){
                $.goMessage(adminLang['마켓 링크 유효성체크']);
                return;
            }

			var url = GO.contextRoot + "ad/api/system/device/version";
			var data = {
					deviceType : deviceType,
					marketType : (marketType == null || deviceType == 'pc' || deviceType == 'pc_xp') ? "none" : marketType,
					importance : importance,
					version : version,
					koUpdateMessage : koUpdateMessage,
					enUpdateMessage : enUpdateMessage,
					jpUpdateMessage : jpUpdateMessage,
					zhcnUpdateMessage : zhcnUpdateMessage,
					zhtwUpdateMessage : zhtwUpdateMessage,
					viUpdateMessage : viUpdateMessage,
					koUpdateContents : koUpdateContents,
					enUpdateContents : enUpdateContents,
					jpUpdateContents : jpUpdateContents,
					zhcnUpdateContents : zhcnUpdateContents,
					zhtwUpdateContents : zhtwUpdateContents,
					viUpdateContents : viUpdateContents,
					note : note,
                	marketUrl : marketUrl,
					deviceVersionAttach : (attach.path == null && attach.name == null) ? null : attach,
                	linkType : marketType == 'market' ? 'link' : linkType,
					linkUrl : linkUrl
			};
            GO.EventEmitter.trigger('common', 'layout:setOverlay', '');
			$.go(url, JSON.stringify(data), {
				qryType : 'POST',					
				contentType : 'application/json',
				responseFn : function(rs) {
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					if(rs.code == 200) {
						App.router.navigate('system/device', true);
					}
				},
				error: function(response){
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
				}
			});
			
		},
		deviceVersionModify: function(e) {
			e.stopPropagation();
			var deviceType = $('input[name="deviceType"]:radio:checked').val(),
				importance = $('input[name="importance"]:radio:checked').val(),
				version = $('#version').val(),
				koUpdateMessage = $('textarea#koUpdateMessage').val(),
				enUpdateMessage = $('textarea#enUpdateMessage').val(),
				jpUpdateMessage = $('textarea#jpUpdateMessage').val(),
				zhcnUpdateMessage = $('textarea#zhcnUpdateMessage').val(),
				zhtwUpdateMessage = $('textarea#zhtwUpdateMessage').val(),
				viUpdateMessage = $('textarea#viUpdateMessage').val(),
				koUpdateContents = $('textarea#koUpdateContents').val(),
				enUpdateContents = $('textarea#enUpdateContents').val(),
				jpUpdateContents = $('textarea#jpUpdateContents').val(),
				zhcnUpdateContents = $('textarea#zhcnUpdateContents').val(),
				zhtwUpdateContents = $('textarea#zhtwUpdateContents').val(),
				viUpdateContents = $('textarea#viUpdateContents').val(),
				note = $('#note').val(),
                marketUrl = $('#marketUrl').val(),
				marketType = $('input[name="marketType"]:radio:checked').val(),
				linkType = $('input[name="linkType"]:radio:checked').val(),
				linkUrl = $('#file_link').val(),
				attach = {};
			
			if($('#fileName').attr('data-name') != null){
				attach.name = $('#fileName').attr('data-name');
				attach.hostId = $('#fileName').attr('host-id');
				if($('#fileName').attr('data-tempname') != null){
					attach.path = $('#fileName').attr('data-tempname');
				}else{
					attach.id = $('#fileName').attr('data-id');
				}
			}
			
			if(!$.goValidation.isCheckLength(0,32,version)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"32"}));
				$('#version').focus();
				return;
			}
			if(!$.goValidation.validateVersion(version)){
				$.goMessage(adminLang["버전입력값제한"]);
				$('#version').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,koUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#koUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,enUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#enUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,jpUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#jpUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,zhcnUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#zhcnUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,zhtwUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#zhtwUpdateMessage').focus();
				return;
			}
			if(!$.goValidation.isCheckLength(0,512,viUpdateMessage)){
				$.goMessage(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"512"}));
				$('#viUpdateMessage').focus();
				return;
			}
            if(marketType=='inhouse') {
                if (linkType == "link" && ( linkUrl == null || linkUrl === "")) {
                    $.goMessage(adminLang['파일다운로드 링크정보를 입력해야합니다.']);
                    return;
                }
                if (linkType == "upload" && ( attach.name == null || attach.name === "")) {
                    $.goMessage(adminLang['파일 업로드 유효성체크']);
                    return;
                }
            }

            if(marketType == "market" && ( marketUrl == null || marketUrl === "") ){
                $.goMessage(adminLang['마켓 링크 유효성체크']);
                return;
            }
			var url = GO.contextRoot + "ad/api/system/device/version/" + $('#deviceId').val();
			
			var data = {
					deviceType : deviceType,
					marketType : (marketType == null || deviceType == 'pc' || deviceType == 'pc_xp') ? "none" : marketType,
					importance : importance,
					version : version,
					koUpdateMessage : koUpdateMessage,
					enUpdateMessage : enUpdateMessage,
					jpUpdateMessage : jpUpdateMessage,
					zhcnUpdateMessage : zhcnUpdateMessage,
					zhtwUpdateMessage : zhtwUpdateMessage,
					viUpdateMessage : viUpdateMessage,
					koUpdateContents : koUpdateContents,
					enUpdateContents : enUpdateContents,
					jpUpdateContents : jpUpdateContents,
					zhcnUpdateContents : zhcnUpdateContents,
					zhtwUpdateContents : zhtwUpdateContents,
					viUpdateContents : viUpdateContents,
					note : note,
					marketUrl : marketUrl,
					deviceVersionAttach : (attach.path == null &&  attach.name == null) ? null : attach,
                	linkType : marketType == 'market' ? 'link' : linkType,
					linkUrl : linkUrl
			};

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
			$.go(url, JSON.stringify(data), {
				qryType : 'PUT',					
				contentType : 'application/json',
				responseFn : function(rs) {
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					if(rs.code == 200) {
						App.router.navigate('system/device', true);
					}
				},
				error: function(response){
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
				}
			});
		},
		deviceVersionCancel : function(e) {
			e.stopPropagation();
			App.router.navigate('system/device', true);
		},
		cancelUploadFile : function(e) {
			e.stopPropagation();
			$(e.target).parents('li').remove();
			//this.$el.find('#file_upload_btn').show();
		}
	},{
		create: function(opt) {
			instance = new contactCompanyCreate({el:'#layoutContent',deviceId:opt ? opt.deviceId : ''});
			instance.deviceId = opt ? opt.deviceId : '';
			return instance.render();
		}
	});
	
	return {
		render: function(opt) {
			var layout = contactCompanyCreate.create(opt);
			return layout;
		}
	};
});