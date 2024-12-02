(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
		"hogan",
	    "hgn!admin/templates/community_all",
	    "hgn!admin/templates/community_summary_info",
	    "hgn!admin/templates/list_empty",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-popup",
	    "jquery.go-sdk",
	    "jquery.go-grid",
	    "jquery.go-validation",
	    "GO.util"
	], 
	
	function(
		$, 
		Backbone,
		App,
		Hogan,
		communityListTmpl,
        CommunityInfoTmpl,
		emptyTmpl,
		commonLang,
		adminLang
	) {
		var	tmplVal = {
				label_total_community : adminLang["총 커뮤니티 수"],
				label_count : adminLang["개"],
				label_mb : adminLang["MB"],
				label_total_storage : adminLang["총 사용량"],
				label_down : adminLang["목록 다운로드"],
				label_name : adminLang["커뮤니티 명"],
				label_master : adminLang["마스터"],
				label_created : adminLang["생성일"],
				label_members : adminLang["회원수(명)"],
				label_posts : adminLang["게시물 수(개)"],
				label_storage : adminLang["사용량(MB)"],
				label_search : commonLang["검색"],
				label_used : commonLang["사용"],
				label_wait: adminLang["개설대기"],
				label_stop: adminLang["중지"],
                label_usage_desc : adminLang["사용량정보 안내"]
		};
		var CommunityList = App.BaseView.extend({
			el : '#layoutContent',
            events:{
                "click .wrap_action" : "onClickedWrapAction"

            },
			unbindEvent: function() {
				this.$el.off("click", "span.btn_search");
				this.$el.off("keydown", "span.search_wrap input");
				this.$el.off("click", "span#btn_down");
			}, 
			bindEvent : function() {
				this.$el.on("click", "span.btn_search", $.proxy(this.search, this));
				this.$el.on("keydown", "span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
				this.$el.on("click", "span#btn_down", $.proxy(this.downCommunityList, this));
			},
			initialize: function() {
				this.unbindEvent();
				this.bindEvent();
				this.listEl = '#communityList';
				this.dataTable = null;
				this.model = new Backbone.Model();
				this.model.url = GO.contextRoot + "ad/api/community/used"; 
			},
			render : function() {
				var self = this;
				
				this.$el.empty();
				
				this.$el.html( communityListTmpl({
					lang : tmplVal,
					selectType : [{"name":adminLang["커뮤니티 명"], "value" : "name"} ,
					              {"name":adminLang["마스터"], "value" : "masterUser"}
					],
				}));	
				this.model.fetch().done(function() {
					self.renderInfo();
				});
				
				this.renderCommunityList();
			},
			// info api 가 tms8 기준 18초 이상 소요되어, async 로 rendering 하도록 분리
			renderInfo : function() {
				var dataset = this.model.toJSON();
				this.$el.find('communityCount').val(this.model.get('communityOnlineCount'));
				var communityInfo = CommunityInfoTmpl({
					lang : tmplVal,
					model : dataset,
					totalCount : function() {
						return dataset.communityOnlineCount + dataset.communityWaitCount + dataset.communityStopCount;
					},
					totalSize : function(){
                        return GO.util.byteToMega(dataset.communityTotalSize);
					}
				});
				
				this.$el.find('.content_info').html(communityInfo);
			},
			renderCommunityList : function() {
				var self = this;
				this.dataTable = $.goGrid({
					el : this.listEl,
					method : 'GET',
					url : GO.contextRoot + 'ad/api/community/list/all',
					emptyMessage : emptyTmpl({
							label_desc : adminLang["커뮤니티가 없습니다."]
					}),
					defaultSorting : [[ 2, "desc" ]],
					sDomType : 'admin',
					displayLength : App.session('adminPageBase'),
					columns : [
					           { mData : "name", bSortable: true, sClass : "align_l", fnRender: function(obj){
					        	   return '<span data-id='+obj.aData.id+'>'+obj.aData.name+"</span>";
					           }},
					           { mData: "masterUser", sWidth: '120px', mData: "masterUser",
                                   mRender: function (data) { return (data ? data : ""); },
                                   bSortable: true,
                                   fnRender : function(obj) { return (obj.aData.masterUser ? obj.aData.masterUser+" "+obj.aData.masterPosition :'<td></td>');
					           }},
					           { mData: "createdAt", sClass: "align_c", sWidth: "120px", fnRender : function(obj) {
					        	   return GO.util.shortDate(obj.aData.createdAt);
					           }},
					           { mData: "memberCount", sClass: "align_r", sWidth : "120px", bSortable: true },
					           { mData : "postCount", sClass: "align_r", sWidth : "130px", bSortable: true },
					           { mData : "totalSize", sClass: "align_r", sWidth : "130px", bSortable: true, fnRender : function(obj) {
					        	   return GO.util.byteToMega(obj.aData.totalSize);
					           }}
			        ],
			        fnDrawCallback : function(obj, settings) {
			        	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
			        	
			        	if(settings._iRecordsTotal > 0) {
			        		self.$el.find('tr>td:nth-child(1)').css('cursor', 'pointer').click(function(e) {
				        		App.router.navigate('community/detail/'+$(e.currentTarget).find('span').attr('data-id'), {trigger: true});
				        	});
			        	}
			        }
				});
			},
			search : function() {
				var searchForm = this.$el.find('.table_search input'),
					keyword = searchForm.val();
				
				searchForm.trigger('focusout').blur();
				if($.trim(keyword) == ''){
					$.goAlert(commonLang['검색어를 입력하세요.']);
					return;
				}
				if(!$.goValidation.isCheckLength(2,32,keyword)){
					$.goAlert(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"32"}));
					return;
				}
				this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword);
			},
			searchKeyboardEvent : function(e) {
				if(e.keyCode == 13) {
					this.search();
				}
			},
			downCommunityList : function() {
				var url = "ad/api/community/download/list?";
                var data = this.dataTable.listParams;
                var properties = {
                		"property" : data.property,
                		"direction" : data.direction,
                		"keyword" : data.keyword,
                		"searchtype" : data.searchtype
                };
				GO.util.downloadCsvFile(url + GO.util.jsonToUrlParam(properties));
			},
            onClickedWrapAction : function() {
                this.$el.find('.wrap_action').toggle();
                this.$el.find('.info_summary li').not('.first').toggle();
            },
		},{
			__instance__: null
		});
		
		return CommunityList;
	});
}).call(this);