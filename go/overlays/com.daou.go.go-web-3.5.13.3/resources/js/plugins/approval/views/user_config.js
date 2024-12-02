//사용자환경설정(사인/패스워드)
// 기안문서함 목록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "approval/views/content_top",
    "approval/views/changePwdForm",
    "approval/models/user_appr_config",
    "hgn!approval/templates/usersetting_userconfig",
    "hgn!approval/templates/changePwdForm",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin",
    "i18n!nls/user",
    "file_upload",
    "jquery.go-popup",
    "jquery.ui", 
    "json", 
    "json2",
    "jquery.go-validation", 
    "jquery.placeholder", 
    "jquery.progressbar"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	ContentTopView,
	ChangePwdForm,
	UserApprConfigModel,
	UserconfigTpl,
    ChangePwdFormTbl,
    commonLang,
    approvalLang,
    adminLang,
    userLang,
    FileUpload
) {
    
    var lang = {
        '기본 설정': approvalLang['기본 설정'],
        '부재/위임 설정': approvalLang['부재/위임 설정'],
        '개인 결재선 관리': approvalLang['개인 결재선 관리'],
        '추가': approvalLang['추가'],
        '직급' : adminLang['직급'],
        '직위' : adminLang['직위'],
        '이름' : approvalLang['이름'],
        '서명 올리기' : approvalLang['서명 올리기'],
        '서명 변경' : approvalLang['서명 변경'],
        '서명 삭제' : approvalLang['서명 삭제'],
        '결재일' : approvalLang['결재일'],
        '삭제': approvalLang['삭제'],
        '비밀번호 변경하기' : approvalLang['비밀번호 변경하기'],
        '결재 작성 방식': approvalLang['결재 작성 방식'],
        '일반 작성' : approvalLang['일반 작성'],
        '팝업 작성' : approvalLang['팝업 작성'],
        '결재비밀번호' : approvalLang['결재비밀번호'],
        '서명관리' : approvalLang['서명관리'],
        '저장' : commonLang['저장'],
        '취소' : commonLang['취소'],
        'img_attach' : commonLang['이미지 첨부'],
        'file_attach' : commonLang['파일 첨부'],
        'del' : commonLang['삭제'],
        'confirm' : commonLang['확인'],
        'cancel' : commonLang['취소'],
        'noti' : commonLang['알림'],
        '첨부 이미지 설정' : approvalLang['첨부 이미지 설정'],
        '기본 사이즈로 표시' : approvalLang['기본 사이즈로 표시'],
        '기본 사이즈로 표시 설명' : approvalLang['기본 사이즈로 표시 설명'],
        '원본 사이즈로 표시' : approvalLang['원본 사이즈로 표시'],
        '원본 사이즈로 표시 설명' : approvalLang['원본 사이즈로 표시 설명'],
        '파일명으로 표시' : approvalLang['파일명으로 표시'],
        '파일명으로 표시 설명' : approvalLang['파일명으로 표시 설명'],
        '서명은 이미지 크기 안내' : approvalLang['서명은 이미지 크기 안내']
    };

	var PwdModel = Backbone.Model.extend({
        url : "/api/approval/usersetting/password"
	});
	
	var UserApprConfigView = Backbone.View.extend({

		el: '#content',
		model : null,
		pwdLayerModel : null,
		
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.apprconfig", ".tab_menu > li", $.proxy(this.selectTab, this));
            this.$el.on("click.apprconfig", "#btn_chnPwd", $.proxy(this._goPopChangePwdForm, this));
            this.$el.on("click.apprconfig", "#save_apprconfig", $.proxy(this._onSaveClicked, this));
            this.$el.on("click.apprconfig", "#cancel_apprconfig", $.proxy(this._onCancelClicked, this));
            this.$el.on("click.apprconfig", "#delete_sign", $.proxy(this.deleteSignImage, this));
            return this;
        },
        
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".apprconfig");
            return this;
        },
		
		initialize: function() {
			this.contentTop = ContentTopView.getInstance();
			this.model = new UserApprConfigModel();
			this.model.fetch({
				async:false,
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
			});
        	if(_.isEmpty(this.model.get('signPath'))){
        		this.model.set('signPath', GO.contextRoot + this.model.getDefaultPhoto());
        	}else{
        		this.model.set('signPath', this.model.get('signPath'));
        	};
		},
		
		render: function() {
			var data = _.extend(this.model.toJSON(), {
			    'writeModes': [{
			        'value': 'NORMAL',
			        'label': lang['일반 작성'],
			        'isSelected' : this.model.get('writeMode') == 'NORMAL'
			    }, {
			        'value' : 'POPUP',
			        'label' : lang['팝업 작성'],
			        'isSelected' : this.model.get('writeMode') == 'POPUP'
			    }],
			    userChangFlag : this.model.get('userChangFlag')
			});
			
			this.$el.html(UserconfigTpl({
				lang: lang,
				data : data
			}));

			this._checkAuth(data);
            this.initFileUpload();
			$('#tab_' + this.type).addClass('on');
			this.contentTop.setTitle(approvalLang['결재환경설정']);
    		this.contentTop.render();
    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);

            // 첨부 이미지 설정
            // GO-19592 이슈 대응
            this._checkImageMode();
		},

        _checkImageMode: function() {
            var selector = 'input[name="attachImageMode"][value="'+this.model.get('attachImageMode')+'"]';
            this.$el.find(selector).attr('checked', true);
        },
		
		_checkAuth : function(data){
			if(data.userUseFlag == false){
				this.$el.find('.sign_name').text(commonLang['이름']);
				$('#swfupload-control').parent().hide();
			}
			
			if(data.userChangFlag == false){
				$('#swfupload-control').parent().hide();
				$('#delete_sign').hide();
			}
			
		},
		
		_goPopChangePwdForm : function(e){
			e.stopPropagation();
			e.preventDefault();
			var changePwdForm = new ChangePwdForm({});
			var self = this;
			var popEl =  $.goPopup({
				'pclass' : 'layer_normal layer_password_change',
				'header' : approvalLang['결재 비밀번호 변경'],
				'modal' : true,
				'width' : "350px",
				'contents' : changePwdForm.render().$el.html(),
				"buttons" : [{
					'btext' : commonLang["확인"],
					'btype' : 'confirm',
					'autoclose' : false,
					'callback' : function(rs){
						self._savePassword(rs);
					}
				},
				{
					'btext' : commonLang["취소"],
					'btype' : 'cancel'
				}]
			});
			
			$(popEl).find('input[type=password]').on('keypress', function(e){
				$(this).removeClass('enter error');
				$(popEl).find('span.go_error').remove();
			});
			
		},
		
		_savePassword : function(popEl){
            var passwords = {
                currentPassword : $(popEl).find('input[id="currentPassword"]'),
                newPassword : $(popEl).find('input[id="newPassword"]'),
                newPasswordConfirm : $(popEl).find('input[id="newPasswordConfirm"]')
            };
            
            if(!this._validatePassword(passwords)) { return false; }
        	
        	this.pwdLayerModel = new PwdModel();
        	this.pwdLayerModel.set({ 
				'oldPasswd' : passwords.currentPassword.val(),
				'apprPasswd' : passwords.newPassword.val()
			},{ silent : true });
        	
        	this.pwdLayerModel.save({},{
				type : 'PUT',
				success : function(model, response) {
					if(response.code == '200') {
	                    $.goMessage(commonLang["저장되었습니다."]);
						popEl.close();
					}
				},
				error : function(model, response) {
					$.goError(userLang["현재 비밀번호가 일치하지 않습니다."], $('#currentPassword'));
					$('#currentPassword').addClass('enter error').focus();
				}
			});
		},
		
        _validatePassword : function(passwords){
            if(this._isPasswordEmpty(passwords)) return false;
            if(!this._isPasswordEqual(passwords)) return false;
            return true;
        },
		
        _isPasswordEmpty: function(passwords){
        	var isEmpty = false;
            _.each(passwords, function(el, key){
                if(el.val() == ""){
                    $.goMessage(commonLang["비밀번호를 입력해주세요"]);  	
                    el.focus();
                    isEmpty = true;
                }
            });
            
            return isEmpty;
        },
        
        _isPasswordEqual : function(passwords){
            if(passwords.newPassword.val() != passwords.newPasswordConfirm.val()){
				$.goError(commonLang["비밀번호가 일치하지 않습니다"], $('#newPassword'));
				$('#newPassword').addClass('enter error').focus();
                return false;
            }else{
            	return true;
            }
        },
        
        _onSaveClicked: function(e) {
            this.model.set({ 
                'writeMode' : this.$el.find('select[name=writeMode]').val(),
                'attachImageMode': this.$el.find('input[name="attachImageMode"]:checked').val(),
                'sign' : {
                    'filePath' :  $("#thumbnail_image").attr("data-filepath").replace(GO.contextRoot, ""),
                    'fileName' : $("#thumbnail_image").attr("data-filename"),
                    'hostId' : $("#thumbnail_image").attr("host-id")
                }
            },{ silent : true });
            
            this.model.save({},{
                type : 'POST',
                success : function(model, rs) {
                    if (rs.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        GO.router.navigate("approval/usersetting/userconfig", {trigger: true}); // 사이드 측에 작성 모드를 즉각 전달하기 위해 페이지 이동이 필요함
                    }
                },
                error : function(model, rs) {
                    var responseObj = JSON.parse(rs.responseText);
                    if (responseObj.message) {
                        $.goError(responseObj.message);
                        return false;
                    } else {
                        $.goError(commonLang['저장에 실패 하였습니다.']);
                        return false;
                    }
                }
            });
        },
        
        _onCancelClicked: function(e) {
            console.log('canceled..');
            this.initialize();
            this.render();
        },
		
		// 탭 이동
		selectTab: function(e) {
			if($(e.currentTarget).attr("class") === "active") return false;

			var tabId = $(e.currentTarget).attr('id');
			var url = "/approval/";
			
			if (tabId == 'tab_user_config') {
				url += "usersetting/userconfig";		
			} else if (tabId == 'tab_user_deputy') {
				url += "usersetting/deputy";
			}
			
			GO.router.navigate(url, {trigger: true});
			$('html, body').animate({
				scrollTop : 0
			});
	
		},

		// 검색
		search: function() {
			
		},
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		},
		
		// 파일 첨부
		initFileUpload : function(){
            var self = this;
            var options = {
                el : "#swfupload-control",
                context_root : GO.contextRoot ,
                button_text : '<span class="buttonText" id="uploadSignTitle">' + (self.model.get('useFlag') == true ? approvalLang['서명 변경'] : approvalLang['서명 올리기']) + '</span>',
                button_width : 80,
                button_height : 24,
                url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
            };
        
            (new FileUpload(options))
            .queue(function(e, data){
                
            })
            .start(function(e, data){
                console.log("uploadStart");
                console.log(data);
                var reExt = new RegExp("(jpeg|jpg|gif|png|bmp)","gi"),
                    fileExt = data.type;
                
                if(!reExt.test(fileExt)){
                    $.goMessage(commonLang["포멧 경고"]);
                    return false;
                }
                
                if(data.size > 5 * 1024 * 1024){
                    $.goMessage(commonLang["첨부파일 용량은 5MB이하 입니다."]);
                    return false;
                }
            })
            .progress(function(e, data){
                //
            })
            .success(function(e, serverData, fileItemEl){
                if(GO.util.fileUploadErrorCheck(serverData)){
                    $.goAlert(GO.util.serverMessage(serverData));
                    return false;
                } else {
                	if(GO.util.isFileSizeZero(serverData)) {
                		$.goAlert(GO.util.serverMessage(serverData));
                		return false;
                	}
                }
                
                var data = serverData.data,
                    fileName = data.fileName,
                    filePath = data.filePath,
                    hostId = data.hostId,
                    thumbnail = data.thumbnail;
                
                console.log("fileName :: " + fileName);
                $("#thumbnail_image")
                    .attr("src",thumbnail)
                    .attr("data-filepath",filePath)
                    .attr("data-filename",fileName)
                    .attr("host-id",hostId);
                $('#delete_sign').show();
                self.model.set({'signDeleteFlag' : false});
            })
            .complete(function(e, data){
                console.info(data);
            })
            .error(function(e, data){
                console.info(data);
            });
        },
		deleteSignImage : function(){
			$("#thumbnail_image")
				.attr("src", GO.contextRoot + this.model.getDefaultPhoto())
				.attr("data-filepath",'')
                .attr("data-filename",'')
                .attr("host-id",'');
			this.model.set({'signDeleteFlag' : true});
			$('#delete_sign').hide();
        }
		
	});
	
	return UserApprConfigView;
});