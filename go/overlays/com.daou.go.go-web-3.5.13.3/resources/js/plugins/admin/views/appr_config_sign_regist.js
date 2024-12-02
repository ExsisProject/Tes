//서명 일괄등록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "hgn!admin/templates/appr_config_sign_regist",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin",
    "file_upload",
    "swfupload",
    "swfupload.plugin",
    "jquery.progressbar"

], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	ConfigSignRegistTpl,
    commonLang,
    approvalLang,
    adminLang,
    FileUpload
) {
	var ConfigSignRegist = Backbone.Model.extend({
		url: function() {
			return "/ad/api/approval/admin/config/sign/regist";
		}
	}); 
	
	var lang = {
			'서명 일괄등록' : adminLang['서명 일괄등록'],
			'아이디로 구분' : approvalLang['아이디로 구분'],
			'사번으로 구분' : approvalLang['사번으로 구분'],
			'파일 찾기' : adminLang['파일 찾기'],
			'등록시작' : approvalLang['등록시작'],
            "저장" : commonLang["저장"],
			'취소' : commonLang['취소'],
			'upload_must_zipfile' : adminLang['서명 이미지의 파일은 사번 또는 아이디로 변경한 후, zip 파일로 업로드하시기 바랍니다.'],
			'기본 설정' : approvalLang['기본 설정'],
			'appr_sign_desc' : approvalLang['서명은 이미지 크기 안내']
		};
    var progressBarOpt = {
            boxImage: GO.contextRoot + 'resources/images/progressbar.gif',
            barImage: GO.contextRoot + 'resources/images/progressbg_green_200.gif',
            width: 200,
            max : 100
    };
	
	var ConfigSignRegistView = Backbone.View.extend({
		el : '#layoutContent',
		initialize: function() {
			this.model = new ConfigSignRegist();
			this.model.fetch({
				async:false,
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
			});
		},
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.signReg", "#add_sign", $.proxy(this.uploadStart, this));
            this.$el.on("click.signReg", "span.ic_del", $.proxy(this.deleteFile, this));
        }, 
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".signReg");
            return this;
        },
        
        deleteFile : function(){
            $("#fileComplete").html("");
        },
		render : function(option) {
			var model = this.model;
			var config = {
					id : model.get("id"),
					useFlag : model.get("useFlag"),
					userChangFlag : model.get("userChangFlag")
			};
			this.$el.empty();
			this.$el.html(ConfigSignRegistTpl({
				lang : lang,
				config : config
			}));
			this.initFileUpload();
			$("#signResultDiv").hide();
    		return this.$el;
		},
		findFile: function(){
			alert("파일찾기");
		},
		uploadStart: function(){
			var self = this;
			var signType = $(':radio[name="signType"]:checked').attr("id");
			if (!signType) {
				$.goError(approvalLang["구분을 선택 하지 않았습니다."]);
				return false;
			}
			if (!$("#file_name").val()) {
				$.goError(adminLang["일괄등록 파일 선택"]);
				return false;
			}
			var model = new ConfigSignRegist();
			$.goConfirm(approvalLang['저장하시겠습니까?'],
					'',
					function() {
						model.set({
							'fileName' :  $("#file_name").val(),
							'filePath' : $("#file_path").val(),
							'hostId' : $("#host_id").val(),
							"signType" : signType
						}, { silent : true });
						GO.EventEmitter.trigger('common', 'layout:setOverlay', adminLang["로딩중"]);
						model.save({}, {
							type : 'PUT',
				            success: function(model, result) {
				            	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
				            	if (result.code == 200){
				            		$.goMessage(approvalLang["저장이 완료되었습니다."]);
				            		self.drawSuccessList(result.data);
				            		self.deleteFile();
//				            		self.initFileUpload();
				            	}
				            }, error : function(model, rs){
								var responseObj = JSON.parse(rs.responseText);
				            	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
								if (responseObj.message) {
			                        $.goError(adminLang["등록에 실패했습니다."]);
			                        self.drawFileUploadFailView(rs.data);
			                        self.deleteFile();
									return false;
								} else {
			                        $.goError(adminLang["등록에 실패했습니다."]);
			                        self.drawFileUploadFailView(rs.data);
			                        self.deleteFile();
									return false;
								}
								


		                    }
						});
					});
		},
		drawSuccessList : function(data) {
			$("#signResultDiv").show();
			var html = "";
			var message = adminLang["서명 이미지"] + ' ' + $('#file_name').val() + ' ' + adminLang["업로드 완료"];
			html += '<li><span class="txt">' + message + '</span></li>';
			$("#signResultDiv ul").empty();
			$("#signResultDiv ul").append(html);
			$.each(data, function(k,v) {
				if (v.resultFlag) {
					html = '<li><span class="txt">' + v.zipFileName + ' ' + commonLang['저장'] + ' [' + v.userName + ' ] ' + '</span></li>';
				} else {
					html = '<li><span class="txt">' + v.zipFileName + ' ' + commonLang['실패'] + '</span></li>';
				}
				$("#signResultDiv ul").append(html);
			});
		},
		
		drawFileUploadFailView : function(data) {
			$("#signResultDiv").show();
			var html = "";
			html += '<li><span class="txt">'+adminLang["이미지 파일"]+' '+$('#file_name').val()+' '+adminLang["업로드 실패"]+'</span></li>';
			$("#signResultDiv ul").empty();
			$("#signResultDiv ul").append(html);
		},

        initFileUpload : function(){
            var fileAttachLang = adminLang["파일 찾기"],
                _this = this,
                options = {
                    el : "#swfupload-control",
                    context_root : GO.contextRoot ,
                    button_text : "<span class='buttonText'>"+fileAttachLang+"</span>",
                    progressBarUse : true,
                    url : "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
                };
            
            (new FileUpload(options))
            .queue(function(e, data){
                
            })
            .start(function(e, data){
//                
                var reExt = new RegExp("(.zip)","gi"),
                    fileExt = data.type.toLowerCase();
                
                if(!reExt.test(fileExt)){
                    $.goAlert(approvalLang["zip 파일만 등록 가능합니다."]);
                    $("#progressbar").hide();
                    return false;
                }
            })
            .progress(function(e, data){
                
            })
            .success(function(e, serverData, fileItemEl){
                if(GO.util.fileUploadErrorCheck(serverData)){
                    $.goAlert(GO.util.serverMessage(serverData));
                    return false;
                }
                $("#signResultDiv").hide();
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
		
        // 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	return ConfigSignRegistView;
});
