/**
 * @version 0.0.1
 * @require     jQuery, jQuery.ui, jstree , go-style.css
 * @author  sopark@daou.co.kr
  */
(function($) {

    $.goNodeTree = function (option) {
        if (arguments[0] === 'close') {
            return this.close();
        } else {
            var nodeTree = new NodeTree();
            nodeTree.initialize(option);
            return nodeTree;
        };
    };

    var MAX_DATA_LENGTH = 1000;

    var NodeTree = function() {

        function isInvalidSelectNode(context, jstreeObj){
            var rslt = jstreeObj.rslt.obj,
                nodeEl = rslt.find('a:first'),
                nodeType = nodeEl.attr('rel');

            //start : GO-11082 (캘린더) 참석자 추가에서 부서명의 (+) (-) 를 클릭한 경우, 참석자를 넣으라는 메세지가 나오는 버그
            if($(rslt.context).hasClass("jstree-icon")){
                return true;
            }
            //end : GO-11082

            if (!context.isBatchAdd && (context.type == 'list' && isDept(nodeType))) {
                return true;
            }

            //data.rslt.obj.context

            if(nodeType == 'LIMIT'){
                var msg = context.i18n["결과값이 많습니다. 검색을 이용해 주세요."];

                if($.goSlideMessage == undefined){
                    alert(msg);
                }else{
                    $.goSlideMessage(msg);
                }
                return true;
            }

            return false;
        }

        function processOrgAjaxData(context, ajaxObject) {
            if (context.method == "POST") return JSON.stringify(context.circle);

            var rData = {};
            if(typeof ajaxObject.data == 'function') var nData = ajaxObject.data();

            if(context.isAdmin){
                rData = {
                    deptid : (nData ? nData.id : context.loadId)
                };

                if (context.companyId) {
                    rData.companyId = context.companyId;
                }

                if (!_.isEmpty(context.companyIds)) {
                    rData.companyIds = context.companyIds;
                }
            }
            else {
                /*
                if (context.type == "circle" && typeof(ajaxObject) != "object") {
                    return {serializedCircle : JSON.stringify(context.circle)};
                }*/

                rData = {
                    deptid : nData ? nData.id : context.loadId,
                    includeDeptIds : nData ? [] : context.includeLoadIds
                };

                //if (context.isMyDeptOpened && !nData && !rData.deptid) {
                if (!nData && !rData.deptid) {
                    rData.type = 'mydept';
                } else if ((rData.includeDeptIds.length || context.isCustomType) && !nData) {
                    rData.type = 'custom';
                    rData.scope = context.hideOrg ? 'none' : 'subdept';
                } else {
                    rData.type = 'child';
                    if (context.includeLoadIds.length > 0) rData.scope = 'none';
                    if (context.loadId == rData.deptid) rData.scope = context.hideOrg ? 'none' : 'subdept';
                }

                if(context.useApprReception){
                    rData.useApprReception = true;
                }

                if(context.useApprReference){
                    rData.useApprReference = true;
                }

                if(context.type == 'contact' && nData) {
                    rData.folderId = nData.id;
                }

                if(context.type == 'contact' && nData) {
                    rData.folderId = nData.id;
                }

            }

            if (!rData.deptid) delete rData['deptid'];
            return rData;
        }

        /**
         * 특정 jstree 노드의 데이터를 GO에서 필요한 형태로 가공하여 반환한다.
         *
         * @param jstreeObj
         * @returns data
         */
        function processOrgData(type, jstreeObj, loadId){
            var nodeType = jstreeObj.find('a').attr('rel'),
                companyNode = jstreeObj.parents('.jstree-company').find('a[rel="company"]'),
                selectedData = jstreeObj.data(),
                returnData = {};

            returnData = $.extend(returnData, {
                'id' : selectedData['id'],
                'companyId' : companyNode.attr('nodeid'),
                'companyName' : companyNode.text() || selectedData["companyName"], // 
                'email' : selectedData['email'],
                'originalEmail' : selectedData['originalEmail'] == undefined ? selectedData['email'] : selectedData['originalEmail'],
                'name' : selectedData['name'],
                'type' : nodeType
            });

            if(type == "node" && isDept(nodeType)){
                returnData['subdept'] = selectedData['childrenCount'] == 0 ? false : true;
            }

            if(isDept(nodeType)){
                returnData['code'] = selectedData['code'];
                returnData['useReception'] = selectedData['useReception'];
                returnData['useReference'] = selectedData['useReference'];
            }

            if(isUser(nodeType)) {
                returnData['duty'] = selectedData['duty'];
                returnData['deptId'] = selectedData['deptId'];
                returnData['deptName'] = selectedData['deptName'];
                returnData['position'] = selectedData['position'] || "";
                returnData['displayName'] = selectedData['name'] + ' ' + selectedData['position'];
                returnData['thumbnail'] = selectedData['thumbnail'];  // thumbnail ex) "/go/thumb/user/small/41370-3197"
                returnData['employeeNumber'] = selectedData['employeeNumber'];
                returnData['loginId'] = selectedData['loginId']
            };

            return returnData;
        }

        function isUser(nodeType){
            return isMember(nodeType) || isMaster(nodeType) || isModerator(nodeType);
        }
        
        function isMaster(nodeType) {
            return nodeType == 'MASTER';
        }

        function isMember(nodeType) {
            return nodeType == 'MEMBER';
        }

        function isModerator(nodeType) {
            return nodeType == 'MODERATOR';
        }

        function isDept(nodeType){
            return nodeType == 'org' || nodeType == 'company';
        }

        return {
            version : '0.0.1',
            popupEl : null,
            callback : null,
            contextRoot : null,
            eventTime : null,
            eventId : null,
            defaults : {
                id : 'gpopupLayer',
                treeId : 'orgTree',
                type : 'list',// api명 기준 -  default : list(부서트리&멤버 - 멤버만 선택 가능) , department - 부서트리만, community - 멤버만, node : (부서트리&멤버 - 둘다 선택 가능)
                isAdmin : false,
                css : {
                    'minHeight' : 375,
                    'maxHeight' : 375
                }
            },
            template : function(tpl,data){
                return tpl.replace(/{(\w*)}/g,function(m,key){return data.hasOwnProperty(key)? data[key]:"";});
            },

            initialize: function(options) {
                this.isAjaxDouble = false;
                this.options = $.extend({}, this.defaults, options);

                // GO-16166에 대한 임시조치로 overflow-y 속성을 쓰지 못하도록 한다.
                if(this.options.css && this.options.css['overflow-y']) {
                    delete this.options.css['overflow-y'];
                }

                this.el = this.options.el;
                this.$el = $(this.el);

                this.useSiteName = (GO.config == undefined) ? false : GO.config('useSiteNameConfig');
                
                this.multiCompanyVisible = this.options.multiCompanyVisible || false;
                this.circle = this.options.circle || null;
                this.loadId = this.options.loadId || '';     //필수 : 부서, 커뮤니티 ID
                this.companyIds = this.options.companyIds || []; // 회사 아이디 목록
                this.companyId = this.options.companyId || null; // 회사 아이디
                this.includeLoadIds = this.options.includeLoadIds || [];     //부서인경우에만 추가로 사용할 부서 ID
                this.type = this.options.type || this.defaults.type;     //조직도의 종류가 부서, 전사, 커뮤니티
                this.callback = this.options.callback || '';             // 확인 callback
                this.contextRoot = this.options.contextRoot || '';
                this.isAdmin = this.options.isAdmin || this.defaults.isAdmin;
                this.hideOrg = this.options.hasOwnProperty('hideOrg') ? this.options.hideOrg : this.loadId ? true : false,    // 하위부서 감추기 옵션(default : hide)
                this.target = this.options.target || null;       //조직도가 호출될 위치를 지정하는 element
                this.isDndActive = this.options.isDndActive;
                this.dndDropTarget = this.options.dndDropTarget;
                this.draggables = this.options.draggables || 'a[rel]';
                this.useDisableNodeStyle = _.isBoolean(this.options.useDisableNodeStyle) ? this.options.useDisableNodeStyle : false; // 조직도에서 disable style사용 여부. (결재선 수신자 탭 등..)
                this.useApprReception = _.isBoolean(this.options.useApprReception) ? this.options.useApprReception : false; // 전자결재 수신자탭에서 쓰이는 옵션. true면 url에 useReception=true로 넘긴다. 없으면 안넘김. 이 flag를 type에 따라 구분하는게 더 복잡해서 별도 옵션을 두었음..
                this.useApprReference = _.isBoolean(this.options.useApprReference) ? this.options.useApprReference : false; // 전자결재 참조자탭에서 쓰이는 옵션. true면 url에 useReception=true로 넘긴다. 없으면 안넘김. 이 flag를 type에 따라 구분하는게 더 복잡해서 별도 옵션을 두었음..
                this.receiveAllowType = this.options.receiveAllowType || 'ALL'; // 전자결재 탭(수신자, 참조자)에서 넘어오는 값. 'ALL', 'USER', 'DEPARTMENT'중 한개..'USER'일때는 disable스타일 적용시키지 않는다...
                this.dropCheck = this.options.dropCheck;
                this.dropFinish = this.options.dropFinish;
                this.dropOut = this.options.dropOut;
                this.css = this.options.css;
                //this.url = this._url();
                this.i18n = this.options.i18n;
                this.method = this.options.method || "GET";
                this.externalLang = this.options.externalLang || null;
                this.isOnlyOneMember = this.options.isOnlyOneMember || false;
                this.memberTypeLabel = this.options.memberTypeLabel || "";
                this.isCustomType = this.options.isCustomType || false;
                this.isBatchAdd = this.options.isBatchAdd || false;
                
                // DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
                this.displayFormats = this.options.displayFormats || null;
                this.render();
                return this;
            },

            render : function() {

                this.deferred = $.Deferred();

                var self = this;
                var jstreeOptions = {
                    'plugins' : [ 'themes', 'json_data', 'ui', 'crrm'],
                    'json_data' : {
                        'ajax' : {
                            'type' : self._ajaxType(),
                            'url' : function(node) {
                                return self._url(node);
                            },
//                          "url" : "/resources/js/libs/node/test.mock",
                            'data' : function(n) {
                                return processOrgAjaxData(self, n);
                            },
                            'cache' : false,
                            'async' : true,
                            'success' : function(data) {
                                // circle 에서 사용하기 위함
                                self.data = self._parseNodes(data);
                                try {
                                    var target = $('#'+self.defaults.treeId+'>div');
                                    if (data.length == 0 && target.find('ul>li').length <= 1) {
                                        var emptyEl = '<p class="data_null"><span class="ic_data_type ic_no_member"></span>{msg_no_member}</p>';
                                        if(self.type == 'list') {
                                            target.html(self.template(emptyEl, { msg_no_member : self.i18n['멤버가 없습니다.']  }));
                                        } else if(self.type == 'department' && self.isAdmin) {
                                            target.html(self.template(emptyEl, { msg_no_member : self.externalLang['부서가 없습니다 조직설계에서 설정하세요'] }));
                                        }
                                    };

                                    /**
                                     * TODO: .... 향후 메커니즘 개선 필요
                                     */
                                    if(data.length > MAX_DATA_LENGTH) {
                                        data = self._relocateChildNode(data);
                                    }

                                    //결과값의 각 리스트 항목들의 children 개수 체크
                                    //children의 개수가 MAX_DATA_LENGTH을 넘을 경우 위의 그룹과 동일하게 Limit처리를 한다
                                    _.each(data, function(obj) {
                                        if(obj.children && obj.children.length >= MAX_DATA_LENGTH) {
                                            obj.children = self._relocateChildNode(obj.children);
                                        }
                                    }, this);

                                }catch(err){
                                	console.log(err);
                                };
                                return data;
                            },
                            'beforeSend' : function(){
                                self.deferred.resolve();
                            }
                        }
                    },
                    'crrm' : {
                        input_width_limit : 200,
                        move : {
                            check_move : function (m) {
                                return false;
                            }
                        }
                     },
                    'core' : {
                        'animation' : 120,
                        'strings'       : {
                            'loading'   : '&nbsp;'
                        }
                   },
                    'defaults ' : {
                        'html_titles' : true,
                        'animation' : 500,
                        'ccp' : false,
                        'width' : 200
                    },
                    'ui' : {
                        'select_multiple_modifier' : false,
                        'select_limit' : 1
                    }
                };

                if (self.method == "POST") {
                    jstreeOptions["json_data"]["ajax"]["contentType"] = "application/json;";
                    jstreeOptions["json_data"]["ajax"]["headers"] = {accept : "application/json, text/json"};
                }

                this.treeEl =  this.$el.jstree(jstreeOptions);

                this.treeEl.bind("load_node.jstree", function( node , success_callback , error_callback ) {
                    $(self.popupEl).trigger("data:success", [self.target]);
                    $(self.el+ ' a[href="#"]').attr({
                        'data-bypass' : 1,
                        'title' : ''
                    });
                    if(self.useDisableNodeStyle){
                        var jstree = $.jstree._reference(self.treeEl).get_container();
                        jstree.find('li').each(function(i, v){
                            if($(v).data('useReception') == false && self.useApprReception && self.receiveAllowType != 'USER'){
                                $(v).children('a').first().attr('nodeState', 'DISABLE');
                            }else if($(v).data('useReference') == false && self.useApprReference && self.receiveAllowType != 'USER'){
                                $(v).children('a').first().attr('nodeState', 'DISABLE');
                            }
                        })
                    };

                    self.$el.find('a[rel!="org"] > ins').addClass('worker').text("");
                    self.$el.find('a[rel="company"] > ins').removeClass('worker').addClass('company').text("");
                    self.$el.find('a[rel="contact"] > ins').remove();
                    self.$el.find('a[rel="company"]').parent('li').addClass('jstree-company');
                    var treeOrg = false;
                    self.$el.find('a[rel="company"]').parent('li').each(function(i, v){
                    	var depth = $(v).data('groupDepth');
                    	if(!_.isNumber(depth)){
                    		depth = 0;
                    	}
                    	$(v).addClass('depth'+ depth);
                    	if (!treeOrg && parseInt(depth) >= 0) {
                    		treeOrg = true;
                    	}
                    })
                    if (treeOrg) {
                        self.treeEl.addClass('jstree_depth');
                    }
                    self._bindDNDEvent();

                    self.deferred.resolve();
                }).
                bind("select_node.jstree", function(e, data) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (isInvalidSelectNode(self, data)){
                        return false;
                    }

                    var itemData = processOrgData(self.type, data.rslt.obj, self.loadId);
                    if (self._isPopupType(itemData.type)) {
                        self._popup(itemData).done(function(result) {
                            callback(result);
                        });
                    } else {
                        callback(itemData);
                    }

                    function callback(obj) {
                        if ($.isFunction(self.callback)) {
                            if(obj.type!='company'){
                                self.callback(obj, e);
                            }else if(obj.type=='company' && e.currentTarget.id =='orgSideTree'){//조직도 풀업에서 회사 클릭시 프로필 카드 노출
                                self.callback(obj, e);
                            }
                        }
                    }

                    return false;
                });

                this.treeEl.css(this.options.css);
                return;
            },

            // 하위 노드 개수가 MAX_DATA_LENGTH을 넘을 경우 나머지 노드는 Limit처리를 한다
            _relocateChildNode: function(data) {
                var depts = _.where(data, {data:{attr:{rel:"org"}}});
                // 노드가 MAX_DATA_LENGTH보다 많을 경우 부서원들의 MAX_DATA_LENGTH까지 렌더링 후 부서원 limit 노드 추가
                data[MAX_DATA_LENGTH - depts.length] = {
                    data : {
                        attr : {
                            nodeId : null,
                            rel : "LIMIT"
                        },
                        title : "...."
                    }
                };

                // 노드에 하위부서 정보가 포함되어 있을 경우 하위부서까지 렌더링
                if(depts.length > 0) {
                    _.each(depts, function(dept, index) {
                        data[MAX_DATA_LENGTH - depts.length + 1 + index] = dept;
                    }, this);
                }

                return data.slice(0, MAX_DATA_LENGTH+1);
            },

            _parseNodes : function(nodes) {
                var self = this;

                // 커스텀 포맷이 지정되어 있지 않으면 그대로 반환한다.
                if(!this.displayFormats) {
                    return nodes;
                }

                if(!$.isArray(nodes)) {
                    nodes = [nodes];
                }

                $.map(nodes, function(node, i) {
                    if(!node || !node.data || !node.data.attr) {
                        return;
                    }
                    var rel = node.data.attr.rel;
                    var title = '' + node.data.title;
                    var displayFormat = null;

                    if(isMaster(rel) && self.displayFormats.hasOwnProperty('orgTreeMasterFormat')) {
                        displayFormat = self.displayFormats['orgTreeMasterFormat'];
                    } else if(isModerator(rel) && self.displayFormats.hasOwnProperty('orgTreeModeratorFormat')) {
                        displayFormat = self.displayFormats['orgTreeModeratorFormat'];
                    } else if(isMember(rel) && self.displayFormats.hasOwnProperty('orgTreeMemberFormat')) {
                        displayFormat = self.displayFormats['orgTreeMemberFormat'];
                    }

                    if(displayFormat) {
                        title = self.template(displayFormat, node.metadata);
                    }

                    node.data.title = title;
                    node.data.attr.title = title;

                    if(node.children && node.children.length > 0) {
                        node.children = self._parseNodes(node.children);
                    }
                });

                return nodes;
            },

            _url : function(node) {
                var self = this;

                var url = [this.contextRoot, (this.isAdmin ? 'ad/' : ''),  (this.multiCompanyVisible ? 'api/organization/multi/' : 'api/organization/')];

                switch (this.type){
                    case 'department' : url.push('dept'); break;
                    case 'user' : url.push('user'); break;
                    case 'contact' : url = self.contextRoot + 'api/contact/company/group'; break;
                    default : url.push('list'); break;
                }

            	if (this.type == 'circle' && node == -1) { // -1 은 jstree 내부에서 사용하는 root node 의 값이다.
        			return self.contextRoot + 'api/org/circle/tree';
            	} else if (this.type == "contact") {
            		return self.contextRoot + 'api/contact/companyfolder/approval';
            	} else {
            		return url.join('');
            	}
            },

            _ajaxType : function() {
                var self = this;
                var ajaxType = this.type == "circle" ? function(param) {
                    if (self.type == 'circle' && typeof(param) != 'object') {
                        return self.method = "POST";
                    } else {
                        return self.method = "GET";
                    }
                } : self.method;

                return ajaxType;
            },

            _isPopupType : function(itemType) {
            	return this.isBatchAdd && !this.isOnlyOneMember && itemType == "org" && (this.type == "list" || this.type == "node" || this.type == "circle");
            },

            _getScope : function() {
                return processOrgAjaxData(this, -1).scope;
            },

            _hasScope : function() {
                return this._getScope() == "none" ? false : true;
            },

            _popup : function(itemData) {
                var self = this;
                var deferred = $.Deferred();
                var buttons = new Array();
                var hasScope = this.type != "circle" && this._hasScope();

                buttons.push({
                    btype : 'confirm',
                    btext: hasScope ? this.externalLang["현재 부서원만 추가"] : this.externalLang["추가"],
                    callback: function() {
                        reqDeptMemberList.call(self, deferred, itemData);
                    }
                });

                if (hasScope) {
                    buttons.push({
                        btype : 'confirm',
                        btext: this.externalLang["하위 부서원 모두 추가"],
                        callback: function() {
                            reqDeptMemberList.call(self, deferred, itemData, true);
                        }
                    });
                }

                buttons.push({
                    btype : 'close', btext: this.externalLang["취소"]
                });

                $.goPopup({
                    pclass: 'layer_confim',
                    title : this.memberTypeLabel + " " + this.externalLang["추가"],
                    message: GO.i18n(this.externalLang["{{arg1}}을(를) {{arg2}}에 추가하시겠습니까?"], {arg1: itemData.name, arg2 : this.memberTypeLabel}),
                    modal : true,
                    buttons : buttons
                });

                function reqDeptMemberList(deferred, itemData, isIncludeSubDept) {
                    var self = this,
                    	deptId = itemData.id;
                    isIncludeSubDept = isIncludeSubDept || false;
                    var ajaxOption = {};
                    
        			if (this.type == "circle") {
        				var dept = [];
                        var memberInfos = []
                        
                        if(this.useSiteName){
                            dept = _.findWhere(self.data[0].children, {metadata:{id:deptId}});
                        }else{
                            dept = _.findWhere(self.data, {metadata:{id:deptId}});
                        }
                        memberInfos = _.map(dept.children, function(child) {
                        		return child.metadata;
                        });
        				
                        return deferred.resolve(memberInfos);
        			} else {
        				ajaxOption = {
    						url : GO.config('contextRoot') + (self.isAdmin ? 'ad/' : '') + 'api/organization/user?deptid=' + deptId + (!!isIncludeSubDept ? '&scope=subdept' : '')
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

            _error : function(error){
                console.log(error);
            },

            getSelectedData : function(){
              var selectedObj = this.treeEl.jstree('get_selected');
              if (selectedObj && selectedObj.length > 0) {
                  var temp = processOrgData(this.type, selectedObj, this.loadId);
                  return temp;
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

             _bindDNDEvent: function() {
                 if (!this.isDndActive) { return; }
                 var draggables = this.draggables,
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
                         over: $.proxy(function(e, ui) {
                             var data = processOrgData(this.type, $(ui.draggable).parent(), this.loadId);
                             this.dropCheck($(e.target), data);
                         }, this),
                         out: $.proxy(function(e, ui) {
                             var data = processOrgData(this.type, $(ui.draggable).parent(), this.loadId);
                             this.dropOut($(e.target), data);
                         }, this),
                         drop: $.proxy(function(e, ui) {
                             var data = processOrgData(this.type, $(ui.draggable).parent(), this.loadId);
                             this.dropFinish($(e.target), data);
                         }, this)
                     };

                 $(draggables, this.treeEl).draggable(draggableOpt);
                 $(this.dndDropTarget).droppable(droppableOpt);
             }
        };
    };

})(jQuery);
