define('works/home/views/home', function (require) {

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');
    var lang = {
        'folder.name.length': GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1: 2, arg2: 20}),
        '새 폴더': worksLang['새 폴더'],
        '이름 바꾸기': worksLang['이름 바꾸기'],
        '만들기': worksLang['만들기'],
        '앱 내보내기 설명': worksLang['앱 내보내기 설명'],
        '앱 가져오기 설명': worksLang['앱 가져오기 설명'],
        '앱 이름 검색': worksLang['앱 이름 검색'],
        '앱 명을 입력하세요': worksLang['앱 명을 입력하세요.'],
        '템플릿 선택': worksLang['템플릿 선택'],
        '템플릿 선택 설명': worksLang['템플릿 선택 설명'],
        '파일 가져오기': worksLang['파일 가져오기'],
        '파일 가져오기 설명': worksLang['파일 가져오기 설명'],
        '처음부터 만들기': worksLang['처음부터 만들기'],
        '처음부터 만들기 설명': worksLang['처음부터 만들기 설명'],
        '앱 생성은 관리자가 지정한 사용자만 가능합니다': worksLang['앱 생성은 관리자가 지정한 사용자만 가능합니다'],
        '자세한 사항은 관리자에게 문의하시기 바랍니다': worksLang['자세한 사항은 관리자에게 문의하시기 바랍니다']
    };

    var AppletFolder = require('works/home/models/applet_folder');

    var WorksHomeLayout = require('works/views/app/home/works_home_layout');
    var BaseHomeView = require('works/home/views/base_home');
    var ContentTopView = require('works/views/app/layout/content_top');
    var BackdropView = require('components/backdrop/backdrop');
    var GroupItemView = require('works/home/views/applet_folder_item');
    var GuideView = require('works/components/guide_layer/views/guide_layer');
    var AppletImportListView = require('works/home/views/applet_import');

    var Template = require('hgn!works/home/templates/home');

    var FileUpload = require("components/go-fileuploader/main");

    return BaseHomeView.extend({

        events: _.extend(BaseHomeView.prototype.events, {
            'click [data-el-sort-btn]': '_onClickSort',
            'click [data-el-sort-item]': '_onClickSortItem',
            'click [data-el-create]': '_onClickCreate',
            'click [data-el-create-folder]': '_onClickCreateFolder',
            'click [tab-applet-export]': '_onClickExportTab',
            'click [tab-applet-import]': '_onClickImportTab',
            'click [data-el-app-search-btn]': '_onClickSearch',
            'keyup #appName': '_onKeyupSearch',
            'click #btn-appname-search': '_searchAppName',
            'click #cancel_search': '_clearAppName',
            'click [data-add-applet]': '_goCreateAppIntro',
            'click [data-add-applet-first-default-template]': '_createAppletByFirstDefaultTemplate',
            'click #goToWorksHome': '_goToWorksHome'
        }),

        initialize: function () {
            BaseHomeView.prototype.initialize.apply(this, arguments);

            this.deferred = $.Deferred();
            this.layoutView = WorksHomeLayout.create();
            this.contentTopView = new ContentTopView();

            this.$el.on('popupFolderLayer', $.proxy(function (e, model) {
                this._popupFolderLayer(e, model);
            }, this));
        },

        render: function () {
            BaseHomeView.prototype.render.apply(this, arguments);

            this._renderLayout.call(this);

            this.$el.html(Template({
                isOrderByName: this.order === 'name',
                lang: _.extend(this.lang, lang),
                contextRoot: GO.contextRoot,
                appName: GO.util.getAppName("works")
            }));

            this.initFileUpload();

            if (GO.locale == 'ko') {
                var guideSideView = new GuideView({'isSetting': false});
                this.$('.bar').append(guideSideView.render().el);
                $("#guideBadge").draggable({containment: "body"});
            }

            this.deferred.resolve(); // render 메소드 내에서 더 아래로 이동해도 됨.

            this.contentTopView.setElement(this.$('header'));
            this.contentTopView.render();

            this.$toggleLayoutEl = this.$('.go_content');
            this._toggleLayout(this.viewType);

            this._setContent(this.applets.getType());

            return this;
        },

        initFileUpload: function () {
            var self = this;
            var options = {
                context_root: GO.contextRoot,
                url: GO.config('contextRoot') + "api/file/direct",
                progressBarUse: false,
                multiple: false,
                validateFileType: "dwt",
                validateFileTypeMessage: worksLang['dwt 파일만 등록 가능합니다.'],
                isWorks: true
            };
            this.$el.find('#file-uploader a').attr('data-attachtype', 'file');
            options.progress = function () {
                self.backdropLayer.toggle(false);
                GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            };
            options.success = function (serverData) {
                var data = serverData.data;
                if (GO.util.fileUploadErrorCheck(serverData)) {
                    $.goAlert(GO.util.serverMessage(serverData));
                    return false;
                } else {
                    if (GO.util.isFileSizeZero(serverData)) {
                        $.goAlert(GO.util.serverMessage(serverData));
                        return false;
                    }
                }
                self._createAppletByFile(data);
                GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
            };
            options.error = function (attachModel) {
                console.log(attachModel);
                $.goSlideMessage(attachModel, 'caution');
            };

            FileUpload.bind(this.$el.find('#file-uploader a'), options);
        },

        _goCreateAppIntro: function (e) {
            var param = this.applets.getType() === 'folder' ? '?folderId=' + this.applets.getFolderId() : '';
            e.preventDefault();
            GO.router.navigate('works/applet/create/intro' + param, true);
        },

        _createAppletByFirstDefaultTemplate: function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.backdropLayer.toggle(false);
            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            $.ajax({
                url: GO.contextRoot + "api/works/applets/default",
                contentType: "application/json",
                type: "POST",
                success: $.proxy(function (resp) {
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    var appletId = resp.data.id;
                    $.goSlideMessage(worksLang['앱이 생성되었습니다.']);
                    if (this.applets.getType() === 'folder') {
                        this._moveApplet(appletId, this.applets.getFolderId(), null, false);
                    }
                    setTimeout($.proxy(function () {
                        GO.router.navigate('works/applet/' + appletId + '/settings/userform', true);
                    }), 500);
                }, this),
                error: $.proxy(function (error) {
                    $.goSlideMessage(commonLang["실패했습니다."]);
                }, this)
            });
        },

        _createAppletByFile: function (file) {
            $.ajax({
                url: GO.contextRoot + "api/works/applets/file",
                contentType: "application/json",
                type: "POST",
                data: JSON.stringify(file),
                success: $.proxy(function (resp) {
                    var appletId = resp.data.id;
                    $.goSlideMessage(worksLang['앱이 생성되었습니다.']);
                    if (this.applets.getType() === 'folder') {
                        this._moveApplet(appletId, this.applets.getFolderId(), null, false);
                    }
                    setTimeout($.proxy(function () {
                        GO.router.navigate('works/applet/' + appletId + '/home', true);
                    }), 500);
                }, this),
                error: $.proxy(function (resp) {
                    var responsJson = resp.responseJSON;
                    if (responsJson.name == "subform-validate") {
                        $.goSlideMessage(responsJson.message);
                    } else {
                        $.goSlideMessage(commonLang["실패했습니다."]);
                    }
                }, this)
            });
        },

        _onClickCreate: function () {
            if (!this.backdropLayer) {
                this.backdropLayer = new BackdropView({el: this.$('[el-backdrop-create]')});
                this.backdropLayer.linkBackdrop(this.$('[data-el-create]'));
            }
        },

        _onClickCreateFolder: function (e) {
            e.stopPropagation();
            this.backdropLayer.toggle(false);
            this._popupFolderLayer(e);
        },

        _onClickSortItem: function (e) {
            var $target = $(e.currentTarget);
            var sortType = $target.attr('data-el-sort-item');
            this.applets.setOrder(sortType);
            this.applets.fetch({reset: true});

            if (this.applets.getType() != 'search') {
                this.folders.setOrder(sortType);
                this.folders.fetch({reset: true});
            }
            this.$('.ic_check_1').hide();
            $target.find('.ic_check_1').show();
            GO.util.store.set(GO.session('id') + '-works-home-order', sortType, 'local');
        },

        _clearAppName: function () {
            this.$('#appName').val('');
        },

        _searchAppName: function () {
            var keyword = $('#appName').val().trim();

            if (_.isEmpty(keyword)) {
                this.applets.setType('all');
                $('[data-el-app-search-btn]').removeClass('searching');
            } else {
                this.applets.setType('search');
                $('[data-el-app-search-btn]').addClass('searching');
            }

            this.applets.setKeyword(keyword);
            this.applets.fetch({reset: true});
        },

        _onClickExportTab: function (e) {
            var $target = $(e.currentTarget);
            this.$('[tab-applet-export]').attr("class", "active");
            this.$('[tab-applet-import]').attr("class", "selectable");
            this.$('[data-applet-share-info]').html(lang['앱 내보내기 설명']);
            this.exportApplets.fetch();
            this._renderExportAppletList();
        },

        _onClickImportTab: function (e) {
            var $target = $(e.currentTarget);
            this.$('[tab-applet-export]').attr("class", "selectable");
            this.$('[tab-applet-import]').attr("class", "active");
            this.$('[data-applet-share-info]').html(lang['앱 가져오기 설명']);
            this.$('[data-share-item-list]').empty();
            this.importApplets.fetch();
            this._renderImportAppletList();
        },

        _renderImportAppletList: function () {
            this.$('[data-share-item-list]').empty();
            this.appImportListView = new AppletImportListView({models: this.importApplets});
            this.$('[data-share-item-list]').append(this.appImportListView.render().el);
        },

        /**
         * @Override
         * @private
         */
        _commonAction: function (type) {
            BaseHomeView.prototype._commonAction.apply(this, arguments);
            this._setTitle(type);
        },

        _setTitle: function (type, folderName) {
            type = type || this.applets.getType();
            var folder = this.folders.findWhere({id: parseInt(this.applets.getFolderId())});
            folderName = folderName || folder ? folder.get('name') : '';
            var template = Hogan.compile(
                '<span class="nav">' +
                '<a {{#isFolderType}}class="prev" data-all{{/isFolderType}} id="goToWorksHome"><span>{{title}}</span></a>' +
                '{{#isFolderType}}' +
                '<span><span>&gt;</span></span>' +
                '<a><span>' + folderName + '</span><a/>' +
                '{{/isFolderType}}' +
                '</span>'
            );
            this.contentTopView.setTitle(template.render({
                type: type,
                title: this.lang[type === 'folder' ? 'all' : type],
                isFolderType: type === 'folder'
            }));
        },

        _goToWorksHome: function () {
            GO.router.navigate(GO.router.getPackageName(), {"trigger": true});
        },

        /**
         * @Override
         * @private
         */
        _onClickFolderItem: function (e) {
            BaseHomeView.prototype._onClickFolderItem.apply(this, arguments);
            var folderId = $(e.currentTarget).attr('data-folder-id');
            var folder = this.folders.findWhere({id: parseInt(folderId)});
            this._setTitle('folder', folder.get('name'));
        },

        _onClickSort: function () {
            if (!this.sortBackdropLayer) {
                this.sortBackdropLayer = new BackdropView({el: this.$('[el-backdrop-sort]')});
                this.sortBackdropLayer.linkBackdrop(this.$('[data-el-sort-btn]'));
            }
        },

        _onClickSearch: function () {
            if (!this.searchBackdropLayer) {
                this.searchBackdropLayer = new BackdropView({el: this.$('[el-backdrop-search]')});
                this.searchBackdropLayer.linkBackdrop(this.$('[data-el-app-search-btn]'));
            }
        },

        _onKeyupSearch: function (e) {
            e.preventDefault();
            if (e.keyCode != 13 && !_.isEmpty($('#appName').val())) {
                return;
            }
            this._searchAppName();
        },

        _toggleEvent: function () {
            var type = this.applets.getType();
            if (type == 'all' || type == 'folder') {
                this._bindDraggable();
                this._enableDroppable();
            } else if (type == 'favorite') {
                this._enableSortable();
                this._disableDroppable();
            } else { // manage
                this._disableSortable();
            }
        },

        /**
         * @Override
         * @private
         */
        _toggleLayout: function () {
            var type = BaseHomeView.prototype._toggleLayout.apply(this, arguments);
            var typeMap = {
                card: 'list',
                list: 'card'
            };
            this.$('[data-toggle-layout]').removeClass('ic_list_1').removeClass('ic_card_1').addClass('ic_' + typeMap[type] + '_1');
        },

        /**
         * @Override
         * @private
         */
        _onSyncFolders: function () {
            this.deferred.done($.proxy(function () {
                BaseHomeView.prototype._onSyncFolders.call(this);
                this._renderSideFolders();
                this._toggleEvent();
                this._setTitle();
            }, this));
        },

        _renderSideFolders: function () {
            this.$('[data-side-group-list]').empty();
            this.folders.sortByName();
            this.folders.each(function (folder) {
                var groupItemSideView = new GroupItemView({
                    model: folder,
                    tagName: 'li',
                    className: 'folder',
                    type: 'side'
                });
                this.$('[data-side-group-list]').append(groupItemSideView.render().el);
            }, this);
        },

        /**
         * @Override
         * @param type
         * @private
         */
        _onSyncApplets: function () {
            BaseHomeView.prototype._onSyncApplets.apply(this, arguments); // 먼저 그리고
            this._toggleEvent(); // 바인딩
            var isFavorite = this.applets.getType() === 'favorite';
            var searchAvailable = this.applets.getType() === 'all' || this.applets.getType() === 'search';

            this.$('[data-el-sort-btn]').toggle(!isFavorite);
            this.$('[data-el-app-search-btn]').toggle(searchAvailable);

            if (!searchAvailable) {
                this.$('#appName').val('');
                this.$('[data-el-app-search-btn]').removeClass('searching');
            }
        },

        /**
         * @Override
         * @param type
         * @private
         */
        _onSyncExportAppletList: function () {
            BaseHomeView.prototype._onSyncExportAppletList.apply(this, arguments);
            this._toggleEvent(); // 바인딩
        },

        _bindDraggable: function () {
            this.$('div.app_item').draggable({
                appendTo: 'body',
                cursorAt: {left: 10, top: 10},
                containment: 'body',
                start: function () {
                    $(this).data("startingScrollTop", $(document.body).scrollTop());
                },
                drag: function (event, ui) {
                    ui.position.top -= parseInt($(this).data("startingScrollTop"));
                },
                helper: function (event) {
                    var appletId = $(event.currentTarget).data('view').model.id;
                    return '<div class="drag works_drag" data-applet-id="' + appletId + '">' +
                        '<span class="ic_works ic_body_folder_s"></span>' +
                        '<span class="subject">' + $(event.currentTarget).data('view').model.get('name') + '</span>' +
                        '</div>';
                }
            });
        },

        _toggleHoverClass: function ($eventTarget, flag) {
            var $target = $eventTarget.is('div.group') ? $eventTarget.find('a').first() : $eventTarget;
            $target.toggleClass('drag_do', flag);
        },

        _bindDroppable: function () {
            this.$('div.group, li.folder, h1[data-folder-id]').droppable({
                hoverClass: 'hover',
                out: $.proxy(function (event) {
                    this._toggleHoverClass($(event.target), false);
                }, this),
                over: $.proxy(function (event) {
                    this._toggleHoverClass($(event.target), true);
                }, this),
                drop: $.proxy(function (event, ui) {
                    this._toggleHoverClass($(event.target), false);
                    var newFolderId = $(event.target).attr('data-folder-id');
                    newFolderId = newFolderId === 'root' ? null : newFolderId;
                    var oldFolderId = this.applets.getType() === 'folder' ? this.applets.getFolderId() : null;
                    if (newFolderId === oldFolderId) return;

                    var appletId = ui.helper.attr('data-applet-id');
                    var applet = this.applets.findWhere({id: parseInt(appletId)});
                    var folder = newFolderId ? this.folders.findWhere({id: parseInt(newFolderId)}) : null;
                    var appletName = applet.get('name');
                    var folderName = newFolderId ? folder.get('name') : worksLang['나의 폴더'];
                    $.goConfirm(worksLang["앱을 이동하시겠습니까?"], GO.i18n(worksLang['선택한 {{applet}}을(를) {{folder}}로 이동합니다.<br />확인 클릭시 이동됩니다.'], {
                        applet: appletName,
                        folder: folderName
                    }), $.proxy(function () {
                        this._moveApplet(appletId, newFolderId, oldFolderId, true);
                    }, this));
                }, this)
            });
        },

        _bindSortable: function () {
            var needFix = false;
            this.$('[data-app-list]').sortable({
                items: '.app_item',
                tolerance: 'pointer',
                containment: 'body',
                change: function () {
                    needFix = true; // change 가 한번 발생하고 나면 body {position: relative; overflow: auto;} 영향으로 position 오차 생김.
                },
                sort: function (event, ui) {
                    if ($.browser.webkit && needFix) {
                        var wScrollTop = $(window).scrollTop();
                        ui.helper.css({'top': ui.position.top + wScrollTop + 'px'});
                    }
                },
                stop: $.proxy(function (event, ui) {
                    needFix = true; // stop 이 한번 발생하고 나면 body {position: relative; overflow: auto;} 영향으로 position 오차 생김.
                    var $parent = ui.item.parent(),
                        sortedIds = [];

                    $parent.find('div.app_item').each(function (i, li) {
                        var curView = $(li).data('view');
                        sortedIds.push(curView.getAppletId());
                    });
                    this.applets.reorder(sortedIds);
                }, this)
            });
        },

        _enableSortable: function () {
            this._bindSortable();
            this.$('[data-app-list]').sortable('enable');
        },

        _disableSortable: function () {
            this._bindSortable();
            this.$('[data-app-list]').sortable('disable');
        },

        _enableDroppable: function () {
            this._bindDroppable();
            this.$('div.group, li.folder, h1[data-folder-id]').droppable('enable');
        },

        _disableDroppable: function () {
            this._bindDroppable();
            this.$('div.group, li.folder, h1[data-folder-id]').droppable('disable');
        },

        _moveApplet: function (appletId, newFolderId, oldFolderId, useMessage) {
            $.ajax({
                type: 'PUT',
                contentType: "application/json",
                url: GO.contextRoot + 'api/works/folders/move',
                data: JSON.stringify({
                    oldFolderId: oldFolderId,
                    appletId: appletId,
                    newFolderId: newFolderId
                }),
                success: $.proxy(function () {
                    this.applets.fetch();
                    if (useMessage) {
                        $.goMessage(worksLang['이동되었습니다.']);
                    }
                }, this)
            });
        },

        _popupFolderLayer: function (e, model) {
            var isEdit = !!model;
            var name = isEdit ? model.get('name') : '';
            var layerTemplate =
                '<table class="table_form_mini"><tbody>' +
                '<tr><td>' +
                '<input class="input w_max" type="text" id="folderName" value="' + name + '" />' +
                '</td></tr>' +
                '</tbody></table>';

            var popup = $.goPopup({
                header: isEdit ? lang['이름 바꾸기'] : lang['새 폴더'],
                contents: layerTemplate,
                pclass: 'layer_normal new_layer layer_works_new',
                buttons: [{
                    btext: commonLang["확인"],
                    btype: "confirm",
                    autoclose: false,
                    callback: $.proxy(function (popup) {
                        var $folderName = popup.find('#folderName');
                        var folderName = $folderName.val();
                        model = model || new AppletFolder();
                        model.set({name: folderName});
                        var validate = model.validate();
                        if (validate) {
                            $.goError(lang[validate], $folderName);
                            return;
                        }
                        model.save({}, {
                            success: $.proxy(function () {
                                popup.close();
                                $.goMessage(isEdit ? commonLang['수정되었습니다.'] : commonLang['추가되었습니다.']);
                                this.folders.fetch();
                            }, this)
                        });
                    }, this)
                }, {
                    btext: commonLang["취소"],
                    btype: "normal"
                }]
            });
            popup.find('.btn_layer_x').hide();
            popup.find('#folderName').focus();
        },

        _renderLayout: function () {
            this.layoutView.render().done($.proxy(function () {
                this.layoutView.setContent(this);
                this.layoutView.$el.removeClass('go_full_screen').addClass('do_skin'); // TODO layout 널 어쩌면 좋니
            }, this));
        }

        /**
         * Test Case
         *
         * 0. 권한과 applet 목록 fetch 결과에 따라 노출되는 메세지가 달라야 함. 두 API 를 묶어서 when 처리하면 간단하지만 따로 처리 해보자.
         *  - 등록 권한이 있고 목록이 있는 경우 -> 앱 등록 버튼 노출
         *  - 등록 권한이 있고 목록이 없는 경우 -> 앱 등록 버튼 노출
         *  - 등록 권한이 없고 목록이 있는 경우 -> 앱 목록 노출
         *  - 등록 권한이 없고 목록이 없는 경우 -> empty message 노출
         *
         * 1. 앱 생성 권한에 따라 앱만들기 버튼이 정상적으로 노출이 되는가
         * 2. 앱이 없는 경우 empty message 가 정상적으로 노출이 되는가.
         * 3. 즐겨찾기 토글시 목록이 정상적으로 갱신이 되는가.
         * 4. 그룹핑 토글시 목록이 정상적으로 갱신이 되는가.
         */
    });
});
