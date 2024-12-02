define([
    "approval/models/document" 
],
function(ApprDocumentModel) {
	var supportedTypes = ['docmaster', 'formadmin', 'officialdocmaster'];
	
    /**
     * 전자결재 문서관리의 문서상세 모델입니다.
     */
    var DocumentManageViewModel = ApprDocumentModel.extend({
    	
        initialize: function(attrs, options) {
        	if(options.docId) {
        		this.docId = options.docId;
        	}
        	if(options.type) {
        		this.type = options.type;
        	}
            
            if (!_.contains(supportedTypes, this.type)) {
            	throw new Error('지원하지 않는 타입입니다.');
            }
            
            ApprDocumentModel.prototype.initialize.apply(this, arguments);
        },
        
        url: function() {
            var value = '/api/approval/';
            switch (this.type) {
                case 'docmaster':
                    value += 'manage';
                    break;
                case 'formadmin':
                    value += 'manageform';
                    break;
                default:
                    value += 'companyofficial';
                    break;
            }
            return value + '/document/' + this.docId;
        }, 
        
        getShowUrl : function(){
            var docId = typeof this.docId === "string" ? this.docId.split("?")[0] : this.docId;

        	return "/approval/document/" + docId;
        },

        getFullShowUrl : function(){
        	return window.location.protocol + "//" +window.location.host + GO.contextRoot +"app" + this.getShowUrl();
        },
        
        /**
         * @Override
         */
        clone: function() {
        	return new this.constructor(clone(this.attributes, true), {"docId": this.docId, "type": this.type});
        },
        getWaitActivites: function() {
            var result = [];
            //status == 'WAIT이면 리스트에 담아보내기
            if(_.isEmpty(this.get('apprFlow')) || _.isEmpty(this.get('apprFlow')['activityGroups'])) {
                return result;
            }

            var activityGroups = this.get('apprFlow')['activityGroups'];
            _.each(activityGroups, function(activityGroup) {
                var activities = activityGroup['activities'];
                _.each(activities, function(activity) {
                    //후결 대기자도 있기 때문에 action이 아닌 status로 비교
                    if(activity['status'] == 'WAIT') {
                        result.push(activity['id']);
                    }
                });
            });
            return result;
        }
    }, {
    	create: function(docId, type) {
    		return new DocumentManageViewModel({}, {
    			"docId": docId, 
    			"type": type
    		});
    	}
    });

    // TODO: 리팩토링 필요.
    // approval/models/document.js에서 사용하고 있는 것을 복사해왔음.
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

    return DocumentManageViewModel;
});

