(function() {
    define([
        "backbone", 
        "app",
        
        "hgn!system/templates/notice/list",
        "admin/libs/recurrence_parser",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-grid",
        "GO.util"
        
    ],

    function(
        Backbone,
        GO,
        
        NoticeListTmpl,
        RecurrenceParser,
        CommonLang,
        AdminLang
    ) {
        var lang = {
            "add_notice" : AdminLang["공지 추가"],
            "remove_notice" : CommonLang["삭제"],
            "name" : CommonLang["제목"],
            "term" : AdminLang["공지 기간"],
            "state" : CommonLang["상태"],
            "hidden" : AdminLang["사용하지 않음"],
            "normal" : AdminLang["사용"],
            "creator" : AdminLang["등록자"],
            "createdAt" : AdminLang["등록일"],
            "config" : CommonLang["설정"],
            "search" : CommonLang["검색"],
            "empty_data" : AdminLang["등록된 공지가 없습니다."],
            "not_select" : AdminLang["공지사항을 선택해주세요."],
            "delete_success" : CommonLang["삭제되었습니다."],
            "delete_title" : AdminLang["팝업 공지 삭제"],
            "delete_confirm" : AdminLang["팝업 공지 삭제 알림"],
            "no_title" : CommonLang["제목없음"],
            "read" : CommonLang["조회"],
            "show" : CommonLang["보기"],
            "device" :  AdminLang["디바이스"],
            "web" :  AdminLang["웹"],
            "mobile" :  AdminLang["모바일"]

        };

        var NoticeList = Backbone.View.extend({

            events : {
                "click #add_notice" : "addNotice",
                "click #remove_notice" : "removeNotice",
            },

            initialize : function() {
            	$('.breadcrumb .path').html("로그인페이지 공지");
            },

            render : function() {
                this.$el.html(NoticeListTmpl({
                    lang : lang
                }));
                
                this.makeGrid();
            },
            
            makeGrid : function(){
                var self = this;
                
                this.noticeGrid = $.goGrid({
                    el : '#notice_table',
                    method : 'GET',
                    destroy : true,
                    url : GO.contextRoot + 'ad/api/notice/front',
                    params : this.searchParams,
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>"+lang.empty_data+"</span>" +
                                   "</p>",
                    defaultSorting : [[ 6, "desc" ]],
                    sDomType : 'admin',
                    checkbox : true,
                    checkboxData : 'id',
                    displayLength : GO.session('adminPageBase'),
                    columns : [
                               { mData: "title", sClass: "subject", bSortable: true, fnRender : function(obj) {
                                   var title = obj.aData.title;
                                   
                                   if($.trim(title).length == 0){
                                       title = lang.no_title;
                                   }
                                   
                                   return "<span data-type='title' data-id='" + obj.aData.id + "'>" + title + "</span>";
                               }},
                               { mData: "startTime", sClass: "period", bSortable: false, fnRender : function(obj){
                            	   if(obj.aData.recurrence != undefined && obj.aData.recurrence != "") {
                            		   //반복일정인경우
                            		   var recrurrenceHelper = new RecurrenceParser();
                            		   var recurrenceCode = obj.aData.recurrence;
                            		   return recrurrenceHelper.parse(recurrenceCode).humanize();
                            	   }else{
                            		   var startTime = moment(obj.aData.startTime).format('YYYY-MM-DD');
                            		   var endTime = moment(obj.aData.endTime).format('YYYY-MM-DD');
                            		   
                            		   return startTime + " ~ " + endTime; 
                            	   }
                               }},
                               { mData: "showWeb", sClass: "device", bSortable: false, fnRender : function(obj){
                                   var showWeb = obj.aData.showWeb;
                                   var showMobile = obj.aData.showMobile;
                                   if(showWeb && showMobile){
                                       return lang.web + ", " + lang.mobile;
                                   }else if (showWeb == true && showMobile == false){
                                       return lang.web;
                                   }else if (showWeb == false && showMobile == true){
                                       return lang.mobile;
                                   }
                               }},
                               { mData: "state",  sClass: "",bSortable: false , fnRender : function(obj){
                                   var state = {};
                                   state["hidden"] = lang.hidden;
                                   state["normal"] = lang.normal;
                                   
                                   return state[obj.aData.state];
                               }},
                               { mData: "creator", sClass: "name", bSortable: true, fnRender : function(obj){
                                   var creator = obj.aData.creator;
                                   
                                   return creator.name + " " + creator.position;
                               }},
                               { mData: "createdAt", sClass: "date",bSortable: true, fnRender : function(obj){
                                   return GO.util.customDate(obj.aData.createdAt, "YYYY-MM-DD");
                               }},
                               { mData: null, sClass: "last action",bSortable: false, fnRender : function(obj){
                                   return "<span class='btn_s' data-id='" +obj.aData.id+ "'>" + lang.config + "</span>";
                               }}
                    ],
                    fnDrawCallback : function(obj, oSettings, listParams) {
                        self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                        self.$el.find('#checkedAll').attr('checked', false);
                        self.$el.find(this.el + ' tr>td.reader span.btn_s').css('cursor', 'pointer').click(function(e){
                        	self._popupReader($(e.currentTarget).attr("data-id"));
                        });
                        self.$el.find(this.el + ' tr>td.last span.btn_s').css('cursor', 'pointer').click(function(e) {
                            var url = "system/extension/frontnotice/" + $(e.currentTarget).attr("data-id");
                            
                            GO.router.navigate(url, {trigger: true});
                        });
                        self.$el.find(this.el + " tr>td.subject span[data-type='title']").css('cursor', 'pointer').click(function(e) {
                            var url = "system/extension/frontnotice/" + $(e.currentTarget).attr("data-id");
                            
                            GO.router.navigate(url, {trigger: true});
                        });
                    }
                }).tables;
            },
            
            addNotice : function(){
                GO.router.navigate('system/extension/frontnotice/create', {trigger: true});
            },
            
            removeNotice : function(){
                var ids = this.noticeGrid.getCheckedIds(),
                    url = GO.contextRoot + "ad/api/notice",
                    self = this;
                
				var checkNoticeCnt = $('#notice_table').find('tbody input[type="checkbox"]:checked').length;
				if(checkNoticeCnt != ids.length) return;
                if(ids.length == 0){
                    $.goMessage(lang.not_select);
                    return;
                }
                
                $.goConfirm(lang.delete_title, lang.delete_confirm, function() {
                    $.ajax({
                        type: 'DELETE',
                        async: true,
                        data : JSON.stringify({ids : ids}),
                        dataType: 'json',
                        contentType : "application/json",
                        url: url
                    }).
                    done(function(response){
                        $.goMessage(lang.delete_success);
                        self.noticeGrid.reload();
                    });
                });

            }
        },{
            render : function(){
                var noticeList = new NoticeList();
                return noticeList.render();
            }
        });

        return NoticeList;

    });

})();