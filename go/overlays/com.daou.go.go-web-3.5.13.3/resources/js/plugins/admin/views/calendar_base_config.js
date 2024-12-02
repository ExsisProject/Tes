(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "admin/collections/app_admin_list",
        "admin/views/app_admin_list",
        "hgn!admin/templates/calendar_base_config",
        "jquery.go-orgslide",
        "jquery.go-popup",
        "jquery.go-sdk"
    ], 
    function(
        $,
        Backbone,
        App,
        CommonLang,
        AdminLang,
        Admins,
        AppAdminListView,
        configTmpl
    ) {
        
        var CalendarBaseConfigView,
            lang = {
                "캘린더추가" : AdminLang["캘린더 추가"],
                "순서바꾸기" : AdminLang["순서 바꾸기"],
                "삭제" : CommonLang["삭제"],
                "캘린더제목" : AdminLang["캘린더 제목"],
                "운영자" : AdminLang["운영자"],
                "공개범위" : AdminLang["공개 범위"],
                "설정" : AdminLang["설정"]
            };
        
        var CompanuyCalendarCollection = Backbone.Collection.extend({
            url : App.contextRoot+"ad/api/calendar/list"
        });
        
        CalendarBaseConfigView = App.BaseView.extend({
            
            el : '#layoutContent',
            
            events : {
                "click #checkedAll" : "checkedAll",
                "click #add" : "add",
                "click #changeSort" : "changeSort",
                "click #changeSortDone" : "changeSortDone",
                "click #remove" : "remove",
                "click #companyCalendarList span[data-btntype='modify']" : "modify"
            },
            
            initialize : function(){
                this.$el.off();
                this.collection = new CompanuyCalendarCollection();
            },
            
            render : function() {
                this.collection.fetch({async : false});
                
                var managerNames = function(){
                    var managerNames = [];
                    
                    if(this.managers.length == 0){
                        return "-";
                    }
                    
                    _.each(this.managers, function(manager){
                        managerNames.push(manager.name + " " + manager.position);
                    })
                    
                    return managerNames.join(", ");
                };
                
                var visible = function(){
                    if(this.visibility == "public"){
                        return CommonLang["공개"];
                    }else{  // private
                        return CommonLang["비공개"];
                    }
                };
                
                
                this.$el.empty().html(configTmpl({
                    lang : lang,
                    collection : this.collection.toJSON(),
                    managerNames : managerNames,
                    visible : visible
                }));
                
                return this.$el;
            },
            
            add : function(e){
                App.router.navigate('/calendar/create', true);
            },
            
            changeSort : function(e){
                this.$el.find("#changeSort").hide();
                this.$el.find("#changeSortDone").show();
                
                this.$el.find("#companyCalendarList tbody").removeClass().sortable({
                    opacity : '1',
                    delay: 100,
                    cursor : "move",
                    items : "tr",
                    containment : '.admin_content',
                    hoverClass: "ui-state-hover",
                    placeholder : 'ui-sortable-placeholder',
                    start : function (event, ui) {
                        ui.placeholder.html(ui.helper.html());
                        ui.placeholder.find('td').css('padding','5px 10px');
                    }
                });
            },
            
            changeSortDone : function(e) {
                var self = this;
                var sortableBody = this.$el.find('#companyCalendarList tbody');
                var sortIds = sortableBody.find('tr').map(function(k,v) {
                    return $(v).data('id');
                }).get();
                this.model = new Backbone.Model();
                this.model.url = GO.contextRoot + "ad/api/calendar/sort"; 
                this.model.save({ids : sortIds }, {
                    type:'PUT',
                    success: function() {
                        self.render();
                    }
                });
            },
            
            remove : function(){
                var url = App.contextRoot+"ad/api/calendar/remove",
                    $checkedEl = this.$el.find("#companyCalendarList tbody input:checkbox:checked"),
                    options = {
                        ids : []
                    },
                    self =this;
                
                if($checkedEl.length == 0){
                    return $.goMessage(AdminLang["캘린더를 선택해 주세요."]);
                }
                
                $.goConfirm(
                    AdminLang["캘린더 삭제"], 
                    AdminLang["캘린더 삭제 알림"],
                    function(){
                        $checkedEl.each(function(){
                            options.ids.push($(this).val());
                        });
                        
                        $.go(url,JSON.stringify(options), {
                            qryType : 'DELETE',
                            contentType : 'application/json',
                            responseFn : function(response) {
                                $.goMessage(CommonLang["삭제되었습니다."]);
                                self.render();
                            },
                            error : function(error){
                            }
                        });
                    });
            },
            
            modify : function(e){
                var $currentEl = $(e.currentTarget);
                var $parent = $currentEl.closest("tr");
                App.router.navigate('/calendar/' + $parent.data("id"), true);
            },
            
            checkedAll : function(e){
                var currentEl = $(e.currentTarget);
                
                if(currentEl.prop("checked")){
                    this.$el.find("#companyCalendarList input:checkbox").prop("checked", true);
                }else{
                    this.$el.find("#companyCalendarList input:checkbox").prop("checked", false);
                };
            }
        }, {
            __instance__: null
        });
        
        return CalendarBaseConfigView;
    });
}).call(this);
