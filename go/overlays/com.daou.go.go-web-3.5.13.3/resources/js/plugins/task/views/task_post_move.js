;(function() {
	define([
			"backbone",
			"app",
			
			"i18n!nls/commons",
	        "i18n!task/nls/task",
	        "i18n!board/nls/board",
			
			"hgn!board/templates/header_select_list",
	        
			"board/collections/header_list",
	        
			"board/views/dept_list"
	], 
	function(
			Backbone,
			App,
			
			commonLang,
			taskLang,
			boardLang,
			
	        TplHeaderListTmpl,
	        
			HeaderListCollection,
	        
			deptList
	) {
	
		var TaskPostMoveView = Backbone.View.extend({

			initialize : function(options) {
				this.taskIds = _.isArray(options.taskIds) ? options.taskIds : [options.taskIds];
				this.deptId = options.deptId;
				this.url = options.url;
			},
			
			render : function() {
				var self = this,
	    			popupEl = null,
	    			moveCallback = function(popupEl) {
		    			var targetBoardEl = popupEl.find('#select_board'),
							targetBoardSelectedEl = targetBoardEl.find('option:selected'),
							targetBoardId = targetBoardEl.val(),
							url = self.url + "/" + targetBoardId,
							targetHeaderEl = popupEl.find('#move_header_list'),
							targetHeaderId = targetHeaderEl.val(),
							checkNoti = popupEl.find("#write_noti").is(":checked"),
							taskIds = self.taskIds;
		    			
		    			if(targetBoardSelectedEl.attr('data-headerFlag') == 'true' && targetBoardSelectedEl.attr('data-headerRequiredflag') == 'true' && targetHeaderId == 0) { 
		    				$.goError(boardLang['말머리를 선택해주세요.']);
		    				return false;
		    			}
		    			
		    			if(!targetBoardId) {
		    				$.goError(boardLang["게시판을 선택해 주세요."]);
		    				return false;
		    			}else{
		    				$.goPopup.close();
		    				GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
							
		    				var now = GO.util.shortDate(GO.util.toISO8601(new Date()));
		    				var data = {
		    						'taskIds' : taskIds,
		    						'noti' : checkNoti,
		    						'fromDate' : checkNoti ? GO.util.toISO8601(now) : null,
									'toDate' : checkNoti ? GO.util.calDate(GO.util.searchEndDate(now),'months',10000) : null
		    				};
		    				if(targetHeaderId != undefined && targetHeaderId != '0'){
		    					data.headerId = parseFloat(targetHeaderId);
			    			}
		    				
		    				$.ajax(url, {
		    					type : 'PUT',
		    					contentType : 'application/json',
								data : JSON.stringify(data),
		    					success : function() {
		    						$.goMessage(boardLang['게시글이 등록되었습니다.']);
		    						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
		    					},
		    					error : function(resp) {
		    						if(resp.responseJSON.message){
		    							$.goError(resp.responseJSON.message);
		    						}else{
		    							$.goError(commonLang["실패했습니다."]);
		    						}
		                		}
		    				});
		    			}
	    			};
	    			
				var moveMsg = [taskLang["업무를 등록할 게시판을 선택하세요."]];
				popupEl = $.goPopup({
					pclass: 'layer_normal layer_item_move',
					width : 330,
					header : boardLang["게시물 이동"],
					title : moveMsg,
					modal : true,
					contents : '<br /><br /><div id="deptList"></div>',
					buttons : [{
						btype : 'confirm',
						btext : taskLang['등록'],
						autoclose : false,
						callback : moveCallback
					}]
				});
				var departmentId = self.deptId;
				
				deptList.render({
					id: ".go_popup #deptList",  		//target ID
					boardList : true,  		// 부서 셀렉트 박스 사용여부 (true/false)
					deptId : departmentId,		//부서 ID
					boardId : '',
					isCommunity : false,
					boardType : 'classic',
					postId : '',
					isMove : true,
					checkStickable : true,
				});
				
				popupEl.reoffset();
    			
    			$('#deptList select#select_board').die();
    			$('#deptList select#select_board').live('change', function() {
    				self.changeBoardList();
    			});
    			$('#deptList select#dept_select').live('change', function() {
    				self.changeBoardList();
    			});
			},
			changeBoardList : function(){
				var select = $("#select_board option:selected");
				this.attachHeaderSelect(select.val(), select.attr('data-headerflag'));
			},
			attachHeaderSelect : function(boardId, headerflag){
				var col = [];
				if(headerflag == "true"){
					col = HeaderListCollection.getHeaderList({boardId:boardId}).toJSON();
				}
				if(col.length > 0){
					var tplHeaderList = TplHeaderListTmpl({
						dataset:col,
						defaultSelect: boardLang['말머리 선택'],
						selectId : 'move_header_list'
					});
					$('#header_dt').show();
					$('.go_popup #deptList #board_header_wrap').html(tplHeaderList);
				}else{
					$('#header_dt').hide();
					$('.go_popup #deptList #board_header_wrap').html('');
				}
			}
		});
		return TaskPostMoveView;
	});
}).call(this);