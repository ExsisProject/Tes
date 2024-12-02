(function() {
	define(function(require) {

		var $ = require("jquery");
		var Backbone = require("backbone");
		var App = require("app");
		var HeaderToolbarView = require("views/mobile/header_toolbar");
		var Contact = require("contact/collections/contacts_pager");
		var TplContactHome = require("hgn!contact/templates/mobile/m_home");
		var commonLang = require("i18n!nls/commons");
		var contactLang = require("i18n!contact/nls/contact");
		require("GO.util");

		var instance = null;

		var lang = {
				'add_contact' : contactLang['연락처 추가'],
				'return_home' : commonLang['홈으로 이동'],
				'not_contact' : commonLang['검색결과없음']
	        };
		
		var Contacts = Backbone.View.extend({

			el : '#content',

			events : {
				'vclick a[data-id]' : 'getContact',
				'vclick a[data-btn="paging"]' : 'goPaging',
				'vclick .telMobile': 'telMobile',
				'vclick .smsMobile': 'smsMobile',
				'vclick .sendMail': 'sendMail'
			},

			initialize: function(options) {
				// 모바일 주소록은 keyword하나로만 통합검색
				this.$el.off();
				var searchParams = App.router.getSearch();

				this.collection = new Contact([], {
					keyword : searchParams.keyword,
					collectionType : 'search',
					searchType : 'or'
				});
				this.listenTo(this.collection, 'reset', this.renderContacts);
			},

			render: function() {
				this.titleRenderView();
				this.collection.fetch();
				return this.el;
			},

			titleRenderView : function() {

				var toolBarData = {
					title : commonLang['검색결과'],
					isClose : true,
					isWriteBtn : true,
					writeBtnCallback : function(){
						App.router.navigate('contact/create', {trigger: true, pushState: true});
					}
				};
				HeaderToolbarView.render(toolBarData);
			},

			goPaging : function(e) {
				GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
				e.stopPropagation();

				var direction = $(e.currentTarget).data('direction');

				if(direction === 'next') {
					this.collection.nextPage();
				} else {
					this.collection.prevPage();
				}
			},
			
			getContact : function(e) {
				var $currentTarget = $(e.currentTarget),
					dataId = $currentTarget.data("id"),
					model = this.collection.findById(dataId),
					urls = {
					"COMPANY" : makeCompanyUrl,
					"USER" : makeUserUrl,
					"DEPARTMENT" : makeDeptUrl
				};

				var url = urls[model.getOwnerType()](model);

				GO.router.navigate(url, {trigger: true, pushState: true});

				function makeCompanyUrl(model){
					var url = ['contact'];
					url.push("company");
					url.push(model.getCompanyGroupId());
					url.push("view");
					url.push(model.getId());
					return url.join("/");
				}

				function makeDeptUrl(model){
					var url = ['contact'];
					url.push("dept");
					url.push(model.getDeptId());
					url.push("view");
					url.push(model.getId());
					return url.join("/");
				}

				function makeUserUrl(model){
					var url = ['contact'];
					url.push("view");
					url.push(model.getId());
					return url.join("/");
				}
			},
			telMobile: function (e) {
				//e.preventDefault();
				e.stopPropagation();
				window.location.href = "tel:" + $(e.currentTarget).attr('data-mobile');
				return;
			},

			smsMobile: function (e) {
				//e.preventDefault();
				e.stopPropagation();
				if (GO.config('isMobileApp')) {
					window.location.href = "smsto:" + $(e.currentTarget).attr('data-mobile');
				} else {
					window.location.href = "sms://" + $(e.currentTarget).attr('data-mobile');
				}
				return;
			},

			sendMail: function (e) {
				//e.preventDefault();
				if (!App.isAvailableApp('mail')) return;
				var self = this;
				e.stopPropagation();
				if (confirm(contactLang["메일을 보내시겠습니까?"])) {
					var data_id = $(e.currentTarget).parent().siblings().attr('data-id');
					var name = "";
					var positionName = "";
					var departmentName = "";
					var mailformat = "";
					var sendUrlParam = "";
					self.collection.toJSON().forEach(function(item){
						if(item.id == data_id){
							if(!_.isEmpty(item.name)){
								name = item.name;
							}
							if(!_.isEmpty(item.positionName)){
								positionName = '/' + item.positionName;
							}
							if(!_.isEmpty(item.departmentName)){
								departmentName = '/' + item.departmentName;
							}
							mailformat = name + positionName + departmentName;
							if(mailformat.length > 0){
								mailformat = '"' + mailformat + '"';
							}
						}
					});
					sendUrlParam = encodeURI(mailformat + '<' +$(e.currentTarget).attr('data-email') + '>');
					window.location.href = "/app/mail?work=write&toAddr=" + sendUrlParam;
				}
				return;
			},
			

			renderContacts : function() {
				this.$el.html(TplContactHome({
					lang : lang,
					data : this.collection.toJSON(),
					isAvailableMail : function() {
						if(App.isAvailableApp('mail')) return true;
						else return false;
					}
				}));

				//모바일 페이징 추가
				var pagingTpl = GO.util.mPaging(this.collection);
				this.$el.find('.paging').remove();
				this.$el.append(pagingTpl);
			}
	        
		});

		return {
			render : function(options) {
				instance = new Contacts(options);
				return instance.render();

			}
		};
	});

}).call(this);