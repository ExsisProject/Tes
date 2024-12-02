define(function(require) {
    var App = require("app");
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var Template = require("hgn!contact/templates/dept_import");
    var TplDeptImportList = require("hgn!contact/templates/dept_import_list");
    var TplGroupCreate = require("hgn!contact/templates/group_create");
    var CommonLang = require("i18n!nls/commons");
    var ContactLang = require("i18n!contact/nls/contact");
    var UserLang = require("i18n!nls/user");
    var CreateGroupModel = require("contact/models/create_group");
    var GroupInfoModel = require("contact/models/group_info");
    var PersonalGroupCollection = require("contact/collections/personal_group");
    var DeptGroupCollection = require("contact/collections/dept_group");
    var ContactOrgMemberCollection = require("contact/collections/contacts_org_member");
    require("jquery.placeholder");
    require("jquery.jstree");

    var ContactConnector,
        language = {
            "use_help": ContactLang["주소록 사용 설명"],
            "all": CommonLang["전체"],
            "search": CommonLang["검색"],
            "user": CommonLang["사용자"],
            "group": CommonLang["그룹"],
            "etc": CommonLang["기타"],
            "remove": CommonLang["삭제"],
            "organization" : ContactLang['조직도'],
            "search_null" : CommonLang['검색결과없음'],
            "list_more" : CommonLang['더보기'],
            "lowDeptInclude" : CommonLang['하위부서포함'],
            "user" : CommonLang['사용자'],
            'name' : CommonLang['이름'],
            'dept' : UserLang['부서'],
            'position' : UserLang['직위'],
            'email' : UserLang['이메일'],
            'company' : UserLang['회사'],
            'dup_addr' : ContactLang['중복 처리방식2'],
            'all_new' : ContactLang['새로추가'],
            'overwrite' : ContactLang['덮어쓰기'],
            'not_add' : ContactLang['추가안함'],
            'import_desc' : ContactLang['가져오기설명'],
            'group_create' : ContactLang['그룹추가'],
            'contact_group' : ContactLang['주소록 그룹'],
            'dept_import_desc' : ContactLang['부서 가져오기 설명'],
            'new_group' : ContactLang['새 그룹']
        };

    ContactConnector = Backbone.View.extend({
        el : '.go_popup .content',
        className: "content layer_address",

        isCompany : function(){
            return this.type == "COMPANY";
        },

        isUser : function(){
            return this.type == "USER";
        },

        isDept : function(){
            return this.type == "DEPARTMENT";
        },

        events : {
            "click #groupCreate" : "groupCreate",
            "click #searchTab" : "searchTab",
            "click #receiveGroup" : "sendGroup",
            "click #receiveUser" : "sendUser",
            "keydown #contactSearch1" : "searchKeyboardEvent",
            "click #contactSearch2" : "search",
            "click .btn_list_reload" : "listMore",
            "click #contactChkAll" : "contactChkAll",
            "click ul span.ic_list_del" : "deleteItem",
            "click input.lowDeptChk" : "chkLowDeptInclude",
            "click #contactTable tr td[class!='checkbox']" : "selectLow",
            "click #groupNameTag li span.ic_del" : "deleteGroup"
        },

        initialize: function() {
            var options = this.options;
            this.type = options.type;
            this.groupId = options.groupId;
            this.deptId = options.deptId;
            this.addrSearchPlaceHolder = language.name +'/'+ language.email +'/'+ language.company;
        	this.orgSearchPlaceHolder = language.name +'/'+ language.user_id +'/'+ language.dept +'/'+ language.position +'/'+ language.title +'/'+ language.phone;
            if(this.groupId){
                this.groupInfo = GroupInfoModel.read({groupId : this.groupId}).toJSON();
            }
        },

        render : function() {
            var tvars = $.extend(true, {}, { "lang": language });
            this.$el.empty().append(Template( tvars ));
            this.renderOrgTree();
            this.setGlobalMethod();
            this.changeSearchPlaceHolder(this.addrSearchPlaceHolder);
            this.$el.find('span.lowDeptCheck').hide();
            this.existCompanyGroups();

            if(this.groupInfo) {
                this.popupGroupNameAdd(this.groupInfo.name, this.groupInfo.id);
            }

            if(this.isCompany()) {
                this.$el.find('#groupCreate').remove();
                this.$el.find('#groupNameTag').find('.btn_wrap').remove();
            }
        },

        selectLow : function(e){
            var target = $(e.currentTarget).parents('tr').first();
            var inputEl = target.find("input");
            var isChecked = inputEl.is(":checked");
            target.find('input[type=checkbox]').not('[disabled]').attr('checked', !isChecked);
        },

        chkLowDeptInclude : function(e){
            var target = $(e.currentTarget);
            var currentDataId = target.parents('li').first().attr('data-id');
            var currentDataName = target.parents('li').first().attr('data-deptname');
            var lowDept = "0";
            var addressData = "";
            //하위부서 체크한 경우
            if(target.is(':checked')){
                lowDept = "1";
                target.parents('li').first().attr('data-sub', 'true');
            }else{
                lowDept = "0";
                target.parents('li').first().attr('data-sub', 'false');
            }
            addressData = '"'+currentDataName+'" <'+currentDataId+'_'+lowDept+'>';
            target.parents('li').first().find('label:first').html(addressData);

        },

        contactChkAll : function(e){
            var isChecked = $(e.currentTarget).is(':checked');
            $("#contactTable").find('tbody input[type=checkbox]').not('[disabled]').attr('checked', isChecked);
        },

        renderOrgTree : function() {
            var _this = this;
            $('.bottom_action').hide();
            this.orgTree = this.$el.find('#org-tree').empty().jstree({
                'plugins' : [ 'themes', 'json_data', 'ui', 'crrm', 'cookies', 'types' ],
                'core' : { 'animation' : 120 },
                'json_data' : {
                    'ajax' : {
                    	/*"url" : GO.contextRoot + 'api/' + 'organization/dept',*/
                    	"url" : function(n) {
                    		if(typeof n.data == 'function') {
                    			return GO.contextRoot + 'api/' + 'organization/dept';
                    		} else {
                    			return GO.contextRoot + 'api/' + 'organization/multi/list';
                    		}
                    	},
                    	"data" : function(n) {
                    		if(typeof n.data == 'function') {
                    			var data = n.data();
                    			return {deptid : data ? data.id : _this.loadId};
                    		} else {
                    			return {type : 'mydept', scope : 'dept'};
                    		}
                    	},
                        "cache" : true,
                        "async" : true,
                        "success" : function(data) {
                            try {
                                if (data == null) {
                                    var emptyHtml = ["<tr>",
                                                            "<td class='null_data' colspan='6'>",
                                                            "<span>"+language.search_null+ "</span>",
                                                        "</td>",
                                                    "</tr>"].join("");

                                    _this.$el.find('.scroll_wrap>table>tbody').empty();
                                    _this.$el.find('.scroll_wrap>table>tbody').append(emptyHtml);
                                }
                            }catch(err){
                                console.info(err);
                            }
                        }
                    }
                },
                'core' : { 'animation' : 120 },
                'defaults ' : {
                    'html_titles' : false,
                    'move_node' : false,
                    'ccp' : true,
                    'width' : 200
                },
                'ui' : {
                    'select_multiple_modifier' : false,
                    'select_limit' : 1
                },
                'hotkeys' : {
                    'del' : _this._deleteDept,
                    'f2' : function() {
                        return false;
                    }
                },
                'types' : {
                    'max_depth' : 10,
                    "max_children" : 10,
                    'valid_children' : [ "root" ],
                    'start_drag' : false,
                    'move_node' : false,
                    "start_drag" : false,
                    "move_node" : false,
                    'delete_node' : false,
                    'remove' : false,
                    'types' : {
                        'root' : {
                            'valid_children' : [ "org" ],
                            "start_drag" : false,
                            "move_node" : false,
                            "delete_node" : false,
                            "remove" : false
                        },
                        'org' : {
                            'max_depth' : 10,
                            "max_children" : 10,
                            'valid_children' : [ "org" ],
                            "start_drag" : true,
                            "move_node" : true,
                            "delete_node" : true,
                            "remove" : true
                        }
                    }
                }
            })
            .bind("loaded.jstree", function(event, data) {
                //_this.orgTree.find('a[rel="root"]').attr('data-bypass',1).trigger('click');
            })
            .bind("load_node.jstree", function( node , success_callback , error_callback ) {
                _this.orgTree.find('a[href="#"]').attr('data-bypass',1);
            })
            .bind("select_node.jstree", $.proxy(_this.renderOrgMember,_this));
            
            $.go(GO.contextRoot + 'api/user/profile/'+GO.session('id'), "" , {
                qryType : 'GET',
                async : false,
                contentType : 'application/json',
                responseFn : function(response) {
                    var deptId = response.data.deptMembers[0].deptId;
                    var deptName = response.data.deptMembers[0].deptName;
                    _this.drawOrgMemger(deptId,deptName);
                    setTimeout(function(){
                        _this.orgTree.find('a[nodeid="'+deptId+'"]').addClass('jstree-clicked');
                        //_this.orgTree.find('a[nodeid="'+deptId+'"]').trigger('click');
                        if(deptId){
                            _this.selectedDeptData = {};
                            _this.selectedDeptData.id = deptId;
                            _this.selectedDeptData.name = deptName;
                        }
                    },500);
                },
                error : function(error){
                    
                }
            });
        },

        drawOrgMemger : function(deptId,deptName) {
            var self = this;
            this.keyword = null;
            this.collection = ContactOrgMemberCollection.getCollection(deptId, null, 0);
            var dataset = this.collection.toJSON();
            var tpl=TplDeptImportList({
                data : dataset,
                lang : language,
                isEmail : function() {
                    if(this.email.length) {
                        return true;
                    } else {
                        return false;
                    }
                },
                departmentName : function(){
                    return deptName;//self.selectedDeptData.name;//deptName; //소속한 부서가 둘이상일경우
                },
                positionName : function(){
                    return this.position;
                },
                isOrgAccess : GO.session("useOrgAccess")
            });
            this.$("#contactChkAll").attr("checked", false);
            $('.scroll_wrap>table>tbody').empty();
            $('.scroll_wrap>table>tbody').append(tpl);

            if(this.collection.page.lastPage) {
                $('.bottom_action').hide();
            } else {
                $('.bottom_action').show();
                $('.bottom_action').attr('data-param', 'org');
                $('.bottom_action').attr('data-deptid', deptId);
                $('.bottom_action').attr('data-deptname', deptName);
            }
        },

        renderOrgMember : function(e, data) {
            var self = this;
            data.inst.toggle_node(data.rslt.obj[0]);
            this.selectedDeptData = $(data.rslt.obj[0]).data();
            this.drawOrgMemger(this.selectedDeptData.id,this.selectedDeptData.name);
        },

        existCompanyGroups : function(){
            $.ajax({
                type : "GET",
                async : false,
                dataType : "json",
                url : GO.contextRoot + "api/contact/company/group/exist",
                success : function(resp) {
                    if(!resp.data){
                        $('#companyGroups').remove();
                    }
                },
                error : function(resp) {
                    $.goError(resp.responseJSON.message);
                }
            });
        },
        setGlobalMethod : function(){
            window.getAddrRcptList = function(){
                var param ={};
                var toList = $('#mailReceive label.mailInfo').map(function(){
                    return $(this).text();
                }).get();

                param.toList = toList;
                var ccList = $('#mailCC label.mailInfo').map(function(){
                    return $(this).text();
                }).get();

                param.ccList = ccList;
                var bccList = $('#hiddenCC label.mailInfo').map(function(){
                    return $(this).text();
                }).get();

                param.bccList = bccList;
                return param;
            };
        },

        receiveGroup : function() {

        },

        sendUser : function(e) {
            var contactEl = $('.scroll_wrap').find('tbody input[type="checkbox"]:checked');
            if(contactEl.length == 0){
                $.goMessage(ContactLang['선택된 주소록이 없습니다']);
                return;
            }

            var current = $(e.currentTarget).attr('id');
            var target = $('#mailReceive ul');
            if(current == 'receiveUser') {
                target = $('#mailReceive ul');
            } else if(current == 'mailCCUser') {
                target = $('#mailCC ul');
            } else if(current == 'hiddenCCUser') {
                target = $('#hiddenCC ul');
            }

            var cnt = 0;
            target.find('li').each(function(){
                if($(this).html() == ''){
                    cnt++;
                    $(this).remove();
                }
            });

            var messageFlag = null;

            $.each(contactEl, function() {
                var email = $(this).attr('data-email'),
                    name = $(this).attr('data-name'),
                    deptName = $(this).attr('data-deptname'),
                    position = $(this).attr('data-position'),
                    userId = $(this).attr('data-userid'),
                    nodeType = $(this).attr('data-nodetype');
                
                
                if (!email.length) return true;
                                
                if(nodeType == "department") return true;

                var personalPart = [name];

                if (deptName != "") personalPart.push(deptName);
                if (position != "") personalPart.push(position);

                if(!target.find('li[data-userid="'+userId+'"]').length) {
                    target.append('<li class="user" data-userid="'+userId+'">' +
                                    '<label class="mailInfo" title="'+name+' : ' + email + '">"'+personalPart.join('/')+'" &lt'+email+'&gt</label>'+
                                    '<span class="list_side_wrap">'+
                                        '<span class="btn_wrap"><span class="ic_side ic_list_del"></span></span>'+
                                    '</span>'+
                                '</li>');
                    messageFlag = true;
                } else {
                    messageFlag = messageFlag ? true : false;
                }
            });

            // messageFlag : 하나라도 추가되면 true, 모두 존재하면 false, 모두 email 이 없으면 null
            if (messageFlag) {
                $.goMessage(CommonLang['추가되었습니다.'], "message");
            } else if (messageFlag == false) {
                $.goMessage(CommonLang["이미 선택되었습니다."]);
            }

            var emptyLi = cnt - contactEl.length;
            if(emptyLi > 0){
                for(var i=0 ; i<emptyLi ; i++){
                    target.append('<li></li>');
                }
            }

        },

        deleteItem : function(e) {
            e.stopPropagation();
            var target = $(e.currentTarget);
            var liCnt = target.parents('ul').find('li').length - 1;
            var attachElId = target.parents('div').first().attr('id');
            var addLiCnt;
            target.closest('li').remove();
            if(liCnt < 6){
                addLiCnt = 6 - liCnt;
                for(var i=0 ; i<addLiCnt ; i++){
                    $("#"+attachElId).find('ul').append('<li></li>');
                }
            }
        },

        sendGroup : function(e) {
            var contactEl = null;
            if($('li[data-type="personalGroups"] a.jstree-clicked').length) {
                contactEl = $('li[data-type="personalGroups"] a.jstree-clicked').parent();
            } else if($('li[data-type="companyGroups"] a.jstree-clicked').length){
                contactEl = $('li[data-type="companyGroups"] a.jstree-clicked').parent();
            } else {
                if(!this.orgTree){
                    return;
                }

                if($("#org-tree").find('a').hasClass("jstree-clicked")){
                    //트리에서 선택했을 때 , 트리에서 선택된 부서를 옮긴다.
                    contactEl = this.orgTree.jstree('get_selected');
                }else{
                    // 검색일 때 , 체크박스에 체크한 부서를 옮긴다.
                    contactEl = $('.scroll_wrap').find('tbody input[data-nodetype="department"][type="checkbox"]:checked');
                }
            }
            if(contactEl.length == 0){
                $.goMessage(ContactLang['선택된 그룹이 없습니다']);
                return;
            }

            var current = $(e.currentTarget).attr('id');



            var target = $('#mailReceive ul');
            if(current == 'receiveGroup') {
                target = $('#mailReceive ul');
            } else if(current == 'mailCCGroup') {
                target = $('#mailCC ul');
            } else if(current == 'hiddenCCGroup') {
                target = $('#hiddenCC ul');
            }

            var cnt = 0;
            target.find('li').each(function(){
                if($(this).html() == ''){
                    cnt++;
                    $(this).remove();
                }
            });

            var deptId = contactEl.data('id');
            var lowDeptInclude = false;
            var lowDeptIncludeStr = '';
            //if($("input:checkbox[id='isSearchHierarchy']").is(":checked") == true) {
            /*if(target.parents('div').find('input.lowDeptInclude').is(":checked") == true) {
                deptId += "_1";
                lowDeptInclude = true;
            } else {
                deptId += "_0";
                lowDeptInclude = false;
            }*/
            //하위부서 포함일 경우
            lowDeptIncludeStr = '<div style="padding-left:20px">'+language.lowDeptInclude+'</div>';
            var deptName = contactEl.data('name');
            if(!target.find('li[data-id=' + deptId + ']').length) {
                target.append('<li class="group" data-deptname="'+deptName+'" data-id="'+deptId+'" data-sub="false"><label class="mailInfo">"'
                        +deptName+'" &lt'+deptId+'_0&gt</label>'+
                        '<span class="list_side_wrap">'+
                            '<input type="checkbox" class="lowDeptChk" id="'+deptName+deptId+'"><label class="depth" for="'+deptName+deptId+'">'+language.lowDeptInclude+'</label>'+
                                '<span class="btn_wrap">'+
                                    '<span class="ic_side ic_list_del"></span>'+
                                '</span>'+
                        '</span>'+
                        '</li>');
            } else {
                $.goMessage(CommonLang["이미 선택되었습니다."]);
            }



            if(cnt > 1){
                for(var i=0 ; i<cnt-1 ; i++){
                    target.append('<li></li>');
                }
            }

        },

        searchTab : function(e){
            var target = $(e.currentTarget);
            if(target.hasClass('ui-state-active')){
                return;
            }
            $(e.currentTarget).parents('ul').find('li').removeClass('ui-state-active');
            target.addClass('ui-state-active');
            $('#initialWord').hide();
            $('#moveTab').addClass('move_wrap_noindex');
            $('#isSearchHierarchy').hide();
            this.tabContentChange('userSearch');
        	if(type == "personal"){
        		this.$el.find('.bottom_action').attr('data-deptname', '');
        		this.changeSearchPlaceHolder(this.addrSearchPlaceHolder);
        	} else {
        		this.changeSearchPlaceHolder(this.orgSearchPlaceHolder);
        	}
            var emptyTpl = ['<tr>',
                                '<td class="null_data" colspan="6">',
                                '<span>'+language.search_null+'</span>',
                                '</td>',
                            '</tr>'].join('');
            this.$el.find('.scroll_wrap>table>tbody').empty();
            this.$el.find('.scroll_wrap>table>tbody').append(emptyTpl);
        },
        changeSearchPlaceHolder : function(str){
            $("#contactSearch1").val('');
            $("#contactSearch1").attr('placeholder',str);
            $("#contactSearch1").attr('title',str);			// tooltip 변경
            $('input[placeholder], textarea[placeholder]').placeholder();
        },
        tabContentChange : function(type){
            //검색탭 클릭시 왼쪽 트리영역 없애야함.
            if(type == "userSearch"){
                $("#mailAddressWrap").addClass('mail_address_search');
            }else{
                $("#mailAddressWrap").removeClass('mail_address_search');
            }
        },

        searchKeyboardEvent : function(e) {
            if(e.keyCode == 13) {
                this.search();
            }
        },

        search : function() {
            var searchForm = this.$el.find('.search_wrap input'),
                keyword = searchForm.val();

            if(keyword == '') {
                $.goMessage(CommonLang['검색어를 입력하세요.']);
                return;
            }

            this.keyword = keyword;
            this.selectedDeptData = undefined;

            if(!$.goValidation.isCheckLength(2,64,keyword)){
                $.goMessage(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
                return;
            }
            var dataset = null;
            this.collection = null;
            this.collection = ContactOrgMemberCollection.getCollection(0, keyword,0);

            dataset = this.collection.toJSON();
            var opt = {
                data : dataset,
                lang : language,
                isEmail : function() {
                    if(this.email.length || this.nodeType == "department") {  //검색시에는 이메일이 없는 부서도 체크박스 활성화
                        return true;
                    } else {
                        return false;
                    }
                }
            };




            opt.positionName = function(){
                if(this.position){
                    return this.position;
                }
                return '';
            };
            opt.departmentName = function(){
                if(this.departments){
                    return this.departments.join(',');
                }
                return '';
            };

            opt.userId = function(){
                if(this.id){
                    return this.id;
                }
                return '';
            };
            //부서 검색 후 검색 결과를 체크해서 그룹을 넣기 위함.
            this.orgTree.jstree('deselect_all');


            var tpl = TplDeptImportList(opt);

            this.$el.find('.scroll_wrap>table>tbody').empty();
            this.$el.find('.scroll_wrap>table>tbody').append(tpl);

            if(this.collection.page.lastPage) {
                this.$el.find('.bottom_action').hide();
            } else {
                var options = {
                    "ORG" : "org",
                    "USER" : "contacts",
                    "COMPANY" : "company"
                }

                this.$el.find('.bottom_action').show();
                this.$el.find('.bottom_action').attr('data-param', options[ownerType]);
                this.$el.find('.bottom_action').attr('data-type', 'search');
            }

            $("#contactSearch1").val("");
            $('#initialWord').hide();

        },

        listMore : function(e) {
            var self = this;
            var deptName = this.$el.find('.bottom_action').attr('data-deptname');
            this.collection = ContactOrgMemberCollection.getCollection(this.$el.find('.bottom_action').attr('data-deptid'), this.keyword, this.collection.page.page + 1);
            var dataset = this.collection.toJSON();
            var opt = {
                    data : dataset,
                    lang : language,
                    isEmail : function() {
                        if(this.email.length) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    departmentName : deptName,
                    isOrgAccess : GO.session("useOrgAccess")
                };

                opt.positionName = function(){
                    if(this.position){
                        return this.position;
                    }
                    return '';
                };
                opt.departmentName = function(){
                    if(this.departments){
                        return this.departments.join(',');
                    }else if(self.selectedDeptData){
                        return self.selectedDeptData.name;
                    }else{
                        return '';
                    }
                };
                opt.userId = function(){
                    if(this.id){
                        return this.id;
                    }
                    return '';
                };

                var tpl=TplDeptImportList(opt);

            this.$el.find('.scroll_wrap>table>tbody').append(tpl);

            if(this.collection.page.lastPage) {
                this.$el.find('.bottom_action').hide();
            } else {
                this.$el.find('.bottom_action').show();
            }
        },

        groupCreate : function() {
            var groups;

            if(this.isUser()){
                groups = PersonalGroupCollection.getCollection().toJSON() || [];
            }else{ // this.isDept()
                groups = DeptGroupCollection.get(this.deptId).toJSON();
            }

            this.popupEl = $.goPopup({
                header : ContactLang["그룹추가"],
                pclass: 'layer_creat_group layer_normal',
                width : "280px",
                allowPrevPopup : 'true',
                contents : TplGroupCreate({
                    data:groups,
                    lang:language
                })
            });

            this.popupEl.reoffset();
            this.popupUnbindEvents();
            this.popupBindEvents();
        },

        popupUnbindEvents : function() {
            this.popupEl.off();
        },

        popupBindEvents : function(){
            this.popupEl.on("click", "#popupGroupAdd", $.proxy(this.popupGroupAdd, this));
            this.popupEl.on("click", ".popupGroupName", $.proxy(this.popupGroupName, this));
            this.popupEl.on("click", "#popupGroupCreate", $.proxy(this.popupGroupCreate, this));
            this.popupEl.on("click", "#popupGroupCancel", $.proxy(this.popupGroupCancel, this));
        },

        popupGroupAdd : function(e) {
            var item = $(e.currentTarget).parents('ul.group_tag').children('li.edit');
            if(item.css('display') == 'none') {
                item.show();
            } else {
                $.goAlert(ContactLang["1개 이상 추가할 수 없습니다."]);
            }
        },

        popupGroupCreate : function(e){
            var self = this;
            var groupName = $(e.currentTarget).parents('li.edit').children('input').val();
            var invalidAction = function(msg, focusEl) {
                $.goMessage(msg);
                if(focusEl) focusEl.focus();
                return false;
            };

            if(!$.goValidation.isCheckLength(2, 16, groupName)) {
                invalidAction(App.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"16"}), $(e.currentTarget).parents('li.edit').children('input'));
                return false;
            } else {
                this.model = new CreateGroupModel({type : self.type});
                this.model.set({
                    "name" : groupName,
                    "deptId" : this.deptId
                },{ silent : true });

                this.model.save({},{ type : 'POST',
                    success : function(model, response) {
                        if(response.code == '200') {
                            self.popupGroupNameAdd(groupName, response.data.id);
                            GO.EventEmitter.trigger('contact', 'changed:sideGroups');
                            $(e.currentTarget).parents('li.edit');
                            $('.group_tag li.edit').before('<li class="popupGroupName" data-id="'+response.data.id+'"><a data-bypass="">'+groupName+'</a></li>');
                            self.popupGroupCancel(e);
                        }
                    },
                    error : function(model, response) {
                        var result = JSON.parse(response.responseText);
                        $.goMessage(result.message);
                    }
                });
            }
        },

        popupGroupCancel : function(e) {
            $(e.currentTarget).parents('li.edit').hide().children('input').val('');
        },

        popupGroupNameAdd : function(groupName, groupId){
            $('#groupNameTag li.creat').parent().append('<li data-id='+groupId+'><input type="hidden" name="groupId" value='+groupId+'><span class="name">'+groupName
            		+'</span><span class="btn_wrap"><span class="ic_classic ic_del" title="'+CommonLang['삭제']+'"></span></span></li>');
        },

        popupGroupName : function(e){
            var id =  $(e.currentTarget).attr('data-id'),
                name = $(e.currentTarget).children('a').text();
            var targetEl = $('#groupNameTag');

            if(!targetEl.find('li[data-id="'+id+'"]').length) {
                $('#groupNameTag li.creat').parent().append('<li data-id='+id+'><input type="hidden" name="groupId" value='+id+'><span class="name">'+name
                		+'</span><span class="btn_wrap"><span class="ic_classic ic_del" title="'+CommonLang['삭제']+'"></span></span></li>');
            } else {
                $.goMessage(CommonLang["이미 선택되었습니다."]);
            }
        },

        deleteGroup : function(e) {
            $(e.currentTarget).parents('li').remove();
            this.showModifyBtn();
        },
    });

    return ContactConnector;
});
