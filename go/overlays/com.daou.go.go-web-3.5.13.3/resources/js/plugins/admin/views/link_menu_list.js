(function(){
	define([
	    "jquery",
	    "backbone",
	    "app",
	    "admin/models/link_menu",
	    "admin/views/link_menu_create",

	    "hgn!admin/templates/link_menu_list",
	    "hgn!admin/templates/link_menu_create",
	    "hgn!admin/templates/link_menu_update",
	    "admin/models/install_info",

	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-validation",
	    "jquery.go-popup"
	],
	function(
		$,
		Backbone,
		App,
		LinkMenuModel,
		LinkMenuCreateView,

		LinkMenuListTmpl,
		LinkMenuCreateTmpl,
		LinkMenUpdateTmpl,
		InstallInfoModel,

		commonLang,
		adminLang
	){
		var tmplVal = {
			label_quick_link_setting : adminLang["바로가기 버튼 설정"],
			label_quick_link_tip : adminLang['PC 메신저 바로가기 버튼 설명'],
			label_button : adminLang['버튼명'],
			label_url : adminLang['바로가기 URL'],
			label_confirm: commonLang["확인"],
			label_sucess: commonLang["저장되었습니다."],
			label_fail: commonLang["실패"],
			label_failDesc: commonLang["실패했습니다."],
			label_edit: commonLang["수정"],
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_use: adminLang["사용함"],
			label_notuse: commonLang["사용하지 않음"],
			label_delete: commonLang["삭제"],
			label_order: adminLang["순서 바꾸기"],
			label_setting: commonLang["설정"],
			label_able : adminLang["사용여부"],
			label_add : commonLang["추가"],
			label_location : adminLang["화면 표시"],
			label_status : adminLang["활성화 여부"],
			label_empty_list : adminLang["설정된 버튼이 없습니다."]
		};

		var LinkMenuList = App.BaseView.extend({
			el : '#customConfigArea',
			initialize : function() {
				this.release();
				this.$el.off();
				this.model = new Backbone.Model();
				this.model.url = "/ad/api/messenger/links";
			},
			events: {
				'click #btn_create' : 'createLinkMenu',
				'click .linkMenuSetting' : 'setLinkMenu',
				'click #btn_delete' : 'deleteLinkMenu',
				'click form[name="formLinkMenuConfig"] input:checkbox' : 'toggleCheckbox',
				'click span#btnReorderLinkMenus' : 'reorderLinkMenus',
				'change #useQuickLink' : 'updateUseQuickLink'
	    	},
			render : function(){
				this.model.fetch({async : false});
				var links = this.model.toJSON().links;
				var installLocale = InstallInfoModel.read().toJSON().language;
				var tmpl = LinkMenuListTmpl({
					lang : tmplVal,
					data : links,
					useQuick : function(){
						if(this.useQuickLink){
							return commonLang['사용'];
						}
						return commonLang['사용하지 않음'];
					},
					locationName : function() {
						if(this.location == 'new'){
							return adminLang['브라우저'];
						} else if(this.location == 'exe') {
							return adminLang['실행파일'];
						}
						return adminLang['팝업'];
					},
					menuName : function(){
						if(installLocale == "ja"){
							return this.jpname;
						}
						return this.koname;
					}
				});
				this.$el.html(tmpl);
			},
			createLinkMenu : function(e){
				e.stopPropagation();
	            e.preventDefault();
	            var self = this;
				var popupEl = $.goPopup({
                    pclass: 'layer_normal',
					header : adminLang["바로가기 추가"],
                    modal : true,
                    width : "640px",
                    contents : "",
                    buttons : [{
                    	btype : 'confirm',
                    	btext: commonLang["확인"],
                    	autoclose : false,
                    	callback: function(rs) {
                    		GO.EventEmitter.trigger('admin', 'changed:saveLinkMenu', rs);
                    		self.model.fetch({async : false});
							self.render();
                    	}
                    }, {
                    	btype : 'close', btext: commonLang["취소"]
                    }]
                });
				LinkMenuCreateView.render();
				popupEl.reoffset();
			},
			setLinkMenu : function(e) {
				var self = this,
				linkMenuEl = $(e.currentTarget).parents('tr'),
				linkMenuId = linkMenuEl.attr('data-id');

			if($(e.currentTarget).parents('tbody:eq(0)').hasClass('ui-sortable')) {
				$.goMessage(adminLang["순서 바꾸기 완료후 설정"]);
					return false;
				}
				var popupEl = $.goPopup({
	                pclass: 'layer_normal',
					header : adminLang["바로가기 설정"],
	                modal : true,
	                width : "640px",
	                contents : "",
	                buttons : [{
	                	btype : 'confirm',
	                	btext: commonLang["수정"],
	                	autoclose : false,
	                	callback: function(rs) {
	                		GO.EventEmitter.trigger('admin', 'changed:saveLinkMenu', rs);
	                		self.model.fetch({async : false});
							self.render();
	                	}
	                }, {
	                	btype : 'close', btext: commonLang["취소"]
	                }]
	            });
				LinkMenuCreateView.render({"linkMenuId" : linkMenuId});
				popupEl.reoffset();
			},
			deleteLinkMenu : function() {
				var self = this,
					linkMenuIds = new Array(),
					form = this.$el.find('form[name=formLinkMenuConfig]'),
					linkMenuEl = form.find('input[type="checkbox"]:checked'),
					selectLinkMenu = linkMenuEl.parents('tr');
				if(linkMenuEl.size() == 0){
					$.goMessage(adminLang["삭제할 메뉴를 선택하세요."]);
					return;
				}

				selectLinkMenu.attr('data-id', function(i, val){
						if(val != null){
							linkMenuIds.push(val);
						}
				});

				$.goCaution(adminLang["메뉴삭제 확인"], adminLang["삭제경고"], function() {
					$.go(GO.contextRoot + 'ad/api/messenger/link', JSON.stringify({ids: linkMenuIds}), {
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
								$.goMessage(tmplVal['label_failDesc']);
							}
						}
					});

				});
			},
			toggleCheckbox: function(e){
				if($(e.currentTarget).attr('id') == "menu_all" && $(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', true);
				}else if($(e.currentTarget).attr('id') == "menu_all" && !$(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', false);
				}else if($(e.currentTarget).is(':checked')){
					$(e.currentTarget).attr('checked', true);
				}else{
					this.$el.find('#menu_all').attr('checked', false);
					$(e.currentTarget).attr('checked', false);
				}
			},
			saveLinkMenu : function(e){
				var useQuickLink = $(e.currentTarget).attr('value');
				var id = $(e.currentTarget).parents('tr').attr('data-id');

	        	this.menuLinkModel = LinkMenuModel.create();
	        	this.menuLinkModel.set("id", id);
	        	this.menuLinkModel.set("useQuickLink", useQuickLink);
	        	this.menuLinkModel.save({}, {
					type : 'PUT',
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
						}
					},
					error : function(model, response) {
						var responseData = JSON.parse(response.responseText);
						$.goMessage(responseData.message);
					}
				});
			},
			updateUseQuickLink : function(e) {
				console.log($(e.currentTarget).find("option:selected").attr('value'));
				var useQuickLink = $(e.currentTarget).find("option:selected").attr('value');
				var id = $(e.currentTarget).parents('tr').attr('data-id');
				var url = GO.contextRoot + "ad/api/messenger/usage/link/" + id;
				var param = {"useQuickLink":useQuickLink};

				$.go(url, JSON.stringify(param), {
					contentType : 'application/json',
					qryType : 'PUT',
					responseFn : function(response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
						}
					},
					error: function(response){
						var responseData = JSON.parse(response.responseText);
						$.goMessage(responseData.message);
					}
				});
	        },
			reorderLinkMenus : function(e){
				var self = this,
					isSave = $(e.currentTarget).hasClass('btn_save');

				$('#btn_setting').unbind('click');

				if(isSave) {
					this.$el.find('#linkMenuTable').find('tbody').sortable("destroy").removeAttr('class');
					var linkMenuIds = new Array(),
						form = this.$el.find('form[name=formLinkMenuConfig]'),
						linkMenuEl = form.find('input[type="checkbox"]'),
						linkMenus = linkMenuEl.parents('tr');

					linkMenus.attr('data-id', function(i, val){
						if(val != null){
							linkMenuIds.push(val);
						}
					});
					linkMenuIds.reverse();

					$.go(GO.contextRoot+'ad/api/messenger/reorder', JSON.stringify({ids: linkMenuIds}), {
						async: false,
						qryType : 'PUT',
						contentType : 'application/json',
						responseFn : function(rs) {
							if(rs.code == 200){
								$.goMessage(commonLang["변경되었습니다."]);
							}
							if(rs.code != 200) {
								$.goMessage(tmplVal['label_failDesc']);
								self._reloadMemberTables();
							}
						}
					});
					$(e.currentTarget).text(adminLang['순서 바꾸기']).removeClass('btn_save').find(' ~ span').remove();
					$('#btn_add').show();
					$('#btn_delete').show();
				} else {
					$('#btn_add').hide();
					$('#btn_delete').hide();
					this.$el.find('#btnReorderLinkMenus')
						.addClass('btn_save')
						.text(adminLang["순서바꾸기 완료"])
						.after('&nbsp;<span class="vertical_wrap desc">'+adminLang["메뉴 순서 변경 설명"]+'</span>');

					this.$el.find('#linkMenuTable').find('tbody').sortable({
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
					        $(this).find('tr#sub_'+$(ui.item[0]).attr('data-id')).hide();
					    },
					    stop: function(event, ui) {
					    	var itemId = $(ui.item[0]).attr('data-id'),
					    		btnEl = $(ui.item[0]).find('td.title span.btn_s'),
					    		subMenuEl = null;

					    	if(btnEl && btnEl.hasClass('btn_closeSubMenu')) {
					    		subMenuEl = $(this).find('tr#sub_'+itemId);
					    		$(this).find('tr[data-id = '+itemId +']').after(subMenuEl);
					    		subMenuEl.show();
					    	}
					    }
					});
				}
				this.$el.find('input[type=checkbox]').attr({
					checked : false,
					disabled : !isSave
				});
            },
            release: function() {
    			this.$el.off();
    			this.$el.empty();
    		}
		});
		return LinkMenuList;
	});
}).call(this);