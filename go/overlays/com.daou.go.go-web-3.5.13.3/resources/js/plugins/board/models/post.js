(function() {
	define([
        "backbone",
        "app",
        "GO.util"
    ],
    function(Backbone, GO) {
    	var BoardPost = Backbone.Model.extend({
    		url: function() {
    			var url = ["/api/board", this.get('boardId'), "post", this.get('postId'), this.type || ""];
    			
    			if (!this.type && this.get("writeType") == "reply") {
    				url.push("reply");
    			}

				return url.join('/').replace('//', '/');
    		},
    		
    		setURL: function() {
    			if (this.get('isStream') || this.get("boardType") == "STREAM") {
//    			if(this.get('isStream') && !this.get('isMobile')){
					this.type = 'stream'; // 피드 하나 가져올때 쓰는듯
				} else if (!this.get('readOnly')) {
					this.type = 'classic'; // 이건 클래식 하나 가져올때 쓰는거 같음
				} else {
					this.type = "";
				}
    		},
    		
    		isClassic: function() {
    		    return this.get("type") == "CLASSIC";
    		},
    		
    		summarizedFlag: function() {
    			var content = GO.util.escapeHtml(this.get("content") || this.get("summary"));
				if (GO.util.ckeckBrCnt(content) > 8 || this.get("summarizedFlag")){
					return true;
				}
    		},

			dateParse: function() {
				return GO.util.snsDate(this.get("createdAt"));
			},
			
			commentCheck: function() {
				return parseInt(this.get("commentsCount")) < 4 ? 'none' : "";
			},

			isRecommend: function() {
				return this.get("recommend") ? "on" : "";
			},

			isZero: function() {
				return parseInt(this.get("recommendCount")) == 0;
			},

			hasComment: function() {
				return this.get("commentsCount") > 0;
			},

			detailContent: function() {
				var content = this.get("content");
				if (!content) {
					content = this.get("summary");
				}
				return GO.util.escapeHtmlWithHyperLink(content);
			},
			
			simpleContent: function() {
				var content = GO.util.textToHtmlWithHyperLink(this.get("content") || this.get("summary"));
	 	 	 	return GO.util.ckeckBrCnt(content) > 8 ? GO.util.splitBrContent(content) : content;
			},
			
			hasAttach: function() {
				return this.get("attaches").length > 0;
			},
			
			getMoreContent: function(url) {
				var self = this;
				$.ajax({
					type : "GET",
					async : false,
					url : GO.contextRoot + "api/board/" + this.get("boardId") + "/post/" + this.id + "/content",
					success : function(resp) {
						self.moreContent = resp.data.content;
					}
				});
			},
			
			checkEditAuth: function(userId) {
				var actions = this.get("actions");
				return actions.updatable;
			},

			getAuthorizedUser: function() {
    			return this.attributes.authorizedUsers;
			},

			isDuplicatedAuthUser: function(userId) {
                return _.any(this.getAuthorizedUser(), function (authUser) {
                    return authUser.userId == userId;
                });
			},
			addAuthorizedUser: function(userId, displayName) {
    			if (!this.isDuplicatedAuthUser(userId)) {
                    this.attributes.authorizedUsers.push({userId:userId, displayName:displayName});
				}
			},
			isHiddenPost: function() {
    			return !!this.get('hiddenPost');
			}
    	});
    	
    	return BoardPost;
    });
}).call(this);
