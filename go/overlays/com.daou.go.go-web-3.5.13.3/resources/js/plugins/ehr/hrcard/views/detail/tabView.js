define([
        "backbone",
        "app",
        "hrcard/helpers/tabTemplateHelper"
        ],
function(
		Backbone,
		GO,
		TabTemplateHelper,
		HrCardModel
		) {
	
	var BasicView = Backbone.View.extend({
		
		events : {
			"click div.viewForm span.txt"			: "modify",
		    "keypress input.w_max"					: "onKeypress",
		    "click div.viewForm td"					: "add",
		    "click div.viewForm span.ic_add"		: "addRow",
			"click div.viewForm span.ic_remove"		: "removeRow"			
		    	
		},
		
		initialize : function(options) {
			this.options = options || {};
       		this.userid = this.options.userid;
       		this.tabType = this.options.tabType;
       		this.data = this.options.data;
       		this.editable = this.options.editable;
       		
		},
		
		render : function() {
			
			var template = TabTemplateHelper.getTemplate(this.tabType,this.editable,this.data);
			
			this.$el.html(template);
			
			//row의 마지막이 아닐경우 + 버튼을 지워준다.
			this.$el.find("tr.dataRow:not(:last) td.modify span.ic_add").hide();
			
			this.initDatepicker();
			
			return this;
		},
		
		// DatePicker 설정
		initDatepicker : function() {
			$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
			_.each(this.$el.find('span.wrap_date input'), function(k, v) {
				$(k).datepicker({
					dateFormat: "yy-mm-dd", 
					changeMonth: true,
					changeYear: true,
					yearRange: 'c-80:c+10',
					yearSuffix: ""
				});
			});
			
		},
		
		// 수정모드 변경
		modify : function(e) {
			if(!this.editable || $(e.currentTarget).hasClass("hide")){
				return;
			}
			var $targetEl = $(e.currentTarget).closest('td');
			$targetEl.children().toggle();
			$targetEl.find('input').focus();
		},
		// 데이터가 없을때 TD만 클릭해도 수정모드로 변경
		add : function(e) {
			var $targetEl = $(e.currentTarget);
			var inputEl = $targetEl.find('input.w_max');
			if((inputEl.length) > 0 && !inputEl.is(":visible")) {
				$targetEl.children().toggle();
				$targetEl.find('input.w_max').focus();
			}
		},
		// 수정모드에서 Enter Event
		onKeypress : function(e) {
			var $targetEl = $(e.currentTarget).closest('td');
			if(e.keyCode == 13) {
				$targetEl.find('span').text($(e.currentTarget).val());
				$targetEl.children().toggle();
			}
		},
		
		addRow : function(e) {
			$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
			var $targetEl = $(e.currentTarget).closest('tr');
			var $cloneEl = $targetEl.clone();			

			$targetEl.find('span.ic_add').remove();
			$cloneEl.attr('data-id', '');
			_.each($cloneEl.find('td'), function(k, v) {
				if(v == 0) {
					$(k).text(Number($(k).text()) + 1);
				} else {
					$(k).find('input').val('').hide();
					$(k).find('span.txt:not(.hide)').text('').show();
					$(k).find('span.wrap_date input').attr('id', '').removeClass('hasDatepicker').removeData('datapicker').show().unbind();
				}
			});			
			$targetEl.closest('table').append($cloneEl);
			this.initDatepicker($cloneEl);
		},

		removeRow : function(e) {
			
			var $targetEl = $(e.currentTarget).closest('tr');
			var tableEl =  $(".type_list_box").eq(1);//$(e.currentTarget).closest('table');
			// 선택한 행 삭제
			// 첫째행은 남겨두고 데이터만 삭제.
			if($targetEl.parent().find('tr').size() == 2) {
				_.each($targetEl.find('td'), function(k, v) {
					if(v != 0) {
						$(k).find('input').val('');
						$(k).find('span.txt').text('');
					}
				})
			} else {
				// 중간에 삭제했을 경우. 
				if(!$targetEl.next().is('tr')) {
					$targetEl.prev().find('td:last').append('<span class="ic_con ic_add"></span>');
				} 
				$targetEl.remove();
				// 채번 다시..
				
				
				$.each($(tableEl).find('tr'), function(i, item) {
					
					if(i > 0) {
						
							$(item).find('td').eq(0).html(i);

					}
				})
			}
		}
	});
	
	return BasicView;
	
});