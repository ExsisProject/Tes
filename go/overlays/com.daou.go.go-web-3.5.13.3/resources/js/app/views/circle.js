(function () {

    define([
            "jquery",
            "underscore",
            "backbone",
            "app",
            "helpers/form",
            "system/collections/companies",

            "i18n!survey/nls/survey",
            "i18n!nls/commons",
            "i18n!approval/nls/approval",
            "i18n!admin/nls/admin",
            "i18n!board/nls/board",

            'hgn!templates/circle_selected_node_list_view',
            'hgn!templates/circle_selected_node_view',

            "go-nametags",
            "libraries/go-classcodepicker",
            'jquery.go-orgslide'
        ],

        function (
            $,
            _,
            Backbone,
            GO,
            FormHelper,
            CompanyCollection,
            SurveyLang,
            commonLang,
            approvalLang,
            adminLang,
            boardLang,
            circle_selected_node_list_view,
            circle_selected_node_view
        ) {

            var lang = {
                'user': commonLang['사용자'],
                'subdepartment': approvalLang['부서'],
                'department': approvalLang['부서'],
                'position': approvalLang['직위'],
                'duty': adminLang['직책'],
                'grade': adminLang['직급'],
                'usergroup': adminLang['사용자그룹'],
                'position_select': adminLang['직위 선택'],
                'duty_select': adminLang['직책 선택'],
                'grade_select': adminLang['직급 선택'],
                'usergroup_select': adminLang['사용자그룹 선택'],
                'including_sub_dept': boardLang['하위 부서 포함'],
                'include_child_dept': SurveyLang['하위 부서 포함하기'],
                'select_department': SurveyLang['부서 선택'],
                'select_user': SurveyLang['사용자 선택'],
                'add': commonLang['추가'],
                'remove': commonLang['삭제'],
                'add_dept': SurveyLang['부서추가'],
                'dept_name': SurveyLang['부서명'],
                'target_whole': SurveyLang['전사'],
                'target_part': SurveyLang['일부'],
                'select_dept': SurveyLang['부서 선택'],
                'select_class': SurveyLang['클래스 선택'],
                'child_dept': SurveyLang['하위 부서'],
                'site_select': adminLang['사이트 선택'],
                'writable': adminLang['쓰기가능'],
                'notUseApprReception': '문서 수신 기능을 사용하지 않는 부서입니다. 해당 부서를 추가하려면 [전자결재 > 부서 문서함 관리 > 부서 문서함 사용 설정]에서 수신함을 체크해주세요.',
                'notUseApprReference': '부서문서함 기능을 사용하지 않는 부서입니다. 해당 부서를 추가하려면 [전자결재 > 부서 문서함 관리 > 부서 문서함 사용 설정]에서 부서함을 체크해주세요.',
            };


            /**
             *
             * 노드 모델
             *
             */
            var CircleNodeModel = Backbone.Model.extend({
                defaults: {
                    nodeId: 0,
                    nodeDeptId: "",
                    nodeCompanyId: null,
                    nodeCompanyName: null,
                    nodeType: 'user', /* POSITION, GRADE, DUTY, USERGROUP, USER, DEPARTMENT, SUBDEPARTMENT */
                    nodeValue: '', /* 멤버값 출력 문자열 */
                    actions: '', /* read, write */
                    members: null,
                    isWorksSetting: false
                },

                initialize: function () {
                    if (!_.isArray(this.get('members'))) {
                        this.set('members', []);
                    }
                },

                isUserType: function () {
                    return this.get('nodeType') == 'user';
                },

                isUserWithDeptType: function () {
                    return this.isUserType() && !this.get('nodeDeptId');
                },

                isDeptType: function (includingSubDeptType) {
                    var result = this.get('nodeType') == 'department';
                    if (includingSubDeptType) {
                        result = result || this.isSubDeptType();
                    }
                    return result;
                },

                isSubDeptType: function () {
                    return this.get('nodeType') == 'subdepartment';
                },

                isPositionType: function () {
                    return this.get('nodeType') == 'position';
                },

                isGradeType: function () {
                    return this.get('nodeType') == 'grade';
                },

                isDutyType: function () {
                    return this.get('nodeType') == 'duty';
                },

                isUserGroupType: function () {
                    return this.get('nodeType') == 'usergroup';
                }
            });


            /**
             *
             * 노드 컬렉션
             *
             */
            var CircleNodeCollection = Backbone.Collection.extend({

                model: CircleNodeModel,

                /**
                 * 데이터를 추가한다. (중복은 제외하며, false를 반환)
                 */
                addNode: function (model) {
                    var duplicated = this.getByNodeIdAndType(model.get('nodeId'), model.get('nodeType'), model.get('nodeDeptId'));
                    if (!_.isUndefined(duplicated)) {
                        return false;
                    }

                    this.add(model);
                    return true;
                },

                /**
                 * id, type에 해당하는 데이터가 있으면 반환한다.
                 */
                getByNodeIdAndType: function (nodeId, nodeType, nodeDeptId) {
                    return this.find(function (m) {
                        var isSameId = (nodeId == m.get('nodeId'));
                        var isSameType = (nodeType == m.get('nodeType'));

                        if (_.contains(['department', 'subdepartment'], nodeType) && m.isDeptType(true)) {
                            isSameType = true;
                        }

                        if (m.isUserWithDeptType() && !!m.get('nodeDeptId')) {
                            isSameType = isSameId && (m.get('nodeDeptId') == nodeDeptId);
                        }

                        return isSameId && isSameType;
                    });
                },

                /**
                 * id, type에 해당하는 데이터가 있으면 제거한다. 성공하면 true, 실패하면 false 반환.
                 */
                removeByNodeIdAndType: function (nodeId, nodeType, nodeDeptId) {

                    var target = this.getByNodeIdAndType(nodeId, nodeType, nodeDeptId);
                    if (target) {
                        this.remove(target);
                        return true;
                    } else {
                        return false;
                    }
                }
            });


            /**
             *
             * 써클 모델
             *
             */
            var CircleModel = Backbone.Model.extend({

                defaults: {
                    discription: '',
                    nodes: null
                },

                initialize: function () {
                    if (_.isArray(this.get('nodes'))) {
                        this.set('nodes', this.get('nodes').slice());
                    } else {
                        this.set('nodes', []);
                    }
                },

                /**
                 * 노드 목록을 컬렉션으로 반환함 (복사본)
                 *
                 * @returns {CircleNodeCollection}
                 */
                getNodeCollection: function () {
                    return new CircleNodeCollection(this.get('nodes'));
                }
            });


            /**
             *
             * 써클을 선택하기 위한 회사를 선택한다.
             *
             */
            var CompanyListView = Backbone.View.extend({

                tagName: 'span',
                className: 'vertical_wrap',

                events: {
                    'change .circle_company_select': '_onCompanySelected'
                },

                initialize: function (options) {
                    this.collection = new CompanyCollection({
                        'type': options.type
                    });
                    this.observer = options.observer;

                    if (_.isArray(options.ids)) {
                        this.ids = _.map(options.ids, function (id) {
                            return '' + id
                        });
                    }
                },

                render: function () {
                    var ctx = this;
                    this.collection.fetch({
                        success: function (collection) {
                            ctx.$el.append(ctx._renderTemplate(collection.toJSON()));
                            ctx._notifyCompanySelected();
                        }
                    });
                },

                _renderTemplate: function (companies) {

                    if (_.isArray(this.ids)) {
                        companies = _.filter(companies, function (company) {
                            if (_.contains(this.ids, ('' + company['id']))) {
                                if (GO.session().companyId == company['id']) {
                                    _.extend(company, {selectedCompany: true});
                                }
                                return true;
                            }
                            return false;
                        }, this);
                    }

                    var tmpl = [
                        '<span class="option_wrap">',
                        '    <label class="tit" title="">{{labelTitle}}</label>',
                        '</span>',
                        '<select class="circle_company_select">',
                        '    {{#companies}}',
                        '    <option value="{{name}}" data-id="{{id}}" data-name="{{name}}" {{#selectedCompany}}selected{{/selectedCompany}}>{{name}}</option>',
                        '    {{/companies}}',
                        '    {{^companies}}',
                        '    <option>{{labelNoCompanies}}</option>',
                        '    {{/companies}}',
                        '</select>'
                    ];

                    return Hogan.compile(tmpl.join('\n')).render({
                        'labelTitle': lang['site_select'],
                        'labelNoCompanies': adminLang['선택된 사이트가 없습니다.'],
                        'companies': companies
                    });
                },

                _onCompanySelected: function (e) {
                    this._notifyCompanySelected(e);
                },

                _notifyCompanySelected: function (e) {
                    var companyId = null;
                    var companyName = null;
                    if (_.isUndefined(e)) {
                        companyId = GO.session().companyId;
                        companyName = GO.session().companyName;
                    } else {
                        var $selected = $selected = $(e.currentTarget).find('option:selected');
                        companyId = $selected.attr('data-id');
                        companyName = $selected.attr('data-name');
                    }
                    this.observer.trigger('companySelected', companyId, companyName);
                }
            })


            /**
             *
             * 현재 선택된 노드들을 표현한다. 삭제도 가능하다.
             *
             */
            var SelectedNodeListView = Backbone.View.extend({

                /**
                 * 초기화. 기존의 이미 저장된 데이터가 있는 경우 이들을 먼저 보여줌.
                 */
                initialize: function (options) {
                    this.isAdmin = (_.isBoolean(options.isAdmin)) ? options.isAdmin : true;
                    this.isWorksSetting = (_.isBoolean(options.isWorksSetting)) ? options.isWorksSetting : false;
                    this.visibleCompanyName = (_.isBoolean(options.visibleCompanyName)) ? options.visibleCompanyName : false;
                    this.collection = _.isArray(options.collection.models) ? new CircleNodeCollection(options.collection.models) : new CircleNodeCollection();
                    this.withoutSubDept = _.isBoolean(options.withoutSubDept) ? options.withoutSubDept : false;
                    this.addCallback = (_.isFunction(options.addCallback)) ? options.addCallback : null;
                    this.changeCallback = (_.isFunction(options.changeCallback)) ? options.changeCallback : null;
                    this.removeCallback = (_.isFunction(options.removeCallback)) ? options.removeCallback : null;
                    this.useAction = (_.isBoolean(options.useAction)) ? options.useAction : false;
                },

                /**
                 * 렌더링
                 */
                render: function () {
                    this._renderNodeList();
                    this.$el.off();
                    this.$el.on('click', 'span.ic_delete', $.proxy(this._deleteNodeFromList, this));
                    this.$el.on('click', 'span.ic_del', $.proxy(this._deleteNodeFromList, this));
                    this.$el.on('click', 'input[name=include_sub_dept]', $.proxy(this._toggleSubDeptIncluding, this));
                },

                /**
                 * 노드 데이터를 리스트 형태로 더한다.
                 */
                addNodeToList: function (nodeModel) {
                    this.collection.addNode(nodeModel);
                    if (_.isFunction(this.addCallback)) {
                        this.addCallback();
                    }
                },

                _renderNodeList: function () {
                    this.$el.html(this._makeTemplate({
                        'isWorksSetting': this.isWorksSetting,
                        'nodes': this._makeTemplateData(this.collection),
                        'withoutSubDept': this.withoutSubDept,
                        'visibleCompanyName': this.visibleCompanyName,
                        'delete_label': lang['remove'],
                        'including_sub_dept_label': lang['including_sub_dept'],
                        'useAction': this.useAction
                    }));
                },

                _makeTemplate: function (data) {
                    var isWorksSetting = data.isWorksSetting;
                    var hasNodes = data.nodes.length > 0 ? true : false;
                    data.hasNodes = hasNodes;

                    var nodes = [];
                    _.forEach(data.nodes, function (node) {
                        var type = node.nodeType == 'subdepartment' ? 'department' : node.nodeType;
                        if (!nodes[type]) {
                            nodes[type] = [];
                        }
                        nodes[type][nodes[type].length] = node;
                    });
                    var self = this;
                    if (!hasNodes) {
                        return '';
                    }

                    /**
                     * Template({
                "title": title,
                "messages": messages,
                "label_prev": Lang["확인"],
                "hasPrev" : history.length > 1 ? true : false
            });
                     */
                    var res = '<div class="option_display"><div class="form form_share_data">';
                    _.forEach(NodeSelectorView.NODE_TYPES, function (type) {
                        if (nodes[type]) {
                            var item = [];
                            // 부서 템플릿
                            _.forEach(nodes[type], function (nd) {
                                var deptType = nd.nodeType == 'department' || nd.nodeType == 'subdepartment';
                                item.push({
                                    node: circle_selected_node_view({
                                        nodeValue: type === 'user' ? nd.nodeValue.split(' ')[0] : nd.nodeValue,
                                        isDept: deptType && !this.withoutSubDept,
                                        subDeptType: nd.nodeType == 'subdepartment',
                                        includeSubDept: lang['including_sub_dept']
                                    }),
                                    nodeId: nd.nodeId || "",
                                    nodeType: nd.nodeType || "",
                                    nodeAction: nd.action || "",
                                    nodeDeptId: nd.nodeDeptId || "",
                                    isNewLine: isWorksSetting && (nd.nodeType == "department" || nd.nodeType == "subdepartment")
                                });
                            });
                            res += circle_selected_node_list_view({
                                nodeType: lang[type],
                                nodeList: item
                            });
                        }
                    });

                    res += '</div></div>';
                    return res;
                },

                _makeTemplateData: function (collection) {
                    return _.map(collection.models, function (m, idx) {
                        return {
                            'isFirst?': idx == 0,
                            'isDeptOrSubDeptType?': m.isDeptType(true),
                            'isSubDeptType?': m.isSubDeptType(),
                            'nodeId': m.get('nodeId'),
                            'nodeType': m.get('nodeType'),
                            'nodeDeptId': m.get('nodeDeptId'),
                            'nodeCompanyName': m.get('nodeCompanyName'),
                            'nodeValue': m.get('nodeValue'),
                            'nodeTypeLabel': lang[m.get('nodeType')],
                            'actions': m.get('actions'),
                            'actionName': function () {
                                var actions = m.get("actions");
                                var actionsName = [];
                                if (actions.indexOf(ACTION.READABLE) >= 0) {
                                    actionsName.push(adminLang["읽기"]);
                                }

                                if (actions.indexOf(ACTION.WRITABLE) >= 0) {
                                    actionsName.push(adminLang["쓰기"]);
                                }

                                /**
                                 * 관리 항목이 늘어날 경우 사용
                                 *
                                 if(actions.indexOf(ACTION.REMOVABLE) >= 0){
                                actionName.push(adminLang["삭제"]);
                            }

                                 if(actions.indexOf(ACTION.MANAGABLE) >= 0){
                                actionName.push(adminLang["관리"]);
                            }
                                 */

                                return actionsName.join("/");
                            }()
                        };
                    });
                },

                _deleteNodeFromList: function (e) {
                    var $target = $(e.currentTarget).parent().parent();
                    this.collection.removeByNodeIdAndType($target.attr('data-nodeId'), $target.attr('data-nodeType'), $target.attr('data-nodeDeptId'));
                    this._renderNodeList(); // target 이 ghost 가 되버리므로 버블링을 막거나, rendering 을 다시 하지 않아야 한다.

                    if (_.isFunction(this.removeCallback)) {
                        this.removeCallback();
                    }
                    e.stopPropagation();
                },

                /**
                 * 현재 추가된 써클 노드 목록을 모두 삭제한다.
                 */
                deleteAllNodeFromList: function () {
                    _.each(this.getDataAsJSON(), function (nodeData) {
                        this.collection.removeByNodeIdAndType(nodeData['nodeId'], nodeData['nodeType'], nodeData['nodeDeptId']);
                    }, this);
                    this._renderNodeList();
                },

                /**
                 * 현재 추가된 써클 노드 목록 중, 주어진 회사의 데이터를 모두 삭제한다.
                 */
                deleteNodeOfCompany: function (companyId) {
                    var targets = this.collection.filter(function (model) {
                        if (!_.isUndefined(model.get('nodeCompanyId')) && !_.isUndefined(companyId)) {
                            if (String(model.get('nodeCompanyId')) == String(companyId)) {
                                return true;
                            }
                        }
                        return false;
                    });

                    this.collection.remove(targets);
                },

                _toggleSubDeptIncluding: function (e) {
                    var $target = $(e.currentTarget).parent().parent().parent(),
                        isChecked = $(e.currentTarget).is(':checked'),
                        model = this.collection.getByNodeIdAndType($target.attr('data-nodeId'), $target.attr('data-nodeType'), $target.attr('data-nodeDeptId'));

                    model.set('nodeType', (isChecked ? 'subdepartment' : 'department'));
                    if (_.isFunction(this.changeCallback)) {
                        this.changeCallback();
                    }
                    this._renderNodeList(); // target 이 ghost 가 되버리므로 버블링을 막거나, rendering 을 다시 하지 않아야 한다.
                    e.stopPropagation();
                },

                /**
                 * 현재 추가된 써클 노드 목록을 JSON 형태로 반환한다.
                 */
                getDataAsJSON: function () {
                    return this.collection.toJSON();
                }
            });


            /**
             *
             * 추가할 수 있는 노드들을 표현한다.
             *
             */
            var NodeSelectorView = Backbone.View.extend({

                    tagName: 'span',
                    className: 'vertical_wrap',

                    /**
                     * 초기화. options을 통해 어떤 picker를 노출할지 결정함.
                     */
                    initialize: function (options) {
                        this.isAdmin = (_.isBoolean(options.isAdmin)) ? options.isAdmin : true;
                        this.nodeTypes = (_.isArray(options.nodeTypes)) ? options.nodeTypes : NodeSelectorView.NODE_TYPES;
                        this.callback = (_.isFunction(options.callback)) ? options.callback : function () {
                            return;
                        };
                        this.labelVisible = (_.isBoolean(options.labelVisible)) ? options.labelVisible : false;
                        this.useAction = (_.isBoolean(options.useAction)) ? options.useAction : false;
                        this.useApprReception = (_.isBoolean(options.useApprReception)) ? options.useApprReception : false;
                        this.useApprReference = (_.isBoolean(options.useApprReference)) ? options.useApprReference : false;
                        this.observer = options.observer;
                        this.zIndex = options.zIndex;
                    },

                    /**
                     * 렌더링..
                     */
                    render: function (companyId, companyName) {
                        this.$el.html(this._prepareTemplate({
                            'labelVisible': this.labelVisible,
                            'labelClassSelect': lang['select_class'],
                            'nodeTypes': _.map(this.nodeTypes, function (type) {
                                return {
                                    value: type,
                                    label: lang[type]
                                };
                            })
                        }));

                        this._renderSelectableList(null, companyId, companyName);

                        // Picker 타입 변경시 Picker를 다시 그린다.
                        this.$el.off().on('change', 'select.node_type_select', $.proxy(function (e) {
                            this._renderSelectableList($(e.target).val(), companyId, companyName);
                        }, this));

                        // 회사가 변경되면 새로운 회사로 Picker를 다시 그린다.
                        this.observer.bind('companySelected', function () {
                            var companyId = arguments[0],
                                companyName = arguments[1];

                            this.render(companyId, companyName);
                        }, this);
                    },

                    _prepareTemplate: function (data) {
                        var htmls = [
                            '{{#labelVisible}}',
                            '<span class="option_wrap w170">',
                            '    <label class="tit" title="">{{labelClassSelect}}</label>',
                            '</span>',
                            '{{/labelVisible}}',
                            '<select class="node_type_select w170">',
                            '{{#nodeTypes}}',
                            '    <option value="{{value}}">{{label}}</option>',
                            '{{/nodeTypes}}',
                            '</select>'
                        ];

                        var compiled = Hogan.compile(htmls.join('\n'));
                        return compiled.render(data);
                    },

                    _renderSelectableList: function (type, companyId, companyName) {
                        if (_.isEmpty(type)) {
                            // 최초 로드시 맨 위의 것으로 Picker를 그린다.
                            type = $('select.node_type_select > option:first', this.$el).val();
                        }

                        $('select.node_type_select', this.$el).nextAll().remove();
                        if (this.nodePickerView) {
                            this.nodePickerView.close();
                        }

                        // ClassNodePicker와 OrgNodePicker는 공통의 인터페이스를 가진다.
                        var Selector = (_.contains(['user', 'department', 'subdepartment'], type)) ? OrgNodeSelectorView : ClassNodeSelectorView;
                        this.nodePickerView = new Selector({
                            'zIndex': this.zIndex,
                            'type': type,
                            'companyId': companyId,
                            'isAdmin': this.isAdmin,
                            'useApprReception': this.useApprReception,
                            'useApprReference': this.useApprReference,
                            'callback': $.proxy(function (nodeModel) {
                                if (companyId) {
                                    nodeModel.set('nodeCompanyId', companyId);
                                    nodeModel.set('nodeCompanyName', companyName);
                                }
                                this.callback(nodeModel);
                            }, this),
                            'useAction': this.useAction
                        });

                        this.nodePickerView.render();
                        $('select.node_type_select', this.$el).after(this.nodePickerView.$el);
                    }
                },
                {
                    NODE_TYPES: ['position', 'grade', 'duty', 'usergroup', 'department', 'user'],
                });


            var ACTION = {
                READABLE: 'read',
                WRITABLE: 'write',
                REMOVABLE: 'remove',
                MANAGABLE: 'manage'
            }

            /**
             *
             * 부서와 사용자 노드를 선택하기 위한 뷰. (orgSlide를 통해 노드를 선택하고 추가한다.)
             *
             */
            var OrgNodeSelectorView = Backbone.View.extend({

                tagName: 'span',
                className: 'orgNodePicker',
                orgSlide: null,
                isAdmin: null,
                callback: null,
                useApprReception: null,
                useApprReference: null,
                type: null,
                useAction: null,

                /**
                 * 초기화. type, callback 옵션 필수.
                 */
                initialize: function (options) {
                    this.zIndex = options.zIndex;
                    this.type = options.type;
                    this.callback = options.callback;
                    this.isAdmin = (_.isBoolean(options.isAdmin)) ? options.isAdmin : true;
                    this.companyId = (_.isEmpty(options.companyId)) ? null : options.companyId;
                    this.useAction = (_.isBoolean(options.useAction)) ? options.useAction : false;
                    this.useApprReception = (_.isBoolean(options.useApprReception)) ? options.useApprReception : false;
                    this.useApprReference = (_.isBoolean(options.useApprReference)) ? options.useApprReference : false;
                },

                /**
                 * 렌더링.
                 */
                render: function () {
                    var orgSelectCallback = function (type, callback, info) {
                        var isUserSelected = _.contains(['MASTER', 'MODERATOR', 'MEMBER'], info.type);
                        if (type == 'user' && !isUserSelected) {
                            return;
                        }

                        if (type != 'user' && isUserSelected) {
                            return;
                        }

                        if (_.contains(['department', 'department-nosub'], type) && info.type != 'root' && this.useApprReception && !info.useReception) {
                            $.goAlert(lang['notUseApprReception']);
                            return;
                        }

                        if (_.contains(['department', 'department-nosub'], type) && info.type != 'root' && this.useApprReference && !info.useReference) {
                            $.goAlert(lang['notUseApprReference']);
                            return;
                        }

                        var actions = [];

                        if (this.useAction) {
                            actions.push(ACTION.READABLE);
                            if (this.$el.find("#wAuth").prop("checked")) {
                                actions.push(ACTION.WRITABLE);
                            }
                        }

                        callback(new CircleNodeModel({
                            'nodeValue': type == 'user' ? info.name + " " + info.position : info.name,
                            'nodeType': type,
                            'nodeId': info.id,
                            'nodeDeptId': info.deptId,
                            'actions': actions.join(',')
                        }));
                    };

                    var htmls = [
                        '{{#useAction}}',
                        '<span class="option_wrap">',
                        '    <input type="checkbox" value="" class="writePossible" id="wAuth">',
                        '    <label for="wAuth">{{lang.writable}}</label>',
                        '</span>',
                        '{{/useAction}}',
                        '&nbsp;',
                        '<span class="btn_minor_s select_org_node" data-type={{type}}>{{add}}</span> </span>',
                    ];

                    this.$el.html(Hogan.compile(htmls.join('\n')).render({
                        'type': this.type,
                        'add': lang['add'],
                        'useAction': this.useAction,
                        'lang': lang
                    }));

                    this.$el.off().on('click', 'span.select_org_node', $.proxy(function (e) {
                        var type = $(e.target).data('type');

                        this.orgSlide = $.goOrgSlide({
                            header: lang['select_' + type],
                            type: (type == 'user') ? 'list' : 'department',
                            isAdmin: this.isAdmin,
                            companyIds: [this.companyId],
                            contextRoot: GO.config("contextRoot"),
                            callback: $.proxy(orgSelectCallback, this, this.type, this.callback),
                            zIndex : this.zIndex,
                        });
                    }, this));
                },

                /**
                 * 닫아야 할 것이 있다면 닫는다.
                 */
                close: function () {
                    if (this.orgSlide) {
                        this.orgSlide.close();
                    }
                }
            });


            /**
             *
             * 직위/직급/직책/사용자그룹 노드를 선택하기 위한 뷰. (이들을 총칭해서 Class라함..)
             *
             */
            var ClassNodeSelectorView = Backbone.View.extend({

                tagName: 'span',
                className: 'classNodePicker',
                isAdmin: null,
                callback: null,
                type: null,
                useAction: null,

                /**
                 * 초기화. type, callback 옵션 필수.
                 */
                initialize: function (options) {
                    this.type = options.type;
                    this.companyId = options.companyId;
                    this.callback = options.callback;
                    this.isAdmin = (_.isBoolean(options.isAdmin)) ? options.isAdmin : true;
                    this.useAction = (_.isBoolean(options.useAction)) ? options.useAction : false;
                },

                /**
                 * 렌더링.
                 */
                render: function () {
                    this._fetchClassNodeList(this.type, $.proxy(this._renderClassNodeList, this));
                },

                /**
                 * 닫아야 할 것이 있다면 닫는다.
                 */
                close: function () {
                    return false;
                },

                _fetchClassNodeList: function (type, callback) {
                    var url = GO.config('contextRoot') + (this.isAdmin ? 'ad/' : '') + 'api/' + type + '/list';

                    if (this.companyId) {
                        url += '?companyId=' + this.companyId;
                    }

                    $.ajax(url).done(function (resp) {
                        callback(resp.data, type);
                    });
                },

                _renderClassNodeList: function (data, type) {
                    var htmls = [
                        '&nbsp;',
                        '<select class="class_selector_option">',
                        '    {{#nodes}}',
                        '    <option value="{{id}}" data-code="{{code}}" data-codeType="{{codeType}}">{{name}}</option>',
                        '    {{/nodes}}',
                        '    {{^nodes}}',
                        '    <option selected disabled>{{select_name}}</option>',
                        '    {{/nodes}}',
                        '</select>',
                        '{{#useAction}}',
                        '<span class="option_wrap">',
                        '    <input type="checkbox" value="" class="writePossible" id="wAuth">',
                        '    <label for="wAuth">{{lang.writable}}</label>',
                        '</span>',
                        '{{/useAction}}',
                        '<span class="btn_minor_s class_selector_button" data-type={{type}}>{{lang.add}}</span> </span>',
                    ];

                    var compiled = Hogan.compile(htmls.join('\n'));
                    this.$el.append(compiled.render({
                        'select_name': lang[type + '_select'],
                        'nodes': data,
                        'lang': lang,
                        'useAction': this.useAction
                    }));

                    this.$el.off();
                    this.$el.on('click', 'span.class_selector_button', $.proxy(function (e) {
                        var $selected = $('select.class_selector_option option:selected', this.$el);
                        var actions = [];

                        if (this.useAction) {
                            actions.push(ACTION.READABLE);
                            if (this.$el.find("#wAuth").prop("checked")) {
                                actions.push(ACTION.WRITABLE);
                            }
                        }

                        this.callback(new CircleNodeModel({
                            'nodeType': $selected.attr('data-codetype').toLowerCase(),
                            'nodeValue': $selected.text(),
                            'nodeId': $selected.val(),
                            'actions': actions.join(",")
                        }));
                    }, this));
                }
            });


            /**
             *
             * 써클 관련 화면 전체를 관장하는 최종 뷰. 사용자는 이 뷰를 통해서만 화면을 컨트롤한다.
             *
             */
            var CircleView = Backbone.View.extend({

                view: null,
                nodePickerView: null,
                nodeListView: null,
                companyListView: null,
                useApprReception: null, //전재결재 admin에서 쓰이는 옵션. appr_form.js. 전자결재 양식에서 수신자 부서 선택시 orgSlide를 띄우고 metaData의 useApprReception이 false인 값들을 validate하기 위한 옵션 : GO-19338
                useApprReference: null, //전재결재 admin에서 쓰이는 옵션. appr_form.js. 전자결재 양식에서 참조자 부서 선택시 orgSlide를 띄우고 metaData의 useApprReference이 false인 값들을 validate하기 위한 옵션 : GO-19338

                /**
                 * @selector Circle을 그릴 대상 엘리먼트
                 * @isAdmin user화면인지, admin화면인지를 결정한다. (API URL이 달라짐)
                 * @withCompanies company 선택 화면도 함께 노출할 것인지 여부
                 * @nodeTypes 써클이 활용 가능한 nodeType 목록을 지정한다. (부서, 사용자만 사용하도록 할 수 있고... 클래스(직위/직책/직급)만 사용하도록 강제할 수도 있다.)
                 * @circleJSON CircleModel의 json 데이터
                 */
                initialize: function (options) {
                    options = options || {};
                    if (options.selector) this.$el = $(options.selector); // 위험한 방식. 향후 element 를 넘겨주는 방식으로 변경하자.
                    this.id = options.id;
                    this.zIndex = options.zIndex;
                    this.isAdmin = (_.isBoolean(options.isAdmin)) ? options.isAdmin : true;
                    this.isWorksSetting = (_.isBoolean(options.isWorksSetting)) ? options.isWorksSetting : false;
                    this.withCompanies = (_.isBoolean(options.withCompanies)) ? options.withCompanies : false;
                    this.companyIds = (_.isArray(options.companyIds)) ? options.companyIds : [];
                    this.nodeTypes = (_.isArray(options.nodeTypes)) ? options.nodeTypes : NodeSelectorView.NODE_TYPES;
                    this.addCallback = (_.isFunction(options.addCallback)) ? options.addCallback : null;
                    this.changeCallback = (_.isFunction(options.changeCallback)) ? options.changeCallback : null;
                    this.removeCallback = (_.isFunction(options.removeCallback)) ? options.removeCallback : null;
                    this.useAction = (_.isBoolean(options.useAction)) ? options.useAction : false;
                    this.useApprReception = (_.isBoolean(options.useApprReception)) ? options.useApprReception : false;
                    this.useApprReference = (_.isBoolean(options.useApprReference)) ? options.useApprReference : false;
                    this.noSubDept = (_.isBoolean(options.noSubDept)) ? options.noSubDept : false;
                    this.companyCollectionType = _.isEmpty(options.companyCollectionType) ? "" : options.companyCollectionType;

                    // Circle Model 초기화
                    var data = (_.isObject(options.circleJSON)) ? options.circleJSON : {};
                    if (_.isEmpty(data.nodes)) {
                        data.nodes = [];
                    }
                    this.model = new CircleModel(data);

                    // observer 생성
                    var observer = _.extend({}, Backbone.Events);

                    // nodeList 초기화
                    this.nodeListView = new SelectedNodeListView({
                        collection: this.model.getNodeCollection(),
                        visibleCompanyName: this.withCompanies,
                        withoutSubDept: _.contains(this.nodeTypes, 'department-nosub') || this.noSubDept,
                        isAdmin: this.isAdmin,
                        isWorksSetting: this.isWorksSetting,
                        changeCallback: $.proxy(function () {
                            if (_.isFunction(this.changeCallback)) {
                                this.changeCallback(this.getData());
                            }
                        }, this),
                        addCallback: $.proxy(function () {
                            if (_.isFunction(this.addCallback)) {
                                this.addCallback(this.getData());
                            }
                            if (_.isFunction(this.changeCallback)) {
                                this.changeCallback(this.getData());
                            }
                        }, this),
                        removeCallback: $.proxy(function () {
                            if (_.isFunction(this.removeCallback)) {
                                this.removeCallback(this.getData());
                            }
                            if (_.isFunction(this.changeCallback)) {
                                this.changeCallback(this.getData());
                            }

                        }, this),
                        useAction: this.useAction
                    });

                    // nodePicker 초기화
                    this.nodePickerView = new NodeSelectorView({
                        isAdmin: this.isAdmin,
                        zIndex: this.zIndex,
                        useApprReception: this.useApprReception,
                        useApprReference: this.useApprReference,
                        observer: observer,
                        nodeTypes: _.map(this.nodeTypes, function (nodeType) {
                            return ('department-nosub' == nodeType) ? 'department' : nodeType;
                        }),
                        labelVisible: this.withCompanies,
                        callback: $.proxy(function (nodeModel) {
                            this.nodeListView.addNodeToList(nodeModel);
                            this.nodeListView.render();
                        }, this),
                        useAction: this.useAction
                    });

                    if (this.withCompanies) {
                        this.companyListView = new CompanyListView({
                            observer: observer,
                            ids: this.companyIds,
                            type: this.companyCollectionType
                        });
                    }
                },

                /**
                 * CircleView 렌더..
                 * @returns
                 */
                render: function () {
                    this.nodePickerView.render();
                    this.nodeListView.render();

                    if (this.withCompanies) {
                        this.companyListView.render();
                        this.$el.append(this.companyListView.$el);
                    }

                    this.$el.append(this.nodePickerView.$el);
                    this.$el.append(this.nodeListView.$el);
                    return this;
                },

                /**
                 * 현재 선택된 데이터를 CircleModel 형태로 반환 (json)
                 * @returns {CircleModel:JSON}
                 */
                getData: function () {
                    return {
                        nodes: this.nodeListView.getDataAsJSON()
                    };
                },

                /**
                 * 노출
                 */
                show: function () {
                    this.$el.show();
                },

                /**
                 * 숨김
                 */
                hide: function () {
                    this.$el.hide();
                },

                deleteAllData: function () {
                    this.nodeListView.deleteAllNodeFromList();
                },

                deleteDataOfCompany: function (companyId) {
                    this.nodeListView.deleteNodeOfCompany(companyId);
                }
            });

            return CircleView;
        });

})();
