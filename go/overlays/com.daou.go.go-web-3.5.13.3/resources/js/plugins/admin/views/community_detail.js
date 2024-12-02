define([
	"jquery",
	"backbone", 	
	"app",
    "hgn!admin/templates/community_detail",
    "hgn!admin/templates/community_members",
    "hgn!admin/templates/community_boards",
    "admin/models/base_model",
    "admin/collections/community_members",
    "admin/collections/community_boards",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-popup",
    "jquery.go-sdk",
    "jquery.go-grid",
    "GO.util"
], 

function(
	$, 
	Backbone,
	App,
	communityDetailTmpl,
	communityMembersTmpl,
	communityBoardsTmpl,
	communityDetailModel,
	communityMembersCollection,
	communityBoardsCollection,
	commonLang,
	adminLang
) {
	var instance = null;
	var tmplVal = {
			label_name : commonLang["제목"],
			label_type : adminLang["유형"],
			label_master : adminLang["게시판 운영자"],
			label_postcount : adminLang["게시물 수(개)"],
			label_usedata : adminLang["사용량(MB)"],
			label_title : adminLang["기본정보"],
			label_name : adminLang["커뮤니티 명"],
			label_delete : adminLang["커뮤니티 삭제"],
			label_status : adminLang["상태"],
			label_online : adminLang["정상"],
			label_stop : adminLang["중지"],
			label_wait : adminLang["개설대기"],
			label_desc : adminLang["커뮤니티 소개"],
			label_created : adminLang["생성일"],
			label_pds : adminLang["커뮤니티 자료"],
			label_count : adminLang["개"],
			label_board : commonLang["게시판"],
			label_post : adminLang["게시물"],
			label_size : adminLang["사용량"],
			label_mb : adminLang["MB"],
			label_ok : commonLang["확인"],
			label_save : commonLang["저장"],
			label_cancel : commonLang["취소"],
			label_back : adminLang["목록으로 돌아가기"],
			label_csv : adminLang["목록 다운로드"],
			label_email : commonLang["이메일"],
			label_last : adminLang["최종 접속"],
			label_membertype : adminLang["멤버타입"],
			label_name2 : adminLang["이름(직위)"],			
			label_community_member : adminLang["커뮤니티 멤버"],
			label_community_board : adminLang["커뮤니티 게시판"],
			BBS : adminLang["클래식"],
			CLASSIC : adminLang["클래식"],
			STREAM : adminLang["피드"],
			MASTER : adminLang["마스터"],
			MODERATOR: adminLang["부마스터"],
			USER : adminLang["멤버"],
			label_non_board: adminLang["등록된 게시판이 없습니다."]
	};
	var CommunityDetail = Backbone.View.extend({
		el : '#layoutContent',
		events:{
			
		},
		unbindEvent: function() {
			this.$el.off("click", "#detail_save");
			this.$el.off("click", "#detail_cancel");
			this.$el.off("click", "#back_community");
			this.$el.off("click", "#community_remove");
			this.$el.off("click", "#community_member");
			this.$el.off("click", "#community_board");
			this.$el.off("click", ".memberType");
			this.$el.off("click", ".ic_edit_done");
			this.$el.off("click", ".ic_edit_cancel");
			this.$el.off("click", "span#btn_down_members");
			this.$el.off("click", "span#btn_down_boards");
		}, 
		bindEvent : function() {
			this.$el.on("click", "#detail_save", $.proxy(this.detailSave, this));
			this.$el.on("click", "#detail_cancel", $.proxy(this.detailCancel, this));
			this.$el.on("click", "#back_community", $.proxy(this.backCommunityAll, this));
			this.$el.on("click", "#community_remove", $.proxy(this.communityRemove, this));
			this.$el.on("click", "#community_member", $.proxy(this.getCommunityMember, this));
			this.$el.on("click", "#community_board", $.proxy(this.getCommunityBoard, this));
			this.$el.on("click", ".memberType", $.proxy(this.setMemberType, this));
			this.$el.on("click", ".ic_edit_done", $.proxy(this.saveMemberType, this));
			this.$el.on("click", ".ic_edit_cancel", $.proxy(this.cancelMemberType, this));
			this.$el.on("click", "span#btn_down_members", $.proxy(this.csvDownloadCommunityMembers, this));
			this.$el.on("click", "span#btn_down_boards", $.proxy(this.csvDownloadCommunityBoards, this));
		},
		initialize: function() {
			this.unbindEvent();
			this.bindEvent();
			this.communityId = this.options.communityId;
		},
		render : function() {
			
			this.$el.empty();
			this.renderInfo(this.communityId);
			this.getCommunityMember(this.communityId);
			$("#community_member").addClass("active");
		},
		csvDownloadCommunityMembers : function() {
			var communityId = this.$el.find('#community_name').attr('data-id');
			GO.util.downloadCsvFile("ad/api/community/"+ communityId +"/member/download");
		},
		csvDownloadCommunityBoards : function() {
			var communityId = this.$el.find('#community_name').attr('data-id');
			GO.util.downloadCsvFile("ad/api/community/"+ communityId +"/statistic/boards/download");
		},
		renderInfo : function(communityId) {
			this.model = new communityDetailModel({
				urlRoot : GO.contextRoot + "ad/api/community",
				id : communityId
			});
			this.model.fetch({
				async : false
			});
			var dataset = this.model.toJSON();
			this.$el.html( communityDetailTmpl({
				lang : tmplVal,
				model : dataset,
				createdAt : GO.util.shortDate(dataset.createdAt),
				totalSize : function() {
					return GO.util.byteToMega(dataset.totalSize);
				},
				isCommunityStatusOnline : function() {
					if(this.model.status == "ONLINE") {
						return true;
					} else {
						return false;
					}
				},
				
				isCommunityStatusStop : function() {
					if(this.model.status == "STOP") {
						return true;
					} else {
						return false;
					}
				},
				
				isCommunityStatusWait : function() {
					if(this.model.status == "WAIT") {
						return true;
					} else {
						return false;
					}
				},
			}));
			
		},

		detailSave : function(e) {
			var communityIds = [];
			var publicFlag = $('input[name="communityStatus"]:radio:checked').val();
			var communityId = this.$el.find('#community_name').attr('data-id');
			communityIds.push(communityId);
			
			if(publicFlag == "STOP") {
				$.goCaution(adminLang["중지하시겠습니까?"], adminLang["커뮤니티를 중지상태에서는..."], function() {
					$.go(GO.contextRoot+'ad/api/community/status/stop', JSON.stringify({communityIds: communityIds}), {
						qryType : 'PUT',					
						contentType : 'application/json',
						responseFn : function(response) {
							if(response.code == 200){
								$.goMessage(commonLang["저장되었습니다."]);
							}else{
								$.goAlert(commonLang["실패"],commonLang["실패하였습니다."]);
							}
						}
					});
				}, adminLang["중지"]);
				
			} else {
				$.go(GO.contextRoot+'ad/api/community/status/online', JSON.stringify({communityIds: communityIds}), {
					qryType : 'PUT',					
					contentType : 'application/json',
					responseFn : function(response) {
						if(response.code == 200){
							$.goMessage(commonLang["저장되었습니다."]);
						}else{
							$.goAlert(commonLang["실패"],commonLang["실패하였습니다."]);
						}
					}
				});
			} 
		},
		
		detailCancel : function() {
			var communityId = this.$el.find('#community_name').attr('data-id');
			this.render(communityId);
			$.goMessage(commonLang["취소되었습니다."]);
			
		},
		
		backCommunityAll : function(communityId) {
			App.router.navigate('community/all', {trigger: true});
		},
		
		communityRemove : function(e) {
			var communityId = this.$el.find('#community_name').attr('data-id');
			$.goCaution(adminLang["정말 삭제하시겠습니까?"], adminLang["커뮤니티를 삭제하면..."], function() {
				$.go(GO.contextRoot+'ad/api/community/' + communityId + '/remove', JSON.stringify(), {
					qryType : 'DELETE',					
					contentType : 'application/json',
					responseFn : function(response) {
						if(response.code == 200){
							App.router.navigate('community/all', {trigger: true});
						}else{
							$.goAlert(commonLang["실패"],commonLang["실패하였습니다."]);
						}
					}
				});
				
			});
		},
		
		getCommunityMember : function(e) {
			this.$el.find("#member_content_page").remove();
			var selectedEl = $(e.currentTarget);
			this.$el.find('.active').removeClass('active');
			selectedEl.addClass('active');
			var communityId = this.$el.find('#community_name').attr('data-id');
			this.collection = communityMembersCollection.getCollection(communityId);
			
			var dataset = this.collection.toJSON() || [];
			
			dataset = _.filter(dataset, function(data){
				return data.memberStatus == "ONLINE";
			});
			
			var memberType = function() {
				return tmplVal[this.memberType];
			};
			
			var createdAt = function() {
				return GO.util.basicDate(this.createdAt);
			};
			
			var tmpl = communityMembersTmpl({
				dataset : dataset,
				isDataset : dataset.length ? true : false,
				lang : tmplVal,
				memberTypeName : memberType,
				createdAtTime : createdAt,
				memberPosition : function() {
					if(this.position != ''){
						return '(' + this.position + ')';
					}
				}
			});
			this.$el.append(tmpl);
		},
		
		getCommunityBoard : function(e) {
			this.$el.find("#member_content_page").remove();
			var selectedEl = $(e.currentTarget);
			this.$el.find('.active').removeClass('active');
			selectedEl.addClass('active');
			var communityId = this.$el.find('#community_name').attr('data-id');
			this.collection = communityBoardsCollection.getCollection(communityId);
			
			var boardType = function() {
				return tmplVal[this.type+""];
			};
			
			var dataset = this.collection.toJSON() || [];
			var tmpl = communityBoardsTmpl({
				dataset : dataset,
				boardTotalSize : function(){
					return GO.util.byteToMega(this.totalSize);
				},
				isDataset : dataset.length ? true : false,
				boardTypeName:boardType,
				lang : tmplVal,
				masterNameAndPosition : function(){
					var managerNames = this.managerNames.toString();
					if (!managerNames) managerNames = "-";
					return managerNames.replace(/,/gi, '<br>');
				}
			});
			this.$el.append(tmpl);
		},
		
		setMemberType : function(e) {
			var target = $(e.currentTarget);
			target.hide();
			target.next('.modifyMemberType').show();
			target.next('.modifyMemberType').find('select.select_member_type').val(target.attr("data-memberType"));
			
		},
		
		saveMemberType : function(e) {
			var self = this;
			var userId = $(e.currentTarget).parents('.modifyMemberType').siblings('span').attr('data-id');
			var memberType = $(e.currentTarget).parents('.modifyMemberType').find('select.select_member_type').val();
			var communityId = this.$el.find('#community_name').attr('data-id');
			$(e.currentTarget).parents('.modifyMemberType').siblings('span').show();
			$(e.currentTarget).parents('.modifyMemberType').hide();
			
			GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
			var targetUrl = GO.contextRoot+'ad/api/community/'+communityId+'/member/'+userId+"/"+memberType;
            $.ajax({
                type: 'PUT',
                async: true,
                data : JSON.stringify(),
                dataType: 'json',
                contentType : "application/json",
                url: targetUrl,
				success : function(resp) {
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					$.goSlideMessage(commonLang["변경되었습니다."]);
					self.getCommunityMember(communityId);
					$("#community_member").addClass("active");
				},
				error : function(resp) {
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					$.goSlideMessage(commonLang["실패했습니다."], 'caution');
				}
            });
		},
		
		cancelMemberType : function(e) {
			$(e.currentTarget).parents('.modifyMemberType').siblings('span').show();
			$(e.currentTarget).parents('.modifyMemberType').hide();
			
		},
	});
	return CommunityDetail;
});