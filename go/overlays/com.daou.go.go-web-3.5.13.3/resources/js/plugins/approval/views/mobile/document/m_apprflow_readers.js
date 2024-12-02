define([
        "backbone",

        "approval/collections/subscriber_groups",
        "views/mobile/m_dept",

        "hgn!approval/templates/mobile/document/m_apprflow_my_lines",
        "hgn!approval/templates/mobile/document/m_apprflow_readers",


        "i18n!nls/commons",
        "i18n!approval/nls/approval",

        "jquery.go-popup"
    ],

    function(
        Backbone,

        SubscriberCollection,
        DeptView,

        myLinesTmpl,
        ApprFlowReadersTmpl,

        commonLang,
        apprLang
    ) {
        var lang = {
            'not_allowed_docReferenceReaders' : apprLang['선택한 그룹으로 참조자를 지정할 수 없습니다.'],
            'not_allowed_docReceptionReaders' : apprLang['선택한 그룹으로 수신자를 지정할 수 없습니다.'],
            'not_allowed_docReadingReaders' :apprLang['선택한 그룹으로 열람자를 지정할 수 없습니다.'],
            'add_approval' : apprLang['추가'],
            'docReferenceReaders': apprLang['참조자'],
            'docReceptionReaders': apprLang['수신자'],
            'docReadingReaders': apprLang['열람자'],
            'my_save' : apprLang['내가 저장한 결재선 목록'],
            'only_pc_modify' : apprLang['수정은 오직 PC'],
            'my_group' : apprLang['개인 그룹'],
            'msg_empty_my_lines' : apprLang['개인 그룹이 없습니다.'],
            "data_null": commonLang["데이터가 없습니다."]
        };
        /**
         * 결재 정보의 그룹별 결재라인 뷰
         * model: ApprActivityGroupModel
         */
        var ApprFlowReadersView = Backbone.View.extend({

            events: {
                "click .myGroupButton" : "_myApprFlowButton",
                "click .mygroups li a[data-id]" : "_selectApprFlow",
                "click #readersAdd" : "_readersAddPopup",
                "click .readersDel" : "_readersDelete"
            },
            initialize: function(options) {
                options = options || {};
                this.observer = options.observer;
                this.docReaderType = options.readerCollection;
                this.docReadersCollection = new Backbone.Collection(this.model.docInfoModel.get(this.docReaderType));
                this.subscriberCollection = new SubscriberCollection();
                //m_apprflow_edit.js에서 호출
                this.observer.bind('saveApprFlowReaders', this.saveApprFlowReaders, this);

                this.listenTo(this.docReadersCollection, 'reset change add remove', _.bind(function() {
                    this._renderList(this.docReadersCollection);
                    this._renderMySubscriberList();
                },this));

            },
            render: function() {
                this._renderList(this.docReadersCollection);
                this.subscriberCollection.fetch({
                    success: $.proxy(this._renderMySubscriberList, this)
                });
                return this;
            },
            _renderList : function(docReadersCollection) {
                var tpl = ApprFlowReadersTmpl({
                    lang : lang,
                    readersName : this._getReadersName(),
                    data : docReadersCollection.toJSON(),
                    editable: this._editable(),
                    isDept : function(){
                        if(this.reader.deptType){
                            return true;
                        }
                        return false;
                    },
                    isReadingReders : this._isReadingReders(),
                    assignedReadingReadersRemovable : this._assignedReadingReadersRemovable()

                });
                this.$el.html(tpl);
            },
            _getReadersName: function(){
                var readersName = lang.docReferenceReaders;
                if(this.docReaderType == "docReferenceReaders"){
                    readersName =  lang.docReferenceReaders;
                } else if(this.docReaderType == "docReceptionReaders") {
                    readersName =  lang.docReceptionReaders;
                } else if(this.docReaderType == "docReadingReaders") {
                    readersName =  lang.docReadingReaders;
                }
                return readersName;
            },
            _editable: function() {
                if(this.docReaderType == "docReferenceReaders"){
                    if(this.model.isStatusComplete() || this.model.isStatusReturned()) {
                        return false;
                    }
                    return this.model.Permission.canEditRefererList();
                } else if(this.docReaderType == "docReceptionReaders") {
                    if(this.model.isStatusReturned()) {
                        return false;
                    }
                    return this.model.Permission.canEditReceiverList();
                } else if(this.docReaderType == "docReadingReaders") {
                    return this.model.Permission.canEditReaderList() || this.model.get('actionCheck').readerEditable;
                }
            },
            _isReadingReders : function(){
                if(this.docReaderType == "docReadingReaders") {
                    return true;
                }
                return false;
            },
            _assignedReadingReadersRemovable: function(){
                if(this.model.get('actionCheck').readerEditable){
                    return true;
                }
                return false;
            },
            _readersDelete: function(e) {
                var targetId = $(e.currentTarget).attr("data-id");
                var targetModel = this.docReadersCollection.find(function(model) {
                    return this._getUniqId(model) == targetId;
                }, this);
                this.docReadersCollection.remove(targetModel);
            },
            _getUniqId: function(model) {
                return model.get('reader').id;
            },
            /**
             * 내 그룹리스트 그리기
             * */
            _renderMySubscriberList: function(){
                $('.mygroups').html(myLinesTmpl({
                    'lang' : lang,
                    'hasMyLines': !this.subscriberCollection.isEmpty(),
                    'myLines' : this.subscriberCollection.map(function(model) {
                        return {
                            'id' : model.get('id'),
                            'title' : model.get('title'),
                            'groupCount' : model.get('subscriber').nodes.length
                        };
                    })
                }));
            },
            /**
             * 나의 그룹 리스트 보기
             */
            _myApprFlowButton: function(e){
                var target = $(e.currentTarget);
                target.toggleClass("on");
                if(target.hasClass('on')){
                    target.siblings('.wrap_list_myApproval').slideDown(300);
                }else{
                    target.siblings('.wrap_list_myApproval').slideUp(300);
                }
            },
            /**
             * 나의 그룹 선택
             * */
            _selectApprFlow : function(e) {
                e.preventDefault();
                var target = $(e.currentTarget);
                var model = this.subscriberCollection.get(target.attr('data-id'));
                var nodes = model.get('subscriber').nodes;
                if(!this._validateSubscriber(nodes)){
                    GO.util.toastMessage(lang['not_allowed_'+this.docReaderType]);
                    return false;
                }

                var data = _.map(nodes, function(node) {
                    return {
                        reader : {
                            deptId : node.nodeDeptId,
                            deptType : node.nodeType == 'department' ? true : false,
                            deptName : node.nodeDeptName,
                            id : node.nodeId,
                            name : node.nodeValue.split(' ')[0],
                            position : node.nodeValue.split(' ')[1] ? node.nodeValue.split(' ')[1] : "",
                            thumbnail : "/"+node.nodeThumbnail
                        }
                    };
                });
                this.docReadersCollection = this.docReadersCollection.reset(data);
                //this._renderList(this.docReadersCollection);
                //this._renderMySubscriberList();
            },
            _validateSubscriber : function(nodes){
                var filtered = [];
                if(this.docReaderType == "docReferenceReaders") {
                    //참조자
                    filtered = _.filter(nodes, function (node) {
                        return String(node.actions) == 'false';
                    });
                } else if(this.docReaderType == "docReceptionReaders") {
                    //수신자
                    if(this.model.getReceiveAllowType() == 'DEPARTMENT'){
                        filtered = _.filter(nodes, function(node){
                            return node.nodeType != 'department' || String(node.actions) == 'false'; //node.action이 string type의 'false' 로 내려올떄가 있음.
                        });
                    }else if(this.model.getReceiveAllowType() == 'USER'){
                        filtered = _.filter(nodes, function(node){
                            return node.nodeType == 'department' || String(node.actions) == 'false';
                        });
                    }else if(this.model.getReceiveAllowType() == 'ALL'){
                        filtered = _.filter(nodes, function(node){
                            return String(node.actions) == 'false';
                        });
                    }
                } else if(this.docReaderType == "docReadingReaders") {
                    //열람자
                    filtered = _.filter(nodes, function(node){
                        return node.nodeType == 'department' || String(node.actions) == 'false';
                    });
                }
                return filtered.length < 1;
            },
            saveApprFlowReaders : function(){
                var docInfoModelReader = this.model.get('docInfo');
                docInfoModelReader[this.docReaderType] = this.docReadersCollection.toJSON();
            },
            /**
             * 결재자/결재부서 추가 레이어 팝업
             * 콜백으로 addActivity()를 호출해야한다.
             * */
            _readersAddPopup: function () {
                var deptview = new DeptView({
                    type: this.docReaderType,
                    sendSelectedNodesCallback: $.proxy(function (self, e, nodes) {
                        _.each(nodes, $.proxy(function (node) {
                            this.addActivity(node);
                        }, this));
                        self.$el.remove();
                        return false;
                    }, this)
                });
                deptview.render();
            },
            /**
             *  레이어에서 선택한 사용자/부서를 추가하는 함수
             *  @param {object} 사용자나부서 정보를 가지고 있는 객체
             *  사용자
             *  {
                    id: 15,
                    companyName: "iu",
                    email: "test0001@iu.terracetech.co.kr",
                    originalEmail: "test0001@iu.terracetech.co.kr",
                    name: "김윤덕",
                    type: "MASTER",
                    duty: "",
                    deptId: 11,
                    deptName: "Solution부문",
                    position: "회장",
                    displayName: "김윤덕 회장",
                    thumbnail: "/resources/images/photo_profile_small.jpg",
                    employeeNumber: "1001",
                    loginId: "test0001",
                }

                부서
                {
                    id: 11,
                    email: "solution@iu.terracetech.co.kr",
                    originalEmail: "solution@iu.terracetech.co.kr",
                    name: "Solution부문",
                    type: "org",
                    subdept: true,
                    code: "1001",
                    useReception: true,
                    useReference: true,
                    includedSubDept : true
                }
             * */
            addActivity : function(orgTreeData) {
                var modelAttrs;
                if(orgTreeData && orgTreeData.type === 'company') {
                    return;
                }
                var addOptions = {};
                modelAttrs = this.parseOrgTreeData(orgTreeData);
                if(!modelAttrs) {
                    return;
                }
                if(orgTreeData.type != 'org' || (orgTreeData.type == 'org' && !orgTreeData.includedSubDept)){
                    addOptions.merge = true;
                    this.docReadersCollection.add(modelAttrs,addOptions);
                    //this._renderList(this.docReadersCollection);
                    //this._renderMySubscriberList();
                }else{
                    this.addActivityByOrg(orgTreeData);
                }
            },
            parseOrgTreeData: function(orgTreeData) {
                if(orgTreeData && !orgTreeData.hasOwnProperty('id')) {
                    return false;
                }

                if(!this.isValidOrgData(orgTreeData)){
                    GO.util.toastMessage('선택한 대상은 이 양식에 사용할 수 없습니다.');
                    return false;
                }

                var result = {};
                var filtered =  this.docReadersCollection.find(function(model) {
                    var reader = model.get("reader");
                    if (reader) {
                        if (orgTreeData.type == 'org') {
                            return reader.deptType && reader.id === orgTreeData.id;
                        } else {
                            return !reader.deptType && reader.id === orgTreeData.id;
                        }
                    }
                });

                // 중복 체크..
                if(filtered) {
                    GO.util.toastMessage(apprLang['중복된 대상입니다.']);
                    return false;
                }

                return {
                    "reader": convertToApprUserModelFrom(orgTreeData)
                };
            },
            isValidOrgData : function(data){
                if(this.receiveAllowType == 'USER' && data.type == 'org'){
                    return false;
                }else if(this.receiveAllowType == 'DEPARTMENT' && (data.type != 'org' || data.useReference == false) ){
                    return false;
                }else if(this.receiveAllowType == 'ALL' && data.useReference == false){
                    return false;
                }else{
                    return true;
                }
            },
            /***
             * 부서를 선택했을경우
             */
            addActivityByOrg : function(orgTreeData){
                var self = this;
                var pid = 'gopopup-orgtab';
                var memberList = [];
                // GO-16964: 더블클릭시 복수개의 창이 호출되는 것을 방지
                if($('#' + pid).length > 0) return;
                var defer = $.Deferred();
                if(!orgTreeData.includedSubDept){
                    reqDeptMemberList.call(this, defer, orgTreeData);
                } else {
                    reqDeptMemberList.call(this, defer, orgTreeData, true);
                }

                function reqDeptMemberList(defer, orgTreeData, isIncludeSubDept) {
                    isIncludeSubDept = isIncludeSubDept || false;
                    var memberInfos = [];
                    memberInfos.push(orgTreeData); //본인 부서
                    if(isIncludeSubDept){
                        var reqUrl = GO.config('contextRoot') + 'api/organization/dept/tree?deptid=' + orgTreeData.id + (!!isIncludeSubDept ? '&scope=subdept' : '');

                        return $.ajax(reqUrl).done(_.bind(function(memberList) {
                            _.each(memberList, function(member) {
                                if(member.metadata['useReference']){
                                    memberInfos.push(makeTreeData.call(self, member.metadata));
                                }
                            }, this);
                            defer.resolve(this.addReaders(memberInfos));

                        }, this)).fail(function() {
                            console.log('error');
                            defer.reject();
                        });
                    }else{
                        defer.resolve(this.addReaders(memberInfos));
                    }
                }

                function makeTreeData(metadata) {
                    return{
                        'id' : metadata['id'],
                        'companyId' : metadata['companyId'],
                        'email' : metadata['email'],
                        'originalEmail' : metadata['originalEmail'] == undefined ? metadata['email'] : metadata['originalEmail'],
                        'name' : metadata['name'],
                        'type' : 'org',
                        'code' : metadata['code'],
                        'subdept' : metadata['childrenCount'] == 0 ? false : true,
                        'useReception' : !!metadata['useReception'],
                        'useReference' : !!metadata['useReference']
                    }
                }
            },
            addReaders : function(modelAttrs){
                var self = this;
                var modelAttr;
                var addOptions = {};
                if(!modelAttrs) {
                    return;
                }
                _.each(modelAttrs, function(orgTreeModel){
                    var filtered = self.docReadersCollection.find(function(model) {
                        return model.get("reader").id === orgTreeModel.id;
                    });

                    // 중복 체크..
                    if(filtered) {
                        return;
                    }
                    modelAttr = {
                        "reader" : convertToApprUserModelFrom(orgTreeModel)
                    };

                    self.docReadersCollection.add(modelAttr, addOptions);
                    //self._renderList(self.docReadersCollection);
                    //self._renderMySubscriberList();
                });
                //this.observer.trigger('resize');
            },
        });

        /**
         * 조직도에서 전달된 데이터를 ApprUserModel로 변환
         *
         * 참고: ApprUserModel(백엔드)
         */
        function convertToApprUserModelFrom(orgTreeData) {
            var result = {};
            if(orgTreeData && orgTreeData.type && orgTreeData.type.toLowerCase() === 'org') {
                result = {
                    "id": orgTreeData.id,
                    "name": orgTreeData.name,
                    "deptId": orgTreeData.id,
                    "deptName": orgTreeData.name,
                    "deptType": true
                };
            } else {
                result = _.pick(orgTreeData, 'id', 'name', 'position', 'deptId', 'deptName', 'thumbnail');
                result.deptType = false;
            }
            return result;
        }

        return ApprFlowReadersView;
    });