//결재 양식 관리 > 자동결재선 설정
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 

    "hgn!admin/templates/appr_line_rule_list_select",
    "hgn!admin/templates/appr_line_rule_form_item",
    
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval"
], 
function(
    $, 
    _, 
    Backbone, 
    GO,

    ApprLineRuleSelectTpl,
    ApprLineRuleFormItemTpl,
    
    commonLang,
    adminLang,
    approvalLang
) {
    var lang = {
            "해당 폴더는 선택할 수 없습니다" : approvalLang['해당 폴더는 선택할 수 없습니다'],
            "자동 결재선 선택" : approvalLang["자동 결재선 선택"],
            "결재선" : approvalLang["결재선"],
            "※ 자동 결재선은 페이지 왼쪽 ‘자동 결재선 설정‘ 에서 할 수 있습니다" : approvalLang["※ 자동 결재선은 페이지 왼쪽 ‘자동 결재선 설정‘ 에서 할 수 있습니다"],
            'empty_msg' : approvalLang['자료가 없습니다'],
            "자동결재선 명" : approvalLang["자동결재선 명"]
    };

    var ApprLineRuleFormModel = Backbone.Model.extend({
        url: function() {
            return "/ad/api/approval/apprlinerule";
        },
        setUrl : function(url){
            this.url = url;
        }
    });
    
    var ApprLineRuleFormView = Backbone.View.extend({
        el : ".layer_pay_line .content",
        initialize: function(options) {
            this.options = options || {};
            this.collection = this.options.collection;
            this.ApprLineRuleFormModel = new ApprLineRuleFormModel();
            this.ApprLineRuleFormModel.fetch({async : false});
            this.$el.data('instance', this);
            this.on('_callApprLineRuleSelect', _.bind(this._callApprLineRuleSelect, this));
        },
        
        events: {
            'change #apprLineRuleSelect' : '_selectRenderDetailBoard'
        },
        
        render: function() {
            var self = this;
            this.$el.html(Hogan.compile(ApprLineRuleSelectTpl({
                data: self.collection.toJSON(),
                lang: lang
            })).render());
            
            var firstModel = this.collection.at(0);
            if(firstModel){
                self._renderDetailBoard(firstModel.get('id'));
            }else{
                $('#appr_line_tbody').html(self._renderEmptyTmpl({
                    lang : lang
                }));
            }
        },
        
        _selectRenderDetailBoard: function(e){
            this._renderDetailBoard($(e.currentTarget).val());
        },

        _callApprLineRuleSelect: function(e){
            var id = self.$("#apprLineRuleSelect > option[txt-name='"+ $('#selectedLineRule').text() +"']").val();
            self.$("#apprLineRuleSelect > option[txt-name='"+ $('#selectedLineRule').text() +"']").attr("selected", "true");
            this._renderDetailBoard(id);
        },

        renderDetailBoard: function() {
            var id = this.$('#apprLineRuleSelect').val();
            this._renderDetailBoard(id);
        },

        _renderDetailBoard: function(id){
            var list = _.findWhere(this.ApprLineRuleFormModel.toJSON(),{id:parseFloat(id)});
            
            $('#appr_line_tbody').empty();
            if (_.isEmpty(list)) {
                $('#appr_line_tbody').html(this._renderEmptyTmpl({
                    lang: lang
                }));
            } else {
                $('#appr_line_tbody').html(ApprLineRuleFormItemTpl({
                    data: list
                }));
            }
        },
        
        _renderEmptyTmpl: function(data) {
            var htmls = [];
            htmls.push('    <tr>');
            htmls.push('        <td colspan="4">');
            htmls.push('            <p class="data_null">');
            htmls.push('                <span class="ic_data_type ic_no_data"></span>');
            htmls.push('                <span class="txt">{{lang.empty_msg}}</span>');
            htmls.push('            </p>');
            htmls.push('        </td>');
            htmls.push('    </tr>');

            var compiled = Hogan.compile(htmls.join('\n'));
            return compiled.render(data);
        }
    });
    
    
    return ApprLineRuleFormView;
});