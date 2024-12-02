define([
    "jquery",
    "backbone",
    "app",

    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "i18n!approval/nls/approval",

    "hgn!admin/templates/appr_form_template_editor",
    'admin/views/appr_form_template_list',
    'components/form_component_manager/approval_form_manager',

    "formeditor",
    "jquery.go-sdk",
    "jquery.go-popup",
    "jquery.go-grid"
],
function(
    $,
    Backbone,
    App,

    commonLang,
    adminLang,
    approvalLang,

    editorTmpl,
    TemplateListAppView,
    FormComponentManager
) {

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

    /**
     * 템플릿 편집기 연동 부..
     */
    return Backbone.View.extend({

        editorElId: 'appr_form_template_editor',
        previewElId: 'template_preview_box',
        popupEl: null,
        htmlContent: null,
        approvalInfo: null,
        editorOption: {
            lang: GO.session('locale'),
            bUseApprovalType: 'approval',
            theme: 'form-appr-admin'
        },

        initialize: function(options) {
            options = _.extend({}, options);
            this.title = options.title;
            this.htmlContent = this.model && this.model.get('templateHtml');
            if (options.approvalInfo) {
                this.approvalInfo = options.approvalInfo;
            }
            if (_.isString(options.previewElId)) {
                this.previewElId = options.previewElId;
            }

            this.config = options.config;
            this.TemplateListModule = TemplateListAppView;

            if (this.approvalInfo) {
                this.editorOption.approvalInfo = this.approvalInfo;
            }

            if (_.isString(this.htmlContent)) {
                this.editorOption.content = $.goFormEditor.spanToDSL(this.htmlContent);
            }

            //this.listenTo(this.model, 'change', _.bind(function(a) {
            //    console.log(a.changed);
            //}, this));
        },

        render: function() {
            var toggleEl = $('.tWrap');
            var view = new FormComponentManager(_.extend(this.editorOption, {
                title: this.title,
                editorId: 'formEditor',
                model: this.model,
                config: this.config,
                toggleEl: toggleEl,
                companyIds: this.companyIds
            }));
            toggleEl.hide();
            $('body').append(view.render().el);
        },

        renderOldFormEditor: function() {
            this.popupEl = $.goPopup({
                'header': lang['edit_template'],
                'modal': true,
                'width': 1000,
                'height': '800px',
                'pclass': 'layer_normal layer_doc_edit',
                'contents': editorTmpl({lang: lang}),
                'closeCallback': _.bind(function() {
                    this._cancelTemplate();
                }, this)
            });

            var option = this.editorOption;

            if (this.approvalInfo) {
                option.approvalInfo = this.approvalInfo;
            }

            if (_.isString(this.htmlContent)) {
                option.editorValue = $.goFormEditor.spanToDSL(this.htmlContent);
            }

            $("#" + this.editorElId).goFormEditor(option);
            this.popupEl.off("click", "a#save_template");
            this.popupEl.off("click", "a#cancel_template");
            this.popupEl.off("click", "a#load_another_template");
            this.popupEl.on("click", "a#save_template", $.proxy(this._saveTemplate, this));
            this.popupEl.on("click", "a#cancel_template", $.proxy(this._cancelTemplate, this));
            this.popupEl.on("click", "a#load_another_template", $.proxy(this._loadAnotherTemplate, this));
        },

        /**
         * 결재방 개수, 결재방의 이름, 최대 결재자가 변경된 경우 htmlContent 를 sync 해주는 메소드
         * @param model
         */
        syncApprLineToHtmlContent: function(model, isRemove) {
            if (!this.htmlContent) return;
            var parsed = $(this.htmlContent);
            var $parsed = $(parsed[0]);
            var $boxes = $parsed.find('[data-group-seq]');
            var box = _.filter($boxes, function(boxEl) {
                var $boxEl = $(boxEl);
                return parseInt($boxEl.attr('data-group-seq')) === model.get('seq') && $boxEl.attr('data-is-reception') != "true";
            })[0];
            var $box = $(box);
            var type = $box.attr('data-group-type');

            if (_.has(model.changed, 'name')) {
                $box.attr('data-group-name', model.get('name'));
                $box.find('th').text(model.get('name'));
            }

            if (_.has(model.changed, 'maxApprovalCount')) {
                $box.attr('data-group-max-count', model.get('maxApprovalCount'));
                var $cloned, $parent;
                if (type === 'type1') {
                    var $th = $box.find('th');
                    $cloned = $th.siblings('td:first').clone();
                    $parent = $th.parent();
                    $th.siblings('td').remove();
                } else { // type2
                    $cloned = $box.children(':first').clone();
                    $parent = $box;
                    $box.children().remove();
                }
                for (var i = 0; i < model.get('maxApprovalCount'); i++) {
                    $parent.append($cloned.clone());
                }
            }

            if (isRemove) $box.remove();

            this.htmlContent = $('<div>').append($parsed).html(); // outerHTML
            this.model.set('templateHtml', this.htmlContent);
        },

        /**
         * 주어진 액티비티 그룹 정보대로, templateHtml이 적절하게 그려졌는지 확인한다.
         */
        validateActivityGroups: function(activityGroups) {
            var parsed = $.parseHTML(this.model.get('templateHtml')),
                templateGroupInfos,
                $approvalBoxes,
                isValid = true;

            if (_.isNull(parsed)) {
                return true;
            }

            $approvalBoxes = _.filter($(parsed[0]).find('[data-group-seq]'), function(activityGroupElement) {
                return $(activityGroupElement).attr("data-is-reception") != "true";
            });

            templateGroupInfos = _.map($approvalBoxes, function(activityGroupElement) {
                return {
                    'seq': $(activityGroupElement).data('group-seq'),
                    'name': $(activityGroupElement).data('group-name'),
                    'activityMaxCount': $(activityGroupElement).data('group-max-count')
                };
            });

            _.each(activityGroups, function(group) {
                // (1) 필요한 그룹이 모두 있는지 검사.
                var templateGroupSeqList = _.map(templateGroupInfos, function(info) {
                    return info['seq'];
                });
                if (!_.contains(templateGroupSeqList, group['seq'])) {
                    console.log("Template Html validation is fail: Missing group box.");
                    isValid = false;
                }

                _.each(templateGroupInfos, function(info) {
                    if (group['seq'] == info['seq']) {
                        // (2) 각 그룹의 이름이 일치하는지 검사
                        if (group['name'] != info['name']) {
                            console.log("Template Html validation is fail: Unmatching group box name.");
                            isValid = false;
                        }

                        // (3) 각 그룹의 최대 결재자수가 일치하는지 검사
                        if (group['maxApprovalCount'] != info['activityMaxCount']) {
                            console.log("Template Html validation is fail: Not matching approval count.");
                            isValid = false;
                        }
                    }
                });
            });

            return isValid;
        },

        /*
         * 자동 결재선의 설정값을 validation처리 한다.
         */
        validateApprLineRuleForm: function(apprLineRuleFormModel) {
            var parsed = this.model.get('templateHtml'),
                isValid = true;

            if (_.isNull(parsed)) {
                return true;
            }

            if (apprLineRuleFormModel && apprLineRuleFormModel.apprLineRuleGroups) {
                //옵션이 2개 이상일 경우 - 단일선택 ,자동결재선(radio) 또는 복수선택 ,자동결재선(select)이 있어야 한다.
            	if(_.isUndefined(apprLineRuleFormModel.apprLineRuleOptionCount)){
            		apprLineRuleFormModel.apprLineRuleOptionCount = apprLineRuleFormModel.apprLineRuleGroups.length;
            	}
                if (apprLineRuleFormModel.apprLineRuleGroups && apprLineRuleFormModel.apprLineRuleOptionCount > 1) {
                    if (parsed.indexOf("apprLineRuleOption") == -1) {
                        isValid = false;
                    }
                }
                //금액이 설정 되어 있을 경우
                if (apprLineRuleFormModel.useAccountRule) {
                    if (parsed.indexOf("apprLineRuleAmount") == -1) {
                        isValid = false;
                    }
                }
            }

            return isValid;
        },

        /**
         * 편집기 부분에 html 데이터를 넣어서 보여준다.
         */
        setContent: function(htmlContent) {
            this.htmlContent = htmlContent;
        },

        setApprovalInfo: function(info) {
            this.approvalInfo = info;
        },
        
        setCompanyIds: function(companyIds) {
        	this.companyIds = companyIds;
        },
        
        setTitle: function(title) {
            this.title = title;
        },

        /**
         * 편집기에 보여지고 있는 html을 반환한다.
         */
        getContent: function() {
            return this.htmlContent;
        },

        /**
         * 미리 보기 화면을 띄워서 보여준다.
         */
        preview: function(content) {
            var popup = $.goPopup({
                'allowPrevPopup': true,
                'header': lang['template_preview'],
                'modal': true,
                'top': '20%',
                'width': 810,
                'pclass': 'layer_normal layer_doc_edit_preview',
                'contents': '<form><div class="doc_wrap" style="width:780px" class="ie9-scroll-fix" id="' + this.previewElId + '"></div></form>'
            });

            content = content || this.model.get('templateHtml');
            if (!content) {
                $.goSlideMessage(lang.empty_msg, 'caution');
                popup.close();
            } else {
                $("#" + this.previewElId).setTemplate({
                    data: content
                });

                if (parseInt(popup.css('height')) < 100) {
                    popup.css('height', 100);
                }

                popup.find("div.content").css({
                    'max-height': '500px',
                    'overflow': 'auto'
                });

                popup.reoffset();
            }
        },

        _saveTemplate: function() {
            this.htmlContent = $.goFormEditor.getContent(this.editorElId);
            this.model.set('templateHtml', this.htmlContent);
            this.popupEl.close();
        },

        _cancelTemplate: function() {
            if (this.templateListView) {
                this.templateListView.close();
            }
            this.popupEl.close();
        },

        _loadAnotherTemplate: function() {
            if (!this.templateListView || this.templateListView.isListViewOpen == false) {
                this.templateListView = new this.TemplateListModule({
                    EditorModule: this.constructor,
                    selectCallback: $.proxy(function(htmlContent) {
                        $.goFormEditor.putContent(this.editorElId, htmlContent);
                    }, this)
                });
                this.templateListView.render();
                this.templateListView.isListViewOpen = true;
            }
        }
    }, {
        lang: lang
    });
});