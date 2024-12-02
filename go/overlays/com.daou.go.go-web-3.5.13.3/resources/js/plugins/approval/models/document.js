define("approval/models/document", [
    "backbone", 
    "app"
],
function(Backbone, GO) {

	var DOC_STATUS = {
		"create": 'CREATE', 
		"tempsave": 'TEMPSAVE', 
		"progress": 'INPROGRESS', 
		"complete": 'COMPLETE',
		"returned": 'RETURN',
		"received": 'RECEIVED'
	}
	
	/**
	 * 접근권한 관련 API만 따로 모은 추상객체
	 * 
	 * [ 참고 ]
	 * - this는 ApprDocumentModel 객체임.
	 */
	var PermissionTrait = (function() {
        /**
         * 결재선 수정가능 여부(일반 사용자일 경우에만 해당)
         */
		function isApprlineEditable() {
        	// 결재선상에 있지 않으면 비노출
    		if(!this.isActivityUser()) {
    			return false;
    		}

    		// 결재선상에 있으면서 문서작성자이면 문서상태에 따라 노출 여부 결정
    		switch(this.getDocStatus()) {
    		case DOC_STATUS.create:
    		case DOC_STATUS.tempsave:
    			// 생성이거나, 임시저장일때, 문서작성자가 아니면 비노출
        		if(!this.isDrafter()) {
        			return false;
        		}
    			break;
    		case DOC_STATUS.progress:
    			// 문서가 결재진행 중이면 결재선 대기자이면 노출
    			if(this.isWaitingUser() && this.getActionCheck('isActivityEditable')) {
    				;
    			} else {
    				return false;
    			}
    			break;
    		case DOC_STATUS.complete:
    		case DOC_STATUS.returned:
    	        return false;
    		    break;
    		}
    		
    		return true;
        }

		return {
			/**
			 * 결재선 기능 사용여부(현재는 사용만 가능)
			 */
			canUseApprLine: function() {
				return true;
			}, 
			
	    	/**
	         * 결재선 변경 권한 있는지 체크
	         * 
	         * [ 변경 권한 ]
	         * > 기안 전(CREATE, TEMPSAVE): 변경 가능
	         * 	- 기안 전에는 기안자만 해당 문서에 접근할 수 있다.
	         * 
	         * > 진행 중(INPROGRESS)
	         * 	- 결재대기자: "사용자가 결재선을 수정할 수 있음"일 경우(isActivityEditable === true)에만 변경가능
	         * 	- 결재문서관리자: 변경가능
	         * 	- 그외 변경불가
	         * 
	         * > 완료(COMPLETE)
	         * 	- 변경 불가능
	         * 
	         * > 반려(RETURN)
	         * 	- 변경 불가능
	         * 
	         * > 수신문서 접수(RECEIVED)
	         * 	- 변경 가능
	         * 
	         * @return boolean
	         */
	        canEditApprLine: function() {
	        	// 결재선상에 없으면 변경권한 없음
	        	if(!this.isActivityUser()) {
	    			return false;
	    		}
	        	
	        	switch(this.getDocStatus()) {
	        	case DOC_STATUS.create:
	    		case DOC_STATUS.tempsave:
	    			// 문서작성자도 결재선상 유저이므로 기안자 여부를 체크할 필요없음. 그냥 통과
	    			;
	    			break;
	    		case DOC_STATUS.progress:
	    			// 결재/확인/합의 대기자이고, "사용자가 결재선을 수정할 수 있음" 일 경우 변경 가능, 그외 변경 불가
	    			if(this.isWaitingUser() && this.getActionCheck('isActivityEditable')) {
	    				;
	    			} else {
	    				return false;
	    			}
	    			break;
	    		case DOC_STATUS.complete:
	    		case DOC_STATUS.returned:
	    			return false;
	    			break;
	    		case DOC_STATUS.received:
	    			// 수신자가 아니면 변경 불가
	    			if(!this.isReceiver()) {
	    				return false;
	    			}
	    			break;
	    		default:
	    			// 그외에는 문서오류이므로 변경불가 상태로 만듬
	    			return false;
	    			break;
	        	}
	        	
	        	// 위의 조건을 모두 통과하면 변경 가능
	        	return true;
	        }, 
	        
	        /**
	         * 참조자 기능을 사용가능한지 여부 반환
	         * @return boolean
	         */
	        canUseRefererList: function() {
	        	return this.getActionCheck('referenceActive');
	        }, 
	        
	        /**
	         * 참조자 목록 수정 가능 여부 반환
	         * 
	         * [ 변경 권한 ]
	         * > 기안 전(CREATE, TEMPSAVE): 변경 가능
	         * 	- 기안 전에는 기안자만 해당 문서에 접근할 수 있다.
	         * 
	         * > 진행 중(INPROGRESS)
	         * 	- 결재대기자: "사용자가 참조자를 수정 가능"일 경우(referrerEditable === true)에만 변경가능
	         * 	- 결재문서관리자: 변경가능
	         * 	- 그외 변경불가
	         * 
	         * > 완료(COMPLETE)
	         * 	- 변경 불가능
	         * 
	         * > 반려(RETURN)
	         * 	- 변경 불가능
	         * 
	         * > 수신문서 접수(RECEIVED)
	         * 	- 변경 가능
	         * 
	         * @return boolean
	         */
	        canEditRefererList: function() {
	        	// 결재선상 유저가 아니면 없으면 수정권한 없음        	
	        	if(!this.isActivityUser()) {
	    			return false;
	    		}
	        	
	        	// "사용자가 수신처를 수정 가능"하지 않은 경우 변경 불가
	        	if(!this.getActionCheck('referrerEditable')) {
	        		return false;
    			} 
	        	
	        	switch(this.getDocStatus()) {
	        	case DOC_STATUS.create:
	    		case DOC_STATUS.tempsave:
	    			// 통과
	    			;
	    			break;
	    		case DOC_STATUS.progress:
	    			// 결재/확인/합의 대기자이고, "사용자가 참조자를 수정 가능"일 경우 변경 가능, 그외 변경 불가
	    			if(this.isWaitingUser()) {
	    				;
	    			} else {
	    				return false;
	    			}
	    			break;
	    		case DOC_STATUS.complete:
	    		case DOC_STATUS.returned:
	    			return false;
	    			break;
	    		case DOC_STATUS.received:
	    			// 수신자가 아니면 변경 불가
	    			if(!this.isReceiver()) {
	    				return false;
	    			}
	    			break;
	    		default:
	    			// 그외에는 문서오류이므로 변경불가 상태로 만듬
	    			return false;
	    			break;
	        	}
	        	
	        	// 위의 조건을 모두 통과하면 변경 가능
	        	return true;
	        },
	        
	        /**
	         * 수신자 기능을 사용가능한지 여부 반환
	         * @return boolean
	         */
	        canUseReceiverList: function() {
	        	// 수신문서가 아닐 때만 사용
	        	if(this.isReceptionDocument()) {
	        		return false;
	        	}
	        	
	        	// 수신기능 사용여부로 판단
	        	return this.getActionCheck('receptionActive');
	        }, 
	        
	        /**
	         * 수신자 목록 수정 가능 여부 반환
	         * [ 변경 권한 ]
	         * - 수신문서는 다시 수신처를 지정할 수 없다.
	         * > 기안 전(CREATE, TEMPSAVE): 변경 가능
	         * 	- 기안 전에는 기안자만 해당 문서에 접근할 수 있다.
	         * 
	         * > 진행 중(INPROGRESS)
	         * 	- 결재대기자: "사용자가 수신처를수정 가능"일 경우(receiverEditable === true)에만 변경가능
	         * 	- 결재문서관리자: 변경가능
	         * 	- 그외 변경불가
	         * 
	         * > 완료(COMPLETE)
	         * 	- 기안자, 결재자, 수신자일 경우 변경 가능
	         * 	- 결재문서관리자: 변경가능
	         * 
	         * > 반려(RETURN)
	         * 	- 변경 불가능
	         * 
	         * > 수신문서 접수(RECEIVED)
	         * 	- 변경 불가(수신문서에서 다시 수신처를 지정할 수 없음)
	         * 
	         * @return boolean
	         */
	        canEditReceiverList: function() {
	        	// 결재선상 유저가 아니면 변경 불가
	        	if(!this.isActivityUser()) {
	    			return false;
	    		}
	        	
	        	// 수신문서는 다시 수신처를 지정할 수 없다. 변경 불가
	        	if(this.isReceptionDocument()) {
	        		return false;
	        	}
	        	if(!this.getActionCheck('receiverEditable')) {
	        		return false;
    			} 
	        	switch(this.getDocStatus()) {
	        	case DOC_STATUS.create:
	    		case DOC_STATUS.tempsave:
	    			;
	    			break;
	    		case DOC_STATUS.progress:
	    			// 결재/확인/합의 대기자이고, "사용자가 수신처를수정 가능"일 경우 변경 가능, 그외 변경 불가
	    			if(this.isWaitingUser()) {
	    				;
	    			} else {
	    				return false;
	    			}
	    			break;
	    		case DOC_STATUS.complete:
	    			;
	    			break;
	    		case DOC_STATUS.returned:
	    			return false;
	    			break;
	    		case DOC_STATUS.received:
	    			// 수신문서에서 다시 수신처를 지정할 수 없음
	    			return false;
	    			break;
	    		default:
	    			// 그외에는 문서오류이므로 변경불가 상태로 만듬
	    			return false;
	    			break;
	        	}
	        	// 위의 조건을 모두 통과하면 변경 가능
	        	return true;
	        }, 
	        
	        /**
	         * 열람자 목록을 사용할 수 있는지 여부 반환
	         * @return boolean
	         */
	        canUseReaderList: function() {
	        	//if(!this.isStatusComplete()) {
	        	//	return false;
	        	//}
	        	
	        	if (this.getDocStatus() === DOC_STATUS.returned) {
	        		return false;
	        	}
				var canUseReaderTab = this.type === 'docmaster' || this.type === 'formadmin';
				var readerLength = this.docInfoModel.get("docReadingReaders") == undefined ? 0 :  this.docInfoModel.get("docReadingReaders").length;
				return this.getActionCheck('readerActive') || (canUseReaderTab && readerLength > 0);
			},
	        
	        /**
	         * 열람자 목록 수정 가능 여부 반환
	         * 
	         * [ 변경 권한 ]
	         * > 기안 전(CREATE, TEMPSAVE): 변경 불가 == > 2.1 요청 사항으로 기안전/완료 시점 변경 가능하도록
	         * 
	         * > 진행 중(INPROGRESS): 변경 불가
	         * 
	         * > 완료(COMPLETE)
	         * 	- 기안자, 결재자, 합의자, 참조자일 경우 변경 가능
	         * 	- 결재문서관리자: 변경가능
	         * 	- 양식관리자: 변경가능
	         * 	- 공문서관리자: 변경가능
	         * 
	         * > 반려(RETURN)
	         * 	- 변경 불가능
	         * 
	         * > 수신문서 접수(RECEIVED)
	         * 	- 변경 불가(수신문서에서 다시 수신처를 지정할 수 없음)
	         * 
	         * @return boolean
	         */
	        canEditReaderList: function() {
	        	// 열람 기능을 사용하지 않으면 변경불가
	        	// canUseReaderList() 함수에 의해 탭노출이 되지 않지만 방어차원에서 한번 더 검사
	        	if(!this.getActionCheck('readerActive')) {
	        		return false;
	        	}
	        	
	        	switch(this.getDocStatus()) {
	    		case DOC_STATUS.progress:
	    			if(this.isWaitingUser()) {
	    				;
	    			} else {
	    				return false;
	    			}
	    			break;
	        	case DOC_STATUS.create:
	    		case DOC_STATUS.tempsave:
	    		case DOC_STATUS.received:
	    		case DOC_STATUS.complete:
	    			// 기안자, 결재자, 합의자, 확인자,(=>isActivityUser === true) 참조자(isDocReferrer === true)일 경우 변경 가능
	    			if(this.isReferrer() || this.isActivityUser()) {
		        		;
		        	} else {
		        		return false;
		        	}
	    			break;
	    		case DOC_STATUS.returned:
	    			return false;
	    			break;
	    			// 수신된 상태는 문서생성/임시저장 상태와 같다. 변경 불가
	    			return false;
	    			break;
	    		default:
	    			// 그외에는 문서오류이므로 변경불가 상태로 만듬
	    			return false;
	    			break;
	        	}
	        	
	        	// 위의 조건을 모두 통과하면 변경 가능
	        	return true;
	        }, 
	        
	        /**
	         * 열람자 목록을 사용할 수 있는지 여부 반환
	         * @return boolean
	         */
	        canUseOfficialDocList: function() {
	        	// 수신문서에서는 사용하지 않음
	        	if(this.isReceptionDocument()) {
	                return false;
	            }
	            
	        	return this.getActionCheck('officialDocumentSendable');
	        }, 
	        
	        /**
	         * 공문 발송이 가능한지 여부 반환
	         * 
	         * [ 변경 권한 ]
	         * - 수신문서는 공문발송 할 수 없음
	         * > 기안 전(CREATE, TEMPSAVE): 변경 가능
	         * 
	         * > 진행 중(INPROGRESS)
	         * 	- 결재대기자만 변경가능
	         * 
	         * > 완료(COMPLETE)
	         * 	- 결재선상 유저이면 변경가능, 그외 변경 불가
	         * 	- 결재문서관리자: 변경가능
	         * 	- 공문서발송관리자: 변경가능
	         * 
	         * > 반려(RETURN)
	         * 	- 변경 불가능
	         * 
	         * > 수신문서 접수(RECEIVED)
	         * 	- 변경 불가
	         * 
	         * @return boolean
	         */
	        canEditOfficialDocList: function() {
	        	// 수신문서는 공문서를 보낼 수 없다. 변경 불가
	        	// canUseOfficialDocList() 함수에 의해 탭 노출자체가 되지 않지만 방어차원에서 한번 더 검사
	        	if(this.isReceptionDocument()) {
	        		return false;
	        	}
	        	
	        	// 공문발송 비허용이면 변경 불가. 
	        	// canUseOfficialDocList() 함수에 의해 탭 노출자체가 되지 않지만 방어차원에서 한번 더 검사
	        	if(!this.getActionCheck('officialDocumentSendable')) {
	        		return false;
	        	}
	        	
	        	// 결재선 변경 권한이 없으면 수정권한 없음
	        	if(!this.isActivityUser()) {
	    			return false;
	    		}
	        	
	        	switch(this.getDocStatus()) {
	        	case DOC_STATUS.create:
	    		case DOC_STATUS.tempsave:
	    			// 문서작성자도 결재선상 유저이므로 기안자 여부를 체크할 필요없음. 그냥 통과
	    			;
	    			break;
	    		case DOC_STATUS.progress:
	    			// 결재대기자이고 공문발송 허용이면 변경 가능, 그외는 변경 불가
	    			if(this.isWaitingUser()) {
	    				;
	    			} else {
	    				return false;
	    			}
	    			break;
	    		case DOC_STATUS.complete:
	    			// 기안자,결재자,합의자,확인자 일 경우에만 수정가능 => 결재선상 유저일 경우에만 변경가능
	    			// 처음에 isActivityUser임을 체크했기 때문에 그냥 통과
	    			;
	    			break;
	    		case DOC_STATUS.returned:
	    			return false;
	    			break;
	    		case DOC_STATUS.received:
	    			// 수신문서는 공문서를 보낼 수 없다. 불가
	    			return false;
	    			break;
	    		default:
	    			// 그외에는 문서오류이므로 변경불가 상태로 만듬
	    			return false;
	    			break;
	        	}
	        	
	        	// 위의 조건을 모두 통과하면 변경 가능
	        	return true;
	        }
	    };
	})();
	
	/**
	 * 문서 생성/갱신 등과 같은 요청 API등을 모아놓은 인터페이스
	 */
	var RequestTrait = (function() {
		return {
			/**
			 * 결재선/참조자/수신자/열람자/공문서 수신처 등의 수정에 사용
			 * Backbone.Model#save와 용법이 동일하나 options의 url과 type은 변경할 수 없음
			 */
			updateDocMetainfo: function(updatedAttrs, options) {
				var reqOpts = _.extend({}, options || {}, {
					// url과 type은 고정시킨다.
					url: [GO.config('contextRoot') + 'api/approval/document', this.docId, 'metainfo'].join('/'),
					type: 'PUT'
				});
				
				return this.save(updatedAttrs || {}, reqOpts);
			}
		};
	})();
	
	/**
     * 전자결재 문서상세 모델. 문서정보, 결재선, 접근권한 등의 문서와 관련된 모든 모델이 집합된 최상위 모델이다.
     * 
     * [서버 측 모델]
     * ApprDocumentModel
     * 	
     * [하위 구성 모델(서버 모델 기준)]
     * - DocumentModel : 필수
     * - DocInfoModel : 필수
     * - ApprFlowModel : 필수
     * - ApprActionCheckModel : 필수
     * - List<DocumentVersionModel> : 옵션
     * - List<ApprFlowVersionModel> : 옵션
     * - ApprActionModel : ??
     * 
     * [ 모델 사용 방법 ]
     * 1. 권한관련 API
     * var model = new ApprDocumentModel({ApprDocumentModel 속성 들..});
     * -- 결재선 변경 권한 체크
     * model.Permission.canEditApprLine()
     * -- 참조자 변경 권한 체크
     * model.Permission.canEditRefererList();
     * 
     * 더 많은 권한 체크는 PermissionTrait를 참고하고, 필요한 권한 체크가 있다면 PermissionTrait에 추가로 구현
     * 
     * 2. 요청관련 API
     * model.Request.updateDocMetainfo({변경할 속성}, options);
     * 
     * 더 많은 요청 API는 RequestTrait를 참고하고, 필요한 요청이 있다면 RequestTrait에 추가로 구현
     */
    var ApprDocumentModel = Backbone.Model.extend({
    	
    	// 하위 모델들의 API를 관리하기 위한 함수들...
    	// 하위 모델에 대해서는 현재 한계가 있음(fetch, save, destroy 등이 일어날 때 ApprDocumentModel의 해당 속성들과 sync가 되지 않고 있음.
    	// 직접 new를 이용해 객체를 생성했을 경우에만 이 객체를 사용할 것....
    	documentModel: null, 
    	docInfoModel: null, 
    	apprFlowModel: null, 
    	documentVersionList: [], 
    	dpprFlowVersionList: [], 
    	actionCheckModel: null, 
    	apprActionModel: null,
    	
    	// 권한 관련 API
    	Permission: {},
    	// 요청 관련 API
    	Request: {}, 
        
        initialize: function(attrs, options) {
        	options = options || {};
        	
        	if(options.docId) {
        		this.docId = options.docId;
        	}
            
            if (_.isBoolean(options.isAdmin)) {
                this.isAdmin = isAdmin;
            }
            
            syncSubModels.call(this);
            initPermissionApi.call(this);
            initRequestApi.call(this);
            
            this.on('sync', function() {
            	syncSubModels.call(this);
            });
        },
        
        url: function() {
            if (this.isAdmin) {
                return ['/api/approval/manage/document', this.docId].join('/');
            } else {
                return ['/api/approval/document', this.docId].join('/');
            }
        }, 
        
        /**
         * @Override
         * 1. Backbone.Model의 기본 clone 함수는 attributes만을 이용해서 새로운 Model 객체를 만드는 방식이어서 
         * options의 내용이 복사되지 않는다. 이를 보완하기 위해 재정의
         * 
         * 2. deepClone을 하지 않으면 상위에서 apprFlow 과 같은 중첩 구조는 레퍼런스이기 때문에 이미 변경되어 있어서 change 이벤트가 일어나지 않는다.
         * 따라서, 반드시 deepClone을 해줘야 한다.(IE8에서 메모리 부족 여부 테스트 필요)
         */
        clone: function() {
        	return new this.constructor(clone(this.attributes, true), {"docId": this.docId, "isAdmin": this.isAdmin});
        }, 

        /**
         * 문서 상태정보를 반환
         * @return string 문서상태문자열 반환(반환값은 DOC_STATUS 상수 참조)
         */
        getDocStatus: function() {
        	return this.documentModel.get('docStatus');
        }, 
        
        /**
         * actionCheck 객체에 저장된 서버에서 전송한 권한관련 속성에 대한 결과값 반환
         * @return boolean 조회 키값에 대한 결과
         * @default false
         */
        getActionCheck: function(key) {
        	return this.actionCheckModel.get(key) || false;
        },
        
        /**
         * 기안자 여부 반환
         * @return boolean
         */
        isDrafter: function() {
        	return this.documentModel.get('drafterId') === GO.session('id');
        }, 
        
        /**
         * 수신자 여부 반환
         * @return boolean
         */
        isReceiver: function() {
        	return this.getActionCheck('isReceiver');
        },
        
        /**
         * 참조자 여부 반환
         * @return boolean
         */
        isReferrer: function() {
        	return this.getActionCheck('isDocReferrer');
        },
        
        /**
         * 열람자 여부 반환
         * @return boolean
         */
        isReader: function() {
        	return this.getActionCheck('isReadingReader');
        },
        
        /**
         * 현재 사용자가 문서결재선상에 있는 사용자인지 여부 반환
         * @return boolean
         */
        isActivityUser: function() {
        	return this.getActionCheck('isActivityUser');
        }, 
        
        /**
         * 결재 대기자(결재/확인/합의/감사 대기자)
         */
        isWaitingUser: function() {
        	return this.getActionCheck('isApprovalWaitingUser') || this.getActionCheck('isCheckWaitingUser') || this.getActionCheck('isAgreementWaitingUser') || this.getActionCheck('isInspectionWaitingUser');

        }, 
        
        /**
         * 수신문서 여부 반환
         * @return boolean
         */
        isReceptionDocument: function() {
        	return this.get('document')['isReceptionDocument'] || false;
        },
        
        /**
         * 결재상태 완료여부 반환
         */
        isStatusComplete: function() {
        	return this.getDocStatus() === DOC_STATUS.complete;
        }, 
        
        /**
         * 결재상태 반려여부 반환
         */
        isStatusReturned: function() {
        	return this.getDocStatus() === DOC_STATUS.returned;
        }, 
        
        /**
         * 결재상태 생성 여부 반환
         */
        isStatusCreated: function() {
        	return this.getDocStatus() === DOC_STATUS.create;
        },
        
        /**
         * 결재상태 임시저장 여부 반환
         */
        isStatusTempSaved: function() {
        	return this.getDocStatus() === DOC_STATUS.tempsave;
        }, 
        
        /**
         * 결재상태 수신상태 여부 반환
         */
        isStatusReceived: function() {
        	return this.getDocStatus() === DOC_STATUS.received;
        }, 
        
        /**
         * 결재상태 진상태 여부 반환
         */
        isStatusProgress: function() {
        	return this.getDocStatus() === DOC_STATUS.progress;
        },
        
        /**
         * 수신자 탭에서 조직도 종류 설정.(ALL, DEPARTMENT, USER)
         */
        getReceiveAllowType : function(){
        	return this.getActionCheck('receiveAllowType');
        },
        
        isNotInprogressDoc : function() {
        	var isDraftType = this.get('document')['docType'],
        		isCreate = this.isStatusCreated(),
        		isTempsave = this.isStatusTempSaved();
        	
        	return isDraftType && (isCreate || isTempsave);
        	
        },
        
        isReceivedReceptionDoc : function() {
        	return this.isReceptionDocument() && this.isStatusReceived();
        },
        
        availableUpdateDocMetaInfo : function(type) {
        	return (type == 'DOCUMENT' && !this.isNotInprogressDoc()) || this.isReceivedReceptionDoc();
        }
       
    }, {
    	DOC_STATUS: DOC_STATUS, 
    	
    	/**
    	 * 문서 ID로 객체를 생성(Static)
    	 */
    	create: function(docId) {
    		return new ApprDocumentModel(null, {"docId": docId});
    	}
    });
	
	// private methods
    function syncSubModels() {
    	syncSubModel.call(this, 'document');
    	syncSubModel.call(this, 'docInfo');
    	syncSubModel.call(this, 'apprFlow');
    	syncSubModel.call(this, 'actionCheck');
    	syncSubModel.call(this, 'approvalAction');
    }
    
    function syncSubModel(subModelKey, props) {
		var attrs = this.get(subModelKey);
		var parent = this;
		var modelRef = this[subModelKey + 'Model'];
		
		if(modelRef && modelRef instanceof Backbone.Model) {
			// set을 이용하면 다시 상위 모델에 업데이트 하는데, 이때 id of undefined 오류가 발생한다.
			// 따라서, attributes에 직접 반영한다.
			modelRef.attributes = attrs;
		} else {
			var newModel = Backbone.Model.extend(_.extend(props || {}, {
				set: function(key, value, options) {
					Backbone.Model.prototype.set.apply(this, arguments);
					
					if(_.isObject(key)) {
						options = value;
						_.each(key, function(v, k) {
							attrs[k] = v;
						});
					} else {
						attrs[key] = value;
					}
					parent.set(subModelKey, attrs, options);
				}
			}));
			
			this[subModelKey + 'Model'] = new newModel(attrs);
		}
	}
    
    function initPermissionApi() {
    	_.each(PermissionTrait, function(val, key){
    		if(_.isFunction(val)) {
    			val = _.bind(val, this);
    		}
    		this.Permission[key] = val;
    	}, this);
    }
    
    function initRequestApi() {
    	_.each(RequestTrait, function(val, key){
    		if(_.isFunction(val)) {
    			val = _.bind(val, this);
    		}
    		this.Request[key] = val;
    	}, this);
    }
    
    function clone(obj, deep) {
        if(typeof deep === 'undefined') deep = false;
        // Array 객체
        if(obj.constructor === Array) return Array.prototype.slice.call(obj);

        // 그외 객체
        var clonedObj = new Object();
        for(var key in obj) {
            clonedObj[key] = typeof(obj[key]) === 'object' && deep ? clone(obj[key]) : obj[key];
        }
        return clonedObj;
    };

    return ApprDocumentModel;
});


