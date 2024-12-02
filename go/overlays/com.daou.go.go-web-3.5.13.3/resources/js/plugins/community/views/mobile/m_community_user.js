//모바일웹 커뮤니티 가입목록
;(function() {
	define([
        "jquery",
        "backbone", 	
        "app",
        "views/mobile/title_toolbar",
        "community/collections/community_list",
        "hgn!community/templates/mobile/m_community_user",
        "i18n!nls/commons",
        "i18n!community/nls/community",
        "jquery.go-grid"
    ], 
    function(
		$,
		Backbone,
		App,
		TitleToolbarView,
		communityCollection,
		communityUserTpl,
		commonLang,
		communityLang
    ) {
		
		var tplVar = {
				'joincommunity': communityLang['가입 커뮤니티'],
				'member_wait' : communityLang['가입대기'],
				'community': commonLang['커뮤니티'],            
				'all_post': communityLang['전체 글 0건'],
	            'join_community_null' : communityLang['가입된 커뮤니티가 없습니다.'],
	            'move_to_home' : commonLang['홈으로 이동']
	        };
		
		var Communities = Backbone.View.extend({
			events:{
				'vclick .list_comm_joinlist li>a' : 'goCommunity',
				'vclick a[data-btn=paging]' : 'goPaging'
			},
			
			initialize: function() {			
				var self = this;
				GO.util.appLoading(true);
				this.baseTpl = [ '<div class="content"><ul class="list_normal list_single  list_comm_joinlist"></ul></div>'];
				this.$listEl = null;
				this.offset = GO.config('mobileListOffset') || 20;
				this.titleToolbarView = TitleToolbarView;
				
				this.collectionClone = null;
				this.collection = new communityCollection();
				this.collection.type = 'joined';
				this.collection.on('reset', function(collection, response) {
					self.renderJoindList(); 
					
					//모바일 페이징 추가
					var pagingTpl = GO.util.mPaging(collection);
					self.$listEl.after(pagingTpl);
					
					GO.util.appLoading(false);
				});
			},
			render: function() {		
				GO.util.pageDone();
				this.titleToolbarView.render({ 
					isPrev : true,
					prevCallback :  function() {
						GO.EventEmitter.trigger('common', 'goHome');
						return false;
					},
					contentEl : this.$el,
					name : tplVar['joincommunity']
				});
				
				this.$el.html(this.baseTpl);
				this.$listEl = this.$el.find('ul');
				
				this.getJoindList(0);
				
				return this.el;
			},
			goPaging : function(e) {
				GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
				e.stopPropagation();
				
				var direction = $(e.currentTarget).attr('data-direction'),
					cPage = this.collection.page.page || 0;
				
				if(direction == 'prev' && cPage > 0) cPage--;
				else if(direction == 'next') cPage++;

				$(e.currentTarget).parents('.paging').remove();
				this.$listEl.empty();
				this.getJoindList(cPage);
				return false;
			},
			goCommunity : function(e) {
				var communityId = $(e.currentTarget).attr('data-id'),
					communityModel = this.collectionClone.get(communityId);
				
				if(!communityModel.get('publicFlag') && communityModel.get('memberStatus') == 'WAIT') {
					alert(communityLang['아직 가입되지 않았습니다.'] + '\n' + communityLang['커뮤니티 관리자의 승인이 필요합니다.']);
				} else {
					App.router.navigate('community/'+communityId,true);
				}
			},
			getJoindList : function(page) {
				var fData = { offset : this.offset, property : 'createdAt', direction : 'desc' };
				if(page === 'more') {
					if (this.collection.page.lastPage == true) return false;
					fData.page = parseInt(this.collection.page.page+1,10) || 0;
				} else {
					fData.page = page || 0;
				}
	        	this.collection.fetch({data : fData , reset:true});
	        },
			renderJoindList : function() {
				var page = this.collection.page,
					dataset = this.collection.toJSON(),
					tpl = communityUserTpl({
						lang : tplVar,
						isWait : function() {
							return this.memberStatus == 'WAIT';
						},
						hasNewPost : function() {
							return this.newPostCount > 0;
						},	
						communityPostCount : function() {
							return App.i18n(tplVar['all_post'], "count", this.postCount);
						},
						data : dataset
					});

				if(page.page == 0) {
					if(dataset.length > 0) {
						this.$listEl.html(tpl);
						this.collectionClone = this.collection.clone();
					} else {
						this.$listEl.html(tpl);
					}
				} else {
					this.$listEl.append(tpl);
					this.collectionClone.add(this.collection.toJSON());
				}
				
				if(page.lastPage) {
					this.$el.find('#pullUp').hide();
				} else {
					this.$el.find('#pullUp').show();
				}
			}
		}, {
			 __instance__: null,
	        create: function() {
	        	this.__instance__ = new this.prototype.constructor({el: $('#content')});// if(this.__instance__ === null) 
	            return this.__instance__;
	        },
	        render: function() {
	            var instance = this.create(),
	                args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];                    
	            return this.prototype.render.apply(instance, args);
	        }      
		});

		return Communities;
	});

}).call(this);