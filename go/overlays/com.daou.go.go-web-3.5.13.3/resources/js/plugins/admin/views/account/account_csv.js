(function() {
    define([
            "jquery",
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!admin/nls/admin",
            "hgn!admin/templates/account_csv",
            "hgn!admin/templates/_add_account_csv_result",
            "file_upload",
            "jquery.go-popup",
            "jquery.go-grid",
            "GO.util",
            "jquery.progressbar"
            ],
        function(
            $,
            Backbone,
            App,
            commonLang,
            adminLang,
            accountCsvTmpl,
            accountCsvResultTmpl,
            FileUpload
        ){
    	var type = {
			"file" : commonLang["파일찾기"],
			"title" : adminLang["계정 일괄등록 파일선택"],
			"sub_title" : adminLang["계정 일괄 등록 파일"],
			"csv_tmpl" : adminLang["계정 일괄 등록 파일 양식 다운로드"],
			"account_import" : adminLang["일괄 등록"],
			"result" : adminLang["처리 결과"],
			"result_download" : adminLang["전체 처리 결과 다운로드"],
			"fail_download" : adminLang["오류 목록 다운로드"],
			"account_download" : adminLang["계정 목록 다운로드"],
			"account_down_title" : adminLang["계정목록 일괄 다운로드"],
			"result_title" : adminLang["계정 일괄 등록 파일 업로드 현황"]
        };
         
        var progressBarOpt = {
			boxImage: GO.contextRoot + 'resources/images/progressbar.gif',
			barImage: GO.contextRoot + 'resources/images/progressbg_green_200.gif',
			width: 200,
			max : 100
         };
                
        var AccountCSV = Backbone.View.extend({
            
        	events: {
                "click.account #add_accounts" : "addAccounts",
                "click.account #download_all" : "downloadAll",
                "click.account #download_fail" : "downloadFail",
                "click.account #fileComplete .ic_del" : "deleteFile",
                "click.account #formDownload" : "formDownload",
                "click.account #accountListDownload" : "accountListDownload"
            }, 
        	
            initialize : function(){
                this.add_account_result = {};
                this.model = new Backbone.Model();
                this.model.url = GO.contextRoot + "ad/api/user/csv"; 
                this.interval = null;
            },
            
            render : function() {
            	this.$el.html(accountCsvTmpl({
                	root : GO.contextRoot, 
                	lang : type
                }));
            	this.getCSVUploadStatus();
            	
            	return this;
            },

            accountListDownload : function() {
            	GO.util.downloadCsvFile("ad/api/user/download/all");
            },
            formDownload : function(){
                GO.util.downloadCsvFile("ad/api/user/csv/download/form");
            },
            undelegateEvents: function() {
                Backbone.View.prototype.undelegateEvents.call(this);
                this.$el.off(".account");
                return this;
            },
            downloadAll : function(){
                var url = "ad/api/user/csv/download/total/result";
                GO.util.downloadCsvFile(url);
            },
            downloadFail : function(){
                var url = "ad/api/user/csv/download/fail/result";
                GO.util.downloadCsvFile(url);
            },
            deleteFile : function(){
                $("#fileComplete").html("");
            },
            addAccounts : function(){
                var self = this;
                var url = GO.contextRoot+"ad/api/user/csv",
                    options = {
                        fileName : $("#file_name").val(),
                        filePath : $("#file_path").val(),
                        hostId : $("#host_id").val(),
                        fileExt : $("#file_ext").val()
                    };
                try{
                    this.validationFile(options);
                }catch (e){
                    return console.log("accountAccounts Error :: " + e);
                }
                GO.EventEmitter.trigger('common', 'layout:setOverlay', adminLang["로딩중"]);
                $.go(url,JSON.stringify(options), {
                    qryType : 'POST',
                    timeout : 0,
                    contentType : 'application/json',
                    responseFn : function(response) {
                    	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        self.getCSVUploadStatus();
                    },
                    error : function(error){
                        clearInterval(this.interval);
                    }
                });
            },

            validationFile : function(options){
                if(options.fileName == undefined || options.filePath == undefined){
                    $.goAlert(adminLang["일괄등록 파일 선택"]);
                    throw new Error(400, adminLang["일괄등록할 파일을 선택해주세요."]);
                }
            },
            
            getCSVUploadStatus : function(){
            	var self = this;
            	this.model.fetch({
            		async:false, 
            		silent:true, 
            		success : function(model, response, options) {
            			self.changeUIWithUploadStatus();
            		}, 
            		error : function() {
            			$.goAlert(adminLang["등록에 실패했습니다."]);
            			clearInterval(this.interval);
        			}
            	});
            },
            
            changeUIWithUploadStatus : function(){
            	var self = this;
            	var state = this.model.get('jobStatus'),	//상태
                	total = this.model.get('size'),			// 총 개수?
                	successCnt = this.model.get('successCount'),	//성공개수
                	failCnt = this.model.get('failCount'),		//실패개수
                	startedAt = GO.util.basicDate3(this.model.get('startedAt')),	//등록시작일
                	endedAt = GO.util.basicDate3(this.model.get('endedAt')),	//등록종료일
                	doingCnt = successCnt + failCnt;	//총 계정수
                
            	clearInterval(this.interval);
                if(state == 'WAIT'){
                	this.initializeFileUpload();
                }else if(state == 'PREPARE'){
                	$('#add_accounts').hide();
                	$('#select_file').hide();
                	$('#swfupload-control').hide();
                	$('#csv_progress').show();
                	$("#item_file").remove();
                	$('#progress_content').empty();
                	$('#progress_content').append('<p class="go_alert">' + adminLang["계정일괄등록 준비중"] +'</p>');
                	this.interval = setInterval(function(){
                		self.getCSVUploadStatus();
                	}, 1500);
                	
                }else if(state == 'DOING'){
                	$("#item_file").remove();
                	$('#progress_content').empty();
                	$('#add_accounts').hide();
                	$('#select_file').hide();
                	$('#swfupload-control').hide();
                	$('#csv_progress').show();
                	$("#csv_result").hide();
                	$('#csv_progress div.header').html('<h2>' + adminLang["계정 일괄 등록 파일 업로드 현황"] + '</h2>');
            		$('#csvProgressBar div#progressbar').show();
            		$('#csvProgressBar div#progressbar').progressBar( (doingCnt / total) * 100 ,progressBarOpt);
            		
            		this.interval = setInterval(function(){
                		self.getCSVUploadStatus();
                	}, 1500);
            		
                }else if(state == 'DONE'){
                	$('#csvProgressBar div#progressbar').hide();
                	$('#csvProgressBar div#progressbar').progressBar( 0 ,progressBarOpt);
                	$('#add_accounts').show();
                	$('#select_file').show();
                	$('#swfupload-control').show();
                	$('#csv_progress').show();
                	$('#csv_progress div.header').html('<h2>' + adminLang["최근 일괄 등록 결과"] + '</h2>');
                	$("#csv_result").show();
                	$('#progress_content').append('<div>' + adminLang["등록일"] + ': ' + startedAt +'</div>');
                	$('#progress_content').append('<div>' + adminLang["종료일"] + ': ' + endedAt +'</div>');
                	$('#progress_content').append('<div>' + adminLang["총 계정수"] + ': ' + doingCnt +'</div>');
                	$('#progress_content').append('<div>' + adminLang["실패 계정수"] + ': ' + failCnt +'</div>');
                	$('#progress_content').append('<div>' + adminLang["성공 계정수"] + ': ' + successCnt +'</div>');
                	this.initializeFileUpload();
                	clearInterval(this.interval);

                }else {
                	this.initializeFileUpload();
                	$('#csvProgressBar div#progressbar').hide();
                	$('#add_accounts').show();
                	$('#select_file').show();
                	$('#swfupload-control').show();
                	$('#csv_progress').show();
                	$('#csv_progress div.header').html('<h2>' + adminLang["최근 일괄 등록 결과"] + '</h2>');
                	$("#csv_result").show();
                	$('#progress_content').append('<p class="go_alert">' + adminLang["계정일괄등록 중지"] +'</p>');
                	$('#progress_content').append('<div>' + adminLang["등록일"] + ': ' + startedAt +'</div>');
                	$('#progress_content').append('<div>' + adminLang["종료일"] + ': ' + endedAt +'</div>');
                	$('#progress_content').append('<div>' + adminLang["총 계정수"] + ': ' + doingCnt +'</div>');
                	$('#progress_content').append('<div>' + adminLang["실패 계정수"] + ': ' + failCnt +'</div>');
                	$('#progress_content').append('<div>' + adminLang["성공 계정수"] + ': ' + successCnt +'</div>');
                	clearInterval(this.interval);
                }
            },
            
            initializeFileUpload : function(){
            	this.initFileUpload();
	            var account_cnt = this.getAccountCnt();
	            var avaliableCount = account_cnt.userCount - account_cnt.usedCount + account_cnt.stopUserCount;
	            if(avaliableCount <= 0){
	            	$('.btn_file').hide();
	            	$('#formDownload').parent().append('<p class="go_alert">' + adminLang["계정을 더이상 추가할 수 없습니다. 라이선스 계정수를 확인하세요."] +'</p>');
	            }else if(account_cnt.userCount == 0){
	            	$('.btn_file').hide();
	            	$('#formDownload').parent().append('<p class="go_alert">' + adminLang["사용자 라이선스 등록 경고"] +'</p>');
	        	}
            },
            
            getAccountCnt : function(){
                var cnt = {},
                    url = GO.contextRoot + "ad/api/company/license";
                $.go(url,"", {
                    async : false,
                    qryType : 'GET',
                    contentType : 'application/json',
                    responseFn : function(response) {
                        if(response.code === "200"){
                            cnt = response.data;
                        } else{
                            
                        }
                            
                    },
                    error : function(error){
                        $.goAlert(type.error);
                    }
                });
                return cnt;
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
                    var reExt = new RegExp("(.csv|.xls|.xlsx)","gi"),
                        fileExt = data.type.toLowerCase();
                    
                    if(!reExt.test(fileExt)){
                        $.goAlert(adminLang["csv 파일만 등록 가능합니다."]);
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
                    
                    var data = serverData.data,
                        fileName = data.fileName,
                        filePath = data.filePath,
                        hostId = data.hostId,
                        fileSize = GO.util.getHumanizedFileSize(data.fileSize),
                        fileExt = data.fileExt,
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
                                       "<input type='hidden' value='"+fileExt+"' id='file_ext'/>"+
                                    "</li>";
                    $("#fileComplete").html(fileTmpl);
                })
                .complete(function(e, data){
                    console.info(data);
                })
                .error(function(e, data){
                    console.info(data);
                });
            }
        });
        
        return AccountCSV;
    });
}).call(this);