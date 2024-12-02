//게시판 글 목록 HOME
(function() {
	define([
	        "jquery",
	        "backbone", 	
	        "app",
	        "community/collections/members", 
	        "hgn!community/templates/side_members",
	        "hgn!community/templates/side_members_item",
	        "i18n!nls/commons",
	        "i18n!community/nls/community",
	        "GO.util",
	        "jquery.nanoscroller"
	        ], 
	        function(
	        		$,
	        		Backbone,
	        		App,
	        		MemberCollection,
	        		tplSideCommunities,
	        		tplSideCommunitiesItem,
	        		commonLang,
	        		communityLang
	        ) {
		
		var tplVar = {
			'community_member_join': communityLang['가입 멤버'],
			'community_member_all': communityLang['전체 보기'],
			'name_desc': commonLang['프로필 보기'],
			'community_invite': communityLang['초대하기'],
			'community_leave': communityLang['탈퇴하기'],
			'community_master': communityLang['마스터']
		}

		var SideMembers = Backbone.View.extend({
			el : '#sideLnb',
			
			initialize: function(options) {
				this.options = options || {};
				this.communityId = this.options.communityId;		
				this.moreMemberStartNum = 0;
			},
			
			render: function() {
//			    this.collection = MemberCollection.getCollection({communityId:this.communityId});
			    var self = this;
			    var memberCollection = MemberCollection.create();
			    
			    memberCollection.setVariables(this.communityId);
			    memberCollection.fetch({
			        async : true,
			        success : function(collection){
		                var dataset = collection.toJSON() || [];
		                
		                //멤버 섬네일때문에 성능저하 때문에 최초에 가입멤버는 10명만 보여준다.		                
		                var itemTmpl = tplSideCommunitiesItem({
		                	 dataset : (dataset.length > 10) ? dataset.slice(0,10) : dataset ,
                			 lang : tplVar,
                			 isDataset : dataset.length ? true : false,
                			 isMemberTypeMaster : function() {
                				 return this.memberType == "MASTER";
 		                     }
		                });
		                
		                //멤버영역 wrapper
		                var tmpl = tplSideCommunities({
		                    lang : tplVar,
		                    total : collection.size()		                    
		                });
		                
		                self.$el.empty().append(tmpl).find("#communityMembers").append(itemTmpl);
		                
		                if(dataset.length > 10) {
		                    self.$el.find('ul#communityMembers').addClass('content').css('width', 'auto').wrap('<div class="nano" style="height:240px"/>');
		                    self.$el.find(".nano").nanoScroller();
		                    
		                    //가입멤버가 10명이상일 경우, 스크롤 내릴때 추가로 collection에서 멤버불러온다.
		                    $(".nano").on("scrollend", function(e){
		                    	self.moreMemberStartNum = parseInt(self.moreMemberStartNum) + 10;
		                    	var memberEndNum = self.moreMemberStartNum;
		                    	var dataset = memberCollection.toJSON().slice(self.moreMemberStartNum,memberEndNum+10);
		                    	var tmpl = tplSideCommunitiesItem({
				                    dataset : dataset,
				                    lang : tplVar,
				                    isMemberTypeMaster : function() {
				                        return this.memberType == "MASTER";
				                    }
				                });
				                $("#communityMembers").append(tmpl);
				                
				                //nano스크롤 초기화.
				                self.$el.find(".nano").nanoScroller({ destroy: true });
				                self.$el.find(".nano").nanoScroller();
	                        });
		                }

		                var memberStatus = $('#side').find('.select_nav').attr('data-memberStatus');
		                	
		                if(memberStatus == 'WAIT') {
							self.$el.find('#memberInvite').remove();
						}
		                
		                if (memberStatus == 'NONE') {
		                	self.$el.find('ul.side_depth:has(li.new)').remove();
		                }
			        }
			    });
			},
			
		});

		return {
			render: function(communityId) {
				var sideMembers = new SideMembers({ communityId : communityId });
				return sideMembers.render();				
			}
		};
	});
}).call(this);