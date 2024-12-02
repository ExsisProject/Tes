define(function(require) {
	var $ =  require("jquery");    
	var Backbone =  require("backbone");
	var layoutTpl = require("hgn!board/templates/side_favorite");
	var layoutModifyTpl =require("hgn!board/templates/side_favorite_modify");
	var commonLang = require("i18n!nls/commons");

	require("jquery.ui");
	
	var lang = {
		'favorite' : commonLang['관심'],
		'favorite_title' : commonLang['즐겨찾기'],
		'favorite_edit' : commonLang['편집'],
		'favorite_edit_title' : commonLang['즐겨찾기 편집'],
		'save' : commonLang['수정완료'],
		'collapse' : commonLang['접기'],
		'expand' : commonLang['펼치기'],
		'cancel' : commonLang['취소']
	};
	
	var SideFavorite = Backbone.View.extend({
		el : '#favoriteSide',
		events: {
			'click span.ic_list_reorder' 	: 'favoriteSortable',
			'click span#reorderCancel' : 'reorderCancel',
			'mouseover ul>li ' 	: 'dragOver',
			'mouseout ul>li' 		: 'dragOut'
		},
		initialize: function(options) {
			this.options = options || {};
		},
		render : function(isModify) {
			if(this.options.data && this.options.data.length) {
				var tmpl = isModify ? layoutModifyTpl : layoutTpl;
				this.$el.html(tmpl({
					data : this.options.data,
					isOpen : this.options.isOpen,
					lang : lang})).show();
			} else {
				this.$el.hide();
			}
		},
		favoriteSortable : function() {
			this.render(true);
			this.$el.addClass('lnb_edit').sortable({
				items : 'li',
				opacity : '1',
				delay: 100,
				cursor : 'move',
				hoverClass: 'move',
				containment : '#favoriteSide',
				forceHelperSize : 'true',
				helper : 'clone',
				placeholder : 'ui-sortable-placeholder'
			}).sortable('enable');
		},
		reorderCancel : function() {
			this.$el.removeClass('lnb_edit').sortable('disable');
			this.render();
		},
		dragOver : function(e) {
			$(e.currentTarget).addClass('move');
		},
		dragOut : function(e) {
			$(e.currentTarget).removeClass('move');
		}
	});
	
	var instance = null;
	return {
		/**
		 * @Deprecated 삭제 예정
		 */
		render: function(data) {
			instance = new SideFavorite(data);
			return instance.render();
		},
		
		attachTo: function(el, options) {
			var view = new SideFavorite(options);
			view.setElement(el);
			view.render();

			// 과거 호환용 코드(GO-19869)
			instance = view;
			return view;
		},
		getReorderIds : function() {
			var reorderIds = [];
			instance.$el.find('li').each(function(k,v) {
				reorderIds.push($(v).attr('data-id'));
			});
			return reorderIds;
		},
		destroySortable : function() {
			instance.$el.removeClass('lnb_edit').sortable('destroy');
		}
	};
});