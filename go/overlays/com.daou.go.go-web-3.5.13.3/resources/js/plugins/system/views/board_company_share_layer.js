define("system/views/board_company_share_layer", function (require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var when = require("when");
    var CircleView = require("system/views/system_board_circle");
    var Constants = require("board/constants");
    var BoardTree = require("board/components/board_tree/board_tree");
    var CompanyBoardTreeNode = require("board/models/system_board_tree_node");
    var CompanyCollection = require("system/collections/companies");
    var LayerTpl = require("hgn!system/templates/board_company_share_layer");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    var lang = {
        'save': commonLang['저장'],
        'cancel': commonLang['취소'],
        'share_range': adminLang['공개 범위'],
        'share_public': adminLang['공개'],
        'share_private': commonLang['비공개'],
    };

    var ListLayoutView = Backbone.View.extend({

        el: ".layer_system_board .content",
        events: {
            'click input[name=share]:radio': 'onClickShareRadio',
            'change select#board-company-list': 'onChangeCompanyList'
        },

        initialize: function (options) {
            this.options = options || {};
            this.companies = options.companies || new CompanyCollection();
            this.layer = options.layer;
            this.shareBoardList = options.shares;
            this.toSelectCompanyId = options.toSelectCompanyId;
            this.toSelectBoardId = options.toSelectBoardId;
            this.companies.each(function (company) {
                company.set('selected', false);
            }, this);

            if (this.toSelectCompanyId) {
                this.companies.each(function (company) {
                    if (company['id'] == this.toSelectCompanyId) {
                        company.set('selected', true);
                    }
                }, this);
            } else {
                if (this.companies.length > 0) {
                    this.companies.first().set('selected', true);
                }
            }
            this.activeBoardList = new CompanyBoardTreeNode.Collection(null, {
                companyId: this.getSelectedCompanyId(),
                status: Constants.STATUS_ACTIVE,
                isAdminService: true
            });
            this.listenTo(this.activeBoardList, 'sync', this._renderActiveBoardList);
            this.boardTreeConfigView = null;
        },

        getSelectedCompanyId: function () {
            return this.companies.findWhere({selected: true}).get('id');
        },

        getSelectedBoardId: function () {
            if (!this.selectedBoardId) {
                return false;
            }
            return this.selectedBoardId;
        },

        render: function () {
            this.initRender();
            this._fetchAndRenderActiveBoardList();
        },

        onClickShareRadio: function (e) {
            var radioVal = this.$el.find('input[name=share]:radio:checked').val();
            if (radioVal == "public") {
                this.circleView.nodePickerView.$el.hide();
                this.circleView.companyListView.$el.find('span[data-type="add"]').show();
                this.circleView.companyListView.$el.find('#publicWritableAuthWrap').show();
            } else {
                this.circleView.nodePickerView.$el.show();
                this.circleView.companyListView.$el.find('span[data-type="add"]').hide();
                this.circleView.companyListView.$el.find('#publicWritableAuthWrap').hide();
            }
        },

        getData: function () {
            var circleViewData = this.circleView.getData();
            var circles = [];
            var nodes = circleViewData['nodes'] || [];
            _.each(nodes, function (node) {
                node['actions'] = _.isArray(node['actions']) ? node['actions'].join(',') : node['actions'];
                node['nodeCompanyId'] = parseInt(node['nodeCompanyId']);
            }, this);
            var uniqCompanyIds = _.uniq(_.pluck(nodes, 'nodeCompanyId'));
            _.each(uniqCompanyIds, function (id) {
                var circle = {};
                circle['companyId'] = id;
                circle['nodes'] = _.where(nodes, {
                    nodeCompanyId: id
                });
                circles.push(circle);
            }, this);
            var data = {
                shares: circles,
                id: this.getSelectedBoardId(),
            }
            return data;
        },

        onChangeCompanyList: function (e) {
            var nodeId = $(e.currentTarget).find('option:selected').val();
            this.companies.each(function (company) {
                if (company.get('id') == nodeId) {
                    company.set('selected', true);
                } else {
                    company.set('selected', false);
                }
            }, this);
            this.activeBoardList.setCompanyId(nodeId);
            this._fetchAndRenderActiveBoardList();
        },

        initRender: function () {
            this.$el.html(LayerTpl({
                companies: this.companies.toJSON(),
                lang: lang
            }));
            this.initCircleView();
        },

        initCircleView: function (nodes) {
            this.circleView = null;
            this.$('#partPublicWrap').empty();
            var circleChangeCallback = function (data) {

            };
            var thisBoardCompanyId = this.$el.find('#board-company-list option:selected').val();
            this.circleView = new CircleView({
                selector: '#partPublicWrap',
                isAdmin: true,
                isWriter: true,
                useAction: true,
                circleJSON: {
                    nodes: nodes ? nodes : []
                },
                withCompanies: true,
                'nodeTypes': ['user', 'department', 'position', 'grade', 'duty', 'usergroup'],
                'addCallback': $.proxy(circleChangeCallback, this),
                companyIds: $.grep(this.companies.pluck('id'), function(value){return value!=thisBoardCompanyId}),
                noSubDept: false
            });
            this.circleView.render();
            this.$el.find('input[name=share]:radio:checked').trigger('click');
        },

        _convertBoardsAction: function (boardTreeNodes) {
            boardTreeNodes.map(function (boardTreeNode) {
                if (boardTreeNode.isBoardNode()) {
                    boardTreeNode.set('actions', {
                        "managable": true
                    });
                }
            });

            return boardTreeNodes;
        },

        _fetchAndRenderActiveBoardList: function () {
            var collection = this.activeBoardList;

            collection.fetch({
                silent: true,
                success: function (collection) {

                }

            });
        },

        _renderActiveBoardList: function () {
            var collection = this.activeBoardList;
            if (this.boardTreeConfigView !== null) {
                this.boardTreeConfigView.$el.empty();
                this.boardTreeConfigView = null;
            }
            this.boardTreeConfigView = this._createBoardTreeConfigView(collection);
            if (collection.length > 0) {
                if (this.toSelectBoardId) {
                    this.boardTreeConfigView.$el.find('span.board_name[data-board-id="' + this.toSelectBoardId + '"]').trigger('click'); //딱 한번만 셋팅해준다.
                    this.toSelectBoardId = null;
                } else {
                    this.boardTreeConfigView.$el.find('span.board_name').eq(0).trigger('click');
                }
            } else {
                this.selectedBoardId = false;
                this.circleView.hideOrgSlide();
                this.initCircleView([]);
            }
            this.layer.reoffset();
        },

        _createBoardTreeConfigView: function (collection) {
            var boardTreeConfigView;
            var viewOptions = {};

            if (collection instanceof CompanyBoardTreeNode.Collection) {
                viewOptions.nodes = this._convertBoardsAction(collection);
            }
            viewOptions.onClickBoardNodeCallBack = $.proxy(this.onClickBoardNodeCallBack, this);

            boardTreeConfigView = new BoardTree.BoardTreeSimpleView(viewOptions);
            boardTreeConfigView.setElement(this.$el.find('#board-tree-config'));
            boardTreeConfigView.render();

            return boardTreeConfigView;
        },

        onClickBoardNodeCallBack: function (nodeView, e, nodeId) {
            console.log('onClickBoardNodeCallBack call');
            this.boardTreeConfigView.$el.find('div.item').removeClass('on');
            $(e.currentTarget).closest('div.item').addClass('on');
            this.selectedBoardId = nodeId;
            this.circleView.hideOrgSlide();
            var nodes = [];
            this.shareBoardList.each(function (m) {
                if (m.get('id') == this.selectedBoardId) {
                    _.each(m.get('shares'), function (share) {
                        _.each(share.nodes, function (node) {
                            if (node.nodeType === 'company') {
                                node['nodeValue'] = "";
                            }
                            nodes.push(node);
                        });
                    });
                }
            }, this);
            this.initCircleView(nodes);

        }

    });

    return ListLayoutView;
});