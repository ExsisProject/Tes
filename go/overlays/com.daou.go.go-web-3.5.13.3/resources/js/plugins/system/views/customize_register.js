(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
		"system/models/mail_server",
	    "hgn!system/templates/customize_register",
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
		GO,
		MailSeverCollection,
		customTmpl, 
		commonLang,
		adminLang,
		FileUpload
	) {
		var lang = {
			"title" : adminLang["커스터마이즈 등록"],
			"upload_file" : commonLang["파일찾기"],
			"attach_file" : commonLang["파일첨부"],
			"server" : adminLang["장비 명"],
			"start" : commonLang["시작"],
			"success_msg" : commonLang["완료"],
			"error_msg" : commonLang["500 오류페이지 내용"],
			"file_ext_error" : commonLang["확장자가 {{arg1}}인 것만 첨부할 수 있습니다."],
			"file_empty" : commonLang["첨부파일을 등록해 주세요."]
		};
		
		var CustomizeRegister = GO.BaseView.extend({

			events : {
				"click #btn_ok" : "patch"
			},

			initialize : function() {
				this.mailSevers = MailSeverCollection.read();
			},

			render : function() {
				var self = this;
				
				var tmpl = customTmpl({
					lang : lang,
					data : this.mailSevers.toJSON()
				});	
				this.$el.html(tmpl);
				$('.breadcrumb .path').html(lang.title);
				this.initFileUpload();
				return this.$el;
			},
			
			patch : function(){
				if(this.$el.find("#fileComplete li:first").size() < 1){
					$.goMessage(lang.file_empty);
					return;
				}
				
				var url = GO.contextRoot + "ad/api/system/custompatch",
					params = {
						"hostId" : this.$el.find("#server_list").val(),
						"path" : this.$el.find("#fileComplete li:first").attr("data-path")
					};
				
                $.go(url, JSON.stringify(params) , {
                    qryType : "post",
                    async : false,
                    contentType : 'application/json',
                    responseFn : function(){
                    	$.goMessage(GO.i18n(lang.title + " " + lang.success_msg));
                    	$("#fileComplete").html("");
                    },
                    error : function(){
                    	$.goMessage(lang.error_msg);
                    }
                });
			},
			
            initFileUpload : function(){
                var self = this,
                    options = {
                        el : "#file-control",
                        context_root : GO.contextRoot ,
                        button_text : "<span class='buttonText'>"+lang.attach_file+"</span>",
                        url : "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
                };
                
                (new FileUpload(options))
                .queue(function(e, data){
                    
                })
                .start(function(e, data){
                	var reExt = new RegExp("tar.gz$","gi");
                	
                	if(!reExt.test(data.name)){
                		$.goMessage(GO.i18n(lang.file_ext_error, {arg1 : "tar.gz"}));
                		return false;
                	}
                })
                .progress(function(e, data){
                    
                })
                .success(function(e, data, fileItemEl){
                    self.$el.find("#fileComplete").html(fileItemEl);
                })
                .complete(function(e, data){
                })
                .error(function(e, data){
                });
            },
		},{
			__instance__: null
		});
		return CustomizeRegister;
	});
	
}).call(this);