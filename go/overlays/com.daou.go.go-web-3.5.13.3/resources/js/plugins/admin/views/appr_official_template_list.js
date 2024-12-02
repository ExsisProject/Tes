define('admin/views/appr_official_template_list', function(require) {
    var apiBaseUrl = GO.contextRoot + 'ad/api/';
    var TemplateListAppView = require('admin/views/appr_form_template_list');
    var TemplateEditorView = require('admin/views/appr_form_template_editor');
    var lang = TemplateEditorView.lang;
    return TemplateListAppView.extend({
        _renderPopupContent: function() {
            this.dataTable = $.goGrid({
                el: '#' + this.popUpTableId,
                url: apiBaseUrl + 'approval/manage/official/form',
                method: 'GET',
                pageUse: false,
                sDomUse: false,
                emptyMessage: this._renderEmptyTmpl(),
                columns: [{
                    mData: 'name',
                    bSortable: true
                }, {
                    mData: null,
                    bSortable: false,
                    fnRender: function(obj) {
                        var htmls = [];
                        htmls.push('<div>');
                        htmls.push('<div id="' + obj.aData.id + '_template_storage" style="display:none">' + obj.aData.html + '</div>');
                        htmls.push('<span><a class="btn_fn7 template_preview" data-id="' + obj.aData.id + '">' + lang['template_preview'] + '</a></span>');
                        htmls.push('<span><a class="btn_fn11 template_select" data-id="' + obj.aData.id + '">' + lang['select'] + '</a></span>');
                        htmls.push('</div>');
                        return htmls.join('\n');
                    }
                }],
                fnDrawCallback: $.proxy(function() {
                    $('.tool_bar .dataTables_length').hide();
                    this.popupEl.reoffset();
                }, this)
            });
        }
    });
});