define("todo/views/menus/add_member", [
    "components/history_menu/main", 
    
    "hgn!todo/templates/menus/add_member_menu",
    "text!todo/templates/partials/_member_button.html",
    "text!todo/templates/partials/_user_thumbnail.html",
    
    "todo/models/todo", 
    "todo/views/menus/member_profile", 
    
    "i18n!todo/nls/todo", 
    "i18n!nls/commons", 

    "jquery.go-orgslide"
], 

function(
    HistoryMenu, 
    
    renderAddMemberMenu, 
    memberButtonTpl, 
    userThumbnailTpl, 
    
    TodoModel, 
    MemberProfileMenu, 
    
    TodoLang, 
    CommonLang
) {

    var AddMemberMenuView, 
        HistoriableMenuView = HistoryMenu.HistoriableMenuView;

    AddMemberMenuView = HistoriableMenuView.extend({
        id: 'add-member-menu', 
        className: 'content', 

        name: 'add-member-menu', 

        title: TodoLang["보드 공유"], 
        template: renderAddMemberMenu, 

        afterSave: function() {}, 

        events: {
            "click .btn-add-member": "_callOrganogram", 
            "click .ui-user-photo": "_callMemberProfileMenu"
        }, 

        initialize: function(options) {
            options = options || {};

            if(!this.model) {
                this.model = new TodoModel();
            }

            this.afterSave = options.afterSave || function() {};

            HistoriableMenuView.prototype.initialize.call(this, options);
            this.setMenuClass('layer_share');

            this.listenTo(this.model, 'change:members', this.render);
            this.connectWith = '.layer_organogram';
        }, 

        render: function() {
            this.$el.empty()
                .append(this.template({
                    "model": this.model.toJSON(), 
                    "label": {
                        "add_member": TodoLang["멤버 추가"]
                    }
                }, {
                    "_member_button": memberButtonTpl, 
                    "_user_thumbnail": userThumbnailTpl
                }));
        }, 

        remove: function() {
            HistoriableMenuView.prototype.remove.apply(this, arguments);
            if(this.connectWith) {
                $(this.connectWith).remove();
            }
        }, 

        _callOrganogram: function(e) {
            e.preventDefault();

            var orgSlide = $.goOrgSlide({
                header : TodoLang["멤버 추가"],
                type: 'node', 
                contextRoot : GO.config("contextRoot"),
                callback : _.bind(this._addMember, this),
                zIndex : 200,
                externalLang : CommonLang,
                memberTypeLabel : TodoLang["멤버"],
                isBatchAdd : true
            });
            
            return orgSlide;
        },  

        _addMember: function(userData) {
        	var datas = _.isArray(userData) ? userData : [userData];
            var self = this;
            
            if(datas[0].type === 'org') return;
            this.model.addMember(datas);
        }, 

        _callMemberProfileMenu: function(e) {
            var $target = $(e.currentTarget), 
                nextView;

            if(!this.model.isMember(GO.session('id'))) {
                return false;
            }

            e.preventDefault();
            this.forward(new MemberProfileMenu.BoardMemberProfileMenuView({
                "todoModel": this.model, 
                "userId": parseInt($target.data('userid'))
            }));
        }
    });

    return AddMemberMenuView;

    // TODO: 테스트 코드 작성
});