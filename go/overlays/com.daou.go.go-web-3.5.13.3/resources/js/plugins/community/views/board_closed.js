(function() {
    define([
        "backbone", 
        "app",
        "board/views/board_title",
        "hgn!community/templates/board_closed",
        "i18n!board/nls/board", 
        "i18n!nls/commons", 
        "jquery.go-grid",
        "GO.util"
    ],

    function(
        Backbone,
        GO,
        BoardTitleView,
        CloseBoardTmpl,
        BoardLang,
        CommonLang
    ) {
        var lang = {
            title : BoardLang["중지된 게시판 관리"],
            name : CommonLang["게시판"],
            board_term : BoardLang["게시 기간"],
            empty_data : BoardLang["중지된 게시판이 없습니다."],
            remove : CommonLang["삭제"],
            change_status_normal : CommonLang["정상 상태로 변경"],
            not_select_board : BoardLang["게시판을 선택해 주세요."],
            delete_success : CommonLang["삭제되었습니다."],
            delete_confirm : BoardLang["게시판 삭제 확인"],
            change_success : CommonLang["변경되었습니다."],
            dept_name : BoardLang["부서명"],
            post_count : BoardLang["게시글 수"],
            normal_confirm : BoardLang["정상으로 변경 알림"]
        }

        var CloseBoard = Backbone.View.extend({
            events : {
                "click a.remove" : "remove",
                "click a.active" : "active",
                "click #checkedAll" : "checkAll"
            },

            initialize : function(options) {
            	this.closeBoardList = null;
            	this.options = options || {};
            },

            render : function() {
                this.$el.html(CloseBoardTmpl({
                    lang : lang
                }));
                
                BoardTitleView.render({
                    el : '.content_top',
                    dataset : {
                        name : lang.title 
                    }
                });
                
                this.makeGrid(this.options.communityId);
                
                return this;
            },
            
            
        	checkAll : function(e) {
	    		var isChecked = $(e.currentTarget).is(":checked");
	    		$("input[type=checkbox][data-row]").attr("checked", isChecked);
	    	},
            
            
            makeGrid : function(communityId){
                var self = this;
                var boardList = $.goGrid({
                    el : '#folders_table',
                    method : 'GET',
                    destroy : true,
                    url : GO.contextRoot + 'api/community/'+communityId+'/boards/closed',
                    params : this.searchParams,
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>"+lang.empty_data+"</span>" +
                                   "</p>",
                    defaultSorting : [[ 1, "asc" ]],
                    columns : [
                               { mData: null, sWidth : "53px", bSortable: false, fnRender : function(obj) {
                            	   var managable = obj.aData.actions.managable;
                            	   return managable ? "<input type='checkbox' value='" + obj.aData.id + "' data-row='" + obj.iDataRow + "'></input>" : "";
                               }},
                               { mData: null, sWidth : "170px", bSortable: false, fnRender : function(obj) {
                            	   return GO.util.customDate(obj.aData.createdAt, "YYYY-MM-DD") + " ~ " + GO.util.customDate(obj.aData.closedAt, "YYYY-MM-DD");
                               }},
                               { mData: null, sWidth : "200px", bSortable: false, sClass: "name", fnRender : function(obj) {
                                   return "<span data-communityid='"+ communityId +"' data-boardid='"+obj.aData.board.id+"'>" + obj.aData.board.name + "</span>";
                               }},                               
                               { mData: null, sWidth : "70px", bSortable: false, fnRender : function(obj){
                                   return obj.aData.board.postCount;
                               }}
                    ],
                    fnDrawCallback : function(obj, oSettings, listParams) {
                    	var hasManagableBoard = self.$("input[type=checkbox][data-row]").length > 0;
                        self.$el.find('.custom_header').append(self.$el.find('#controlButtons').show());
                        self.$el.find('#checkedAll').attr('checked', false);
                        if (!hasManagableBoard) {
                        	self.$("#checkedAll").hide();
                        	self.$("#controlButtons").hide();
                        }
                        self.$el.find(this.el + ' tr>td.name').css('cursor', 'pointer').click(function(e) {
                            var targetEl = $(e.currentTarget).find('span');
                            GO.router.navigate('community/'+targetEl.attr('data-communityid') + "/board/" + targetEl.attr('data-boardid'), {trigger: true});
                        });
                    }
                });
                this.closeBoardList = boardList.tables;
            },
            getBoardIds : function(){
            	console.log('getboardIds')
            	console.log(this.closeBoardList);
            	var checkObj = this.closeBoardList.getCheckedData();
            	
            	console.log(checkObj);
            	
            	var boardIds = [];
            	$.each(checkObj,function(k,v){
            		boardIds.push(v.board.id)
            	});
            	return boardIds;
            },
            active : function(){
                var self = this;
                var ids = this.getBoardIds();
                
                if(ids.length == 0 ){
                    $.goMessage(lang.not_select_board);
                    return;
                }
                
                $.goConfirm(lang.change_status_normal, lang.normal_confirm, function() {
                    $.ajax({
                        type: 'PUT',
                        async: true,
                        data : JSON.stringify({ids : ids}),
                        dataType: 'json',
                        contentType : "application/json",
                        url: GO.config("contextRoot") + 'api/board/status/active'
                    }).
                    done(function(response){
                        $.goMessage(lang.change_success);
                        GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard',self.options.communityId);
                        self.render();
                        self.closeBoardList.fnClearTable();
                    });
                });
            },
            
            remove : function(){
                var self = this;
                var ids = this.getBoardIds();
                    
                if(ids.length == 0 ){
                    $.goMessage(lang.not_select_board);
                    return;
                }
                
                $.goConfirm(lang.name + " " + lang.remove , lang.delete_confirm, function() {
                    $.ajax({
                        type: 'DELETE',
                        async: true,
                        data : JSON.stringify({ids : ids}),
                        dataType: 'json',
                        contentType : "application/json",
                        url: GO.config("contextRoot") + 'api/board/status/deleted'
                    }).
                    done(function(response){
                        $.goMessage(lang.delete_success);
                        GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard',self.options.communityId);
                        self.render();
                        self.closeBoardList.fnClearTable();
                    });
                });
            }
        });
        return CloseBoard;

    });

})();