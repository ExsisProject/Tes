;(function() {
	define([
			"backbone",
			"app",
			"i18n!nls/commons",
			"hgn!note/templates/note_read",
			"jquery.go-preloader"
	], 
	function(
			Backbone,
			App,
			commonLang,
			SendMailLayerTmpl
	) {
		var lang = {
			"from" : commonLang["보낸사람"],
			"to" : commonLang["받는사람"],
			"sendDate" : commonLang["보낸날짜"],
			"attach" : commonLang["첨부파일"],
			"count" : commonLang["개"],
			"reply" : commonLang["답장"],
			"replyAll" : commonLang["전체 답장"],
			"delivery" : commonLang["전달"],
			"delete" : commonLang["삭제"],
			"saveAll" : commonLang["모두저장"],
			"deleteAll" : commonLang["모두삭제"],
			"preview" : commonLang["미리보기"],
			"deleted" : commonLang["삭제된 첨부파일"],
			"subject" : commonLang["제목"],
			"more" : commonLang["더보기"],
			"fold" : commonLang["접기"]
		};
		
		var Model = Backbone.Model.extend({
			acceptConverter : function(fileType) {
				fileType = fileType.toLowerCase();
				var acceptType = "doc|docx|hwp|ppt|pptx|xls|xlsx|pdf|gif|jpg|jpeg|bmp|tif|png";
				var regExp = new RegExp("(" + acceptType + ")$", "i");
				
				if (regExp.test(fileType)) {
					return true;
				} else {
					return false;
				}
			},
			
			
			getAttachList : function() {
				return this.get("msgContent").attachList;
			},
			
			convertAttach : function() {
				_.each(this.getAttachList(), function(attach) {
					attach.isPreviewable = this.acceptConverter(attach.fileType);
					if (!attach.size) attach.isDelete = true;
					attach.ext = GO.util.getFileIconStyle({
            			extention : attach.fileType
        			});
				}, this);
			},
			
			hasAttach : function() {
				return this.getAttachList().length > 0;
			},
			
			getTotalAttachSize : function() {
				var total = _.reduce(this.getAttachList(), function(sum, attach) {
					return sum + attach.size;
				}, 0);
				
				return GO.util.getHumanizedFileSize(total);
			},
			
			
			getAliveAttachPart : function() {
				var part = _.map(this.getAttachList(), function(attach) {
					return attach.isDelete ? "" : attach.path;
				});
				
				return _.compact(part).join("_");
			}
		});
				
		var LayerView = Backbone.View.extend({
			className : "s_note",
			
			events : {
				"click span.ic_del" : "deleteAttach",
				"click #reply" : "reply",
				"click #replyAll" : "replyAll",
				"click #delivery" : "delivery",
				"click #destroy" : "destroy",
				"click #downloadAll" : "downloadAll",
				"click #deleteAll" : "deleteAll",
				"click span[data-btn=preview]" : "preview",
				"click #moreBtn" : "toggleToList",
				"click a[href]" : "windowOpen",
				"click ul.file_wrap span.name" : "download"
			},
			
			initialize : function(options) {
				var param = GO.router.getSearch(); 
				
				this.uid = param.uid;
				this.sid = param.sid;
				this.folder = param.folder;
				this.model = new Model();
			},
			
			render : function() {
				var tmpl = SendMailLayerTmpl({
					lang : lang,
					model : this.model.toJSON(),
					hasAttach : this.model.hasAttach(),
					totalAttachSize : this.model.getTotalAttachSize() 
				});
				this.$el.html(tmpl);
				this.initToList();
				
				
				console.log('note:' + JSON.stringify({
				     "function" : "loadComplete", 
				     "param1" : this.model.get("msgContent").subject
				}));
			},
			
			
			windowOpen : function(e) {
				var target = $(e.currentTarget);
				window.open(target.attr("href"));
				
				return false;
			},
			
			
			fetch : function() {
				var self = this;
				var data = this.sid ? {
					sid : this.sid
				} : {
					folder : this.folder,
					sharedFlag : "user",
					uid : this.uid,
					sharedUserSeq : 0,
					sharedFolderName : ""
				};
				
				return $.ajax({
					type : "POST",
					url : "/api/mail/message/read",
					contentType : "application/json",
					data : JSON.stringify(data),
					success : function(resp) {
						var data = resp.data;
						
						if (self.sid) {
							self.folder = data.msgContent.folderFullName;
							self.uid = data.msgContent.uid;
						}
						self.model.set(data);
						self.model.convertAttach();
					},
					error : function(e) {
						console.log(e);
					}
				});
			},
			
			
			initToList : function() {
				var moreList = this.$("#toList").find("li:not(.add):gt(9)"); 
				var hasMore = moreList.length > 0;
				if (hasMore) {
					moreList.hide();
					moreList.attr("data-more", "");
					this.$("#moreBtn").show();
				}
			},
			
			
			toggleToList : function() {
				var moreList = this.$("#toList").find("li[data-more]");
				var moreBtn = this.$("#moreBtn");
				var arrow = moreBtn.find("#moreBtnArrow");
				var isMore = arrow.hasClass("ic_arrow_up");
				var text = isMore ? commonLang["더보기"] : commonLang["접기"];
				moreList.toggle(!isMore);
				moreBtn.find("#moreBtnText").text(text);
				arrow.toggleClass("ic_arrow_up");
				arrow.toggleClass("ic_arrow_down");
			},
			
			
			initPreloader : function(deferred) {
				var preloader = $.goPreloader();
				
				deferred.progress(function() {
					preloader.render();
				});
				
				deferred.always(function() {
					preloader.release();
				});
				
				return deferred;
			},
			
			
			deleteAttach : function(e) {
				var target = $(e.currentTarget).parents("li");
				var self = this;
				var deferred = $.Deferred();
				
				this.initPreloader(deferred);
				
				$.ajax({
					url : "/api/mail/message/attach/delete",
					type : "POST",
					data : "folderName=" + this.folder + "&uid=" + this.uid + "&part=" + target.attr("part"),
					success : function(resp) {
						var data = resp.data;
						self.uid = data;
						self.fetch().done(function() {
							self.render();
							deferred.resolve();
						});
					},
					error : function(error) {
						console.log(error);
					}
				});
            },
			
			
			downloadAll : function() {
				var part = this.model.getAliveAttachPart();
				
				if (!part) {
					$.goAlert(commonLang["다운로드 할 파일이 없습니다."]);
					return;
				}
				
				var param = {
					folderName : this.folder,
					uid : this.uid,
					part : part,
					sharedFlag : "user",
					sharedUserSeq : 0,
					sharedFolderName : ""
				};
				
				var self = this;
				
				$.ajax({
					url : "/api/mail/message/attach/download/all",
					type : "POST",
					contentType : "application/json",
					data : JSON.stringify(param),
					success : function(resp) {
						var data = resp.data;
						var downloadParam = {"downloadFileName":data.downloadFileName, "zipFileName":data.zipFileName}
						var url = "/api/mail/message/attach/download/all?" + $.param(downloadParam);
						console.log('note:' + JSON.stringify({
						     "function" : "downloadAll", 
						     "param1" : url,
						     "param2" : data.downloadFileName
						}));
					},
					error : function(e) {
						console.log(e);
					}
				});
			},
			
			
			deleteAll : function() {
				var param = {
					folderNames : [this.folder],
					uids : [this.uid]
				};
				
				var deferred = $.Deferred();
				this.initPreloader(deferred);
				
				var self = this;
				$.ajax({
					url : "/api/mail/message/attach/delete/all",
					type : "POST",
					data : param,
					traditional : true,
					success : function(resp) {
						var data = resp.data;
						self.uid = data;
						self.fetch().done(function() {
							self.render();
							deferred.resolve();
						});
					},
					error : function(e) {
						console.log(e);
					}
				});
			},
			
			
			reply : function() {
				var param = "?type=reply&uids=" + this.uid + "&folder=" + this.folder;
				var url = GO.contextRoot + "app/#note/write" + param;
				
				this.externalSetUrl(url);
			},
			
			
			replyAll : function() {
				var param = "?type=replyall&uids=" + this.uid + "&folder=" + this.folder;
				var url = GO.contextRoot + "app/#note/write" + param;
				
				this.externalSetUrl(url);
			},
			
			
			delivery : function() {
				var param = "?type=forward&uids=" + this.uid + "&folder=" + this.folder;
				var url = GO.contextRoot + "app/#note/write" + param;
				
				this.externalSetUrl(url);
			},
			
			
			destroy : function() {
				var self = this;
				var callback = function() {
					var deferred = $.Deferred();
					self.initPreloader(deferred);

					var param = {
							folderNames : [self.folder],
							uids : [self.uid]
						};
					
					$.ajax({
						url : "/api/mail/message/delete",
						type : "POST",
						data : param,
						traditional : true,
						success : function() {
							deferred.resolve();
						},
						error : function() {
							console.log('note:{"function" : "deleteComplete", "param1" : "false"}');
						}
					});
				};
				
				$.goPopup({
					message : commonLang["삭제하시겠습니까?"],
					modal : true,
					allowPrevPopup : true,
					pclass : "layer_confim layer_colleage layer_smallmail smail_pop",
					buttons : [{
						btext : commonLang["확인"],
						btype : 'confirm',
						callback : callback
					}, {
						btext : commonLang["취소"],
						btype : 'normal'
					}]
				});
			},
			
			
			preview : function(e) {
				var part = $(e.currentTarget).parents("li[part]").attr("part");
				var param = {
						folderName : this.folder,
						uid : this.uid,
						part : part,
						type : "normal",
						sharedFlag : "user",
						sharedFolderName : "",
						sharedUserSeq: "0"
					};
				var url = GO.contextRoot + "app/mail/popup/process?path=previewAttach&data=" + encodeURIComponent(JSON.stringify(param));
				console.log('note:' + JSON.stringify({
				     "function" : "preview", 
				     "param1" : url
				}));
			},
			
			
			download : function(e) {
				var target = $(e.currentTarget);
				var part = target.parents("li[part]").attr("part");
				var data = {
					folderName : this.folder,
					uid : this.uid,
					part : part,
					type : "normal",
					sharedFlag : "user",
					sharedFolderName : "",
					sharedUserSeq: "0"
				};

				var url = "/api/mail/message/attach/download?" + $.param(data);
				console.log('note:' + JSON.stringify({
				     "function" : "download", 
				     "param1" : url,
				     "param2" : target.text()
				}));
			},
            
            
            externalSetUrl : function(url) {
            	console.log('note:' + JSON.stringify({
				     "function" : "setUrl", 
				     "param1" : url
				}));
            }
		});
		
		return LayerView;
	});
}).call(this);