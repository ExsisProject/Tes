define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!approval/templates/share_doc_folder",
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	_, 
	Backbone, 
	ShareDocFolderTpl,
    commonLang,
    approvalLang
) {
	var docIds;
	
	var ShareDocFolderView = Backbone.View.extend({
		
		el : ".layer_doc_type_select .content",
		
		initialize: function(options) {
		    this.options = options || {};
		},
		events: {
			'click span.txt' : 'selectFolder'
		},
		render: function() {
			var lang = {
				'문서 이동' : approvalLang['문서 이동'],
				'문서함이 없습니다' : approvalLang['문서함이 없습니다']
			};
			
			var dataset = this.collection.toJSON();
			
			var tpl = ShareDocFolderTpl({
				lang: lang,
				dataset : dataset
			});
			
			this.$el.html(tpl);
		},
		
		selectFolder: function(e){
			var selectedEl = $(e.currentTarget).parents('p.folder');
			this.$el.find('.on').removeClass('on');
			selectedEl.addClass('on');
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
		
	});
	
	return ShareDocFolderView;
});