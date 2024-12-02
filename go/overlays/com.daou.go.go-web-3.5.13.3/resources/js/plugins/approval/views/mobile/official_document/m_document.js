define([
    "jquery",
    "backbone",
    "hogan",
    
    "hgn!approval/templates/mobile/official_document/m_document",

	'formutil',
    "jquery.go-popup",
    "jquery.ui",
    "iscroll"
],
function(
	$,
	Backbone,
    Hogan,
    
	DocumentTpl
) {
	var lang = {
			
		};

	var DocumentView = Backbone.View.extend({
		initialize : function(options){
			this.options = options || {};
		    this.model = options.model;
			_.bindAll(this, 'render');
			
			this.title = this.options.title,
			this.docModel = this.options.model;
		},
		events : {
			
		},

		render: function() {
			this.setDocVariables();
			this.$el.html(DocumentTpl({
				 lang : lang
			}));
			this.docContents = $('#document_content');
			GO.util.store.set('document.docMode',"VIEW",{type : 'session'});
			var content = $.goFormUtil.convertViewMode(GO.util.escapeXssFromHtml(this.docModel.get('officialBody')));
			this.docContents.html(content);
		},
		setDocVariables: function() {
			GO.util.store.set('document.variables',this.docModel.variables,{type : 'session'});
		}
		
	});

	return DocumentView;
});