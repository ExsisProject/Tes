// 모바일 - 댓글 목록
;(function() {
    define([
        'jquery', 
        'backbone', 
        'app',      
        'board/models/board_config',
        'views/mobile/header_toolbar',
        'board/views/mobile/m_post_info',
        'hgn!board/templates/mobile/m_post_comments',
        'i18n!board/nls/board',
        'i18n!nls/commons', 
        "m_comment",
        'GO.util',
        "jquery.go-validation"
    ], 
    function(
        $,
        Backbone,
        GO,
        BoardModel,
        HeaderToolbarView,
        PostInfoView,
        tplPostComments,
        boardLang,
        commonLang,
        CommentView
    ) {
        var tplVar = {
            'reply' : boardLang['댓글'],
            'save' : commonLang['저장'],
            'cancel' : commonLang['취소'],
            'modify' : commonLang['수정'],
            'delete' : commonLang['삭제'],
            'comment_delete_msg' : boardLang['댓글을 삭제 하시겠습니까?'],
            'comment_has_reply' : boardLang['댓글이 등록된 글은 삭제할 수 없습니다.'],
            'alert_length' : boardLang['0자이상 0이하 입력해야합니다.'],
            'comment_save' : boardLang['댓글 작성'],
            'comment_modify' : boardLang['댓글 수정'],
            'comment_placeholder' : boardLang['댓글을 입력해주세요.']
        };
        
        var PostComments = Backbone.View.extend({
            events : {
                "a#btnPostComment" : "actionPostComment"
            },
            initialize: function() {
                this.options = this.options || {};
                this.boardId = this.options.boardId;
                this.postId = this.options.postId;
                this.boardModel = BoardModel.get(this.boardId);
                this.postInfoView = PostInfoView.render(this.options);
                this.postModel = this.postInfoView.postModel;
                
                GO.EventEmitter.off("change:comment");
                GO.EventEmitter.on("common", "change:comment", _.bind(function(count) {
                    this.$el.find("header span.num").text("( " +count + " )");
                }, this));
            },
            render: function() {
                var self = this;
                this.renderTitleToolbar();
                this.$el.html(tplPostComments());
                this.renderPostInfo();

                var commentView = CommentView.create({
                    el : "#comment_list",
                    type : "board/" + this.boardId + "/post",
                    typeId : this.postId,
                    isReply : this.postModel.isClassic(),
                    useCreateForm : this.boardModel.get("commentFlag"),
                    boardModel: this.boardModel
                });

            },
            renderTitleToolbar : function() {
                var self = this;
                this.boardType = this.boardModel.get('type');
                this.boardName = this.boardModel.get('name');

                HeaderToolbarView.render({
                    isClose : true
                });
            },
            renderPostInfo : function() {
                var postInfoViewEl = this.postInfoView.$el;
                
                this.$el.find('.'+postInfoViewEl.className).remove();
                this.$el.find('.classic_detail').prepend(postInfoViewEl);
            },
            actionPostComment : function(e) {
                console.info("actionPostComment :: call!!");
            },
        },{
            create: function(options) {
                var opts = $.extend({},options, {el: $('#content')});
                return new PostComments(opts);
            },
            render: function(opts) {
                var instance = this.create(opts);
                    
                return instance.render();
            }            
        }); 
        
        return PostComments;
    });
}).call(this);