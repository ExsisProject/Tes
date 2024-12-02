define("works/components/filter/views/filter_condition_add_button", function(require) {
	var worksLang = require("i18n!works/nls/works");

	var FieldAddButtonTmpl = Hogan.compile([
        '<a class="btn_tool">',
        	'<span class="txt">',
        		'<span class="ic_txtPlus">+</span>',
        		'<strong>{{buttonText}}</strong>',
    		'</span>',
        '</a>'
    ].join(""));
	
	var FilterLayerView = require("works/components/filter/views/filter_condition_layer");
	
	return Backbone.View.extend({
		
		id : "fieldManager",
		className : "btn_submenu",
		
		initialize : function(options) {
			this.type = options.type || 'SELECT';
			this.buttonText = options.buttonText || worksLang["조건추가"];
			this.useCheckbox = options.useCheckbox !== false;
			this.$el.on('toggleField', _.bind(function(e, fieldModel) {
				this.$el.trigger('addCondition', fieldModel);
			}, this));
			this.$el.on('changeFilter', _.bind(function(e, isChecked) {
				if (isChecked) e.stopPropagation();
			}, this));
		},
		
		render : function() {
			this.$el.html(FieldAddButtonTmpl.render({
				buttonText: this.buttonText,
				cid : this.cid
			}));
			
			this._renderLayer();
			
			return this;
		},
		
		_renderLayer : function() {
			this.filterLayer = new FilterLayerView({
				type : this.type,
				parentCid : this.cid,
				collection : this.collection, // fields
				useCheckbox: this.useCheckbox
			});

			this.$el.attr("backdrop-toggle", true);
			this.filterLayer.linkBackdrop(this.$el);
			this.filterLayer.toggle(false);
			this.$el.append(this.filterLayer.render().el);
		}
	});
});