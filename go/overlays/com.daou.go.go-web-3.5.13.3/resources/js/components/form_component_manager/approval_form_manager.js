define('components/form_component_manager/approval_form_manager', function (require) {

    var commonLang = require('i18n!nls/commons');
    var approvalLang = require('i18n!approval/nls/approval');
    var lang = _.extend(commonLang, {
        '지정 결재자가 최대 결재자 인원수를 초과하였습니다.': approvalLang['지정 결재자가 최대 결재자 인원수를 초과하였습니다.'],
        '지정 결재자는 10개를 초과 하실 수 없습니다': approvalLang['지정 결재자는 10개를 초과 하실 수 없습니다'],
        '부서가 없는 사용자는 추가할 수 없습니다.': approvalLang['부서가 없는 사용자는 추가할 수 없습니다.'],
        'addApproval': approvalLang['결재 추가'],
        'addAgreement': approvalLang['합의 추가'],
        'addCheck': approvalLang['확인 추가'],
        'addInspection': approvalLang['감사 추가'],
        'approval': approvalLang['결재'],
        'agreement': approvalLang['합의'],
        'check': approvalLang['확인'],
        'inspection': approvalLang['감사'],
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
        'today': commonLang['오늘날짜']
    });

    var activityItem = Hogan.compile([
        '<li data-activity-type="{{type}}" ',
        '{{#activity.userId}}data-user-id="{{activity.userId}}"{{/activity.userId}} ',
        '{{#activity.deptId}}data-dept-id="{{activity.deptId}}"{{/activity.deptId}} ',
        '{{#activity.id}}data-id="{{activity.id}}"{{/activity.id}}>',
        '<span class="txt">{{activity.displayName}}{{#typeLabel}}({{typeLabel}}){{/typeLabel}}</span>',
        '<i class="ic_prototype ic_prototype_del_s" data-delete-appoint-user></i>',
        '</li>'
    ].join(' '));

    var roomWrapperStartTag = '<span unselectable="on" contenteditable="false" class="comp_wrap" data-wrapper>';
    //var roomWrapperStartTag2 = '<span contenteditable="false" class="comp_wrap" data-wrapper style="width: 100%;">';
    var componentBorder = [
        '<span contenteditable="false" class="comp_active" style="display:none;">',
            '<span class="Active_dot1"></span><span class="Active_dot2"></span>',
            '<span class="Active_dot3"></span><span class="Active_dot4"></span>',
        '</span>'
    ].join(' ');
    var componentDeleteButton = [
        '<span contenteditable="false" class="comp_hover" data-content-protect-cover="true">',
        '<a contenteditable="false" class="ic_prototype ic_prototype_trash" data-content-protect-cover="true" data-component-delete-button="true"></a>',
        '</span>'
    ].join(' ');
    var componentWrapperEndTag = '</span>';
    //var componentWrapperBehindTags = [componentBorder, componentDeleteButton, componentWrapperEndTag].join(' ');

    var FormComponentManager = require('components/form_component_manager/form_component_manager');
    var PALLET_ITEMS = require('components/form_component_manager/constants/approval_pallet_items');
    var ActivityGroups = require('approval/collections/activity_groups');
    var ActivityGroup = require('approval/models/activity_group');
    var ActivityModel = require('approval/models/activity');
    var ApprLineRuleView = require('admin/views/appr_line_rule_form');
    //var DefaultForm = require('text!components/form_component_manager/templates/default_form.html');
    var roomType1InlineTemplate = require('hgn!components/form_component_manager/templates/room_type_1_inline');
    var roomType1BlockTemplate = require('hgn!components/form_component_manager/templates/room_type_1_block');
    var roomType2Template = require('hgn!components/form_component_manager/templates/room_type_2');
    var Template = require('hgn!components/form_component_manager/templates/form_component_manager');
    var TemplateListLayerView = require('admin/views/appr_form_template_list');

    return FormComponentManager.extend({

        maxApprovalCountLayer: null,

        agreementKey: 'data-is-agreement',
        receptionKey: 'data-is-reception',

        events: _.extend(FormComponentManager.prototype.events, {
            'click [data-right-panel="roomCommon"]': '_onClickRoomCommonPanel',
            'click [data-add-activity]:not([data-add-activity="apprLineRule"])': '_onClickAddActivity',
            'click [data-add-activity="apprLineRule"]': '_onClickAddAutoApprovalLine',
            'click [data-delete-appoint-user]': '_onClickDeleteAppointUser',
            'change [data-room-default]': '_onChangeRoomDefaultSetting',
            'change input[name="approvalType"]:not([value="apprLineRule"])': '_onChangeApprovalType',
            'change input[name="approvalType"][value="apprLineRule"]': '_onChangeApprLineRule',
            'focus #roomName': '_onFocusRoomName'
        }),

        initialize: function (options) {
            this.PALLET_ITEMS = PALLET_ITEMS;
            this.config = options.config;
            this.companyIds = options.companyIds;
            this.backupModel = this.model.toJSON();
            this.activityGroups = new ActivityGroups(this.model.get('activityGroups'));
            this.apprLineRuleCollection = new (Backbone.Collection.extend({
                url: function() {
                    return GO.contextRoot + 'ad/api/approval/apprlinerule';
                }
            }));
            this.apprLineRuleCollection.fetch();

            FormComponentManager.prototype.initialize.apply(this, arguments);
        },

        render: function () {
            this.$el.html(Template(_.extend(this._getRenderOption(), {
                model: this.model.toJSON(),
                assignedActivityDeletable: this.model.get('assignedActivityDeletable'),
                useDisplayDrafter: this.model.get('useDisplayDrafter'),
                useIncludeAgreement: this.model.get('useIncludeAgreement'),
                config: this.config.toJSON()
            })));
            var useDefaultForm = !this.model.id && !this.model.get('templateHtml');
            var content = useDefaultForm ? '' : this._convertBlockToInline(this.model.get('templateHtml'));
            var option = _.extend(this.options, {content: this._modelToEditorContent(content)});
            this._initEditor(option);
            this._renderPalletItems();

            this._setHeight();
            $(window).on('resize', _.bind(function () {
                this._setHeight();
            }, this));

            this.$('input[type="checkbox"]:checked').trigger('change');

            this.$('[data-sortable-area]').sortable({
                items: 'li:not(.auto_approve)',
                stop: _.bind(this._sortRoom, this)
            });

            this._bindOptionsSortable();

            return this;
        },

        /**
         * @Override
         */
        _onChangeFormName: function() {
            this.model.set('name', this.$('#formName').val());
        },

        /**
         * @Override
         */
        _preview: function() {
            if (!this.$el.siblings('.wrap_prototype_preview').length) this.$el.after(this.preview.render().el);
            
            var content = $(this.editor.getDocument()).find('body')[0].innerHTML;
            var parsedContent = this._getTemplateHtmlByContent(content);
            
            this.preview.show(this.title, parsedContent, this._getEditorWidthWithUnit());
        },

        /**
         * @Override
         */
        _onClickCancel: function() {
            FormComponentManager.prototype._onClickCancel.apply(this, arguments);
            this.model.set(this.backupModel);
        },

        /**
         * @Override
         */
        _onClickSave: function() {
            this._syncRoomElementToCollection();
            
            var self = this;
            
            this.activityGroups.each(function(group, index){
            	var roomEl = self._getApprovalRoomBySeq(group.get('seq'));
            	$(roomEl).attr('data-group-seq', index);
            	group.set('seq', index);
            });
            this.model.set('activityGroups', this.activityGroups.toJSON());

            //var content = this._convertInlineToBlock(this.editor.getContent());
            var content = this.editor.getContent(); // block 결재방을 쓰면 에디터에서 사용하는 정렬 등을 사용 할 수 없다.
            this.model.set('templateHtml', this._getTemplateHtmlByContent(content));
            
            if (!this.activityGroups.length) {
                $.goMessage(commonLang['결재선을 추가한 후 저장해 주세요']);
                return false;
            }

            FormComponentManager.prototype._onClickSave.apply(this, arguments);
        },

        /**
         * 결재선을 삭제 버튼이 아닌 selection 을 통해 삭제하는경우를 위해 collection 에 sync 해줘야 한다.
         * 무조건 seq 로 매핑하자. 실제로 동일한 결재선이 아닐 수 있으나 기존 양식 지원을 위해 어쩔 수 없다.
         * 이름, 최대 결재선, roomType 등 element 에 속성으로 박혀있는 값을을 collection 으로 sync 하고
         * element 가 없는 결재선 model 은 collection 에서 지우자.
         * case. collection 에 아무것도 없는데 결재방이 있는 html 을 붙여넣은경우
         * case. collection 에 이미 값이 있고 selection 을 하여 삭제한경우
         *
         * 명확한 스펙이 없다. 예측 못한 케이스가 있을것으로 보이고, 보완이 필요할 것이다.
         */
        _syncRoomElementToCollection: function() {
            var $rooms = this._getAllNormalApprovalRoom();
            var roomDatas = _.map($rooms, function(room) {
                var seq = parseInt(room.getAttribute('data-group-seq'));
                var group = this.activityGroups.findWhere({seq: seq});
                if (!group) this._generateRoomModel(room);
                return {
                    seq: seq,
                    name: room.getAttribute('data-group-name'),
                    maxApprovalCount: room.getAttribute('data-group-max-count')
                };
            }, this);
            var rooms = new Backbone.Collection(roomDatas);
            var sequences = _.map(roomDatas, function(data) {
                return data.seq;
            });

            var deletedRooms = this.activityGroups.filter(function(group) {
                var elementModel = rooms.findWhere({seq: group.get('seq')});
                if (!elementModel) return true;
                if (elementModel.get('maxApprovalCount') >= group.get('activities').length) {
                    group.set(elementModel.toJSON());
                }
                return !_.contains(sequences, group.get('seq'));
            }, this);
            this.activityGroups.remove(deletedRooms);
        },

        _isAgreementOrReception: function(room) {
            var isAgreement = room.getAttribute('data-is-agreement') === 'true';
            var isReception = room.getAttribute('data-is-reception') === 'true';
            return isAgreement || isReception;
        },

        _getRoomDataByElement: function(room) {
            return {
                seq: parseInt(room.getAttribute('data-group-seq')),
                maxApprovalCount: room.getAttribute('data-group-max-count'),
                name: room.getAttribute('data-group-name'),
                isAgreement: room.getAttribute('data-is-agreement'),
                isReception: room.getAttribute('data-is-reception'),
                roomType: room.getAttribute('data-group-type'),
                type: 'room'
            };
        },

        _generateRoomModel: function(room, data) {
            if (this._isAgreementOrReception(room)) return;
            var modelObject = _.extend(this._getRoomDataByElement(room), data);
            var roomModel = new ActivityGroup(modelObject);
            this.activityGroups.add(roomModel);
            return roomModel;
        },

        /**
         * @Override
         */
        _initEditor: function (options) {
            _.extend(options, {onLoad: _.bind(this._wrapRoom, this)});
            FormComponentManager.prototype._initEditor.call(this, options);
        },

        /**
         * @Override
         */
        _deleteComponent: function(clickEvent) {
            var component = FormComponentManager.prototype._deleteComponent.apply(this, arguments);
            this.$('[data-attribute-area="room"]').hide();

            if (this._isAgreementOrReception(component)) return;
            var seq = component.getAttribute('data-group-seq');
            if (seq) {
                var roomModel = this.activityGroups.findWhere({seq: parseInt(seq)});
                this.activityGroups.remove(roomModel);
                this.model.set('activityGroups', this.activityGroups.toJSON());
                this.model.set('templateHtml', this.editor.getContent());
            }
        },

        /**
         * @Override
         */
        _onClickEditorContent: function() {
            FormComponentManager.prototype._onClickEditorContent.apply(this, arguments);
            this._hideApprovalRoomCommonSettingArea();
        },

        /**
         * @Override
         */
        _onClickComponent: function(clickEvent) {
            this.$('[data-attribute-area="room"]').hide();
            var component = FormComponentManager.prototype._onClickComponent.apply(this, arguments);
            if (component) {
                var hasDSL = component.getAttribute('data-dsl');
                this.$('[data-attribute-area="room"]').toggle(!hasDSL);
                this.$('[data-attribute-area="component"]').toggle(!!hasDSL);
                this._setComponentEditView(component);
            }
        },

        /**
         * @Override
         */
        _getComponentByEvent: function(e) {
            var target = e.target || e.srcElement;
            var $target = $(target);
            var wrapper = $target.parents('.comp_wrap');
            if ($target.parents('[data-group-seq]').length && !wrapper.length) { // 에디터 자체 버그. wrapper 를 지워버리는 케이스가 있다.
                this._wrapRoom();
            }
            return FormComponentManager.prototype._getComponentByEvent.apply(this, arguments);
        },

        _onClickRoomCommonPanel: function () {
            if (this.$('[data-right-panel-contents="roomCommon"]').is(':visible')) this._renderRoomSortableArea();
        },

        _renderRoomSortableArea: function () {
            this._syncRoomElementToCollection();
            this.$('[data-sortable-area]').empty();
            this.activityGroups.each(function (group) {
                this.$('[data-sortable-area]').append([
                    '<li data-group-seq="', group.get('seq'), '"><span class="txt">', group.get('name'), '</span><i class="ic_prototype ic_prototype_move"></i></li>'
                ].join(''))
            }, this);
        },

        _onChangeRoomDefaultSetting: function(e) {
            var $target = $(e.currentTarget);
            var name = $target.attr('name');
            this.model.set(name, $target.is(':checked'));
        },

        _onClickAddAutoApprovalLine: function() {
            var apprLineRuleLayer = $.goPopup({
                "pclass": "layer_normal layer_pay_line",
                "header": lang['자동결재선'],
                "modal": true,
                "width": 504,
                "buttons": [{
                    'btext': commonLang['확인'],
                    'autoclose': false,
                    'btype': 'confirm',
                    'callback': _.bind(function($popup) {
                        var selectedLineId = $popup.find('#apprLineRuleSelect').val();
                        var selectedLineOptionCount = $popup.find('#apprLineRuleSelect option:selected').attr('data-option-count');
                        var activity = {
                            type: 'apprLineRule',
                            id: selectedLineId,
                            displayName: $popup.find('#apprLineRuleSelect option:selected').text(),
                            optionCount : selectedLineOptionCount
                        };
                        this._addApprLineRule(activity);
                        $popup.close();
                    }, this)
                }, {
                    'btext': commonLang["취소"],
                    'btype': 'cancel'
                }]
            });

            var apprLineRuleView = new ApprLineRuleView({
                collection: this.apprLineRuleCollection
            });
            apprLineRuleView.render();
            apprLineRuleView.renderDetailBoard();
            apprLineRuleLayer.reoffset();
        },

        _onChangeApprovalType: function (e) {
            var $target = $(e.currentTarget);
            var type = $target.val();
            this._toggleApprovalMembersArea($target, type);
            var seq = this.editingComponent.getAttribute('data-group-seq');
            var roomModel = this.activityGroups.findWhere({seq: parseInt(seq)});
            roomModel.set('use' + GO.util.initCap(type), $target.is(':checked'));
            this.model.set('activityGroups', this.activityGroups.toJSON());
        },

        _onChangeApprLineRule: function(e) {
            var $target = $(e.currentTarget);
            this._toggleApprovalMembersArea($target, $target.val());
            var seq = this.editingComponent.getAttribute('data-group-seq');
            var roomModel = this.activityGroups.findWhere({seq: parseInt(seq)});
            var isChecked = $target.is(':checked');
            if (isChecked) {
                var beforeAutoRoom = this.activityGroups.findWhere({useApprLineRule: true});
                if (beforeAutoRoom) beforeAutoRoom.set('useApprLineRule', false);

                roomModel.set('maxApprovalCount', 10); // 결재선 순서 변경 기능 추가로 인하여 기존 결재선을 찾을 수 없으므로 해당 설정을 하는경우 무조건 10으로 유지한다.
                this.$('#maxApprovalCount').val(10);
                this.$('[data-select-custom-value="maxApprovalCount"]').text(10);
                var roomEl = this._getApprovalRoomBySeq(seq);
                $(roomEl).attr('data-group-max-count', 10);
                var apprLineRuleModel = this.model.get('apprLineRuleModel');
                if (this.model.get('apprLineRuleModel')) {
                    this._appendActivity({
                        type: 'apprLineRule',
                        id: apprLineRuleModel.id,
                        displayName: apprLineRuleModel.name
                    });
                }
                var roomType = this.editingComponent.getAttribute('data-group-type');
                var componentData = _.extend(roomModel.toJSON(), {roomType: roomType});
                this._replaceApprovalRoom(componentData);
            } else {
                this._removeActivity('apprLineRule');
                this.model.set('apprLineRuleModel', null);
            }
            this.model.set('useApprLineRule', isChecked);
            roomModel.set('useApprLineRule', isChecked);
            this.$('[data-select-custom="maxApprovalCount"]').attr('disabled', isChecked);
            this._setAutoApprovalLine();
        },

        _replaceApprovalRoom: function(componentData) {
            this.editingComponent.outerHTML = this._makeRoomTemplate(componentData, true);
            this.editingComponent = this._getSameKindApprovalRoomByData(componentData)[0];
            $(this.editingComponent).parent().css('width', componentData.roomType === 'type2' ? '100%' : '');
        },

        _toggleApprovalMembersArea: function ($target, type) {
            this.$('[data-approval-members="' + type + '"]').toggle($target.is(':checked'));
            if (type === 'apprLineRule') this._setAutoApprovalLine();
        },

        //_moveTop: function() {
        //    this._renderRoomSortableArea();
        //    var seq = this.editingComponent.getAttribute('data-group-seq');
        //    var $sortableArea = this.$('[data-sortable-area]');
        //    var $item = $sortableArea.find('[data-group-seq="' + seq + '"]').detach();
        //    $sortableArea.prepend($item);
        //    this._sortRoom();
        //},

        _sortRoom: function () {
            var $items = this.$('[data-sortable-area]').find('li');
            var $rooms = this._getAllApprovalRoom();
            var sequences = _.map($items, function (li) {
                return parseInt($(li).attr('data-group-seq'));
            });

            _.each($items, function (item, index) { // sortable items
                $(item).attr('data-group-seq', index);
            });

            this.activityGroups.each(function (group) { // collection
                var seq = group.get('seq');
                var newSeq = _.indexOf(sequences, seq);
                group.set('seq', newSeq);
            });

            _.each($rooms, function (room) { // $rooms
                if (this._isAgreementOrReception(room)) return;
                var $room = $(room);
                var seq = parseInt($room.attr('data-group-seq'));
                var newSeq = _.indexOf(sequences, seq);
                $room.attr('data-group-seq', newSeq);
            }, this);

            this.activityGroups.comparator = 'seq';
            this.activityGroups.sort();

            this.model.set('activityGroups', this.activityGroups.toJSON());
            this.model.set('templateHtml', this.editor.getContent());
        },

        _onFocusRoomName: function () {
            this._hideApprovalRoomCommonSettingArea();
        },

        /**
         * @Override
         */
        _setComponentEditView: function(component) {
            var dsl = component.getAttribute('data-dsl');
            if (!dsl) {
                this._setApprovalRoomSettingArea(component);
            }

            FormComponentManager.prototype._setComponentEditView.apply(this, arguments);
            $.goOrgSlide.close();
        },

        _setApprovalRoomSettingArea: function(component) {
            var data = this._getRoomDataByElement(component);
            var titleAndDescription = this._getTitleAndDescription(data);
            var label = (titleAndDescription.title ? titleAndDescription.title + ' ' : '') + commonLang['속성'];
            this.$('[data-component-label="room"]').text(label);
            this.$('[data-desc-area="room"]').text(titleAndDescription.description);

            var isAgreementOrReception = this._isAgreementOrReception(component);
            this.$('[data-normal-room-area]').toggle(!isAgreementOrReception);
            this.$('[data-common-room-area]').toggle(!isAgreementOrReception);
            this.$('input[name="roomType"]').prop('checked', false);
            this.$('input[name="roomType"][value="' + data.roomType + '"]').prop('checked', true);
            this._markingInputCover('roomType');
            if (isAgreementOrReception) return;

            this.$('#roomName').val(data.name);
            this.$('#maxApprovalCount').val(data.maxApprovalCount);
            this.$('[data-select-custom-value="maxApprovalCount"]').text(data.maxApprovalCount).attr("data-value",data.maxApprovalCount);
            var approvalTypes = ['approval', 'agreement', 'check', 'inspection', 'apprLineRule'];
            var seq = parseInt(data.seq);
            var roomModel = this.activityGroups.findWhere({seq: seq});
            if (!roomModel) roomModel = this._generateRoomModel(component, {seq: seq});
            _.each(approvalTypes, function(type) {
                var attrKey = 'use' + GO.util.initCap(type, true);
                var isChecked = roomModel.get(attrKey);
                var $input = this.$('input[name="approvalType"][value="' + type + '"]').prop('checked', !!isChecked);
                this._markingInputCover('approvalType');
                this._toggleApprovalMembersArea($input, type);
            }, this);
            this._renderActivities(roomModel);
            var useApprovalLineRule = roomModel.get('useApprLineRule');
            var apprLineRuleModel = this.model.get('apprLineRuleModel');
            if (useApprovalLineRule && apprLineRuleModel) {
                this._appendActivity({
                    type: 'apprLineRule',
                    id: apprLineRuleModel.id,
                    displayName: apprLineRuleModel.name
                });
            }
            this.$('[data-select-custom="maxApprovalCount"]').attr('disabled', useApprovalLineRule);
            if (this.maxApprovalCountLayer) this.maxApprovalCountLayer.toggle(false);
            this._setAutoApprovalLine();
        },

        _setAutoApprovalLine: function () {
            var useAuto = this.$('[name="approvalType"][value="apprLineRule"]').is(':checked');
            this.$('[data-activity-type="apprLineRule"]').toggle(useAuto);
            this.$('[data-add-activity]:not([data-add-activity="apprLineRule"])').toggle(!useAuto);
            this.$('[data-activity-type]:not([data-activity-type="apprLineRule"])').toggle(!useAuto);
            this._hideApprovalRoomCommonSettingArea();
        },

        /**
         * @Override
         */
        _onClickPalletItem: function(e) {
            var $target = $(e.currentTarget);
            var data = JSON.parse($target.attr('data-info'));
            if (data.type === 'room') {
                this._onClickRoom(e);
                return;
            }

            FormComponentManager.prototype._onClickPalletItem.apply(this, arguments);
        },

        _onClickRoom: function(e) {
            var $target = $(e.currentTarget);
            var data = JSON.parse($target.attr('data-info'));
            var editorDocument = this.editor.getDocument();
            var $rooms = this._getAllSameKindApprovalRoomByData(data, editorDocument);
            data.seq = data.seq ? data.seq : this._generateRoomSeq(editorDocument);
            if (!this._roomValidation($rooms, data)) return;
            var afterRoom = this._makeRoomTemplate(data);
            this._setContent(afterRoom, true);
            if (!data.isAgreement && !data.isReception) {
                var beforeRoom = this.activityGroups.findWhere({seq: data.seq});
                this.activityGroups.remove(beforeRoom);
                this.activityGroups.add(new ActivityGroup(data));
            }
        },

        /**
         * @description
         * 일반결재방이 10개 초과인 경우
         * 수신, 합의 결재방이 이미 존재하는 경우
         */
        _roomValidation: function($rooms, data) {
            if (!(data.isReception || data.isAgreement) && $rooms.length >= 10) {
                alert(commonLang['일반 결재선은 10개까지 사용 가능합니다.']);
                return false;
            }
            if ((data.isReception || data.isAgreement) && !!$rooms.length) {
                alert(commonLang['해당컴포넌트는 템플릿당 한개씩만 사용가능합니다.']);
                return false;
            }
            return true;
        },

        /**
         * @Override
         */
        _onChangeAttribute: function(e) {
            FormComponentManager.prototype._onChangeAttribute.apply(this, arguments);

            var dsl = this.editingComponent.getAttribute('data-dsl');
            if (!dsl) {
                var isAgreementOrReception = this._isAgreementOrReception(this.editingComponent);
                var name = this.$('#roomName').val();
                var maxApprovalCount = this.$('#maxApprovalCount').val();
                var seq = this.editingComponent.getAttribute('data-group-seq');
                var componentData = {
                    type: 'room',
                    roomType: this.$('input[name="roomType"]:checked').val(),
                    seq: seq
                };
                if (isAgreementOrReception) {
                    componentData['name'] = this.editingComponent.getAttribute('data-group-name');
                    componentData['maxApprovalCount'] = this.editingComponent.getAttribute('data-group-max-count')
                } else {
                    componentData['name'] = name;
                    componentData['maxApprovalCount'] = maxApprovalCount;
                }

                if (this.editingComponent.hasAttribute('data-is-reception')) {
                    componentData['isReception'] = this.editingComponent.getAttribute('data-is-reception');
                }
                if (this.editingComponent.hasAttribute('data-is-agreement')) {
                    componentData['isAgreement'] = this.editingComponent.getAttribute('data-is-agreement');
                }
                this._replaceApprovalRoom(componentData);

                if (!isAgreementOrReception) {
                    var roomModel = this.activityGroups.findWhere({'seq': parseInt(seq)});
                    roomModel.set('name', name);
                    roomModel.set('maxApprovalCount', maxApprovalCount);
                    this.model.set('activityGroups', this.activityGroups.toJSON());
                    this.model.set('templateHtml', this.editor.getContent());
                }
            }
        },

        /**
         * @Override
         * TODO. 기존 코드 이므로 refactoring 하자
         */
        _onClickAddActivity: function (e) {
            var seq = this.editingComponent.getAttribute('data-group-seq');
            var activityType = $(e.currentTarget).attr('data-add-activity').toUpperCase();
            var addCallback = function (data) {
                var model = this.activityGroups.findWhere({seq: parseInt(seq)});
                var newActivity = {type: activityType};
                if (data.type == 'org') {
                    _.extend(newActivity, {
                        userId: null,
                        userName: null,
                        position: null,
                        deptId: data.id,
                        deptName: data.name,
                        displayName: data.name
                    });
                } else {
                    _.extend(newActivity, {
                        userId: data.id,
                        userName: data.name,
                        position: data.position,
                        deptId: data.deptId,
                        deptName: data.deptName,
                        displayName: data.displayName
                    });
                }

                if (model.isExistActivity(newActivity)) {
                    $.goAlert(lang['이미 추가되어 있습니다.']);
                    return;
                }

                /**
                 * 지정결재자가(결재 + 합의 + 감사 포함) 최대 결재자수를 넘어갈 수 없다. 여기선 인원을 추가하기 전이므로 +1을 해준다.
                 */
                if (model.getActivityCollection().length + 1 > model.getMaxApprovalCount()) {
                    $.goAlert(lang['지정 결재자가 최대 결재자 인원수를 초과하였습니다.']);
                    return;
                }

                if (model.getActivityCollection().length + 1 > 10) {
                    $.goAlert(lang['지정 결재자는 10개를 초과 하실 수 없습니다']);
                    return;
                }

                if (!ActivityModel.validate(newActivity)) {
                    $.goMessage(lang['부서가 없는 사용자는 추가할 수 없습니다.']);
                    return false;
                }

                model.addActivity(newActivity);
                this.model.set('activityGroups', this.activityGroups.toJSON());
                this._appendActivity(newActivity);
            };
            var orgType = 'node';
            var agreementAllowType = this.config.get('agreementAllowType');
            if (activityType == 'AGREEMENT') {
                if (this.config.get('agreementAllowType') == 'DEPARTMENT') {
                    orgType = 'department';
                } else if (agreementAllowType == 'USER') {
                    orgType = 'list';
                }
            } else {
                orgType = (_.contains(['APPROVAL', 'CHECK', 'INSPECTION'], activityType)) ? 'list' : 'node';
            }

            var orgSlideOption = {
                header: lang['add' + activityType],
                callback: $.proxy(addCallback, this),
                contextRoot: GO.contextRoot,
                type: orgType,
                isAdmin: true
            };

            if (_.isArray(this.companyIds)) {
                orgSlideOption['companyIds'] = this.companyIds;
            }

            $.goOrgSlide(orgSlideOption);
        },

        _renderActivities: function (model) {
            this.$('[data-approval-members]').find('li:not([data-add-activity])').remove();
            _.each(model.get('activities'), function (activity) {
                this._appendActivity(activity);
            }, this);
        },

        _removeActivity: function(type) {
            this.$('[data-approval-members="' + type + '"]').find('li:not([data-add-activity])').remove();
        },

        _appendActivity: function (activity) {
            var type = {
                'APPROVAL': 'approval',
                'AGREEMENT': 'agreement',
                'CHECK': 'check',
                'INSPECTION': 'inspection',
                'apprLineRule': 'apprLineRule'

            }[activity.type];
            this.$('[data-add-activity="' + type + '"]').before(activityItem.render({
                type: type,
                activity: activity,
                typeLabel: lang[type]
            }));
        },

        _addApprLineRule: function(activity) {
            this._removeActivity('apprLineRule');
            this._appendActivity(activity);
            
            var apprLineRuleGrops = [];
            if(activity.optionCount && activity.optionCount > 0 ){
            	for(var i=0; i < activity.optionCount; i++){
            		apprLineRuleGrops.push({});
            	}
            }
            
            this.model.set('apprLineRuleModel', {
                id: parseInt(activity.id),
                name: activity.displayName,
                apprLineRuleGroups: apprLineRuleGrops
            });
        },

        _onClickDeleteAppointUser: function (e) {
            var seq = parseInt(this.editingComponent.getAttribute('data-group-seq'));
            var roomModel = this.activityGroups.findWhere({seq: seq});
            var $item = $(e.currentTarget).parents('[data-activity-type]');
            var userId = $item.attr('data-user-id');
            var deptId = $item.attr('data-dept-id');
            var id = $item.attr('data-id');
            var type = $item.attr('data-activity-type');
            var model = {
                type: type.toUpperCase()
            };
            if (type === 'apprLineRule') {
                this.model.set('apprLineRuleModel', null);
            } else {
                if (userId) model['userId'] = parseInt(userId);
                if (deptId) model['deptId'] = parseInt(deptId);
                var activities = new Backbone.Collection(roomModel.get('activities'));
                var activity = activities.findWhere(model);
                activities.remove(activity);
                roomModel.set('activities', activities.toJSON());
                this.model.set('activityGroups', this.activityGroups.toJSON());
            }
        },

        _getAllSameKindApprovalRoomByData: function(data, editorDocument) {
            editorDocument = editorDocument || this.editor.getDocument();
            var query = this._getSameKindRoomQuery(data);
            return $(editorDocument).find(query);
        },

        _getSameKindApprovalRoomByData: function(data, editorDocument) {
            editorDocument = editorDocument || this.editor.getDocument();
            var query = this._getSameKindRoomQuery(data);
            query += '[data-group-type="' + data.roomType + '"]';
            query += '[data-group-seq="' + data.seq+ '"]';
            return $(editorDocument).find(query);
        },

        /**
         * @description 일반, 수신, 합의 구분. 일반결재방의 name 은 중복이 가능하므로 key 만 사용한다.
         */
        _getSameKindRoomQuery: function(data) {
            var query = '[data-group-name]';
            if (data.isAgreement) {
                query += '[' + this.agreementKey + '="true"]';
            } else if (data.isReception) {
                query += '[' + this.receptionKey + '="true"]';
            } else { // 기존 양식 편집기 지원. 일반 결재방이 reception key 를 가지고 있는 기존 잘못된 코드 방어.
                query += '[' + this.agreementKey + '!="true"][' + this.receptionKey + '!="true"]';
            }
            return query;
        },

        _generateRoomSeq: function(editorDocument) {
            editorDocument = editorDocument || this.editor.getDocument();
            var $rooms = this._getAllNormalApprovalRoom(editorDocument);
            var sequences = _.map($rooms, function(room) {
                return parseInt($(room).attr('data-group-seq'));
            });
            return sequences.length ? _.max(sequences) + 1 : 0;
        },

        _getApprovalRoomBySeq: function(seq) {
            var editorDocument = this.editor.getDocument();
            return $(editorDocument).find('[data-group-seq="' + seq + '"]')[0];
        },

        /**
         * @param data
         * @param withoutCover: wrapper 가 이미 있는 경우 사용. wrapper 없는 컴포넌트를 반환
         * @param useBlockType: 기존 결재방 마크업 사용. 서버에 저정할때 기존 마크업으로 저장하자.
         * @returns {*}
         * @private
         */
        _makeRoomTemplate: function(data, withoutCover, useBlockType) {
            var maxCount = parseInt(data.maxApprovalCount);
            var template = data.roomType === 'type1' ? (useBlockType ? roomType1BlockTemplate : roomType1InlineTemplate) : roomType2Template;
            var activities = [];
            for (var i = 0; i < maxCount; i++) {
                activities.push({}); // 현재 양식에선 데이터가 없어도 된다. 개수만 맞춰주자.
            }
            var cloneData = _.clone(data);
            return template(_.extend(cloneData, {
                activities: activities,
                withoutCover: withoutCover
            }));
        },

        _convertBlockToInline: function(content) {
            var $content = $('<span>' + content + '</span>');
            _.each($content.find('div[data-group-type="type1"]'), function(room) {
                var roomData = this._getRoomDataByElement(room);
                room.outerHTML = this._makeRoomTemplate(roomData, true);
            }, this);
            return $content[0].innerHTML;
        },

        // GO-25082 > 에디터 정렬 기능을 위해 결재선 마크업(block -> inline) 변경
        _convertInlineToBlock: function(content) {
            var $content = $('<span>' + content + '</span>');
            _.each($content.find('span[data-group-type="type1"]'), function(room) {
                var roomData = this._getRoomDataByElement(room);
                room.outerHTML = this._makeRoomTemplate(roomData, true, true);
            }, this);
            return $content[0].innerHTML;
        },

        _hideApprovalRoomCommonSettingArea: function() {
            this.$('[data-right-panel-contents="roomCommon"]').slideUp();
        },
        
        _getTemplateHtmlByContent: function(editorContent) {
        	var parser = new DOMParser();
            var editorDocument = parser.parseFromString(editorContent, "text/html");
            
            var allRooms = $(editorDocument).find('[data-group-seq]');
            _.each(allRooms, function (room) {
                var $room = $(room);
                var $wrapper = $room.parents('.comp_wrap');
                $.each($wrapper,function(k,v){
                	$room.detach();
                    $(v).after($room);
                    $(v).remove();
                });
                
            }, this);
            
            var result = this._editorContentToModel(editorDocument.body.innerHTML);
            
            //양식이 한 엘리먼트안에 들어있지 않으면 span으로 한번 감싼다.
            if($(result).length > 1){
            	result = '<span>' + result + '</span>';
            }
            
            return result;
        },

        _wrapRoom: function () {
            var editorDocument = this.editor.getDocument();
            var allRooms = this._getAllApprovalRoom(editorDocument);
            _.each(allRooms, function (room) {
                var $room = $(room);
                var type = $room.attr('data-group-type');
                $room.wrap(roomWrapperStartTag + componentWrapperEndTag);
                var wrapper = $room.parent();
                if (type === 'type2') wrapper.attr('style', 'width: 100%;');
                wrapper.append(componentBorder);
                wrapper.append(componentDeleteButton);
            }, this);
        },

        _getAllApprovalRoom: function(editorDocument) {
            editorDocument = editorDocument || this.editor.getDocument();
            return $(editorDocument).find('[data-group-seq]');
        },

        _getAllNormalApprovalRoom: function(editorDocument) {
            var allRooms = this._getAllApprovalRoom(editorDocument);
            return _.filter(allRooms, function(room) {
                return !this._isAgreementOrReception(room);
            }, this);
        },

        _onClickLoadForm: function () {
            var templateListLayerView = new TemplateListLayerView({
                selectCallback: _.bind(function(content) {
                    this._setContent(this._modelToEditorContent(content));
                }, this)
            });
            templateListLayerView.render();
        }
    });
});