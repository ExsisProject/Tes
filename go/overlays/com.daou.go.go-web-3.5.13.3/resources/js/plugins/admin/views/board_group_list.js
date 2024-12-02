(function() {
	define([
	    "jquery",
	    "backbone", 	
	    "app",
	    "hgn!admin/templates/board_group_list",
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
                'manager_modify' : adminLang['열람자 수정 : '],
                'department' : adminLang['부서'],
				'user' : adminLang['사용자'],
                'position' : adminLang['직위'],
                'rank' : adminLang['직급'],
                'duty' : adminLang['직책'],
                'user_group' : adminLang['사용자그룹'],
                'writable' : adminLang['쓰기가능'],
                'submit' : adminLang['등록'],
                'save' : commonLang['저장'],
                'read' : adminLang['읽기'],
                'write' : adminLang['쓰기'],
                'modify' : commonLang['수정'],
                'del' : commonLang['삭제'],
                'duplicatePermission' : adminLang['이미 추가된 열람자 입니다.'],
                'additional_warining_manager' : adminLang["열람자 추가 경고"],
                'low_dept' : adminLang['하위 부서 포함']
		};
		var instance = null;
		var boardList = false;
		var boardGroupList = Backbone.View.extend({
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
				this.$el.off("click", "span[data-btntype='cancelBtn']");
			}, 
			bindEvent : function() {
				this.$el.on("change", "select.baseJobList", $.proxy(this.changeGroupList, this));
				this.$el.on("click", "span[data-btntype='addBtn']", $.proxy(this.addBtn, this));
				this.$el.on("click", "span[data-btntype='saveBtn']", $.proxy(this.saveBtn, this));
				this.$el.on("click", "span[data-btntype='cancelBtn']", $.proxy(this.cancelBtn, this));
			},
			addBtn : function(e){
				var selectBaseJob = this.$el.find(".baseJobList option:selected");
				if(selectBaseJob.val() == "department"){
					this.addDept();
					return;
				}
				if(selectBaseJob.val() == "user"){
					this.addUser();
					return;
				}
				var selectGroupList = this.$el.find(".groupListSelect option:selected");
				var writeAuth = lang.read;
				var writeAuthVal = "1";
				var sharedType = "";
				var sharedTypeVal = "NONE";
				
				if(selectGroupList.html() == undefined){
					$.goMessage(lang.additional_warining_manager);
					return;
				}
				
				if(this.$el.find(".writePossible").is(":checked")){
					writeAuth =  lang.read+"/"+lang.write;
					writeAuthVal = "3";
				}
				if($("#sharedType").is(":checked")){
					sharedType =  "("+lang.low_dept+")";
					sharedTypeVal = "TO_SUB";
				}
        
				this.validateDuplicatePermission(selectGroupList.val(), selectBaseJob.val(), writeAuthVal);
				
				var ulList = "";
					ulList = "<li data-code='"+selectGroupList.val()+"' data-permission='"+writeAuthVal+"'>"+
							  "<span class='major'>["+selectBaseJob.html()+" : "+selectGroupList.html()+"]</span>"+
							  "<span class='minor'>"+writeAuth+"</span>"+
							  "<span class='btn_border'><span class='ic ic_delete' title='"+lang.del+"' data-btntype='publicDelete'></span></span>"+
							"</li>";
				$("#groupUl").addClass("list_option").append(ulList);
			},
			validateDuplicatePermission : function(data_code, data_type, data_permission){
				var groupUls = $("#groupUl li");
				var	permissionDatas = [];
          
				groupUls.each(function(){
				  var el = $(this);
				  permissionDatas.push({
					  'data_code' : el.attr("data-code"),
					  'data_type' : el.attr("data-type"), 
				  });
				});
          
			  $.each(permissionDatas, function(){
				  if(this['data_code'] == data_code && this['data_type'] == data_type){
					  $.goMessage(lang.duplicatePermission);
					  throw new Error();
				  }
			  });
			},
			saveBtn : function(e){
				var curEl = $(e.currentTarget).parents('li').first();
				var modiEl = $(e.currentTarget).parents('li').first().prev('li');
				
				if($(e.currentTarget).parent('li').find('.baseJobList').val() == "department"){
					this.addDept(e, curEl, modiEl);
					return;
				}
				if($(e.currentTarget).parent('li').find('.baseJobList').val() == "user"){
					this.addUser(e, curEl, modiEl);
					return;
				}
				
				var baseJob = curEl.find(".baseJobList option:selected").html();
				var baseJobDetail = curEl.find(".groupListSelect option:selected");
				var writePos = curEl.find(".writePossible").is(":checked") ? lang.read+"/"+lang.write : lang.read;
				var writePosVal = curEl.find(".writePossible").is(":checked") ? "3" : "1";
				var sharedTypeVal = curEl.find(".sharedType").is(":checked") ? "TO_SUB" : "NONE";
				
				modiEl.attr('data-code',baseJobDetail.val());
				modiEl.attr('data-permission',writePosVal);
				modiEl.attr('data-type',baseJob.val());
				modiEl.attr('data-sharedType',sharedTypeVal);
				modiEl.find('span.major').html('['+baseJob+' : '+baseJobDetail.html()+']');
				modiEl.find('span.minor').html(writePos);
				modiEl.find('span.btn_border').css("display","");
				curEl.remove();
				
			},
			cancelBtn : function(e) {
				var parentEl = $(e.currentTarget).parents('li');
				parentEl.prev().find('span.btn_border').show();
				parentEl.remove();
			},
			changeGroupList : function(e){
				var select = this.$el.find(".baseJobList option:selected");
				if("department" == select.val() || "user" == select.val()){
					if(e != undefined){
						$(e.currentTarget).parent().find('.groupListSelect').hide();
						if("department" == select.val()) {
							$(e.currentTarget).parent().find('#sharedType').parent('span').show();
						}else{
							$(e.currentTarget).parent().find('#sharedType').parent('span').hide();
						}
					}else{
						$('.groupListSelect').hide();
					}		
				}else{
					if(e != undefined){
						$(e.currentTarget).parent().find('.groupListSelect').show();
						$(e.currentTarget).parent().find('#sharedType').parent('span').hide();
					}else{
						$('.groupListSelect').show();
					}
				}
				var selectList = "";
				if(select.val() != "department" && select.val() != "user"){
					var groupList = GroupListCollection.getGroupList({groupValue:select.val()});
					$.each(groupList.toJSON(), function(i,val) {
						selectList += "<option value="+val.id+">"+val.name+"</option>";
					});
				}
        
				if(this.type == "add"){
					this.$el.find(".groupListSelect").html(selectList);
				}else{
					this.$el.find(".groupListSelect").html(selectList);
					this.$el.find(".addBtn").hide();
					this.$el.find(".saveBtn").show();
					this.$el.find(".publicAdd").html(lang.manager_modify);
				}
        
			},
			addCollback : function(rsData, type, deleteEl, modiEl) {
				var self = this;
                var writeAuth = lang.read;
                var writeAuthVal = 1;
                var sharedType = "";
                var sharedTypeVal = "NONE";
                
                if($(".writePossible").is(":checked")){
                    writeAuth =  lang.read+"/"+lang.write;
                    writeAuthVal = 3;
                }
                if(type == "Department"){
                	if($("#sharedType").is(":checked")){
	                	sharedType = "("+lang.low_dept+")";
	                    sharedTypeVal = "TO_SUB";
	                }
	                if(deleteEl != undefined){
    	                sharedType = deleteEl.find(".sharedType").is(":checked") ? lang.low_dept : "";
    	                sharedTypeVal = deleteEl.find(".sharedType").is(":checked") ? "TO_SUB" : "NONE";
	                }
                }
                if(deleteEl == undefined){
                	self.validateDuplicatePermission(rsData.id, type, sharedTypeVal);
                }
                var ownerTypeLang = type == "User" ? adminLang['사용자'] : adminLang['부서'];
                var ulList = "";
					ulList = "<li data-code='"+rsData.id+"' data-type='"+ type +"' data-permission='"+writeAuthVal+"' data-sharedType ='"+sharedTypeVal+"'>"+
                			  "<span class='major'>["+ownerTypeLang+" : "+rsData.name+"]</span>"+
                              "<span class='minor'>"+writeAuth+" " +sharedType+"</span>"+
                              "<span class='btn_border'><span class='ic ic_delete' title='"+lang.del+"' data-btntype='publicDelete'></span></span>"+
                          "</li>";
                $("#groupUl").addClass("list_option").append(ulList);
                if(deleteEl != undefined){
                	deleteEl.remove();
                	modiEl.remove();
                	deleteEl = null;
                	modiEl = null;
                }
			},
			addUser : function(e, deleteEl, modiEl) {
				var _this = this;
				$.goOrgSlide({
    				target : e,
    				header : adminLang['사용자 추가'],
    				desc : '',
    				contextRoot : GO.contextRoot,
    				callback : $.proxy(function(rs) {
						_this.addCollback(rs, "User", deleteEl, modiEl);
					}, this),
    				isAdmin : true
    			});
			},
			addDept : function(e, deleteEl, modiEl) {
    			var _this = this;
				$.goOrgSlide({
    				target : e,
    				header : adminLang['부서 추가'],
    				type : 'department',
    				desc : adminLang['부서를 선택해 주십시오.'],
    				contextRoot : GO.contextRoot,
    				callback : $.proxy(function(rs) {
    					_this.addCollback(rs, "Department", deleteEl, modiEl);
					}, this),
    				isAdmin : true
    			});
    		},
			render: function() {
				this.changeGroupList();
				return this;
			}			
		});
		
		return {
			render: function(opt) {
				this.boardList = boardList;
				instance = new boardGroupList({el:opt.id,type:opt.type});
				return instance.render();
			},
			init: function(){
				return boardGroupList;
			}
		};
	});
}).call(this);