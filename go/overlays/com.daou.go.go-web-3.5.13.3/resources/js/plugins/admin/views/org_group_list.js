(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "hgn!admin/templates/org_group_list",
        "admin/collections/board_group_list",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
    ], 
    function(
        $,
        Backbone,
        App, 
        TplgroupList,
        GroupListCollection,
        commonLang,
        adminLang
    ) {
        var lang = {
                'manager_add' : adminLang['클래스 선택'],
                'manager_modify' : adminLang['클래스 수정 : '],
                'position' : adminLang['직위'],
                'rank' : adminLang['직급'],
                'duty' : adminLang['직책'],
                'user_group' : adminLang['사용자그룹'],
                'writable' : adminLang['쓰기가능'],
                'submit' : adminLang['등록'],
                'save' : commonLang['저장'],
                'modify' : commonLang['수정'],
                'del' : commonLang['삭제'],
                'duplicatePermission' : adminLang['이미 추가된 클래스 입니다.'],
                'additional_warining_manager' : adminLang["클래스 추가 경고"]
        };
        var instance = null;
        var boardList = false;
        var contactGroupList = Backbone.View.extend({
            initialize: function(options) {
                
                this.options = options || {};
                this.type= this.options.type;
                
                var tpltmpList = TplgroupList({
                	lang:lang,
                	isOrgServiceOn : GO.util.isUseOrgService(true)
                	});
                this.$el.html(tpltmpList);
                this.unbindEvent();
                this.bindEvent();
            },
            unbindEvent: function() {
                this.$el.off("change", "select.baseJobList");
                this.$el.off("click", "span[data-btntype='addBtn']");
                this.$el.off("click", "span[data-btntype='saveBtn']");
            }, 
            bindEvent : function() {
                this.$el.on("change", "select.baseJobList", $.proxy(this.changeGroupList, this));
                this.$el.on("click", "span[data-btntype='addBtn']", $.proxy(this.addBtn, this));
                this.$el.on("click", "span[data-btntype='saveBtn']", $.proxy(this.saveBtn, this));
            },
            addBtn : function(e){
                
                var selectBaseJob = this.$el.find(".baseJobList option:selected");
                var selectGroupList = this.$el.find(".groupListSelect option:selected");
                
				if(selectGroupList.html() == undefined){
                    $.goMessage(lang.additional_warining_manager);
                    return;
                }
                
                this.validateDuplicatePermission(selectGroupList.val(), selectBaseJob.val());
                
                var ulList = "";
                ulList = "<li data-code='"+selectGroupList.val()+"' data-type='"+selectBaseJob.val()+"'>"+
                              "<span class='major'>["+selectBaseJob.html()+" : "+selectGroupList.html()+"]</span> "+
                              " <span class='btn_border'> <span class='ic ic_edit' title='"+lang.modify+"' data-btntype='publicModify'> </span></span>"+
                              " <span class='btn_border'> <span class='ic ic_delete' title='"+lang.del+"' data-btntype='publicDelete'> </span></span>"+
                          "</li>";
                $("#groupUl").addClass("list_option").append(ulList);
            },
            validateDuplicatePermission : function(data_code, data_type){
                var groupUls = $("#groupUl li");
                permissionDatas = [];
                
                groupUls.each(function(){
                    var el = $(this);
                    permissionDatas.push({
                        'data_code' : el.attr("data-code"),
                        'data_type' : el.attr("data-type"), 
                        'data_permission' : el.attr("data-permission")
                    });
                });
                
                $.each(permissionDatas, function(){
                    if(this['data_code'] == data_code && this['data_type'] == data_type){
                        $.goMessage(lang.duplicatePermission);
                        throw new Error();
                    }
                })
            },
            saveBtn : function(e){
                var curEl = $(e.currentTarget).parents('li').first();
                var modiEl = $(e.currentTarget).parents('li').first().prev('li');
                var baseJob = curEl.find(".baseJobList option:selected");
                var baseJobDetail = curEl.find(".groupListSelect option:selected");
                var writePos = curEl.find(".writePossible").is(":checked") ? lang.read+"/"+lang.write : lang.read;
                var writePosVal = curEl.find(".writePossible").is(":checked") ? "READWRITE" : "READ";
                
                modiEl.attr('data-code',baseJobDetail.val());
                modiEl.attr('data-permission',writePosVal);
                modiEl.attr('data-type',baseJob.val());
                modiEl.find('span.major').html('['+baseJob.html()+' : '+baseJobDetail.html()+']');
                modiEl.find('span.minor').html(writePos);
                modiEl.find('span.btn_border').css("display","");
                curEl.remove();
                
            },
            changeGroupList : function(e){
                var select = this.$el.find(".baseJobList option:selected");
                var groupList = GroupListCollection.getGroupList({groupValue:select.val()});
                var selectList = "";
                $.each(groupList.toJSON(), function(i,val) {
                    selectList += "<option value="+val.id+">"+val.name+"</option>";
                });
                
                if(this.type == "add"){
                    this.$el.find(".groupListSelect").html(selectList);
                }else{
                    this.$el.find(".groupListSelect").html(selectList);
                    this.$el.find(".addBtn").hide();
                    this.$el.find(".saveBtn").show();
                    this.$el.find(".publicAdd").html(lang.manager_modify);
                }
                
            },
            render: function() {
                this.changeGroupList();
            }           
        });
        
        return {
            render: function(opt) {
                this.boardList = boardList;
                instance = new contactGroupList({el:opt.id,type:opt.type});
                return instance.render();
            }
        };
    });
}).call(this);