define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var GO = require("app");

    var UserSideTpl = require("hgn!contact/templates/side_user");
    var LocalStorage = require("contact/helpers/local_storage");
    var AddGroupView = require("contact/views/side/components/add_group");
    var ManageView = require("contact/views/side/components/manage_popup");
    var when = require("when");
    var whenSequence = require("when/sequence");

    require("jquery.go-popup");
    require("jquery.go-validation");

    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");

    var lang = {
        'USER': ContactLang['개인 주소록'],
        'COMPANY': ContactLang['전사 주소록'],
        'DEPARTMENT': ContactLang["부서 주소록"],
        'contact_group': ContactLang['주소록 그룹'],
        'group_add': ContactLang['연락처 그룹 추가'],
        'contact_add': ContactLang['연락처 주소록 추가'],
        'contact_all': ContactLang['전체 주소록'],
        'contact_manage': ContactLang['주소록 관리'],
        'group_manage': ContactLang['그룹관리'],
        'fold': CommonLang['접기'],
        'open' : CommonLang["펼치기"],
        'edit' : CommonLang['편집'],
        'modify': CommonLang['수정완료'],
        'cancel': CommonLang['취소'],
        'new_contact': ContactLang['새 연락처'],
        'contact': ContactLang['주소록'],
        'delete_contact': ContactLang["주소록 삭제"]
    };

    var PERSONAL_GROUP = "personal";

    // USER VIEW
    var UserSideView = Backbone.View.extend({
        tagName: "section",
        className: "lnb",

        SIDE_STORE_KEY : GO.session("loginId") + '-contact-personal-toggle',

        events: {
            "click span.contactTag": "moveLink",
            "click span.groupManage": "groupManage",
            "click .side_toggle" : "sideToggle",
            "click span[data-button='manage']" : "_companyGroupManage",
            "click .ic_list_reorder" : "_changeEditMode",
            "click .editmode.ic_cancel" : "_cancelEdit",
            "click .ic_list_del" : "_removeGroup",
            "click .editmode.ic_done" : "_requestModify"
        },

        type: "USER",

        initialize: function (options) {
            this.actionQueues = {};
            this.$el.attr("data-type", "USER");
            this.collection = options.collection;
            this.addGroupView = new AddGroupView({type: this.type});
        },

        render: function () {
            this.$el.html(UserSideTpl({
                lang: lang,
                data: this.collection.toJSON(),
                hasContactCount : function(){
                    return this.contactCount > 0;
                },
                isToggleOpen : LocalStorage.getStoredCategoryIsOpen(this.SIDE_STORE_KEY)
            }));

            this.$el.find("ul.side_depth").append(this.addGroupView.el);
            this.addGroupView.render();
            if(!LocalStorage.getStoredCategoryIsOpen(this.SIDE_STORE_KEY)){
                this.$el.find("ul.side_depth").hide();
            }
        },

        sideToggle : function(e){
            var $currentTarget = $(e.currentTarget);
            sideToggle($currentTarget, this.SIDE_STORE_KEY);
        },

        moveLink: function (e) {
            var $current = $(e.currentTarget);
            var groupId = $current.closest("li.group").data("id");
            var url = makeUrl.call(this, groupId);
            GO.router.navigate(url, {trigger: true, pushState: true});
            GO.EventEmitter.trigger('contact', 'changed:sideGroups');

            function makeUrl(groupId) {
                var url = [];
                url.push("contact");
                url.push("personal");
                if (groupId) {
                    url.push(groupId);
                }
                return url.join("/");
            }
        },

        groupManage: function () {
            var $selected = this.$el.closest("section").find("p.on").closest("li");
            var manageView = new ManageView({type: this.type, id : $selected.data("id")});
            manageView.render();
        },


        _changeEditMode : function(e) {
            var $section = this.$el.closest("section"),
                title = ContactLang['연락처 그룹 편집'],
                queueIndex = null, actionQueue;

            actionQueue = this._getActionQueue(PERSONAL_GROUP);

            $section.find("h1 > a > span.txt").text(title);
            $section.find("p.on").removeClass("on");
            $section.find(".ui-state-disabled").hide();
            $section.addClass("lnb_edit");
            $section.removeClass("sortable_not");
            $section.siblings().find(".normalmode").hide();
            $section.siblings().find(".editmode:not([data-lazyshow])").show();
            $section.find(".normalmode").hide();
            $section.find(".editmode:not([data-lazyshow])").show();

            $section.sortable({
                items: "li:not(.ui-state-disabled)",
                axis: "y",
                start: function(event, ui) {
                    var lastQueue = actionQueue.last();

                    $(ui.helper).addClass("move");

                    // 바로 이전 큐가 sort이면 해당 큐를 그대로 이용해서 네트워크 요청수를 줄인다.
                    if( lastQueue && lastQueue.action === 'sort' ) {
                        queueIndex = lastQueue.index;
                    } else {
                        queueIndex = actionQueue.placeholder();
                    }
                },
                stop: function(event, ui) {
                    var sortedIds = [];
                    $section.find("li:not(.ui-state-disabled)").each(function(i, elem) {
                        sortedIds.push($(elem).data("id"));
                    });
                    actionQueue.update(queueIndex, { "ids": sortedIds, "action": 'sort'});
                    $(ui.item).removeClass("move");
                }
            });
            $section.disableSelection();
        },

        _getActionQueue: function(type) {
            if(!this.actionQueues[type]) {
                this.actionQueues[type] = new ActionQueue();
            }
            return this.actionQueues[type];
        },

        _clearActionQueue: function(type) {
            if(this.actionQueues[type]) {
                this.actionQueues[type].clear();
            }
        },

        _cancelEdit: function(e) {
            this._changeNormalMode();
            return this;
        },

        _changeNormalMode: function() {
            this._clearActionQueue(PERSONAL_GROUP);
            GO.EventEmitter.trigger('contact', 'changed:sideGroups');
        },

        _removeGroup: function(e) {
            var $target = $(e.currentTarget),
                $li = $target.closest('li'),
                queue = this._getActionQueue(PERSONAL_GROUP),
                lastQueue = queue.last();

            // 바로 이전 큐가 remove이면 해당 큐를 그대로 이용해서 네트워크 요청수를 줄인다.
            if( lastQueue && lastQueue.action === 'remove' ) {
                var removedIds = _.isArray(lastQueue.ids) ? lastQueue.ids: [lastQueue.ids],
                    removedElements = _.isArray(lastQueue.elements) ? lastQueue.elements : [lastQueue.elements];

                removedIds.push($li.data("id"));
                removedElements.push($li);
                queue.update(lastQueue.index, {"ids": removedIds, "elements": removedElements});
            } else {
                queue.add({"ids": [$li.data("id")], action: 'remove', "elements": [$li]});
            }

            $li.remove();
        },
        _requestModify: function(e) {
            e.preventDefault();
            var self = this,
                queue = this._getActionQueue(PERSONAL_GROUP),
                tasks = queue.get(),
                reqCommands = [];

            _.each(tasks, function (task) {
                reqCommands.push(function () {
                    var commandFunc = {"sort": createSortCommand, "remove": createRemoveCommand}[task.action];
                    return commandFunc.call(self, task.ids);
                });
            }, this);

            return whenSequence(reqCommands).then(function success() {
                self._changeNormalMode();
                return when.resolve();
            });
        }
    });

    function sideToggle($el, key){
        var $section = $el.closest("section"),
            parentTarget = $el.parents('h1'),
            toggleBtn = parentTarget.find('.ic_side');

        $section.find('ul.side_depth').slideToggle("fast", function () {
            if ($(this).css('display') == 'block') {
                parentTarget.removeClass('folded');
                toggleBtn.attr("title", CommonLang["접기"]);
            } else {
                parentTarget.addClass('folded');
                toggleBtn.attr("title", CommonLang["펼치기"]);
            }

            var isOpen = !parentTarget.hasClass("folded");

            LocalStorage.storeCategoryIsOpen(key, isOpen);
        });
    }


    function commonActionCommand(url, method, ids) {
        var defer = when.defer();

        ids = _.isArray(ids) ? ids: [ids];

        $.ajax({
            "url" : url,
            "type": method,
            "data": JSON.stringify({ "ids": ids}),
            "dataType": 'json',
            "contentType": 'application/json'
        }).then(defer.resolve, defer.reject);

        return defer.promise;
    }

    function createRemoveCommand(removedIds) {
        var reqUrl = GO.config('contextRoot') + "api/contact/personal/group";
        return commonActionCommand(reqUrl, 'DELETE', removedIds).then(function(resp) {
            console.log("DELETE");
        });
    }

    function createSortCommand(sortIds) {
        var reqUrl = GO.config('contextRoot') + "api/contact/personal/group";
        return commonActionCommand(reqUrl, 'PUT', sortIds).then(function(resp) {
            console.log("REORDER");
        });
    }

    var ActionQueue = (function() {
        var constructor = function() {
            this.__index__ = 0;
            this.__queue__ = {};
        };

        constructor.prototype = {
            get: function(index) {
                return typeof index === 'undefined' ? _.reject(this.__queue__, function(q) {
                    return !q;
                }) : this.__queue__[index];
            },

            last: function() {
                return this.__queue__[this.__index__];
            },

            placeholder: function() {
                return this.add(null);
            },

            add: function(data) {
                this.__queue__[++this.__index__] = $.extend( true,  { index: this.__index__ }, data );
                return this.__index__;
            },

            update: function(index, data) {
                if(this.__queue__.hasOwnProperty(index)) {
                    this.__queue__[index] = $.extend( true,  this.__queue__[index], data );
                }
                return this;
            },

            remove: function(index) {
                delete this.__queue__[index];
                return this;
            },

            clear: function() {
                this.__queue__ = {};
            },

            count: function() {
                return _.toArray(this.__queue__).length;
            },

            groupByAction: function() {
                return _.groupBy(this.get(), function(q) {
                    return q.action;
                }, this);
            }
        };

        return constructor;
    })();

    return UserSideView;
});