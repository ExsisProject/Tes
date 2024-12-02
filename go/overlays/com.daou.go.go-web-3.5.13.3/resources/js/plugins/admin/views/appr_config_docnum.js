//문서번호설정
//서명설정
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "hgn!admin/templates/appr_config_docnum",
    "hgn!admin/templates/add_config_list",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "i18n!admin/nls/admin",
    "jquery.go-validation",
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	ConfigDocnumTpl,
	add_config_listTpl,
    commonLang,
    approvalLang,
    adminLang
) {
	
	var lang = {
			'전자결재 문서번호 설정' : adminLang['전자결재 문서번호 설정'],
			'문서번호 규칙설정' : adminLang['문서번호 규칙설정'],
			'문서번호 초기값' : adminLang['문서번호 초기값'],		
			'문서번호 규칙' : adminLang['문서번호 규칙'],
			'예시' : adminLang['예시'],
			'구분' : adminLang['구분'],
			'유효하지 않은 문자열 입니다.' : adminLang['유효하지 않은 문자열 입니다.'],
			'자리수' : adminLang['자리수'],
			'사용자문자열' : approvalLang['사용자문자열'],
			'회사명' : approvalLang['회사명'],
			'회사명 약어' : approvalLang['회사명 약어'],
			'부서명' : approvalLang['부서명'],
			'부서명 약어' : approvalLang['부서명 약어'],
			'문서양식명' : approvalLang['문서양식명'],
			'문서양식약어명' : approvalLang['문서양식약어명'],
			'등록년도1' : approvalLang['등록년도1'],
			'등록년도2' : approvalLang['등록년도2'],
			'등록년월' : approvalLang['등록년월'],
			'등록년도월' : approvalLang['등록년도월'],
			'등록월일' : approvalLang['등록월일'],
			'등록월' : approvalLang['등록월'],
			'등록일' : approvalLang['등록일'],
			'등록시분초' : approvalLang['등록시분초'],
			'일련번호 3자리' : approvalLang['일련번호 3자리'],
			'일련번호 5자리' : approvalLang['일련번호 5자리'],
			'일련번호 7자리' : approvalLang['일련번호 7자리'],
			'구분자1' : approvalLang['구분자1'],
			'구분자2' : approvalLang['구분자2'],
			'회사명샘플' : approvalLang['회사명샘플'],
			'회사명약어샘플' : approvalLang['회사명약어샘플'],
			'부서명샘플' : approvalLang['부서명샘플'],
			'부서명약어샘플' : approvalLang['부서명약어샘플'],
			'문서양식명샘플' : approvalLang['문서양식명샘플'],
			'alert_length' : adminLang['0자이상 0이하 입력해야합니다.'],
			'문서양식약어명샘플' : approvalLang['문서양식약어명샘플'],
			'등록년도1샘플' : approvalLang['등록년도샘플1'],
			'등록년도2샘플' : approvalLang['등록년도샘플2'],
			'등록년도월샘플' : approvalLang['등록년도월샘플'],
			'등록년월샘플' : approvalLang['등록년월샘플'],
			'등록월일샘플' : approvalLang['등록월일샘플'],
			'등록월샘플' : approvalLang['등록월샘플'],
			'등록일샘플' : approvalLang['등록일샘플'],
			'등록시분초샘플' : approvalLang['등록시분초샘플'],
			'일련번호 3자리샘플' : approvalLang['일련번호 3자리샘플'],
			'일련번호 5자리샘플' : approvalLang['일련번호 5자리샘플'],
			'일련번호 7자리샘플' : approvalLang['일련번호 7자리샘플'],
			'구분자1샘플' : approvalLang['구분자1샘플'],
			'구분자2샘플' : approvalLang['구분자2샘플'],
			'사용자문자열샘플' : approvalLang['사용자문자열샘플'],
			'추가' : commonLang['추가'],
			'목록' : commonLang['목록'],
            "저장" : commonLang["저장"],
			"삭제" : commonLang['삭제'],
			"취소" : commonLang['취소']
		};
	
	
	/***
	 * 채번에 대한 개별 리스트의 모델
	 */
	var ConfigDocNumItemModel = Backbone.Model.extend({
        defaults : {
        	useFlag : false
        }
	});

	/***
	 * 채번에 대한 리스트의 Collection
	 */
	var ConfigDocNumCollection = Backbone.Collection.extend({
		model : ConfigDocNumItemModel,
		
        findByType : function(type){
        	var target = this.find(function(m){
        		return type == m.get('type');
        	});
        	return target;
        },
        
        removeByType  : function(type){
        	var target = this.find(function(m){
        		return type == m.get('type');
        	});
        	this.remove(target);
        },
        
        getCountCheckList : function(checkList){
        	var self = this;
        	var count = 0;
        	_.each(checkList, function(seq){
        		var target = self.find(function(m){
        			return seq == m.get('type');
        		});
        		if(target) count++;
        	});
        	
        	return count;
        },
        
        isSeqLast : function(checkList){
        	var index;
        	var count = 0;
        	var size = _.size(this);
        	this.each(function(m, k){
        		if(size - 1 == k){
        			console.log(m.get('type'))
        			index = _.indexOf(checkList, m.get('type'));
        		}
        	});
        	return (index == -1) ? false : true; 
        }
	});
	
	
	/***
	 * 채번 모델
	 */
	
	var DocNumModel = Backbone.Model.extend({
		initialize: function(options) {
            this.options = options || {};
            if(_.isArray(this.options.uniqueCheckList)) this.uniqueCheckList = this.options.uniqueCheckList;
            if(_.isArray(this.options.noCheckUniqueList)) this.noCheckUniqueList = this.options.noCheckUniqueList;
//            if(_.isNumber(this.options.maxDocNumSequence)) this.maxDocNumSequence = this.options.maxDocNumSequence;
            if(_.isNumber(this.options.maxUserStr)) this.maxUserStr = this.options.maxUserStr;
		},
		url: '/ad/api/approval/admin/config/docnum',
		 
        getDocNumCollection: function() {
            return new ConfigDocNumCollection(this.get('config'));
        },
        
        addDocNum: function(docnumModel) {
            var collection = this.getDocNumCollection();
            collection.add(docnumModel);
            this.set('config', collection.toJSON());
        },
        
        hasDocNum : function(type){
        	//구분자는 중복체크를 하지 않는다.
        	if($.inArray(type, this.noCheckUniqueList) > -1){
        		return false;
        	}

        	
            var collection = this.getDocNumCollection();
            if(!_.isUndefined(collection.findByType(type))){
            	return true;
            }else{
            	return false;
            }
        },
       
        removeDocNum : function(type){
            var collection = this.getDocNumCollection();
            collection.removeByType(type);
            this.set('config', collection.toJSON());
        },
        
        validate : function(attrs, option){
            var collection = this.getDocNumCollection();
        	var checkListCount = collection.getCountCheckList(this.uniqueCheckList);
        	var isSeqLast = collection.isSeqLast(this.uniqueCheckList);
        	if(checkListCount < 1){
        		return approvalLang["일련번호는 필수 사항입니다."];
        	}else if(checkListCount > 1){
        		return approvalLang["하나의 일련번호만 가능 합니다."];
        	}else if(!isSeqLast){
        		return approvalLang["마지막 문서규칙은 일련번호만 가능 합니다."];        		
        	}
/*        	if(attrs.docNumSequence.length > this.maxDocNumSequence){
        		return GO.i18n(adminLang["문서번호 초기값을 {{max}}자 이하로 입력해 주십시오"], {'max': this.maxDocNumSequence});
        	}*/
        	
        }
        
	}); 
	
	var ConfigDocnumView = Backbone.View.extend({
		el : '#layoutContent',
		model : null,
//		maxDocNumSequence : null, // 채번초기값 max
		maxUserStr : null, // 사용자 문자열 max
		initialize: function() {
//			this.maxDocNumSequence = 4; // 채번초기값 max설정
			this.maxUserStr = 20; // 사용자 문자열 max설정
			this.model = new DocNumModel({
				uniqueCheckList : ['SEQ3', 'SEQ5', 'SEQ7'], //일련번호 필수사항 설정. 이들중 한개는 반드시 있어야 하면 한개가 넘어가면 error발생.
//				maxDocNumSequence : this.maxDocNumSequence,
				maxUserStr : this.maxUserStr,
				noCheckUniqueList : ['DELIMITER1', 'DELIMITER2'] // 일련번호에 중복되어 들어가도 상관 없는 목록들
			});
			this.model.fetch({
				async:false,
				statusCode: {
                    403: function() { GO.util.error('403'); }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                    500: function() { GO.util.error('500'); }
                }
			});
			
			
		},
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.docNum", ".list_doc_rule .chart.tb_admin_doc_rule td.add > span", $.proxy(this.onAddDocNumRule, this));
            this.$el.on("click.docNum", "#attendee-list .ic_del", $.proxy(this.deleteItem, this));            
            this.$el.on("click.docNum", "span#docnumSave", $.proxy(this.saveDocNum, this));
            this.$el.on("click.docNum", "span#docnumCancel", $.proxy(this.cancelDocNum, this));
//            this.$el.on("keyup.docNum", "input#docNumSequence", $.proxy(this.keyUPValidator, this));
            this.$el.on("keyup.docNum", "input#userStr", $.proxy(this.setUserStr, this));
        }, 
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".docNum");
            return this;
        },
        
        /***
         * 채번초기값 입력시 수행되어 지는 validation함수
         * @param e
         * @returns {Boolean}
         */
		keyUPValidator : function(e){

			var targetValue = $(e.currentTarget).val();
			var targetEl = $(e.currentTarget).parent();
			var validateEl = targetEl.parent().find('#docNumSequenceAlert');
			validateEl.html('');
			if(!_.isEmpty(targetValue) && !$.goValidation.isNumber(targetValue)){
				validateEl.html(adminLang["숫자만 입력하세요."]);
				e.currentTarget.focus();
				e.currentTarget.value = '';
				return false;
			}else if(targetValue.length > this.maxDocNumSequence){
				validateEl.html(GO.i18n(approvalLang["{{max}}자 이하로 입력해 주십시오"], {'max': this.maxDocNumSequence}));
				return false;
			}
		},
		
		/**
		 * 사용자 문자열 validation검사
		 * @param str
		 */
		_checkUserStr : function(){
			var targetValue = $('#userStr').val();
            if (this._testInvalidStr(targetValue)){
            	return lang['유효하지 않은 문자열 입니다.'];
            }else if(targetValue.length > this.maxUserStr){
				return GO.i18n(approvalLang["{{max}}자 이하로 입력해 주십시오"], {'max': this.maxUserStr});
            }
				return false;
		},
		
		/**
		 * 특수문자 검사
		 */
		
		_testInvalidStr : function(str){
        	var chktext = /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi; //특수문자는 제외한다.
        	return chktext.test(str);
		},
		
        /***
         * 사용자 문자열 입력시 리스트에 추가되어 지는함수
         * @param e
         */
		setUserStr : function(e){
			var targetValue = $(e.currentTarget).val();
			var targetEl = $(e.currentTarget).parent();
			var validateEl = targetEl.parent().find('#userStrAlert');
			validateEl.html('');
			var checkUserStrErrorMsg = this._checkUserStr();
			
			if(checkUserStrErrorMsg){
				validateEl.html(checkUserStrErrorMsg);				
				return false;
			}
			this._renderExampleDocNum();
		},
		
		/***
		 * 추가 버튼 실행시 실행되어지는 함수. 실제로 추가하기 전 validation검증 
		 * @param e
		 * @returns {Boolean}
		 */
        onAddDocNumRule : function(e) {
        	var selectedEl = $(e.currentTarget);
        	var pt = selectedEl.parent();
        	var type = pt.attr("data-type");
        	var seqType = pt.attr("seqType");
        	var name = pt.parent().find(".part").text();
        	var digit = pt.parent().find(".num").text();
        	
        	if(type == "USERSTR"){
            	if(!$.goValidation.isCheckLength(1, this.maxUserStr, $('#userStr').val())){
    				$.goError(GO.i18n(lang['alert_length'], {"arg1":"1","arg2": this.maxUserStr}));   
    				$('#userStr').select();
           			return false;
            	}
            	
    			var checkUserStrErrorMsg = this._checkUserStr();
    			if(checkUserStrErrorMsg){
    				$.goError(checkUserStrErrorMsg);
    				$('#userStr').select();
    				return false;
    			}
        	}        	
        	
        	if(!this.model.hasDocNum(type)){ 
        		this.addDocNumRule(name, type, seqType, digit);	
        	}else{
				$.goError(commonLang["이미 선택되었습니다."]);
        		return false;
        	}
        	
        },
		
        /**
         * 실제 추가되어지는 method
         * @param name
         * @param type
         * @param seqType
         * @param digit
         */
        addDocNumRule : function(name, type, seqType, digit) {
            this.model.addDocNum(new ConfigDocNumItemModel({
                type : type,
                seqFlag : seqType,
                digit : digit,
                name : name
            }));
            this._renderDocNumList();
        },
        
        /***
         * 채번을 지우는 함수
         * @param e
         */
        
        deleteItem : function(e){
			var type = $(e.currentTarget).closest('li').attr('data-type');
			this.model.removeDocNum(type);
            this._renderDocNumList();
        },
        
        /***
         * api 저장
         * @returns {Boolean}
         */
        saveDocNum : function() {
        	var self = this;
//        	this.model.set('docNumSequence', this.$el.find('#docNumSequence').val());
			var checkUserStrErrorMsg = this._checkUserStr();
			if(checkUserStrErrorMsg){
				$.goError(checkUserStrErrorMsg);
				$('#userStr').select();
				return false;
			}
        	this.model.set('userStr', this.$el.find('#userStr').val());
            if (!this.model.isValid()) { //id가 있는 경우(기존에 등록되어 있는 리스트) name이 없으면 valid error 및 name의 글자수 체크
                $.goError(this.model.validationError);
                return false;
            }
            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
			this.model.save({},{
				type : 'POST',
				success : function(model, response) {
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						self.model.fetch({async: false});
						self.render();
					}
				},

				error : function(model, rs) {
					GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					var responseObj = JSON.parse(rs.responseText);
					if (responseObj.message) {
						$.goError(responseObj.message);
						return false;
					} else {
						$.goError(commonLang['저장에 실패 하였습니다.']);
						return false;
					}
				}
			});
        },
        
        /***
         * 초기 상태로 되돌림
         */
        cancelDocNum : function() {
			$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], $.proxy(function(){
				this.model.fetch({async: false});
				this.render();
				$.goMessage(commonLang["취소되었습니다."]);
			}, this), commonLang["확인"]);
        },
        
		render : function() {
			this.$el.empty();
			this.$el.html(ConfigDocnumTpl({
				lang : lang,
//				docNumSequence : this.model.get('docNumSequence'),
				userStr : this.model.get('userStr')
			}));
			
			this._renderDocNumList();
		},
		_renderExampleDocNum : function() {
			var types = [];
			var target = this.$el.find('.list_doc_rule');
            this.model.getDocNumCollection().each(function(m) {
            	types.push(m.toJSON().type);
            });	
            var exampleString = [];
            var exampleText = '';
            $(types).each(function(k, v){
            	exampleText = target.find('td[data-type = '+v+']').parent().find('.sample').text();
            	if(v == 'USERSTR'){
            		exampleText = target.find('#userStr').val();
            	}
            	exampleString.push(exampleText);
            });
            $("#exampleTxt").text(adminLang['예시'] + ") " + $(exampleString).get().join(''));
		},
		
		_renderDocNumList : function(){
            var el = this.$el.find('#attendee-list');
            el.empty();
            this.model.getDocNumCollection().each(function(m) {
                el.append(add_config_listTpl(m.toJSON()));
            });
			this._renderExampleDocNum(); //변경이 있을때마다 예시 부분을 다시 그려준다
		},
		
		// 제거
		release: function() {
			this.$el.off();
			this.$el.empty();
		}
	});
	return ConfigDocnumView;
});
