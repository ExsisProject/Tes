define([
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_output_appointeditem"
], 
function(
    commonLang,
    adminLang,
    approvalLang,
    
    OutputAppointedItemTpl
    
) {	
	var lang = {
			"값을 입력해 주세요" : commonLang["값을 입력해 주세요"],
			"추가" : commonLang["추가"],
			"이미 동일한 이름의 항목이 있습니다" : approvalLang["이미 동일한 이름의 항목이 있습니다"]
	}
	
	var OutputAppointedItemView = Backbone.View.extend({
		el : "#outputDataAppointedItem",
		initialize : function(options) {
			this.options = options || {};
			this.model = this.options.model;
		},
		
		events : {
			'click [name=outputAppointedItemAdd]' : '_outputAppointedItemAdd',
			'click .ic_del' : '_outputAppointedItemDelete'
			
		},
		
		getData : function(){
			var data = [];
			this.$('#outputAppointedItemList li [name=outputAppointedItem]').each(function(idx, item){
				data.push($(item).attr('data-name'));
			});
			return {customReturnedVariables : data};
		},
		
		render : function() {
			this.$el.html(OutputAppointedItemTpl({
				customReturnedVariables: this.model.get('customReturnedVariables'),
				lang: lang
			}));
		},
		
		_outputAppointedItemAdd: function(){
			if($('#outputAppointedItemAddNmae').val() == ""){
				$.goMessage(lang['값을 입력해 주세요']);
				return;
			}
			
			var result = true;
			var outputAppointedItemList = this.$('[name=outputAppointedItem]');
			_.each(outputAppointedItemList, function(item){
				if($(item).attr('data-name') == this.$('#outputAppointedItemAddNmae').val()){
					result = false;
					return false;
				}
			});
			if(!result){
				$.goMessage(lang['이미 동일한 이름의 항목이 있습니다']);
				return false;
			}
			
			var html = ['<li>',
		            	'<span name="outputAppointedItem" data-name="'+ $('#outputAppointedItemAddNmae').val() +'" class="name">'+ $('#outputAppointedItemAddNmae').val() + '</span>',
	            		'<span class="btn_wrap"><span class="ic ic_del"></span></span>',
		            '</li>'];
				
			this.$('#outputAppointedItemList').append(html.join(''));
			this.$('#outputAppointedItemAddNmae').val('');
		},
		
		_outputAppointedItemDelete: function(e){
			var $target = $(e.target);
        	$($target).closest('li').remove();
		},
		
		
	});
			
	return OutputAppointedItemView;
});