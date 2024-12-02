(function() {
	define([
	    "jquery",
	    "backbone", 	
	    "app",
	    "hgn!admin/templates/asset_group_list",
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
				'manager_add' : adminLang['열람자 추가'],
				'manager_modify' : adminLang['열람자 수정 : '],
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
				'cancel' : commonLang['취소'],
				'additional_warining_manager' : adminLang["열람자 추가 경고"]
		};
		var instance = null;
		var assetList = false;
		var assetGroupList = Backbone.View.extend({
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
				var selectGroupList = this.$el.find(".groupListSelect option:selected");
				if(selectGroupList.html() == undefined){
                    $.goMessage(lang.additional_warining_manager);
                    return;
                }
				var ulList = "";
				ulList = "<li data-code='"+selectGroupList.val()+"'>"+
							  "<span class='major'>["+selectBaseJob.html()+" : "+selectGroupList.html()+"]</span>"+
							  "<span class='btn_wrap'>"+
								  "<span class='ic ic_edit' title='"+lang.modify+"' data-btntype='publicModify'></span>"+
								  "<span class='ic ic_delete' title='"+lang.del+"' data-btntype='publicDelete'></span>"+
							  "</span>"+
						  "</li>";
				$("#groupUl").addClass("list_option").append(ulList);
			},
			saveBtn : function(e){

				var curEl = $(e.currentTarget).parents('li').first();
				var modiEl = $(e.currentTarget).parents('li').first().prev('li');
				
				var baseJob = curEl.find(".baseJobList option:selected").html();
				var baseJobDetail = curEl.find(".groupListSelect option:selected");
				var writePos = curEl.find(".writePossible").is(":checked") ? lang.read+"/"+lang.write : lang.read;
				var writePosVal = curEl.find(".writePossible").is(":checked") ? "3" : "1";
				
				modiEl.attr('data-code',baseJobDetail.val());
				modiEl.attr('data-permission',writePosVal);
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
					this.$el.find(".cancelBtn").show();
					this.$el.find(".publicAdd").html(lang.manager_modify);
				}
				
			},
			render: function() {
				this.changeGroupList();
			}			
		});
		
		return {
			render: function(opt) {
				this.assetList = assetList;
				instance = new assetGroupList({el:opt.id,type:opt.type});
				return instance.render();
			}
		};
	});
}).call(this);