(function() {
define([
    "jquery",    
    "backbone",
    "hgn!approval/templates/side_favoriteform",
    "hgn!approval/templates/side_favoriteform_modify",
    "i18n!nls/commons",
    "i18n!approval/nls/approval"
], 

function(
	$, 
	Backbone, 
	layoutTpl,
	layoutModifyTpl,
	commonLang,
	approvalLang
) {
	var instance = null,
		lang = {
			'favorite' : commonLang['관심'],
			'favorite_title' : approvalLang['자주쓰는 양식'],
			'favorite_edit' : commonLang['편집'],
			'save' : commonLang['수정완료'],
			'collapse' : commonLang['접기'],
			'expand' : commonLang['펼치기'],
			'cancel' : commonLang['취소']
	};
	
	var SideFavoriteFormView = Backbone.View.extend({
		initialize : function(options) {
		    this.options = options || {};
		},
		el : '#favoriteSide',
		events: {
			'click span.ic_list_reorder' 	: 'favoriteSortable',
			'click span#reorderCancel' 		: 'reorderCancel',
			'mouseover ul>li ' 				: 'dragOver',
			'mouseout ul>li' 				: 'dragOut'
		},
		render : function(isModify) {
			if(this.options.data && this.options.data.length) {
				var tmpl = isModify ? layoutModifyTpl : layoutTpl;
				this.$el.html(tmpl({
					data : this.options.data, 
					lang : lang,
					isOpen : this.options.isOpen
				})).show();
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
	
	return {
		render: function(data) {
			instance = new SideFavoriteFormView(data);
			return instance.render();
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
}).call(this);