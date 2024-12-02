define([
    "jquery", 
    "backbone",
	'when',
    "app",  
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "hgn!system/templates/apns_manager",
	"hgn!system/templates/attaches_file",
	"hgn!system/templates/attaches",
	"file_upload",
    "jquery.go-sdk",
    "jquery.go-popup",
    "jquery.go-grid",
    "jquery.ui",
    "GO.util",
    "jquery.go-validation"
], 

function(
	$, 
	Backbone,
	when,
	App, 
	commonLang,
	adminLang,
	apnsManagerTmpl,
	attachesFileTpl,
	attachesTpl,
	FileUpload
) {
	var tmplVal = {
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_desc : adminLang["APNS 인증서 관리"],
			label_apns_add : adminLang["APNS 인증서 등록"],
			label_apns_path : adminLang["APNS 인증서 경로"],
			label_apns_password : adminLang["APNS 인증서 비밀번호"],
			label_apns_type : adminLang["APNS 인증서 서비스 타입"],
			label_file : adminLang["파일 찾기"]
	};
	var instance = null;
	var apnsManager = Backbone.View.extend({
		el : '#layoutContent',
		initialize: function() {
		    this.$el.off();
		    this.$el.empty();

			this.listEl = '#apnsManager';
            this.dataTable = null;
            this.unbindEvent();
            this.bindEvent();
		},
		unbindEvent: function() {
			 this.$el.off("click", "span#btn_ok");
			 this.$el.off("click", "span#btn_cancel");
		}, 
		bindEvent : function() {
			this.$el.on("click", "span#btn_ok", $.proxy(this.addApnsCertificate, this));
			this.$el.on("click", "span#btn_cancel", $.proxy(this.cancelApnsCertificate, this));
		},
		render : function() {
			$('#mobilty').addClass('on');
			$('.breadcrumb .path').html(adminLang["모빌리티"] + ' > ' + adminLang["APNS 인증서 관리"]);
			this.$el.empty();
            this.$el.html(apnsManagerTmpl({
                lang : tmplVal,
            }));
			this.initSWFUpload();
            this.renderApnsManager();
		},
		renderApnsManager : function() {
			this._getApnsInfo();
		},
		initSWFUpload : function() {
			var self = this,
				fileAttachLang = tmplVal.label_file;
			options = {
				el : "#swfupload-control",
				context_root : GO.contextRoot ,
				button_text : "<span class='buttonText'>"+fileAttachLang+"</span>",
				url : "ad/api/system/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
			};


			(new FileUpload(options))
				.queue(function(e, data){

				})
				.start(function(e, data){
					$('.file_wrap').empty()
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
					var re =  new RegExp("(p12)","gi");
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

						//PASSWORD 기본설정값 : 1q2w3e4r
						$('#apnsPassword').val('1q2w3e4r');
						$('#apnsTypeProduction').attr('checked', true);


					}else{
						$.goMessage(adminLang["APNS 확장자경고"]);
					}
				})
				.complete(function(e, data){
					console.info(data);
				})
				.error(function(e, data){
					console.info(data);
				});
		},
		_getApnsInfo : function(){
			return when.promise(function(resolve, reject) {
				var url = GO.config('contextRoot') + "ad/api/system/apnsinfo";
				$.ajax(url, {
					type : 'GET',
					success : function(response) {
						if(response.code == "200") {

							if(response.data.apnsPath != null){
								$('.file_wrap').empty()
								var filenameHTML = '<br>'+ response.data.apnsPath.split("/").pop() + '</br>'
								$('.file_wrap').append(filenameHTML);
								$('#apnsPassword').val(response.data.apnsPassword);
								if(response.data.apnsType == 'sandbox'){
									$('#apnsTypeSendbox').attr('checked', true);
								}else{
									$('#apnsTypeProduction').attr('checked', true);
								}
							}else{
								var filenameHTML = '<br>'+ adminLang['등록된 설정이 없습니다'] + '</br>'
								$('.file_wrap').append(filenameHTML);
							}


						} else{
							var filenameHTML = '<br>'+ adminLang['등록된 설정이 없습니다'] + '</br>'
							$('.file_wrap').append(filenameHTML);
						}
					},
					error: function(response){
						var responseData = JSON.parse(response.responseText);
						$.goMessage(responseData.message);
						reject();
					}
				});
			});
		},
		addApnsCertificate : function(e) {
			e.stopPropagation();
			var self = this;
			var apnsPassword = $('#apnsPassword').val(),
				apnsType = $('input[name="apnsType"]:radio:checked').val(),
				attach = {};

			if( $('#fileName').attr('data-name') != null){
				attach.name = $('#fileName').attr('data-name');
				attach.path = $('#fileName').attr('data-tempname');
				attach.hostId = $('#fileName').attr('host-id');
			}else{
				$.goMessage(adminLang['수정된 값이 없거나 입력값이 잘못 되었습니다']);
				return;
			}
			
			if(apnsPassword.length == 0 || apnsPassword == null){
				$.goMessage(adminLang['APNS 인증서 비밀번호를 입력하세요']);
				return;
			}

			GO.EventEmitter.trigger('common', 'layout:setOverlay', "");

			var url = GO.contextRoot + "ad/api/system/apnscert";
			var data = {
				apnsPassword : apnsPassword,
				apnsType : apnsType,
				apnsAttach : (attach.path == null && attach.name == null) ? null : attach
			};
			$.go(url, JSON.stringify(data), {
				qryType : 'POST',
				contentType : 'application/json',
				responseFn : function(rs) {
					if(rs.code == 200) {
						App.router.navigate('system/apns', true);
					}
					self.initialize();
					self.render();
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
				},
				error: function(response){
					var responseData = JSON.parse(response.responseText);
					$.goMessage(responseData.message);
					self.initialize();
					self.render();
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
				}
			});

		},
		cancelApnsCertificate : function() {
			this.initialize();
			this.render();
		}
	},{
		create: function() {
			instance = new apnsManager({el:'#layoutContent'});
			return instance.render();
		}
	});
	
	return {
		render: function() {
			var layout = apnsManager.create();
			return layout;
		}		
	};
});