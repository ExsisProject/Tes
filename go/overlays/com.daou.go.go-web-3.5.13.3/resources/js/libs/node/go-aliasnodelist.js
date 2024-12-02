/**
* Hogan, jQuery, jsTree에 종속적입니다.
*
*/
(function($) {
    
    $.goAliasNodeList = function (option) {
        if (arguments[0] === 'close') { 
            return this.close();
        } else {
            var nodeList = new AliasNodeList();
            nodeList.initialize(option);
            return nodeList;
        };
    };
    
    var AliasNodeList = function() {
        var isAjaxDouble = false;
        
        return {
            
            treeEl : null,
            defaults : {
                keyword: null,
                type: 'user',
                circle: null,
                selectQuery : '#memberList',
                callback: null,
                parentNodeId: null,
                parentNodeIds: [],
                parentNodeType: 'department',
                isAdmin: false,
                contextRoot : "/",
                isDndActive: false,
                dndDropTarget: null,
                dropCheck: null,
                dropFinish: null,
                dropTo: null,
                i18n: {},
                page: 0,
                css : {
                    'minHeight' : 375,
                    'maxHeight' : 400,
                    'overflow-y' : 'auto'
                }
            },
    
            /**
             * 옵션값을 결정하고, 화면을 렌더링 한다.
             * 
             */
            initialize: function(options) {
                this.options = $.extend({}, this.defaults);
                this.options.keyword = options.keyword;
                
                if (options.selectQuery) { this.options.selectQuery = options.selectQuery; }
                if (options.type) { this.options.type = options.type; }
                if (options.callback) { this.options.callback = options.callback; }
                if (options.parentNodeId) { this.options.parentNodeId = options.parentNodeId; }
                if (options.parentNodeType) { this.options.parentNodeType = options.parentNodeType; }
                if (options.parentNodeIds) { this.options.parentNodeIds = options.parentNodeIds; }
                if (options.isAdmin) { this.options.isAdmin = options.isAdmin; }
                if (options.contextRoot) { this.options.contextRoot = options.contextRoot; }
                if (options.isDndActive) { this.options.isDndActive = options.isDndActive; }
                if (options.dndDropTarget) { this.options.dndDropTarget = options.dndDropTarget; }
                if (options.dropCheck) { this.options.dropCheck = options.dropCheck; }
                if (options.dropFinish) { this.options.dropFinish = options.dropFinish; }
                if (options.dropOut) { this.options.dropOut = options.dropOut; }
                if (options.dropTo) { this.options.dropTo = options.dropTo; }
                if (options.page) { this.options.page = options.page; }
                if (options.css) { this.options.css = options.css; }
                if (options.circle) { this.options.circle = options.circle; }
                if (options.i18n) { this.options.i18n = options.i18n; }
                if (options.aliasId) { this.options.aliasId = options.aliasId; }
                
                this.$el = $(this.options.selectQuery);
                if (this.options.isAdmin) {
                    this.options.contextRoot = this.options.contextRoot + 'ad/';
                }
                
                this.render();
                return this;
            },
            
            render: function() {
                var ajaxURL = '',
                    ajaxData = {
                        'keyword' : this.options.keyword,
                        'page' : this.options.page,
                        'offset' : 30,
                        'id' : this.options.aliasId
                    },
                    self = this;
                
                // TODO: 이런 말도 안되는 종속성.. 외부에서 주입하는 것으로 변경할 것!
                
                ajaxURL = this.options.contextRoot + 'api/mail/alias';
                
                this._renderContainer();
                
                this.deferred = $.Deferred();
                
                var ajaxCallback = function(rs) {
                    if (rs.data && rs.data.length) {
                       	this._renderMemberList(rs.data);
                    }
                    else {
                        if (rs.page.page == 0) {
                            this._renderEmptyList();
                        }
                    }
                    
                    this.$el.off();
                    this._bindMemberEvent();
                    this._bindDeptEvent();
                    this._bindDNDEvent();
                    this._bindScrollEvent();
                    this.data = rs.data;
                    
                    this.deferred.resolve(this);
                };
                
                setTimeout(function(){
                    if(!isAjaxDouble){
                        isAjaxDouble = true;
                        self.ajaxCalling = $.ajax({
                            url : ajaxURL,
                            type : 'GET',
                            contentType : 'application/json',
                            data : ajaxData,
                            success: $.proxy(ajaxCallback, self)
                        }).always(function(){
                            isAjaxDouble = false;
                        });
                    }
                }, 200);
            },
            
            abortAjaxCall: function() {
                if (this.ajaxCalling) {
                    this.ajaxCalling.abort();
                }
            },
            
            /**
             * 현재 선택된 노드의 데이터를 반환한다.
             * 
             */
            getSelectedData: function() {
                var selected = $('a.jstree-clicked', this.$el);
                if (selected && selected.length > 0) {
                    return this._processSearchData(selected.parent());
                } else {
                    return {};
                }
            },

            /**
            * DND의 목적지가 되는 곳에는 ui-droppable이라는 class가 생성되어야 한다. (jQuery-Droppable 명세)
            * 혹시 그 대상을 다시 그렸다면, ui-droppable을 다시 추가해주어야 하며, 그 작업을 수행하는 메서드이다.
            *
            */
            addClassToDNDTarget: function() {
                this._bindDNDEvent();
            },
            
            _renderContainer: function() {
                if (this.options.page == 0) {
                    var tmpl = Hogan.compile([
                        '<div class="jstree jstree-default" id="searchDepartmentEl" style="border-bottom:1px dashed #c8c8c8;margin:5px;display:none">',
                        '    <ul class="department_list"></ul>',
                        '</div>',
                        '<ul class="member_list"></ul>',
                    ].join(''));
                    this.$el.empty().html(tmpl.render()).css(this.options.css);
                }
            },
            
            _renderMemberList: function(data) {
                var members = [],
                    memberTmpl = Hogan.compile([
                        '<li data-email="{{email}}">',
                        '   <a data-bypass>',
                        '       <ins class="worker"></ins>',
                        '       <span class="name" title="{{name}}">{{name}}</span>',
                        '   </a>',
                        '</li>'
                    ].join(''));
    
                $.each(data, function(k, v) {
                    if (v.nodeType != 'department') {
                        members.push(memberTmpl.render({ 
                            name : v.name,
                            email : v.email
                        }));
                    }
                });
    			this.$el.find("p.data_null").remove();
                
    			//* 말줄임현상(...) 제거 하기 위해 css 추가 (75px -> 125px) *//
    			this.$el.find('ul.member_list').append(members.join('')).find('span.name').css("max-width","125px");
            },
    
            _renderEmptyList: function() {
                var emptyTmpl = Hogan.compile('<p class="data_null"><span class="ic_data_type ic_no_part"></span>{{msg_no_search_result}}</p>');
                this.$el.find('#searchDepartmentEl').hide();
                this.$el.find('ul.member_list').empty().html(emptyTmpl.render({
                    'msg_no_search_result': this.options.i18n["검색결과가 없습니다."]
                }));
            },
    
            _bindMemberEvent: function() {
                var callback = function(e) {
                    var target = $(e.currentTarget);
                    this.$el.find('ul').find('li>a').removeClass('jstree-clicked');
                    target.find('a').addClass('jstree-clicked');
                    if (_.isFunction(this.options.callback)) {
                        this.options.callback(this._processSearchData(target), e);
                    }
                };
                
                this.$el.on('click contextmenu', 'ul.member_list > li', $.proxy(callback, this));
            },
            
            _bindDeptEvent: function() {
                
            	var selectMemberCallback = function(e){
            		var $target = $(e.currentTarget);
                    
                    this.$el.find('ul').find('li>a').removeClass('jstree-clicked');
                    $target.children('a').addClass('jstree-clicked');
                    if (_.isFunction(this.options.callback)) {
                        this.options.callback(this._processSearchData($target), e);
                    }
                    
                    return false;
                };
                
                this.$el.on('click contextmenu', 'ul.department_list > li > ul > li', $.proxy(selectMemberCallback, this));
            },
            
            _bindDNDEvent: function() {
                if (this.options.isDndActive) {
                    var ctx = this,
                        draggables = ['ul.member_list > li > a', 'ul.department_list > li > a'].join(', '),
                        draggableOpt = {
                            appendTo: ctx.options.dropTo,
                            helper: 'clone',
                            revert: 'invalid'
                        },
                        droppableOpt = {
                            accept: draggables,
                            over: function(e, ui) {
                                var data = ctx._processSearchData($(ui.draggable).parent());
                                ctx.options.dropCheck($(e.target), data);
                            },
                            out: function(e, ui) {
                                var data = ctx._processSearchData($(ui.draggable).parent());
                                 ctx.options.dropOut($(e.target), data);
                            },
                            drop: function(e, ui) {
                                var data = ctx._processSearchData($(ui.draggable).parent());
                                ctx.options.dropFinish($(e.target), data);
                            }
                        };
                    
                    $(draggables).draggable(draggableOpt);
                    $(this.options.dndDropTarget).droppable(droppableOpt);
                }
            },
            
            _bindScrollEvent: function() {
                this.$el.on('scroll', '', $.proxy(function(e) {
                    var $target = $(e.currentTarget);
                    if($target[0].scrollHeight-$target.scrollTop()-$target.height() < 15) {
                        this.options.page++;
                        this.render();
                        
                    }
                }, this));
            },
            
            /**
             * 특정 검색 결과의 선택된 노드 데이터를 GO에서 필요한 형태로 가공하여 반환한다.
             * 
             * @param selectedObj
             * @returns data
             */
            _processSearchData: function(selectedObj) {
                var deptIds = selectedObj.attr('data-dept-ids'),
                    isDept = (selectedObj.attr('rel') == 'org'),
                    data = {};
                
                data = {
                    'id' : selectedObj.data('id'),
                    'email' : selectedObj.data('email'),
                    'type' : (isDept) ? 'org' : 'MEMBER'
                };
                
                if (isDept) {
                    data['name'] = selectedObj.find('a:first').text();
                } else {
                    data['name'] = selectedObj.find('a span.name').text();
                    if(deptIds != null) data['deptId'] = (deptIds.indexOf(",") > 0) ? deptIds.substring(0, deptIds.indexOf(",")) : deptIds;
                    
                    var deptName = "";
                    
                    if(selectedObj.hasClass("jstree-leaf")){
                    	deptName = selectedObj.parents("li").find("a:first").text();
                    }else{
                    	deptName = selectedObj.find('a span.part').attr('title');
                    }
                    
                    data['deptName'] = deptName;
                    data['position'] = selectedObj.find('a span.position').text() || "";
                    data['displayName'] = data['name'] + ' ' + data['position'];
                }
                
                return data;
            },
            
            getData : function(){
                return this.data;
            }
        };
    };
    
})(jQuery);