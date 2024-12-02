/**
 * 사용자 주소록 Side + Detail View
 */
;define(function (require) {
    var Backbone = require("backbone");
    var Hogan = require("hogan");
    var ContactLang = require("i18n!contact/nls/contact");

    var GroupTpl = require("hgn!contact/templates/tab_book/connector_group");

    var PersonalGroupCollection = require("contact/collections/personal_group");

    var ContactDetailView = require("contact/views/tab_book/detail/contact");
    var InitialView = require("contact/views/tab_book/toolbar/initial_bar");

    require("jquery.go-sdk");

    var UserContactView = Backbone.View.extend({

        type: "USER",

        initialize: function (options) {
            this.userSideView = new UserSideView();
            this.detailView = new ContactDetailView({type: this.type, mode : options.mode});
            this.initialView = new InitialView();

            this.initialView.on("click.initialWord", $.proxy(function (initial) {
                this.detailView.refresh({initial : initial});
            }, this));

            this.userSideView.on("click.userSideView", $.proxy(function (groupId) {
                this.detailView.refresh({groupId: groupId, type: this.type});
                this.initialView.show();
                this.initialView.reset();
            }, this));

            this.detailView.on("detail.search", $.proxy(function(){
                this.initialView.hide();
            }, this));
        },

        render: function () {
            this.$el.html(GroupTpl());
            var $contactWrap = this.$el.find("#contactWrap");

            $contactWrap.append(this.userSideView.el);
            $contactWrap.append(this.detailView.el);
            this.$el.append(this.initialView.el);

            this.detailView.render();
            this.userSideView.render();
            this.initialView.render();
        },

        getSelectedGroup : function(){
            return this.userSideView.getSelectedGroup();
        },

        getSelectedUsers : function(){
            return this.detailView.getSelectedUsers();
        }
    });

    var UserSideView = Backbone.View.extend({

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

            this.$el.find("#group-tree li:first").trigger("click");
        },

        _renderTree: function () {
            var $treeEl = this.$el.find('#group-tree').jstree('destroy').addClass('jstree jstree-default').html('<ul />').find('ul');
            var groups = [];
            groups.push({name: ContactLang['전체 주소록']});
            groups = groups.concat(PersonalGroupCollection.getCollection().toJSON() || []);

            var tpl = makeGroupTpl(groups);
            $treeEl.html(tpl);

            function makeGroupTpl(groups) {
                var listTpl = Hogan.compile("<li data-group-id='{{id}}' data-name='{{name}}' class='contact_group jstree-leaf {{#isLast}} jstree-last {{/isLast}}' data-loaded='false'><ins class='jstree-icon'></ins><a class=''>{{name}}</a></li>");
                var tpl = $.map(groups, function (v, index) {
                    if (groups.length == (index + 1)) {
                        v.isLast = true;
                    }
                    return listTpl.render(v);
                });

                return tpl;
            }
        },

        _onClickSideGroup: function (e) {
            var $target = $(e.currentTarget);

            resetClickMark();

            var groupId = $target.data("group-id");
            this.trigger("click.userSideView", groupId);

            function resetClickMark() {
                $target.closest("ul").find('a').removeClass('jstree-clicked');
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
                    dataName : groupName,
                }],
                groupType : "GROUP"
            }
        }
    });

    return UserContactView;
});