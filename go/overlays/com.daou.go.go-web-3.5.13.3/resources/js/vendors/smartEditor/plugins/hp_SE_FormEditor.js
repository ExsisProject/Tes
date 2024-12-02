nhn.husky.SE_FormEditor = jindo.$Class({
    name : "SE_FormEditor",
    bUsePallet : true,
	agreementKey: 'data-is-agreement',
	receptionKey: 'data-is-reception',
    $init : function(elAppContainer, bUsePallet){
        this._assignHTMLObjects(elAppContainer, bUsePallet);
        this.approvalTpl = {
			'type1' : [
				'<td>',
				   '<table class="sign_member">',
						'<tbody>',
							'<tr><td><span class="sign_rank">{userPosition}</span></td></tr>',
							'<tr><td class="wrap_name"><span class="sign_name" id="status_{userId}">{userName}</span></td></tr>',
							'<tr><td class="last"><span class="sign_date" id="date_{userId}"></span></td></tr>',
						'</tbody>',
					'</table>',
				'</td>'
			],
			'type2' : [
				'<span class="sign_member">',
					'<span class="department">{deptName}</span>',
					'<span class="part">|</span>',
					'<span class="name">{userName} {userPosition}</span>',
					'<span class="status" id="status_{userId}"></span>',
					'<span class="date" id="date_{userId}"></span>',
				'</span>'
		    ]
		};
    },

    _assignHTMLObjects : function(elAppContainer, bUsePallet){

    	elAppContainer = $(elAppContainer) || document;

        this.oButtonDSL = cssquery(".editor_dsl", elAppContainer);
        this.oButtonTab = cssquery("ul.tab_pallet li", elAppContainer);
        this.oButtonDelete = cssquery(".ic_undo", elAppContainer);
        this.oButtonApproval = cssquery(".custom_approval", elAppContainer);
        this.oButtonAgreeMent = cssquery(".custom_agreement", elAppContainer);  //합의

        this.oButtonLIDSL = cssquery("li.editor_dsl,li.custom_approval,li.custom_agreement", elAppContainer);

    },

    _template : function(tpl,data){
    	return tpl.replace(/{(\w*)}/g,function(m,key){return data.hasOwnProperty(key)? data[key]:"";});
    },

    $ON_MSG_APP_READY : function(){
    	/*
    	 * 	양식편집기 관련 이벤트 등록
    	 * */
    	var editorHeight = $$("div.husky_seditor_editing_area_container")[0].style.height;
        this.oApp.registerBrowserEvent(this.oButtonDSL, 'click','PASTE_DSL');  // 일반 컴포넌트(제목,날짜,기간 등)
        this.oApp.registerBrowserEvent(this.oButtonTab, 'click','PALLET_TAB'); //팔레트 탭
        this.oApp.registerBrowserEvent(this.oButtonDelete, 'click','DELETE_ROOM');  // 결재방 삭제
        this.oApp.registerBrowserEvent(this.oButtonApproval, 'click','PASTE_APPROVAL');  //기안,처리등 결재방
        this.oApp.registerBrowserEvent(this.oButtonAgreeMent, 'click','PASTE_AGREEMENT');  //합의

        this.oApp.registerBrowserEvent(this.oButtonLIDSL, 'mouseover','MOUSEOVER_COMPO');
        this.oApp.registerBrowserEvent(this.oButtonLIDSL, 'mouseout','MOUSEOUT_COMPO');

        this.oApp.registerBrowserEvent(this.oButtonLIDSL, 'mousedown','MOUSEDOWN_COMPO');
        this.oApp.registerBrowserEvent(this.oButtonLIDSL, 'mouseup','MOUSEUP_COMPO');
    },

    $ON_MOUSEDOWN_COMPO : function(e){
    	jindo.$Element(e.currentElement).addClass('liActive');
    },

    $ON_MOUSEUP_COMPO : function(e){
    	jindo.$Element(e.currentElement).removeClass('liActive');
    },

    $ON_MOUSEOVER_COMPO : function(e){
    	var inputMarkup = jindo.$Element(e.currentElement).query("input");
    	if(inputMarkup){
    		inputMarkup.style.display = "";
    	}
    },

    $ON_MOUSEOUT_COMPO : function(e){
    	jindo.$Element(e.currentElement).removeClass('liActive');
    	var inputMarkup = jindo.$Element(e.currentElement).query("input");
    	if(inputMarkup){
    		inputMarkup.style.display = "none";
    	}
    },

    $ON_PALLET_TAB : function(e){
    	var tabPalletLi = cssquery("li");
    	var tabList = cssquery("ul.pallet_item");
    	var tabNum = jindo.$Element(e.element).attr('data-tab');

    	for(var i=0 ; i < tabPalletLi.length ; i++){
    		jindo.$Element(tabPalletLi[i]).removeClass("selected");
    	}

    	for(var k=0 ; k < tabList.length ; k++){
    		jindo.$Element(tabList[k]).hide();
    	}

    	jindo.$Element(e.element).addClass('selected');
    	jindo.$Element(tabNum).show();
    },
    
    /***
     * 전자결재 - 자동결재선 validation 체크
     */
    validAutoType : function(dsl, editorContent){ 
    	if(editorContent.indexOf('radio$autotype$') != -1 || editorContent.indexOf('cSel$autotype$') != -1){ // 자동결재 라디오나 셀렉트 박스는 한개만 있어야됨
    		if(dsl.indexOf('radio$autotype$') != -1 || dsl.indexOf('cSel$autotype$') != -1){
    			return false;
    		}
    	}
    	
    	if(dsl.indexOf('currency$autotype$') != -1 && editorContent.indexOf('currency$autotype$') != -1){ //자동결재 통화 컴포넌트는 한개만 사용 가능
    		return false;
    	}
    	return true;
    },
    
    validOfficialComponent : function(dsl, editorContent){ 
    	if(editorContent.indexOf('officialDocSender') != -1 || editorContent.indexOf('officialDocSign') != -1){
    		return false;
    	}
    	return true;
    },
    
    $ON_PASTE_DSL : function(e){
    	var dsl = jindo.$Element(e.element).attr('data-type');
    	var dupDslCheck = jindo.$Element(e.element).attr('data-dup');
    	if(dupDslCheck == "false"){
    		var editorContent = this.oApp.getContents();
    		if(editorContent.match(dsl)){
    			alert(this.oApp.$MSG("SE_Approval.DupError"));
    			return;
    		}else if(!this.validAutoType(dsl, editorContent)){ //전자결재 자동결재선 validation
    			alert(this.oApp.$MSG("SE_Approval.DupError"));
    			return;    			
    		}else if(!this.validOfficialComponent(dsl, editorContent)){ //직인과 발신명의를 같이 사용할수 업음.
    			alert(this.oApp.$MSG("SE_Approval.OfficialError"));
    			return;    			
    		}
    	}
    	
    	if (dsl.search('cOrg') >= 0) {
    		
    		var match = this.oApp.getContents().match(/cOrg:([0-9]*)/g);
    		var orgComponents = (match) ? match : [];
    		
    		var tempArray = [];
    		var maxId = 0;
    		
			//0,1,2... id가 순서대로 있지 않고 중간중간 없을때  cOrg의 length로 id생성하면 안됨.(id중복됨)
			//id(숫자)만 뽑아내서 제일큰수의 +1 해서 id부여해야함.
    		
			for(var i=0 ; i < orgComponents.length ; i++){
				var id = orgComponents[i].split(":")[1];
				if(id){
					tempArray.push(parseInt(id));
				}
			}
			
			//{{cOrg:test}} 처럼 특정문자열 id만 있을때나 조직도 컴포넌트가 하나도 없을때는 0부터 시작
    		if(tempArray.length > 0){
    			//숫자가 큰것부터 역순으로 정렬 후 첫번째배열(최대값)을 가져옴.
    			maxId = tempArray.sort(function(a,b){return b-a})[0] + 1;
    		}
    		
    		var orgType = jindo.$Element(e.element).attr("data-orgtype");  //department 일때는 부서선택 조직도
    		dsl = "{{cOrg:" + maxId + orgType +"}}";
    		
    	}

    	var oSelection = this.oApp.getSelection();

    	//에디터 테이블 TD 안에 <p>&nbsp;</p> 가 기본적으로 들어가 있어. dsl을 붙일때 검사하여 &nbsp;가 있으면 지워주는 로직
    	if(oSelection.startContainer === oSelection.endContainer &&
    			//oSelection.startContainer == "&nbsp;" &&
    			oSelection.startContainer.nodeType === 3 &&
    			oSelection.startContainer.tagName !== "BODY" &&
    			oSelection.startContainer.parentNode.nodeName === "P"){

    		var oLineInfo = oSelection.getLineInfo(false);
        	oStart = oLineInfo.oStart;
    		oEnd = oLineInfo.oEnd;
        	var rxDontUseAsWhole = /BODY|TD|LI/i;
        	var oStartNode,oEndNode;
        	if(oStart.bParentBreak && !rxDontUseAsWhole.test(oStart.oLineBreaker.tagName)){
    			oStartNode = oStart.oNode.parentNode;
    		}else{
    			oStartNode = oStart.oNode;
    		}
        	if(oEnd.bParentBreak && !rxDontUseAsWhole.test(oEnd.oLineBreaker.tagName)){
    			oEndNode = oEnd.oNode.parentNode;
    		}else{
    			oEndNode = oEnd.oNode;
    		}
        	oSelection.setStartBefore(oStartNode);
    		oSelection.setEndAfter(oEndNode);
    		var elCommonAncestor = oSelection.commonAncestorContainer;
    		elCommonAncestor.innerHTML = '';
    	}
    	this.oApp.exec("PASTE_HTML", [dsl]);
    },

	$ON_DELETE_ROOM: function(e) {
		e._event.stopPropagation();
		var elements = jindo.$Element(e.element).parent().child();
		var button;
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].tag === 'button') {
				button = elements[i];
				break;
			}
		}
		var dataType = button.attr('data-type');
		var contents = jindo.$Element(this.oApp.getContents()).$value();
		var room = this._getApprovalRoom($Json(button.attr('data-info')), dataType, contents);
		this._deleteRoom(room, contents);
	},

	/**
	 *
	 * @param data
	 * @param dataType
	 * @param contents. context 의 역할을 한다. return 된 room 으로 무언가를 하려면 반드시 필요함.
	 * @returns {NodeList}
	 * @private
	 */
	_getApprovalRoom: function(data, dataType, contents) {
		data = data.$value();
		contents = contents || jindo.$Element(this.oApp.getContents()).$value();
		var query = '[data-group-seq="' + data.seq + '"]';
		if (data.hasOwnProperty('isAgreement')) {
			query += '[' + this.agreementKey + '="true"]';
		} else {
			// 일반 결재방의 경우에도 reception key 를 가지고 있는 기존 잘못된 코드 대응.
			if (data.isReception) {
				query += '[' + this.receptionKey + '="true"]';
			}
		}
		if (dataType) query += '[data-group-type="' + dataType + '"]';
		return contents.querySelectorAll(query);
	},

	_replaceRoom: function(room, otherRoom, contents) {
		for (var i = 0; i < room.length; i++ ) {
			room[i].outerHTML = otherRoom;
			if (i) room[i].remove(); // 과거에 만들어진 결재방이 여러개 저장된 양식 케이스 방어.
		}
		this.oApp.setContents(jindo.$Element(contents).html());
	},

	_deleteRoom: function(room, contents) {
		for (var i = 0; i < room.length; i++ ) {
			room[i].parentNode.removeChild(room[i]);
		}
		this.oApp.setContents(jindo.$Element(contents).html());
	},

	_pasteRoom: function(e) {
		var jindoEl = jindo.$Element(e.element);
		var dataType = jindoEl.attr('data-type');
		var data = $Json(jindoEl.attr('data-info'));
		if (!data._object) return; // 아이콘 누르면 script error 발생. icon 에 data 를 넣거나 data 가 있는 element 를 찾으면 되지만 일단 error 를 막자.

		var hasSameTypeRoom = false;
		var contents = jindo.$Element(this.oApp.getContents()).$value();
		var room = this._getApprovalRoom(data, null, contents);
		for (var i = 0; i < room.length; i++) {
			var type = room[i].getAttribute('data-group-type');
			if (dataType === type) {
				hasSameTypeRoom = true;
				break;
			}
		}
		if (hasSameTypeRoom) {
			alert(this.oApp.$MSG("SE_Approval.DupError"));
			return;
		}
		var hasOtherTypeRoom = !!room.length && !hasSameTypeRoom;
		if (hasOtherTypeRoom) {
			var otherRoom = this._makeRoomTemplate(dataType, data);
			this._replaceRoom(room, otherRoom, contents);
			return;
		}

		var sTable = this._makeRoomTemplate(dataType, data);

		//생성된 마크업을 에더터에 붙임.
		this._pasteApprovalTpl(sTable);
	},

	_makeRoomTemplate: function(dataType, data) {
		var maxCount = parseInt(data.get('maxApprovalCount'));
		var groupName = data.get('name');
		var seq = data.get('seq');
		var activitiesString, typeTemplate;

		if (dataType == "type2") {
			typeTemplate = this.approvalTpl.type2;
			activitiesString = "";
		} else { // type1
			typeTemplate = this.approvalTpl.type1;
			activitiesString = '<th>' + groupName + '</th>';
		}

		for (var i = 0; i < maxCount; i++) {
			activitiesString += this._template(typeTemplate.join(''), {
				userPosition : '',
				userName : '',
				deptName : '',
				userId : ''
			});
		}

		if (dataType == "type1") {
			activitiesString = [
				'<table class="tb_sign_' + dataType + '">', '<tbody>', '<tr>',
				activitiesString,
				'</tr>', '</tbody>', '</table>'
			].join('');
		}

		var sTable;
		var wrappingTag = (dataType == "type1") ? "div" : "span";
		var jsonData = data.$value();
		var common = '<' + wrappingTag + ' class="sign_' + dataType + ' sign_type_new" data-group-seq="' + seq
			+ '" data-group-name="' + groupName + '" data-group-max-count="' + maxCount + '" data-group-type="'
			+ dataType + '" ';
		if (jsonData.hasOwnProperty('isAgreement')) {
			var isAgreement = data.get('isAgreement');
			sTable = common + this.agreementKey + '="' + isAgreement + '" id="agreementWrap';
		} else {
			var isReception = data.get('isReception');
			sTable = common + this.receptionKey + '="' + isReception;
		}
		sTable += '">' + activitiesString + '</' + wrappingTag + '>';

		return sTable;
	},

    $ON_PASTE_APPROVAL : function(e){
		this._pasteRoom(e);
    },

    $ON_PASTE_AGREEMENT : function(e){
		this._pasteRoom(e);
    },

    _pasteApprovalTpl : function(sTable){
    	//생성된 마크업을 에더터에 붙임.
    	var elTmpDiv = this.oApp.getWYSIWYGDocument().createElement("DIV");
		elTmpDiv.innerHTML = sTable;
		var elTable = elTmpDiv.firstChild;
    	var elTableHolder = this.oApp.getWYSIWYGDocument().createElement("DIV");

    	var oSelection = this.oApp.getSelection();
    	oSelection.insertNode(elTableHolder);
		oSelection.selectNode(elTableHolder);

		var htBrowser = jindo.$Agent().navigator();
		if(htBrowser.ie && this.oApp.getWYSIWYGDocument().body.childNodes.length === 1 && this.oApp.getWYSIWYGDocument().body.firstChild === elTableHolder){
			// IE에서 table이 body에 바로 붙어 있을 경우, 정렬등에서 문제가 발생 함으로 elTableHolder(DIV)를 남겨둠
			elTableHolder.insertBefore(elTable, null);
		}else{
			elTableHolder.parentNode.insertBefore(elTable, elTableHolder);
			elTableHolder.parentNode.removeChild(elTableHolder);
		}
    }
});