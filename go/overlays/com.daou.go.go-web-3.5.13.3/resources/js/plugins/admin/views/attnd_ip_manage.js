(function() {
	define([
	"backbone", 
	"app",
	"hgn!admin/templates/attnd_ip_manage",
	"i18n!admin/nls/admin",
	"i18n!nls/commons",
	"jquery.go-grid",
	"jquery.go-sdk"
	],

	function(
	Backbone,
	GO,
	IpManageTmpl,
	adminLang,
	commonLang
	) {

		var lang = {
				label_title : adminLang["접속 허용 IP"],
				label_guide : adminLang["접속 허용 IP 설명"],
				label_ip_name : adminLang["접속 IP 이름"],
				label_ip : adminLang["IP"],
				label_use : commonLang["사용"],
				label_not_use : commonLang["사용하지 않음"],
				label_ok : commonLang["저장"],
				label_cancel : commonLang["취소"],
				label_add : commonLang["추가"],
				label_delete : commonLang["삭제"]
		};
		
		var AttndIpManage = Backbone.View.extend({
			events : {
				"click #ok" : "saveIpConfig",
				"click #cancel" : "reset",
				"click #add_ip" : "addAccessIp",
                "click #delete_ip" : "deleteAccessIp",
                "click input:checkbox" : "toggleCheckbox"
			},

			initialize : function() {
				this.model = new Backbone.Model();
				this.model.url = GO.contextRoot + "ad/api/ehr/attnd/ip/manage/config";
				//this.model.set({useAccessAllowIp : true});

			},

			render : function() {
				this.model.fetch({async : false});
				this.$el.html(IpManageTmpl({
					lang : lang,
					model : this.model.toJSON()
				}));
				this.renderIpTable();
				return this;
			},
			
			renderIpTable : function() {
				var self = this;
                
                this.noticeGrid = $.goGrid({
                    el : '#accessIpTable',
                    method : 'GET',
                    destroy : true,
                    url : GO.contextRoot + 'ad/api/ehr/attnd/ip/list',
                    params : this.searchParams,
                    emptyMessage : "<p class='data_null'> " +
                                        "<span class='ic_data_type ic_no_data'></span>" +
                                        "<span class='txt'>"+adminLang["등록된 접속 허용 IP가 없습니다."]+"</span>" +
                                   "</p>",
                    defaultSorting : [[ 0, "desc" ]],
                    sDomType : 'admin',
                    checkbox : true,
                    checkboxData : 'id',
                    displayLength : GO.session('adminPageBase'),
                    columns : [
                               { mData: "ipName", sClass: "ip_name", sWidth:"200px", bSortable: false, fnRender : function(obj) {
                            	   return "<span data-id='" + obj.aData.id + "'>" + obj.aData.ipName + "</span>";
                               }},
                               { mData: "ipRange", sClass: "", bSortable: false, fnRender : function(obj){
                            	   return "<span>" + obj.aData.ipRange + "</span>";
                               }}
                    ],
                    fnDrawCallback : function(obj, oSettings, listParams) {
                        self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                        self.$el.find("tr>td.ip_name").css('cursor', 'pointer').click(function(e) {
                            var url = "ehr/ip/modify/" + $(e.currentTarget).find("span").attr("data-id");
                            GO.router.navigate(url, {trigger: true});
                        });
                    }
                }).tables;
			},
			
			addAccessIp : function() {
				GO.router.navigate('ehr/ip/create', true);
			},
			
			deleteAccessIp : function() {
				var self = this;
				var ids = new Array();
				var form = $('form[name=attndIpConfig]');
				var attndIpEl = form.find('#accessIpTable tbody input[type="checkbox"]:checked');

				if(attndIpEl.size() == 0){
					$.goMessage(adminLang["삭제할 접근 허용 IP 그룹을 선택하세요."]);
					return;
				}
				
				attndIpEl.attr('value', function(i, val){
						if(val != null){
							ids.push(val);
						}
				});
				
				$.goCaution(adminLang["접근 허용 IP 삭제"], "", function() {
					$.go(GO.contextRoot + 'ad/api/ehr/attnd/ip/delete', JSON.stringify({ids: ids}), {
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
			
			toggleCheckbox : function(e) {
				if($(e.currentTarget).attr('id') == "checkedAll" && $(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', true);
				}else if($(e.currentTarget).attr('id') == "checkedAll" && !$(e.currentTarget).is(':checked')){
					this.$el.find('input:checkbox').attr('checked', false);
				}else if($(e.currentTarget).is(':checked')){
					$(e.currentTarget).attr('checked', true);
				}else{
					this.$el.find('#checkedAll').attr('checked', false);
					$(e.currentTarget).attr('checked', false);
				}
			},
			
			saveIpConfig : function(e){
	        	this.model.set("useAccessAllowIp", $("#onUseAccessAllowIp").is(":checked"), {silent: true});
	        	GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
				this.model.save({}, {
					type : "PUT",
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						}
					},
					error : function(model, response) {
						var responseData = JSON.parse(response.responseText);
						$.goMessage(responseData.message);
						arg.close();
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					}
				});
			},
			
			reset : function(){
				this.render();
			}

		});

		function privateFunc(view, param1, param2) {

		}

		return AttndIpManage;

	});

})();