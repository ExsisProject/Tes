//게시판 글 목록 HOME
(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "underscore",
        "community/collections/communities",
        "community/models/communities",
        "hgn!community/templates/side",
        "hgn!community/templates/side_item",
        "hgn!community/templates/side_select_communities",
        "i18n!nls/commons",
        "i18n!community/nls/community"
        ], 
        function(
                $,
                Backbone,
                App,
                _,
                sideCommunitiesModel,
                communitiesModel,
                tplSideCommunities,
                tplSideCommunitiesItem,
                tplSideSelectCommunities,
                commonLang,
                communityLang
        ) {
        
        var tplVar = {
                'community_empty': communityLang['지금 즐거운 커뮤니티를 만들어보세요!'],            
                'community_wait': communityLang['개설대기'],
                'community_cancel': communityLang['개설취소'],
                'member_wait': communityLang['가입대기'],
                'member_cancel': communityLang['가입취소'],
                'join_community': communityLang['가입 커뮤니티'],
                'new_community': communityLang['커뮤니티 만들기'],
                'community_master': communityLang['마스터'],
                'cancel': commonLang['취소'],
                'modify': commonLang['수정완료'],
                'fold': commonLang['접기'],
                'unfold': commonLang['펼치기'],
                'community_master': commonLang['관리'],
                'community_modify': commonLang['수정'],
                'community' : commonLang['커뮤니티'],
                'community_home' : communityLang['커뮤니티 홈']
            };
        

        var SideCommunityList = Backbone.View.extend({
            el : '#side',
            
            initialize: function() {
                this.unbindEvent();
                this.bindEvent();
                this.collection = sideCommunitiesModel.create();
            },
            
            unbindEvent: function() {
                this.$el.off("click", "#community_reorder");
                this.$el.off("click", "#reorder_ok");
                this.$el.off("click", "#reorder_cancel");
                this.$el.off("click", "#communitySide ul>li");
                this.$el.off("click", "#communitySide ul>li");
            }, 
            
            bindEvent: function() {
                this.$el.on("click", "#community_reorder", $.proxy(this.bindCommunityReorder, this));
                this.$el.on("click", "#reorder_ok", $.proxy(this.saveCommunityReorder, this));
                this.$el.on("click", "#reorder_cancel", $.proxy(this.cancelCommunityReorder, this));
                this.$el.on("click", "#communitySide ul>li", $.proxy(this.dragOver, this));
                this.$el.on("click", "#communitySide ul>li", $.proxy(this.dragOut, this));
            }, 
            
            render: function(options) {
                var self = this,
                    isHome = false,
                    isOpen = false;
                
                if(!_.isUndefined(options)) {
                	isHome = _.isUndefined(options.communityId) ? true : false
                	isOpen = _.isUndefined(options.isOpen) ? true : options.isOpen;
                }
                
                if(isHome){
                    this.$el.html(tplSideCommunities({
                        lang : tplVar,
                        context_root : GO.contextRoot,
        				appName : GO.util.getAppName("community")
                    }));
                }
                
                this.collection.fetch({
                    async : true,
                    success : function(collection){
                        var dataset = collection.toJSON() || [];
                        
                        var tmpl = isHome ? tplSideCommunitiesItem : tplSideSelectCommunities;
                        var markup = tmpl({
                            dataset : dataset,
                            lang : tplVar,
                            context_root: App.config("contextRoot"),
                            isDataset : dataset.length ? true : false,
                                    
                            isPublicFlag : function() {
                                if(this.publicFlag == true) {
                                    return true;
                                } else {
                                    return false;
                                }
                                
                            },
                            isCommunityStatusWait : function() {
                                if(this.status == "WAIT") {
                                    return true;
                                } else {
                                    return false;
                                }
                            },
                            isMemberTypeMaster : function() {
                                if(this.memberType == "MASTER" || this.memberType == "MODERATOR") {
                                    return true;
                                } else {
                                    return false;
                                }
                            },
                            isMemberStatusWait : function() {
                                if(this.memberStatus == "WAIT") {
                                    return true;
                                } else {
                                    return false;
                                }
                            },
                            
                            isMemberStatusOnline : function() {
                                if(this.memberType == "USER" && this.memberStatus == "ONLINE") {
                                    return true;
                                } else {
                                    return false;
                                }
                            },
                            
                            isNewPost : function() {
                                if(this.newPostCount > 0) {
                                    return true;
                                } else {
                                    return false;
                                }
                            },
                            
                            isOpen : isOpen
                        });
                        
                        if(isHome){
                            self.$el.find("#side_list").html(markup);
                        }else{
                            self.$el.find('#sideNav').append(markup);
                        }
                        
                        self.$el.find('.edit_only').hide();
                    }
                });
            },
            bindCommunityReorder : function(e) {
                this.$el.find('#communitySide').addClass('lnb_edit').sortable({
                    items : 'li',
                    opacity : '1',
                    delay: 100,
                    cursor : 'move',
                    hoverClass: 'move',
                    containment : '#communitySide',
                    forceHelperSize : 'true',
                    helper : 'clone',
                    placeholder : 'ui-sortable-placeholder'
                });
                this.$el.find('#community_reorder').hide();
                this.$el.find('#reorder_ok').show();
                this.$el.find('#reorder_cancel').show();
                this.$el.find('.edit_only').show();
            },
            
            saveCommunityReorder : function() {
                var self = this;
                var communityIds = [];
                this.$el.find('li.community').each(function(k,v) {                  
                    communityIds.push($(v).attr('data-id'));
                });
                
                this.model = new communitiesModel();
                this.model.save({'communityIds' : communityIds }, {
                    type : 'PUT',
                    success : function(model, response) {
                        if(response.code == '200') {
                            self.$el.find('#communitySide').removeClass('lnb_edit').sortable('destroy');
                            self.$el.find('#reorder_ok').hide();
                            self.$el.find('#reorder_cancel').hide();
                            self.$el.find('.edit_only').hide();
                            self.$el.find('#community_reorder').show();
                            self.$el.find('#toggleCommunityList').show();                           
                        }
                    },
                    error : function(model, response) {
                        if(response.msg) $.goAlert(response.msg);
                        if(response.focus) form.find('input[name="'+response.focus+'"]').focus();
                    }
                });
            },
            
            cancelCommunityReorder : function() {
                this.$el.find('#communitySide').removeClass('lnb_edit');
                var isOpen = !this.$el.find('#toggleCommunityList').parents('h1').hasClass("folded");
                this.render({isOpen: isOpen});
            },
            
            dragOver : function(e) {
                $(e.currentTarget).addClass('move');
            },
            dragOut : function(e) {
                $(e.currentTarget).removeClass('move');
            }
        });

        return {
            render: function(options) {
                var sideCommunityList = new SideCommunityList();
                return sideCommunityList.render(options);               
            }
        };
    });
}).call(this);