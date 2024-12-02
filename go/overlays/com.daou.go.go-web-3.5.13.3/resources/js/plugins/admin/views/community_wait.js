(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "hgn!admin/templates/community_wait",
	    "admin/collections/community_wait",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-popup",
	    "jquery.go-sdk"
	], 
	
	function(
		$, 
		Backbone,
		App,
		waitListTmpl,
		waitListCollection,
		commonLang,
		adminLang
	) {
		var	tmplVal = {
				label_ok: adminLang["개설신청 수락"],
				label_no: adminLang["개설신청 반려"],
				label_name: adminLang["커뮤니티 제목"],
				label_owner: adminLang["신청자"],
				label_date: adminLang["신청일"],
				label_desc: adminLang["커뮤니티 소개"],
				label_non_list: adminLang["커뮤니티 신청 목록이 없습니다."]
		};
		var WaitCommunityList = App.BaseView.extend({
			el : '#layoutContent',
			unbindEvent: function() {
				this.$el.off("click", "span#btn_online");
				this.$el.off("click", "span#btn_delete");
				this.$el.off("click", "form[name='formCommunityList'] input:checkbox");
			}, 
			bindEvent : function() {
				this.$el.on("click", "span#btn_online", $.proxy(this.changeOnlineStatus, this));
				this.$el.on("click", "span#btn_delete", $.proxy(this.deleteWaitCommunity, this));
				this.$el.on("click", "form[name='formCommunityList'] input:checkbox", $.proxy(this.toggleCheckbox, this));
			},
			initialize : function() {
				this.collection = waitListCollection.getCollection();
				this.unbindEvent();
				this.bindEvent();
			},
			toggleCheckbox : function(e){
				if($(e.currentTarget).attr('id') == "community_all" && $(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', true);
				}else if($(e.currentTarget).attr('id') == "community_all" && !$(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', false);
				}else if($(e.currentTarget).is(':checked')){
					$(e.currentTarget).attr('checked', true);
				}else{
					this.$el.find('#community_all').attr('checked', false);
					$(e.currentTarget).attr('checked', false);
				}
			},
			render : function() {
				var dataset = this.collection.toJSON() || [];
				this.$el.empty();
				var dateformat = function(){
					return GO.util.basicDate(this.createdAt);
				};
				var tmpl = waitListTmpl({
					dataset : dataset,
					dateformat : dateformat,
					isDataset : dataset.length ? true : false,
					lang : tmplVal,
					masterInfo : function() {
						var masterInfo = [this.masterUser, this.masterPosition];
						return masterInfo.join(' ');
					}
				});	
				this.$el.html(tmpl);
				return this.$el;
			},
			changeOnlineStatus: function(){
				var self =this,
					communityIds = new Array(),
					form = this.$el.find('form[name=formCommunityList]'),
					communityEl = form.find('input[type="checkbox"]:checked'),
					selectCommunity = communityEl.parents('tr');
				
				if(communityEl.size() == 0 || (communityEl.size() == 1 && form.find("#community_all").is(":checked") == true)){
					$.goAlert(adminLang["수락할 커뮤니티를 선택하세요."]);
					return;
				}
				
				selectCommunity.attr('data-id', function(i, val){
						if(val != null){
							communityIds.push(val);
						}
				});
				
				$.goConfirm(commonLang["확인"], adminLang["선택하신 커뮤니티의 개설을 허가합니다."], function() {
					$.go(GO.contextRoot+'ad/api/community/status/online', JSON.stringify({communityIds: communityIds}), {
						qryType : 'PUT',					
						contentType : 'application/json',
						responseFn : function(response) {
							if(response.code == 200){
								self.collection = waitListCollection.getCollection();
								self.render();
							}else{
								$.goAlert(commonLang["실패"],commonLang["실패하였습니다."]);
							}
						}
					});
					
				});
			},
			deleteWaitCommunity : function(){
				var self =this,
					communityIds = new Array(),
					form = this.$el.find('form[name=formCommunityList]'),
					communityEl = form.find('input[type="checkbox"]:checked'),
					selectCommunity = communityEl.parents('tr');
			
				if(communityEl.size() == 0 || (communityEl.size() == 1 && form.find("#community_all").is(":checked") == true)){
					$.goAlert(adminLang["반려할 커뮤니티를 선택하세요."]);
					return;
				}
				
				selectCommunity.attr('data-id', function(i, val){
						if(val != null){
							communityIds.push(val);
						}
				});
			
				$.goCaution(commonLang["확인"], adminLang["선택하신 커뮤니티의 개설을 반려합니다."], function() {
					$.go(GO.contextRoot+'ad/api/community/deny', JSON.stringify({communityIds: communityIds}), {
						qryType : 'DELETE',					
						contentType : 'application/json',
						responseFn : function(response) {
							if(response.code == 200){
								self.collection = waitListCollection.getCollection();
								self.render();
							}else{
								$.goAlert(commonLang["실패"],commonLang["실패하였습니다."]);
							}
						}
					});
					
				}, adminLang["반려"]);
			}
		}, {
			__instance__: null
		});
		
		return WaitCommunityList;
	});
}).call(this);