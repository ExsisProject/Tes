;(function() {
	define([
			"backbone",
			"app",
			"i18n!nls/commons",
			"hgn!components/emailSend/templates/send_mail_layer",
			"i18n!nls/commons",
			"jquery.autocomplete"
	], 
	function(
			Backbone,
			App,
			commonLang,
			SendMailLayerTmpl,
			commonLang
	) {
		var lang = {
			"to" : commonLang["받는사람"],
			"addr" : commonLang["주소록"],
			"subject" : commonLang["제목"],
			"memo" : commonLang["메모"],
			"content" : commonLang["내용"],
			"attach" : commonLang["첨부파일"],
			"confirm" : commonLang["확인"],
			"cancel" : commonLang["취소"],
			"appr_desc" : commonLang["※ 결재 문서는 html 변환되어 첨부파일로 발송합니다."]
		};
				
		var LayerView = Backbone.View.extend({
			el : '.go_popup .content',
			events : {
				"click span#writeAddAddress" : "showAddAddress"
			},
			initialize : function(options) {
				this.options = options || {};
				this.content =  this.options.content;
				this.attachInfos = this.options.attachInfos;
				this.targetApp = this.options.targetApp;
			},
			showAddAddress : function(e){
				var _this = this;
				$.goPopup({
					pclass: 'layer_normal layer_address',
					header: lang['addr'],
					width:980,
					modal : true,
					allowPrevPopup : true,
					contents: "<iframe id='writeAddrRcptFrame' name='writeAddrRcptFrame' scrolling='no' src='"+GO.config("contextRoot")+"app/contact/connector/to' frameborder='0' style='border:0;width:100%;height:470px;overflow: hidden;'></iframe>",
					buttons : [
							   {
								   btype : 'confirm',
								   btext : lang['confirm'],
								   autoclose:false,
								   callback:function(rs,e){
									   _this.applyWriteAddrRcpt(rs,e);   
								   }
							   },
							   {
								   btype : 'cancel',
								   btext : lang['cancel'],
								   autoclose:false,
								   callback:function(rs,e){
									   rs.close('',e);
								   }
								}
					]
				});
			},
			
			applyWriteAddrRcpt : function(rs,e){
				//메일주소 세팅
				
				var addrObj;
			    if ($.browser.msie) {
			        addrObj = window.writeAddrRcptFrame.getAddrRcptList();
			    } else {
			        addrObj = document.getElementById("writeAddrRcptFrame").contentWindow.getAddrRcptList();
			    }
			    
			    var toList = addrObj.toList;
			    if (toList && toList.length > 0) {
			        for (var i=0; i<toList.length; i++) {
			            this.insertRcptEmail("to", toList[i]);
			        }
			    }
			    
				rs.close('',e);
			},
			insertRcptEmail : function(rcptType, email){
			    if ($.trim(email) != "") {
		            this.makeAddressUnitFormat(rcptType, email);
			    }
			},
			makeAddressUnitFormat : function(fromId, value){
				if ($.trim(value) == "") return;
			    var $input = $("#"+fromId);
			    this.makeFormatUnit($input, value);
			    $input.focus();
			    $input.width("80px");
			},
			makeFormatUnit : function(inputObj, value){
				var _this = this;
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
					var emailValue = GO.util.get_email(value);
					var isAddrGroup = (isValid) ? ((emailValue.indexOf("$") == 0 || emailValue.indexOf("#") == 0 || emailValue.indexOf("!") == 0) ? true : false) : false;
					var displayName = (isValid) ? GO.util.getFormatName(value) : value;
					var dataName = (isValid) ? GO.util.getEmailFormatName(value) : value;
					var nameField = $('<span class="name" id="nameField" evt-rol="select-field" onselectstart="return false"></span>').attr("title",displayName).data("email",dataName).data("select",false).text(displayName);
					var modField = $('<span class="ic_con ic_edit_m" evt-rol="mod-field"></span>');
					
				    modField.attr("title","수정").click(function(){
				    	$(this).closest("li").find("span.btn_wrap").hide();
				    	var isInvalidAddr = $(this).closest("li").hasClass("invalid");
				    	var emailObj = $(this).closest("li").addClass((isInvalidAddr) ? "invalid_on" : "on").find("span.name");
				    	var email = emailObj.data("email");
				    	/**
				    	 * GO-17050. 인라인으로 스타일 추가.
				    	 */
				    	var style = "display:none;max-width:300px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"; 
				    	var input = [
		    	            '<input type="text" evt-rol="mod-field-inside" class="edit" style="', style, '">'
	    	            ].join("");
				    	var editField = $(input).val(email);
				    	var options = {
			    			"autoResizeWidth":true,
			    			"makeFormat":true,
			    			"multiple":false,
			    			"width":"400px",
			    			"matchCase":true,
			    			"editMode":true,
			    			"editModeFunc":_this.makeEditFormatUnit.bind(_this)
			    		};
				    	
				        $(editField).autocomplete(GO.config("contextRoot")+"api/mail/address/search/name",options);
				    	emailObj.before(editField).remove();
						editField.blur(function(event) {
							event.preventDefault();
							isModFieldInside=false;
							if ($("div.layer_auto_complete:hover").length) {
				                $(this).val("");
				            } else {
				                GO.util.makeEditFormatUnit(editField,editField.val());
				            }
						}).keydown(function(event) {
							if(event.which == 13) {
								isModFieldInside=false;
							}
					    });
						var e = $.Event("keydown");e.which = 40;
						editField.trigger(e).show().focus();
				    });
				    
				    var modWrap = "";
				    if (!isAddrGroup) {
				    	modWrap = $('<span class="btn_wrap"></span>').append(modField);
				    }
				    
				    var delField = $('<span class="ic_classic ic_del"></span>');
				    delField.attr("title","삭제").click(function(e){
				    	e.stopPropagation();
				    	var emailWrap = $(this).closest('li');
				    	emailWrap.find("input.edit").unautocomplete();
				    	emailWrap.remove();
				    	inputObj.focus();
				    });
				    
				    var delWrap = $('<span class="btn_wrap"></span>').append(delField);
				    var addrWrap = $('<li></li>');
				    
				    addrWrap.addClass((!isValid) ? "invalid" : "");
				    addrWrap.append(nameField).append(modWrap).append(delWrap);
				    inputObj.closest('li').before(addrWrap);
				    inputObj.val("");
				}
			},
			
			makeEditFormatUnit : function(inputObj, value){
				if ($.trim(value) == "") return;
				var isValid = GO.util.checkEmailFormat(value);
				var displayName = (isValid) ? GO.util.getFormatName(value) : value;
				var dataName = (isValid) ? GO.util.getEmailFormatName(value) : value;
				var nameField = $('<span class="name" evt-rol="select-field" onselectstart="return false"></span>').attr("title",displayName).data("email",dataName).data("select",false).text(displayName);
				inputObj.before(nameField);
				inputObj.closest("li").removeClass("invalid invalid_on on").addClass((!isValid) ? "invalid" : "");
				inputObj.closest("li").find("span.btn_wrap").show();
				inputObj.unautocomplete();
				inputObj.remove();
			},
			makeFormatEmail : function(addressArray){
				var newAddressArray = new Array();
				var newAddressIndex = 0;
				var firstDoubleQuote = false;
				var secDoubleQuote = false;
				for (var i=0; i<addressArray.length; i++) {
					if(addressArray[i].indexOf("\"") > -1) {
						firstDoubleQuote = true;
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
			    $("#"+fromId)
			    .keydown(function(event) {
			        var value = $.trim($(this).val());
			          if (event.which == 188 && !event.shiftKey) {//,
			        	  _this.makeInputAddressFormat(fromId, value);
			              event.preventDefault();
			          }
			    })
			    .blur(function(event) {
			    	// 이메일 검색 결과 리스트의 scroll 을 클릭했는데 리스트가 닫히는 이슈 발생.
			        // blur 이벤트는 IE에서 sroll 등을 클릭했을때도 발생한다는 점을 고려해야한다.
			    })
			    .keydown(function(event) {
			        if (event.which == 8) {
			          if ($(this).val() == "") {
			              $(this).closest("ul.name_tag").find("li:not(.creat):last").remove();
			          }
			        }
			    });
			    
			    function customBlur() {
			    	var form = _this.$("#" + fromId);
			    	var value = $.trim(form.val());
			    	if (_this.$("div.layer_auto_complete:hover").length) {
			    		form.val("");
			    	} else {
			    		_this.makeInputAddressFormat(fromId, value); 
			    	}
			    }
			    
			    $(document).off("click.outside-mail");
        		$(document).on("click.outside-mail", function(e) {
        			var targetType = $(e.target).attr("data-outside");
        			if (targetType == undefined) {
        				customBlur();
        			} else {
        				return;
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
			preventEnterKey: function(formId) {
				$("#" + formId).keypress(
	            	function(event) {
	            		if (event.keyCode == 13 && $(event.currentTarget).prop('tagName') != 'TEXTAREA') {
	            			event.preventDefault();
	            		}
	            	}
	            );
			},
			render : function() {				
				var _this = this;
				var existFile = function(){
					if(_this.attachInfos.length > 0) {
						return true;
					}
					return false;
				};
				
				var tmpl = SendMailLayerTmpl({
						content : this.content,
						fileList : this.attachInfos,
						isApproval : this.targetApp == 'approval' ? true : false,
						existFile : existFile,
						lang : lang
					});
				this.$el.html(tmpl);	
				
				// 리팩토링...... 처음 자동완성 세팅~~
				this.makeInputAddresskeyEvt("to");
	            var options = {
	            		"autoResizeWidth":true,
	            		"makeFormat":true,
	            		"makeFormatFunc":this.makeFormatUnit.bind(this),
	            		"multiple":false,
	            		"width":"400px",
	            		"matchCase":true,
	            		//"notContact": (USE_CONTACT==true? "F":"T")
	            		"notContact": "F"
	            };
	            $("#to").autocomplete(GO.config("contextRoot") + "api/mail/address/search/name",options);
	            
	            // 제목, 내용에서 엔터키 입력시 submit 방지
	            this.preventEnterKey("subject");
	            this.preventEnterKey("mail_content");
			}
		},{
            __instance__: null,
            create: function(options) {
                var instance = new LayerView({
                    "content" : options.content,
                    "attachInfos" : options.attachInfos,
                    "targetApp" : options.targetApp
                });
                instance.render();
                return instance;
            }            
        }); 
		return LayerView;
	});
}).call(this);