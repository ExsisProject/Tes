(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!approval/nls/approval",
        "admin/views/appr_form_template_editor",
        "admin/views/admin_doc_type_select",
        "approval/views/security_level_list",

        "hgn!admin/templates/actcopy_form",
        "hgn!admin/templates/appr_form_template_editor",

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
        TemplateEditorView,
        DocTypeSelectView,
        SecurityLevelListView,

        formTmpl,
        templateTmpl
    ) {

        var ApprFormView,
            lang = {
                'head_title' : adminLang['결재 양식 추가'],
                'caption' : adminLang['등록정보'],
                'title' : commonLang['제목'],
                'description' : adminLang['양식설명'], 
                'form_name' : commonLang['제목'],
                'alias' : adminLang['양식약어'],
                'edit_template' : adminLang['양식 편집'],
                'template_editor' : commonLang['양식 편집기'],
                'template_preview' : commonLang['미리보기'],
                'company_doc_folder' : adminLang['전사 문서함 보관 폴더'],
                'state' : adminLang['사용여부'],
                'hidden' : adminLang['숨김'],
                'normal' : adminLang['정상'],
                'preserve_in_year' : approvalLang['보존연한'],
                'security_level' : adminLang['보안등급'],
                'empty_msg' : adminLang['등록된 양식이 없습니다.'],
                'creation_success_msg' : adminLang['저장되었습니다. 양식 목록으로 이동합니다.'],
                'creation_fail_msg' : adminLang['저장할 수 없습니다.'],
                'cancel_and_go_to_list_msg' : adminLang['취소하셨습니다. 이전 화면으로 이동합니다.'],
                'name_required' : adminLang['제목을 입력하세요.'],
                'duplicated_name' : adminLang['제목이 중복되었습니다.'],
                'alias_required' : adminLang['양식약어를 입력하세요.'],
                'name_invalid_length' : adminLang['제목은 20자까지 입력할 수 있습니다.'],
                'alias_invalid_length' : adminLang['약어는 20자까지 입력할 수 있습니다.'],
                'description_invalid_length' : adminLang['양식설명은 500자까지 입력할 수 있습니다.'],
                'folder_required' : adminLang['전사 문서함 폴더가 지정되지 않았습니다.'],
                'year' : approvalLang['년'],
                'forever' : approvalLang['영구'],
                'modify' : commonLang['수정'],
                'select' : commonLang['선택'],
                'add' : commonLang['추가'],
                'delete' : commonLang['삭제'],
                'save' : commonLang['저장'],
                'cancel' : commonLang['취소']
            };


        /**
        *
        * 결재 양식 상세 뷰이다. 생성과 수정에 사용된다.
        *
        */
        ApprFormView = Backbone.View.extend({
            
            el : '#layoutContent',
            templateEditorView: null,
            securityLevelsListView: null,
            model: null,

            initialize : function(options){
                this.model = options.model;
                this.templateEditorView = new TemplateEditorView();
                this.initBindingEvents();
            },

            initBindingEvents: function() {
                this.$el.off('click', '#load_template_editor');
                this.$el.off('click', '#preview_template');
                this.$el.off('click', '#save_btn');
                this.$el.off('click', '#cancel_btn');
                this.$el.on('click', '#load_template_editor', $.proxy(this._openTemplateEditor, this));
                this.$el.on('click', '#preview_template', $.proxy(this._previewTemplate, this));
                this.$el.on('click', '#docInfo_btn_edit', $.proxy(this._docTypeSelect, this));
                this.$el.on('click', '#docInfo_btn_delete', $.proxy(this._docTypeDelete, this));
                this.$el.on('click', '#save_btn', $.proxy(this._onSaveClicked, this));
                this.$el.on('click', '#cancel_btn', $.proxy(this._onCancelClicked, this));
            },
            
            render : function() {
                this.templateEditorView.setContent(this.model.get('templateHtml'));
                this.$el.html(formTmpl(this._makeTmplData(this.model)));
                this._rednerSecurityLevelListView();
                $('#docInfo_txt_form').live('change', $.proxy(this._onChangeCompanyFolder, this)).trigger('change');
            },
            
            _makeTmplData: function(model) {
                var preserveYears = _.map([1,3,5,0], function(num) {
                    return {
                        'value' : num,
                        'label' : (num == 0) ? lang['forever'] : App.i18n(commonLang["{{arg1}}년"],{arg1 : num}),
                        'isSelected' : (model.get('preserveDurationInYear') * 1 == num * 1) ? true : false
                    };
                });
                
                var wrappedState = function() {
                    return function(text) {
                        return text.replace('value="' + this.state + '"', 'value="' + this.state + '" checked');
                    };
                };
                
                var data = {
                    lang : lang,
                    preserveYears: preserveYears,
                    wrappedState: wrappedState
                };
                
                return _.extend(data, model.toJSON());
            },
            
            _rednerSecurityLevelListView: function() {
                this.securityLevelsListView = new SecurityLevelListView({
                    el: this.$el.find('select[name=securityLevel]'),
                    selectedData: this.model.get('securityLevel')
                });
                this.securityLevelsListView.render();
            },

            _openTemplateEditor: function() {
                this.templateEditorView.render();
            },

            _previewTemplate: function() {
                this.templateEditorView.preview();
            },
            
            _docTypeSelect: function(){
            	var self = this;
                var docTypeSelectViewLayer = $.goPopup({
                    "pclass" : "layer_normal layer_approval_line_state",
                    "header" : approvalLang['문서 분류 선택'],
                    "modal" : true,
                    "width" : 300,
                    "contents" :  "",
                    "buttons" : [
                         {
                            'btext' : commonLang['확인'],
                            'autoclose' : false,
                            'btype' : 'confirm',
                            'callback' : function(rs){
                                var check = docTypeSelectView.doc_type_confirm();
                                if(check){
                                	self.$el.find('#docInfo_txt_form').trigger('change');
                                    rs.close();
                                }else{
                                    return false;
                                }
                            }
                        },
                        {
                            'btext' : commonLang["취소"],
                            'btype' : 'cancel'
                        }
                    ]
                });
                
                var docTypeSelectView = new DocTypeSelectView();
                docTypeSelectView.render();
                docTypeSelectViewLayer.reoffset();
            },
            
            _docTypeDelete : function(){
                $('#docInfo_txt_form').text('');
                $('#docInfo_txt_form').attr('data-docTypeId', '');
                $('#docInfo_txt_form').trigger('change');
            },

            _onSaveClicked: function() {
                this.model.set('name', this.$el.find('input[name=name]').val());
                this.model.set('alias', this.$el.find('input[name=alias]').val());
                this.model.set('description', this.$el.find('textarea[name=description]').val());
                this.model.set('preserveDurationInYear', this.$el.find('[name=preserveDurationInYear]').val());
                this.model.set('state', this.$el.find('input[name=state]:checked').val());
                
                this.model.set('templateHtml', this.templateEditorView.getContent());
                this.model.set('securityLevel', this.securityLevelsListView.getSelectedData());
                
                var companyDocFolderId = $('#docInfo_txt_form').attr('data-docTypeId');
                this.model.set('companyDocFolder', ((companyDocFolderId) ? { id: companyDocFolderId } : null));
                
                if (!this.model.isValid()) {
                	if(this.model.validationError == 'name_invalid_length' || this.model.validationError == 'name_required'){
                        $.goMessage(lang[this.model.validationError]);
                        this.$el.find(':input[name=name]').select();
                	}else if(this.model.validationError == 'alias_invalid_length' || this.model.validationError == 'alias_required'){
                        $.goMessage(lang[this.model.validationError]);
                        this.$el.find(':input[name=alias]').select();
                	}else if(this.model.validationError == 'description_invalid_length'){
        				$.goMessage(GO.i18n(lang[this.model.validationError], {"arg1":"2","arg2": "255"}));
                        this.$el.find(':input[name=description]').select();
                	}else{
                        $.goMessage(lang[this.model.validationError]);                		
                	}
                    return false;
                }
                
                if (this.requestProcessing) {
                    return;
                } else {
                    this.requestProcessing = true;
                }
                
                this.model.save({}, {
                    success: $.proxy(function(model, resp, opts) {
                            $.goAlert(lang['creation_success_msg'], "", this._goToFormListView);
                        }, this),
                        
                    error: function(model, resp, opts) {
                        var message = lang['creation_fail_msg'];
                        if ( _.contains(resp['responseJSON']['message'], 'duplication.name') ) {
                            message = lang['duplicated_name'];
                        }
                        
                        $.goMessage(message);
                        return false;
                    },
                    
                    complete: function() {
                        this.requestProcessing = false;
                    }
                });
            },

            _onChangeCompanyFolder : function(e){
            	if(_.isEmpty($(e.currentTarget).attr('data-docTypeId'))){
                	$('#docInfo_txt_formAlert').text(lang['folder_required']);            		
            	}else{
                	$('#docInfo_txt_formAlert').text('');            		
            	}
            },
            
            _onCancelClicked: function() {
                $.goAlert(lang['cancel_and_go_to_list_msg'], "", $.proxy(this._goToFormListView, this));
                return false;
            },

            _goToFormListView: function() {
                GO.router.navigate('approval/actcopyform', {trigger: true});
                return false;
            }
        });
        
        return ApprFormView;
    });
}).call(this);