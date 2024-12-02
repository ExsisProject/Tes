define('works/views/app/workflow_graph', function (require) {
    var Backbone = require('backbone');
    require("mxgraph.mxClient");

    var FlowItemView = require("works/views/app/workflow_flow_item");
    var StatItemView = require("works/views/app/workflow_stat_item");

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var adminLang = require("i18n!admin/nls/admin");
    var lang = {
        "드래그 메시지": worksLang["해당 영역을 잡고 이동 시 순서를 변경할 수 있습니다."]
    };

    var SortItemTpl = require("hgn!works/templates/app/workflow_stat_sort_item");

    var STATE_WIDTH = 80;
    var STATE_HEIGHT = 25;
    var STATE_CREATE_X = 190;
    var STATE_CREATE_Y = 300;
    var STATE_LABEL_MAX_SIZE = 6;
    var MAX_GEOGRAPH_X = window.innerWidth - 470;

    return Backbone.View.extend({
        editor: null,
        graph: null,

        initialize: function () {
            if (!mxClient.isBrowserSupported()) {
                mxUtils.error('Browser is not supported!', 200, false);
                return;
            }
        },

        render: function () {
            editor = createEditor();
            graph = createGraph();
            createActions(graph);
            jQuery(window).trigger('resize');
            $('#workflow_sort_layer').sortable();
        },

        addStat: function (stat) {
            if (!isValidVertex(stat.name)) {
                return false;
            }

            var parent = graph.getDefaultParent();
            var vertex = graph.insertVertex(parent, null, stat, STATE_CREATE_X, STATE_CREATE_Y - 100, STATE_WIDTH,
                STATE_HEIGHT, 'process');
            createStatSortItem(stat, vertex);
            return true;
        },

        drawJsonData: function (stats, transitions, template, startNoti, rules) {
            var parent = graph.getDefaultParent();
            var model = graph.getModel();
            ROLES = rules;

            model.beginUpdate();
            try {
                var jumpFlowCount = 0;
                var reversFlowCount = 0;
                var start = {
                    geometryX: STATE_CREATE_X,
                    geometryY: STATE_CREATE_Y
                };

                setByTemplate(stats, transitions, start, template);
                stats.forEach(function (stat, idx) {
                    stat.seq = idx;
                });

                stats.forEach(function (stat) {
                    drawVertex(stat, stats, transitions);
                });

                transitions.forEach(function (transition) {
                    var source = model.getCellByName(transition.beforeStatus);
                    var target = model.getCellByName(transition.nextStatus);

                    if (!source || !target) {
                        return;
                    }

                    var edge = graph.insertEdge(parent, transition.id, transition, source, target);
                    if (!edge) {
                        return;
                    }

                    var flowWeight = source.id - target.id;

                    //사용자 커스텀 링크인 경우 저장된 좌표값에 따라 그려준다.
                    if (transition.geometryX && transition.geometryY) {
                        edge.geometry.points = [];

                        for (var i = 0; i < transition.geometryX.length; i++) {
                            edge.geometry.points.push(new mxPoint(transition.geometryX[i], transition.geometryY[i]));
                        }
                    } else if (flowWeight < -1) {
                        var geometry = source.geometry;
                        edge.geometry.points = [];
                        edge.geometry.points.push(new mxPoint(geometry.x + geometry.width / 2,
                            geometry.y + geometry.height / 2 + 40 * ++jumpFlowCount));
                    } else if (0 < flowWeight) {
                        var geometry = source.geometry;
                        edge.geometry.points = [];
                        edge.geometry.points.push(new mxPoint(geometry.x + geometry.width / 2,
                            geometry.y + geometry.height / 2 - 40 * ++reversFlowCount));
                    }
                });

                var startCell = graph.insertVertex(parent, null, 'start', start.geometryX, start.geometryY,
                    STATE_WIDTH, STATE_HEIGHT, 'start');
                var nextCell = model.getCellByName(startNoti['nextStatus']);
                if (nextCell) {
                    graph.insertEdge(parent, null, startNoti, startCell, nextCell);
                }

                jQuery('#workflow_sort_layer').html(
                    jQuery('#workflow_sort_layer li').sort(function(a, b) {
                        return $(a).attr('stat-idx') - $(b).attr('stat-idx');
                    })
                );
            } finally {
                model.endUpdate();
            }
        },

        isValidData: function () {
            if (jQuery('#workflow_properties [type=text]').length > 0) {
                $.goError(worksLang['수정사항이 반영되지 않았습니다']);
                return false;
            }

            var cells = getAllCell(graph.getModel());
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];

                if (cell.isEdge() && !cell.isStartFlow() && !isValidEdge(cell.getAttribute('actionName'))) {
                    return false;
                }
            }
            return true;
        },

        getTemplate: function () {
            var model = graph.getModel();
            var templates = [];

            getAllCell(model).forEach(function (cell) {
                var template = {};

                if (cell.isVertex()) {
                    template.type = 'stat';
                    template.name = cell.getAttribute('name');
                    template.geometryX = cell.geometry.x;
                    template.geometryY = cell.geometry.y;
                    templates.push(template);
                } else if (cell.isEdge()) {
                    var points = cell.getGeometry().points;
                    template.type = 'transition';
                    template.beforeStatus = cell.source.getAttribute('name');
                    template.nextStatus = cell.target.getAttribute('name');
                    if (points) {
                        template.geometryX = [];
                        template.geometryY = [];

                        _.forEach(points, function (point) {
                            template.geometryX.push(point.x);
                            template.geometryY.push(point.y);
                        });
                    }

                    templates.push(template);
                }
            });

            return templates;
        },

        getStats: function () {
            var model = graph.getModel();
            var stats = [];
            getAllVertexsWithOutStartCell(model).forEach(function (cell) {
                var stat = cell.getAttributes();
                stat.seq = getStatSortItemIndex(cell.getAttribute('name'));
                var edges = cell.edges;

                stat.start = false;
                if (edges) {
                    edges.forEach(function (edge) {
                        if (edge.isStartFlow()) {
                            stat.start = true;
                        }
                    });
                }
                stats.push(stat);
            });

            return stats.sort(function(a, b) {return a.seq - b.seq});
        },

        getTransitions: function () {
            var model = graph.getModel();
            var transitions = [];
            getAllEdges(model).forEach(function (cell) {
                if (cell.isStartFlow()) {
                    return;
                }

                var transition = cell.getAttributes();
                transition.beforeStatus = cell.source.getAttribute('name');
                transition.nextStatus = cell.target.getAttribute('name');
                transitions.push(transition);
            });

            return transitions;
        },

        getFirstFlow: function () {
            var model = graph.getModel();
            var cell = _.find(getAllCell(model), function (cell) {
                return cell.isStartFlow();
            });

            if (cell) {
                var pushRoles = cell.getAttribute('pushRoles');
                if (pushRoles) {
                    return pushRoles.split(',');
                } else {
                    pushRoles = [];
                }
                return pushRoles;
            }
        },

        disabled: function () {
            if (!graph.enabled) {
                return;
            }
            graph.enabled = false;
        },

        enabled: function () {
            if (graph.enabled) {
                return;
            }

            graph.enabled = true;
        }
    });

    function setByTemplate(stats, transitions, start, jsonData) {
        if (!jsonData) {
            return;
        }

        var templates = JSON.parse(jsonData);
        if (!templates) {
            return;
        }

        templates.forEach(function (template) {
            if ('stat' == template.type) {
                if (!template.name) {
                    start.geometryX = template.geometryX;
                    start.geometryY = template.geometryY;
                    return;
                }

                _.forEach(stats, function (stat) {
                    if (template.name == stat.name) {
                        stat.geometryX = template.geometryX;
                        stat.geometryY = template.geometryY;
                        return;
                    }
                });
            } else if ('transition' == template.type) {
                _.forEach(transitions, function (transition) {
                    if (transition.beforeStatus == template.beforeStatus && template.nextStatus == transition.nextStatus) {
                        transition.geometryX = template.geometryX;
                        transition.geometryY = template.geometryY;
                    }
                });
            }
        });
    }

    function createEditor() {
        var container = document.getElementById('graphContainer');

        var editor = new mxEditor();
        editor.setGraphContainer(container);
        return editor;
    }

    function createGraph() {
        var graph = editor.graph;
        var model = graph.getModel();

        graph.border = 80;
        graph.getView().translate = new mxPoint(graph.border / 2, graph.border / 2);
        graph.graphHandler.setRemoveCellsFromParent(false);
        graph.alternateEdgeStyle = 'elbow=vertical';

        graph.setPanning(true);
        graph.setTooltips(true);
        graph.setConnectable(true);
        graph.setAllowDanglingEdges(false);
        graph.setDropEnabled(true);
        graph.setSplitEnabled(false);
        graph.view.setTranslate(20, 20);
        graph.panningHandler.useLeftButtonForPanning = true;
        mxGraphHandler.prototype.guidesEnabled = true;

        setMouseListener(graph);


        //드래그 그랍 가능한 종단 노드인지 검증
        graph.isValidTarget = function (target) {
            if (target.isEdge()) {
                return false;
            }

            if (this.isSwimlane(target)) {
                return false;
            }

            if (target.isStartCell()) {
                return false;
            }

            return true;
        };

        graph.isValidConnection = function (source, target) {
            if (!this.isValidTarget(target)) {
                return false;
            }

            if (source.isStartCell() && source.getEdgeCount() > 0) {
                $.goError(worksLang['시작 상태는 1개만 선택할 수 있습니다.']);
                return false;
            }

            if (isDuplicateLink(source, target)) {
                $.goError(worksLang['상태 흐름은 동일한 시작상태와 다음상태를 가질 수 없습니다.']);
                return false;
            }

            return true;
        };

        // Adds new method for identifying a pool
        graph.isPool = function (cell) {
            var parent = model.getParent(cell);
            return parent != null && model.getParent(parent) == model.getRoot();
        };

        //select change evt
        graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
            selectionChanged();
        });

        //Graph에 표현되는 Cell 이름 변경이벤트 정의
        mxGraph.prototype.convertValueToString = function (cell) {
            if (mxUtils.isNode(cell.value)) {
                var name = '';
                if (cell.isEdge()) {
                    name = cell.getAttribute('actionName');
                } else {
                    name = cell.getAttribute('name');
                }
            } else if ('start' == cell.style) {
                name = 'START';
            }
            return name;
        };

        mxGraph.prototype.getLabel = function(cell) {
            var label = (this.labelsVisible) ? this.convertValueToString(cell) : '';
            var geometry = this.model.getGeometry(cell);

            if (label == null || geometry == null) {
                return label;
            }

            if (!this.model.isCollapsed(cell) && STATE_LABEL_MAX_SIZE < label.length && (geometry.offset == null ||
                (geometry.offset.x == 0 && geometry.offset.y == 0)) && this.model.isVertex(cell) && geometry.width >= 2) {
                return label.substring(0, STATE_LABEL_MAX_SIZE - 1) + '...';
            }
            return label;
        };

        mxCellEditor.prototype.startEditing = function(cell, trigger) {
            return;
        };

        mxConstraintHandler.prototype.pointImage = new mxImage('/resources/images/dot.gif', 3, 3);
        mxGraph.prototype.createVertex = function (parent, id, value, x, y, width, height, style, relative) {
            var model = graph.getModel();
            cells = getAllVertexs(model);

            if (cells) {
                for (var i = 0; i < cells.length; i++) {
                    if ((cells[i].geometry.x == x) && (cells[i].geometry.y == y)) {
                        x += 200

                        if (x > MAX_GEOGRAPH_X) {
                            x = 200;
                            y += 100;
                        }

                        return vertex = graph.insertVertex(parent, id, value, x, y, width, height, style, relative);
                    }
                }
            }

            var geometry = new mxGeometry(x, y, width, height);
            geometry.relative = (relative != null) ? relative : false;

            // Creates the vertex
            var vertex = new mxCell(value, geometry, style);
            vertex.setId(id);
            vertex.setVertex(true);
            vertex.setConnectable(true);

            if ('process' == style) {
                vertex.value = createAttributes(value);
                setColor(vertex);
            }

            return vertex;
        };

        mxGraph.prototype.insertEdge = function (parent, id, value, source, target, style) {
            var edge = this.createEdge(parent, id, value, source, target, style);
            return this.addEdge(edge, parent, source, target, '', value);
        };

        mxGraph.prototype.addEdge = function (edge, parent, source, target, index, value) {
            if (!value) {
                value = {};
            }

            if (isDuplicateLink(source, target)) {
                return;
            }

            edge.value = createAttributes(value);
            return this.addCell(edge, parent, index, source, target);
        };

        mxCell.prototype.getAttribute = function (name, defaultValue) {
            var userObject = this.getValue();
            var val = (userObject != null && userObject.nodeType == mxConstants.NODETYPE_ELEMENT) ?
                userObject.getAttribute(name) : null;

            if (_.startsWith(name, 'is')) {
                return 'true' == val;
            }

            return (val != null) ? val : defaultValue;
        };

        mxCell.prototype.getAttributes = function () {
            var result = {};
            var cell = this;
            getAttributeNames(this).forEach(function (name) {
                if (name.indexOf('Roles') >= 0) {
                    result[name] = [];
                    cell.getAttribute(name).split(',').forEach(function (role) {
                        result[name].push(role);
                    });

                    return;
                }

                result[name] = cell.getAttribute(name);
            });

            return result;
        };

        mxCell.prototype.isStartCell = function () {
            return this.style == 'start';
        };

        mxCell.prototype.isStartFlow = function () {
            if (!this.isEdge()) {
                return false;
            }

            var source = this.source;
            if (!source) {
                return false;
            }

            return source.isStartCell();
        };

        mxCell.prototype.getTop = function () {
            if (this.isEdge() && this.geometry.points) {
                var top = 1000;

                _.map(this.geometry.points, function (geometry) {
                    if (geometry.y < top) {
                        top = geometry.y;
                    }
                });
                return top;
            } else if (this.isVertex() && this.geometry) {
                return this.geometry.y;
            }
            return 0;
        }

        mxCell.prototype.getBottom = function () {
            if (this.isEdge() && this.geometry.points) {
                var bottom = 0;

                _.map(this.geometry.points, function (geometry) {
                    if (bottom < geometry.y) {
                        bottom = geometry.y;
                    }
                });
                return bottom;
            } else if (this.isVertex() && this.geometry) {
                return this.geometry.y;
            }
            return 0;
        }

        mxCell.prototype.getLeft = function () {
            if (this.isEdge() && this.geometry.points) {
                var left = 1000;

                _.map(this.geometry.points, function (geometry) {
                    if (geometry.x < left) {
                        left = geometry.x;
                    }
                });
                return left;
            } else if (this.isVertex() && this.geometry) {
                return this.geometry.x;
            }
            return 0;
        }

        mxCell.prototype.getRight = function () {
            if (this.isEdge() && this.geometry.points) {
                var right = 0;

                _.map(this.geometry.points, function (geometry) {
                    if (right < geometry.x) {
                        right = geometry.x;
                    }
                });
                return right;
            } else if (this.isVertex() && this.geometry) {
                return this.geometry.x + this.geometry.width;
            }
            return 0;
        }

        mxGraphModel.prototype.getCellByName = function (name) {
            var cells = getAllCell(this);
            if (cells == null) {
                return null;
            }

            return _.find(cells, function (cell) {
                return name == cell.getAttribute('name');
            });
        };

        mxGraphModel.prototype.getCellByTypeAndId = function (type, id) {
            var cells = getAllCell(this);
            if (cells == null) {
                return null;
            }

            for (var i = 0; i < cells.length; i++) {
                if (cell.isVertex() && 'vertex' != type) {
                    continue;
                }

                if (cell.isEdge() && 'edge' != type) {
                    continue;
                }

                if (id == cells[i].getAttribute('id')) {
                    return cells[i]
                }
            }

            return null;
        };

        mxShape.prototype.constraints = [
            //new mxConnectionConstraint(new mxPoint(0.25, 0), true),
            new mxConnectionConstraint(new mxPoint(0.5, 0), true),
            //new mxConnectionConstraint(new mxPoint(0.75, 0), true),
            //new mxConnectionConstraint(new mxPoint(0, 0.25), true),
            new mxConnectionConstraint(new mxPoint(0, 0.5), true),
            //new mxConnectionConstraint(new mxPoint(0, 0.75), true),
            //new mxConnectionConstraint(new mxPoint(1, 0.25), true),
            new mxConnectionConstraint(new mxPoint(1, 0.5), true),
            //new mxConnectionConstraint(new mxPoint(1, 0.75), true),
            //new mxConnectionConstraint(new mxPoint(0.25, 1), true),
            new mxConnectionConstraint(new mxPoint(0.5, 1), true),
            //new mxConnectionConstraint(new mxPoint(0.75, 1), true)
        ];

        mxGraph.prototype.getAllConnectionConstraints = function (terminal, source) {
            if (terminal.cell.isEdge()) {
                return;
            }

            if (terminal != null && terminal.shape != null) {
                if (terminal.shape.stencil != null) {
                    if (terminal.shape.stencil.constraints != null) {
                        return terminal.shape.stencil.constraints;
                    }
                } else if (terminal.shape.constraints != null) {
                    return terminal.shape.constraints;
                }
            }

            return null;
        };

        mxIconSet.prototype.destroy = function () {
            if (this.images != null) {
                this.images.forEach(function (image) {
                    image.parentNode.removeChild(image);
                });
            }

            this.images = null;
        };

        var style = graph.getStylesheet().getDefaultVertexStyle();
        style = mxUtils.clone(style);
        style[mxConstants.STYLE_RESIZABLE] = '0';
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
        style[mxConstants.STYLE_STROKE_OPACITY] = 0;
        style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
        style[mxConstants.STYLE_FONTSIZE] = 13;
        style[mxConstants.STYLE_FONTSTYLE] = 1;
        style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_HORIZONTAL] = true;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
        graph.getStylesheet().putCellStyle('process', style);

        style = mxUtils.clone(style);
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
        style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_FILLCOLOR] = '#FFFFFF';
        style[mxConstants.STYLE_STROKE_OPACITY] = 100;
        style[mxConstants.STYLE_STROKECOLOR] = '#000000';
        style[mxConstants.STYLE_FONTCOLOR] = '#000000';
        delete style[mxConstants.STYLE_SPACING_RIGHT];
        graph.getStylesheet().putCellStyle('start', style);

        style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_EDGE] = mxEdgeStyle.SegmentConnector;
        style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
        style[mxConstants.STYLE_ROUNDED] = true;
        style[mxConstants.STYLE_FONTCOLOR] = '#656565';
        style[mxConstants.STYLE_STROKECOLOR] = '#cccccc';
        style[mxConstants.STYLE_FONTSIZE] = 12;
        style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#f4f4f4';

        graph.getStylesheet().putDefaultEdgeStyle(style);


        var layout = new mxStackLayout(graph, false);
        //layout.resizeParent = true;
        layout.fill = true;

        // Only update the size of swimlanes
        layout.isVertexIgnored = function (vertex) {
            return !graph.isSwimlane(vertex);
        }

        // Keeps the lanes and pools stacked
        var layoutMgr = new mxLayoutManager(graph);

        layoutMgr.getLayout = function (cell) {
            if (!model.isEdge(cell) && model.getChildCount(cell) > 0 &&
                (model.getParent(cell) == model.getRoot() || graph.isPool(cell))) {
                layout.fill = graph.isPool(cell);

                return layout;
            }

            return null;
        };

        //keybord evt
        var keyHandler = new mxKeyHandler(graph);
        keyHandler.getFunction = function (evt) {
            if (evt == null) {
                return;
            }

            if (evt.code == 'Delete' || evt.key == 'Del') {
                //cells는 빈 배열이라도 null을 리턴하지 않음.
                var cells = graph.getSelectionCells();
                var deleteCeslls = [];

                cells.forEach(function (cell) {
                    if (cell.isStartCell()) {
                        return;
                    }

                    deleteCeslls.push(cell);
                    if (cell.isVertex()) {
                        getStatSortItem(cell.getAttribute('name')).remove();
                    }
                })

                graph.removeCells(deleteCeslls);
                mxEvent.consume(evt);
            }
        };

        jQuery(window).resize(function () {
            jQuery('#graphContainer').css('height', $( window ).height() - 248);
        }) ;

        return graph;
    }

    function createActions(graph) {
        var $zoomActions = $("#zoomActions");
        $zoomActions.empty();
        var $zoomIn = $(mxUtils.button('+', function(){graph.zoomIn();}));
        $zoomIn.attr("title", commonLang["확대"]);
        $zoomActions.append($zoomIn);
        var $zoomOut = $(mxUtils.button('–', function(){graph.zoomOut();}));
        $zoomOut.attr("title", commonLang["축소"]);
        $zoomActions.append($zoomOut);

        $("a[btn-close-sort-wrap]").click(function () {
            $('#workflow_sort_wrap').hide();
        });

        $("button[btn-open-sort-wrap]").click(function () {
            $('#workflow_sort_wrap').show();
        });
    }

    function setMouseListener(graph) {
        var currentIconSet;
        graph.addMouseListener({
            cell: null,
            mouseUp: function(sender, me) {
                if (!me.state) {
                    if (currentIconSet && currentIconSet.images) {
                        currentIconSet.destroy();
                        currentIconSet = null;
                    }
                    return;
                }
                var img = currentIconSet.images[0];
                img.style.left = (me.state.x + me.state.width) + 'px';
                img.style.top = (me.state.y - 16) + 'px';
            },
            mouseDown: function(sender, me) {
                if (!me.state && currentIconSet) {
                    currentIconSet.destroy();
                    currentIconSet = null;
                } else if (me.state && !currentIconSet) {
                    currentIconSet = new mxIconSet(me.state);
                }
            },
            mouseMove: function(sender, me) {
                var cell = me.getCell();
                if (cell != this.cell) {
                    if (this.cell != null) {
                        this.dragLeave(me.getEvent(), this.cell);
                    }

                    this.cell = cell;

                    if (this.cell != null) {
                        this.dragEnter(me.getEvent(), this.cell);
                    }
                }
            },
            dragEnter: function(evt, cell) {
                if (graph.getSelectionCell() != null) {
                    return;
                }
                setEdgeHighlight(graph, cell);
            },
            dragLeave: function(evt, cell) {
                if (graph.getSelectionCell() != null) {
                    return;
                }

                clearEdgeHighlight(graph);

                if (currentIconSet != null) {
                    currentIconSet.destroy();
                    currentIconSet = null;
                }
            }
        });
    }

    function setEdgeHighlight(graph, cell) {
        var highlightStyle = "fontStyle=1;strokeWidth=2;strokeColor=#999999";
        var model = graph.getModel();
        model.beginUpdate();
        if (cell.edge) {
            model.execute(new mxStyleChange(model, cell, highlightStyle));
        } else {
            if (cell.edges && cell.edges.length > 0) {
                for (var i=0; i<cell.edges.length; i++) {
                    model.execute(new mxStyleChange(model, cell.edges[i], highlightStyle));
                }
            }
        }
        model.endUpdate();
    }

    function clearEdgeHighlight(graph) {
        var normalStyle = "fontStyle=0;strokeWidth=1;strokeColor=#cccccc";
        var model = graph.getModel();
        model.beginUpdate();
        if (model.cells) {
            for (var key in model.cells) {
                var cell = model.cells[key];
                if (cell.edge) {
                    model.execute(new mxStyleChange(model, cell, normalStyle));
                }
            }
        }
        model.endUpdate();
    }

    function mxIconSet(state) {
        if (!state || state.cell.isStartCell()) {
            return;
        }

        this.images = [];

        // Delete
        var img = mxUtils.createImage('/resources/images/ic_delete.png');
        img.setAttribute('title', 'Delete');
        img.style.position = 'absolute';
        img.style.cursor = 'pointer';
        img.style.width = '16px';
        img.style.height = '16px';
        img.style.left = (state.x + state.width) + 'px';
        img.style.top = (state.y - 16) + 'px';

        mxEvent.addGestureListeners(img, mxUtils.bind(this, function (evt) {
            mxEvent.consume(evt);
        }));

        mxEvent.addListener(img, 'click', mxUtils.bind(this, function (evt) {
            graph.removeCells([state.cell]);
            mxEvent.consume(evt);
            if (state.cell.isVertex()) {
                getStatSortItem(state.cell.getAttribute('name')).remove();
            }
            this.destroy();
        }));

        state.view.graph.container.appendChild(img);
        this.images.push(img);
    };

    function getAttributeNames(cell) {
        var attributes = [];
        cell.value.attributes.forEach(function (attribute) {
            attributes.push(attribute.name);
        });
        return attributes;
    }

    function selectionChanged() {
        var target = document.getElementById('workflow_properties');
        var cell = graph.getSelectionCell();

        clearEdgeHighlight(graph);

        if (mxClient.IS_IE) {
            jQuery('#workflow_properties [type=text]').focusout();
        } else {
            jQuery('#workflow_properties [type=text]').blur();
        }

        jQuery('#workflow_properties').hide();
        jQuery('#workflow_properties div').remove();

        if (cell != null && !cell.isStartCell()) {
            setEdgeHighlight(graph, cell);
            if (cell.isEdge()) {
                jQuery('#workflow_properties').show();
                flowAddOne.call(this, cell, target);
            } else {
                jQuery('#workflow_properties').show();
                statAddOne.call(this, cell);
            }

            var checkboxHandler = function (evt) {
                var attrName = evt.currentTarget.name;
                var attrValue = [];

                _.forEach(jQuery('input[name=' + attrName + ']'), function (checkbox) {
                    if (checkbox.checked) {
                        attrValue.push(checkbox.value);
                    }
                });

                var model = graph.getModel();
                model.beginUpdate();
                model.execute(new mxCellAttributeChange(cell, attrName, attrValue));
                model.endUpdate();
            }

            var applyHandler = function (evt) {
                var attrName = evt.currentTarget.name;
                var newValue = evt.currentTarget.value || '';
                var oldValue = cell.getAttribute(attrName);

                if (newValue != oldValue) {
                    if (cell.isVertex() && !isValidVertex(newValue)) {
                        return;
                    }

                    if (cell.isEdge() && !isValidEdge(newValue)) {
                        return;
                    }

                    var model = graph.getModel();
                    model.beginUpdate();
                    model.execute(new mxCellAttributeChange(cell, attrName, newValue));

                    var $item = getStatSortItem(oldValue);
                    $item.attr('stat-name', newValue);
                    $item.find('span.txt').text(getDisplayLabelName(newValue));

                    model.endUpdate();
                }
            };

            if (mxClient.IS_IE) {
                jQuery('#workflow_properties [type=checkbox]').change(this, checkboxHandler);
                jQuery('#workflow_properties [type=text]').focusout(this, applyHandler);
            } else {
                jQuery('#workflow_properties [type=checkbox]').change(this, checkboxHandler);
                jQuery('#workflow_properties [type=text]').blur(this, applyHandler);
            }
        }
    }

    function getStatSortItem(name) {
        return jQuery('#workflow_sort_layer li[stat-name="' + name + '"]');
    }

    function getStatSortItemIndex(name) {
        return jQuery('#workflow_sort_layer li[stat-name="' + name + '"]').index();
    }

    function getAllCell(model) {
        return Object.keys(model.cells).map(function (i) {
            return model.cells[i];
        });
    }

    function isAlreadyDrawNodByName(name) {
        var cell = _.find(getAllCell(graph.getModel()), function (cell) {
            return cell.getAttribute('name') == name;
        });

        return cell ? true : false;
    }

    function getAllEdges(model) {
        var cells = getAllCell(model);
        var result = [];

        if (!cells) {
            return result;
        }

        cells.forEach(function (cell) {
            if (cell.isEdge() && !cell.source.isStartCell()) {
                result.push(cell);
            }
        });

        return result;
    }

    function getAllVertexsWithOutStartCell(model) {
        var cells = getAllCell(model);
        var result = [];

        if (!cells) {
            return result;
        }

        cells.forEach(function (cell) {
            if (cell.isVertex() && !cell.isStartCell()) {
                result.push(cell);
            }
        });

        return result;
    }

    function getAllVertexs(model) {
        var cells = getAllCell(model);
        var result = [];

        if (!cells) {
            return result;
        }

        cells.forEach(function (cell) {
            if (cell.isVertex()) {
                result.push(cell);
            }
        });

        return result;
    }

    function createAttributes(node) {
        var doc = mxUtils.createXmlDocument();
        var attr = doc.createElement('node');

        Object.keys(node).forEach(function (attrName) {
            var attrValue = node[attrName];
            if (attrValue != 0 && !attrValue) {
                attrValue = '';
            }

            attr.setAttribute(attrName, attrValue);
        });

        return attr;
    }

    function isValidVertex(name) {
        if (!name) {
            $.goError(GO.i18n(worksLang["{{arg1}}은 필수입력 사항입니다."], {arg1: adminLang["상태명"]}));
            return false;
        }
        if (name.length < 2 || name.length > 20) {
            $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1: "2", arg2: "20"}));
            return false;
        }

        var vertex = _.find(getAllVertexsWithOutStartCell(graph.getModel()), function (vertex) {
            return name == vertex.getAttribute('name');
        });

        if (vertex) {
            $.goError(adminLang["이미 사용중인 이름입니다."]);
            return false;
        }

        return true;
    }

    function isValidEdge(name) {
        if (!name) {
            $.goError(GO.i18n(worksLang["{{arg1}}은 필수입력 사항입니다."], {arg1: worksLang["상태변경 버튼명"]}));
            return false;
        }
        if (name.length < 2 || name.length > 100) {
            $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1: "2", arg2: "100"}));
            return false;
        }

        return true;
    }

    function isDuplicateLink(source, target) {
        var model = graph.getModel();
        return _.find(getAllEdges(model), function (edge) {
            return edge.source == source && edge.target == target;
        });
    }

    function isReverseLink(source, target) {
        var model = graph.getModel();
        return _.find(getAllEdges(model), function (edge) {
            return edge.source == target && edge.target == source;
        });
    }

    function getNodeByName(nodes, name) {
        return _.find(nodes, function (node) {
            return name == node.name;
        });
    }

    function createVertex(stat) {
        var parent = graph.getDefaultParent();
        var vertex = graph.insertVertex(parent, stat.id, stat, stat.geometryX, stat.geometryY, STATE_WIDTH, STATE_HEIGHT, 'process');
        createStatSortItem(stat, vertex);
    }

    function createStatSortItem(stat, vertex) {
        stat.color = graph.getStylesheet().getCellStyle(vertex.getStyle())[mxConstants.STYLE_FILLCOLOR];
        stat.displayName = getDisplayLabelName(stat.name);
        jQuery('#workflow_sort_layer').append(SortItemTpl({"lang":lang, "stat":stat}));
    }

    function getDisplayLabelName(name) {
        if (name.length > STATE_LABEL_MAX_SIZE) {
            return name.substring(0, STATE_LABEL_MAX_SIZE - 1) + '...';
        }
        return name;
    }

    function drawVertex(stat, stats, transitions) {
        if (isAlreadyDrawNodByName(stat.name)) {
            return;
        }

        if (!stat.geometryX && !stat.geometryY) {
            stat.geometryX = 400;
            stat.geometryY = 300;
        }

        createVertex(stat);
        transitions.forEach(function (transition) {
            if (transition.beforeStatus == stat.name) {
                var target = getNodeByName(stats, transition.nextStatus);
                drawVertex(target, stats, transitions);
            }
        });
    }

    function statAddOne(cell) {
        var stat = cell.getAttributes();
        var statItemView = new StatItemView({
            graph: graph,
            cell: cell,
            model: stat,
            stats: getAllVertexsWithOutStartCell(graph.getModel()),
            setColor: setColor
        });
        this.$("#workflow_properties").append(statItemView.render().el);
        statItemView.$el.data("instance", stat);
        statItemView.on('changeStatName', this.xi, this);
    }

    function flowAddOne(cell, target, index) {
        var isFirst = graph.getSelectionCell().isStartFlow();
        var flow = cell.getAttributes();
        var flowItemView = new FlowItemView({
            model: flow,
            isFirst: isFirst,
            roles: isFirst ? _.reject(ROLES, function (role) {
                return role.value == "REGISTRANT"
            }) : ROLES,
            collection: this.stats,
            lang: this.lang
        });
        if (target) {
            this.$(target).append(flowItemView.render().el);
        } else {
            this.$("#workflow_properties").append(flowItemView.render().el);
        }

        flowItemView.$el.data("instance", flow);
    }

    function setColor(cell) {
        var style = graph.getModel().getStyle(cell);
        var color = getColorByCode(cell.getAttribute('color'));
        var newStyle = mxUtils.setStyle(style, mxConstants.STYLE_FILLCOLOR, color);
        var cells = [];
        cells.push(cell);

        getStatSortItem(cell.getAttribute('name')).find('span.state').css('background-color', color);
        graph.setCellStyle(newStyle, cells);
    }

    function getColorByCode(code) {
        if (1 == code) {
            return '#905341';
        } else if (2 == code) {
            return '#d06b64';
        } else if (3 == code) {
            return '#d75269';
        } else if (4 == code) {
            return '#fa573c';
        } else if (5 == code) {
            return '#ff7537';
        } else if (6 == code) {
            return '#ffad46';
        } else if (7 == code) {
            return '#42d692';
        } else if (8 == code) {
            return '#16a765';
        } else if (9 == code) {
            return '#7bd148';
        } else if (10 == code) {
            return '#b3dc6c';
        } else if (11 == code) {
            return '#fbe983';
        } else if (12 == code) {
            return '#fad165';
        } else if (13 == code) {
            return '#f691b2';
        } else if (14 == code) {
            return '#cd74e6';
        } else if (15 == code) {
            return '#9a9cff';
        } else if (16 == code) {
            return '#b99aff';
        } else if (17 == code) {
            return '#6691e5';
        } else if (18 == code) {
            return '#000000';
        }
        return '#A3A3A3';
    }
})