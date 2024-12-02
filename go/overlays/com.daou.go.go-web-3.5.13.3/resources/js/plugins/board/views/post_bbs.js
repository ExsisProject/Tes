// 클래식형 게시판 글목록
;(function() {
	define([
	    "jquery",
	    "backbone", 	
	    "app",	 
	    
	    "i18n!board/nls/board", 
	    "i18n!nls/commons",
	    
	    "board/views/dept_list",
	    'views/profile_card',
        "board/views/notice_layer", 
        "board/collections/header_list",
        "board/collections/posts",
        
        "hgn!board/templates/post_bbs_null",
        "hgn!board/templates/header_select_list",
        'hgn!board/templates/post_reader_list',
        'hgn!board/templates/post_recommend_list',
		'hgn!board/templates/post_bbs_custom_button',
		'hgn!board/templates/post_notice',
        
        "grid",
        
	    "jquery.go-sdk",
	    "jquery.go-popup",
	    "jquery.go-grid",
	    "jquery.ui",
	    "GO.util",
	    "jquery.placeholder",
	    "jquery.cookie"
	], 
	function(
		$,
		Backbone,
		App, 
		
		boardLang,
		commonLang,
		
		deptList,
		ProfileCardView,
		noticeLayer,
		HeaderListCollection,
		Posts,
		
		tplPostBbsNull,
		TplHeaderList,
		tplPostReaderList,
		tplPostRecommendList,
		tplPostCustomButton,
		tplPostNotice,
		
		GridView
	) {
		
		// var instance = null;
		var tplVar = {
				'download' : commonLang['목록 다운로드'],
				'move' : commonLang['이동'],
				'copy' : commonLang['복사'],
				'delete' : commonLang['삭제'],
				'search' : commonLang['검색'],
				'add_stickable' : boardLang['공지로 등록'],
				'post_write' : boardLang['새글쓰기'],
				'post_new' : commonLang['새글'],
				'attach_files' : boardLang['첨부파일'],
				'num' : boardLang['번호'],
				'title' : commonLang['제목'],
				'writer' : boardLang['작성자'],
				'created_at' : boardLang['작성일'],
				'read_count' : boardLang['조회'],
				'recommend_count' : boardLang['좋아요'],
				'post_null' : boardLang['작성된글없음'],
				'post_delete_title' : boardLang['게시글을 삭제 하시겠습니까?'],
				'post_delete_desc' : boardLang['삭제확인메세지'],
				'post_move_success' : commonLang['성공했습니다.'],
				'post_move_title' : boardLang['게시물 이동'],
				'post_move_desc' : boardLang['게시물을 이동시킬 게시판을 선택하세요.'],
				'post_move_header_desc' : boardLang['말머리를 선택해주세요.'],
				'post_move_orphan_desc' : boardLang['원글이 삭제된 답글은 이동할 수 없습니다.'],
				'post_move_reply_desc' : boardLang['원글 이동 시, 답글도 함께 이동합니다.'],
				'post_move_reply_only' : boardLang['답글은 원글과 함께 이동시킬 수 있습니다.'],
				'post_status_close' : commonLang['비공개'],
				'post_reply' : boardLang['답글'],
				'post_sticky' : boardLang['공지'],
				'post_sticky_term' : boardLang['공지 기간 설정'],
				'search_period_msg' : commonLang['검색기간을 잘못 입력하셨습니다.'],
				'post_hidden_msg' : boardLang['열람권한이 없는 게시물입니다.'],
				'post_orphan_msg' : boardLang['원글이 삭제된 답글'],
				'header_default' : boardLang['말머리 선택'],	
				'header_all' : commonLang['전체'],
				'notice_delete_title' : boardLang['공지사항에서 내리시겠습니까'],
				'alert_length' : boardLang['0자이상 0이하 입력해야합니다.'],
				'placeholder_search' : commonLang['플레이스홀더검색'],
				'was_not_selected' : boardLang["선택된 게시물이 없습니다"],
				'copy_fail' : commonLang['실패했습니다.'],
				'post_copy_title' : boardLang["게시물 복사"],
				'post_copy_message' : boardLang['* 원글 복사시, 답글도 함께 복사됩니다.'],
				'post_copy_desc' : boardLang['게시물을 복사할 게시판을 선택하세요.'],
				'post_copy_success' : commonLang['성공했습니다.'],
				'post_copy_orphan_desc' : boardLang['* 원글이 삭제된 답글은 복사할 수 없습니다.'],
				'post_copy_reply_desc' : boardLang['* 원글 복사시, 답글도 함께 복사됩니다.'],
				'post_copy_reply_only' : boardLang['답글은 원글과 함께 복사시킬 수 있습니다.'],
				'post_copy_same_board_alert' : boardLang['동일한 게시판이 선택되었습니다.'],
				'reomment_list_tab' : boardLang['좋아요'],
				'read_count' : boardLang['조회'],
				'ok' : commonLang['확인'],
			};
		
		var PostBbs = Backbone.View.extend({
			el : '#postContents',
			initialize: function(options) {
				this.options = options || {};
				
				this.resetPage(this, this.options);
				this.anonymFlag = this.options.anonymFlag;
				this.posts = new Posts([], {
					boardId : this.boardId,
					boardType : "classic",
					params : ["headerId"]
				});
				this.posts.setDuration();
				this.notices = new Posts([], {
					boardId : this.boardId,
					boardType : "classic",
					isNoticeType : true
				});
			},
			events : {
				"click a.btn_tool[data-btntype='delete']" : "actionCheckedDelete",
				"click a.btn_tool[data-btntype='move']" : "actionCheckedMove",
				"click a.btn_tool[data-btntype='copy']" : "actionCheckedCopy",
				"click a.btn_tool[data-btntype='notice']" : "actionCheckedSticky",
				"click a.btn_tool[data-btntype='download']" : "actionCsvDownload",
//				"click a.boardTitle" : "goPostDetail",
				'change #header_list' : 'headerFilter',
				'click tr.noti span.ic_notice' : 'actionNoticeDelete',
				'click a#listPostRecommend' : 'showPostRecommend',
				'click a#listPostReader' : 'showPostReader',
				'click ul.tab_nav2 li.first' : 'showPostReader',
				'click ul.tab_nav2 li.last' : 'showPostRecommend'
			},
			
			render: function() {
				this._renderDataTables();
				this._renderCustomButtons();
				this.$el.find('input[placeholder]').placeholder();
				
				return this.el;
			},
			
			getHeaderList : function() {
				if (!this.headerFlag) return "";
				var col = HeaderListCollection.getHeaderList({boardId:this.boardId}).toJSON();
				if(col.length) {
					var tplHeaderList = TplHeaderList({
						dataset:col,
						defaultSelect: tplVar.header_default,
						selectId : 'header_list',
						selectClass : 'article_head'
					});
					return tplHeaderList;
				}
				return
			},
			
			resetPage : function(self, options) {
				self.boardId = options.boardId.split('?')[0];
				self.owner = options.owner;
				self.manageable = options.manageable || false;
				self.isCommunity = options.isCommunity || false;
				self.writable = options.writable || false;
				self.status = options.status;
				self.headerFlag = options.headerFlag || false;
				self.headerRequiredFlag = options.headerRequiredFlag || false;
				if(self.status == 'CLOSED') self.writable = false;
				self.controlButtons = null;
				self.noticePopup = null;
				self.writeUrl = GO.contextRoot+'app/board/post/write/' + self.owner.ownerId+'/' + self.boardId;
				if(self.isCommunity)  self.writeUrl = GO.contextRoot + 'app/community/' + self.owner.ownerId + '/board/'+self.boardId + '/post/write';
			},
			
			goPostDetail : function(postId) {
				var baseUrl = 'board/' + this.boardId + '/post/' + postId;
				
				if(this.isCommunity) baseUrl = 'community/' + this.owner.ownerId + '/board/' + this.boardId + '/post/' + postId;
				App.router.navigate(baseUrl, { trigger : true });
			},
			
			_renderPostTitle : function(data) {
				var readPostClass = "";
				if(!data.readPost) {
					readPostClass = "read_no";
				}
				var title = ['<p class="depth', data.depth, ' ', readPostClass, '">'];
				if(data.depth) {
	    			title.push('<span class="ic_classic ic_answer"></span>&nbsp;');
	    		}
				if(data.status === 'CLOSE') {
	    			title.push('<span class="ic_classic ic_lock" title="', tplVar['post_status_close'], '"></span>&nbsp;');
	    			if(data.summary == " $$#HIDDEN_POST#$$ ") {
	    				title.push(tplVar['post_hidden_msg']);
	    				return title.join('');
	    			}
	    		}
	    		title.push('<a class="boardTitle" data-id="', data.id, '" data-bypass><span class="list_subject">');
	    		if(data.orphanFlag) {
	    			title.push('<strong>[', tplVar['post_orphan_msg'], ']</strong>&nbsp;');
	    		}
				if (this.anonymFlag && data.writer.name) {
					title.push('<span class="state ghost" title="', data.writer.name,'&nbsp;', data.writer.positionName, '">', commonLang["공개"] , '</span>&nbsp;')
				}
	    		if(data.header) {
	    			title.push("["+data.header.name+"]&nbsp;");
	    		}
	    		
	    		if(data.hasAttach) {
	    			title.push('&nbsp;<span class="ic ic_file_s" title="', tplVar['attach_files'], '"></span>&nbsp;');
	    		}
	    		if(data.title) {
	    			// GO-16948 제목에 공백이 존재할 경우 줄바꿈으로 등록 (Multi &nbsp;일 경우 Gogrid의 Cell이 깨져 보이는 현상 제거)
	    			var content = data.title.replace(/ {1,}/g, " ");
	    			title.push(GO.util.textToHtml(content));
	    		} 
	    		title.push('</span></a>');
	    	
	    	
	    		if(data.commentsCount) {
	    			title.push( '&nbsp;<span class="ic_classic ic_reply"></span><span class="num">[<strong>'
	    						+data.commentsCount+'</strong>]</span>');
	    		}
	    		if(data.repliesCount) {
	    			title.push('&nbsp;<span class="ic_classic ic_answer"></span><span class="num">', tplVar['post_reply'] ,'[<strong>'
	    						+data.repliesCount+'</strong>]</span>');
	    		}
	    		if(data['newFlag']) {
	    			title.push('&nbsp;<span class="ic_classic ic_new2" title="', tplVar['post_new'] ,'"></span>');
	    		}
	    		title.push('</p>');
	    		return title.join('');
			},
			
			headerFilter : function(e){
	            var value = $(e.currentTarget).val();
                this.posts.setHeaderId(value || "");
                this.posts.pageNo = 0;
                this.posts.fetch();
	        },
	        
			_renderDataTables : function() {
				var self = this;
				var	searchSelector = [{
                        value : "titleAndContent",
                        label : boardLang["제목+내용"]
                    }, {
                        value : "titleOnly",
                        label : commonLang["제목"]
                    }, {
                        value : "userName",
                        label : boardLang["작성자"]
                    }];
				var columns = [{
					className : "num",
					label : boardLang["번호"],
					render : function(model) {
						// paginated_collection 에 인덱스 계산하는 메소드로 만들어도 될듯.
						var collection = model.collection;
						return collection.total - collection.indexOf(model) - (collection.pageNo * collection.pageSize);
					}
				}, {
					className : "subject",
					label : commonLang["제목"],
					header : Hogan.compile('<div class="article_head_wrap">{{{headerList}}}</div>').render({headerList : self.getHeaderList()}),
					render : function(model) {
						return self._renderPostTitle(model.toJSON());
					}
				}, {
					className : "name",
					label : boardLang["작성자"],
					render : function(model) {
						var writer = model.get("writer");
						if(writer) {
		    	    		writer.positionName = writer.positionName || '';
		    	    		if (writer.otherCompanyUser) {
			    	    		return '<a data-profile data-id="' + writer.id+'" class="multi_user">' + writer.name + ' ' + writer.positionName + '</a>';
		    	    		}
		    	    		return '<a data-profile data-id="' + writer.id+'">' + writer.name + ' ' + writer.positionName + '</a>';
		    	    	} else {
		    	    		return '-';
		    	    	}
					}
				}, {
					className : "date",
					label : boardLang["작성일"],
					render : function(model) {
						return GO.util.boardDate(model.get("createdAt"));
					}
				}, {
					className : "read",
					label : boardLang["조회"],
					render : function(model) {
						if(self.anonymFlag){
							return model.get("readCount") || '-';
						}else{
							return '<a id="listPostReader" data-id = "' + model.id + '">' + model.get("readCount") || '-' + '</a>';
						}
					}
				}, {
					className : "plus",
					label : boardLang["좋아요"],
					render : function(model) {
						var recommendCount = model.get("recommendCount");
						if(self.anonymFlag){
							return '<span class="plus_num">' + (recommendCount ? recommendCount : 0) + '</span>';
						}else{
							return '<a id="listPostRecommend" data-id = "' + model.id + '"><span class="plus_num">'+(recommendCount ? recommendCount : 0)+'</span></a>';
						}
					}
				}];
				if(self.anonymFlag) {
					searchSelector = _.filter(searchSelector, function(obj) {
						return obj.value !== "userName";
					});
					columns = _.filter(columns, function(obj) {
						return obj.className !== "name";
					});
				}
				
				var deferred = this.notices.fetch();
				this.gridView = new GridView({
					el : this.el,
					collection : this.posts,
					checkbox : this.manageable && self.status != "CLOSED",
					tableClass : "type_normal tb_classic_list dataTable",
					usePeriod : true,
					emptyContent : tplPostBbsNull({
						lang : tplVar,
						writable : this.writable,
						writeUrl : this.writeUrl
					}),
					columns : columns,
					searchOptions : searchSelector,
					drawCallback : function(collection) {
						if(collection.total == 0 && !collection['keyword']) {
							$('.dataTables_paginate, .tool_bar, .table_search').hide();
						} else {
							$('.dataTables_paginate, .tool_bar, .table_search').show();
						}
						if(!self.posts['keyword']) {
							deferred.done(function() {
								self._renderNotice();
							})
						} else {
							self.noticeTotal = 0;
						}
						
						$(window).scrollTop(0);
						
						if(collection.headerId) {
							self.$el.find("#header_list option[value='" + collection.headerId + "']").attr("selected", "selected");
						}
						self.$el.find(".read_no").closest('tr').addClass('read_no');
					}
				});
				
				this.posts.fetch();
				this.gridView.render();
				
				this.gridView.$el.on("navigate:grid", $.proxy(function(event, postId) {
					var post = this.posts.findWhere({id: parseInt(postId, 10)});
					if (post && _.isUndefined(post.get('actions'))) {
                        $.goMessage(boardLang['게시글 열람불가 메세지']);
                        return;
					}
					this.goPostDetail(postId);
				}, this));
			},
			actionCsvDownload : function(e) {
				GO.util.downloadCsvFile('api/board/' + this.boardId + '/posts/classic/download?' + this.posts.makeParam());
			},
			actionNoticeDelete : function(e) {
				e.stopPropagation();
				var self = this;
				
				if(!this.manageable) {
					if($(e.currentTarget).parents('tr').find('a[data-profile]').attr('data-id') != GO.session('id') ) return false;
				} 
				$.goConfirm( tplVar['notice_delete_title'], '', function() {
					var url = [GO.contextRoot+'api/board', self.boardId,'post', $(e.currentTarget).parents('tr').attr('data-id'), 'notice'];
					GO.util.preloader($.ajax({
						url : url.join('/'),
						data : JSON.stringify({ stickable : false }),
						type : 'PUT',
						contentType : 'application/json',
						success : function() {
							self._renderList();
						}
					}));
				});
			},
			
			_renderList : function() {
				var self = this;
				$.when(self.posts.fetch(), self.notices.fetch()).done(function() {
					self._renderNotice();
				});
			},
			
			_renderNotice : function() {
				var self = this;
				var noticeTpls = [];
				self.noticeTotal = this.notices.total || 0;
				if (self.noticeTotal) {
					self.$el.find('.tool_bar').show();
					if(self.gridView.$el.find('tbody p.data_null').length) {
						self.gridView.$el.find('tbody p.data_null').parents('tr').remove();
					}
				}

				this.notices.each(function(model) {
					if (model.get("hiddenPost")) return true;
					var writer = model.get("writer");
					var template = tplPostNotice({
						dataset: model,
						readPostClass: model.get("readPost") ? "" : "read_no",
						writer: writer,
						root: model.get("root"),
						createdAt: GO.util.boardDate(model.get("createdAt")),
						readCount: model.get("readCount"),
						lang: tplVar,
						isManageable: self.manageable || writer.id == GO.session('id'),
						hasValidCheckBox: self.manageable && self.status != 'CLOSED',
						postTitle: function() {
							return self._renderPostTitle(model.toJSON());
						},
						recommendCount: function() {
							var recommendCount = model.get("recommendCount");
							return recommendCount > 0 ? recommendCount : 0;
						}
					});
					noticeTpls.push(template);
				});
				
				self.gridView.$el.find('noti').remove();
				if (this.notices.length) {
					self.gridView.$el.find('tbody').prepend(noticeTpls.join(''));
				}
			},
			
			_renderCustomButtons : function() {
				var template = tplPostCustomButton({
					writable : this.writable,
					writeUrl : this.writeUrl,
					anonymFlag : this.anonymFlag,
					lang : tplVar,
					manageable : this.manageable && this.status != 'CLOSED'
				});
				
				this.$el.find('.tool_bar .critical').html(template);
			},
			
			_getCheckecNoticeIds : function() {
				var checkedNoticeObj = this.gridView.$el.find('input[type=checkbox][data-notice]:checked');
	            var checkedIds = $(checkedNoticeObj).map(function(k,v) {
	                return parseInt($(v).val(), 10);
	            }).get();
	            return checkedIds;
			},
			
			actionCheckedDelete : function() {			
				var self = this;
				var checkedIds = this.gridView.getCheckedIds();
				if(checkedIds.length) {
					$.goCaution( tplVar['post_delete_title'], tplVar['post_delete_desc'], function() {
						var url = [GO.contextRoot+'api/board', self.boardId,'post'];
						$.go(url.join('/'), JSON.stringify({'ids' : checkedIds}) , {							
							qryType : 'DELETE',
							contentType : 'application/json',
							responseFn : function() {
								self._renderList();
								self.$el.trigger('boardInfo:change', [false]);
								GO.EventEmitter.trigger('boardTree', 'changed:nodes');
							}
						});
					});
				} else {
					$.goMessage(boardLang["선택된 게시물이 없습니다"]);
				}
			},
			
			actionCheckedCopy : function(){
				var self = this;
				var popupEl = null;
				var hasOrphan = false;
				var hasReply = false;
				var checkedData = this._getCheckedData();
				var checkedIds = [];
				var moveCallback = function(popupEl) {
					var validate = true;
					var boards = [];
					var targetBoardEl = popupEl.find("#boardCopyTable tr");
					$.each(targetBoardEl,function(k,v){
						var boardOpt = {};
						var boardSelect = $(v).find('.select_board option:selected');
						var headerSelect = $(v).find('.copy_header_list option:selected');
						if(!boardSelect.val()) {
							$.goError(tplVar['post_copy_desc']);
							validate = false;
							return false;
						}
						if(boardSelect.attr('data-headerFlag') == 'true' && boardSelect.attr('data-headerRequiredflag') == 'true' && headerSelect.val() == 0) { 
							$.goError(tplVar['post_move_header_desc']);
							validate = false;
							return false;
						}
						
						//추가한 게시판중 같은 게시판이 있는지 검사
						var result = $.grep(boards, function(e){
							return e.id == boardSelect.val();
						});
						if(result.length){
							$.goSlideMessage(tplVar['post_copy_same_board_alert'],'caution');
							validate = false;
							return false;
						}
						boardOpt.id = boardSelect.val();
						boardOpt.headerId = (headerSelect.length) ? headerSelect.val() : '';
						boards.push(boardOpt);
					});
					
					if(!validate){
						return;
					}
					
					$.goPopup.close();
					GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
					var url = [GO.contextRoot + 'api/board', self.boardId, 'post/copy'];
					
					$.ajax({
						type: 'POST',
						async: true,
						data : JSON.stringify({ 'postIds' : checkedIds , 'boards' : boards }),
						dataType: 'json',
						contentType : "application/json",
						url: url.join('/')
					}).
					done(function(response){
						$.goSlideMessage(tplVar['post_copy_success']);
						GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
						self.$el.trigger('boardInfo:change', [false]);
						self._renderList();
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					}).
					fail(function(error){
						$.goSlideMessage(tplVar['copy_fail'],'caution');
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					});
					
				};
				
				// 원글이 삭제된 글(orphanFlag = true)은 이동을 할 수 없다. 
				// But!! 원글이 삭제됐지만, root 를 이동하는경우에 대한 처리 해줘야함.
				var hasRoot = false;
				
				$.each(checkedData, function(k,v) {
					if(v.orphanFlag && !hasRoot) {
						hasOrphan = true;
						self.$el.find('input[name="id"][value="'+v.id+'"]').removeAttr('checked');
					} else {
						//1. 원글의 id만 이동한다.(답글은 서버에서 처리)
						//2. 답글의 체크박스를 체크된 상태로 보여준다.
						if(v.id == v.root) {
							hasRoot = true;
							checkedIds.push(v.id);
							if(v.repliesCount) {
								hasReply = true;
								self.$el.find('input[name="id"][data-root="'+v.id+'"]').attr('checked', 'checked');
							}
						} else {
							hasReply = true;
						}
					}
				});
				
				checkedIds = _.union(checkedIds, this._getCheckecNoticeIds());
				if(checkedIds.length) {
					var moveMsg = [tplVar['post_copy_desc']];
					var moveWarningMsg = [];
					moveWarningMsg.push('<span class="desc">');
                    moveWarningMsg.push('<br>' + boardLang['열람권한 복사 문구']);
					if(hasReply) moveWarningMsg.push('<br>' + tplVar['post_copy_reply_desc']);
					if(hasOrphan) moveWarningMsg.push('<br>' + tplVar['post_copy_orphan_desc']);
					moveWarningMsg.push('</span>');
					moveWarningMsg.push('<br><br><div id="deptList"></div>');
					popupEl = $.goPopup({
						pclass: 'layer_normal layer_absence',
						width : 700,
						header : tplVar['post_copy_title'],
                        title :  moveMsg,
						modal : true,
						contents : moveWarningMsg.join(''),
						buttons : [{
							btype : 'confirm',
							btext : tplVar['copy'],
							autoclose : false,
							callback : moveCallback
						}]
					});
					
					//부서 & 게시판목록 render 
					deptList.render({
						id: ".go_popup #deptList",  		//target ID
						boardList:true,  		// 부서 셀렉트 박스 사용여부 (true/false)
						deptId:this.owner.ownerId,		//부서 ID
						boardId:this.boardId,
						isCommunity: this.isCommunity,
						boardType: 'classic',
						postId : '',
						isCopy:true
					});
					
					this.attachHeaderSelectCopy($('#boardCopyTable select.select_board'));
					popupEl.reoffset();
					
				} else {
					if(hasOrphan) {
						$.goAlert(tplVar['post_copy_title'], tplVar['post_copy_orphan_desc']);
					} else if(hasReply) {
						$.goAlert(tplVar['post_copy_title'], tplVar['post_copy_reply_only']);
					} else {
						$.goMessage(boardLang["선택된 게시물이 없습니다"]);
					}
					
				}
				var $boardCopyTable = $('#boardCopyTable select.select_board');
				$boardCopyTable.die('change');
				$boardCopyTable.live('change', function(e) {
					self.changeBoardListCopy(e);
				});
			},
			
			_getCheckedData : function() {
				var checkedIds = this.gridView.getCheckedIds();
				return _.map(checkedIds, function(id) {
					var model = this.posts.get(id);
					if (!model) model = this.notices.get(id);
					return model.toJSON();
				}, this);
			},
			
			actionCheckedMove : function() {
				var self = this;
				var popupEl = null;
				var hasOrphan = false;
				var hasReply = false;
				var checkedData = this._getCheckedData();
				var checkedIds = [];
				var moveCallback = function(popupEl) {
						var targetBoardEl = popupEl.find('#select_board');
						var targetBoardSelectedEl = targetBoardEl.find('option:selected');
						var targetBoardId = targetBoardEl.val();
						var url = [GO.contextRoot + 'api/board', self.boardId, 'post/move', targetBoardId];
						var targetHeaderEl = popupEl.find('#move_header_list');
						var targetHeaderId = targetHeaderEl.val();
						if(targetHeaderId != '0') {
							url.push(targetHeaderId);
						}

							
						if(targetBoardSelectedEl.attr('data-headerFlag') == 'true' && targetBoardSelectedEl.attr('data-headerRequiredflag') == 'true' && targetHeaderId == 0) {
							$.goError(tplVar['post_move_header_desc']);
							return false;
						}
						
						if(!targetBoardId) {
							$.goError(tplVar['post_move_desc']);
							return false;
						} else {
							$.goPopup.close();
							GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
							$.go(url.join('/'), JSON.stringify({ 'ids' : checkedIds }), {
								qryType : 'PUT',
								contentType : 'application/json',
								responseFn : function() {
									$.goMessage(tplVar['post_move_success']);
									GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
									self.$el.trigger('boardInfo:change', [false]);
									self._renderList();
									GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
								},
								error : function(error) {
									try {
										var responseData = JSON.parse(error.responseText);
										$.goAlert(responseData.message);
									} catch (e) {
										$.goAlert(commonLang['실패했습니다.']);
									}
								}
							});
						}
					};
				
				// 원글이 삭제된 글(orphanFlag = true)은 이동을 할 수 없다. 
				// But!! 원글이 삭제됐지만, root 를 이동하는경우에 대한 처리 해줘야함.
				var hasRoot = false;
				
				$.each(checkedData, function(k,v) {
					if(v.orphanFlag && !hasRoot) {
						hasOrphan = true;
						self.$el.find('input[name="id"][value="'+v.id+'"]').removeAttr('checked');
					} else {
						//1. 원글의 id만 이동한다.(답글은 서버에서 처리)
						//2. 답글의 체크박스를 체크된 상태로 보여준다.
						if(v.id == v.root) {
							hasRoot = true;
							checkedIds.push(v.id);
							if(v.repliesCount) {
								hasReply = true;
								self.$el.find('input[name="id"][data-root="'+v.id+'"]').attr('checked', 'checked');
							}
						} else {
							hasReply = true;
						}
					}
				});
				
				checkedIds = _.union(checkedIds, this._getCheckecNoticeIds());
				if(checkedIds.length) {
					var moveMsg = [tplVar['post_move_desc']];
					var moveWanringMsg = [];
					if(hasOrphan) moveWanringMsg.push('<br />※ ' + tplVar['post_move_orphan_desc']);
					if(hasReply) moveWanringMsg.push('<br />※ ' + tplVar['post_move_reply_desc']);
					popupEl = $.goPopup({
						pclass: 'layer_normal layer_item_move',
						width : 330,
						header : tplVar['post_move_title'],
						title : moveMsg,
						modal : true,
						contents :moveWanringMsg.join('') + '<br /><br /><div id="deptList"></div>',
						buttons : [{
							btype : 'confirm',
							btext : tplVar['move'],
							autoclose : false,
							callback : moveCallback
						}]
					});
					
					//부서 & 게시판목록 render 
					deptList.render({
						id: ".go_popup #deptList",  		//target ID
						boardList: true,  		// 부서 셀렉트 박스 사용여부 (true/false)
						deptId: this.owner.ownerId,		//부서 ID
						boardId: this.boardId,
						isCommunity: this.isCommunity,
						boardType: 'classic',
						postId : '',
						isMove: true
					});
					
					this.attachHeaderSelect(this.boardId);
					
					popupEl.reoffset();
					
				} else {
					if(hasOrphan) {
						$.goAlert(tplVar['post_move_title'], tplVar['post_move_orphan_desc']);
					} else if(hasReply) {
						$.goAlert(tplVar['post_move_title'], tplVar['post_move_reply_only']);
					} else {
						$.goMessage(boardLang["선택된 게시물이 없습니다"]);
					}
					
				}
				var $deptList = $('#deptList select#select_board');
				$deptList.die();
				$deptList.live('change', function() {
					self.changeBoardList();
				});
			},
			
			actionCheckedSticky : function() {
				var self = this;
				var checkedIds = this.gridView.getCheckedIds();
				if(checkedIds.length) {
					this.noticePopup = $.goPopup({
						header : tplVar['post_sticky_term'],
						 width : "350px",
						 pclass : "layer_normal layer_date_set",
						 contents : "",
						 modal : true,
						 buttons : [{
							 btext : tplVar['post_sticky'],
							 btype : "confirm", 
							 callback : function() {
								 var stickyData = self.getStickyDate() || {};
								 stickyData.stickable = true;
								 var deferredGroup = [];
								 $.each(checkedIds, function(k,v) {
									 var deferred = $.Deferred();
									$.go([GO.contextRoot + 'api/board', self.boardId, 'post', v, "notice"].join('/'), JSON.stringify(stickyData), {
										qryType : 'PUT',
										contentType : 'application/json',
										responseFn : function() {
											deferred.resolve();
										}
									});
									deferredGroup.push(deferred);
								});
								 
								 $.when.apply(null, deferredGroup).done(function() {
									 self._renderList();
								 });
							 }
						 }],
						 closePopup : function() {
							 self.noticePopup = null;
						 }
					});		
					
					noticeLayer.render();
				} else {
					$.goMessage(boardLang["선택된 게시물이 없습니다"]);
				}
			},
			
			getStickyDate : function(){
				
				if(this.noticePopup == null) return false;

				var noticeTerm = this.noticePopup.find("input[name=noticeTerm]:radio:checked");
				var key = noticeTerm.attr("data-key");
				var amount = noticeTerm.attr("data-amount");
				var startAt;
				var endAt;
				var dateType;

				if ((this.noticePopup.find("#noticeStartDate").val() != "") && (this.noticePopup.find("#noticeEndDate").val() != "")) {
					startAt = this.noticePopup.find("#noticeStartDate").val();
					endAt = this.noticePopup.find("#noticeEndDate").val();

					var regExp = /^(19|20)\d{2}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[0-1])$/;
					if (!regExp.test(startAt) || !regExp.test(endAt)) {
						throw new Error('invalid date format');
					}
					startAt = GO.util.toISO8601(startAt);
					endAt = GO.util.toISO8601(endAt);
					endAt = GO.util.searchEndDate(endAt);

				} else {
					dateType = amount + key;
				}
				return {fromDate: startAt, toDate: endAt, dateType: dateType};
			},
			
			changeBoardList : function() {
				var $select = $("#select_board option:selected");
				this.attachHeaderSelect($select.val(), $select.attr('data-headerflag'));
			},
			
			changeBoardListCopy : function(e) {
				var $target = $(e.currentTarget);
				this.attachHeaderSelectCopy($target);
			},
			
			attachHeaderSelectCopy : function(target){
				if(target.val()) {
					var col = [];
					if(target.find("option:selected").attr('data-headerflag') == "true") {
						col = HeaderListCollection.getHeaderList({boardId:target.val()}).toJSON();
					}
					if(col.length) {
						var tplHeaderList = TplHeaderList({
							dataset:col,
							defaultSelect: tplVar.header_default,
							selectClass : 'wfix_medi copy_header_list'
						});
						$("#headerSelectPart").show();
						target.parents('tr').first().find('.board_header_wrap').html(tplHeaderList);
					} else {
						$("#headerSelectPart").hide();
						target.parents('tr').first().find('.board_header_wrap').html('');
					}
				}else{
					$("#headerSelectPart").hide();
				}
			},
			
			attachHeaderSelect : function(boardId, headerflag) {
				var col = [];
				if(headerflag == "true") {
					col = HeaderListCollection.getHeaderList({boardId:boardId}).toJSON();
				}
				if(col.length) {
					var tplHeaderList = TplHeaderList({
						dataset:col,
						defaultSelect: tplVar.header_default,
						selectId : 'move_header_list'
					});
					$('#header_dt').show();
					$('.go_popup #deptList #board_header_wrap').html(tplHeaderList);
				} else {
					$('#header_dt').hide();
					$('.go_popup #deptList #board_header_wrap').html('');
				}
			},
			
			_serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			},
			
			isCurrentLayer : function(e) {
				return $(e.currentTarget).hasClass("on");
			},
			
			postPopupTabs : function(popup) {
				var self = this;
				popup.on('click', 'ul.tab_nav2 li', function(e) {
					if($(e.currentTarget).hasClass('first')) {
						self.showPostReader(e);
					} else {
						self.showPostRecommend(e);
					}
				});
			},
			showPostRecommend : function(e) {
				e.stopPropagation();
				if (this.isCurrentLayer(e)) return;
				
				var postId = $(e.currentTarget).attr('data-id');
				var tplPopupHeader = ['<ul class="tab_nav tab_nav2"><li class="first" data-id="'+ postId +'"><span>',tplVar['read_count'],
					                 '</span></li><li class="last on" data-id="' + postId + '"><span>',tplVar['reomment_list_tab'],'</span></li></ul>'];
				
				var popup = $.goPopup({
					pclass: 'layer_normal layer_reader',
					headerHtml : tplPopupHeader.join(''),
					contents: tplPostRecommendList(),
					buttons : [{
						btype : 'confirm',
						btext : tplVar['ok']
					}]
				});
				
				this.postPopupTabs(popup);
				$.goGrid({
					el : '#recommendList',
					url : GO.contextRoot + 'api/board/'+this.boardId+'/post/'+postId+'/recommend',
					displayLength : 10,
					displayLengthSelect : false,
					emptyMessage : boardLang['좋아요 목록이 없습니다.'],
					method : 'GET',
					defaultSorting : [],
					sDom : 'rt<"tool_bar"<"critical custom_bottom">p>',
					bProcessing : false,
					columns : [{
						"mData" : null,  "sWidth": "150px","bSortable": false, "sClass" : "align_l", "fnRender" : function(obj) {
							var data = obj.aData;
							var displayName = [data.recommender.name, ' ', data.recommender.positionName].join('');
							if(data.recommender.otherCompanyUser) {
								displayName = '<span class="multi_user">' + displayName + '</span>';
							}
						 	returnArr = [displayName, '&nbsp;<span class="date">', GO.util.basicDate(data.updatedAt), '</span>'];
							return returnArr.join('');
						}
				    }],
			        fnDrawCallback : function(tables, oSettings, listParams) {
			        	var toolBar = popup.find('.tool_bar'); 
			        	if(oSettings._iRecordsTotal < oSettings._iDisplayLength) {
			        		$(this.el).find('tr:last-child>td').css('border-bottom', 0);
			        		toolBar.hide();
			        	} else {
			        		toolBar.show();
			        		toolBar.find('div.dataTables_paginate').css('margin-top', 0);
			        	}
			        	
			        	popup.find('.dataTables_wrapper').css('margin-bottom', 0);
			        	popup.reoffset();
			        }
				});	
			},
			showPostReader : function(e) {
				e.stopPropagation();
				if (this.isCurrentLayer(e)) return;
				
				var postId = $(e.currentTarget).attr('data-id');
				var popup = null;
				var	tplPopupHeader = ['<ul class="tab_nav tab_nav2"><li class="first on"  data-id="'+ postId +'"><span>',tplVar['read_count'],
						                 '</span></li><li class="last" data-id="'+ postId +'"><span>',tplVar['reomment_list_tab'],'</span></li></ul>'];
				
				popup = $.goPopup({
					pclass: 'layer_normal layer_reader',
					headerHtml : tplPopupHeader.join(''),
					contents: tplPostReaderList(),
					buttons : [{
						btype : 'confirm',
						btext : tplVar['ok']
					}]
				});
				
				this.postPopupTabs(popup);
				$.goGrid({
					el : '#readerList',
					url : GO.contextRoot + 'api/board/'+this.boardId+'/post/'+postId+'/reader',
					displayLength : 10,
					displayLengthSelect : false,
					emptyMessage : boardLang['조회한 목록이 없습니다.'],
					method : 'GET',
					defaultSorting : [],
					sDom : 'rt<"tool_bar"<"critical custom_bottom">p>',
			        bProcessing : false,
					columns : [{
						"mData" : null, "bSortable": false, "sClass" : "align_l", "fnRender" : function(obj) {
							var data = obj.aData;
							var displayName = [data.reader.name,' ',data.reader.positionName].join('');
							if(data.reader.otherCompanyUser) {
								displayName = '<span class="multi_user">' + displayName + '</span>';
							}
						 	returnArr = [displayName, '&nbsp;<span class="date">', GO.util.basicDate(data.updatedAt), '</span>'];
							return returnArr.join(''); 
						}
				    }, {
				    	"mData" : null, "sWidth" : "80px","sClass" : "align_l", "bSortable": false, "fnRender" : function(obj) {
				    		var data = obj.aData;
				    		return ['<span class="plus_num">',tplVar['read_count'], data.point,'</span>&nbsp;'].join('');
				    	}
				    }],
			        fnDrawCallback : function(tables, oSettings, listParams) {
			        	var toolBar = popup.find('.tool_bar'); 
			        	if(oSettings._iRecordsTotal < oSettings._iDisplayLength) {
			        		$(this.el).find('tr:last-child>td').css('border-bottom', 0);
			        		toolBar.hide();
			        	} else {
			        		toolBar.show();
			        		toolBar.find('div.dataTables_paginate').css('margin-top', 0);
			        	}
			        	popup.find('.dataTables_wrapper').css('margin-bottom', 0);
			        	popup.reoffset();
			        }
				});		
			}
		});
		
		return PostBbs;
		
//		return {
//			render: function(opt) {
//				instance = new PostBbs(opt);
//				return instance.render();
//			}
//		};
	});
}).call(this);
