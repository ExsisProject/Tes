define("components/select/views/select",function(require){var e=require("components/select/views/select_layer"),t=Hogan.compile(['<a class="btn_tool">','<span class="ic ic_mapping_s"></span>','<span class="txt">{{buttonText}}</span>','<span class="ic ic_arrow_type3"></span>',"</a>"].join(""));return Backbone.View.extend({className:"btn_submenu",initialize:function(e){this.labelKey=e.labelKey,this.valueKey=e.valueKey,this.iconPathKey=e.iconPathKey,this.useScroll=e.useScroll,this.useCheckbox=e.useCheckbox===!1?!1:!0,this.buttonText=e.buttonText},render:function(){return this.$el.html(t.render({buttonText:this.buttonText})),this._renderLayer(),this},_renderLayer:function(){this.layerView=new e({useScroll:this.useScroll,useCheckbox:this.useCheckbox,valueKey:this.valueKey,iconPathKey:this.iconPathKey,labelKey:this.labelKey,collection:this.collection}),this.$el.attr("backdrop-toggle",!0),this.layerView.linkBackdrop(this.$el),this.layerView.toggle(!1),this.$el.append(this.layerView.render().el)}})});