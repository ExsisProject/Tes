define([
    'underscore',
    'backbone',
    "i18n!approval/nls/approval"
], function (
    _,
    Backbone,
    approvalLang
) {
    var DocListItemModel = Backbone.Model.extend({
        initialize: function () {
        },
        toJSON: function () {
        },
        // 목록 위치
        setListType: function (listType) {
            this.listType = listType;
        },
        getDocType: function () {
            var docReadType = this.attributes.docReadType;
            if (docReadType == 'RECEPTION') {
                return approvalLang['수신'];
            } else if (docReadType == 'REFERENCE') {
                return approvalLang['참조'];
            } else if (docReadType == 'READING') {
                return approvalLang['열람'];
            }
        },
        // 문서상태 이름
        getDocStatusName: function () {
            // 검색 결과에는 docStatusName이 존재하지 않는다. 이 때는 상태 값을 읽어 문구를 결정한다.
            var docStatus = this.attributes.docStatus;
            if (this.attributes.docStatusName) {
                return this.attributes.docStatusName;
            } else {
                if (docStatus == "INPROGRESS") {
                    return approvalLang['진행중'];
                } else if (docStatus == "COMPLETE") {
                    return approvalLang['완료'];
                } else if (docStatus == "RETURN") {
                    return approvalLang['반려'];
                } else if (docStatus == "TEMPSAVE") {
                    return approvalLang['임시저장'];
                } else if (docStatus == "DRAFT_WAITING") {
            		return approvalLang['상신취소'];
                } else if (docStatus == "RECEIVED") {
                    return approvalLang['접수'];
                } else if (docStatus == "RECV_WAITING") {
                    return approvalLang['접수대기'];
                } else if (docStatus == "RECV_RETURNED") {
                    return approvalLang['반송'];
                }
            }
        },
        isReceiveWating: function () {
            var docStatus = this.attributes.docStatus;
            if (docStatus == 'RECV_WAITING') {
                return true;
            }
            return false;
        },
        //문서상태 class명
        getDocStatusClass: function () {
            var docStatus = this.attributes.docStatus;
            if (docStatus == 'INPROGRESS' || docStatus == 'RECEIVED') {
                return 'read';
            } else if (docStatus == 'TEMPSAVE' || docStatus == 'DRAFT_WAITING' || docStatus == 'RECV_WAITING') {
                return 'temp';
            } else if (docStatus == 'RETURN' || docStatus == 'RECV_RETURNED') {
                return 'notyet';
            } else if (docStatus == 'COMPLETE') {
                return 'finish';
            }
        },
        // 결재문서ID
        getDocumentId: function () {
            return this.attributes.documentId;
        },
        // 결재문서 versionId
        getVersionId: function () {
            return this.attributes.versionId;
        },

        // 수신 문서 원본 결재문서ID
        getReceptionOriginId: function () {
            return this.attributes.receptionOriginId ? this.attributes.receptionOriginId : this.attributes.documentId;
        },

        getDraftedAt: function () {
            var draftedAt = this.attributes.draftedAt;
            if (draftedAt) {
                return GO.util.shortDate(draftedAt);
            } else {
                return '-';
            }
        },

        getOriginDraftedAt: function () {
            var orginDraftedAt = this.get("receptionOriginDraftedAt");
            if (orginDraftedAt) {
                return GO.util.shortDate(orginDraftedAt);
            } else {
                return '-';
            }
        },

        getCreatedAt: function () {
            var createdAt = this.attributes.createdAt;
            if (createdAt) {
                return GO.util.shortDate(createdAt);
            } else {
                return '-';
            }
        },

        getSentAt: function () {
            var sentAt = this.attributes.sentAt;
            if (sentAt) {
                return GO.util.shortDate(sentAt);
            } else {
                return '-';
            }
        },

        getUpdatedAt: function () {
            var updatedAt = this.attributes.updatedAt;
            if (updatedAt) {
                return GO.util.shortDate(updatedAt);
            } else {
                return '-';
            }
        },

        getReceivedAt: function () {
            var receivedAt = this.attributes.receivedAt;
            if (receivedAt) {
                return GO.util.shortDate(receivedAt);
            } else {
                return '-';
            }
        },

        getArrivedAt: function () {
            var docType = this.attributes.docType;
            if (docType == 'RECEIVE') {
                return GO.util.shortDate(this.attributes.createdAt);
            } else {
                return '-';
            }
        },

        getCreatedAt: function () {
            var createdAt = this.attributes.createdAt;
            if (createdAt) {
                return GO.util.shortDate(createdAt);
            } else {
                return '-';
            }
        },

        //모바일 디바이스일 경우 문서 상세조회때 제목 아래 부분에 기안일을 basicDate로 함
        getBasicDateDraftedAt: function () {
            var draftedAt = this.attributes.draftedAt;
            if (draftedAt) {
                return GO.util.basicDate(draftedAt);
            } else {
                return '-';
            }
        },

        getCompletedAt: function () {
            var completedAt = this.attributes.completedAt;
            if (completedAt) {
                return GO.util.shortDate(completedAt);
            } else {
                return '-';
            }
        },

        getReceptionOriginCompletedAt: function () {
            var receptionOriginCompletedAt = this.get("receptionOriginCompletedAt");
            if (receptionOriginCompletedAt) {
                return GO.util.shortDate(receptionOriginCompletedAt);
            } else {
                return '-';
            }
        },

        getReceiveStatusName: function () {
            var isNew = this.attributes.isNew;
            if (isNew) {
                return approvalLang['대기'];
            } else {
                return approvalLang['접수'];
            }
        },

        getReceiverUserName: function () {
            /* GO-17302 [전자결재] 수신문서 담당자 지정시 접수하지 않았더라도, 목록에서 담당자 이름이 나오도록 개선요청
            if (this.attributes.docStatus == 'RECV_WAITING') {
                return '-';
            }
            */
            var name = this.get("receiverUserName");
            if (_.isEmpty(name)) {
                return "-";
            }
            return name;
        },

        getReceiverDeptName: function () {
            /* GO-17302 [전자결재] 수신문서 담당자 지정시 접수하지 않았더라도, 목록에서 담당자 이름이 나오도록 개선요청
            if (this.attributes.docStatus == 'RECV_WAITING') {
                return '-';
            }
            */
            var name = this.get("receiverDeptName");
            var username = this.get("receiverUserName");
            if (_.isEmpty(name)) {
                return "-";
            }
            return name;
        },

        getReceptionOriginDrafterDeptName: function () {
            var name = this.get("receptionOriginDrafterDeptName");
            if (_.isEmpty(name)) {
                return "-";
            }
            return name;
        },

        getReceivedDocOwnerDeptName: function () {
            var name = this.get("receivedDocOwnerDeptName");
            if (_.isEmpty(name)) {
                return "-";
            }
            return name;
        },

        getReceiverNameWithPosition: function () {
            if (this.attributes.docStatus == 'RECV_WAITING') {
                return '-';
            }
            var name = this.get("receiverUserName");
            var position = this.get("receiverUserPositionName");
            if (_.isEmpty(name)) {
                return "-";
            }
            return name + ' ' + position;
        },

        getReceiveStatusClass: function () {
            var isNew = this.attributes.isNew;
            if (isNew) {
                return 'standby'; //대기
            } else {
                return 'receipt'; //접수
            }
        },

        hasAttach: function () {
            return this.attributes.attachCount > 0;
        },

        isReceive: function () {
            return this.attributes.docType == 'RECEIVE';
        },

        isCompleted: function () {
            return this.attributes.docStatus == 'COMPLETE';
        },

        isReturn: function () {
			return this.attributes.docStatus == 'RETURN';
        },

        isReadable: function () {
            return this.attributes.readable;
        },

        isTempsave: function () {
			return this.attributes.docStatus == 'TEMPSAVE';
        },

		isRecvReturned: function() {
			return this.attributes.docStatus == 'RECV_RETURNED';
		},

        getHoldStatusName: function () {
            if (this.attributes.isHolding) {
                return approvalLang['보류'];
            } else {
                return approvalLang['대기'];
            }
        },

        getHoldStatusClass: function () {
            if (this.attributes.isHolding) {
                return 'defer';
            } else {
                return 'wait';
            }
        },

        getOfficialStateName: function () {
            var officialState = this.attributes.officialStateName;
            if (officialState == "WAIT") {
                return approvalLang['승인대기']
            } else if (officialState == "APPROVE") {
                return approvalLang['승인']
            } else if (officialState == "RETURN") {
                return approvalLang['반려']
            } else if (officialState == "CANCEL") {
                return approvalLang['발송취소']
            }
        },

        getOfficialStateClass: function () {
            var officialState = this.attributes.officialStateName;
            if (officialState == "WAIT") {
                return "wait"
            } else if (officialState == "APPROVE") {
                return "finish"
            } else if (officialState == "RETURN") {
                return "return"
            } else if (officialState == "CANCEL") {
                return "cancel"
            }
        },

        // 결재문서 조회 URL
        getShowUrl: function () {
            var url = '';
            switch (this.listType) {
                case 'manage':
                    url += '/approval/manage/document/';
                    break;
                case 'manageform':
                    url += '/approval/manageform/document/';
                    break;
                case 'docfolder':
                    url += '/docfolder/document/';
                    break;
                case 'companyofficial':
                    url += '/approval/companyofficial/document/';
                    break;
                case 'sendDoc':
                    url += '/approval/document/';
                    break;
                case 'officialDoc':
                    url += '/approval/official/';
                    break;
                default:
                    url += '/approval/document/';
                    break;
            }

            if (this.listType == 'sendDoc') {
                url += this.get("id");
            } else if (this.listType == 'officialDoc') {
                url += this.attributes.versionId;
            } else {
                url += this.attributes.documentId;
            }
            return url;
        },

        getFullShowUrl: function () {
            return window.location.protocol + "//" + window.location.host + GO.contextRoot + "app" + this.getShowUrl();
		},

		getIntegration: function () {
			return this.attributes.useIntegration == true ? 'Y' : 'N';
        }
    });
    return DocListItemModel;
});