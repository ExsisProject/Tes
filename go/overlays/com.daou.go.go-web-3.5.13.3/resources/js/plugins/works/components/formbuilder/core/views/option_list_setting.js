define('works/components/formbuilder/core/views/option_list_setting', function(require) {

	var Backbone = require('backbone');
	var Hogan = require('hogan');
	var optionListSettingTpl = require('text!works/components/formbuilder/core/templates/option_list_setting.html');

	var mainTemplate = Hogan.compile('{{#model.items}}{{> optionItemList}}{{/model.items}}');

	var worksLang = require("i18n!works/nls/works");
	var commonLang = require('i18n!nls/commons');
	var CONSTANTS = require('works/constants/works');

	var lang = {
		"remove" : commonLang["삭제"],
	};

	var renderOptionItem = function() {
		var compiled = Hogan.compile(optionListSettingTpl);
		return compiled.render.apply(compiled, arguments);
	};

	var SELECTOR_DEFAULTVALUE = 'input[name=defaultValue]';
	var SELECTOR_DISPLAYTEXT = 'input[name=displayText]';
	var TYPE_CHECKBOX = 'checkbox';
	var TYPE_RADIO = 'radio';
	var REQUIRED_VAL = CONSTANTS.WORKS_COMPONENTS.WORKS_REQUIRED_VAL;

	require('jquery.ui');

	/**
	 * 폼 컴포넌트의 속성창에 세부항목 설정에 대한 공통 뷰 처리
	 *
	 * TODO: react.js 처럼 이것을 컴포넌트 개념으로 가져가야 하는데,
	 * 이미 DO에서 컴포넌트의 개념을 쓰고 있어서 정리가 힘듬. 개념 정리부터 필요함.
	 *
	 * [ 참고 ]
	 * this.model: ComponentPropertyModel임
	 */
	var OptionListSettingView = Backbone.View.extend({
		tagName: 'ul',
		className: 'tool_attr_list',

		/**
		 * 체크박스 타입: radio|checkbox
		 */
		checkType: TYPE_RADIO,

		events: {
        	"keyup input[name=displayText]": "_resetModel",
        	"click .ic_remove": "_deleteOptionItem",
        	"click input[name=defaultValue]": "_resetModel"
        },

        initialize: function(options) {
        	this.checkType = (options || {}).checkType || TYPE_RADIO;
        },

        render: function() {
        	this.$el.html(mainTemplate.render({
        		checkType: this.checkType,
        		model: this.model.toJSON(),
        		lang: lang,
        		isDisabled : function(){
        			return this.value == REQUIRED_VAL ? true : false
        		}
        	}, {
        		"optionItemList": optionListSettingTpl
        	}));

        	this._initOptionListItem();
        },

        addOptionItem : function() {
			var max, value;
			var $items = this.$('input[name="defaultValue"]');
			if ($items.length) {
				max = _.max($items, function(input) {
					return $(input).val();
				});
				value = parseInt($(max).val()) + 1;
			} else {
				value = 0;
			}

    		this.$el.append(renderOptionItem({
    			displayText: worksLang["옵션"],
        		checkType: this.checkType,
    			value: value,
    			lang : lang
    		}));

        	this._resetModel();
        },
        
        checkRequireOptionItem : function(isChecked){
        	
        	if(isChecked && $('input[name=defaultValue][value='+REQUIRED_VAL+']').length < 1){
        		this.$el.prepend(renderOptionItem({
        			displayText: worksLang['선택안함'],
            		checkType: this.checkType,
        			value: REQUIRED_VAL,
        			lang : lang,
        			isDisabled : true
        		}));
        	}
        	
        	this._forcedOptionCheck();
        	this._resetModel();
        },

        _initOptionListItem: function() {
        	var self = this;
        	var sortItems = 'li';

        	this.$el.sortable({
        		"items": sortItems,
        		"handle": '.drag-handler',
        		"stop": function(event, ui) {
        			self._resetModel();
        		}
        	});
        },

        _resetModel: function() {
        	var itemList = [];
        	this.$('li').each(function() {
				var $defaultValue = $(this).find(SELECTOR_DEFAULTVALUE).first();
				var $displayText = $(this).find(SELECTOR_DISPLAYTEXT).first();
				itemList.push({"value": $defaultValue.val(), "displayText": $displayText.val(), "selected": $defaultValue.is(':checked')})
			});
			this.model.set('items', itemList);
			this.model.trigger('change');
        },

        _deleteOptionItem : function(e) {
        	var $li = $(e.currentTarget).closest('li');
        	
        	//필수입력항목이 체크되어 있을때
        	if($('#required').is(':checked')){
        		
        		//선택하세요.(옵션) 은 삭제할 수 없다.
        		if($li.find('input[name=defaultValue]').val() == REQUIRED_VAL){
	        		$.goSlideMessage(worksLang['필수 입력 항목 삭제 오류']);
        			return;
        		}
        		
        		//선택하세요.(옵션)을 제외한 마지막 옵션은 삭제할 수 없다.
        		if($('input[name=defaultValue][value!='+REQUIRED_VAL+']').length < 2){
        			$.goSlideMessage(worksLang['마지막 옵션 삭제 오류']);
            		return;
        		}
        		
        	}
        	
        	//필수입력항목이 체크되어 있지 않을때
        	if(!$('#required').is(':checked')){
        		
        		//선택하세요(옵션)이 포함되어 있고 마지막 남은 다른 옵션을 삭제하려했을때
        		if($('input[name=defaultValue][value='+REQUIRED_VAL+']').length > 0 
        				&& $('input[name=defaultValue][value!='+REQUIRED_VAL+']').length < 2
        				&& $li.find('input[name=defaultValue]').val() != REQUIRED_VAL){
        			$.goSlideMessage(worksLang['마지막 옵션 삭제 오류']);
        			return;
        		}
        		
        		//선택하세요(옵션)이 포함안되어 있고 마지막남은 옵션을 삭제하려했을때.
        		if($('input[name=defaultValue][value='+REQUIRED_VAL+']').length < 1
        				&& $('input[name=defaultValue][value!='+REQUIRED_VAL+']').length < 2){
        			$.goSlideMessage(worksLang['마지막 옵션 삭제 오류']);
        			return;
        		}
        		
        	}
        	
    		$li.remove();
    		this._forcedOptionCheck();
    		this._resetModel();
        },
        
        _forcedOptionCheck : function(){        	
        	var isCheck = $('input[name=defaultValue]').is(':checked');
        	
        	//세부항목을 삭제할때
        	//라디오 이고 필수입력항목이 아닐때는 구지 라디오버튼 디폴트 선택 안되어도 된다.
        	if(!isCheck){
        		this.$el.find('li:first input[name=defaultValue]').attr("checked","checked").trigger('click');
        	}
        }
	});

	OptionListSettingView.TYPE_CHECKBOX = TYPE_CHECKBOX;
	OptionListSettingView.TYPE_RADIO = TYPE_RADIO;

	return OptionListSettingView;
});