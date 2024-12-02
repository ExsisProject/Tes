define('docs/views/mobile/side_item', function(require) {
	
	var Backbone = require('backbone');
	var Hogan = require('hogan');

	var SideItemTmpl = Hogan.compile(
        '<p class="title">' +
            '<a {{^isAccessible}}class="disable"{{/isAccessible}}>' +
                '<span {{#isAccessible}} data-id="{{model.id}}" {{/isAccessible}} name="sideItem" class="btn_wrap">' +
                    '{{^root}}' +
                    '<span class="ic ic_root"></span>' +
                    '{{/root}}' +
                    '<span class="ic_side {{className}}"></span>' +
                    '<span class="txt_ellipsis">{{model.name}}</span>' +
                    '{{#isNew}}' +
                    '<span class="ic ic_new"></span>' +
                    '{{/isNew}}' +
                '</span>' +
            '</a>' +
        '</p>'
	);
	
	var SideItemView = Backbone.View.extend({
		tagName : "li",
		
		initialize : function(options) {
			this.options = options || {};
			this.model = options.model;
			this.root = options.root;
            this.depth = options.depth;
			this.className = options.className;
		},
		
		render : function() {
			this.$el.html(SideItemTmpl.render({
				model : this.model.toJSON(),
                isAccessible : this.model.isReadable() && this.model.getState() == "NORMAL",
                isNew : this.isNew(this.model.get("lastDocsCompleteDate")),
                root : this.root,
				className : this.className
			}));
            this.$(".title").wrap(this.getWrapperTag());
			return this;
		},

        getWrapperTag : function(){
            var wrap = "";
            for(var i = 0; i < this.depth; i++){
                wrap = "<ul><li>" + wrap + "</li></ul>";
            }
            return wrap;
        },

        isNew : function(date) {
            return date ? GO.util.isCurrentDate(date, 1) : false;
        }
	});
	return SideItemView;
});