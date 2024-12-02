(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "admin/models/appr_form",
        "hgn!admin/templates/appr_form_list",
        "hgn!admin/templates/list_empty",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!approval/nls/approval",
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
        FormModel,
        listTmpl,
        emptyTmpl,
        commonLang,
        adminLang,
        approvalLang
    ) {

        var baseApi = GO.contextRoot + 'ad/api/',
            lang = {
                'name' : commonLang['제목'],
                'creator' : adminLang['최종 수정자'],
                'admin' : adminLang['운영자'],
                'form_user_scope' : commonLang['작성권한'],
                'state' : adminLang['사용여부'],
                'specific_scope' : commonLang['제한'],
                'all_scope' : commonLang['전체'],
                'hidden' : adminLang['숨김'],
                'normal' : adminLang['정상'],
                'reorder_changed' : commonLang['변경되었습니다.'],
                'empty_msg' : approvalLang['등록된 결재 양식이 없습니다.'],
                'delete_success_msg' : commonLang['삭제하였습니다.'],
                'delete_fail_msg' : commonLang['삭제하지 못했습니다.'],
                '사용' : commonLang['사용'],
                '미사용' : approvalLang['미사용'],
                'mobile_approval': approvalLang['모바일 기안 허용'],
                'enable': commonLang['허용'],
                'disable': commonLang['비허용']
            };

        var FormListView = Backbone.View.extend({

            tagName: 'div',
            className: 'tb_wrap',
            folderId: null,
            formId: null,
            dataTable: null,
            tableSelector: '#form_list',

            initialize : function(options) {
            	options = options || {};
                this.folderId = options.folderId;
                this.formId = options.formId;
                this._initEventBinding();
            },

            render : function(callback) {
                this.$el.empty().html(listTmpl({ lang : lang }));
                this._renderFormListView(callback);
                return this.$el;
            },

            refreshList: function() {
                this.dataTable.tables.fnClearTable();
            },

            deleteSelected : function() {
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
                    $.go(baseApi + 'approval/apprform', JSON.stringify({ids: formIds}), {
                        qryType : 'DELETE',
                        contentType: 'application/json',
                        async: false,
                        responseFn : function(rs) {
                            $.goMessage(lang['delete_success_msg']);
                            self.render();
                        },
                        error : function(error) {
                            $.goMessage(lang['delete_fail_msg']);
                            self.render();
                        }
                    });
                });
            },

            renderForReorderView: function() {
                if (this.dataTable.tables.isEmpty()) {
                    $.goMessage(lang['empty_msg']);
                    return false;
                }

                this.dataTable.tables.find('tbody').sortable({
                    opacity : '1',
                    delay: 100,
                    scroll: false,
                    cursor : "move",
                    items : "tr",
                    containment : '.content_page',
                    hoverClass: "ui-state-hover",
                    helper : 'clone',
                    placeholder : 'ui-sortable-placeholder',
                    start : function (event, ui) {
                        ui.placeholder.html(ui.helper.html());
                        ui.placeholder.find('td').css('padding','5px 10px');
                    }
                });
            },

            saveReorderedList: function() {
                var url = baseApi + 'approval/apprformfolder/' + this.folderId + '/apprform/bulkmove',
                    sortoderIds,
                    ajaxCallback;

                sortoderIds = $(this.dataTable.tables.find('tbody>tr')).map(function(k,v) {
                    return $(v).find('input[name="id"]').val();
                }).get();

                ajaxCallback = function(rs) {
                    if(rs.code == 200){
                        $.goMessage(lang['reorder_changed']);
                    }else if(rs.code != 200) {
                        $.goMessage(rs.message);
                        this.render();
                    }
                };

                this.dataTable.tables.find('tbody').sortable("destroy");
                $.go(url, JSON.stringify({ ids : sortoderIds }), {
                    async: false,
                    qryType : 'PUT',
                    contentType : 'application/json',
                    responseFn : $.proxy(ajaxCallback, this)
                });
            },

            /**
            *
            * 존재하는 양식이 없는지 여부를 검사
            *
            */
            isEmpty: function() {
                return this.dataTable.tables.isEmpty();
            },
            
            getDraggable: function() {
                return {
                    selector: this.tableSelector + ' tbody > tr',
                    startCallback: function(event, ui) {
                        var draggingHtml = [];
                        draggingHtml.push('<div id="dragging-ui" class="org_member_helper"><ins></ins>');
                        draggingHtml.push($(this).find('td:eq(1)').text());
                        draggingHtml.push('</div>');
                        ui.helper.html(draggingHtml.join(''));
                    },
                    markAsDroppable: function() {
                        $('#dragging-ui')
                        .addClass('org_move_enable')
                        .removeClass('org_move_disable');
                    },
                    markAsNotDroppable: function() {
                        $('#dragging-ui')
                        .addClass('org_move_disable')
                        .removeClass('org_move_enable');
                    }
                };
            },

            _renderFormListView : function(callback) {
                var url = baseApi + 'approval/apprformfolder/' + this.folderId + '/apprform',
                    renderedEmptyMsg = this._renderEmptyTmpl({
                        lang : lang
                    });
                this.dataTable = $.goGrid({
                    el : this.tableSelector,
                    url : url,
                    method : 'GET',
                    pageUse : false,
                    sDomUse : false,
                    emptyMessage : renderedEmptyMsg,
//                    defaultSorting : [[ 1, "asc" ]],
                    // sDomType : 'admin',
                    checkbox : true,
                    checkboxData : 'id',
                    columns : [
                        {
                            mData: 'name',
                            bSortable: false,
                            sClass: "title",
                            fnRender : function(obj) {
                                return '<a class="form_name_alink" data-id="' + obj.aData.id + '">' + obj.aData.name + '</a>';
                            }
                        },
                        {
                            mData: "creator.name",
                            sClass: "uploader",
                            sWidth: "140px",
                            bSortable: false,
                            fnRender : function(obj) {
                                return obj.aData.creator.name + ' ' + obj.aData.creator.position;
                            }
                        },
                        {
                            mData: "adminInfo",
                            sClass: "admin",
                            sWidth: "200px",
                            bSortable: false,
                            fnRender : function(obj) {
                                return obj.aData.adminInfo ? obj.aData.adminInfo : '-';
                            }
                        },
                        {
                            mData: "formUserScope",
                            sWidth: "120px",
                            sClass: "power",
                            bSortable: false,
                            fnRender : function(obj) {
                                if (obj.aData.formUserScope == 'ALL') {
                                    return lang['all_scope'];
                                } else {
                                    return lang['specific_scope'];
                                }
                            }
                        },
                        {
                            mData: "state",
                            sWidth: "120px",
                            sClass: "status",
                            bSortable: false,
                            fnRender : function(obj) {
                                if (obj.aData.state == 'HIDDEN') {
                                    return lang['미사용'];
                                } else {
                                    return lang['사용'];
                                }
                            }
                        },
                        {
                            mData: "allowMobileApproval",
                            sWidth: "100px",
                            sClass: "mobile",
                            bSortable: false,
                            fnRender : function(obj) {
                                console.log(obj.aData.allowMobileApproval);
                                if (obj.aData.allowMobileApproval) {
                                    return lang['enable'];
                                } else {
                                    return lang['disable'];
                                }
                            }
                        }
                    ],

                    fnDrawCallback : $.proxy(function(tables, oSettings, listParams) {
                        this.$el.find('.toolbar_top .custom_header').append(this.$el.find('#csvDownLoad').show());
                        $('.tool_bar .dataTables_length').hide();

                        if (_.isFunction(callback)) {
                            callback();
                        }
                        $(this.dataTable.tables.find('tbody')).find('a[data-id=' + this.formId + ']').parent().parent().addClass('choice');
                    }, this)
                });
            },
            
            _renderEmptyTmpl: function(data) {
                var htmls = [];
                htmls.push('<tbody>');
                htmls.push('    <tr>');
                htmls.push('        <td colspan="5">');
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
                this.$el.on('click','.form_name_alink', $.proxy(this._goToShowForm, this));
                this.$el.on('click', '#check_all', $.proxy(this._toggleAllCheckboxes, this));
            },

            _goToShowForm: function(e) {
                var el = $(e.currentTarget),
                    formId = el.attr('data-id');
                GO.router.navigate('approval/apprform/' + formId, {trigger: true});
            },

            _toggleAllCheckboxes: function(e) {
                var el = $(e.currentTarget),
                    checkboxes = this.$el.find('input:checkbox');

                if (el.is(':checked')) {
                    checkboxes.attr('checked', 'checked');
                } else {
                    checkboxes.removeAttr('checked');
                }
            }
        });

        return FormListView;
    });
}).call(this);