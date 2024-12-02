// 클래식형 게시판 글목록
(function() {
	define([
	    'jquery', 
	    'backbone', 
	    'app',	    
	    'board/models/post', 
	    'hgn!board/templates/mobile/m_post_info',
	    'i18n!board/nls/board',
        'i18n!nls/commons', 
	    'GO.util'
	], 
	function(
		$,
		Backbone,
		App,
		PostModel,
		PostInfoTpl,
		boardLang,
		commonLang
	) {
		var tplVar = {
				'read_count' : boardLang['조회'],
				'write_comment' : boardLang['댓글 작성'] 
			};
		
		var PostTitle = Backbone.View.extend({
			tagName : 'header',
			className : 'article_header',
			initialize: function(options) {
				this.options = options || {};
			},
			initPage : function(args) {
				this.boardId = args.boardId;
				this.postId = args.postId;
				this.options = {
					boardId : this.boardId,
					postId : this.postId,
					readOnly : true
				};
				//TODO - 포스트모델 갱신이 필요한가... 흠.. 
				this.postModel = new PostModel(this.options);
				this.postModel.setURL();
				this.postModel.fetch({async : false});
				this.dataset = this.postModel.toJSON();
			},
			render: function() {
				this.initPage(arguments[0]);
				
				var isStream = this.dataset.type == 'STREAM';
				
				this.$el.html(PostInfoTpl({
					lang : tplVar,
					dataset : this.dataset,
					titleParse : function() {
						return GO.util.br2nl(GO.util.escapeHtml(this.dataset.title));
					},
					summaryParse : function() {
						return GO.util.br2nl(GO.util.escapeHtml(this.dataset.summary));
					},
					isStream : isStream,
					dateformat : function() {
						var date = null;
						if(isStream) {
							date = GO.util.snsDate(this.dataset.createdAt);
						} else {
							date = GO.util.basicDate(this.dataset.createdAt);
						}
						return date;
					},
				}));
				return this;
			}
		}, {
			__instance__: null,
	        create: function() {
	            if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
	            return this.__instance__;
	        },
	        render: function() {
	            var instance = this.create(),
	                args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
	                
	            return this.prototype.render.apply(instance, args);
	        }            
		});
		
		return PostTitle;
	});
}).call(this);