// 공지 레이어
(function() {
	define([
	    // libraries...
	    "jquery",
	    "backbone", 	
	    "app",
	    "hgn!board/templates/notice_layer",
	    "i18n!board/nls/board",
	    
	], 
	function(
		$,
		Backbone,
		App, 
		Tplnotice,
		boardLang
	) {
		var lang = {
				'oneWeek' : boardLang['1주 동안'],
				'twoWeek' : boardLang['2주 동안'],
				'oneMonth' : boardLang['1달 동안'],
				'twoMonth' : boardLang['2달 동안'],
				'eternal' : boardLang['무기한 공지'],
				'customTerm' : boardLang['사용자 기간설정']	
		};
		
		var noticeLayer = Backbone.View.extend({
			el : '.go_popup .content',
			initialize: function() {
				var tpltmpList = Tplnotice({lang:lang});
				this.$el.html(tpltmpList);		
				
				var noticeStartDate = $("#noticeStartDate");
				var noticeEndDate = $("#noticeEndDate");
				
				
				noticeStartDate.datepicker({
					//minDate : "today",
		            //defaultDate: "+1w",
		            dateFormat : "yy-mm-dd",
		            changeMonth: true,
		            changeYear : true,
		            //numberOfMonths: 3,
		            yearSuffix: "",
		            onSelect: function( selectedDate ) {
		            	console.log(selectedDate);
		            	noticeEndDate.datepicker( "option", "minDate", selectedDate );
		            }
		        });
				noticeEndDate.datepicker({
					//minDate : "today",
		            //defaultDate: "+1w",
		            dateFormat : "yy-mm-dd",
		            changeMonth: true,
		            changeYear : true,
		            //numberOfMonths: 3,
		            yearSuffix: "",
		            onSelect: function( selectedDate ) {
		            	noticeStartDate.datepicker( "option", "maxDate", selectedDate );
		            }
		        });
				
			},
			events : {
				'click .option_wrap input:radio[name=noticeTerm]':'checkTerm',
				'click span#noticeStartDateIcon' : 'noticeStartDateIcon',
				'click span#noticeEndDateIcon' : 'noticeEndDateIcon'
			},
			noticeStartDateIcon : function(){
				$('#noticeStartDate').focus();
			},
			noticeEndDateIcon : function(){
				$('#noticeEndDate').focus();
			},
			checkTerm : function(e){
				var radioVal = $(e.currentTarget).val(); 
				if(radioVal == "custom"){
					$('#noticeCustomTerm').show();	
				}else{
					$('#noticeCustomTerm').hide();
				}
			},
			render: function() {
								
			}			
		});
		
		return {
			render: function(boardId) {
				var notice = new noticeLayer();
				return notice.render();
			}
		};
	});
}).call(this);