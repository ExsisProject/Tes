define("system/views/board_company_share_layer",function(require){var e=require("jquery"),t=require("underscore"),n=require("backbone"),r=require("when"),i=require("system/views/system_board_circle"),s=require("board/constants"),o=require("board/components/board_tree/board_tree"),u=require("board/models/system_board_tree_node"),a=require("system/collections/companies"),f=require("hgn!system/templates/board_company_share_layer"),l=require("i18n!nls/commons"),c=require("i18n!admin/nls/admin"),h={save:l["\uc800\uc7a5"],cancel:l["\ucde8\uc18c"],share_range:c["\uacf5\uac1c \ubc94\uc704"],share_public:c["\uacf5\uac1c"],share_private:l["\ube44\uacf5\uac1c"]},p=n.View.extend({el:".layer_system_board .content",events:{"click input[name=share]:radio":"onClickShareRadio","change select#board-company-list":"onChangeCompanyList"},initialize:function(e){this.options=e||{},this.companies=e.companies||new a,this.layer=e.layer,this.shareBoardList=e.shares,this.toSelectCompanyId=e.toSelectCompanyId,this.toSelectBoardId=e.toSelectBoardId,this.companies.each(function(e){e.set("selected",!1)},this),this.toSelectCompanyId?this.companies.each(function(e){e["id"]==this.toSelectCompanyId&&e.set("selected",!0)},this):this.companies.length>0&&this.companies.first().set("selected",!0),this.activeBoardList=new u.Collection(null,{companyId:this.getSelectedCompanyId(),status:s.STATUS_ACTIVE,isAdminService:!0}),this.listenTo(this.activeBoardList,"sync",this._renderActiveBoardList),this.boardTreeConfigView=null},getSelectedCompanyId:function(){return this.companies.findWhere({selected:!0}).get("id")},getSelectedBoardId:function(){return this.selectedBoardId?this.selectedBoardId:!1},render:function(){this.initRender(),this._fetchAndRenderActiveBoardList()},onClickShareRadio:function(e){var t=this.$el.find("input[name=share]:radio:checked").val();t=="public"?(this.circleView.nodePickerView.$el.hide(),this.circleView.companyListView.$el.find('span[data-type="add"]').show(),this.circleView.companyListView.$el.find("#publicWritableAuthWrap").show()):(this.circleView.nodePickerView.$el.show(),this.circleView.companyListView.$el.find('span[data-type="add"]').hide(),this.circleView.companyListView.$el.find("#publicWritableAuthWrap").hide())},getData:function(){var e=this.circleView.getData(),n=[],r=e.nodes||[];t.each(r,function(e){e.actions=t.isArray(e.actions)?e.actions.join(","):e.actions,e.nodeCompanyId=parseInt(e.nodeCompanyId)},this);var i=t.uniq(t.pluck(r,"nodeCompanyId"));t.each(i,function(e){var i={};i.companyId=e,i.nodes=t.where(r,{nodeCompanyId:e}),n.push(i)},this);var s={shares:n,id:this.getSelectedBoardId()};return s},onChangeCompanyList:function(t){var n=e(t.currentTarget).find("option:selected").val();this.companies.each(function(e){e.get("id")==n?e.set("selected",!0):e.set("selected",!1)},this),this.activeBoardList.setCompanyId(n),this._fetchAndRenderActiveBoardList()},initRender:function(){this.$el.html(f({companies:this.companies.toJSON(),lang:h})),this.initCircleView()},initCircleView:function(t){this.circleView=null,this.$("#partPublicWrap").empty();var n=function(e){},r=this.$el.find("#board-company-list option:selected").val();this.circleView=new i({selector:"#partPublicWrap",isAdmin:!0,isWriter:!0,useAction:!0,circleJSON:{nodes:t?t:[]},withCompanies:!0,nodeTypes:["user","department","position","grade","duty","usergroup"],addCallback:e.proxy(n,this),companyIds:e.grep(this.companies.pluck("id"),function(e){return e!=r}),noSubDept:!1}),this.circleView.render(),this.$el.find("input[name=share]:radio:checked").trigger("click")},_convertBoardsAction:function(e){return e.map(function(e){e.isBoardNode()&&e.set("actions",{managable:!0})}),e},_fetchAndRenderActiveBoardList:function(){var e=this.activeBoardList;e.fetch({silent:!0,success:function(e){}})},_renderActiveBoardList:function(){var e=this.activeBoardList;this.boardTreeConfigView!==null&&(this.boardTreeConfigView.$el.empty(),this.boardTreeConfigView=null),this.boardTreeConfigView=this._createBoardTreeConfigView(e),e.length>0?this.toSelectBoardId?(this.boardTreeConfigView.$el.find('span.board_name[data-board-id="'+this.toSelectBoardId+'"]').trigger("click"),this.toSelectBoardId=null):this.boardTreeConfigView.$el.find("span.board_name").eq(0).trigger("click"):(this.selectedBoardId=!1,this.circleView.hideOrgSlide(),this.initCircleView([])),this.layer.reoffset()},_createBoardTreeConfigView:function(t){var n,r={};return t instanceof u.Collection&&(r.nodes=this._convertBoardsAction(t)),r.onClickBoardNodeCallBack=e.proxy(this.onClickBoardNodeCallBack,this),n=new o.BoardTreeSimpleView(r),n.setElement(this.$el.find("#board-tree-config")),n.render(),n},onClickBoardNodeCallBack:function(n,r,i){console.log("onClickBoardNodeCallBack call"),this.boardTreeConfigView.$el.find("div.item").removeClass("on"),e(r.currentTarget).closest("div.item").addClass("on"),this.selectedBoardId=i,this.circleView.hideOrgSlide();var s=[];this.shareBoardList.each(function(e){e.get("id")==this.selectedBoardId&&t.each(e.get("shares"),function(e){t.each(e.nodes,function(e){e.nodeType==="company"&&(e.nodeValue=""),s.push(e)})})},this),this.initCircleView(s)}});return p});