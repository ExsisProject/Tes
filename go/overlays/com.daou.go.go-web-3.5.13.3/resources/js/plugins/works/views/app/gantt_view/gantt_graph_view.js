define('works/views/app/gantt_view/gantt_graph_view', function (require) {
    var GO = require('app');
    var _ = require('underscore');
    var Backbone = require('backbone');

    var commonLang = require("i18n!nls/commons");
    var calLang = require('i18n!calendar/nls/calendar');

    require("jquery.ganttView");

    var TOTAL_PROGRESS_HEIGHT = 40;
    var BORDER_BUFFER = 2;

    return Backbone.View.extend({ //GanttGraphView
        initialize: function (options) {
            this.options = options || {};
            this.appletId = this.options.appletId;
            this.ganttViewModel = this.options.ganttViewModel;
            this.ganttTreeNodes = this.options.ganttTreeNodes;
        },
        render: function () {
            var self = this;
            var height = this._getGraphHeight();

            $("#gantt_list_config").height(height - TOTAL_PROGRESS_HEIGHT);
            var $gantt_graph = $("#gantt_graph").empty();
            this.opts = $gantt_graph.ganttView({
                data: this._getGanttData(),
                contentHeight: height,
                weekday: getWeekday()
            });

            this._unbindEvent();
            this._bindEvent();

            setTimeout(function () {
                self.showToday();
            }, 100);

            function getWeekday() {
                if (GO.locale != 'en' && GO.locale != 'vi') {
                    return [calLang["일"], calLang["월"], calLang["화"], calLang["수"], calLang["목"], calLang["금"], calLang["토"]];
                }
            }
        },
        _unbindEvent: function () {
            $('#gantt_list_config, #gantt_graph_contents').off('scroll');
            $(".ganttview-slide-container").off('scroll');
            $(".bookmark").off('click');
            $("#gantt_graph_contents .ganttview-block").off('mouseenter');
        },
        _bindEvent: function () {
            this._bindListGraphScrollSyncEvent();
            this._bindResizeEvent();
            this._bindBookmarkEvent();
            this._bindBehaviorEvent();
        },
        _bindListGraphScrollSyncEvent: function () {
            var timeout;
            $('#gantt_list_config, #gantt_graph_contents').on("scroll", function callback() {
                clearTimeout(timeout);
                var source = $(this);
                var target = $(source.is("#gantt_list_config") ? '#gantt_graph_contents' : '#gantt_list_config');

                target.off("scroll").scrollTop(source.scrollTop());
                timeout = setTimeout(function () {
                    target.on("scroll", callback);
                }, 100);
            });
        },
        _bindResizeEvent: function () {
            $(window).on('resize.gantt', _.bind(function () {
                this._setListAndGraphHeight();
                $("#side").trigger("resetFilterHeight");
            }, this));
        },
        _bindBookmarkEvent: function () {
            $(".ganttview-slide-container").on('scroll', $.proxy(function () {
                this.renderBookmarks();
            }, this));

            $(".bookmark").on('click', $.proxy(function (e) {
                this._onClickBookmark(e);
            }, this));
        },

        renderBookmarks: function () {
            var blocks = $(".ganttview-block");
            var $container = $(".ganttview-slide-container");
            _.each(blocks, function (block) {
                var leftBookmarkEl = $(block).parent().find(".bookmark.left");
                var rightBookmarkEl = $(block).parent().find(".bookmark.right");
                if (isHiddenLeftByScroll($(block), $container)) {
                    leftBookmarkEl.show();
                    leftBookmarkEl.css('margin-left', $container.scrollLeft());
                } else {
                    leftBookmarkEl.hide();
                }
                if (isHiddenRightByScroll($(block), $container)) {
                    rightBookmarkEl.show();
                    rightBookmarkEl.css('margin-left', $container.scrollLeft() + $container.width() - rightBookmarkEl.width());
                } else {
                    rightBookmarkEl.hide();
                }
            });

            function isHiddenLeftByScroll($block, $container) {
                return ($block.offset().left + $block.width()) < $container.offset().left;
            }

            function isHiddenRightByScroll($block, $container) {
                return $block.offset().left > ($container.offset().left + $container.width());
            }
        },
        _bindBehaviorEvent: function () {
            var self = this;
            var resizeableDirection = this._getResizableDirection();
            _.extend(this.opts, {
                behavior: {
                    clickable: false,
                    resizableDirection: resizeableDirection,
                    resizable: resizeableDirection != '',
                    draggable: resizeableDirection === 'e,w',
                    onResize: function (data) {
                        return self._updateDocDates(data)
                    },
                    onDrag: function (data) {
                        return self._updateDocDates(data)
                    }
                }
            });

            $("#gantt_graph_contents .ganttview-block").mouseenter(function () {
                if (!$(this).hasClass("ui-resizable")) {
                    $(this).ganttView("applyBehavior", self.opts);
                }
            });
        },
        _onClickBookmark: function (e) {
            var $currentTarget = $(e.currentTarget);
            var $target = $currentTarget.parent().find(".ganttview-block");
            this._moveScrollToTarget($target);
        },
        _setListAndGraphHeight: function () {
            var height = this._getGraphHeight();
            $("#gantt_list_config").height(height - TOTAL_PROGRESS_HEIGHT);
            $("#gantt_graph_contents").height(height);
            $(".ganttview-hzheader-days.week .ganttview-hzheader-day").height(height);
        },
        _getGraphHeight: function () {
            var totalHeight = window.innerHeight;
            if (!GO.isAdvancedTheme()) {
                totalHeight -= $(".go_header_advanced").outerHeight(true);
            }
            totalHeight -= $(".content_top").outerHeight(true);
            _.each($(".content_page > div").not(".container_gantt"), function (el) {
                totalHeight -= $(el).outerHeight(true);
            });
            var $listHeader = $("#gantt_list").find('.tb-header');
            var isHeaderVisible = $listHeader && $listHeader.is(":visible");
            totalHeight -= (isHeaderVisible ? $listHeader.height() : this.opts.cellHeight * 3 + BORDER_BUFFER);
            return totalHeight - 6;
        },
        _getGanttData: function () {
            var ganttData = [];
            var liRows = $('#gantt_list_config li.node');
            if (liRows.length == 0) {
                return [];
            }
            _.each(liRows, function (li) {
                var row = {
                    type: $(li).attr('data-type'),
                    id: parseInt($(li).attr('data-id')),
                    series: []
                };
                var series = {};
                if (row.type != "GROUP") {
                    var start = convertToDate($(li).find('.startdate').text());
                    var end = convertToDate($(li).find('.enddate').text());
                    row.name = $(li).find('.board_name').text();
                    series.id = $(li).data('id');
                    series.name = $(li).find('.board_name').text();
                    series.start = start > end ? null : start;
                    series.end = start > end ? null : end;
                    series.user = $(li).find('.user').text();
                    series.progress = parseInt($(li).find('.progress').text());
                    series.status_name = $(li).attr('status-name');
                    series.status_color = $(li).attr('status-color');
                    series.parent_id = $(li).attr('parent-id');
                    series.doc_id = $(li).attr('doc-id');
                } else {
                    row.name = $(li).find('.folder_name').text().trim();
                    series.name = $(li).find('.folder_name').text().trim();
                    series.start = null;
                    series.end = null;
                }
                row.series.push(series);
                ganttData.push(row);
            });
            return ganttData;

            function convertToDate(dateStr) {
                if (dateStr == '-') return null;
                var ymd = dateStr.split('-');
                return new Date(ymd[0], parseInt(ymd[1]) - 1, ymd[2])
            }
        },
        _getResizableDirection: function () {
            var direction = [];
            if (isChangeableCid(this.ganttViewModel.endFieldCid)) {
                direction.push("e");
            }
            if (isChangeableCid(this.ganttViewModel.startFieldCid)) {
                direction.push("w");
            }
            return direction.join(','); //e,w

            function isChangeableCid(cid) {
                return cid != "create_date" && cid != "update_date";
            }
        },
        _updateDocDates: function (data) {
            var node = this._getNodeById(this.ganttTreeNodes, data.id);
            var oldDocModel = node.appletDocModel;
            var oldStartFieldValue = oldDocModel.values[this.ganttViewModel.startFieldCid];
            var oldEndFieldValue = oldDocModel.values[this.ganttViewModel.endFieldCid];
            var updateModel = {};
            updateModel[this.ganttViewModel.startFieldCid] = convertByFieldType(oldStartFieldValue, data.start);
            updateModel[this.ganttViewModel.endFieldCid] = convertByFieldType(oldEndFieldValue, data.end);
            var deferred = $.Deferred();
            $.ajax({
                type: "PUT",
                dataType: "json",
                contentType: "application/json",
                url: GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/" + data.doc_id + "/values",
                data: JSON.stringify({values: updateModel}),
                success: $.proxy(function (resp) {
                    deferred.resolve();
                    $.goSlideMessage(commonLang["수정되었습니다."]);
                    GO.EventEmitter.trigger('ganttTree', 'refresh:dates', data);
                }, data),
                error: function (resp) {
                    deferred.reject();
                    $.goError(resp.responseJSON.message);
                }
            });
            return deferred;

            function convertByFieldType(oldFieldValue, date) {
                if (oldFieldValue.indexOf('T') > 0) {
                    return [moment(date).format("YYYY-MM-DD"), oldFieldValue.split('T')[1]].join('T');
                }
                return moment(date).format("YYYYMMDD");
            }
        },
        _getNodeById: function (nodes, nodeId) {
            var self = this;
            var returnNode;
            _.each(nodes, function (node) {
                if (node.nodeType == "GROUP") {
                    var childNode = self._getNodeById(node.children, nodeId);
                    if (childNode) {
                        returnNode = childNode;
                        return false;
                    }
                } else if (node.id == nodeId) {
                    returnNode = node;
                    return false;
                }
            });
            return returnNode;
        },

        _indicateToday: function ($todayEl) {
            var todayIndicator = $("<div></div>").addClass("indicator_today").css("left", $todayEl[0].offsetLeft);
            $(".ganttview-slide-container").append(todayIndicator);
        },
        _moveScrollToTarget: function ($target) {
            var $slideEl = $(".ganttview-slide-container");
            var offset = $target.offset().left - $slideEl.offset().left + $slideEl.scrollLeft();
            $slideEl.scrollLeft(offset - $slideEl.width() / 2);
        },
        showToday: function () {
            var $todayEl = $(".ganttview-hzheader-days .today");
            if ($(".indicator_today").length == 0) {
                this._indicateToday($todayEl);
            }
            this._moveScrollToTarget($todayEl);
        }
    });
});