/**
* Hogan, jQuery, jsTree, Backbone에 종속적입니다.
*
*/
(function($) {
    var aslice = Array.prototype.slice;
    var GG = $.goOrgTab = function () {
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
        lang: {
            'ko' : {
                "닫기" : "닫기",
                "선택" : "선택",
                "이름, 아이디" : "이름, 아이디",
                "이름, 이메일" : "이름, 이메일", 
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
            	"직책" : "직책"
            },
            'ja' : {
                "닫기" : "閉じる",
                "선택" : "選択",
                "이름, 아이디" : "名前、ID",
                "이름, 이메일" : "名前、メールアドレス", 
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
            	"직책" : "役職"
            },
            'en' : {
                "닫기" : "Close",
                "선택" : "Select",
                "이름, 아이디" : "Name, ID",
                "이름, 이메일" : "Name, Email", 
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
            	"직책" : "Title"
            },
            'zh_CN' : {
                "닫기" : "关闭",
                "선택" : "选择",
                "이름, 아이디" : "名字，ID",
                "이름, 이메일" : "名字，电子邮件", 
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
            	"직책" : "职位"
            },
            'zh_TW' : {
                "닫기" : "關閉",
                "선택" : "選擇",
                "이름, 아이디" : "名字，ID",
                "이름, 이메일" : "名字，電子郵件", 
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
            	"직책" : "職位"
            },
            'vi' : {
                "닫기" : "Đóng",
                "선택" : "Chọn",
                "이름, 아이디" : "Họ tên, tài khoản",
                "이름, 이메일" : "Name, Email", 
                "이름, 부서명, 아이디" : "Họ tên, tên phòng ban, tài khoản",
                "검색" : "Tìm kiếm",
                "더보기" : "Xem thêm",
                "조직순" : "Theo tổ chức",
                "가나다순" : "Theo Alphabet",
                "멤버가 없습니다." : "Không có thành viên",
                "검색결과가 없습니다." : "Không có kết quả tìm kiếm",
                "결과값이 많습니다. 검색을 이용해 주세요." : "Có nhiều giá trị kết quả. Vui lòng sử dụng tìm kiếm.",
           		"이름" : "Họ tên",
               	"부서" : "Phòng ban",
               	"아이디" : "Họ tên",
               	"전화번호" : "thoại nhà",
               	"직위" : "Chức vụ",
               	"직책" : "Chức trách"
            }
        },
        i18n : {},
        treeEl : null,
        defaults : {
            elId : 'orgTreeTab',
            orgElId : 'org_tree_tab_content',
            searchInputId : 'org_tree_tab_search_input',
            searchResultElId : 'memberList',
            contextRoot : '/',
            loadId: null,
            companyIds : [],
            includeLoadIds: [],
            isMyDeptOpened: true,
            isAdmin: false,
            isDndActive: false,
            multiCompanyVisible: false,
            dndDropTarget: null,
            dropCheck: null,
            dropOut: null,
            dropFinish: null,
            draggables : null,
            type: 'node',
            locale: 'ko',
            callback: null,
            css : {
                'minHeight' : 375,
                'maxHeight' : 375
            }
        },

        _isTreeShowing: false,
        _isSearchShowing: false,

        initialize: function(options) {
        	var useOrg = true;
            this.options = $.extend(true, {}, this.defaults, options);
            this.options.contextRoot = GO.contextRoot || this.options.contextRoot;
            this.i18n = this.lang[GO.session('locale')] || this.lang[this.options.locale];
            this.isAdmin = this.options.isAdmin;
            
            // DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
            if (!this.isAdmin) {
            	this.options.displayFormats = this._getDisplayFormats();            	
            }
            
            if (this.isAdmin) {
            	this.options.contextRoot = GO.contextRoot + 'ad/';
            }
            if(options.isOrgServiceOn != undefined){
                useOrg = options.isOrgServiceOn; //메일 쪽에서 사용할때 options로 받아서 사용
            }else{
            	if(this.isAdmin){
                    useOrg = GO.util.isUseOrgService(this.isAdmin);
                }else{
                    useOrg = GO.session("useOrgAccess");
                }
            }
            this.isOrgServiceOn = useOrg;

            this._renderTemplate();
            this._bindEvents();

            var searchEl = $('#' + this.options.searchResultElId);
            var treeEl = $('#' + this.options.orgElId).parent();
            if (this.isAdmin || this.isOrgServiceOn) {
            	this._loadNodeTree();
            } else {
            	treeEl.hide();
                searchEl.show();
                this._loadNodeList();
            }

            return this;
        },

        getSelectedData : function() {
            if (this._isTreeShowing) {
                return this.nodeTree.getSelectedData();
            }
            else {
                return this.nodeList.getSelectedData();
            }
        },

        /**
        * DND의 목적지(droppable)가 되는 곳에 DND가 가능하도록 다시 처리한다. (droppable의 HTML을 다시 그린 경우에 사용된다)
        */
        activateDNDDroppable: function() {
            if (this._isTreeShowing) {
                this.nodeTree.addClassToDNDTarget();
            }
            else {
                this.nodeList.addClassToDNDTarget();
            }
        },

        _bindEvents: function() {
            var el = $('#' + this.options.elId);
            // FireFox와 Opera 는 한글입력시 keyup 이벤트가 발생하지 않아, 인위적으로 keyup 이벤트 발생시킴
            var input = el.find('#' + this.options.searchInputId);
            input.off("keyup");
            if ($.browser.mozilla || $.browser.opera) {
            	input.imitateKeyEvent();
            }
            input.on("keyup", $.proxy(function(e) {
                var keyword = $(e.currentTarget).val();
                var searchEl = $("#" + this.options.elId).find("#" + this.options.searchResultElId);
                var treeEl = $("#" + this.options.elId).find('.orgTree');

                var self = this;
                clearTimeout(this.clearTimeOut);
                this.clearTimeOut = setTimeout(function(){
	                if (keyword == "" && self.isOrgServiceOn) {
	                    searchEl.hide();
	                    treeEl.show();
	                    self._loadNodeTree();
	                } else {
	                    treeEl.hide();
	                    searchEl.show();
	                    self._loadNodeList(keyword);
	                }

	                self.beforeKeyword = keyword;
            	}, 200);
            }, this));
        },

        _renderTemplate: function() {        	
        	var placeholder = this.i18n["이름, 아이디"];
        	
        	if(this.options.type === 'contact') {
        		placeholder = this.i18n["이름, 이메일"];
        	} else if(this.isOrgServiceOn){
        		placeholder = this.i18n['이름']+'/'+this.i18n['아이디']+'/'+this.i18n['부서']+'/'+this.i18n['직위']+'/'+this.i18n['직책']+'/'+this.i18n['전화번호'];
        	}
        	
        	var searchWraps = [
        	                   '<section class="search">',
        	                   '    <div class="search_wrap">',
        	                   '    	<form onsubmit="return false;">',
        	                   '        <input id="' +this.options.searchInputId+ '" class="search" type="text" placeholder="' +placeholder+ '" title="' +placeholder+ '" >',
        	                   '        <input class="btn_search" type="button" value="{{lang.search}}" title="{{lang.search}}" evt-rol="mail-search">',
        	                   ' 		</form>', 
        	                   '    </div>',
        	                   '    <div id="detailSearchLayerWrap" style="position:relative;display:none;z-index:60"></div>',
        	                   '</section>'
        	                   ];
        	
        	var contentWraps = [
        	                    '<div class="orgTree_wrap">',
        	                    '	<div class="orgTree content_tab_wrap">', 
        	                    '		<div id="' + this.options.orgElId + '"></div>',
        	                    '	</div>',
        	                    '	<div id="' + this.options.searchResultElId + '" class="content_tab_wrap" style="display: none;border:none;padding:5px 0px 5px 0px">',
        	                    '	</div>',
        	                    '</div>'
        	                    ];

            var htmls = this.options.type == 'department' ? contentWraps : searchWraps.concat(contentWraps); //부서일때는 검색input을 제공하지 않는다.

            var compiled = Hogan.compile(htmls.join(''));
            $('#' + this.options.elId).html(compiled.render({ lang: this.i18n }));
            $('#' + this.options.elId).find('input[placeholder]').placeholder();
        },

        _loadNodeTree: function() {
            this._isTreeShowing = true;
            this._isSearchShowing = false;
            this.nodeTree = $.goNodeTree({
                el : '#' + this.options.orgElId,
                css: this.options.css,
                useDisableNodeStyle : this.options.useDisableNodeStyle, // 조직도에서 disable style사용 여부. (결재선 수신자 탭 등..)
                useApprReception : this.options.useApprReception, // 전자결재 수신자 탭에서 쓰이는 옵션. param에 전달됨.
                useApprReference : this.options.useApprReference, // 전자결재 참조자 탭에서 쓰이는 옵션. param에 전달됨.
                receiveAllowType : this.options.receiveAllowType, // 전자결재 수신자 참조자 탭에서 쓰이는 옵션. ALL, DEPARTMENT, USER. USER일때 부서의 disable스타일을 적용하지 않는다.
                url : this.options.contextRoot + 'api/organization/list',
                loadId : this.options.loadId,
                companyIds : this.options.companyIds,
                includeLoadIds : this.options.includeLoadIds,
                type : this.options.type,
                isMyDeptOpened : (this.options.loadId == undefined) ? this.options.isMyDeptOpened : false,
                callback : $.proxy(function(data) {
                    if ($.isFunction(this.options.callback)) {
                        this.options.callback(data);
                    }
                }, this),
                contextRoot : GO.contextRoot,
                multiCompanyVisible : this.options.multiCompanyVisible,
                i18n : this.i18n || {},
                isAdmin : this.options.isAdmin,
                isDndActive: this.options.isDndActive,
                dndDropTarget: this.options.dndDropTarget,
                dropCheck: this.options.dropCheck,
                dropFinish: this.options.dropFinish,
                dropOut: this.options.dropOut,
                draggables : this.options.draggables, //draggles를 options화 한다.
                displayFormats : this.options.displayFormats	// DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
            });
        },

        _loadNodeList: function(keyword) {
            this._isTreeShowing = false;
            this._isSearchShowing = true;

            var options = {
                    keyword: keyword,
                    type: this.options.type,
                    multiCompanyVisible : this.options.multiCompanyVisible,
                    i18n : this.i18n || {},
                    isAdmin : this.options.isAdmin,
                    isOrgServiceOn : this.isOrgServiceOn,
                    parentNodeId: this.options.loadId,
                    parentNodeIds: this.options.includeLoadIds,
                    companyIds : this.options.companyIds,
                    parentSelector : "#" + this.options.elId,
                    useDisableNodeStyle : this.options.useDisableNodeStyle, // 조직도에서 disable style사용 여부. (결재선 수신자 탭 등..)
                    useApprReception : this.options.useApprReception, // 전자결재 수신자 탭에서 쓰이는 옵션. param에 전달됨.
                    useApprReference : this.options.useApprReference, // 전자결재 수신자 탭에서 쓰이는 옵션. param에 전달됨.
                    receiveAllowType : this.options.receiveAllowType,
                    selectQuery: '#' + this.options.searchResultElId,
                    isDndActive: this.options.isDndActive,
                    dndDropTarget: this.options.dndDropTarget,
                    dropCheck: this.options.dropCheck,
                    dropFinish: this.options.dropFinish,
                    dropOut: this.options.dropOut,
                    draggables : this.options.draggables,
                    contextRoot : GO.contextRoot,
                    css: this.options.css,
                    displayFormats : this.options.displayFormats	// DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
                };
            
            if (this.nodeList) {
                this.nodeList.abortAjaxCall();
                this.nodeList.initialize(options);
            } else {
                this.nodeList = $.goNodeList(options);            	
            }

        },
        
        _getDisplayFormats : function(){ //메일에서는 GO.config가 없어서 호환성 코드 처리 해야함
        	var displayFormats = {};
        	if(_.isFunction(GO.config)){
        		displayFormats['orgTreeModeratorFormat'] = this.convertDisplayFormat(GO.config('orgTreeModeratorFormat'));
               	displayFormats['orgTreeMemberFormat'] = this.convertDisplayFormat(GO.config('orgTreeMemberFormat'));
               	displayFormats['orgTreeMasterFormat'] = this.convertDisplayFormat(GO.config('orgTreeMasterFormat'));
        	}else if(!_.isUndefined(BASECONFIG)){ //메일에서만 이 변수가 있음.
        		displayFormats['orgTreeModeratorFormat'] = this.convertDisplayFormat(BASECONFIG.data.displayConfigModel['orgTreeModeratorFormat']);
               	displayFormats['orgTreeMemberFormat'] = this.convertDisplayFormat(BASECONFIG.data.displayConfigModel['orgTreeMemberFormat']);
               	displayFormats['orgTreeMasterFormat'] = this.convertDisplayFormat(BASECONFIG.data.displayConfigModel['orgTreeMasterFormat']);        		
        	}
        	return displayFormats;
        },
        
        convertDisplayFormat : function(displayFormat) {
            var result = (displayFormat || '');

            result = result.replace(/\{\{/g, '{');
            result = result.replace(/\}\}/g, '}');

            return result;
        }
    });

})(jQuery);