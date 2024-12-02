define('admin/views/appr_form_template_list', function (require) {

    var commonLang = require('i18n!nls/commons');
    var approvalLang = require('i18n!approval/nls/approval');
    var adminLang = require('i18n!admin/nls/admin');
    var apiBaseUrl = GO.contextRoot + 'ad/api/';
    var lang = {
        'head_title': approvalLang['결재 양식 추가'],
        'caption': commonLang['등록정보'],
        'title': commonLang['제목'],
        'form_name': commonLang['제목'],
        'edit_template': approvalLang['양식 편집'],
        'template_editor': approvalLang['양식 편집기'],
        'template_preview': commonLang['미리보기'],
        'load_another_template': approvalLang['다른 양식 불러오기'],
        'load_template_title': approvalLang['다른 양식 조회'],
        'state': adminLang['사용여부'],
        'hidden': adminLang['숨김'],
        'normal': adminLang['정상'],
        'empty_msg': approvalLang['등록된 양식이 없습니다.'],
        'creation_success_msg': approvalLang['저장되었습니다. 양식 목록으로 이동합니다.'],
        'creation_fail_msg': commonLang['저장할 수 없습니다.'],
        'cancel_and_go_to_list_msg': approvalLang['취소하셨습니다. 이전 화면으로 이동합니다.'],
        'msg_cannot_preview_html': approvalLang['현재 일시적인 문제로 양식을 미리보기 할 수 없습니다. 잠시 후 다시 시도해주세요.'],
        'select': commonLang['선택'],
        'add': commonLang['추가'],
        'delete': commonLang['삭제'],
        'save': commonLang['저장'],
        'cancel': commonLang['취소']
    };

    return Backbone.View.extend({

        popupEl: null,
        dataTable: null,
        selectCallback: null,
        popUpTableId: 'template_table',
        isListViewOpen: false,

        initialize: function(options) {
            options = _.extend({}, options);
            this.selectCallback = options.selectCallback;
            this.EditorModule = options.EditorModule;
        },

        render: function() {
            this._renderPopup();
            this._renderPopupContent();
            this._bindEventsToContent();
        },

        close: function() {
            this.isListViewOpen = false;
            if (this.dataTable) {
                this.dataTable.tables.remove();
            }
            if (this.popupEl) {
                this.popupEl.close();
            }
            this.remove();
        },

        _renderPopup: function() {
            var html = [];
            var self = this;

            html.push('<table class="chart" id="' + this.popUpTableId + '">');
            html.push('    <thead>');
            html.push('        <tr>');
            html.push('            <th class="sorting"><span class="title_sort">' + lang['form_name'] + '<ins class="ic"></ins></span></th>');
            html.push('            <th class="sorting_disabled"><span class="title_sort">' + lang['select'] + '<ins class="ic"></ins></span></th>');
            html.push('        </tr>');
            html.push('    </thead>');
            html.push('</table>');

            this.popupEl = $.goPopup({
                'allowPrevPopup': true,
                'header': lang['load_template_title'],
                'modal': true,
                'width': 800,
                'pclass': 'layer_normal layer_recep_list',
                'contents': html.join('\n'),
                'closeCallback': function() {
                    self._closeTemplate();
                }
            });
        },

        _renderPopupContent: function() {
            var renderedEmptyMsg = this._renderEmptyTmpl();

            this.dataTable = $.goGrid({
                el: '#' + this.popUpTableId,
                url: apiBaseUrl + 'approval/apprform',
                method: 'GET',
                displayLength: 10,
                emptyMessage: renderedEmptyMsg,
                defaultSorting: [[1, "asc"]],
                columns: [{
                    mData: 'name',
                    bSortable: true
                }, {
                    mData: null,
                    bSortable: false,
                    fnRender: function(obj) {
                        var htmls = [];
                        htmls.push('<div>');
                        htmls.push('<div id="' + obj.aData.id + '_template_storage" style="display:none">' + obj.aData.templateHtml + '</div>');
                        htmls.push('<span><a class="btn_fn7 template_preview" data-id="' + obj.aData.id + '">' + lang['template_preview'] + '</a></span>');
                        htmls.push('<span><a class="btn_fn11 template_select" data-id="' + obj.aData.id + '">' + lang['select'] + '</a></span>');
                        htmls.push('</div>');
                        return htmls.join('\n');
                    }
                }],
                fnDrawCallback: $.proxy(function() {
                    this.$el.find('.toolbar_top .custom_header').append(this.$el.find('#csvDownLoad').show());
                    $('.tool_bar .dataTables_length').hide();
                    this.popupEl.reoffset();
                }, this)
            });
        },

        _bindEventsToContent: function() {
            var popUpEl = $('#' + this.popUpTableId);
            popUpEl.off('click', 'a.template_preview');
            popUpEl.off('click', 'a.template_select');
            popUpEl.on('click', 'a.template_preview', $.proxy(this._previewTemplate, this));
            popUpEl.on('click', 'a.template_select', $.proxy(this._selectTemplate, this));
        },

        _previewTemplate: function(e) {
            var formId = $(e.currentTarget).data('id');
            var previewElId = 'template_preview_from_list';
            var htmlTemplate = this._getHtmlTemplate(formId);
            if (htmlTemplate) {
                var popup = $.goPopup({
                    'allowPrevPopup': true,
                    'header': lang['template_preview'],
                    'modal': true,
                    'top': '20%',
                    'width': 810,
                    'pclass': 'layer_normal layer_doc_edit_preview',
                    'contents': '<form><div class="doc_wrap" style="width:780px" class="ie9-scroll-fix" id="' + previewElId + '"></div></form>'
                });
                $("#" + previewElId).setTemplate({
                    data: htmlTemplate
                });

                if (parseInt(popup.css('height')) < 100) {
                    popup.css('height', 100);
                }

                popup.find("div.content").css({
                    'max-height': '500px',
                    'overflow': 'auto'
                });

                popup.reoffset();

            } else {
                $.goSlideMessage(lang.empty_msg, 'caution');
            }
        },

        _selectTemplate: function(e) {
            var formId = $(e.currentTarget).data('id');
            var htmlTemplate = this._getHtmlTemplate(formId);
            if (htmlTemplate) {
                this.selectCallback(htmlTemplate);
                this.isListViewOpen = false;
                this.popupEl.close('', e);
            } else {
                $.goSlideMessage(lang.empty_msg, 'caution');
            }
        },

        _closeTemplate: function() {
            this.isListViewOpen = false;
            if (this.dataTable) {
                this.dataTable.tables.remove();
            }
            this.remove();
        },

        _getHtmlTemplate: function(formId) {
            var templateHtml = $('#' + formId + '_template_storage').contents();
            return templateHtml.clone().show().html();
        },

        _renderEmptyTmpl: function(data) {
            data = data || {};
            var htmls = [];
            htmls.push('<tbody>');
            htmls.push('    <tr>');
            htmls.push('        <td colspan="2">');
            htmls.push('            <p class="data_null">');
            htmls.push('                <span class="ic_data_type ic_no_data"></span>');
            htmls.push('                <span class="txt">{{lang.empty_msg}}</span>');
            htmls.push('            </p>');
            htmls.push('        </td>');
            htmls.push('    </tr>');
            htmls.push('</tbody>');

            var compiled = Hogan.compile(htmls.join('\n'));
            return compiled.render(_.extend(data, {lang: lang}));
        }
    });
});