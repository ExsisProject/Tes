define('sms/views/send', function(require) {

	var commonLang = require("i18n!nls/commons");
	var smsLang = require("i18n!sms/nls/sms");
	var contactLang = require("i18n!contact/nls/contact");

	var BaseSmsView = require("sms/views/base_sms");
	var ConnectorView = require("sms/views/connector");

	var sendTmpl = require("hgn!sms/templates/send");
	var receiverItemTmpl = require("hgn!sms/templates/receiver_item");
	var receiverEmptyTmpl = require("hgn!sms/templates/receiver_empty");
	var connectorTmpl = require("hgn!sms/templates/connector");

	var UserProfileModel = require("models/user_profile");
	var AccessModel = require("sms/models/access_config");
	var MessageModel = require("sms/models/message");
	
	var ProfileView = require("views/profile_card");

	var FileUpload = require("file_upload");
	var App = require("app");

	var lang = {
		"delete": commonLang["삭제"],
		"add": commonLang["추가"],
		"phone": commonLang["전화번호"],
		"senderNumber": smsLang["발신번호"],
		"send": commonLang["보내기"],
		"photo": commonLang["사진"],
		"name": commonLang["이름"],
		"lms": smsLang["장문"],
		"contentPlaceholder": smsLang["메시지를 작성해주세요."],
		"subjectPlaceholder" : smsLang["제목입력"] + "(" + App.i18n(smsLang['최대0byte'], "arg1", 30) + ", " + smsLang["발송관리용"] + ")",
		"senderNumDesc": smsLang["발신번호안내메세지"],
		"fileSizeDesc": smsLang["문자발송 파일크기초과"]

	};
	
	var storeKey = GO.session('loginId') + '.sms.rep.number';

	/**
	 * 문자발송 홈 메인 뷰
	 */

	var SendView = BaseSmsView.extend({

		events: {
			"click .delete_receiver": "deleteReceiver",
			"click #addReceiver": "addReceiver",
			"click span.send_message": "sendMessage",
			"keyup textarea#messageContent": "checkMessageCount",
			"keyup #subject" : "checkSubjectCount",
			"click span.ic_del": "deleteFile",
			"click #openConnector": "openConnector"
		},


		initialize: function(options) {
			BaseSmsView.prototype.initialize.apply(this, arguments);
			this.accessModel = new AccessModel()
			this.messageType = "SMS";
		},


		render: function() {

			var self = this;

			BaseSmsView.prototype.render.apply(this, arguments);
			$("h1#breadcrumb").empty().html(smsLang["문자 발송"]);

			this.userProfile = UserProfileModel.read(GO.session().id).toJSON();
			
			this.accessModel.fetch({
				async: false
			});
			
			this.isLms = this.accessModel.isLms();
			this.isMms = this.accessModel.isMms();

			this.$el.html(sendTmpl({
				user: this.userProfile,
				lang: lang,
				isLms: this.isLms,
				isMms: this.isMms
			}));
			
			this.$el.find('a[data-userid]').click(function(e) {
				var userId = $(e.currentTarget).attr('data-userid');
				if(userId != ""){
					ProfileView.render(userId, e.currentTarget);
				}
			});
			
			$.ajax({
    			type : "GET",
    			async : false,
    			dataType : "json",
    			url : GO.contextRoot + "api/sms/repnumber/normal",
    			success : function(resp) {
    				if(resp.data.length < 1){
    					if(!self.userProfile.mobileNo){
    						$.goMessage(smsLang["발신자 핸드폰 번호가 존재하지 않아 문자발송을 하실 수 없습니다."]);
    						App.router.navigate("sms", true);
    					}
    				}
    				if(resp.data){
    					_.each(resp.data, function(data){
    						var optionData = '<option data-id="' + data.id +'" value="' + data.repNumber + '">' + 
    											data.repNumber + "( " + data.name + " )" + 
											'</option>';
    						$("#select_number").append(optionData);
    					})
    				}
    			},
    			error : function(resp) {
        			$.goError(resp.responseJSON.message);
        		}
    		});
			
			if(GO.util.store.get(storeKey)){
				$("#select_number option[data-id='" + GO.util.store.get(storeKey) + "']").attr('selected', true);
			}

			this.changeReceiverCount();
			this.initFileUpload();
			$("#subject").placeholder();
			$("#messageContent").placeholder();
			$("#receiverName").placeholder();
			$("#receiverNumber").placeholder();
		},

		initFileUpload: function(options) {
			var self = this,
				options = {
					el: "#file-control",
					context_root: GO.contextRoot,
					button_text: "<span class='buttonText'>" + smsLang["포토"] + "</span>",
					url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
					progressBarUse: false,
				};

			(new FileUpload(options))
			.queue(function(e, data) {
				})
				.start(function(e, data) {
					var reExt = new RegExp("(jpeg|jpg)", "gi"),
						fileExt = data.type;

					if (data.size > 60 * 1024 || !reExt.test(fileExt)) {
						$.goMessage(smsLang["문자발송 파일크기초과"]);
						return false;
					}

					var currentAttachCnt = $(".img_wrap").children().size();
					if (1 <= currentAttachCnt) {
						$.goMessage(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", 1));
						return false;
					}
				})
				.progress(function(e, data) {

				})
				.success(function(e, data, fileItemEl) {
					// 한개의 파일만 들어가야 하므로 두개이상 선택하여 파일첨부를 하는 경우 마지막 파일만 넣어준다.
					self.$el.find("#fileComplete").children().remove();
					self.$el.find("#fileComplete").append(fileItemEl);
					self.$el.find("#attachButton").hide();
				})
				.complete(function(e, data) {})
				.error(function(e, data) {});
		},

		deleteFile: function(e) {
			var targetEl = $(e.currentTarget),
				parentEl = targetEl.parents("li");

			parentEl.remove();
			
			$("#attachButton").show();
		},

		deleteReceiver: function(e) {
			var target = $(e.currentTarget);
			target.closest('tr').remove();
			this.changeReceiverCount();
		},

		addReceiver: function(e) {

			var number = $("#receiverNumber").val();
			var name = $("#receiverName").val();

			var invalidAction = function(msg, focusEl) {
				$.goMessage(msg);
				if (focusEl) focusEl.focus();
				return false;
			};

			if (!$.goValidation.isInvalidTel(number) || number.length == 0) {
				invalidAction(contactLang['번호형식이 올바르지 않습니다(-,0~9)'], $("#receiverNumber"));
				return false;
			}

			if(!$.goValidation.isCheckLength(0, 64, name)){
				invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"64"}), $('#receiverName'));
				return false;
			}
			
			var item = receiverItemTmpl({
				name: name,
				number: number,
				icon : "ic_user",
				deleteItem: commonLang["삭제"]
			});

			$("table.address_list>tbody").prepend(item);
			$("#receiverName").val('');
			$("#receiverNumber").val('');

			this.changeReceiverCount();
		},

		openConnector: function(e) {
			var self = this;
            var connectorView = new ConnectorView();
			this.popupEl = $.goPopup({
				pclass: 'layer_normal layer_address layer_message',
				header: commonLang["주소록"] + " / " + commonLang["조직도"],
				width: 1000,
				modal: true,
				allowPrevPopup: true,
				buttons: [{
					btype: 'confirm',
					btext: commonLang["확인"],
					autoclose: false,
					callback: function(rs, e) {
                        var listData = connectorView.getData();

                        if(!listData){
                            $.goSlideMessage(smsLang["수신자가 없습니다."], "caution");
                            return;
                        }

                        _.each(listData, function(itemData){
                            var name = itemData.name;

                            if(itemData.type == 'subdepartment'){
                                name += "(" + itemData.nameAddition + ")";
                            }

                            var item = receiverItemTmpl({
                                name : name,
                                id : itemData.id,
                                type : itemData.type,
                                number : itemData.mobileNo,
                                icon : getIcon(itemData.type),
                                deleteItem: commonLang["삭제"]
                            });

                            $("table.address_list>tbody").append(item);
                            self.popupEl.close();
                            self.changeReceiverCount();

                            function getIcon(type){
                                var icon;
                                if(type == 'group') {
                                    icon = 'ic_team';
                                } else if(type == 'department' || type == 'subdepartment') {
                                    icon = 'ic_company';
                                } else {
                                    icon = 'ic_user';
                                }

                                return icon;
                            }
                        });
					}
				
				}, {
					btype: 'cancel',
					btext: commonLang["취소"],
					autoclose: false,
					callback: function(rs, e) {
						rs.close('', e);
					}
				}]
			});

            this.popupEl.find(".content").html(connectorView.el);
			connectorView.render();
			this.popupEl.reoffset();
		},

		checkMessageCount: function(e) {
			var message = $("#messageContent").val();
			var mesasgeCount = this.checkByte(message);
			var maxCount = this.isLms ? "2000 Byte" : "90 Byte";

			if (mesasgeCount > 90) {
				if(!this.isLms) {
					$.goMessage(smsLang["장문"] + " " + commonLang["권한이 없습니다."]);									
				}
				this.messageType = "LMS";
				$('#lmsType').show();
				$('#subject').attr("placeholder", smsLang["제목입력"] + "(" + App.i18n(smsLang['최대0byte'], "arg1", 30) + ")");
			} else {
				this.messageType = "SMS";
				$('#lmsType').hide();
				$('#subject').attr("placeholder", lang.subjectPlaceholder);
			}
			$("#messageCount").text(mesasgeCount + ' / ' + maxCount);
		},
		
		checkSubjectCount: function(e) {
			var subject = $("#subject").val();
			var subjectCount = this.checkByte(subject);
			
			if(subjectCount > 30){
				$("#subject").val(this.subStringByByte(subject));
			}
		},

		changeReceiverCount: function(e) {
			var trLength = $("table.address_list>tbody>tr.receiver_item").length;
			var totalCount = GO.i18n(smsLang["총건수"], {
				num: trLength
			});
			$("#totalCount").text(totalCount);

			if (trLength == 0) {
				var item = receiverEmptyTmpl({

				});

				$("table.address_list>tbody").prepend(item)

			} else {
				$("#receiverEmpty").remove();
			}

		},
		
		subStringByByte: function(text) {
			var inputString = text;
			var byte = 0;
			
			for(var idx=0; idx<inputString.length; idx++) {
				if (inputString.charCodeAt(idx) > 128) byte += 2;
				else byte+= 1;
				
				if(byte > 30) return inputString.substring(0,idx);
			}
			return str;
		},

		checkByte: function(text) {
			var totalByte = 0;
			var message = text;
			for (var i = 0; i < message.length; i++) {
				var currentByte = message.charCodeAt(i);
				if (currentByte > 128) totalByte += 2;
				else totalByte++;
			}
			return totalByte;
		},

		getAttaches: function() {
			var attaches = [];

			$.each(this.$el.find("ul.img_wrap li"), function(index, data) {
				var $el = $(data);

				attaches.push({
					id: $el.attr("data-id"),
					name: $el.attr("data-name"),
					path: $el.attr("data-path"),
					hostId: $el.attr("host-id")
				})
			});

			return attaches;
		},

		sendMessage: function() {

			var self = this;

			var messageContent = $("#messageContent").val();
			var receiverTr = $("table.address_list>tbody>tr.receiver_item");

			if (messageContent.length == 0) {
				$.goMessage(smsLang["메시지를 작성해주세요."]);
				return;
			}

			if (receiverTr.length == 0) {
				$.goMessage(smsLang["수신자가 없습니다."]);
				return;
			}

			var model = new MessageModel();

			var receiverList = []; // 직접 입력 또는 주소록 개인 수신자 정보			
			var contactGroupReceivers = []; //주소록 그룹으로 선택된 수신자 정보.
			
			var circleReceiver = null; // 조직도에서 선택된 수신자 정보
			var circleNodeModels = [];						
			
			var attaches = self.getAttaches();
			
			if (attaches.length > 1) {
				$.goMessage(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", 1));
				return false;
			}

			var mesasgeCount = this.checkByte(messageContent);
			if (attaches.length > 0) {
				this.messageType = "MMS"
			} else if (mesasgeCount > 90) {
				this.messageType = "LMS";
			} else {
				this.messageType = "SMS";
			}

			$.goConfirm(smsLang['문자 발송'], smsLang['문자를 발송하시겠습니까?'], function() {
				$.each(receiverTr, function(k, v) {
					var type = $(v).attr('data-type');
					if(type == 'department' || type == 'subdepartment') {
						circleNodeModels.push({
							nodeId : $(v).attr('data-id'),
							nodeType : $(v).attr('data-type'),
							nodeDeptName : $(v).attr('data-name')
						});
						
					} else if(type == 'group') {
						contactGroupReceivers.push($(v).attr('data-id'));
					} else {
						receiverList.push({
							receiverName: $(v).attr('data-name'),
							receiverNumber: $(v).attr('data-number'),
						});						
					}
				});
				
				var senderNumber = $("#select_number option:selected").val(),
					selectRepNumberId = $("#select_number option:selected").attr('data-id');

				var subject = $("#subject").val();
				
				model.set({
					messageType : self.messageType,
					subject : subject,
					content : messageContent,
					receivers : receiverList,
					contactGroupReceivers : contactGroupReceivers,
					circleReceiver : {nodes : circleNodeModels},
					attaches : attaches,
					senderNumber : senderNumber
				});

				model.save({}, {
					type: 'POST',
					success: function(model, response) {
						if (response.code == '200') {
							$.goMessage(commonLang["성공했습니다."]);
							GO.util.store.set(storeKey, selectRepNumberId);
							App.router.navigate("sms/" + model.toJSON().id + "/detail", true);
						}
					},
					error: function(model, response) {
						var result = JSON.parse(response.responseText);
						$.goMessage(result.message);
					}
				});
			});
		}

	});

	return SendView;
});
