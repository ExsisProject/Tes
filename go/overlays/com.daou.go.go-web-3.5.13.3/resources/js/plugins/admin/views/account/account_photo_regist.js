//서명 일괄등록
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "hgn!admin/templates/account_photo_regist",
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
	PhotoRegistTpl,
    commonLang,
    approvalLang,
    adminLang,
    FileUpload
) {
	var PhotoRegist = Backbone.Model.extend({
		url: function() {
			return "/ad/api/account/photo/regist";
		}
	}); 
	
	var lang = {
		'photo_regist' : adminLang['사진 일괄등록'],
		'id' : approvalLang['아이디로 구분'],
		'empno' : approvalLang['사번으로 구분'],
		'select_file' : adminLang['파일 찾기'],
		'start_regist' : approvalLang['등록시작'],
        "save" : commonLang["저장"],
		'cancel' : commonLang['취소'],
		'upload_must_zipfile' : adminLang['사진 일괄등록 설명'],
		'default_setting' : approvalLang['기본 설정']
	};
    var progressBarOpt = {
            boxImage: GO.contextRoot + 'resources/images/progressbar.gif',
            barImage: GO.contextRoot + 'resources/images/progressbg_green_200.gif',
            width: 200,
            max : 100
    };
	
	var PhotoRegistView = Backbone.View.extend({
		
		events: {
			"click.photoReg #add_photo" : "uploadStart",
			"click.photoReg span.ic_del" : "deleteFile"
		},
		
		initialize: function() {
		},
		
		render : function(option) {
			this.$el.html(PhotoRegistTpl({
				lang : lang
			}));
			this.initFileUpload();
			$("#photoResultDiv").hide();
			
    		return this;
		},
        
        deleteFile : function(){
            $("#fileComplete").html("");
        },
        
		uploadStart: function(){
			var self = this;
			var photoType = $(':radio[name="photoType"]:checked').attr("id");
			if (!photoType) {
				$.goError(approvalLang["구분을 선택 하지 않았습니다."]);
				return false;
			}
			if (!$("#file_name").val()) {
				$.goError(adminLang["일괄등록 파일 선택"]);
				return false;
			}
			var model = new PhotoRegist();
			$.goConfirm(approvalLang['저장하시겠습니까?'],
					'',
					function() {
						model.set({
							'fileName' :  $("#file_name").val(),
							'filePath' : $("#file_path").val(),
							'hostId' : $("#host_id").val(),
							"signType" : photoType
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
			$("#photoResultDiv").show();
			var html = "";
			html += '<li><span class="txt">' + adminLang["이미지 파일"] + ' ' + $('#file_name').val() + ' ' + adminLang["업로드 완료"] + '</span></li>';
			$("#photoResultDiv ul").empty();
			$("#photoResultDiv ul").append(html);
			$.each(data, function(k,v) {
				if (v.resultFlag) {
					html = '<li><span class="txt">' + v.zipFileName + ' ' + commonLang['저장'] + ' [' + v.userName + ' ] ' + '</span></li>';
				} else {
					html = '<li><span class="txt">' + v.zipFileName + ' ' + commonLang['실패'] + '</span></li>';
				}
				$("#photoResultDiv ul").append(html);
			});
		},
		
		drawFileUploadFailView : function(data) {
			$("#photoResultDiv").show();
			var html = "";
			html += '<li><span class="txt">' + adminLang["이미지 파일"] + ' ' + $('#file_name').val() + ' ' + adminLang["업로드 실패"] + '</span></li>';
			$("#photoResultDiv ul").empty();
			$("#photoResultDiv ul").append(html);
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
                $("#photoResultDiv").hide();
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
                                    "<span class='btn_wrap' title='"+commonLang["삭제"]+"'>"+
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
	
	return PhotoRegistView;
});
