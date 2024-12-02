
define([ 
    "jquery",
    "backbone",
    
    "views/mobile/layer_toolbar",
    
    "hgn!approval/templates/mobile/official_document/m_action_document",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval"
], 
function(
	$, 
	Backbone,
	
	LayerToolbarView,
	
	DocumentActionTpl,
	
    commonLang,
    approvalLang
) {
	var lang = {
			"취소" : commonLang['취소'],
			"승인" : approvalLang['승인'],
			"결재 의견 등록 양식" : approvalLang['승인 의견 등록 양식'],
		    "의견을 작성해 주세요" : approvalLang['의견을 작성해 주세요'],
	};
	var DocumentActionView = Backbone.View.extend({
		title : '',
		buttons : [],
		initialize : function(options){
			_.bindAll(this, 'render');
		    this.options = options || {};
		    this.toolBarData = this.options.toolBarData;
		    if(_.isArray(this.options.buttons)){
		    	this.buttons = this.options.buttons; 
		    };
		},
		events: {
			"keyup textarea" : "_expandTextarea"
		},
		render: function() {
			var tpl;
			this.layerToolbarView = LayerToolbarView;
			this.layerToolbarView.render(this.toolBarData);
			this.$el.html(DocumentActionTpl({
				header : this.options.header,
				lang : lang
			}));
		},
		_expandTextarea : function(e) {
		    GO.util.textAreaExpand(e);
		},
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	
	return DocumentActionView;
});