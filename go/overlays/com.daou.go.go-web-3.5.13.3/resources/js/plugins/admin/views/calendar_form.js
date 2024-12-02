(function() {
    define([
    "backbone", 
    "app",
    "hgn!admin/templates/calendar_form",
    "i18n!admin/nls/admin",
    "i18n!nls/commons",
    "hgn!board/templates/board_create_manager",
    "admin/views/board_group_list",
    "views/circle",
    "jquery.go-orgslide",
    ],

    function(
    Backbone,
    GO,
    Tmpl,
    AdminLang,
    CommonLang,
    ManagerItemTmpl,
    TplGroupList,
    CircleView
    ) {
        var lang = {
            "캘린더 등록정보" : AdminLang["캘린더 등록정보"],
            "캘린더 제목" : AdminLang["캘린더 제목"],
            "공개 범위" : AdminLang["공개 범위"],
            "공개" : AdminLang["공개"],
            "읽기" : AdminLang["읽기"],
            "비공개" : AdminLang["비공개"],
            "운영자" : AdminLang["운영자"],
            "운영자 추가" : AdminLang["운영자 추가"],
            "저장" : CommonLang["저장"],
            "취소" : CommonLang["취소"]
        };
        
        var CalendarModel = Backbone.Model.extend({
            defaults : {
                visibility : "public"
            },
            urlRoot: GO.contextRoot+"ad/api/calendar",
            isPublic : function(){
                return this.get("visibility") == "public";
            }
        })
        
        var CalendarForm = Backbone.View.extend({
            el: "#layoutContent",
            
            events : {
                "click #selectManager" : "addManager",
                "click input[name=share]:radio" : "togglePublicRadio",
                "click #cal_actions span[data-btntype='save']" : "save",
                "click #cal_actions span[data-btntype='cancel']" : "cancel",
                "click #calendarManagerList span.ic_del" : "removeManager"
            },

            initialize : function(options) {
                this.$el.off();
                if(_.isUndefined(options)){
                    this.model = new CalendarModel();
                }else{
                    this.model = new CalendarModel();
                    this.model.set({id : options.calendarId});
                    this.model.fetch({async : false});
                }
            },

            render : function() {
                this.$el.html(Tmpl({
                    lang : lang,
                    isPublic : this.model.isPublic(),
                    data : this.model.toJSON()
                }));
                
                this.renderAccess();
                return this.$el;
            },
            
            renderAccess : function(){
                var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
                if(GO.util.isUseOrgService(true)){
                    nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
                }
                this.accessUserView = new CircleView({
                    selector: '#accessUser',
                    isAdmin: true,
                    isWriter: true,
                    circleJSON: this.model.get('accessTarget'),
                    nodeTypes: nodeTypes,
                    useAction : true
                });
                this.accessUserView.render();
                this.accessUserView.$el.find("span.vertical_wrap").prepend(AdminLang["권한자 추가"] + " ");
            },
            
            save : function(){
                var self = this;
                this.model.set(this.getData());
                this.model.save(null, {
                    success : function(){
                        $.goMessage(CommonLang["저장되었습니다."]);
                        self.goList();
                    }
                });
            },
            
            cancel : function(){
                this.goList();
            },
            
            goList : function(){
                GO.router.navigate('/calendar', true);
            },
            
            getData : function(){
                var self = this;
                var data = {
                    name : this.$el.find("#title").val(),
                    visibility : this.$el.find("input:radio[name='share']:checked").val(),
                    accessTarget : this.accessUserView.getData(),
                    managers : function(){
                        var adminIds = [];
                        self.$el.find("#calendarManagerList li").not(".creat").each(function(){
                            adminIds.push({userId : $(this).data("id")});
                        });
                        return adminIds;
                    }()
                };
                
                return data;
            },
            
            addManager : function(e){
                var _this = this;
                var popupEl = $.goOrgSlide({
                    header : AdminLang["운영자 선택"],
                    desc : '',
                    callback : _this.setManager,
                    target : e,
                    isAdmin : true,
                    contextRoot : GO.contextRoot
                });
            },
            
            removeManager : function(e){
                var $currentEl = $(e.currentTarget);
                $currentEl.closest("li").remove();
            },
            
            setManager : function(managers){
                var targetEl = $('#calendarManagerList');
                if(managers && !targetEl.find('li[data-id="'+managers.id+'"]').length) {
                    targetEl.find('li.creat').before(ManagerItemTmpl($.extend(managers, { lang : lang })));
                }else{
                    $.goAlert(CommonLang["오류"], AdminLang["이미 운영자로 지정"]);
                }
            },
            
            togglePublicRadio : function(e){
                var radioVal = this.$el.find('input[name=share]:radio:checked').val();
                if(radioVal == "PUBLIC"){
                    $("#accessUser").hide();
                }else{
                    $("#accessUser").show();
                }
           }
        },{
            render: function(options) {
                var layout = new CalendarForm(options);
                return layout.render();
            }       
        });

        return CalendarForm;

    });

})();