define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var when = require("when");
    var App = require("app");

    var CompanyBoardCollection = require("admin/collections/company_board");
    var CompanyBoardShareModel = require("system/models/board_share_model");
    var CompanyBoardShareCollection = require("system/collections/company_borad_shares");
    var BoardCompanyShareLayer = require("system/views/board_company_share_layer");

    // 트리형 게시판 지원
    var BoardTree = require('board/components/board_tree/board_tree');
    var CompanyBoardTreeNode = require("board/models/company_board_tree_node");
    var Constants = require('board/constants');

    var TplCompanyBoardShare = require("hgn!system/templates/board_company_share");
    var CompanyCollection = require("system/collections/companies");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var boardLang = require("i18n!board/nls/board");
    var worksLang = require("i18n!works/nls/works");

    require("jquery.go-sdk");
    require("GO.util");
    require("jquery.go-popup");

    var lang = {
        'company_board_add': commonLang['추가'],
        'board_save': commonLang['저장'],
        'board_cancel': commonLang['취소'],
        'board_modify': commonLang['수정'],
        'board_delete': commonLang['삭제'],
        'board_stop': commonLang['중지'],
        'board_normal': commonLang['정상 상태로 변경'],
        'board_exposure': adminLang['게시판 홈 노출'],
        'closed_board': adminLang['중지된 게시판'],
        'not_selected_board': boardLang["게시판을 선택해 주세요."],
        'stop_confirm': boardLang["게시판 중지 확인"],
        'stop_board': boardLang["게시판 중지"],
        'delete_confirm': boardLang["게시판 삭제 확인"],
        'delete_title': boardLang["게시판 삭제"],
        'delete_success': commonLang["삭제되었습니다."],
        'board_title': adminLang['전사 게시판 명'],
        'share_site': adminLang['공유된 사이트'],
        'board_no_list': worksLang['데이터가 없습니다']

    };

    var instance = null;

    /**
     * 중복 액션을 막기 위함
     */
    var _depFlag = false;

    var BoardCompanyShareView = Backbone.View.extend({
        el: '#companyGroupShareContent',
        events: {
            'click span[data-btntype="add"]': 'popShareLayer',
            'click span[data-btntype="delete"]': 'onDelete',
            'click #checkedShareAll': 'checkedAll',
            'click td.b_name span': 'popShareLayerByTitleClick'
        },
        initialize: function (options) {
            this.options = options || {};
            this.companyGroupId = this.options.companyGroupId;
            this.companies = this.options.companies || new CompanyCollection(); //이때 넘겨오는 companies는 siteGroup에 묶여있는 companies.화면에서 받아옴
            this.shares = new CompanyBoardShareCollection(this.companyGroupId);
        },

        render: function (status) {
            var self = this;
            console.log('[board] BoardCompanyShareView:render call');
            this.shares.fetch({
                success: function () {
                    self._initRender(status);
                    return self;
                },
            });
        },

        _initRender: function (status) {
            if (status === Constants.STATUS_ACTIVE) {
                var tmpl = TplCompanyBoardShare({
                    isActive: true,
                    lang: lang,
                    isActiveBoard: true,
                    dataset: this.makeTemplateData(this.shares.toJSON())
                });
                this.$el.html(tmpl);
            }
        },

        makeTemplateData: function (dataSet) {
            var _this = this;
            return _.map(dataSet, function (data) {
                var share = data['share'] || {};
                var sharedTargets = [];
                _.each(data.shares, function (share) {
                    _.each(share.nodes, function (node) {
                        sharedTargets.push({
                            name: node.nodeValue,
                            companyName: node.nodeCompanyName,
                            action: _this.getActionName(node.actions)
                        });
                    });
                });
                return {
                    id: data['id'],
                    share: share,
                    companyId: data['companyId'],
                    boardName: data['companyName'] + ' > ' + data['name'],
                    sharedTargets: sharedTargets
                    // shareSiteName : [share['nodeValue'], ' - ', share['nodeCompanyName'], '[', _this.getActionName(share['actions']), ']'].join("")
                }
            });
        },

        getActionName: function (actions) {
            var ACTION = {
                READABLE: 'read',
                WRITABLE: 'write',
                REMOVABLE: 'remove',
                MANAGABLE: 'manage'
            }

            var actionsName = [];
            if (actions.indexOf(ACTION.READABLE) >= 0) {
                actionsName.push(adminLang["읽기"]);
            }

            if (actions.indexOf(ACTION.WRITABLE) >= 0) {
                actionsName.push(adminLang["쓰기"]);
            }

            return actionsName.join("/");

        },

        popShareLayer: function (e, toSelectObj) {
            if (this.companies.length < 1) {
                $.goMessage(adminLang['1개 이상의 매칭 사이트를 선택해주세요.']);
                return false;
            }
            this.layer = $.goPopup({
                header: adminLang['전사 게시판 공유 설정'],
                'pclass': 'layer_normal layer_system_board layer_share',
                width: 800,
                'modal': false,
                'allowPrevPopup': false,
                'forceClosePopup': false,
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    autoclose: false,
                    callback: $.proxy(this.saveShareBoard, this)
                }, {
                    btext: commonLang["취소"]
                }],
                contents: ""
            });
            var opts = {
                companies: this.companies,
                shares: this.shares, //공유된 게시판 리스트를 layer에 넘긴다
                layer: this.layer
            };
            if (toSelectObj) {
                opts['toSelectCompanyId'] = toSelectObj['companyId'];
                opts['toSelectBoardId'] = toSelectObj['boardId'];
            }
            this.boardCompanyShareLayer = null;
            this.boardCompanyShareLayer = new BoardCompanyShareLayer(opts);
            this.boardCompanyShareLayer.render();
        },

        popShareLayerByTitleClick: function (e) {
            var companyId = $(e.currentTarget).closest('tr').find('input:checkbox').attr('data-boardcompanyid');
            var boardId = $(e.currentTarget).closest('tr').find('input:checkbox').attr('data-boardid');
            this.popShareLayer(e, {companyId: companyId, boardId: boardId});
        },

        checkedAll: function (e) {
            this.$el.find('#tableBorderList tbody input:checkbox').prop('checked', $(e.currentTarget).is(':checked'));
        },

        onDelete: function (e) {
            var self = this;
            var els = this.$el.find('#tableBorderList tbody input:checkbox:checked');
            if (els.length < 1) {
                $.goError(commonLang['선택된 항목이 없습니다.']);
                return false;
            }
            var datas = [];
            var sharesData = self.shares.toJSON();
            $(els).each(function (idx, el) {
                var targetModel = _.findWhere(sharesData, {
                    id: parseInt($(el).val())
                });
                datas.push(targetModel);
            });
            var url = GO.contextRoot + 'ad/api/system/companygroup/' + this.companyGroupId + '/board/shares';
            $.ajax(url, {
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify(datas),
                success: function () {
                    $.goMessage(commonLang['저장되었습니다.']);
                    self.render('ACTIVE');
                },
                error: function (resp) {
                    $.goError(commonLang["실패했습니다."]);
                }
            });

        },

        saveShareBoard: function () {
            var self = this;
            var data = this.boardCompanyShareLayer.getData();
            if (!this.validateData(data)) {
                return false;
            }

            var model = new CompanyBoardShareModel(this.companyGroupId);
            model.set(data);
            model.save({}, {
                type: 'POST',
                success: function (model, response) {
                    $.goMessage(commonLang['저장되었습니다.']);
                    self.render('ACTIVE');
                    if (self.layer) {
                        self.layer.close();
                    }
                },
                error: function (model, response) {
                    var result = JSON.parse(response.responseText);
                    $.goMessage(result.message);
                },
                complete: $.proxy(function () {
                }, this)
            });
        },

        validateData: function (data) {
            if (!data['id']) {
                $.goError(commonLang['선택된 항목이 없습니다.']);
                return false;
            }
            return true;
        },

        _renderClosedBoardList: function (status) {
            var _this = this;

            var bbsType = function () {
                if (this.type == "CLASSIC") {
                    return lang.board_BBS;
                }
                return lang.board_STREAM;
            };
            var parseDate = function () {
                return GO.util.basicDate(this.createdAt);
            };
            var sharedRange = function () {
                if (!this.sharedFlag) {
                    return lang.board_public;
                }
                return lang.board_private;
            };

            var dataset = this.closedBoardList.toJSON();

            var tmpl = TplCompanyBoard({
                dataset: dataset,
                bbsType: bbsType,
                parseDate: parseDate,
                sharedRange: sharedRange,
                isActive: false,
                lang: lang,
                isActiveBoard: false
            });
            this.$el.html(tmpl);
            this.listEl = this.$el.find('#tableBorderList');
            this.$el.find('#tableBorderList tr:last-child').addClass('last');
        },

        _fetchAndRenderClosedBoardList: function () {
            var self = this;
            var collection = this.closedBoardList;

            return when.promise(function (resolve, reject) {
                collection.fetch({
                    silent: true,
                    success: function (collection) {
                        resolve(collection);
                    },

                    error: reject
                });
            }).otherwise(function (error) {
                console.log(error.stack);
            });
        },

        _renderActiveBoardList: function () {
            var boardTreeConfigView;
            var $noList = this.$el.find('.no-list-msg');
            var collection = this.activeBoardList;

            return this._getBoardTreeConfigView(collection);
        },

        _fetchAndRenderActiveBoardList: function () {
            var self = this;
            var collection = this.activeBoardList;

            return when.promise(function (resolve, reject) {
                collection.fetch({
                    silent: true,
                    success: function (collection) {
                        resolve(collection);
                    },

                    error: reject
                });
            }).otherwise(function (error) {
                console.log(error);
            });
        },

        /**
         * 체크된 체크박스의 게시판 ID를 배열로 반환
         */
        _getCheckedBoardIds: function () {
            var ids = [];
            this.$('input:checkbox[name=board_id]:checked').each(function (i, el) {
                ids.push($(el).val());
            });

            return ids;
        },

        _createBoardTreeConfigView: function (collection) {
            var boardTreeConfigView;
            var viewOptions = {};

            if (collection instanceof CompanyBoardTreeNode.Collection) {
                viewOptions.nodes = this._convertBoardsAction(collection);
            }

            boardTreeConfigView = new BoardTree.BoardTreeSimpleView(viewOptions);
            boardTreeConfigView.setElement(this.$el.find('#board-tree-config'));
            boardTreeConfigView.render();

            return boardTreeConfigView;
        },

        _getBoardTreeConfigView: function (collection) {
            if (this.boardTreeConfigView === null) {
                this.boardTreeConfigView = this._createBoardTreeConfigView(collection);
            }

            return this.boardTreeConfigView;
        },

        /**
         * 사이트 관리자에 들어올 수 있는 관리자는 누구나 게시판 설정을 할수 있다.
         */
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

        /**
         * 게시판 그룹 추가
         */
        _addFolder: function () {
            var boardTreeConfigView = this._getBoardTreeConfigView(this.activeBoardList);

            boardTreeConfigView.addNode(new CompanyBoardTreeNode.Model({
                "nodeType": Constants.NODETYPE_FOLDER,
                "nodeValue": boardLang['새로운 그룹명을 입력해주세요']
            }, {isAdminService: true}));
        },

        /**
         * 구분선 추가
         */
        _addSeperator: function () {
            var boardTreeConfigView = this._getBoardTreeConfigView(this.activeBoardList);
            boardTreeConfigView.addNode(new CompanyBoardTreeNode.Model({
                "nodeType": Constants.NODETYPE_SEPERATOR,
                "nodeValue": boardLang['새로운 구분선명을 입력해주세요']
            }, {isAdminService: true}));
        },

        /**
         * 전체 선택 체크박스 클릭 이벤트 핸들러
         */
        _onClickCheckAll: function (e) {
            this.$("input:checkbox[name=board_id]").attr('checked', $(e.currentTarget).is(':checked'));
        },

        _onClickToggleNodes: function (e) {
            var $target = $(e.currentTarget);
            // $target.data로 가지고 오면 안됨
            var currentState = $target.attr('data-state');

            e.preventDefault();

            if (this.boardTreeConfigView === null) {
                return;
            }

            if (currentState === 'opened') {
                this.boardTreeConfigView.foldAllNodes();
                $target.attr('data-state', 'closed');
                $target.text(lang.open_all);
            } else {
                this.boardTreeConfigView.unfoldAllNodes();
                $target.attr('data-state', 'opened');
                $target.text(lang.close_all);
            }
        },

        /**
         * 게시판 순서변경 버튼 클릭 이벤트 핸들러
         */
        _onClickSortableToggle: function (e) {
            var self = this;
            var $target = $(e.currentTarget);

            e.preventDefault();

            if (this._isSortableMode()) {
                this._distroyNodeSortable();
            } else {
                this._enableNodeSortable();
            }
        },


        /**
         * 순서바꾸기 모드 전환
         */
        _enableNodeSortable: function () {
            if (!this.boardTreeConfigView) {
                return;
            }

            $(".btnBoardAdd").hide();
            $(".btnBoardGroupAdd").hide();
            $(".btnBoardLineAdd").hide();
            $(".btnBoardStop").hide();
            $(".btnBoardDelete").hide();

            this.boardTreeConfigView.enableSortable();
            this.$('.tb-header').addClass('tb_stair_edit');
            this._changeSortButtonText(lang.board_sort_done);
        },

        /**
         * 순서바꾸기 모드 해제
         */
        _distroyNodeSortable: function () {
            if (!this.boardTreeConfigView) {
                return;
            }

            $(".btnBoardAdd").show();
            $(".btnBoardGroupAdd").show();
            $(".btnBoardLineAdd").show();
            $(".btnBoardStop").show();
            $(".btnBoardDelete").show();

            this.boardTreeConfigView.destroySortable();
            this.$('.tb-header').removeClass('tb_stair_edit');
            this._changeSortButtonText(lang.board_sort);
        },

        /**
         * 순서바꾸기 모드인가 체크
         */
        _isSortableMode: function () {
            return this.$('#board-tree-config').hasClass('tb_stair_edit');
        },

        /**
         * 순서바꾸기 버튼 텍스트 변경
         */
        _changeSortButtonText: function (text) {
            $('.btnBoardSortable').html(text);
        },

        /**
         * 게시판 중지 버튼 클릭 이벤트 핸들러
         */
        _onClickBoardStop: function (e) {
            var ids = this._getCheckedBoardIds();
            var self = this;

            e.preventDefault();

            if (_depFlag === true) {
                $.goSlideMessage(commonLang['잠시만 기다려주세요']);
                return;
            }

            if (ids.length == 0) {
                $.goMessage(lang.not_selected_board);
                return;
            }

            $.goConfirm(lang.stop_board, lang.stop_confirm, function () {
                $.ajax({
                    type: 'PUT',
                    async: true,
                    data: JSON.stringify({ids: ids}),
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'ad/api/board/status/closed'
                }).done(function (response) {
                    $.goMessage(lang.change_success);
                    self.render(self.type);
                }).complete(function () {
                    _depFlag = false;
                });
            });
        },

        _onClickBoardDelete: function (e) {
            var ids = this._getCheckedBoardIds();
            var self = this;

            e.preventDefault();

            if (_depFlag === true) {
                $.goSlideMessage(commonLang['잠시만 기다려주세요']);
                return;
            }

            if (ids.length == 0) {
                $.goMessage(lang.not_selected_board);
                return;
            }

            $.goConfirm(lang.delete_title, lang.delete_confirm, function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    data: JSON.stringify({ids: ids}),
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'ad/api/board/status/deleted'
                }).done(function (response) {
                    $.goMessage(lang.delete_success);
                    self.render(self.type);
                }).complete(function () {
                    _depFlag = false;
                });
            });
        },

        // 사용중인 게시판 탭을 제외한 나머지 부분에서 사용되고 있는 함수들임
        /**
         * 중지된 게시판에서 사용되는 체크박스 전체 선택
         */
        checkAllToggle: function (e) {
            var currentEl = $(e.currentTarget);

            if (currentEl.is(":checked")) {
                this.$el.find("#tableBorderList input:checkbox").attr("checked", "checked");
            } else {
                this.$el.find("#tableBorderList input:checkbox").attr("checked", null);
            }
            ;
        },

        changeStatusNormal: function () {
            var ids = this._getCheckedBoardIds(),
                self = this;

            if (ids.length == 0) {
                $.goMessage(lang.not_selected_board);
                return;
            }

            $.goConfirm(lang.change_status_normal, lang.normal_confirm, function () {
                $.ajax({
                    type: 'PUT',
                    async: true,
                    data: JSON.stringify({ids: ids}),
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'ad/api/board/status/active'
                }).done(function (response) {
                    $.goMessage(lang.change_success);
                    self.render(self.type);
                });
            });
        },

        changeTab: function (e) {
            e.stopImmediatePropagation();
            var currentEl = $(e.currentTarget);
            var type = currentEl.attr("data-type");
            this.render(type);
        },
        bindListSortable: function (e) {
            this.$el.find('.btnBoardLineAdd').hide();
            this.$el.find('.btnBoardSortable').hide();
            this.$el.find('.btnBoardAdd').hide();
            this.$el.find('.btnBoardSortDone').show();

            this.listEl.find('tbody').removeClass().sortable({
                opacity: '1',
                delay: 100,
                cursor: "move",
                items: "tr",
                containment: '.admin_content',
                hoverClass: "ui-state-hover",
                placeholder: 'ui-sortable-placeholder',
                start: function (event, ui) {
                    ui.placeholder.html(ui.helper.html());
                    ui.placeholder.find('td').css('padding', '5px 10px');
                }
            });
        },

        bbsCreate: function () {
            App.router.navigate('/board/create', true);
        },
        bbsModify: function (e) {
            if ($(e.currentTarget).parents('tbody:eq(0)').hasClass('ui-sortable')) {
                $.goMessage(adminLang["순서 바꾸기 완료후 설정"]);
                return false;
            }
            var boardId = $(e.currentTarget).attr('data-boardId');
            App.router.navigate('/board/' + boardId + "/modify", true);
        }
    }, {
        create: function (options) {
            instance = new BoardCompanyShareView({
                companyGroupId: options.companyGroupId,
                companies: options.companies
            });
            return instance.render(options.status);
        },

        remove: function () {

        }
    });

    return {
        render: function (options) {
            var layout = BoardCompanyShareView.create(options);
            return layout;
        }
    };
});