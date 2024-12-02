define('works/views/app/gantt_view/gantt_tree_config', function (require) {
    var GO = require('app');
    var _ = require("underscore");
    var Backbone = require('backbone');
    var Hogan = require('hogan');
    var when = require('when');
    var CONSTANTS = require('works/constants/works');

    var GanttListRowTpl = require("text!works/templates/app/gantt_view/gantt_list_row.html")

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var boardLang = require('i18n!board/nls/board');
    var contactLang = require("i18n!contact/nls/contact");
    var tplLang = {
        "modify": commonLang["수정"],
        "save": commonLang["저장"],
        "remove": commonLang["삭제"],
        "cancel": commonLang["취소"],
        "popup": commonLang["팝업보기"],
        "except": worksLang["데이터 제외"],
        "open": commonLang["열기"]
    };
    var STATUS_DEFAULT_COLOR = '0';

    return Backbone.View.extend({ //GanttTreeConfigView
        template: GanttListRowTpl,
        sortableState: false,
        events: {
            "click .btnSaveNode": "_onClickSaveNode",
            "click .btnEditNode": "_onClickEditNode",
            "click .btnRemoveNode": "_onClickNodeRemove",
            "click .btnCancelAddNode": "_onClickCancelAddNode",
            "click .btnCancelEditNode": "_onClickCancelEditNode",
            "click .btnToggleNode": "_onClickToggleNode",
            "click .btnDocPopup": "_onClickDocPopup",
            "click .node .title": "_onClickTitle",
            "click #add_doc": "_onClickAddDoc"
        },

        initialize: function (options) {
            this.options = options || {};
            this.appletId = this.options.appletId;
            this.fields = this.options.fields;
            this.isAdmin = this.options.isAdmin;
            this.ganttViewModel = this.options.ganttViewModel;
            this.queryString = this.options.queryString;

            this.sortableState = false;

            GO.EventEmitter.on("ganttTree", "refresh:dates", function (nodeToBeChanged) {
                this._changeNodeDates(nodeToBeChanged);
            }, this);
        },

        render: function () {
            this.exposingDocCount = 0;
            $.ajax({
                type: "GET",
                async: false,
                dataType: "json",
                url: GO.contextRoot + 'api/works/applets/' + this.appletId + '/ganttview/nodes',
                data: {
                    "q": _.isUndefined(this.queryString) ? "" : this.queryString
                },
                success: $.proxy(function (resp) {
                    var data = resp.data;
                    this.totalDocNodeCount = data.totalDocNodeCount;
                    this.ganttTreeRootNode = data.appletGanttNodeModel;
                    this.rootNodeId = this.ganttTreeRootNode.id;
                    this.rootNodeType = this.ganttTreeRootNode.nodeType;
                    this.ganttTreeNodes = this.ganttTreeRootNode.children;

                    this.renderEmptyMessageIfNoData();
                    if (this.ganttTreeNodes.length > 0) {
                        this._indicateTotalProgress(this.ganttTreeNodes);
                        this.$el.empty().addClass('board-tree-nodes');
                        this.appendNodesToParent(this.ganttTreeNodes, this.$el);
                        this.$el.find("li .item").last().addClass('last');
                    }
                    $("#exposingDocNodeCount").text(this.exposingDocCount);
                    $("#totalDocNodeCount").text(this.totalDocNodeCount);

                    if (this.sortableState) {
                        this.enableSortable();
                    }
                }, this),
                error: function (resp) {
                    $.goError(resp.responseJSON.message);
                }
            });
        },
        appendNodesToParent: function (nodes, $parentNode) {
            _.each(nodes, function (node) {
                if (this._isDocType(node.nodeType) && !node.appletDocModel) {
                    return;
                }
                var $currentNode = this.createNodeElement(node);
                if (this._isGroupType(node.nodeType)) {
                    $currentNode.append('<ul class="board-tree-nodes"></ul>');
                    this.appendNodesToParent(node.children, $currentNode.find('ul.board-tree-nodes'));
                } else {
                    this.exposingDocCount++;
                }
                $parentNode.append($currentNode);
            }, this);
        },

        _onClickSaveNode: function (e) {
            var $target = $(e.currentTarget);
            var $node = $target.closest('li');
            this._saveNode($node);
        },
        _onClickEditNode: function (e) {
            var $target = $(e.currentTarget);
            var $node = $target.closest('li');
            var nodeId = $node.data('id');
            var node = this._getNodeById(nodeId);
            this._toggleNodeTitleInput(node, $node, true);
        },
        _onClickNodeRemove: function (e) {
            var self = this;
            var $target = $(e.currentTarget);
            var $node = $target.closest('li.node');

            e.preventDefault();
            e.stopImmediatePropagation();

            var title = worksLang["간트 뷰에서 제거하시겠습니까?"];
            var message = worksLang["간트 뷰에서 제거되어도 리스트 뷰에서 확인할 수 있습니다."];
            var nodeType = "doc";
            var nodeId = $node.attr('doc-id');

            if ($target.closest('li').hasClass('folder')) {
                title = contactLang["그룹삭제"];
                message = commonLang["삭제하시겠습니까?"] + ' ' + worksLang["삭제하면 그룹 내 문서들이 그룹 밖으로 이동합니다."];
                nodeType = "group";
                nodeId = $node.data('id');
            }

            $.goConfirm(title, message,
                function () {
                    $.ajax({
                        type: "DELETE",
                        dataType: "json",
                        url: GO.contextRoot + "api/works/applets/" + self.appletId + "/ganttview/" + nodeType + '/' + nodeId,
                        success: function (resp) {
                            $node.remove();
                            self.renderEmptyMessageIfNoData();
                            $.goSlideMessage(commonLang['삭제되었습니다.']);
                            self._triggerChangeEvent();
                        },
                        error: function (resp) {
                            $.goError(resp.responseJSON.message);
                        }
                    });
                });
        },
        _onClickCancelAddNode: function (e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            var $node = $target.closest('li');
            $node.remove();
            this.renderEmptyMessageIfNoData();
        },
        _onClickCancelEditNode: function (e) {
            var $target = $(e.currentTarget);
            var $node = $target.closest('li');
            var nodeId = $node.data('id');
            var node = _.findWhere(this.ganttTreeNodes, {id: nodeId});

            e.preventDefault();
            this._toggleNodeTitleInput(node, $node);
        },
        _onClickToggleNode: function (e) {
            e.stopImmediatePropagation();

            var $target = $(e.currentTarget);
            var $node = $target.closest('li');
            if ($target.hasClass('ic_stair_open')) {
                this.unfoldNode($node);
            } else {
                this.foldNode($node);
            }
        },
        _onClickDocPopup: function (e) {
            var $target = $(e.currentTarget);
            var $node = $target.closest('li');
            window.open(GO.contextRoot + 'app/works/applet/' + this.appletId + '/doc/' + $node.attr('doc-id') + '/popup',
                "help", "width=1280,height=700,status=yes,scrollbars=yes,resizable=yes");
        },
        _onClickTitle: function (e) {
            var $target = $(e.currentTarget);
            var $node = $target.closest('li');
            GO.router.navigate('works/applet/' + this.appletId + '/doc/' + $node.attr('doc-id'), true);
        },
        _onClickAddDoc: function () {
            GO.router.navigate("works/applet/" + this.appletId + "/doc/new", true);
        },
        foldNode: function ($node) {
            $node.find('.board-tree-nodes:first').hide(); // 주의: 트리 구조이므로 반드시 첫번째 자식을 찾아야 한다.
            $node.find('.btnToggleNode:first').removeClass('ic_stair_close').addClass('ic_stair_open');

            $("div#gantt_graph").find("div[parent-id='" + $node.attr('data-id') + "']").hide();
        },
        unfoldNode: function ($node) {
            $node.find('.board-tree-nodes:first').show();
            $node.find('.btnToggleNode:first').removeClass('ic_stair_open').addClass('ic_stair_close');

            $("div#gantt_graph").find("div[parent-id='" + $node.attr('data-id') + "']").show();
        },
        foldAllNodes: function () {
            var self = this;
            this.$('li.folder').each(function () {
                var $el = $(this);
                self.foldNode($el);
            });
        },
        unfoldAllNodes: function () {
            var self = this;
            this.$('li.folder').each(function () {
                var $el = $(this);
                self.unfoldNode($el);
            });
        },
        _saveNode: function ($node) {
            var self = this;
            var nodeType = $node.data('type');
            var nodeId = $node.data('id');
            var nodeValue = $node.find('input:text').val();
            if (!$.goValidation.isCheckLength(2, 64, nodeValue)) {
                $.goSlideMessage(GO.i18n(boardLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "64"}));
                return false;
            }
            var promise;
            var isNew = false;
            if (nodeId) { // 그룹명 수정
                promise = when.promise(function (resolve, reject) {
                    $.ajax({
                        type: "PUT",
                        dataType: "json",
                        contentType: "application/json",
                        url: GO.contextRoot + "api/works/applets/" + self.appletId + "/ganttview/group/" + nodeId + "/rename",
                        data: JSON.stringify({str: nodeValue}),
                        success: function (resp) {
                            return resolve(resp);
                        },
                        error: function (resp) {
                            return reject(resp);
                        }
                    });
                });
            } else { // 그룹 추가
                isNew = true;
                var data = {
                    nodeType: nodeType,
                    groupName: nodeValue,
                    parentId: this.rootNodeId,
                    parentType: this.rootNodeType
                };
                promise = when.promise(function (resolve, reject) {
                    $.ajax({
                        type: "POST",
                        dataType: 'json',
                        contentType: "application/json",
                        url: GO.contextRoot + 'api/works/applets/' + self.appletId + '/ganttview/group',
                        data: JSON.stringify(data),
                        success: resolve,
                        error: function (e, response) {
                            return reject(response);
                        }
                    });
                });
            }

            return promise.then(function (resp) {
                if (isNew) {
                    self._triggerChangeEvent();
                    $.goSlideMessage(boardLang['그룹이 추가되었습니다']);
                } else {
                    var node = resp.data;
                    $node.attr('data-id', node.id);
                    var originNode = _.find(self.ganttTreeNodes, {id: node.id});
                    self._toggleNodeTitleInput(originNode, $node);
                    self._changeGroupName(node);
                    $.goSlideMessage(boardLang['그룹이 수정되었습니다']);
                }
                return when.resolve(node);
            }, function (resp) {
                $.goSlideMessage(commonLang['실패했습니다.']);
            });
        },
        _toggleNodeTitleInput: function (node, $node, isEditingMode) {
            var $editingNode = this.createNodeElement(node, {"isEditingMode": isEditingMode || false});
            $node.find('.item:first').replaceWith($editingNode.find('.item:first'));

            if (isEditingMode) {
                this.bindNodeEnterEvent($node);
            } else {
                $node.off('keyup');
            }
        },
        bindNodeEnterEvent: function ($node) {
            var self = this;
            $node.find('input:first').on('keyup', function (e) {
                var keycode = (e.keyCode ? e.keyCode : e.which);
                if (13 === parseInt(keycode)) {
                    self._saveNode($node);
                }
            });
        },
        _changeGroupName: function (node) {
            var li = this.$el.find('li[data-id=' + node.id + ']');
            $(li).find('.item .node-title .folder_name .txt').text(node.groupName);
            _.find(this.ganttTreeNodes, {id: node.id}).groupName = node.groupName;
        },
        _changeNodeDates: function (node) {
            var li = this.$el.find('li[doc-id=' + node.doc_id + ']');
            $(li).find('.item .startdate .txt').text(GO.util.shortDate(node.start));
            $(li).find('.item .enddate .txt').text(GO.util.shortDate(node.end));
        },
        _triggerChangeEvent: function () {
            GO.EventEmitter.trigger('ganttTree', 'refresh:listAndGraph');
        },
        _triggerRefreshGraphView: function () {
            GO.EventEmitter.trigger('ganttTree', 'refresh:graph');
        },

        enableSortable: function () {
            var newGroup = _.find(this.$el.find('li.node.folder'), function (el) {
                return _.isUndefined($(el).attr('data-id'));
            });
            if (!_.isUndefined(newGroup)) newGroup.remove();

            var self = this;
            this.$el.addClass('tb_stair_edit');
            this.$el.find('.ic_drag').attr('title', worksLang["해당 영역을 잡고 이동 시 순서를 변경할 수 있습니다."]);

            this.addSpaceAtNoChildGroup();
            bindSortable($("#gantt_list").find('.board-tree-nodes'));
            this.sortableState = true;

            function bindSortable($el) {
                $el.sortable({
                    items: 'li.node:not(.space)',
                    // handle: '.ic_drag',
                    scroll: true,
                    containment: "#gantt_list_config",
                    connectWith: '.board-tree-nodes',
                    tolerance: 'pointer',
                    axis: 'y',
                    helper: 'clone',
                    beforeStop: function (event, ui) {
                        var parent = $(ui.item).parents('li.node').get(0);
                        if (self._isGroupType($(ui.item).data('type')) && self._isGroupType($(parent).data('type'))) {
                            $.goSlideMessage(worksLang["그룹을 그룹 안으로 이동할 수 없습니다."]);
                            $(this).sortable('cancel');
                        }
                    },
                    stop: _updateNodeAfterSort,
                    receive: _updateNodeAfterSort
                });
            }

            function _updateNodeAfterSort(event, ui) {
                var $item = ui.item;
                var $nodes = $item.closest('.board-tree-nodes');
                if (!$nodes.is(this)) {
                    return;
                }
                var newSeq = $nodes.children('li.node').index($item); // 트리구조이므로 find 를 이용하면 안됨
                var itemSeq = $item.attr('seq');
                if (ui.sender == null && itemSeq == newSeq) { // 같은 위치로 이동
                    return;
                }
                if (parseInt(newSeq) != 0) {
                    var prevSeq = parseInt($item.prev().attr('seq'));
                    if (ui.sender == null && parseInt(itemSeq) < prevSeq) { //같은 group 내 이동 && 아래로 내릴 때
                        newSeq = prevSeq;
                    } else {
                        newSeq = prevSeq + 1;
                    }
                }
                var node = self._getNodeByElement($item);
                var nodeId = node ? node.id : null;
                var docId = $item.attr('doc-id');
                var parentNodeEl = $item.parents('li.node').get(0);
                var parentId = parentNodeEl ? self._getNodeIdByElement(parentNodeEl) : self.rootNodeId;

                self._moveNode(nodeId, docId, parentId, newSeq);
            }
        },
        _getNodeByElement: function (el) {
            var nodeId = this._getNodeIdByElement(el);
            if (!nodeId) {
                return;
            }
            return this._getNodeById(nodeId);
        },
        _getNodeIdByElement: function (el) {
            return $(el).data('id');
        },
        _getNodeById: function (nodeId, nodes) {
            var self = this;
            if (_.isUndefined(nodes)) {
                nodes = this.ganttTreeNodes;
            }
            var node = _.findWhere(nodes, {id: nodeId});
            if (node) {
                return node;
            } else {
                var groups = _.filter(nodes, function (node) {
                    return self._isGroupType(node.nodeType);
                });
                return this._getNodeFromGroup(nodeId, groups);
            }
        },
        _getNodeFromGroup: function (nodeId, groups) {
            var self = this;
            var returnNode = undefined;
            _.each(groups, function (group) {
                var node = self._getNodeById(nodeId, group.children);
                if (node) {
                    returnNode = node;
                    return node;
                }
            });
            return returnNode;
        },
        _moveNode: function (nodeId, docId, parentId, newSeq) {
            var self = this;
            $.ajax({
                type: "PUT",
                dataType: 'json',
                contentType: "application/json",
                url: GO.contextRoot + "api/works/applets/" + self.appletId + "/ganttview/node/move",
                data: JSON.stringify({
                    id: nodeId,
                    docId: docId,
                    newParentId: parentId,
                    newSequence: newSeq
                }),
                success: function (resp) {
                    self.renderEmptyMessageIfNoData();
                    $.goSlideMessage(boardLang['순서변경이 적용되었습니다']);
                    self.render();
                },
                error: function (resp) {
                    $.goError(resp.responseJSON.message);
                }
            });
        },

        destroySortable: function () {
            this.$el.removeClass('tb_stair_edit');
            $('.board-tree-nodes.ui-sortable').sortable('destroy');
            this.sortableState = false;
            this.removeSpaceAtNoChildGroup();
            this._triggerRefreshGraphView();
        },

        addSpaceAtNoChildGroup: function () {
            $(".board-tree-nodes:empty").addClass("ui-state-highlight")
                .append("<li class='space'>"
                    + "<span class='ic ic_board'></span>"
                    + "<span class='box_empty'></span>"
                    + "</li>");
        },

        removeSpaceAtNoChildGroup: function () {
            $(".board-tree-nodes.ui-state-highlight").removeClass("ui-state-highlight").empty();
        },

        renderEmptyMessageIfNoData: function () {
            if (_.isUndefined(this.ganttTreeNodes) || this.ganttTreeNodes.length == 0) {
                var emptyMsgTpl = "<li class='list empty-message'>"
                    + "<div class='item'>"
                    + "<span class='desc'>" + worksLang['데이터 등록으로 일정을 입력하면 그래프가 그려집니다.'] + "</span>"
                    + "</div>"
                    + "</li>";
                $("#gantt_list .summary").empty();
                this.$el.empty().addClass('null_data').html(emptyMsgTpl);
            }
            return $.Deferred().resolve();
        },

        createNodeElement: function (node, options) {
            return $(this._renderTemplate(this._getTemplateVars(node, options)));
        },
        _renderTemplate: function () {
            var compiled = Hogan.compile(_.result(this, 'template'));
            return compiled.render.apply(compiled, arguments);
        },
        _getTemplateVars: function (node, options) {
            var model = this.ganttViewModel;
            var isGroup = this._isGroupType(node.nodeType);
            var nodeValue = isGroup ? node.groupName : node.nodeValue;
            if (node.appletDocModel) {
                var docId = node.appletDocModel.id;
                var docValues = node.appletDocModel.values;
                var docStatus = node.appletDocModel.status;
                nodeValue = docValues[model.titleFieldCid];
                if (_.isUndefined(nodeValue)) {
                    nodeValue = '[' + commonLang['제목없음'] + ']';
                } else {
                    var titleField = this.fields.findByCid(model.titleFieldCid);
                    nodeValue = GO.util.htmlToText(titleField.getDisplayValue(new Backbone.Model(node.appletDocModel)));
                }
                var startdate = docValues[model.startFieldCid];
                var enddate = docValues[model.endFieldCid];
                var user = docValues[model.userFieldCid];
                var progress = docValues[model.progressFieldCid];
                var statusName = _.isUndefined(docStatus) ? "" : docStatus.name;
                var statusColor = _.isUndefined(docStatus) ? STATUS_DEFAULT_COLOR : docStatus.color;
            }
            if (isGroup) {
                var progress = node.progress;
            }
            var hasChildren = !_.isEmpty(node.children);
            return _.extend({
                "nodeId": node.id,
                "nodeType": node.nodeType,
                "seq": node.seq,
                "nodeValue": nodeValue,
                "docId": docId,
                "parentId": node.parentId,
                "isAdmin": this.isAdmin,
                "iconType": isGroup ? 'folder' : 'board',
                "isGroupNode": isGroup,
                "isDocNode": !isGroup,
                "startdate": GO.util.isInvalidValue(startdate) ? '-' : GO.util.shortDate(startdate),
                "enddate": GO.util.isInvalidValue(enddate) ? '-' : GO.util.shortDate(enddate),
                "user": getUserName(user),
                "progress": GO.util.isInvalidValue(progress) ? '-' : (progress + "%"),
                "hasChildren": hasChildren,
                "childrenCount": hasChildren ? node.children.length : 0,
                "statusName": statusName,
                "statusColor": statusColor,
                "isNew": _.isUndefined(node.id)
            }, options || {lang: tplLang});

            function getUserName(user) {
                if (_.isEmpty(user)) {
                    return '-';
                }
                if (Array.isArray(user)) {
                    if (user.length > 1) {
                        return user[0].fullName + " " + worksLang['외'] + (user.length - 1);
                    }
                    return user[0].fullName;
                }
                return user.fullName;
            }
        },
        _indicateTotalProgress: function (nodes) {
            if (!nodes || nodes.length == 0) {
                return;
            }
            var progressOpts = this._calculateProgress(nodes, 0);
            var progressAvg = progressOpts.progress / progressOpts.count;
            var progressRate = Math.round(progressAvg * 100) / 100;
            $('#ganttTotalProgress').text(progressRate + '%');
        },
        _calculateProgress: function (nodes, depth) {
            var progressOpts = {
                progress: 0,
                count: 0
            };
            var progressField = this.ganttViewModel.progressFieldCid;
            _.each(nodes, function (node) {
                if (node.nodeType)
                    if (this._isGroupType(node.nodeType) && node.children.length > 0) {
                        var childrenProgressOpts = this._calculateProgress(node.children, depth + 1);
                        progressOpts.progress += childrenProgressOpts.progress;
                        progressOpts.count += childrenProgressOpts.count;

                        var progressAvg = childrenProgressOpts.progress / childrenProgressOpts.count;
                        var progressRate = Math.round(progressAvg * 100) / 100;
                        node.progress = isNaN(progressRate) ? 0 : progressRate;
                    } else if (!this._isGroupType(node.nodeType)) {
                        var nodeProgress = node.appletDocModel.values[progressField];
                        if (nodeProgress) {
                            progressOpts.progress += GO.util.isInvalidValue(nodeProgress) ? 0 : nodeProgress;
                            progressOpts.count++;
                        }
                    }
            }, this);
            if (progressOpts.count == 0) {
                progressOpts.count = 1;
            }
            return progressOpts;
        },
        _isGroupType: function (type) {
            return type === CONSTANTS.GANTT_NODE_TYPE.GROUP;
        },
        _isDocType: function (type) {
            return type === CONSTANTS.GANTT_NODE_TYPE.DOC;
        }
    });
});
