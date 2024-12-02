(function() {
    define([
        "backbone", 
        "app",
        "board/views/board_title",
        "hgn!board/templates/close_dept_board",
        "i18n!board/nls/board", 
        "i18n!nls/commons", 
        "jquery.go-grid",
        "GO.util",
        "jquery.go-orgslide"
    ],

    function(
        Backbone,
        GO,
        BoardTitleView,
        CloseDeptBoardTmpl,
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
            migration : CommonLang["게시판 이관"],
            migration_confirm : BoardLang["게시판 {{arg1}}로 이동"],
            not_select_board : BoardLang["게시판을 선택해 주세요."],
            delete_success : CommonLang["삭제되었습니다."],
            delete_confirm : BoardLang["게시판 삭제 확인"],
            change_success : CommonLang["변경되었습니다."],
            dept_name : BoardLang["부서명"],
            post_count : BoardLang["게시글 수"],
            normal_confirm : BoardLang["정상으로 변경 알림"]
        }

        var CloseDeptBoard = Backbone.View.extend({
            el : '#content',
            
            events : {
                "click a.remove" : "remove",
                "click a.active" : "active",
//                "click a.migration" : "migration",
                "click #checkAll" : "checkBoxToggle",
            },

            initialize : function() {
                this.$el.off();
            },

            render : function() {
                this.$el.html(CloseDeptBoardTmpl({
                    lang : lang
                }))
                
                BoardTitleView.render({
                    el : '.content_top',
                    dataset : {
                        name : lang.title 
                    }
                });
                
                this.makeGrid();
                
                return this;
            },
            
            makeGrid : function(){
                var self = this;
                
                this.closeDeptBoardList = $.goGrid({
                    el : '#folders_table',
                    method : 'GET',
                    destroy : true,
                    url : GO.contextRoot + 'api/department/boards/closed',
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>"+lang.empty_data+"</span>" +
                                   "</p>",
                    params : {
                        offset : 20,
                        page : 0,
                        property : "closedAt",
                        direction : "desc"
                    },
                    columns : [
                               { mData: null,sClass: "check", bSortable: false, fnRender : function(obj) {
                                   var data = obj.aData,
                                       owners = data.owners,
                                       userId = GO.session("id");
                                   
                                   if(data.managable){
                                       return "<input type='checkbox' data-id='"+ data.id +"' >";  
                                   }else{
                                       return "<input type='checkbox' disabled='true'>";
                                   }
                               }},
                               { mData: null, sClass: "partname", bSortable: false, fnRender : function(obj) {
                                   return obj.aData.deptName;
                               }},
                               { mData: "closedAt",sClass: "period", bSortable: false, fnRender : function(obj) {
                                   return GO.util.customDate(obj.aData.createdAt, "YYYY-MM-DD") + " ~ " + GO.util.customDate(obj.aData.closedAt, "YYYY-MM-DD");
                               }},
                               { mData: null, bSortable: false, sClass: "bbs_name", fnRender : function(obj) {
                                   return "<span data-id='"+ obj.aData.id +"'>" + obj.aData.name + "</span>";
                               }},
                               { mData: null, sClass: "count", bSortable: false, fnRender : function(obj){
                                   return obj.aData.postCount;
                               }}
                    ],
                    fnDrawCallback : function(obj, oSettings, listParams) {
                        self.$el.find('.custom_header').append(self.$el.find('#controlButtons').show());
                        self.$el.find('#checkedAll').attr('checked', false);
                        self.$el.find(this.el + ' tr>td.bbs_name').css('cursor', 'pointer').click(function(e) {
                            var targetEl = $(e.currentTarget).find('span');
                            
                            GO.router.navigate('board/'+targetEl.attr('data-id'), {trigger: true});
                        });
                    }
                }).tables;
            },
            
//            migration : function(){
//                var ids = this.getCheckedIds(),
//                    self = this;
//        
//                if(ids.length == 0){
//                    $.goMessage(lang.not_select_board);
//                    return;
//                }
//                
//                $.goOrgSlide({
//                    type : "department",
//                    contextRoot : GO.contextRoot,
//                    callback : $.proxy(function(info) {
//                        var content = 
//                            '<p class="add">' +
//                            GO.i18n(BoardLang["게시판 {{arg1}}로 이동"],{arg1 : info.name}) + 
//                            '</p>'; 
//                        
//                        $.goConfirm(lang.board_migration, content, function() {
//                            $.ajax({
//                                type: 'PUT',
//                                async: true,
//                                data : JSON.stringify({ids : ids}),
//                                dataType: 'json',
//                                contentType : "application/json",
//                                url: GO.config("contextRoot") + 'api/board/transfer/dept/' + info.id
//                            }).
//                            done(function(response){
//                                $.goMessage(lang.change_success);
//                                GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
//                                self.render();
//                                $.goOrgSlide.close();
//                            });
//                            
//                        });
//                    }, this)
//                });
//            },
            
            active : function(){
                var self = this,
                    ids = this.getCheckedIds();
                
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
                        GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
                        self.render();
                    });
                });
            },
            
            remove : function(){
                var ids = this.getCheckedIds(),
                    self = this;
                    
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
                        GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
                        self.render();
                    });
                });
            },
            
            checkBoxToggle : function(e){
                var currentEl = $(e.currentTarget),
                    checkBoxs = $("input:checkbox").not(":disabled").not("#checkAll");
                
                if(currentEl.is(":checked")){
                    checkBoxs.attr("checked", "checked");
                }else{
                    checkBoxs.attr("checked", null);
                }
            },
            
            getCheckedIds : function(){
                var checkBoxs = this.$el.find("input:checkbox:checked").not("#checkAll"),
                    ids = [];
                
                $.each(checkBoxs, function(){
                    ids.push($(this).attr("data-id"));
                });
                
                return ids;
            }
        });

        function privateFunc(view, param1, param2) {

        }

        return CloseDeptBoard;

    });

})();