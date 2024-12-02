define("todo/views/menus/search_member", [
    "underscore", 
    "hogan", 
    
    "components/history_menu/main",
    
    "hgn!todo/templates/menus/search_member_menu",
    "text!todo/templates/partials/_search_member_list.html",
    "text!todo/templates/partials/_user_thumbnail.html",
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons", 
    "libs/go-utils"
], 

function(
    _, 
    hogan,
    
    HistoryMenu, 
    
    renderSearchMemberMenu, 
    searchMemberListTpl, 
    userThumbnailTpl, 
    
    TodoLang, 
    CommonLang, 
    CommonUtil
) {

    var SearchMemberMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView, 
        resetFlag = false, 
        TYPING_DELAY = 500;
    
    var renderSearchMemberList = function() {
        var compiled = Hogan.compile(searchMemberListTpl);
        return compiled.render.apply(compiled, arguments);
    };

    SearchMemberMenuView = HistoriableMenuView.extend({
        id: 'search-member-menu', 
        className: 'content', 

        name: 'search-member-menu', 
        title: TodoLang["담당자"], 
        template: renderSearchMemberMenu, 

        todoModel: null, 

        events: {
            "click .btn-memberinfo": "_toggle", 
            "keyup input[name=query]": "_resetHint"
        }, 

        initialize: function(options) {
            options = options || {};

            this.todoModel = options.todoModel;
            HistoriableMenuView.prototype.initialize.call(this, options);
        }, 

        render: function() {
            this.$el.empty()
                .append(this.template({
                    "members": parseMembers.call(this, this.todoModel.get('members')), 
                    "label": {
                        "search_member": TodoLang["멤버 검색"]
                    }
                }, {
                    "_search_member_list": searchMemberListTpl, 
                    "_user_thumbnail": userThumbnailTpl
                }));
            this.setMenuClass('layer_new_board');
        }, 

        _resetHint: function() {
            if(!resetFlag) {
                resetFlag = true;
                setTimeout(_.bind(function() {
                    var query = this.$el.find('input[name=query]').val(), 
                        $memberList = this.$el.find('.ui-member-list'), 
                        filteredMembers = getFilteredMembers.call(this, query), 
                        buffer = [];

                    _.each(parseMembers.call(this, filteredMembers), function(member) {
                        buffer.push(renderSearchMemberList(member, {
                            "_user_thumbnail": userThumbnailTpl
                        }));
                    }, this);

                    $memberList.empty()
                        .append.apply($memberList, buffer);

                    resetFlag = false;
                }, this), TYPING_DELAY);
            }
        }, 

        _toggle: function(e) {
            var $target = $(e.currentTarget),   
                userId = $target.data('userid'), 
                actionFn = $target.hasClass('select') ? 'removeMember' : 'addMember', 
                classFn = $target.hasClass('select') ? 'removeClass' : 'addClass';

            e.preventDefault();

            this.model[actionFn].call(this.model, userId).then(function(todoItemModel) {
                $target[classFn].call($target, 'select');
                return when.resolve(todoItemModel);
            });            
        }
    });

    function parseMembers(members) {
        var result = [], 
            todoItemMemberIds = _.pluck(this.model.get('members'), 'id');

        _.map(members || [], function(member) {
            var isSelected = _.contains(todoItemMemberIds, member.id);
            result.push(_.extend(member, {selected : isSelected}));
        });

        return members;
    }

    function getFilteredMembers(query) {
        var members = this.todoModel.get('members'), 
            tquery = CommonUtil.escapeRegExChars(CommonUtil.normalizeQuery(query)), 
            matchRegEx = new RegExp('(?:' + tquery + ')', 'i');

        return _.filter(members, function(member) {
            var memberInfo = member.name + (member['position'] ? ' ' + member['position'] : '');
            return matchRegEx.exec(memberInfo);
        });
    }

    return SearchMemberMenuView;

    // TODO: 테스트 코드 작성
});