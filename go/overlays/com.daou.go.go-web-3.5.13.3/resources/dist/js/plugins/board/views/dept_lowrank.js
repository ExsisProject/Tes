(function(){define(["jquery","backbone","app","board/views/board_title","board/collections/board_menu_target_lowrank","hgn!board/templates/dept_lowrank","i18n!nls/commons","i18n!board/nls/board","jquery.go-grid","GO.util"],function(e,t,n,r,i,s,o,u){var a=null,f={dept_low_rank:u["\ud558\uc704\ubd80\uc11c \uac8c\uc2dc\ud310 \uc870\ud68c"],dept_low_rank_all:u["\ud558\uc704\ubd80\uc11c \uc804\uccb4"],dept_name:u["\ubd80\uc11c\uba85"],board_name:o["\uac8c\uc2dc\ud310"],board_manager:u["\uc6b4\uc601\uc790"],board_post_count:u["\uac8c\uc2dc\uae00 \uc218"],board_created_at:u["\uac1c\uc124\uc77c"],board_setting:o["\uc124\uc815"],board_public:o["\ube44\uacf5\uac1c"],board_list_null:u["\ub4f1\ub85d\ub41c \uac8c\uc2dc\ud310\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."],normal:o["\uc815\uc0c1"],stop:o["\uc911\uc9c0"]},l=t.View.extend({initialize:function(){this.$el.off(),this.targetMeuCollction=null,this.type="ACTIVE"},events:{"change select#lowDeptSelect":"deptFilter","click #tabMenu li":"changeTab"},render:function(){return this.$el.html(s({lang:f})),this.renderList(),r.render({el:".content_top",dataset:{name:f.dept_low_rank}}),this.el},renderList:function(){var t=this,r=n.router.getSearch(),i=GO.contextRoot+"api/department/lowrank/board/"+this.type;this.boardList=e.goGrid({el:"#lowRankList",url:i,bDestroy:!0,defaultSorting:[[0,"asc"]],emptyMessage:f.board_list_null,columns:[{mData:"deptName",sWidth:"200px",bSortable:!0},{mData:"name",sClass:"align_l",bSortable:!0,fnRender:function(e){var t=['<a href="'+GO.contextRoot+"app/board/"+e.aData.id+'">'];return e.aData.publicFlag&&t.push('<span class="ic_classic ic_lock" title="'+f.board_public+'"></span>&nbsp;'),t.push(e.aData.name,"</a>"),t.join("")}},{mData:null,bSortable:!1,fnRender:function(t){var n=[];return e(t.aData.managers).each(function(e,t){n.push(t.name+t.positionName)}),n.join(", ")}},{mData:"postCount",sWidth:"100px",bSortable:!0},{mData:"createdAt",sWidth:"150px",bSortable:!0,fnRender:function(e){return GO.util.basicDate(e.aData.createdAt)}},{mData:null,sWidth:"70px",bSortable:!1,fnRender:function(e){var t=['<span class="btn_border">','<a href="'+GO.contextRoot+"app/board/"+e.aData.id+'/admin" title="'+f.board_setting+'">','<span class="ic_classic ic_setup"></span>',"</a>","</span>"];return t.join("")}}],fnDrawCallback:function(e,n,r){t.$el.find("select#lowDeptSelect").length||t.renderTargetMenu()}})},renderTargetMenu:function(){var t=['<select id="lowDeptSelect" style="margin-top:2px">','<option value="">',f.dept_low_rank_all,"</option>"],n=[];this.targetMeuCollction==null&&(this.targetMeuCollction=i.getCollection()),n=this.targetMeuCollction.toJSON(),e(n).each(function(e,n){t.push('<option value="'+n.id+'">');for(var r=0;r<n.depth;r++)t.push("-");t.push(n.name+"</option>")}),this.$el.find(".tool_bar .custom_header").html(t.join(""))},deptFilter:function(t){var n=e(t.currentTarget).val(),r=GO.contextRoot+"api/department/lowrank/board/"+this.type+"?deptId="+n;this.boardList.tables.fnSettings().sAjaxSource=r,this.boardList.tables.fnDraw(this.boardList.tables.fnSettings())},changeTab:function(t){var n=e(t.currentTarget);n.parents("ul:first").find("li").removeClass("active"),n.addClass("active"),this.type=n.attr("data-type"),this.renderList()}});return{render:function(e){a=new l({el:"#content"}),a.render()}}})}).call(this);