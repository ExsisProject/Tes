define('works/views/app/gantt_view/gantt_list_view', function (require) {
    var GO = require('app');
    var Backbone = require('backbone');

    var GanttTreeConfigView = require("works/views/app/gantt_view/gantt_tree_config");

    var GanttListViewTemplate = require("hgn!works/templates/app/gantt_view/gantt_list_view")

    var CONSTANTS = require('works/constants/works');
    var commonLang = require("i18n!nls/commons");
    var boardLang = require("i18n!board/nls/board");
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        제목: commonLang["제목"],
        시작날짜: worksLang["시작 날짜"],
        종료날짜: worksLang["종료 날짜"],
        담당자: worksLang["담당자"],
        진행률: worksLang["진행률"],
        진행률설명: worksLang["간트뷰 진행률 설명"],
        최대노출개수툴팁: GO.i18n(worksLang["간트 뷰에서 볼 수 있는 데이터의 개수는 최대 {{arg0}}개 입니다."], {arg0: CONSTANTS.GANTT_VIEW_DOC_NODE_MAX_COUNT}),
        데이터불러오기툴팁: GO.i18n(worksLang["{{arg0}}개가 넘을 경우, 목록에서 일부 데이터를 제외 후 [데이터 불러오기]를 통해 추가해 주세요."], {arg0: CONSTANTS.GANTT_VIEW_DOC_NODE_MAX_COUNT}),
        전체진행률툴팁: worksLang["전체 진행률은 필터를 사용하거나 사용자 권한 설정에 의해 다르게 보일 수 있습니다."]
    };

    return Backbone.View.extend({ //GanttListView
        el: '#gantt_list',
        initialize: function (options) {
            this.options = options || {};
            this.appletId = options.appletId;
            this.isAdmin = this.options.isAdmin;
            this.fields = this.options.fields;
            this.ganttViewModel = this.options.ganttViewModel;
            this.queryString = this.options.queryString;
        },

        render: function () {
            this.$el.empty().html(GanttListViewTemplate({
                lang: lang,
                hasRequiredFields: this.ganttViewModel.hasRequiredFields(),
                name: this.ganttViewModel.get('name'),
                isAdmin: this.isAdmin
            }));
            this._renderGanttTreeConfigView();
        },

        _renderGanttTreeConfigView: function () {
            this.ganttTreeConfigView = new GanttTreeConfigView({
                appletId: this.appletId,
                fields: this.fields,
                isAdmin: this.isAdmin,
                ganttViewModel: this.ganttViewModel.toJSON(),
                queryString: this.queryString
            });
            this.ganttTreeConfigView.setElement(this.$el.find('#gantt_list_config'));
            if (!this.ganttViewModel.hasRequiredFields()) {
                this.ganttTreeConfigView.renderEmptyMessageIfNoData();
                return;
            }
            this.ganttTreeConfigView.render();
        },

        onClickAddGroup: function () {
            var $node = this.ganttTreeConfigView.createNodeElement({
                "nodeType": "GROUP",
                "groupName": boardLang['새로운 그룹명을 입력해주세요']
            }, {"isEditingMode": true});
            this.$el.find('.empty-message').remove();
            this.ganttTreeConfigView.$el.append($node);
            $node.find('input')[0].focus({preventScroll: false});
            this.ganttTreeConfigView.bindNodeEnterEvent($node);
        },
        onClickToggleNodes: function (e) {
            e.preventDefault();
            if (this.ganttTreeConfigView === null) {
                return;
            }

            var $target = $(e.currentTarget);
            var currentState = $target.attr('data-state'); // $target.data 로 가지고 오면 안됨
            if (currentState === 'opened') {
                this.ganttTreeConfigView.foldAllNodes();
                $target.attr('data-state', 'closed');
                $target.find('.txt').text(boardLang["모두 열기"]);
            } else {
                this.ganttTreeConfigView.unfoldAllNodes();
                $target.attr('data-state', 'opened');
                $target.find('.txt').text(boardLang["모두 닫기"]);
            }
        },

        onClickSortableToggle: function (e) {
            e.preventDefault();
            if (this._isSortableMode()) {
                this._destroyNodeSortable();
            } else {
                this._enableNodeSortable();
            }
        },
        _enableNodeSortable: function () {
            if (!this.ganttTreeConfigView) {
                return;
            }
            $(".btnGroupAdd").hide();
            $(".btnBringDocNodes").hide();
            this.$el.find(".btnEditNode").hide();
            this.$el.find(".btnRemoveNode").hide();

            this.ganttTreeConfigView.enableSortable();
            this.$el.find('#gantt_list_config .tb-header').addClass('tb_stair_edit');
            this._changeSortButtonText(commonLang['순서바꾸기 완료']);
            this._toggleSortButtonClass();
            this._addEditClassForBlur();
        },
        _destroyNodeSortable: function () {
            if (!this.ganttTreeConfigView) {
                return;
            }
            $(".btnGroupAdd").show();
            $(".btnBringDocNodes").show();
            this.$el.find(".btnEditNode").show();
            this.$el.find(".btnRemoveNode").show();

            this.ganttTreeConfigView.destroySortable();
            this.$el.find('#gantt_list_config .tb-header').removeClass('tb_stair_edit');
            this._changeSortButtonText(commonLang['순서바꾸기']);
            this._toggleSortButtonClass();
            this._removeEditClassForBlur();
        },
        _isSortableMode: function () {
            return this.$('#gantt_list_config').hasClass('tb_stair_edit');
        },
        _changeSortButtonText: function (text) {
            $('.btnSortable span.txt').html(text);
        },
        _toggleSortButtonClass: function () {
            $('.btnSortable').toggleClass("active");
        },
        _addEditClassForBlur: function () {
            this.$el.addClass('edit');
            $("#gantt_graph .ganttview").addClass('edit');
        },
        _removeEditClassForBlur: function () {
            this.$el.removeClass('edit');
            $("#gantt_graph .ganttview").removeClass('edit');
        }
    });
});