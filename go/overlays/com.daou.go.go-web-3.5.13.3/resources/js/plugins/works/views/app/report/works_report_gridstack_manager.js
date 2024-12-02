define('works/views/app/report/works_report_gridstack_manager', function (require) {
    var Backbone = require('backbone');
    var GridStack = require("gridstack");
    var When = require('when');
    require('gridstack.grid-jquery-ui');

    var ClientIdGenerator = require('works/components/formbuilder/core/cid_generator');
    var ReportItemChart = require("works/views/app/report/report_item_chart");
    var ReportItemTable = require("works/views/app/report/report_item_table");
    var ReportItemCard = require("works/views/app/report/report_item_card");
    var ReportItemText = require("works/views/app/report/report_item_text");
    var ReportItemImage = require("works/views/app/report/report_item_image");

    var ReportItemTemplate = require("hgn!works/components/report/template/report_item");
    var SelectTemplate = Hogan.compile([
        '<div class="edit_tool" style="z-index:10;"><ul class="tool_btn">\n' +
        '<li btn-setting-wrap><a btn-setting><span class="icx2 ic_edit_set"></span></a></li>\n' +
        '<li btn-filter-wrap><a btn-filter><span class="icx2 ic_edit_filter"></span></a></li>\n' +
        '<li btn-copy-wrap><a btn-copy><span class="icx2 ic_edit_copy"></span></a></li>\n' +
        '<li btn-delete-wrap><a btn-delete><span class="icx2 ic_edit_del"></span></a></li>\n' +
        '</ul></div>'].join(""));

    var CONSTANTS = require('works/components/report/constants');
    var commonLang = require("i18n!nls/commons");
    var adminLang = require('i18n!admin/nls/admin')

    var isReadOnly = false;
    var lang = {
        'save': commonLang['저장'],
        'cancel': commonLang['취소'],
        'confirm': commonLang['확인'],
        'copy': commonLang['복사'],
    }
    var Promise = function () {
        return When.promise.apply(this, arguments);
    };

    return Backbone.View.extend({
        events: {
            "click a[btn-setting]": "_settingItem",
            "click a[btn-filter]": "_filterItem",
            "click a[btn-copy]": "_copyItem",
            "click a[btn-delete]": "_deleteItem"
        },

        initialize: function (options) {
            isReadOnly = false
            this.$el = $('.works-report-content');
            this.appletId = options.appletId;
            this.reportId = options.reportId;

            this.fields = options.fields;
            this.report = options.report;

            this.chartFields = this.fields.getChartFields();
            this.numberFields = this.fields.getNumberFields();
            this.chartOption = this.chartFields.length ? {fieldCid: this.chartFields.at(0).get("cid")} : {};
            this.reportItemViews = [];

            this.grid = GridStack.init({
                resizable: {
                    handles: 'se, sw, ne, nw'
                },
                float: true,
                minRow: 20,
                removable: '#trash',
                removeTimeout: 100,
                acceptWidgets: '.newWidget',
                disableOneColumnMode: true
            });
            this.saveDisabled();
        },

        render: function () {
            this.createEvent(this.grid);
            _.forEach(this.report.getTemplate(), function (item) {
                this.grid.addWidget(ReportItemTemplate({
                        type: item.type,
                        rid: item.rid,
                        height: item.height,
                        width: item.width,
                        minWidth: CONSTANTS.ITEM_SIZE.minWidth[item.type],
                        minHeight: CONSTANTS.ITEM_SIZE.minHeight[item.type]
                    }), item.x, item.y, item.width, item.height, false, CONSTANTS.ITEM_SIZE.minWidth[item.type],
                    CONSTANTS.ITEM_SIZE.maxWidth[item.type], CONSTANTS.ITEM_SIZE.minHeight[item.type],
                    CONSTANTS.ITEM_SIZE.maxHeight[item.type], item.rid);
            }, this);

            _.forEach(this.report.getReportItems(), function (item) {
                var reportItem = this.getReportItem(item.rid);
                reportItem.toObject(item);
                reportItem.render();
            }, this);
        },

        disable: function () {
            isReadOnly = true;
            $('#works-report-content').addClass('shared_report');
            this.grid.disable();
        },

        enable: function () {
            isReadOnly = false;
            this.grid.enable();
        },

        save: function () {
            var self = this;
            var reportItems = _.map(this.reportItemViews, function (item) {
                return {
                    reportId: self.reportId,
                    rid: item.rid,
                    data: JSON.stringify(item.toJSON()),
                }
            });

            var templates = [];
            _.each(this.grid.getAll(), function (node) {
                if (!self.getReportItem(node.rid)) {
                    return;
                }

                templates.push({
                    rid: node.rid,
                    type: node.type,
                    width: node.width,
                    height: node.height,
                    x: node.x,
                    y: node.y
                });
            });

            this.report.set('reportItems', reportItems);
            this.report.set('template', JSON.stringify(templates));
            return this.report.save().done(function (response) {
                $.goSlideMessage(commonLang["저장되었습니다."]);
                self.saveDisabled();
                return new Promise(function (resolve, reject) {
                    resolve(response.data);
                });
            }).fail(function (response) {
                if (response.responseJSON && response.responseJSON.message) {
                    $.goMessage(response.responseJSON.message);
                } else {
                    $.goMessage(adminLang["요청 처리 중 오류가 발생하였습니다."]);
                }
            });
        },

        getReportItem: function (rid) {
            return _.find(this.reportItemViews, function (item) {
                return rid == item.getRid();
            });
        },

        _deleteReportItem: function (rid) {
            this.reportItemViews = _.filter(this.reportItemViews, function (item) {
                return rid != item.getRid();
            });
        },

        isCurrentLayer: function (event) {
            return $(event.currentTarget).hasClass("on");
        },

        _createChartItemView: function (contentWrap, rid) {
            return new ReportItemChart({
                rid: rid,
                appletId: this.appletId,
                fields: this.fields,
                contentWrap: contentWrap
            });
        },

        _createCardItemView: function (contentWrap, rid) {
            return new ReportItemCard({
                appletId: this.appletId,
                rid: rid,
                fields: this.fields,
                contentWrap: contentWrap
            });
        },

        _createTextItemView: function (contentWrap, rid) {
            return new ReportItemText({
                rid: rid,
                appletId: this.appletId,
                contentWrap: contentWrap
            });
        },

        _createTableItemView: function (contentWrap, rid) {
            return new ReportItemTable({
                rid: rid,
                appletId: this.appletId,
                fields: this.fields,
                contentWrap: contentWrap
            });
        },

        _createImageItemView: function (contentWrap, rid) {
            return new ReportItemImage({
                rid: rid,
                appletId: this.appletId,
                reportId: this.reportId,
                contentWrap: contentWrap
            });
        },

        _settingItem: function (event) {
            event.stopPropagation();

            var rid = $(event.target).closest('.report_card').attr('item-rid');
            var reportItem = this.getReportItem(rid);
            $.goPopup({
                pclass: 'layer_normal layer_report_card go_renew',
                headerHtml: '',
                width: CONSTANTS.TYPE_TEXT == reportItem.type ? 700 : 380,
                contents: reportItem.getSettingTmpl(),
                buttons: this.generatePopupButtons(reportItem),
                openCallback: function () {
                    if ('text' == reportItem.type) {
                        reportItem.renderAfter();
                    }
                }
            });

            //디자인 요청사항
            if (CONSTANTS.TYPE_CARD == reportItem.type) {
                $('#gpopupLayer').css('width', '');
            }
        },

        _filterItem: function (event) {
            event.stopPropagation();

            var rid = $(event.target).closest('.report_card').attr('item-rid');
            var reportItem = this.getReportItem(rid);
            var self = this;

            $.goPopup({
                pclass: 'layer_normal layer_reader go_renew',
                headerHtml: '',
                buttons: [{
                    btype: 'confirm',
                    btext: lang['save'],
                    autoclose: false,
                    callback: function (popupEl) {
                        if (reportItem.reload_filter()) {
                            self.saveEnabled();
                            popupEl.close();
                        }
                    }
                }]
            });

            $('#popupContent').append(reportItem.getFilterTmpl());
        },

        _copyItem: function (event) {
            var sourceRid = $(event.target).closest('.report_card').attr('item-rid');
            var sourceReportItem = this.getReportItem(sourceRid);
            var itemTemplate = $('div[item-rid=' + sourceReportItem.rid + ']');

            var targetRid = ClientIdGenerator.generate();
            var type = sourceReportItem.type;
            var width = itemTemplate.attr('data-gs-width');
            var height = itemTemplate.attr('data-gs-height')

            this.grid.addWidget(ReportItemTemplate({
                    rid: targetRid,
                    type: type,
                    minWidth: CONSTANTS.ITEM_SIZE.minWidth[type],
                    minHeight: CONSTANTS.ITEM_SIZE.minHeight[type],
                    width: width,
                    height: height
                }), null, null, width, height, CONSTANTS.ITEM_SIZE.minWidth[type], CONSTANTS.ITEM_SIZE.maxWidth[type],
                CONSTANTS.ITEM_SIZE.minWidth[type], CONSTANTS.ITEM_SIZE.minHeight[type],
                CONSTANTS.ITEM_SIZE.maxHeight[type], null);

            var targetReportItem = this.getReportItem(targetRid);
            targetReportItem.toObject({
                'data': sourceReportItem.toJSON()
            });
            targetReportItem.render();
            this.saveEnabled();
        },

        _deleteItem: function () {
            var rid = $(event.target).closest('.report_card').attr('item-rid');
            var self = this;

            $.goConfirm(commonLang['삭제하시겠습니까?'], '', function () {
                self.grid.removeNode(rid);
                self._deleteReportItem(rid);
                self.grid._triggerEvent('change');

                if (self.reportItemViews.length < 1) {
                    self.$('#wrap_report_null').show();
                }
            });
        },

        createItemView: function (item, type) {
            var contentWrap = $(item.el).children().get(1);
            var rid = $(item.el).attr('item-rid');

            if (CONSTANTS.TYPE_CHART == type) {
                return this._createChartItemView(contentWrap, rid);
            } else if (CONSTANTS.TYPE_CARD == type) {
                return this._createCardItemView(contentWrap, rid);
            } else if (CONSTANTS.TYPE_TEXT == type) {
                $(item.el).find('[btn-filter-wrap]').hide();
                return this._createTextItemView(contentWrap, rid);
            } else if (CONSTANTS.TYPE_IMAGE == type) {
                $(item.el).find('[btn-filter-wrap]').hide();
                return this._createImageItemView(contentWrap, rid);
            } else if (CONSTANTS.TYPE_DATA == type) {
                return this._createTableItemView(contentWrap, rid);
            }
        },

        createEvent: function (grid) {
            var self = this;

            grid.on('change', function (event, items, options) {
                self.saveEnabled();

                _.forEach(items, function (item) {
                    if (CONSTANTS.TYPE_CARD === item.type) {
                        var reportItem = self.getReportItem(item.rid);
                        reportItem.autoResize();
                    }
                });
            }, self);

            grid.on('added', function (event, items, options) {
                this.$('#wrap_report_null').hide();

                _.forEach(items, function (item) {
                    var _el = $(item.el);
                    _el.addClass('report_card');
                    _el.prepend(SelectTemplate.render());

                    var type = _el.attr('grid-type');
                    var itemView = self.createItemView(item, type);
                    if (!itemView) {
                        return;
                    }

                    if (!$(item.el).attr('item-rid')) {
                        itemView.render();
                    }

                    item.rid = itemView.getRid();
                    item.type = type;
                    _el.attr('item-rid', itemView.getRid());
                    _el.children('.edit_tool').hide();
                    _el.css('position', '');

                    self.addWidgetClickEvent(item.el);
                    self.reportItemViews.push(itemView);
                }, self);
            });

            $('.newWidget').draggable({
                revert: 'invalid',
                scroll: false,
                appendTo: 'body',
                helper: 'clone'
            });
        },

        _initBackdrop: function (event) {
            this.backdropToggleEl = $(event.target).closest('.newWidget');
            $(this.backdropToggleEl).find('.edit_tool').show();
            $(this.backdropToggleEl).addClass('card_edit');

            $(document).on("backdrop." + this.cid, $.proxy(function (e) {
                if ($(e.relatedTarget).closest(this.backdropToggleEl).length > 0) { // backdrop 영역인경우.
                    return;
                }

                this._clearBackdrop();
            }, this));
        },

        _clearBackdrop: function () {
            $(this.backdropToggleEl).find('.edit_tool').hide();
            $(this.backdropToggleEl).removeClass('card_edit');
            $(document).off("backdrop." + this.cid);
        },

        addWidgetClickEvent: function (widget) {
            var self = this;
            widget.onclick = function (event, items, options) {
                if (isReadOnly) {
                    return;
                }

                if ($(this).find('.edit_tool').is(':visible')) {
                    return;
                }

                self._clearBackdrop();
                self._initBackdrop(event);
            }
        },

        generatePopupButtons: function (reportItem) {
            var self = this;
            var btnCollection = [{
                btype: 'confirm',
                btext: lang['save'],
                autoclose: false,
                callback: function (popupEl) {
                    if (reportItem.reload_setting()) {
                        self.saveEnabled();
                        popupEl.close();
                    }
                }
            }];

            if ('text' == reportItem.type) {
                var cancelButton = {
                    btype: 'cancel',
                    btext: lang['cancel'],
                    callback: function (popupEl) {
                        self.saveEnabled();
                        popupEl.close();
                    }
                }
                btnCollection.push(cancelButton);
            }
            return btnCollection;
        },

        addItem : function (type) {
            var rid = ClientIdGenerator.generate();
            var width = CONSTANTS.ITEM_SIZE.width[type];
            var height = CONSTANTS.ITEM_SIZE.height[type];
            var bottomHeight = this._getDocBottomHeight(width);

            this.grid.addWidget(ReportItemTemplate({
                    type: type,
                    rid: rid,
                    height: height,
                    width: width,
                    minWidth: CONSTANTS.ITEM_SIZE.minWidth[type],
                    minHeight: CONSTANTS.ITEM_SIZE.minHeight[type]
                }), 0, bottomHeight, width, height, false, CONSTANTS.ITEM_SIZE.minWidth[type],
                CONSTANTS.ITEM_SIZE.maxWidth[type], CONSTANTS.ITEM_SIZE.minHeight[type],
                CONSTANTS.ITEM_SIZE.maxHeight[type], rid);

            var reportItem = this.getReportItem(rid);
            reportItem.render();
            $(window).scrollTop(70 + bottomHeight * 50);
            this.saveEnabled();
        },

        _getDocBottomHeight: function(width) {
            var self = this;
            var bottomItem = _.max(this.grid.getAll(), function (node) {
                if (!self.getReportItem(node.rid)) {
                    return 0;
                }

                if (!width || width <= node.x) {
                    return 0;
                }

                return node.y + node.height;
            });

            return bottomItem.height + bottomItem.y;
        },

        saveDisabled: function () {
            this.isChanged = false;
            $('a[el-save]').css('background', '#ddd');
        },

        saveEnabled: function () {
            this.isChanged = true;
            $('a[el-save]').css('background', '');
        },

        isSaveDisabled: function () {
            return !this.isChanged;
        }
    });


    function myClone(event) {
        return event.target.cloneNode(true);
    }

    function toggleFloat(button, i) {
        grids[i].float(!grids[i].getFloat());
        button.innerHTML = 'float: ' + grids[i].getFloat();
    }

    function compact(i) {
        grids[i].compact();
    }
})


