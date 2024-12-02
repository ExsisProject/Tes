define('sms/views/detail', function(require) {

	var commonLang = require("i18n!nls/commons");
	var smsLang = require("i18n!sms/nls/sms");
	
	var BaseSmsView = require("sms/views/base_sms");
	
	var detailTmpl = require("hgn!sms/templates/detail");
	var receiverTmpl = require("hgn!sms/templates/receiver");
	
	var smsInfo = require("sms/models/sms_info");
	var receivers = require("sms/collections/sms_receivers");
	
	var PaginationView = require("views/pagination");
	var ProfileView = require("views/profile_card");
	var AttachFilesView = require("attach_file");
	
	var lang = {
		삭제 : commonLang["삭제"],
		분류 : smsLang["분류"],
		발신번호 : smsLang["발신번호"],
		포토 : smsLang["포토"],
		수신자목록 : smsLang["수신자 목록"],
		명 : commonLang["명"],
		수신자가없습니다 : smsLang["수신자가 없습니다."]
	};
	
	/**
	 * 문자발송 상세 내역 뷰
	 */

	var DetailView = BaseSmsView.extend({
		
		events : {
		},
			
		initialize : function(options) {
			BaseSmsView.prototype.initialize.apply(this, arguments);
			this.smsMessageId = options.smsMessageId;
			this.smsInfo = new smsInfo({id: this.smsMessageId});
			this.collection = new receivers();
			this.collection.setAttributes({
				smsMessageId : this.smsMessageId,
				pageSize : 10
			});
			this.collection.bind('sync', this.renderReceivers, this);
		},
		
		
		render : function() {			
			
			BaseSmsView.prototype.render.apply(this, arguments);
			$("div .content_page").addClass("content_message send_message");
			var self = this;
			this.smsInfo.fetch({
				statusCode: {
					400 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
					403 : function() { GO.util.error('403', { "msgCode": "400-common"}); }, 
					404 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
					500 : function() { GO.util.error('500'); }
				},
				success : function(smsMessage) {
					
					self.$el.html(detailTmpl({
						lang : lang,
						senderId : smsMessage.getSenderId(),
						isSender : (GO.session().id == smsMessage.getSenderId()) ? true : false,
						senderName : smsMessage.getSenderNameWithPosition(),
						senderNumber : smsMessage.getSenderNumber(),
						senderDeptName : smsMessage.getSenderDeptName(),
						senderThumbnail : smsMessage.getSenderThumbnail(),
						sendDate : smsMessage.getSendDate(),
						subject : smsMessage.getSubject(),
						content : smsMessage.getContent(),
						type : smsMessage.getType(),
						hasAttaches : smsMessage.hasAttaches(),
						count : smsMessage.getReceiversCount(),
					}));
					
					if(smsMessage.hasAttaches()){
						AttachFilesView.create('#attach-placeholder', smsMessage.get("attaches"), function(item) {
		                    return GO.config('contextRoot') + 'api/sms/' + self.options.smsMessageId + '/download/' + item.id;
		                });
					}
					
					self.$el.find('a[data-action=remove]').click(function(e) {
						var smsMessageId = self.smsMessageId;
						$.goConfirm(smsLang["문자 삭제"], smsLang["문자삭제질문"], 
		                    function() {
		                        self.smsInfo.destroy({
		                            success : function(){
		                                var url = "sms";
		                                GO.router.navigate(url, {trigger: true});
		                            }
	                        })
	                    });
					});
					self.$el.find('a[data-userid]').click(function(e) {
						var userId = $(e.currentTarget).attr('data-userid');
						if(userId != ""){
							ProfileView.render(userId, e.currentTarget);
						}
					});
					
					self.collection.fetch({
		                statusCode: {
		                	400 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
							403 : function() { GO.util.error('403', { "msgCode": "400-common"}); }, 
							404 : function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
							500 : function() { GO.util.error('500'); }
		                },
		                success : function(){
		                	self.renderReceivers();
		                }
		            });
				}
			});
			
			return this;
		},
		
		renderReceivers : function(){
			this.$el.find(".address_list").html(receiverTmpl({
				lang : lang,
				collection : this._parseCollection(),
				
			}));
        	
			this._renderPageView();
			this._markHeader();
			
			this.$el.find(".paging_full_numbers").css("padding-top", "");
        },
		
		_parseCollection : function() {
			var clone = _.clone(this.collection);
			return _.map(clone.models, function(receiver) {
				var parsedReceiver = {
					resultMessage : receiver.getResultMessage(),
					makeReceiverName : receiver.getReceiverName(),
					isFail : receiver.isFail(),
					statusText : receiver.getStatusText()
				}; 
				return _.extend(parsedReceiver, receiver.toJSON());
			});
		},
		
		/**
		 * 페이징뷰 렌더링
		 */
		_renderPageView: function() {
			if (this.pageView) this.pageView.remove();
			this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
			this.pageView.bind("paging", this._selectPage, this);
			this.$("#paginateArea").append(this.pageView.render().el);
		},
		
		/**
		 * 페이지 선택
		 * @param {Number} 페이지
		 */
		_selectPage : function(page) {
			this.collection.setPageNo(page);
			this.collection.fetch();
		},
		
		/**
		 * 페이지 사이즈 선택
		 * @param {Number} 페이지사이즈
		 */
		_selectPageSize: function(pageSize) {
			this.collection.setPageSize(pageSize);
			this.collection.fetch();
		},
		
		/**
		 * collection 의 direction 과 property 값에 맞는 스타일 지정 
		 */
		_markHeader : function() {
			var target = this.$("th[data-property='" + this.collection.property + "']");
			target.attr("data-direction", this.collection.direction);
			target.removeClass();
			target.addClass("sorting_" + this.collection.direction);
		}
		
	});	
	return DetailView;
});