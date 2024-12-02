//게시판 글 목록 HOME
(function() {
	define([
	        "jquery",
	        "backbone", 	
	        "app",
	        "hgn!community/templates/master_update",
	        "community/models/update",
	        "community/views/side_members",
	        "community/views/side2",
	        "community/models/info",
	        "i18n!nls/commons",
	        "i18n!community/nls/community",
	        "jquery.go-validation"
	        ], 
	        function(
	        		$,
	        		Backbone,
	        		App,
	        		tplCommunityMasterUpdate,
	        		communityUpdateModel,
	        		sideMembers,
	        		side2,
	        		infoModel,
	        		commonLang,
	        		communityLang
	        ) {
		
		var tplVar = {
	        	'common_save': commonLang['저장'],
				'common_cancel': commonLang['취소'],
				'community_name': commonLang['이름'],            
				'community_desc': communityLang['소개'],
	            'community_master' : communityLang['마스터'],
	            'community_manager' : communityLang['부마스터'],
	            'community_add' : commonLang['추가'],
	            'community_modify' : commonLang['변경'],
	            'community_share' : communityLang['공유'],
	            'community_public' : communityLang['공개'],
	            'community_private' : commonLang['비공개'],
	            'community_publicflag' : communityLang['공개여부'],
	            'delete' : commonLang['삭제']
	        };
		
		var CommunityAdminInfo = Backbone.View.extend({

			manage : false,
			
			unbindEvent: function() {
				this.$el.off("click", "#btnCancel");
				this.$el.off("click", "#btnSave");
			}, 
			
			bindEvent: function() {
				this.$el.on("click", "#btnSave", $.proxy(this.communityUpdate, this));
				this.$el.on("click", "#btnCancel", $.proxy(this.updateCancel, this));
			}, 
			
			
			initialize: function(options) {
				this.options = options || {};
				this.unbindEvent();
				this.bindEvent();
				this.communityId = this.options.communityId;
				this.model = new communityUpdateModel();
			},

			render: function() {
				this.$el.empty();
				
				var model = infoModel.read({ communityId : this.communityId}).toJSON();
				if(!(model.memberType == "MASTER" || model.memberType == "MODERATOR") ) {
					App.router.navigate('community/'+this.communityId, {trigger: true, pushState:true});
					$.goAlert(communityLang["접근 할 수 없는 메뉴입니다."], communityLang["마스터, 부마스터 권한이 필요합니다."]);
				}
				
				var result = this.model.read({ communityId : this.communityId}).toJSON();
				this.$el.html(tplCommunityMasterUpdate({
					model : result,
					isMaster : function() {
						var hasMaster = result.masters.length > 0 ? true : false;
						return hasMaster && GO.session().id == result.masters[0].userId;
					},
					lang : tplVar
				}));

				if(result.description == "") {
					$("#modifyDesc").text(communityLang["커뮤니티 설명을 입력해주세요"]);
				}
			},
			
			communityUpdate : function(e) {
				var communityId = $('#content').find('.tab_menu').attr('data-id');
				var self = this,
				form = this.$el.find('form[name=formUpdateCommunity]'),
				managerIds = [],
				communityNameEl = form.find('input[name="name"]'),
				communityDescriptionEl = form.find('[name="description"]');
				
				
				this.model = new communityUpdateModel();
								
				$.each(form.serializeArray(), function(k,v) {
					if(v.name == 'managerId') {
						managerIds.push(v.value);
					} else {
						self.model.set(v.name, v.value, {silent: true});
					}
				});
				
				var invalidAction = function(msg, focusEl) {
					$.goMessage(msg);
					if(focusEl) focusEl.focus().addClass('error');
					return false;
				};
				
				
				if(!$.goValidation.isCheckLength(2, 32, this.model.get('name'))) {
					invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"32"}), communityNameEl);
					return false;
				}
				
				if(!$.goValidation.isCheckLength(0, 124, this.model.get('description'))) {
					invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"124"}), communityDescriptionEl);
					return false;
				}
				
				
				this.model.set({ 
					'id' : communityId,
					'managerIds' : managerIds
				},{ silent : true });
				
				this.model.save({},{
					success : function(model, response) {
						if(response.code == '200') {
							sideMembers.render(communityId);
							self.render();
							var side2Model = new side2();
		                	side2Model.render(communityId);
							$("#sideNav").empty();
							side2Model.renderInfo(communityId);
							$("#title").text(response.data.name);
							$.goMessage(commonLang["저장되었습니다."]);
						}
					},
					error : function(model, response) {
                        if(response.msg) {
                            $.goAlert(response.msg);
                        } else if (response.responseJSON && response.responseJSON.message) {
                            $.goAlert(response.responseJSON.message);
                        }

                        if(response.focus) {
                            form.find('input[name="'+response.focus+'"]').focus();
                        }
					}
				});
			},
			
			updateCancel: function() {
				var self = this;
				$.goConfirm(commonLang['취소하시겠습니까?'], commonLang['입력하신 정보가 초기화됩니다.'], function() {
					self.render();
				});
			},
			
			
		});

		return {
			render: function(communityId) {
				var communityAdminInfo = new CommunityAdminInfo({el : '.tab_conent_wrap', communityId : communityId });
				return communityAdminInfo.render();				
			}
		};
	});

}).call(this);