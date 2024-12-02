define([
        "backbone",

        "approval/models/activity",
        "approval/models/activity_groups_setter",
        "approval/collections/activities",
        "approval/collections/appr_lines",

        "hgn!approval/templates/mobile/document/m_apprflow_activity_groups",
        "hgn!approval/templates/mobile/document/m_apprflow_my_lines",
        "approval/views/mobile/document/m_apprflow_activity_group",

        "i18n!nls/commons",
        "i18n!approval/nls/approval",

        "jquery.go-popup"
    ],

    function(
        Backbone,

        ActivityModel,
        ActivityGroupsSetter,
        ActivityCollection,
        ApprLineCollection,

        activityGroupsTmpl,
        myLinesTmpl,
        ActivityGroupView,

        commonLang,
        approvalLang
    ) {
        var lang = {
            'my_lines' : approvalLang['나의결재선'],
            'agreement_type' : approvalLang['합의방식'],
            'agreement_linear' : approvalLang['순차합의'],
            'agreement_parallel' : approvalLang['병렬합의'],
            'msg_empty_my_lines' : approvalLang['개인 결재선이 없습니다.'],
            'my_save' : approvalLang['내가 저장한 결재선 목록'],
            'only_pc_modify' : approvalLang['수정은 오직 PC']
        };
        /**
         * 결재 정보의 그룹별 결재라인 뷰
         * model: ApprActivityGroupModel
         */
        var ActivityGroupsView = Backbone.View.extend({

            actionCheck: null,
            index: null,
            isNullGroup: false,
            isArbitraryCheckVisible: false,	// 전결 선택가능여부
            __disabled__: false,
            events: {
                "click #myApprFlowButton" : "_myApprFlowButton",
                "click #myApprFlowList li a[data-id]" : "_selectApprFlow"
            },
            initialize: function(options) {
                options = options || {};
                this.observer = options.observer;

                this.activityGroups = options.activityGroups;
                this.actionCheck = options.actionCheck;
                this.isArbitraryCheckVisible = options.isArbitraryCheckVisible;
                this.isPermissibleArbitraryDecision = options.isPermissibleArbitraryDecision;
                this.disable = options.disable;
                this.includeAgreement = options.includeAgreement;
                this.apprAllowType = options.apprAllowType;
                this.isReceiveDoc = options.isReceiveDoc || false;
                this.docStatus = options.docStatus;

                this.__disabled__ = false;
                if (_.isNull(this.model)) {
                    this.isNullGroup = true;
                }
                
                //m_apprflow_edit.js에서 호출
                this.observer.bind('saveApprFlowActivityGroups', this.saveApprFlowActivityGroups, this);
                this.listenTo(this.activityGroups, 'change add remove', _.bind(function() {
                    this.activityGruopsTemp = this.activityGroups.toJSON();
                    this.model.set('apprFlowChanged', true);
                },this));
            },
            render: function() {
                var tpl = activityGroupsTmpl({
                    lang : lang,
                    useParallelAgreement : this.model.get('apprFlow').useParallelAgreement
                });
                this.$el.html(tpl);
                this._renderMyApprovalList();
                this._renderGroups();
                this._judgeDisabledAgreement();
                return this;
            },
            _judgeDisabledAgreement : function(){
                var agreementRadio = this.$el.find("input[name=useParallelAgreement]");

                if(this.docStatus == "INPROGRESS") {
                    agreementRadio.attr("disabled",true);
                    return;
                }

                if(this.disable){
                    agreementRadio.attr("disabled",true);
                }else{
                    agreementRadio.attr("disabled",false);
                }
            },
            _renderMyApprovalList : function(){
                //내결재선
                if(!this.disable){
                    this.apprLineCollection = new ApprLineCollection();
                    this.apprLineCollection.fetch({
                        success: $.proxy(this._renderMyLineList, this)
                    });
                }else{
                     this.$el.find('div.box.my').hide();
                }
            },
            _renderGroups : function(){
                var _this = this;
                this.$el.find("#activityGroupsWrap").html('');
                this.activityGroups.forEach(function(activityGroupModel, index) {
                    var itemView = new ActivityGroupView({
                        model: activityGroupModel,
                        observer: _this.observer,
                        actionCheck: _this.actionCheck,
                        isArbitraryCheckVisible: _this.isArbitraryCheckVisible,
                        isPermissibleArbitraryDecision: _this.isPermissibleArbitraryDecision,
                        index: index,
                        disable: _this.disable,
                        includeAgreement: _this.includeAgreement,
                        apprAllowType: _this.apprAllowType,
                        isReceiveDoc: _this.isReceiveDoc,
                        docStatus : _this.docStatus
                    });
                    itemView.render();
                    _this.$el.find("#activityGroupsWrap").append(itemView.$el);
                });
            },
            /**
             * 나의 결재선 리스트 보기
             */
            _myApprFlowButton: function(e){
                var target = $(e.currentTarget);
                target.toggleClass("on");
                if(target.hasClass('on')){
                    $('#myApprFlowList').slideDown(300);
                }else{
                    $('#myApprFlowList').slideUp(300);
                }
            },
            /**
             * 나의 결재선 그리기
             * */
            _renderMyLineList : function(collection, response, options) {
                var isEnabled = (this.docStatus == 'CREATE') || (this.docStatus == 'TEMPSAVE');
                $("#myApprFlowList").html(myLinesTmpl({
                    'lang' : lang,
                    'hasMyLines': !collection.isEmpty(),
                    'myLines' : collection.map(function(model) {
                        var activitiesCnt = 0;
                        $.each(model.get('activityGroups'),function(){
                            activitiesCnt += this.activities.length;
                        });
                        return {
                            'id' : model.get('id'),
                            'title' : model.get('title'),
                            'groupCount' : activitiesCnt
                        };
                    })
                }));
            },
            _selectApprFlow : function(e) {
                e.preventDefault();
                var target = $(e.currentTarget);
                var model = this.apprLineCollection.get(target.attr('data-id'));
                this._replaceActivityGroupsByMyLine(model.get('activityGroups'), model.get('useParallelAgreement'));
                this._renderGroups();
            },
            /**
             * 주어진 ActivityGroups로 현재 결재선 ActivityGroups를 대체한다.
             *
             * @param activityGroups
             */
            _replaceActivityGroupsByMyLine: function(activityGroups, useParallelAgreement) {
                var setter = new ActivityGroupsSetter(null, {
                    assignedActivityDeletable: this.actionCheck.assignedActivityDeletable,
                    actionCheck : this.actionCheck,
                    original: this.activityGroups.toJSON(),
                    includeAgreement : this.includeAgreement,
                    apprAllowType : this.apprAllowType
                });

                try {
                    var result = setter.makeData(activityGroups);
                    this.activityGruopsTemp = result;
                    //this.useParallelAgreementTemp = useParallelAgreement;
                    $('input[name=useParallelAgreement][value='+useParallelAgreement+']').prop('checked',true);
                    this.activityGroups.reset(result);
                } catch (e) {
                    console.log(e);
                    alert(e.message);
                }
            },
            saveApprFlowActivityGroups : function(){
                var apprFlow = this.model.get('apprFlow');
                if(this.activityGruopsTemp) {
                    apprFlow.activityGroups = this.activityGruopsTemp;
                }
                apprFlow.useParallelAgreement = $('input[name=useParallelAgreement]:checked').val() ==="true"
            },
            disable: function() {
                this.__disabled__ = true;
            },

            isDisabled: function() {
                return this.__disabled__;
            }
        });


        return ActivityGroupsView;
    });