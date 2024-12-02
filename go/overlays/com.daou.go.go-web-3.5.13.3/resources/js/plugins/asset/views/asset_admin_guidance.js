define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!asset/templates/asset_admin_guidance",
    "asset/models/asset_guide",
    "hgn!asset/templates/asset_attach_file",
    "i18n!nls/commons",
    "i18n!asset/nls/asset",
    "file_upload",
    "jquery.progressbar",
    "go-webeditor/jquery.go-webeditor"
], 

function(
	$, 
	Backbone,
	App, 
	TplGuidance,
	guideModel,
	attachesFileTpl,
	commonLang,
	assetLang,
	FileUpload
) {
	var lang = {
		'info' : assetLang['첫 페이지에 나오는 안내문을 작성할 수 있습니다.'],
		'file_attach' : assetLang['파일첨부'],
		'ok' : commonLang['확인'],
		'cancel' : commonLang['취소'],
		'success' : assetLang['성공했습니다.'],
		'save_ok' : commonLang['저장되었습니다.']
	};
	var instance = null;
	var manageList = Backbone.View.extend({
		el:'#assetAdminPart',
		unbindEvent: function() {
			this.$el.off("click", "span[data-btntype='guideSubmit']");
			this.$el.off("click", "span[data-btntype='guideCancel']");
			this.$el.off("click", "span.ic_del");
			this.$el.off("click", "#fileWrap span.name");
		}, 
		bindEvent : function() {
			this.$el.on("click", "span[data-btntype='guideSubmit']", $.proxy(this.guideSubmit, this));
			this.$el.on("click", "span[data-btntype='guideCancel']", $.proxy(this.guideCancel, this));
			this.$el.on("click", "span.ic_del", $.proxy(this.attachDelete, this));
			this.$el.on("click","#fileWrap span.name", $.proxy(this.attachDownload, this));
		},
		initialize: function() {
			this.unbindEvent();
			this.bindEvent();
			this.model = new guideModel();
		},
		attachDownload : function(e){
			var target = $(e.currentTarget);
			if(target.closest('li').attr('data-id')) {
				location.href = GO.contextRoot + "api/asset/" + this.assetId + "/attach/" + target.closest('li').attr('data-id');
			}
		},
		attachDelete : function(e){
			$(e.target).parents('li').first().remove();
		},
		guideCancel : function(){
			this.render({assetId : this.assetId});
		},
		guideSubmit : function(){
			if (!GO.Editor.getInstance("description").validate()) {
        		$.goError(commonLang['마임 사이즈 초과']);
        		return false;
        	}
			
			var description = GO.Editor.getInstance("description").getContent(); 
			var data = {
				description : description
			};
			
			var attaches = [];

			var attachPart = $("#fileWrap").find('li:not(.attachError)');
			var attachOpt;
			attachPart.each(function(){
				attachOpt = {};
				if($(this).attr("data-tmpname")){
					attachOpt.path = $(this).attr("data-tmpname"); 
				}
				if($(this).attr("data-name")){
					attachOpt.name = $(this).attr("data-name");
				}
				if($(this).attr("data-id")){
					attachOpt.id = $(this).attr("data-id");
				}
				if($(this).attr("host-id")){
				    attachOpt.hostId = $(this).attr("host-id");
				}
				attaches.push(attachOpt);					
			});
			
			if(attaches.length > 0){
				data.attaches = attaches;
			}
			
			this.model.clear();
			this.model.set({assetId : this.assetId, id:this.assetId}, {silent:false});
			this.model.save(data,{
				success : function(response){
					App.router.navigate('asset/'+ response.assetId+'/list/reservation', true);
					$.goMessage(lang.save_ok);
				}
			});
		},
		render : function(opt) {
			this.assetId = opt.assetId; 
			this.model.clear();
			this.model.set({assetId : this.assetId},{silent:true});
			this.model.fetch({async : false});
			
			var tmpl = TplGuidance({
				description:this.model.get('description'),
				lang : lang
			});			
			
			this.$el.html(tmpl);	
			this.initSWFUpload();
			this.initSmartEditor();
			
			if(this.model.get('attaches').length > 0){
				this.setAttachFile();
			}
		},
		initSmartEditor : function(){
			var lang = GO.session('locale');
			$("#description").goWebEditor({
				contextRoot : GO.config("contextRoot"),
				lang:lang,
				editorValue : this.model.get('description')
			});
		},
		setAttachFile : function(){
			//첨부파일 세팅
			var files = [];
			$.each(this.model.get('attaches'),function(k,v){
				files.push(v);
			});
			
			//파일 사이즈 계산
			var sizeCal = function(){					
				var data = this.size;
				var size = GO.util.getHumanizedFileSize(data);
				return size;
			};
			
			var isImgFile = function(){
				var reExtImg = new RegExp("(jpeg|jpg|png|gif|tif|bmp)","gi");
				if(reExtImg.test(this.extention)){
					return true;
				}
				return false;
			};
			
			this.$el.find('#fileWrap').html(attachesFileTpl({
				dataset : files,
				sizeCal : sizeCal,
				isImgFile : isImgFile,
				modify : true
			}));
		},
		initSWFUpload : function(){
			var self = this,
				fileAttachLang = lang.file_attach;
				options = {
					el : "#swfupload-control",
					context_root : GO.contextRoot ,
					button_text : "<span class='buttonText'>"+fileAttachLang+"</span>",
                    url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
				};
				
			(new FileUpload(options))
            .queue(function(e, data){
            })	
			.start(function(e, data){
            })
            .progress(function(e, data){
            })
			.success(function(e, serverData, fileItemEl){
            	var alertMessage = "";
				var attachClass = "";
				
				if(GO.util.fileUploadErrorCheck(serverData)){
					alertMessage = "<strong class='caution'>" + GO.util.serverMessage(serverData) + "</strong>";
					attachClass = "attachError";
				} else {
					if(GO.util.isFileSizeZero(serverData)) {
						$.goAlert(GO.util.serverMessage(serverData));
						return false;
					}
				}
                
				var data = serverData.data;
				var tmpName = data.filePath;
				var name = data.fileName;
				var hostId = data.hostId;
				var extention = data.fileExt.toLowerCase();
				var size = GO.util.getHumanizedFileSize(data.fileSize);
				var templete = "";
				
				var fileType = extention;
				templete = '<li class="'+attachClass+'" data-tmpname="'+tmpName+'" data-name="'+name+'" host-id="' + hostId + '">'+
								'<span class="item_file">'+
									'<span class="ic_file ic_'+fileType+'"></span>'+  
									'<span class="name">'+name+'</span>'+
									'<span class="size">('+size+')</span>'+
									'<span class="btn_wrap">'+
										'<span class="ic_classic ic_del"></span>'+										
									'</span>'+alertMessage+
								'</span>'+											
							'</li>';
				$("#fileWrap").append(templete);
            })
            .complete(function(e, data){
                console.info(data);
            })
            .error(function(e, data){
                console.info(data);
            });
		}
	},{
		create: function(opt) {
			/*if(instance === null)*/ instance = new manageList();
			return instance.render(opt);
		}
	});
	
	return {
		render: function(opt) {
			var layout = manageList.create(opt);
			return layout;
		}		
	};
});