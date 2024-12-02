
/**
 * @version 0.0.1
 * @require     jQuery, jQuery.ui, jstree , go-style.css
 * @author  hyungmin@daou.co.kr
  */
(function($) {
    var aslice = Array.prototype.slice;
    var GG = $.goOrgSlide = function () {
        if(arguments[0] === 'close') { 
            return GG.close();
        } else {
            var args = aslice.call(arguments);
            return GG.initialize.apply(GG, args);
        };
    };
    
    $.fn.imitateKeyEvent = function() {
    	return this.each(function(){
    		var Observe = function(oEl) {
    			this._o = oEl;
    			this._value = oEl.value; 
    			this._bindEvents();
    		};
    		
    		Observe.prototype._bindEvents = function() {
    			var self = this;
    			var bind = function(oEl, sEvent, pHandler) {
	    			if (oEl.attachEvent) oEl.attachEvent('on' + sEvent, pHandler);
	    				else oEl.addEventListener(sEvent, pHandler, false);
	    			};
	    			bind(this._o, 'focus', function() {
	    				if (self._timer) clearInterval(self._timer);
	    				self._timer = setInterval(function() {
	    		     
	    				if (self._value != self._o.value) {
	    					self._value = self._o.value;
	    					self._fireEvent();
	    				}
	    		    }, 50);    		   
	    		});
	    		bind(this._o, 'blur', function() {
	    		    if (self._timer) clearInterval(self._timer);
	    		    self._timer = null;
	    		});
    		};
    		 
    		Observe.prototype._fireEvent = function() {
    			if (document.createEvent) {
    				var e;
    		   
    				if (window.KeyEvent) {
    					e = document.createEvent('KeyEvents');
    					e.initKeyEvent('keyup', true, true, window, false, false, false, false, 65, 0);    		     
    				} else {
    					e = document.createEvent('UIEvents');
    					e.initUIEvent('keyup', true, true, window, 1);
    					e.keyCode = 65;
    				}
    				this._o.dispatchEvent(e);
    			} else {
    				var e = document.createEventObject();
    				e.keyCode = 65;
    				this._o.fireEvent('onkeyup', e);
    			}
    		};    		
    		new Observe(this);
    	});
    };
    
    $.extend(GG,{
        version : '0.0.1',
        popupEl : null,
        keyword: null,
        callback : null,
        contextRoot : null,
        eventTime : null,
        eventId : null,
        defaultLocale : 'ko',
        lang: {
            'ko' : {
				"확인" : "확인",
            	"닫기" : "닫기",
            	"선택" : "선택",
            	"이름, 아이디" : "이름, 아이디",
            	"이름, 부서명, 아이디" : "이름, 부서명, 아이디",
            	"검색" : "검색",
            	"더보기" : "더보기",
            	"조직순" : "조직순",
            	"가나다순" : "가나다순",
            	"멤버가 없습니다." : "멤버가 없습니다.",
            	"검색결과가 없습니다." : "검색결과가 없습니다.",
                "결과값이 많습니다. 검색을 이용해 주세요." : "결과값이 많습니다. 검색을 이용해 주세요.",
                "이름" : "이름",
                "부서" : "부서",
                "아이디" : "아이디",
                "전화번호" : "전화",
            	"직위" : "직위",
            	"직책" : "직책",
                "먼저 조직도에서 항목을 선택하세요." : "먼저 조직도에서 항목을 선택하세요.",
            }, 
            'ja' : {
            	"확인" : "確認",
            	"닫기" : "閉じる",
            	"선택" : "選択",
            	"이름, 아이디" : "名前、ID",
            	"이름, 부서명, 아이디" : "名前、部署名、ID",
            	"검색" : "検索",
            	"더보기" : "もっと見る",
            	"조직순" : "組織順",
            	"가나다순" : "abc順",
            	"멤버가 없습니다." : "メンバーがありません。",
            	"검색결과가 없습니다." : "検索結果がありません。",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "結果値が多いです。検索を利用してください。",
                "이름" : "名前",
            	"부서" : "部署",
            	"아이디" : "ID",
            	"전화번호" : "電話",
            	"직위" : "職位",
                "직책" : "役職",
                "먼저 조직도에서 항목을 선택하세요." : "先に組織図で項目を選択してください。",
            },
            'en' : {
            	"확인" : "OK",
            	"닫기" : "Close",
            	"선택" : "Select",
            	"이름, 아이디" : "Name, ID",
            	"이름, 부서명, 아이디" : "Name, Department, ID",
            	"검색" : "Search",
            	"더보기" : "View More",
            	"조직순" : "By Organization",
            	"가나다순" : "By Alphabet",
            	"멤버가 없습니다." : "No Member",
            	"검색결과가 없습니다." : "No Result",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "There are too many results. Please use the search function.",
                "이름" : "Name",
            	"부서" : "Department",
            	"아이디" : "ID",
            	"전화번호" : "Phone",
            	"직위" : "Position",
                "직책" : "Title",
                "먼저 조직도에서 항목을 선택하세요." : "Select Item on the Organization ",
            },
            'zh_CN' : {
            	"확인" : "确认",
            	"닫기" : "关闭",
            	"선택" : "选择",
            	"이름, 아이디" : "名字，ID",
            	"이름, 부서명, 아이디" : "名字，部门名称，ID",
            	"검색" : "搜索",
            	"더보기" : "查看更多",
            	"조직순" : "组织顺序",
            	"가나다순" : "abc顺序",
            	"멤버가 없습니다." : "没有会员",
            	"검색결과가 없습니다." : "没有搜索结果。",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "结果太多。请使用搜索功能。",
                "이름" : "名字",
            	"부서" : "部门",
            	"아이디" : "ID",
            	"전화번호" : "电话",
            	"직위" : "职称",
                "직책" : "职位",
                "먼저 조직도에서 항목을 선택하세요." : "首先请在组织机构图选择项目。",
            },
            'zh_TW' : {
            	"확인" : "確認",
            	"닫기" : "關閉",
            	"선택" : "選擇",
            	"이름, 아이디" : "名字，ID",
            	"이름, 부서명, 아이디" : "名字，部門名稱，ID",
            	"검색" : "搜索",
            	"더보기" : "查看更多",
            	"조직순" : "組織順序",
            	"가나다순" : "abc順序",
            	"멤버가 없습니다." : "沒有會員",
            	"검색결과가 없습니다." : "沒有搜索結果。",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "結果太多。請使用搜索功能。",
                "이름" : "名字",
            	"부서" : "部門",
            	"아이디" : "ID",
            	"전화번호" : "電話",
            	"직위" : "職稱",
                "직책" : "職位",
                "먼저 조직도에서 항목을 선택하세요." : "首先請在組織機構圖選擇項目。",
            },
            'vi' : {
            	"확인" : "OK",
            	"닫기" : "Đóng",
            	"선택" : "Chọn",
            	"이름, 아이디" : "Họ tên, tài khoản",
            	"이름, 부서명, 아이디" : "Họ tên, tên phòng ban, tài khoản",
            	"검색" : "Tìm kiếm",
            	"더보기" : "Xem thêm",
            	"조직순" : "Theo tổ chức",
            	"가나다순" : "Theo Alphabet",
            	"멤버가 없습니다." : "Không có thành viên.",
            	"검색결과가 없습니다." : "Không có Kết quả tìm kiếm.",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "Có nhiều giá trị kết quả. Vui lòng sử dụng tìm kiếm.",
                "이름" : "Họ tên",
            	"부서" : "Phòng ban",
            	"아이디" : "Họ tên",
            	"전화번호" : "thoại nhà",
            	"직위" : "Chức vụ",
                "직책" : "Chức trách",
                "먼저 조직도에서 항목을 선택하세요." : "Select Item on the Organization ",
            }
        }, 
        i18n : {},
        defaults : {
            id : 'gpopupLayer',
            treeId : 'orgTree',
            type : 'list',// api명 기준 -  default : list(부서트리&멤버 - 멤버만 선택 가능) , department - 부서트리만, community - 멤버만, node : (부서트리&멤버 - 둘다 선택 가능)
            isAdmin : false,
            isMyDeptOpened : true,
            companyIds : null,
            multiCompanyVisible : false,
            selectedMember : null,
            tpl : {
                'wrap' : [
                       '<div class="layer_side layer_organogram" id="{popupId}" data-layer><aside class="go_organogram">',
                            '<header><h1><ins class="ic"></ins><span class="txt">{header}</span></h1>',
                            '<a class="btn_layer_x" data-bypass title="{msg_close}"><span class="ic"></span><span class="txt"></span></a></header>',
                       		'{tagWrap}',
                            '<div class="vertical_wrap"><p class="desc">{desc}</p><p class="desc headerOption" style="display:block;">{headerOption}</p></div>',
                            '{searchForm}',
                            '{contents}',
                            '<section class="extra_content"></section>',
                            '<footer class="btn_layer_wrap">',
                                '<a class="btn_minor_s" data-bypass><span class="txt">{msg_close}</span></a>',
                            '</footer>',
                        '</aside></div>' 
                ],
                'searchForm' : [
                            '<div class="search_wrap"><form onSubmit="return false;">',
                                    '<input class="search" type="text" placeholder="{msg_search_placeholder}" title="{msg_search_placeholder}">',
                                    '<input class="btn_search" type="submit" value="{msg_search}" title="{msg_search}"></form>',
                            '</div>',
                 ],
                'contentsTab' : ['<div class="tab_wrap" id="orgTabs">',
                              '<div id="orgTree" class="content_tab_wrap" style="height:100%;"><div></div></div>',
                              '<div id="memberList" class="content_tab_wrap xhidden" style="display:none"></div></div>',
                              
                ],
                'tagWrap' : ['<div class="data_result" id="orgTagWrap">',
                                 '<ul class="name_tag"></ul>',
                             '</div>'
                ],
                'tagItem' : ['<li data-id="{id}" data-type="{type}"><span class="name">{name} {position}</span><span class="btn_wrap"><span class="ic_classic ic_del" title="삭제"></span></span></li>']
            }
        },
        
        template : function(tpl,data){ 
            return tpl.replace(/{(\w*)}/g,function(m,key){return data.hasOwnProperty(key)? data[key]:"";}); 
        },
        
        getPopupEl : function() {
            return this.popupEl || $('#' + GG.defaults.id);
        },
        
        getHeaderHeight : function() {
            return $(this.isAdmin ? '.admin_header' : '.go_header').height();
        },
        
        close : function() {
            var popupEl = this.getPopupEl();
            popupEl.find('#orgTabs').empty();
            popupEl.remove();
//            $(window).unbind('scroll.org');
            $(document).trigger("hideLayer.goLayer");
            return false;
        },
        
        popupOffset : function(eventTarget , isInit) {
            var target = eventTarget || null,
                offsetTop = 0, 
                marginTop = 0,
                popupEl = GG.getPopupEl(),
                contentMinHeight = 200;
                contentMaxHeight = $(window).height()-500;
                contentHeight = 0;
                
            if(isInit == true) {
                contentHeight = parseInt($(window).innerHeight() - popupEl.find('.content_wrap:eq(0), .content_tab_wrap:eq(0)').offset().top - 120,10);
                if(contentHeight < contentMinHeight) contentHeight = contentMinHeight;
                popupEl.find('.content_wrap, .content_tab_wrap').css({
                    'minHeight' : contentMinHeight,
                    'maxHeight' : contentMaxHeight < contentMinHeight ? contentMinHeight : contentMaxHeight
                });
            }           
            
            if( target != null  && target.hasOwnProperty('currentTarget')) {
                offsetTop = $(target.currentTarget).offset().top-30;
                if (offsetTop < 50) offsetTop = 50;
                
                if ($(window).innerHeight()-offsetTop <  popupEl.height()) {
                    popupEl.css({'position' : 'absolute', 'bottom' : 40,  'right' : 10, 'top' : 'auto' });
                } else {
                    popupEl.css({'position' : 'absolute', 'top' : offsetTop, 'right' : 10  });
                }
                
            } else {
                popupEl.css({ 'position' : 'fixed', 'top' : 60, 'right' : 10 });
            }
        },
        
        initialize: function(options) {
            this.isAjaxDouble = false;
            this.options = $.extend(true, {}, this.defaults, options);
            this.selectedMember = [];
            
            // DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
            if (!this.options.isAdmin) {
            	this.options.displayFormats = this._getDisplayFormats();            	
            }
            
            if(options.useTag){
                this.originalCallback = options.callback; //view에서 정의한 callback을 따로 저장해둠.            	
            }
            if(this.options.lang && this.lang.hasOwnProperty(this.options.lang)) {
                this.i18n = this.lang[this.options.lang];
            } else {
                var locale = $('meta[name="locale"]').attr('content');
                if (locale == 'jp') {
                    // 메일 쪽에 Locale 키값이 GO와 일치하지 않아서 생긴 문제 처리. 
                    locale = 'ja';
                }
                if(locale && this.lang.hasOwnProperty(locale)) {
                    this.i18n = this.lang[locale];
                } else {
                    this.i18n = this.lang[this.defaultLocale];
                }
            }
            
            this.render();
            return this;
        }, 
        
        render : function() {
    
            var self = this,
                options = this.options,
                header  = options.header || this.i18n['선택'],
                headerOption = options.headerOption || '',
                desc = options.desc || '',
                contentTpl = GG.defaults.tpl.contentsTab,
                searchFormTpl = '',
                tagWrapTpl = '',
                searchPlaceholder = options.searchPlaceHolder || this.i18n['이름']+'/'+this.i18n['아이디']+'/'+this.i18n['부서']+'/'+this.i18n['직위']+'/'+this.i18n['직책']+'/'+this.i18n['전화번호'];
            this.circle = options.circle || null; // circle API 를 사용하는 경우. ex 업무 공유 설정
            this.popupEl = this.popupEl || null;
            this.companyIds = options.companyIds || [];
            this.loadId = options.loadId || '';     //필수 : 부서, 커뮤니티 ID
            this.includeLoadIds = options.includeLoadIds || [];     //부서인경우에만 추가로 사용할 부서 ID
            this.depts = options.depts || []; // 익명게시판 필터링할 때 해당 부서의 부서원을 리스트에 나타내고 싶을 때 쓰는 부서 데이터
            this.domainCodeIds = options.domainCodeIds || []; // 익명게시판 필터링할 때 해당 도메인 코드에 속한 유저를 나타내고 싶을 때 쓰는 도메인 코드 ID
            this.userIds = options.userIds || []; // 익명게시판 필터링할 때 해당 유저를 나타내고 싶을 때 쓰는 유저 ID
            this.type = options.type || this.defaults.type;     //조직도의 종류가 부서, 전사, 커뮤니티
            this.callback = options.callback || '';             // 확인 callback
            this.contextRoot = options.contextRoot || '';   
            this.isAdmin = options.isAdmin || this.defaults.isAdmin;
            this.buttons = options.buttons || null;             // 버튼 옵션 기본 제공, 있다면 orverride
            this.hideOrg = options.hasOwnProperty('hideOrg') ? options.hideOrg : this.loadId ? true : false,    // 하위부서 감추기 옵션(default : hide)
            this.searchUse = (this.type != "deleteDept");      // 검색 사용 유무 (부서만 나오는 경우에는 검색 제외)
            this.target = options.target || null;       //조직도가 호출될 위치를 지정하는 element
            this.isOrgServiceOn = this.getOrgUse(options); // 사이트 관리에서 조직도 서비스 on, off 여부
            this.searchPlaceHolder = this.isOrgServiceOn ? searchPlaceholder : this.i18n['이름, 아이디'];     //placeholder
            this.zIndex = options.zIndex;
            this.method = options.method || "GET"; // circle API는 parameter 길이 제한으로 인해 POST 를 사용한다.
            this.externalLang = options.externalLang || null; // 외부에서 주입하는 lang.  
            this.isOnlyOneMember = options.isOnlyOneMember || false; // 사용자가 유일해야 하는경우. ex) 업무 승인자는 유일해야 한다. 
            this.memberTypeLabel = options.memberTypeLabel || ""; // 부서원 추가 기능 사용시. popup에 노출시킬 멤버의 타입label ex) 참조자, 담당자, 승인자, 운영자 등
            this.isCustomType = options.isCustomType || false; // 원부서의 노드가 나타나게 하기 위한 옵션.
            this.isBatchAdd = options.isBatchAdd || false; // 부서원 일괄 추가기능 사용 여부
            this.useTag = options.useTag || false; // 노드를 눌렀을때 UI상단에 해당 정보를 태그형식으로 보여줄건지에 대한 여부
            this.useApprReception = options.useApprReception || false;
            this.useApprReference = options.useApprReference || false;
            this.useDisableNodeStyle = options.useDisableNodeStyle || false;
            
            this.multiCompanyVisible = options.multiCompanyVisible || false;
                // 단일 부서 			-> api:list, type:child, 	 scope:none						// 원부서 노드 나타나지 않음
				// 하위(O)				-> api:list, type:deptchild, scope:subdept					// 원부서 노드 나타나지 않음
				// 공유부서(O) 하위(O) 	-> api:list, type:custom,	 scope=subdept,	 includeIds		// 정상
				// 공유부서(O) 하위(X)	-> api:list, type:custom,	 scope=none,	 includeIds		// 정상
            
            if( this.popupEl ) {
                GG.close();
                GG.keyword = null;
            }
                
            if( GG.defaults.tpl[this.type] ) {
                contentTpl = GG.defaults.tpl[this.type];
            }
            
            //검색영역 - 부서선택 슬라이더를 제외하고 검색기능을 제공한다.          
            if( this.searchUse ) {
            	if( this.loadId || this.type == "circle")  {
            		this.searchPlaceHolder = this.i18n['이름, 아이디'];  
            	}
                searchFormTpl = GG.template(GG.defaults.tpl.searchForm.join(''), {
                    msg_search_placeholder : this.searchPlaceHolder,
                    msg_search : this.i18n['검색']
                });
            }
            
            if(this.useTag){
                tagWrapTpl = GG.template(GG.defaults.tpl.tagWrap.join(''));
            }
            //팝업뷰 렌더 
            this.popupEl = $(GG.template(GG.defaults.tpl.wrap.join(''), {
                msg_close : this.i18n["닫기"],
                tagWrap : tagWrapTpl,
                contents : contentTpl.join(''),
                searchForm : searchFormTpl,
                popupId : GG.defaults.id,
                header : header,    // title
                headerOption : headerOption,
                desc : desc         // sub title
            })).appendTo('body');
            
            $(document).trigger("showLayer.goLayer");
            
            this.popupEl.off();
            
            if( this.searchUse ) {
                this.popupEl.find('input[placeholder]').placeholder();
            }
            
            if( (!this.isOrgServiceOn && this.type != 'circle') || this.type == 'community' || this.type == 'domaincode' || this.type == "deleteDept" || this.type == 'complex') {
                this._renderNodeList();
            } else {
                this._renderNodeTree(options);
            }
            
            //검색 이벤트 bind
            if (this.searchUse) {
            	var input = this.popupEl.find('input.search');
            	// FireFox와 Opera 는 한글입력시 keyup 이벤트가 발생하지 않아, 인위적으로 keyup 이벤트 발생시킴
                if ($.browser.mozilla || $.browser.opera) {
                	input.imitateKeyEvent();
                }
                var setSearchTime;
                input.bind('keyup' , function(e) {
                	if( e.keyCode == 13 ) {
                        $(e.currentTarget).focus();
                        return false;
                    };
                	clearTimeout(this.clearTimeOut);
                	this.clearTimeOut = setTimeout(function(){
                        if( e ) {
                            var inputValue = $.trim($(e.currentTarget).val());
                            
                            if ( inputValue != '' && GG.keyword != inputValue ) {
                                $.proxy(GG._renderNodeList());
                            }
                            
                            GG.keyword = inputValue;
                            
                            if( inputValue == ''){
                                self.render();
                                self.nodeTree.deferred.done(function(){
                                    self.popupEl.find('input.search').focus();
                                });
                            }
                        };
                	}, 500);
                    
                    return false;
                });
            }
            
            //태그를 사용하는 경우(this.useTag)일경우 확인버튼을 자동으로 생성하고 view에서 받아온 callback을 확인버튼의 이벤트에 넘겨준다.
            if(this.useTag){
            	this.selectedMember = _.isArray(this.selectedMember) ? this.selectedMember : [];
            	this.callback = $.proxy(this._onAddMemberToTag, this); //nodeList는 this를 넘겨주고 nodeTree는 this.options를 넘기는 구조이므로 따로 처리.
            	this.options.callback = $.proxy(this._onAddMemberToTag, this);
            	this.popupEl.find('footer').prepend('<a class="btn_major_s" data-bypass id="btnConfirmCallback"><span class="txt">'+this.i18n['확인']+'</span></a>').bind('click.org', $.proxy(function(){
            		/***
            		 * 확인 버튼을 누를경우 view에서 받아온 callback 이벤트를 다시 넘겨준다.
            		 */
        			this.callback = this.originalCallback; 
            		this.options.callback = this.originalCallback;
            		this.callback(this._getTagItems());
        			GG.close();
            	}, this));
            	this.popupEl.find('ul.name_tag').on('click.org', 'span.ic_del', function(){self._removeSelectedMember(this)});
            	this._renderTag();
            }
            
            if (this.buttons != null) {
                var buttonWrap = this.popupEl.find('.btn_layer_wrap');
                $.each(this.buttons, function(k,v) {
                    buttonWrap.prepend('<a id="customButtons'+k+'" class="'+ (v.bclass || 'btn_major_s')+'" data-bypass=""><span class="txt">'+v.btext+'</span></a> ');
                    buttonWrap.find('#customButtons'+k).bind('click.org', function() {
                        if(typeof v.callback == 'function') {
                            var data = self._getSelectedData();
                            v.callback(data);
                        }   
                        if(v.autoClose) GG.close();
                    });
                });
            }
            
            this.popupEl.find('a.btn_layer_x, a.btn_minor_s').bind('click.org',function() { GG.close(); });
            this.popupEl.on("data:success", function(){
                GG.popupOffset(self.target, true);
            });
            
            this.popupEl.draggable({
                handle: "header, footer",
                containment : "parent",
                scroll : false,
                opacity: 0.9,
                start : function() {
                    
                },
                drag: function(event,ui){
                    
                }
            });
            
            if (this.zIndex) {
            	this.popupEl.css("z-index", this.zIndex);
            }
            return;
        },
        
        _getDisplayFormats : function(){ //메일에서는 GO.config가 없어서 호환성 코드 처리 해야함
        	var displayFormats = {};
        	if(_.isFunction(GO.config)){
        		displayFormats['orgTreeModeratorFormat'] = this.convertDisplayFormat(GO.config('orgTreeModeratorFormat'));
               	displayFormats['orgTreeMemberFormat'] = this.convertDisplayFormat(GO.config('orgTreeMemberFormat'));
               	displayFormats['orgTreeMasterFormat'] = this.convertDisplayFormat(GO.config('orgTreeMasterFormat'));
        	} else if(!_.isUndefined(BASECONFIG)){ //메일에서만 이 변수가 있음.
        		displayFormats['orgTreeModeratorFormat'] = this.convertDisplayFormat(BASECONFIG.data.displayConfigModel['orgTreeModeratorFormat']);
               	displayFormats['orgTreeMemberFormat'] = this.convertDisplayFormat(BASECONFIG.data.displayConfigModel['orgTreeMemberFormat']);
               	displayFormats['orgTreeMasterFormat'] = this.convertDisplayFormat(BASECONFIG.data.displayConfigModel['orgTreeMasterFormat']);        		
        	}
        	return displayFormats;
        },
        
        _onAddMemberToTag : function(data){
        	var self = this;
        	/***
        	 * user를 클릭할 경우 object형태로 넘어오는데 이떄는 array로 만들어준다.  
        	 */
        	var datas = $.isArray(data) ? data : $.isPlainObject(data) ? new Array(data) : [];
        	
        	/***
        	 * 중복을 제거하고 추가한다.
        	 */
        	var existIds = _.pluck(this._getTagItems(), 'id'); //기존 멤버들의 id
        	var toAddCollection = _.filter(datas, function(m){
        		return _.indexOf(existIds, m.id) == -1 //중복이 아닌 데이터들이 추가할 대상이다.
        	});
        	_.each(toAddCollection, function(m){
        		self.selectedMember.push(m)
        	});
        	this._renderTag();
        },
        
        _renderTag : function(){
        	$('#'+GG.defaults.id).find('ul.name_tag').empty();
        	$.each(this.selectedMember, function(i, v){
        		$('#'+GG.defaults.id).find('ul.name_tag').append(GG.template(GG.defaults.tpl.tagItem.join(''), {
        			id : this.id, 
        			name : this.name, 
        			position : this.position ? this.position : '', 
        			type : this.type
        		}));
        	});
        },
        
        _getTagItems : function(){
        	return this.selectedMember;
        },
        
        _removeSelectedMember : function(e){
        	var targetEl = $(e).closest('li');
        	var id = targetEl.data('id')
        	targetEl.remove();
        	var findIndex;
        	_.each(this.selectedMember, function(m, i){
        		if(m.id == id){
        			findIndex = i
        			return false;
        		}
        	});
        	this.selectedMember.splice(findIndex, 1);
        },
        
        _getSelectedData : function() {
            if (GG.type == 'department') {
                var noSelectedNodeTreeEl = this.nodeTree.$el.find("a.jstree-clicked").length == 0;
                var noSelectedNodeListEl = (!this.nodeList || this.nodeList.$el.find("a.jstree-clicked").length === 0);
                if (noSelectedNodeTreeEl && noSelectedNodeListEl) {
                    $.goSlideMessage(this.i18n['먼저 조직도에서 항목을 선택하세요.']);
                } else if (this.nodeTree.getSelectedData().name) {
                    return this.nodeTree.getSelectedData();
                } else {
                    return this.nodeList.getSelectedData();
                }
            }
        },

        _renderNodeTree: function(options) {
            this.nodeTree = $.goNodeTree({
                el : "#" + GG.defaults.treeId + ">div",
                url : [this.contextRoot, (this.isAdmin ? 'ad/' : ''),  'api/organization/'],
                companyIds : options.companyIds,
                loadId : options.loadId,
                includeLoadIds : options.includeLoadIds || [],     //부서인경우에만 추가로 사용할 부서 ID
                type : options.type || this.defaults.type,     //조직도의 종류가 부서, 전사, 커뮤니티
                i18n : this.i18n || {},
                contextRoot : options.contextRoot || '',   
                isMyDeptOpened : (options.loadId == undefined) ? options.isMyDeptOpened : false,
                isAdmin : options.isAdmin || this.defaults.isAdmin,
                hideOrg : options.hasOwnProperty('hideOrg') ? options.hideOrg : this.loadId ? true : false,    // 하위부서 감추기 옵션(default : hide)
                target : options.target || null,       //조직도가 호출될 위치를 지정하는 element
                circle : options.circle || null,
                method : options.method || "GET",
                depts : options.depts || [], // 익명게시판 필터링할 때 해당 부서의 부서원을 리스트에 나타내고 싶을 때 쓰는 부서 ID
                userIds : options.userIds || [], // 익명게시판 필터링할 때 해당 유저를 나타내고 싶을 때 쓰는 유저 ID
                externalLang : options.externalLang || null,
                isOnlyOneMember : options.isOnlyOneMember || false, //
                memberTypeLabel : options.memberTypeLabel || "",
                isCustomType : options.isCustomType || false,
                isBatchAdd : options.isBatchAdd || false,
                multiCompanyVisible : this.multiCompanyVisible,
                useApprReception : options.useApprReception,
                useApprReference : options.useApprReference,
                useDisableNodeStyle : options.useDisableNodeStyle,
                callback : $.proxy(function(data, e) {
                    if (e.type === 'click' || e.type === 'select_node') {
                        if ($.isFunction(options.callback)) {
                            options.callback(data);
                        }
                    }
                }, this),
                displayFormats : options.displayFormats	// DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
            });
        },
        
        _renderNodeList : function(page) {
            var keywordEl = GG.popupEl.find('input.search'),
                searchKeyword = $.trim(keywordEl.attr('placeholder') == keywordEl.val() ? '' : keywordEl.val());
            
            // keyword 리셋.
            if (!searchKeyword && this.type != 'community' && this.type != 'domaincode' && this.type != "deleteDept" && this.type != 'complex' && this.isOrgServiceOn) {
                this.popupEl.find('input.search').val('');
                this.popupEl.find('#memberList').hide();
                this.popupEl.find('#orgTree').show();
                return false;
            }
            
            this.popupEl.find('#orgTree').hide();
            $("#memberList").empty();
            this.nodeList = $.goNodeList({
                i18n : this.i18n,
            	circle : this.circle,
                type: this.type,
                companyIds: this.companyIds,
                isAdmin : this.isAdmin,
                parentNodeId: this.loadId,
                parentNodeIds: this.includeLoadIds,
                depts : this.depts || [], // 익명게시판 필터링할 때 해당 부서의 부서원을 리스트에 나타내고 싶을 때 쓰는 부서 ID
                userIds : this.userIds || [], // 익명게시판 필터링할 때 해당 유저를 나타내고 싶을 때 쓰는 유저 ID
                multiCompanyVisible : this.options.multiCompanyVisible,
                selectQuery: '#memberList',
                keyword: searchKeyword,
                isOrgServiceOn : this.isOrgServiceOn,
                contextRoot : this.contextRoot,
                isBatchAdd : this.isBatchAdd || false,
                externalLang : this.externalLang, // 외부에서 주입하는 lang.  
                isOnlyOneMember : this.isOnlyOneMember, // 사용자가 유일해야 하는경우. ex) 업무 승인자는 유일해야 한다. 
                memberTypeLabel : this.memberTypeLabel, // 부서원 추가 기능 사용시. popup에 노출시킬 멤버의 타입label ex) 참조자, 담당자, 승인자, 운영자 등
                isCustomType : this.isCustomType,
                useApprReception : this.useApprReception,
                useApprReference : this.useApprReference,
                useDisableNodeStyle : this.useDisableNodeStyle,
                method : this.method || "GET",
                multiCompanyVisible : this.multiCompanyVisible,
                hideOrg : this.hideOrg,
                callback: $.proxy(function(data, e) {
                    if (e.type === 'click' || e.type === 'select_node') {
                        if ($.isFunction(this.callback)) {
                            this.callback(data);
                        }
                    }
                }, this),
                displayFormats : this.displayFormats	// DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
            });
            
            this.nodeList.$el.show();
        },
        
        getOrgUse : function(options){
            var useOrg = true;
            
            if(options.isOrgServiceOn != undefined){
            	useOrg = options.isOrgServiceOn; //메일 쪽에서 사용할때 options로 받아서 사용
            }else{
            	if(this.isAdmin){
                    useOrg = GO.util.isUseOrgService(this.isAdmin);
                }else{
                    useOrg = GO.session("useOrgAccess");
                }
            }
            
            return useOrg;
        },
        
        convertDisplayFormat : function(displayFormat) {
            var result = (displayFormat || '');

            result = result.replace(/\{\{/g, '{');
            result = result.replace(/\}\}/g, '}');

            return result;
        }
    });
    
})(jQuery);