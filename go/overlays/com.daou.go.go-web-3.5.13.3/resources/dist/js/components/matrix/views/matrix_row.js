define(function(require){var e=require("backbone"),t=require("matrix/views/matrix_item");return e.View.extend({className:"_wrap_schedule_tiem",attributes:{"data-matrix-row":""},initialize:function(e){this.matrix=e.matrix,this.items=this.model.get("values"),this.items.setOverlapIndex(),this.$el.attr("data-row-key",this.model.get("rowKey"))},render:function(){return this._renderItems(),this._setHeight(),this},_renderItems:function(){this.items.each(function(e){var n=new t({matrix:this.matrix,model:e});this.$el.append(n.render().el)},this)},_setHeight:function(){var e=2,t=this.matrix.get("itemHeight")*this.items.overlapCount(),n=this.matrix.get("minRowHeight");t<n&&(t=n),this.$el.css("height",t+e)}})});