// 문서목록에서 개별 문서에 대한 View
define([
        "jquery",
        "underscore",
        "backbone",
        "when",
        "app",
        "system/views/system_board_circle",
        "admin/collections/asset_share_list",
        'board/constants',
        "board/components/board_tree/board_tree",
        "system/collections/companies",
        "hgn!system/templates/asset_company_share_layer",
        "hgn!system/templates/asset_list",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!approval/nls/approval",
        "i18n!works/nls/works"
    ],
    function ($,
              _,
              Backbone,
              when,
              GO,
              CircleView,
              AssetShareListCollection,
              Constants,
              BoardTree,
              CompanyCollection,
              LayerTpl,
              AssetListTpl,
              commonLang,
              adminLang,
              approvalLang,
              worksLang) {

        var lang = {
            'save': commonLang['저장'],
            'cancel': commonLang['취소'],
            'share_range': adminLang['공개 범위'],
            'share_public': adminLang['공개'],
            'share_private': commonLang['비공개'],
            'no_data': worksLang['데이터가 없습니다']
        };

        var AssetListView = Backbone.View.extend({
            initialize: function (options) {
                this.options = options || {};
                this.collection = this.options.collection;
                if (_.isFunction(this.onClickAssetNodeCallBack)) {
                    this.onClickAssetNodeCallBack = options.onClickAssetNodeCallBack
                }
            },
            events: {
                "click .board_name": "_onClickAssetNode"
            },
            _onClickAssetNode: function (e) {
                console.debug('[asset] _onClickAssetNode call');
                // tree 구조이므로 이벤트가 위 노드로 전파될 수 있음에 주의
                e.stopImmediatePropagation();
                var $target = $(e.currentTarget);
                var assetId = $target.data('asset-id');
                var $node = $target.closest('li');
                this.onClickAssetNodeCallBack(this, e, assetId);
            },
            render: function () {
                this.$el.html(AssetListTpl({
                    dataSet: this.collection.toJSON(),
                    isEmpty: this.collection.length < 1,
                    lang: lang
                }));
            },

            onClickAssetNodeCallBack: function () {
                console.log('아무런 callBack함수가 없음');
            }
        });


        var ListLayoutView = Backbone.View.extend({

            el: ".layer_system_board .content",
            events: {
                'click input[name=share]:radio': 'onClickShareRadio',
                'change select#asset-company-list': 'onChangeCompanyList'
            },

            initialize: function (options) {
                this.options = options || {};
                this.companies = options.companies || new CompanyCollection();
                this.layer = options.layer;
                this.shareBoardList = options.shares;
                this.toSelectCompanyId = options.toSelectCompanyId;
                this.toSelectAssetId = options.toSelectAssetId;
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
                this.assetList = new AssetShareListCollection();
                this.assetList.setCompanyId(this.getSelectedCompanyId());
                this.listenTo(this.assetList, 'sync', this._renderAssetList);
                this.assetListView = null;
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
                var self = this;
                var collection = this.assetList;
                var viewOptions = {};
                this.initRender();
                this._fetchAndRenderAssetList();
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
                this.assetList.setCompanyId(nodeId);
                this._fetchAndRenderAssetList();
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
                this.circleView = new CircleView({
                    selector: '#partPublicWrap',
                    isAdmin: true,
                    useAction: false,
                    circleJSON: {
                        nodes: nodes ? nodes : []
                    },
                    withCompanies: true,
                    'nodeTypes': ['user', 'department', 'position', 'grade', 'duty', 'usergroup'],
                    'addCallback': $.proxy(circleChangeCallback, this),
                    companyIds: this.companies.pluck('id'),
                    noSubDept: false
                });
                this.circleView.render();
                this.$el.find('input[name=share]:radio:checked').trigger('click');
            },

            _fetchAndRenderAssetList: function () {
                var self = this;
                var collection = this.assetList;

                collection.fetch({
                    silent: true,
                    success: function (collection) {

                    }

                });
            },

            _renderAssetList: function () {
                var $noList = this.$el.find('.no-list-msg');
                var collection = this.assetList;
                if (this.assetListView !== null) {
                    this.assetListView.$el.empty();
                    this.assetListView = null;
                }
                this.assetListView = this._createAssetListView(collection);
                if (collection.length > 0) {
                    if (this.toSelectAssetId) {
                        this.assetListView.$el.find('span.board_name[data-asset-id="' + this.toSelectAssetId + '"]').trigger('click'); //딱 한번만 셋팅해준다.
                        this.toSelectAssetId = null;
                    } else {
                        this.assetListView.$el.find('span.board_name').eq(0).trigger('click');
                    }
                } else {
                    this.selectedBoardId = false;
                    this.circleView.hideOrgSlide();
                    this.initCircleView([]);
                }
                this.layer.reoffset();
            },

            _createAssetListView: function (collection) {
                var assetListView;
                var viewOptions = {};

                if (collection instanceof AssetShareListCollection) {
                    viewOptions.collection = collection;
                }
                viewOptions.onClickAssetNodeCallBack = $.proxy(this.onClickAssetNodeCallBack, this);

                assetListView = new AssetListView(viewOptions);
                assetListView.setElement(this.$el.find('#asset-tree-config'));
                assetListView.render();

                return assetListView;
            },

            onClickAssetNodeCallBack: function (nodeView, e, nodeId) {
                console.log('onClickAssetNodeCallBack call');
                this.assetListView.$el.find('div.item').removeClass('on');
                var highlightTarget = $(e.currentTarget).closest('div.item').addClass('on');
                this.selectedCompanyId = this.getSelectedCompanyId();
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