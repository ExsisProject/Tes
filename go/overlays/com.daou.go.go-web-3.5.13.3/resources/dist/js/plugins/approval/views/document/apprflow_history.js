define(["jquery","underscore","backbone","hgn!approval/templates/document/apprflow_history","hgn!approval/templates/document/apprflow_history_view","i18n!nls/commons","i18n!approval/nls/approval"],function(e,t,n,r,i,s,o){var u={"\ubcc0\uacbd\uc774\ub825\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.":o["\ubcc0\uacbd\uc774\ub825\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],"\ubcf4\uae30":o["\ubcf4\uae30"]},a=n.View.extend({tagName:"div",className:"aside_wrapper_body",initialize:function(e){this.options=e||{},this.flowHistories=this.options.apprFlowHistories},render:function(){var e=t.map(this.flowHistories,function(e){var t=e.modifier;return{date:GO.util.basicDate3(e.createdAt),modifier:t.name+" "+t.position,version:e.version}}),n=0;return this.$el.html(r({index:function(){return n++},flowHistories:e,lang:u})),this},showApprChangeLog:function(t){var n=e(t.currentTarget),r=e(n).parent().find("[data-index]").attr("data-index");if(e(n).hasClass("ic_open")){e(n).removeClass("ic_open").addClass("ic_close"),e(n).attr("title",o["\ub2eb\uae30"]);var s=i({lang:u,flowHistoriesView:this.flowHistories[r].apprActivites,index:function(){return this.seq+1}});e(n).parent().closest("tr").after(s)}else e(n).removeClass("ic_close").addClass("ic_open"),e(n).attr("title",o["\ubcf4\uae30"]),e(n).closest("tr").next().remove()}});return a});