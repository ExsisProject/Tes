define([
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	
    "hgn!admin/templates/approval/appr_form_integration/appr_form_integration_input_requiredparams"
], 
function(
    commonLang,
    adminLang,
    approvalLang,
    
    InputRequiredParamsTpl
    
) {	
	var lang = {
			"값을 입력해 주세요" : commonLang["값을 입력해 주세요"],
			"추가" : commonLang["추가"],
			"이미 동일한 이름의 항목이 있습니다" : approvalLang["이미 동일한 이름의 항목이 있습니다"]
	}
	
	var InputRequiredParamsView = Backbone.View.extend({
		el : "#inputDirectAccessRequiredParams",
		initialize : function(options) {
			this.options = options || {};
			this.model = this.options.model;
		},
		
		events : {
			'click [name=inputRequiredParamsAdd]' : '_inputRequiredParamsAdd',
			'click .ic_del' : '_inputRequiredParamDelete'
			
		},
		
		getData : function(){
			var data = [];
			this.$('#inputRequiredParamsList li [name=inputRequiredParam]').each(function(idx, item){
				data.push($(item).attr('data-name'));
			});
			return {requiredParams : data};
		},
		
		render : function() {
			this.$el.html(InputRequiredParamsTpl({
				requiredParams: this.model.get('requiredParams'),
				lang: lang
			}));
		},
		
		_inputRequiredParamsAdd: function(){
			if($('#inputRequiredParamsAddNmae').val() == ""){
				$.goMessage(lang['값을 입력해 주세요']);
				return;
			}
			
			var result = true;
			var inputRequiredParamList = this.$('[name=inputRequiredParam]');
			_.each(inputRequiredParamList, function(item){
				if($(item).attr('data-name') == this.$('#inputRequiredParamsAddNmae').val()){
					result = false;
					return false;
				}
			});
			if(!result){
				$.goMessage(lang['이미 동일한 이름의 항목이 있습니다']);
				return false;
			}
			
			var html = ['<li>',
		            	'<span name="inputRequiredParam" data-name="'+ $('#inputRequiredParamsAddNmae').val() +'" class="name">'+ $('#inputRequiredParamsAddNmae').val() + '</span>',
	            		'<span class="btn_wrap"><span class="ic ic_del"></span></span>',
		            '</li>'];
				
			this.$('#inputRequiredParamsList').append(html.join(''));
			this.$('#inputRequiredParamsAddNmae').val('');
		},
		
		_inputRequiredParamDelete: function(e){
			var $target = $(e.target);
        	$($target).closest('li').remove();
		},
		
		
	});
			
	return InputRequiredParamsView;
});