
/**
 * @version 0.0.1
 * @require     jQuery, jQuery.ui, jstree , go-style.css
 * @author  hyungmin@daou.co.kr
  */
(function($) {
    var aslice = Array.prototype.slice;
    var GG = $.goAliasOrgSlide = function () {
        if(arguments[0] === 'close') { 
            return GG.close();
        } else {
            var args = aslice.call(arguments);
            return GG.initialize.apply(GG, args);
        };
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
            	"닫기" : "닫기",
            	"선택" : "선택",
            	"이름, 아이디" : "별칭 이름, 아이디",
            	"검색" : "검색",
            	"더보기" : "더보기",
            	"조직순" : "조직순",
            	"가나다순" : "가나다순",
            	"멤버가 없습니다." : "멤버가 없습니다.",
            	"검색결과가 없습니다." : "검색결과가 없습니다.",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "결과값이 많습니다. 검색을 이용해 주세요."
            }, 
            'ja' : {
            	"닫기" : "閉じる",
            	"선택" : "選択",
            	"이름, 아이디" : "エイリアス名、ID",
            	"검색" : "検索",
            	"더보기" : "もっと見る",
            	"조직순" : "組織順",
            	"가나다순" : "abc順",
            	"멤버가 없습니다." : "メンバーがありません。",
            	"검색결과가 없습니다." : "検索結果がありません。",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "結果値が多いです。検索を利用してください。"
            },
            'en' : {
            	"닫기" : "Close",
            	"선택" : "Select",
            	"이름, 아이디" : "Alias Nname, ID",
            	"검색" : "Search",
            	"더보기" : "View More",
            	"조직순" : "By Organization",
            	"가나다순" : "By Alphabet",
            	"멤버가 없습니다." : "No Member",
            	"검색결과가 없습니다." : "No Result",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "There are too many results. Please use the search function."
            },
            'zh_CN' : {
            	"닫기" : "关闭",
            	"선택" : "选择",
            	"이름, 아이디" : "别名，ID",
            	"검색" : "搜索",
            	"더보기" : "查看更多",
            	"조직순" : "组织顺序",
            	"가나다순" : "abc顺序",
            	"멤버가 없습니다." : "没有会员",
            	"검색결과가 없습니다." : "没有搜索结果。",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "结果太多。请使用搜索功能。"
            },
            'zh_TW' : {
            	"닫기" : "關閉",
            	"선택" : "選擇",
            	"이름, 아이디" : "別名，ID",
            	"검색" : "搜索",
            	"더보기" : "查看更多",
            	"조직순" : "組織順序",
            	"가나다순" : "abc順序",
            	"멤버가 없습니다." : "沒有會員",
            	"검색결과가 없습니다." : "沒有搜索結果。",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "結果太多。請使用搜索功能。"
            },
            'vi' : {
            	"닫기" : "Đóng",
            	"선택" : "Chọn",
            	"이름, 아이디" : "Họ tên, tài khoản",
            	"검색" : "Tìm kiếm",
            	"더보기" : "Xem thêm",
            	"조직순" : "Theo tổ chức",
            	"가나다순" : "Theo Alphabet",
            	"멤버가 없습니다." : "Không có thành viên.",
            	"검색결과가 없습니다." : "Không có Kết quả tìm kiếm.",
            	"결과값이 많습니다. 검색을 이용해 주세요." : "Có nhiều giá trị kết quả. Vui lòng sử dụng tìm kiếm."
            }
        }, 
        i18n : {},
        defaults : {
            id : 'gpopupLayer',
            treeId : 'orgTree',
            type : 'list',// api명 기준 -  default : list(부서트리&멤버 - 멤버만 선택 가능) , department - 부서트리만, community - 멤버만, node : (부서트리&멤버 - 둘다 선택 가능)
            isAdmin : false,
            isMyDeptOpened : true,
            tpl : {
                'wrap' : [
                       '<div class="layer_side layer_organogram" id="{popupId}"><aside class="go_organogram">',
                            '<header><h1><ins class="ic"></ins><span class="txt">{header}</span></h1>',
                            '<a class="btn_layer_x" data-bypass title="{msg_close}"><span class="ic"></span><span class="txt"></span></a></header>',
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
                                    '<input class="search" type="text" placeholder="{msg_search_placeholder}">',
                                    '<input class="btn_search" type="submit" value="{msg_search}" title="{msg_search}"></form>',
                            '</div>',
                 ],
                'contentsTab' : ['<div class="tab_wrap" id="orgTabs">',
                              '<div id="orgTree" class="content_tab_wrap"><div></div></div>',
                              '<div id="memberList" class="content_tab_wrap xhidden" style="display:none"></div></div>',
                              
                ]
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
            $(window).unbind('scroll.org');
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
                setSearchTime = null,
                searchFormTpl = '';
            
            this.circle = options.circle || null;
            this.popupEl = this.popupEl || null;
            this.loadId = options.loadId || '';     //필수 : 부서, 커뮤니티 ID
            this.includeLoadIds = options.includeLoadIds || [];     //부서인경우에만 추가로 사용할 부서 ID
            this.type = options.type || this.defaults.type;     //조직도의 종류가 부서, 전사, 커뮤니티
            this.callback = options.callback || '';             // 확인 callback
            this.contextRoot = options.contextRoot || '';   
            this.isAdmin = options.isAdmin || this.defaults.isAdmin;
            this.buttons = options.buttons || null;             // 버튼 옵션 기본 제공, 있다면 orverride
            this.hideOrg = options.hasOwnProperty('hideOrg') ? options.hideOrg : this.loadId ? true : false,    // 하위부서 감추기 옵션(default : hide)
            this.searchUse = (this.type != 'department');      // 검색 사용 유무 (부서만 나오는 경우에는 검색 제외)
            this.target = options.target || null;       //조직도가 호출될 위치를 지정하는 element
            this.searchPlaceHolder = this.i18n['이름, 아이디'];     //placeholder
            this.zIndex = options.zIndex;
            this.aliasId = options.aliasId;                       //호출한 별칭 계정 id (수정의 경우 자기 자신을 제거하기위해)
            
            if( this.popupEl ) {
                GG.close();
                GG.keyword = null;
            }
                
            if( GG.defaults.tpl[this.type] ) {
                contentTpl = GG.defaults.tpl[this.type];
            }
            
            //검색영역 - 부서선택 슬라이더를 제외하고 검색기능을 제공한다.          
            if( this.searchUse ) {
                searchFormTpl = GG.template(GG.defaults.tpl.searchForm.join(''), {
                    msg_search_placeholder : this.searchPlaceHolder,
                    msg_search : this.i18n['검색']
                });
            }
            
            //팝업뷰 렌더 
            this.popupEl = $(GG.template(GG.defaults.tpl.wrap.join(''), {
                msg_close : this.i18n["닫기"],
                contents : contentTpl.join(''),
                searchForm : searchFormTpl,
                popupId : GG.defaults.id,
                header : header,    // title
                headerOption : headerOption,
                desc : desc         // sub title
            })).appendTo('body');
            
            this.popupEl.off();
            
            if( this.searchUse ) {
                this.popupEl.find('input[placeholder]').placeholder();
            }
            
            this._renderAliasNodeList();
            
            /*
            if( (!this.isOrgServiceOn && this.type != 'circle') || this.type == 'community' || this.type == 'domaincode' ) {
                this._renderNodeList();
            } else {
                this._renderNodeTree(options);
            }
            */
            
            //검색 이벤트 bind
            if (this.searchUse) {
                this.popupEl.find('input.search').bind('keyup' , function(e) {
                	
                	clearTimeout(this.clearTimeOut);
                	this.clearTimeOut = setTimeout(function(){
                        if( e.keyCode == 13 ) {
                            GG._renderAliasNodeList();
                            $(e.currentTarget).focus();
                            return false;
                        };
                        
                        if( e ) {
                            var inputValue = $.trim($(e.currentTarget).val());
                            
                            if ( inputValue != '' && GG.keyword != inputValue ) {
                                $.proxy(GG._renderAliasNodeList());
                            }
                            
                            GG.keyword = inputValue;
                            
                            if( inputValue == ''){
                                self.render();
                                self.nodeTree.deferred.done(function(){
                                    self.popupEl.find('input.search').focus();
                                });
                            }
                        };
                	}, 200);
                    
                    return false;
                });
                
                this.popupEl.find('input.btn_search').bind('click', function(e) {
                    GG._renderAliasNodeList();
                });
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
        
        _getSelectedData : function() {
            if (GG.type == 'department') {
                return this.nodeTree.getSelectedData();
            };
        },
        
        _renderAliasNodeList : function(page) {
            var keywordEl = GG.popupEl.find('input.search'),
                searchKeyword = $.trim(keywordEl.attr('placeholder') == keywordEl.val() ? '' : keywordEl.val());
            
            // keyword 리셋.
            /*
            if (!searchKeyword) {
                this.popupEl.find('input.search').val('');
                this.popupEl.find('#memberList').hide();
                this.popupEl.find('#orgTree').show();
                return false;
            }
            */
            
            this.popupEl.find('#orgTree').hide();
            $("#memberList").empty();
            this.nodeList = $.goAliasNodeList({
                i18n : this.i18n,
            	circle : this.circle,
                type: this.type,
                isAdmin : this.isAdmin,
                parentNodeId: this.loadId,
                parentNodeIds: this.includeLoadIds,
                selectQuery: '#memberList',
                keyword: searchKeyword,
                contextRoot : this.contextRoot,
                aliasId : this.aliasId,
                callback: $.proxy(function(data, e) {
                    if (e.type === 'click' || e.type === 'select_node') {
                        if ($.isFunction(this.callback)) {
                            this.callback(data);
                        }
                    }
                }, this)
            });
            
            this.nodeList.$el.show();
        }
    });
    
})(jQuery);