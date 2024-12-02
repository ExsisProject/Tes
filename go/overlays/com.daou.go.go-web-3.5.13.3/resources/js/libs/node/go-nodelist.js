/**
* Hogan, jQuery, jsTree에 종속적입니다.
*
*/
(function($) {
    
    $.goNodeList = function (option) {
        if (arguments[0] === 'close') { 
            return this.close();
        } else {
            var nodeList = new NodeList();
            nodeList.initialize(option);
            return nodeList;
        };
    };
    
    var NodeList = function() {
        var isAjaxDouble = false;
        
        return {
            
            treeEl : null,
            defaults : {
                keyword: null,
                type: 'user',
                circle: null,
                selectQuery : '#memberList',
                callback: null,
                companyIds: [],
                parentNodeId: null,
                parentNodeIds: [],
                parentNodeType: 'department',
                multiCompanyVisible : false,
                isAdmin: false,
                contextRoot : "/",
                isDndActive: false,
                dndDropTarget: null,
                dropCheck: null,
                dropFinish: null,
                i18n: {},
                page: 0,
                method : "GET", 
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
                this.options.draggables = options.draggables || ['ul.member_list > li > a', 'ul.department_list > li > a', 'ul > li > a[rel]'].join(', ');
                this.options.useDisableNodeStyle = _.isBoolean(options.useDisableNodeStyle) ? options.useDisableNodeStyle : false; // 조직도에서 disable style사용 여부. (결재선 수신자 탭 등..)
                this.options.useApprReception = _.isBoolean(options.useApprReception) ? options.useApprReception : false; // 전자결재 수신자탭에서 쓰이는 옵션. true면 url에 useReception=true로 넘긴다. 없으면 안넘김. 이 flag를 type에 따라 구분하는게 더 복잡해서 별도 옵션을 두었음..
                this.options.useApprReference = _.isBoolean(options.useApprReference) ? options.useApprReference : false; // 전자결재 참조자탭에서 쓰이는 옵션. true면 url에 useReference=true로 넘긴다. 없으면 안넘김....
                this.options.receiveAllowType = options.receiveAllowType || 'ALL'; // 전자결재 탭(수신자, 참조자)에서 넘어오는 값. 'ALL', 'USER', 'DEPARTMENT'중 한개..'USER'일때는 disable스타일 적용시키지 않는다...
                if (options.page) { this.options.page = options.page; }
                if (options.css) { this.options.css = options.css; }
                if (options.circle) { this.options.circle = options.circle; }
                if (options.i18n) { this.options.i18n = options.i18n; }
                if (options.isOrgServiceOn) { this.options.isDeptUse = options.isOrgServiceOn; }
                if (options.method) { this.options.method = options.method; }
                if (options.type) { this.options.isDeleteDept = this.options.type == 'deleteDept' ? true : false; }
                if (options.companyIds) { this.options.companyIds = options.companyIds; };
                if (options.multiCompanyVisible) {this.options.multiCompanyVisible = options.multiCompanyVisible; };
                this.depts = options.depts || []; // 익명게시판 필터링할 때 해당 부서의 부서원을 리스트에 나타내고 싶을 때 쓰는 부서 ID
                this.userIds = options.userIds || []; // 익명게시판 필터링할 때 해당 유저를 나타내고 싶을 때 쓰는 유저 ID

                this.options.isBatchAdd = options.isBatchAdd || false;
                if (options.externalLang) {this.options.externalLang = options.externalLang; };
                this.options.isOnlyOneMember = options.isOnlyOneMember || false;
                if (options.memberTypeLabel) {this.options.memberTypeLabel = options.memberTypeLabel; };
                this.options.isCustomType = options.isCustomType || false;
                if (options.hideOrg) { this.hideOrg = options.hideOrg; };
                /**
                 * 궁극적으로는 parent 에 대한 정보가 있어야 한다.
                 */
                if (options.parentSelector) {
                    this.$el = $(options.parentSelector).find(this.options.selectQuery);
                } else {
                    this.$el = $(this.options.selectQuery);
                }
                
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
                        'offset' : 30
                    },
                    self = this,
                    noneresult = false;
                // TODO: 이런 말도 안되는 종속성.. 외부에서 주입하는 것으로 변경할 것!           
                if (this.options.type == 'community') {
                    // 커뮤니티 사용자 검색인 경우
                    ajaxURL = this.options.contextRoot + 'api/community/members';
                    ajaxData['nodeId'] = this.options.parentNodeId;
                    ajaxData['nodeType'] = 'community';
                }
                else if (this.options.type == 'domaincode') {
                    // 도메인 코드 검색인 경우
                    ajaxURL = this.options.contextRoot + 'api/organization/sort/list/domaincode';
                    ajaxData['domainCodeIds'] = this.options.parentNodeIds;
                }
                else if (this.options.type == 'complex') {
                    // 복합 검색인 경우
                    ajaxURL = this.options.contextRoot + 'api/organization/sort/list/complex';
                    ajaxData['domainCodeIds'] = this.options.parentNodeIds;
                    ajaxData['userIds'] = this.userIds;
                    ajaxData['depts'] = this.depts;
                }
    	        else if (this.options.type == "circle"){
    	            // 써클 기반 검색인 경우
    	        	var param = $.param(ajaxData);
    	        	ajaxURL = this.options.contextRoot + 'api/org/circle/tree/search?' + param;
    	        	ajaxData = JSON.stringify(this.options.circle);
    	        }
                else if(this.options.type == 'org'){
                	// org 에서만 전화번호 검색이 가능하게 하기위해
                    //ajaxURL = this.options.contextRoot + 'api/user/sort/list';
                	ajaxURL = this.options.contextRoot + 'api/org/user/sort/list';
                    ajaxData['nodeType'] = 'org';
                }
                else if(this.options.type == 'department'){
                	ajaxURL = this.options.contextRoot + 'api/organization/dept/search';
                    if (this.options.multiCompanyVisible) {
                        ajaxData['withMultiCompany'] = true;
                    }
                }
                else if(this.options.type == 'deleteDept'){
                	ajaxURL = this.options.contextRoot + 'api/deletedepts?';
                	ajaxData['offset'] = 20;
                }
                else if (this.options.type == "contact") {
                	ajaxURL = this.options.contextRoot + "api/contact/company/group/search?";
                }
    	        else {
                    // 일반 사용자 검색인 경우
    	        	noneresult = true;
                    ajaxURL = this.options.contextRoot + 'api/user/sort/list';
                    if(this.options.useApprReception){
                        ajaxData['useApprReception'] = true;
                    }
                    if(this.options.useApprReference){
                        ajaxData['useApprReference'] = true;
                    }
                    
                    if (this.options.parentNodeId) {
                        ajaxData['nodeId'] = this.options.parentNodeId;
                        ajaxData['nodeType'] = 'department';
                        
                        if (this.options.parentNodeIds.length) {
                            ajaxData['includeDeptIds'] = this.options.parentNodeIds;
                        }
                        
                        // TODO: 뭔지 파악한 후에 작업하자.
                        ajaxData['scope'] = (this.hideOrg) ? 'none' : '';
                    }
                    
                    if (this.options.multiCompanyVisible) {
                        ajaxData['withMultiCompany'] = true;
                    }
                    
                    if (!_.isEmpty(this.options.companyIds)) {
                        ajaxData['companyIds'] = this.options.companyIds;
                    }
                }
                
                this._renderContainer();
                
                this.deferred = $.Deferred();
                
                var ajaxCallback = function(rs) {
                    if (rs.data && rs.data.length) {
                       	this._renderItemList(rs.data);
                       	// 첫 페이지가 아닌 경우도 부서는 항상 조회된다. 
                       	// 부서 목록은 offset과도 상관 없이 모두 조회되고 있더라..
                       	// 때문에 첫 페이지가 아닌 경우는 부서를 랜더링 하지 않게 한다.
                       	// 그렇지 않으면 펼쳐져 있던 부서가 다시 닫힌다. by louis
                       	if(this.options.isDeptUse && rs.page.page == 0){
                       		this._renderNodeList(rs.data);
                       	}
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
                if(_.isEmpty(this.options.keyword) && noneresult) {
                	return;
                }
                
                setTimeout(function(){
                    if(!isAjaxDouble){
                        isAjaxDouble = true;
                        self.ajaxCalling = $.ajax({
                            url : ajaxURL,
                            type : self.options.method || "GET",
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
            
            // 구 _renderDeptList
            _renderNodeList: function(data) {
            	var self = this;
            	var isDeptType = this.options.type == 'department';
            	var useApprReference = this.options.useApprReference;
            	var useApprReception = this.options.useApprReception;
            	var receiveAllowType = this.options.receiveAllowType;
            	var useDisableNodeStyle = this.options.useDisableNodeStyle && receiveAllowType != 'USER';
                var departments = [],
                    deptTmpl = Hogan.compile([
                        '<li data-id="{{id}}" class="jstree-closed {{addClass}}" rel="org" data-email="{{email}}" {{#isDeptType}}style="background:transparent"{{/isDeptType}} data-original="{{originalEmail}}" data-childrenCount="{{childrenCount}}" data-useReception="{{useReception}}" data-useReference="{{useReference}}">',
                        '   {{^isDeptType}}<ins class="jstree-icon"></ins>{{/isDeptType}}',
                        '   <a class="" {{#useDisableNodeStyle}}{{#useApprReception}}{{^useReception}}nodeState="DISABLE"{{/useReception}}{{/useApprReception}}',
                        '										{{#useApprReference}}{{^useReference}}nodeState="DISABLE"{{/useReference}}{{/useApprReference}}',
                        '{{/useDisableNodeStyle}} data-name="{{name}}"><ins class="jstree-icon"></ins>{{name}} &nbsp;&nbsp; {{parentDepartmentName}}',
                        '{{#companyNameVisible}}<span class="part">|</span><span class="multi_company">{{companyName}}</span>{{/companyNameVisible}}</a>',
                        '</li>'
                    ].join(''));
                
                $.each(data, function(k, v) {
                	var addClass = data[k+1] == undefined || data[k+1].nodeType != 'department' ? 'jstree-last' : '';
                	if(isDeptType){
                		addClass = "";
                	}
                    if(v.nodeType == 'department') {
                        departments.push(deptTmpl.render({
                            name : v.name,
                            id: v.id,
                            email : v.email,
                            originalEmail : v.email,
                            useDisableNodeStyle : useDisableNodeStyle,
                            childrenCount : v.childrenCount,
                            useReception : v.useReception,
                            useReference : v.useReference,
                            useApprReference : useApprReference,
                            useApprReception : useApprReception,
                            companyNameVisible : self.decideCompanyNameVisible(v.companyId),
                            companyName : v.companyName,
                            isDeptType : isDeptType,
                            addClass : addClass,
                            parentDepartmentName : v.parentDepartmentName
                        }));
                    }
                });
    
                if(departments.length) {
                    this.$el.find('#searchDepartmentEl').show().find('ul').html(departments.join(''));
                };
            },
            
            /* DOCUSTOM-5937 결재창에서 조직도검색시 회사명 노출. 조건(multiCompany사용  and 검색결과 데이터의 companyId가 현재 사용자의 companyId와 다를때) */
            decideCompanyNameVisible : function(companyId){
            	var sessionCompanyId;
            	if(_.isFunction(GO.session)){
            		sessionCompanyId = GO.session('companyId');
            	} else {/*메일에서는 GO.session이 없음......*/
            		sessionCompanyId = USERSESSION["companyId"];
            	}
                var multiCompanyVisible = this.options.multiCompanyVisible; 
            	if(!multiCompanyVisible){
            		return false;
            	}else{
            		return companyId != sessionCompanyId;
            	}
            },
    
            // 구 _renderMemberList. deleteDept 에서 활용하게 되어 메소드명 변경
            _renderItemList: function (data) {
                var self = this;
                var isDeleteDept = this.options.isDeleteDept;
                var isContact = this.options.type == "contact";
                var members = [];
                var itemTmpl = isContact ? getItemTmpl()['contact'] : (isDeleteDept ? getItemTmpl()['deletedDept'] : getItemTmpl()['normal']);

                $.each(data, function (k, v) {
                    if (v.nodeType != 'department') {
                        var options = {
                            id: isDeleteDept ? v.deptId : v.id,
                            name: v.name,
                            email: v.email,
                            originalEmail: v.originalEmail,
                            position: v.position || '',
                            isPosition: v.position ? true : false,
                            dutyNames: v.duties ? v.duties.join('/') : '',
                            departments: v.departments ? v.departments.join('/') : '',
                            isDepartments: v.departments ? (v.departments.length > 0) : false,
                            departmentIds: v.departmentIds ? v.departmentIds.join(',') : '',
                            employeeNumber: v.employeeNumber,
                            thumbnail: v.thumbnail,
                            companyNameVisible: self.decideCompanyNameVisible(v.companyId),
                            companyName: v.companyName,
                            isDeleteDept: isDeleteDept,
                            manager: v.manager,
                            loginId: v.loginId
                        };

                        if (isContact) {
                            var title = [];
                            title.push(v.name);
                            if (v.email) title.push("(" + v.email + ")");
                            options["contactDisplayName"] = title.join(" ");
                            options["companyName"] = v.companyName;
                        }

                        members.push(itemTmpl.render(options));
                    }
                });
                this.$el.find("p.data_null").remove();
                this.$el.find('ul.member_list').append(members.join(''));
                
                function getItemTmpl() {
                    return {
                        'contact': Hogan.compile([
                            '<li rel="contact" data-id="{{id}}" data-email="{{email}}" data-companyname="{{companyName}}" data-name="{{name}}">',
                            '   <a data-bypass>',
                            '       <ins class="worker"></ins>',
                            '       <span class="part" title="{{contactDisplayName}}">{{contactDisplayName}}</span>',
                            '   </a>',
                            '</li>'
                        ].join('')),
                        'normal': Hogan.compile([
                            '<li data-id="{{id}}" data-email="{{email}}" data-duties="{{dutyNames}}" data-dept-ids="{{departmentIds}}" data-employee-number="{{employeeNumber}}" data-thumbnail="{{thumbnail}}" data-original="{{originalEmail}}" data-loginId="{{loginId}}">',
                            '   <a data-bypass >',
                            '       <ins class="{{#manager}}master{{/manager}}{{^manager}}{{#isDeleteDept}}team{{/isDeleteDept}}{{^isDeleteDept}}worker{{/isDeleteDept}}{{/manager}}"></ins>',
                            '		{{^isDeleteDept}}',
                            '           <span class="name" title="{{name}}">{{name}}</span>',
                            '           {{#isPosition}}',
                            '               <span class="position" title="{{position}}">{{position}}</span>',
                            '           {{/isPosition}}',
                            '		{{/isDeleteDept}}',
                            '       {{#isDepartments}}',
                            '           <span class="part" title="{{^isDeleteDept}}{{departments}}{{/isDeleteDept}}{{#isDeleteDept}}{{name}}{{/isDeleteDept}}">{{^isDeleteDept}}{{departments}}{{/isDeleteDept}}{{#isDeleteDept}}{{name}}{{/isDeleteDept}}</span>',
                            '       {{/isDepartments}}',
                            '       {{#companyNameVisible}}',
                            '           <span class="part">|</span><span class="multi_company">{{companyName}}</span>',
                            '       {{/companyNameVisible}}',
                            '   </a>',
                            '</li>'
                        ].join('')),
                        'deletedDept': Hogan.compile([
                            '<li data-id="{{id}}" data-email="{{email}}" data-duties data-dept-ids data-employee-number data-thumbnail data-original data-loginId>',
                            '   <a data-bypass >',
                            '       <ins class="team"></ins>',
                            '       <span class="name" title="{{name}}">{{name}}</span>',
                            '   </a>',
                            '</li>'].join(''))
                    }
                }
            },
            
            _renderDescendantMembers: function(data) {
                var members = [],
                    memberTmpl = Hogan.compile([
                        '<li class="{{addClass}} jstree-leaf" data-id="{{id}}" data-email="{{email}}" data-duties="{{dutyNames}}" data-original="{{originalEmail}}" data-dept-ids="{{deptId}}" data-name="{{name}}" data-position="{{position}}" rel="{{#master}}MASTER{{/master}}{{#moderator}}MODERATOR{{/moderator}}{{^manager}}MEMBER{{/manager}}">',
                            '<ins class="jstree-icon">&nbsp;</ins><a class="ui-draggable" rel="{{#master}}MASTER{{/master}}{{#moderator}}MODERATOR{{/moderator}}{{^manager}}MEMBER{{/manager}}"><ins class="jstree-icon worker"></ins><span class="name">&nbsp;{{name}}</span> <span class="position">{{position}}</span></a>',
                        '</li>'
                    ].join(''));
                
                $.each(data, function(k,v) {
                    members.push(memberTmpl.render($.extend(v, {
                        addClass : k == data.length - 1 ? 'jstree-last' : ''
                    })));
                });
                
                return members.join('');
            },
    
            _renderEmptyList: function() {
                var emptyTmpl = Hogan.compile('<p class="data_null"><span class="ic_data_type ic_no_part"></span>{{msg_no_search_result}}</p>');
                this.$el.find('#searchDepartmentEl').hide();
                this.$el.find('ul.member_list').empty().html(emptyTmpl.render({
                    'msg_no_search_result': this.options.i18n["검색결과가 없습니다."]
                }));
            },
            
            _renderEmptyDescendantMembers: function() {
                var tmpl = Hogan.compile('<li class="jstree-last jstree-leaf"><ins class="jstree-icon">&nbsp;</ins>&nbsp;{{empty_msg}}</li>');
                return tmpl.render({
                    'empty_msg' : this.options.i18n["멤버가 없습니다."]
                });
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
                var self = this;
            	var selectMemberCallback = function(e){
            		var $target = $(e.currentTarget);
                    
                    this.$el.find('ul').find('li>a').removeClass('jstree-clicked');
                    $target.children('a').addClass('jstree-clicked');
                    if (_.isFunction(this.options.callback)) {
                        this.options.callback(this._processSearchData($target), e);
                    }
                    
                    return false;
                };
                var selectCallback = function(e) {
                    var $target = $(e.currentTarget);
                    if ($target.attr('rel') != 'org') {
                    	$target = $target.parent('[rel]');
                    }
                    
                    this.$el.find('ul').find('li>a').removeClass('jstree-clicked');
                    $target.children('a').addClass('jstree-clicked');
                    if (_.isFunction(this.options.callback)) {
//                        this.options.callback(this._processSearchData($target), e);
                    	if(this.options.isBatchAdd){
                    		var processData = this._processSearchData($target); 
                    		if(this._isPopupType(processData['type'])){
                        		this._popup(processData).done(function(result) {
                            		self.options.callback(result, e);
                            	});                    			
                    		}
                    	}else{
                            this.options.callback(this._processSearchData($target), e);                    		
                    	}
                    }
                    
                    return false;
                };
                

                
                var openCallback = function(e) {
                	//DOCUSTOM-5614 조직도 부서검색
                	if(this.options.type === 'department'){
                		return false;
                	}
                    var $target = $(e.currentTarget);
                    if ($target.attr('rel') != 'org') {
                        $target = $target.parent('[rel]');
                    }
                    
                    if ($target.data('data-loaded')) {
                        if($target.hasClass('jstree-open')) {
                            $target.removeClass('jstree-open').addClass('jstree-closed');
                        } else {
                            $target.removeClass('jstree-closed').addClass('jstree-open');
                        }
                    }
                    else {
                        /*if (this.isAjaxDouble){
                            return false;
                        }*/
    
                        this.isAjaxDouble = true;
                        var deptId = $target.attr('data-id');
                        
                        this._fetchDescendantMembers(deptId, $.proxy(function(resp, status, xhr) {

                            $target.data('data-loaded', true);
                            $target.find('a').after('<ul />').end().removeClass('jstree-closed').addClass('jstree-open');
                            if (resp.data.length) {
                                $target.find('ul').html(this._renderDescendantMembers(resp.data));
                            }
                            else {
                                $target.find('ul').html(this._renderEmptyDescendantMembers());
                            }
                            
                            this.isAjaxDouble = true;
                            this._bindDNDEvent();
                        }, this));
                    }
                };
                
                this.$el.on('dblclick contextmenu', 'ul.department_list > li > a', $.proxy(openCallback, this));
                if(this.options.type == "node" || this.options.type == "department" || this.options.type == "org"){
                    this.$el.on('click contextmenu', 'ul.department_list > li > a', $.proxy(selectCallback, this));
                }
                this.$el.on('click contextmenu', 'ul.department_list ins.jstree-icon', $.proxy(openCallback, this));
                this.$el.on('click contextmenu', 'ul.department_list > li > ul > li', $.proxy(selectMemberCallback, this));
            },
            
            _isPopupType : function(itemType) {
            	return this.options.isBatchAdd && !this.options.isOnlyOneMember && itemType == "org" && (this.options.type == "list" || this.options.type == "node" || this.options.type == "circle");
            },
            
            _getScope : function() { //go-nodeTree.js 의 hasScope 로직을 참고하여 만듬.
            	var scope;
            	if(this.options.isAdmin){
            		return;
            	}else{
                	if(this.options.parentNodeIds.length || this.options.isCustomType){
                		scope = this.options.hideOrg ? 'none' : 'subdept';  
                	}else{
                		if (this.options.parentNodeIds.length > 0) scope = 'none';
                	}            		
            	}
            },
            
            _hasScope : function() { 
            	return this._getScope() == "none" ? false : true;
            },
            
            _popup : function(itemData) {
            	var self = this;
            	var deferred = $.Deferred();
            	var buttons = new Array();
            	var hasScope = this.options.type != "circle" && this._hasScope();
            	var hasScope = true;
            	
            	buttons.push({
            		btype : 'confirm', 
            		btext: hasScope ? this.options.externalLang["현재 부서원만 추가"] : this.options.externalLang["추가"],
            		callback: function() {
            			reqDeptMemberList.call(self, deferred, itemData.id);
            		}
            	});
            	
            	if (hasScope) {
            		buttons.push({ 
            			btype : 'confirm', 
            			btext: this.options.externalLang["하위 부서원 모두 추가"], 
            			callback: function() {
        					reqDeptMemberList.call(self, deferred, itemData.id, true);
            			}
            		});
            	}
            	
            	buttons.push({ 
                	btype : 'close', btext: this.options.externalLang["취소"] 
                });
            	
            	$.goPopup({
                    pclass: 'layer_confim',
                    title : this.options.memberTypeLabel + " " + this.options.externalLang["추가"], 
                    message: GO.i18n(this.options.externalLang["{{arg1}}을(를) {{arg2}}에 추가하시겠습니까?"], {arg1: itemData.name, arg2 : this.options.memberTypeLabel}),
                    modal : true, 
                    buttons : buttons
                });
            	
            	function reqDeptMemberList(deferred, deptId, isIncludeSubDept) {
            		var self = this;
        			isIncludeSubDept = isIncludeSubDept || false;
        			var ajaxOption = {};
        			
        			if (this.type == "circle") {
        				ajaxOption = {
        					url : GO.config('contextRoot') + 'api/org/circle/tree',
        					type : "POST",
        					data : JSON.stringify(this.options.circle),
        					contentType : "application/json"
        				};
        				
        				var dept = _.findWhere(self.data, {metadata:{id:deptId}});
        				var memberInfos = _.map(dept.children, function(child) {
        					return child.metadata;
        				});
        				
        				return deferred.resolve(memberInfos);
        			} else {
        				ajaxOption = {
    						url : GO.config('contextRoot') + 'api/organization/user?deptid=' + deptId + (!!isIncludeSubDept ? '&scope=subdept' : '')
        				};
        				return $.ajax(ajaxOption).done(_.bind(function(memberList) {
        					var memberInfos = _.map(memberList, function(member) {
        						return member.metadata;
        					}, this);
        					deferred.resolve(memberInfos);
        					
        				}, this)).fail(function() {
        					deferred.reject();
        				});
        			}
        		}
            	
            	return deferred;
            },
            
            _fetchDescendantMembers: function(deptId, successCallback) {
                $.ajax({
                    url : this.options.contextRoot + 'api/organization/user/descendant',
                    contentType : 'application/json',
                    async : false,
                    type : 'GET',
                    data : {
                        'page' : 0,
                        'offset' : 300,		// TODO offset 300, paging 처리.
                        'nodeType' : 'department',
                        'deptid' : deptId
                    },
                    success: successCallback
                });
            },
            
            _bindDNDEvent: function() {

                if (this.options.isDndActive) {
                    var ctx = this,
                        draggables = this.options.draggables,
                        draggableOpt = {
                            helper: function(event) {
                                var $clone = $(this).clone();
                                $clone.zIndex(11000); // drag 중인 helper 보다 더 높은 z-index는 없을 것이라 가정
                                return $clone;
                            },
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
                    if($target[0].scrollHeight-$target.scrollTop()-$target[0].clientHeight < 1) {
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
                var deptIds = selectedObj.attr('data-dept-ids');
                var isDept = (selectedObj.attr('rel') == 'org');
                var isContact = selectedObj.attr('rel') == 'contact';
                var data = {
                    'id' : selectedObj.data('id'),
                    'email' : selectedObj.data('email'),
                    'originalEmail' : selectedObj.data('original'),
                    'type' : (isDept) ? 'org' : 'MEMBER',
                    'thumbnail' : selectedObj.attr('data-thumbnail'), // /thumbnail ex) "/go/thumb/user/small/41370-3197"
                    'loginId' : selectedObj.attr('data-loginId')

                };
                if (isDept) {
                    data['name'] = selectedObj.find('a:first').attr('data-name') || "";
                    data['useReception'] = selectedObj.data('usereception');                    
                    data['useReference'] = selectedObj.data('usereference');
                    data['subdept'] = selectedObj.data('childrencount')? true : false;
                } else if (isContact) {
                	data['id'] = selectedObj.data('id');
                	data['email'] = selectedObj.data('email');
                	data['name'] = selectedObj.data('name');
                	data['companyName'] = selectedObj.data('companyname');
                } else {
                	// http://jira.daou.co.kr/browse/GO-17019
                	// 검색결과 목록에서 고스트뷰가 존재하여 span.name 결과가 두개이상 잡혀서 나타나는 현상에 대한 수정
                	// Bongsu Kang(kbsbroad@daou.co.kr)
                    data['name'] = selectedObj.find('span.name:first').text();
                    if(deptIds != null) data['deptId'] = (deptIds.indexOf(",") > 0) ? deptIds.substring(0, deptIds.indexOf(",")) : deptIds;
                    
                    var deptName = "";
                    if(selectedObj.hasClass("jstree-leaf")){
                    	deptName = selectedObj.parents("li").find("a:first").attr('data-name') || "";
                    }else{
                    	deptName = selectedObj.find('span.part:first').attr('title');
                    }
                    
                    var dutyNames = selectedObj.attr('data-duties');
                    data['duty'] = (dutyNames.indexOf(",") > 0) ? dutyNames.substring(0, dutyNames.indexOf(",")) : dutyNames;
                    data['deptName'] = deptName;
                    data['position'] = selectedObj.find('span.position:first').text() || "";
                    data['displayName'] = data['name'] + ' ' + data['position'];
                    data['employeeNumber'] = selectedObj.attr('data-employee-number');
                }
                
                return data;
            },
            
            getData : function(){
                return this.data;
            }
        };
    };
    
})(jQuery);
