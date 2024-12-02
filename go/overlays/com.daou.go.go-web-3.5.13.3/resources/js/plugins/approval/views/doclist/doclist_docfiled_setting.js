// 필드 설정
define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "approval/models/doc_list_field",
    "approval/views/doclist/docfield_setting_layer",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval"
], 
function(
    $, 
    _, 
    Backbone, 
    GO,
    DocListFieldModel,
    DocfieldSettingLayerView,
    commonLang,
    adminLang,
    approvalLang
) {
    
    return Backbone.View.extend({
        
        initialize: function(options) {
        	this.options = options || {};
            this.$appendTarget = this.options.appendTarget;
            this.toRemoveColumns = this.options.toRemoveColumns;
            this.targetView = this.options.targetView;
            /**
             * 현재 view가 그려진 이후에도, 콜렉션 fetch URL은 계속 바뀔 수 있다. <br>
             * 이를 동적으로 반영하기 위해 값이 아닌 메소드를 캐시함
             */
            this.docFolderType = options.docFolderType;
        },
        
        render: function() {
            var tmpl = [];
            tmpl.push('<a id="popupDocField" class="btn_tool" data-role="button">');
            tmpl.push('  <span class="ic_toolbar setting"></span>  <span class="txt">{{lang.필드 설정}}</span>')
            tmpl.push('</a>');
            
            this.$appendTarget.append(Hogan.compile(tmpl.join('')).render({
                lang: {
                    '필드 설정' : approvalLang['필드 설정']
                }
            }));
            
            this.$appendTarget.find('a#popupDocField').bind('click', $.proxy(this.popupDocField, this));
        },
        
        remove: function() {
            this.$appendTarget.find('a#popupDocField').remove();
        },

        popupDocField: function (e) {
            var self = this;
            e.preventDefault();
            var docfieldSettingLayer = $.goPopup({
                "pclass": "layer_normal layer_fieldName",
                "header": approvalLang['필드 목록'],
                "modal": true,
                "width": 600,
                "contents": "",
                "buttons": [
                    {
                        'btext': commonLang['확인'],
                        'btype': 'confirm',
                        'autoclose': false,
                        'callback': function (rs) {
                            self.saveDocListField();
                            rs.close();
                        }
                    }, {
                        'btext': commonLang["취소"],
                        'btype': 'cancel'
                    }
                ]
            });

            this.docfieldSettingLayerView = new DocfieldSettingLayerView({
                docFolderType: this.docFolderType,
                toRemoveColumns: this.toRemoveColumns
            });

            this.docfieldSettingLayerView.render().done(function () {
                docfieldSettingLayer.reoffset();
            });

            return false;
        },

        saveDocListField: function () {
            var self = this;
            var model = new DocListFieldModel();
            model.set('docListFields', this.docfieldSettingLayerView.getData());
            model.save({}, {
                success: function (model, resp) {
                    self.targetView.render();
                },
                error: function (model, resp) {

                }
            });
        }
    });
});