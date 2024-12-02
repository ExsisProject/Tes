(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!approval/nls/approval",
        "admin/views/appr_official_doc_form_template_editor",
        "hgn!admin/templates/appr_official_doc_form"
    ],
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        approvalLang,
        TemplateEditorView,
        formTmpl
    ) {

        var lang = {
            'head_title' : adminLang['결재 양식 추가'],
            'caption' : '시행문 양식',
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
            'cancel' : commonLang['취소'],
            'use' : approvalLang["사용"],
            'unuse' : approvalLang['미사용']
        };


        /**
        *
        * 공문서 양식 상세 뷰이다. 생성과 수정에 사용된다.
        *
        */
        return Backbone.View.extend({
            
            el : '#layoutContent',
            templateEditorView: null,
            model: null,

            events: {
                'change input[name="name"]': '_onChangeNameOfView'
            },

            initialize : function(options){
                this.$el.off();
                this.model = options.model;
                this.templateEditorView = new TemplateEditorView({
                    model: this.model,
                    official: true
                });
                this.initBindingEvents();

                this.listenTo(this.model, 'change:name', _.bind(this._onChangeNameOfModel, this));
            },

            initBindingEvents: function() {
                this.$el.off('click', '#load_template_editor');
                this.$el.off('click', '#preview_template');
                this.$el.off('click', '#save_btn');
                this.$el.off('click', '#cancel_btn');
                this.$el.on('click', '#load_template_editor', $.proxy(this._openTemplateEditor, this));
                this.$el.on('click', '#preview_template', $.proxy(this._previewTemplate, this));
                this.$el.on('click', '#save_btn', $.proxy(this._onSaveClicked, this));
                this.$el.on('click', '#cancel_btn', $.proxy(this._onCancelClicked, this));
            },
            
            render : function() {
                this.templateEditorView.setContent(this.model.get('html'));
                this.$el.html(formTmpl(this._makeTmplData(this.model)));
            },

            _onChangeNameOfView: function() {
                this.model.set('name', this.$('input[name=name]').val());
            },

            _onChangeNameOfModel: function() {
                this.$('input[name=name]').val(this.model.get('name'));
            },
            
            _makeTmplData: function(model) {
                var wrappedState = function() {
                    return function(text) {
                        return text.replace('value="' + this.state + '"', 'value="' + this.state + '" checked');
                    };
                };
                
                var data = {
                    lang : lang,
                    wrappedState: wrappedState
                };
                
                return _.extend(data, model.toJSON());
            },
            
            _openTemplateEditor: function() {
                this.templateEditorView.render();
            },

            _previewTemplate: function() {
                this.templateEditorView.preview(this.templateEditorView.getContent());
            },

            _onSaveClicked: function() {
            	var self = this;
                //this.model.set('name', this.$el.find('input[name=name]').val());
                this.model.set('state', this.$el.find('input[name=state]:checked').val());
                this.model.set('html', this.templateEditorView.getContent());
                
                if (!this.model.isValid()) {
                	if(this.model.validationError == 'name_invalid_length' || this.model.validationError == 'name_required'){
                        $.goMessage(lang[this.model.validationError]);
                        this.$el.find(':input[name=name]').select();
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
                	url : GO.contextRoot + 'ad/api/approval/manage/official/form/',
                    success: $.proxy(function(model, resp, opts) {
                            $.goAlert(lang['creation_success_msg'], "", this._goToFormListView);
                        }, this),
                        
                    error: function(model, resp, opts) {
                        var message = lang['creation_fail_msg'];
                        if ( _.contains(resp['responseJSON']['name'], 'bad.request') ) {
                            message = lang['duplicated_name'];
                        }
                        
                        $.goMessage(message);
                        return false;
                    },
                    
                    complete: function() {
                    	self.requestProcessing = false;
                    }
                });
            },
            
            _onCancelClicked: function() {
                $.goAlert(lang['cancel_and_go_to_list_msg'], "", $.proxy(this._goToFormListView, this));
                return false;
            },

            _goToFormListView: function() {
                GO.router.navigate('approval/manage/official', {trigger: true});
                return false;
            }
        });
    });
}).call(this);