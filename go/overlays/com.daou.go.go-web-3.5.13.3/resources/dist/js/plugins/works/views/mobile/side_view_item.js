define("works/views/mobile/side_view_item",function(require){var e=require("backbone"),t=require("hogan"),n=t.compile('<a name="sideViewItem" keyword="{{model.keyword}}">{{model.\ub9ac\ud3ec\ud2b8}}</a>'),r=e.View.extend({tagName:"li",initialize:function(e){this.options=e||{},this.model=e.model,this.className=e.className},render:function(){return this.$el.html(n.render({model:this.model,className:this.className})),this}});return r});