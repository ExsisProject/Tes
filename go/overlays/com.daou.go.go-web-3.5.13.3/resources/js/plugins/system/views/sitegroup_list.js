(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "hgn!system/templates/sitegroup_list",
        "hgn!system/templates/list_empty",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-grid",
        "jquery.go-sdk",
        "GO.util",
        "jquery.go-validation"
    ], 

function(
    $, 
    Backbone,
    App,
    siteGroupListTmpl,
    emptyTmpl,
    commonLang,
    adminLang
) {
    var tmplVal = {
        label_add : commonLang["추가"],
        label_delete : commonLang["삭제"],
        label_company_group_name : adminLang["사이트 그룹명"],
        label_domain_name : adminLang["도메인명"],
        label_company_name : adminLang["사이트명"],
        label_user_count : adminLang["총 계정수"],
        label_search : commonLang["검색"],
        label_search_company_group : adminLang["사이트 그룹 검색"],
        label_confirm_delete : adminLang["삭제하시게습니까?"],
        label_check_delete_item : adminLang["삭제할 항목을 선택하세요."]
    };
    
    var siteGroupList = Backbone.View.extend({
        
        el : '#layoutContent',
        
        initialize : function() {
            this.unbindEvent();
            this.bindEvent();
        },
        
        unbindEvent : function() {
            this.$el.off("click", "span#btn_add");
            this.$el.off("click", "span#btn_delete");
            this.$el.off("click", "span#btn_search");
            this.$el.off("keydown", "input#search");
        },
        
        bindEvent : function() {
            this.$el.on("click", "span#btn_add", $.proxy(this._onAddClicked, this));
            this.$el.on("click", "span#btn_delete", $.proxy(this._onDeleteClicked, this));
            this.$el.on("click", "span#btn_search", $.proxy(this._onSearchClicked, this));
            this.$el.on("keydown", "input#search", $.proxy(this._onSearchInputKeydown, this));
        },
        
        render : function(keyword) {
            $('#site').addClass('on');
            $('.breadcrumb .path').html(adminLang["사이트 관리 > 사이트 그룹 목록"]);
            this.$el.empty();
            this.$el.html(siteGroupListTmpl({
                lang : tmplVal
            }));
            this._renderSiteGroupList(keyword);
            $('#search').attr('value', keyword);
        },
        
        _renderSiteGroupList : function(keyword) {
            var self = this;
            this.$tableEl = this.$el.find('#site_group_list');
            this.dataTable = $.goGrid({
                el : '#site_group_list',
                method : 'GET',
                url : GO.contextRoot + 'ad/api/system/companygroup',
                params : {keyword : keyword},
                emptyMessage : emptyTmpl({
                    label_desc : adminLang["표시할 데이터 없음"]
                }),
                pageUse : true,
                sDomUse : true,
                checkbox : true,
                sDomType : 'admin',
                checkboxData : 'id',
                defaultSorting : [[ 1, "asc" ]],
                displayLength : App.session('adminPageBase'),
                columns : [
                   {
                       mData: "name",
                       sWidth: '250px',
                       bSortable: true,
                       fnRender : function(obj) {
                           return "<div id='name"+obj.aData.id+"'>"+obj.aData.name+"</div>";
                       }
                   },
                   {
                       mData: null,
                       sWidth: '250px',
                       bSortable: false,
                       fnRender : function(obj) {
                           var domainNames = [];
                           _.each(obj.aData.companies, function(company) {
                               domainNames.push(company.domainName);
                           });
                           return domainNames.join("<br/>");
                       }
                   },
                   {
                       mData: null,
                       sWidth: '200px',
                       bSortable: false,
                       fnRender : function(obj) {
                           var companyNames = [];
                           _.each(obj.aData.companies, function(company) {
                               companyNames.push(company.name);
                           });
                           return companyNames.join("<br/>");
                       }
                   },
                   {
                       mData: null,
                       sWidth: '200px',
                       bSortable: false,
                       fnRender : function(obj) {
                           var totalCount = 0;
                           _.each(obj.aData.companies, function(company) {
                               totalCount += company.onlineUserCount;
                           });
                           return totalCount;
                       }
                   }
                ],
                fnDrawCallback : function(obj) {
                    self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controllButtons').show());
                    self.$el.find(this.el + ' tr>td:nth-child(2)').css('cursor', 'pointer').click(function(e) {
                        var siteGroupId = $(e.currentTarget).parent().find('input').val();
                        App.router.navigate('system/sitegroup/'+ siteGroupId + "/modify", {trigger: true});
                    });
                }
            });
        },
        
        _onAddClicked: function(e) {
            App.router.navigate('system/sitegroup/create', {trigger: true});
        },
        
        _onDeleteClicked: function(e) {
            var selectedIds = [],
                self = this;
            
            _.each($('input[name="id"]:checked'), function(checkbox) {
                selectedIds.push($(checkbox).val());
            });
            
            if (_.isEmpty(selectedIds)) {
                return $.goAlert("", adminLang["삭제할 항목을 선택하세요."]);
            }
            
            $.goConfirm(adminLang["삭제하시겠습니까?"], "", function(){
                $.go(GO.contextRoot + "ad/api/system/companygroup/", JSON.stringify({"ids" : selectedIds}), {
                    qryType : 'DELETE',
                    contentType : 'application/json',
                    responseFn : function(response) {
                        $.goMessage(commonLang["삭제되었습니다."]);
                        self.render();
                    },
                    error : function(error){
                        $.goMessage(commonLang["실패했습니다."]);
                        self.render();
                    }
                });
            });
        },
        
        _onSearchClicked: function(e) {
            this._search();
        },
        
        _onSearchInputKeydown: function(e) {
            if(e.keyCode == 13) {
                this._search();
            }
        },
        
        _search: function(){
            var keyword = $('#search').val();
            
            if (keyword == ""){
                $.goMessage(commonLang['검색어를 입력하세요.']);
                return false;
            }
            
            if (!$.goValidation.isCheckLength(2,255,keyword)){
                $.goMessage(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"255"}));
                return false;
            }
            
            if (!$.goValidation.charValidation("/\\/",keyword)){
                $.goMessage(adminLang['입력할 수 없는 문자']);
                return false;
            }
            
            this.render(keyword);
        }
    },{
            __instance__: null
    });
    
        return siteGroupList;
    });
}).call(this);