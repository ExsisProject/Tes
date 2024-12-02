(function() {
	define([
	"backbone", 
	"app",
	
	"admin/models/attnd_ext_config",
	
	"hgn!admin/templates/attnd_manager",
	"hgn!approval/templates/add_org_member",
	
	"i18n!nls/commons",
    "i18n!admin/nls/admin",
    
    "jquery.go-orgslide",
	"jquery.go-validation"
	],

	function(
	Backbone,
	GO,
	
	AttndExtConfig,
	
	AttndMangerTmpl,
	AddMemberTmpl,
	
	commonLang,
	adminLang
	) {
		var lang = {
				label_setting : adminLang["근태관리 설정"],
				label_manager : adminLang["운영자"],
				label_add_manager : adminLang["운영자 추가"],
				label_attendance_fix_ermissions : adminLang["근태 수정 권한"],
				label_item : adminLang["항목"],
				label_fix_ermissions : adminLang["수정 권한"],
				label_time : adminLang["시간"],
				label_status : adminLang["상태"],
				label_chief : adminLang["부서장"],
				label_vice_chief : adminLang["부부서장"],
				label_member : adminLang["부서원(본인)"],
				label_open_state : adminLang["근태 현황 공개"],
				label_open_state_stats : adminLang["부서 현황 및 통계 공개"],
				label_open_state_caption : adminLang["근태 현황 공개 설명"],
				label_use_charge_history_tooltip : adminLang["변경이력 사용여부 툴팁"],
				label_use_charge_history : adminLang["변경이력 사용여부"],
				label_use : adminLang["사용"],
				label_not_use : adminLang["사용하지 않음"],
				label_save : commonLang["저장"],
				label_cancel : commonLang["취소"],
				label_modify : commonLang["수정"],
				label_sync_noti : adminLang["근태동기화 경고"]
				
		};
		
		var AttndManager = Backbone.View.extend({
			events : {
				"click .creat" : "showOrgSlide",
				"click #btn_save" : "saveAttndSetting",
				"click #btn_cancel" : "resetAttndSetting",
				"click .ic_del" : "removeManager"
			},

			initialize : function() {
				this.model = new Backbone.Model();
				this.model.url = GO.contextRoot + "ad/api/ehr/attnd/manage";
				this.attndExtConfig = new AttndExtConfig();
			},

			render : function() {
	    		var	extConfigPromise = this.attndExtConfig.fetch().promise();
	        	$.when(extConfigPromise).done(_.bind(function(){
	        		this.$el.empty();
	        		this.model.fetch({async : false});      		
	        		this.$el.html(AttndMangerTmpl({
	        			lang : lang,
	        			data : this.model.toJSON(),
	        			timeEditAuthData : $.parseJSON(this.model.get('timeEditAuth')),
	        			statusEditAuthData : $.parseJSON(this.model.get('statusEditAuth')),
	        			'isSyncActive' : this.attndExtConfig.get('syncActive'),
	        		}));       		
	        	}, this));
				return this;
			},
			
			showOrgSlide : function(e){
				var self = this;
				$.goOrgSlide({
					header : adminLang["운영자 추가"],
					desc : '',
					callback : self.addMaster,
					target : e,
					isAdmin : true,
					contextRoot : GO.contextRoot
				});
			},
			
			addMaster : function(data) {
				var targetEl = $('#addManagerEl');
			    if(data && !targetEl.find('li[data-id="'+data.id+'"]').length) { 
	                targetEl.find('li.creat').before(AddMemberTmpl($.extend(data, { lang : lang })));
	            } else {
	                $.goMessage(commonLang['이미 선택되었습니다.']);
	            }
			},
			
			saveAttndSetting : function(){
				var self = this;
				var admins = [];
				
				$.each($("#addManagerEl li"), function(i, item){
					var itemId = $(item).attr("data-id");
					if(itemId != undefined){
						admins.push({userId:$(item).attr("data-id")});
					}
				});
				
				self.model.set("admins", admins, {silent: true});
				self.model.set("timeEditAuth", '{"manager" : ' + $('#timeManager').is(':checked')+ ', "master" : ' + $('#timeMaster').is(':checked') + ', "moderator" : ' + $('#timeModerator').is(':checked') +', "member" : ' + $('#timeMember').is(':checked') +'}', {"silent": true});
				self.model.set("statusEditAuth", '{"manager" : ' + $('#statusManager').is(':checked')+ ', "master" : ' + $('#statusMaster').is(':checked') + ', "moderator" : ' + $('#statusModerator').is(':checked') +', "member" : ' + $('#statusMember').is(':checked') +'}', {silent: true});
				self.model.set("useAttendActivityLogs", $('#onUseAttendActivityLogs').is(':checked'), {silent: true});
				self.model.set("useDeptSituationAndStats", $('#openStateStats').is(':checked'), {silent: true});
				
				GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
				self.model.save({}, {
					type : 'PUT',
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
							self.render();
						}
					},
					error : function(model, response) {
						if(response.responseJSON.name == 'InvalidAttndAdminException'){
							$.goMessage(response.responseJSON.message);
						}else{
							$.goMessage(commonLang["저장에 실패 하였습니다."]);
						}

						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					}
				});
			},
			
			resetAttndSetting : function(){
				this.render();
			},

			removeManager : function(e) {
				$(e.currentTarget).closest('li').remove();
			}

		});

		function privateFunc(view, param1, param2) {

		}
		
		return AttndManager;

	});

})();