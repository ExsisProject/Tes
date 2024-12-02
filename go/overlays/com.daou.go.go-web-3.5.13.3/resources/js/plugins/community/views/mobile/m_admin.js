define('community/views/mobile/m_admin', function(require){

    var Backbone = require('backbone');
    var App = require("app");
    var MobileAdminTpl = require("hgn!board/templates/mobile/m_admin");
    var TitleToolbarView = require('views/mobile/title_toolbar');
    var memberOnlineModel = require("community/models/member_online");
    var memberRemoveModel = require("community/models/member_remove");
    var communityLang = require("i18n!community/nls/community");
    var commonLang = require("i18n!nls/commons");
    var when = require('when');
    var CommunityMember = require("community/models/community_member");
    var CommunityInfo = require("community/models/community_info");

    var lang = {
        "승인" : communityLang["승인"],
        "거절" : communityLang["거절"],
        "정상 처리" : commonLang["정상 처리되었습니다."]
    };

    var MobileAdminView = Backbone.View.extend({
        el : "#content",

        initialize : function(options){
            this.options = options;
            if(!this.communityMemberModel) {
                this.communityMemberModel = new CommunityMember({
                    communityId : this.options.communityId,
                    subType : this.options.subType,
                    memberId : this.options.memberId
                });
            }
            this.noMoreApplicant = false;
            this.unbindEvent();
            this.bindEvent();
        },

        unbindEvent: function() {
            this.$el.off("click", "#approval");
            this.$el.off("click", "#refusal");
        },

        bindEvent: function() {
            this.$el.on("click", "#approval", $.proxy(this.communityApproval, this));
            this.$el.on("click", "#refusal", $.proxy(this.communityRefusal, this));
        },

        render : function(){
            if(!this.communityMemberModel){
                this.noMoreApplicant = true;
            }else{
                if(this.communityMemberModel.toJSON().memberStatus != 'WAIT'){
                    this.noMoreApplicant = true;
                }

            }
            this._initRender();
            var titleToolbarOption = {
                name : communityLang['가입 승인 대기'],
                leftButton : false,
                isIscroll : false,
                isPrev : false
            };
            this.titleToolbarView = TitleToolbarView;
            this.titleToolbarView.render(titleToolbarOption);
            return this;
        },

        _initRender : function () {
            this.$el.html(MobileAdminTpl({
                lang : lang,
                communityId : this.options.communityId,
                type : this.options.type,
                subType : this.options.subType,
                memberId : this.options.memberId,
                noMoreApplicant : this.noMoreApplicant,
                text : this.getCommunityApplyAllowText()
            }));
        },

        getCommunityApplyAllowText : function(){
            var memberInfo = this.communityMemberModel.toJSON();
            var communityInfo = this.communityInfoModel.toJSON();
            return App.i18n(communityLang["{{arg1}} {{arg2}}님의<br><{{arg3}}><br>커뮤니티 가입 신청을<br>승인하시겠습니까?"], {arg1 : memberInfo.name, arg2 : memberInfo.position, arg3 : communityInfo.name});
        },

        communityApproval : function(){
            if(confirm(communityLang['선택하신 회원의 가입을 승인하시겠습니까?'])){
                var self = this;

                this.model = new memberOnlineModel();
                this.model.set({
                    'id' : this.options.communityId,
                    'userIds' : [this.options.memberId]
                },{ silent : true });

                this.model.save({},{
                    success : function(model, response) {
                        if(response.code == '200') {
                            self.noMoreApplicant = true;
                            self.render();
                        }
                    },
                    error : function(model, response) {
                        if(response.msg) $.goAlert(response.msg);
                    }
                });
            }
        },

        communityRefusal : function(){
            if(confirm(communityLang['선택하신 회원의 가입을 거부하시겠습니까?'])){
                var self = this;

                this.model = new memberRemoveModel();
                this.model.set({
                    'id' : this.options.communityId,
                    'userIds' : [this.options.memberId]
                },{ silent : true });

                this.model.save({},{
                    type : 'DELETE',
                    success : function(model, response) {
                        if(response.code == '200') {
                            self.noMoreApplicant = true;
                            self.render();
                        }
                    },
                    error : function(model, response) {
                        if(response.msg) $.goAlert(response.msg);
                    }
                });
            }
        },

        renderWithCommunityData : function(){
            $.when(
                this.communityInfoModel = CommunityInfo.read({ communityId : this.communityId }),
                this.communityMemberModel.fetch()
            ).done($.proxy(function() {
                this.render();
            }, this));

        }


    });

    return MobileAdminView;
});