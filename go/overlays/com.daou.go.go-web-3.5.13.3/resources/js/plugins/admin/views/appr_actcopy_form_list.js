(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!approval/nls/approval",
        "hgn!admin/templates/actcopy_form_list",
        "jquery.go-sdk",
        "jquery.jstree",
        "jquery.go-popup",
        "jquery.go-grid",
        "jquery.go-orgslide",
        "jquery.go-validation"
    ], 
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        approvalLang,
        tmpl
    ) {
        
        var ActcopyFormAppView,
            baseApi = GO.contextRoot + 'ad/api/',
            lang = {
                'delete': adminLang['양식 삭제'],
                new_form: adminLang['양식 추가'],
                form_name: commonLang['제목'],
                creator_name: adminLang['등록자'],
                state: adminLang['사용여부'],
                normal: adminLang['정상'],
                hidden: adminLang['숨김'],
                empty_msg: adminLang['등록된 양식이 없습니다.']
            };

        ActcopyFormAppView = Backbone.View.extend({

            el : '#layoutContent',
            
            initialize: function() {
                this._initEventBinding();
            },

            render: function() {
                this.$el.empty().html(tmpl({ lang : lang }));
                this._renderFormListView();
            },
            
            _renderFormListView : function(){
                var url = baseApi + 'approval/actcopyform',
                    renderedEmptyMsg = this._renderEmptyTmpl({
                        lang : lang
                    });
                
                this.dataTable = $.goGrid({
                    el : '#actcopy_form_table',
                    url : url,
                    method : 'GET',
                    emptyMessage : renderedEmptyMsg,
                    defaultSorting : [],
                    checkbox : true,
                    checkboxData : 'id',
                    sDomUse: false,
                    pageUse: false,
                    columns : [
                        {
                            mData: 'name',
                            bSortable: true,
                            sClass: "title",
                            fnRender : function(obj) {
                                return '<a class="form_name_actCopylink" data-id="' + obj.aData.id + '">' + obj.aData.name + '</a>';
                            }
                        },
                        {
                            mData: "creator.name",
                            bSortable: true,
                            fnRender : function(obj) {
                                return obj.aData.creator.name + ' ' + obj.aData.creator.position;
                            }
                        },
                        {
                            mData: "state",
                            sWidth: "101px",
                            bSortable: true,
                            fnRender : function(obj) {
                                if (obj.aData.state == 'HIDDEN') {
                                    return lang['hidden'];
                                } else {
                                    return lang['normal'];
                                }
                            }
                        }
                    ],
                    fnDrawCallback : $.proxy(function(tables, oSettings, listParams) {
                        this.$el.find('.toolbar_top .custom_header').append(this.$el.find('#csvDownLoad').show());
                        $('.tool_bar .dataTables_length').hide();
                        //시행문 목록에 상단 toolbar 삭제 해달라는 요청때문에..
                        $('.tool_bar').eq(0).hide();
                    }, this)
                });
            },

            _renderEmptyTmpl: function(data) {
                var htmls = [];
                htmls.push('<tbody>');
                htmls.push('    <tr>');
                htmls.push('        <td colspan="4">');
                htmls.push('            <p class="data_null">');
                htmls.push('                <span class="ic_data_type ic_no_data"></span>');
                htmls.push('                <span class="txt">{{lang.empty_msg}}</span>');
                htmls.push('            </p>');
                htmls.push('        </td>');
                htmls.push('    </tr>');
                htmls.push('</tbody>');

                var compiled = Hogan.compile(htmls.join('\n'));
                return compiled.render(data);
            },
            
            _initEventBinding: function() {
                this.$el.off();
                this.$el.on('click','.form_name_actCopylink', $.proxy(this._goToShowForm, this));
                this.$el.on('click', '#check_all', $.proxy(this._toggleAllCheckboxes, this));
                this.$el.on('click', '#new_form', $.proxy(this._goToNewForm, this));
                this.$el.on('click', '#delete_form', $.proxy(this._deleteSelected, this));
            },

            _goToNewForm: function(e) {
                GO.router.navigate('approval/actcopyform/new', {trigger: true});
            },

            _goToShowForm: function(e) {
                var formId = $(e.currentTarget).data('id');
                GO.router.navigate('approval/actcopyform/' + formId + '/show', {trigger: true});
                return false;
            },

            _toggleAllCheckboxes: function(e) {
                var el = $(e.currentTarget),
                    checkboxes = this.$el.find('input:checkbox');

                if (el.is(':checked')) {
                    checkboxes.attr('checked', 'checked');
                } else {
                    checkboxes.removeAttr('checked');
                }
            },

            _deleteSelected: function() {
                var formIds = [];
                this.$el.find('input:checked').each(function(idx) {
                    if ($(this).attr('name') == 'id') {
                        formIds.push($(this).val());
                    }
                });
                
                if (formIds.length == 0) {
                    $.goMessage(approvalLang['양식을 선택해 주세요.']);
                    return false;
                }
                
                var self = this;
                $.goConfirm(adminLang['삭제하시겠습니까?'], "", function() {
                    $.go(baseApi + 'approval/actcopyform', JSON.stringify({ids: formIds}), {
                        qryType : 'DELETE',
                        async: false,
                        contentType: 'application/json',
                        responseFn : function(rs) {
                            self.render();
                            $.goMessage(commonLang['삭제하였습니다.']);
                        },
                        error : function(error) {
                            self.render();
                            $.goMessage(commonLang['삭제하지 못했습니다.']);
                        }
                    });
                });
            }
        });
        return ActcopyFormAppView();
    });
}).call(this);
