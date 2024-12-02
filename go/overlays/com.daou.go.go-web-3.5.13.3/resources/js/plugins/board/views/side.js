define('board/views/side', function (require) {

    var $ = require('jquery');
    var Backbone = require('backbone');
    var when = require('when');
    var GO = require('app');
    var Hogan = require('hogan');

    var SideFavoriteModel = require('board/models/board_favorite');
    // TODO: admin 모델에서 참조하는 것을 이동
    var BoardBaseConfigModel = require('admin/models/board_base_config');
    var CompanyBoardTree = require('board/models/company_board_tree');
    var DeptBoardTree = require('board/models/dept_board_tree');

    var SideFavoriteCollection = require('board/collections/board_favorite');	// 정리 대상

    var SideFavoriteView = require('board/views/side_favorite');
    var BoardTree = require('board/components/board_tree/board_tree');

    var renderSideTpl = require('hgn!board/templates/side');
    var renderSideDeptBoardTpl = require('hgn!board/templates/side_dept_board');
    var renderSideCompanyBoardTpl = require('hgn!board/templates/side_company_board');

    var commonLang = require('i18n!nls/commons');
    var boardLang = require('i18n!board/nls/board');

    // 축약형
    var BoardTreeMenuView = BoardTree.BoardTreeMenuView;

    require('jquery.go-popup');

    var lang = {
        "board": commonLang['게시판'],
        "dept_board": boardLang['부서게시판'],
        "manage_row_rank": boardLang['하위부서 게시판 조회'],
        "company_board": boardLang['전사게시판'],
        "new_post": boardLang['글쓰기'],
        "new_board": boardLang['새 게시판'],
        "board_admin": commonLang['게시판 관리'],
        "board_setting": commonLang['게시판 설정'],
        "board_add": boardLang['게시판 추가'],
        "no_board": boardLang['등록된 게시판이 없습니다.'],
        "no_writable_board": boardLang['새 글을 작성할 수 있는 게시판이 없습니다.'],
        "closed_board": commonLang['비공개'],
        "input_placeholder": boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.'],
        "alert_check_editor": boardLang['현재 작성중인 내용이 있습니다.<br>화면 이동 시 작성 중인 내용은 사라집니다.<br>이동하시겠습니까?'],
        "no_dept": boardLang['소속된 부서가 없습니다. 운영자에게 문의하세요.'],
        "confirm": commonLang['확인'],
        "cancel": commonLang['취소'],
        "collapse": commonLang['접기'],
        "expand": commonLang['펼치기'],
        "closed_board": boardLang['중지된 게시판 관리'],
        "deleted_department": commonLang['삭제된 부서']
    };

    var DEPARTMENT_BOARD_STORE_KEY = GO.session("loginId") + '-board-department-toggle';
    var COMPANY_BOARD_STORE_KEY = GO.session("loginId") + '-board-company-toggle';
    var FAVORITE_BOARD_STORE_KEY = GO.session("loginId") + '-board-favorite-toggle';

    var renderBoardNodeTpl = BoardTree.renderBoardTreeMenuNode;

    var BoardSideView = Backbone.View.extend({
        events: {
            "click .btn-setting": "_clickBtnSettingHandler",
            "click a.go_boards[data-id]": "goBoard",
            "click section.lnb span.ic_side[data-slide]": "slideToggle",
            "click section.lnb a.txt": "slideToggle",
            "click a.node-value span.ic_side[data-slide]": "slideToggleDepartmentName",
            "click a.node-value span.txt": "slideToggleDepartmentName",
            "click #favoriteSide li span.ic_list_del": "favoriteItemDelete",
            "click #reorderSave": "favoreteReorderSave",
            "click #writeBtn": "sideWriteBtnAction",
            "click span[btn-type='newBoard']": "newBoard",
            "click #boardHome": "boardHome"
        },

        initialize: function () {
            // 전사게시판 목록
            this.companyBoardList = new CompanyBoardTree.Collection();
            // 부서게시판 목록
            this.deptBoardList = new DeptBoardTree.Collection();

            /**
             * 코드 정리 대상들...
             */
            var self = this;
            this.favoriteCollection = SideFavoriteCollection.create();

            this.deleteFavoriteIds = [];

            GO.EventEmitter.off('board');
            GO.EventEmitter.on('board', 'changed:favorite', this.favoriteRender, this);
            GO.EventEmitter.on('board', 'changed:lastPostedAt', function () {
                self.renderContent();
            }, this);

            // 정리대상
            GO.EventEmitter.on('board', 'changed:deptBoard', function () {
                self.renderContent();
            }, this);

            // 노드 변경시 발생
            GO.EventEmitter.off('boardTree');
            GO.EventEmitter.on('boardTree', 'changed:nodes', function () {
                self.renderContent();
            }, this);

            this.model = BoardBaseConfigModel.read({admin: false}).toJSON();
            GO.config("attachNumberLimit", this.model.attachNumberLimit);
            GO.config("attachSizeLimit", this.model.attachSizeLimit);
            GO.config("maxAttachNumber", this.model.maxAttachNumber);
            GO.config("maxAttachSize", this.model.maxAttachSize);
            GO.config("excludeExtension", this.model.excludeExtension ? this.model.excludeExtension : "");
            GO.config("priorityBoard", this.model.priorityBoard);
        },

        render: function (args) {
            console.debug('[board] BoardSideView:render call');

            this.$el.html(renderSideTpl({
                contextRoot: GO.contextRoot,
                isDeptBoardPriority: GO.config("priorityBoard"),
                isDeptOpen: this.getStoredCategoryIsOpen(DEPARTMENT_BOARD_STORE_KEY),
                isCompanyOpen: this.getStoredCategoryIsOpen(COMPANY_BOARD_STORE_KEY),
                appName: GO.util.getAppName("board"),
                lang: lang
            }));

            // 부서게시판
            this.renderContent();
        },

        renderContent: function () {
            console.debug('[board] BoardSideView:renderContent call');

            when.all([
                this.favoriteRender(),
                this.companyBoardRender(),
                this.deptBoardRender()
            ]).then(_.bind(this.selectSideMenu, this)).otherwise(function (error) {
                console.debug(error.stack);
            })
        },

        /**
         * 즐겨찾기 게시판 렌더링
         */
        favoriteRender: function () {

            var self = this;
            var collection = this.favoriteCollection;

            this.deleteFavoriteIds = [];

            return when.promise(function (resolve, reject) {
                collection.fetch({
                    data: {'page': '0', 'offset': '1000'},
                    success: function (collection) {
                        var dataSet = collection.toJSON();

                        var favoriteData = $(dataSet).map(function (k, v) {
                            return {
                                name: v.name,
                                boardId: v.boardId,
                                id: v.id,
                                type: v.type,
                                anonymFlag: v.anonymFlag,
                                sharedFlag: v.sharedFlag,
                                getBoardTypeClass: self._getBoardTypeClass,
                                lastPostedAt: v.lastPostedAt || false,
                                hasRecentPost: function () {
                                    return this.lastPostedAt && GO.util.isCurrentDate(this.lastPostedAt);
                                },
                                publicFlag: v.publicFlag
                            };
                        });

                        SideFavoriteView.attachTo(self.$el.find('#favoriteSide'), {
                            data: favoriteData.get(),
                            isOpen: self.getStoredCategoryIsOpen(FAVORITE_BOARD_STORE_KEY)
                        });

                        resolve();
                    },
                    error: reject
                });
            });
        },

        /**
         * 전사 게시판 렌더링
         */
        companyBoardRender: function () {
            var self = this;
            var collection = this.companyBoardList;
            var $section = this.$('#companySide');
            var $container = $section.find('ul');
            var elBuff = [];

            $container.empty();

            return when.promise(function (resolve, reject) {
                collection.fetch({
                    success: function (collection) {
                        // 회사가 아예 없을 순 없지만 방어코드 차원에서..
                        if (collection.length < 1) {
                            return;
                        }

                        collection.each(function (companyBoardTree) {
                            // 전사게시판 트리 렌더링
                            var boardTreeNodes = companyBoardTree.getBoardTreeNodes();
                            if (boardTreeNodes.length > 0) {
                                var menuId = ['company', GO.session('companyId'), 'company'].join('.');
                                var boardTreeView = self._renderMenuTree(convertBoardsAction(boardTreeNodes), menuId);
                                elBuff.push(boardTreeView.el);
                            }
                        });

                        // 중지된 게시판 조회 링크 렌더링
                        if (collection.hasClosedBoards()) {
                            elBuff.push(self._renderClosedBoardLink(GO.config('contextRoot') + 'app/board/company/close'));
                        }

                        $container.append.apply($container, elBuff);

                        // 전사게시판이 존재하고 노드가 모두 추가되었으면 사이드에 노출한다.
                        if (elBuff.length > 0) {
                            $section.show();
                        }
                        resolve();
                    },
                    error: reject
                });

                function convertBoardsAction(boardTreeNodes) {
                    boardTreeNodes.map(function (boardTreeNode) {
                        var oldActions = boardTreeNode.get('actions');
                        if (oldActions && oldActions.managable) {
                            // 사용자 서비스에서 전사게시판을 관리할 수 없다.
                            oldActions.managable = false;
                            boardTreeNode.set('actions', oldActions);
                        }
                    });

                    return boardTreeNodes;
                }
            });
        },


        /**
         * 부서 게시판 렌더링(새로 작성중)
         */
        deptBoardRender: function () {
            var self = this;
            var collection = this.deptBoardList;
            var $section = this.$('#deptSide');
            var $container = $section.find('ul:first');
            var elBuff = [];

            $container.empty();
            $section.show();

            return when.promise(function (resolve, reject) {
                collection.fetch({
                    success: function (collection) {

                        // 소속된 부서가 없을 경우 가이드 메시지를 보여주고 그렇지 않을 경우 가이드메시지 자체를 지운다.
                        if (collection.length > 0) {
                            $section.find('.no-dept-msg').remove();
                        } else {
                            $section.find('.no-dept-msg').show();
                        }

                        collection.each(function (deptBoardModel) {
                            // 부서 게시판 트리 렌더링
                            var $nodeLi = renderDeptBoardTree(deptBoardModel);
                            if ($nodeLi) {
                                elBuff.push(renderDeptBoardTree(deptBoardModel));
                            }
                        });

                        // 하위부서게시판 조회 링크 렌더링
                        if (collection.isAccessableSubDeptBoards()) {
                            elBuff.push(renderSubDeptBoardsLink());
                        }

                        // 중지된 게시판 조회 링크 렌더링
                        if (collection.hasClosedBoards()) {
                            elBuff.push(self._renderClosedBoardLink(GO.config('contextRoot') + 'app/board/dept/close'));
                        }

                        $container.append.apply($container, elBuff);
                        resolve();
                    },
                    error: reject
                });
            });

            // 부서게시판 트리 렌더링
            function renderDeptBoardTree(deptBoardModel) {
                var boardTreeNodes = deptBoardModel.getBoardTreeNodes();
                // 멀티컴퍼니인 경우에 대비해서 company id까지 포함한다.
                var menuId = ['company', GO.session('companyId'), 'dept'].join('.');
                var boardTreeView = self._renderMenuTree(boardTreeNodes, menuId);
                var $nodeLi = $(renderBoardNodeTpl({
                    "nodeId": deptBoardModel.getDeptId(),
                    "nodeType": 'DEPT',	// 가상의 타입을 준다.
                    "nodeValue": deptBoardModel.getDeptName(),
                    "isDeleted": deptBoardModel.isDeleted(),
                    "iconType": 'org',
                    "linkUrl": '#',
                    "managable": deptBoardModel.isManagable(),
                    "lang": {"deleteDept": commonLang["삭제된 팀"]},
                    "hasToggleIcon": 'true'
                }));

                // 부서명 클릭시 a 태그의 기본 동작 막기.개선 필요...
                $nodeLi.on('click', 'a.node-value', function (e) {
                    e.preventDefault();
                });

                $nodeLi.append(boardTreeView.el);

                return $nodeLi;
            }

            // 하위 게시판 조회 렌더링
            function renderSubDeptBoardsLink() {
                return $(renderBoardNodeTpl({
                    "nodeType": 'LINK',	// 가상의 타입을 준다.
                    "nodeValue": lang.manage_row_rank,
                    "iconType": 'assigned',
                    "linkUrl": GO.config('contextRoot') + 'app/board/lowrank/manage',
                    "managable": false
                }));
            }
        },

        selectSideMenu: function () {
            // 임시
            var selectedEl = null;
            var loadMenuArr = GO.router.getUrl().split('/');

            this.$el.find('.on').removeClass('on');

            if (loadMenuArr[2] === 'favorite') {
                selectedEl = this.$el.find('#favoriteSide li a[data-boardId="' + loadMenuArr[1] + '"]');
            } else if (loadMenuArr[1] == 'dept') {
                if (loadMenuArr[2] == 'close') {
                    selectedEl = this.$el.find('#deptSide li.closed a');
                } else {
                    selectedEl = this.$el.find('#deptSide li a[data-deptid="' + loadMenuArr[2] + '"]');
                }
            } else if (loadMenuArr[1] == 'lowrank') {
                selectedEl = this.$el.find('#deptSide li.assigned a');
            } else if (loadMenuArr[1] == 'company' && loadMenuArr[2] == 'close') {
                selectedEl = this.$el.find('#companySide li.closed a');
            } else {
                selectedEl = this.$el.find('#deptSide li[data-type=BOARD] a[data-id="' + loadMenuArr[1] + '"],#deptSide li[data-type=SHARE] a[data-id="' + loadMenuArr[1] + '"], #companySide li[data-type=BOARD] a[data-id="' + loadMenuArr[1] + '"],#companySide li[data-type=SHARE] a[data-id="' + loadMenuArr[1] + '"]');
            }
            if (selectedEl.length) {
                selectedEl.parents('p:eq(0)').addClass('on');
            }
        },


        deptAdmin: function (e) {
            var self = this;
            if (GO.util.hasActiveEditor()) {
                GO.util.editorConfirm(function () {
                    self.deptAdminAction(e);
                });
            } else {
                if ($('#feedContent').val() && $('#feedContent').val() != lang.input_placeholder) {
                    this.wirtePageMovePopup(e, 'deptAdminAction');
                } else {
                    this.deptAdminAction(e);
                }
            }
        },
        deptAdminAction: function (e) {
            var $target = $(e.currentTarget);
            var deptId = $target.data('id');

            //TODO: 기존 호환코드. 삭제 예정
            if (!$target.data('type')) {
                deptId = $target.data('deptid');
            }

            GO.router.navigate('board/dept/' + deptId, true);
        },
        boardAdmin: function (e) {
            var self = this;

            if (GO.util.hasActiveEditor()) {
                GO.util.editorConfirm(function () {
                    self.boardAdminAction(e);
                });
            } else {
                if ($('#feedContent').val() && $('#feedContent').val() != lang.input_placeholder) {
                    this.wirtePageMovePopup(e, 'boardAdminAction');
                } else {
                    this.boardAdminAction(e);
                }
            }
        },
        boardAdminAction: function (e) {
            var $target = $(e.currentTarget);
            var boardId = $target.data('id');

            //TODO: 기존 호환코드. 삭제 예정
            if (!$target.data('type')) {
                boardId = $target.data('boardid');
            }

            GO.router.navigate('board/' + boardId + '/admin', true);
        },
        newBoard: function (e) {
            if (GO.util.hasActiveEditor()) {
                var target = $(e.currentTarget);
                var boardId = target.attr('data-boardid');
                var callback = function () {
                    GO.router.navigate('board/create', true);
                };

                GO.util.editorConfirm(callback);
            } else {

                if ($('#feedContent').val() && $('#feedContent').val() != lang.input_placeholder) {
                    this.wirtePageMovePopup(e, 'newBoardAction');
                } else {
                    this.newBoardAction();
                }

            }
        },
        newBoardAction: function () {
            GO.router.navigate('board/create', true);
        },
        sideWriteBtnAction: function (e) {
            if (GO.util.hasActiveEditor()) {
                var self = this;
                var callback = function () {
                    self.goWrite(e);
                };

                GO.util.editorConfirm(callback);
            } else {
                if ($('#feedContent').val() && $('#feedContent').val() != lang.input_placeholder) {
                    this.wirtePageMovePopup(e, "goWrite");
                } else {
                    this.goWrite(e);
                }
            }
        },
        goWrite: function (e) {
            var self = this;
            var target = $(e.currentTarget).parent().parent();

            var hasDeptBoard = this.deptBoardList.hasBoards();
            var hasCompanyBoard = this.companyBoardList.hasBoards();

            if (!hasDeptBoard && !hasCompanyBoard) {
                $.goMessage(lang['no_board']);
                return false;
            }

            if (!this._hasWritableBoards()) {
                $.goMessage(lang['no_writable_board']);
                return false;
            }

            var deptId,
                boardId;

            var hasBoard = !_.isUndefined(GO.router.getUrl().split('board/')[1]);
            if (hasBoard) {
                boardId = GO.router.getUrl().split('board/')[1].split('/post/')[0];
            }

            this.deptBoardList.models.forEach(function (deptBoards) {
                deptBoards.attributes.boards.forEach(function (board) {
                    if (self._isWritableCurrentBoard(board, boardId)) {
                        deptId = deptBoards.attributes.deptId;
                    }
                });
            });
            this.companyBoardList.models.forEach(function (companyBoards) {
                companyBoards.attributes.boards.forEach(function (board) {
                    if (self._isWritableCurrentBoard(board, boardId)) {
                        deptId = companyBoards.attributes.companyId;
                    }
                });
            });

            if (!deptId || !boardId) {
                GO.router.navigate('board/post/write', true);
            } else {
                GO.router.navigate('board/post/write/' + deptId + '/' + boardId, true);
            }
        },

        favoriteItemDelete: function (e) {
            var targetEl = $(e.currentTarget).parents('li');
            this.deleteFavoriteIds.push(targetEl.attr('data-boardid'));
            targetEl.remove();
        },

        favoreteReorderSave: function (e) {
            var self = this, boardFavoriteIds = SideFavoriteView.getReorderIds();

            if (!this.favoriteModel)
                this.favoriteModel = new SideFavoriteModel();
            if (this.deleteFavoriteIds.length) {
                if (!this.favoriteModel)
                    this.favoriteModel = new SideFavoriteModel();
                $.each(this.deleteFavoriteIds, function (k, v) {
                    self.favoriteModel.set({
                        'boardId': v,
                        'id': v
                    }, {
                        silent: true
                    });
                    self.favoriteModel.destroy({
                        success: function (model, rs) {
                            GO.EventEmitter.trigger('board', 'changed:favorite', true);
                            GO.EventEmitter.trigger('board', 'change:boardInfo', model.id);
                        }
                    });
                });


            }

            SideFavoriteView.destroySortable();

            if (boardFavoriteIds) {
                this.favoriteModel.set('boardId', '', {
                    silent: true
                });
                this.favoriteModel.save({
                    'ids': boardFavoriteIds
                }, {
                    type: 'PUT',
                    success: function (model, rs) {

                        if (rs.code == 200)
                            GO.EventEmitter.trigger('board', 'changed:favorite', true);
                    }
                });
            }
        },

        slideToggle: function (e) {
            var currentTarget = $(e.currentTarget);
            var parentTarget = currentTarget.parents('h1');
            var toggleBtn = parentTarget.find(".ic_side");
            var self = this;

            parentTarget.next('ul').slideToggle("fast", function () {
                if ($(this).css('display') == 'block') {
                    parentTarget.removeClass("folded");
                    toggleBtn.attr("title", lang['collapse']);
                } else {
                    parentTarget.addClass("folded");
                    toggleBtn.attr("title", lang['expand']);
                }
                self.storeToggleStatus(parentTarget, toggleBtn);
            });
        },

        slideToggleDepartmentName: function (e) {
            var currentTarget = $(e.currentTarget);
            var parentTarget = currentTarget.parents('p');
            var toggleBtn = parentTarget.find(".ic_hide_up");
            var self = this;

            if(! parentTarget.next('ul').find('li').length) {
                return;
            }

            parentTarget.next('ul').slideToggle("fast", function () {
                if ($(this).css('display') == 'block') {
                    toggleBtn.removeClass("open").addClass("close");
                    toggleBtn.attr("title", lang['collapse']);
                } else {
                    toggleBtn.removeClass("close").addClass("open");
                    toggleBtn.attr("title", lang['expand']);
                }
                self.storeToggleStatus(parentTarget, toggleBtn);
            });
        },

        storeToggleStatus: function (parentTarget, toggleBtn) {
            var self = this;
            var isCompany = parentTarget.hasClass("company");
            var isDept = parentTarget.hasClass("org");
            var isFavorite = parentTarget.hasClass("star");
            var isOpen = !toggleBtn.hasClass("folded");

            if (isCompany) {
                self.storeCategoryIsOpen(COMPANY_BOARD_STORE_KEY, isOpen);
            } else if (isDept) {
                self.storeCategoryIsOpen(DEPARTMENT_BOARD_STORE_KEY, isOpen);
            } else if (isFavorite) {
                self.storeCategoryIsOpen(FAVORITE_BOARD_STORE_KEY, isOpen);
            }
        },

        wirtePageMovePopup: function (e, type) {
            var _this = this;
            $.goPopup({
                title: '',
                message: lang.alert_check_editor,
                modal: true,
                buttons: [{
                    'btext': lang.confirm,
                    'btype': 'confirm',
                    'callback': function () {
                        if (type == "goBaordAction") {
                            _this.goBaordAction(e);
                        } else if (type == "goWrite") {
                            _this.goWrite(e);
                        } else if (type == "newBoardAction") {
                            GO.router.navigate('board/create', true);
                        } else if (type == "boardAdminAction") {
                            _this.boardAdminAction(e);
                        } else if (type == "deptAdminAction") {
                            _this.deptAdminAction(e);
                        }
                    }
                }, {
                    'btext': lang.cancel,
                    'btype': 'normal',
                    'callback': function () {
                    }
                }]
            });
        },
        goBaordAction: function (e) {
            var selectedEl = $(e.currentTarget)

            this.$el.find('.on').removeClass('on');
            selectedEl.parent().addClass('on');

            if (selectedEl.attr('data-id')) {
                if (selectedEl.parents('#favoriteSide').length) {
                    GO.router.navigate('board/' + selectedEl.attr('data-boardId') + '/favorite', {
                        trigger: true,
                        pushState: true
                    });
                } else {
                    var boardId = selectedEl.attr('data-id');

                    if (boardId != "closed") {
                        GO.router.navigate('board/' + selectedEl.attr('data-id'), {trigger: true, pushState: true});
                    } else {
                        var deptId = selectedEl.attr('data-deptId');

                        GO.router.navigate('board/dept/' + deptId + '/close', {trigger: true, pushState: true});
                    }
                }
                $('html, body').animate({
                    scrollTop: 0
                });
            }
        },
        goBoard: function (e) {
            if (GO.util.hasActiveEditor()) {
                var self = this;
                var callback = function () {
                    self.goBaordAction(e);
                };

                GO.util.editorConfirm(callback);
            } else {
                if ($('#feedContent').val() && $('#feedContent').val() != lang.input_placeholder) {
                    this.wirtePageMovePopup(e, 'goBaordAction');
                } else {
                    this.goBaordAction(e);
                }
            }
        },

        getStoredCategoryIsOpen: function (storeKey) {
            var savedCate = GO.util.store.get(storeKey)

            if (_.isUndefined(savedCate)) {
                savedCate = true;
            }

            return savedCate;
        },

        storeCategoryIsOpen: function (store_key, category) {
            return GO.util.store.set(store_key, category);
        },

        boardHome: function () {
            var callback = function () {
                GO.router.navigate(GO.contextRoot + 'board', true);
            };

            GO.util.editorConfirm(callback);
        },

        /**
         * 글쓰기 가능한 게시판이 존재하는가?
         */
        _hasWritableBoards: function () {
            return this.deptBoardList.hasWritableBoards() ||
                this.companyBoardList.hasWritableBoards();
        },

        /**
         * 현재 보고있는 게시판의 쓰기 권한이 있는가?
         */
        _isWritableCurrentBoard: function (board, boardId) {
            return (board.nodeType == 'BOARD' && board.board.id == boardId
                && board.actions && board.actions.writable);
        },

        /**
         * 트리구조의 메뉴 렌더링
         */
        _renderMenuTree: function (boardTreeNodes, menuId) {
            var treeMenuView = new BoardTreeMenuView({
                "nodes": boardTreeNodes,
                "menuId": menuId
            });
            treeMenuView.render();
            return treeMenuView;
        },

        /**
         * 중지된 게시판 링크 생성
         */
        _renderClosedBoardLink: function (linkUrl) {
            return $(renderBoardNodeTpl({
                "nodeType": 'LINK',	// 가상의 타입을 준다.
                "nodeValue": lang.closed_board,
                "iconType": 'closed',
                "linkUrl": linkUrl,
                "managable": false
            }));
        },

        /**
         * 부서/게시판의 설정 버튼 클릭 핸들러
         *
         * BoardTreeView 내부로 들어가도 좋으나, 부서의 경우 BoardTreeView 구성요소가 아니므로 우선 여기서 일괄 처리
         * BoardTreeView는 버튼만 제공하는 셈.
         */
        _clickBtnSettingHandler: function (e) {
            var $target = $(e.currentTarget);
            var nodeType = $target.data('type');

            switch (nodeType) {
                case 'DEPT':	// 부서 게시판일 경우 부서관리 설정
                    this.deptAdmin(e);
                    break;
                case 'BOARD':	// 그외 모든 게시판 타입의 설정
                    this.boardAdmin(e);
                    break;
                default:
                    // 그외에는 관리액션이 존재하지 않는다.
                    break;
            }
        },

        _getBoardTypeClass: function () {
            var cls = this.type == 'STREAM' ? 'feed' : 'classic';

            var anonmyFlag = this.anonymFlag;	//TODO

            if (this.sharedFlag) {
                cls += '_share';
            }
            if (anonmyFlag) {
                cls += '_anonym';
            }
            return cls;
        }
    });

    return BoardSideView;
});