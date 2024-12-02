;(function() {
	define([
			"backbone",
			"app",
			"hogan",
			"i18n!nls/commons",
			"hgn!note/templates/note_write",
			"file_upload",
			"jquery.autocomplete",
			"go-webeditor/jquery.go-webeditor",
			"jquery.go-preloader"
	], 
	function(
			Backbone,
			App,
			Hogan,
			commonLang,
			SendMailLayerTmpl,
			FileUpload
	) {
		var instance = null;
		window.setEmail = function(name, email) {
			var $to = instance.$("#to");
			var to = name + "<" + email + ">"; 
			instance.makeFormatUnit($to, to);
		};
		
		var lang = {
			"to" : commonLang["받는사람"],
			"subject" : commonLang["제목"],
			"attach" : commonLang["첨부파일"],
			"addAttach" : commonLang["파일 첨부"],
			"send" : commonLang["보내기"],
			"fileName" : commonLang["첨부파일명"],
			"size" : commonLang["크기"],
			"delete" : commonLang["삭제"],
		};
		
		var fileTpl = Hogan.compile(
    			'<tr data-path="{{path}}" data-name="{{name}}" data-size="{{size}}" data-uid="{{uid}}" data-hostid="{{hostId}}">' +
					'<td></td>' +
					'<td class="align_l">' +
						'<span class="item_file">' +
							'<span class="ic_file {{ext}}"></span>' +
							'<span class="name">{{name}}</span>' +
						'</span>' +
					'</td>' +
					'<td class="align_r"><span class="size">{{sizeUnit}}</span></td>' +
					'<td>' +
						'<span class="btn_bdr" data-btn="deleteAttach">' +
            				'<span class="ic_classic ic_basket" title=""></span>' +
        				'</span>' +
    				'</td>' +
				'</tr>'
			);
		
		var Model = Backbone.Model.extend({
			getAttachList : function() {
				return this.get("attaches");
			},
			
			
			convertAttach : function() {
				_.each(this.getAttachList(), function(attach) {
					if (!attach.size) attach.isDelete = true;
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
			events : {
				"click span[data-btn=deleteAttach]" : "deleteAttach",
				"click #send" : "send"
			},
			
			initialize : function(options) {
				var param = GO.router.getSearch(); 
				
				this.uid = param.uids;
				this.type = param.type || "normal";
				this.folder = param.folder;
				this.model = new Model();
			},
			
			render : function() {
				var tmpl = SendMailLayerTmpl({
						lang : lang
					});
				this.$el.html(tmpl);	
				
				this.makeInputAddresskeyEvt("to");
	            var options = {
            		"autoResizeWidth" : true,
            		"makeFormat" : true,
            		"makeFormatFunc" : this.makeFormatUnit,
            		"multiple" : false,
            		"width" : "400px",
            		"matchCase" : true,
            		"notContact" : "F",
            		excSearchOption : "O",
            		offKeyPress : $.browser.msie ? true : false,
    				customLeft : true
	            };
	            this.$("#to").autocomplete("/api/mail/address/search/name", options);
	            
	            this.initSmartEditor();
	            this.initFileUpload();
	            
	            if (this.model.get("uids")) this.renderData();
	            
	            return this;
			},
			
			
			fetch : function() {
				var self = this;
				var data = {
					folderName : this.folder,
					uids : [this.uid],
					wtype : this.type,
					sharedFlag : "user",
					sharedUserSeq : 0
				};
				if (this.type == "forward") data.fwmode = "parsed";
				var deferred = $.ajax({
					url : "/api/mail/message/write",
					data : JSON.stringify(data),
					type : "POST",
					contentType : "application/json",
					success : function(resp) {
						var data = resp.data;
						
						self.model.set(data);
					},
					error : function(e) {
						console.log(e);
					}
				});
				
				return deferred;
			},
			
			
			send : function() {
				if (!GO.Editor.getInstance("content").validate()) {
            		$.goError(commonLang['마임 사이즈 초과']);
            		return false;
            	}
				
				var self = this;
				var session = GO.session();
				var content = GO.Editor.getInstance("content").getContent();
				var senderEmail = session.email;
				var senderName = session.name;
				var to = this.getRecipientEmail();
				var senderUserEmail = session.name ? '"' + session.name + '"' + " <" + session.email + ">" : (session.email || "");
				var subject = this.$("#subject").val();
				var attachList = this.getAttaches();
				var isInvalidRecipient = this.isInvalidRecipient();
				
				if (!to || isInvalidRecipient) {
					this.$("#recipientsArea").focus();
					$.goError(commonLang["받는 사람을 다시 확인해 주세요."], this.$("#recipientsArea"), false, true);
					return;
				}
				
				if (!subject) {
					this.$("#subject").focus();
					$.goError(commonLang["제목을 입력하세요."], this.$("#subject"), false, true);
					return;
				}
				
				var param = {
					senderEmail : senderEmail,
					senderName : senderName,
					sendType : "__sent_go_note__",
					sendFlag : null,
					charset : "EUC-KR",
					folderName : null,
					uids : [],
					draftMessageId : null,
					attachSign : false,
					signSeq : "",
					bannerDisplay : false,
					bannerContent : null,
					to : to,
					cc : "",
					bcc : "",
					massMode : false,
					senderMode : true,
					senderUserEmail : senderUserEmail,
					subject : subject,
					writeMode : "html",
					sendEmailCheckResult : false,
					sendAttachCheckResult : false,
					sendKeywordCheckResult : false,
					sendInfoCheck : false,
					content : content,
					receivenoti : true,
					saveSent : true,
					attachList : attachList,
					bigAttachMode : false,
					bigAttachContent : "",
					sharedFlag : "user",
					sharedUserSeq : 0,
					sharedFolderName : ""
				};
				
				var deferred = $.Deferred();
				this.initPreloader(deferred);
				
				var action = "/api/mail/message/send";
				
				$.ajax({
					url : action,
					data : JSON.stringify(param),
					type : "POST",
					contentType : "application/json",
					success : function(result) {
						deferred.resolve();
						if (result.data.sendError) {
							self.externalSendComplete(false, result.data.errorMessage);
						} else {
							self.externalSendComplete(true, "success");							
						}
					},
					error : function(e) {
						console.log(e);
						self.externalSendComplete(false, e.statusText);
					}
				});
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
			
			
			getRecipientEmail : function() {
				var emailList = _.map(this.$("#recipients").find("span.name"), function(mail) {
					return $(mail).data("email");
				});
				
				return emailList.join(",");
			},
			
			
			isInvalidRecipient : function() {
				return this.$("#recipients").find("li.invalid").length > 0; 
			},
			
			
			getAttaches : function() {
				var attaches = [];
				_.each(this.$("#attachArea").find("tr"), function(value){
					var options = [
		               $(value).attr('data-path'),
		               $(value).attr('data-name'),
		               $(value).attr('data-size'),
		               $(value).attr('data-hostid'),
		               $(value).attr('data-uid'),
	                ];
					
					attaches.push(options.join("\t"));
		        });
				
				return $.trim(attaches.join("\n"));
			},
			
			
			makeAddressUnitFormat : function(fromId, value){
				if ($.trim(value) == "") return;
			    var $input = $("#"+fromId);
			    this.makeFormatUnit($input, value);
			    $input.focus();
			    $input.width("80px");
			},
			
			
			makeFormatUnit : function(inputObj, value){
				if ($.trim(value) == "") return;
				
				addressArray = new Array();
				
				addressSplit = value.split(">,");
				for (var i=0; i<addressSplit.length; i++) {
					tempAddressArray = addressSplit[i].split(",");
					
					for (var j=0; j<tempAddressArray.length; j++) {
						tempAddressArray[j] = $.trim(tempAddressArray[j]);
					}
					
					addressArray = addressArray.concat(GO.util.makeFormatEmail(tempAddressArray));
				} 
				
			    for (var i=0; i<addressArray.length; i++) { 
			        value = addressArray[i];

					var isValid = GO.util.checkEmailFormat(value);
					var data = null;
					
					if (!isValid) {
						data = getEmailByName(value);
						if (data.email && data.name) {
							value = '"' + data.name + '" <' + data.email + '>';
							isValid = GO.util.checkEmailFormat(data.email);
						}
					}
					
					var displayName = (isValid) ? GO.util.get_name(value) : value;
					var displayText = (isValid) ? (displayName || GO.util.get_email(value)) : value;
					var dataName = (isValid) ? GO.util.getEmailFormatName(value) : value;
					var nameField = $('<span class="name" id="nameField" evt-rol="select-field" onselectstart="return false"></span>')
						.attr("title",displayText)
						.data("email",dataName)
						.data("select",false)
						.text(displayText);
				    var modWrap = "";
				    var delField = $('<span class="ic_classic ic_del"></span>');
				    delField.attr("title","삭제").click(function(){
				    	var emailWrap = $(this).closest('li');
				    	emailWrap.find("input.edit").unautocomplete();
				    	emailWrap.remove();
				    	inputObj.focus();
				    });
				    var delWrap = $('<span class="btn_wrap"></span>').append(delField);
				    var addrWrap = $('<li></li>');
				    addrWrap.addClass((!isValid || !displayName) ? "invalid" : "");
				    addrWrap.append(nameField).append(modWrap).append(delWrap);
				    inputObj.closest('li').before(addrWrap);
				    inputObj.val("");
				}
			    
			    function getEmailByName(keyword) {
			    	var name = null;
			    	var email = null;
			    	
					$.ajax({
	    				url : GO.contextRoot + "api/user/sort/list",
	    				data : {
	    					keyword : keyword
	    				},
	    				type : "GET",
	    				async : false,
	    				success : function(resp) {
	    					hasName = resp.data.length > 0;
	    					if (hasName) {
	    						name = resp.data[0].name;
	    						email = resp.data[0].email;
	    					}
	    				},
	    				error : function(error) {
	    					console.log(error);
	    				}
	    			});
	    			
	    			return {
	    				hasName : hasName,
	    				name : name,
	    				email : email
	    			};
				}
			},
			
			
			makeFormatEmail : function(addressArray){
				var newAddressArray = new Array();
				var newAddressIndex = 0;
				var secDoubleQuote = false;
				for (var i=0; i<addressArray.length; i++) {
					if(addressArray[i].indexOf("\"") > -1) {
						for(var j=i+1 ; j<addressArray.length; j++){
							if(addressArray[j].indexOf("\"") > -1) {
								secDoubleQuote = true;
								for(var k=i; k<=j; k++) {
									if(k==i) {
										newAddressArray[newAddressIndex] = addressArray[k] + ",";
									} else if(k==j) {
										newAddressArray[newAddressIndex] = newAddressArray[newAddressIndex] + addressArray[k];
									} else {
										newAddressArray[newAddressIndex] = newAddressArray[newAddressIndex] + addressArray[k] + ",";
									}
									
								}
								newAddressIndex++;
								break;
							}
						}
						
						if(!secDoubleQuote) {
							newAddressArray[newAddressIndex] = addressArray[i];
						}
						i = j;
					} else {
						newAddressArray[newAddressIndex] = addressArray[i];
						newAddressIndex++;
					}
				}
				return newAddressArray;
			},
			
			
			makeInputAddresskeyEvt : function(fromId){
				var _this = this;
			    var form = $("#" + fromId);
			    form.keydown(function(event) {
			        var value = $.trim($(this).val());
			          if (event.which == 188 && !event.shiftKey) {
			        	  _this.makeInputAddressFormat(fromId, value);
			              event.preventDefault();
			          }
			    });
			    form.blur(function(event) {
			        event.preventDefault();
			        var value = $.trim($(this).val());
			        var fromIdObj = $("#"+fromId+"_actb");
			        if (fromIdObj.length == 0 || fromIdObj.css("display")=="none") {   
			            if ($("div.layer_auto_complete:hover").length) {
			                $(this).val("");
			            } else {
			            	_this.makeInputAddressFormat(fromId, value); 
			            }
			        } else {
			        	if ($("div.layer_auto_complete:hover").length) {
			                $(this).val("");
			            } else {
			            	_this.makeInputAddressFormat(fromId, value);
			            }
			        }
			    });
			    form.keydown(function(event) {
			        if (event.which == 8) {
			          if ($(this).val() == "") {
			              $(this).closest("ul.name_tag").find("li:not(.creat):last").remove();
			          }
			        }
			    });
			},
			
			
			makeInputAddressFormat : function(fromId, addressStr){
			    if (!addressStr) return;
			    var tempAddressStr = $.trim(addressStr);
			    var tempAddressArray = tempAddressStr.split(">,");
			    for (var i=0; i<tempAddressArray.length; i++) {
			        this.makeAddressUnitFormat(fromId, tempAddressArray[i]);
			    }
			},
			
			
			initSmartEditor : function(content) {
				this.$("#content").goWebEditor({
					contextRoot : GO.config("contextRoot"),
					lang:GO.session('locale'),
					editorValue : (this.model.get("htmlContent") || ""),
					bUseVerticalResizer : false
				}, true);
			},
			
			
			renderData : function(data) {
				var $to = this.$("#to");
				
				this.makeFormatUnit($to, this.model.get("to"));
				
				this.$("#subject").val(this.model.get("subject"));
				
				if (this.model.hasAttach()) this.renderAttaches();
			},
			
			
			renderAttaches : function() {
				this.$("#attachArea").show();
				_.each(this.model.getAttachList(), function(attach) {
					this.$("#attachList").append(fileTpl.render({
						path : attach.upkey,
						name : attach.name,
						size : attach.size,
						sizeUnit : GO.util.getHumanizedFileSize(attach.size),
						hostId : attach.hostId,
						uid : attach.uid,
						ext : GO.util.getFileIconStyle({
	            			extention : attach.name.split(".")[1]
	        			})
					}));
				});
			},
			
			
			initFileUpload : function(){
                var self = this,
                    options = {
                        el : "#file-control",
                        context_root : GO.contextRoot ,
                        button_text : "<span class='buttonText'>"+lang.addAttach+"</span>",
                        url : "api/mail/file/upload",
						button_height: 22,
                        isMail : true,
                        file_post_name : "theFile",
                        post_params : {uploadType : "flash", email : GO.session().email},
                };
                
                (new FileUpload(options))
                .queue(function(e, data){
                    
                })
                .start(function(e, data){
                	if(!GO.config('attachFileUpload')){
                		$.goAlert(commonLang['파일첨부용량초과']);
                		return false;
                	}
                	if(GO.config('excludeExtension')){
                        var test = $.inArray(data.type.substr(1).toLowerCase(),GO.config('excludeExtension').split(','));
                        if(test >= 0){
                            $.goMessage(App.i18n(commonLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'], "arg1", GO.config('excludeExtension')));
                            return false;
                        }
                    }
                    
                	var maxAttachSize = self.model.get("maxAttachSize");
                    if(maxAttachSize){
                        var size = data.size / 1024 / 1024;
                        if(maxAttachSize < size){
                            $.goMessage(App.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                            return false;
                        }
                    }
                    
                    if(GO.config('attachNumberLimit')){
                        var currentAttachCnt = $('#fileWrap').children().size() + $("#img_wrap").children().size();
                        var limitAttachCnt = GO.config('maxAttachNumber');
                        if(limitAttachCnt <= currentAttachCnt){     
                            $.goMessage(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", limitAttachCnt));
                            return false;
                        }
                    }
                })
                .progress(function(e, data){
                    
                })
                .success(function(e, obj, fileItemEl){
                	var file = obj.data;
                	var isImage = GO.util.isImage(file.fileExt);
                	self.$("#attachArea").show();
                	
                	fileItemEl.attr("data-hostId", file.hostId);
                	
                	self.$("#attachList").append(fileTpl.render({
                		name : file.fileName,
                		size : file.fileSize,
                		sizeUnit : GO.util.getHumanizedFileSize(file.fileSize),
                		path : file.filePath,
                		uid : file.uid,
                		hostId : file.hostId,
                		ext : GO.util.getFileIconStyle({
                			extention : file.fileExt.split(".").join("")
            			})
                	}));
                })
                .complete(function(e, data){
                    console.info(data);
                })
                .error(function(e, data){
                    console.info(data);
                });
            },
            
            
            deleteAttach : function(e) {
            	$(e.currentTarget).parents("tr[data-path]").remove();
            	this.$("#attachArea").toggle(this.hasAttach());
            },
            
            
            setData : function() {
            	console.log("setData");
            },
            
            
            hasAttach : function() {
            	return this.$("#attachList").find("tr").length > 0;
            },
            
            
            externalSendComplete : function(flag, result) {
            	console.log('note:' + JSON.stringify({
				     "function" : "sendComplete", 
				     "param1" : flag,
				     "param2" : result
				}));
            }
		});
		
		return {
			init : function(option) {
				instance = new LayerView(option);
				return instance;
			}
		};
	});
}).call(this);