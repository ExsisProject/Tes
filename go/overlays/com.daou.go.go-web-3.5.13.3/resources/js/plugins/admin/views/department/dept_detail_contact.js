(function () {
    define(function (require) {
        var Backbone = require("backbone");
        var Hogan = require("hogan");
        var AdminLang = require("i18n!admin/nls/admin");
        require("GO.util");


        var lang = {
            "contact_title" : AdminLang["그룹명"],
            "contact_count" : AdminLang["연락처 개수"],
            "migration" : AdminLang["주소록 이관"],
            'list_to_csv' : AdminLang['목록 다운로드'],
            'dept_amounts_empty' : AdminLang['등록된 부서자료가 없습니다.'],
            'migration_info' : AdminLang["주소록 {{arg1}}로 이동"],
            'migration_head' : AdminLang["주소록 이관"]
        };

        var template = [
            "<div class='dataTables_wrapper'>",
                "<div class='toolbar_top header_tb'>",
                    "<div class='critical'>",
                        "<span class='btn_tool' id='dept_data_migration'><span class='ic_adm ic_move'></span><span class='txt'>{{lang.migration}}</span></span>",
                         "</div><div class='optional'>",
                         "<span class='btn_tool' id='dept_data_down'><span class='ic_adm ic_down'></span><span class='txt'>{{lang.list_to_csv}}</span></span>",
                         "</div>",
                    "</div>",
                "</div>",
                "<div class='content_tb'><div class='dataTables_wrapper'>",
                    "<table class='chart size dataTable'>",
                        "<thead>",
                            "<tr>",
                                "<th class='sorting'><span class='title_sort'>{{lang.contact_title}}<ins class='ic'></ins><span class='selected'></span></span></th>",
                                "<th class='sorting_desc last'><span class='title_sort'>{{lang.contact_count}}<ins class='ic'></ins><span class='selected'></span></span></th>",
                            "</tr>",
                        "</thead>",
                    "</table>",
            "</div></div>",
            "</div>"
            ].join("");

        var ContactView = Backbone.View.extend({

            events : {},

            initialize : function(options) {
                this.deptId = options.id;
                this.events = $.extend({}, options.__super__.events);
                this._super_ = options.__super__;

            },

            render : function() {
                var contentTpl = Hogan.compile(template).render({
                    lang : lang
                });

                this.$el.html(contentTpl);
                this.makeGrid();
                return this;
            },

            makeGrid : function(){
                var url = [
                    'ad/api/department',
                    this.deptId,
                    'groups'
                ];

                this.grid = $.goGrid({
                    el : this.$("table"),
                    method : 'GET',
                    url : GO.config("contextRoot") + url.join('/'),
                    emptyMessage : '<p class="data_null"><span class="ic_data_type ic_no_data"></span><span class="txt">'+lang['dept_amounts_empty']+'</span></p>',
                    defaultSorting : [[ 1, "asc" ]],
                    pageUse : false,
                    sDomUse : false,
                    checkbox : true,
                    checkboxData : 'id',
                    displayLength : 999,
                    columns : [
                        { mData : 'name', sWidth: '250px', bSortable: true, fnRender : function(obj) {
                            return obj.aData.name;
                        }},
                        { mData : 'contactCount', sClass: "align_r", sWidth: '100px', bSortable : false, fnRender : function(obj) {
                            return obj.aData.contactCount || 0;
                        } }
                    ],
                    fnDrawCallback : function(tables) {
                        $('.dataTables_scroll tr>td:last-child, .dataTables_scroll tr>th:last-child, .dataTables_scrollBody tr:last-child').addClass('last');
                    }
                });
            },

            migration : function(){
                var checkedData = this.grid.tables.getCheckedIds(),
                    self = this;

                if(!self._super_.checkboxValidate.apply(self, new Array(checkedData))){return;}

                $.goOrgSlide({
                    header : lang.migration_head,
                    type : "department",
                    isAdmin : true,
                    contextRoot : GO.contextRoot,
                    callback : $.proxy(function(info) {
                        if (info.type == "root") return;
                        var content =
                            '<p class="add">' +
                            GO.i18n(lang.migration_info,{arg1 : info.name}) +
                            '</p>';

                        $.goConfirm(content, "", function() {
                            $.ajax({
                                type: 'PUT',
                                async: true,
                                data : JSON.stringify({ids : checkedData}),
                                dataType: 'json',
                                contentType : "application/json",
                                url: GO.config("contextRoot") + 'ad/api/contact/transfer/dept/' + info.id
                            }).
                            done(function(response){
                                self._super_.reload.apply(self);
                                $.goOrgSlide.close();
                            });

                        });

                    }, this)
                });
            },

            download : function(){
                GO.util.downloadCsvFile("ad/api/contact/department/" + this.deptId + "/groups/download");
            },

        });

        return ContactView;
    });
}).call(this);