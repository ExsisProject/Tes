/*
 * 모바일조직도 레이어
 * */
(function() {
	define([ 
		"jquery",
		"backbone",
		"app",
		"hgn!approval/templates/mobile/document/m_doc_receive",
		"i18n!nls/commons",
	    "i18n!approval/nls/approval",
		"GO.util",
		"iscroll"
	],
	function(
		$,
		Backbone,
		App,
		ReceiveTpl,
		CommonLang,
		approvalLang
	) {
		
		var DocReceiveList = Backbone.Collection.extend({
			initialize: function(options) {
			    this.options = options || {};
				this.docId = this.options.docId;
				this.deptId = $(this.options.deptId).get();
			},
			model: Backbone.Model.extend(),
			url: function() {
				return '/api/approval/document/' + this.docId + "/receptionreader/" + this.deptId;			
			}
		});
		
		var OrgMemberCollection = Backbone.Collection.extend({
        	initialize : function(){
        		
        	}
		});
		
        var OrgCollection = Backbone.Collection.extend({
        	initialize : function(){
        		
        	},
            url: function() {
                var url = GO.config("contextRoot") + "api/organization/list?"+this.deptIdsParam+"&type=custom&scope=none";
                return url;
            },
            setDeptIdsUrlParam : function(ids){
            	var deptId = '';
            	var includeDeptIdsString = [];
            	if(_.isArray(ids) && ids.length == 1){
            		deptId = ids.slice(0, 1);
            		includeDeptIdsString.push('deptid='+deptId);
            	}else if(_.isArray(ids) && ids.length > 1){
            		deptId = ids.slice(0, 1);
            		includeDeptIdsString.push('deptid='+deptId);
            		
            		$(ids).slice(1).each(function(k, v){
            			includeDeptIdsString.push('includeDeptIds[]='+v);
            		});
            	}
            	this.deptIdsParam = $(includeDeptIdsString).get().join('&');
            }
        });
		
		
		var mobileOrgView = Backbone.View.extend({
			id: 'mobileOrg',
			attributes : {
				'data-role' : 'layer',
				'style' : 'background:#fff; position:absolute; width:100%; min-height:100%; top:0; left:0; z-index:999'
			},
			unbindEvent : function() {
				this.$el.off("vclick", "a[data-btn='cancel']");
				this.$el.off("vclick", "a[data-btn='ok']");
				this.$el.off("vclick", "li span.ic_del");
				this.$el.off("change", "ul#userListEls input[value]");
				this.$el.off("change", "input#userCheckedAll");
			},
			bindEvent : function() {
				this.$el.on("vclick", "a[data-btn='cancel']", $.proxy(this.back, this));
				this.$el.on("vclick", "a[data-btn='ok']", $.proxy(this.checkedSave, this));
				this.$el.on("vclick", "ul#userCheckedEls span.ic_del", $.proxy(this.deleteUserEl, this));		
				this.$el.on("change", "ul#userListEls input[value]", $.proxy(this.changeCheckedUser, this));
				this.$el.on("change", "input#userCheckedAll", $.proxy(this.changeCheckedAll, this))
			},
			initialize : function(options) {
				var _this = this;
			    this.options = options || {};
				this.$listEl = null;
				this.$checkedUserEl = null;
				this.checkedUserScroll = null;
				this.docReceive = null;
				this.checkedUser = null;
				this.docId = this.options.docId;
				this.deptId = this.options.receptAddDeptId;
				var defaultOpt = {
					'offset' : 100,
					'btn_ok' : CommonLang['확인'],
					'btn_cancel' : CommonLang['취소']
				};
				
				$.extend(this.options, defaultOpt);
				this.docReceive = new DocReceiveList({
							docId : _this.docId,
							deptId :_this.deptId
						});
				this.docReceive.fetch({async:false});
				this.checkedUser = 	this.docReceive.toJSON();
				this.tplUnit = {
					'search_result' : Hogan.compile('<div class="search_result"><input type="checkbox" id="userCheckedAll"><span class="txt">{{search_result}} {{{totalCount}}}</span></div>'),
					'listUser' : Hogan.compile('<li><input type="checkbox" value="{{metadata.id}}" id="userSort{{metadata.id}}" {{checked}}><label for="userSort{{data.id}}"><a class="tit" data-bypass><div class="photo"><img src="{{metadata.thumbnail}}"></div><div class="info"><span class="name txt_ellipsis">{{metadata.name}} {{metadata.position}}</span><span class="mail txt_ellipsis">{{metadata.email}} {{deptName}}</span></div></a></label></li>'),
					'listNull' : Hogan.compile('<li class="creat data_null"><span class="txt">{{search_result_null}}</span></li>'),
					'checkedUser' : Hogan.compile('<li data-userid="{{metadata.id}}"><span class="name">{{metadata.name}} {{metadata.position}}</span><span class="btn_wrap" data-btntype="attendeeDelete"><span class="ic ic_del"></span></span></li>')
				};
				
				this.collection = new OrgCollection();
				this.childCollection = new OrgMemberCollection();
				this.collection.on("reset",function(collection,response){
					var tplUsers = [],
						checkedIds = _this.getCheckedIds(),
						deptName;
					_.each(collection.models, function(model, index){
						deptName = model.get('metadata').name;
						_.each(model.get('children'), function(m, i){
							m['deptName'] = deptName;
							_this.childCollection.add(m);//child에 부서정보 셋팅					
						}); 
					});
					$.each(_this.childCollection.toJSON(), function(k,v) {
						tplUsers.push(_this.tplUnit.listUser.render(
							$.extend(v, {
								checked : $.inArray(v.metadata.id, checkedIds) > -1 ? "checked" : ""
							})
						));
					});
					if(!tplUsers.length) tplUsers.push(_this.tplUnit.listNull.render(_this.options));
					
					//모바일 페이징 추가
					_this.$listEl.html(tplUsers.join(''));

				});
				
			},
			render : function() {
				var _this = this;
				this.unbindEvent();
				this.bindEvent();
				this.options = $.extend(this.options,arguments[0] || {});
				this.$el.html(ReceiveTpl(this.options));
				this.$listEl = this.$el.find('ul#userListEls');
				this.$checkedUserEl = this.$el.find('ul#userCheckedEls');
				$('body').append(this.el);
				
				this.getUserList('', this.deptId);
				var metadataObj = {};
				$.each(this.checkedUser || [], function(k,v) {
					metadataObj = {
							id : v.reader.id,
							name : v.reader.name,
							position : v.reader.position,
							deptId : v.reader.deptId
					}
					
					_this.addCheckedUserEl({metadata : metadataObj})
					
				});
			},
			getUserList : function(keyword, deptId) {
				this.collection.setDeptIdsUrlParam(deptId);
				this.collection.fetch({async:true,reset:true});
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
			changeCheckedUser : function(e) {
				var $eTarget = $(e.currentTarget),
					eId = $eTarget.val(),
					isChecked = $eTarget.is(':checked'),
					checkedData = null;
				
				this.$checkedUserEl.find('li[data-userid="'+eId+'"]').remove();
				if(isChecked) {
					var target;
		        	target = this.childCollection.find(function(m){
		        		return eId == m.toJSON().metadata['id'];
		        	});
					checkedData = target.toJSON();
					this.addCheckedUserEl(checkedData);
				}
				
				this.checkedSameUser(eId, isChecked);
				this._toggleCheckedScrollCss();
			},
			
			checkedSameUser : function(eId, isChecked){
				this.$listEl.find('input[value="'+eId+'"]').attr('checked', isChecked);
			},
			
			changeCheckedAll : function(e) {
				var $eTarget = $(e.currentTarget),
					isChecked = $eTarget.is(':checked'),
					selector = 'input[type="checkbox"]' + (isChecked ? '[checked!="checked"]' : ':checked');
				
				$.each(this.$listEl.find(selector), function(k,v) {
					$(v).trigger('click');
				});
			},
			
			deleteUserEl : function(e) {
				var $userEl = $(e.currentTarget).parents('li');
				this.$listEl.find('input[type="checkbox"][value="'+$userEl.data('userid')+'"]').removeAttr('checked');
				$userEl.remove();
				
				this._toggleCheckedScrollCss();
				return ;
			},
			
			addCheckedUserEl : function(data) {
			    var $scroll = this.$el.find('#userCheckedScroll');
				if(this.checkedUserScroll == null) {
				    $scroll.css({ 'position' : 'relative', 'max-height' : '98px' }).find('ul').css({ 'padding': '5 0' });
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
				
				var addEl = this.tplUnit.checkedUser.render(data);
				this.$checkedUserEl.append($(addEl).data({
					id : data.metadata.id,
					name : data.metadata.name,
					position : data.metadata.position
				}));
				
				this._toggleCheckedScrollCss();
			},
			
			_toggleCheckedScrollCss: function() {
			    var $scroll = this.$el.find('#userCheckedScroll'),
			        $checkedUserList = this.$checkedUserEl.find('li');
			    
		        if ($checkedUserList.length > 0) {
		            $scroll.attr('class', 'list_employee');
		        }
		        else {
		            $scroll.attr('class', '');
		        }
			},
			
			checkedSave : function(e) {
				
				if(confirm(approvalLang['저장하시겠습니까?'])) {
					if(e) $(e.currentTarget).blur().trigger('focusout');
					if(typeof this.options.callback == 'function') {
						this.options.callback(this.getCheckedData());
					}
					this.back();
					return ;				
				}
			},
			
			back : function(e) {
				window.history.back();
				if(e) e.stopPropagation();
				return false;
			}
			
		});
		
		return mobileOrgView;
		
	});
}).call(this);