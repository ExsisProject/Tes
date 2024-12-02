// 공지 레이어
(function() {
	define([
	    // libraries...
	    "jquery",
	    "backbone", 	
	    "app",
	    "i18n!nls/commons",
	    "i18n!board/nls/board",
	    "hgn!board/templates/detail_search_layer",
	    "board/views/dept_list"
	], 
	function(
		$,
		Backbone,
		App, 
		commonLang,
		boardLang,
		Tpldetail,
		DeptList
	) {
		var lang = {
				'detail_search' : commonLang['상세검색'],
				'content' : commonLang['본문'],
				'comment' : commonLang['댓글'],
				'writer' : boardLang['작성자'],
				'attach_name' : commonLang['첨부파일명'],
				'board' : boardLang['위치'],
				'term' : boardLang['기간'],
				'term_all' : commonLang['전체'],
				'week' : boardLang['주일'],
				'month' : boardLang['개월'],
				'custom_term' : boardLang['직접선택'],
				'search' : commonLang['검색'],
				'cancel' : commonLang['취소'],
				'calender_show' : boardLang['달력보기'],
				'attach_content' : commonLang['첨부파일 내용'],
				'keyword' : commonLang['검색어']
		};
		var detailSearchLayer = Backbone.View.extend({
			el : '.go_popup .content',
			events : {
				'click #detailSearchTermRadio input:radio[name=searchType]':'checkTerm',
				'click #searchSDate' : 'clickStartDateCalendarIcon',
				'click #searchEDate' : 'clickEndDateCalendarIcon',
				'keyup #boardDetailSearch input' : 'detailTitleKeyup'
			},
			_serializeObj : function(obj) {
				var str = [];
				for(var p in obj) {
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				}
				return str.join("&");
			},
			detailTitleKeyup : function(e){
				if(e.keyCode == 13){
					this.callback();
				}
			},
			clickEndDateCalendarIcon : function(){
				$('#searchEndDate').focus();
			},
			clickStartDateCalendarIcon : function(){
				$('#searchStartDate').focus();
			},
			initialize: function() {
				//console.log('detail search initialize');
				var tpltmpList = Tpldetail({lang:lang});
				this.$el.html(tpltmpList);	
				
				var searchStartDate = $("#searchStartDate");
				var searchEndDate = $("#searchEndDate"); 
				$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
				searchStartDate.datepicker({
		            //defaultDate: "+1w",
		            dateFormat : "yy-mm-dd",
		            changeMonth: true,
		            changeYear : true,
		            //numberOfMonths: 3,
		            yearSuffix: "",
		            onSelect: function( selectedDate ) {
		            	searchEndDate.datepicker( "option", "minDate", selectedDate );
		            }
		        });
				searchEndDate.datepicker({
		           // defaultDate: "+1w",
		            dateFormat : "yy-mm-dd",
		            changeMonth: true,
		            changeYear : true,
		            //numberOfMonths: 3,
		            yearSuffix: "",
		            onSelect: function( selectedDate ) {
		            	searchStartDate.datepicker( "option", "maxDate", selectedDate );
		            }
		        });
			},
			checkTerm : function(e){
				var radioVal = $(e.currentTarget).val(); 
					if(radioVal == "detail_term_custom"){
						$('#selectDirect').show();	
					}else{
						$('#selectDirect').hide();
					}
			},
			render: function(opt) {
								
				DeptList.render({
					id:"#detail_select_wrap",  		//target ID
					boardList:true,  		// 부서 셀렉트 박스 사용여부 (true/false)	
					selectClass:'detailSelect',
					allSelectUse:true,
					isCommunity:opt.isCommunity
				});
				this.isCommunity = opt.isCommunity;
				this.callback = opt.callback;
			}			
		});
		
		return {
			render: function(opt) {
				var detail = new detailSearchLayer();
				return detail.render(opt);
			}
		};
	});
}).call(this);