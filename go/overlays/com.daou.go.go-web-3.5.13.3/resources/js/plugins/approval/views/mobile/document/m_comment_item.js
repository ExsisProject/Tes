;(function() {
    define([
        'jquery', 
        'backbone', 
        'app',      
        'i18n!nls/commons',
        'hgn!approval/templates/mobile/document/m_comment_item',
        'GO.util',
        "jquery.go-validation"
    ], 
    function(
        $,
        Backbone,
        GO,
        CommonLang,
        CommentItemTmpl
    ) {
        var lang = {
            'save' : CommonLang['저장'],
            'cancel' : CommonLang['취소'],
            'modify' : CommonLang['수정'],
            'remove' : CommonLang['삭제'],
            'reply' : CommonLang["댓글"],
            "removeRemoveDesc" : CommonLang["댓글이 등록된 글은 삭제할 수 없습니다."],
            "removeSuccess" : CommonLang["댓글을 삭제하였습니다."],
            "commentPlaceHolder" : CommonLang["댓글을 입력하세요."],
            "saveComment" : CommonLang["댓글 작성"]
        };
        
        var CommentItemView = Backbone.View.extend({
            tagName : "li",
            events : {
                "vclick #info_mode a.modify" : "modify",
                "vclick #info_mode a.remove" : "remove",
                
                "vclick #edit_mode a.save" : "save",
                "vclick #edit_mode a.cancel" : "cancel"
            },
            initialize: function(options) {
            	this.options = options || {};
                this.type = this.options.type;
                this.typeId = this.options.typeId;
                this.model = this.options.model;
                this.model.set({ typeUrl : this.type, typeId : this.typeId}, { silent : true });
            },
            render: function() {
                var isReplyComment = (this.model.get("id") == this.model.get("thread")) ? false : true,
                    self = this;
                
                this.$el.html(CommentItemTmpl({
                    data : $.extend({}, this.model.toJSON(), 
                            {
                                createdAtBasicDate : GO.util.basicDate3(this.model.get("createdAt")),
                                isReplyComment : isReplyComment,
                                showMessage : GO.util.convertRichText(this.model.get("message")),
                                editMessage : this.model.get("message")
                            }
                    ),
                    lang : lang
                }));
                
                if(isReplyComment){
                    this.$el.addClass("depth2");
                }else{
                    this.$el.addClass("depth1");
                }
                
                this.$el.attr("comment-id", this.model.get("id"));
                this.$el.attr("comment-thread-id", this.model.get("thread"));
                
                return this;
            },
            
            modify : function(){
                this.$el.find("#info_mode").hide();
                this.$el.find("#edit_mode").show();
            },
            
            remove : function(){
                var self = this;
                
                if(this.$el.hasClass("depth1") && this.$el.next().hasClass("depth2")){
                    alert(lang.removeRemoveDesc);
                    return;
                }
                
                this.model.destroy({
                    success : function(){
                    	alert(lang.removeSuccess);
                    	self.$el.trigger("comment:remove");
                    	self.$el.remove();
                    }
                });
            },
            
            cancel : function(){
                this.$el.find("#info_mode").show();
                this.$el.find("#edit_mode").hide();
                this.$el.find("#edit_mode textarea.edit_content").val(this.model.get("message"));
            },
            
            save : function(){
                var content = this.$el.find("#edit_mode textarea").val(),
                    self = this;
                
                this.model.set({message : content});
                
                this.model.save(null, {
                    success : function(){
                        self.render();
                    }
                });
            }
        },{
            __instance__: null,
            create: function(type, typeId) {
                var instance = new CommentItemView({
                    "type" : type,
                    "typeId" : typeId,
                });
                
                instance.render();
                
                return instance;
            }            
        }); 
        
        return CommentItemView;
    });
}).call(this);