/**
 * 조직도 Side + Detail View
 */
;define(function (require) {
    var GO = require("app");
    var Backbone = require("backbone");
    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");

    var GroupTpl = require("hgn!contact/templates/tab_book/connector_group");

    var OrgDetailView = require("contact/views/tab_book/detail/org");

    require("jquery.jstree");
    require("jquery.go-sdk");

    var lang = {
        "search_null": CommonLang['검색결과없음']
    };

    // 조직도
    var OrgContactView = Backbone.View.extend({
        type : "ORG",

        initialize: function (options) {
            this.detailView = new OrgDetailView({type: this.type, mode : options.mode});
            this.orgSideView = new OrgSideView();

            this.orgSideView.on({
                "click.orgSideView" : $.proxy(function (options) {
                    this.detailView.refresh({deptId: options.deptId, deptName : options.deptName, type: this.type});
                }, this)}
            );

            this.detailView.on({
                "click.search" : $.proxy(function(){
                    this.orgSideView.releaseNode();
                }, this)}
            );
        },

        render: function () {
            this.$el.html(GroupTpl());
            var $contactWrap = this.$el.find("#contactWrap");

            $contactWrap.append(this.orgSideView.el);
            $contactWrap.append(this.detailView.el);

            this.orgSideView.render();
            this.detailView.render();
        },

        getSelectedGroup : function(){
            var groups = this.orgSideView.getSelectedGroup();

            if(_.isEmpty(groups)){
                groups = this.detailView.getSelectedGroup();
            }

            if (_.isEmpty(groups)) {
                $.goSlideMessage(ContactLang['선택된 그룹이 없습니다'], 'caution');
                return;
            }

            return groups;
        },

        getSelectedUsers : function(){
            return this.detailView.getSelectedUsers();
        }
    });

    // 조직도 사이드
    var OrgSideView = Backbone.View.extend({
        className: "content_tab_wrap",
        template: "<div id='group-tree' style='height:350px' class='jstree jstree-default'><ul></ul></div>",

        initialize : function(){

        },

        render : function(){
            this.$el.html(this.template);
            this.renderTree();
        },

        renderTree : function(){
            var _this = this;
            var $el = this.$el.find('#group-tree');
            var listDeferred = $.Deferred();

            this.orgTree = $el.empty().jstree({
                    'plugins': ['themes', 'json_data', 'ui', 'crrm', 'cookies', 'types'],
                    'core': {'animation': 120},
                    'json_data': {
                        'ajax': {
                            "url": function (n) {
                                if (typeof n.data == 'function') {
                                    return GO.contextRoot + 'api/' + 'organization/dept';
                                } else {
                                    return GO.contextRoot + 'api/' + 'organization/multi/list';
                                }
                            },
                            "data": function (n) {
                                if (typeof n.data == 'function') {
                                    var data = n.data();
                                    return {deptid: data ? data.id : _this.loadId};
                                } else {
                                    return {type: 'mydept', scope: 'dept'};
                                }
                            },
                            "cache": true,
                            "async": true,
                            "success": function (data) {
                                try {
                                    if (data == null) {
                                        var emptyHtml = ["<tr>",
                                            "<td class='null_data' colspan='6'>",
                                            "<span>" + lang.search_null + "</span>",
                                            "</td>",
                                            "</tr>"].join("");

                                        _this.$el.find('.scroll_wrap>table>tbody').empty();
                                        _this.$el.find('.scroll_wrap>table>tbody').append(emptyHtml);
                                    }
                                } catch (err) {
                                    console.info(err);
                                }
                            }
                        }
                    },
                    'core': {'animation': 120},
                    'defaults ': {
                        'html_titles': false,
                        'move_node': false,
                        'ccp': true,
                        'width': 200
                    },
                    'ui': {
                        'select_multiple_modifier': false,
                        'select_limit': 1
                    },
                    'hotkeys': {
                        'del': _this._deleteDept,
                        'f2': function () {
                            return false;
                        }
                    },
                    'types': {
                        'max_depth': 10,
                        "max_children": 10,
                        'valid_children': ["root"],
                        'start_drag': false,
                        'move_node': false,
                        "start_drag": false,
                        "move_node": false,
                        'delete_node': false,
                        'remove': false,
                        'types': {
                            'root': {
                                'valid_children': ["org"],
                                "start_drag": false,
                                "move_node": false,
                                "delete_node": false,
                                "remove": false
                            },
                            'org': {
                                'max_depth': 10,
                                "max_children": 10,
                                'valid_children': ["org"],
                                "start_drag": true,
                                "move_node": true,
                                "delete_node": true,
                                "remove": true
                            }
                        }
                    }
                })
                .bind("loaded.jstree", function (event, data) {
                    listDeferred.resolve();
                })
                .bind("load_node.jstree", function (node, success_callback, error_callback) {
                    _this.orgTree.find('a[href="#"]').attr('data-bypass', 1);
                    // DOCUSTOM 5104 메일 주소록 계층 구조 표시
                    $el.find('a[rel="company"]').parent('li').addClass('jstree-company');
                    var treeOrg = false;
                    $el.find('a[rel="company"]').parent('li').each(function (i, v) {
                        var depth = $(v).data('groupDepth');
                        if (!_.isNumber(depth)) {
                            depth = 0;
                        }
                        $(v).addClass('depth' + depth);
                        if (!treeOrg && parseInt(depth) >= 0) {
                            treeOrg = true;
                        }
                    })
                    if (treeOrg) {
                        $el.addClass('jstree_depth');
                    }
                    // DOCUSTOM 5104 메일 주소록 계층 구조 표시
                })
                .bind("select_node.jstree", $.proxy(_this._clickNode, _this)); // 왼쪽 부서 클릭시 event 처리

            // 초기 부서 클릭
            var profileDeferred = $.Deferred();
            $.go(GO.contextRoot + 'api/user/profile/' + GO.session('id'), "", {
                qryType: 'GET',
                async: true,
                contentType: 'application/json',
                responseFn: function (response) {
                    var deptId = response.data.deptMembers[0].deptId;
                    profileDeferred.resolveWith(this, [deptId]);
                },
                error: function (error) {

                }
            });

            $.when(profileDeferred, listDeferred).then(function (deptId) {
                _this.$el.find('#group-tree a[nodeid="' + deptId + '"]').trigger("click");
            });
        },

        _clickNode: function (e, data) {
            var selected = $(data.rslt.obj[0]);
            var deptId = selected.data()['id'];
            var deptName = selected.data()['name'];
            this.trigger("click.orgSideView", {deptId : deptId, deptName : deptName});
        },

        releaseNode : function(){
            this.orgTree.find("a.jstree-clicked").removeClass("jstree-clicked");
        },

        getSelectedGroup : function(){
            var $selectedGroups = this.orgTree.find("a.jstree-clicked").closest("li");

            if ($selectedGroups.length == 0) {
                return {};
            }

            var data = [];

            $.each($selectedGroups, function () {
                var deptId = $(this).data('id');
                var deptName = $(this).data('name');
                data.push({
                    dataId: deptId,
                    dataName: deptName
                })
            });

            return {
                data: data,
                groupType: "ORG"
            }
        }
    });

    return OrgContactView;
});