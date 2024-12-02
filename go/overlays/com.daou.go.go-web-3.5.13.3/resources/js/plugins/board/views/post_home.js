// 게시판 글 목록 HOME
;(function() {
	define([
        "jquery", 
        "backbone", 
        "app", 
        
        "board/models/board_config", 
        "board/models/board_favorite", 
        "community/models/info",
        
        "board/views/board_title", 
        "board/views/post_stream", 
        "board/views/post_bbs", 
        "board/views/post_bbs_detail", 
        
        "hgn!board/templates/post_home", 
        "hgn!board/templates/board_info", 
        "hgn!board/templates/board_owners", 
        "hgn!board/templates/board_subscribers"
        , 
        "i18n!board/nls/board", 
        "i18n!nls/commons", 
        
        "jquery.go-popup", 
        "jquery.go-orgslide", 
        "jquery.go-sdk"
    ],
    
    function(
        $, 
        Backbone, 
        App, 
        
        BoardConfig, 
        BoardFavoriteModel, 
        InfoModel,
        
        BoardTitleView, 
        PostStream, 
        PostBbs,
        PostBbsDetail,
        
        TplPostHome, 
        TplBoardInfo, 
        TplBoardOwners,
        TplBoardSubscribers, 
        
        boardLang, 
        commonLang
    ) {
		
		var instance = null,
			lang = {
				'open' : commonLang['열기'],
				'close' : commonLang['닫기'],
				'copy' : commonLang['복사'], 
				'edit' : commonLang['편집'],
				'delete' : commonLang['삭제'],
				'member_count' : commonLang['명'],
				'confirm' : commonLang['확인'],
				'user_name' : commonLang['이름'],
				'manager' : boardLang['운영자'],
				'board_address' : boardLang['게시판 주소'],		
				'user_email' : commonLang['이메일'],
				'email_admin_name' : boardLang['등록자'],
				'email_subscriber_name' : boardLang['수신자'],
				'email_subscriber' : boardLang['이메일 수신자'],
				'email_subscription' : boardLang['이메일 수신'],
				'email_subscriber_null' : boardLang['등록된 이메일 수신자가 없습니다.'],
				'email_subscriber_select' : boardLang['이메일 수신자 선택'],
				'email_subscriber_delete_msg' : boardLang['삭제할 수신자를 선택하세요.'],
				'add' : boardLang['추가하기'], 
				'board_share_state' : boardLang['공개/공유 현황 보기'],
				'community_share_state' : boardLang['공개 현황 보기'],
				'board_share_state_tiny' : boardLang['공개/공유 현황'],
				'community_share_state_tiny' : boardLang['공개 현황'],
				'onwer_target' : boardLang['공개/공유 대상'],
				'community_onwer_target' : boardLang['공개 대상'],
				'board_share_desc' : boardLang['공개/공유 설명'],
				'community_share_desc' : boardLang['공개 설명'],
				'dept_name' : boardLang['부서명'],
				'dept_share_flag' : boardLang['부서공개여부'],
				'write_permission' : boardLang['작성권한'],
				'board_member' : boardLang['멤버확인'],
				'board_urltoclip_ie' : boardLang['게시판주소복사IE'],
				'board_urltoclip_etc' : boardLang['게시판주소복사ETC'],
				'board_url_copy': boardLang['모바일 URL 복사 문구'],
				'email_subscription_post' : commonLang['신청하기'],
				'email_subscription_delete' : commonLang['해지하기'],
				'email_subscription2' : commonLang['수신중']
			};
			
		var PostHome = Backbone.View.extend({
			manage : false,
			initialize: function(options) {
				this.options = options || {};
				this.boardId = this.options.boardId;
				this.postId = this.options.postId;
				this.refresh = this.options.refresh || false;
				this.model = BoardConfig.get(this.boardId, this.refresh);
				this.mailExposure = GO.config('mailExposure');
				/**
				 * eventEmitter 사용 금지. this.$el 에 바인딩 하는 형태로 바꾸자.
				 */
				GO.EventEmitter.on('board', 'change:boardInfo', this.changeBoardInfo, this);
				/**
				 * eventEmitter 와는 동작 방식이 다르기 때문에 event key 와 함수명을 다르게 사용하자.
				 */
				this.$el.on('boardInfo:change', $.proxy(this.boardInfoChange, this));
			},
			
			events : {
				'click ul.simple_info span#copyUrl' : 'urlToClipboard',
				'click #boardInfoBtn' : 'setTitleExpander',
				'click span#btnSubscriberAdd' : 'actionSubscriberAdd',
				'click span#btnSubscriptionUser' : 'actionSubscriptionUser',
				'click span#btnSubscriberCount' : 'showSubscribers',
				'click span#btnOwners' : 'showOwners',
				'mouseover span#btnSubscriptionUser' : 'subscribersPlaceHolderIn',
				'mouseout span#btnSubscriptionUser' : 'subscribersPlaceHolderOut'
			},
			
			render: function() {
				this.actions = this.model.get('actions');
				this.masterOwner = this._getMasterOwner();
				
				this.$el.html(TplPostHome);
				
				this.renderBoardTitle();
				this.renderBoardInfo(!this.getFolderStatus());
				this.renderContents();
				
				this.refresh = false;
				
				/*var infoArea = this.$el.find('ul.detail_info'),
	            	folderStatus = this.getFolderStatus();
				infoArea.toggle(!folderStatus);
				
				if(!folderStatus) {
					this.$el.find("span.boardInfoBtn").removeClass('ic_close').addClass('ic_open').attr('title', lang['open']);
				}else{
					this.$el.find("span.boardInfoBtn").removeClass('ic_open').addClass('ic_close').attr('title', lang['close']);
				}*/
				
				return this.el;
			},
			
			
			popupRender : function(){
				this.actions = this.model.get('actions');
				this.masterOwner = this._getMasterOwner();
				this.refresh = false;
				
				var option = {
					boardId : this.boardId, 
					owner : this.masterOwner,
					isCommunity : this._isCommunity(),
					commentFlag : this.model.get('commentFlag'),
					sendMailFlag : this.model.get('sendMailFlag'),
					postId : this.postId
				};
				
				PostBbsDetail.popupRender(option);
				return this.el;
			},
			
			changeBoardInfo : function(boardId){
				if(boardId && boardId != this.boardId) return false;
				this.model = BoardConfig.get(this.boardId, true);	
				this.renderBoardTitle();
				this.renderBoardInfo(!this.getFolderStatus());
			},
			
			boardInfoChange : function() {
				this.model = BoardConfig.get(this.boardId, true);	
				this.renderBoardTitle();
				this.renderBoardInfo(!this.getFolderStatus());
			},
			
			renderBoardTitle : function() {
				
				if (!this.favoriteModel) {
					this.favoriteModel = new BoardFavoriteModel({ boardId : this.boardId, id : this.boardId});
				} else {
					this.favoriteModel.clear();
					this.favoriteModel.set({ boardId : this.boardId, id : this.boardId}, {silent: true});
				}
				
				BoardTitleView.render({
					el : '.content_top',
					dataset : $.extend(this.model.toJSON(), {
						masterOwner : this.masterOwner
					}),
					favoriteModel : this.favoriteModel,
					isCommunity : this._isCommunity()
				});
			},
			
			renderBoardInfo: function(folderStatus) {
				var dataset = this.model.toJSON(),
				    options = {
	                    dataset : dataset,
	                    directUrl : this._getDirectBoardUrl(),
	                    isCommunity : this._isCommunity(),
	                    isCompany : this._isCompany(),
	                    lang : lang,
	                    isMember : this._isCommunity() ? this._isMember(this.masterOwner.ownerId) : true,
	                    isHideSubscrib : (dataset.status == "CLOSED" || dataset.deletedDept) ? true : false,
	                    folderStatus : folderStatus		
	                };
				
				
				dataset.description = GO.util.textToHtml(dataset.description);
				this.$el.find('.content_info_wrap').remove();
				this.$el.find('.content_top').after(TplBoardInfo(options));
			},
			_isCommunity : function() {
				return this.masterOwner && this.masterOwner.ownerType == 'Community' ? true : false;
			},
			_isCompany : function() {
				return this.masterOwner && this.masterOwner.ownerType == 'Company' ? true : false;
			},
			_isDepartment : function() {
				return this.masterOwner && this.masterOwner.ownerType == 'Department' ? true : false;
			},
			_getDirectBoardUrl : function() {
				var url = App.router.getRootUrl(),
					masterOwner = null;
				if(this._isCommunity()) {
					masterOwner = this.masterOwner;
					url += 'community/' + masterOwner.ownerId + '/board/'+this.boardId;
				} else {
					url += 'board/' + this.boardId;
				}
				return url;
			},
			_getMasterOwner : function() {
				var masterOwner = null;
				if(this.model.get('owners') == undefined){
					return;
				}
				$.each(this.model.get('owners'), function(k,v) {
					if(v.ownerShip == 'MASTER') masterOwner = v;
				});
				return masterOwner;
			},
			_getAdminUrl : function() {
				var masterOwner = this.masterOwner,
					url = 'board/'+this.boardId+'/admin';

				if(this._isCommunity()) url = 'community/'+ masterOwner.ownerId +'/board/'+ this.boardId +'/admin';	
				return url;
			},
			_isMember : function(communityId) {
				var infoModel = InfoModel.read({ communityId : communityId}).toJSON();
				var isMember = false;
				if(infoModel.memberStatus == "ONLINE" || !this._isCommunity()){
					isMember = true;
				}
				return isMember;
			},
			renderContents: function() {
				var isCommunity = this._isCommunity();
				var option = {
					boardId : this.boardId, 
					owner : this.masterOwner,
					isCommunity : isCommunity,
					commentFlag : this.model.get('commentFlag'),
					sendMailFlag : this.model.get('sendMailFlag')
				};
				
				// 클래식 게시물 상세.
				if(this.postId && this.model.isClassicType()) {
					option["postId"] = this.postId;
					PostBbsDetail.render(option);
				// 피드 목록
				} else if(this.model.isStreamType()) {
					option["writable"] = this.model.isActive() && this.model.get('actions').writable;
					PostStream.render(option);
				// 클래식 목록
				} else if(this.actions != undefined) {
					option["writable"] = this.actions.writable;
					option["manageable"] = this.actions.managable; 
					option["headerFlag"] = this.model.get('headerFlag');
					option["anonymFlag"] = this.model.get('anonymFlag');
					option["headerRequiredFlag"] = this.model.get('headerRequiredFlag');
					option["status"] = this.model.get('status');
					option["communityId"] = this.options.communityId;
					
					var postListView = new PostBbs(option);
					postListView.render();
				}
			},
			showOwners : function() {
				var self = this,
					isDepartment = this._isDepartment(),
					lowRankFlag = self.model.get('lowRankFlag');
					
				
				var popup = $.goPopup({
					pclass : 'layer_public_list layer_normal',
					header : isDepartment ? lang['board_share_state_tiny'] : lang['community_share_state_tiny'],
					contents : TplBoardOwners({ lang : lang, manageable : this.actions.managable, isDepartment : isDepartment }),
					width : 600,
					buttons: [{
						btype : 'confirm',
						btext : lang['confirm']
					}]
				});
				
				var ownerColumns = [
		            { mData : null, bSortable: false, fnRender: function(obj) {
		            	var ownerInfo = obj.aData.ownerInfo;
		            	if(isDepartment && lowRankFlag && obj.aData.ownerId == self.masterOwner.ownerId) {
		            		ownerInfo += '&nbsp;('+boardLang['하위 부서 포함']+')';
		            	}
		            	return ownerInfo;
		            }}
		        ];
				if(isDepartment) {
					ownerColumns.push(
		    	    { mData: 'scope', bSortable: false, sWidth : '100px', fnRender: function(obj) {
		    	    	var scopeText = obj.aData.scope == 'ALL' ? boardLang['전체공개'] : boardLang['일부만 공개'];
		    	    	return scopeText;
		    	    } });
				}
				ownerColumns.push({ mData: 'permission', sWidth : '100px', bSortable : false, fnRender: function(obj) {
	    	    	var permissionText  = 'O';
	    	    	if(obj.aData.permission == 1) permissionText = 'X';
	    	    	return permissionText;
	    	    } });
				if(isDepartment) {
					ownerColumns.push({ mData: null, sWidth : '70px', bSortable : false, fnRender: function(obj) {
		    	    	//if(obj.aData.ownerShip == 1) 
		    	    	var btn = '<a class="btn_fn7 owners_member" data-bypass data-ownerId="'+obj.aData.id+'">'+commonLang['보기']+'</a>';
		    	    	return btn;
		    	    } }); 
				}
				
				$.goGrid({
					el : '#boardOwners',
					url : GO.contextRoot + 'api/board/'+this.boardId+'/owners/'+ (isDepartment ? 'ALL' : 'JOINT'),
					displayLength : 5,
					displayLengthSelect : false,
					numbersShowPages : 5,
					method : 'GET',
					sDom : 'rt<"tool_bar"<"critical custom_bottom">p>',
					emptyMessage : isDepartment ? boardLang['공개/공유된 목록이 없습니다.'] : boardLang['전체공개 게시판입니다.'],
					columns : ownerColumns,
			        fnDrawCallback : function(oSettings) {
			        	popup.find('#btnOwnerEdit').appendTo(popup.find('.custom_bottom'));
			        	popup.reoffset();
			        }
				});
				
				
				popup.find('#btnOwnerEdit').click(function() {
					popup.close();
					App.router.navigate(self._getAdminUrl(), true);
				});
				popup.on('click', '.owners_member', function(e) {
					var btn = $(e.currentTarget),
						ownerId = btn.attr('data-ownerId');
					if(popup.find('#ownersMember'+ownerId).length) {
						var ownersMemberEl = popup.find('#ownersMember'+ownerId);
						var isVisible = ownersMemberEl.is(":visible");
						var label = isVisible ? commonLang["보기"] : commonLang["접기"];
						ownersMemberEl.toggle(!isVisible);
						$(this).text(label);
					} else {
						$(e.currentTarget).parents('tr').after('<tr id="ownersMember'+ownerId+'" class="detail_info"><td colspan="4">&nbsp;</td></tr>');
						$.go(GO.contextRoot + 'api/board/'+self.boardId+'/dept/owner/'+btn.attr('data-ownerId')+'/member', {}, { ///board/{boardId}/deptjoint/{ownerId}/member
							qryType : 'GET',
							contentType : 'application/json',
							responseFn : function(rs) {
								if(rs.code == 200) {
									var members = [];
									$.each(rs.data, function(k,v) {
										members.push('<li class="default_option">'+v.ownerInfo+'</li>');
									});		
									if(!members.length) members.push(boardLang['공개/공유된 멤버가 없습니다.']);
									popup.find('#ownersMember'+ownerId+'>td').html('<ul class="name_tag">'+members.join('')+'</ul>');
								}
							}
						});
						$(this).text(commonLang["접기"]);
					}
				});
				
			},
			showSubscribers : function() {
				var self = this,
					columns = null,
					managable = this.actions.managable || false;
				
				var popup = $.goPopup({
					width : 750,
					header : lang['email_subscriber'],
					buttons : [{
						btype : 'confirm',
						btext : lang['confirm']
					}]
				});
				popup.find('.content').html(TplBoardSubscribers({ 
					lang : lang,
					managable : managable,
					mailExposure : this.mailExposure
				}));
				
				columns = [
				    {"mData" : null,"sWidth": "150px","bSortable": false, "fnRender" : function(obj) {
				    	var departmentName = obj.aData.subscriber.departmentNames || ['-'];
				    	return departmentName.join(', ');
				    } },
		    	    { "mData": null,"bSortable": false, "sWidth" : "100px", "fnRender" : function(obj) {
		    	    	return obj.aData.subscriber.name + ' ' + obj.aData.subscriber.positionName;
		    	    }}
		        ];
		        
		        if(this.mailExposure) {
					columns.push(
						{ "mData": "subscriber.email", "bSortable": false }
					);
				}
				columns.push(
					{ "mData": "updatedAt", "sWidth": "200px", "fnRender" : function(obj) {
						return obj.aData.manager.name + ' ' +GO.util.basicDate(obj.aData.updatedAt);
					}}
				);
		        
				if(managable) {
					columns.push(
						{ "mData": null , "sWidth": "70px", "bSortable" : false , "fnRender" : function(obj) {
							return '<span class="btn_bdr btn_subscriber_delete" data-deleteid="'+obj.aData.subscriber.id+'"><span class="ic_classic ic_basket" title="'+lang['delete']+'"></span></span>';
						}} 
					);
				} else {
					columns.push({ 
						 "mData": null , "sWidth": "70px", "bSortable" : false , "fnRender" : function(obj) {
							 if(obj.aData.subscriber.id == GO.session('id') || obj.aData.manager.id == GO.session('id')) {
								 return '<span class="btn_bdr btn_subscriber_delete" data-deleteid="'+obj.aData.subscriber.id+'"><span class="ic_classic ic_basket" title="'+lang['delete']+'"></span></span>';
							 } else {
								 return '&nbsp;';
							 }
						} 
					});
				}
				var subscriberGrid = $.goGrid({
					el : '#boardSubscribers',
					url : GO.contextRoot + 'api/board/'+this.boardId+'/subscriber',
					checkbox : managable,
					displayLength : 5,
					displayLengthSelect : false,
					emptyMessage : lang['email_subscriber_null'],
					numbersShowPages : 5,
					checkboxData : 'id',
					method : 'GET',
					defaultSorting : managable ? [[4,'desc']] : [[3,'desc']],
					sDom : 'rt<"tool_bar"<"critical custom_bottom">p>',
					columns : columns,
			        fnDrawCallback : function(oSettings) {
			        	popup.find('#btnSubscritersDeleteAll').appendTo(popup.find('.custom_bottom'));
			        	popup.find('.btn_subscriber_delete').bind('click', function(e) {
							if(confirm(boardLang['선택된 이메일 수신자를 삭제 하시겠습니까?'])) {
								var checkedId = $(e.currentTarget).attr('data-deleteid');
								self.actionSubscriberDelete([checkedId]);
							} 
							return;
						});
			        	popup.reoffset();
			        }
				});	
				
				if(managable) {
					popup.find('#btnSubscritersDeleteAll').bind('click', function() {
						var checkedIds = [],
							checkedData = subscriberGrid.tables.getCheckedData() || [];
						
						checkedIds = $(checkedData).map(function(k,v) {
							return v.subscriber.id;
						}).get();
						if(checkedIds.length && confirm(boardLang['선택된 이메일 수신자를 삭제 하시겠습니까?'])) {
							self.actionSubscriberDelete(checkedIds);
						} else {
							$.goMessage(lang['email_subscriber_delete_msg']);
						} 
					});
				}
			},
			actionSubscriberDelete : function(subscriberIds) {
				var url = [GO.contextRoot+'api/board', this.boardId, 'subscriber'];
				var _this = this;
				$.go(url.join('/'), JSON.stringify({'ids' : subscriberIds}) , {							
					qryType : 'DELETE',
					contentType : 'application/json',
					responseFn : function(rs) {
						if(rs.code == '200') {
							if($('#boardSubscribers').length) {
								$('#boardSubscribers').dataTable().fnClearTable();
							}
							_this.changeBoardInfo();
						}
					}
				});
			},
			
			subscribersPlaceHolderIn : function(e){
			    if(this.model.get('subscriptionFlag') ) {
			        var targetEl = $(e.currentTarget);
			        targetEl.find("span.ic_con").show();
			        targetEl.find("span.txt").text(lang.email_subscription_delete);
			    }
			},
			
			subscribersPlaceHolderOut : function(e){
                if(this.model.get('subscriptionFlag') ) {
                    var targetEl = $(e.currentTarget);
                    targetEl.find("span.ic_con").hide();
                    targetEl.find("span.txt").text(lang.email_subscription2);
                }
			},
			
			actionSubscriptionUser : function() {			
				var _this = this,
					url = [GO.contextRoot+'api/board',this.boardId,'subscriber', GO.session('id')];
				
				if(this.model.get('subscriptionFlag') ) {
					this.actionSubscriberDelete([GO.session('id')]);
				} else {
					$.go(url.join('/'), {}, {
						contentType : 'application/json',
						qryType : this.model.get('subscriptionFlag') ? 'DELETE' : 'POST',
						responseFn : function(rs) {
							_this.changeBoardInfo();
						},
						error : function(rs) {
							var rsObj = JSON.parse(rs.responseText);
							if(rsObj.message) $.goMessage(rsObj.message);
						}
					});
				}
			},
			actionSubscriberAdd : function() {
				var self = this;
				var callback = function(rs) {
					if(rs.type == "org"){
						return;
					}
					var url = [GO.contextRoot+'api/board',self.boardId,'subscriber', rs.id];
					$.go(url.join('/'), {}, {
						contentType : 'application/json',
						responseFn : function(rs) {
							if(rs.code == 200) {
								self.$el.find('#btnSubscriberCount').html(rs.data.subscriberCount);
								self.model.set({ subscriberCount : rs.data.subscriberCount}, {silent: true});
							} else {
								if(rs.message) $.goMessage(rs.message);
							}
						},
						error : function(rs) {
							var rsObj = JSON.parse(rs.responseText);
							if(rsObj.message) $.goMessage(rsObj.message);
						}
					});
				};

				$.goOrgSlide({
					header : lang['email_subscriber_select'],
					desc : '',
					callback : callback,
					contextRoot : GO.contextRoot
				});
			},
			urlToClipboard : function() {

				var copyUrl = this.$el.find('span.txt_url').html();
				var agt=navigator.userAgent.toLowerCase();
			    if(agt.indexOf("msie") != -1){
			    	window.clipboardData.setData('Text',copyUrl);
					$.goMessage(lang['board_url_copy']);
			    }else{
			    	var tempElement = document.createElement('textarea');
					document.body.appendChild(tempElement);
					tempElement.value = copyUrl;
					tempElement.select();
					document.execCommand('copy');
					document.body.removeChild(tempElement);
					$.goMessage(lang['board_url_copy']);
			    }
			},
			setTitleExpander : function(e) {
				var btnExpander = $(e.target);
				var infoArea = this.$el.find('ul.detail_info'),
					isHide = infoArea.is(":visible"),
					folderStatusKey = "postInfo_" + GO.session('id') + "_" + this.model.id;

				if(btnExpander.hasClass('ic_open')) {
					btnExpander.removeClass('ic_open').addClass('ic_close').attr('title', lang['close']);
				} else {
					btnExpander.removeClass('ic_close').addClass('ic_open').attr('title', lang['open']);
				}
				
				infoArea.toggle(!isHide);
				GO.util.store.set(folderStatusKey, isHide, {type : "local"});
				
			},
			getFolderStatus : function() {
				var folderStatusKey = "postInfo_" + GO.session('id') + "_" + this.model.id;
				return GO.util.store.get(folderStatusKey) || false;
			}
			
		});
		
		return PostHome;
	});
	
}).call(this);
