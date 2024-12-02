(function() {
    define([
        "jquery",
        "backbone",
        "app"
    ],
    function(
        $,
        Backbone,
        App
    ) {

        /**
        *
        * 결재 라인을 구성하는 액티비티 그룹 (양식의 라인과, 결재 문서의 라인에서 공통으로 사용합니다.
        *
        */
        var ActivityModel = Backbone.Model.extend({

            defaults: {
                seq: 0,
                status: null, // WAIT, APPROVED, ...
                type: 'AGREEMENT', // APPROVAL, CHECK, INSPECTION
                name: '', // 기안, 결재, 합의, 감사
                deptId: null,
                deptName: null,
                userId: null, // 사용자인 경우에는 deptId, userId 모두를 할당함!
                userName: null,
                userDuty: null,
                userPosition: null,
                displayName: '',
                thumbnail: GO.contextRoot + 'resources/images/photo_profile_small.jpg',
                assigned: false,
                arbitrary: false	// 전결가능여부
            },

            initialize: function() {
                if (this.get('userId') == '' || _.isUndefined(this.get('userId'))) {
                    this.set('userId', null);
                }

                if (this.get('deptId') == '' || _.isUndefined(this.get('deptId'))) {
                    this.set('deptId', null);
                }
            },

            /**
             * 타입이 결재인지를 반환
             */
            isApproval: function() {
                return this.get('type') == 'APPROVAL';
            },
            
            /**
             * 타입이 감사인지를 반환
             */
            isInspection: function() {
                return this.get('type') == 'INSPECTION';
            },

            /**
             * 타입이 합의인지를 반환
             * @returns {Boolean}
             */
            isAgreement: function() {
                return this.get('type') == 'AGREEMENT';
            },

            /**
             * 타입이 확인인지를 반환
             * @returns {Boolean}
             */
            isCheck: function() {
                return this.get('type') == 'CHECK';
            },

            /**
             * 타입이 기안인지를 반환
             */
            isDraft: function() {
                return this.get('type') == 'DRAFT';
            },
            
            /**
             * 결재 정보시 전결사용 여부
             */
            isArbitraryChecked: function() {
            	return this.get('arbitrary');
            },

            isDrafted: function() {
                return this.get('logCondition') == "drafted";
            },

            isApprovalWaiting: function() {
                return this.get('logCondition') == 'approvalWaiting';
            },

            isAgreementWaiting: function() {
                return this.get('logCondition') == 'agreementWaiting';
            },

            isCheckWaiting: function() {
                return this.get('logCondition') == 'checkWaiting';
            },

            isApproved: function() {
                return this.get('logCondition') == 'approved';
            },

            isReturned: function() {
                return this.get('logCondition') == 'returned';
            },

            isAgreemented: function() {
                return this.get('logCondition') == 'agreemented';
            },

            isOpposed: function() {
                return this.get('logCondition') == 'opposed';
            },

            isArbitraryDecided: function() {
                return this.get('logCondition') == 'arbitraryDecided';
            },

            isArbitrarySkipped: function() {
                return this.get('logCondition') == 'arbitrarySkipped';
            },

            isPostCheckWaiting: function() {
                return this.get('logCondition') == 'postCheckWaiting';
            },

            isPostChecked: function() {
                return this.get('logCondition') == 'postChecked';
            },

            isPostApprovalWaiting: function() {
                return this.get('logCondition') == 'postApprovalWaiting';
            },

            isPostApproved: function() {
                return this.get('logCondition') == 'postApproved';
            },
            
            isAdvApproved: function() {
                return this.get('logCondition') == 'advApproved';
            },

            isPreviousReturn: function() {
                return this.get('action') == 'PREVIOUSRETURN';
            },

            /**
             * 타입과 함께 타입의 이름을 지정한다. (APPROVAL, 결재)
             * @param type
             * @param typeName
             */
            setType: function(type, typeName) {
                this.set('type', type);
                this.set('name', typeName);
                if (type != 'APPROVAL') {
                	this.set('arbitrary', false);
                }
            },
            
            /**
             * 전결사용여부
             */
            setArbitrarilyDecidable: function(arbitrary) {
            	if (_.isBoolean(arbitrary)) {
            		this.set('arbitrary', arbitrary);
            	}
            },

            /**
             * 대결여부
             */
            hasDeputyLog: function() {
                return !_.isEmpty(this.get('deputyActivity'));
            },

            /**
             * 지정 결재자 여부를 반환한다.
             * @returns
             */
            isAssigned: function() {
                return this.get('assigned');
            },

            /**
             * 삭제 가능한 대상인지 여부를 검사한다.
             * @returns {Boolean}
             */
            isDeletable: function() {
                return !this.isDraft() && this.isDeletableStatus();
            },

            /**
             * 결재선에서 삭제 가능 여부를 검사한다.
             */
            isDeletableStatus: function() {
                return _.isNull(this.get('status'));
            },

            /**
            * 결재 액티비티로 추가 가능한 사용자는 부서가 있어야 한다.
            */
            validate: function() {
                if (this.isUser()) {
                    return !_.isNull(this.get('deptId'));
                }
                else if (this.isDept()) {
                    return true;
                }
                else {
                    return false;
                }
            },

            isUser: function() {
                return !_.isNull(this.get('userId'));
            },

            isDept: function() {
                return !_.isNull(this.get('deptId')) && !this.isUser();
            },

            /**
             * userId가 둘 다 가지고 있는 경우는 activity가 사용자인 경우이며,
             * 따라서 사용자 ID만을 비교한다. (부서가 달라도 같은 사용자면 동일하다고 판단한다)
             *
             * 두 모델이 모두 사용자가 아닌 경우라면, deptId만을 비교한다.
             *
             * @param model
             * @returns {Boolean}
             */
            equals: function(model) {
                if (!_.isNull(this.get('userId')) && !_.isNull(model.get('userId'))) {
                    return this.get('userId') == model.get('userId');
                }

                if (_.isNull(this.get('userId')) && _.isNull(model.get('userId'))) {
                    return this.get('deptId') == model.get('deptId');
                }

                return false;
            }

        },
        {
            validate: function(activityData) {
                var m = new ActivityModel(activityData);
                return m.validate();
            }
        });

        return ActivityModel;
    });
}).call(this);
