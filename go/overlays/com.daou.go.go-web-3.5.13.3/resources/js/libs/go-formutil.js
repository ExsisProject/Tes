define([
    "jquery",
    "go-webeditor/jquery.go-webeditor",
    "formparse",
    "jquery.maskMoney",
    "jquery.inputmask"
],
function(
	$
) {

	$.goFormUtil = {};

	//서버에서 내려온 내용을 view mode에 보여주기 전에 convert (라디오,체크박스 위해)
	$.goFormUtil.convertViewMode = function(content){
		return $.editorParser.convertViewMode(content);
	};

	/**
    특정폼 하위에 필수값이 작성되었는지 체크

    @method isCompleteRequiredForm
    @return {boolean} true : 필수값이 작성됨, false : 필수값이 작성되지 않음
    */
	$.fn.isCompleteRequiredForm = function(){
		 return $.validateHandler.isCompleteRequiredForm(this);
	};

	/**
    특정폼 하위에 입력글자수가 넘었는지 체크

    @method getMaxLengthCheck
    @return result :  max값을 넘었는지 여부(true:안넘음, false:넘음)
             maxlength : 최대 길이
    		 errorId : 최대길이가 넘은 form의 id
    */
	$.fn.getMaxLengthCheck = function(){
		return $.validateHandler.getMaxLengthCheck(this);
	};

	/**
    특정 select에 option 과 callback함수 추가

    @method setCustomSelect
    @option options : option의 value,label 이 담긴 배열
	    		[{
		            "CD": "01",
		            "CD_NM": "연차"
		        },
		        {
		            "CD": "41",
		            "CD_NM": "예비군"
		        }]
		     selectedVal : 선택한 option의 value
    		 callback : select의 change이벤트가 발생할때 호출할 함수
    */
	$.fn.setCustomSelect = function(options,selectedVal,callback){
		$.customSettingHandler.setCustomSelect(this,options,selectedVal,callback);
	};

	/**
   datepicker 에 callback함수 추가

    @method setCalCallback
    @option callback : select의 change이벤트가 발생할때 호출할 함수(날짜 선택 후 실행되는 함수)
    */
	$.fn.setCalCallback = function(callback){

		this.on('change',function() {
		    callback();
		});
	};
	/**
	   특정 영역에 내용 붙이기

	    @method setCustomData
	    @option content : 타겟에 넣을 내용
	    */
	$.fn.setCustomData = function(content){
		$.customSettingHandler.setData(this,content);
	};

	//제목가져오기
	$.fn.getApprovalSubject = function(){
		var opt = {
			target : this,
			destination : 'subject'
		};
		return $.dataHandler.getData(opt);
	};

	//시행문에서 제목넣기
	$.fn.setApprovalSubject = function(data){
		this.find('span[data-id="subject"]').text(data);
	};

	//시행문변환시 기안서에서 내용가져오기(에디터)
	$.fn.getApprovalContent = function(){
		return this.find('span[data-id="appContent"]').html();
	};

	//시행문 내용영역에 내용넣기(에디터)
	$.fn.setApprovalContent = function(data){
		return this.find('span[data-id="appContent"]').html(data);
	};

	// 양식의 Form 데이타를 JSON 형태로 반환
	$.fn.getDocVariables = function() {
		return $.dataHandler.getDocVariables(this);
	};

	// JSON객체를 을 양식의 Form 에 설정
	$.fn.setDocVariables = function(variables) {
		$.dataHandler.setDocVariables(this,variables);
	};

	//문서번호,수신처,보존연한,보안등급 등 세팅
	// opt = {
	//		docNo : '문서번호',
	//		recipient : '수신처',
	//		preserveDuration : '보존연한',
	//		securityLevel : '보안등급',
	//		docClassification : '문서분류',
	//		docReference : '문서참조'
	//		}
	$.fn.setApprovalData = function(opt){
		opt.target = this;
		opt.destination = opt;
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};

	//문서번호 세팅
	$.fn.setDocNo = function(data){
		var opt = {
				target : this,
				destination : {docNo : data}
		};
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};

	//문서번호 가져오기
	$.fn.getDocNo = function(){
	var opt = {
			target : this,
			destination : 'docNo'
		};
		return $.dataHandler.getData(opt);
	};

	//수신처 세팅
	$.fn.setRecipient = function(data){
		var opt = {
				target : this,
				destination : {recipient : data}
		};
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};

	//수신처 가져오기
	$.fn.getRecipient = function(){
		var opt = {
				target : this,
				destination : 'recipient'
			};
		return $.dataHandler.getData(opt);
	};

	//공문 수신처 세팅
	$.fn.setOfficalRecipient = function(data){
		var opt = {
				target : this,
				destination : {officialDocSender : data}
		};
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};

	//공문 수신처 가져오기
	$.fn.getOfficalRecipient = function(){
		var opt = {
				target : this,
				destination : 'officialDocSender'
			};
		return $.dataHandler.getData(opt);
	};

	//보존연한 세팅
	$.fn.setPreserveDuration = function(data){
		var opt = {
				target : this,
				destination : {preserveDuration : data}
		};
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};

    //첨부파일 세팅
	$.fn.setAttachFile = function(data){
		var opt = {
				target : this,
				destination : {attachFile : data}
		};
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};

	//보존연한 가져오기
	$.fn.getPreserveDuration = function(){
		var opt = {
				target : this,
				destination : 'preserveDuration'
			};
		return $.dataHandler.getData(opt);
	};

	//보안등급 세팅
	$.fn.setSecurityLevel = function(data){
		var opt = {
				target : this,
				destination : {securityLevel : data}
		};
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};

	//보안등급 가져오기
	$.fn.getSecurityLevel = function(){
		var opt = {
				target : this,
				destination : 'securityLevel'
			};
		return $.dataHandler.getData(opt);
	};

	//문서분류 세팅
	$.fn.setDocClassification = function(data){
		var opt = {
				target : this,
				destination : {docClassification : data}
		};
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};

	//문서분류 가져오기
	$.fn.getDocClassification = function(){
		var opt = {
				target : this,
				destination : 'docClassification'
			};
		return $.dataHandler.getData(opt);
	};

	//문서참조 세팅
	$.fn.setDocReference = function(data){
		var opt = {
				target : this,
				destination : {docReference : data}
		};
		return this.each(function() {
			$.dataHandler.setData(opt);
		});
	};


	//문서참조 가져오기
	$.fn.getDocReference = function(){
		var opt = {
				target : this,
				destination : 'docReference'
			};
		return $.dataHandler.getData(opt);
	};

	//결재양식의 결재선 업데이트
	$.fn.changeActivityGroups = function(options){
		$.dataHandler.changeActivityGroups(options);
	};

	$.fn.changeActivity = function(activity){
		$.dataHandler.changeActivity(activity);
	};

	// 서버에 저장된 양식(data) 을 불러와서 마크업으로 변환. 보고서등을 작성하기 위함.
	$.fn.setTemplate = function(options){
		var opts = {
			data : options.data,
			contextRoot : options.contextRoot,
			userId : options.userId,
			userProfileApi : options.userProfileApi,
			deptName : options.deptName,
			draftDate : (options.draftDate) ? options.draftDate : '',
			angleBracketReplace : options.angleBracketReplace,
			docType : options.docType,
			isAdmin : (typeof options.isAdmin == 'undefined') ? false : options.isAdmin     //수정할 수 없게($adminedit$) 설정한 입력란을 풀어주기위해
		};
		var result = '';
		//result = convertHtml(opts);
		result = $.editorParser.convertHtml(opts);
		this.html(result);
		$.pluginInitHandler.goPluginInit.call(this, opts);
		$.dataHandler.setUserInfo(opts);
	};

	// 연동양식을 위한 plugin 세팅
	$.approvalPluginInit = function(){
		$.pluginInitHandler.approvalPluginInit();
	};

	// 작성된 보고서등을 서버로 넘겨줄때 사용
	$.fn.getFormData = function(){
		return $.editorParser.getFormData(this);
	};

});