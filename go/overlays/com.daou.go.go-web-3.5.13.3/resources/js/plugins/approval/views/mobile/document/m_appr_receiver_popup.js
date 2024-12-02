/**
 * 담당자 할당 Pop-up
 */
define(function(require){
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var App = require("app");

    var Tpl = require("hgn!approval/templates/mobile/document/m_appr_receiver_popup");
    var DeptView = require("views/mobile/m_dept");
    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var ApprovalLang = require("i18n!approval/nls/approval");

    /**
     * 수신자 모델
     */
    var DocReceiverModel = Backbone.Model.extend({

        defaults: {
            id: 0, // 사용자 아이디
            deptId: 0 // 사용자 소속 부서 아이디
        },

        initialize: function(docId) {
            this.docId = docId;
        },

        url: function() {
            return '/api/approval/document/' + this.docId + "/receiver"
        }
    });

    return Backbone.View.extend({
        className: 'overlay_scroll',
        events: {
            "click #change_receiver" : "showDeptOrgView",
            "click .btn_layer_close" : "close",
            "click #confirm" :  "confirm"
        },
        initialize: function (options) {
            this.type = options.type ? options.type : 'normal';
            this.docIds = options.docIds;
            this.docId = options.docId;
            this.receivedDocOwnerDeptId = options.receivedDocOwnerDeptId;
            this.receiverDeptId = options.receiverDeptId;
            this.receiverDeptName = options.receiverDeptName;
            this.receiverUserId = options.receiverUserId;
            this.receiverUserName = options.receiverUserName;
            this.receiverUserPositionName = options.receiverUserPositionName;
            this.lang = {
                'do_assign_a_receiver': ApprovalLang['담당자를 지정해주세요'],
                'assigned_a_receiver' : ApprovalLang['담당자가 지정되었습니다'],
                'unable_to_assign_a_receiver' : ApprovalLang['담당자를 지정할 수 없습니다'],
                'assign_a_receiver' : ApprovalLang['담당자 지정'],
                'receiver' : ApprovalLang['담당자'],
                'incoming_document_recipient_designation_guide' : ApprovalLang['수신 문서 접수자 지정 가이드'],
                'change': CommonLang['변경'],
                'confirm': CommonLang['확인'],
                'displayName': this.receiverUserName + " " + this.receiverUserPositionName
            };
        },
        render: function () {

            var tp = Tpl({
                lang: this.lang,
                receiverUserId: this.receiverUserId,
                receiverDeptId: this.receiverDeptId
            });
            this.$el.html(tp);
            return this;
        },
        confirm: function () {
            var self = this;
            this.assignReceiver(
                function () {
                    GO.util.toastMessage(self.lang.assigned_a_receiver);
                    GO.util.navigateToBackList();
                    self.close()
                },
                function () {
                    GO.util.toastMessage(self.lang.unable_to_assign_a_receiver);
                })
        },
        showDeptOrgView: function (e) {
            var originalDeptId = $("#change_receiver").attr("data-userDeptId")
            var deptView = new DeptView({
                type: "custom",
                deptId: originalDeptId,
                sendSelectedNodesCallback: $.proxy(function (self, e, nodes) {

                    if(nodes.length !== 1){
                        return;
                    }
                    var selectedMember = _.first(nodes);
                    this.receiverUserId = selectedMember.id;
                    this.receiverDeptId = selectedMember.deptId;

                    this.setSelectedMemberTpl(selectedMember);
                    self.$el.remove();
                    return false;
                }, this)
            });
            deptView.render();
        },
        setSelectedMemberTpl: function(user){
            var name = user.displayName;
            return $('#displayName').text(name)
        },
        assignReceiver: function(successCallback, failCallback) {
            if(!this.receiverUserId || !this.receiverDeptId){
                $.goMessage(approvalLang['담당자를 지정해주세요']);
                return false;
            }

            if(this.type == "normal"){
                var promise = (new DocReceiverModel(this.docId)).save({
                    id: this.receiverUserId,
                    deptId: this.receiverDeptId
                });

                promise.done(successCallback).fail(failCallback);
                if(this.slide){
                    this.slide.close()
                }
            }else{
                var self = this;
                $.ajax(GO.contextRoot + "api/approval/document/bulkreceiver", {
                    type : 'PUT',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({
                        'docIds': self.docIds,
                        'approverUser' : {
                            id: self.receiverUserId,
                            deptId: self.receiverDeptId
                        }
                    })
                }).
                done(function(data, status, xhr) {
                    successCallback(data);
                }).
                fail(function(data, status, xhr) {
                    failCallback(data);
                });

                if(this.slide){
                    this.slide.close()
                }
            }
        },

        close: function(e){
            $('.layer_type_bottom').animate({
                bottom: -300
            }, 150, function() {
                $('.overlay_scroll').hide();
            });
        },


    });
});
