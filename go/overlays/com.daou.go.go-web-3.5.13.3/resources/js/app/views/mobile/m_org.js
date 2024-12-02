/*
 * 모바일조직도 레이어
 * */
;(function() {
	define([ 
		"jquery",
		"backbone",
		"app",
		"collections/userSearch",
		"collections/deptSearch",
		"collections/circle_nodes",
		"hgn!templates/mobile/m_org",
		"i18n!nls/commons",
		"GO.util",
		"iscroll"/*,
		"backbone.touch"*/
	],
	function(
		$,
		Backbone,
		App,
		OrgCollection,
		OrgDeptCollection,		
		CircleNodes,
		OrgTpl,
		CommonLang
	) {
		
		var mobileOrgView = Backbone.View.extend({
			id: 'mobileOrg',
			attributes : {
				'data-role' : 'layer',
				'style' : 'background:#fff; position:absolute; width:100%; min-height:100%; top:0; left:0; z-index:999'
			},
			unbindEvent : function() {
				this.$el.off("vclick", "a[data-btn='paging']");
				this.$el.off("vclick", "a[data-btn='cancel']");
				this.$el.off("vclick", "a#btnSearch");
				this.$el.off("vclick", "a#btnSearchReset");
				this.$el.off("vclick", "li span.ic_del");
				this.$el.off("keyup", "#searchKeyword");
				this.$el.off("change", "ul#userListEls input[value]");
				this.$el.off("change", "input#userCheckedAll");
			},
			bindEvent : function() {
				this.$el.on("vclick", "a[data-btn='paging']", $.proxy(this.paging, this));
				this.$el.on("vclick", "a[data-btn='cancel']", $.proxy(this.back, this));
				this.$el.on("vclick", "a#btnSearch", $.proxy(this.search, this));
				this.$el.on("vclick", "a#btnSearchReset", $.proxy(this.searchReset, this));
				this.$el.on("vclick", "ul#userCheckedEls span.ic_del", $.proxy(this.deleteUserEl, this));		
				this.$el.on("keyup", "#searchKeyword", $.proxy(this.searchKeyEvent, this));
				this.$el.on("change", "ul#userListEls input[value]", $.proxy(this.changeCheckedUser, this));
				this.$el.on("change", "input#userCheckedAll", $.proxy(this.changeCheckedAll, this));
			},
			
			// tap 이벤트는 레이어가 중첩되는 UI에서 다른 레이어에 이벤트가 전달되는 문제가 있다.
			// backbone-touch(더블클릭 판정 딜레이 0.3초 없애줌) 를 통해 click 이벤트로 대체하자.
			events : {
				"vclick a[data-btn='ok']" : "checkedSave"  
			},
			
			
			initialize : function(options) {
				var _this = this;
				this.$listEl = null;
				this.$checkedUserEl = null;
				this.checkedUserScroll = null;
				this.options = {
					'title' : '기본타이틀',
					'offset' : 100,
					'btn_ok' : CommonLang['확인'],
					'btn_cancel' : CommonLang['취소'],
					'search_placeholder' : [CommonLang['이름'], [CommonLang['아이디']]].join(', '),
					'search_result' : CommonLang['검색결과'],
					'search_result_null' : CommonLang['검색결과없음'],
					'type' : options.type || {},
					'isSingleSelect' : options.isSingleSelect || false,
					'isDept' : options.type == 'department'
				};
				
				this.tplUnit = {
					'search_result' : Hogan.compile('<div class="search_result">{{^isSingleSelect}}<input type="checkbox" id="userCheckedAll">{{/isSingleSelect}}<span class="txt">{{search_result}} {{{totalCount}}}</span></div>'),
					'listUser' : Hogan.compile('<li><input type="checkbox" value="{{id}}" id="userSort{{id}}" {{checked}}><label for="userSort{{id}}"><a class="tit" data-bypass><div class="photo"><img src="{{thumbnail}}"></div><div class="info"><span class="name txt_ellipsis">{{name}} {{position}}</span><span class="mail txt_ellipsis">{{email}} {{{departmentNames}}}</span></div></a></label></li>'),
					'listDept' : Hogan.compile('<li><input type="checkbox" value="{{id}}" id="userSort{{id}}" {{checked}}><label for="userSort{{id}}"><a class="tit" style="margin-left:0px" data-bypass><div class="info"><span class="name txt_ellipsis">{{name}}</span><span class="mail txt_ellipsis">{{email}} {{{departmentNames}}}</span></div></a></label></li>'),
					'listNull' : Hogan.compile('<li class="creat data_null"><span class="txt">{{search_result_null}}</span></li>'),
					'checkedUser' : Hogan.compile('<li data-userid="{{id}}"><span class="name">{{name}} {{position}}</span><span class="btn_wrap" data-btntype="attendeeDelete"><span class="ic ic_del"></span></span></li>')
				};
				
				var circleNodes = new CircleNodes({
					circle : options.circle,
					type : "member"
				});

				if(this.options.type == "circle"){
					this.collection = circleNodes;
				}else if(this.options.type == "department"){
					this.collection = new OrgDeptCollection();					
				}else{
					this.collection = new OrgCollection();
				}
				this.collection.on("reset",function(collection,response){
					_this.users = collection;
					var tplUsers = [],
						pagingTpl = null;
						checkedIds = _this.getCheckedIds();
						itemTpl = _this.options['isDept'] ? _this.tplUnit.listDept :_this.tplUnit.listUser;
						
					_this.items = collection.circle ? new Backbone.Collection(collection.listParser()) : collection;
				
					$.each(_this.items.toJSON(), function(k, v) {
						tplUsers.push(itemTpl.render(
							$.extend(v, {
								checked : $.inArray(v.id, checkedIds) > -1 ? "checked" : "",
						        thumbnail : _this.options.type == "circle" ? v.thumbnail : (GO.contextRoot + v.thumbnail).replace("//", "/"),
								departmentNames : function() {
									return this.departments && this.departments.length > 0 ? '<span class="part">|</span><span class="department">'+ this.departments.join(', ') + '</span>' : '';
								}
							})
						));
					});
					if(!tplUsers.length) tplUsers.push(_this.tplUnit.listNull.render(_this.options));
					
					//모바일 페이징 추가
					pagingTpl = GO.util.mPaging(collection);
					_this.$listEl.siblings('.paging, .search_result').remove();
					_this.$listEl.html(tplUsers.join('')).after(pagingTpl);
					
					//검색결과 출력
					if(response.data.keyword && collection.page.total > 0) {
						_this.$listEl.before(_this.tplUnit.search_result.render(
							$.extend(_this.options, {
								totalCount : GO.i18n(CommonLang["총건수"], { num: collection.page.total })
							})
						));
					}
				});
				
			},
			render : function() {
				var _this = this;
				this.unbindEvent();
				this.bindEvent();
				
				this.options = $.extend(this.options,arguments[0] || {});
				this.$el.html(OrgTpl(this.options));
				this.$listEl = this.$el.find('ul#userListEls');
				this.$checkedUserEl = this.$el.find('ul#userCheckedEls');
				$('body').append(this.el);
				
				this.getDeptUserList(0);
				
				$.each(this.options.checkedUser || [], function(k,v) {
					v.name = v.username;
					_this.addCheckedUserEl(v);
				});
			},
			search : function() {
				var keyword = this.$el.find('#searchKeyword').val();
				if (!keyword) alert(CommonLang["검색어를 입력하세요."]);
				this.getDeptUserList(0, keyword);
				return false;
			},
			searchReset : function() {
				this.$el.find('#searchKeyword').val('');
				return false;
			},
			searchKeyEvent : function(e) {
				e.preventDefault();
				if(e.keyCode == 13) this.search();
				return false;
			},
			getDeptUserList : function(page, keyword) {
				this.collection.type = keyword ? "tree/search" : "member";
				var param = {
					page : page || 0, 
					offset : 10, 
					keyword : keyword || ''
				};
				var options = {
						async : true , 
						reset : true
				};
				if (this.options.type=="circle") {
					options.beforeSend = function (xhr) {
						xhr.setRequestHeader('Content-Type', 'application/json');
					};
					options.type = "POST";
					if(keyword){
						var ajaxParam = $.param(param);
						this.collection.type = this.collection.type + "?" + ajaxParam;
					}
					options.data = JSON.stringify(this.collection.circle); 
				} else {
					options.data = param;
				}
				this.collection.fetch(options);
				$("#mobileOrg").css("min-height",$("#main").height() + "px");
			},
			getCheckedIds : function() {
				return $(this.$checkedUserEl.find('li')).map(function(k,v) {
					return Number($(v).attr('data-userid'));
				}).get();
			},
			getCheckedData : function() {
				return $(this.$checkedUserEl.find('li')).map(function(k,v) {
					return $(v).data();
				}).get();
			},
			changeCheckedUser : function(e, target) {
				var $eTarget = e ? $(e.currentTarget) : $(target),
					eId = $eTarget.val(),
					isChecked = $eTarget.is(':checked'),
					checkedData = null;
				
				this.$checkedUserEl.find('li[data-userid="'+eId+'"]').remove();
				if(isChecked) {
					checkedData = this.items.get(eId).toJSON();
					this.addCheckedUserEl(checkedData);
				} 
			},
			
			changeCheckedAll : function(e) {
				var $eTarget = $(e.currentTarget),
					isChecked = $eTarget.is(':checked');
				
				_.each(this.$listEl.find("input[type=checkbox]"), function(checkbox) {
					$(checkbox).attr("checked", isChecked);
					this.changeCheckedUser(null, checkbox);
				}, this);
			},
			
			deleteUserEl : function(e) {
				var $userEl = $(e.currentTarget).parents('li');
				var userCheckWrap = this.$el.find('#userCheckedScroll');
				this.$listEl.find('input[type="checkbox"][value="'+$userEl.data('userid')+'"]').removeAttr('checked');
				$userEl.remove();
				if(userCheckWrap.find('li').length == 0 ){
					userCheckWrap.hide();
				}
				return ;
			},
			addCheckedUserEl : function(data) {
				
				if(this.checkedUserScroll == null) {
					this.$el.find('#userCheckedScroll')
						.css({'position' : 'relative', 'max-height' : '98px'})
						.find('ul').css('padding' , '5 0');

					// ios 모바일 웹일경우만 예외 처리.
					var isIOSMobileWeb = !GO.util.isMobileApp() && (GO.util.checkOS() == 'iphone' || GO.util.checkOS() == 'ipad');
					this.checkedUserScroll = new IScroll('#userCheckedScroll', {
						bounce: false,
						disablePointer: true, // important to disable the pointer events that causes the issues
						disableMouse: false, // false if you want the slider to be usable with a mouse (desktop)
						disableTouch: isIOSMobileWeb, // false if you want the slider to be usable with touch devices
						preventDefault: isIOSMobileWeb
					});

					if (!isIOSMobileWeb) {
						this.checkedUserScroll.on('zoomStart', function(e) {
							$("#userCheckedScroll")
								.css('overflow-x', '')
								.css('overflow-y', '');
						});
						this.checkedUserScroll.on('zoomEnd', function(e) {
							$("#userCheckedScroll")
								.css('overflow-x', 'scroll')
								.css('overflow-y', 'hidden');
						});
					}
				} else {
					this.checkedUserScroll.refresh();
				}
				
				if (this.options.isSingleSelect) this.resetAll(data);
				
				var addEl = this.tplUnit.checkedUser.render(data);
				this.$el.find('#userCheckedScroll').show();
				this.$checkedUserEl.append($(addEl).data({
					id : data.id,
					name : data.name,
					position : data.position
				}));
				
			},
			checkedSave : function(e) {
				if(e) $(e.currentTarget).blur().trigger('focusout');
				if(typeof this.options.callback == 'function') this.options.callback(this.getCheckedData());
				this.back();
				return ;
			},
			back : function(e) {
				var self = this;
				setTimeout(function(){
					if(typeof self.options.backCallback == 'function') self.options.backCallback();
					$("#mobileOrg").remove();
					if(e) e.stopPropagation();
					return false;
				}, 500);
			},
			paging : function(e) {
				GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
				var direction = $(e.currentTarget).attr('data-direction'),
					cPage = this.items.page.page || 0;
				
				if(direction == 'prev' && cPage > 0) cPage--;
				else if(direction == 'next') cPage++;

				$(e.currentTarget).parents('.paging').remove();
				this.$listEl.empty();
				this.getDeptUserList(cPage);
				e.stopPropagation();
				return false;
			},
			
			
			resetAll : function(data) {
				this.$checkedUserEl.find("li[data-userid]").remove();
				this.$el.find('#userCheckedScroll').hide();
				this.$listEl.find("input:not(input[value=" + data.id + "])").attr("checked", false);
			}
		});
		
		return mobileOrgView;
		
	});
}).call(this);