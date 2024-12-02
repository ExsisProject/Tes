define('works/views/app/workflow_stat_item', function(require) {
	// dependency
	var adminLang = require("i18n!admin/nls/admin");
	var commonLang = require('i18n!nls/commons');
	var ItemTpl = require('hgn!works/templates/app/workflow_stat_item');
	var worksLang = require("i18n!works/nls/works");
	var ColorPicker = require("calendar/views/color_picker");
	
	var lang = {
			"color": commonLang["색상"],
			"statusName": adminLang["상태명"],
			"add" : commonLang["추가"],
			"edit" : commonLang["수정"],
            "color_config" : commonLang["색상 변경"],
			"inputTag" : worksLang['상태명을 입력하세요.'],
			"상태변경": worksLang["상태변경"],
	};
	
	var StatItemView = Backbone.View.extend({
		initialize : function(options) {
			this.options = options || {};
			this.graph = options.graph;
			this.model = options.model;
			this.stats = options.stats;
			this.setColor = options.setColor;
		},
		
		events : {
			'focusout input[name="statName"]' : 'onChangeStatName',
			'click span[id="stateColor"]' : "toggleColorPickerByWorks",
			"click input[type=checkbox]" : "setEndState"
		},
		
		onChangeStatName : function(e){
			var afterName = $(e.currentTarget).val();
			var beforeName = this.model['name'];
			
			var isValidStatName = this.isValidStatName(beforeName, afterName);
			if(!isValidStatName){
				$.goError(commonLang['이미 사용중인 이름입니다.']);
				this.$el.find('input[name="statName"]').val(beforeName);
				return false;
			}
 
			this.model['name'] = afterName;
			this.trigger('changeStatName', beforeName, afterName);
		},
		
		isValidStatName : function(beforeName, afterName){
			if(_.isEqual(beforeName, afterName)){
				return true;
			}else{
				for (var i=0; i<this.stats.length; i++) {
					if (afterName == this.stats[i].getAttribute('name')) {
						return false;
					}
				}
				return true;
			}
		},
		
		render : function() {
			this.$el.html(ItemTpl({lang : lang, data : this.model}));
			this.$el.attr("data-type", "stat");
			this.$el.find('span[id="stateColor"]').addClass("bgcolor" + this.model['color']);
			this.$el.on("changed:chip-color.works", ".chip", $.proxy(this.onChangeStateColor, this));
			return this;
		},
		
		setEndState : function(e) {
			var target = $(e.currentTarget);
			var isEndState = target.is(":checked");

			this.model['end'] = isEndState;
			console.log(this.model['name']+ " => " + this.model['end']);
		},
		
		toggleColorPickerByWorks: function(e) {
			var notUseStatus = $('#notUseProcess').is(':checked');
			if(!notUseStatus) {
				ColorPicker.show(e.target, 'works');
			}
        },
        
        onChangeStateColor: function(e, newCode, type) {
            var target = e.target;
            var cell = this.graph.getSelectionCell();

            this.model['color'] = newCode;
            this.resetStateColor(target, newCode);

			var model = this.graph.getModel();
			model.beginUpdate();
			model.execute(new mxCellAttributeChange(cell, 'color', newCode));
			model.endUpdate();

			this.setColor(cell);
        },
        
        resetStateColor: function(target, newCode) {
            $(target).attr("class", "chip");
            $(target).addClass("bgcolor" + newCode);
            return this;
        }   
        
	});
	
	return StatItemView;
});