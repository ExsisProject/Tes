define(["jquery","backbone","app","i18n!nls/commons","i18n!admin/nls/admin","hgn!admin/templates/board_statistics_dept","hgn!admin/templates/board_null","i18n!admin/nls/admin","jquery.go-sdk","jquery.go-popup","jquery.go-grid","jquery.ui","GO.util","jquery.go-validation"],function(e,t,n,r,i,s,o,i){var u={board_null:i["\ubd80\uc11c\uc5c6\uc74c"],board_statistics_dept:i["\ubd80\uc11c\ubcc4 \uac8c\uc2dc\ud310 \ud1b5\uacc4"],dept_title:i["\ubd80\uc11c\uba85"],dept_manager:i["\ubd80\uc11c\uc7a5"],board_count:i["\uac8c\uc2dc\ud310 \uac1c\uc218"],post_count:i["\uac8c\uc2dc\ubb3c \uac1c\uc218"],usage:i["\uc0ac\uc6a9\ub7c9(MB)"],search:r["\uac80\uc0c9"],alert_keyword:r["\uac80\uc0c9\uc5b4\ub97c \uc785\ub825\ud558\uc138\uc694."],alert_length:i["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],label_down:i["\ubaa9\ub85d \ub2e4\uc6b4\ub85c\ub4dc"]},a=null,f=t.View.extend({unbindEvent:function(){this.$el.off("click","span.btn_search"),this.$el.off("click","#deptcsvDownLoadBtn"),this.$el.off("keydown","span.search_wrap input")},bindEvent:function(){this.$el.on("click","span.btn_search",e.proxy(this.search,this)),this.$el.on("click","#deptcsvDownLoadBtn",e.proxy(this.csvDownLoad,this)),this.$el.on("keydown","span.search_wrap input",e.proxy(this.searchKeyboardEvent,this))},initialize:function(){},csvDownLoad:function(){var e="ad/api/departments/board/stats/download?",t=this.bbsTable.listParams,n={property:t.property,direction:t.direction,keyword:t.keyword,searchtype:t.searchtype};GO.util.downloadCsvFile(e+GO.util.jsonToUrlParam(n))},render:function(){this.companyId=GO.session().companyId,this.bbsTable=null,this.unbindEvent(),this.bindEvent();var e=s({lang:u});this.$el.html(e),this.renderDataTables()},search:function(){var e=this.$el.find('.table_search input[type="text"]'),t=e.val();this.bbsTable.tables.search(this.$el.find(".table_search select").val(),t,e)},searchKeyboardEvent:function(e){e.keyCode==13&&this.search()},renderDataTables:function(){var t=this;this.bbsTable=e.goGrid({el:"#bbsDataTable",type:"admin",method:"GET",url:GO.contextRoot+"ad/api/departments/board/stats",emptyMessage:o({lang:u}),defaultSorting:[[0,"desc"]],sDomType:"admin",params:{page:this.page},columns:[{mData:"name",sClass:"title",bSortable:!0},{mData:"masterName",sClass:"title",bSortable:!0,sWidth:"200px",fnRender:function(e){if(e.aData.masterName==null||e.aData.masterName=="")e.aData.masterName="-";return e.aData.masterName+" "+e.aData.masterPositioin}},{mData:"boardCnt",sClass:"align_r",bSortable:!0,sWidth:"200px"},{mData:"postCnt",sClass:"align_r",bSortable:!0,sWidth:"200px"},{mData:"totalFileSize",sClass:"align_r",bSortable:!0,sWidth:"200px",fnRender:function(e){return GO.util.byteToMega(e.aData.totalFileSize)}}],fnDrawCallback:function(n,r,i){t.$el.find(".toolbar_top .custom_header").append(t.$el.find("#deptcsvDownLoad").show()),e(".tool_bar .dataTables_length").hide()}})}});return f});