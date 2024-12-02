(function() {
	define([
	"jquery",
	"backbone", 
	"app",
	"hgn!admin/templates/attnd_group_manage_list",
	"i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-sdk"
	],

	function(
	$,
	Backbone,
	GO,
	AttndGroupMngList,
	commonLang,
	adminLang
	) {
		var lang = {
				label_group_manage_top_caption : adminLang["한 사용자가 두 개 이상의 그룹에 중복 등록된 경우, 가장 상위에 등록된 그룹으로 출퇴근시간이 적용됩니다."],
				label_add_group : adminLang["그룹추가"],
				label_delete : commonLang["삭제"],
				label_reorder : adminLang["순서바꾸기"],
				label_group_name : adminLang["그룹명"],
				label_commute_time : adminLang["출퇴근 시간"],
				label_effective_period : adminLang["적용 기간"],
				label_create_at : adminLang["생성일"],
				label_setting : adminLang["설정"],
				label_delete_group : adminLang["그룹 삭제"],
				label_delete_caption : adminLang["근태관리 그룹 삭제 설명"],
				label_empty_list : adminLang["등록된 근태관리 그룹이 없습니다."],
				label_flexible_time : adminLang["자율 출퇴근제"]
				
		};
		var AttndGroupManageList = Backbone.View.extend({
			events : {
				"click #btn_create" : "addAttndGroup",
				"click #btn_delete" : "deleteAttndGroup",
				"click #btnReorderGroups" : "reOrderAttndGroups",
				"click input:checkbox" : "toggleCheckbox",
				"click .groupManageSetting" : "moveGroupSettingDetail" 
			},

			initialize : function() {
				this.collection = new Backbone.Collection();
				this.collection.url = GO.contextRoot + "ad/api/ehr/attnd/groups";
			},

			render : function() {
				this.collection.fetch({async : false});
				this.$el.html(AttndGroupMngList({
					lang : lang,
					data : this.collection.toJSON()
				}));
			}, 
			
			addAttndGroup : function() {
				GO.router.navigate('ehr/group/create', true);
			},
			
			deleteAttndGroup : function() {
				var self = this;
				var ids = new Array();
				var form = this.$el.find('form[name=formAttndGroupManage]');
				var attndGroupMngEl = form.find('input[type="checkbox"]:checked');
				var selectGroups = attndGroupMngEl.parents('tr');

				if(attndGroupMngEl.size() == 0){
					$.goMessage(adminLang["삭제할 근태관리 그룹을 선택하세요."]);
					return;
				}
				
				selectGroups.attr('data-id', function(i, val){
						if(val != null){
							ids.push(val);
						}
				});
				
				$.goCaution(adminLang["그룹 삭제"], adminLang["근태관리 그룹 삭제 설명"], function() {
					$.go(GO.contextRoot + 'ad/api/ehr/attnd/groups', JSON.stringify({ids: ids}), {
						qryType : 'DELETE',					
						contentType : 'application/json',
						responseFn : function(response) {
							if(response.code == 200){
								$.goMessage(commonLang["삭제되었습니다."]);
								self.render();
							}
						},
						error: function(response){
							var responseData = JSON.parse(response.responseText);
							if(responseData != null){
								$.goAlert(responseData.message);
							}else{
								$.goMessage(commonLang["실패했습니다."]);
							}
						}
					});
					
				});
			},
			
			reOrderAttndGroups : function(e) {
				var self = this,
					isSave = $(e.currentTarget).hasClass('btn_save');
				
				$('#btn_setting').unbind('click');
				
				if(isSave) {
					this.$el.find('#attndGroupManageTable').find('tbody').sortable("destroy").removeAttr('class');
					var ids = new Array(),
						form = this.$el.find('form[name=formAttndGroupManage]'),
						attndGroupMngEl = form.find('input[type="checkbox"]'),
						attndGroups = attndGroupMngEl.parents('tr');
					
					attndGroups.attr('data-id', function(i, val){
						if(val != null){
							ids.push(val);
						}
					});
					ids.reverse();
					
					$.go(GO.contextRoot+'ad/api/ehr/attnd/group/sort', JSON.stringify({ids: ids}), {
						async: false,
						qryType : 'PUT',
						contentType : 'application/json',
						responseFn : function(rs) {
							if(rs.code == 200){
								$.goMessage(commonLang["변경되었습니다."]);								
							}
							if(rs.code != 200) {
								$.goMessage(commonLang["실패했습니다."]);
								self.render();
							}
						}
					});
					$(e.currentTarget).text(adminLang['순서 바꾸기']).removeClass('btn_save').find(' ~ span').remove();
					$('#btn_add').show();
					$('#btn_delete').show();
				} else {
					$('#btn_add').hide();
					$('#btn_delete').hide();
					this.$el.find('#btnReorderGroups')
						.addClass('btn_save')
						.text(adminLang["순서바꾸기 완료"])
						.after('&nbsp;<span class="vertical_wrap desc">'+adminLang["메뉴 순서 변경 설명"]+'</span>');
					
					this.$el.find('#attndGroupManageTable').find('tbody').sortable({
						opacity : '1',
						delay: 100,
						cursor : "move",
						items : ">tr",
						containment : '.admin_content',
						hoverClass: "ui-state-hover",
						placeholder : 'ui-sortable-placeholder',
					    start : function (event, ui) {
					        ui.placeholder.html(ui.helper.html());
					        ui.placeholder.find('td').css('padding','5px 10px');
					    },
					    stop: function(event, ui) {
					    }
					});
				}
				this.$el.find('input[type=checkbox]').attr({
					checked : false,
					disabled : !isSave
				});
			},
			
			toggleCheckbox: function(e){
				if($(e.currentTarget).attr('id') == "group_all" && $(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', true);
				}else if($(e.currentTarget).attr('id') == "group_all" && !$(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', false);
				}else if(!$(e.currentTarget).is(':checked')){
					$('#group_all').attr('checked', false);
				}
			},
			
			moveGroupSettingDetail : function(e){
				GO.router.navigate('ehr/group/' + $(e.currentTarget).closest("tr").attr("data-id"), true);
			}

		});

		function privateFunc(view, param1, param2) {

		}

		return AttndGroupManageList;

	});

})();