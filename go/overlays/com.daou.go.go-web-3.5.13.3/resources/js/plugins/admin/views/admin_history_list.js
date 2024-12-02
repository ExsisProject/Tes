(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "hgn!admin/templates/admin_history_list",
        "hgn!admin/templates/list_empty",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-popup",
        "jquery.go-sdk",
        "jquery.go-grid",
        "jquery.go-orgslide",
        "jquery.go-validation",
        "GO.util"
    ], 
    
    function(
        $, 
        Backbone,
        App,
        adminHistoryListTmpl,
        emptyTmpl,
        commonLang,
        adminLang
    ) {
        var tmplVal = {
            label_download: adminLang["목록 다운로드"],
            label_id: adminLang["일련번호"],
            label_create_at: adminLang["일시"],
            label_name : commonLang["이름"],
            label_position: adminLang["직위"],
            label_email : commonLang["이메일"],
            label_desc: adminLang["작업내용"],
            search : commonLang["검색"],
            select_type : [
                { text : adminLang["전체분류"], value : ""},
                { text : adminLang["접속"] , value : "ACCESS"},
                { text : adminLang["정보관리"] , value : "INFO"},
                { text : adminLang["계정관리"] , value : "ACCOUNT"},
                { text : adminLang["자료관리"] , value : "DATA"},
                { text : adminLang["서비스설정"] , value : "SERVICE"}
            ]
        };
        var AdminHistoryList = Backbone.View.extend({
            el : '#layoutContent',
            initialize : function() {
                this.listEl = '#adminList';
                this.dataTable = null;
                this.unbindEvent();
                this.bindEvent();
            },
            unbindEvent: function() {
                this.$el.off("click", "span#btn_down");
                this.$el.off("change", "#categoryName");
                this.$el.off("click", "#search_history");
                this.$el.off("keydown", "span.search_wrap input");
            }, 
            bindEvent: function() {
                this.$el.on("click", "span#btn_down", $.proxy(this.downDomainAdminList, this));
                this.$el.on("change", "#categoryName", $.proxy(this.categoryNameFilter, this));
                this.$el.on("click", "#search_history", $.proxy(this.search, this));
                this.$el.on("keydown","span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
            },
            search : function(){
                var searchEl = this.$el.find(".table_search input[type='text']"),
                	keyword = searchEl.val();
                	
				if(keyword.length >64){
					$.goAlert(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"64"}));
					return;
				}
                this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword, searchEl);
            },
            searchKeyboardEvent : function(e) {
				if(e.keyCode == 13) {
					this.search();
				}
			},
            categoryNameFilter : function(e){
                var value = $(e.currentTarget).val();
                if(typeof this.dataTable.tables.setParam == 'function') {
                    this.dataTable.tables.setParam("category",value);
                }
            },
            downDomainAdminList : function() {
                var url = "ad/api/activitylog/download/list?";            	
                var data = this.dataTable.listParams;
                var properties = {
                		"property" : data.property,
                		"direction" : data.direction,
                		"searchtype" : data.searchtype,
                		"keyword" : data.keyword,
                		"action" : data.action,
                		"category" : data.category                		
                };
            	GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));            	
            },
            render : function() {
                this.$el.empty();
                this.$el.html( adminHistoryListTmpl({
                    lang : tmplVal,
                }));    
                this.renderAdminHistoryList();
            },
            renderAdminHistoryList : function(){
                var self = this;
                this.dataTable = $.goGrid({
                        el : this.listEl,
                        method : 'GET',
                        url : GO.contextRoot + 'ad/api/activitylog/list',
                        emptyMessage : emptyTmpl({
                                label_desc : adminLang["업무기록 없음"]
                        }),
                        defaultSorting : [[ 0, "desc" ]],
                        sDomType : 'admin',
                        displayLength : App.session('adminPageBase'),
                        columns : [
                                   { mData: "createdAt", sClass: "align_c", sWidth: '200px', bSortable: true, fnRender : function(obj) {
                                       return GO.util.basicDate(obj.aData.createdAt);
                                   } },
                                   { mData: "categoryName", sWidth: "110px", bSortable: false, fnRender : function(obj) {
                                       return obj.aData.categoryName;
                                   }},
                                   { mData: "actor", sWidth: "150px", bSortable: true, fnRender : function(obj) {
                                       return obj.aData.actor;
                                   }},
                                   // position 이 undefined 인경우 dataTables warning 발생한다.
                                   // mData 에 function 을 구현하는경우 fnRender 에는 로직을 넣지 않는다.
                                   { mData : function(historyObj) {
                                	   if (!historyObj) return "position";
                                	   if(historyObj.position == null || historyObj.position == '') return "-";
                                	   return historyObj.position; 
                                   }, sWidth: "100px", bSortable: true, fnRender : function(obj) {
                                   }},
                                   { mData: "actorEmail", sWidth: "200px", bSortable: true, fnRender : function(obj) {
                                       return obj.aData.actorEmail;
                                   }},
                                   { mData : "doneMessage",sClass:"title", bSortable: false, fnRender: function(obj) {
                                       return obj.aData.doneMessage;
                                   }}
                        ],
                        fnDrawCallback : function(obj) {
                            self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                        }
                    
                    });
                }
            });
        return AdminHistoryList;
    });
}).call(this);