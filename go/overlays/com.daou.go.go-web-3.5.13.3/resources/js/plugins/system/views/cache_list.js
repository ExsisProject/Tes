(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
		"system/models/hostModel",
		"hgn!system/templates/cache_list",
	    "hgn!system/templates/list_empty",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-grid",
	    "jquery.go-sdk",
	    "GO.util",
	], 

	function(
		$,
		Backbone,
		App,
		hostModel,
		cacheListTmpl,
		emptyTmpl,
		commonLang,
		adminLang
	) {
		var tmplVal = {
				label_host: adminLang['호스트 선택'],
				label_service: adminLang['서비스 선택'],
				label_delete : adminLang["캐시 비우기"],
				label_breadcrumb : adminLang["캐시 관리"],
				label_cacheName : adminLang["캐시명"],
				label_cacheHits : adminLang["캐시 성공"],
				label_cacheMisses : adminLang["캐시 실패"],
				label_cacheHitRatio : adminLang["캐시 적중률"],
				label_count : adminLang["캐시 엔트리 수"],
				label_size : adminLang["캐시 사이즈"],
				label_description : adminLang["설명"]
		};

		var cacheList = Backbone.View.extend({

			events : {
				"click span#btn_delete" : "deleteCache",
				"click input:checkbox" : "toggleCheckbox",
				"change select#hostName" : "changeOption",
				"change select#serviceType" : "changeOption"
			},

			initialize : function() {
				this.listEl = '#cacheList';
				this.dataTable = null;
	//			this.hostModel = hostModel.read();
				this.hostModel = new hostModel();
				this.hostModel.fetch({async:false});
			},
			changeOption : function(e) {
				var key = $(e.currentTarget).attr("name");
				var value = $(e.currentTarget).attr("value");
				this.dataTable.tables.setParam(key,value);
			},
			toggleCheckbox : function(e){
				if(this.$el.find('#checkedAll').is(':checked')){
					$('input[type="checkbox"][value="shiro-admin-session-cache"]').attr('checked', false);
				}
				if($(e.currentTarget).is(':checked')){
					$(e.currentTarget).attr('checked', true);
				}else{
					this.$el.find('#checkedAll').attr('checked', false);
					$(e.currentTarget).attr('checked', false);
				}
			},
			deleteCache : function() {
				var self = this,
				checkedEls = $("#cacheList input[type=checkbox]:checked");

				if(checkedEls.length == 0){
					return $.goAlert("", adminLang["삭제할 항목을 선택하세요."]);
				}
				$.goConfirm(adminLang["캐시 삭제경고"], "", function(){
					var hostName = $('#hostName option:selected').val() == null ? $('#hostName option:first').val() : $('#hostName option:selected').val(),
						serviceType = $('#serviceType option:selected').val() == null ? "front" : $('#serviceType option:selected').val();
					var url = GO.contextRoot + "ad/api/cache/evict",
					options = {
							names : [],
							hostName : hostName,
							serviceType : serviceType
					};

					for(var i=0 ; i < checkedEls.length ; i++){
						if(checkedEls[i].value == "on"){
							continue;
						}
						options.names.push(checkedEls[i].value);
					}

					if(options.names.length == 0){
						return;
					}
					$.go(url,JSON.stringify(options), {
						qryType : 'PUT',
						contentType : 'application/json',
						responseFn : function(response) {
							$.goMessage(commonLang["삭제되었습니다."]);
							self.render();
						},
						error : function(error){
							$.goMessage(commonLang["실패했습니다."]);
						}
					});
				});
			},
			render : function() {
				$('.breadcrumb .path').html(adminLang["캐시 관리"]);
				this.$el.empty();
				var hostNames = [];
				$.each(this.hostModel.toJSON(), function(k,v) {
					if(v.hostName != null){
						hostNames.push({"hostName" : v.hostName});
					}
				});
				this.$el.html(cacheListTmpl({
						lang : tmplVal,
						hostNames : hostNames
					}));
				var hostName = $('#hostName option:selected').val() == null ? $('#hostName option:first').val() : $('#hostName option:selected').val(),
						serviceType = $('#serviceType option:selected').val() == null ? "front" : $('#serviceType option:selected').val();
				this.renderCacheList(hostName, serviceType);
			},
			renderCacheList : function(hostName, serviceType) {
				console.log(hostName);
				console.log(serviceType);

				var self = this;
				var url = GO.contextRoot + 'ad/api/cache/list';
				this.searchParams = {'hostName' : hostName, 'serviceType' : serviceType};

				this.dataTable = $.goGrid({
					el : this.listEl,
					method : 'GET',
					url : url,
					params : this.searchParams,
					emptyMessage : emptyTmpl({
						label_desc : adminLang["표시할 데이터 없음"]
					}),
					pageUse : false,
					sDomUse : false,
					checkbox : true,
					displayLength : 999,
					sDomType : 'admin',
					checkboxData : 'name',
					columns : [
							   { mData: "name", bSortable: false, fnRender : function(obj) {
								   return obj.aData.name;
							   }},
							   { mData: null, bSortable: false, fnRender : function(obj) {
								   return adminLang[obj.aData.name];
							   }},
							   { mData: "cacheHits", sWidth: '100px', sClass: "align_r", bSortable: false, fnRender : function(obj) {
								   return obj.aData.cacheHits;
							   }},
							   { mData: "cacheMisses", sWidth: '100px', sClass: "align_r", bSortable: false, fnRender : function(obj) {
								   return obj.aData.cacheMisses;
							   }},
							   { mData: null, sWidth: '130px', sClass: "align_r", bSortable: false, fnRender : function(obj) {
								   var cacheHitRatio = 0;
								   if (obj.aData.cacheHits == 0 && obj.aData.cacheMisses == 0) {
									   cacheHitRatio = 0;
								   }
								   if((obj.aData.cacheHits + obj.aData.cacheMisses) != 0){
									   cacheHitRatio = obj.aData.cacheHits / (obj.aData.cacheHits + obj.aData.cacheMisses);
								   }
								   return (cacheHitRatio * 100).toFixed(1);
							   }},
							   { mData: "objectCount", sWidth: '100px', sClass: "align_r", bSortable: false, fnRender : function(obj) {
								   return obj.aData.objectCount;
							   }},
							   { mData: "size", sWidth: '140px', sClass: "align_r", bSortable: false, fnRender : function(obj) {
								   return obj.aData.size;
							   }}
					],
					fnDrawCallback : function(obj) {
						self.$el.find('.toolbar_top').append(self.$el.find('#controlButtons').show());
						self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controllButtons').show());
						$('input[type="checkbox"][value="shiro-admin-session-cache"]').attr('disabled', true);
					}
				});
			}
		},{
			__instance__: null
		});

		return cacheList;
	});
}).call(this);