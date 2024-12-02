(function() {
    define([
        "backbone", 
        "app",
        
        "hgn!admin/templates/notice/list",
        "hgn!admin/templates/notice/reader_list",
        "admin/libs/recurrence_parser",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-grid",
        "GO.util",
        "jquery.go-preloader"
        
    ],

    function(
        Backbone,
        GO,
        
        NoticeListTmpl,
        TplNoticeReaderList,
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
            el : '#layoutContent',
            events : {
                "click #add_notice" : "addNotice",
                "click #remove_notice" : "removeNotice",
                "change #type_select" : "stateFilter",
                "click span.btn_search" : "search",
                "keydown span.search_wrap input" : "searchKeyboardEvent",
                "click input:checkbox" : "toggleCheckbox"
            },

            initialize : function() {
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
                    url : GO.contextRoot + 'ad/api/notice/all',
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
                               { mData: null, sClass: "action reader",bSortable: false, fnRender : function(obj){
                                   return "<span class='btn_s' data-id='" +obj.aData.id+ "'>" + lang.show + "</span>";
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
                            var url = "company/notice/" + $(e.currentTarget).attr("data-id");
                            
                            GO.router.navigate(url, {trigger: true});
                        });
                        self.$el.find(this.el + " tr>td.subject span[data-type='title']").css('cursor', 'pointer').click(function(e) {
                            var url = "company/notice/" + $(e.currentTarget).attr("data-id");
                            
                            GO.router.navigate(url, {trigger: true});
                        });
                    }
                }).tables;
            },
            _popupReader: function(noticeId){
            	var popup = null;
            	popup = $.goPopup({
					pclass: 'layer_normal layer_count',
					header : CommonLang["조회"],
					contents: TplNoticeReaderList(),
					buttons : [{
						btype : 'confirm',
						btext : CommonLang["확인"]
					}]
				});
				
				$.goGrid({
					el : '#readerList',
					url : GO.contextRoot + 'ad/api/notice/'+noticeId+'/reader',
					displayLength : 10,
					displayLengthSelect : false,
					emptyMessage : "<p class='data_null'>" +
									"<span class='ic_data_type ic_no_data'></span>" + "<span class='txt'>" +
									AdminLang['목록없음'] + "</span></p>",
					numbersShowPages : 10,
					method : 'GET',
					defaultSorting : [],
					sDom : 'rt<"tool_bar"<"critical custom_bottom">p>',
			        bProcessing : false,
					columns :  [{
						"mData" : null, "sWidth" : "100px", "bSortable": false, "sClass" : "align_l", "fnRender" : function(obj) {
							var data = obj.aData,
						 	returnArr =  [data.reader.name,' ',data.reader.position];
							return returnArr.join(''); 
						}
				    }, {
				    	"mData" : null, "sClass" : "align_l", "bSortable": false, "fnRender" : function(obj) {
				    		var data = obj.aData;
				    		return ["<span class='date'>", GO.util.basicDate(data.createdAt), "</span>"].join('');
				    	}
				    }],
			        fnDrawCallback : function(tables, oSettings, listParams) {
			        	var toolBar = popup.find('.tool_bar'); 
			        	if(oSettings._iRecordsTotal == 0) {	//목록이 없는 경우
			        		$(this.el).find('tr:last-child>td').css('border-bottom', 0);
			        		toolBar.hide();
			        	} else {
			        		toolBar.show();
			        		toolBar.find('div.dataTables_paginate').css('margin-top', 0);
			        	}
			        	popup.find('.dataTables_wrapper').css('margin-bottom', 0);
			        	popup.reoffset();
			        }
				});		
            },
            toggleCheckbox: function(e){
				if($(e.currentTarget).attr('id') == "checkedAll" && $(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', true);
				}else if($(e.currentTarget).attr('id') == "checkedAll" && !$(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', false);
				}else if($(e.currentTarget).is(':checked')){
					$(e.currentTarget).attr('checked', true);
				}else{
					this.$el.find('#checkedAll').attr('checked', false);
					$(e.currentTarget).attr('checked', false);
				}
			},
            
            addNotice : function(){
                GO.router.navigate('company/notice/create', {trigger: true});
            },
            
            stateFilter : function(e){
                this.changeFilter(e, "state");
            },
            
            searchKeyboardEvent : function(e) {
                if(e.keyCode == 13) {
                    this.search();
                }
            },
            
            search : function() {
                var searchForm = this.$el.find('.table_search input[type="text"]'),
                    keyword = searchForm.val();
                
                this.noticeGrid.search(this.$el.find('.table_search select').val(), keyword, searchForm);
            },
            
            changeFilter : function(e, key){
                
                var value = $(e.currentTarget).val();
                if(typeof this.noticeGrid.setParam == 'function') {
                    this.noticeGrid.setParam(key,value);
                }
                
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
                    var preloader = $.goPreloader();
                    preloader.render();
                    $.ajax({
                        type: 'DELETE',
                        async: true,
                        data : JSON.stringify({ids : ids}),
                        dataType: 'json',
                        contentType : "application/json",
                        url: url
                    }).done(function(response){
                        preloader.release();
                        $.goMessage(lang.delete_success);
                        self.noticeGrid.reload();
                    }).fail(function () {
                        $.goError(CommonLang['저장에 실패 하였습니다.']);
                        preloader.release();
                    });
                });

            }
        },{
            render : function(){
                var noticeList = new NoticeList();
                return noticeList.render();
            }
        });

        function privateFunc(view, param1, param2) {

        }

        return NoticeList;

    });

})();