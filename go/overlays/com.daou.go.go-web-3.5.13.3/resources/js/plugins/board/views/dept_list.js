// 게시판 - 부서&게시판 OR 커뮤니티&게시판 select box group
;(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "hogan",
        
        "i18n!nls/commons",
        "i18n!board/nls/board",
        "board/collections/dept_list",
        "board/collections/board_list",
        "community/collections/boards"
    ], 
    function(
        $,
        Backbone,
        App, 
        Hogan,
        
        commonLang,
        boardLang,
        deptListCollection,
        boardListCollection,
        CommunityBoardListCollection
    ) {
        
        var boardList = false;
        var lang = {
            'all' : commonLang['전체'],
            'company_board' : boardLang['전사게시판'],
            'department_board' : boardLang['부서'],
            'board_list_null' : boardLang['선택가능한 게시판이 없습니다.'],
            'community' : commonLang['커뮤니티'],
            'header' : boardLang['말머리'],
            'dept' : boardLang['부서'],
            'board' : commonLang['게시판'],
            'board_select' : boardLang['게시판 선택'],
            'board_add_check' : boardLang['게시판은 10개까지만 추가할 수 있습니다.'],
            'board_add' : boardLang['게시판 추가 선택'],
            'board_add_desc' : boardLang['(10개까지 가능)'],
            'write_noti' : boardLang['공지로 등록']
        };
        var deptList = Backbone.View.extend({
            events : {
                'change select#dept_select' : 'changeDeptList',
                'change select.dept_select' : 'changeDeptListCopy',
                'click #boardCopyTable .ic_del' : 'deleteTr',
                'click #boardAdd' : 'boardAdd',
                'click input[id=write_noti]' : 'notiCheck'
            },
            initialize: function(options) {
            	this.options = options || {};
                this.el = this.options.id;
                this.boardList = this.options.boardList || false;
                this.communityId = this.options.communityId || '';
                this.deptId = this.options.deptId || '';
                this.boardId = this.options.boardId  || '';
                this.boardType = this.options.boardType;
                this.postId = this.options.postId || '';
                this.selectClass = this.options.selectClass || 'wfix_large';
                this.type = this.options.type || '';        
                this.isCommunity = this.options.isCommunity || false;
                this.isMove = this.options.isMove || false;
                this.isCopy = this.options.isCopy || false;
                this.isOrgServiceOn = GO.session("useOrg");
                this.checkStickable = this.options.checkStickable || false;
                this.allSelectUse = this.options.allSelectUse || false;	// 전체 게시판을 선택할 수 있는 option 사용 여부. 
																			// 현재는 상세검색에서 사용중. 
																			// 그러므로 쓰기권한이 없어도 접근 가능한 게시판을 목록에서 모두 보여줘야 하는 경우 true

                this.tplDeptList = [
                                        '{{#isOrgServiceOn}}<select id="dept_select" {{#selectClass}}class="{{selectClass}}"{{/selectClass}}>',
                                        '{{#allSelectUse}}<option value="all">{{lang.all}}</option>{{/allSelectUse}}',
                                        '{{#dataSet}}{{#isCompany}}<option value="{{ownerId}}" data-ownertype="{{ownerType}}">{{lang.company_board}}</option>{{/isCompany}}',
                                        '{{^isCompany}}<option value="{{#ownerId}}{{ownerId}}{{/ownerId}}{{^ownerId}}{{id}}{{/ownerId}}" data-ownertype="{{ownerType}}">{{#isDepartment}}[{{lang.department_board}}]{{/isDepartment}}{{name}}</option>{{/isCompany}}',
                                        '{{/dataSet}}</select>{{/isOrgServiceOn}}<span id="board_select_wrap"></span>'
                                ];
                this.tplDeptListMove = [
                                        '<dl>',
                                        	'{{#isOrgServiceOn}}<dt>{{#isCommunity}}{{lang.community}}{{/isCommunity}}{{^isCommunity}}{{lang.dept}}{{/isCommunity}}</dt>',
                                        	'<dd><select id="dept_select" {{#selectClass}}class="{{selectClass}}"{{/selectClass}}>',
                                        '{{#allSelectUse}}<option value="all">{{lang.all}}</option>{{/allSelectUse}}',
                                        '{{#dataSet}}',
	                                        '{{#isCompany}}<option value="{{ownerId}}" data-ownertype="{{ownerType}}">{{lang.company_board}}</option>{{/isCompany}}',
	                                        '{{^isCompany}}{{#isOrgServiceOn}}{{#isDepartment}}<option value="{{ownerId}}" data-ownertype="{{ownerType}}">[{{lang.department_board}}]{{/isDepartment}}{{/isOrgServiceOn}}',
	                                        '{{#isCommunity}}<option value="{{id}}" data-ownertype="community">{{/isCommunity}}',
	                                        '{{name}}</option>{{/isCompany}}',
                                        '{{/dataSet}}',
                                        '</select></dd>{{/isOrgServiceOn}}<dt>{{lang.board}}</dt><dd id="board_select_wrap"></dd><dt id="header_dt" style="display:none">{{lang.header}}</dt>',
                                        '<dd id="board_header_wrap" ></dd>',
                                        '{{#checkStickable}}',
                                        '<dd><span class="btn_action action_off"><input id="write_noti" type="checkbox"><label for="write_noti">{{lang.write_noti}}</label></span></dd>',
                                        '{{/checkStickable}}'
                                 ];
                                        
                this.tplMdeptList = [
                                         '<tr><td><select id="dept_select" {{#selectClass}}class="{{selectClass}}"{{/selectClass}}>',
                                         '{{#allSelectUse}}<option value="all">{{lang.all}}</option>{{/allSelectUse}}',
                                         '{{#dataSet}}{{#isCompany}}<option value="{{ownerId}}" data-ownertype="{{ownerType}}">{{lang.company_board}}</option>{{/isCompany}}',
                                         '{{#isOrgServiceOn}}{{^isCompany}}<option value="{{#ownerId}}{{ownerId}}{{/ownerId}}{{^ownerId}}{{id}}{{/ownerId}}" data-ownertype="{{ownerType}}">{{#isDepartment}}[{{lang.department_board}}]{{/isDepartment}}{{name}}</option>{{/isCompany}}{{/isOrgServiceOn}}',
                                         '{{/dataSet}}</select></td></tr>',
                                         '<tr><td id="board_select_wrap"></td></tr>'
                                 ];
                
                this.tplBoardList = [
                                         '<select id="select_board" {{#selectClass}}class="{{selectClass}}"{{/selectClass}}>',
                                         '{{#allSelectUse}}<option value="all">{{lang.all}}</option>{{/allSelectUse}}',
                                         '{{#dataset}}',
                                             '{{^allSelectUse}}',
                                             	'{{#actions.writable}}<option value="{{id}}" data-bbstype="{{type}}"{{#header}} data-headerFlag="{{header.headerFlag}}" data-headerRequiredFlag="{{header.headerRequiredFlag}}"{{/header}}>{{name}}</option>{{/actions.writable}}',
                                             '{{/allSelectUse}}',
                                             '{{#allSelectUse}}',
	                                          	'<option value="{{id}}" data-bbstype="{{type}}"{{#header}} data-headerFlag="{{header.headerFlag}}" data-headerRequiredFlag="{{header.headerRequiredFlag}}"{{/header}}>{{name}}</option>',
	                                          '{{/allSelectUse}}',
                                         '{{/dataset}}',
                                         '{{^dataset}}<option value="" style="color:red">{{lang.board_list_null}}</option>{{/dataset}}</select>',
                                         '<input type="hidden" id="writePostId" value=""/><input type="hidden" id="writeType" value=""/><span id="board_header_wrap"></span>'
                                 ];
                
                this.tplBoardListMove = [
                                         '<select id="select_board" {{#selectClass}}class="{{selectClass}}"{{/selectClass}}>',
                                         '{{#allSelectUse}}<option value="all">{{lang.all}}</option>{{/allSelectUse}}',
                                         '<option value="" selected = "selected">{{lang.board_select}}</option>',
                                         '{{#dataset}}{{#actions.writable}}<option value="{{id}}" data-bbstype="{{type}}"{{#header}} data-headerFlag="{{header.headerFlag}}" data-headerRequiredFlag="{{header.headerRequiredFlag}}"{{/header}}>{{name}}</option>{{/actions.writable}}{{/dataset}}',
                                         '{{^dataset}}<option value="" style="color:red">{{lang.board_list_null}}</option>{{/dataset}}</select>',
                                         '<input type="hidden" id="writePostId" value=""/><input type="hidden" id="writeType" value=""/>'
                                  ];
                this.tplDeptListCopy = [
										'<div class="t_title">',
										'{{#isOrgServiceOn}}<span class="title">{{#isCommunity}}{{lang.community}}{{/isCommunity}}{{^isCommunity}}{{lang.dept}}{{/isCommunity}}</span>{{/isOrgServiceOn}}',
										'<span class="title">{{lang.board}}</span>',
										'<span class="title" id="headerSelectPart">{{lang.header}}</span>',
										'</div>',
										'<div class="scroll_wrap_t">',
											'<table class="table_form_mini" id="boardCopyTable">',
												
											'</table>',
										'</div>',
										'<span class="btn_wrap" id="boardAdd">',
											'<span class="ic_form ic_addlist"></span>',
											'<span class="txt">{{lang.board_add}}</span>',
											'<span class="add">{{lang.board_add_desc}}</span>',
										'</span>'
                                 ];
                this.tplBoardListCopy = [
                                         '<select class="select_board wfix_medi">',                                         
                                         '<option value="" selected = "selected">{{lang.board_select}}</option>',
                                         '{{#dataset}}{{#actions.writable}}<option value="{{id}}" data-bbstype="{{type}}"{{#header}} data-headerFlag="{{header.headerFlag}}" data-headerRequiredFlag="{{header.headerRequiredFlag}}"{{/header}}>{{name}}</option>{{/actions.writable}}{{/dataset}}',
                                         '{{^dataset}}<option value="" style="color:red">{{lang.board_list_null}}</option>{{/dataset}}</select>',
                                         '<input type="hidden" id="writePostId" value=""/><input type="hidden" id="writeType" value=""/>'
                                  ];
                this.tplBoardCopyTr = [
										'<tr>',
											'<td>',
												'<select class="wfix_medi dept_select">',
												'{{#dataSet}}',
											        '{{#isCompany}}<option value="{{ownerId}}" data-ownertype="{{ownerType}}">{{lang.company_board}}</option>{{/isCompany}}',
											        '{{^isCompany}}',
											        	'{{#isOrgServiceOn}}',
											        	'{{#isDepartment}}<option value="{{ownerId}}" data-ownertype="{{ownerType}}">[{{lang.department_board}}]{{/isDepartment}}',
											        	'{{/isOrgServiceOn}}',
											        	'{{#isCommunity}}<option value="{{id}}" data-ownertype="community">{{/isCommunity}}',
											        	'{{name}}</option>',
											        '{{/isCompany}}',
											    '{{/dataSet}}',
												'</select>',
											'</td>',
											'<td>',
												'<div class="board_select_wrap"></div>',
											'</td>',
											'<td>',
												'<div class="board_header_wrap"></div>',
											'</td>',
											'<td class="w30">',
												'<span class="btn_wrap"><span class="ic_classic ic_del" title="삭제" evt-rol="delete-attach"></span></span>',
											'</td>',
										'</tr>'
                                       ];
                
                this.hogan = {
                    tplDeptList : Hogan.compile(this.tplDeptList.join('')),
                    tplDeptListMove : Hogan.compile(this.tplDeptListMove.join('')),
                    tplMdeptList : Hogan.compile(this.tplMdeptList.join('')),
                    tplBoardList : Hogan.compile(this.tplBoardList.join('')),
                    tplBoardListMove : Hogan.compile(this.tplBoardListMove.join('')),
                    tplDeptListCopy : Hogan.compile(this.tplDeptListCopy.join('')),
                    tplBoardListCopy : Hogan.compile(this.tplBoardListCopy.join('')),
                    tplBoardCopyTr : Hogan.compile(this.tplBoardCopyTr.join(''))
                };
                
            },
            render: function() {
                if(this.communityId != ''){
                    var collections = boardListCollection.getBoardList({
                        	isCommunity:true, 
                        	deptid:this.communityId,
                        	ownerType:"Community", 
                        	boardType : this.boardType 
                    	}),
                    	dataset = collections.toJSON(),
                    	writableDataset;
                    
                    if(this.allSelectUse) {
                    	writableDataset = dataset;
                    }else{
                    	writableDataset = _.reject(dataset, function(data){
                    		if (!data.actions) {
                    			return true;
                    		}
                    		return !data.actions.writable;
                    	});
                    }
                    
                    var tplBoardList = this.hogan.tplBoardList.render({
                		dataset: writableDataset,
                        allSelectUse : this.allSelectUse,
                        selectClass : this.selectClass,
                        lang : lang,
                        hasBoard : dataset.length < 1 ? false : true 
                    });
                    this.$el.prepend(tplBoardList);
                    if(this.boardId){
                        $('#select_board').val(this.boardId);
                        this.$el.find("option[value='"+ parseInt(this.options.boardId) +"']").attr("selected", "selected");
                    }
                    
                    if(this.postId){
                        $("#writePostId").val(this.postId);         
                        $("#writeType").val(this.type);
                        $("#select_board").attr('disabled',true);
                    } else {
                        $("#select_board").removeAttr('disabled');
                    }
                    return;
                }

                this.collection = deptListCollection.getDeptList({isCommunity : this.isCommunity});
                if(this.collection.options.retry){
                    var depts = $.each(this.collection.toJSON(), function(i,v) {
                        v.ownerId = v.id;
                        v.ownerType = 'Department';
                    });
                }
                var listOpt = {
                        dataSet: this.collection.options.retry ? depts : this.collection.toJSON(),
                        allSelectUse:this.allSelectUse,
                        selectClass : this.selectClass,
                        isDepartment : function() {
                            return this.ownerType == 'Department';
                        },
                        isCompany : function() {
                            return this.ownerType == 'Company';
                        },
                        lang:lang,
                        isCommunity : this.isCommunity,
                        isOrgServiceOn : this.isOrgServiceOn,
                        checkStickable : this.checkStickable
                };

                var tpltmpList = this.hogan.tplDeptList.render(listOpt);
                
                if(GO.util.callMetaTagDevice() == 'mobile'){
                    tpltmpList = this.hogan.tplMdeptList.render(listOpt); 
                }
                
                if(this.isMove){
                    tpltmpList = this.hogan.tplDeptListMove.render(listOpt);
                }
                
                if(this.isCopy){
                	tpltmpList = this.hogan.tplDeptListCopy.render(listOpt);
                }
                
                this.$el.prepend(tpltmpList);
                if(this.deptId) {
                    var $deptOption = $('#dept_select option[value="'+this.deptId+'"]');
                    if ($deptOption.length > 0) {
                        $deptOption.attr("selected","selected");
                    } else {
                        $("#dept_select option[data-ownertype='Company']").attr("selected","selected");
                    }
                }

                if(this.boardList){
                	if(this.isCopy){
                		this.changeDeptListByCopy(listOpt);
                	}else{
                		this.changeDeptList();
                	}
                }
                
                return ;
            },
            notiCheck : function(e) {
            	var notiPart = $(e.target);
            	var isChecked = notiPart.is(':checked');
            	
            	notiPart.siblings("label").parent().toggleClass('action_off', !isChecked);
            	
				/*if(notiPart.is(':checked')){
					notiPart.siblings("label").parent().removeClass('action_off');
				}else{
					notiPart.siblings("label").parent().addClass('action_off');
				}*/
            },
            changeDeptListByCopy : function(listOpt){
            	
            	var tplDeptList = this.hogan.tplBoardCopyTr.render(listOpt);
            	$("#boardCopyTable").append(tplDeptList);
            	
            	
                var select = $("#boardCopyTable .dept_select option:selected"),
                    ownerType = $("#boardCopyTable .dept_select option:selected").attr('data-ownertype'),
                    boardCollection = boardListCollection.getBoardList({isCommunity:this.isCommunity,deptid:select.val(),ownerType:ownerType, boardType : this.boardType }),
                    dataset = boardCollection.toJSON(),
                    writableDataset = _.reject(dataset, function(data){
                        return !data.actions.writable;
                    });
                
                var opt = {
                		dataset: writableDataset,
                        allSelectUse : this.allSelectUse,
                        selectClass : this.selectClass,
                        lang : lang,
                        hasBoard : dataset.length < 1 ? false : true 
                },
                selectedFolderId = this.options.boardId || this.options.communityId;
                tplBoardList = this.hogan.tplBoardListCopy.render(opt);
                
                $("#boardCopyTable .board_select_wrap").html(tplBoardList);
            },
            changeDeptListCopy : function(e){
            	
            	var target = $(e.currentTarget).parents('tr').first();
            	var select = target.find(".dept_select option:selected"),
                ownerType = target.find(".dept_select option:selected").attr('data-ownertype'),
                boardCollection = boardListCollection.getBoardList({isCommunity:this.isCommunity,deptid:select.val(),ownerType:ownerType, boardType : this.boardType }),
                dataset = boardCollection.toJSON(),
                writableDataset = _.reject(dataset, function(data){
                     return !data.actions.writable;
                });
             
	             var opt = {
	             		dataset: writableDataset,
	                     allSelectUse : this.allSelectUse,
	                     selectClass : this.selectClass,
	                     lang : lang,
	                     hasBoard : dataset.length < 1 ? false : true 
	             },
	             selectedFolderId = this.options.boardId || this.options.communityId;
	             tplBoardList = this.hogan.tplBoardListCopy.render(opt);
	             target.find(".board_select_wrap").html(tplBoardList);
            },
            changeDeptList : function(){
                if(this.boardList){
                    var select = $("#dept_select option:selected"),
                        ownerType = $("#dept_select option:selected").attr('data-ownertype'),
                        boardCollection = boardListCollection.getBoardList({
                        	isCommunity: this.isCommunity,
                        	deptid: select.val(),
                        	ownerType: ownerType, 
                        	boardType: this.boardType }),
                        dataset = boardCollection.toJSON();
                    
                    var writableDataset;
                    if(this.allSelectUse) {
                    	writableDataset = dataset;
                    }else{
                    	writableDataset = _.reject(dataset, function(data){
                    		if (!data.actions) {
                    			return true;
                    		}
                    		return !data.actions.writable;
                    	});
                    }
                    
                
                    if(select.val() == "all"){
                        $("#board_select_wrap").html('');
                        return;
                    }
                    
                    var opt = {
                    		dataset: writableDataset,
                            allSelectUse : this.allSelectUse,
                            selectClass : this.selectClass,
                            lang : lang,
                            hasBoard : dataset.length < 1 ? false : true 
                    },
                    selectedFolderId = this.options.boardId || this.options.communityId;
                    
                    var tplBoardList = this.hogan.tplBoardList.render(opt);
                    if(this.isMove){
                        tplBoardList = this.hogan.tplBoardListMove.render(opt);
                    }
                    
                    $("#board_select_wrap").html(tplBoardList);
                    
                    if(selectedFolderId && !this.isMove){
	                    this.$el.find('#select_board').find("option[value=" + parseInt(selectedFolderId) + "]").attr("selected", "selected");
	                    this.options.boardId = null;
	                    this.options.communityId = null;
                    }

                    $("#writePostId").val('');
                    $("#writeType").val('');
                    if(this.postId){
                        $("#writePostId").val(this.postId);
                        $("#writeType").val(this.type);
                        $("#dept_select").attr('disabled',true);
                        $("#select_board").attr('disabled',true);
                    } else {
                        $("#dept_select").removeAttr('disabled');
                        $("#select_board").removeAttr('disabled');
                    }
//                    $("#select_board").children().first().attr("selected","selected");
                   var deptType = $("#dept_select option:selected").attr("data-ownertype");
                    if(deptType == "Company"){
                        $("#notiFlag").hide();
                    }else{
                        $("#notiFlag").show();
                    }
                }
            },
            deleteTr : function(e){
            	var target = $(e.currentTarget);
            	console.log($("#boardCopyTable tr").length);
            	if($("#boardCopyTable tr").length > 1 ){
            		target.parents('tr').first().remove();
            	}
            },
            boardAdd : function(){
            	if($("#boardCopyTable tr").length == 10){
            		$.goSlideMessage(lang['board_add_check'],'caution');
            		return;
            	}
            	$("#boardCopyTable tr").first().clone().appendTo("#boardCopyTable");
            }
        });
        
        return {
            render: function(opt) {
                var list = new deptList({el:opt.id,
                                        boardList:opt.boardList,
                                        communityId:opt.communityId,
                                        deptId:opt.deptId,
                                        boardId:opt.boardId,
                                        boardType : opt.boardType,
                                        postId:opt.postId,
                                        type:opt.type,
                                        selectClass:opt.selectClass,
                                        allSelectUse:opt.allSelectUse,
                                        isCommunity:opt.isCommunity,
                                        isMove:opt.isMove,
                                        isCopy:opt.isCopy,
                                        isOrgServiceOn:opt.isOrgServiceOn,
                    					checkStickable : opt.checkStickable});
                return list.render();
            }
        };
    });
}).call(this);