define('components/form_component_manager/form_component_manager', function(require) {

    var commonLang = require('i18n!nls/commons');
    var lang = _.extend(commonLang, {
        'text': commonLang['텍스트'],
        'editor': commonLang['편집기'],
        'textarea': commonLang['멀티텍스트'],
        'number': commonLang['숫자'],
        'currency': commonLang['통화'],
        'radio': commonLang['단일선택'],
        'cSel': commonLang['드롭박스'],
        'check': commonLang['체크박스'],
        'calendar': commonLang['날짜'],
        'time': commonLang['시간'],
        'period': commonLang['기간'],
        'draftUser' : commonLang['기안자'],
        'draftUserEmail' : commonLang['기안자이메일'],
        'position' : commonLang['직위'],
        'empNo' : commonLang['사번'],
        'mobileNo' : commonLang['핸드폰번호'],
        'directTel' : commonLang['직통전화'],
        'repTel' : commonLang['대표번호'],
        'fax' : commonLang['팩스'],
        'draftDept' : commonLang['기안부서'],
        'draftDate' : commonLang['기안일'],
        'completeDate' : commonLang['완료일'],
        'docNo' : commonLang['문서번호'],
        'recipient' : commonLang['수신자'],
        'officialDocReceiver' : commonLang['공문수신처'],
        'officialDocVersionReceiver': '공문수신처2',
        'preserveDuration': commonLang['보존연한'],
        'securityLevel': commonLang['보안등급'],
        'docClassification': commonLang['전사문서함'],
        'docReference': commonLang['참조자'],
        'openOption': commonLang['공개여부'],
        'officialDocSender': commonLang['발신명의'],
        'attachFile': commonLang['첨부파일명'],
        'name_pos': commonLang['이름 및 직위'],
        'user_name': commonLang['이름'],
        'user_pos': commonLang['직위'],
        'user_empno': commonLang['사번'],
        'user_org': commonLang['소속부서'],
        'today': commonLang['오늘날짜'],
        '제목을 입력하세요': commonLang['제목을 입력하세요.'],
        'cSum': commonLang['합계 입력'],
        'rSum': commonLang['합계 표시'],
        '합계 입력 설명': commonLang['숫자 설명'],
        '합계 표시 설명': commonLang['숫자 설명'],
        '소수점 자리 수' : commonLang['소수점 자리 수'],
        '문서번호 타입' : commonLang['문서번호 타입'],
        '문서번호 타입 설명' : commonLang['문서번호 타입 설명'],
        '원본문서번호' : commonLang['원본문서번호'],
        '수신문서번호' : commonLang['수신문서번호'],
        'onlyNumber' : commonLang['숫자만 입력 가능'],
        '에디터본문' : commonLang['에디터(본문)'],
        '에디터편집기' : commonLang['에디터(편집기)'],
        '글씨 크기' : commonLang['글씨 크기']
    });

    // unselectable: IE 전용 attribute
    var componentWrapperStartTag = '<span unselectable="on" contenteditable="false" class="comp_wrap" data-cid="{{cid}}" data-dsl="{{dsl}}" data-wrapper style="{{style}}" data-value="" data-autotype="{{isAutoType}}">';
    var componentBorder = [
        '<span contenteditable="false" class="comp_active" {{^isActive}}style="display:none;"{{/isActive}}>',
            '<span class="Active_dot1"></span><span class="Active_dot2"></span>',
            '<span class="Active_dot3"></span><span class="Active_dot4"></span>',
        '</span>'
    ].join(' ');
    var componentDeleteButton = [
        '<span contenteditable="false" class="comp_hover" data-content-protect-cover="true" data-origin="{{cid}}">',
            '<a contenteditable="false" class="ic_prototype ic_prototype_trash" data-content-protect-cover="true" data-component-delete-button="true"></a>',
        '</span>'
    ].join(' ');
    var componentWrapperEndTag = '</span>';
    var componentWrapperBehindTags = [componentBorder, componentDeleteButton, componentWrapperEndTag].join(' ');

    var optionItem = Hogan.compile([
        '<li data-value="{{option.value}}">',
        '<i class="ic_prototype ic_prototype_move"></i>',
        '<span class="attr_optipt_wrap">',
        '<input data-option-name class="ipt_prototype" type="text" value="{{option.value}}" data-id="{{option.id}}">',
        '</span>',
        '<i class="ic_prototype ic_prototype_del_s" data-delete-option></i>',
        '</li>'
    ].join(' '));

    var PalletItemTemplate = Hogan.compile([
        '<li data-pallet-item="{{data.type}}" data-info="{{info}}">',
        '<a class="btn_comp btn_comp_approveLine">',
        '<span class="ic_comp {{iconClass}}"></span>',
        '<span class="label">{{label}}</span>',
        '</a>',
        '</li>'
    ].join(' '));

    /**
     * https://wiki.daou.co.kr/pages/viewpage.action?pageId=45028155
     */

    var Template = require('hgn!components/form_component_manager/templates/form_component_manager');
    var BackdropView = require('components/backdrop/backdrop');

    var COMPONENT_TEMPLATES = require('components/form_component_manager/constants/templates');
    var Preview = require('components/form_component_manager/preview');
    //var HTMLConverter = require('components/form_component_manager/html_converter');
    var COMPONENTS = require('components/form_component_manager/constants/components');
    return Backbone.View.extend({

        className: 'wrap_prototype',

        editorId: 'formEditor',
        TIMER_TIME: 300,
        isProcessing: false,

        SELECT_DOCUMENT_TYPE_COMPONENTS:[COMPONENTS['문서번호'].data.id],
        OPTION_AVAILABLE_COMPONENTS: ['radio', 'check', 'cSel'],
        ID_AVAILABLE_COMPONENTS: ['text', 'number', 'textarea', 'editor', 'cOrg', 'calendar', 'cSum', 'rSum', 'label', 'span'],
        WIDTH_AVAILABLE_COMPONENTS: ['text', 'number', 'currency', 'calendar', 'cSum', 'rSum'],
        REQUIRE_AVAILABLE_COMPONENTS: ['text', 'number', 'currency', 'textarea', 'calendar', 'cSum'],
        MAX_LENGTH_AVAILABLE_COMPONENTS: ['text', 'number', 'currency', 'textarea', 'cSum'],
        CURRENCY_DIGITS_AVAILABLE_COMPONENTS : ['currency'],
        DEFAULT_STR_AVAILABLE_COMPONENTS: ['text', 'number', 'currency', 'textarea', 'calendar'],
        NUMBER_COMPONENTS: ['number', 'cSum', 'rSum'],
        FONT_SIZE_AVAILABLE_COMPONENTS: [
            'draftUser', 'draftDept', 'draftUserEmail', 'position', 'empNo', 'mobileNo', 'directTel', 'repTel', 'fax',
            'draftDate', 'completeDate', 'docNo', 'openOption', 'securityLevel', 'preserveDuration', 'docClassification',
            'attachFile', 'docReference', 'recipient', 'officialDocSender'
        ],
        ID_UN_AVAILABLE_COMPONENTS: [
            COMPONENTS['제목'].data.id, COMPONENTS['본문 내용'].data.id,
            COMPONENTS['기안자'].data.id, COMPONENTS['기안부서'].data.id,
            COMPONENTS['기안자이메일'].data.id, COMPONENTS['직위'].data.id,
            COMPONENTS['사번'].data.id, COMPONENTS['핸드폰번호'].data.id,
            COMPONENTS['직통전화'].data.id, COMPONENTS['대표번호'].data.id,
            COMPONENTS['팩스'].data.id, COMPONENTS['기안일'].data.id,
            COMPONENTS['완료일'].data.id, COMPONENTS['문서번호'].data.id,
            COMPONENTS['공개여부'].data.id, COMPONENTS['보안등급'].data.id,
            COMPONENTS['보존연한'].data.id, COMPONENTS['전사문서함'].data.id,
            COMPONENTS['첨부파일명'].data.id, COMPONENTS['참조자'].data.id,
            COMPONENTS['수신자'].data.id, COMPONENTS['발신명의'].data.id,
            COMPONENTS['공문수신처'].data.id, COMPONENTS['공문수신처2'].data.id
        ],
        
        CUSTOM_COMPONENT_LABEL: {
            'maxLength' : {
                'text': commonLang['입력 가능 최대 글자 수 (기본 100자)'],
                'textarea': commonLang['입력 가능 최대 글자 수 (기본 100자)'],
                'number': commonLang['입력 가능 최대 자릿수'],
                'currency': commonLang['입력 가능 최대 자릿수'],
                'cSum': commonLang['입력 가능 최대 자릿수'],
            }
        },

        events: {
            'change input[type="radio"]': '_onChangeRadio',
            'change input[type="checkbox"]': '_onChangeCheckbox',
            'change select': '_onChangeSelect',
            'click span.btn_help': '_onClickHelp',
            'click [data-cover]': '_onClickInputCover',
            'click .ic_prototype_del_s': '_onClickDeleteButton',
            'click span[data-select-custom]': '_onClickCustomSelect',
            'click [data-select-custom-layer] dd': '_onClickCustomSelectOption',

            'change #numberType': '_onChangeNumberType',
            'change #formName': '_onChangeFormName',
            'change [data-layout-input]': '_onChangeLayout',
            'hover [data-layout-button]': '_onHoverLayout',
            'click [data-layout-button]': '_onClickLayout',
            'click #loadForm': '_onClickLoadForm',
            'click #formEditorPrevie': '_onClickPreview',
            'click #formEditorCancel': '_onClickCancel',
            'click #formEditorSave': '_onClickSave',
            'click [data-left-panel]': '_onClickLeftPanel',
            'click [data-right-panel]': '_onClickRightPanel',
            'click [data-pallet-item]': '_onClickPalletItem',
            'click [data-delete-option]': '_onClickDeleteOption',
            'click [data-add-option]': '_onClickAddOption',
            'change [data-listen-form="change"]': '_onChangeAttribute',
            'change [data-option-name]': '_onChangeOptionName'
        },

        initialize: function(options) {
            this.title = options.title;
            this.isOfficial = options.isOfficial ? options.isOfficial : false;
            this.content = options.content;
            this.saveCallback = options.saveCallback;
            this.toggleEl = options.toggleEl;
            this.useLoadForm = options.useLoadForm !== false;

            this.preview = new Preview();
            this.preview.$el.on('hide', _.bind(function() {
                this.$el.show();
            }, this));

            $(window).on('dext_editor_afterchangemode_event', _.bind(function() {
                //var content = this.htmlConverter.convert(this.editor.getContent());
                var content = this.editor.getContent();
                var parsedContent = this._modelToEditorContent(content);
                this.editor.setContent(parsedContent);
            }, this));

            GO.router.on('beforeNavigate', _.bind(function() {
                this._cancel();
            }, this));

            //this.htmlConverter = new HTMLConverter();
        },

        render: function() {
            this.$el.html(Template(this._getRenderOption()));
            var option = _.extend(this.options, {content: this._modelToEditorContent(this.content)});
            this._initEditor(option);
            this._renderPalletItems();

            this._setHeight();
            $(window).on('resize', _.bind(function() {
                this._setHeight();
            }, this));

            this._bindOptionsSortable();

            this.$('input[type="checkbox"]:checked').trigger('change');

            return this;
        },

        _bindOptionsSortable: function() {
            this.$('#options').sortable({
                items: 'li:not([data-add-option])',
                stop: _.bind(this._changeOptions, this)
            });
        },

        _onChangeFormName: function() {
            this.title = this.$('#formName').val();
        },

        _initEditor: function(options) {
            if (this.editor) return;
            var editorOptions = _.extend(options, {
                contextRoot: GO.config('contextRoot'),
                height: this._getEditorHeight() + 'px',
                width: this._getEditorWidthWithUnit(),
                isFormEditor: true
            });
            GO.Editor.create('Dext5Editor', this.$('#' + this.editorId), editorOptions);
            this.editor = GO.Editor.getInstance(this.editorId);
            this.editor.$el.off('clickEditorContent').on('clickEditorContent', _.bind(this._onClickEditorContent, this));
            this.editor.$el.off('keypressEditorContent').on('keypressEditorContent', _.bind(this._onKeyPressEditorContent, this));
        },

        _renderPalletItems: function() {
            var types = ['base', 'auto', 'advanced'];
            _.each(types, function(type) {
                var $el = this.$('#' + type);
                _.each(this.PALLET_ITEMS[type], function(item) {
                    $el.append(PalletItemTemplate.render(_.extend(item, {
                        info: JSON.stringify(item.data),
                        iconClass: item.iconClass
                    })));
                });
            }, this);
        },

        _onChangeAttribute: function(e) {
            var $target = $(e.currentTarget);
            var changedData = $target.attr('type') === 'checkbox' ? $target.is(':checked') : $target.val();

            if(this._validateStringCheck($target, changedData)){
            	return false;
            }
            
            var dsl = this.editingComponent.getAttribute('data-dsl');
            if (dsl) {
                var changedAttribute = $target.attr('name');
                var componentData = this._convertDSLToData(dsl);
                componentData[changedAttribute] = changedData;
                this._changeComponent(componentData);
            }
        },
        
        _validateStringCheck : function($target, changeData){
        	//maxlength나 width 입력값에 문자열이 들어가면 양식불러오기 안됨 GO-26602
            var targetType = $target.attr("id");
            if (targetType == "maxlength" || targetType == "width") {
                var reg = new RegExp('[^0-9]', 'g');
                if (reg.test(changeData)) {
                    $.goError(lang['onlyNumber']);
                    $target.val('').focus();
                    return true;
                }
            }

            //전자결재 양식 텍스트 박스에 { } 가 들어가는 경우 양식 동작을 안함
            if (targetType == "defaultstr" && this._hasCurlyBrace(changeData)) {
                $.goError(commonLang['불용문자 포함 경고메시지']);
                return true;
            }

            return false;
        },

        _hasCurlyBrace: function (val) {
            if (_.indexOf(val, '{') > -1 || _.indexOf(val, '}') > -1) {
                return true;
            }
            return false;
        },

        _changeComponent: function(componentData) {
            var cid = this.editingComponent.getAttribute('data-cid');
            this.editingComponent.outerHTML = this._makeTemplate(componentData, cid, true);
            this.editingComponent = this._getComponentByCid(cid);
        },

        _onClickAddOption: function() {
            if (this._checkProcessing()) return;
            this._preventDuplicationTimer();
            this.$('[data-add-option]').before(optionItem.render({option: {"value" : commonLang['옵션']}}));
            this._changeOptions();
        },

        _onChangeOptionName: function() {
            this._changeOptions();
        },

        _changeOptions: function() {
            var dsl = this.editingComponent.getAttribute('data-dsl');
            var componentData = this._convertDSLToData(dsl);
            var optionCnt = this.$('#options').find('li:not([data-add-option])').length;
            var isValid = true;
            componentData['options'] = _.map(this.$('#options').find('li:not([data-add-option])'), function(li) {
                var $li = $(li);
                var $input = $li.find('input');
                var value = $input.val();
                //if (!value) value = commonLang['옵션'];
                if (optionCnt > 1 && _.isEmpty(value.trim())) {
            	    $.goMessage(commonLang["옵션이 2개 이상인 경우 옵션 이름은 필수값 입니다."]);
                	isValid = false;
                }
                if (_.indexOf(value, ':') > -1 || this._hasCurlyBrace(value)) {
                    $.goMessage(commonLang['사용할 수 없는 문자입니다.']);
                    isValid = false;
                }
                if (_.indexOf(value, '_') > -1) value = value.replace(/_/g, '');
                $input.val(value);
                $li.attr('data-value', value);
                return {
                    value: value,
                    id: $li.attr('data-id')
                };
            }, this);
            if (!isValid) return;

            this._changeComponent(componentData);
        },

        _onClickInputCover: function(e) {
            var $target = $(e.currentTarget);
            $target.siblings('input').trigger('click');
        },

        _onChangeRadio: function(e) {
            var $target = $(e.currentTarget);
            var inputName = $target.attr('name');
            this._markingInputCover(inputName);
        },

        _markingInputCover: function(inputName) {
            _.each(this.$('input[name="' + inputName + '"]'), function(input) {
                var $input = $(input);
                var $cover = $input.siblings('[data-cover]');
                var type = $cover.attr('data-cover');
                var isSelected = $input.is(':checked');
                var className = {
                    radio: 'ic_prototype_radio ic_prototype_radio_selected',
                    check: 'ic_prototype_chk ic_prototype_chk_selected',
                    toggle: 'ic_attr_toggle_off ic_attr_toggle_on'
                }[type].split(' ');
                $cover.addClass(className[+isSelected]);
                $cover.removeClass(className[+!isSelected]);
            });
        },

        _onChangeCheckbox: function(e) {
            var $target = $(e.currentTarget);
            var inputName = $target.attr('name');
            this._markingInputCover(inputName);
        },

        _onClickCustomSelect: function(e) {
            var type = $(e.currentTarget).attr('data-select-custom');
            if (!this[type + 'Layer']) {
                this[type + 'Layer'] = new BackdropView({el: this.$('[data-select-custom-layer="' + type + '"]')});
                this[type + 'Layer'].linkBackdrop(this.$('[data-select-custom="' + type + '"]'));
            }
        },

        _onChangeSelect: function(e) {
            var $target = $(e.currentTarget);
            var customSelect = $target.parent().find('[data-select-custom-value]');
            customSelect.text($target.find(':selected').text());
            customSelect.attr('data-value', $target.val());
        },

        _onClickCustomSelectOption: function(e) {
            e.stopPropagation();
            var $target = $(e.currentTarget);
            var afterValue = $target.attr('data-value');
            var type = $target.parents('[data-select-custom]').attr('data-select-custom');
            var beforeValue = this.$('[data-select-custom-value="' + type + '"]').attr('data-value');
            this[type + 'Layer'].toggle(false);
            if (afterValue === beforeValue) return;
            $target.parents('[data-select-custom="' + type + '"]').siblings('select').val(afterValue).trigger('change');
        },

        _onChangeNumberType: function(e) {
            var componentType = $(e.currentTarget).val();
            var dsl = this.editingComponent.getAttribute('data-dsl');
            var componentData = this._convertDSLToData(dsl);
            componentData.type = componentType;
            if (componentType === 'rSum') {
                var id = componentData.id || undefined;
                componentData = {
                    type: 'rSum',
                    id: id
                };
            }
            var afterDsl = this._convertDataToDSL(componentData);
            this.editingComponent.setAttribute('data-dsl', afterDsl);
            this._replaceComponent(componentData);
            this._setComponentEditView(this.editingComponent);
        },

        _onClickDeleteButton: function(e) {
            $(e.currentTarget).parents('li:first').remove();
        },

        _deleteComponent: function(clickEvent) {
            var component = this._getComponentByEvent(clickEvent);
            this._removeComponentElement(component);
            this.editingComponent = null;
            this.$('[data-not-selected]').show();
            this.$('[data-attribute-area="component"]').hide();

            return component;
        },

        _onClickEditorContent: function(editorEl, clickEvent) {
            var $target = $(clickEvent.target);
            if ($target.hasClass('ic_prototype ic_prototype_trash')) {
                this._deleteComponent(clickEvent);
            } else {
                this._onClickComponent(clickEvent);
            }
        },

        _onClickComponent: function(clickEvent) {
            var component = this._getComponentByEvent(clickEvent);
            if (component == this.editingComponent) return component;
            this._deActivateComponent(this.editingComponent);
            if (component) {
                this._activateComponent(component);
                this.editingComponent = component;
                this._setComponentEditView(component);
            } else {
                this.editingComponent = null;
            }
            this.$('[data-attribute-area="component"]').toggle(!!component);
            this.$('[data-not-selected]').toggle(!component);
            return component;
        },

        _removeComponentElement: function(component) {
            component.hasAttribute('data-dsl') ? $(component).remove() : $(component).parent().remove();
        },

        _deActivateComponent: function(component) {
            if (!component) return;
            this._toggleComponent(false, component);
        },

        _activateComponent: function(component) {
            this._toggleComponent(true, component);
        },

        _toggleComponent: function(flag, component) {
            if (!component.hasAttribute) return; // IE8 대응.
            var $target = component.hasAttribute('data-dsl') ? $(component).children('.comp_active') : $(component).siblings('.comp_active');
            $target.toggle(flag);
        },

        _onKeyPressEditorContent: function(e, keyEvent) {
            if (!this.editingComponent) return true;
            if (keyEvent.keyCode === 13) {
                var $component = $(this.editingComponent);
                var newLine = '<p><br></p>';
                this.editingComponent.hasAttribute('data-dsl') ? $component.after(newLine) : $component.parent().after(newLine);
            }
        },

        _setComponentEditView: function(component) {
            var dsl = component.getAttribute('data-dsl');
            if (dsl) {
                var data = this._convertDSLToData(dsl);
                var fontSize = component.style.fontSize;
                if (fontSize) data['fontSize'] = parseInt(fontSize);
                var titleAndDescription = this._getTitleAndDescription(data);
                var label = (titleAndDescription.title ? titleAndDescription.title + ' ' : '') + commonLang['속성'];
                this.$('[data-component-label="component"]').text(label);
                this.$('[data-desc-area="component"]').text(titleAndDescription.description);
                this._toggleAvailableSettingView(data);
            }
        },

        _toggleAvailableSettingView: function(data) {
            this.$('#requireSettingArea').parents('.panel').show();

            var requireAvailable = _.contains(this.REQUIRE_AVAILABLE_COMPONENTS, data.type);
            this.$('#requireSettingArea').toggle(requireAvailable);
            if (requireAvailable) {
                this.$('#isRequire').prop('checked', !!data.isRequire);
                this._markingInputCover('isRequire');
            }

            var maxLengthAvailable = _.contains(this.MAX_LENGTH_AVAILABLE_COMPONENTS, data.type);
            this.$('#maxLengthSettingArea').toggle(maxLengthAvailable);
            if (maxLengthAvailable) {
                this.$('[data-custom-label="maxLength"]').text(this.CUSTOM_COMPONENT_LABEL['maxLength'][data.type]);
                this.$('#maxlength').val(data.maxlength);
            }

            var widthAvailable = _.contains(this.WIDTH_AVAILABLE_COMPONENTS, data.type);
            this.$('#widthSettingArea').toggle(widthAvailable);
            if (widthAvailable) {
                this.$('#width').val(data.width);
            }
            
            var ditigsAvailable = _.contains(this.CURRENCY_DIGITS_AVAILABLE_COMPONENTS, data.type);
            this.$('#digitsSettingArea').toggle(ditigsAvailable);
            if (ditigsAvailable) {
                this.$('#currencyDigits').val(data.currencyDigits);
            }

            var defaultStrAvailable = _.contains(this.DEFAULT_STR_AVAILABLE_COMPONENTS, data.type);
            this.$('#defaultStrSettingArea').toggle(defaultStrAvailable);
            if (defaultStrAvailable) {
                this.$('#defaultstr').val(data.defaultstr);
            }

            var optionAvailable = _.contains(this.OPTION_AVAILABLE_COMPONENTS, data.type);
            this.$('[data-option-area]').toggle(optionAvailable);
            if (optionAvailable) {
                this.$('#options').find('li:not([data-add-option])').remove();
                _.each(data.options, function(option) {
                    this.$('[data-add-option]').before(optionItem.render({option: option}));
                }, this);
            }

            // advanced
            var idAvailable = _.contains(this.ID_AVAILABLE_COMPONENTS, data.type);

            var hasDefaultId = _.contains(this.ID_UN_AVAILABLE_COMPONENTS, data.id);
            if(hasDefaultId){
            	idAvailable = false;
            }
            this.$('#idSettingArea').parents('.panel').toggle(idAvailable);
            if (idAvailable) {
                this.$('#id').val(data.id);
            }

            var isNumberTypeComponent = _.contains(this.NUMBER_COMPONENTS, data.type);
            this.$('#autoCalArea').toggle(isNumberTypeComponent);
            if (isNumberTypeComponent) {
                this.$('#numberType').val(data.type);
                var text = data.type === 'number' ? commonLang['일반 숫자'] : commonLang[data.type];
                this.$('[data-select-custom-value="numberType"]').attr('data-value', data.type).text(text);
            }
            
            var documentTypeAvailable = _.contains(this.SELECT_DOCUMENT_TYPE_COMPONENTS, data.id);
            if(this.isOfficial){
            	documentTypeAvailable = false;
            }
            
        	this.$('#componentDocTypeArea').toggle(documentTypeAvailable);
        	if (documentTypeAvailable) {
        		if(data.componentDocType == 'reception'){
        			$("input[name=componentDocType][value='reception']").prop("checked", true);            		
        		} else {
        			$("input[name=componentDocType][value='origin']").prop("checked", true);
        		}
        		this._markingInputCover('componentDocType');
        	}

            // var isFontSizeAvailable = _.contains(this.FONT_SIZE_AVAILABLE_COMPONENTS, data.id);
            // this.$('#fontSizeSettingArea').toggle(isFontSizeAvailable);
            // if (isFontSizeAvailable) {
            //     this.$('#fontSize').val(data.fontSize);
            //     this.$('span[data-select-custom-value="fontSize"]').text((data.fontSize || 10) + 'pt');
            // }
        },

        _onClickPalletItem: function(e) {
            var $target = $(e.currentTarget);
            var data = JSON.parse($target.attr('data-info'));
            if (!this._validateDuplicateComponent(data)) {
                alert(commonLang['해당컴포넌트는 템플릿당 한개씩만 사용가능합니다.']);
                return;
            }
            var component = this._makeTemplate(data, this._generateComponentSeq());
            this._setContent(component, true);
        },

        _getComponentByCid: function(cid) {
            var document = this.editor.getDocument();
            return $(document).find('[data-dsl][data-cid="' + cid + '"]')[0];
        },

        _generateComponentSeq: function() {
            var $components = this._getAllComponents();
            var sequences = _.map($components, function(component) {
                return parseInt($(component).attr('data-cid'));
            });
            return sequences.length ? _.max(sequences) + 1 : 0;
        },

        _getAllComponents: function() {
            return $(this.editor.getDocument()).find('[data-dsl]');
        },

        /**
         * @description 유일해야 하는 컴포넌트를 위한 더블 클릭 방어.
         * set API 는 에디터 내부에서 timer 를 사용하고 있고 promise 객체를 반환하지 않기 때문에 content set 완료 시점을 알 수 없다.
         * set API 를 수정하지 않는 한 외부에서도 timer 를 사용해야 한다.
         * set API 수행에 많은 시간이 걸린다면 TIMER_TIME 을 늘려야 한다.
         */
        _preventDuplicationTimer: function() {
            var deferred = $.Deferred();
            this.isProcessing = true;
            setTimeout(_.bind(function() {
                this.isProcessing = false;
                console.log('Ready / ' + this.isProcessing);
                deferred.resolve();
            }, this), this.TIMER_TIME);
            return deferred;
        },

        _checkProcessing: function() {
            if (this.isProcessing) {
                alert(commonLang['에디터가 작업을 처리중입니다. 잠시만 기다려 주세요.']);
            }
            return this.isProcessing;
        },

        _setContent: function(content, isAppend) {
            if (this._checkProcessing()) return;
            var deferred = this._preventDuplicationTimer();
            this.editor.setContent($.trim(content), isAppend);
            //deferred.done(_.bind(function() {
            //    var editorContent = this.editor.getContent();
            //    editorContent = this.htmlConverter.convert(editorContent);
            //    console.log(editorContent);
            //    this.editor.setContent(editorContent);
            //}, this));
            return deferred;
        },

        /**
         * @returns HTML element
         */
        _getComponentByEvent: function(e) {
            var target = e.target || e.srcElement;
            var $target = $(target);
            var wrapper = $target.parents('.comp_wrap');
            var component = wrapper.attr('data-dsl') ? wrapper[0] : wrapper.find('[data-group-seq]')[0];
            /**
             * 기존 양식 호환을 위해 문법에 맞지 않는 마크업을 사용하게 되는데
             * 이러한 마크업을 DOM 으로 만들때 구조가 변경되는 케이스가 있다. (ex: block in p)
             * 구조가 변경된 마크업을 제거하고 wrapping 을 다시 해주자.
             * @type {*|boolean}
             */
            var isInvalidMarkup = $target.hasClass('comp_hover') && !wrapper.length;
            console.log(isInvalidMarkup ? 'InvalidMarkup' :component);
            if (isInvalidMarkup) {
                $target.siblings('.comp_active').remove();
                $target.remove();
            }
            return component;
        },

        _validateDuplicateComponent: function(data) {
            if (data.duplicate !== false) return true;
            var key = data.type + (data.id ? ':' + data.id : '');
            if (data.isAutoType) key = data.id;
            var $components = this._getAllComponents();
            var keys = _.map($components, function(component) { // 추후 옵션이 붙을 수 있으므로 type 과 id 만으로 체크한다.
                var componentData = this._convertDSLToData(component.getAttribute('data-dsl'));
                var returnKey = componentData.type + (componentData.id ? ':' + componentData.id : '');
                if (componentData.isAutoType) returnKey = componentData.id;
                return returnKey;
            }, this);
            return !_.contains(keys, key);
        },

        _onClickDeleteOption: function() {
            this._changeOptions();
        },

        _onClickLeftPanel: function(e) {
            var type = $(e.currentTarget).attr('data-left-panel');
            this.$('[data-left-panel-contents="' + type + '"]').slideToggle();
        },

        _onClickRightPanel: function(e) {
            $(e.currentTarget).siblings('[data-right-panel-contents]').slideToggle();
        },

        _onClickHelp: function(e) {
            $(e.currentTarget).siblings('.help').slideToggle('fast');
        },

        /**
         * 각 모듈별 구현
         * @private
         */
        _onClickLoadForm:  function() {},

        _onClickPreview: function() {
            this._preview();
        },

        _preview: function() {
            if (!this.$el.siblings('.wrap_prototype_preview').length) this.$el.after(this.preview.render().el);
            console.log('preview');
            //var content = this.htmlConverter.convert(this.editor.getContent());
            var content = this.editor.getContent();
            var parsedContent = this._editorContentToModel(content);
            this.preview.show(this.title, parsedContent, this._getEditorWidthWithUnit());
        },

        _onClickCancel: function() {
            this._cancel();
        },

        _cancel: function() {
            this.toggleEl.show();
            this.$el.remove();
            this.preview.remove();
        },

        _onClickSave: function() {
            var content = this.editor.getContent();
            var parsedContent = this._editorContentToModel(content);
            this.toggleEl.show();
            this.preview.remove();
            this.$el.remove();
            if (this.saveCallback) {
                this.saveCallback.apply(this, [this.title, parsedContent]);
            }
        },

        _onHoverLayout: function(e) {
            var $target = $(e.currentTarget);
            $target.children('.tooltip_type2').fadeToggle('fast');
        },

        _onClickLayout: function(e) {
            var $target = $(e.currentTarget);
            if ($target.hasClass('on') || this.resizing) return;
            this.$('[data-layout-input]').val('');
            this.$('[data-custom-wrapper]').hide();
            this.$('[data-layout-button]').removeClass('on');
            $target.addClass('on');
            var type = $target.attr('data-layout-button');
            if (type === 'wide') {
                this.resizing = true;
                this.$('#formEditor').animate({
                    'margin-top': '0px',
                    'margin-left': '0px',
                    width: '100%'
                });
                this.$('.ruler_w').slideUp();
                this._setHeight();
                this._resizeEditor();
            } else if (type === 'vertical') {
                this.resizing = true;
                this._changeFixedWidthLayout();
            } else { // custom
                this.$('[data-custom-wrapper]').show();
                this.$('[data-alert]').show();
            }
        },

        _onChangeLayout: function(e) {
            if (this.resizing) return;
            var width = parseInt($(e.currentTarget).val());
            var isValid = _.isNumber(width) && !_.isNaN(width) && (width >= 100 && width <= 2000);
            this.$('.mode_custom_wrap').toggleClass('err_validation', !isValid);
            if (!isValid) return;
            this.$('[data-layout-button]').removeClass('on');
            this._changeFixedWidthLayout();
        },

        _changeFixedWidthLayout: function() {
            this.$('#formEditor').animate({
                'margin-top': '30px',
                'margin-left': '15px',
                width: this._getEditorWidthWithUnit()
            });
            this.$('.ruler_w').slideDown();
            setTimeout(_.bind(function() { // 배경 깨짐이 발생하므로 animate 가 끝난 다음에 수행되어야 한다. 또는 animate 제거.
                this._setHeight();
                this._resizeEditor();
            }, this), 400);
        },

        _setHeight: function() {
            this.$('.comp, .attr').height(this._getContentHeight());
            this.$('.doc').height(this._getEditorWrapperHeight());
        },

        _getContentHeight: function() {
            return $(window).outerHeight() - (this.$('.gnb').outerHeight() || 61);
        },

        _getEditorHeight: function() {
            return this._getEditorWrapperHeight() - parseInt(this.$('#formEditor').css('margin-top'));
        },

        _getEditorWrapperHeight: function() {
            var type = this._getLayoutType();
            var margin = type === 'wide' ? 0 : 20; // 20: ruler height
            return this._getContentHeight() - margin;
        },

        _resizeEditor: function() {
            //var content = this.htmlConverter.convert(this.editor.getContent());
            var content = this.editor.getContent();
            this.editor.destroy();
            this.editor = null;
            this._initEditor(_.extend(this.options, {
                height: this._getEditorHeight(),
                width: this._getEditorWidthWithUnit(),
                content: content
            }));
            $(window).on('dext_editor_loaded', _.bind(function() {
                this.resizing = false;
            }, this));
        },

        _getLayoutType: function() {
            //return this.$('.on[data-layout-button]').attr('data-layout-button') || 'custom';
            return 'wide';
        },

        _getEditorWidthWithUnit: function() {
            return {
                vertical: '836px',
                wide: '100%',
                custom: this.$('[data-layout-input]').val() + 'px'
            }[this._getLayoutType()];
        },

        _editorContentToModel: function(content) {
            var $content = $('<span>' + content + '</span>');
            this._toSpan($content);
            return $content[0].innerHTML;
        },

        _modelToEditorContent: function(content) {
            if (!content) return '';
            var $content = $('<span>' + content + '</span>');
            this._toInput($content);

            return $content[0].innerHTML;
        },

        _toSpan: function($contents) {
            var errorText = "";
            _.each($contents.find('[data-dsl]'), function(component) {
                var dsl = component.getAttribute('data-dsl');
                var data = this._convertDSLToData(dsl);
                if (!this._validateDataDsl(data.type)) {
                    errorText = commonLang['지원하지 않는 형태의 데이터가 포함되었습니다. 양식을 다시 수정해주세요.'];
                }
                var $component = $(component);
                var $span = $('<span></span>');
                var $parent = $component.parent();
                for (var i = 0; i < 3 && $parent.is('span'); i++) {
                    $parent = $parent.parent();
                }
                _.each($component.prop('attributes'), function(attribute) {
                    if (attribute.name === 'data-wrapper') return;
                    $span.attr(attribute.name, attribute.value);
                });
                $component.before($span);
                $component.remove();

                // GO-24714 > p 태그 가 에디터 컴포넌트 상위에 있으면 마크업이 깨짐. p > iframe (contentViewer)
                if (data.type === 'editor' && $parent.is('p')) {
                    var contents = $parent.contents();
                    $parent.replaceWith(contents);
                }
            }, this);
    
            if (!_.isEmpty(errorText)) {
                $.goError(errorText);
            }
        },

        _toInput: function($contents) {
            var errorText = "";
            _.each($contents.find('[data-dsl]'), function(span, index) {
                if (span.hasAttribute('data-wrapper')) return;
                var $span = $(span);
                var dsl = $span.attr('data-dsl');
                var data = this._convertDSLToData(dsl);
                if (!this._validateDataDsl(data.type)) {
                    errorText = errorText.concat(span.outerHTML + "\n\t\n");
                    return;
                }
                var input = this._makeTemplate(data, index/*, false*/);
                $span.after(input);
                $span.remove();
            }, this);
            
            if (!_.isEmpty(errorText)) {
                $.goPopup({
                    title : commonLang['지원하지 않는 data-dsl을 사용하셨습니다.'],
                    message : GO.util.escapeHtml(errorText),
                    modal : true,
                    buttons : [{
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm',
                    }]
                });
            }
        },

        _convertSpecialAttribute: function(dsl) {
            dsl = dsl.replace(/{{([^}}]*)}}/g, function (original, result) {
                return result
            });
            var requireRegex = /(\$require\$)/gi;
            var autoTypeRegex = /(\$autotype\$)/gi;
            var editableRegex = /(\$adminedit\$)/gi;
            var returnValue = {};
            if (requireRegex.test(dsl)) {
                returnValue.isRequire = true;
                dsl = dsl.replace(requireRegex, '');
            }
            if (autoTypeRegex.test(dsl)) {
                returnValue.isAutoType = true;
                dsl = dsl.replace(autoTypeRegex, '');
            }
            if (editableRegex.test(dsl)) {
                returnValue.isEditable = false;
                dsl = dsl.replace(editableRegex, '');
            }
            dsl.replace(/\$maxlength:([0-9]*)\$/g, function (n, lengthKey) {
                returnValue.maxlength = lengthKey;
                dsl = dsl.replace(n, '');
            });
            dsl.replace(/\$width:([0-9]*)\$/g, function (n, widthVal) {
                returnValue.width = widthVal;
                dsl = dsl.replace(n, '');
            });
            dsl.replace(/\$defaultstr:(.*)\$/g, function (n, str) {
                returnValue.defaultstr = str;
                dsl = dsl.replace(n, '');
            });
            dsl.replace(/\$simple\$/g, function (n) {
                returnValue.skinType = 'simple';
                dsl = dsl.replace(n, '');
            });
            dsl.replace(/\$department\$/g, function (n) {
                returnValue.orgType = 'department';
                dsl = dsl.replace(n, '');
            });
            dsl.replace(/currency_([0-9]*)/g, function (n, lengthKey) {
                returnValue.currencyDigits = lengthKey;               
            });
            dsl.replace(/\$componentDocType:(.*)\$/g, function (n, str) {
                returnValue.componentDocType = str;
                dsl = dsl.replace(n, '');
            });

            return {dsl: dsl, returnValue: returnValue};
        },

        _convertDSLToData: function(dsl) {
            var filteredData = this._convertSpecialAttribute(dsl);
            dsl = filteredData.dsl;
            var returnValue = filteredData.returnValue;

            /**
             * 기존 dsl 이 갖고 있는 구조적 문제:
             * option(_) 을 갖는 컴포넌트의 ID 는 누구의 ID 인가?
             * 아이디는 콜론 문자를 통해 부여 할 수 있는데,
             * option 을 갖는 컴포넌트는 콜론 뒤의 값이
             * option 의 아이디 인지 컴포넌트의 아이디인지 구분이 어렵다. (기존 코드에서도 구분하지 않고 있음)
             * 그리고 상당수의 커스텀 양식 등에서 이미 option 의 아이디로 사용중이다.
             * apprLineRuleOption, apprLineRuleAmount 는 예약어 처리하자.
             *
             * pass case =>
             * text
             * text:subject
             * text:subject_1
             * radio_optionA
             * radio_optionA:IDA_optionB:IDB
             */

            dsl.replace(/:apprLineRuleOption|:apprLineRuleAmount/g, function (str) {
                dsl = dsl.replace(str, '');
                returnValue.id = str.replace(':', '');
            });

            var separatorIndex = dsl.search(/:|_/);
            if (separatorIndex === -1) separatorIndex = dsl.length;

            var separator = dsl.substr(separatorIndex, 1);
            var exceptType = dsl.substring(separatorIndex + 1, dsl.length);
            
        	returnValue.type =  dsl.substring(0, separatorIndex);
            if (separator === '_') {
                if(COMPONENT_TEMPLATES[dsl]) {
                	returnValue.type =  dsl;
                } else {
                	var underBarSplitItem = exceptType.split('_');
                	if (underBarSplitItem.length) returnValue.options = [];
                	_.each(underBarSplitItem, function(option) {
                		var optionSplitResult = option.split(':');
                		returnValue.options.push({
                			value: optionSplitResult[0],
                			id: optionSplitResult[1]
                		});
                	});
                	
                }
            } else if (separator === ':') {
                returnValue.id = exceptType;
            }

            return returnValue;
        },

        _convertDataToDSL: function(data) {
            var dsl = '{{' + data.type;
            
            //currency_0 일경우 $requre$와 같은 부가기능보다 _가 맨앞에 나와야해서 맨위에 위치해야함.
            if (data.currencyDigits) dsl += '_' + data.currencyDigits;
            if (data.isRequire) dsl += '$require$';
            if (data.isAutoType) dsl += '$autotype$';
            if (data.isEditable === false) dsl += '$adminedit$';
            if (data.orgType === 'department') dsl += '$department$';
            if (data.skinType === 'simple') dsl += '$simple$';
            if (!_.isUndefined(data.id) && data.id !== "") dsl += ':' + data.id;
            
            // currency일 경우 option이 없기때문에 !data.currencyDigits 추가함.
            if (data.options && data.options.length && !data.currencyDigits) {
                var parsed = _.map(data.options, function(option) {
                    return option.value + (option.id ? ':' + option.id : '');
                });
                dsl = _.flatten([dsl, parsed]).join('_');
            }
            if (data.defaultstr) dsl += '$defaultstr:' + data.defaultstr + '$';
            if (data.width) dsl += '$width:' + data.width + '$';
            if (data.maxlength) dsl += '$maxlength:' + data.maxlength + '$';
            if(data.componentDocType) dsl += '$componentDocType:' + data.componentDocType + '$';
            return dsl + '}}';
        },

        _makeTemplate: function(data, cid, isActive) {
            var type = data.type;
            var component = COMPONENT_TEMPLATES[type];
            var template = component.template;
            var labelKey = (data.type === 'label' || data.type === 'span') ? data.id : data.type;
            var style = data.width ? 'width: ' + data.width + 'px;' : component.style;
            if (data.id === 'auto') data.id = cid;
            
            var isAppContent = false;
            if(type === "editor" && data.id === "appContent") {
                isAppContent = true;
            }

            return Hogan.compile(componentWrapperStartTag + template.join('') + componentWrapperBehindTags).render(_.extend(data, {
                cid: cid,
                dsl: this._convertDataToDSL(data),
                label: lang[labelKey] || commonLang['레이블'],
                style: style || "",
                options: data.options,
                isActive: isActive,
                lang: lang,
                isAutoType: data.isAutoType,
                isAppContent: isAppContent
            }));
        },
        
        _validateDataDsl: function(type) {
            if (!COMPONENT_TEMPLATES[type]) {
                return false;
            }
            return true;
        },

        _getRenderOption: function() {
            return {
                lang: lang,
                useTitle: this.title !== false,
                title: this.title,
                useLoadForm: this.useLoadForm,
                hasAuto: !!this.PALLET_ITEMS.auto,
                hasAdvanced: !!this.PALLET_ITEMS.advanced
            };
        },

        _replaceComponent: function(componentData) {
            var cid = this.editingComponent.getAttribute('data-cid');
            this.editingComponent.outerHTML = this._makeTemplate(componentData, cid, true);
            this.editingComponent = this._getComponentByCid(cid);
            //return this.editingComponent;
        },

        /**
         * 우측 팔레트의 컴포넌트별 설명 때문에 이런 코드를 넣어야 하는것인지..
         * 좌측 팔레트에서 보여주면 아주 심플하게 끝날것을..
         * 향후 컴포넌트 추가되면 일일이 처리 해야함.
         */
        _getTitleAndDescription: function(data) {
            var key = '';
            switch (data.type) {
                case 'text':
                    if (data.id === 'subject') {
                        key = '제목';
                    } else {
                        key = '텍스트';
                    }
                    break;
                case 'editor':
                    if (data.id === 'appContent') {
                        key = '본문 내용';
                    } else {
                        key = '편집기';
                    }
                    break;
                case 'room':
                    if (data.isAgreement === 'true') {
                        key = '합의 결재선';
                    } else if (data.isReception === 'true') {
                        key = '수신 결재선';
                    } else {
                        key = '결재선';
                    }
                    break;
                case 'currency':
                    if (data.id === 'apprLineRuleAmount') {
                        key = '통화 자동결재선';
                    } else {
                        key = '통화';
                    }
                    break;
                case 'radio':
                    if (data.id === 'apprLineRuleOption') {
                        key = '단일선택 자동결재선';
                    } else {
                        key = '단일선택';
                    }
                    break;
                case 'cSel':
                    if (data.id === 'apprLineRuleOption') {
                        key = '드롭박스 자동결재선';
                    } else {
                        key = '드롭박스';
                    }
                    break;
                case 'cOrg':
                    if (data.orgType === 'department') {
                        key = '부서선택';
                    } else {
                        key = '사용자선택';
                    }
                    break;
                case 'label':
                    key = {
                        'draftUser': '기안자',
                        'draftDept': '기안부서',
                        'draftUserEmail': '기안자이메일',
                        'position': '직위',
                        'empNo': '사번',
                        'mobileNo': '핸드폰번호',
                        'directTel': '직통전화',
                        'repTel': '대표번호',
                        'fax': '팩스',
                        'draftDate': '기안일',
                        'completeDate': '완료일',
                        'docNo': '문서번호',
                        'openOption': '공개여부',
                        'securityLevel': '보안등급',
                        'preserveDuration': '보존연한',
                        'docClassification': '전사문서함',
                        'attachFile': '첨부파일명',
                        'docReference': '참조자',
                        'recipient': '수신자',
                        'officialDocSender': '발신명의'
                    }[data.id] || '레이블';
                    break;
                case 'span':
                    if (data.id === 'officialDocReceiver') {
                        key = '공문수신처';
                    } else if (data.id === 'officialDocVersionReceiver') {
                        key = '공문수신처2';
                    }
                    break;
                default:
                    break;
            }
            if (!key) {
                key = {
                    textarea: '멀티텍스트',
                    number: '숫자',
                    check: '체크박스',
                    calendar: '날짜',
                    time: '시간',
                    period: '기간',
                    name_pos: '이름 및 직위',
                    user_name: '이름',
                    user_pos: '직위(보고)',
                    user_empno: '사번(보고)',
                    user_org: '소속부서',
                    today: '오늘날짜',
                    cSum: '합계 입력',
                    rSum: '합계 표시'
                }[data.type];
            }
            return {
                title: commonLang[key] || '',
                description: lang[key + ' 설명'] || ''
            }
        }
    });
});
