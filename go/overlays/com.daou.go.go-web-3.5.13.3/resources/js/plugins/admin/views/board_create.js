define(function(require) {
    var $ =  require("jquery");
    var Backbone = require("backbone");
    var GO =  require("app");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var boardLang = require("i18n!board/nls/board");
    var TplBoardCreate = require("hgn!admin/templates/board_create");
    var TplGroupList = require("admin/views/board_group_list");
    var PublicWriterGroupList = require("admin/views/board_public_writer_group_list");
    var TplBoardCreateManager = require("hgn!board/templates/board_create_manager");
    var TplBoardModify = require("hgn!admin/templates/board_modify");
    var BoardModel = require("admin/models/base_model");
    var tplBoardCreateHeaderPart =require("hgn!board/templates/board_create_header");
    var BoardAllowIps = require("admin/views/board_allow_ips");

    require("jquery.go-orgslide");
    require("jquery.go-sdk");
    require("jquery.go-validation");
    require("jquery.go-popup");

    var lang = {
        'anonym_flag' : boardLang['익명 설정'],
        'anonym_tooltip' : boardLang['익명 설정 툴팁'],
        'anonym_desc' : boardLang['※ 익명 설정은 나중에 변경하실 수 없습니다.'],
        'public_writer_for_post' : boardLang['게시물 작성자 공개 설정 허용'],
        'public_writer_for_post_comment' : boardLang['댓글 작성자 공개 설정 허용'],
        'all_user_option' : adminLang['전체 사용자'],
        'specific_user_option' : adminLang['일부 사용자'],
        'company_board_add' : adminLang['전사 게시판 추가'],
        'board_info' : adminLang['게시판 등록정보'],
        'board_title' : adminLang['게시판 제목'],
        'board_description' : adminLang['게시판 설명'],
        'board_type' : adminLang['게시판 유형'],
        'board_BBS' : adminLang['클래식 타입'],
        'board_STREAM' : adminLang['피드 타입'],
        'share_range' : adminLang['공개 범위'],
        'share_public' : adminLang['공개 (쓰기/읽기)'],
        'share_private' : commonLang['비공개'],
        'board_manager' : adminLang['운영자'],
        'board_manager_select' : adminLang['운영자 추가'],
        'board_save' : commonLang['저장'],
        'board_cancel' : commonLang['취소'],
        'board_add_cancel' : commonLang['취소'],
        'delete' : commonLang['삭제'],
        'BBS' : adminLang['클래식'],
        'STREAM' : adminLang['피드'],
        'add_manager_alert' : adminLang['열람자를 추가해주세요.'],
        'org' : adminLang['조직도'],
        'company_board_setting' : adminLang['전사 게시판 설정'],
        'board_modify' : commonLang['수정'],
        'service_status' : adminLang['서비스 상태'],
        'service_active' : adminLang['정상'],
        'service_closed' : adminLang['중지'],
        'service_manager' : adminLang['관리자'],
        'me' : adminLang['나'],
        'read' : adminLang['읽기'],
        'write' : adminLang['쓰기'],
        'modify' : commonLang['수정'],
        'del' : commonLang['삭제'],
        'position' : adminLang['직위'],
        'grade' : adminLang['직급'],
        'duty' : adminLang['직책'],
        'usergroup' : adminLang['사용자그룹'],
        'no_title' : adminLang['제목이 없습니다.'],
        'alert_length' : adminLang['0자이상 0이하 입력해야합니다.'],
        'board_delete' : adminLang['게시판 삭제'],
        'alert_delete' : adminLang['게시판 삭제 확인2'],
        'header_use' : commonLang['사용'],
        'header_not_use' : commonLang['사용하지 않음'],
        'header' : adminLang['말머리'],
        'header_placeholder' : adminLang['말머리명 입력'],
        'header_add' : adminLang['말머리 추가'],
        'header_subject' : adminLang['말머리 제목'],
        'modify_done' : commonLang['수정완료'],
        'comment_flag' : adminLang['댓글 작성'],
        'comment_flag_true' : commonLang['허용'],
        'comment_flag_false' : commonLang['허용하지 않음'],
        'header_required_option' : adminLang['게시물 등록시 반드시 선택하게 함'],
        'notification' : adminLang['알림 기능'],
        'board_new' : adminLang['새글이 등록되면 알림 발송'],
        'board_update' : adminLang['게시글이 수정된 경우도 알림 발송'],
        'all_user' : adminLang['모든 사용자에게 알림이 발송됩니다.'],
        'send_mail_flag_title' : commonLang['메일발송 타이틀어드민'],
        'send_mail_flag_tooltip' : commonLang['메일발송 툴팁'],
        'yes_value' : commonLang["예"],
        'no_value' : commonLang["아니오"],
        'board_group': boardLang["게시판그룹"],
        'select_group': boardLang['게시판그룹 선택'],
        'duplicatePermission' : adminLang['이미 추가된 열람자 입니다.'],
        'add_user': adminLang['사용자 추가']
    };
    var instance = null;
    var boardCreate = Backbone.View.extend({
        unbindEvent: function() {
            this.$el.off("click", "input[name=share]:radio");
            this.$el.off("click", "span[data-btntype='publicDelete']");
            // GO-11275 추후 circle 이 적용되면 다시 활성화 예정
//            this.$el.off("click", "span[data-btntype='publicModify']");
            this.$el.off("click", "#selectManager");
            this.$el.off("click", "ul.name_tag li span.ic_del");
            this.$el.off("click", "span.btn[data-btntype='submit']");
            this.$el.off("click", "span.btn[data-btntype='modify']");
            this.$el.off("click", "span.btn_nega[data-btntype='cancel']");
            this.$el.off("click", "span.editable .btn_box");
            this.$el.off("click", "span.btn_nega[data-btntype='modifyCancel']");
            this.$el.off("click", "span.editWrap");

            this.$el.off("click", "input[name=anonymFlag]:radio");
            this.$el.off("click", "input[name=type]:radio");
            this.$el.off("click", "input[name=headerFlag]:radio");
            this.$el.off("click", "#headerAdd");
            this.$el.off("click", "span[data-btntype='headerModify']");
            this.$el.off("click", "span.headerText");
            this.$el.off("click", "span[data-btntype='headerSave']");
            this.$el.off("click", "span[data-btntype='headerDelete']");
            this.$el.off("click", "span[data-btntype='headerCancel']");
            this.$el.off("keyup", "input#headerName");
            this.$el.off("keyup", "input#headerName");
            this.$el.off("keyup", "span.headerInputPart input:text");

            this.$el.off("click", ".btn-add-select-node");
            this.$el.off("click", 'input#publicWriterSettingForPost');
            this.$el.off("click", 'input#publicWriterSettingForPostComment');
            this.$el.off("click", 'input[name=targetForPost]:radio');
            this.$el.off("click", 'input[name=targetForPostComment]:radio');
            this.$el.off("click", '#addPostGroup');
            this.$el.off("click", '#addPostCommentGroup');
        },
        bindEvent : function() {
            this.$el.on("click", "input[name=share]:radio", $.proxy(this.togglePublicRadio, this));
            this.$el.on("click", "span[data-btntype='publicDelete']", $.proxy(this.deletePublicRange, this));
            // GO-11275 추후 circle 이 적용되면 다시 활성화 예정
//            this.$el.on("click", "span[data-btntype='publicModify']", $.proxy(this.modifyPublicRange, this));
            this.$el.on("click", "#selectManager", $.proxy(this.addManager, this));
            this.$el.on("click", "ul.name_tag li span.ic_del", $.proxy(this.deleteMember, this));
            this.$el.on("click", "span.btn[data-btntype='submit']", $.proxy(this.createCompanyBoard, this));
            this.$el.on("click", "span.btn[data-btntype='modify']", $.proxy(this.modifyCompanyBoard, this));
            this.$el.on("click", "span.btn_nega[data-btntype='cancel']", $.proxy(this.cancelCompanyBoard, this));
            this.$el.on("click", "span.editable .btn_box", $.proxy(this.modifyFormTrans, this));
            this.$el.on("click", "span.btn_nega[data-btntype='modifyCancel']", $.proxy(this.cancelModifyCompanyBoard, this));
            this.$el.on("click", "span.editWrap", $.proxy(this.modifyTextFormTrans, this));

            this.$el.on("click", "input[name=anonymFlag]:radio", $.proxy(this.toggleAnonymFlag, this));
            this.$el.on("click", "input[name=type]:radio", $.proxy(this.toggleBoardType, this));
            this.$el.on("click", "input[name=headerFlag]:radio", $.proxy(this.toggleHeaderFlag, this));
            this.$el.on("click", "#headerAdd", $.proxy(this.headerAdd, this));
            this.$el.on("click", "span[data-btntype='headerModify']", $.proxy(this.headerModify, this));
            this.$el.on("click", "span.headerText", $.proxy(this.headerModify, this));
            this.$el.on("click", "span[data-btntype='headerSave']", $.proxy(this.headerSave, this));
            this.$el.on("click", "span[data-btntype='headerDelete']", $.proxy(this.headerDelete, this));
            this.$el.on("click", "span[data-btntype='headerCancel']", $.proxy(this.headerCancel, this));
            this.$el.on("keyup", "input#headerName", $.proxy(this.addHeaderLengthValidate,this));
            this.$el.on("keyup", "span.headerInputPart input:text", $.proxy(this.editHeaderLengthValidate,this));

            // 트리형 게시판 추가
            this.$el.on("click", ".btn-add-select-node", $.proxy(this._addChildNodesSelect,this));
            // 익명 설정 상세 옵션 토글 추가
            this.$el.on("click", '#publicWriterSettingForPost', $.proxy(this.togglePublicWriterForPost, this));
            this.$el.on("click", '#publicWriterSettingForPostComment', $.proxy(this.togglePublicWriterForPostComment, this));
            // 익명 설정 > 작성자 공개 설정 > 일부 사용자 토글 추가
            this.$el.on("click", 'input[name=targetForPost]:radio', $.proxy(this.togglePublicWriterPostGroup, this));
            this.$el.on("click", 'input[name=targetForPostComment]:radio', $.proxy(this.togglePublicWriterPostCommentGroup, this));
            this.$el.on("click", '#addPostGroup', $.proxy(this.addAnonymousTargetForm, this, '#postGroupWrap'));
            this.$el.on("click", '#addPostCommentGroup', $.proxy(this.addAnonymousTargetForm, this, '#postCommentGroupWrap'));
        },

        initialize: function(options) {
            this.options = options || {};
            this.boardId = this.options.boardId;
            this.unbindEvent();
            this.bindEvent();
        },
        render : function() {
            var tmpl;

            if(this.boardId){ //전사게시판 수정 화면 일 때
                this.boardModel = new BoardModel({
                    id : this.boardId,
                    urlRoot : GO.contextRoot + "ad/api/board"
                });
                this.boardModel.fetch({
                    async : false
                });
                this.boardData = this.boardModel.toJSON();
                var boardType = function(){
                    if(this.type == "STREAM"){
                        return lang.STREAM;
                    }
                    return lang.BBS;
                };
                var isAnonym = function() {
                    if(this.anonymFlag) return lang.header_use;
                    return lang.header_not_use;
                };
                var boardTypeByHeader = function(){
                    if(this.type == "CLASSIC"){
                        return true;
                    }
                    return false;
                };

                var getBoardPathInfo = function() {
                    if(_.isArray(this.pathName) && this.pathName.length > 0) {
                        return GO.util.escapeXssFromHtml(this.pathName.join(" &gt; "));
                    }

                    return false;
                };

                tmpl = TplBoardModify({
                    dataset:this.boardData,
                    boardType:boardType,
                    isAnonym:isAnonym,
                    lang:lang,
                    boardTypeByHeader:boardTypeByHeader,
                    pathInfo: getBoardPathInfo
                });
                this.$el.html(tmpl);
                this.setBoardModifyDate(this.boardData);


                this.allowIp = new BoardAllowIps(/**파리미터정보*/{'appName' : 'board', 'targetId' : this.boardData.id});
                this.$el.find("#ipConfigDiv").html(this.allowIp.render().el);
            }else{ //전사게시판 생성 화면일 때
                tmpl = TplBoardCreate({
                    lang:lang
                });
                this.$el.html(tmpl);
                this.toggleBoardType();

                this.allowIp = new BoardAllowIps(/**파리미터정보*/{'appName' : 'board', 'targetId' : 0});
                this.$el.find("#ipConfigDiv").html(this.allowIp.render().el);
            }

        },
        toggleAnonymFlag : function() {
            // notification
        	var selectedVal = this.$el.find('input[name=anonymFlag]:radio:checked').val(),
        		nofiFlagOption = this.$el.find('#notiFlag'),
        		closestTr = $("#boardManagerList").closest('tr');
        	// anonymousOption
            var anonymousOption = this.$el.find('#anonymFlagOption');
	        if(selectedVal == "true") {
	        	nofiFlagOption.hide();
	        	closestTr.addClass("last");
	        	anonymousOption.show();
	        } else {
	        	nofiFlagOption.show();
	        	closestTr.removeClass("last");
	        	anonymousOption.hide();
	        }
        },
        togglePublicWriterForPost : function() {
            var detailOption = this.$el.find('div[name=publicWriterDetailForPost]');
            if($('#publicWriterSettingForPost').is(':checked')) {
                detailOption.show();
            } else {
                detailOption.hide();
            }
        },
        togglePublicWriterForPostComment : function() {
            var detailOption = this.$el.find('div[name=publicWriterDetailForPostComment]');
            if($('#publicWriterSettingForPostComment').is(':checked')) {
                detailOption.show();
            } else {
                detailOption.hide();
            }
        },
        togglePublicWriterPostGroup : function(e) {
            var radioVal = this.$el.find('input[name=targetForPost]:radio:checked').val();
            if(radioVal == "false"){
                $('#postGroupWrap').show();
                $('#addPostGroup').show();
            } else {
                $('#postGroupWrap').hide();
                $('#addPostGroup').hide();
            }
        },
        togglePublicWriterPostCommentGroup : function(e) {
            var radioVal = this.$el.find('input[name=targetForPostComment]:radio:checked').val();
            if(radioVal == "false"){
                $('#postCommentGroupWrap').show();
                $('#addPostCommentGroup').show();
            } else {
                $('#postCommentGroupWrap').hide();
                $('#addPostCommentGroup').hide();
            }
        },
        addAnonymousTargetForm: function(targetElementId) {
            var domainCodeIds = [];
            var depts = [];
            var userIds = [];
            // 공개 범위 찾기
            var publicList = $('#partPublicWrap').parent().find('#groupUl li');
            _.each(publicList, function(data) {
                if (!$(data).attr('data-type') && $(data).attr('data-code')) {
                    domainCodeIds.push($(data).attr('data-code'));
                } else if ($(data).attr('data-type') && $(data).attr('data-type') == 'User' && $(data).attr('data-code')) {
                    userIds.push($(data).attr('data-code'));
                } else if ($(data).attr('data-type') && $(data).attr('data-type') == 'Department' && $(data).attr('data-code') && $(data).attr('data-sharedtype')) {
                    if ('NONE' == $(data).attr('data-sharedtype')) {
                        depts.push('' + $(data).attr('data-code'));
                    } else {
                        depts.push('' + $(data).attr('data-code') + $(data).attr('data-sharedtype'));
                    }
                }
            })
            var targetEl = this.$el.find(targetElementId).find('ul');
            var _this = this;
            var sharedValue = this.$el.find('input[name=share]:radio:checked').val();
            if (sharedValue == "true" && publicList.length != 0) { //비공개
                $.goOrgSlide({
                    type: 'complex',
                    desc: '',
                    includeLoadIds: domainCodeIds,
                    userIds: userIds,
                    depts: depts,
                    contextRoot: GO.contextRoot,
                    callback: $.proxy(function (obj) {
                        _this.addAnonymousTarget(obj, targetEl);
                    }),
                    isAdmin : true,
                    searchPlaceHolder: commonLang['이름'] + '/' + commonLang['아이디']
                });
            } else { //공개
                $.goOrgSlide({
                    header : adminLang['사용자 추가'],
                    desc : '',
                    contextRoot : GO.contextRoot,
                    callback : $.proxy(function(obj) {
                        _this.addAnonymousTarget(obj, targetEl);
                    }),
                    isAdmin : true
                });
            }

            $('div.layer_organogram').css('z-index', '100');
        },
        addAnonymousTarget: function(rsData, targetEl) {
            var writeAuthVal = 1;
            var sharedTypeVal = "NONE";
            //중복 검사
            if(this.isDuplicatedId(targetEl, rsData.id)) {
                $.goMessage(lang.duplicatePermission);
                throw new Error();
            }
            var ownerTypeLang = adminLang['사용자'];
            var ulList = "";
            ulList = "<li data-code='"+rsData.id+"' data-type='User' data-permission='"+writeAuthVal+"' data-sharedType ='"+sharedTypeVal+"'>"+
                    "<span class='name'>" + rsData.displayName + "</span>" +
                    "<span class='btn_wrap'><span class='ic ic_del' title='"+lang.del+"' data-btntype='publicDelete'></span></span>"+
                "</li>";
            targetEl.addClass("name_tag").append(ulList);
        },
        isDuplicatedId: function(ulEl ,id) {
            var list = ulEl.find('li');
            var state = false;
            list.each(function(){
                var el = $(this);
                if(parseInt(el.attr('data-code')) == parseInt(id)) {
                    state = true;
                    return false;
                }
            })
            return state;
        },
        toggleBoardType : function(){
            var selectedVal = this.$el.find('input[name=type]:radio:checked').val();
            var headerPart = this.$el.find('#headerPartWrapTr');
            if(selectedVal == "CLASSIC") {
                headerPart.show();
            } else {
                headerPart.hide();
            }

        },
        toggleHeaderFlag : function(){
            var selectedVal = this.$el.find('input[name=headerFlag]:radio:checked').val(),
                headerFlagOption = this.$el.find('#headerFlagOption');
            if(selectedVal == "true") {
                headerFlagOption.show();
                this.sortableHeaderFlag();
            } else {
                headerFlagOption.hide();
            }
        },
        sortableHeaderFlag : function () {
			this.$el.find('#headerListPart').sortable({
				delay: 100,
				axis: "y",
				items : "tr",
				hoverClass: "headerText"
			});
			this.$el.find('#headerListPart').disableSelection();
		},
        headerAdd : function(){

            var $headerNameEl = this.$el.find('#headerName'),
                headerNameVal = $.trim($headerNameEl.val()),
                existHeader = false;

            if(!headerNameVal) {
                $headerNameEl.focus();
                return false;
            }

            this.$el.find('tr[data-type="headerPart"]').each(function(){
                if($(this).attr('data-headername') == headerNameVal){
                    $(this).attr('data-headerdeleteflag','false');
                    $(this).show();
                    $('#headerName').val('');
                    existHeader = true;
                    return;
                }
            });
            if(!existHeader){
                var names = [];
                names.push({"name":headerNameVal});
                var headerPart = tplBoardCreateHeaderPart({
                    dataset:names,
                    lang:lang,
                    headerLength : function(){
                        return $.goValidation.realLength(this.name);
                    }
                });
                $('#headerListPart').append(headerPart);
                $('#headerName').val('');
                $("#headerByte").html('0');
            }
        },
        headerModify : function(e){
            var target = $(e.currentTarget).parents('tr').first();
            target.find('span.headerTextPart').hide().end().find('span.headerInputPart').show();
            return false;
        },
        headerSave : function(e){
            var target = $(e.currentTarget).parent();
            var targetP = target.parents('tr').first();


            var inputTextVal = target.siblings('input').val();
            var headerText = targetP.find('span.headerText');

            targetP.attr("data-headername",inputTextVal);
            targetP.find('span.headerTextPart').show();
            headerText.html(inputTextVal);
            targetP.find('span.headerInputPart').hide();
            return false;
        },
        headerCancel : function(e){
            var target = $(e.currentTarget).parents('tr').first();
            target.find('span.headerTextPart').show();
            target.find('span.headerInputPart').hide();
            return false;
        },
        headerDelete : function(e){
            var target = $(e.currentTarget);
            var targetP = target.parents('tr').first();
            targetP.attr('data-headerdeleteflag','true');
            targetP.hide();
        },


        headerLengthValidate : function(targetEl, maxByte, successCallback){
            var inputLen = $.goValidation.realLength(targetEl.val());

            if (parseInt(inputLen) > maxByte) {
                targetEl.val(targetEl.attr('data-value'));
            } else {
                if(typeof successCallback === 'function'){
                    successCallback(inputLen);
                }
                targetEl.attr('data-value',targetEl.val());
            }
        },
        addHeaderLengthValidate : function(){
            var $inputEl = $('#headerName');
            var maxByte = 30;
            var successCallback = function(inputLen){
                var $parent = $inputEl.closest("div");
                $parent.find("#headerByte").text(inputLen);
            };
            this.headerLengthValidate($inputEl, maxByte, successCallback);
        },

        editHeaderLengthValidate : function(e){
            var $inputEl = $(e.currentTarget);
            var maxByte = 30;
            var successCallback = function(inputLen){
                var $parent = $inputEl.closest("span.headerInputPart");
                $parent.find("#headerByte").text(inputLen);
            };
            this.headerLengthValidate($inputEl, maxByte, successCallback);
        },


        cancelModifyCompanyBoard : function(){
            GO.router.navigate('/board/manage', true);
        },
        modifyTextFormTrans : function(e){
            var targetEl = $(e.currentTarget);
            if(targetEl.attr('data-type') == 'title'){
                targetEl.parent().parent().append('<input class="w_half input" type="text" id="title" value="'+targetEl.html()+'"/>');
            }else{
                targetEl.parent().parent().append('<textarea class="w_full input" id="description">'+targetEl.html()+'</textarea>');
            }
            this.$el.find("span.btn_box").hide();
            targetEl.hide();
        },
        modifyFormTrans : function(e){
            var targetEl = $(e.currentTarget);
            var contentpart = targetEl.parent().parent().find('span.editWrap');
            if(contentpart.attr('data-type') == 'title'){
                targetEl.parent().parent().append('<input class="w_half input" type="text" id="title" value="'+contentpart.html()+'"/>');
            }else{
                targetEl.parent().parent().append('<textarea class="w_full input" id="description">'+contentpart.html()+'</textarea>');
            }
            targetEl.parent().parent().find('span.editWrap').hide();
            targetEl.hide();
        },
        /**
         * 수정될 기존 데이터를 수정 화면에 반영하는 함수
         * @param data = 기존 데이터
         */
        setBoardModifyDate :function(data){
            var _this = this;
            this.$el.find('input[name="status"][value="'+data.status+'"]').attr('checked', true);
            $.each(data.managers, function(k,v) {
                _this.setManager(v);
            });
            this.$el.find('input[name="share"][value="'+data.sharedFlag+'"]').attr('checked', true);
            if(data.sharedFlag){
                $("#partPublicWrap").show();
                this.$el.find("#partPublicWrap").parent().find("#groupUl").show();
                TplGroupList.render({id:"#partPublicWrap",type:"add"});

                $.each(data.owners, function(k,v){
                    _this.setJointOwners(v);
                });

            }
            //익명 설정 반영
            if (data.anonymFlag && data.anonymousWriterPostOption.allowed && !data.anonymousWriterPostOption.allUser) {
                //this.togglePublicWriterPostGroup();
                var postGroupUlElement = _this.$el.find('#postGroupWrap').find('#groupUl');
                $.each(data.anonymousWriterPostOption.specificUsers, function(k, v) {
                    postGroupUlElement.append(_this.createliListForAllowedAnonymousWriter(v));
                });
            }
            if (data.anonymFlag && data.anonymousWriterPostCommentOption.allowed && !data.anonymousWriterPostCommentOption.allUser) {
                //this.togglePublicWriterPostCommentGroup();
                var postCommentGroupUlElement = _this.$el.find('#postCommentGroupWrap').find('#groupUl');
                $.each(data.anonymousWriterPostCommentOption.specificUsers, function(k, v) {
                    postCommentGroupUlElement.append(_this.createliListForAllowedAnonymousWriter(v));
                });
            }

            this.$el.find('input[name="commentFlag"][value="'+data.commentFlag+'"]').attr('checked', true);
            this.$el.find('input[name="sendMailFlag"][value="'+data.sendMailFlag+'"]').attr('checked', true);

            if(data.headerFlag){
                this.$el.find('input[name="headerFlag"][value="true"]').attr('checked',true);
            }

            if(data.postHeaders.length || data.headerFlag){

                this.toggleHeaderFlag();
                this.$el.find('input[name="headerRequiredFlag"]').attr('checked', data.headerRequiredFlag);
                var headerPart = tplBoardCreateHeaderPart({
                    dataset:data.postHeaders,
                    lang:lang,
                    headerLength : function(){
                        return $.goValidation.realLength(this.name);
                    }
                });
                this.$el.find('#headerListPart').append(headerPart);
                this.sortableHeaderFlag();
                this.$el.find('#headerFlagOption tr[data-headerdeleteflag="true"]').hide();
            }

            if(data.notificationFlag) {
                this.$el.find('input#byNew').attr('checked', data.notificationFlag);
            }
        },
        createliListForAllowedAnonymousWriter: function(specifiedUser){
            /*var targetName = "";
            var targetInfo = specifiedUser.name.split("|");

            var ownerInfoType = targetInfo[0],
                ownerInfoLang = targetInfo[1];
            if(targetInfo[1] == undefined) {
                ownerInfoLang = targetInfo[0];
                if(specifiedUser.type == "User") {
                    ownerInfoType = adminLang['사용자'];
                }else if(specifiedUser.type == "Department") {
                    ownerInfoType = adminLang['부서'];
                }
            }

            var sharedTypeText = "";
            if(specifiedUser.sharedType == "TO_SUB") {
                sharedTypeText = "("+adminLang['하위 부서 포함']+")";
            }*/
            var liList = "<li data-code='" + specifiedUser.userId + "' data-type='"+ specifiedUser.type + "'>"+
                "<span class='name'>"+ specifiedUser.name +"</span>" +
                "<span class='btn_wrap'><span class='ic ic_del' title='"+lang.del+"' data-btntype='publicDelete'></span></span>"+
                "</li>";

            return liList;
        },
        setManager : function(managers){
            var targetEl = $('#boardManagerList');
            if(managers && !targetEl.find('li[data-id="'+managers.id+'"]').length) {
                targetEl.find('li.creat').before(TplBoardCreateManager($.extend(managers, { lang : lang })));
            }else{
                $.goAlert(commonLang["오류"], adminLang["이미 운영자로 지정"]);
            }
        },
        setJointOwners : function(jointOwners){
            var targetEl = this.$el.find("#partPublicWrap").parent().find('#groupUl');
            var liList,permission ,permissionLang, sharedTypeText;
            if(jointOwners.ownerShip == "MASTER"){
                return;
            }
            if(jointOwners.permission == "3"){
                permission = "3";
                permissionLang = lang.read + "/" +lang.write;
            }else{
                permission = "1";
                permissionLang = lang.read;
            }
            if(jointOwners.sharedType == "TO_SUB"){
                sharedTypeText = "("+adminLang['하위 부서 포함']+")";
            }else {
                sharedTypeText = "";
            }
            var ownerInfo = jointOwners.ownerInfo.split("|");
            var ownerInfoType = ownerInfo[0],
				ownerInfoLang = ownerInfo[1];

            if(ownerInfo[1] == undefined) {
            	ownerInfoLang = ownerInfo[0];
				if(jointOwners.ownerType == "User") {
					ownerInfoType = adminLang['사용자'];
				}else if(jointOwners.ownerType == "Department") {
					ownerInfoType = adminLang['부서'];
				}
			}
            
            if(jointOwners.sharedType == undefined || jointOwners.sharedType == null){
            	jointOwners.sharedType = "NONE";
            }

            liList = "<li data-code='" + jointOwners.ownerId + "' data-type='"+ jointOwners.ownerType + "' data-sharedtype='" + jointOwners.sharedType + "' data-permission='"+permission+"'>"+
                "<span class='major'>["+ownerInfoType+" : "+ownerInfoLang+"]</span>"+
                "<span class='minor'>"+permissionLang + sharedTypeText +"</span>"+
                "<span class='btn_border'><span class='ic ic_delete' title='"+lang.del+"' data-btntype='publicDelete'></span></span>"+
                "</li>";
            targetEl.append(liList);
        },
        setOwners : function(sharedFlag){
            var owners = [];
            owners.push({
                ownerShip : 'MASTER',
                ownerType : 'Company',
                ownerId : GO.session().companyId,
                scope : (sharedFlag == "true") ? 'PART' : 'ALL',
                permission : '3'
            });

            if(sharedFlag == "true"){
                var sharedListPart = $('#partPublicWrap').parent().find('#groupUl').find('li');
                if(sharedListPart.length < 1){
                    return;
                }
                sharedListPart.each(function(){
                    owners.push({
                        ownerShip : 'JOINT',
                        ownerType : $(this).attr('data-type') ? $(this).attr('data-type') : 'DomainCode',
                        ownerId : $(this).attr('data-code'),
                        scope : 'ALL',
                        permission : $(this).attr('data-permission'),
                        sharedType : $(this).attr('data-sharedtype') ? $(this).attr('data-sharedtype') : 'NONE'
                    });
                });

            }
            return owners;
        },
        setManagerIds : function(){
            var managerIds =[];
            var managerIdPart = $('#boardManagerList').find('li[data-id]');

            managerIdPart.each(function(){
                managerIds.push($(this).attr('data-id'));
            });
            return managerIds;
        },
        getNotificationFlag : function() {
            var notificationFlag = "";
            var anonymFlag = $('input[name=anonymFlag]:radio:checked').val() == "true" ? true : false;
            if(this.boardId) {
            	anonymFlag = this.boardData.anonymFlag
            }
            
            if(anonymFlag){
            	return false;
            }else{
            	return $('input#byNew').is(':checked').toString();
            }
        },
        createAnonymousOption: function(isAllowed, isAllUser, specificUsers) {
            return {
                allowed: isAllowed,
                allUser: isAllUser,
                specificUsers: specificUsers
            };
        },

        createCompanyBoard : function(){
            var title = $('#title').val();
            var anonymFlag = $('input[name=anonymFlag]:radio:checked').val();
            var description = $('#description').val();
            var type = $('input[name=type]:radio:checked').val();
            var sendMailFlag = $('input[name=sendMailFlag]:radio:checked').val();
            var commentFlag = $('input[name=commentFlag]:radio:checked').val();
            var owners = [];
            var managerIds =[];
            var sharedFlag = $('input[name=share]:radio:checked').val();
            var notificationFlag = this.getNotificationFlag();

            owners = this.setOwners(sharedFlag);

            //익명 게시판 > 게시글 작성자 공개 허용 여부
            var isAllowedAnonymousWriterExpositionInPost = $('input[name=publicWriterSettingForPost]:checkbox').is(':checked') || false;
            //익명 게시판 > 댓글 작성자 공개 허용 여부
            var isAllowedAnonymousWriterExpositionInPostComment = $('input[name=publicWriterSettingForPostComment]:checkbox').is(':checked') || false;

            var elAnonymousDetailSettingForPost = $('div[name=publicWriterDetailForPost]');
            var elAnonymousDetailSettingForPostComment = $('div[name=publicWriterDetailForPostComment]');
            //게시글 작성자 공개 기능 사용 대상
            var anonymousSettingTargetForPost = elAnonymousDetailSettingForPost.find('input[name=targetForPost]:radio:checked').val(); //'true': 전체 사용자, 'false': 일부사용자
            //댓글 작성자 공개 기능 사용 대상
            var anonymousSettingTargetForPostComment = elAnonymousDetailSettingForPostComment.find('input[name=targetForPostComment]:radio:checked').val(); //'true': 전체 사용자, 'false': 일부사용자

            var availableUserListForAnonymousWriterExpositionInPost = [];
            availableUserListForAnonymousWriterExpositionInPost = elAnonymousDetailSettingForPost.find('#groupUl').find('li');
            var anonymousSettingDetailsForPost = [];

            //Post
            if(!(availableUserListForAnonymousWriterExpositionInPost == undefined || availableUserListForAnonymousWriterExpositionInPost.length == 0)) {
                availableUserListForAnonymousWriterExpositionInPost.each(function(){
                    anonymousSettingDetailsForPost.push({
                        type: 'User',
                        typeId: $(this).attr('data-code'),
                        userId: $(this).attr('data-code')
                    });
                });
            }

            var availableUserListForAnonymousWriterExpositionInPostComment = [];
            availableUserListForAnonymousWriterExpositionInPostComment = elAnonymousDetailSettingForPostComment.find('#groupUl').find('li');
            var anonymousSettingDetailsForPostComment = [];

            //PostComment
            if(!(availableUserListForAnonymousWriterExpositionInPostComment == undefined || availableUserListForAnonymousWriterExpositionInPostComment.length == 0)) {
                availableUserListForAnonymousWriterExpositionInPostComment.each(function(){
                   anonymousSettingDetailsForPostComment.push({
                       type: 'User',
                       typeId: $(this).attr('data-code'),
                       userId: $(this).attr('data-code')
                   });
                });
            }
            var anonymousWriterSettingForPost = this.createAnonymousOption(
                isAllowedAnonymousWriterExpositionInPost,
                anonymousSettingTargetForPost,
                anonymousSettingDetailsForPost
            );
            var anonymousWriterSettingForPostComment = this.createAnonymousOption(
              isAllowedAnonymousWriterExpositionInPostComment,
              anonymousSettingTargetForPostComment,
              anonymousSettingDetailsForPostComment
            );
            if(owners == undefined || owners.length == 0) {
            	$.goMessage(adminLang['공개 범위 지정']);
                return;
            }
            
            managerIds  = this.setManagerIds();

            if($.trim(title) == ''){
                $.goMessage(lang.no_title);
                return;
            }

            if(!$.goValidation.isCheckLength(2,64,title)){
                $.goMessage(GO.i18n(lang['alert_length'], {"arg1":"2","arg2":"64"}));
                $("#title").focus();
                return;
            }

            if($.trim(description) != ''){
                if(!$.goValidation.isCheckLength(2,2000,description)){
                    $.goMessage(GO.i18n(lang['alert_length'], {"arg1":"2","arg2":"2000"}));
                    $("#description").focus();
                    return;
                }
            }

            var url = GO.contextRoot + "ad/api/company/board";
            var data = {
                type:type,
                name:title,
                anonymFlag:anonymFlag,
                commentFlag:commentFlag,
                description:description,
                sharedFlag:sharedFlag,
                managerIds:managerIds,
                owners:owners,
                notificationFlag:notificationFlag,
                sendMailFlag : sendMailFlag,
                anonymousWriterPostOption: anonymousWriterSettingForPost,
                anonymousWriterPostCommentOption: anonymousWriterSettingForPostComment
            };

            var postHeaders = [];
            var headerFlag = "false";
            var headerRequiredFlag = "false";
            var boardType = "STREAM";

            headerFlag = this.$el.find('input[name=headerFlag]:radio:checked').val();
            headerRequiredFlag = this.$el.find('input[name=headerRequiredFlag]').is(":checked"),
                boardType = this.$el.find('input[name=type]:radio:checked').val();
            if(headerFlag == "true" && boardType == "CLASSIC"){
                this.$el.find('tr[data-type="headerPart"]').each(function(i){
                    postHeaders.push({
                    	"id" : $(this).attr('data-headerid') ,
                    	"name" : $(this).attr('data-headername'),
                    	"deletedFlag" : $(this).attr('data-headerdeleteflag'),
						"sortOrder" : i
                	});
                });
                data.headerFlag = headerFlag;
                data.postHeaders = postHeaders;
                data.headerRequiredFlag = headerRequiredFlag;
            }

            // 위치정보(트리형 게시판 작업으로 추가)
            // 그룹이 지정되어 있으면 parentId에 추가
            var $lastSelectNode = this.$el.find('.select-node').last();
            if($lastSelectNode.length > 0) {
                data.parentId = $lastSelectNode.val();
            }
            var self = this;
            $.go(url, JSON.stringify(data), {
                qryType : 'POST',
                contentType : 'application/json',
                responseFn : function(rs) {
                    if(rs.code == 200) {
                        self.allowIp.trigger('saveConfig', {targetId : rs.data.id, appName : 'BOARD'});
                        GO.router.navigate('/board/manage', true);
                    }
                },
                error : function(rs){
                    var serverData = JSON.parse(rs.responseText);
                    $.goMessage(serverData.message);

                    if(serverData.name == "board.name.duplicated"){
                        self.$el.find("#title").focus();
                    }
                }
            });
        },
        modifyCompanyBoard : function(){
            var _this = this;

            var boardId = $("#boardId").val();
            var title = $('#title').val();
            if(!title){
                title = _this.boardModel.get('name');
            }

            var description;
            var descriptionEl = $('#description');
            if(!descriptionEl){
                description = $("span.editWrap[data-type='description']").html();
            }else{
                description = descriptionEl.val();
            }


            if($.trim(title) == ''){
                $.goMessage(lang.no_title);
                return;
            }

            if(!$.goValidation.isCheckLength(2,64,title)){
                $.goMessage(GO.i18n(lang['alert_length'], {"arg1":"2","arg2":"64"}));
                $("#title").focus();
                return;
            }

            if($.trim(description) != ''){
                if(!$.goValidation.isCheckLength(2,2000,description)){
                    $.goMessage(GO.i18n(lang['alert_length'], {"arg1":"2","arg2":"2000"}));
                    $("#description").focus();
                    return;
                }
            }

            var owners = [];
            var managerIds =[];
            var sharedFlag = $('input[name=share]:radio:checked').val();
            var commentFlag = $('input[name=commentFlag]:radio:checked').val();
            var sendMailFlag = $('input[name=sendMailFlag]:radio:checked').val();
            var notificationFlag = this.getNotificationFlag();
            owners = this.setOwners(sharedFlag);
            if(owners == undefined || owners.length == 0) {
            	$.goMessage(adminLang['공개 범위 지정']);
                return;
            }
            managerIds  = this.setManagerIds();

            //익명 게시판 > 게시글 작성자 공개 허용 여부
            var isAllowedAnonymousWriterExpositionInPost = $('input[name=publicWriterSettingForPost]:checkbox').is(':checked') || false;
            var anonymousSettingTargetForPost;
            var anonymousSettingDetailsForPost = [];
            if (isAllowedAnonymousWriterExpositionInPost) {
                var elAnonymousDetailSettingForPost = $('div[name=publicWriterDetailForPost]');
                //게시글 작성자 공개 기능 사용 대상
                anonymousSettingTargetForPost = elAnonymousDetailSettingForPost.find('input[name=targetForPost]:radio:checked').val(); //'true': 전체 사용자, 'false': 일부사용자
                if(anonymousSettingTargetForPost == 'false') {
                    var availableUserListForAnonymousWriterExpositionInPost = [];
                    availableUserListForAnonymousWriterExpositionInPost = elAnonymousDetailSettingForPost.find('#groupUl').find('li');

                    //Post
                    if (!(availableUserListForAnonymousWriterExpositionInPost == undefined || availableUserListForAnonymousWriterExpositionInPost.length == 0)) {
                        availableUserListForAnonymousWriterExpositionInPost.each(function () {
                            anonymousSettingDetailsForPost.push({
                                type: 'User',
                                typeId: $(this).attr('data-code'),
                                userId: $(this).attr('data-code')
                            });
                        });
                    }
                }
            }
            var anonymousWriterSettingForPost = this.createAnonymousOption(
                isAllowedAnonymousWriterExpositionInPost,
                anonymousSettingTargetForPost,
                anonymousSettingDetailsForPost
            );


            //익명 게시판 > 댓글 작성자 공개 허용 여부
            var isAllowedAnonymousWriterExpositionInPostComment = $('input[name=publicWriterSettingForPostComment]:checkbox').is(':checked') || false;
            var anonymousSettingTargetForPostComment;
            var anonymousSettingDetailsForPostComment = [];
            if (isAllowedAnonymousWriterExpositionInPostComment) {
                var elAnonymousDetailSettingForPostComment = $('div[name=publicWriterDetailForPostComment]');
                //댓글 작성자 공개 기능 사용 대상
                anonymousSettingTargetForPostComment = elAnonymousDetailSettingForPostComment.find('input[name=targetForPostComment]:radio:checked').val(); //'true': 전체 사용자, 'false': 일부사용자

                var availableUserListForAnonymousWriterExpositionInPostComment = [];
                availableUserListForAnonymousWriterExpositionInPostComment = elAnonymousDetailSettingForPostComment.find('#groupUl').find('li');

                //PostComment
                if(!(availableUserListForAnonymousWriterExpositionInPostComment == undefined || availableUserListForAnonymousWriterExpositionInPostComment.length == 0)) {
                    availableUserListForAnonymousWriterExpositionInPostComment.each(function(){
                        anonymousSettingDetailsForPostComment.push({
                            type: 'User',
                            typeId: $(this).attr('data-code'),
                            userId: $(this).attr('data-code')
                        });
                    });
                }
            }
            var anonymousWriterSettingForPostComment = this.createAnonymousOption(
                isAllowedAnonymousWriterExpositionInPostComment,
                anonymousSettingTargetForPostComment,
                anonymousSettingDetailsForPostComment
            );



            var qryType = 'PUT';
            var url = GO.contextRoot + "ad/api/board/"+boardId;

            var data = {
                id : this.boardId,
                name:title,
                description:description,
                commentFlag : commentFlag,
                sharedFlag:sharedFlag,
                managerIds:managerIds,
                owners:owners,
                notificationFlag : notificationFlag,
                sendMailFlag : sendMailFlag,
                homeExposureFlag : _this.boardData.homeExposureFlag,
                anonymousWriterPostOption: anonymousWriterSettingForPost,
                anonymousWriterPostCommentOption: anonymousWriterSettingForPostComment
            };

            var postHeaders = [],
                headerFlag = this.$el.find('input[name=headerFlag]:radio:checked').val(),
                headerRequiredFlag = this.$el.find('input[name=headerRequiredFlag]').is(":checked"),
                headerDeletedLength = 0;

            if (headerFlag == "true") {
                this.$el.find('tr[data-type="headerPart"]').each(function(i) {
                    postHeaders.push({
                        "id" : $(this).attr('data-headerid'),
                        "name" : $(this).attr('data-headername'),
                        "deletedFlag" : $(this).attr('data-headerdeleteflag'),
						"sortOrder" : i
                    });
                    if($(this).attr('data-headerdeleteflag') == 'true') headerDeletedLength++;
                });
                if(postHeaders.length-headerDeletedLength < 1) {
                    headerFlag = false;
                    headerRequiredFlag = false;
                }
                data.postHeaders = postHeaders;
            }
            data.headerFlag = headerFlag;
            data.headerRequiredFlag = headerRequiredFlag;

            this.modifyAction(url,qryType,data);

            // IP 설정 저장.
            _this.allowIp.trigger('saveConfig');
        },
        modifyAction : function(url,qryType,data){
            var self = this;

            $.go(url, JSON.stringify(data), {
                qryType : qryType,
                contentType : 'application/json',
                responseFn : function(rs) {
                    if(rs.code == 200) {
                        GO.router.navigate('/board/manage', true);
                    }
                },
                error : function(rs){
                    var serverData = JSON.parse(rs.responseText);
                    $.goMessage(serverData.message);

                    if(serverData.name == "board.name.duplicated"){
                        self.$el.find("#title").focus();
                    }
                }
            });
        },
        cancelCompanyBoard : function(){
            GO.router.navigate('/board/manage', true);
        },
        addManager : function(e){
            var _this = this;
            var popupEl = $.goOrgSlide({
                header : lang.board_manager_select,
                desc : '',
                callback : _this.setManager,
                target : e,
                isAdmin : true,
                contextRoot : GO.contextRoot
            });
        },
        deleteMember : function(e) {
            $(e.currentTarget).parents('li').remove();
        },
        deletePublicRange : function(e){
            $(e.currentTarget).parents('li').first().remove();
        },
        togglePublicRadio : function(e){
            var radioVal = this.$el.find('input[name=share]:radio:checked').val();
            if(radioVal == "true"){
                $("#partPublicWrap").show();
                this.$el.find("#partPublicWrap").parent().find('#groupUl').show();
                TplGroupList.render({id:"#partPublicWrap",type:"add"});
            }else{
                $("#partPublicWrap").hide();
                this.$el.find("#partPublicWrap").parent().find("#groupUl").hide();
            }
        },

        /**
         * 하위 폴더 추가버튼 클릭시 호출되는 이벤트 핸들러
         */
        addChildNodesSelect: function() {
            var self = this;
            var selector = '.select-node';
            var $target = this.$(selector).last();
            var reqData = {};

            if(this.$(selector).length > 0) {
                reqData.parentId = $target.val();
            }

            $.ajax(GO.config('contextRoot') + 'ad/api/company/board/folders', {
                data: reqData,
                contentType: 'application/json',
                dataType: 'json'
            }).then(function(rs) {
                var $newEl;
                if(rs.data && rs.data.length === 0) {
                    $.goSlideMessage(boardLang['게시판그룹이 존재하지 않습니다']);
                    return;
                }

                $newEl = self._makeSelectNode(rs.data);

                if($target.length > 0) {
                    var $wrap = $target.parent();
                    // 이후의 하위 폴더 선택박스는 모두 지운다.
                    $wrap.nextAll('.wrap_select').remove();
                    // 그리고 새로운 하위폴더 선택박스를 추가.
                    $wrap.after($newEl);
                } else {
                    self.$el.find('.btn-add-select-node').before($newEl);
                }
            });
        },

        _addChildNodesSelect: function(e) {
            this.addChildNodesSelect('company');
        },

        _makeSelectNode: function(nodes) {
            var lenOfSelectNodeEl = this.$('.select-node').length;
            var nodeSeq = lenOfSelectNodeEl > 1 ? lenOfSelectNodeEl - 1 : 1;
            var $el = $('<span class="wrap_select"><select name="parentId-' + nodeSeq + '" class="select-node"></select></span>');
            var html = [];

            _.each(nodes, function(node) {
                var nodeValue = node.nodeValue || node.title || node.name;
                html.push(this._makeFolderOptionHtml(node.id, nodeValue));
            }, this);

            $el.find('select').html(html.join("\n"));

            return $el;
        },

        _makeFolderOptionHtml: function(id, displayText, selectedId) {
            var selected = selectedId && id === selectedId ? ' selected="selected"': '';
            return '<option value="' + id + '"'+ selected +'>' + displayText + '</option>';
        }
    });
    return boardCreate;
});