/**
 * 부서 Side + Detail View
 */
;define(function (require) {
    var Backbone = require("backbone");
    var ContactLang = require("i18n!contact/nls/contact");

    var GroupTpl = require("hgn!contact/templates/tab_book/connector_group");
    var GroupDeptSideTpl = require("hgn!contact/templates/tab_book/connector_group_dept_side");

    var ContactDetailView = require("contact/views/tab_book/detail/contact");
    var InitialView = require("contact/views/tab_book/toolbar/initial_bar");
    var JoinedDepts = require("collections/joined_depts");

    var DeptGroupCollection = require("contact/collections/dept_group");

    require("jquery.go-sdk");

    var lang = {
        'totalContact': ContactLang['전체 주소록']
    };

    var DeptContactView = Backbone.View.extend({

        type : "DEPARTMENT",


        initialize: function (options) {
            this.deptSideView = new DeptSideView();
            this.detailView = new ContactDetailView({type: this.type, mode : options.mode});
            this.initialView = new InitialView();

            this.initialView.on("click.initialWord", $.proxy(function (initial) {
                this.detailView.refresh({initial : initial});
            }, this));

            this.deptSideView.on("click.deptSideView", $.proxy(function (options) {
                this.detailView.refresh({groupId: options.groupId, deptId : options.deptId, type: this.type});
                this.initialView.show();
                this.initialView.reset();
            }, this));

            this.detailView.on("detail.search", $.proxy(function(){
                this.initialView.hide();
            }, this))
        },

        render: function () {
            this.$el.html(GroupTpl());
            var $contactWrap = this.$el.find("#contactWrap");

            $contactWrap.append(this.deptSideView.el);
            $contactWrap.append(this.detailView.el);
            this.$el.append(this.initialView.el);

            this.detailView.render();
            this.deptSideView.render();
            this.initialView.render();
        },

        getSelectedGroup : function(){
            return this.deptSideView.getSelectedGroup();
        },

        getSelectedUsers : function(){
            return this.detailView.getSelectedUsers();
        }
    });

    var DeptSideView = Backbone.View.extend({

        className: "content_tab_wrap",

        template: "<div id='group-tree' style='height:350px' class='jstree jstree-default'><ul></ul></div>",

        events: {
            "click #group-tree li.contact_group": "_onClickSideGroup"
        },

        initialize: function () {

        },

        render: function () {
            this.$el.html(this.template);
            this._renderTree();

            this.$el.find("#group-tree li:first").find("li:first").trigger("click");
        },

        _renderTree: function () {
            var $treeEl = this.$el.find('#group-tree').jstree('destroy').addClass('jstree jstree-default').html('<ul />').find('ul');
            var groups = [];
            var joinedDepts = JoinedDepts.fetch().toJSON();
            var deptGroups = makeDeptData(joinedDepts);

            if(deptGroups.length){
                deptGroups[deptGroups.length-1]["isDeptLast"] = true;
            }

            var tpl = makeGroupTpl(deptGroups);
            $treeEl.html(tpl);

            function makeDeptData(joinedDepts) {
                var deptGroups = [];
                _.each(joinedDepts, function (dept) {
                    var deptGroup = DeptGroupCollection.get(dept.id);
                    groups = deptGroup.toJSON();

                    if (groups.length) {
                        groups[groups.length - 1]["isGroupLast"] = true;
                    }

                    deptGroups.push({
                        id: dept.id,
                        name: dept.name,
                        groups: groups
                    });
                });
                return deptGroups;
            }

            function makeGroupTpl(groups) {
                return GroupDeptSideTpl({
                    data : groups,
                    lang : lang
                });
            }
        },

        _onClickSideGroup: function (e) {
            var $target = $(e.currentTarget);

            resetClickMark();

            var groupId = $target.data("group-id");
            var deptId  = $target.closest("li.dept-node").data("dept-id");

            this.trigger("click.deptSideView", {groupId : groupId, deptId : deptId});

            function resetClickMark() {
                $target.closest("#group-tree").find('a').removeClass('jstree-clicked');
                $target.find("a").addClass('jstree-clicked');
            }
        },

        /**
         * 왼쪽 사이드에 선택된 그룹
         * @return {
         *      data : [
         *          dataId : 그룹Id
         *          dataName : 그룹이름
         *      ],
         *      groupType : GROUP
         * }
         */
        getSelectedGroup : function(){
            var $selectedItem = this.$el.find("#group-tree a.jstree-clicked").closest("li");
            var groupId  = $selectedItem.data("group-id");
            var groupName = $selectedItem.data("name");

            // 전체 주소록 클릭 후 그룹 추가 눌렀을 경우
            if(!groupId){
                throw new Error("not select group");
            }

            return {
                data : [{
                    dataId : groupId,
                    dataName : groupName
                }],
                groupType : "GROUP"
            }
        }
    });

    return DeptContactView;
});